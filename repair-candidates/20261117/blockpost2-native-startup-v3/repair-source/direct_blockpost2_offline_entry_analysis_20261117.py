from pathlib import Path
import subprocess,json
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';out=r/'offline-entry-analysis-20261117';out.mkdir(exist_ok=True)
# Reuse validated original tables, while keeping the initial analysis immutable.
metadata=(b/'direct_blockpost2_metadata_classes_20261117.py').read_text(encoding='utf8')
metadata=metadata.replace("['PokiUnitySDK','PokiAdsManager','MasterClient','GUIPlayOffline','UIPlayOffline','BotManager','FakeServer']","['GUIPlayOffline','UIPlayOffline','UIPlayOffline_SelectMode','UIPlayBot','UIPlayModesDefault','UIPlayModesPrime','GUIPlay','UIPlay']").replace("analysis-20261117/native-sdk-classes.json","offline-entry-analysis-20261117/native-sdk-classes.json")
mapping=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8').replace('analysis-20261117','offline-entry-analysis-20261117')
mapping=mapping.replace("selected={m['function_index']for m in mapped if m['class']in ['PokiUnitySDK','PokiAdsManager','MasterClient']or m['class']=='UIPlayOffline'and m['name']in ['Awake','OnEnable','CreateServer']}","selected={m['function_index']for m in mapped}")
mapping=mapping.replace("sdk_init=next(m['function_index']for m in mapped if m['class']=='PokiUnitySDK'and m['name']=='init');init_call=b'\\x10'+uleb(sdk_init);init_call_hints=[]","init_call=b'UNUSED';init_call_hints=[]")
names=(b/'direct_blockpost2_name_analysis_slice_20261117.py').read_text(encoding='utf8').replace('analysis-20261117','offline-entry-analysis-20261117')
for name,code in [('metadata',metadata),('mapping',mapping),('names',names)]:
 compile(code,name,'exec');exec(compile(code,name,'exec'),{'__file__':str(b/(name+'.py'))})
result=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(out/'sdk-code-named-NOT-RUNTIME.wasm'),'-o',str(out/'offline-entry-NOT-RUNTIME.dcmp')],capture_output=True,text=True,encoding='utf8',timeout=90)
assert result.returncode==0,result.stderr
d=json.loads((out/'native-sdk-wasm-map.json').read_text());print(json.dumps({'source_only':True,'classes':sorted(set(x['class']for x in d['mapped_methods'])),'methods':len(d['mapped_methods']),'decompiled':True,'game_executed':False}))
