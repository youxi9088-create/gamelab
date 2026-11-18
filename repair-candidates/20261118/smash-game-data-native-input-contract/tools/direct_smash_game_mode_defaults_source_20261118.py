"""Bind the original shipped play presets before designing a local data lifecycle."""
from pathlib import Path
import json,struct,hashlib,subprocess,sys,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';target=a/'game-mode-original-default-contract.json';assert not target.exists()
src=(b/'direct_smash_game_data_cold_start_contract_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('gate=json.loads')]
ns={'b':b,'r':r,'a':a,'json':json,'struct':struct,'hashlib':hashlib};exec(compile(src,'read-original-preset-contract-tables-only','exec'),ns)
meta=ns['meta'];memory=ns['memory'];mt=ns['mt'];tt=ns['tt'];rd=ns['rd'];fields=ns['field_rows'];string=ns['string'];table=ns['n']['ns']['table']
cold=json.loads((a/'game-data-cold-start-contract.json').read_bytes());data_type=cold['embedded_data_type']['type_definition_index'];types={213,data_type};data_fields=fields(data_type)
types.update(x['type']['type_definition_index']for x in data_fields if x['type']['type_code']==18)
mode_fields=fields(213);preset=next(x for x in mode_fields if x['type']['name']=='PlayOptionsData'and x['native_offset']==120);assert preset['attributes']&16
module=json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_bytes())['modules']['Assembly-CSharp.dll'];rows=[];selected=set()
for t in sorted(types):
    p=tt+88*t;name=string(struct.unpack_from('<I',meta,p)[0]);first=struct.unpack_from('<i',meta,p+36)[0];count=struct.unpack_from('<H',meta,p+64)[0]
    for mi in range(first,first+count):
        p=mt+36*mi;method=string(struct.unpack_from('<I',meta,p)[0]);token=struct.unpack_from('<I',meta,p+24)[0];pointer=rd(module['pointers_address']+4*((token&0xffffff)-1));fn=table.get(pointer)
        if fn is None:continue
        rows.append({'class':name,'type_index':t,'method':method,'method_index':mi,'function_index':fn,'token':token})
        if method in['.ctor','.cctor']:selected.add(fn)
assert selected
view='game-mode-default-constructors';assert not(a/view).exists()
subprocess.run([sys.executable,'-X','utf8',str(b/'direct_smash_settings_constant_source_20261118.py'),'--view',view,'--functions',','.join(str(x)for x in sorted(selected))],check=True,stdout=subprocess.DEVNULL)
source=json.loads((a/view/'original-settings-constant-source.json').read_bytes());out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'game_mode_constants_fields':mode_fields,'original_static_preset_field':preset,'types':[{'type_index':t,'name':string(struct.unpack_from('<I',meta,tt+88*t)[0]),'fields':fields(t)}for t in sorted(types)],'methods':rows,'constructor_source':source,'limitations':['Actual original preset construction, not proof of offline mode, player spawning or AI.','No server response, dayId, reward, permission, readiness or game state was fabricated.']};target.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({'source_only':True,'game_executed':False,'preset_field':preset,'types':[(x['name'],[(f['name'],f['type']['name'],f['native_offset'])for f in x['fields']])for x in out['types']if x['type_index']!=213],'constructors':[x for x in rows if x['function_index']in selected]},ensure_ascii=False))
