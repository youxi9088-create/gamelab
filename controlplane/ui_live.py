"""Transactionally maintained small operational rows, separate from statistics."""
import json
from .store import now

KINDS=('candidates','jobs','versions','batches','sources','settings')
STRIP=('report','observations','acquisition','raw','source_html','game_spec','dependencies','lease_token')

def install(db):
    kinds=','.join("'"+k+"'" for k in KINDS)
    paths=','.join("'$."+k+"'" for k in STRIP)
    projection=f'json_remove(new.data,{paths})'
    db.execute('CREATE TABLE IF NOT EXISTS ui_live_records(kind TEXT,id TEXT,data TEXT,PRIMARY KEY(kind,id))')
    for event in ('INSERT','UPDATE'):
        db.execute(f'''CREATE TRIGGER IF NOT EXISTS ui_live_{event.lower()}
        AFTER {event} ON records WHEN new.kind IN ({kinds}) BEGIN
        INSERT INTO ui_live_records VALUES(new.kind,new.id,{projection})
        ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data; END''')
    db.execute(f'''CREATE TRIGGER IF NOT EXISTS ui_live_delete AFTER DELETE ON records
        WHEN old.kind IN ({kinds}) BEGIN DELETE FROM ui_live_records
        WHERE kind=old.kind AND id=old.id; END''')
    db.execute(f'''INSERT INTO ui_live_records SELECT kind,id,json_remove(data,{paths})
        FROM records WHERE kind IN ({kinds}) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data''')

def operational(service, snapshot):
    with service.store.read() as db:
        rows=[(k,json.loads(data)) for k,data in db.execute('SELECT kind,data FROM ui_live_records ORDER BY rowid DESC')]
    result=dict(snapshot)
    for kind in KINDS:
        old={v['id']:v for v in snapshot.get(kind,[]) if isinstance(v,dict)} if kind!='settings' else {}
        current=[]
        for k,row in rows:
            if k!=kind:continue
            prior=old.get(row['id'],{})
            merged={**prior,**row}
            if kind=='candidates':
                from .game_names import display_title
                merged['title']=display_title(merged)
                for field in ('category','engine','source_engine','source_platform','category_classification','catalog_facets'):
                    if field in prior:merged[field]=prior[field]
            if kind=='jobs':
                merged.pop('lease_token',None)
                merged['display_status']='paused' if row.get('manual_paused') else prior.get('display_status',row['status'])
                if (prior.get('status'),prior.get('stage'))!=(row.get('status'),row.get('stage')):
                    merged['display_status']='paused' if row.get('manual_paused') else row['status']
                    merged.pop('pipeline',None)
                    merged['progress_label']=row.get('reason','')
            if kind=='sources' and row.get('deleted_at'):continue
            current.append(merged)
        if kind=='settings':
            result[kind]=next((r for r in current if r['id']=='main'),snapshot.get(kind,{}))
        else:result[kind]=current
    batches={b['id']:b for b in result['batches']}
    queue=sorted((j for j in result['jobs'] if j['status']=='queued' and not j.get('manual_paused') and batches.get(j.get('batch_id'),{}).get('status')=='running'),key=lambda j:(0 if j.get('manual_priority_at') else 1,j.get('manual_priority_at') or j.get('queued_at') or j.get('created_at','')))
    for i,j in enumerate(queue,1):
        j['queue_position']=i
        j['progress_label']=f'排队第 {i} 位 · 等待空闲执行器'
    result['conversion_queue']={'limit':service._concurrency(result['settings']),'running':sum(j['status']=='running' for j in result['jobs']),'waiting':len(queue)}
    result['metrics']={**result.get('metrics',{}),'review':sum(v['status']=='review' for v in result['versions']),'running':result['conversion_queue']['running']}
    result['ui_live_updated_at']=now()
    result['ui_statistics_built_at']=snapshot.get('ui_statistics_built_at')
    result['ui_live']=True
    return result
