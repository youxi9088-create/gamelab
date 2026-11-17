"""Prepare a new immutable delivery from the exact remotely observed native game."""
from pathlib import Path
import json,hashlib,shutil,sys,datetime,copy,zipfile
b=Path(__file__).parent;r=b/'direct-games/job-e7d352b1a2b1'
sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.game_specification_v51 import document,SECTIONS,section_markdown
from controlplane.offline_delivery import inspect
from controlplane.delivery_requirements import delivery_gaps
from controlplane.conversion_delivery_checks import inspect as preflight
def read(p):
 x=json.loads(p.read_text(encoding='utf8'))
 if 'stdout'in x:assert x['exit_code']==0;x=json.loads(x['stdout'])
 return x
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2),encoding='utf8')
old=r/'work-native-local-v1';dest=r/'final-delivery-20261117-v1';assert not(r/'final-manifest-20261117-v1.json').exists(),'Immutable delivery already prepared'
ledger=read(r/'ui-ledger.json');assert(ledger['max_steps'],ledger['steps_used'],ledger['remaining'])==(11,11,0)
obs=read(b/'direct-omnis-final-runtime-observation-20261117.json')
assert obs['sequence_contiguous']and not obs['issues']
resources=[x for x in obs['events']if x['type']=='resource']
assert len(resources)==65 and obs['event_count']==66
assert all(x['url'].startswith('http://127.0.0.1:57584/')for x in resources)
assert all(x.get('responseStatus')==200 or x.get('responseStatus')==404 and x['url'].endswith('/favicon.ico')for x in resources)
current=read(b/'direct-omnis-delivery-final-preflight-20261117.json');assert current['job']['status']=='blocked'and current['job']['round']==13 and current['job']['version_id']=='v-4f40af6a7dd7'and not current['job']['manual_paused']
assert current['dependencies']['revision']==2 and not current['game_spec']
original_manifest={p.relative_to(old).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in old.rglob('*')if p.is_file()}
assert len(original_manifest)==220 and original_manifest['main.js']=='39ebb07f271eeea3374c0c90b87e18bd88b90099d93ac3e59a5fdc19c4729b23'
shutil.copytree(old,dest,dirs_exist_ok=True);e=dest/'evidence/direct-repair'
for folder in ['validation-20261117','validation-extra-resumed-20261117','validation-one-extra-20261117']:
 shutil.copytree(r/folder,e/folder,dirs_exist_ok=True)
write(e/'ui-ledger.json',ledger);write(e/'runtime-observation-final.json',obs);write(e/'observed-candidate-manifest.json',original_manifest)
shutil.copy2(b/'direct-omnis-one-step-authorization-receipt-20261117.json',e/'one-step-authorization-receipt.json')
scope='保留原Phaser卡牌策略、本地AI、GameGraph/gameLogic/portUtils/sfx/tutorial/cardFlavours/cardRenderer和原插画音频；精确退役真实InstantDB、联机房间/聊天/在线初始化及宿主工具脚本，无假SDK、假账号或假奖励。173项缺失原素材和8份字体已精确本地化；22模块58条导入闭合。52机器原候选220文件逐SHA一致后实机累计11步（原5+用户追加5+仅此次追加1），历史失败点击完整保留。原菜单→默认3AI→Algorithmic Overlords→收入3/资金13/手牌→原PASS & END TURN→Crypto Cult原生Algorithmic Deck-Rigging→National Security Apparatus原生Outrage Supernova使Big Pharma抵抗4降0；Chrome只读查找真实页面完整ROUND 2 — CHOOSE YOUR ACTION (2 available)为1/1，证明轮转回玩家第2回合，原卡牌揭示遮罩仍保留。66条连续浏览器观察/65资源均同一本地源，64项200，仅浏览器默认favicon.ico404，无脚本异常/外联。未点击玩家卡牌、攻击、竞价，未通关，未验证全部阵营/设置/教学、刷新或整局保存；原实现仅教学偏好存储，无整局断点存档。待验收不等于人工验收或下游供货。'
limits=['玩家主动出牌/攻击/竞价未实测','完整胜局及全部阵营/选项/教学未实测','刷新未实测；原本地模式没有整局断点存档，仅教学偏好','第2回合完整阶段文本由只读浏览器查找1/1确认，原揭示遮罩未关闭','未逐个观察三个AI的全部卡牌；返回玩家第2回合和原轮转实现共同支持轮转完成']
actions=[{'type':'click','step':x['step'],'at':x['at'],'action':x['action'],'result':x['outcome']}for x in ledger['steps']]
actions[-1]['selector']='#btn-end-turn' # Source locator for the observed real GUI click; never used for automated input.
runtime={'passed':True,'environment':'local-artifact','network_observation_complete':True,'external':[],'blocked_external':[],'required_external':[],'errors':[],'missing':[],
 'actions':actions,'navigation_checkpoints':[{'name':x,'status':'passed'}for x in ['native-title','ai-simulation-setup','faction-selection','native-board-round1','native-end-turn-ai-effect-player-round2']],
 'network_requests':[x['url']for x in resources],'scope':scope,'limits':limits,'evidence':'evidence/direct-repair/runtime-observation-final.json',
 'non_game_http_errors':[{'url':x['url'],'status':404,'reason':'Browser default favicon; no game script/image/audio/font failure'}for x in resources if x.get('responseStatus')==404]}
