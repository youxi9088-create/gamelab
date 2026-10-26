"""Job-bound immutable capture snapshots; resuming never implies runtime success."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile

from repair_context import linked

TREES = ('converted', 'web-original')
FILES = ('web-acquisition.json', 'discovered-web-input.json', 'conversion-plan.json', 'original-runtime.png')


def extended(path):
    """Windows extended-length form: snapshots nest the run tree two levels deeper
    (checkpoints/<tmp>/snapshot/...), which can exceed MAX_PATH for long asset names."""
    path = Path(path)
    if os.name != 'nt':return path
    text = str(path if path.is_absolute() else path.resolve())
    return Path(text if text.startswith('\\\\?\\') else '\\\\?\\' + text)


def digest(path):
    with path.open('rb') as stream:return hashlib.file_digest(stream, 'sha256').hexdigest()


def read(path):
    if linked(path) or not path.is_file() or path.stat().st_size > 4_000_000:
        raise ValueError('检查点元数据缺失或无效')
    return json.loads(path.read_text('utf-8'))


def input_key(inp):
    fields = {key: inp.get(key) for key in ('url', 'game_spec', 'source_path', 'source_bundle_url')}
    return hashlib.sha256(json.dumps(fields, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def members(root):
    result = []
    for name in (*TREES, *FILES):
        path = root / name
        if not path.exists():
            if name in (*TREES, 'web-acquisition.json', 'discovered-web-input.json'):
                raise ValueError('检查点缺少必要产物：' + name)
            continue
        if linked(path):raise ValueError('检查点不允许链接目录或文件')
        paths = path.rglob('*') if path.is_dir() else [path]
        for item in paths:
            if linked(item) or not item.resolve().is_relative_to(root.resolve()):
                raise ValueError('检查点产物路径越界')
            if item.is_file():result.append(item)
    if len(result) > 6000 or sum(p.stat().st_size for p in result) > 512 * 1024**2:
        raise ValueError('检查点产物超过限额')
    return result


def copy_snapshot(source, target, rows):
    for row in rows:
        name = row['path'];relative = Path(name)
        if relative.is_absolute() or '..' in relative.parts or ':' in name or '\\' in name:
            raise ValueError('无效检查点路径')
        src = source / relative;dst = target / relative
        if linked(src) or not src.resolve().is_relative_to(source.resolve()) or digest(src) != row['sha256']:
            raise ValueError('检查点文件校验失败：' + name)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
        if digest(dst) != row['sha256']:raise ValueError('检查点复制校验失败')


def save(run, inp, observation, kind='web-capture'):
    run = extended(run)
    if not (run / 'job-binding.json').is_file():return None
    if kind not in ('web-capture','web-runtime'):raise ValueError('无效检查点阶段')
    destination = run / 'checkpoints' / kind
    if destination.exists():return read(destination / 'checkpoint.json')
    rows = [{'path': p.relative_to(run).as_posix(), 'sha256': digest(p)} for p in members(run)]
    metadata = {'schema': 1, 'job_id': read(run / 'job-binding.json')['job_id'],
                'input_key': input_key(inp), 'resume_node': 'test', 'files': rows,
                'observation': observation, 'source_run': run.name}
    destination.parent.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as temporary:
        staging = Path(temporary) / 'snapshot';staging.mkdir()
        copy_snapshot(run, staging, rows)
        (staging / 'checkpoint.json').write_text(json.dumps(metadata, ensure_ascii=False), 'utf-8')
        staging.rename(destination)
    return metadata


def legacy_snapshot(job, source, inp):
    """Only legacy runs proven to have reached verification after capture."""
    report = (job.get('report') or {}).get('auto_repair') or {}
    episodes = report.get('episodes') or [report]
    if not any(ep.get('stage') == 'test' for ep in episodes):
        raise ValueError('历史运行未记录采集后的验证节点')
    if inp.get('game_spec') or inp.get('source_path') or inp.get('source_bundle_url'):
        raise ValueError('历史运行缺少当前输入版本绑定')
    observation = read(source / 'acquisition/collected.json')
    if observation.get('url') != inp.get('url'):raise ValueError('来源链接已改变')
    acquisition = read(source / 'web-acquisition.json')
    if acquisition.get('failure') or not acquisition.get('files'):
        raise ValueError('历史资源采集没有成功结论')
    read(source / 'converted/evidence/runtime.json')
    request = read(source / 'discovered-web-input.json')
    if acquisition.get('url') != request.get('url'):raise ValueError('采集入口不一致')
    for item in acquisition['files']:
        name = item['path'];relative = Path(name);path = source / 'web-original' / relative
        if relative.is_absolute() or '..' in relative.parts or ':' in name or '\\' in name:
            raise ValueError('历史资源路径无效')
        if not path.resolve().is_relative_to((source / 'web-original').resolve()) or linked(path) or digest(path) != item['sha256']:
            raise ValueError('历史原始资源校验失败')
    return {'schema': 1, 'job_id': job['id'], 'input_key': input_key(inp), 'resume_node': 'test',
            'observation': observation, 'source_run': source.name, 'legacy_verified': True,
            'files': [{'path': p.relative_to(source).as_posix(), 'sha256': digest(p)} for p in members(source)]}


def restore(job, run, runs_root):
    """Return (checkpoint, invalidation reason); never overwrite a previous run."""
    inp = job.get('input') or {}
    prior = (job.get('report') or {}).get('run_directory')
    if not prior or job.get('continuation') or job.get('stage') != 'rea' or not job.get('automatic'):
        return None, None
    run = extended(run);root = extended(runs_root).resolve();source = extended(prior);copied = False
    try:
        if linked(source) or source.resolve().parent != root:raise ValueError('检查点不在当前执行器运行目录')
        source = source.resolve()
        if any(linked(source/name) for name in ('acquisition', *TREES)):
            raise ValueError('历史产物目录是链接')
        if read(source / 'job-binding.json').get('job_id') != job['id']:raise ValueError('检查点属于其他任务')
        checkpoint = source / 'checkpoints/web-runtime'
        if not checkpoint.exists():checkpoint = source / 'checkpoints/web-capture'
        if checkpoint.exists():
            if linked(source / 'checkpoints') or linked(checkpoint):raise ValueError('检查点目录是链接')
            metadata = read(checkpoint / 'checkpoint.json');copy_from = checkpoint
        else:
            metadata = legacy_snapshot(job, source, inp);copy_from = source
        if metadata.get('schema') != 1 or metadata.get('job_id') != job['id'] or metadata.get('input_key') != input_key(inp):
            raise ValueError('检查点输入版本已失效')
        if metadata.get('resume_node') != 'test':raise ValueError('不支持的断点')
        actual = {p.relative_to(copy_from).as_posix() for p in members(copy_from)}
        if actual != {row['path'] for row in metadata['files']}:raise ValueError('检查点文件清单不一致')
        # Validate everything before writing into the new run.
        for row in metadata['files']:
            if digest(copy_from / row['path']) != row['sha256']:raise ValueError('检查点文件摘要不匹配')
        with tempfile.TemporaryDirectory(dir=run) as temporary:
            staging = Path(temporary)
            copy_snapshot(copy_from, staging, metadata['files'])
            if any((Path(run) / item.name).exists() for item in staging.iterdir()):
                raise ValueError('当前运行目录已有产物，拒绝覆盖')
            items = list(staging.iterdir())  # Close Windows enumeration handles before moving children.
            copied = True
            for item in items:item.rename(Path(run) / item.name)
        metadata['from_run'] = source.name
        previous_runtime = source / 'converted/evidence/runtime.json'
        if previous_runtime.is_file():
            runtime = read(previous_runtime)
            runtime_rows = [row for row in metadata['files'] if row['path'].startswith('converted/')
                            and not set(Path(row['path']).parts) & {'evidence', 'screenshots'}]
            actual_runtime_files = {p.relative_to(source).as_posix() for p in (source/'converted').rglob('*')
                                    if p.is_file() and not set(p.relative_to(source/'converted').parts) & {'evidence', 'screenshots'}}
            same_source = (actual_runtime_files == {row['path'] for row in runtime_rows}
                           and all(not linked(source/row['path']) and (source/row['path']).resolve().is_relative_to(source)
                                   for row in runtime_rows)
                           and all(digest(source/row['path']) == row['sha256'] for row in runtime_rows))
            if runtime.get('passed') is False and same_source:
                runtime['inherited_from_run'] = source.name
                evidence = Path(run) / 'converted/evidence/runtime.json'
                evidence.parent.mkdir(parents=True, exist_ok=True)
                evidence.write_text(json.dumps(runtime, ensure_ascii=False), 'utf-8')
                metadata['prior_runtime_failed'] = True
        (Path(run) / 'checkpoint-resume.json').write_text(json.dumps(metadata, ensure_ascii=False), 'utf-8')
        return metadata, None
    except (OSError, ValueError, TypeError, KeyError) as exc:
        if copied:raise ValueError('检查点已复制但证据处理失败，保留副本并停止，避免混入重新采集的产物') from exc
        return None, str(exc)[:240]
