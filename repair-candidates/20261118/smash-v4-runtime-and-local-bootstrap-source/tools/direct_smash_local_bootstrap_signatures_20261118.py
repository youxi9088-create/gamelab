"""Recover exact original data argument types before designing a local lifecycle port."""
from pathlib import Path
import json,hashlib,struct,contextlib,io,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'local-profile-constructors/original-local-bootstrap-signatures.json';assert not out.exists()
src=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');src=src[:src.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'static-local-contract-read.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'static-local-contract-read','exec'),ns)
memory=ns['memory'];meta=(r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes();st,ss=struct.unpack_from('<II',meta,24);tt,ts=struct.unpack_from('<II',meta,160);mt,ms=struct.unpack_from('<II',meta,48);pt,ps=struct.unpack_from('<II',meta,88)
registration=json.loads((a/'server-settings-native-field-offsets.json').read_bytes())['registration']['registration_address'];type_count,type_ptr=struct.unpack_from('<II',memory,registration+24)
def string(i):
    assert 0<=i<ss;return meta[st+i:meta.index(0,st+i,st+ss)].decode()
primitive={1:'void',2:'bool',3:'char',4:'sbyte',5:'byte',6:'short',7:'ushort',8:'int',9:'uint',10:'long',11:'ulong',12:'float',13:'double',14:'string',28:'object'}
def typeinfo(index):
    assert 0<=index<type_count;p=struct.unpack_from('<I',memory,type_ptr+4*index)[0];data,flags=struct.unpack_from('<II',memory,p);code=flags>>16&255;result=dict(type_index=index,type_code=code)
    if code in primitive:result['name']=primitive[code]
    elif code in[17,18]and data<ts//88:
        off=tt+88*data;result.update(name=string(struct.unpack_from('<I',meta,off)[0]),namespace=string(struct.unpack_from('<I',meta,off+4)[0]),type_definition_index=data)
    else:result['name']='unresolved-native-type-code-'+str(code)
    return result
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());rows=services['mapping']['mapped_methods']+json.loads((a/'local-profile-constructors/original-profile-method-map.json').read_bytes())['original_methods'];selected={26015,26016,12572,44718,44714,17870,43254,25900,43161,43206,43198};result=[]
for row in rows:
    if row['function_index']not in selected:continue
    off=mt+36*row['method_index'];ret=struct.unpack_from('<i',meta,off+8)[0];param_start=struct.unpack_from('<i',meta,off+16)[0];count=struct.unpack_from('<H',meta,off+34)[0];params=[]
    for n in range(param_start,param_start+count):
        p=pt+n*12;assert pt<=p<p+12<=pt+ps;name,token,index=struct.unpack_from('<III',meta,p);params.append(dict(name=string(name),type=typeinfo(index)))
    result.append(dict(function_index=row['function_index'],class_name=row.get('class',row.get('class_name')),method=row.get('method',row.get('method_name')),return_type=typeinfo(ret),parameters=params))
assert set(x['function_index']for x in result)==selected
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,original_modified=False,metadata_sha256=hashlib.sha256(meta).hexdigest(),methods=result,limitations=['Type signatures identify the native data contract only; no native methods were invoked, no values/UID/provider results synthesized.','Unresolved generic type codes are retained explicitly, not guessed.'])
out.write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode());print(json.dumps(proof,ensure_ascii=False))
