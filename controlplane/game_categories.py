"""Evidence-based genre projection; never infer genre from a game title."""
import re

RULES = [
 ('射击', r'第一人称射击|第三人称射击|射击游戏|first.person shooter|third.person shooter'),
 ('赛车', r'赛车游戏|驾驶竞速|racing game|car racing'),
 ('跑酷', r'跑酷|endless runner'),
 ('解谜', r'解谜|数独|sudoku|puzzle game'),
 ('塔防', r'塔防|tower defense'),
 ('合成', r'合成游戏|merge game'),
 ('音乐节奏', r'音乐节奏|rhythm game'),
 ('模拟经营', r'模拟经营|经营模拟|management simulation'),
 ('生存', r'生存游戏|survival game'),
 ('体育', r'高尔夫|保龄球|golf game|bowling game'),
 ('卡牌', r'卡牌游戏|card game'),
 ('平台跳跃', r'平台跳跃|platformer'),
]

def category_projection(candidate, versions=()):
    raw=str(candidate.get('category') or '').strip()
    if candidate.get('category_edited') or (raw and raw not in ('休闲','未分类','待分类')):
        return {'name':raw or '待分类','source':'用户或来源分类','evidence':raw}
    reports=[v.get('report') or {} for v in sorted(versions,key=lambda v:v.get('created_at',''),reverse=True)
             if v.get('candidate_id')==candidate.get('id')]
    obs=candidate.get('observations') or {}
    for label,record in [('采集玩法分析',obs), *[('版本玩法报告',r) for r in reports]]:
        if not isinstance(record,dict):continue
        for key in ('gameplay_category','genre','category'):
            value=record.get(key)
            if isinstance(value,str) and value.strip() and value.strip() not in ('休闲','未分类','待分类'):
                return {'name':value.strip()[:80],'source':label,'evidence':key}
    texts=[('来源玩法说明',candidate.get('description',''))]
    for r in reports:
        if isinstance(r,dict):
            for key in ('gameplay_description','gameplay','summary'):
                if isinstance(r.get(key),str):texts.append(('版本玩法报告',r[key]))
    for source,text in texts:
        matches=[(name,re.search(pattern,text,re.I)) for name,pattern in RULES]
        found=[(name,m.group()) for name,m in matches if m]
        if found:return {'name':' / '.join(dict.fromkeys(n for n,_ in found)), 'source':source,'evidence':'、'.join(e for _,e in found)}
    if raw=='休闲' and candidate.get('category_source') in ('manual','verified'):
        return {'name':raw,'source':'已确认分类','evidence':raw}
    return {'name':'待分类','source':'缺少玩法分类证据','evidence':'未将默认休闲视为分析结论'}
