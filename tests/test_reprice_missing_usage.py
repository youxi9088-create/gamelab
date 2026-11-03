import json,subprocess,sys,tempfile,unittest
from pathlib import Path
from controlplane.store import Store

class MissingPriceRepairTests(unittest.TestCase):
 def test_backup_and_repair_preserve_known_cost_and_unknown_usage(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);store=Store(root/'platform.sqlite3')
   rows=[{'id':'known','provider':'api','model':'kimi-k3','input_tokens':1000,'output_tokens':100,'cached_input_tokens':200,'cache_write_tokens':None,'estimated_cost':1.23,'currency':'CNY'},
         {'id':'missing','provider':'api','model':'kimi-k3','input_tokens':1000,'output_tokens':100,'cached_input_tokens':200,'cache_write_tokens':None,'estimated_cost':None},
         {'id':'unknown','provider':'api','model':'kimi-k3','input_tokens':None,'output_tokens':100,'cached_input_tokens':None,'cache_write_tokens':None,'estimated_cost':None}]
   with store.tx() as db:
    for row in rows:store.put(db,'ai_usage',row)
   rate=root/'rate.json';rate.write_text(json.dumps({'currency':'CNY','input_per_million':20,'output_per_million':100,'cached_input_per_million':2}),'utf-8')
   tool=Path(__file__).resolve().parents[1]/'tools/reprice_missing_usage.py'
   result=subprocess.run([sys.executable,str(tool),'--data',str(root),'--rate',str(rate),'--provider','api','--model','kimi-k3','--source','https://www.kimi.com/news/kimi-k3','--apply'],capture_output=True,text=True,encoding='utf-8',check=True)
   self.assertEqual(json.loads(result.stdout)['updated_records'],1)
   with store.read() as db:
    self.assertEqual(store.get(db,'ai_usage','known'),rows[0]);self.assertEqual(store.get(db,'ai_usage','unknown'),rows[2]);repaired=store.get(db,'ai_usage','missing')
   self.assertIsNone(repaired['cache_write_tokens']);self.assertAlmostEqual(repaired['estimated_cost'],.0264)
   self.assertTrue(list(root.glob('usage-pricing-backup-*.json')))

if __name__=='__main__':unittest.main()
