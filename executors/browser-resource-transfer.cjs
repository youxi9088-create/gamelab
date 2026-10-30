// Use Chromium's network stack when the API transport resets a public GET.
async function fetchResource(browser,url,validate){
 validate(url);
 const context=await browser.newContext({serviceWorkers:'block'});
 try{
  const document=new URL('/.gamelab-resource-transfer',url).href;
  await context.route('**/*',async route=>{
   try{validate(route.request().url());}catch{return route.abort();}
   if(route.request().url()===document&&route.request().isNavigationRequest())return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Resource transfer</title>'});
   return route.continue();
  });
  const page=await context.newPage();await page.goto(document,{timeout:20000});
  const result=await page.evaluate(async address=>{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
   try{
    const response=await fetch(address,{credentials:'omit',signal:controller.signal});
    if(Number(response.headers.get('content-length'))>20*1024*1024)throw Error('Browser resource exceeds byte limit');
    const reader=response.body.getReader(),parts=[];let size=0;
    for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>20*1024*1024){await reader.cancel();throw Error('Browser resource exceeds byte limit');}parts.push(value);}
    let binary='';for(const part of parts)for(let i=0;i<part.length;i+=8192)binary+=String.fromCharCode(...part.subarray(i,i+8192));
    return {status:response.status,url:response.url,headers:Object.fromEntries(response.headers),data:btoa(binary)};
   }finally{clearTimeout(timer);}
  },url);
  validate(result.url);const body=Buffer.from(result.data,'base64');
  return {ok:()=>result.status>=200&&result.status<300,status:()=>result.status,url:()=>result.url,headers:()=>result.headers,body:async()=>body,dispose:async()=>{},browserTransfer:true};
 }finally{await context.close();}
}
module.exports={fetchResource};
if(require.main===module){
 const {chromium}=require('playwright'),{safeURL}=require('./discovered-web.cjs');
 (async()=>{const browser=await chromium.launch(require('./browser-options.cjs')());try{
  const response=await fetchResource(browser,process.argv[2],safeURL);
  process.stdout.write(JSON.stringify({status:response.status(),headers:response.headers(),data:(await response.body()).toString('base64')}));
 }finally{await browser.close()}})().catch(e=>{process.stderr.write(e.message);process.exitCode=1});
}
