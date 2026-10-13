"""Behavioral tests; all state, artifacts and Git history use disposable directories."""
import concurrent.futures
import json
import io
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

from controlplane.service import Service, ApiError
from controlplane.store import later
from server import build_server


class PlatformTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = Path(self.tmp.name)
        self.s = Service(root / 'data', root / 'repo', 'http://127.0.0.1:8766')
        self.tool, self.token = self.register('worker', ['collect', 'rea', 'reconstruct'])

    def register(self, name, caps):
        result = self.s.mutate('/api/tools', {'name': name, 'capabilities': caps})
        return result['tool'], result['token']

    def candidate(self, url='https://example.org/game', rights='owned', tool=None):
        return self.s.mutate('/api/v1/candidates' if tool else '/api/candidates',
                             {'title': 'Fixture', 'url': url, 'rights': rights}, tool)['candidate']

    def enqueue(self, candidate=None):
        candidate = candidate or self.candidate()
        batch = self.s.mutate('/api/batches', {'name': 'Test', 'candidate_ids': [candidate['id']]})['batch']
        self.s.mutate('/api/batches/' + batch['id'] + '/start', {})
        return candidate

    def claim(self, tool=None):
        return self.s.mutate('/api/v1/jobs/claim', {'capabilities': ['rea', 'reconstruct']}, tool or self.tool)['job']

    def completion(self, job, outcome='recovered'):
        artifact = self.s.mutate('/api/v1/artifacts', {'job_id': job['id'], 'lease_token': job['lease_token'],
            'files': {'index.html': '<html><body>Owned test fixture</body></html>', 'src/main.js': 'const version = 1;'}, 'entry': 'index.html'}, self.tool)
        return self.s.mutate('/api/v1/jobs/' + job['id'] + '/complete', {'lease_token': job['lease_token'],
            'outcome': outcome, 'artifact_id': artifact['artifact_id'], 'report': {'smoke': True}}, self.tool)['job']

    def expect_error(self, status, call):
        with self.assertRaises(ApiError) as error:
            call()
        self.assertEqual(status, error.exception.status)

    def test_credentials_capabilities_and_no_token_disclosure(self):
        self.assertEqual(self.tool['id'], self.s.authenticate(self.token)['id'])
        self.expect_error(401, lambda: self.s.authenticate('wrong'))
        restricted, _ = self.register('analyzer', ['rea'])
        self.expect_error(403, lambda: self.candidate(tool=restricted))
        self.expect_error(403, lambda: self.s.mutate('/api/v1/settings', {}, self.tool))
        self.assertNotIn(self.token, json.dumps(self.s.state()))
        self.s.mutate('/api/tools/' + self.tool['id'] + '/toggle', {})
        self.expect_error(403, lambda: self.s.authenticate(self.token))

    def test_canonical_dedup_retains_multiple_tool_sources(self):
        first = self.candidate('https://EXAMPLE.org/game/?b=2&utm_source=x&a=1#top', tool=self.tool)
        second_tool, _ = self.register('collector2', ['collect'])
        second = self.candidate('https://example.org/game?a=1&b=2', tool=second_tool)
        self.assertEqual(first['id'], second['id'])
        self.assertEqual(2, len(second['source_records']))
        self.assertEqual(1, len(self.s.state()['candidates']))

    def test_idempotency_replay_and_conflict(self):
        body = {'title': 'Idempotent', 'url': 'https://example.org/a'}
        a = self.s.mutate('/api/v1/candidates', body, self.tool, 'event-1')
        b = self.s.mutate('/api/v1/candidates', body, self.tool, 'event-1')
        self.assertEqual(a, b)
        self.expect_error(409, lambda: self.s.mutate('/api/v1/candidates', dict(body, title='Changed'), self.tool, 'event-1'))

    def test_lease_claim_is_exclusive_under_concurrency(self):
        self.enqueue()
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            claims = list(pool.map(lambda _: self.claim(), range(4)))
        self.assertEqual(1, sum(job is not None for job in claims))
        job = next(j for j in claims if j)
        state_job = self.s.state()['jobs'][0]
        self.assertNotIn('lease_token', state_job)
        another, _ = self.register('other', ['rea'])
        self.expect_error(409, lambda: self.s.mutate('/api/v1/jobs/' + job['id'] + '/heartbeat', {'lease_token': job['lease_token']}, another))

    def test_expired_lease_cannot_overwrite_new_attempt(self):
        self.enqueue()
        first = self.claim()
        with self.s.store.tx() as db:
            job = self.s.get(db, 'jobs', first['id'])
            job['lease_expires_at'] = later(-10)
            self.s.store.put(db, 'jobs', job)
        second = self.claim()
        self.assertNotEqual(first['lease_token'], second['lease_token'])
        self.expect_error(409, lambda: self.s.mutate('/api/v1/jobs/' + first['id'] + '/complete', {'lease_token': first['lease_token'], 'outcome': 'fallback'}, self.tool))

    def test_artifact_paths_reject_traversal(self):
        self.enqueue()
        job = self.claim()
        for path in ('../outside.js', '/absolute.js', 'C:/escape.js', '.git/config', 'CON', 'a\\b.js'):
            with self.subTest(path=path):
                self.expect_error(400, lambda: self.s.mutate('/api/v1/artifacts', {'job_id': job['id'], 'lease_token': job['lease_token'],
                    'files': {'index.html': 'ok', path: 'bad'}, 'entry': 'index.html'}, self.tool))
        self.assertFalse((Path(self.tmp.name) / 'outside.js').exists())

    def test_fallback_queues_reconstruction_and_cannot_skip_stage(self):
        self.enqueue()
        job = self.claim()
        self.expect_error(409, lambda: self.completion(job, 'ready_review'))
        result = self.s.mutate('/api/v1/jobs/' + job['id'] + '/complete', {'lease_token': job['lease_token'], 'outcome': 'fallback', 'reason': 'Insufficient recovery evidence'}, self.tool)['job']
        self.assertEqual(('queued', 'reconstruct', 'B'), (result['status'], result['stage'], result['route']))
        next_job = self.claim()
        completed = self.completion(next_job, 'ready_review')
        self.assertEqual(('review', 'B'), (completed['status'], completed['route']))

    def test_approval_publication_rollback_and_git_trace(self):
        candidate = self.enqueue(self.candidate(rights='unknown'))
        first = self.completion(self.claim())
        vid = first['version_id']
        endpoint = '/api/versions/' + vid
        self.expect_error(409, lambda: self.s.mutate(endpoint + '/publish', {}))
        checks = {'gameplay': True, 'visual': True, 'rights': True}
        self.expect_error(400, lambda: self.s.mutate(endpoint + '/approve', {'checks': checks}))
        self.s.mutate('/api/candidates/' + candidate['id'] + '/update', {'rights': 'owned'})
        self.expect_error(400, lambda: self.s.mutate(endpoint + '/approve', {'checks': {'gameplay': True}}))
        self.s.mutate(endpoint + '/approve', {'checks': checks})
        self.s.mutate(endpoint + '/publish', {})
        self.enqueue(candidate)
        second = self.completion(self.claim())
        next_endpoint = '/api/versions/' + second['version_id']
        self.s.mutate(next_endpoint + '/approve', {'checks': checks})
        self.s.mutate(next_endpoint + '/publish', {})
        self.s.mutate(endpoint + '/publish', {})
        state = self.s.state()
        published = [v for v in state['versions'] if v['status'] == 'published']
        self.assertEqual([vid], [v['id'] for v in published])
        self.assertEqual(1, state['metrics']['imported'])
        for version in state['versions']:
            self.assertEqual(40, len(version['commit']))
            recorded = self.s.repo.run('show', version['commit'] + ':' + version['source_directory'] + '/src/main.js')
            self.assertIn('version = 1', recorded)
        self.assertNotEqual(state['versions'][0]['source_directory'], state['versions'][1]['source_directory'])

    def test_http_requires_auth_and_playback_is_read_only(self):
        servers = [build_server(self.s, 0), build_server(self.s, 0, True)]
        for server in servers:
            threading.Thread(target=server.serve_forever, daemon=True).start()
            self.addCleanup(server.server_close)
            self.addCleanup(server.shutdown)
        def request(server, path, body=None, headers=None):
            req = urllib.request.Request('http://127.0.0.1:' + str(server.server_port) + path,
                data=json.dumps(body).encode() if body is not None else None, headers=headers or {})
            try:
                with urllib.request.urlopen(req) as response:
                    return response.status, response.read()
            except urllib.error.HTTPError as error:
                return error.code, error.read()
        self.assertEqual(401, request(servers[0], '/api/state')[0])
        self.assertEqual(401, request(servers[0], '/api/v1/heartbeat', {}, {'Content-Type': 'application/json'})[0])
        self.assertEqual(200, request(servers[0], '/api/v1/heartbeat', {}, {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + self.token})[0])
        self.assertEqual(405, request(servers[1], '/api/v1/heartbeat', {}, {'Content-Type': 'application/json'})[0])
        self.assertEqual(404, request(servers[1], '/api/state')[0])

    def test_source_bundle_ownership_download_and_active_input_freeze(self):
        candidate = self.candidate(tool=self.tool)
        payload = {'candidate_id': candidate['id'], 'entry': 'index.html', 'files': {'index.html': '<html>Source</html>'}}
        analyzer, analyzer_token = self.register('analysis-only', ['rea'])
        self.expect_error(403, lambda: self.s.mutate('/api/v1/source-bundles', payload, analyzer))
        bundle = self.s.mutate('/api/v1/source-bundles', payload, self.tool)
        self.enqueue(candidate)
        job = self.claim()
        self.assertEqual('/api/v1/source-bundles/' + bundle['bundle_id'] + '/download', job['input']['source_bundle_url'])
        self.expect_error(409, lambda: self.s.mutate('/api/v1/source-bundles', payload, self.tool))
        server = build_server(self.s, 0)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        url = 'http://127.0.0.1:' + str(server.server_port) + job['input']['source_bundle_url']
        with urllib.request.urlopen(urllib.request.Request(url, headers={'Authorization': 'Bearer ' + self.token})) as response:
            with zipfile.ZipFile(io.BytesIO(response.read())) as archive:
                self.assertEqual(b'<html>Source</html>', archive.read('index.html'))
        with self.assertRaises(urllib.error.HTTPError) as error:
            urllib.request.urlopen(urllib.request.Request(url, headers={'Authorization': 'Bearer ' + analyzer_token}))
        self.assertEqual(403, error.exception.code)


if __name__ == '__main__':
    unittest.main()
