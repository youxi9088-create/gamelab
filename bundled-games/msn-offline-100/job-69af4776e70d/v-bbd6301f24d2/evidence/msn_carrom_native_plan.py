from pathlib import Path
import json,collections,re,sys
b=Path(__file__).parent/'msn-capture-100';src=b/'msn-en-us/originals/9n3jkw7wdc16'
alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
def uuid(value):
 base,sep,tail=value.partition('@')
 if len(base)==22:
  h=base[:2]
  for i in range(2,22,2):h+=f'{alpha.index(base[i])*64+alpha.index(base[i+1]):03x}'
  base=h[:8]+'-'+h[8:12]+'-'+h[12:16]+'-'+h[16:20]+'-'+h[20:]
 return base+(sep+tail if sep else '')
def read(path):
 raw=path.read_bytes()
 if path.suffix=='.cconb':
  assert raw[:4]==b'CCON' and int.from_bytes(raw[4:8],'little')==1
  assert len(raw)==int.from_bytes(raw[8:12],'little')
  return json.loads(raw[16:16+int.from_bytes(raw[12:16],'little')])
 return json.loads(raw)
def extensions(d):
 result=set()
 if not isinstance(d,list) or len(d)<6:return result
 classes,masks,instances=d[3:6]
 if classes==['cc.ImageAsset']:
  assert isinstance(instances[0],dict) and 'fmt' in instances[0]
  for fmt in instances[0]['fmt'].split('_'):
   fmt=fmt.split('@')[0]
   ext=['.png','.jpg','.jpeg','.bmp','.webp','.pvr','.pkm'][int(fmt)] if fmt.isdigit() else '.'+fmt
   assert ext in ['.png','.jpg','.jpeg','.bmp','.webp','.pvr','.pkm'],ext
   result.add(ext)
 if not isinstance(classes,list) or not isinstance(masks,list):return result
 def walk(v):
  if not isinstance(v,list):return
  if v and type(v[0]) is int and 0<=v[0]<len(masks):
   mask=masks[v[0]]
   if isinstance(mask,list) and mask and type(mask[0]) is int and 0<=mask[0]<len(classes):
    cls=classes[mask[0]]
    if isinstance(cls,list) and len(cls)>1 and isinstance(cls[1],list):
     for pos in range(1,min(len(v),len(mask)-1)):
      index=mask[pos]
      if type(index) is int and 0<=index<len(cls[1]) and cls[1][index]=='_native' and isinstance(v[pos],str):
       ext=v[pos]
       if ext.startswith('.') and 1<len(ext)<10 and ext[1:].isalnum():result.add(ext)
       elif ext and len(ext)<180 and '..' not in ext and '/' not in ext and '\\' not in ext and re.search(r'\.[A-Za-z0-9]{1,8}$',ext):result.add('/'+ext)
  for item in v:walk(item)
 walk(instances)
 return result
planned={};counts=collections.Counter();missing=[]
for name in ['internal','resources','main']:
 c=json.loads((src/f'assets/{name}/config.json').read_text());u=c['uuids'];folder=f'assets/{name}';decoded={}
 for p in (src/folder/c['importBase']).glob('**/*'):
  if not p.is_file():continue
  key=p.stem
  if key in c.get('packs',{}):
   data=read(p);ids=c['packs'][key]
   if isinstance(data,dict):
    assert data.get('type')=='cc.Texture2D' and len(data['data'])==len(ids),(str(p),str(data)[:200])
    continue  # Texture metadata pack references original standalone cc.ImageAsset imports.
   assert isinstance(data,list) and len(data)>5,(str(p),type(data).__name__,str(data)[:200])
   assert len(data[5])==len(ids),(str(p),len(data[5]),len(ids))
   for i,body in zip(ids,data[5]):decoded[int(i)]=data[:5]+body
  else:
   lookup={uuid(v):i for i,v in enumerate(u)}
   if key in lookup:decoded[lookup[key]]=read(p)
 for i,data in decoded.items():
  for ext in extensions(data):
   uid=uuid(u[i]);rel=f'{folder}/{c["nativeBase"]}/{uid[:2]}/{uid}{ext}';planned[rel]={'bundle':name,'index':i,'uuid':u[i],'format':ext};counts[ext]+=1
out={'assets':sorted(planned),'source_evidence':planned,'counts':dict(counts),'basis':'All original image fmt + serialized _native fields across unpacked Cocos packs and standalone imports; CCON document decoded as data only. No native code execution.'}
label=sys.argv[1] if len(sys.argv)>1 else 'carromnative'
assert label.isalnum()
p=b/f'{label}-native-assets-plan.json';assert not p.exists();p.write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps({'assets':len(planned),'formats':dict(counts),'missing_local':[n for n in out['assets'] if not (src/n).is_file()]}))
