"""Recover only the proved-dead SSH child observer, preserving its receipt and UI budget."""
from pathlib import Path
import json,subprocess,urllib.request,time,hashlib,datetime,sys
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
s=Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118');e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
old=json.loads((e/'server-ready.json').read_bytes());assert old['pid']==35408 and old['port']==57602
ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==0 and ledger['remaining']==5 and not ledger['steps']
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
try:
    with op.open(old['url'],timeout=3)as response:raise AssertionError('Original server answered; inspect it instead of registering another.')
except urllib.error.URLError as ex:failure=str(ex)
ps=r'''$ErrorActionPreference='Stop'
$old=Get-Process -Id 35408 -ErrorAction SilentlyContinue
if($old){throw 'Original PID still exists; inspect actual process identity'}
if(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue){throw 'Port occupied'}
$name='GameLabDirectSmashNativeObserve20261118'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Existing scheduled observation; inspect original task'}
$action=New-ScheduledTaskAction -Execute 'D:\GameLab\runtime\python\python.exe' -Argument '-X utf8 D:\GameLab\temp\direct-smash-startup-settings-v2-20261118\native-observation-v2\observation_server.py D:\GameLab\temp\direct-smash-startup-settings-v2-20261118\candidate D:\GameLab\temp\direct-smash-resources-localized-v1-20261118\validation-resources-v1-20261118 57602' -WorkingDirectory 'D:\GameLab\temp\direct-smash-startup-settings-v2-20261118'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 12) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings|Out-Null
Start-ScheduledTask -TaskName $name
Get-ScheduledTaskInfo -TaskName $name|ConvertTo-Json -Compress
'''
backup=e/'server-ready-ssh-child-exited-35408.json';raw=(e/'server-ready.json').read_bytes()
if backup.exists():assert backup.read_bytes()==raw
else:write_bytes(backup,raw)
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=30);assert res.returncode==0,res.stderr
state=None
for _ in range(50):
    value=json.loads((e/'server-ready.json').read_bytes())
    if value['pid']!=35408:
        try:
            with op.open(value['url'],timeout=2)as response:
                if response.status==200 and b'Game not started' in response.read():state=value;break
        except OSError:pass
    time.sleep(.2)
assert state is not None,'Inspect scheduled task and exact PID; do not repeat registration.'
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,previous_pid=35408,previous_process_absent_verified=True,previous_diagnostic_error=failure,previous_receipt_preserved=str(backup),task_name='GameLabDirectSmashNativeObserve20261118',server=state,task_info=json.loads(res.stdout),server_diagnostic_http=200,game_executed=False,ui_steps_used=0,ui_steps_remaining=5,candidate_unchanged=True)
write_bytes(e/'persistent-launch-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
