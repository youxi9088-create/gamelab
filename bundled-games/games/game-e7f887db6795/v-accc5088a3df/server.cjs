const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname; const originalRoot = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.wasm':'application/wasm','.data':'application/octet-stream','.json':'application/json','.bundle':'application/octet-stream','.bin':'application/octet-stream','.png':'image/png'};
http.createServer((req,res)=>{
  if(!['127.0.0.1:8791','localhost:8791'].includes(req.headers.host)){res.writeHead(403);res.end('Unsupported host');return;}
  const url=new URL(req.url,'http://127.0.0.1'); res.on('finish',()=>{if(url.pathname!=='/__log')fs.appendFileSync(path.join(root,'requests.log'),new Date().toISOString()+' '+req.method+' '+url.pathname+' '+res.statusCode+'\n')});
  if(req.headers.host==='127.0.0.1:8791' && ['/', '/index.html'].includes(url.pathname)){res.writeHead(302,{'Location':'http://localhost:8791/'+url.search,'Cache-Control':'no-store'});res.end();return;}
  if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,game:'Frost Land',package:'review-1.0'}));return;}
  if(url.pathname==='/__log' && req.method==='POST') { let body=''; req.on('data',x=>{if(body.length<16000)body+=x}); req.on('end',()=>{console.log('BROWSER',body);fs.appendFileSync(path.join(root,'browser.log'),new Date().toISOString()+' '+body+'\n');res.end('ok')});return; }
  let name;try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  if(name.includes('\\')||name.split('/').some(x=>x.startsWith('.'))||!(name==='/'||name==='/index.html'||name.startsWith('/Build/')||name.startsWith('/StreamingAssets/'))){res.writeHead(404);res.end('Not found');return;}
  const route=name==='/'?'/index.html':name; const file=path.resolve(root,'.'+route);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  const servedFile=(route.startsWith('/Build/') || route.startsWith('/StreamingAssets/')) && !['/Build/game.data','/Build/full-replacement.data','/Build/no-ads.framework.js','/Build/direct.data','/Build/trace.framework.js'].includes(route) ? path.resolve(originalRoot,route==='/Build/original.data'?'Build/game.data':'.'+route) : file; fs.stat(servedFile,(err,stat)=>{
    if(err||!stat.isFile()){console.log('MISSING',name);res.writeHead(404);res.end('Not found');return}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD'){res.end();return;}
    const stream=fs.createReadStream(servedFile);stream.on('error',()=>res.destroy());stream.pipe(res);
  });
}).on('error',error=>{console.error(error.code==='EADDRINUSE'?'8791 is already in use. Open http://localhost:8791/ or stop the existing server.':error.message);process.exitCode=1;}).listen(8791,'127.0.0.1',()=>console.log('Local: http://localhost:8791'));


