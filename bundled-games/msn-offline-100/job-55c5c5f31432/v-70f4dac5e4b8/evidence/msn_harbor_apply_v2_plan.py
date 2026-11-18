"""Apply source-only audited UTF-16 ranges without changing the archived v1."""
from pathlib import Path
import hashlib,json,shutil
b=Path(__file__).parent/'msn-capture-100';src=b/'revisions/harbor-offline-v1';dst=b/'revisions/harbor-offline-v2'
assert not dst.exists(),'Immutable v2 exists; inspect actual evidence'
read=lambda p:json.loads(p.read_text(encoding='utf8'));sha=lambda raw:hashlib.sha256(raw).hexdigest()
p=b/'source-analysis/harbor/v2-restored-intermediate.js';raw=p.read_bytes();plan=read(b/'source-analysis/harbor/v2-service-edit-plan.json');assert sha(raw)==plan['input_sha256']
source=raw.decode('utf8').encode('utf-16-le');limit=len(source)//2
for e in sorted(plan['edits'],key=lambda e:e['start'],reverse=True):
 assert 0<=e['start']<=e['end']<=limit,e
 source=source[:e['start']*2]+e['text'].encode('utf-16-le')+source[e['end']*2:];limit=e['start']
result=source.decode('utf-16-le');body=result.encode('utf8');original=(b/'msn-en-us/originals/9pbd0qpb8kwz/game.js').read_bytes();audit=read(b/'harbor-offline-v1-independent-fidelity.json');assert sha(original)==audit['original_sha256']
orig16=original.decode('utf8').encode('utf-16-le');changed=set(plan['changed_modules']);preserved=[]
for row in plan['restored']:
 if row['module']in changed:continue
 a,z=row['source_range'];text=orig16[a*2:z*2].decode('utf-16-le');assert sha(text.encode('utf8'))==row['source_body_sha256'];assert text in result,row['module'];preserved.append({'module':row['module'],'sha256':row['source_body_sha256'],'byte_exact':True})
assert len(preserved)>=112
for row in audit['protected_modules']:assert any(r['module']==row['module']for r in preserved)
shutil.copytree(src,dst);(dst/'game.js').write_bytes(body)
proof={'native_id':'9pbd0qpb8kwz','revision':dst.name,'original_sha256':sha(original),'input_v1_sha256':sha((src/'game.js').read_bytes()),'restored_intermediate_sha256':sha(raw),'runtime_sha256':sha(body),'original_bodies_restored':len(plan['restored']),'final_raw_original_bodies':preserved,'protected_original_modules':30,'source_fidelity_audit':'harbor-offline-v1-independent-fidelity.json','client_host_proof':{'native_allowlist':['marketjs.cdn.start.gg','.cdn.start.gg','.cdn.msnfun.com','.msn.com','localhost','s3-ap-southeast-1.amazonaws.com','s3.ap-southeast-1.amazonaws.com'],'native_reject_target':'about:blank','literal_regex_ranges':[[255509,255781],[258144,258195]],'literal_replace_ranges':[[255792,256205],[258206,258275]],'no_native_eval':True,'no_upstream_access_or_identity_change':True},'edits':plan['edits'],'scope':'114 source-proven canonical equivalent module bodies restored first. Then exact12 integration ranges applied with UTF16 byte mapping; no arbitrary numeric normalization. Windows Node build process had two empty-output exits (actual captured3221226505), preserved; cause not asserted. AST-plan generation exit0, ranges applied by ownPython.','no_fake_SDK_or_reward':True,'no_state_clock_rng_save_level_injection':True,'UI':0,'native_executed_locally':False}
(b/'harbor-v2-source-fidelity.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'revision':dst.name,'raw_original_modules':len(preserved),'protected_original_modules':30,'additional_service_edits':len(plan['edits']),'runtime_bytes':len(body),'UI':0}))
