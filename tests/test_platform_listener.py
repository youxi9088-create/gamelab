import socket
import unittest
from http.server import BaseHTTPRequestHandler
from server import PlatformHTTPServer


class ListenerTests(unittest.TestCase):
    def test_burst_connections_queue_before_accept_loop(self):
        server=PlatformHTTPServer(('127.0.0.1',0),BaseHTTPRequestHandler)
        clients=[]
        try:
            # Simulate a brief busy accept thread, without fabricating API success.
            for _ in range(32):
                clients.append(socket.create_connection(server.server_address,timeout=1))
            self.assertEqual(len(clients),32)
        finally:
            for client in clients:client.close()
            server.server_close()
