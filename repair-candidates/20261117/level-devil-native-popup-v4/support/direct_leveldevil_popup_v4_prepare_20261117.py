"""Build an immutable source candidate from the observed v3 popup failure; no game run."""
from pathlib import Path
import sys,json,hashlib,shutil,datetime
b=Path(__file__).parent.resolve();r=b/'direct-games/job-ca75d464d2d7'
sys.path.insert(0,str(b/'analysis-tools/luaparser-4.2.0'));sys.path.insert(0,str(b));sys.path.insert(0,str(b.parent/'gamelab'))
from luaparser import ast
from luaparser.astnodes import If,ElseIf
from defold_v6_source_edit import replace_lua_source,rebuild,archive_entries,unpack
from controlplane.game_specification_v51 import document,SECTIONS,section_markdown
from controlplane.offline_delivery import inspect
sha=lambda x:hashlib.sha256(x).hexdigest()
src=r/'work-native-retirement-20261117-v3';dst=r/'work-native-retirement-20261117-v4'
assert not dst.exists()
parent=json.loads((r/'native-retirement-v3-manifest-20261117.json').read_text(encoding='utf8'))
for n,h in parent.items():assert sha((src/n).read_bytes())==h,n
ledger=json.loads((r/'ui-ledger-native-v3-20261117.json').read_text(encoding='utf8'))
assert ledger['steps_used']==13 and ledger['remaining']==0 and all(x['status']=='attempted' for x in ledger['additional_steps'])
shutil.copytree(src,dst);ed=dst/'evidence/native-retirement-20261117/edited-sources'
rows=json.loads((r/'analysis/lua-index.json').read_text(encoding='utf8'));byid={x['index']:x for x in rows}
old79=(ed/byid[79]['local']).read_text(encoding='utf8');matches=[]
for n in ast.walk(ast.parse(old79)):
 if isinstance(n,If) and ast.to_lua_source(n.test)=='popup_opened == false' and 'monarch.show(hash("INFINITEMODE")' in old79[n.first_token.start:n.last_token.stop+1]:matches.append(n)
assert len(matches)==1
n=matches[0];removed=old79[n.first_token.start:n.last_token.stop+1]
assert 'savemanager.data.infinite_mode.popup_last_shown' in removed and 'get_firstboot' in removed
new79=old79[:n.first_token.start]+'-- Offline edition: do not schedule the retired community promotion.\n'+old79[n.last_token.stop+1:]
ast.parse(new79)
assert 'monarch.show(hash("INFINITEMODE")' not in new79 and 'popup_last_shown' not in new79
assert 'if popup_opened == false then' in new79 and 'timer.delay(0.5, false, function()' in new79 and 'acquire_input_focus()' in new79
(ed/byid[79]['local']).write_bytes(new79.encode())
old244=(r/'analysis/lua'/byid[244]['local']).read_text(encoding='utf8');matches=[]
for n in ast.walk(ast.parse(old244)):
 if isinstance(n,(If,ElseIf)) and ast.to_lua_source(n.test)=='gui.pick_node(self.nodes.yes_button, x, y)':matches.append(n)
assert len(matches)==1;n=matches[0]
new244=old244[:n.body.first_token.start]+'-- Retired online offer follows the existing cancel path.\nclose_popup()'+old244[n.body.last_token.stop+1:]
ast.parse(new244)
for needle in ['infinite_mode.initialize(', 'infinite_mode.select_random_from_unplayed(', 'gamemanager.currentlevel.chapter = -1', 'gamemanager.recieved_file =']:assert needle not in new244,needle
assert 'elseif gui.pick_node(self.nodes.no_button, x, y) then' in new244
(ed/byid[244]['local']).write_bytes(new244.encode())
report=json.loads((dst/'evidence/native-retirement-20261117/source-retirement.json').read_text(encoding='utf8'))
originals=json.loads((r/'analysis/archive-v6-index.json').read_text(encoding='utf8'))
changed={};proof=[]
for p in sorted(ed.iterdir()):
 i=next(x['index']for x in rows if x['local']==p.name);row=byid[i]
 old=(r/'analysis/lua'/row['local']).read_bytes();new=p.read_bytes();ast.parse(new.decode())
 raw=(r/'analysis/archive-v6'/originals['resources'][i]['file']).read_bytes()
 changed[i]=replace_lua_source(raw,old,new)
 proof.append({'index':i,'original_path':row['original_path'],'before_source_sha256':sha(old),'after_source_sha256':sha(new),'protobuf_bytecode_absent':True})
