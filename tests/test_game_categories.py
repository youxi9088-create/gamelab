import unittest
from controlplane.game_categories import category_projection

class CategoryTests(unittest.TestCase):
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
