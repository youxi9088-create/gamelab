"""Bounded static ESM capture for the declared Remix Three runtime contract.

Runs only inside a platform task. Original sources remain in web-original.
No game title, ID, replacement gameplay, or external developer runtime is used.
"""
import hashlib
import json
import posixpath
import re
import shutil
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path
from remote_assets import validate_url, NoRedirect, tls_context

ROOT=Path(__file__).resolve().parent
ABSOLUTE=re.compile(r'''https://[^\s"'<>`\\]+''')


def candidate(observation):
    from controlplane.source_routing import modular_candidate
    return modular_candidate(observation)


def capture(url,referer,run,budget):
    target=run/'converted';original=run/'web-original'
    target.mkdir();original.mkdir()
    opener=urllib.request.build_opener(NoRedirect,urllib.request.HTTPSHandler(context=tls_context()))
    files={};sources={};total=0
    def get(address):
        nonlocal total
        validate_url(address)
        with opener.open(urllib.request.Request(address,headers={'User-Agent':'GameLab/1.0','Referer':referer}),timeout=budget.remaining(40)) as response:
            data=response.read(20*1024*1024+1)
        total+=len(data)
        if len(data)>20*1024*1024 or total>95*1000*1000:raise ValueError('静态模块采集超过容量限制')
        return data
    raw=get(url);html=raw.decode('utf-8')
    maps=re.findall(r'<script[^>]*type=["\']importmap["\'][^>]*>(.*?)</script>',html,re.S|re.I)
    if len(maps)!=1:raise ValueError('需要唯一的显式 importmap')
    mapping=json.loads(maps[0]).get('imports',{})
    if not all(k in mapping for k in ('@remix-gg/three','@remix-gg/three/three')):
        raise ValueError('未识别已支持的 Remix Three 模块契约')
    sdk=re.findall(r'<script\b[^>]*src=["\'](https://cdn\.jsdelivr\.net/npm/@remix-gg/sdk@[^"\']+/dist/index\.min\.js)["\'][^>]*>\s*</script>',html,re.I)
    if len(sdk)!=1:raise ValueError('需要唯一明确的 Remix SDK 声明')
    (original/'index.html').write_bytes(raw)
    files[url]={'url':url,'path':'index.html','bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
    def dependency(address,module=False):
        if address in files:return files[address]['path']
        if len(files)>300:raise ValueError('模块或资源数量超过限制')
        parsed=validate_url(address)
        if module and parsed.hostname!='esm.sh':raise ValueError('模块来源尚未适配：'+parsed.hostname)
        name=re.sub('[^A-Za-z0-9_.-]+','-',Path(parsed.path).name).strip('.-')[:70] or 'module'
        name=re.sub(r'-[A-Za-z0-9]{4,}(?=\.)','',name)
        suffix='.js' if module else Path(parsed.path).suffix.lower()
        if not module and suffix not in ('.png','.jpg','.jpeg','.webp','.wav','.mp3','.ogg','.json','.glb','.gltf','.bin','.woff','.woff2'):
            raise ValueError('尚未适配的资源引用：'+address)
        name=Path(name).stem if module else name
        local=('vendor/' if module else 'assets/')+f'{len(files):03d}-'+name+(suffix if module else '')
        data=get(address)
        files[address]={'url':address,'path':local,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
        out=original/local;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
        if module:
            text=data.decode('utf-8')
            from controlplane.runtime import node_binary
            parsed_imports=subprocess.run([node_binary(),str(ROOT/'module-imports.cjs')],input=text,
                capture_output=True,encoding='utf-8',timeout=budget.remaining(40))
            if parsed_imports.returncode:raise ValueError('模块语法解析失败：'+parsed_imports.stderr[-800:])
            replacements=[]
            for item in json.loads(parsed_imports.stdout):
                ref=item['value']
                if not ref.startswith(('/','./','../','https://')):raise ValueError('未解析的模块引用：'+ref)
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
        if not isinstance(value,str) or not value.startswith('https://esm.sh/'):raise ValueError('不支持的 importmap 来源')
        dependency(value,True)
    # Only original game HTML explicitly named assets; do not crawl a site.
    for address in sorted(set(ABSOLUTE.findall(html))):
        if address in mapping.values() or address==sdk[0]:continue
        if urllib.parse.urlsplit(address).path.lower().endswith(('.wav','.mp3','.ogg','.png','.jpg','.jpeg','.webp','.glb','.gltf','.bin','.woff','.woff2')):
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
    report={'engine':'three','url':url,'referer':referer,'files':list(files.values()),'patches':patches,
            'bytes':total,'complete':True,'preloadErrors':[],'errors':[],'external':[],'missing':[],
            'host_adapter':'remix-local','host_scope':'本地匿名游玩、真实分数结算、重开及浏览器存档；在线排行榜、账号和购买不提供。'}
    (run/'web-acquisition.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    return report
