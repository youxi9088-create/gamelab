"""Local, evidence-preserving supply safety checks and recovery classification."""
import re
import hashlib,time,secrets,json,importlib
from pathlib import Path

# Capture the loaded checker version once. Reading source hashes on every tick
# would mistake newly copied files for code already loaded by this process.
PACKAGE_CHECK_REVISION=hashlib.sha256(b''.join(
    Path(__file__).with_name(name+'.py').read_bytes()
    for name in ('supply','supply_preparation','supply_resources','supply_delivery','resource_audit','supply_metadata','supply_fonts','offline_delivery')
)).hexdigest()
LOCAL_PACKAGE_ERRORS=frozenset(('OFFLINE_FEATURE_REMAINS','MISSING_LOCAL_RESOURCE','EXTERNAL_DEPENDENCY',
    'EXTERNAL_REQUEST_REJECTED','TOOLCHAIN_UNSUPPORTED','ARCHIVE_UNSAFE',
    'NO_ENTRY_HTML','NESTED_ARCHIVE','SECRET_IN_CODE','LOCAL_PREPARATION_ERROR'))

def needs_package_recheck(row,revision=PACKAGE_CHECK_REVISION):
    """One new check per loaded checker, only before any immutable submission."""
    return (row.get('status')=='blocked' and not row.get('submitted')
            and not row.get('archive_sha256') and not row.get('payload_sha256')
            and row.get('error_code') in LOCAL_PACKAGE_ERRORS
            and row.get('package_check_revision')!=revision)

def template_shape(root):
    root=Path(root);oversized=[];images=0
    for path in root.rglob('*'):
        if not path.is_file():continue
        parts=path.relative_to(root).parts
        if parts[0] in ('evidence','verification','screenshots','supply-delivery','platform-delivery'):continue
        if path.suffix.lower() in ('.png','.jpg','.jpeg','.webp','.svg'):images+=1
        if parts[0]!='vendor' and path.suffix.lower() in ('.html','.js','.mjs') and path.stat().st_size>384000:
            oversized.append({'file':path.relative_to(root).as_posix(),'bytes':path.stat().st_size})
    return {'status':'needs_refactor' if oversized else 'requires_changeability_validation','oversized_files':oversized[:20],
            'read_budget_bytes':384000,'standalone_images':images,
            'scope':'依据2026-11-01下游评估的可改造性提示，不替代正式接收规范；库应放vendor，游戏逻辑需按真实模块拆分，不能机械截断代码。代码绘制游戏也须提供可改造证据，不能凭无图片判定不可换皮。'}

