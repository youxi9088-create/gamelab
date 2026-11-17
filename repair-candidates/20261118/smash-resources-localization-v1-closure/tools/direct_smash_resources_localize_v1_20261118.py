"""Prepare a resource-localized original build; SDK/account/gameplay remain incomplete."""
from pathlib import Path
import json,hashlib,struct,re,shutil,datetime,urllib.parse
from html.parser import HTMLParser
from html import escape as html_escape
from unity_hash128_spooky_v2_20261118 import unity_hash128,selftest
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';work=r/'work-resource-localization-v1-markupfix-20261118';assert not work.exists();work.mkdir()
sha=lambda raw:hashlib.sha256(raw).hexdigest()
prefix='./assets/smash-original-webgl-bundles-20261118-source-v1/';assert len(prefix)==57
old_prefix='https://smashkartsgc.b-cdn.net/assetbundles/remote/webgl/';assert len(old_prefix)==57
manifest={};copies=[];payloads={};patches=[];web_proofs=[];catalog_proofs=[];member_preservation=[]
def put(name,raw,source=None):
 p=(work/name).resolve();assert p.is_relative_to(work.resolve())and not p.exists();p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw);manifest[name]=sha(raw)
 if source:copies.append({'target':name,**source,'sha256':sha(raw),'bytes':len(raw)})
 else:payloads[name]=raw
def copy_native(src,dst):
 p=r/src;put(dst,p.read_bytes(),{'root':'native','source':str(src).replace('original-20261117/','original/').replace('native-build-20261117/','native-build/')})
for p in (r/'original-20261117').rglob('*'):
 if not p.is_file():continue
 name=p.relative_to(r/'original-20261117').as_posix()
 if name in ['source-entry.html','_remote/3a125e88c76c9347/css2']:continue
 copy_native('original-20261117/'+name,name)
html=(r/'original-20261117/source-entry.html').read_text(encoding='utf8')
external_scripts=re.findall(r'<script[^>]*src="(https://[^"]+)"',html)
for url in external_scripts:
 local='_remote/'+sha(url.encode())[:16]+'/'+url.rsplit('/',1)[1]
 assert local in manifest;html=html.replace(url,local)
font_css=(r/'original-20261117/_remote/3a125e88c76c9347/css2').read_text(encoding='utf8')
intake=json.loads((r/'resource-sidecars-20261118/intake.json').read_text(encoding='utf8'))
assert len(intake['rows'])==6 and all(x['complete']and x['http']==200 for x in intake['rows'])
for row in intake['rows']:
 if row['kind']!='font':continue
 raw=(r/row['local_file']).read_bytes();assert sha(raw)==row['sha256'];name=Path(row['local_file']).name
 put('styles/fonts/'+name,raw);assert row['url']in font_css;font_css=font_css.replace(row['url'],'fonts/'+name)
assert 'https://'not in font_css and 'http://'not in font_css
put('styles/baloo2.css',font_css.encode())
font_url='https://fonts.googleapis.com/css2?family=Baloo+2:wght@600&display=swap'
font_markup=[v for v in [font_url,html_escape(font_url,quote=True)]if v in html];assert len(font_markup)==1
html=html.replace(font_markup[0],'styles/baloo2.css')
assert 'images/icon-144.png'in html;html=html.replace('images/icon-144.png','images/favicon.png')
replacements={'https://smashkartsgc.b-cdn.net/Build2020New':'Build','/e906ad610c88fe82b2d0199b3cc0e7fb.data.br':'/original-desktop.data','/0a3efef53b64864ab981529f48d1a272.data.br':'/original-mobile.data','/41c0f438c941cb52e5a25dae21ba9c27.framework.js.br':'/original.framework.js','/aedef0a7b3758084f1b210f292a2b27d.wasm.br':'/original.wasm','/c4ce55f6fd990c1236bc84106eb955bf.loader.js':'/original.loader.js'}
for old,new in replacements.items():assert old in html;html=html.replace(old,new)
put('index.html',html.encode())
for src,dst in [('aedef0a7b3758084f1b210f292a2b27d.wasm.br','original.wasm'),('41c0f438c941cb52e5a25dae21ba9c27.framework.js.br','original.framework.js'),('loader-existing-proxy-response.bin','original.loader.js')]:
 copy_native('native-build-20261117/'+src,'Build/'+dst)
