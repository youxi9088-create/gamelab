"""Publish exact cold-start evidence and the next real transaction boundary, not a new game candidate."""
from pathlib import Path
import json,hashlib,zipfile,re,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';sha=lambda v:hashlib.sha256(v).hexdigest()
proofs={n:json.loads((a/n).read_bytes())for n in ['game-data-cold-start-contract.json','game-data-original-key-contract.json','game-mode-original-default-contract.json','game-data-original-dictionary-parser-contract.json']}
assert all(x['source_only']and not x['game_executed']for x in proofs.values())
raw=(r/'analysis-20261117/native-string-table-ANALYSIS-ONLY.bin').read_bytes();assert sha(raw)=='ba206c18054091f279ec3ab933f234ad9522b091d3b0628bde87692dc8f88f10'
d=json.loads((a/'game-mode-preset-arenas/original-settings-constant-source.json').read_bytes());by_fn={x['function_index']:x for x in d['original_source_snippets']};slots=[]
for slot,fn in [('default1',3368),('default2',4170),('default3',11182),('default4',2776),('special1',7810),('special2',7774),('special3',7811)]:
    matches=re.findall(r'\[112087\]:int,\s*(\d+),\s*(\d+),',by_fn[fn]['source']);assert len(matches)==1
    start,length=map(int,matches[0]);value=raw[start:start+length].decode();slots.append({'slot':slot,'arena_name':value,'native_getter':fn,'rva_start':start,'rva_length':length,'native_getter_body_source_sha256':by_fn[fn]['source_sha256']})
assert len({x['arena_name']for x in slots})==7
presets={'source_only':True,'game_executed':False,'original_modified':False,'slots':slots,'source_constructor':105580,'source_data_constructor':44974,'original_play_option_constructor':7298,'presets_are_not_levels_or_runtime_verified_maps':True,'rule_values':'Retained in original constructors and game-mode bitmask helpers; no substitute numbers generated','original_rule_helpers':[43599,43600,43601]}
p=r/'pending-direct-status.json';backup=r/'pending-direct-status-before-game-data-source-audit-20261118.json';assert not backup.exists();backup.write_bytes(p.read_bytes());status=json.loads(p.read_bytes());assert status['ui_steps_used']==3 and status['ui_steps_remaining']==2
status['last_game_data_source_audit']={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'native_service_uid_field':20,'native_play_options_json_field':68,'native_day_id_field':92,'embedded_defaults_type':'PlayOptionsData','default_presets':4,'special_presets':3,'decoded_original_keys':38,'original_typed_dictionary_parser_metadata_use':5690372,'local_game_data_adapter_implemented':False,'original_core_data_callback_runtime_verified':False,'next_boundary':'A real local dataset backed by original runtime presets and actual local state must be validated/persisted before original typed consumer17602; never forge cloud responses or DEFAULT fields. Audit remaining native application side effects first.'}
p.write_bytes(json.dumps(status,ensure_ascii=False,indent=2).encode())
marker='### 2026-11-18 Smash GameData真实冷启动协议和七个原生预设核清'
note='''

'''+marker+'''

上轮v9r2属于实际源码进展，212文件候选与GitHub均已核对。本轮继续纯静态核查，不重启游戏、不扣步，不重复同一锁屏观察或催促。测试站2026-11-18T03:23:09Z直连绕过代理仍A35completed/1review/45blocked/9queued/3failed，57未达，无本轮新增待验收；SSH94663当前仍有活跃控制句柄，继续只复用真实连接。

确认真实链路：SKServicesLoader.euv12611先原GameData.Init101051，再调用26067传实际UserService.field68本地UID；26067写GameData.field20 UID并调用8457，8457的第二参数实际bool，不能把它错当UID。GameData.Init/fyd43613将GameModeConstants.DEFAULT_PLAY_OPTIONS赋给field12；该字段真实类型PlayOptionsData，不是一个完整GameData或物品目录。原默认静态field offset120，4个default+3个special由原105580、44974、7298构造，包含地图名/模式/武器/队伍等真实字段，不得用4个空对象或擅自减少关卡来代替。7个预设不是7关，更不等于7图已运行。

原RVA严格解码7个源地图名：default1 Smash Island、default2 Smash Fort、default3 Lava Pit、default4 Steky's Speedway；special1 Sky Arena - Tunnels、special2 Graveyard CTF、special3 Slick 'n Slide。保留全部原162资源包、44场景变体；不把原默认预设当成完整玩法/地图菜单实测。原规则位掩码及构造逻辑保留原源码，没有执行或重新编造规则数值。

GameData实际云桥为FirebaseDatabaseBridge，原43611调用43638构造请求/登记回调并走云函数，挑战更新43637也走云桥；未请求这些API。GameSettings5302返回实际原参数类型，不能当作ready布尔。原17602要求Dictionary<string,object>；dayId字符串写field92，原43610对playOptions.ToString写field68并做真实类型/数据应用，原10177等待这两个实际内容。38个真实键已按原RVA/函数体逐项解码，包括dayId、playOptions、countryCode、fetchUserData、seasonData、dailyChallenges、seasonChallenges、uncollectedRewards、spinHighlights等。6173的真实常量是DEFAULT，不是错误文字；原DEFAULT特殊路径确实存在，但不能直接给field68/92填DEFAULT或造云端JSON来让门禁通过。原奖励/赛季/挑战消费仍有副作用，未完成退役或本地化审计。

已独立绑定原JsonConvert.DeserializeObject<Dictionary<string,object>>(string)为methodSpec85852、method71098、metadata-use5690372，原初始化调用者100493/100755/100756，shared native2114。8个原数据方法的参数核对并纠正首轮语义猜测；当前源审计共9个方法，包含原GameData consumer17602。这个绑定只说明真实类型入口存在，不等于可以喂假后端响应或调用成功。原完整C仅阅读，从未在开发机编译/运行原游戏函数。

下一步需要实现真正的本地GameData事务：读取原生实际默认预设和已加载的原目录，与真实本地身份/状态绑定，先验证并持久化真实输入，再沿原类型解析/数据应用/完成事件接入；不能只改ready，不能捏造云端dayId、赛季、奖励、权限。尤其应继续确认原17602/43610所有副作用及不适用于本地来源的消费者，保留原门禁和原字节证据。尚没有该本地数据适配器，不把这份源协议审计写成v10已修复或已激活。

当前运行候选仍v9r2，候选212文件和原任务blocked/round3/versionnull保持；上次实际玩家运行仍v4，3/5剩2，未启动观察器/预留第4步。桌面恢复和RustyPick/Craig额外额度请求仍待回复；B组、其它人工暂停、跳过/取消、Cow/采集及下游保持。V5.1运行包不因静态理解增加就覆盖；新原版事实单独归档，实际耗时/Token/费用未知null。
'''
handoff=b/'DIRECT_A_HANDOFF_20261118_SMASH_GAME_DATA_SOURCE.md';assert not handoff.exists();handoff.write_bytes(('# A组交接：GameData真实协议已核清，本地事务尚未实现\n'+note).encode())
progress=b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=progress.read_bytes();assert marker not in old.decode();progress.write_bytes(old+note.encode())
files={'handoff.md':handoff.read_bytes(),'current-status.json':p.read_bytes(),'source-proof/original-preset-arenas.json':json.dumps(presets,ensure_ascii=False,indent=2).encode(),'evidence/current-testsite.json':(b/'direct-a-testsite-current.json').read_bytes(),'evidence/v9r2-stage-receipt.json':(b/'direct-smash-optional-services-v9r2-stage-receipt-20261118.json').read_bytes(),'evidence/v9r2-github-receipt.json':(b/'direct-smash-optional-services-v9r2-github-receipt-20261118.json').read_bytes()}
for n in proofs:files['source-proof/'+n]=(a/n).read_bytes()
for folder in ['game-data-key-getters','game-mode-default-constructors','game-mode-preset-arenas','game-data-database-bridge','game-data-play-options-parser']:
    files['source-proof/'+folder+'.json']=(a/folder/'original-settings-constant-source.json').read_bytes()
