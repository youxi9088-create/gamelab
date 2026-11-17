"""Decode original metadata as source analysis only; never modify/run game files.

The key candidate is derived from repeating byte distributions, then accepted
only if every metadata table boundary and every type/method token agree.
"""
from pathlib import Path
from collections import Counter
import struct,json,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'analysis-20261117';results=[]
selected={'GameStartScreen','GameScreenManager','BotManager','BotPlayer','PracticePlayContainer','NetworkManager','NetworkController','Preloader','GameManager','AddressablesManager','AddressableLoader','PhotonConnectionManager','AuthManager','FirebaseManager','FirebaseAuthService','PlayerManager','GameSettings','GameLevelManager'}
extra_selected_indices={63,64,74,204,591,733} # Exact original references from flow-metadata-references.json.
for src in sorted((r/'native-unpacked-20261117').rglob('global-metadata.dat')):
 original=src.read_bytes()
 modal=bytes(Counter(original[i::32]).most_common(1)[0][0] for i in range(32))
 # The low byte columns are dominated by signed -1 sentinels, rather than 0.
 key=bytes(value ^ (255 if i%4==0 else 0) for i,value in enumerate(modal))
 raw=bytes(value^key[i%32] for i,value in enumerate(original))
 assert struct.unpack_from('<II',raw)==(0xFAB11BAF,31),'Reject unproven key candidate'
 header=struct.unpack_from('<64I',raw);tables=[]
 for i in range(2,64,2):
  offset,size=header[i:i+2];assert 256<=offset<=offset+size<=len(raw)
  padding=0
  if tables:
   previous_end=tables[-1]['offset']+tables[-1]['bytes'];padding=offset-previous_end
   assert 0<=padding<8 and raw[previous_end:offset]==bytes(padding)
  tables.append({'header_offset':i*4,'offset':offset,'bytes':size,'zero_alignment_padding_before':padding})
 assert tables[0]['offset']==256 and tables[-1]['offset']+tables[-1]['bytes']==len(raw)
 strings,ss=struct.unpack_from('<II',raw,24);types,ts=struct.unpack_from('<II',raw,160);methods,ms=struct.unpack_from('<II',raw,48);fields,fs=struct.unpack_from('<II',raw,96);images,ims=struct.unpack_from('<II',raw,168)
 assert ts%88==ms%36==fs%12==ims%40==0
 def string(i):
  assert 0<=i<ss;end=raw.index(0,strings+i,strings+ss);return raw[strings+i:end].decode('utf8')
 image_rows=[]
 for pos in range(images,images+ims,40):
  name,assembly,start,count=struct.unpack_from('<IiiI',raw,pos)
  assert 0<=start<=start+count<=ts//88
  token=struct.unpack_from('<I',raw,pos+36)[0];assert token>>24==0
  image_rows.append({'name':string(name),'type_start':start,'type_count':count})
 all_types=[];chosen=[];method_checks=field_checks=0
 for index in range(ts//88):
  pos=types+index*88;ni,nsi=struct.unpack_from('<II',raw,pos);name=string(ni);namespace=string(nsi);token=struct.unpack_from('<I',raw,pos+84)[0];assert token>>24==2
  field_start,method_start=struct.unpack_from('<ii',raw,pos+32);mc,pc,fc=struct.unpack_from('<HHH',raw,pos+64)
  matches=[im for im in image_rows if im['type_start']<=index<im['type_start']+im['type_count']];assert len(matches)==1
  row={'type_index':index,'name':name,'namespace':namespace,'token':hex(token),'image':matches[0]['name'],'methods':[],'fields':[]}
  keep=name in selected or index in extra_selected_indices
  for j in range(method_start,method_start+mc):
   assert 0<=j<ms//36
   mi,decl,ret,rpt,ps,gc,tok,flags,iflags,slot,params=struct.unpack_from('<IiiiiiIHHHH',raw,methods+j*36)
   assert decl==index and tok>>24==6
   method_name=string(mi);method_checks+=1
   if keep:row['methods'].append({'name':method_name,'method_index':j,'token':tok,'parameter_count':params,'flags':flags,'slot':slot,'return_type_index':ret})
  for j in range(field_start,field_start+fc):
   assert 0<=j<fs//12
   fi,typ,tok=struct.unpack_from('<IiI',raw,fields+j*12);assert tok>>24==4
   field_name=string(fi);field_checks+=1
   if keep:row['fields'].append({'name':field_name,'type_index':typ,'token':tok,'field_index':j})
  all_types.append({'index':index,'name':name,'namespace':namespace,'image':row['image']})
  if keep:chosen.append(row)
 assert method_checks==ms//36 and field_checks==fs//12
 variant=src.relative_to(r/'native-unpacked-20261117').parts[0];target=folder/('metadata-decoded-'+variant+'-ANALYSIS-ONLY.dat')
 if target.exists():assert target.read_bytes()==raw
 else:target.write_bytes(raw)
 result={'variant':variant,'original_file':src.relative_to(r).as_posix(),'original_sha256':hashlib.sha256(original).hexdigest(),'decoded_sha256':hashlib.sha256(raw).hexdigest(),'decoded_file':target.relative_to(r).as_posix(),
  'xor_key_hex':key.hex(),'key_derivation':'Modal byte per position modulo32, low bytes of each word inverted due to -1 sentinels; independently validate exact magic31, every table closure, all type names, method declaring types and field tokens.',
  'header_tables':tables,'metadata_version':31,'types':ts//88,'images':len(image_rows),'methods_checked':method_checks,'fields_checked':field_checks,'selected_types':chosen,'all_type_names':all_types,'source_analysis_verified':True,'runtime_mapping_verified':False}
 results.append(result)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_game_modified':False,'variants':results,'runtime_mapping_verified':False}
(folder/'metadata-static-decode-proof.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
desktop=next(v for v in results if v['variant']=='e906ad610c88fe82b2d0199b3cc0e7fb')
(folder/'native-gameplay-classes.json').write_text(json.dumps({'source_only':True,'metadata_sha256':desktop['decoded_sha256'],'types':desktop['selected_types'],'method_code_not_yet_mapped':True},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'verified_source_variants':len(results),'metadata_version':31,'types':desktop['types'],'methods_checked':desktop['methods_checked'],'fields_checked':desktop['fields_checked'],'selected_types':[{'name':x['name'],'image':x['image'],'method_names':[m['name'] for m in x['methods']][:30]} for x in desktop['selected_types']],'runtime_mapping_verified':False},ensure_ascii=False))
