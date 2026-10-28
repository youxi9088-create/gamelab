const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.argv[2]+'/#jobs');
 await page.locator('[data-job-platform="example.org"]').check();
 await page.locator('[data-job-platform="example.net"]').check();
 await page.locator('#jobs-select-filtered').click();
 await page.getByText('已选 52 项',{exact:true}).waitFor();
 await page.locator('[data-jobs-control="pause"]').click();
 await page.getByText('已暂停 52 个任务，跳过 0 个').waitFor();
 let state=await page.request.get(process.argv[2]+'/api/state').then(r=>r.json());
 assert.equal(state.jobs.filter(j=>j.manual_paused).length,52);
 await page.locator('#jobs-next').click();
 assert.equal(await page.locator('[data-job-select]').count(),2);
 await page.locator('#jobs-select-page').check();
 await page.locator('[data-jobs-control="start"]').click();
 await page.getByText('已启动 2 个任务，跳过 0 个').waitFor();
 state=await page.request.get(process.argv[2]+'/api/state').then(r=>r.json());
 assert.equal(state.jobs.filter(j=>j.manual_paused).length,50);
 await page.locator('#jobs-pause-all').click();
 await page.getByText('已暂停 3 个任务，跳过 0 个').waitFor();
 await page.locator('#jobs-reset').click();
 await page.screenshot({path:'qa-output/job-controls-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'qa-output/job-controls-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
