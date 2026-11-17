"""Bind recovered catalog bytes back to the original container using a second reader."""
from pathlib import Path
import sys,json,hashlib,struct,gzip
from unityfs_source_reader_20261118 import unpack
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';d=r/'analysis-20261118/embedded-catalogs'
source=r/'native-unpacked-20261117/e906ad610c88fe82b2d0199b3cc0e7fb/data.unity3d'
raw=source.read_bytes();assert hashlib.sha256(raw).hexdigest()=='a8a15c03255abf9c2413a1b30e36164abc79ade9a0190dcedcac29326c49c7e2'
files,proof=unpack(raw);sys.path.insert(0,str(b/'synty-python'));import UnityPy
env=UnityPy.load(str(source));objects=[]
for o in env.objects:
 if o.assets_file.name!='resources.assets'or o.path_id not in [24,27]:continue
 member=files[o.assets_file.name];chunk=member[o.byte_start:o.byte_start+o.byte_size]
 assert chunk==o.get_raw_data()
 pos=0;n=struct.unpack_from('<I',chunk,pos)[0];pos+=4;name=chunk[pos:pos+n].decode('utf8');pos=(pos+n+3)&~3
 size=struct.unpack_from('<I',chunk,pos)[0];pos+=4;encoded=chunk[pos:pos+size]
 assert name in ['ItemDatas','ContentGroups']and encoded==(d/(name+'.original.gz')).read_bytes()
 assert chunk[pos+size:]==b'\0'*((-(pos+size))%4)
 decoded=gzip.decompress(encoded);assert decoded==(d/(name+'.original-decoded.json')).read_bytes()
 value=json.loads(decoded)
 objects.append({'file':o.assets_file.name,'path_id_from_unitypy':o.path_id,'byte_start':o.byte_start,'byte_size':o.byte_size,'object_sha256':hashlib.sha256(chunk).hexdigest(),'name':name,'encoded_bytes':len(encoded),'encoded_sha256':hashlib.sha256(encoded).hexdigest(),'decoded_bytes':len(decoded),'decoded_sha256':hashlib.sha256(decoded).hexdigest(),'root_count':len(value),'total_items':sum(len(v)for v in value.values())if name=='ItemDatas'else None})
assert len(objects)==2
out={'source_only':True,'game_executed':False,'original_modified':False,'original_data_sha256':hashlib.sha256(raw).hexdigest(),'container':proof,'objects':objects,'verification_scope':'Separate bounded UnityFS/LZ4 reader reconstructs original resource members; slices at independently supplied UnityPy object offsets equal original objects, names and GZIP contents. No runtime load, account or provider state is invoked.'}
p=d/'independent-container-catalog-proof.json';assert not p.exists();p.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'blocks':len(proof['blocks']),'members':len(files),'objects':objects},ensure_ascii=False))
