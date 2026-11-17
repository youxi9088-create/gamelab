from pathlib import Path
import json,hashlib
r=Path(__file__).parent/'direct-games/job-ad79ce70fd26';source=r/'work';target=r/'work-native-local-v2';target.mkdir(exist_ok=True);rows=[];copied=[]
for p in source.rglob('*'):
 if not p.is_file():continue
 rel=p.relative_to(source);canonical=None
 if rel.parts[0]=='subpackages':
  other=source/'assets'/Path(*rel.parts[1:])
  if other.is_file()and other.read_bytes()==p.read_bytes():canonical=other.relative_to(source).as_posix()
 if canonical:
  rows.append({'omitted':rel.as_posix(),'canonical':canonical,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()});continue
 out=target/rel;out.parent.mkdir(parents=True,exist_ok=True)
 data=p.read_bytes()
 if rel.as_posix()=='bridge.js':data=data.replace(b"if(e.reason?.errMsg?.startsWith('Browser edition')){e.preventDefault();return}",b'')
 if out.exists():assert out.read_bytes()==data,str(out)
 else:out.write_bytes(data)
 copied.append(rel.as_posix())
assert len(rows)==1051
e=target/'evidence/direct-repair';e.mkdir(parents=True,exist_ok=True);(e/'resource-deduplication-v2.json').write_text(json.dumps({'same_byte_aliases':rows,'copied_files':len(copied),'distinct_resources_game_js_preserved':(target/'subpackages/resources/game.js').is_file(),'settings_subpackages':json.loads((target/'src/settings.json').read_text(encoding='utf8'))['subpackages'],'scope':'Same-relative subpackages aliases consolidated to byte-identical assets files; original package/work retained. Settings has no native subpackages; original PlatformDefault loads assets bundles.'},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'copied_files':len(copied),'same_byte_aliases':len(rows),'candidate':str(target),'runtime_verified':False}))
