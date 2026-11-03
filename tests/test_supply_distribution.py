import hashlib,io,json,tempfile,unittest,zipfile
from pathlib import Path
from controlplane.supply import build_archive,SupplyError
from controlplane.supply_config import readiness
from controlplane.supply_distribution import publish
from controlplane.supply_preparation import recovery

class Response(io.BytesIO):pass
class Opener:
 def __init__(self,body,ticket=None,download=None):self.body=body;self.calls=[];self.ticket=ticket;self.download=download
 def open(self,req,timeout=None):
  self.calls.append(req)
  if req.full_url.endswith('/resource/upload_info'):return Response(json.dumps(self.ticket or {'access_url':'cs.cn.ndhy.com','dist_path':'/fixture','token':'fixture','policy':'fixture','date_time':'fixture'}).encode())
  if '/v0.1/upload?' in req.full_url:return Response(b'{"path":"/fixture/archive.zip"}')
  return Response(self.body if self.download is None else self.download)

class SupplyDistributionTests(unittest.TestCase):
 def config(self):return {'SUPPLY_PLATFORM_BASE':'http://192.168.1.2:8083','SUPPLY_ALLOW_LAN_HTTP':True,'SUPPLY_APP_ID':'sup_fixture','SUPPLY_APP_SECRET':'fixture-secret','SUPPLY_DELIVERY_MODE':'cs','SUPPLY_CS_TENANT_ID':'test','SUPPLY_CS_AUTHORIZATION':'fixture-only'}
 def test_cs_mode_needs_no_static_directory_and_lan_is_explicit(self):
  c=self.config();self.assertTrue(readiness(c)['configured']);c.pop('SUPPLY_ALLOW_LAN_HTTP');self.assertFalse(readiness(c)['configured']);c['SUPPLY_ALLOW_LAN_HTTP']=True;c['SUPPLY_PLATFORM_BASE']='http://public.example:8083';self.assertFalse(readiness(c)['configured'])
 def test_cs_upload_download_hash_and_host_scope(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'sample.zip';p.write_bytes(b'fixture-exact-bytes');digest=hashlib.sha256(p.read_bytes()).hexdigest();o=Opener(p.read_bytes())
   self.assertEqual(publish(p,digest,self.config(),o),'https://cs.101.com/v0.1/static/fixture/archive.zip')
   self.assertEqual(len(o.calls),3)
   bad=Opener(p.read_bytes(),ticket={'access_url':'http://127.0.0.1/','token':'must-not-be-transmitted'})
   with self.assertRaises(SupplyError) as e:publish(p,digest,self.config(),bad)
   self.assertEqual(e.exception.code,'CS_UPLOAD_HOST_INVALID');self.assertEqual(len(bad.calls),1)
   with self.assertRaises(SupplyError) as e:publish(p,digest,self.config(),Opener(p.read_bytes(),download=b'tampered'))
   self.assertEqual(e.exception.code,'DOWNLOAD_HASH_MISMATCH')
 def test_pathological_zip_member_is_stored_losslessly_and_deterministically(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d)/'game';root.mkdir();(root/'index.html').write_text('<p>fixture</p>');data=b' '+b'0'*300000;(root/'dictionary.json').write_bytes(data);target=Path(d)/'sample.zip'
   first=build_archive(root,target)
   with zipfile.ZipFile(target) as z:self.assertEqual(z.getinfo('dictionary.json').compress_type,zipfile.ZIP_STORED);self.assertEqual(z.read('dictionary.json'),data)
   self.assertEqual(first,build_archive(root,target))
 def test_secret_findings_do_not_disclose_secret_or_erase_file(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);secret='AKIA'+'Z'*16;(root/'index.html').write_text('<script>const accessKey="'+secret+'";</script>')
   with self.assertRaises(SupplyError) as e:build_archive(root,root.parent/'fixture-secret-test.zip')
   self.assertEqual(e.exception.code,'SECRET_IN_CODE');self.assertNotIn(secret,str(e.exception.details));self.assertIn(secret,(root/'index.html').read_text())
 def test_platform_failures_and_rights_do_not_allow_automatic_replay(self):
  self.assertFalse(recovery({'state':'failed','next_action':'platform'})['automatic_retry'])
  self.assertFalse(recovery({'error_code':'LICENSE_UNDECLARED'})['automatic_retry'])
 def test_inline_external_calls_are_rejected_but_comments_and_password_words_are_not(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);page=root/'index.html'
   page.write_text('<script>// fetch("https://example.org/not-called")\nconst documentation="fetch(https)";const password="plain-game-text";</script>')
   build_archive(root,root.parent/'inline-fixture.zip')
   page.write_text('<script>fetch("https://example.org/data.json?private=not-in-report")</script>')
   with self.assertRaises(SupplyError) as error:build_archive(root,root.parent/'inline-fixture.zip')
   self.assertEqual(error.exception.code,'EXTERNAL_REQUEST_REJECTED');self.assertNotIn('private',str(error.exception.details));self.assertEqual(error.exception.details[0]['host'],'example.org')
 def test_template_shape_is_distinct_from_runtime_or_rights(self):
  from controlplane.supply_preparation import template_shape
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);(root/'vendor').mkdir();(root/'vendor/engine.js').write_bytes(b' '*400000);(root/'index.html').write_bytes(b' '*385000)
   value=template_shape(root)
   self.assertEqual([x['file'] for x in value['oversized_files']],['index.html']);self.assertEqual(value['status'],'needs_refactor')
 def test_local_import_map_and_module_relative_imports_remain_valid(self):
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);(root/'vendor').mkdir();(root/'game').mkdir()
   (root/'index.html').write_text('<script type="importmap">{"imports":{"engine":"./vendor/engine.js"}}</script><script type="module" src="game/main.js"></script>')
   (root/'game/main.js').write_text('import {value} from "engine"; import "./utils.js";')
   (root/'vendor/engine.js').write_text('export const value=1;');(root/'game/utils.js').write_text('export const other=2;')
   build_archive(root,root.parent/'import-map-fixture.zip')

if __name__=='__main__':unittest.main()
