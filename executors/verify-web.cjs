// Isolated local gameplay verification. State is read for assertions; all play uses mouse input.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const [rootArg,kind]=process.argv.slice(2),root=path.resolve(rootArg);
 if(kind!=='cocos2-minesweeper')throw Error('Unknown verifier');
 const report={passed:false,checks:[],errors:[],missing:[],external:[]};
 fs.mkdirSync(path.join(root,'evidence'),{recursive:true});fs.mkdirSync(path.join(root,'screenshots'),{recursive:true});
 const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
  if(file===root)file=path.join(root,'index.html');
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css','.mp3':'audio/mpeg','.bin':'application/octet-stream'};
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch(require('./browser-options.cjs')());
 let page;
 try{
  const context=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin||['data:','blob:'].includes(u.protocol))return r.continue();report.external.push(u.origin+u.pathname);return r.abort();});
  await context.addInitScript(()=>{
   window.probe={nodes(){const a=[];function visit(n){if(!n.activeInHierarchy)return;a.push(n);n.children.forEach(visit)}if(window.cc?.director.getScene())visit(cc.director.getScene());return a},
    component(name){return this.nodes().map(n=>n.getComponent(name)).find(Boolean)},
    position(n){const p=n.convertToWorldSpaceAR(cc.v2(0,0)),r=cc.game.canvas.getBoundingClientRect();return {x:r.left+p.x/cc.winSize.width*r.width,y:r.top+(1-p.y/cc.winSize.height)*r.height}},
    button(handler,component){return this.nodes().find(n=>n.getComponent(cc.Button)?.clickEvents.some(e=>e.handler===handler&&(!component||e.target?.getComponent(component))))},
    board(){const m=this.component('MainView');return m?{rows:m._iRow,lines:m._iLine,mines:m._iMineCount,remaining:m._curMineCount,started:m._isFirstStart,over:m._isOver,nums:m._tNum,flags:m._tFlag,buttons:m._tBtns,cells:m._contentObjs.length}:null}
   };
  });
  page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.missing.push(r.url())});
  async function ready(){await page.waitForFunction(()=>probe.component('Main')?.homeViewNode.active,{},{timeout:45000});}
  async function button(handler,component){await page.waitForFunction(([h,c])=>!!probe.button(h,c),[handler,component],{timeout:15000});const p=await page.evaluate(([h,c])=>probe.position(probe.button(h,c)),[handler,component]);await page.mouse.click(p.x,p.y);await page.waitForTimeout(300);}
  async function board(rows,lines,mines){await page.waitForFunction(n=>probe.board()?.cells===n,rows*lines,{timeout:20000});const b=await page.evaluate(()=>probe.board());assert.equal(b.rows,rows);assert.equal(b.lines,lines);assert.equal(b.mines,mines);return b;}
  async function cell(index,button='left'){const p=await page.evaluate(i=>probe.position(probe.component('MainView')._contentObjs[i].node),index);await page.mouse.click(p.x,p.y,{button});await page.waitForTimeout(80);}
  async function state(){return page.evaluate(()=>probe.board());}
  async function result(type){await page.waitForFunction(t=>probe.component('GameOver')?._type===t,type,{timeout:10000});}
  async function shot(name){await page.screenshot({path:path.join(root,'screenshots',name+'.png')});}
  await page.goto(origin,{waitUntil:'domcontentloaded'});await ready();await shot('menu');
  await button('onBtnPlay1');await board(9,9,10);await cell(40);let b=await state();assert(b.started);assert.equal(b.nums.filter(n=>n===-1).length,10);assert.notEqual(b.nums[40],-1);report.checks.push('beginner-first-click-safe');await shot('board');
  const mine=b.nums.findIndex(n=>n===-1);await cell(mine,'right');b=await state();assert.equal(b.flags[mine],1);assert.equal(b.remaining,9);await cell(mine,'right');assert.equal((await state()).flags[mine],0);report.checks.push('flag-toggle');
  b=await state();await page.reload();await ready();await button('onBtnPlay5');await board(9,9,10);const restored=await state();assert.deepEqual(restored.nums,b.nums);assert.deepEqual(restored.buttons,b.buttons);report.checks.push('refresh-continue');
  await cell(mine);await result(2);await shot('failure');await button('onBtnReset','GameOver');assert.equal((await state()).started,false);await cell(40);report.checks.push('failure-retry');
  for(let i=0;i<90;i++){b=await state();if(b.over)break;const safe=b.nums.findIndex((n,i)=>n!==-1&&b.buttons[i]===1);if(safe<0)break;await cell(safe);}
  await result(1);await shot('success');report.checks.push('win-settlement');await button('onBtnHome');await ready();
  const score=await page.evaluate(()=>probe.component('Main').timeLables[0].string);assert(score);await page.reload();await ready();assert.equal(await page.evaluate(()=>probe.component('Main').timeLables[0].string),score);report.checks.push('best-score-persists');
  for(const [level,w,h,m] of [[2,16,9,40],[3,30,16,99]]){await button('onBtnPlay'+level);await board(w,h,m);await button('onBtnClose','MainView');await ready();report.checks.push('difficulty-'+level);}
  await button('onBtnPlay4');await button('onBtnFight');await board(15,15,50);await cell(112);b=await state();assert(b.started);await page.reload();await ready();await button('onBtnPlay5');await board(15,15,50);assert.deepEqual((await state()).nums,b.nums);report.checks.push('custom-board-refresh-continue');await shot('custom');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.missing,[]);assert.deepEqual(report.external,[]);report.passed=true;
  const specFile=path.join(root,'evidence/game-spec.json');
  if(fs.existsSync(specFile))report.spec_tests=await require('./spec_test.cjs').run({url:origin,spec:JSON.parse(fs.readFileSync(specFile,'utf8')),viewport:{width:1280,height:800}},path.join(root,'evidence/spec-tests'));
 }catch(e){report.failure=e.stack;if(page){await page.screenshot({path:path.join(root,'screenshots/failed-check.png')});report.state=await page.evaluate(()=>({board:probe.board(),buttons:probe.nodes().filter(n=>n.getComponent(cc.Button)).map(n=>({name:n.name,position:probe.position(n),events:n.getComponent(cc.Button).clickEvents.map(e=>[e.handler,e.component])}))}));}throw e}finally{fs.writeFileSync(path.join(root,'evidence/gameplay.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
