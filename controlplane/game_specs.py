"""Versioned, evidence-backed gameplay contracts shared by all delivery paths."""
import hashlib
import json
import re


def normalize(value):
    if not isinstance(value, dict):
        raise ValueError('游戏规格必须为对象')
    result = {}
    for key in ('title', 'category', 'scope'):
        text = value.get(key)
        if not isinstance(text, str) or not 1 <= len(text.strip()) <= 2000:
            raise ValueError('游戏规格缺少 '+key)
        result[key] = text.strip()
    for key in ('controls', 'mechanics', 'states', 'unknowns', 'dependencies', 'reuse'):
        items = value.get(key, [])
        if not isinstance(items, list) or len(items) > 100 or any(not isinstance(x, str) or len(x) > 4000 for x in items):
            raise ValueError('规格列表无效：'+key)
        result[key] = items
    evidence = value.get('evidence', [])
    if not isinstance(evidence, list) or not evidence or any(not isinstance(x, str) or not x.strip() for x in evidence):
        raise ValueError('游戏规格需要来源证据')
    result['evidence'] = evidence
    cases = value.get('cases')
    if not isinstance(cases, list) or not 1 <= len(cases) <= 50:
        raise ValueError('需要 1–50 个验收用例')
    seen = set()
    result['cases'] = []
    for case in cases:
        if not isinstance(case, dict) or not re.fullmatch(r'[a-zA-Z0-9_-]{1,64}', str(case.get('id', ''))) or case['id'] in seen:
            raise ValueError('用例 ID 无效或重复')
        seen.add(case['id'])
        if case.get('mode') not in ('browser', 'manual', 'blocked') or not isinstance(case.get('expected'), str) or not case['expected'].strip():
            raise ValueError('用例必须声明执行模式与预期结果')
        steps = case.get('steps', [])
        if not isinstance(steps, list) or len(steps) > 40:
            raise ValueError('用例步骤过多或格式无效')
        if case['mode'] == 'browser':
            if not steps or not any(isinstance(s,dict) and s.get('type','').startswith('expect_') for s in steps):
                raise ValueError('自动用例必须包含可执行断言')
        result['cases'].append(dict(id=case['id'], mode=case['mode'], expected=case['expected'],
                                   reason=str(case.get('reason', ''))[:2000], steps=steps))
    result['digest'] = digest(result)
    return result


def digest(spec):
    body = {k:v for k,v in spec.items() if k not in ('digest','revision','updated_at')}
    return hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()


def verification_gaps(spec, report):
    """Do not confuse successful loading with complete contract coverage."""
    if not spec:
        return []
    gaps = []
    if spec.get('unknowns'):
        gaps.append('游戏规格仍有未确认项')
    if not isinstance(report, dict) or report.get('spec_digest') != digest(spec):
        return gaps+['缺少与当前规格匹配的自动测试报告']
    results = {r.get('id'): r for r in report.get('cases', []) if isinstance(r, dict)}
    for case in spec.get('cases', []):
        row = results.get(case['id'], {})
        if row.get('status') != 'passed' or not row.get('evidence'):
            gaps.append('规格用例未通过：'+case['id'])
    if report.get('runtime_errors'):
        gaps.append('规格测试存在运行错误')
    return gaps


def test_report(report):
    return report.get('spec_tests') or (report.get('runtime_smoke') or {}).get('spec_tests')
