// AI-selected interaction with an already observed public DOM entry.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {safeURL,screenshot}=require('./discovered-web.cjs');
async function snapshot(page){
 return page.evaluate(()=>({text:document.body.innerText.slice(0,20000),
  canvases:[...document.querySelectorAll('canvas')].slice(0,20).map(n=>{const r=n.getBoundingClientRect();return {width:n.width,height:n.height,visible:r.width>0&&r.height>0&&getComputedStyle(n).visibility!=='hidden'};}),
  controls:[...document.querySelectorAll('button,[role="button"]')].filter(n=>{
   const r=n.getBoundingClientRect(),s=getComputedStyle(n);
   return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!n.disabled;
  }).map(n=>(n.innerText||n.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,80)}));
}
async function visibleFrame(frame,page){
 for(let current=frame;current!==page.mainFrame();current=current.parentFrame()){
  if(!current)return false;
  const element=await current.frameElement(),box=await element.boundingBox();
  if(!box||box.width<200||box.height<150||!await element.isVisible())return false;
  if(!await element.evaluate(n=>{const r=n.getBoundingClientRect();return getComputedStyle(n).opacity!=='0'&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===n;}))return false;
 }
 return true;
}
async function frameEntries(page){
 const entries=[];
 for(const frame of page.frames().slice(0,30)){
  try{
   safeURL(frame.url());
   if(!await visibleFrame(frame,page))continue;
   const canvases=await frame.locator('canvas').evaluateAll(nodes=>nodes.filter(n=>{
    const r=n.getBoundingClientRect(),s=getComputedStyle(n);
    return n.width>0&&n.height>0&&r.width>=200&&r.height>=150&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'
      &&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===n;
   }).length);
   if(canvases)entries.push({url:frame.url(),referer:frame.parentFrame()?.url()||page.url(),canvas_count:canvases,evidence:'rendered-canvas'});
  }catch{}
 }
 return entries;
}
async function nestedDOM(page){
 const frames=[];
 for(const frame of page.frames().slice(1,30)){
  try{
   safeURL(frame.url());
   if(!await visibleFrame(frame,page))continue;
   frames.push({url:frame.url(),referer:frame.parentFrame()?.url()||page.url(),...await snapshot(frame)});
  }catch{}
 }
 return frames;
}
async function verifyInteraction(page,label,dir,{waitMs=20000}={}){
 if(!Number.isInteger(waitMs)||waitMs<0||waitMs>20000)throw Error('Invalid interaction observation deadline');
 if(typeof label!=='string'||!label.trim()||label.length>160)throw Error('Invalid observed control label');
 const before=await snapshot(page),url=page.url();
 if(!before.controls.includes(label))throw Error('Control is not visible in current entry');
 const control=page.getByRole('button',{name:label,exact:true});
 if(await control.count()!==1)throw Error('DOM control is ambiguous');
 if(await control.evaluate(n=>!!n.closest('a,form')||/(login|sign.?in|purchase|buy|payment|consent|cookie|privacy|agree|accept|登录|购买|支付|同意|授权)/i.test([n.innerText,n.id,n.className,n.getAttribute('aria-label')].join(' '))))throw Error('Control is outside game interaction scope');
 const priorEntries=await frameEntries(page);
 const priorFrames=await nestedDOM(page);
 await screenshot(page,path.join(dir,'before.png'));
 await control.click({timeout:5000,noWaitAfter:true});
 const started=Date.now(),observations=[];
 let after,transition=false,entries=[],frames=[],domEntries=[];
 do{
  after=await snapshot(page);
  entries=await frameEntries(page);
  frames=await nestedDOM(page);
  domEntries=frames.filter(f=>f.text.trim()&&f.controls.length&&!/(?:loading|decompressing|initializing|加载中|解压中)/i.test(f.text)
    &&!priorFrames.some(p=>p.url===f.url&&p.text===f.text));
  observations.push({elapsed_ms:Date.now()-started,url:page.url(),...after,entries,frames});
  const loading=/(?:loading|decompressing|initializing|加载中|解压中)/i.test(after.text);
  transition=!!after.text.trim()&&after.text!==before.text&&after.controls.length>0&&!loading;
  // Canvas evidence hands off to the existing canvas converter, never the DOM contract.
  const newCanvas=entries.length===1&&!priorEntries.some(e=>e.url===entries[0].url);
  if(page.url()!==url||transition||newCanvas||domEntries.length||Date.now()-started>=waitMs)break;
  await page.waitForTimeout(Math.max(0,Math.min(500,waitMs-(Date.now()-started))));
 }while(true);
 const newEntries=entries.filter(e=>!priorEntries.some(p=>p.url===e.url));
 const evidence={url,label,before,after,observations,frames,entries:newEntries,elapsed_ms:Date.now()-started};
 fs.writeFileSync(path.join(dir,'transition.json'),JSON.stringify(evidence,null,2));
 await screenshot(page,path.join(dir,'after.png'));
 if(page.url()!==url)throw Error('DOM interaction navigated away from observed entry');
 if(newEntries.length>1)throw Error('Multiple visible canvas entries after interaction; cannot select a game automatically');
 if(newEntries.length===1)return {passed:true,...evidence,kind:'canvas-entry',scope:'Observed nested canvas entry only; resource capture, offline gameplay verification and acceptance still required'};
 if(domEntries.length>1)throw Error('Multiple visible DOM entries after interaction; cannot select a game automatically');
 if(domEntries.length===1)return {passed:true,...evidence,kind:'nested-dom',wrapper_url:url,url:domEntries[0].url,referer:domEntries[0].referer,
  scope:'Observed nested DOM transition only; offline gameplay acceptance remains required'};
 if(!transition)throw Error('DOM interaction did not produce a verifiable interface transition; see transition.json for loading and canvas observations');
 return {passed:true,...evidence,scope:'Observed DOM transition only; offline gameplay acceptance remains required'};
}
async function probe(url,label,dir,referer){
 safeURL(url);fs.mkdirSync(dir,{recursive:true});
  if(referer)safeURL(referer);
 const browser=await chromium.launch(require('./browser-options.cjs')());
 const report={passed:false,url,label,referer,errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:false});
  await context.route('**/*',route=>{try{if(!/^(data|blob):/.test(route.request().url()))safeURL(route.request().url());return route.continue();}catch{return route.abort();}});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const response=await page.goto(url,{referer,waitUntil:'domcontentloaded',timeout:45000});
  if(!response?.ok())throw Error('DOM entry HTTP '+response?.status());
  await page.getByRole('button',{name:label,exact:true}).waitFor({state:'visible',timeout:15000});
  Object.assign(report,await verifyInteraction(page,label,dir));
  if(report.errors.length)throw Error('DOM entry has script errors');
 }catch(e){report.passed=false;report.failure=e.message;throw e;}
 finally{fs.writeFileSync(path.join(dir,'interaction.json'),JSON.stringify(report,null,2));await browser.close();}
 return report;
}
module.exports={verifyInteraction,probe};
if(require.main===module)probe(...process.argv.slice(2)).catch(e=>{console.error(e.stack);process.exitCode=1;});
