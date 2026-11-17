from pathlib import Path
import sys,json,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
s=Path('D:/GameLab/temp/direct-needle-remote-observation-20261118/final-evidence');s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
 manifest=json.loads(z.read('MANIFEST.json'))
 for n,h in manifest.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h
  p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-0d68b7f140bc'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and before['version_id']=='v-741373abfbde'and not before.get('manual_paused')
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'52真实Chrome复验原v2同SHA/134文件：用户单次追加5步此前3＋本轮2已全用完，余0。第4步原生开场，第5步trusted PLAY触发Canvas pointerlockchange locked=true进入草堆，旧IAB Resume阻断在52未复现。完整146条事件/2张真实截图/V5.1独立修订已同步temp/direct-needle-remote-observation-20261118/final-evidence。新发现7个原音频本地404、favicon两次404及观察器自身worker-src blob阻断，不能算离线通过；唯一原静态HTTPS补取403后停止余6项。挖取/针获取/结算/赚取存档仍未验证，不入库。退出页面并仅关闭本轮观察器10512/57588；真实独占耗时Token费用未知保留null。'},None,idem='direct-needle-remote-two-actual-20261118')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'files_verified':len(manifest),'used':5,'remaining':0,'tasks_unchanged':True,'admitted':False,'native_pointer_lock_observed':True}
write_bytes(s/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
