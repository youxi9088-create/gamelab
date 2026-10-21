"""Bounded public asset download with provenance; no credentials or local endpoints."""
from concurrent.futures import ThreadPoolExecutor,as_completed
import hashlib
import ipaddress
import json
from pathlib import Path
import socket
import urllib.parse
import urllib.request
import urllib.error
import threading
import ssl
import subprocess
from controlplane.runtime import node_binary
import time

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):raise ValueError('Asset redirect requires explicit review')

def tls_context():
    # Embedded Python may have no CA file. Augment OS trust with the bundled
    # Node runtime's public root certificates; never disable TLS verification.
    context=ssl.create_default_context()
    roots=subprocess.check_output([node_binary(),'-p',"require('tls').rootCertificates.join('\\n')"],text=True,timeout=10)
    context.load_verify_locations(cadata=roots)
    return context


def validate_url(url):
    u=urllib.parse.urlsplit(url)
    if u.scheme!='https' or not u.hostname or u.username or u.password or u.port not in (None,443):
        raise ValueError('Only public HTTPS asset URLs are supported')
    addresses=socket.getaddrinfo(u.hostname,443,type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise ValueError('Non-public asset destination')
    return u


def download(asset_map,directory,budget):
    if not isinstance(asset_map,dict) or not 1<=len(asset_map)<=500:raise ValueError('Asset count outside limits')
    directory.mkdir(parents=True,exist_ok=True)
    if any(not isinstance(item,dict) or item.get('type') not in ('image','audio','data','font') or not isinstance(item.get('url'),str) for item in asset_map.values()):raise ValueError('Unsupported asset descriptor')
    unique={item['url'] for item in asset_map.values()}
    # Stable, semantic filenames remain replaceable in downstream templates.
    names={}
    import re
    for index,(key,item) in enumerate(sorted(asset_map.items())):
        stem=re.sub(r'[^A-Za-z0-9_-]+','-',key).strip('-')[:70] or 'resource'
        names.setdefault(item['url'],f'{stem}-{index+1:03d}')
    byte_lock=threading.Lock();written=0
    context=tls_context()
    def fetch(url):
        nonlocal written
        u=validate_url(url)
        suffix=Path(u.path).suffix.lower()
        if suffix not in ('.png','.jpg','.jpeg','.webp','.gif','.mp3','.ogg','.wav','.m4a','.json','.bin','.ttf','.woff','.woff2','.fnt','.atlas'):raise ValueError('Unsupported asset extension: '+suffix)
        for attempt in range(3):
            try:
                request=urllib.request.Request(url,headers={'User-Agent':'GameLab-ResourceCollector/1.0'})
                with urllib.request.build_opener(NoRedirect,urllib.request.HTTPSHandler(context=context)).open(request,timeout=budget.remaining(30)) as response:
                    data=response.read(20*1024*1024+1);mime=response.headers.get('Content-Type','')
                if not data or len(data)>20*1024*1024 or 'text/html' in mime:raise ValueError('Invalid or oversized asset')
                sha=hashlib.sha256(data).hexdigest();name=names[url]+suffix
                with byte_lock:
                    if written+len(data)>220*1024*1024:raise ValueError('Asset bundle exceeds 220MiB')
                    written+=len(data)
                (directory/name).write_bytes(data)
                return {'url':url,'path':'assets/'+name,'sha256':sha,'bytes':len(data),'content_type':mime}
            except (OSError,urllib.error.URLError):
                if attempt==2:raise
                time.sleep(.5)
    results=[];errors=[];total=0
    with ThreadPoolExecutor(max_workers=5) as pool:
        futures={pool.submit(fetch,url):url for url in sorted(unique)}
        for f in as_completed(futures):
            try:
                item=f.result();total+=item['bytes']
                if total>220*1024*1024:raise ValueError('Asset bundle exceeds 220MiB')
                results.append(item)
            except Exception as exc:errors.append({'url':futures[f],'error':str(exc)[:500]})
    manifest={'files':results,'errors':errors,'bytes':total}
    (directory.parent/'resource-downloads.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
    if errors:raise ValueError('远程资源下载未完成：'+str(len(errors))+' 项；详见 resource-downloads.json')
    mapping={x['url']:x['path'] for x in results}
    return {key:{**item,'url':mapping[item['url']]} for key,item in asset_map.items()},manifest