assert (work/'Build/original.wasm').read_bytes()[:8]==b'\0asm\1\0\0\0'
metadata=json.loads((r/'analysis-20261117/metadata-static-decode-proof.json').read_text(encoding='utf8'))
string_proof=json.loads((r/'analysis-20261117/string-table-source-proof.json').read_text(encoding='utf8'))
def web_members(raw):
 magic=b'UnityWebData1.0\0';assert raw.startswith(magic);end=struct.unpack_from('<I',raw,len(magic))[0];pos=len(magic)+4;rows=[]
 while pos<end:
  offset,n,size=struct.unpack_from('<III',raw,pos);pos+=12;name=raw[pos:pos+size].decode();pos+=size;assert pos<=end<=offset<=offset+n<=len(raw)
  rows.append({'name':name,'offset':offset,'bytes':n,'sha256':sha(raw[offset:offset+n])})
 assert pos==end
 return rows
for variant,dst in [('e906ad610c88fe82b2d0199b3cc0e7fb','original-desktop.data'),('0a3efef53b64864ab981529f48d1a272','original-mobile.data')]:
 source='native-build/'+variant+'.data.br';raw=(r/'native-build-20261117'/(variant+'.data.br')).read_bytes();rows=web_members(raw)
 member=next(x for x in rows if x['name']=='Il2CppData/Metadata/global-metadata.dat')
 info=next(x for x in metadata['variants']if x['variant']==variant);encrypted=raw[member['offset']:member['offset']+member['bytes']];assert sha(encrypted)==info['original_sha256']
 key=bytes.fromhex(info['xor_key_hex']);decoded=bytes(v^key[i%32]for i,v in enumerate(encrypted));assert sha(decoded)==info['decoded_sha256']
 default_data=struct.unpack_from('<I',decoded,72)[0];at=default_data+string_proof['original_field_value_offset']+2203
 old=decoded[at:at+57];assert bytes(v^((i+2203)&255)^170 for i,v in enumerate(old)).decode()==old_prefix
 new_rva=bytes(v^((i+2203)&255)^170 for i,v in enumerate(prefix.encode()))
 new_encrypted=bytes(v^key[(at+i)%32]for i,v in enumerate(new_rva))
 absolute=member['offset']+at;before=raw[absolute:absolute+57];changed=raw[:absolute]+new_encrypted+raw[absolute+57:]
 assert len(changed)==len(raw)and changed[:absolute]==raw[:absolute]and changed[absolute+57:]==raw[absolute+57:]
 new_members=web_members(changed);assert len(new_members)==len(rows)
 unchanged=[x['name']for x,y in zip(rows,new_members)if x==y];assert len(unchanged)==len(rows)-1
 new_decoded=decoded[:at]+new_rva+decoded[at+57:];assert new_decoded[:at]==decoded[:at]and new_decoded[at+57:]==decoded[at+57:]
 assert struct.unpack_from('<II',new_decoded)==(0xFAB11BAF,31)
 # Both outer resource table and original UnityFS payload are byte-for-byte preserved.
 assert next(x for x in rows if x['name']=='data.unity3d')in new_members
 target='Build/'+dst;p=work/target;p.write_bytes(changed);manifest[target]=sha(changed)
 patches.append({'target':target,'root':'native','source':source,'source_sha256':sha(raw),'target_sha256':sha(changed),'bytes':len(raw),'patch_offset':absolute,'before_hex':before.hex(),'after_hex':new_encrypted.hex(),'metadata_relative_offset':at,'metadata_bytes':len(decoded),'metadata_source_sha256':info['decoded_sha256'],'metadata_after_sha256':sha(new_decoded),'metadata_xor_format_key_hex':key.hex(),'string_table_range':[2203,57]})
 web_proofs.append({'variant':variant,'original_members':rows,'candidate_members':new_members,'unchanged_members':unchanged,'metadata_only_allowed_range':[at,at+57],'metadata_after_sha256':sha(new_decoded)})
audit=json.loads((r/'original-addressables-20261117/bundle-structure-audit.json').read_text(encoding='utf8'));assert audit['complete']and len(audit['rows'])==162
bundle_urls={}
for row in audit['rows']:
 name=row['url'].rsplit('/',1)[1];raw=(r/row['path']).read_bytes();assert sha(raw)==row['sha256']
 target=prefix[2:]+name;assert target not in manifest
 put(target,raw,{'root':'addressables','source':'materials/bundles/'+name});bundle_urls[row['url']]=prefix+name
