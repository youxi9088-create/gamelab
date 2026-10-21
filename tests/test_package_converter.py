import hashlib
import io
import json
import sys
import tempfile
import threading
import unittest
import zipfile
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from package_converter import convert,extract_result,input_zip
from worker import Budget


class PackageConverterTest(unittest.TestCase):
    def fixture(self,root):
        game=root/'cache'/'wx1111111111111111'/'1'/'main.wxapkg';game.parent.mkdir(parents=True);game.write_bytes(b'fixture')
        engine=root/'cache'/'wx2222222222222222'/'1'/'engine.wxapkg';engine.parent.mkdir(parents=True);engine.write_bytes(b'engine')
        unpack=root/'unpacked';unpack.mkdir()
        (unpack/'app-config.json').write_text(json.dumps({'gamePlugins':{'cocos':{'provider':'wx2222222222222222'}}}))
        return {'resource_directory':str(unpack),'resource_package_inventory':[{'appid':'wx1111111111111111','path':str(game)}]},[root/'cache']

    def test_matching_engine_and_no_ad_patch(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);observation,roots=self.fixture(root)
            with zipfile.ZipFile(io.BytesIO(input_zip(observation,roots))) as archive:
                self.assertFalse(json.loads(archive.read('manifest.json'))['ad_free'])
                self.assertIn('engine/0.wxapkg',archive.namelist())
            with self.assertRaisesRegex(ValueError,'插件包'):input_zip(observation,[root/'absent'])

    def test_zip_escape_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            buffer=io.BytesIO()
            with zipfile.ZipFile(buffer,'w') as archive:archive.writestr('../outside','bad')
            with self.assertRaises(ValueError):extract_result(buffer.getvalue(),Path(folder)/'out')

    def test_authenticated_async_download(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);observation,roots=self.fixture(root)
            buffer=io.BytesIO()
            with zipfile.ZipFile(buffer,'w') as archive:archive.writestr('index.html','<h1>Isolated fixture</h1>')
            payload=buffer.getvalue();jid='a'*32
            class Handler(BaseHTTPRequestHandler):
                def log_message(self,*args):pass
                def do_POST(self):
                    assert self.path=='/v1/jobs'
                    assert self.headers['Authorization']=='Bearer fixture-key'
                    with zipfile.ZipFile(io.BytesIO(self.rfile.read(int(self.headers['Content-Length'])))) as archive:assert 'manifest.json' in archive.namelist()
                    self.send_response(202);self.end_headers();self.wfile.write(json.dumps({'id':jid,'status':'queued'}).encode())
                def do_GET(self):
                    assert self.headers['Authorization']=='Bearer fixture-key'
                    self.send_response(200);self.end_headers()
                    self.wfile.write(payload if self.path.endswith('/download') else json.dumps({'id':jid,'status':'built_unverified','sha256':hashlib.sha256(payload).hexdigest()}).encode())
            server=ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                dest,record=convert({'base_url':f'http://127.0.0.1:{server.server_port}','api_key':'fixture-key'},observation,roots,root,Budget(15))
                self.assertTrue((dest/'index.html').is_file());self.assertEqual(jid,record['id'])
                self.assertNotIn('fixture-key',(root/'converter-job.json').read_text())
            finally:server.shutdown();server.server_close()
