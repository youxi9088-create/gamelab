"""Human-readable stage explanations, derived without changing execution history."""

STAGE_WORK = {
    'identify': ('确认游戏入口与类型', '检查链接指向什么游戏、入口在哪里、采用哪种运行方式。'),
    'acquire': ('取得游戏文件', '获取网页、脚本、图片和运行资源，保存可继续处理的材料。'),
    'analysis': ('确定转换方案', '分析代码、引擎和外部依赖，决定如何转换或继续已有版本。'),
    'adapt': ('制作可运行的网页版本', '适配运行入口和宿主，处理浏览器兼容及必要的代码修改。'),
    'test': ('实际试玩并核对结果', '运行游戏，正常进入可交互的新手引导或正式玩法；记录操作反馈及实际验证范围，无需一定进入第一关。'),
    'repair': ('AI 诊断与修复', '出现问题时由 AI 分析证据、尝试修复，再检查修复是否有效；按需触发。'),
    'delivery': ('保存本轮交付版本', '保存游戏文件、截图与验证记录，生成可查看和试玩的版本。'),
    'review': ('由人确认交付效果', '人工试玩并确认玩法和画面；可以通过验收或提出修改要求。'),
    'publish': ('发布已验收版本', '验收后按发布条件发布版本；下游供货的处理状态单独记录。'),
}

LABELS = {
    'succeeded': ('complete', '✓ 已完成'), 'running': ('active', '● 进行中'),
    'failed': ('issue', '！执行失败'), 'blocked': ('issue', '！遇到阻断'),
    'waiting_input': ('waiting', '待处理'), 'draft_saved': ('incomplete', '草稿已保存 · 未完成'),
    'cancelled': ('stopped', '已停止'), 'skipped': ('optional', '已跳过'),
    'pending': ('pending', '尚未开始'), 'unrecorded': ('unknown', '缺少阶段结论'),
    'recorded': ('unknown', '有记录 · 结果未确认'),
}


def record_summary(record, key):
    action = STAGE_WORK[key][0]
    status, message = record.get('status'), record.get('message', '')
    if status == 'running':
        return '正在' + action + '。'
    if status == 'succeeded':
        return action + '：本次步骤已完成。'
    if status == 'failed':
        return action + '：本次未完成，失败原因保留在详细记录中。'
    if status == 'waiting_input':
        return action + '：本段已结束，等待后续处理或最终检查结论。'
    if status in ('skipped', 'cancelled'):
        return action + ('：本次已跳过。' if status == 'skipped' else '：本次已停止。')
    if message.startswith('平台 Web 验证第'):
        return '已保存本次试玩证据，交给 AI 判断检查结果和下一步操作。'
    if message.startswith('分流选择：沿已有版本续作'):
        return '继续处理已有版本，复用之前保存的游戏产物。'
    if message.startswith('执行器已开始真实处理'):
        return '执行器已领取任务，开始处理这一轮要求。'
    if message.startswith(('本轮结果：', '阶段结束：')):
        return '本轮处理结果已记录，可展开阅读完成内容和验证范围。'
    return message[:160] + ('…' if len(message) > 160 else '')


