from pathlib import Path
import json,zipfile,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';sha=lambda v:hashlib.sha256(v).hexdigest()
grant={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'question_id':'call_wSZGsg9XFibg19ygMU7W5GIJ','user_answer':'仅v4额外最多5步','job_id':r.name,'revision':'work-native-retirement-20261117-v4','manifest_sha256':'9556d187fe71577181c81ed250cd857e88cd01c80fd1810b01287011faa38027','preserved_prior_actual_steps':13,'additional_max_steps':5,'max_steps':18,'scope':'仅v4启动、原地图入口、刷新推广退役和原生控制；失败尝试照实计入，不重置旧13步，不授权其他游戏或自动模型执行。'}
old=(r/'ui-ledger-native-v3-20261117.json').read_bytes();prior=json.loads(old);assert prior['steps_used']==13 and prior['remaining']==0 and all(x['status']=='attempted'for x in prior['additional_steps'])
grant['preserved_v3_ledger_sha256']=sha(old)
auth=json.dumps(grant,ensure_ascii=False,indent=2).encode();ledger={**grant,'steps_used':13,'additional_steps_used':0,'remaining':5,'steps':[]}
for n,raw in [('v4-additional-five-authorization-20261117.json',auth),('ui-ledger-native-v4-20261117.json',json.dumps(ledger,ensure_ascii=False,indent=2).encode())]:
 p=r/n;assert not p.exists();p.write_bytes(raw)
server=(b/'direct_leveldevil_observation_server_native_v3_20261117.py').read_bytes().replace(b"(('127.0.0.1',57586)",b"(('127.0.0.1',57587)")
assert b"(('127.0.0.1',57587)"in server;compile(server,'v4-read-only-observer','exec')
main='''from pathlib import Path
import sys,json,hashlib,zipfile,subprocess,urllib.request,time,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4');e=stage/'validation-v4-20261117';e.mkdir(exist_ok=True)
for n,h in json.loads((stage/'MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
assert hashlib.sha256(Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3/ui-ledger-native-v3-20261117.json').read_bytes()).hexdigest()==PRIOR
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-ca75d464d2d7'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='failed'and before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')
with zipfile.ZipFile(sys.argv[0])as z:
 for n in ['v4-additional-five-authorization-20261117.json','ui-ledger-native-v4-20261117.json','observation_server_native_v4_20261117.py']:
  raw=z.read(n);p=stage/n
  if p.exists():assert p.read_bytes()==raw
  else:write_bytes(p,raw)
name='GameLabDirectLevelDevilNativeV4Observe20261117';ready=e/'server-ready.json';op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
if ready.exists():
 state=json.loads(ready.read_text(encoding='utf8'))
 assert state['port']==57587 and Path(state['root'])==stage/'converted'
 with op.open(state['url'],timeout=3)as res:assert res.status==200 and b'Game not started'in res.read()
else:
 code=r"""$ErrorActionPreference='Stop'
$name='GameLabDirectLevelDevilNativeV4Observe20261117'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Existing task: inspect original receipt and PID, do not restart'}
if(Get-NetTCPConnection -LocalPort 57587 -State Listen -ErrorAction SilentlyContinue){throw 'Port occupied'}
$action=New-ScheduledTaskAction -Execute 'D:\GameLab\runtime\python\python.exe' -Argument '-X utf8 D:\GameLab\temp\direct-leveldevil-native-retirement-20261117-v4\observation_server_native_v4_20261117.py D:\GameLab\temp\direct-leveldevil-native-retirement-20261117-v4\converted D:\GameLab\temp\direct-leveldevil-native-retirement-20261117-v4\validation-v4-20261117' -WorkingDirectory 'D:\GameLab\temp\direct-leveldevil-native-retirement-20261117-v4'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings|Out-Null
Start-ScheduledTask -TaskName $name
"""
 res=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=25);assert res.returncode==0,res.stderr
 for _ in range(40):
  if ready.exists():break
  time.sleep(.2)
 assert ready.exists(),'Inspect original scheduled task before retry';state=json.loads(ready.read_text(encoding='utf8'))
 with op.open(state['url'],timeout=3)as res:assert res.status==200 and b'Game not started'in res.read()
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'用户明确仅v4额外最多5步，call_wSZGsg9XFibg19ygMU7W5GIJ；旧累计13步全部保留，新累计上限18。v4原61文件逐SHA重验；新隔离只读观察器已准备，localhost57587绑定v4实际目录，尚未启动游戏。将按逐步预约/实际结果登记，不重置失败操作，不启动模型、不供货、不改任务版本预算或暂停。'},None,idem='direct-leveldevil-v4-extra-five-authorization-20261117')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'server':state,'task_name':name,'candidate_files_verified':47,'files_verified':61,'preserved_prior_actual_steps':13,'additional_used':0,'remaining':5,'game_started':False,'task_unchanged':True}
write_bytes(e/'observer-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('PRIOR',repr(sha(old)))
compile(main,'v4-observer-prepare','exec');target=b/'direct_leveldevil_v4_authorized_observer_20261117.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('v4-additional-five-authorization-20261117.json',auth);z.writestr('ui-ledger-native-v4-20261117.json',json.dumps(ledger,ensure_ascii=False,indent=2).encode());z.writestr('observation_server_native_v4_20261117.py',server)
(b/'direct_leveldevil_observation_server_native_v4_20261117.py').write_bytes(server)
print(json.dumps({'prepared':True,'path':str(target),'additional_steps':5,'prior_steps':13}))
