const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const {spawnSync,execFileSync}=require('node:child_process');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-guards-'));const checker=path.resolve(__dirname,'check-security.cjs');
try{
 execFileSync('git',['init','--quiet',temporary]);
 fs.writeFileSync(path.join(temporary,'safe.txt'),'Public portfolio fixture.\n');execFileSync('git',['-C',temporary,'add','.']);
 assert.equal(spawnSync(process.execPath,[checker],{cwd:temporary}).status,0);
 fs.mkdirSync(path.join(temporary,'.github'));fs.writeFileSync(path.join(temporary,'.github/setup.js'),'// Harmless guard test; never executed.\n');execFileSync('git',['-C',temporary,'add','.']);
 assert.equal(spawnSync(process.execPath,[checker],{cwd:temporary}).status,1,'Known unsafe path must fail');
 execFileSync('git',['-C',temporary,'rm','--cached','.github/setup.js']);fs.unlinkSync(path.join(temporary,'.github/setup.js'));
 fs.mkdirSync(path.join(temporary,'.github/workflows'));fs.writeFileSync(path.join(temporary,'.github/workflows/bad.yml'),'steps:\n  - uses: actions/checkout@main\n');execFileSync('git',['-C',temporary,'add','.']);
 assert.equal(spawnSync(process.execPath,[checker],{cwd:temporary}).status,1,'Unpinned action must fail');
 console.log('Positive and negative security fixtures passed.');
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
