from pathlib import Path
import struct,json,sys,re,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-cb29c5351b91';raw=next((r/'native-unpacked-20261117').rglob('global-metadata.dat')).read_bytes();assert struct.unpack_from('<II',raw)==(0xFAB11BAF,27)
strings,ssize=struct.unpack_from('<II',raw,24);types,tsize=struct.unpack_from('<II',raw,160);methods,msize=struct.unpack_from('<II',raw,48);fields,fsize=struct.unpack_from('<II',raw,96);assert tsize%88==msize%32==fsize%12==0
def string(i):assert 0<=i<ssize;return raw[strings+i:raw.index(0,strings+i,strings+ssize)].decode()
rows=[]
for index in range(tsize//88):
 off=types+index*88;name=string(struct.unpack_from('<I',raw,off)[0]);token=struct.unpack_from('<I',raw,off+84)[0];assert token>>24==2
 if name not in ['PokiUnitySDK','SDKPlatform','YandexSDK','UnityAdsSDK','Game','GameController','Level','LevelsPanel','Levels','GameManager','Bootstraper']:continue
 fs,ms=struct.unpack_from('<ii',raw,off+32);mc,pc,fc=struct.unpack_from('<HHH',raw,off+64);row={'type_index':index,'name':name,'methods':[],'fields':[]}
 for i in range(ms,ms+mc):
  mo=methods+i*32;ni,decl,ret,ps,gc,tok,flags,iflags,slot,params=struct.unpack_from('<IiiiiIHHHH',raw,mo);assert decl==index and tok>>24==6;row['methods'].append({'name':string(ni),'method_index':i,'token':tok,'parameter_count':params})
 for i in range(fs,fs+fc):
  ni,typ,tok=struct.unpack_from('<IiI',raw,fields+i*12);assert tok>>24==4;row['fields'].append({'name':string(ni),'type_index':typ,'token':tok})
 rows.append(row)
sys.path.insert(0,str(b/'synty-python'));import UnityPy
env=UnityPy.load(str(r/'native-unpacked-20261117/data.unity3d'));settings=[];instances=[]
for o in env.objects:
 if o.type.name=='UnityConnectSettings':settings.append({'file':o.assets_file.name,'path_id':o.path_id,'value':o.read_typetree()})
 elif o.type.name=='MonoBehaviour':
  m=o.read(check_read=False)
  try:s=m.m_Script.read();go=m.m_GameObject.read()
  except Exception:continue
  if s.m_ClassName not in ['PokiUnitySDK','YandexSDK','UnityAdsSDK','LevelsPanel','GameManager','GameController','Level','Levels']:continue
  data=o.get_raw_data();instances.append({'class':s.m_ClassName,'go':go.m_Name,'active':go.m_IsActive,'enabled':m.m_Enabled,'file':o.assets_file.name,'id':o.path_id,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'strings':[x.group().decode('ascii')for x in re.finditer(rb'[A-Za-z_][A-Za-z0-9_ .<>:/-]{3,100}',data)]})
out={'source_only':True,'metadata_schema':{'version':27,'type_width':88,'method_width':32,'all_type_tokens_validated':True,'selected_method_declaring_types_validated':True},'types':rows,'unity_connect_settings':settings,'instances':instances,'game_executed':False};(r/'analysis-20261117/sdk-source-proof.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'types':[{'name':x['name'],'methods':[m['name']for m in x['methods']],'fields':[f['name']for f in x['fields']]}for x in rows],'settings':settings,'instances':instances},ensure_ascii=False))
