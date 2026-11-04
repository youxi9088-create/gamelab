import unittest
from controlplane.game_categories import category_projection

class CategoryTests(unittest.TestCase):
 def test_actual_profile_overrides_stale_source_and_normalizes_labels(self):
  c={'id':'x','category':'赛车'}
  versions=[{'id':'v','candidate_id':'x','report':{'game_profile':{'category':'3D策略棋类（国际象棋变体）'}}}]
  result=category_projection(c,versions)
  self.assertEqual(result['name'],'棋类');self.assertEqual(result['version_id'],'v')
  self.assertEqual(c['category'],'赛车')
 def test_top_level_profile_and_blank_draft(self):
  versions=[{'id':'old','created_at':'1','candidate_id':'x','game_profile':{'category':'休闲益智·车辆排序解谜'}},
            {'id':'new','created_at':'2','candidate_id':'x','report':{'game_profile':{'category':''}}}]
  self.assertEqual(category_projection({'id':'x'},versions)['name'],'解谜')
 def test_operations_summary_is_not_gameplay_evidence(self):
  self.assertEqual(category_projection({'id':'x'},[{'candidate_id':'x','report':{'summary':'射击游戏方案不适用'}}])['name'],'待分类')
 def test_default_is_not_evidence(self):
  c={'id':'x','title':'Sudoku Racing Shooter','category':'休闲'}
  self.assertEqual(category_projection(c)['name'],'待分类')
  self.assertEqual(c['category'],'休闲')
 def test_manual_priority(self):
  self.assertEqual(category_projection({'category':'休闲','category_edited':True,'description':'射击游戏'})['name'],'休闲')
 def test_structured_report(self):
  self.assertEqual(category_projection({'id':'x','category':'休闲'},[{'candidate_id':'x','report':{'genre':'解谜'}}])['name'],'解谜')
 def test_description_and_scope(self):
  self.assertEqual(category_projection({'id':'x','category':'休闲','description':'第一人称射击游戏'})['name'],'射击')
  self.assertEqual(category_projection({'id':'x'},[{'candidate_id':'other','report':{'genre':'赛车'}}])['name'],'待分类')
