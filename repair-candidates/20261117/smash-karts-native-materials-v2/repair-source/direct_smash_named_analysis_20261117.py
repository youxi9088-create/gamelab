from pathlib import Path
import json,re,subprocess
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a/analysis-20261117'
d=json.loads((r/'native-gameplay-wasm-map.json').read_text(encoding='utf8'));raw=(r/'gameplay-code-slice-NOT-RUNTIME.wasm').read_bytes();names={}
for m in d['mapped_methods']:names.setdefault(m['function_index'],re.sub(r'\W','_',m['class']+'_'+m['name'])+'_'+str(m['function_index']))
def u(n):
 out=bytearray()
 while True:
  byte=n&127;n>>=7;out.append(byte|(128 if n else 0))
  if not n:return bytes(out)
payload=u(len(names))+b''.join(u(i)+u(len(n.encode()))+n.encode() for i,n in sorted(names.items()));sub=b'\x01'+u(len(payload))+payload;custom=b'\x04name'+sub
target=r/'gameplay-code-named-NOT-RUNTIME.wasm';target.write_bytes(raw+b'\0'+u(len(custom))+custom)
out=r/'gameplay-code-named-NOT-RUNTIME.dcmp'
done=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(target),'-o',str(out)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=60);assert done.returncode==0,done.stderr
text=out.read_text(encoding='utf8');wanted=['GameStartScreen_OnJoinRoundButtonClicked','AddressableLoader_Awake','AddressableLoader_vg','AddressableLoader_vo','Preloader_Start','q_MoveNext','ba_MoveNext','o_MoveNext','GameManager_StartRoundSpawn','SKServicesLoader_eum','SKServicesLoader_eup','SKServicesLoader_eur','SKServicesLoader_eut','SKServicesLoader_cctor','JavascriptMessageSender_GetAddressableCatalogFilename']
snippets=[]
for name in wanted:
 pattern=re.compile(r'^function '+re.escape(name)+r'_\d+\(',re.M);matches=list(pattern.finditer(text));assert len(matches)==1,(name,len(matches))
 start=matches[0].start();end=text.find('\nfunction ',start+1);part=text[start:end if end>=0 else len(text)]
 snippets.append({'method':name,'decompiled_source':part})
(r/'original-flow-source-excerpts.json').write_text(json.dumps({'source_only':True,'game_executed':False,'snippets':snippets},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'analysis_named_functions':len(names),'excerpt_count':len(snippets)},ensure_ascii=False))
