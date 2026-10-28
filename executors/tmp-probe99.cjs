// 临时诊断：离线运行已补齐的运行包，观察 150s 内是否进入主菜单
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(process.argv[2]);
const server=http.createServer((req,res)=>{
 let p;try{p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));}catch{res.writeHead(400);return res.end();}
 if(p===root)p=path.join(root,'index.html');
 if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);return res.end();}
 const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.swf':'application/x-shockwave-flash'};
 res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const transport=`http://127.0.0.1:${server.address().port}`,origin='https://replica-runtime.invalid';
 const proxy=(process.env.HTTPS_PROXY||process.env.https_proxy||process.env.HTTP_PROXY||process.env.http_proxy||'').trim();
 const opts=proxy?{proxy:{server:proxy,bypass:'127.0.0.1,localhost,[::1]'}}:{};
 const browser=await chromium.launch(require('./browser-options.cjs')());
 const c=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block',...opts});
 const missing=[],errors=[],external=[];
 await c.route('**/*',async r=>{const req=r.request(),u=new URL(req.url());
  if(u.origin===origin&&['GET','HEAD'].includes(req.method())){
   let response;try{response=await r.fetch({url:transport+u.pathname+u.search,maxRedirects:0});}catch{return;}
   try{await r.fulfill({response});}catch{}finally{await response.dispose().catch(()=>{});}return;
  }
  if(['data:','blob:'].includes(u.protocol))return r.continue();
  external.push(u.origin+u.pathname);return r.abort();
 });
 const page=await c.newPage();
 page.on('pageerror',e=>errors.push(String(e.message).slice(0,300)));
 page.on('response',r=>{if(r.status()>=400)missing.push(r.url().replace(origin,''));});
 await page.goto(origin,{waitUntil:'domcontentloaded'});
 const t0=Date.now();
 for(let i=0;i<15;i++){
  await page.waitForTimeout(10000);
  let info;
  try{
   info=await page.evaluate(()=>({
    text:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,200),
    canvas:[...document.querySelectorAll('canvas')].map(c=>c.width+'x'+c.height),
    loadText:[...document.querySelectorAll('*')].filter(n=>/加载|%/i.test(n.textContent||'')&&n.children.length===0).map(n=>n.textContent.trim().slice(0,60)).slice(0,5)
   }));
  }catch(e){info={error:e.message};}
  console.log('t=+'+Math.round((Date.now()-t0)/1000)+'s', JSON.stringify(info));
 }
 await page.screenshot({path:path.join(root,'screenshots/probe-final.png')});
 console.log('missing404',JSON.stringify([...new Set(missing)].slice(0,10)));
 console.log('pageerrors',JSON.stringify(errors.slice(0,5)));
 console.log('externalBlocked',JSON.stringify([...new Set(external)].slice(0,10)));
 await browser.close();await new Promise(r=>server.close(r));process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
