from pathlib import Path
import sys,json,hashlib,zipfile,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
base=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3');stage=base/'additional-five-evidence-20261117'
original=json.loads((base/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in original.items():assert hashlib.sha256((base/n).read_bytes()).hexdigest()==h,n
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='421dc181cadb77176c72fd03c089c2cb5da7743e6e655f90f8b7fa3b42bc5885';m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil原生v3用户追加5步已完成，累计10/剩0。新归档实际被Defold接受，章节地图正常；前3次入口短按/焦点尝试未进入并照实计数，最后第5步原门口连续鼠标按下释放进入原生首房间，角色/出口/进度显示。13连续观察事件、12项同源资源200、无记录脚本异常/外部请求，45候选源码SHA保持。仍未验证移动/跳跃/结算/刷新，runtime_verified及ready_review均false，不入库、不修改任务/版本预算、不启动模型/供货。独立追加证据及完整动作账本已落盘；不能把初始化当核心闭环。'},None,idem='direct-leveldevil-native-v3-five-evidence-20261117-'+'421dc181cadb77176c72fd03c089c2cb5da7743e6e655f90f8b7fa3b42bc5885'[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'manifest_sha256':'421dc181cadb77176c72fd03c089c2cb5da7743e6e655f90f8b7fa3b42bc5885','files':len(m),'candidate_files_verified':45,'task_unchanged':True,'ui_steps_used':10,'remaining':0,'native_startup_observed':True,'native_first_room_observed':True,'runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
