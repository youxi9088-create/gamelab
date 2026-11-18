"""Build a real core-service predicate and optional-component retirement; own fixtures only."""
from pathlib import Path
import json,subprocess
from smash_profile_native_linker_20261118 import link
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
c=json.loads((r/'analysis-20261118/optional-panels-source/original-retirement-contract.json').read_bytes());assert c['source_only']and not c['game_executed']
checks=[]
for row in c['core_service_requirements']:
    has,get,offset=row['has_metadata_address'],row['get_metadata_address'],row['ready_byte']
    checks.append(f'''    i32.const {has} call $meta
    i32.const {has} i32.load call $has i32.eqz if i32.const 0 return end
    i32.const {get} call $meta
    i32.const {get} i32.load call $get i32.load8_u offset={offset}
    i32.eqz if i32.const 0 return end''')
game=c['game_data_requirement'];has,get=game['has_metadata_address'],game['get_metadata_address']
header='''  (import "native" "metadata_init" (func $meta (param i32)))
  (import "native" "has_instance" (func $has (param i32) (result i32)))
  (import "native" "get_instance" (func $get (param i32) (result i32)))
  (import "native" "game_data_ready" (func $ready (param i32 i32) (result i32)))
  (import "native" "component_game_object" (func $object (param i32 i32) (result i32)))
  (import "native" "set_active" (func $active (param i32 i32 i32)))
'''
wat='(module\n'+header+'''  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  (func $core (result i32)
'''+ '\n'.join(checks)+f'''
    i32.const 1)
  ;; First phase still requires actual settings/user/tutorial; real GameData must be absent/not loading/not complete.
  (func (export "gamelab_need_core_game_data") (result i32)
    (local $s i32)
    call $core i32.eqz if i32.const 0 return end
    i32.const {has} call $meta
    i32.const {has} i32.load call $has
    if
      i32.const {get} call $meta
      i32.const {get} i32.load call $get local.set $s
      local.get $s i32.const 0 call $ready if i32.const 0 return end
      local.get $s i32.load8_u offset=140 i32.eqz return
    end
    i32.const 1)
  ;; Final phase still delegates completeness to the original GameData getter, not a readiness override.
  (func (export "gamelab_core_game_data_complete") (result i32)
    call $core i32.eqz if i32.const 0 return end
    i32.const {has} call $meta
    i32.const {has} i32.load call $has i32.eqz if i32.const 0 return end
    i32.const {get} call $meta
    i32.const {get} i32.load call $get i32.const 0 call $ready)
  ;; Retire actual online presentation components; no fake news, friends, promo or success callback.
  (func (export "gamelab_retire_optional_component") (param $component i32) (param $mi i32)
    local.get $component i32.const 0 call $object i32.const 0 i32.const 0 call $active))
'''
fixture='(module\n'+header+'''  (memory (export "memory") 128)
  (global (export "stack") (mut i32) (i32.const 7600000))
  (func (export "fixture_anchor") (result i32) i32.const 73)
  (func (param i32 i32)))
'''
for name,text in [('smash_optional_services_v9_20261118',wat),('smash_optional_services_fixture_v9_20261118',fixture)]:
    (b/(name+'.wat')).write_text(text,encoding='utf8')
    subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wat2wasm'),str(b/(name+'.wat')),'-o',str(b/(name+'.wasm'))],check=True)
names=['metadata_init','has_instance','get_instance','game_data_ready','component_game_object','set_active']
linked,proof=link((b/'smash_optional_services_fixture_v9_20261118.wasm').read_bytes(),(b/'smash_optional_services_v9_20261118.wasm').read_bytes(),{n:i for i,n in enumerate(names)})
assert proof['original_defined_functions_unchanged']==2 and len(proof['appended_function_indices'])==4
(b/'smash_optional_services_linked_fixture_v9_20261118.wasm').write_bytes(linked)
subprocess.run(['node',str(b/'test_smash_optional_services_v9_20261118.cjs')],check=True)
