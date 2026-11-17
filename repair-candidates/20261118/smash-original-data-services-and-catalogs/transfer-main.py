"""Verify original source bodies and embedded catalogs on52; never start a game."""
from pathlib import Path
import sys,json,zipfile,hashlib,struct,gzip,copy,datetime
sha=lambda raw:hashlib.sha256(raw).hexdigest()
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and before['candidate_id']=='game-60bd828457b8'and not before.get('manual_paused')and not before.get('version_id')
native=Path('D:/GameLab/temp/direct-smash-native-materials-20261117-v1')
wasm=(native/'native-build/aedef0a7b3758084f1b210f292a2b27d.wasm.br').read_bytes()
assert sha(wasm)=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
meta=Path('D:/GameLab/temp/direct-smash-metadata-source-20261117-v1/analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
assert sha(meta)=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
web=(native/'native-build/e906ad610c88fe82b2d0199b3cc0e7fb.data.br').read_bytes()
magic=b'UnityWebData1.0\0';assert web.startswith(magic);end=struct.unpack_from('<I',web,len(magic))[0];pos=len(magic)+4;containers=[]
while pos<end:
 start,size,n=struct.unpack_from('<III',web,pos);pos+=12;name=web[pos:pos+n].decode();pos+=n;assert pos<=end<=start<=start+size<=len(web)
 if name=='data.unity3d':containers.append(web[start:start+size])
assert pos==end and len(containers)==1
data=containers[0];assert sha(data)=='a8a15c03255abf9c2413a1b30e36164abc79ade9a0190dcedcac29326c49c7e2'
def leb(raw,p):
 value=shift=0
 while True:
  assert p<len(raw)and shift<=35
  byte=raw[p];p+=1;value|=(byte&127)<<shift;shift+=7
  if not byte&128:return value,p
sections={};p=8;assert wasm[:8]==b'\0asm\1\0\0\0'
while p<len(wasm):
 kind=wasm[p];size,p=leb(wasm,p+1);assert p+size<=len(wasm);sections[kind]=(p,p+size);p+=size
imports,_=leb(wasm,sections[2][0]);assert imports==599
stage=Path('D:/GameLab/temp/direct-smash-data-services-source-v1-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
 manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
 for n,h in manifest.items():assert sha(z.read(n))==h,n
 pipeline=json.loads(z.read('analysis/settings-pipeline-source-proof.json'))
 assert pipeline['original_common_database_path']=='gameSettingsUrls/common/'and pipeline['network_requests_made']==0
 for n,h in pipeline['original_input_hashes'].items():assert sha((native/n).read_bytes())==h,n
 service=json.loads(z.read('analysis/service-original-source-proof.json'))
 assert len(service['original_source_snippets'])==233 and len(service['original_instruction_snippets'])==235
 assert service['source_decompilation_excluded_functions']==[26015,43610]
 bodies={}
 for row in service['mapping']['original_body_proofs']:bodies[row['function_index']]=row['body_sha256']
 for n in ['analysis/original-settings-constant-source.json','analysis/original-settings-url-source.json']:
  for row in json.loads(z.read(n))['original_body_hashes']:
   assert row['function_index']not in bodies;bodies[row['function_index']]=row['sha256']
 embedded=json.loads(z.read('analysis/embedded-catalog-source-proof.json'))
 for row in embedded['original_consumer_body_hashes']:
  assert row['function_index']not in bodies;bodies[row['function_index']]=row['sha256']
 count,p=leb(wasm,sections[10][0]);matched=0
 for i in range(count):
  size,p=leb(wasm,p);fn=i+imports
  if fn in bodies:assert sha(wasm[p:p+size])==bodies[fn];matched+=1
  p+=size
 assert p==sections[10][1]and matched==len(bodies)==250
 ns={};exec(compile(z.read('unityfs_source_reader_20261118.py'),'bounded-unityfs-data-reader','exec'),ns)
 files,container=ns['unpack'](data);independent=json.loads(z.read('analysis/independent-container-catalog-proof.json'))
 assert container==independent['container']
 assert len(container['blocks'])==404 and len(files)==12
 for o in independent['objects']:
  member=files[o['file']];chunk=member[o['byte_start']:o['byte_start']+o['byte_size']]
  assert sha(chunk)==o['object_sha256']
  p=0;n=struct.unpack_from('<I',chunk,p)[0];p+=4;name=chunk[p:p+n].decode();p=(p+n+3)&~3
  n=struct.unpack_from('<I',chunk,p)[0];p+=4;encoded=chunk[p:p+n]
  assert name==o['name']and sha(encoded)==o['encoded_sha256']
  assert encoded==z.read('editable-original-data/'+name+'.original.gz')
  decoded=gzip.decompress(encoded);assert sha(decoded)==o['decoded_sha256']
  assert decoded==z.read('editable-original-data/'+name+'.original-decoded.json')
  value=json.loads(decoded);assert len(value)==o['root_count']
  if name=='ItemDatas':assert sum(len(v)for v in value.values())==o['total_items']==1493
  else:assert name=='ContentGroups'and len(value)==48
 if (stage/'receipt.json').exists():
  receipt=json.loads((stage/'receipt.json').read_text(encoding='utf8'));assert receipt['complete']and receipt['manifest_sha256']==sha(manifest_raw)
  for n,h in manifest.items():assert sha((stage/n).read_bytes())==h
  print(json.dumps(receipt));raise SystemExit(0)
 stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  payload=z.read(n);p=(stage/n).resolve();assert p.is_relative_to(stage.resolve())
  if p.exists():assert p.read_bytes()==payload
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,payload)
 write_bytes(stage/'MANIFEST.json',manifest_raw)
 for n,h in manifest.items():assert sha((stage/n).read_bytes())==h
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash原生数据服务源码及原始数据已同步独立temp/direct-smash-data-services-source-v1-20261118：7类服务235原函数指令完整保存，233结构化读取，另2复杂函数WABT内存错误仅保留完整指令，不冒充空函数；52从原WASM独立核对合计250函数体SHA。原UnityFS用第二个纯数据LZ4读取器重解404块/12成员，原resources.assets字节范围和GZIP CRC/SHA独立核对，恢复1493物品记录及48内容组，保留原价格/解锁/资源引用。原ftueItems空、global是词表，不能称完整默认设置。设置链已精确绑定原gameSettingsUrls/common/数据库节点→原_GetValueJS/getValueTT→实际返回URL→原UnityWebRequest.Get；不猜CDN地址、不调用数据库/登录、不造返回值或provider就绪。原GameSettingsData默认构造器可读，但本地角色/房间/AI初始化仍未实现，当前无运行候选、0/5输入、未安装/接续/入库。V5.1及未知独占耗时/Token/费用null随包。'},None,idem='direct-smash-data-services-source-v1-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'files_verified':len(manifest),'manifest_sha256':sha(manifest_raw),'original_wasm_body_hashes_verified':matched,'structured_source_functions':233,'instruction_source_functions':235,'original_container_blocks_verified':404,'original_container_members_verified':12,'original_catalog_object_byte_ranges_verified':True,'object_ids_independently_reparsed_on_remote':False,'original_item_records_verified':1493,'original_content_groups_verified':48,'database_or_cdn_requests':0,'game_executed':False,'job_unchanged':True,'manual_pause_preserved':True,'ready_review':False,'ui_steps_used':0,'ui_steps_remaining':5}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
