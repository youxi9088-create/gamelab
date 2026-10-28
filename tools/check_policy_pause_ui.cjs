const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Simulate the old live backend so labels can update without stopping its job.
  await page.route('**/api/state',async route=>{
   const response=await route.fetch(), state=await response.json();
   for(const job of state.jobs||[]) {
    delete job.policy_pause;job.display_status=job.status;
    job.progress_label='等待补充信息';
   }
   await route.fulfill({response,json:state});
  });
  await page.goto(process.argv[2]+'/#jobs');
  for(const label of ['已暂停 · 非 Web 游戏','已暂停 · 游戏类型待确认','已暂停 · 页面访问失败']) {
   await page.getByText(label,{exact:true}).first().waitFor();
  }
  await page.screenshot({path:'qa-output/policy-pause-list.png',fullPage:true});
  const row=page.locator('tr').filter({hasText:'已暂停 · 非 Web 游戏'});
  await row.locator('[data-job]').click();
  await page.getByText('无需回复 AI。可保留暂停；如有该游戏的网页版，请补充可玩的网页入口后再继续。',{exact:true}).waitFor();
  await page.screenshot({path:'qa-output/policy-pause-detail.png',fullPage:true});
  assert.deepEqual(errors,[]);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
