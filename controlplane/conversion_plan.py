"""Evidence-led routing for the existing converters, shared with task presentation."""
from .source_routing import source_kind
from .web_profiles import supports

LABELS={'revision':'沿已有版本续作','web-profile':'已登记 Web 适配','embedded-lib':'内嵌 HTML 宿主适配','wxapkg-v1':'Cocos 微信原包转换','provided-source':'静态源码整理','external':'已配置外部转换器','blocked':'材料或适配能力不足','ai':'显式 AI 玩法重建'}

def build(inp, observation=None, converter=None, continuation=False, stage='rea'):
    o=observation or inp.get('observations') or {};converter=converter or {}
    kind=source_kind(inp.get('url',''),o);evidence=[];missing=[]
    profile=(inp.get('observations') or {}).get('web_runtime')
    source=o.get('web_source') or {}
    assets=any(f.get('file')=='asset-map.json' for f in source.get('files',[]))
    if continuation:route='revision';evidence.append('平台已绑定不可变基线版本')
    elif stage=='reconstruct':route='ai';evidence.append('任务已选择玩法重建阶段')
    elif profile and supports(inp.get('url',''),profile):route='web-profile';evidence.append('来源地址匹配登记方案')
    elif converter.get('backend')=='wxapkg_v1' and o.get('resource_package_inventory'):route='wxapkg-v1';evidence.append('已取得匹配微信包；引擎插件由转换器继续核对')
    elif converter.get('base_url') and converter.get('backend')!='wxapkg_v1':route='external';evidence.append('已配置外部转换协议；实际能力由服务验证')
    elif kind=='web' and source and assets:route='embedded-lib';evidence.append('显式内嵌 HTML 与资源映射；宿主契约由执行器核对')
    elif inp.get('source_path'):route='provided-source';evidence.append('已提供平台登记的本地源码包')
    else:
        route='blocked'
        missing.append('需要匹配游戏包及引擎插件' if kind=='wechat' else '需要完整内嵌源码与资源映射，或匹配的 Web 适配方案')
    for item in (inp.get('dependencies') or {}).get('items',[]):
        if item.get('status') not in ('verified','not_applicable'):missing.append(item.get('name','依赖')+'：'+(item.get('next_action') or item.get('reason','待验证')))
    return {'schema_version':1,'recorded':False,'route':route,'label':LABELS[route],'source_kind':kind,'evidence':evidence,'missing':missing,
            'next_action':'按所选路径执行资源校验、宿主适配和规格测试' if route!='blocked' else missing[0],
            'scope':'仅现有 Cocos Web 方案、Cocos 3.5.1/define 原包、内嵌 lib 契约与静态源码；分析不是验收'}
