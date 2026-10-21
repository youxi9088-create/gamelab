"""Explainable discovery triage, not a claim of gameplay quality."""
def score(item):
    signals=[
        ('页面已取得校验摘要',bool(item.get('content_sha256')),25),
        ('来源给出可识别品类',item.get('category') not in (None,'','未识别','未分类'),15),
        ('平台缺少该品类',bool(item.get('platform_category_missing')),20),
        ('来源提供玩法文字',len(str(item.get('gameplay','')).strip())>=40,25),
        ('具有分类依据',bool(item.get('category_basis')),15),
    ]
    return {'value':sum(weight for _,present,weight in signals if present),
            'basis':[{'reason':name,'met':present,'weight':weight} for name,present,weight in signals],
            'scope':'来源信息完整度与品类缺口；未试玩，不代表游戏品质或移植成功率'}
