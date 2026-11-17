from pathlib import Path
import json,hashlib,subprocess,concurrent.futures,urllib.parse,datetime,threading
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';target=r/'original-addressables-20261117';receipt=target/'bundle-intake.json'
assert not receipt.exists(),'Read original intake and reconcile exact missing entries before another request'
catalogs=json.loads((target/'catalog-intake.json').read_text(encoding='utf8'));assert all(row['http']==200 for row in catalogs['rows'])
urls=sorted({url for row in catalogs['rows']for url in row['internal_ids']if url.endswith('.bundle')});assert len(urls)<=166
for url in urls:
 parsed=urllib.parse.urlsplit(url);assert parsed.scheme=='https' and parsed.netloc=='smashkartsgc.b-cdn.net' and parsed.path.startswith('/assetbundles/remote/webgl/') and not parsed.query
files=target/'bundles';files.mkdir(exist_ok=True);rows=[];lock=threading.Lock()
def one(url):
 p=files/url.rsplit('/',1)[1];assert not p.exists(),'Do not overwrite prior bundle evidence'
 headers=files/(p.name+'.headers')
 done=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','75','--max-filesize','100000000','--proto','=https','--output',str(p),'--dump-header',str(headers),'--write-out','%{http_code}',url],capture_output=True,text=True,timeout=80)
 row={'url':url,'curl_exit':done.returncode,'http':int(done.stdout or 0),'tls_verified':True,'proxy':False,'source':'Exact same-build original Addressables catalog m_InternalIds'}
 if done.stderr:row['error']=done.stderr.strip()[:300]
 if done.returncode==0 and row['http']==200:
  raw=p.read_bytes();row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),unityfs_signature=raw.startswith(b'UnityFS\0'),path=p.relative_to(r).as_posix())
 with lock:
  rows.append(row);out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expected':len(urls),'observed':len(rows),'downloaded':sum(x.get('http')==200 and x.get('curl_exit')==0 for x in rows),'bytes':sum(x.get('bytes',0)for x in rows),'source_only':True,'game_executed':False,'game_files_modified':False,'rows':sorted(rows,key=lambda x:x['url'])}
  temp=receipt.with_suffix('.json.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');temp.replace(receipt)
  if len(rows)%15==0 or len(rows)==len(urls):print(json.dumps({k:v for k,v in out.items()if k!='rows'}),flush=True)
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(one,urls))
