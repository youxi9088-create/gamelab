import tempfile
import unittest
from pathlib import Path
from controlplane.offline_delivery import inspect, FEATURES
from controlplane.supply import inspect_source, SupplyError
from controlplane.conversion_delivery_checks import inspect as conversion_checks


class OfflineDeliveryTests(unittest.TestCase):
    def test_final_package_rejects_interface_even_if_ui_is_hidden(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<button>Start</button><script src="game.js"></script>')
            (root/'game.js').write_text('sdk.showRewardedAd();')
            result=inspect(root)
            self.assertEqual(result['status'],'needs_work')
            self.assertIn('advertising',{r.get('feature') for r in result['findings']})
            with self.assertRaises(SupplyError) as caught:inspect_source(root)
            self.assertEqual(caught.exception.code,'OFFLINE_FEATURE_REMAINS')

    def test_local_score_and_virtual_shop_are_preserved_but_payment_is_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<button>商店</button><button>Start</button><script src="game.js"></script>','utf-8')
            js=root/'game.js';js.write_text('const score=5; localStorage.setItem("best",score); // sdk.requestPayment();\nconst documentation="sdk.showLeaderboard()";')
            self.assertFalse(inspect(root)['findings'])
            js.write_text('wx.requestPayment({});')
            self.assertIn('payments',{r.get('feature') for r in inspect(root)['findings']})

    def test_runtime_blocking_is_not_removal_and_claims_cannot_override_it(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<button>Start</button>')
            review={k:{'status':'absent','reason':'Read source and checked controls','evidence':['index.html']} for k in FEATURES}
            runtime={'passed':True,'environment':'deployment','actions':[{'type':'click'}]}
            self.assertEqual(inspect(root,runtime,review)['status'],'verified')
            self.assertEqual(inspect(root,runtime,{})['status'],'pending')
            runtime['adblock']={'blocked_count':1}
            self.assertEqual(inspect(root,runtime,review)['status'],'needs_work')
            runtime.pop('adblock');runtime['blocked_external']=[{'url':'https://host.example/api?token=secret'}]
            result=inspect(root,runtime,review)
            self.assertEqual(result['status'],'needs_work');self.assertNotIn('secret',str(result))

    def test_same_origin_api_is_exposed_before_supply(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<script>fetch("/api/leaderboard")</script>')
            self.assertIn('BACKEND_DEPENDENCY',{r['code'] for r in conversion_checks(root,{})['findings']})
            with self.assertRaises(SupplyError) as caught:inspect_source(root)
            self.assertEqual(caught.exception.code,'EXTERNAL_REQUEST_REJECTED')

