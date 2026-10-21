const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#overview');
  await page.getByRole('heading',{name:'游戏生产概览',exact:true}).waitFor();
  const cards=page.locator('.production-stats .stat');
  assert.equal(await cards.count(),4);
  assert.equal(await cards.first().locator('.stat-label').innerText(),'累计抓取游戏');
  assert.equal((await cards.first().locator('.stat-value').innerText()).replace(/\s/g,''),'0个');
  assert.equal((await cards.last().locator('.stat-value').innerText()).replace(/\s/g,''),'0个');
  assert.equal((await cards.nth(2).locator('.stat-value').innerText()).replace(/\s/g,''),'1款');
  await page.getByRole('heading',{name:'单个游戏转换用量',exact:true}).waitFor();
  assert.equal(await page.locator('.dashboard-games tbody tr').count(),1);
  await page.getByLabel('搜索转换游戏',{exact:true}).fill('no-matching-game');
  await page.getByLabel('搜索转换游戏',{exact:true}).press('Tab');
  await page.getByText('没有匹配的游戏，可重置筛选。',{exact:true}).waitFor();
  await page.getByRole('button',{name:'重置筛选',exact:true}).click();
  assert((await page.locator('.dashboard-games tbody').innerText()).includes('隔离验证游戏'));
  await page.getByRole('heading',{name:'下游供货明细',exact:true}).waitFor();
  await page.getByRole('heading',{name:'按模型分析',exact:true}).waitFor();
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:'qa-output/dashboard-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/dashboard-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
