from pathlib import Path
import json,datetime,sys
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';p=r/'ui-ledger-native-v3-20261117.json'
ledger=json.loads(p.read_text(encoding='utf8'));mode=sys.argv[1];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
if mode=='reserve':
 assert ledger['remaining']>0 and all(s['status']!='reserved' for s in ledger['additional_steps'])
 n=ledger['additional_steps_used']+1
 ledger['additional_steps'].append({'additional_step':n,'cumulative_step':5+n,'reserved_at':now,'action':sys.argv[2],'status':'reserved','outcome':None})
 ledger.update(additional_steps_used=n,additional_steps_remaining=5-n,steps_used=5+n,remaining=5-n)
elif mode=='outcome':
 s=ledger['additional_steps'][-1];assert s['status']=='reserved';s.update(status='attempted',observed_at=now,outcome=sys.argv[2])
else:raise ValueError(mode)
raw=json.dumps(ledger,ensure_ascii=False,indent=2).encode();p.write_bytes(raw)
script="""from pathlib import Path
import json
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3')
raw=RAW
new=json.loads(raw);assert new['max_steps']==10 and new['steps_used']<=10 and new['remaining']==10-new['steps_used']
p=stage/'ui-ledger-native-v3-20261117.json'
if p.exists():
 old=json.loads(p.read_text(encoding='utf8'));assert old['steps_used']<=new['steps_used']
 if old['steps_used']==new['steps_used']:assert old['additional_steps'][-1]['action']==new['additional_steps'][-1]['action']
p.write_bytes(raw);print(json.dumps({'recorded':True,'steps_used':new['steps_used'],'remaining':new['remaining']}))
""".replace('RAW',repr(raw))
(b/'direct_leveldevil_step_ledger_remote_20261117.py').write_bytes(script.encode())
print(json.dumps({'steps_used':ledger['steps_used'],'remaining':ledger['remaining'],'last_step':ledger['additional_steps'][-1]}))
