"""Record original ABI and pointer element types; no original functions are invoked."""
from pathlib import Path
import json,struct,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-local-storage-contract-v2.json';assert not out.exists()
src=(b/'direct_smash_local_bootstrap_contract_v2_20261118.py').read_text(encoding='utf8').split('original=json.loads')[0]
ns={'__file__':str(b/'direct_smash_local_bootstrap_contract_v2_20261118.py')};exec(compile(src,'read-data-only-for-native-abi','exec'),ns)
n=ns['ns'];parser=n['ns'];raw=parser['raw'];sections=parser['sections'];leb=parser['leb'];m=n['memory'];rd=lambda p:struct.unpack_from('<I',m,p)[0]
def resolve(p,depth=0):
    assert depth<4;data,flags=struct.unpack_from('<II',m,p);code=flags>>16&255
    if code in[15,29]:
        element=resolve(data,depth+1);return {'name':element['name']+('*'if code==15 else'[]'),'type_code':code,'element':element}
    return ns['resolve'](p)
def idx(i):return resolve(rd(n['type_ptr']+4*i))
s=next(x for x in sections if x['kind']==1);count,p=leb(raw,s['start']);types=[]
for _ in range(count):
    assert raw[p]==0x60;argc,p=leb(raw,p+1);args=list(raw[p:p+argc]);p+=argc;retc,p=leb(raw,p);ret=list(raw[p:p+retc]);p+=retc;types.append({'parameters':args,'results':ret})
assert p==s['end'];s=next(x for x in sections if x['kind']==3);count,p=leb(raw,s['start']);fn_types=[x['type']for x in parser['import_rows']]
for _ in range(count):i,p=leb(raw,p);fn_types.append(i)
assert p==s['end'];d=json.loads((a/'native-local-storage-bindings.json').read_bytes())
for row in d['methods']:
    for v in row['parameters']:v['resolved_type']=idx(v['type_index'])
    fn=row['function_index'];row['native_abi']=types[fn_types[fn]]if fn is not None else None
    if row['class']=='PlayerPrefs':
        sig=row['native_abi'];assert sig['parameters']==[127]*(len(row['parameters'])+1);assert sig['results']==([]if row['return_type']['name']=='void'else[127])
chars=next(x for x in d['methods']if x['class']=='String'and x['method']=='Ctor'and x['function_index']==67864)
assert chars['parameters'][0]['resolved_type']['name']=='char*'and chars['native_abi']=={'parameters':[127]*4,'results':[127]}
newguid=next(x for x in d['methods']if x['class']=='Guid'and x['method']=='NewGuid');assert newguid['native_abi']['parameters']==[127,127]and not newguid['native_abi']['results']
d.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),revision=2,prior_binding_sha256=hashlib.sha256((a/'native-local-storage-bindings.json').read_bytes()).hexdigest(),original_functions_invoked=0,storage_adapter_implemented=False,source_findings=['UserService field104/par is FriendRequests, and Init call17525 is FriendRequests.bpj, not a local profile reader/writer.','PlayerPrefs GetString3224/SetString2875/HasKey1698/Save6197 have ordinary verified native ABIs. Their browser persistence behavior still needs actual remote verification.','JsonConvert.SerializeObject1526 is the actual original profile serializer. Generic DeserializeObject declarations are unmapped; actual shared body2114 and each original MethodInfo must be retained for typed restoration.','String.Ctor67864 accepts char* plus start,length,MethodInfo and returns a managed string; no unsafe borrowed pointer ownership assumption is required.','Guid.NewGuid1794 returns its struct via an output pointer; treating it as an i32 return would be an ABI error. Guid.ToString1998 consumes that struct by reference.','Any local identity must remain distinct from original Firebase authentication. Original load/save failures must remain visible; no reset-to-default fallback or readiness assignment without completed initialization/persistence.'])
out.write_bytes(json.dumps(d,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'methods':len(d['methods']),'string_ctor':chars['native_abi'],'new_guid':newguid['native_abi'],'output_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'bytes':out.stat().st_size}))
