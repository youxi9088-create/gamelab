"""Persist the real two-step runtime result and exact follow-up state, without replay."""
from pathlib import Path
import json,hashlib,zipfile,datetime,sys
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
stage=json.loads((b/'direct-smash-runtime-uri-v3-stage-receipt-20261118.json').read_bytes());git=json.loads((b/'direct-smash-runtime-uri-v3-github-receipt-20261118.json').read_bytes());runtime=json.loads((b/'direct-smash-step2-outcome-20261118.json').read_bytes());last=json.loads((b/'direct-smash-step2-final-observation-20261118.json').read_bytes())
assert stage['complete']and git['push_exit']==0 and git['remote_sha_matches']and runtime['game_executed']and not runtime['ready_review']and runtime['ui_steps_used']==2 and runtime['ui_steps_remaining']==3
assert not runtime['owned_observer_cleanup']['pid_exists']and runtime['owned_observer_cleanup']['port_listeners']==0
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-runtime-uri-v3-validation-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes())
recipe=json.loads((r/'runtime-uri-v3-support-20261118/support/assembly-recipe.json').read_bytes())
v2=r/'startup-settings-v2-support-20261118/overlay';v1=r/'work-resource-localization-v1-markupfix-20261118';support=r/'runtime-uri-v3-support-20261118'
size=0
for row in recipe['copies']:
    n=row['target'];overlay=support/'overlay'/n
    if overlay.is_file():size+=overlay.stat().st_size
    elif n=='Build/original.wasm':size+=(support/'native-uri-resolver-full-validation-only.wasm').stat().st_size
    else:
        src=v2/row['source']
        if not src.exists():src=v1/row['source']
        size+=src.stat().st_size
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='native_catalog_uri_runtime_verified_sdk_bootstrap_pending',candidate='runtime-uri-v3-support-20261118/overlay + immutable_v2_base + verified_native_patches',remote_stage=stage['stage'],manifest_sha256=stage['manifest_sha256'],candidate_manifest_sha256=stage['candidate_manifest_sha256'],candidate_files=205,candidate_bytes=size,ui_steps_used=2,ui_steps_remaining=3,ready_review=False,runtime_verified=False,game_executed=True,sdk_retired=False,original_wasm_unchanged=False,changed_native_function=35469,original_native_resolver_called=26827,unchanged_other_wasm_function_bodies=138242,github_commit=git['commit'],local_assembly_recipe='runtime-uri-v3-support-20261118/support/assembly-recipe.json',native_resource_catalog_runtime_verified=True,observer_process_started=True,observer_process_running=False,observer_task_registered=True,observation_materials_stage=stage['stage']+'/native-observation-v3',runtime_observation_candidate_root=stage['stage']+'/candidate',runtime_observation_live_evidence_root=status['base_resources_stage']+'/validation-resources-v1-20261118',last_observation_subdirectory='observation-v3',validation_blocker='52 unlocked and user input conflict resolved. Actual v3 native startup stays at blueSmash loading splash after initialcatalog/gamecatalog+hash200; originalFirebase authentication/database/analytics andUnity/ByteBrew network failures remain. Exact next localbootstrap cause must be traced; no menu/core/localroom/player/AI proven.',reason='Real firststartup exposed relative catalog URI rejection. Repaired single native getter by invoking originalUnity ResolveInternalId and portable RuntimePath. Real secondstartup proves all5 startup/gamecatalog/hash200 and no InvalidPath;51 complete events. Not a completed offline game. Used2/5, remaining3, original task/history/pause preserved. Both owned observer tasks stopped; no global process termination.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash真实两步启动与原生URI因果修复'
note=f'''\n\n{marker}

用户本轮确认52解锁，并在界面持续输入/52与97遮挡后确认停止手动操作，随后实际恢复52Chrome。未操作97、Codex应用或系统安全设置；前置打开浏览器、恢复RDP视口不冒充游戏步骤。原0/5未用旧Level Devil授权或重置；两次实际导航分别登记step1/step2，累计2/5剩3。Chrome立即截图有异步滞后，之后新截图与实际HTTP事件闭合，不因即时画面未变重复Enter。

首个观察服务PID35408真实启动/__diagnostic200后，SSH命令结束即进程不存在、端口10061；未把观察超时当终止，另查Get-Process和监听后才用独立一次专属SYSTEM计划任务恢复，旧回执保留。PID38476观察v2真实第1步：原WASM/框架/桌面数据和3份StreamingAssets启动配置实际加载；59唯一连续事件按seq集合核对（HTTP并发到达顺序不是丢失）。原TextDataProvider明确拒绝相对游戏目录，实际未请求该目录，首次因果缺口已定位。Firebase、Unity与ByteBrew外联仍真实存在，CSP阻断并非已退役。未绕过权限或原生站点授权。

v3仅改源格式57字节RVA前缀为{{UnityEngine.AddressableAssets.Addressables.RuntimePath}}/。原getter35469末尾追加调用原ResolveInternalId26827，原138243函数中其他138242函数体逐SHA一致，完整Wasm经wabt静态校验exit0、不是执行原游戏。原ContentCatalogData.CreateLocator12681源码本来就调用26827解析目录内每条ID，因此两原游戏目录各83项同用原运行时属性，原162bundle逐SHA不变，移至StreamingAssets/aa；目录.hash按实际新内容重算，其他校验/玩法/SDK/账号标志未动。不绑定端口/localhost，不用假provider成功。

真实52 {stage['stage']}/candidate完整205文件逐SHA；候选清单{stage['candidate_manifest_sha256']}，增量清单{stage['manifest_sha256']}，GitHub {git['commit']}已23blob核对/push0/ls-remote一致。原v1/v2与失败首轮保留，用户历史任务整行/版本/人工暂停不改、不安装/接续/入库或供货。

第2步v3真实启动ResourceTiming核对5份HTTP200：settings.json、初始catalog.json/.hash、catalog_2026.09.29.17.09.42.json/.hash；此前Invalid path消失，单getter因果修复已生效。51条实际事件完整唯一连续，无bufferfull，不把有序性误判丢包。仍为蓝色加载页，未进菜单/核心对局，未观察bundle请求或本地玩家/AI；真实Firebase认证/数据库/analytics、Unity与ByteBrew等外联失败继续保留，不能以消失一个错误宣称完整转换。桌面版实证不冒充移动版/全地图通过。

两轮都通过正常Ctrl+W关闭本次游戏页，最后专属v3任务停止、PID11660实际不存在、57602监听0；旧任务Ready且未设周期触发，未全局关闭其他Chrome/Python。未知独占处理时间/Token/缓存/费用null，源V5.1不可变候选之外新增实测补充，不覆盖历史规格。最新测试站北京时间08:47直连A93仍35completed/1review/45blocked/9queued/3failed，57未达目标、暂无新增待验收。

下一步保留剩3步，先沿本次真实Firebase/SDK初始化栈和原服务门禁源码定位本地初始化缺口。不要重复首轮URI失败策略或盲赋ready/账号/奖励；支持包存在、URI局部修复及菜单外壳均不等于整款待验收。52锁屏阻断已解除，不再要求解锁或把旧授权重用；Little Alchemy v3/跑酷SDKv2各自额外5步问题仍待答，其他实际暂停、B组、跳过/取消均保持。全A目标active，本轮有真实运行证据和修复，不标完成或再次以旧锁屏为由blocked。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_NATIVE_URI_VERIFIED.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：目录URI实机修复生效，SDK与本地初始化仍待完成\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads((support/'overlay/game-profile.json').read_bytes());profile['specification_v51']['sections']['game_path']=section_markdown('game_path','真实52第1步加载原WASM/框架/数据及初始目录，游戏目录相对URI被拒绝；v3修复后第2步5份启动/游戏目录文件全部HTTP200，拒绝路径错误消失。仍停在蓝色加载页，未进入原菜单和核心对局。累计2/5剩3，未重复刷新。')
profile['specification_v51']['sections']['monetization']=section_markdown('monetization','实际首屏仍有App Store、Google Play、Discord推广入口，未点击，尚未退役；原Firebase、Unity和ByteBrew外联被同源CSP阻断，并非已完成SDK退役。没有广告奖励、支付、账号或提供者成功伪造。')
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'GAME_SPECIFICATION_RUNTIME_EVIDENCE.md':document('Smash Karts（两步实测补充，未交付）',profile).encode(),'game-profile-runtime-evidence.json':json.dumps(profile,ensure_ascii=False,indent=2).encode()}
for n in ['direct-smash-step1-outcome-20261118.json','direct-smash-step2-outcome-20261118.json','direct-smash-step1-final-observation-20261118.json','direct-smash-step2-final-observation-20261118.json','direct-smash-runtime-uri-v3-stage-receipt-20261118.json','direct-smash-runtime-uri-v3-github-receipt-20261118.json','direct-smash-observer-v3-launch-receipt-20261118.json']:
    files['evidence/'+n]=(b/n).read_bytes()
for n in ['direct_smash_validation_readiness_20261118.py','direct_smash_validation_launch_prepare_20261118.py','direct_smash_observer_v2_root_prepare_20261118.py','direct_smash_observation_server_startup_v2_20261118.py','direct_smash_observer_persistent_20261118.py','direct_smash_observation_read_20261118.py','direct_smash_reserve_first_step_20261118.py','direct_smash_step1_finish_20261118.py','direct_smash_observer_v3_prepare_20261118.py','direct_smash_reserve_second_step_20261118.py','direct_smash_step2_finish_20261118.py','direct_smash_runtime_uri_validation_closure_20261118.py']:
    files['tools/'+n]=(b/n).read_bytes()
main='''from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
s=Path('D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118');target=s/'runtime-validation-closure';target.mkdir(exist_ok=True)
candidate_raw=(s/'CANDIDATE_MANIFEST.json').read_bytes();candidate_manifest=json.loads(candidate_raw)
for n,h in candidate_manifest.items():assert hashlib.sha256((s/'candidate'/n).read_bytes()).hexdigest()==h,n
parent=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger=json.loads((parent/'ui-ledger.json').read_bytes());assert ledger['used']==2 and ledger['remaining']==3 and ledger['steps'][-1]['status']=='observed_partial'
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',raw_manifest)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note=__NOTE__
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(manifest),'candidate_files_post_runtime_sha_verified':len(candidate_manifest),'coordination_appended':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'prior_runtime_game_executed':True,'sync_scope':'Evidence/material publication only; actual earlier game runs are recorded inside evidence','ready_review':False,'ui_steps_used':2,'ui_steps_remaining':3,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
compile(main,'publish-two-step-runtime-evidence-only','exec');packet=b/'direct_smash_runtime_uri_validation_closure_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'candidate_bytes':size,'prior_game_executed':True,'new_game_execution':False,'ui_steps_used':2,'ui_steps_remaining':3}))
