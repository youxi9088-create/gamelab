import unittest
from controlplane.game_names import link_title, placeholder_title, clean_title, acquired_title


class GameNameTests(unittest.TestCase):
    def test_clean_and_stable_acquired_name(self):
        c=dict(url='https://remix.gg/g/toybox-rally',title='toybox rally')
        c['title']=acquired_title(c,'Toybox Rally on Remix – Play Now & Create Your Own Games')
        self.assertEqual(c['title'],'Toybox Rally')
        self.assertEqual(acquired_title(c,'Other Promotion'),'Toybox Rally')
        self.assertEqual(acquired_title({**c,'title':'我的名字','title_edited':True},'New'),'我的名字')
        self.assertEqual(clean_title('Free Online Games on Remix – Play & Create Instantly',c['url']),'')
        self.assertEqual(clean_title('Spider-Man',c['url']),'Spider-Man')

    def test_entry_and_wrapped_entry(self):
        self.assertEqual(link_title('https://example.com/g/toybox-rally'),'toybox rally')
        self.assertEqual(link_title('https://example.com/?next=%2Fg%2Ftiny-terror'),'tiny terror')
        self.assertEqual(link_title('https://example.com/'),'example.com')

    def test_preserve_real_and_manual_titles(self):
        c=dict(url='https://example.com/g/jamble',title='example.com')
        self.assertTrue(placeholder_title(c))
        self.assertFalse(placeholder_title({**c,'title_edited':True}))
        self.assertFalse(placeholder_title({**c,'title':'Jamble'}))
