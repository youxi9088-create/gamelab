"""Transfer static source proof only; verify the current remote originals before writing."""
from pathlib import Path
import sys,zipfile,json,hashlib,copy,struct
sha=lambda raw:hashlib.sha256(raw).hexdigest()
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
assert before['candidate_id']=='game-60bd828457b8'
native=Path('D:/GameLab/temp/direct-smash-native-materials-20261117-v1/native-build')
wasm=native/'aedef0a7b3758084f1b210f292a2b27d.wasm.br'
assert sha(wasm.read_bytes())=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
meta=Path('D:/GameLab/temp/direct-smash-metadata-source-20261117-v1/analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat')
assert sha(meta.read_bytes())=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
raw=(native/'e906ad610c88fe82b2d0199b3cc0e7fb.data.br').read_bytes()
signature=b'UnityWebData1.0\0';assert raw.startswith(signature)
end=struct.unpack_from('<I',raw,len(signature))[0];pos=len(signature)+4;matches=[]
while pos<end:
 start,size,n=struct.unpack_from('<III',raw,pos);pos+=12;name=raw[pos:pos+n].decode();pos+=n
 assert pos<=end<=start<=start+size<=len(raw)
 if name=='data.unity3d':matches.append(raw[start:start+size])
assert pos==end and len(matches)==1
assert sha(matches[0])=='a8a15c03255abf9c2413a1b30e36164abc79ade9a0190dcedcac29326c49c7e2'
stage=Path('D:/GameLab/temp/direct-smash-settings-source-v1-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
 manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
 for n,h in manifest.items():assert sha(z.read(n))==h,n
 values=json.loads(z.read('analysis/server-settings-serialized-values-verified.json'))
 assert values['actual_start_in_offline_mode']is False and values['independent_reencoding_matches_original']
 assert values['object_bytes']==656 and values['serialized_offline_byte_offset']==168
 gates=json.loads(z.read('analysis/local-bootstrap-service-gates.json'))
 assert len(gates['generic_references'])==7 and len(gates['original_source_snippets'])==8
 assert not values['game_executed']and not gates['original_modified']
 if (stage/'receipt.json').exists():
  receipt=json.loads((stage/'receipt.json').read_text(encoding='utf8'))
  assert receipt['complete']and receipt['manifest_sha256']==sha(manifest_raw)
  for n,h in manifest.items():assert sha((stage/n).read_bytes())==h
  print(json.dumps(receipt));raise SystemExit(0)
 stage.mkdir(exist_ok=True)
 for n,h in manifest.items():
  p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());payload=z.read(n)
  if p.exists():assert p.read_bytes()==payload
  else:p.parent.mkdir(parents=True,exist_ok=True);write_bytes(p,payload)
 write_bytes(stage/'MANIFEST.json',manifest_raw)
 for n,h in manifest.items():assert sha((stage/n).read_bytes())==h
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash Karts本地模式源码证据同步：原ServerSettings.StartInOfflineMode运行时偏移26、原resources.assets/51序列化偏移168，实际false；656字节配置按metadata字段独立编码完全一致，AppID内容仅保留哈希。原连接Update仍核对真实Firebase身份；进一步从原metadata注册MethodSpec/泛型实例定位7个服务引用及原启动检查中的5个布尔字段，不据此强行赋就绪。52重新核对原WASM、metadata及桌面data.unity3d SHA；7份分析和6个工具、V5.1与未知用量null保存独立temp。无运行包改动、无SDK/provider成功伪造、无游戏执行/输入/自动接续/入库；保留0/5，原任务状态版本不变。'},None,idem='direct-smash-settings-source-v1-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out={'complete':True,'stage':str(stage),'files_verified':len(manifest),'manifest_sha256':sha(manifest_raw),'original_wasm_verified':True,'original_metadata_verified':True,'original_desktop_data_verified':True,'original_config_reparsed_on_remote':False,'local_config_independently_reencoded':True,'source_only':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':0,'ui_steps_remaining':5,'job':{k:before.get(k)for k in ['id','status','version_id','round','manual_paused']}}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
