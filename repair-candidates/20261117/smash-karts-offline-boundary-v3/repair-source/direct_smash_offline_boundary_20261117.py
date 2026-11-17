"""Read original Photon offline-mode consumers; do not execute/patch the game."""
from pathlib import Path
import contextlib, io, json, struct, re, subprocess, hashlib

b = Path(__file__).parent
r = b / 'direct-games/job-3db06205247a'
outdir = r / 'analysis-20261117/offline-boundary'
outdir.mkdir(exist_ok=True)
source = (b / 'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source = source.replace('job-353d7339bf40', 'job-3db06205247a').replace('bpm2.wasm.unityweb', 'aedef0a7b3758084f1b210f292a2b27d.wasm.br')
source = source[:source.index('types=json.loads')]
ns = {'__file__': str(b / 'static-offline-reader.py')}
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(source, 'original-wasm-static-reader', 'exec'), ns)
memory, table, wasm = ns['memory'], ns['table'], ns['raw']
sections, leb, uleb = ns['sections'], ns['leb'], ns['uleb']
raw = (r / 'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
s, ss = struct.unpack_from('<II', raw, 24)
types, ts = struct.unpack_from('<II', raw, 160)
methods, ms = struct.unpack_from('<II', raw, 48)
images, ims = struct.unpack_from('<II', raw, 168)
def string(i):
    assert 0 <= i < ss
    return raw[s+i:raw.index(0, s+i, s+ss)].decode('utf8')

image_rows = []
for pos in range(images, images+ims, 40):
    name, assembly, start, count = struct.unpack_from('<IiiI', raw, pos)
    image_rows.append((string(name), start, count))
alltypes = []
for i in range(ts//88):
    p = types+i*88
    name, namespace = struct.unpack_from('<II', raw, p)
    start = struct.unpack_from('<i', raw, p+36)[0]
    count = struct.unpack_from('<H', raw, p+64)[0]
    image = [n for n, first, length in image_rows if first <= i < first+length]
    assert len(image) == 1
    alltypes.append(dict(index=i, name=string(name), namespace=string(namespace), image=image[0], start=start, count=count))
focus = [t for t in alltypes if t['name'] == 'PhotonNetwork' and t['namespace'] == 'Photon.Pun']
assert len(focus) == 1
module_name = focus[0]['image']
addresses = [m.start() for m in re.finditer(re.escape(module_name.encode()+b'\0'), memory)]
modules = []
for address in addresses:
    for hit in re.finditer(re.escape(struct.pack('<I', address)), memory):
        pos = hit.start()
        if pos%4 or pos+12 > len(memory):
            continue
        _, count, ptr = struct.unpack_from('<III', memory, pos)
        if not (0 < count < 200000 and ptr%4 == 0 and 0 < ptr < ptr+count*4 <= len(memory)):
            continue
        values = struct.unpack_from('<'+'I'*count, memory, ptr)
        if all(v == 0 or v in table for v in values):
            modules.append(dict(address=pos, name=module_name, method_count=count, pointers_address=ptr, values=values))
assert len(modules) == 1
module = modules[0]
provider_value = struct.unpack_from('<I', memory, 5562736+17827*4)[0]
assert provider_value>>29 == 1
provider_type = (provider_value&0x1fffffff)>>1
providers = [t for t in alltypes if struct.unpack_from('<i', raw, types+t['index']*88+8)[0] == provider_type]
assert len(providers) == 1 and providers[0]['image'] == module_name
provider = providers[0]
provider_cctor = None
for j in range(provider['start'], provider['start']+provider['count']):
    ni, decl, ret, rpt, ps, gc, tok, flags, iflags, slot, params = struct.unpack_from('<IiiiiiIHHHH', raw, methods+j*36)
    if string(ni) == '.cctor':
        provider_cctor = table[module['values'][(tok&0xffffff)-1]]
assert provider_cctor is not None
rows = []
for typ in focus:
    for j in range(typ['start'], typ['start']+typ['count']):
        ni, decl, ret, rpt, ps, gc, tok, flags, iflags, slot, params = struct.unpack_from('<IiiiiiIHHHH', raw, methods+j*36)
        assert decl == typ['index'] and tok>>24 == 6
        index = (tok&0xffffff)-1
        assert 0 <= index < module['method_count']
        ptr = module['values'][index]
        rows.append(dict(class_name=typ['name'], name=string(ni), token=tok, flags=flags, parameter_count=params,
                         function_index=table.get(ptr), table_index=ptr, method_index=j))
# This build renames Photon APIs too. Preserve the original aliases and inspect
# their bodies rather than assigning public SDK semantics from method order.
selected = [m for m in rows if m['function_index'] is not None]
props, prop_bytes = struct.unpack_from('<II', raw, 40)
tp = types+focus[0]['index']*88
prop_start = struct.unpack_from('<i', raw, tp+44)[0]
prop_count = struct.unpack_from('<H', raw, tp+66)[0]
property_rows = []
for i in range(prop_start, prop_start+prop_count):
    ni, get, set, attrs, token = struct.unpack_from('<IiiII', raw, props+i*20)
    assert token>>24 == 23
    property_rows.append(dict(name=string(ni), getter=rows[get]['name'] if get >= 0 else None,
                              setter=rows[set]['name'] if set >= 0 else None))
base_map = json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_text(encoding='utf8'))
base_functions = {m['function_index']:m for m in base_map['mapped_methods']}
selected_indices = {m['function_index'] for m in selected}
selected_indices.update(m['function_index'] for m in base_map['mapped_methods'] if
    m['class'] in {'PhotonConnectionManager', 'BotManager'} and m['name'] in {'Awake', 'Start', 'ciy', 'ciz', 'UnblockConnecting'} or
    m['class'] == 'GameManager' and m['name'] == 'StartRoundSpawn')
# Actual callees of original property setter ijq, not a method-order guess.
selected_indices.update({46206, 10503, 18605, 18607})
selected_indices.add(provider_cctor)
names = {m['function_index']: re.sub(r'\W', '_', m['class']+'_'+m['name'])+'_'+str(m['function_index']) for m in base_map['mapped_methods']}
for m in rows:
    if m['function_index'] is not None:
        names.setdefault(m['function_index'], 'PhotonNetwork_'+m['name']+'_'+str(m['function_index']))
sec = next(s for s in sections if s['kind'] == 10)
count, pos = leb(wasm, sec['start'])
payload = bytearray(uleb(count))
bodies = []
for i in range(count):
    length, pos = leb(wasm, pos)
    fn = ns['function_imports']+i
    original = wasm[pos:pos+length]
    body = original if fn in selected_indices else b'\0\0\x0b'
    if fn in selected_indices:
        bodies.append(dict(function_index=fn, bytes=length, sha256=hashlib.sha256(original).hexdigest()))
    payload.extend(uleb(len(body))+body)
    pos += length
assert pos == sec['end']
result = bytearray(wasm[:8])
for sec in sections:
    if sec['kind'] == 10:
        result.extend(bytes([10])+uleb(len(payload))+payload)
    elif sec['kind'] != 0:
        result.extend(wasm[sec['begin']:sec['end']])
name_payload = uleb(len(names))+b''.join(uleb(fn)+uleb(len(name.encode()))+name.encode() for fn, name in sorted(names.items()))
sub = b'\x01'+uleb(len(name_payload))+name_payload
custom = b'\x04name'+sub
result.extend(b'\0'+uleb(len(custom))+custom)
target = outdir/'offline-consumer-source-NOT-RUNTIME.wasm'
target.write_bytes(result)
decomp = outdir/'offline-consumer-source-NOT-RUNTIME.dcmp'
done = subprocess.run(['node', str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'), str(target), '-o', str(decomp)], capture_output=True, text=True, encoding='utf8', timeout=60)
assert done.returncode == 0, done.stderr
text = decomp.read_text(encoding='utf8')
snippets = []
for match in re.finditer(r'^function [^\n]+// func(\d+)\n', text, re.M):
    fn = int(match[1])
    if fn not in selected_indices:
        continue
    end = text.find('\nfunction ', match.start()+1)
    snippets.append(dict(function_index=fn, name=names.get(fn), source=text[match.start():end if end >= 0 else len(text)]))
assert len(snippets) == len(selected_indices), (len(snippets), len(selected_indices))
by_fn = {s['function_index']: s['source'] for s in snippets}
ctor_source = by_fn[provider_cctor]
assert '12647' in ctor_source and '(b[16]:ubyte ^ a) ^ 170' in ctor_source
assert re.search(r'\n\s+371,\n\s+41,', by_fn[46206])
field_value = struct.unpack_from('<I', memory, 5562736+39132*4)[0]
assert field_value>>29 == 4
field_ref = (field_value&0x1fffffff)>>1
refs, refs_bytes = struct.unpack_from('<II', raw, 184)
assert field_ref < refs_bytes//8
ref_type, ref_field = struct.unpack_from('<ii', raw, refs+field_ref*8)
type_matches = [t for t in alltypes if struct.unpack_from('<i', raw, types+t['index']*88+8)[0] == ref_type]
assert len(type_matches) == 1
field_start = struct.unpack_from('<i', raw, types+type_matches[0]['index']*88+32)[0]
field_index = field_start+ref_field
defaults, default_bytes = struct.unpack_from('<II', raw, 64)
default_data, default_data_bytes = struct.unpack_from('<II', raw, 72)
entries = [struct.unpack_from('<iii', raw, p) for p in range(defaults, defaults+default_bytes, 12)
           if struct.unpack_from('<i', raw, p)[0] == field_index]
assert len(entries) == 1
offset = entries[0][2]
assert 0 <= offset <= offset+12647 <= default_data_bytes
encoded = raw[default_data+offset:default_data+offset+12647]
decoded = bytes(v^(i&255)^170 for i,v in enumerate(encoded))
warning = decoded[371:371+41].decode('utf8')
assert warning == "Can't start OFFLINE mode while connected!"
assert '(b[23])[40]:ubyte == a' in by_fn[7186]
assert 'c[40] = a' in by_fn[7186] and 'f_zmo(' in by_fn[7186]
assert 'f_rmaa(' in by_fn[7186]
semantic = dict(property='qzt', getter='ijp', getter_function=96313, setter='ijq', setter_function=7186,
                warning=warning, warning_function=46206, provider_cctor=provider_cctor,
                original_field_index=field_index, original_field_ref=field_ref,
                encoded_rva_sha256=hashlib.sha256(encoded).hexdigest(),
                decoded_provider_sha256=hashlib.sha256(decoded).hexdigest(),
                conclusion='Original PUN OfflineMode implementation exists; this does not prove a game-level offline route.')
proof = dict(source_only=True, game_executed=False, original_modified=False,
             original_wasm_sha256=hashlib.sha256(wasm).hexdigest(), original_metadata_sha256=hashlib.sha256(raw).hexdigest(),
             module={k:v for k,v in module.items() if k != 'values'}, photon_methods=rows, photon_properties=property_rows,
             warning_string_provider=provider, warning_string_provider_cctor=provider_cctor,
             original_offline_mode_semantic_evidence=semantic,
             selected_original_bodies=bodies, snippets=snippets,
             limitation='Metadata/module/table identities are structural evidence; no offline gameplay or authentication completion is claimed.')
(outdir/'offline-consumer-source-proof.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps(dict(source_only=True, game_executed=False, module=proof['module'], methods=len(rows), offline_mode=semantic, excerpt_count=len(snippets)), ensure_ascii=False))
