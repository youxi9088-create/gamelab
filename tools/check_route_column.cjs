const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
const expected=JSON.parse(process.argv[3]);
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1400,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#jobs');
  await page.locator('table tbody tr').first().waitFor();
  const headers=(await page.locator('table thead th').allInnerTexts()).map(t=>t.trim());
  const column=headers.indexOf('处理路径')+1;
  assert.ok(column>0,'缺少处理路径表头');
  const cells=await page.locator(`table tbody tr td:nth-child(${column})`).allInnerTexts();
  const labels=cells.map(t=>t.split('\n')[0].trim());
  console.log('处理路径列：'+JSON.stringify(labels,null,0));
  for(const label of expected)assert.ok(labels.includes(label),'缺少产线：'+label);
  assert.ok(!labels.includes('待 REA 分流'),'仍有任务落到占位文案“待 REA 分流”');
  assert.ok(new Set(labels).size>=expected.length,'产线没有区分开：'+JSON.stringify(labels));
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
