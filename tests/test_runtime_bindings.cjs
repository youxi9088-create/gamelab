const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('../executors/node_modules/playwright');
test('dynamic image binding keeps query identity and nested package base',async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage(),requests=[];
  await page.route('**/*',async r=>{
   const u=r.request().url();requests.push(u);
   if(u==='https://local.example/runtime/fixture/index.html')return r.fulfill({contentType:'text/html',body:'<html><head></head><body></body></html>'});
   if(u==='https://local.example/runtime/fixture/image.svg')return r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'});
   return r.abort();
  });
  await page.goto('https://local.example/runtime/fixture/index.html');
  await page.evaluate(()=>{window.runtimeResourceBindings={'https://assets.example/image.svg?v=2':'./image.svg'}});
  await page.addScriptTag({content:fs.readFileSync('executors/adapters/runtime-resource-bindings.js','utf8')});
  assert.equal(await page.evaluate(()=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth);i.onerror=()=>resolve(-1);i.src='https://'+'assets.example/image.svg?v=2'})),1);
  assert.ok(requests.includes('https://local.example/runtime/fixture/image.svg'));
  assert.ok(!requests.some(u=>u.startsWith('https://assets.example/')));
  const styled=await page.evaluate(()=>{const e=document.createElement('div');e.style.backgroundImage='url("https://assets.example/image.svg?v=2")';document.body.append(e);return e.style.backgroundImage});
  assert.ok(styled.includes('/runtime/fixture/image.svg'));
  const other=await page.evaluate(()=>{const i=new Image();i.src='https://assets.example/image.svg?v=3';return i.src});
  assert.equal(other,'https://assets.example/image.svg?v=3');
 }finally{await browser.close();}
});
