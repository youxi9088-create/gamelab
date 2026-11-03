const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require('../executors/node_modules/playwright');
const {verifyInteraction}=require('../executors/dom-entry.cjs');
const {observedDOMPlan}=require('../executors/dom-runtime-plan.cjs');
const {detect}=require('../executors/discovered-web.cjs');
(async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'observed-dom-plan-')),dir=path.join(run,'entry-probes/dom-1');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage(),url='https://dom-fixture.example/game';
  const html='<html><body><h1>Fixture menu</h1><button id="start">Begin</button><script>document.querySelector("#start").onclick=()=>{document.querySelector("h1").textContent="Fixture round started";document.querySelector("#start").textContent="Next turn"}</script></body></html>';
  await page.route('**/*',r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(url);
  const proof=await verifyInteraction(page,'Begin',dir,{waitMs:1000});assert.equal(proof.passed,true);
  fs.writeFileSync(path.join(dir,'interaction.json'),JSON.stringify({...proof,url}));
  const input={url,entry_evidence:{evidence:'interactive-dom',interaction_verified:true,interaction_evidence:'entry-probes/dom-1/interaction.json'}};
  assert.equal(detect(html,null),'browser');const plan=observedDOMPlan(input,run,html,null);assert.equal(detect(html,plan),'browser-dom');assert.ok(plan.dom_evidence_sha256);
  assert.equal(observedDOMPlan({...input,url:url+'/other'},run,html,null),null);
  assert.equal(observedDOMPlan({...input,entry_evidence:{...input.entry_evidence,interaction_evidence:'../outside.json'}},run,html,null),null);
  console.log('Actual DOM interaction selects DOM readiness; mismatched evidence cannot select it');
 }finally{await browser.close();fs.rmSync(run,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
