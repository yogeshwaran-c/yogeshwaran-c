import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import {serveSite} from './serve-site.mjs';import budgets from './budgets.cjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const publicRoot=path.join(root,'dist/public');const reports=path.join(root,'dist/reports');fs.mkdirSync(reports,{recursive:true});
const {server,origin}=await serveSite(publicRoot);
const post=fs.readdirSync(path.join(publicRoot,'blog')).filter(n=>/^\d{4}-\d{2}.*\.html$/.test(n)).sort().at(-1);const results=[];
try{for(const [label,url] of [['home','/'],...(post?[['post','/blog/'+post]]:[])]){for(const desktop of [false,true]){
 const runs=[];for(let i=0;i<(desktop?1:3);i++){
  const dest=path.join(reports,`${label}-${desktop?'desktop':'mobile'}-${i+1}`);
  const args=[path.join(root,'node_modules/lighthouse/cli/index.js'),origin+url,'--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage','--only-categories=performance,accessibility,best-practices,seo','--output=json','--output=html','--output-path='+dest,'--quiet',...(desktop?['--preset=desktop']:[])];
  await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Lighthouse failed: '+code)));});
  const report=JSON.parse(fs.readFileSync(dest+'.report.json'));if(report.runtimeError)throw Error(report.runtimeError.message);const scores=Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,Math.round((v.score??0)*100)]));runs.push(scores);console.log(label,desktop?'desktop':'mobile',scores,report.runWarnings);
 }
 const {performance,passed}=budgets.evaluateRuns(runs);results.push({page:label,mode:desktop?'desktop':'mobile',performance,runs,passed});
 }}fs.writeFileSync(path.join(reports,'summary.json'),JSON.stringify(results,null,2));if(results.some(r=>!r.passed))process.exitCode=1;
}finally{server.close();}
