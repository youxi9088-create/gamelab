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
        self.assertEqual(result,{'categories':['合成益智'],'engines':['Cocos']})
        self.assertEqual(facets({'url':'https://example.org','category':'puzzle','engine':'Cocos 2'}, {'puzzle':'益智'}),{'categories':['益智'],'engines':['Cocos']})
        self.assertEqual(facets({'title':'Cocos 微信小游戏'}),{'categories':['未分类'],'engines':['待识别']})

    def test_cocos_flavours_collapse_into_one_bucket_and_exclude_the_web_bucket(self):
        """A Cocos game is Cocos only; it is never also counted as a generic Web game."""
        for engine in ('Cocos', 'cocos', 'Cocos 2', 'Cocos Creator 3.5.1', 'cocos2d-x'):
            self.assertEqual(facets({'url':'https://example.org','engine':engine}),
                             {'categories':['未分类'],'engines':['Cocos']}, engine)
            self.assertEqual(facets({'url':'#小程序://fixture','category':'微信小游戏 / 益智','engine':engine}),
                             {'categories':['益智'],'engines':['Cocos']}, engine)
        # Non-Cocos web engines still land in the Web bucket.
        self.assertEqual(facets({'url':'https://example.org','engine':'Three.js'})['engines'],['Web 游戏'])
        self.assertEqual(facets({'url':'https://example.org','engine':'通用 Web 运行包'})['engines'],['Web 游戏'])
        self.assertEqual(facets({'url':'https://example.org','engine':'Ruffle / Flash'})['engines'],['Web 游戏'])

    def test_acquisition_evidence_fills_only_candidates_without_version_evidence(self):
        candidate={'id':'a','engine':'待分析'}
        self.assertEqual(effective_engine(candidate,[],{'a':'Cocos 2'}),'Cocos 2')
        self.assertEqual(effective_engine(candidate,[]),'待分析')
        # A converted version outranks the earlier acquisition guess.
        versions=[{'candidate_id':'a','created_at':'2026-10-22','report':{'engine':'Defold'}}]
        self.assertEqual(effective_engine(candidate,versions,{'a':'Cocos 2'}),'Defold')
        # So does an explicit label on the candidate itself.
        self.assertEqual(effective_engine({'id':'a','engine':'Explicit'},[],{'a':'Cocos 2'}),'Explicit')
        self.assertEqual(candidate['engine'],'待分析')

    def test_multiple_categories_deduplicated(self):
        self.assertEqual(facets({'category':'益智 / 休闲 / 益智'})['categories'],['益智','休闲'])
