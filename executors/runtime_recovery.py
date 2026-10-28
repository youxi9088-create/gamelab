"""Evidence-selected static dependency recovery, shared by capture and continuation.

Only observed public GET resources can be copied. No endpoint emulation, ignored
failures, credential replay, navigation changes or acceptance overrides.
"""
import hashlib
import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit
from remote_assets import validate_url, tls_context, NoRedirect

STATIC = {'script':'.js', 'stylesheet':'.css', 'image':'.png', 'font':'.woff2', 'media':'.bin'}


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
            if r.get('method')!='GET' or r.get('type') not in STATIC:
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
                with opener.open(urllib.request.Request(url,headers={'User-Agent':'GameLab-ResourceCollector/1.0'}),timeout=self.budget.remaining(30)) as response:
                    data=response.read(8*1024*1024+1);mime=response.headers.get('Content-Type','').lower()
                if not data or len(data)>8*1024*1024 or 'text/html' in mime:
                    raise ValueError('静态资源为空、过大或返回 HTML 页面，不能作为资源保存')
                total+=len(data)
                if total>24*1024*1024 or acq.get('bytes',0)+total>220*1024*1024:
                    raise ValueError('运行资源补齐超过字节预算')
                suffix=Path(u.path).suffix.lower()
                if not re.fullmatch(r'\.[a-z0-9]{1,8}',suffix):suffix=STATIC[r['type']]
                if r['type']=='script':suffix='.js'
                if r['type']=='stylesheet':suffix='.css'
                name='_runtime_resources/'+hashlib.sha256(url.encode()).hexdigest()[:24]+suffix
                # Raw source is immutable evidence; only a new local copy is bound.
                original=self.run/'web-original'/name
                if original.exists() and original.read_bytes()!=data:raise ValueError('已保存资源内容发生变化')
                self.write(original,data);self.write(self.target/name,data)
                mappings[url]='/'+name
                files.append({'url':url,'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'resource_id':key,'type':r['type']})
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
                'validate':self.validate,'execute':self.execute,'rollback':self.rollback,'retain_verified_downloads':True}
