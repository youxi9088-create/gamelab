import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import execution_feedback

class ExecutionFeedbackTests(unittest.TestCase):
    def test_failed_conversion_without_version_survives_retry(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);run=root/'failed';run.mkdir()
            (run/'job-binding.json').write_text(json.dumps({'job_id':'j'}))
            (run/'auto-repair').mkdir()
            (run/'auto-repair/report.json').write_text(json.dumps({'original_error':'timeout','attempts':[{'action':'retry','verification_error':'timeout','verified':False}]}))
            (run/'converted/evidence').mkdir(parents=True)
            (run/'converted/evidence/runtime.json').write_text(json.dumps({'passed':False,'runtime_origin':'https://replica-runtime.invalid'}))
            with patch.object(execution_feedback,'ROOT',root):
                result=execution_feedback.previous_failure({'id':'j','report':{'run_directory':str(run)}})
                self.assertFalse(result['runtime']['passed'])
                self.assertEqual(result['attempts'][0]['verification_error'],'timeout')
                self.assertIsNone(execution_feedback.previous_failure({'id':'other','report':{'run_directory':str(run)}}))
    def test_web_progress_uses_last_successful_job_bound_observation(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);run=root/'run';run.mkdir()
            (run/'job-binding.json').write_text(json.dumps({'job_id':'web-one'}))
            for step,passed in [(0,True),(1,False)]:
                iteration=run/f'web-review-{step}';iteration.mkdir()
                (iteration/'runtime.json').write_text(json.dumps({'passed':passed,'actions':[{'type':'click','x':step,'y':1}]}))
                (iteration/'model.json').write_text(json.dumps({'summary':'Observed fixture'}))
            with patch.object(execution_feedback,'ROOT',root):
                result=execution_feedback.previous_execution({'id':'web-one','report':{'run_directory':str(run)}})
                self.assertTrue(result['runtime']['passed'])
                self.assertEqual(result['actions'][0]['x'],0)
                self.assertEqual(result['web_source'],str(run/'converted'))
                self.assertIsNone(execution_feedback.previous_execution({'id':'other','report':{'run_directory':str(run)}}))

    def test_failed_observations_are_bound_to_job(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);run=root/'run';run.mkdir();iteration=run/'revision-2';iteration.mkdir()
            (run/'job-binding.json').write_text(json.dumps({'job_id':'job-one'}))
            (iteration/'runtime-report.json').write_text(json.dumps({'passed':False,'page_errors':['condition timed out']}))
            (run/'model-step-2.json').write_text(json.dumps({'acceptance_actions':[{'type':'until'}],'summary':'Attempted inputs'}))
            with patch.object(execution_feedback,'ROOT',root):
                result=execution_feedback.previous_execution({'id':'job-one','report':{'run_directory':str(run)}})
                self.assertFalse(result['runtime']['passed']);self.assertEqual(result['actions'][0]['type'],'until')
                self.assertIsNone(execution_feedback.previous_execution({'id':'other','report':{'run_directory':str(run)}}))
                self.assertIsNone(execution_feedback.previous_execution({'id':'job-one','report':{'run_directory':str(root.parent)}}))
