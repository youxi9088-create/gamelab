"""Integrate genuine typed native profile storage; keep authentication and readiness unresolved."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys
from smash_profile_native_linker_20261118 import link
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'local-profile-v6r2-support-20261118';assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
fixture=json.loads((b/'smash-local-profile-fixture-result-20261118.json').read_bytes());link_fixture=json.loads((b/'smash-profile-linker-fixture-result-20261118.json').read_bytes())
assert fixture['passed']==14 and fixture['fixture_only']and not fixture['original_game_code_executed']and link_fixture['abi_mismatch_rejected']
source=(b/'direct_smash_telemetry_consumers_v4_prepare_20261118.py').read_text(encoding='utf8').split('runtime=json.loads')[0].replace(';assert not out.exists();out.mkdir()','')
ns={'__file__':str(b/'direct_smash_telemetry_consumers_v4_prepare_20261118.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'read-v3-immutable-bytes','exec'),ns)
v4=r/'telemetry-consumers-v4-support-20261118';v5=r/'local-settings-v5-support-20261118';old_recipe=json.loads((v5/'support/assembly-recipe.json').read_bytes());base_manifest=old_recipe['candidate_manifest']
def base(n):
    p=v5/'overlay'/n
    if p.exists():v=p.read_bytes()
    elif n=='Build/original.wasm':v=(v5/'local-settings-default-application-static-validation-only.wasm').read_bytes()
    else:
        p=v4/'overlay'/n;v=p.read_bytes()if p.exists()else ns['base'](n)
    assert sha(v)==base_manifest[n],n;return v
helper=(b/'smash_local_profile_bridge_20261118.wasm').read_bytes();targets={'metadata_init':599,'has_instance':1591,'get_instance':644,'serialize':1526,'deserialize':2114,'string_ctor':67864,'string_equal':633}
original=base('Build/original.wasm');wasm,proof=link(original,helper,targets);assert proof['original_defined_functions_unchanged']==138243 and len(proof['appended_function_indices'])==6
wp=out/'typed-local-profile-native-bridge-static-validation-only.wasm';wp.write_bytes(wasm)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
framework=base('Build/original.framework.js').decode();loader=base('Build/original.loader.js').decode()
assert 'Module["asm"]=exports;'in framework and 'Module["HEAPU16"]'in framework and 'Module["stackSave"]'in framework and 'Module["stackRestore"]'in framework and 'Module:l' in loader
html=base('index.html').decode();assert html.count('<head>')==1 and html.count('gameInstance = unityInstance;')==1
html=html.replace('<head>','<head><script src="local-profile.js"></script>',1).replace('gameInstance = unityInstance;','''gameInstance = unityInstance;
            window.GameLabLocalProfile.attach(unityInstance).then((controller) => {
              if (Array.isArray(unityInstance.Module.deinitializers)) unityInstance.Module.deinitializers.push(controller.stop);
            }).catch(window.GameLabLocalProfile.showFailure);''',1)
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(wasm)
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'))
profile['specification_v51']['sections']['system_design']=section_markdown('system_design','v6新增6个自编原生桥接函数及5个导出，不改v5任一原138243函数体。通过真实模块/ABI绑定原JSON序列化1526、两类数据的原泛型解析2114与MethodInfo，保留原UserData/UserDataReadOnly对象，不改币、奖励或解锁值。独立WebStorage版本档案及上一代备份、写后读回、Adler32误损坏检查与页面冲突拒绝；失败不清档、不假认证、不写原UserService.ready。原PlayerPrefs/Unity存档不动。14项自编隔离数据检查及链接器ABI拒绝通过，完整Wasm只静态校验，v6尚未52运行。')
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','历史v4第3步仍停蓝色加载页，目录加载与两类遥测退役已有实机证据；v5默认配置、v6本地存档桥尚未实机复验。累计3/5剩2，没有新增玩家操作。原平台认证与远端消费者、本地用户服务最终生命周期、离线房间/玩家/AI、核心玩法与刷新持久化仍待完成，不计待验收。')
doc='''# 原生用户数据本地档案适配 v6（未交付）

保留v5全部138243原函数体，只追加6个自编Wasm函数与4个自编导出。先用原HasInstance1591检查，不创建未就绪的用户服务，再读取原UserData及UserDataReadOnly。原SerializeObject1526和带原MethodInfo的DeserializeObject2114负责真实字段编码/恢复；原String.Ctor67864复制UTF16。桥接期间托管引用保留在线性影子栈，原Module.stackSave/Restore保证本次调用失败后恢复拥有的栈。两个对象均解析成功后才发布；原平台身份冲突会失败，不静默覆盖。不写ready、账号认证、奖励或提供者成功。

新增独立localStorage键gamelab.smash.local-profile.v1，不碰原PlayerPrefs、Unity IndexedDB存档或平台数据。完整双对象JSON原文和local:UUID一起写成一个版本信封；SHA绑定原metadata版本，Adler32仅检测误损坏，绝不等同认证或服务器签名。写前检查并发页面变更、保留上一份信封、写后读回。坏档/版本不符/空间不足/身份冲突显式失败，不清档、不回落新手默认值。首次真实保存成功后才发布原生对象。每5秒及pagehide/隐藏事件按真实对象快照同步保存，不重复写未变快照；停止/Unity退出时移除本适配器自己的监听和计时器。

隔离验证仅运行自编WAT、JS和自编测试数据：14项覆盖Unicode、误损坏、版本错误、存储失败、上一代保留、页面冲突、未变跳过、服务探测不创建实例、双对象类型恢复、第二对象失败不部分发布、身份冲突及就绪标志保持；链接器另验证旧自编函数字节保留与ABI不匹配拒绝。没有执行原游戏函数或使用原游戏存档作为本机测试数据。原完整Wasm仅做静态校验。

边界：v6未实机运行，真实浏览器持久化和新增错误提示界面未验收；仍未接通原用户服务最终生命周期/事件，未退役全部认证/数据库/广告/遥测消费者，未完成离线房间、玩家、AI和玩法。原ready保持是因为这些步骤尚未完成，不能用这份档案适配冒充整款转换。累计仍3/5剩2，不启动或接续原任务。
'''
files={'overlay/index.html':html.encode(),'overlay/local-profile.js':(b/'smash_local_profile_20261118.js').read_bytes(),'overlay/LOCAL_PROFILE_ADAPTATION.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（真实原生用户档案本地适配未复验）',profile).encode()}
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-settings-v5-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'link_proof':proof,'static_wasm_validation_exit':res.returncode,'fixture_only_checks':fixture['passed'],'original_game_executed':False,'game_executed':False,'ready_review':False,'local_profile_storage_integrated':True,'local_profile_runtime_verified':False,'user_service_ready_written':False,'authenticated_provider_result_fabricated':False,'local_room_player_ai_integrated':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode();files['support/own-native-bridge.wasm']=helper;files['support/own-native-bridge.wat']=(b/'smash_local_profile_bridge_20261118.wat').read_bytes()
for n in ['smash_local_profile_fixture_20261118.wat','smash_local_profile_fixture_20261118.wasm','smash_local_profile_linked_fixture_20261118.wasm','test_smash_local_profile_20261118.cjs','test_smash_profile_native_linker_20261118.py','smash-local-profile-fixture-result-20261118.json','smash-profile-linker-fixture-result-20261118.json']:
    files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in ['smash_profile_native_linker_20261118.py','direct_smash_local_profile_v6_prepare_20261118.py','direct_smash_local_profile_v6_stage_20261118.py']:
    files['tools/'+n]=(b/n).read_bytes()
files['source-proof/original-singleton-access.json']=(r/'analysis-20261118/local-save-singleton-access-source/original-settings-constant-source.json').read_bytes()
files['source-proof/original-storage-abi.json']=(r/'analysis-20261118/native-local-storage-contract-v2.json').read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_local_profile_v6r2_20261118.pyz';assert not packet.exists();main=(b/'direct_smash_local_profile_v6_stage_20261118.py').read_bytes();compile(main,'stage-native-profile-storage-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'packet':str(packet),'files':len(files),'candidate_files':len(candidate),'original_native_function_bodies_unchanged':138243,'appended_native_functions':6,'static_wasm_validation_exit':res.returncode,'own_fixture_checks':fixture['passed'],'game_executed':False}))
