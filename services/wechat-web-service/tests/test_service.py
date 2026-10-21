import io,json,sys,tempfile,threading,unittest,urllib.request,urllib.error,zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server import Service,make_server,extract_upload,atomic_json

class Tests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
    def tearDown(self):self.tmp.cleanup()
    def archive(self,files):
        file=self.root/'test.zip'
        with zipfile.ZipFile(file,'w') as z:
            for name,content in files.items():z.writestr(name,content)
        return file
    def test_zip_traversal_rejected(self):
        with self.assertRaises(ValueError):extract_upload(self.archive({'../escape':'x'}),self.root/'input')
        self.assertFalse((self.root.parent/'escape').exists())
    def test_extra_file_rejected(self):
        with self.assertRaises(ValueError):extract_upload(self.archive({'server.py':'print(1)'}),self.root/'input')
    def test_manifest_types_rejected(self):
        files={'manifest.json':json.dumps({'appid':'wx0029cb0cdba90cd6','engine_appid':'wx0446ba2621dda60a','ad_free':'false'}),'game/main.wxapkg':'x','engine/plugin.wxapkg':'x'}
        with self.assertRaisesRegex(ValueError,'boolean'):extract_upload(self.archive(files),self.root/'input')
    def test_manifest_accepted(self):
        files={'manifest.json':json.dumps({'appid':'wx0029cb0cdba90cd6','engine_appid':'wx0446ba2621dda60a','ad_free':False}),'game/main.wxapkg':'x','engine/plugin.wxapkg':'x'}
        self.assertFalse(extract_upload(self.archive(files),self.root/'input')['ad_free'])
    def test_auth_and_tenant_isolation(self):
        keys={'a':'a'*32,'b':'b'*32};service=Service(self.root/'data',keys)
        jid='1'*32;directory=service.jobs/jid;directory.mkdir();atomic_json(directory/'job.json',dict(id=jid,owner='a',status='failed',created_at=1))
        server=make_server(service,port=0);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base=f'http://127.0.0.1:{server.server_port}'
        try:
            for token,status in [('',401),('b'*32,404)]:
                request=urllib.request.Request(base+'/v1/jobs/'+jid,headers={'Authorization':'Bearer '+token})
                with self.assertRaises(urllib.error.HTTPError) as caught:urllib.request.urlopen(request)
                self.assertEqual(caught.exception.code,status)
            request=urllib.request.Request(base+'/v1/jobs/'+jid,headers={'Authorization':'Bearer '+'a'*32})
            self.assertEqual(json.load(urllib.request.urlopen(request))['id'],jid)
        finally:server.shutdown();server.server_close();service.pool.shutdown();thread.join()
    def test_restart_marks_interrupted(self):
        service=Service(self.root/'data',{'a':'a'*32});jid='2'*32;directory=service.jobs/jid;directory.mkdir();atomic_json(directory/'job.json',dict(id=jid,owner='a',status='running',created_at=1));service.pool.shutdown()
        restored=Service(self.root/'data',{'a':'a'*32});self.assertEqual(restored.read(jid,'a')['status'],'interrupted');restored.pool.shutdown()

if __name__=='__main__':unittest.main()
