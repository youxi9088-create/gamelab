const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {resourcePath,safeURL,detect,ruffleEntry,adaptClient,verify,repairResources,screenshot}=require('../executors/discovered-web.cjs');
const {request}=require('../executors/node_modules/playwright');
const {followResourceRedirects}=require('../executors/discovered-web.cjs');
const {verifyInteraction}=require('../executors/dom-entry.cjs');

test('portrait review changes the real viewport and accepts inputs in its lower region',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-portrait-input-'));
 try{
  fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'converted/index.html'),'<meta charset="utf-8"><p id="status">Ready</p><button style="position:fixed;left:20px;bottom:20px;width:200px;height:80px" onclick="statusNode.textContent=\'Action verified\'">Continue</button><script>const statusNode=document.querySelector("#status");</script>');
  fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'browser-dom'}));
  const result=await verify(run,[{type:'viewport',width:390,height:844},{type:'click',x:80,y:800}]);
  assert.equal(result.passed,true);assert.deepEqual(result.steps.at(-1).viewport,{width:390,height:844});assert.match(result.steps.at(-1).text,/Action verified/);
  await assert.rejects(()=>verify(run,[{type:'viewport',width:12345,height:1}]),/Unsupported input/);
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});

test('DOM entry requires an actual visible interaction and offline DOM gameplay remains observable',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-dom-fixture-'));
 const {chromium}=require('../executors/node_modules/playwright');
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 const html=`<meta charset="utf-8"><style>body{background:#182538;color:white;font:24px sans-serif;padding:20px}button{font:24px sans-serif;padding:20px}</style><h1>Authored card game fixture</h1><p id="status">Choose a route</p><button id="go">Begin the Tale</button><script>document.getElementById('go').onclick=()=>{document.getElementById('status').textContent='Battle · Energy 3 · Enemy HP 12';document.getElementById('go').textContent='Strike';}</script>`;
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});await page.setContent(html);
  const result=await verifyInteraction(page,'Begin the Tale',run);
  assert.equal(result.passed,true);assert.match(result.after.text,/Enemy HP 12/);assert.equal(await page.locator('canvas').count(),0);
  await assert.rejects(()=>verifyInteraction(page,'Strike',run,{waitMs:0}),/did not produce/);
  await page.setContent('<form><button>Begin the Tale</button></form>');
  await assert.rejects(()=>verifyInteraction(page,'Begin the Tale',run),/outside game/);
  fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'converted/index.html'),html);
  fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'browser-dom'}));
  const offline=await verify(run,[{type:'click',x:130,y:190,expect_labels:['Battle']}]);
  assert.equal(offline.passed,true);assert.equal(offline.steps[1].canvasCount,0);assert.equal(offline.steps[1].loaded,true);
  if(process.env.DOM_QA_IMAGE)fs.copyFileSync(path.join(run,'converted/screenshots/step-0.png'),process.env.DOM_QA_IMAGE);
 }finally{await browser.close();fs.rmSync(run,{recursive:true,force:true});}
});

test('DOM entry waits for delayed controls and preserves loading or canvas failures',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-dom-delay-'));
 const {chromium}=require('../executors/node_modules/playwright');
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.setContent(`<p>Ready</p><button onclick="document.querySelector('p').textContent='Decompressing files...';this.disabled=true;setTimeout(()=>{document.querySelector('p').textContent='Choose a route';this.textContent='North';this.disabled=false},1600)">Start</button>`);
  const result=await verifyInteraction(page,'Start',run,{waitMs:4000});
  assert.match(result.after.text,/Choose a route/);assert.ok(result.elapsed_ms>=1500);
  assert.ok(result.observations.some(o=>o.text.includes('Decompressing')));
  await page.setContent(`<p>Ready</p><button onclick="document.querySelector('p').textContent='Decompressing files...';this.textContent='Cancel'">Start</button>`);
  await assert.rejects(()=>verifyInteraction(page,'Start',run,{waitMs:500}),/did not produce/);
  let evidence=JSON.parse(fs.readFileSync(path.join(run,'transition.json')));
  assert.match(evidence.after.text,/Decompressing/);assert.equal(evidence.before.controls[0],'Start');
  await page.setContent(`<button onclick="document.body.innerHTML='<canvas width=390 height=844></canvas>'">Start</button>`);
  await assert.rejects(()=>verifyInteraction(page,'Start',run,{waitMs:0}),/did not produce/);
  evidence=JSON.parse(fs.readFileSync(path.join(run,'transition.json')));
  assert.equal(evidence.after.canvases[0].width,390);assert.equal(evidence.after.canvases[0].visible,true);
 }finally{await browser.close();fs.rmSync(run,{recursive:true,force:true});}
});

