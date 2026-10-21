const {chromium}=require('../executors/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const output='F:/youxi/4k99-5113-web';fs.mkdirSync(output+'/screenshots',{recursive:true});
 const report={page_errors:[],failed_requests:[],assets:[],checks:[]};
 try {
  const context=await browser.newContext({viewport:{width:1100,height:900}});
  // Keep incidental enemy spawns away from the deterministic input test path.
  await context.addInitScript(()=>{Math.random=()=>.75;});
  const page=await context.newPage();
  page.on('pageerror',e=>report.page_errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.failed_requests.push(r.url());if(r.url().includes('/assets/original/')&&r.ok())report.assets.push(r.url().split('/assets/original/')[1]);});
  await page.goto(process.argv[2]||'http://127.0.0.1:5113');
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.state==='select');
  await page.locator('[data-game-action="start"]').click();
  const canvas=page.locator('canvas'),box=await canvas.boundingBox();
  await page.mouse.move(box.x+315/960*box.width,box.y+270/540*box.height);
  await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.score)>=2);
  report.checks.push('pointer movement and food collision increase score');
  await page.locator('[data-game-action="boost"]').click();
  if(!(await page.locator('#status').innerText()).includes('加速'))throw Error('Boost failed');
  report.checks.push('boost button');
  await canvas.focus();const before=Number(await canvas.getAttribute('data-y'));
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');
  if(Number(await canvas.getAttribute('data-y'))>=before)throw Error('Keyboard movement failed');
  report.checks.push('keyboard movement');
  await page.waitForTimeout(2200);await page.screenshot({path:output+'/screenshots/runtime.png',clip:await canvas.boundingBox()});
  await page.locator('[data-game-action="restart"]').click();
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.state==='select'&&document.querySelector('canvas').dataset.score==='0');
  report.checks.push('restart resets score and selection');
  await page.locator('[data-game-action="fish-spark"]').click();await page.locator('[data-game-action="start"]').click();
  report.checks.push('second original fish selectable');
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const touch=await mobile.newPage();touch.on('pageerror',e=>report.page_errors.push(e.message));await touch.goto(process.argv[2]||'http://127.0.0.1:5113');
  await touch.waitForFunction(()=>document.querySelector('canvas').dataset.state==='select');await touch.locator('[data-game-action="start"]').tap();
  await touch.locator('canvas').tap({position:{x:180,y:80}});
  await touch.waitForTimeout(500);await touch.screenshot({path:output+'/screenshots/mobile.png'});
  if(await touch.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
  report.checks.push('touch controls and mobile layout');
  if(new Set(report.assets.filter(n=>n!== 'manifest.json')).size!==19)throw Error('Original resources not all loaded');
  if(report.page_errors.length||report.failed_requests.length)throw Error('Runtime errors');
  report.passed=true;
 } finally {
  fs.writeFileSync(output+'/runtime-report.json',JSON.stringify(report,null,2));await browser.close();
 }
 console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1)});
