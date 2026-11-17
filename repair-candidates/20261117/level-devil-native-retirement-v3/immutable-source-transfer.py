from pathlib import Path
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
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()=='88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08';manifest=json.loads(raw)
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
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil新原生服务边界候选已同步，不重跑不入库。真实WASM构造器2356仅移除PokiSdk的void717/7实参注册（参数drop平衡），其他4420函数体不变；14个JS导入只保留异常守卫，无SDK对象/回调成功/旧本地领取框，185原引擎函数语义保持。145原Lua中15份退役在线社区/上传/分享/表单/统计及广告成功消费者，130份未改；803资源中788解码字节不变，原三章/物理/碰撞/陷阱/角色与本地编辑/保存保留，不造关卡或解锁。5项自编protobuf/归档/构造器夹具通过及WASM格式有效只为源码证明；新归档加载、移动/跳跃/结算/存档尚未实机。原5步已用尽，未加操作/未登记新授权，不启动原任务/模型/观察器，不解除暂停、不供货。候选与工具/证明位于temp/direct-leveldevil-native-retirement-20261117-v3，静态finding0但offline仍pending。'},None,idem='direct-leveldevil-native-source-20261117-'+'88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08'[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':str(stage),'manifest_sha256':'88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08','files':len(manifest),'candidate_files':sum(n.startswith('converted/')for n in manifest),'bound_original_input_files':len(bindings),'job_id':jid,'job_status':before['status'],'round':before['round'],'version_id':before['version_id'],'tasks_unchanged':True,'game_or_model_executed':False,'ui_steps_used':5,'ui_steps_remaining':0,'offline_source_findings':0,'offline_status':'pending','runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
