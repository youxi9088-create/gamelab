import base64
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from controlplane.codex_account import account_home, require_account
from controlplane.ai_provider import _complete, AIProviderError
from controlplane.service_registry import ServiceRegistry
from controlplane.service import ApiError


class CodexAccountTest(unittest.TestCase):
    def test_missing_or_wrong_account_cannot_enable_and_no_secret_in_public(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict('os.environ', GAMELAB_SHARED_ROOT=tmp):
            registry = ServiceRegistry(Path(tmp)/'services.json')
            config = dict(connection='codex_account', account_email='fixture@example.com', model='gpt-6-sol')
            with self.assertRaises(ApiError): registry.save('ai', config)
            home = account_home(config['account_email']); home.mkdir(parents=True)
            for email in ['wrong@example.com', 'fixture@example.com']:
                claims=base64.urlsafe_b64encode(json.dumps({'email':email}).encode()).decode().rstrip('=')
                (home/'auth.json').write_text(json.dumps({'tokens':{'id_token':'fixture.'+claims+'.fixture', 'refresh_token':'private-refresh'}}))
                if email.startswith('wrong'):
                    with self.assertRaises(AIProviderError): require_account(config['account_email'])
                    continue
                registry.save('ai', config)
                self.assertNotIn('private-refresh', json.dumps(registry.public()))
                self.assertEqual(registry.config('ai')['account_email'], email)

    def test_inference_uses_isolated_home_and_retains_refreshable_auth(self):
        with tempfile.TemporaryDirectory() as tmp:
            home=Path(tmp); (home/'auth.json').write_text('private-login')
            config=dict(backend='codex_account', account_email='fixture@example.com', model='gpt-6-sol')
            def popen(command, **kwargs):
                self.assertEqual(kwargs['env']['CODEX_HOME'],str(home))
                self.assertNotIn('OPENAI_API_KEY',kwargs['env'])
                self.assertIn('forced_login_method="chatgpt"',command)
                self.assertIn('gpt-6-sol',command)
                Path(command[command.index('-o')+1]).write_text('{"result_json":"{\\"ok\\":true}"}')
                proc=Mock(returncode=0); proc.communicate.return_value=(b'',b''); return proc
            with patch('controlplane.codex_account.require_account',return_value=home), patch('controlplane.ai_provider.codex_binary',return_value='fixture-cli'), patch('controlplane.codex_backend.subprocess.Popen',side_effect=popen), patch.dict('os.environ',OPENAI_API_KEY='other-account'):
                self.assertEqual(_complete([{'role':'user','content':'JSON'}],config),({'ok':True},'codex'))
            self.assertEqual((home/'auth.json').read_text(),'private-login')

