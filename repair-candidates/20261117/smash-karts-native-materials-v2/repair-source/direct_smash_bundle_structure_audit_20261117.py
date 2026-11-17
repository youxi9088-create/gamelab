"""Read UnityFS containers and serialized records only, never launch game."""
from pathlib import Path
import json,hashlib,sys,collections,datetime,gc
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'original-addressables-20261117';sys.path.insert(0,str(b/'synty-python'));import UnityPy
first=json.loads((folder/'bundle-intake.json').read_text(encoding='utf8'));retry=json.loads((folder/'bundle-attempt2.json').read_text(encoding='utf8'))
chosen={x['url']:x for x in first['rows'] if x['http']==200 and x['curl_exit']==0};chosen.update({x['url']:x for x in retry['rows']if x['http']==200 and x['curl_exit']==0})
catalogs=json.loads((folder/'catalog-intake.json').read_text(encoding='utf8'));required={url for row in catalogs['rows']for url in row['internal_ids']if url.endswith('.bundle')}
assert set(chosen)==required and len(chosen)==162
rows=[];receipt=folder/'bundle-structure-audit.json'
for number,(url,entry) in enumerate(sorted(chosen.items()),1):
 p=r/entry['path'];raw=p.read_bytes();assert len(raw)==entry['bytes'] and hashlib.sha256(raw).hexdigest()==entry['sha256'] and raw.startswith(b'UnityFS\0')
 env=UnityPy.load(str(p));counts=collections.Counter();containers=[];external=[];scene_bundles=[]
 for asset in env.assets:
  for item in getattr(asset,'externals',[]):external.append({'file':asset.name,'path':getattr(item,'path',None) or getattr(item,'pathName',None),'guid':str(getattr(item,'guid',None))})
 for obj in env.objects:
  counts[obj.type.name]+=1
  if obj.type.name=='AssetBundle':
   bundle=obj.read();scene_bundles.append({'name':bundle.m_Name,'is_scene_bundle':bool(bundle.m_IsStreamedSceneAssetBundle)})
   containers.extend(name for name,_ in bundle.m_Container)
 row={'url':url,'path':entry['path'],'bytes':len(raw),'sha256':entry['sha256'],'object_counts':dict(counts),'containers':containers,'asset_bundles':scene_bundles,'externals':external,'structural_read_passed':True}
 rows.append(row)
 if number%20==0 or number==len(chosen):
  out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'game_executed':False,'original_game_modified':False,'expected':162,'observed':len(rows),'complete':len(rows)==162,'bytes':sum(x['bytes']for x in rows),'rows':rows}
  tmp=receipt.with_suffix('.json.tmp');tmp.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');tmp.replace(receipt)
  print(json.dumps({'observed':len(rows),'expected':162,'bytes':out['bytes'],'all_structural_reads_passed':True,'game_executed':False}),flush=True)
 del env,raw;gc.collect()
