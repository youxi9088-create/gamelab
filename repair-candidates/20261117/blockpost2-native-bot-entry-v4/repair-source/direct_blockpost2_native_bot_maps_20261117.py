from pathlib import Path
import sys,json,re,hashlib,struct
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';sys.path.insert(0,str(b/'synty-python'));import UnityPy
env=UnityPy.load(str(r/'native-unpacked-20261117/data.unity3d'));rows=[];resources=[];loaders=[]
for o in env.objects:
 if o.type.name=='TextAsset':
  d=o.read()
  if re.search(r'map|blox|poligon|aimtrain',d.m_Name,re.I):resources.append({'name':d.m_Name,'file':o.assets_file.name,'path_id':o.path_id,'bytes':len(o.get_raw_data()),'sha256':hashlib.sha256(o.get_raw_data()).hexdigest(),'text_preview':str(d.m_Script)[:500]if d.m_Name in ['bloxcont','bloxpoligon2_cfg']else None})
 elif o.type.name=='MonoBehaviour':
  m=o.read(check_read=False)
  try:s=m.m_Script.read()
  except Exception:continue
  if s.m_ClassName=='Map':
   data=o.get_raw_data();loaders.append({'file':o.assets_file.name,'path_id':o.path_id,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'strings':[x.group().decode('ascii')for x in re.finditer(rb'[A-Za-z_][A-Za-z0-9_ .<>:/-]{3,120}',data)]})
  if s.m_ClassName not in ['UIPlayOffline_SelectMode','UIPlayBot_SelectMode']:continue
  raw=o.get_raw_data();g=m.m_GameObject.read();row={'gameobject':g.m_Name,'file':o.assets_file.name,'path_id':o.path_id,'bytes':len(raw),'strings':[x.group().decode('ascii')for x in re.finditer(rb'[A-Za-z_][A-Za-z0-9_ .<>:/-]{3,120}',raw)]}
  assert len(raw)==60 and struct.unpack_from('<i',raw,28)[0]==0
  file_id,path_id=struct.unpack_from('<iq',raw,48);row['maplist_pointer']={'file_id':file_id,'path_id':path_id};row['serialized_mode']=struct.unpack_from('<i',raw,32)[0]
  pointer=type(m.m_Script)(m_FileID=file_id,m_PathID=path_id,assetsfile=o.assets_file)
  ref=pointer.deref();data=ref.get_raw_data();row['maplist_object']={'file':ref.assets_file.name,'path_id':ref.path_id,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'strings':[x.group().decode('ascii')for x in re.finditer(rb'[A-Za-z_][A-Za-z0-9_ .<>:/-]{3,120}',data)]};rows.append(row)
out={'source_only':True,'mode_objects':rows,'matching_text_assets':resources,'serialized_map_loaders':loaders,'runtime_verified':False};(r/'native-home-menu-analysis-20261117/native-bot-map-source.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'source_only':True,'mode_objects':rows,'matching_text_assets_count':len(resources),'serialized_map_loaders':loaders},ensure_ascii=False))