write(e/'runtime.json',runtime)
review={k:{'status':'removed'if k=='multiplayer'else'absent','reason':scope,'evidence':['main.js','index.html','gameLogic.js','evidence/direct-repair/source-preservation.json']}for k in ['leaderboard','multiplayer','advertising','payments']}
proof='evidence/direct-repair/validation-one-extra-20261117/'
foundation={
 'gameplay':{'status':'verified','reason':'原结束回合触发真实本地AI卡牌和抵抗值变化，轮转回玩家Round2；限基础人机轮转，不称胜局或玩家攻击已测。','evidence':[proof+'ai-card-native.png',proof+'ai-national-security-effect.png',proof+'round2-human-full-find.png','evidence/direct-repair/runtime.json']},
 'resources':{'status':'verified','reason':'173原素材和8字体精确归档；实际65资源均本地，22模块58导入闭合，220原候选哈希绑定；未遍历全部卡牌场景。','evidence':['evidence/direct-repair/material-intake-20261116.json','evidence/direct-repair/pack-preparation.json','evidence/direct-repair/dependency-closure.json','evidence/direct-repair/runtime-observation-final.json']},
 'scene':{'status':'verified','reason':'原生GameGraph棋盘、群组节点和手牌实际显示。','evidence':['GameGraph.js','evidence/direct-repair/validation-extra-resumed-20261117/step-9.png']},
 'objects':{'status':'verified','reason':'原卡牌和目标群组，AI卡牌效果实际把目标抵抗从4降到0。','evidence':['gameLogic.js',proof+'ai-national-security-effect.png']},
 'characters':{'status':'verified','reason':'原6阵营选择界面与Algorithmic玩家、原AI对手实际显示，本地原AI行动。','evidence':['evidence/direct-repair/validation-extra-resumed-20261117/step-8.png',proof+'ai-response-1.png','gameLogic.js']},
 'animation':{'status':'verified','reason':'原AI回合提示/卡牌揭示及效果面板转换实际显示；未验证所有卡牌动画。','evidence':[proof+'ai-response-1.png',proof+'ai-card-native.png',proof+'ai-national-security-effect.png','main.js']},
 'ui':{'status':'verified','reason':'原标题、设置、阵营、棋盘/手牌、PASS及原卡牌效果界面实际操作；遮罩保留，无追加输入。','evidence':['evidence/direct-repair/validation-extra-resumed-20261117/step-6.png','evidence/direct-repair/validation-extra-resumed-20261117/step-9.png',proof+'ai-national-security-effect.png']}}
previous=current['dependencies'];deps=copy.deepcopy(previous);deps.pop('revision',None);deps.pop('updated_at',None)
for item in deps['items']:
 item.update(status='not_applicable'if item['kind']in ['backend','platform']else'verified',reason=scope,evidence='main.js; gameLogic.js; evidence/direct-repair/runtime.json; evidence/direct-repair/source-preservation.json',next_action='')
