"""Map the original Addressables runtime path declarations without executing the game."""
from pathlib import Path
import struct,json,hashlib,contextlib,io,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261117';d=r/'analysis-20261118/streaming-assets-input';assert not d.exists();d.mkdir()
raw=(a/'metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes();assert hashlib.sha256(raw).hexdigest()=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
st,ss=struct.unpack_from('<II',raw,24);tt,ts=struct.unpack_from('<II',raw,160);mt,ms=struct.unpack_from('<II',raw,48);it,isz=struct.unpack_from('<II',raw,168);lt,ls=struct.unpack_from('<II',raw,8);ld,lds=struct.unpack_from('<II',raw,16)
def string(i):
 assert 0<=i<ss
 return raw[st+i:raw.index(0,st+i,st+ss)].decode('utf8')
sources=[];literals=[]
for n in range(ls//8):
 size,offset=struct.unpack_from('<II',raw,lt+n*8);value=raw[ld+offset:ld+offset+size]
 if any(x in value for x in [b'settings.json',b'/aa/',b'/aa',b'catalog.json']):
  literals.append({'index':n,'bytes':size,'value':value.decode('utf8')})
image=next(p for p in range(it,it+isz,40)if string(struct.unpack_from('<I',raw,p)[0])=='Unity.Addressables.dll');first,count=struct.unpack_from('<iI',raw,image+8)
for ti in range(first,first+count):
 off=tt+88*ti;name=string(struct.unpack_from('<I',raw,off)[0]);ns=string(struct.unpack_from('<I',raw,off+4)[0]);start=struct.unpack_from('<i',raw,off+36)[0];n=struct.unpack_from('<H',raw,off+64)[0]
 for mi in range(start,start+n):
  m=mt+36*mi;name_method=string(struct.unpack_from('<I',raw,m)[0])
  if not any(x in name_method for x in ['RuntimePath','RuntimeDataPath','InitializeAsync']):continue
  token=struct.unpack_from('<I',raw,m+24)[0];flags=struct.unpack_from('<H',raw,m+28)[0];params=struct.unpack_from('<H',raw,m+34)[0]
  sources.append({'type_index':ti,'class':name,'namespace':ns,'method':name_method,'method_index':mi,'token':token,'flags':flags,'parameter_count':params,'image':'Unity.Addressables.dll'})
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');source=source[:source.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'source-only-addressables-read.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'source-only-addressables-read','exec'),ns)
memory=ns['memory'];table=ns['table'];image_name='Unity.Addressables.dll';pos=0;candidates=[]
while True:
 pos=memory.find(image_name.encode()+b'\0',pos)
 if pos<0:break
 pointer=struct.pack('<I',pos);location=0
 while True:
  location=memory.find(pointer,location)
  if location<0:break
  if location%4==0 and location+12<=len(memory):
   n,p=struct.unpack_from('<II',memory,location+4)
   if 0<n<200000 and p%4==0 and 0<p<p+n*4<=len(memory):
    values=struct.unpack_from('<'+'I'*n,memory,p)
    if all(x==0 or x in table for x in values):candidates.append({'address':location,'count':n,'pointer':p,'values':values})
  location+=1
 pos+=len(image_name)+1
assert len(candidates)==1;module=candidates[0]
for row in sources:
 token=(row['token']&0xffffff)-1;pointer=module['values'][token];row.update(table_index=pointer,function_index=table[pointer]if pointer else None)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'metadata_sha256':hashlib.sha256(raw).hexdigest(),'wasm_sha256':hashlib.sha256(ns['raw']).hexdigest(),'original_module':{k:v for k,v in module.items()if k!='values'},'methods':sources,'original_path_literals':literals,'limitations':['Declarations and literal strings alone are not proof of a requested file; inspect original method bodies before acquisition','No SDK initialization, game execution or network request']}
(d/'path-declarations.json').write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode())
print(json.dumps(out,ensure_ascii=False))
