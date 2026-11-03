const {chromium}=require('../executors/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../web'),out=path.resolve(process.argv[2]||'qa-output/catalog-cards');fs.mkdirSync(out,{recursive:true});
const candidates=[],versions=[],jobs=[];
for(let i=0;i<8;i++){candidates.push({id:'library-'+i,title:['星际连线','森林咖啡馆','泡泡合成挑战','神庙历险','像素赛车','海岛农场','节奏派对','甜品小铺'][i],category:i%2?'模拟经营':'益智',source:'Remix',status:'approved',engine:'Three.js',created_at:'2026-11-01',description:'长篇描述应留在详情，卡片只展示必要信息。'});versions.push({id:'v-'+i,candidate_id:'library-'+i,status:'approved',preview_mode:'external',preview_url:'http://127.0.0.1:9999/index.html',entry:'index.html',created_at:'2026-11-01',screenshots:[]});}
for(const status of ['queued','running','failed','blocked','review','completed','superseded']){const id='assigned-'+status;candidates.push({id,title:'任务中的游戏 '+status,status:'discovered',category:'动作',source:'Astrocade'});jobs.push({id:'job-'+status,candidate_id:id,status,stage:'reconstruct',created_at:'2026-11-01'});}
for(let i=0;i<4;i++)candidates.push({id:'available-'+i,title:['新的方块拼图','彩色小花园','轻松保龄球','海底寻宝'][i],status:'discovered',category:'益智',source:i%2?'Astrocade':'Remix',created_at:'2026-11-02'});
const state={candidates,versions,jobs,batches:[],sources:[],tools:[],events:[],messages:[],rounds:[],supply:[],settings:{concurrency:6},features:{},metrics:{},usage:{},operation_stats:{}};
let server;
(async()=>{
 server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://fixture.test').pathname;
  if(pathname.startsWith('/api/')){assert.equal(req.method,'GET','No fixture mutation expected');res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(pathname==='/api/auth/status'?{required:false,authenticated:true,user:{role:'admin'}}:pathname==='/api/session'?{csrf:'fixture'}:pathname==='/api/state'?state:{}));}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);return res.end();}
  try{const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1360,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/#library`);await page.locator('.compact-card').first().waitFor();
  assert.equal(await page.locator('.compact-card').count(),8);assert.equal(await page.locator('.compact-card .game-description,.compact-card .gamemeta').count(),0);
  assert.equal(await page.locator('.compact-card [data-play]').count(),8);
  await page.locator('#discover').scrollIntoViewIfNeeded();await page.locator('.compact-cards').screenshot({path:path.join(out,'library-desktop.png')});
  await page.setViewportSize({width:390,height:844});await page.locator('#discover').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,'library-mobile.png')});
  await page.setViewportSize({width:1360,height:960});await page.goto(`http://127.0.0.1:${server.address().port}/#candidates`);await page.locator('[data-select="available-0"]').waitFor();
  assert.equal(await page.locator('.compact-card').count(),4);assert.equal(await page.getByText('任务中的游戏',{exact:false}).count(),0);
  await page.locator('[data-select="available-0"]').click();assert.equal(await page.locator('[data-select="available-0"]').getAttribute('aria-pressed'),'true');
  await page.screenshot({path:path.join(out,'candidates-desktop.png')});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,'candidates-mobile.png')});
  assert.deepEqual(errors,[]);console.log('PASS: compact cards, existing task exclusion across all statuses, selection feedback, desktop/mobile overflow; screenshots saved');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server?.close());
