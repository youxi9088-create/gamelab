from pathlib import Path
import json,urllib.parse,re,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-c8efbf50be33'
fails=json.loads((r/'mission-failure-paths-20261117.json').read_text())['failures'];paths=sorted({urllib.parse.urlsplit(x['url']).path.lstrip('/')for x in fails})
out={'missing_paths':paths,'local_matches':{},'receipt_schemas':{},'url_contexts':[]}
files=[p for p in r.rglob('*')if p.is_file()and p.suffix not in ['.zip','.png','.jpg','.glb','.bin','.wasm']]
for n in paths:
 matches=[p for p in files if p.name==Path(n).name]
 out['local_matches'][n]=[str(p.relative_to(r))for p in matches]
for p in r.glob('asset-*.json'):
 x=json.loads(p.read_text(encoding='utf8'));out['receipt_schemas'][p.name]=list(x)[:12]if isinstance(x,dict)else 'list:'+str(len(x))
p=r/'work/evidence/direct-repair/source-preservation.json';out['source_proof']=json.loads(p.read_text(encoding='utf8'))
for f in ['asset-recovery.json','asset-materialization.json','asset-dynamic-materialization.json','asset-model-materialization.json']:
 p=r/f
 for s in re.findall(r'https?[^\s"<>]+',p.read_text(encoding='utf8')):
  if any(q in s for q in ['/pack_a','/index.js','/missions.json','_call.ogg']):out['url_contexts'].append(s)
out['url_contexts']=sorted(set(out['url_contexts']))[:35]
(r/'original-missing-material-inventory-20261117.json').write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=False,indent=2))
