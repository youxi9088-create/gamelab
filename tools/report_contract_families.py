"""Read-only cross-game contract observations; never promotes executable rules."""
import argparse,json
from collections import defaultdict
from pathlib import Path


def summarize(root):
    groups=defaultdict(list)
    if root.exists():
        for file in root.glob('*.json'):
            row=json.loads(file.read_text('utf-8'))
            if row.get('schema')==1 and row.get('family'):groups[row['family']].append(row)
    return {'scope':'Observation counts are historical evidence, not current acceptance or automatic rule promotion.',
        'families':[{'family':family,'features':rows[0]['features'],'selected':rows[0]['selected'],
            'runs':len({r['run'] for r in rows}),'sources':sorted({r.get('entry','') for r in rows}),
            'startup_evidence_runs':len({r['run'] for r in rows if r.get('verification')=='startup-only'}),
            'failed_evidence_runs':len({r['run'] for r in rows if r.get('verification')=='failed'}),
            'promotion':'requires regression evidence and supported adapter; never inferred from sample count'}
            for family,rows in sorted(groups.items())]}


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]/'executors/runs/contract-observations')
    args=parser.parse_args();print(json.dumps(summarize(args.root),ensure_ascii=False,indent=2))
