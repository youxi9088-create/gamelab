from pathlib import Path
import sys,json,hashlib,zipfile,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
run=root/'executors/runs/b85e05ad-2d69-4332-8514-3302c59a4384';jid='job-c8efbf50be33'
assert json.loads((run/'job-binding.json').read_text(encoding='utf8'))['job_id']==jid
assert hashlib.sha256((run/'converted/index.js').read_bytes()).hexdigest()=='602e9a1c38853b63ef1aa7d146c728bdf55765ca5a232c8ee89fcc6c76330d07'
stage=Path('D:/GameLab/temp/direct-dino-material-gap-20261117-v1')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='6c6735023ed81188aaa3fd447db699c5ddfebacc6a2b9c3e71fd3d5e2f0b68b8';m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked'and before.get('version_id')is None and not before.get('manual_paused')
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Dino Simulator既有完整启动网络缺口补核：23次404去重17文件，8份missions.json＋9种NPC叫声音频在当前原始/工作材料均不存在。原YA.load Promise.all依赖targets/types/missions，WD非成功HTTP抛错，未造空任务或删音频凑完整。规范化WD/Ea/YA.load与原源码保持；整个YA有此前遥测差异，不称全类原字节。按同一原构建HTTPS精确读取根missions.json、pteranodon叫声两份均403，已停止其余15请求，不绕限制不换版本。原绑定run/index.js SHA已复核，原5步实际4/剩1，孵化后行走/完整核心仍未证明。支持证据独立同步temp/direct-dino-material-gap-20261117-v1；不跑游戏/模型、不接续、不入库、不修改原任务版本预算及其他游戏。'},None,idem='direct-dino-material-gap-20261117-'+'6c6735023ed81188aaa3fd447db699c5ddfebacc6a2b9c3e71fd3d5e2f0b68b8'[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'manifest_sha256':'6c6735023ed81188aaa3fd447db699c5ddfebacc6a2b9c3e71fd3d5e2f0b68b8','files':len(m),'original_run_bound':run.name,'original_source_sha256':'602e9a1c38853b63ef1aa7d146c728bdf55765ca5a232c8ee89fcc6c76330d07','missing_files':17,'original_source_requests':2,'source_http_statuses':[403,403],'remaining15_not_requested':True,'task_unchanged':True,'game_executed':False,'runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
