const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const hgd=require('../executors/html-game-downloader.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'hgd-workflow-'));
(async()=>{
 try{
  const base='https://example.com/game/';
  assert.equal(hgd.plan(root,{},[]).status,'skipped');
  const result=hgd.extract([{url:base+'index.html',text:'var buildUrl="Build"; var dataUrl=buildUrl+"/level.data?v=2"; var wasm=buildUrl+"/game.wasm";'}]);
  assert.equal(result.status,'completed',JSON.stringify(result));
  assert.ok(result.references.some(x=>x.url===base+'Build/game.wasm'));
  assert.equal(hgd.selectReferences({references:[{url:'https://other.test/game/a.js'},{url:base+'%2e%2e/private.js'}]},base,['/a.js']).length,0);
  assert.equal(hgd.selectReferences(result,base,['/nothing.png']).length,0);
  fs.mkdirSync(path.join(root,'converted/evidence'),{recursive:true});
  fs.writeFileSync(path.join(root,'converted/index.html'),'<script src="./level.js?v=2"></script>');
  const acq={url:base+'index.html',files:[],bytes:0};
  fs.writeFileSync(path.join(root,'web-acquisition.json'),JSON.stringify(acq));
  fs.writeFileSync(path.join(root,'converted/evidence/runtime.json'),JSON.stringify({missing:['/level.js'],failure:'fixture'}));
  const calls=[];
  const {request}=require('../executors/node_modules/playwright');
  const original=request.newContext;
  request.newContext=async()=>({get:async url=>{calls.push(url);return {ok:()=>true,status:()=>200,headers:()=>({}),body:async()=>Buffer.from('fixture bytes'),dispose:async()=>{}}},dispose:async()=>{}});
  try{
   const {repairResources}=require('../executors/discovered-web.cjs');
   const added=await repairResources(root);
   assert.deepEqual(calls,[base+'level.js?v=2']);
   assert.equal(added.length,1);
   assert.equal(fs.readFileSync(path.join(root,'web-original/level.js'),'utf8'),'fixture bytes');
   const saved=JSON.parse(fs.readFileSync(path.join(root,'web-acquisition.json')));
   assert.equal(saved.resource_tools.html_game_downloader.status,'completed');
   assert.equal(saved.files[0].sha256.length,64);
   await repairResources(root);
   assert.equal(calls.length,1,'existing files must not be downloaded again');
  }finally{request.newContext=original;}
  console.log('HGD upstream parser, selective routing, real repair integration, evidence and reuse passed');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
