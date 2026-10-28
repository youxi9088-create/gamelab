// 人工登录取证：开一个与平台同款的有头 chromium，由人工完成登录，
// 持续把 storageState（cookies + localStorage）落盘，供后续采集复用。
// 平台不做自动注册、不伪造登录态；登录行为由账号持有者本人完成。
const fs=require('fs'), path=require('path');
const {chromium}=require('../executors/node_modules/playwright');
const [host,startUrl,minutesArg]=process.argv.slice(2);
const ROOT=path.resolve(__dirname,'..');
const target=path.join(ROOT,'data','browser-sessions',host+'.json');
const minutes=Number(minutesArg||15);
(async()=>{
 fs.mkdirSync(path.dirname(target),{recursive:true});
 const options=require(path.join(ROOT,'executors','browser-options.cjs'))();
 const browser=await chromium.launch({...options,headless:false});
 const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block',acceptDownloads:false});
 const page=await context.newPage();
 await page.goto(startUrl,{waitUntil:'domcontentloaded',timeout:60000});
 const deadline=Date.now()+minutes*60000;
 let last=0;
 console.log('浏览器已打开：'+startUrl,flush=true);
 console.log('请在这个窗口里完成登录（最多等待 '+minutes+' 分钟）。存档文件：'+target,flush=true);
 while(Date.now()<deadline){
  await new Promise(r=>setTimeout(r,3000));
  let state;
  try{state=await context.storageState();}catch(e){continue;}
  const n=state.cookies.filter(c=>c.value).length;
  fs.writeFileSync(target,JSON.stringify(state,null,2));
  if(n!==last){console.log(`[${new Date().toLocaleTimeString()}] 已记录 cookie ${n} 个`,flush=true);last=n;}
 }
 console.log('登录窗口结束，最后一次状态已写入 '+target,flush=true);
 await browser.close();
})().catch(e=>{console.error('登录取证失败：',e.message);process.exit(1)});
