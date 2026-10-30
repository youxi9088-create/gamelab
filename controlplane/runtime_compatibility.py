"""Mount compatibility for hash-recognized generated hosts, never artifact edits."""
import hashlib
import json
import re

# Generated adapter versions, independent of any game identity.
LEGACY_RESOURCE_BINDING_HASHES={
    '67b770564141f0a29382a989b13ba17ef41ac47ae846ef70ec7cabda1f1db6fb',
    'baa88cab2a2a85036b41d5d9899b95c8d2f2f868e7d90ce4e66ec14aa5079194',
}

def mounted_resource_bindings(content, root):
    if hashlib.sha256(content).hexdigest() not in LEGACY_RESOURCE_BINDING_HASHES:
        return content,None
    try:
        text=(root/'runtime-resource-map.js').read_text('utf-8').strip()
        prefix='window.runtimeResourceBindings='
        if not text.startswith(prefix) or not text.endswith(';'):return content,None
        mapping=json.loads(text[len(prefix):-1])
        if not isinstance(mapping,dict):return content,None
        allowed=[]
        for value in mapping.values():
            if not isinstance(value,str) or not re.fullmatch(r'/_runtime_resources/[a-f0-9]{24}\.[a-z0-9]{1,8}',value):continue
            path=(root/value.lstrip('/')).resolve()
            if path.is_relative_to(root.resolve()) and path.is_file():allowed.append(value)
        if not allowed:return content,None
    except (OSError,ValueError):return content,None
    helper='''(()=>{
 const map=window.runtimeResourceBindings||{},base=new URL('.',document.currentScript.src);
 const allowed=new Set(ALLOWED);
 for(const [source,target] of Object.entries(map)){
  if(!allowed.has(target))continue;
  const local=new URL('.'+target,base).href;
  map[source]=local;
  map[new URL(target,base.origin).href]=local;
 }
})();
'''.replace('ALLOWED',json.dumps(sorted(set(allowed))))
    return helper.encode()+content,{'X-GameLab-Runtime-Compatibility':'observed-resource-base-v1',
                                   'X-GameLab-Artifact-File-SHA256':hashlib.sha256(content).hexdigest()}

LEGACY_BOOT_HASHES={
    '1ea87465b7f7ac7b16593d411cd1130f0e6dbd07974b6da606fc1bdc06b0fd71',
    '6739feec27a8de44c856698298c4ccb3daeefdf2d2dfcd4411b5eccc4994bf68',
}

def mounted_boot(content):
    normalized=content.replace(b'\r\n',b'\n')
    if hashlib.sha256(normalized).hexdigest() not in LEGACY_BOOT_HASHES:return content,None
    text=normalized.decode('utf-8')
    helper='''const runtimeBase=new URL('.',document.currentScript.src);
function runtimeModulePath(value){
 const url=new URL(value,runtimeBase);
 if(url.origin!==runtimeBase.origin||!url.pathname.startsWith(runtimeBase.pathname))throw Error('Module URL outside runtime: '+value);
 return url.pathname.slice(runtimeBase.pathname.length);
}
'''
    text=text.replace('const cache={};\n','const cache={};\n'+helper,1)
    text=text.replace('new URL(document.currentScript.src).pathname.slice(1)','runtimeModulePath(document.currentScript.src)',1)
    text=text.replace("requireModule(url.replace(/^\\//,''))","requireModule(runtimeModulePath(url))",1)
    return text.encode('utf-8'),{'X-GameLab-Runtime-Compatibility':'module-base-v1',
                                'X-GameLab-Artifact-File-SHA256':hashlib.sha256(content).hexdigest()}
