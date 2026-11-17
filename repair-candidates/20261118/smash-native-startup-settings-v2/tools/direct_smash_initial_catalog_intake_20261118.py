"""Acquire the exact startup catalog and hash declared by recovered settings."""
from pathlib import Path
import json, hashlib, subprocess, datetime, urllib.parse, re
from unity_hash128_spooky_v2_20261118 import unity_hash128
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';root=r/'original-streaming-assets-20261118'
receipt=root/'catalog-intake.json';assert not receipt.exists()
settings=json.loads((root/'settings.json').read_bytes())
locations={tuple(x['m_Keys']):x for x in settings['m_CatalogLocations']}
remote=locations[('AddressablesMainContentCatalogRemoteHash',)]['m_InternalId']
local=locations[('AddressablesMainContentCatalog',)]['m_InternalId']
assert local=='{UnityEngine.AddressableAssets.Addressables.RuntimePath}/catalog.json'
base=json.loads((root/'intake.json').read_bytes())['request']['url']
urls=[('catalog.json',urllib.parse.urljoin(base,'catalog.json')),('remote-catalog.hash',remote)]
rows=[]
for name,url in urls:
    assert urllib.parse.urlsplit(url).scheme=='https'
    p=root/name;assert not p.exists()
    proc=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','25','--max-filesize','5000000','--proto','=https','--output',str(p),'--write-out','%{http_code}',url],capture_output=True,text=True,timeout=30)
    row=dict(url=url,name=name,http=int(proc.stdout or 0),curl_exit=proc.returncode,proxy=False,tls_verified=True,complete=proc.returncode==0 and proc.stdout=='200')
    if p.exists():
        raw=p.read_bytes();row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
    if proc.stderr:row['error']=proc.stderr.strip()[:250]
    rows.append(row)
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,scan_started=False,original_modified=False,rows=rows)
if all(x['complete']for x in rows):
    raw=(root/'catalog.json').read_bytes();catalog=json.loads(raw);value=(root/'remote-catalog.hash').read_text().strip()
    assert re.fullmatch('[0-9a-f]{32}',value)
    actual=unity_hash128(raw)
    out.update(catalog_hash128=actual,declared_remote_hash=value,local_matches_declared_remote=actual==value,
               internal_ids=len(catalog['m_InternalIds']),http_ids=sum(x.startswith(('http://','https://'))for x in catalog['m_InternalIds']))
receipt.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=False))
