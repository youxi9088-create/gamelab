"""Evidence-selected static dependency recovery, shared by capture and continuation.

Only observed public GET resources can be copied. No endpoint emulation, ignored
failures, credential replay, navigation changes or acceptance overrides.
"""
import hashlib
import json
import re
import urllib.request
import urllib.error
import subprocess
import base64
from html import unescape
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from remote_assets import validate_url, tls_context, NoRedirect

STATIC = {'script':'.js', 'stylesheet':'.css', 'image':'.png', 'font':'.woff2', 'media':'.bin'}

def literal_dependencies(run):
    run=Path(run);target=run/'converted'
    acquisition=json.loads((run/'web-acquisition.json').read_text('utf-8'))
    candidates=[(target/'index.html',acquisition.get('url',''))];found=set()
    for row in acquisition.get('files',[]):
        if row.get('script') or row.get('type') in ('script','stylesheet') or str(row.get('path','')).endswith(('.js','.mjs','.css')):
            p=target/row['path']
            if p.resolve().is_relative_to(target.resolve()):candidates.append((p,row.get('sourceURL') or row.get('url','')))
    for p,source in candidates[:100]:
        if not p.is_file() or p.stat().st_size>2_000_000:continue
        for value in re.findall(r'''["']([^\s"'<>]+)["']''',unescape(p.read_text('utf-8'))):
            if '${' not in value:found.add(urljoin(source,value))
    return found

def static_json_request(request,declarations):
    return (request.get('method')=='GET' and request.get('type') in ('fetch','xhr')
        and urlsplit(request.get('url','')).path.lower().endswith(('.json','.glb','.gltf','.gltf-binary')) and request.get('url') in declarations)


def declared_static_ids(run):
    """Only observed GETs also literally declared by this package's HTML/CSS."""
    run=Path(run);target=run/'converted'
    runtime=json.loads((target/'evidence/runtime.json').read_text('utf-8'))
    acquisition=json.loads((run/'web-acquisition.json').read_text('utf-8'))
    declarations=set()
    candidates=[(target/'index.html',acquisition.get('url',''))]
    for row in acquisition.get('files',[]):
        if row.get('type')=='stylesheet' or str(row.get('path','')).endswith('.css'):
            path=target/row['path']
            if path.resolve().is_relative_to(target.resolve()):candidates.append((path,row.get('url','')))
    for path,source in candidates[:60]:
        if not path.is_file() or path.stat().st_size>2_000_000:continue
        text=unescape(path.read_text('utf-8'))
        for value in re.findall(r'''(?:["']|url\(\s*)([^\s"'<>\)]+)''',text,re.I):
            declarations.add(urljoin(source,value))
    code_declarations=literal_dependencies(run)
    return [r['id'] for r in runtime.get('resource_requests',[])
            if ((r.get('method')=='GET' and r.get('type') in ('stylesheet','font','image','media') and r.get('url') in declarations)
                or static_json_request(r,code_declarations)) and r.get('url') not in acquisition.get('runtime_resource_map',{})][:12]


def recover_declared_static(run,budget,retry):
    """Bounded deterministic recovery before asking the model to rediscover it."""
    run=Path(run);attempts=[];seen=set()
    try:
        for _ in range(3):
            ids=declared_static_ids(run)
            if not ids:break
            runtime=json.loads((run/'converted/evidence/runtime.json').read_text('utf-8'))
            signature=tuple(sorted(r['url'] for r in runtime['resource_requests'] if r['id'] in ids))
            if signature in seen:break
            seen.add(signature)
            recovery=StaticRecovery(run,budget)
            try:
                result=recovery.execute({'resource_ids':ids,'reason':'Observed static GET exactly matches a literal HTML/CSS dependency in this package.'})
                attempts.append({'resources':signature,'downloaded':len(result['files']),'verified':False})
                value=retry()
            except Exception as error:
                attempts.append({'error_type':type(error).__name__})
                continue
            attempts[-1]['verified']=True
            __import__('conversion_checkpoint').save_verified_recovery(run)
            return True,value
    finally:
        if attempts:(run/'static-recovery.json').write_text(json.dumps({'attempts':attempts},ensure_ascii=False,indent=2),'utf-8')
    return False,None


def rebase_stylesheet(data, source, mappings):
    """Preserve relative CSS dependency origins after moving a stylesheet."""
    text=data.decode('utf-8')
    def address(value):
        if not value or value.startswith(('#','data:','blob:')):return value
        absolute=urljoin(source,value)
        return mappings.get(absolute,absolute)
    text=re.sub(r'url\(\s*(["\']?)([^\s)"\']+)\1\s*\)',
        lambda m:'url('+json.dumps(address(m[2]))+')',text,flags=re.I)
    text=re.sub(r'(@import\s+)(["\'])([^"\']+)\2',
        lambda m:m[1]+json.dumps(address(m[3])),text,flags=re.I)
    return text.encode('utf-8')


