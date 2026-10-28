// 取证：4k99 登录弹窗填写了站点自动生成的游客账号，点"登录"后游戏是否可运行。
const {chromium}=require('../executors/node_modules/playwright');
const url=process.argv[2]||'https://www.4k99.com/detail/17721';
const proxyServer=process.env.HTTPS_PROXY||process.env.HTTP_PROXY||'';
const proxyOptions=()=>proxyServer?{proxy:{server:proxyServer,bypass:'127.0.0.1,localhost,[::1]'}}:{};
const dump=async(page,label)=>{
  const info=await page.evaluate(()=>{
    const frames=[...document.querySelectorAll('iframe')].map(f=>{
      const r=f.getBoundingClientRect();
      let inner=-1;try{inner=f.contentDocument?f.contentDocument.querySelectorAll('canvas').length:-1;}catch(e){inner=-2;}
      return {src:(f.src||'').slice(0,120),w:Math.round(r.width),h:Math.round(r.height),canvas:inner};
    });
    return {own:document.querySelectorAll('canvas').length,frames};
  });
  console.log(`\n[${label}] 本页canvas=${info.own} iframe=${info.frames.length}`);
  info.frames.forEach(f=>console.log(`   iframe ${f.w}x${f.h} canvas=${f.canvas} ${f.src}`));
  return info;
};
(async()=>{
 const browser=await chromium.launch({headless:true,...proxyOptions()});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:900},...proxyOptions()});
  const page=await context.newPage();
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(6000);
  await page.evaluate(()=>document.querySelector('button.js-game-start')?.click());
  await page.waitForTimeout(5000);
  await dump(page,'点开始后');
  const login=await page.evaluate(()=>{
    for(const f of document.querySelectorAll('iframe')){
      if(!/modal\/Login/i.test(f.src||''))continue;
      const d=f.contentDocument;if(!d)continue;
      const btn=[...d.querySelectorAll('button,a,div,span')].find(e=>/^\s*登\s*录\s*$/.test((e.innerText||'').trim()));
      if(btn){btn.click();return {clicked:(btn.innerText||'').trim(),tag:btn.tagName};}
      return {clicked:null,buttons:[...d.querySelectorAll('button')].map(b=>(b.innerText||'').trim().slice(0,10))};
    }
    return null;
  });
  console.log('\n登录弹窗内点击：',JSON.stringify(login));
  for(const w of [6000,10000,15000]){
    await page.waitForTimeout(w);
    await dump(page,`登录后累计 +${w/1000}s`);
  }
  await page.screenshot({path:'qa-output/probe-4k99-after-login.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error('探针失败',e.message);process.exit(1)});
