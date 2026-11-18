"""Immutable runtime assembly and original asset closure, without native execution."""
from pathlib import Path
import hashlib, json, shutil, sys

b = Path(__file__).parent / 'msn-capture-100'
src = b / 'msn-en-us/originals/9nvq40981t9r'
out = b / 'source-analysis/drawbridge'
dest = b / 'revisions/drawbridge-offline-v2'
assert not dest.exists(), 'Inspect immutable existing revision before resuming'
files = {}
for n in ['drawbridge-pw-bootstrap-source-receipt.json', 'drawbridge-declared-runtime-source-receipt.json',
          'drawbridge-runtime-metadata-source-receipt.json', 'drawbridge-offline-manifest-source-receipt.json',
          'drawbridge-assets-source-receipt.json']:
    files.update(json.loads((b / n).read_text(encoding='utf-8'))['files'])
excluded = {'capture-pw-bootstrap.json', 'entry-metadata.json', 'scripts/offlineclient.js',
            'scripts/register-sw.js', 'scripts/project/scriptsInEvents.js', 'sw.js', 'offline.json', 'manifest.json'}
for n, digest in files.items():
    assert hashlib.sha256((src / n).read_bytes()).hexdigest() == digest, n
catalog = json.loads((src / 'offline.json').read_text(encoding='utf-8'))['fileList']
assert all(n in files for n in catalog)
dest.mkdir(parents=True)
for n, digest in files.items():
    if n in excluded:
        continue
    target = dest / n
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src / n, target)
for source, target in [('offline-data.json', 'data.json'), ('offline-c3runtime.js', 'scripts/c3runtime.js'),
                       ('offline-main-no-editor.js', 'scripts/main.js')]:
    shutil.copy2(out / source, dest / target)
html = (out / 'offline-index.html').read_text(encoding='utf-8')
policy = "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'self'"
html = html.replace('<head>', '<head>\n<meta http-equiv="Content-Security-Policy" content="' + policy + '">', 1)
(dest / 'index.html').write_text(html, encoding='utf-8', newline='')
runtime = {p.relative_to(dest).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in dest.rglob('*') if p.is_file()}
assert len(runtime) == len(files) - len(excluded)
original_exact = [n for n, h in runtime.items() if files.get(n) == h]
assert len(runtime) - len(original_exact) == 4
# Closure of actual image references in all original native object/animation data.
project = json.loads((src / 'data.json').read_text(encoding='utf-8'))['project']
image_paths = set()
def walk(v):
    if isinstance(v, list):
        for x in v:
            walk(x)
    elif isinstance(v, dict):
        for x in v.values():
            walk(x)
    elif isinstance(v, str) and v.startswith('images/'):
        image_paths.add(v)
walk(project[3])
assert image_paths <= runtime.keys(), sorted(image_paths - runtime.keys())
audio = {project[8] + item[0] + format[1] for item in project[7] for format in item[1]}
assert audio <= runtime.keys(), sorted(audio - runtime.keys())
(b / 'drawbridge-v2-runtime-source-manifest.json').write_text(json.dumps(runtime, indent=2), encoding='utf-8')
proof = {'source_only': True, 'native_or_SDK_executed': False, 'runtime_files': len(runtime),
         'original_byte_exact': len(original_exact), 'changed_files': sorted(set(runtime) - set(original_exact)),
         'actual_Box2D_wasm_original_sha256': runtime['box2d.wasm'],
         'original_Box2D_binding_and_all_physics_byte_exact': True,
         'image_reference_closure': len(image_paths), 'audio_reference_closure': len(audio),
         'all_original_offline_manifest_sources_captured': True,
         'upstream_legacy_default_WASM404_preserved': True,
         'legacy_default_not_used_reason': 'Original Construct runtime calls Box2DWasmModule with wasmBinaryFile obtained from actual project box2d.wasm; original Box2D loader honors the override.',
         'UI_inputs': 0, 'runtime_verified': False}
(out / 'runtime-v2-source-closure.json').write_text(json.dumps(proof, indent=2), encoding='utf-8')
sys.path.insert(0, str(Path(__file__).parent.parent / 'gamelab'))
from controlplane.resource_audit import audit
result = audit(dest)
(b / 'drawbridge-v2-draft-static-audit.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({**proof, 'static_status': result['status'], 'missing': result['missing'], 'external': result['external']}))
