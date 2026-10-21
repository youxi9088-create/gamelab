import unittest
from controlplane.catalog_facets import facets


class CatalogFacetTests(unittest.TestCase):
    def test_independent_dimensions_and_no_title_guess(self):
        result=facets({'url':'#小程序://fixture','category':'微信小游戏 / 合成益智','engine':'Cocos Creator 3.5.1'})
        self.assertEqual(result,{'categories':['合成益智'],'engines':['微信小游戏','Cocos']})
        self.assertEqual(facets({'url':'https://example.org','category':'puzzle','engine':'Cocos 2'}, {'puzzle':'益智'}),{'categories':['益智'],'engines':['Web 游戏','Cocos']})
        self.assertEqual(facets({'title':'Cocos 微信小游戏'}),{'categories':['未分类'],'engines':['待识别']})

    def test_multiple_categories_deduplicated(self):
        self.assertEqual(facets({'category':'益智 / 休闲 / 益智'})['categories'],['益智','休闲'])
