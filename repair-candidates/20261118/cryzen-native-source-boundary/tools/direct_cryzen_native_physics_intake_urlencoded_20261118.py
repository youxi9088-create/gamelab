"""Exact native static resources, grounded in the bound run's original URL."""
from pathlib import Path
import json,urllib.request,urllib.parse,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-e6f888d6f2d5';out=r/'native-physics-recovery-20261118-urlencoded';assert not out.exists();out.mkdir()
meta=json.loads((b/'direct-cryzen-bound-source-origins-20261118.json').read_text(encoding='utf8'))
records=[x for x in meta['source_url_records']if x['path'].startswith('web-acquisition.json.files[')and x['url_without_query'].endswith('/assets/index-C492VM3o.js')];assert len(records)==1
base=records[0]['url_without_query'];catalog=json.loads((r/'analysis/native-asset-catalog-20261118.json').read_text(encoding='utf8'));assert len(catalog['physics'])==9
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
op=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect());items=[]
for row in catalog['physics']:
 name=row['relative'];assert '/'not in name and name.endswith('.bin');url=urllib.parse.urljoin(base,urllib.parse.quote(name,safe=chr(0)[:0]))
 try:
  with op.open(url,timeout=20)as res:
   raw=res.read(32_000_001);assert res.status==200 and 0<len(raw)<32_000_001 and not raw.lstrip().startswith((b'<',b'{')),'Unexpected static binary';mime=res.headers.get('Content-Type','')
  (out/name).write_bytes(raw);items.append({'path':'assets/'+name,'url':url,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'mime':mime,'tls_verified':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 except Exception as ex:
  items.append({'path':'assets/'+name,'url':url,'http_status':getattr(ex,'code',None),'error':str(ex),'at':datetime.datetime.now(datetime.timezone.utc).isoformat()});break
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_main_url':base,'source_evidence':records[0]['path'],'source_sha256':'db134e38cd649cc7484816ed3e2367ae1e3aa7b238100d3ebc9fcca1b71b9f47','declared_physics':9,'recovered':sum('sha256'in x for x in items),'not_attempted':9-len(items),'items':items,'game_executed':False,'ui_steps_used':0,'runtime_modified':False}
(out/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(receipt,ensure_ascii=False))
