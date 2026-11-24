from pathlib import Path
import json,sys,subprocess
sys.path.insert(0,'D:/GameLab/app')
from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
p=e/'ui-ledger.json';d=json.loads(p.read_bytes());assert (d['used'],d['remaining'])==(5,0)
d.update(game_tab_closed=True)
for step in d['steps'][-2:]:
 step['outcome']='Actual52 blue Loading screen; original startup catalogs and local-gamedata-plan loaded. No native menu, room, AI, or core gameplay verified. Unity telemetry/newbadwords external requests blocked. Closed only this Chrome game tab.'
write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode())
ps="""$ErrorActionPreference='Stop'
$name='GameLabDirectSmashNativeObserveV13R220261118'
$t=Get-ScheduledTask -TaskName $name
if($t.Actions[0].Arguments -notlike '*direct-smash-auth-consumers-v13r2-20261118*native-observation-v13r2*57602*'){throw 'identity mismatch'}
if($t.State -eq 'Running'){Stop-ScheduledTask -TaskName $name}
@{task_state=[string](Get-ScheduledTask -TaskName $name).State;listeners=@(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue).Count}|ConvertTo-Json -Compress
"""
r=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,timeout=25)
assert r.returncode==0,r.stderr
print(json.dumps({'ui_steps_used':5,'ui_steps_remaining':0,'tab_closed':True,'ready_review':False,'cleanup':json.loads(r.stdout)}))
