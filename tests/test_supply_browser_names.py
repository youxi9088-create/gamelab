import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from controlplane.supply_resources import prepare, validated_aliases
from controlplane.supply import inspect_source, SupplyError


class BrowserNames(unittest.TestCase):
    def test_declared_font_is_real_download_in_delivery_copy(self):
        from unittest.mock import patch, MagicMock
        from controlplane.supply_fonts import localize
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);css=root/'fonts.css'
            css.write_text('@font-face{src:url("https://example.org/font.ttf")}')
            response=MagicMock();response.__enter__.return_value.read.return_value=b'\x00\x01\x00\x00'+b'fontbytes'*4
            opener=MagicMock();opener.open.return_value=response
            with patch('controlplane.supply_fonts.public_url') as guard, patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
                rows=localize(root)
            guard.assert_called_once_with('https://example.org/font.ttf')
            self.assertEqual(len(rows),1)
            self.assertNotIn('https:',css.read_text())
            self.assertEqual(hashlib.sha256((root/rows[0]['path']).read_bytes()).hexdigest(),rows[0]['sha256'])

    def test_modules_json_css_and_immutable_data(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            (root/'evidence').mkdir()
            (root/'evidence/acquisition.json').write_text('{}')
            (root/'vendor').mkdir()
            (root/'_runtime_resources').mkdir()
            (root/'vendor/lib.12345678.js').write_text('export const number=42;')
            (root/'vendor/main.87654321.js').write_text("import {number} from './lib.12345678.js';window.fixtureNumber=number;const text='"+'x'*40000+"';const malformed='//[invalid';")
            raw=b'{"words":["apple"]}'
            (root/'_runtime_resources/abcdef123456.json').write_bytes(raw)
            (root/'index.html').write_text('<script type="module" src="vendor/main.87654321.js"></script><script type="module">import {number} from "./vendor/lib.12345678.js";const data=await (await fetch("./_runtime_resources/abcdef123456.json")).json();window.fixturePassed=number===42&&data.words[0]==="apple";</script>')
            prepare(root)
            aliases=validated_aliases(root)
            self.assertEqual(len(aliases),3)
            self.assertEqual((root/aliases['_runtime_resources/abcdef123456.json']).read_bytes(),raw)
            main=(root/aliases['vendor/main.87654321.js']).read_text()
            self.assertIn("from './module-item-",main)
            self.assertNotIn('lib.12345678.js',main)
            inspect_source(root)
            import functools, http.server, threading, subprocess
            from controlplane.runtime import node_binary
            handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(root))
            server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                result=subprocess.run([str(node_binary()),'tools/check_supply_resources.cjs',
                    f'http://127.0.0.1:{server.server_port}/'],capture_output=True,text=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
            finally:
                server.shutdown();server.server_close()
            (root/aliases['_runtime_resources/abcdef123456.json']).write_bytes(b'{}')
            with self.assertRaises(ValueError):validated_aliases(root)

    def test_engine_export_remains_unsupported(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'evidence').mkdir()
            (root/'evidence/acquisition.json').write_text('{}')
            (root/'index.html').write_text('<html></html>')
            (root/'game.wasm').write_bytes(b'\x00asm')
            prepare(root)
            with self.assertRaises(SupplyError) as error:inspect_source(root)
            self.assertEqual(error.exception.code,'TOOLCHAIN_UNSUPPORTED')

    def test_unknown_package_is_not_renamed(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'index.html').write_text('<html></html>')
            original=root/'unknown.12345678.js';original.write_text('const a=1;')
            self.assertEqual(prepare(root)['renamed'],0)
            self.assertTrue(original.exists())


if __name__=='__main__':unittest.main()
