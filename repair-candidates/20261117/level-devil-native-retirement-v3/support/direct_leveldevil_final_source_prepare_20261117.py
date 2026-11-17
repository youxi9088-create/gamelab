from pathlib import Path
import sys,json,hashlib,shutil,re,subprocess,datetime
b=Path(__file__).parent;sys.path.insert(0,str(b/'analysis-tools/luaparser-4.2.0'));sys.path.insert(0,str(b.parent/'gamelab'))
from luaparser import ast
from luaparser.astnodes import If,ElseIf,Call
from defold_v6_source_edit import replace_lua_source,rebuild
from controlplane.game_specification_v51 import document,SECTIONS,section_markdown
r=b/'direct-games/job-ca75d464d2d7';source=r/'work-native-retirement-20261117-v2';dest=r/'work-native-retirement-20261117-v3';assert not dest.exists()
shutil.copytree(source,dest);proofdir=dest/'evidence/native-retirement-20261117';report=json.loads((source/'evidence/native-retirement-20261117/source-retirement.json').read_text(encoding='utf8'));edited=proofdir/'edited-sources'
pause=edited/'0618-pause.gui_script.lua';text=pause.read_text(encoding='utf8');ranges=[];handler_count=0;enable_count=0
for node in ast.walk(ast.parse(text)):
 if isinstance(node,(If,ElseIf))and 'gui.pick_node(self.nodes.btn_skip.root' in ast.to_lua_source(node.test):ranges.append((node.body.first_token.start,node.body.last_token.stop+1,'do return end'));handler_count+=1
 elif isinstance(node,Call)and ast.to_lua_source(node.func)=='gui.set_enabled'and len(node.args)==2 and ast.to_lua_source(node.args[0])=='self.nodes.btn_skip.root':ranges.append((node.args[1].first_token.start,node.args[1].last_token.stop+1,'false'));enable_count+=1
# A root-enable inside the retired click body is superseded by removing that body.
ranges=[x for x in ranges if not any(a<=x[0]and x[1]<=z and(a,z)!=(x[0],x[1])for a,z,_ in ranges)]
assert handler_count==1 and enable_count>=2
for start,end,replacement in sorted(ranges,reverse=True):text=text[:start]+replacement+text[end:]
ast.parse(text);pause.write_text(text,encoding='utf8')
source_rows=json.loads((r/'analysis/lua-index.json').read_text(encoding='utf8'));byid={x['index']:x for x in source_rows};ar=json.loads((r/'analysis/archive-v6-index.json').read_text(encoding='utf8'));changes={}
for row in report['edited_sources']:
 i=row['index'];info=byid[i];original=(r/'analysis/archive-v6'/ar['resources'][i]['file']).read_bytes();old=(r/'analysis/lua'/info['local']).read_bytes();new=(edited/info['local']).read_bytes();ast.parse(new.decode('utf8'));changes[i]=replace_lua_source(original,old,new);row['after_source_sha256']=hashlib.sha256(new).hexdigest()
