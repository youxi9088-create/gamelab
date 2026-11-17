from pathlib import Path
import ast,hashlib
b=Path(__file__).parent
p=b/'direct_leveldevil_additional_authorization_remote_20261117.py'
old=p.read_text(encoding='utf8')
raw=(b/'direct-games/job-ca75d464d2d7/ui-ledger-native-v3-20261117.json').read_bytes()
digest=hashlib.sha256(raw).hexdigest()
assert digest=='f84c71c9c4e9c183dcbe3f3bccb0647672475acc49dd1eb4719f14e8336ed089'
tree=ast.parse(old);node=next(n for n in ast.walk(tree)if isinstance(n,ast.Assign)and any(isinstance(t,ast.Name)and t.id=='raw'for t in n.targets))
lines=old.splitlines(keepends=True);line=lines[node.lineno-1];assert node.lineno==node.end_lineno
start=len(line[:node.col_offset].encode('utf8').decode('utf8'));segment=ast.get_source_segment(old,node)
assert segment.startswith('raw=')and segment.endswith('.encode()')
lines[node.lineno-1]=line.replace(segment,'raw='+repr(raw),1)
updated=''.join(lines);compile(updated,str(p),'exec');p.write_bytes(updated.encode('utf8'))
print('Corrected only embedded authorization byte serialization; original ledger and digest preserved.')
