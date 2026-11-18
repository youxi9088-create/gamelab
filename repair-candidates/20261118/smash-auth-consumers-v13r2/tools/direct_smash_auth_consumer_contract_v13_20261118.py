"""Bind actual SDK-auth startup/resume consumers and preserve singleton initialization."""
from pathlib import Path
import json,hashlib,struct,re,contextlib,io,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=a/'native-auth-consumer-retirement-contract-v13.json';assert not out.exists()
source=json.loads((a/'native-auth-startup-consumers/original-settings-constant-source.json').read_bytes());initial=json.loads((a/'native-auth-initial-readback/original-settings-constant-source.json').read_bytes());d={x['function_index']:x for x in source['original_source_snippets']+initial['original_source_snippets']}
assert 'f_byf(a,'in d[101109]['source']and'f_eao(0)'in d[101109]['source']and'f_wnla(a, b, f_wdlb(0), a)'in d[101109]['source']
assert 'a_Hd()'in d[10170]['source']and 'f_gad(f_ux('in d[26068]['source']
assert 'a[80]:byte = 0;'in d[2736]['source']and d[2736]['source'].count('f_wye(')==2
for fn in[101102,101103]:assert d[fn]['source'].count('f_qnla(')==1 and'a[40]:byte = 1;'in d[fn]['source']
mapped=json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_bytes())['mapped_methods'];rows=[x for x in mapped if x['function_index']in[101109,101102,101103,26068,10170]];assert len(rows)==5
for x in rows:assert x['class']==('JavascriptMessageSender'if x['function_index']==10170 else'FirebaseAuthService')
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('gate=json.loads')];n={'b':b,'r':r,'a':a,'json':json,'hashlib':hashlib,'struct':struct}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'original-base-singleton-binding-only','exec'),n)
rd=n['rd'];memory=n['memory'];meta=n['meta'];mt=n['mt'];tt=n['tt'];string=n['string'];reg=n['reg'];encoded=rd(5670104);assert encoded>>29==6;index=(encoded&0x1fffffff)>>1;method,ci,gi=struct.unpack_from('<iii',memory,rd(reg+36)+12*index);decl=struct.unpack_from('<i',meta,mt+method*36+4)[0];owner=string(struct.unpack_from('<I',meta,tt+decl*88)[0]);name=string(struct.unpack_from('<I',meta,mt+method*36)[0]);args=n['ns']['inst_types'](ci)
assert len(args)==1 and args[0]['name']=='FirebaseAuthService'and name=='Awake'
wat=(a/'native-auth-startup-consumers/original-functions-NOT-RUNTIME.wat').read_text();instructions=[]
for fn in[101109,101102,101103]:
 m=re.search(r'^  \(func \(;'+str(fn)+r';\).*?(?=^  \(func|^  \(table)',wat,re.M|re.S);assert m;body=m[0]
 if fn==101109:assert len(re.findall(r'^\s+call 4707$',body,re.M))==1 and len(re.findall(r'^\s+call 10170$',body,re.M))==1
 else:assert len(re.findall(r'^\s+call 26068$',body,re.M))==1
 instructions.append({'function_index':fn,'source':body,'sha256':hashlib.sha256(body.encode()).hexdigest()})
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':source['original_wasm_sha256'],'methods':rows,'original_body_proofs':[x for x in source['original_body_hashes']if x['function_index']in[101109,101102,101103]],'original_base_binding':{'metadata_use':5670104,'method_spec_index':index,'method_index':method,'class':owner,'method':name,'generic_arguments':args,'shared_function':4707},'original_sources':[d[x]for x in[101109,101102,101103,26068,10170,2736,4707,26074]],'original_instructions':instructions,'retirement_scope':['Preserve original metadata initialization and the complete original generic singleton Awake call4707; retire only the subsequent cached Firebase-user read/configuration consumer.','In each original pause/focus method, retire only the actual26068 auth-refresh call, consuming its two already evaluated arguments; retain original time/focus bookkeeping.','Original26068 calls2736, which clears current data-ready state and sends two actual backend reads. Real local profile snapshots must not be reset by an obsolete cloud-resume consumer.','No AuthService UID, account/provider/permission flag or SDK success callback is manufactured. Original providers remain byte-identical.','HTML SDK.init loading-start consumer can be removed independently; Firebase initializeApp and not-yet-audited consumers remain, so this is not a claim of complete SDK retirement.']}
out.write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'retired_native_consumers':[101109,101102,101103],'original_base':proof['original_base_binding'],'provider_functions_replaced':False},ensure_ascii=False))
