"""Map original offline-room lifecycle declarations and native bodies; never execute game code."""
from pathlib import Path
import json,struct,hashlib,datetime,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118'
out=a/'native-offline-lifecycle-contract.json';assert not out.exists()
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8')
src=src[src.index('src=(b/'):src.index('gate=json.loads')]
n={'b':b,'r':r,'a':a,'json':json,'struct':struct,'hashlib':hashlib}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'original-static-tables-only','exec'),n)
meta=n['meta'];memory=n['memory'];rd=n['rd'];string=n['string'];tt=n['tt'];mt=n['mt'];pt=n['pt'];table=n['n']['ns']['table'];resolve=n['resolve'];type_ptr=n['type_ptr']
it,isize=struct.unpack_from('<II',meta,168);images={}
for j in range(isize//40):
 p=it+j*40;name=string(rd0:=struct.unpack_from('<I',meta,p)[0]);first,count=struct.unpack_from('<ii',meta,p+8)
 for i in range(first,first+count):images[i]=name
selected={'PhotonNetwork','PhotonConnectionManager','Room','RoomOptions','Player','LoadBalancingClient','LoadBalancingPeer','ServerSettings','GameStartScreen','GameManager'}
types=[]
for i in range(struct.unpack_from('<I',meta,164)[0]//88):
 p=tt+88*i;name=string(struct.unpack_from('<I',meta,p)[0])
 if name in selected:types.append({'index':i,'name':name,'namespace':string(struct.unpack_from('<I',meta,p+4)[0]),'image':images.get(i)})
modules={}
for image in set(t['image']for t in types):
 assert image;names=[];off=0;needle=image.encode()+b'\0'
 while True:
  off=memory.find(needle,off)
  if off<0:break
  names.append(off);off+=len(needle)
 candidates=[]
 for address in names:
  off=0;needle=struct.pack('<I',address)
  while True:
   off=memory.find(needle,off)
   if off<0:break
   if off%4==0 and off+12<=len(memory):
    _,count,ptr=struct.unpack_from('<III',memory,off)
    if 0<count<200000 and ptr%4==0 and 0<ptr<ptr+count*4<=len(memory):
     values=struct.unpack_from('<'+'I'*count,memory,ptr)
     if all(v==0 or v in table for v in values):candidates.append({'address':off,'count':count,'ptr':ptr,'values':values})
   off+=1
 assert len(candidates)==1,(image,len(candidates));modules[image]=candidates[0]
methods=[]
for t in types:
 p=tt+88*t['index'];first=struct.unpack_from('<i',meta,p+36)[0];count=struct.unpack_from('<H',meta,p+64)[0]
 t['fields']=n['field_rows'](t['index'])
 for i in range(first,first+count):
  p=mt+36*i;name,decl,ret=struct.unpack_from('<Iii',meta,p);assert decl==t['index'];token=struct.unpack_from('<I',meta,p+24)[0];flags=struct.unpack_from('<H',meta,p+28)[0];index=(token&0xffffff)-1;module=modules[t['image']];assert 0<=index<module['count'];ptr=module['values'][index]
  start=struct.unpack_from('<i',meta,p+16)[0];amount=struct.unpack_from('<H',meta,p+34)[0];params=[]
  for j in range(start,start+amount):
   pn,_,typ=struct.unpack_from('<III',meta,pt+12*j);params.append({'name':string(pn),'type':resolve(rd(type_ptr+4*typ))})
  methods.append({'class':t['name'],'namespace':t['namespace'],'method':string(name),'method_index':i,'token':token,'static':bool(flags&16),'flags':flags,'function_index':table.get(ptr)if ptr else None,'table_index':ptr,'parameters':params,'return_type':resolve(rd(type_ptr+4*ret))})
proof=json.loads((a/'native-offline-connection-lifecycle/original-settings-constant-source.json').read_bytes())
assert proof['source_only']and not proof['game_executed'];selected_sources={x['function_index']:x for x in proof['original_source_snippets']}
for fn in[7186,17293,41676]:assert any(x['function_index']==fn for x in methods),fn
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':proof['original_wasm_sha256'],'metadata_sha256':hashlib.sha256(meta).hexdigest(),'types':types,'methods':methods,'original_source_proof':proof,'limitations':['Static source mapping only; no original functions run or compiled.','Photon offline mode is an original local transport mode, not provider authentication or a server response.','Setting an offline flag alone does not prove room creation, original player spawn, bots or gameplay.','Do not call online auth setters with fabricated server credentials; use real local identity and native lifecycle only after exact API/consumer evidence.']}
out.write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode())
print(json.dumps({'source_only':True,'game_executed':False,'types':[(x['name'],x['namespace'],x['image'])for x in types],'methods':len(methods),'offline_original_methods':[{'class':x['class'],'method':x['method'],'function_index':x['function_index']}for x in methods if x['function_index']in[7186,17293,41676]]},ensure_ascii=False))
