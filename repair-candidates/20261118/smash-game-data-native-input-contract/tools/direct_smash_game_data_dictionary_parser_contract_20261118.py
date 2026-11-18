"""Find the original typed local JSON parser binding; never construct a backend response."""
from pathlib import Path
import json,struct,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'game-data-original-dictionary-parser-contract.json';assert not out.exists()
src=(b/'direct_smash_profile_address_contract_20261118.py').read_text(encoding='utf8').split('for address,expected_method')[0].replace(';assert not out.exists()','')
ns={'__file__':str(b/'direct_smash_profile_address_contract_20261118.py')};exec(compile(src,'read-original-generic-parser-tables-only','exec'),ns)
meta=ns['meta'];memory=ns['m'];rd=ns['rd'];reg=ns['registration'];mt=ns['mt'];tt=ns['tt'];string=ns['string'];count=rd(reg+32);ptr=rd(reg+36);selected=[]
for i in range(count):
    mi,ci,gi=struct.unpack_from('<iii',memory,ptr+12*i)
    if gi<0:continue
    m=mt+mi*36;name=string(struct.unpack_from('<I',meta,m)[0]);decl=struct.unpack_from('<i',meta,m+4)[0]
    if name!='DeserializeObject'or string(struct.unpack_from('<I',meta,tt+decl*88)[0])!='JsonConvert'or struct.unpack_from('<H',meta,m+34)[0]!=1:continue
    args=ns['inst_types'](gi)
    if len(args)==1 and args[0]['name']=='Dictionary<string,object>':selected.append({'method_spec_index':i,'method_index':mi,'class_arguments':ci,'method_arguments':gi,'generic_types':args})
assert len(selected)==1,selected
index=selected[0]['method_spec_index'];known=rd(5690436);assert known>>29==6
encoded=(6<<29)|(index<<1)|(known&1);needle=struct.pack('<I',encoded);pos=0;addresses=[]
while True:
    pos=memory.find(needle,pos)
    if pos<0:break
    if pos%4==0:addresses.append(pos)
    pos+=1
assert addresses
from smash_profile_native_linker_20261118 import bodies,sections,u
raw=ns['n']['ns']['raw'];bs=bodies(raw,sections(raw));imported=ns['n']['ns']['function_imports'];bindings=[]
for address in addresses:
    pattern=b'\x41'+u(address)+b'\x10'+u(599)
    users=[imported+i for i,body in enumerate(bs)if pattern in body]
    if users:bindings.append({'metadata_use_address':address,'metadata_initializer_callers':users})
assert len(bindings)==1,bindings
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());consumer=next(x for x in services['mapping']['mapped_methods']if x['function_index']==17602)
outcome={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':hashlib.sha256(raw).hexdigest(),'metadata_sha256':hashlib.sha256(meta).hexdigest(),'typed_parser':selected[0],'verified_metadata_use':bindings[0],'native_shared_deserializer':2114,'original_data_consumer':consumer,'limitations':['Only the original parser type and metadata binding are established; no original functions were executed.','No dataset was generated, native state assigned, backend response fabricated or completion emitted.','A future local-content adapter must use genuine original presets and real local state, validate and persist them before the normal typed application transaction.','This does not establish the safety of all original data-application side effects.']}
out.write_bytes(json.dumps(outcome,ensure_ascii=False,indent=2).encode());print(json.dumps(outcome,ensure_ascii=False))
