"""Identify the original cold-profile constructors, not SDK-auth callbacks."""
from pathlib import Path
import json,struct,hashlib,contextlib,io,datetime
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'analysis-20261118/local-profile-constructors';assert not out.exists()
src=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8');src=src[:src.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');ns={'__file__':str(b/'profile-constructor-static-read.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'profile-constructor-static-read','exec'),ns)
memory,table=ns['memory'],ns['table'];meta=(r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes();st,ss=struct.unpack_from('<II',meta,24);tt,ts=struct.unpack_from('<II',meta,160);mt,ms=struct.unpack_from('<II',meta,48);it,isz=struct.unpack_from('<II',meta,168)
def string(i):
    assert 0<=i<ss;return meta[st+i:meta.index(0,st+i,st+ss)].decode()
image=next(p for p in range(it,it+isz,40)if string(struct.unpack_from('<I',meta,p)[0])=='Assembly-CSharp.dll');first,count=struct.unpack_from('<iI',meta,image+8)
module=json.loads((r/'analysis-20261117/native-gameplay-wasm-map.json').read_bytes())['modules']['Assembly-CSharp.dll'];ptrs=struct.unpack_from('<'+'I'*module['method_count'],memory,module['pointers_address'])
wanted={25900,43161,43206,43198,43254};rows=[]
for ti in range(first,first+count):
    off=tt+88*ti;start=struct.unpack_from('<i',meta,off+36)[0];number=struct.unpack_from('<H',meta,off+64)[0]
    for mi in range(start,start+number):
        p=mt+mi*36;token=struct.unpack_from('<I',meta,p+24)[0];index=(token&0xffffff)-1
        if not(0<=index<len(ptrs)):continue
        pointer=ptrs[index];fn=table.get(pointer)
        if fn not in wanted:continue
        rows.append(dict(type_index=ti,namespace=string(struct.unpack_from('<I',meta,off+4)[0]),class_name=string(struct.unpack_from('<I',meta,off)[0]),method_name=string(struct.unpack_from('<I',meta,p)[0]),method_index=mi,token=token,table_index=pointer,function_index=fn,parameter_count=struct.unpack_from('<H',meta,p+34)[0]))
assert set(x['function_index']for x in rows)==wanted
services=json.loads((r/'analysis-20261118/data-services-v2/service-original-source-proof.json').read_bytes());sources={x['function_index']:x['source']for x in services['original_source_snippets']}
assert 'a[3]:int = b;'in sources[17870]and 'f_ehla(b, 0);'in sources[17870]and 'f_uwkb(b, 0);'in sources[17870]
assert 'f_bvkb(b, 0);'in sources[17870]and 'f_mwkb(b, 0);'in sources[17870]
assert 'a[80]:byte = 1;'in sources[12572]and 'a[17]:int'in sources[12572]
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,original_modified=False,network_requests_made=0,original_wasm_sha256=hashlib.sha256(ns['raw']).hexdigest(),metadata_sha256=hashlib.sha256(meta).hexdigest(),original_methods=rows,original_user_initialization={str(fn):sources[fn]for fn in [104597,17870,104595,12572,44721,2736]},boundary=['UserService.Init creates real original profile objects before a ready flag is set.','Original finalizer12572 checks identity/data freshness, applies actual defaults/deserialization and has network side effects; it is not an offline adapter by itself.','Do not feed fabricated Firebase results or flip ready80; any local port must separate real local-storage lifecycle and original profile data from account and upload consumers.','A shipped constructor establishes default code values, not equivalence to unavailable live server settings.'])
out.mkdir();(out/'original-profile-method-map.json').write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode());print(json.dumps({k:v for k,v in proof.items()if k!='original_user_initialization'},ensure_ascii=False))
