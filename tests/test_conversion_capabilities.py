import json
from pathlib import Path
import tempfile
import unittest
from controlplane.conversion_plan import build
from controlplane.resource_audit import audit
from controlplane.usage import record,aggregate,validate_pricing
from controlplane.store import Store
from controlplane.supply import preflight,SupplyError,inspect_source
import hashlib
import zipfile
from unittest.mock import patch
import io

class CapabilitiesTests(unittest.TestCase):
    def test_route_requires_mapping_not_title(self):
        inp={'url':'https://example.com/game','title':'minesweeper'}
        self.assertEqual(build(inp)['route'],'blocked')
        obs={'web_source':{'files':[{'file':'asset-map.json'}]}}
        self.assertEqual(build(inp,obs)['route'],'embedded-lib')
        self.assertEqual(build(inp,obs,continuation=True)['route'],'revision')
        self.assertEqual(build({'url':'#小程序://game/id'})['source_kind'],'wechat')
    def test_resource_missing_css_and_script_bindings(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<link rel="stylesheet" href="style.css"><script src="game.js"></script>')
            (root/'style.css').write_text('body{background:url("lost.png")}')
            (root/'game.js').write_text('const a="assets/fish.png";fetch(dynamic);')
            result=audit(root);self.assertEqual(len(result['missing']),2);self.assertEqual(result['dynamic_files'],['game.js'])
            with self.assertRaises(SupplyError):inspect_source(root)
    def test_usage_unknown_idempotent_price_snapshot(self):
        with tempfile.TemporaryDirectory() as t:
            s=Store(Path(t)/'db.sqlite');job={'id':'j','candidate_id':'c','round':2}
            prices=validate_pricing({'api:model':{'currency':'USD','input_per_million':2,'output_per_million':4}})
            with s.tx() as db:
                x=record(s,db,job,{'call_id':'a','provider':'api','model':'model','input_tokens':100,'output_tokens':50,'duration_seconds':1,'stage':'adapt'},prices)
                self.assertAlmostEqual(x['estimated_cost'],.0004)
                y=record(s,db,job,{'call_id':'a'},{});self.assertEqual(x,y)
                record(s,db,job,{'call_id':'b','provider':'codex','stage':'adapt','duration_seconds':2},{})
                rows=s.all(db,'ai_usage')
            for period in ('day','week','month'):
                totals=aggregate(rows,period);self.assertEqual(totals[0]['calls'],2);self.assertEqual(totals[0]['unknown_cost_calls'],1)
    def test_skill_fingerprint_gate(self):
        with self.assertRaises(SupplyError):preflight({'SUPPLY_APP_SECRET':'fixture'})
        self.assertTrue(preflight({'SUPPLY_APP_SECRET':'fixture','SUPPLY_EXPECTED_FINGERPRINT':hashlib.sha256(b'fixture').hexdigest()[:12]})['fingerprint_matches'])
    def test_content_hash_filename_rejected(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);(root/'index.html').write_text('<p>fixture</p>');(root/('a'*64+'.png')).write_bytes(b'img')
            with self.assertRaises(SupplyError) as e:inspect_source(root)
            self.assertEqual(e.exception.code,'TOOLCHAIN_UNSUPPORTED')
    def test_supply_preparation_preserves_original_and_rewrites_known_mapping(self):
        from controlplane.supply import build_archive
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)/'game';root.mkdir();(root/'assets').mkdir()
            body=b'image-fixture';sha=hashlib.sha256(body).hexdigest();name='assets/'+sha+'.png'
            (root/name).write_bytes(body)
            config='window.localAssetMap='+json.dumps({'fish':{'url':name}})+';'
            (root/'local-config.js').write_text(config)
            (root/'index.html').write_text('<script src="local-config.js"></script>')
            (root/'resource-downloads.json').write_text(json.dumps({'files':[{'path':name,'sha256':sha}]}))
            out=Path(t)/'game.zip';a=build_archive(root,out);b=build_archive(root,out)
            self.assertEqual(a,b);self.assertTrue((root/name).exists());self.assertEqual((root/'local-config.js').read_text(),config)
            with zipfile.ZipFile(out) as z:
                self.assertNotIn(name,z.namelist());self.assertIn('assets/fish-001.png',z.namelist())
                self.assertIn(b'assets/fish-001.png',z.read('local-config.js'))
    def test_api_usage_records_actual_tokens_without_prompt(self):
        from controlplane.ai_provider import complete,USAGE_SINK
        response=io.BytesIO(json.dumps({'choices':[{'message':{'content':'{"ok":true}'}}],'usage':{'prompt_tokens':20,'completion_tokens':7}}).encode())
        rows=[];token=USAGE_SINK.set(rows.append)
        try:
            with patch('urllib.request.build_opener') as opener:
                opener.return_value.open.return_value=response
                value,provider=complete([{'role':'user','content':'private prompt'}],{'backend':'api','base_url':'https://example.com','model':'fixture','api_key':'secret'})
            self.assertEqual(rows[0]['input_tokens'],20);self.assertEqual(provider,'api');self.assertTrue(value['ok'])
            self.assertNotIn('private prompt',json.dumps(rows));self.assertNotIn('secret',json.dumps(rows))
        finally:USAGE_SINK.reset(token)

if __name__=='__main__':unittest.main()
