"""Prepare an immutable remote-only observer, preserving the original 3/5 ledger."""
from pathlib import Path
import json, zipfile, hashlib

b = Path(__file__).parent
source = (b/'direct_leveldevil_observation_server_native_v4_20261117.py').read_text(encoding='utf8')
source = source.replace('57587', '57588').replace('Level Devil isolated verification', 'Find the Needle isolated verification')
start = source.index("  if self.path=='/__diagnostic':")
end = source.index("  if self.path=='/__observe.js':", start)
source = source[:start] + '''  if self.path=='/__diagnostic':return self.reply(b'<!doctype html><title>Find the Needle remote verification</title><h1>Remote-only diagnostic</h1><p>Game not started.</p><a href="/index.html">Open original candidate</a>','text/html; charset=utf-8')
''' + source[end:]
marker = "send({type:'observer_started'"
extra = """function state(type,e){send({type,locked:!!document.pointerLockElement,lockTarget:document.pointerLockElement?.tagName||null,focused:document.hasFocus(),visibility:document.visibilityState,active:navigator.userActivation?.isActive??null,trusted:e?.isTrusted??null,key:e?.code??null,target:e?.target?.tagName??null,text:e?.target?.tagName==='BUTTON'?e.target.textContent.slice(0,100):null})}for(const type of ['pointerlockchange','pointerlockerror','visibilitychange'])document.addEventListener(type,e=>state(type,e));for(const type of ['focus','blur','pageshow','pagehide'])addEventListener(type,e=>state(type,e));for(const type of ['pointerdown','pointerup','click','keydown','keyup'])addEventListener(type,e=>state(type,e),true);"""
assert source.count(marker) == 1
source = source.replace(marker, extra + marker)
compile(source, 'needle-observer', 'exec')
main = r'''from pathlib import Path
import sys,json,hashlib,zipfile,subprocess,urllib.request,time,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.service import Service
from controlplane.atomic_files import write_bytes
original=Path('D:/GameLab/temp/direct-needle-local-boundaries-20261114-v2')
manifest=json.loads((original/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in manifest.items():assert hashlib.sha256((original/n).read_bytes()).hexdigest()==h,n
old=Path('D:/GameLab/temp/direct-needle-ui-v2-evidence-20261114/ui-validation-v2-ledger.json').read_bytes()
assert hashlib.sha256(old).hexdigest()=='93e7da67a40eb521cd1c1f9ce26a8a869bf023d58699f703db352a63d8eb7c89'
ledger=json.loads(old);assert ledger['ui_steps_used']==3 and ledger['ui_steps_remaining']==2
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:j=svc.get(db,'jobs','job-0d68b7f140bc')
assert j['status']=='blocked'and j['version_id']=='v-741373abfbde'and not j.get('manual_paused')
stage=Path('D:/GameLab/temp/direct-needle-remote-observation-20261118');stage.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:raw=z.read('observer.py')
p=stage/'observer.py'
if p.exists():assert p.read_bytes()==raw
else:write_bytes(p,raw)
p=stage/'continued-ledger.json'
initial={'job_id':j['id'],'revision':ledger['revision'],'authorization_question':ledger['question_id'],'original_ledger_sha256':hashlib.sha256(old).hexdigest(),'preserved_prior_steps':3,'maximum_authorized':5,'ui_steps_used':3,'remaining':2,'historical_cumulative_steps':None,'steps':[]}
if not p.exists():write_bytes(p,json.dumps(initial,ensure_ascii=False,indent=2).encode())
else:
 current=json.loads(p.read_text(encoding='utf8'));assert current['original_ledger_sha256']==initial['original_ledger_sha256'] and current['ui_steps_used']==3
e=stage/'observation';e.mkdir(exist_ok=True)
name='GameLabDirectNeedleRemoteObserve20261118';ready=e/'server-ready.json'
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
if ready.exists():
 state=json.loads(ready.read_text(encoding='utf8'))
 assert state['port']==57588 and Path(state['root'])==original/'candidate'
 with op.open(state['url'],timeout=3)as res:assert res.status==200 and b'Game not started.'in res.read()
else:
 code=r"""$ErrorActionPreference='Stop'
$name='GameLabDirectNeedleRemoteObserve20261118'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Inspect existing task; no restart'}
if(Get-NetTCPConnection -LocalPort 57588 -State Listen -ErrorAction SilentlyContinue){throw 'Port occupied'}
$action=New-ScheduledTaskAction -Execute 'D:\GameLab\runtime\python\python.exe' -Argument '-X utf8 D:\GameLab\temp\direct-needle-remote-observation-20261118\observer.py D:\GameLab\temp\direct-needle-local-boundaries-20261114-v2\candidate D:\GameLab\temp\direct-needle-remote-observation-20261118\observation' -WorkingDirectory 'D:\GameLab\temp\direct-needle-remote-observation-20261118'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings|Out-Null
Start-ScheduledTask -TaskName $name
"""
 res=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=25);assert res.returncode==0,res.stderr
 for _ in range(40):
  if ready.exists():break
  time.sleep(.2)
 assert ready.exists(),'Inspect original task before retry'
 state=json.loads(ready.read_text(encoding='utf8'))
 with op.open(state['url'],timeout=3)as res:assert res.status==200 and b'Game not started.'in res.read()
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'server':state,'task_name':name,'candidate_files_verified':len(manifest),'preserved_prior_steps':3,'remaining':2,'game_started':False,'task_unchanged':True}
write_bytes(stage/'observer-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''
compile(main, 'needle-observer-prepare', 'exec')
out = b/'direct_needle_remote_observer_20261118.pyz'
assert not out.exists()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main)
 z.writestr('observer.py',source)
(b/'direct_needle_remote_observer_20261118.py').write_text(source,encoding='utf8')
print(json.dumps({'prepared':str(out),'observer_sha256':hashlib.sha256(source.encode()).hexdigest(),'game_started':False}))
