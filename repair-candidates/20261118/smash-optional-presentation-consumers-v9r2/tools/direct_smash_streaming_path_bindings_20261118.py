"""Resolve original metadata method bindings; read data only, never run Wasm."""
from pathlib import Path
import struct, json, hashlib, contextlib, io, datetime

b = Path(__file__).parent
r = b / 'direct-games/job-3db06205247a'
out = r / 'analysis-20261118/streaming-path-bindings'
assert not out.exists()
raw = (r / 'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
assert hashlib.sha256(raw).hexdigest() == '01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
st, ss = struct.unpack_from('<II', raw, 24)
tt, ts = struct.unpack_from('<II', raw, 160)
mt, ms = struct.unpack_from('<II', raw, 48)
it, isz = struct.unpack_from('<II', raw, 168)

def string(i):
    assert 0 <= i < ss
    return raw[st+i:raw.index(0, st+i, st+ss)].decode('utf8')

images = []
for p in range(it, it+isz, 40):
    first, count = struct.unpack_from('<iI', raw, p+8)
    images.append((first, first+count, string(struct.unpack_from('<I', raw, p)[0])))
rows = []
for ti in range(ts//88):
    off = tt+88*ti
    name = string(struct.unpack_from('<I', raw, off)[0])
    namespace = string(struct.unpack_from('<I', raw, off+4)[0])
    if (namespace, name) not in [('UnityEngine', 'Application'), ('System', 'String')]:
        continue
    first = struct.unpack_from('<i', raw, off+36)[0]
    count = struct.unpack_from('<H', raw, off+64)[0]
    image = next(n for a, z, n in images if a <= ti < z)
    for mi in range(first, first+count):
        p = mt+36*mi
        method = string(struct.unpack_from('<I', raw, p)[0])
        if method not in ['get_streamingAssetsPath', 'Concat']:
            continue
        rows.append(dict(namespace=namespace, type=name, image=image, method=method,
                         method_index=mi, token=struct.unpack_from('<I', raw, p+24)[0],
                         parameter_count=struct.unpack_from('<H', raw, p+34)[0]))
src = (b / 'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
src = src[:src.index('types=json.loads')].replace('job-353d7339bf40', 'job-3db06205247a').replace('bpm2.wasm.unityweb', 'aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns = {'__file__': str(b / 'source-only-streaming-read.py')}
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(src, 'source-only-streaming-read', 'exec'), ns)
memory, table = ns['memory'], ns['table']
modules = {}
for image in sorted({x['image'] for x in rows}):
    candidates = []
    pos = 0
    while True:
        pos = memory.find(image.encode()+b'\0', pos)
        if pos < 0:
            break
        loc = 0
        while True:
            loc = memory.find(struct.pack('<I', pos), loc)
            if loc < 0:
                break
            if loc % 4 == 0 and loc+12 <= len(memory):
                n, p = struct.unpack_from('<II', memory, loc+4)
                if 0 < n < 200000 and p % 4 == 0 and 0 < p < p+n*4 <= len(memory):
                    values = struct.unpack_from('<'+'I'*n, memory, p)
                    if all(v == 0 or v in table for v in values):
                        candidates.append(dict(address=loc, count=n, pointer=p, values=values))
            loc += 1
        pos += len(image)+1
    assert len(candidates) == 1, (image, len(candidates))
    modules[image] = candidates[0]
for row in rows:
    module = modules[row['image']]
    token = (row['token'] & 0xffffff)-1
    assert 0 <= token < module['count']
    pointer = module['values'][token]
    row.update(table_index=pointer, function_index=table[pointer] if pointer else None)
assert any(x['method'] == 'get_streamingAssetsPath' and x['function_index'] == 6872 for x in rows)
assert any(x['method'] == 'Concat' and x['function_index'] == 676 and x['parameter_count'] == 3 for x in rows)
proof = dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(), source_only=True,
             game_executed=False, network_requests_made=0, original_modified=False,
             metadata_sha256=hashlib.sha256(raw).hexdigest(),
             wasm_sha256=hashlib.sha256(ns['raw']).hexdigest(), methods=rows,
             modules={n: {k:v for k,v in m.items() if k != 'values'} for n,m in modules.items()},
             limitations=['Metadata binding proves method identity; application execution and requests remain unobserved.'])
out.mkdir()
(out / 'original-path-method-bindings.json').write_bytes(json.dumps(proof, ensure_ascii=False, indent=2).encode())
print(json.dumps(proof, ensure_ascii=False))
