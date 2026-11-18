"""Run only our own mixed-signature fixture; full original game is never instantiated."""
from pathlib import Path
import subprocess,json
from smash_profile_write_consumer_v12_20261118 import patch
b=Path(__file__).parent
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wat2wasm'),str(b/'smash_profile_write_fixture_v12_20261118.wat'),'-o',str(b/'smash_profile_write_fixture_v12_20261118.wasm')],capture_output=True,text=True,timeout=20);assert res.returncode==0,res.stderr
raw=(b/'smash_profile_write_fixture_v12_20261118.wasm').read_bytes();changed,proof=patch(raw,4,[(0,8),(1,8)]);(b/'smash_profile_write_fixture_v12_retired_20261118.wasm').write_bytes(changed)
assert proof['changed_previous_functions']==[4]and proof['previous_function_bodies_preserved']==2
res=subprocess.run(['node',str(b/'test_smash_profile_write_fixture_v12_20261118.cjs')],capture_output=True,text=True,encoding='utf8',timeout=20);assert res.returncode==0,res.stderr;print(res.stdout.strip())
