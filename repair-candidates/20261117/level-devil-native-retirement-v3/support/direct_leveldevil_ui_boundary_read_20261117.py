from pathlib import Path
import sys,json,re
b=Path(__file__).parent;sys.path.insert(0,str(b/'analysis-tools/luaparser-4.2.0'))
from luaparser import ast
from luaparser.astnodes import If,ElseIf
r=b/'direct-games/job-ca75d464d2d7';root=r/'analysis/lua';out=[]
for name in ['0083-level-editor.gui_script.lua','0145-popup-infinite-mode-result.gui_script.lua','0455-level-browser.gui_script.lua','0569-level-editor-saves.gui_script.lua','0618-pause.gui_script.lua']:
 text=(root/name).read_text(encoding='utf8');tree=ast.parse(text);conditions=[]
 for node in ast.walk(tree):
  if not isinstance(node,(If,ElseIf))or not node.body.first_token:continue
  test=ast.to_lua_source(node.test);body=text[node.body.first_token.start:node.body.last_token.stop+1]
  if 'gui.pick_node'in test and ('poki_sdk.shareable_url'in body or '"upload_level"'in body):
   conditions.append({'condition':test,'body_start':node.body.first_token.start,'body_stop':node.body.last_token.stop+1,'prefix':body[:340]})
 init=text.find('function init(')
 out.append({'file':name,'conditions':conditions,'controls':list(dict.fromkeys(re.findall(r'gui\.pick_node\(gui\.get_node\("([^"]+)"',text))),'init':text[init:init+900]})
(r/'analysis-boundary-20261117/gui-boundary-controls.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
