"""Adapt only the normal menu route and a nonrewarded ad consumer predicate."""
from pathlib import Path
import json,hashlib,struct,subprocess,shutil,re
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';src=r/'work-native-local-v3';dst=r/'work-native-local-v4';assert not dst.exists()
raw=(src/'Build/bpm2.wasm.unityweb').read_bytes();assert hashlib.sha256(raw).hexdigest()=='b403141ba8e22b7e1e412a5fc5752b4c7f1bb152b3134b84327d224704145750'
mapping=json.loads((r/'native-home-menu-analysis-20261117/native-sdk-wasm-map.json').read_text());imports=mapping['function_imports'];assert imports==551
def u(n):
 out=bytearray()
 while True:
  x=n&127;n>>=7;out.append(x|(128 if n else 0))
  if not n:return bytes(out)
def leb(d,p):
 n=s=0
 while True:
  x=d[p];p+=1;n|=(x&127)<<s;s+=7
  if not x&128:return n,p
def parse(d):
 sections=[];p=8
 while p<len(d):
  begin=p;k=d[p];n,p=leb(d,p+1);sections.append((k,begin,p,p+n));p+=n
 code=next(s for s in sections if s[0]==10);n,p=leb(d,code[2]);bodies=[]
 for i in range(n):z,p=leb(d,p);bodies.append(d[p:p+z]);p+=z
 assert p==code[3];return sections,bodies
sections,bodies=parse(raw);wanted={7241,100306};assert all(any(m['function_index']==i for m in mapping['mapped_methods'])for i in wanted)
# Independent disassembly of the unmodified analysis slice confirms the exact
# native nonrewarded SDK-only predicate. Keep all outer map/parameter checks.
analysis=r/'native-home-menu-analysis-20261117';done=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'),'-d',str(analysis/'sdk-code-named-NOT-RUNTIME.wasm')],capture_output=True,text=True,encoding='utf8',timeout=60);assert done.returncode==0,done.stderr
original_sections,original_bodies=parse((r/'native-build-20261117/bpm2.wasm.unityweb').read_bytes());assert all(bodies[i-imports]==original_bodies[i-imports]for i in wanted)
ad=bodies[100306-imports];needle=b'\x2d\x00'+u(169);assert ad.count(needle)==1
dis=re.search(r'^[^\n]*func\[100306\][^\n]*\n.*?(?=^[^\n]*func\[\d+\])',done.stdout,re.M|re.S);assert dis and 'i32.load8_u 0 169'in dis[0]
ad_new=ad.replace(needle,b'\x1a\x41\x00') # consume pointer; local SDK predicate false, without writing global flags
menu=bodies[7241-imports];n,p=leb(menu,0)
for _ in range(n):_,p=leb(menu,p);p+=1
# Parameter1 == default online mode is now original local bot menu4.
# Other original routes, branches, source locks and methods remain untouched.
route=b'\x20\x01\x45\x04\x40\x41\x04\x21\x01\x0b'
menu_new=menu[:p]+route+menu[p:];changed={7241:menu_new,100306:ad_new};payload=u(len(bodies))+b''.join(u(len(changed.get(imports+i,x)))+changed.get(imports+i,x)for i,x in enumerate(bodies));result=bytearray(raw[:8])
for k,start,a,z in sections:
 if k==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
 else:result.extend(raw[start:z])
_,after=parse(result);assert len(after)==len(bodies)and[i+imports for i,(x,y)in enumerate(zip(bodies,after))if x!=y]==[7241,100306]
shutil.copytree(src,dst);(dst/'Build/bpm2.wasm.unityweb').write_bytes(result)
valid=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(dst/'Build/bpm2.wasm.unityweb')],capture_output=True,text=True,encoding='utf8',timeout=45);assert valid.returncode==0,valid.stderr
proof={'source_only':True,'base_sha256':hashlib.sha256(raw).hexdigest(),'candidate_sha256':hashlib.sha256(result).hexdigest(),'changed_from_v3':[{'function':7241,'class':'UICanvasPlay','method':'SelectSubMenu','change':'default0 routes to existing native local bot submenu4, other branches preserved'},{'function':100306,'class':'UIPlayBot','method':'CreateServer','change':'Retire only local SDK commercial-ad predicate load169; original selected-map and bot start continuation preserved, no reward or SDK success produced'}],'unchanged_from_v3':len(bodies)-2,'total_changed_from_original':[7241,92855,100306],'original_unmodified_functions':len(bodies)-3,'global_flags_auth_levels_and_data_not_modified':True,'validation':{'tool':'wabt wasm-validate','exit':valid.returncode},'ui_steps_used':4,'remaining':1,'runtime_verified':False,'scope':'No license/domain redirect change, no account or server stub, no gameplay/AI/level/selection writes. Native state only created by original normal bot start.'}
(dst/'evidence/native-bot-entry-v4.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8');(dst/'evidence/bot-create-original-disassembly.txt').write_text(dis[0],encoding='utf8')
import sys;sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import document
profile=json.loads((dst/'game-profile.json').read_text(encoding='utf8'));sec=profile['specification_v51']['sections'];sec['basic_facts']+=' v4将原默认菜单路由至原UIPlayBot机器人界面，未实测，累计预算4/5保留。';sec['system_design']+=' v4仅退役UIPlayBot.CreateServer的原非激励广告消费者谓词，保留原选图条件与原BotsGame创建调用，不写全局SDK标志或账号。';(dst/'game-profile.json').write_text(json.dumps(profile,ensure_ascii=False,indent=2),encoding='utf8');(dst/'GAME_SPECIFICATION.md').write_text(document('Blockpost 2.0（未交付修复候选v4）',profile),encoding='utf8')
print(json.dumps(proof,ensure_ascii=False))
