from pathlib import Path
import json,hashlib,sys,zipfile
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.service import Service
from controlplane.atomic_files import write_bytes
s=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with s.store.read()as db:
 j=s.get(db,'jobs','job-e7d352b1a2b1');v=s.get(db,'versions','v-4033dfcfe644');assert j['version_id']==v['id']and v['status']=='review'and j['status']in ['review','completed']
stage=Path('D:/GameLab/temp/direct-omnis-final-20261117-v2/closure-20261117-v1')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='1a668e234d789daf84ea1de6e6e41fd44e95aee68d6252993eb850c3a0d16ad3';manifest=json.loads(raw)
 for n,h in manifest.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
out={'complete':True,'manifest_sha256':'1a668e234d789daf84ea1de6e6e41fd44e95aee68d6252993eb850c3a0d16ad3','files':len(manifest),'stage':str(stage),'version_id':v['id'],'version_status':v['status'],'task_changed':False,'game_executed':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
