"""Backfill only calculable unknown estimates; preserve usage and known costs."""
import argparse,json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from controlplane.store import Store,now
from controlplane.usage import estimate,validate_pricing

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--data',type=Path,required=True);p.add_argument('--rate',type=Path,required=True);p.add_argument('--provider',required=True);p.add_argument('--model',required=True);p.add_argument('--source',required=True);p.add_argument('--apply',action='store_true');a=p.parse_args()
 key=a.provider+':'+a.model;rate=validate_pricing({key:json.loads(a.rate.read_text('utf-8-sig'))})[key]
 store=Store.__new__(Store);store.path=a.data/'platform.sqlite3'
 with store.read() as db:
  config=store.get(db,'settings','ai_pricing') or {'id':'ai_pricing','rates':{}}
  rows=[json.loads(r[0]) for r in db.execute("SELECT data FROM records WHERE kind='ai_usage' AND json_extract(data,'$.provider')=? AND json_extract(data,'$.model')=?",(a.provider,a.model))]
 if key in config.get('rates',{}) and config['rates'][key]!=rate:raise ValueError('Existing price differs; refusing overwrite')
 eligible=[r for r in rows if r.get('estimated_cost') is None and estimate(r,rate).get('estimated_cost') is not None]
 changed=0
 if a.apply:
  backup=a.data/('usage-pricing-backup-'+a.model+'-'+now().replace(':','').replace('+','_')+'.json')
  backup.write_text(json.dumps({'settings':config,'records':eligible,'source':a.source},ensure_ascii=False),'utf-8')
  with store.tx() as db:
   current=store.get(db,'settings','ai_pricing') or {'id':'ai_pricing','rates':{}}
   if key in current.get('rates',{}) and current['rates'][key]!=rate:raise ValueError('Concurrent pricing update')
   current.setdefault('rates',{})[key]=rate;current.setdefault('sources',{})[key]={'url':a.source,'checked_at':now(),'scope':'公开API估算；缓存写入与普通输入同价时包含在其余输入中，不补造缓存Token'};current['updated_at']=now();store.put(db,'settings',current)
  for start in range(0,len(eligible),50):
   with store.tx() as db:
    for old in eligible[start:start+50]:
     r=store.get(db,'ai_usage',old['id'])
     if not r or r.get('estimated_cost') is not None or r.get('provider')!=a.provider or r.get('model')!=a.model:continue
     calculated=estimate(r,rate)
     if calculated.get('estimated_cost') is None:continue
     r.update(calculated);r['cost_recalculated_at']=now();r['cost_recalculation_source']=a.source;store.put(db,'ai_usage',r);changed+=1
  with store.tx() as db:store.event(db,'按实际模型补齐可计算的缺失费用，保留原Token和已知费用',stage='usage',model=a.model,updated_records=changed)
 print(json.dumps({'model':a.model,'records':len(rows),'calculable_missing':len(eligible),'updated_records':changed,'apply':a.apply,'known_costs_overwritten':0,'usage_fields_modified':False}))

if __name__=='__main__':main()
