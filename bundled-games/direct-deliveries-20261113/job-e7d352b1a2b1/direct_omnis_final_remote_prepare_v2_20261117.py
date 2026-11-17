from pathlib import Path
import json,hashlib,sys,zipfile,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.offline_delivery import inspect
from controlplane.delivery_requirements import delivery_gaps
from controlplane.conversion_delivery_checks import inspect as preflight
stage=Path('D:/GameLab/temp/direct-omnis-final-20261117-v2');source=stage/'converted'
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('DELIVERY_MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='bfebbe6c35e2c6f0e73905107816b73786dc31b68eeb412749e09f0e96bdcddc';manifest=json.loads(raw)
 for n,h in manifest.items():assert hashlib.sha256(z.read('converted/'+n)).hexdigest()==h,n
 if '--verify-only'in sys.argv:print(json.dumps({'verified':True,'files':len(manifest),'manifest_sha256':'bfebbe6c35e2c6f0e73905107816b73786dc31b68eeb412749e09f0e96bdcddc'}));raise SystemExit(0)
 old=Path('D:/GameLab/temp/direct-omnis-local-20261116-v1/converted')
 observed=json.loads(z.read('converted/evidence/direct-repair/observed-candidate-manifest.json'))
 assert len(observed)==220 and json.loads((old/'MANIFEST.json').read_text(encoding='utf8'))==observed
 for n,h in observed.items():assert hashlib.sha256((old/n).read_bytes()).hexdigest()==h,n
 for n,h in manifest.items():
  target=(source/n).resolve();assert target.is_relative_to(source.resolve());data=z.read('converted/'+n)
  if target.exists():assert target.read_bytes()==data,n
  else:target.parent.mkdir(parents=True,exist_ok=True);write_bytes(target,data)
 p=stage/'DELIVERY_MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
for n,h in manifest.items():assert hashlib.sha256((source/n).read_bytes()).hexdigest()==h,n
assert {p.relative_to(source).as_posix()for p in source.rglob('*')if p.is_file()}==set(manifest)
report=json.loads((source/'DIRECT_REPAIR_REPORT.json').read_text(encoding='utf8'))
audit=inspect(source,report['runtime_smoke'],report['offline_features']);assert audit['status']=='verified',audit
static=preflight(source,report);assert static['finding_count']==0,static
gaps=delivery_gaps(report,list(manifest));assert not gaps,gaps
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:
 j=svc.get(db,'jobs','job-e7d352b1a2b1');c=svc.get(db,'candidates',j['candidate_id']);batch=svc.get(db,'batches',j['batch_id'])
 assert j['status']=='blocked'and j['round']==13 and j['version_id']=='v-4f40af6a7dd7'and not j.get('manual_paused')
 assert not c.get('game_spec')and c['dependencies']==report['dependency_review']['previous']and c['dependencies']['revision']==2
 assert batch['status']=='running'
 current={'job_id':j['id'],'candidate_id':c['id'],'status':j['status'],'round':j['round'],'version_id':j['version_id'],'manual_paused':j.get('manual_paused'),'dependency_revision':2,'batch_status':batch['status']}
out={'read_only_plan':True,'stage':str(stage),'manifest_sha256':'bfebbe6c35e2c6f0e73905107816b73786dc31b68eeb412749e09f0e96bdcddc','files':len(manifest),'manifest':manifest,'observed_candidate_files_verified':220,'game_runtime_changed':False,'offline':audit,'conversion_findings':static['findings'],'delivery_gaps':gaps,'job':current,'previous_dependencies':report['dependency_review']['previous'],'proposed_dependencies':report['dependency_review']['proposed'],'ui_steps_used':11,'remaining':0,'planned_operation':'Normal revisioned dependencies2to3; continue original job once preserving budgets; lease-guarded direct artifact and complete to review. No game execution, no AI worker, no supply.'}
p=stage/'prepare-receipt.json'
if p.exists():assert json.loads(p.read_text(encoding='utf8'))==out
else:write_bytes(p,json.dumps(out,ensure_ascii=False,indent=2).encode())
print(json.dumps({k:v for k,v in out.items()if k not in ['manifest','previous_dependencies','proposed_dependencies']}))
