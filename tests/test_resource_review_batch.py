import json,tempfile,sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from resource_review import OptionalResourceReview

class BatchReviewTests(unittest.TestCase):
 def test_all_resources_need_evidence_and_rollback_preserves_original(self):
  with tempfile.TemporaryDirectory() as d:
   run=Path(d);target=run/'converted';(target/'evidence').mkdir(parents=True);(target/'screenshots').mkdir()
   (target/'screenshots/failed.png').write_bytes(b'fixture screenshot')
   paths=['assets/a.mp3','assets/b.mp3']
   acq={'capture_key':'fixture','unavailable':[{'path':p,'http_status':404} for p in paths]}
   raw=json.dumps(acq).encode();(run/'web-acquisition.json').write_bytes(raw)
   (target/'evidence/runtime.json').write_text(json.dumps({'missing':['/'+p for p in paths]}))
   review=OptionalResourceReview(run,None);args={'paths':paths,'reason':'Source uses a verified synthesizer fallback; observed screenshot shows playable scene.'}
   self.assertEqual(len(review.execute(args)),2);review.rollback()
   self.assertEqual((run/'web-acquisition.json').read_bytes(),raw)
   with self.assertRaises(ValueError):review.execute({**args,'paths':paths+['unknown.mp3']})
   self.assertEqual((run/'web-acquisition.json').read_bytes(),raw)

if __name__=='__main__':unittest.main()
