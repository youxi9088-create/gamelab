from pathlib import Path
import json,subprocess,hashlib,datetime,concurrent.futures
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'original-addressables-20261117';first=json.loads((folder/'bundle-intake.json').read_text(encoding='utf8'));target=folder/'bundle-attempt2';target.mkdir(exist_ok=True);receipt=folder/'bundle-attempt2.json'
assert not receipt.exists(),'Read existing retry result before further requests'
failed=[x for x in first['rows']if x['curl_exit']!=0 or x['http']!=200];assert len(failed)==4 and all(x['curl_exit']in[28,56]for x in failed)
def one(previous):
 url=previous['url'];p=target/url.rsplit('/',1)[1];assert not p.exists()
 done=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','45','--proto','=https','--output',str(p),'--dump-header',str(p)+'.headers','--write-out','%{http_code}',url],capture_output=True,text=True,timeout=50)
 row={'url':url,'attempt':2,'prior_curl_exit':previous['curl_exit'],'curl_exit':done.returncode,'http':int(done.stdout or 0),'tls_verified':True,'proxy':False}
 if done.stderr:row['error']=done.stderr.strip()[:300]
 if done.returncode==0 and row['http']==200:
  raw=p.read_bytes();row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),unityfs_signature=raw.startswith(b'UnityFS\0'),path=p.relative_to(r).as_posix())
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:rows=list(pool.map(one,failed))
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'reason':'One bounded retry only for actual timeout/reset; original full and partial bytes preserved.','rows':rows}
receipt.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
