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
assert version['candidate_id']==before['candidate_id']and version['status']=='approved'
original=r/'data/artifacts'/version['artifact_id']
with zipfile.ZipFile(sys.argv[0])as z:
 proof=json.loads(z.read('candidate/evidence/direct-repair/sdk-consumer-v2-source-proof.json'))
 audit=json.loads(z.read('candidate/evidence/direct-repair/sdk-v2-authoritative-static-audit.json'))
 previous=json.loads(z.read('source-read-receipt.json'))
 assert hashlib.sha256((original/'game-web.js').read_bytes()).hexdigest()==previous['main_sha256']
 prior_stage=Path('D:/GameLab/temp/direct-parkour-reward-v1-20261118/candidate/game-web.js')
 assert hashlib.sha256(prior_stage.read_bytes()).hexdigest()==proof['previous_main_sha256']
 for n,h in proof['retained_manifest'].items():assert hashlib.sha256((original/n).read_bytes()).hexdigest()==h,n
 assert audit['loader_tests_passed']==9 and not audit['game_executed']and audit['new_inputs']==0
 assert len(audit['removed_provider_and_wrapper_methods'])==33 and audit['runtime_provider_member_expressions']==0
 assert audit['literal_unreachable_non_session_references']==117 and audit['verified_content_files']==456
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest);s=Path('D:/GameLab/temp/direct-parkour-sdk-v2-20261118');s.mkdir(exist_ok=True)
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(s/'MANIFEST.json',raw_manifest)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'独立SDK消费者v2候选已准备：主程序移除25个原SDK方法与8个广告包装，12处开始/结束本地续接直接保留，广告奖励入口不授益；本地加载改为逐字节/SHA核对真实同源456内容后才置三个分包就绪，不再伪报SDK分包成功。9项隔离加载器测试通过，20原关卡JSON/765原类方法、世界及初始经济和足额升级分支保持。新解析修正旧检查缓存绑定计数：4处纯本地会话状态、117处字面量恒假引用逐处有证，不是零引用；主程序运行SDK成员访问为0，未加载旧SDK素材/脚本保留历史。仅temp/direct-parkour-sdk-v2-20261118逐SHA保存，原489文件与历史artifact核对。人工暂停及原任务/版本不变，旧5步保留、新输入0；静态无缺项但离线pending，未启动/安装/入库，V5.1及未知用量null如实登记。'},None,idem='direct-parkour-sdk-v2-prepared-20261118')
with svc.store.read()as db:
 assert svc.get(db,'jobs',jid)==before
 assert svc.get(db,'versions','v-62122cc85ac0')==version
assert hashlib.sha256((original/'game-web.js').read_bytes()).hexdigest()==previous['main_sha256']
out={'complete':True,'stage':str(s),'files_verified':len(manifest),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'original_main_sha256':previous['main_sha256'],'previous_candidate_main_sha256':proof['previous_main_sha256'],'candidate_main_sha256':audit['main_sha256'],'retained_original_files_verified':len(proof['retained_manifest']),'native_content_files':456,'removed_provider_and_wrapper_methods':33,'literal_dead_non_session_references':117,'loader_tests':9,'job_unchanged':True,'version_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'new_inputs':0,'prior_ui_steps':5,'ready_review':False}
write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
