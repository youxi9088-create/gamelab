"""Install the hash-pinned HGD core used by the resource workflow (no GUI/MCP server)."""
import hashlib
import json
import urllib.request
import subprocess
import sys
from pathlib import Path


def install():
    executors = Path(__file__).resolve().parents[1] / 'executors'
    lock = json.loads((executors / 'html-game-downloader.lock.json').read_text('utf-8'))
    root = executors / '.tools/html-game-downloader'
    # The reference parser imports HGD's HTTP module, which imports requests.
    # Keep this dependency isolated from the platform's Python environment.
    if not (root / 'requests/__init__.py').is_file():
        subprocess.run([sys.executable, '-m', 'pip', 'install', '--target', str(root), 'requests==2.32.5'], check=True)
    for name, expected in lock['files'].items():
        target = root / name
        if target.is_file() and hashlib.sha256(target.read_bytes()).hexdigest() == expected:
            continue
        url = f"https://raw.githubusercontent.com/PlatoMml/HtmlGameDownloader/{lock['commit']}/{name}"
        with urllib.request.urlopen(url, timeout=30) as response:
            data = response.read(2_000_001)
        if len(data) > 2_000_000 or hashlib.sha256(data).hexdigest() != expected:
            raise ValueError('HtmlGameDownloader source integrity check failed: ' + name)
        target.parent.mkdir(parents=True, exist_ok=True)
        temporary = target.with_suffix(target.suffix + '.tmp')
        temporary.write_bytes(data)
        temporary.replace(target)
    print('HtmlGameDownloader core installed: ' + lock['commit'])


if __name__ == '__main__':
    install()