assert len(changed)==16 and {79,244}<=set(changed)
orig=r/'original/archive';descriptor=json.loads((orig/'archive_files.json').read_text(encoding='utf8'))
parts=next(x['pieces']for x in descriptor['content']if x['name']=='game.arcd')
data=b''.join((orig/x['name']).read_bytes()for x in sorted(parts,key=lambda x:x['offset']));index=(orig/'game0.arci').read_bytes()
ni,nd,resources=rebuild(index,data,changed)
assert len(resources)==803 and sum(x['changed']for x in resources)==16
def payloads(path):
 desc=json.loads((path/'archive_files.json').read_text(encoding='utf8'));ps=next(x['pieces']for x in desc['content']if x['name']=='game.arcd')
 dat=b''.join((path/x['name']).read_bytes()for x in sorted(ps,key=lambda x:x['offset']))
 return [sha(unpack(x))for x in archive_entries((path/'game0.arci').read_bytes(),dat)]
prior=payloads(src/'archive');actual=[x['after_sha256']for x in resources]
assert [i for i,(a,z) in enumerate(zip(prior,actual))if a!=z]==[79,244]
(dst/'archive/game0.arci').write_bytes(ni);pieces=[]
for offset in range(0,len(nd),2097152):
 name='game'+str(offset//2097152)+'.arcd';(dst/'archive'/name).write_bytes(nd[offset:offset+2097152]);pieces.append({'name':name,'offset':offset})
for item in descriptor['content']:
 if item['name']=='game.arcd':item.update(size=len(nd),pieces=pieces)
descriptor['total_size']=sum(x['size']for x in descriptor['content'])
(dst/'archive/archive_files.json').write_bytes(json.dumps(descriptor,separators=(',',':')).encode())
assert payloads(dst/'archive')==actual
for n in ['game0.dmanifest','game0.projectc']:assert (dst/'archive'/n).read_bytes()==(src/'archive'/n).read_bytes()
for n in ['LevelDevil.wasm','LevelDevil_wasm.js','index.html']:assert (dst/n).read_bytes()==(src/n).read_bytes()
report.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),kind='native-v4-popup-retirement-candidate-not-delivered',changed_source_modules=16,unchanged_source_modules=129,unchanged_resource_payloads=787,edited_sources=proof,resources=resources,runtime_verified=False,admitted=False,steps_used=13,steps_remaining=0)
report['all_sources']['244']['unchanged']=False
report['archive'].update(after_index_sha256=sha(ni),after_data_sha256=sha(nd),runtime_archive_acceptance_unverified=True)
report['edits'].append({'index':[79,244],'reason':'Observed v3 reload displays New levels to cry over. Remove the actual delayed INFINITEMODE offer and its YES online consumer; original cancel and delayed input-focus continuation remain. No save/unlock edits.','parent_difference_decoded_resource_ids':[79,244]})
report['remaining']=['v4 never started; parent v3 screenshots do not verify this candidate','Movement, completion and earned-progress reload remain unverified','Cumulative gameplay13/13 used; no new gameplay without explicit per-revision grant']
(dst/'evidence/native-retirement-20261117/source-retirement.json').write_bytes(json.dumps(report,ensure_ascii=False,indent=2).encode())
(dst/'SOURCE_RETIREMENT_CANDIDATE.json').write_bytes(json.dumps(report,ensure_ascii=False,indent=2).encode())
scope='v4仅源码候选，尚未运行、未入库。父v3实际进入首关；追加3步已用完，右移未确认，上方向键出现短暂离地/姿态响应，刷新进入地图但暴露在线玩家关卡推广。v4移除该延时推广及YES在线消费者，保留原取消/地图输入焦点恢复。不改本地进度、解锁、角色、物理、陷阱或章节。相对v3仅79/244两份资源解码字节改变，801资源不变；相对原版16份服务Lua修改、129份不变，787资源不变。原WASM/JS与已运行v3逐字节一致，实际加载仍需新证据。累计13步已用尽，不自行重置。'
gp=json.loads((src/'game-profile.json').read_text(encoding='utf8'));gp['verification']=scope
facts={
 'basic_facts':'Defold原生2D平台游戏，原页面标识Level Devil 1.4.0。v3已实际显示章节地图与首房间；本v4未实机启动。源码：index.html、source-retirement.json。',
 'asset_types':'原803份归档资源，恢复145份真实LuaSource。v4相对原版修改16份服务边界Lua，129份Lua、787资源解码字节不变；相对v3仅资源79和244改变。原图像、音频、场景、WASM与v3保持。',
 'core_challenge':'沿原移动、跳跃、陷阱、死亡重试与出口目标。父v3第12步上方向键出现即时姿态/短暂离地响应，未覆盖完整弧线；第11步水平位移未确认，不宣称通关。',
 'controls':'原键盘及鼠标/触摸入口代码保留。父v3通过原门口鼠标按下/释放进入首房间；屏幕键盘上方向键有可见响应，右移未确认。v4未发送任何试玩输入。',
 'behavior_path':'原地图选门→房间→移动/跳跃避障→死亡重试或出口→下一房间。v3仅证明进入首房间和一次上键可见响应，未实际完成出口循环；v4待验证。',
 'game_path':'原三章地图、房间过渡、本地编辑入口保留。v3刷新后进入地图但出现在线关卡推广；v4移除其延时调度及YES在线消费者，保留原取消/输入焦点恢复。',
 'progression_path':'原通关与本地解锁条件不变，不伪造保存数据或奖励，不免费解锁。实际取得进度和刷新恢复尚未证明。',
 'core_loop':'原目标为抵达出口，原碰撞/陷阱、失败重试、关卡过渡仍由原脚本执行。移动、结算、推进和已取得进度保存尚未形成实机闭环，不能以源码存在判定通过。',
 'gameplay_rules':'原角色、平台、物理、陷阱、同机双人等规则保留。本次仅退役外部服务及推广消费者；不改原站点/授权检查，不伪造平台、账号、广告成功或SDK就绪。',
 'key_numbers':'原资源803份、Lua145份；16份服务边界源码修改，129份原Lua未改。相对v3仅2资源修改/801资源不变。原难度、速度和生命数值未改，实测数值未知留空。',
 'level_configuration':'代码可确认原三章地图及原房间场景保留，未删关卡或替换为示例。未以地图门数推断完整关卡数量；全关卡未实测。',
 'system_design':'原地图、过渡、暂停/重试、设置、声音、本地编辑/保存保留。在线社区/上传/分享/广告跳关退役；v4补除在线玩家关卡推广及其YES消费，取消与正常地图焦点恢复保留。',
 'theme':'保留原2D平台陷阱、像素角色和原图像/声音，没有生成替代资源。父v3首房间实际显示黑色角色、地面和出口。',
 'progression_economy':'原本地存档和本地编辑保存逻辑保持，v4不写游戏进度。父v3刷新只观察到地图与推广，不能证明已取得进度恢复。独占处理耗时、Token、费用未知为null。',
 'roster':'原角色与同机双人相关代码保留；本次未新增角色，角色数量和属性没有充分证据则留空。',
 'monetization':'广告provider注册与原在线消费者退役，没有广告成功回调或新增领取框。v4仅移除实际复现的在线关卡推广调度及YES服务分支，走原取消路径；动态效果待验证。'}