test('resource redirects preserve final bytes and record each hop',async()=>{
 const trace=[],calls=[],disposed=[];
 const response=(status,location,data)=>({status:()=>status,headers:()=>({location}),body:async()=>Buffer.from(data||''),dispose:async()=>disposed.push(status)});
 const responses=[response(307,'/assets/next'),response(302,'https://cdn.example/a.webp'),response(200,null,'original bytes')];
 const result=await followResourceRedirects(async(url,first)=>{calls.push({url,first});return responses.shift();},'https://fixture.example/assets/a.webp',trace);
 assert.equal((await result.body()).toString(),'original bytes');
 assert.deepEqual(calls.map(c=>c.url),['https://fixture.example/assets/a.webp','https://fixture.example/assets/next','https://cdn.example/a.webp']);
 assert.deepEqual(calls.map(c=>c.first),[true,false,false]);assert.deepEqual(disposed,[307,302]);
 assert.equal(trace[2].final,true);assert.equal(trace[2].status,200);
});

test('redirects reject private targets, absent locations, loops and excessive hops',async()=>{
 for(const [location,pattern] of [['http://127.0.0.1/private',/Non-public/],['https://u:p@example.org/a',/Non-public/],[null,/missing Location/],['/a',/loop/]]){
  let calls=0;
  await assert.rejects(()=>followResourceRedirects(async()=>{calls++;return {status:()=>307,headers:()=>({location}),dispose:async()=>{}};},'https://fixture.example/a',[]),pattern);
  assert.equal(calls,1);
 }
 let calls=0;
 await assert.rejects(()=>followResourceRedirects(async()=>({status:()=>307,headers:()=>({location:'/hop'+(++calls)}),dispose:async()=>{}}),'https://fixture.example/a',[]),/limit exceeded/);
 assert.equal(calls,6);
});

test('screenshot remembers the working capture mode for that page only',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-capture-fixture-')),calls=[];
 const page={context:()=>({newCDPSession:async()=>({send:async(method,options)=>{
  calls.push(options.fromSurface);if(!options.fromSurface)throw Error('unsupported view capture');
  return {data:Buffer.from('fixture pixels').toString('base64')};
 },detach:async()=>{}})})};
 try{
  await screenshot(page,path.join(run,'first.png'));await screenshot(page,path.join(run,'second.png'));
  assert.deepEqual(calls,[false,true,true]);
  assert.equal(fs.readFileSync(path.join(run,'second.png'),'utf8'),'fixture pixels');
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});

