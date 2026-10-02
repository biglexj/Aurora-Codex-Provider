import {existsSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';

// Explorer does not inherit the extra PATH entries of a Codex terminal.
export function resolveCodexBinary(env=process.env,platform=process.platform) {
  if (env.CODEX_BINARY) return env.CODEX_BINARY;
  if (platform!=='win32') return 'codex';
  for (const directory of (env.PATH || env.Path || '').split(path.delimiter)) {
    const candidate=path.join(directory.replace(/^"|"$/g,''),'codex.exe');
    if (existsSync(candidate)) return candidate;
  }
  if (env.LOCALAPPDATA) {
    const root=path.join(env.LOCALAPPDATA,'OpenAI','Codex','bin');
    try {
      const candidates=readdirSync(root,{withFileTypes:true}).filter(entry=>entry.isDirectory())
        .map(entry=>path.join(root,entry.name,'codex.exe')).filter(existsSync)
        .sort((a,b)=>statSync(b).mtimeMs-statSync(a).mtimeMs);
      if (candidates.length) return candidates[0];
    } catch { }
  }
  return 'codex';
}
