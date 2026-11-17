"""Read original IL2CPP metadata registration and field offsets, never instantiate Wasm."""
from pathlib import Path
import json,struct,hashlib,datetime,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';d=r/'analysis-20261118'
declarations=json.loads((d/'server-settings-metadata-fields.json').read_text(encoding='utf8'))
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source=source[:source.index('\ntypes=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns={'__file__':str(b/'static-data-read-only.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'read-wasm-initial-data-only','exec'),ns)
memory=ns['memory'];wasm=ns['raw'];assert hashlib.sha256(wasm).hexdigest()=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
metadata=(r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
type_count=struct.unpack_from('<I',metadata,164)[0]//88
u32=lambda pos:struct.unpack_from('<I',memory,pos)[0]
possible=[];pos=0;pattern=struct.pack('<I',type_count)
while True:
 pos=memory.find(pattern,pos)
 if pos<0:break
 field_count_pos=pos;pos+=1
 if field_count_pos%4 or field_count_pos<40 or field_count_pos+24>len(memory):continue
 if u32(field_count_pos+8)!=type_count:continue
 fields_ptr=u32(field_count_pos+4);sizes_ptr=u32(field_count_pos+12)
 if not (fields_ptr%4==0 and sizes_ptr%4==0 and 0<fields_ptr<fields_ptr+type_count*4<=len(memory)and 0<sizes_ptr<sizes_ptr+type_count*4<=len(memory)):continue
 registration=field_count_pos-40;types_count=u32(registration+24);types_ptr=u32(registration+28)
 if not (20000<types_count<200000 and types_ptr%4==0 and 0<types_ptr<types_ptr+types_count*4<=len(memory)):continue
 rows=[];valid=True
 for typ in declarations['types']:
  ptr=u32(fields_ptr+typ['type_index']*4);count=len(typ['fields'])
  if not (ptr%4==0 and 0<ptr<ptr+count*4<=len(memory)):valid=False;break
  offsets=struct.unpack_from('<'+'i'*count,memory,ptr)
  if not all(8<=v<512 for v in offsets):valid=False;break
  row={k:typ[k]for k in ['name','namespace','type_index','image']};row['native_field_offsets_address']=ptr;row['fields']=[]
  for f,offset in zip(typ['fields'],offsets):
   type_ptr=u32(types_ptr+f['type_index']*4)
   if not (0<type_ptr<type_ptr+8<=len(memory)):valid=False;break
   code=(u32(type_ptr+4)>>16)&255
   row['fields'].append({**f,'native_offset':offset,'native_type_code':code})
  rows.append(row)
 if valid:possible.append({'registration_address':registration,'field_offsets_table_address':fields_ptr,'type_definition_sizes_table_address':sizes_ptr,'type_definitions':type_count,'native_types':types_count,'types':rows})
assert len(possible)==1,[(x['registration_address'],x['field_offsets_table_address'])for x in possible]
registration=possible[0];settings=next(x for x in registration['types']if x['name']=='ServerSettings');offline=next(x for x in settings['fields']if x['name']=='StartInOfflineMode')
assert offline['native_offset']==26 and offline['native_type_code']==2
assert next(x for x in settings['fields']if x['name']=='AppSettings')['native_offset']==12
existing=json.loads((r/'analysis-20261117/offline-boundary/offline-consumer-source-proof.json').read_text(encoding='utf8'))
wrapper=next(x for x in existing['snippets']if x['function_index']==17293)
assert 'PhotonNetwork_iiv_4026(a)[26]:ubyte'in wrapper['source']and 'PhotonNetwork_iiv_4026(a)[3]:int'in wrapper['source']
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'original_wasm_sha256':hashlib.sha256(wasm).hexdigest(),'metadata_sha256':hashlib.sha256(metadata).hexdigest(),'registration':registration,'original_connect_wrapper_function':17293,'original_connect_wrapper_source_sha256':hashlib.sha256(wrapper['source'].encode()).hexdigest(),'resolved_original_offline_argument':offline,'source_only':True,'game_executed':False,'original_modified':False,'offline_gameplay_verified':False,'limitations':['Original local-mode configuration consumer is identified, not executed','Serialized ServerSettings value and game initialization still need inspection','Firebase user/remote room success must not be fabricated']}
target=d/'server-settings-native-field-offsets.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({**out,'registration':{k:v for k,v in registration.items()if k!='types'}},ensure_ascii=False))
