"""Resolve the real GameData cold-start types and inputs, using static data only."""
from pathlib import Path
import json,struct,hashlib,datetime,re
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';target=a/'game-data-cold-start-contract.json';assert not target.exists()
src=(b/'direct_smash_profile_address_contract_20261118.py').read_text(encoding='utf8').split('for address,expected_method')[0].replace(';assert not out.exists()','')
ns={'__file__':str(b/'direct_smash_profile_address_contract_20261118.py')};exec(compile(src,'read-static-native-contract-tables-only','exec'),ns)
n=ns['n'];memory=ns['m'];meta=ns['meta'];tt=ns['tt'];mt=ns['mt'];rd=ns['rd'];resolve=ns['ns']['resolve'];string=ns['string'];reg=ns['registration']
type_ptr=rd(reg+28);type_count=rd(reg+24);ft,fs=struct.unpack_from('<II',meta,96);pt,ps=struct.unpack_from('<II',meta,88)
registration=json.loads((a/'server-settings-native-field-offsets.json').read_bytes())['registration']
def field_rows(t):
    p=tt+88*t;first=struct.unpack_from('<i',meta,p+32)[0];count=struct.unpack_from('<H',meta,p+68)[0];offsets=rd(registration['field_offsets_table_address']+4*t);rows=[]
    for i in range(count):
        name,typ,token=struct.unpack_from('<IiI',meta,ft+12*(first+i));rows.append({'name':string(name),'field_index':first+i,'native_offset':struct.unpack_from('<i',memory,offsets+4*i)[0],'type':resolve(rd(type_ptr+4*typ)),'attributes':rd(rd(type_ptr+4*typ)+4)&65535})
    return rows
gate=json.loads((a/'local-bootstrap-service-gates.json').read_bytes());owner=next(x for x in gate['generic_references']if x['generic_type_name']=='GameDataService');fields=field_rows(owner['generic_type_index']);original_data=next(x for x in fields if x['native_offset']==12)['type']
data_t=original_data['type_definition_index'];data_fields=field_rows(data_t)
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());selected={26067,8457,17602,43610,43613,101051,43611,17600,10177};methods=[]
for row in services['mapping']['mapped_methods']:
    if row['function_index']not in selected:continue
    p=mt+36*row['method_index'];first=struct.unpack_from('<i',meta,p+16)[0];count=struct.unpack_from('<H',meta,p+34)[0];params=[]
    for i in range(first,first+count):
        name,token,typ=struct.unpack_from('<III',meta,pt+12*i);params.append({'name':string(name),'type':resolve(rd(type_ptr+4*typ))})
    ret=struct.unpack_from('<i',meta,p+8)[0];methods.append(dict(row,parameters=params,return_type=resolve(rd(type_ptr+4*ret))))
assert len(methods)==len(selected)
ref_rows=[]
for index in [15131,15134,13428,26777]:
    encoded=rd(5562736+4*index);kind=encoded>>29;decoded=(encoded&0x1fffffff)>>1;row={'data_index':index,'encoded_kind':kind,'decoded_index':decoded}
    if kind in[1,2]and decoded<type_count:row['native_type']=resolve(rd(type_ptr+4*decoded))
    elif kind==6:
        mi,ci,gi=struct.unpack_from('<iii',memory,rd(reg+36)+12*decoded);row.update(method_index=mi,class_arguments=ns['inst_types'](ci)if ci>=0 else[],method_arguments=ns['inst_types'](gi)if gi>=0 else[])
    ref_rows.append(row)
assert ref_rows[0]['native_type']['name']=='GameConstants'
complex_source=json.loads((a/'complex-bootstrap-c-source/original-complex-c-source.json').read_bytes());apply=next(x for x in complex_source['original_c_source_snippets']if x['function_index']==43610)
# List actual constant indirect table targets for follow-up interpretation; do not infer API semantics.
table=n['ns']['table'];last=None;indirect=[]
for i,line in enumerate(apply['source'].splitlines(),1):
    match=re.search(r'var_i0 = (\d+)u;',line)
    if match:last=int(match[1])
    elif re.search(r'var_i0 = ',line)and'w2c_a_'not in line:last=None
    if 'w2c_a_'in line and 'instance->w2c_a_instance, var_i0'in line:
        if last is not None and last in table:indirect.append({'source_line':i,'table_index':last,'function_index':table[last]})
        last=None
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'metadata_sha256':hashlib.sha256(meta).hexdigest(),'game_data_service_fields':fields,'embedded_data_type':original_data,'embedded_data_fields':data_fields,'original_startup_methods':methods,'original_static_references':ref_rows,'original_source_snippets':[x for x in services['original_source_snippets']if x['function_index']in selected],'original_complex_apply_sha256':apply['source_sha256'],'original_complex_apply_constant_indirect_targets':indirect,'limitations':['Static types and source only, not a completed local GameData transaction.','Original core-data getter requires actual nonempty data identity/version fields; do not replace it with true.','The original default object and embedded ItemDatas/ContentGroups are not evidence that all remote configuration is present.','Do not fabricate backend dictionaries, account versions, permissions, rewards or loading completion.']}
target.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'data_type':original_data,'data_fields':[(x['name'],x['type']['name'],x['native_offset'])for x in data_fields],'methods':[(x['method'],x['function_index'],[p['type']['name']for p in x['parameters']])for x in methods],'static_references':ref_rows,'indirect_targets':sorted(set(x['function_index']for x in indirect))},ensure_ascii=False))
