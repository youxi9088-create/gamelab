"""Prepare a byte-bound native source revision; no game/UI execution or admission."""
from pathlib import Path
import sys,json,hashlib,shutil,struct,subprocess,re,copy,datetime
b=Path(__file__).parent;sys.path.insert(0,str(b/'analysis-tools/luaparser-4.2.0'))
from luaparser import ast
from luaparser.astnodes import Function,LocalFunction,If,ElseIf,Call,Assign,Return
from defold_v6_source_edit import archive_entries,unpack,replace_lua_source,rebuild,patch_wasm_call,wasm_imported_functions
r=b/'direct-games/job-ca75d464d2d7';analysis=r/'analysis';out=r/'work-native-retirement-20261117-v2';assert not(r/'source-retirement-candidate-20261117.json').exists(),'Immutable source revision already exists'
source_index=json.loads((analysis/'lua-index.json').read_text(encoding='utf8'));source_by_id={x['index']:x for x in source_index};archive_index=json.loads((analysis/'archive-v6-index.json').read_text(encoding='utf8'))
texts={}
for row in source_index:
 raw=(analysis/'lua'/row['local']).read_bytes();assert hashlib.sha256(raw).hexdigest()==row['sha256'];texts[row['index']]=raw.decode('utf8')
changed={};edits=[]
def current(i):return changed.get(i,texts[i])
def apply(i,ranges,reason):
 text=current(i)
 for start,end,replacement in sorted(ranges,reverse=True):text=text[:start]+replacement+text[end:]
 ast.parse(text);changed[i]=text;edits.append({'index':i,'module':source_by_id[i]['original_path'],'reason':reason,'edits':len(ranges)})
def functions(i,bodies,delete=()):
 text=current(i);tree=ast.parse(text);found=set();ranges=[]
 for node in ast.walk(tree):
  if not isinstance(node,(Function,LocalFunction)):continue
  name=ast.to_lua_source(node.name)
  if name not in bodies and name not in delete:continue
  assert name not in found;found.add(name);start=node.first_token.start;end=node.last_token.stop+1
  if name in delete:replacement=''
  else:
   assert node.body.first_token is not None
   header=text[start:node.body.first_token.start];replacement=header+'\n-- Local edition: this boundary has no remote/provider success response.\n'+bodies[name]+'\nend'
  ranges.append((start,end,replacement))
 assert found==set(bodies)|set(delete),(i,found,set(bodies)|set(delete))
 apply(i,ranges,'Exact named external-service consumer functions removed or use original local/failure continuation')
def remove_assignments(i,names):
 text=current(i);tree=ast.parse(text);ranges=[];found=set()
 for node in ast.walk(tree):
  if not isinstance(node,Assign):continue
  targets=[ast.to_lua_source(x)for x in node.targets]
  if any(n in targets for n in names):
   assert len(targets)==1;found.add(targets[0]);ranges.append((node.first_token.start,node.last_token.stop+1,''))
 assert found==set(names),(i,found,names);apply(i,ranges,'Unused remote endpoint declarations removed, no URL substitution')
def append_to_function(i,name,code):
 text=current(i);nodes=[n for n in ast.walk(ast.parse(text))if isinstance(n,(Function,LocalFunction))and ast.to_lua_source(n.name)==name];assert len(nodes)==1
 node=nodes[0];last=node.body.body[-1];pos=last.first_token.start if isinstance(last,Return)else node.body.last_token.stop+1
 apply(i,[(pos,pos,'\n'+code+'\n')],'Remove actual online UI controls while retaining native local controls')
def retire_controls(i,needles):
 text=current(i);tree=ast.parse(text);ranges=[];matched=[]
 for node in ast.walk(tree):
  if not isinstance(node,(If,ElseIf))or not node.body.first_token:continue
  condition=ast.to_lua_source(node.test)
  if 'gui.pick_node'not in condition:continue
  hits=[s for s in needles if s in condition]
  if not hits:continue
  matched+=hits;ranges.append((node.body.first_token.start,node.body.last_token.stop+1,'do return end'))
 assert set(matched)==set(needles),(i,matched,needles)
 apply(i,ranges,'Actual upload/share/community input branches retired, not just hidden or request-filtered')

