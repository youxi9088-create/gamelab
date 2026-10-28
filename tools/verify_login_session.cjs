// 用人工登录留下的 storageState，验证站点是否真的放行游戏（能否出可运行画面）。
const fs=require('fs'), path=require('path');
const {chromium}=require('../executors/node_modules/playwright');
const ROOT=path.resolve(__dirname,'..');
const [host,...urls]=process.argv.slice(2);
const stateFile=path.join(ROOT,'data','browser-sessions',host+'.json');
const proxyServer=process.env.HTTPS_PROXY||process.env.HTTP_PROXY||'';
const proxyOptions=()=>proxyServer?{proxy:{server:proxyServer,bypass:'127.0.0.1,localhost,[::1]'}}:{};
const countCanvas=async(page)=>{
  let n=0;
  for(const f of page.frames()){
    try{n+=await f.evaluate(()=>document.querySelectorAll('canvas').length);}catch(e){}
  }
  return n;
};
(async()=>{
 if(!fs.existsSync(stateFile))throw Error('没有登录态文件：'+stateFile);
 const state=JSON.parse(fs.readFileSync(stateFile,'utf-8'));
 console.log(`登录态：${state.cookies.length} 个 cookie`);
 const browser=await chromium.launch({headless:true,...proxyOptions()});
 try{
  for(const url of urls){
   const context=await browser.newContext({storageState:state,viewport:{width:1280,height:900},
     serviceWorkers:'block',acceptDownloads:false,...proxyOptions()});
   const page=await context.newPage();
   try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(6000);
    await page.evaluate(()=>document.querySelector('button.js-game-start,.js-game-start')?.click());
    await page.waitForTimeout(16000);
    const frames=[];
    for(const f of page.frames())if(f!==page.mainFrame())frames.push((f.url()||'').slice(0,110));
    const loginModal=frames.filter(u=>/modal\/Login/i.test(u));
    console.log(`\n=== ${url}`);
    console.log('   canvas 总数:',await countCanvas(page));
    console.log('   iframe:',JSON.stringify(frames.slice(0,5),null,0));
    console.log('   登录弹窗:',loginModal.length?'仍在（登录态没生效）':'没有出现');
    console.log('   结论:',(await countCanvas(page))>0?'✅ 出画面，登录态有效':'❌ 仍无画面');
   }catch(e){console.log(`\n=== ${url}\n   失败: ${e.message.slice(0,90)}`);}
   finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error('验证失败：',e.message);process.exit(1)});
