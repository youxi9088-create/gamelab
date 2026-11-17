from pathlib import Path
import json,subprocess,urllib.request,http.cookiejar,datetime,hashlib,re,collections,concurrent.futures
b=Path(__file__).parent;base='https://gamelab.debug.ndaeweb.com';cid='game-6e607cc59349';jid='job-e7d352b1a2b1';vid='v-4033dfcfe644';aid='artifact-664e0f94deac'
credentials=json.loads(subprocess.check_output(['python','-X','utf8',str(b/'account_delivery.py'),'decrypt'],encoding='utf8'));u,p=next(iter(credentials.items()))
op=urllib.request.build_opener(urllib.request.ProxyHandler({}),urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
with op.open(urllib.request.Request(base+'/api/auth/login',json.dumps({'username':u,'password':p}).encode(),{'Content-Type':'application/json','Origin':base}),timeout=30)as response:assert response.status==200
del credentials,u,p
with op.open(base+'/api/state?candidate='+cid,timeout=45)as response:assert response.status==200;detail=json.load(response)
j=next(x for x in detail['jobs']if x['id']==jid);v=next(x for x in detail['versions']if x['id']==vid)
assert j['version_id']==vid and j['status']in ['review','completed']and v['status']=='review'and j['round']==14
assert v['artifact_id']==aid and v['report']['offline_delivery']['status']=='verified'and v['cover']and v['screenshots']
assert v['base_version_id']=='v-4f40af6a7dd7'
local=b/'direct-games'/jid/'final-delivery-20261117-v2';manifest=json.loads((local.parent/'final-manifest-20261117-v2.json').read_text(encoding='utf8'))
checks=[('specification',base+'/api/versions/'+vid+'/specification.md',None),('cover',base+'/api/artifact-images/'+aid+'/screenshots/revision-native-ai-effect.png',manifest['screenshots/revision-native-ai-effect.png']),('runtime-main','https://gamelab-play.debug.ndaeweb.com/runtime/'+aid+'/main.js',manifest['main.js'])]
def fetch(check):
 name,url,expected=check
 try:
  with op.open(url,timeout=35)as response:raw=response.read();status=response.status
  sha=hashlib.sha256(raw).hexdigest();assert status==200
  if expected:assert sha==expected,(name,sha,expected)
  if name=='specification':
   text=raw.decode('utf8');assert'格式版本：V5.1'in text;assert list(map(int,re.findall(r'^## (\d+)\.',text,re.M)))==list(range(1,17));assert text.count('**维度定义**')==16 and text.count('**内容说明**')==16
   assert'抵抗4降0'in text and'第2回合'in text
  return {'name':name,'url':url,'http':status,'sha256':sha,'bytes':len(raw),'matched':True}
 except Exception as exc:return {'name':name,'url':url,'matched':False,'error':str(exc)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:assets=list(pool.map(fetch,checks))
with op.open(base+'/api/state?view=summary',timeout=45)as response:state=json.load(response)
assignment=json.loads((b.parent/'gamelab/docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_TASKS.json').read_text(encoding='utf8'));ids={x['id']for x in assignment['tasks']};rows=[x for x in state['jobs']if x['id']in ids];assert len(rows)==93
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'direct_https_no_proxy':True,'job_id':jid,'version_id':vid,'artifact_id':aid,'job_status':j['status'],'version_status':v['status'],'round':j['round'],'offline':'verified','assets':assets,'all_http_verified':all(x['matched']for x in assets),'specification_version':'5.1','specification_dimensions':16,'cover_present':True,'a93_counts':dict(collections.Counter(x['status']for x in rows)),'a93_unique_candidates':len({x['candidate_id']for x in rows}),'scope':'Normal testsite task and acceptance records; HTTP asset/source checks only, no extra gameplay action or supply.'}
(b/'direct-omnis-testsite-verification-20261117.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
