"""Provider-independent, bounded evidence tools for blocked conversion tasks."""
import base64
import hashlib
import json
from pathlib import Path
from revision_context import SourceContext


def linked(path):
    return path.is_symlink() or (hasattr(path, 'is_junction') and path.is_junction())


class RepairContext:
    def __init__(self, run):
        self.run = Path(run).resolve()

    def load(self):
        code = {}; total = 0
        candidates = [self.run / name for name in (
            'web-acquisition.json', 'web-capture.log', 'web-verify.log',
            'converted/evidence/runtime.json', 'web-original/source-entry.html')]
        for dirname in ('web-original', 'repair-sources', 'converted'):
            root = self.run / dirname
            if root.is_dir() and not linked(root):
                candidates += sorted(root.rglob('*'))[:2200]
        for p in candidates:
            if not p.is_file() or p.suffix.lower() not in ('.html', '.js', '.mjs', '.json', '.css', '.log'):
                continue
            if any(linked(parent) for parent in (p, *p.parents) if parent != self.run.parent):
                continue
            name = p.relative_to(self.run).as_posix()
            if name in code or any(s in name.split('/') for s in ('verification', 'platform-delivery')):
                continue
            size = p.stat().st_size
            if size > 4_000_000 or total + size > 12_000_000:
                continue
            code[name] = p.read_text('utf-8', errors='replace'); total += size
        self.context = SourceContext(code, 'web-original/source-entry.html')
        return {'source_inventory': [{'path': n, 'characters': len(t),
                    'sha256': hashlib.sha256(t.encode()).hexdigest(), 'editable': False} for n,t in code.items()],
                'source_excerpts': [self.context.read(n, 0, 20000) for n in (
                    'web-original/source-entry.html', 'web-acquisition.json', 'converted/evidence/runtime.json') if n in code]}

    def inspect(self, answer, payload):
        parts = self.context.reads(answer['read_requests']) if answer.get('read_requests') else []
        if answer.get('search_requests'): parts += self.context.search(answer['search_requests'])
        self.context.retain(payload, parts)
        return parts

    def images(self):
        for name in ('converted/screenshots/failed.png', 'converted/screenshots/current.png', 'original-runtime.png'):
            p = self.run / name
            if p.is_file() and not linked(p) and p.stat().st_size < 2_000_000:
                return [{'type': 'text', 'text': '本次失败步骤的实际截图：'+name},
                        {'type': 'image_url', 'image_url': {'url': 'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()}}]
        return []

    def configure(self, plan):
        """A plan selects a platform runtime contract; it cannot certify success."""
        if not isinstance(plan, dict) or plan.get('engine') not in ('defold', 'browser'):
            raise ValueError('运行契约尚无执行能力；保留分析证据，不能伪造适配成功')
        p = self.run / 'web-original/source-entry.html'
        source = p.read_text('utf-8')
        if plan.get('source_sha256') != hashlib.sha256(source.encode()).hexdigest():
            raise ValueError('入口证据已改变，必须重新分析')
        if plan['engine'] == 'defold' and ('EngineLoader.load(' not in source or 'dmloader.js' not in source):
            raise ValueError('入口不符合所选择的 Defold 加载契约')
        if plan['engine'] == 'browser' and '<script' not in source.lower():
            raise ValueError('通用浏览器探测需要实际脚本入口证据')
        if plan.get('sdk') not in (None, 'poki-offline'):
            raise ValueError('未知宿主契约')
        if plan.get('sdk') == 'poki-offline' and 'poki-sdk.js' not in source:
            raise ValueError('原入口没有声明该宿主 SDK')
        value = {k: plan.get(k) for k in ('engine', 'sdk', 'source_sha256')}
        path = self.run / 'runtime-plan.json'
        old = path.read_bytes() if path.exists() else None
        path.write_text(json.dumps(value), 'utf-8')
        return path, old
