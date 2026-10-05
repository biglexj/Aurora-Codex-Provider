import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {BatchQueue} from './batches.mjs';
import {outputSize,EXPRESSIONS} from './presets.mjs';
import {referenceGuide} from './reference-roles.mjs';
import {Readable} from 'node:stream';
import {IMAGE_PROMPT_MAX_CHARS,IMAGE_JOB_JSON_MAX_BYTES,validatePrompt} from './prompt-limits.mjs';
import {requestBody} from './request-body.mjs';
const ref=randomUUID();
const input=()=>({requestId:randomUUID(),references:[ref],expressions:EXPRESSIONS.slice(0,10).map(e=>e.id),count:10,ratio:'3:4',resolution:'1024',background:'original',prompt:''});
async function fixture(generate) {const directory=await mkdtemp(path.join(os.tmpdir(),'aurora-provider-queue-'));const queue=new BatchQueue({directory,generate,referenceLoader:async id=>({id,hasAlpha:false}),exporter:async(job,batch,item,index)=>({image:'/test/'+index,filename:String(index)+'.png',width:768,height:1024})});await queue.initialize();return queue;}
async function settled(queue,id) {for(let i=0;i<500;i++) {const state=queue.get(id)?.state;if(['completed','paused','failed','cancelled'].includes(state)) return queue.get(id);await new Promise(r=>setTimeout(r,5));}throw new Error('La prueba no terminó.');}

test('20 000 Unicode characters survive request parsing, queue persistence and native instructions',async()=>{
  for(const character of ['a','🎨','\u0000']) {
    const prompt='a'+character.repeat(IMAGE_PROMPT_MAX_CHARS-1);
    const encoded=Buffer.from(JSON.stringify({prompt}));
    const parsed=JSON.parse((await requestBody(Readable.from([encoded.subarray(0,13),encoded.subarray(13)]),IMAGE_JOB_JSON_MAX_BYTES)).toString('utf8'));
    let generated;
    const queue=await fixture(async job=>{generated=job;job.state='completed';});
    const batch=await queue.create({...input(),kind:'image',count:1,prompt:parsed.prompt});
    const done=await settled(queue,batch.id);
    assert.equal(done.prompt,prompt);
    assert.ok(generated.prompt.includes(JSON.stringify(prompt)));
    validatePrompt(prompt); // Legacy enqueue uses this same validation.
  }
});

