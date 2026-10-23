const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {entryReferences,references,rewriteModules,rewriteInlineModules}=require('../executors/module-resources.cjs');
const {resourcePath,verify}=require('../executors/discovered-web.cjs');

test('capture follows only declared cross-origin code and retains original module bytes',async()=>{
 const {chromium}=require('../executors/node_modules/playwright'),{capture}=require('../executors/discovered-web.cjs');
 const launch=chromium.launch.bind(chromium),run=fs.mkdtempSync(path.join(os.tmpdir(),'door-capture-modules-'));
 const entry='https://fixture.example/index.html',html=`<script type="module">import {start} from 'https://cdn.example/engine'; start(); fetch('https://api.example/private').catch(()=>{});</script>`;
 const sources=new Map([[entry,html],['https://cdn.example/engine',`export {start} from '/core.js';`],['https://cdn.example/core.js',`export function start(){document.body.innerHTML='<canvas width="390" height="844"></canvas><p>Captured fixture</p>';}`]]),fetched=[];
 const response=url=>{fetched.push(url);return {url:()=>url,ok:()=>sources.has(url),status:()=>sources.has(url)?200:404,headers:()=>({'content-type':url===entry?'text/html':'text/javascript','access-control-allow-origin':'*'}),text:async()=>sources.get(url),body:async()=>Buffer.from(sources.get(url)||''),dispose:async()=>{}};};
 chromium.launch=async(...args)=>{const browser=await launch(...args),newContext=browser.newContext.bind(browser);
  browser.newContext=async(...options)=>{const context=await newContext(...options),route=context.route.bind(context);
   context.request.get=async url=>response(url);
   context.route=async(pattern,handler)=>route(pattern,actual=>handler(new Proxy(actual,{get(target,key){
    if(key==='fetch')return async()=>response(target.request().url());
    if(key==='fulfill')return async options=>{if(options.response){const r=options.response;options={status:r.status(),headers:r.headers(),body:options.body??await r.body()};}return target.fulfill(options);};
    const value=target[key];return typeof value==='function'?value.bind(target):value;
   }})));
   return context;};return browser;};
 try{
  fs.writeFileSync(path.join(run,'runtime-plan.json'),JSON.stringify({engine:'browser',sdk:null,source_sha256:require('node:crypto').createHash('sha256').update(html).digest('hex')}));
  const result=await capture({url:entry},run);assert.equal(result.complete,true);
  assert.deepEqual(fetched,[entry,'https://cdn.example/engine','https://cdn.example/core.js']);
  assert.ok(result.external.includes('https://api.example/private'));
  assert.equal(fs.readFileSync(path.join(run,'web-original',resourcePath('https://cdn.example/engine',entry,true)),'utf8'),sources.get('https://cdn.example/engine'));
  const offline=await verify(run);assert.equal(offline.passed,true);assert.match(offline.steps[0].text,/Captured fixture/);
 }finally{chromium.launch=launch;fs.rmSync(run,{recursive:true,force:true});}
});

test('declared module graph resolves import maps and ignores comments and computed imports',async()=>{
 const html=`<script type="importmap">{"imports":{"engine":"https://cdn.example/engine","addons/":"https://cdn.example/addons/"}}</script><script src="https://sdk.example/host.js"></script><script type="module">import {a} from 'engine'; import 'addons/mesh.js'; // import 'https://bad.example/evil.js'\n import(dynamicName);</script>`;
 const graph=await entryReferences(html,'https://game.example/index.html');
 assert.deepEqual([...graph.urls],['https://sdk.example/host.js','https://cdn.example/engine','https://cdn.example/addons/mesh.js']);
 const refs=await references(`export {x} from './core.js'; import('/shared/util.js'); import.meta.url;`,'https://cdn.example/v2/engine',graph.mappings);
 assert.deepEqual(refs.map(r=>r.url),['https://cdn.example/v2/core.js','https://cdn.example/shared/util.js']);
 await assert.rejects(()=>entryReferences('<script type="module">import "http://127.0.0.1/private"</script>','https://game.example/'),/Non-public/);
});

test('relocated extensionless modules, root imports and literal dynamic imports execute fully offline',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-modules-')),base='https://game.example/play/';
 const html=`<meta charset="utf-8"><script type="importmap">{"imports":{"engine":"https://cdn.example/pkg/engine"}}</script><canvas width="390" height="400"></canvas><p id="status">Loading</p><script type="module">import {total} from 'engine'; const bonus=await import('https://cdn.example/pkg/bonus.js'); document.querySelector('#status').textContent='Fixture score '+(total+bonus.extra);</script>`;
 const sources=new Map([
  ['https://cdn.example/pkg/engine',`export {total} from '/core/core.js';`],
  ['https://cdn.example/core/core.js',`import {value} from './value.js'; export const total=value+2;`],
  ['https://cdn.example/core/value.js','export const value=40;'],
  ['https://cdn.example/pkg/bonus.js','export const extra=8;']]);
 const graph=await entryReferences(html,base+'index.html');
 try{
  for(const [url,source] of sources){const file=resourcePath(url,base,true),local=target=>{if(!sources.has(target))return null;const p=path.posix.relative(path.posix.dirname(file),resourcePath(target,base,true));return p.startsWith('.')?p:'./'+p;};
   const dest=path.join(run,'converted',file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,await rewriteModules(source,url,graph.mappings,local));}
  fs.writeFileSync(path.join(run,'converted/index.html'),await rewriteInlineModules(html,base+'index.html',graph.mappings,url=>sources.has(url)?'./'+resourcePath(url,base,true):null));
  fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'browser'}));
  const result=await verify(run);assert.equal(result.passed,true);assert.match(result.steps[0].text,/Fixture score 50/);assert.deepEqual(result.external,[]);
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});
