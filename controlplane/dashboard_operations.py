"""Read-only operational dashboard. Unknown historical measurements stay unknown."""
from datetime import datetime, timedelta, timezone
from statistics import median


def overview(state, usage, clock=None):
    clock=clock or datetime.now(timezone.utc)
    def stamp(value):
        try:
            d=datetime.fromisoformat(value)
            return d if d.tzinfo else d.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):return None
    def age(value):
        d=stamp(value)
        return max(0,(clock-d).total_seconds()) if d else None
    candidates={c['id']:c for c in state.get('candidates',[]) if not c.get('observations',{}).get('catalog_hidden')}
    totals={r['candidate_id']:r for r in state.get('game_conversion_stats',[])}
    rows=[];models={};engines={};failures={}
    first_accepts=[];published_dates=[]
    for cid,c in candidates.items():
        jobs=sorted([j for j in state.get('jobs',[]) if j['candidate_id']==cid],key=lambda j:j.get('created_at',''),reverse=True)
        j=next((x for x in jobs if x.get('status')!='superseded'),jobs[0] if jobs else {})
        versions=[v for v in state.get('versions',[]) if v['candidate_id']==cid]
        accepted=[v for v in versions if v.get('status') in ('approved','published')]
        dates=[stamp(v.get('approved_at')) for v in accepted if stamp(v.get('approved_at'))]
        if dates:first_accepts.append(min(dates))
        supplies=sorted([s for s in state.get('supply',[]) if s.get('candidate_id')==cid],key=lambda s:s.get('created_at',''),reverse=True)
        supply=supplies[0] if supplies else {}
        for s in supplies:
            if s.get('state')=='published' and stamp(s.get('published_at')):published_dates.append(stamp(s['published_at']))
        t=totals.get(cid,{})
        calls=[u for u in usage if u.get('candidate_id')==cid]
        costs={};unknown_cost=0;retry_tokens=0;retry_unknown=0
        for u in calls:
            if u.get('estimated_cost') is None:unknown_cost+=1
            else:costs[u['currency']]=costs.get(u['currency'],0)+u['estimated_cost']
            if (u.get('round') or 1)>1:
                retry_tokens+=(u.get('input_tokens') or 0)+(u.get('output_tokens') or 0)
                retry_unknown+=u.get('input_tokens') is None or u.get('output_tokens') is None
        reason=j.get('reason') or j.get('question') or ''
        if j.get('status') in ('failed','blocked','waiting_input'):
            code=(j.get('policy_pause') or {}).get('label') or (j.get('report',{}).get('blocker') or {}).get('code') or j['status']
            failures[code]=failures.get(code,0)+1
        since=None
        if j.get('status')=='running':since=j.get('started_at')
        elif j.get('status')=='review':since=next((v.get('created_at') for v in versions if v['id']==j.get('version_id')),None)
        engine=c.get('engine') or '未识别'
        row=dict(**t,title=c.get('title',cid),engine=engine,route=j.get('route') or '未记录',
                 route_label=j.get('route_label') or '',route_detail=j.get('route_detail') or '',
                 job_id=j.get('id'),status=j.get('status') or c.get('status','candidate'),
                 display_status=j.get('display_status') or j.get('status') or c.get('status','candidate'),
                 stage=j.get('pipeline',{}).get('current') or j.get('stage'),
                 status_age_seconds=age(since),reason=reason,round=j.get('round'),
                 accepted=bool(accepted),costs=costs,unknown_cost_calls=unknown_cost,
                 retry_tokens=retry_tokens,retry_unknown_calls=retry_unknown,
                 supply_status=supply.get('state') or supply.get('status') or 'not_submitted',
                 supply_reason=supply.get('notice') or supply.get('error_code') or '',
                 supply_error=supply.get('error_code'),supply_age_seconds=age(supply.get('created_at')))
        row['candidate_id']=cid;rows.append(row)
        group=engines.setdefault(engine,dict(name=engine,games=0,accepted=0,calls=0,tokens=0,known_fields=0,unknown=0))
        group['games']+=1;group['accepted']+=bool(accepted);group['calls']+=t.get('calls',0)
        group['tokens']+=t.get('input_tokens',0)+t.get('output_tokens',0);group['unknown']+=t.get('unknown_usage_calls',0)
        group['known_fields']+=t.get('known_token_fields',0)
    seen=set()
    for u in usage:
        if u.get('candidate_id') not in candidates or u.get('id') in seen:continue
        seen.add(u.get('id'))
        key=(u.get('provider') or '未记录')+' / '+(u.get('model') or '未记录')
        g=models.setdefault(key,dict(name=key,calls=0,tokens=0,known_fields=0,unknown=0,costs={}))
        g['calls']+=1;g['tokens']+=(u.get('input_tokens') or 0)+(u.get('output_tokens') or 0)
        g['known_fields']+=sum(u.get(f) is not None for f in ('input_tokens','output_tokens'))
        g['unknown']+=u.get('input_tokens') is None or u.get('output_tokens') is None
        if u.get('estimated_cost') is not None:g['costs'][u['currency']]=g['costs'].get(u['currency'],0)+u['estimated_cost']
    calls=sum(r.get('calls',0) for r in rows);unknown=sum(r.get('unknown_usage_calls',0) for r in rows)
    measured=[r for r in rows if r.get('duration_seconds') is not None]
    complete=[r for r in measured if not r.get('unpaired_events')]
    local=clock.astimezone(timezone(timedelta(hours=8)))
    week=local.replace(hour=0,minute=0,second=0,microsecond=0)-timedelta(days=local.weekday())
    last=week-timedelta(days=7)
    return dict(updated_at=clock.isoformat(),games=rows,models=list(models.values()),engines=list(engines.values()),
                failure_reasons=[dict(code=k,count=v) for k,v in failures.items()],
                weekly_accepted=sum(week<=d<=clock for d in first_accepts),previous_week_accepted=sum(last<=d<week for d in first_accepts),
                weekly_published=sum(week<=d<=clock for d in published_dates) if published_dates else None,
                token_coverage=(calls-unknown)/calls if calls else None,calls=calls,unknown_calls=unknown,
                timing_complete=len(complete),timing_measured=len(measured),games_count=len(rows),
                median_seconds=median([r['duration_seconds'] for r in complete]) if complete else None,
                first_pass_rate=None,first_pass_note='历史验收尝试未完整记录，暂不计算首次通过率；已入库数量不是首次通过数量。')
