"""Game replication control plane. Local-first, no third-party runtime dependencies."""
import argparse
import io
import json
import mimetypes
import os
import secrets
import threading
import traceback
import zipfile
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
from controlplane.service import Service, ApiError, require

ROOT=Path(__file__).resolve().parent

class Handler(BaseHTTPRequestHandler):
    server_version='GameCenter/1.0'
    def log_message(self,fmt,*args):
        # Avoid putting bearer tokens, payloads or query parameters in logs.
        print(f'[{self.command}] {urlsplit(self.path).path} {args[1] if len(args)>1 else ""}',flush=True)

    def send(self,status,body,content_type='application/json; charset=utf-8',headers=None):
        if isinstance(body,(dict,list)):body=json.dumps(body,ensure_ascii=False).encode()
        elif isinstance(body,str):body=body.encode()
        self.send_response(status)
        self.send_header('Content-Type',content_type)
        self.send_header('Content-Length',str(len(body)))
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Cache-Control','no-store')
        if not self.server.playback:
            self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; frame-src http://127.0.0.1:* http://localhost:*; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        for k,v in (headers or {}).items():self.send_header(k,v)
        self.end_headers();self.wfile.write(body)

    def hostname_valid(self):
        host=self.headers.get('Host','')
        require(host in (f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'),'不支持的 Host',403)

    def cookie(self):
        cookie=SimpleCookie()
        try:cookie.load(self.headers.get('Cookie',''))
        except Exception:return None
        item=cookie.get('replica_session')
        return item.value if item else None

    def admin(self,mutation=False):
        token=self.cookie()
        with self.server.session_lock:
            csrf=self.server.sessions.get(token)
        require(csrf,'请刷新页面建立管理会话',401)
        if mutation:
            require(secrets.compare_digest(csrf,self.headers.get('X-CSRF-Token','')),'请求校验失败，请刷新页面',403)
            origin=self.headers.get('Origin')
            require(not origin or origin in (f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'),'不允许跨站管理操作',403)

    def do_GET(self):
        try:
            self.hostname_valid()
            path=unquote(urlsplit(self.path).path)
            if self.server.playback:return self.play(path)
            if path=='/api/session':
                token,csrf=secrets.token_urlsafe(32),secrets.token_urlsafe(24)
                with self.server.session_lock:
                    if len(self.server.sessions)>1000:self.server.sessions.clear()
                    self.server.sessions[token]=csrf
                return self.send(200,{'csrf':csrf},headers={'Set-Cookie':f'replica_session={token}; HttpOnly; SameSite=Strict; Path=/'})
            if path=='/health':return self.send(200,{'ok':True,'service':'control-plane'})
            if path.startswith('/api/v1/source-bundles/') and path.endswith('/download'):
                auth=self.headers.get('Authorization','')
                require(auth.startswith('Bearer '),'缺少接入凭证',401)
                tool=self.server.service.authenticate(auth[7:])
                key=path.split('/')[4]
                with self.server.service.store.tx() as db:
                    bundle=self.server.service.get(db,'source-bundles',key)
                    jobs=self.server.service.store.all(db,'jobs')
                    require(any(j['candidate_id']==bundle['candidate_id'] and j.get('tool_id')==tool['id'] and j['status']=='running' for j in jobs),'工具未持有对应执行任务',403)
                directory=self.server.service.repo.artifacts/key
                out=io.BytesIO()
                with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
                    for f in directory.rglob('*'):
                        if f.is_file():z.write(f,f.relative_to(directory).as_posix())
                return self.send(200,out.getvalue(),'application/zip')
            if path.startswith('/api/'):
                self.admin()
                if path=='/api/state':return self.send(200,self.server.service.state())
                if path=='/api/demo':return self.file(ROOT/'web/demo.json',ROOT/'web')
                if path=='/api/docs':return self.file(ROOT/'docs/API.md',ROOT/'docs')
                if path.startswith('/api/versions/') and path.endswith('/download'):
                    key=path.split('/')[3]
                    with self.server.service.store.tx() as db:
                        version=self.server.service.get(db,'versions',key)
                    directory=self.server.service.repo.root/version['source_directory']
                    out=io.BytesIO()
                    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
                        for f in directory.rglob('*'):
                            if f.is_file():z.write(f,f.relative_to(directory).as_posix())
                    return self.send(200,out.getvalue(),'application/zip',{'Content-Disposition':f'attachment; filename="{key}.zip"'})
                raise ApiError(404,'接口不存在')
            if path=='/':path='/index.html'
            return self.file(ROOT/'web'/path.lstrip('/'),ROOT/'web')
        except ApiError as e:self.send(e.status,{'error':e.message})
        except Exception:
            traceback.print_exc();self.send(500,{'error':'服务内部错误，请查看服务日志'})

    def do_POST(self):
        try:
            self.hostname_valid()
            require(not self.server.playback,'试玩服务只提供读取',405)
            path=urlsplit(self.path).path
            require(self.headers.get('Content-Type','').split(';')[0]=='application/json','请使用 application/json',415)
            length=int(self.headers.get('Content-Length','0'))
            require(0<length<=30*1024*1024,'请求体为空或超过 30 MiB',413)
            tool=None
            if path.startswith('/api/v1/'):
                auth=self.headers.get('Authorization','')
                require(auth.startswith('Bearer '),'缺少接入凭证',401)
                tool=self.server.service.authenticate(auth[7:])
            else:self.admin(mutation=True)
            try:body=json.loads(self.rfile.read(length))
            except (json.JSONDecodeError,UnicodeDecodeError):raise ApiError(400,'无效的 JSON')
            idem=self.headers.get('Idempotency-Key') or (body.get('event_id') if isinstance(body,dict) else None)
            result=self.server.service.mutate(path,body,tool,idem)
            self.send(200,result)
        except ApiError as e:self.send(e.status,{'error':e.message})
        except (ValueError,TypeError,KeyError) as e:self.send(400,{'error':'参数无效：'+str(e)[:200]})
        except Exception:
            traceback.print_exc();self.send(500,{'error':'服务内部错误，请查看服务日志'})

    def file(self,path,root,extra=None):
        resolved=path.resolve();root=root.resolve()
        require(resolved.is_relative_to(root) and resolved.is_file(),'文件不存在',404)
        require(not any(x.startswith('.') for x in resolved.relative_to(root).parts),'文件不可访问',403)
        ct=mimetypes.guess_type(resolved.name)[0] or 'application/octet-stream'
        if resolved.suffix=='.js':ct='text/javascript'
        if ct.startswith('text/'):ct+='; charset=utf-8'
        self.send(200,resolved.read_bytes(),ct,extra)

    def play(self,path):
        if path=='/health':return self.send(200,{'ok':True,'service':'playback'})
        # Independent read-only playback: only registered artifact directories, never repository or API.
        parts=path.strip('/').split('/')
        require(len(parts)>=3 and parts[0]=='play','试玩版本不存在',404)
        artifact_id=parts[1]
        with self.server.service.store.tx() as db:
            self.server.service.get(db,'artifacts',artifact_id)
        root=self.server.service.repo.artifacts/artifact_id
        csp="sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors http://127.0.0.1:* http://localhost:*"
        return self.file(root/'/'.join(parts[2:]),root,{'Content-Security-Policy':csp})

def build_server(service,port,playback=False):
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
    server.service=service;server.playback=playback;server.sessions={};server.session_lock=threading.Lock()
    return server

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--port',type=int,default=8765);p.add_argument('--play-port',type=int,default=8766)
    p.add_argument('--data-dir',default=str(ROOT/'data'));p.add_argument('--repo-dir',default=str(ROOT/'game-library'))
    p.add_argument('--service',choices=['all','admin','play'],default='all')
    args=p.parse_args()
    service=Service(Path(args.data_dir).resolve(),Path(args.repo_dir).resolve(),f'http://127.0.0.1:{args.play_port}')
    servers=[]
    if args.service in ('all','admin'):servers.append(build_server(service,args.port))
    if args.service in ('all','play'):servers.append(build_server(service,args.play_port,True))
    for server in servers[:-1]:threading.Thread(target=server.serve_forever,daemon=True).start()
    print(f'Admin: http://127.0.0.1:{args.port}\nPlayback: http://127.0.0.1:{args.play_port}\nLocal-only binding. Ctrl+C to stop.',flush=True)
    try:servers[-1].serve_forever()
    except KeyboardInterrupt:pass
    finally:
        for server in servers:server.server_close()

if __name__=='__main__':main()
