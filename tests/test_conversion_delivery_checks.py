import tempfile
import unittest
from pathlib import Path
from controlplane.conversion_delivery_checks import inspect


class ConversionDeliveryChecksTests(unittest.TestCase):
    def test_missing_and_external_are_visible_before_supply(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)
            (root/'index.html').write_text('<img src="missing.png"><link rel="stylesheet" href="https://fonts.example/a.css?token=private">','utf-8')
            result=inspect(root,{})
            codes={r['code'] for r in result['findings']}
            self.assertTrue({'MISSING_LOCAL_RESOURCE','EXTERNAL_DEPENDENCY','ACCEPTANCE_STEPS_REQUIRED'}<=codes)
            self.assertNotIn('private',str(result))

    def test_clean_package_does_not_claim_runtime_or_change_files(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);p=root/'index.html';p.write_text('<button>Start</button>','utf-8');before=p.read_bytes()
            result=inspect(root,{'acceptance_actions':[{'type':'click','selector':'button'}]})
            self.assertEqual(result['status'],'static_checks_clear')
            self.assertNotIn('passed',result);self.assertEqual(p.read_bytes(),before)
