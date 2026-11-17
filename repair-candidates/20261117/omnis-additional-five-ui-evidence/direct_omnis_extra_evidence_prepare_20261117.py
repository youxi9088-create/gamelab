"""Archive the five additional real GUI attempts without asserting delivery."""
from pathlib import Path
import json, hashlib, datetime, zipfile

b=Path(__file__).parent;r=b/'direct-games/job-e7d352b1a2b1'
folder=r/'validation-extra-resumed-20261117'
ledger=json.loads((r/'ui-ledger.json').read_text(encoding='utf8'))
assert ledger['steps_used']==10 and ledger['remaining']==0 and ledger['max_steps']==10
observed=json.loads((b/'direct-omnis-extra-resumed-runtime-observation-20261117.json').read_text(encoding='utf8'))
if 'stdout' in observed:assert observed['exit_code']==0;observed=json.loads(observed['stdout'])
assert observed['sequence_contiguous'] and not observed['issues']
assert observed['event_count']==60 and observed['response_statuses']=={'200':58,'404':1}
assert all(x['url'].startswith('http://127.0.0.1:57584/')for x in observed['events']if x['type']=='resource')
assert all(x['url'].endswith('/favicon.ico') for x in observed['events']if x['type']=='resource'and x.get('responseStatus')==404)
status={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'job_id':r.name,'base_version_id':'v-4f40af6a7dd7',
 'status':'deferred_native_turn_handoff_unverified_additional_five_steps_exhausted','ui_steps_used':10,'ui_steps_remaining':0,
 'additional_steps':ledger['steps'][5:],'runtime_verified':False,'ready_review':False,'remote_task_changed':False,
 'reason':'用户仅此修订追加5步，原5步保留。额外5步为原包启动、AI模拟、确认默认设置、原Algorithmic阵营、一次意图点击PASS & END TURN。第1回合及原卡牌/原收入/3AI阵营正常显示，但最后输入后仍为ROUND1/CHOOSE YOUR ACTION，资金13；只读控制台未看到End Turn处理器入口日志。点击命中与AI交接尚未证明，不能据此断言AI逻辑故障，不再点击或重置步数，不提交待验收。当前原生对局保留。',
 'observation':{'events':60,'resources':59,'local_resources_200':58,'browser_favicon_404':1,'sequence_contiguous':True,'issues':[]},
 'pending_user_question':'是否仅追加1步，直接在当前保留的第1回合点击PASS & END TURN；未答复前不得执行。',
 'accounting':{'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None}}
(r/'pending-direct-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding='utf8')
files={p.name:p.read_bytes()for p in folder.iterdir()if p.is_file()}
files.update({'ui-ledger.json':(r/'ui-ledger.json').read_bytes(),'pending-direct-status.json':(r/'pending-direct-status.json').read_bytes(),
 'runtime-observation.json':json.dumps(observed,ensure_ascii=False,indent=2).encode(),
 'observer-receipt.json':(b/'direct-omnis-extra-resumed-observer-receipt-20261117.json').read_bytes(),
 'source-observer-setup.py':(b/'direct_omnis_extra_resumed_observer_20261117.py').read_bytes(),
 'README.md':('''# OMNIS 本修订追加五步实机证据

原五步不重置，用户追加五步均已记录，累计10/剩0。原候选220文件未变，原任务/版本/预算未变，不入库不供货。
额外第1至4步重入原本地AI模拟并显示第1回合、原手牌、收入3与资金13、3AI对手。第5步意图点击PASS & END TURN后仍停在第1回合；只读控制台没有看到原End Turn日志，未证明输入到达处理器或AI轮转，不能直接宣称是AI算法故障。截图、完整连续60观察事件均保留；58项本地资源200，浏览器默认favicon404，未记录脚本异常或外联。
只读控制台诊断没有输入代码或调用游戏函数。远程桌面的视口调整和浏览器准备单独区分；没有在额度用完后追加玩家输入。当前对局保留，正等待仅追加1步的用户答复，不能以等待期满当授权。
原材料齐全和界面初始化不等于核心闭环通过。攻击/竞价/AI交接/胜负/刷新继续均未实证，runtime_verified/ready_review均false。逐款独占处理耗时/Token/费用无可归属证据仍null。
''').encode()})
manifest={n:hashlib.sha256(data).hexdigest()for n,data in files.items()}
manifest_raw=json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2).encode();digest=hashlib.sha256(manifest_raw).hexdigest()
main='''from pathlib import Path
import sys,json,hashlib,zipfile,copy
with zipfile.ZipFile(sys.argv[0]) as z:
 m=z.read('MANIFEST.json');assert hashlib.sha256(m).hexdigest()==__DIGEST__;manifest=json.loads(m)
 for n,h in manifest.items():assert hashlib.sha256(z.read(n)).hexdigest()==h,n
 if '--verify-only' in sys.argv:
  print(json.dumps({'verified':True,'files':len(manifest)}));raise SystemExit(0)
 root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
 from controlplane.service import Service
 from controlplane.store import ACTOR
 from controlplane.atomic_files import write_bytes
 base=Path('D:/GameLab/temp/direct-omnis-local-20261116-v1');source=base/'converted'
 original=json.loads((source/'MANIFEST.json').read_text(encoding='utf8'));assert len(original)==220
 for n,h in original.items():assert hashlib.sha256((source/n).read_bytes()).hexdigest()==h,n
 stage=base/'additional-five-evidence-20261117-v1';stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());data=z.read(n)
  if p.exists():assert p.read_bytes()==data,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MANIFEST.json'
 if p.exists():assert p.read_bytes()==m
 else:write_bytes(p,m)
 for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
 svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-e7d352b1a2b1'
 with svc.store.read()as db:
  before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked' and before['version_id']=='v-4f40af6a7dd7' and not before.get('manual_paused')
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'OMNIS用户追加5步实机已记录，原5步保留，累计10/剩0。原本地AI模式、默认设置、Algorithmic阵营及原首回合资金13/收入3/3AI/手牌正常显示。最后一次意图点击PASS & END TURN后仍ROUND1，未见控制台原End Turn入口日志；尚未证明点击进入处理器或AI交接，不据此虚称AI算法故障或验收通过。连续60事件、59项本地资源（58项200和浏览器默认favicon404），无记录的脚本异常或外联。220原候选逐SHA仍一致，独立追加证据已落盘，原任务/版本/预算不变；不入库不供货，当前对局保留，等待用户仅追加1步的答复。'},None,idem='direct-omnis-extra-five-evidence-20261117-'+__DIGEST__[:12])
 with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'files':len(manifest),'original_candidate_files_verified':220,'manifest_sha256':__DIGEST__,'task_unchanged':True,'ui_steps_used':10,'remaining':0,'runtime_verified':False,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('__DIGEST__',repr(digest))
compile(main,'omnis-extra-evidence-transfer','exec')
target=b/'direct_omnis_extra_evidence_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest_raw)
 for n,data in files.items():z.writestr(n,data)
print(json.dumps({'files':len(files),'bytes':target.stat().st_size,'manifest_sha256':digest,'runtime_verified':False}))
