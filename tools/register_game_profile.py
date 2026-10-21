"""Version-bound descriptive metadata; does not modify runtime artifacts."""
import argparse
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from controlplane.game_catalog import normalize, export
from controlplane.service import Service
from controlplane.store import ident, now


def register(service, version_id, profile, revision):
    value = normalize(profile)
    with service.store.tx() as db:
        service.get(db, 'versions', version_id)
        previous = service.store.get(db, 'game_profiles', version_id) or {}
        if revision != previous.get('revision', 0):
            raise ValueError('档案已更新，请重新读取修订号')
        row = dict(id=version_id, profile=value, revision=revision+1, updated_at=now())
        service.store.put(db, 'game_profiles', row)
        service.store.put(db, 'game_profile_history', dict(row, id=ident('profile'), version_id=version_id))
    return row


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', required=True)
    parser.add_argument('--file', required=True)
    parser.add_argument('--revision', type=int, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    service = Service(root/'data', root/'game-library', 'http://127.0.0.1:8766')
    row = register(service, args.version, json.loads(Path(args.file).read_text('utf-8-sig')), args.revision)
    state = service.state()
    export(service.repo.root, state['candidates'], state['versions'])
    print('Registered profile revision', row['revision'], 'and exported catalog')
