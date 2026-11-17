"""Static native import/call/memory binding; never instantiate the game."""
from pathlib import Path
import json,struct,hashlib,subprocess,re
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';folder=r/'analysis-boundary-20261117';p=r/'original/LevelDevil.wasm';raw=p.read_bytes()
bindings=json.loads((folder/'js-import-binding.json').read_text(encoding='utf8'));byfield={x['field']:x['implementation']for x in bindings['imports']}
def uint(buf,pos,signed=False):
 n=0;s=0
 while True:
  v=buf[pos];pos+=1;n|=(v&127)<<s;s+=7
  if not v&128:
   if signed and v&64:n-=1<<s
   return n,pos
def sections():
 pos=8
 while pos<len(raw):
  k=raw[pos];size,pos=uint(raw,pos+1);yield k,pos,pos+size;pos+=size
memory=[]
for k,start,end in sections():
 if k!=11:continue
 count,pos=uint(raw,start)
 for _ in range(count):
  flag,pos=uint(raw,pos)
  if flag==2:mem,pos=uint(raw,pos);assert mem==0
  if flag in [0,2]:assert raw[pos]==0x41;addr,pos=uint(raw,pos+1,True);assert raw[pos]==0x0b;pos+=1
  else:assert flag==1;addr=None
  size,pos=uint(raw,pos);chunk=raw[pos:pos+size]
  for token in [b'poki_sdk\0',b'PokiSdk\0']:
   offset=chunk.find(token)
   if offset>=0 and addr is not None:memory.append({'token':token[:-1].decode(),'memory_address':addr+offset})
  pos+=size
 assert pos==end
objdump=b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'
details=subprocess.check_output(['node',str(objdump),'-x',str(p)],text=True,encoding='utf8')
targets={}
for line in details.splitlines():
 m=re.search(r'func\[(\d+)\] sig=(\d+).*<- a\.(\S+)',line)
 if m and m[3]in byfield:targets[int(m[1])]={'signature':int(m[2]),'field':m[3],'implementation':byfield[m[3]]}
assert len(targets)==14
process=subprocess.Popen(['node',str(objdump),'-d',str(p)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf8')
function=None;body=[];selected={};calls=[];memory_hits=[]
addresses={x['memory_address']for x in memory}
def flush():
 if function is not None and any(x['caller']==function for x in calls+memory_hits):selected[str(function)]=''.join(body)
for line in process.stdout:
 m=re.search(r'\bfunc\[(\d+)\].*:\s*$',line)
 if m:flush();function=int(m[1]);body=[]
 body.append(line)
 m=re.search(r'\|\s+call (\d+)(?:\s|$)',line)
 if m and int(m[1])in targets:calls.append({'caller':function,'target':int(m[1]),'implementation':targets[int(m[1])]['implementation'],'instruction':line.strip()})
 m=re.search(r'\|\s+i32\.const (-?\d+)\s*$',line)
 if m and int(m[1])in addresses:memory_hits.append({'caller':function,'address':int(m[1]),'instruction':line.strip()})
flush();err=process.stderr.read();assert process.wait()==0,err
out={'source_sha256':hashlib.sha256(raw).hexdigest(),'imports':targets,'module_name_addresses':memory,'direct_import_calls':calls,'module_registration_candidates':memory_hits,'runtime_executed':False,'scope':'Original static Wasm direct calls and exact active data segment addresses only; no delegate reachability inference or executable modification.'}
(folder/'native-sdk-binding.json').write_text(json.dumps(out,indent=2),encoding='utf8');(folder/'native-sdk-selected-functions.txt').write_text('\n'.join(selected.values()),encoding='utf8')
print(json.dumps({'imports':targets,'direct_calls':calls,'module_registration_candidates':memory_hits,'selected_functions':list(selected),'runtime_executed':False}))
