"""Retire two outbound calls in the original local-save consumer, retaining its local work/event."""
import hashlib
from smash_profile_native_linker_20261118 import sections,bodies,imports,u

def retire_calls(body,targets):
    changes=[]
    for fn,argc in targets:
        call=b'\x10'+u(fn);assert body.count(call)==1,(fn,body.count(call))
        before=body;body=body.replace(call,b'\x1a'*argc)
        changes.append({'original_target':fn,'arguments_consumed':argc,'original_call_hex':call.hex(),'replacement_hex':('1a'*argc),'before_body_sha256':hashlib.sha256(before).hexdigest(),'after_body_sha256':hashlib.sha256(body).hexdigest()})
    return body,changes

def patch(original,caller,targets,expected_body_sha=None):
    secs=sections(original);old=bodies(original,secs);offset=len(imports(original,secs));slot=caller-offset
    assert 0<=slot<len(old)
    if expected_body_sha:assert hashlib.sha256(old[slot]).hexdigest()==expected_body_sha
    new=list(old);new[slot],changes=retire_calls(old[slot],targets)
    code=u(len(new))+b''.join(u(len(v))+v for v in new);result=bytearray(original[:8])
    for kind,start,p,end in secs:result.extend(bytes([kind])+u(len(code))+code if kind==10 else original[start:end])
    result=bytes(result);actual=bodies(result,sections(result));changed=[offset+i for i,(x,y)in enumerate(zip(old,actual))if x!=y]
    assert changed==[caller]and len(actual)==len(old)
    assert all(result[y[2]:y[3]]==original[x[2]:x[3]]for x,y in zip(secs,sections(result))if x[0]!=10)
    return result,{'game_executed':False,'changed_previous_functions':changed,'previous_function_bodies_preserved':len(old)-1,'previous_function_bodies_total':len(old),'retired_calls':changes,'no_functions_imports_exports_types_globals_tables_or_data_added_or_changed':True,'candidate_wasm_sha256':hashlib.sha256(result).hexdigest(),'original_consumer_sha256':hashlib.sha256(old[slot]).hexdigest(),'local_body_preserved_except_two_call_instructions':True,'remote_success_callbacks_invoked':False}

def assemble(original,contract):
    assert contract['source_only']and not contract['game_executed']
    for fn in[1679,6414]:assert contract['native_signatures'][str(fn)]=={'params':[127,127,127,127,127,127,125,127],'returns':[]}
    expected=next(x['sha256']for x in contract['profile_source']['original_body_hashes']if x['function_index']==1756)
    result,proof=patch(original,1756,[(1679,8),(6414,8)],expected)
    return result,proof
