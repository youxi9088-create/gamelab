"""Build a source-bound standalone draft; no native code execution."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,re,shutil,sys
b=Path(__file__).parent;d=b/'msn-capture-100';src=d/'msn-en-us/originals/9nvh11mzqtwq';analysis=d/'source-analysis/gunship';root=d/'revisions/gunship-offline-v1';assert not root.exists()
read=lambda p:json.loads(p.read_text());sha=lambda raw:hashlib.sha256(raw).hexdigest()
receipts=[read(d/n) for n in ['gunship-pw-bootstrap-source-receipt.json','gunship-playwright-assets-source-receipt.json','gunshiptemplates-playwright-assets-source-receipt.json']]
files={n:h for receipt in receipts for n,h in receipt['files'].items()};assert all(not any(r.get('error') for r in receipt['rows']) for receipt in receipts);assert all(sha((src/n).read_bytes())==h for n,h in files.items())
wasm=read(analysis/'wasm-service-retirement-proof.json');structure=read(analysis/'wasm-structure-validation.json');abi=read(analysis/'framework-retirement-proof.json');table=read(analysis/'external-import-indirect-table-audit.json')
assert wasm['modified_functions']==7 and wasm['other_function_bodies_exact']==113959 and structure['derived_valid'] and not table['direct_remote_imports_in_indirect_function_table']
assert abi['SDK_facade_created']==abi['SDK_callbacks_or_success_synthesized']==False
root.mkdir(parents=True)
for name in files:
 if name in ['entry-metadata.json','capture-pw-bootstrap.json']:continue
 p=root/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src/name,p)
raw=(analysis/'service-retired.wasm').read_bytes();assert sha(raw)==wasm['derived_wasm_sha256'];(root/'Build/Build.wasm').write_bytes(raw)
raw=(analysis/'service-retired.framework.js').read_bytes();assert sha(raw)==abi['derived_sha256'];(root/'Build/Build.framework.js').write_bytes(raw)
html=(src/'index.html').read_text()
html,n=re.subn(r'<script src="https://assets\.msn\.com/[^"\n]+"></script>','',html);assert n==1
html,n=re.subn(r'window\.addEventListener\("load", function \(\) \{\s*if \("serviceWorker" in navigator\) \{\s*navigator\.serviceWorker\.register\("ServiceWorker.js"\);\s*\}\s*\}\);','',html);assert n==1
html,n=re.subn(r'if \(window\.\$msstart != null && window\.\$msstart\.notifyContentLoad != null\) \{\s*window\.\$msstart\.notifyContentLoad\(\);\s*\}','',html);assert n==1
csp="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
html=html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">',1);assert 'http-equiv="Content-Security-Policy"' in html
(root/'index.html').write_text(html,encoding='utf8')
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
au=audit(root);(d/'gunship-draft-static-audit.json').write_text(json.dumps(au,ensure_ascii=False,indent=2),encoding='utf8');assert au['status']=='static_pass' and not au['missing'] and not au['external'],str(au)[:1800]
manifest={p.relative_to(root).as_posix():sha(p.read_bytes()) for p in root.rglob('*') if p.is_file()};(d/'gunship-runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2))
exact=[name for name,h in manifest.items() if files.get(name)==h]
out={'at':datetime.now(timezone.utc).isoformat(),'source_only':True,'native_id':'9nvh11mzqtwq','runtime_files':len(manifest),'runtime_bytes':sum(p.stat().st_size for p in root.rglob('*') if p.is_file()),'original_byte_exact_files':len(exact),'original_Unity_data_pack_byte_exact':manifest['Build/Build.data']==files['Build/Build.data'],'defined_functions':113966,'gameplay_engine_functions_byte_exact':113959,'remote_consumers_removed':6,'platform_providers_removed':4,'original_canvas_focus_kept':True,'original_local_save_cloud_timeout_rules_not_faked':True,'original_all_missions_assets_retained':True,'UI':0,'runtime_verified':False,'admitted':False}
(analysis/'offline-v1-build-proof.json').write_text(json.dumps(out,indent=2))
s=(b/'msn_dragrace_browser.cjs').read_text().replace('dragrace-offline-v1','gunship-offline-v1').replace('9nkxlf5z9lkd','9nvh11mzqtwq');p=b/'msn_gunship_browser.cjs';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_dragrace_browser_channel.py').read_text().replace('dragrace','gunship');p=b/'msn_gunship_browser_channel.py';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_remote_carrom_HTTP_preflight_v2.py').read_text();i=s.index('manifest=');z=s.index('app=Path',i);s=s[:i]+'manifest='+repr(manifest)+'\n'+s[z:];s=s.replace('carrom-offline-v1','gunship-offline-v1');p=b/'msn_remote_gunship_HTTP_preflight.py';assert not p.exists();p.write_text(s,encoding='utf8')
print(json.dumps(out))
