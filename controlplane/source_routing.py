"""Source identity shared by first conversion and retries; titles are not routing keys."""
import re
from urllib.parse import urlsplit


def modular_candidate(observation):
    leads=observation.get('web_discovery',{}).get('iframe_hints',[])
    urls={r['url'] for r in leads if isinstance(r,dict) and r.get('evidence')=='iframe-src'
          and r.get('width',0)>200 and r.get('height',0)>150
          and urlsplit(r.get('url','')).scheme=='https'
          and (urlsplit(r['url']).hostname or '').endswith('.games.remix.gg')}
    return next(iter(urls)) if len(urls)==1 else None


def source_kind(url, observations=None):
    o=observations if isinstance(observations,dict) else {}
    source=str(url).strip()
    if source.startswith('#小程序://'):
        return 'wechat'
    # A browser page may contain unrelated AppIDs from ads, analytics or
    # embedded widgets. The submitted HTTP(S) source remains the game identity.
    if urlsplit(source).scheme.lower() in ('http','https'):
        return 'web'
    ids=[o.get('appid',''),*(o.get('appids') or [])]
    if any(isinstance(i,str) and re.fullmatch(r'wx[0-9a-fA-F]{16}',i) for i in ids):
        return 'wechat'
    return 'unknown'


def web_block_reason(observations):
    if observations.get('web_source'):
        return '已提取原网页内嵌游戏 HTML 与配置，保存在本轮采集目录 web-source。仍需下载远程资源、适配网页宿主接口并验证完整玩法；当前未登记对应 Web 适配器，不能开始自动重建。'
    discovery=observations.get('web_discovery',{})
    entries=discovery.get('entries',[])
    if entries:
        return '已识别网页游戏运行入口，但尚未完成资源闭合与宿主接口适配：'+entries[0]['url']+'。入口及请求证据已保存；需要 Web 适配方案。'
    action=discovery.get('launch_action',{})
    if action.get('clicked'):
        return '平台已点击页面上唯一且明确的游戏启动按钮“'+str(action.get('label',''))[:80]+'”，但仍未观察到游戏画布入口；请检查本轮弹窗、文档响应和失败请求线索。'
    if action.get('reason')=='ambiguous start controls':
        return '页面存在多个可能的游戏启动控件，平台为避免误点没有自动选择；请检查本轮控件与链接线索，确定实际游戏入口。'
    probes=[item for item in discovery.get('iframe_probes',[]) if isinstance(item,dict)]
    if probes:
        lead=probes[0]
        return '页面声明了 iframe 入口候选：'+str(lead.get('declared_url',''))[:400]+'；平台已在隔离页探测，但未观察到游戏画布（HTTP '+str(lead.get('http_status') or '未确认')+'）。该地址仍是候选，不能当作已取得游戏包。'
    iframe_hints=[item for item in discovery.get('iframe_hints',[]) if isinstance(item,dict) and item.get('evidence') in ('iframe-src','iframe-data-url','iframe-data-src') and str(item.get('url','')).startswith(('http://','https://'))]
    if iframe_hints:
        hint=iframe_hints[0]
        return '页面源码声明了待确认的游戏 iframe 地址：'+str(hint['url'])[:500]+'。该地址尚未作为运行入口验证；请先确认广告拦截层已关闭，并检查入口可访问性。'
    launch_links=[item for item in discovery.get('launch_links',[]) if isinstance(item,dict) and re.search(r'开始|进入游戏|立即玩|play|launch|start game',str(item.get('label','')),re.I) and str(item.get('url','')).startswith(('http://','https://'))]
    if launch_links:
        lead=launch_links[0]
        return '尚未进入网页游戏运行场景。页面发现可能的启动链接“'+str(lead.get('label',''))[:80]+'”：'+str(lead['url'])[:500]+'；这是待确认线索，不能当作已识别游戏入口。'
    controls=[str(item.get('label','')).strip()[:80] for item in discovery.get('launch_controls',[]) if isinstance(item,dict) and item.get('label')]
    if controls:
        labels='、'.join(controls[:5])
        return '尚未进入网页游戏运行场景。页面可见控件（'+labels+'）不符合唯一、明确的启动按钮条件；平台已保留线索但没有自动点击。'
    return '目前只采集到网页页面，尚未识别可运行的游戏入口。请根据页面错误、失败请求和 iframe 线索定位实际游戏入口；入口解析完成前不能开始自动重建。'
