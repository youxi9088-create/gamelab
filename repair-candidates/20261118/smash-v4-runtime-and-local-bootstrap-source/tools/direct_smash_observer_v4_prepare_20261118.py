"""Prepare one bounded observer for the verified v4 candidate; preserve shared UI history."""
from pathlib import Path
import zipfile,json,hashlib
b=Path(__file__).parent
old=b/'direct_smash_observer_v3_20261118.pyz'
with zipfile.ZipFile(old) as z:
    main=z.read('__main__.py').decode();server=z.read('observation_server.py').decode()
replacements={
 'direct-smash-runtime-uri-v3-20261118':'direct-smash-telemetry-consumers-v4-20261118',
 'observation-v3':'observation-v4','native-observation-v3':'native-observation-v4',
 'GameLabDirectSmashNativeObserveV320261118':'GameLabDirectSmashNativeObserveV420261118',
 "d['used']==1 and d['remaining']==4 and d['steps'][0]['status']=='observed_failed'":"d['used']==2 and d['remaining']==3 and d['steps'][-1]['status']=='observed_partial'",
 "'runtime-uri-v3'":"'telemetry-consumers-v4'",
 'ui_steps_used=1,ui_steps_remaining=4':'ui_steps_used=2,ui_steps_remaining=3',
 'existing v3 observation':'existing v4 observation', 'Existing v3 task':'Existing v4 task',
}
for a,c in replacements.items():main=main.replace(a,c);server=server.replace(a,c)
assert "d['used']==2 and d['remaining']==3" in main
assert "observation-v4" in server and "evidence.parent/'ui-ledger.json'" in server
assert 'direct-smash-runtime-uri-v3-20261118' not in main+server
compile(main,'observer-v4-main','exec');compile(server,'observer-v4-server','exec')
target=b/'direct_smash_observer_v4_20261118.pyz';assert not target.exists()
files={'observation_server.py':server.encode()}
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'game_executed':False,'ui_history_preserved':True}))
