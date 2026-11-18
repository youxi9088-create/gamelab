"""Bind the actual locally loaded catalogs and local-request consumer; static input only."""
from pathlib import Path
import json,struct,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'game-data-local-context-contract.json';assert not out.exists()
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('gate=json.loads')]
ns={'b':b,'r':r,'a':a,'json':json,'struct':struct,'hashlib':hashlib};exec(compile(src,'read-original-local-data-context-only','exec'),ns)
gate=json.loads((a/'local-bootstrap-service-gates.json').read_bytes());cust=next(x for x in gate['generic_references']if x['generic_type_name']=='CustomizationDataService');fields=ns['field_rows'](cust['generic_type_index'])
selected={x['native_offset']:x for x in fields if x['native_offset']in[12,16,20]}
assert selected[12]['type']['name']=='CustomizationItemsModel'and selected[16]['type']['name']=='Dictionary<string,CustomizationGroupModel>'and selected[20]['type']['name']=='List<ItemData>'
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());init=next(x for x in services['original_source_snippets']if x['function_index']==105066);flatten=next(x for x in services['original_source_snippets']if x['function_index']==44901)
assert 'a[3]:int = CustomizationDataService_bki_44904'in init['source']and 'a[4]:int = (b = CustomizationDataService_bkj_44903'in init['source']and 'a[5] = c;'in flatten['source']and 'c[3] = e + 1;'in flatten['source']
memory=ns['memory'];rd=ns['rd'];reg=ns['reg'];meta=ns['meta'];mt=ns['mt'];tt=ns['tt'];string=ns['string'];get_address=5562736+cust['data_index']*4;verified=[]
address_context=ns['ns']
known=rd(5669964);known_index=(known&0x1fffffff)>>1;known_method=struct.unpack_from('<i',memory,rd(reg+36)+12*known_index)[0];matches=[]
for i in range(rd(reg+32)):
    mi,ci,gi=struct.unpack_from('<iii',memory,rd(reg+36)+12*i)
    if mi!=known_method or ci<0:continue
    args=address_context['inst_types'](ci)
    if len(args)==1 and args[0]['name']=='CustomizationDataService':matches.append(i)
assert not matches,('Unexpected extra original Customization HasInstance binding',matches)
# No HasInstance<Cust> was compiled. Read the existing instance via the exact
# declaring-class/RGCTX/static-fields path in original644, without invoking Get or inventing MethodInfo.
for address,method in[(get_address,'get_Instance')]:
    encoded=rd(address);assert encoded>>29==6;i=(encoded&0x1fffffff)>>1;mi,ci,gi=struct.unpack_from('<iii',memory,rd(reg+36)+12*i);decl=struct.unpack_from('<i',meta,mt+mi*36+4)[0]
    assert string(struct.unpack_from('<I',meta,mt+mi*36)[0])==method and string(struct.unpack_from('<I',meta,tt+decl*88)[0])=='SMSingletonService`1'
    args=address_context['inst_types'](ci);assert len(args)==1 and args[0]['name']=='CustomizationDataService';verified.append({'address':address,'method':method,'class_argument':args[0]['name']})
list_definition=selected[20]['type']['definition']['type_definition_index'];list_fields=ns['field_rows'](list_definition)
assert any(x['name']=='_size'and x['type']['name']=='int'for x in list_fields)
# Open-generic declaration offsets are placeholders; prove the actual closed list
# using its allocation type and the original inlined size read/write instead.
encoded=rd(5562736+13010*4);assert encoded>>29==1;type_index=(encoded&0x1fffffff)>>1
allocated_list=ns['resolve'](rd(ns['type_ptr']+4*type_index));assert allocated_list['name']=='List<ItemData>'
assert flatten['source'].count('c[3] = e + 1;')==8 and 'e = c[3];'in flatten['source']
items=json.loads((a/'embedded-catalogs/ItemDatas.original-decoded.json').read_bytes());groups=json.loads((a/'embedded-catalogs/ContentGroups.original-decoded.json').read_bytes());assert sum(len(x)for x in items.values())==1493 and len(groups)==48
access=json.loads((a/'local-save-singleton-access-source/original-settings-constant-source.json').read_bytes());get_source=next(x for x in access['original_source_snippets']if x['function_index']==644);has_source=next(x for x in access['original_source_snippets']if x['function_index']==1591)
assert 'a[4]'in get_source['source']and'[24]:int)[2]:int'in get_source['source']and'[23]:int)[0]:int'in get_source['source']and'b[189] & 1'in get_source['source']
class_init=json.loads((a/'native-class-context-init/original-settings-constant-source.json').read_bytes())
outcome={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'customization_metadata':verified,'original_has_instance_binding_exists':False,'customization_existing_instance_layout':{'get_instance_metadata_use':get_address,'method_info_declaring_class_offset':16,'class_flag_byte':189,'class_flag_mask':1,'class_rgctx_offset':96,'rgctx_owner_slot_offset':8,'class_static_fields_offset':92,'static_instance_offset':0,'original_class_metadata_initializer':601},'original_existing_instance_access_sources':[get_source,has_source],'original_class_metadata_initializer_source':class_init,'customization_fields':list(selected.values()),'original_open_generic_list_fields_not_used_as_instance_offsets':list_fields,'actual_list_allocation_type':allocated_list,'actual_list_size_offset_from_eight_original_population_loops':12,'original_catalog_initialization_source':init,'original_item_list_population_source':flatten,'original_item_count':1493,'original_group_count':48,'original_request_consumer':next(x for x in services['original_source_snippets']if x['function_index']==8457),'boundary':['Only read real original native objects after initialization; never manufacture an item list or group dictionary.','No absent HasInstance MethodInfo is fabricated or substituted with a method of a different identity. The own probe copies the verified class-context reads only, not the instance-creation branch.','Open-generic zero offset placeholders are explicitly not used as real object offsets; the original closed-list allocation and eight loops prove size offset12.','The queued local request is separate from Firebase success and does not mark GameData ready.','Original GameData typed application and its completion/error behavior still require a real input transaction.']}
out.write_bytes(json.dumps(outcome,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'customization_metadata':verified,'field_types':[(x['native_offset'],x['type']['name'])for x in selected.values()],'original_counts':[1493,48]}))
