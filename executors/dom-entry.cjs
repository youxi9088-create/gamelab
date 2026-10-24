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
async function verifyInteraction(page,label,dir,{waitMs=20000}={}){
 if(!Number.isInteger(waitMs)||waitMs<0||waitMs>20000)throw Error('Invalid interaction observation deadline');
 if(typeof label!=='string'||!label.trim()||label.length>160)throw Error('Invalid observed control label');
 const before=await snapshot(page),url=page.url();
 if(!before.controls.includes(label))throw Error('Control is not visible in current entry');
 const control=page.getByRole('button',{name:label,exact:true});
 if(await control.count()!==1)throw Error('DOM control is ambiguous');
 if(await control.evaluate(n=>!!n.closest('a,form')||/(login|sign.?in|purchase|buy|payment|consent|cookie|privacy|agree|accept|登录|购买|支付|同意|授权)/i.test([n.innerText,n.id,n.className,n.getAttribute('aria-label')].join(' '))))throw Error('Control is outside game interaction scope');
 await screenshot(page,path.join(dir,'before.png'));
 await control.click({timeout:5000,noWaitAfter:true});
 const started=Date.now(),observations=[];
 let after,transition=false;
 do{
  after=await snapshot(page);
  observations.push({elapsed_ms:Date.now()-started,url:page.url(),...after});
  const loading=/(?:loading|decompressing|initializing|加载中|解压中)/i.test(after.text);
  transition=!!after.text.trim()&&after.text!==before.text&&after.controls.length>0&&!loading;
  if(page.url()!==url||transition||Date.now()-started>=waitMs)break;
  await page.waitForTimeout(Math.max(0,Math.min(500,waitMs-(Date.now()-started))));
 }while(true);
 const evidence={url,label,before,after,observations,elapsed_ms:Date.now()-started};
 fs.writeFileSync(path.join(dir,'transition.json'),JSON.stringify(evidence,null,2));
 await screenshot(page,path.join(dir,'after.png'));
 if(page.url()!==url)throw Error('DOM interaction navigated away from observed entry');
 if(!transition)throw Error('DOM interaction did not produce a verifiable interface transition; see transition.json for loading and canvas observations');
 return {passed:true,...evidence,scope:'Observed DOM transition only; offline gameplay acceptance remains required'};
}
async function probe(url,label,dir){
 safeURL(url);fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch(require('./browser-options.cjs')());
 const report={passed:false,url,label,errors:[]};
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:false});
  await context.route('**/*',route=>{try{if(!/^(data|blob):/.test(route.request().url()))safeURL(route.request().url());return route.continue();}catch{return route.abort();}});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
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
