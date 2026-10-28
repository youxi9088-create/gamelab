// 取证探针：4k99 详情页必须点击 button.js-game-start 才会加载游戏。
const {chromium}=require('../executors/node_modules/playwright');
const url=process.argv[2]||'https://www.4k99.com/detail/17721';
const proxyServer=process.env.HTTPS_PROXY||process.env.HTTP_PROXY||'';
const proxyOptions=()=>proxyServer?{proxy:{server:proxyServer,bypass:'127.0.0.1,localhost,[::1]'}}:{};
const dump=async(page,label)=>{
  const info=await page.evaluate(()=>{
    const frames=[...document.querySelectorAll('iframe')].map(f=>{
      const r=f.getBoundingClientRect();
      let inner=0;
      try{inner=f.contentDocument?f.contentDocument.querySelectorAll('canvas').length:-1;}catch(e){inner=-2;}
      return {src:(f.src||f.getAttribute('data-src')||'').slice(0,130),w:Math.round(r.width),h:Math.round(r.height),canvas:inner};
    });
    return {url:location.href,own:document.querySelectorAll('canvas').length,frames};
  });
  console.log(`\n[${label}] 本页canvas=${info.own} iframe=${info.frames.length} url=${info.url.slice(0,90)}`);
  info.frames.forEach(f=>console.log(`   iframe ${f.w}x${f.h} canvas=${f.canvas} ${f.src}`));
  return info;
};
(async()=>{
 const browser=await chromium.launch({headless:true,...proxyOptions()});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:900},...proxyOptions()});
  context.on('page',p=>console.log('!! 新窗口打开:',p.url().slice(0,120)));
  const page=await context.newPage();
  page.on('popup',p=>console.log('!! popup:',p.url().slice(0,120)));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(6000);
  await dump(page,'初始 6s');
  const clicked=await page.evaluate(()=>{
    const b=document.querySelector('button.js-game-start,.js-game-start');
    if(!b)return null;b.click();return b.className;
  });
  console.log('\n点击 button.js-game-start:',JSON.stringify(clicked));
  for(const wait of [5000,10000,15000]){
    await page.waitForTimeout(wait);
    await dump(page,`点击后累计 +${wait/1000}s`);
  }
  await page.screenshot({path:'qa-output/probe-4k99-started.png'});
  console.log('\n窗口数:',context.pages().length);
  for(const p of context.pages())if(p!==page)console.log('  新页:',p.url().slice(0,120));
 }finally{await browser.close();}
})().catch(e=>{console.error('探针失败',e.message);process.exit(1)});
