"""Resolve native generic data contracts and preserve exact cold-start transaction evidence."""
from pathlib import Path
import json,hashlib,struct,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
src=(b/'direct_smash_local_bootstrap_signatures_20261118.py').read_text(encoding='utf8').split('services=json.loads')[0].replace(';assert not out.exists()','')
ns={'__file__':str(b/'direct_smash_local_bootstrap_signatures_20261118.py')};exec(compile(src,'read-original-native-data-tables-only','exec'),ns)
m=ns['memory'];rd=lambda p:struct.unpack_from('<I',m,p)[0]
def resolve(p,depth=0):
    assert depth<4;data,flags=struct.unpack_from('<II',m,p);code=flags>>16&255
    if code in ns['primitive']:return {'name':ns['primitive'][code],'type_code':code}
    if code in (17,18):
        assert data<ns['ts']//88;off=ns['tt']+88*data
        return {'name':ns['string'](struct.unpack_from('<I',ns['meta'],off)[0]),'namespace':ns['string'](struct.unpack_from('<I',ns['meta'],off+4)[0]),'type_code':code,'type_definition_index':data}
    if code==21:
        definition,inst=struct.unpack_from('<II',m,data);n,args=struct.unpack_from('<II',m,inst);assert 0<n<=8
        base=resolve(definition,depth+1);values=[resolve(rd(args+4*i),depth+1)for i in range(n)]
        return {'name':base['name'].split('`')[0]+'<'+','.join(v['name']for v in values)+'>','namespace':base.get('namespace'),'type_code':code,'definition':base,'arguments':values,'generic_class_address':data,'generic_instantiation_address':inst}
    return {'name':'unresolved-native-type-code-'+str(code),'type_code':code}
original=json.loads((a/'local-profile-constructors/original-local-bootstrap-signatures.json').read_bytes())
for row in original['methods']:
    for info in [row['return_type']]+[p['type']for p in row['parameters']]:
        i=info['type_index'];info['resolved']=resolve(rd(ns['type_ptr']+4*i))
gbx=next(x for x in original['methods']if x['function_index']==26015)
assert [p['type']['resolved']['name']for p in gbx['parameters']]==['Dictionary<string,object>']*2
complex_source=json.loads((a/'complex-bootstrap-c-source/original-complex-c-source.json').read_bytes())
source=next(x for x in complex_source['original_c_source_snippets']if x['function_index']==26015)['source'];lines=source.splitlines()
assert 'var_i0 = var_p1;\n  var_i1 = var_p2;\n  var_i0 |= var_i1;\n  var_i0 = !(var_i0);\n  if (var_i0) {goto var_B3;}'in source
assert 'w2c_smash__static__analysis_f43254(instance, var_i0, var_i1);'in source
assert 'i32_store8_default32(&instance->w2c_gk, (u64)(var_i0) + 21, var_i1);'in source
source_services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes())
selected={43424,17870,12572,44718,44714,100771,100769}
evidence=[x for x in source_services['original_source_snippets']if x['function_index']in selected];assert len(evidence)==len(selected)
original.update(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),revision=2,prior_signature_artifact_sha256=hashlib.sha256((a/'local-profile-constructors/original-local-bootstrap-signatures.json').read_bytes()).hexdigest(),exact_generic_settings_contract_verified=True,original_complex_c_artifact_sha256=hashlib.sha256((a/'complex-bootstrap-c-source/original-complex-c-source.json').read_bytes()).hexdigest(),original_complex_body_source_sizes=[{'function_index':x['function_index'],'source_bytes':x['source_bytes'],'source_sha256':x['source_sha256']}for x in complex_source['original_c_source_snippets']],source_evidence=evidence,settings_transaction_evidence=[{'source_lines':[301,312],'fact':'The original method allocates an empty dictionary; if both override dictionaries are null it branches to the normal application block, rather than returning ready.'},{'source_lines':[504,523],'fact':'Normal application allocates original GameSettingsData, calls constructor43254, assigns owner field16 and enumerates the selected dictionary.'},{'source_lines':[12901,12903],'fact':'Owner readiness byte21 is set deep in the real field-application transaction; remaining fields and original event2227 are still applied afterwards.'}],local_profile_evidence={'native_default_initialization':17870,'user_data_constructor':25900,'user_data_default_initializer':43206,'read_only_constructor':43161,'read_only_default_initializer':43198,'initialization_sets_ready':False,'remote_bound_finalizer':12572,'unresolved':'Original finalization checks remote identity/readbacks and includes uploads; native constructors alone are not an offline persisted player lifecycle.'},limitations=['Static metadata/C translation only; no game functions compiled or invoked.','Original C and Wasm analysis slices have unreachable placeholders for unselected functions and must never be runtime inputs.','Native constructor defaults are original shipped values, not verified remote live configuration.','This evidence permits designing a real local configuration consumer; it does not implement it or justify setting readiness flags directly.','Local profile persistence, offline room creation, player spawn and AI remain unimplemented and unverified.'])
p=a/'local-profile-constructors/original-local-bootstrap-contract-v2.json';assert not p.exists();p.write_bytes(json.dumps(original,ensure_ascii=False,indent=2).encode())
print(json.dumps({'source_only':True,'game_executed':False,'settings_arguments':[p['type']['resolved']['name']for p in gbx['parameters']],'methods_verified':len(original['methods']),'source_evidence_functions':len(evidence),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}))