def describe_node(node, job, current):
    key, status = node['key'], node['status']
    title, work = STAGE_WORK[key]
    group, label = LABELS.get(status, ('unknown', '结果未确认'))
    this_round = job.get('round', 1)
    records = node['records']
    current_records = [r for r in records if (r.get('round') or 1) == this_round]
    old_results = [r for r in records if (r.get('round') or 1) < this_round and r.get('status') in ('succeeded','failed','cancelled','skipped')]
    previous = old_results[-1] if old_results else None
    result = {
        'succeeded': '该阶段已有明确的完成记录；具体检查范围见详细记录。',
        'running': '正在执行，尚未取得本次完成结果。',
        'failed': '本次执行失败，尚未完成这个阶段。',
        'blocked': '遇到阻断，当前任务无法继续。',
        'waiting_input': '这个阶段尚未完成，需要后续处理。',
        'draft_saved': '已保留可继续处理的草稿，验证与交付要求仍未全部完成。',
        'pending': '还没有开始这个阶段。',
        'unrecorded': '没有独立的阶段结果记录，无法确认是否完成。',
        'recorded': '已有操作记录，但没有本轮独立的完成结论。',
        'cancelled': '本次执行已停止，未将停止当作完成。',
        'skipped': '本轮明确跳过此阶段，跳过原因见详细记录。',
    }.get(status, '阶段结果尚未确认。')
    next_action = {
        'complete': '可查看完成依据。', 'active': '等待执行结果，页面会自动更新。',
        'issue': '查看问题原因，在“沟通与操作”中补充要求或重试。',
        'waiting': '查看任务提示，完成需要的处理。',
        'incomplete': '继续处理剩余检查，复用已保存的版本。',
        'unknown': '查看详细记录；缺少记录本身不表示需要从头重跑。',
        'pending': '等待前置步骤完成。', 'optional': '继续查看其他阶段。',
        'stopped': '需要继续时，在“沟通与操作”中提交要求。',
    }[group]
    if key == 'review' and status == 'waiting_input':
        label, result, next_action = '待人工验收', '转换产物已提交，等待人工确认玩法和画面。', '打开“交付版本”试玩，然后验收或提出修改要求。'
    elif status == 'waiting_input' and job.get('status') == 'waiting_input' and current == key:
        label, next_action = '等待补充信息', '在“沟通与操作”中回答 AI 的问题。'
    elif status == 'waiting_input':
        label = '检查未完成'
    if key == 'repair' and not current_records and current != key:
        group, label = 'optional', '本轮未触发修复'
        result, next_action = '本轮没有启动独立的 AI 修复步骤。', '仅在遇到问题时触发，不属于漏做的必经步骤。'
    elif key == 'publish' and status in ('pending','unrecorded','recorded'):
        group, label = 'pending', '尚未发布'
        result, next_action = '尚无本轮版本发布成功的记录。', '验收完成且满足发布条件后，再执行发布。'
    elif key == 'review' and status in ('pending','unrecorded'):
        group, label = 'pending', '尚未进入验收'
        result, next_action = '还没有提交本轮可验收版本。', '等待转换与验证完成后再人工验收。'
    elif status in ('recorded','unrecorded','pending') and previous and previous['status'] == 'succeeded' and not any(r.get('status') in ('running','failed','waiting_input') for r in current_records):
        group, label = 'history', '此前已完成 · 本轮无新结论'
        result = f"第 {previous.get('round') or 1} 轮有明确完成记录；本轮未记录新的独立完成结论。"
        next_action = '可展开查看此前完成依据；不会据此要求重新执行。'
    if status in ('failed','blocked','waiting_input') and key not in ('review','publish') and job.get('status') in ('completed','review'):
        group, label = 'history', '曾有未完成记录 · 本轮已结束'
        result, next_action = '这里保留阶段中途的问题；任务最终结果已进入验收。', '以最终验证结果及交付范围为准，旧问题保留供追溯。'
    previous_text = None
    if previous:
        previous_text = f"第 {previous.get('round') or 1} 轮：" + {'succeeded':'已完成','failed':'执行失败','cancelled':'已停止','skipped':'已跳过'}[previous['status']]
    problem = node.get('reason') or next((r['message'] for r in reversed(current_records) if r.get('status')=='failed'),None)
    if not problem and key=='test':
        problem = '；'.join(job.get('auto_followup',{}).get('gaps',[])) or None
    return dict(title=title, work=work, group=group, label=label, result=result,
                next_action=next_action, previous=previous_text,
                problem=problem if group in ('issue','waiting') else None)


def describe_pipeline(job, nodes, current):
    for node in nodes:
        node['presentation'] = describe_node(node, job, current)
        for record in node['records']:
            record['summary'] = record_summary(record, node['key'])
    active = next((n for n in nodes if n['key'] == current), None)
    state = job.get('status')
    headline = {
        'completed': '人工验收已完成', 'review': '转换已完成，等待人工验收',
        'queued': '任务正在排队', 'blocked': '任务遇到阻断，需要处理',
        'failed': '本轮执行失败，需要处理', 'waiting_input': '等待补充信息',
        'stopped': '任务已停止', 'cancelled': '任务已取消',
    }.get(state, '正在' + active['presentation']['title'] if active else '等待阶段结果')
    counts = {g: sum(n['presentation']['group'] == g for n in nodes) for g in ('complete','active','issue','waiting','pending','incomplete','unknown','history','optional','stopped')}
    return dict(headline=headline, counts=counts,
                current_title=active['presentation']['title'] if active else None,
                location_label={'completed':'已完成验收','review':'人工验收','queued':'排队等待执行','cancelled':'已取消','stopped':'已停止','superseded':'已由后续任务接续'}.get(state, active['presentation']['title'] if active else '阶段结果待确认'),
                problem=active['presentation']['problem'] if active else None,
                next_action=('打开交付版本试玩并验收。' if state=='review' else
                             '可查看交付版本；发布与供货状态单独确认。' if state=='completed' else
                             '等待执行器领取，保留已有产物。' if state=='queued' else
                             active['presentation']['next_action'] if active else '查看阶段记录与任务提示。'))
