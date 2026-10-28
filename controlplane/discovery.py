"""Daily recommendations and human selection, separate from conversion jobs."""
import hashlib
import re
import threading
from datetime import datetime, timedelta, timezone
from .store import ACTOR, ident, now
from .discovery_scan import DEFAULT_RULE, scan

TZ=timezone(timedelta(hours=8))
DEFAULTS={'id':'discovery','enabled':True,'hour':9,'max_games':12,'max_pages':2,
    'auto_select':False,'auto_dispatch':False,'score_threshold':85,'daily_limit':3,'allowed_categories':[],'aliases':{
    'puzzle':'益智','casual':'休闲','simulation':'模拟经营','racing':'竞速','action':'动作',
    'adventure':'冒险','arcade':'街机','survival':'生存','platformer':'平台跳跃','idle':'放置',
    'strategy':'策略','sports':'体育','multiplayer':'多人','rpg':'角色扮演','education':'教育',
    'sandbox':'沙盒','runner':'跑酷','running':'跑酷','shooting':'射击','shooter':'射击'}}


def config(store,db):
    return {**DEFAULTS, **(store.get(db,'settings','discovery') or {})}


def category(value, aliases):
    text=' '.join(str(value).strip().lower().split())
    text=re.sub(r'\s+games?(?:\s+\d+)?$','',text).strip()
    return aliases.get(text,text)


class Discovery:
    def discovery_mutate(self,db,parts,b):
        from .service import require,canonical_url
        s=self.store
        action=parts[2] if len(parts)>2 else ''
        if action=='settings':
            c=config(s,db)
            for k,lo,hi in [('hour',0,23),('max_games',1,50),('max_pages',1,10),('score_threshold',0,100),('daily_limit',1,20)]:
                if k in b:
                    require(type(b[k]) is int and lo<=b[k]<=hi,f'{k} 超出范围')
                    c[k]=b[k]
            if 'enabled' in b:
                require(type(b['enabled']) is bool,'enabled 必须为布尔值');c['enabled']=b['enabled']
            for key in ('auto_select','auto_dispatch'):
                if key in b:
                    require(type(b[key]) is bool,key+' 必须为布尔值');c[key]=b[key]
            if 'allowed_categories' in b:
                values=b['allowed_categories']
                require(isinstance(values,list) and len(values)<=50 and all(isinstance(v,str) and 0<len(v.strip())<=80 for v in values),'允许品类格式错误')
                c['allowed_categories']=list(dict.fromkeys(v.strip() for v in values))
            require(not c['auto_select'] or c['allowed_categories'],'启用自动选择需明确允许的游戏品类')
            require(not c['auto_dispatch'] or c['auto_select'],'自动派单需要先启用自动选择')
            if 'aliases' in b:
                require(isinstance(b['aliases'],dict) and len(b['aliases'])<=200,'品类别名格式错误')
                require(all(isinstance(k,str) and isinstance(v,str) and 0<len(k)<=80 and 0<len(v)<=80 for k,v in b['aliases'].items()),'品类别名无效')
                c['aliases']={k.strip().lower():v.strip() for k,v in b['aliases'].items()}
            s.put(db,'settings',c);return {'settings':c}
        if action=='scan':
            active=next((r for r in s.all(db,'discovery_runs') if r['status'] in ('queued','running')),None)
            if active:return {'run':active,'deduplicated':True}
            run=dict(id=ident('scan'),day=datetime.now(TZ).date().isoformat(),status='queued',trigger='manual',created_at=now(),sources=[],recommendation_ids=[],category_changes=[])
            s.put(db,'discovery_runs',run);return {'run':run}
        if action=='rules':
            source=self.get(db,'sources',b.get('source_id',''))
            rule=b.get('rule')
            require(isinstance(rule,dict),'需要规则对象')
            paths=rule.get('game_paths',DEFAULT_RULE['game_paths'])
            require(isinstance(paths,list) and 1<=len(paths)<=20 and all(isinstance(x,str) and x.startswith('/') and 1<len(x)<=100 for x in paths),'游戏路径规则无效')
            entries=rule.get('entry_urls') or [source['url']]
            require(isinstance(entries,list) and 1<=len(entries)<=10,'入口需要 1–10 个地址')
            entries=[canonical_url(u) for u in entries]
            from urllib.parse import urlsplit
            base=(urlsplit(source['url']).hostname or '').removeprefix('www.')
            require(all(urlsplit(u).hostname==base or (urlsplit(u).hostname or '').endswith('.'+base) for u in entries),'入口必须属于当前来源站点')
            source['discovery_rule']={'entry_urls':entries,'game_paths':paths}
            s.put(db,'sources',source);return {'source':source}
        ids=b.get('ids',[])
        require(isinstance(ids,list) and 1<=len(ids)<=100 and all(isinstance(i,str) for i in ids),'请选择 1–100 项')
        items=[self.get(db,'recommendations',i) for i in dict.fromkeys(ids)]
        if action in ('approve','reject'):
            target='pending_capture' if action=='approve' else 'rejected'
            require(all(i['status'] in ('pending',target) for i in items),'清单状态已变化，请刷新后操作',409)
            for item in items:
                if item['status']==target:continue
                actor=(ACTOR.get() or {}).get('username','local-admin')
                item.update(status=target,decided_at=now(),decision_by=actor,decision_reason=str(b.get('reason',''))[:1000])
                s.put(db,'recommendations',item)
                s.event(db,'采集建议：'+action,recommendation_id=item['id'])
            return {'updated':len(items),'status':target}
        if action=='dispatch':
            require(all(i['status']=='pending_capture' for i in items),'只能启动已通过且待抓取的条目',409)
            require(type(b.get('web_only', False)) is bool, 'web_only 必须为布尔值')
            from .source_policy import blocked, describe
            gated, items = blocked(items)
            # 已知门槛的来源不进转换队列：否则每条都要走完采集才再次证明进不去。
            for item, policy in gated:
                item.update(dispatch_error=policy['reason'], source_policy=policy['policy'],
                            source_policy_label=policy.get('label') or policy['policy'])
                s.put(db, 'recommendations', item)
                s.event(db, '派单前拦截 · ' + (policy.get('label') or policy['policy']) + '：' + policy['reason'],
                        recommendation_id=item['id'])
            if gated and not items:
                require(False, '以下来源存在已知门槛，未派单：' + describe(gated) + '。' + gated[0][1]['next_action'], 409)
            result=self._mutate(db,'/api/conversions',{'urls':[i['url'] for i in items],'name':b.get('name') or '采集清单 · 人工通过'},None)
            jobs=result['jobs']+result['reused']
            if b.get('web_only'):
                for job in result['jobs']:
                    job['web_only'] = True
                    s.put(db, 'jobs', job)
                if result['batch']:
                    result['batch']['web_only'] = True
                    s.put(db, 'batches', result['batch'])
            for item in items:
                candidate=next(c for c in s.all(db,'candidates') if c['canonical_url']==item['url'])
                if item.get('technology'):
                    candidate.setdefault('observations', {})['discovery_technology'] = item['technology']
                    s.put(db, 'candidates', candidate)
                job=next(j for j in jobs if j['candidate_id']==candidate['id'])
                item.update(status='dispatched',job_id=job.get('job_id') or job['id'],dispatched_at=now())
                if b.get('web_only'):
                    item['conversion_policy'] = 'web_only'
                s.put(db,'recommendations',item)
            return result
        require(False,'未知采集操作',404)


