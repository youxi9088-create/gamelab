"""Inspect the original constant initializer and static-settings request helper."""
from pathlib import Path
import json,struct,re,contextlib,io,hashlib,subprocess,datetime,argparse
parser=argparse.ArgumentParser();parser.add_argument('--view',default='settings-constants');parser.add_argument('--functions',default='104682,4052');args=parser.parse_args()
assert re.fullmatch(r'[a-z0-9-]+',args.view)
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118'/args.view
assert not out.exists();out.mkdir()
src=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');src=src[:src.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'source-only-reader.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'source-only-reader','exec'),ns)
raw=ns['raw'];leb=ns['leb'];u=ns['uleb'];sections=ns['sections'];selected={int(x)for x in args.functions.split(',')}
assert selected and min(selected)>=ns['function_imports']
code=next(s for s in sections if s['kind']==10);count,p=leb(raw,code['start']);payload=bytearray(u(count));proof=[]
for i in range(count):
 size,p=leb(raw,p);body=raw[p:p+size];p+=size;fn=ns['function_imports']+i
 if fn in selected:proof.append({'function_index':fn,'bytes':size,'sha256':hashlib.sha256(body).hexdigest()})
 else:body=b'\0\0\x0b'
 payload.extend(u(len(body)));payload.extend(body)
assert p==code['end']and len(proof)==len(selected)
result=bytearray(raw[:8])
for s in sections:
 if s['kind']==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
 else:result.extend(raw[s['begin']:s['end']])
wasm=out/'settings-constant-analysis-NOT-RUNTIME.wasm';dcmp=out/'settings-constant-analysis-NOT-RUNTIME.dcmp';wasm.write_bytes(result)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(wasm),'-o',str(dcmp)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=55);assert res.returncode==0,res.stderr
text=dcmp.read_text(encoding='utf8');ms=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));snippets=[]
for n,m in enumerate(ms):
 if int(m[2])not in selected:continue
 source=text[m.start():ms[n+1].start()if n+1<len(ms)else len(text)]
 snippets.append({'function_index':int(m[2]),'source':source,'source_sha256':hashlib.sha256(source.encode()).hexdigest()})
assert len(snippets)==len(selected)
(out/'original-settings-constant-source.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':hashlib.sha256(raw).hexdigest(),'original_body_hashes':proof,'original_source_snippets':snippets},indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'bodies':proof,'source_sizes':[(x['function_index'],len(x['source']))for x in snippets]}))
