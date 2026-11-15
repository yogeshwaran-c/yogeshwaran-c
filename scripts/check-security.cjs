// A narrow repository guard, supplemented by GitHub's native secret protection.
const fs=require('node:fs');const {execFileSync}=require('node:child_process');
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);const errors=[];
const forbidden=['.github/setup.js','.credentials.json'];
for(const file of files){
 if(forbidden.some(p=>file===p||file.endsWith('/'+p)))errors.push('Unsafe file: '+file);
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()||/\.(pdf|png|woff2|ico)$/.test(file))continue;
 const text=fs.readFileSync(file,'utf8');
 if(/-----BEGIN (?:OPENSSH |RSA |EC )?PRIVATE KEY-----/.test(text)||/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16})\b/.test(text))errors.push('Possible credential: '+file);
 if(/\.(json|ya?ml|mdc)$/.test(file)&&/node\s+\.github\/setup\.js/.test(text))errors.push('Unsafe startup command: '+file);
 if(file.startsWith('.github/workflows/')&&/\.ya?ml$/.test(file)){
   if(/pull_request_target\s*:/.test(text))errors.push('Privileged PR trigger: '+file);
   for(const m of text.matchAll(/uses:\s*([^\s#]+)/g))if(!m[1].startsWith('./')&&!/^[\w.-]+\/[\w.-]+@[a-f0-9]{40}$/.test(m[1]))errors.push('Unpinned action: '+m[1]);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log('Tracked-file security guards passed (not a complete secret/malware scan).');
