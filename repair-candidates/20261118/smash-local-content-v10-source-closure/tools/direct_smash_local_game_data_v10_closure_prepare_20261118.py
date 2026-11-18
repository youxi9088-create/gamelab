"""Publish the real local-data implementation boundary and self-contained own-fixture evidence."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';sha=lambda x:hashlib.sha256(x).hexdigest()
s=json.loads((b/'direct-smash-local-game-data-v10-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-local-game-data-v10-github-receipt-20261118.json').read_bytes());tests=json.loads((b/'smash-local-game-data-fixture-result-v10-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']and tests['passed']==10
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-local-game-data-v10-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='real_local_game_data_transaction_v10_implemented_pending_desktop_and_runtime',candidate='local-game-data-v10-support-20261118/overlay + immutable_v9r2_base + one_local_request_consumer',remote_stage=s['stage'],candidate_files=215,manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],github_commit=g['commit'],local_assembly_recipe='local-game-data-v10-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,
    local_game_data_transaction_implemented=True,local_game_data_transaction_runtime_verified=False,local_game_data_fixture_checks=10,
    local_game_data_inputs={'presets':'Actual original native seven-slot PlayOptionsData JSON, exact raw string','item_count':1493,'group_count':48,'identity':'Existing actual persisted local profile','dayId':'Actual current local UTC date, explicitly not server time','optional_cloud_reward_season_challenge_keys':'Not supplied'},
    original_ready_getter_and_typed_application_preserved=True,original_game_data_request_consumer_rebound=8457,
    own_appended_native_functions=23,own_added_native_exports=18,previous_v9r2_function_bodies_preserved=138254,original_v5_function_bodies_preserved=138235,
    changed_native_functions_from_original=[6443,8457,10272,31571,35469,43424,104933,105867,105877,106283,107124],unchanged_original_wasm_function_bodies=138232,
    observer_process_running=False,observer_task_registered=False,next_runtime_candidate_root=s['stage']+'/candidate',
    validation_blocker='v10 has not run. Desktop recovery question remains pending; last actual UI evidence is GetCursorPos access denied and a Windows password page. No observer, reservation or input. Full SDK retirement, other cloud consumers, menu/room/player/AI, gameplay and actual persistence still unverified.',
    reason='Real original native defaults/catalogs are checked and bound to actual local identity/calendar; a separate checked local record is saved before original typed application17602/43610. Only request8457 is redirected to local work; original ready/completeness/error/event behavior retained.10ownfixture checks, fullWasm static0 and215fileSHA sync/GitHub. No game launch or new acceptance.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash v10真实本地内容事务接入，原完成检查保持'
note=f'''

{marker}

上轮已经核清原GameData协议和七个原生预设，本轮实现真实本地内容事务，不用DEFAULT或ready常量绕过。读取由原客户端真正加载的PlayOptionsData七槽、1493项原物品列表和48组原分组，实际本地用户已保存/ready且身份与GameData UID一致后才接入；地图名称/规则字段完整校验，原JSON原文保留，原生long文本不经JS数字重编码。独立记录键gamelab.smash.local-content.v1绑定原始来源SHA、真实本地身份与实际本机UTC日历日期；明确dayId来源是本地UTC，不声称服务端时间。记录校验、上一代备份、CAS写入与读回均成功后，才用原Dictionary<string,object>解析器5690372/2114解析本地实际数据，交给原17602/43610完整应用/正常事件。适配字典只含实际dayId和实际原生playOptions，不提供未取得的奖励/赛季/挑战/价格/用户刷新键，不拦截Firebase响应或模拟SDK成功。

仅将原数据请求消费者8457接到自编本地排队；原26067沿原链传真实UID，排队函数仅写实际loading140表示任务已发起，绝不写ready。原Firebase提供者、原10177就绪getter、最终完整应用field16/loading140检查、原数据解析/保护字段/事件/错误路径均保留。若解析、原应用或完成失败则不报告成功，恢复自己拥有的栈和临时缓冲。UTC跨日或原本地数据请求会重新派发真实本地事务，错误时停止自己的定时器并显示明确失败，不重复循环造数据。

源码核查纠正两个不能猜的ABI点：Customization服务实际字段类型为CustomizationItemsModel、Dictionary<string,CustomizationGroupModel>和List<ItemData>；没有编译HasInstance<CustomizationDataService>方法/metadata-use，不能拿邻近地址或另一方法身份代替。自编只读探针复制原644/1591声明类/RGCTX/static-fields读取路径，调用原类元数据初始化601，仅读已存在实例，不调用创建分支。List开放泛型字段偏移都是零占位，未将其当实例偏移；实际_size12由闭合List<ItemData>分配类型和原44901八个填充循环的读/写证明。

原43610中10类可选键的ContainsKey<string,object> metadata5648396/原shared784已核查缺键跳转或正分支范围，包括uncollectedRewards、spinHighlights、dailyChallenges、seasonChallenges、seasonData、promos、expiredItemPrices、newlyAwardedSeasonRewards、seasonPoints及numLoopRewardsCollected；本地数据不供应这些键，沿原缺失分支。原公共应用/规范化和其余间接副作用仍须52观察，不将这份静态分析称为完整SDK/玩法验证。

10类自编隔离检查实际通过：真实快照先保存后原类型应用、缺目录不执行、缺/未就绪服务或身份不符不执行、目录探针仅初始化元数据不建实例、保存失败不执行、坏校验/来源不符保留旧档、另身份/另页冲突不覆盖、七槽完整性与原long文本保留、坏解析/原应用未完成不能报告成功且栈/缓冲释放、无效本机时钟拒绝。仅运行自编WAT/JS/mock数据，没有运行原游戏函数或原资产/用户存档。自编链接器只为新桥词汇加入i32.and和i32.store8指令的解析，原函数体从不解码/重写；新完整Wasm静态校验exit0。相对v9r2只改8457，其余138254函数体保持；新增11函数/8导出，从v5共23自编函数/18导出，原type/import/table/global/data/metadata与v7用户档案/v8教程/v9在线展示退役保持。

实际52独立{s['stage']}/candidate215文件重建逐SHA，候选清单{s['candidate_manifest_sha256']}、增量清单{s['manifest_sha256']}；原任务blocked/round3/versionnull整行、人工暂停/历史和3/5剩2台账保持，没有接续、入库或供货。GitHub提交{g['commit']}已30blob核对、push0、ls-remote精确一致。V5.1记录实现与真实本地日历来源、未实机范围；原输入来源SHA与候选实际字节SHA分别保存，未知耗时/Token/费用null。

本轮没有新桌面恢复回复，因此没有再次轮询旧锁屏或追加催促；原恢复问题仍待回复。没有运行v10/观察器/第4步预留或玩家输入，最后实际运行仍v4蓝色加载页，3/5剩2。当前完整SDK退役、其它云端更新、原菜单/本地房间/玩家/AI、比赛和存档实际持久化仍待完成/验证，不计待验收。测试站2026-11-18T03:48:18Z直连仍A35completed/1review/45blocked/9queued/3failed，57未达；无本轮新增待验收。RustyPick/Craig额度请求、B组、其它暂停/跳过/Cow/采集/下游保持。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_LOCAL_GAME_DATA_V10.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：真实本地内容事务已同步，v10尚未实机\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v10-stage.json':(b/'direct-smash-local-game-data-v10-stage-receipt-20261118.json').read_bytes(),'evidence/v10-github.json':(b/'direct-smash-local-game-data-v10-github-receipt-20261118.json').read_bytes(),'evidence/testsite-current.json':(b/'direct-a-testsite-current.json').read_bytes()}
for n in ['smash_local_game_data_v10_20261118.wat','smash_local_game_data_v10_20261118.wasm','smash_local_game_data_fixture_v10_20261118.wat','smash_local_game_data_fixture_v10_20261118.wasm','smash_local_game_data_linked_fixture_v10_20261118.wasm','smash_local_game_data_v10_20261118.js','smash_local_profile_20261118.js','smash_profile_native_linker_20261118.py','direct_smash_local_game_data_v10_fixture_20261118.py','test_smash_local_game_data_v10_20261118.cjs','smash-local-game-data-fixture-result-v10-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/native-analysis-tools/package.json']=b'{"private":true,"dependencies":{"wabt":"1.0.39"}}\n'
files['fixture-workspace/README.md']='''# 本地原生内容事务隔离复现

只运行自编WAT/JS和mock数据，不运行原游戏函数/资产或真实档案。依赖Node、Python与局部wabt1.0.39。

```text
npm --prefix native-analysis-tools install --ignore-scripts
python direct_smash_local_game_data_v10_fixture_20261118.py
```

期望10类检查通过；不是52的原生菜单/比赛/玩家/AI或持久化通过。
'''.encode()
for n in ['game-data-local-context-contract.json','game-data-optional-input-effect-guards.json']:files['source-proof/'+n]=(a/n).read_bytes()
files['tools/direct_smash_local_game_data_v10_closure_prepare_20261118.py']=Path(__file__).read_bytes()
main='''from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-game-data-v10-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v10-stage.json'))==json.loads((stage/'receipt.json').read_bytes())
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
packet=b/'direct_smash_local_game_data_v10_closure_20261118.pyz';assert not packet.exists();compile(main,'publish-local-data-boundaries-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
