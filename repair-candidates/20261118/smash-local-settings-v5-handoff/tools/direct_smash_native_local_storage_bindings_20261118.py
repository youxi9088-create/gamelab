"""Bind real native PlayerPrefs/JSON/string methods before implementing persisted local profiles."""
from pathlib import Path
import json,struct,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-local-storage-bindings.json';assert not out.exists()
source=(b/'direct_smash_local_bootstrap_contract_v2_20261118.py').read_text(encoding='utf8').split("original=json.loads")[0]
ns={'__file__':str(b/'direct_smash_local_bootstrap_contract_v2_20261118.py')};exec(compile(source,'read-native-data-contract-tables-only','exec'),ns)
n=ns['ns'];meta=n['meta'];memory=n['memory']
# The signature reader's nested parser has the original element table.
table=n['ns']['table'];st=n['st'];ss=n['ss'];tt=n['tt'];ts=n['ts'];mt=n['mt'];it,isz=struct.unpack_from('<II',meta,168);pt,ps=struct.unpack_from('<II',meta,88);ft,fs=struct.unpack_from('<II',meta,96)
string=n['string'];rd=lambda p:struct.unpack_from('<I',memory,p)[0]
def resolve_index(i):return ns['resolve'](rd(n['type_ptr']+4*i))
images=[]
for p in range(it,it+isz,40):
    first,count=struct.unpack_from('<iI',meta,p+8);images.append((first,first+count,string(struct.unpack_from('<I',meta,p)[0])))
wanted={('UnityEngine','PlayerPrefs'):{'GetString','SetString','Save','HasKey'},('System','Guid'):{'NewGuid','ToString'},('System','String'):{'.ctor','Ctor','CreateString'},('Newtonsoft.Json','JsonConvert'):{'SerializeObject','DeserializeObject'}}
user_fields=[];extra_types=set()
gate=json.loads((a/'local-bootstrap-service-gates.json').read_bytes());user=next(x for x in gate['generic_references']if x['generic_type_name']=='UserService')
for row in user['declared_fields']:
    if row['native_offset']not in[12,16,32,36,68,72,76,104]:continue
    info=resolve_index(struct.unpack_from('<i',meta,ft+12*row['field_index']+4)[0]);user_fields.append({'name':row['name'],'native_offset':row['native_offset'],'type':info})
    if row['native_offset']==104 and info['type_code']==18:extra_types.add(info['type_definition_index'])
rows=[]
for ti in range(ts//88):
    off=tt+88*ti;name=string(struct.unpack_from('<I',meta,off)[0]);namespace=string(struct.unpack_from('<I',meta,off+4)[0]);key=(namespace,name)
    if key not in wanted and ti not in extra_types:continue
    image=next(name for first,last,name in images if first<=ti<last);start=struct.unpack_from('<i',meta,off+36)[0];count=struct.unpack_from('<H',meta,off+64)[0]
    for mi in range(start,start+count):
        p=mt+36*mi;method=string(struct.unpack_from('<I',meta,p)[0])
        if key in wanted and method not in wanted[key]:continue
        flags=struct.unpack_from('<H',meta,p+28)[0];count=struct.unpack_from('<H',meta,p+34)[0];first=struct.unpack_from('<i',meta,p+16)[0];params=[]
        for j in range(first,first+count):
            q=pt+j*12;assert pt<=q<q+12<=pt+ps;ni,token,index=struct.unpack_from('<III',meta,q);params.append({'name':string(ni),'type_index':index,'type':resolve_index(index)})
        rows.append({'type_index':ti,'namespace':namespace,'class':name,'image':image,'method':method,'method_index':mi,'token':struct.unpack_from('<I',meta,p+24)[0],'flags':flags,'static':bool(flags&16),'parameters':params,'return_type':resolve_index(struct.unpack_from('<i',meta,p+8)[0])})
modules={}
for image in sorted({x['image']for x in rows}):
    candidates=[];pos=0
    while True:
        pos=memory.find(image.encode()+b'\0',pos)
        if pos<0:break
        loc=0
        while True:
            loc=memory.find(struct.pack('<I',pos),loc)
            if loc<0:break
            if loc%4==0 and loc+12<=len(memory):
                count,ptr=struct.unpack_from('<II',memory,loc+4)
                if 0<count<200000 and ptr%4==0 and 0<ptr<ptr+count*4<=len(memory):
                    values=struct.unpack_from('<'+'I'*count,memory,ptr)
                    if all(v==0 or v in table for v in values):candidates.append({'address':loc,'count':count,'pointer':ptr,'values':values})
            loc+=1
        pos+=len(image)+1
    assert len(candidates)==1,(image,len(candidates));modules[image]=candidates[0]
for row in rows:
    module=modules[row['image']];index=(row['token']&0xffffff)-1;assert 0<=index<module['count'];pointer=module['values'][index];row.update(table_index=pointer,function_index=table[pointer]if pointer else None)
assert any(x['class']=='PlayerPrefs'and x['method']=='SetString'and x['function_index']for x in rows)
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'network_requests_made':0,'original_wasm_sha256':hashlib.sha256(n['ns']['raw']).hexdigest(),'metadata_sha256':hashlib.sha256(meta).hexdigest(),'user_fields':user_fields,'methods':rows,'modules':{k:{n:v for n,v in x.items()if n!='values'}for k,x in modules.items()},'limitations':['Metadata-to-module-to-table bindings only; no methods executed, no profile changes or readiness assignment.','Unmapped generic methods remain explicit null and require their actual MethodInfo/generic instantiation before use.','A persistence implementation must preserve native profile defaults, report parse/write failures and use a separate local identity, without authenticating as a remote user.']}
out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps({'methods':len(rows),'fields':user_fields,'selected':[{k:x[k]for k in['class','method','function_index']}|{'parameters':[p['type']['name']for p in x['parameters']]}for x in rows if x['class']=='PlayerPrefs'],'source_only':True,'game_executed':False},ensure_ascii=False))
