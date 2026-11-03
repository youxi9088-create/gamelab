import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from review_assessment import foundation_checks,require_complete_checks
from controlplane.delivery_requirements import REQUIRED


class ReviewAssessmentTests(unittest.TestCase):
    def checks(self):
        return {key:{'status':'pending','reason':'Not yet verified'} for key in REQUIRED}

    def test_empty_assessment_cannot_silently_publish_all_missing_checks(self):
        with self.assertRaisesRegex(ValueError,'gameplay'):
            foundation_checks({})

    def test_pending_is_preserved_and_no_evidence_is_invented(self):
        value=self.checks();result=foundation_checks(value)
        self.assertEqual(result,value)
        self.assertTrue(all(item['status']=='pending' and 'evidence' not in item for item in result.values()))

    def test_complete_with_pending_checks_returns_to_same_round_instead_of_publishing_draft(self):
        value={key:{'status':'verified','reason':'Observed in this run'} for key in REQUIRED}
        value['characters']={'status':'pending','reason':'Spawn has not been observed'}
        with self.assertRaisesRegex(ValueError,'本轮仅推进剩余项'):require_complete_checks(value)
        self.assertEqual(value['characters']['status'],'pending')
        value['characters']={'status':'verified','reason':'Observed normal input feedback'}
        self.assertEqual(require_complete_checks(value),value)

    def test_singleton_arrays_normalize_without_duplicate_overwrite(self):
        value=self.checks()
        self.assertEqual(foundation_checks([{k:v} for k,v in value.items()]),value)
        with self.assertRaises(ValueError):foundation_checks([{'ui':value['ui']},{'ui':value['ui']}])

    def test_required_checks_cannot_be_waived_and_reason_is_required(self):
        value=self.checks();value['gameplay']['status']='not_applicable'
        with self.assertRaises(ValueError):foundation_checks(value)
        value=self.checks();value['resources']['reason']=' '
        with self.assertRaises(ValueError):foundation_checks(value)

if __name__=='__main__':unittest.main()
