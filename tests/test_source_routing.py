import sys
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'executors'))
from controlplane.source_routing import source_kind,web_block_reason
from dependency_inventory import inventory


class SourceRoutingTests(unittest.TestCase):
    def test_web_without_appid_is_not_wechat(self):
        self.assertEqual(source_kind('https://example.org/game',{}),'web')
        self.assertEqual(source_kind('https://example.org/game',{'appids':['invalid']}),'web')

    def test_confirmed_wechat_identity_retained(self):
        self.assertEqual(source_kind('#小程序://测试/path'),'wechat')
        self.assertEqual(source_kind('',{'appids':['wx0123456789abcdef']}),'wechat')

    def test_incidental_appid_does_not_reclassify_web_source(self):
        self.assertEqual(source_kind('https://www.4k99.com/detail/7333',{'appids':['wxd1b553c5c80e693e']}),'web')

    def test_web_inventory_does_not_claim_package_or_cache(self):
        result=inventory({'source_kind':'web','web_discovery':{'entries':[]}})
        self.assertEqual({i['kind'] for i in result['items']},{'code','resources','data','backend','platform'})
        self.assertTrue(all(i['status']=='unknown' for i in result['items']))
        self.assertNotIn('微信',str(result))

    def test_unread_page_is_not_reported_as_missing_entry(self):
        # 空观测意味着页面根本没读到，不能再说成"没有入口"——这两种失败的
        # 处理方式完全不同，混在一起会让每次超时都往入口方向排查。
        unread=web_block_reason({})
        self.assertIn('采集未产出',unread)
        self.assertNotIn('尚未识别',unread)
        self.assertNotIn('没有入口',unread.replace('不是"没有入口"',''))
        flagged=web_block_reason({'title':'x','acquisition_error':'Timeout 90000ms exceeded'})
        self.assertIn('采集阶段未能完成',flagged)
        self.assertIn('Timeout',flagged)

    def test_missing_entry_and_missing_adapter_are_distinct(self):
        missing=web_block_reason({'title':'x','web_discovery':{'entries':[]}})
        self.assertIn('尚未识别',missing)
        self.assertNotIn('微信',missing)
        lead=web_block_reason({'web_discovery':{'launch_links':[{'url':'https://example.org/play','label':'开始游戏'}]}})
        self.assertIn('可能的启动链接',lead)
        control=web_block_reason({'web_discovery':{'launch_controls':[{'label':'开始游戏'}]}})
        self.assertIn('已保留线索但没有自动点击',control)
        self.assertIn('已识别',web_block_reason({'web_discovery':{'entries':[{'url':'https://example.org/play'}]}}))

    def test_wrong_adapter_is_rejected(self):
        from controlplane.web_profiles import supports,profiles
        profile=profiles()[0]['profile']
        self.assertFalse(supports('https://www.astrocade.com/games/example',profile))
        self.assertFalse(supports('https://c.17yoo.cn/playbox/other',profile))
        self.assertTrue(supports('https://c.17yoo.cn/playbox/10109/?language=zh',profile))

if __name__=='__main__':unittest.main()