test('missing resources use only the observed original directory and never replace files',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-resource-fixture-')),original=request.newContext;
 const fetched=[];
 request.newContext=async()=>({get:async url=>{fetched.push(url);return {ok:()=>true,status:()=>200,headers:()=>({}),body:async()=>Buffer.from('fixture-original-bytes'),dispose:async()=>{}};},dispose:async()=>{}});
 try{
  fs.mkdirSync(path.join(run,'converted/evidence'),{recursive:true});
  fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({url:'https://fixture.example/game/index.html',files:[],bytes:0}));
  fs.writeFileSync(path.join(run,'converted/evidence/runtime.json'),JSON.stringify({missing:['/assets/a.png'],failure:'observed 404'}));
  const added=await repairResources(run);assert.equal(added.length,1);assert.deepEqual(fetched,['https://fixture.example/game/assets/a.png']);
  assert.equal(fs.readFileSync(path.join(run,'converted/assets/a.png'),'utf8'),'fixture-original-bytes');
  assert.equal(JSON.parse(fs.readFileSync(path.join(run,'web-acquisition.json'))).resource_refreshes[0].files[0].sha256,added[0].sha256);
  await assert.rejects(()=>repairResources(run),/cannot replace/);
  fs.writeFileSync(path.join(run,'converted/evidence/runtime.json'),JSON.stringify({missing:['/../private.json']}));
  await assert.rejects(()=>repairResources(run),/original directory/);assert.equal(fetched.length,1);
 }finally{request.newContext=original;fs.rmSync(run,{recursive:true,force:true});}
});
test('offline client adaptation requires the exact contract and preserves unrelated code',()=>{
 const code='_cncfg:[function t(){}];t.prototype.isServerEnable=function(){return!c.default.isLanEn&&this.isEnable(r.default._swchtp.SERVER)};onSynGameSuccess(null,o);';
 const adapted=adaptClient(code);assert.equal(adapted.changed,true);assert.match(adapted.text,/isServerEnable=function\(\)\{return false\}/);
 assert.equal(adaptClient(code.replace('onSynGameSuccess(null,o);','')).changed,false);
 assert.equal(adaptClient(code+code).changed,false);
});
test('resource mapping preserves paths, rejects traversal and private hosts',()=>{
 assert.equal(resourcePath('https://example.org/game/assets/a.png?v=2','https://example.org/game/'),'assets/a.png');
 for(const url of ['http://127.1/a','http://2130706433/a','http://[::1]/','http://10.2.3.4/','https://user:pass@example.org/'])assert.throws(()=>safeURL(url));
 assert.throws(()=>resourcePath('https://example.org/game/a%2f..%2fb.js','https://example.org/game/'));
 assert.throws(()=>resourcePath('https://example.org/game/a%5cb.js','https://example.org/game/'));
});
test('engine detection does not route by game name or URL',()=>{
 assert.equal(detect('<script>window._CCSettings={}</script><script src="cocos2d-js.js"></script>'),'cocos2');
 assert.throws(()=>detect('<title>Ruffle game</title><canvas></canvas>'));
 const html='<script>window.RufflePlayer={};player.load("../original.swf")</script><script src="engine/ruffle.js"></script>';
 assert.equal(detect(html),'ruffle');const r=ruffleEntry(html,'https://example.org/game/index.html');
 assert.equal(r.movie,'https://example.org/original.swf');assert.equal(r.engine,'https://example.org/game/engine/ruffle.js');
 assert.match(r.html,/allowNetworking:'none'/);
});

test('AI runtime plans require matching source evidence and known loader contract',()=>{
 const html='<script src="dmloader.js"></script><script>EngineLoader.load("canvas","fixture")</script>';
 const sha=require('node:crypto').createHash('sha256').update(html).digest('hex');
 assert.throws(()=>detect(html));
 assert.equal(detect(html,{engine:'defold',source_sha256:sha}),'defold');
 assert.throws(()=>detect(html,{engine:'defold',source_sha256:'stale'}));
 assert.throws(()=>detect('<canvas/>',{engine:'defold',source_sha256:sha}));
});

test('offline SDK rejects initialization and never grants rewarded advertisements',async()=>{
 const vm=require('node:vm'),window={};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../executors/adapters/poki-offline.js'),'utf8'),{window,URL,location:{href:'https://fixture.example/'}});
 await assert.rejects(window.PokiSDK.init());
 assert.equal(await window.PokiSDK.rewardedBreak(),false);
 assert.equal(await window.PokiSDK.commercialBreak(),false);
 assert.equal(window.__offlineHost.events[0].name,'init-unavailable');
});

