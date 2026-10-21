"""Authenticated local/team conversion API. Uploaded JS never runs in this process."""
import hashlib
import hmac
import json
import os
import re
import secrets
import shutil
import stat
import subprocess
import threading
import time
import uuid
import zipfile
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit

ROOT=Path(__file__).resolve().parent
MAX_UPLOAD=128*1024*1024
MAX_EXPANDED=256*1024*1024
APPID=re.compile(r'wx[0-9a-f]{16}')

def atomic_json(path, data):
    tmp=path.with_suffix('.tmp')
    tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    tmp.replace(path)

def extract_upload(archive, destination):
    """Accept only a manifest and wxapkg inputs, no executable server files."""
    with zipfile.ZipFile(archive) as z:
        entries=z.infolist()
        if not 1<=len(entries)<=130:raise ValueError('ZIP must contain at most 130 entries')
        seen=set();total=0
        for item in entries:
            name=item.filename;p=PurePosixPath(name)
            if '\\' in name or ':' in name or p.is_absolute() or any(x in ('..','.') for x in p.parts):raise ValueError('Unsafe ZIP path')
            if stat.S_ISLNK(item.external_attr>>16):raise ValueError('ZIP links are not accepted')
            if item.is_dir():
                if name not in ('game/','engine/'):raise ValueError('Unexpected ZIP directory')
                continue
            allowed=name=='manifest.json' or re.fullmatch(r'(game|engine)/[A-Za-z0-9_.-]+\.wxapkg',name)
            if not allowed or name.lower() in seen:raise ValueError('Unexpected or duplicate ZIP member')
            seen.add(name.lower());total+=item.file_size
            if total>MAX_EXPANDED or item.file_size>MAX_UPLOAD:raise ValueError('ZIP expansion limit exceeded')
            if name=='manifest.json' and item.file_size>16384:raise ValueError('Manifest too large')
            target=destination.joinpath(*p.parts);target.parent.mkdir(parents=True,exist_ok=True)
            with z.open(item) as source,target.open('xb') as output:
                count=0
                while block:=source.read(1024*1024):
                    count+=len(block)
                    if count>item.file_size:raise ValueError('ZIP size mismatch')
                    output.write(block)
        if 'manifest.json' not in seen:raise ValueError('manifest.json is required')
    m=json.loads((destination/'manifest.json').read_text(encoding='utf-8-sig'))
    if not isinstance(m,dict) or not APPID.fullmatch(str(m.get('appid',''))) or not APPID.fullmatch(str(m.get('engine_appid',''))):raise ValueError('Valid appid and engine_appid are required')
    if 'ad_free' in m and not isinstance(m['ad_free'],bool):raise ValueError('ad_free must be boolean')
    if not any((destination/'game').glob('*.wxapkg')) or not any((destination/'engine').glob('*.wxapkg')):raise ValueError('Both game and engine packages are required')
    atomic_json(destination/'manifest.json',m)
    return m

class Service:
    def __init__(self,data,keys=None):
        self.data=Path(data).resolve();self.jobs=self.data/'jobs';self.jobs.mkdir(parents=True,exist_ok=True)
        self.node=os.getenv('NODE_BIN') or shutil.which('node')
        if not self.node:raise RuntimeError('Node.js is required; set NODE_BIN')
        if keys is None:
            configured=os.getenv('CONVERTER_KEYS_JSON')
            if configured:keys=json.loads(configured)
            else:
                tokenfile=self.data/'local-api-key.txt'
                if not tokenfile.exists():tokenfile.write_text(secrets.token_urlsafe(36),encoding='utf-8');tokenfile.chmod(0o600)
                keys={'local':tokenfile.read_text().strip()}
        if not keys or any(not re.fullmatch(r'[A-Za-z0-9_-]{1,64}',k) or not isinstance(v,str) or len(v)<24 for k,v in keys.items()):raise ValueError('Invalid tenant keys')
        if len(set(keys.values()))!=len(keys):raise ValueError('Each tenant must have a distinct key')
        self.keys=keys;self.lock=threading.RLock();self.slots=threading.BoundedSemaphore(4);self.pool=ThreadPoolExecutor(max_workers=1)
        for file in self.jobs.glob('*/job.json'):
            data=json.loads(file.read_text())
            if data['status'] in ('queued','running'):data.update(status='interrupted',error='Service restarted; submit a new job');atomic_json(file,data)

    def owner(self,token):
        return next((name for name,key in self.keys.items() if hmac.compare_digest(key.encode('utf-8'),token.encode('utf-8'))),None)

    def read(self,jid,owner):
        if not re.fullmatch('[0-9a-f]{32}',jid):return None
        file=self.jobs/jid/'job.json'
        if not file.exists():return None
        data=json.loads(file.read_text())
        return data if data['owner']==owner else None

    def update(self,jid,**changes):
        with self.lock:
            file=self.jobs/jid/'job.json';data=json.loads(file.read_text());data.update(changes,updated_at=time.time());atomic_json(file,data)

    def run(self,jid):
        directory=self.jobs/jid
        try:
            self.update(jid,status='running',stage='converting')
            with (directory/'worker.log').open('wb') as log:
                result=subprocess.run([self.node,'--max-old-space-size=768',str(ROOT/'pipeline.cjs'),str(directory)],cwd=ROOT,stdout=log,stderr=log,timeout=180,check=False)
            reportfile=directory/'report.json'
            report=json.loads(reportfile.read_text()) if reportfile.exists() else {'reason':'Converter exited before producing a report'}
            if result.returncode:raise ValueError(report.get('reason','Converter failed'))
            self.update(jid,stage='packaging')
            with zipfile.ZipFile(directory/'web-game.zip','w',zipfile.ZIP_DEFLATED) as z:
                for file in sorted((directory/'web').rglob('*')):
                    if file.is_file():z.write(file,file.relative_to(directory/'web').as_posix())
            digest=hashlib.sha256((directory/'web-game.zip').read_bytes()).hexdigest()
            self.update(jid,status='built_unverified',stage='done',report=report,download=f'/v1/jobs/{jid}/download',sha256=digest)
        except subprocess.TimeoutExpired:self.update(jid,status='failed',stage='done',error='Conversion exceeded 180 seconds')
        except Exception as e:self.update(jid,status='failed',stage='done',error=str(e)[:1000])
        finally:self.slots.release()

