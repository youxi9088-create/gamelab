"""Exercise the real worker routing with isolated acquisition/model adapters."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import worker


class Client:
    def __init__(self): self.calls=[]
    def post(self,path,body):
        self.calls.append((path,body))
        return {'artifact_id':'isolated-artifact'}


class WorkerEntryRecoveryTests(unittest.TestCase):
    def test_ai_probe_resumes_conversion_and_publishes_only_converter_result(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            config=root/'services.json'; config.write_text('{}')
            client=Client(); visits=[]
            def acquire(url,run,budget,observations=None,referer=None):
                visits.append(url)
                observation={'title':'Isolated game','source_kind':'web','web_discovery':{
                    'iframe_hints':[{'url':'https://example.org/game','evidence':'iframe-src'}],
                    'entries':[] if len(visits)==1 else [{'url':url,'canvas_count':1,'evidence':'rendered-canvas'}]}}
                directory=run/'acquisition';directory.mkdir(parents=True)
                (directory/'observation.json').write_text(json.dumps(observation))
                return observation
            def convert(inp,observation,run,budget,chat):
                self.assertEqual(observation['web_discovery']['entries'][0]['url'],'https://example.org/game')
                return {'dependencies':{},'runtime_verified':True,'fixture_only':True}
            with patch.object(worker,'ROOT',root), patch.dict('os.environ',{'REPLICA_SERVICE_CONFIG':str(config)}), \
                 patch('acquisition.acquire',side_effect=acquire), patch('discovered_web.convert',side_effect=convert), \
                 patch('worker.chat',return_value={'action':'probe_entry','arguments':{'url':'https://example.org/game'}}):
                worker.execute(client,{'id':'isolated-job','candidate_id':'isolated-game','lease_token':'isolated',
                    'stage':'rea','automatic':True,'input':{'url':'https://example.org/host'}})
            self.assertEqual(visits,['https://example.org/host','https://example.org/game'])
            completions=[b for p,b in client.calls if p.endswith('/complete')]
            self.assertEqual(len(completions),1)
            self.assertEqual(completions[0]['outcome'],'recovered')
            self.assertTrue(completions[0]['report']['fixture_only'])
            events=[b for p,b in client.calls if p.endswith('/events')]
            self.assertTrue(any(b.get('node')=='repair' and b.get('node_status')=='succeeded' for b in events))
