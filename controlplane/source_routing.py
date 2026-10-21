"""Source identity shared by first conversion and retries; titles are not routing keys."""
import re
from urllib.parse import urlsplit


def source_kind(url, observations=None):
    o=observations if isinstance(observations,dict) else {}
    if str(url).startswith('#小程序://'):
        return 'wechat'
    ids=[o.get('appid',''),*(o.get('appids') or [])]
    if any(isinstance(i,str) and re.fullmatch(r'wx[0-9a-fA-F]{16}',i) for i in ids):
        return 'wechat'
    return 'web' if urlsplit(str(url)).scheme in ('http','https') else 'unknown'


def web_block_reason(observations):
    if observations.get('web_source'):
        return '已提取原网页内嵌游戏 HTML 与配置，保存在本轮采集目录 web-source。仍需下载远程资源、适配网页宿主接口并验证完整玩法；当前未登记对应适配器，不进入微信缓存检查或 AI 重写。'
    discovery=observations.get('web_discovery',{})
    entries=discovery.get('entries',[])
    if entries:
        return '已识别网页游戏运行入口，但尚未完成资源闭合与宿主接口适配：'+entries[0]['url']+'。入口及请求证据已保存；需要 Web 适配方案，不适用微信 AppID 缓存检查。'
    return '目前只采集到网页页面，尚未识别可运行的游戏入口。请查看采集报告中的页面错误、失败请求和 iframe 线索；平台尚未完成此来源的入口解析，不能进入 AI 重写或微信缓存检查。'
