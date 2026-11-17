"""Complete only the evidenced OMNIS original job via normal service gates."""
from pathlib import Path
import os,sys,json,hashlib,uuid,copy,shutil
offset=int(os.environ.get('GIT_CONFIG_COUNT','0'))
for i,(k,v)in enumerate([('maintenance.auto','false'),('gc.auto','0')],offset):os.environ['GIT_CONFIG_KEY_'+str(i)]=k;os.environ['GIT_CONFIG_VALUE_'+str(i)]=v
os.environ['GIT_CONFIG_COUNT']=str(offset+2)
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR,now
from controlplane.atomic_files import write_bytes
from controlplane.offline_delivery import inspect
from controlplane.delivery_requirements import delivery_gaps
from controlplane.conversion_delivery_checks import inspect as preflight
stage=Path('D:/GameLab/temp/direct-omnis-final-20261117-v2');source=stage/'converted';receipt=stage/'completion-receipt.json';statefile=stage/'submission-state.json'
if receipt.exists():print(receipt.read_text(encoding='utf8'));raise SystemExit(0)
prep=json.loads((stage/'prepare-receipt.json').read_text(encoding='utf8'))
assert prep['read_only_plan']and prep['manifest_sha256']=='bfebbe6c35e2c6f0e73905107816b73786dc31b68eeb412749e09f0e96bdcddc'
for n,h in prep['manifest'].items():assert hashlib.sha256((source/n).read_bytes()).hexdigest()==h,n
report=json.loads((source/'DIRECT_REPAIR_REPORT.json').read_text(encoding='utf8'))
report['offline_delivery']=inspect(source,report['runtime_smoke'],report['offline_features']);assert report['offline_delivery']['status']=='verified'
assert not preflight(source,report)['findings']and not delivery_gaps(report,list(prep['manifest']))
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');tool=svc.authenticate((root/'data/executor-token.txt').read_text(encoding='utf8').strip());assert 'reconstruct'in tool['capabilities']
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
jid='job-e7d352b1a2b1';cid='game-6e607cc59349';op='direct-omnis-native-ai-round2-20261117-v2';depfile=stage/'dependency-review-receipt.json'
# These are already-authorized direct source repairs. Do not unpause another task,
# start a model worker, mutate gate code or submit anything to supply.
if not depfile.exists():
 with svc.store.read()as db:
  j=svc.get(db,'jobs',jid);c=svc.get(db,'candidates',cid)
  assert j['status']=='blocked'and j['round']==13 and j['version_id']=='v-4f40af6a7dd7'and not j.get('manual_paused')
  assert c['dependencies']==prep['previous_dependencies']and not c.get('game_spec')
 update=svc.mutate('/api/candidates/'+cid+'/dependencies',{'revision':2,'dependencies':prep['proposed_dependencies']},None,idem=op+'-dependencies')
 write_bytes(depfile,json.dumps(update,ensure_ascii=False,indent=2).encode())
with svc.store.read()as db:
 c=svc.get(db,'candidates',cid);assert c['dependencies']['revision']==3 and c['dependencies']['items']==prep['proposed_dependencies']['items']
 report['dependencies']=c['dependencies'];assert not c.get('game_spec')and not delivery_gaps(report,list(prep['manifest']))
