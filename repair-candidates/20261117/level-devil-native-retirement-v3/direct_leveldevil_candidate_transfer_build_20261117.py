from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';source=r/'work-native-retirement-20261117-v3'
files={'converted/'+p.relative_to(source).as_posix():p.read_bytes()for p in source.rglob('*')if p.is_file()}
for name in ['defold_v6_source_edit.py','test_defold_v6_source_edit.py','direct_leveldevil_boundary_inventory_20261117.cjs','direct_leveldevil_native_sdk_read_20261117.py','direct_leveldevil_ui_boundary_read_20261117.py','direct_leveldevil_source_retirement_20261117.py','direct_leveldevil_glue_retirement_20261117.cjs','direct_leveldevil_final_source_prepare_20261117.py','direct_leveldevil_candidate_static_read_20261117.py']:files['support/'+name]=(b/name).read_bytes()
for name in ['js-import-binding.json','native-sdk-binding.json','native-sdk-selected-functions.txt','gui-boundary-controls.json']:files['support/'+name]=(r/'analysis-boundary-20261117'/name).read_bytes()
static=json.loads((r/'native-retirement-v3-static-audit-corrected-20261117.json').read_text(encoding='utf8'));assert static['audit']['status']=='pending'and not static['audit']['findings']and not static['audit'].get('evidence_issues')
files['support/static-audit.json']=json.dumps(static,ensure_ascii=False,indent=2).encode()
test_receipt={'recorded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':'python -X utf8 deployment-packages/test_defold_v6_source_edit.py','exit_code':0,'tests':5,'result':'OK','reported_fixture_test_seconds':0.197,'scope':'Previously completed self-authored protobuf/crypto/archive/Wasm constructor fixtures only. No real game was instantiated or executed; this is not per-game conversion labor/token/cost.'}
files['support/isolated-fixture-tests.json']=json.dumps(test_receipt,indent=2).encode()
files['support/README.md']='''# Level Devil 原生服务边界候选，尚未交付

原任务job-ca75d464d2d7 / game-2a4704442ec3 / 草稿v-1f8b04b1ee19。本包不运行游戏，不启动模型，不解除暂停，不更改任务版本或待验收。

原145份LuaSource中15份服务边界改动、130份字节不变。803资源中788份解码字节不变；关卡/物理/碰撞/陷阱/角色/原本地存档保留。真实在线社区GET/上传POST、死代码管理PATCH、表单/统计、分享入口及对应输入分支退役，不填假关卡或服务器结果。原本地编辑创建/保存保留，原远程取消/失败路径继续返回不可用。未改原站点/许可/全局平台就绪变量。

原WASM构造器2356中PokiSdk注册void717原7实参调用换成7个drop；原table34绑定Lua模块注册4881，实际provider不再注册，原poki.exists自然看到nil，原HTML5分类自行成立。其余4420函数体字节不变。JS14个导入只剩异常守卫，185原引擎函数语义保持；无SDK对象、广告成功回调或旧本地领取弹框。格式验证通过。

Defold803资源均已重读/解码/核对修改后SHA；资源查找ID、原dmanifest/projectc与原校验/签名逻辑不改，未弱化完整性验证。新归档是否被真实引擎接受必须实测，不能靠结构检查推断。工具依据原归档v6及Defold官方resource_archive.cpp/resource_util.cpp的格式读取，不恢复作者完整工程。

5项自编隔离夹具已通过：可变长度protobuf保留未知字段、拒绝未审查字节码、XTEA尾块、混合压缩/加密资源重打包、仅移除指定构造注册且保留另一注册的真实夹具执行。仅夹具执行，不是运行真实游戏。静态单机源检查finding0、证据路径有效，但status仍pending/runtime_verified=false。

原5次界面额度已经耗尽，原记录只到首房间。此修订未启动；未测移动/跳跃/陷阱/通关/刷新和新归档加载。V5.1包含16维事实及边界，不借旧截图称本修订通过。独占处理耗时/Token/费用无可靠归属仍null。等待新的明确试玩额度前不启动，不入库，不供货。
'''.encode()
original_files=['LevelDevil.wasm','archive/game0.arci','archive/game0.arcd','archive/game1.arcd','archive/game2.arcd','archive/game0.dmanifest','archive/game0.projectc']
binding={n:hashlib.sha256((r/'original'/n).read_bytes()).hexdigest()for n in original_files};files['support/original-input-binding.json']=json.dumps(binding,indent=2).encode()
manifest={n:hashlib.sha256(data).hexdigest()for n,data in files.items()};raw=json.dumps(manifest,sort_keys=True,indent=2).encode();digest=hashlib.sha256(raw).hexdigest()
main='''from pathlib import Path
import sys,json,hashlib,zipfile,copy,datetime
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
from controlplane.offline_delivery import inspect
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-ca75d464d2d7'
with svc.store.read()as db:
 before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['version_id']=='v-1f8b04b1ee19'and before['status']in ['blocked','failed']and not before.get('manual_paused')
 version=svc.get(db,'versions',before['version_id']);original=svc.repo.artifacts/version['artifact_id']
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()==DIGEST;manifest=json.loads(raw)
 bindings=json.loads(z.read('support/original-input-binding.json'))
 for n,h in bindings.items():assert hashlib.sha256((original/n).read_bytes()).hexdigest()==h,n
 for n,h in manifest.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;npath=(stage/n).resolve();assert npath.is_relative_to(stage.resolve())
  if npath.exists():assert npath.read_bytes()==data,n
  else:npath.parent.mkdir(parents=True,exist_ok=True);write_bytes(npath,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
static=json.loads((stage/'support/static-audit.json').read_text(encoding='utf8'));audit=inspect(stage/'converted',{'passed':False,'environment':'local-artifact','actions':[]},static['offline_features'])
assert not audit['findings']and not audit.get('evidence_issues')and not audit['unreviewed_features']and audit['status']=='pending'and not audit['runtime_observed'],audit
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil新原生服务边界候选已同步，不重跑不入库。真实WASM构造器2356仅移除PokiSdk的void717/7实参注册（参数drop平衡），其他4420函数体不变；14个JS导入只保留异常守卫，无SDK对象/回调成功/旧本地领取框，185原引擎函数语义保持。145原Lua中15份退役在线社区/上传/分享/表单/统计及广告成功消费者，130份未改；803资源中788解码字节不变，原三章/物理/碰撞/陷阱/角色与本地编辑/保存保留，不造关卡或解锁。5项自编protobuf/归档/构造器夹具通过及WASM格式有效只为源码证明；新归档加载、移动/跳跃/结算/存档尚未实机。原5步已用尽，未加操作/未登记新授权，不启动原任务/模型/观察器，不解除暂停、不供货。候选与工具/证明位于temp/direct-leveldevil-native-retirement-20261117-v3，静态finding0但offline仍pending。'},None,idem='direct-leveldevil-native-source-20261117-'+DIGEST[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':str(stage),'manifest_sha256':DIGEST,'files':len(manifest),'candidate_files':sum(n.startswith('converted/')for n in manifest),'bound_original_input_files':len(bindings),'job_id':jid,'job_status':before['status'],'round':before['round'],'version_id':before['version_id'],'tasks_unchanged':True,'game_or_model_executed':False,'ui_steps_used':5,'ui_steps_remaining':0,'offline_source_findings':0,'offline_status':'pending','runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('DIGEST',repr(digest))
compile(main,'leveldevil-candidate-static-transfer','exec');target=b/'direct_leveldevil_candidate_transfer_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',raw)
 for n,data in files.items():z.writestr(n,data)
(b/'direct_leveldevil_candidate_remote_20261117.py').write_text(main,encoding='utf8')
print(json.dumps({'files':len(manifest),'candidate_files':45,'bytes':target.stat().st_size,'manifest_sha256':digest,'runtime_verified':False}))