for n in ['direct_smash_game_data_cold_start_contract_20261118.py','direct_smash_game_data_keys_source_20261118.py','direct_smash_game_mode_defaults_source_20261118.py','direct_smash_game_data_dictionary_parser_contract_20261118.py','direct_smash_game_data_source_prepare_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
main='''from pathlib import Path
import json,sys,zipfile,hashlib,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
candidate=Path('D:/GameLab/temp/direct-smash-optional-services-v9r2-20261118');cm=json.loads((candidate/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in cm.items():assert hashlib.sha256((candidate/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
stage=Path('D:/GameLab/temp/direct-smash-game-data-source-20261118-v1');stage.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(stage/'MANIFEST.json',manifest_raw)
note=__NOTE__;p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes()
if __MARKER__ not in old.decode('utf8'):write_bytes(p,old+note.encode())
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash GameData冷启动纯源码核查已同步：实际默认输入为PlayOptionsData，原4常规+3特殊预设及7地图名称已逐原RVA/构造函数确认；field20是用户UID，field68是playOptions字符串，field92是dayId；38原键和Dict<string,object>解析器metadata5690372已核清。不构造云端响应，不填DEFAULT/ready，不改奖励/权限；本地GameData事务仍未实现，运行候选保持v9r2。只读重核212文件SHA及原任务整行，未运行/接续/入库/扣步，仍3/5剩2，不计待验收。'},None,idem='direct-smash-game-data-source-20261118-'+hashlib.sha256(manifest_raw).hexdigest()[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(stage),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'current_candidate_files_verified':len(cm),'source_only':True,'game_executed':False,'runtime_candidate_changed':False,'local_game_data_adapter_implemented':False,'job_unchanged':True,'manual_pause_preserved':True,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''.replace('__NOTE__',repr(note)).replace('__MARKER__',repr(marker))
packet=b/'direct_smash_game_data_source_20261118.pyz';assert not packet.exists();compile(main,'publish-native-source-proof-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'source_only':True,'game_executed':False,'runtime_candidate_changed':False,'preset_arenas':slots},ensure_ascii=False))
