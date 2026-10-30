const assert=require('assert/strict');
const {chromium}=require('../executors/node_modules/playwright');
const {frameState}=require('../executors/frame-visibility.cjs');
(async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage();
  await page.setContent(`<iframe title="Main" style="width:800px;height:600px;opacity:1"></iframe>
   <iframe title="Portal" inert aria-hidden="true" style="width:800px;height:600px;opacity:0"></iframe>
   <div style="opacity:0"><iframe title="Nested"></iframe></div>`);
  const states=[];
  for(const h of await page.locator('iframe').elementHandles())states.push(await h.evaluate(frameState));
  assert.equal(states[0].visible,true);
  assert.equal(states[1].visible,false);
  assert(states[1].hidden_reasons.includes('inert'));
  assert(states[1].hidden_reasons.includes('opacity-zero'));
  assert.equal(states[2].visible,false);
  console.log('Frame visibility checks passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
