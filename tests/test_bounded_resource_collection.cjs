const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {EventEmitter}=require('node:events');
const {recorder,load}=require('../executors/acquired-resources.cjs');
(async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-capture-')),context=new EventEmitter();
 try{
  const capture=recorder(context,dir);
  const response=(url,body)=>({request:()=>({method:()=> 'GET',resourceType:()=> 'script',frame:()=>({url:()=> 'https://example.org/game'})}),ok:()=>true,headers:()=>({'content-type':'text/javascript'}),url:()=>url,body});
  context.emit('response',response('https://example.org/ready.js',async()=>Buffer.from('const ready=true;')));
  context.emit('response',response('https://example.org/stalled.js',()=>new Promise(()=>{})));
  const started=Date.now(),result=await capture.finish(80);
  assert.equal(result.timed_out,true);assert.ok(Date.now()-started<2000);
  const report=JSON.parse(fs.readFileSync(path.join(dir,'resource-snapshot.json')));
  assert.equal(report.files.length,1);assert.equal(context.listenerCount('response'),0);
  assert.equal(load(dir,'https://example.org/game').size,1);
  console.log('bounded capture preserves completed bytes and records unfinished responses');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