def prepare_one_review(service):
    """Inspect one immutable review version before acceptance, never submit it."""
    from .store import now
    from .supply import build_archive,SupplyError
    from .supply_config import settings,readiness
    from .supply_delivery import resolve_source,delivery_source
    with service.store.read() as db:policy=service.store.get(db,'settings','supply_defaults') or {}
    revision=hashlib.sha256(PACKAGE_CHECK_REVISION.encode()+json.dumps({'readiness':readiness(settings()),'supply_defaults':policy},sort_keys=True).encode()).hexdigest()
    store=service.store
    # Version JSON may include large verification reports. Scanning it must
    # never hold the writer lock needed by executor heartbeats and events.
    with store.read() as db:
        if (store.get(db,'settings','maintenance') or {}).get('draining'):return
        selected=None
        for entry in db.execute("SELECT data FROM records WHERE kind='versions' AND json_extract(data,'$.status')='review'"):
            v=json.loads(entry[0])
            old=store.get(db,'supply_preparations',v['id']) or {}
            if old.get('lease_until',0)>time.time() or (old.get('checker_revision')==revision and old.get('status') in ('ready','blocked')):continue
            selected=v;break
        if selected is None:return
    with store.tx() as db:
        if (store.get(db,'settings','maintenance') or {}).get('draining'):return
        selected=store.get(db,'versions',selected['id'])
        if not selected or selected.get('status')!='review':return
        old=store.get(db,'supply_preparations',selected['id']) or {}
        if old.get('lease_until',0)>time.time() or (old.get('checker_revision')==revision and old.get('status') in ('ready','blocked')):return
        candidate=service.get(db,'candidates',selected['candidate_id']);token=secrets.token_hex(16)
        row={'id':selected['id'],'version_id':selected['id'],'candidate_id':selected['candidate_id'],'status':'running','checker_revision':revision,'lease_until':time.time()+900,'lease_token':token}
        store.put(db,'supply_preparations',row)
    from .supply_metadata import metadata_for
    with store.read() as db:metadata=metadata_for(store,db,selected)
    blockers=[];config=readiness(settings());rights=metadata.get('license_declaration') or {}
    if rights.get('distributable')!='yes' or not str(rights.get('owner','')).strip():blockers.append({'code':'LICENSE_UNDECLARED','owner':'supplier'})
    if not config['configured']:blockers.append({'code':'CONFIG_REQUIRED','owner':'configuration','missing':config['missing'],'errors':config['errors']})
    try:
        source=resolve_source(service.repo,selected)
        destination=service.data_dir/'supply-preparations'/selected['id']/'review-package.zip'
        with delivery_source(source,candidate,selected,metadata) as (delivery,supplement):
            row['template_readiness']=template_shape(delivery)
            digest=build_archive(delivery,destination)
        row.update(package='passed_static_checks',sha256=digest,archive_bytes=destination.stat().st_size,runtime_recheck_required=supplement.get('runtime_recheck_required',False),acceptance_steps_available=bool(supplement.get('acceptance_steps')))
    except SupplyError as error:blockers.append({'code':error.code,'owner':'package','items':error.details})
    except Exception:blockers.append({'code':'RESOURCE_PREPARATION_FAILED','owner':'package'})
    row.update(status='blocked' if blockers else 'ready',checked_at=now(),blockers=blockers,lease_until=0,submission_sent=False,scope='独立供货副本静态检查；不替代玩法验收、真实授权或下游认证')
    with store.tx() as db:
        current=store.get(db,'supply_preparations',row['id'])
        if current and current.get('lease_token')==token:
            row.pop('lease_token',None);store.put(db,'supply_preparations',row)

def secret_findings(files):
    # Plain password literals caused confirmed downstream false positives in the
    # supplied batch. Only strong credential formats block here; never erase code.
    patterns=[('private_key',re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')),
              ('aws_access_key',re.compile(r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'))]
    issues=[]
    for path,relative in files:
        if path.suffix.lower() not in ('.js','.mjs','.html','.json','.css','.txt','.pem','.key'):continue
        text=path.read_text('utf-8',errors='replace')
        for kind,pattern in patterns:
            for match in pattern.finditer(text):
                issues.append({'code':'SECRET_IN_CODE','file':relative,'line':text.count('\n',0,match.start())+1,'kind':kind})
                if len(issues)>=20:return issues
    return issues

def recovery(row):
    code=row.get('error_code') or ''
    if row.get('state')=='failed' and row.get('next_action')=='platform':
        return {'owner':'platform','automatic_retry':False,'action':'等待下游处理并查询原提交状态；不要重复提交或改包'}
    if code=='LICENSE_UNDECLARED':return {'owner':'supplier','automatic_retry':False,'action':'补充真实可分发声明和权利人；验收通过不等于已授权供货'}
    if code in ('CONFIG_REQUIRED','FINGERPRINT_REQUIRED','FINGERPRINT_MISMATCH','ARCHIVE_DISTRIBUTION_FAILED'):
        return {'owner':'configuration','automatic_retry':code=='ARCHIVE_DISTRIBUTION_FAILED','action':'检查分发模式、上传连接、指纹与下游身份；配置修复后沿原提交续接'}
    if row.get('state')=='needs_your_fix' or code in ('MISSING_LOCAL_RESOURCE','EXTERNAL_DEPENDENCY','EXTERNAL_REQUEST_REJECTED','SECRET_IN_CODE','TOOLCHAIN_UNSUPPORTED','ARCHIVE_UNSAFE'):
        return {'owner':'package','automatic_retry':False,'action':'按具体文件与问题修复独立供货副本，实际复验；已提交的改包须新版本验收后使用新提交编号'}
    return {'owner':row.get('next_action') or 'none','automatic_retry':row.get('status')=='retrying','action':'按原提交编号继续跟踪，不重复验收'}