test('Defold browser evidence records held input and read-only IndexedDB across reload',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-idb-fixture-'));
 try{
  fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'defold'}));
  fs.writeFileSync(path.join(run,'converted/index.html'),`<canvas width="400" height="300"></canvas><script>
   window.Module={calledRun:true,canvas:document.querySelector('canvas')};
   Module.canvas.getContext('2d').fillRect(10,10,80,60);
   let down=0;addEventListener('keydown',()=>down=Date.now());addEventListener('keyup',()=>localStorage.setItem('held-ms',Date.now()-down));
   const request=indexedDB.open('fixture-save',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');
   const save=new Uint8Array([1,2,3]);
   Module.FS={readdir:()=>['.','..','save.bin'],lstat:p=>({size:p==='/data'?0:3,mode:p==='/data'?1:2}),
     isLink:()=>false,isDir:m=>m===1,isFile:m=>m===2,readFile:()=>save};
   request.onsuccess=()=>{const db=request.result,tx=db.transaction('files','readwrite');
    tx.objectStore('files').put({contents:new Uint8Array(2_000_000).fill(255)},'a-large-cache.bin');
    tx.objectStore('files').put({contents:save},'save.bin');tx.oncomplete=()=>db.close();};
  </script>`);
  const report=await verify(run,[{type:'key',key:'ArrowRight',hold_ms:300},{type:'reload'}]);
  assert.equal(report.passed,true);
  const before=report.steps[1].storage.areas.indexedDB,after=report.steps[2].storage.areas.indexedDB;
  assert.equal(before.complete,true);assert.equal(after.complete,true);
  assert.equal(before.databases[0].stores[0].entries.length,2);
  assert.equal(before.databases[0].stores[0].entries[0].content_bytes,2_000_000);
  assert.equal(before.databases[0].stores[0].entries[1].content_sha256,report.steps[1].storage.areas.wasmFS.entries[1].content_sha256);
  assert.equal(report.steps[1].storage.areas.wasmFS.complete,true);
  assert.equal(before.databases[0].stores[0].entries[0].sha256,after.databases[0].stores[0].entries[0].sha256);
  const held=report.steps[1].storage.areas.localStorage.entries.find(e=>e.key==='held-ms');assert.ok(held);
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});

test('Cocos scene existence does not certify a loading screen',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-loading-fixture-'));
 try{
  fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'cocos2'}));
  fs.writeFileSync(path.join(run,'converted/index.html'),`<canvas width="400" height="300"></canvas><script>
   const label={string:'Loading 70%'};
   const scene={name:'Fixture',activeInHierarchy:true,opacity:255,children:[],getComponent:type=>type===cc.Label?label:null};
   window.cc={Label:function(){},Button:function(){},director:{getScene:()=>scene},game:{canvas:document.querySelector('canvas')},winSize:{width:400,height:300}};
   setTimeout(()=>label.string='READY',5000);
  </script>`);
  const report=await verify(run);assert.equal(report.steps[0].labels[0].text,'READY');
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});
test('offline browser validates authored local fixture and rejects external dependency',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-web-fixture-'));
 try{
  fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'ruffle'}));
  const doc='<canvas width="400" height="300"></canvas><script>window.player={readyState:2};window.gameLoaded=true;const c=document.querySelector("canvas");c.getContext("2d").fillRect(10,10,80,60);</script>';
  fs.writeFileSync(path.join(run,'converted/index.html'),doc);
  const report=await verify(run,[{type:'click',x:30,y:30}]);assert.equal(report.passed,true);assert.equal(report.steps.length,2);
  assert.equal(report.actions[0].hold_ms,100);
  fs.writeFileSync(path.join(run,'converted/index.html'),doc+'<script src="https://example.org/missing.js"></script>');
  await assert.rejects(()=>verify(run),/Offline check failed/);
  const failed=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));assert.equal(failed.passed,false);assert.equal(failed.external[0],'https://example.org/missing.js');
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});
