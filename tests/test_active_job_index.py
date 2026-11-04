from pathlib import Path
import tempfile,unittest,json
from controlplane.store import Store

QUERY="SELECT data FROM records WHERE kind='jobs' AND json_extract(data,'$.status') IN ('queued','running') ORDER BY rowid DESC"

class ActiveJobIndexTests(unittest.TestCase):
    def test_query_uses_active_index_and_tracks_state_transitions(self):
        with tempfile.TemporaryDirectory() as d:
            s=Store(Path(d)/'db.sqlite3')
            with s.tx() as db:
                for key,status in [('old','completed'),('waiting','queued'),('executing','running')]:
                    s.put(db,'jobs',{'id':key,'status':status,'report':{'text':'x'*10000}})
                # Non-job documents do not need the task schema.
                s.put(db,'settings',{'id':'main','concurrency':6})
            with s.read() as db:
                plan=' '.join(str(r) for r in db.execute('EXPLAIN QUERY PLAN '+QUERY))
                self.assertIn('records_active_jobs',plan)
                self.assertEqual([json.loads(r[0])['id'] for r in db.execute(QUERY)],['executing','waiting'])
            with s.tx() as db:
                s.put(db,'jobs',{'id':'executing','status':'review'})
                s.put(db,'jobs',{'id':'old','status':'queued'})
            # Reopening runs the idempotent migration and retains live entries.
            s=Store(s.path)
            with s.read() as db:
                self.assertEqual([json.loads(r[0])['id'] for r in db.execute(QUERY)],['waiting','old'])
