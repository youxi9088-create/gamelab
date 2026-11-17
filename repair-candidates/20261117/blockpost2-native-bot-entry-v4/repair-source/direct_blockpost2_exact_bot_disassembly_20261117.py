from pathlib import Path
import subprocess,re,json
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';p=subprocess.Popen(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'),'-d',str(r/'native-home-menu-analysis-20261117/sdk-code-named-NOT-RUNTIME.wasm')],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,encoding='utf8');rows=[];inside=False
for line in p.stdout:
 m=re.match(r'^[0-9a-f]+ func\[(\d+)\]',line)
 if m:inside=int(m[1])==100306
 if inside:rows.append(line)
err=p.stderr.read();assert p.wait()==0,err
s=''.join(rows);assert s and 'i32.load8_u 0 169'in s
(r/'work-native-local-v4/evidence/bot-create-original-disassembly.txt').write_text(s,encoding='utf8');print(s)
