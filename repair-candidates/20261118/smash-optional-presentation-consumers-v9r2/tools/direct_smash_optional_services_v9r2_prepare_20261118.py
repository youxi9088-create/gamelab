"""Prepare a narrow optional-presentation retirement while preserving original gameplay."""
from pathlib import Path
import json,hashlib,contextlib,io,zipfile,subprocess,datetime,sys
from smash_optional_services_native_link_v9_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'optional-services-v9r2-support-20261118';assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
# Immutable v7 reader from the prior preparation, without running its mutation/preparation code.
src=(b/'direct_smash_ftue_v8_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('helper=(b/')]
ns={'b':b,'r':r,'json':json,'sha':sha,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v7-reader','exec'),ns)
v8=r/'local-ftue-v8-support-20261118';recipe8=json.loads((v8/'support/assembly-recipe.json').read_bytes());manifest8=recipe8['candidate_manifest']
def base(n):
    p=v8/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v8/'original-tutorial-local-url-static-validation-only.wasm').read_bytes()
    else:raw=ns['base'](n)
    assert sha(raw)==manifest8[n],n;return raw
contract=json.loads((r/'analysis-20261118/optional-panels-source/original-retirement-contract.json').read_bytes())
fixture=json.loads((b/'smash-optional-services-fixture-result-v9-20261118.json').read_bytes());assert fixture['passed']==5 and fixture['core_dependency_state_cases']==256 and fixture['fixture_only']and not fixture['original_game_code_executed']
helper=(b/'smash_optional_services_v9_20261118.wasm').read_bytes();native,proof=assemble(base('Build/original.wasm'),helper,contract);assert proof['previous_function_bodies_total']==138251
wp=out/'optional-consumer-retirement-static-validation-only.wasm';wp.write_bytes(native)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
doc='''# 资讯及交叉推广消费者退役 v9（未实机、未交付）

依据原SKServicesLoader、News/CrossPromo及相关面板78个方法映射/76个原函数体，原资讯与推广服务参与启动门禁，并在主菜单中注册数据事件。v9将这两项在线展示从启动依赖中退役：只在原loader104933中去掉实际43380/43675请求调用，保留真实服务、提供者和事件函数；原调用的两个已求值参数被丢弃，没有伪造服务结果、空JSON、认证成功或ready。

原eum10272/eun6443改为本地核心依赖检查：原GameSettings.ready21、实际持久化用户.ready80、原下载并解析Ftue.ready20都仍必须满足。GameData阶段继续读取原10177对真实数据集合的完整性判断，以及原loading140，不造数据、不放宽核心条件。仅移除已退役News/CrossPromo的展示前置依赖，不修改任务/交付验收门禁。

CrossPromoPanel107124、NewsAndFriendsPanel105877和NewsPanel105867的Start调用原Component.get_gameObject637及GameObject.SetActive630，隐藏实际在线资讯/好友/媒体及推广组件，不保留空壳交互按钮。原服务callback、就绪状态、付费、奖励和权限不改。已有退出清理函数及原元数据/资源保持。是否有其他路径重新激活组件、渲染排版和剩余SDK消费仍须实机观察，不宣称全部退役。

相对v8仅6个上述原消费者变化，其余138245函数体保持；新增4个自编函数/3导出，从v5共12函数/10导出。完整Wasm静态校验通过；自编fixture5类检查覆盖256组核心服务与GameData状态，不写服务数据字节，缺失/未就绪仍阻断，真实GameData检查和加载中状态保持，原组件接口仅隐藏目标面板。没有在开发机执行原游戏函数或数据。

v9尚未52实机，最后实际运行仍v4蓝色加载页，累计3/5剩2。桌面GetCursorPos访问拒绝和Windows密码页尚待恢复。原GameData本地内容加载、其他云端/SDK消费者、离线房间/玩家/AI、核心玩法及持久化复验尚未完成，不计待验收；耗时、Token、费用无可信独占记录时为null。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','v9将在线资讯和推广的启动调用、加载依赖及三个实际面板入口一并退役，真实设置、用户、Ftue和GameData数据要求保留。当前仅自编隔离及原Wasm静态验证；最后实机v4仍蓝色加载，3/5剩2，v5-v9均未启动；无菜单/房间/玩家/AI/玩法通过证据。')
files={'overlay/OPTIONAL_SERVICES_RETIREMENT.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（资讯推广消费者退役待实机）',profile).encode()}
candidate=dict(manifest8);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==212
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-ftue-v8-20261118','base_candidate_manifest':manifest8,'candidate_manifest':candidate,'native_link_proof':proof,'static_wasm_validation_exit':validation.returncode,'fixture_only_checks':5,'fixture_state_cases':256,'game_executed':False,'ready_review':False,'optional_services_marked_ready':False,'core_data_requirements_preserved':True,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode();files['support/original-retirement-contract.json']=json.dumps(contract,ensure_ascii=False,indent=2).encode();files['support/own-native-bridge.wasm']=helper
for n in ['smash_optional_services_v9_20261118.wat','smash_optional_services_fixture_v9_20261118.wat','smash_optional_services_fixture_v9_20261118.wasm','smash_optional_services_linked_fixture_v9_20261118.wasm','test_smash_optional_services_v9_20261118.cjs','smash-optional-services-fixture-result-v9-20261118.json']:files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in ['smash_optional_services_native_link_v9_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_optional_services_v9_fixture_20261118.py','direct_smash_optional_services_v9r2_prepare_20261118.py','direct_smash_optional_services_v9r2_stage_20261118.py','direct_smash_optional_panel_contract_20261118.py','direct_smash_optional_panels_source_20261118.py','direct_smash_streaming_path_bindings_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
files['source-proof/original-optional-panel-source.json']=(r/'analysis-20261118/optional-panels-source/original-optional-panel-source.json').read_bytes();files['source-proof/original-component-method-bindings.json']=(r/'analysis-20261118/optional-panel-method-bindings/original-path-method-bindings.json').read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_optional_services_v9r2_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_optional_services_v9r2_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'candidate_files':len(candidate),'files':len(files),'changed_previous_functions':proof['changed_previous_functions'],'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'static_validation_exit':validation.returncode,'game_executed':False}))
