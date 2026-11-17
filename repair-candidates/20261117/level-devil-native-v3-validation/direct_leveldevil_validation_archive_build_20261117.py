from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';e=r/'validation-native-v3-20261117'
ledger=json.loads((r/'ui-ledger-native-v3-20261117.json').read_text(encoding='utf8'));assert ledger['steps_used']==10 and ledger['remaining']==0 and len(ledger['additional_steps'])==5 and all(x['status']=='attempted'for x in ledger['additional_steps'])
obs=json.loads((b/'direct-leveldevil-native-v3-runtime-observation-20261117.json').read_text(encoding='utf8'));assert obs['sequence_contiguous']and not obs['issues']and not obs['external_requests']and obs['response_statuses']=={'200':12}
status={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'job_id':r.name,'candidate_revision':ledger['revision'],'manifest_sha256':ledger['candidate_transfer_manifest_sha256'],'ui_steps_used':10,'remaining':0,'runtime_verified':False,'ready_review':False,'native_startup_observed':True,'native_first_room_observed':True,'movement_verified':False,'jump_verified':False,'completion_verified':False,'save_reload_verified':False,'task_changed':False,'status':'native_startup_and_first_room_observed_core_controls_pending','reason':'用户仅此修订新增5步已实际全部使用。启动成功、原生章节地图和首房间渲染已证明；短按/聚焦过程的失败尝试照实计入。最后一次原生门口拖动按下释放成功进入首房间。尚无移动、跳跃、胜负或刷新恢复证据，不入库待验收。','question_pending':'Only this v3 revision, optionally up to3 further actions for movement/jump/reload; no answer is not authorization.','accounting':{'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None}}
(r/'pending-native-v3-status-20261117.json').write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
files={p.name:p.read_bytes()for p in e.iterdir()if p.is_file()}
files.update({'ui-ledger.json':(r/'ui-ledger-native-v3-20261117.json').read_bytes(),'pending-status.json':(r/'pending-native-v3-status-20261117.json').read_bytes(),'runtime-observation.json':json.dumps(obs,ensure_ascii=False,indent=2).encode()})
for n in ['direct-leveldevil-additional-authorization-receipt-20261117.json','direct-leveldevil-observer-receipt-20261117.json','direct_leveldevil_step_ledger_20261117.py','direct_leveldevil_additional_authorization_remote_20261117.py','direct_leveldevil_observation_server_native_v3_20261117.py','direct_leveldevil_runtime_read_20261117.py','direct_leveldevil_authorization_bytes_fix_20261117.py']:files['support/'+n]=(b/n).read_bytes()
files['README.md']='''# Level Devil 原生修订实机补充证据，尚未待验收

仅绑定work-native-retirement-20261117-v3与原45文件清单88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08，不覆盖原静态候选和旧运行历史。

用户call_gkZRy3lYXlVRC4SM8XDEmTiB明确“仅此修订额外最多5步”。原5步保留，新增5步实际尝试完，累计10/剩0。新增第1步加载新原生包并显示章节地图；第2步点击入口未进入，第3/4步标准屏幕键盘空格尝试未进入；第5步原门口一次连续鼠标按下/释放实际进入首房间，角色/出口/原关卡进度显示。失败动作计入，不以窗口准备或输入故障重置额度。移动、跳跃、陷阱、结算、刷新恢复和全关卡均未实机通过。

只读观察13连续事件，12项真实资源全部同源200，无记录脚本异常/外部请求，实际原生新归档已被引擎接受。但初始化不是核心玩法闭环，因此runtime_verified与ready_review仍false。当前原任务failed/round6/v-1f8b04b1ee19保留，不直接改状态、不启动模型、不供货。

无游戏的自编键盘诊断只监听方向/空格，普通Sky方向键3.3ms，52预装屏幕键盘拖动24.8/28.3ms。这些是工具输入事实，不证明真实游戏漏键的唯一原因；焦点、原生按下/释放和引擎帧采样仍需继续定位。没有调用游戏函数、注入玩家输入或绕开平台/许可。原45候选文件SHA未变。

授权登记最初因本机CRLF字节与生成脚本LF字节不一致，在首次断言处失败、未写远端；修正为实际原授权字节后一次正常登记，原授权文本/SHA不改。源码/自编工具未知独占耗时、Token、费用仍null，未伪造零成本。
'''.encode()
manifest={n:hashlib.sha256(v).hexdigest()for n,v in files.items()};raw=json.dumps(manifest,sort_keys=True,indent=2).encode();digest=hashlib.sha256(raw).hexdigest()
main='''from pathlib import Path
import sys,json,hashlib,zipfile,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
base=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3');stage=base/'additional-five-evidence-20261117'
original=json.loads((base/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in original.items():assert hashlib.sha256((base/n).read_bytes()).hexdigest()==h,n
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
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil原生v3用户追加5步已完成，累计10/剩0。新归档实际被Defold接受，章节地图正常；前3次入口短按/焦点尝试未进入并照实计数，最后第5步原门口连续鼠标按下释放进入原生首房间，角色/出口/进度显示。13连续观察事件、12项同源资源200、无记录脚本异常/外部请求，45候选源码SHA保持。仍未验证移动/跳跃/结算/刷新，runtime_verified及ready_review均false，不入库、不修改任务/版本预算、不启动模型/供货。独立追加证据及完整动作账本已落盘；不能把初始化当核心闭环。'},None,idem='direct-leveldevil-native-v3-five-evidence-20261117-'+DIGEST[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'manifest_sha256':DIGEST,'files':len(m),'candidate_files_verified':45,'task_unchanged':True,'ui_steps_used':10,'remaining':0,'native_startup_observed':True,'native_first_room_observed':True,'runtime_verified':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('DIGEST',repr(digest))
compile(main,'leveldevil-actual-five-evidence','exec');target=b/'direct_leveldevil_additional_five_evidence_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',raw)
 for n,v in files.items():z.writestr(n,v)
print(json.dumps({'files':len(files),'bytes':target.stat().st_size,'manifest_sha256':digest}))
