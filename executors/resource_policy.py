"""Cache-first policy, enforced before asking the model to generate a game."""
import base64
import hashlib
from pathlib import Path

MEDIA={'.png','.jpg','.jpeg','.webp','.gif','.mp3','.wav','.ogg','.m4a'}
VISUAL={'.png','.jpg','.jpeg','.webp','.gif'}

def original_resources(observations):
    from worker import Blocked
    if not isinstance(observations,dict) or not observations.get('cache_checked'):
        raise Blocked('资源检查未完成：必须先按游戏 AppID 检查本机缓存，再开始第一版生成。')
    if not observations.get('cache_package_count') and not observations.get('matched_local_resource_roots'):
        raise Blocked('没有找到匹配的原游戏缓存。请先在微信中打开该游戏，再重试缓存采集；未自动生成替代素材版本。')
    root=Path(observations['resource_directory']).resolve()
    files={};catalog=[];total=0
    for package in observations.get('cache_manifest',[]):
        for item in package.get('files',[]):
            name=item['file'];suffix=Path(name).suffix.lower()
            if suffix not in MEDIA:continue
            path=(root/name).resolve()
            if not path.is_relative_to(root) or path.is_symlink():raise Blocked('缓存资源路径无效')
            data=path.read_bytes()
            if hashlib.sha256(data).hexdigest()!=item['sha256']:raise Blocked('缓存资源已变化，请重新采集')
            total+=len(data)
            if total>3_000_000 or len(files)>=100:
                raise Blocked('原资源超过当前自动打包容量，需要资源包适配；不能丢弃资源生成简化版本。')
            target='assets/original/'+name
            files[target]={'encoding':'base64','content':base64.b64encode(data).decode()}
            catalog.append({'path':target,'original_name':item['original'],'bytes':len(data),'sha256':item['sha256']})
    if not any(Path(name).suffix.lower() in VISUAL for name in files):
        raise Blocked('已找到原游戏缓存，但未解析出可直接使用的角色或场景图片。资源解析待适配：需要执行器处理引擎资源包/图集，不能要求用户重复提供已存在的缓存，也不能生成替代素材首版。')
    return files,catalog

def merge_original(generated, original):
    from worker import Blocked
    if not isinstance(generated,dict):raise Blocked('生成结果没有有效的文件清单')
    for name in original:
        if name in generated and generated[name]!=original[name]:raise Blocked('生成代码试图替换原资源')
    code='\n'.join(value for name,value in generated.items() if isinstance(value,str) and name.endswith(('.js','.html','.mjs')))
    if not any(name in code for name in original if Path(name).suffix.lower() in VISUAL):
        raise Blocked('生成结果未引用原版画面资源，未允许作为首版入库。')
    return {**generated,**original}