class Handler(BaseHTTPRequestHandler):
    def log_message(self,format,*args):pass
    def setup(self):super().setup();self.connection.settimeout(45)
    @property
    def service(self):return self.server.service
    def send_json(self,status,body):
        payload=json.dumps(body,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(payload)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.end_headers();self.wfile.write(payload)
    def auth(self):
        value=self.headers.get('Authorization','');owner=self.service.owner(value[7:]) if value.startswith('Bearer ') else None
        if not owner:self.send_json(401,{'error':'Bearer API key required'})
        return owner
    def do_GET(self):
        path=urlsplit(self.path).path
        if path=='/health':return self.send_json(200,{'ok':True,'service':'wechat-web-converter','version':'0.1.0'})
        if path=='/':
            data=(ROOT/'docs.html').read_bytes();self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.send_header('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'");self.end_headers();self.wfile.write(data);return
        if path=='/openapi.json':return self.send_json(200,json.loads((ROOT/'openapi.json').read_text(encoding='utf-8')))
        owner=self.auth()
        if not owner:return
        if path=='/v1/jobs':
            with self.service.lock:
                rows=[json.loads(p.read_text()) for p in self.service.jobs.glob('*/job.json')]
            return self.send_json(200,{'jobs':sorted((r for r in rows if r['owner']==owner),key=lambda x:x['created_at'],reverse=True)[:100]})
        match=re.fullmatch(r'/v1/jobs/([0-9a-f]{32})(/download)?',path)
        with self.service.lock:job=self.service.read(match[1],owner) if match else None
        if not job:return self.send_json(404,{'error':'Job not found'})
        if not match[2]:return self.send_json(200,job)
        if job['status']!='built_unverified':return self.send_json(409,{'error':'Artifact not ready'})
        file=self.service.jobs/job['id']/'web-game.zip';self.send_response(200);self.send_header('Content-Type','application/zip');self.send_header('Content-Length',str(file.stat().st_size));self.send_header('Content-Disposition',f'attachment; filename="web-game-{job["id"]}.zip"');self.send_header('X-Content-Type-Options','nosniff');self.end_headers()
        with file.open('rb') as source:shutil.copyfileobj(source,self.wfile)

    def do_POST(self):
        if urlsplit(self.path).path!='/v1/jobs':return self.send_json(404,{'error':'Route not found'})
        owner=self.auth()
        if not owner:return
        if self.headers.get('Content-Type','').split(';')[0]!='application/zip':return self.send_json(415,{'error':'Send a ZIP as application/zip'})
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:length=0
        if not 0<length<=MAX_UPLOAD:return self.send_json(413,{'error':'ZIP must be between 1 byte and 128 MiB'})
        if not self.service.slots.acquire(blocking=False):return self.send_json(429,{'error':'Queue full; retry later'})
        jid=uuid.uuid4().hex;directory=self.service.jobs/jid;directory.mkdir();queued=False
        try:
            # Bound retained job count instead of accepting unbounded disk growth.
            if len(list(self.service.jobs.iterdir()))>100:raise ValueError('Storage quota reached; operator must archive old jobs')
            with (directory/'input.zip').open('xb') as out:
                remaining=length
                while remaining:
                    block=self.rfile.read(min(1024*1024,remaining))
                    if not block:raise ValueError('Incomplete request body')
                    out.write(block);remaining-=len(block)
            m=extract_upload(directory/'input.zip',directory/'input')
            job=dict(id=jid,owner=owner,status='queued',stage='queued',created_at=time.time(),updated_at=time.time(),appid=m['appid'],ad_free=m.get('ad_free',False))
            atomic_json(directory/'job.json',job);self.service.pool.submit(self.service.run,jid);queued=True
            self.send_json(202,job)
        except (ValueError,zipfile.BadZipFile,KeyError,UnicodeError,OSError) as e:self.send_json(400,{'error':str(e)[:500]})
        finally:
            if not queued:
                self.service.slots.release();shutil.rmtree(directory)

def make_server(service,host='127.0.0.1',port=8770):
    server=ThreadingHTTPServer((host,port),Handler);server.service=service;return server

if __name__=='__main__':
    service=Service(os.getenv('CONVERTER_DATA',str(ROOT/'data')))
    host=os.getenv('CONVERTER_HOST','127.0.0.1');port=int(os.getenv('PORT','8770'))
    server=make_server(service,host,port)
    print(f'Converter ready: http://{host}:{port}/ (API keys are never printed)',flush=True)
    server.serve_forever()
