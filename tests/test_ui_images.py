import hashlib
import io
from pathlib import Path
import tempfile
import unittest
from controlplane.ui_images import thumbnail


class ThumbnailTests(unittest.TestCase):
    def test_thumbnail_is_small_cached_and_does_not_change_original(self):
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            original = root/'source.png'
            Image.new('RGB', (2000, 1200), 'orange').save(original)
            digest = hashlib.sha256(original.read_bytes()).hexdigest()
            data, mime, key = thumbnail(original, 480, root/'cache')
            self.assertEqual(mime, 'image/webp')
            with Image.open(io.BytesIO(data)) as image:
                self.assertEqual(image.size, (480, 288))
            self.assertEqual(hashlib.sha256(original.read_bytes()).hexdigest(), digest)
            self.assertEqual(thumbnail(original, 480, root/'cache'), (data, mime, key))
            self.assertEqual(len(list((root/'cache').glob('*.webp'))), 1)

    def test_changed_source_gets_new_thumbnail(self):
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            original = root/'source.png'
            Image.new('RGB', (100, 100), 'red').save(original)
            first = thumbnail(original, 480, root/'cache')
            Image.new('RGB', (100, 100), 'blue').save(original)
            second = thumbnail(original, 480, root/'cache')
            self.assertNotEqual(first[2], second[2])
            self.assertNotEqual(first[0], second[0])
