from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
s=json.loads((b/'direct-smash-telemetry-consumers-v4-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-telemetry-consumers-v4-github-receipt-20261118.json').read_bytes());audit=json.loads((b/'direct-a-existing-input-20261118-0057.json').read_bytes());old_audit=json.loads((b/'direct-a-existing-input-20261118-1932.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']
assert {x['job_id']:x for x in audit['items']}=={x['job_id']:x for x in old_audit['items']}
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-telemetry-v4-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==2 and status['ui_steps_remaining']==3
previous_bytes=status['candidate_bytes'];recipe=json.loads((r/'telemetry-consumers-v4-support-20261118/support/assembly-recipe.json').read_bytes())
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='observed_telemetry_startup_consumers_retired_candidate_local_bootstrap_pending',candidate='telemetry-consumers-v4-support-20261118/overlay + immutable_v3_base + verified_preloader_call_removal',remote_stage=s['stage'],manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],candidate_files=205,candidate_bytes=None,github_commit=g['commit'],local_assembly_recipe='telemetry-consumers-v4-support-20261118/support/assembly-recipe.json',changed_native_functions_from_original=[35469,106283],unchanged_original_wasm_function_bodies=138241,last_runtime_observed_revision='runtime-uri-v3-20261118',latest_candidate_game_executed=False,last_observed_ui_steps_used=2,latest_candidate_runtime_verified=False,native_resource_catalog_runtime_verified=False,last_v3_resource_catalog_runtime_verified=True,observed_bytebrew_startup_consumer_removed=True,firebase_analytics_startup_consumers_removed=True,all_sdk_retired=False,observer_process_running=False,observer_task_registered=False,observation_materials_stage=None,runtime_observation_candidate_root=s['stage']+'/candidate',last_full_input_audit_at=audit['at'],last_full_input_audit_unresolved=57,last_full_input_audit_material_changes=0,validation_blocker='Actualv3 startup loaded5catalog/config files200 but stayed atblueSmash splash. v4 retires only observedByteBrew startup consumer andFirebaseAnalytics host consumers; Firebaseauthentication/database andUnitynative telemetry remain original. Genuine localsettings/user/room/AI bootstrap unresolved. No v4 game run or newUI request.',reason='Observed telemetry consumers removed from source without provider stubs, fake success or ready flags. New205-file candidate staged andSHA-verified52; staticWasm validation only. AllA existinginput audit unchanged across57unresolved since19:34Z; no newly available material or alternate task input. UI2/5remaining3, earlieractualv3URI result retained separately. Not a completed game or review delivery.')
status.pop('changed_native_function',None);status.pop('unchanged_other_wasm_function_bodies',None)
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash实际遥测消费者退役v4与全A原包复核'
note=f'''\n\n{marker}

前一轮2步是真实进展，v3目录URI已实际加载5份配置/目录HTTP200，但仍停蓝色加载页。当前没有v4游戏执行或新UI输入，严格累计2/5剩3；两专属观察任务已停止，52解锁问题已解除，不重复索取解锁/授权，也不沿用旧Level Devil额度。

根据第2步实际ByteBrew网络失败栈，静态核对原Preloader.Start106283→初始化26516→44632→44631→原JSlib。v4只从106283删除单次i32.const0+call26516消费者序列；没有把SDK/provider方法写成空桩或返回成功，没有写ready、账号或奖励。相对v3其他138242函数体逐SHA保持，原getter35469的URI解析修复保留；相对最初原版仅35469/106283两函数不同，其他138241保持。完整Wasm经wabt静态校验exit0，未在本机执行原游戏。

网页原入口无条件firebase.analytics()初始化及Firebase Analytics模块装载已移除，同时移除gtag配置和2个loading跟踪调用，原enableFirebaseAnalytics开关改false；原main.js跟踪方法/框架/认证/数据库及162bundle保持，不冒称SDK全退役。原Analytics模块文件保留未装载历史字节，未清历史。Unity原生遥测、Firebase真实账号/数据库、广告等还未退役，本地配置/玩家/房间/AI仍未实现。此局部退役并不能证明解除加载页阻断，不为验证这个局部改动消耗剩余试玩。

真实52独立{s['stage']}/candidate205文件全部SHA核对，候选清单{s['candidate_manifest_sha256']}，增量清单{s['manifest_sha256']}；原任务整行/版本/暂停、实时2/5账本保持，无观察服务/注册/安装/接续/入库/下游。GitHub {g['commit']}，17blob核对、push0、ls-remote一致。V5.1随候选更新当前事实，独占耗时/Token/费用未知仍null。

北京时间08:56重新以SQLite只读核对所有57未完成A任务的同源候选、版本、产物、目录及source_bundle：与2026-11-17T19:34:31Z前次逐任务JSON完全相同，bundle记录种类为空，无新原包或版本，不重复403/404访问或采集。最新测试站A仍35completed/1review/45blocked/9queued/3failed，未新增待验收。此证据不能当任务全部完成；下一轮应先梳理真实本地配置/用户生命周期的数据来源，或处理用户对LittleAlchemy v3/跑酷SDKv2各自额度问题的新答复/明确新原包，不反复跑同一全量原包检查。

pendingstatus已备份旧v3版本并指向v4，同时分开记录“上一v3已实测URI”与“当前v4未实机”；不得把旧v3局部运行结论继承成v4整款通过。全部A目标保持active，尚非三轮无进展阻断，绝不标complete。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_TELEMETRY_V4.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：局部遥测入口已退役，本地生命周期仍待完成\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'v4-github-receipt.json':(b/'direct-smash-telemetry-consumers-v4-github-receipt-20261118.json').read_bytes(),'existing-input-audit.json':(b/'direct-a-existing-input-20261118-0057.json').read_bytes(),'tools/direct_smash_telemetry_v4_handoff_20261118.py':Path(__file__).read_bytes()}
main='''from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
s=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118/closure');s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(s/'MANIFEST.json',raw_manifest)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note=__NOTE__
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
ledger=json.loads(Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118/ui-ledger.json').read_bytes());assert ledger['used']==2 and ledger['remaining']==3
out={'complete':True,'stage':str(s),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(manifest),'coordination_appended':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':2,'ui_steps_remaining':3,'new_player_inputs':0};write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
compile(main,'v4-evidence-publication-only','exec');target=b/'direct_smash_telemetry_v4_closure_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'game_executed':False,'ui_steps_used':2,'ui_steps_remaining':3}))
