import subprocess
import threading
import unittest
from controlplane.runtime import node_binary
from server import build_server
import test_conversations as fixtures


class ReviewImageUITest(unittest.TestCase):
    def test_full_image_dimensions_without_changing_acceptance(self):
        fixture = fixtures.ConversationsTest()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        before = fixture.s.state()['versions']
        server = build_server(fixture.s, 0)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        result = subprocess.run([str(node_binary()), 'tools/check_review_image_ui.cjs',
                                 f'http://127.0.0.1:{server.server_port}'],
                                capture_output=True, text=True, timeout=60)
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertEqual(before, fixture.s.state()['versions'])
