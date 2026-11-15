function evaluateRuns(runs){
 if(!Array.isArray(runs)||!runs.length)throw Error('No Lighthouse measurements');
 const valid=runs.every(r=>['performance','accessibility','best-practices','seo'].every(k=>Number.isFinite(r[k])&&r[k]>=0&&r[k]<=100));
 const sorted=runs.map(r=>r.performance).sort((a,b)=>a-b);
 const performance=sorted[Math.floor(sorted.length/2)];
 return {performance,passed:valid&&performance>=90&&runs.every(r=>r.accessibility===100&&r['best-practices']===100&&r.seo===100)};
}
module.exports={evaluateRuns};
