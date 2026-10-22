"""Import only previously unknown games from a verified historical archive.

The original database and Git history remain in the archive. Old jobs, service
credentials and configuration never enter the live scheduler.
"""
import argparse
from contextlib import closing
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import sys
import tempfile
import zipfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.production_data import verify, write, now


def merge(archive, shared, apply=False):
    archive, shared = Path(archive).resolve(), Path(shared).resolve()
    if not archive.is_relative_to(shared / 'history'):
        raise ValueError('Keep the historical archive under shared/history')
    manifest = verify(archive)
    with zipfile.ZipFile(archive) as z, tempfile.TemporaryDirectory() as td:
        snapshot = Path(td) / 'platform.sqlite3'
        with z.open('data/platform.sqlite3') as src, snapshot.open('wb') as dst:
            shutil.copyfileobj(src, dst)
        with closing(sqlite3.connect(snapshot)) as old:
            records = [(k, json.loads(v)) for k, v in old.execute('SELECT kind,data FROM records')]
        with closing(sqlite3.connect(shared / 'data/platform.sqlite3', timeout=30)) as db:
            db.execute('BEGIN IMMEDIATE')
            existing = {(k, i): json.loads(v) for k, i, v in db.execute('SELECT kind,id,data FROM records')}
            candidates = [v for (k, _), v in existing.items() if k == 'candidates']
            urls = {v.get('canonical_url') or v.get('url') for v in candidates}
            selected = [v for k, v in records if k == 'candidates'
                        and ('candidates', v['id']) not in existing
                        and not v.get('observations', {}).get('catalog_hidden')
                        and (v.get('canonical_url') or v.get('url')) not in urls]
            ids = {v['id'] for v in selected}
            versions = [v for k, v in records if k == 'versions' and v.get('candidate_id') in ids]
            artifact_ids = {v['artifact_id'] for v in versions}
            artifacts = [v for k, v in records if k == 'artifacts' and v['id'] in artifact_ids]
            if {v['id'] for v in artifacts} != artifact_ids:
                raise ValueError('Missing artifact records')
            rows = [('candidates', v) for v in selected] + [('versions', v) for v in versions] + [('artifacts', v) for v in artifacts]
            rows += [(k, v) for k, v in records if k in ('game_profiles', 'game_specs', 'game_test_runs')
                     and (v.get('candidate_id') in ids or v.get('id') in ids)]
            for k, v in rows:
                if (k, v['id']) in existing:
                    raise ValueError('Record ID collision: ' + k + '/' + v['id'])
            names = {r['path'] for r in manifest['files']}
            for a in artifacts:
                if f"data/artifacts/{a['id']}/{a['entry']}" not in names:
                    raise ValueError('Missing playable entry: ' + a['id'])
            report = {'created_at': now(), 'archive': str(archive), 'games': [{'id': v['id'], 'title': v['title']} for v in selected],
                      'versions': len(versions), 'imported_jobs': 0, 'applied': False}
            if not apply:
                return report
            if not existing.get(('settings', 'maintenance'), {}).get('draining'):
                raise ValueError('Pause new work before importing')
            if any(k == 'jobs' and v.get('status') == 'running' for (k, _), v in existing.items()):
                raise ValueError('Wait for running conversions')
            prefixes = tuple([f'data/artifacts/{i}/' for i in artifact_ids]
                             + [f'game-library/games/{i}/' for i in ids])
            for row in manifest['files']:
                name = row['path']
                if not name.startswith(prefixes):
                    continue
                target = shared / name
                if target.exists():
                    with target.open('rb') as f:
                        if hashlib.file_digest(f, 'sha256').hexdigest() != row['sha256']:
                            raise ValueError('File collision: ' + name)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with z.open(name) as src, target.open('xb') as dst:
                        shutil.copyfileobj(src, dst)
            imported_commit = None
            if ids:
                from controlplane.repository import Repository
                repository = Repository(shared / 'game-library', shared / 'data/artifacts')
                paths = [f'games/{i}' for i in sorted(ids) if (repository.root / 'games' / i).exists()]
                if paths:
                    repository.run('add', '--', *paths)
                    if repository.run('diff', '--cached', '--name-only', '--', *paths):
                        repository.run('-c', 'user.name=Game Library Bot', '-c', 'user.email=game-library@localhost',
                                       'commit', '-m', 'Import unique games from local history', '--', *paths)
                    imported_commit = repository.run('rev-parse', 'HEAD')
            for k, v in rows:
                v['history_origin'] = {'archive': archive.name, 'imported_at': report['created_at']}
                if k == 'versions':
                    # Historical acceptance and status are preserved without running checks.
                    a = next(a for a in artifacts if a['id'] == v['artifact_id'])
                    prefix = '/runtime/' if a.get('runtime_local') else '/play/'
                    v['preview_url'] = prefix + a['id'] + '/' + a['entry']
                    for field in ('cover', 'screenshots'):
                        def relative(url):
                            if isinstance(url, str) and url.startswith(('http://127.0.0.1:', 'http://localhost:')):
                                from urllib.parse import urlsplit
                                return urlsplit(url).path
                            return url
                        if field in v:
                            v[field] = [relative(u) for u in v[field]] if isinstance(v[field], list) else relative(v[field])
                    v['history_source_directory'] = v.get('source_directory')
                    v['source_directory'] = str(shared / 'game-library/games' / v['candidate_id'] / 'versions' / v['id'])
                    v['history_commit'] = v.get('commit')
                    v['commit'] = imported_commit
                db.execute('INSERT INTO records VALUES (?,?,?)', (k, v['id'], json.dumps(v, ensure_ascii=False)))
            db.commit()
            report['applied'] = True
            write(shared / 'history' / (archive.stem + '-import.json'), report)
            return report


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--archive', required=True)
    p.add_argument('--shared', required=True)
    p.add_argument('--apply', action='store_true')
    args = p.parse_args()
    print(json.dumps(merge(args.archive, args.shared, args.apply), ensure_ascii=False))
