"""Retire exact optional consumers; keep every genuine core-data prerequisite."""
import hashlib
from smash_profile_native_linker_20261118 import link,bodies,sections,imports,u,exports
def assemble(original,helper,contract):
    sha=lambda x:hashlib.sha256(x).hexdigest()
    native,proof=link(original,helper,{'metadata_init':599,'has_instance':1591,'get_instance':644,'game_data_ready':10177,'component_game_object':637,'set_active':630})
    old=bodies(original,sections(original));new=bodies(native,sections(native));imported=len(imports(original,sections(original)))
    expected={x['function_index']:x['sha256']for x in contract['original_changed_body_proofs']}
    assert set(expected)=={6443,10272,104933,107124,105877,105867}
    for fn,h in expected.items():assert sha(old[fn-imported])==h,fn
    exp={x['name']:x['function_index']for x in proof['exports']}
    for fn,name in [(10272,'gamelab_need_core_game_data'),(6443,'gamelab_core_game_data_complete')]:
        new[fn-imported]=b'\0\x10'+u(exp[name])+b'\x0b'
    for fn in [107124,105877,105867]:
        new[fn-imported]=b'\0\x20\0\x20\1\x10'+u(exp['gamelab_retire_optional_component'])+b'\x0b'
    loader=new[104933-imported];retired=[]
    for fn in [43380,43675]:
        needle=b'\x10'+u(fn);assert loader.count(needle)==1
        loader=loader.replace(needle,b'\x1a\x1a') # Consume the two already-evaluated call arguments; no provider function is stubbed.
        retired.append({'caller':104933,'original_target':fn,'call_instruction_hex':needle.hex(),'replacement_hex':'1a1a'})
    new[104933-imported]=loader
    code=u(len(new))+b''.join(u(len(x))+x for x in new);result=bytearray(native[:8])
    for kind,begin,p,end in sections(native):result.extend(bytes([kind])+u(len(code))+code if kind==10 else native[begin:end])
    result=bytes(result);actual=bodies(result,sections(result));changed=[imported+i for i,(x,y)in enumerate(zip(old,actual))if x!=y]
    assert set(changed)==set(expected)and len(actual)==len(old)+4
    assert all(result[y[2]:y[3]]==original[x[2]:x[3]]for x,y in zip(sections(original),sections(result))if x[0]not in[3,7,10])
    assert all(x in exports(result,sections(result))for x in exports(original,sections(original)))
    proof.update(changed_previous_functions=changed,previous_function_bodies_preserved=len(old)-6,previous_function_bodies_total=len(old),
        original_changed_body_hashes={str(k):v for k,v in expected.items()},retired_request_calls=retired,candidate_wasm_sha256=sha(result),
        original_type_import_table_global_data_unchanged=True,optional_services_marked_ready=False,core_game_data_getter_unchanged=True,game_executed=False)
    return result,proof
