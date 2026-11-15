import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
export async function serveSite(publicRoot){
 const root=path.resolve(publicRoot);
 const server=http.createServer((req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   let file=path.resolve(root,'.'+pathname);
   if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
   if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   if(!fs.existsSync(file)&&!path.extname(file))file+='.html';
   const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.xml':'application/xml','.pdf':'application/pdf'};
   res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {server,origin:'http://127.0.0.1:'+server.address().port};
}
