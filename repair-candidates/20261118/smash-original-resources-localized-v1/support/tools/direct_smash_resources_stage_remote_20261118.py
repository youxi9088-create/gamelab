"""Materialize the exact prepared candidate from immutable52 sources; do not launch it."""
from pathlib import Path
import json,hashlib,zipfile,sys,struct,copy,datetime
sha=lambda raw:hashlib.sha256(raw).hexdigest()
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and before['candidate_id']=='game-60bd828457b8'and not before.get('version_id')and not before.get('manual_paused')
stage=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118')
roots={'native':Path('D:/GameLab/temp/direct-smash-native-materials-20261117-v1'),'addressables':Path('D:/GameLab/temp/direct-smash-addressables-materials-20261117-v1')}
def publish(name,raw):
 p=(stage/name).resolve();assert p.is_relative_to(stage.resolve())
 if p.exists():assert p.read_bytes()==raw,name
 else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,raw)
def members(raw):
 magic=b'UnityWebData1.0\0';assert raw.startswith(magic);end=struct.unpack_from('<I',raw,len(magic))[0];pos=len(magic)+4;rows=[]
 while pos<end:
  offset,size,n=struct.unpack_from('<III',raw,pos);pos+=12;name=raw[pos:pos+n].decode();pos+=n;assert pos<=end<=offset<=offset+size<=len(raw)
  rows.append({'name':name,'offset':offset,'bytes':size,'sha256':sha(raw[offset:offset+size])})
 assert pos==end
 return rows