# Retire real HTTP calls. Native HTML5 already selected the bundled translations
# and local default parameters; keep that exact fallback, never supply a fake sheet.
functions(43,{'M.load_remote_config':'M.callback = callback\nif type(callback) == "function" then callback() end'},['M.handle_response','M.make_request'])
remove_assignments(43,['M.sheet_id','M.link'])
functions(402,{'M.load_localization':'M.callback = callback\nM.translations = json.decode(offline_localization.translations_json)\nif type(callback) == "function" then callback() end'},['M.handle_response','M.make_request'])
remove_assignments(402,['M.sheet_id','M.link'])
functions(354,{'M.check_internet_connection':'if type(callback) == "function" then callback(false) end'},['M.handle_response'])
remove_assignments(354,['M.sheet_id','M.link'])
functions(571,{'M.initialize':'if type(callback) == "function" then callback(nil) end','M.get_levels':'if type(callback) == "function" then callback(nil) end'})
functions(740,{'M.get_level_from_id':'if type(callback) == "function" then callback(nil) end','M.get_levels':'if type(callback) == "function" then callback(nil) end','M.submit_level':'if type(callback) == "function" then callback(0, nil) end','M.patch_level':'return false'})
remove_assignments(740,['M.deeplink_base_url'])
# Original local graph/editor/save methods and all original campaign/physics data
# stay intact. Network-only sharing is absent; local copy/save/create remain.
retire_controls(83,['"upload_button"','"upload_popup_submit_button"','"upload_popup_share_button"'])
append_to_function(83,'init','gui.set_enabled(gui.get_node("upload_button"), false)\ngui.set_enabled(gui.get_node("upload_popup_submit_button"), false)\ngui.set_enabled(gui.get_node("upload_popup_share_button"), false)')
retire_controls(145,['self.nodes.share_link_button'])
append_to_function(145,'init','gui.set_enabled(self.nodes.share_link_button, false)')
retire_controls(455,['slot.copy_button','"search_button"','"infinite_mode_button"'])
append_to_function(455,'init','gui.set_enabled(gui.get_node("search_button"), false)\ngui.set_enabled(gui.get_node("infinite_mode_button"), false)')
append_to_function(455,'apply_entry_to_row','if slot.copy_button then gui.set_enabled(slot.copy_button, false) end')
retire_controls(569,['slot.copy_button'])
append_to_function(569,'apply_entry_to_row','if slot.copy_button then gui.set_enabled(slot.copy_button, false) end')
retire_controls(618,['self.nodes.btn_share_link.base'])
text=current(618);ranges=[]
for node in ast.walk(ast.parse(text)):
 if isinstance(node,Call)and ast.to_lua_source(node.func)=='gui.set_enabled'and len(node.args)==2 and ast.to_lua_source(node.args[0])=='self.nodes.btn_share_link.root':ranges.append((node.args[1].first_token.start,node.args[1].last_token.stop+1,'false'))
assert len(ranges)==3;apply(618,ranges,'All native share-button enable paths disabled; other pause actions unchanged')
retire_controls(79,['"infinite_mode_button"'])
append_to_function(79,'initialize','gui.set_enabled(gui.get_node("infinite_mode_button"), false)')

# Retiring the actual native provider registration makes the original poki.exists
# return nil naturally. Do not set any platform/license/readiness global.
functions(418,{'M.commercial_break':'if type(callback) == "function" then callback() end','M.rewarded_break':'if type(failed_callback) == "function" then failed_callback() end','M.gameplay_state_changed':'if newstate == "start" then M.gameplay_stopped = false elseif newstate == "stop" then M.gameplay_stopped = true end','M.measure':'return'})
text=current(633);old='params.level_editor = poki_sdk.get_url_param("level_editor")';assert text.count(old)==1;apply(633,[(text.index(old),text.index(old)+len(old),'params = utility.get_query_parameters()')],'Only original local query parser retained; remote level IDs fail through the explicit unavailable path')
functions(595,{'M.initialize':'if type(callback) == "function" then callback(false) end','M.track':'return'})
# Do not report successful purchases/rewards. Existing failure callbacks are kept.
functions(645,{'M.buy':'if type(on_fail) == "function" then on_fail() end'})

for i,text in changed.items():
 ast.parse(text)
 assert not re.search(r'\bhttp\s*\.\s*request\s*\(',text),(i,'HTTP call remains')
 assert 'poki_sdk.shareable_url'not in text and 'poki_sdk.get_url_param'not in text,(i,'Native share/deeplink consumer remains')
assert all(current(i)==texts[i]for i in texts if i not in changed)
shutil.copytree(r/'work',out,dirs_exist_ok=True)
proofdir=out/'evidence/native-retirement-20261117';proofdir.mkdir(parents=True,exist_ok=True)
source_dir=proofdir/'edited-sources';source_dir.mkdir(exist_ok=True)
module_changes={};source_proof=[]
for i,text in changed.items():
 row=source_by_id[i];ent=archive_index['resources'][i];assert ent['index']==i
 original=(analysis/'archive-v6'/ent['file']).read_bytes();assert hashlib.sha256(original).hexdigest()==ent['sha256']
 module_changes[i]=replace_lua_source(original,texts[i].encode(),text.encode())
 (source_dir/row['local']).write_bytes(text.encode())
 source_proof.append({'index':i,'original_path':row['original_path'],'before_source_sha256':row['sha256'],'after_source_sha256':hashlib.sha256(text.encode()).hexdigest(),'protobuf_bytecode_absent':True})
