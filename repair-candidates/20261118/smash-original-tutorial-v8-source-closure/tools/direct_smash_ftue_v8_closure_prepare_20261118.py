"""Record source/runtime boundaries and publish a reproducible, immutable closure."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';sha=lambda v:hashlib.sha256(v).hexdigest()
s=json.loads((b/'direct-smash-ftue-v8-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-ftue-v8-github-receipt-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-local-ftue-v8-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes())
status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='original_tutorial_input_localized_v8_pending_desktop_and_runtime',
    candidate='local-ftue-v8-support-20261118/overlay + immutable_v7_base + one_native_url_consumer',remote_stage=s['stage'],candidate_files=211,
    manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],github_commit=g['commit'],
    local_assembly_recipe='local-ftue-v8-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,
    local_ftue_input_integrated=True,local_ftue_input_runtime_verified=False,own_appended_native_functions=8,own_added_native_exports=7,
    previous_v7_function_bodies_preserved=138249,original_v5_function_bodies_preserved=138242,
    changed_native_functions_from_original=[31571,35469,106283,43424],unchanged_original_wasm_function_bodies=138239,
    user_service_ready_written=None,runtime_user_service_ready_written=None,local_user_completion_after_persistence_implemented=True,
    observer_process_running=False,observer_task_registered=False,runtime_observation_candidate_root=None,
    next_runtime_candidate_root=s['stage']+'/candidate',
    validation_blocker='v8 has not run. Tool activation still returns GetCursorPos access denied; one fresh read-only recovery screenshot is a Windows password page with no RDP border. Both host and52 desktop unlock requested. No observer or step4 reservation. News/CrossPromo/GameData, remaining SDK/cloud consumers, room/player/AI and gameplay remain unresolved.',
    reason='Exact4251byte original4-configFtue JSON localized; only original31571 URL consumer changed plus one portable sameorigin path helper. Original native download/parse/completion retained,138249v7bodies preserved.3ownfixture URL/UTF16/stack checks and fullWasm static validation0.211filesSHAverified52,GitHub push verified. No UI input or new acceptance.')
status['original_ftue_static_input'].update(runtime_localized=True,native_gameplay_verified=False,native_download_parse_runtime_verified=False)
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash v8原教程输入本地化，桌面仍未可控'
note=f'''

{marker}

用户回复已停止操作且52在前台后，工具重新枚举唯一52窗口527928；激活仍实际返回GetCursorPos访问拒绝0x80070005。按computer-use规则只恢复一次：新list/get_window只读截图仍为Windows密码页，缺少窗口边框，不能可靠区分Codex主机或52锁定。没有操作登录页、没有启动游戏/观察器、没有预留或扣第4步；仍3/5剩2。已请求两边均保持解锁，SSH94663仍可执行并有新exit0回执，不重复登录或寻找凭据。

源码侧完成v8：将已取得的原公开Ftue JSON4251字节按SHA原样放入StreamingAssets/aa/ftue-v4.original.json。只替换原getter31571远端URL消费者，调用一个新自编路径函数，使用已证实ABI的原Application.get_streamingAssetsPath6872、String.Ctor67864、String.Concat635构建可迁移同源URL。不硬编码域名/机器/端口，不覆盖57字节RVA或相邻字符串。原FtueDataService43616下载、类型解析、101058非空完成判断保持，不造空列表/成功回调/ready。4项是教程配置不是关卡，3项原usePlayerBots=true不是AI实测，权重/地图/模式/自动开局/奖励/解锁值均不改。

v7全部138250函数体中138249保持，仅31571单消费者变化，另追加1函数/导出；从v5累计8自编函数/7导出，v7档案/真实本地完成事务原字节保留。原type/import/table/global/data/metadata/RVA保持。完整Wasm静态校验exit0，开发机仅执行自编路径fixture：HTTPS目录、带不同端口目录、Unicode目录3项均正确，使用UTF16原字符串拼接并恢复栈；原游戏从未在开发机运行。前17项档案隔离证据继续保留，没有因纯路径修改重跑原游戏。

52独立{s['stage']}/candidate211文件重建逐SHA，候选清单{s['candidate_manifest_sha256']}，增量清单{s['manifest_sha256']}，完整原文件SHA1b63ee72154ddbe90c7f0cb4470031a5c1db80af5a686a80e8d7695f2c168465。原任务blocked/round3/versionnull整行和暂停/历史保持，未接续/入库/下游。GitHub提交{g['commit']}已25blob核对、push0、ls-remote精确一致。V5.1同步写明原路径/实现事实与未实机范围；状态中的旧user_service_ready_written改为null并分列“本地事务实现”和“运行未知”，避免把代码会调用setter误读为实际游戏ready。

最新测试站直连绕过代理2026-11-18T02:55:45Z：A93仍35completed/1review/45blocked/9queued/3failed，57未达目标，没有本轮新增待验收。最初误把本机测试站helper交给52时在本地路径读取即FileNotFound、未发测试站请求，已改回开发电脑原helper直连并实际成功；不拿该失败当站点故障。其余News/CrossPromo/GameData、云端/SDK消费者、离线房间/玩家/AI及核心玩法仍未完成。不能以211文件SHA或静态校验代替游戏验收。耗时/Token/费用未知null。RustyPick/Craig新追加额度问题仍未回复；B组、其它暂停、跳过/取消、Cow/采集及下游保持。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_FTUE_V8.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：Smash原教程输入已同步，实机仍受桌面访问阻挡\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v8-stage-receipt.json':(b/'direct-smash-ftue-v8-stage-receipt-20261118.json').read_bytes(),'evidence/v8-github-receipt.json':(b/'direct-smash-ftue-v8-github-receipt-20261118.json').read_bytes(),'evidence/direct-testsite.json':(b/'direct-a-testsite-current.json').read_bytes()}
for n in ['smash_ftue_local_url_v8_20261118.wat','smash_ftue_local_url_v8_20261118.wasm','smash_ftue_url_fixture_v8_20261118.wat','smash_ftue_url_fixture_v8_20261118.wasm','smash_ftue_url_linked_fixture_v8_20261118.wasm','test_smash_ftue_url_fixture_v8_20261118.cjs','direct_smash_ftue_v8_fixture_20261118.py','smash_profile_native_linker_20261118.py','smash-ftue-url-fixture-result-v8-20261118.json']:
    files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/native-analysis-tools/package.json']=b'{"private":true,"dependencies":{"wabt":"1.0.39"}}\n'
files['fixture-workspace/README.md']='''# 原教程路径自编隔离验证

只运行本目录自编URL桥、fixture和mock，不运行原游戏或原函数。

```text
npm --prefix native-analysis-tools install --ignore-scripts
python direct_smash_ftue_v8_fixture_20261118.py
```

期望3项通过；不等于52下载、Ftue解析、AI或游戏玩法通过。
'''.encode()
files['tools/direct_smash_ftue_v8_closure_prepare_20261118.py']=Path(__file__).read_bytes()
main='''from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-ftue-v8-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v8-stage-receipt.json'))==json.loads((stage/'receipt.json').read_bytes())
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
packet=b/'direct_smash_ftue_v8_closure_20261118.pyz';assert not packet.exists();compile(main,'ftue-v8-source-closure-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
