from pathlib import Path
import json
b=Path(__file__).parent/'msn-capture-100';r=b/'source-analysis/gunship';raw=(b/'msn-en-us/originals/9nvh11mzqtwq/Build/Build.wasm').read_bytes()
def leb(pos):
 v=shift=0
 while True:
  x=raw[pos];pos+=1;v|=(x&127)<<shift;shift+=7
  if not x&128:return v,pos
def skip_sections():
 pos=8
 while pos<len(raw):
  kind=raw[pos];length,start=leb(pos+1)
  if kind==9:return start,start+length
  pos=start+length
 raise AssertionError('No original element table')
pos,end=skip_sections();count,pos=leb(pos);values=[]
for _ in range(count):
 flags,pos=leb(pos);assert flags==0 and raw[pos]==0x41;start,pos=leb(pos+1);assert raw[pos]==0x0b;num,pos=leb(pos+1)
 for i in range(num):
  fn,pos=leb(pos);values.append((start+i,fn))
assert pos==end
m=json.loads((r/'native-sdk-wasm-map.json').read_text());abi=json.loads((r/'framework-original-platform-bindings.json').read_text());keys={v['key']:v['original'] for v in abi['bindings'] if v['original']!='_MSstart_FocusCanvas'};targets={v['index']:keys[v['name']] for v in m['imports'] if v['name'] in keys}
hits=[{'table_index':i,'import_function_index':fn,'name':targets[fn]} for i,fn in values if fn in targets]
out={'source_only':True,'native_executed':False,'original_element_entries':len(values),'remote_imports':targets,'direct_remote_imports_in_indirect_function_table':hits};(r/'external-import-indirect-table-audit.json').write_text(json.dumps(out,indent=2));assert not hits,hits;print(json.dumps(out))
