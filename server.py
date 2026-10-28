"""Game replication control plane. Local-first, no third-party runtime dependencies."""
import argparse
import io
import json
import mimetypes
import os
import secrets
import threading
import time
import traceback
import zipfile
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote
from controlplane.service import Service, ApiError, require
from controlplane.service_registry import ServiceRegistry

ROOT=Path(__file__).resolve().parent

class Handler(BaseHTTPRequestHandler):
    server_version='GameCenter/1.0'
    def log_message(self,fmt,*args):
        # Avoid putting bearer tokens, payloads or query parameters in logs.
        print(f'[{self.command}] {urlsplit(self.path).path} {args[1] if len(args)>1 else ""}',flush=True)

    def send(self,status,body,content_type='application/json; charset=utf-8',headers=None):
        self.response_status=status
        if isinstance(body,(dict,list)):body=json.dumps(body,ensure_ascii=False).encode()
        elif isinstance(body,str):body=body.encode()
        self.send_response(status)
        self.send_header('Content-Type',content_type)
        self.send_header('Content-Length',str(len(body)))
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        self.send_header('Cache-Control','no-store')
        if not self.server.playback:
            self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; frame-src 'self' http://127.0.0.1:* http://localhost:*; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
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

    def origin_allowed(self):
        origin=self.headers.get('Origin')
        if not origin:return True
        allowed={f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'}
        public_origin=getattr(self.server,'public_origin','')
        if public_origin:allowed.add(public_origin)
        return origin in allowed

    def admin(self,mutation=False):
        token=self.cookie()
        session=self.server.accounts.session(token) if self.server.auth_required else self.server.sessions.get(token)
        csrf=session.get('csrf') if session else None
        authenticated=session.get('authenticated',False) if session else False
        require(not self.server.auth_required or authenticated,'请先登录门户',401)
        require(csrf,'请刷新页面建立管理会话',401)
        if mutation:
            require(secrets.compare_digest(csrf,self.headers.get('X-CSRF-Token','')),'请求校验失败，请刷新页面',403)
            require(self.origin_allowed(),'不允许跨站管理操作',403)
        self.actor=(session or {}).get('user',{'id':'local-admin','username':'本机管理员','role':'admin'})
        from controlplane.accounts import authorize
        authorize(self.actor,urlsplit(self.path).path,mutation)

    def do_GET(self):
        try:
            self.hostname_valid()
            path=unquote(urlsplit(self.path).path)
            if self.server.playback:return self.play(path)
            if path=='/api/auth/status':
                token=self.cookie()
                session=self.server.accounts.session(token) if self.server.auth_required else self.server.sessions.get(token)
                authenticated=bool(session and session['expires']>time.time() and session.get('authenticated'))
                return self.send(200,{'required':self.server.auth_required,'authenticated':authenticated})
            if path=='/api/session':
                with self.server.session_lock:
                    session=self.server.accounts.session(self.cookie()) if self.server.auth_required else self.server.sessions.get(self.cookie())
                    valid=bool(session and session['expires']>time.time() and (session.get('authenticated') or not self.server.auth_required))
                    if not self.server.auth_required and not valid:
                        self.server.prune_sessions()
                        token,csrf=secrets.token_urlsafe(32),secrets.token_urlsafe(24)
                        self.server.sessions[token]={'csrf':csrf,'authenticated':False,'expires':time.time()+43200}
                        return self.send(200,{'csrf':csrf},headers={'Set-Cookie':f'replica_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200'})
                require(valid,'请先登录门户',401)
                return self.send(200,{'csrf':session['csrf']})
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
                if path=='/api/services':return self.send(200,self.server.registry.public())
                if path=='/api/state':
                    state=self.server.service.state();state['current_user']=self.actor
                    if self.actor['role']!='admin':
                        state.pop('supply_service',None);state.pop('supply_config',None)
                    return self.send(200,state)
                if path=='/api/accounts':return self.send(200,{'users':self.server.accounts.list()})
                if path=='/api/operations':
                    from controlplane.production import status
                    return self.send(200,status(self.server.service))
                if path=='/api/demo':return self.file(ROOT/'web/demo.json',ROOT/'web')
                if path=='/api/docs':return self.file(ROOT/'docs/API.md',ROOT/'docs')
                if path.startswith('/api/supply-deliveries/') and path.endswith('/download'):
                    key=path.split('/')[3]
                    with self.server.service.store.tx() as db:
                        delivery=self.server.service.get(db,'supply_deliveries',key)
                    root=(self.server.service.data_dir/'supply-deliveries').resolve()
                    archive=Path(delivery.get('archive_path','')).resolve()
                    require(archive.is_relative_to(root) and archive.is_file(),'供货包不存在',404)
                    payload=archive.read_bytes()
                    require(__import__('hashlib').sha256(payload).hexdigest()==delivery.get('sha256'),'供货包校验失败',409)
                    return self.send(200,payload,'application/zip',{'Content-Disposition':f'attachment; filename="delivery-{key}.zip"'})
                if path.startswith('/api/versions/') and path.endswith('/specification.md'):
                    key=path.split('/')[3]
                    with self.server.service.store.tx() as db:
                        version=dict(self.server.service.get(db,'versions',key))
                        candidate=self.server.service.get(db,'candidates',version['candidate_id'])
                        saved=self.server.service.store.get(db,'game_profiles',key)
                        if saved:version['game_profile']=saved['profile']
                    from controlplane.game_catalog import document,profile
                    return self.send(200,document(candidate['title'],profile(candidate,version)).encode('utf-8'),
                                     'text/markdown; charset=utf-8')
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
        actor_token=None
        try:
            self.hostname_valid()
            require(not self.server.playback,'试玩服务只提供读取',405)
            path=urlsplit(self.path).path
            require(self.headers.get('Content-Type','').split(';')[0]=='application/json','请使用 application/json',415)
            length=int(self.headers.get('Content-Length','0'))
            require(0<length<=30*1024*1024,'请求体为空或超过 30 MiB',413)
            if path in ('/api/auth/login','/api/auth/logout'):
                try:body=json.loads(self.rfile.read(length))
                except (json.JSONDecodeError,UnicodeDecodeError):raise ApiError(400,'无效的 JSON')
                require(self.origin_allowed(),'不允许跨站管理操作',403)
                if path.endswith('/login'):
                    require(self.server.auth_required,'门户登录未启用',404)
                    address=(self.client_address[0],str(body.get('username',''))[:80] if isinstance(body,dict) else '');now=time.monotonic()
                    with self.server.session_lock:
                        failures,updated=self.server.login_failures.get(address,(0,now))
                        failures=failures if now-updated<900 else 0
                        require(failures<10,'登录失败次数过多，请 15 分钟后重试',429)
                    username=body.get('username','') if isinstance(body,dict) else ''
                    password=body.get('password','') if isinstance(body,dict) else ''
                    authenticated=self.server.accounts.login(username,password)
                    if not authenticated:
                        with self.server.session_lock:self.server.login_failures[address]=(failures+1,now)
                        raise ApiError(401,'账号或密码不正确')
                    with self.server.session_lock:self.server.login_failures.pop(address,None)
                    token,session=authenticated;csrf=session['csrf']
                    secure='; Secure' if self.server.public_origin.startswith('https://') else ''
                    return self.send(200,{'ok':True,'csrf':csrf,'user':session['user']},headers={'Set-Cookie':f'replica_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200{secure}'})
                self.admin(mutation=True)
                self.server.accounts.logout(self.cookie())
                with self.server.session_lock:self.server.sessions.pop(self.cookie(),None)
                return self.send(200,{'ok':True},headers={'Set-Cookie':'replica_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})
            tool=None
            if path.startswith('/api/v1/'):
                auth=self.headers.get('Authorization','')
                require(auth.startswith('Bearer '),'缺少接入凭证',401)
                tool=self.server.service.authenticate(auth[7:])
            else:
                self.admin(mutation=True)
                from controlplane.store import ACTOR
                actor_token=ACTOR.set(self.actor)
                if path!='/api/operations/drain':
                    with self.server.service.store.tx() as db:
                        require(not (self.server.service.store.get(db,'settings','maintenance') or {}).get('draining'),'系统正在维护，暂不接受修改，请稍后重试',503)
            try:body=json.loads(self.rfile.read(length))
            except (json.JSONDecodeError,UnicodeDecodeError):raise ApiError(400,'无效的 JSON')
            idem=self.headers.get('Idempotency-Key') or (body.get('event_id') if isinstance(body,dict) else None)
            if path=='/api/accounts/save':
                result={'user':self.server.accounts.save(body,self.actor)}
            elif path=='/api/operations/drain':
                require(type(body.get('enabled'))==bool,'暂停状态无效')
                with self.server.service.store.tx() as db:
                    self.server.service.store.put(db,'settings',{'id':'maintenance','draining':body['enabled']})
                result={'ok':True,'draining':body['enabled']}
            elif path in ('/api/supply-service/save','/api/supply-service/check'):
                result = self.server.supply_service.save(body) if path.endswith('/save') else self.server.supply_service.check()
            elif path.startswith('/api/services/'):
                parts=path.strip('/').split('/')
                require(len(parts)==4 and parts[3] in ('save','test'),'接口不存在',404)
                result=getattr(self.server.registry,parts[3])(parts[2],body) if parts[3]=='save' else self.server.registry.test(parts[2])
            else:result=self.server.service.mutate(path,body,tool,idem)
            if not tool:
                from controlplane.store import ident,now
                with self.server.service.store.tx() as db:
                    self.server.service.store.put(db,'audit',dict(id=ident('audit'),actor_id=self.actor['id'],actor_name=self.actor['username'],path=path,created_at=now(),result='success'))
            self.send(200,result)
        except ApiError as e:self.send(e.status,{'error':e.message})
        except (ValueError,TypeError,KeyError) as e:self.send(400,{'error':'参数无效：'+str(e)[:200]})
        except Exception:
            traceback.print_exc();self.send(500,{'error':'服务内部错误，请查看服务日志'})
        finally:
            if getattr(self,'response_status',200)>=400 and getattr(self,'actor',None):
                from controlplane.store import ident,now
                try:
                    with self.server.service.store.tx() as db:
                        self.server.service.store.put(db,'audit',dict(id=ident('audit'),actor_id=self.actor['id'],actor_name=self.actor['username'],path=urlsplit(self.path).path,created_at=now(),result='denied_or_failed',http_status=self.response_status))
                except Exception:traceback.print_exc()
            if actor_token is not None:
                from controlplane.store import ACTOR
                ACTOR.reset(actor_token)

    def file(self,path,root,extra=None,runtime=False):
        resolved=path.resolve();root=root.resolve()
        require(resolved.is_relative_to(root) and resolved.is_file(),'文件不存在',404)
        require(not any(x.startswith('.') for x in resolved.relative_to(root).parts),'文件不可访问',403)
        ct=mimetypes.guess_type(resolved.name)[0] or 'application/octet-stream'
        if resolved.suffix=='.js':ct='text/javascript'
        if ct.startswith('text/'):ct+='; charset=utf-8'
        content=resolved.read_bytes()
        if runtime and resolved.name=='boot.js':
            from controlplane.runtime_compatibility import mounted_boot
            content,compatibility=mounted_boot(content)
            if compatibility:extra={**(extra or {}),**compatibility}
        self.send(200,content,ct,extra)

    def play(self,path):
        if path=='/health':return self.send(200,{'ok':True,'service':'playback'})
        # Independent read-only playback: only registered artifact directories, never repository or API.
        parts=path.strip('/').split('/')
        require(len(parts)>=3 and parts[0] in ('play','runtime'),'试玩版本不存在',404)
        artifact_id=parts[1]
        with self.server.service.store.tx() as db:
            artifact=self.server.service.get(db,'artifacts',artifact_id)
            require(parts[0]!='runtime' or artifact.get('runtime_local'),'版本未启用独立运行',403)
        root=self.server.service.repo.artifacts/artifact_id
        csp="sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' http://127.0.0.1:* http://localhost:*"
        if parts[0]=='runtime':
            csp="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"
        rel='/'.join(parts[2:])
        # 打包产物（Cocos / Babel 转译结果）的模块加载器常按无扩展名路径请求 JS，
        # 磁盘上的文件却带 .js。不回退会让浏览器报 "Missing module"，整局起不来。
        # 与云端 playback.mjs 的回退保持一致。
        if not Path(rel).suffix:
            try:
                presented=(root/rel).resolve()
                hit=presented.is_file()
            except OSError:
                hit=False; presented=None
            if not hit:
                try:
                    alt=(root/(rel+'.js')).resolve()
                    if alt.is_file() and alt.is_relative_to(root.resolve()): rel=rel+'.js'
                except OSError:
                    pass
        return self.file(root/rel,root,{'Content-Security-Policy':csp},runtime=True)

def build_server(service,port,playback=False):
    server=ThreadingHTTPServer(('127.0.0.1',port),Handler)
    server.service=service;server.playback=playback;server.sessions={};server.session_lock=threading.Lock()
    server.admin_username=os.environ.get('PORTAL_ADMIN_USERNAME','')
    server.admin_password=os.environ.get('PORTAL_ADMIN_PASSWORD','')
    server.public_origin=os.environ.get('PORTAL_PUBLIC_ORIGIN','').rstrip('/')
    require(bool(server.admin_username)==bool(server.admin_password),'PORTAL_ADMIN_USERNAME 和 PORTAL_ADMIN_PASSWORD 必须同时配置')
    from controlplane.accounts import Accounts
    server.accounts=Accounts(service.store,server.admin_username,server.admin_password)
    server.auth_required=server.accounts.enabled();server.login_failures={}
    def prune_sessions():
        now=time.time()
        server.sessions={key:value for key,value in server.sessions.items() if value['expires']>now}
        if len(server.sessions)>1000:server.sessions.clear()
    server.prune_sessions=prune_sessions
    server.registry=ServiceRegistry(service.data_dir/'services.json')
    from controlplane.supply_service import SupplyService
    server.supply_service=SupplyService(service)
    return server

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--port',type=int,default=8765);p.add_argument('--play-port',type=int,default=8766)
    p.add_argument('--data-dir',default=str(ROOT/'data'));p.add_argument('--repo-dir',default=str(ROOT/'game-library'))
    p.add_argument('--service',choices=['all','admin','play'],default='all')
    p.add_argument('--no-executor',action='store_true',help='Disable automatic conversion worker (isolated tests)')
    p.add_argument('--no-discovery',action='store_true',help='Disable daily discovery scheduler')
    args=p.parse_args()
    service=Service(Path(args.data_dir).resolve(),Path(args.repo_dir).resolve(),f'http://127.0.0.1:{args.play_port}')
    servers=[]
    if args.service in ('all','admin'):servers.append(build_server(service,args.port))
    if args.service in ('all','play'):servers.append(build_server(service,args.play_port,True))
    executor=None
    discovery=None
    supply=None
    if args.service in ('all','admin'):
        from controlplane.supply import SupplyWorker
        supply=SupplyWorker(service)
        supply.start()
    if args.service in ('all','admin') and not args.no_discovery:
        from controlplane.discovery import DiscoveryScheduler
        discovery=DiscoveryScheduler(service)
        discovery.start()
    if args.service in ('all','admin') and not args.no_executor:
        from controlplane.executor import Executor
        executor=Executor(service,args.port)
        servers[0].registry.executor=executor
        executor.start()
        threading.Thread(target=servers[0].registry.test,args=('ai',),daemon=True).start()
    for server in servers[:-1]:threading.Thread(target=server.serve_forever,daemon=True).start()
    print(f'Admin: http://127.0.0.1:{args.port}\nPlayback: http://127.0.0.1:{args.play_port}\nLocal-only binding. Ctrl+C to stop.',flush=True)
    try:servers[-1].serve_forever()
    except KeyboardInterrupt:pass
    finally:
        if supply:supply.close()
        if discovery:discovery.close()
        if executor:executor.close()
        for server in servers:server.server_close()

if __name__=='__main__':main()
