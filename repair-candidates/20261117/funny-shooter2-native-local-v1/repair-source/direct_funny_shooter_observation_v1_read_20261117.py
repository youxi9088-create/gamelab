from pathlib import Path
import json, collections, hashlib, datetime
root = Path('D:/GameLab/temp/direct-funny-shooter-local-20261117-v1/validation')
p = root / 'browser-events.jsonl'
data = p.read_bytes()
rows = [json.loads(line) for line in data.splitlines() if line]
resources = [row for row in rows if row.get('type') == 'resource']
seq = [row['seq'] for row in rows]
print(json.dumps({'at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'event_count': len(rows), 'contiguous': seq == list(range(1, len(rows)+1)),
 'resources': len(resources), 'statuses': dict(collections.Counter(str(r.get('responseStatus')) for r in resources)),
 'bad': [r for r in rows if r.get('type') not in ['observer_started', 'resource']],
 'raw_sha256': hashlib.sha256(data).hexdigest(), 'raw_events': rows}, ensure_ascii=False))
