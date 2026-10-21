from controlplane.runtime import node_binary
import json
import struct
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE = node_binary()


class CacheUnpackTests(unittest.TestCase):
    def unpack(self, entries):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        offset = 18 + sum(12 + len(name.encode()) for name, _ in entries)
        table = b''
        for name, body in entries:
            name = name.encode()
            table += struct.pack('>I', len(name)) + name + struct.pack('>II', offset, len(body))
            offset += len(body)
        package = root/'game.wxapkg'
        package.write_bytes(b'\xbe'+b'\0'*12+b'\xed'+struct.pack('>I',len(entries))+table+b''.join(b for _,b in entries))
        source = root/'input.json'
        source.write_text(json.dumps([{'path':str(package),'appid':'wx0029cb0cdba90cd6'}]))
        out = root/'output'
        result = subprocess.run([str(NODE),str(ROOT/'executors/unpack-cache.cjs'),str(source),str(out)],capture_output=True)
        return result, out

    def test_preserves_all_binary_types_and_relative_paths(self):
        entries = [('/assets/model.bin',b'\0model'),('assets/font.ttf',b'font'),('engine.wasm',b'\0asm'),('sub/game.js',b'code')]
        result,out=self.unpack(entries)
        self.assertEqual(result.returncode,0,result.stderr)
        manifest=json.loads((out/'manifest.json').read_text())
        self.assertTrue(manifest[0]['complete'])
        self.assertEqual(manifest[0]['extracted_file_count'],len(entries))
        for name,body in entries:
            self.assertEqual((out/'package-0'/name.lstrip('/')).read_bytes(),body)

    def test_rejects_traversal_and_windows_aliases(self):
        for name in ['../escape.js','C:/escape.js','a/CON','a/../b','a/b.']:
            result,out=self.unpack([(name,b'bad')])
            self.assertNotEqual(result.returncode,0)
            self.assertFalse((out/'manifest.json').exists())

    def test_rejects_case_collisions(self):
        result,out=self.unpack([('game.js',b'a'),('GAME.js',b'b')])
        self.assertNotEqual(result.returncode,0)
        self.assertFalse((out/'manifest.json').exists())
