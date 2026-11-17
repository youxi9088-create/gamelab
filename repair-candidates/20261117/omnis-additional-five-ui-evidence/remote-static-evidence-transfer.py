from pathlib import Path
import sys,json,hashlib,zipfile,copy
with zipfile.ZipFile(sys.argv[0]) as z:
 m=z.read('MANIFEST.json');assert hashlib.sha256(m).hexdigest()=='617cc55c7e0f6a9de3eaf9b522fc40618ea4579575fc6e9ecb2aee71a8cb296c';manifest=json.loads(m)
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
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'OMNIS用户追加5步实机已记录，原5步保留，累计10/剩0。原本地AI模式、默认设置、Algorithmic阵营及原首回合资金13/收入3/3AI/手牌正常显示。最后一次意图点击PASS & END TURN后仍ROUND1，未见控制台原End Turn入口日志；尚未证明点击进入处理器或AI交接，不据此虚称AI算法故障或验收通过。连续60事件、59项本地资源（58项200和浏览器默认favicon404），无记录的脚本异常或外联。220原候选逐SHA仍一致，独立追加证据已落盘，原任务/版本/预算不变；不入库不供货，当前对局保留，等待用户仅追加1步的答复。'},None,idem='direct-omnis-extra-five-evidence-20261117-'+'617cc55c7e0f6a9de3eaf9b522fc40618ea4579575fc6e9ecb2aee71a8cb296c'[:12])
 with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'files':len(manifest),'original_candidate_files_verified':220,'manifest_sha256':'617cc55c7e0f6a9de3eaf9b522fc40618ea4579575fc6e9ecb2aee71a8cb296c','task_unchanged':True,'ui_steps_used':10,'remaining':0,'runtime_verified':False,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
