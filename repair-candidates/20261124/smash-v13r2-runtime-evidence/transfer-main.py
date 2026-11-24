from pathlib import Path
import sys,json,zipfile,hashlib,copy,datetime
sys.path.insert(0,'D:/GameLab/app')
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
r=Path('D:/GameLab/app');svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked' and not before.get('version_id') and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw)
assert (ledger['used'],ledger['remaining'])==(5,0)and ledger['game_tab_closed']
s=Path('D:/GameLab/temp/direct-smash-runtime-evidence-20261124');s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
 raw_manifest=z.read('MANIFEST.json');m=json.loads(raw_manifest)
 for n,h in m.items():
  raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h
  p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
 write_bytes(s/'MANIFEST.json',raw_manifest)
for n in ['requests.jsonl','browser-events.jsonl','server-ready.json']:
 original=(e/'observation-v13r2'/n).read_bytes();p=s/('original-'+n)
 if p.exists():assert p.read_bytes()==original
 else:write_bytes(p,original)
write_bytes(s/'actual-ui-ledger.json',ledger_raw)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v13r2已在52真实Chrome启动：候选219文件原SHA验证，原启动目录和local-gamedata-plan实际加载；仍蓝色Loading，无菜单/本地房间/赛车AI/核心玩法证明，不计待验收。HTTP回执确认两次页面导航，分别计第4和5步，累计5/5剩0；不复用旧剩2步。两文档seq重启，合并日志不能宣称单文档唯一完整。当前日志无旧Firebase匿名登录失败，但Unity遥测/newbadwords词表外联仍受离线CSP阻断，不能称SDK/档案已通过。只关闭本次验证页并停止专属观察任务，57602已无监听。完整原始日志和台账已归档temp/direct-smash-runtime-evidence-20261124；原任务/版本/暂停不改，不启动供货。独占耗时/Token/费用未知null。'},None,idem='direct-smash-runtime-v13r2-actual-evidence-20261124')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(s),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(m),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'observed_prior_game_executed':True,'ready_review':False,'ui_steps_used':5,'ui_steps_remaining':0,'evidence_sync_only':True}
write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