class DiscoveryScheduler:
    def __init__(self,service,scanner=scan):
        self.service=service;self.scanner=scanner;self.stop=threading.Event()

    def start(self):
        self.thread=threading.Thread(target=self.loop,daemon=True);self.thread.start()

    def close(self):
        self.stop.set()

    def loop(self):
        while not self.stop.is_set():
            try:self.tick()
            except Exception as exc:
                with self.service.store.tx() as db:
                    self.service.store.event(db,'采集服务异常：'+str(exc)[:300],stage='discovery')
            self.stop.wait(30)

    def tick(self,instant=None):
        instant=instant or datetime.now(TZ)
        s=self.service.store;day=instant.astimezone(TZ).date().isoformat()
        with s.tx() as db:
            if (s.get(db,'settings','maintenance') or {}).get('draining'):return
            cfg=config(s,db);runs=s.all(db,'discovery_runs')
            # Crash recovery does not lose the audit or silently repeat a run.
            for old in runs:
                if old['status']=='running' and datetime.fromisoformat(old.get('heartbeat_at',old['created_at'])) < instant-timedelta(minutes=45):
                    old.update(status='interrupted',ended_at=now());s.put(db,'discovery_runs',old)
            if any(r['status']=='running' for r in runs):return
            pending=next((r for r in reversed(runs) if r['status']=='queued'),None)
            if not pending and cfg['enabled'] and instant.astimezone(TZ).hour>=cfg['hour'] and not any(r['day']==day for r in runs):
                pending=dict(id=ident('scan'),day=day,trigger='daily',created_at=now(),sources=[],recommendation_ids=[],category_changes=[])
            if not pending:return
            run=pending;run.update(status='running',heartbeat_at=now());s.put(db,'discovery_runs',run)
            sources=[x for x in s.all(db,'sources') if x.get('enabled')]
            candidates=s.all(db,'candidates')
            catalog=set()
            for c in candidates:
                if not c.get('observations',{}).get('catalog_hidden'):
                    catalog.update(category(v,cfg['aliases']) for v in re.split(r'[/／,，|·]',c.get('category','')) if v.strip())
            run['catalog_categories']=sorted(catalog)
        for source in sources:
            if self.stop.is_set():break
            with s.tx() as db:
                excluded=[r['url'] for r in s.all(db,'recommendations')]+[c['canonical_url'] for c in s.all(db,'candidates')]
            source={**source,'excluded_urls':excluded,'discovery_rule':{'max_games':cfg['max_games'],'max_pages':cfg['max_pages'],**source.get('discovery_rule',{})}}
            try: result=self.scanner(source)
            except Exception as exc: result={'games':[],'categories':[],'status':'failed','errors':[{'error':str(exc)[:300]}],'coverage':'扫描未完成'}
            from .discovery_language import translate
            translate(result['games'],self.service,run['id'])
            with s.tx() as db:
                previous=s.get(db,'discovery_sources',source['id']) or {'categories':[]}
                seen=set(previous['categories'])
                observed={}
                for item in result.get('categories',[]):
                    if item.get('name'):observed[category(item['name'],cfg['aliases'])]=item['url']
                for g in result['games']:
                    if g['category']!='未识别':observed[category(g['category'],cfg['aliases'])]=g['url']
                for cat,evidence in observed.items():
                    if cat not in seen:
                        missing=cat not in catalog
                        run['category_changes'].append(dict(source=source['name'],category=cat,evidence_url=evidence,
                            first_observation=not bool(previous.get('scanned_at')),platform_missing=missing,
                            recommendation='建议补充该品类的代表游戏，需人工确认分类与玩法' if missing else '平台已有该品类，无需新增',
                            basis='与本次扫描时平台游戏品类对比；首次扫描不代表站点刚新增'))
                s.put(db,'discovery_sources',dict(id=source['id'],categories=sorted(seen|set(observed)),scanned_at=now()))
                new=0;duplicates=result.get('suppressed',0)
                from .service import canonical_url
                existing={c['canonical_url'] for c in s.all(db,'candidates')}
                for g in result['games']:
                    url=canonical_url(g['url']);key='rec-'+hashlib.sha256(url.encode()).hexdigest()[:24]
                    old=s.get(db,'recommendations',key)
                    if old or url in existing:
                        duplicates+=1
                        if old:
                            old['last_seen']=now();s.put(db,'recommendations',old)
                        continue
                    cat=category(g['category'],cfg['aliases']);missing=cat not in catalog and cat!='未识别'
                    reason='平台尚未覆盖该品类，建议补充代表游戏' if missing else '平台已有该品类，建议对比玩法后决定是否补充'
                    if cat=='未识别':reason='来源未提供可识别品类，建议先人工核对再决定'
                    item=dict(g,id=key,url=url,category=cat,source_id=source['id'],source=source['name'],
                        reason=reason,platform_category_missing=missing,status='pending',run_id=run['id'],created_at=now(),last_seen=now())
                    from .selection import score
                    item['selection_score']=score(item)
                    # 扫描时就标出已知门槛，派单事务回滚也不会丢，列表里也看得见。
                    from .source_policy import host_policy
                    gate=host_policy(url)
                    if gate:
                        item.update(source_policy=gate['policy'],
                                    source_policy_label=gate.get('label') or gate['policy'],
                                    source_policy_reason=gate['reason'])
                    s.put(db,'recommendations',item);run['recommendation_ids'].append(key);new+=1
                run['sources'].append(dict(source_id=source['id'],name=source['name'],status=result['status'],new=new,duplicates=duplicates,errors=result.get('errors',[]),coverage=result.get('coverage','')))
                run['heartbeat_at']=now();s.put(db,'discovery_runs',run)
        with s.tx() as db:
            # Explicit opt-in only; always preserve existing human decisions.
            cfg=config(s,db)
            if cfg.get('auto_select') and not self.stop.is_set():
                used=sum(1 for r in s.all(db,'recommendations') if r.get('decision_by')=='selection-policy' and r.get('decision_day')==day)
                from .source_policy import host_policy
                def selectable(r):
                    if host_policy(r.get('url','')):
                        # 已知门槛的来源不占每日自动选品名额，也不进待抓取。
                        return False
                    return r['category'] in cfg.get('allowed_categories',[]) and r.get('selection_score',{}).get('value',0)>=cfg['score_threshold']
                choices=[r for r in s.all(db,'recommendations') if r['id'] in run['recommendation_ids'] and r['status']=='pending' and selectable(r)]
                for item in sorted(choices,key=lambda r:(-r['selection_score']['value'],r['id']))[:max(0,cfg['daily_limit']-used)]:
                    item.update(status='pending_capture',decided_at=now(),decision_by='selection-policy',decision_day=day,
                                decision_reason='符合已配置品类和信息评分阈值；不代表已验证玩法')
                    s.put(db,'recommendations',item)
                    s.event(db,'规则自动选品通过，进入待抓取',recommendation_id=item['id'])
                    if cfg.get('auto_dispatch'):
                        # A failure must not roll back successful choices or create retry storms.
                        db.execute('SAVEPOINT automatic_dispatch')
                        try:
                            self.service.discovery_mutate(db,['api','discovery','dispatch'],{'ids':[item['id']],'name':'采集清单 · 自动规则'})
                            db.execute('RELEASE automatic_dispatch')
                        except Exception as exc:
                            db.execute('ROLLBACK TO automatic_dispatch');db.execute('RELEASE automatic_dispatch')
                            item['dispatch_error']='自动派单未完成，请在待抓取中处理'
                            s.put(db,'recommendations',item)
                            s.event(db,'自动派单未完成，保留待抓取',recommendation_id=item['id'])
            run.update(status='interrupted' if self.stop.is_set() else 'completed' if all(x['status']=='success' for x in run['sources']) and sources else 'partial',ended_at=now())
            s.put(db,'discovery_runs',run)
