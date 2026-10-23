"""Evidence-based read model shared by task, batch and import presentation.

Missing historical telemetry remains unknown. Later milestones do not prove that
an earlier stage ran or passed. This module never mutates persisted history.
"""
from datetime import datetime

STAGES = (
    ('identify', '发现与识别'), ('acquire', '获取代码与资源'),
    ('analysis', '解包与分析'), ('adapt', 'Web 适配'),
    ('test', '运行与玩法验证'), ('repair', 'AI 诊断与修复'), ('delivery', '产物保存与入库'),
    ('review', '人工验收'), ('publish', '发布'),
)
ALIASES = {'rea': 'analysis', 'reconstruct': 'adapt', 'packaging': 'delivery',
           'dependency-analysis': 'adapt'}
STATUSES = {'running', 'succeeded', 'failed', 'waiting_input', 'skipped', 'cancelled'}


def timeline(job, events, versions):
    nodes = {key: dict(key=key, label=label, status='pending', records=[])
             for key, label in STAGES}
    ordered = sorted((e for e in reversed(events) if e.get('job_id') == job['id']),
                     key=lambda e: e.get('created_at', ''))
    current = ALIASES.get(job.get('stage'), job.get('stage'))
    for e in ordered:
        key = e.get('node') or ALIASES.get(e.get('stage'), e.get('stage'))
        # Precisely identified legacy Web verification telemetry, not keyword guessing.
        if not e.get('node') and e.get('message', '').startswith(('平台 Web 验证第', '复用原产物与玩法证据；平台检查')):
            key = 'test'
        if key not in nodes:
            continue
        node = nodes[key]
        record = dict(time=e.get('created_at'), message=e.get('message', ''),
                      status=e.get('node_status', 'recorded'), event_id=e['id'],
                      round=e.get('round'), attempt=e.get('attempt'))
        node['records'].append(record)
        if e.get('round', 1) != job.get('round', 1):
            continue
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
            if current == key:
                current = None
    own = [v for v in versions if v.get('job_id') == job['id']]
    latest = next((v for v in own if v['id'] == job.get('version_id')), None)
    current_version = latest and latest.get('round', 1) == job.get('round', 1) and not (
        job.get('continuation') and latest['id'] == job.get('base_version_id') and job.get('status') in ('queued','running'))
    if current_version:
        nodes['delivery'].update(status='draft_saved' if latest.get('status')=='draft' else 'succeeded', ended_at=latest.get('created_at'),
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
    if status in ('blocked','failed','waiting_input') and (
            current is None or nodes.get(current,{}).get('status') not in ('running','failed','waiting_input')):
        unresolved = [e for e in ordered if (e.get('round') or 1)==job.get('round',1)
                      and e.get('node_status') in ('failed','waiting_input')
                      and e.get('node') in nodes and nodes[e['node']]['status'] in ('failed','waiting_input')]
        current=unresolved[-1]['node'] if unresolved else ALIASES.get(job.get('stage'),job.get('stage'))
    if status in ('blocked', 'failed') and not any(
            n['status']=='failed' for n in nodes.values()) and (job.get('dependency_pending') or
            (latest and latest.get('status') == 'draft')):
        current = 'test' if latest and latest.get('report', {}).get('runtime_verified') else 'adapt'
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
        # A round or parent step ending cannot leave a child step executing forever.
        # Absence of an end event is NOT proof that verification passed.
        if node['status'] == 'running' and (status != 'running' or node['key'] != current):
            node['status'] = 'recorded'
            node['reason'] = '该步骤已不在执行；历史记录未提供独立结束结果。'
        if node['status'] == 'pending' and node['records']:
            node['status'] = 'recorded'
        if node['status']=='pending' and status in ('completed','review','failed','blocked','cancelled','stopped'):
            node['status']='unrecorded'
        start, end = node.get('started_at'), node.get('ended_at')
        if start and end:
            try:
                node['duration_seconds'] = max(0, int((datetime.fromisoformat(end) - datetime.fromisoformat(start)).total_seconds()))
            except ValueError:
                pass
    if status in ('completed','cancelled','stopped','superseded'):
        current = None
    from .pipeline_presentation import describe_pipeline
    presentation = describe_pipeline(job, list(nodes.values()), current)
    return dict(current=current, nodes=list(nodes.values()), presentation=presentation,
                note='节点状态对应当前轮次，展开可查看历史轮次记录；保存草稿不代表验证通过，未记录结果不推定成功。')


def progress_summary(job, versions):
    """Milestones, never an invented estimate of remaining time or AI actions."""
    version = next((v for v in versions if v['id'] == job.get('version_id')), None)
    status = job.get('status')
    if status == 'queued':
        return '排队中 · 复用已有版本' if version else '排队中'
    if status == 'completed':
        return '已验收完成'
    if status == 'review':
        return '转换完成 · 待人工验收'
    if status == 'running':
        pipe = job.get('pipeline', {})
        node = next((n for n in pipe.get('nodes', []) if n['key'] == pipe.get('current')), {})
        return (node.get('label') or '转换处理') + '中'
    if version and version.get('status') == 'draft':
        return '已有可试玩草稿 · 验证未完成'
    return {'blocked':'待处理阻断项','failed':'执行失败','waiting_input':'等待补充信息','stopped':'已停止','cancelled':'已取消'}.get(status, '等待处理')
