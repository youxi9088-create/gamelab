"""Fetch only the seven observed native static audio paths; no game execution."""
from pathlib import Path
import json,urllib.request,urllib.error,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-0d68b7f140bc';out=r/'native-audio-recovery-20261118';out.mkdir(exist_ok=True)
mapping=json.loads((r/'original/runtime-resource-map.js').read_text().split('=',1)[1].strip().rstrip(';'))
base=next(u.split('/assets/')[0]+'/' for u in mapping if u.endswith('/assets/index-BOiBfbo8.js'))
observation=json.loads((b/'direct-needle-step5-observation-20261118.json').read_text(encoding='utf8'))
names=sorted({x['url'].split('http://127.0.0.1:57588/')[1]for x in observation['http_errors']if x['url'].endswith('.mp3')})
assert len(names)==7
rows=[];op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
for name in names:
 assert name.startswith('assets/audio/')and '..'not in name
 url=base+name;target=out/name
 if target.exists():raise RuntimeError('Inspect original receipt; no repeated acquisition')
 try:
  with op.open(url,timeout=20)as res:
   data=res.read(16_000_001);mime=res.headers.get('Content-Type','');assert res.status==200 and len(data)<16_000_001 and not data.lstrip().startswith(b'<')
   assert data.startswith(b'ID3')or(data[0]==255 and data[1]&224==224),'Not MP3'
  target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
  rows.append({'path':name,'url':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'mime':mime,'tls_verified':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
 except Exception as ex:
  rows.append({'path':name,'url':url,'error':str(ex),'http_status':getattr(ex,'code',None),'at':datetime.datetime.now(datetime.timezone.utc).isoformat()});break
receipt={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_base':base,'observed_missing':names,'items':rows,'recovered':sum('sha256'in x for x in rows),'not_attempted':len(names)-len(rows),'source_unchanged':True,'game_started':False}
(out/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(receipt,ensure_ascii=False))
