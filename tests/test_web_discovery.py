"""Actual browser discovery against an authored, delayed iframe fixture only."""
import functools
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
from controlplane.runtime import node_binary


class WebDiscoveryTests(unittest.TestCase):
    def test_delayed_game_frame_is_observed(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);site=root/'site';site.mkdir()
            (site/'index.html').write_text('<title>Authored hosting fixture</title><a href="play.html">开始游戏</a><button id="begin">开始游戏</button><iframe data-url="embedded.html" style="display:none"></iframe><script>document.querySelector("#begin").onclick=()=>{document.body.insertAdjacentHTML("beforeend","<canvas width=600 height=400></canvas>")};setTimeout(()=>{const f=document.createElement("iframe");f.src="game.html";f.width=640;f.height=480;document.body.appendChild(f)},3500)</script>','utf-8')
            (site/'game.html').write_text('<canvas width="600" height="400"></canvas>','utf-8')
            (site/'embedded.html').write_text('<canvas width="640" height="480"></canvas>','utf-8')
            class Quiet(SimpleHTTPRequestHandler):
                def log_message(self,*args):pass
            server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(site)))
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                result=subprocess.run([node_binary(),str(ROOT/'executors/acquire.cjs'),f'http://127.0.0.1:{server.server_port}/',str(root/'out')],capture_output=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
                report=json.loads((root/'out/observation.json').read_text('utf-8'))
                self.assertTrue(any(e['url'].endswith('/game.html') for e in report['web_discovery']['entries']))
                self.assertTrue(any(e['url'].endswith('/play.html') and e['label']=='开始游戏' for e in report['web_discovery']['launch_links']))
                self.assertTrue(report['web_discovery']['launch_action']['clicked'])
                self.assertTrue(any(e['final_url'].endswith('/embedded.html') and e['canvas_count']>0 for e in report['web_discovery']['iframe_probes']))
                self.assertEqual(report['appids'],[])
            finally:server.shutdown();server.server_close()

if __name__=='__main__':unittest.main()
