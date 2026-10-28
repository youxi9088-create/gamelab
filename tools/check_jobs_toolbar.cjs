const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
const base=process.argv[2];
const rows=async page=>await page.locator('table tbody tr').count();
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.goto(base+'/#jobs');
  await page.locator('table tbody tr').first().waitFor();

  // 翻页：总量超过一页时，第一页只能渲染一页的行数，且能翻到第二页
  const first=await rows(page);
  assert.ok(first>0&&first<=50,'首页行数异常：'+first);
  const pageText=await page.locator('#jobs-next').locator('xpath=..').innerText();
  console.log('翻页条：'+pageText.replace(/\s+/g,' '));
  assert.match(pageText,/第 1 \/ [2-9]/,'没有分成多页：'+pageText);
  await page.click('#jobs-next');
  await page.waitForFunction(()=>document.body.innerText.includes('第 2 /'));
  assert.ok(await rows(page)>0,'第二页没有任务');
  await page.click('#jobs-prev');
  await page.waitForFunction(()=>document.body.innerText.includes('第 1 /'));

  // 搜索：按游戏名过滤
  await page.fill('#jobs-query','toolbar-7');
  await page.waitForFunction(()=>document.querySelectorAll('table tbody tr').length<50);
  const searched=await rows(page);
  console.log('搜索 toolbar-7 → '+searched+' 行');
  assert.ok(searched>0&&searched<50,'搜索没有收敛：'+searched);
  const titles=await page.locator('table tbody tr td:first-child').allInnerTexts();
  for(const t of titles)assert.match(t,/toolbar-7/,'搜索结果含无关任务：'+t);
  // 输入框在重渲染后不能丢焦点和内容
  assert.equal(await page.evaluate(()=>document.activeElement&&document.activeElement.id),'jobs-query');
  assert.equal(await page.inputValue('#jobs-query'),'toolbar-7');

  // 状态筛选：选排队中后不应出现其他状态
  await page.click('#jobs-reset');
  await page.waitForFunction(()=>document.querySelectorAll('table tbody tr').length===50);
  await page.selectOption('#jobs-status','queued');
  await page.waitForFunction(()=>document.querySelectorAll('table tbody tr').length<=50);
  const statusLabel=(await page.locator('#jobs-status option:checked').innerText()).trim();
  const statuses=await page.locator('table tbody tr td:nth-child(4)').allInnerTexts();
  console.log('状态筛选 queued('+statusLabel+') → '+statuses.length+' 行');
  assert.ok(statuses.length>0,'状态筛选后为空');
  // 下拉里的叫法和表格里的徽标必须是同一个词，否则筛选看起来像没生效
  for(const s of statuses)assert.ok(s.includes(statusLabel),'下拉文案与表格文案不一致：'+s+' 不含 '+statusLabel);

  // 产线筛选
  await page.selectOption('#jobs-status','');
  const routeOptions=await page.locator('#jobs-route option').evaluateAll(os=>os.map(o=>o.value));
  console.log('产线下拉：'+JSON.stringify(routeOptions));
  const aiRoute=routeOptions.find(v=>v.includes('AI 复刻'));
  assert.ok(aiRoute,'产线下拉缺少 AI 复刻：'+JSON.stringify(routeOptions));
  await page.selectOption('#jobs-route',aiRoute);
  await page.waitForFunction(()=>document.querySelectorAll('table tbody tr').length<50);
  const routes=await page.locator('table tbody tr td:nth-child(3)').allInnerTexts();
  console.log('产线筛选 AI 复刻 → '+routes.length+' 行');
  assert.ok(routes.length>0,'产线筛选后为空');
  for(const r of routes)assert.match(r,/AI 复刻/,'产线筛选混入其他产线：'+r);

  // 删除：点击第一行删除按钮后该行消失
  await page.click('#jobs-reset');
  await page.waitForFunction(()=>document.querySelectorAll('table tbody tr').length===50);
  // 第一页是满页，删掉一个后后面的任务会补位，所以只能按“这个任务不见了”判断
  const target=(await page.locator('table tbody tr').first().locator('td:first-child').innerText()).split('\n')[0].trim();
  const targetId=(await page.locator('table tbody tr').first().locator('td:first-child small').innerText()).trim();
  await page.locator('button[data-remove]').first().click();
  await page.waitForFunction(id=>!document.body.innerText.includes(id),targetId,{timeout:15000});
  console.log('删除首行：'+target+' → 剩余 '+await rows(page));
  const after=await page.locator('table tbody tr td:first-child').allInnerTexts();
  assert.ok(!after.some(t=>t.includes(target)),'删除后该任务仍在列表里');
  assert.ok(!after.some(t=>t.includes(targetId)),'删除后任务 ID 仍在列表里');
  // 刷新后不能复活
  await page.reload();
  await page.locator('table tbody tr').first().waitFor();
  assert.ok(!(await page.locator('table tbody tr td:first-child').allInnerTexts()).some(t=>t.includes(targetId)),'刷新后任务复活了');

  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
