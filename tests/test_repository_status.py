import tempfile
import unittest
from pathlib import Path
from controlplane.repository_status import metadata


class RepositoryStatusTests(unittest.TestCase):
    def test_loose_and_packed_references_and_remote(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); git = root / '.git'; (git/'refs/heads').mkdir(parents=True)
            (git/'HEAD').write_text('ref: refs/heads/main\n')
            (git/'refs/heads/main').write_text('a'*40+'\n')
            (git/'config').write_text('[remote "origin"]\n url = private-url\n')
            self.assertEqual(metadata(root)['head'], 'a'*40)
            self.assertTrue(metadata(root)['remote_configured'])
            (git/'refs/heads/main').unlink()
            (git/'packed-refs').write_text('b'*40+' refs/heads/main\n')
            self.assertEqual(metadata(root)['head'], 'b'*40)

    def test_detached_worktree_and_missing_metadata(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d); common = root/'common'; tree=root/'tree'; tree.mkdir();common.mkdir()
            (tree/'.git').write_text('gitdir: ../common\n')
            (common/'HEAD').write_text('c'*40)
            (common/'config').write_text('[core]\n bare = false\n')
            result=metadata(tree)
            self.assertIsNone(result['branch'])
            self.assertEqual(result['head'], 'c'*40)
            self.assertFalse(result['remote_configured'])
            self.assertIsNone(metadata(root/'missing')['head'])
