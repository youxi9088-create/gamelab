"""Immutable delivery supplements and source resolution; never approve a game."""
from contextlib import contextmanager
import copy
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile
import zipfile

from .game_catalog import profile, document
from .repository import safe_relative


def resolve_source(repository, version):
    root = Path(repository.root).resolve()
    if version.get('source_directory'):
        source = (root / version['source_directory']).resolve()
        if not source.is_relative_to(root):
            raise ValueError('供货版本目录越界')
    else:
        # Snapshot imports have an artifact binding, but no source-library commit.
        key = version.get('artifact_id', '')
        if not key or len(safe_relative(key).parts) != 1:
            raise ValueError('缺少供货材料关联')
        base = Path(repository.artifacts).resolve()
        source = (base / key).resolve()
        if not source.is_relative_to(base):
            raise ValueError('供货产物目录越界')
    if not source.is_dir() or not (source/'index.html').is_file():
        raise ValueError('供货材料缺少根入口')
    return source


def source_files(source):
    result = []
    for p in sorted(Path(source).rglob('*')):
        if p.is_symlink() or (hasattr(p, 'is_junction') and p.is_junction()):
            raise ValueError('供货材料包含链接')
        if p.is_file():
            relative = p.relative_to(source).as_posix()
            safe_relative(relative)
            result.append((p, relative))
    return result


def evidence_steps(version):
    """Only losslessly translatable recorded actions become protocol defaults."""
    report = version.get('report') or {}
    actions = report.get('acceptance_actions') or []
    result = []
    for index, action in enumerate(actions):
        kind = action.get('type')
        step = None
        if kind == 'click' and action.get('selector'):
            step = {'action':'click', 'target':action['selector']}
        elif kind == 'key' and action.get('key') and not action.get('hold_ms'):
            step = {'action':'key', 'value':action['key']}
        elif kind == 'wait' and 1 <= action.get('wait_ms', 0) <= 60000:
            step = {'action':'wait', 'value':str(action['wait_ms'])}
        # Pixel clicks are viewport-relative, whereas supplier points are element-
        # relative. Held keys/reload have no documented equivalent. Keep the full
        # raw path instead of silently changing timing, coordinate space or order.
        if step is None:
            return [], '原始动作包含坐标、持续按键或刷新，不能无损转为下游默认操作；请按随包人工验收指引操作。'
        step['note'] = '原版本记录动作 '+str(index+1)+'；不代表供货副本已经重新验证。'
        result.append(step)
    if not any(s['action'] in ('click','key','drag') for s in result):
        return [], '历史版本没有可直接转换的完整操作序列；人工指引来自已登记规格，不能当作新验证记录。'
    return result, '来自版本实际操作记录；下游仍需按自身环境确认。'


