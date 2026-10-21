"""Find cached static configuration by fields referenced in recovered JavaScript.
Only matching table fields are retained; account storage and login responses are not inputs.
"""
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

ASSIGNMENT=re.compile(r'\b([\w$]+)\.([\w$]+)\s*=\s*([\w$]+)\.([\w$]+)\b')

def referenced_tables(code_paths):
    groups=defaultdict(set)
    for path in code_paths:
        p=Path(path)
        if p.suffix!='.js' or p.stat().st_size>100*1024*1024:continue
        for owner,target,source,field in ASSIGNMENT.findall(p.read_text('utf-8',errors='replace')):
            groups[(owner,source)].add(field)
    return {owner+':'+source:sorted(fields) for (owner,source),fields in groups.items() if len(fields)>=20}

def discover_config(local_roots, code_paths, output):
    schemas=referenced_tables(code_paths);out=Path(output);out.mkdir(parents=True,exist_ok=False)
    report={'schemas':schemas,'candidates':[],
            'scope':'Static table assignments matched against game temp JSON; missing fields are not necessarily required by the base gameplay.'}
    if schemas:
        for local in local_roots:
            root=Path(local).resolve();folder=root/'temp'
            if not folder.resolve().is_relative_to(root):continue
            for p in sorted(folder.glob('*.json'))[:100]:
                if not p.resolve().is_relative_to(root) or not p.is_file() or p.stat().st_size>64*1024*1024:continue
                try:raw=p.read_bytes();value=json.loads(raw)
                except (ValueError,OSError):continue
                if not isinstance(value,dict):continue
                schema,fields=max(schemas.items(),key=lambda row:(len(set(row[1]) & value.keys()),len(set(row[1]) & value.keys())/len(row[1])))
                expected=set(fields)
                matched=expected & value.keys()
                # Config tables are containers; credentials/individual player fields are not copied.
                matched={k for k in matched if isinstance(value[k],(dict,list))}
                if len(matched)<20 or len(matched)<len(expected)*.5:continue
                name=hashlib.sha256(raw).hexdigest()+'.json'
                body=json.dumps({k:value[k] for k in sorted(matched)},ensure_ascii=False).encode('utf-8')
                (out/name).write_bytes(body)
                report['candidates'].append({'file':name,'schema':schema,'expected_field_count':len(expected),'source_name':p.name,'source_sha256':hashlib.sha256(raw).hexdigest(),
                    'sha256':hashlib.sha256(body).hexdigest(),'bytes':len(body),'matched_fields':sorted(matched),
                    'missing_fields':sorted(expected-matched),'excluded_root_fields':len(value)-len(matched)})
                if len(report['candidates'])>=10:break
    (out/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    return report
