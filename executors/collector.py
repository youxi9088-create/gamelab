"""Submit explicit collected files and metadata; does not crawl arbitrary URLs."""
import argparse
import json
import os
from pathlib import Path
from worker import Client, source_files


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--platform', default=os.environ.get('PLATFORM_URL', 'http://127.0.0.1:8765'))
    p.add_argument('--token', default=os.environ.get('PLATFORM_TOOL_TOKEN'))
    p.add_argument('--url', required=True, help='Original game URL recorded as provenance, not fetched')
    p.add_argument('--title', required=True)
    p.add_argument('--directory', required=True, help='Explicit already-collected static game directory')
    p.add_argument('--source', default='独立采集器')
    p.add_argument('--rights', choices=['unknown','owned','licensed','open'], default='unknown')
    p.add_argument('--observations', help='Optional JSON file containing actual gameplay observations')
    args = p.parse_args()
    if not args.token:
        p.error('Provide PLATFORM_TOOL_TOKEN')
    files = source_files(Path(args.directory).resolve(strict=True))
    observations = json.loads(Path(args.observations).read_text(encoding='utf-8')) if args.observations else {}
    client = Client(args.platform, args.token)
    result = client.post('candidates', {'title': args.title, 'url': args.url, 'source': args.source, 'rights': args.rights, 'observations': observations})
    bundle = client.post('source-bundles', {'candidate_id': result['candidate']['id'], 'files': files, 'entry': 'index.html'})
    print(json.dumps({'candidate_id': result['candidate']['id'], 'deduplicated': result['deduplicated'], 'bundle_id': bundle['bundle_id']}, ensure_ascii=False))


if __name__ == '__main__':
    main()

