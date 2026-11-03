const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {recoveredResource,key}=require('../executors/recovered-resource-cache.cjs');
test('public recovery bytes are bound to exact entry and URL and checked for tampering',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gamelab-recovery-'));
 try{
  const entry='https://example.com/game/index.html',url='https://example.com/game/font.woff2',id=key(entry,url),data=Buffer.from('wOF2fixture');
  const row={entry,url,path:id+'.bin',bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),contentType:'font/woff2'};
  fs.writeFileSync(path.join(root,id+'.bin'),data);fs.writeFileSync(path.join(root,id+'.json'),JSON.stringify(row));
  assert.deepEqual(await recoveredResource(entry,url,root).body(),data);
  assert.equal(recoveredResource(entry+'?other',url,root),null);
  fs.writeFileSync(path.join(root,id+'.bin'),'tampered');assert.throws(()=>recoveredResource(entry,url,root),/digest/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
