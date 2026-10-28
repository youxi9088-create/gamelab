// 队列站点抽样：判断排队中的 400+ 任务会不会撞到同一堵墙。只观测，不做规避。
const {chromium}=require('../executors/node_modules/playwright');
const urls=process.argv.slice(2);
const proxyServer=process.env.HTTPS_PROXY||process.env.HTTP_PROXY||'';
const proxyOptions=()=>proxyServer?{proxy:{server:proxyServer,bypass:'127.0.0.1,localhost,[::1]'}}:{};
// 必须用 Playwright 的 frame API：跨域 iframe 用 contentDocument 读不到，会误判成"无画面"。
const look=async(page)=>{
  let canvas=0;const frames=[];
  for(const f of page.frames()){
    if(f===page.mainFrame())continue;
    let n=-1;
    try{n=await f.evaluate(()=>document.querySelectorAll('canvas').length);}catch(e){n=-2;}
    if(n>0)canvas+=n;
    frames.push({src:(f.url()||'').slice(0,110),canvas:n});
  }
  let own=0;try{own=await page.mainFrame().evaluate(()=>document.querySelectorAll('canvas').length);}catch(e){}
  return {canvas:canvas+own,own,frames,title:await page.title().catch(()=>'')};
};
(async()=>{
 const browser=await chromium.launch({headless:true,...proxyOptions()});
 try{
  for(const url of urls){
   const context=await browser.newContext({viewport:{width:1280,height:900},...proxyOptions()});
   const page=await context.newPage();
   try{
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForTimeout(8000);
    let a=await look(page);
    // 点一次明确唯一的启动按钮（与平台同策略：只点"开始/立即玩/Play"这类）
    const clicked=await page.evaluate(()=>{
      const cands=[...document.querySelectorAll('button,a,div[role=button]')].filter(e=>{
        const t=(e.innerText||'').trim();
        const r=e.getBoundingClientRect();
        return t.length<=16&&r.width>40&&r.height>20&&/^(开始游戏|立即游戏|开始玩|立即玩|play|play now|start|start game|play game)$/i.test(t);
      });
      if(cands.length===1){cands[0].click();return (cands[0].innerText||'').trim();}
      return cands.length?'ambiguous('+cands.length+')':null;
    });
    await page.waitForTimeout(14000);
    const b=await look(page);
    console.log('\n=== '+url);
    console.log('   标题:',(b.title||'').slice(0,50),'| 启动按钮点击:',JSON.stringify(clicked));
    console.log('   canvas 点击前='+a.canvas+' 点击后='+b.canvas);
    b.frames.slice(0,4).forEach(f=>console.log('   iframe '+f.w+'x'+f.h+' canvas='+f.canvas+' '+f.src));
    console.log('   结论:',b.canvas>0?'✅ 有可运行画面':'❌ 无画面');
   }catch(e){console.log('\n=== '+url+'\n   加载失败: '+e.message.slice(0,80));}
   finally{await context.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exit(1)});