gp['specification_v51']['sections']={k:section_markdown(k,facts[k])for k in SECTIONS}
assert set(gp['specification_v51']['sections'])==set(SECTIONS)
(dst/'game-profile.json').write_bytes(json.dumps(gp,ensure_ascii=False,indent=2).encode());(dst/'GAME_SPECIFICATION.md').write_bytes(document(gp['title'],gp).encode());(dst/'RESTORATION_REPORT.txt').write_bytes(scope.encode())
fix={'at':report['at'],'parent_revision':src.name,'revision':dst.name,'observed_failure':'v3 step13 reload online community promotion','parent_manifest':parent,'changed_decoded_resources':[79,244],'unchanged_parent_resource_count':801,'unmodified_parent_wasm_sha256':sha((dst/'LevelDevil.wasm').read_bytes()),'unmodified_parent_javascript_sha256':sha((dst/'LevelDevil_wasm.js').read_bytes()),'source_syntax_valid':True,'actual_game_executed':False,'ready_review':False,'ui_steps_used':13,'ui_steps_remaining':0,'accounting':{'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None}}
(dst/'evidence/native-retirement-20261117/popup-v4-causal-fix.json').write_bytes(json.dumps(fix,ensure_ascii=False,indent=2).encode())
review={k:{'status':'removed'if k in ['multiplayer','advertising','payments']else'absent','reason':'Native service consumers retired; this source-only v4 additionally removes the observed online-promotion trigger and YES handler. No runtime success inferred.','evidence':['LevelDevil_wasm.js','index.html','evidence/native-retirement-20261117/source-retirement.json','evidence/native-retirement-20261117/popup-v4-causal-fix.json']}for k in ['leaderboard','multiplayer','advertising','payments']}
audit=inspect(dst,{'passed':False,'environment':'local-artifact','actions':[]},review)
assert not audit['findings']and not audit.get('evidence_issues')and not audit['unreviewed_features']and audit['status']=='pending',audit
(r/'native-retirement-v4-static-audit-20261117.json').write_bytes(json.dumps({'audit':audit,'offline_features':review},ensure_ascii=False,indent=2).encode())
m={p.relative_to(dst).as_posix():sha(p.read_bytes())for p in dst.rglob('*')if p.is_file()}
(r/'native-retirement-v4-manifest-20261117.json').write_bytes(json.dumps(m,sort_keys=True,indent=2).encode())
print(json.dumps({'candidate':str(dst),'files':len(m),'changed_parent_resources':[79,244],'original_lua_changed':16,'static_findings':len(audit['findings']),'runtime_verified':False,'steps_remaining':0}))
