"""Complete the real local user-data transaction and retire exact automatic auth consumers."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys,re
from smash_profile_native_linker_20261118 import link,bodies,sections,exports
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'local-user-v7-support-20261118';assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
fixture=json.loads((b/'smash-local-profile-fixture-result-20261118.json').read_bytes());assert fixture['passed']==17 and fixture['fixture_only']and not fixture['original_game_code_executed']
contract=json.loads((r/'analysis-20261118/native-local-user-completion-contract.json').read_bytes());assert contract['completion_event']['original_shared_function_index']==2404 and contract['completion_event']['generic_arguments'][0]['name']=='bool'
# Reuse the immutable v5 material reader, without rerunning any preparation or test.
src=(b/'direct_smash_local_profile_v6_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('source=(b/'):src.index('helper=(b/')]
reader={'b':b,'r':r,'sha':sha,'json':json,'contextlib':contextlib,'io':io};exec(compile(src,'read-immutable-v5-materials','exec'),reader)
v6=r/'local-profile-v6r2-support-20261118';base_recipe=json.loads((v6/'support/assembly-recipe.json').read_bytes());base_manifest=base_recipe['candidate_manifest']
def base(n):
    p=v6/'overlay'/n
    if p.exists():v=p.read_bytes()
    elif n=='Build/original.wasm':v=(v6/'typed-local-profile-native-bridge-static-validation-only.wasm').read_bytes()
    else:v=reader['base'](n)
    assert sha(v)==base_manifest[n],n;return v
native_base=reader['base']('Build/original.wasm');helper=(b/'smash_local_profile_bridge_20261118.wasm').read_bytes();targets={'metadata_init':599,'has_instance':1591,'get_instance':644,'serialize':1526,'deserialize':2114,'string_ctor':67864,'string_equal':633,'set_user_ready':46621,'invoke_user_changed':2404}
wasm,proof=link(native_base,helper,targets);assert len(proof['appended_function_indices'])==7
old=base('Build/original.wasm');old_bodies=bodies(old,sections(old));new_bodies=bodies(wasm,sections(wasm));assert len(old_bodies)==138249 and new_bodies[:len(old_bodies)]==old_bodies and len(new_bodies)==len(old_bodies)+1
old_exports=exports(old,sections(old));new_exports=exports(wasm,sections(wasm));assert all(x in new_exports for x in old_exports);assert len(new_exports)==len(old_exports)+1
wp=out/'local-user-completion-static-validation-only.wasm';wp.write_bytes(wasm)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
auth=base('scripts/auth.js');text=auth.decode();needle='window.addEventListener("load",function(){if(console.log("Init Auth"),typeof firebase';assert text.count(needle)==1;start=text.index(needle);retired_listener=text[start:];assert 'firebase.auth().onAuthStateChanged(onAuthStateChanged)'in retired_listener and retired_listener.endswith('},!1)')
auth_new=text[:start].encode();assert auth_new==auth[:start]and 'function signInAnonymously()'in auth_new.decode()
html=base('index.html').decode();retired_html=[]
for caller in['addCrazyGamesAuthListener();','requestCrazyGamesUserToken();']:
    assert html.count(caller)==1;retired_html.append(caller);html=html.replace(caller,'')
assert 'firebase.initializeApp(firebaseConfig);'in html and 'window.CrazyGames.SDK.init()'in html
profile_json=(b/'smash_local_profile_20261118.js').read_bytes();assert b'bridge.complete(value.localId)'in profile_json and b'value = payload({...value, ...bridge.snapshot()}); disk.commit(value);'in profile_json
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(wasm)
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'))
profile['specification_v51']['sections']['system_design']=section_markdown('system_design','v7在真实本地信封写入/读回、原生双类型恢复、身份核对及原生归一快照再次保存后，调用原UserService数据就绪设置和原UnityEvent<bool>数据变化事件；不是认证成功回调，不写平台认证/权限旗标。新入口幂等，失败不发完成事件，原v6r2全部138249函数体保持，只追加1个本地事务函数/导出。退役auth.js页面load自动登录注册、HTML平台认证监听及Unity加载后的令牌请求3个启动消费者；原SDK提供者函数及其它消费者仍真实保留，尚非全SDK退役。17项自编隔离检查通过，完整Wasm只静态校验，v7尚未52运行。')
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','当前实际证据仍是v4第3步蓝色加载页及认证失败；v5默认配置、v6r2档案与v7本地用户事务/认证启动消费者退役均未实机复验。累计3/5剩2，无新增玩家操作。Ftue/News/CrossPromo/GameData服务来源、剩余认证/云端消费者、离线房间/玩家/AI和核心玩法未完成，不计待验收。')
doc='''# 本地用户数据事务 v7（未交付）

先完成本地档案存储和原生UserData/UserDataReadOnly类型恢复，再保存原生归一化快照、读回核对。仅这些实际步骤都成功时，调用原UserService.gxx46621的数据就绪设置，并发出原UnityEvent<bool>.Invoke2404数据变化事件。两者由原源码/metadata泛型实参核对，不是Firebase认证成功、平台权限或下载回调。只读身份不符、坏档、类型恢复或保存失败都不完成；重复完成不重复发事件。原平台认证旗标与任务/验收状态不改。

相对v6r2全部138249函数体和原导出保持，只追加1个自编完成事务函数及1导出；从v5计为7个自编函数/6个导出，完整Wasm静态校验通过。原认证提供者函数不替换成空桩/成功桩；只从auth.js移除实际页面load自动登录注册，从HTML移除平台认证监听和Unity加载后令牌请求这三个启动调用。原Firebase/平台模块及其它消费者还保留，不能宣称全部网络或SDK已退役。

17项自编隔离检查验证保存/类型恢复失败不完成、错误身份不完成、完成时数据已保存且原生对象有效、邻近状态字段不改、事件只发一次；同时保留旧档/并发/校验/栈恢复等检查。没有在开发机执行原游戏函数。真实浏览器存档/新提示/完整启动尚未验证，剩余服务数据、云端消费者、离线房间/玩家/AI及玩法仍未完成。累计3/5剩2。
'''
files={'overlay/index.html':html.encode(),'overlay/scripts/auth.js':auth_new,'overlay/local-profile.js':profile_json,'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（本地用户事务与认证启动消费者退役未复验）',profile).encode(),'overlay/LOCAL_USER_LIFECYCLE.md':doc.encode()}
# Correct the prior descriptive export-count typo while updating this implementation note.
files['overlay/LOCAL_PROFILE_ADAPTATION.md']=doc.encode()+b'\n'+base('LOCAL_PROFILE_ADAPTATION.md').replace('只追加6个自编Wasm函数与4个自编导出'.encode(),'从v5追加7个自编Wasm函数与6个自编导出'.encode())
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
retirement={'auth_before_sha256':sha(auth),'auth_after_sha256':sha(auth_new),'preserved_prefix_bytes':len(auth_new),'removed_auth_load_registration':retired_listener,'removed_html_startup_callers':retired_html,'provider_functions_replaced':False,'authenticated_success_callbacks_invoked':False}
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-profile-v6r2-20261118','native_base_stage':'D:/GameLab/temp/direct-smash-local-settings-v5-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'native_link_proof':proof,'previous_all_function_bodies_preserved':len(old_bodies),'static_wasm_validation_exit':res.returncode,'fixture_only_checks':17,'startup_consumer_retirement':retirement,'game_executed':False,'ready_review':False,'local_user_completion_integrated':True,'local_user_completion_runtime_verified':False,'authentication_permission_flags_written':False,'original_data_ready_setter_called_after_verified_transaction':True,'all_sdk_retired':False,'local_room_player_ai_integrated':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode();files['support/own-native-bridge.wasm']=helper;files['support/own-native-bridge.wat']=(b/'smash_local_profile_bridge_20261118.wat').read_bytes();files['support/native-local-user-completion-contract.json']=(r/'analysis-20261118/native-local-user-completion-contract.json').read_bytes()
for n in ['smash_local_profile_20261118.js','smash_local_profile_fixture_20261118.wat','smash_local_profile_fixture_20261118.wasm','smash_local_profile_linked_fixture_20261118.wasm','test_smash_local_profile_20261118.cjs','test_smash_profile_native_linker_20261118.py','smash-local-profile-fixture-result-20261118.json','smash-profile-linker-fixture-result-20261118.json']:
    files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in ['smash_profile_native_linker_20261118.py','direct_smash_local_user_completion_contract_20261118.py','direct_smash_local_user_v7_prepare_20261118.py','direct_smash_local_user_v7_stage_20261118.py']:
    files['tools/'+n]=(b/n).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_local_user_v7_20261118.pyz';assert not packet.exists();main=(b/'direct_smash_local_user_v7_stage_20261118.py').read_bytes();compile(main,'stage-local-user-transaction-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'packet':str(packet),'files':len(files),'candidate_files':len(candidate),'previous_function_bodies_preserved':len(old_bodies),'new_completion_function':1,'static_wasm_validation_exit':res.returncode,'isolated_own_checks':17,'game_executed':False}))
