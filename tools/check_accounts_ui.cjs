const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.goto(process.argv[2]);
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('fixture-admin-password');
  await page.locator('form button[type="submit"],form button.primary').first().click();
  await page.locator('[data-nav="administration"]').click();
  const form=page.locator('#account-form');await form.waitFor();
  await form.locator('[name="username"]').fill('viewer-fixture');
  await form.locator('[name="password"]').fill('fixture-viewer-password');
  await form.getByRole('button',{name:'保存账号',exact:true}).click();
  await page.locator('#admin-users .kv').filter({hasText:'viewer-fixture'}).waitFor();
  fs.mkdirSync('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/accounts-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/accounts-mobile.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
