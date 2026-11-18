"""Publish actual auth-consumer sync/Git evidence and the unchanged runtime boundary."""
from pathlib import Path
import json,hashlib,zipfile,datetime,ast
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';sha=lambda v:hashlib.sha256(v).hexdigest()
s=json.loads((b/'direct-smash-auth-consumers-v13r2-stage-receipt-20261118.json').read_bytes());g=json.loads((b/'direct-smash-auth-consumers-v13r2-github-receipt-20261118.json').read_bytes())
assert s['complete']and s['job_unchanged']and not s['game_executed']and s['candidate_files']==219 and g['push_exit']==0 and g['remote_sha_matches']
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-auth-consumers-v13r2-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
changed=sorted(set(status['changed_native_functions_from_original'])|{101109,101103,101102});assert len(changed)==17
status.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='auth_startup_resume_consumers_v13r2_retired_pending_desktop_and_runtime',candidate='auth-consumers-v13r2-support-20261118/overlay + immutable_v12_base + actual_auth_consumers_only',remote_stage=s['stage'],candidate_files=219,manifest_sha256=s['manifest_sha256'],candidate_manifest_sha256=s['candidate_manifest_sha256'],github_commit=g['commit'],local_assembly_recipe='auth-consumers-v13r2-support-20261118/support/assembly-recipe.json',latest_candidate_game_executed=False,latest_candidate_runtime_verified=False,auth_startup_resume_consumers_retired=True,auth_consumers_runtime_verified=False,auth_consumers_fixture_checks=3,original_auth_base_singleton_preserved=True,previous_v12_function_bodies_preserved=138265,changed_native_functions_from_original=changed,unchanged_original_wasm_function_bodies=138226,next_runtime_candidate_root=s['stage']+'/candidate',all_sdk_retired=False,reason='Retired actual cached-Firebase identity setup and pause/focus cloud-data reset consumers, preserving real generic singleton base initialization and local focus bookkeeping; removed HTML SDK loading-statistics initialization consumer. Own fixture3/fullWasm static0/219SHA52/GitHub. No runtime, admission or task transition; remaining SDK paths are not claimed complete.')
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash v13r2退役认证启动/恢复消费者，原基类及本地档案保持'
doc=(r/'auth-consumers-v13r2-support-20261118/overlay/LOCAL_AUTH_CONSUMERS.md').read_text(encoding='utf8')
note='\n\n'+marker+'\n\n'+doc.split('\n\n',1)[1]+f'''\n\n准备阶段先纠正本地只读切片定位匹配到了脚本自身字符串的问题，再在v13语法检查把JSON-LD数据块误当JS时报错；没有上传/执行失败v13。失败准备材料保留，新不可变v13r2按script类型区分JSON-LD和JS，实际1个JSON数据块按JSON读取、2个内联JS语法exit0；v13r2完整原Wasm与失败准备阶段已静态通过的native字节精确一致，未因修正检查器改变native行为。没有重跑原游戏或重置试玩。

真实52 stage {s["stage"]}全部219文件SHA核对，候选清单{s["candidate_manifest_sha256"]}，增量清单{s["manifest_sha256"]}；原v7档案/v10内容/v11离线传输/v12上传退役保持，原任务整行/版本/暂停及3/5剩2保持。GitHub候选{g["commit"]}23blob/push0/ls-remote一致。219是候选文件数，3类为自编隔离检查，不是整款实机验证。

测试站2026-11-18T05:06:20Z直连仍A35completed/1review/45blocked/9queued/3failed，57未达；无本轮新增待验收。桌面恢复和Rusty/Craig追加额度均无新回复；没有调用界面、启动观察器、预留第4步或玩家输入。最后实际游戏仍v4蓝色加载，v5至v13r2未实机，不将原生离线接入实现称为完整菜单/房间/赛车/AI/比赛或持久化通过。B组、全部未授权暂停/跳过/Cow/采集与下游保持。\n'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_AUTH_CONSUMERS_V13R2.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：认证启动恢复消费者已退役，v13r2未实机\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'evidence/v13r2-stage.json':(b/'direct-smash-auth-consumers-v13r2-stage-receipt-20261118.json').read_bytes(),'evidence/v13r2-github.json':(b/'direct-smash-auth-consumers-v13r2-github-receipt-20261118.json').read_bytes(),'evidence/testsite-current.json':(b/'direct-a-testsite-current.json').read_bytes()}
for n in['smash_auth_consumer_fixture_v13_20261118.wat','smash_auth_consumer_fixture_v13_20261118.wasm','smash_auth_consumer_fixture_v13_retired_20261118.wasm','test_smash_auth_consumer_fixture_v13_20261118.cjs','smash-auth-consumer-fixture-result-v13-20261118.json']:files['fixture-workspace/'+n]=(b/n).read_bytes()
files['fixture-workspace/README.md']='# 自编认证消费者隔离复现\n\n运行 `node test_smash_auth_consumer_fixture_v13_20261118.cjs`。仅实例化本目录两个自编Wasm与mock，预期3类：原基类执行一次、pause/focus本地记录保持、不调用云认证恢复。没有原游戏函数/资产执行，不是52实机通过。\n'.encode()
files['tools/direct_smash_auth_consumers_v13r2_closure_prepare_20261118.py']=Path(__file__).read_bytes()
with zipfile.ZipFile(b/'direct_smash_profile_write_v12_closure_20261118.pyz')as z:main=z.read('__main__.py').decode()
tree=ast.parse(main);prior=next(x.value.value for x in ast.walk(tree)if isinstance(x,ast.Assign)and any(isinstance(t,ast.Name)and t.id=='note'for t in x.targets));assert repr(prior)in main
main=main.replace(repr(prior),repr(note),1).replace("'### 2026-11-18 Smash v12退役原生档案上传消费者，本地保存待实机'",repr(marker),1).replace('direct-smash-profile-write-v12-20261118','direct-smash-auth-consumers-v13r2-20261118').replace('evidence/v12-stage.json','evidence/v13r2-stage.json')
assert 'evidence/v12-stage.json'not in main and 'direct-smash-profile-write-v12-20261118'not in main
compile(main,'publish-v13r2-source-boundaries-only','exec');packet=b/'direct_smash_auth_consumers_v13r2_closure_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))
