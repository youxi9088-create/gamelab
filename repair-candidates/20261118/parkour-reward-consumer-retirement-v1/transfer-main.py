from pathlib import Path
import sys,json,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-09a1ed6877a8'
with svc.store.read()as db:
 before=copy.deepcopy(svc.get(db,'jobs',jid));version=copy.deepcopy(svc.get(db,'versions','v-62122cc85ac0'))
assert before['candidate_id']=='game-dcc5130f5732'and before['manual_paused']and before['round']==6 and before['status']=='queued'
original=r/'data/artifacts'/version['artifact_id']
with zipfile.ZipFile(sys.argv[0])as z:
 proof=json.loads(z.read('candidate/evidence/direct-repair/reward-retirement-v1-source-proof.json'));audit=json.loads(z.read('candidate/evidence/direct-repair/reward-retirement-v1-static-audit.json'))
 assert hashlib.sha256((original/'game-web.js').read_bytes()).hexdigest()==proof['original_main_sha256']
 for n,h in proof['retained_manifest'].items():assert hashlib.sha256((original/n).read_bytes()).hexdigest()==h,n
 assert audit['checks_passed']==12 and not audit['game_executed']and audit['new_inputs']==0
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest);s=Path('D:/GameLab/temp/direct-parkour-reward-v1-20261118');s.mkdir(exist_ok=True)
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(s/'MANIFEST.json',raw_manifest)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'独立未交付修订已准备：阻止视频/支付未完成却success回调的免费授益，隐藏并停用试用/视频钻石入口；钻石足额原升级分支AST不变，不足时不授益。12项静态核对通过，w/J/N/O原方法语义不变；490保留文件及原main SHA与历史approved v-62122cc85ac0的artifact真实核对。仅保存temp/direct-parkour-reward-v1-20261118，不覆盖原包、不启任务、不解除人工暂停；旧5步保留、新玩家操作0。其他SDK方法/死代码未完整退役，当前修订未实机、未入库；V5.1及未知用量null如实登记。'},None,idem='direct-parkour-reward-v1-prepared-20261118')
with svc.store.read()as db:
 assert svc.get(db,'jobs',jid)==before
 assert svc.get(db,'versions','v-62122cc85ac0')==version
assert hashlib.sha256((original/'game-web.js').read_bytes()).hexdigest()==proof['original_main_sha256']
out={'complete':True,'stage':str(s),'files_verified':len(manifest),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'original_main_sha256':proof['original_main_sha256'],'candidate_main_sha256':proof['candidate_main_sha256'],'retained_original_files_verified':490,'static_checks':12,'job_unchanged':True,'version_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'new_inputs':0,'prior_ui_steps':5,'ready_review':False};write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
