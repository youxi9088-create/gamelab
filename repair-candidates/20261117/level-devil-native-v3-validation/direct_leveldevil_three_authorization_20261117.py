from pathlib import Path
import json,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';p=r/'ui-ledger-native-v3-20261117.json'
x=json.loads(p.read_text(encoding='utf8'));assert x['max_steps']==10 and x['steps_used']==10 and x['remaining']==0 and all(s['status']=='attempted'for s in x['additional_steps'])
grant={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'question_id':'call_y3mdSTScSZcHhD0ZkwVw3SFG','answer':'仅此修订追加最多3步','extra_steps':3,'revision':x['revision'],'candidate_transfer_manifest_sha256':x['candidate_transfer_manifest_sha256'],'scope':'Only current loaded v3 revision; move, jump, refresh; original10 attempts preserved.'}
g=r/'extra-three-authorization-20261117.json';assert not g.exists();g.write_bytes(json.dumps(grant,ensure_ascii=False,indent=2).encode())
x.update(max_steps=13,remaining=3,additional_max_steps=8,additional_steps_remaining=3,extra_three_authorization=grant)
p.write_bytes(json.dumps(x,ensure_ascii=False,indent=2).encode())
script="""from pathlib import Path
import json,sys,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3');grant=GRANT;ledger=LEDGER
p=stage/'extra-three-authorization-20261117.json'
if p.exists():assert p.read_bytes()==grant
else:p.write_bytes(grant)
old=json.loads((stage/'ui-ledger-native-v3-20261117.json').read_text(encoding='utf8'));new=json.loads(ledger)
assert old['steps_used']==new['steps_used']==10 and old['additional_steps']==new['additional_steps']
(stage/'ui-ledger-native-v3-20261117.json').write_bytes(ledger)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-ca75d464d2d7'));assert before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
svc.mutate('/api/jobs/job-ca75d464d2d7/work-log',{'message':'用户仅对当前已加载Level Devil原生v3再追加最多3步，核对移动/跳跃/刷新；绑定同一45文件清单，原10次实机尝试全部保留，累计总上限13/已用10/剩3。原任务/版本预算及暂停约束不变，不重启原任务或模型，未提前登记玩法通过。'},None,idem='direct-leveldevil-native-v3-three-authorized-20261117')
with svc.store.read()as db:assert svc.get(db,'jobs','job-ca75d464d2d7')==before
out={'complete':True,'max_steps':13,'steps_used':10,'remaining':3,'tasks_unchanged':True}
(stage/'extra-three-authorization-receipt-20261117.json').write_bytes(json.dumps(out).encode());print(json.dumps(out))
""".replace('GRANT',repr(g.read_bytes())).replace('LEDGER',repr(p.read_bytes()))
(b/'direct_leveldevil_three_authorization_remote_20261117.py').write_bytes(script.encode());print('Additional3 recorded; original10 preserved.')
