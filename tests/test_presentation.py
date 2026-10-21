import unittest
from controlplane.presentation import preview_settings

class PresentationTest(unittest.TestCase):
    def test_default_fills_without_stretching(self):
        self.assertEqual({'fit':'cover','zoom':1,'position':'center'},preview_settings({}))
    def test_imported_margins_use_metadata(self):
        self.assertEqual(3.6,preview_settings({'preview':{'zoom':3.6}})['zoom'])
    def test_invalid_zoom_is_rejected(self):
        for value in (0,9,float('nan'),True,'3;bad'):
            with self.subTest(value=value),self.assertRaises(ValueError):preview_settings({'preview':{'zoom':value}})
