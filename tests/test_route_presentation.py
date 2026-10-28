import unittest
from controlplane.route_presentation import route


class RoutePresentationTests(unittest.TestCase):
    def test_web_acquisition_line_from_round_evidence(self):
        job = {'id': 'job-1', 'stage': 'reconstruct', 'route': 'local',
               'report': {'path': 'A', 'recovery_kind': 'discovered-web-cocos2'}}
        result = route(job)
        self.assertEqual(result['route_label'], '网页采集 · 本地运行包')
        self.assertEqual(result['route_basis'], 'evidence')
        self.assertIn('Cocos 2', result['route_detail'])

    def test_ai_reconstruction_line(self):
        job = {'id': 'job-2', 'stage': 'reconstruct', 'route': 'B', 'report': {'path': 'B'}}
        self.assertEqual(route(job)['route_label'], 'AI 复刻')
        self.assertEqual(route(job)['route_basis'], 'evidence')
        # 未产出证据但阶段已进入重建，仍按 AI 复刻呈现
        self.assertEqual(route({'id': 'job-2b', 'stage': 'reconstruct'})['route_label'], 'AI 复刻')

    def test_original_source_lines_are_not_merged_into_reconstruction(self):
        for kind, label in (('provided_source', '原版源码整理'),
                            ('bundle-preserved', '原包保留'),
                            ('rea-embedded-web', '网页内嵌还原'),
                            ('configured-web-snapshot', '网页快照适配'),
                            ('wxapkg-service', '小程序包转换'),
                            ('external-converter', '外部转换服务')):
            result = route({'id': 'x', 'report': {'recovery_kind': kind}})
            self.assertEqual(result['route_label'], label, kind)

    def test_planned_web_task_is_not_shown_as_pending_rea(self):
        job = {'id': 'job-3', 'stage': 'rea', 'web_only': True, 'route': None}
        result = route(job, {'url': 'https://example.org/game'})
        self.assertEqual(result['route_label'], '网页采集 · 本地运行包')
        self.assertEqual(result['route_basis'], 'inferred')

    def test_wechat_source_plans_rea_decompilation(self):
        result = route({'id': 'job-4', 'stage': 'rea'}, {'url': '#小程序://游戏/abc'})
        self.assertEqual(result['route_label'], 'REA 反编译')
        self.assertEqual(result['route_basis'], 'inferred')

    def test_unknown_source_without_evidence_stays_undecided(self):
        result = route({'id': 'job-5', 'stage': 'rea'})
        self.assertEqual(result['route_label'], 'REA 分析')
        self.assertEqual(result['route_basis'], 'inferred')
        # 连阶段都没有时不假装有产线
        self.assertEqual(route({'id': 'job-5b'})['route_label'], '待分流')

    def test_continuation_inherits_the_base_version_line(self):
        versions = [{'id': 'v1', 'job_id': 'job-old', 'created_at': '2026-01-01',
                     'report': {'recovery_kind': 'discovered-web-ruffle'}},
                    {'id': 'v2', 'job_id': 'job-old', 'created_at': '2026-01-02',
                     'base_version_id': 'v1', 'report': {'summary': '续作修复'}}]
        job = {'id': 'job-7', 'stage': 'reconstruct', 'route': 'local',
               'continuation': True, 'base_version_id': 'v2', 'report': {}}
        result = route(job, None, versions)
        self.assertEqual(result['route_label'], '网页采集 · 本地运行包')
        self.assertIn('Ruffle', result['route_detail'])
        self.assertEqual(result['route_basis'], 'evidence')

    def test_wechat_cache_rebuild_is_not_shown_as_ai_reconstruction(self):
        report = {'reconstruction_mode': 'original-client-local-rules',
                  'source_acquisition': {'kind': 'wechat-cache', 'original_code': True}}
        self.assertEqual(route({'id': 'x', 'report': report})['route_label'], '原客户端 · 本地规则重建')

    def test_legacy_reports_still_name_their_line(self):
        self.assertEqual(route({'id': 'x', 'report': {'type': 'recovered-release-web-adaptation',
                                                      'rea': {'scope': 'startup'}, 'recovery': {'files': 5}}}
                               )['route_label'], 'REA 反编译 · Web 适配')
        self.assertEqual(route({'id': 'x', 'report': {'source_recovery': '恢复编译后 JavaScript 模块和原始资源'}}
                               )['route_label'], '原包恢复 · Web 适配')
        self.assertEqual(route({'id': 'x', 'report': {'resource_provenance': '原站资源'}}
                               )['route_label'], 'AI 复刻 · 沿用原资源')

    def test_retry_without_own_report_reuses_earlier_version_evidence(self):
        job = {'id': 'job-6', 'stage': 'reconstruct', 'report': {}}
        versions = [{'id': 'v1', 'job_id': 'job-6', 'created_at': '2026-01-01',
                     'report': {'recovery_kind': 'discovered-web-ruffle'}}]
        result = route(job, None, versions)
        self.assertEqual(result['route_label'], '网页采集 · 本地运行包')
        self.assertIn('Ruffle', result['route_detail'])
        # 别的任务的版本不能用来判定本任务
        self.assertEqual(route(dict(job, candidate_id='c1'), None,
                               [dict(versions[0], job_id='job-other', candidate_id='c2')])['route_basis'], 'inferred')
