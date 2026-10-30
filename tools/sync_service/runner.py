"""One standalone scheduled run: cloud mirror and reviewed-source Git backup."""
import base64
from datetime import datetime, timezone
import json
import msvcrt
import os
from pathlib import Path
import re
import subprocess
import sys

HOME = Path(os.environ.get('GAMELAB_SYNC_HOME', r'C:\ProgramData\GameLabSync'))
SUFFIXES = {'.py', '.ps1', '.bat', '.js', '.mjs', '.cjs', '.json', '.md', '.txt', '.css', '.html', '.toml', '.sql', '.yml', '.yaml'}
PREFIXES = ('controlplane/', 'executors/', 'services/', 'tests/', 'tools/', 'web/', 'docs/', 'cloudflare/')
DENIED = {'data', 'migration-private', '.cache', '.deploy-backups', 'node_modules', '__pycache__', '.runtime', '.git', 'runs', 'reports', 'test-output', 'qa-output'}


def eligible(name):
    p = Path(name)
    return (not set(p.parts) & DENIED and not any(part.startswith('.env') for part in p.parts)
            and (len(p.parts) == 1 or name.startswith(PREFIXES))
            and (p.suffix.lower() in SUFFIXES or p.name in {'.gitignore', '.gitattributes'}))


def git_sync(config, repo):
    root = Path(repo['path'])
    env = dict(os.environ)
    user, password = env.pop('GAMELAB_GIT_USERNAME'), env.pop('GAMELAB_GIT_PASSWORD')
    auth = base64.b64encode((user + ':' + password).encode()).decode()
    values = [('safe.directory', str(root)), ('http.https://github.com/.extraheader', 'AUTHORIZATION: basic ' + auth),
              ('credential.helper', ''), ('user.name', config['git_name']), ('user.email', config['git_email'])]
    env['GIT_CONFIG_COUNT'] = str(len(values))
    env['GIT_TERMINAL_PROMPT'] = '0'
    for i, (key, value) in enumerate(values):
        env[f'GIT_CONFIG_KEY_{i}'], env[f'GIT_CONFIG_VALUE_{i}'] = key, value

    def git(*args, check=True):
        return subprocess.run([config['git'], '-C', str(root), *args], env=env,
                              capture_output=True, encoding='utf-8', errors='replace', check=check, timeout=300)
    if git('remote', 'get-url', 'origin').stdout.strip() != 'https://github.com/youxi9088-create/gamelab.git':
        raise ValueError('Unexpected Git remote')
    if git('branch', '--show-current').stdout.strip() != repo['local_branch']:
        raise ValueError('Working branch changed; Git backup paused')
    if git('diff', '--cached', '--name-only').stdout.strip() or git('ls-files', '-u').stdout.strip():
        raise ValueError('Existing staged changes or conflicts')
    git('fetch', 'origin', 'refs/heads/' + repo['remote_branch'])
    if git('merge-base', '--is-ancestor', 'FETCH_HEAD', 'HEAD', check=False).returncode:
        raise ValueError('Remote branch diverged; refusing to overwrite')
    names = set(git('diff', '--name-only', '-z').stdout.split('\0'))
    names.update(git('ls-files', '--others', '--exclude-standard', '-z').stdout.split('\0'))
    selected = sorted(name for name in names if name and eligible(name))
    secrets = [v.encode() for k, v in os.environ.items() if re.search(r'TOKEN|SECRET|PASSWORD|ACCESS_KEY', k) and len(v) > 12]
    for name in selected:
        path = root / name
        if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
            raise ValueError('Unsafe source path')
        if path.exists():
            content = path.read_bytes()
            if any(s in content for s in secrets) or re.search(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}', content):
                raise ValueError('Possible credential in source; Git backup stopped')
    if selected:
        git('add', '--', *selected)
        if git('diff', '--cached', '--name-only').stdout.strip():
            git('commit', '-m', 'Automatic source backup ' + datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC'))
    git('push', 'origin', 'HEAD:refs/heads/' + repo['remote_branch'])
    return {'ok': True, 'changed_files': len(selected), 'commit': git('rev-parse', 'HEAD').stdout.strip()}


def sync_targets(config, log_dir):
    """Attempt targets independently; an unconfigured required target fails closed."""
    targets = config.get('cloud_targets')
    if targets is None:
        command = [config['python'], config['cloud_script'], '--apply']
        if config.get('cloud_root'):
            command += ['--cloud-root', config['cloud_root']]
        targets = [{'id': 'cloudflare', 'command': command}]
    results = {}
    required = set(config.get('required_cloud_targets', ['cloudflare']))
    for target in targets:
        name = target.get('id', '')
        if not re.fullmatch(r'[a-z0-9_-]{1,40}', name) or name in results:
            raise ValueError('Invalid or duplicate cloud target identifier')
        command = target.get('command')
        if not isinstance(command, list) or not command or not all(isinstance(a, str) and a for a in command):
            results[name] = {'ok': False, 'reason': 'Deployment command not configured'}
            continue
        log = log_dir / (datetime.now().strftime('%Y%m%d-%H%M%S') + '-' + name + '.log')
        try:
            with log.open('w', encoding='utf-8') as out:
                code = subprocess.run(command, stdout=out, stderr=subprocess.STDOUT,
                                      timeout=target.get('timeout', 9000)).returncode
            results[name] = {'ok': code == 0, 'exit_code': code, 'log': str(log)}
        except Exception as error:
            results[name] = {'ok': False, 'error_type': type(error).__name__, 'log': str(log)}
    for name in required - results.keys():
        results[name] = {'ok': False, 'reason': 'Required cloud target not configured'}
    return {'ok': bool(results) and all(r['ok'] for r in results.values()), 'targets': results}


def main():
    config = json.loads((HOME / 'config.json').read_text('utf-8-sig'))
    (HOME / 'logs').mkdir(exist_ok=True)
    with (HOME / 'run.lock').open('a+b') as lock:
        lock.seek(0)
        if not lock.read(1):
            lock.write(b'0'); lock.flush()
        lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            return 2
        result = {'started_at': datetime.now(timezone.utc).isoformat(), 'running': True, 'git': {}}
        def save():
            temp = HOME / 'status.tmp'
            temp.write_text(json.dumps(result, indent=2), encoding='utf-8')
            temp.replace(HOME / 'status.json')
        save()
        try:
            result['cloud'] = sync_targets(config, HOME / 'logs')
        except Exception as error:
            result['cloud'] = {'ok': False, 'error_type': type(error).__name__}
        save()
        for repo in config['repos']:
            try:
                result['git'][repo['remote_branch']] = git_sync(config, repo)
            except Exception as error:
                # Exception bodies from Git may contain private URLs. Record only safe diagnostics.
                result['git'][repo['remote_branch']] = {'ok': False, 'error_type': type(error).__name__,
                    'reason': str(error) if isinstance(error, ValueError) else 'Git command failed; check network/authentication or repository state'}
            save()
        result['running'] = False
        result['finished_at'] = datetime.now(timezone.utc).isoformat()
        result['ok'] = result['cloud']['ok'] and all(r['ok'] for r in result['git'].values())
        save()
        if result['ok']:
            temp = HOME / 'last-success.tmp'
            temp.write_text(json.dumps(result, indent=2), encoding='utf-8')
            temp.replace(HOME / 'last-success.json')
        # Bound routine log retention without touching source or game artifacts.
        for old in sorted((HOME / 'logs').glob('*.log'))[:-60]:
            old.unlink()
        return 0 if result['ok'] else 1


if __name__ == '__main__':
    sys.exit(main())
