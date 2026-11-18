"""Compile and exercise only a self-authored portable URL bridge and mock fixture."""
from pathlib import Path
import json, subprocess
from smash_profile_native_linker_20261118 import link
b=Path(__file__).parent
suffix='/aa/ftue-v4.original.json'
raw=suffix.encode('utf-16-le');raw+=b'\0'*((-len(raw))%4)
stores='\n'.join(f'    local.get $frame i32.const {int.from_bytes(raw[i:i+4],"little",signed=True)} i32.store offset={16+i}' for i in range(0,len(raw),4))
wat=f'''(module
  (import "native" "streaming_assets_path" (func $path (param i32) (result i32)))
  (import "native" "string_ctor" (func $string (param i32 i32 i32 i32) (result i32)))
  (import "native" "concat2" (func $concat (param i32 i32 i32) (result i32)))
  (import "native" "memory" (memory 1))
  (import "native" "stack" (global $stack (mut i32)))
  ;; Original tutorial bytes are downloaded and parsed by the unchanged native service.
  (func (export "gamelab_ftue_local_url") (result i32)
    (local $frame i32) (local $result i32)
    global.get $stack i32.const 80 i32.sub local.tee $frame global.set $stack
    local.get $frame i32.const 0 call $path i32.store
{stores}
    local.get $frame
    local.get $frame i32.const 16 i32.add i32.const 0 i32.const {len(suffix)} i32.const 0 call $string
    i32.store offset=4
    local.get $frame i32.load local.get $frame i32.load offset=4 i32.const 0 call $concat local.set $result
    local.get $frame i32.const 80 i32.add global.set $stack
    local.get $result))
'''
fixture='''(module
  (import "native" "streaming_assets_path" (func (param i32) (result i32)))
  (import "native" "string_ctor" (func (param i32 i32 i32 i32) (result i32)))
  (import "native" "concat2" (func (param i32 i32 i32) (result i32)))
  (memory (export "memory") 2)
  (global (export "stack") (mut i32) (i32.const 64000))
  (func (export "fixture_anchor") (result i32) i32.const 42))
'''
for name,text in [('smash_ftue_local_url_v8_20261118',wat),('smash_ftue_url_fixture_v8_20261118',fixture)]:
    (b/(name+'.wat')).write_text(text,encoding='utf8')
    subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wat2wasm'),str(b/(name+'.wat')),'-o',str(b/(name+'.wasm'))],check=True)
linked,proof=link((b/'smash_ftue_url_fixture_v8_20261118.wasm').read_bytes(),(b/'smash_ftue_local_url_v8_20261118.wasm').read_bytes(),{'streaming_assets_path':0,'string_ctor':1,'concat2':2})
assert proof['original_defined_functions_unchanged']==1 and len(proof['appended_function_indices'])==1
(b/'smash_ftue_url_linked_fixture_v8_20261118.wasm').write_bytes(linked)
subprocess.run(['node',str(b/'test_smash_ftue_url_fixture_v8_20261118.cjs')],check=True)
