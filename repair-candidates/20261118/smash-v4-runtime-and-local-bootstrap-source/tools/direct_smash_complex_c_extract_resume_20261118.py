"""Resume extraction from the completed C output; never repeat conversion or run C."""
from pathlib import Path
import json,hashlib,re,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118/complex-bootstrap-c-source';target=out/'original-complex-c-source.json';assert not target.exists()
c=out/'complex-bootstrap-ANALYSIS-ONLY-NOT-RUNTIME.c';assert c.stat().st_size==133330558;text=c.read_text(encoding='utf8');names={26015:'GameSettingsService_gbx_26015',43610:'GameDataService_fxz_43610'}
original=json.loads((r/'analysis-20261118/data-services-v2/service-original-source-proof.json').read_bytes());snippets=[]
body_proof=json.loads((r/'analysis-20261118/data-services-v2/mapping-before-decompilation.json').read_bytes())['original_body_proofs']
for fn,name in names.items():
    ms=list(re.finditer(r'^(?:static )?(?:void|u32) w2c_smash__static__analysis_'+re.escape(name)+r'\([^;]*?\)\s*\{',text,re.M));assert len(ms)==1,(fn,len(ms));m=ms[0];p=m.end();depth=1
    while depth:
        if text[p]=='{':depth+=1
        elif text[p]=='}':depth-=1
        p+=1
    source=text[m.start():p];assert 'wasm_rt_call_stack_depth' in source or 'FUNC_PROLOGUE' in source
    proof=next(x for x in body_proof if x['function_index']==fn)
    snippets.append(dict(function_index=fn,name=name,original_body=proof,source_bytes=len(source.encode()),source_sha256=hashlib.sha256(source.encode()).hexdigest(),source=source))
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,source_compiled=False,original_modified=False,original_wasm_sha256=original['original_wasm_sha256'],metadata_sha256=original['metadata_sha256'],completed_c_file_sha256=hashlib.sha256(c.read_bytes()).hexdigest(),completed_c_file_bytes=c.stat().st_size,analysis_slice_sha256=hashlib.sha256((out/'complex-bootstrap-ANALYSIS-ONLY-NOT-RUNTIME.wasm').read_bytes()).hexdigest(),original_c_source_snippets=snippets,conversion_succeeded_before_extractor_assertion=True,resume_scope='Extract original two preserved bodies from existing C output after correcting the generated module-name prefix/definition signature; no conversion rerun, compilation or game execution.',limitations=['Other analysis-slice function bodies are unreachable placeholders; neither C nor slice can be used as a runtime.','Original function bodies are data evidence only, not a completed local game data lifecycle.'])
target.write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode());print(json.dumps({k:v for k,v in proof.items()if k!='original_c_source_snippets'}|{'source_sizes':[(x['function_index'],x['source_bytes'])for x in snippets]},ensure_ascii=False))
