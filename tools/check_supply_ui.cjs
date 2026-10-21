const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1360,height:960}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#reviews');
  await page.getByRole('heading',{name:'下游模板供货',exact:true}).waitFor();
  await page.getByText('Fixture · 供货阻塞',{exact:true}).click();
  await page.getByRole('button',{name:'补充供货资料',exact:true}).click();
  await page.locator('#supply-metadata-form textarea').fill(JSON.stringify({
    license_declaration:{distributable:'yes',owner:'Isolated fixture owner'}
  }));
  await page.getByRole('button',{name:'保存并继续供货',exact:true}).click();
  await page.getByText('Fixture · 待自动推送',{exact:true}).waitFor();
  await page.getByText('Fixture · 待自动推送',{exact:true}).click();
  await page.screenshot({path:'qa-output/supply-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/supply-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
