from pathlib import Path
import json,struct,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'analysis-20261117'
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8').replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');source=source[:source.index('types=json.loads')]
ns={'__file__':str(b/'static-string-index.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'smash-data-read','exec'),ns)
memory=ns['memory'];table=ns['table'];raw=(folder/'metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
s,ss=struct.unpack_from('<II',raw,24);types,ts=struct.unpack_from('<II',raw,160);methods,ms=struct.unpack_from('<II',raw,48);fields,fs=struct.unpack_from('<II',raw,96)
def string(i):assert 0<=i<ss;return raw[s+i:raw.index(0,s+i,s+ss)].decode('utf8')
def type_name(i):return string(struct.unpack_from('<I',raw,types+i*88)[0])
index=1085;p=types+index*88;assert type_name(index)=='a';field_start,method_start=struct.unpack_from('<ii',raw,p+32);mc,pc,fc=struct.unpack_from('<HHH',raw,p+64)
module=json.loads((folder/'native-gameplay-wasm-map.json').read_text(encoding='utf8'))['modules']['Assembly-CSharp.dll'];pointers=module['pointers_address'];rows=[]
for j in range(method_start,method_start+mc):
 ni,decl,ret,rpt,ps,gc,tok,flags,iflags,slot,params=struct.unpack_from('<IiiiiiIHHHH',raw,methods+j*36);assert decl==index
 ptr=struct.unpack_from('<I',memory,pointers+((tok&0xffffff)-1)*4)[0];fn=table.get(ptr)
 if fn in [11556,35469] or string(ni)=='.cctor':rows.append({'type_index':index,'class':'a','image':'Assembly-CSharp.dll','name':string(ni),'method_index':j,'token':tok,'parameter_count':params,'flags':flags,'slot':slot,'return_type_index':ret,'table_index':ptr,'function_index':fn})
field_rows=[]
for j in range(max(field_start,field_start+fc-6),field_start+fc):
 ni,typ,tok=struct.unpack_from('<IiI',raw,fields+j*12);field_rows.append({'name':string(ni),'type_index':typ,'token':tok,'field_index':j})
out={'source_only':True,'class_index':index,'class_method_count':mc,'class_field_count':fc,'selected_methods':rows,'last_fields':field_rows,'runtime_executed':False}
(folder/'native-string-getter-index.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
