"""Bounded, data-only reader for the original UnityFS LZ4 containers used here."""
import struct,hashlib
MAX_BYTES=128*1024*1024
def lz4_block(raw,expected):
 assert 0<=expected<=MAX_BYTES
 pos=0;out=bytearray()
 def length(base):
  nonlocal pos
  total=base
  if base==15:
   while True:
    assert pos<len(raw);n=raw[pos];pos+=1;total+=n
    if n!=255:break
  return total
 while pos<len(raw):
  token=raw[pos];pos+=1;literal=length(token>>4)
  assert pos+literal<=len(raw)and len(out)+literal<=expected
  out.extend(raw[pos:pos+literal]);pos+=literal
  if pos==len(raw):break
  assert pos+2<=len(raw);offset=struct.unpack_from('<H',raw,pos)[0];pos+=2
  assert 0<offset<=len(out)
  count=length(token&15)+4;assert len(out)+count<=expected
  period=bytes(out[-offset:]);out.extend(period*(count//offset)+period[:count%offset])
 assert pos==len(raw)and len(out)==expected
 return bytes(out)
def unpack(raw):
 pos=0
 def take(n):
  nonlocal pos
  assert 0<=n and pos+n<=len(raw);value=raw[pos:pos+n];pos+=n;return value
 def string():
  nonlocal pos
  end=raw.index(0,pos);assert end-pos<4096;value=raw[pos:end].decode('utf8');pos=end+1;return value
 assert string()=='UnityFS'
 version=struct.unpack('>I',take(4))[0];assert version in [6,7,8]
 unity_version=string();unity_revision=string()
 size,compressed_info,uncompressed_info,flags=struct.unpack('>QIII',take(20))
 assert size==len(raw)and compressed_info<=MAX_BYTES and uncompressed_info<=MAX_BYTES
 if version>=7:pos=(pos+15)&~15
 assert flags&64 and not flags&128,'Only inline combined block/directory info is supported'
 info=take(compressed_info);kind=flags&63
 assert kind in [0,2,3]
 info=info if kind==0 else lz4_block(info,uncompressed_info)
 assert len(info)==uncompressed_info
 if flags&512:pos=(pos+15)&~15
 cursor=16;count=struct.unpack_from('>I',info,cursor)[0];cursor+=4;assert count<100000
 blocks=[];combined=bytearray()
 for _ in range(count):
  decoded,encoded,blockflags=struct.unpack_from('>IIH',info,cursor);cursor+=10
  assert len(combined)+decoded<=MAX_BYTES
  part=take(encoded);compression=blockflags&63;assert compression in [0,2,3]
  part=part if compression==0 else lz4_block(part,decoded);assert len(part)==decoded
  combined.extend(part);blocks.append({'decoded_bytes':decoded,'encoded_bytes':encoded,'flags':blockflags})
 assert pos==len(raw)
 files={};nodes=[];node_count=struct.unpack_from('>I',info,cursor)[0];cursor+=4;assert node_count<100000
 for _ in range(node_count):
  offset,length,nodeflags=struct.unpack_from('>QQI',info,cursor);cursor+=20
  end=info.index(0,cursor);name=info[cursor:end].decode('utf8');cursor=end+1
  assert name and name not in files and offset+length<=len(combined)
  data=bytes(combined[offset:offset+length]);files[name]=data
  nodes.append({'name':name,'bytes':length,'offset':offset,'flags':nodeflags,'sha256':hashlib.sha256(data).hexdigest()})
 assert cursor==len(info)
 return files,{'format_version':version,'unity_version':unity_version,'unity_revision':unity_revision,'flags':flags,'blocks':blocks,'nodes':nodes,'source_only':True,'game_executed':False}
