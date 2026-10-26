"""Mount compatibility for hash-recognized generated hosts, never artifact edits."""
import hashlib

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
