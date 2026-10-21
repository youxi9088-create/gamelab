"""Offline Unity bundle resource adapter. Never executes original game code.

Explicit selection is recorded; omitted bundles are not claimed as recovered.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys

def export_resources(source, output, patterns):
    dependency=os.environ.get('REPLICA_UNITYPY_PATH')
    if dependency:sys.path.insert(0,dependency)
    import UnityPy
    from UnityPy.helpers.MeshHelper import MeshHandler
    source=Path(source).resolve(strict=True); output=Path(output).resolve()
    output.mkdir(parents=True,exist_ok=True)
    inventory=sorted(source.rglob('*.bundle'))
    chosen=[p for p in inventory if any(p.match(pattern) for pattern in patterns)]
    if not chosen:raise ValueError('No matching resource bundles')
    entries=[];errors=[];bundles=[]
    def flat(rows):return [round(float(v),6) for row in rows for v in row]
    for path in chosen:
        if not path.resolve().is_relative_to(source) or path.is_symlink():raise ValueError('Resource path escapes cache')
        readable=Path('\\\\?\\'+str(path)) if os.name=='nt' else path
        raw=readable.read_bytes()
        digest=hashlib.sha256(raw).hexdigest()
        bundles.append({'path':str(path.relative_to(source)),'sha256':digest})
        env=UnityPy.load(raw)
        for obj in env.objects:
            kind=obj.type.name
            if kind not in ('Mesh','Texture2D'):continue
            try:
                data=obj.read();name=re.sub(r'[^\w.-]','_',data.m_Name)[:70]
                filename=f'{digest[:10]}_{obj.path_id}_{name}'
                record={'type':kind,'name':data.m_Name,'source_bundle':str(path.relative_to(source)),'source_sha256':digest,'object_id':str(obj.path_id)}
                if kind=='Texture2D':
                    filename+='.png';data.image.save(output/filename)
                    record.update(width=data.m_Width,height=data.m_Height)
                else:
                    handler=MeshHandler(data);handler.process();indices=[];groups=[]
                    for triangles in handler.get_triangles():
                        start=len(indices);indices.extend(int(v) for triangle in triangles for v in triangle)
                        groups.append({'start':start,'count':len(indices)-start})
                    mesh={'positions':flat(handler.m_Vertices),'normals':flat(handler.m_Normals or []),'uvs':flat(handler.m_UV0 or []),'indices':indices,'groups':groups}
                    filename+='.json';(output/filename).write_text(json.dumps(mesh,separators=(',',':')),'utf-8')
                record.update(path=filename,sha256=hashlib.sha256((output/filename).read_bytes()).hexdigest())
                entries.append(record)
            except Exception as exc:errors.append({'bundle':path.name,'id':str(obj.path_id),'error':str(exc)[:300]})
    manifest={'adapter':'UnityPy texture-and-static-mesh','inventory_bundle_count':len(inventory),'selected_bundles':bundles,'assets':entries,'errors':errors,
              'limitations':['Only explicitly selected bundles exported','Skinned animation, materials and game logic require runtime adaptation']}
    (output/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
    if errors:raise ValueError(f'{len(errors)} resource exports failed; see manifest')
    return manifest

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('source');parser.add_argument('output');parser.add_argument('--include',action='append',required=True)
    args=parser.parse_args();result=export_resources(args.source,args.output,args.include)
    print(json.dumps({'exported':len(result['assets']),'selected_bundles':len(result['selected_bundles']),'inventory_bundles':result['inventory_bundle_count']}))
