"""Append-only inference usage. Missing provider usage/pricing is never zero cost."""
from datetime import datetime,timedelta,timezone
import math
from .store import now

def ordered_events(events):
    # Second-resolution timestamps otherwise inherit random UUID ordering.
    return sorted(events,key=lambda e:(e.get('created_at',''),0 if e.get('node_status')=='running' else 1))

def estimate(row, rate):
    """Price one request. Cached reads/writes are subsets of total input."""
    if not rate:return {'estimated_cost':None,'currency':None,'cost_unknown_reason':'pricing_missing'}
    result={'estimated_cost':None,'currency':rate['currency'],'pricing':rate}
    if any(row.get(k) is None for k in ('input_tokens','output_tokens')):
        return {**result,'cost_unknown_reason':'usage_missing'}
    if row.get('service_tier') not in (None,'','default','standard'):
        return {**result,'cost_unknown_reason':'service_tier_not_priced'}
    selected=rate;band='standard'
    if rate.get('long_context') and row['input_tokens']>rate['long_context']['threshold']:
        selected=rate['long_context'];band='long_context'
    result['pricing_band']=band
    parts={};ordinary=row['input_tokens']
    for field,price in [('cached_input_tokens','cached_input_per_million'),('cache_write_tokens','cache_write_per_million')]:
        n=row.get(field)
        if price in selected:
            if n is None:return {**result,'cost_unknown_reason':field+'_missing'}
            ordinary-=n;parts[field]=n*selected[price]/1_000_000
        elif n:
            return {**result,'cost_unknown_reason':price+'_missing'}
    parts['uncached_input_tokens']=ordinary*selected['input_per_million']/1_000_000
    parts['output_tokens']=row['output_tokens']*selected['output_per_million']/1_000_000
    return {**result,'estimated_cost':sum(parts.values()),'cost_breakdown':parts,'cost_unknown_reason':None}

def record(store,db,job,value,pricing):
    if not isinstance(value,dict):raise ValueError('用量记录格式错误')
    key=str(value.get('call_id',''))
    if not key or len(key)>80:raise ValueError('缺少调用 ID')
    key=job['id']+':'+key
    existing=store.get(db,'ai_usage',key)
    if existing:return existing
    row={k:str(value.get(k,''))[:120] for k in ('provider','model','status','stage')}
    row.update(id=key,job_id=job['id'],candidate_id=job['candidate_id'],round=job.get('round',1),created_at=now())
    for name in ('input_tokens','output_tokens','cached_input_tokens','cache_write_tokens'):
        n=value.get(name)
        if n is not None and (type(n)!=int or not 0<=n<=1_000_000_000):raise ValueError('Token 数量无效')
        row[name]=n
    if row['input_tokens'] is not None and (row['cached_input_tokens'] or 0)+(row['cache_write_tokens'] or 0)>row['input_tokens']:
        raise ValueError('缓存读取与写入数量不能超过总输入 Token')
    row['service_tier']=str(value.get('service_tier') or '')[:40]
    seconds=value.get('duration_seconds',0)
    if not isinstance(seconds,(int,float)) or not math.isfinite(seconds) or not 0<=seconds<=86400:raise ValueError('耗时无效')
    row['duration_seconds']=round(seconds,3);row['estimated_cost']=None;row['currency']=None
    rate=(pricing or {}).get(row['provider']+':'+row['model'])
    row.update(estimate(row,rate))
    return store.put(db,'ai_usage',row)

def validate_pricing(value):
    if not isinstance(value,dict) or len(value)>100:raise ValueError('价格表格式错误')
    result={}
    for key,row in value.items():
        if not isinstance(key,str) or ':' not in key or len(key)>240 or not isinstance(row,dict):raise ValueError('价格键应为 provider:model')
        if row.get('currency') not in ('CNY','USD'):raise ValueError('币种须为 CNY 或 USD')
        def band(value):
            if not isinstance(value,dict):raise ValueError('价格档位格式错误')
            out={}
            for field in ('input_per_million','output_per_million','cached_input_per_million','cache_write_per_million'):
                if field not in value and field not in ('input_per_million','output_per_million'):continue
                n=value.get(field)
                if type(n) not in (int,float) or not math.isfinite(n) or not 0<=n<=1_000_000:raise ValueError('每百万 Token 价格无效')
                out[field]=n
            return out
        result[key]={'currency':row['currency'],**band(row)}
        if 'long_context' in row:
            long=row['long_context'];prices=band(long);threshold=long.get('threshold')
            if type(threshold)!=int or not 1<=threshold<=1_000_000_000:raise ValueError('长上下文阈值无效')
            for field in ('cached_input_per_million','cache_write_per_million'):
                if (field in row)!=(field in long):raise ValueError('普通档与长上下文档需配置相同缓存价格项')
            result[key]['long_context']={**prices,'threshold':threshold}
    return result

