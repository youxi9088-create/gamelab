"""Repair a copied Cocos 2 snapshot from its declared version manifest; never overwrite the source."""
import argparse,concurrent.futures,hashlib,json,re,shutil,threading,urllib.request,urllib.error
from pathlib import Path
from urllib.parse import urljoin,urlsplit,urlunsplit

ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
def uuid(value):
    if len(value)!=22:return value
    text=value[:2]
    for i in range(2,22,2):
        a,b=ALPHABET.index(value[i]),ALPHABET.index(value[i+1]);text+=f'{a>>2:x}{((a&3)<<2)|(b>>4):x}{b&15:x}'
    return '-'.join([text[:8],text[8:12],text[12:16],text[16:20],text[20:]])
def declarations(root):
    imports=[];natives=[]
    for config in sorted(root.glob('assets/*/config*.json')):
        d=json.loads(config.read_text('utf-8'));ids=d.get('uuids',[])
        for kind,target in [('import',imports),('native',natives)]:
            values=d.get('versions',{}).get(kind,[])
            if len(values)%2:raise ValueError('Invalid version pairs')
            for key,ver in zip(values[::2],values[1::2]):
                key=uuid(ids[key] if isinstance(key,int) else key)
                if not re.fullmatch(r'[a-fA-F0-9-]+',key) or not re.fullmatch(r'[a-fA-F0-9]+',ver):raise ValueError('Unsafe resource identifier')
                base=d.get(kind+'Base',kind)
                if base not in ('import','native'):raise ValueError('Unsupported resource base')
                rel=f'assets/{config.parent.name}/{base}/{key[:2]}/{key}.{ver}'
                target.append(rel+('.json' if kind=='import' else ''))
    return sorted(set(imports)),sorted(set(natives))
def repair(source,destination):
    source,destination=Path(source).resolve(),Path(destination).resolve()
    if destination.exists() or destination.is_relative_to(source):raise ValueError('Use a new directory outside the original snapshot')
    acq=json.loads((source/'evidence/acquisition.json').read_text('utf-8'))
    u=urlsplit(acq['url']);base=urljoin(urlunsplit((u.scheme,u.netloc,u.path,'','')),'.')
    if u.scheme!='https' or u.username or u.password:raise ValueError('Expected an HTTPS source without credentials')
    shutil.copytree(source,destination)
    imports,natives=declarations(destination)
    if len(imports)+len(natives)>6000:raise ValueError('Manifest exceeds repair budget')
    result={'source_artifact':source.name,'origin':base,'added':[],'unavailable':[],'runtime_verified':False,'scope':'Declared Cocos resource closure only; no gameplay or acceptance claim.'}
    lock=threading.Lock();total=[0]
    def get(rel,kind):
        target=destination/rel
        if not target.resolve().is_relative_to(destination):raise ValueError('Unsafe resource path')
        headers={'User-Agent':'Mozilla/5.0','Referer':acq.get('referer') or base}
        try:
            with urllib.request.urlopen(urllib.request.Request(urljoin(base,rel),headers=headers),timeout=25) as r:
                if urlsplit(r.url).netloc!=u.netloc:raise ValueError('Unexpected source redirect')
                body=r.read(32*1024*1024+1);content=r.headers.get('Content-Type','')
                if len(body)>32*1024*1024:raise ValueError('Resource exceeds size limit')
                if kind=='json':json.loads(body)
                elif rel.endswith('.png') and not body.startswith(b'\x89PNG\r\n\x1a\n'):return False
                elif 'text/html' in content:return False
            with lock:
                if total[0]+len(body)>220*1024*1024:raise ValueError('Repair exceeds byte budget')
                total[0]+=len(body)
                target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(body)
                result['added'].append({'path':rel,'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()})
            return True
        except urllib.error.HTTPError as e:
            if e.code==404:return False
            raise
    def fetch_import(rel):
        if (destination/rel).is_file():return
        try:
            if get(rel,'json'):return
            reason='source_http_404'
        except Exception as e:reason=type(e).__name__+': '+str(e)[:160]
        with lock:result['unavailable'].append({'path':rel,'reason':reason})
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(fetch_import,imports))
    print('Import pass:',len(result['added']),'added,',len(result['unavailable']),'unavailable',flush=True)
    def fetch_native(prefix):
        target=destination/prefix
        if any(target.parent.glob(target.name+'.*')):return
        # Extension is not present in Cocos native version pairs. Probe bounded
        # standard formats on the exact declared ID; retain only actual source bytes.
        for ext in ['.png','.mp3','.jpg','.jpeg','.plist','.json','.bin','.ttf']:
            try:
                if get(prefix+ext,'json' if ext=='.json' else 'native'):return
            except Exception as e:
                with lock:result['unavailable'].append({'path':prefix,'reason':type(e).__name__+': '+str(e)[:160]})
                return
        with lock:result['unavailable'].append({'path':prefix,'reason':'declared_native_unavailable_in_supported_formats'})
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(fetch_native,natives))
    result['bytes_added']=total[0];result['declared_imports']=len(imports);result['declared_natives']=len(natives)
    result['added'].sort(key=lambda r:r['path']);result['unavailable'].sort(key=lambda r:r['path'])
    (destination/'evidence/resource-repair.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps({k:v for k,v in result.items() if k not in ('added','unavailable')},ensure_ascii=False),flush=True)
    print('Added',len(result['added']),'Unavailable',len(result['unavailable']),flush=True)
    return result
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args();repair(a.source,a.destination)
