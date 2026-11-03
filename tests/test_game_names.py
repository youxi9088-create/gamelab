import unittest
from controlplane.game_names import link_title, placeholder_title, clean_title, acquired_title, display_title


class GameNameTests(unittest.TestCase):
    def test_site_promotional_wrappers_preserve_actual_game_name(self):
        self.assertEqual(clean_title("Play Don't Trust the Game - Free Online Game | Rosebud",'https://rosebud.ai/play/c/id'),"Don't Trust the Game")
        self.assertEqual(clean_title('Play Gulf Champions - أبطال الخليج - Free Online Game | Rosebud','https://rosebud.ai/play/c/id'),'Gulf Champions - أبطال الخليج')
        self.assertEqual(clean_title('Blocky Blast Puzzle - 免费在线玩! | Poki (宝玩)','https://poki.com/zh/g/blocky'),'Blocky Blast Puzzle')
        self.assertEqual(clean_title('百战霸主免费在线玩_百战霸主游戏大全_17yoo免费游戏在线玩','https://www.17yoo.cn/game/x'),'百战霸主')
        self.assertEqual(clean_title('Play Something - Free Online Game | Rosebud','https://unrelated.example/game'),'Play Something - Free Online Game | Rosebud')
    def test_old_locked_name_cleans_itself_not_incoming_advertisement(self):
        c={'url':'https://rosebud.ai/play/c/id','title':'Play Beatgap - Free Online Game | Rosebud','title_source':'acquired_clean'}
        self.assertEqual(acquired_title(c,'New Advertisement'),'Beatgap')
        self.assertEqual(display_title(c),'Beatgap');self.assertEqual(c['title'],'Play Beatgap - Free Online Game | Rosebud')
        self.assertEqual(display_title({**c,'title_edited':True}),c['title'])
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
