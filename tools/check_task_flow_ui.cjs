const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000}});
  await page.goto(process.argv[2]+'/#jobs');
  await page.getByText('已有可试玩草稿 · 验证未完成',{exact:true}).waitFor();
  assert.equal(await page.getByText('90%',{exact:true}).count(),0);
  await page.getByRole('button',{name:'继续沟通 / 记录',exact:true}).click();
  assert.equal(await page.locator('.pipeline [data-status="running"]').count(),0);
  assert(await page.locator('.pipeline-overview').getByText('任务遇到阻断，需要处理',{exact:true}).isVisible());
  for(const text of ['此前已完成 · 本轮无新结论','本轮未触发修复','尚未发布','✓ 已完成','！遇到阻断'])assert(await page.locator('.pipeline-status').getByText(text,{exact:true}).isVisible(),text);
  assert.equal(await page.locator('.pipeline-work').count(),9);
  assert.equal(await page.locator('.pipeline-next').count(),9);
  await page.getByText('最近一次检查的未完成项',{exact:true}).waitFor();
  fs.mkdirSync('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/task-flow-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/task-flow-mobile.png'});
  await page.locator('[data-stage-focus]').click();
  await page.screenshot({path:'qa-output/task-flow-mobile-current.png'});
  assert(await page.locator('[data-node="test"] .pipeline-problem').isVisible());
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