original_archive=r/'original/archive';descriptor=json.loads((original_archive/'archive_files.json').read_text(encoding='utf8'))
pieces=next(x['pieces']for x in descriptor['content']if x['name']=='game.arcd');data=b''.join((original_archive/x['name']).read_bytes()for x in sorted(pieces,key=lambda x:x['offset']));index=(original_archive/'game0.arci').read_bytes()
new_index,new_data,resource_proof=rebuild(index,data,module_changes)
assert len(resource_proof)==803 and sum(x['changed']for x in resource_proof)==len(changed)
archive=out/'archive';assert archive.is_dir()
(archive/'game0.arci').write_bytes(new_index)
new_pieces=[]
for offset in range(0,len(new_data),2097152):
 name='game'+str(offset//2097152)+'.arcd';(archive/name).write_bytes(new_data[offset:offset+2097152]);new_pieces.append({'name':name,'offset':offset})
for item in descriptor['content']:
 if item['name']=='game.arcd':item.update(size=len(new_data),pieces=new_pieces)
descriptor['total_size']=sum(x['size']for x in descriptor['content']);(archive/'archive_files.json').write_text(json.dumps(descriptor,separators=(',',':')),encoding='utf8')
for name in ['game0.projectc','game0.dmanifest']:assert (archive/name).read_bytes()==(original_archive/name).read_bytes()
wasm=(r/'original/LevelDevil.wasm').read_bytes()
# In the original constructor2356, the exact PokiSdk descriptor and table entries
# 32/33/34/35 (entry34=module registration4881) feed the seven-i32 void717 call.
# Balance its seven consumed values with seven drops. No success value/SDK object,
# site check, auth, random/physics/level/unlock function is created or changed.
prefix=bytes.fromhex('41 a0 95 2e 41 dd c3 03 41 20 41 21 41 22 41 23 41 00');assert wasm[0x132bc4:0x132bd6]==prefix
import_count=wasm_imported_functions(wasm);assert import_count==489
new_wasm,preserved=patch_wasm_call(wasm,2356,import_count,0x132bd6,bytes.fromhex('10 cd 05'),b'\x1a'*7)
(out/'LevelDevil.wasm').write_bytes(new_wasm)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(out/'LevelDevil.wasm')],capture_output=True,text=True,timeout=30);assert validation.returncode==0,validation.stderr
source_proof_all={str(i):{'original_path':row['original_path'],'source_sha256':row['sha256'],'unchanged':i not in changed}for i,row in source_by_id.items()}
report={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'job_id':r.name,'base_version_id':'v-1f8b04b1ee19','kind':'native-source-candidate-not-delivered','source_modules':145,'changed_source_modules':len(changed),'unchanged_source_modules':145-len(changed),'resource_count':803,'unchanged_resource_payloads':803-len(changed),'edited_sources':source_proof,'resources':resource_proof,'all_sources':source_proof_all,'edits':edits,'wasm':{'before_sha256':hashlib.sha256(wasm).hexdigest(),'after_sha256':hashlib.sha256(new_wasm).hexdigest(),'changed_function':2356,'preserved_other_function_bodies':preserved,'exact_removed_call':'PokiSdk registration, constructor2356 → void717 with7i32 arguments','replacement':'7 parameter drops; no returned success/readiness/identity value','module_registration_table_index':34,'module_registration_function':4881,'format_validation_exit':0,'site_or_license_checks_changed':False},'archive':{'before_index_sha256':hashlib.sha256(index).hexdigest(),'after_index_sha256':hashlib.sha256(new_index).hexdigest(),'after_data_sha256':hashlib.sha256(new_data).hexdigest(),'manifest_and_project_unchanged':True,'resource_lookup_identifiers_unchanged':True,'signature_or_integrity_checks_weakened':False,'all_decoded_after_hashes_verified':True,'runtime_archive_acceptance_unverified':True},'runtime_verified':False,'admitted':False,'steps_used':5,'steps_remaining':0,'model_or_game_executed':False,'accounting':{'exclusive_processing_seconds':None,'input_tokens':None,'cached_input_tokens':None,'output_tokens':None,'cost':None},'remaining':['Replace legacy JavaScript provider imports and remove old reward-dialog script','Static review of all remaining rewarded/online UI paths','Remote hash/normal current-job preflight','No additional gameplay without a new explicit per-revision allowance; current5 fully consumed']}
(proofdir/'source-retirement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
(r/'source-retirement-candidate-20261117.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:report[k]for k in ['source_modules','changed_source_modules','unchanged_source_modules','resource_count','unchanged_resource_payloads','runtime_verified','steps_used','steps_remaining','model_or_game_executed']}))
