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

# Catalog labels describe gameplay, never engine, dimension or source platform.
GENRES = [
 ('射击', r'射击|shooter|shoot.em.up'), ('竞速', r'竞速|赛车|racing'),
 ('驾驶', r'驾驶|driving'), ('跑酷', r'跑酷|endless runner'),
 ('解谜', r'解谜|益智|数独|扫雷|puzzle|sudoku|minesweeper'),
 ('塔防', r'塔防|tower defense'), ('合成', r'合成|merge'),
 ('音乐节奏', r'节奏|音游|rhythm'), ('模拟经营', r'经营|management|tycoon'),
 ('生存', r'生存|survival'), ('体育', r'体育|足球|篮球|冰球|高尔夫|保龄球|台球|sports|football|hockey|golf|bowling|billiards'),
 ('卡牌', r'卡牌|纸牌|card game|cribbage'), ('棋类', r'棋类|象棋|chess'),
 ('平台跳跃', r'平台跳跃|平台动作|平台探索|platformer'),
 ('互动剧情', r'视觉小说|互动小说|文字冒险|互动剧情|叙事冒险|visual novel|interactive fiction'),
 ('角色扮演', r'角色扮演|\brpg\b'), ('策略', r'策略|战略|strategy'),
 ('动作', r'动作|格斗|乱斗|brawler|fighting'), ('冒险', r'冒险|探险|探索|adventure'),
 ('模拟', r'模拟|simulation'), ('沙盒', r'沙盒|sandbox'), ('竞技', r'竞技|派对|arena|party'),
 ('休闲', r'休闲|casual'),
]


def canonical_categories(value):
    text=str(value or '').strip()
    found=[name for name,pattern in GENRES if re.search(pattern,text,re.I)]
    if len(found)>1:
        found=[n for n in found if n!='休闲']
        if len(found)>1:found=[n for n in found if n!='竞技']
    if '竞速' in found:found=[n for n in found if n!='驾驶']
    if '模拟经营' in found:found=[n for n in found if n!='模拟']
    if '棋类' in found:found=[n for n in found if n!='策略']
    return ' / '.join(found[:3])


def category_projection(candidate, versions=()):
    raw=str(candidate.get('category') or '').strip()
    if candidate.get('category_edited') or candidate.get('category_source') in ('manual','verified'):
        return {'name':raw or '待分类','source':'已确认分类','evidence':raw}
    matching=sorted((v for v in versions if candidate.get('id') and v.get('candidate_id')==candidate['id']),
                    key=lambda v:(v.get('created_at',''),v.get('id','')),reverse=True)
    # Version-bound profiles are the actual location of executor gameplay facts.
    # A blank draft must not hide a preceding version's known classification.
    for version in matching:
        report=version.get('report') or {}
        records=[version.get('game_profile'),report.get('game_profile'),report.get('game_spec'),report]
        for record in records:
            if not isinstance(record,dict):continue
            for key in ('category','gameplay_category','genre'):
                value=record.get(key)
                name=canonical_categories(value)
                if name:
                    return {'name':name,'source':'版本玩法报告','evidence':str(value)[:600],
                            'version_id':version.get('id'),'field':key}
    obs=candidate.get('observations') or {}
    for key in ('gameplay_category','genre','category'):
        name=canonical_categories(obs.get(key)) if isinstance(obs,dict) else ''
        if name:return {'name':name,'source':'采集玩法分析','evidence':str(obs[key])[:600]}
    if raw not in ('休闲','待分类','未分类'):
        name=canonical_categories(raw)
        if name:return {'name':name,'source':'来源分类','evidence':raw}
    # Operational summaries may mention unverified features or failure hypotheses;
    # only explicit gameplay descriptions may provide a fallback.
    text=candidate.get('description') or ''
    if not re.search(r'不是|并非|不属于|not a ',text,re.I):
        found=[name for name,pattern in RULES if re.search(pattern,text,re.I)]
        if found:return {'name':' / '.join(found),'source':'来源玩法说明','evidence':text[:600]}
    return {'name':'待分类','source':'缺少玩法分类证据','evidence':'未将默认休闲视为分析结论'}
