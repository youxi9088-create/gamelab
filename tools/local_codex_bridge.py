"""Authenticated loopback adapter for a locally signed-in Codex CLI.

Expose only via an SSH reverse tunnel. No credentials or prompts are logged.
The cloud worker still owns browser actions, versions, and acceptance state.
"""
import argparse
import base64
import hmac
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from controlplane.ai_provider import codex_usage


from controlplane.codex_backend import prepare, infer


class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):pass
    def send_json(self,status,value):
        raw=json.dumps(value,ensure_ascii=False).encode('utf-8')
        self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(raw)));self.end_headers()
        try:self.wfile.write(raw)
        except (BrokenPipeError,ConnectionResetError):pass
    def authorized(self):
        return hmac.compare_digest(self.headers.get('Authorization',''),'Bearer '+self.server.token)
    def do_GET(self):
        if not self.authorized():return self.send_json(401,{'error':{'code':'unauthorized'}})
        if self.path!='/health':return self.send_json(404,{'error':{'code':'not_found'}})
        self.send_json(200,{'ok':True,'backend':'local-codex','busy':self.server.busy.locked()})
    def do_POST(self):
        if not self.authorized():return self.send_json(401,{'error':{'code':'unauthorized'}})
        if self.path!='/v1/chat/completions':return self.send_json(404,{'error':{'code':'not_found'}})
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:return self.send_json(400,{'error':{'code':'invalid_length'}})
        if not 0<length<=12_000_000:return self.send_json(413,{'error':{'code':'body_limit'}})
        # A following request can arrive before the previous handler flushes its
        # log and releases the lock. Briefly queue instead of reporting false 429.
        if not self.server.busy.acquire(timeout=10):return self.send_json(429,{'error':{'code':'local_codex_busy'}})
        started=time.monotonic();status='failed'
        try:
            body=json.loads(self.rfile.read(length));value,usage=infer(self.server.binary,body['messages'])
            status='succeeded'
            self.send_json(200,{'object':'chat.completion','model':'local-codex','choices':[{'index':0,'message':{'role':'assistant','content':json.dumps(value,ensure_ascii=False)},'finish_reason':'stop'}],'usage':usage})
        except (ValueError,KeyError,TypeError):self.send_json(502,{'error':{'code':'invalid_codex_output'}})
        except Exception:self.send_json(502,{'error':{'code':'local_codex_failed'}})
        finally:
            print(json.dumps({'status':status,'duration_seconds':round(time.monotonic()-started,2)}),flush=True)
            self.server.busy.release()


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8877);parser.add_argument('--token-file',required=True);args=parser.parse_args()
    token=Path(args.token_file).read_text('utf-8').strip()
    if len(token)<32:raise ValueError('A strong local bridge token is required')
    binary=shutil.which('codex')
    if not binary:raise RuntimeError('Codex CLI is required')
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);server.token=token;server.binary=binary;server.busy=threading.Lock()
    print(json.dumps({'listening':'127.0.0.1:'+str(args.port),'backend':'local-codex'}),flush=True)
    server.serve_forever()


if __name__=='__main__':main()
