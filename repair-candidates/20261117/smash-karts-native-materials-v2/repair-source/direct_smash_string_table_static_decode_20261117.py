"""Reproduce only the original RVA byte transform; no native game execution."""
from pathlib import Path
import json,struct,hashlib,re,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'analysis-20261117'
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8').replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');source=source[:source.index('types=json.loads')]
ns={'__file__':str(b/'static-string-reader.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'smash-data-only','exec'),ns)
memory=ns['memory'];raw=(folder/'metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
dcmp=(folder/'gameplay-code-NOT-RUNTIME.dcmp').read_text(encoding='utf8')
def body(fn):
 matches=list(re.finditer(r'^function [^\n]+// func'+str(fn)+r'$',dcmp,re.M));assert len(matches)==1
 start=matches[0].start();end=dcmp.find('\nfunction ',start+1);return dcmp[start:end if end>=0 else len(dcmp)]
cctor=body(115389);getter=body(35469);scene_getter=body(11556)
assert '448348' in cctor and '(b[16]:ubyte ^ a) ^ 170' in cctor
assert re.search(r'\n\s+2203,\n\s+57,',getter) and re.search(r'\n\s+1441,\n\s+24,',scene_getter)
# Check the exact InitializeArray field reference used by the original cctor.
encoded=struct.unpack_from('<I',memory,5562736+39138*4)[0];assert encoded>>29==4;ref=(encoded&0x1fffffff)>>1
refs,size=struct.unpack_from('<II',raw,184);assert ref<size//8;typ,field=struct.unpack_from('<ii',raw,refs+ref*8)
types,ts=struct.unpack_from('<II',raw,160);matches=[i for i in range(ts//88) if struct.unpack_from('<i',raw,types+i*88+8)[0]==typ]
assert matches==[1085] and field==0
field_start=struct.unpack_from('<i',raw,types+1085*88+32)[0];assert field_start==9000
defaults,n=struct.unpack_from('<II',raw,64);data,size=struct.unpack_from('<II',raw,72)
rows=[struct.unpack_from('<iii',raw,pos) for pos in range(defaults,defaults+n,12) if struct.unpack_from('<i',raw,pos)[0]==9000]
assert len(rows)==1;_,_,offset=rows[0];assert 0<=offset<=offset+448348<=size
encrypted=raw[data+offset:data+offset+448348];decoded=bytes(v^(i&255)^170 for i,v in enumerate(encrypted))
catalog_prefix=decoded[2203:2260].decode('utf8');scene=decoded[1441:1465].decode('utf8')
assert catalog_prefix=='https://smashkartsgc.b-cdn.net/assetbundles/remote/webgl/' and scene=='TallTeamPuntTestLobbyWeb'
mapping=json.loads((folder/'native-gameplay-wasm-map.json').read_text(encoding='utf8'))
bridge=next(m for m in mapping['mapped_methods'] if m['class']=='JavascriptMessageSender' and m['name']=='GetAddressableCatalogFilename')
assert bridge['function_index']==100661 and bridge['table_index']==3502
assert 'a_Sj()' in body(100661)
imports=mapping['imports'];assert imports[583]['name']=='Sj'
framework=(r/'native-build-20261117/41c0f438c941cb52e5a25dae21ba9c27.framework.js.br').read_text(encoding='utf8');assert '"Sj":_GetAddressableCatalogFilename' in framework
entry=(r/'original-20261117/source-entry.html').read_text(encoding='utf8')
filenames=re.findall(r'var (?:addressableCatalogFilename|mobileAddressableCatalogFilename) = "([^"\n]+)";',entry);assert len(filenames)==2
proof={'source_only':True,'game_executed':False,'original_game_modified':False,'metadata_sha256':hashlib.sha256(raw).hexdigest(),'original_field_index':9000,'original_field_ref':ref,'original_field_value_offset':offset,'native_cctor_function':115389,'native_transform':'byte[i] XOR (i modulo256) XOR170','bytes':len(decoded),'encoded_rva_sha256':hashlib.sha256(encrypted).hexdigest(),'decoded_table_sha256':hashlib.sha256(decoded).hexdigest(),
 'catalog_prefix':catalog_prefix,'prefix_native_getter':35469,'prefix_range':[2203,57],'scene':scene,'scene_native_getter':11556,'scene_range':[1441,24],
 'catalog_filename_bridge':{'native_function':100661,'table_index':3502,'native_import_index':583,'import_name':'Sj','javascript_function':'_GetAddressableCatalogFilename','original_js_returns':'addressableCatalogFilename'},
 'catalog_urls':[catalog_prefix+n for n in filenames],'semantic_validation_scope':'Exact resource-prefix getter, scene getter and catalog-filename bridge only. No generic license/account/backend behavior inference.'}
(folder/'native-string-table-ANALYSIS-ONLY.bin').write_bytes(decoded)
(folder/'string-table-source-proof.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8')
(folder/'string-table-native-source-excerpts.json').write_text(json.dumps({'source_only':True,'cctor':cctor,'catalog_prefix_getter':getter,'scene_getter':scene_getter,'catalog_bridge':body(100661)},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(proof,ensure_ascii=False))
