"""Create a new immutable package after a proven JSON-only proof serialization failure."""
from pathlib import Path
import subprocess,sys,json,hashlib
b=Path(__file__).parent
diagnostic=json.loads((b/'direct-smash-optional-services-v9-failure-read-20261118.json').read_bytes())
assert diagnostic['canonical_json_proof_matches']and not diagnostic['old_stage_exists']and diagnostic['candidate_wasm_sha256_matches']
stage=(b/'direct_smash_optional_services_v9_stage_20261118.py').read_text(encoding='utf8')
stage=stage.replace('direct-smash-optional-services-v9-20261118','direct-smash-optional-services-v9r2-20261118')
stage=stage.replace('direct-smash-optional-consumer-v9-20261118','direct-smash-optional-consumer-v9r2-20261118')
stage_path=b/'direct_smash_optional_services_v9r2_stage_20261118.py';assert not stage_path.exists();stage_path.write_text(stage,encoding='utf8')
prepare=(b/'direct_smash_optional_services_v9_prepare_20261118.py').read_text(encoding='utf8')
for before,after in [('optional-services-v9-support-20261118','optional-services-v9r2-support-20261118'),('direct_smash_optional_services_v9_prepare_20261118.py','direct_smash_optional_services_v9r2_prepare_20261118.py'),('direct_smash_optional_services_v9_stage_20261118.py','direct_smash_optional_services_v9r2_stage_20261118.py'),('direct_smash_optional_services_v9_20261118.pyz','direct_smash_optional_services_v9r2_20261118.pyz')]:prepare=prepare.replace(before,after)
prepare_path=b/'direct_smash_optional_services_v9r2_prepare_20261118.py';assert not prepare_path.exists();prepare_path.write_text(prepare,encoding='utf8')
subprocess.run([sys.executable,'-X','utf8',str(prepare_path)],check=True)
r=b/'direct-games/job-3db06205247a';old=(r/'optional-services-v9-support-20261118/optional-consumer-retirement-static-validation-only.wasm').read_bytes();new=(r/'optional-services-v9r2-support-20261118/optional-consumer-retirement-static-validation-only.wasm').read_bytes();assert old==new
print(json.dumps({'candidate_wasm_unchanged_from_failed_package':True,'sha256':hashlib.sha256(new).hexdigest(),'change':'JSON proof keys canonicalized to strings; no game bytes or comparison relaxed','old_failure_preserved':True,'game_executed':False}))
