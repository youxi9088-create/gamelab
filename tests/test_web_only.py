import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'executors'))
from controlplane.web_only import assess
from acquisition import acquire
from worker import Budget, PolicyPause


class WebOnlyTests(unittest.TestCase):
    def test_gate_requires_evidence(self):
        self.assertFalse(assess('https://example.org/game')['allowed'])
        self.assertFalse(assess('#小程序://游戏/abc')['allowed'])
        android = '<script type="application/ld+json">{"@type":"VideoGame","operatingSystem":"Android"}</script>'
        self.assertFalse(assess('https://example.org/game', android)['allowed'])
        self.assertTrue(assess('https://example.org/game', '<script>createUnityInstance()</script>')['allowed'])
        self.assertTrue(assess('https://example.org/game', observation={'web_discovery':{'entries':[{'evidence':'rendered-canvas','canvas_count':1}]}})['allowed'])

    def test_unknown_stops_before_cache_and_ai(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            def capture(*args, **kwargs):
                directory=root/'acquisition';directory.mkdir()
                (directory/'source.html').write_text('<h1>Unknown</h1>',encoding='utf-8')
                (directory/'observation.json').write_text(json.dumps({'title':'Unknown','metadata':[],'appids':[]}),encoding='utf-8')
                from types import SimpleNamespace
                return SimpleNamespace(returncode=0)
            with patch('controlplane.runtime.node_binary',return_value='fixture'), patch('acquisition.subprocess.run',side_effect=capture) as run:
                with self.assertRaises(PolicyPause) as caught:
                    acquire('https://example.org/game',root,Budget(20),web_only=True)
                self.assertTrue(caught.exception.auto_repair_attempted)
                self.assertEqual(run.call_count,1)
                self.assertFalse((root/'acquisition/analysis').exists())
                self.assertFalse(json.loads((root/'acquisition/web-only-check.json').read_text('utf-8'))['allowed'])

    def test_wall_redirect_is_named_as_a_wall(self):
        # remix.gg 把 /g/slap-battles 弹回首页并带 ?next=；这不是"没有入口"。
        gate = assess('https://remix.gg/g/slap-battles', '<html></html>',
                      {'title': 'Free Online Games on Remix',
                       'final_url': 'https://remix.gg/?next=%2Fg%2Fslap-battles',
                       'web_discovery': {'entries': [], 'iframe_hints': []}})
        self.assertFalse(gate['allowed'])
        self.assertEqual(gate['wall_redirect'], 'https://remix.gg/?next=%2Fg%2Fslap-battles')
        self.assertIn('跳回入口页', gate['reason'])
        self.assertNotIn('已读取页面但未确认', gate['reason'])

    def test_gated_iframe_is_named_as_a_gate(self):
        gate = assess('https://www.crazygames.com/game/x', '<html></html>',
                      {'title': 'Boomng Car Crash',
                       'web_discovery': {'entries': [],
                                         'iframe_probes': [{'declared_url': 'https://games.crazygames.com/x/index.html'}]}})
        self.assertFalse(gate['allowed'])
        self.assertIn('同意门或发行方站点锁', gate['reason'])
        self.assertEqual(gate['gated_iframe'], 'https://games.crazygames.com/x/index.html')

    def test_login_modal_is_not_reported_as_a_site_lock(self):
        # 4k99 点"开始游戏"后弹 /modal/Login；这是账号门槛，不是发行方站点锁。
        gate = assess('https://www.4k99.com/detail/17721', '<html></html>',
                      {'title': '双人成行', 'web_discovery': {'entries': [], 'iframe_hints': [],
                       'iframe_probes': [{'declared_url': 'https://www.4k99.com/modal/Login?t=1793166559998&mobile=1'}]}})
        self.assertFalse(gate['allowed'])
        self.assertIn('弹出登录框', gate['reason'])
        self.assertNotIn('站点锁', gate['reason'])
        self.assertEqual(gate['gated_iframe'], '')
        self.assertEqual(gate['login_iframe'], 'https://www.4k99.com/modal/Login?t=1793166559998&mobile=1')

    def test_game_iframe_still_wins_over_a_login_modal(self):
        # 页面同时有登录框和游戏 iframe 时，按游戏 iframe 判定，不能被登录框顶掉。
        gate = assess('https://www.crazygames.com/game/x', '<html></html>',
                      {'title': 'X', 'web_discovery': {'entries': [],
                       'iframe_probes': [{'declared_url': 'https://x.test/modal/Login'}],
                       'iframe_hints': [{'url': 'https://games.crazygames.com/x/index.html'}]}})
        self.assertEqual(gate['gated_iframe'], 'https://games.crazygames.com/x/index.html')
        self.assertIn('同意门或发行方站点锁', gate['reason'])

    def test_srcdoc_canvas_counts_as_a_rendered_entry(self):
        # astrocade 把游戏写在 srcdoc iframe 里，frame.url() 恒为 about:srcdoc，
        # 没有 URL 线索；渲染出画面就该算入口。
        gate = assess('https://www.astrocade.com/games/x', '<html></html>',
                      {'title': 'X', 'web_discovery': {'entries': [
                          {'evidence': 'srcdoc-rendered-canvas', 'canvas_count': 1,
                           'srcdoc_file': 'srcdoc-1.html'}]}})
        self.assertTrue(gate['allowed'])

    def test_same_depth_redirect_is_not_a_wall(self):
        # 同深度的路径改写（多语言、规范链接）不该被当成登录墙。
        self.assertIsNone(assess('https://example.org/game/one', '<html></html>',
                                 {'final_url': 'https://example.org/game/two'})['wall_redirect'])

    def test_rendered_entry_beats_gate_and_wall(self):
        # 真的渲染出画面时，任何"被挡住"的判断都不成立。
        rendered = [{'evidence': 'rendered-canvas', 'canvas_count': 1}]
        cases = ({'final_url': 'https://example.org/?next=/game/one', 'web_discovery': {'entries': rendered}},
                 {'web_discovery': {'entries': rendered, 'iframe_hints': [{'url': 'https://x.test/'}]}})
        for extra in cases:
            self.assertTrue(assess('https://example.org/game/one', '<html></html>', extra)['allowed'], extra)

    def test_share_pauses_before_any_process(self):
        with tempfile.TemporaryDirectory() as temp, patch('acquisition.subprocess.run') as run:
            with self.assertRaises(PolicyPause):
                acquire('#小程序://游戏/abc',Path(temp),Budget(20),web_only=True)
            run.assert_not_called()
