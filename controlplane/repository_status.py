"""Read Git display metadata without spawning commands on HTTP/statistics paths."""
from pathlib import Path
import re


def metadata(root):
    root = Path(root)
    result = {'path': str(root), 'strategy': 'monorepo', 'branch': None,
              'head': None, 'remote_configured': None}
    try:
        gitdir = root / '.git'
        if gitdir.is_file():
            pointer = gitdir.read_text('utf-8').strip()
            if not pointer.startswith('gitdir: '):
                return result
            gitdir = (root / pointer[8:]).resolve()
        common = gitdir
        if (gitdir / 'commondir').is_file():
            common = (gitdir / (gitdir / 'commondir').read_text('utf-8').strip()).resolve()
        head = (gitdir / 'HEAD').read_text('utf-8').strip()
        if head.startswith('ref: '):
            ref = head[5:]
            # References are metadata paths, never executable input.
            if not ref.startswith('refs/') or '..' in ref.split('/') or '\\' in ref or ':' in ref:
                return result
            result['branch'] = ref.removeprefix('refs/heads/')
            target = common / ref
            head = target.read_text('utf-8').strip() if target.is_file() else ''
            if not head and (common / 'packed-refs').is_file():
                for line in (common / 'packed-refs').read_text('utf-8').splitlines():
                    fields = line.split()
                    if len(fields) == 2 and fields[1] == ref:
                        head = fields[0]
                        break
        if re.fullmatch(r'[0-9a-fA-F]{40}|[0-9a-fA-F]{64}', head):
            result['head'] = head
        config = (common / 'config').read_text('utf-8')
        if re.search(r'^\s*\[remote\s+"', config, re.M | re.I):
            result['remote_configured'] = True
        elif not re.search(r'^\s*\[include', config, re.M | re.I):
            result['remote_configured'] = False
    except (OSError, UnicodeError):
        pass  # Unknown display metadata must not block operational records.
    return result
