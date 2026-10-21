import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
import subprocess
from controlplane.runtime import node_binary
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from source_fidelity import audit,ROOT

class SourceFidelityTests(unittest.TestCase):
    def test_ast_comparison_distinguishes_newlines_inside_strings(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);inp=root/'input.json';out=root/'output.json'
            inp.write_text(json.dumps({'original':'function label(){return `first\nsecond`;}','current':'function label(){return `first\n\nsecond`;}'}))
            p=subprocess.run([node_binary(),str(ROOT/'compare-source.mjs'),str(inp),str(out)],capture_output=True,text=True,timeout=30)
            self.assertEqual(p.returncode,0,p.stderr);report=json.loads(out.read_text())
            self.assertFalse(report['ast_identical']);self.assertEqual(report['changed_functions'],['label'])
    def test_render_comparison_detects_visual_change(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);source=root/'source';source.mkdir()
            html='<html><body><button id="start" onclick="this.textContent=\'Playing\'">Start</button></body></html>'
            (source/'index.html').write_text(html)
            ref=root/'reference.json';ref.write_text(json.dumps({'index.html':html}))
            plan=root/'plan.json';plan.write_text(json.dumps([{'name':'menu','actions':[]},{'name':'play','actions':[{'type':'click','selector':'#start'}]}]))
            def compare(out):
                p=subprocess.run([node_binary(),str(ROOT/'compare-render.cjs'),str(source),str(ref),str(out),str(plan)],capture_output=True,text=True,timeout=60)
                return p,json.loads((out/'render-comparison.json').read_text())
            proc,report=compare(root/'same');self.assertEqual(proc.returncode,0,str(report)+proc.stderr)
            (source/'index.html').write_text(html.replace('Start</button>','Changed</button>'))
            proc,report=compare(root/'different');self.assertEqual(proc.returncode,2);self.assertFalse(report['cases'][0]['pixel_identical'])

    def test_original_hashes_ast_and_asset_tampering(self):
        with tempfile.TemporaryDirectory(dir=ROOT/'runs') as t:
            root=Path(t);captured=root/'capture';captured.mkdir();source=root/'source';source.mkdir();(source/'evidence').mkdir()
            script='function play(){return `first\nsecond`;}';html='<html><head></head><body><script>'+script+'</script></body></html>'
            records=[]
            for name,text in {'index.html':html,'game-config.json':'{}','asset-map.json':'{}'}.items():
                (captured/name).write_text(text,'utf-8');records.append({'file':name,'sha256':hashlib.sha256((captured/name).read_bytes()).hexdigest()})
            (source/'evidence/source-manifest.json').write_text(json.dumps({'kind':'embedded-html','directory':str(captured),'files':records}))
            (source/'local-config.js').write_text('window.gameConfig={};window.localAssetMap={};')
            (source/'game-0.js').write_text('function play() {\nreturn `first\nsecond`;\n}')
            (source/'index.html').write_text(html.replace('<script>'+script+'</script>','<script src="game-0.js"></script>').replace('</head>','<script src="local-config.js"></script><script src="local-host.js"></script></head>'))
            (source/'asset.bin').write_bytes(b'asset')
            (source/'evidence/resource-downloads.json').write_text(json.dumps({'files':[{'path':'asset.bin','sha256':hashlib.sha256(b'asset').hexdigest()}]}))
            report=audit(source,root/'out')
            self.assertTrue(report['scripts'][0]['ast']['ast_identical']);self.assertTrue(report['all_asset_hashes_match']);self.assertTrue(report['html_identical_except_host_and_font_adaptation'])
            expanded=script.replace('\n','\r\r\n');(source/'game-0.js').write_bytes(expanded.encode())
            report=audit(source,root/'out')
            self.assertEqual(report['scripts'][0]['ast']['newline_repair']['restored_original_functions'],['play'])
            repairs=json.loads((root/'out/newline-repairs.json').read_text())
            self.assertEqual(repairs['game-0.js'],script.replace('\n','\r\n'))
            self.assertEqual((source/'game-0.js').read_bytes(),expanded.encode())
            (source/'game-0.js').write_text('function play(){return 2;}');(source/'asset.bin').write_bytes(b'wrong')
            report=audit(source,root/'out')
            self.assertEqual(report['scripts'][0]['ast']['changed_functions'],['play']);self.assertFalse(report['all_asset_hashes_match'])
            (captured/'index.html').write_text('tampered')
            with self.assertRaisesRegex(ValueError,'hash mismatch'):audit(source,root/'out')
