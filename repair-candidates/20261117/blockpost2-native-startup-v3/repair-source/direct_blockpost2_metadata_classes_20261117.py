"""Read-only metadata31 index, using public Il2CppDumper schema as reference.
https://github.com/Perfare/Il2CppDumper/blob/master/Il2CppDumper/Il2Cpp/MetadataClass.cs
No native method execution, binary patch or inferred gameplay result.
"""
from pathlib import Path
import struct,json,hashlib
r=Path(__file__).parent/'direct-games/job-353d7339bf40';p=next((r/'native-unpacked-20261117').rglob('global-metadata.dat'));raw=p.read_bytes();assert struct.unpack_from('<II',raw)==(0xFAB11BAF,31)
strings,ssize=struct.unpack_from('<II',raw,24);types,tsize=struct.unpack_from('<II',raw,160);methods,msize=struct.unpack_from('<II',raw,48);fields,fsize=struct.unpack_from('<II',raw,96);images,isize=struct.unpack_from('<II',raw,168);assert tsize%88==msize%36==fsize%12==isize%40==0
def string(i):
 assert 0<=i<ssize;end=raw.index(0,strings+i,strings+ssize);return raw[strings+i:end].decode('utf8')
rows=[]
for index in range(tsize//88):
 off=types+index*88;name,ns=struct.unpack_from('<II',raw,off);name=string(name);namespace=string(ns);token=struct.unpack_from('<I',raw,off+84)[0];assert token>>24==2
 if name not in ['PokiUnitySDK','PokiAdsManager','MasterClient','GUIPlayOffline','UIPlayOffline','BotManager','FakeServer']:continue
 fs,ms=struct.unpack_from('<ii',raw,off+32);mc,pc,fc=struct.unpack_from('<HHH',raw,off+64);row={'type_index':index,'name':name,'namespace':namespace,'token':hex(token),'methods':[],'fields':[]}
 for i in range(ms,ms+mc):
  mo=methods+i*36;ni,decl,ret,rpt,ps,gc,tok,flags,iflags,slot,params=struct.unpack_from('<IiiiiiIHHHH',raw,mo);assert decl==index and tok>>24==6;row['methods'].append({'name':string(ni),'method_index':i,'token':tok,'parameter_count':params,'flags':flags,'slot':slot})
 for i in range(fs,fs+fc):
  ni,typ,tok=struct.unpack_from('<IiI',raw,fields+i*12);assert tok>>24==4;row['fields'].append({'name':string(ni),'type_index':typ,'token':tok,'field_index':i})
 row['image']=None
 for io in range(images,images+isize,40):
  ni,ai,ts,tc=struct.unpack_from('<IiiI',raw,io)
  if ts<=index<ts+tc:row['image']=string(ni)
 rows.append(row)
out={'source_only':True,'metadata_sha256':hashlib.sha256(raw).hexdigest(),'types':rows,'schema_reference':'https://github.com/Perfare/Il2CppDumper/blob/master/Il2CppDumper/Il2Cpp/MetadataClass.cs','method_code_not_yet_mapped':True};(r/'analysis-20261117/native-sdk-classes.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps({'types':[{'type':x['name'],'image':x['image'],'methods':[m['name']for m in x['methods']],'fields':[f['name']for f in x['fields']]}for x in rows]},ensure_ascii=False))
