from pathlib import Path
import json,hashlib,datetime
r=Path(__file__).parent/'direct-games/job-ad79ce70fd26';p=r/'work-native-local-v2';alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
def uuid_path(value):
 base,*suffix=value.split('@',1)
 if len(base)==22:
  out=base[:2]
  for index in range(2,22,2):
   number=alphabet.index(base[index])*64+alphabet.index(base[index+1]);out+=f'{number:03x}'
  base='-'.join([out[:8],out[8:12],out[12:16],out[16:20],out[20:]])
 return base+('@'+suffix[0]if suffix else'')
rows=[];missing=[]
for f in(p/'assets').glob('*/config.json'):
 config=json.loads(f.read_text(encoding='utf8'));ids=config.get('uuids',[]);packed={int(i)for values in config.get('packs',{}).values()for i in values};redirects={int(i)for i in config.get('redirect',[])[::2]};paths=[]
 for key in config.get('packs',{}):paths.append((key,'packed-container'))
 for index,value in enumerate(ids):
  if index not in packed and index not in redirects:paths.append((uuid_path(value),'direct-import'))
 absent=[]
 for key,kind in paths:
  file=f.parent/'import'/key[:2]/(key+'.json')
  if not file.is_file():absent.append({'key':key,'kind':kind,'expected':file.relative_to(p).as_posix()})
 row={'bundle':f.parent.name,'config_sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'uuids':len(ids),'packed_indices':len(packed),'redirect_indices':len(redirects),'declared_import_paths':len(paths),'missing_imports':absent};rows.append(row);missing+=absent
changed=[];resources=[]
for f in(p/'assets').rglob('*'):
 if not f.is_file():continue
 old=r/'work'/f.relative_to(p)
 if not old.is_file()or old.read_bytes()!=f.read_bytes():changed.append(f.relative_to(p).as_posix())
 resources.append({'path':f.relative_to(p).as_posix(),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bundles':rows,'missing_import_count':len(missing),'changed_existing_asset_files':changed,'asset_files':resources,'scope':'Explicit Cocos import/pack and redirect declarations checked; all retained assets unchanged. Runtime dynamic/native dependency coverage remains separate and unverified.'};(p/'evidence/direct-repair/resource-closure-v2.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({'bundles':[{k:v for k,v in x.items()if k!='missing_imports'}for x in rows],'missing':missing[:12],'missing_count':len(missing),'changed_asset_files':changed,'retained_asset_files':len(resources)},ensure_ascii=False))
