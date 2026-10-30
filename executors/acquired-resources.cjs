const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function recorder(context,dir){
 const rows=[],pending=[];let bytes=0;
 const listener=response=>{
  const req=response.request(),type=req.resourceType();
  if(req.method()!=='GET'||!response.ok()||rows.length>=300||!['script','stylesheet','image','font','media'].includes(type))return;
  if(Number(response.headers()['content-length'])>20*1024*1024)return;
  pending.push((async()=>{try{
   const frame=req.frame().url(),data=await response.body();
   if(!data.length||data.length>20*1024*1024||bytes+data.length>80*1024*1024||rows.length>=300)return;
   const name='resource-snapshot/'+hash(data);fs.mkdirSync(path.join(dir,'resource-snapshot'),{recursive:true});
   fs.writeFileSync(path.join(dir,name),data);bytes+=data.length;
   rows.push({url:response.url(),frame,path:name,sha256:hash(data),bytes:data.length,contentType:response.headers()['content-type']||'application/octet-stream',type});
  }catch{}})());
 };
 context.on('response',listener);
 return {async finish(){context.off('response',listener);await Promise.allSettled(pending);fs.writeFileSync(path.join(dir,'resource-snapshot.json'),JSON.stringify({schema:1,files:rows,bytes}));}};
}
function load(dir,entry){
 if(!fs.existsSync(dir)||fs.lstatSync(dir).isSymbolicLink())return new Map();
 const assets=path.join(dir,'resource-snapshot');if(fs.existsSync(assets)&&fs.lstatSync(assets).isSymbolicLink())return new Map();
 const file=path.join(dir,'resource-snapshot.json');if(!fs.existsSync(file))return new Map();
 const report=JSON.parse(fs.readFileSync(file,'utf8')),result=new Map();
 for(const row of report.files||[]){
  if(row.frame!==entry||typeof row.path!=='string'||!/^resource-snapshot\/[a-f0-9]{64}$/.test(row.path))continue;
  const p=path.join(dir,row.path);if(!fs.existsSync(p)||fs.lstatSync(p).isSymbolicLink())continue;
  const data=fs.readFileSync(p);if(data.length!==row.bytes||hash(data)!==row.sha256)continue;
  result.set(row.url,{ok:()=>true,status:()=>200,url:()=>row.url,headers:()=>({'content-type':row.contentType}),body:async()=>data,dispose:async()=>{},acquired:true});
 }
 return result;
}
module.exports={recorder,load};
