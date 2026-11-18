"""Publish v12 proof and untouched UI/task boundaries using the existing SHA-guarded publisher."""
from pathlib import Path
import json,hashlib,zipfile,datetime,ast
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';sha=lambda v:hashlib.sha256(v).hexdigest()
s=json.loads((b/'direct-smash-profile-write-v12-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-profile-write-v12-github-receipt-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and s['candidate_files']==218 and g['push_exit']==0 and g['remote_sha_matches']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-profile-write-v12-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
changed=sorted(set(status['changed_native_functions_from_original'])|{1756});assert len(changed)==14
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='profile_upload_consumers_v12_retired_pending_desktop_and_runtime',candidate='profile-write-v12-support-20261118/overlay + immutable_v11_base + two_profile_upload_call_retirements',remote_stage=s['stage'],candidate_files=218,manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],github_commit=g['commit'],local_assembly_recipe='profile-write-v12-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,profile_write_upload_consumers_retired=True,profile_write_runtime_verified=False,profile_write_mixed_signature_fixture_checks=3,previous_v11_function_bodies_preserved=138267,changed_native_functions_from_original=changed,unchanged_original_wasm_function_bodies=138229,next_runtime_candidate_root=s['stage']+'/candidate',reason='Retired only UserService1756 outbound full/delta upload calls1679/6414, preserving original local work and already-immediate event semantics. Real native snapshots remain persisted by existing guarded local-profile adapter.3ownmixed-signature fixtures/fullWasm static0/218SHA52/GitHub. No runtime, admission or task transition.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash v12退役原生档案上传消费者，本地保存待实机'
doc=(r/'profile-write-v12-support-20261118/overlay/LOCAL_PROFILE_WRITE.md').read_text(encoding='utf8')
note='\n\n'+marker+'\n\n'+doc.split('\n\n',1)[1]+f'\n\n真实52 stage {s["stage"]}全部218文件SHA核对，候选清单{s["candidate_manifest_sha256"]}，增量清单{s["manifest_sha256"]}。原任务整行/版本/暂停和3/5剩2台账保持。GitHub候选{g["commit"]}23blob/push0/ls-remote一致。此处218指候选文件数，不是测试数；3类自编fixture不包含任何原游戏函数执行。\n\n测试站2026-11-18T04:51:23Z直连仍A35completed/1review/45blocked/9queued/3failed。验收中心04:51:56Z共19项注意、6项归本组/本聊天：ThrottleRiot/Starblade/Dilan反馈平台侧抽取失败或无需改包；Blocky/OvO/Sushi仍为已有原始材料/交互缺口，原人工暂停不动，无新可接续项。本轮无新增待验收，Rusty/Craig额度和桌面恢复均无新回复。\n'
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_PROFILE_WRITE_V12.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：档案上传消费者已退役，v12未实机\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v12-stage.json':(b/'direct-smash-profile-write-v12-stage-receipt-20261118.json').read_bytes(),'evidence/v12-github.json':(b/'direct-smash-profile-write-v12-github-receipt-20261118.json').read_bytes(),'evidence/testsite-current.json':(b/'direct-a-testsite-current.json').read_bytes()}
for n in['smash_profile_write_fixture_v12_20261118.wat','smash_profile_write_fixture_v12_20261118.wasm','smash_profile_write_fixture_v12_retired_20261118.wasm','test_smash_profile_write_fixture_v12_20261118.cjs','smash-profile-write-fixture-result-v12-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/README.md']='# 自编上传消费者隔离复现\n\n运行 `node test_smash_profile_write_fixture_v12_20261118.cjs`。这里只实例化两份自编fixture Wasm，没有原游戏函数/资产；期望3类分支保持参数副作用、本地数据/基线与事件次数，上传入口未调用。不是52实机验证。\n'.encode()
files['tools/direct_smash_profile_write_v12_closure_prepare_20261118.py']=Path(__file__).read_bytes()
with zipfile.ZipFile(b/'direct_smash_local_transport_v11_closure_20261118.pyz')as z:main=z.read('__main__.py').decode()
tree=ast.parse(main);prior=next(x.value.value for x in ast.walk(tree)if isinstance(x,ast.Assign)and any(isinstance(t,ast.Name)and t.id=='note'for t in x.targets));assert repr(prior)in main
main=main.replace(repr(prior),repr(note),1).replace("'### 2026-11-18 Smash v11接入原生离线传输，实际游戏仍待验证'",repr(marker),1).replace('direct-smash-local-transport-v11-20261118','direct-smash-profile-write-v12-20261118').replace('evidence/v11-stage.json','evidence/v12-stage.json')
assert 'evidence/v11-stage.json'not in main and 'direct-smash-local-transport-v11-20261118'not in main
compile(main,'publish-v12-source-boundaries-only','exec');packet=b/'direct_smash_profile_write_v12_closure_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
