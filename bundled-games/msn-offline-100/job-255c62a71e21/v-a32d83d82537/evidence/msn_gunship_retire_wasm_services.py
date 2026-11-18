"""Retire proven direct platform consumers; preserve all other WASM bytes.

Cloud load still follows its ORIGINAL six-second local deadline/failure path.
No settled/save/readiness flag, callback, reward, token, identity or success is
manufactured. GameManager's original SetAdsEnabled consumer is given false.
"""
from pathlib import Path
import json,hashlib
b=Path(__file__).parent/'msn-capture-100';r=b/'source-analysis/gunship';raw=(b/'msn-en-us/originals/9nvh11mzqtwq/Build/Build.wasm').read_bytes();sha=lambda v:hashlib.sha256(v).hexdigest()
m=json.loads((r/'native-sdk-wasm-map.json').read_text());a=json.loads((r/'all-actual-sdk-import-consumers.json').read_text());assert sha(raw)==a['original_wasm_sha256']==m['original_wasm_sha256'] and a['all_original_defined_functions_scanned']==113966
out=bytearray(raw);edits=[];remote={'_MSstart_ShowAd':1,'_MSstart_NotifyMuted':1,'_MSstart_LoadCloudSave':1,'_MSstart_SaveCloudSave':2}
def uleb(v):
 data=bytearray()
 while True:
  byte=v&127;v>>=7;data.append(byte|(128 if v else 0))
  if not v:return bytes(data)
for row in a['direct_call_instructions']:
 name=row['service']
 if name not in remote:continue
 start=row['source_instruction_offset'];old=b'\x10'+uleb(row['import_function_index']);assert raw[start:start+len(old)]==old
 replacement=b'\x1a'*remote[name]+b'\x01'*(len(old)-remote[name]);assert len(old)==len(replacement)
 out[start:start+len(old)]=replacement;edits.append({**row,'reason':'Retire actual direct external import consumer, drop original arguments; no provider/result/callback','old_hex':old.hex(),'new_hex':replacement.hex()})
assert len(edits)==6
fn=next(v for v in m['selected_bodies'] if v['function_index']==66692);start=fn['file_offset'];body=raw[start:start+fn['bytes']]
signature=b'\x20\x00\x20\x00\x10'+uleb(33949);assert body.count(signature)==1
offset=start+body.index(signature);assert raw[offset:offset+2]==b'\x20\x00';out[offset:offset+2]=b'\x41\x00'
edits.append({'function_index':66692,'aliases':['GameManager.Awake'],'reason':'Pass false to original SDKManager.SetAdsEnabled at its actual startup consumer, leaving native unregistration/UI availability rules intact. No success result or reward.','source_instruction_offset':offset,'old_hex':'2000','new_hex':'4100'})
assert len(out)==len(raw)
changed={i for e in edits for i in range(e['source_instruction_offset'],e['source_instruction_offset']+len(bytes.fromhex(e['old_hex'])))}
assert all(x==y or i in changed for i,(x,y) in enumerate(zip(raw,out)))
assert len(set(e['function_index'] for e in edits))==7
p=r/'service-retired.wasm';assert not p.exists();p.write_bytes(out)
proof={'source_only':True,'native_or_SDK_executed':False,'original_wasm_sha256':sha(raw),'derived_wasm_sha256':sha(out),'byte_length_unchanged':len(out),'defined_functions':113966,'modified_functions':7,'other_function_bodies_exact':113959,'actual_SDK_import_calls_scanned':8,'local_canvas_focus_calls_retained':2,'external_SDK_import_consumers_retired':6,'edits':edits,'preserved_source_behaviour':['Original RequestCloudLoad initializes unavailable=false and a six-second deadline; actual external load call is retired, original SDKManager.Update/SaveManager.TickCloudSave deadline reaches original local failure handler.','Original LoadGame/WriteLocal/PlayerPrefs/IndexedDB path and all cloud availability/settled flags remain byte-exact; no fake cloud callback or data.','Original SetAdsEnabled(false) unregisters rewarded/interstitial/refill/extra-cash delegates; original local UI availability handling retained.','Native physics, weapons, enemy AI, missions, local upgrades, rewards earned without ads, timers, tutorial, difficulty, RNG and all native resources are unchanged.'],'runtime_verified':False}
(r/'wasm-service-retirement-proof.json').write_text(json.dumps(proof,indent=2),encoding='utf8');print(json.dumps({'edits':len(edits),'native_functions_exact':113959,'bytes':len(out),'source_only':True}))
