const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.goto(process.argv[2]+'/#reviews');
  await page.getByRole('button',{name:'开始验收',exact:true}).click();
  assert.equal(await page.locator('.modal .code').filter({hasText:'PRIVATE_OPERATIONAL_REPORT'}).count(),0);
  await page.locator('#game-specification summary').click();
  await page.locator('#game-specification-content').getByText('Move and collect',{exact:true}).waitFor();
  assert.equal(await page.locator('#review-form').count(),1);
  assert.equal(await page.getByRole('button',{name:'通过验收',exact:true}).count(),1);
  assert.equal(await page.locator('#game-specification-content script').count(),0);
  fs.mkdirSync('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/specification-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/specification-mobile.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
