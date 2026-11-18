"""Execute only the self-authored fixture to verify base/focus preservation."""
from pathlib import Path
import subprocess
from smash_auth_consumers_v13_20261118 import patch
b=Path(__file__).parent
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wat2wasm'),str(b/'smash_auth_consumer_fixture_v13_20261118.wat'),'-o',str(b/'smash_auth_consumer_fixture_v13_20261118.wasm')],capture_output=True,text=True,timeout=20);assert res.returncode==0,res.stderr
raw=(b/'smash_auth_consumer_fixture_v13_20261118.wasm').read_bytes();changed,proof=patch(raw,[4,5,6],0,3);(b/'smash_auth_consumer_fixture_v13_retired_20261118.wasm').write_bytes(changed)
assert proof['changed_previous_functions']==[4,5,6]and proof['previous_function_bodies_total']==3
res=subprocess.run(['node',str(b/'test_smash_auth_consumer_fixture_v13_20261118.cjs')],capture_output=True,text=True,encoding='utf8',timeout=20);assert res.returncode==0,res.stderr;print(res.stdout.strip())
