"""Read-only scan runner; keeps results outside the live platform database."""
import argparse
import http.cookiejar
import json
from pathlib import Path
import sys
import urllib.request
from datetime import datetime, timezone

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from controlplane.discovery_scan import scan

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source-id',required=True)
    parser.add_argument('--output',required=True)
    args=parser.parse_args()
    output=Path(args.output);output.mkdir(parents=True,exist_ok=True)
    def save(name,value):
        target=output/name;temp=target.with_suffix('.tmp')
        temp.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
        temp.replace(target)
    def progress(value):
        save('progress.json',dict(updated_at=datetime.now(timezone.utc).isoformat(),**value))
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def get(path):
        with opener.open('http://127.0.0.1:8765'+path,timeout=30) as response:return json.load(response)
    try:
        get('/api/session');state=get('/api/state')
        source=next(s for s in state['sources'] if s['id']==args.source_id)
        source['excluded_urls']=[r['url'] for r in state['recommendations']]+[c['canonical_url'] for c in state['candidates']]
        source['discovery_rule']={**source.get('discovery_rule',{}),'full_site':True}
        source['progress']=progress
        progress(dict(phase='starting',source=source['url']))
        result=scan(source)
        save('results.json',result)
        progress(dict(phase='finished',status=result['status'],new=len(result['games']),errors=len(result['errors']),coverage=result['coverage']))
    except Exception as exc:
        progress(dict(phase='failed',error=str(exc)))
        raise

if __name__=='__main__':main()
