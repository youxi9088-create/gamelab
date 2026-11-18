"""Fetch one exact source-proven public static JSON once; no APIs, authentication or game execution."""
from pathlib import Path
import json,hashlib,sys,datetime,urllib.request,urllib.error,base64
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
s=Path('D:/GameLab/temp/direct-smash-ftue-static-input-20261118');url='https://smashkartsgc.b-cdn.net/ftuedata/prod/ftue-v4.json'
receipt=s/'receipt.json'
if receipt.exists():
    result=json.loads(receipt.read_bytes());result['existing_receipt_only_no_refetch']=True;print(json.dumps(result));raise SystemExit(0)
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None
op=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect());s.mkdir(exist_ok=True)
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_url':url,'source_kind':'Exact original native getter31571, byte range29131/57; GameConstants static606 retained by original GameSettingsData field1140 and original applier26015','public_static_only':True,'authentication_used':False,'proxy_bypassed':True,'game_executed':False,'native_state_changed':False,'api_requested':False,'request_count':1}
try:
    with op.open(url,timeout=25)as response:
        result.update(http_status=response.status,content_type=response.headers.get('Content-Type'),final_url=response.geturl());assert response.status==200 and response.geturl()==url;raw=response.read(4*1024*1024+1);assert 0<len(raw)<=4*1024*1024
    value=json.loads(raw);assert isinstance(value,(dict,list));write_bytes(s/'ftue-v4.original.json',raw)
    result.update(complete=True,bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),root_type=type(value).__name__,root_keys=list(value)if isinstance(value,dict)else None,root_items=len(value),source_file=str(s/'ftue-v4.original.json'))
except Exception as error:
    result.update(complete=False,error_type=type(error).__name__,error=str(error),http_status=getattr(error,'code',result.get('http_status')))
write_bytes(receipt,json.dumps(result,ensure_ascii=False,indent=2).encode());print(json.dumps(result,ensure_ascii=False))
