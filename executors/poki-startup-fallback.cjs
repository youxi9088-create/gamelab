const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function(root,acq){
 const file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8');
 const fallback=/PokiSDK\.init\(\)\.then\(\s*\(\)\s*=>\s*\{\s*Module\.runApp\((["'])canvas\1\);?\s*\},\s*\(\)\s*=>\s*\{\s*Module\.runApp\((["'])canvas\2\);?\s*\}\s*\)/;
 if(!fallback.test(html))return false;
 const declared=/<script\b[^>]*\bsrc\s*=\s*(["'])([^"']+)\1/gi;
 let matches=[];for(const m of html.matchAll(declared)){
  let url;try{url=new URL(m[2],acq.url).href}catch{continue}
  let source=url;
  if(!/^https:\/\/game-cdn\.poki\.com\/scripts\/(?:v2\/poki-sdk\.js|[a-f0-9]+\/poki-sdk(?:-core-[a-f0-9]+)?\.js)$/.test(source)){
   const row=(acq.files||[]).find(f=>f.path&&new URL('./'+f.path,acq.url).href===url);
   source=row?.url||'';
  }
  if(/^https:\/\/game-cdn\.poki\.com\/scripts\/(?:v2\/poki-sdk\.js|[a-f0-9]+\/poki-sdk(?:-core-[a-f0-9]+)?\.js)$/.test(source))matches.push({m,source});
 }
 if(matches.length!==1)return false;
 const {m,source}=matches[0];
 const changed=html.slice(0,m.index)+m[0].replace(m[2],'runtime-host.js')+html.slice(m.index+m[0].length);
 fs.copyFileSync(path.join(__dirname,'adapters/poki-offline.js'),path.join(root,'runtime-host.js'));
 fs.writeFileSync(file,changed);
 fs.mkdirSync(path.join(root,'evidence'),{recursive:true});
 fs.writeFileSync(path.join(root,'evidence/poki-startup-fallback.json'),JSON.stringify({source,policy:'Original init rejection branch explicitly starts the same canvas; offline host rejects init and grants no ad rewards',before:crypto.createHash('sha256').update(html).digest('hex'),after:crypto.createHash('sha256').update(changed).digest('hex'),verification_required:true}));
 return true;
};