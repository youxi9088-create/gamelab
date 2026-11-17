from pathlib import Path
import json,struct,re,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';folder=r/'analysis-20261117'
source=(b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8').replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br');source=source[:source.index('types=json.loads')]
ns={'__file__':str(b/'static-reference-reader.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(source,'smash-data-segment-read','exec'),ns)
memory=ns['memory'];proof=json.loads((folder/'metadata-static-decode-proof.json').read_text(encoding='utf8'));variant=next(v for v in proof['variants']if v['variant'].startswith('e906'));raw=(r/variant['decoded_file']).read_bytes()
strings,ss=struct.unpack_from('<II',raw,24);types,ts=struct.unpack_from('<II',raw,160);methods,ms=struct.unpack_from('<II',raw,48);literals,ls=struct.unpack_from('<II',raw,8);ld,lds=struct.unpack_from('<II',raw,16)
def string(i):assert 0<=i<ss;return raw[strings+i:raw.index(0,strings+i,strings+ss)].decode('utf8')
def type_name(i):assert 0<=i<ts//88;return string(struct.unpack_from('<I',raw,types+i*88)[0])
text=(folder/'gameplay-code-named-NOT-RUNTIME.dcmp').read_text(encoding='utf8');match=re.search(r'^data (d_3_3_3_30_3_3P\S+)\(offset: (\d+)\)',text,re.M);assert match;symbol,base=match[1],int(match[2])
excerpts=json.loads((folder/'original-flow-source-excerpts.json').read_text(encoding='utf8'));indices=sorted(set(int(v) for row in excerpts['snippets'] for v in re.findall(re.escape(symbol)+r'\[(\d+)\]:int',row['decompiled_source'])))
rows=[]
for index in indices:
 value=struct.unpack_from('<I',memory,base+index*4)[0];kind=value>>29;decoded=(value&0x1fffffff)>>1;row={'data_index':index,'kind':kind,'decoded':decoded}
 if kind==5:
  assert decoded<ls//8;n,off=struct.unpack_from('<II',raw,literals+decoded*8);assert off+n<=lds;row['literal']=raw[ld+off:ld+off+n].decode('utf8')
 elif kind==3:
  assert decoded<ms//36;ni,decl=struct.unpack_from('<Ii',raw,methods+decoded*36);row.update(method=string(ni),type=type_name(decl))
 elif kind==1:row['types']=[{'index':i,'name':type_name(i)}for i in range(ts//88)if struct.unpack_from('<i',raw,types+i*88+8)[0]==decoded]
 rows.append(row)
out={'source_only':True,'game_executed':False,'original_memory_data_base':base,'references':rows};(folder/'flow-metadata-references.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(out,ensure_ascii=False))
