const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
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
  const evidence=page.locator('#game-specification-content img');
  await evidence.scrollIntoViewIfNeeded();
  await evidence.evaluate(img=>img.decode());
  assert.equal(await evidence.count(),1);
  fs.mkdirSync('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/specification-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/specification-mobile.png'});
  // Read-only fixture presentation: do not perform a real approval mutation.
  await page.route('**/api/state',async route=>{
    const response=await route.fetch(),state=await response.json();
    state.versions.forEach(v=>{v.status='approved';v.report.game_profile={rules:'Detailed fixture rules',systems:'Fixture systems'};delete v.game_profile;});
    state.candidates.forEach(c=>{c.status='approved';});
    await route.fulfill({response,json:state});
  });
  await page.setViewportSize({width:1280,height:1000});
  await page.goto(process.argv[2]+'/#library');
  await page.reload();
  await page.locator('[data-detail="fixture"]').first().click();
  assert.equal(await page.getByRole('link',{name:'打开来源试玩 ↗',exact:true}).count(),0);
  await page.getByRole('button',{name:'游戏规格说明书',exact:true}).click();
  await page.locator('#detail-specification-content').getByText('Detailed fixture rules',{exact:true}).waitFor();
  await page.screenshot({path:'qa-output/specification-approved-detail.png'});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