deps['scope']=scope
facts={
 'basic_facts':'Phaser 3.70.0＋JavaScript的原生回合卡牌策略单机AI模式，Tone 14.7.77音频。原本地AI与玩法保留，联机数据库和宿主工具退役。52实测原结束回合、AI卡牌效果并返回玩家第2回合；未验证胜局。来源：main.js、gameLogic.js、evidence/direct-repair/runtime.json。',
 'asset_types':'原WebP/PNG卡牌/阵营插画、MP3、WOFF2；173项缺失原图音素材和8份字体按原URL取得并留SHA。原ES模块22个、导入58条均本地闭合。来源：evidence/direct-repair/material-intake-20261116.json、pack-preparation.json、dependency-closure.json。',
 'core_challenge':'规则要求管理行动、BTC收入及卡牌效果，在连接图争夺中立群组，原攻击/对齐/竞价规则存在。来源：gameLogic.js、GameGraph.js；玩家主动进攻与竞价未实测。',
 'controls':'原鼠标选择模式/阵营/卡牌/节点与结束回合按钮；GameGraph原WASD/方向键或空白拖动视野为源码确认。实测仅菜单选择和PASS & END TURN，不称全部控制已测。来源：main.js、GameGraph.js、ui-ledger.json。',
 'behavior_path':'原路径为选择本地AI模拟→默认AI配置→选阵营→玩家行动→结束回合→原AI行动→下一玩家回合。实测玩家选择PASS，观察原AI卡牌和效果后页面已出现第2回合玩家阶段文本；未实测玩家攻击分支。来源：main.js及runtime.json。',
 'game_path':'原标题→AI Simulation Setup→6阵营选择→原棋盘/手牌→回合阶段；原胜利检查与教学保留。实测至第2回合，未抵达胜利。没有实测耗时/流失风险数据。来源：main.js、tutorial.js、gameLogic.js及截图。',
 'progression_path':'本局按原群组控制、收入/资金、行动及阵营特殊胜利条件推进；未添加跨局成长。原本地模式无整局断点存档，仅教学偏好写localStorage。来源：gameLogic.js、main.js。',
 'core_loop':'目标：按原通用或阵营胜利条件推进。规则：玩家与本地AI依原回合收入、行动、卡牌/攻击/竞价运作。反馈：原卡牌展示、战况与节点数值。激励/下一目标：原群组/资金和胜利条件。实测有限闭环为玩家PASS→AI原卡牌→抵抗4降0→玩家Round2；未验证完整胜负闭环。来源：gameLogic.js、main.js、runtime.json。',
 'gameplay_rules':'原DECK、ACTION_CARDS、连接图、攻击/对齐修正、竞价、收入与原本地AI保留。真实InstantDB、房间/聊天/联机初始化退役，采用原isMultiplayer=false路径，不伪造真人对手或服务器数据。来源：gameLogic.js、main.js、source-preservation.json。',
 'key_numbers':'原每回合2行动、2次免费转账；默认3个AI。实测Algorithmic初回合资金13、收入3、力量8；六阵营界面存在。AI Outrage Supernova本轮实际将目标抵抗4降0；页面全文ROUND 2 — CHOOSE YOUR ACTION (2 available)只读查找1/1。来源：gameLogic.js、step-9.png、ai-national-security-effect.png、round2-human-full-find.png。',
 'level_configuration':'原完整模拟对局及脚本教学，不是固定5关版本；教学源码7回合与控制3群组的独立条件保留。实测为默认3AI模拟至Round2，未完成教学或全局胜利。来源：tutorial.js、gameLogic.js及ui-ledger.json。',
 'system_design':'原模式、AI设置、阵营、棋盘、手牌、竞价、资产、战况/规则界面保留；实际联机入口不可启动，相关数据库链移出。没有改变原单机设置或强制通关。来源：index.html、main.js及source-preservation.json。',
 'theme':'原OMNIS Global Initiative阵营权力网络题材，使用原卡牌插画、阵营标识和文字。来源：gameLogic.js的FACTIONS/DECK及assets/；没有生成替代美术。',
 'progression_economy':'BTC为原本局游戏资源，含收入、投入、转移、控制和摧毁规则；不是实际链上支付。实测初回合收入与AI效果；未验证玩家竞价和完整经济平衡。原无整局保存实现，刷新继续未实测。来源：gameLogic.js、main.js。',
 'roster':'原6阵营：Algorithmic Overlords、Corporate Megabloc、National Security Apparatus、Culture-War Architects、The Crypto Cult、The Hidden Hand，各自原power/income/resistance/能力/胜利定义保留。实测选Algorithmic，对手Crypto Cult及National Security原卡牌行动可见；未逐阵营试玩。来源：gameLogic.js的FACTIONS与截图。',
 'monetization':'当前运行包无真实货币支付或广告奖励逻辑；未加购买/奖励替身。外部宿主工具和InstantDB实际启动依赖退役。原卡牌BTC为本局数值。来源：main.js、index.html、gameLogic.js及OFFLINE_DELIVERY_CHECKS.json。'}
