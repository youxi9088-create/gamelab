"""Evidence checklist for a playable first version, shared by delivery paths.

This validates completeness of submitted evidence, not visual equivalence.
Human gameplay acceptance is still required.
"""
REQUIRED={'gameplay':'基础玩法','resources':'基础资源','scene':'场景','objects':'物件','characters':'角色','animation':'动作','ui':'UI 界面'}

def delivery_gaps(report,files):
    checks=report.get('foundation_checks',{})
    if not isinstance(checks,dict):checks={}
    available=set(files);gaps=[]
    for key,label in REQUIRED.items():
        item=checks.get(key,{})
        if not isinstance(item,dict):item={}
        status=item.get('status')
        if status=='not_applicable' and key not in ('gameplay','resources','ui') and item.get('reason'):
            continue
        evidence=item.get('evidence',[])
        if status!='verified' or not isinstance(evidence,list) or not evidence or not all(isinstance(p,str) and p in available for p in evidence):
            gaps.append(label+'：'+str(item.get('reason') or '缺少实现或验证证据'))
    if not report.get('runtime_verified'):gaps.append('浏览器运行：未通过验证')
    if 'dependencies' in report:
        from .dependencies import normalize, gaps as dependency_gaps
        try:gaps.extend(dependency_gaps(normalize(report['dependencies'])))
        except ValueError:gaps.append('依赖清单格式无效')
    if report.get('game_spec'):
        from .game_specs import verification_gaps, test_report
        gaps.extend(verification_gaps(report['game_spec'],test_report(report)))
    return gaps

def require_delivery(report,files):
    gaps=delivery_gaps(report,files)
    if gaps:raise ValueError('基础还原未完成；'+'；'.join(gaps))
