"""Temporary localhost observation server; no game state or input automation."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
import json,sys,os,datetime,threading,urllib.parse
root=Path(sys.argv[1]).resolve();evidence=Path(sys.argv[2]).resolve();evidence.mkdir(exist_ok=True);lock=threading.Lock()
def append(name,value):
 with lock:
  with (evidence/name).open('a',encoding='utf8')as stream:stream.write(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),**value},ensure_ascii=False)+'\n')
observer=b'''(()=>{const endpoint='/__observe';let seq=0;function send(event){try{navigator.sendBeacon(endpoint,JSON.stringify({seq:++seq,...event}))}catch(e){}}function describe(v){try{return typeof v==='string'?v:v instanceof Error?v.stack||String(v):JSON.stringify(v)}catch(e){return String(v)}}for(const name of ['warn','error']){const original=console[name];console[name]=function(...args){send({type:'console',level:name,args:args.map(describe)});return original.apply(this,args)}}addEventListener('error',e=>send({type:'error',message:e.message||'resource error',filename:e.filename,line:e.lineno,target:e.target?.src||e.target?.href||null}),true);addEventListener('unhandledrejection',e=>send({type:'unhandledrejection',message:describe(e.reason)}));addEventListener('securitypolicyviolation',e=>send({type:'securitypolicyviolation',blockedURI:e.blockedURI,directive:e.effectiveDirective}));performance.setResourceTimingBufferSize(10000);addEventListener('resourcetimingbufferfull',()=>send({type:'resource_buffer_full'}));new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.name.includes('/__observe'))continue;send({type:'resource',url:e.name,initiatorType:e.initiatorType,responseStatus:e.responseStatus??null,transferSize:e.transferSize,duration:e.duration})}}).observe({type:'resource',buffered:true});function state(type,e){send({type,locked:!!document.pointerLockElement,lockTarget:document.pointerLockElement?.tagName||null,focused:document.hasFocus(),visibility:document.visibilityState,active:navigator.userActivation?.isActive??null,trusted:e?.isTrusted??null,key:e?.code??null,target:e?.target?.tagName??null,text:e?.target?.tagName==='BUTTON'?e.target.textContent.slice(0,100):null})}for(const type of ['pointerlockchange','pointerlockerror','visibilitychange'])document.addEventListener(type,e=>state(type,e));for(const type of ['focus','blur','pageshow','pagehide'])addEventListener(type,e=>state(type,e));for(const type of ['pointerdown','pointerup','click','keydown','keyup'])addEventListener(type,e=>state(type,e),true);send({type:'observer_started',url:location.href,scope:'Read-only error/resource observation, no gameplay state or simulated input'});})();'''
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'");super().end_headers()
 def reply(self,data,mime):
  self.send_response(200);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
 def do_GET(self):
  append('requests.jsonl',{'method':'GET','path':self.path})
  if self.path=='/__diagnostic':return self.reply(b'<!doctype html><title>Find the Needle remote verification</title><h1>Remote-only diagnostic</h1><p>Game not started.</p><a href="/index.html">Open original candidate</a>','text/html; charset=utf-8')
  if self.path=='/__observe.js':return self.reply(observer,'text/javascript; charset=utf-8')
  if self.path.split('?')[0]in ['/','/index.html']:
   data=(root/'index.html').read_text(encoding='utf8').replace('<head>','<head><script src="/__observe.js"></script>',1).encode();return self.reply(data,'text/html; charset=utf-8')
  return super().do_GET()
 def do_POST(self):
  assert self.path in ['/__observe','/__diagnostic-event'];size=int(self.headers.get('Content-Length','0'));assert 0<=size<=1000000;data=json.loads(self.rfile.read(size));append('diagnostic-events.jsonl' if self.path=='/__diagnostic-event' else 'browser-events.jsonl',data);self.send_response(204);self.end_headers()
server=ThreadingHTTPServer(('127.0.0.1',57588),Handler);ready={'pid':os.getpid(),'port':server.server_port,'url':'http://127.0.0.1:'+str(server.server_port)+'/__diagnostic','root':str(root),'at':datetime.datetime.now(datetime.timezone.utc).isoformat()};(evidence/'server-ready.json').write_text(json.dumps(ready),encoding='utf8');server.serve_forever()
