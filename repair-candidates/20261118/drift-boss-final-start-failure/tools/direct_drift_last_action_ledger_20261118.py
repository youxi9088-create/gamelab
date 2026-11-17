from pathlib import Path
import json,sys,datetime,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-1d7463d069d5';p=r/'ui-ledger-last-action-20261118.json';prior=(r/'pending-direct-status.json').read_bytes();assert json.loads(prior)['steps_used']==4
v=json.loads(p.read_text(encoding='utf8'))if p.exists()else{'job_id':r.name,'preserved_prior_steps':4,'maximum':5,'used':4,'remaining':1,'prior_status_sha256':hashlib.sha256(prior).hexdigest(),'steps':[],'scope':'Original maximum5, one remaining actual game navigation on remote52. No input beyond startup, no reset/unpause/model/supply.'}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
if sys.argv[1]=='reserve':
 assert v['used']==4 and v['remaining']==1 and not v['steps'];v.update(used=5,remaining=0);v['steps'].append({'step':5,'at':now,'action':'在52原生Chrome实际导航44文件同SHA候选，观察原生启动和导航边界','status':'reserved','outcome':None})
elif sys.argv[1]=='outcome':
 assert v['used']==5 and v['steps'][-1]['status']=='reserved';v['steps'][-1].update(status='attempted',observed_at=now,outcome=sys.argv[2])
else:raise ValueError(sys.argv[1])
raw=json.dumps(v,ensure_ascii=False,indent=2).encode();p.write_bytes(raw)
code='''from pathlib import Path
import sys,json
sys.path.insert(0,'D:/GameLab/app');from controlplane.atomic_files import write_bytes
p=Path('D:/GameLab/temp/direct-drift-last-action-20261118/continued-ledger.json');old=json.loads(p.read_text(encoding='utf8'));raw=RAW;new=json.loads(raw)
assert old['prior_status_sha256']==new['prior_status_sha256']and old['preserved_prior_steps']==new['preserved_prior_steps']==4 and old['maximum']==new['maximum']==5
assert old['used']<=new['used']<=5 and new['remaining']==5-new['used']
if old['steps']:assert new['steps'][-1]['action']==old['steps'][-1]['action']
write_bytes(p,raw);print(json.dumps({'recorded':True,'used':new['used'],'remaining':new['remaining'],'status':new['steps'][-1]['status']}))
'''.replace('RAW',repr(raw));(b/'direct_drift_last_action_ledger_remote_20261118.py').write_text(code,encoding='utf8');print(json.dumps({'used':v['used'],'remaining':v['remaining'],'status':v['steps'][-1]['status']}))
