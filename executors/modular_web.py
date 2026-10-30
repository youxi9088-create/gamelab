"""Bounded static ESM capture for the declared Remix Three runtime contract.

Runs only inside a platform task. Original sources remain in web-original.
No game title, ID, replacement gameplay, or external developer runtime is used.
"""
import hashlib
import base64
import json
import posixpath
import re
import shutil
import subprocess
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path
from remote_assets import validate_url, NoRedirect, tls_context

ROOT=Path(__file__).resolve().parent
ABSOLUTE=re.compile(r'''https://[^\s"'<>`\\]+''')


class UnsupportedContract(ValueError):
    """Use observed browser capture when the optimized static adapter does not apply."""


def portal_module(address):
    return isinstance(address,str) and bool(re.fullmatch(r'https://remix\.gg/portal-runtime/\d+/(?:three-)?[0-9a-f]{64}\.mjs',address))


def candidate(observation):
    from controlplane.source_routing import modular_candidate
    return modular_candidate(observation)


def bundled_three(html,mapping,budget):
    if mapping:return False
    modules=re.findall(r'<script\b[^>]*type=["\']module["\'][^>]*>(.*?)</script>',html,re.S|re.I)
    if not modules or not any('THREE.WebGLRenderer' in code for code in modules):return False
    from controlplane.runtime import node_binary
    for code in modules:
        parsed=subprocess.run([node_binary(),str(ROOT/'module-imports.cjs')],input=code.encode('utf-8'),capture_output=True,timeout=budget.remaining(40))
        if parsed.returncode:raise ValueError('内联模块语法解析失败')
        if json.loads(parsed.stdout):raise UnsupportedContract('内联打包模块仍有外部导入，转浏览器采集')
    return True


def browser_get(address,run,budget):
    """Retry transport failures, preserving bounded diagnostics outside stdout."""
    from controlplane.runtime import node_binary
    errors=[]
    for attempt in range(1,4):
        try:
            result=subprocess.run([node_binary(),str(ROOT/'browser-resource-transfer.cjs'),address],
                capture_output=True,timeout=budget.remaining(75))
            if not result.returncode:
                fetched=json.loads(result.stdout)
                if fetched.get('status')!=200:
                    raise ValueError('公共资源浏览器 HTTP '+str(fetched.get('status'))+'：'+address)
                return base64.b64decode(fetched['data'],validate=True)
            detail=result.stderr.decode('utf-8',errors='replace')[:1200]
        except subprocess.TimeoutExpired:
            detail='browser subprocess timeout'
        # Store exact URL identity as a digest, without query parameters or secrets.
        errors.append({'attempt':attempt,'error':detail.replace(address,'[resource]')})
        diagnostic=run/'acquisition/transfer-errors.jsonl'
        diagnostic.parent.mkdir(parents=True,exist_ok=True)
        with diagnostic.open('a',encoding='utf-8') as stream:
            stream.write(json.dumps({'url_sha256':hashlib.sha256(address.encode()).hexdigest(),**errors[-1]},ensure_ascii=False)+'\n')
        transient=any(word in detail.lower() for word in ('fetch','timeout','timed out','reset','connection','network','aborted'))
        if not transient:break
    raise ValueError('公共资源浏览器传输失败（'+str(len(errors))+'次；'+errors[-1]['error'][:250]+'）：'+address)


