from pathlib import Path
import json,datetime,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-e7d352b1a2b1';p=r/'ui-ledger.json';ledger=json.loads(p.read_text(encoding='utf8'))
auth={'additional_steps':5,'scope':'Only this OMNIS native local revision, previous5 steps retained; no other game, manual pause release or admission without evidence.',
 'user_answer':'仅 OMNIS 此修订额外最多 5 步','question_id':'call_dc4135e6c7a849dcb0ee099e3951f0db'}
if 'extra_authorization' in ledger:
 assert all(ledger['extra_authorization'].get(k)==v for k,v in auth.items())
else:
 assert ledger['steps_used']==5 and ledger['max_steps']==5 and ledger['remaining']==0
 ledger['initial_max_steps']=5;ledger['extra_authorization']={**auth,'at':datetime.datetime.now(datetime.timezone.utc).isoformat()};ledger['max_steps']=10;ledger['remaining']=5
 p.write_text(json.dumps(ledger,ensure_ascii=False,indent=2),encoding='utf8')
remote='''from pathlib import Path
import json,sys,hashlib,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root));from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
stage=Path('D:/GameLab/temp/direct-omnis-local-20261116-v1');ledger=__LEDGER__
manifest=json.loads((stage/'converted/MANIFEST.json').read_text(encoding='utf8'));assert len(manifest)==220
for n,h in manifest.items():assert hashlib.sha256((stage/'converted'/n).read_bytes()).hexdigest()==h,n
p=stage/'extra-authorization-20261117.json';raw=json.dumps(ledger,ensure_ascii=False,indent=2).encode()
if p.exists():assert p.read_bytes()==raw
else:write_bytes(p,raw)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid=ledger['job_id']
with svc.store.read() as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked' and not before.get('manual_paused')
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'用户明确仅OMNIS此修订追加最多5步实机验证，原5步不重置，累计上限10、当前已用5剩5；220候选文件在52重新逐SHA复核。此次授权不扩展到其他游戏或人工暂停，不因授权直接入库。'},None,idem='direct-omnis-extra5-20261117')
with svc.store.read() as db:assert svc.get(db,'jobs',jid)==before
print(json.dumps({'complete':True,'files':220,'ledger_sha256':hashlib.sha256(raw).hexdigest(),'job':{k:before.get(k)for k in ['id','status','round','version_id','manual_paused','batch_id']},'used':5,'remaining':5,'task_unchanged':True}))
'''.replace('__LEDGER__',repr(ledger))
(b/'direct_omnis_extra_authorization_remote_20261117.py').write_text(remote,encoding='utf8');print(json.dumps({'used':ledger['steps_used'],'remaining':ledger['remaining'],'max_steps':ledger['max_steps']}))
