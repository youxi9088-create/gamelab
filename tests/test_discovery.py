import tempfile
import unittest
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import patch
from controlplane.service import Service, ApiError
from controlplane.discovery import DiscoveryScheduler, TZ
from controlplane.discovery_scan import Page, scan, public_url


class DiscoveryTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        root=Path(self.tmp.name);self.s=Service(root/'data',root/'repo','http://127.0.0.1:8766')
        with self.s.store.tx() as db:
            for source in self.s.store.all(db,'sources'):
                source['enabled']=False;self.s.store.put(db,'sources',source)
        self.source=self.s.mutate('/api/sources',{'name':'fixture','url':'https://example.org'})['source']
        self.s.mutate('/api/candidates',{'title':'Existing','url':'https://example.org/existing','category':'益智'})
        self.result={'status':'success','games':[dict(url='https://example.org/game/a',title='Game A',category='Puzzle',gameplay='Match tiles',content_sha256='fixture',description_basis='test fixture')],
                     'categories':[dict(name='Racing',url='https://example.org/t/racing')],'errors':[],'coverage':'fixture'}
        self.scheduler=DiscoveryScheduler(self.s,lambda source:self.result)
        self.instant=datetime.now(TZ).replace(hour=12,minute=0)

    def test_daily_dedup_reject_and_category_comparison(self):
        self.scheduler.tick(self.instant)
        state=self.s.state();item=state['recommendations'][0]
        self.assertEqual(item['category'],'益智')
        self.assertFalse(item['platform_category_missing'])
        self.assertEqual(state['jobs'],[])
        self.assertTrue(state['discovery_runs'][0]['category_changes'][0]['platform_missing'])
        self.s.mutate('/api/discovery/reject',{'ids':[item['id']]})
        self.scheduler.tick(self.instant)
        self.assertEqual(len(self.s.state()['discovery_runs']),1)
        self.scheduler.tick(self.instant+timedelta(days=1))
        state=self.s.state()
        self.assertEqual(len(state['recommendations']),1)
        self.assertEqual(state['recommendations'][0]['status'],'rejected')
        self.assertEqual(state['discovery_runs'][0]['recommendation_ids'],[])
        self.assertEqual(state['discovery_runs'][0]['category_changes'],[])

    def test_approval_only_queues_capture_and_dispatch_needs_approval(self):
        self.scheduler.tick(self.instant)
        item=self.s.state()['recommendations'][0]
        with self.assertRaises(ApiError):self.s.mutate('/api/discovery/dispatch',{'ids':[item['id']]})
        self.s.mutate('/api/discovery/approve',{'ids':[item['id']]})
        self.assertEqual(self.s.state()['jobs'],[])
        result=self.s.mutate('/api/discovery/dispatch',{'ids':[item['id']]})
        self.assertEqual(len(result['jobs']),1)
        with self.assertRaises(ApiError):self.s.mutate('/api/discovery/dispatch',{'ids':[item['id']]})
        self.assertEqual(len(self.s.state()['jobs']),1)

    def test_delivery_recording_statistics_follow_one_isolated_task(self):
        from controlplane.delivery_requirements import REQUIRED
        self.scheduler.tick(self.instant)
        item=self.s.state()['recommendations'][0]
        self.s.mutate('/api/discovery/approve',{'ids':[item['id']]})
        self.assertEqual(self.s.state()['metrics']['converting_games'],0)
        job=self.s.mutate('/api/discovery/dispatch',{'ids':[item['id']]})['jobs'][0]
        self.assertEqual(self.s.state()['metrics']['converting_games'],1)
        tool=self.s.mutate('/api/tools',{'name':'Isolated statistics fixture','capabilities':['rea']})['tool']
        job=self.s.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},tool)['job']
        lease={'lease_token':job['lease_token']};prefix='/api/v1/jobs/'+job['id']
        usage={'call_id':'isolated-call','provider':'api','model':'fixture','stage':'adapt',
               'input_tokens':100,'output_tokens':25,'duration_seconds':2,'status':'succeeded'}
        for _ in range(2):self.s.mutate(prefix+'/usage',{**lease,'usage':usage},tool)
        self.s.mutate(prefix+'/usage',{**lease,'usage':dict(usage,call_id='unknown',input_tokens=None,output_tokens=None,status='failed')},tool)
        # Authored fixture evidence tests state accounting, not real game restoration.
        report={'runtime_verified':True,'recovery_kind':'discovered-web-cocos2','path':'A',
                'foundation_checks':{k:{'status':'verified','evidence':['index.html']} for k in REQUIRED}}
        artifact=self.s.mutate('/api/v1/artifacts',{**lease,'job_id':job['id'],
            'files':{'index.html':'<p>Authored statistics fixture</p>'},'entry':'index.html','report':report},tool)
        done=self.s.mutate(prefix+'/complete',{**lease,'outcome':'recovered',
            'artifact_id':artifact['artifact_id'],'report':report},tool)['job']
        state=self.s.state()
        self.assertEqual((state['metrics']['converting_games'],state['metrics']['pending_review_games'],state['metrics']['library']),(0,1,0))
        candidate=next(c for c in state['candidates'] if c['id']==job['candidate_id'])
        self.assertEqual(candidate['engine'],'Cocos 2')
        self.assertIn('Cocos',candidate['catalog_facets']['engines'])
        with self.s.store.tx() as db:
            self.assertEqual(self.s.store.get(db,'candidates',candidate['id'])['engine'],'待分析')
        for period in ('day','week','month'):
            row=state['usage'][period][0]
            self.assertEqual((row['calls'],row['input_tokens'],row['output_tokens'],row['unknown_usage_calls'],row['unknown_cost_calls']),(2,100,25,1,2))
        detail=next(r for r in state['dashboard_operations']['games'] if r['candidate_id']==candidate['id'])
        self.assertEqual((detail['calls'],detail['input_tokens']+detail['output_tokens'],detail['engine']),(2,125,'Cocos 2'))
        version=done['version_id']
        self.s.mutate('/api/versions/'+version+'/approve',{'checks':{'gameplay':True,'visual':True}})
        state=self.s.state()
        self.assertEqual((state['metrics']['pending_review_games'],state['metrics']['library'],state['metrics']['accepted_games']),(0,1,1))
        self.assertEqual(state['dashboard_operations']['weekly_accepted'],1)
        self.assertEqual(state['dashboard_operations']['calls'],2)
        with self.assertRaises(ApiError):
            self.s.mutate('/api/versions/'+version+'/approve',{'checks':{'gameplay':True,'visual':True}})
        self.assertEqual(self.s.state()['metrics']['library'],1)

    def test_manual_scan_atomic_selection_and_disabled_schedule(self):
        self.s.mutate('/api/discovery/settings',{'enabled':False})
        self.scheduler.tick(self.instant);self.assertEqual(self.s.state()['discovery_runs'],[])
        first=self.s.mutate('/api/discovery/scan',{})['run']
        self.assertEqual(first['id'],self.s.mutate('/api/discovery/scan',{})['run']['id'])
        self.scheduler.tick(self.instant)
        item=self.s.state()['recommendations'][0]
        with self.assertRaises(ApiError):self.s.mutate('/api/discovery/approve',{'ids':[item['id'],'missing']})
        self.assertEqual(self.s.state()['recommendations'][0]['status'],'pending')

    def test_source_failures_do_not_become_success(self):
        self.scheduler.scanner=lambda source:(_ for _ in ()).throw(ValueError('unavailable'))
        self.scheduler.tick(self.instant)
        run=self.s.state()['discovery_runs'][0]
        self.assertEqual(run['status'],'partial')
        self.assertEqual(run['sources'][0]['status'],'failed')
        self.assertEqual(self.s.state()['recommendations'],[])

    def test_opt_in_selection_limit_and_idempotent_dispatch(self):
        with self.assertRaises(ApiError):
            self.s.mutate('/api/discovery/settings',{'auto_select':True})
        self.s.mutate('/api/discovery/settings',{'auto_select':True,'auto_dispatch':True,
            'allowed_categories':['益智'],'score_threshold':40,'daily_limit':1})
        self.result['games'].append(dict(self.result['games'][0],url='https://example.org/game/b'))
        self.scheduler.tick(self.instant)
        state=self.s.state()
        self.assertEqual(len(state['jobs']),1)
        self.assertEqual(sorted(r['status'] for r in state['recommendations']),['dispatched','pending'])
        self.scheduler.tick(self.instant)
        self.assertEqual(len(self.s.state()['jobs']),1)
        self.assertEqual(self.s.state()['versions'],[])


