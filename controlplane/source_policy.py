"""Known source gates, checked before dispatch.

Every entry here must be backed by observed captures, not by reputation: a host is
listed only after repeated acquisitions came back with the same gate. The point is
to stop spending conversion rounds on sources that cannot produce a runnable entry
under our policy (we do not circumvent publisher site locks).
"""
import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlparse


@lru_cache(maxsize=1)
def rules():
    return json.loads((Path(__file__).resolve().parents[1] / 'web/source-policy.json').read_text('utf-8'))


def host_policy(url):
    """Gate recorded for this source host, or None when the source is not known to be blocked."""
    host = (urlparse(url or '').hostname or '').strip().lower()
    if not host:
        return None
    for entry in rules()['hosts']:
        name = str(entry.get('host', '')).strip().lower()
        if not name:
            continue
        if host == name or host.endswith('.' + name):
            return {**entry, 'matched_host': host}
    return None


def blocked(items, key='url'):
    """Split into ([(item, gate), ...], [free item, ...])."""
    gated, free = [], []
    for item in items:
        url = item.get(key) if isinstance(item, dict) else item
        gate = host_policy(url or '')
        if gate:
            gated.append((item, gate))
        else:
            free.append(item)
    return gated, free


def describe(pairs):
    """One-line operator-facing summary, e.g. for a dispatch refusal. Hosts, deduplicated."""
    parts = []
    for item, policy in pairs:
        url = (item.get('url') if isinstance(item, dict) else item) or ''
        host = urlparse(url).hostname or url or '?'
        label = policy.get('label') or policy.get('policy')
        text = '{}（{}）'.format(host, label)
        if text not in parts:
            parts.append(text)
    return '；'.join(parts)
