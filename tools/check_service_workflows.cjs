const {chromium}=require('../executors/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../web'),out=path.resolve('qa-output/service-workflows');fs.mkdirSync(out,{recursive:true});
const state={candidates:[],versions:[],jobs:[{id:'a',status:'running'},{id:'b',status:'review'},{id:'c',status:'queued',manual_paused:true}],batches:[],sources:[],tools:[],events:[],messages:[],rounds:[],settings:{},features:{},metrics:{},usage:{},operation_stats:{},
 supply_service:{configured:true,delivery_mode:'cs',values:{SUPPLY_PLATFORM_BASE:'https://downstream.example'},check:{identity:'verified',checked_at:'2026-11-03T10:00:00Z'}},
 supply:[{status:'pending'},{submitted:true,state:'building'},{submitted:true,state:'published'},{submitted:true,status:'blocked',state:'needs_your_fix',error_code:'RESOURCE_MISSING',recovery:{action:'补齐交付包中的真实资源'}},{submitted:true,state:'failed',next_action:'platform',error_code:'TOOLCHAIN_ERROR',notice:'下游排查构建工具链'},{submitted:true,status:'retrying',error_code:'NETWORK_ERROR'},{submitted:true,state:'future_state'}]};
const services=[{id:'wechat',backend:'builtin',status:'已连接',detail:'内置执行器心跳正常；不代表每款游戏都能转换成功。',last_seen:'2026-11-03T10:00:00Z'},{id:'ai',backend:'api',connection_label:'兼容 API',status:'待检测',base_url:'https://ai.example',model:'fixture',detail:'等待实际检测'}];
let server;
(async()=>{
 const {supplyOverview,supplyWorkflow}=await import('../web/service-workflows.js');
 assert.deepEqual(supplyOverview(state).counts,{pending:1,processing:1,retrying:1,published:1,supplier:1,platform:1,other:1});
 assert.equal(supplyOverview({...state,operation_stats:{kpis:{supplied_games:5937}}}).total,7);
 assert(supplyWorkflow({supply:[{status:'blocked',error_code:'<script>x</script>'}]},{esc:s=>String(s).replaceAll('<','&lt;'),date:String}).includes('&lt;script>'));
 server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://fixture.test').pathname;
  if(pathname.startsWith('/api/')){assert.equal(req.method,'GET','No mutation allowed');res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(pathname==='/api/auth/status'?{required:false,authenticated:true,user:{role:'admin'}}:pathname==='/api/session'?{csrf:'fixture'}:pathname==='/api/state'?state:pathname==='/api/services'?services:{}));}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1360,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/#tools`);await page.locator('.service-flow').first().waitFor();
  assert.equal(await page.locator('.service-flow').count(),2);
  const text=await page.locator('.service-grid').innerText();
  for(const expected of ['最近心跳','入口识别','离线与玩法验证','上次身份验证通过','RESOURCE_MISSING','TOOLCHAIN_ERROR','待重试','待核对','7 条实际供货记录'])assert(text.includes(expected),expected);
  await page.locator('.service-grid').screenshot({path:path.join(out,'desktop.png')});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.supply-workflow-card').screenshot({path:path.join(out,'mobile-supply.png')});
  services[0].status='待连接';services[0].last_seen=null;services[0].detail='尚未收到有效心跳，请检查执行器进程。';await page.reload();await page.getByText('待连接',{exact:true}).waitFor();
  assert.equal(await page.locator('[data-service-test="wechat"]').isEnabled(),true);assert.deepEqual(errors,[]);
  console.log('PASS: supply grouping, unknown state, historical count exclusion, escaping, actual desktop/mobile rendering and heartbeat states');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server?.close());
