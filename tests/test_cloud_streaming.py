import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from acquisition import cloud_streaming  # noqa: E402


class CloudStreamingTest(unittest.TestCase):
    def test_detects_from_title(self):
        self.assertTrue(cloud_streaming({'title': '易红2网页版在线免费玩 - 动作射击枪战游戏 | 随乐游云游戏'}))

    def test_detects_from_frame_host(self):
        self.assertTrue(cloud_streaming({'title': '某个游戏', 'frames': [
            {'url': 'https://www.suileyoo.com/game/detail/2887?pid=PIDlcu7tBmlX'}]}))

    def test_web_game_is_not_cloud(self):
        """真网页游戏不能被误判，否则会把能转的任务一起停掉。"""
        self.assertFalse(cloud_streaming({'title': '地铁跑酷', 'frames': [
            {'url': 'https://www.4k99.com/detail/51983'},
            {'url': 'https://cdn.example.org/game/index.html'}]}))

    def test_missing_fields_are_safe(self):
        self.assertFalse(cloud_streaming({}))
        self.assertFalse(cloud_streaming(None))
        self.assertFalse(cloud_streaming({'frames': [None, {}]}))
