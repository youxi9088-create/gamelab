"""Bind the actual profile write consumers and original event timing; no game execution."""
from pathlib import Path
import json,struct,hashlib,contextlib,io,datetime,re
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-profile-write-consumer-contract.json';assert not out.exists()
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('gate=json.loads')]
n={'b':b,'r':r,'a':a,'json':json,'struct':struct,'hashlib':hashlib}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'original-profile-write-metadata-only','exec'),n)
meta=n['meta'];memory=n['memory'];rd=n['rd'];tt=n['tt'];mt=n['mt'];pt=n['pt'];string=n['string'];resolve=n['resolve'];type_ptr=n['type_ptr'];table=n['n']['ns']['table']
module=json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_bytes())['modules']['Assembly-CSharp.dll'];ptr=module['pointers_address'];methods=[]
for i in range(struct.unpack_from('<I',meta,164)[0]//88):
 p=tt+88*i;cls=string(struct.unpack_from('<I',meta,p)[0])
 if cls not in['UserService','FirebaseDatabaseBridge']:continue
 first=struct.unpack_from('<i',meta,p+36)[0];count=struct.unpack_from('<H',meta,p+64)[0]
 for j in range(first,first+count):
  p=mt+36*j;token=struct.unpack_from('<I',meta,p+24)[0];index=(token&0xffffff)-1;assert 0<=index<module['method_count'];slot=rd(ptr+4*index);fn=table.get(slot)
  if fn not in[1756,1679,6414,104586]:continue
  first=struct.unpack_from('<i',meta,p+16)[0];count=struct.unpack_from('<H',meta,p+34)[0];params=[]
  for k in range(first,first+count):
   name,_,typ=struct.unpack_from('<III',meta,pt+k*12);params.append({'name':string(name),'type':resolve(rd(type_ptr+typ*4))})
  methods.append({'class':cls,'method':string(struct.unpack_from('<I',meta,p)[0]),'method_index':j,'token':token,'function_index':fn,'table_index':slot,'parameters':params,'return_type':resolve(rd(type_ptr+4*struct.unpack_from('<i',meta,p+8)[0]))})
assert {x['function_index']for x in methods}=={1756,1679,6414,104586}
assert all(x['class']=='FirebaseDatabaseBridge'for x in methods if x['function_index']in[1679,6414])
assert table[3971]==104586
source=json.loads((a/'native-profile-save-cloud-boundary/original-settings-constant-source.json').read_bytes());save=next(x for x in source['original_source_snippets']if x['function_index']==1756)
assert save['source'].count('f_plb(')==save['source'].count('f_sli(')==1
assert 'a[3]:int = b;'in save['source']and'f_mnc(a[18]:int, e,'in save['source']
assert save['source'].index('f_plb(')<save['source'].index('f_mnc(a[18]:int, e,')and save['source'].index('f_sli(')<save['source'].index('f_mnc(a[18]:int, e,')
service=json.loads((a/'data-services-v2/service-original-source-proof.json').read_bytes());difference=next(x for x in service['original_source_snippets']if x['function_index']==104586)
assert all(s in difference['source']for s in['call_indirect(f, c,','a[25]','a[21]'])
raw=n['n']['ns']['raw'];secs=n['n']['ns']['sections'];leb=n['n']['ns']['leb'];s=next(x for x in secs if x['kind']==1);count,p=leb(raw,s['start']);signatures=[]
for _ in range(count):
 assert raw[p]==96;c,p=leb(raw,p+1);args=list(raw[p:p+c]);p+=c;c,p=leb(raw,p);ret=list(raw[p:p+c]);p+=c;signatures.append({'params':args,'returns':ret})
s=next(x for x in secs if x['kind']==3);count,p=leb(raw,s['start']);types=[x['type']for x in n['n']['ns']['import_rows']]
for _ in range(count):v,p=leb(raw,p);types.append(v)
bound={str(fn):signatures[types[fn]]for fn in[1756,1679,6414,2404,104586]}
for fn in[1679,6414]:assert bound[str(fn)]=={'params':[127,127,127,127,127,127,125,127],'returns':[]}
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':source['original_wasm_sha256'],'methods':methods,'native_signatures':bound,'profile_source':source,'original_diff_table_index':3971,'original_diff_source':difference,'original_local_notifications':{'owner_event_field':72,'method':2404,'metadata_use':5673040,'already_invoked_after_queueing_before_remote_success':True},'boundary':['Retire only actual1679/6414 call instructions in the local UserService save consumer1756, not Firebase providers or callback implementations.','All eight evaluated argument values, including an f32 timeout, must be consumed to keep original surrounding control flow and local mutations.','Original serialized baseline, timestamps, diff, protection fields and UnityEvent<bool> notification remain original; no remote success callback is invoked.','Original local-profile adapter already saves real native profile snapshots every5seconds and on pagehide, with identity/source/checksum/CAS guards. Actual persistence and GUI still require52 runtime evidence.','This removes two proven write consumers, not all SDK/remote paths; no complete-offline or delivery claim.']}
out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'methods':[(x['class'],x['method'],x['function_index'])for x in methods],'native_signatures':bound,'diff_target':table[3971]}))
