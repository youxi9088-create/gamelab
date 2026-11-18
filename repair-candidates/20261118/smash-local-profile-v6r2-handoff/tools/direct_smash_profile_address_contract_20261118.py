"""Verify all four metadata-use addresses used by the self-authored bridge."""
from pathlib import Path
import json,struct,datetime,hashlib
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-local-profile-address-contract.json';assert not out.exists()
src=(b/'direct_smash_local_bootstrap_contract_v2_20261118.py').read_text(encoding='utf8').split('original=json.loads')[0];ns={'__file__':str(b/'direct_smash_local_bootstrap_contract_v2_20261118.py')};exec(compile(src,'read-native-address-data-only','exec'),ns)
n=ns['ns'];m=n['memory'];rd=lambda p:struct.unpack_from('<I',m,p)[0];registration=n['registration'];meta=n['meta'];mt=n['mt'];tt=n['tt'];string=n['string'];rows=[]
def inst_types(index):
    assert 0<=index<rd(registration+8);p=rd(rd(registration+12)+index*4);count,args=struct.unpack_from('<II',m,p);return [ns['resolve'](rd(args+4*i))for i in range(count)]
for address,expected_method,expected_class,argument_kind,expected_type in [(5669964,'HasInstance','SMSingletonService`1','class','UserService'),(5669972,'get_Instance','SMSingletonService`1','class','UserService'),(5690436,'DeserializeObject','JsonConvert','method','UserData'),(5690440,'DeserializeObject','JsonConvert','method','UserDataReadOnly')]:
    encoded=rd(address);assert encoded>>29==6;index=(encoded&0x1fffffff)>>1;assert index<rd(registration+32)
    method,ci,gi=struct.unpack_from('<iii',m,rd(registration+36)+12*index);decl=struct.unpack_from('<i',meta,mt+method*36+4)[0];name=string(struct.unpack_from('<I',meta,mt+method*36)[0]);cls=string(struct.unpack_from('<I',meta,tt+decl*88)[0]);assert (name,cls)==(expected_method,expected_class),(address,name,cls)
    args=inst_types(ci if argument_kind=='class'else gi);assert len(args)==1 and args[0]['name']==expected_type
    rows.append({'address':address,'method_spec_index':index,'method_index':method,'class':cls,'method':name,'generic_arguments':args,'argument_kind':argument_kind})
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'metadata_sha256':hashlib.sha256(meta).hexdigest(),'verified_addresses':rows};out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps(result,ensure_ascii=False))
