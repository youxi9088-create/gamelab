"""Offline preparation by default; online is read-only whoami, never submits."""
import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import shutil
import urllib.request
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from controlplane.supply import PREFIX, SupplyError, signature, build_archive, inspect_source, call, NoRedirect
from controlplane.supply_config import readiness, settings


def selftest():
    args = ('0123456789abcdef'*4, 'sup_0123456789abcdef', '1760000000', 'nonce000000000000000001')
    assert signature(*args, 'POST', PREFIX+'/extraction/submit', b'{"submission_id":"demo-0000000000000001"}') == 'e97806d91bb849a7ceceb913eab5303df903f2ae62dc3eec2a4a7dd0bee7a560'
    assert signature(*args, 'GET', PREFIX+'/extraction/issues?since_seq=3&submission_id=demo-0000000000000001', b'') == '3ca0df4e3037f539e47ab83b3b4013ecdc9408930b8fa5b641ba7c4e601ca6e7'
    return {'official_signature_vectors': 'PASS'}


def prepare(output):
    output = Path(output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    digest = build_archive(ROOT/'tests/fixtures/supply-game', output/'supply-probe.zip')
    draft = dict(submission_id='REPLACE_WITH_NEW_SUBMISSION_ID',
                 archive_url='REPLACE_WITH_HTTPS_DOWNLOAD_URL', archive_sha256=digest,
                 game_name='供货联调测试：信号收集',
                 license_declaration={'distributable': '', 'owner': '', 'note': '由供应方确认此联调样例的可分发声明后填写'},
                 acceptance_steps=[{'action': 'click', 'target': '#start'},
                                   {'action': 'click', 'target': '#target', 'playing': True},
                                   {'action': 'expect_visible', 'target': '#won'}],
                 known_limitations=['仅验证开始、点击获胜、重开；不代表商业游戏或模板复用质量'])
    (output/'submit.draft.json').write_text(json.dumps(draft, ensure_ascii=False, indent=2), encoding='utf-8')
    return {'archive': str(output/'supply-probe.zip'), 'sha256': digest, 'license_confirmed': False,
            'submission_sent': False}


def audit(db_path=ROOT/'data/platform.sqlite3'):
    # No Service initialization, reconciliation, acceptance or game reruns.
    with sqlite3.connect(Path(db_path).resolve().as_uri()+'?mode=ro', uri=True) as db:
        records = [(kind, json.loads(raw)) for kind, raw in db.execute(
            "select kind,data from records where kind in ('versions','candidates')")]
    candidates = {r['id']: r for kind, r in records if kind == 'candidates' and not r.get('observations', {}).get('catalog_hidden')}
    versions = sorted((r for kind, r in records if kind == 'versions'), key=lambda v: v.get('created_at', ''), reverse=True)
    seen, rows = set(), []
    for v in versions:
        cid = v['candidate_id']
        if cid not in candidates or cid in seen:
            continue
        seen.add(cid)
        result = dict(game=candidates[cid]['title'], version=v['id'], local_status=v['status'])
        try:
            source = (ROOT/'game-library'/v.get('source_directory', '')).resolve()
            if not v.get('source_directory') or not source.is_relative_to((ROOT/'game-library').resolve()):
                raise SupplyError('SOURCE_DIRECTORY_MISSING', 422)
            files, total = inspect_source(source)
            result.update(package_structure='PASS', files=len(files), uncompressed_bytes=total)
        except SupplyError as exc:
            result.update(package_structure='BLOCKED', reason=exc.code)
        license = (v.get('report', {}).get('supply') or {}).get('license_declaration') or {}
        result['distribution_declaration'] = bool(license.get('distributable') == 'yes' and license.get('owner'))
        result['ready_to_submit'] = False  # This structural audit cannot certify gameplay/licensing/connectivity.
        rows.append(result)
    return {'scope': 'latest visible versions; read-only structural audit', 'games': rows}


def probe_download(output):
    config = settings()
    directory = Path(config.get('SUPPLY_ARCHIVE_DIR', ''))
    url = urllib.parse.urlsplit(config.get('SUPPLY_ARCHIVE_BASE_URL', ''))
    if not directory.is_absolute() or url.scheme != 'https' or not url.hostname or url.username or url.query or url.fragment:
        raise SupplyError('DOWNLOAD_CONFIG_REQUIRED', 400)
    prepared = prepare(output)
    package = Path(prepared['archive'])
    name = 'connectivity-'+prepared['sha256'][:20]+'.zip'
    directory.mkdir(parents=True, exist_ok=True)
    target = directory/name
    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != prepared['sha256']:
        raise SupplyError('ARCHIVE_TARGET_CONFLICT', 409)
    if target.resolve() != package.resolve():
        shutil.copyfile(package, target)
    try:
        request = urllib.request.Request(config['SUPPLY_ARCHIVE_BASE_URL'].rstrip('/')+'/'+name)
        with urllib.request.build_opener(NoRedirect).open(request, timeout=30) as response:
            data = response.read(package.stat().st_size+1)
        if hashlib.sha256(data).hexdigest() != prepared['sha256']:
            raise SupplyError('DOWNLOAD_HASH_MISMATCH', 422)
    except SupplyError:
        raise
    except Exception:
        raise SupplyError('DOWNLOAD_UNREACHABLE_OR_REDIRECTED', 400) from None
    return {'download_from_this_machine': 'PASS', 'sha256': prepared['sha256'],
            'submission_sent': False, 'downstream_network_and_allowlist': 'not verified'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('selftest', 'prepare', 'status', 'audit', 'online', 'probe-download'))
    parser.add_argument('--output', default=str(ROOT/'data/supply-readiness'))
    parser.add_argument('--expected-fingerprint', help='下游管理页的 12 位授权码指纹；不是授权码')
    args = parser.parse_args()
    code = 0
    try:
        if args.command == 'selftest':
            result = selftest()
        elif args.command == 'prepare':
            result = {**selftest(), **prepare(args.output)}
        elif args.command == 'audit':
            result = audit()
        elif args.command == 'status':
            result = {**selftest(), 'configuration': readiness(), 'online_verified': False}
        elif args.command == 'probe-download':
            result = probe_download(args.output)
        else:
            config = settings()
            if not readiness()['configured']:
                raise SupplyError('CONFIG_REQUIRED', 400)
            fingerprint = hashlib.sha256(config['SUPPLY_APP_SECRET'].encode()).hexdigest()[:12]
            if not args.expected_fingerprint or args.expected_fingerprint != fingerprint:
                raise SupplyError('EXPECTED_FINGERPRINT_REQUIRED_OR_MISMATCH', 400)
            identity = call('GET', 'whoami')
            if identity.get('app_id') != config['SUPPLY_APP_ID']:
                raise SupplyError('SUPPLIER_IDENTITY_MISMATCH', 403)
            result = {'whoami': 'PASS', 'app_id': identity['app_id'], 'fingerprint_matches': True,
                      'submission_sent': False, 'download_reachability': 'requires downstream verification'}
    except SupplyError as exc:
        result, code = {'status': 'BLOCKED', 'code': exc.code}, 2
    except Exception:
        result, code = {'status': 'ERROR', 'code': 'LOCAL_CHECK_FAILED'}, 1
    Path(args.output).mkdir(parents=True, exist_ok=True)
    (Path(args.output)/(args.command+'.json')).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(result, ensure_ascii=True, indent=2))
    return code


if __name__ == '__main__':
    sys.exit(main())
