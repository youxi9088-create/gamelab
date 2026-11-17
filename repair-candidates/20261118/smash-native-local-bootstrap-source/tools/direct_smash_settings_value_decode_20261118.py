"""Read original serialized settings using metadata types; redact string contents."""
from pathlib import Path
import sys,json,struct,hashlib,datetime,contextlib,io,re
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';d=r/'analysis-20261118'
sys.path.insert(0,str(b/'synty-python'));import UnityPy
from UnityPy.helpers import TypeTreeHelper
from UnityPy.streams import EndianBinaryWriter
decl=json.loads((d/'server-settings-native-field-offsets.json').read_text(encoding='utf8'));registration=decl['registration']
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source=source[:source.index('\ntypes=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns={'__file__':str(b/'static-data-read-only.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'read-initial-native-data','exec'),ns)
memory=ns['memory'];types_ptr=struct.unpack_from('<I',memory,registration['registration_address']+28)[0]
settings={x['name']:x for x in registration['types']}
def attributes(field):
 ptr=struct.unpack_from('<I',memory,types_ptr+field['type_index']*4)[0]
 return struct.unpack_from('<I',memory,ptr+4)[0]&0xffff
for typ in settings.values():
 for field in typ['fields']:field['attributes']=attributes(field)
p=r/'native-unpacked-20261117/e906ad610c88fe82b2d0199b3cc0e7fb/data.unity3d';env=UnityPy.load(str(p));obj=next(o for o in env.objects if o.assets_file.name=='resources.assets'and o.path_id==51)
header=obj.read_typetree(check_read=False);raw=obj.get_raw_data()
writer=EndianBinaryWriter(endian=obj.reader.endian)
TypeTreeHelper.write_typetree(header,obj._get_typetree_node(),writer,obj.assets_file)
header_bytes=writer.bytes;assert raw.startswith(header_bytes)
pos=len(header_bytes)
assert header['m_Name']=='PhotonServerSettings'and len(raw)==656
start=pos;rows=[];parts=[raw[:pos]];reencoded=bytearray(header_bytes)
def emit(data):
 reencoded.extend(data)
 reencoded.extend(b'\0'*((-len(reencoded))%4))
def take(n):
 global pos
 assert 0<=n and pos+n<=len(raw),(pos,n,len(raw))
 old=pos;pos+=n;part=raw[old:pos];parts.append(part);return part
def align():
 n=(-pos)%4
 if n:assert take(n)==b'\0'*n,('padding',pos-n,n)
def text():
 length=struct.unpack('<i',take(4))[0];assert 0<=length<=4096,(pos,length)
 data=take(length);data.decode('utf8');align();return data
def record(field,value_start,kind,summary):
 rows.append({'field':field['name'],'field_index':field['field_index'],'native_offset':field['native_offset'],'serialized_offset':value_start,'serialized_bytes':pos-value_start,'kind':kind,**summary})
def scalar(field):
 at=pos;code=field['native_type_code']
 if code==14:
  value=text();emit(struct.pack('<i',len(value))+value);record(field,at,'string',{'utf8_bytes':len(value),'value_sha256':hashlib.sha256(value).hexdigest()});return
 if code==2:
  value=take(1)[0];assert value in [0,1];align();emit(bytes([value]));record(field,at,'boolean',{'value':bool(value)});return
 if code in [6,7]:
  fmt='<h'if code==6 else'<H';value=struct.unpack(fmt,take(2))[0];align();emit(struct.pack(fmt,value));record(field,at,'integer',{'value':value});return
 if code in [8,9,17]:
  value=struct.unpack('<i',take(4))[0];emit(struct.pack('<i',value));record(field,at,'enum_or_integer',{'value':value});return
 raise AssertionError(('unhandled primitive',field['name'],code))
def eligible(field):return bool(field['attributes']&6)and not(field['attributes']&(16|32|128))
for field in settings['ServerSettings']['fields']:
 if not eligible(field):continue
 if field['name']=='AppSettings':
  for nested in settings['AppSettings']['fields']:
   if eligible(nested):scalar(nested)
 elif field['name']=='RpcList':
  at=pos;count=struct.unpack('<i',take(4))[0];assert 0<=count<=500
  values=[text()for _ in range(count)];rpc_names=values
  emit(struct.pack('<i',count))
  for value in values:emit(struct.pack('<i',len(value))+value)
  record(field,at,'string_list',{'count':count,'value_sha256':hashlib.sha256(b'\0'.join(values)).hexdigest()})
 else:scalar(field)
assert pos==len(raw),(pos,len(raw))
assert b''.join(parts)==raw
assert bytes(reencoded)==raw
metadata=(r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes();strings,ssize=struct.unpack_from('<II',metadata,24);methods,msize=struct.unpack_from('<II',metadata,48)
all_methods=set()
for off in range(methods,methods+msize,36):
 i=struct.unpack_from('<I',metadata,off)[0];all_methods.add(metadata[strings+i:metadata.index(0,strings+i,strings+ssize)])
assert all(re.fullmatch(rb'[A-Za-z_][A-Za-z_0-9]*',name)for name in rpc_names)
rpc_missing=[name.decode()for name in rpc_names if name not in all_methods]
# The serialized RPC list may contain names outside the shipped metadata.
# Keep unmatched original names as an unresolved fact, never delete/rename them.
offline=next(x for x in rows if x['field']=='StartInOfflineMode')
assert offline['native_offset']==26 and offline['kind']=='boolean'
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'object_file':'resources.assets','object_path_id':51,'original_object_sha256':hashlib.sha256(raw).hexdigest(),'object_bytes':len(raw),'base_header_bytes':start,'decoded_custom_bytes':len(raw)-start,'all_bytes_consumed_and_roundtripped':True,'all_rpc_names_match_original_metadata_methods':not rpc_missing,'rpc_count':len(rpc_names),'rpc_names_matching_metadata':len(rpc_names)-len(rpc_missing),'unmatched_original_rpc_names':rpc_missing,'fields':rows,'skipped_fields':[{k:f[k]for k in ['name','attributes']}for f in settings['AppSettings']['fields']if not eligible(f)],'actual_start_in_offline_mode':offline['value'],'serialized_offline_byte_offset':offline['serialized_offset'],'native_connect_parameter_offset':26,'offline_gameplay_verified':False,'limitations':['Settings are read only, no configuration activated','Native Firebase and local-room/player/AI consumers remain unresolved','Four original RPC names did not match shipped metadata; unchanged, cause unresolved','String app identifiers are hashed, not displayed']}
out['independent_reencoding_matches_original']=True
prior=json.loads((d/'server-settings-serialized-values.json').read_text(encoding='utf8'))
assert prior['actual_start_in_offline_mode']==out['actual_start_in_offline_mode']and prior['serialized_offline_byte_offset']==out['serialized_offline_byte_offset']
out['preliminary_read_sha256']=hashlib.sha256((d/'server-settings-serialized-values.json').read_bytes()).hexdigest()
out['proof_scope']='Header reserialized by UnityPy; custom values independently re-encoded from metadata-derived fields. Full 656 bytes equal the original; no setting value changed.'
target=d/'server-settings-serialized-values-verified.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in out.items()if k!='fields'}|{'field_count':len(rows)},ensure_ascii=False))
