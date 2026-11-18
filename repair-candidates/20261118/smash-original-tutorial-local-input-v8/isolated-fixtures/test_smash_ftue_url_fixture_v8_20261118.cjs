'use strict';
// Only the self-authored fixture and bridge are instantiated; no original game bytes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const moduleBytes=fs.readFileSync(path.join(__dirname,'smash_ftue_url_linked_fixture_v8_20261118.wasm'));
const own=new WebAssembly.Module(moduleBytes),checks=[];
for(const prefix of ['https://fixture.invalid/StreamingAssets','http://127.0.0.1:1234/game/StreamingAssets','https://fixture.invalid/游戏/StreamingAssets']){
  let memory,next=1024,calls=[];
  const put=s=>{let p=next;next+=16+s.length*2;next=(next+7)&~7;let v=new DataView(memory.buffer);v.setInt32(p+8,s.length,true);for(let i=0;i<s.length;i++)v.setUint16(p+12+i*2,s.charCodeAt(i),true);return p;};
  const read=p=>{let v=new DataView(memory.buffer),s='';for(let i=0,n=v.getInt32(p+8,true);i<n;i++)s+=String.fromCharCode(v.getUint16(p+12+i*2,true));return s;};
  const instance=new WebAssembly.Instance(own,{native:{streaming_assets_path(mi){assert.equal(mi,0);calls.push('path');return put(prefix);},
    string_ctor(p,start,n,mi){assert.equal(start,0);assert.equal(mi,0);calls.push('string');let v=new DataView(memory.buffer),s='';for(let i=0;i<n;i++)s+=String.fromCharCode(v.getUint16(p+2*i,true));return put(s);},
    concat2(a,b,mi){assert.equal(mi,0);calls.push('concat');return put(read(a)+read(b));}}});
  memory=instance.exports.memory;
  const before=instance.exports.stack.value;
  assert.equal(read(instance.exports.gamelab_ftue_local_url()),prefix+'/aa/ftue-v4.original.json');
  assert.equal(instance.exports.stack.value,before);assert.deepEqual(calls,['path','string','concat']);
  assert.equal(instance.exports.fixture_anchor(),42);checks.push('portable original-path string/UTF16/concat and stack preservation: '+prefix);
}
const out={passed:checks.length,checks,fixture_only:true,original_game_code_executed:false,original_game_data_used:false};
fs.writeFileSync(path.join(__dirname,'smash-ftue-url-fixture-result-v8-20261118.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
