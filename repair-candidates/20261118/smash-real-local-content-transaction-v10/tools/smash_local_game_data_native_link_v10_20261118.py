"""Port the GameData request consumer to a real queued local transaction, without replacing providers."""
import hashlib
from smash_profile_native_linker_20261118 import link,bodies,sections,imports,u,exports
def assemble(original,helper):
    sha=lambda v:hashlib.sha256(v).hexdigest()
    linked,proof=link(original,helper,{'metadata_init':599,'class_metadata_init':601,'has_instance':1591,'get_instance':644,'serialize':1526,'deserialize':2114,'string_ctor':67864,'string_equal':633,'game_data_ready':10177,'apply_original_game_data':17602})
    assert len(proof['appended_function_indices'])==11 and len(proof['exports'])==8
    old=bodies(original,sections(original));new=bodies(linked,sections(linked));offset=len(imports(original,sections(original)));slot=8457-offset
    assert len(old[slot])==583 and sha(old[slot])=='e81b24d10f3cfeba054f19c8947070eb7fdcdfbbf24ce101ac521b1b5349a619'
    begin=next(x['function_index']for x in proof['exports']if x['name']=='gamelab_game_data_begin')
    new[slot]=b'\0\x20\0\x20\1\x20\2\x10'+u(begin)+b'\x0b'
    code=u(len(new))+b''.join(u(len(v))+v for v in new);result=bytearray(linked[:8])
    for kind,start,p,end in sections(linked):result.extend(bytes([kind])+u(len(code))+code if kind==10 else linked[start:end])
    result=bytes(result);actual=bodies(result,sections(result));changed=[offset+i for i,(x,y)in enumerate(zip(old,actual))if x!=y]
    assert changed==[8457]and len(actual)==len(old)+11
    assert all(result[y[2]:y[3]]==original[x[2]:x[3]]for x,y in zip(sections(original),sections(result))if x[0]not in[3,7,10])
    assert all(x in exports(result,sections(result))for x in exports(original,sections(original)))
    proof.update(changed_previous_functions=changed,previous_function_bodies_preserved=len(old)-1,previous_function_bodies_total=len(old),original_request_body_sha256=sha(old[slot]),candidate_wasm_sha256=sha(result),native_type_import_table_global_data_unchanged=True,original_typed_application_and_ready_getter_unchanged=True,provider_functions_replaced=False,game_executed=False)
    return result,proof
