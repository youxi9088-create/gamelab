"""Decode exact original GameData keys/constants from their bound native RVA getters."""
from pathlib import Path
import json,struct,re,subprocess,sys,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';target=a/'game-data-original-key-contract.json';assert not target.exists()
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('gate=json.loads')]
ns={'b':b,'r':r,'a':a,'json':json,'struct':struct,'hashlib':hashlib};exec(compile(src,'original-native-key-tables-only','exec'),ns)
meta=ns['meta'];memory=ns['memory'];mt=ns['mt'];tt=ns['tt'];string=ns['string'];rd=ns['rd'];table=ns['n']['ns']['table']
mapping=json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_bytes())['modules']['Assembly-CSharp.dll']
first=struct.unpack_from('<i',meta,tt+1085*88+36)[0];count=struct.unpack_from('<H',meta,tt+1085*88+64)[0];getters={}
for mi in range(first,first+count):
    p=mt+mi*36;token=struct.unpack_from('<I',meta,p+24)[0];pointer=rd(mapping['pointers_address']+4*((token&0xffffff)-1));fn=table.get(pointer)
    if fn is None or struct.unpack_from('<H',meta,p+34)[0]!=0:continue
    ret=struct.unpack_from('<i',meta,p+8)[0]
    if ns['resolve'](rd(ns['type_ptr']+4*ret))['name']!='string':continue
    getters.setdefault(fn,[]).append({'method_index':mi,'method':string(struct.unpack_from('<I',meta,p)[0]),'token':token})
cold=json.loads((a/'game-data-cold-start-contract.json').read_bytes());complex_source=json.loads((a/'complex-bootstrap-c-source/original-complex-c-source.json').read_bytes());source=next(x['source']for x in complex_source['original_c_source_snippets']if x['function_index']==43610)
used={int(x)for x in re.findall(r'w2c_smash__static__analysis_f(\d+)\(',source)}|{x['function_index']for x in cold['original_complex_apply_constant_indirect_targets']}
used|={6173,10854,14740,29567,62772,62773,62848,62853,62859,62864}
selected=used&set(getters);assert {6173,10854}.issubset(selected)
view='game-data-key-getters';folder=a/view
assert not folder.exists()
subprocess.run([sys.executable,'-X','utf8',str(b/'direct_smash_settings_constant_source_20261118.py'),'--view',view,'--functions',','.join(str(x)for x in sorted(selected))],check=True,stdout=subprocess.DEVNULL)
d=json.loads((folder/'original-settings-constant-source.json').read_bytes());decoded=(r/'analysis-20261117/native-string-table-ANALYSIS-ONLY.bin').read_bytes();assert hashlib.sha256(decoded).hexdigest()=='ba206c18054091f279ec3ab933f234ad9522b091d3b0628bde87692dc8f88f10'
rows=[];unresolved=[]
for x in d['original_source_snippets']:
    matches=re.findall(r'\[112087\]:int,\s*(\d+),\s*(\d+),',x['source'])
    if len(matches)!=1:unresolved.append({'function_index':x['function_index'],'reason':'Not one proven original RVA range; no guessed value'});continue
    start,length=map(int,matches[0]);assert 0<=start<=start+length<=len(decoded)
    raw=decoded[start:start+length];rows.append({'function_index':x['function_index'],'methods':getters[x['function_index']],'rva_start':start,'rva_length':length,'value':raw.decode('utf8'),'bytes_sha256':hashlib.sha256(raw).hexdigest(),'native_source_sha256':x['source_sha256']})
assert any(x['function_index']==6173 for x in rows)and any(x['function_index']==10854 for x in rows)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'rows':rows,'unresolved':unresolved,'selected_native_functions':sorted(selected),'original_decoded_table_sha256':hashlib.sha256(decoded).hexdigest(),'limitations':['Original key/value constants, not real backend data or proof of completeness.','No API/authentication request, game execution, fabricated dictionary, version, data-ready or callback.','Indirect source targets without a constant table index remain unproven.']};target.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'decoded':len(rows),'unresolved':len(unresolved),'rows':[(x['function_index'],x['value'])for x in rows]},ensure_ascii=False))