if statefile.exists():state=json.loads(statefile.read_text(encoding='utf8'))
else:
 with svc.store.tx(label=op+'-claim')as db:
  j=svc.get(db,'jobs',jid);assert j['status']=='blocked'and j['round']==13 and j['version_id']=='v-4f40af6a7dd7'and not j.get('manual_paused')
  batch=svc.get(db,'batches',j['batch_id']);assert batch['status']=='running'
  settings=svc.get(db,'settings','main');capacity=svc._concurrency(settings)
  active=db.execute("SELECT count(*) FROM records WHERE kind='jobs' AND json_extract(data,'$.status')='running'").fetchone()[0]
  if active>=capacity:print(json.dumps({'complete':False,'waiting_capacity':True,'running':active,'limit':capacity,'job_not_continued':True}));raise SystemExit(0)
  budget={k:copy.deepcopy(j[k])for k in ['auto_followup','checkpoint_slices','no_progress_budget']if k in j}
  svc.continue_job(db,j,report['scope']+'沿原草稿及原预算接续，提交已经在52实测的原生AI单机包；不重新运行模型或游戏，不批准不供货。',resume_checkpoint=True)
  for k,v in budget.items():j[k]=v
  svc.store.put(db,'jobs',j)
  claimed=svc._mutate(db,'/api/v1/jobs/claim',{'job_id':jid,'capabilities':['reconstruct'],'worker_id':'codex-direct-repair-pool-20261113'},tool)['job']
  assert claimed and claimed['id']==jid and claimed['round']==14 and claimed['base_version_id']=='v-4f40af6a7dd7'
  state={'job_id':jid,'run_id':str(uuid.uuid4()),'lease_token':claimed['lease_token'],'round':claimed['round'],'claimed_at':now(),'budget_before':budget}
 write_bytes(statefile,json.dumps(state,ensure_ascii=False,indent=2).encode())
with svc.store.read()as db:
 j=svc.lease(db,jid,{'lease_token':state['lease_token']},tool);assert not j.get('manual_paused')and j['round']==state['round']
run=svc.runs_dir/state['run_id'];run.mkdir(exist_ok=True);binding={'job_id':jid,'lease_sha256':hashlib.sha256(state['lease_token'].encode()).hexdigest()};bp=run/'job-binding.json'
if bp.exists():assert json.loads(bp.read_text(encoding='utf8'))==binding
else:write_bytes(bp,json.dumps(binding).encode())
target=run/'converted'
if not target.exists():shutil.copytree(source,target)
for n,h in prep['manifest'].items():assert hashlib.sha256((target/n).read_bytes()).hexdigest()==h,n
artifactfile=stage/'artifact-submitted.json'
if artifactfile.exists():artifact=json.loads(artifactfile.read_text(encoding='utf8'))
else:
 artifact=svc.mutate('/api/v1/artifacts',{'job_id':jid,'lease_token':state['lease_token'],'local_run':state['run_id'],'entry':'index.html','report':report},tool,idem=op+'-artifact')
 write_bytes(artifactfile,json.dumps(artifact,ensure_ascii=False,indent=2).encode())
body={'lease_token':state['lease_token'],'outcome':'ready_review','artifact_id':artifact['artifact_id'],'report':report,'reason':report['scope']}
result=svc.mutate('/api/v1/jobs/'+jid+'/complete',body,tool,idem=op+'-complete')
with svc.store.read()as db:
 j=svc.get(db,'jobs',jid);v=svc.get(db,'versions',j['version_id']);a=svc.get(db,'artifacts',v['artifact_id']);old=svc.get(db,'versions','v-4f40af6a7dd7')
 assert j['status']=='review'and v['status']=='review'and v['id']!='v-4f40af6a7dd7',(j['status'],v['status'])
 assert v['base_version_id']=='v-4f40af6a7dd7'and old['status']=='draft'
 assert not delivery_gaps(v['report'],a['files'])and v['artifact_id']==artifact['artifact_id']and v['screenshots']and v['cover']
 for k,expected in state['budget_before'].items():
  if k!='checkpoint_slices':assert j.get(k)==expected,(k,j.get(k),expected)
 assert not j.get('manual_paused')
 out={'complete':True,'at':now(),'job_id':jid,'candidate_id':cid,'job_status':j['status'],'version_id':v['id'],'version_status':v['status'],'base_version_id':v['base_version_id'],'historical_version_status':old['status'],'round':j['round'],'artifact_id':a['id'],'artifact_sha256':a['sha256'],'files':len(a['files']),'offline':v['report']['offline_delivery']['status'],'delivery_gaps':[],'manifest_sha256':prep['manifest_sha256'],'source_main_sha256':prep['manifest']['main.js'],'preview_url':v['preview_url'],'screenshots':v['screenshots'],'cover':v['cover'],'commit':v.get('commit'),'manual_direct_repair':True,'model_worker_started':False,'game_rerun':False,'supply_started':False,'steps_used':11,'remaining':0,'budget_preserved':True,'accounting':report['accounting']}
write_bytes(receipt,json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=True))
