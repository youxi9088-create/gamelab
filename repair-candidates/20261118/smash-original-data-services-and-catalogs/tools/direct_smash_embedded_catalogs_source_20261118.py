"""Recover original embedded catalogs and bind the actual resource consumer names."""
from pathlib import Path
import json,struct,re,hashlib,contextlib,io,gzip,subprocess,sys,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';old=r/'analysis-20261117';out=r/'analysis-20261118/embedded-catalogs'
assert not out.exists();out.mkdir()
sys.path.insert(0,str(b/'synty-python'));import UnityPy
container=r/'native-unpacked-20261117/e906ad610c88fe82b2d0199b3cc0e7fb/data.unity3d'
assert hashlib.sha256(container.read_bytes()).hexdigest()=='a8a15c03255abf9c2413a1b30e36164abc79ade9a0190dcedcac29326c49c7e2'
env=UnityPy.load(str(container));assets=[]
for obj in env.objects:
 if obj.type.name!='TextAsset':continue
 tree=obj.read_typetree();name=tree['m_Name']
 if name not in ['ItemDatas','ContentGroups','newsItems','crossPromos','ftueItems','global','tallTeamCustom']:continue
 raw=tree['m_Script'];raw=raw.encode('utf8',errors='surrogateescape')if isinstance(raw,str)else bytes(raw)
 row={'file':obj.assets_file.name,'path_id':obj.path_id,'name':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
 if name in ['ItemDatas','ContentGroups']:
  decoded=gzip.decompress(raw);value=json.loads(decoded)
  assert isinstance(value,dict)
  (out/(name+'.original.gz')).write_bytes(raw);(out/(name+'.original-decoded.json')).write_bytes(decoded)
  row.update(gzip_crc_and_size_verified=True,decoded_bytes=len(decoded),decoded_sha256=hashlib.sha256(decoded).hexdigest(),json_root_keys=list(value),root_count=len(value))
  if name=='ItemDatas':row['items_per_category']={k:len(v)for k,v in value.items()}
 elif name in ['crossPromos','newsItems']:
  value=json.loads(raw);row.update(json_root_keys=list(value),list_counts={k:len(v)for k,v in value.items()if isinstance(v,list)})
 elif name=='ftueItems':assert raw==b'';row['empty_original']=True
 else:row['format']='Original word-filter text, not a game-settings JSON'
 assets.append(row)
assert len(assets)==7
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');source=source[:source.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
ns={'__file__':str(b/'read-embedded-consumer-source-only.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'read-initial-data-only','exec'),ns)
original=ns['raw'];sections=ns['sections'];leb=ns['leb'];u=ns['uleb']
selected={15889,15883,25937,25823,2285,6275,62455,62450,62443,2117}
code=next(x for x in sections if x['kind']==10);count,pos=leb(original,code['start']);payload=bytearray(u(count));body_proofs=[]
for i in range(count):
 size,pos=leb(original,pos);body=original[pos:pos+size];pos+=size;fn=i+ns['function_imports']
 if fn in selected:body_proofs.append({'function_index':fn,'bytes':size,'sha256':hashlib.sha256(body).hexdigest()})
 else:body=b'\0\0\x0b'
 payload.extend(u(len(body)));payload.extend(body)
assert pos==code['end']and len(body_proofs)==len(selected)
result=bytearray(original[:8])
for s in sections:
 if s['kind']==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
 else:result.extend(original[s['begin']:s['end']])
wasm=out/'catalog-consumers-NOT-RUNTIME.wasm';dcmp=out/'catalog-consumers-NOT-RUNTIME.dcmp';wasm.write_bytes(result)
done=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-decompile'),str(wasm),'-o',str(dcmp)],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=55)
assert done.returncode==0,done.stderr
text=dcmp.read_text(encoding='utf8');headers=list(re.finditer(r'^function ([^\n]+)// func(\d+)\n',text,re.M));snippets=[]
for n,h in enumerate(headers):
 if int(h[2])not in selected:continue
 body=text[h.start():headers[n+1].start()if n+1<len(headers)else len(text)]
 snippets.append({'function_index':int(h[2]),'source':body,'source_sha256':hashlib.sha256(body.encode()).hexdigest()})
assert len(snippets)==len(selected)
table=(old/'native-string-table-ANALYSIS-ONLY.bin').read_bytes();assert hashlib.sha256(table).hexdigest()=='ba206c18054091f279ec3ab933f234ad9522b091d3b0628bde87692dc8f88f10'
decoded_getters=[]
for fn in [15889,15883,62455,62450,62443]:
 body=next(x['source']for x in snippets if x['function_index']==fn)
 assert '[112087]:int'in body
 pairs=[(int(a),int(n))for a,n in re.findall(r'\n\s+(\d+),\n\s+(\d+),\n',body)]
 assert len(pairs)==1,(fn,pairs)
 start,length=pairs[0];assert start+length<=len(table)
 value=table[start:start+length].decode('utf8')
 decoded_getters.append({'function_index':fn,'original_table_range':[start,length],'value':value})
assert next(x['value']for x in decoded_getters if x['function_index']==15889)=='ItemDatas'
assert next(x['value']for x in decoded_getters if x['function_index']==15883)=='ContentGroups'
proof={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_modified':False,'original_data_sha256':hashlib.sha256(container.read_bytes()).hexdigest(),'original_wasm_sha256':hashlib.sha256(original).hexdigest(),'assets':assets,'original_consumer_body_hashes':body_proofs,'original_consumer_source':snippets,'original_decoded_resource_getters':decoded_getters,'consumer_scope':'Original CustomizationDataService.bki44904/bkj44903 use getter15889/15883 and helper25937; source helper semantics require inspection, no native function is executed','limitations':['Item and content catalogs are original editable data, not all referenced prefab assets or whole-game completeness','Original ftueItems is empty; global and tallTeamCustom are word filters, not settings tables','No items, currency, paid content, account, readiness or remote success changed','Original service startup, local room/player/AI and actual gameplay remain unresolved']}
(out/'embedded-catalog-source-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'source_only':True,'game_executed':False,'assets':[a for a in assets if a['name']in ['ItemDatas','ContentGroups','ftueItems']],'decoded_getters':decoded_getters},ensure_ascii=False))