with zipfile.ZipFile(sys.argv[0])as z:
 transfer=json.loads(z.read('TRANSFER_MANIFEST.json'))
 for n,h in transfer.items():assert sha(z.read(n))==h,n
 manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
 recipe=json.loads(z.read('support/assembly-recipe.json'));proof=json.loads(z.read('support/resource-localization-proof.json'))
 assert recipe['original_job_id']==jid and recipe['original_candidate_id']==before['candidate_id']
 assert proof['phase']=='resource_localization_only'and not proof['game_executed']and not proof['ready_review']
 assert proof['native_resource_prefix_after']=='./assets/smash-original-webgl-bundles-20261118-source-v1/'
 if (stage/'receipt.json').exists():
  receipt=json.loads((stage/'receipt.json').read_text(encoding='utf8'));assert receipt['complete']and receipt['manifest_sha256']==sha(manifest_raw)
  for n,h in manifest.items():assert sha((stage/n).read_bytes())==h,n
  print(json.dumps(receipt));raise SystemExit(0)
 stage.mkdir(exist_ok=True)
 for n in transfer:publish(n,z.read(n))
 for row in recipe['copies']:
  base=roots[row['root']];source=(base/row['source']).resolve();assert source.is_relative_to(base.resolve())
  raw=source.read_bytes();assert sha(raw)==row['sha256']and len(raw)==row['bytes'];publish('candidate/'+row['target'],raw)
 for row in recipe['webdata_patches']:
  source=(roots[row['root']]/row['source']).resolve();assert source.is_relative_to(roots[row['root']].resolve())
  raw=source.read_bytes();assert sha(raw)==row['source_sha256'];start=row['patch_offset'];old=bytes.fromhex(row['before_hex']);new=bytes.fromhex(row['after_hex']);assert len(old)==len(new)==57
  assert raw[start:start+57]==old
  changed=raw[:start]+new+raw[start+57:];assert len(changed)==row['bytes']and sha(changed)==row['target_sha256']
  before_members=members(raw);after_members=members(changed)
  old_meta=next(x for x in before_members if x['name']=='Il2CppData/Metadata/global-metadata.dat')
  new_meta=next(x for x in after_members if x['name']==old_meta['name']);key=bytes.fromhex(row['metadata_xor_format_key_hex']);assert len(key)==32
  raw_meta=raw[old_meta['offset']:old_meta['offset']+old_meta['bytes']];patched_meta=changed[new_meta['offset']:new_meta['offset']+new_meta['bytes']]
  decoded=bytes(v^key[i%32]for i,v in enumerate(raw_meta));decoded_new=bytes(v^key[i%32]for i,v in enumerate(patched_meta))
  assert sha(decoded)==row['metadata_source_sha256']and sha(decoded_new)==row['metadata_after_sha256']
  at=row['metadata_relative_offset'];assert start==old_meta['offset']+at
  assert decoded[:at]==decoded_new[:at]and decoded[at+57:]==decoded_new[at+57:]
  assert struct.unpack_from('<II',decoded_new)==(0xFAB11BAF,31)
  assert bytes(v^((2203+i)&255)^170 for i,v in enumerate(decoded_new[at:at+57])).decode()==proof['native_resource_prefix_after']
  assert sum(x==y for x,y in zip(before_members,after_members))==len(before_members)-1
  publish('candidate/'+row['target'],changed)
 ns={};exec(compile(z.read('support/tools/unity_hash128_spooky_v2_20261118.py'),'content-hash-only','exec'),ns);assert ns['selftest']()==2
 for cat in proof['catalogs']:
  catalog=stage/'candidate'/proof['native_resource_prefix_after'][2:]/cat['name'];raw=catalog.read_bytes()
  assert sha(raw)==cat['candidate_sha256']and ns['unity_hash128'](raw)==cat['candidate_hash128']
  assert catalog.with_suffix('.hash').read_text(encoding='ascii')==cat['candidate_hash128']
  parsed=json.loads(raw);assert parsed['m_BuildResultHash']==cat['m_BuildResultHash_retained']
  for value in parsed['m_InternalIds']:
   if value.startswith(('./assets/','https://','http://')):
    assert value.startswith('./assets/')
    target=(stage/'candidate'/value[2:]).resolve();assert target.is_relative_to((stage/'candidate').resolve())and target.is_file()
 for n,h in manifest.items():assert sha((stage/n).read_bytes())==h,n
 publish('MANIFEST.json',manifest_raw)
 assert sha((stage/'candidate/Build/original.wasm').read_bytes())=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash资源本地化独立候选已真实组装temp/direct-smash-resources-localized-v1-20261118：原162个bundle字节/SHA不变，两原目录各83条HTTP内部资源地址改为同源，其他目录字段和资源哈希不变；两份目录的配套.hash按实际新内容计算，算法独立匹配Unity公开向量及两份原目录真实.hash。桌面/移动原UnityWebData只修改metadata原RVA中57字节资源前缀范围，外层成员边界与其他8成员（包括UnityFS）保持，原WASM/框架/loader不变；原数据解压后扩展名改为.data/.wasm/.js，HTML原配置对应本地Build，4份原字体补齐。本轮0UI、未执行游戏；SDK/Firebase账号/广告消费者仍为原在线代码，未退役、未伪造成功或赋就绪。本候选只完成资源连接阶段，动态StreamingAssets和真正本地房间/角色/AI尚需核对，不能计整款离线或待验收。V5.1、未知耗时/Token/费用null及完整SHA随包，原任务整行保持，不安装/自动接续/供货。'},None,idem='direct-smash-resources-localized-v1-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'files_verified':len(manifest),'candidate_files':len(recipe['candidate_manifest']),'candidate_bytes':sum((stage/'candidate'/n).stat().st_size for n in recipe['candidate_manifest']),'original_bundles_retained':162,'catalog_ids_rebound':[83,83],'metadata_patch_regions_verified':2,'hash128_vectors_verified':2,'candidate_catalog_hash128_verified':2,'native_wasm_unchanged':True,'framework_unchanged':True,'loader_unchanged':True,'sdk_retired':False,'dynamic_resource_closure_verified':False,'game_executed':False,'ready_review':False,'job_unchanged':True,'manual_pause_preserved':True,'ui_steps_used':0,'ui_steps_remaining':5}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
