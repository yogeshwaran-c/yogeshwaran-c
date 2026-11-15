const fs=require('node:fs');const {execFileSync}=require('node:child_process');
function needsRendering(files){return files.some(f=>!/^docs\/|^(?:README|CLAUDE|AGENTS)\.md$/.test(f));}
module.exports={needsRendering};
if(require.main===module){
const event=process.env.GITHUB_EVENT_PATH?JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH)):{};
const base=event.pull_request?.base?.sha||event.before;
let render=true;let files=[];
if(process.env.FORCE_RENDER!=='true'&&process.env.GITHUB_EVENT_NAME==='schedule')render=false;
else if(process.env.FORCE_RENDER!=='true'&&/^[a-f0-9]{40}$/.test(base||'')&&!/^0+$/.test(base)){
 try{files=execFileSync('git',['diff','--name-only',base,'HEAD'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);render=needsRendering(files);}catch{render=true;}
}
const output=`render=${render}\n`;if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,output);
console.log(JSON.stringify({render,files,reason:render?'Rendered or pipeline change, unknown scope, or explicit pre-deployment audit':'Internal documentation only or scheduled maintenance'}));
}
