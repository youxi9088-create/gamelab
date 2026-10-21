// Bounded resource snapshot for a configured Web runtime; no user browser profile.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
(async()=>{
 const [input,out]=process.argv.slice(2),{url,profile}=JSON.parse(fs.readFileSync(input,'utf8'));
 const entry=new URL(url);if(!['http:','https:'].includes(entry.protocol)||entry.username||entry.password)throw Error('Invalid source URL');
 const prefix=entry.pathname.endsWith('/')?entry.pathname:entry.pathname.includes('.')?entry.pathname.slice(0,entry.pathname.lastIndexOf('/')+1):entry.pathname+'/';
 fs.mkdirSync(out,{recursive:true});const report={source_url:url,files:[],external:[],errors:[],adapter_scripts:profile.external_scripts||[]};
 let total=0,pending=[],failed=null;const seen=new Map();
 const browser=await chromium.launch(require('./browser-options.cjs')());
 try {
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block',acceptDownloads:false});
  await context.route('**/*',route=>{
   const u=new URL(route.request().url()),adapter=(profile.external_scripts||[]).find(x=>x.url===u.href);
   if(adapter&&adapter.adapter==='mini-game-sdk')return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(path.join(__dirname,'adapters/mini-game-sdk.js'),'utf8')});
   if(u.origin===entry.origin&&(u.pathname.startsWith(prefix)||u.pathname===entry.pathname))return route.continue();
   if(['data:','blob:'].includes(u.protocol))return route.continue();
   report.external.push(u.origin+u.pathname);return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  page.on('response',response=>{
   const u=new URL(response.url());if(u.origin!==entry.origin||!u.pathname.startsWith(prefix)||!response.ok())return;
   pending.push((async()=>{
    const name=decodeURIComponent(u.pathname.slice(prefix.length))||'index.html';
    if(name.split('/').some(x=>!x||x==='.'||x==='..'||/[\\:\x00]/.test(x)))throw Error('Unsafe resource path');
    const data=await response.body(),sha=crypto.createHash('sha256').update(data).digest('hex');
    if(seen.has(name)){if(seen.get(name)!==sha)throw Error('Resource path collision');return;}
    if(seen.size>=1800||total+data.length>220*1024*1024)throw Error('Web resource budget exceeded');
    seen.set(name,sha);total+=data.length;const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);
    report.files.push({path:name,sha256:sha,bytes:data.length,url:u.origin+u.pathname});
   })().catch(e=>{failed=e.message}));
  });
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  if(profile.engine==='cocos2'){
   await page.waitForFunction(scene=>window.cc?.director.getScene()?.name===scene,profile.ready_scene,{timeout:60000});
   await page.evaluate(async(configured)=>{
    const names=configured.length?configured:Object.keys(window._CCSettings?.bundleVers||{});
    await Promise.all(names.map(name=>new Promise((resolve,reject)=>cc.assetManager.loadBundle(name,(err)=>err?reject(Error(String(err))):resolve()))));
    const bundles=[];cc.assetManager.bundles.forEach(b=>bundles.push(b));
    await Promise.all(bundles.map(b=>new Promise((resolve,reject)=>b.loadDir('',(err)=>err?reject(Error(String(err))):resolve()))));
   },profile.bundles||[]);
  }
  await page.waitForTimeout(1500);await Promise.all(pending);
  if(failed)throw Error(failed);
  if(!seen.has('index.html'))throw Error('No entry captured');
  report.bytes=total;report.external=[...new Set(report.external)];
  await page.screenshot({path:path.join(path.dirname(out),'capture.png')});
 } finally {await Promise.allSettled(pending);await browser.close();fs.writeFileSync(path.join(path.dirname(out),'web-acquisition.json'),JSON.stringify(report,null,2));}
})().catch(e=>{console.error(e.message);process.exitCode=1});
