"""Prepare a genuine native offline-mode consumer without substituting authentication or core gates."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys
from smash_local_transport_native_link_v11_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=r/'local-transport-v11-support-20261118';assert not out.exists()or not any(out.iterdir());out.mkdir(exist_ok=True);sha=lambda v:hashlib.sha256(v).hexdigest()
tests=json.loads((b/'smash-local-transport-fixture-result-v11-20261118.json').read_bytes());assert tests['passed']==12 and tests['own_fixture_only']and not tests['game_executed']and not tests['original_game_functions_invoked']
src=(b/'direct_smash_local_game_data_v10_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('wat=(b/')]
reader={'b':b,'r':r,'json':json,'sha':sha,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v9-reader-only','exec'),reader)
v10=r/'local-game-data-v10-support-20261118';old_recipe=json.loads((v10/'support/assembly-recipe.json').read_bytes());base_manifest=old_recipe['candidate_manifest']
def base(n):
    p=v10/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v10/'local-content-transaction-static-validation-only.wasm').read_bytes()
    else:raw=reader['base'](n)
    assert sha(raw)==base_manifest[n],n;return raw
contract=json.loads((a/'native-offline-lifecycle-contract.json').read_bytes());identity=json.loads((a/'native-offline-player-identity/original-settings-constant-source.json').read_bytes());offline=json.loads((a/'native-offline-room-api/original-settings-constant-source.json').read_bytes())
sources={x['function_index']:x['source']for x in identity['original_source_snippets']};assert 'a[6]'in sources[986]and'a[6] = b'in sources[1351]
sources={x['function_index']:x['source']for x in offline['original_source_snippets']};assert 'select_if(9,'in sources[4258]and'15,'in sources[4258]and'f_zvn(a, b, 1, 1)'in sources[41669]
player=next(x for x in contract['types']if x['name']=='Player');assert any(x['native_offset']==16 and x['type']['name']=='bool'for x in player['fields'])and any(x['native_offset']==24 and x['type']['name']=='string'for x in player['fields'])
settings=next(x for x in contract['types']if x['name']=='ServerSettings');assert any(x['native_offset']==12 and x['type']['name']=='AppSettings'for x in settings['fields'])
for fn,args,ret in[(41676,['AppSettings','bool'],'bool'),(4258,[],'ClientState'),(96313,[],'bool'),(1351,['string'],'void')]:
    matches=[x for x in contract['methods']if x['function_index']==fn and x['class']==('Player'if fn==1351 else'PhotonNetwork')];assert len(matches)==1 and[p['type']['name']for p in matches[0]['parameters']]==args and matches[0]['return_type']['name']==ret
helper=(b/'smash_local_transport_v11_20261118.wasm').read_bytes();native,proof=assemble(base('Build/original.wasm'),helper);assert proof['previous_function_bodies_total']==138266
wp=out/'original-local-transport-static-validation-only.wasm';wp.write_bytes(native)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
html=base('index.html').decode();needle='<script src="local-gamedata.js"></script>';assert html.count(needle)==1;html=html.replace(needle,needle+'<script src="local-transport.js"></script>',1)
needle='if (Array.isArray(unityInstance.Module.deinitializers)) unityInstance.Module.deinitializers.push(content.stop);';assert html.count(needle)==1
html=html.replace(needle,needle+'\n                const transport = window.GameLabLocalTransport.attach(unityInstance.Module, {onError: window.GameLabLocalGameData.showFailure});\n                if (Array.isArray(unityInstance.Module.deinitializers)) unityInstance.Module.deinitializers.push(transport.stop);',1)
doc='''# 原客户端离线传输接入 v11（尚未实机）

核清原PhotonNetwork本身含离线模式：原ConnectUsingSettings(AppSettings,bool)41676在明确true时调用原OfflineMode setter7186，原setter处理实际本地actor和回调；原Create/JoinRoom25388/41669/41670等保留原离线Room构建10061、真实本地玩家绑定及原房间创建/加入回调。它们都是客户端原有本地分支，不是伪造服务器认证/回执。所有这些提供者、房间属性、关卡规则、玩家/赛车生成、AI及交付门禁都不替换。

原游戏PhotonConnectionManager的Awake105271只读取Firebase身份并配置认证；这个在线身份消费者在本地候选退役。原Update105269原来直接读LoadBalancingClient.State五次，即使原Photon离线getter已有实际大厅15/房间9语义也看不到，可能持续连接中。现在Update前缀要求真实原OfflineMode96313为真；五处raw在线state读取接原NetworkClientState4258，返回的仍是原函数计算出的真实状态，未用常量15或伪造已连接。其余原Update的服务/核心数据/加载UI/推广状态等路径与门禁均保留；原源码、完整指令片段和逐bodySHA存档。

新增本地所有者在原数据适配挂载后250ms等待真实原核心服务、User/Data身份一致、真实目录、原GameData getter和完整应用field16/loading140均满足，才允许本地连接。仅实际已保存的local:UUID身份能接入；使用原Player.UserId getter986/setter1351把同一真实UID传给已存在、isLocal=true的Photon本地actor。另一个玩家的ID或已有活动联网状态都拒绝接管，绝不制造AuthenticationValues、Firebase成功、账号/权限/奖励或网络响应。

原设置对象和AppSettings必须实际存在，只有原idle0/disconnected14可调用41676(settings,true)，不改全局ServerSettings字节，不强断别的连接。原连接失败、异常或调用后实际OfflineMode未成立即停止自己的定时器并明确报错，不把bool返回当成已就绪，不逐帧重试；等待实际输入最长90秒。重复挂载幂等、成功/失败/卸载仅清理自身定时器。真实离线大厅/房间状态仍读原getter；不自动生成房间或伪造比赛/本地AI完成。

12类自编WAT/JS mock隔离检查通过，未实例化或运行任何原游戏函数/资产。完整原Wasm只静态校验exit0；相对v10仅105269/105271变化，其余138264函数体保留，新增2自编函数/2导出，从v5共25自编函数/20导出。原native type/import/table/global/data/metadata字节保持，v7档案/v8教程/v9展示消费者/v10真实本地数据保持。

这版尚未52实机。最后实际运行仍v4蓝色加载，3/5剩2；不将本地传输接入实现称为原菜单/实际房间/赛车与AI/比赛或持久化通过。完整SDK退役和其它运行问题仍待观察，暂无新增待验收。七原生预设、1493物品/48组和162包/44场景变体保持；未知耗时/Token/费用null，原任务/版本/暂停/历史不变，不启动供货。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','v11使用原客户端真实Photon离线模式与真实local:UUID，不造认证对象。原核心/本地数据完整后有界接入原41676，原连接管理器仅读真实离线状态，原房间/玩家/AI/比赛门禁均保持。12类自编隔离及完整原Wasm静态校验通过；尚未实机，3/5剩2。当前不能证明菜单/房间/赛车/AI与持久化，不计待验收。')
files={'overlay/index.html':html.encode(),'overlay/local-transport.js':(b/'smash_local_transport_v11_20261118.js').read_bytes(),'overlay/LOCAL_TRANSPORT.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（原生离线传输待实机）',profile).encode()}
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==217
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-game-data-v10-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'native_link_proof':proof,'static_wasm_validation_exit':validation.returncode,'fixture_only_checks':12,'game_executed':False,'ready_review':False,'local_transport_implemented':True,'local_transport_runtime_verified':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode();files['support/own-native-bridge.wasm']=helper
for n in['smash_local_transport_v11_20261118.wat','smash_local_transport_v11_20261118.js','test_smash_local_transport_v11_20261118.cjs','smash-local-transport-fixture-result-v11-20261118.json']:files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in['smash_local_transport_native_link_v11_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_local_transport_v11_prepare_20261118.py','direct_smash_local_transport_v11_stage_20261118.py','direct_smash_offline_lifecycle_contract_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n in['native-offline-lifecycle-contract.json','native-offline-room-api/original-settings-constant-source.json','native-offline-player-identity/original-settings-constant-source.json','native-offline-connection-lifecycle/original-update-instructions.wat']:files['source-proof/'+n]=(a/n).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_local_transport_v11_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_local_transport_v11_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'candidate_files':217,'files':len(files),'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'changed_previous_functions':[105269,105271],'static_validation_exit':validation.returncode,'fixture_only_checks':12,'game_executed':False}))
