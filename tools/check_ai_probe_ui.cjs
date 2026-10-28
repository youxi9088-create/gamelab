const {chromium}=require('../executors/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try{
    const page=await browser.newPage();
    await page.goto(process.argv[2]+'/#tools');
    const button=page.locator('[data-service-test="ai"]');
    await button.waitFor();
    const response=page.waitForResponse(r=>r.url().endsWith('/api/services/ai/test'));
    await button.click();
    await page.waitForFunction(()=>document.querySelector('[data-service-test="ai"]')?.textContent.includes('检测中 2 秒'));
    if(!(await button.isDisabled()))throw Error('Probe should stay disabled while running');
    if((await response).status()!==200)throw Error('Probe request failed');
    await page.waitForFunction(()=>{const b=document.querySelector('[data-service-test="ai"]');return b?.textContent==='检测连接'&&!b.disabled&&b.closest('section').innerText.includes('在线')});
    if((await page.locator('[data-service-test="ai"]').locator('xpath=ancestor::section').innerText()).includes('检测中'))throw Error('Probe remains stuck');
    console.log('Slow probe resolves and restores controls');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
