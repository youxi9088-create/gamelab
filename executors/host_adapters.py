"""Upgrade only a recognized generated host in a new working copy."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
POKI_V1 = 'c27edef93a407683c43e097f7ee84ab58ef0c037289ab6daff6a0c1eb4122c92'


def refresh(target, acquisition):
    if not any(p.get('kind') == 'poki-offline' for p in acquisition.get('patches', [])):
        return {}
    host = target / 'runtime-host.js'
    if not host.is_file() or host.is_symlink():
        return {}
    before = host.read_text('utf-8')
    old_hash = hashlib.sha256(before.encode()).hexdigest()
    # Do not discard a previously customized or AI-modified host.
    if old_hash != POKI_V1:
        return {}
    after = (ROOT / 'adapters/poki-offline.js').read_text('utf-8')
    host.write_text(after, 'utf-8')
    evidence = target / 'evidence'
    evidence.mkdir(exist_ok=True)
    (evidence / 'host-adaptation.json').write_text(json.dumps({
        'adapter': 'poki-offline', 'policy': 'poki-sitelock-v1',
        'before_sha256': old_hash, 'after_sha256': hashlib.sha256(after.encode()).hexdigest(),
        'scope': 'Known host navigation only; original engine and game archive unchanged. Runtime verification required.',
    }, indent=2), 'utf-8')
    return {'runtime-host.js': after}
