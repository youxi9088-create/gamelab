"""Extract explicitly referenced HTML from public Flight text records; never eval JS."""
from html.parser import HTMLParser
import hashlib
import json
import re


class Scripts(HTMLParser):
    def __init__(self):
        super().__init__();self.active=False;self.parts=[]
    def handle_starttag(self,tag,attrs):self.active=tag=='script' and not dict(attrs).get('src')
    def handle_endtag(self,tag):
        if tag=='script':self.active=False
    def handle_data(self,data):
        if self.active:self.parts.append(data)


def extract(html,directory):
    parser=Scripts();parser.feed(html)
    chunks=[]
    for script in parser.parts:
        match=re.fullmatch(r'\s*self\.__next_f\.push\((\[.*\])\)\s*;?\s*',script,re.S)
        if not match:continue
        try:value=json.loads(match[1])
        except ValueError:continue
        if isinstance(value,list) and len(value)==2 and value[0]==1 and isinstance(value[1],str):chunks.append(value[1])
    payload=''.join(chunks)
    if len(payload.encode('utf-8'))>8*1024*1024:return None
    raw=payload.encode('utf-8')
    def record(key):
        refs=set(re.findall('"'+key+r'":"\$([0-9a-f]+)"',payload))
        if len(refs)!=1:return None
        ref=refs.pop().encode()
        match=re.search(rb'(?:^|\n)'+ref+rb':T([0-9a-f]+),',raw)
        if not match:return None
        size=int(match[1],16)
        if not 0<size<=2*1024*1024 or match.end()+size>len(raw):return None
        try:return raw[match.end():match.end()+size].decode('utf-8')
        except UnicodeError:return None
    code=record('game_code')
    if not code or not re.match(r'\s*(?:<!doctype html>|<html)',code,re.I):return None
    directory.mkdir(exist_ok=True)
    files={'index.html':code}
    maps=[]
    for match in re.finditer(r'"asset_map"\s*:',payload):
        try:value,_=json.JSONDecoder().raw_decode(payload[match.end():].lstrip())
        except ValueError:continue
        if isinstance(value,dict) and value and all(isinstance(v,dict) for v in value.values()):maps.append(value)
    if len(maps)==1:
        files['asset-map.json']=json.dumps(maps[0],ensure_ascii=False,indent=2)
    config=record('game_config')
    if config:
        try:json.loads(config);files['game-config.json']=config
        except ValueError:pass
    manifest=[]
    for name,body in files.items():
        data=body.encode('utf-8');(directory/name).write_bytes(data)
        manifest.append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    urls=sorted(set(re.findall(r'https?://[^\s"\'<>`\\]+',code)))[:500]
    result={'kind':'embedded-html','directory':str(directory),'entry':'index.html','files':manifest,
            'remote_reference_candidates':urls,'scope':'原页面显式 game_code 引用；远程资源尚未下载，宿主接口与玩法未验证'}
    (directory/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    return result
