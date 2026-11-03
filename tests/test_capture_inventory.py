import unittest
from controlplane.capture_inventory import cumulative,game_key

class CaptureInventoryTests(unittest.TestCase):
 def test_union_counts_overlap_and_repeated_source_rows(self):
  key=game_key('https://www.astrocade.com/games/one/01KTAW2J5JM7HCHZZ52WSXXTJV','x')
  state={'candidates':[{'id':'a','url':'https://www.astrocade.com/games/renamed/01KTAW2J5JM7HCHZZ52WSXXTJV'},{'id':'b','url':'https://remix.gg/g/other'}]}
  inventory={'schema_version':1,'source_records':3,'games':[{'key':key,'captured':True,'supplied':True},{'key':key,'captured':True,'supplied':True},{'key':'git:another','captured':True,'supplied':True}]}
  result=cumulative(state,{'a','b'},{'b'},inventory)
  self.assertEqual(result['captured_games'],3);self.assertEqual(result['supplied_games'],3);self.assertEqual(result['capture_inventory_breakdown']['capture_overlap'],1)
 def test_unconfirmed_items_do_not_count(self):
  result=cumulative({'candidates':[]},set(),set(),{'schema_version':1,'games':[{'key':'x','captured':False,'supplied':False}]})
  self.assertEqual(result['captured_games'],0);self.assertEqual(result['supplied_games'],0)
 def test_invalid_inventory_is_unknown_not_silently_zero(self):
  result=cumulative({},set(),set(),{'schema_version':2,'games':[]})
  self.assertIsNone(result['captured_games']);self.assertIsNone(result['supplied_games'])
 def test_historical_templates_are_explicit_and_overlap_is_not_duplicated(self):
  key=game_key('https://example.test/game','x')
  state={'candidates':[{'id':'a','url':'https://example.test/game'}]}
  inventory={'schema_version':1,'games':[{'key':key,'templated':True},{'key':'git:second','templated':True},{'key':'git:third','supplied':True}]}
  result=cumulative(state,set(),set(),inventory,template_ids={'real-a','real-b'},templated_candidates={'a'})
  self.assertEqual(result['downstream_templates'],3)
  self.assertEqual(result['capture_inventory_breakdown']['template_overlap_games'],1)
  self.assertNotIn('template_id',inventory['games'][0])
 def test_historical_inventory_does_not_change_other_kpis_or_state(self):
  from controlplane.dashboard_operations import production_kpis
  state={'candidates':[{'id':'a','url':'https://example.test/a'}],'supply':[],'capture_inventory':{'schema_version':1,'games':[{'key':'git:one','captured':True,'supplied':True}]}}
  result=production_kpis(state,[{'candidate_id':'a','conversion_closed':True,'duration_seconds':None}],[])
  self.assertEqual(result['converted_games'],1);self.assertEqual(result['captured_games'],2);self.assertEqual(result['supplied_games'],1);self.assertEqual(result['downstream_templates'],0)
  self.assertIsNone(result['average_tokens']);self.assertIsNone(result['average_cost_cny']);self.assertEqual(state['supply'],[])

if __name__=='__main__':unittest.main()
