"""Read original service consumers; analysis slices must never be executed."""
from pathlib import Path
import json,struct,contextlib,io,re,hashlib,subprocess,datetime,sys,collections
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';old=r/'analysis-20261117';out=r/'analysis-20261118/data-services-v2'
assert not out.exists();out.mkdir()
src=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
src=src[:src.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns={'__file__':str(b/'static-services-reader.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'static-services-reader','exec'),ns)
raw=ns['raw'];memory=ns['memory'];table=ns['table'];sections=ns['sections'];leb=ns['leb'];uleb=ns['uleb'];imports=ns['function_imports']
assert hashlib.sha256(raw).hexdigest()=='4e5749e7e1047cd30c65ab6294cf2a3566801a97b5954d1fce10f39c6d75a05a'
meta=(old/'metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
st,ss=struct.unpack_from('<II',meta,24);tt,ts=struct.unpack_from('<II',meta,160);mt,ms=struct.unpack_from('<II',meta,48)
def string(i):
 assert 0<=i<ss
 return meta[st+i:meta.index(0,st+i,st+ss)].decode('utf8')
previous=json.loads((old/'native-gameplay-wasm-map.json').read_text(encoding='utf8'))
module=previous['modules']['Assembly-CSharp.dll'];assert module['pointers_address']==5777488
ptrs=struct.unpack_from('<'+'I'*module['method_count'],memory,module['pointers_address'])
targets={'GameDataService','GameSettingsService','UserService','FtueDataService','NewsDataService','CrossPromoDataService','CustomizationDataService'}
methods=[];names={};selected=set();types=[]
for t in range(ts//88):
 off=tt+t*88;name=string(struct.unpack_from('<I',meta,off)[0])
 first=struct.unpack_from('<i',meta,off+36)[0];count=struct.unpack_from('<H',meta,off+64)[0]
 if not count:continue
 for mi in range(first,first+count):
  mo=mt+mi*36;ni,decl=struct.unpack_from('<Ii',meta,mo);token=struct.unpack_from('<I',meta,mo+24)[0]
  if decl!=t or not(0<(token&0xffffff)<=module['method_count']):continue
  # Verify image membership through the original metadata image range.
  image_start,image_bytes=struct.unpack_from('<II',meta,168)
  image_names=[string(struct.unpack_from('<I',meta,p)[0])for p in range(image_start,image_start+image_bytes,40)if struct.unpack_from('<i',meta,p+8)[0]<=t<sum(struct.unpack_from('<iI',meta,p+8))]
  if image_names!=['Assembly-CSharp.dll']:continue
  ptr=ptrs[(token&0xffffff)-1]
  if not ptr:continue
  assert ptr in table;fn=table[ptr];method=string(ni)
  if name not in targets:continue
  names.setdefault(fn,re.sub(r'\W','_',name+'_'+method)+'_'+str(fn))
  selected.add(fn);methods.append({'type_index':t,'class':name,'method_index':mi,'method':method,'token':token,'function_index':fn,'table_index':ptr})
 if name in targets:types.append({'type_index':t,'name':name,'method_count':count})
assert len(types)==7 and selected
code=next(s for s in sections if s['kind']==10);count,pos=leb(raw,code['start']);payload=bytearray(uleb(count));body_proof=[]
for i in range(count):
 size,pos=leb(raw,pos);body=raw[pos:pos+size];fn=imports+i;pos+=size
 chosen=body if fn in selected else b'\0\0\x0b';payload.extend(uleb(len(chosen)));payload.extend(chosen)
 if fn in selected:body_proof.append({'function_index':fn,'bytes':size,'body_sha256':hashlib.sha256(body).hexdigest()})
assert pos==code['end']and len(body_proof)==len(selected)
result=bytearray(raw[:8])
for s in sections:
 if s['kind']==10:result.append(10);result.extend(uleb(len(payload)));result.extend(payload)
 else:result.extend(raw[s['begin']:s['end']])
name_payload=uleb(len(names))+b''.join(uleb(i)+uleb(len(n.encode()))+n.encode()for i,n in sorted(names.items()))
custom=b'\x04name'+b'\x01'+uleb(len(name_payload))+name_payload;result.extend(b'\0'+uleb(len(custom))+custom)
slice_path=out/'services-analysis-only-NOT-RUNTIME.wasm';slice_path.write_bytes(result)
(out/'mapping-before-decompilation.json').write_text(json.dumps({'types':types,'mapped_methods':methods,'original_body_proofs':body_proof},indent=2),encoding='utf8')
print(json.dumps({'selected':len(selected),'slice_bytes':len(result),'largest_bodies':sorted(body_proof,key=lambda x:x['bytes'],reverse=True)[:3]}),flush=True)
target=out/'services-analysis-only-NOT-RUNTIME.dcmp'
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(slice_path),'-o',str(target)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=60)
assert res.returncode==0,res.stderr
text=target.read_text(encoding='utf8');headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));snippets=[]
for i,m in enumerate(headers):
 if int(m[2])not in selected:continue
 body=text[m.start():headers[i+1].start()if i+1<len(headers)else len(text)]
 snippets.append({'function_index':int(m[2]),'name':re.match(r'(\w+)\(',m[1])[1],'source_sha256':hashlib.sha256(body.encode()).hexdigest(),'source':body})
assert len(snippets)==len(selected)
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':hashlib.sha256(raw).hexdigest(),'metadata_sha256':hashlib.sha256(meta).hexdigest(),'types':types,'mapped_methods':methods,'original_body_proofs':body_proof,'original_source_snippets':snippets,'limitations':['Static declarations and original module pointers establish the mapping; semantic interpretation still requires reading each body','Every nonselected body in the separate analysis slice is unreachable; never execute this slice','No provider/data readiness or game state is assigned']}
(out/'service-original-source-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'types':types,'original_functions':len(selected),'source_bytes':sum(len(x['source'])for x in snippets)},ensure_ascii=False))
