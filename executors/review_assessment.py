"""Validate submitted review structure, without inventing verification claims."""
from controlplane.delivery_requirements import REQUIRED


def foundation_checks(value):
    if isinstance(value,list) and all(isinstance(item,dict) and len(item)==1 for item in value):
        pairs=[next(iter(item.items())) for item in value]
        if len({key for key,_ in pairs})==len(pairs):value=dict(pairs)
    if not isinstance(value,dict):
        raise ValueError('完成评估缺少 foundation_checks；请依据本轮已执行截图逐项填写，不要重新执行相同操作')
    missing=[]
    for key,label in REQUIRED.items():
        item=value.get(key)
        if not isinstance(item,dict) or item.get('status') not in ('verified','pending','not_applicable') or not isinstance(item.get('reason'),str) or not item['reason'].strip():
            missing.append(key+'（'+label+'）')
        elif item['status']=='not_applicable' and key in ('gameplay','resources','ui'):
            missing.append(key+'（该项不可标记 not_applicable）')
    if missing:
        raise ValueError('完成评估检查表缺项或格式错误：'+', '.join(missing)+'；请只补齐基于实际证据的评估。未验证写 pending，不能补造 verified，不需重复操作')
    return value


def require_complete_checks(value):
    checks=foundation_checks(value)
    pending=[REQUIRED[key]+'：'+checks[key]['reason'] for key in REQUIRED if checks[key]['status']=='pending']
    if pending:
        raise ValueError('当前基础交付检查仍未完成：'+'；'.join(pending)+
            '。沿用已经验证的项目，在本轮仅推进剩余项；交互无进展先查源码前置条件，再选择正常输入复验。'
            '不要只把未完成项写入覆盖边界后宣称complete；确实无法继续时返回complete:false及具体blocker或符合条件的manual_review，不补造verified。')
    return checks
