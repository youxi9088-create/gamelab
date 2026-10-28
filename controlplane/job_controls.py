"""Transactional task controls shared by local management entry points."""
import json

from .store import now, ident


def reject_removal(job, versions):
    """删除前的两道硬卡口。返回不可删的原因，可删则返回 None。"""
    if job.get('status') == 'running':
        return '任务正在执行，请先停止批次或等本轮结束后再删除'
    if any(v.get('job_id') == job['id'] for v in versions):
        return '该任务已产出版本，不能删除；请先处理版本'
    return None


def remove_jobs(service, db, jobs):
    """删除任务及其执行记录，归档到 deleted-tasks。游戏输入记录与批次保留。

    不可删的条目直接跳过并带回原因，不中断整批——批量清理时用户更想知道
    "哪些没删掉、为什么"，而不是因为一条就整批失败。
    """
    s = service.store
    versions = s.all(db, 'versions')
    changed, skipped = [], []
    for job in jobs:
        reason = reject_removal(job, versions)
        if reason:
            skipped.append({'id': job['id'], 'reason': reason}); continue
        records = []
        for row in db.execute('SELECT kind,id,data FROM records').fetchall():
            kind, rid, raw = row
            if kind.startswith('deleted-'):
                continue
            try:
                value = json.loads(raw)
            except Exception:
                continue
            if not isinstance(value, dict):
                continue
            if (kind == 'jobs' and rid == job['id']) or value.get('job_id') == job['id']:
                records.append(dict(kind=kind, id=rid, data=value))
        archive = dict(id=ident('deleted'), job_id=job['id'], deleted_at=now(), scope='task', records=records)
        s.put(db, 'deleted-tasks', archive)
        for record in records:
            db.execute('DELETE FROM records WHERE kind=? AND id=?', (record['kind'], record['id']))
        remaining = [j for j in s.all(db, 'jobs') if j.get('candidate_id') == job['candidate_id']]
        if not remaining:
            candidate = service.get(db, 'candidates', job['candidate_id'])
            if candidate.get('status') not in ('review', 'completed'):
                candidate['status'] = 'candidate'; s.put(db, 'candidates', candidate)
        s.event(db, '任务已删除，执行记录已归档', job['id'], job.get('stage'))
        changed.append({'id': job['id'], 'archive_id': archive['id'], 'removed_records': len(records)})
    return changed, skipped


def control_jobs(service, db, body):
    from .service import require
    s = service.store
    action = body.get('action')
    require(action in ('pause', 'start', 'remove'), '未知任务操作')
    ids = body.get('ids')
    require(isinstance(ids, list) and ids and all(isinstance(i, str) for i in ids), '请选择任务')
    ids = list(dict.fromkeys(ids))
    jobs = [service.get(db, 'jobs', i) for i in ids]
    all_jobs = s.all(db, 'jobs')
    if action == 'remove':
        changed, skipped_with_reasons = remove_jobs(service, db, jobs)
        # 事件在 remove_jobs 里逐条写入；这里统一成 control_jobs 的返回形状。
        return {'changed': [c['id'] for c in changed], 'skipped': [x['id'] for x in skipped_with_reasons],
                'removed': changed, 'skipped_detail': skipped_with_reasons}
    changed, skipped = [], []
    for job in jobs:
        if action == 'pause':
            if job['status'] not in ('queued', 'running') or job.get('manual_paused'):
                skipped.append(job['id']); continue
            # Keep the task active for deduplication, but exclude it from claiming.
            job.update(status='queued', manual_paused=True, paused_at=now())
            job.pop('lease_token', None); job.pop('lease_expires_at', None)
        else:
            batch = service.get(db, 'batches', job['batch_id'])
            eligible = job.get('manual_paused') or job['status'] in ('stopped', 'failed', 'blocked', 'waiting_input') or (job['status']=='queued' and batch['status'] in ('paused','stopped'))
            if not eligible:
                skipped.append(job['id']); continue
            require(not any(other['id']!=job['id'] and other['candidate_id']==job['candidate_id'] and other['status'] in ('queued','running','review','waiting_input') for other in all_jobs), '游戏已有后续活动任务，请先处理后续任务', 409)
            # Reopening a batch must not resume unselected queued siblings.
            if batch['status'] in ('paused', 'stopped'):
                for sibling in s.all(db, 'jobs'):
                    if sibling['batch_id']==batch['id'] and sibling['id'] not in ids and sibling['status']=='queued':
                        sibling.update(manual_paused=True, paused_at=now())
                        s.put(db, 'jobs', sibling)
            if job['status'] in ('failed', 'blocked', 'waiting_input'):
                job = service.continue_job(db, job, '手动批量启动，保留既有要求和范围限制，继续未完成任务。', resume_checkpoint=True)['job']
            job.pop('manual_paused', None); job.pop('paused_at', None)
            job.update(status='queued', queued_at=now(), attempt=0, automatic=True)
            batch['status']='running'; s.put(db, 'batches', batch)
        s.put(db, 'jobs', job)
        s.event(db, '手动暂停任务，撤销执行租约并保留材料' if action=='pause' else '手动启动任务，进入执行队列', job['id'], job['stage'])
        changed.append(job['id'])
    return {'changed': changed, 'skipped': skipped}
