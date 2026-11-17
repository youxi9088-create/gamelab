"""Decode original metadata field declarations only; no game execution."""
from pathlib import Path
import json,struct,hashlib,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
p=r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat'
raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()=='01fcf80701368d9cfd840da074171b85e422f8a3bd440e2f21f635cfb3b3a0c7'
strings,ssize=struct.unpack_from('<II',raw,24);types,tsize=struct.unpack_from('<II',raw,160);fields,fsize=struct.unpack_from('<II',raw,96);images,isize=struct.unpack_from('<II',raw,168)
def text(i):
 assert 0<=i<ssize
 return raw[strings+i:raw.index(0,strings+i,strings+ssize)].decode('utf8')
rows=[]
for i in range(tsize//88):
 off=types+i*88;ni,nsi=struct.unpack_from('<II',raw,off);name=text(ni)
 if name not in ['ServerSettings','AppSettings']:continue
 field_start=struct.unpack_from('<i',raw,off+32)[0];count=struct.unpack_from('<H',raw,off+68)[0]
 image=[text(struct.unpack_from('<I',raw,pos)[0])for pos in range(images,images+isize,40)if struct.unpack_from('<i',raw,pos+8)[0]<=i<sum(struct.unpack_from('<iI',raw,pos+8))]
 assert len(image)==1
 row={'type_index':i,'name':name,'namespace':text(nsi),'image':image[0],'fields':[]}
 for f in range(field_start,field_start+count):
  n,typ,token=struct.unpack_from('<IiI',raw,fields+f*12);assert token>>24==4
  row['fields'].append({'name':text(n),'field_index':f,'type_index':typ,'token':token,'ordinal':f-field_start})
 rows.append(row)
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'metadata_sha256':hashlib.sha256(raw).hexdigest(),'types':rows,'source_only':True,'game_executed':False,'original_modified':False}
d=r/'analysis-20261118';d.mkdir(exist_ok=True);target=d/'server-settings-metadata-fields.json';assert not target.exists();target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(out,ensure_ascii=False))