def aggregate(rows,period='day'):
    result={};tz=timezone(timedelta(hours=8))
    for row in rows:
        day=datetime.fromisoformat(row['created_at']).astimezone(tz).date()
        bucket=day.isoformat() if period=='day' else (day-timedelta(days=day.weekday())).isoformat() if period=='week' else day.strftime('%Y-%m')
        key=(bucket,row['candidate_id'],row['stage']);r=result.setdefault(key,dict(period=bucket,candidate_id=row['candidate_id'],stage=row['stage'],calls=0,input_tokens=0,output_tokens=0,cached_input_tokens=0,cache_write_tokens=0,cache_known_calls=0,cache_unknown_calls=0,unknown_usage_calls=0,unknown_cost_calls=0,duration_seconds=0,costs={}))
        r['calls']+=1;r['duration_seconds']+=row['duration_seconds']
        for field in ('input_tokens','output_tokens'):r[field]+=row.get(field) or 0
        add_cache_totals(r,row)
        if row.get('input_tokens') is None or row.get('output_tokens') is None:r['unknown_usage_calls']+=1
        if row.get('estimated_cost') is None:r['unknown_cost_calls']+=1
        else:r['costs'][row['currency']]=r['costs'].get(row['currency'],0)+row['estimated_cost']
    return sorted(result.values(),key=lambda x:(x['period'],x['candidate_id'],x['stage']),reverse=True)

def add_cache_totals(total,row):
    for field in ('cached_input_tokens','cache_write_tokens'):total[field]+=row.get(field) or 0
    complete=all(row.get(k) is not None for k in ('cached_input_tokens','cache_write_tokens'))
    total['cache_known_calls']+=complete;total['cache_unknown_calls']+=not complete

def operations(events,jobs,period='day'):
    owners={j['id']:j['candidate_id'] for j in jobs};starts={};rows={};tz=timezone(timedelta(hours=8))
    for e in ordered_events(events):
        if not e.get('node') or e.get('job_id') not in owners:continue
        key=(e['job_id'],e.get('round'),e.get('attempt'),e['node'])
        if e.get('node_status')=='running':starts[key]=e;continue
        if e.get('node_status') not in ('succeeded','failed','cancelled') or key not in starts:continue
        start=starts.pop(key);end=datetime.fromisoformat(e['created_at']);day=end.astimezone(tz).date()
        bucket=day.isoformat() if period=='day' else (day-timedelta(days=day.weekday())).isoformat() if period=='week' else day.strftime('%Y-%m')
        group=(bucket,owners[e['job_id']],e['node'])
        r=rows.setdefault(group,dict(period=bucket,candidate_id=group[1],stage=e['node'],executions=0,failed=0,duration_seconds=0))
        r['executions']+=1;r['failed']+=e['node_status']!='succeeded';r['duration_seconds']+=max(0,(end-datetime.fromisoformat(start['created_at'])).total_seconds())
    return sorted(rows.values(),key=lambda r:r['period'],reverse=True)


def game_totals(candidates, jobs, events, usage):
    """Recorded execution time: union intervals, excluding queue/review waits."""
    owners={j['id']:j['candidate_id'] for j in jobs}
    rows={c['id']:dict(candidate_id=c['id'],calls=0,input_tokens=0,output_tokens=0,
          cached_input_tokens=0,cache_write_tokens=0,cache_known_calls=0,cache_unknown_calls=0,
          unknown_usage_calls=0,known_token_fields=0,input_known_calls=0,output_known_calls=0,duration_seconds=None,unpaired_events=0)
          for c in candidates if not c.get('observations',{}).get('catalog_hidden')}
    intervals={cid:[] for cid in rows};starts={};closed=set()
    for e in ordered_events(events):
        cid=owners.get(e.get('job_id'))
        if cid not in rows or e.get('node') not in ('identify','acquire','analysis','adapt','repair','test','delivery'):continue
        key=(e['job_id'],e.get('round'),e.get('attempt'),e['node'])
        if e.get('node_status')=='running':
            if key in starts:rows[cid]['unpaired_events']+=1
            starts[key]=e['created_at']
        elif e.get('node_status') in ('succeeded','failed','cancelled'):
            start=starts.pop(key,None)
            if start:
                a=datetime.fromisoformat(start);b=datetime.fromisoformat(e['created_at'])
                if b>=a:intervals[cid].append((a,b))
                else:rows[cid]['unpaired_events']+=1
                closed.add((e['job_id'],e.get('round'),e['node']))
            elif e.get('attempt') is not None or (e['job_id'],e.get('round'),e['node']) not in closed:rows[cid]['unpaired_events']+=1
    for key in starts:rows[owners[key[0]]]['unpaired_events']+=1
    for cid,spans in intervals.items():
        merged=[]
        for a,b in sorted(spans):
            if merged and a<=merged[-1][1]:merged[-1]=(merged[-1][0],max(b,merged[-1][1]))
            else:merged.append((a,b))
        if merged:rows[cid]['duration_seconds']=sum((b-a).total_seconds() for a,b in merged)
    seen=set()
    for u in usage:
        cid=u.get('candidate_id');uid=u.get('id')
        if cid not in rows or (uid and uid in seen):continue
        if uid:seen.add(uid)
        r=rows[cid];r['calls']+=1
        add_cache_totals(r,u)
        for field in ('input_tokens','output_tokens'):
            r[field]+=u.get(field) or 0
            r['known_token_fields']+=u.get(field) is not None
            r['input_known_calls' if field=='input_tokens' else 'output_known_calls']+=u.get(field) is not None
        if u.get('input_tokens') is None or u.get('output_tokens') is None:r['unknown_usage_calls']+=1
    return list(rows.values())
