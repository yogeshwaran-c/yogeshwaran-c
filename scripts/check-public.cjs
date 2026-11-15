const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const outputName=process.argv[2]||'public';if(!/^[a-z0-9-]+$/.test(outputName))throw Error('Invalid output name');
const root=path.resolve(__dirname,'../dist',outputName);const manifest=JSON.parse(fs.readFileSync(path.join(root,'deployment.json')));
if(!/^[a-f0-9]{40}$/.test(manifest.source)||!Array.isArray(manifest.files))throw Error('Invalid deployment manifest');
const available=new Set(manifest.files.map(m=>m.file));
for(const required of ['index.html','404.html','CNAME','robots.txt','sitemap.xml','blog/index.html','resume/YOGESHWARAN_C_Resume.pdf'])if(!available.has(required))throw Error('Missing '+required);
for(const item of manifest.files){
 const target=path.resolve(root,item.file);if(!target.startsWith(root+path.sep)||item.file.split('/').some(p=>p==='..'||p==='.github'||p==='.claude'))throw Error('Unsafe public path');
 const bytes=fs.readFileSync(target);if(crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Digest mismatch: '+item.file);
 if(!item.file.endsWith('.html'))continue;const html=bytes.toString();if(!/<title>[^<]+<\/title>/.test(html))throw Error('Missing page title: '+item.file);
 for(const match of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
  if(/^(?:mailto:|tel:|data:|javascript:)/.test(match[1]))continue;
  const url=new URL(match[1],new URL(item.file,'https://yogeshwaran.com/'));if(url.origin!=='https://yogeshwaran.com')continue;
  let name=decodeURIComponent(url.pathname.slice(1));if(name.endsWith('/')||!name)name+='index.html';
  if(!available.has(name)&&!available.has(name+'.html'))throw Error('Missing public link: '+item.file+' -> '+name);
 }
}
console.log('Verified '+manifest.files.length+' public files, content digests and local page links from '+manifest.source);
