"""Read one source-derived public static settings file once; no API/account calls."""
from pathlib import Path
import json, re, hashlib, subprocess, datetime, urllib.parse

b = Path(__file__).parent
r = b / 'direct-games/job-3db06205247a'
out = r / 'original-streaming-assets-20261118'
assert not out.exists(), 'Inspect existing intake; do not repeat requests.'
bindings = json.loads((r/'analysis-20261118/streaming-path-bindings/original-path-method-bindings.json').read_bytes())
assert any(x['method']=='get_streamingAssetsPath' and x['function_index']==6872 for x in bindings['methods'])
assert any(x['method']=='Concat' and x['parameter_count']==3 and x['function_index']==676 for x in bindings['methods'])
paths = json.loads((r/'analysis-20261118/streaming-paths/original-settings-constant-source.json').read_bytes())
src = next(x['source'] for x in paths['original_source_snippets'] if x['function_index']==18038)
assert all(x in src for x in ['f_idj(0)', 'f_az(d,', '[40173]:int', '[48055]:int', '[40192]:int'])
metadata = (r/'analysis-20261117/metadata-decoded-e906ad610c88fe82b2d0199b3cc0e7fb-ANALYSIS-ONLY.dat').read_bytes()
import struct
lt, ls = struct.unpack_from('<II', metadata, 8)
ld, lds = struct.unpack_from('<II', metadata, 16)
# Original Wasm static-data memory references are verified in the source view.
source = (b/'direct_blockpost2_wasm_method_map_20261117.py').read_text(encoding='utf8')
source = source[:source.index('types=json.loads')].replace('job-353d7339bf40','job-3db06205247a').replace('bpm2.wasm.unityweb','aedef0a7b3758084f1b210f292a2b27d.wasm.br')
import contextlib, io
ns = {'__file__':str(b/'source-only-intake-read.py')}
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(source,'source-only-intake-read','exec'),ns)
memory = ns['memory']
dcmp = (r/'analysis-20261118/streaming-paths/settings-constant-analysis-NOT-RUNTIME.dcmp').read_text(encoding='utf8')
base_match = re.search(r'^data d_3_3_3_30_3_3P_3_3p_3_3_3_3_3\(offset: (\d+)\)', dcmp, re.M)
assert base_match
array_base = int(base_match[1])
assert array_base == 5562736
literals = []
for index in [40173,48055,40192]:
    encoded = struct.unpack_from('<I', memory, array_base+index*4)[0]
    kind, literal = encoded>>29, (encoded & ((1<<29)-1))>>1
    assert encoded & 1
    assert kind==5, (index,encoded,kind)
    size, offset = struct.unpack_from('<II',metadata,lt+literal*8)
    assert offset+size<=lds
    value = metadata[ld+offset:ld+offset+size].decode()
    literals.append(dict(memory_array_base=array_base,memory_index=index,literal_index=literal,value=value))
assert [x['value'] for x in literals]==['/','aa','/settings.json']
html = (r/'original-20261117/source-entry.html').read_text(encoding='utf8')
declared = re.findall(r'streamingAssetsUrl\s*:\s*"([^"]+)"',html)
assert declared==['StreamingAssets'],declared
read = json.loads((b/'direct-smash-bound-acquisition-read-20261118.json').read_bytes())
entry = next(x['url_without_query'] for x in read['original_source_urls'] if x['path']=='web-acquisition.json.url')
assert entry=='https://smash-karts.game-files.crazygames.com/smash-karts/194/index.html'
url = urllib.parse.urljoin(entry, declared[0] + ''.join(x['value'] for x in literals))
assert url=='https://smash-karts.game-files.crazygames.com/smash-karts/194/StreamingAssets/aa/settings.json'
out.mkdir()
file = out/'settings-response.bin'
proc = subprocess.run(['curl.exe','--noproxy','*','--compressed','--silent','--show-error','--max-time','25',
                       '--max-filesize','5000000','--proto','=https','--output',str(file),
                       '--write-out','%{http_code}',url],capture_output=True,text=True,timeout=30)
row = dict(url=url,method='GET',proxy=False,tls_verified=True,curl_exit=proc.returncode,
           http=int(proc.stdout or 0),source_derived=True,application_request_observed=False)
if file.exists():
    raw = file.read_bytes()
    row.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
if proc.stderr:
    row['error']=proc.stderr.strip()[:250]
complete = proc.returncode==0 and row['http']==200
if complete:
    value=json.loads(raw)
    assert isinstance(value,dict)
    row['json_keys']=sorted(value)
    (out/'settings.json').write_bytes(raw)
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),source_only=True,game_executed=False,
           original_modified=False,scan_started=False,requests=1,complete=complete,request=row,
           original_entry=entry,declared_streaming_assets=declared[0],original_literal_chain=literals,
           limitations=['SDK default source path derived exactly; actual game request remains unobserved.',
                        'No alternate-path guesses, retries, APIs, login, account state or fabricated settings.'])
(out/'intake.json').write_bytes(json.dumps(proof,ensure_ascii=False,indent=2).encode())
print(json.dumps(proof,ensure_ascii=False))
