"""Continue incomplete delivery; bound retries by observed progress, not pending labels."""
import hashlib
import json


def decide(previous, gaps, report, max_stalled=3, max_rounds=8):
    previous=previous or {}
    # Evidence status is structural: changing an explanation must not reset the guard.
    checks=report.get('foundation_checks') or {}
    dependencies=report.get('dependencies') or {}
    fingerprint=hashlib.sha256(json.dumps({
        'checks':{k:v.get('status') for k,v in checks.items() if isinstance(v,dict)},
        'dependencies':sorted((str(i.get('id')),str(i.get('status'))) for i in dependencies.get('items',[]) if isinstance(i,dict)),
        'spec_tests':[(str(c.get('id')),str(c.get('status'))) for c in (report.get('spec_tests') or {}).get('cases',[]) if isinstance(c,dict)] if isinstance(report.get('spec_tests'),dict) else [],
        'gap_count':len(gaps),
    },sort_keys=True,ensure_ascii=False).encode()).hexdigest()
    stalled=previous.get('stalled',0)+1 if previous.get('fingerprint')==fingerprint else 0
    state={'fingerprint':fingerprint,'stalled':stalled,'rounds':previous.get('rounds',0)+1,'gaps':list(gaps)}
    blocker=report.get('blocker')
    # Older Web snapshots used a blocker for ordinary unfinished verification.
    # Resume only an actually running supported package; real failures still stop.
    runtime=report.get('runtime_smoke') or {}
    resumable_web=(report.get('recovery_kind') in ('discovered-web-cocos2','discovered-web-ruffle','discovered-web-three','discovered-web-defold','discovered-web-browser')
                   and report.get('runtime_verified') is True and runtime.get('passed') is True)
    if (resumable_web and isinstance(blocker,dict)
            and blocker.get('code') in ('WEB_GAMEPLAY_REVIEW','WEB_VERIFICATION_BUDGET')):
        blocker=None
    if isinstance(blocker,dict) and blocker.get('reason') and blocker.get('next_action') and blocker.get('code'):
        return state,blocker
    if stalled>=max_stalled:
        return state,{'code':'NO_VERIFICATION_PROGRESS','reason':f'连续 {stalled} 轮自动续作，验证状态和缺项数量未改善',
                      'next_action':'检查已保存的续作与验证记录，补充所需验证能力或材料后恢复任务'}
    if state['rounds']>=max_rounds:
        return state,{'code':'AUTO_FOLLOWUP_LIMIT','reason':f'已完成 {max_rounds} 段执行，仍有未验证交付项',
                      'next_action':'检查最新草稿和执行记录，解决剩余问题后从最新版本继续'}
    return state,None
