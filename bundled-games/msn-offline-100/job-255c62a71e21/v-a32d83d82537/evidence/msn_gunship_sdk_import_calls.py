"""Stream instruction-level import consumers; discard unrelated disassembly immediately."""
from pathlib import Path
import json,re,subprocess,time
b=Path(__file__).parent;r=b/'msn-capture-100/source-analysis/gunship'
m=json.loads((r/'native-sdk-wasm-map.json').read_text(encoding='utf-8'));abi=json.loads((r/'framework-original-platform-bindings.json').read_text(encoding='utf-8'))
targets={x['index']:a['original']for a in abi['bindings']for x in m['imports']if x['name']==a['key']};assert len(targets)==5
pattern=re.compile(r'\|\s+call ('+'|'.join(map(str,targets))+r')(?:\s+<[^>]+>)?\s*$')
function=re.compile(r'^\s*[0-9a-f]+ func\[(\d+)\]');p=subprocess.Popen(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'),'-d',str(r.parent.parent/'msn-en-us/originals/9nvh11mzqtwq/Build/Build.wasm')],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf-8')
rows=[];current=None;lines=0;start=time.monotonic()
for line in p.stdout:
 lines+=1;assert lines<30_000_000
 if 'func['in line:
  h=function.match(line)
  if h:current=int(h[1])
 match=pattern.search(line)
 if match:
  target=int(match[1]);offset=int(line.strip().split(':',1)[0],16);rows.append({'function_index':current,'import_function_index':target,'service':targets[target],'source_instruction_offset':offset,'disassembly':line.strip(),'aliases':[{'class':x['class'],'method':x['name']}for x in m['mapped_methods']if x['function_index']==current]})
  assert len(rows)<500
err=p.stderr.read();assert p.wait()==0,err[:1000]
out={'source_only':True,'game_or_SDK_executed':False,'all_original_defined_functions_scanned':m['defined_functions'],'SDK_imports':targets,'direct_call_instructions':rows,'disassembly_lines_scanned':lines,'analysis_elapsed_seconds':time.monotonic()-start,'original_wasm_sha256':m['original_wasm_sha256']}
(r/'all-actual-sdk-import-consumers.json').write_text(json.dumps(out,indent=2),encoding='utf-8');print(json.dumps({'direct_actual_calls':rows,'lines':lines,'seconds':out['analysis_elapsed_seconds']}))
