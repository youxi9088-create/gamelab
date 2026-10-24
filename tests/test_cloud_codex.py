import json
from pathlib import Path
import tomllib
import unittest
from unittest.mock import Mock, patch
from controlplane.ai_provider import _complete, USAGE_SINK


class CloudCodexTests(unittest.TestCase):
    def test_cloud_cli_uses_private_config_images_and_actual_usage(self):
        config = dict(backend='codex_api', connection='cloud_codex', base_url='https://provider.example/v1',
                      model='gpt-6-sol', api_key='fixture-secret', http_headers={'x-openai-actor-authorization':'fixture-actor'})
        homes = []
        def popen(command, **kwargs):
            self.assertNotIn('fixture-secret', ' '.join(command))
            self.assertNotIn('fixture-actor', ' '.join(command))
            home = Path(kwargs['env']['CODEX_HOME']); homes.append(home)
            saved = tomllib.loads((home/'config.toml').read_text('utf-8'))
            self.assertEqual(saved['model'], 'gpt-6-sol')
            self.assertEqual(saved['model_providers']['OpenAI']['experimental_bearer_token'], 'fixture-secret')
            self.assertEqual(saved['model_providers']['OpenAI']['wire_api'], 'responses')
            self.assertFalse(saved['model_providers']['OpenAI']['requires_openai_auth'])
            self.assertEqual(Path(command[command.index('-i')+1]).read_bytes(), b'image')
            Path(command[command.index('-o')+1]).write_text(json.dumps({'result_json':'{"ok":true}'}))
            process = Mock(returncode=0)
            process.communicate.return_value = (b'{"type":"turn.completed","usage":{"input_tokens":11,"output_tokens":3}}',b'')
            return process
        messages=[{'role':'user','content':[{'type':'text','text':'JSON'}, {'type':'image_url','image_url':{'url':'data:image/png;base64,aW1hZ2U='}}]}]
        rows=[]; token=USAGE_SINK.set(rows.append)
        try:
            with patch('controlplane.ai_provider.codex_binary',return_value='codex-fixture'), patch('controlplane.codex_backend.subprocess.Popen',side_effect=popen):
                self.assertEqual(_complete(messages,config,30),({'ok':True},'codex'))
        finally: USAGE_SINK.reset(token)
        self.assertFalse(homes[0].exists())
        self.assertEqual((rows[0]['provider'],rows[0]['model'],rows[0]['input_tokens']),('codex','gpt-6-sol',11))
