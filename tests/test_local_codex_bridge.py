import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.request
import urllib.error
from unittest.mock import patch
from tools.local_codex_bridge import Handler,ThreadingHTTPServer,prepare


class LocalCodexBridgeTests(unittest.TestCase):
    def test_images_are_attached_and_remote_images_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            texts,images=prepare([{'role':'user','content':[{'type':'text','text':'actual screenshot'},{'type':'image_url','image_url':{'url':'data:image/png;base64,aW1hZ2U='}}]}],Path(folder))
            self.assertEqual(images[0].read_bytes(),b'image')
            self.assertNotIn('base64',texts[0]['content'])
            part={'type':'image_url','image_url':{'url':'data:image/png;base64,aW1hZ2U='}}
            self.assertEqual(len(prepare([{'role':'user','content':[part]*6}],Path(folder))[1]),6)
            with self.assertRaises(ValueError):prepare([{'role':'user','content':[part]*7}],Path(folder))
            with self.assertRaises(ValueError):prepare([{'role':'user','content':[{'type':'image_url','image_url':{'url':'https://example.org/secret.png'}}]}],Path(folder))

    def test_requires_auth_and_returns_actual_inference_usage(self):
        server=ThreadingHTTPServer(('127.0.0.1',0),Handler);server.token='fixture';server.binary='fixture';server.busy=threading.Lock()
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base='http://127.0.0.1:'+str(server.server_port)
        try:
            with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(base+'/health')
            self.assertEqual(error.exception.code,401)
            req=urllib.request.Request(base+'/v1/chat/completions',data=json.dumps({'messages':[]}).encode(),headers={'Authorization':'Bearer fixture'})
            with patch('tools.local_codex_bridge.infer',return_value=({'complete':False},{'prompt_tokens':5,'completion_tokens':3})):
                with urllib.request.urlopen(req) as response:body=json.load(response)
            self.assertEqual(body['usage']['prompt_tokens'],5)
            self.assertFalse(json.loads(body['choices'][0]['message']['content'])['complete'])
        finally:server.shutdown();server.server_close();thread.join()
