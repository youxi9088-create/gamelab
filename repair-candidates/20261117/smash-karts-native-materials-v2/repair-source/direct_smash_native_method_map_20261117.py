"""Adapt the already schema31 static reader; never execute game code."""
from pathlib import Path
import json,contextlib,io,struct,subprocess
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source=source.replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br').replace('native-sdk-classes.json','native-gameplay-classes.json').replace('native-sdk-wasm-map.json','native-gameplay-wasm-map.json').replace('sdk-code-slice-NOT-RUNTIME.wasm','gameplay-code-slice-NOT-RUNTIME.wasm')
# GameConstants supplies field names only. Its unneeded struct-return methods
# have nonordinary ABI shapes; exclude all of them rather than assert a guess.
needle="types=json.loads((r/'analysis-20261117/native-gameplay-classes.json').read_text())['types'];modules={}"
assert needle in source
extra=";types=[t for t in types if t['name']!='GameConstants']"
extra+=";getter_file=r/'analysis-20261117/native-string-getter-index.json'"
extra+=";getter=json.loads(getter_file.read_text()) if getter_file.exists() else None"
extra+=";types+=([{'type_index':getter['class_index'],'name':'a','namespace':'','image':'Assembly-CSharp.dll','methods':getter['selected_methods'],'fields':getter['last_fields']}] if getter else [])"
source=source.replace(needle,needle.replace(';modules={}',extra+';modules={}'))
start=source.index('selected={m[');end=source.index("code=next(s for s in sections if s['kind']==10)",start)
source=source[:start]+"selected={m['function_index']for m in mapped if m['class']in ['GameStartScreen','AddressableLoader','Preloader','PhotonConnectionManager','q','ba','o','SKServicesLoader','JavascriptMessageSender','a'] or m['class']=='GameManager' and m['name']in ['StartRoundSpawn','Awake','Start','OnInGameScenesLoadComplete']};init_call_hints=[]\n"+source[end:]
old="if init_call in body:init_call_hints.append({'function_index':fn,'metadata_aliases':[{'class':m['class'],'method':m['name']}for m in mapped if m['function_index']==fn]});selected.add(fn)"
assert old in source;source=source.replace(old,'')
namespace={'__file__':str(b/'static-map-only.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'smash-static-map','exec'),namespace)
# Independently validate ABI shape from original Wasm type+function sections.
raw=namespace['raw'];sections=namespace['sections'];leb=namespace['leb'];s=next(s for s in sections if s['kind']==1);count,pos=leb(raw,s['start']);signatures=[]
for _ in range(count):
 assert raw[pos]==0x60;params,pos=leb(raw,pos+1);args=list(raw[pos:pos+params]);pos+=params;returns,pos=leb(raw,pos);ret=list(raw[pos:pos+returns]);pos+=returns;signatures.append({'params':args,'returns':ret})
assert pos==s['end'];s=next(s for s in sections if s['kind']==3);count,pos=leb(raw,s['start']);types=[row['type']for row in namespace['import_rows']]
for _ in range(count):typ,pos=leb(raw,pos);types.append(typ)
assert pos==s['end']
mapped=namespace['mapped'];checks=[]
for m in mapped:
 # These selected declarations are all ordinary nongeneric game methods.
 sig=signatures[types[m['function_index']]];expected=m['parameter_count']+(1 if m['flags']&16 else 2)
 checks.append({'class':m['class'],'method':m['name'],'function_index':m['function_index'],'actual_signature':sig,'expected_ordinary_abi_parameters':expected,'parameter_count_matches':len(sig['params'])==expected,'static':bool(m['flags']&16)})
proof={'source_only':True,'game_executed':False,'mapping_verified':False,'abi_checks':checks,'mismatches':[x for x in checks if not x['parameter_count_matches']],'warning':'Parameter-count alignment alone does not prove semantic identity; inspect original named bodies and exact native import bridges before patches.'}
(r/'analysis-20261117/native-gameplay-map-abi.json').write_text(json.dumps(proof,indent=2),encoding='utf8')
print(json.dumps({'mapped':len(mapped),'module':{k:{a:v for a,v in x.items()if a!='values'}for k,x in namespace['modules'].items()},'abi_parameter_matches':sum(x['parameter_count_matches']for x in checks),'abi_parameter_mismatches':len(proof['mismatches']),'selected_functions':len(namespace['selected']),'mapping_semantics_not_yet_verified':True}))
assert not proof['mismatches'],'Do not trust native aliases until ABI mismatch is resolved'
done=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(r/'analysis-20261117/gameplay-code-slice-NOT-RUNTIME.wasm'),'-o',str(r/'analysis-20261117/gameplay-code-NOT-RUNTIME.dcmp')],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=60)
assert done.returncode==0,done.stderr
print(json.dumps({'decompiled':True,'source_only':True,'game_executed':False}))
