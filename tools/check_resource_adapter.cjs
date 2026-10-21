// Authored fixture: prove captured URL bindings work without outbound requests.
const {chromium}=require('../executors/node_modules/playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const html=`<html><head><script>window.localRemoteResources={'https://resources.example/data.json':'data.json','https://resources.example/pixel.png':'pixel.png'}</script><script src="adapter.js"></script></head><body><script>
 const image=new Image();const loaded=new Promise((yes,no)=>{image.onload=()=>yes(image.naturalWidth);image.onerror=no});image.src='https://resources.example/pixel.png';document.body.append(image);
 const xhr=new Promise((yes,no)=>{const x=new XMLHttpRequest();x.open('GET','https://resources.example/data.json');x.onload=()=>yes(JSON.parse(x.responseText).value);x.onerror=no;x.send()});
 Promise.all([fetch('https://resources.example/data.json').then(r=>r.json()).then(r=>r.value),xhr,loaded]).then(values=>{window.results=values});
 </script></body></html>`;
 const server=http.createServer((req,res)=>{
  if(req.url==='/adapter.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync('executors/adapters/remote-resources.js'));}
  else if(req.url==='/data.json'){res.setHeader('Content-Type','application/json');res.end('{"value":42}');}
  else if(req.url==='/pixel.png'){res.setHeader('Content-Type','image/png');res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XcAAAAASUVORK5CYII=','base64'));}
  else{res.setHeader('Content-Type','text/html');res.end(html);}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage(),external=[],errors=[];
  await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():(external.push(r.request().url()),r.abort()));
  page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);
  await page.waitForFunction(()=>window.results);
  assert.deepEqual(await page.evaluate(()=>window.results),[42,42,1]);assert.deepEqual(external,[]);assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
