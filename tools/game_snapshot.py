"""Export accepted games, or restore a snapshot into a NEW platform data directory."""
import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def select(value, fields):
    return {k: value[k] for k in fields.split() if k in value}


def digest(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def export(data, destination):
    if destination.exists():
        raise ValueError('Snapshot destination must not exist')
    records = {}
    with closing(sqlite3.connect(data.resolve().as_uri() + '/platform.sqlite3?mode=ro', uri=True)) as db:
        for kind, raw in db.execute('SELECT kind,data FROM records'):
            records.setdefault(kind, []).append(json.loads(raw))
    games = []
    for candidate in records['candidates']:
        versions = [v for v in records['versions'] if v['candidate_id'] == candidate['id']
                    and v['status'] in ('approved', 'published')]
        if not versions or candidate.get('observations', {}).get('catalog_hidden'):
            continue
        version = max(versions, key=lambda v: (v.get('created_at', ''), v['id']))
        artifact = next(a for a in records['artifacts'] if a['id'] == version['artifact_id'])
        source = data / 'artifacts' / artifact['id']
        folder = Path('games') / candidate['id'] / version['id']
        if not (source / artifact['entry']).is_file():
            raise ValueError('Missing entry: ' + str(source))
        shutil.copytree(source, destination / folder)
        c = select(candidate, 'id title original_title url canonical_url source category engine description rights status created_at imported_at')
        # The snapshot represents this accepted version, not an unrelated newer draft.
        c['status'] = version['status']
        if version['status'] == 'published':
            c['published_version_id'] = version['id']
        v = select(version, 'id candidate_id artifact_id title status entry created_at approved_at published_at checks acceptance_scope preview preview_mode game_profile')
        a = select(artifact, 'id runtime_local created_at size sha256 entry files')
        games.append(dict(candidate=c, version=v, artifact=a, folder=folder.as_posix()))
    manifest = dict(schema_version=1, games=games)
    destination.mkdir(parents=True, exist_ok=True)
    (destination / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    seal(destination)
    return manifest


def seal(snapshot):
    hashes = {p.relative_to(snapshot).as_posix(): digest(p)
              for p in sorted(snapshot.rglob('*')) if p.is_file() and p.name != 'SHA256SUMS.json'}
    (snapshot / 'SHA256SUMS.json').write_text(json.dumps(hashes, indent=2), encoding='utf-8')


def inside(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('Path outside snapshot')
    return path


def verify(snapshot):
    hashes = json.loads((snapshot / 'SHA256SUMS.json').read_text(encoding='utf-8'))
    actual = {p.relative_to(snapshot).as_posix() for p in snapshot.rglob('*') if p.is_file() and p.name != 'SHA256SUMS.json'}
    if actual != set(hashes):
        raise ValueError('Snapshot file inventory mismatch')
    for relative, expected in hashes.items():
        if digest(inside(snapshot, relative)) != expected:
            raise ValueError('Snapshot hash mismatch: ' + relative)
    return json.loads((snapshot / 'manifest.json').read_text(encoding='utf-8'))


def restore(snapshot, data, play_url):
    manifest = verify(snapshot)
    if data.exists() and any(data.iterdir()):
        raise ValueError('Restore requires an empty data directory; existing data is never overwritten')
    from controlplane.store import Store
    store = Store(data / 'platform.sqlite3')
    with store.tx() as db:
        for game in manifest['games']:
            a, v, c = game['artifact'].copy(), game['version'].copy(), game['candidate'].copy()
            source = inside(snapshot, game['folder'])
            target = inside(data / 'artifacts', a['id'])
            shutil.copytree(source, target)
            # Older imports carried their playable site in a ZIP alongside a launcher.
            archive = target / 'web-runtime.zip'
            if archive.is_file():
                with zipfile.ZipFile(archive) as package:
                    if 'index.html' not in package.namelist():
                        raise ValueError('Runtime archive has no index.html')
                    for name in package.namelist():
                        inside(target / 'runtime', name)
                    package.extractall(target / 'runtime')
                a['snapshot_original_sha256'] = a.get('sha256')
                a['entry'] = v['entry'] = 'runtime/index.html'
                files = sorted(p.relative_to(target).as_posix() for p in target.rglob('*') if p.is_file())
                a['files'] = files
                sha = hashlib.sha256()
                for name in files:
                    sha.update(name.encode() + b'\0' + (target / name).read_bytes())
                a['sha256'] = sha.hexdigest()
                a['size'] = sum((target / name).stat().st_size for name in files)
            # Use the existing independent runtime host so fetch/localStorage work
            # for imported engines as well as automatically converted games.
            a['runtime_local'] = True
            v['preview_mode'] = 'external'
            prefix = '/runtime/' if a.get('runtime_local') else '/play/'
            v['preview_url'] = play_url.rstrip('/') + prefix + a['id'] + '/' + a['entry']
            screenshots = [f for f in a['files'] if f.startswith('screenshots/') and f.endswith(('.png', '.jpg', '.webp'))]
            v['screenshots'] = [play_url.rstrip('/') + prefix + a['id'] + '/' + f for f in screenshots]
            if v['screenshots']:
                v['cover'] = v['screenshots'][0]
            v['snapshot_origin'] = 'bundled-games/manifest.json'
            for kind, value in [('candidates', c), ('versions', v), ('artifacts', a)]:
                store.put(db, kind, value)
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['export', 'verify', 'restore', 'seal'])
    parser.add_argument('--snapshot', type=Path, default=ROOT / 'bundled-games')
    parser.add_argument('--data-dir', type=Path, default=ROOT / 'data')
    parser.add_argument('--play-url', default='http://127.0.0.1:8766')
    args = parser.parse_args()
    if args.action == 'export':
        result = export(args.data_dir, args.snapshot)
    elif args.action == 'restore':
        result = restore(args.snapshot, args.data_dir, args.play_url)
    elif args.action == 'seal':
        seal(args.snapshot)
        result = verify(args.snapshot)
    else:
        result = verify(args.snapshot)
    print(json.dumps({'games': len(result['games']), 'titles': [g['candidate']['title'] for g in result['games']]}, ensure_ascii=False))
