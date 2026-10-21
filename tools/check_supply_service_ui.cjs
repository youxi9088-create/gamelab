const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1360,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#tools');
  await page.getByRole('heading',{name:'下游模板供货服务',exact:true}).waitFor();
  await page.getByRole('button',{name:'检查接入与游戏',exact:true}).click();
  await page.getByText('静态结构：通过',{exact:false}).waitFor();
  await page.screenshot({path:'qa-output/supply-service-report.png',fullPage:true});
  await page.keyboard.press('Escape');
  await page.goto(process.argv[2]+'/#tools');
  await page.reload();
  await page.getByRole('heading',{name:'下游模板供货服务',exact:true}).waitFor();
  await page.screenshot({path:'qa-output/supply-service-desktop.png',fullPage:true});
  await page.locator('[data-supply-config]').click();
  await page.locator('#supply-service-form').waitFor();
  assert.equal(await page.locator('[name="SUPPLY_APP_SECRET"]').inputValue(),'');
  await page.getByRole('button',{name:'保存配置',exact:true}).click();
  await page.locator('#supply-service-form').waitFor({state:'detached'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/supply-service-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'查看供货任务 ↗',exact:true}).click();
  await page.getByRole('heading',{name:'下游模板供货',exact:true}).waitFor();
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
