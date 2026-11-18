from pathlib import Path
import json,sys,datetime,subprocess,copy,hashlib,collections
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
parent=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');e=parent/'observation-v3';p=parent/'ui-ledger.json';d=json.loads(p.read_bytes());assert d['used']==2 and d['remaining']==3 and len(d['steps'])==2
events=[json.loads(x)for x in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()if x.strip()];seq=[x['seq']for x in events];assert sorted(seq)==list(range(1,len(seq)+1))and len(set(seq))==len(seq)
resources=[x for x in events if x.get('type')=='resource'];catalogs=[x for x in resources if '/StreamingAssets/aa/'in x.get('url','')]
expected=['settings.json','catalog.hash','catalog.json','catalog_2026.09.29.17.09.42.hash','catalog_2026.09.29.17.09.42.json']
assert all(any(x['url'].endswith('/'+name)and x['responseStatus']==200 for x in catalogs)for name in expected)
assert not any('Invalid path'in str(x.get('args'))for x in events)
blockers=[x for x in events if x.get('type')in['error','unhandledrejection','securitypolicyviolation']or x.get('type')=='console'and x.get('level')in['warn','error']]
step=d['steps'][-1];assert step['operation']=='smash-runtime-uri-v3-navigation-20261118'and step['status']=='reserved'
step.update(status='observed_partial',observed_until=datetime.datetime.now(datetime.timezone.utc).isoformat(),outcome='Actual52 Chrome patched native startup: initial3 files and actualgame catalog+hash all200; relativepath rejection absent. NativeWASM newgetter successfully resolves currentorigin RuntimePath. Still blueSmash loading splash; originalFirebase auth/analytics/database andUnity/ByteBrew telemetry CSP failures remain. No menu/core/localroom/player/AI or gamebundles verified. Closed onlythisgameChrome tab withCtrl+W; no repeated refresh, no simulatedinput or fakeprovider state.',player_inputs=1)
d.update(game_started=True,game_tab_closed=True);write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode())
ps=r'''$ErrorActionPreference='Stop'
$name='GameLabDirectSmashNativeObserveV320261118'
$task=Get-ScheduledTask -TaskName $name
if(@($task.Actions).Count -ne 1 -or $task.Actions[0].Arguments -notlike '*direct-smash-runtime-uri-v3-20261118*native-observation-v3*57602*'){throw 'Task identity differs'}
if($task.State -eq 'Running'){Stop-ScheduledTask -TaskName $name}
@{task=$name;state=[string](Get-ScheduledTask -TaskName $name).State;pid_exists=[bool](Get-Process -Id 11660 -ErrorAction SilentlyContinue);port_listeners=@(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue).Count}|ConvertTo-Json -Compress
'''
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
cleanup=json.loads(res.stdout);assert not cleanup['pid_exists']and cleanup['port_listeners']==0
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,game_executed=True,ready_review=False,ui_steps_used=2,ui_steps_remaining=3,player_inputs_this_revision=1,splash_observed=True,game_tab_closed=True,events=len(events),event_types=dict(collections.Counter(x.get('type')for x in events)),sequence_unique_and_complete=True,local_catalog_resources=[{k:x[k]for k in ['url','responseStatus','duration']}for x in catalogs],relative_catalog_path_error_absent=True,gameplay_catalog_and_hash_http200=True,core_gameplay_verified=False,sdk_retired=False,remaining_runtime_blocker_events=blockers,owned_observer_cleanup=cleanup,job_unchanged=True,accounting={'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost_cny':None})
write_bytes(e/'step2-outcome.json',json.dumps(proof,ensure_ascii=False,indent=2).encode())
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash已完成真实52第2步原生启动（累计2/5、剩3）：v3首屏加载原WASM修订，原3份启动settings/catalog/hash及桌面游戏目录+hash实际ResourceTiming均200，原相对目录TextDataProvider错误消失，证明原RuntimePath/ResolveInternalId修复生效。51条完整连续事件留存；仍为蓝色加载页，Firebase认证/数据库/analytics与Unity/ByteBrew外联失败仍存在；未进入菜单/核心玩法/本地对局，不能计待验收。关闭本次Chrome游戏页，并只停止本轮专属观察任务，真实PID11660已不存在、57602无监听；未全局杀浏览器或Python。原任务/版本/暂停保持，V5.1与未知费用字段保留。'},None,idem='direct-smash-step2-native-uri-verified-20261118')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
print(json.dumps({k:v for k,v in proof.items()if k!='remaining_runtime_blocker_events'},ensure_ascii=False))
