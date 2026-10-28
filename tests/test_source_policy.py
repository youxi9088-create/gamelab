import unittest
from unittest.mock import patch

from controlplane import source_policy
from controlplane.source_policy import blocked, describe, host_policy

# 2026-10-27 教训：remix.gg 与 crazygames.com 曾被当作登录墙/站点锁拦下，
# 实际是采集等待不足导致 canvas 未渲染。修复后 4/4、3/3 全部通过，规则已清空。
# 所以这里不硬编码"某域名必被拦"，只锁机制本身与"当前不得误伤"。
NEVER_BLOCKED = ('https://remix.gg/g/slap-battles', 'https://www.crazygames.com/game/x',
                 'https://poki.com/zh/g/drive-mad', 'https://www.astrocade.com/games/x',
                 'https://www.4k99.com/detail/877')


class SourcePolicyTests(unittest.TestCase):
    def test_no_host_is_blocked_by_default(self):
        # 误拦会让上百个可转候选静默消失；没有全部失败的实测证据就不该有规则。
        for url in NEVER_BLOCKED:
            self.assertIsNone(host_policy(url), url)

    def test_unknown_or_empty_input_is_free(self):
        self.assertIsNone(host_policy(''))
        self.assertIsNone(host_policy(None))

    def test_rule_matching_covers_subdomain_and_bare_host(self):
        rules = {'hosts': [{'host': 'blocked.test', 'policy': 'login-wall', 'label': 'L',
                            'reason': 'R', 'next_action': 'N'}]}
        with patch.object(source_policy, 'rules', lambda: rules):
            self.assertIsNotNone(host_policy('https://blocked.test/g/1'))
            self.assertEqual(host_policy('https://www.blocked.test/g/1')['matched_host'], 'www.blocked.test')
            self.assertIsNone(host_policy('https://notblocked.test/g/1'))

    def test_blocked_splits_and_keeps_free_items(self):
        rules = {'hosts': [{'host': 'blocked.test', 'policy': 'login-wall', 'label': 'L',
                            'reason': 'R', 'next_action': 'N'}]}
        items = [{'url': 'https://blocked.test/a', 'title': 'A'},
                 {'url': 'https://free.test/b', 'title': 'B'}]
        with patch.object(source_policy, 'rules', lambda: rules):
            gated, free = blocked(items)
            self.assertEqual([i['title'] for i, _ in gated], ['A'])
            self.assertEqual([i['title'] for i in free], ['B'])
            self.assertIn('blocked.test', describe(gated))

    def test_shipped_rules_require_evidence(self):
        # 没有实测证据不得入列，否则又会回到"凭印象拦截"。
        for entry in source_policy.rules()['hosts']:
            self.assertTrue(entry.get('evidence'), entry['host'])
            self.assertTrue(entry.get('reason') and entry.get('next_action'), entry['host'])
