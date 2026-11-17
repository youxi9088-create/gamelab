"""Package source evidence only, with original-file checks on remote52."""
from pathlib import Path
import zipfile, json, hashlib

b = Path(__file__).parent
r = b/'direct-games/job-3db06205247a'
folder = r/'analysis-20261117/offline-boundary'
proof = json.loads((folder/'offline-consumer-source-proof.json').read_text(encoding='utf8'))
calls = json.loads((folder/'original-offline-connect-direct-call-sites.json').read_text(encoding='utf8'))
assert proof['original_offline_mode_semantic_evidence']['warning'] == "Can't start OFFLINE mode while connected!"
assert calls['defined_functions_disassembled'] == 138243
assert len(calls['calls']) == 8
assert all(row['caller_metadata_aliases'] and all(a['image']=='PhotonUnityNetworking.dll' for a in row['caller_metadata_aliases']) for row in calls['calls'])
files = {n:(folder/n).read_bytes() for n in ['offline-consumer-source-proof.json','original-offline-direct-call-sites.json','original-offline-connect-direct-call-sites.json']}
files.update({'repair-source/'+n:(b/n).read_bytes() for n in ['direct_smash_offline_boundary_20261117.py','direct_smash_offline_callers_20261117.py']})
files['README.md'] = '''# Smash Karts 原生离线模式边界（源码调查，未交付）

原WASM/metadata不改，原任务job-3db06205247a状态、版本及预算不变，试玩0/5。本次没有可启动候选，没有游戏执行，不入库、不供货。

从原PhotonUnityNetworking.dll模块表定位133个PhotonNetwork方法与27个属性。原属性qzt/getter ijp=96313/setter ijq=7186，真实setter有状态一致检查、已连接拒绝、断开连接、切换本地ID及连接回调。原警告getter46206由原class a初始化器109101/field44861的12647字节原RVA解码，原文为“Can't start OFFLINE mode while connected!”；不是按SDK方法次序猜名。

两次静态反汇编均完整读取138243个原定义函数。离线setter的7处直接调用均属原PUN库内部；其中ilc41676包含显式offline布尔分支，原代码对它的唯一直接调用为PUN.ilb17293。没有在本次直接调用扫描中发现游戏Assembly-CSharp直接启用离线模式。此结论只限直接call指令，不能排除delegate/table/reflection路径。

原GameStartScreen练习按钮仍调用GameManager.StartRoundSpawn；原PhotonConnectionManager.Awake仍读取实际Firebase用户。SDK本身存在OfflineMode不能证明游戏已具有独立单机入口。当前还需解决真实游戏消费者、房间/玩家初始化及本地完整对局，不能伪造Firebase身份或远端成功状态。两份原资源目录162包材料虽齐，不是游戏完成。

本目录只收录静态源码证据与可修改工具。大体积NOT-RUNTIME切片及完整字符串表不入运行包，不执行原游戏代码；实际GUI预算和交付结论保持不变。未知独占耗时、逐游戏Token、费用仍为null。
'''.encode('utf8')
manifest = {n:hashlib.sha256(raw).hexdigest() for n,raw in files.items()}
manifest_raw = json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2).encode()
digest = hashlib.sha256(manifest_raw).hexdigest()
main = '''from pathlib import Path
import sys,zipfile,json,hashlib,copy
with zipfile.ZipFile(sys.argv[0]) as z:
 raw_manifest=z.read('MANIFEST.json');assert hashlib.sha256(raw_manifest).hexdigest()==__DIGEST__
 manifest=json.loads(raw_manifest)
 for n,h in manifest.items():assert hashlib.sha256(z.read(n)).hexdigest()==h,n
 if '--verify-only' in sys.argv:
  print(json.dumps({'complete':True,'files':len(manifest),'source_only':True,'game_executed':False}));raise SystemExit(0)
 root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
 from controlplane.service import Service
 from controlplane.store import ACTOR
 from controlplane.atomic_files import write_bytes
 native=Path('D:/GameLab/temp/direct-smash-native-materials-20261117-v1/native-build/aedef0a7b3758084f1b210f292a2b27d.wasm.br')
 assert hashlib.sha256(native.read_bytes()).hexdigest()==__WASM__
 metadata=Path('D:/GameLab/temp/direct-smash-metadata-source-20261117-v1/analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat')
 assert hashlib.sha256(metadata.read_bytes()).hexdigest()==__METADATA__
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
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash Karts原生单机边界新增源码证据：真实Photon离线属性qzt/ijp96313/ijq7186及原RVA警告已定位；完整静态反汇编138243个原函数，7个setter直接调用与1个offline布尔入口直接调用均在PUN库内部，未据此声称已有游戏单机路径。52重新核对原WASM及metadata SHA，6份源码证据/工具逐SHA同步。原练习链仍依赖实际Firebase/Photon游戏消费者，未改运行包、不造身份、不入库，试玩0/5，任务版本状态预算不变。'},None,idem='direct-smash-offline-boundary-20261117-'+__DIGEST__[:12])
 with svc.store.read() as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'files':len(manifest),'manifest_sha256':__DIGEST__,'original_wasm_verified':True,'original_metadata_verified':True,'game_executed':False,'task_unchanged':True,'ui_steps_used':0,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('__DIGEST__',repr(digest)).replace('__WASM__',repr(proof['original_wasm_sha256'])).replace('__METADATA__',repr(proof['original_metadata_sha256']))
compile(main,'static-evidence-transfer','exec')
target=b/'direct_smash_offline_evidence_20261117.pyz'
assert not target.exists(),'Read existing remote receipt before repeating transfer'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest_raw)
 for n,raw in files.items():z.writestr(n,raw)
print(json.dumps({'source_only':True,'files':len(files),'manifest_sha256':digest,'zipapp_bytes':target.stat().st_size}))
