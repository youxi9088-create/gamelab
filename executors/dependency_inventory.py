"""Conservative dependency inventory from retained package evidence.

An inventory is not proof of complete resource acquisition or gameplay equivalence.
"""
from pathlib import Path
import hashlib
import json


def inventory(observation):
    if observation.get('source_kind')=='web':
        evidence=str(Path(observation.get('analysis_directory','.')).parent/'collected.json')
        result={'scope':'网页来源采集；网站脚本不视为游戏运行包，未验证资源与玩法不标记完成。','items':[
            dict(id=key,name=name,kind=kind,status='unknown',reason=reason,evidence=evidence,next_action=action)
            for key,name,kind,reason,action in [
                ('web-entry','网页游戏入口','code','已保留页面、脚本和 iframe 线索','解析实际运行入口并确认游戏代码'),
                ('web-assets','网页游戏资源','resources','尚未确认完整游戏资源包','采集入口资源并核对引用闭合'),
                ('web-data','游戏配置','data','尚未确认配置与运行代码对应关系','从实际游戏运行包识别配置'),
                ('web-backend','后端依赖','backend','尚未验证账号、存档与结算依赖','分析实际运行请求及离线替代边界'),
                ('web-host','网页宿主接口','platform','未登记此来源的可验证适配方案','实现宿主适配并运行玩法验证')]]}
        if observation.get('web_source'):
            result['items'][0].update(status='available',reason='已提取原页面显式引用的游戏 HTML；尚未完成离线运行适配',evidence=str(Path(observation['web_source']['directory'])/'manifest.json'),next_action='下载远程依赖并接入宿主适配')
        return result
    packages = observation.get('cache_manifest', [])
    files = [f for package in packages for f in package.get('files', [])]
    code = [f for f in files if Path(f['file']).suffix.lower() in ('.js', '.wasm')]
    assets = [f for f in files if Path(f['file']).suffix.lower() not in ('.js', '.json', '.wasm')]
    configurations = [f for f in files if Path(f['file']).suffix.lower() == '.json']
    evidence = str(Path(observation.get('resource_directory') or '.') / 'manifest.json')
    def row(key, name, kind, present, count):
        return dict(id=key, name=name, kind=kind, status='available' if present else 'unknown',
                    reason=f'包内发现 {count} 个文件；尚未验证网页适配与完整依赖',
                    evidence=evidence if present else '', next_action='核对引用关系、缺失项及浏览器适配')
    items = [row('original-code', '原版代码 / 运行包', 'code', bool(code), len(code)),
             row('original-assets', '原包资源', 'resources', bool(assets), len(assets)),
             row('configuration', '游戏配置', 'data', bool(configurations), len(configurations))]
    for key,name,kind,action in [
        ('resource-closure','资源依赖完整性','resources','核对分包、远端下载资源、引擎插件；包内文件完整不等于全游戏资源完整'),
        ('backend-contract','后端接口与数据','backend','分析登录、存档、战斗与结算的服务端依赖，确定可获取及需重建部分'),
        ('platform-adapter','平台接口适配','platform','核对微信接口并验证浏览器实现')]:
        items.append(dict(id=key,name=name,kind=kind,status='unknown',reason='尚未完成分析',evidence='',next_action=action))
    downloads=observation.get('download_cache',{})
    if downloads:
        items.append(dict(id='download-cache',name='下载资源缓存',kind='resources',
            status='available' if downloads.get('file_count') else 'unknown',
            reason=f"已保存 {downloads.get('file_count',0)} 个缓存文件；缺失 {len(downloads.get('missing',[]))} 项、拒绝 {len(downloads.get('rejected',[]))} 项。尚未完成资源引用闭合。",
            evidence=downloads.get('manifest',''),next_action='按 URL 映射接入浏览器，校验运行时资源引用与缺失项'))
    config=observation.get('config_cache',{})
    if config.get('count'):
        items.append(dict(id='cached-game-config',name='原版玩法配置缓存',kind='data',status='available',
            reason=f"按原代码字段匹配到 {config['count']} 份配置候选；尚未核对版本兼容与必要字段。",
            evidence=config['manifest'],next_action='核对配置缺项、版本和运行结果，不能补造默认表视为还原'))
    return {'scope':'依据当前已获取包的文件清单生成；不推断未获取材料，不代表已识别全部依赖。', 'items':items}


def local_inventory(root):
    root=Path(root).resolve()
    manifest=root/'unpacked/manifest.json'
    packages=json.loads(manifest.read_text('utf-8'))
    result=inventory({'cache_manifest':packages,'resource_directory':str(manifest.parent)})
    # Verify saved members before calling them acquired; never execute target code.
    for package in packages:
        for item in package['files']:
            f=(manifest.parent/item['file']).resolve()
            if not f.is_relative_to(manifest.parent) or not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=item['sha256']:
                raise ValueError('包成员缺失或哈希不符：'+item['file'])
    resource_manifest=root/'resource-manifest.json'
    if resource_manifest.exists():
        resources=json.loads(resource_manifest.read_text('utf-8'))
        for item in resources.get('files',[]):
            f=(root/item['file']).resolve()
            if not f.is_relative_to(root) or not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=item['sha256']:
                raise ValueError('缓存资源缺失或哈希不符：'+item['file'])
        result['items'].append(dict(id='download-cache',name='下载资源缓存',kind='resources',status='available',
            reason=f"已校验 {len(resources.get('files',[]))} 个缓存文件；清单记录 {len(resources.get('missing',[]))} 个缺失文件。未验证全关卡依赖。",
            evidence=str(resource_manifest),next_action='与原代码及资源配置交叉核对'))
    modules=root/'modules'
    markers={'backend-contract':('WebSocket','loginServer','configUrl'),
             'platform-adapter':('window.wx.','wx.login','getUpdateManager')}
    for item in result['items']:
        if item['id'] not in markers: continue
        found=[]
        for f in modules.rglob('*.js'):
            text=f.read_text('utf-8',errors='replace')
            hits=[word for word in markers[item['id']] if word in text]
            if hits:found.append({'file':f.relative_to(root).as_posix(),'markers':hits})
        if found:
            item.update(status='rebuild',reason='静态发现接口引用；是否可直接复用、需重建的范围仍待确认。',
                        evidence=json.dumps(found[:12],ensure_ascii=False))
    return result


if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('root');parser.add_argument('--output',required=True)
    args=parser.parse_args()
    Path(args.output).write_text(json.dumps(local_inventory(args.root),ensure_ascii=False,indent=2),'utf-8')