@contextmanager
def delivery_source(source, candidate, version, metadata, facts=None):
    source = Path(source).resolve()
    source_files(source)
    with tempfile.TemporaryDirectory(prefix='gamelab-delivery-') as tmp:
        target = Path(tmp)/'game'
        selected = source
        changes = []
        entry = (source/'index.html').read_text('utf-8', errors='replace')
        # Explicit exported wrapper: the runtime directory is the actual static
        # game, while the root links to a retired local HTTP process.
        if ((source/'runtime/index.html').is_file() and (source/'web-runtime.zip').is_file()
                and re.search(r'href=["\']http://(?:127\.0\.0\.1|localhost):', entry)
                and not re.search(r'<(?:canvas|script|iframe)\b', entry, re.I)):
            selected = source/'runtime'
            changes.append({'kind':'unwrap_runtime','from':'runtime/','reason':'根页面仅链接旧本机服务；采用已有静态运行目录'})
        shutil.copytree(selected, target)
        entry_file=target/'index.html'
        entry_text=entry_file.read_text('utf-8')
        def optional_icon(match):
            tag=match.group(0)
            rel=re.search(r'\brel\s*=\s*["\']([^"\']+)',tag,re.I)
            href=re.search(r'\bhref\s*=\s*["\']([^"\']+)',tag,re.I)
            if rel and 'icon' in rel[1].lower().split() and href:
                from urllib.parse import urlsplit,unquote
                url=urlsplit(href[1]);path=(target/unquote(url.path)).resolve()
                if not url.scheme and not url.netloc and path.is_relative_to(target.resolve()) and not path.exists():
                    changes.append({'kind':'omit_missing_optional_icon','path':href[1]})
                    return ''
            return tag
        corrected_entry=re.sub(r'<link\b[^>]*>',optional_icon,entry_text,flags=re.I)
        if corrected_entry!=entry_text:entry_file.write_text(corrected_entry,'utf-8')
        for p, relative in source_files(target):
            if p.suffix.lower() in ('.cmd','.bat','.ps1','.sh'):
                # These are desktop launch helpers, never browser executable code.
                # Do not remove a helper referenced by the actual webpage.
                references = [n for f,n in source_files(target) if f.suffix.lower() in ('.html','.css','.js','.mjs')
                              and p.name in f.read_text('utf-8', errors='replace')]
                if references:
                    raise ValueError('网页引用启动脚本，不能自动剔除：'+relative)
                changes.append({'kind':'omit_launcher','path':relative,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
                p.unlink()
        from .supply_resources import prepare as prepare_resources
        layout=prepare_resources(target)
        if layout.get('renamed') or layout.get('deduplicated'):
            changes.append({'kind':'resource_layout',**layout})
        docs = target/'supply-delivery'
        if docs.exists():
            raise ValueError('供货补充目录已存在，避免覆盖已有材料')
        docs.mkdir()
        bound = copy.deepcopy(version)
        if facts:
            bound['game_profile'] = facts
        facts = profile(candidate, bound)
        steps, step_note = evidence_steps(version)
        def write(name, value):
            (docs/name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', 'utf-8')
        (docs/'GAME_SPECIFICATION.md').write_text(document(candidate['title'], facts), 'utf-8')
        write('game-profile.json', facts)
        write('license.json', metadata.get('license_declaration') or {})
        write('acceptance-actions-original.json', (version.get('report') or {}).get('acceptance_actions') or [])
        write('acceptance-steps.json', steps)
        report = version.get('report') or {}
        # Deliberately exclude provider configuration, prompts, private messages,
        # credentials and unrelated history from supplemental delivery metadata.
        write('verification-summary.json', {k:report[k] for k in (
            'foundation_checks','dependencies','verification_evidence','inherited_gameplay_evidence',
            'runtime_viewport','source_reuse','limitations','summary','delivery_gaps') if k in report})
        from .resource_audit import audit
        from .supply_resources import validated_aliases
        static=audit(target,validated_aliases(target))
        write('static-resource-check.json',{k:static[k] for k in ('status','missing','external','backend_endpoints','dynamic_files','scope')})
        acceptance = ['# 人工验收指引', '对应版本：'+version['id'],
            '平台版本状态：'+version.get('status','unknown'),
            '本指引整理已有资料，没有重新执行游戏或代替人工验收。',
            '## 操作方式', facts.get('controls') or '历史记录未说明，需在下游试玩时确认。',
            '## 代表性流程', facts.get('game_loop') or '历史记录未说明，需人工补充。',
            '## 存档检查', facts.get('save') or '未确认，不得默认支持刷新恢复。',
            '## 原始操作序列', step_note,
            '原始动作见 acceptance-actions-original.json；像素坐标须结合原验证环境，不能直接当作画布比例坐标。',
            '## 验收记录', '原版本已有证据保留在包内；verification-summary.json 仅汇总已登记结论。']
        (docs/'ACCEPTANCE.md').write_text('\n\n'.join(acceptance)+'\n','utf-8')
        limitations = list(dict.fromkeys([*(report.get('limitations') or []),*(metadata.get('known_limitations') or [])]))
        (docs/'HANDOFF.md').write_text('\n\n'.join([
            '# 游戏交付说明', '游戏：'+candidate['title'], '版本：'+version['id'],
            '## 运行', '使用静态 HTTP(S) 服务打开根 index.html；保留目录层级。包不包含业务后端、云存档服务或转换平台。',
            '## 二次开发', '页面及宿主代码可检查修改；原游戏 JS 是否可独立提取模块须结合工程说明。WASM/SWF 是编译运行包，不代表恢复原作者源码。跨游戏复用未验证的模块不能标为已验证。',
            '## 资料', 'GAME_SPECIFICATION.md 为游戏规格；ACCEPTANCE.md 为人工验收指引；license.json 为用户授权声明；manifest.json 为文件校验和整理记录。',
            '## 限制', '\n'.join('- '+str(x) for x in limitations) or '具体覆盖以版本原始验证材料为准。',
            '未提供下游接收确认；运行包准备完成不等于模板已生成或已发布。'])+'\n','utf-8')
        write('manifest.json', {'schema_version':1,'candidate_id':candidate['id'],'version_id':version['id'],
            'version_status':version.get('status'),'entry':'index.html','changes':changes,
            'source_files':{name:hashlib.sha256(p.read_bytes()).hexdigest() for p,name in source_files(selected)},
            'files':{name:hashlib.sha256(p.read_bytes()).hexdigest() for p,name in source_files(target)}})
        yield target, {'changes':changes,'acceptance_steps':steps,'acceptance_note':step_note,
                       'runtime_recheck_required':bool(layout.get('runtime_recheck_required') or changes)}


def write_review_archive(source, destination):
    """Prepare an explicitly labelled runtime review archive, not template approval.

    Binary runtimes, engine UUID names and data ZIPs are preserved for the user's
    requested receiver review. Executables, secrets-by-path and unsafe paths are
    still rejected. Actual downstream size/file-count limits remain in the report.
    """
    files = source_files(source)
    for p, name in files:
        if p.suffix.lower() in ('.exe','.dll','.sh','.bat','.cmd','.ps1','.py','.php','.com','.msi'):
            raise ValueError('运行包含非网页执行文件：'+name)
    destination = Path(destination)
    if destination.exists():
        raise ValueError('供货 ZIP 已存在，不覆盖历史包')
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED) as z:
        for p, name in files:
            info=zipfile.ZipInfo(name,(2020,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,p.read_bytes())
    return {'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),
            'archive_bytes':destination.stat().st_size,'uncompressed_bytes':sum(p.stat().st_size for p,n in files),
            'files':len(files),'downstream_size_limits_pass':destination.stat().st_size<=100_000_000
                and sum(p.stat().st_size for p,n in files)<=500_000_000 and len(files)<=2000}
