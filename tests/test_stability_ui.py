"""Real browser regression against temporary data; never starts conversion workers."""
import os
import subprocess
import threading
import unittest
from unittest.mock import patch
from controlplane.runtime import node_binary
from server import build_server
import test_conversations as fixtures


class StabilityUITests(unittest.TestCase):
    def test_whole_site_background_sync_and_accounts(self):
        fixture = fixtures.ConversationsTest()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        with patch.dict(os.environ, PORTAL_ADMIN_USERNAME='ui-admin',
                        PORTAL_ADMIN_PASSWORD='isolated-ui-password', PORTAL_PUBLIC_ORIGIN=''):
            server = build_server(fixture.s, 0)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        result = subprocess.run([str(node_binary()), 'tools/check_stability_ui.cjs',
                                 f'http://127.0.0.1:{server.server_port}'],
                                capture_output=True, text=True, timeout=240)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
