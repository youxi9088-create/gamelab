"""Explicit mock-model contract test. Does NOT validate a live model's ability."""
import http.server
import json
import os
from pathlib import Path
import threading
import unittest
from unittest.mock import patch
import worker
from test_worker import Client


class MockModelIntegration(unittest.TestCase):
    def test_failed_browser_run_repaired_via_mock_http_model(self):
        good = worker.source_files(worker.ROOT/'fixtures/orbit-catch')
        responses = [
            {'observed_rules':['click ball to score','10 points wins','restart resets'], 'acceptance_tests':['restart button visible'], 'unknowns':[]},
            {'files':{'index.html':'<html><body><script>throw new Error("intentional mock-model broken build")</script></body></html>'},'entry':'index.html'},
            {'files':good,'entry':'index.html'}
        ]
        calls=[]
        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self,*args): pass
            def do_POST(self):
                body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                calls.append(body)
                reply=responses[len(calls)-1]
                payload=json.dumps({'choices':[{'message':{'content':json.dumps(reply)}}]}).encode()
                self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        try:
            with patch.dict(os.environ,{'REPLICA_AI_BASE_URL':f'http://127.0.0.1:{server.server_port}/v1','REPLICA_AI_API_KEY':'mock-only-test-key','REPLICA_AI_MODEL':'MOCK-NOT-A-LIVE-MODEL','REPLICA_AI_MAX_CALLS':'3','REPLICA_AI_VISION':'1'}):
                client=Client()
                worker.execute(client,{'id':'mock-model-integration','lease_token':'test-only','stage':'reconstruct','settings':{'reconstruct_minutes':2,'repair_rounds':1},'input':{'observations':{'controls':'click ball','win':'10 points','restart':'button'}}})
            complete=client.calls[-1][1]
            self.assertEqual(complete['outcome'],'ready_review',complete)
            self.assertEqual(complete['report']['repair_rounds_used'],1)
            self.assertEqual(len(calls),3)
            self.assertTrue(complete['report']['runtime_smoke']['passed'])
            self.assertFalse(complete['report']['runtime_smoke']['gameplay_verified'])
            artifact=next(body for name,body in client.calls if name=='artifacts')
            self.assertIn('screenshots/runtime-0.png',artifact['files'])
            self.assertIsInstance(calls[2]['messages'][1]['content'],list)
            self.assertEqual(calls[2]['messages'][1]['content'][1]['type'],'image_url')
        finally:
            server.shutdown();server.server_close();thread.join()


if __name__=='__main__': unittest.main()
