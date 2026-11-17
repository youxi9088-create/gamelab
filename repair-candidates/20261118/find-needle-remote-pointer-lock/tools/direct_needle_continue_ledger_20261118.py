from pathlib import Path
import json,datetime,sys,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-0d68b7f140bc';p=r/'ui-validation-v2-continued-20261118.json'
oldraw=(r/'ui-validation-v2-ledger.json').read_bytes();old=json.loads(oldraw)
assert hashlib.sha256(oldraw).hexdigest()=='93e7da67a40eb521cd1c1f9ce26a8a869bf023d58699f703db352a63d8eb7c89'
v=json.loads(p.read_text(encoding='utf8')) if p.exists() else {'job_id':old['job_id'],'revision':old['revision'],'authorization_question':old['question_id'],'original_ledger_sha256':hashlib.sha256(oldraw).hexdigest(),'preserved_prior_steps':3,'maximum_authorized':5,'ui_steps_used':3,'remaining':2,'historical_cumulative_steps':None,'steps':[]}
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
if sys.argv[1]=='reserve':
 assert v['remaining']>0 and all(x['status']!='reserved'for x in v['steps'])
 v['ui_steps_used']+=1;v['remaining']=5-v['ui_steps_used']
 v['steps'].append({'step':v['ui_steps_used'],'at':now,'action':sys.argv[2],'status':'reserved','outcome':None})
elif sys.argv[1]=='outcome':
 x=v['steps'][-1];assert x['status']=='reserved';x.update(status='attempted',observed_at=now,outcome=sys.argv[2])
else:raise ValueError(sys.argv[1])
raw=json.dumps(v,ensure_ascii=False,indent=2).encode();p.write_bytes(raw)
code='''from pathlib import Path
import json
from sys import path
path.insert(0,'D:/GameLab/app')
from controlplane.atomic_files import write_bytes
p=Path('D:/GameLab/temp/direct-needle-remote-observation-20261118/continued-ledger.json');raw=RAW
old=json.loads(p.read_text(encoding='utf8'));new=json.loads(raw)
assert old['original_ledger_sha256']==new['original_ledger_sha256'] and new['preserved_prior_steps']==3 and new['maximum_authorized']==5
assert old['ui_steps_used']<=new['ui_steps_used']<=5 and new['remaining']==5-new['ui_steps_used']
assert new['steps'][:max(0,len(old['steps'])-1)]==old['steps'][:max(0,len(old['steps'])-1)]
if len(new['steps'])==len(old['steps']) and old['steps']:assert new['steps'][-1]['action']==old['steps'][-1]['action']
write_bytes(p,raw);print(json.dumps({'recorded':True,'used':new['ui_steps_used'],'remaining':new['remaining'],'status':new['steps'][-1]['status']}))
'''.replace('RAW',repr(raw))
(b/'direct_needle_continue_ledger_remote_20261118.py').write_text(code,encoding='utf8')
print(json.dumps({'used':v['ui_steps_used'],'remaining':v['remaining'],'status':v['steps'][-1]['status']}))