test('20 001 characters and oversized JSON fail before generation',async()=>{
  let calls=0;const queue=await fixture(async()=>calls++);
  for(const character of ['a','🎨']) {
    const prompt=character.repeat(IMAGE_PROMPT_MAX_CHARS+1);
    assert.throws(()=>validatePrompt(prompt),/20 000/);
    await assert.rejects(queue.create({...input(),kind:'image',count:1,prompt}),/20 000/);
  }
  await assert.rejects(queue.create({...input(),kind:'image',count:1,prompt:'  '}),/Escribe una idea/);
  await assert.rejects(requestBody(Readable.from([Buffer.alloc(IMAGE_JOB_JSON_MAX_BYTES+1)]),IMAGE_JOB_JSON_MAX_BYTES),error=>error.status===413);
  assert.equal(calls,0);
});
test('ten variations run serially and keep original references; duplicate key does not resubmit',async()=>{
  let active=0,max=0,count=0;const paths=[];
  const queue=await fixture(async job=>{active++;max=Math.max(max,active);count++;paths.push(job.referencePaths);await new Promise(r=>setTimeout(r,2));job.state='completed';active--;});
  const request=input(),batch=await queue.create(request),duplicate=await queue.create(request);
  assert.equal(batch.id,duplicate.id);const done=await settled(queue,batch.id);assert.equal(done.completed,10);assert.equal(count,10);assert.equal(max,1);assert.ok(paths.every(p=>p.length===1 && p[0]===paths[0][0]));
});
test('pause finishes current image; resume preserves completed images',async()=>{
  let release,called=0;const queue=await fixture(async job=>{called++;if(called===1) await new Promise(r=>release=r);job.state='completed';});
  const batch=await queue.create(input());while(!release) await new Promise(r=>setTimeout(r,2));await queue.action(batch.id,'pause');release();let paused=await settled(queue,batch.id);assert.equal(paused.state,'paused');assert.equal(paused.completed,1);await queue.action(batch.id,'resume');assert.equal((await settled(queue,batch.id)).completed,10);assert.equal(called,10);
});
test('failure stops queue, explicit resume retries only failed and remaining steps',async()=>{
  let calls=0;const queue=await fixture(async job=>{calls++;job.state=calls===2?'failed':'completed';job.error='Prueba de error';});const batch=await queue.create(input());assert.equal((await settled(queue,batch.id)).completed,1);assert.equal(calls,2);await queue.action(batch.id,'resume');assert.equal((await settled(queue,batch.id)).completed,10);assert.equal(calls,11);
});
test('cancel finishes current image and never starts next',async()=>{
  let release,calls=0;const queue=await fixture(async job=>{calls++;await new Promise(r=>release=r);job.state='completed';});const batch=await queue.create(input());while(!release) await new Promise(r=>setTimeout(r,2));await queue.action(batch.id,'cancel');release();assert.equal((await settled(queue,batch.id)).state,'cancelled');assert.equal(calls,1);
});
test('restart does not auto-generate interrupted job; idempotency survives restart',async()=>{
  let calls=0;const queue=await fixture(async()=>{calls++;}),request=input(),saved={...request,id:randomUUID(),state:'running',createdAt:new Date().toISOString(),completed:0,items:[{state:'running'}]};await writeFile(path.join(queue.directory,saved.id+'.json'),JSON.stringify(saved));await queue.initialize();assert.equal(queue.get(saved.id).state,'paused');assert.equal(queue.get(saved.id).items[0].state,'interrupted');assert.equal((await queue.create(request)).id,saved.id);assert.equal(calls,0);
});
test('invalid reference count and presets are rejected before any generation',async()=>{
  let calls=0;const queue=await fixture(async()=>calls++);await assert.rejects(queue.create({...input(),references:Array.from({length:6},()=>randomUUID())}));await assert.rejects(queue.create({...input(),expressions:['unknown']}));assert.equal(calls,0);
});
test('all five export ratios are exact',()=>{for(const ratio of ['1:1','16:9','9:16','3:4','4:3']) {const [w,h]=ratio.split(':').map(Number),size=outputSize(ratio,'2048');assert.equal(size.width*h,size.height*w);}});
test('image references keep their roles through queue and native generation',async()=>{
  let generated;const queue=await fixture(async job=>{generated=job;job.state='completed';});
  const request={...input(),kind:'image',references:[randomUUID(),randomUUID(),randomUUID()],reference_roles:['base','pose','style'],count:1,prompt:'Cambiar ropa y seguir la pose del boceto.'};
  const batch=await queue.create(request);await settled(queue,batch.id);
  assert.deepEqual(generated.referenceRoles,['base','pose','style']);
  assert.match(generated.prompt,/Imagen 2: solo postura/);assert.match(generated.prompt,/no rostro, ropa ni aspecto del maniquí/);
  assert.doesNotMatch(referenceGuide(generated.referenceRoles),/las demás aclaran su identidad/);
});
test('no-base references are guides and invalid roles never start generation',async()=>{
  let calls=0;const queue=await fixture(async job=>{calls++;job.state='completed';});
  const request={...input(),kind:'image',count:1,prompt:'Una ilustración',reference_roles:['pose']};
  assert.match(referenceGuide(['pose']),/Ninguna imagen es base/);
  for(const reference_roles of [['unknown'],[],['pose','base']]) await assert.rejects(queue.create({...request,requestId:randomUUID(),reference_roles}));
  assert.equal(calls,0);
  const batch=await queue.create(request);assert.equal((await settled(queue,batch.id)).completed,1);
});
test('cinema ratios are exported exactly in both orientations',()=>{
  for(const ratio of ['21:9','9:21']) for(const resolution of ['1024','2048']) {
    const [w,h]=ratio.split(':').map(Number),size=outputSize(ratio,resolution);
    assert.equal(size.width*h,size.height*w);assert.ok(size.width>0 && size.height>0);assert.ok(Math.max(size.width,size.height)<=Number(resolution));
  }
});
