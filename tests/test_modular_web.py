import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import modular_web as m


class ModularWebTests(unittest.TestCase):
    def test_unique_visible_host(self):
        o={'web_discovery':{'iframe_hints':[{'url':'https://g-example.games.remix.gg/versions/a','width':900,'height':600,'evidence':'iframe-src'}]}}
        self.assertTrue(m.candidate(o))
        from controlplane.conversion_plan import build
        self.assertEqual(build({'url':'https://example.org'},o)['route'],'discovered-web')
        o['web_discovery']['iframe_hints'].append({'url':'https://g-other.games.remix.gg/versions/b','width':900,'height':600,'evidence':'iframe-src'})
        self.assertIsNone(m.candidate(o))

    def test_capture_preserves_source_and_localizes_graph(self):
        url='https://g-example.games.remix.gg/versions/a'
        html='<html><script src="https://cdn.jsdelivr.net/npm/@remix-gg/sdk@0.16.0/dist/index.min.js"></script><script type="importmap">'+json.dumps({'imports':{'@remix-gg/three':'https://esm.sh/runtime','@remix-gg/three/three':'https://esm.sh/engine'}})+'</script><script type="module">import {game} from "@remix-gg/three"; game();</script></html>'
        data={url:html.encode(),'https://esm.sh/runtime':'const label=`😀 from "srgb-linear"`; import "/engine"; export const game=()=>{};'.encode(), 'https://esm.sh/engine':b'export const Engine=1;'}
        class Client:
            def open(self,req,timeout):return io.BytesIO(data[req.full_url])
        class Budget:
            def remaining(self,t):return t
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()):
            root=Path(tmp);r=m.capture(url,'https://example.org',root,Budget())
            self.assertEqual(r['engine'],'three')
            self.assertEqual((root/'web-original/index.html').read_text(),html)
            output=(root/'converted/index.html').read_text()
            self.assertIn('local-host.js',output)
            self.assertNotIn('https://esm.sh/',output)
            module=next((root/'converted/vendor').glob('*runtime*')).read_text()
            self.assertIn('./002-engine.js',module)
            self.assertIn('from "srgb-linear"',module)
            self.assertIn('game();',output)


if __name__=='__main__':unittest.main()
