"""Only self-authored fixtures; never load/execute a real game."""
from pathlib import Path
import unittest,tempfile,struct,subprocess,json,hashlib
import lz4.block
from defold_v6_source_edit import encoded,replace_lua_source,lua_source,crypt,rebuild,archive_entries,unpack,patch_wasm_call

B=Path(__file__).parent
def field(key,value):return encoded(key*8+2)+encoded(len(value))+value
def module(source):return field(1,field(1,source)+field(2,b'@self_authored.lua'))+bytes([24,7])

class SourceEditTests(unittest.TestCase):
 def test_protobuf_source_resize_keeps_name_and_unknown_fields(self):
  old=module(b'return 1');new=replace_lua_source(old,b'return 1',b'local value = 2\nreturn value')
  self.assertEqual(lua_source(new),b'local value = 2\nreturn value');self.assertTrue(new.endswith(bytes([24,7])));self.assertIn(b'@self_authored.lua',new)
  with self.assertRaises(AssertionError):replace_lua_source(old,b'return 0',b'return 2')
 def test_source_bytecode_requires_separate_review(self):
  raw=field(1,field(1,b'return 1')+field(3,b'bytecode'))
  with self.assertRaises(AssertionError):lua_source(raw)
 def test_cipher_preserves_partial_last_blocks(self):
  for size in [0,1,7,8,9,33,1025]:
   data=bytes((i*17+3)%256 for i in range(size));self.assertEqual(crypt(crypt(data)),data)
 def test_archive_roundtrip_preserves_unedited_encrypted_resource(self):
  sources=[b'own-image-fixture',b'own-encrypted-fixture'*4,module(b'return 1')];flags=[0,3,3];index=bytearray(64+64*3+16*3);struct.pack_into('>I',index,0,6);struct.pack_into('>4I',index,16,3,256,64,20);data=bytearray()
  for i,(body,flag)in enumerate(zip(sources,flags)):
   index[64+i*64:84+i*64]=hashlib.sha1(body).digest();stored=lz4.block.compress(body,store_size=False)if flag&2 else body
   if flag&1:stored=crypt(stored)
   struct.pack_into('>QII',index,256+i*16,(flag<<60)|len(data),len(body),len(stored)if flag&2 else 0xffffffff);data.extend(stored)
  changed=replace_lua_source(sources[2],b'return 1',b'local value = 11\nreturn value');new_index,new_data,proof=rebuild(bytes(index),bytes(data),{2:changed});entries=archive_entries(new_index,new_data)
  self.assertEqual([unpack(x)for x in entries],[sources[0],sources[1],changed]);self.assertEqual([x['changed']for x in proof],[False,False,True]);self.assertEqual(new_index[64:256],index[64:256])
 def test_native_registration_removed_without_other_registration_or_fake_return(self):
  wat='''(module (import "env" "register" (func $register (param i32 i32 i32 i32 i32 i32 i32)))
    (func (export "initialize")
      i32.const 11 i32.const 12 i32.const 13 i32.const 14 i32.const 15 i32.const 16 i32.const 17 call $register
      i32.const 21 i32.const 22 i32.const 23 i32.const 24 i32.const 25 i32.const 26 i32.const 27 call $register))'''
  with tempfile.TemporaryDirectory(prefix='defold-own-fixture-')as directory:
   folder=Path(directory);(folder/'fixture.wat').write_text(wat,encoding='utf8');wabt=B/'native-analysis-tools/node_modules/wabt/bin'
   subprocess.run(['node',str(wabt/'wat2wasm'),str(folder/'fixture.wat'),'-o',str(folder/'original.wasm')],check=True,capture_output=True)
   raw=(folder/'original.wasm').read_bytes();marker=bytes.fromhex('41 11 10 00');offset=raw.index(marker)+2
   patched,preserved=patch_wasm_call(raw,1,1,offset,b'\x10\x00',b'\x1a'*7);(folder/'patched.wasm').write_bytes(patched);self.assertEqual(preserved,0)
   subprocess.run(['node',str(wabt/'wasm-validate'),str(folder/'patched.wasm')],check=True,capture_output=True)
   own_script='''const fs=require('fs');(async()=>{let result=[];for(const name of ['original.wasm','patched.wasm']){let calls=[];let {instance}=await WebAssembly.instantiate(fs.readFileSync(process.argv[2]+'/'+name),{env:{register:(...args)=>calls.push(args)}});instance.exports.initialize();result.push(calls);}process.stdout.write(JSON.stringify(result));})();'''
   (folder/'run-fixture.cjs').write_text(own_script,encoding='utf8');calls=json.loads(subprocess.check_output(['node',str(folder/'run-fixture.cjs'),str(folder)],text=True));self.assertEqual(calls,[[list(range(11,18)),list(range(21,28))],[list(range(21,28))]])
   with self.assertRaises(AssertionError):patch_wasm_call(raw,1,1,offset,b'\x10\x01',b'\x1a'*7)

if __name__=='__main__':unittest.main()
