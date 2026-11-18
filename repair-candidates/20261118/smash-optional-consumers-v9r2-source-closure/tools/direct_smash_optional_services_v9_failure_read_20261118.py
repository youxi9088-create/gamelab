"""Read the terminal pre-publication failure; no writes, jobs or game execution."""
from pathlib import Path
import json,sys,zipfile,types
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.service import Service
base=Path('D:/GameLab/temp/direct-smash-local-ftue-v8-20261118');old=Path('D:/GameLab/temp/direct-smash-optional-services-v9-20261118')
with zipfile.ZipFile(Path(__file__).parent/'direct_smash_optional_services_v9_20261118.pyz')as z:
    recipe=json.loads(z.read('support/assembly-recipe.json'));linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'static-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    code={};exec(compile(z.read('tools/smash_optional_services_native_link_v9_20261118.py'),'static-assembler','exec'),code)
    raw,proof=code['assemble']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'),json.loads(z.read('support/original-retirement-contract.json')))
    expected=recipe['native_link_proof'];different=[k for k in proof if proof[k]!=expected[k]]
    assert different==['original_changed_body_hashes'];assert json.loads(json.dumps(proof))==expected
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:job=svc.get(db,'jobs','job-3db06205247a');status={k:job.get(k)for k in ['status','version_id','round','manual_paused']}
ledger=json.loads(Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118/ui-ledger.json').read_bytes())
out={'read_only':True,'game_executed':False,'old_stage_exists':old.exists(),'old_receipt_exists':(old/'receipt.json').exists(),'different_proof_fields':different,'canonical_json_proof_matches':True,'candidate_wasm_sha256_matches':proof['candidate_wasm_sha256']==expected['candidate_wasm_sha256'],'job':status,'ui_steps_used':ledger['used'],'ui_steps_remaining':ledger['remaining']}
assert not old.exists()and status['status']=='blocked'and ledger['used']==3 and ledger['remaining']==2
print(json.dumps(out))
