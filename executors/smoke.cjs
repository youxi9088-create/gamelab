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
    res.setHeader('Content-Security-Policy',input.local_runtime ? "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'" : "sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'");
    res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.wasm':'application/wasm','.m4a':'audio/mp4','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff':'font/woff','.woff2':'font/woff2'})[path.extname(name)]||'application/octet-stream');
    const content=input.files[name];
    res.end(typeof content==='string'?content:Buffer.from(content.content,'base64'));
  });
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    const opts=require('./browser-options.cjs')();
    browser=await chromium.launch(opts);
    // The CSP sandbox already forbids service workers. Playwright's block shim
    // reads navigator.serviceWorker and itself throws on this opaque origin.
    const context=await browser.newContext({viewport:{width:1000,height:760},acceptDownloads:false});
    const errors=[],blockedRequests=[];
    await context.route('**/*',route=>{
      const u=route.request().url();
      if(u.startsWith(origin+'/'))return route.continue();
      blockedRequests.push(u);return route.abort();
    });
    const page=await context.newPage();
    // Capture the actual visible game surface instead of its host-page margins.
    async function captureGame(target){
      const surfaces=page.locator('canvas:visible');let best=null,area=0;
      for(let i=0;i<await surfaces.count();i++){
        const node=surfaces.nth(i),box=await node.boundingBox();
        if(box&&box.width>=160&&box.height>=160&&box.width*box.height>area){best=node;area=box.width*box.height;}
      }
      if(best)await best.screenshot({path:target});
      else await page.screenshot({path:target});
    }
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(`HTTP ${r.status()}: ${r.url()}`)});
    await page.goto(origin+'/'+input.entry,{waitUntil:'networkidle',timeout:20000});
    await captureGame(screenshotPath);
    const report={loaded:true,page_errors:errors,blocked_external_requests:blockedRequests,screenshot:screenshotPath,coverage:'page-load only; gameplay requires human acceptance',gameplay_verified:false};
    report.actions=[];
    const observations=require('./runtime-observer.cjs').observer(page,!!input.local_runtime);
    if(!Array.isArray(input.actions||[]) || (input.actions||[]).length>20)throw new Error('Provide at most 20 observation actions; actions are never silently truncated');
    for(const [i,action] of (input.actions||[]).slice(0,20).entries()){
      try{
        let observed=null;
        if(action.type==='until')observed=await observations.until(action);
        else if(action.type==='observe'){}
        else if(action.type==='click'){
          const opts={timeout:3000};
          if(Number.isFinite(action.x)&&Number.isFinite(action.y))opts.position={x:action.x,y:action.y};
          await page.locator(String(action.selector)).first().click(opts);
        }else if(action.type==='key')await page.keyboard.press(String(action.key));
        else if(action.type==='hold'){
          if(typeof action.key!=='string'||!Number.isFinite(action.ms)||action.ms<1||action.ms>10000)throw new Error('Hold requires a key and 1-10000 ms');
          await page.keyboard.down(action.key);
          try{await page.waitForTimeout(action.ms);}finally{await page.keyboard.up(action.key);}
        }
        else if(action.type==='wait_for'){
          if(typeof action.selector!=='string'||!Number.isFinite(action.ms)||action.ms<1||action.ms>30000)throw new Error('Wait-for requires a selector and 1-30000 ms');
          const state=action.state||'visible';
          if(!['attached','detached','visible','hidden'].includes(state))throw new Error('Invalid wait-for state');
          await page.locator(action.selector).first().waitFor({state,timeout:action.ms});
        }
        else if(action.type==='reload')await page.reload({waitUntil:'networkidle',timeout:20000});
        else if(action.type==='move'){
          if(!Number.isFinite(action.x)||!Number.isFinite(action.y))throw new Error('Pointer coordinates required');
          await page.mouse.move(action.x,action.y);
        }
        else if(action.type==='wait')await page.waitForTimeout(Math.max(0,Math.min(1000,Number(action.ms)||0)));
        else throw new Error('Unsupported observation action');
        const shot=screenshotPath.replace(/\.png$/,`-action-${i}.png`);
        let assertion=null;
        const assertions=[];
        if(action.assert_selector){
          const locator=page.locator(String(action.assert_selector));
          const state=action.expect_state||'attached';
          if(!['attached','detached','visible','hidden'].includes(state))throw new Error('Invalid selector expectation');
          await locator.first().waitFor({state,timeout:3000});assertions.push({kind:'selector',selector:action.assert_selector,state,passed:true});assertion=true;
        }
        if(action.expect_text!==undefined){assertion=(await page.locator(String(action.assert_selector||'body')).innerText({timeout:3000})).includes(String(action.expect_text));if(!assertion)throw new Error('Explicit text expectation failed');assertions.push({kind:'text',passed:true});}
        if(observed){assertions.push(observed);assertion=true;}
        if(action.capture_storage)assertions.push(await observations.capture(action.capture_storage));
        if(action.expect_storage){assertions.push(await observations.expect(action.expect_storage));assertion=true;}
        if(action.expect_style){
          const spec=action.expect_style;
          if(!action.assert_selector||!spec||typeof spec!=='object'||Array.isArray(spec)||!Object.keys(spec).length||Object.keys(spec).length>8)throw new Error('Style assertion requires a selector and 1-8 CSS properties');
          for(const [property,value] of Object.entries(spec)){
            if(!/^[a-z][a-z-]*$/.test(property)||typeof value!=='string')throw new Error('Style assertion requires CSS property names and string values');
            await page.waitForFunction(({selector,property,value})=>{
              const node=document.querySelector(selector);
              return node!==null&&getComputedStyle(node).getPropertyValue(property).trim()===value;
            },{selector:action.assert_selector,property,value},{timeout:3000});
            assertions.push({kind:'style',selector:action.assert_selector,property,value,passed:true});assertion=true;
          }
        }
        await captureGame(shot);
        const observedText=await page.evaluate(()=>{
          const visible=el=>{for(let n=el;n&&n instanceof Element;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}return el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;};
          return Array.from(document.querySelectorAll('body *')).filter(el=>el.children.length===0&&visible(el)&&el.textContent.trim()).map(el=>el.textContent.trim()).join('\n').slice(0,8000);
        });
        report.actions.push({index:i,type:action.type,completed:true,screenshot:shot,observed_text:observedText,explicit_assertion:assertion,assertions});
      }catch(e){errors.push(`Action ${i}: ${e.message}`);report.actions.push({index:i,completed:false,observation:e.observation||null});break;}
    }
    // Only the explicitly named original integration fixture has known test rules.
    if(report.actions.length)report.coverage='page load plus '+report.actions.length+' scripted interactions; '+report.actions.reduce((n,a)=>n+(a.assertions||[]).length,0)+' explicit assertions; full gameplay still requires acceptance';
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
    if(input.spec){
      report.spec_tests=await require('./spec_test.cjs').run({url:origin+'/'+input.entry,spec:input.spec},path.join(path.dirname(reportPath),'spec-tests'));
      if(!report.spec_tests.passed)errors.push('Specification tests did not pass; see spec-tests/spec-tests.json');
    }
    report.passed=errors.length===0&&blockedRequests.length===0;
    fs.writeFileSync(reportPath,JSON.stringify(report,null,2));
    if(!report.passed)process.exitCode=2;
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
