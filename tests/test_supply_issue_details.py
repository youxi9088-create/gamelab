from pathlib import Path
import tempfile,unittest
from controlplane.supply import inspect_source,SupplyError

class SupplyIssueDetailsTests(unittest.TestCase):
    def test_engine_rejection_names_real_file_without_changing_policy(self):
        for name,reason in [('game.wasm','unsupported_engine_binary'),('game.loader.js','engine_loader'),('main.ts','build_source'),('main.aabbccdd.js','hash_filename')]:
            with self.subTest(name=name),tempfile.TemporaryDirectory() as d:
                root=Path(d);(root/'index.html').write_text('<html></html>');(root/name).write_bytes(b'fixture')
                with self.assertRaises(SupplyError) as caught:inspect_source(root)
                self.assertEqual(caught.exception.code,'TOOLCHAIN_UNSUPPORTED')
                self.assertEqual(caught.exception.details,[{'file':name,'reason':reason}])

    def test_missing_entry_resource_reports_path_without_query(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);(root/'index.html').write_text('<script src="missing.js?token=fixture"></script>')
            with self.assertRaises(SupplyError) as caught:inspect_source(root)
            self.assertEqual(caught.exception.code,'MISSING_LOCAL_RESOURCE')
            self.assertEqual(caught.exception.details,[{'file':'index.html','reference':'missing.js'}])

    def test_external_reference_does_not_disclose_url_credentials(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);(root/'index.html').write_text('<script src="https://user:fixture@example.test/a.js?token=fixture"></script>')
            with self.assertRaises(SupplyError) as caught:inspect_source(root)
            self.assertEqual(caught.exception.code,'EXTERNAL_DEPENDENCY')
            self.assertEqual(caught.exception.details,[{'file':'index.html','reason':'non_relative_html_reference'}])
