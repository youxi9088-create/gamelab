"""Close source evidence and immutable reproduction, without claiming runtime acceptance."""
from pathlib import Path
import json,hashlib,zipfile,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';sha=lambda v:hashlib.sha256(v).hexdigest()
s=json.loads((b/'direct-smash-optional-services-v9r2-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-optional-services-v9r2-github-receipt-20261118.json').read_bytes());failure=json.loads((b/'direct-smash-optional-services-v9-failure-read-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and g['push_exit']==0 and g['remote_sha_matches']and not failure['old_stage_exists']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-optional-services-v9r2-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes())
assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='optional_presentation_consumers_retired_v9r2_pending_desktop_and_runtime',candidate='optional-services-v9r2-support-20261118/overlay + immutable_v8_base + six_original_consumers',remote_stage=s['stage'],candidate_files=212,
    manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],github_commit=g['commit'],local_assembly_recipe='optional-services-v9r2-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,
    own_appended_native_functions=12,own_added_native_exports=10,previous_v8_function_bodies_preserved=138245,original_v5_function_bodies_preserved=138236,
    changed_native_functions_from_original=[6443,10272,31571,35469,43424,104933,105867,105877,106283,107124],unchanged_original_wasm_function_bodies=138233,
    optional_presentation_consumer_retirement_implemented=True,optional_presentation_runtime_verified=False,optional_services_marked_ready=False,core_data_requirements_preserved_in_implementation=True,
    optional_service_fixture_checks=5,optional_service_fixture_state_cases=256,optional_panel_source_methods_mapped=78,optional_panel_original_functions_read=76,
    observer_process_running=False,observer_task_registered=False,next_runtime_candidate_root=s['stage']+'/candidate',
    validation_blocker='v9r2 has not run. Last UI recovery remains GetCursorPos access denied and a Windows password page; no fresh unlock reply. Remaining real GameData/bootstrap, other SDK/cloud consumers, local room/player/AI and gameplay unresolved. No step4 reserved or observer started.',
    reason='Optional News/CrossPromo startup requests, presentation dependencies and three actual component Start consumers retired together. Original settings/user/Ftue and GameData completeness/loading remain required; no service-ready flags or fake data.5ownfixture categories/256state combinations and fullWasm static validation0;212filesSHAverified52/GitHub. First v9 proof JSON integer-key comparison failed before any publication; v9r2 canonicalizes evidence keys only, identical candidate Wasm. No new UI input or acceptance.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash v9r2资讯推广消费者退役，真实核心数据门禁保留'
note=f'''

{marker}

上一轮v8已同步原教程输入。本轮继续静态恢复SKServicesLoader与CrossPromoPanel、NewsAndFriendsPanel、NewsPanel、FullScreenNewsPanel、NewsItem，78个原方法映射/76个不同原函数体。原加载eum10272/eun6443确实要求NewsDataService/CrossPromoDataService.ready；原loader104933同时发两个请求、订阅事件，菜单面板继续等待并显示对应内容。不能只跳过判断或造空成功响应。

v9按真实调用退役这两项在线展示依赖：原loader104933内实际43380/43675请求调用各只移除一次，将已求值的两个参数丢弃，原服务/提供者/回调函数不替换为空桩。三个原Start消费者CrossPromoPanel107124、NewsAndFriendsPanel105877和NewsPanel105867改用已证实metadata/token/函数ABI的原Component.get_gameObject637+GameObject.SetActive630隐藏目标在线展示组件。不是保留假资讯/好友/媒体/推广按钮；未来是否有其他路径重激活组件、布局或交互受影响尚须实机，不预先宣称UI通过。原清理/事件提供者及历史资源保持。

核心检查仍要求真实GameSettings21、真实本地档案事务完成后的User80、原JSON下载并类型解析成功后的Ftue20。GameData阶段保留原10177对真实数据集合完整性的判断及原loading140。注意10177才是原f_lao，不能把另一个8455方法误当就绪getter；已通过原反编译函数头、metadata映射及方法体核对。全部8个Has/get泛型元数据地址独立核对实际owner；不设置News/CrossPromo.ready，不造认证、奖励、权限、云端响应或GameData版本，不修改任务/验收门禁。

自编WAT/JSfixture5类保护覆盖256组核心服务存在/ready与GameData缺失/未齐/加载中/实际齐备组合，所有缺失或未就绪核心数据都阻断，无服务/档案字段写入，原组件API仅隐藏目标，栈和旧自编锚点保持。开发机只运行自编fixture，原完整Wasm仅静态校验exit0。相对v8仅6原消费者变化，其余138245函数体保持，追加4自编函数/3导出；从v5共12自编函数/10导出。原type/import/table/global/data/metadata、v7真实档案事务、v8原教程文件均保持。

第一次v9远端在原生证据比较处终态exit1：proof的original_changed_body_hashes本机用整型函数号作键，JSON读回为字符串导致严格比较失败。只读诊断再次静态重建确认唯一差异该字段，规范JSON后全部证据及候选Wasm SHA完全相同；远端原v9stage/receipt均不存在，原任务blocked/round3/versionnull、3/5剩2保持，失败发生在mkdir/发布/工作日志之前。保留失败包，不覆盖或重跑可能成功的写操作。新不可变v9r2仅将证据键输出规范化为字符串，完整比较仍保留，候选Wasm字节逐字节与失败包相同，未放宽验证。

实际52重建{s['stage']}/candidate212文件全部SHA核对，候选清单{s['candidate_manifest_sha256']}、增量清单{s['manifest_sha256']}；原任务整行/版本/暂停/历史和UI台账保持，无接续/入库/下游。GitHub提交{g['commit']}已27blob核对/push0/ls-remote一致。V5.1记录实现与运行边界；当前候选GameData、其他云端/SDK消费者、离线房间/玩家/AI和玩法仍未完成，不计待验收。

本轮没有新的桌面恢复回复，因此未再次轮询同一锁屏或催促：上一轮实际GetCursorPos访问拒绝和新只读Windows密码截图仍是最新UI证据。没有观察服务/第4步预留/玩家输入；最后实际运行仍v4，3/5剩2。原测试站2026-11-18T02:55:45Z A93为35completed/1review/45blocked/9queued/3failed，57未达；没有本轮新增待验收。正在核查GameData真实冷启动/内容加载，不能用原内存字段存在、空字典或构造函数替代完整内容事务。耗时/Token/费用未知null；额外额度请求仍待回复，B组/暂停/跳过/Cow/采集/下游保持。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_OPTIONAL_SERVICES_V9R2.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：资讯推广消费者已退役候选，实机与GameData仍待完成\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v9r2-stage.json':(b/'direct-smash-optional-services-v9r2-stage-receipt-20261118.json').read_bytes(),'evidence/v9r2-github.json':(b/'direct-smash-optional-services-v9r2-github-receipt-20261118.json').read_bytes(),'evidence/v9-terminal-failure-read.json':(b/'direct-smash-optional-services-v9-failure-read-20261118.json').read_bytes()}
for n in ['smash_optional_services_v9_20261118.wat','smash_optional_services_v9_20261118.wasm','smash_optional_services_fixture_v9_20261118.wat','smash_optional_services_fixture_v9_20261118.wasm','smash_optional_services_linked_fixture_v9_20261118.wasm','test_smash_optional_services_v9_20261118.cjs','direct_smash_optional_services_v9_fixture_20261118.py','smash_profile_native_linker_20261118.py','smash-optional-services-fixture-result-v9-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/direct-games/job-3db06205247a/analysis-20261118/optional-panels-source/original-retirement-contract.json']=(a/'optional-panels-source/original-retirement-contract.json').read_bytes()
files['fixture-workspace/native-analysis-tools/package.json']=b'{"private":true,"dependencies":{"wabt":"1.0.39"}}\n'
files['fixture-workspace/README.md']='''# 在线展示退役的核心数据保护隔离验证

仅运行自编桥接、fixture和mock，JSON中的原方法源码只是证据文本，不编译或执行原游戏。

```text
npm --prefix native-analysis-tools install --ignore-scripts
python direct_smash_optional_services_v9_fixture_20261118.py
```

期望5类检查、256状态组合通过；不是52的原生UI、内容加载、玩家/AI或游戏验收。
'''.encode()
for n in ['direct_smash_optional_services_v9_failure_read_20261118.py','direct_smash_optional_services_v9r2_repack_20261118.py','direct_smash_optional_services_v9r2_closure_prepare_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
with zipfile.ZipFile(b/'direct_smash_optional_services_v9_20261118.pyz')as z:
    for n in ['MANIFEST.json','__main__.py','tools/smash_optional_services_native_link_v9_20261118.py']:files['failed-v9-evidence/'+n]=z.read(n)
main='''from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-optional-services-v9r2-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v9r2-stage.json'))==json.loads((stage/'receipt.json').read_bytes())
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
packet=b/'direct_smash_optional_services_v9r2_closure_20261118.pyz';assert not packet.exists();compile(main,'optional-consumer-source-closure-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
