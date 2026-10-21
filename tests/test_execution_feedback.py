import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import execution_feedback

class ExecutionFeedbackTests(unittest.TestCase):
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
