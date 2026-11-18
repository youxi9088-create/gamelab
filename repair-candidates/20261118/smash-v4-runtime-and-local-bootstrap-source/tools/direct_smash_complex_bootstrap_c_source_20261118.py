"""Read two previously un-decompilable original bodies as C; never compile/run them."""
from pathlib import Path
import json,hashlib,contextlib,io,subprocess,re,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118/complex-bootstrap-c-source';assert not out.exists();out.mkdir()
s=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');s=s[:s.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'static-original-complex-source.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(s,'static-original-complex-source','exec'),ns)
raw=ns['raw'];leb=ns['leb'];u=ns['uleb'];sections=ns['sections'];selected={26015:'GameSettingsService_gbx_26015',43610:'GameDataService_fxz_43610'};code=next(x for x in sections if x['kind']==10);count,p=leb(raw,code['start']);payload=bytearray(u(count));bodies=[]
for i in range(count):
    n,p=leb(raw,p);body=raw[p:p+n];p+=n;fn=ns['function_imports']+i
    if fn in selected:bodies.append(dict(function_index=fn,name=selected[fn],bytes=n,sha256=hashlib.sha256(body).hexdigest()))
    else:body=b'\0\0\x0b'
    payload.extend(u(len(body)));payload.extend(body)
assert p==code['end']and len(bodies)==2
result=bytearray(raw[:8])
for x in sections:
    if x['kind']==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
    else:result.extend(raw[x['begin']:x['end']])
name_payload=u(len(selected))+b''.join(u(i)+u(len(n.encode()))+n.encode()for i,n in sorted(selected.items()))
custom=b'\x04name\x01'+u(len(name_payload))+name_payload;result.extend(b'\0'+u(len(custom))+custom)
slice_path=out/'complex-bootstrap-ANALYSIS-ONLY-NOT-RUNTIME.wasm';slice_path.write_bytes(result);target=out/'complex-bootstrap-ANALYSIS-ONLY-NOT-RUNTIME.c'
tool=b/'native-analysis-tools/node_modules/wabt/bin/wasm2c'
res=subprocess.run(['node',str(tool),str(slice_path),'-n','smash_static_analysis','-o',str(target)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=55)
receipt=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,source_compiled=False,original_modified=False,original_wasm_sha256=hashlib.sha256(raw).hexdigest(),slice_sha256=hashlib.sha256(result).hexdigest(),original_bodies=bodies,conversion_exit=res.returncode,stderr=res.stderr[-2000:])
if res.returncode==0:
    text=target.read_text(encoding='utf8');snippets=[]
    for fn,name in selected.items():
        matches=list(re.finditer(r'^(?:static )?(?:void|u32) w2c_smash__static__analysis_'+re.escape(name)+r'\([^;]*?\)\s*\{',text,re.M));assert len(matches)==1,(name,len(matches));m=matches[0];start=m.start();p=m.end();depth=1
        while depth:
            if text[p]=='{':depth+=1
            elif text[p]=='}':depth-=1
            p+=1
        source=text[start:p];snippets.append(dict(function_index=fn,name=name,source_bytes=len(source.encode()),source_sha256=hashlib.sha256(source.encode()).hexdigest(),source=source))
    receipt.update(original_c_source_snippets=snippets,c_output_bytes=target.stat().st_size,limitations=['C is a static translation of only two preserved original bodies; other analysis-slice bodies are unreachable placeholders.','Never compile or execute this analysis slice/C as a game.','Readable source is not proof of an offline initialization implementation or runtime readiness.'])
    (out/'original-complex-c-source.json').write_bytes(json.dumps(receipt,ensure_ascii=False,indent=2).encode())
else:(out/'conversion-failure.json').write_bytes(json.dumps(receipt,ensure_ascii=False,indent=2).encode())
print(json.dumps({k:v for k,v in receipt.items()if k!='original_c_source_snippets'},ensure_ascii=False))
if res.returncode:raise SystemExit(res.returncode)
