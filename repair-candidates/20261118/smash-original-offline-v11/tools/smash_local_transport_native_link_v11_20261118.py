"""Change only exact, source-bound connection consumers; no Photon providers replaced."""
import hashlib
from smash_profile_native_linker_20261118 import link,bodies,sections,imports,u,exports,leb

def assemble(original,helper):
    sha=lambda v:hashlib.sha256(v).hexdigest()
    context=next(i for n,k,i in exports(original,sections(original))if n=='gamelab_game_data_context'and k==0)
    linked,proof=link(original,helper,{'context':context,'core_ready':6443,'data_ready':10177,'offline':96313,'client_state':4258,'settings':4026,'player':846,'player_id':986,'set_player_id':1351,'equal':633,'connect_local':41676})
    old=bodies(original,sections(original));new=bodies(linked,sections(linked));offset=len(imports(original,sections(original)))
    assert len(proof['appended_function_indices'])==2 and len(proof['exports'])==2
    update=105269-offset;awake=105271-offset
    assert sha(old[update])=='ff02507261617d28688e5020998f894944e0d098416b3eddd235eec52bbd3afd'
    assert sha(old[awake])=='bc458f33617c9033d9f03627cdb3f0236730aa9968f629c8958072897600ac39'
    state=next(x['function_index']for x in proof['exports']if x['name']=='gamelab_local_transport_client_state')
    # Five raw LoadBalancingClient.State reads verified in original-update-instructions.wat.
    # Keep preceding real instance evaluation, consume that pointer in the own wrapper,
    # and call PhotonNetwork's original offline-aware NetworkClientState getter4258.
    raw_state=b'\x28\x02\x04\x28\x02\x50';assert old[update].count(raw_state)==5
    changed=old[update].replace(raw_state,b'\x28\x02\x04\x10'+u(state))
    count,p=leb(changed,0)
    for _ in range(count):_,p=leb(changed,p);assert changed[p]==127;p+=1
    # Online reconnect/authentication is retired in this local-only candidate.
    # Keep the original update and core/UI gates only after the actual original
    # Photon offline getter is true; the bounded JS owner starts transport once.
    prefix=b'\x41\0\x10'+u(96313)+b'\x45\x04\x40\x0f\x0b'
    new[update]=changed[:p]+prefix+changed[p:]
    # Original Awake contains only Firebase-identity registration/configuration.
    # Retire that online consumer; actual local identity is supplied by the checked adapter.
    new[awake]=b'\0\x0b'
    code=u(len(new))+b''.join(u(len(v))+v for v in new);result=bytearray(linked[:8])
    for kind,start,p,end in sections(linked):result.extend(bytes([kind])+u(len(code))+code if kind==10 else linked[start:end])
    result=bytes(result);actual=bodies(result,sections(result));changed_functions=[offset+i for i,(x,y)in enumerate(zip(old,actual))if x!=y]
    assert changed_functions==[105269,105271]and len(actual)==len(old)+2
    assert all(result[y[2]:y[3]]==original[x[2]:x[3]]for x,y in zip(sections(original),sections(result))if x[0]not in[3,7,10])
    proof.update(changed_previous_functions=changed_functions,previous_function_bodies_preserved=len(old)-2,previous_function_bodies_total=len(old),raw_online_state_reads_replaced=5,original_changed_body_hashes={str(offset+i):sha(old[i])for i in[update,awake]},candidate_wasm_sha256=sha(result),native_type_import_table_global_data_unchanged=True,original_core_gates_preserved=True,original_connect_offline_room_player_ai_providers_preserved=True,original_auth_providers_preserved=True,game_executed=False)
    return result,proof
