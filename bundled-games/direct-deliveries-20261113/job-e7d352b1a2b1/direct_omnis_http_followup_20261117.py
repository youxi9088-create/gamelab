from pathlib import Path
import json,subprocess,urllib.request,urllib.parse,http.cookiejar,hashlib,re,datetime
b=Path(__file__).parent;base='https://gamelab.debug.ndaeweb.com';vid='v-4033dfcfe644';aid='artifact-664e0f94deac'
creds=json.loads(subprocess.check_output(['python','-X','utf8',str(b/'account_delivery.py'),'decrypt'],encoding='utf8'));u,p=next(iter(creds.items()));op=urllib.request.build_opener(urllib.request.ProxyHandler({}),urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
with op.open(urllib.request.Request(base+'/api/auth/login',json.dumps({'username':u,'password':p}).encode(),{'Content-Type':'application/json','Origin':base}),timeout=30)as response:assert response.status==200
del creds,u,p
with op.open(base+'/api/versions/'+vid+'/specification.md',timeout=30)as response:spec=response.read();assert response.status==200
(b/'direct-omnis-testsite-specification-20261117.md').write_bytes(spec);text=spec.decode('utf8')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'direct_https_no_proxy':True,'specification':{'http':200,'sha256':hashlib.sha256(spec).hexdigest(),'bytes':len(spec),'first_lines':text[:420],'headings':re.findall(r'^## (.+)',text,re.M),'definition_count':text.count('维度定义'),'content_count':text.count('内容说明'),'has_round2':'第2回合'in text,'has_ai_effect':'抵抗4降0'in text or'抵抗4降到0'in text or'抵抗4降0'in text,'has_version':'5.1'in text}}
with op.open(base+'/api/state?candidate=game-6e607cc59349',timeout=30)as response:detail=json.load(response)
v=next(x for x in detail['versions']if x['id']==vid);gp=v.get('game_profile')or v['report'].get('game_profile',{})
out['profile_keys']=list(gp);out['spec_section_keys']=list((gp.get('specification_v51')or gp.get('specification')or{}).get('sections',{}));out['version_status']=v['status']
try:
 target='https://gamelab-play.debug.ndaeweb.com/runtime/'+aid+'/index.html'
 launch=base+'/api/playback/launch?url='+urllib.parse.quote(target,safe='')
 with op.open(launch,timeout=35)as response:raw=response.read();out['authorized_launch']={'http':response.status,'bytes':len(raw),'final_host':urllib.parse.urlsplit(response.url).netloc}
 with op.open('https://gamelab-play.debug.ndaeweb.com/runtime/'+aid+'/main.js',timeout=35)as response:raw=response.read();out['authorized_main']={'http':response.status,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'matches':hashlib.sha256(raw).hexdigest()=='39ebb07f271eeea3374c0c90b87e18bd88b90099d93ac3e59a5fdc19c4729b23'}
except Exception as exc:out['authorized_playback_error']=str(exc)
(b/'direct-omnis-testsite-http-followup-20261117.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
