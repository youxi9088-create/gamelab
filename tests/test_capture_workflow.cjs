const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {cachedResponse,classifyMissing}=require('../executors/capture-cache.cjs');
const {capture,verify}=require('../executors/discovered-web.cjs');
const launcher=require('../executors/extension-browser.cjs');
const {chromium}=require('../executors/node_modules/playwright');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('cache checks bytes/hash and never reads paths outside its root',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'capture-cache-'));
 try{
  fs.writeFileSync(path.join(dir,'game.js'),'game');
  const record={path:'game.js',bytes:4,sha256:hash('game'),contentType:'text/javascript',url:'https://fixture.example/game.js'};
  assert.equal((await cachedResponse(dir,record).body()).toString(),'game');
  assert.equal(cachedResponse(dir,{...record,path:'../outside.js'}),null);
  fs.writeFileSync(path.join(dir,'game.js'),'edit');assert.equal(cachedResponse(dir,record),null);
  assert.equal(classifyMissing({url:()=>record.url,resourceType:()=> 'script',method:()=> 'GET'},404,'startup').impact,'potentially_required');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('capture retains HTTP failures, caches valid resources and offline verify still rejects a missing SDK',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'capture-flow-'));
 const html='<html><head></head><body><button>Start tutorial</button><script src="game.js"></script><script src="sdk.js"></script></body></html>';
 let downloads=0;
 const server=http.createServer((req,res)=>{
  if(req.url==='/index.html'){res.setHeader('Content-Type','text/html');res.end(html);}
  else if(req.url==='/game.js'){downloads++;res.setHeader('Content-Type','text/javascript');res.end('window.fixture=true;');}
  else{res.writeHead(404);res.end('missing');}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const transport='http://127.0.0.1:'+server.address().port,original=launcher.launchBrowser;
 launcher.launchBrowser=async()=>{
  const browser=await chromium.launch(require('../executors/browser-options.cjs')());
  const newContext=browser.newContext.bind(browser);
  browser.newContext=async options=>{
   const c=await newContext(options),get=c.request.get.bind(c.request),route=c.route.bind(c);
   c.request.get=(url,opts)=>get(transport+new URL(url).pathname,opts);
   c.route=(pattern,handler)=>route(pattern,r=>handler(new Proxy(r,{get(target,key){
    if(key==='fetch')return opts=>target.fetch({...opts,url:transport+new URL(target.request().url()).pathname});
    const value=target[key];return typeof value==='function'?value.bind(target):value;
   }})));
   return c;
  };return browser;
 };
 try{
  fs.writeFileSync(path.join(dir,'runtime-plan.json'),JSON.stringify({engine:'browser-dom',source_sha256:hash(html)}));
  const input={url:'https://fixture.example/index.html'};
  const first=await capture(input,dir);
  assert.equal(first.complete,true);assert.ok(first.missing.some(r=>r.classification==='source_unavailable'&&r.type==='script'));
  assert.equal(downloads,1);
  const second=await capture(input,dir);assert.equal(downloads,1);assert.ok(second.cache_hits>=1);
  launcher.launchBrowser=original;
  await assert.rejects(()=>verify(dir),/Missing|Offline/);
  const runtime=JSON.parse(fs.readFileSync(path.join(dir,'converted/evidence/runtime.json')));
  assert.equal(runtime.passed,false);assert.ok(runtime.missing.some(p=>p.includes('sdk.js')));
 }finally{launcher.launchBrowser=original;await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
});
