"""User-declared supply policy; preserve explicit declarations and provenance."""
import copy

def metadata_for(store,db,version,metadata=None):
    result=copy.deepcopy(metadata if metadata is not None else (version.get('report') or {}).get('supply') or {})
    declaration=result.get('license_declaration') or {}
    # Explicit refusal or an existing named declaration is not overwritten by
    # a platform default. Submitted/immutable payloads never call this helper.
    if declaration.get('distributable')=='no' or str(declaration.get('owner') or '').strip():return result
    policy=store.get(db,'settings','supply_defaults') or {}
    default=policy.get('license_declaration') or {}
    if policy.get('enabled') is True and policy.get('scope')=='platform_outputs' and default.get('distributable')=='yes' and isinstance(default.get('owner'),str) and default['owner'].strip():
        result['license_declaration']={'distributable':'yes','owner':default['owner'].strip()}
        result.setdefault('contact_note','权利人按平台管理者声明登记；原始来源及第三方许可随包保留。')
    return result
