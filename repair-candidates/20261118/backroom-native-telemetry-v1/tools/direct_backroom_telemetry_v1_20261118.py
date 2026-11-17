"""Edit one byte-bound native Lua telemetry sink; never execute the game."""
from pathlib import Path
import json,hashlib,shutil,datetime,struct
from defold_v6_source_edit import archive_entries,unpack,lua_source,replace_lua_source,rebuild,fields
b=Path(__file__).parent;root=b/'direct-games/job-26a474774bbc';old=root/'work';new=root/'work-native-telemetry-v1-20261118'
assert not new.exists(),'Immutable candidate already exists'
sha=lambda v:hashlib.sha256(v).hexdigest()
index=(old/'archive/game0.arci').read_bytes();data=(old/'archive/game0.arcd').read_bytes()
entries=archive_entries(index,data);assert len(entries)==100
module=unpack(entries[40]);assert sha(module)=='fac3bf6cde9d9774004df7a3acee1ff46e292f90bf1c984a9df36f8bd80aeba6'
source=lua_source(module);assert source==(root/'analysis/lua/0040-sdk_manager.lua.lua').read_bytes()
start=source.index(b'function M.poki_send_beacon(msg)\n');end=source.index(b'function M.poki_measure(category, what, action)\n',start)
old_function=source[start:end]
assert old_function.count(b'navigator.sendBeacon')==2 and b'https://leveldata.poki.io/'in old_function
assert not any(x in old_function for x in [b'DEFSAVE.',b'LM.',b'resources_loaded',b'rewarded_break',b'commercial_break'])
replacement=b'function M.poki_send_beacon(msg)\n\t-- Platform telemetry is retired in the standalone package.\nend\n\n'
edited=source[:start]+replacement+source[end:]
assert edited[:start]==source[:start]and edited[start+len(replacement):]==source[end:]
assert b'leveldata.poki.io'not in edited and b'navigator.sendBeacon'not in edited
modified=replace_lua_source(module,source,edited)
next_index,next_data,proof=rebuild(index,data,{40:modified})
assert sum(x['changed']for x in proof)==1 and proof[40]['changed']
for original,current in zip(entries,archive_entries(next_index,next_data)):
 assert original['hash']==current['hash']and original['flags']==current['flags']
 if original['index']!=40:assert original['stored']==current['stored']and unpack(original)==unpack(current)
assert [x['raw']for x in fields(module)if x['key']!=1]==[x['raw']for x in fields(modified)if x['key']!=1]
for ident in [b'project.version',b'SDK.build_date_tag',b'function M.save_get_bool',b'function M.save_set_string',b'function M.setup_save',b'function M.poki_rewarded_break']:
 assert source.count(ident)==edited.count(ident),ident
shutil.copytree(old,new,ignore=shutil.ignore_patterns('evidence','screenshots'))
(new/'archive/game0.arci').write_bytes(next_index);(new/'archive/game0.arcd').write_bytes(next_data)
retained={}
for p in new.rglob('*'):
 if not p.is_file():continue
 n=p.relative_to(new).as_posix()
 if n in ['archive/game0.arci','archive/game0.arcd']:continue
 assert p.read_bytes()==(old/n).read_bytes();retained[n]=sha(p.read_bytes())
assert sha((new/'BackroomBill.wasm').read_bytes())==sha((old/'BackroomBill.wasm').read_bytes())
assert (new/'archive/game0.dmanifest').read_bytes()==(old/'archive/game0.dmanifest').read_bytes()
report={
 'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'job_id':'job-26a474774bbc','version_id':'v-0b998999b4ec',
 'revision':'work-native-telemetry-v1-20261118','changed_native_resource':40,'native_resource_count':100,'unchanged_native_resources':99,
 'lua_module_before_sha256':sha(module),'lua_module_after_sha256':sha(modified),'lua_source_before_sha256':sha(source),'lua_source_after_sha256':sha(edited),
 'removed_function_body_sha256':sha(old_function),'new_function':replacement.decode(),'non_telemetry_source_bytes_unchanged':True,'protobuf_non_source_fields_unchanged':True,
 'index_before_sha256':sha(index),'index_after_sha256':sha(next_index),'data_before_sha256':sha(data),'data_after_sha256':sha(next_data),
 'resource_lookup_hashes_flags_and_99_stored_payloads_unchanged':True,'resource_proof':proof,'retained_manifest':retained,
 'wasm_manifest_project_unchanged':True,'native_game_controller_index_71_unchanged':True,
 'required_external_package':'resources_10.zip','required_package_available':False,'resource_loaded_bypass_added':False,
 'provider_success_or_reward_callbacks_added':False,'prior_ui_steps':1,'new_inputs':0,'remaining_ui_steps':4,
 'game_executed':False,'runtime_archive_compatibility_verified':False,'ready_review':False,
 'scope':'Only telemetry sink source body changes. Preserve original resources_loaded requirement and native integrity/manifest logic; original package missing, no gameplay or compatibility claim.'
}
out=new/'evidence/direct-repair';out.mkdir(parents=True)
(out/'native-telemetry-v1-source-proof.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(out/'sdk_manager.modified.lua').write_bytes(edited)
print(json.dumps({k:v for k,v in report.items()if k not in ['resource_proof','retained_manifest','new_function']},ensure_ascii=False))
