"""Static single-consumer replacement, with every other existing body preserved."""
import hashlib
from smash_profile_native_linker_20261118 import link,sections,bodies,imports,u
def assemble(original,helper):
    sha=lambda v:hashlib.sha256(v).hexdigest()
    linked,proof=link(original,helper,{'streaming_assets_path':6872,'string_ctor':67864,'concat2':635})
    assert len(proof['appended_function_indices'])==1
    old=bodies(original,sections(original));new=bodies(linked,sections(linked))
    imported=len(imports(original,sections(original)));slot=31571-imported
    assert sha(old[slot])=='2cc25e4158aa3499b09fa8a450f7911630e5405ecefa1cf5cd597da1ec12ca37'
    # Zero locals, call our portable URL function, end. The unused original MethodInfo remains ABI-compatible.
    new[slot]=b'\0\x10'+u(proof['appended_function_indices'][0])+b'\x0b'
    code=u(len(new))+b''.join(u(len(x))+x for x in new)
    result=bytearray(linked[:8])
    for kind,begin,p,end in sections(linked):
        result.extend(bytes([kind])+u(len(code))+code if kind==10 else linked[begin:end])
    result=bytes(result);actual=bodies(result,sections(result))
    changed=[imported+i for i,(a,c)in enumerate(zip(old,actual))if a!=c]
    assert changed==[31571] and len(actual)==len(old)+1
    assert all(result[c[2]:c[3]]==original[a[2]:a[3]] for a,c in zip(sections(original),sections(result)) if a[0]not in[3,7,10])
    proof.update(single_original_consumer_changed=31571,consumer_before_sha256=sha(old[slot]),consumer_after_sha256=sha(actual[slot]),
                 previous_function_bodies_preserved=len(old)-1,previous_function_bodies_total=len(old),
                 candidate_wasm_sha256=sha(result),original_metadata_data_sections_unchanged=True,
                 original_download_parse_completion_unchanged=True,game_executed=False)
    return result,proof
