import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const publicRoot=path.join(root,'dist/public');const reports=path.join(root,'dist/reports');fs.mkdirSync(reports,{recursive:true});
const server=http.createServer((req,res)=>{let file;try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(publicRoot,'.'+pathname);if(!file.startsWith(publicRoot+path.sep)&&file!==publicRoot){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)&&!path.extname(file))file+='.html';const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const post=fs.readdirSync(path.join(publicRoot,'blog')).filter(n=>/^\d{4}-\d{2}.*\.html$/.test(n)).sort().at(-1);const results=[];
try{for(const [label,url] of [['home','/'],...(post?[['post','/blog/'+post]]:[])]){for(const desktop of [false,true]){
 const runs=[];for(let i=0;i<(desktop?1:3);i++){
  const dest=path.join(reports,`${label}-${desktop?'desktop':'mobile'}-${i+1}`);
  const args=[path.join(root,'node_modules/lighthouse/cli/index.js'),origin+url,'--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage','--only-categories=performance,accessibility,best-practices,seo','--output=json','--output=html','--output-path='+dest,'--quiet',...(desktop?['--preset=desktop']:[])];
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Lighthouse failed: '+code)));});
  const report=JSON.parse(fs.readFileSync(dest+'.report.json'));if(report.runtimeError)throw Error(report.runtimeError.message);const scores=Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,Math.round((v.score??0)*100)]));runs.push(scores);console.log(label,desktop?'desktop':'mobile',scores,report.runWarnings);
 }
 const sorted=runs.map(r=>r.performance).sort((a,b)=>a-b);const performance=sorted[Math.floor(sorted.length/2)];const passed=performance>=90&&runs.every(r=>r.accessibility===100&&r['best-practices']===100&&r.seo===100);results.push({page:label,mode:desktop?'desktop':'mobile',performance,runs,passed});
 }}fs.writeFileSync(path.join(reports,'summary.json'),JSON.stringify(results,null,2));if(results.some(r=>!r.passed))process.exitCode=1;
}finally{server.close();}
