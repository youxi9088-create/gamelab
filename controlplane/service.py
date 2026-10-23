import hashlib
import json
import secrets
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from .store import Store, now, later, ident
from .repository import Repository

class ApiError(Exception):
    def __init__(self,status,message):
        self.status,self.message=status,message

def require(condition,message,status=400):
    if not condition:
        raise ApiError(status,message)

def canonical_url(value):
    try:
        value=value.strip()
        if value.startswith('#小程序://'):
            require(bool(re.fullmatch(r'#小程序://[^/\s\x00-\x1f]{1,120}/[A-Za-z0-9_-]{1,128}',value)), '需要完整的微信小程序分享链接')
            return value
        p=urlsplit(value.strip())
        require(p.scheme in ('https','http') and p.hostname and not p.username and not p.password,'需要有效的 HTTP(S) 来源地址')
        query=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not k.lower().startswith('utm_') and k not in ('fbclid','gclid')]
        return urlunsplit((p.scheme.lower(),p.netloc.lower(),p.path.rstrip('/') or '/',urlencode(sorted(query)),''))
    except (AttributeError,ValueError):
        raise ApiError(400,'无效的来源地址')

from .conversations import Conversations
from .discovery import Discovery

class Service(Conversations,Discovery):
    def __init__(self,data_dir,repo_dir,play_url):
        self.data_dir=data_dir
        self.store=Store(data_dir/'platform.sqlite3')
        self.repo=Repository(repo_dir,data_dir/'artifacts')
        self.play_url=play_url
        with self.store.tx() as db:
            if not self.store.get(db,'settings','main'):
                self.store.put(db,'settings',dict(id='main',concurrency=1,lease_seconds=300,max_attempts=3,rea_minutes=45,reconstruct_minutes=180,repair_rounds=3,timezone='Asia/Shanghai',auto_publish=False))
            for name,url in [('Astrocade','https://www.astrocade.com/'),('Remix','https://remix.gg/'),('Rosebud','https://rosebud.ai/play/c/new'),('itch.io','https://itch.io/games/html5'),('Poki','https://poki.com/'),('CrazyGames','https://www.crazygames.com/')]:
                key=name.lower().replace('.','-')
                if not self.store.get(db,'sources',key):
                    self.store.put(db,'sources',dict(id=key,name=name,url=url,enabled=True,created_at=now()))

            self.reconcile_history(db)

    def authenticate(self,token):
        with self.store.tx() as db:
            row=db.execute('SELECT tool_id FROM credentials WHERE token_hash=?',(hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
            require(row,'接入凭证无效',401)
            tool=self.store.get(db,'tools',row[0])
            require(tool and tool.get('enabled'),'工具已停用',403)
            return tool

    def get(self,db,kind,key):
        item=self.store.get(db,kind,key)
        require(item is not None,'记录不存在',404)
        return item

    def state(self):
        with self.store.tx() as db:
            state={k:self.store.all(db,k) for k in ('candidates','sources','batches','jobs','versions','tools','events','messages','rounds')}
            from .catalog_facets import effective_engine
            for candidate in state['candidates']:
                candidate['engine']=effective_engine(candidate,state['versions'])
            state['game_test_runs']=self.store.all(db,'game_test_runs')
            profiles={p['id']:p for p in self.store.all(db,'game_profiles')}
            for version in state['versions']:
                if version['id'] in profiles:
                    version['game_profile']=profiles[version['id']]['profile']
            from .game_catalog import index as game_catalog_index
            state['game_catalog']=game_catalog_index(state['candidates'],state['versions'])
            from .usage import aggregate,operations,game_totals
            usage=self.store.all(db,'ai_usage')
            state['game_conversion_stats']=game_totals(state['candidates'],state['jobs'],state['events'],usage)
            state['usage']={p:aggregate(usage,p) for p in ('day','week','month')}
            state['operation_stats']={p:operations(state['events'],state['jobs'],p) for p in ('day','week','month')}
            state['ai_pricing']=(self.store.get(db,'settings','ai_pricing') or {}).get('rates',{})
            from .conversations import message_presentation
            for message in state['messages']:
                message['presentation']=message_presentation(message,state['jobs'],state['events'],state['rounds'])
            actor_names={u['id']:u['username'] for u in self.store.all(db,'users')}
            for collection in ('jobs','messages','versions','candidates'):
                for row in state[collection]:
                    if row.get('created_by'):row['created_by_name']=actor_names.get(row['created_by'],row['created_by'])
            state['features']={'link_batches':True,'pipeline_timeline':True}
            state['features']['discovery']=True
            state['features']['supply']=True
            from .web_profiles import public_profiles
            state['web_profiles']=public_profiles()
            from .supply import public as supply_public, configuration as supply_configuration
            state['supply']=[supply_public(r) for r in self.store.all(db,'supply')]
            state['supply_deliveries']=[{k:r[k] for k in ('id','candidate_id','version_id','version_status','prepared_at',
                'template_structure','archive_bytes','files','downstream_size_limits_pass','sha256','manual_acceptance_guide') if k in r}
                for r in self.store.all(db,'supply_deliveries')]
            templates={r['template']['template_id'] for r in state['supply'] if isinstance(r.get('template'),dict) and r['template'].get('template_id')}
            state['downstream_summary']={'templates':len(templates),'published':len({r['template']['template_id'] for r in state['supply'] if r.get('state')=='published' and isinstance(r.get('template'),dict) and r['template'].get('template_id')}),'scope':'仅下游实际返回模板 ID 的记录；提交成功不计入模板生成'}
            state['supply_config']=supply_configuration()
            from .supply_config import settings as supply_settings, KEYS
            supply_settings_value=supply_settings()
            state['supply_service']={**state['supply_config'],
                'values':{k:supply_settings_value.get(k,'') for k in KEYS if k!='SUPPLY_APP_SECRET'},
                'has_secret':bool(supply_settings_value.get('SUPPLY_APP_SECRET')),
                'check':self.store.get(db,'supply_checks','main') or {}}
            from .discovery import config
            state['discovery_settings']=config(self.store,db)
            for collection in ('recommendations','discovery_runs'):
                state[collection]=self.store.all(db,collection)
            from .discovery_language import public as chinese_recommendation
            state['recommendations']=[chinese_recommendation(r) for r in state['recommendations']]
            from .dependencies import summary
            from .catalog_facets import facets
            for candidate in state['candidates']:
                candidate['catalog_facets']=facets(candidate,state['discovery_settings']['aliases'])
                candidate['dependency_summary']=summary(candidate.get('dependencies'))
                from .web_profiles import profiles,supports
                candidate['web_restore_profiles']=[p['id'] for p in profiles() if supports(candidate.get('url',''),p['profile'])]
            for job in state['jobs']:
                from .conversion_plan import build as conversion_plan
                c=next((c for c in state['candidates'] if c['id']==job['candidate_id']),{})
                job['conversion_plan']=job.get('conversion_plan') or conversion_plan(c,continuation=bool(job.get('continuation')),stage=job.get('stage','rea'))
                job.pop('lease_token',None)
                from .pipeline import timeline, progress_summary
                job['pipeline']=timeline(job,state['events'],state['versions'])
                job['progress_label']=progress_summary(job,state['versions'])
                version=next((v for v in state['versions'] if v['id']==job.get('version_id')),None)
                job['has_draft']=bool(version and version['status']=='draft')
                job['last_attempt_status']=job['status']
                job['display_status']='needs_work' if job['status'] in ('blocked','failed') and not job.get('blocker') and job['has_draft'] and version.get('report',{}).get('runtime_verified') else job['status']
                if job.get('dependency_pending') and job['status']=='blocked':job['display_status']='dependency_pending'
            for tool in state['tools']:
                tool['online']=bool(tool.get('last_seen') and tool['last_seen']>later(-90))
            state['settings']=self.get(db,'settings','main')
            state['settings']['concurrency']=1
            batches={b['id']:b for b in state['batches']}
            queue=sorted((j for j in reversed(state['jobs']) if j['status']=='queued' and batches.get(j.get('batch_id'),{}).get('status')=='running'),key=lambda j:j.get('queued_at',j.get('created_at','')))
            for position,job in enumerate(queue,1):
                job['queue_position']=position
                job['progress_label']=f'排队第 {position} 位 · 等待空闲执行器'
            state['conversion_queue']={'limit':1,'running':sum(j['status']=='running' for j in state['jobs']),'waiting':len(queue)}
            state['repository']={'path':str(self.repo.root),'strategy':'monorepo','branch':'main','head':self.repo.run('rev-parse','HEAD'),'remote_configured':bool(self.repo.run('remote'))}
            today=datetime.now(timezone(timedelta(hours=8))).date().isoformat()
            def day(t):
                return datetime.fromisoformat(t).astimezone(timezone(timedelta(hours=8))).date().isoformat() if t else ''
            state['metrics']={
                'submitted_today':sum(day(c['created_at'])==today for c in state['candidates']),
                'converting_games':len({j['candidate_id'] for j in state['jobs'] if j['status'] in ('queued','running')}),
                'pending_review_games':len({v['candidate_id'] for v in state['versions'] if v['status']=='review'}),
                'accepted_games':len({c['id'] for c in state['candidates'] if c.get('imported_at')} | {v['candidate_id'] for v in state['versions'] if v['status'] in ('approved','published')}),
                'discovered':sum(day(c['created_at'])==today for c in state['candidates']),
                'acquired':sum(day(c.get('acquired_at'))==today for c in state['candidates']),
                'recovered':len({j['candidate_id'] for j in state['jobs'] if day(j.get('completed_at'))==today and j.get('route')=='A' and j['status'] in ('review','completed')}),
                'reconstructed':len({j['candidate_id'] for j in state['jobs'] if day(j.get('completed_at'))==today and j.get('route')=='B' and j['status'] in ('review','completed')}),
                'imported':sum(day(c.get('imported_at'))==today for c in state['candidates']),
                'review':sum(v['status']=='review' for v in state['versions']),
                'running':sum(j['status']=='running' for j in state['jobs']),
                'waiting_input':sum(j['status']=='waiting_input' for j in state['jobs']),
                'errors':sum(j['status']=='failed' or j['display_status']=='blocked' for j in state['jobs']),
                'library':len({v['candidate_id'] for v in state['versions'] if v['status'] in ('approved','published')}),
                'trend':[]}
            for offset in range(6,-1,-1):
                d=(datetime.now(timezone(timedelta(hours=8)))-timedelta(days=offset)).date().isoformat()
                state['metrics']['trend'].append({'date':d,'submitted':sum(day(c['created_at'])==d for c in state['candidates']),'acquired':sum(day(c.get('acquired_at'))==d for c in state['candidates']),'imported':sum(day(c.get('imported_at'))==d for c in state['candidates'])})
            from .dashboard import production_metrics
            state['metrics']['production'] = production_metrics(state)
            from .dashboard_operations import overview as operational_overview
            state['dashboard_operations']=operational_overview(state,usage)
            return state

    def lease(self,db,job_id,body,tool):
        job=self.get(db,'jobs',job_id)
        require(tool is not None,'此接口需要工具凭证',401)
        require(job['status']=='running' and job.get('tool_id')==tool['id'] and secrets.compare_digest(job.get('lease_token',''),str(body.get('lease_token',''))) and job.get('lease_expires_at','')>now(),'执行租约已过期或不属于此工具',409)
        return job

    def mutate(self,path,body,tool=None,idem=None):
        require(isinstance(body,dict),'请求体必须是 JSON 对象')
        from .store import ACTOR
        scope=(tool['id'] if tool else (ACTOR.get() or {}).get('id','admin'))+':'+path
        digest=hashlib.sha256(json.dumps(body,sort_keys=True).encode()).hexdigest()
        with self.store.tx() as db:
            if idem:
                require(len(idem)<=160,'幂等键过长')
                row=db.execute('SELECT body_hash,response FROM idempotency WHERE scope=? AND key=?',(scope,idem)).fetchone()
                if row:
                    require(row[0]==digest,'同一幂等键不能用于不同请求',409)
                    return json.loads(row[1])
            result=self._mutate(db,path,body,tool)
            if idem:
                db.execute('INSERT INTO idempotency VALUES (?,?,?,?)',(scope,idem,digest,json.dumps(result,ensure_ascii=False)))
            return result

    def _mutate(self,db,path,b,tool):
        if path=='/api/ai-pricing' and not tool:
            from .usage import validate_pricing
            try:rates=validate_pricing(b.get('rates'))
            except ValueError as exc:raise ApiError(400,str(exc)) from None
            self.store.put(db,'settings',{'id':'ai_pricing','rates':rates,'updated_at':now()})
            return {'rates':rates}
        s=self.store
        parts=path.strip('/').split('/')
        external=parts[:2]==['api','v1']
        if external:
            require(tool,'需要 Bearer 接入凭证',401)
            parts=['api']+parts[2:]
        elif tool:
            raise ApiError(403,'工具仅可使用 /api/v1 接口')
        kind=parts[1] if len(parts)>1 else ''
        key=parts[2] if len(parts)>2 else None
        action=parts[3] if len(parts)>3 else None
        if tool:
            tool=self.get(db,'tools',tool['id'])
            tool['last_seen']=now(); s.put(db,'tools',tool)
            require(kind in ('candidates','jobs','artifacts','source-bundles','heartbeat'),'工具无权调用管理接口',403)
        if kind=='heartbeat' and tool:
            return {'ok':True,'server_time':now()}
        if kind=='discovery' and not tool:
            return self.discovery_mutate(db,parts,b)
        if kind=='supply' and key and not tool:
            from .supply import public as supply_public
            row=self.get(db,'supply',key)
            require(row.get('lease_until',0)<=__import__('time').time(),'供货处理中，请稍后重试',409)
            require(row['status'] in ('pending','blocked','retrying'),'当前供货记录不可修改；下游要求改包时请交付并验收新版本',409)
            if action=='metadata':
                require(not row.get('archive_sha256'),'已开始提交，不能改动原提交；请重试原记录或交付新版本',409)
                metadata=b.get('metadata')
                require(isinstance(metadata,dict),'供货资料必须为 JSON 对象')
                require(set(metadata)<=set(('license_declaration','acceptance_steps','known_limitations','contact_note')),'存在未知供货字段')
                declaration=metadata.get('license_declaration',{})
                require(isinstance(declaration,dict) and declaration.get('distributable')=='yes' and isinstance(declaration.get('owner'),str) and declaration['owner'].strip(),'需要真实可分发声明及权利人')
                require(len(json.dumps(metadata,ensure_ascii=False).encode())<100000,'供货资料过大')
                if 'acceptance_steps' in metadata:
                    steps=metadata['acceptance_steps']
                    require(isinstance(steps,list) and all(isinstance(x,dict) for x in steps) and any(x.get('action') in ('click','key','drag') for x in steps),'验收路径至少包含一次 click/key/drag 操作')
                if 'known_limitations' in metadata:
                    require(isinstance(metadata['known_limitations'],list) and all(isinstance(x,str) for x in metadata['known_limitations']),'限制必须为字符串数组')
                if 'contact_note' in metadata:
                    require(isinstance(metadata['contact_note'],str) and len(metadata['contact_note'])<=500,'备注不能超过 500 字')
                row['metadata']=metadata
            else:
                require(action=='retry','未知供货操作',404)
            row.update(status='pending' if not row.get('submitted') else 'tracking',next_poll=0,updated_at=now(),
                       error_code='',notice='已更新，等待后台重新检查',next_action='none')
            s.put(db,'supply',row)
            s.event(db,'供货资料更新或重试',stage='supply',version_id=key,action=action)
            return {'supply':supply_public(row)}
        if kind=='conversions' and not tool:
            if 'urls' in b:
                raw=b['urls']
                require(isinstance(raw,list) and 1<=len(raw)<=100,'每批提交 1–100 个链接')
                urls=list(dict.fromkeys(canonical_url(u) for u in raw))
                name=str(b.get('name') or '链接复刻批次').strip()
                require(0<len(name)<=120,'批次名称为 1–120 字符')
                candidates=[]; reused=[]
                for url in urls:
                    existing=next((c for c in s.all(db,'candidates') if c['canonical_url']==url),None)
                    history=[j for j in s.all(db,'jobs') if existing and j['candidate_id']==existing['id']]
                    active=next((j for j in history if j['status'] in ('queued','running','review','completed','waiting_input')),None)
                    if active:
                        reused.append({'url':url,'candidate_id':existing['id'],'job_id':active['id'],'status':active['status']})
                        continue
                    require(not history,'已有未完成任务，请在原任务继续修复，不重复创建批次',409)
                    title=url[len('#小程序://'):].split('/')[0] if url.startswith('#小程序://') else urlsplit(url).hostname
                    candidate=self._mutate(db,'/api/candidates',dict(url=url,title=title,source='链接批量转换'),None)['candidate']
                    candidate['automatic']=True;s.put(db,'candidates',candidate)
                    candidates.append(candidate)
                batch=None; jobs=[]
                if candidates:
                    batch=self._mutate(db,'/api/batches',dict(name=name,candidate_ids=[c['id'] for c in candidates]),None)['batch']
                    batch=self._mutate(db,f"/api/batches/{batch['id']}/start",{'automatic':True},None)['batch']
                    jobs=[j for j in s.all(db,'jobs') if j['batch_id']==batch['id']]
                return {'batch':batch,'jobs':jobs,'reused':reused,'submitted':len(raw),'unique':len(urls)}
            url=canonical_url(b.get('url',''))
            existing=next((c for c in s.all(db,'candidates') if c['canonical_url']==url),None)
            if existing:
                active=next((j for j in s.all(db,'jobs') if j['candidate_id']==existing['id'] and j['status'] in ('queued','running','review','completed','waiting_input')),None)
                if active:return {'candidate':existing,'job':active,'deduplicated':True}
            title=url[len('#小程序://'):].split('/')[0] if url.startswith('#小程序://') else urlsplit(url).hostname
            candidate=self._mutate(db,'/api/candidates',dict(url=url,title=title,source='链接自动转换'),None)['candidate']
            candidate['automatic']=True
            s.put(db,'candidates',candidate)
            batch=self._mutate(db,'/api/batches',dict(name='链接自动转换',candidate_ids=[candidate['id']]),None)['batch']
            self._mutate(db,f"/api/batches/{batch['id']}/start",{},None)
            job=next(j for j in s.all(db,'jobs') if j['batch_id']==batch['id'])
            job['automatic']=True;s.put(db,'jobs',job)
            return {'candidate':candidate,'job':job,'deduplicated':False}
        if kind=='candidates' and key is None:
            if tool: require('collect' in tool['capabilities'],'缺少 collect 能力',403)
            title=str(b.get('title','')).strip()
            require(0<len(title)<=120,'游戏名称为 1–120 字符')
            url=canonical_url(b.get('url',''))
            if tool: require(not b.get('source_path'),'采集工具不能提交本地文件路径',403)
            existing=next((c for c in s.all(db,'candidates') if c['canonical_url']==url),None)
            source_id=tool['id'] if tool else 'manual'
            record={'id':ident('src'),'url':url,'tool_id':source_id,'source':str(b.get('source','手动提交'))[:80],'created_at':now()}
            if existing:
                if not any(r['tool_id']==source_id and r['url']==url for r in existing['source_records']):
                    existing['source_records'].append(record)
                existing['last_seen']=now(); s.put(db,'candidates',existing)
                return {'candidate':existing,'deduplicated':True}
            cover=str(b.get('cover',''))
            require(not cover or cover.startswith(('https://','http://','/assets/')),'无效封面地址')
            rights=b.get('rights','unknown')
            require(rights in ('unknown','owned','licensed','open'),'无效的使用范围')
            candidate=dict(id=ident('game'),title=title,url=url,canonical_url=url,source=record['source'],category=str(b.get('category','休闲'))[:40],engine=str(b.get('engine','待分析'))[:60],description=str(b.get('description',''))[:3000],cover=cover,status='candidate',rights=rights,created_at=now(),last_seen=now(),source_records=[record],source_path=b.get('source_path','') if not tool else '',observations=b.get('observations',{}),screenshots=b.get('screenshots',[])[:10])
            s.put(db,'candidates',candidate);s.event(db,f'新候选：{title}',candidate_id=candidate['id'])
            return {'candidate':candidate,'deduplicated':False}
        if kind=='candidates' and key and action=='spec-test-report':
            c=self.get(db,'candidates',key)
            job=self.lease(db,b.get('job_id'),b,tool) if tool else self.get(db,'jobs',b.get('job_id'))
            require(job['candidate_id']==key,'测试结果不属于当前游戏',403)
            report=b.get('report')
            from .game_specs import digest
            require(c.get('game_spec') and isinstance(report,dict),'先登记规格，再登记测试结果')
            require(report.get('spec_digest')==digest(c['game_spec']),'测试结果对应的规格已过期',409)
            rows=report.get('cases',[])
            require(isinstance(rows,list) and 0<len(rows)<=50,'测试结果用例无效')
            expected={x['id'] for x in c['game_spec']['cases']}
            require(all(isinstance(x,dict) and x.get('id') in expected and x.get('status') in ('passed','failed','blocked','manual_required') for x in rows),'用例或结果状态无效')
            require(len({r['id'] for r in rows})==len(rows),'测试结果存在重复用例')
            from .game_specs import verification_gaps
            gaps=verification_gaps(c['game_spec'],report)
            record=dict(id=ident('test'),candidate_id=key,job_id=job['id'],created_at=now(),report=report,gaps=gaps,passed=not gaps)
            s.put(db,'game_test_runs',record)
            s.event(db,'规格测试：'+('通过已声明用例' if not gaps else '未通过，'+str(len(gaps))+' 项待处理'),job['id'],'test',node='test',node_status='succeeded' if not gaps else 'failed')
            return {'test_run':record}
        if kind=='candidates' and key and action=='game-spec':
            c=self.get(db,'candidates',key)
            if tool:
                job=self.lease(db,b.get('job_id'),b,tool)
                require(job['candidate_id']==key,'规格不属于当前任务',403)
            previous=c.get('game_spec',{})
            require(b.get('revision',0)==previous.get('revision',0),'规格已更新，请重新读取',409)
            from .game_specs import normalize
            try:value=normalize(b.get('spec'))
            except ValueError as exc:raise ApiError(400,str(exc))
            value.update(revision=previous.get('revision',0)+1,updated_at=now())
            c['game_spec']=value;s.put(db,'candidates',c)
            s.put(db,'game_specs',dict(id=ident('spec'),candidate_id=key,**value))
            return {'spec':value}
        if kind=='candidates' and key and action=='dependencies':
            c=self.get(db,'candidates',key)
            if tool:
                job=self.lease(db,b.get('job_id',''),b,tool)
                require(job['candidate_id']==key,'依赖清单不属于当前任务',403)
            else:
                require(not any(j['candidate_id']==key and j['status']=='running' for j in s.all(db,'jobs')),'任务正在执行，请等待本轮结束后编辑依赖',409)
            previous=c.get('dependencies',{})
            require(b.get('revision')==previous.get('revision',0),'依赖清单已更新，请重新读取',409)
            from .dependencies import normalize,summary
            try: value=normalize(b.get('dependencies'))
            except ValueError as exc: raise ApiError(400,str(exc))
            value.update(revision=previous.get('revision',0)+1,updated_at=now())
            c['dependencies']=value;s.put(db,'candidates',c)
            s.put(db,'dependency-history',dict(id=ident('dep'),candidate_id=key,**value))
            s.event(db,'更新依赖清单：'+str(len(value['items']))+' 项',candidate_id=key)
            return {'dependencies':value,'summary':summary(value)}
        if kind=='candidates' and key and action=='update' and not tool:
            c=self.get(db,'candidates',key)
            if 'url' in b:
                url=canonical_url(b['url'])
                if url!=c['canonical_url']:
                    jobs=[j for j in s.all(db,'jobs') if j['candidate_id']==key]
                    require(all(j['status'] in ('blocked','failed','waiting_input','stopped') for j in jobs),'任务执行或排队中，不能修改来源地址',409)
                    require(not any(v['candidate_id']==key for v in s.all(db,'versions')) and not c.get('source_bundle_id') and not c.get('source_path') and not c.get('acquired_at'),'已有代码或版本，不能替换来源地址',409)
                    require(not any(other['id']!=key and other['canonical_url']==url for other in s.all(db,'candidates')),'此地址已有游戏记录',409)
                    old=c['url']
                    c.setdefault('url_history',[]).append(dict(url=old,changed_at=now()))
                    c.update(url=url,canonical_url=url,last_seen=now())
                    s.event(db,f'修正游戏来源地址：{old} → {url}',candidate_id=key)
            if 'title' in b:
                title=b['title']
                require(isinstance(title,str) and 0<len(title.strip())<=120,'游戏名称需要 1–120 个字符')
                title=title.strip()
                if title!=c['title']:
                    old=c['title'];c.setdefault('original_title',old)
                    c.update(title=title,title_edited=True)
                    for version in s.all(db,'versions'):
                        if version['candidate_id']==key:
                            version.setdefault('original_title',version['title']);version['title']=title
                            s.put(db,'versions',version)
                    s.event(db,f'游戏重命名：{old} → {title}',candidate_id=key)
            require(b.get('rights',c['rights']) in ('unknown','owned','licensed','open'),'无效使用范围')
            for field in ('source_path','observations','rights','description','category'):
                if field in b: c[field]=b[field]
            s.put(db,'candidates',c)
            return {'candidate':c}
        if kind=='source-bundles' and tool:
            require('collect' in tool['capabilities'],'需要 collect 能力',403)
            candidate=self.get(db,'candidates',b.get('candidate_id',''))
            require(not any(j['candidate_id']==candidate['id'] and j['status']=='running' for j in s.all(db,'jobs')),'游戏正在执行，不能替换输入包',409)
            bundle_id=ident('bundle')
            try:info=self.repo.save_artifact(bundle_id,b.get('files',{}),b.get('entry','index.html'))
            except ValueError as e:raise ApiError(400,str(e))
            item=dict(id=bundle_id,candidate_id=candidate['id'],tool_id=tool['id'],created_at=now(),**info)
            s.put(db,'source-bundles',item)
            candidate.update(source_bundle_id=bundle_id,entry=info['entry'])
            candidate.setdefault('acquired_at',now())
            s.put(db,'candidates',candidate)
            s.event(db,'采集工具提交源码资源包',candidate_id=candidate['id'])
            return {'bundle_id':bundle_id,**info}
        if kind=='batches' and not tool:
            if not key:
                ids=list(dict.fromkeys(b.get('candidate_ids',[])))
                require(0<len(ids)<=100,'每批需要 1–100 款游戏')
                for cid in ids: self.get(db,'candidates',cid)
                name=str(b.get('name','')).strip()
                require(0<len(name)<=120,'填写批次名称')
                batch=dict(id=ident('batch'),name=name,candidate_ids=ids,status='draft',created_at=now())
                s.put(db,'batches',batch)
                return {'batch':batch}
            batch=self.get(db,'batches',key)
            if action=='start':
                require(batch['status']=='draft','只有草稿批次可以启动',409)
                for cid in batch['candidate_ids']:
                    require(not any(j['candidate_id']==cid and j['status'] in ('queued','running','review','waiting_input') for j in s.all(db,'jobs')),'候选已有活动任务',409)
                    job=dict(id=ident('job'),candidate_id=cid,batch_id=key,stage='rea',status='queued',automatic=bool(b.get('automatic')),route=None,progress=0,attempt=0,created_at=now(),reason='',report={})
                    s.put(db,'jobs',job)
                batch['status']='running';batch['started_at']=now()
                s.event(db,f"批次启动：{batch['name']}",batch_id=key)
            elif action=='pause':
                require(batch['status']=='running','批次当前不可暂停',409);batch['status']='paused'
            elif action=='resume':
                require(batch['status'] in ('paused','stopped'),'批次未暂停或停止',409)
                for job in s.all(db,'jobs'):
                    if job['batch_id']!=key or job['status']!='stopped':continue
                    require(not any(other['candidate_id']==job['candidate_id'] and other['id']!=job['id'] and other['status'] in ('queued','running','review','waiting_input') for other in s.all(db,'jobs')),'游戏已有后续活动任务，请先处理后续任务',409)
                    job.update(status='queued',queued_at=now(),attempt=0,automatic=bool(b.get('automatic',job.get('automatic',False))))
                    s.put(db,'jobs',job)
                batch['status']='running'
                s.event(db,'批次恢复，未完成任务重新排队',batch_id=key)
            elif action=='stop':
                jobs=[j for j in s.all(db,'jobs') if j['batch_id']==key and j['status'] in ('queued','running')]
                require(jobs,'此批次没有排队或执行中的任务',409)
                for job in jobs:
                    job.update(status='stopped',stopped_at=now())
                    job.pop('lease_token',None);job.pop('lease_expires_at',None)
                    s.put(db,'jobs',job);s.event(db,'批次已停止，执行租约撤销；已有成果保留',job['id'],job['stage'])
                batch['status']='stopped'
            elif action=='retry':
                jobs=[j for j in s.all(db,'jobs') if j['batch_id']==key and j['status'] in ('failed','blocked')]
                require(jobs,'此批次没有失败或阻断任务可重试',409)
                for job in jobs:
                    self.continue_job(db,job,job.get('reason') or '重试失败任务，保留既有要求',resume_checkpoint=True)
                batch['status']='running'
                s.event(db,f'批次重试 {len(jobs)} 个异常任务，其他任务保持不变',batch_id=key)
            else: raise ApiError(404,'未知批次操作')
            s.put(db,'batches',batch);return {'batch':batch}
        if kind=='jobs' and key=='claim':
            require(tool,'领取任务需要工具凭证',401)
            if (s.get(db,'settings','maintenance') or {}).get('draining'):return {'job':None}
            settings=self.get(db,'settings','main')
            jobs=s.all(db,'jobs')
            for j in jobs:
                if j['status']=='running' and j.get('lease_expires_at','')<now():
                    j['status']='failed' if j['attempt']>=settings['max_attempts'] else 'queued'
                    j['reason']='执行租约超时';j.pop('lease_token',None);s.put(db,'jobs',j)
                    s.event(db,'执行租约超时，已保留阶段产物',j['id'],j['stage'])
            running=[j for j in jobs if j['status']=='running']
            # Global capacity, across tools and all conversion entry points.
            if len(running)>=1:return {'job':None}
            caps=set(b.get('capabilities',[])) & set(tool['capabilities'])
            for job in sorted(reversed(jobs),key=lambda j:j.get('queued_at',j.get('created_at',''))):
                batch=self.get(db,'batches',job['batch_id'])
                if job['status']!='queued' or job['stage'] not in caps or batch['status']!='running':continue
                if b.get('automatic_only') and not job.get('automatic'):continue
                if job['attempt']>=settings['max_attempts']:
                    job.update(status='blocked',reason='达到最大执行次数');s.put(db,'jobs',job);continue
                job.update(status='running',attempt=job['attempt']+1,tool_id=tool['id'],worker_id=str(b.get('worker_id',''))[:120],lease_token=secrets.token_urlsafe(24),lease_expires_at=later(settings['lease_seconds']),started_at=now())
                s.put(db,'jobs',job);s.event(db,f"{tool['name']} 领取任务",job['id'],job['stage'])
                c=self.get(db,'candidates',job['candidate_id'])
                c['status']='running';s.put(db,'candidates',c)
                if c.get('source_bundle_id'):
                    c=dict(c,source_bundle_url='/api/v1/source-bundles/'+c['source_bundle_id']+'/download')
                return {'job':dict(job,input=self.continuation_input(db,job,c),settings={**settings,'concurrency':1})}
            return {'job':None}
        if kind=='jobs' and key:
            if action=='delete' and not tool:
                job=self.get(db,'jobs',key)
                require(job['status'] in ('blocked','failed','stopped'),'只能删除已停止的错误任务',409)
                cid=job['candidate_id'];bid=job['batch_id']
                require(not any(v.get('candidate_id')==cid for v in s.all(db,'versions')),'已有版本，不能删除任务',409)
                require(not any(j['id']!=key and j['candidate_id']==cid for j in s.all(db,'jobs')),'候选存在其他任务，不能删除',409)
                batch=self.get(db,'batches',bid)
                require(batch['candidate_ids']==[cid],'批次含其他游戏，不能删除整个输入记录',409)
                records=[]
                for row in db.execute('SELECT kind,id,data FROM records').fetchall():
                    kind,rid,raw=row;value=json.loads(raw)
                    if kind.startswith('deleted-'):continue
                    if (kind=='jobs' and rid==key) or (kind=='candidates' and rid==cid) or (kind=='batches' and rid==bid) or value.get('job_id')==key or value.get('candidate_id')==cid or value.get('batch_id')==bid:
                        records.append(dict(kind=kind,id=rid,data=value))
                archive=dict(id=ident('deleted'),job_id=key,deleted_at=now(),records=records)
                s.put(db,'deleted-tasks',archive)
                for record in records:
                    db.execute('DELETE FROM records WHERE kind=? AND id=?',(record['kind'],record['id']))
                return {'deleted_job_id':key,'archive_id':archive['id']}
            if action=='work-log' and not tool:
                job=self.get(db,'jobs',key)
                message=str(b.get('message','')).strip()
                require(10<=len(message)<=4000,'请填写实际处理结果与尚未完成事项')
                self.message(db,job,'assistant',message,kind='progress')
                s.event(db,message,key,'work-log')
                return {'job_id':key,'recorded':True}
            if action=='dependency-plan' and not tool:
                job=self.get(db,'jobs',key)
                require(job['status'] in ('waiting_input','blocked','failed'),'任务执行中或已验收，不能改为依赖处理',409)
                candidate=self.get(db,'candidates',job['candidate_id'])
                require(candidate.get('dependencies'),'请先提交依赖清单')
                reason=str(b.get('reason','')).strip()
                require(10<=len(reason)<=4000,'请说明依赖处理计划')
                job.update(status='blocked',dependency_pending=True,reason=reason)
                for field in ('question','lease_token','lease_expires_at','completed_at'):job.pop(field,None)
                s.put(db,'jobs',job);candidate['status']='blocked';s.put(db,'candidates',candidate)
                self.message(db,job,'assistant',reason,kind='progress')
                s.event(db,'已转入依赖分析与适配，保留原任务和材料',key,'dependency-analysis')
                self.update_batch(db,job['batch_id'])
                return {'job':job}
            if action=='request-input' and not tool:
                return self.request_job_input(db,self.get(db,'jobs',key),b.get('question',''))
            if action=='message' and not tool:
                return self.continue_job(db,self.get(db,'jobs',key),b.get('message',''))
            if action=='restore-web' and not tool:
                from .web_profiles import configure
                return configure(self,db,self.get(db,'jobs',key),b.get('profile_id'))
            if action=='reconstruct' and not tool:
                job=self.get(db,'jobs',key)
                require(job['status'] in ('queued','blocked','failed') and job['stage']=='rea','只能将尚未执行或已阻断的 REA 任务转为玩法重建',409)
                reason=str(b.get('reason','')).strip()
                require(len(reason)>=10,'请记录跳过代码恢复的具体原因')
                candidate=self.get(db,'candidates',job['candidate_id'])
                require(candidate.get('observations'),'玩法重建需要先提供玩法观察材料')
                job.update(status='queued',stage='reconstruct',route='B',progress=0,attempt=0,reason=reason,report={'routing':'explicit_reconstruction','rea_attempted':False,'reason':reason})
                job.pop('lease_token',None);job.pop('lease_expires_at',None)
                batch=self.get(db,'batches',job['batch_id']);batch['status']='running';s.put(db,'batches',batch)
                s.put(db,'jobs',job);s.event(db,'明确选择玩法重建（不表示反编译失败）：'+reason,key,'reconstruct')
                return {'job':job}
            if action=='retry' and not tool:
                job=self.get(db,'jobs',key)
                require(job['status'] in ('blocked','failed'),'只能重试失败或阻断任务',409)
                return self.continue_job(db,job,b.get('message') or '继续当前任务，沿用最新版本、原资源和已有用户要求；根据未完成项继续修复。不要把上轮结果说明当作新的用户要求，不要假称已完成。',resume_checkpoint=not bool(b.get('message')))
            job=self.lease(db,key,b,tool)
            if action=='usage':
                from .usage import record
                try:row=record(s,db,job,b.get('usage'),(s.get(db,'settings','ai_pricing') or {}).get('rates',{}))
                except ValueError as exc:raise ApiError(400,str(exc)) from None
                return {'id':row['id']}
            if action=='plan':
                plan=b.get('plan')
                require(isinstance(plan,dict) and len(json.dumps(plan))<30000,'分流报告格式无效')
                job['conversion_plan']=plan;s.put(db,'jobs',job)
                s.event(db,'分流选择：'+str(plan.get('label','')),key,'analysis',conversion_plan=plan,round=job.get('round',1))
                return {'ok':True}
            if action=='ask':
                question=b.get('question','')
                require(isinstance(question,str) and 0<len(question.strip())<=8000,'请填写具体问题')
                self.message(db,job,'assistant',question.strip(),kind='question')
                job.update(status='waiting_input',question=question.strip(),reason=question.strip())
                candidate=self.get(db,'candidates',job['candidate_id']);candidate['status']='waiting_input';s.put(db,'candidates',candidate)
                job.pop('lease_token',None);job.pop('lease_expires_at',None)
                s.put(db,'jobs',job);self.update_batch(db,job['batch_id'])
                return {'job':job}
            if action=='acquired':
                require(job.get('automatic') and job['stage']=='rea','仅自动采集阶段可提交观察材料',409)
                observations=b.get('observations')
                require(isinstance(observations,dict) and len(json.dumps(observations))<300000,'观察材料格式无效或过大')
                candidate=self.get(db,'candidates',job['candidate_id'])
                candidate.update(observations=observations,title=candidate['title'] if candidate.get('title_edited') else str(b.get('title') or candidate['title'])[:120],acquired_at=now())
                s.put(db,'candidates',candidate)
                s.event(db,'链接采集完成，已保存来源材料',key,'acquire')
                return {'ok':True}
            if action in ('heartbeat','events'):
                job['lease_expires_at']=later(self.get(db,'settings','main')['lease_seconds'])
                job['progress']=max(0,min(99,int(b.get('progress',job['progress']))))
                if action=='events':
                    extra={}
                    if 'node' in b or 'node_status' in b:
                        from .pipeline import STAGES, STATUSES
                        require(b.get('node') in dict(STAGES) and b.get('node_status') in STATUSES,'无效流水线节点或状态')
                        extra=dict(node=b['node'],node_status=b['node_status'],round=job.get('round',1),attempt=job.get('attempt',1))
                    s.event(db,str(b.get('message',''))[:5000],key,str(b.get('stage',job['stage']))[:60],**extra)
                s.put(db,'jobs',job);return {'ok':True,'lease_expires_at':job['lease_expires_at']}
            if action=='complete':
                finished_round=job.get('round',1)
                finished_stage=job['stage']
                outcome=b.get('outcome'); report=b.get('report',{})
                require(isinstance(report,dict),'report 必须为对象')
                require(outcome in ('recovered','fallback','ready_review','draft','blocked','failed','checkpoint'),'未知处理结果')
                job['report']=report;job['reason']=str(b.get('reason',''))[:5000]
                if job.get('conversion_plan'):report['conversion_plan']=job['conversion_plan']
                if outcome=='checkpoint':
                    from pathlib import Path
                    cp=b.get('checkpoint',{})
                    require(job.get('continuation') and job['stage']=='reconstruct','只有续作可保存接续检查点',409)
                    require(isinstance(cp,dict) and isinstance(cp.get('run'),str) and re.fullmatch(r'[0-9a-f-]{36}',cp['run']),'无效检查点')
                    root=Path(__file__).resolve().parents[1]/'executors/runs'/cp['run']
                    try:
                        binding=json.loads((root/'job-binding.json').read_text('utf-8'))
                        require(binding=={'job_id':key,'lease_sha256':hashlib.sha256(job['lease_token'].encode()).hexdigest()},'检查点不属于当前租约',409)
                        f=root/'revision-checkpoint.json';require(f.stat().st_size<=6*1024*1024,'检查点超过容量限制')
                        require(hashlib.sha256(f.read_bytes()).hexdigest()==cp.get('sha256'),'检查点摘要不匹配',409)
                        require(cp.get('base_version_id')==job.get('base_version_id'),'检查点基线不匹配',409)
                    except (OSError,ValueError):raise ApiError(400,'检查点不可读')
                    job['revision_checkpoint']={k:cp[k] for k in ('run','sha256','base_version_id')}
                    job['checkpoint_slices']=job.get('checkpoint_slices',0)+1
                    if job['checkpoint_slices']>=3:
                        job.update(status='blocked',blocker={'code':'REVISION_EXECUTION_LIMIT','reason':'已连续接续三段，仍未完成当前验证','next_action':'检查保存的修复与失败报告，补齐验证能力后恢复'},reason='已达到连续续跑上限；完整上下文和失败报告已保留，可从检查点恢复')
                    else:job.update(status='queued',attempt=0,reason='续作检查点已保存，自动继续未完成的修改和验证')
                    candidate=self.get(db,'candidates',job['candidate_id']);candidate['status']=job['status'];s.put(db,'candidates',candidate)
                    self.message(db,job,'system',job['reason'],kind='progress')
                elif outcome=='fallback':
                    require(job['stage']=='rea','只有 REA 阶段可以转复刻',409)
                    job.update(status='queued',stage='reconstruct',route='B',progress=0,attempt=0)
                elif outcome in ('recovered','ready_review','draft'):
                    require((outcome=='recovered' and job['stage']=='rea') or (outcome in ('ready_review','draft') and job['stage']=='reconstruct'),'结果与任务阶段不匹配',409)
                    artifact=self.get(db,'artifacts',b.get('artifact_id',''))
                    require(artifact['job_id']==key and artifact['lease_token']==job['lease_token'],'产物不属于当前执行',409)
                    gaps=[]
                    dependency_record=self.get(db,'candidates',job['candidate_id']).get('dependencies')
                    if dependency_record:report['dependencies']=dependency_record
                    current_spec=self.get(db,'candidates',job['candidate_id']).get('game_spec')
                    if current_spec:report['game_spec']=current_spec
                    if job.get('automatic') or outcome=='draft':
                        from .delivery_requirements import delivery_gaps
                        gaps=delivery_gaps(report,artifact['files'])
                    elif dependency_record:
                        from .dependencies import gaps as dependency_gaps
                        gaps.extend(dependency_gaps(dependency_record))
                    if current_spec and not (job.get('automatic') or outcome=='draft'):
                        from .game_specs import verification_gaps, test_report
                        gaps.extend(verification_gaps(current_spec,test_report(report)))
                    is_draft=bool(gaps) or outcome=='draft'
                    if is_draft:
                        require(report.get('runtime_verified') is True,'未通过运行验证的结果不能作为可试玩草稿')
                        job['reason']+='。草稿已保存，基础还原待补齐：'+'；'.join(gaps)
                    candidate=self.get(db,'candidates',job['candidate_id'])
                    from .presentation import preview_settings
                    preview=preview_settings(report)
                    version=dict(id=ident('v'),candidate_id=candidate['id'],job_id=key,artifact_id=artifact['id'],title=candidate['title'],status='review',entry=artifact['entry'],report=report,created_at=now(),route='A' if outcome=='recovered' else 'B')
                    if job.get('continuation'):
                        version.update(base_version_id=job['base_version_id'],round=job.get('round',1),route='local',preview_mode='external')
                    version.update(self.repo.record(candidate,version,artifact))
                    if artifact.get('runtime_local'):version['preview_mode']='external'
                    version['preview_url']=self.play_url+('/runtime/' if artifact.get('runtime_local') else '/play/')+artifact['id']+'/'+artifact['entry']
                    version['screenshots']=[self.play_url+'/play/'+artifact['id']+'/'+f for f in artifact['files'] if f.startswith('screenshots/revision-' if job.get('continuation') else 'screenshots/') and f.lower().endswith(('.png','.jpg','.jpeg','.webp'))]
                    version['cover']=version['screenshots'][0] if version['screenshots'] else ''
                    version['preview']=preview
                    if is_draft:version['status']='draft'
                    s.put(db,'versions',version)
                    candidate['status']='review';candidate.setdefault('acquired_at',now());s.put(db,'candidates',candidate)
                    self.refresh_candidate(db,candidate['id'])
                    job.update(status='review',route=version['route'],progress=100,completed_at=now(),version_id=version['id'])
                    job.pop('revision_checkpoint',None);job.pop('checkpoint_slices',None);job.pop('blocker',None)
                    if is_draft:
                        job.update(status='blocked',progress=0)
                        candidate['status']='blocked';s.put(db,'candidates',candidate)
                    if report.get('runtime_verified'):
                        s.event(db,('运行已通过；剩余检查：'+'；'.join(gaps) if gaps else '运行证据已保存；本轮仍按草稿提交') if is_draft else '运行与交付检查通过，等待人工试玩验收',key,'test',node='test',node_status='waiting_input' if is_draft else 'succeeded',round=finished_round)
                    self.message(db,job,'assistant',job.get('reason') or '新版本已生成，请试玩验收',kind='result')
                    if is_draft:
                        from .auto_followup import decide
                        pending,blocker=decide(job.get('auto_followup'),gaps,report)
                        job['auto_followup']=pending
                        if blocker:
                            job['blocker']=blocker
                            job['reason']=str(blocker['reason'])+'；下一步：'+str(blocker['next_action'])
                            self.message(db,job,'assistant',job['reason'],kind='blocker')
                        else:
                            job.pop('blocker',None)
                            self.continue_job(db,job,'继续完成当前草稿的交付缺项，先检查和验证现有实现，仅修复实际失败项；不得伪造验证结论或降低验收标准。\n'+'\n'.join(gaps)[:6500],automatic_followup=True)
                else:
                    job.update(status=outcome,completed_at=now())
                    candidate=self.get(db,'candidates',job['candidate_id']);candidate['status']=outcome;s.put(db,'candidates',candidate)
                job.pop('lease_token',None);job.pop('lease_expires_at',None);s.put(db,'jobs',job)
                result_label={'draft':'草稿已保存，验证未完成','ready_review':'转换完成，等待人工验收','recovered':'产物已提交','checkpoint':'接续检查点已保存','fallback':'转入复刻路径','blocked':'本轮阻断','failed':'本轮失败'}[outcome]
                s.event(db,f"本轮结果：{result_label}。{str(b.get('reason',''))[:5000]}",key,finished_stage,round=finished_round)
                self.update_batch(db,job['batch_id'])
                return {'job':job}
        if kind=='artifacts' and tool:
            job=self.lease(db,b.get('job_id',''),b,tool)
            artifact_id=ident('artifact')
            try:
                if b.get('local_run'):
                    from pathlib import Path
                    tokenfile=self.data_dir/'executor-token.txt'
                    require(tokenfile.is_file(),'仅本机内置执行器可提交运行目录',403)
                    # Compare the registered credential without opening another write transaction.
                    token_hash=hashlib.sha256(tokenfile.read_text('utf-8').strip().encode()).hexdigest()
                    registered=db.execute('SELECT tool_id FROM credentials WHERE token_hash=?',(token_hash,)).fetchone()
                    require(registered and registered[0]==tool['id'],'仅本机内置执行器可提交运行目录',403)
                    name=b['local_run']
                    require(isinstance(name,str) and re.fullmatch(r'[0-9a-f-]{36}',name),'无效运行目录')
                    root=Path(__file__).resolve().parents[1]/'executors/runs'
                    run=root/name;source=run/'converted'
                    require(not run.is_symlink() and source.resolve().is_relative_to(run.resolve()) and run.resolve().is_relative_to(root.resolve()),'运行目录越界')
                    binding=json.loads((run/'job-binding.json').read_text('utf-8'))
                    require(binding=={'job_id':job['id'],'lease_sha256':hashlib.sha256(job['lease_token'].encode()).hexdigest()},'运行目录不属于当前租约',403)
                    from tools.import_local_review import snapshot
                    info=snapshot(self.repo,artifact_id,source,b.get('entry','index.html'))
                elif job.get('continuation'):
                    from .revision import revision_artifact
                    base=self.get(db,'versions',job['base_version_id'])
                    info=revision_artifact(self,artifact_id,base,b.get('changes'),b.get('entry',base['entry']),b.get('screenshots'))
                else:
                    info=self.repo.save_artifact(artifact_id,b.get('files',{}),b.get('entry','index.html'))
            except ValueError as e:raise ApiError(400,str(e))
            artifact=dict(id=artifact_id,job_id=job['id'],runtime_local=bool(job.get('continuation') or b.get('local_run')),lease_token=job['lease_token'],created_at=now(),report=b.get('report',{}),**info)
            s.put(db,'artifacts',artifact)
            return {'artifact_id':artifact_id,**info}
        if kind=='versions' and key and not tool:
            version=self.get(db,'versions',key);candidate=self.get(db,'candidates',version['candidate_id'])
            if action=='approve':
                require(version['status']=='review','版本不在待验收状态',409)
                from .game_specs import verification_gaps, test_report
                for spec in (version.get('report',{}).get('game_spec'),candidate.get('game_spec')):
                    if spec:require(not verification_gaps(spec,test_report(version.get('report',{}))),'游戏规格测试尚未通过，请继续修复或完成对应测试',409)
                from .dependencies import gaps as dependency_gaps
                for record in (version.get('report',{}).get('dependencies'),candidate.get('dependencies')):
                    if record:require(not dependency_gaps(record),'依赖尚未验证完成，请先继续适配并提交新版本',409)
                checks=b.get('checks',{})
                require(isinstance(checks,dict) and all(checks.get(x) is True for x in ('gameplay','visual')),'请确认玩法和画面两项验收')
                version.update(status='approved',approved_at=now(),checks={'gameplay':True,'visual':True},acceptance_scope='functional')
                candidate['status']='approved';candidate.setdefault('imported_at',now())
                job=self.get(db,'jobs',version['job_id']);job['status']='completed';s.put(db,'jobs',job)
                from .supply import enqueue
                enqueue(s,db,version)
            elif action=='reject':
                require(version['status']=='review','版本不在待验收状态',409)
                require(str(b.get('reason','')).strip(),'填写修复意见')
                version.update(status='rejected',reason=str(b['reason'])[:3000])
                job=self.get(db,'jobs',version['job_id']);s.put(db,'versions',version)
                self.continue_job(db,job,version['reason'])
                version['status']='superseded'
            elif action=='publish':
                require(version['status']=='approved','只有验收通过的版本可以发布',409)
                require(candidate['rights'] in ('owned','licensed','open'),'功能验收已通过；发布前请补充代码与素材使用范围')
                for old in s.all(db,'versions'):
                    if old['candidate_id']==candidate['id'] and old['status']=='published':
                        old['status']='approved';s.put(db,'versions',old)
                version.update(status='published',published_at=now());candidate.update(status='published',published_version_id=key)
            elif action=='unpublish':
                require(version['status']=='published','版本未发布',409)
                version['status']='approved';candidate['status']='approved';candidate.pop('published_version_id',None)
            else:raise ApiError(404,'未知版本操作')
            s.put(db,'versions',version);s.put(db,'candidates',candidate)
            self.refresh_candidate(db,candidate['id'])
            s.event(db,f"{candidate['title']}：{action}",version['job_id'],'review',version_id=key)
            self.update_batch(db,self.get(db,'jobs',version['job_id'])['batch_id'])
            return {'version':version}
        if kind=='tools' and not tool:
            if key and action=='toggle':
                item=self.get(db,'tools',key);item['enabled']=not item['enabled'];s.put(db,'tools',item);return {'tool':item}
            if not key:
                caps=b.get('capabilities',[])
                require(isinstance(caps,list) and caps and set(caps)<=set(['collect','rea','reconstruct']),'选择有效的工具能力')
                name=str(b.get('name','')).strip();require(0<len(name)<=100,'填写工具名称')
                item=dict(id=ident('tool'),name=name,capabilities=caps,enabled=True,last_seen=None,created_at=now())
                token=secrets.token_urlsafe(36)
                s.put(db,'tools',item);db.execute('INSERT INTO credentials VALUES (?,?)',(hashlib.sha256(token.encode()).hexdigest(),item['id']))
                return {'tool':item,'token':token}
        if kind=='sources' and not tool:
            if key and action=='toggle':
                item=self.get(db,'sources',key);item['enabled']=not item['enabled'];s.put(db,'sources',item);return {'source':item}
            name=str(b.get('name','')).strip();require(name,'填写来源名称')
            item=dict(id=ident('source'),name=name[:100],url=canonical_url(b.get('url','')),enabled=True,created_at=now())
            s.put(db,'sources',item);return {'source':item}
        if kind=='settings' and not tool:
            item=self.get(db,'settings','main')
            limits={'concurrency':(1,1),'lease_seconds':(30,1800),'max_attempts':(1,10),'rea_minutes':(1,180),'reconstruct_minutes':(1,600),'repair_rounds':(1,5)}
            for field,(low,high) in limits.items():
                if field in b:
                    require(isinstance(b[field],int) and low<=b[field]<=high,f'{field} 范围为 {low}–{high}')
                    item[field]=b[field]
            item['updated_at']=now();s.put(db,'settings',item);return {'settings':item}
        raise ApiError(404,'接口不存在')

    def refresh_candidate(self,db,cid):
        candidate=self.get(db,'candidates',cid)
        versions=[v for v in self.store.all(db,'versions') if v['candidate_id']==cid]
        published=next((v for v in versions if v['status']=='published'),None)
        if published:
            candidate.update(status='published',published_version_id=published['id'])
        else:
            candidate.pop('published_version_id',None)
            candidate['status']='approved' if any(v['status']=='approved' for v in versions) else 'review' if any(v['status']=='review' for v in versions) else 'candidate'
        self.store.put(db,'candidates',candidate)

    def update_batch(self,db,bid):
        batch=self.get(db,'batches',bid)
        if batch['status'] in ('paused','stopped'):return
        jobs=[j for j in self.store.all(db,'jobs') if j['batch_id']==bid]
        if jobs and all(j['status']=='completed' for j in jobs):batch['status']='completed'
        elif jobs and all(j['status'] in ('completed','failed','blocked','review','waiting_input','superseded') for j in jobs):batch['status']='attention'
        self.store.put(db,'batches',batch)
