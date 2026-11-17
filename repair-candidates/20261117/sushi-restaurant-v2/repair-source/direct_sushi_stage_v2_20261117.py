from pathlib import Path
import json,hashlib,datetime,zipfile,io,base64,sys
b=Path(__file__).parent;r=b/'direct-games/job-ad79ce70fd26';source=r/'work-native-local-v2';sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.game_specification_v51 import SECTIONS,section_markdown,document
facts={
 'basic_facts':'Cocos Creator 3.5.1原版回转寿司餐厅经营游戏。保留原编译模块、素材与配置；微信容器接口转为浏览器画布、输入、音频及本地存储。当前为未交付修订候选，累计两次原生启动验证失败，本次最多再验证三步。',
 'asset_types':'原Cocos main/resources/start-scene及scripts资源包，含JSON导入容器、PNG纹理、音频和原脚本。1082个保留assets文件与上次候选逐字节一致，452个显式导入路径均存在。1051个同相对路径且同字节的subpackages别名合并；独立subpackages/resources/game.js保留。动态路径仍待实机核对。',
 'controls':'浏览器真实鼠标/触摸映射至原Cocos触摸事件；画布按原750×1334设计比例显示。尚未核清完整实机路径。',
 'core_loop':'保留原餐厅经营、顾客、寿司、升级及存档模块和配置。具体本轮经营闭环尚未通过实机，不标记完成。',
 'gameplay_rules':'原玩法数值、资源、配置及关卡数据未改。原生广告、录屏、分享、埋点的不可用实际调用从消费者位置移除，两份Datanexus/Gravity SDK模块及配对依赖已退役；未伪造账号、广告观看成功或外部API返回。',
 'key_numbers':'设计分辨率750×1334；Cocos 3.5.1。经营数值沿用原配置，此处不根据未实测画面推断。',
 'level_configuration':'保留原资源与配置，不以删关、少量替代资源或强制通关满足交付。',
 'system_design':'保留原GamePanel和原本地PlatformDefault资源加载路径。浏览器使用真实localStorage、WebAudio、图片及画布；原生SDK功能不提供成功替身。',
 'theme':'原回转寿司餐厅题材与原美术资源。',
 'progression_economy':'原成长、金币和升级逻辑保持；浏览器存储使用original-sushi命名空间。本轮尚未验证金币结算及刷新恢复。',
 'monetization':'原广告入口与原生广告/录屏实际调用退役。沿用此前候选已有的本地领取确认/取消逻辑，不冒称观看广告或支付成功，本轮未新增奖励规则。',
}
profile={'specification_v51':{'template_version':'5.1','sections':{k:section_markdown(k,facts.get(k,''))for k in SECTIONS}}}
(source/'game-profile.json').write_text(json.dumps(profile,ensure_ascii=False,indent=2),encoding='utf8');(source/'GAME_SPECIFICATION.md').write_text(document('回转寿司餐厅（未交付修订候选）',profile),encoding='utf8')
ledger=r/'ui-ledger.json'
if not ledger.exists():ledger.write_text(json.dumps({'job_id':'job-ad79ce70fd26','max_steps':5,'steps_used':2,'remaining':3,'steps':[{'step':1,'outcome':'Original local Cocos loader failed: assets/main/index.js absent.','evidence':'work/evidence/direct-repair/network-first-loader-failure.json'},{'step':2,'outcome':'After native launchers, GamePanel provider call and Datanexus wx.request failed.','evidence':'work/evidence/direct-repair/console-second-startup-failure.json'}],'admitted':False,'runtime_verified':False},ensure_ascii=False,indent=2),encoding='utf8')
manifest={p.relative_to(source).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in source.rglob('*')if p.is_file()};assert len(manifest)<2000
buffer=io.BytesIO()
with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED)as z:
 for name in sorted(manifest):z.writestr(name,(source/name).read_bytes())
 z.writestr('MANIFEST.json',json.dumps(manifest,indent=2))
raw=buffer.getvalue();sha=hashlib.sha256(raw).hexdigest();(r/'native-local-stage-20261117-v2.zip').write_bytes(raw)
server=(b/'direct_omnis_observation_server.py').read_text(encoding='utf8').replace('OMNIS','Sushi').replace(".replace('<head>','<head><script src=\"/__observe.js\"></script>',1)",".replace('<script src=\"bridge.js\">','<script src=\"/__observe.js\"></script><script src=\"bridge.js\">',1)")
assert '.replace(\'<head>\''not in server;compile(server,'sushi-observation-server','exec')
remote='''from pathlib import Path
import json,hashlib,base64,io,zipfile,sqlite3,datetime
stage=Path('D:/GameLab/temp/direct-sushi-local-20261117-v2');stage.mkdir(exist_ok=True)
with sqlite3.connect('file:D:/GameLab/app/data/platform.sqlite3?mode=ro',uri=True)as db:
 raw_job=db.execute('SELECT data FROM records WHERE kind=?and id=?',('jobs','job-ad79ce70fd26')).fetchone()[0];job=json.loads(raw_job)
 assert job['manual_paused'] and job['status']=='queued' and job.get('version_id')is None,(job['status'],job.get('version_id'),job.get('manual_paused'))
raw=base64.b64decode(__PAYLOAD__);assert hashlib.sha256(raw).hexdigest()==__SHA__
source=stage/'converted'
with zipfile.ZipFile(io.BytesIO(raw))as z:
 for info in z.infolist():
  p=(source/info.filename).resolve();assert p.is_relative_to(source.resolve())and not(info.external_attr>>16&0o170000)==0o120000;data=z.read(info.filename)
  if p.exists():assert p.read_bytes()==data,info.filename
  else:p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
manifest=json.loads((source/'MANIFEST.json').read_text(encoding='utf8'))
for name,digest in manifest.items():assert hashlib.sha256((source/name).read_bytes()).hexdigest()==digest,name
server=stage/'observation_server.py';data=__SERVER__.encode('utf8')
if server.exists():assert server.read_bytes()==data
else:server.write_bytes(data)
(stage/'validation').mkdir(exist_ok=True)
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':len(manifest),'package_sha256':__SHA__,'job_record_sha256':hashlib.sha256(raw_job.encode()).hexdigest(),'manual_paused':job['manual_paused'],'stage':str(stage),'game_started':False,'task_job_unchanged':True}
(stage/'prepare-receipt.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
'''.replace('__SERVER__',repr(server)).replace('__SHA__',repr(sha)).replace('__PAYLOAD__',repr(base64.b64encode(raw).decode()))
compile(remote,'sushi-stage','exec');(b/'direct_sushi_stage_v2_remote_20261117.py').write_text(remote,encoding='utf8')
persistent=(b/'direct_omnis_observer_persistent.py').read_text(encoding='utf8').replace('direct-omnis-local-20261116-v1','direct-sushi-local-20261117-v2').replace('GameLabDirectOmnisObserve20261117','GameLabDirectSushiObserve20261117').replace("proof['files']==220",f"proof['files']=={len(manifest)}").replace('len(manifest)==220',f'len(manifest)=={len(manifest)}')
(b/'direct_sushi_observer_persistent_20261117.py').write_text(persistent,encoding='utf8')
print(json.dumps({'files':len(manifest),'bytes':len(raw),'sha256':sha,'ledger':json.loads(ledger.read_text(encoding='utf8'))['steps_used']}))
