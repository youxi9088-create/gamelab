from pathlib import Path
import subprocess,json,hashlib,datetime,concurrent.futures
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';proof=json.loads((r/'analysis-20261117/string-table-source-proof.json').read_text(encoding='utf8'));target=r/'original-addressables-20261117';target.mkdir(exist_ok=True);receipt=target/'catalog-intake.json'
assert not receipt.exists(),'Read original catalog intake instead of repeating'
def fetch(url):
 name=url.rsplit('/',1)[1];p=target/name;assert not p.exists();headers=target/(name+'.headers')
 proc=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','45','--proto','=https','--output',str(p),'--dump-header',str(headers),'--write-out','%{http_code}',url],capture_output=True,text=True,timeout=50)
 row={'url':url,'method':'GET','source_proof':'Exact original decoded prefix getter35469 + original JS build catalog filename','curl_exit':proc.returncode,'http':int(proc.stdout or 0),'tls_verified':True,'proxy':False}
 if proc.stderr:row['error']=proc.stderr.strip()[:300]
 if proc.returncode==0 and row['http']==200:
  raw=p.read_bytes();data=json.loads(raw);row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),keys=list(data),local_file=p.relative_to(r).as_posix())
  row['internal_ids']=data.get('m_InternalIds',[])
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rows=list(pool.map(fetch,proof['catalog_urls']))
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_game_modified':False,'rows':rows};receipt.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'rows':[{k:v for k,v in row.items()if k!='internal_ids'} for row in rows],'internal_id_counts':[len(row.get('internal_ids',[]))for row in rows]},ensure_ascii=False))
