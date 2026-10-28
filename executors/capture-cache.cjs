const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function cachedResponse(root,record){
 if(!record||!record.sha256||!record.contentType)return null;
 const file=path.resolve(root,record.path),base=path.resolve(root);
 if(!file.startsWith(base+path.sep))return null;
 for(let p=file;p!==base;p=path.dirname(p))if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink())return null;
 const data=fs.readFileSync(file);
 if(data.length!==record.bytes||hash(data)!==record.sha256)return null;
 return {ok:()=>true,status:()=>200,body:async()=>data,url:()=>record.sourceURL||record.url,
  headers:()=>({'content-type':record.contentType}),dispose:async()=>{},cached:true};
}
function classifyMissing(req,status,phase){
 const type=req.resourceType();
 return {url:req.url(),status,phase,type,method:req.method(),
  classification:status===404||status===410?'source_unavailable':status===401||status===403?'access_denied':status>=500?'upstream_error':'http_error',
  impact:['script','stylesheet','document'].includes(type)?'potentially_required':'needs_runtime_review',resolution:'pending'};
}
module.exports={cachedResponse,classifyMissing};
