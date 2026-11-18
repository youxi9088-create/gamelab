"""Static token -> module pointer -> Wasm table mapping; never execute game."""
from pathlib import Path
import struct,json,hashlib
r=Path(__file__).parent/'msn-capture-100/source-analysis/gunship';raw=(r.parent.parent/'msn-en-us/originals/9nvh11mzqtwq/Build/Build.wasm').read_bytes();assert raw[:8]==b'\0asm\1\0\0\0'
def leb(data,pos,signed=False):
 value=shift=0
 while True:
  byte=data[pos];pos+=1;value|=(byte&127)<<shift;shift+=7
  if not byte&128:break
  assert shift<=35
 if signed and byte&64:value-=1<<shift
 return value,pos
def uleb(value):
 out=bytearray()
 while True:
  byte=value&127;value>>=7;out.append(byte|(128 if value else 0))
  if not value:return bytes(out)
def string(pos):
 n,pos=leb(raw,pos);return raw[pos:pos+n].decode(),pos+n
sections=[];pos=8
while pos<len(raw):
 begin=pos;kind=raw[pos];size,pos=leb(raw,pos+1);end=pos+size;assert end<=len(raw);sections.append({'kind':kind,'begin':begin,'start':pos,'end':end});pos=end
imports=next(s for s in sections if s['kind']==2);count,pos=leb(raw,imports['start']);import_rows=[]
for index in range(count):
 module,pos=string(pos);name,pos=string(pos);kind=raw[pos];pos+=1;assert kind==0;typ,pos=leb(raw,pos);import_rows.append({'index':index,'module':module,'name':name,'type':typ})
assert pos==imports['end'];function_imports=len(import_rows)
data_section=next(s for s in sections if s['kind']==11);count,pos=leb(raw,data_section['start']);segments=[]
for _ in range(count):
 flags,pos=leb(raw,pos);assert flags==0 and raw[pos]==0x41;address,pos=leb(raw,pos+1,True);assert raw[pos]==0x0b;size,pos=leb(raw,pos+1);segments.append((address,raw[pos:pos+size]));pos+=size
assert pos==data_section['end'];memory=bytearray(max(a+len(d)for a,d in segments));assert len(memory)<128000000
for address,data in segments:memory[address:address+len(data)]=data
element=next(s for s in sections if s['kind']==9);count,pos=leb(raw,element['start']);table={}
for _ in range(count):
 flags,pos=leb(raw,pos);assert flags==0 and raw[pos]==0x41;start,pos=leb(raw,pos+1,True);assert raw[pos]==0x0b;num,pos=leb(raw,pos+1)
 for i in range(num):fn,pos=leb(raw,pos);table[start+i]=fn
assert pos==element['end']
types=json.loads((r/'native-all-game-classes.json').read_text())['types'];modules={}
for image in set(t['image']for t in types):
 pattern=image.encode()+b'\0';names=[];off=0
 while True:
  off=memory.find(pattern,off)
  if off<0:break
  names.append(off);off+=len(pattern)
 candidates=[]
 for address in names:
  pattern=struct.pack('<I',address);off=0
  while True:
   off=memory.find(pattern,off)
   if off<0:break
   if off%4==0 and off+12<len(memory):
    _,number,ptr=struct.unpack_from('<III',memory,off)
    if 0<number<200000 and ptr%4==0 and 0<ptr<ptr+number*4<=len(memory):
     values=struct.unpack_from('<'+'I'*number,memory,ptr)
     if all(v==0 or v in table for v in values):candidates.append({'address':off,'name_address':address,'method_count':number,'pointers_address':ptr,'values':values})
   off+=1
 assert len(candidates)==1,(image,[{k:v for k,v in c.items()if k!='values'}for c in candidates]);modules[image]=candidates[0]
mapped=[]
for typ in types:
 for m in typ['methods']:
  module=modules[typ['image']];index=(m['token']&0xffffff)-1;assert 0<=index<module['method_count'];pointer=module['values'][index]
  if not pointer:continue
  mapped.append({'class':typ['name'],'image':typ['image'],**m,'table_index':pointer,'function_index':table[pointer]})

