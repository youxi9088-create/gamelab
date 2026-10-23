import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
import zipfile

from controlplane.supply_delivery import resolve_source, delivery_source, write_review_archive, evidence_steps
from controlplane.supply import inspect_source, SupplyError
from tools.prepare_supply_deliveries import prepare


class SupplyDeliveryTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name);self.source=self.root/'source';self.source.mkdir()
        (self.source/'index.html').write_text('<html><button id="start">Start</button></html>','utf-8')
        self.candidate={'id':'game-fixture','title':'自有供货夹具'}
        self.version={'id':'v-fixture','candidate_id':'game-fixture','artifact_id':'a-fixture','status':'approved',
                      'report':{'acceptance_actions':[{'type':'click','selector':'#start'}]}}
        self.metadata={'license_declaration':{'owner':'Fixture owner','distributable':'yes','note':'Self-authored fixture'}}

    def test_artifact_fallback_and_traversal_rejected(self):
        artifacts=self.root/'artifacts';artifacts.mkdir();target=artifacts/'a-fixture';target.mkdir()
        (target/'index.html').write_text('<html></html>','utf-8')
        repo=SimpleNamespace(root=self.root/'library',artifacts=artifacts)
        self.assertEqual(resolve_source(repo,self.version),target)
        with self.assertRaises(ValueError):resolve_source(repo,{**self.version,'source_directory':'../source'})
        with self.assertRaises(ValueError):resolve_source(repo,{**self.version,'artifact_id':'../source'})

    def test_supplement_keeps_original_and_seals_license(self):
        (self.source/'start.cmd').write_text('echo fixture','utf-8')
        before={p.name:p.read_bytes() for p in self.source.iterdir()}
        with delivery_source(self.source,self.candidate,self.version,self.metadata,{'dimension':'2D','controls':'点击开始'}) as (target,info):
            self.assertFalse((target/'start.cmd').exists())
            self.assertEqual(info['acceptance_steps'][0]['target'],'#start')
            self.assertEqual(json.loads((target/'supply-delivery/license.json').read_text())['owner'],'Fixture owner')
            self.assertIn('点击开始',(target/'supply-delivery/GAME_SPECIFICATION.md').read_text('utf-8'))
            inspect_source(target)
            archive=write_review_archive(target,self.root/'game.zip')
            self.assertTrue(archive['downstream_size_limits_pass'])
            with zipfile.ZipFile(self.root/'game.zip') as z:self.assertIn('supply-delivery/manifest.json',z.namelist())
        self.assertEqual(before,{p.name:p.read_bytes() for p in self.source.iterdir()})

    def test_runtime_review_does_not_claim_template_support(self):
        (self.source/'game.wasm').write_bytes(b'fixture-wasm')
        with delivery_source(self.source,self.candidate,self.version,self.metadata) as (target,_):
            with self.assertRaises(SupplyError):inspect_source(target)
            result=write_review_archive(target,self.root/'runtime.zip')
            self.assertGreater(result['archive_bytes'],0)
            self.assertNotIn('template_approved',result)

    def test_wrapper_uses_real_entry_and_no_coordinate_guess(self):
        (self.source/'index.html').write_text('<a href="http://127.0.0.1:9999/">Open</a>','utf-8')
        (self.source/'web-runtime.zip').write_bytes(b'fixture-placeholder')
        runtime=self.source/'runtime';runtime.mkdir();(runtime/'index.html').write_text('<canvas></canvas>','utf-8')
        with delivery_source(self.source,self.candidate,self.version,self.metadata) as (target,info):
            self.assertEqual((target/'index.html').read_text(),'<canvas></canvas>')
            self.assertFalse((target/'web-runtime.zip').exists())
            self.assertEqual(info['changes'][0]['kind'],'unwrap_runtime')
        steps,note=evidence_steps({'report':{'acceptance_actions':[{'type':'click','x':10,'y':20}]}})
        self.assertEqual(steps,[]);self.assertIn('坐标',note)

    def test_referenced_launcher_is_not_silently_removed(self):
        (self.source/'index.html').write_text('<a href="start.cmd">launch</a>','utf-8')
        (self.source/'start.cmd').write_text('echo fixture','utf-8')
        with self.assertRaises(ValueError):
            with delivery_source(self.source,self.candidate,self.version,self.metadata):pass

    def test_registration_does_not_approve_or_submit(self):
        import sqlite3
        data=self.root/'data';data.mkdir();artifacts=data/'artifacts';artifacts.mkdir()
        import shutil
        shutil.copytree(self.source,artifacts/'a-fixture')
        version={**self.version,'status':'draft'}
        with sqlite3.connect(data/'platform.sqlite3') as db:
            db.execute('create table records(kind text,id text,data text,primary key(kind,id))')
            for kind,row in [('versions',version),('candidates',self.candidate)]:
                db.execute('insert into records values(?,?,?)',(kind,row['id'],json.dumps(row)))
        db.close()
        result=prepare(data,self.root/'library',self.root/'delivery','Fixture owner','Self authored',True)
        self.assertFalse(result['submission_sent'])
        with sqlite3.connect(data/'platform.sqlite3') as db:
            self.assertEqual(json.loads(db.execute("select data from records where kind='versions'").fetchone()[0]),version)
            self.assertEqual(db.execute("select count(*) from records where kind='supply'").fetchone()[0],0)
            self.assertEqual(db.execute("select count(*) from records where kind='supply_deliveries'").fetchone()[0],1)
        db.close()
        self.assertFalse(list((self.root/'delivery').rglob('*.sqlite3')))

    def test_cocos_aliases_dedupe_and_actual_browser_requests(self):
        from controlplane.supply_resources import validated_aliases
        import base64, functools, http.server, threading, subprocess
        from controlplane.runtime import node_binary
        assets=self.source/'assets'/'resources';assets.mkdir(parents=True)
        (assets/'config.json').write_text(json.dumps({'uuids':[],'paths':{}}),'utf-8')
        (assets/'data.123456789abc.json').write_text('{"value":42}','utf-8')
        image=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=')
        (assets/'picture.123456789abc.png').write_bytes(image)
        duplicate=self.source/'subpackages'/'resources';duplicate.mkdir(parents=True)
        (duplicate/'picture.123456789abc.png').write_bytes(image)
        (assets/'module.123456789abc.js').write_text('window.fixtureScript=true;','utf-8')
        (self.source/'index.html').write_text('''<!doctype html><html><script src="assets/resources/module.123456789abc.js"></script><script>
        (async()=>{
          const a=await (await fetch('assets/resources/data.123456789abc.json')).json();
          const b=await new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open('GET','assets/resources/data.123456789abc.json');x.onload=()=>resolve(JSON.parse(x.responseText));x.onerror=reject;x.send();});
          await new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src='subpackages/resources/picture.123456789abc.png';document.body.append(image);});
          window.fixturePassed=a.value===42&&b.value===42&&window.fixtureScript;
        })();</script><body></body></html>''','utf-8')
        with delivery_source(self.source,self.candidate,self.version,self.metadata) as (target,info):
            mapping=validated_aliases(target)
            self.assertEqual(mapping['assets/resources/picture.123456789abc.png'],mapping['subpackages/resources/picture.123456789abc.png'])
            self.assertFalse((target/'subpackages/resources/picture.123456789abc.png').exists())
            self.assertTrue(info['runtime_recheck_required'])
            inspect_source(target)
            handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(target))
            server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                result=subprocess.run([str(node_binary()),'tools/check_supply_resources.cjs',f'http://127.0.0.1:{server.server_port}/'],capture_output=True,text=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
            finally:server.shutdown();server.server_close()
            (target/mapping['assets/resources/data.123456789abc.json']).write_text('{}','utf-8')
            with self.assertRaises(ValueError):validated_aliases(target)


if __name__=='__main__':unittest.main()
