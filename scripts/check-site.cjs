// Dependency-free checks for published HTML, local links and publication feeds.
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const errors=[];
const pages=['index.html','404.html',...fs.readdirSync(path.join(root,'blog')).filter(n=>n.endsWith('.html')&&!n.startsWith('_')&&!n.includes('template')).map(n=>'blog/'+n)];
function resolveLocal(url,from){const parsed=new URL(url,new URL(from,'https://yogeshwaran.com/'));if(parsed.origin!=='https://yogeshwaran.com')return null;let p=decodeURIComponent(parsed.pathname);if(p.endsWith('/'))p+='index.html';let disk=path.resolve(root,'.'+p);if(!disk.startsWith(root+path.sep))throw Error('Path outside repository');if(!fs.existsSync(disk)&&!path.extname(disk))disk+='.html';return {disk,hash:decodeURIComponent(parsed.hash.slice(1))};}
for(const page of pages){const html=fs.readFileSync(path.join(root,page),'utf8');
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)errors.push(page+': expected one h1');
 if(!/<title>[^<]+<\/title>/.test(html))errors.push(page+': title missing');
 if(!/<main(?:\s|>)/.test(html))errors.push(page+': main missing');
 for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1]);}catch{errors.push(page+': invalid JSON-LD');}}
 for(const m of html.matchAll(/(?:href|src)="([^"\s]+)"/g)){
   if(/^(mailto:|tel:|data:|javascript:)/.test(m[1]))continue;
   let target;try{target=resolveLocal(m[1],page);}catch{errors.push(page+': malformed URL '+m[1]);continue;}if(!target)continue;
   if(!fs.existsSync(target.disk)){errors.push(page+': missing '+m[1]);continue;}
   if(target.hash&&target.disk.endsWith('.html')){const dest=fs.readFileSync(target.disk,'utf8');if(!dest.includes('id="'+target.hash+'"')&&!dest.includes("id='"+target.hash+"'"))errors.push(page+': missing anchor '+m[1]);}
 }
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');const mapped=new Set();
for(const m of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)){const target=resolveLocal(m[1],'index.html');if(target){mapped.add(target.disk);if(!fs.existsSync(target.disk))errors.push('sitemap: missing '+m[1]);}}
const feed=fs.readFileSync(path.join(root,'blog/feed.xml'),'utf8');const fed=new Set();const listing=fs.readFileSync(path.join(root,'blog/index.html'),'utf8');
for(const item of feed.matchAll(/<item>([\s\S]*?)<\/item>/g)){const link=item[1].match(/<link>(.*?)<\/link>/)?.[1];if(!link){errors.push('RSS item has no link');continue;}const target=resolveLocal(link,'index.html');if(!target||!fs.existsSync(target.disk))errors.push('RSS: missing '+link);else{if(fed.has(target.disk))errors.push('RSS duplicate: '+link);fed.add(target.disk);}}
for(const page of pages.filter(p=>/^blog\/\d{4}-\d{2}-/.test(p))){const disk=path.join(root,page);if(!mapped.has(disk))errors.push('Published post missing from sitemap: '+page);if(!fed.has(disk))errors.push('Published post missing from RSS: '+page);if(!listing.includes(path.basename(page,'.html')))errors.push('Published post missing from listing: '+page);}
console.log(JSON.stringify({pagesChecked:pages.length,errors},null,2));if(errors.length)process.exitCode=1;
