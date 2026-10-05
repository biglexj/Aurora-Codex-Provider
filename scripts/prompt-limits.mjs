// Aurora's request limit. Codex model context and account quotas are separate.
export const IMAGE_PROMPT_MAX_CHARS=20_000;
export const IMAGE_JOB_JSON_MAX_BYTES=128*1024;
export function validatePrompt(prompt,{required=true}={}) {
  if(typeof prompt!=='string' || (required && !prompt.trim())) throw new Error('Escribe una idea o elige un cambio.');
  if(Array.from(prompt).length>IMAGE_PROMPT_MAX_CHARS) throw new Error('El prompt supera el límite de 20 000 caracteres de Aurora.');
}
