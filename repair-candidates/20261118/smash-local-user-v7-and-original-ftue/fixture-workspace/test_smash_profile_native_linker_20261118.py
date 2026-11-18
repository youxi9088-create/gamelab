"""Link and validate entirely self-authored fixtures; no original game input."""
from pathlib import Path
import json,subprocess
from smash_profile_native_linker_20261118 import link,bodies,sections
b=Path(__file__).parent;original=(b/'smash_local_profile_fixture_20261118.wasm').read_bytes();helper=(b/'smash_local_profile_bridge_20261118.wasm').read_bytes()
names=['metadata_init','has_instance','get_instance','serialize','deserialize','string_ctor','string_equal','set_user_ready','invoke_user_changed'];targets={name:i for i,name in enumerate(names)}
result,proof=link(original,helper,targets)
assert proof['original_defined_functions_unchanged']==3 and len(proof['appended_function_indices'])==7
assert bodies(result,sections(result))[:3]==bodies(original,sections(original))
wrong=dict(targets);wrong['serialize']=5
try:link(original,helper,wrong)
except AssertionError:pass
else:raise AssertionError('Mismatched native ABI accepted')
p=b/'smash_local_profile_linked_fixture_20261118.wasm';p.write_bytes(result)
r=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(p)],capture_output=True,text=True);assert r.returncode==0,r.stderr
out={'fixture_only':True,'original_game_code_executed':False,'original_game_data_used':False,'original_fixture_function_bodies_unchanged':3,'appended_self_authored_functions':7,'abi_mismatch_rejected':True,'static_wasm_validation_exit':r.returncode,'linked_fixture_sha256':proof['linked_wasm_sha256']}
(b/'smash-profile-linker-fixture-result-20261118.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
