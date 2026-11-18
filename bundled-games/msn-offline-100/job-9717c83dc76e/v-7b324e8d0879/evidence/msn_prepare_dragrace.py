"""Build one immutable offline candidate from actual source; no native execution."""
from pathlib import Path
import datetime,hashlib,json,re,shutil,sys
b=Path(__file__).parent;d=b/'msn-capture-100';src=d/'msn-en-us/originals/9nkxlf5z9lkd';root=d/'revisions/dragrace-offline-v1'
assert not root.exists(),'Inspect existing immutable build instead of replacing it'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
plan=json.loads((d/'dragrace-native-assets-plan.json').read_text(encoding='utf-8'))
assert all((src/n).is_file()for n in plan['assets'])
proof=json.loads((d/'source-analysis/dragrace/service-retirement-proof.json').read_text(encoding='utf-8'))
assert proof['no_SDK_facade']and proof['no_auth_or_reward_success_synthesis']and proof['untouched_function_bodies_exact']==7485
root.mkdir(parents=True)
for p in src.rglob('*'):
 if not p.is_file()or p.name in ['entry-metadata.json','capture-pw-bootstrap.json']:continue
 q=root/p.relative_to(src);q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
raw=(d/'source-analysis/dragrace/service-retired-game.js').read_bytes();assert sha(raw)==proof['derived_sha256'];(root/'js/game.js').write_bytes(raw)
html=(src/'index.html').read_text(encoding='utf-8')
html,n=re.subn(r'<script src="https://assets\.msn\.com/[^\"]+"></script>','',html);assert n==1
html,n=re.subn(r'<link rel= "manifest" href= "\./manifest.json">','',html);assert n==1
html,n=re.subn(r'<div id="ads"></div>','',html);assert n==1
csp="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
html=html.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">',1);(root/'index.html').write_text(html,encoding='utf-8')
manifest={p.relative_to(root).as_posix():sha(p.read_bytes())for p in root.rglob('*')if p.is_file()}
assert len(manifest)==161
original_exact=[n for n,h in manifest.items()if(src/n).is_file()and sha((src/n).read_bytes())==h];assert len(original_exact)==159
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
au=audit(root);(d/'dragrace-draft-static-audit.json').write_text(json.dumps(au,ensure_ascii=False,indent=2),encoding='utf-8');assert au['status']=='static_pass'and not au['missing']and not au['external'],str(au)[:1500]
(d/'dragrace-runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(d/'source-analysis/dragrace/offline-v1-build-proof.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'native_executed_locally':False,'runtime_files':len(manifest),'original_byte_exact_files':len(original_exact),'full_source_assets':len(plan['assets']),'native_car_atlases':32,'source_main_regions':4,'runtime_bytes':sum(p.stat().st_size for p in root.rglob('*')if p.is_file()),'source_gameplay_functions_exact':7485,'status':'static_pass','runtime_verified':False,'admitted':False},indent=2),encoding='utf-8')
print(json.dumps({'revision':root.name,'runtime_files':len(manifest),'original_byte_exact_files':len(original_exact),'static':au['status']}))
