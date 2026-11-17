"""Resolve original generic service references and native readiness fields, data only."""
from pathlib import Path
import json,struct,re,contextlib,io,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';d=r/'analysis-20261118';a=r/'analysis-20261117'
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source=source[:source.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns={'__file__':str(b/'read-native-data-only.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'read-native-data-only','exec'),ns)
memory=ns['memory'];wasm=ns['raw'];u32=lambda p:struct.unpack_from('<I',memory,p)[0]
registration=json.loads((d/'server-settings-native-field-offsets.json').read_text(encoding='utf8'))['registration']
reg=registration['registration_address'];assert u32(reg+32)==86316
raw=(a/'metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
assert hashlib.sha256(raw).hexdigest()=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
st,ss=struct.unpack_from('<II',raw,24);tt,ts=struct.unpack_from('<II',raw,160);mt,ms=struct.unpack_from('<II',raw,48);ft,fs=struct.unpack_from('<II',raw,96)
def string(i):
 assert 0<=i<ss
 return raw[st+i:raw.index(0,st+i,st+ss)].decode('utf8')
def typename(i):
 assert 0<=i<ts//88
 return string(struct.unpack_from('<I',raw,tt+i*88)[0])
def fields(i):
 off=tt+i*88;first=struct.unpack_from('<i',raw,off+32)[0];count=struct.unpack_from('<H',raw,off+68)[0];ptr=u32(registration['field_offsets_table_address']+4*i);out=[]
 for n in range(count):
  ni,ti,token=struct.unpack_from('<IiI',raw,ft+12*(first+n));tp=u32(u32(reg+28)+ti*4)
  out.append({'name':string(ni),'field_index':first+n,'native_offset':struct.unpack_from('<i',memory,ptr+4*n)[0],'native_type_code':(u32(tp+4)>>16)&255,'attributes':u32(tp+4)&0xffff,'token':token})
 return out
text=(a/'gameplay-code-named-NOT-RUNTIME.dcmp').read_text(encoding='utf8')
m=re.search(r'^data (d_3_3_3_30_3_3P\S+)\(offset: (\d+)\)',text,re.M);assert m
symbol,base=m[1],int(m[2]);headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M))
selected={6443,10272,104932,104933,12611,44838,17950,105506};snippets=[]
for n,h in enumerate(headers):
 if int(h[2])not in selected:continue
 body=text[h.start():headers[n+1].start()if n+1<len(headers)else len(text)]
 snippets.append({'function_index':int(h[2]),'name':re.match(r'(\w+)\(',h[1])[1],'sha256':hashlib.sha256(body.encode()).hexdigest(),'source':body})
gate=next(x for x in snippets if x['function_index']==6443)['source'];indices=[26789,26809,26781,26797,26771,26785,26774];references=[]
for index in indices:
 value=u32(base+index*4);assert value>>29==6
 spec_index=(value&0x1fffffff)>>1;assert spec_index<u32(reg+32)
 method,ci,gi=struct.unpack_from('<iii',memory,u32(reg+36)+12*spec_index)
 assert gi==-1 and 0<=ci<u32(reg+8)
 ni,decl=struct.unpack_from('<Ii',raw,mt+36*method)
 assert typename(decl)=='SMSingletonService'+chr(96)+'1'and string(ni)=='get_Instance'
 ip=u32(u32(reg+12)+ci*4);assert u32(ip)==1
 tp=u32(u32(ip+4));assert (u32(tp+4)>>16)&255==18
 typ=u32(tp)
 row={'data_index':index,'encoded_reference':value,'method_spec_index':spec_index,'method_definition_index':method,'generic_type_index':typ,'generic_type_name':typename(typ),'declared_fields':fields(typ)}
 reads=re.findall(re.escape(symbol)+r'\['+str(index)+r'\]:int\)\[(\d+)\]:ubyte',gate)
 row['readiness_byte_offsets_in_eun']=[int(x)for x in reads]
 row['matched_readiness_fields']=[f for f in row['declared_fields']if f['native_offset']in row['readiness_byte_offsets_in_eun']]
 references.append(row)
assert [x['generic_type_name']for x in references]==['GameSettingsService','UserService','FtueDataService','NewsDataService','CrossPromoDataService','GameDataService','CustomizationDataService']
for row in references[:5]:
 assert len(row['matched_readiness_fields'])==1
 assert row['matched_readiness_fields'][0]['native_type_code']==2
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':hashlib.sha256(wasm).hexdigest(),'metadata_sha256':hashlib.sha256(raw).hexdigest(),'analysis_slice_sha256':hashlib.sha256(text.encode()).hexdigest(),'generic_references':references,'original_source_snippets':snippets,'limitations':['Only existing original-body subset inspected, not an exhaustive indirect-call graph','Readiness flags are read, never assigned or substituted','No provider identity or remote-data readiness is fabricated','Native data tables and local-room/player/AI bootstrap remain unimplemented; StartInOfflineMode alone is insufficient','No candidate runtime was created or executed; all five player actions remain']}
p=d/'local-bootstrap-service-gates.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'services':[{'name':x['generic_type_name'],'gate_fields':[{'name':f['name'],'offset':f['native_offset']}for f in x['matched_readiness_fields']]}for x in references],'original_functions':len(snippets)},ensure_ascii=False))
