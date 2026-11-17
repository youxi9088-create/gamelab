"""Preserve all 235 instruction bodies; decompile 233 smaller bodies in a separate view."""
from pathlib import Path
import json,struct,hashlib,re,subprocess,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a/analysis-20261118/data-services-v2'
raw=(r/'services-analysis-only-NOT-RUNTIME.wasm').read_bytes();mapping=json.loads((r/'mapping-before-decompilation.json').read_text())
excluded={26015,43610};selected={m['function_index']for m in mapping['mapped_methods']}-excluded
assert len(selected)==233
def leb(data,p):
 v=s=0
 while True:
  c=data[p];p+=1;v|=(c&127)<<s;s+=7
  if not c&128:return v,p
def u(v):
 out=bytearray()
 while True:
  c=v&127;v>>=7;out.append(c|(128 if v else 0))
  if not v:return bytes(out)
sections=[];p=8
while p<len(raw):
 begin=p;kind=raw[p];size,p=leb(raw,p+1);sections.append((kind,begin,p,p+size));p+=size
code=next(s for s in sections if s[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count))
for i in range(count):
 size,p=leb(raw,p);body=raw[p:p+size];p+=size
 if i+599 in excluded:body=b'\0\0\x0b'
 payload.extend(u(len(body)));payload.extend(body)
assert p==code[3];result=bytearray(raw[:8])
for kind,begin,start,end in sections:
 if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
 else:result.extend(raw[begin:end])
wasm=r/'services-bounded-view-NOT-RUNTIME.wasm';target=r/'services-bounded-view-NOT-RUNTIME.dcmp';assert not wasm.exists()and not target.exists();wasm.write_bytes(result)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(wasm),'-o',str(target)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=60)
assert res.returncode==0,res.stderr
text=target.read_text(encoding='utf8');headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));snippets=[]
for i,m in enumerate(headers):
 if int(m[2])not in selected:continue
 body=text[m.start():headers[i+1].start()if i+1<len(headers)else len(text)]
 snippets.append({'function_index':int(m[2]),'name':re.match(r'(\w+)\(',m[1])[1],'source_sha256':hashlib.sha256(body.encode()).hexdigest(),'source':body})
assert len(snippets)==233
instructions=(r/'services-original-instructions-NOT-RUNTIME.txt').read_text(encoding='utf8')
lines=instructions.splitlines(keepends=True);positions=[i for i,line in enumerate(lines)if re.search(r'func\[\d+\].*:',line)]
instruction_snippets=[]
for n,i in enumerate(positions):
 fn=int(re.search(r'func\[(\d+)\]',lines[i])[1])
 if fn not in {m['function_index']for m in mapping['mapped_methods']}:continue
 body=''.join(lines[i:positions[n+1]if n+1<len(positions)else len(lines)])
 instruction_snippets.append({'function_index':fn,'sha256':hashlib.sha256(body.encode()).hexdigest(),'instructions':body})
assert len(instruction_snippets)==235
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':'4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a','metadata_sha256':'01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7','mapping':mapping,'original_source_snippets':snippets,'original_instruction_snippets':instruction_snippets,'source_decompilation_excluded_functions':sorted(excluded),'prior_decompiler_failure':'Two initial analysis attempts exited1 with WABT memory-access-out-of-bounds; original game was never executed','limitations':['235 original bodies are preserved in instruction form; only233 smaller bodies have a structured source view','Two complex original bodies are not decompiled; they are never silently classified as empty','NOT-RUNTIME slice contains unrelated unreachable bodies, never execute it','No consumer or SDK/provider state modified; semantic conclusions require reading original instructions']}
(r/'service-original-source-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'original_instruction_functions':235,'decompiled_functions':233,'excluded_structured_view':sorted(excluded),'proof_bytes':(r/'service-original-source-proof.json').stat().st_size}))
