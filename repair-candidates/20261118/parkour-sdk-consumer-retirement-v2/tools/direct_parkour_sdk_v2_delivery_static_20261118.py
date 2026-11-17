from pathlib import Path
import json,sys,datetime
b=Path(__file__).parent;p=b/'direct-games/job-09a1ed6877a8/work-sdk-consumer-retirement-v2-20261118'
sys.path.insert(0,str(b.parent/'gamelab'))
from controlplane.offline_delivery import inspect
from controlplane.conversion_delivery_checks import inspect as delivery
plan={'acceptance_actions':[{'type':'click','selector':'canvas','executed':False}],'scope':'Proposed actual native canvas start only; not executed, not a result or additional authorization'}
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'offline_static':inspect(p),'delivery_static':delivery(p,plan),'game_executed':False,'prior_ui_steps':5,'new_inputs':0,'manual_pause_preserved':True,'ready_review':False}
(p/'evidence/direct-repair/sdk-v2-delivery-static.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({k:v for k,v in out.items()if k not in ['offline_static','delivery_static']}|{'offline_status':out['offline_static'].get('status'),'offline_findings':out['offline_static'].get('findings'),'delivery_status':out['delivery_static'].get('status'),'delivery_findings':out['delivery_static'].get('findings')},ensure_ascii=False))
