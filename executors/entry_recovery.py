"""AI-selected declared entry probes return to the original routing check."""
import copy
import ipaddress
import json
import subprocess
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
    choices = []
    for key in ('iframe_hints', 'launch_links', 'loader_hints'):
        for row in discovery.get(key, []):
            if isinstance(row, dict) and isinstance(row.get('url'), str) and row['url'] not in [c['url'] for c in choices]:
                choices.append({'entry_id': str(len(choices)+1), 'url': row['url'], 'source': key})
    allowed = {row['url'] for row in choices}
    by_id = {row['entry_id']: row['url'] for row in choices}
    def selected(arguments):
        url = arguments.get('url')
        if 'entry_id' in arguments:
            found = by_id.get(str(arguments['entry_id']))
            if not found or (url is not None and url != found):
                raise ValueError('入口编号无效或与 URL 不一致；从本轮声明入口清单选择 entry_id')
            url = found
        if not isinstance(url, str) or url not in allowed:
            raise ValueError('只能探测本任务采集页面明确声明的入口；arguments 必须包含清单中的 entry_id 或完整 url')
        return url
    probes = []
    observed = {}
    def probe(arguments):
        url = selected(arguments)
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
        observed[url] = result
        # A probed public wrapper may itself declare the actual game loader.
        # Expand only from collector evidence, never a model-invented URL.
        for key in ('iframe_hints', 'launch_links', 'loader_hints'):
            for row in result.get('web_discovery', {}).get(key, []):
                child = row.get('url') if isinstance(row, dict) else None
                if not isinstance(child, str) or child in allowed or len(choices) >= 100:
                    continue
                item = {'entry_id':str(len(choices)+1), 'url':child, 'source':key}
                choices.append(item); allowed.add(child); by_id[item['entry_id']] = child
        entries = result.get('web_discovery', {}).get('entries', [])
        current.setdefault('web_discovery', {})['entries'] = entries
        current['entry_recovery'] = {'declared_url': url, 'evidence': result.get('evidence', {})}
        return {'url': url, 'entries': entries, 'declared_entries':choices, 'controls':result.get('web_discovery',{}).get('launch_controls',[]),
                'evidence_directory': str(directory.relative_to(run))}
    def validate_dom(arguments):
        url, label = selected(arguments), arguments.get('label')
        prior = observed.get(url)
        if not prior or label not in [c.get('label') for c in prior.get('web_discovery',{}).get('launch_controls',[]) if c.get('visible')]:
            raise ValueError('DOM 验证必须选择本轮已探测入口中实际可见的按钮文本')
        return url, label
    def probe_dom(arguments):
        from controlplane.runtime import node_binary
        url, label = validate_dom(arguments)
        directory = Path(run)/'entry-probes'/f'dom-{len(probes)+1}'
        directory.mkdir(parents=True,exist_ok=False);probes.append(url)
        result = subprocess.run([node_binary(),str(Path(__file__).with_name('dom-entry.cjs')),url,label,str(directory)],
                                capture_output=True,encoding='utf-8',errors='replace',timeout=budget.remaining(100))
        proof=json.loads((directory/'interaction.json').read_text('utf-8'))
        if result.returncode or not proof.get('passed'):
            raise ValueError(proof.get('failure') or 'DOM 入口实际交互未通过')
        if proof.get('kind') == 'canvas-entry':
            canvas_entries = proof.get('entries') or []
            entry({'web_discovery': {'entries': canvas_entries}})
            current.setdefault('web_discovery', {})['entries'] = canvas_entries
        else:
            current.setdefault('web_discovery',{})['entries']=[{'url':proof['url'],'referer':proof.get('referer') or url,
                'evidence':'interactive-dom','interaction_verified':True,'interaction_evidence':str(directory.relative_to(run)/'interaction.json')}]
        return proof
    recovered, result = diagnose(original, run, budget, retry=verify, capabilities={
        'probe_entry': {'description': '探测页面明确声明的入口；返回 action:"probe_entry",arguments:{entry_id:"清单编号"}（也支持完整 url）。必须提交 arguments。浏览器实际观察结果返回原路由检查，不代表玩法验收。声明入口清单：'+json.dumps(choices,ensure_ascii=False),
                        'validate': selected,
                        'diagnostic_only': True,
                        'execute': probe},
        'verify_dom_entry': {'description':'对本轮 probe_entry 已观察到的 DOM 游戏执行真实按钮交互；arguments:{entry_id:"清单编号",label:"可见按钮原文"}，也支持清单完整 url。label 必须是已返回 controls 的可见按钮原文。验证画面与界面变化后返回原入口节点，不代表完整玩法验收。','validate':validate_dom,'execute':probe_dom}})
    if recovered:
        return result
    from auto_repair import safe
    report_path = Path(run) / 'auto-repair/report.json'
    if report_path.is_file():
        attempts = json.loads(report_path.read_text('utf-8')).get('attempts', [])
        failures = [a['verification_error'] for a in attempts if a.get('verification_error')]
        if failures:
            original = Blocked('入口恢复未通过：' + safe(failures[-1]) + '；已保留本轮探测与交互证据，尚未进入离线玩法验证。')
    original.auto_repair_attempted = True
    raise original
