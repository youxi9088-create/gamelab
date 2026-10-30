const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{EventEmitter}=require('node:events');
const {recorder,load}=require('../executors/acquired-resources.cjs');
test('discovery snapshot reuses exact frame and URL only and rejects corrupt bytes',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'acquired-')),context=new EventEmitter();
 try{
  const capture=recorder(context,dir);
  context.emit('response',{ok:()=>true,headers:()=>({'content-type':'image/png'}),url:()=> 'https://cdn.example/a.png?v=2',body:async()=>Buffer.from('image bytes'),request:()=>({method:()=> 'GET',resourceType:()=> 'image',frame:()=>({url:()=> 'https://game.example/play'})})});
  await capture.finish();const valid=load(dir,'https://game.example/play');
  assert.equal(valid.size,1);assert.equal(valid.has('https://cdn.example/a.png?v=3'),false);
  assert.equal(load(dir,'https://other.example/').size,0);
  const row=JSON.parse(fs.readFileSync(path.join(dir,'resource-snapshot.json'))).files[0];fs.writeFileSync(path.join(dir,row.path),'corrupted');
  assert.equal(load(dir,'https://game.example/play').size,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
