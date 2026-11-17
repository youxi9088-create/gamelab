"""Fetch only newly declared catalog sidecars and captured stylesheet font URLs once."""
from pathlib import Path
import json,re,subprocess,hashlib,datetime,urllib.parse
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';target=r/'resource-sidecars-20261118';target.mkdir(exist_ok=True);receipt=target/'intake.json'
assert not receipt.exists(),'Read the original intake instead of repeating requests'
catalogs=json.loads((r/'original-addressables-20261117/catalog-intake.json').read_text(encoding='utf8'))
css=(r/'original-20261117/_remote/3a125e88c76c9347/css2').read_text(encoding='utf8')
urls=[]
for row in catalogs['rows']:
 url=row['url'];assert url.endswith('.json')
 urls.append({'kind':'catalog_hash','url':url[:-5]+'.hash','basis':'Same-name catalog sidecar used by the documented Addressables catalog API; original exact catalog URL','expected_catalog':Path(row['local_file']).name})
for url in dict.fromkeys(re.findall(r'url\((https://[^)]+)\)',css)):
 assert urllib.parse.urlsplit(url).netloc=='fonts.gstatic.com'
 urls.append({'kind':'font','url':url,'basis':'Exact url() in the already captured original Baloo2 stylesheet'})
rows=[]
for n,item in enumerate(urls):
 url=item['url'];name=(Path(urllib.parse.urlsplit(url).path).name if item['kind']=='catalog_hash'else hashlib.sha256(url.encode()).hexdigest()[:16]+Path(urllib.parse.urlsplit(url).path).suffix)
 p=target/name;assert not p.exists()
 proc=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','25','--max-filesize','5000000','--proto','=https','--output',str(p),'--write-out','%{http_code}',url],capture_output=True,text=True,timeout=30)
 row={**item,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'GET','proxy':False,'tls_verified':True,'curl_exit':proc.returncode,'http':int(proc.stdout or 0),'local_file':p.relative_to(r).as_posix()}
 if proc.stderr:row['error']=proc.stderr.strip()[:250]
 if proc.returncode==0 and row['http']==200:
  raw=p.read_bytes();row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),complete=True)
  if item['kind']=='catalog_hash':
   value=raw.decode('ascii').strip();assert re.fullmatch('[0-9a-fA-F]{32}',value)
   original=json.loads((r/'original-addressables-20261117'/item['expected_catalog']).read_text(encoding='utf8'))
   row.update(value=value,catalog_build_result_hash=original['m_BuildResultHash'],matches_original_build_hash=value.lower()==original['m_BuildResultHash'].lower())
  else:
   assert raw[:4]in [b'wOF2',b'wOFF',b'\0\1\0\0',b'OTTO'];row['font_magic']=raw[:4].hex()
 else:row['complete']=False
 rows.append(row)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'scan_started':False,'rows':rows}
receipt.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(out,ensure_ascii=False))
