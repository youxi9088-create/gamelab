from pathlib import Path
import zipfile,sys,json,hashlib,copy
with zipfile.ZipFile(sys.argv[0]) as archive:
 manifest_raw=archive.read('MATERIAL_MANIFEST.json');assert hashlib.sha256(manifest_raw).hexdigest()=='2f421d8e794ae89b60860970b4d4ebca4b2c5bf2624daa4ab866762ef59819a0'
 manifest=json.loads(manifest_raw)
 if '--verify-only' in sys.argv:
  for n,h in manifest.items():assert hashlib.sha256(archive.read(n)).hexdigest()==h,n
  print(json.dumps({'verified_zipapp_payload':True,'files':len(manifest),'game_executed':False}));raise SystemExit(0)
 root=Path('D:/GameLab/app');sys.path.insert(0,str(root));from controlplane.service import Service
 from controlplane.store import ACTOR
 from controlplane.atomic_files import write_bytes
 stage=Path('D:/GameLab/temp/direct-smash-addressables-materials-20261117-v1');stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());data=archive.read(n);assert hashlib.sha256(data).hexdigest()==h,n
  if p.exists():assert p.read_bytes()==data,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MATERIAL_MANIFEST.json'
 if p.exists():assert p.read_bytes()==manifest_raw
 else:write_bytes(p,manifest_raw)
 for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
 svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-3db06205247a'
 with svc.store.read() as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked' and not before.get('manual_paused')
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash Karts原同构建资源材料已同步52：两份Addressables目录200，162独立UnityFS包160606474字节逐SHA与原容器/序列化读取通过，含44个两平台scene bundle，不能当44关实测。原native前缀getter、原字符串RVA异或初始化及JS文件名桥静态证据完整。首次4项临时连接失败与限定一次补取回执保留。V5.1十六维及源码工具一并同步，未知耗时Token费用null。仅原材料补充，Firebase/Photon及实际单机流程仍待处理；无游戏启动、无状态版本预算变更，不入库不供货，试玩0/5。'},None,idem='direct-smash-addressables-materials-20261117-'+'2f421d8e794ae89b60860970b4d4ebca4b2c5bf2624daa4ab866762ef59819a0'[:12])
 with svc.store.read() as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'material_files':len(manifest),'bundles':162,'bundle_bytes':160606474,'catalogs':2,'manifest_sha256':'2f421d8e794ae89b60860970b4d4ebca4b2c5bf2624daa4ab866762ef59819a0','game_started':False,'ui_steps_used':0,'task_unchanged':True,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
