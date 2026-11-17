from pathlib import Path
import json,urllib.request,urllib.error,urllib.parse,concurrent.futures,datetime,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-c8efbf50be33';outdir=r/'missing-original-intake-20261117';outdir.mkdir(exist_ok=True)
inventory=json.loads((r/'original-missing-material-inventory-20261117.json').read_text());paths=inventory['missing_paths'];origin='https://d103b864-acf3-4ed7-9e2e-cb0c105f19cf.gdn.poki.com/60393b04-2717-4a7a-82f6-797d6ab42d06/'
assert any(s.startswith(origin)for s in inventory['url_contexts'])
historical=[]
def walk(x):
 if isinstance(x,dict):
  u=x.get('url')
  if isinstance(u,str)and u.startswith(origin)and urllib.parse.urlsplit(u).path.split('/60393b04-2717-4a7a-82f6-797d6ab42d06/')[-1]in paths:historical.append(x)
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
for p in r.glob('asset-*.json'):walk(json.loads(p.read_text(encoding='utf8')))
if historical:raise RuntimeError('Previous source receipt exists; inspect before retry: '+json.dumps(historical))
assert not(outdir/'receipt.json').exists()
def fetch(n):
 url=origin+n;row={'path':n,'url':url,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
  with op.open(url,timeout=20)as response:
   row.update(status=response.status,content_type=response.headers.get_content_type());data=response.read(8*1024*1024+1);assert len(data)<=8*1024*1024
  if n.endswith('.json'):
   parsed=json.loads(data);assert isinstance(parsed,dict);row['json_keys']=list(parsed)
  elif n.endswith('.ogg'):assert data.startswith(b'OggS')
  row.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest());p=outdir/'original'/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 except urllib.error.HTTPError as exc:row.update(status=exc.code,error=str(exc),content_type=exc.headers.get_content_type())
 except Exception as exc:row.update(error=type(exc).__name__+': '+str(exc))
 return row
first=['pack_a/missions.json','pack_a/npc/pteranodon/pteranodon_call.ogg']
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:rows=list(pool.map(fetch,first))
if any(x.get('status')in [401,403,429]for x in rows):remaining=[{'path':n,'not_requested':'Original source access denied in first bounded requests; no bypass/retry.'}for n in paths if n not in first]
else:
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:remaining=list(pool.map(fetch,[n for n in paths if n not in first]))
rows+=remaining
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_binding':'Exact original same-build origin from preserved asset receipts; paths from actual successful-start network404s. Direct HTTPS GET with default identity/TLS, no proxy/credential/challenge override.','rows':rows,'files_received':sum(x.get('status')==200 and 'sha256'in x for x in rows),'runtime_executed':False,'task_mutated':False}
(outdir/'receipt.json').write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=False))
