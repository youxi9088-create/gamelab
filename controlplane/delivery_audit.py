"""Common immutable engineering report for automatic, revised and imported versions."""
import json
from .game_catalog import FIELDS,profile
from .game_specs import verification_gaps,test_report
from .resource_audit import audit

def write(root,target,candidate,version):
    report=version.get('report') or {};facts=profile(candidate,version)
    resources=audit(root);spec=report.get('game_spec');tests=test_report(report) or {}
    gaps=verification_gaps(spec,tests) if spec else ['尚未登记固定玩法规格与验收用例']
    missing=[label for key,label in FIELDS.items() if not facts.get(key)]
    result={'schema_version':1,'version_id':version['id'],'routing':report.get('conversion_plan'),
            'resource_status':resources['status'],'spec_digest':spec.get('digest') if spec else None,
            'verification_gaps':gaps,'missing_profile_fields':missing,'limitations':report.get('limitations',[]),
            'reuse':{'level':'需拆解适配','editable_files':[x['file'] for x in resources['files'] if x['file'].endswith(('.js','.css','.json'))][:100],
                     'portable_modules':(spec or {}).get('reuse',[]),'cross_game_verified':False}}
    target.mkdir(parents=True,exist_ok=True)
    (target/'resource-audit.json').write_text(json.dumps(resources,ensure_ascii=False,indent=2),'utf-8')
    (target/'engineering-report.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    lines=['# 工程与验收说明','本说明对应交付版本 '+version['id'],'## 运行方式','通过静态 HTTP 服务打开根入口；配置、脚本与资源随包保存。',
           '## 验收覆盖',*['- '+x for x in gaps or ['已登记规格用例均有通过记录，仍需人工确认']],
           '## 说明书缺项',*['- '+x for x in missing or ['已填写所有档案字段；不代表自动证明其真实性']],
           '## 依赖与限制',resources['scope'],*['- '+str(x) for x in result['limitations']],
           '## 二次开发','脚本与配置可供检查修改；核心业务模块跨游戏移植尚未验证。详见 engineering-report.json 文件清单。']
    (target/'ENGINEERING_REPORT.md').write_text('\n\n'.join(lines),'utf-8')
    return result