assert selftest()==2
original_catalogs=json.loads((r/'original-addressables-20261117/catalog-intake.json').read_text(encoding='utf8'))
for row in original_catalogs['rows']:
 raw=(r/row['local_file']).read_bytes();assert sha(raw)==row['sha256'];original=json.loads(raw);current=json.loads(raw)
 sidecar=next(x for x in intake['rows']if x['kind']=='catalog_hash'and x['expected_catalog']==Path(row['local_file']).name)
 assert unity_hash128(raw)==sidecar['value']
 changed_indices=[]
 for i,value in enumerate(current['m_InternalIds']):
  if value.startswith('http'):
   assert value in bundle_urls;current['m_InternalIds'][i]=bundle_urls[value];changed_indices.append(i)
 assert len(changed_indices)==83
 assert {k:v for k,v in current.items()if k!='m_InternalIds'}=={k:v for k,v in original.items()if k!='m_InternalIds'}
 candidate=json.dumps(current,ensure_ascii=False,separators=(',',':')).encode();name=Path(row['local_file']).name;hashed=unity_hash128(candidate)
 put(prefix[2:]+name,candidate);put(prefix[2:]+Path(name).with_suffix('.hash').name,hashed.encode('ascii'))
 catalog_proofs.append({'name':name,'original_url':row['url'],'original_sha256':sha(raw),'candidate_sha256':sha(candidate),'original_hash128':sidecar['value'],'candidate_hash128':hashed,'original_internal_id_count':len(original['m_InternalIds']),'only_rewritten_internal_id_indices':changed_indices,'all_other_fields_unchanged':True,'m_BuildResultHash_retained':current['m_BuildResultHash']})
class Tags(HTMLParser):
 def __init__(self):super().__init__();self.paths=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag in ['script','img']and a.get('src'):self.paths.append(a['src'])
  if tag=='link'and a.get('rel')in ['stylesheet','icon','apple-touch-icon']:self.paths.append(a['href'])
tags=Tags();tags.feed(html)
assert all(not urllib.parse.urlsplit(v).scheme and (work/v).is_file()for v in tags.paths)
css_refs=[]
for p in [work/'css/cg.css',work/'styles/baloo2.css']:
 for ref in re.findall(r'url\(["\']?([^"\')]+)["\']?\)',p.read_text()):
  q=(p.parent/ref).resolve();assert q.is_relative_to(work.resolve())and q.is_file();css_refs.append(q.relative_to(work.resolve()).as_posix())
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'phase':'resource_localization_only','game_executed':False,'ready_review':False,'ui_steps_used':0,'ui_steps_remaining':5,'original_job':'job-3db06205247a','native_resource_prefix_before':old_prefix,'native_resource_prefix_after':prefix,'equal_length_metadata_path_change_only':True,'webdata_variants':web_proofs,'catalogs':catalog_proofs,'original_bundles_copied_unchanged':162,'font_files_copied':4,'original_native_wasm_unchanged':True,'original_framework_unchanged':True,'original_loader_unchanged':True,'active_document_static_references_checked':tags.paths,'css_references_checked':css_refs,'documented_hash128_short_vectors_passed':2,'original_catalog_hash128_baselines_matched':2,'cache_hashes_recomputed_for_changed_catalogs':True,'limitations':['No original game, native function or SDK is executed during this preparation','Firebase/account/ads/service callbacks remain the original unresolved online consumers, not retired or faked','Both metadata and catalog changes require native runtime compatibility verification on52','The two catalog reference lists are closed against the162 supplied bundles; other dynamically requested StreamingAssets/resources are not proven complete','Apple touch icon metadata now references the existing original favicon; no replacement gameplay asset is created']}
recipe={'original_job_id':'job-3db06205247a','original_candidate_id':'game-60bd828457b8','copies':copies,'webdata_patches':patches,'candidate_manifest':manifest,'proof_sha256':sha(json.dumps(proof,ensure_ascii=False,indent=2).encode())}
support=r/'resource-localization-v1-support-20261118';support.mkdir()
(support/'resource-localization-proof.json').write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode())
(support/'assembly-recipe.json').write_text(json.dumps(recipe,ensure_ascii=False,indent=2),encoding='utf8')
(support/'sidecar-intake.json').write_bytes((r/'resource-sidecars-20261118/intake.json').read_bytes())
(support/'payload').mkdir()
for name,raw in payloads.items():
 p=support/'payload'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
print(json.dumps({'candidate':str(work),'runtime_files':len(manifest),'runtime_bytes':sum(p.stat().st_size for p in work.rglob('*')if p.is_file()),'copied_original_bundles':162,'rewritten_ids_per_catalog':[len(x['only_rewritten_internal_id_indices'])for x in catalog_proofs],'metadata_patch_region_bytes':57,'metadata_changed_bytes_per_variant':[sum(a!=b for a,b in zip(bytes.fromhex(p['before_hex']),bytes.fromhex(p['after_hex'])))for p in patches],'payload_bytes':sum(map(len,payloads.values())),'game_executed':False,'ready_review':False}))
