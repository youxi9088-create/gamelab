"""Read only the actual bound source run, without rescanning jobs or credentials."""
from pathlib import Path
import json,datetime,urllib.parse
r=Path('D:/GameLab/app/executors/runs/ae6e5376-4c44-4d76-b3b8-8990e74f19a0')
binding=json.loads((r/'job-binding.json').read_text(encoding='utf8'));assert binding['job_id']=='job-e6f888d6f2d5'
rows=[];keys={}
def walk(v,where):
 if isinstance(v,dict):
  for k,x in v.items():
   if k in ['url','resolved_url','entry_url','final_url','src','source_url']and isinstance(x,str)and x.startswith(('https://','http://')):
    u=urllib.parse.urlsplit(x)
    if u.hostname and('cryzen.io'in u.hostname or 'poki'in u.hostname):rows.append({'path':where+'.'+k,'url_without_query':urllib.parse.urlunsplit((u.scheme,u.netloc,u.path,'',''))})
   elif k.lower()not in ['headers','cookies','authorization','token','secret']:walk(x,where+'.'+k)
 elif isinstance(v,list):
  for i,x in enumerate(v):walk(x,where+'['+str(i)+']')
for name in ['web-acquisition.json','discovered-web-input.json','runtime-contract.json']:
 v=json.loads((r/name).read_text(encoding='utf8'));keys[name]=list(v)[:18]if isinstance(v,dict)else type(v).__name__;walk(v,name)
print(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'metadata_keys':keys,'source_url_records':rows[:35]},ensure_ascii=False))
