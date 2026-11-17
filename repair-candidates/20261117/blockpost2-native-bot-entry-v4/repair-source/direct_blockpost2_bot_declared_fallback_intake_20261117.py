"""Read only the alternate URLs literally declared in the same native build.
Do not change global platform flags or substitute these resources without later
checking their actual Unity version, native names and gameplay compatibility.
"""
from pathlib import Path
import json,subprocess,hashlib,datetime,concurrent.futures
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';dst=r/'native-bot-declared-fallback-20261117';dst.mkdir(exist_ok=True);assert not(dst/'receipt.json').exists()
requests=[('sharedres','https://cdn.playblockpost.com/blox_webgl/data/sharedres'),('map_bloxcont.manifest','https://cdn.playblockpost.com/blox_webgl/data/map_bloxcont.manifest')]
def fetch(pair):
 name,url=pair;p=dst/name;assert not p.exists();done=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--fail','--connect-timeout','10','--max-time','55','--max-filesize','120000000','--dump-header',str(p)+'.headers','--output',str(p),'--write-out','%{http_code} %{ssl_verify_result} %{size_download}',url],capture_output=True,text=True,timeout=65);raw=p.read_bytes()if p.exists()else b'';out={'name':name,'url':url,'exit_code':done.returncode,'transfer':done.stdout.strip(),'error':done.stderr.strip(),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'signature':raw[:100].hex(),'source':'Alternate static path explicitly present in the same bound original native Map loader; no fabricated URL or version substitution','usable':False,'game_executed':False};(dst/(name+'.receipt.json')).write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out),flush=True);return out
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:rows=list(pool.map(fetch,requests))
(dst/'receipt.json').write_text(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':rows,'source_only':True,'not_installed':True,'compatibility_unverified':True},indent=2),encoding='utf8')
