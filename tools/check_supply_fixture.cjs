const {chromium}=require('../executors/node_modules/playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1000,height:720}}),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
  await page.goto(pathToFileURL(path.resolve('tests/fixtures/supply-game/index.html')).href);
  await page.locator('#start').click();
  await page.locator('#target').click();
  assert(await page.locator('#won').isVisible());
  await page.screenshot({path:'qa-output/supply-fixture.png'});
  await page.locator('#restart').click();
  assert(await page.locator('#start').isVisible());
  assert(!(await page.locator('#won').isVisible()));
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);
  assert.deepEqual(external,[]);
  console.log('PASS: file:// load, start, win, restart, mobile layout; no external requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
