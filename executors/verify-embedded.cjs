// Shared embedded-host smoke check; gameplay equivalence requires separate acceptance.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=path.resolve(process.argv[2]),report={passed:false,checks:[],errors:[],missing:[],external:[]};
 fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
  if(file===root)file=path.join(root,'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  const mime={'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch(require('./browser-options.cjs')());let page;
 try{
  const context=await browser.newContext({viewport:{width:720,height:1280},serviceWorkers:'block'});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.origin+u.pathname);return r.abort();});
  page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.missing.push(r.url())});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>typeof window.run==='function'&&!window.localHostError);
  const play=page.getByRole('button',{name:/^(play|start|开始|开始游戏)$/i});await play.waitFor({state:'visible',timeout:45000});
  await page.screenshot({path:path.join(root,'screenshots/menu.png')});
  await play.click({timeout:45000});await page.waitForTimeout(2000);
  const canvas=page.locator('canvas').filter({visible:true}).first();await canvas.waitFor();
  const before=await canvas.screenshot();const box=await canvas.boundingBox();
  await page.mouse.move(box.x+box.width*.7,box.y+box.height*.35);await page.mouse.down();await page.waitForTimeout(1500);await page.mouse.up();
  const after=await canvas.screenshot();assert(!before.equals(after),'Canvas did not animate');
  report.checks.push('host-start','play-button','canvas-animates-after-input');
  await page.screenshot({path:path.join(root,'screenshots/gameplay.png')});
  report.storage=await page.evaluate(()=>({available:typeof localStorage==='object',keys:Object.keys(localStorage).filter(k=>k.startsWith('game-lab:'))}));
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);assert.deepEqual(report.external,[]);report.passed=true;
  const specFile=path.join(root,'evidence/game-spec.json');
  if(fs.existsSync(specFile))report.spec_tests=await require('./spec_test.cjs').run({url:origin,spec:JSON.parse(fs.readFileSync(specFile,'utf8')),viewport:{width:720,height:1280}},path.join(root,'evidence/spec-tests'));
 }catch(e){report.failure=e.stack;if(page)await page.screenshot({path:path.join(root,'screenshots/failed-check.png')}).catch(()=>{});throw e}
 finally{fs.writeFileSync(path.join(root,'evidence/runtime.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
