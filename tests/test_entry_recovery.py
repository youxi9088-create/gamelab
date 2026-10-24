import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from auto_repair import CHAT
from entry_recovery import recover
from worker import Blocked


class Budget:
    calls = 10
    def remaining(self, maximum): return maximum


class EntryRecoveryTests(unittest.TestCase):
    def test_probed_wrapper_declared_loader_can_be_selected_by_new_id(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); (root/'acquisition').mkdir()
            observation={'web_discovery':{'iframe_hints':[{'url':'https://example.org/wrapper'}]}}
            (root/'acquisition/observation.json').write_text(json.dumps(observation))
            calls=[]
            answers=iter([{'action':'probe_entry','arguments':{'entry_id':'1'}},
                          {'action':'probe_entry','arguments':{'entry_id':'2'}}])
            def acquire(url,directory,budget):
                calls.append(url)
                if len(calls)==1:return {'web_discovery':{'loader_hints':[{'url':'https://cdn.example/game?v=31'}]}}
                return {'web_discovery':{'entries':[{'url':url,'canvas_count':1,'evidence':'rendered-canvas'}]}}
            token=CHAT.set(lambda messages,budget:next(answers))
            try:result=recover(observation,root,Budget(),acquire)
            finally:CHAT.reset(token)
            self.assertEqual(calls,['https://example.org/wrapper','https://cdn.example/game?v=31'])
            self.assertEqual(result['web_discovery']['entries'][0]['url'],calls[-1])

    def run_case(self, url, result):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root/'acquisition').mkdir()
            observation = {'title':'fixture', 'web_discovery':{'iframe_hints':[
                {'url':'https://example.org/game', 'evidence':'iframe-src'}]}}
            (root/'acquisition/observation.json').write_text(json.dumps(observation))
            calls = []
            answers = iter([{'action':'probe_entry', 'arguments':{'url':url}}, {'action':'stop'}])
            def chat(messages, budget):
                payload = json.loads(messages[-1]['content'][0]['text'])
                self.assertIn('probe_entry', payload['allowed_actions'])
                self.assertIn('acquisition/observation.json', [r['path'] for r in payload['source_inventory']])
                return next(answers)
            def acquire(url, directory, budget):
                calls.append(url)
                return result
            token = CHAT.set(chat)
            try:
                try:
                    value = recover(observation, root, Budget(), acquire)
                except Blocked:
                    value = None
                report = json.loads((root/'auto-repair/report.json').read_text('utf-8'))
                return value, calls, report
            finally:
                CHAT.reset(token)

    def test_probe_returns_verified_entry_to_original_flow(self):
        entry = {'url':'https://example.org/game', 'canvas_count':1, 'evidence':'rendered-canvas'}
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{'entries':[entry]}})
        self.assertEqual(value['web_discovery']['entries'], [entry])
        self.assertEqual(calls, ['https://example.org/game'])
        self.assertTrue(report['attempts'][0]['verified'])

    def test_no_canvas_remains_blocked(self):
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{'entries':[]}})
        self.assertIsNone(value)
        self.assertEqual(len(calls), 1)
        self.assertFalse(report['attempts'][0]['verified'])

    def test_unverified_entry_cannot_pass_original_converter_check(self):
        value, calls, report = self.run_case('https://example.org/game', {'web_discovery':{
            'entries':[{'url':'https://example.org/game', 'canvas_count':0, 'evidence':'iframe-src'}]}})
        self.assertIsNone(value)
        self.assertEqual(len(calls), 1)
        self.assertFalse(report['attempts'][0]['verified'])

    def test_undeclared_url_never_executes(self):
        value, calls, report = self.run_case('https://unrelated.example/game', {})
        self.assertIsNone(value)
        self.assertEqual(calls, [])
        self.assertIn('tool_error',report['attempts'][0])

    def test_missing_arguments_corrected_by_declared_id_without_losing_repair_budget(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);url='https://example.org/game?a=1&b=two%20words'
            observation={'web_discovery':{'iframe_hints':[{'url':url}]}}
            payloads=[];calls=[]
            def chat(messages,budget):
                payload=json.loads(messages[-1]['content'][0]['text']);payloads.append(payload)
                if len(payloads)==1:return {'action':'probe_entry'}
                self.assertEqual(payload['repair_attempts_remaining'],2)
                self.assertIn('arguments',payload['tool_feedback'])
                self.assertIn(url,payload['capabilities']['probe_entry'])
                return {'action':'probe_entry','arguments':{'entry_id':'1'}}
            def acquired(selected,*args):
                calls.append(selected)
                return {'web_discovery':{'entries':[{'url':selected,'canvas_count':1,'evidence':'rendered-canvas'}]}}
            token=CHAT.set(chat)
            try:value=recover(observation,root,Budget(),acquired)
            finally:CHAT.reset(token)
            self.assertEqual(calls,[url])
            self.assertEqual(value['entry_recovery']['declared_url'],url)

    def test_dom_interaction_returns_to_original_entry_node(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);url='https://example.org/game'
            observation={'web_discovery':{'iframe_hints':[{'url':url}]}}
            answers=iter([{'action':'probe_entry','arguments':{'url':url}},
                          {'action':'verify_dom_entry','arguments':{'url':url,'label':'Begin the Tale'}}])
            def acquired(*args):return {'web_discovery':{'entries':[], 'launch_controls':[{'label':'Begin the Tale','visible':True}]}}
            def execute(command,**kwargs):
                self.assertEqual(command[-2],'Begin the Tale')
                directory=Path(command[-1])
                (directory/'interaction.json').write_text(json.dumps({'passed':True,'url':url,'label':'Begin the Tale'}))
                return SimpleNamespace(returncode=0)
            token=CHAT.set(lambda *args:next(answers))
            try:
                with patch('entry_recovery.subprocess.run',side_effect=execute):value=recover(observation,root,Budget(),acquired)
            finally:CHAT.reset(token)
            entry=value['web_discovery']['entries'][0]
            self.assertEqual(entry['evidence'],'interactive-dom')
            self.assertTrue(entry['interaction_verified'])

    def test_unobserved_dom_control_cannot_execute(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);url='https://example.org/game'
            answers=iter([{'action':'verify_dom_entry','arguments':{'url':url,'label':'Invented button'}},{'action':'stop'}])
            token=CHAT.set(lambda *args:next(answers))
            try:
                with patch('entry_recovery.subprocess.run') as execute:
                    with self.assertRaises(Blocked):recover({'web_discovery':{'iframe_hints':[{'url':url}]}},root,Budget(),lambda *args:{})
                    execute.assert_not_called()
            finally:CHAT.reset(token)

    def test_dom_parameter_correction_and_probe_preserve_actual_attempts(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);url='https://example.org/game?session=declared'
            observation={'web_discovery':{'iframe_hints':[{'url':url}]}}
            payloads=[]
            def chat(messages,budget):
                payload=json.loads(messages[-1]['content'][0]['text']);payloads.append(payload)
                if len(payloads)==1:return {'action':'probe_entry','arguments':{'entry_id':'1'}}
                if len(payloads)==2:return {'action':'verify_dom_entry','arguments':{'url':'https://example.org/game','label':'Continue offline'}}
                self.assertEqual(payload['repair_attempts_remaining'],2)
                self.assertIn('entry_id',payload['tool_feedback'])
                return {'action':'verify_dom_entry','arguments':{'entry_id':'1','label':'Continue offline'}}
            def acquired(*args):return {'web_discovery':{'entries':[], 'launch_controls':[{'label':'Continue offline','visible':True}]}}
            def execute(command,**kwargs):
                self.assertEqual(command[-3],url)
                (Path(command[-1])/'interaction.json').write_text(json.dumps({'passed':True,'url':url}))
                return SimpleNamespace(returncode=0)
            token=CHAT.set(chat)
            try:
                with patch('entry_recovery.subprocess.run',side_effect=execute) as process:
                    value=recover(observation,root,Budget(),acquired)
                    self.assertEqual(process.call_count,1)
            finally:CHAT.reset(token)
            self.assertTrue(value['web_discovery']['entries'][0]['interaction_verified'])
