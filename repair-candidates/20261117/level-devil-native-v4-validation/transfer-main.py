from pathlib import Path
import sys,json,hashlib,zipfile,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
parent=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4')
for n,h in json.loads((parent/'MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((parent/n).read_bytes()).hexdigest()==h,n
ledger=json.loads((parent/'ui-ledger-native-v4-20261117.json').read_text(encoding='utf8'));assert ledger['steps_used']==18 and ledger['remaining']==0
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
stage=parent/'actual-five-evidence-20261117'
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='5bef706e96d32850927896c4d704639727802c1a5f7734c0650c500831f6b372';m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil v4特批5步已实际用尽，历史13保留、累计18/剩0。新原生归档启动、刷新地图不再显示在线关卡推广、原门单次拖按进入首房间已观察；右移未确认，上方向键尝试未确认离地，未入库。只读绑定资源498和原Lua345/347核对后纠正测试方法：Space才是p1_jump，Up是p2_up，不能把之前Up尝试或父v3姿态当跳跃通过，错误尝试仍计额度。两次13连续事件/24同源资源200/无记录异常外联，原61候选支持文件SHA不变。V5.1当前16维及所有截图/账本/源码绑定已单独归档；任务failed/round6/v-1f8b04b1ee19不变，不继续游戏输入/模型/供货，不伪造时间Token价格。'},None,idem='direct-leveldevil-v4-actual-five-'+'5bef706e96d32850927896c4d704639727802c1a5f7734c0650c500831f6b372'[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'manifest_sha256':'5bef706e96d32850927896c4d704639727802c1a5f7734c0650c500831f6b372','files':len(m),'candidate_original_files_verified':61,'task_unchanged':True,'game_executed':False,'new_game_inputs_during_transfer':0,'ready_review':False,'v4_steps_used':5,'cumulative_steps_used':18,'remaining':0}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
