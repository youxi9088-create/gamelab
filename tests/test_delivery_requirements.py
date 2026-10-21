import unittest
from controlplane.delivery_requirements import REQUIRED,delivery_gaps

class DeliveryRequirementsTest(unittest.TestCase):
    def test_runtime_alone_is_not_a_complete_game(self):
        self.assertEqual(len(delivery_gaps({'runtime_verified':True},[])),7)
    def test_partial_or_missing_evidence_blocks(self):
        r={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['proof.json']} for k in REQUIRED}}
        self.assertEqual(delivery_gaps(r,['proof.json']),[])
        r['foundation_checks']['animation']={'status':'partial','reason':'Only static model','evidence':['proof.json']}
        self.assertEqual(len(delivery_gaps(r,['proof.json'])),1)
        self.assertTrue(delivery_gaps(r,[]))
    def test_not_applicable_requires_explanation(self):
        r={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['proof']} for k in REQUIRED}}
        r['foundation_checks']['characters']={'status':'not_applicable','reason':'A board game has no characters'}
        self.assertFalse(delivery_gaps(r,['proof']))
        r['foundation_checks']['ui']={'status':'not_applicable','reason':'Omitted'}
        self.assertTrue(delivery_gaps(r,['proof']))
