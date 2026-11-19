from pathlib import Path
import datetime,hashlib,json,re,sys
b=Path(__file__).parent;d=b/'msn-capture-100';src=d/'msn-en-us/originals/9nmj2s1n0x52';analysis=d/'source-analysis/doodledrop';root=d/'revisions/doodledrop-offline-v1';assert not (d/'doodledrop-offline-v1-manifest.json').exists(),'Already staged immutable revision'
read=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda raw:hashlib.sha256(raw).hexdigest()
receipts=[read(d/n) for n in ['doodledrop-pw-bootstrap-source-receipt.json','doodledrop-playwright-assets-source-receipt.json','doodledropcss-playwright-assets-source-receipt.json']]
files={n:h for r in receipts for n,h in (r.get('files') or {}).items() if n not in ['entry-metadata.json','capture-pw-bootstrap.json']};assert len(files)==86
root.mkdir(parents=True,exist_ok=True)
for n,h in files.items():
 raw=(src/n).read_bytes();assert sha(raw)==h
 if n=='fetchData.js':continue
 target=root/n;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
html=(src/'index.html').read_text(encoding='utf8');html=html.replace('<link rel="manifest" href="manifest.json">','')
html=re.sub(r'<script\s+src="https://assets\.msn\.com/[^"<>]+"></script>','',html);html=html.replace('<script src="fetchData.js"></script>','')
html=re.sub(r'<script>\s*setTimeout\(\(\) => \{\s*window\.setUpMigration\(window\.migrateData\);\s*\}, 500\);</script>','',html)
assert 'msstart' not in html and 'fetchData' not in html and 'setUpMigration' not in html
csp="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"
html=html.replace('<head>','<head>\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">',1);(root/'index.html').write_text(html,encoding='utf8')
(root/'main.172fad82.js').write_bytes((analysis/'service-retired.main.js').read_bytes())
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
au=audit(root);(d/'doodledrop-draft-static-audit.json').write_text(json.dumps(au,ensure_ascii=False,indent=2),encoding='utf8');assert au['status']=='static_pass' and not au['missing'] and not au['external'],str(au)[:1200]
manifest={p.relative_to(root).as_posix():sha(p.read_bytes()) for p in root.rglob('*') if p.is_file()};(d/'doodledrop-runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'native_id':'9nmj2s1n0x52','runtime_files':len(manifest),'runtime_bytes':sum(p.stat().st_size for p in root.rglob('*') if p.is_file()),'original_byte_exact_files':sum(files.get(n)==h for n,h in manifest.items()),'UI':0,'admitted':False,'full_native_resources_preserved':True,'retired':'Actual MSNSDK and domain migration providers+consumers, ad/reward/tournament/share functions; no fake SDK or rewards. Native localStorage progress and3lives preserved.'};(analysis/'offline-v1-build-proof.json').write_text(json.dumps(out,indent=2),encoding='utf8')
for old,new in [('msn_gunship_browser.cjs','msn_doodledrop_browser.cjs'),('msn_gunship_browser_channel.py','msn_doodledrop_browser_channel.py'),('msn_frisbeeforever_extract_ui.py','msn_doodledrop_extract_ui.py')]:
 s=(b/old).read_text(encoding='utf8').replace('gunship','doodledrop').replace('frisbeeforever','doodledrop').replace('9nvh11mzqtwq','9nmj2s1n0x52');p=b/new;assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_remote_gunship_HTTP_preflight.py').read_text(encoding='utf8');i=s.index('manifest=');z=s.index('app=Path',i);s=s[:i]+'manifest='+repr(manifest)+'\n'+s[z:];s=s.replace('gunship-offline-v1','doodledrop-offline-v1');p=b/'msn_remote_doodledrop_HTTP_preflight.py';assert not p.exists();p.write_text(s,encoding='utf8')
print(json.dumps(out))
