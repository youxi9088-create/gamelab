import json,tempfile,unittest
from pathlib import Path
from unittest.mock import patch,MagicMock
from controlplane.store import Store
from controlplane.supply_metadata import metadata_for
from controlplane.supply_config import settings,readiness
from controlplane.resource_audit import audit
from controlplane.supply_delivery import delivery_source
from controlplane.supply_preparation import needs_package_recheck

class SupplyFlowRecoveryTests(unittest.TestCase):
 def test_extensionless_stylesheet_is_localized_and_delivered_with_css_type(self):
  from controlplane.supply_resources import validated_aliases
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'evidence').mkdir();(p/'remote').mkdir()
   (p/'index.html').write_text('<link rel="stylesheet" href="remote/css2"><button>Fixture</button>')
   (p/'remote/css2').write_text('@font-face{src:url("https://fonts.example/font.woff2")}button{color:rgb(4,5,6)}')
   (p/'evidence/acquisition.json').write_text(json.dumps({'files':[{'path':'remote/css2','contentType':'text/css'}]}))
   response=MagicMock();response.__enter__.return_value.read.return_value=b'wOF2'+b'font-bytes'*4
   opener=MagicMock();opener.open.return_value=response
   with patch('controlplane.supply_fonts.public_url'),patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
    with delivery_source(p,{'id':'c','title':'Fixture'},{'id':'v','report':{}},{}) as (target,info):
     mapping=validated_aliases(target);name=mapping['remote/css2'];self.assertTrue(name.endswith('.css'))
     self.assertNotIn('https://',(target/name).read_text());self.assertFalse(audit(target,mapping)['external'])
     self.assertIn(name,(target/'index.html').read_text());self.assertTrue(info['runtime_recheck_required'])
   self.assertIn('https://',(p/'remote/css2').read_text())

 def test_audio_constructor_external_request_is_not_missed(self):
  from controlplane.resource_audit import external_request_findings
  with tempfile.TemporaryDirectory() as t:
   p=Path(t)/'game.js';p.write_text("const track=new Audio('https://media.example/music.mp3'); // new Audio('https://comment.example/no.mp3')")
   rows=external_request_findings([(p,'game.js')]);self.assertEqual([r['host'] for r in rows],['media.example'])
 def test_public_font_redirect_is_validated_at_each_hop(self):
  import urllib.error
  from controlplane.supply_fonts import localize
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'style.css').write_text('@font-face{src:url("https://source.example/font.woff")}')
   response=MagicMock();response.__enter__.return_value.read.return_value=b'wOFF'+b'actual-font'*4
   opener=MagicMock();opener.open.side_effect=[urllib.error.HTTPError('https://source.example/font.woff',307,'redirect',{'Location':'https://cdn.example/font.woff'},None),response]
   with patch('controlplane.supply_fonts.public_url') as public,patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
    rows=localize(p)
   self.assertEqual([c.args[0] for c in public.call_args_list],['https://source.example/font.woff','https://cdn.example/font.woff'])
   self.assertEqual(rows[0]['resolved_url'],'https://cdn.example/font.woff');self.assertFalse(audit(p)['missing'])
 def test_font_redirect_cannot_downgrade_or_loop_forever(self):
  import urllib.error
  from controlplane.supply_fonts import font_bytes
  opener=MagicMock();opener.open.side_effect=lambda *a,**k:(_ for _ in ()).throw(urllib.error.HTTPError('https://source.example/font.woff',307,'redirect',{'Location':'http://127.0.0.1/font.woff'},None))
  with patch('controlplane.supply_fonts.public_url'),patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
   with self.assertRaises(ValueError):font_bytes('https://source.example/font.woff')
  self.assertEqual(opener.open.call_count,1)
  opener.reset_mock();opener.open.side_effect=lambda *a,**k:(_ for _ in ()).throw(urllib.error.HTTPError('https://source.example/font.woff',307,'redirect',{'Location':'/font.woff'},None))
  with patch('controlplane.supply_fonts.public_url'),patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
   with self.assertRaises(ValueError):font_bytes('https://source.example/font.woff')
  self.assertEqual(opener.open.call_count,5)
 def test_nested_svg_fragment_is_not_missing_file(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'index.html').write_text('''<style>.noise{background:url("data:image/svg+xml,%3Crect filter='url(%23n)'/%3E")}.real{background:url('absent.png')}</style>''')
   self.assertEqual(audit(p)['missing'],[{'file':'index.html','reference':'absent.png'}])
 def test_existing_directory_hint_is_not_a_file_but_fetch_still_is(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'assets/audio').mkdir(parents=True)
   (p/'index.html').write_text('<script src="main.js"></script>')
   (p/'main.js').write_text("const AUDIO_BASE='assets/audio'; const file='assets/audio/absent.mp3';")
   self.assertEqual(audit(p)['missing'],[{'file':'main.js','reference':'assets/audio/absent.mp3'}])
   (p/'main.js').write_text("fetch('assets/audio');")
   self.assertEqual(audit(p)['missing'],[{'file':'main.js','reference':'assets/audio'}])
 def test_package_recheck_requires_new_checker_and_unsealed_local_block(self):
  row={'status':'blocked','error_code':'MISSING_LOCAL_RESOURCE'}
  self.assertTrue(needs_package_recheck(row,'new'))
  self.assertFalse(needs_package_recheck(dict(row,package_check_revision='new'),'new'))
  self.assertTrue(needs_package_recheck(dict(row,package_check_revision='old'),'new'))
  for change in ({'submitted':True},{'archive_sha256':'sealed'},{'payload_sha256':'sealed'},
                 {'status':'done'},{'error_code':'LICENSE_UNDECLARED'},
                 {'error_code':'CONFIG_REQUIRED'},{'error_code':'NETWORK_ERROR'}):
   self.assertFalse(needs_package_recheck(dict(row,**change),'new'),change)
 def test_default_owner_preserves_explicit_rights_and_original(self):
  with tempfile.TemporaryDirectory() as t:
   s=Store(Path(t)/'db.sqlite3')
   with s.tx() as db:s.put(db,'settings',{'id':'supply_defaults','enabled':True,'scope':'platform_outputs','license_declaration':{'distributable':'yes','owner':'gcy'}})
   with s.read() as db:
    original={'known_limitations':['actual limit']};value=metadata_for(s,db,{},original)
    self.assertEqual(value['license_declaration']['owner'],'gcy');self.assertNotIn('license_declaration',original)
    denied={'license_declaration':{'distributable':'no'}};self.assertEqual(metadata_for(s,db,{},denied),denied)
    named={'license_declaration':{'distributable':'yes','owner':'Explicit'}};self.assertEqual(metadata_for(s,db,{},named),named)
 def test_unreadable_configuration_is_not_target_change(self):
  with patch('pathlib.Path.read_text',side_effect=PermissionError()),patch.dict('os.environ',{},clear=True):
   c=settings();self.assertEqual(c['_config_error'],'CONFIG_FILE_UNREADABLE');self.assertIn('CONFIG_FILE_UNREADABLE',readiness(c)['errors'])
 def test_documentation_asset_example_is_not_live_dependency(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'index.html').write_text('<script src="loader.js"></script>')
   (p/'loader.js').write_text("/** loader.load('assets/models/model.gltf'); */\n// fetch('assets/ignored.json')\nconst prefix='assets/';const real='assets/real.json';")
   result=audit(p);self.assertEqual(result['missing'],[{'file':'loader.js','reference':'assets/real.json'}])
 def test_font_closure_runs_without_resource_rename(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'index.html').write_text('<link rel="stylesheet" href="style.css">')
   (p/'style.css').write_text('@font-face{src:url("https://example.org/font.woff2")}')
   response=MagicMock();response.__enter__.return_value.read.return_value=b'wOF2'+b'fontbytes'*4
   opener=MagicMock();opener.open.return_value=response
   with patch('controlplane.supply_fonts.public_url'),patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
    with delivery_source(p,{'id':'c','title':'Fixture'},{'id':'v','report':{}},{}) as (target,info):
     self.assertFalse(audit(target)['external']);self.assertTrue((target/'delivery-font-map.json').exists())
   self.assertIn('https://',(p/'style.css').read_text())
 def test_missing_font_uses_explicit_css_provenance_and_real_bytes(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'style.css').write_text('@font-face{src:url("fonts/fallback.woff")}')
   (p/'runtime-resource-map.js').write_text('window.runtimeResourceBindings='+json.dumps({'https://source.example/game/style.css':'./style.css'})+';')
   response=MagicMock();response.__enter__.return_value.read.return_value=b'wOFF'+b'real-font-data'*4
   opener=MagicMock();opener.open.return_value=response
   from controlplane.supply_fonts import localize
   with patch('controlplane.supply_fonts.public_url') as public,patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
    records=localize(p)
   self.assertEqual(records[0]['url'],'https://source.example/game/fonts/fallback.woff')
   self.assertEqual(records[0]['declared_by'],'https://source.example/game/style.css')
   self.assertEqual((p/records[0]['path']).read_bytes(),b'wOFF'+b'real-font-data'*4)
   public.assert_called_once_with(records[0]['url']);self.assertFalse(audit(p)['missing'])
 def test_missing_font_without_provenance_is_not_guessed(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'style.css').write_text('@font-face{src:url("fonts/missing.woff")}')
   from controlplane.supply_fonts import localize
   with patch('controlplane.supply_fonts.urllib.request.build_opener') as network:
    self.assertEqual(localize(p),[]);network.assert_not_called()
   self.assertTrue(audit(p)['missing'])
 def test_unavailable_font_keeps_source_status_and_resource_gap(self):
  import urllib.error
  from controlplane.supply import SupplyError
  from controlplane.supply_fonts import localize
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'style.css').write_text('@font-face{src:url("https://source.example/absent.woff")}')
   opener=MagicMock();opener.open.side_effect=urllib.error.HTTPError('https://source.example/absent.woff',404,'absent',{},None)
   with patch('controlplane.supply_fonts.public_url'),patch('controlplane.supply_fonts.urllib.request.build_opener',return_value=opener):
    with self.assertRaises(SupplyError) as result:localize(p)
   self.assertEqual(result.exception.code,'MISSING_LOCAL_RESOURCE')
   self.assertEqual(result.exception.details[0]['source_status'],404)
   self.assertIn('https://source.example/absent.woff',(p/'style.css').read_text())

if __name__=='__main__':unittest.main()
