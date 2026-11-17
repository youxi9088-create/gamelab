"""Assemble a small overlay against an immutable, fully archived resource candidate."""
from pathlib import Path
import json, hashlib, zipfile, sys, copy, datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
out=r/'startup-settings-v2-support-20261118';assert not out.exists()
sha=lambda raw:hashlib.sha256(raw).hexdigest()
base=r/'work-resource-localization-v1-markupfix-20261118'
base_receipt=json.loads((b/'direct-smash-resources-localized-v1-stage-receipt-20261118.json').read_bytes())
archive=json.loads((b/'direct-smash-resources-localized-v1-github-receipt-20261118.json').read_bytes())
assert archive['push_exit']==0 and archive['remote_sha_matches']
with zipfile.ZipFile(b/'direct_smash_resources_localized_v1_github_20261118.pyz')as z:
    base_manifest=json.loads(z.read('MANIFEST.json'))
    assert sha(z.read('MANIFEST.json'))==base_receipt['manifest_sha256']
base_candidate={n.removeprefix('candidate/'):h for n,h in base_manifest.items()if n.startswith('candidate/')}
assert len(base_candidate)==202
for n,h in base_candidate.items():assert sha((base/n).read_bytes())==h,n
original=r/'original-streaming-assets-20261118'
intake=json.loads((original/'intake.json').read_bytes());catalog_intake=json.loads((original/'catalog-intake.json').read_bytes())
assert intake['complete']and catalog_intake['local_matches_declared_remote']and all(x['complete']for x in catalog_intake['rows'])
settings=json.loads((original/'settings.json').read_bytes());assert len(settings['m_CatalogLocations'])==3
previous=settings['m_CatalogLocations'][0]['m_InternalId']
assert previous=='https://smashkartsgc.b-cdn.net/assetbundles/remote/webgl/catalog_2026.09.29.16.26.58.hash'
changed=copy.deepcopy(settings);changed['m_CatalogLocations'][0]['m_InternalId']='{UnityEngine.AddressableAssets.Addressables.RuntimePath}/catalog.hash'
files={}
def add(n,raw):assert n not in files;files[n]=raw
add('overlay/StreamingAssets/aa/settings.json',json.dumps(changed,ensure_ascii=False,separators=(',',':')).encode())
add('overlay/StreamingAssets/aa/catalog.json',(original/'catalog.json').read_bytes())
add('overlay/StreamingAssets/aa/catalog.hash',(original/'remote-catalog.hash').read_bytes())
for n in ['settings.json','catalog.json','remote-catalog.hash','intake.json','catalog-intake.json']:
    add('original/'+n,(original/n).read_bytes())
sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.game_specification_v51 import SECTIONS,section_markdown,document
profile=json.loads((base/'game-profile.json').read_bytes());sections=profile['specification_v51']['sections']
note='本修订按原metadata token、Wasm方法表和原入口HTML逐级确认StreamingAssets/aa/settings.json，原站启动配置、空初始目录及声明hash均HTTP200。初始目录Hash128与源hash一致，保留原目录字节；仅将settings中的远程hash指向同源RuntimePath/catalog.hash，其他设置/缓存键/禁用开关/SDK行为保持。它不同于后续桌面和移动目录，不替代游戏资源。尚未启动和实机观察。'
sections['system_design']=section_markdown('system_design',note+' 原Firebase账号/本地房间/玩家/AI尚未完成。')
sections['game_path']=section_markdown('game_path','保留v1全部原WASM/框架/loader与162bundle，补3个原启动配置/目录文件；未运行游戏，0/5原步数保持。')
assert set(sections)==set(SECTIONS)
add('overlay/game-profile.json',json.dumps(profile,ensure_ascii=False,indent=2).encode())
add('overlay/GAME_SPECIFICATION.md',document('Smash Karts（启动配置补齐未交付候选）',profile).encode())
add('overlay/README.md',(base/'README.md').read_bytes()+('\n\n## 启动配置补齐v2\n\n'+note+'\n\n完整候选205文件逐SHA；v1不可变基座见Git '+archive['commit']+'。本包仅包含增量及复现配方，不是假称完整游戏ZIP。52新candidate包含完整文件。原UI账本0/5保持；不得按候选修订重置。等待52解锁后，观察器candidate根改用D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/candidate，实时账本继续原v1/validation-resources-v1-20261118，勿用不可变observation-materials/初始台账覆盖。未知耗时、Token、费用沿原null，未入库/未接续/无下游。\n').encode())
candidate=dict(base_candidate)
for n,raw in files.items():
    if n.startswith('overlay/'):candidate[n.removeprefix('overlay/')]=sha(raw)
assert len(candidate)==205
changed_existing=[n for n,h in base_candidate.items()if candidate[n]!=h]
assert set(changed_existing)=={'game-profile.json','GAME_SPECIFICATION.md','README.md'}
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,ready_review=False,original_modified=False,base_git_commit=archive['commit'],base_git_scope=archive['scope'],base_manifest_sha256=base_receipt['manifest_sha256'],base_candidate_manifest=base_candidate,candidate_manifest=candidate,changed_existing_paths=changed_existing,new_runtime_paths=['StreamingAssets/aa/settings.json','StreamingAssets/aa/catalog.json','StreamingAssets/aa/catalog.hash'],settings_changes=[dict(path='m_CatalogLocations[0].m_InternalId',before=previous,after=changed['m_CatalogLocations'][0]['m_InternalId'])],startup_catalog_internal_ids=0,original_catalog_hash128=catalog_intake['catalog_hash128'],original_remote_hash=catalog_intake['declared_remote_hash'],actual_game_requests_observed=False,sdk_retired=False,local_gameplay_verified=False,ui_steps_used=0,ui_steps_remaining=5,limitations=['Original default SDK path source confirmed; actual startup call order and requests still require runtime observation.','No provider/account/ready flags or gameplay functions altered; local multiplayer replacement not supplied.','Pending52 manual unlock; no observer scheduled or started.'])
add('support/assembly-recipe.json',json.dumps(proof,ensure_ascii=False,indent=2).encode())
for n,path in [('original-path-method-bindings.json','streaming-path-bindings/original-path-method-bindings.json'),('original-path-implementation.json','streaming-path-implementation/original-settings-constant-source.json'),('original-sdk-streaming-path-source.json','streaming-paths/original-settings-constant-source.json')]:
    add('support/'+n,(r/'analysis-20261118'/path).read_bytes())
for n in ['direct_smash_streaming_path_bindings_20261118.py','direct_smash_streaming_settings_intake_20261118.py','direct_smash_initial_catalog_intake_20261118.py','direct_smash_startup_settings_prepare_20261118.py','direct_smash_startup_settings_stage_20261118.py','unity_hash128_spooky_v2_20261118.py']:
    add('tools/'+n,(b/n).read_bytes())
manifest=json.dumps({n:sha(raw)for n,raw in files.items()},sort_keys=True,indent=2).encode()
out.mkdir()
for n,raw in files.items():
    p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
target=b/'direct_smash_startup_settings_v2_20261118.pyz';assert not target.exists()
main=(b/'direct_smash_startup_settings_stage_20261118.py').read_bytes();compile(main,'remote-stage-no-game','exec')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,raw in files.items():z.writestr(n,raw)
print(json.dumps(dict(packet=str(target),files=len(files),packet_bytes=target.stat().st_size,candidate_files=len(candidate),manifest_sha256=sha(manifest),game_executed=False,ready_review=False)))
