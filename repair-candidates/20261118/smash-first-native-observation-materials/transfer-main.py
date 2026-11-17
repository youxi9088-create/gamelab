from pathlib import Path
import zipfile,sys,json,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
stage=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118')
receipt=json.loads((stage/'receipt.json').read_text(encoding='utf8'));assert receipt['complete']and not receipt['game_executed']and receipt['candidate_files']==202
with zipfile.ZipFile(sys.argv[0])as z:
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest);target=stage/'observation-materials'
 target.mkdir(exist_ok=True)
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(target/'MANIFEST.json',raw_manifest)
 ledger=json.loads((target/'ui-ledger.json').read_text(encoding='utf8'));assert ledger['used']==0 and ledger['remaining']==5 and ledger['max_steps']==5
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
out={'complete':True,'files_verified':len(manifest),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'stage':str(target),'server_started':False,'scheduled_task_registered':False,'game_executed':False,'job_unchanged':True,'manual_pause_preserved':True,'ready_review':False,'ui_steps_used':0,'ui_steps_remaining':5};write_bytes(target/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
