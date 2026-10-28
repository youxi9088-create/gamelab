const {chromium}=require('../executors/node_modules/playwright');
const base=require('../executors/browser-options.cjs')();
const url=process.argv[2]||'https://poki.com/zh/g/tnt-sandbox';
const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY||'';
const cases=[
  ['当前配置 '+JSON.stringify(base), {...base}],
  ['当前配置 + 显式代理 '+proxy, {...base, proxy: proxy?{server:proxy}:undefined}],
  ['msedge headless', {channel:'msedge', headless:true}],
  ['chromium 带完整浏览器指纹参数', {...base, args:['--disable-blink-features=AutomationControlled','--no-sandbox']}],
];
const count=async page=>{
  let n=0;
  for(const f of page.frames()){try{n+=await f.evaluate(()=>document.querySelectorAll('canvas').length);}catch(e){}}
  return n;
};
(async()=>{
 for(const [name,opts] of cases){
  let browser;
  try{
   browser=await chromium.launch(opts);
   const ctx=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block',
     userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'});
   const page=await ctx.newPage();
   const t=Date.now();
   const resp=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForTimeout(12000);
   console.log(`${name}\n   HTTP ${resp&&resp.status()} · ${Date.now()-t}ms · canvas=${await count(page)} · title=${(await page.title()).slice(0,40)}`);
  }catch(e){
   console.log(`${name}\n   失败：${String(e.message).split('\n')[0]}`);
  }finally{ if(browser) await browser.close(); }
 }
})();