class ScanTests(unittest.TestCase):
    def test_category_pages_are_not_games_and_rejected_links_not_refetched(self):
        fetched=[]
        def fetcher(url):
            fetched.append(url)
            if url.endswith('/robots.txt'):return 'User-agent: *\nAllow: /'
            return '<a href="/play/c/casual">Casual</a><a href="/play/a">A</a>'
        result=scan({'url':'https://example.org/','excluded_urls':['https://example.org/play/a']},fetcher)
        self.assertEqual(result['games'],[])
        self.assertEqual(result['suppressed'],1)
        self.assertEqual(result['status'],'success')
        self.assertNotIn('https://example.org/play/a',fetched)
        self.assertNotIn('https://example.org/play/c/casual',fetched)

    def test_array_schema_types_and_breadcrumbs(self):
        p=Page('<script type="application/ld+json">{"@graph":[{"@type":["VideoGame","WebApplication"],"name":"A","genre":"Puzzle","description":"Match"}]}</script>')
        self.assertEqual(p.game_metadata()['category'],'Puzzle')
        p=Page('<script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"item":{"@id":"https://itch.io/games/genre-visual-novel","name":"Visual Novel"}}]}</script>')
        self.assertEqual(p.game_metadata()['category'],'Visual Novel')

    def test_structured_metadata_and_bounded_links(self):
        listing='<a href="/game/a">A</a><a href="/t/puzzle">Puzzle</a>'
        detail='<script type="application/ld+json">{"@type":"VideoGame","name":"A","genre":"Puzzle","description":"Match tiles"}</script>'
        pages={'https://example.org/robots.txt':'User-agent: *\nAllow: /','https://example.org/':listing,'https://example.org/game/a':detail}
        result=scan({'url':'https://example.org/'},pages.__getitem__)
        self.assertEqual(result['games'][0]['gameplay'],'Match tiles')
        self.assertEqual(result['categories'][0]['name'],'Puzzle')
        self.assertEqual(result['status'],'success')

    def test_no_matches_and_robots_denial_not_success(self):
        for robots in ['User-agent: *\nDisallow: /','User-agent: *\nAllow: /']:
            result=scan({'url':'https://example.org/'},lambda url:robots if url.endswith('robots.txt') else '<html>dynamic app</html>')
            self.assertEqual(result['status'],'needs_adapter')
            self.assertEqual(result['games'],[])

    def test_private_destination_rejected(self):
        with patch('socket.getaddrinfo',return_value=[(2,1,6,'',('127.0.0.1',80))]):
            with self.assertRaises(ValueError):public_url('http://example.org')
        with self.assertRaises(ValueError):public_url('file:///etc/passwd')
