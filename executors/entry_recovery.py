"""AI-selected declared entry probes return to the original routing check."""
import copy
import ipaddress
from pathlib import Path
from urllib.parse import urlsplit
from auto_repair import diagnose


def recover(observation, run, budget, acquire):
    from worker import Blocked
    from controlplane.source_routing import web_block_reason
    from modular_web import candidate
    from discovered_web import entry
    current = copy.deepcopy(observation)
    def verify():
        if candidate(current):
            return current
        if current.get('web_discovery', {}).get('entries'):
            entry(current)  # Reuse the converter's actual entry validation.
            return current
        raise Blocked(web_block_reason(current))
    try:
        return verify()
    except Blocked as error:
        original = error
    discovery = observation.get('web_discovery', {})
    allowed = {row.get('url') for key in ('iframe_hints', 'launch_links')
               for row in discovery.get(key, []) if isinstance(row, dict)}
    probes = []
    def probe(arguments):
        url = arguments.get('url')
        if not isinstance(url, str) or url not in allowed:
            raise ValueError('只能探测本任务采集页面明确声明的入口')
        parsed = urlsplit(url)
        if parsed.scheme not in ('http', 'https') or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('入口地址格式无效')
        host = parsed.hostname.lower()
        if host == 'localhost' or host.endswith('.localhost'):
            raise ValueError('禁止探测本地管理地址')
        try:
            address = ipaddress.ip_address(host)
        except ValueError:
            address = None
        if address and not address.is_global:
            raise ValueError('禁止探测私有网络地址')
        directory = Path(run) / 'entry-probes' / str(len(probes)+1)
        directory.mkdir(parents=True, exist_ok=False)
        probes.append(url)
        result = acquire(url, directory, budget)
        entries = result.get('web_discovery', {}).get('entries', [])
        current.setdefault('web_discovery', {})['entries'] = entries
        current['entry_recovery'] = {'declared_url': url, 'evidence': result.get('evidence', {})}
        return {'url': url, 'entries': entries, 'evidence_directory': str(directory.relative_to(run))}
    recovered, result = diagnose(original, run, budget, retry=verify, capabilities={
        'probe_entry': {'description': '探测当前页面 iframe_hints 或 launch_links 明确声明的入口；arguments:{url}。浏览器实际观察结果返回原路由检查，不代表玩法验收。',
                        'execute': probe}})
    if recovered:
        return result
    original.auto_repair_attempted = True
    raise original
