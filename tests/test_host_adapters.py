import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
import host_adapters


class HostAdapterTests(unittest.TestCase):
    def test_known_generated_copy_upgrades_with_evidence_and_custom_host_is_preserved(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            working = root / 'working'; working.mkdir()
            adapters = root / 'adapters'; adapters.mkdir()
            (adapters / 'poki-offline.js').write_text('new fixture host', 'utf-8')
            host = working / 'runtime-host.js'; host.write_text('old fixture host', 'utf-8')
            contract = {'patches': [{'kind': 'poki-offline'}]}
            with patch.object(host_adapters, 'ROOT', root), patch.object(host_adapters, 'POKI_V1', hashlib.sha256(b'old fixture host').hexdigest()):
                self.assertEqual(host_adapters.refresh(working, {}), {})
                self.assertEqual(host.read_text(), 'old fixture host')
                self.assertEqual(host_adapters.refresh(working, contract), {'runtime-host.js': 'new fixture host'})
                audit = json.loads((working / 'evidence/host-adaptation.json').read_text())
                self.assertEqual(audit['before_sha256'], hashlib.sha256(b'old fixture host').hexdigest())
                host.write_text('customized fixture host')
                self.assertEqual(host_adapters.refresh(working, contract), {})
                self.assertEqual(host.read_text(), 'customized fixture host')


if __name__ == '__main__':
    unittest.main()
