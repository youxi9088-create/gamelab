"""Static IL2CPP v39 table reader; no managed/native/SDK code execution.

Layout reference: SamboyCoding/Cpp2IL development LibCpp2IL/Metadata/
Il2Cpp{GlobalMetadataHeader,TypeDefinition,MethodDefinition,ImageDefinition,Metadata}.cs.
Widths are derived from actual section counts and interface-offset record size.
Every owner, range, token and fixed record boundary is checked against this file.
"""
from pathlib import Path
import struct,json,hashlib
b=Path(__file__).parent/'msn-capture-100/source-analysis/gunship';raw=(b/'unpacked/Il2CppData/Metadata/global-metadata.dat').read_bytes()
assert struct.unpack_from('<II',raw)==(0xFAB11BAF,39)
names='stringLiteral stringLiteralData string events properties methods parameterDefaultValues fieldDefaultValues fieldAndParameterDefaultValueData fieldMarshaledSizes parameters fields genericParameters genericParameterConstraints genericContainers nestedTypes interfaces vtableMethods interfaceOffsets typeDefinitions images assemblies fieldRefs referencedAssemblies attributeData attributeDataRange unresolvedVirtualCallParameterTypes unresolvedVirtualCallParameterRanges windowsRuntimeTypeNames windowsRuntimeStrings exportedTypeDefinitions'.split()
sections={name:dict(zip(['offset','size','count'],struct.unpack_from('<III',raw,8+i*12))) for i,name in enumerate(names)}
assert 8+12*len(names)==sections['stringLiteral']['offset']==380
for v in sections.values():assert 380<=v['offset']<=v['offset']+v['size']<=len(raw) or v['offset']==v['size']==v['count']==0
def width(count):return 1 if count<=255 else 2 if count<=65535 else 4
def size(name):
 v=sections[name];assert v['count'] and v['size']%v['count']==0;return v['size']//v['count']
tw=width(sections['typeDefinitions']['count']);gw=width(sections['genericContainers']['count']);pw=width(sections['parameters']['count']);bw=size('interfaceOffsets')-4
assert (tw,gw,pw,bw)==(2,2,2,2)
def text(index):
 v=sections['string'];assert 0<=index<v['size'];p=v['offset']+index;end=raw.index(0,p,v['offset']+v['size']);return raw[p:end].decode('utf8')
def fmt_index(w):return {1:'B',2:'H',4:'I'}[w]
type_fmt='<II'+fmt_index(bw)*3+fmt_index(gw)+'I'+'I'*8+'H'*8+'II'
method_fmt='<I'+fmt_index(tw)+fmt_index(bw)+'I'+fmt_index(pw)+fmt_index(gw)+'IHHHH'
field_fmt='<I'+fmt_index(bw)+'I'
image_fmt='<II'+fmt_index(tw)+'I'+fmt_index(tw)+'IIIII'
for name,fmt in [('typeDefinitions',type_fmt),('methods',method_fmt),('fields',field_fmt),('images',image_fmt)]:assert struct.calcsize(fmt)==size(name),(name,struct.calcsize(fmt),size(name))
images=[]
for i in range(sections['images']['count']):
 a=struct.unpack_from(image_fmt,raw,sections['images']['offset']+i*size('images'));name,assembly,start,count=a[:4]
 assert 0<=start<=start+count<=sections['typeDefinitions']['count'];images.append({'name':text(name),'start':start,'count':count,'token':a[7]})
rows=[];all_types=[];all_methods=0;all_fields=0
for i in range(sections['typeDefinitions']['count']):
 a=struct.unpack_from(type_fmt,raw,sections['typeDefinitions']['offset']+i*size('typeDefinitions'))
 ni,nsi=a[:2];fs,ms=a[7:9];mc,pc,fc=a[15:18];tok=a[-1];assert tok>>24==2
 image=next(im['name'] for im in images if im['start']<=i<im['start']+im['count']);name=text(ni);ns=text(nsi)
 row={'type_index':i,'name':name,'namespace':ns,'token':tok,'image':image,'methods':[],'fields':[]}
 assert mc==0 or 0<=ms<=ms+mc<=sections['methods']['count'];assert fc==0 or 0<=fs<=fs+fc<=sections['fields']['count']
 for j in range(ms,ms+mc):
  v=struct.unpack_from(method_fmt,raw,sections['methods']['offset']+j*size('methods'));mi,owner,rt,rpt,pa,gen,token,flags,iflags,slot,params=v
  assert owner==i and token>>24==6,(i,j,owner,token)
  assert params==0 or pa+params<=sections['parameters']['count']
  row['methods'].append({'name':text(mi),'method_index':j,'token':token,'parameter_count':params,'flags':flags,'slot':slot,'return_type_index':rt});all_methods+=1
 for j in range(fs,fs+fc):
  fi,ft,token=struct.unpack_from(field_fmt,raw,sections['fields']['offset']+j*size('fields'));assert token>>24==4
  row['fields'].append({'name':text(fi),'type_index':ft,'token':token,'field_index':j});all_fields+=1
 all_types.append({'index':i,'name':name,'namespace':ns,'image':image})
 if image=='Assembly-CSharp.dll':rows.append(row)
assert all_methods==sections['methods']['count'] and all_fields==sections['fields']['count'],(all_methods,all_fields)
out={'source_only':True,'game_or_SDK_executed':False,'metadata_version':39,'metadata_sha256':hashlib.sha256(raw).hexdigest(),'section_headers':sections,'derived_index_widths':{'type_definition':tw,'binary_type':bw,'generic_container':gw,'parameter':pw},'record_sizes':{'type':size('typeDefinitions'),'method':size('methods'),'field':size('fields'),'image':size('images')},'all_types_validated':len(all_types),'all_methods_owner_and_token_validated':all_methods,'all_fields_token_validated':all_fields,'images':images,'types':rows,'game_type_names':[r for r in all_types if r['image']=='Assembly-CSharp.dll'],'primary_layout_reference':'https://github.com/SamboyCoding/Cpp2IL/tree/development/LibCpp2IL/Metadata'}
(b/'native-all-game-classes.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
service={r['name']:{'methods':[m['name'] for m in r['methods']],'fields':[f['name'] for f in r['fields']]} for r in rows if any(s in r['name'] for s in ['SDK','Save','Cloud','Ad','Load','Boot'])}
print(json.dumps({'game_types':len(rows),'all_methods':all_methods,'all_fields':all_fields,'service_types':service},ensure_ascii=False)[:14000])
