// Render the hash-checked original business code and current code under identical local hosting.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
async function compare(root,reference,out,plan,currentInput=null){
 root=path.resolve(root);fs.mkdirSync(out,{recursive:true});
 const overrides=JSON.parse(fs.readFileSync(reference,'utf8'));
 const current=currentInput?JSON.parse(fs.readFileSync(currentInput,'utf8')).files:null;
 const report={passed:false,scope:'Captured original versus current business code; both use the documented local host and font fallback. Only listed states compared.',cases:[],errors:[]};
 const server=http.createServer((req,res)=>{
  const parts=decodeURIComponent(new URL(req.url,'http://local').pathname).split('/').filter(Boolean),variant=parts.shift(),name=parts.join('/')||'index.html';
  const p=path.resolve(root,name);
  if(!['original','current'].includes(variant)||!p.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  const text=variant==='original'&&Object.hasOwn(overrides,name)?overrides[name]:current&&Object.hasOwn(current,name)?current[name]:null;
  if(text===null&&(!fs.existsSync(p)||!fs.statSync(p).isFile())){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.webp':'image/webp','.png':'image/png','.mp3':'audio/mpeg','.json':'application/json'})[path.extname(p)]||'application/octet-stream');res.end(text===null?fs.readFileSync(p):typeof text==='string'?text:Buffer.from(text.content,'base64'));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch(require('./browser-options.cjs')());
 try{
  if(!Array.isArray(plan)||!plan.length||plan.length>12)throw Error('Comparison requires 1-12 states');
  const pairs=[];
  for(const variant of ['original','current']){
   const context=await browser.newContext({viewport:{width:720,height:1280},serviceWorkers:'block'});
   await context.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(variant+': '+e.message));
   await page.addInitScript(()=>{let seed=73421;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
   await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
   await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
   await page.goto(origin+'/'+variant+'/index.html',{waitUntil:'load'});
   // Network/decode completion is real; advance startup timers in the same fixed slices.
   for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,50));await page.clock.runFor(100);}
   pairs.push({variant,page,context});
  }
  for(const [i,item] of plan.entries()){
   const shots=[];
   if(!Array.isArray(item.actions)||item.actions.length>8)throw Error('Comparison action bound exceeded');
   for(const {variant,page} of pairs){
    for(const action of item.actions){
     if(action.type==='click')await page.locator(action.selector).click({timeout:3000});
     else if(action.type==='hold'){
      if(!Number.isFinite(action.ms)||action.ms<1||action.ms>3000)throw Error('Invalid comparison hold');
      await page.keyboard.down(action.key);try{await page.clock.runFor(action.ms);}finally{await page.keyboard.up(action.key);}
     }else throw Error('Unsupported comparison input');
    }
    await page.clock.runFor(1000);
    shots.push(await page.screenshot({path:path.join(out,`${i}-${variant}.png`),animations:'disabled'}));
   }
   report.cases.push({name:item.name||String(i),pixel_identical:shots[0].equals(shots[1]),original:`${i}-original.png`,current:`${i}-current.png`});
  }
  report.passed=!report.errors.length&&report.cases.every(c=>c.pixel_identical);
 }catch(e){report.errors.push(e.message);}finally{
  await browser.close();await new Promise(r=>server.close(r));fs.writeFileSync(path.join(out,'render-comparison.json'),JSON.stringify(report,null,2));
 }
 return report;
}
module.exports={compare};
if(require.main===module)compare(process.argv[2],process.argv[3],process.argv[4],JSON.parse(fs.readFileSync(process.argv[5],'utf8')),process.argv[6]).then(r=>{process.exitCode=r.passed?0:2;}).catch(e=>{console.error(e);process.exitCode=1;});
