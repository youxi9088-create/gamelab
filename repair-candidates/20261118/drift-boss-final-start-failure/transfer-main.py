from pathlib import Path
import sys,json,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
stage=Path('D:/GameLab/temp/direct-drift-last-action-20261118')
old=json.loads((stage/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in old.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
s=stage/'final-evidence';s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
 raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-1d7463d069d5'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('manual_paused')
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'保留历史4步，第5步在52真实Chrome导航同SHA44文件候选后仍到about:blank；6条连续被动事件含game.js/css加载及早期pagehide/hidden，未出现原生菜单或玩法。不能再只归因IAB/CDP；具体代码仍未知。零记录异常/外联不当作离线通过。静态JJencode仅147字节冻结window.dba提示辅助函数，不含导航，不调用原函数、不删除保护代码；导航语法扫描有动态范围局限。5步全用完、余0，不继续输入或入库。52 final-evidence保存真实截图/台账/V5.1独立16维/完整短观察；原44运行和48支持文件SHA保持。最初观察任务路径生成错误且实际2147942402终态未启动，v2仅修路径及被动观察，PID22072/57589已独立清理。未知独占耗时Token费用null。'},None,idem='direct-drift-last-actual-step-20261118')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'files_verified':len(manifest),'original_support_files_verified':len(old),'candidate_files_verified':44,'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'used':5,'remaining':0,'task_unchanged':True,'runtime_verified':False,'ready_review':False};write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
