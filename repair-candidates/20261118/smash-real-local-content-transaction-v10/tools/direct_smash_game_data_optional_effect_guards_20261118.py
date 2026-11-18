"""Verify original key-presence guards before using a locally derived minimal dataset."""
from pathlib import Path
import json,struct,re,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'game-data-optional-input-effect-guards.json';assert not out.exists()
src=(b/'direct_smash_profile_address_contract_20261118.py').read_text(encoding='utf8').split('for address,expected_method')[0].replace(';assert not out.exists()','');ns={'__file__':str(b/'direct_smash_profile_address_contract_20261118.py')};exec(compile(src,'read-native-presence-guard-bindings','exec'),ns)
m=ns['m'];rd=ns['rd'];reg=ns['registration'];meta=ns['meta'];mt=ns['mt'];tt=ns['tt'];string=ns['string'];encoded=rd(5648396);assert encoded>>29==6;spec=(encoded&0x1fffffff)>>1;mi,ci,gi=struct.unpack_from('<iii',m,rd(reg+36)+12*spec);decl=struct.unpack_from('<i',meta,mt+mi*36+4)[0]
assert string(struct.unpack_from('<I',meta,mt+mi*36)[0])=='ContainsKey'and string(struct.unpack_from('<I',meta,tt+decl*88)[0])=='Dictionary`2'
args=ns['inst_types'](ci);assert [x['name']for x in args]==['string','object']
cold=json.loads((a/'game-data-cold-start-contract.json').read_bytes());complex_source=json.loads((a/'complex-bootstrap-c-source/original-complex-c-source.json').read_bytes());apply=next(x for x in complex_source['original_c_source_snippets']if x['function_index']==43610);lines=apply['source'].splitlines()
keys=json.loads((a/'game-data-original-key-contract.json').read_bytes());by_name={x['value']:x['function_index']for x in keys['rows']};guards=[]
for name in ['uncollectedRewards','spinHighlights','dailyChallenges','seasonChallenges','seasonData','promos','expiredItemPrices','newlyAwardedSeasonRewards','seasonPoints','numLoopRewardsCollected']:
    fn=by_name[name];row=next(x for x in cold['original_complex_apply_constant_indirect_targets']if x['function_index']==fn);start=row['source_line']-1
    window='\n'.join(lines[start:start+90]);assert 'var_i0 = 1712u;'in window and 'var_i3 = 5648396u;'in window
    returned=re.search(r'var_i0 = w2c_a_g\(instance->w2c_a_instance, var_i0, var_i1, var_i2, var_i3\);\s+(var_\w+) = var_i0;',window);assert returned,(name,window)
    match=re.search(r'var_i0 = '+re.escape(returned[1])+r';\s+var_i0 = !\(var_i0\);\s+if \(var_i0\) \{goto (var_B\d+);\}',window)
    if match:
        label=match[1];ends=[i for i,x in enumerate(lines)if x.strip()==label+':;'];assert len(ends)==1 and ends[0]>start
        guard_end=start+window[:match.end()].count('\n');assert guard_end<ends[0];kind='missing-key-goto'
    else:
        match=re.search(r'var_i0 = '+re.escape(returned[1])+r';\s+if \(var_i0\) \{',window);assert match,(name,window)
        guard_end=start+window[:match.end()].count('\n');depth=1;end=guard_end
        # Count the actual C braces in the original positive branch; no source is executed.
        for end in range(guard_end+1,len(lines)):
            depth+=lines[end].count('{')-lines[end].count('}')
            if depth==0:break
        assert depth==0 and end>guard_end;ends=[end];label='positive-branch-not-entered';kind='contains-key-positive-branch'
    excerpt='\n'.join(lines[max(0,start-3):guard_end+1]);guards.append({'key':name,'getter_function':fn,'original_source_start_line':start+1,'presence_guard_end_line':guard_end+1,'guard_kind':kind,'missing_key_jump':label,'missing_key_target_line':ends[0]+1,'source_excerpt':excerpt,'source_excerpt_sha256':hashlib.sha256(excerpt.encode()).hexdigest()})
assert ns['n']['ns']['table'][1712]is not None
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());consumer=next(x for x in services['original_source_snippets']if x['function_index']==17602);assert 'f_fsqa(0)'in consumer['source']and 'UserService_FetchUserData_2736' in consumer['source']
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_contains_key_metadata_use':5648396,'generic_arguments':args,'contains_key_shared_function':ns['n']['ns']['table'][1712],'original_complex_apply_sha256':apply['source_sha256'],'optional_key_guards':guards,'local_dataset_allowed_keys':['dayId','playOptions'],'day_id_source_policy':'Actual current UTC calendar date in a namespaced own local-content record; not claimed as server time or server data.','boundary':['Absence of optional keys follows the original missing-key branches; no zero/empty fabricated rewards, seasons or challenge responses are supplied.','Original common application/normalization callbacks still run and must be observed on52 before any acceptance.','This proof does not establish complete SDK retirement, gameplay, local rewards or all indirect effects.']};out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'optional_key_guards':[(x['key'],x['missing_key_target_line'])for x in guards],'original_contains_key_shared_function':result['contains_key_shared_function']}))
