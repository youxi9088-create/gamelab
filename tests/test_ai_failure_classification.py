import io
import json
import unittest
import urllib.error
from controlplane.ai_provider import http_failure_kind


class AIFailureClassificationTests(unittest.TestCase):
    def test_structured_categories_do_not_expose_provider_details(self):
        for message,expected in [('maximum context length exceeded token=private-secret','context_limit'),
                                 ('Too many images private-secret','image_limit'),
                                 ('Invalid image private-secret','invalid_image'),
                                 ('Unsupported parameter private-secret','unsupported_input'),
                                 ('Provider private-secret','request_rejected')]:
            e=urllib.error.HTTPError('https://example.com',400,'bad',{},io.BytesIO(json.dumps({'error':{'message':message}}).encode()))
            result=http_failure_kind(e)
            self.assertEqual(result,expected)
            self.assertNotIn('private-secret',result)
            e.close()
