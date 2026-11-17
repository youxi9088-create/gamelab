from pathlib import Path
import sys,re,json,hashlib,datetime,collections
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';sys.path.insert(0,str(b/'synty-python'));import UnityPy
source=r/'native-unpacked-20261117/e906ad610c88fe82b2d0199b3cc0e7fb/data.unity3d'
env=UnityPy.load(str(source));rows=[];settings=[]
for obj in env.objects:
 raw=obj.get_raw_data()
 if obj.type.name=='MonoBehaviour':
  mono=obj.read(check_read=False)
  cls=mono.m_Script.read().m_ClassName if mono.m_Script.m_PathID else None
 else:cls=None
 urls=[]
 for m in re.finditer(rb'https?://[^\x00-\x20<>"\x7f-\xff]{6,300}',raw):
  url=m.group().decode('ascii',errors='replace')
  if any(t in url.lower() for t in ['catalog','bundle','b-cdn','streamingassets','addressable','.json']):urls.append(url)
 if urls:rows.append({'file':obj.assets_file.name,'path_id':obj.path_id,'type':obj.type.name,'class':cls,'sha256':hashlib.sha256(raw).hexdigest(),'urls':list(dict.fromkeys(urls))})
 if cls in ['GameStartScreen','PracticePlayContainer','GameScreenManager','BotManager','BotPlayer']:
  settings.append({'file':obj.assets_file.name,'path_id':obj.path_id,'class':cls,'bytes':len(raw),'raw_sha256':hashlib.sha256(raw).hexdigest(),
   'literal_strings':[m.group().decode('ascii') for m in re.finditer(rb'[A-Za-z_][A-Za-z0-9_./: -]{7,220}',raw)],'custom_fields_fully_decoded':False})
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'runtime_executed':False,'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'resource_declarations':rows,'native_component_hints':settings,'mode_reachability_proven':False}
(r/'analysis-20261117/resource-declarations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'runtime_executed':False,'resource_declaration_objects':len(rows),'native_component_hints':len(settings),'mode_reachability_proven':False},ensure_ascii=False))
