"""Version-bound V5.1 rendering; historical backfills use metadata revisions."""

SECTIONS = {
    'basic_facts': '基础事实',
    'asset_types': '资源类型',
    'core_challenge': '核心挑战维度',
    'controls': '操控方式',
    'behavior_path': '行为路径',
    'game_path': '游戏路径（关键节点 + 流失风险）',
    'progression_path': '成长路径',
    'core_loop': '核心闭环（目标-规则-反馈-激励）',
    'gameplay_rules': '玩法规则',
    'key_numbers': '数值配置',
    'level_configuration': '关卡配置',
    'system_design': '系统设计',
    'theme': '主题化包装',
    'progression_economy': '养成系统 + 经济系统',
    'roster': '角色 / 单位设定',
    'monetization': '商业化',
}

# Definitions follow the user's V5.1 attachment. Empty facts remain empty; the
# template structure must not disappear merely because a fact is unknown.
DEFINITIONS = dict(zip(SECTIONS, (
    '让读者第一眼知道“这是什么类型、什么操控体验的游戏”，以及它的技术栈。',
    '游戏中游戏内容元素的资源类型是什么——即在哪个引擎运行下的资源格式。',
    '游戏核心玩法主要挑战 / 满足人的什么。',
    '操控本身的复杂度 + 需要玩家判断的时机 / 策略复杂度。',
    '玩家一局里重复做什么。',
    '从开始到结束的流程 + 每个关键节点的潜在流失风险点。',
    '玩家如何推进变强。',
    '游戏是否具备“明确目标 → 明确规则 → 达成反馈 → 奖励激励 → 下一目标”的完整闭环。',
    '核心循环、玩法规则、目标与进度。',
    '影响玩法的关键数值。',
    '关卡结构、递进规律、难度曲线。',
    '功能系统清单、UI 流程。',
    '游戏的题材 / 世界观包装。',
    '玩家如何成长、经济如何循环。',
    '有哪些角色/单位、各自定位（玩法层面）。',
    '靠什么变现。',
)))

INSTRUCTIONS = '''
后续新编写的游戏规格说明书采用用户指定V5.1标准，写入game_profile.specification：
{"template_version":"5.1","sections":{...}}。sections的字段为：''' + '、'.join(SECTIONS) + '''。
事实字段均非必填；说明书始终保留16维度和每维的“维度定义”“内容说明”，未知内容留空。每个值为中文Markdown字符串，只客观列出代码、配置、资源或实机可以佐证的内容要素，并给出来源定位。
只还原实现事实，不猜测设计意图、不作无证据评价。模板示例不是游戏事实。未知留空或省略，不填“未登记”凑完整率。
核心闭环详细说明已实现的目标、规则、反馈、激励与下一目标。没有实测时长不编时间轴，没有证据不写流失风险或APP适配结论。
不虚构角色、资源数量、商业化或成长经济；原版实现与本地适配差异明确分开。平台旧元数据字段单独维护，不直接拼成新规格正文。
用户已要求统一补齐旧说明书。历史说明书通过版本绑定的规格档案修订迁移，保留原事实、历史记录和运行归档，不以格式补齐冒充新增试玩或验收。
'''


def normalize_specification(value):
    if not isinstance(value, dict) or value.get('template_version') != '5.1':
        raise ValueError('规格模板版本须为5.1')
    sections = value.get('sections', {})
    if not isinstance(sections, dict) or any(key not in SECTIONS for key in sections):
        raise ValueError('规格维度无效')
    clean = {}
    for key, text in sections.items():
        if not isinstance(text, str) or len(text) > 20000:
            raise ValueError('规格维度须为文本且不超过20000字：' + key)
        if text.strip():
            clean[key] = text.strip()
    return {'template_version': '5.1', 'sections': clean}


def section_markdown(key, text=''):
    """Retain already-structured historical text without nesting it twice."""
    if '**维度定义**' in text and '**内容说明**' in text:
        return text
    parts = ['**维度定义**：' + DEFINITIONS[key], '**内容说明**']
    if text:
        parts.append(text)
    return '\n\n'.join(parts)


def document(title, facts):
    spec = facts.get('specification_v51')
    if spec is None and isinstance(facts.get('specification'), dict):
        spec = facts['specification']
    if not isinstance(spec, dict) or spec.get('template_version') != '5.1':
        return None
    spec = normalize_specification(spec)
    parts = ['# ' + title + ' 游戏规格说明书', '格式版本：V5.1',
             '仅记录有依据的实现层事实；内容字段非必填，未知留空，不代表不存在或已经验证。']
    for number, (key, label) in enumerate(SECTIONS.items(), 1):
        parts.extend([f'## {number}. {label}',
                      section_markdown(key, spec['sections'].get(key, ''))])
    return '\n\n'.join(parts) + '\n'

