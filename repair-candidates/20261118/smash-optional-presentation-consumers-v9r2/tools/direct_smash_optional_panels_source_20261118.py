"""Recover original optional-panel consumers; never execute the analysis slice."""
from pathlib import Path
import json,struct,re,hashlib,contextlib,io,subprocess,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118/optional-panels-source';assert not out.exists();out.mkdir()
source=(b/'direct_smash_data_services_source_20261118.py').read_text(encoding='utf8')
source=source[source.index('src=(b/'):source.index('targets=')]
ns={'b':b,'r':r,'old':r/'analysis-20261117','json':json,'struct':struct,'hashlib':hashlib,'contextlib':contextlib,'io':io}
exec(compile(source,'immutable-original-reader-only','exec'),ns)
raw=ns['raw'];meta=ns['meta'];tt=ns['tt'];ts=ns['ts'];mt=ns['mt'];string=ns['string'];ptrs=ns['ptrs'];table=ns['table'];leb=ns['leb'];u=ns['uleb'];sections=ns['sections'];imports=ns['imports']
targets={'SKServicesLoader','CrossPromoPanel','FullScreenNewsPanel','NewsAndFriendsPanel','NewsPanel','NewsItem'}
methods=[];selected=set();names={}
for t in range(ts//88):
    off=tt+t*88;name=string(struct.unpack_from('<I',meta,off)[0])
    if name not in targets:continue
    first=struct.unpack_from('<i',meta,off+36)[0];count=struct.unpack_from('<H',meta,off+64)[0]
    for mi in range(first,first+count):
        mo=mt+mi*36;token=struct.unpack_from('<I',meta,mo+24)[0];assert struct.unpack_from('<i',meta,mo+4)[0]==t
        assert 0<(token&0xffffff)<=len(ptrs);ptr=ptrs[(token&0xffffff)-1]
        if not ptr:continue
        fn=table[ptr];mn=string(struct.unpack_from('<I',meta,mo)[0]);selected.add(fn);names.setdefault(fn,re.sub(r'\W','_',name+'_'+mn)+'_'+str(fn))
        methods.append({'class':name,'type_index':t,'method_index':mi,'name':mn,'token':token,'function_index':fn})
assert {x['class']for x in methods}==targets
code=next(x for x in sections if x['kind']==10);count,p=leb(raw,code['start']);payload=bytearray(u(count));body_proof=[]
for i in range(count):
    size,p=leb(raw,p);body=raw[p:p+size];p+=size;fn=imports+i
    if fn in selected:body_proof.append({'function_index':fn,'bytes':size,'sha256':hashlib.sha256(body).hexdigest()})
    else:body=b'\0\0\x0b'
    payload.extend(u(len(body)));payload.extend(body)
assert p==code['end'] and len(body_proof)==len(selected)
result=bytearray(raw[:8])
for s in sections:
    result.extend(bytes([10])+u(len(payload))+payload if s['kind']==10 else raw[s['begin']:s['end']])
name_payload=u(len(names))+b''.join(u(i)+u(len(n.encode()))+n.encode()for i,n in sorted(names.items()))
custom=b'\x04name'+b'\x01'+u(len(name_payload))+name_payload;result.extend(b'\0'+u(len(custom))+custom)
wasm=out/'optional-panels-analysis-NOT-RUNTIME.wasm';dcmp=out/'optional-panels-analysis-NOT-RUNTIME.dcmp';wasm.write_bytes(result)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(wasm),'-o',str(dcmp)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
text=dcmp.read_text(encoding='utf8');headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));snippets=[]
for i,m in enumerate(headers):
    if int(m[2])not in selected:continue
    s=text[m.start():headers[i+1].start()if i+1<len(headers)else len(text)];snippets.append({'function_index':int(m[2]),'source':s,'sha256':hashlib.sha256(s.encode()).hexdigest()})
assert len(snippets)==len(selected)
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':hashlib.sha256(raw).hexdigest(),'methods':methods,'original_body_proofs':body_proof,'original_source_snippets':snippets,'boundary':'Declarations and bodies are original evidence, not proof of optionality or a safe edit. No service flags, callbacks, UI or task states changed.'}
(out/'original-optional-panel-source.json').write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'methods':len(methods),'unique_function_bodies':len(selected),'largest_bodies':sorted(body_proof,key=lambda x:x['bytes'],reverse=True)[:3]}))
