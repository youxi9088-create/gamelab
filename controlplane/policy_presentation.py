"""Readable scope pauses; persisted task lifecycle and history stay unchanged."""
import json
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=1)
def rules():
    return json.loads((Path(__file__).resolve().parents[1]/'web/policy-pause.json').read_text('utf-8'))


def web_pause(job):
    if not job.get('web_only') or job.get('status') != 'waiting_input':
        return None
    reason = job.get('reason') or job.get('question') or ''
    config = rules()
    if not reason.startswith(tuple(config['prefixes'])):
        return None
    rule = next(r for r in config['rules'] if not r['match'] or any(text in reason for text in r['match']))
    return {key: value for key, value in rule.items() if key != 'match'}
