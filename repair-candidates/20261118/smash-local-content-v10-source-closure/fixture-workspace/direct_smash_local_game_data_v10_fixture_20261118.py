"""Compile/link only owned fixtures and run meaningful local-content transaction checks."""
from pathlib import Path
import json,subprocess
from smash_profile_native_linker_20261118 import link,bodies,sections
b=Path(__file__).parent
for name in ['smash_local_game_data_v10_20261118','smash_local_game_data_fixture_v10_20261118']:
    subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wat2wasm'),str(b/(name+'.wat')),'-o',str(b/(name+'.wasm'))],check=True)
names=['metadata_init','class_metadata_init','has_instance','get_instance','serialize','deserialize','string_ctor','string_equal','game_data_ready','apply_original_game_data']
old=(b/'smash_local_game_data_fixture_v10_20261118.wasm').read_bytes();helper=(b/'smash_local_game_data_v10_20261118.wasm').read_bytes();linked,proof=link(old,helper,{n:i for i,n in enumerate(names)})
assert proof['original_defined_functions_unchanged']==2 and len(proof['appended_function_indices'])==11
assert bodies(linked,sections(linked))[:2]==bodies(old,sections(old))
(b/'smash_local_game_data_linked_fixture_v10_20261118.wasm').write_bytes(linked)
subprocess.run(['node',str(b/'test_smash_local_game_data_v10_20261118.cjs')],check=True)
