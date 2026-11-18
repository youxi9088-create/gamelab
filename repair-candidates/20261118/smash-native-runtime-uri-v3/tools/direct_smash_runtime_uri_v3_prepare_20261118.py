"""Repair the actually rejected catalog URI using the original Unity resolver, statically."""
from pathlib import Path
import json,hashlib,struct,contextlib,io,zipfile,subprocess,sys,datetime,copy
from unity_hash128_spooky_v2_20261118 import unity_hash128
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'runtime-uri-v3-support-20261118';assert not out.exists();out.mkdir()
sha=lambda raw:hashlib.sha256(raw).hexdigest()
v2=r/'startup-settings-v2-support-20261118';recipe2=json.loads((v2/'support/assembly-recipe.json').read_bytes());base_manifest=recipe2['candidate_manifest']
v1=r/'work-resource-localization-v1-markupfix-20261118'
def base(name):
    p=v2/'overlay'/name
    if not p.exists():p=v1/name
    raw=p.read_bytes();assert sha(raw)==base_manifest[name],name;return raw
outcome=json.loads((b/'direct-smash-step1-outcome-20261118.json').read_bytes());assert outcome['relative_catalog_path_runtime_rejected']and outcome['ui_steps_used']==1 and outcome['ui_steps_remaining']==4
old='./assets/smash-original-webgl-bundles-20261118-source-v1/'
new='{UnityEngine.AddressableAssets.Addressables.RuntimePath}/';assert len(old)==len(new)==57
locator=json.loads((r/'analysis-20261118/catalog-locator-source/original-settings-constant-source.json').read_bytes());assert 'f_vqma(b, b)' in locator['original_source_snippets'][0]['source']
resolve=json.loads((r/'analysis-20261118/catalog-uri-resolution/original-settings-constant-source.json').read_bytes());assert 'return f_etr(a, a);'in next(x['source']for x in resolve['original_source_snippets']if x['function_index']==26827)
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');source=source[:source.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'static-uri-patch-read.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'static-uri-patch-read','exec'),ns)
raw=ns['raw'];leb=ns['leb'];u=ns['uleb'];sections=ns['sections'];assert sha(raw)==sha(base('Build/original.wasm'))
section=next(s for s in sections if s['kind']==10);count,p=leb(raw,section['start']);payload=bytearray(u(count));original_body=None;body_hashes=[]
for i in range(count):
    size,p=leb(raw,p);body=raw[p:p+size];p+=size;fn=ns['function_imports']+i
    if fn==35469:
        original_body=body;assert len(body)==228 and sha(body)=='329bf0ae2445968ad56eefbd6f8163f73b68259af4a4baf9b6e6af32bc0c9eaa'and body[-3:]==b'\x20\0\x0b'
        changed=body[:-1]+b'\x41\0\x10'+u(26827)+b'\x0b'
    else:changed=body
    body_hashes.append(dict(function_index=fn,before=sha(body),after=sha(changed),unchanged=changed==body))
    payload.extend(u(len(changed)));payload.extend(changed)
assert p==section['end']and sum(not x['unchanged']for x in body_hashes)==1
result=bytearray(raw[:8])
for s in sections:
    if s['kind']==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
    else:result.extend(raw[s['begin']:s['end']])
patched_wasm=bytes(result);wasm_path=out/'native-uri-resolver-full-validation-only.wasm';wasm_path.write_bytes(patched_wasm)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wasm_path)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
files={};candidate={};copies=[];metadata_patches=[]
def add(name,raw):assert name not in files;files[name]=raw
def target(name):return name.replace('assets/smash-original-webgl-bundles-20261118-source-v1/','StreamingAssets/aa/')
for n,h in base_manifest.items():
    dest=target(n);assert dest not in candidate;candidate[dest]=h;copies.append(dict(source=n,target=dest,sha256=h))
