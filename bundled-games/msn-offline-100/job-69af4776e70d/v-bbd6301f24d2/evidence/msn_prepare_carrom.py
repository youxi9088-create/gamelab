from pathlib import Path
import json,re,hashlib,shutil,datetime,sys
b=Path(__file__).parent;d=b/'msn-capture-100';src=d/'msn-en-us/originals/9n3jkw7wdc16';root=d/'revisions/carrom-offline-v1'
assert not root.exists()
plans=[json.loads((d/f'{label}-native-assets-plan.json').read_text()) for label in ['carromimports','carromnative']]
assert all((src/n).is_file() for plan in plans for n in plan['assets'])
proof=json.loads((d/'source-analysis/carrom/service-retirement-proof-v1.json').read_text());assert proof['no_SDK_facade'] and not proof['leftovers']
root.mkdir(parents=True)
excluded={'entry-metadata.json','capture-pw-bootstrap.json','fetchData.js','manifest.json'}
for p in src.rglob('*'):
 if not p.is_file() or p.name in excluded:continue
 q=root/p.relative_to(src);q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
raw=(d/'source-analysis/carrom/service-retired-main-v1.js').read_bytes();assert hashlib.sha256(raw).hexdigest()==proof['derived_sha256'];(root/'assets/main/index.js').write_bytes(raw)
settings=json.loads((src/'src/settings.json').read_text());assert settings['plugins']['jsList']==['assets/plugins/PlayFabClientApi.js'];settings['plugins']['jsList']=[]
(root/'src/settings.json').write_text(json.dumps(settings,separators=(',',':')),encoding='utf8')
html=(src/'index.html').read_text()
for pattern,expected in [(r'<script src="fetchData.js"></script>',1),(r'<link rel="manifest" href="manifest.json" />',1),(r'<script>\s*setTimeout\(\(\) => \{\s*window.setUpMigration\(window.migrateData\);\s*\}, 500\);\s*</script>',1),(r'<script src="https://assets\.msn\.com/[^"\s]+"></script>',1)]:
 html,count=re.subn(pattern,'',html);assert count==expected,(pattern,count)
csp="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
html=html.replace('<meta charset="utf-8">','<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">',1);(root/'index.html').write_text(html,encoding='utf8')
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
au=audit(root);(d/'carrom-draft-static-audit.json').write_text(json.dumps(au,ensure_ascii=False,indent=2),encoding='utf8');assert au['status']=='static_pass' and not au['missing'] and not au['external'],str(au)[:1800]
manifest={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()};(d/'carrom-runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2))
exact=[n for n,h in manifest.items() if hashlib.sha256((src/n).read_bytes()).hexdigest()==h]
(d/'source-analysis/carrom/offline-v1-build-proof.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'runtime_files':len(manifest),'runtime_bytes':sum(p.stat().st_size for p in root.rglob('*') if p.is_file()),'byte_exact_original_files':len(exact),'source_function_bodies_exact':proof['unrelated_function_bodies_exact'],'all_three_declared_bundles':True,'complete_import_records':len(plans[0]['assets']),'complete_native_resources':len(plans[1]['assets']),'retired_original_migration_iframe_and_MSStart_script':True,'retired_missing_unconsumed_PlayFab_plugin_request_HTTP404_preserved':True,'runtime_verified':False,'admitted':False},indent=2))
s=(b/'msn_dragrace_browser.cjs').read_text().replace('dragrace-offline-v1','carrom-offline-v1').replace('9nkxlf5z9lkd','9n3jkw7wdc16');p=b/'msn_carrom_browser.cjs';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_dragrace_browser_channel.py').read_text().replace('dragrace','carrom');p=b/'msn_carrom_browser_channel.py';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_remote_dragrace_HTTP_preflight.py').read_text();i=s.index('manifest=');z=s.index('app=Path',i);s=s[:i]+'manifest='+repr(manifest)+'\n'+s[z:];s=s.replace('dragrace-offline-v1','carrom-offline-v1');p=b/'msn_remote_carrom_HTTP_preflight.py';assert not p.exists();p.write_text(s,encoding='utf8')
print(json.dumps({'runtime_files':len(manifest),'byte_exact_original_files':len(exact),'static':au['status'],'UI':0}))
