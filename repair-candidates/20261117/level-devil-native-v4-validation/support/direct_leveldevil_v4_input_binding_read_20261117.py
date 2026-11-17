"""Static decoding only. No game evaluation, input replay or source mutation."""
from pathlib import Path
import sys,json,hashlib,re,urllib.request,datetime
b=Path(__file__).parent;r=b/'direct-games/job-ca75d464d2d7';sys.path.insert(0,str(b));from defold_v6_source_edit import fields,archive_entries,unpack
sha=lambda v:hashlib.sha256(v).hexdigest();e=r/'validation-native-v4-20261117';p=e/'input-binding-static-read.json';assert not p.exists()
url='https://raw.githubusercontent.com/defold/defold/dev/engine/input/proto/input/input_ddf.proto'
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
with op.open(url,timeout=25)as response:assert response.status==200;schema=response.read()
(e/'defold-input_ddf.proto').write_bytes(schema);keys={int(v):k for k,v in re.findall(rb'\b(KEY_\w+)\s*=\s*(\d+)\s*;',schema)}
original=r/'analysis/archive-v6/0498-954d7a41c9794896a5f186bb87ce2164c7261693.bin';raw=original.read_bytes();bindings=[]
for row in fields(raw):
 if row['key']!=1:continue
 f={x['key']:x['value']for x in fields(row['value'])};bindings.append({'key_number':f[1],'key':keys[f[1]].decode(),'action':f[2].decode()})
assert any(x['key']=='KEY_D'and x['action']=='p1_right'for x in bindings)
assert any(x['key']=='KEY_SPACE'and x['action']=='p1_jump'for x in bindings)
assert any(x['key']=='KEY_UP'and x['action']=='p2_up'for x in bindings)
assert not any(x['key']=='KEY_UP'and 'jump'in x['action']for x in bindings)
candidate=r/'work-native-retirement-20261117-v4';desc=json.loads((candidate/'archive/archive_files.json').read_text());parts=next(x['pieces']for x in desc['content']if x['name']=='game.arcd')
data=b''.join((candidate/'archive'/x['name']).read_bytes()for x in sorted(parts,key=lambda x:x['offset']));entries=archive_entries((candidate/'archive/game0.arci').read_bytes(),data);actual=unpack(entries[498]);assert actual==raw
rows=json.loads((r/'analysis/lua-index.json').read_text(encoding='utf8'));bound={}
for i in [345,347]:
 row=next(x for x in rows if x['index']==i);v=(r/'analysis/lua'/row['local']).read_bytes();assert sha(v)==row['sha256'];bound[str(i)]={'file':row['local'],'sha256':sha(v)}
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only original input binding and Lua consumer audit; no gameplay run','schema_url':url,'schema_sha256':sha(schema),'resource_index':498,'original_and_v4_binding_sha256':sha(raw),'unchanged':True,'bindings':bindings,'lua_consumers':bound,'correction':'之前用Up尝试验证跳跃是测试键选择错误。原绑定Up→p2_up，原跳跃为Space→p1_jump，不能把父v3的姿态变化当跳跃证明。P1横向原键A/D；箭头Right绑定p2_right，单人消费者也可能路由到1，故不能仅凭绑定断言右移失败根因。Canvas焦点与帧采样仍未实测定位。','runtime_verified':False,'ready_review':False,'game_or_model_executed':False,'additional_ui_inputs':0}
p.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({k:v for k,v in out.items()if k!='bindings'},ensure_ascii=False))
