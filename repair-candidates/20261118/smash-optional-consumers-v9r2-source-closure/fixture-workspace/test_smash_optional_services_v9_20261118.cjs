'use strict';
// Self-authored fixture/import mocks only; no original game code or game data is executed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const own=new WebAssembly.Module(fs.readFileSync(path.join(__dirname,'smash_optional_services_linked_fixture_v9_20261118.wasm')));
const ids=new Map([[5669884,0],[5669892,0],[5669964,1],[5669972,1],[5669852,2],[5669860,2],[5669868,3],[5669876,3]]);
let cases=0;
function fixture(states,gamePresent,gameReady,loading){
  let memory,calls=[],hidden=[]; const view=()=>new DataView(memory.buffer),ptr=i=>65536+256*i;
  const instance=new WebAssembly.Instance(own,{native:{metadata_init(address){assert(ids.has(address));view().setInt32(address,ids.get(address)+1,true);},
    has_instance(mi){const i=mi-1;assert(i>=0&&i<4);return i===3?+gamePresent:+states[i].present;},
    get_instance(mi){const i=mi-1;assert(i>=0&&i<4);assert(i===3?gamePresent:states[i].present);return ptr(i);},
    game_data_ready(s,mi){assert.equal(s,ptr(3));assert.equal(mi,0);calls.push('real-data-completeness');return +gameReady;},
    component_game_object(component,mi){assert.equal(component,54321);assert.equal(mi,0);return 87654;},
    set_active(object,active,mi){assert.equal(object,87654);assert.equal(active,0);assert.equal(mi,0);hidden.push(object);}}});
  memory=instance.exports.memory; const offsets=[21,80,20];
  states.forEach((s,i)=>view().setUint8(ptr(i)+offsets[i],+s.ready));view().setUint8(ptr(3)+140,+loading);
  const before=Uint8Array.from(new Uint8Array(memory.buffer,65536,1024));
  const need=instance.exports.gamelab_need_core_game_data(),complete=instance.exports.gamelab_core_game_data_complete();
  assert.deepEqual(new Uint8Array(memory.buffer,65536,1024),before);assert.equal(instance.exports.stack.value,7600000);
  return {need,complete,calls,instance,hidden};
}
// Every missing/unready core service blocks both phases; there is no synthetic readiness.
for(let mask=0;mask<64;mask++){
  const states=[0,1,2].map(i=>({present:!!(mask&(1<<(2*i))),ready:!!(mask&(1<<(2*i+1)))}));
  for(const game of [{p:false,r:false,l:false},{p:true,r:false,l:false},{p:true,r:false,l:true},{p:true,r:true,l:false}]){
    const f=fixture(states,game.p,game.r,game.l),core=states.every(s=>s.present&&s.ready);
    assert.equal(f.need,+(core&&(!game.p||(!game.r&&!game.l))));assert.equal(f.complete,+(core&&game.p&&game.r));
    if(!core)assert.equal(f.calls.length,0);cases++;
  }
}
const f=fixture([0,1,2].map(()=>({present:true,ready:true})),true,true,false);
f.instance.exports.gamelab_retire_optional_component(54321,0);assert.deepEqual(f.hidden,[87654]);assert.equal(f.instance.exports.fixture_anchor(),73);
const out={fixture_only:true,original_game_code_executed:false,original_game_data_used:false,core_dependency_state_cases:cases,
 checks:['All missing/unready core services block both phases','Real GameData loading/completeness retained','No service/profile/permission readiness bytes written','Original component API hides online-only presentation without callbacks','Shadow stack and prior own fixture anchor preserved'],passed:5};
fs.writeFileSync(path.join(__dirname,'smash-optional-services-fixture-result-v9-20261118.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out));
