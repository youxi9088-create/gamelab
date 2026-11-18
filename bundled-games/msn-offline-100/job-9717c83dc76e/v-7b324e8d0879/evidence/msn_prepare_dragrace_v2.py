from pathlib import Path
import hashlib,json,shutil,sys
b=Path(__file__).parent;d=b/'msn-capture-100';root=d/'revisions/dragrace-offline-v2';old=d/'revisions/dragrace-offline-v1'
assert not root.exists();shutil.copytree(old,root)
raw=(d/'source-analysis/dragrace/service-retired-game-v2.js').read_bytes();p=json.loads((d/'source-analysis/dragrace/service-retirement-proof-v2.json').read_text())
assert hashlib.sha256(raw).hexdigest()==p['derived_sha256']and p['untouched_function_bodies_exact']>=7480
assert sum('original local start directly'in e['reason']for e in p['edits'])==1
assert sum('actual original key_up'in e['reason']for e in p['edits'])==1
(root/'js/game.js').write_bytes(raw)
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.resource_audit import audit
a=audit(root);assert a['status']=='static_pass'and not a['missing']and not a['external']
(d/'dragrace-v2-draft-static-audit.json').write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf-8')
m={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in root.rglob('*')if p.is_file()};assert len(m)==161
(d/'dragrace-v2-runtime-source-manifest.json').write_text(json.dumps(m,indent=2),encoding='utf-8')
s=(b/'msn_dragrace_browser.cjs').read_text(encoding='utf-8').replace('dragrace-offline-v1','dragrace-offline-v2').replace('events=[],logs=[],inputs=[]','events=[],logs=[],inputs=JSON.parse(fs.readFileSync("D:/GameLab/temp/dragrace-ui-abe62e5b64/inputs.json","utf8"))').replace('let spent=0','let spent=1').replace('ui_steps:0','ui_steps:1').replace("if(c.step!==1||c.url!==entry)","if(c.step!==2||c.url!==entry)")
assert 'let spent=1'in s and 'c.step!==2'in s
(b/'msn_dragrace_browser_v2.cjs').write_text(s,encoding='utf-8')
s=(b/'msn_dragrace_browser_channel.py').read_text(encoding='utf-8').replace('msn_dragrace_browser.cjs','msn_dragrace_browser_v2.cjs');(b/'msn_dragrace_browser_v2_channel.py').write_text(s,encoding='utf-8')
s=(b/'msn_remote_dragrace_HTTP_preflight.py').read_text(encoding='utf-8');i=s.index('manifest=');z=s.index('app=Path',i);s=s[:i]+'manifest='+repr(m)+'\n'+s[z:];s=s.replace('dragrace-offline-v1','dragrace-offline-v2');(b/'msn_remote_dragrace_v2_HTTP_preflight.py').write_text(s,encoding='utf-8')
print(json.dumps({'runtime_files':len(m),'source_only':True,'unchanged_function_bodies':p['untouched_function_bodies_exact'],'cumulative_UI_used':1,'remaining':4,'runtime_verified':False}))
