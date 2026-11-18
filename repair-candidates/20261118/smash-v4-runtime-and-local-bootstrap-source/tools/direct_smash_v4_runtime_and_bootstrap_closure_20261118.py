"""Publish the genuine third startup result and newly recovered source, without task promotion."""
from pathlib import Path
import json,hashlib,zipfile,datetime,sys
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
outcome=json.loads((b/'direct-smash-step3-outcome-20261118.json').read_bytes());observed=json.loads((b/'direct-smash-step3-post-cleanup-evidence-20261118.json').read_bytes())
assert outcome['complete']and outcome['game_executed']and not outcome['ready_review']and outcome['ui_steps_used']==3 and outcome['ui_steps_remaining']==2
assert not observed['server_live']and observed['event_count']==outcome['events']==40 and observed['event_sequence']['unique']and observed['event_sequence']['set_complete']
assert not outcome['owned_observer_cleanup']['pid_exists']and outcome['owned_observer_cleanup']['port_listeners']==0
contract=json.loads((a/'local-profile-constructors/original-local-bootstrap-contract-v2.json').read_bytes());assert contract['exact_generic_settings_contract_verified']and not contract['game_executed']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-v4-runtime-step3-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==2
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='v4_telemetry_consumer_retirement_runtime_verified_local_lifecycle_pending',ui_steps_used=3,ui_steps_remaining=2,last_observed_ui_steps_used=3,last_runtime_observed_revision='telemetry-consumers-v4-20261118',latest_candidate_game_executed=True,latest_candidate_runtime_verified=False,runtime_verified=False,game_executed=True,native_resource_catalog_runtime_verified=True,observed_bytebrew_startup_consumer_removed=True,firebase_analytics_startup_consumers_removed=True,observer_process_running=False,observer_task_registered=True,last_observation_subdirectory='observation-v4',observation_materials_stage=status['remote_stage']+'/native-observation-v4',validation_blocker='Actual52 v4 third startup: blue loading splash remains; Firebase anonymous signup fails auth/network-request-failed under offline CSP. OriginalUnity telemetry/newbadwords request still external. No menu/core/player/localroom/AI proven. Native localsettings application and profile constructors recovered as source only; lifecycle not integrated.',reason='Forty complete unique runtime events: original five config/catalog resources200; observedByteBrew initialization and FirebaseAnalytics startup traffic absent. Local configuration application now readable: two Dictionary<string,object> inputs, real GameSettingsData constructor/application/event transaction. Localprofile constructors/defaults exist but finalizer still ties identity/cloud writes. No fakeprovider/ready, no promotion or repeated game navigation.',local_bootstrap_source_contract='analysis-20261118/local-profile-constructors/original-local-bootstrap-contract-v2.json')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash第3步v4遥测实测与原生本地初始化源码补齐'
note=f'''

{marker}

用户已确认52前台并停止手动操作。本轮通过computer-use正常52Chrome导航v4一次（第3步，累计3/5剩2），没有沿用旧授权、重置额度、重复Enter或刷新；未操作97、远端Codex、终端或安全设置。新截图确认原蓝色Smash加载页，未进入菜单或对局，不计新增待验收。

真实观察共40条完整唯一连续序号事件：5份启动配置/实际游戏目录及.hash继续200，原Invalid path仍消失。ByteBrew初始化请求/错误、Firebase Analytics模块和启动跟踪不再出现，证明v4已删除的消费者在本次原生启动生效；这不代表所有SDK已退役。实际剩余Firebase匿名认证auth/network-request-failed及identitytoolkit signup被同源CSP阻断，Unity原生遥测和newbadwords.txt仍外联。无假UID、provider成功、ready/奖励赋值或清存档。

正常Ctrl+W只关闭本次游戏页；专属GameLabDirectSmashNativeObserveV420261118已停止，真实PID9232不存在、57602监听0，旧任务无周期触发。候选205文件后验SHA与清单{outcome['candidate_manifest_sha256']}完全一致。远端通过正常work-log幂等记录实测，原任务blocked/round3/versionnull整行及暂停保持，没有上传入库、接续或改待验收。

两段此前WABT decompile无法生成可读源的原函数26015/43610已静态转译为C，分别503769/219733字节；完整生成C仅作本机分析，不编译、不运行、不作为游戏运行包。移交压缩到两段原函数源及各自原body/SHA，其他分析切片占位体不可运行。原metadata31方法记录含returnParameterToken，parameterStart在+16而非+12；首次类型读取断言发生于结果文件写入前，修正后11个方法参数与原定义恢复，没有修改metadata。泛型原生表进一步确认26015两个参数均Dictionary<string,object>。

原26015先建立空字典，两个覆盖字典均空引用时仍进入真实应用事务：分配原GameSettingsData，调用构造43254、应用原字段，再设置其自身ready21、完成余下字段与原事件2227；不能拿直接ready赋值替代整段。原UserService17870调用25900/43206和43161/43198建立UserData及UserDataReadOnly默认实例，但不设置ready80。后续12572仍校验身份/读回并含远端写入，不能直接当本地生命周期入口。这里是原始默认值/原生数据契约的源码证明，不冒充远端实时配置、持久化、本地身份、玩家/房间/AI实现。

V5.1实测补充同步发布到独立证据目录，原运行候选与历史规格不覆盖。独占处理时间/输入/缓存/输出Token及费用未知继续null。测试站直连2026-11-18T01:16:15Z，A93仍35completed/1review/45blocked/9queued/3failed，57未达到目标；全量材料此前复核无变化，不重跑相同库存或403/404请求。B组、人工暂停、用户跳过/取消、Cow与采集均保持。下一步应接通真实本地配置应用及持久化用户生命周期，具备因果修复后才用剩2步；多次受阻按原目标换到其他有实际输入的A任务。目标未完成。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_V4_RUNTIME_AND_BOOTSTRAP.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：v4已实测，认证与本地生命周期仍阻断\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads((r/'telemetry-consumers-v4-support-20261118/overlay/game-profile.json').read_bytes())
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','真实52第3步启动v4，原生WASM/框架/数据与5份启动配置及游戏目录文件实际200，原路径拒绝不再出现。仍停留蓝色加载页，真实Firebase匿名认证失败；菜单、角色、对局、AI及核心操作尚未验证。累计3/5剩2，失败/部分通过都保留历史。')
profile['specification_v51']['sections']['system_design']=section_markdown('system_design','原目录URI解析和ByteBrew/Firebase Analytics启动消费者退役已于52本次启动验证。原GameSettingsService完整应用函数及UserData/ReadOnly构造和默认初始化已恢复可读源码，未执行这些分析代码；本地配置/存档/房间生命周期尚未集成。未以provider桩、假UID、ready赋值或奖励成功替代实际逻辑。')
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'GAME_SPECIFICATION_RUNTIME_EVIDENCE.md':document('Smash Karts（v4第3步实测补充，未交付）',profile).encode(),'game-profile-runtime-evidence.json':json.dumps(profile,ensure_ascii=False,indent=2).encode()}
for n in ['direct-smash-step3-reservation-20261118.json','direct-smash-step3-outcome-20261118.json','direct-smash-step3-post-cleanup-evidence-20261118.json','direct-smash-observer-v4-launch-20261118.json','direct-a-testsite-current.json']:
    files['evidence/'+n]=(b/n).read_bytes()
for n in ['complex-bootstrap-c-source/original-complex-c-source.json','local-profile-constructor-source/original-settings-constant-source.json','local-profile-constructors/original-profile-method-map.json','local-profile-constructors/original-local-bootstrap-signatures.json','local-profile-constructors/original-local-bootstrap-contract-v2.json']:
    files['source-proof/'+n]=(a/n).read_bytes()
for n in ['direct_smash_observer_v4_prepare_20261118.py','direct_smash_reserve_third_step_20261118.py','direct_smash_observation_v4_read_20261118.py','direct_smash_step3_finish_20261118.py','direct_smash_local_profile_constructor_map_20261118.py','direct_smash_local_bootstrap_signatures_20261118.py','direct_smash_complex_bootstrap_c_source_20261118.py','direct_smash_complex_c_extract_resume_20261118.py','direct_smash_local_bootstrap_contract_v2_20261118.py','direct_smash_v4_runtime_and_bootstrap_closure_20261118.py']:
    files['tools/'+n]=(b/n).read_bytes()
main='''from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118');target=stage/'runtime-bootstrap-closure';target.mkdir(exist_ok=True)
candidate_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();candidate=json.loads(candidate_raw)
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2 and ledger['steps'][-1]['status']=='observed_partial'
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
    expected=json.loads(z.read('evidence/direct-smash-step3-outcome-20261118.json'));actual=json.loads((e/'observation-v4/step3-outcome.json').read_bytes());assert expected==actual
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',raw_manifest)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note=__NOTE__
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(manifest),'candidate_files_post_runtime_sha_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'prior_runtime_game_executed':True,'sync_scope':'Publication of existing genuine runtime and source evidence only; no new player input or task promotion','ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
compile(main,'publish-v4-runtime-and-source-only','exec');packet=b/'direct_smash_v4_runtime_and_bootstrap_closure_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'new_player_inputs':0,'ui_steps_used':3,'ui_steps_remaining':2}))
