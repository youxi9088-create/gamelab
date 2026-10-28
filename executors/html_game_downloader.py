"""Use upstream HGD's reference parser; platform owns fetching and verification."""
import hashlib
import json
import sys
from pathlib import Path


def extract(documents):
    base = Path(__file__).resolve().parent
    lock = json.loads((base / 'html-game-downloader.lock.json').read_text('utf-8'))
    root = base / '.tools/html-game-downloader'
    for name, expected in lock['files'].items():
        path = root / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError('HtmlGameDownloader missing or changed; run tools/install_html_game_downloader.py')
    if not isinstance(documents, list) or len(documents) > 20:
        raise ValueError('HtmlGameDownloader document limit exceeded')
    if sum(len(d['text']) for d in documents) > 2_000_000:
        raise ValueError('HtmlGameDownloader input limit exceeded')
    sys.path.insert(0, str(root))
    from hgd.core.mirror import extract_refs
    refs = []
    for document in documents:
        for url in extract_refs(document['text'], document['url']):
            refs.append({'url': url, 'source': document['url']})
            if len(refs) >= 1000:
                break
        if len(refs) >= 1000:
            break
    return {'tool': 'HtmlGameDownloader', 'commit': lock['commit'], 'status': 'completed', 'references': refs}


if __name__ == '__main__':
    try:
        request = json.loads(sys.stdin.buffer.read(8_000_001))
        result = extract(request['documents'])
    except Exception as error:
        result = {'tool': 'HtmlGameDownloader', 'status': 'unavailable', 'error': str(error)[:400], 'references': []}
    sys.stdout.buffer.write(json.dumps(result, ensure_ascii=False).encode('utf-8'))
