const {chromium}=require('../executors/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const dir=process.argv[2],v=JSON.parse(fs.readFileSync(path.join(dir,'fish-version.json'),'utf8').replace(/^\uFEFF/,''));
 const report={version:v.id,url:v.preview_url,scope:'Existing browser controls and resource loading; not original-game equivalence',errors:[],failedRequests:[],checks:[],passed:false};
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{const p=await b.newPage({viewport:{width:1100,height:900}});p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.failedRequests.push({url:r.url(),status:r.status()})});
 await p.goto(v.preview_url);await p.waitForFunction(()=>document.querySelector('canvas')?.dataset.state==='select');
 await p.screenshot({path:path.join(dir,'fish-selection.png')});
 for(const a of v.report.acceptance_actions){
  if(a.type==='click')await p.locator(a.selector).click();
  else if(a.type==='key')await p.keyboard.press(a.key);
  else throw Error('Unsupported action '+a.type);
  if(a.assert_selector)await p.locator(a.assert_selector).waitFor({state:'visible',timeout:5000});
  if(a.expect_text)await p.waitForFunction(text=>document.body.innerText.includes(text),a.expect_text,{timeout:5000});
  report.checks.push(a);
 }
 await p.locator('[data-game-action="start"]').click();
 await p.screenshot({path:path.join(dir,'fish-play.png')});
 report.passed=!report.errors.length&&!report.failedRequests.length;
 }catch(e){report.failure=e.message;}finally{fs.writeFileSync(path.join(dir,'fish-validation.json'),JSON.stringify(report,null,2));await b.close();}
 console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
})();
