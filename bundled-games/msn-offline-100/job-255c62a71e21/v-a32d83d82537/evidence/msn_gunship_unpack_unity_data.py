"""Read the original UnityWebData archive only; no Unity/SDK execution."""
from pathlib import Path
import struct,json,hashlib
b=Path(__file__).parent/'msn-capture-100';src=b/'msn-en-us/originals/9nvh11mzqtwq';raw=(src/'Build/Build.data').read_bytes();assert raw[:16]==b'UnityWebData1.0\0'
header=struct.unpack_from('<I',raw,16)[0];assert 20<header<len(raw);pos=20;out=b/'source-analysis/gunship';out.mkdir(parents=True,exist_ok=True);root=out/'unpacked';root.mkdir(exist_ok=True);rows=[]
while pos<header:
 off,size,n=struct.unpack_from('<III',raw,pos);pos+=12;name=raw[pos:pos+n].decode();pos+=n
 assert header<=off<=off+size<=len(raw) and name not in [r['path'] for r in rows]
 target=(root/name).resolve();assert target.is_relative_to(root.resolve());body=raw[off:off+size]
 if target.exists():assert target.read_bytes()==body
 else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(body)
 rows.append({'path':name,'offset':off,'bytes':size,'sha256':hashlib.sha256(body).hexdigest()})
assert pos==header
result={'source_only':True,'native_executed':False,'original_data_sha256':hashlib.sha256(raw).hexdigest(),'files':rows}
(out/'unity-data-manifest.json').write_text(json.dumps(result,indent=2),encoding='utf8')
metadata=root/'Il2CppData/Metadata/global-metadata.dat';print(json.dumps({'files':rows,'metadata_header':struct.unpack_from('<II',metadata.read_bytes()) if metadata.exists() else None}))
