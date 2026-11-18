"""Publish local-settings implementation and exact unresolved native-profile contract."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
s=json.loads((b/'direct-smash-local-settings-v5-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-local-settings-v5-github-receipt-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-local-settings-v5-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='genuine_local_default_settings_applier_integrated_profile_lifecycle_pending',candidate='local-settings-v5-support-20261118/overlay + immutable_v4_base + verified_native_consumer_replacement',remote_stage=s['stage'],manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],candidate_files=206,candidate_bytes=None,github_commit=g['commit'],local_assembly_recipe='local-settings-v5-support-20261118/support/assembly-recipe.json',changed_native_functions_from_original=[35469,106283,43424],unchanged_original_wasm_function_bodies=138240,last_runtime_observed_revision='telemetry-consumers-v4-20261118',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,native_resource_catalog_runtime_verified=False,last_v4_resource_catalog_runtime_verified=True,local_settings_application_integrated=True,local_settings_application_runtime_verified=False,retained_original_settings_application=26015,retained_original_settings_constructor=43254,local_profile_persistence_integrated=False,local_room_player_ai_integrated=False,observer_task_registered=False,observer_process_running=False,observation_materials_stage=None,runtime_observation_candidate_root=s['stage']+'/candidate',validation_blocker='v5 has a genuine original-default settings consumer but is unexecuted. Native local profile persistence, local identity and room/player/AI remain unimplemented; Firebase authentication/database and otherSDK consumers still original. Priorv4 actual startup stayedatloading splash. Do not spend remaining2 steps until a causally useful lifecycle revision.',reason='Configuration request consumer43424 now invokes unchanged original full application26015 and constructor43254, rather than setting ready or fabricating remote URLs/download/provider callbacks. FullWasm validation0,138242otherbodies retained relativev4,206filesSHAverified52 andGitHub. Actual local storage/JSON/managed-string/Guid bindings recovered, including real structreturnABI; no original functions executed locally. Not a finished game or review delivery.',native_local_storage_contract='analysis-20261118/native-local-storage-contract-v2.json')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash原生默认配置消费者v5与本地存档ABI'
note=f'''

{marker}

上轮实际v4第3步已证明目录加载及ByteBrew/FirebaseAnalytics启动消费者退役，但加载页仍被真实Firebase匿名认证失败等阻断。本轮没有新增玩家操作，3/5剩2台账未改。测试站直连2026-11-18T01:30:29Z仍A35completed/1review/45blocked/9queued/3failed，57未达目标，无新增待验收。此前完整库存无变化，不重复403/404、采集或已失败策略。

v5已把原GameSettingsService.gbs43424中common/platform远端URL查询消费者改为调用原gbx26015(this,null,null,MethodInfo=null)。原方法自行分配空字典，进入完整应用事务：原GameSettingsData构造43254、字段应用、其自身合法ready及其余字段/事件均由原方法完成。不是构造假的Firebase/URL/下载成功，也没有在适配器中直接写ready或吞异常。采用原构建内置默认配置这一转换设计，不宣称取得原服务器实时配置；原应用函数和8468字节默认构造函数SHA均保持。原消费者117字节body的哈希先核对再替换，完整Wasm静态校验exit0，不执行真实游戏代码。

相对v4只改消费者43424，其他138242函数体逐SHA不变；相对最初原版总计35469/106283/43424三处改变，其他138240保持。网页、真实Firebase认证代码、框架、162bundle、角色/关卡/经济逻辑字节保持。真实52独立{s['stage']}/candidate206文件全部SHA，候选清单{s['candidate_manifest_sha256']}、增量清单{s['manifest_sha256']}；正常work-log幂等记录，原blocked/round3/versionnull任务整行/暂停/历史及3/5账本保持，没有激活进当前任务、观察服务、接续、入库或下游。GitHub {g['commit']}已17blob核对/push0/ls-remote一致。v5未运行，不能继承v4局部实测成当前候选玩法通过。

为接通真实本地用户生命周期，已从原metadata→真实模块方法指针→Wasm元素表逐项恢复54方法，并对PlayerPrefs与字符串/Guid关键函数补核实际ABI：SetString2875、GetString3224/7968、HasKey1698、Save6197；JsonConvert.SerializeObject1526与泛型共享解析2114；String.Ctor67864为char*+start+length+MethodInfo→managedstring；Guid.NewGuid1794为out结构体指针+MethodInfo→void，ToString1998消费结构体引用。没有把结构体返回当int。原GetString/SetString/Save均转入原Unity内部调用，SetString失败原本抛异常，后续不能吞错或清档重置。

原UserService.Init中字段104/par实际类型FriendRequests，17525为其bpj清理方法，不是本地存档器。UserData/ReadOnly初始化仍原17870/25900/43206/43161/43198。泛型DeserializeObject声明没有直接方法指针，必须保留原共享body2114及各自MethodInfo，不以普通DeserializeObject/字典强塞代替。54方法、各参数指针/数组元素类型及nativeABI、10段原存档/JSON/字符串/Guid可读源已移交；仍是源码证据，不是已写好的本地用户/房间/AI，不计游戏完成。

pendingstatus备份后指向v5，分开记“上一v4已实测”与“当前v5未运行”。独占时间/输入/缓存/输出Token/费用未知null。下一步可使用上述原生序列化、真实本地存取及原构造器完成可失败、保留旧档的本地用户事务，再接离线房间/玩家/AI；不得造UID认证、直接ready、免费解锁、支付/广告成功或静默丢弃坏档。剩2步不为局部配置改动盲目消耗。MergeDefense补读确认menu_demo是世界选择/后续进度入口，非纯推广，缺源403未变，未删除原跳转。B组、其他实际暂停、跳过/取消、Cow/采集/下游均保持。总目标仍未完成，保持active。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_LOCAL_SETTINGS_V5.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：原生默认配置已适配，本地存档与对局仍待完成\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v5-stage-receipt.json':(b/'direct-smash-local-settings-v5-stage-receipt-20261118.json').read_bytes(),'evidence/v5-github-receipt.json':(b/'direct-smash-local-settings-v5-github-receipt-20261118.json').read_bytes()}
for n in ['native-local-storage-bindings.json','native-local-storage-contract-v2.json','native-storage-functions-source/original-settings-constant-source.json','settings-default-constructor-source/original-settings-constant-source.json']:files['source-proof/'+n]=(a/n).read_bytes()
for n in ['direct_smash_native_local_storage_bindings_20261118.py','direct_smash_native_local_storage_abi_20261118.py','direct_smash_local_settings_v5_handoff_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
main='''from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-settings-v5-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();candidate=json.loads(candidate_raw)
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v5-stage-receipt.json'))==json.loads((stage/'receipt.json').read_bytes())
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note=__NOTE__
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
compile(main,'publish-native-local-settings-source-only','exec');target=b/'direct_smash_local_settings_v5_closure_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
