const {chromium}=require('../executors/node_modules/playwright');
const url=process.argv[2];
const wait=Number(process.argv[3]||25000);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const ctx=await browser.newContext({viewport:{width:1000,height:760}});
  const page=await ctx.newPage();
  const errors=[],logs=[];
  page.on('pageerror',e=>errors.push(String(e.message).split('\n')[0]));
  page.on('console',m=>{if(m.type()==='error')logs.push(m.text().slice(0,200));});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000}).catch(e=>console.log('goto:',e.message.split('\n')[0]));
  await page.waitForTimeout(wait);
  let canvas=0;
  for(const f of page.frames()){try{canvas+=await f.evaluate(()=>document.querySelectorAll('canvas').length);}catch(e){}}
  console.log('canvas='+canvas);
  console.log('pageerror:');
  for(const e of [...new Set(errors)].slice(0,10))console.log('   '+e);
  console.log('console.error:');
  for(const l of [...new Set(logs)].slice(0,10))console.log('   '+l);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