class StaticRecovery:
    def __init__(self, run, budget):
        self.run, self.budget = Path(run), budget
        self.target = self.run/'converted'
        self.before = {}

    def requests(self):
        report = json.loads((self.target/'evidence/runtime.json').read_text('utf-8'))
        return {r['id']:r for r in report.get('resource_requests', [])}

    def validate(self, args):
        ids = args.get('resource_ids')
        if not isinstance(ids,list) or not 1<=len(ids)<=12 or any(not isinstance(i,str) for i in ids):
            raise ValueError('resource_ids 必须包含本轮报告中 1–12 个资源编号')
        if not isinstance(args.get('reason'),str) or len(args['reason'].strip())<10:
            raise ValueError('请说明这些资源属于公开静态文件的证据与用途')
        observed = self.requests()
        for key in ids:
            r = observed.get(key, {})
            if (r.get('method')!='GET' or r.get('type') not in STATIC) and not static_json_request(r,literal_dependencies(self.run)):
                raise ValueError('仅支持本轮实际观察到的静态 GET 资源；不支持导航、XHR、fetch、登录或业务 API')
            u = urlsplit(r['url'])
            if u.scheme!='https' or u.username or u.password or not u.hostname or u.port not in (None,443):
                raise ValueError('资源必须来自公开 HTTPS，无内嵌凭据')

    def write(self, path, data):
        path = Path(path)
        for parent in (path,*path.parents):
            if parent==self.run.parent:break
            if parent.is_symlink() or (hasattr(parent,'is_junction') and parent.is_junction()):
                raise ValueError('资源输出路径不允许符号链接')
        self.before.setdefault(path, path.read_bytes() if path.exists() else None)
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(data)

    def rollback(self):
        for path,data in reversed(list(self.before.items())):
            if data is None:path.unlink(missing_ok=True)
            else:path.write_bytes(data)
        self.before.clear()

    def execute(self, args):
        self.validate(args); self.before={}
        observed=self.requests()
        acq_path=self.run/'web-acquisition.json'
        acq=json.loads(acq_path.read_text('utf-8'))
        mappings=dict(acq.get('runtime_resource_map',{}))
        if len(mappings)+len(set(args['resource_ids']))>60:
            raise ValueError('本轮运行时外部资源补齐达到 60 项上限')
        files=[];total=0
        # Public, unauthenticated downloads only. Redirects remain explicit failures.
        opener=urllib.request.build_opener(NoRedirect,urllib.request.HTTPSHandler(context=tls_context()))
        try:
            for key in dict.fromkeys(args['resource_ids']):
                r=observed[key];url=r['url'];u=validate_url(url)
                if url in mappings:raise ValueError('资源已映射仍外连，请检查加载方式，不能重复相同补齐')
                try:
                    with opener.open(urllib.request.Request(url,headers={'User-Agent':'GameLab-ResourceCollector/1.0'}),timeout=self.budget.remaining(30)) as response:
                        data=response.read(8*1024*1024+1);mime=response.headers.get('Content-Type','').lower()
                except urllib.error.HTTPError:
                    raise
                except (urllib.error.URLError,TimeoutError,ConnectionError):
                    from controlplane.runtime import node_binary
                    result=subprocess.run([node_binary(),str(Path(__file__).parent/'browser-resource-transfer.cjs'),url],
                        capture_output=True,timeout=self.budget.remaining(75))
                    if result.returncode:raise ValueError('浏览器资源补抓失败')
                    fetched=json.loads(result.stdout)
                    if fetched['status']!=200:raise ValueError('浏览器资源补抓 HTTP '+str(fetched['status']))
                    data=base64.b64decode(fetched['data']);mime=fetched['headers'].get('content-type','').lower()
                if not data or len(data)>8*1024*1024 or 'text/html' in mime:
                    raise ValueError('静态资源为空、过大或返回 HTML 页面，不能作为资源保存')
                if r['type'] in ('fetch','xhr'):
                    if u.path.lower().endswith(('.glb','.gltf-binary')):
                        import struct
                        if len(data)<12 or data[:4]!=b'glTF' or struct.unpack('<I',data[4:8])[0]!=2 or struct.unpack('<I',data[8:12])[0]!=len(data):
                            raise ValueError('二进制模型不是有效的GLB v2文件')
                    else:json.loads(data.decode('utf-8-sig'))
                total+=len(data)
                if total>24*1024*1024 or acq.get('bytes',0)+total>220*1024*1024:
                    raise ValueError('运行资源补齐超过字节预算')
                suffix=Path(u.path).suffix.lower()
                if r['type'] in ('fetch','xhr') and suffix=='.gltf-binary':suffix='.glb'
                if not re.fullmatch(r'\.[a-z0-9]{1,8}',suffix):suffix=STATIC[r['type']]
                if r['type']=='script':suffix='.js'
                if r['type']=='stylesheet':suffix='.css'
                name='_runtime_resources/'+hashlib.sha256(url.encode()).hexdigest()[:24]+suffix
                # Raw source is immutable evidence; only a new local copy is bound.
                original=self.run/'web-original'/name
                if original.exists() and original.read_bytes()!=data:raise ValueError('已保存资源内容发生变化')
                self.write(original,data);self.write(self.target/name,data)
                mappings[url]='./'+name
                files.append({'url':url,'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'resource_id':key,'type':r['type']})
            # Only transform local copies. Rebase before verification so newly
            # exposed CSS dependencies retain their actual remote source.
            for item in acq.get('files',[])+files:
                if item.get('type')!='stylesheet':continue
                raw=self.run/'web-original'/item['path']
                if not raw.resolve().is_relative_to((self.run/'web-original').resolve()):
                    raise ValueError('CSS 原始文件路径越界')
                if not raw.is_file():continue
                local=self.target/item['path']
                if not local.resolve().is_relative_to(self.target.resolve()):
                    raise ValueError('CSS 运行副本路径越界')
                import posixpath
                css_mappings={url:posixpath.relpath(local.removeprefix('./').lstrip('/'),posixpath.dirname(item['path']) or '.')
                              if local.startswith(('./_runtime_resources/','/_runtime_resources/')) else local
                              for url,local in mappings.items()}
                data=rebase_stylesheet(raw.read_bytes(),item['url'],css_mappings)
                self.write(local,data)
                acq.setdefault('patches',[]).append({'kind':'stylesheet-origin-bindings',
                    'file':item['path'],'source_sha256':hashlib.sha256(raw.read_bytes()).hexdigest(),
                    'runtime_sha256':hashlib.sha256(data).hexdigest()})
            html=(self.target/'index.html').read_text('utf-8')
            host_before=hashlib.sha256(html.encode()).hexdigest()
            injection='<script src="runtime-resource-map.js"></script><script src="runtime-resource-bindings.js"></script>'
            if injection not in html:
                if not re.search(r'<head\b[^>]*>',html,re.I):raise ValueError('无法确定宿主脚本加载顺序')
                html=re.sub(r'(<head\b[^>]*>)',lambda m:m[0]+injection,html,count=1,flags=re.I)
            # Parser-created attributes cannot be intercepted by JS setters.
            from html import escape
            for url,local in mappings.items():
                for spelling in {url,escape(url,quote=True)}:
                    html=html.replace('"'+spelling+'"','"'+local+'"').replace("'"+spelling+"'","'"+local+"'")
            self.write(self.target/'index.html',html.encode())
            self.write(self.target/'runtime-resource-map.js',('window.runtimeResourceBindings='+json.dumps(mappings)+';').encode())
            self.write(self.target/'runtime-resource-bindings.js',(Path(__file__).parent/'adapters/runtime-resource-bindings.js').read_bytes())
            acq.setdefault('files',[]).extend(files);acq['bytes']=acq.get('bytes',0)+total
            acq['runtime_resource_map']=mappings
            acq.setdefault('patches',[]).append({'kind':'observed-static-resource-bindings','files':[f['path'] for f in files],'reason':args['reason'],'host_before':host_before,'host_after':hashlib.sha256(html.encode()).hexdigest()})
            encoded=json.dumps(acq,ensure_ascii=False).encode()
            self.write(acq_path,encoded);self.write(self.target/'evidence/acquisition.json',encoded)
            return {'files':files,'verification_required':True}
        except Exception:
            self.rollback();raise

    def capability(self):
        return {'description':'按本轮 runtime.json 的 resource_requests 编号补齐公开 HTTPS 静态资源。arguments:{resource_ids:[编号],reason:证据与用途}。只支持 script/stylesheet/image/font/media 的 GET；不得用于 API、登录或绕过站点授权。原文件和哈希保留，本地精确映射；必须原节点复验，不保证动态相对路径或所有加载方式可适配。',
                'validate':self.validate,'execute':self.execute,'rollback':self.rollback,'retain_verified_downloads':True,
                'commit':lambda:__import__('conversion_checkpoint').save_verified_recovery(self.run)}
