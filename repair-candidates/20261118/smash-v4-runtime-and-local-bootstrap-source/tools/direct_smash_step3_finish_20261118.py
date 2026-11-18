"""Close the genuine v4 trial; retain failed authentication and exact original task state."""
from pathlib import Path
import json,sys,datetime,subprocess,copy,hashlib,collections
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
parent=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');e=parent/'observation-v4';p=parent/'ui-ledger.json';d=json.loads(p.read_bytes());assert d['used']==3 and d['remaining']==2 and len(d['steps'])==3
events=[json.loads(x)for x in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()if x.strip()];seq=[x['seq']for x in events];assert sorted(seq)==list(range(1,len(seq)+1))and len(set(seq))==len(seq)
resources=[x for x in events if x.get('type')=='resource'];catalogs=[x for x in resources if '/StreamingAssets/aa/'in x.get('url','')]
expected=['settings.json','catalog.hash','catalog.json','catalog_2026.09.29.17.09.42.hash','catalog_2026.09.29.17.09.42.json']
assert all(any(x['url'].endswith('/'+name)and x['responseStatus']==200 for x in catalogs)for name in expected)
serialized=json.dumps(events).lower();assert 'invalid path'not in serialized and 'bytebrew'not in serialized and 'firebase-analytics-compat'not in serialized
assert 'auth/network-request-failed'in serialized and 'identitytoolkit.googleapis.com'in serialized
assert 'resource_buffer_full'not in serialized
blockers=[x for x in events if x.get('type')in['error','unhandledrejection','securitypolicyviolation']or x.get('type')=='console'and x.get('level')in['warn','error']]
stage=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118');manifest_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();manifest=json.loads(manifest_raw)
for n,h in manifest.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
step=d['steps'][-1];assert step['operation']=='smash-telemetry-consumers-v4-navigation-20261118'and step['status']=='reserved'
step.update(status='observed_partial',observed_until=datetime.datetime.now(datetime.timezone.utc).isoformat(),outcome='Actual52 Chrome v4: five startup/catalog resources200; no relativepath error, ByteBrew init errors/requests or Firebase Analytics module/startup traffic. Still blue loading splash: actual Firebase anonymous auth/network-request-failed and CSP-blocked identitytoolkit signup; native Unity telemetry and newbadwords.txt still request external sources. No menu, local profile, room, AI or core gameplay verified. Closed onlythis Chrome game tab; no refresh, SDK callback fabrication or readiness writes.',player_inputs=1)
d.update(game_started=True,game_tab_closed=True);write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode())
ready=json.loads((e/'server-ready.json').read_bytes());assert ready['pid']==9232
ps=r'''$ErrorActionPreference='Stop'
$name='GameLabDirectSmashNativeObserveV420261118'
$task=Get-ScheduledTask -TaskName $name
if(@($task.Actions).Count -ne 1 -or $task.Actions[0].Arguments -notlike '*direct-smash-telemetry-consumers-v4-20261118*native-observation-v4*57602*'){throw 'Task identity differs'}
if($task.State -eq 'Running'){Stop-ScheduledTask -TaskName $name}
@{task=$name;state=[string](Get-ScheduledTask -TaskName $name).State;pid_exists=[bool](Get-Process -Id 9232 -ErrorAction SilentlyContinue);port_listeners=@(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue).Count}|ConvertTo-Json -Compress
'''
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
cleanup=json.loads(res.stdout);assert not cleanup['pid_exists']and cleanup['port_listeners']==0
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,game_executed=True,revision='telemetry-consumers-v4-20261118',candidate_manifest_sha256=hashlib.sha256(manifest_raw).hexdigest(),candidate_files_verified=len(manifest),ready_review=False,ui_steps_used=3,ui_steps_remaining=2,player_inputs_this_revision=1,splash_observed=True,game_tab_closed=True,events=len(events),event_types=dict(collections.Counter(x.get('type')for x in events)),sequence_unique_and_complete=True,local_catalog_resources=catalogs,relative_catalog_path_error_absent=True,bytebrew_startup_consumer_absent=True,firebase_analytics_startup_consumer_absent=True,firebase_anonymous_authentication_failed=True,core_gameplay_verified=False,sdk_retired=False,remaining_runtime_blocker_events=blockers,owned_observer_cleanup=cleanup,job_unchanged=True,accounting={'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost_cny':None})
write_bytes(e/'step3-outcome.json',json.dumps(proof,ensure_ascii=False,indent=2).encode())
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash完成真实52第3步v4原生启动（累计3/5、剩2）：5份启动/游戏目录资源实际200，ByteBrew与Firebase Analytics启动消费者请求/错误消失，原目录URI修复保持；仍为蓝色加载页，真实Firebase匿名认证auth/network-request-failed，identitytoolkit signup被离线策略阻断，Unity遥测/原词表外联仍存在。未进入菜单/本地角色/房间/AI/核心玩法，不能计待验收。只关闭本次Chrome页并停止专属观察任务，PID9232不存在、57602无监听；205文件后验SHA与v4清单一致。保留原任务/版本/暂停/步数历史，无假账号、provider成功或ready赋值。'},None,idem='direct-smash-step3-native-v4-verified-20261118')
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
print(json.dumps({k:v for k,v in proof.items()if k!='remaining_runtime_blocker_events'},ensure_ascii=False))
