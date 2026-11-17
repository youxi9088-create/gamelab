"""Resume the existing exact archive after the observed Windows Git path-length failure."""
from pathlib import Path
import json,hashlib,subprocess,os,datetime,types
b=Path(__file__).parent;repo=b/'github-direct-games-20261113';scope='repair-candidates/20261118/smash-original-resources-localized-v1';dst=repo/scope
receipt=json.loads((b/'direct-smash-resources-localized-v1-stage-receipt-20261118.json').read_text(encoding='utf8'))
assert receipt['complete']and receipt['job_unchanged']and not receipt['game_executed']and not receipt['ready_review']
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()=='37e0f8accf4b61af4f348a266d538dea61dfbb8e'
assert not subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=repo).strip()
status=subprocess.check_output(['git','status','--porcelain','-z'],cwd=repo).decode('utf8').rstrip('\0').split('\0')
assert status==['?? '+scope+'/'],status
manifest=json.loads((dst/'ARCHIVE_MANIFEST.json').read_text(encoding='utf8'))
assert len([p for p in dst.rglob('*')if p.is_file()])==len(manifest)+1
for n,h in manifest.items():assert hashlib.sha256((dst/n).read_bytes()).hexdigest()==h,n
assert hashlib.sha256((dst/'TRANSFER_MANIFEST.json').read_bytes()).hexdigest()==receipt['manifest_sha256']
add=subprocess.run(['git','-c','core.longpaths=true','add','-f','--',scope],cwd=repo,capture_output=True,text=True,encoding='utf8',errors='replace')
assert add.returncode==0,add.stderr
args=types.SimpleNamespace(message='将Smash原生资源路径接入本地候选并保留原游戏代码',output=str(b/'direct-smash-resources-localized-v1-github-receipt-20261118.json'))
source=(b/'archive_verified_repair_candidate_20261118.py').read_text(encoding='utf8')
tail=source[source.index("names=subprocess.check_output(['git','diff'"):]
exec(compile(tail,'verified-archive-long-path-resume','exec'),globals())
