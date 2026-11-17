"""Stage a source-backed startup-config overlay; do not run or install the game."""
from pathlib import Path
import json, hashlib, zipfile, sys, copy, datetime
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
sha=lambda raw:hashlib.sha256(raw).hexdigest()
base=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118')
stage=Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118')
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and before['candidate_id']=='game-60bd828457b8'and not before.get('version_id')and not before.get('manual_paused')
live_ledger=base/'validation-resources-v1-20261118/ui-ledger.json'
if live_ledger.exists():
    ledger=json.loads(live_ledger.read_bytes());assert ledger['used']==0 and ledger['remaining']==5 and not ledger['steps']
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    recipe=json.loads(z.read('support/assembly-recipe.json'))
    base_receipt=json.loads((base/'receipt.json').read_bytes())
    base_manifest_raw=(base/'MANIFEST.json').read_bytes()
    assert base_receipt['complete']and base_receipt['manifest_sha256']==recipe['base_manifest_sha256']==sha(base_manifest_raw)
    for n,h in json.loads(base_manifest_raw).items():assert sha((base/n).read_bytes())==h,n
    stage.mkdir(exist_ok=True)
    def publish(name,raw):
        p=(stage/name).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,name
        else:write_bytes(p,raw)
    for n,h in manifest.items():
        raw=z.read(n);assert sha(raw)==h,n;publish(n,raw)
    for n,h in recipe['candidate_manifest'].items():
        overlay='overlay/'+n
        raw=z.read(overlay)if overlay in manifest else(base/'candidate'/n).read_bytes()
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    candidate=stage/'candidate'
    settings=json.loads((candidate/'StreamingAssets/aa/settings.json').read_bytes())
    original=json.loads((stage/'original/settings.json').read_bytes())
    new_hash=settings['m_CatalogLocations'][0]['m_InternalId'];old_hash=original['m_CatalogLocations'][0]['m_InternalId']
    assert new_hash=='{UnityEngine.AddressableAssets.Addressables.RuntimePath}/catalog.hash'
    restored=copy.deepcopy(settings);restored['m_CatalogLocations'][0]['m_InternalId']=old_hash
    assert restored==original
    ns={};exec(compile(z.read('tools/unity_hash128_spooky_v2_20261118.py'),'hash-only','exec'),ns)
    assert ns['unity_hash128']((candidate/'StreamingAssets/aa/catalog.json').read_bytes())==(candidate/'StreamingAssets/aa/catalog.hash').read_text().strip()=='019cbabadf9fdfbbfed0a1bfd0c8ef56'
    assert not json.loads((candidate/'StreamingAssets/aa/catalog.json').read_bytes())['m_InternalIds']
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode()
    publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
    assert len([p for p in candidate.rglob('*')if p.is_file()])==205
    for n,h in recipe['base_candidate_manifest'].items():
        if n not in recipe['changed_existing_paths']:assert sha((candidate/n).read_bytes())==h,n
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'原生启动配置补齐为独立v2候选：由原metadata方法token与Wasm表确认Application.streamingAssetsPath及String.Concat3，原aa/settings.json路径逐级推导；原站settings.json、空初始catalog.json及明确声明的catalog.hash均HTTP200，原目录Hash128与实际hash一致。保留旧v1全部运行代码和162资源包；仅补3个启动文件，将设置中唯一远程hash地址改为RuntimePath同源hash，其他设置字段/缓存键/校验及原初始目录字节不变。真实52逐205文件SHA核对。未启动HTTP观察器或游戏、未使用0/5步额度、未改就绪标志/账号或伪造SDK成功。当前SDK/Firebase与本地对局仍未完成，52桌面解锁待确认，不计待验收；任务整行/历史/暂停保持。'},None,idem='direct-smash-startup-settings-v2-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,stage=str(stage),manifest_sha256=sha(manifest_raw),files_verified=len(manifest),candidate_files=205,candidate_manifest_sha256=sha(candidate_raw),base_candidate_files=202,new_runtime_files=3,changed_existing_paths=recipe['changed_existing_paths'],unchanged_runtime_files=198,original_startup_catalog_hash_verified=True,job_unchanged=True,manual_pause_preserved=True,game_executed=False,ready_review=False,server_started=False,scheduled_task_registered=False,ui_steps_used=0,ui_steps_remaining=5)
write_bytes(stage/'receipt.json',json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=False))