def capture(url,referer,run,budget):
    target=run/'converted';original=run/'web-original'
    target.mkdir(exist_ok=True);original.mkdir(exist_ok=True)
    opener=urllib.request.build_opener(NoRedirect,urllib.request.HTTPSHandler(context=tls_context()))
    files={};sources={};total=0;native_transport=False
    discovery_cache={};discovery_hits=0
    snapshot=run/'acquisition/resource-snapshot.json'
    if snapshot.is_file() and snapshot.stat().st_size<=4_000_000:
        for row in json.loads(snapshot.read_text('utf-8')).get('files',[]):
            if row.get('frame')!=url or not re.fullmatch(r'resource-snapshot/[a-f0-9]{64}',str(row.get('path',''))):continue
            file=run/'acquisition'/row['path']
            if file.is_symlink() or file.parent.is_symlink() or not file.is_file() or file.stat().st_size>20*1024*1024:continue
            data=file.read_bytes()
            if len(data)==row.get('bytes') and hashlib.sha256(data).hexdigest()==row.get('sha256'):discovery_cache[row['url']]=data
    def native_get(address):
        curl=shutil.which('curl.exe') or shutil.which('curl')
        if not curl:raise ValueError('系统 curl 不可用')
        result=subprocess.run([curl,'--silent','--show-error','--fail','--proto','=https','--max-redirs','0','--max-time','30','--max-filesize',str(20*1024*1024),'-A','GameLab/1.0','-e',referer,'-w','\n%{http_code}',address],capture_output=True,timeout=budget.remaining(35))
        data,_,status=result.stdout.rpartition(b'\n')
        if result.returncode or status!=b'200':
            # The static ESM path uses the same browser transport as observed
            # capture; HTTP denials are not a reason to switch transports.
            if status not in (b'',b'000'):raise ValueError('公共资源备用传输失败：'+address)
            data=browser_get(address,run,budget)
        return data
    def get(address):
        nonlocal total,native_transport,discovery_hits
        validate_url(address)
        cache=run/'resource-transfer-cache'
        cache_key=hashlib.sha256((url+'\n'+referer+'\n'+address).encode()).hexdigest()
        cached=cache/cache_key;receipt=cache/(cache_key+'.json')
        if cached.is_file() and receipt.is_file() and not cached.is_symlink() and not receipt.is_symlink() and cached.stat().st_size<=20*1024*1024:
            try:
                proof=json.loads(receipt.read_text('utf-8'));content=cached.read_bytes()
                if proof.get('sha256')==hashlib.sha256(content).hexdigest() and proof.get('bytes')==len(content):
                    total+=len(content)
                    if total>95*1000*1000:raise ValueError('静态模块采集超过容量限制')
                    return content
            except (OSError,json.JSONDecodeError):pass
        if address in discovery_cache:
            data=discovery_cache[address];total+=len(data);discovery_hits+=1
            if total>95*1000*1000:raise ValueError('静态模块采集超过容量限制')
            return data
        try:
            if native_transport:data=native_get(address)
            else:
                with opener.open(urllib.request.Request(address,headers={'User-Agent':'GameLab/1.0','Referer':referer}),timeout=budget.remaining(15)) as response:
                    data=response.read(20*1024*1024+1)
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError,TimeoutError):
            data=native_get(address)
            native_transport=True
        total+=len(data)
        if len(data)>20*1024*1024 or total>95*1000*1000:raise ValueError('静态模块采集超过容量限制')
        cache.mkdir(exist_ok=True)
        cached.write_bytes(data)
        receipt.write_text(json.dumps({'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}),encoding='utf-8')
        return data
    raw=get(url);html=raw.decode('utf-8')
    (original/'index.html').write_bytes(raw)
    from controlplane.runtime import node_binary
    contract_result=subprocess.run([node_binary(),str(ROOT/'runtime-contracts.cjs')],
        input=json.dumps({'run':str(run),'html':html,'url':url}).encode('utf-8'),
        capture_output=True,timeout=budget.remaining(15))
    if contract_result.returncode:raise ValueError('共享契约证据登记失败')
    maps=re.findall(r'<script[^>]*type=["\']importmap["\'][^>]*>(.*?)</script>',html,re.S|re.I)
    contract={'entry_url':url,'source_sha256':hashlib.sha256(raw).hexdigest(),
              'source_file':'web-original/index.html','importmap_count':len(maps),
              'importmaps':maps,'module_scripts':len(re.findall(r'<script\b[^>]*type=["\']module["\']',html,re.I)),
              'status':'inspecting'}
    contract_file=run/'entry-contract.json'
    contract_file.write_text(json.dumps(contract,ensure_ascii=False,indent=2),'utf-8')
    if len(maps)!=1:raise UnsupportedContract('需要唯一的显式 importmap')
    mapping=json.loads(maps[0]).get('imports',{})
    legacy=all(k in mapping for k in ('@remix-gg/three','@remix-gg/three/three'))
    standard=isinstance(mapping.get('three'),str) and bool(re.fullmatch(r'https://esm\.sh/three@\d+\.\d+\.\d+(?:\?[^#]*)?',mapping['three']))
    portal=portal_module(mapping.get('three'))
    bundled=bundled_three(html,mapping,budget) if not (legacy or standard or portal) else False
    if not (legacy or standard or portal or bundled):
        contract.update(status='unsupported',missing_capability='module_contract',note='入口源码已保留；需要共享模块适配能力，原样重试不会改变契约。')
        contract_file.write_text(json.dumps(contract,ensure_ascii=False,indent=2),'utf-8')
        raise UnsupportedContract('未识别已支持的 Remix Three 模块契约')
    contract.update(status='recognized',module_contract='portal-three' if portal else 'bundled-three' if bundled else 'standard-three' if standard else 'remix-three')
    contract_file.write_text(json.dumps(contract,ensure_ascii=False,indent=2),'utf-8')
    sdk=re.findall(r'<script\b[^>]*src=["\'](https://cdn\.jsdelivr\.net/npm/@remix-gg/sdk@[^"\']+/dist/index\.min\.js)["\'][^>]*>\s*</script>',html,re.I)
    if len(sdk)!=1:raise UnsupportedContract('需要唯一明确的 Remix SDK 声明')
    (original/'index.html').write_bytes(raw)
    files[url]={'url':url,'path':'index.html','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    def dependency(address,module=False):
        if address in files:return files[address]['path']
        if len(files)>300:raise ValueError('模块或资源数量超过限制')
        parsed=validate_url(address)
        if module and parsed.hostname!='esm.sh' and not portal_module(address):raise UnsupportedContract('模块来源尚未适配：'+parsed.hostname)
        name=re.sub('[^A-Za-z0-9_.-]+','-',Path(parsed.path).name).strip('.-')[:70] or 'module'
        name=re.sub(r'-[A-Za-z0-9]{4,}(?=\.)','',name)
        suffix='.js' if module else Path(parsed.path).suffix.lower()
        if not module and suffix not in ('.png','.jpg','.jpeg','.webp','.wav','.mp3','.ogg','.json','.glb','.gltf','.bin','.woff','.woff2','.gltf-binary','.mpeg'):
            raise ValueError('尚未适配的资源引用：'+address)
        name=Path(name).stem if module else name
        local=('vendor/' if module else 'assets/')+f'{len(files):03d}-'+name+(suffix if module else '')
        data=get(address)
        files[address]={'url':address,'path':local,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
        out=original/local;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
        if module:
            text=data.decode('utf-8')
            from controlplane.runtime import node_binary
            # Binary pipes preserve LF exactly on Windows; text stdin expands it
            # to CRLF, invalidating parser offsets into the original source.
            parsed_imports=subprocess.run([node_binary(),str(ROOT/'module-imports.cjs')],input=text.encode('utf-8'),
                capture_output=True,timeout=budget.remaining(40))
            if parsed_imports.returncode:raise ValueError('模块语法解析失败：'+parsed_imports.stderr.decode('utf-8',errors='replace')[-800:])
            replacements=[]
            for item in json.loads(parsed_imports.stdout):
                ref=item['value']
                ref=mapping.get(ref,ref)
                if not ref.startswith(('/','./','../','https://')):raise UnsupportedContract('未解析的模块引用：'+ref)
                child=dependency(urllib.parse.urljoin(address,ref),True)
                relative=posixpath.relpath(child,posixpath.dirname(local))
                replacements.append((item['start'],item['end'],json.dumps('./'+relative)))
            # Babel offsets are UTF-16 code units, including astral characters.
            encoded=text.encode('utf-16-le')
            for start,end,value in sorted(replacements,reverse=True):
                encoded=encoded[:start*2]+value.encode('utf-16-le')+encoded[end*2:]
            text=encoded.decode('utf-16-le')
            sources[local]=text.encode()
        else:sources[local]=data
        return local
    for key,value in mapping.items():
        if not isinstance(value,str) or not (value.startswith('https://esm.sh/') or portal_module(value)):raise UnsupportedContract('不支持的 importmap 来源')
        dependency(value,True)
    # Inline game modules can also import the portal runtime directly.
    inline_changes=[]
    for match in re.finditer(r'<script\b[^>]*type=["\']module["\'][^>]*>(.*?)</script>',html,re.S|re.I):
        code=match.group(1)
        from controlplane.runtime import node_binary
        parsed=subprocess.run([node_binary(),str(ROOT/'module-imports.cjs')],input=code.encode('utf-8'),capture_output=True,timeout=budget.remaining(40))
        if parsed.returncode:raise ValueError('内联模块语法解析失败')
        replacements=[]
        for item in json.loads(parsed.stdout):
            ref=mapping.get(item['value'],item['value'])
            if not ref.startswith(('https://','/','./','../')):raise UnsupportedContract('未解析的模块引用：'+ref)
            local=dependency(urllib.parse.urljoin(url,ref),True)
            replacements.append((item['start'],item['end'],json.dumps('./'+local)))
        encoded=code.encode('utf-16-le')
        for start,end,value in sorted(replacements,reverse=True):
            encoded=encoded[:start*2]+value.encode('utf-16-le')+encoded[end*2:]
        inline_changes.append((match.start(1),match.end(1),encoded.decode('utf-16-le')))
    for start,end,value in reversed(inline_changes):html=html[:start]+value+html[end:]
    # Only original game HTML explicitly named assets; do not crawl a site.
    for address in sorted(set(ABSOLUTE.findall(html))):
        if address in mapping.values() or address==sdk[0]:continue
        if urllib.parse.urlsplit(address).path.lower().endswith(('.wav','.mp3','.ogg','.png','.jpg','.jpeg','.webp','.glb','.gltf','.bin','.woff','.woff2','.gltf-binary','.mpeg')):
            dependency(address)
    for address,item in sorted(files.items(),key=lambda pair:len(pair[0]),reverse=True):
        if address!=url:html=html.replace(address,'./'+item['path'])
    html=html.replace(sdk[0],'./local-host.js')
    # Import maps and original game logic stay intact; only resource URLs change.
    sources['index.html']=html.encode()
    patches=[]
    for local,data in sources.items():
        dest=target/local;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
        prior=original/local
        if prior.exists() and prior.read_bytes()!=data:
            patches.append({'file':local,'before':hashlib.sha256(prior.read_bytes()).hexdigest(),'after':hashlib.sha256(data).hexdigest(),'kind':'local-static-references'})
    shutil.copy2(ROOT/'adapters/remix-local.js',target/'local-host.js')
    report={'engine':'three','module_contract':'portal-three' if portal else 'bundled-three' if bundled else 'standard-three' if standard else 'remix-three','url':url,'referer':referer,'files':list(files.values()),'patches':patches,
            'bytes':total,'complete':True,'preloadErrors':[],'errors':[],'external':[],'missing':[],
            'discovery_snapshot':{'available':len(discovery_cache),'reused':discovery_hits,'scope':'Exact selected frame and URL; SHA-256 checked discovery bytes'},
            'host_adapter':'remix-local','host_scope':'本地匿名游玩、真实分数结算、重开及浏览器存档；在线排行榜、账号和购买不提供。'}
    (run/'web-acquisition.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    runtime_contract=json.loads((run/'runtime-contract.json').read_text('utf-8'))
    runtime_contract['stage']='captured'
    runtime_contract.setdefault('history',[]).append({'stage':'captured','optimized_adapter':report['module_contract'],'files':len(files)})
    (run/'runtime-contract.json').write_text(json.dumps(runtime_contract,ensure_ascii=False,indent=2),'utf-8')
    return report
