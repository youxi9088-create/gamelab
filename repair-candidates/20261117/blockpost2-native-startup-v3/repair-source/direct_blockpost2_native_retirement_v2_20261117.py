"""Retire two proven startup consumers, not SDK state or license checks."""
from pathlib import Path
import sys,json,struct,hashlib,subprocess,re,shutil
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';source=r/'work-native-local-v1';target=r/'work-native-local-v2';analysis=r/'analysis-20261117';metadata=json.loads((analysis/'native-sdk-wasm-map.json').read_text());native=r/'native-build-20261117/bpm2.wasm.unityweb';original=native.read_bytes();assert hashlib.sha256(original).hexdigest()==metadata['original_wasm_sha256']=='0701b526a23164c9f29bf9ffd691e0f17dee0312ca8cb7dcd7f367fe08546f6d'
def leb(data,pos):
 n=shift=0
 while True:
  byte=data[pos];pos+=1;n|=(byte&127)<<shift;shift+=7
  if not byte&128:return n,pos
  assert shift<=35
def uleb(n):
 out=bytearray()
 while True:
  byte=n&127;n>>=7;out.append(byte|(128 if n else 0))
  if not n:return bytes(out)
def index(data):
 sections=[];p=8
 while p<len(data):
  begin=p;kind=data[p];size,p=leb(data,p+1);sections.append({'kind':kind,'begin':begin,'start':p,'end':p+size});p+=size
 code=next(s for s in sections if s['kind']==10);count,p=leb(data,code['start']);bodies=[]
 for i in range(count):
  size,p=leb(data,p);bodies.append((p,size));p+=size
 assert p==code['end'];return sections,bodies
