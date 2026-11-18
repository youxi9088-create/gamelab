"""Close the implemented local-profile component with reproducible own fixtures and live SHA evidence."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
s=json.loads((b/'direct-smash-local-profile-v6r2-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-local-profile-v6r2-github-receipt-20261118.json').read_bytes());tests=json.loads((b/'smash-local-profile-fixture-result-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']and tests['passed']==14
address=json.loads((a/'native-local-profile-address-contract.json').read_bytes());assert len(address['verified_addresses'])==4
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-local-profile-v6r2-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='typed_native_local_profile_storage_integrated_user_lifecycle_and_room_pending',candidate='local-profile-v6r2-support-20261118/overlay + immutable_v5_base + appended_own_native_bridge',remote_stage=s['stage'],manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],candidate_files=208,candidate_bytes=None,github_commit=g['commit'],local_assembly_recipe='local-profile-v6r2-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,runtime_verified=False,native_resource_catalog_runtime_verified=False,own_appended_native_functions=6,own_added_native_exports=5,original_v5_function_bodies_preserved=138243,local_profile_persistence_integrated=True,local_profile_persistence_runtime_verified=False,local_profile_fixture_checks=14,user_service_ready_written=False,authenticated_provider_result_fabricated=False,local_room_player_ai_integrated=False,observer_task_registered=False,observer_process_running=False,observation_materials_stage=None,runtime_observation_candidate_root=s['stage']+'/candidate',validation_blocker='v6r2 local profile storage is implemented and fixture-checked but unexecuted as a real game. User-service final lifecycle/events and retirement of actual account/database consumers are incomplete; no offline room/player/AI or gameplay. Priorv4 loading splash/authentication failure remains the only current real startup result.',reason='Integrated exact native JSON typed restoration and browser-local versioned dual-object snapshot, with prior-generation preservation, write/read checks, corruption and identity/concurrent-page rejection. Six own native bridge functions preserve all138243v5 bodies; fullWasm validation0,14self-authored fixture cases passed without originalgame execution.208filesSHAverified52,GitHub pushed. Not a completed game;3/5remaining2 unchanged.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash原生本地双对象档案v6r2实现与14项隔离验证'
note=f'''

{marker}

上轮v5已接通原内置默认配置应用，本轮继续实现真实本地存档，而非再做一个准备计划。原PlayerPrefs.Save和JS_FileSystem_Sync源码显示异步IDBFS.queuePersist，读回内存不能冒充实际持久化完成；因此新适配器不触碰原Unity/PlayerPrefs档案，使用独立浏览器localStorage命名空间gamelab.smash.local-profile.v1，保存原生UserData/UserDataReadOnly两个完整JSON原文及独立local:UUID。原JsonConvert1526序列化、共享泛型2114按原MethodInfo解析原类型，没有改币、解锁、奖励或元数据值，也没有替代提供者返回成功。

追加6个自编Wasm桥接函数/5个导出，v5全部138243原函数体逐SHA保留，原导入、表、数据等保持。HasInstance1591先检查且不创建未有的服务；原getInstance644只在已有时调用。双对象及UTF16托管引用保留在线性影子栈，两对象均解析成功后才发布；JS借用原Module.stackSave/Restore在失败后恢复本次拥有的栈。原UserService.ready80、认证标志及回调不写，身份冲突拒绝覆盖。存档只有本地角色，不等于平台账号/远端下载成功。4个metadata-use地址独立核对为UserService的HasInstance/get_Instance及UserData/UserDataReadOnly两个JsonConvert泛型实例，不凭地址猜类型。

版本信封绑定原metadata SHA；Adler32只检查误损坏，不是认证或服务端签名。写前比较当前页面读到的整份档案、保留上一代、单键写入后读回；坏档/版本不符/空间不足/并发更新不清档或回落默认新档。首次保存成功后才应用原生对象，后续保存再次核对原生身份，防止原平台消费者更换身份后混写本地档。未变快照不重复写；每5秒和pagehide/隐藏事件同步快照，重复attach共享一个会话，停止/Unity退出只清理自己的监听/计时器。读取/写入/原生解析失败显式报告，新提示UI尚未实测。

自编WAT链接到纯自编原生替身/数据的14项隔离检查实际通过：校验向量/Unicode原文、误损坏/版本错误不重置、首写失败不发布、备份及写失败保留旧信封、并发冲突、未变跳过、探测不创建服务、双类型恢复且ready哨兵不变、第二类型失败不部分发布/恢复栈、身份冲突、保存时身份改变拒绝、重复挂载及清理。另有链接器旧自编函数体保持和错误ABI拒绝。仅运行自编代码与自编数据，未在开发机执行原游戏；真实原完整Wasm仅静态校验exit0。修复了源码审查发现的保存身份变化/重复挂载缺口后重新完整验证。未上传的本地v6初稿保留，首次远端候选为v6r2。

真实52独立{s['stage']}/candidate208文件逐SHA，候选清单{s['candidate_manifest_sha256']}、增量清单{s['manifest_sha256']}；原任务blocked/round3/versionnull整行、人工暂停、历史、3/5剩2台账保持，没有新游戏执行、观察进程、接续、入库或下游。GitHub {g['commit']}已25blob核对/push0/ls-remote一致。候选包LOCAL_PROFILE_ADAPTATION.md中“4个自编导出”为旧草稿说明笔误，实际代码/链接清单及V5.1为6函数5导出，后续交付文档需纠正，不能按笔误重算代码/试玩通过。

V5.1随候选更新当前事实，独占时间/输入/缓存/输出Token/费用未知null。最后测试站直接核对2026-11-18T01:46:56Z仍A35completed/1review/45blocked/9queued/3failed，57未达目标。当前没有真实v5/v6r2启动证明：浏览器存档/刷新恢复、新提示UI、原用户服务最终生命周期与事件、平台认证/数据库/广告/遥测消费者退役、离线房间/玩家/AI和核心玩法仍未完成。剩2步保留用于具备启动因果修复后的实际验证，不把14隔离用例或208文件冒充游戏通过。下一步沿已实现档案衔接用户服务本地完成事务并退役相应远端消费者，之后处理房间/玩家/AI；不直接改ready解阻。B组、其他暂停、跳过/取消、Cow/采集/下游保持，原总目标active且未完成。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_LOCAL_PROFILE_V6R2.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：原生本地存档已实现，服务生命周期与对局仍待完成\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v6r2-stage-receipt.json':(b/'direct-smash-local-profile-v6r2-stage-receipt-20261118.json').read_bytes(),'evidence/v6r2-github-receipt.json':(b/'direct-smash-local-profile-v6r2-github-receipt-20261118.json').read_bytes()}
for n in ['native-local-profile-address-contract.json','native-local-profile-string-contract.json']:files['source-proof/'+n]=(a/n).read_bytes()
for n in ['direct_smash_profile_address_contract_20261118.py','direct_smash_profile_string_methods_20261118.py','direct_smash_local_profile_v6r2_handoff_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n in ['smash_local_profile_20261118.js','smash_local_profile_bridge_20261118.wat','smash_local_profile_bridge_20261118.wasm','smash_local_profile_fixture_20261118.wat','smash_local_profile_fixture_20261118.wasm','smash_local_profile_linked_fixture_20261118.wasm','smash_profile_native_linker_20261118.py','test_smash_local_profile_20261118.cjs','test_smash_profile_native_linker_20261118.py','smash-local-profile-fixture-result-20261118.json','smash-profile-linker-fixture-result-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/native-analysis-tools/package.json']=b'{"private":true,"dependencies":{"wabt":"1.0.39"}}\n'
files['fixture-workspace/README.md']='''# 自编隔离验证复现

此目录全部WAT、Wasm及数据替身均为自编测试，不含原游戏函数体。需要Node与Python，以及wabt1.0.39；安装在当前目录下native-analysis-tools，不改全局依赖。

```text
npm --prefix native-analysis-tools install --ignore-scripts
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_bridge_20261118.wat -o smash_local_profile_bridge_20261118.wasm
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_fixture_20261118.wat -o smash_local_profile_fixture_20261118.wasm
python test_smash_profile_native_linker_20261118.py
node test_smash_local_profile_20261118.cjs
```

期望：链接器ABI不匹配被拒绝、旧自编函数字节不变，14项本地档案检查通过。勿把这些隔离通过当原游戏/原数据/真实浏览器存档通过，也不要在开发机运行完整原游戏Wasm。
'''.encode()
main='''from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-profile-v6r2-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();candidate=json.loads(candidate_raw)
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v6r2-stage-receipt.json'))==json.loads((stage/'receipt.json').read_bytes())
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
compile(main,'publish-typed-local-profile-source-only','exec');target=b/'direct_smash_local_profile_v6r2_closure_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
