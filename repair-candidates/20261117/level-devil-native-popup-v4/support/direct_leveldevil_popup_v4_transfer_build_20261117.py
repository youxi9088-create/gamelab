from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';src=r/'work-native-retirement-20261117-v4'
files={'converted/'+p.relative_to(src).as_posix():p.read_bytes()for p in src.rglob('*')if p.is_file()}
for n in ['native-retirement-v4-static-audit-20261117.json','native-retirement-v4-manifest-20261117.json','ui-ledger-native-v3-20261117.json','extra-three-authorization-20261117.json']:files['support/'+n]=(r/n).read_bytes()
for p in (r/'validation-native-v3-20261117').glob('revision-step1[123]-*.png'):files['parent-v3-observations/'+p.name]=p.read_bytes()
for n in ['direct_leveldevil_popup_v4_prepare_20261117.py','direct_leveldevil_popup_v4_transfer_build_20261117.py','defold_v6_source_edit.py','direct_leveldevil_runtime_thirteen_read_20261117.py','direct-leveldevil-native-v3-runtime-thirteen-summary-20261117.json']:files['support/'+n]=(b/n).read_bytes()
files['README.md']='''# Level Devil v3 三步结果及 v4 原生推广退役修订

用户明确追加3步，仅绑定v3。原累计10步保留，第11预约曾被桌面访问拒绝而未发送，现仅执行该同一预约：单次原生右方向键未观察到确定水平位移；第12次原生上键即时角色姿态和离地约8px，随后站立，不把两帧当完整跳跃/通关；第13次浏览器刷新重新进入章节地图，实际出现 New levels to cry over / New player-created levels just dropped 在线社区推广。累计13/13已用尽，不能重置或用旧授权运行v4。

v4只修本次明确复现的退役遗漏：原Lua79 popups函数仍会在非首次启动时延时显示INFINITEMODE，Lua244 YES仍调用在线无限关卡服务。本次删除该延时推广分支，保留原最后的延时acquire_input_focus；YES走原取消close_popup，不造关卡、成功响应或保存数据。相对v3仅79/244两份资源解码字节改变/801不变，WASM/JS/入口完全不变；相对原版16份服务Lua修改、129份Lua/787资源不变，原dmanifest/projectc和完整性逻辑保留。

47个候选文件已构建，803资源重读和16个修改Lua语法检查通过，静态离线检查finding0，但runtime_verified=false/ready_review=false。V5.1十六维文档按实际新旧边界填写，不能借父v3截图称v4通过。水平移动、出口结算和已取得进度恢复仍未确认。本包不启动游戏、模型、任务、观察器、供货，不改原任务状态/版本/预算/暂停。独占耗时、Token和价格未知仍null。
'''.encode()
m={n:hashlib.sha256(v).hexdigest()for n,v in files.items()};raw=json.dumps(m,sort_keys=True,indent=2).encode();digest=hashlib.sha256(raw).hexdigest()
main='''from pathlib import Path
import sys,json,hashlib,zipfile,copy,datetime
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
from controlplane.offline_delivery import inspect
parent=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3')
for n,h in json.loads((parent/'MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((parent/n).read_bytes()).hexdigest()==h,n
ledger=json.loads((parent/'ui-ledger-native-v3-20261117.json').read_text(encoding='utf8'));assert ledger['steps_used']==13 and ledger['remaining']==0 and all(x['status']=='attempted'for x in ledger['additional_steps'])
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4')
with zipfile.ZipFile(sys.argv[0])as z:
 raw=z.read('MANIFEST.json');assert hashlib.sha256(raw).hexdigest()==DIGEST;m=json.loads(raw)
 for n,h in m.items():
  data=z.read(n);assert hashlib.sha256(data).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==data,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==raw
 else:write_bytes(p,raw)
for n,h in m.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
review=json.loads((stage/'support/native-retirement-v4-static-audit-20261117.json').read_text(encoding='utf8'))['offline_features']
audit=inspect(stage/'converted',{'passed':False,'environment':'local-artifact','actions':[]},review)
assert not audit['findings']and not audit.get('evidence_issues')and not audit['unreviewed_features']and audit['status']=='pending',audit
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Level Devil原生v3追加3步已实际完成，累计13/13：右移未确认，上键即时姿态/短暂离地响应后落地，刷新进入原生地图但出现在线玩家关卡推广，故未入库。已依据真实失败准备v4，删除原Lua79延时INFINITEMODE调度及Lua244的YES在线消费者，保留原取消和地图延时焦点恢复；不改进度/解锁/物理/关卡。v3→v4仅两资源解码改变、801不变，WASM/JS/入口不变；47候选文件和补充证据逐SHA确认，V5.1已补。静态finding0而runtime/ready_review仍false。当前没有新试玩额度，不运行v4/模型/观察器，不更改任务版本/预算/暂停，不供货。'},None,idem='direct-leveldevil-native-v4-popup-retirement-'+DIGEST[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stage':str(stage),'manifest_sha256':DIGEST,'files':len(m),'candidate_files':sum(n.startswith('converted/')for n in m),'parent_v3_files_verified':62,'task_unchanged':True,'status':before['status'],'version_id':before['version_id'],'round':before['round'],'ui_steps_used':13,'remaining':0,'changed_parent_resources':[79,244],'static_findings':0,'game_executed':False,'ready_review':False}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('DIGEST',repr(digest))
compile(main,'leveldevil-v4-transfer','exec');target=b/'direct_leveldevil_popup_v4_transfer_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',raw)
 for n,v in files.items():z.writestr(n,v)
print(json.dumps({'path':str(target),'files':len(m),'candidate_files':47,'bytes':target.stat().st_size,'manifest_sha256':digest}))
