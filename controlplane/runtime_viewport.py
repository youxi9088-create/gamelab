"""Install the shared viewport before verification, never into stored artifacts.

Local importers may call prepare on their staging directory before verifying it.
Only explicit, consistent portrait Cocos Canvas records are auto-detected.
"""
import hashlib
import json
import re
from pathlib import Path

ADAPTER = Path(__file__).resolve().parents[1] / 'executors/adapters/runtime-viewport.js'


def validate(value):
    if not isinstance(value, dict) or value.get('fit') != 'contain':
        raise ValueError('Viewport requires contain metadata')
    for key in ('width', 'height'):
        n = value.get(key)
        if isinstance(n, bool) or not isinstance(n, int) or not 100 <= n <= 8192:
            raise ValueError('Invalid design viewport dimension')
    return value


def detect(root):
    found = []
    def walk(value, source):
        if isinstance(value, list):
            for item in value: walk(item, source)
        elif isinstance(value, dict):
            if value.get('__type__') == 'cc.Canvas':
                size = value.get('_designResolution', {})
                if not isinstance(size, dict): size = {}
                found.append((size.get('width'), size.get('height'), value.get('_fitWidth') is True,
                              value.get('_fitHeight', False) is False, source))
            for item in value.values(): walk(item, source)
    for file in sorted((root / 'assets').rglob('*.json')):
        if file.stat().st_size > 8_000_000: continue
        try: walk(json.loads(file.read_text('utf-8')), file.relative_to(root).as_posix())
        except (ValueError, RecursionError): continue
    if not found or len({v[:4] for v in found}) != 1: return None
    width, height, fit_width, fit_height_off, _ = found[0]
    if not isinstance(width, int) or not isinstance(height, int) or width >= height or not fit_width or not fit_height_off:
        return None
    return validate({'width': width, 'height': height, 'fit': 'contain',
                     'basis': 'Consistent original cc.Canvas portrait designResolution with fitWidth',
                     'sources': sorted({v[4] for v in found})})


def prepare(root, engine=None):
    root = Path(root)
    metadata = root / 'runtime-viewport.json'
    if metadata.exists():
        return validate(json.loads(metadata.read_text('utf-8'))), {}
    config = detect(root) if engine == 'cocos2' else None
    if not config: return None, {}
    entry = root / 'index.html'
    html = entry.read_text('utf-8')
    canvas = re.search(r'<canvas\b[^>]*\bid=["\']GameCanvas["\'][^>]*>\s*</canvas>', html, re.I)
    if not canvas or 'ReplicaRuntimeViewport' in html: return None, {}
    script = ('\n<script src="runtime-viewport.js"></script><script>'
              'ReplicaRuntimeViewport.mount(document.getElementById("GameCanvas"),'
              + json.dumps({k: config[k] for k in ('width', 'height', 'fit')}) + ');</script>\n')
    config['entry_before_sha256'] = hashlib.sha256(entry.read_bytes()).hexdigest()
    changes = {'index.html': html[:canvas.end()] + script + html[canvas.end():],
               'runtime-viewport.js': ADAPTER.read_text('utf-8'),
               'runtime-viewport.json': json.dumps(config, ensure_ascii=False, indent=2)}
    for name, text in changes.items(): (root / name).write_text(text, 'utf-8')
    return config, changes
