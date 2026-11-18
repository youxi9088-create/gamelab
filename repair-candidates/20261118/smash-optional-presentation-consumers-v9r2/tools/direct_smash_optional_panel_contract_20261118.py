"""Bind optional UI retirement and preserve the genuine gameplay prerequisites."""
from pathlib import Path
import json,struct,contextlib,io,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';target=a/'optional-panels-source/original-retirement-contract.json';assert not target.exists()
# Reuse the data-only metadata/module mapper for the two actual Unity component APIs.
src=(b/'direct_smash_streaming_path_bindings_20261118.py').read_text(encoding='utf8')
src=src.replace('streaming-path-bindings','optional-panel-method-bindings').replace("[('UnityEngine', 'Application'), ('System', 'String')]","[('UnityEngine', 'Component'), ('UnityEngine', 'GameObject')]")
src=src.replace("['get_streamingAssetsPath', 'Concat']","['get_gameObject', 'SetActive']")
src=src.replace("x['method'] == 'get_streamingAssetsPath' and x['function_index'] == 6872","x['method'] == 'get_gameObject' and x['function_index'] == 637")
src=src.replace("x['method'] == 'Concat' and x['function_index'] == 676 and x['parameter_count'] == 3","x['method'] == 'SetActive' and x['function_index'] == 630 and x['parameter_count'] == 1")
ns={'__file__':str(b/'direct_smash_streaming_path_bindings_20261118.py')}
binding_path=a/'optional-panel-method-bindings/original-path-method-bindings.json'
if not binding_path.exists():
    with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'read-original-panel-method-bindings-only','exec'),ns)
bindings=json.loads(binding_path.read_bytes());assert bindings['source_only']and not bindings['game_executed']
component_rows=[x for x in bindings['methods']if (x['type'],x['method'],x['function_index'])in[('Component','get_gameObject',637),('GameObject','SetActive',630)]]
assert len(component_rows)==2
gates=json.loads((a/'local-bootstrap-service-gates.json').read_bytes());rows=gates['generic_references'];ref={x['generic_type_name']:x for x in rows};base=5562736
core=[{'class':name,'get_metadata_address':base+ref[name]['data_index']*4,'has_metadata_address':base+(ref[name]['data_index']-2)*4,'ready_byte':offset}for name,offset in [('GameSettingsService',21),('UserService',80),('FtueDataService',20)]]
# Check exact HasInstance/get_Instance generic metadata rather than inferring ownership from proximity.
src=(b/'direct_smash_profile_address_contract_20261118.py').read_text(encoding='utf8').split('for address,expected_method')[0].replace(';assert not out.exists()','')
contract={'__file__':str(b/'direct_smash_profile_address_contract_20261118.py')};exec(compile(src,'read-original-generic-metadata-only','exec'),contract)
meta=contract['meta'];memory=contract['m'];rd=contract['rd'];reg=contract['registration'];mt=contract['mt'];tt=contract['tt'];string=contract['string']
game=ref['GameDataService'];data={'class':'GameDataService','get_metadata_address':base+game['data_index']*4,'has_metadata_address':base+(game['data_index']-2)*4,'loading_byte':140,'original_ready_getter':10177}
verified=[]
for row in core+[data]:
    for key,method_name in [('has_metadata_address','HasInstance'),('get_metadata_address','get_Instance')]:
        address=row[key];encoded=rd(address);assert encoded>>29==6;index=(encoded&0x1fffffff)>>1
        mi,ci,gi=struct.unpack_from('<iii',memory,rd(reg+36)+12*index);decl=struct.unpack_from('<i',meta,mt+mi*36+4)[0]
        name=string(struct.unpack_from('<I',meta,mt+mi*36)[0]);cls=string(struct.unpack_from('<I',meta,tt+decl*88)[0]);args=contract['inst_types'](ci)
        assert name==method_name and cls=='SMSingletonService`1'and len(args)==1 and args[0]['name']==row['class']
        verified.append({'address':address,'method':name,'owner':row['class'],'method_spec_index':index})
loading=next(x for x in game['declared_fields']if x['native_offset']==140);assert loading['native_type_code']==2
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());ready=next(x for x in services['original_source_snippets']if x['function_index']==10177)
assert 'a[17]'in ready['source']and 'a[23]'in ready['source'] # Keep original real-data completeness calculation.
panels=json.loads((a/'optional-panels-source/original-optional-panel-source.json').read_bytes())
starts=[next(x for x in panels['methods']if x['class']==name and x['name']=='Start')for name in ['CrossPromoPanel','NewsAndFriendsPanel','NewsPanel']]
from smash_profile_native_linker_20261118 import bodies,sections,imports,u
original=contract['n']['ns']['raw'];function_bodies=bodies(original,sections(original));imported=len(imports(original,sections(original)))
request_callers={}
for fn in [43380,43675]:
    needle=b'\x10'+u(fn);hits=[imported+i for i,body in enumerate(function_bodies)if needle in body]
    assert hits==[104933],(fn,hits);request_callers[str(fn)]=hits
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'core_service_requirements':core,'game_data_requirement':data,'verified_generic_metadata':verified,'original_game_data_completeness_source':ready,'retired_optional_service_names':['NewsDataService','CrossPromoDataService'],'original_startup_request_callers':request_callers,'retired_panel_start_consumers':starts,'component_apis':component_rows,'original_changed_body_proofs':[x for x in panels['original_body_proofs']if x['function_index']in[6443,10272,104933]+[x['function_index']for x in starts]],'boundary':['Core settings, persisted local user, original parsed tutorial and actual GameData completeness remain required.','Remove optional startup request consumers and optional presentation dependencies together; never mark their services ready or feed fabricated data.','Only the combined online news/friends/media panel and promotion presentation will be hidden using original GameObject APIs.','Direct instruction-pattern candidates were checked against the original decompiled loader caller; this is not an exhaustive indirect-call proof.','No gameplay, authentication, rewards, permissions, task or acceptance gates changed by this source contract.']}
target.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'core_services':core,'game_data':data,'retired_panel_starts':[(x['class'],x['function_index'])for x in starts],'component_apis':[(x['type'],x['method'],x['function_index'])for x in component_rows]}))
