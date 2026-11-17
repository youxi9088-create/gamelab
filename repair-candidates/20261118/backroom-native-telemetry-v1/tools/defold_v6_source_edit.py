"""Byte-bound local Defold v6 editing utilities. No game is imported or executed."""
import struct,hashlib
import lz4.block

KEY=struct.unpack('>4I',b'aQj8CScgNP4VsfXK') # Public engine default, resource_util.cpp.

def varint(data,pos=0):
 value=0;shift=0;start=pos
 while True:
  assert pos<len(data)and shift<70
  byte=data[pos];pos+=1;value|=(byte&127)<<shift
  if byte<128:return value,pos
  shift+=7

def encoded(value):
 assert value>=0;out=bytearray()
 while value>127:out.append((value&127)|128);value>>=7
 out.append(value);return bytes(out)

def fields(data):
 out=[];pos=0
 while pos<len(data):
  start=pos;tag,pos=varint(data,pos);key,wire=tag>>3,tag&7
  if wire==0:value,pos=varint(data,pos)
  elif wire==2:
   size,pos=varint(data,pos);value=data[pos:pos+size];assert len(value)==size;pos+=size
  elif wire in [1,5]:size={1:8,5:4}[wire];value=data[pos:pos+size];assert len(value)==size;pos+=size
  else:raise ValueError('Unsupported protobuf wire '+str(wire))
  out.append({'key':key,'wire':wire,'value':value,'raw':data[start:pos]})
 return out

def replace_field(data,key,value):
 rows=fields(data);assert sum(x['key']==key for x in rows)==1
 out=[]
 for row in rows:
  if row['key']==key:assert row['wire']==2;out.append(encoded(key*8+2)+encoded(len(value))+value)
  else:out.append(row['raw'])
 return b''.join(out)

def lua_source(module):
 row=next(x for x in fields(module)if x['key']==1);assert row['wire']==2
 source_fields=fields(row['value'])
 # HTML5 LuaModule contains actual source, not native/JIT bytecode to overwrite.
 assert all(x['key']in [1,2]for x in source_fields),'Bytecode-bearing source needs separate build tooling'
 source=next(x['value']for x in source_fields if x['key']==1)
 assert b'\0'not in source;source.decode('utf8');return source

def replace_lua_source(module,expected,new):
 assert lua_source(module)==expected
 inner=next(x['value']for x in fields(module)if x['key']==1)
 result=replace_field(module,1,replace_field(inner,1,new))
 assert lua_source(result)==new
 assert [x['raw']for x in fields(module)if x['key']!=1]==[x['raw']for x in fields(result)if x['key']!=1]
 return result

def crypt(data):
 result=bytearray(data)
 for pos in range(0,len(result),8):
  count=pos//8;a=count>>32;b=count&0xffffffff;s=0
  for _ in range(32):
   a=(a+((((b<<4)^(b>>5))+b)^(s+KEY[s&3])))&0xffffffff;s=(s+0x9e3779b9)&0xffffffff
   b=(b+((((a<<4)^(a>>5))+a)^(s+KEY[(s>>11)&3])))&0xffffffff
  stream=struct.pack('>II',a,b)
  for j in range(min(8,len(result)-pos)):result[pos+j]^=stream[j]
 return bytes(result)

def archive_entries(index,data):
 assert struct.unpack('>I',index[:4])[0]==6
 count,entry_offset,hash_offset,hashlen=struct.unpack('>4I',index[16:32]);assert entry_offset+count*16==len(index)
 assert 0<hashlen<=64 and hash_offset+count*64<=entry_offset
 out=[]
 for i in range(count):
  packed,size,csize=struct.unpack_from('>QII',index,entry_offset+i*16);flags=packed>>60;offset=packed&((1<<60)-1);stored_size=csize if flags&2 else size
  assert offset+stored_size<=len(data)
  out.append({'index':i,'entry_offset':entry_offset+i*16,'hash':index[hash_offset+i*64:hash_offset+i*64+hashlen].hex(),'flags':flags,'size':size,'csize':csize,'offset':offset,'stored':data[offset:offset+stored_size]})
 return out

def unpack(entry):
 data=crypt(entry['stored'])if entry['flags']&1 else entry['stored']
 if entry['flags']&2:data=lz4.block.decompress(data,uncompressed_size=entry['size'])
 assert len(data)==entry['size'];return data

def rebuild(index,data,changes):
 entries=archive_entries(index,data);assert set(changes)<=set(range(len(entries)))
 result=bytearray();new_index=bytearray(index);proof=[]
 for entry in entries:
  original=unpack(entry);modified=changes.get(entry['index'],original)
  if entry['index']in changes:
   assert modified!=original
   stored=lz4.block.compress(modified,store_size=False)if entry['flags']&2 else modified
   if entry['flags']&1:stored=crypt(stored)
  else:stored=entry['stored']
  result.extend(b'\0'*((-len(result))%4));offset=len(result);result.extend(stored)
  struct.pack_into('>QII',new_index,entry['entry_offset'],(entry['flags']<<60)|offset,len(modified),len(stored)if entry['flags']&2 else entry['csize'])
  proof.append({'index':entry['index'],'addressing_hash':entry['hash'],'changed':entry['index']in changes,'before_sha256':hashlib.sha256(original).hexdigest(),'after_sha256':hashlib.sha256(modified).hexdigest()})
 # Lookup identifiers/manifest/signature stay intact; no integrity/auth checks are
 # weakened. Runtime compatibility is a separate required remote observation.
 modified_entries=archive_entries(bytes(new_index),bytes(result))
 for entry,row in zip(modified_entries,proof):assert hashlib.sha256(unpack(entry)).hexdigest()==row['after_sha256']
 return bytes(new_index),bytes(result),proof

def wasm_imported_functions(wasm):
 pos=8
 while pos<len(wasm):
  kind=wasm[pos];size,start=varint(wasm,pos+1);end=start+size
  if kind!=2:pos=end;continue
  count,p=varint(wasm,start);functions=0
  for _ in range(count):
   for name in range(2):length,p=varint(wasm,p);p+=length
   external=wasm[p];p+=1
   if external==0:_,p=varint(wasm,p);functions+=1
   elif external==2:
    flags,p=varint(wasm,p);_,p=varint(wasm,p)
    if flags&1:_,p=varint(wasm,p)
   else:raise ValueError('Unreviewed non-function/memory import')
  assert p==end;return functions
 raise ValueError('No import section')

def patch_wasm_call(wasm,function_index,imported_functions,offset,old,replacement):
 assert wasm[:8]==b'\0asm\1\0\0\0'and wasm[offset:offset+len(old)]==old
 assert wasm_imported_functions(wasm)==imported_functions
 result=bytearray(wasm[:8]);pos=8;found=False;preserved=0
 while pos<len(wasm):
  section_start=pos;kind=wasm[pos];size,start=varint(wasm,pos+1);end=start+size
  if kind!=10:result.extend(wasm[section_start:end]);pos=end;continue
  count,p=varint(wasm,start);payload=bytearray(wasm[start:p])
  for index in range(count):
   old_start=p;body_size,body_start=varint(wasm,p);body_end=body_start+body_size;body=wasm[body_start:body_end]
   if index+imported_functions==function_index:
    assert body_start<=offset and offset+len(old)<=body_end
    i=offset-body_start;body=body[:i]+replacement+body[i+len(old):];payload.extend(encoded(len(body))+body);found=True
   else:payload.extend(wasm[old_start:body_end]);preserved+=1
   p=body_end
  assert p==end;result.append(kind);result.extend(encoded(len(payload))+payload);pos=end
 assert found;return bytes(result),preserved
