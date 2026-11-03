"""Expose downstream static constraints during conversion, without submitting."""
from pathlib import Path
from .resource_audit import audit


def inspect(root, report):
    root = Path(root)
    refs = audit(root)
    findings = []
    for key, code in [('missing', 'MISSING_LOCAL_RESOURCE'), ('external', 'EXTERNAL_DEPENDENCY'), ('backend', 'BACKEND_DEPENDENCY')]:
        for row in refs.get(key, []):
            findings.append({'code': code, 'file': row['file'],
                             'reference': row['reference'].split('?')[0].split('#')[0]})
    engine = str(report.get('recovery_kind', ''))
    if 'unity' in engine:
        findings.append({'code': 'TOOLCHAIN_COMPATIBILITY_REQUIRED', 'file': 'index.html'})
    actions = report.get('acceptance_actions') or []
    has_steps = any(a.get('type') == 'key' or a.get('type') == 'click' and a.get('selector') for a in actions)
    if not has_steps:
        findings.append({'code': 'ACCEPTANCE_STEPS_REQUIRED', 'file': 'index.html'})
    return {'schema_version': 1, 'status': 'needs_attention' if findings else 'static_checks_clear',
            'findings': findings[:100], 'finding_count': len(findings),
            'scope': '转换交付前静态提示；不提交供货、不修改验收状态。需在整理后的最终交付包中复验，动态资源与完整玩法另行验证。'}
