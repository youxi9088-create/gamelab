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


class OperationReviewTests(unittest.TestCase):
    def report(self):
        return {'runtime_verified':True,'verification_evidence':'proof.json',
            'runtime_smoke':{'passed':True,'actions':[{'type':'key','key':'w'}]},
            'foundation_checks':{k:{'status':'pending' if k=='gameplay' else 'verified','evidence':['proof.json']} for k in REQUIRED},
            'manual_review':{'kind':'ai_operation_limit','reason':'Cannot reach interaction area','verified':['Scene and movement'],'checks':['Approach pedestal, press F and confirm pickup'],'defect_confirmed':False,'attempts':3,'diagnosed':True}}
    def test_operation_limit_handoff_does_not_verify_gameplay(self):
        r=self.report()
        self.assertEqual(delivery_gaps(r,['proof.json','screenshots/current.png']),[])
        self.assertEqual(r['foundation_checks']['gameplay']['status'],'pending')
    def test_no_waiver_for_missing_evidence_or_real_failure(self):
        for key,value in [('missing',['model.bin']),('errors',['error']),('passed',False),('required_external',['url'])]:
            r=self.report();r['runtime_smoke'][key]=value
            self.assertTrue(delivery_gaps(r,['proof.json','screenshots/current.png']))
        for key,value in [('diagnosed',False),('attempts',2),('defect_confirmed',True),('checks',[])]:
            r=self.report();r['manual_review'][key]=value
            self.assertTrue(delivery_gaps(r,['proof.json','screenshots/current.png']))
        self.assertTrue(delivery_gaps(self.report(),['proof.json']))
        r=self.report();r['foundation_checks']['resources']['status']='pending'
        self.assertTrue(delivery_gaps(r,['proof.json','screenshots/current.png']))
