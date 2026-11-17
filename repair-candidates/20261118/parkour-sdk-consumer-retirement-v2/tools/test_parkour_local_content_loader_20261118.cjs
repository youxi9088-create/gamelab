const assert=require('assert/strict'),crypto=require('crypto'),fs=require('fs'),create=require('./parkour_local_content_loader_20261118.js');
const sha=raw=>crypto.createHash('sha256').update(Buffer.from(raw)).digest('hex');
const bytes=Buffer.from('original local resource');
const entry={path:'scenes/原图 1.png',bytes:bytes.length,sha256:sha(bytes)};
const group={name:'scenes',files:[entry]};
const result={at:new Date().toISOString(),tests:[],native_game_executed:false};
async function check(name,fn){await fn();result.tests.push(name);}
function setup(fetch){return create({base:'http://127.0.0.1:57590/revision/',fetch,sha256:async b=>sha(b)});}
const response=(b=bytes)=>({ok:true,arrayBuffer:async()=>Uint8Array.from(b).buffer});
(async()=>{
 await check('Readiness remains false until original bytes and digest complete',async()=>{
  let release;const gate=new Promise(r=>release=r);let calls=0;
  const loader=setup(async(url,options)=>{calls++;assert.equal(new URL(url).origin,'http://127.0.0.1:57590');assert(url.includes('%E5%8E%9F%E5%9B%BE%201.png'));assert.equal(options.redirect,'error');await gate;return response();});
  const pending=loader.load(group);assert.equal(loader.isReady('scenes'),false);release();await pending;assert.equal(loader.isReady('scenes'),true);await loader.load(group);assert.equal(calls,1);
 });
 await check('HTTP failure cannot mark package ready',async()=>{const loader=setup(async()=>({ok:false}));await assert.rejects(loader.load(group),/Missing local content/);assert.equal(loader.isReady('scenes'),false);});
 await check('Wrong length cannot mark package ready',async()=>{const loader=setup(async()=>response(Buffer.from('wrong')));await assert.rejects(loader.load(group),/differs/);assert.equal(loader.isReady('scenes'),false);});
 await check('Same length wrong SHA cannot mark package ready',async()=>{const loader=setup(async()=>response(Buffer.alloc(bytes.length)));await assert.rejects(loader.load(group),/differs/);assert.equal(loader.isReady('scenes'),false);});
 await check('External path traversal and query inputs fail before fetch',async()=>{let calls=0;const loader=setup(async()=>{calls++;return response();});for(const path of ['../outside','/root.png','https://outside.test/a','a\\b','a?x=1','a#x','a//b'])await assert.rejects(loader.load({name:path,files:[{...entry,path}]}));assert.equal(calls,0);});
 await check('Duplicate or empty content group cannot mark ready',async()=>{const loader=setup(async()=>response());await assert.rejects(loader.load({name:'duplicate',files:[entry,entry]}));await assert.rejects(loader.load({name:'empty',files:[]}));assert.equal(loader.isReady('duplicate'),false);assert.equal(loader.isReady('empty'),false);});
 await check('A ready group name cannot be reused for a different manifest',async()=>{const loader=setup(async()=>response());await loader.load(group);await assert.rejects(loader.load({name:'scenes',files:[{...entry,path:'other.png'}]}),/identity changed/);});
 await check('Same active manifest shares one request and genuine failed read can be retried',async()=>{let calls=0;const loader=setup(async()=>{calls++;return calls===1?{ok:false}:response();});await assert.rejects(loader.load(group));await Promise.all([loader.load(group),loader.load(group)]);assert.equal(calls,2);assert.equal(loader.isReady('scenes'),true);});
 await check('Content read concurrency stays at six per package',async()=>{let active=0,max=0;const loader=setup(async()=>{max=Math.max(max,++active);await new Promise(r=>setTimeout(r,2));active--;return response();});await loader.load({name:'batch',files:Array.from({length:19},(_,i)=>({...entry,path:'picture/'+i+'.png'}))});assert.equal(max,6);});
 result.passed=result.tests.length;const p='deployment-packages/direct-games/job-09a1ed6877a8/work-sdk-consumer-retirement-v2-20261118/evidence/direct-repair/local-content-loader-tests.json';fs.writeFileSync(p,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(error=>{console.error(error);process.exitCode=1;});
