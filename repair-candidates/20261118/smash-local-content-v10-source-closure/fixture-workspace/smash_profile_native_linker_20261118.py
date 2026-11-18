"""Link only self-authored helper bodies into a hash-bound native module without executing it."""
import hashlib
def u(n):
    out=bytearray()
    while True:
        x=n&127;n>>=7;out.append(x|128 if n else x)
        if not n:return bytes(out)
def leb(raw,p):
    n=shift=0
    while True:
        x=raw[p];p+=1;n|=(x&127)<<shift;shift+=7
        if not x&128:return n,p
        assert shift<=35
def string(raw,p):
    size,p=leb(raw,p);return raw[p:p+size].decode(),p+size
def sections(raw):
    assert raw[:8]==b'\0asm\1\0\0\0';result=[];p=8
    while p<len(raw):
        begin=p;kind=raw[p];size,p=leb(raw,p+1);end=p+size;assert end<=len(raw);result.append((kind,begin,p,end));p=end
    return result
def sigs(raw,secs):
    s=next(x for x in secs if x[0]==1);count,p=leb(raw,s[2]);out=[]
    for _ in range(count):
        assert raw[p]==0x60;n,p=leb(raw,p+1);args=tuple(raw[p:p+n]);p+=n;n,p=leb(raw,p);ret=tuple(raw[p:p+n]);p+=n;out.append((args,ret))
    assert p==s[3];return out
def imports(raw,secs,helper=False):
    s=next(x for x in secs if x[0]==2);count,p=leb(raw,s[2]);funcs=[];global_count=memory_count=0
    for _ in range(count):
        module,p=string(raw,p);name,p=string(raw,p);kind=raw[p];p+=1
        if kind==0:
            typ,p=leb(raw,p);funcs.append((module,name,typ))
        elif helper and kind==2:
            flags,p=leb(raw,p);minimum,p=leb(raw,p);assert flags==0 and minimum==1;memory_count+=1
        elif helper and kind==3:
            assert raw[p:p+2]==b'\x7f\1'and name=='stack';p+=2;global_count+=1
        else:raise AssertionError(('Unsupported import',module,name,kind))
    assert p==s[3]
    if helper:assert global_count==memory_count==1
    return funcs
def function_types(raw,secs):
    s=next(x for x in secs if x[0]==3);count,p=leb(raw,s[2]);out=[]
    for _ in range(count):i,p=leb(raw,p);out.append(i)
    assert p==s[3];return out
def bodies(raw,secs):
    s=next(x for x in secs if x[0]==10);count,p=leb(raw,s[2]);out=[]
    for _ in range(count):size,p=leb(raw,p);out.append(raw[p:p+size]);p+=size
    assert p==s[3];return out
def exports(raw,secs):
    s=next(x for x in secs if x[0]==7);count,p=leb(raw,s[2]);out=[]
    for _ in range(count):name,p=string(raw,p);kind=raw[p];i,p=leb(raw,p+1);out.append((name,kind,i))
    assert p==s[3];return out
def remap_own_body(body,indexes):
    # Decode only the deliberately small instruction vocabulary emitted by our WAT.
    # Never interpret or rewrite instructions in original game function bodies.
    count,p=leb(body,0)
    for _ in range(count):_,p=leb(body,p);assert body[p]==127;p+=1
    result=bytearray(body[:p]);calls=[]
    while p<len(body):
        begin=p;op=body[p];p+=1
        if op==0x10:
            idx,p=leb(body,p);assert idx in indexes;result.append(op);result.extend(u(indexes[idx]));calls.append(indexes[idx]);continue
        if op in[0x20,0x21,0x22]:_,p=leb(body,p)
        elif op in[0x23,0x24]:idx,p=leb(body,p);assert idx==0
        elif op in[0x28,0x2d,0x36,0x3a]:_,p=leb(body,p);_,p=leb(body,p)
        elif op==0x41:
            while body[p]&128:p+=1
            p+=1
        elif op==0x04:assert body[p]in[0x40,0x7f];p+=1
        else:assert op in[0x00,0x05,0x0b,0x0f,0x45,0x46,0x6a,0x6b,0x71],('Unexpected own opcode',hex(op),begin)
        result.extend(body[begin:p])
    assert p==len(body);return bytes(result),calls
