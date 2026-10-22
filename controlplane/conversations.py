"""Persistent task conversation and immutable revision lineage."""
from .store import ident, now


def message_presentation(message, jobs, events, rounds):
    """Classify for display using explicit metadata/evidence; never rewrite history."""
    if message.get('role') == 'user':
        return 'request'
    if message.get('kind') == 'auto_followup':
        return 'progress'
    if message.get('kind') == 'blocker':
        return 'result'
    if message.get('kind') in ('question', 'reply', 'progress', 'result'):
        return message['kind']
    text = message.get('text', '').strip()
    job_id = message.get('job_id')
    if any(j.get('id', j.get('original_job_id')) == job_id and
           j.get('question', '').strip() == text for j in jobs):
        return 'question'
    if any(r.get('original_job_id') == job_id and r.get('question', '').strip() == text for r in rounds):
        return 'question'
    for event in events:
        if event.get('job_id') != job_id:
            continue
        if event.get('message') == '需要补充信息：'+text:
            return 'question'
        if event.get('stage') == 'work-log' and event.get('message', '').strip() == text:
            return 'progress'
    return 'legacy'


class Conversations:
    def reconcile_history(self, db):
        s = self.store
        for c in s.all(db, 'candidates'):
            jobs = [j for j in s.all(db, 'jobs') if j['candidate_id'] == c['id']]
            versions = [v for v in s.all(db, 'versions') if v['candidate_id'] == c['id']]
            latest = jobs[0] if jobs else None
            if latest and latest['status'] in ('failed','blocked','waiting_input') and c.get('status') in ('failed','blocked','waiting_input','queued','running'):
                c['status']=latest['status'];s.put(db,'candidates',c)
            if latest and 'round' not in latest:
                latest['round']=max(1,len(versions))
                s.put(db,'jobs',latest)
            for j in jobs[1:]:
                if j['status'] in ('blocked', 'failed', 'review') and latest:
                    j.update(previous_status=j['status'],status='superseded', superseded_by=latest['id'])
                    s.put(db, 'jobs', j)
            for v in versions[1:]:
                if v['status'] in ('review', 'rejected'):
                    v.update(previous_status=v['status'],status='superseded', superseded_by=versions[0]['id'])
                    s.put(db, 'versions', v)

    def message(self, db, job, role, text, kind=None):
        return self.store.put(db, 'messages', dict(id=ident('msg'), candidate_id=job['candidate_id'],
            job_id=job['id'], round=job.get('round', 1), role=role, text=text,
            kind=kind or ('request' if role == 'user' else 'reply'), created_at=now()))

    def request_job_input(self, db, job, question):
        """Record a material question without fabricating a user reply or rerunning work."""
        from .service import require
        require(job['status'] in ('blocked','failed','waiting_input'), '只能为未执行的待处理任务补充提问', 409)
        require(isinstance(question,str) and 0 < len(question.strip()) <= 8000, '请填写具体问题')
        question=question.strip()
        self.message(db,job,'assistant',question,kind='question')
        job.update(status='waiting_input',question=question,reason=question)
        for field in ('lease_token','lease_expires_at','completed_at'):
            job.pop(field,None)
        self.store.put(db,'jobs',job)
        candidate=self.get(db,'candidates',job['candidate_id'])
        candidate['status']='waiting_input';self.store.put(db,'candidates',candidate)
        self.store.event(db,'需要补充信息：'+question,job['id'],job['stage'])
        self.update_batch(db,job['batch_id'])
        return {'job':job}

    def continue_job(self, db, job, text, *, automatic_followup=False, resume_checkpoint=False):
        from .service import require
        s = self.store
        require(job['status'] in ('review','waiting_input','blocked','failed','completed'), '任务正在执行或已被替代，暂不能提交续作', 409)
        require(isinstance(text, str) and 0 < len(text.strip()) <= 8000, '请填写 1–8000 字的回复或修改要求')
        require(not any(j['candidate_id']==job['candidate_id'] and j['id']!=job['id'] and j['status'] in ('queued','running','waiting_input','review') for j in s.all(db,'jobs')), '此游戏已有其他活动任务',409)
        versions = [v for v in s.all(db,'versions') if v['candidate_id']==job['candidate_id']]
        base = next((v for v in versions if v['id']==job.get('version_id')), versions[0] if versions else None)
        self.message(db, job, 'system' if automatic_followup else 'user', text.strip(), kind='auto_followup' if automatic_followup else 'message')
        if not automatic_followup:
            job.pop('auto_followup',None)
            job.pop('blocker',None)
            job.pop('checkpoint_slices',None)
            if not resume_checkpoint:job.pop('revision_checkpoint',None)
        # A reply resumes the same round; a change request creates a new round.
        if job['status'] != 'waiting_input':
            history = dict(job, id=ident('round'), original_job_id=job['id'])
            history.pop('lease_token', None)
            s.put(db, 'rounds', history)
            job['round'] = job.get('round',1)+1
        if base:
            if automatic_followup:
                job.pop('checkpoint_slices',None)
                job.pop('revision_checkpoint',None)
            job.update(base_version_id=base['id'], stage='reconstruct', continuation=True)
            for v in versions:
                if v['status'] in ('review','rejected'):
                    v['status']='superseded';s.put(db,'versions',v)
        else:
            from .source_routing import source_kind
            candidate=self.get(db,'candidates',job['candidate_id'])
            if job['stage']=='packaging' or source_kind(candidate.get('url',''),candidate.get('observations'))=='web':
                job['stage']='rea'
        job.update(status='queued', automatic=True, progress=0, attempt=0, reason=text.strip(),queued_at=now())
        candidate=self.get(db,'candidates',job['candidate_id']);candidate['status']='queued';s.put(db,'candidates',candidate)
        for field in ('lease_token','lease_expires_at','completed_at','question'):
            job.pop(field,None)
        s.put(db,'jobs',job)
        batch=self.get(db,'batches',job['batch_id'])
        if not automatic_followup or batch['status'] not in ('paused','stopped'):
            batch['status']='running';s.put(db,'batches',batch)
        s.event(db,('自动推进未完成项：' if automatic_followup else '收到回复，继续当前任务：')+text.strip(),job['id'],job['stage'])
        return {'job':job}

    def continuation_input(self, db, job, candidate):
        result=dict(candidate)
        result['conversation']=[m for m in reversed(self.store.all(db,'messages')) if m['candidate_id']==candidate['id']]
        if job.get('auto_followup'):
            result['pending_delivery']=job['auto_followup']
        if job.get('base_version_id'):
            version=self.get(db,'versions',job['base_version_id'])
            result.update(source_path=str(self.repo.artifacts/version['artifact_id']), entry=version['entry'], base_version=version)
        return result
