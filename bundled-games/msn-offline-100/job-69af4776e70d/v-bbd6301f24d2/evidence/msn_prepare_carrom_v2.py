from pathlib import Path
import json,hashlib,shutil,sys,datetime
b=Path(__file__).parent;d=b/'msn-capture-100';old=d/'revisions/carrom-offline-v1';root=d/'revisions/carrom-offline-v2';src=d/'msn-en-us/originals/9n3jkw7wdc16'
assert not root.exists();font=json.loads((d/'carromfont-native-assets-plan.json').read_text())['assets'];assert len(font)==1
shutil.copytree(old,root)
for name in font:
 p=src/name;assert p.read_bytes()[:4]==b'\x00\x01\x00\x00';q=root/name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
manifest={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
first=json.loads((d/'carrom-runtime-source-manifest.json').read_text());assert len(manifest)==len(first)+1 and all(manifest[n]==h for n,h in first.items())
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
au=audit(root);assert au['status']=='static_pass' and not au['missing'] and not au['external'];(d/'carrom-v2-draft-static-audit.json').write_text(json.dumps(au,ensure_ascii=False,indent=2),encoding='utf8')
(d/'carrom-v2-runtime-source-manifest.json').write_text(json.dumps(manifest,indent=2))
(d/'source-analysis/carrom/offline-v2-build-proof.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'runtime_files':len(manifest),'all_previous_runtime_bytes_unchanged':True,'added_only_original_native_font':font,'font_source_sha256':manifest[font[0]],'cumulative_UI_before':2,'remaining_UI':3,'runtime_verified':False,'admitted':False},indent=2))
s=(b/'msn_carrom_browser.cjs').read_text().replace('carrom-offline-v1','carrom-offline-v2').replace('events=[],logs=[],inputs=[]','events=[],logs=[],inputs=JSON.parse(fs.readFileSync("D:/GameLab/temp/carrom-ui-ccfffe3565/inputs.json","utf8"))').replace('let spent=0','let spent=2').replace('ui_steps:0','ui_steps:2').replace('if(c.step!==1||c.url!==entry)','if(c.step!==3||c.url!==entry)')
p=b/'msn_carrom_browser_v2.cjs';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_carrom_browser_channel.py').read_text().replace('msn_carrom_browser.cjs','msn_carrom_browser_v2.cjs');p=b/'msn_carrom_browser_v2_channel.py';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_remote_carrom_HTTP_preflight_v2.py').read_text();i=s.index('manifest=');z=s.index('app=Path',i);s=s[:i]+'manifest='+repr(manifest)+'\n'+s[z:];s=s.replace('carrom-offline-v1','carrom-offline-v2');p=b/'msn_remote_carrom_v2_HTTP_preflight.py';assert not p.exists();p.write_text(s,encoding='utf8')
s=(b/'msn_remote_dragrace_v2_terminal.py').read_text().replace('dragrace-ui-4a9ac7d55c','carrom-ui-ccfffe3565').replace('37928','29844');p=b/'msn_remote_carrom_v1_terminal.py';assert not p.exists();p.write_text(s,encoding='utf8')
print(json.dumps({'files':len(manifest),'source_only':True,'UI_spent':2,'remaining':3}))