def link(original,helper,targets):
    oldsecs=sections(original);ownsecs=sections(helper);oldtypes=sigs(original,oldsecs);owntypes=sigs(helper,ownsecs)
    oldimports=imports(original,oldsecs);ownimports=imports(helper,ownsecs,True)
    olddefined=function_types(original,oldsecs);owndefined=function_types(helper,ownsecs)
    oldbodies=bodies(original,oldsecs);ownbodies=bodies(helper,ownsecs);assert len(olddefined)==len(oldbodies)and len(owndefined)==len(ownbodies)
    alltypes=[x[2]for x in oldimports]+olddefined;total=len(alltypes);mapping={}
    for i,(module,name,typ)in enumerate(ownimports):
        assert module=='native'and name in targets;target=targets[name];assert 0<=target<total
        assert owntypes[typ]==oldtypes[alltypes[target]],(name,owntypes[typ],oldtypes[alltypes[target]])
        mapping[i]=target
    mapping.update({len(ownimports)+i:total+i for i in range(len(ownbodies))})
    # Original g0 is the native mutable i32 stack pointer, established by original source.
    glob=next(x for x in oldsecs if x[0]==6);gc,p=leb(original,glob[2]);assert gc>0 and original[p:p+2]==b'\x7f\1'
    appended=[];calls=[]
    for body in ownbodies:
        changed,used=remap_own_body(body,mapping);appended.append(changed);calls.append(used)
    appended_types=[]
    for typ in owndefined:assert owntypes[typ]in oldtypes;appended_types.append(oldtypes.index(owntypes[typ]))
    ownexports=exports(helper,ownsecs);oldexports=exports(original,oldsecs);assert not({x[0]for x in ownexports}&{x[0]for x in oldexports})
    assert all(kind==0 for _,kind,_ in ownexports)
    replacements={3:u(len(olddefined)+len(appended_types))+b''.join(u(x)for x in olddefined+appended_types),10:u(len(oldbodies)+len(appended))+b''.join(u(len(x))+x for x in oldbodies+appended)}
    s=next(x for x in oldsecs if x[0]==7);count,p=leb(original,s[2]);replacements[7]=u(count+len(ownexports))+original[p:s[3]]+b''.join(u(len(name.encode()))+name.encode()+bytes([kind])+u(mapping[index])for name,kind,index in ownexports)
    result=bytearray(original[:8])
    for kind,begin,p,end in oldsecs:
        if kind in replacements:raw=replacements[kind];result.append(kind);result.extend(u(len(raw)));result.extend(raw)
        else:result.extend(original[begin:end])
    result=bytes(result);newsecs=sections(result);newbodies=bodies(result,newsecs)
    assert newbodies[:len(oldbodies)]==oldbodies and len(newbodies)==len(oldbodies)+len(appended)
    unchanged={str(len(oldimports)+i):hashlib.sha256(v).hexdigest()for i,v in enumerate(oldbodies)}
    proof={'original_wasm_sha256':hashlib.sha256(original).hexdigest(),'own_helper_wasm_sha256':hashlib.sha256(helper).hexdigest(),'linked_wasm_sha256':hashlib.sha256(result).hexdigest(),'original_defined_functions_unchanged':len(oldbodies),'original_imports_unchanged':len(oldimports),'appended_function_indices':list(range(total,total+len(appended))),'appended_function_bodies_hex':[v.hex()for v in appended],'appended_type_indices':appended_types,'exports':[{'name':name,'function_index':mapping[idx]}for name,_,idx in ownexports],'original_native_targets':targets,'own_direct_calls':calls,'game_executed':False,'original_body_sha256':unchanged}
    return result,proof
