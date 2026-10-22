import json
import tempfile
import unittest
from pathlib import Path
from controlplane.runtime_viewport import prepare, validate


class ViewportTests(unittest.TestCase):
    def source(self, root, dimensions=((640, 1136),)):
        (root/'assets').mkdir()
        nodes=[{'__type__':'cc.Canvas','_designResolution':{'width':w,'height':h},
                '_fitWidth':True,'_fitHeight':False} for w,h in dimensions]
        (root/'assets/scene.json').write_text(json.dumps(nodes),'utf-8')
        (root/'index.html').write_text('<canvas id="GameCanvas"></canvas><script src="engine.js"></script>','utf-8')

    def test_installs_before_engine_and_is_idempotent(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);self.source(root)
            original=(root/'assets/scene.json').read_bytes()
            config,changes=prepare(root,'cocos2')
            self.assertEqual((config['width'],config['height']),(640,1136))
            self.assertLess(changes['index.html'].index('ReplicaRuntimeViewport.mount'),changes['index.html'].index('engine.js'))
            self.assertEqual((root/'assets/scene.json').read_bytes(),original)
            self.assertEqual(prepare(root,'cocos2'),(config,{}))

    def test_unknown_conflicting_and_landscape_are_not_guessed(self):
        for dims,engine in [(((640,1136),(750,1334)),'cocos2'),(((1136,640),),'cocos2'),(((640,1136),),'ruffle')]:
            with tempfile.TemporaryDirectory() as temp:
                root=Path(temp);self.source(root,dims)
                self.assertEqual(prepare(root,engine),(None,{}))

    def test_invalid_metadata_rejected(self):
        for width in [True,0,9000,float('nan')]:
            with self.assertRaises(ValueError): validate({'fit':'contain','width':width,'height':1136})
