"""Dependency evidence is distinct from runnable output and gameplay acceptance."""
KINDS = {'code': '代码与引擎', 'resources': '资源', 'data': '配置数据',
         'backend': '后端服务', 'platform': '平台接口'}
STATUSES = {'unknown', 'available', 'missing', 'rebuild', 'verified', 'not_applicable'}


def normalize(value):
    if not isinstance(value, dict) or not isinstance(value.get('items'), list):
        raise ValueError('依赖清单需要 items 数组')
    if not 1 <= len(value['items']) <= 500:
        raise ValueError('依赖清单需要 1–500 项')
    items, ids = [], set()
    for raw in value['items']:
        if not isinstance(raw, dict):
            raise ValueError('依赖项必须为对象')
        item = {k: str(raw.get(k, '')).strip() for k in
                ('id', 'name', 'kind', 'status', 'reason', 'evidence', 'next_action')}
        if not item['id'] or item['id'] in ids or len(item['id']) > 100:
            raise ValueError('依赖 ID 缺失或重复')
        if not item['name'] or len(item['name']) > 200 or item['kind'] not in KINDS or item['status'] not in STATUSES:
            raise ValueError('依赖名称、分类或状态无效')
        if any(len(item[k]) > 4000 for k in ('reason', 'evidence', 'next_action')):
            raise ValueError('依赖说明过长')
        if item['status'] in ('available', 'verified') and not item['evidence']:
            raise ValueError('已取得或已验证的依赖需要证据')
        if item['status'] == 'not_applicable' and not item['reason']:
            raise ValueError('不适用的依赖需要说明')
        ids.add(item['id']); items.append(item)
    scope = str(value.get('scope', '')).strip()
    if not scope or len(scope) > 2000:
        raise ValueError('请说明依赖分析范围及限制')
    return {'items': items, 'scope': scope}


def summary(value):
    items = value.get('items', []) if isinstance(value, dict) else []
    missing_kinds = [label for key, label in KINDS.items() if not any(i['kind'] == key for i in items)]
    unresolved = [i for i in items if i['status'] not in ('verified', 'not_applicable')]
    return {'total': len(items), 'verified': sum(i['status'] == 'verified' for i in items),
            'unresolved': len(unresolved), 'missing_categories': missing_kinds,
            'ready': bool(items) and not unresolved and not missing_kinds}


def gaps(value):
    info = summary(value)
    result = ['依赖分析未覆盖：' + label for label in info['missing_categories']]
    for item in (value or {}).get('items', []):
        if item['status'] not in ('verified', 'not_applicable'):
            result.append('依赖待处理：' + item['name'] + ' · ' + (item['next_action'] or item['reason'] or item['status']))
    return result
