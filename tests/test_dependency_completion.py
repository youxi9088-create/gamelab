from pathlib import Path
import sys
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from dependency_completion import assessed_dependencies

class DependencyCompletionTests(unittest.TestCase):
    def test_requires_runtime_and_real_evidence_and_preserves_identity(self):
        current={'scope':'Offline fixture','items':[{'id':'host','name':'Host','kind':'platform','status':'available','reason':'Pending','evidence':'old.json','next_action':'Verify'},{'id':'data','name':'Data','kind':'data','status':'available','reason':'Pending','evidence':'old.json','next_action':'Verify'}]}
        update={'id':'host','status':'verified','reason':'Read and restored local storage','evidence':'proof.json'}
        result=assessed_dependencies(current,[update],{'proof.json'},True)
        self.assertEqual(result['items'][0]['status'],'verified');self.assertEqual(result['items'][1]['status'],'available');self.assertEqual(current['items'][0]['status'],'available')
        with self.assertRaises(ValueError):assessed_dependencies(current,[update],set(),True)
        with self.assertRaises(ValueError):assessed_dependencies(current,[update],{'proof.json'},False)
        with self.assertRaises(ValueError):assessed_dependencies(current,[dict(update,id='unknown')],{'proof.json'},True)
