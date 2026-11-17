from pathlib import Path
import re,json,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out={'source_only':True,'runtime_executed':False,'files':[]}
for p in (r/'native-build-20261117').iterdir():
 if not p.is_file() or p.suffix=='.headers' or not any(x in p.name for x in ['framework','loader']):continue
 raw=p.read_bytes();text=raw.decode('utf8');rows=[]
 for term in ['global-metadata','metadata','decrypt','Decrypt','Crypto','XOR','HEAPU8','.data','firebase','firebaseConfig','Addressables','StreamingAssets','instantiateWasm']:
  matches=list(re.finditer(re.escape(term),text));rows.append({'term':term,'count':len(matches),'snippets':[text[max(0,m.start()-90):m.end()+180] for m in matches[:3]]})
 out['files'].append({'name':p.name,'sha256':hashlib.sha256(raw).hexdigest(),'matches':rows})
for p in (r/'native-unpacked-20261117').rglob('global-metadata.dat'):
 raw=p.read_bytes();strings=[m.group().decode('ascii') for m in re.finditer(rb'[A-Za-z_][A-Za-z0-9_.]{8,90}',raw)]
 out.setdefault('metadata',[]).append({'file':p.relative_to(r).as_posix(),'sha256':hashlib.sha256(raw).hexdigest(),'printable_identifiers':len(strings),'gameplay_hints':[s for s in strings if re.search('practice|offline|training|botmanager',s,re.I)][:50]})
target=r/'analysis-20261117/metadata-boundary-source.json';target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
