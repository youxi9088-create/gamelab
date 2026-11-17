from pathlib import Path
import sys,json,hashlib,zipfile,copy,datetime
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
from controlplane.offline_delivery import inspect
parent=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3')
for n,h in json.loads((parent/'MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((parent/n).read_bytes()).hexdigest()==h,n
ledger=json.loads((parent/'ui-ledger-native-v3-20261117.json').read_text(encoding='utf8'));assert ledger['steps_used']==13 and ledger['remaining']==0 and all(x['status']=='attempted'for x in ledger['additional_steps'])
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='9556d187fe71577181c81ed250cd857e88cd01c80fd1810b01287011faa38027';m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
for n,h in m.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
review=json.loads((stage/'support/native-retirement-v4-static-audit-20261117.json').read_text(encoding='utf8'))['offline_features']
audit=inspect(stage/'converted',{'passed':False,'environment':'local-artifact','actions':[]},review)
assert not audit['findings']and not audit.get('evidence_issues')and not audit['unreviewed_features']and audit['status']=='pending',audit
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil原生v3追加3步已实际完成，累计13/13：右移未确认，上键即时姿态/短暂离地响应后落地，刷新进入原生地图但出现在线玩家关卡推广，故未入库。已依据真实失败准备v4，删除原Lua79延时INFINITEMODE调度及Lua244的YES在线消费者，保留原取消和地图延时焦点恢复；不改进度/解锁/物理/关卡。v3→v4仅两资源解码改变、801不变，WASM/JS/入口不变；47候选文件和补充证据逐SHA确认，V5.1已补。静态finding0而runtime/ready_review仍false。当前没有新试玩额度，不运行v4/模型/观察器，不更改任务版本/预算/暂停，不供货。'},None,idem='direct-leveldevil-native-v4-popup-retirement-'+'9556d187fe71577181c81ed250cd857e88cd01c80fd1810b01287011faa38027'[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':str(stage),'manifest_sha256':'9556d187fe71577181c81ed250cd857e88cd01c80fd1810b01287011faa38027','files':len(m),'candidate_files':sum(n.startswith('converted/')for n in m),'parent_v3_files_verified':62,'task_unchanged':True,'status':before['status'],'version_id':before['version_id'],'round':before['round'],'ui_steps_used':13,'remaining':0,'changed_parent_resources':[79,244],'static_findings':0,'game_executed':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
