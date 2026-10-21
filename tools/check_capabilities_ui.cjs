const {chromium}=require('../executors/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#overview');
  await page.getByRole('heading',{name:'调用用量与费用'}).waitFor();
  await page.getByRole('button',{name:'配置模型单价'}).click();
  await page.locator('#pricing-form [name=model]').fill('fixture-model');
  await page.locator('#pricing-form [name=input]').fill('2');
  await page.locator('#pricing-form [name=output]').fill('4');
  await page.getByRole('button',{name:'保存单价',exact:true}).click();
  await page.locator('#pricing-form').waitFor({state:'detached'});
  await page.getByRole('heading',{name:'调用用量与费用'}).waitFor();
  const state=await page.evaluate(async()=>await(await fetch('/api/state')).json());
  assert.equal(state.ai_pricing['api:fixture-model'].input_per_million,2);
  fs.mkdirSync('qa-output',{recursive:true});
  await page.screenshot({path:'qa-output/capabilities-overview.png',fullPage:true});
  await page.goto(process.argv[2]+'/#jobs');await page.locator('[data-job]').first().click();
  await page.getByRole('button',{name:'分析与记录',exact:true}).click();
  await page.getByText(/转换分析与分流/).waitFor();
  await page.screenshot({path:'qa-output/capabilities-plan.png',fullPage:true});
  await page.keyboard.press('Escape');await page.goto(process.argv[2]+'/#overview');
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('heading',{name:'调用用量与费用'}).waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/capabilities-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
