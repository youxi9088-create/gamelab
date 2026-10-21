// Read-only UI checks: never submit, retry or accept a game.
const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try {
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync('qa-output',{recursive:true});
  for(const width of [1440,768,390]) {
   await page.setViewportSize({width,height:1000});
   await page.goto((process.argv[2]||'http://127.0.0.1:8765')+'/#overview');
   await page.reload();
   await page.getByRole('heading',{name:'需要你关注'}).waitFor();
   await page.evaluate(()=>document.fonts.ready);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}`);
   assert.equal(await page.locator('.overview-details details[open]').count(),0);
   await page.screenshot({path:`qa-output/overview-${width}.png`,fullPage:true});
   const summary=page.locator('.overview-details summary').first();
   await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('.overview-details details[open]').count(),1);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.getByRole('button',{name:/待验收版本/}).click();
  await page.waitForURL('**/#reviews');
  assert.deepEqual(errors,[]);
  console.log('PASS: desktop/tablet/mobile, ledger keyboard expansion, review navigation, no page overflow or JS errors');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
