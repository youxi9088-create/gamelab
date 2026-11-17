from pathlib import Path
import sys,json,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-26a474774bbc'
with svc.store.read()as db:
 before=copy.deepcopy(svc.get(db,'jobs',jid));version=copy.deepcopy(svc.get(db,'versions','v-0b998999b4ec'))
assert before['status']=='blocked'and before['version_id']=='v-0b998999b4ec'and not before.get('manual_paused')
assert before['candidate_id']=='game-65f5e541fc43'and version['candidate_id']==before['candidate_id']
original=r/'data/artifacts'/version['artifact_id']
sha=lambda raw:hashlib.sha256(raw).hexdigest()
with zipfile.ZipFile(sys.argv[0])as z:
 proof=json.loads(z.read('candidate/evidence/direct-repair/native-telemetry-v1-source-proof.json'))
 host=json.loads(z.read('historical-host-js-preservation.json'))
 assert sha((original/'archive/game0.arci').read_bytes())==proof['index_before_sha256']
 assert sha((original/'archive/game0.arcd').read_bytes())==proof['data_before_sha256']
 assert sha((original/'BackroomBill_wasm.js').read_bytes())==host['source_sha256']
 assert sha(z.read('candidate/BackroomBill_wasm.js'))==host['current_sha256']
 for name in ['BackroomBill.wasm','dmloader.js','archive/game0.dmanifest','archive/game0.projectc','archive/archive_files.json']:
  assert sha((original/name).read_bytes())==proof['retained_manifest'][name],name
 assert proof['unchanged_native_resources']==99 and not proof['resource_loaded_bypass_added']and proof['prior_ui_steps']==1 and proof['new_inputs']==0
 assert sha(z.read('candidate/archive/game0.arci'))==proof['index_after_sha256']and sha(z.read('candidate/archive/game0.arcd'))==proof['data_after_sha256']
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest);s=Path('D:/GameLab/temp/direct-backroom-telemetry-v1-20261118');s.mkdir(exist_ok=True)
 for n,h in manifest.items():
  raw=z.read(n);assert sha(raw)==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(s/'MANIFEST.json',raw_manifest)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'独立原生Lua遥测修订已保存temp/direct-backroom-telemetry-v1-20261118：仅第40资源sdk_manager的poki_send_beacon发送体移除，100资源重建逐项解析、99资源原压缩/加密载荷及内容不变，protobuf非源字段、资源查找标识/flags、原WASM/清单/工程配置保持。原71号控制器和resources_loaded挂载要求未改，不把pretutorial当完整游戏；当前6绑定run仍无resources_10.zip，未重发403请求。本轮0UI，旧1/5保留；未运行原生归档、兼容性与玩法未知，未安装/接续/入库。24份原Lua及改后单文件、V5.1、真实未知用量null与SHA证明随包保存；原宿主SDK/奖励修订的历史边界保留，不据本修订宣称全部离线/广告通过。'},None,idem='direct-backroom-telemetry-v1-prepared-20261118')
with svc.store.read()as db:
 assert svc.get(db,'jobs',jid)==before
 assert svc.get(db,'versions','v-0b998999b4ec')==version
assert sha((original/'archive/game0.arcd').read_bytes())==proof['data_before_sha256']
out={'complete':True,'stage':str(s),'files_verified':len(manifest),'manifest_sha256':sha(raw_manifest),'index_after_sha256':proof['index_after_sha256'],'data_after_sha256':proof['data_after_sha256'],'unchanged_native_resources':99,'changed_resource':40,'required_package_available':False,'prior_ui_steps':1,'new_inputs':0,'remaining_ui_steps':4,'job_unchanged':True,'version_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'runtime_archive_compatibility_verified':False,'ready_review':False,'job':{k:before.get(k)for k in ['id','version_id','status','round','manual_paused']}}
write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
