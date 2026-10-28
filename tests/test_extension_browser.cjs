const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {launchBrowser,CONFIG}=require('../executors/extension-browser.cjs');
test('installed NetBlock loads, filters routed resources and preserves task isolation',{skip:!fs.existsSync(CONFIG)},async()=>{
 const report={},browser=await launchBrowser(report);
 try{
  const context=await browser.newContext({serviceWorkers:'block',storageState:{cookies:[],origins:[{origin:'https://fixture.example',localStorage:[{name:'authorized',value:'yes'}]}]}});
  assert.equal(report.browser_extension.loaded,true);
  assert.ok(report.browser_extension.rule_count>0);
  const req=(url,type='script')=>({url:()=>url,resourceType:()=>type,method:()=> 'GET'});
  assert.equal(await context.extensionBlock(req('https://doubleclick.net/ad.js?secret=hidden'),{source:'https://fixture.example',mainFrame:false}),true);
  assert.equal(await context.extensionBlock(req('https://fixture.example/game.js'),{source:'https://fixture.example',mainFrame:false}),false);
  assert.equal(await context.extensionBlock(req('https://doubleclick.net/','document'),{mainFrame:true}),false);
  assert.ok(!JSON.stringify(report).includes('secret'));
  let downloaded=0;
  await context.route('**/*',async route=>{
   if(await context.extensionBlock(route.request(),{source:'https://fixture.example'}))return route.abort('blockedbyclient');
   downloaded++;
   return route.fulfill({contentType:'text/html',body:'<script src="https://doubleclick.net/ad.js"></script><div id="game">game</div>'});
  });
  const page=await context.newPage();await page.goto('https://fixture.example/');
  assert.equal(await page.locator('#game').textContent(),'game');
  assert.equal(downloaded,1);
  assert.equal(await page.evaluate(()=>localStorage.getItem('authorized')),'yes');
 }finally{await browser.close();}
});
