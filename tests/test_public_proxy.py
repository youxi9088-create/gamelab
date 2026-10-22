import unittest
from email.message import Message
from types import SimpleNamespace

from server import Handler


class PublicProxyOriginTests(unittest.TestCase):
    def allowed(self, origin, public_origin='https://47.110.232.68'):
        handler = object.__new__(Handler)
        handler.server = SimpleNamespace(server_port=8765, public_origin=public_origin)
        handler.headers = Message()
        if origin is not None:
            handler.headers['Origin'] = origin
        return handler.origin_allowed()

    def test_allows_explicit_public_origin(self):
        self.assertTrue(self.allowed('https://47.110.232.68'))

    def test_rejects_other_public_origins(self):
        self.assertFalse(self.allowed('https://attacker.example'))

    def test_keeps_loopback_origin_support(self):
        self.assertTrue(self.allowed('http://127.0.0.1:8765'))
        self.assertTrue(self.allowed('http://localhost:8765'))

    def test_allows_requests_without_origin(self):
        self.assertTrue(self.allowed(None))


if __name__ == '__main__':
    unittest.main()
