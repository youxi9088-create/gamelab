from pathlib import Path
import json,hashlib,subprocess,urllib.parse,datetime,concurrent.futures,re,time
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40';dst=r/'native-bot-declared-fallback-20261117';assert not(dst/'map-closure-receipt.json').exists()
source=json.loads((r/'native-home-menu-analysis-20261117/native-bot-map-source.json').read_text(encoding='utf8'));lists=[x['maplist_object']['strings']for x in source['mode_objects']if x['maplist_object']['strings'][0]=='maplist_tdm'];assert len(lists)==2 and lists[0]==lists[1];maps=lists[0][1:];assert len(maps)==19 and all(re.fullmatch('[a-zA-Z0-9_-]+',x)for x in maps)
known={'map_bloxcont':('53a05a830b67b0e66c9dece371a244209d0e2de7086827bbfb9ea00d9c3ec1a8',7411497),'map_bloxcont.manifest':('81b8a7aba361d995b6a4e9b565c7e8bdcc1d5fc97c581c04bfd72c91a367b2eb',1506)};names=[n for m in maps for n in ['map_'+m,'map_'+m+'.manifest']];start=time.monotonic()
def get(name):
 p=dst/name;url='https://cdn.playblockpost.com/blox_webgl/data/'+name
 if name in known:
  raw=p.read_bytes();h,size=known[name];assert len(raw)==size and hashlib.sha256(raw).hexdigest()==h;return {'name':name,'url':url,'exit_code':0,'http':'200','bytes':len(raw),'sha256':h,'reused_verified_original_transfer':True}
 assert not p.exists(),name
 proc=subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--fail','--connect-timeout','10','--max-time','55','--max-filesize','120000000','--dump-header',str(p)+'.headers','--output',str(p),'--write-out','%{http_code} %{ssl_verify_result} %{size_download}',url],capture_output=True,text=True,timeout=65);raw=p.read_bytes()if p.exists()else b'';out={'name':name,'url':url,'exit_code':proc.returncode,'transfer':proc.stdout.strip(),'error':proc.stderr.strip(),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'signature':raw[:32].hex(),'game_executed':False};(dst/(name+'.transfer-receipt.json')).write_text(json.dumps(out,indent=2),encoding='utf8')
 if proc.returncode:print(json.dumps(out),flush=True)
 return out
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:rows=list(pool.map(get,names))
hashes={};deps={};invalid=[]
for x in rows:
 if x['exit_code']or not x['name'].endswith('.manifest'):continue
 text=(dst/x['name']).read_text(encoding='utf8');matches=re.findall(r'^\s*Hash: ([a-f0-9]{32})\s*$',text,re.M);assert matches,x['name'];hashes[x['name']]=matches[0];deptext=text.split('Dependencies:',1)[1];deps[x['name']]=re.findall(r'^- (.+)$',deptext,re.M)
 if any(Path(v.replace('\\','/')).name!='sharedres'for v in deps[x['name']]):invalid.append(x['name'])
shared_manifest=(dst/'sharedres.manifest').read_text(encoding='utf8');shared_hash=re.findall(r'^\s*Hash: ([a-f0-9]{32})\s*$',shared_manifest,re.M)[0];assert shared_hash=='c57fc045209f042a00cbce24e958ace4';assert (dst/'sharedres').read_bytes().startswith(b'UnityFS\0')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_only':True,'bound_run_id':'a31e6f87-bd55-4c06-9382-055d7a865430','native_declared_resource_origin':'https://cdn.playblockpost.com/blox_webgl/data/','original_maplist_sha256':source['mode_objects'][3]['maplist_object']['sha256'],'maps':maps,'rows':rows,'published_map_hashes':hashes,'map_dependencies':deps,'unexpected_dependencies':invalid,'shared_resource_published_hash':shared_hash,'matches_exact_original_native_pc_hash':True,'complete':all(x['exit_code']==0 for x in rows)and not invalid,'total_map_bytes':sum(x['bytes']for x in rows),'wall_seconds':round(time.monotonic()-start,3),'installed':False,'runtime_verified':False,'ui_steps_used':4,'remaining':1}
(dst/'map-closure-receipt.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps({k:v for k,v in out.items()if k not in ['rows','map_dependencies','published_map_hashes','maps']},ensure_ascii=False),flush=True)
