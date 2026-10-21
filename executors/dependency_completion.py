"""Apply evidence-linked dependency assessments without changing identity or losing items."""
import copy
from controlplane.dependencies import normalize

def assessed_dependencies(current,updates,available,runtime_verified):
    if not updates:return None
    if runtime_verified is not True:raise ValueError('Dependency assessment requires executed runtime evidence')
    if not isinstance(updates,list) or len(updates)>50:raise ValueError('Invalid dependency assessment list')
    result=copy.deepcopy(normalize(current));items={i['id']:i for i in result['items']};seen=set()
    for update in updates:
        key=update.get('id')
        if key not in items or key in seen:raise ValueError('Unknown or duplicate dependency assessment')
        seen.add(key)
        if update.get('status') not in ('verified','not_applicable'):raise ValueError('Unsupported dependency assessment')
        if not isinstance(update.get('reason'),str) or not update['reason'].strip():raise ValueError('Dependency assessment needs an evidence-based explanation')
        if not isinstance(update.get('evidence'),str) or update['evidence'] not in available:raise ValueError('Dependency evidence must exist in this delivery')
        items[key].update(status=update['status'],reason=update['reason'],evidence=update['evidence'],next_action='')
    return normalize(result)
