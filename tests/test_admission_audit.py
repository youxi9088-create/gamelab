import tempfile,unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
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
