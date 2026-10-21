"""Audit captured original embedded code against a revision, without assuming play coverage."""
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
from controlplane.runtime import node_binary

ROOT=Path(__file__).resolve().parent


def audit(source, output):
    source=Path(source); output=Path(output)
    manifest_file=source/'evidence/source-manifest.json'
    if not manifest_file.is_file():return None
    manifest=json.loads(manifest_file.read_text('utf-8'))
    if manifest.get('kind')!='embedded-html':return None
    captured=Path(manifest['directory']).resolve()
    if not captured.is_relative_to((ROOT/'runs').resolve()):raise ValueError('Original capture must be inside executor runs')
    records={r['file']:r for r in manifest['files']}
    for name in ('index.html','game-config.json','asset-map.json'):
        if not (captured/name).resolve().is_relative_to(captured):raise ValueError('Original capture file escapes directory')
        data=(captured/name).read_bytes()
        if hashlib.sha256(data).hexdigest()!=records[name]['sha256']:raise ValueError('Original capture hash mismatch: '+name)
    html=(captured/'index.html').read_text('utf-8')
    scripts=[]
    output.mkdir(parents=True,exist_ok=True)
    def externalize(match):
        attrs,body=match.groups()
        if re.search(r'\bsrc\s*=',attrs,re.I):raise ValueError('External original script unsupported')
        if 'application/ld+json' in attrs:return match[0]
        name=f'game-{len(scripts)}.js';scripts.append((name,body))
        return '<script'+attrs+' src="'+name+'"></script>'
    expected=re.sub(r'<script([^>]*)>(.*?)</script>',externalize,html,flags=re.S|re.I)
    expected=re.sub(r'<link\b[^>]*href=["\']https://fonts\.(?:googleapis|gstatic)\.com[^>]*>','',expected,flags=re.I)
    expected=expected.replace('</head>','<script src="local-config.js"></script><script src="local-host.js"></script></head>',1)
    current_html=(source/'index.html').read_text('utf-8')
    changes=[];repairs={}
    for name,original in scripts:
        current=(source/name).read_text('utf-8')
        ast_input=output/(name+'.compare-input.json');ast_output=output/(name+'.compare.json')
        ast_input.write_text(json.dumps({'original':original,'current':current}),'utf-8')
        result=subprocess.run([node_binary(),str(ROOT/'compare-source.mjs'),str(ast_input),str(ast_output)],capture_output=True,text=True,timeout=60)
        if result.returncode:raise ValueError('Original source AST comparison failed: '+result.stderr[-500:])
        ast=json.loads(ast_output.read_text('utf-8'))
        raw=(source/name).read_bytes()
        if b'\r\r\n' in raw and b'\r\r\n' not in (captured/'index.html').read_bytes():
            repaired=raw.replace(b'\r\r\n',b'\r\n').decode('utf-8')
            repair_input=output/(name+'.repair-input.json');repair_output=output/(name+'.repair-compare.json')
            repair_input.write_text(json.dumps({'original':original,'current':repaired.replace('\r\n','\n')}),'utf-8')
            result=subprocess.run([node_binary(),str(ROOT/'compare-source.mjs'),str(repair_input),str(repair_output)],capture_output=True,text=True,timeout=60)
            if result.returncode:raise ValueError('Newline repair comparison failed')
            candidate_ast=json.loads(repair_output.read_text('utf-8'))
            restored=set(ast['changed_functions'])-set(candidate_ast['changed_functions'])
            if restored and set(candidate_ast['changed_functions'])<set(ast['changed_functions']) and candidate_ast['changed_declarations']==ast['changed_declarations']:
                repairs[name]=repaired
                ast['newline_repair']={'restored_original_functions':sorted(restored),'remaining_changed_functions':candidate_ast['changed_functions'],'reason':'Remove duplicated CR only where original AST functions are restored without adding changed functions or declarations'}
        changes.append({'path':name,'identical':original==current,'original_sha256':hashlib.sha256(original.encode()).hexdigest(),
                        'current_sha256':hashlib.sha256(current.encode()).hexdigest(),
                        'ast':ast,'diff':''.join(difflib.unified_diff([l for l in original.splitlines(True) if l.strip()],[l for l in current.splitlines(True) if l.strip()],fromfile='original/'+name,tofile='current/'+name,n=3))[:30000]})
    config_text=(source/'local-config.js').read_text('utf-8')
    config,_=json.JSONDecoder().raw_decode(config_text.split('window.gameConfig=',1)[1])
    assets=json.loads((source/'evidence/resource-downloads.json').read_text('utf-8'))
    original_map=json.loads((captured/'asset-map.json').read_text('utf-8'))
    local_map,_=json.JSONDecoder().raw_decode(config_text.split('window.localAssetMap=',1)[1])
    downloaded={row['url']:row['path'] for row in assets['files'] if 'url' in row}
    expected_map={key:{**item,'url':downloaded.get(item['url'])} for key,item in original_map.items()}
    mapping_matches=local_map==expected_map and all(v['url'] is not None for v in expected_map.values())
    # Resource record shapes are supplied by the shared downloader.
    checked=[]
    for row in assets['files']:
        p=(source/row['path']).resolve()
        if not p.is_relative_to(source.resolve()):raise ValueError('Asset outside package')
        checked.append({'path':row['path'],'matches':p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256']})
    report={'kind':'captured-source-comparison','phase':'Baseline comparison before proposed repairs; any newline_repair lists proposed restoration, not a completed runtime test','original_capture':str(captured),'original_hashes_verified':True,
            'html_identical_except_host_and_font_adaptation':current_html==expected,'scripts':changes,
            'config_identical':config==json.loads((captured/'game-config.json').read_text('utf-8')),
            'original_asset_bindings_preserved':mapping_matches,
            'assets':checked,'all_asset_hashes_match':bool(checked) and all(r['matches'] for r in checked),
            'scope':'Exact original code/configuration/resource comparison. Not proof of all scenes played or pixel equivalence. Host and fallback-font adaptation remain explicit.'}
    output.mkdir(parents=True,exist_ok=True)
    (output/'source-fidelity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    # Comparison reference is original business code with the SAME documented local host adaptation.
    reference={name:body for name,body in scripts};reference['index.html']=expected
    (output/'reference-files.json').write_text(json.dumps(reference,ensure_ascii=False),'utf-8')
    (output/'newline-repairs.json').write_text(json.dumps(repairs,ensure_ascii=False),'utf-8')
    return report


def compare_render(source, run, iteration, plan, budget=None):
    planfile=iteration/'reference-plan.json';planfile.write_text(json.dumps(plan,ensure_ascii=False),'utf-8')
    output=iteration/'reference-comparison'
    result=subprocess.run([node_binary(),str(ROOT/'compare-render.cjs'),str(source),str(run/'source-comparison/reference-files.json'),str(output),str(planfile),str(iteration/'smoke-input.json')],capture_output=True,text=True,timeout=budget.remaining(180) if budget else 180)
    if result.returncode not in (0,2):raise ValueError('Reference comparison failed: '+result.stderr[-500:])
    return json.loads((output/'render-comparison.json').read_text('utf-8'))


def function_regression(run,iteration,cases,budget=None):
    current=json.loads((iteration/'smoke-input.json').read_text('utf-8'))['files']
    original=json.loads((run/'source-comparison/reference-files.json').read_text('utf-8'))
    paths={c['script_path'] for c in cases}
    payload={'cases':cases,'original':{p:original[p] for p in paths},'current':{p:current[p] for p in paths}}
    file=iteration/'function-regression-input.json';output=iteration/'function-regression.json'
    file.write_text(json.dumps(payload,ensure_ascii=False),'utf-8')
    result=subprocess.run([node_binary(),str(ROOT/'function-regression.mjs'),str(file),str(output)],capture_output=True,text=True,timeout=budget.remaining(90) if budget else 90)
    if result.returncode not in (0,2):raise ValueError('Component regression failed: '+result.stderr[-500:])
    return json.loads(output.read_text('utf-8'))