for n in ['Build/original-desktop.data','Build/original-mobile.data']:
    data=base(n);magic=b'UnityWebData1.0\0';assert data.startswith(magic);end=struct.unpack_from('<I',data,len(magic))[0];p=len(magic)+4;members=[]
    while p<end:
        offset,size,length=struct.unpack_from('<III',data,p);p+=12;name=data[p:p+length].decode();p+=length;members.append((name,offset,size))
    assert p==end
    name,offset,size=next(x for x in members if x[0]=='Il2CppData/Metadata/global-metadata.dat')
    mp=json.loads((r/'analysis-20261117/metadata-static-decode-proof.json').read_bytes())
    info=next(x for x in mp['variants']if x['variant'].startswith('e906')==('desktop'in n));key=bytes.fromhex(info['xor_key_hex']);encoded=data[offset:offset+size];decoded=bytes(v^key[i%32]for i,v in enumerate(encoded));default_data=struct.unpack_from('<I',decoded,72)[0]
    string_info=json.loads((r/'analysis-20261117/string-table-source-proof.json').read_bytes());at=default_data+string_info['original_field_value_offset']+2203
    old_bytes=decoded[at:at+57];assert bytes(v^((i+2203)&255)^170 for i,v in enumerate(old_bytes)).decode()==old
    new_bytes=bytes(v^((i+2203)&255)^170 for i,v in enumerate(new.encode()));new_encoded=bytes(v^key[(at+i)%32]for i,v in enumerate(new_bytes));absolute=offset+at;before=data[absolute:absolute+57];changed=data[:absolute]+new_encoded+data[absolute+57:]
    assert len(changed)==len(data)and sum(a!=c for a,c in zip(data,changed))<=57
    metadata_patches.append(dict(target=n,source=n,offset=absolute,before_hex=before.hex(),after_hex=new_encoded.hex(),source_sha256=sha(data),target_sha256=sha(changed),allowed_bytes=57,actual_byte_differences=sum(a!=c for a,c in zip(before,new_encoded))))
    candidate[n]=sha(changed)
catalogs=[]
for n in base_manifest:
    if n.startswith('assets/')and n.endswith('.json'):
        doc=json.loads(base(n));changed=copy.deepcopy(doc);replaced=0
        for i,value in enumerate(changed['m_InternalIds']):
            if value.startswith(old):changed['m_InternalIds'][i]=new+value[len(old):];replaced+=1
        assert replaced==83
        raw=json.dumps(changed,separators=(',',':'),ensure_ascii=False).encode();name=target(n);h=unity_hash128(raw);add('overlay/'+name,raw);add('overlay/'+str(Path(name).with_suffix('.hash')).replace('\\','/'),h.encode());candidate[name]=sha(raw);candidate[str(Path(name).with_suffix('.hash')).replace('\\','/')]=sha(h.encode());catalogs.append(dict(name=name,resource_ids_rebound=replaced,hash128=h,m_BuildResultHash=changed['m_BuildResultHash']))
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['game_path']=section_markdown('game_path','第1步真实52 Chrome已加载原生WASM/框架/数据和3份启动配置；TextDataProvider拒绝相对游戏目录，未进入核心玩法。v3以原Unity RuntimePath属性和原ResolveInternalId方法构造绝对同源目录，原游戏路径规则保留，尚待第2步复验。累计1/5，剩4步，不重置。')
profile['specification_v51']['sections']['system_design']=section_markdown('system_design','v3原资源前缀57字节改为Addressables.RuntimePath属性，原getter35469只追加调用原ResolveInternalId26827；原WASM其他函数体保持。两目录166资源URL同样使用原运行时属性，ContentCatalogData.CreateLocator原码12681本身会调用26827。原目录.hash按新真实内容重算，未禁用校验；资源移到StreamingAssets/aa，原162bundle字节不变。Firebase/账号/遥测/广告尚未完成退役，本地房间/玩家/AI仍未实现。')
add('overlay/game-profile.json',json.dumps(profile,ensure_ascii=False,indent=2).encode());add('overlay/GAME_SPECIFICATION.md',document('Smash Karts（原生URI修复待复验）',profile).encode())
add('overlay/README.md',base('README.md')+b'\n\n'+('## v3 原生相对URI实际失败修复\n\n原第1步已运行，目录因相对URI被Unity拒绝。采用原RuntimePath属性与ResolveInternalId，单getter追加标准SDK调用，不伪造提供者或账号状态；静态Wasm校验不代表游戏复验。原162bundle保留，所有地址按当前入口动态构造，不绑定端口或localhost；完整候选仍205文件，旧v1/v2不可变保留。剩余4步沿同一实时账本接续。\n\n官方路径机制：https://docs.unity.cn/Packages/com.unity.addressables%401.21/manual/TransformInternalId.html\n').encode())
for n,v in files.items():
    if n.startswith('overlay/'):candidate[n.removeprefix('overlay/')]=sha(v)
