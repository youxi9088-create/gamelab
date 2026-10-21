"""REA-led dependency analysis and original embedded HTML packaging."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
from controlplane.runtime import node_binary
from web_embedded import Scripts
from remote_assets import download

ROOT=Path(__file__).resolve().parent
CONTRACT={'getAsset','log','shouldUseTouchControls','showGameParameters','getUserGameState','saveUserGameState','addPlayerScoreToLeaderboard'}


def convert(acquired,run,budget,analyze):
    source=Path(acquired['web_source']['directory']);html=(source/'index.html').read_text('utf-8')
    if not (source/'asset-map.json').is_file():raise ValueError('内嵌源码没有可验证资源映射')
    parser=Scripts();parser.feed(html)
    analysis=run/'embedded-analysis';analysis.mkdir()
    for i,part in enumerate(parser.parts):(analysis/f'game-{i}.js').write_text(part,'utf-8')
    asset_map=json.loads((source/'asset-map.json').read_text('utf-8'))
    (analysis/'asset-bindings.js').write_text('const originalAssets = '+json.dumps(asset_map,ensure_ascii=False)+';','utf-8')
    evidence=analyze(analysis,run,budget)
    stats=evidence['data'].get('normalized_result',{}).get('statistics',{})
    if stats.get('parse_failures') or not stats.get('parsed_javascript_files'):raise ValueError('REA 未完成内嵌脚本解析')
    methods=set(re.findall(r'\blib\.([a-zA-Z_$][\w$]*)',html))
    if methods-CONTRACT:raise ValueError('尚未适配的宿主接口：'+', '.join(sorted(methods-CONTRACT)))
    if 'window.run' not in html or not methods:raise ValueError('未识别支持的内嵌运行契约')
    target=run/'converted';target.mkdir()
    local_map,downloads=download(asset_map,target/'assets',budget)
    config=json.loads((source/'game-config.json').read_text('utf-8')) if (source/'game-config.json').exists() else {}
    # Keep each original inline script editable and in its original execution order.
    counter=0
    def externalize(match):
        nonlocal counter
        attributes,body=match.groups()
        if re.search(r'\bsrc\s*=',attributes,re.I):raise ValueError('外部脚本尚未纳入资源映射')
        if 'application/ld+json' in attributes:return match[0]
        name=f'game-{counter}.js';counter+=1;(target/name).write_text(body,'utf-8')
        return '<script'+attributes+' src="'+name+'"></script>'
    html=re.sub(r'<script([^>]*)>(.*?)</script>',externalize,html,flags=re.S|re.I)
    # Optional web font services are replaced by the original CSS fallback fonts.
    html=re.sub(r'<link\b[^>]*href=["\']https://fonts\.(?:googleapis|gstatic)\.com[^>]*>','',html,flags=re.I)
    html=html.replace('</head>','<script src="local-config.js"></script><script src="local-host.js"></script></head>',1)
    (target/'index.html').write_text(html,'utf-8')
    identity=hashlib.sha256(acquired['url'].encode()).hexdigest()[:24]
    (target/'local-config.js').write_text('window.gameConfig='+json.dumps(config,ensure_ascii=False)+';\nwindow.localAssetMap='+json.dumps(local_map,ensure_ascii=False)+';\nwindow.localHostIdentity='+json.dumps(identity)+';','utf-8')
    shutil.copy2(ROOT/'adapters/embedded-lib.js',target/'local-host.js')
    ed=target/'evidence';ed.mkdir()
    shutil.copy2(run/'rea-evidence.json',ed/'rea.json')
    shutil.copy2(target/'resource-downloads.json',ed/'resource-downloads.json')
    shutil.copy2(source/'manifest.json',ed/'source-manifest.json')
    (ed/'host-contract.json').write_text(json.dumps({'methods':sorted(methods),'rea_evidence_id':evidence['data']['evidence_id'],'downloaded_assets':len(downloads['files'])},indent=2),'utf-8')
    spec=acquired.get('game_spec')
    if spec:(ed/'game-spec.json').write_text(json.dumps(spec,ensure_ascii=False),'utf-8')
    result=subprocess.run([node_binary(),str(ROOT/'verify-embedded.cjs'),str(target)],capture_output=True,encoding='utf-8',errors='replace',timeout=budget.remaining(600 if spec else 180))
    if result.returncode:raise ValueError('本地运行验证失败：'+result.stderr[-1500:])
    verified=json.loads((ed/'runtime.json').read_text('utf-8'))
    from dependency_inventory import inventory
    dependencies=inventory({**acquired,'source_kind':'web'})
    for item in dependencies['items']:
        if item['kind'] in ('code','resources','data','platform'):
            item.update(status='available',reason='REA 分析与本地运行检查已完成；完整玩法覆盖仍待验证',evidence='evidence/runtime.json',next_action='核对完整玩法和原版差异')
        if item['kind']=='resources':
            item.update(status='verified',reason='显式资源映射全部下载并记录哈希，当前运行检查无缺失请求',evidence='evidence/resource-downloads.json',next_action='')
        if item['kind']=='backend':
            item.update(status='rebuild',reason='存档已接本地浏览器；原站在线排行榜未接入',evidence='evidence/host-contract.json',next_action='确认离线交付边界并验证存档恢复')
    (target/'RESTORATION_REPORT.txt').write_text('原始内嵌业务代码保留为 game-*.js，可修改玩法和渲染；配置与资源映射在 local-config.js；local-host.js 为可移植宿主契约适配。采集、下载与适配服务可复用；游戏业务模块跨游戏复用尚需拆解。存档使用本地浏览器，在线排名不提交；外部字体使用 CSS 后备字体。运行检查不等于所有海域、成长与胜负闭环验证。','utf-8')
    return {'path':'A','recovery_kind':'rea-embedded-web','runtime_verified':True,'runtime_smoke':verified,'dependencies':dependencies,'game_spec':spec,'spec_tests':verified.get('spec_tests'),
      'rea_attempted':True,'evidence_id':evidence['data']['evidence_id'],'rea_statistics':stats,
      'resource_downloads':{'files':len(downloads['files']),'bytes':downloads['bytes'],'errors':downloads['errors']},
      'foundation_checks':{'resources':{'status':'verified','reason':'原资源映射全部下载并校验哈希；运行无缺失请求','evidence':['evidence/resource-downloads.json','evidence/runtime.json']},
       'gameplay':{'status':'pending','reason':'运行入口与基础交互已检查，完整成长、胜负和重试尚需验收','evidence':['evidence/runtime.json']}},
      'requires_manual_playtest':True,'limitations':['本地存档替代原站存档，不提交在线排名','完整玩法与跨游戏业务模块复用未验证']}
