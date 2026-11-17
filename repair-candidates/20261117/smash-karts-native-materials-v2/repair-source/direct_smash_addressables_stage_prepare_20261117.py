"""Build a static-material zipapp for the existing authenticated Python bridge.
Its entry point verifies/extracts our files only; it never launches the game.
"""
from pathlib import Path
import json,hashlib,zipfile,sys,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'original-addressables-20261117';audit=json.loads((folder/'bundle-structure-audit.json').read_text(encoding='utf8'))
assert audit['complete'] and audit['observed']==audit['expected']==162 and audit['bytes']==160606474
files={}
for row in audit['rows']:
 p=r/row['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']
 name='materials/bundles/'+row['url'].rsplit('/',1)[1];assert name not in files;files[name]=p
catalog=json.loads((folder/'catalog-intake.json').read_text(encoding='utf8'))
for row in catalog['rows']:
 p=r/row['local_file'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'];files['materials/catalogs/'+p.name]=p
for n in ['catalog-intake.json','bundle-intake.json','bundle-attempt2.json','bundle-structure-audit.json']:files['evidence/'+n]=folder/n
for n in ['metadata-static-decode-proof.json','native-gameplay-map-abi.json','native-gameplay-wasm-map.json','flow-metadata-references.json','original-flow-source-excerpts.json','string-table-source-proof.json','string-table-native-source-excerpts.json','native-string-getter-index.json']:
 files['analysis/'+n]=r/'analysis-20261117'/n
for n in ['direct_smash_metadata_static_decode_20261117.py','direct_smash_native_method_map_20261117.py','direct_smash_named_analysis_20261117.py','direct_smash_metadata_references_20261117.py','direct_smash_string_getter_index_20261117.py','direct_smash_string_table_static_decode_20261117.py','direct_smash_catalog_intake_20261117.py','direct_smash_bundle_intake_20261117.py','direct_smash_bundle_retry_20261117.py','direct_smash_bundle_structure_audit_20261117.py']:
 files['repair-source/'+n]=b/n
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import SECTIONS,section_markdown,document
facts={'basic_facts':'原Smash Karts2.16.0，Unity2022.3.62f2。本次为未转换原材料补充，不是玩家运行包，未实机。',
 'asset_types':'原同构建桌面及移动两份Addressables目录均HTTPS200，按m_InternalIds去重162个UnityFS包，共160606474字节，全部逐SHA及容器/序列化读取通过。44个包标记scene bundle，包含两平台变体，不能称44关。首次4项超时/连接重置单独留存，限定一次补取后均200，未绕过TLS。',
 'system_design':'原两份UnityWebData中metadata重复32字节异或，按字节分布推导并完整验证31个表区间/零对齐、10391类型、95304方法归属与Token、48513字段。52重新从原材料提取并解码得到相同摘要。纯源码分析，不运行或改写原编译游戏。',
 'gameplay_rules':'原GameStartScreen练习按钮调用OnJoinRoundButtonClicked，再调用原StartRoundSpawn。存在原生BotManager/BotPlayer与PhotonNetwork，但不能据名称断言已具备独立单机。核心操作、对局与结算均未实机验证。',
 'level_configuration':'原资源目录的162个独立bundle齐全，保留原URL、文件名、SHA、原清单及HTTP回执；运行期其他动态资源和完整玩法闭包仍待核对。',
 'monetization':'原Firebase/联机、广告与商城消费者仍需源码适配，未伪造登录、支付、广告或服务器成功。',
 'core_loop':'',
 'code_reuse':'原Unity编译运行包未恢复作者编辑器工程。静态metadata/字符串表解码器、精确URL提取、资源获取/容器核对工具可编辑并有来源证据；不宣称原游戏玩法已可直接拆改复用。'}
profile={'specification_v51':{'template_version':'5.1','sections':{key:section_markdown(key,facts.get(key,''))for key in SECTIONS}}}
extra={'GAME_SPECIFICATION.md':document('Smash Karts（原材料补充，未交付）',profile).encode(),
 'game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),
 'README.md':('''# Smash Karts 同构建资源材料补充（未交付）

本目录没有已转换玩家入口，不是可启动游戏。原任务job-3db06205247a的状态/版本/预算不变，试玩0/5，不入库、不供货。
两份原metadata已静态解码并完整核对；精确原native资源前缀getter35469、JavaScript文件名桥100661/原import583与目录版本声明对应。原字符串RVA初始化仅重现字节异或算法，没有执行游戏或改变授权。
两份原目录均200，162独立bundle约160.6MB全数SHA和UnityFS/序列化结构读取通过，首次4项临时失败与一次补取均保留。44个scene bundle包括两平台变体，不代表44个关卡实测。
原启动、Firebase/Photon依赖及实际单机流程仍需解决，不能把材料齐全当可玩或待验收。V5.1十六维未知留空，逐游戏Token/实际处理耗时/费用为null。
''').encode(),
 'accounting.json':json.dumps({'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None,'note':'Source-only acquisition/analysis, no per-game attributable Codex billing.'},indent=2).encode()}
names=list(files)+list(extra);assert len(names)==len(set(n.lower()for n in names))
manifest={n:hashlib.sha256(p.read_bytes()).hexdigest()for n,p in files.items()};manifest.update({n:hashlib.sha256(raw).hexdigest()for n,raw in extra.items()})
manifest_raw=json.dumps(manifest,ensure_ascii=False,sort_keys=True,indent=2).encode();digest=hashlib.sha256(manifest_raw).hexdigest()
main='''from pathlib import Path
import zipfile,sys,json,hashlib,copy
with zipfile.ZipFile(sys.argv[0]) as archive:
 manifest_raw=archive.read('MATERIAL_MANIFEST.json');assert hashlib.sha256(manifest_raw).hexdigest()==__DIGEST__
 manifest=json.loads(manifest_raw)
 if '--verify-only' in sys.argv:
  for n,h in manifest.items():assert hashlib.sha256(archive.read(n)).hexdigest()==h,n
  print(json.dumps({'verified_zipapp_payload':True,'files':len(manifest),'game_executed':False}));raise SystemExit(0)
 root=Path('D:/GameLab/app');sys.path.insert(0,str(root));from controlplane.service import Service
 from controlplane.store import ACTOR
 from controlplane.atomic_files import write_bytes
 stage=Path('D:/GameLab/temp/direct-smash-addressables-materials-20261117-v1');stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());data=archive.read(n);assert hashlib.sha256(data).hexdigest()==h,n
  if p.exists():assert p.read_bytes()==data,n
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,data)
 p=stage/'MATERIAL_MANIFEST.json'
 if p.exists():assert p.read_bytes()==manifest_raw
 else:write_bytes(p,manifest_raw)
 for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
 svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'});jid='job-3db06205247a'
 with svc.store.read() as db:before=copy.deepcopy(svc.get(db,'jobs',jid));assert before['status']=='blocked' and not before.get('manual_paused')
 svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash Karts原同构建资源材料已同步52：两份Addressables目录200，162独立UnityFS包160606474字节逐SHA与原容器/序列化读取通过，含44个两平台scene bundle，不能当44关实测。原native前缀getter、原字符串RVA异或初始化及JS文件名桥静态证据完整。首次4项临时连接失败与限定一次补取回执保留。V5.1十六维及源码工具一并同步，未知耗时Token费用null。仅原材料补充，Firebase/Photon及实际单机流程仍待处理；无游戏启动、无状态版本预算变更，不入库不供货，试玩0/5。'},None,idem='direct-smash-addressables-materials-20261117-'+__DIGEST__[:12])
 with svc.store.read() as db:assert svc.get(db,'jobs',jid)==before
 out={'complete':True,'material_files':len(manifest),'bundles':162,'bundle_bytes':160606474,'catalogs':2,'manifest_sha256':__DIGEST__,'game_started':False,'ui_steps_used':0,'task_unchanged':True,'ready_review':False,'stage':str(stage)}
 write_bytes(stage/'receipt.json',json.dumps(out).encode());print(json.dumps(out))
'''.replace('__DIGEST__',repr(digest))
target=b/'direct_smash_addressables_materials_20261117.pyz';assert not target.exists(),'Read original transfer receipt before regenerating'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=3) as z:
 z.writestr('__main__.py',main);z.writestr('MATERIAL_MANIFEST.json',manifest_raw)
 for n,p in files.items():z.write(p,n)
 for n,raw in extra.items():z.writestr(n,raw)
out={'files':len(manifest),'bundles':162,'bundle_bytes':160606474,'manifest_sha256':digest,'zipapp_bytes':target.stat().st_size,'zipapp_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'game_executed':False}
(r/'addressables-material-stage-prepare.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
