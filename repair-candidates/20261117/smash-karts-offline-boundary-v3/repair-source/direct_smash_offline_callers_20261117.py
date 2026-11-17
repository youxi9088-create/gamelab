"""Disassemble original Wasm statically and retain exact OfflineMode call sites."""
from pathlib import Path
import subprocess, re, json, time, hashlib, struct, sys

b = Path(__file__).parent
r = b/'direct-games/job-3db06205247a'
folder = r/'analysis-20261117/offline-boundary'
source = (b/'direct_smash_offline_boundary_20261117.py').read_text(encoding='utf8')
ns = {'__file__':str(b/'static-callsite-reader.py')}
exec(compile(source[:source.index('\nrows = []')], 'read-original-tables', 'exec'), ns)
targets = {7186:'original_offline_mode_setter', 96313:'original_offline_mode_getter'}
connect = '--connect-callers' in sys.argv
if connect:
    targets[41676] = 'original_ilc_with_explicit_offline_boolean_branch'
wasm_path = r/'native-build-20261117/aedef0a7b3758084f1b210f292a2b27d.wasm.br'
started = time.monotonic()
process = subprocess.Popen(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-objdump'),'-d',str(wasm_path)],
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf8', errors='strict')
current = None
functions = set()
calls = []
try:
    for line in process.stdout:
        if time.monotonic()-started > 100:
            raise TimeoutError('Bounded original disassembly exceeded 100 seconds')
        if 'func[' in line and line.rstrip().endswith(':'):
            match = re.search(r'\bfunc\[(\d+)\]', line)
            if match:
                current = int(match[1])
                functions.add(current)
        if ' call ' not in line:
            continue
        call = re.search(r'\|\s+call (\d+)(?:\s|$)', line)
        if call and int(call[1]) in targets:
            assert current is not None
            calls.append(dict(caller_function=current, target_function=int(call[1]),
                              target_semantics=targets[int(call[1])], original_instruction=line.strip()))
    stderr = process.stderr.read()
    assert process.wait(timeout=10) == 0, stderr
finally:
    if process.poll() is None:
        process.kill()
assert len(functions) > 100000, len(functions)
modules = {ns['module_name']:ns['module']}
original_map = json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_text(encoding='utf8'))
modules.update(original_map['modules'])
memory, table, raw = ns['memory'], ns['table'], ns['raw']
aliases = {}
for typ in ns['alltypes']:
    if typ['image'] not in modules:
        continue
    module = modules[typ['image']]
    for j in range(typ['start'],typ['start']+typ['count']):
        ni, decl, ret, rpt, ps, gc, tok, flags, iflags, slot, params = struct.unpack_from('<IiiiiiIHHHH',raw,ns['methods']+j*36)
        assert decl == typ['index']
        ordinal = (tok&0xffffff)-1
        assert 0 <= ordinal < module['method_count']
        ptr = struct.unpack_from('<I',memory,module['pointers_address']+ordinal*4)[0]
        fn = table.get(ptr)
        if fn is not None:
            aliases.setdefault(fn,[]).append(dict(type=typ['name'], namespace=typ['namespace'],
                                                  method=ns['string'](ni), image=typ['image'], token=tok))
for row in calls:
    row['caller_metadata_aliases'] = aliases.get(row['caller_function'],[])
proof = dict(source_only=True,game_executed=False,original_game_modified=False,
             original_wasm_sha256=hashlib.sha256(ns['wasm']).hexdigest(),
             disassembler='wabt wasm-objdump -d original file; actual call opcodes, not byte-pattern matching',
             defined_functions_disassembled=len(functions), calls=calls,
             duration_seconds=round(time.monotonic()-started,3),
             limitation='Direct call instructions only; delegate/table/reflection entry points require separate inspection. No offline gameplay proof.')
(folder/('original-offline-connect-direct-call-sites.json' if connect else 'original-offline-direct-call-sites.json')).write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(proof,ensure_ascii=False))