candidate['Build/original.wasm']=sha(patched_wasm)
codeproof=dict(function_index=35469,resolver_function_index=26827,original_body_hex=original_body.hex(),after_body_hex=(original_body[:-1]+b'\x41\0\x10'+u(26827)+b'\x0b').hex(),source_wasm_sha256=sha(ns['raw']),target_wasm_sha256=sha(patched_wasm),defined_functions=count,unchanged_other_function_bodies=count-1,wasm_static_validation_exit=res.returncode,scope='Only append originalSDK ResolveInternalId(string,MethodInfo) to originalcachedprefix getter result; no game execution, provider/account/ready/permission changes.')
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),base_stage='D:/GameLab/temp/direct-smash-startup-settings-v2-20261118',base_candidate_manifest=base_manifest,base_git_commit='d1ade5ea23ef9ef6202af01cf44a6d1f8d399808',candidate_manifest=candidate,copies=copies,wasm_patch=codeproof,metadata_patches=metadata_patches,catalogs=catalogs,native_prefix_before=old,native_prefix_after=new,runtime_failure_source='direct-smash-step1-outcome-20261118.json',current_ui_steps_used=1,current_ui_steps_remaining=4,game_executed=False,ready_review=False,sdk_retired=False)
assert len(candidate)==205
add('support/assembly-recipe.json',json.dumps(proof,ensure_ascii=False,indent=2).encode());add('support/function-preservation.json',json.dumps(body_hashes,separators=(',',':')).encode())
for n,rel in [('catalog-uri-methods.json','catalog-uri-bindings/path-declarations.json'),('catalog-locator-methods.json','catalog-locator-bindings/path-declarations.json'),('original-catalog-uri-resolution.json','catalog-uri-resolution/original-settings-constant-source.json'),('original-catalog-locator.json','catalog-locator-source/original-settings-constant-source.json'),('original-prefix-getter.json','catalog-uri-native-prefix/original-settings-constant-source.json')]:add('support/'+n,(r/'analysis-20261118'/rel).read_bytes())
add('support/step1-outcome.json',(b/'direct-smash-step1-outcome-20261118.json').read_bytes())
for n in ['direct_smash_runtime_uri_v3_prepare_20261118.py','direct_smash_runtime_uri_v3_stage_20261118.py','unity_hash128_spooky_v2_20261118.py']:add('tools/'+n,(b/n).read_bytes())
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_runtime_uri_v3_20261118.pyz';assert not packet.exists();main=(b/'direct_smash_runtime_uri_v3_stage_20261118.py').read_bytes();compile(main,'native-uri-stage-only','exec')
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps(dict(packet=str(packet),packet_bytes=packet.stat().st_size,files=len(files),candidate_files=len(candidate),defined_functions=count,game_executed=False,ui_steps_used=1,ui_steps_remaining=4,wasm_static_validation_exit=res.returncode)))
