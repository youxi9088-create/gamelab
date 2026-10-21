import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import remote_assets as assets

class Budget:
    def remaining(self,n):return n

class AssetsTests(unittest.TestCase):
    def test_private_and_credential_urls_rejected(self):
        for url in ['http://example.com/a.png','https://user:pass@example.com/a.png']:
            with self.assertRaises(ValueError):assets.validate_url(url)
        with patch.object(assets.socket,'getaddrinfo',return_value=[(0,0,0,'',('127.0.0.1',443))]):
            with self.assertRaises(ValueError):assets.validate_url('https://example.com/a.png')
    def test_download_rewrites_and_hashes_without_losing_metadata(self):
        body=b'fixture-image';response=io.BytesIO(body);response.headers={'Content-Type':'image/png'}
        with tempfile.TemporaryDirectory() as t, patch.object(assets,'validate_url',return_value=assets.urllib.parse.urlsplit('https://example.com/a.png')), patch.object(assets.urllib.request,'build_opener') as opener:
            opener.return_value.open.return_value=response
            local,manifest=assets.download({'fish':{'url':'https://example.com/a.png','type':'image','description':'fish'}},Path(t)/'assets',Budget())
            self.assertEqual(manifest['files'][0]['sha256'],hashlib.sha256(body).hexdigest())
            self.assertEqual((Path(t)/local['fish']['url']).read_bytes(),body)
            self.assertEqual(local['fish']['description'],'fish')
            self.assertEqual(json.loads((Path(t)/'resource-downloads.json').read_text())['errors'],[])
    def test_bad_descriptor_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            with self.assertRaises(ValueError):assets.download({'a':None},Path(t),Budget())
    def test_redirect_rejected(self):
        with self.assertRaises(ValueError):assets.NoRedirect().redirect_request(None)

if __name__=='__main__':unittest.main()
