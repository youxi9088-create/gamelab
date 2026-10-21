"""Real HTTP end-to-end conversion with an explicitly supplied local fixture."""
import hashlib,json,secrets,sys,threading,time,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from server import Service,make_server
fixture=Path(sys.argv[1]);output=ROOT/'test-output';output.mkdir(exist_ok=True)
archive=output/'fixture.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    z.writestr('manifest.json',json.dumps(dict(appid='wx0029cb0cdba90cd6',engine_appid='wx0446ba2621dda60a',ad_free=True)))
    z.write(fixture/'original-packages/__WITHOUT_MULTI_PLUGINCODE__.wxapkg','game/main.wxapkg')
    z.write(fixture/'original-packages/_subpackages_resources_.wxapkg','game/resources.wxapkg')
    z.write(fixture/'original-packages/cocos-3.5.1-plugin.wxapkg','engine/cocos.wxapkg')
key=secrets.token_urlsafe(32);service=Service(output/'data',{'integration':key});server=make_server(service,port=0);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
base=f'http://127.0.0.1:{server.server_port}';headers={'Authorization':'Bearer '+key}
try:
    request=urllib.request.Request(base+'/v1/jobs',data=archive.read_bytes(),headers={**headers,'Content-Type':'application/zip'})
    job=json.load(urllib.request.urlopen(request));jid=job['id'];deadline=time.monotonic()+210
    while job['status'] in ('queued','running') and time.monotonic()<deadline:
        time.sleep(.5);job=json.load(urllib.request.urlopen(urllib.request.Request(base+'/v1/jobs/'+jid,headers=headers)))
    assert job['status']=='built_unverified',job
    payload=urllib.request.urlopen(urllib.request.Request(base+job['download'],headers=headers)).read()
    assert hashlib.sha256(payload).hexdigest()==job['sha256']
    (output/'web-game.zip').write_bytes(payload)
    with zipfile.ZipFile(output/'web-game.zip') as z:
        for name in ['index.html','registry.js','bridge.js','assets/resources/config.json','conversion-report.json']:assert name in z.namelist(),name
        assert json.loads(z.read('conversion-report.json'))['validation']['gameplay']=='not_tested'
        assert 'F:/youxi' not in z.read('boot.js').decode()
        assert 'Promise.resolve({count:1,adFree:true})' in z.read('assets/scripts/index.js').decode()
    job.pop('owner',None);(output/'result.json').write_text(json.dumps(job,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'http_conversion':'passed','status':job['status'],'job':jid,'files':job['report']['extracted_files'],'modules':job['report']['modules'],'sha256':job['sha256']}))
finally:server.shutdown();server.server_close();service.pool.shutdown();thread.join()
