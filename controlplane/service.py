import hashlib
import json
import secrets
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
        p=urlsplit(value.strip())
        require(p.scheme in ('https','http') and p.hostname and not p.username and not p.password,'需要有效的 HTTP(S) 来源地址')
        query=[(k,v) for k,v in parse_qsl(p.query,keep_blank_values=True) if not k.lower().startswith('utm_') and k not in ('fbclid','gclid')]
        return urlunsplit((p.scheme.lower(),p.netloc.lower(),p.path.rstrip('/') or '/',urlencode(sorted(query)),''))
    except (AttributeError,ValueError):
        raise ApiError(400,'无效的来源地址')

class Service:
    def __init__(self,data_dir,repo_dir,play_url):
        self.data_dir=data_dir
        self.store=Store(data_dir/'platform.sqlite3')
        self.repo=Repository(repo_dir,data_dir/'artifacts')
        self.play_url=play_url
        with self.store.tx() as db:
            if not self.store.get(db,'settings','main'):
                self.store.put(db,'settings',dict(id='main',concurrency=2,lease_seconds=300,max_attempts=3,rea_minutes=45,reconstruct_minutes=180,repair_rounds=3,timezone='Asia/Shanghai',auto_publish=False))
            for name,url in [('Astrocade','https://www.astrocade.com/'),('Remix','https://remix.gg/'),('Rosebud','https://rosebud.ai/play/c/new'),('itch.io','https://itch.io/games/html5'),('Poki','https://poki.com/'),('CrazyGames','https://www.crazygames.com/')]:
                key=name.lower().replace('.','-')
                if not self.store.get(db,'sources',key):
                    self.store.put(db,'sources',dict(id=key,name=name,url=url,enabled=True,created_at=now()))

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
            state={k:self.store.all(db,k) for k in ('candidates','sources','batches','jobs','versions','tools','events')}
            for job in state['jobs']:
                job.pop('lease_token',None)
            for tool in state['tools']:
                tool['online']=bool(tool.get('last_seen') and tool['last_seen']>later(-90))
            state['settings']=self.get(db,'settings','main')
            state['repository']={'path':str(self.repo.root),'strategy':'monorepo','branch':'main','head':self.repo.run('rev-parse','HEAD'),'remote_configured':bool(self.repo.run('remote'))}
            today=datetime.now(timezone(timedelta(hours=8))).date().isoformat()
            def day(t):
                return datetime.fromisoformat(t).astimezone(timezone(timedelta(hours=8))).date().isoformat() if t else ''
            state['metrics']={
                'discovered':sum(day(c['created_at'])==today for c in state['candidates']),
                'acquired':sum(day(c.get('acquired_at'))==today for c in state['candidates']),
                'recovered':len({j['candidate_id'] for j in state['jobs'] if day(j.get('completed_at'))==today and j.get('route')=='A' and j['status'] in ('review','completed')}),
                'reconstructed':len({j['candidate_id'] for j in state['jobs'] if day(j.get('completed_at'))==today and j.get('route')=='B' and j['status'] in ('review','completed')}),
                'imported':sum(day(c.get('imported_at'))==today for c in state['candidates']),
                'review':sum(v['status']=='review' for v in state['versions']),
                'running':sum(j['status']=='running' for j in state['jobs']),
                'errors':sum(j['status'] in ('failed','blocked') for j in state['jobs']),
                'library':len({v['candidate_id'] for v in state['versions'] if v['status'] in ('approved','published')}),
                'trend':[]}
            for offset in range(6,-1,-1):
                d=(datetime.now(timezone(timedelta(hours=8)))-timedelta(days=offset)).date().isoformat()
                state['metrics']['trend'].append({'date':d,'acquired':sum(day(c.get('acquired_at'))==d for c in state['candidates']),'imported':sum(day(c.get('imported_at'))==d for c in state['candidates'])})
            return state

    def lease(self,db,job_id,body,tool):
        job=self.get(db,'jobs',job_id)
        require(tool is not None,'此接口需要工具凭证',401)
        require(job['status']=='running' and job.get('tool_id')==tool['id'] and secrets.compare_digest(job.get('lease_token',''),str(body.get('lease_token',''))) and job.get('lease_expires_at','')>now(),'执行租约已过期或不属于此工具',409)
        return job

    def mutate(self,path,body,tool=None,idem=None):
        require(isinstance(body,dict),'请求体必须是 JSON 对象')
        scope=(tool['id'] if tool else 'admin')+':'+path
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
        if kind=='candidates' and key and action=='update' and not tool:
            c=self.get(db,'candidates',key)
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
                    require(not any(j['candidate_id']==cid and j['status'] in ('queued','running','review') for j in s.all(db,'jobs')),'候选已有活动任务',409)
                    job=dict(id=ident('job'),candidate_id=cid,batch_id=key,stage='rea',status='queued',route=None,progress=0,attempt=0,created_at=now(),reason='',report={})
                    s.put(db,'jobs',job)
                batch['status']='running';batch['started_at']=now()
                s.event(db,f"批次启动：{batch['name']}",batch_id=key)
            elif action=='pause':
                require(batch['status']=='running','批次当前不可暂停',409);batch['status']='paused'
            elif action=='resume':
                require(batch['status']=='paused','批次未暂停',409);batch['status']='running'
            else: raise ApiError(404,'未知批次操作')
            s.put(db,'batches',batch);return {'batch':batch}
        if kind=='jobs' and key=='claim':
            require(tool,'领取任务需要工具凭证',401)
            settings=self.get(db,'settings','main')
            jobs=s.all(db,'jobs')
            for j in jobs:
                if j['status']=='running' and j.get('lease_expires_at','')<now():
                    j['status']='failed' if j['attempt']>=settings['max_attempts'] else 'queued'
                    j['reason']='执行租约超时';j.pop('lease_token',None);s.put(db,'jobs',j)
                    s.event(db,'执行租约超时，已保留阶段产物',j['id'],j['stage'])
            running=[j for j in jobs if j['status']=='running']
            if len(running)>=settings['concurrency']:return {'job':None}
            caps=set(b.get('capabilities',[])) & set(tool['capabilities'])
            for job in reversed(jobs):
                batch=self.get(db,'batches',job['batch_id'])
                if job['status']!='queued' or job['stage'] not in caps or batch['status']!='running':continue
                if job['attempt']>=settings['max_attempts']:
                    job.update(status='blocked',reason='达到最大执行次数');s.put(db,'jobs',job);continue
                job.update(status='running',attempt=job['attempt']+1,tool_id=tool['id'],worker_id=str(b.get('worker_id',''))[:120],lease_token=secrets.token_urlsafe(24),lease_expires_at=later(settings['lease_seconds']),started_at=now())
                s.put(db,'jobs',job);s.event(db,f"{tool['name']} 领取任务",job['id'],job['stage'])
                c=self.get(db,'candidates',job['candidate_id'])
                if c.get('source_bundle_id'):
                    c=dict(c,source_bundle_url='/api/v1/source-bundles/'+c['source_bundle_id']+'/download')
                return {'job':dict(job,input=c,settings=settings)}
            return {'job':None}
        if kind=='jobs' and key:
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
                job.update(status='queued',reason='',progress=0,attempt=0);job.pop('lease_token',None)
                batch=self.get(db,'batches',job['batch_id']);batch['status']='running';s.put(db,'batches',batch)
                s.put(db,'jobs',job);s.event(db,'管理员重新排队，历史事件保留',key,job['stage'])
                return {'job':job}
            job=self.lease(db,key,b,tool)
            if action in ('heartbeat','events'):
                job['lease_expires_at']=later(self.get(db,'settings','main')['lease_seconds'])
                job['progress']=max(0,min(99,int(b.get('progress',job['progress']))))
                if action=='events':s.event(db,str(b.get('message',''))[:5000],key,str(b.get('stage',job['stage']))[:60])
                s.put(db,'jobs',job);return {'ok':True,'lease_expires_at':job['lease_expires_at']}
            if action=='complete':
                outcome=b.get('outcome'); report=b.get('report',{})
                require(isinstance(report,dict),'report 必须为对象')
                require(outcome in ('recovered','fallback','ready_review','blocked','failed'),'未知处理结果')
                job['report']=report;job['reason']=str(b.get('reason',''))[:5000]
                if outcome=='fallback':
                    require(job['stage']=='rea','只有 REA 阶段可以转复刻',409)
                    job.update(status='queued',stage='reconstruct',route='B',progress=0,attempt=0)
                elif outcome in ('recovered','ready_review'):
                    require((outcome=='recovered' and job['stage']=='rea') or (outcome=='ready_review' and job['stage']=='reconstruct'),'结果与任务阶段不匹配',409)
                    artifact=self.get(db,'artifacts',b.get('artifact_id',''))
                    require(artifact['job_id']==key and artifact['lease_token']==job['lease_token'],'产物不属于当前执行',409)
                    candidate=self.get(db,'candidates',job['candidate_id'])
                    version=dict(id=ident('v'),candidate_id=candidate['id'],job_id=key,artifact_id=artifact['id'],title=candidate['title'],status='review',entry=artifact['entry'],report=report,created_at=now(),route='A' if outcome=='recovered' else 'B')
                    version.update(self.repo.record(candidate,version,artifact))
                    version['preview_url']=self.play_url+'/play/'+artifact['id']+'/'+artifact['entry']
                    version['screenshots']=[self.play_url+'/play/'+artifact['id']+'/'+f for f in artifact['files'] if f.startswith('screenshots/') and f.lower().endswith(('.png','.jpg','.jpeg','.webp'))]
                    version['cover']=version['screenshots'][0] if version['screenshots'] else ''
                    s.put(db,'versions',version)
                    candidate['status']='review';candidate.setdefault('acquired_at',now());s.put(db,'candidates',candidate)
                    self.refresh_candidate(db,candidate['id'])
                    job.update(status='review',route=version['route'],progress=100,completed_at=now(),version_id=version['id'])
                else:job.update(status=outcome,completed_at=now())
                job.pop('lease_token',None);job.pop('lease_expires_at',None);s.put(db,'jobs',job)
                s.event(db,f"阶段结束：{outcome}。{job['reason']}",key,job['stage'])
                self.update_batch(db,job['batch_id'])
                return {'job':job}
        if kind=='artifacts' and tool:
            job=self.lease(db,b.get('job_id',''),b,tool)
            artifact_id=ident('artifact')
            try: info=self.repo.save_artifact(artifact_id,b.get('files',{}),b.get('entry','index.html'))
            except ValueError as e:raise ApiError(400,str(e))
            artifact=dict(id=artifact_id,job_id=job['id'],lease_token=job['lease_token'],created_at=now(),report=b.get('report',{}),**info)
            s.put(db,'artifacts',artifact)
            return {'artifact_id':artifact_id,**info}
        if kind=='versions' and key and not tool:
            version=self.get(db,'versions',key);candidate=self.get(db,'candidates',version['candidate_id'])
            if action=='approve':
                require(version['status']=='review','版本不在待验收状态',409)
                checks=b.get('checks',{})
                require(all(checks.get(x) is True for x in ('gameplay','visual','rights')),'请确认玩法、画面和使用范围三项验收')
                require(candidate['rights'] in ('owned','licensed','open'),'先补充代码与素材使用范围')
                version.update(status='approved',approved_at=now(),checks=checks)
                candidate['status']='approved';candidate.setdefault('imported_at',now())
                job=self.get(db,'jobs',version['job_id']);job['status']='completed';s.put(db,'jobs',job)
            elif action=='reject':
                require(version['status']=='review','版本不在待验收状态',409)
                require(str(b.get('reason','')).strip(),'填写修复意见')
                version.update(status='rejected',reason=str(b['reason'])[:3000])
                job=self.get(db,'jobs',version['job_id']);job.update(status='blocked',reason=version['reason']);s.put(db,'jobs',job)
            elif action=='publish':
                require(version['status']=='approved','只有验收通过的版本可以发布',409)
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
            limits={'concurrency':(1,8),'lease_seconds':(30,1800),'max_attempts':(1,10),'rea_minutes':(1,180),'reconstruct_minutes':(1,600),'repair_rounds':(1,5)}
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
        if batch['status']=='paused':return
        jobs=[j for j in self.store.all(db,'jobs') if j['batch_id']==bid]
        if jobs and all(j['status']=='completed' for j in jobs):batch['status']='completed'
        elif jobs and all(j['status'] in ('completed','failed','blocked','review') for j in jobs):batch['status']='attention'
        self.store.put(db,'batches',batch)
