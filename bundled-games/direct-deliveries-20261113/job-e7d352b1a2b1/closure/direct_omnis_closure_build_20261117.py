from pathlib import Path
import json,hashlib,zipfile
b=Path(__file__).parent;r=b/'direct-games/job-e7d352b1a2b1'
files={n:(b/n).read_bytes()for n in ['DIRECT_A_HANDOFF_20261117_OMNIS_DELIVERED.md','direct-omnis-final-github-receipt-20261117.json','direct-omnis-finalization-receipt-20261117.json','direct-omnis-testsite-http-followup-20261117.json','direct_omnis_finalize_remote_20261117.py']}
for n in ['ui-ledger.json','pending-direct-status.json']:files[n]=(r/n).read_bytes()
m=json.dumps({n:hashlib.sha256(d).hexdigest()for n,d in files.items()},sort_keys=True,indent=2).encode();digest=hashlib.sha256(m).hexdigest()
code='''from pathlib import Path
import json,hashlib,sys,zipfile
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.service import Service
from controlplane.atomic_files import write_bytes
s=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with s.store.read()as db:
 j=s.get(db,'jobs','job-e7d352b1a2b1');v=s.get(db,'versions','v-4033dfcfe644');assert j['version_id']==v['id']and v['status']=='review'and j['status']in ['review','completed']
stage=Path('D:/GameLab/temp/direct-omnis-final-20261117-v2/closure-20261117-v1')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()==DIGEST;manifest=json.loads(raw)
 for n,h in manifest.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
out={'complete':True,'manifest_sha256':DIGEST,'files':len(manifest),'stage':str(stage),'version_id':v['id'],'version_status':v['status'],'task_changed':False,'game_executed':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('DIGEST',repr(digest))
compile(code,'omnis-closure','exec');p=b/'direct_omnis_closure_20261117.pyz';assert not p.exists()
with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',code);z.writestr('MANIFEST.json',m)
 for n,d in files.items():z.writestr(n,d)
print(json.dumps({'files':len(files),'bytes':p.stat().st_size,'manifest_sha256':digest}))
