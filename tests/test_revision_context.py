import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from revision_context import SourceContext,digest,RevisionYield
from continuation import revise

class RevisionContextTests(unittest.TestCase):
    def test_failed_browser_retry_preserves_edits_and_failure_feedback(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'first';run.mkdir();second=root/'second';second.mkdir()
            (src/'index.html').write_text('<button>Play</button>')
            inp={'source_path':str(src),'base_version':{'id':'v','report':{}}}
            actions=[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]
            def chat(*args):return {'changes':{'index.html':'<button>Fixed</button>'},'acceptance_actions':actions}
            def fail(*a,**k):raise ValueError('fixture interaction failed')
            with self.assertRaisesRegex(ValueError,'续作浏览器'):
                revise(inp,run,None,chat,fail,RuntimeError)
            saved=json.loads((run/'revision-checkpoint.json').read_text('utf-8'))
            self.assertEqual(saved['changes']['index.html'],'<button>Fixed</button>')
            inp['_revision_checkpoint']=saved
            def resume(messages,*args):
                payload=json.loads(messages[-1]['content'])
                self.assertIn('fixture interaction failed',payload['runtime_feedback'])
                return {'changes':{},'acceptance_actions':actions}
            def smoke(files,*a,**k):
                self.assertEqual(files['index.html'],'<button>Fixed</button>')
                return {'passed':True}
            changes,_,report=revise(inp,second,None,resume,smoke,RuntimeError)
            self.assertTrue(report['runtime_verified'])
            self.assertEqual(changes['index.html'],'<button>Fixed</button>')

    def test_partial_navigation_keeps_valid_evidence(self):
        context=SourceContext({'index.html':'working evidence'},'index.html');payload={}
        error=context.navigate(payload,{'read_requests':[{'path':'index.html'},{'path':'missing.swf'}]})
        self.assertIn('missing.swf',error)
        self.assertEqual(payload['source_excerpts'][0]['text'],'working evidence')

    def test_navigation_checkpoint_rechecks_hashes_and_does_not_trust_saved_text(self):
        code={'index.html':'const score=0;'};c=SourceContext(code,'index.html');saved={}
        c.retain(saved,[c.read('index.html')]+c.search([{'path':'index.html','text':'saveState'}]))
        saved['source_excerpts'][0]['text']='forged state'
        fresh=SourceContext(code,'index.html');payload={};fresh.restore_navigation(payload,saved)
        self.assertEqual(payload['source_excerpts'][0]['text'],code['index.html'])
        self.assertEqual(payload['source_search_results'][0]['total_matches'],0)
        changed=SourceContext({'index.html':'different'},'index.html');payload={};changed.restore_navigation(payload,saved)
        self.assertEqual(payload,{})

    def test_zero_match_search_remains_visible_to_model(self):
        c=SourceContext({'index.html':'const score=0;'},'index.html');payload={}
        result=c.search([{'path':'index.html','text':'saveState'}]);c.retain(payload,result)
        self.assertEqual(payload['source_search_results'][0]['total_matches'],0)
        self.assertEqual(payload['source_search_results'][0]['characters_searched'],14)
        self.assertEqual(payload['source_search_results'][0]['sha256'],digest('const score=0;'))
        c.retain(payload,result)
        self.assertEqual(len(payload['source_search_results']),1)
    def test_failed_component_regression_cannot_be_delivered(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'run';run.mkdir()
            (src/'index.html').write_text('<button>Play</button>')
            inp={'source_path':str(src),'base_version':{'id':'v','report':{}},'_source_fidelity':{'verified':True},'_source_fidelity_path':'verification/source.json'}
            result={'changes':{},'regression_cases':[{'name':'counter'}],'acceptance_actions':[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]}
            with patch('source_fidelity.function_regression',return_value={'passed':False,'reason':'expected save missing'}):
                with self.assertRaisesRegex(ValueError,'Component regression failed'):
                    revise(inp,run,None,lambda *a:result,lambda *a,**k:{'passed':True},RuntimeError)

    def test_executor_newline_repair_is_verified_and_preserved(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'run';run.mkdir()
            original='<button>Play</button>\r\r\n';fixed=original.replace('\r\r\n','\r\n')
            (src/'index.html').write_bytes(original.encode())
            inp={'source_path':str(src),'base_version':{'id':'v','report':{}},'_newline_repairs':{'index.html':fixed}}
            result={'changes':{},'acceptance_actions':[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]}
            def smoke(files,*a,**k):
                self.assertEqual(files['index.html'],fixed);return {'passed':True}
            changes,_,_=revise(inp,run,None,lambda *a:result,smoke,RuntimeError)
            self.assertEqual(changes['index.html'],fixed);self.assertEqual((src/'index.html').read_bytes(),original.encode())
    def test_call_budget_yields_and_resumes_read_context(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'first';run.mkdir();second=root/'second';second.mkdir()
            (src/'index.html').write_text('<button>Play</button>')
            (src/'game.js').write_text('x'*240000+'unique')
            class Budget: calls=1
            budget=Budget()
            def chat(messages,b):
                b.calls-=1;return {'read_requests':[{'path':'game.js','offset':240000,'length':6}]}
            inp={'source_path':str(src),'base_version':{'id':'v','report':{}}}
            with self.assertRaises(RevisionYield):revise(inp,run,budget,chat,None,RuntimeError)
            saved=json.loads((run/'revision-checkpoint.json').read_text('utf-8'))
            inp['_revision_checkpoint']=saved
            def resumed(messages,b):
                p=json.loads(messages[-1]['content'])
                self.assertTrue(any(part['text']=='unique' for part in p['source_excerpts']))
                return {'changes':{},'acceptance_actions':[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]}
            changes,_,report=revise(inp,second,None,resumed,lambda *a,**k:{'passed':True},RuntimeError)
            self.assertTrue(report['runtime_verified']);self.assertEqual(len(changes),1)
            (src/'game.js').write_text('changed')
            with self.assertRaisesRegex(ValueError,'基线'):revise(inp,second,None,resumed,None,RuntimeError)
    def test_read_context_accumulates_without_duplicate_expansion(self):
        c=SourceContext({'index.html':'menu','game.js':'x'*180000+'function win(){}'},'index.html')
        payload=c.payload()
        parts=c.search([{'path':'game.js','text':'function win'}])
        c.retain(payload,parts)
        self.assertTrue(any(p['path']=='index.html' for p in payload['source_excerpts']))
        self.assertTrue(any('function win' in p['text'] for p in payload['source_excerpts']))
        count=len(payload['source_excerpts']);c.retain(payload,parts)
        self.assertEqual(count,len(payload['source_excerpts']))
        self.assertLessEqual(sum(len(p['text']) for p in payload['source_excerpts']),150000)
    def test_large_source_navigation_exact_edit_and_preservation(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'run';run.mkdir()
            original='/*'+'x'*240000+'*/\nfunction win(){return false;}\n'+'/*'+'y'*100000+'*/'
            (src/'index.html').write_text('<button id="start">Play</button>')
            (src/'game.js').write_text(original,newline='')
            (src/'evidence').mkdir();(src/'evidence/rea.json').write_text(json.dumps({'ast':'a'*300000}))
            calls=[]
            def chat(messages,budget):
                p=json.loads(messages[-1]['content']);calls.append(p)
                self.assertLess(len(json.dumps(p)),125000)
                if len(calls)==1:return {'search_requests':[{'path':'game.js','text':'function win'}]}
                return {'edits':[{'path':'game.js','sha256':digest(original),'old':'function win(){return false;}','new':'function win(){return true;}'}],
                        'acceptance_actions':[{'type':'click','selector':'#start','expect_text':'Play'},{'type':'click','selector':'#start'}]}
            def smoke(files,entry,*args,**kwargs):
                self.assertEqual(files['game.js'],original.replace('return false','return true'))
                self.assertEqual(files['evidence/rea.json'],(src/'evidence/rea.json').read_text())
                return {'passed':True}
            changes,entry,report=revise({'source_path':str(src),'base_version':{'id':'fixture','report':{}}},run,None,chat,smoke,RuntimeError)
            self.assertEqual(len(calls),2);self.assertTrue(report['runtime_verified'])
            self.assertEqual((src/'game.js').read_text(),original)
            self.assertTrue(any(k.startswith('verification/') for k in changes))

    def test_unread_whole_file_stale_hash_and_protected_edits_rejected(self):
        code={'game.js':'a'*300000+'unique','evidence/proof.json':'proof'}
        c=SourceContext(code,'game.js');c.payload()
        with self.assertRaises(ValueError):c.apply({'game.js':'truncated'},[])
        c.read('game.js',300000,6)
        with self.assertRaises(ValueError):c.apply({},[{'path':'game.js','sha256':'bad','old':'unique','new':'fixed'}])
        with self.assertRaises(ValueError):c.apply({'evidence/proof.json':'fake'},[])
        with self.assertRaises(ValueError):c.apply({'verification/proof.json':'fake'},[])
        self.assertEqual(c.apply({},[{'path':'game.js','sha256':digest(code['game.js']),'old':'unique','new':'fixed'}])['game.js'],'a'*300000+'fixed')

    def test_verification_only_does_not_require_game_code_changes(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'run';run.mkdir()
            (src/'index.html').write_text('<button>Play</button>')
            result={'changes':{},'acceptance_actions':[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]}
            changes,_,_=revise({'source_path':str(src),'base_version':{'id':'v','report':{}}},run,None,lambda *a:result,lambda *a,**k:{'passed':True},RuntimeError)
            self.assertNotIn('index.html',changes);self.assertEqual(len(changes),1)

    def test_partial_result_preserves_current_concrete_blocker(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'source';src.mkdir();run=root/'run';run.mkdir()
            (src/'index.html').write_text('<button>Play</button>')
            blocker={'code':'MISSING_REFERENCE','reason':'Original scene reference unavailable','next_action':'Capture original scene'}
            result={'changes':{},'blocker':blocker,'acceptance_actions':[{'type':'click','selector':'button','expect_text':'Play'},{'type':'click','selector':'button'}]}
            inp={'source_path':str(src),'base_version':{'id':'v','report':{'blocker':{'code':'old'}}}}
            _,_,report=revise(inp,run,None,lambda *a:result,lambda *a,**k:{'passed':True},RuntimeError)
            self.assertEqual(report['blocker'],blocker)
            second=root/'second';second.mkdir();result.pop('blocker')
            _,_,report=revise(inp,second,None,lambda *a:result,lambda *a,**k:{'passed':True},RuntimeError)
            self.assertNotIn('blocker',report)
