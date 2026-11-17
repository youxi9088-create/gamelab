from pathlib import Path
import json,datetime,sys
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';p=r/'ui-ledger-native-v4-20261117.json';v=json.loads(p.read_text(encoding='utf8'));now=datetime.datetime.now(datetime.timezone.utc).isoformat()
if sys.argv[1]=='reserve':
 assert v['remaining']>0 and all(x['status']!='reserved'for x in v['steps']);n=v['additional_steps_used']+1
 v['steps'].append({'v4_step':n,'cumulative_step':13+n,'at':now,'action':sys.argv[2],'status':'reserved','outcome':None});v.update(additional_steps_used=n,steps_used=13+n,remaining=5-n)
elif sys.argv[1]=='outcome':
 x=v['steps'][-1];assert x['status']=='reserved';x.update(status='attempted',observed_at=now,outcome=sys.argv[2])
else:raise ValueError(sys.argv[1])
raw=json.dumps(v,ensure_ascii=False,indent=2).encode();p.write_bytes(raw)
script='''from pathlib import Path
import json
p=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4/ui-ledger-native-v4-20261117.json');raw=RAW;new=json.loads(raw);old=json.loads(p.read_text(encoding='utf8'))
assert old['steps_used']<=new['steps_used']<=18 and new['remaining']==18-new['steps_used'] and new['max_steps']==18 and new['preserved_prior_actual_steps']==13
if old['steps_used']==new['steps_used'] and old['steps']:assert old['steps'][-1]['action']==new['steps'][-1]['action']
p.write_bytes(raw);print(json.dumps({'recorded':True,'cumulative_used':new['steps_used'],'v4_used':new['additional_steps_used'],'remaining':new['remaining']}))
'''.replace('RAW',repr(raw));(b/'direct_leveldevil_v4_step_ledger_remote_20261117.py').write_bytes(script.encode())
print(json.dumps({'cumulative_used':v['steps_used'],'v4_used':v['additional_steps_used'],'remaining':v['remaining'],'last':v['steps'][-1]},ensure_ascii=False))
