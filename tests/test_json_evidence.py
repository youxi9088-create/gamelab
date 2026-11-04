import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from json_evidence import dumps


class JsonEvidenceTests(unittest.TestCase):
    def test_browser_text_survives_utf8_without_losing_evidence(self):
        value = {'text': '中文 🐸 截断\ud83d', 'nested': ['\udc00', '\\ud83d'],
                 'passed': False, 'missing': ['/required.js']}
        text = dumps(value, ensure_ascii=False, indent=2)
        self.assertEqual(json.loads(text.encode('utf-8').decode('utf-8')), value)
        self.assertIn('中文 🐸', text)

    def test_regular_json_and_serialization_errors_are_unchanged(self):
        value = {'text': '中文 🐸', 'passed': False}
        self.assertEqual(dumps(value, ensure_ascii=False), json.dumps(value, ensure_ascii=False))
        with self.assertRaises(TypeError):
            dumps({'invalid': object()})
