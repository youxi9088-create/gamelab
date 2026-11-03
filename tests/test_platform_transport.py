import errno
import io
import unittest
import urllib.error
import urllib.request
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from unittest.mock import patch,MagicMock
from executors.platform_transport import open_request


class PlatformTransportTests(unittest.TestCase):
    def test_refused_connection_retries_identical_post_without_new_event_or_payload(self):
        request=urllib.request.Request('http://127.0.0.1:8765/api/v1/artifacts',data=b'{"event_id":"same"}')
        opener=MagicMock(); response=io.BytesIO(b'{}')
        opener.open.side_effect=[urllib.error.URLError(ConnectionRefusedError(errno.ECONNREFUSED,'refused')),response]
        with patch('executors.platform_transport.urllib.request.build_opener',return_value=opener),patch('executors.platform_transport.time.sleep') as sleep:
            self.assertIs(open_request(request),response)
            self.assertEqual([c.args[0] for c in opener.open.call_args_list],[request,request])
            sleep.assert_called_once_with(.5)

    def test_timeout_reset_and_http_denial_are_not_retried(self):
        for error in [TimeoutError('ambiguous'),urllib.error.URLError(ConnectionResetError('ambiguous')),
                      urllib.error.HTTPError('http://127.0.0.1',403,'forbidden',{},None)]:
            opener=MagicMock();opener.open.side_effect=error
            with patch('executors.platform_transport.urllib.request.build_opener',return_value=opener),patch('executors.platform_transport.time.sleep') as sleep:
                with self.assertRaises(type(error)):
                    open_request(urllib.request.Request('http://127.0.0.1:8765/api/v1/jobs/claim',data=b'{}'))
                self.assertEqual(opener.open.call_count,1);sleep.assert_not_called()

    def test_exhaustion_is_bounded_and_error_does_not_expose_credentials_or_query(self):
        opener=MagicMock();opener.open.side_effect=urllib.error.URLError(ConnectionRefusedError(errno.ECONNREFUSED,'refused'))
        request=urllib.request.Request('http://user:private@127.0.0.1:8765/api/v1/events?token=hidden',data=b'{}',headers={'Authorization':'Bearer secret'})
        with patch('executors.platform_transport.urllib.request.build_opener',return_value=opener),patch('executors.platform_transport.time.sleep'):
            with self.assertRaises(urllib.error.URLError) as error:open_request(request)
        self.assertEqual(opener.open.call_count,9)
        self.assertNotIn('private',str(error.exception));self.assertNotIn('hidden',str(error.exception));self.assertNotIn('secret',str(error.exception))
        self.assertTrue(error.exception.control_plane_transport)

    def test_local_service_recovers_after_fifteen_second_restart_window(self):
        request=urllib.request.Request('http://127.0.0.1:8765/events',data=b'same')
        opener=MagicMock();response=io.BytesIO(b'{}')
        refused=urllib.error.URLError(ConnectionRefusedError(errno.ECONNREFUSED,'refused'))
        opener.open.side_effect=[refused]*6+[response]
        with patch('executors.platform_transport.urllib.request.build_opener',return_value=opener),patch('executors.platform_transport.time.sleep') as sleep:
            self.assertIs(open_request(request),response)
        self.assertGreater(sum(c.args[0] for c in sleep.call_args_list),15)
        self.assertTrue(all(c.args[0] is request for c in opener.open.call_args_list))

    def test_loopback_bypasses_proxy_but_remote_keeps_existing_proxy_policy(self):
        opener=MagicMock()
        with patch('executors.platform_transport.urllib.request.build_opener',return_value=opener) as build,patch('executors.platform_transport.urllib.request.urlopen') as external:
            open_request(urllib.request.Request('http://localhost:8765/health'))
            self.assertEqual(build.call_args.args[0].proxies,{})
            external.assert_not_called()
            open_request(urllib.request.Request('https://platform.example/health'))
            external.assert_called_once()

    def test_real_local_request_recovers_after_listener_starts_without_sending_to_proxy(self):
        received=[]
        class Handler(BaseHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_POST(self):
                received.append(self.rfile.read(int(self.headers['Content-Length'])))
                self.send_response(200);self.end_headers();self.wfile.write(b'{"ok":true}')
        server=HTTPServer(('127.0.0.1',0),Handler,bind_and_activate=False)
        server.server_bind();server.timeout=5
        def delayed_listener():
            time.sleep(.2);server.server_activate();server.handle_request()
        thread=threading.Thread(target=delayed_listener,daemon=True);thread.start()
        try:
            req=urllib.request.Request(f'http://127.0.0.1:{server.server_address[1]}/events',data=b'one-observation')
            with patch.dict('os.environ',{'HTTP_PROXY':'http://127.0.0.1:1','NO_PROXY':''}):
                with open_request(req,timeout=3) as response:self.assertEqual(response.status,200)
            self.assertEqual(received,[b'one-observation'])
        finally:
            thread.join(6);server.server_close()