gp=read(old/'game-profile.json');gp['specification_v51']={'template_version':'5.1','sections':{k:section_markdown(k,facts[k])for k in SECTIONS}}
gp.update(title='OMNIS Global Initiative',category='回合制卡牌策略',engine='Phaser 3.70.0',core_gameplay='原生本地AI回合、卡牌与连接图策略',verification=scope,save='原整局断点存档未实现；仅教学偏好，刷新未测',cover='screenshots/title.png')
write(dest/'game-profile.json',gp);(dest/'GAME_SPECIFICATION.md').write_text(document(gp['title'],gp),encoding='utf8')
(dest/'RESTORATION_REPORT.txt').write_text(scope+'\n\n源码复用：可直接编辑main.js/gameLogic.js/GameGraph.js及原卡牌配置；群组连接图、卡牌规则/渲染、原本地AI和音频模块可拆解适配，不称恢复原作者工程或已跨项目验证。\n\n逐款独占处理耗时、Token及费用没有可靠归属记录，保持null；GUI记录时间仅是观察时点，不作纯工时。',encoding='utf8')
(dest/'screenshots').mkdir(exist_ok=True)
shutil.copy2(r/'validation-extra-resumed-20261117/step-6.png',dest/'screenshots/title.png')
shutil.copy2(r/'validation-one-extra-20261117/ai-national-security-effect.png',dest/'screenshots/native-ai-effect.png')
report={'path':'direct-agent-repair','recovery_kind':'direct-source-repair','runtime_verified':True,'runtime_smoke':runtime,'verification_evidence':'evidence/direct-repair/runtime.json','offline_features':review,'foundation_checks':foundation,'acceptance_actions':actions,'scope':scope,'verification_limits':limits,'dependencies':deps,'dependency_review':{'previous_revision':2,'previous':previous,'proposed':deps,'basis':'Exact observed source220 SHA, original native local-AI turn and actual card effect, full contiguous browser resource evidence; original no full match save, no online fallback.'},'base_version_id':'v-4f40af6a7dd7','manual_execution':{'executor':'Codex direct repair and real Windows GUI on remote52','automated_model_conversion':False,'original_job':r.name,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ui_steps':11,'remaining':0},'game_profile':gp,'implementation':{'editable_source':'Readable original main.js/gameLogic.js/GameGraph.js and card/render/sound/tutorial modules.','reuse':'Original local AI, card rules/render, graph and audio can be adapted; no separate cross-project reuse verification.','dependencies':'Local original Phaser/Tone modules, images/audio/fonts. Actual InstantDB/multiplayer/provider dependencies retired.','preservation':scope},'accounting':{'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None}}
report['offline_delivery']=inspect(dest,runtime,review);assert report['offline_delivery']['status']=='verified',report['offline_delivery']
check=preflight(dest,report);assert check['finding_count']==0,check
write(dest/'DIRECT_REPAIR_REPORT.json',report);write(dest/'OFFLINE_DELIVERY_CHECKS.json',report['offline_delivery']);write(dest/'CONVERSION_DELIVERY_CHECKS.json',check)
for n,h in original_manifest.items():
 if n not in ['GAME_SPECIFICATION.md','game-profile.json']:assert hashlib.sha256((dest/n).read_bytes()).hexdigest()==h,n
files={p.relative_to(dest).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in dest.rglob('*')if p.is_file()}
assert not delivery_gaps(report,list(files)),delivery_gaps(report,list(files))
write(r/'final-manifest-20261117-v1.json',files);write(r/'final-report-20261117-v1.json',report)
print(json.dumps({'folder':str(dest),'files':len(files),'original_files':220,'game_runtime_changed':False,'offline':'verified','conversion_findings':check['finding_count'],'delivery_gaps':[],'steps_used':11,'remaining':0}))
