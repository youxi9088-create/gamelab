from pathlib import Path
import json,hashlib,shutil,base64
b=Path(__file__).parent;r=b/'direct-games/job-353d7339bf40'
src=r/'work-native-local-v2';dst=r/'work-native-local-v3'
assert not dst.exists()
shutil.copytree(src,dst)
config=(r/'native-intake-20261117/UnityServicesProjectConfiguration.json').read_bytes()
p=dst/'StreamingAssets/UnityServicesProjectConfiguration.json';p.parent.mkdir(exist_ok=True);p.write_bytes(config)
proof={'source':'Original public build StreamingAssets/UnityServicesProjectConfiguration.json','sha256':hashlib.sha256(config).hexdigest(),'bytes':len(config),'modified':False,'reason':'Resolve exact native runtime resource request, without changing SDK authentication or inventing config.'}
(dst/'evidence/original-unity-service-config.json').write_text(json.dumps(proof,indent=2),encoding='utf8')
manifest={p.relative_to(dst).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in dst.rglob('*')if p.is_file()and p.name!='MANIFEST.json'}
changes={n:base64.b64encode((dst/n).read_bytes()).decode()for n in ['StreamingAssets/UnityServicesProjectConfiguration.json','evidence/original-unity-service-config.json']}
remote='''from pathlib import Path
import json,hashlib,shutil,base64,sqlite3,datetime
old=Path('D:/GameLab/temp/direct-blockpost2-local-20261117-v2');stage=Path('D:/GameLab/temp/direct-blockpost2-local-20261117-v3')
expected=__MANIFEST__;changes=__CHANGES__
assert not stage.exists(),'Read existing receipt before retrying'
with sqlite3.connect('file:D:/GameLab/app/data/platform.sqlite3?mode=ro',uri=True)as db:
 raw_job=db.execute('SELECT data FROM records WHERE kind=?and id=?',('jobs','job-353d7339bf40')).fetchone()[0];job=json.loads(raw_job);assert job['status']=='blocked'and not job.get('manual_paused')and not job.get('version_id')
prior=json.loads((old/'converted/MANIFEST.json').read_text(encoding='utf8'))
for n,h in prior.items():assert hashlib.sha256((old/'converted'/n).read_bytes()).hexdigest()==h,n
stage.mkdir();shutil.copytree(old/'converted',stage/'converted');root=stage/'converted'
for n,s in changes.items():
 p=root/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(base64.b64decode(s))
for n,h in expected.items():assert hashlib.sha256((root/n).read_bytes()).hexdigest()==h,n
(root/'MANIFEST.json').write_text(json.dumps(expected,indent=2),encoding='utf8')
(stage/'observation_server.py').write_bytes((old/'observation_server.py').read_bytes());(stage/'validation').mkdir()
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files':len(expected),'manifest_sha256':hashlib.sha256(json.dumps(expected,sort_keys=True).encode()).hexdigest(),'package_sha256':None,'source':'Verified v2 immutable stage plus two exact additional files','job_record_sha256':hashlib.sha256(raw_job.encode()).hexdigest(),'game_started':False,'task_job_unchanged':True,'stage':str(stage)}
(stage/'prepare-receipt.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))
'''.replace('__MANIFEST__',repr(manifest)).replace('__CHANGES__',repr(changes))
compile(remote,'remote-v3','exec');(b/'direct_blockpost2_stage_v3_remote_20261117.py').write_text(remote,encoding='utf8')
persistent=(b/'direct_blockpost2_observer_v2_persistent_20261117.py').read_text(encoding='utf8').replace('20261117-v2','20261117-v3').replace('ObserveV220261117','ObserveV320261117').replace("proof['files']==17",f"proof['files']=={len(manifest)}").replace('len(manifest)==17',f'len(manifest)=={len(manifest)}')
(b/'direct_blockpost2_observer_v3_persistent_20261117.py').write_text(persistent,encoding='utf8')
cleanup=(b/'direct_blockpost2_stop_v1_observation_20261117.py').read_text(encoding='utf8').replace('20261117-v1','20261117-v2').replace('GameLabDirectBlockpost2Observe20261117','GameLabDirectBlockpost2ObserveV220261117')
(b/'direct_blockpost2_stop_v2_observation_20261117.py').write_text(cleanup,encoding='utf8')
print(json.dumps({'files':len(manifest),'config':proof,'game_started':False}))
