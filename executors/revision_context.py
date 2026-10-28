"""Bounded source navigation and exact edits for large revision packages."""
import hashlib
from pathlib import Path
from controlplane.repository import safe_relative

READ_ONLY={'assets','vendor','screenshots','evidence','platform-delivery','verification'}
TEXT={'.html','.js','.mjs','.css','.json','.md','.txt','.svg'}

class RevisionYield(Exception):
    def __init__(self,checkpoint):
        self.checkpoint=checkpoint
        super().__init__('已保存续作检查点，自动接续未完成验证')

def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def editable(name):
    safe_relative(name)
    return name.split('/')[0] not in READ_ONLY and Path(name).suffix.lower() in TEXT

class SourceContext:
    def __init__(self,code,entry):
        self.code=dict(code);self.seen={};self.entry=entry

    def read(self,name,offset=0,length=16000):
        if name not in self.code:raise ValueError('Unknown source path')
        if type(offset) is not int or type(length) is not int or offset<0 or not 1<=length<=50000:
            raise ValueError('Invalid source read range')
        text=self.code[name];end=min(len(text),offset+length)
        if offset>len(text):raise ValueError('Source read offset exceeds file length')
        self.seen.setdefault(name,[]).append((offset,end))
        return {'path':name,'offset':offset,'end':end,'characters':len(text),'sha256':digest(text),'text':text[offset:end],'complete':offset==0 and end==len(text)}

    def retain(self,payload,parts):
        flat=[]
        for part in parts:flat.extend(part.get('matches',[]) if 'matches' in part else [part])
        searches={}
        for part in [p for p in parts if 'matches' in p]+payload.get('source_search_results',[]):
            key=(part.get('path'),part.get('query'))
            if key not in searches:
                searches[key]={k:v for k,v in part.items() if k!='matches'}
        payload['source_search_results']=list(searches.values())[:32]
        unique={}
        for part in flat+payload.get('source_excerpts',[]):
            key=(part.get('path'),part.get('offset'),part.get('sha256'))
            if key not in unique:unique[key]=part
        kept=[];size=0
        for part in unique.values():
            length=len(part.get('text',''))
            if size+length>150000:continue
            kept.append(part);size+=length
        payload['source_excerpts']=kept

    def payload(self):
        names=sorted(self.code,key=lambda n:(n!=self.entry,Path(n).suffix not in ('.html','.js','.mjs','.css'),n))
        remaining=100000;excerpts=[]
        for name in names:
            if remaining<=0:break
            length=min(16000,remaining);part=self.read(name,0,length);remaining-=len(part['text']);excerpts.append(part)
        return {'source_inventory':[{'path':n,'characters':len(self.code[n]),'sha256':digest(self.code[n]),'editable':editable(n)} for n in names], 'source_excerpts':excerpts}

    def restore_navigation(self,payload,saved):
        """Re-read matching evidence; never trust cached text or edit permissions."""
        if not isinstance(saved,dict):return
        for part in saved.get('source_excerpts',[])[:64]:
            if not isinstance(part,dict):continue
            name=part.get('path')
            if name not in self.code or part.get('sha256')!=digest(self.code[name]):continue
            try:self.retain(payload,[self.read(name,part['offset'],part['end']-part['offset'])])
            except (ValueError,KeyError,TypeError):continue
        for part in saved.get('source_search_results',[])[:32]:
            if not isinstance(part,dict):continue
            name=part.get('path')
            if name not in self.code or part.get('sha256')!=digest(self.code[name]):continue
            try:self.retain(payload,self.search([{'path':name,'text':part['query']}]))
            except (ValueError,KeyError,TypeError):continue

    def reads(self,requests):
        if not isinstance(requests,list) or not 1<=len(requests)<=4:raise ValueError('Provide 1-4 read requests')
        if sum(r.get('length',16000) for r in requests)>100000:raise ValueError('Read batch exceeds context budget')
        return [self.read(r['path'],r.get('offset',0),r.get('length',16000)) for r in requests]

    def search(self,requests):
        if not isinstance(requests,list) or not 1<=len(requests)<=4:raise ValueError('Provide 1-4 source searches')
        results=[]
        for request in requests:
            name=request['path'];needle=request['text']
            if name not in self.code or not isinstance(needle,str) or not 1<=len(needle)<=200:raise ValueError('Invalid source search')
            text=self.code[name];offset=0;matches=[]
            while len(matches)<8:
                pos=text.find(needle,offset)
                if pos<0:break
                matches.append(self.read(name,max(0,pos-1000),3000));offset=pos+len(needle)
            results.append({'path':name,'query':needle,'matches':matches,'limit':8,
                'total_matches':text.count(needle),'characters_searched':len(text),'sha256':digest(text),
                'scope':'完整文本字面量搜索；零命中不代表排除别名或动态构造的调用'})
        return results

    def navigate(self,payload,result):
        """Keep successful reads even when another requested path is invalid."""
        errors=[];signatures=[]
        for kind in ('read_requests','search_requests'):
            requests=result.get(kind,[])
            if not isinstance(requests,list) or len(requests)>4:
                errors.append(kind+': provide at most four requests');continue
            for request in requests:
                signatures.append(repr((kind,request)))
                try:
                    parts=self.reads([request]) if kind=='read_requests' else self.search([request])
                    self.retain(payload,parts)
                except (ValueError,KeyError,TypeError) as exc:
                    errors.append(str(request.get('path',''))+': '+str(exc))
        return '; '.join(errors) or None

    def covered(self,name,start,end):
        cursor=start
        for a,b in sorted(self.seen.get(name,[])):
            if a>cursor:break
            if b>cursor:cursor=b
            if cursor>=end:return True
        return cursor>=end

    def apply(self,changes,edits):
        if not isinstance(changes,dict) or not isinstance(edits,list) or len(changes)+len(edits)>100:
            raise ValueError('Invalid revision patch')
        result={}
        for name,value in changes.items():
            if not editable(name) or not isinstance(value,str):raise ValueError('Protected or non-text file')
            if name in self.code and not self.covered(name,0,len(self.code[name])):
                raise ValueError('Full replacement requires reading the complete file; use exact edits instead')
            result[name]=value
        for edit in edits:
            name=edit['path'];old=edit.get('old');new=edit.get('new')
            if not editable(name) or name not in self.code or name in changes:raise ValueError('Invalid edit target')
            original=self.code[name]
            if edit.get('sha256')!=digest(original):raise ValueError('Source changed; read the current file again')
            if not isinstance(old,str) or not old or not isinstance(new,str) or original.count(old)!=1:
                raise ValueError('Exact edit must match one non-empty source segment')
            pos=original.index(old)
            if not self.covered(name,pos,pos+len(old)):raise ValueError('Read the source segment before editing it')
            current=result.get(name,original)
            if current.count(old)!=1:raise ValueError('Overlapping or ambiguous edits')
            result[name]=current.replace(old,new,1)
        return result

    def update(self,changes):
        for name,text in changes.items():
            self.code[name]=text
            self.seen.pop(name,None)
