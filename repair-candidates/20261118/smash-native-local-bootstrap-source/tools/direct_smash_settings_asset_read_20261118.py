"""Locate the original serialized ServerSettings object; do not run or mutate it."""
from pathlib import Path
import sys,json,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';sys.path.insert(0,str(b/'synty-python'));import UnityPy
p=r/'native-unpacked-20261117/e906ad610c88fe82b2d0199b3cc0e7fb/data.unity3d';before=hashlib.sha256(p.read_bytes()).hexdigest();env=UnityPy.load(str(p));scripts=[];objects=[]
for obj in env.objects:
 if obj.type.name!='MonoScript':continue
 s=obj.read()
 if s.m_ClassName=='ServerSettings':
  scripts.append({'file':obj.assets_file.name,'path_id':obj.path_id,'class':s.m_ClassName,'namespace':s.m_Namespace,'assembly':s.m_AssemblyName})
for obj in env.objects:
 if obj.type.name!='MonoBehaviour':continue
 try:
  data=obj.read(check_read=False);script=data.m_Script.read()
 except (ValueError,AttributeError,KeyError,TypeError):continue
 if script.m_ClassName!='ServerSettings':continue
 tree=obj.read_typetree(check_read=False);raw=obj.get_raw_data()
 # Strings and IDs in AppSettings are not displayed in logs.
 objects.append({'file':obj.assets_file.name,'path_id':obj.path_id,'name':getattr(data,'m_Name',''),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'tree_keys':list(tree),'custom_field_names':sorted(k for k in tree if k not in ['m_GameObject','m_Enabled','m_Script','m_Name']),'tree':tree})
assert len(scripts)==1 and len(objects)==1,(len(scripts),len(objects))
assert hashlib.sha256(p.read_bytes()).hexdigest()==before
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'original_data_sha256':before,'source':str(p),'scripts':scripts,'objects':objects,'source_only':True,'game_executed':False,'original_modified':False}
target=r/'analysis-20261118/server-settings-serialized-object.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in out.items()if k!='objects'}|{'objects':[{k:v for k,v in x.items()if k!='tree'}for x in objects]},ensure_ascii=False))
