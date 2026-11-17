from pathlib import Path
import sys,json,datetime
b=Path(__file__).parent;sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.offline_delivery import inspect
r=b/'direct-games/job-ca75d464d2d7';source=r/'work-native-retirement-20261117-v3'
review={k:{'status':'removed'if k in ['multiplayer','advertising','payments']else'absent','reason':'Actual native provider registration and Lua HTTP/share/reward consumers retired. This is source review only; no dynamic proof or successful service response supplied.','evidence':['LevelDevil_wasm.js','index.html','evidence/native-retirement-20261117/source-retirement.json']}for k in ['leaderboard','multiplayer','advertising','payments']}
audit=inspect(source,{'passed':False,'environment':'local-artifact','actions':[]},review)
assert not audit['findings']and not audit.get('evidence_issues')and not audit['unreviewed_features'],audit
assert audit['status']=='pending'and not audit['runtime_observed']
out={'recorded_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':str(source),'audit':audit,'offline_features':review,'runtime_verified':False,'ready_review':False,'scope':'Absolute source root corrects the earlier CLI relative-root evidence-path rejection; only static paths/findings are clear, no runtime or admission.'}
(r/'native-retirement-v3-static-audit-corrected-20261117.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
