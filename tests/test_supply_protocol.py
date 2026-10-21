"""Exercise actual serialized requests/signatures against a downstream simulator."""
import hashlib
import hmac
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit, parse_qs
import urllib.error
import zipfile
import test_platform
from controlplane.supply import SupplyWorker, call, SupplyError
from controlplane.supply_config import readiness


class Downstream:
    def __init__(self, archive_dir):
        self.archive_dir = archive_dir
        self.nonces = set()
        self.payloads = []
        self.records = {}
        self.issue_queries = []

    def open(self, request, timeout):
        headers = {k.lower(): v for k, v in request.header_items()}
        assert headers['x-supply-app-id'] == 'sup_protocol'
        nonce = headers['x-supply-nonce']
        assert nonce not in self.nonces
        self.nonces.add(nonce)
        url = urlsplit(request.full_url)
        path = url.path + ('?'+url.query if url.query else '')
        body = request.data or b''
        signing = '\n'.join(['sup_protocol', headers['x-supply-timestamp'], nonce,
                             request.method, path, hashlib.sha256(body).hexdigest()])
        expected = hmac.new(b'protocol-secret', signing.encode(), hashlib.sha256).hexdigest()
        assert hmac.compare_digest(headers['x-supply-signature'], expected)
        assert url.scheme == 'https'
        query = parse_qs(url.query)
        if url.path.endswith('/whoami'):
            data = {'app_id': 'sup_protocol'}
        elif url.path.endswith('/submit'):
            assert timeout >= 330 and not url.query
            payload = json.loads(body)
            package = self.archive_dir/Path(urlsplit(payload['archive_url']).path).name
            assert hashlib.sha256(package.read_bytes()).hexdigest() == payload['archive_sha256']
            with zipfile.ZipFile(package) as archive:
                assert 'index.html' in archive.namelist()
            self.payloads.append(payload)
            sid = payload['submission_id']
            duplicate = sid in self.records
            self.records[sid] = payload
            if len(self.payloads) == 1:
                # Downstream accepted, but the response was lost.
                raise TimeoutError()
            data = {'submission_id': sid, 'state': 'queued', 'duplicate': duplicate}
        elif url.path.endswith('/status'):
            data = {'submission_id': query['submission_id'][0], 'state': 'published',
                    'state_text': '已上架', 'next_action': 'none', 'revision': 3,
                    'template': {'template_id': 'fixture-template', 'version': 1, 'certified': True}}
        elif url.path.endswith('/issues'):
            since = int(query['since_seq'][0])
            self.issue_queries.append(since)
            items = [{'seq': i, 'code': 'UNKNOWN_FUTURE_CODE', 'severity': 'info',
                      'title': '模拟问题', 'suggestion': '保留未知问题码'} for i in range(since+1, min(201, since+200)+1)]
            data = {'revision': 3, 'items': items, 'max_seq': 201, 'total': 201}
        else:
            raise AssertionError('Unexpected route')
        return io.BytesIO(json.dumps(data, ensure_ascii=False).encode())


class SupplyProtocolTests(unittest.TestCase):
    def test_acceptance_to_template_wire_contract_timeout_restart_and_paging(self):
        fixture = test_platform.PlatformTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
        s = fixture.s
        fixture.enqueue()
        job = fixture.completion(fixture.claim(), report={'supply': {
            'license_declaration': {'distributable': 'yes', 'owner': 'Isolated fixture'}}})
        s.mutate('/api/versions/'+job['version_id']+'/approve', {'checks': {'gameplay': True, 'visual': True}})
        directory = s.data_dir/'public'
        transport = Downstream(directory)
        environment = dict(SUPPLY_PLATFORM_BASE='https://platform.example', SUPPLY_APP_ID='sup_protocol',
            SUPPLY_APP_SECRET='protocol-secret', SUPPLY_ARCHIVE_DIR=str(directory),
            SUPPLY_EXPECTED_FINGERPRINT=hashlib.sha256(b'protocol-secret').hexdigest()[:12],
            SUPPLY_ARCHIVE_BASE_URL='https://files.example/games',
            SUPPLY_CONFIG_FILE=str(s.data_dir/'absent.json'))
        with patch.dict(os.environ, environment), patch('urllib.request.build_opener', return_value=transport):
            for _ in range(4):
                with s.store.tx() as db:
                    row = s.store.get(db, 'supply', job['version_id'])
                    row['next_poll'] = 0;s.store.put(db, 'supply', row)
                # New worker each time simulates a process restart.
                SupplyWorker(s).tick()
        row = s.state()['supply'][0]
        self.assertEqual(row['status'], 'done')
        self.assertEqual(row['state'], 'published')
        self.assertEqual(len(row['issues']), 201)
        self.assertEqual(transport.issue_queries, [0, 200])
        self.assertEqual(len(transport.records), 1)
        self.assertEqual(transport.payloads[0], transport.payloads[1])
        self.assertNotIn('protocol-secret', json.dumps(row))
        self.assertIsNone(s.state()['metrics']['production']['templates'])

    def test_401_nested_error_and_no_secret_in_exception(self):
        raw = json.dumps({'Message': 'rpc error: {"code":"SIGNATURE_INVALID","message":"do not store raw secrets"}'}).encode()
        error = urllib.error.HTTPError('https://platform.example/', 401, 'Unauthorized', {}, io.BytesIO(raw))
        with patch.dict(os.environ, {'SUPPLY_PLATFORM_BASE': 'https://platform.example',
                                     'SUPPLY_APP_ID': 'sup_test', 'SUPPLY_APP_SECRET': 'secret'}):
            with patch('urllib.request.OpenerDirector.open', side_effect=error):
                with self.assertRaises(SupplyError) as result:
                    call('GET', 'whoami')
        self.assertEqual(result.exception.code, 'SIGNATURE_INVALID')
        self.assertEqual(str(result.exception), 'SIGNATURE_INVALID')

    def test_private_config_file_and_invalid_url_are_reported_without_values(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/'config.json'
            path.write_text(json.dumps(dict(SUPPLY_PLATFORM_BASE='http://insecure.example',
                SUPPLY_APP_ID='sup_fixture', SUPPLY_APP_SECRET='private-key',
                SUPPLY_ARCHIVE_DIR=tmp, SUPPLY_ARCHIVE_BASE_URL='https://files.example')))
            with patch.dict(os.environ, {'SUPPLY_CONFIG_FILE': str(path)}, clear=True):
                status = readiness()
            self.assertFalse(status['configured'])
            self.assertIn('SUPPLY_PLATFORM_BASE_INVALID', status['errors'])
            self.assertNotIn('private-key', json.dumps(status))

    def test_download_probe_checks_published_zip_without_submitting(self):
        from tools.supply_readiness import probe_download
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)/'public'
            requests = []
            class Download:
                def open(self, request, timeout):
                    requests.append(request.full_url)
                    self_path = directory/Path(urlsplit(request.full_url).path).name
                    return io.BytesIO(self_path.read_bytes())
            env = {'SUPPLY_ARCHIVE_DIR': str(directory), 'SUPPLY_ARCHIVE_BASE_URL': 'https://files.example/game',
                   'SUPPLY_CONFIG_FILE': str(Path(tmp)/'absent.json')}
            with patch.dict(os.environ, env, clear=True), patch('urllib.request.build_opener', return_value=Download()):
                result = probe_download(Path(tmp)/'output')
            self.assertEqual(result['download_from_this_machine'], 'PASS')
            self.assertFalse(result['submission_sent'])
            self.assertEqual(len(requests), 1)
            self.assertIn('/connectivity-', requests[0])
