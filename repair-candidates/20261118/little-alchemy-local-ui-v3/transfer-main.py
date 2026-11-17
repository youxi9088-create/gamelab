from pathlib import Path
import sys,json,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-e402fd36800c'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and before['candidate_id']=='game-9806ed6cef79'and not before.get('manual_paused')
s=Path('D:/GameLab/temp/direct-alchemy-local-ui-v3-20261118');s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(s/'MANIFEST.json',raw_manifest)
proof=json.loads((s/'candidate/evidence/direct-repair/local-ui-v3-source-proof.json').read_text(encoding='utf8'))
readiness=json.loads((s/'candidate/evidence/direct-repair/v3-static-readiness.json').read_text(encoding='utf8'))
assert proof['all_function_occurrences_unchanged']==252 and readiness['inline_images']==617 and not readiness['delivery_static']['findings']
assert hashlib.sha256((s/'candidate/resources/base.580.json').read_bytes()).hexdigest()==proof['base_sha256']
assert hashlib.sha256((s/'candidate/resources/images.580.json').read_bytes()).hexdigest()==proof['images_sha256']
proposal=json.loads((s/'validation-proposal.json').read_text(encoding='utf8'));assert proposal['prior_ui_steps']==5 and not proposal['authorized']and not proposal['game_started']
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'已备独立Little Alchemy原任务v3候选：清理失效云账户/分享/排行启动提示、关联游戏推广缺图消费者，恢复误被分享样式隐藏的原进度数字；无引用重复offline/css只从新包去除，旧版留存。252原函数体语义和616原元素JSON/617PNG字节不变，617PNG逐块CRC通过；静态资源/交付检查无发现。V5.1独立16维及真实未知用量null齐备，已同步temp/direct-alchemy-local-ui-v3-20261118逐SHA验证。原5步全保留，当前没有新增试玩授权，未启动游戏/观察器/模型，不入库。拟仅5步核对启动、PLAY、水拖工作区、火拖水原生steam、刷新赚取存档；只是计划，不是假验收。'},None,idem='direct-alchemy-local-ui-v3-prepared-20261118')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(s),'files_verified':len(manifest),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'main_sha256':proof['main_sha256'],'all_function_occurrences_unchanged':252,'base_records':616,'inline_images':617,'static_missing':0,'prior_ui_steps':5,'new_ui_authorization':False,'game_started':False,'task_unchanged':True,'ready_review':False,'job':{k:before.get(k)for k in ['id','status','version_id','round','manual_paused']}};write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
