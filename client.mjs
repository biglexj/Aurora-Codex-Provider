export class LocalImageProvider {
  constructor(baseUrl='http://127.0.0.1:54799') {this.baseUrl=baseUrl.replace(/\/$/,'');}
  async request(route,options={}) {
    const response=await fetch(this.baseUrl+route,options),result=await response.json();
    if(!response.ok) throw new Error(result.error || 'El proveedor local rechazó la solicitud.');
    if(result.outputs) for(const output of result.outputs) output.url=new URL(output.url,this.baseUrl).href;
    return result;
  }
  status() {return this.request('/v1/status');}
  async upload(file) {return (await this.request('/v1/references',{method:'POST',headers:{'Content-Type':file.type || 'image/png','X-File-Name':encodeURIComponent(file.name || 'referencia.png')},body:file})).reference;}
  create({prompt,references=[],aspectRatio='1:1',resolution='1024',background='original',requestId=crypto.randomUUID()}) {
    return this.request(references.length?'/v1/images/edits':'/v1/images/generations',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:JSON.stringify({prompt,references:references.map(r=>typeof r==='string'?r:r.id),aspect_ratio:aspectRatio,resolution,background})});
  }
  createBatch({references,expressions,count=10,prompt='',aspectRatio='1:1',resolution='1024',background='original',name='Expresiones',requestId=crypto.randomUUID()}) {
    return this.request('/v1/batches',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body:JSON.stringify({references:references.map(r=>typeof r==='string'?r:r.id),expressions,count,prompt,aspect_ratio:aspectRatio,resolution,background,name})});
  }
  get(id,{signal}={}) {return this.request('/v1/jobs/'+encodeURIComponent(id),{signal});}
  control(id,action) {if(!['pause','resume','cancel'].includes(action)) throw new Error('Acción no válida.');return this.request('/v1/jobs/'+encodeURIComponent(id)+'/'+action,{method:'POST'});}
  downloadUrl(id) {return this.baseUrl+'/v1/jobs/'+encodeURIComponent(id)+'/download';}
  async wait(id,{signal,onProgress}={}) {
    while(true) {
      signal?.throwIfAborted();const job=await this.get(id,{signal});onProgress?.(job);
      if(job.status==='completed') return job;
      if(['failed','paused','cancelled'].includes(job.status)) {const error=new Error(job.error || 'Trabajo '+job.status);error.job=job;throw error;}
      await new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);reject(signal.reason || new Error('Espera cancelada.'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},1500);signal?.addEventListener('abort',abort,{once:true});});
    }
  }
  async generate(options,progress={}) {const job=await this.create(options);return this.wait(job.id,progress);}
}