service_classes={'SDKManager','SaveManager','Boot','AdPanel','SummaryRewardClaim','DailyRewardPanel','DailyRewardService','ExtraCash'}
selected={m['function_index']for m in mapped if m['class']in service_classes}
selected.update(m['function_index']for m in mapped if m['class']in {'NetworkService','LoadingController','RemoteConfigABtests','ProfileService','DataStore'} or any(k in m['class'] for k in ['LoadingScenes','PostTryEnableOnlineMode','TryEnableOnlineMode','WaitForOnlineMode']))
selected.update(m['function_index']for m in mapped if m['class']=='SoundController'and m['name']=='ToggleSound')
abi=json.loads((r/'framework-original-platform-bindings.json').read_text(encoding='utf-8'))
service_imports={row['index']:binding['original']for binding in abi['bindings']for row in import_rows if row['name']==binding['key']}
assert len(service_imports)==5
also={'GameController':{'Awake','Init','LoadAssests','BeginGame','LoadUI'},'PlayerController':{'PostTryEnableOnlineMode','LoadAllConfigs','Start'},'NetworkService':{'Awake','Start','Init'},'CampaignService':{'Awake','Start','Init'},'LoadingController':{'Awake','Start','Init'}}
selected.update(m['function_index']for m in mapped if m['name']in also.get(m['class'],set()))
service_targets={m['function_index']:m['class']+'.'+m['name']for m in mapped if m['class']in service_classes}
patterns={fn:b'\x10'+uleb(fn)for fn in service_targets};hints=[]
# Short import-call byte patterns occur inside unrelated immediates. Use the
# independent instruction-level stream audit for import consumers instead.
actual_calls=r/'all-actual-sdk-import-consumers.json'
if actual_calls.exists():selected.update(x['function_index']for x in json.loads(actual_calls.read_text(encoding='utf-8'))['direct_call_instructions'])
code=next(s for s in sections if s['kind']==10);count,pos=leb(raw,code['start']);payload=bytearray(uleb(count));bodies=[];body_data=[]
for index in range(count):
 length,pos=leb(raw,pos);start=pos;body=raw[start:start+length];fn=function_imports+index
 hits=[service_targets.get(t,service_imports.get(t))for t,p in patterns.items()if p in body]
 if hits:hints.append({'function_index':fn,'targets':hits,'aliases':[{'class':m['class'],'method':m['name']}for m in mapped if m['function_index']==fn]});selected.add(fn)
 bodies.append({'function_index':fn,'file_offset':start,'bytes':length,'sha256':hashlib.sha256(body).hexdigest()});body_data.append((fn,body));pos+=length
assert pos==code['end'] and len(selected)<400
for fn,body in body_data:
 chosen=body if fn in selected else b'\0\0\x0b';payload.extend(uleb(len(chosen)));payload.extend(chosen)
result=bytearray(raw[:8])
for section in sections:
 if section['kind']==10:result.append(10);result.extend(uleb(len(payload)));result.extend(payload)
 else:result.extend(raw[section['begin']:section['end']])
(r/'sdk-code-slice-NOT-RUNTIME.wasm').write_bytes(result)
out={'source_only':True,'original_wasm_sha256':hashlib.sha256(raw).hexdigest(),'function_imports':function_imports,'defined_functions':count,'mapped_methods':mapped,'selected_function_indices':sorted(selected),'selected_bodies':[x for x in bodies if x['function_index']in selected],'service_call_byte_hints':hints,'imports':import_rows,'note':'Metadata tokens -> original module method pointers -> original element table. Byte hints require actual disassembly before edits. Slice is not a runtime and never executed.'}
(r/'native-sdk-wasm-map.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print(json.dumps({'mapped_methods':len(mapped),'imports':function_imports,'defined_functions':count,'selected':len(selected),'consumer_hints':len(hints),'source_only':True}))
