// 按 discovered-web.cjs 的 gameplayReady 口径，判断一个 cocos2 页面到底能不能进主菜单。
// 用来裁定"脚本报错后游戏是真的卡死，还是照常可玩"。
const {chromium}=require('../executors/node_modules/playwright');
const url=process.argv[2], wait=Number(process.argv[3]||90000);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:760}});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message).split('\n')[0]));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  const shot=async t=>{await page.screenshot({path:'/tmp/ready-'+t+'.png'}).catch(()=>{});};
  for(const t of [10,20,30,45,60]){
   await page.waitForTimeout(t===10?10000:(t===20?10000:(t===30?10000:15000)));
   let info;
   try{
    info=await page.evaluate(()=>{
     let loading=false,labels=0,texts=[];
     function visit(n){if(!n.activeInHierarchy||n.opacity===0)return;const l=n.getComponent(cc.Label);if(l&&l.string){labels++;const s=l.string.trim();if(texts.length<12)texts.push(s);if(/加载中|loading\s*(?:\.{2,}|\d|$)/i.test(s))loading=true;}n.children.forEach(visit);}
     try{visit(cc.director.getScene());}catch(e){return {err:String(e)}}
     return {loading,labels,texts};
    });
   }catch(e){info={err:e.message.split('\n')[0]};}
   console.log(`t=${t}s`,JSON.stringify(info));
   await shot(t);
  }
  console.log('pageerror:',[...new Set(errors)].slice(0,5));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
