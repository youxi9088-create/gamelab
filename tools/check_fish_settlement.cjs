const {chromium}=require('../executors/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report={errors:[],checks:[]};
 try {
  const page=await browser.newPage({viewport:{width:1100,height:800}});
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.addInitScript(()=>Math.random=()=>.99);
  await page.goto(process.argv[2]||'http://127.0.0.1:5113');
  await page.locator('[data-game-action=start]').click();
  const box=await page.locator('canvas').boundingBox();
  await page.mouse.move(box.x+750/960*box.width,box.y+485/540*box.height);
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.state==='lost',null,{timeout:15000});
  await page.locator('[data-game-action=settlement-back]').waitFor({state:'visible'});
  await page.getByText('历史最高',{exact:true}).waitFor({state:'visible'});
  await page.screenshot({path:'F:/youxi/4k99-5113-web/screenshots/settlement.png',clip:box});
  report.checks.push('Collision opens original settlement with visible score fields');
  await page.locator('[data-game-action=settlement-back]').click();
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.state==='select');
  report.checks.push('Original continue button returns to selection');
  if(report.errors.length)throw Error(report.errors.join('\n'));
  report.passed=true;
 } finally {await browser.close();fs.writeFileSync('F:/youxi/4k99-5113-web/settlement-report.json',JSON.stringify(report,null,2));}
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
