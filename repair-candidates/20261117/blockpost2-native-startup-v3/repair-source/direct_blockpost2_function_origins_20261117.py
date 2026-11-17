from pathlib import Path
import struct,json
b=Path(__file__).parent;p=b/'direct_blockpost2_wasm_method_map_20261117.py';namespace={'__file__':str(p.resolve())};source=p.read_text(encoding='utf8');exec(compile(source[:source.index('types=json.loads')],str(p),'exec'),namespace);r=namespace['r'];memory=namespace['memory'];table=namespace['table'];mapping=json.loads((r/'analysis-20261117/native-sdk-wasm-map.json').read_text());wanted={92855,13621};target_tables={f:{i for i,v in table.items()if v==f}for f in wanted};tokens={}
for image,module in mapping['modules'].items():
 values=struct.unpack_from('<'+'I'*module['method_count'],memory,module['pointers_address'])
 for function,indices in target_tables.items():
  for index,value in enumerate(values):
   if value in indices:tokens[(image,0x06000000+index+1)]=function
raw=next((r/'native-unpacked-20261117').rglob('global-metadata.dat')).read_bytes();strings,ssize=struct.unpack_from('<II',raw,24);types,tsize=struct.unpack_from('<II',raw,160);methods,msize=struct.unpack_from('<II',raw,48);images,isize=struct.unpack_from('<II',raw,168)
def string(i):
 assert 0<=i<ssize;return raw[strings+i:raw.index(0,strings+i,strings+ssize)].decode()
def type_name(index):
 o=types+index*88;return string(struct.unpack_from('<I',raw,o)[0])
def image_for(index):
 for o in range(images,images+isize,40):
  n,a,t,c=struct.unpack_from('<IiiI',raw,o)
  if t<=index<t+c:return string(n)
rows=[]
for index in range(msize//36):
 o=methods+index*36;n,decl=struct.unpack_from('<Ii',raw,o);token=struct.unpack_from('<I',raw,o+24)[0];image=image_for(decl);fn=tokens.get((image,token))
 if fn is not None:rows.append({'function_index':fn,'method_index':index,'class':type_name(decl),'method':string(n),'image':image,'token':token,'declaring_type':decl})
globals_=[]
for address in [3320168,3321716,3320236]:
 value=struct.unpack_from('<I',memory,address)[0];byval=(value&0x1fffffff)>>1;matches=[]
 for index in range(tsize//88):
  o=types+index*88
  if struct.unpack_from('<i',raw,o+8)[0]==byval:matches.append({'type_index':index,'name':type_name(index)})
 globals_.append({'address':address,'encoded':hex(value),'byval_index':byval,'matches':matches})
out={'source_only':True,'mapped_functions':rows,'type_reference_checks':globals_};(r/'analysis-20261117/bootstrap-function-origins.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
