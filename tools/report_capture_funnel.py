"""Read-only Web conversion funnel; no job mutations or inferred acceptance."""
import argparse
from collections import Counter,defaultdict
import json
import urllib.request
import http.cookiejar
from urllib.parse import urlsplit


def summarize(state):
    candidates={c['id']:c for c in state.get('candidates',[])}
    versions={v['id']:v for v in state.get('versions',[])}
    groups=defaultdict(Counter)
    for job in state.get('jobs',[]):
        if job.get('status')=='superseded':continue
        source=urlsplit(candidates.get(job.get('candidate_id'),{}).get('url',''))
        if source.scheme not in ('http','https'):continue
        group=groups[source.hostname];group['submitted']+=1
        status=job.get('status','unknown');group['status_'+status]+=1
        if not job.get('started_at'):continue
        group['started']+=1
        version=versions.get(job.get('version_id'),{})
        report=version.get('report') or {}
        if version.get('artifact_id'):group['artifact_saved']+=1
        if isinstance(report.get('runtime_smoke'),dict) and report['runtime_smoke'].get('passed') is True:group['startup_verified']+=1
        if report.get('verification_stage') in ('tutorial','gameplay') and report.get('verification_evidence') and report.get('acceptance_actions'):
            group['interaction_verified']+=1
        if status=='review':group['awaiting_review']+=1
        if status=='completed':group['human_completed']+=1
        if status in ('failed','blocked'):group['blocked_or_failed']+=1
    return {'schema':1,'scope':'Current job states grouped by source host; rounds are not independent samples. Queued/unstarted jobs excluded from completion denominator; historical gaps stay unknown.',
        'sources':{host:{**counts,'awaiting_or_completed_ratio':(counts['awaiting_review']+counts['human_completed'])/counts['started'] if counts['started'] else None} for host,counts in sorted(groups.items())}}


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--url',default='http://127.0.0.1:8765');parser.add_argument('--output')
    args=parser.parse_args()
    opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    with opener.open(args.url+'/api/session',timeout=15) as response:response.read()
    with opener.open(args.url+'/api/state',timeout=30) as response:state=json.load(response)
    result=json.dumps(summarize(state),ensure_ascii=False,indent=2)
    if args.output:
        from pathlib import Path
        Path(args.output).write_text(result,'utf-8')
    print(result)
