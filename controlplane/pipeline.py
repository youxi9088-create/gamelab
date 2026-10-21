"""Evidence-based read model shared by task, batch and import presentation.

Missing historical telemetry remains unknown. Later milestones do not prove that
an earlier stage ran or passed. This module never mutates persisted history.
"""
from datetime import datetime

STAGES = (
    ('identify', '发现与识别'), ('acquire', '获取代码与资源'),
    ('analysis', '解包与分析'), ('adapt', 'Web 适配'),
    ('test', '运行测试'), ('delivery', '整理与入库'),
    ('review', '人工验收'), ('publish', '发布'),
)
ALIASES = {'rea': 'analysis', 'reconstruct': 'adapt', 'packaging': 'delivery',
           'dependency-analysis': 'adapt'}
STATUSES = {'running', 'succeeded', 'failed', 'waiting_input', 'skipped', 'cancelled'}


def timeline(job, events, versions):
    nodes = {key: dict(key=key, label=label, status='pending', records=[])
             for key, label in STAGES}
    ordered = sorted((e for e in events if e.get('job_id') == job['id']),
                     key=lambda e: e.get('created_at', ''))
    current = ALIASES.get(job.get('stage'), job.get('stage'))
    for e in ordered:
        key = e.get('node') or ALIASES.get(e.get('stage'), e.get('stage'))
        if key not in nodes:
            continue
        node = nodes[key]
        record = dict(time=e.get('created_at'), message=e.get('message', ''),
                      status=e.get('node_status', 'recorded'), event_id=e['id'],
                      round=e.get('round'), attempt=e.get('attempt'))
        node['records'].append(record)
        # Legacy free-text logs are evidence of activity, not proof of success.
        if e.get('node_status'):
            node['status'] = e['node_status']
        elif node['status'] == 'pending':
            node['status'] = 'recorded'
        if e.get('node_status') == 'running':
            node['started_at'] = e.get('created_at')
            node.pop('ended_at', None)
            current = key
        elif e.get('node_status') in ('succeeded', 'failed', 'skipped', 'cancelled'):
            node['ended_at'] = e.get('created_at')
    own = [v for v in versions if v.get('job_id') == job['id']]
    latest = next((v for v in own if v['id'] == job.get('version_id')), None)
    if latest:
        nodes['delivery'].update(status='succeeded', ended_at=latest.get('created_at'),
                                 version_id=latest['id'])
        if latest.get('status') == 'review':
            nodes['review']['status'] = 'waiting_input'
            nodes['review']['started_at'] = latest.get('created_at')
            current = 'review'
        if latest.get('approved_at'):
            nodes['review'].update(status='succeeded', ended_at=latest['approved_at'])
            current = 'review'
        if latest.get('status') == 'published':
            nodes['publish'].update(status='succeeded', ended_at=latest.get('published_at'))
            current = 'publish'
    status = job.get('status')
    if status in ('blocked', 'failed') and (job.get('dependency_pending') or
            (latest and latest.get('status') == 'draft')):
        current = 'adapt'
    if current in nodes and status in ('running', 'waiting_input', 'blocked', 'failed', 'cancelled', 'stopped'):
        nodes[current]['status'] = {'blocked': 'blocked', 'stopped': 'cancelled'}.get(status, status)
        nodes[current]['reason'] = job.get('question') or job.get('reason', '')
    # A new continuation is queued; do not present the old version as its result.
    if status == 'queued':
        current = None
    if job.get('continuation') and status in ('queued', 'running'):
        # Acceptance of the base version is history, not approval of this round.
        if latest and latest['id'] == job.get('base_version_id'):
            nodes['review']['status'] = 'recorded'
            nodes['publish']['status'] = 'recorded' if latest.get('published_at') else 'pending'
    for node in nodes.values():
        start, end = node.get('started_at'), node.get('ended_at')
        if start and end:
            try:
                node['duration_seconds'] = max(0, int((datetime.fromisoformat(end) - datetime.fromisoformat(start)).total_seconds()))
            except ValueError:
                pass
    return dict(current=current, nodes=list(nodes.values()),
                note='未记录的阶段不推定为成功；耗时仅展示有起止记录的阶段。')
