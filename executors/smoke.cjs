// Product runtime validator: isolated browser context, only local artifact requests.
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
async function main(){
  const [file, reportPath, screenshotPath] = process.argv.slice(2);
  const input = JSON.parse(fs.readFileSync(file,'utf8'));
  const server = http.createServer((req,res)=>{
    const name=decodeURIComponent(req.url.split('?')[0]).replace(/^\//,'');
    if(!Object.hasOwn(input.files,name)){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.wasm':'application/wasm','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff':'font/woff','.woff2':'font/woff2'})[path.extname(name)]||'application/octet-stream');
    const content=input.files[name];
    res.end(typeof content==='string'?content:Buffer.from(content.content,'base64'));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    const opts={headless:true};
    if(process.env.BROWSER_EXECUTABLE)opts.executablePath=process.env.BROWSER_EXECUTABLE;
    else if(process.platform==='win32'&&fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'))opts.executablePath='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
    browser=await chromium.launch(opts);
    const context=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block',acceptDownloads:false});
    const errors=[],blockedRequests=[];
    await context.route('**/*',route=>{
      const u=route.request().url();
      if(u.startsWith(origin+'/'))return route.continue();
      blockedRequests.push(u);return route.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(`HTTP ${r.status()}: ${r.url()}`)});
    await page.goto(origin+'/'+input.entry,{waitUntil:'networkidle',timeout:20000});
    await page.screenshot({path:screenshotPath});
    const report={loaded:true,page_errors:errors,blocked_external_requests:blockedRequests,screenshot:screenshotPath,coverage:'page-load only; gameplay requires human acceptance',gameplay_verified:false};
    report.actions=[];
    for(const [i,action] of (input.actions||[]).slice(0,20).entries()){
      try{
        if(action.type==='click'){
          const opts={timeout:3000};
          if(Number.isFinite(action.x)&&Number.isFinite(action.y))opts.position={x:action.x,y:action.y};
          await page.locator(String(action.selector)).first().click(opts);
        }else if(action.type==='key')await page.keyboard.press(String(action.key));
        else if(action.type==='wait')await page.waitForTimeout(Math.max(0,Math.min(1000,Number(action.ms)||0)));
        else throw new Error('Unsupported observation action');
        const shot=screenshotPath.replace(/\.png$/,`-action-${i}.png`);
        await page.screenshot({path:shot});
        let assertion=null;
        if(action.expect_text){assertion=(await page.locator(String(action.assert_selector||'body')).innerText({timeout:3000})).includes(String(action.expect_text));if(!assertion)throw new Error('Explicit text expectation failed');}
        report.actions.push({index:i,type:action.type,completed:true,screenshot:shot,explicit_assertion:assertion});
      }catch(e){errors.push(`Action ${i}: ${e.message}`);report.actions.push({index:i,completed:false});break;}
    }
    // Only the explicitly named original integration fixture has known test rules.
    if(input.fixture==='orbit-catch'){
      const before=await page.locator('#score').innerText();
      await page.locator('#game').click({position:{x:280,y:170}});
      const after=await page.locator('#score').innerText();
      for(let i=1;i<10;i++){
        // White-box coordinates are used only for this self-authored fixture.
        const p=await page.evaluate(()=>({x:target.x,y:target.y}));
        await page.locator('#game').click({position:p});
      }
      const win=await page.locator('#score').innerText();
      await page.locator('#restart').click();
      const reset=await page.locator('#score').innerText();
      report.fixture_checks={score_increment:before!==after&&after.includes('1 / 10'),win:win.includes('完成'),restart:reset===before};
      report.coverage='self-authored fixture start, click scoring, 10-point win, restart; white-box target coordinates used';
      report.gameplay_verified=Object.values(report.fixture_checks).every(Boolean);
      if(!report.gameplay_verified)errors.push('Fixture gameplay check failed');
    }
    report.passed=errors.length===0&&blockedRequests.length===0;
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
    if(!report.passed)process.exitCode=2;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
