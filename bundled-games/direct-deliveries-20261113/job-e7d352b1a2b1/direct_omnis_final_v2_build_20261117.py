"""Bind continuation screenshots without changing the observed game source."""
from pathlib import Path
import shutil,json,hashlib,sys
b=Path(__file__).parent;r=b/'direct-games/job-e7d352b1a2b1';source=r/'final-delivery-20261117-v1';target=r/'final-delivery-20261117-v2'
assert not target.exists();shutil.copytree(source,target)
for old,new in [('title.png','revision-title.png'),('native-ai-effect.png','revision-native-ai-effect.png')]:shutil.copy2(target/'screenshots'/old,target/'screenshots'/new)
gp=json.loads((target/'game-profile.json').read_text(encoding='utf8'));gp['cover']='screenshots/revision-title.png'
report=json.loads((target/'DIRECT_REPAIR_REPORT.json').read_text(encoding='utf8'));report['game_profile']=gp
for name,obj in [('game-profile.json',gp),('DIRECT_REPAIR_REPORT.json',report)]: (target/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf8')
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.delivery_requirements import delivery_gaps
files={p.relative_to(target).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in target.rglob('*')if p.is_file()};assert not delivery_gaps(report,list(files))
(r/'final-manifest-20261117-v2.json').write_text(json.dumps(files,ensure_ascii=False,indent=2),encoding='utf8')
(r/'final-report-20261117-v2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
# The v1 package/remote read-only plan remain immutable history.
build=(b/'direct_omnis_final_transfer_build_20261117.py').read_text(encoding='utf8')
build=build.replace('final-delivery-20261117-v1','final-delivery-20261117-v2').replace('final-manifest-20261117-v1','final-manifest-20261117-v2').replace('direct-omnis-final-20261117-v1','direct-omnis-final-20261117-v2').replace('direct_omnis_final_transfer_20261117.pyz','direct_omnis_final_transfer_v2_20261117.pyz').replace('direct_omnis_final_remote_prepare_20261117.py','direct_omnis_final_remote_prepare_v2_20261117.py')
exec(compile(build,'v2-final-package','exec'),{'__file__':str(b/'direct_omnis_final_transfer_build_20261117.py')})
