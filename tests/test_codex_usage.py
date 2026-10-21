import json
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from controlplane.ai_provider import codex_usage, _complete, USAGE_SINK

class CodexUsageTests(unittest.TestCase):
    def test_real_event_fields_and_unknown(self):
        line=json.dumps({'type':'turn.completed','usage':{'input_tokens':100,'cached_input_tokens':90,'output_tokens':20}})
        self.assertEqual(codex_usage('noise\n'+line),{'prompt_tokens':100,'completion_tokens':20})
        self.assertEqual(codex_usage(json.dumps({'type':'item.completed','usage':{'input_tokens':999}})),{})
        self.assertEqual(codex_usage('{"type":"turn.completed","usage":{"input_tokens":true}}'),{})
        self.assertEqual(codex_usage(line+'\n{"type":"turn.failed"}'),{})
    def test_cli_to_sink_success_and_invalid_output(self):
        for valid in (True,False):
            rows=[];token=USAGE_SINK.set(rows.append)
            def run(command,**kwargs):
                self.assertIn('--json',command)
                Path(command[command.index('-o')+1]).write_text('{"ok":true}' if valid else 'invalid','utf-8')
                return SimpleNamespace(returncode=0,stdout='{"type":"turn.completed","usage":{"input_tokens":123,"output_tokens":7}}')
            try:
                with patch('controlplane.ai_provider.codex_binary',return_value='fixture'),patch('controlplane.ai_provider.subprocess.run',side_effect=run):
                    if valid:self.assertEqual(_complete([],{'backend':'codex'})[0],{'ok':True})
                    else:
                        with self.assertRaises(ValueError):_complete([],{'backend':'codex'})
            finally:USAGE_SINK.reset(token)
            self.assertEqual(len(rows),1)
            self.assertEqual((rows[0]['input_tokens'],rows[0]['output_tokens']),(123,7))
            self.assertEqual(rows[0]['status'],'succeeded' if valid else 'failed')
