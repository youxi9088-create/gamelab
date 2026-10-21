import tempfile,json,unittest
from pathlib import Path
from executors.config_discovery import discover_config
class ConfigDiscoveryTests(unittest.TestCase):
 def test_matches_code_tables_and_excludes_unrelated_fields(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);(root/'game/temp').mkdir(parents=True)
   code=root/'game.js';code.write_text(';'.join(f'Cfg.table{i}=response.table{i}' for i in range(24)))
   data={f'table{i}':{'sample':i} for i in range(22)};data['token']='must-not-copy'
   (root/'game/temp/config.json').write_text(json.dumps(data))
   (root/'game/temp/account.json').write_text(json.dumps({'token':'not-config','uid':'user'}))
   r=discover_config([root/'game'],[code],root/'out')
   self.assertEqual(len(r['candidates']),1);item=r['candidates'][0]
   self.assertEqual(len(item['missing_fields']),2)
   saved=json.loads((root/'out'/item['file']).read_text());self.assertNotIn('token',saved)
 def test_no_code_contract_does_not_collect_temp_json(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);r=discover_config([root],[],root/'out');self.assertEqual(r['candidates'],[])