sections,bodies=index(original);named=(analysis/'sdk-code-named-NOT-RUNTIME.wasm').read_bytes();_,slice_bodies=index(named);imports=metadata['function_imports'];fn=92855;start,length=bodies[fn-imports];slice_start,slice_length=slice_bodies[fn-imports];assert original[start:start+length]==named[slice_start:slice_start+slice_length]
# Confirm the exact instructions with an independent disassembler before patching.
cmd=['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'),'-d',str(analysis/'sdk-code-named-NOT-RUNTIME.wasm')];proc=subprocess.Popen(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf8');inside=False;lines=[]
for line in proc.stdout:
 if re.search(r'func\[\d+\]',line):inside=bool(re.search(r'func\[92855\]',line))
 if inside:lines.append(line.rstrip())
stderr=proc.stderr.read();assert proc.wait()==0,stderr;(analysis/'bootstrap-92855-disassembly.txt').write_text('\n'.join(lines),encoding='utf8');patches=[]
for callee in [47466,56621]:
 matches=[line for line in lines if re.search(r'\|\s*call '+str(callee)+r'\b',line)];assert len(matches)==1,(callee,matches);line=matches[0];position=int(re.match(r'\s*([0-9a-f]+):',line)[1],16);relative=position-slice_start;expected=b'\x10'+uleb(callee);assert original[start+relative:start+relative+len(expected)]==expected
 patches.append({'relative_offset':relative,'callee':callee,'original':expected.hex(),'replacement':'1a1a','reason':'Native startup master-server connection retired'if callee==47466 else'Actual repeated native SDK initialization consumer retired'})
# Both mapped signatures have exactly two i32 parameters and no results.
type_section=next(s for s in sections if s['kind']==1);count,p=leb(original,type_section['start']);types=[]
for _ in range(count):
 assert original[p]==0x60;params,p=leb(original,p+1);args=original[p:p+params];p+=params;results,p=leb(original,p);ret=original[p:p+results];p+=results;types.append((args,ret))
function_section=next(s for s in sections if s['kind']==3);count,p=leb(original,function_section['start']);function_types=[]
for _ in range(count):t,p=leb(original,p);function_types.append(t)
for callee in [47466,56621]:assert types[function_types[callee-imports]]==(b'\x7f\x7f',b'')
body=original[start:start+length]
for patch in sorted(patches,key=lambda p:p['relative_offset'],reverse=True):
 off=patch['relative_offset'];old=bytes.fromhex(patch['original']);body=body[:off]+bytes.fromhex(patch['replacement'])+body[off+len(old):]
payload=bytearray(uleb(len(bodies)))
for i,(off,size)in enumerate(bodies):
 value=body if i+imports==fn else original[off:off+size];payload.extend(uleb(len(value)));payload.extend(value)
result=bytearray(original[:8])
for section in sections:
 if section['kind']==10:result.append(10);result.extend(uleb(len(payload)));result.extend(payload)
 else:result.extend(original[section['begin']:section['end']])
assert not target.exists(),'Preserve immutable v2 candidate; inspect before rerunning mutation';shutil.copytree(source,target);(target/'Build/bpm2.wasm.unityweb').write_bytes(result);new_sections,new_bodies=index(result);assert len(bodies)==len(new_bodies);changed=[]
for i,((a,n),(c,m))in enumerate(zip(bodies,new_bodies)):
 if original[a:a+n]!=result[c:c+m]:changed.append(i+imports)
assert changed==[fn]
sys.path.insert(0,str(b/'synty-python'));import UnityPy
data=(r/'native-build-20261117/bpm2.data.unityweb').read_bytes();signature=b'UnityWebData1.0\0';assert data.startswith(signature);header=struct.unpack_from('<I',data,len(signature))[0];p=len(signature)+4;members=[]
while p<header:
 off,size,n=struct.unpack_from('<III',data,p);p+=12;name=data[p:p+n].decode();p+=n;assert header<=off<off+size<=len(data);members.append((name,data[off:off+size]))
assert p==header;env=UnityPy.load(next(value for name,value in members if name=='data.unity3d'));before={(o.assets_file.name,o.path_id):(o.type.name,hashlib.sha256(o.get_raw_data()).hexdigest())for o in env.objects};settings=next(o for o in env.objects if o.type.name=='UnityConnectSettings');tree=settings.read_typetree();assert tree['m_Enabled']and tree['UnityAnalyticsSettings']['m_Enabled']and tree['UnityAnalyticsSettings']['m_InitializeOnStartup'];tree['m_Enabled']=False;tree['UnityAnalyticsSettings']['m_Enabled']=False;tree['UnityAnalyticsSettings']['m_InitializeOnStartup']=False;settings.save_typetree(tree);unity_data=env.file.save(packer='original');again=UnityPy.load(unity_data);after={(o.assets_file.name,o.path_id):(o.type.name,hashlib.sha256(o.get_raw_data()).hexdigest())for o in again.objects};assert before.keys()==after.keys();changed_objects=[{'file':k[0],'path_id':k[1],'type':before[k][0],'before':before[k][1],'after':after[k][1]}for k in before if before[k]!=after[k]];assert len(changed_objects)==1 and changed_objects[0]['type']=='UnityConnectSettings';check=next(o for o in again.objects if o.type.name=='UnityConnectSettings').read_typetree();assert check==tree
new_members=[(name,unity_data if name=='data.unity3d'else value)for name,value in members];new_header=len(signature)+4+sum(12+len(name.encode())for name,value in new_members);offset=new_header;head=bytearray(signature+struct.pack('<I',new_header));content=bytearray()
for name,value in new_members:
 name_bytes=name.encode();head.extend(struct.pack('<III',offset,len(value),len(name_bytes)));head.extend(name_bytes);content.extend(value);offset+=len(value)
assert len(head)==new_header;new_data=bytes(head+content);(target/'Build/bpm2.data.unityweb').write_bytes(new_data)
proof={'at':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat(),'original_wasm_sha256':hashlib.sha256(original).hexdigest(),'candidate_wasm_sha256':hashlib.sha256(result).hexdigest(),'defined_functions':len(bodies),'byte_identical_functions':len(bodies)-1,'changed_functions':changed,'retired_calls':patches,'function_signatures_verified':True,'all_noncode_sections_preserved':True,'original_data_sha256':hashlib.sha256(data).hexdigest(),'candidate_data_sha256':hashlib.sha256(new_data).hexdigest(),'original_unity_object_count':len(before),'unchanged_unity_objects':len(before)-1,'changed_unity_objects':changed_objects,'unchanged_native_members':[{'name':n,'sha256':hashlib.sha256(v).hexdigest()}for n,v in new_members if n!='data.unity3d'],'scope':'Only two void calls in proven native startup coroutine plus three original Unity Analytics settings flags. No SDK ready flag, account, server response, source domain, license or gameplay/level/AI field changed. Original v1 and original build retained; new v2 unverified.'};(target/'evidence/native-startup-retirement-v2.json').write_text(json.dumps(proof,indent=2),encoding='utf8');print(json.dumps({k:proof[k]for k in ['defined_functions','byte_identical_functions','changed_functions','original_unity_object_count','unchanged_unity_objects','candidate_wasm_sha256','candidate_data_sha256']}))
