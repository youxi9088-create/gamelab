"""Retire native authentication consumers; never stub authentication providers."""
import hashlib
from smash_profile_native_linker_20261118 import sections,bodies,imports,u
from smash_profile_write_consumer_v12_20261118 import retire_calls

def transform(awake,pause,focus,base_target,resume_target):
    base=b'\x10'+u(base_target);assert awake.count(base)==1
    split=awake.index(base)+len(base);new_awake=awake[:split]+b'\x0b'
    new_pause,pause_proof=retire_calls(pause,[(resume_target,2)])
    new_focus,focus_proof=retire_calls(focus,[(resume_target,2)])
    return [new_awake,new_pause,new_focus],{'base_call_preserved_prefix_bytes':split,'awake_retired_suffix_bytes':len(awake)-split-1,'resume_calls_retired':pause_proof+focus_proof}

def patch(original,functions,base_target,resume_target,expected=None):
    secs=sections(original);old=bodies(original,secs);offset=len(imports(original,secs));slots=[f-offset for f in functions];assert len(set(slots))==3
    if expected:
        for fn,slot in zip(functions,slots):assert hashlib.sha256(old[slot]).hexdigest()==expected[fn]
    changed,scope=transform(*(old[s]for s in slots),base_target,resume_target);new=list(old)
    for slot,body in zip(slots,changed):new[slot]=body
    code=u(len(new))+b''.join(u(len(v))+v for v in new);result=bytearray(original[:8])
    for kind,start,p,end in secs:result.extend(bytes([kind])+u(len(code))+code if kind==10 else original[start:end])
    result=bytes(result);actual=bodies(result,sections(result));changed_functions=[offset+i for i,(x,y)in enumerate(zip(old,actual))if x!=y]
    assert changed_functions==sorted(functions)and len(actual)==len(old)
    assert all(result[y[2]:y[3]]==original[x[2]:x[3]]for x,y in zip(secs,sections(result))if x[0]!=10)
    return result,{'game_executed':False,'changed_previous_functions':changed_functions,'previous_function_bodies_preserved':len(old)-3,'previous_function_bodies_total':len(old),'scope':scope,'no_functions_imports_exports_types_globals_tables_or_data_added_or_changed':True,'candidate_wasm_sha256':hashlib.sha256(result).hexdigest(),'original_consumer_sha256':{str(f):hashlib.sha256(old[s]).hexdigest()for f,s in zip(functions,slots)},'provider_functions_replaced':False,'authenticated_success_callbacks_invoked':False}

def assemble(original,contract):
    assert contract['source_only']and not contract['game_executed']
    assert contract['original_base_binding']['shared_function']==4707 and contract['original_base_binding']['metadata_use']==5670104
    expected={x['function_index']:x['sha256']for x in contract['original_body_proofs']};assert set(expected)=={101109,101102,101103}
    return patch(original,[101109,101103,101102],4707,26068,expected)
