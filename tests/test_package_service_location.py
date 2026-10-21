import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from controlplane.package_service import service_directory


class PackageServiceLocationTests(unittest.TestCase):
    def test_clean_checkout_and_existing_install(self):
        with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ,{},clear=True):
            root=Path(tmp)/'platform';root.mkdir()
            self.assertEqual(service_directory(root),root/'services'/'wechat-web-service')
            old=root.parent/'wechat-web-service';old.mkdir();(old/'server.py').touch()
            self.assertEqual(service_directory(root),old)
            with patch.dict(os.environ,{'REPLICA_PACKAGE_SERVICE_DIR':str(root/'custom')}):
                self.assertEqual(service_directory(root),root/'custom')
