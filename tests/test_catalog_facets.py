import unittest
from controlplane.catalog_facets import facets, effective_engine


class CatalogFacetTests(unittest.TestCase):
    def test_engine_uses_version_evidence_without_title_guess_or_mutation(self):
        candidate={'id':'a','title':'Flash Cocos','engine':'待分析'}
        versions=[{'candidate_id':'other','report':{'engine':'Wrong'}},
                  {'candidate_id':'a','created_at':'2026-10-22','report':{'recovery_kind':'discovered-web-cocos2'}}]
        self.assertEqual(effective_engine(candidate,versions),'Cocos 2')
        self.assertEqual(candidate['engine'],'待分析')
        self.assertEqual(effective_engine(candidate,[]),'待分析')
        self.assertEqual(effective_engine({**candidate,'engine':'Explicit engine'},versions),'Explicit engine')
        self.assertEqual(effective_engine(candidate,[{'candidate_id':'a','report':{'engine':'Imported engine'}}]),'Imported engine')

    def test_independent_dimensions_and_no_title_guess(self):
        result=facets({'url':'#小程序://fixture','category':'微信小游戏 / 合成益智','engine':'Cocos Creator 3.5.1'})
        self.assertEqual(result,{'categories':['合成益智'],'engines':['微信小游戏','Cocos']})
        self.assertEqual(facets({'url':'https://example.org','category':'puzzle','engine':'Cocos 2'}, {'puzzle':'益智'}),{'categories':['益智'],'engines':['Web 游戏','Cocos']})
        self.assertEqual(facets({'title':'Cocos 微信小游戏'}),{'categories':['未分类'],'engines':['待识别']})

    def test_multiple_categories_deduplicated(self):
        self.assertEqual(facets({'category':'益智 / 休闲 / 益智'})['categories'],['益智','休闲'])
