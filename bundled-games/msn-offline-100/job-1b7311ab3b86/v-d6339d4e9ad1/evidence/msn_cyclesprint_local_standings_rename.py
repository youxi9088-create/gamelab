"""Rename one local helper, preserving all observed behavior and source bytes."""
from pathlib import Path
import hashlib, json, re, shutil, subprocess

b = Path(__file__).parent/'msn-capture-100'
old = b/'revisions/cyclesprint-offline-v1'
new = b/'revisions/cyclesprint-offline-v2'
assert not new.exists(), 'Inspect immutable revision before resuming'
raw = (old/'js/main.js').read_bytes()
source = raw.decode('utf-8')
inventory = json.loads((b/'source-analysis/cyclesprint/inventory.json').read_text(encoding='utf-8'))
decl = next(x for x in inventory['functions'] if x['name']=='getLeaderboard')
# The preceding original modifications lie before this helper; use the exact
# original function body as an independent anchor instead of shifted offsets.
original = (b/'msn-en-us/originals/9mvq9gxf024k/js/main.js').read_text(encoding='utf-8')
body = original[decl['start']:decl['end']]
assert source.count(body)==1 and 'getItem(' in body
assert not re.search(r'fetch|XMLHttpRequest|https?:|\$msstart',body)
tokens = list(re.finditer(r'\bgetLeaderboard\b',source))
assert len(tokens)==2
assert source[tokens[0].start()-9:tokens[0].start()]=='function '
assert source[tokens[1].start():tokens[1].end()+3]=='getLeaderboard(l)'
changed = re.sub(r'\bgetLeaderboard\b','readLocalTournamentStandings',source)
assert changed.replace('readLocalTournamentStandings','getLeaderboard')==source
shutil.copytree(old,new)
(new/'js/main.js').write_text(changed,encoding='utf-8',newline='')
result = subprocess.run(['node','--check',str(new/'js/main.js')],capture_output=True,text=True)
assert result.returncode==0,result.stderr
proof = {
 'native_id':'9mvq9gxf024k','observed_runtime_revision':old.name,
 'delivery_revision':new.name,
 'observed_runtime_main_sha256':hashlib.sha256(raw).hexdigest(),
 'delivery_main_sha256':hashlib.sha256((new/'js/main.js').read_bytes()).hexdigest(),
 'only_change':'Native top-level local standings declaration and its single original call renamed getLeaderboard -> readLocalTournamentStandings. Exactly two occurrences, no shadow/dynamic string references. Original localStorage body unchanged.',
 'exact_byte_reversal_equal':True,'syntax_check_exit_code':result.returncode,
 'native_function_anchor_from_original_AST_inventory':decl,
 'additional_gameplay_UI_inputs':0,'delivery_revision_UI_reloaded':False,
 'analysis_failures_preserved':'Three local Babel-analysis processes exited3221226505 without stderr, before creating v2; cause unknown, no native game execution. Replaced with exact original AST-span anchor plus two-token rename and syntax check.',
 'all_other_files_byte_exact_to_observed_runtime':True,
 'interpretation':'Existing five original UI observations apply through this exact local identifier rename. No claim that v2 was independently reloaded or another gameplay path was tested.'
}
for p in old.rglob('*'):
 if p.is_file() and p.relative_to(old).as_posix()!='js/main.js':assert p.read_bytes()==(new/p.relative_to(old)).read_bytes()
(b/'source-analysis/cyclesprint/local-standings-rename-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(proof))
