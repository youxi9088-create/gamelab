import copy
import re
import unittest

from controlplane.game_catalog import document, normalize
from controlplane.game_specification_v51 import SECTIONS, section_markdown


class HistoricalV51FormatTests(unittest.TestCase):
    def test_sparse_nested_facts_keep_sixteen_dimensions_without_inventing_facts(self):
        raw = {'specification_v51': {'template_version': '5.1', 'sections': {
            'key_numbers': '原配置：8×8；未进行本轮试玩。'}}}
        before = copy.deepcopy(raw)
        text = document('隔离夹具', normalize(raw))
        self.assertEqual(re.findall(r'^## (\d+)\. ', text, re.M), list(map(str, range(1, 17))))
        parts = re.split(r'^## \d+\. .*$', text, flags=re.M)[1:]
        self.assertTrue(all('**维度定义**' in p and '**内容说明**' in p for p in parts))
        self.assertIn('原配置：8×8；未进行本轮试玩。', text)
        self.assertNotIn('未登记', text)
        self.assertNotIn('已通关', text)
        self.assertEqual(raw, before)

    def test_both_profile_schemas_survive_normalization_and_canonical_wins(self):
        value = normalize({
            'specification_v51': {'template_version': '5.1', 'sections': {'controls': 'CURRENT_VERSION_FACT'}},
            'specification': {'template_version': '5.1', 'sections': {'controls': 'OLD_ALIAS_FACT'}},
        })
        self.assertIn('specification_v51', value)
        text = document('隔离夹具', value)
        self.assertIn('CURRENT_VERSION_FACT', text)
        self.assertNotIn('OLD_ALIAS_FACT', text)

    def test_revision_registration_keeps_runtime_and_pause_and_rejects_stale_revision(self):
        import tempfile
        from pathlib import Path
        from controlplane.store import Store
        from tools.register_game_profile import register
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            store = Store(root/'fixture.sqlite3')
            class MetadataService:
                def __init__(self):
                    self.store = store
                def get(self, db, kind, key):
                    value = store.get(db, kind, key)
                    if value is None:
                        raise ValueError('missing fixture')
                    return value
            service = MetadataService()
            version = {'id': 'v-format-fixture', 'candidate_id': 'fixture', 'status': 'review'}
            job = {'id': 'job-format-fixture', 'status': 'queued', 'manual_paused': True}
            artifact = root/'original-runtime.bin'
            artifact.write_bytes(b'IMMUTABLE_ORIGINAL_BYTES')
            with store.tx() as db:
                store.put(db, 'versions', version)
                store.put(db, 'jobs', job)
            register(service, version['id'], {'specification_v51': {
                'template_version': '5.1', 'sections': {'controls': '原输入，不新增试玩声明。'}}}, 0)
            fixed = {'specification_v51': {'template_version': '5.1', 'sections': {
                key: section_markdown(key, '原输入，不新增试玩声明。' if key == 'controls' else '')
                for key in SECTIONS}}}
            self.assertEqual(register(service, version['id'], fixed, 1)['revision'], 2)
            with self.assertRaises(ValueError):
                register(service, version['id'], fixed, 1)
            with store.read() as db:
                self.assertEqual(store.get(db, 'versions', version['id']), version)
                self.assertEqual(store.get(db, 'jobs', job['id']), job)
                self.assertEqual(len(store.all(db, 'game_profile_history')), 2)
            self.assertEqual(artifact.read_bytes(), b'IMMUTABLE_ORIGINAL_BYTES')

    def test_already_wrapped_facts_and_caption_are_not_duplicated(self):
        fact = '授权方：gcy。\n\n**维度定义**：已有定义。\n\n**内容说明**\n\n原规则逐字保留。'
        self.assertEqual(section_markdown('basic_facts', fact), fact)
        text = document('隔离夹具', normalize({
            'specification': {'template_version': '5.1', 'sections': {'basic_facts': fact}},
            'illustrations': [{'path': 'screenshots/current.png', 'caption': '仅证明首屏，后续未验证。'}],
        }), '/version-bound/')
        self.assertEqual(text.count('原规则逐字保留。'), 1)
        self.assertEqual(text.count('![实机图 1]'), 1)
        self.assertIn('/version-bound/screenshots/current.png', text)

    def test_backfill_is_repeatable_and_does_not_fill_unknown_sections(self):
        old = {'controls': '方向键移动；只作源码确认。'}
        migrated = {key: section_markdown(key, old.get(key, '')) for key in SECTIONS}
        self.assertEqual({key: section_markdown(key, text) for key, text in migrated.items()}, migrated)
        self.assertTrue(migrated['monetization'].endswith('**内容说明**'))
        self.assertNotIn('免费', migrated['monetization'])


if __name__ == '__main__':
    unittest.main()
