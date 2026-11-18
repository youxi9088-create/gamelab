"""Localhost-only read-only resource/error observation. No game input or SDK callbacks."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import json,sys,os,datetime,threading,urllib.parse,time
root=Path(sys.argv[1]).resolve();evidence=Path(sys.argv[2]).resolve();port=int(sys.argv[3]);assert port==57602
assert root==Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/candidate').resolve()
assert evidence==Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118').resolve()
evidence.mkdir(exist_ok=True);lock=threading.Lock()
def append(name,value):
 with lock:
  with (evidence/name).open('a',encoding='utf8')as f:f.write(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),**value},ensure_ascii=False)+'\n')
observer=b'''(()=>{let seq=0;function clean(v){return String(v).replace(/([?&](?:key|token|access_token|refresh_token|password|secret|auth)=)[^&#\\s]+/gi,'$1[redacted]')}function safeurl(v){try{const u=new URL(v,location.href);return u.origin+u.pathname}catch{return clean(v)}}function describe(v){try{return clean(v instanceof Error?v.stack||String(v):typeof v==='string'?v:JSON.stringify(v))}catch{return'[unserializable]'}}function send(event){try{navigator.sendBeacon('/__observe',JSON.stringify({seq:++seq,...event}))}catch{}}for(const name of['warn','error']){const original=console[name];console[name]=function(...args){send({type:'console',level:name,args:args.map(describe)});return original.apply(this,args)}}addEventListener('error',e=>send({type:'error',message:clean(e.message||'resource error'),filename:safeurl(e.filename||''),line:e.lineno,target:e.target?.src||e.target?.href?safeurl(e.target.src||e.target.href):null}),true);addEventListener('unhandledrejection',e=>send({type:'unhandledrejection',message:describe(e.reason)}));addEventListener('securitypolicyviolation',e=>send({type:'securitypolicyviolation',blockedURI:safeurl(e.blockedURI),directive:e.effectiveDirective}));performance.setResourceTimingBufferSize(15000);addEventListener('resourcetimingbufferfull',()=>send({type:'resource_buffer_full'}));new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.name.includes('/__observe'))continue;send({type:'resource',url:safeurl(e.name),initiatorType:e.initiatorType,responseStatus:e.responseStatus??null,transferSize:e.transferSize,duration:e.duration})}}).observe({type:'resource',buffered:true});send({type:'observer_started',url:safeurl(location.href),scope:'Error/resource observation only; no simulated input, SDK callback or game state mutation'});})();'''
class Handler(SimpleHTTPRequestHandler):
 extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.wasm':'application/wasm','.data':'application/octet-stream','.bundle':'application/octet-stream','.hash':'text/plain; charset=ascii','.json':'application/json','.woff2':'font/woff2'}
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'")
  self.send_header('Cache-Control','no-store');super().end_headers()
 def reply(self,raw,mime,status=200):
  self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
 def do_GET(self):
  path=urllib.parse.urlsplit(self.path).path;append('requests.jsonl',{'method':'GET','path':path})
  if path=='/__diagnostic':return self.reply(b'<!doctype html><title>Smash isolated verification</title><h1>Smash isolated verification</h1><p>Game not started. Reserve one of the five authorized player steps before navigating to index.html.</p>','text/html; charset=utf-8')
  if path=='/__observe.js':return self.reply(observer,'text/javascript; charset=utf-8')
  if path in ['/','/index.html']:
   ledger=json.loads((evidence/'ui-ledger.json').read_text(encoding='utf8'))
   if not(ledger['steps']and ledger['steps'][-1]['status']=='reserved'and ledger['used']<=5):
    return self.reply(b'Game not started: no reserved player step','text/plain',409)
   html=(root/'index.html').read_text(encoding='utf8');assert html.count('<head>')==1
   return self.reply(html.replace('<head>','<head><script src="/__observe.js"></script>',1).encode(),'text/html; charset=utf-8')
  return super().do_GET()
 def do_POST(self):
  if self.path!='/__observe':return self.reply(b'Not found','text/plain',404)
  n=int(self.headers.get('Content-Length','0'));assert 0<n<=1000000
  value=json.loads(self.rfile.read(n));assert isinstance(value,dict);append('browser-events.jsonl',value);self.send_response(204);self.end_headers()
server=ThreadingHTTPServer(('127.0.0.1',port),Handler);server.daemon_threads=True
ready={'pid':os.getpid(),'port':port,'url':'http://127.0.0.1:'+str(port)+'/__diagnostic','root':str(root),'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deadline_seconds':600,'game_started':False}
(evidence/'server-ready.json').write_bytes(json.dumps(ready,indent=2).encode())
threading.Timer(600,server.shutdown).start()
try:server.serve_forever()
finally:
 server.server_close();append('server-terminal.jsonl',{'status':'stopped','pid':os.getpid()})
