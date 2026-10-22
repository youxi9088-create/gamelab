import io
import json
import unittest
import sys
from pathlib import Path
from unittest.mock import Mock, patch
from controlplane.ai_provider import _complete, responses_input, read_responses_stream


class VisualInputTests(unittest.TestCase):
    def test_stream_requires_completed_event_and_retains_real_usage(self):
        terminal={'status':'completed','output':[{'content':[{'type':'output_text','text':'{"ok":true}'}]}],
                  'usage':{'input_tokens':42,'output_tokens':7}}
        data=('data: '+json.dumps({'type':'response.output_text.delta','delta':'{"ok":true}'})+'\n\n'
              +'data: '+json.dumps({'type':'response.completed','response':terminal})+'\n\n').encode()
        envelope={}
        self.assertEqual(read_responses_stream(io.BytesIO(data),envelope,float('inf')),terminal)
        self.assertEqual(envelope['usage']['input_tokens'],42)
        with self.assertRaisesRegex(ValueError,'without completion'):
            read_responses_stream(io.BytesIO(b'data: {"type":"response.output_text.delta","delta":"{}"}\n\n'),{},float('inf'))
        failed={}
        with self.assertRaises(ValueError):
            read_responses_stream(io.BytesIO(('data: '+json.dumps({'type':'response.incomplete','response':{'usage':{'input_tokens':5}}})+'\n\n').encode()),failed,float('inf'))
        self.assertEqual(failed['usage']['input_tokens'],5)
    def test_worker_retries_one_transient_api_failure_within_call_budget(self):
        sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
        import worker
        budget=worker.Budget(60,calls=3)
        with patch.object(worker,'ai_config',return_value={'backend':'api'}), patch.object(worker,'complete',side_effect=[
            RuntimeError('AI API 调用失败：URLError'), ({'ok':True},'api')]) as provider:
            self.assertEqual(worker.chat([],budget),{'ok':True})
            self.assertEqual(provider.call_count,2)
            self.assertEqual(budget.calls,1)
        with patch.object(worker,'ai_config',return_value={'backend':'api'}), patch.object(worker,'complete',side_effect=RuntimeError('AI API 调用失败：HTTP 401')) as provider:
            with self.assertRaises(worker.Blocked):worker.chat([],worker.Budget(60,calls=3))
            self.assertEqual(provider.call_count,1)

    def test_responses_converts_text_and_image_without_mutating_shared_messages(self):
        messages = [{'role': 'user', 'content': [{'type': 'text', 'text': 'JSON please'},
            {'type': 'image_url', 'image_url': {'url': 'data:image/png;base64,fixture'}}]}]
        converted = responses_input(messages)
        self.assertEqual(converted[0]['content'], [{'type': 'input_text', 'text': 'JSON please'},
            {'type': 'input_image', 'image_url': 'data:image/png;base64,fixture'}])
        self.assertEqual(messages[0]['content'][0]['type'], 'text')

    def test_truncated_stream_is_safe_and_retryable(self):
        config={'backend':'api','base_url':'http://127.0.0.1','api_key':'fixture-secret','model':'fixture','wire_api':'responses'}
        response=io.BytesIO(b'data: {"type":"response.output_text.delta","delta":"secret partial"}\n\n')
        response.headers={'Content-Type':'text/event-stream'}
        opener=Mock();opener.open.return_value=response
        with patch('controlplane.ai_provider.urllib.request.build_opener',return_value=opener):
            with self.assertRaisesRegex(RuntimeError,'流式响应提前结束') as error:_complete([],config,60)
        self.assertNotIn('secret',str(error.exception))
        sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
        import worker
        with patch.object(worker,'ai_config',return_value=config),patch.object(worker,'complete',side_effect=[error.exception,({'ok':True},'api')]) as provider:
            self.assertEqual(worker.chat([],worker.Budget(60,calls=2)),{'ok':True})
            self.assertEqual(provider.call_count,2)

    def test_api_wait_respects_task_budget_and_does_not_fallback(self):
        config = {'backend': 'api', 'base_url': 'http://127.0.0.1', 'api_key': 'fixture-secret',
                  'model': 'fixture', 'wire_api': 'responses'}
        for remaining, expected in [(240, 240), (600, 300), (10, 10)]:
            opener = Mock()
            opener.open.return_value = io.BytesIO(json.dumps({'output': [{'content': [
                {'type': 'output_text', 'text': '{"ok":true}'}]}]}).encode())
            opener.open.return_value.headers={}
            with patch('controlplane.ai_provider.urllib.request.build_opener', return_value=opener):
                self.assertEqual(_complete([{'role': 'user', 'content': 'JSON'}], config, remaining), ({'ok': True}, 'api'))
                self.assertEqual(opener.open.call_args.kwargs['timeout'], expected)
        with patch('controlplane.ai_provider.urllib.request.build_opener') as factory, patch('controlplane.ai_provider.codex_json') as cli:
            factory.return_value.open.side_effect = TimeoutError('fixture-secret')
            with self.assertRaisesRegex(RuntimeError, '超时') as error:
                _complete([], config, 100)
            self.assertNotIn('fixture-secret', str(error.exception))
            cli.assert_not_called()


if __name__ == '__main__':
    unittest.main()