original_archive=r/'original/archive';descriptor=json.loads((original_archive/'archive_files.json').read_text(encoding='utf8'));pieces=next(x['pieces']for x in descriptor['content']if x['name']=='game.arcd');data=b''.join((original_archive/x['name']).read_bytes()for x in sorted(pieces,key=lambda x:x['offset']));index=(original_archive/'game0.arci').read_bytes();new_index,new_data,resources=rebuild(index,data,changes)
(dest/'archive/game0.arci').write_bytes(new_index);new_pieces=[]
for offset in range(0,len(new_data),2097152):
 name='game'+str(offset//2097152)+'.arcd';(dest/'archive'/name).write_bytes(new_data[offset:offset+2097152]);new_pieces.append({'name':name,'offset':offset})
for item in descriptor['content']:
 if item['name']=='game.arcd':item.update(size=len(new_data),pieces=new_pieces)
descriptor['total_size']=sum(x['size']for x in descriptor['content']);(dest/'archive/archive_files.json').write_text(json.dumps(descriptor,separators=(',',':')),encoding='utf8')
report['resources']=resources;report['archive'].update(after_index_sha256=hashlib.sha256(new_index).hexdigest(),after_data_sha256=hashlib.sha256(new_data).hexdigest());report['edits'].append({'index':618,'module':byid[618]['original_path'],'reason':'Actual rewarded-skip input/enable paths removed; no free skip or fake ad success introduced','edits':len(ranges)})
subprocess.run(['node',str(b/'direct_leveldevil_glue_retirement_20261117.cjs')],check=True)
report['javascript']=json.loads((proofdir/'javascript-provider-retirement.json').read_text(encoding='utf8'));report['at']=datetime.datetime.now(datetime.timezone.utc).isoformat();report['remaining']=['Remote read-only package verification against current original job/version/manual pause','Native archive acceptance and actual movement/jump/clear/save remain unverified','Current cumulative UI budget5/5 exhausted; no new game execution without explicit additional authorization']
report['runtime_verified']=False;report['admitted']=False;report['model_or_game_executed']=False
(proofdir/'source-retirement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
# Earlier evidence describes earlier bytes, not the new unexecuted candidate.
old=dest/'evidence/direct-repair/source-preservation.json'
if old.exists():
 historical=dest/'evidence/historical';historical.mkdir(exist_ok=True);shutil.move(old,historical/'source-preservation-before-native-retirement.json')
scope='新修订仅为静态源码候选，未运行、未入库。原803资源中788解码字节不变，原145份Lua中130份不变；15份仅退役真实在线社区关卡/上传/分享、远端表单/统计与广告奖励消费者。原WASM只在构造器2356去掉PokiSdk注册void717调用（7实参平衡drop），其余4420函数体不变；14个原JS provider导入仅保留异常守卫，不提供SDK对象、回调成功、账号或奖励，185原引擎JS函数语义保持。原三章、原角色/碰撞/物理/陷阱/关卡配置、本地编辑和存档路径保留；没有新增或解锁关卡。原5步仅证明旧修订菜单与首房间初始化，新修订尚未实机验证，不能借用旧截图称通过。'
facts={
 'basic_facts':'Defold原生2D平台游戏，原页面标识Level Devil 1.4.0。保留原WASM/Defold引擎与原Lua业务资源，新增修订只处理服务边界。原版本实机到首房间，新修订未实机。来源：index.html及evidence/native-retirement-20261117/source-retirement.json。',
 'asset_types':'803份原Defold归档资源，原资源包含Lua模块、图形/声音及编译场景等；145份真实LuaSource合计1034342字节已恢复。788份资源解码字节不变，15份Lua资源服务边界修改。原dmanifest/projectc保持。来源：source-retirement.json。',
 'core_challenge':'原平台移动、跳跃、陷阱/死亡与通关规则，原脚本和配置保留。未把源码存在当实际已通关。来源：原hero/ground/death/levelmanager脚本及字节保持证明。',
 'controls':'旧修订实际按住Space约150ms进入首房间；本轮未发输入。原键盘/按钮输入、同机双人模式相关脚本保留，不把同机双人误作联网匹配。来源：旧SOURCE_RECOVERY_PARTIAL_REPORT.json及原inputs脚本。',
 'behavior_path':'原地图选门→进入房间→移动/跳跃避障→原死亡/重试或抵达出口→原下一房间逻辑。旧实机只至首房间初始化，新修订移动与结算未验证。',
 'game_path':'原三章地图、房间、关卡过渡与本地编辑入口保留。在线社区浏览/云端上传/分享和依赖服务器的无限模式停止，不用虚构关卡列表替代。来源：原level-select/level_editor/infinite_mode脚本及修改记录。',
 'progression_path':'沿原本地进度、原通关与解锁条件；不修改原关卡数量或进度数值，不新增免费跳关。来源：原savemanager与关卡脚本字节保持证明。',
 'core_loop':'原目标为抵达出口；规则由原输入、碰撞、陷阱和房间配置执行；原失败/重试/进度与下一房间反馈保留。实际移动、出口判定、死亡重试、推进和保存仍待原生实机证明，新修订不宣称核心闭环通过。',
 'gameplay_rules':'原关卡、角色、平台、陷阱及竞速/同机双人相关代码保留。仅移除SDK注册和在线服务消费者，未改站点/授权检查或全局平台/许可/SDK就绪标志。原平台识别在真实SDK未注册后自然走原HTML5路径。',
 'key_numbers':'原归档803资源、恢复LuaSource145份；本次修改15份服务边界，其余130源码不变。原玩法难度、生命、速度等数值未改；未获实测数据的数值不编造。',
 'level_configuration':'原源码使用三章地图及相应原场景/房间资源；不以菜单门数推断完整关卡数量。未删原关卡或用少量示例关卡替换，完整房间数量待进一步读取权威配置。',
 'system_design':'原地图/过渡、关卡、暂停/重试、设置、声音、本地关卡编辑及本地保存保留。在线分享、上传和广告跳关按钮及对应输入路径移除；没有新增奖励确认框。',
 'theme':'保留原2D平台与陷阱画面、角色和原音频；没有生成替代图片或声音。',
 'progression_economy':'原本地存档和本地编辑保存代码不变，未伪造已有进度/奖励。旧实机没有完成本轮移动/胜利/刷新存档验证；新修订完全未运行。',
 'roster':'原角色和同机双人相关资源/代码保留；角色数量、属性等未取得充分证据时留空，不新增角色。',
 'monetization':'广告provider真实注册移除，旧本地领取对话框删除；广告奖励只允许原取消/失败路径，不调用成功回调；在线上传/分享/统计消费者移除，不报告支付或服务成功。新包动态请求及效果仍待实机。'}
gp={'title':'Level Devil','engine':'Defold','category':'2D平台跳跃','verification':scope,'specification_v51':{'template_version':'5.1','sections':{k:section_markdown(k,facts[k])for k in SECTIONS}}}
(dest/'game-profile.json').write_text(json.dumps(gp,ensure_ascii=False,indent=2),encoding='utf8');(dest/'GAME_SPECIFICATION.md').write_text(document(gp['title'],gp),encoding='utf8');(dest/'SOURCE_RETIREMENT_CANDIDATE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');(dest/'RESTORATION_REPORT.txt').write_text(scope,encoding='utf8')
manifest={p.relative_to(dest).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in dest.rglob('*')if p.is_file()}
(r/'native-retirement-v3-manifest-20261117.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'candidate':str(dest),'files':len(manifest),'changed_source_modules':15,'unchanged_source_modules':130,'unchanged_resource_payloads':788,'preserved_wasm_function_bodies':4420,'preserved_js_engine_functions':185,'runtime_verified':False,'steps_used':5,'remaining':0,'admitted':False}))
