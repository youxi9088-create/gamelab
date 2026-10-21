from controlplane.runtime import node_binary
import json
import os
import subprocess
import threading
from pathlib import Path
from unittest.mock import patch
import unittest
import test_platform
from controlplane.supply_service import SupplyService
from controlplane.supply_config import KEYS
from controlplane.service import ApiError
from server import build_server


class SupplyServiceTest(unittest.TestCase):
    def setUp(self):
        self.fixture = test_platform.PlatformTest()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        self.s = self.fixture.s
        self.path = self.s.data_dir/'supply-config.json'
        env = {k:v for k,v in os.environ.items() if k not in KEYS}
        env['SUPPLY_CONFIG_FILE'] = str(self.path)
        self.env = patch.dict(os.environ, env, clear=True)
        self.env.start()
        self.addCleanup(self.env.stop)
        self.supply = SupplyService(self.s)

    def test_private_save_and_read_only_check(self):
        cfg = dict(SUPPLY_PLATFORM_BASE='https://example.org', SUPPLY_APP_ID='sup_fixture',
                   SUPPLY_EXPECTED_FINGERPRINT=__import__('hashlib').sha256(b'private-value').hexdigest()[:12],
                   SUPPLY_APP_SECRET='private-value', SUPPLY_ARCHIVE_DIR=str(self.s.data_dir/'dist'),
                   SUPPLY_ARCHIVE_BASE_URL='https://example.org/games')
        result = self.supply.save(cfg)
        self.assertNotIn('private-value', json.dumps(result))
        self.supply.save({'SUPPLY_APP_SECRET':''})
        self.assertEqual(json.loads(self.path.read_text('utf-8'))['SUPPLY_APP_SECRET'], 'private-value')
        before = self.s.state()
        with patch('controlplane.supply_service.call', return_value={'app_id':'sup_fixture'}) as client:
            result = self.supply.check()
        client.assert_called_once_with('GET','whoami')
        self.assertEqual(result['check']['identity'],'verified')
        after = self.s.state()
        for key in ('versions','jobs','supply'):
            self.assertEqual(before[key],after[key])
        self.assertNotIn('private-value',json.dumps(after))
        with self.assertRaises(ApiError):
            self.supply.save({'SUPPLY_PLATFORM_BASE':'http://wrong.example'})
        self.assertEqual(self.supply.public()['values']['SUPPLY_PLATFORM_BASE'],'https://example.org')

    def test_missing_config_audits_real_shape_without_network(self):
        self.fixture.enqueue()
        job = self.fixture.claim()
        self.fixture.completion(job)
        before = self.s.state()
        with patch('controlplane.supply_service.call') as client:
            result = self.supply.check()
        client.assert_not_called()
        self.assertEqual(result['check']['games'][0]['structure'],'pass')
        self.assertFalse(result['check']['games'][0]['distribution_declared'])
        self.assertEqual(self.s.state()['versions'],before['versions'])
        self.assertEqual(self.s.state()['supply'],[])

    def test_platform_service_ui(self):
        self.fixture.enqueue()
        self.fixture.completion(self.fixture.claim())
        server=build_server(self.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            node=node_binary()
            result=subprocess.run([str(node),'tools/check_supply_service_ui.cjs',f'http://127.0.0.1:{server.server_port}'],
                                  capture_output=True,text=True,timeout=60)
            self.assertEqual(result.returncode,0,result.stderr)
        finally:
            server.shutdown()
            server.server_close()
