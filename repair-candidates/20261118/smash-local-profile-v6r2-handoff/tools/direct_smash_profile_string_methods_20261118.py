"""Bind original string operations needed for one atomic native profile snapshot."""
from pathlib import Path
import json,struct,datetime,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-local-profile-string-contract.json';assert not out.exists()
src=(b/'direct_smash_native_local_storage_abi_20261118.py').read_text(encoding='utf8').split("d=json.loads")[0].replace(';assert not out.exists()','')
ns={'__file__':str(b/'direct_smash_native_local_storage_abi_20261118.py')};exec(compile(src,'read-native-string-metadata-only','exec'),ns)
n=ns['n'];meta=n['meta'];memory=n['memory'];table=n['ns']['table'];tt=n['tt'];ts=n['ts'];mt=n['mt'];pt,ps=struct.unpack_from('<II',meta,88);string=n['string']
old=json.loads((a/'native-local-storage-contract-v2.json').read_bytes());string_type=next(x for x in old['methods']if x['class']=='String');ti=string_type['type_index'];off=tt+88*ti;start=struct.unpack_from('<i',meta,off+36)[0];count=struct.unpack_from('<H',meta,off+64)[0];module=old['modules'][string_type['image']];ptrs=struct.unpack_from('<'+'I'*module['count'],memory,module['pointer']);rows=[]
for mi in range(start,start+count):
    p=mt+36*mi;name=string(struct.unpack_from('<I',meta,p)[0]);flags=struct.unpack_from('<H',meta,p+28)[0]
    if name not in ['Concat','Substring','IndexOf','StartsWith','op_Equality','get_Length']:continue
    first=struct.unpack_from('<i',meta,p+16)[0];cnt=struct.unpack_from('<H',meta,p+34)[0];params=[]
    for j in range(first,first+cnt):
        q=pt+j*12;ni,token,index=struct.unpack_from('<III',meta,q);params.append({'name':string(ni),'type_index':index,'type':ns['idx'](index)})
    token=struct.unpack_from('<I',meta,p+24)[0];pointer=ptrs[(token&0xffffff)-1];fn=table.get(pointer);rows.append({'class':'String','method':name,'method_index':mi,'token':token,'static':bool(flags&16),'parameters':params,'return_type':ns['idx'](struct.unpack_from('<i',meta,p+8)[0]),'table_index':pointer,'function_index':fn,'native_abi':ns['types'][ns['fn_types'][fn]]if fn is not None else None})
required={'concat2':('Concat',['string','string']),'concat3':('Concat',['string']*3),'substring1':('Substring',['int']),'substring2':('Substring',['int','int']),'index_char':('IndexOf',['char']),'index_char_start':('IndexOf',['char','int']),'starts_ordinal':('StartsWith',['string','StringComparison']),'equals':('op_Equality',['string','string'])}
selected={}
for key,(method,types)in required.items():
    found=[x for x in rows if x['method']==method and [p['type']['name']for p in x['parameters']]==types];assert len(found)==1,(key,len(found));row=found[0];assert row['function_index']is not None;selected[key]=row
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':old['original_wasm_sha256'],'metadata_sha256':old['metadata_sha256'],'methods':selected,'limitations':['Bindings only, not a completed profile adapter.','Ordinal StringComparison value4 must be checked against actual metadata enum before use.','Native original JSON and persistence functions have not been executed locally.']}
out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps({k:{'function_index':v['function_index'],'abi':v['native_abi']}for k,v in selected.items()}))
