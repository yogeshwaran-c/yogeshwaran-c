// Read public blobs only. Never check out or execute a historical revision.
const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const ref=process.argv[2]||'HEAD';
if(!/^(?:HEAD|[a-f0-9]{40}|v\d{4}\.\d{2}\.\d{2}(?:-\d+)?)$/.test(ref))throw Error('Expected a commit SHA or dated release tag');
const run=args=>execFileSync('git',args,{cwd:root,maxBuffer:30*1024*1024});
const commit=run(['rev-parse','--verify',ref+'^{commit}']).toString().trim();
const outputName=process.argv[3]||'public';if(!/^[a-z0-9-]+$/.test(outputName))throw Error('Invalid output directory name');
const out=path.join(root,'dist',outputName);if(fs.existsSync(out))throw Error('Output already exists; use a fresh checkout/output for packaging');fs.mkdirSync(out,{recursive:true});
const records=run(['ls-tree','-r','-z',commit]).toString().split('\0').filter(Boolean);const manifest=[];
const published=new Set(records.map(r=>r.split('\t')[1]).filter(p=>/^blog\/\d{4}-\d{2}-[^/]+\.html$/.test(p)).map(p=>p.replace(/\.html$/,'')));
const rootFiles=new Set(['index.html','404.html','CNAME','.nojekyll','favicon.svg','og-image.png','robots.txt','sitemap.xml','llms.txt','portfolio-refresh.css']);
for(const record of records){const [meta,file]=record.split('\t');
 const allowed=rootFiles.has(file)||/^assets\/fonts\/[a-z]+(?:\.woff2|-OFL\.txt)$/.test(file)||/^resume\/YOGESHWARAN_C_Resume\.(html|md|pdf)$/.test(file)||/^blog\/(?:index\.html|feed\.xml|post\.css)$/.test(file)||/^blog\/og\/[\w-]+\.png$/.test(file)||published.has(file.replace(/\.(html|md)$/, ''))&&/\.(html|md)$/.test(file);
 if(!allowed)continue;if(!/^100(?:644|755) blob /.test(meta))throw Error('Non-regular public file: '+file);
 if(file.split('/').some(p=>p==='..'||p===''))throw Error('Invalid public path');
 const bytes=run(['show',commit+':'+file]);const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);manifest.push({file,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
if(!manifest.some(m=>m.file==='index.html'))throw Error('Missing homepage');
fs.writeFileSync(path.join(out,'deployment.json'),JSON.stringify({source:commit,release:ref,files:manifest},null,2)+'\n');
console.log('Packaged '+manifest.length+' public files from '+commit);
