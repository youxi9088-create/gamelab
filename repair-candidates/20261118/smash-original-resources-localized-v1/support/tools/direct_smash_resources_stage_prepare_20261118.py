"""Create lightweight52 assembly packet plus complete Git archive with identical manifests."""
from pathlib import Path
import json,hashlib,zipfile,sys
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';work=r/'work-resource-localization-v1-markupfix-20261118';support=r/'resource-localization-v1-support-20261118'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
recipe=json.loads((support/'assembly-recipe.json').read_text(encoding='utf8'));proof=json.loads((support/'resource-localization-proof.json').read_text(encoding='utf8'))
proof_bytes=(support/'resource-localization-proof.json').read_bytes()
assert recipe['proof_sha256']==sha(json.dumps(proof,ensure_ascii=False,indent=2).encode())
recipe['canonical_proof_sha256']=recipe['proof_sha256']
recipe['proof_sha256']=sha(proof_bytes)
sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.game_specification_v51 import SECTIONS,section_markdown,document
facts={'basic_facts':'Smash Karts2.16.0，Unity2022.3.62f2/IL2CPP31；资源本地化独立候选，不是已交付单机版。','asset_types':'两份原目录各83个资源URL改为同源，共162个原bundle逐SHA保留；4份原Baloo2字体已按原CSS精确URL取得，未新造场景/角色/音效。','game_path':'原桌面及移动UnityWebData的metadata只改原RVA中57字节资源前缀范围；原WASM、框架、loader及UnityFS不改。相对本地URI的实际Unity加载尚未实机验证，不能把文件闭包当玩法通过。','system_design':'当前只处理资源连接：HTML构建配置和目录URI本地化，真正缓存.hash按新目录字节计算且匹配独立官方向量/原源配套文件。SDK/Firebase/账号/广告仍为原在线消费者，动态StreamingAssets及本地对局初始化不完整。','level_configuration':'162包为桌面/移动两平台目录并集，44个scene bundle不是44关实测；本修订未执行游戏、未测地图、角色、AI或对局。','monetization':'未修改原价格、付费、货币、奖励或SDK/provider成功标志；未进行账号伪造、广告奖励回调或数据库成功替代。当前不宣称完成退役。'}
profile={'specification_v51':{'template_version':'5.1','sections':{k:section_markdown(k,facts.get(k,''))for k in SECTIONS}}}
docs={'GAME_SPECIFICATION.md':document('Smash Karts（资源本地化未交付候选）',profile).encode(),'game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'conversion-accounting.json':json.dumps({'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost_cny':None},indent=2).encode(),'README.md':'''# Smash Karts · 资源本地化未交付候选

仅完成资源连接阶段：两原目录各83条资源URL本地化，162原包保持；原桌面/移动metadata的资源前缀换成等长相对路径，其余原生数据和代码保持。原已解压的构建文件使用.data/.wasm/.js扩展名，原HTML配置同步；4个字体源文件补齐。原源码和失败准备目录均保留，不覆盖历史。

原两份配套.hash已真实取得，均不同于m_BuildResultHash，也不同于目录MD5。工具按Unity使用的SpookyHash V2重算，2个Unity公开向量与2份原目录实际.hash全部匹配；改写后的目录/hash一致，m_BuildResultHash与资源哈希保持。没有禁用或绕过引擎校验。

Unity官方目录说明：https://docs.unity3d.com/kr/Packages/com.unity.addressables%401.21/api/UnityEngine.AddressableAssets.Addressables.LoadContentCatalogAsync.html
Hash128官方定义与向量：https://docs.unity.com/en-us/engine/6000.3/script-reference/unityengine/hash128/compute
公开SpookyHash V2原算法（Bob Jenkins，public domain）：https://burtleburtle.net/bob/c/SpookyV2.h

当前SDK/Firebase账号、数据库、广告等仍是原在线代码；只是原静态脚本已映射到捕获的原本地文件，不代表服务已退役。没有本地房间/玩家/AI启动适配，没有SDK/provider假成功或奖励。其他动态StreamingAssets/资源闭包及真实Unity相对URI加载尚未核对。

本候选没有启动或试玩，0/5额度保持，不安装/接续/入库/推送下游。V5.1只记录当前事实，未知独占耗时/Token/缓存/费用null。资源阶段不能冒充整款离线通过或待验收。
'''.encode()}
for n,raw in docs.items():
 p=work/n;assert not p.exists();p.write_bytes(raw);recipe['candidate_manifest'][n]=sha(raw)
support_files={'support/assembly-recipe.json':json.dumps(recipe,ensure_ascii=False,indent=2).encode(),'support/resource-localization-proof.json':(support/'resource-localization-proof.json').read_bytes(),'support/sidecar-intake.json':(support/'sidecar-intake.json').read_bytes()}
for n in ['direct_smash_resources_localize_v1_20261118.py','direct_smash_resource_sidecars_intake_20261118.py','unity_hash128_spooky_v2_20261118.py','direct_smash_resources_stage_remote_20261118.py','direct_smash_resources_stage_prepare_20261118.py']:
 support_files['support/tools/'+n]=(b/n).read_bytes()
all_files={'candidate/'+n:work/n for n in recipe['candidate_manifest']}
manifest={n:sha(p.read_bytes())for n,p in all_files.items()};assert all(manifest['candidate/'+n]==h for n,h in recipe['candidate_manifest'].items())
manifest.update({n:sha(raw)for n,raw in support_files.items()});manifest_raw=json.dumps(manifest,sort_keys=True,indent=2).encode()
packet_files=dict(support_files)
for n,raw in docs.items():packet_files['candidate/'+n]=raw
for p in (support/'payload').rglob('*'):
 if p.is_file():packet_files['candidate/'+p.relative_to(support/'payload').as_posix()]=p.read_bytes()
assert all(manifest[n]==sha(raw)for n,raw in packet_files.items())
main=(b/'direct_smash_resources_stage_remote_20261118.py').read_text(encoding='utf8');compile(main,'resource-candidate-remote-assembly','exec')
packet=b/'direct_smash_resources_localized_v1_20261118.pyz';archive=b/'direct_smash_resources_localized_v1_github_20261118.pyz';assert not packet.exists()and not archive.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
 z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest_raw);z.writestr('TRANSFER_MANIFEST.json',json.dumps({n:sha(raw)for n,raw in packet_files.items()},sort_keys=True,indent=2))
 for n,raw in packet_files.items():z.writestr(n,raw)
verify_main="import zipfile,sys,json,hashlib\nwith zipfile.ZipFile(sys.argv[0])as z:\n for n,h in json.loads(z.read('MANIFEST.json')).items():assert hashlib.sha256(z.read(n)).hexdigest()==h,n\nprint('Archive bytes verified; no game or task executed')\n"
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=1)as z:
 z.writestr('__main__.py',verify_main);z.writestr('MANIFEST.json',manifest_raw)
 for n,p in all_files.items():z.write(p,n)
 for n,raw in support_files.items():z.writestr(n,raw)
out={'manifest_sha256':sha(manifest_raw),'files':len(manifest),'candidate_files':len(all_files),'packet_bytes':packet.stat().st_size,'archive_bytes':archive.stat().st_size,'candidate_bytes':sum(p.stat().st_size for p in all_files.values()),'game_executed':False,'ready_review':False}
p=support/'stage-prepare.json';assert not p.exists();p.write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
