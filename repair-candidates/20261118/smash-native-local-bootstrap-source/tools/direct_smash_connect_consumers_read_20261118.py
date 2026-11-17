"""Read existing original-body excerpts; all conclusions explicitly subset-scoped."""
from pathlib import Path
import json,re,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';d=r/'analysis-20261118'
p=r/'analysis-20261117/gameplay-code-named-NOT-RUNTIME.dcmp';text=p.read_text(encoding='utf8')
headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));by_id={int(m[2]):m for m in headers}
target=by_id[17293];target_name=re.match(r'(\w+)\(',target[1])[1]
auth_setter=re.match(r'(\w+)\(',by_id[17294][1])[1]
auth_getter=re.match(r'(\w+)\(',by_id[4878][1])[1]
assert target_name=='f_doy'and auth_setter=='f_eoy'and auth_getter=='f_qeg'
rows=[]
for n,m in enumerate(headers):
 end=headers[n+1].start()if n+1<len(headers)else len(text)
 body=text[m.start():end]
 if int(m[2])==17293 or not re.search(r'\b'+re.escape(target_name)+r'\(',body):continue
 rows.append({'function_index':int(m[2]),'name':re.match(r'(\w+)\(',m[1])[1],'source_sha256':hashlib.sha256(body.encode()).hexdigest(),'source':body})
ciw=by_id[26679];end=next(m.start()for m in headers if m.start()>ciw.start());source=text[ciw.start():end]
assert 'f_eoy(b, 0)'in source and 'f_qeg(0)'in source and 'f_doy('not in source
source_proof=json.loads((r/'analysis-20261117/offline-boundary/offline-consumer-source-proof.json').read_text(encoding='utf8'))
auth_get=next(x for x in source_proof['snippets']if x['function_index']==4878)
auth_set=next(x for x in source_proof['snippets']if x['function_index']==17294)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_wasm_sha256':source_proof['original_wasm_sha256'],'analysis_slice_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'target_connect_using_settings_wrapper':17293,'actual_original_target_alias':target_name,'calls_in_existing_game_body_subset':rows,'identity_configuration_consumer':{'function_index':26679,'name':'PhotonConnectionManager.ciw','source_sha256':hashlib.sha256(source.encode()).hexdigest(),'source':source,'auth_getter_original_function':4878,'auth_setter_original_function':17294,'auth_getter_source':auth_get['source'],'auth_setter_source':auth_set['source'],'direct_connect_using_settings_call':False},'limitations':['Only original bodies retained in the existing gameplay analysis slice, not a whole-original direct-call scan','Awake reads actual Firebase identity; no account or backend success is fabricated','A settings byte alone does not establish complete local-room/player/AI initialization']}
target=d/'connect-consumer-source-subset.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in out.items()if k not in ['identity_configuration_consumer','calls_in_existing_game_body_subset']}|{'caller_functions':[{'function_index':x['function_index'],'name':x['name']}for x in rows],'identity_configurator_directly_connects':False},ensure_ascii=False))
