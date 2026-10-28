import unittest
from controlplane.discovery_scan import Page, scan
from controlplane.game_technology import classify


class TechnologyTests(unittest.TestCase):
    def test_wrapper_and_marketing_are_not_runtime_evidence(self):
        for html in ('<p>Unity WebGL H5</p>', '<iframe src="/html5/game"></iframe>',
                     '<canvas></canvas>', '<!-- <script>createUnityInstance()</script> -->'):
            self.assertEqual(classify(html)['status'], 'unknown')

    def test_specific_runtime_signatures(self):
        fixtures = [('<script>createUnityInstance(canvas, config)</script>', 'Unity WebGL'),
                    ('<object data="game.swf?v=1"></object>', 'Flash / SWF'),
                    ('<script>new Phaser.Game(config)</script>', 'H5 / Phaser'),
                    ('<script>cc.game.run()</script>', 'H5 / Cocos'),
                    ('<script src="dmloader.js"></script><script>Engine.load()</script>', 'Defold HTML5')]
        for html, expected in fixtures:
            with self.subTest(expected=expected):
                result = classify(html)
                self.assertEqual(result['matches'][0]['technology'], expected)
                self.assertEqual(result['status'], 'hint')

    def test_structured_multi_platform_and_refinement(self):
        result = classify('<script>createUnityInstance()</script>', {'gamePlatform':['Web', 'HTML5', 'Android']})
        self.assertEqual([m['technology'] for m in result['matches']], ['Unity WebGL', 'Android'])
        self.assertEqual(classify(metadata={'operatingSystem':'微信小游戏'})['matches'][0]['platform'], '微信小游戏')
        self.assertEqual(classify(metadata={'gamePlatform':{'bad':'HTML5'}})['status'], 'unknown')

    def test_scan_persists_evidence_with_page_hash(self):
        html = '<script type="application/ld+json">{"@type":"VideoGame","name":"Fixture","gamePlatform":"HTML5"}</script>'
        pages = {'https://example.org/robots.txt':'', 'https://example.org':'<a href="/game/a">Fixture</a>', 'https://example.org/game/a':html}
        result = scan({'url':'https://example.org'}, fetcher=pages.__getitem__)
        game = result['games'][0]
        self.assertEqual(game['technology']['label'], 'Web · H5')
        self.assertEqual(len(game['content_sha256']), 64)
        self.assertEqual(Page('<title>Old page</title>').game_metadata()['technology']['status'], 'unknown')
