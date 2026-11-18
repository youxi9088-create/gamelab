from pathlib import Path
import json,hashlib
b=Path(__file__).parent/'msn-capture-100';src=b/'msn-en-us/originals/9n3jkw7wdc16'
alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
def decode_uuid(value):
 base,sep,tail=value.partition('@')
 if len(base)==22:
  h=base[:2]
  for i in range(2,22,2):h+=f'{alpha.index(base[i])*64+alpha.index(base[i+1]):03x}'
  base=h[:8]+'-'+h[8:12]+'-'+h[12:16]+'-'+h[16:20]+'-'+h[20:]
 return base+(sep+tail if sep else '')
assets=[];bundles=[]
for name in ['internal','resources','main']:
 path=src/f'assets/{name}/config.json';c=json.loads(path.read_text());u=c['uuids']
 packed={str(i) for v in c.get('packs',{}).values() for i in v}
 redirected={str(i) for i in c.get('redirect',[])[::2]}
 extmap={str(i):ext for ext,ids in c.get('extensionMap',{}).items() for i in ids}
 keys=list(c.get('packs',{}))+[str(i) for i in range(len(u)) if str(i) not in packed|redirected]
 files=[]
 for key in keys:
  ident=key if key in c.get('packs',{}) else decode_uuid(u[int(key)])
  ext=extmap.get(key,'.json')
  rel=f'assets/{name}/{c.get("importBase","import")}/{ident[:2]}/{ident}{ext}'
  files.append(rel)
 assets+=files;bundles.append({'name':name,'uuid_count':len(u),'packed_members':len(packed),'redirected':len(redirected),'imports':len(files),'config_sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
out={'assets':sorted(set(assets)),'bundles':bundles,'basis':'All three original declared bundles, actual packs+redirect+extensionMap; compressed UUID decoder from source format. No game execution/UI.'}
p=b/'carromimports-native-assets-plan.json';assert not p.exists();p.write_text(json.dumps(out,indent=2),encoding='utf8')
print(json.dumps({'count':len(out['assets']),'bundles':bundles,'examples':out['assets'][:5]}))
