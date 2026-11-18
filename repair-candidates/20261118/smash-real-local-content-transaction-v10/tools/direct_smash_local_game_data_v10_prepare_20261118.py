"""Prepare a genuine local-content lifecycle and retain every original core completion check."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys
from smash_local_game_data_native_link_v10_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=r/'local-game-data-v10-support-20261118';assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
tests=json.loads((b/'smash-local-game-data-fixture-result-v10-20261118.json').read_bytes());assert tests['passed']==10 and tests['fixture_only']and not tests['original_game_code_executed']and not tests['original_game_assets_or_profiles_used']
src=(b/'direct_smash_optional_services_v9r2_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('contract=json.loads')]
reader={'b':b,'r':r,'json':json,'sha':sha,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v8-reader-only','exec'),reader)
v9=r/'optional-services-v9r2-support-20261118';old_recipe=json.loads((v9/'support/assembly-recipe.json').read_bytes());base_manifest=old_recipe['candidate_manifest']
def base(n):
    p=v9/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v9/'optional-consumer-retirement-static-validation-only.wasm').read_bytes()
    else:raw=reader['base'](n)
    assert sha(raw)==base_manifest[n],n;return raw
wat=(b/'smash_local_game_data_v10_20261118.wat').read_text(encoding='utf8');assert wat.count('i32.store8')==1 and 'i32.store8 offset=140'in wat
helper=(b/'smash_local_game_data_v10_20261118.wasm').read_bytes();native,proof=assemble(base('Build/original.wasm'),helper);assert proof['previous_function_bodies_total']==138255
wp=out/'local-content-transaction-static-validation-only.wasm';wp.write_bytes(native)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
with zipfile.ZipFile(b/'direct_smash_game_data_source_20261118.pyz')as z:presets=json.loads(z.read('source-proof/original-preset-arenas.json'))
constructors=json.loads((a/'game-mode-default-constructors/original-settings-constant-source.json').read_bytes());ctor=next(x for x in constructors['original_body_hashes']if x['function_index']==105580)
plan={'schema':1,'source':'original-native-defaults','sourceHashes':{'originalMetadata':'01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7','originalUnityContainer':'a8a15c03255abf9c2413a1b30e36164abc79ade9a0190dcedcac29326c49c7e2','originalItemsJSON':sha((a/'embedded-catalogs/ItemDatas.original-decoded.json').read_bytes()),'originalGroupsJSON':sha((a/'embedded-catalogs/ContentGroups.original-decoded.json').read_bytes()),'originalPresetConstructor':ctor['sha256']},'itemCount':1493,'groupCount':48,'arenas':{x['slot']:x['arena_name']for x in presets['slots']},'calendarPolicy':'Actual current local UTC date; never claimed as server time','provenancePolicy':'Hashes bind immutable original input sources; actual candidate bytes are independently bound by CANDIDATE_MANIFEST'}
assert len(plan['arenas'])==7
html=base('index.html').decode();assert html.count('<script src="local-profile.js"></script>')==1
html=html.replace('<script src="local-profile.js"></script>','<script src="local-profile.js"></script><script src="local-gamedata.js"></script>',1)
needle='if (Array.isArray(unityInstance.Module.deinitializers)) unityInstance.Module.deinitializers.push(controller.stop);';assert html.count(needle)==1
html=html.replace(needle,needle+'''
              window.GameLabLocalGameData.attach(unityInstance).then((content) => {
                if (Array.isArray(unityInstance.Module.deinitializers)) unityInstance.Module.deinitializers.push(content.stop);
              }).catch(window.GameLabLocalGameData.showFailure);''',1)
doc='''# 本地原生内容事务 v10（未实机、未交付）

本适配读取已经由原客户端真实加载的PlayOptionsData七预设、物品List<ItemData>和CustomizationGroupModel分组；要求原生列表1493项/分组48项、七槽对应原地图与完整规则字段，以及真实本地用户身份一致。不是生成替代地图或物品。原JSON字符串保留原文，尤其不经过JS数字重编码去破坏原生long值。原始来源哈希和实际候选文件哈希分别登记；原资源及元数据版本不覆盖。

新增自有localStorage键gamelab.smash.local-content.v1，记录实际原生预设JSON、本地身份、真实本机UTC日期及原输入来源哈希；明确dayId来源是本地UTC日历，不声称服务端时间。先校验、保留上一代、CAS写入及精确读回，随后用原JsonConvert.DeserializeObject<Dictionary<string,object>>及metadata5690372读取真实本地数据，再直接交给原GameData consumer17602。此兼容字典只包含实际日历dayId和实际原生playOptions字符串，未取得的奖励、赛季、挑战、价格、用户刷新等键全部不提供。未拦截Firebase请求或调用SDK认证/请求成功回调，也未捏造云端响应。

原17602/43610类型解析、对象/保护字段应用、错误路径和完成事件保持。原就绪getter10177及最终完整应用field16、loading140全部实际核对后才允许本地事务返回完成；本适配不写ready字段、不强塞DEFAULT。只有原8457“发起数据请求”消费者改接真实本地排队，原26067仍沿原链路传UID；新的排队函数只标记真实loading140。原Firebase提供者、核心权限、奖励与交付门禁不换桩。源码已核清10类原可选键的ContainsKey分支，不传空/零奖励或假赛季代替缺数据；原公共应用副作用仍须52观察。

真实CustomizationDataService没有编译HasInstance泛型入口，不能借用另一方法的MethodInfo。自编只读探针使用已核实Get_Instance声明类/RGCTX/static-fields布局和原类元数据初始化601，仅读取既有实例，不调用创建分支。List开放泛型的字段偏移是零占位，实际大小offset12由原闭合List<ItemData>分配类型和8个填充循环证明，不拿占位值当地址。

10类自编WAT/JS/存储隔离检查通过：来源/身份/旧档/并发保护、缺目录不执行、保存失败不执行、完整七预设、原long文本保留、正确元数据与托管根、坏解析/原生未完成不报成功、栈及临时缓冲恢复、真实时钟无效拒绝。仅运行自编fixture，无原游戏资产或原函数执行。完整原Wasm仅静态验证exit0；相对v9r2只改8457，其余138254函数体保持，新增11函数/8导出，从v5共23函数/18导出。

v10尚未52实机。最后真实运行仍v4蓝色加载，累计3/5剩2；桌面访问恢复请求待回复。完整SDK退役、其它云端更新、菜单/本地房间/玩家/AI、比赛与本地进度都未通过，不计待验收；七个预设不是七关实测。V5.1与耗时/Token/费用边界如实记录，未知null。原任务/版本/人工暂停和历史保留，不启动供货。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','v10增加真实本地内容事务：原生七预设与1493物品/48分组实际就绪、身份及来源校验并保存读回后，沿原17602/43610应用/完成。只改数据请求消费者8457，不改ready/权限/奖励或喂DEFAULT。实现已自编隔离验证及原Wasm静态验证，尚未52启动；最后实机v4仍蓝色加载，3/5剩2，无玩法/本地AI/入库通过。')
files={'overlay/index.html':html.encode(),'overlay/local-gamedata.js':(b/'smash_local_game_data_v10_20261118.js').read_bytes(),'overlay/local-gamedata-plan.json':json.dumps(plan,ensure_ascii=False,indent=2).encode(),'overlay/LOCAL_GAME_DATA_TRANSACTION.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（真实本地内容事务待实机）',profile).encode()}
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==215
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-optional-services-v9r2-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'native_link_proof':proof,'static_wasm_validation_exit':validation.returncode,'fixture_only_checks':10,'game_executed':False,'ready_review':False,'local_game_data_transaction_implemented':True,'local_game_data_transaction_runtime_verified':False,'original_ready_getter_and_typed_application_preserved':True,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode();files['support/own-native-bridge.wasm']=helper
for n in ['smash_local_game_data_v10_20261118.wat','smash_local_game_data_fixture_v10_20261118.wat','smash_local_game_data_fixture_v10_20261118.wasm','smash_local_game_data_linked_fixture_v10_20261118.wasm','test_smash_local_game_data_v10_20261118.cjs','smash-local-game-data-fixture-result-v10-20261118.json']:files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in ['smash_local_game_data_native_link_v10_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_local_game_data_v10_fixture_20261118.py','direct_smash_local_game_data_v10_prepare_20261118.py','direct_smash_local_game_data_v10_stage_20261118.py','direct_smash_game_data_local_context_contract_20261118.py','direct_smash_game_data_optional_effect_guards_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n in ['game-data-local-context-contract.json','game-data-optional-input-effect-guards.json','game-data-original-dictionary-parser-contract.json','game-mode-original-default-contract.json']:files['source-proof/'+n]=(a/n).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_local_game_data_v10_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_local_game_data_v10_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'candidate_files':len(candidate),'files':len(files),'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'changed_previous_functions':[8457],'static_validation_exit':validation.returncode,'fixture_only_checks':10,'game_executed':False}))
