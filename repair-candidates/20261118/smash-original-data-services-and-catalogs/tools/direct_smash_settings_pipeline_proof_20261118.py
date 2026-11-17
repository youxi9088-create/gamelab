"""Record the real Firebase-path -> JS bridge -> CDN-settings boundary, without requests."""
from pathlib import Path
import json,hashlib,re,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';old=r/'analysis-20261117'
services=json.loads((a/'data-services-v2/service-original-source-proof.json').read_text(encoding='utf8'))
constant=json.loads((a/'settings-constants/original-settings-constant-source.json').read_text(encoding='utf8'))
url=json.loads((a/'settings-url/original-settings-constant-source.json').read_text(encoding='utf8'))
embedded=json.loads((a/'embedded-catalogs/embedded-catalog-source-proof.json').read_text(encoding='utf8'))
ss={s['function_index']:s for s in services['original_source_snippets']}
c=next(x['source']for x in constant['original_source_snippets']if x['function_index']==104682)
assert 'a[13]:int = a[0]:int;'in c and 'a = f_bgxa(0);'in c
getter=next(x['source']for x in url['original_source_snippets']if x['function_index']==33983)
pairs=re.findall(r'\n\s+(\d+),\n\s+(\d+),\n',getter);assert pairs==[('14117','17')]and '[112087]:int'in getter
table=(old/'native-string-table-ANALYSIS-ONLY.bin').read_bytes();prefix=table[14117:14134].decode();assert prefix=='gameSettingsUrls/'
assert any(x['function_index']==62455 and x['value']=='common/'for x in embedded['original_decoded_resource_getters'])
assert 'GameSettingsService_gbt_43423(a, a);'in ss[43424]['source']
assert 'GameSettingsService_gbu_43422(a, a);'in ss[43424]['source']
assert 'f_wye(e, f_lx(a, f_djnc(0), 0)'in ss[43423]['source']
assert 'd[2] = (a = f_jgi(d[4], 0));'in ss[26016]['source']
assert 'd[6] = (a = f_jgi(d[5], 0));'in ss[26016]['source']
bridge=next(x['source']for x in url['original_source_snippets']if x['function_index']==43394);assert 'a_Md(a);'in bridge
framework_path=r/'native-build-20261117/41c0f438c941cb52e5a25dae21ba9c27.framework.js.br';framework=framework_path.read_text(encoding='utf8')
assert '"Md":_GetValueJS'in framework
start=framework.index('function _GetValueJS(');end=framework.index('function _HasRemoteConfigsBeenSet',start);framework_source=framework[start:end]
assert 'getValueTT(nodeKeyStr)'in framework_source
auth_path=r/'original-20261117/scripts/auth.js';auth=auth_path.read_text(encoding='utf8')
start=auth.index('function getValueTT(');end=auth.index('function SendDataToUnity(',start);get_value=auth[start:end]
assert 'firebase.database().ref()'in get_value and '.child(n).once("value")'in get_value
assert 'SendDataToUnity("OnGetValueSuccess",n,i)'in get_value
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'network_requests_made':0,'native_settings_prefix_getter':{'function_index':33983,'range':[14117,17],'value':prefix},'original_common_database_path':prefix+'common/','native_chain':{'settings_registration':43423,'firebase_database_bridge':4052,'javascript_message_sender':43394,'wasm_import':'Md','framework_function':'_GetValueJS','host_function':'getValueTT','cdn_fetch_consumer':26016},'actual_source_boundaries':['Common settings path is a Firebase database node, not an HTTP URL','Original JS reads the actual database child and forwards actual values to Unity','The native later consumer26016 calls UnityWebRequest.Get6275 for two actual URL values; none were fabricated or requested here','GameSettingsData43254 has an original constructor with native default values, not proof that all services or original account state are locally ready'],'original_input_hashes':{'original/scripts/auth.js':hashlib.sha256(auth_path.read_bytes()).hexdigest(),'native-build/41c0f438c941cb52e5a25dae21ba9c27.framework.js.br':hashlib.sha256(framework_path.read_bytes()).hexdigest()},'original_framework_source':framework_source,'original_host_get_value_source':get_value,'source_views':{'settings_constructor':43254,'decompiled_service_functions':233,'instruction_service_functions':235,'structured_view_exclusions':[26015,43610]},'limitations':['No account, Firebase return, remote URL, SDK/provider success or loaded flag is invented','1493 original item records and48 content groups do not prove prefab closure or complete game settings','Original local room/player/AI bootstrap and native runtime gameplay remain unresolved']}
p=a/'settings-pipeline-source-proof.json';assert not p.exists();p.write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in proof.items()if k not in ['original_framework_source','original_host_get_value_source']},ensure_ascii=False))
