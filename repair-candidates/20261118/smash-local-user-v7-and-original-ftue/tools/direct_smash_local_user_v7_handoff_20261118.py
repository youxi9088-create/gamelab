"""Publish genuine local-user completion, new original tutorial input and precise UI blocker."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
s=json.loads((b/'direct-smash-local-user-v7-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-local-user-v7-github-receipt-20261118.json').read_bytes());tests=json.loads((b/'smash-local-profile-fixture-result-20261118.json').read_bytes());ftue=a/'ftue-static-development-intake';f=json.loads((ftue/'receipt.json').read_bytes());raw=(ftue/'ftue-v4.original.json').read_bytes();items=json.loads(raw)
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']and tests['passed']==17
assert f['complete']and f['http_status']==200 and hashlib.sha256(raw).hexdigest()==f['sha256']and len(items)==4
assert sum(x['usePlayerBots']is True for x in items)==3
url_sources=json.loads((a/'service-data-source-urls/original-settings-constant-source.json').read_bytes());table=(r/'analysis-20261117/native-string-table-ANALYSIS-ONLY.bin').read_bytes();assert table[29131:29188].decode()==f['source_url']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-local-user-v7-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='verified_local_user_transaction_integrated_runtime_blocked_by_locked_desktop',candidate='local-user-v7-support-20261118/overlay + immutable_v6r2_base + one_appended_local_completion_function',remote_stage=s['stage'],manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],candidate_files=209,candidate_bytes=None,github_commit=g['commit'],local_assembly_recipe='local-user-v7-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,local_user_completion_integrated=True,local_user_completion_runtime_verified=False,local_profile_fixture_checks=17,own_appended_native_functions=7,own_added_native_exports=6,previous_v6r2_function_bodies_preserved=138249,user_service_ready_written=True,user_service_ready_write_scope='Original local user-data ready setter called only after actual storage/write/readback, typed native restore, identity match and canonical native snapshot persistence; no authentication/provider success',authentication_permission_flags_written=False,startup_auth_consumers_retired=3,all_sdk_retired=False,observer_task_registered=False,observer_process_running=False,ui_validation_blocker='Tool activation returned GetCursorPos access denied0x80070005. Fresh read-only screenshot shows Windows password page without target border: cannot reliably distinguish hostdesktop vs52 lock. Stop inputs and request both desktops unlocked; no game launch, observer or reserved step.',validation_blocker='v7 has not run. Locked/secure desktop prevents normal UI startup; remaining Ftue/News/CrossPromo/GameData and cloud consumers/offline room/player/AI still unresolved. New source-proven public Ftue JSON recovered exactly but not yet wired into runtime URL.',original_ftue_static_input={'url':f['source_url'],'bytes':len(raw),'sha256':f['sha256'],'tutorial_configurations':4,'configurations_with_original_player_bots_enabled':3,'runtime_localized':False,'native_gameplay_verified':False},reason='Local user-data completion follows real checked local transaction and emits original data-change event, not authentication.17ownfixture checks and fullWasm validation0; all138249previousbodies preserved,onefunction/export appended.209filesSHAverified52 andGitHub. NewpublicstaticFtue source recovered through developmentdirectnetwork after52terminalWinError10060; one4-configfile,not4levels. No v7 UI input,3/5remaining2 unchanged. Task not accepted or resumed.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash本地用户事务v7与原教程静态输入恢复'
note=f'''

{marker}

上轮v6r2已实现真实双对象本地存档。本轮v7将其接到用户数据完成事务：信封写入/读回、原生UserData/UserDataReadOnly类型恢复、身份核对及原生归一快照再次保存均成功后，才调用未修改的原UserService.gxx46621数据就绪设置，随后发出原UnityEvent<bool>.Invoke2404的数据变化事件。原metadata-use5673040独立核对确为UnityEvent<bool>.Invoke，UserService字段72类型同为该事件；不是Firebase认证成功/平台权限或下载回调。错误身份、类型恢复或保存失败不完成，重复完成不重发事件；不依靠单独翻ready标志替代数据生命周期。原平台认证旗标与交付/任务门禁不改。

相对v6r2全部138249函数体及原导出逐项不变，仅追加1个本地完成函数/1导出；从v5计7自编函数/6导出，完整Wasm静态校验exit0。auth.js只移除页面load的自动登录监听注册，原所有提供者函数字节前缀保持；HTML另去除addCrazyGamesAuthListener与Unity加载后的requestCrazyGamesUserToken两个启动调用，保留真实SDK模块与其它消费者，不换成功桩/假账号。其他云端、广告、遥测、资讯与推广消费者尚未全部退役，不能称SDK全完成。

17项自编WAT/JS/原生替身/数据隔离用例实际通过，新增验证本地完成发生在保存与类型恢复之后、错误身份不完成、归一快照保存失败不发完成、邻近状态字段不改、事件幂等；旧14项档案保护保留。链接器另拒绝错误ABI并保留旧自编函数体。测试自编fixture新增2参数void类型锚点后重新完整通过，没有执行原游戏函数或原存档。真实52独立{s['stage']}/candidate209文件逐SHA，候选清单{s['candidate_manifest_sha256']}、增量清单{s['manifest_sha256']}；原任务blocked/round3/versionnull整行、暂停/历史、3/5剩2台账保持，无接续/入库/下游。GitHub {g['commit']}已28blob核对/push0/ls-remote一致。

计划第4步实机前，工具激活返回GetCursorPos访问拒绝0x80070005。按computer-use恢复规则只重新定位并只读截图一次，画面为Windows密码页、无52边框，无法仅凭截图区分是运行Codex的主机还是52锁定。因此停止输入，已请求用户两边桌面保持解锁；SSH94663仍有真实exit0回执，无需重登。没有启动观察服务、没有登记/扣除第4步、没有点击登录界面或输入密码。本轮试玩仍3/5剩2，不把“计划验证”记成已执行，旧52解锁答复不能覆盖当前新登录页。

等待桌面期间继续恢复真实输入：原GameConstants.cctor104682对静态606调用getter31571；其原RVA字表29131/57实际值为https://smashkartsgc.b-cdn.net/ftuedata/prod/ftue-v4.json。原GameSettingsData构造复制静态606至field1140，原完整应用26015又写回606，所以v5默认配置保留该教程来源。与之并列31572返回cloudfunctions的youtubeTrendingVideosMulti，是API，未请求；News/CrossPromo初始URL getter771实际空串，未猜请求地址或造就绪。

52正常HTTPS无代理单次请求该静态JSON终态WinError10060（HTTP状态未知、无文件），保留原receipt，不将其当认证失败或反复重发。开发电脑不同网络路径对同一个源码证明的公开HTTPS静态URL单次读取实际200/application/json，无认证、无代理改动或重定向绕过。原文件4251字节，SHA {f['sha256']}，根为4条教程配置，其中3条原usePlayerBots=true；不是4关、不是4款游戏，更不是已跑通机器人。原权重、地图/模式/是否自动开局/是否私有玩家等值完整保留，不改教程权限或首局参数。文件及两环境回执按SHA同步52独立证据区，尚未接入运行候选URL，不能算Ftue服务已通过。

下一步桌面恢复后才用剩2步正常验证；在源码侧可先将该4项原JSON原字节落入StreamingAssets/aa，沿原Application.streamingAssetsPath6872+String.Concat635构造可迁移本地URL，单独替换原31571远端常量消费者；保留原Ftue下载/类型解析/非空完成逻辑，不送空列表或假provider。随后继续审计News/CrossPromo可退役消费者、GameData源及本地房间/玩家/AI。游戏真实运行只能52，开发继续仅静态与自编数据隔离验证。当前数据服务/其它云端/完整SDK/核心玩法均未完成，暂无新增待验收。

V5.1已按当前实现与未验证范围更新，原运行候选与旧规格保留；独占时间/输入/缓存/输出Token/费用未知null。最后测试站直连2026-11-18T02:19:00Z仍A35completed/1review/45blocked/9queued/3failed，57未达目标。另已按每款5步的既有规则询问RustyPick/Craig各额外最多5步，尚未答复；不自行重置。B组、其它暂停、跳过/取消、Cow/采集/下游保持。全目标未完成，当前有新代码和原始输入进展，保持active，不凭新的单轮锁屏直接标blocked。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_LOCAL_USER_V7.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：本地用户事务已接入，桌面锁屏待恢复，原教程JSON已取得\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v7-stage-receipt.json':(b/'direct-smash-local-user-v7-stage-receipt-20261118.json').read_bytes(),'evidence/v7-github-receipt.json':(b/'direct-smash-local-user-v7-github-receipt-20261118.json').read_bytes(),'source-input/ftue-v4.original.json':raw,'source-input/development-intake-receipt.json':(ftue/'receipt.json').read_bytes(),'source-input/remote52-intake-receipt.json':(b/'direct-smash-ftue-static-intake-20261118.json').read_bytes(),'source-proof/original-service-url-getters.json':(a/'service-data-source-urls/original-settings-constant-source.json').read_bytes(),'source-proof/local-user-completion-contract.json':(a/'native-local-user-completion-contract.json').read_bytes()}
for n in ['direct_smash_ftue_static_intake_20261118.py','direct_smash_ftue_development_intake_20261118.py','direct_smash_local_user_v7_handoff_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n in ['smash_local_profile_20261118.js','smash_local_profile_bridge_20261118.wat','smash_local_profile_bridge_20261118.wasm','smash_local_profile_fixture_20261118.wat','smash_local_profile_fixture_20261118.wasm','smash_local_profile_linked_fixture_20261118.wasm','smash_profile_native_linker_20261118.py','test_smash_local_profile_20261118.cjs','test_smash_profile_native_linker_20261118.py','smash-local-profile-fixture-result-20261118.json','smash-profile-linker-fixture-result-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/native-analysis-tools/package.json']=b'{"private":true,"dependencies":{"wabt":"1.0.39"}}\n'
files['fixture-workspace/README.md']='''# 17项自编隔离检查复现

只运行本目录自编WAT、JS及数据替身，不含原游戏函数体或真实存档。依赖Node/Python/wabt1.0.39，局部安装不改全局。

```text
npm --prefix native-analysis-tools install --ignore-scripts
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_bridge_20261118.wat -o smash_local_profile_bridge_20261118.wasm
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_fixture_20261118.wat -o smash_local_profile_fixture_20261118.wasm
python test_smash_profile_native_linker_20261118.py
node test_smash_local_profile_20261118.cjs
```

期望链接器ABI拒绝检查和17项隔离通过；这不是原生游戏或真实浏览器持久化通过。不得在开发机运行完整原游戏Wasm。
'''.encode()
main='''from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-user-v7-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();candidate=json.loads(candidate_raw)
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v7-stage-receipt.json'))==json.loads((stage/'receipt.json').read_bytes())
    source=z.read('source-input/ftue-v4.original.json');info=json.loads(z.read('source-input/development-intake-receipt.json'));assert info['complete']and info['http_status']==200 and hashlib.sha256(source).hexdigest()==info['sha256']and len(json.loads(source))==4
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note=__NOTE__
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'original_static_ftue_input_sha256':info['sha256'],'original_static_ftue_configurations':4,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
compile(main,'publish-local-user-and-original-ftue-input-only','exec');target=b/'direct_smash_local_user_v7_closure_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
