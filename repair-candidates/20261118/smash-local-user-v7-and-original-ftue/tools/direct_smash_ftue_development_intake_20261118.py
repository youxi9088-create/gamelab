"""Try the exact public asset from the development network after confirmed52 network timeout."""
from pathlib import Path
import urllib.request,json,datetime,hashlib,re
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118/ftue-static-development-intake';assert not out.exists()
prior=json.loads((b/'direct-smash-ftue-static-intake-20261118.json').read_bytes());assert not prior['complete']and prior['error_type']=='URLError'and prior['http_status']is None
d=json.loads((r/'analysis-20261118/service-data-source-urls/original-settings-constant-source.json').read_bytes());source=next(x['source']for x in d['original_source_snippets']if x['function_index']==31571);assert re.findall(r'\n\s+(\d+),\n\s+(\d+),\n',source)==[('29131','57')]
table=(r/'analysis-20261117/native-string-table-ANALYSIS-ONLY.bin').read_bytes();url=table[29131:29188].decode();assert url==prior['source_url']
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
op=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect());out.mkdir();result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'environment':'Development computer, different network path after terminal52 WinError10060; public static only','source_url':url,'request_count':1,'proxy_bypassed':True,'authentication_used':False,'api_requested':False,'game_executed':False}
try:
    with op.open(url,timeout=20)as response:
        assert response.status==200 and response.geturl()==url;raw=response.read(4*1024*1024+1);assert 0<len(raw)<=4*1024*1024;value=json.loads(raw);assert isinstance(value,(dict,list));result.update(http_status=response.status,content_type=response.headers.get('Content-Type'))
    (out/'ftue-v4.original.json').write_bytes(raw);result.update(complete=True,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),root_type=type(value).__name__,root_keys=list(value)if isinstance(value,dict)else None,root_items=len(value))
except Exception as error:result.update(complete=False,error_type=type(error).__name__,error=str(error),http_status=getattr(error,'code',None))
(out/'receipt.json').write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps(result,ensure_ascii=False))
