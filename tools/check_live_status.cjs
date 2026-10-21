const {chromium}=require('../executors/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage(); const errors=[]; let phase='running',reads=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/state',async route=>{
   const response=await route.fetch(), data=await response.json();
   Object.assign(data.jobs[0],{status:phase,display_status:phase,reason:'实时状态 '+phase,question:phase==='waiting_input'?'请确认操作方式':''});
   reads++; await route.fulfill({response,json:data});
  });
  await page.goto(process.argv[2]+'/#jobs');
  await page.locator('[data-job]').first().click();
  await page.getByRole('dialog').getByText('实时状态 running',{exact:false}).waitFor();
  phase='waiting_input';
  await page.locator('#task-message').waitFor({timeout:12000});
  await page.locator('#task-message').fill('正在输入的回复不能丢失');
  const before=reads; phase='blocked';
  await page.getByRole('dialog').getByText('实时状态 blocked',{exact:false}).waitFor({timeout:12000});
  if(await page.locator('#task-message').inputValue()!=='正在输入的回复不能丢失')throw Error('Draft lost');
  if(!await page.locator('#task-message').evaluate(e=>e===document.activeElement))throw Error('Focus lost');
  if(reads<=before)throw Error('No background poll');
  await page.locator('.close').click();
  if(!await page.locator('#page').innerText().then(s=>s.includes('执行阻断')))throw Error('List stale');
  await page.locator('#global-search').fill('未提交搜索');
  phase='review';
  await page.waitForFunction(()=>document.querySelector('#page').textContent.includes('待验收'),null,{timeout:12000});
  if(await page.locator('#global-search').inputValue()!=='未提交搜索')throw Error('Search lost');
  if(errors.length)throw Error(errors.join('\n'));
  console.log('Live status, open dialog, drafts, focus and list update passed');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
