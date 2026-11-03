"""Recheck retained failed captures only when shared verifier bytes changed."""
import hashlib
import json
from pathlib import Path
FILES = ('discovered-web.cjs', 'parser-resource-bindings.cjs', 'poki-startup-fallback.cjs', 'poki-sdk-declarations.cjs', 'adapters/runtime-resource-bindings.js', 'browser-options.cjs')
def revision(root):
    return hashlib.sha256('|'.join(hashlib.sha256((Path(root)/name).read_bytes()).hexdigest() for name in FILES).encode()).hexdigest()
def changed(run, root):
    report=Path(run)/'converted/evidence/runtime.json'
    if not report.is_file(): return False
    try: previous=json.loads(report.read_text('utf-8'))
    except (ValueError,OSError): return False
    current=revision(root)
    if previous.get('verifier_revision') == current: return False
    (Path(run)/'verifier-recheck.json').write_text(json.dumps({'previous':previous.get('verifier_revision'),'current':current,'reason':'Shared verifier changed; real runtime recheck required, no passed state copied'}),'utf-8')
    return True
