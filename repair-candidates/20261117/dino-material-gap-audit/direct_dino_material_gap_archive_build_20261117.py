from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-c8efbf50be33';files={}
for n in ['mission-failure-paths-20261117.json','original-missing-material-inventory-20261117.json','pending-direct-status.json']:files[n]=(r/n).read_bytes()
for p in (r/'mission-source-proof-20261117').iterdir():
 if p.is_file():files['mission-source-proof/'+p.name]=p.read_bytes()
files['original-source-intake-receipt.json']=(r/'missing-original-intake-20261117/receipt.json').read_bytes()
for n in ['direct_dino_mission_failure_read_20261117.py','direct_dino_original_missing_inventory_20261117.py','direct_dino_missing_original_intake_20261117.py','direct_dino_mission_source_proof_20261117.cjs']:files['support/'+n]=(b/n).read_bytes()
files['README.md']='''# Dino Simulator 原材料缺口补核

只分析已有成功启动的完整网络证据，不运行真实游戏、不新增输入、不改变原包或原任务。原5步额度目前实际4/5，剩1；孵蛋原门槛5次不改，现有一次破壳不能冒充孵化/行走/完整循环。

成功启动记录中的23次404请求去重为17个实际文件：8份pack_a根及7种恐龙missions.json、9份NPC叫声音频。当前本机所有原始/工作材料都没有这些文件，不是仅资源路径映射。原YA.load实际Promise.all载入JSON并读取targets/types/missions，原WD遇非成功HTTP会抛错；没有用空JSON或新造任务填充。WD/Ea/YA.load规范化源码与工作副本一致；整个YA类有此前遥测退役差异，不宣称全类字节不变。

从原恢复回执绑定的同一构建HTTPS目录，限定读取根missions.json和pteranodon_call.ogg两项，均实际403。随即停止其余15项同源请求；不能写成17份原站均403，也不能将403当文件不存在或下架。不改代理/TLS/请求身份、不绕站点访问限制、不猜版本/镜像。

原始索引JS SHA602e9a1c38853b63ef1aa7d146c728bdf55765ca5a232c8ee89fcc6c76330d07，绑定真实原run b85e05ad-2d69-4332-8514-3302c59a4384/converted。现有工作副本SHA6b44f8750eb3adcbdb656516de418098a684ff96d987071107377bbaa2c2a55c未修改。原先只写“mission JSON等404”的缺口现在具体为8任务JSON＋9音频，未假称源码修复完成或待验收。独占处理耗时/Token/费用未知仍null。
'''.encode()
manifest={n:hashlib.sha256(data).hexdigest()for n,data in files.items()};raw=json.dumps(manifest,sort_keys=True,indent=2).encode();digest=hashlib.sha256(raw).hexdigest()
main='''from pathlib import Path
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
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()==DIGEST;m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked'and before['version_id']is None and not before.get('manual_paused')
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Dino Simulator既有完整启动网络缺口补核：23次404去重17文件，8份missions.json＋9种NPC叫声音频在当前原始/工作材料均不存在。原YA.load Promise.all依赖targets/types/missions，WD非成功HTTP抛错，未造空任务或删音频凑完整。规范化WD/Ea/YA.load与原源码保持；整个YA有此前遥测差异，不称全类原字节。按同一原构建HTTPS精确读取根missions.json、pteranodon叫声两份均403，已停止其余15请求，不绕限制不换版本。原绑定run/index.js SHA已复核，原5步实际4/剩1，孵化后行走/完整核心仍未证明。支持证据独立同步temp/direct-dino-material-gap-20261117-v1；不跑游戏/模型、不接续、不入库、不修改原任务版本预算及其他游戏。'},None,idem='direct-dino-material-gap-20261117-'+DIGEST[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'manifest_sha256':DIGEST,'files':len(m),'original_run_bound':run.name,'original_source_sha256':'602e9a1c38853b63ef1aa7d146c728bdf55765ca5a232c8ee89fcc6c76330d07','missing_files':17,'original_source_requests':2,'source_http_statuses':[403,403],'remaining15_not_requested':True,'task_unchanged':True,'game_executed':False,'runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('DIGEST',repr(digest))
compile(main,'dino-material-gap-proof-transfer','exec');target=b/'direct_dino_material_gap_evidence_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',raw)
 for n,data in files.items():z.writestr(n,data)
print(json.dumps({'files':len(files),'bytes':target.stat().st_size,'manifest_sha256':digest}))
