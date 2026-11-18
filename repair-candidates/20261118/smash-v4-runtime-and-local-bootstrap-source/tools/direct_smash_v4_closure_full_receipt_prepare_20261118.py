"""Correct publication input to the complete saved remote receipt; no game/action replay."""
from pathlib import Path
import zipfile,json,hashlib
b=Path(__file__).parent
with zipfile.ZipFile(b/'direct_smash_v4_runtime_and_bootstrap_closure_20261118.pyz')as z:
    main=z.read('__main__.py').decode();manifest=json.loads(z.read('MANIFEST.json'));files={n:z.read(n)for n in manifest}
summary=json.loads(files['evidence/direct-smash-step3-outcome-20261118.json']);full=(b/'direct-smash-step3-full-outcome-20261118.json').read_bytes();actual=json.loads(full)
assert set(actual)-set(summary)=={'remaining_runtime_blocker_events'}and all(actual[k]==v for k,v in summary.items())
files['evidence/direct-smash-step3-full-outcome-20261118.json']=full
files['tools/direct_smash_step3_full_receipt_read_20261118.py']=(b/'direct_smash_step3_full_receipt_read_20261118.py').read_bytes()
files['tools/direct_smash_v4_closure_full_receipt_prepare_20261118.py']=Path(__file__).read_bytes()
files['publication-input-correction.json']=json.dumps({'initial_publication_failed_before_file_writes':True,'cause':'Existing finish helper deliberately prints a compact summary without remaining_runtime_blocker_events; the saved full remote outcome includes that field. Full equality correctly rejected a summary as the complete receipt.','correction':'Read the already-existing complete outcome and compare full JSON exactly. No runtime, state, ledger or work-log operation repeated.','complete_outcome_sha256':hashlib.sha256(full).hexdigest()},ensure_ascii=False,indent=2).encode()
assert main.count("z.read('evidence/direct-smash-step3-outcome-20261118.json')")==1
main=main.replace("z.read('evidence/direct-smash-step3-outcome-20261118.json')","z.read('evidence/direct-smash-step3-full-outcome-20261118.json')")
compile(main,'publish-v4-full-outcome-exactly','exec');target=b/'direct_smash_v4_runtime_and_bootstrap_closure_full_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'files':len(files),'new_game_actions':0}))
