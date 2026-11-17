from pathlib import Path
import sys,zipfile,json,hashlib,copy
with zipfile.ZipFile(sys.argv[0]) as z:
 raw_manifest=z.read('MANIFEST.json');assert hashlib.sha256(raw_manifest).hexdigest()=='29e5f23cf298e118a5e2e006dc2f254a75f04ade48e06612b182b34edea2a741'
 manifest=json.loads(raw_manifest)
 for n,h in manifest.items():assert hashlib.sha256(z.read(n)).hexdigest()==h,n
 if '--verify-only' in sys.argv:
  print(json.dumps({'complete':True,'files':len(manifest),'source_only':True,'game_executed':False}));raise SystemExit(0)
 root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
 from controlplane.service import Service
 from controlplane.store import ACTOR
 from controlplane.atomic_files import write_bytes
 native=Path('D:/GameLab/temp/direct-smash-native-materials-20261117-v1/native-build/aedef0a7b3758084f1b210f292a2b27d.wasm.br')
 assert hashlib.sha256(native.read_bytes()).hexdigest()=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
 metadata=Path('D:/GameLab/temp/direct-smash-metadata-source-20261117-v1/analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat')
 assert hashlib.sha256(metadata.read_bytes()).hexdigest()=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
 materials=json.loads(Path('D:/GameLab/temp/direct-smash-addressables-materials-20261117-v1/receipt.json').read_text(encoding='utf8'))
 assert materials['complete'] and materials['bundles']==162 and not materials['game_started']
 stage=Path('D:/GameLab/temp/direct-smash-offline-boundary-20261117-v1');stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());raw=z.read(n)
  if p.exists():assert p.read_bytes()==raw,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,raw)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw_manifest
 else:write_bytes(p,raw_manifest)
 for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
 svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-3db06205247a'
 with svc.store.read() as db:
  before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked' and not before.get('manual_paused')
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash Karts原生单机边界新增源码证据：真实Photon离线属性qzt/ijp96313/ijq7186及原RVA警告已定位；完整静态反汇编138243个原函数，7个setter直接调用与1个offline布尔入口直接调用均在PUN库内部，未据此声称已有游戏单机路径。52重新核对原WASM及metadata SHA，6份源码证据/工具逐SHA同步。原练习链仍依赖实际Firebase/Photon游戏消费者，未改运行包、不造身份、不入库，试玩0/5，任务版本状态预算不变。'},None,idem='direct-smash-offline-boundary-20261117-'+'29e5f23cf298e118a5e2e006dc2f254a75f04ade48e06612b182b34edea2a741'[:12])
 with svc.store.read() as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'files':len(manifest),'manifest_sha256':'29e5f23cf298e118a5e2e006dc2f254a75f04ade48e06612b182b34edea2a741','original_wasm_verified':True,'original_metadata_verified':True,'game_executed':False,'task_unchanged':True,'ui_steps_used':0,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
