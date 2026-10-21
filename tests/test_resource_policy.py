import hashlib
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from resource_policy import original_resources, merge_original
from worker import Blocked, reconstruct


class ResourcePolicyTests(unittest.TestCase):
    def test_missing_cache_blocks_before_ai(self):
        with tempfile.TemporaryDirectory() as directory, patch('worker.chat') as chat:
            with self.assertRaises(Blocked):
                reconstruct({'require_original_resources':True,'observations':{'cache_checked':True}},Path(directory))
            chat.assert_not_called()

    def test_unsupported_cache_blocks(self):
        with self.assertRaisesRegex(Blocked,'资源解析待适配'):
            original_resources({'cache_checked':True,'cache_package_count':1,'resource_directory':'.'})

    def test_resource_bytes_preserved_and_reference_required(self):
        with tempfile.TemporaryDirectory() as directory:
            data=b'original-image-fixture'
            Path(directory,'fish.png').write_bytes(data)
            observation={'cache_checked':True,'cache_package_count':1,'resource_directory':directory,
                         'cache_manifest':[{'files':[{'file':'fish.png','original':'textures/fish.png','sha256':hashlib.sha256(data).hexdigest()}]}]}
            originals,catalog=original_resources(observation)
            name=catalog[0]['path']
            merged=merge_original({'index.html':f'<img src="{name}">'},originals)
            self.assertEqual(merged[name],originals[name])
            with self.assertRaises(Blocked):merge_original({'index.html':'<canvas></canvas>'},originals)
            with self.assertRaises(Blocked):merge_original({'index.html':name,name:'replacement'},originals)
            Path(directory,'fish.png').write_bytes(b'changed')
            with self.assertRaisesRegex(Blocked,'已变化'):original_resources(observation)

    def test_invalid_generation_blocks(self):
        with self.assertRaises(Blocked):merge_original(None,{})
