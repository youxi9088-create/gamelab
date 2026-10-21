"""Configured Web snapshots, exact source patches and isolated runtime verification."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
from controlplane.runtime import node_binary

ROOT = Path(__file__).resolve().parent


def adapt(source, target, profile):
    shutil.copytree(source, target)
    changes = []
    for patch in profile.get('patches', []):
        path = (target / patch['file']).resolve()
        if not path.is_relative_to(target.resolve()) or not path.is_file():
            raise ValueError('Invalid Web patch path')
        before = path.read_bytes()
        if hashlib.sha256(before).hexdigest() != patch['sha256']:
            raise ValueError('Web source changed; adaptation requires review: '+patch['file'])
        text = before.decode('utf-8')
        for replacement in patch['replacements']:
            if not replacement['find'] or text.count(replacement['find']) != 1:
                raise ValueError('Web patch must match exactly once')
            text = text.replace(replacement['find'], replacement['replace'], 1)
        path.write_text(text, encoding='utf-8')
        changes.append({'file':patch['file'],'original_sha256':patch['sha256'],
                        'adapted_sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    for adapter in profile.get('external_scripts', []):
        if adapter['adapter'] != 'mini-game-sdk':
            raise ValueError('Unsupported Web host adapter')
        shutil.copy2(ROOT/'adapters/mini-game-sdk.js', target/'local-host.js')
    return changes


def convert(inp, run, budget, analyze):
    profile = inp['observations']['web_runtime']
    source, target = run/'web-original', run/'converted'
    (run/'web-input.json').write_text(json.dumps({'url':inp['url'],'profile':profile}), 'utf-8')
    def command(args, seconds):
        result = subprocess.run([node_binary(), *args], cwd=ROOT, capture_output=True,
                                timeout=budget.remaining(seconds), encoding='utf-8', errors='replace')
        if result.returncode:
            raise ValueError((result.stderr or result.stdout)[-3000:])
    command([str(ROOT/'web-capture.cjs'),str(run/'web-input.json'),str(source)],180)
    changes = adapt(source,target,profile)
    evidence = target/'evidence';evidence.mkdir()
    shutil.copy2(run/'web-acquisition.json',evidence/'acquisition.json')
    (evidence/'adaptation.json').write_text(json.dumps({'profile':profile,'changes':changes},ensure_ascii=False,indent=2),'utf-8')
    # Analyze business code, not the large third-party engine.
    analysis = run/'web-analysis';analysis.mkdir()
    for patch in profile.get('patches',[]):
        if patch['file'].endswith('.js'):
            shutil.copy2(source/patch['file'],analysis/Path(patch['file']).name)
    rea = analyze(str(analysis),run,budget)
    shutil.copy2(run/'rea-evidence.json',evidence/'rea.json')
    verifier=profile.get('verifier')
    if verifier not in ('cocos2-minesweeper',):
        raise ValueError('Web snapshot saved; gameplay verifier not configured')
    if inp.get('game_spec'):(evidence/'game-spec.json').write_text(json.dumps(inp['game_spec'],ensure_ascii=False),'utf-8')
    command([str(ROOT/'verify-web.cjs'),str(target),verifier],600 if inp.get('game_spec') else 240)
    verified=json.loads((evidence/'gameplay.json').read_text('utf-8'))
    if not verified.get('passed'):raise ValueError('Web gameplay checks failed')
    checks={key:{'status':'verified','reason':reason,'evidence':['evidence/gameplay.json','screenshots/board.png']} for key,reason in {
        'gameplay':'真实点击验证开局、胜负、重试与刷新续局',
        'resources':'原站文件哈希留存；离线验证无缺失资源',
        'scene':'原 Cocos 主场景与棋盘渲染',
        'objects':'原格子、地雷、旗帜与数字资源',
        'ui':'原难度菜单、棋盘与结算界面'}.items()}
    checks['characters']={'status':'not_applicable','reason':'棋盘游戏没有可操控角色'}
    checks['animation']={'status':'verified','reason':'原引擎反馈与结算切换已运行','evidence':['evidence/gameplay.json']}
    dependencies={'scope':'本地单人扫雷闭环；原站广告、在线排名不在交付范围。全站或其他游戏不据此推断。','items':[
        {'id':kind,'name':name,'kind':kind,'status':'verified','reason':reason,'evidence':'evidence/gameplay.json; evidence/acquisition.json','next_action':''}
        for kind,name,reason in [('code','原 Web 代码与引擎','原运行代码已采集并离线执行'),('resources','资源闭合','已预载引擎资源并完成离线玩法验证'),('data','棋盘配置','初级、中级、高级与自定义配置已验证'),('backend','本地存档与结算','保留原本地存档，刷新续局及胜负结算通过'),('platform','宿主适配','广告回调不伪造成功；离线继续入口独立适配')]]}
    (target/'RESTORATION_REPORT.txt').write_text(profile.get('delivery_notes','')+'\n原文件与哈希位于执行目录 web-original；本产物 evidence 保留采集清单及精确补丁。\n业务代码可二次修改，Cocos 运行包移植仍需拆解适配；不是原作者编辑器工程。','utf-8')
    return {'path':'A','recovery_kind':'configured-web-snapshot','runtime_verified':True,
            'runtime_smoke':verified,'foundation_checks':checks,'dependencies':dependencies,
            'requires_manual_playtest':True,'rea_attempted':True,'evidence_id':rea['data']['evidence_id'],
            'game_profile':profile.get('game_profile',{}),'web_runtime':profile,
            'limitations':['保留原 Web 运行包；跨游戏模块复用尚需拆解适配','本地版无原站广告、排行榜与账号联机服务']}
