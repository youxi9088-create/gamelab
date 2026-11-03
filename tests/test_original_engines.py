import json
import tempfile
import unittest
from pathlib import Path
from controlplane.original_engines import infer
from controlplane.acquisition_evidence import engine_by_candidate, reset


class OriginalEngineTests(unittest.TestCase):
    def test_original_script_urls_identify_framework_not_capture_adapter(self):
        original={'engine':'browser','files':[{'script':True,'url':'https://esm.sh/three@0.185.1/es2022/three.mjs'}]}
        self.assertIn('three',infer(original))
        self.assertIn('phaser',infer({'files':[{'script':True,'url':'https://cdn.example/phaser.min.js'}]}))
        self.assertFalse(infer({'files':[{'script':False,'url':'https://images.example/three.js.png'}]}))

    def test_script_context_ignores_promotional_prose_and_comments(self):
        self.assertFalse(infer({},'<p>new THREE.Scene()</p><script>// new Phaser.Game()</script>'))
        self.assertEqual(infer({},'<script>const ctx=canvas.getContext("2d");</script>'),{'canvas2d'})
        self.assertEqual(infer({},'<script>const s=new THREE.Scene();c.getContext("2d");</script>'),{'three'})

    def test_reimplementation_is_never_used_as_source_evidence(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder); run=root/'one';run.mkdir();(run/'converted').mkdir();(run/'web-original').mkdir()
            (run/'job-binding.json').write_text(json.dumps({'job_id':'j'}))
            (run/'web-acquisition.json').write_text(json.dumps({'engine':'browser'}))
            (run/'converted/index.html').write_text('<script>new THREE.Scene()</script>')
            reset();jobs=[{'id':'j','candidate_id':'c'}]
            self.assertEqual(engine_by_candidate(root,jobs)['c'],'通用 Web 运行包')
            (run/'web-original/source-entry.html').write_text('<script>new Phaser.Game()</script>')
            reset();self.assertEqual(engine_by_candidate(root,jobs)['c'],'Phaser')
        reset()
