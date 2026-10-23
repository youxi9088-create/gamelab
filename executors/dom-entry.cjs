// AI-selected interaction with an already observed public DOM entry.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {safeURL,screenshot}=require('./discovered-web.cjs');
async function snapshot(page){
 return page.evaluate(()=>({text:document.body.innerText.slice(0,20000),
  controls:[...document.querySelectorAll('button,[role="button"]')].filter(n=>{
   const r=n.getBoundingClientRect(),s=getComputedStyle(n);
   return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!n.disabled;
  }).map(n=>(n.innerText||n.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,80)}));
}
async function verifyInteraction(page,label,dir){
 if(typeof label!=='string'||!label.trim()||label.length>160)throw Error('Invalid observed control label');
 const before=await snapshot(page),url=page.url();
 if(!before.controls.includes(label))throw Error('Control is not visible in current entry');
 const control=page.getByRole('button',{name:label,exact:true});
 if(await control.count()!==1)throw Error('DOM control is ambiguous');
 if(await control.evaluate(n=>!!n.closest('a,form')||/(login|sign.?in|purchase|buy|payment|consent|cookie|privacy|agree|accept|登录|购买|支付|同意|授权)/i.test([n.innerText,n.id,n.className,n.getAttribute('aria-label')].join(' '))))throw Error('Control is outside game interaction scope');
 await screenshot(page,path.join(dir,'before.png'));
 await control.click({timeout:5000,noWaitAfter:true});
 await page.waitForTimeout(1200);
 const after=await snapshot(page);
 await screenshot(page,path.join(dir,'after.png'));
 if(page.url()!==url)throw Error('DOM interaction navigated away from observed entry');
 if(!after.text.trim()||after.text===before.text||!after.controls.length)throw Error('DOM interaction did not produce a verifiable interface transition');
 return {passed:true,url,label,before,after,scope:'Observed DOM transition only; offline gameplay acceptance remains required'};
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
