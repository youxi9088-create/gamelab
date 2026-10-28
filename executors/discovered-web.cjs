// Engine-based public Web capture. Original files and offline checks stay separate.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),http=require('node:http');
const {chromium,request}=require('playwright');
const {storageEvidence}=require('./storage-evidence.cjs');
const {runtimeIssues,offlineFailure}=require('./runtime-issues.cjs');
const {createAdblock}=require('./adblock.cjs');
const {cocosReadiness}=require('./cocos-readiness.cjs');
const {entryReferences,references,rewriteModules,rewriteInlineModules}=require('./module-resources.cjs');
const {sessionOptions}=require('./browser-session.cjs');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
// Playwright 不会自动使用系统/环境变量代理。进程内的 APIRequestContext
// （context.request 与 request.newContext）因此会直连，在只能经代理出网的机器上
// 报 getaddrinfo ENOTFOUND，而同一台机器的浏览器导航却是通的。
const proxyServer=(process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY||process.env.http_proxy||'').trim();
// Loopback must never be proxied: the offline run serves captured files from a
// local ephemeral port and route.fetch() re-issues those requests through the
// browser context. Without the bypass those fetches can be handed to the
// outbound proxy, which cannot reach 127.0.0.1, so files that are already on
// disk come back as errors and stall the repair loop.
const proxyOptions=()=>proxyServer?{proxy:{server:proxyServer,bypass:'127.0.0.1,localhost,[::1]'}}:{};
const screenshotModes=new WeakMap();
async function screenshot(page,file){
 // Capture the compositor's actual viewport. Game-created FontFace loads may
 // never settle; waiting on document.fonts.ready must not hide visible pixels.
 const session=await page.context().newCDPSession(page);let timer,last;
 try{
  const preferred=screenshotModes.get(page)??false;
  for(const fromSurface of [preferred,!preferred]){
   try{
    const result=await Promise.race([session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface}),
     new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('Viewport screenshot timed out')),30000);})]);
    fs.writeFileSync(file,Buffer.from(result.data,'base64'));screenshotModes.set(page,fromSurface);return;
   }catch(e){last=e;}finally{clearTimeout(timer);}
  }
  throw last;
 }finally{clearTimeout(timer);await session.detach().catch(()=>{});}
}
function safeURL(value){
 const u=new URL(value);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(u.hostname))throw Error('Non-public resource URL');
 u.hash='';return u;
}
async function followResourceRedirects(fetch, value, evidence){
 let url=safeURL(value).href;const visited=new Set();
 for(let hop=0;hop<=5;hop++){
  if(visited.has(url))throw Error('Resource redirect loop');visited.add(url);
  const res=await fetch(url,hop===0),status=res.status();
  if(![301,302,303,307,308].includes(status)){
   if(hop)evidence.push({url,status,final:true});
   return res;
  }
  const location=res.headers().location;
  evidence.push({url,status,location:location||null});
  await res.dispose();
  if(!location)throw Error('Resource redirect missing Location');
  if(hop===5)throw Error('Resource redirect limit exceeded');
  url=safeURL(new URL(location,url).href).href;
 }
}
function resourcePath(value,base,script=false){
 const u=safeURL(value),b=safeURL(base);let p;
 if(u.origin===b.origin&&u.pathname.startsWith(b.pathname))p=decodeURIComponent(u.pathname.slice(b.pathname.length))||'index.html';
 else p='_remote/'+hash(u.origin+u.pathname).slice(0,16)+'/'+decodeURIComponent(u.pathname.split('/').pop()||'resource');
 if(p.split('/').some(s=>!s||s==='.'||s==='..'||/[\\:\x00-\x1f<>"|?*]/.test(s)))throw Error('Unsafe captured resource path');
 return script&&!p.endsWith('.js')?p+'.js':p;
}
function detect(html,plan){
 if(/RufflePlayer/.test(html)&&/\.swf["']/.test(html))return 'ruffle';
 if(/_CCSettings/.test(html)&&/cocos2d-js/.test(html))return 'cocos2';
 if(plan?.engine==='defold'&&plan.source_sha256===hash(html.replace(/\r\n/g,'\n'))&&html.includes('EngineLoader.load(')&&html.includes('dmloader.js'))return 'defold';
 if(plan?.engine==='browser'&&plan.source_sha256===hash(html.replace(/\r\n/g,'\n'))&&/<script\b/i.test(html))return 'browser';
 if(plan?.engine==='browser-dom'&&plan.source_sha256===hash(html.replace(/\r\n/g,'\n'))&&/<script\b/i.test(html))return 'browser-dom';
 throw Error('入口已取得，运行契约尚未配置；请分析已保留入口与依赖代码，再选择适配方案');
}
function ruffleEntry(html,url){
 const swf=html.match(/\.load\(\s*["']([^"']+\.swf)["']/),scripts=[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>m[1]);
 const js=scripts.find(s=>/(^|\/)ruffle\.js(?:\?|$)/.test(s));
 if(!swf||!js)throw Error('Ruffle 入口未声明唯一可提取的 SWF 和运行引擎');
 const movie=safeURL(new URL(swf[1],url).href).href,engine=safeURL(new URL(js,url).href).href;
 return {movie,engine,html:`<!doctype html><html><head><meta charset="utf-8"><style>html,body,#game{margin:0;width:100%;height:100%;background:#000}ruffle-player{width:100%;height:100%}</style></head><body><div id="game"></div><script>window.RufflePlayer={config:{autoplay:'on',unmuteOverlay:'hidden',allowNetworking:'none'}};window.addEventListener('load',async()=>{window.player=RufflePlayer.newest().createPlayer();document.querySelector('#game').appendChild(player);try{await player.load(${JSON.stringify(movie)});window.gameLoaded=true}catch(e){window.gameLoadError=String(e)}});</script><script src="${engine}"></script></body></html>`};
}
function adaptClient(text){
 // A known client contract already has an offline success path with local data.
 // Disable the remote gate; do not synthesize a server response or rewards.
 if(!text.includes('onSynGameSuccess(null,')||!text.includes('_cncfg:[function'))return {text,changed:false};
 const pattern=/([\w$]+)\.prototype\.isServerEnable=function\(\)\{return![\w$]+\.default\.isLanEn&&this\.isEnable\([\w$]+\.default\._swchtp\.SERVER\)\}/g;
 const matches=[...text.matchAll(pattern)];if(matches.length!==1)return {text,changed:false};
 return {text:text.replace(pattern,'$1.prototype.isServerEnable=function(){return false}'),changed:true};
}
async function ready(page,engine){
 if(engine==='browser-dom'){
  await page.waitForFunction(()=>document.body.innerText.trim().length>0&&[...document.querySelectorAll('button,[role="button"]')].some(n=>{
   const r=n.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(n).visibility!=='hidden'&&!n.disabled;
  }),null,{timeout:90000});
  await page.waitForTimeout(1000);return;
 }
 if(engine==='defold'){
  await page.waitForFunction(()=>!!window.Module?.calledRun&&!!window.Module?.canvas?.width,null,{timeout:90000});
  await page.waitForTimeout(3000);return;
 }
 if(engine==='three'||engine==='browser'){
  await page.waitForFunction(()=>[...document.querySelectorAll('canvas')].some(c=>c.width>0&&c.height>0),null,{timeout:90000});
  await page.waitForTimeout(3000);return;
 }
 await page.waitForFunction(kind=>kind==='cocos2'?!!window.cc?.director.getScene():window.gameLoaded===true,engine,{timeout:90000});
 await page.waitForTimeout(engine==='ruffle'?10000:2000);
}
// 两类运行时报错性质不同，不能一刀切：
//  · 执行中意外的 ReferenceError/TypeError（典型是广告或统计模块引用了未声明的
//    变量）——游戏主循环照常推进，原站线上也报同样的错，属于上游自带的缺陷；
//  · 游戏自己检测到依赖不可用后主动抛出的错误（"Required SDK unavailable" 这类）
//    ——是游戏明确声明"我跑不了"，必须照实判失败，不能因为页面还能显示就放过。
const FATAL_RUNTIME_HINT=/Required SDK|SDK unavailable|required dependency|missing required/i;
function nonFatalRuntimeError(text){
 return /ReferenceError|TypeError/.test(text||'')&&!FATAL_RUNTIME_HINT.test(text||'');
}
// 运行期随时会有新的 pageerror 进来（广告/统计模块常被反复触发），所以不能只
// 在第一次判定时归置一次就完事：后面每个判定点看到的 errors 都是新的。这里做
// 成可重复调用的，并在每个判定点前调一次。同文本只保留一条，避免告警被刷爆。
function settleNonFatalRuntime(report){
 if(!report.errors.length||!report.errors.every(nonFatalRuntimeError))return report;
 const known=new Set(report.runtime_warnings||[]);
 const merged=(report.runtime_warnings||[]).concat(report.errors.filter(item=>!known.has(item)));
 report.runtime_warnings=merged;report.errors=[];
 return report;
}
async function gameplayReady(page,engine){
 await ready(page,engine);
 if(engine==='cocos2'){
  try{await page.waitForFunction('('+cocosReadiness.toString()+')().ready',null,{timeout:90000});}
  catch(error){
   const observation=await page.evaluate(cocosReadiness).catch(()=>null);
   const failure=Error('Cocos 界面就绪超时：'+(observation?.loading?'仍显示加载提示': '未观察到有效文字或屏幕内可交互按钮')+'；详见 readiness 证据');
   failure.readiness={...observation,timeout_ms:90000};throw failure;
  }
 }
}
async function state(page,engine){
 return page.evaluate(kind=>{
  const result={engine:kind,viewport:{width:innerWidth,height:innerHeight},canvasCount:document.querySelectorAll('canvas').length,fontStatus:document.fonts?.status,buttons:[],labels:[]};
  if(kind==='cocos2'){
   result.scene=cc.director.getScene()?.name;
   const rect=cc.game.canvas.getBoundingClientRect();
   function walk(n,p){if(!n.activeInHierarchy||n.opacity===0)return;const name=p+'/'+n.name,l=n.getComponent(cc.Label),b=n.getComponent(cc.Button);
    if(l?.string)result.labels.push({path:name,text:l.string});
    if(b&&b.interactable){const xy=n.convertToWorldSpaceAR(cc.v2(0,0));result.buttons.push({path:name,handlers:b.clickEvents.map(e=>e.handler),x:rect.left+xy.x/cc.winSize.width*rect.width,y:rect.top+(1-xy.y/cc.winSize.height)*rect.height});}
    n.children.forEach(c=>walk(c,name));}
   walk(cc.director.getScene(),'');result.labels=result.labels.slice(0,120);result.buttons=result.buttons.slice(0,80);
  }else if(kind==='three'||kind==='defold'||kind==='browser'||kind==='browser-dom'){
   result.loaded=result.canvasCount>0;result.text=document.body.innerText.slice(0,5000);
   if(kind==='defold'){result.loaded=!!window.Module?.calledRun;result.runtime={calledRun:!!window.Module?.calledRun,host:window.__offlineHost||null};}
   result.labels=[...document.querySelectorAll('h1,h2,p,button,[role="button"]')].filter(n=>n.getClientRects().length).slice(0,80).map(n=>({path:n.id||n.tagName,text:n.innerText.slice(0,200)}));
   result.buttons=[...document.querySelectorAll('button,[role="button"]')].filter(n=>n.getClientRects().length).slice(0,40).map(n=>{const r=n.getBoundingClientRect();return {path:n.id||n.tagName,label:n.innerText,x:r.x+r.width/2,y:r.y+r.height/2};});
   if(kind==='browser-dom')result.loaded=!!result.text.trim()&&result.buttons.length>0;
  }else{result.loaded=window.gameLoaded===true;result.playerState=window.player?.readyState;}
  return result;
 },engine);
}
async function capture(input,run){
 const entry=safeURL(input.url),base=new URL('.',entry).href,original=path.join(run,'web-original'),out=path.join(run,'converted');
 fs.mkdirSync(original,{recursive:true});fs.mkdirSync(out,{recursive:true});
 let prior={};try{prior=JSON.parse(fs.readFileSync(path.join(run,'web-acquisition.json'),'utf8'));}catch{}
 const report={url:input.url,referer:input.referer,files:[],external:[],errors:[],preloadErrors:[],missing:[],patches:[],redirects:[],cache_hits:0};
 let page;
 const browser=await require('./extension-browser.cjs').launchBrowser(report);let pending=[],failure,total=0;
 try{
  const context=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block',acceptDownloads:false,...proxyOptions(),...sessionOptions(input.url)});
  await context.addInitScript(()=>{let value;Object.defineProperty(window,'_CCSettings',{configurable:true,get:()=>value,set:v=>{value=v;if(v)window.__capturedCCSettings=JSON.parse(JSON.stringify(v));}});});
  const response=await context.request.get(entry.href,{headers:{Referer:input.referer||input.url},timeout:30000,maxRedirects:0});
  if(!response.ok())throw Error('运行入口 HTTP '+response.status());
  const html=await response.text();if(Buffer.byteLength(html)>2e6)throw Error('Entry too large');
  fs.writeFileSync(path.join(original,'source-entry.html'),html);
  const planFile=path.join(run,'runtime-plan.json'),plan=fs.existsSync(planFile)?JSON.parse(fs.readFileSync(planFile)):null;
  report.capture_key=hash(JSON.stringify({url:input.url,referer:input.referer,html,plan}));
  const reusable=prior.capture_key===report.capture_key?new Map((prior.files||[]).map(f=>[f.url,f])):new Map();
  let engine;
  try{engine=detect(html,plan);}catch(e){
   // Retain declared loader text for the provider-independent investigation tools.
   const sourceRoot=path.join(run,'repair-sources');fs.mkdirSync(sourceRoot,{recursive:true});
   report.declaredScripts=[];
   for(const m of [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].slice(0,6)){
    const u=safeURL(new URL(m[1],entry).href);if(u.origin!==entry.origin||!u.pathname.startsWith(new URL(base).pathname))continue;
    const item={url:u.href,path:'repair-sources/'+hash(u.href).slice(0,12)+'.js'};report.declaredScripts.push(item);
    try{const res=await context.request.get(u.href,{timeout:20000,maxRedirects:0});
     item.status=res.status();if(res.ok()&&Number(res.headers()['content-length']||0)<1_000_000){const data=await res.body();if(data.length<=1_000_000){fs.writeFileSync(path.join(run,item.path),data);item.sha256=hash(data);}}
     await res.dispose();
    }catch(err){item.error=err.message.slice(0,200);}
   }
   throw e;
  }
  report.engine=engine;report.runtimePlan=plan;
  let runtimeHTML=html;
  const sdk=[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>new URL(m[1],entry).href).filter(u=>u==='https://c.17yoo.cn/sdknew/main.js');
  if(engine==='ruffle'){const r=ruffleEntry(html,entry);runtimeHTML=r.html;report.movie=r.movie;report.patches.push({kind:'ruffle-local-host',reason:'Preserve SWF and engine; replace portal loading UI with a standalone player'});}
  else if(sdk.length){runtimeHTML=runtimeHTML.replace(sdk[0],'local-host.js');fs.copyFileSync(path.join(__dirname,'adapters/mini-game-sdk.js'),path.join(out,'local-host.js'));report.patches.push({kind:'mini-game-sdk',reason:'Local host; rewarded ads explicitly fail, no fake login or rewards'});}
  const poki=plan?.sdk==='poki-offline';
  if(poki){
   const scripts=[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/gi)].map(m=>m[1]).filter(u=>/^https:\/\/game-cdn\.poki\.com\/scripts\/[^?#]+\/poki-sdk\.js$/.test(u));
   if(scripts.length!==1)throw Error('Poki host plan requires one explicitly declared SDK');
   runtimeHTML=runtimeHTML.replace(scripts[0],'runtime-host.js');
   fs.copyFileSync(path.join(__dirname,'adapters/poki-offline.js'),path.join(out,'runtime-host.js'));
   report.patches.push({kind:'poki-offline',reason:'Use original SDK rejection branch; advertisements and rewards unavailable',before:hash(html),after:hash(runtimeHTML)});
  }
  const seen=new Map();
  const declared=await entryReferences(runtimeHTML,entry.href);
  report.declaredCode=[...declared.urls];
  const adblock=createAdblock(report,entry.href);
  let preloading=false;
  await context.route('**/*',async route=>{
   const req=route.request();let u;try{u=safeURL(req.url());}catch{return route.abort();}
   if(u.href===entry.href&&req.isNavigationRequest())return route.fulfill({contentType:'text/html',body:runtimeHTML});
   if(u.href===new URL('local-host.js',base).href&&sdk.length)return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,'local-host.js'))});
   if(u.href===new URL('runtime-host.js',base).href&&poki)return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(out,'runtime-host.js'))});
   if(await context.extensionBlock?.(req,{source:input.url})||adblock.block(req))return route.abort('blockedbyclient');
   const declaredScript=req.method()==='GET'&&req.resourceType()==='script'&&declared.urls.has(u.href);
   if(u.origin!==entry.origin&&!declaredScript&&!['image','font','stylesheet','media'].includes(req.resourceType())){report.external.push(u.origin+u.pathname);return route.abort();}
   const task=(async()=>{
    // Fetch and retain bytes before fulfilling the browser request. Large SWFs
    // and WASM modules must not depend on Chromium's inspector response cache.
    const cached=req.method()==='GET'&&['script','stylesheet','image','font','media'].includes(req.resourceType())?require('./capture-cache.cjs').cachedResponse(original,reusable.get(u.href)):null;
    if(cached)report.cache_hits++;
    const res=cached||await followResourceRedirects(async(url,first)=>{
     if(first)return route.fetch({headers:{...req.headers(),referer:input.referer||input.url},maxRedirects:0,timeout:60000});
     if(req.method()!=='GET')throw Error('Resource redirect requires a GET request');
     // Do not forward source-origin credentials to a redirected resource host.
     return context.request.get(url,{headers:{referer:input.referer||input.url},maxRedirects:0,timeout:60000});
    },u.href,report.redirects);
    if(!res.ok()){
     report.missing.push(require('./capture-cache.cjs').classifyMissing(req,res.status(),preloading?'preload':'startup'));
     // Keep the real HTTP failure visible to the game. Capture is not acceptance:
     // save the partial package so offline verification can assess missing resources.
     await route.fulfill({response:res});await res.dispose();return;
    }
    if(Number(res.headers()['content-length']||0)>220*1024*1024)throw Error('Resource exceeds byte budget');
    const script=req.resourceType()==='script',sourceURL=res.url?.()||u.href;
    const file=resourcePath(u.href,base,script),data=await res.body(),sha256=hash(data);
    if(script){
     for(const ref of await references(data.toString('utf8'),sourceURL,declared.mappings))declared.urls.add(ref.url);
    }
    if(seen.has(file)){if(seen.get(file)!==sha256)throw Error('Resource query collision: '+file);}
    else{
     if(seen.size>=1800||total+data.length>220*1024*1024)throw Error('Web snapshot exceeds file/byte budget');
     seen.set(file,sha256);total+=data.length;
     const dest=path.join(original,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);
     report.files.push({url:u.href,path:file,bytes:data.length,sha256,script,sourceURL,contentType:res.headers()['content-type']||'application/octet-stream'});
    }
    let body=data;
    // Fulfilling a redirected response keeps the original browser URL. Restore
    // the final response's module base explicitly while retaining original bytes.
    if(script&&sourceURL!==u.href)body=Buffer.from(await rewriteModules(data.toString('utf8'),sourceURL,declared.mappings,url=>url));
    if(engine==='cocos2'&&file.endsWith('.js')){const adapted=adaptClient(data.toString('utf8'));if(adapted.changed){body=Buffer.from(adapted.text);report.patches.push({file,kind:'existing-client-offline-mode',before:sha256,after:hash(body),reason:'Use the original client offline branch; online sync and rankings unavailable'});}}
    await route.fulfill(cached?{status:200,contentType:cached.headers()['content-type'],body}:{response:res,body});await res.dispose();
   })().catch(async e=>{failure=e.message;await route.abort().catch(()=>{});});
   pending.push(task);await task;
  });
  page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/Failed to load module script|Failed to resolve module specifier/i.test(m.text()))report.errors.push(m.text().slice(0,1500));});
  await page.goto(entry.href,{referer:input.referer||input.url,waitUntil:'domcontentloaded',timeout:60000});
  try{await ready(page,engine);}catch(e){
   report.failure=e.message;report.observed=await state(page,engine).catch(()=>null);
   await screenshot(page,path.join(run,'original-runtime.png')).catch(err=>{report.screenshotError=err.message;});
   throw e;
  }
  if(engine==='cocos2'){
   preloading=true;
   report.preloadErrors=await page.evaluate(async()=>{
    const failures=[],settings=window.__capturedCCSettings||window._CCSettings||{};const names=[...new Set([...(settings.hasResourcesBundle?['resources']:[]),...Object.keys(settings.bundleVers||{})])];
    for(const name of names)await new Promise(resolve=>cc.assetManager.loadBundle(name,e=>{if(e)failures.push(name+': '+String(e));resolve()}));
    const bundles=[];cc.assetManager.bundles.forEach(b=>bundles.push(b));
    for(const b of bundles)await new Promise(resolve=>b.loadDir('',e=>{if(e)failures.push(b.name+': '+String(e));resolve()}));
    return failures;
   });
  }
  await page.waitForTimeout(2000);await Promise.all(pending);if(failure)throw Error(failure);
  report.observed=await state(page,engine);await screenshot(page,path.join(run,'original-runtime.png'));
  for(const f of report.files){const dest=path.join(out,f.path);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(original,f.path),dest);}
  fs.writeFileSync(path.join(out,'index.html'),runtimeHTML);
  if(engine==='ruffle'){
   const csp=`<meta http-equiv="Content-Security-Policy" content="default-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob: data:">`;
   fs.writeFileSync(path.join(out,'index.html'),runtimeHTML.replace('<head>','<head>'+csp));
   report.patches.push({kind:'local-content-policy',reason:'Packaged Flash player may load only local resources; external analytics and navigation are not required game resources'});
  }
  // Change only captured absolute references, relative to each containing file.
  for(const file of ['index.html',...report.files.filter(f=>f.script||/\.(html|js|css|json)$/.test(f.path)).map(f=>f.path)]){
   const dest=path.join(out,file);let text=fs.readFileSync(dest,'utf8'),before=text;
   const source=report.files.find(f=>f.path===file);
   const local=url=>{const item=report.files.find(f=>f.url===url);if(!item)return null;let rel=path.posix.relative(path.posix.dirname(file),item.path);return rel.startsWith('.')?rel:'./'+rel;};
   if(source?.script)text=await rewriteModules(text,source.sourceURL,declared.mappings,local);
   if(file==='index.html')text=await rewriteInlineModules(text,entry.href,declared.mappings,local);
   if(engine==='cocos2'&&file.endsWith('.js'))text=adaptClient(text).text;
   for(const item of report.files){let rel=path.posix.relative(path.posix.dirname(file),item.path);if(!rel.startsWith('.'))rel='./'+rel;text=text.split(item.url).join(rel);}
   if(text!==before){fs.writeFileSync(dest,text);report.patches.push({file,before:hash(before),after:hash(text)});}
  }
  report.bytes=total;report.external=[...new Set(report.external)];
  report.complete=true;
 }catch(error){
  report.failure=error.message;
  if(page){report.observed=await state(page,report.engine).catch(()=>null);await screenshot(page,path.join(run,'original-runtime.png')).catch(()=>{});}
  throw error;
 }finally{await Promise.allSettled(pending);await browser.close();fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify(report,null,2));}
 return report;
}
async function verify(run,actions=[],nextBatch=null,viewportReview=false,environment='deployment'){
 const started=Date.now(),root=path.resolve(run,'converted'),report={passed:false,errors:[],missing:[],external:[],blocked_external:[],required_external:[],steps:[],actions:[],renderDiagnostics:[],resource_requests:[]},acq=JSON.parse(fs.readFileSync(path.join(run,'web-acquisition.json')));
 const adblock=createAdblock(report,acq.url||'https://replica-runtime.invalid/');
 // Only explicit evidence-reviewed decisions from this capture may omit a missing resource.
 const reviewed=(acq.optional_resources||[]).filter(x=>x.capture_key===acq.capture_key&&x.reason&&x.screenshot_sha256);
 report.optional_resources=reviewed;
 const tolerated=new Set(reviewed.map(x=>x.path.replace(/^\/+/, '')));
 fs.mkdirSync(path.join(root,'evidence'),{recursive:true});fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
 const server=http.createServer((req,res)=>{
  let p;try{p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));}catch{res.writeHead(400);return res.end();}
  if(p===root)p=path.join(root,'index.html');
  if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);return res.end();}
  const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.swf':'application/x-shockwave-flash'};
  res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));const transport=`http://127.0.0.1:${server.address().port}`,origin=environment==='localhost'?`http://localhost:${server.address().port}`:'https://replica-runtime.invalid';
 report.environment=environment;report.diagnostic_only=environment==='localhost';
 report.runtime_origin=origin;report.navigation=[];report.navigation_attempts=[];report.navigation_checkpoints=[];
 let phase='startup';
 const navigationCheckpoint=()=>report.navigation_checkpoints.push({phase,elapsed_ms:Date.now()-started,
  status:report.errors.length||report.navigation_attempts.some(n=>!n.allowed)||report.navigation.some(n=>!n.allowed)?'failed':'passed',
  scope:'Observed non-loopback runtime only; not a guarantee for unobserved timers or deployment configurations'});
 let browser,page,context;
 try{
  browser=await require('./extension-browser.cjs').launchBrowser(report);
  const c=context=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block',...proxyOptions()});
  // A virtual HTTPS origin exposes hostname-dependent behaviour without ever
  // contacting that host. Only GET/HEAD resources use the private file server;
  // game POSTs cannot reach a local backend or escape through redirects.
  await c.route('**/*',async r=>{const req=r.request(),u=new URL(req.url());
   if(req.isNavigationRequest()&&req.frame()===page?.mainFrame()){
    const allowed=u.origin===origin&&u.pathname==='/';
    report.navigation_attempts.push({url:u.origin+u.pathname,phase,allowed,elapsed_ms:Date.now()-started});
    if(!allowed){report.errors.push('Unexpected main-frame navigation attempt: '+u.origin+u.pathname);report.blocked_external.push({url:u.origin+u.pathname,type:req.resourceType(),method:req.method()});return r.abort();}
   }
   // Match packaged resources against their recorded source URLs as well.
   const localPath=decodeURIComponent(u.pathname).replace(/^\/+/, '');
   const original=u.origin===origin?(acq.files||[]).find(f=>f.path===localPath)?.url:null;
   const filterDetails={url:original||req.url(),source:acq.url,mainFrame:req.isNavigationRequest()&&req.frame()===page?.mainFrame()};
   if(await c.extensionBlock?.(req,filterDetails)||adblock.block(req,filterDetails))return r.abort('blockedbyclient');
   if(u.origin===origin&&['GET','HEAD'].includes(req.method())){
    // 一个按需分包会带来几百个并发请求；其中一部分会被游戏自己取消，
    // Playwright 此时已把 route 处理掉，再 fulfill 就抛 'Route is already handled'。
    // 这类取消不是运行时缺陷，吞掉即可，否则整个验证会崩在一次竞态上。
    let response;
    try{response=await r.fetch({url:transport+u.pathname+u.search,maxRedirects:0});}
    catch{return;}
    try{await r.fulfill({response});}catch{}
    finally{await response.dispose().catch(()=>{});}
    return;
   }
   if(['data:','blob:'].includes(u.protocol))return r.continue();
   const url=u.origin+u.pathname;
   // Exact request URLs stay in local execution evidence; public error text omits queries.
   if(!report.resource_requests.some(item=>item.url===req.url()&&item.method===req.method()&&item.type===req.resourceType())&&report.resource_requests.length<200)
    report.resource_requests.push({id:'resource-'+(report.resource_requests.length+1),url:req.url(),type:req.resourceType(),method:req.method(),phase});
   report.external.push(url);report.blocked_external.push({url,type:req.resourceType(),method:req.method()});if(['script','stylesheet','image','font','media','document'].includes(req.resourceType()))report.required_external.push(url);return r.abort();
  });
  page=await c.newPage();page.on('pageerror',e=>report.errors.push((e.stack||e.message).slice(0,3000)));   page.on('response',r=>{
   if(r.status()<400)return;
   const local=r.url().replace(origin,'');
   // All 404s remain missing unless a scoped, evidence-backed review has allowed that exact path.
   const rel=decodeURIComponent(local.split('?')[0]).replace(/^\/+/,'');
   if(tolerated.has(rel))return;
   report.missing.push(local);
  });
  page.on('framenavigated',frame=>{if(frame!==page.mainFrame())return;const u=new URL(frame.url()),allowed=u.origin===origin&&u.pathname==='/';report.navigation.push({url:u.origin+u.pathname,phase,allowed,elapsed_ms:Date.now()-started});if(!allowed)report.errors.push('Unexpected main-frame navigation: '+u.origin+u.pathname);});
  c.on('page',popup=>{if(popup!==page){report.errors.push('Unexpected popup during runtime verification');popup.close().catch(()=>{});}});
  page.on('console',m=>{if(m.type()==='error'&&/Failed to load module script|Failed to resolve module specifier/i.test(m.text()))report.errors.push(m.text().slice(0,1500));});
  page.on('console',m=>{const text=m.text();if(report.renderDiagnostics.length<40&&/renderer|webgl|webgpu|adapter|panic/i.test(text))report.renderDiagnostics.push(text.slice(0,500));});
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  let missingProbe;
  // 资源缺失常常先表现为引擎断言（Cocos 的 Assert 1205 之类）。早先脚本错误
  // 优先判定，一崩溃就立刻失败，那些还没收集完的 404 就永远进不了缺失清单，
  // repairResources 也就无从补齐——任务只能反复 blocked 在同一处。
  // 因此先按缺失处理：补齐后重跑，若仍报脚本错误再如实失败。
  let playable=false,playError;
  try{await Promise.race([gameplayReady(page,acq.engine),new Promise((resolve,reject)=>{missingProbe=setInterval(()=>{if(report.missing.length)reject(Error('Missing local runtime resources'));},500);})]);playable=true;}
  catch(e){playError=e;}
  finally{clearInterval(missingProbe);}
  // 脚本错误不再抢在"能不能玩"之前判死。上游包常自带非致命报错（典型是广告
  // 模块引用了未声明的变量，原站线上同样报 ReferenceError 但照样进主菜单），
  // 一崩就 reject 会让这类任务反复 blocked。改由 gameplayReady 裁定：确实
  // 进得了主菜单的，报错降为告警；玩不了的，再如实判失败。
  if(playable)settleNonFatalRuntime(report);
  if(report.errors.length)throw Error('Runtime script error: '+report.errors[0]);
  if(playError)throw playError;
  // Splash 出现只是引擎就绪；主菜单/玩法所需的二级资源（Cocos 的 Config、
  // 预制体、语言包等）要等引擎继续初始化才会请求。等待太浅时这些 404
  // 不会进入 missing，repairResources 就永远没机会补齐它们，任务会在
  // reconstruct 阶段被 AI 以“进入不了主菜单”阻断（4k99 贪吃蛇实例）。
  await page.waitForTimeout(20000);
  navigationCheckpoint();
  settleNonFatalRuntime(report);
  if(report.errors.length||report.required_external.length)throw Error(offlineFailure(report));
  report.steps.push({...await state(page,acq.engine),storage:await storageEvidence(page)});await screenshot(page,path.join(root,'screenshots/startup.png'));
  if(viewportReview){
   const config=JSON.parse(fs.readFileSync(path.join(root,'runtime-viewport.json'),'utf8'));
   report.viewport_checks=[];
   for(const [width,height] of [[1000,760],[390,844],[844,390]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(800);
    const geometry=await page.evaluate(()=>{
     const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
     return {frame:rect(document.getElementById('ReplicaGameFrame')),canvas:rect(document.querySelector('canvas'))};
    });
    const {frame,canvas}=geometry;
    const fits=r=>r.x>=-1&&r.y>=-1&&r.x+r.width<=width+1&&r.y+r.height<=height+1;
    const passed=fits(frame)&&fits(canvas)&&Math.abs(frame.width/frame.height-config.width/config.height)<.004&&Math.abs(canvas.width/canvas.height-config.width/config.height)<.004;
    const shot=`screenshots/viewport-${width}x${height}.png`;await screenshot(page,path.join(root,shot));
    report.viewport_checks.push({width,height,...geometry,passed,screenshot:shot});
    if(!passed)throw Error('Runtime viewport is cropped or distorted');
   }
   await page.setViewportSize({width:1000,height:760});await page.waitForTimeout(400);
  }
  // The initial session prefix is already recorded in its immutable baseline.
  // Replay every input and observe state, but capture its final checkpoint only.
  // New AI actions retain per-step screenshots. Never treat old copied images as fresh.
  let batch=actions,replaying=!!nextBatch;
  report.replay_action_count=replaying?actions.length:0;
  report.captured_screenshots=['screenshots/startup.png'];
  while(batch!==null){
  if(!Array.isArray(batch)||report.actions.length+batch.length>(nextBatch?300:20))throw Error('Invalid actions');
  for(const requested of batch){
   let a={...requested};
   phase=a.type==='reload'?'reload':'interaction';
   const i=report.actions.length;
   const bounds=page.viewportSize();
   const storageBeforeReload=a.type==='reload'?await storageEvidence(page):null;
   if(a.type==='click'&&Number.isFinite(a.x)&&Number.isFinite(a.y)&&a.x>=0&&a.x<=bounds.width&&a.y>=0&&a.y<=bounds.height){
    a.hold_ms=Math.max(80,Math.min(1000,Number(a.hold_ms)||100));
    await page.mouse.click(a.x,a.y,{delay:a.hold_ms});
   }
   else if(a.type==='key'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Enter','w','a','s','d','r','p','Shift','Escape'].includes(a.key)){
    const hold=Math.max(0,Math.min(10000,Number(a.hold_ms)||0));
    await page.keyboard.down(a.key);try{if(hold)await page.waitForTimeout(hold);}finally{await page.keyboard.up(a.key);}
   }
   else if(a.type==='drag'&&[a.x,a.y,a.to_x,a.to_y].every(Number.isFinite)&&a.x>=0&&a.x<=bounds.width&&a.to_x>=0&&a.to_x<=bounds.width&&a.y>=0&&a.y<=bounds.height&&a.to_y>=0&&a.to_y<=bounds.height){await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(a.to_x,a.to_y,{steps:12});await page.waitForTimeout(Math.max(100,Math.min(3000,a.hold_ms||300)));await page.mouse.up();}
   else if(a.type==='viewport'&&[[1000,760],[390,844],[844,390]].some(([w,h])=>a.width===w&&a.height===h)){await page.setViewportSize({width:a.width,height:a.height});}
   else if(a.type==='wait'){}
   else if(a.type==='reload'){await page.reload({waitUntil:'domcontentloaded'});await gameplayReady(page,acq.engine);}
   else throw Error('Unsupported input action');
   await page.waitForTimeout(Math.max(a.type==='reload'?5000:200,Math.min(10000,a.wait_ms||1500)));
   navigationCheckpoint();
   settleNonFatalRuntime(report);
   if(report.errors.length||report.required_external.length)throw Error(offlineFailure(report));
   report.actions.push(a);
   const observed={...await state(page,acq.engine),elapsed_ms:Date.now()-started,storage:await storageEvidence(page)};
   if(storageBeforeReload)observed.storage_before_reload=storageBeforeReload;
   report.steps.push(observed);
   if(a.expect_labels){if(!Array.isArray(a.expect_labels)||!a.expect_labels.length||!a.expect_labels.every(text=>typeof text==='string'&&observed.labels.some(l=>l.text.includes(text))))throw Error('Expected Cocos labels not observed');}
   if(!replaying){
    const shot='screenshots/step-'+i+'.png';await screenshot(page,path.join(root,shot));
    observed.screenshot=shot;report.captured_screenshots.push(shot);
   }
  }
  // Denied API/telemetry attempts remain dependency evidence. Their necessity
  // must be assessed by actual gameplay; an attempted request is not a transfer.
  settleNonFatalRuntime(report);
  report.passed=!report.errors.length&&!report.missing.length&&!report.required_external.length;
  if(!report.passed)throw Error('Offline check failed: '+JSON.stringify({errors:report.errors,missing:report.missing,external:report.external}));
  if(!nextBatch)break;
  report.observed={...await state(page,acq.engine),elapsed_ms:Date.now()-started,storage:await storageEvidence(page)};
  await screenshot(page,path.join(root,'screenshots/current.png'));
  if(!report.captured_screenshots.includes('screenshots/current.png'))report.captured_screenshots.push('screenshots/current.png');
  fs.writeFileSync(path.join(root,'evidence/runtime.json'),JSON.stringify(report,null,2));
  replaying=false;
  batch=await nextBatch(report);
  }
 }catch(e){report.passed=false;report.failure=e.message;if(e.readiness)report.readiness=e.readiness;report.issues=runtimeIssues(report);if(page){report.lastObserved=await state(page,acq.engine).catch(()=>null);await screenshot(page,path.join(root,'screenshots/failed.png')).catch(()=>{});}throw e;}
 finally{fs.writeFileSync(path.join(root,'evidence/runtime.json'),JSON.stringify(report,null,2));if(!report.passed&&report.failure&&nextBatch?.onFailure)nextBatch.onFailure();if(context)await context.unrouteAll({behavior:'wait'});if(browser)await browser.close();await new Promise(r=>server.close(r));}
 return report;
}
async function repairResources(run){
 const root=path.join(run,'converted'),file=path.join(run,'web-acquisition.json'),acq=JSON.parse(fs.readFileSync(file)),runtime=JSON.parse(fs.readFileSync(path.join(root,'evidence/runtime.json')));
 const base=new URL('.',safeURL(acq.url)).href,missing=[...new Set(runtime.missing||[])];
 // 按需加载的引擎分包（Cocos 的 assets/<bundle>、Unity 的 StreamingAssets 等）
 // 一次运行就会成批 404：3D贪吃蛇的 Game 分包有 300+ import 与 native 文件。
 // 100 的旧上限会让补齐永远收敛不了，任务只能 blocked。
 if(!missing.length||missing.length>600)throw Error('Missing-resource repair exceeds batch limit');
 const prior=acq.resource_refreshes||[],added=[];let bytes=0;
 if(prior.reduce((n,r)=>n+r.files.length,0)+missing.length>2000)throw Error('Resource repair exceeds task limit');
 const client=await request.newContext({...proxyOptions(),...sessionOptions(acq.url),extraHTTPHeaders:{Referer:acq.referer||acq.url}});
 try{
  for(const local of missing){
   if(typeof local!=='string'||!local.startsWith('/')||local.startsWith('//'))throw Error('Invalid observed resource path');
   const url=safeURL(new URL(local.slice(1),base).href),relative=resourcePath(url.href,base);
   if(url.origin!==new URL(base).origin||relative!==decodeURIComponent(local.split('?')[0].slice(1))||relative.startsWith('_remote/'))throw Error('Resource repair must remain in the observed original directory');
   const dest=path.resolve(root,relative);
   if(!dest.startsWith(path.resolve(root)+path.sep))throw Error('Resource repair cannot write outside the package');
   // A path already on disk is not a repair. Throwing here used to kill the
   // whole attempt loop: one entry that the page kept re-reporting (a cancelled
   // request, or a fetch that raced the previous write) aborted every remaining
   // round, so a package that had already run cleanly still ended up blocked.
   if(fs.existsSync(dest)){(acq.repaired_present=acq.repaired_present||[]).push(relative);continue;}
   acq.redirects=acq.redirects||[];
   const response=await followResourceRedirects(value=>client.get(value,{maxRedirects:0,timeout:30000}),url.href,acq.redirects);
   // Keep unavailable resources for evidence-based review; never infer optionality from extension.
   if(!response.ok()){
    const entry={url:url.href,path:relative,http_status:response.status()};
    (acq.unavailable=acq.unavailable||[]).push(entry);
    await response.dispose();continue;
   }
   if(Number(response.headers()['content-length']||0)>20*1024*1024)throw Error('Resource exceeds repair byte limit');
   const data=await response.body();
   if(data.length>20*1024*1024)throw Error('Resource exceeds repair byte limit');
   if((acq.bytes||0)+bytes+data.length>220*1024*1024||acq.files.length+added.length>=1800)throw Error('Resource repair exceeds snapshot limits');
   if(bytes+data.length>30*1024*1024){
    await response.dispose();
    if(!added.length)throw Error('Resource exceeds repair batch limit');
    break;
   }
   bytes+=data.length;
   fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data);
   const original=path.join(run,'web-original',relative);fs.mkdirSync(path.dirname(original),{recursive:true});fs.writeFileSync(original,data);
   added.push({url:url.href,path:relative,bytes:data.length,sha256:hash(data)});await response.dispose();
  }
 }finally{
  await client.dispose();
  // Save original-source failures even when no resources could be downloaded.
  if(added.length||acq.unavailable||acq.repaired_present){
   acq.files.push(...added);acq.bytes=(acq.bytes||0)+added.reduce((n,f)=>n+f.bytes,0);
   acq.resource_refreshes=[...prior,{files:added,observed_missing:missing,reason:runtime.failure}];
   fs.writeFileSync(file,JSON.stringify(acq,null,2));fs.writeFileSync(path.join(root,'evidence/acquisition.json'),JSON.stringify(acq,null,2));
  }
 }
 return added;
}
module.exports={safeURL,resourcePath,detect,ruffleEntry,adaptClient,capture,verify,repairResources,screenshot,followResourceRedirects,gameplayReady};
if(require.main===module){const [mode,input,run]=process.argv.slice(2);(async()=>{
 const data=JSON.parse(fs.readFileSync(input,'utf8'));let lines,nextBatch,desired=[...(data.actions||[])];
 if(mode==='session'){
  lines=require('node:readline').createInterface({input:process.stdin});const iterator=lines[Symbol.asyncIterator]();
  nextBatch=async()=>{console.log(JSON.stringify({event:'snapshot'}));const line=await iterator.next();const batch=line.done?null:JSON.parse(line.value).actions;if(Array.isArray(batch))desired.push(...batch);return batch;};
  nextBatch.onFailure=()=>console.log(JSON.stringify({event:'snapshot'}));
 }
 try{
  let r;
  if(mode==='capture')r=await capture(data,run);
  // Cocos 按需分包一次只暴露几个新 404，8 轮经常在收敛前就用完预算，任务只能
  // 交给 auto_repair 再重试一轮（多花一次诊断，也可能被判 stop）。放宽到 20 轮，
  // 让补齐在同一条链路里走完。
  else for(let attempt=0;attempt<20;attempt++){
   try{r=await verify(run,desired,nextBatch,mode==='viewport',mode==='diagnose-localhost'?'localhost':'deployment');break;}
   catch(e){
    const runtime=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json'))),acq=JSON.parse(fs.readFileSync(path.join(run,'web-acquisition.json')));
    if(mode==='diagnose-localhost'||attempt>=19||!runtime.missing?.length||!acq.url)throw e;
    fs.writeFileSync(path.join(run,'converted/evidence','resource-check-'+Date.now()+'.json'),JSON.stringify(runtime,null,2));
    const added=await repairResources(run);
    if(!added.length)throw e; // No download progress: hand evidence to AI, don't repeat 20 identical passes.
   }
  }
  console.log(JSON.stringify({engine:r.engine,passed:r.passed,complete:r.complete}));
 }
 finally{if(lines)lines.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});}
