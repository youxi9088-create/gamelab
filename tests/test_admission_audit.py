import tempfile,unittest,sys,sqlite3,time,io
from unittest.mock import patch
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
import reassess_discovery_admission as audit
from reassess_discovery_admission import apply_result
from controlplane.store import Store

class AuditTests(unittest.TestCase):
    def test_preserves_dispatch_and_human_decisions_but_filters_undecided(self):
        with tempfile.TemporaryDirectory() as t:
            store=Store(Path(t)/'test.sqlite3')
            assessment={'status':'filtered','gates':{'loop':{'status':'fail','reason':'没有后续目标'}}}
            for status,decided in [('pending',False),('pending',True),('dispatched',True),('rejected',True)]:
                item={'id':status+str(decided),'status':status,'url':'https://example.org/game','gameplay':'Actual saved prose','category':'益智'}
                if decided:item['decision_by']='human'
                with store.tx() as db:store.put(db,'recommendations',item)
                result=apply_result(store,'audit',item,assessment)
                self.assertEqual(result['current_status'],'filtered' if status=='pending' and not decided else status)
                self.assertEqual(apply_result(store,'audit',item,{'status':'eligible'}),result)

    def test_changed_source_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as t:
            store=Store(Path(t)/'test.sqlite3')
            item={'id':'rec','status':'pending','gameplay':'Old prose','url':'https://example.org'}
            with store.tx() as db:store.put(db,'recommendations',{**item,'gameplay':'New source'})
            result=apply_result(store,'audit',item,{'status':'filtered'})
            self.assertEqual(result['outcome'],'source_changed_or_removed')
            with store.read() as db:self.assertNotIn('admission',store.get(db,'recommendations','rec'))

    def test_batch_writer_yields_quickly_to_an_existing_writer(self):
        with tempfile.TemporaryDirectory() as t:
            store=Store(Path(t)/'test.sqlite3');target=audit.AuditTargetStore.__new__(audit.AuditTargetStore);target.path=store.path
            item={'id':'rec','status':'pending','url':'https://example.org','gameplay':'Actual source'}
            with store.tx() as db:
                store.put(db,'recommendations',item);start=time.monotonic()
                with self.assertRaises(sqlite3.OperationalError):apply_result(target,'audit',item,{'status':'unknown'})
                self.assertLess(time.monotonic()-start,2)
            self.assertEqual(apply_result(target,'audit',item,{'status':'unknown'})['outcome'],'applied')

    def test_saved_evaluation_republishes_without_another_model_call(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);store=Store(root/'platform.sqlite3')
            item={'id':'rec','status':'pending','url':'https://example.org','gameplay':'Actual game prose','category':'益智'}
            with store.tx() as db:store.put(db,'recommendations',item)
            def evaluate(items,*args):
                items[0]['admission']={'status':'unknown','assessed_at':'fixture','gates':{k:{'status':'unknown','reason':'待源码核查'} for k in ('originality','completeness','loop')}}
            argv=['audit','--data-dir',str(root),'--run-id','isolated-audit','--workers','1']
            with patch.object(sys,'argv',argv),patch('controlplane.service_registry.ai_config',return_value={'base_url':'fixture','api_key':'fixture','model':'fixture'}),patch('controlplane.process_priority.prioritize_control_plane'),patch.object(sys,'stdout',io.StringIO()):
                with patch.object(audit,'assess',side_effect=evaluate) as model:
                    audit.main();self.assertEqual(model.call_count,1)
                with store.tx() as db:db.execute("DELETE FROM records WHERE kind='admission_audit_results'")
                with patch.object(audit,'assess',side_effect=AssertionError('Completed evaluation must not be sent to AI again')):
                    audit.main()
                with store.read() as db:self.assertEqual(len(store.all(db,'admission_audit_results')),1)
