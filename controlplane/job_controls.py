"""Transactional task controls shared by local management entry points."""
from .store import now


def control_jobs(service, db, body):
    from .service import require
    s = service.store
    action = body.get('action')
    require(action in ('pause', 'start'), '未知任务操作')
    ids = body.get('ids')
    require(isinstance(ids, list) and ids and all(isinstance(i, str) for i in ids), '请选择任务')
    ids = list(dict.fromkeys(ids))
    jobs = [service.get(db, 'jobs', i) for i in ids]
    all_jobs = s.all(db, 'jobs')
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
