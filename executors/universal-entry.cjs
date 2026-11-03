// First-party Universal loader adapter. Read literal RSC data, never page JS.
// The public loader builds /api/server/<revisionId>/index.html; a revision is
// a probe lead only. Fresh browser verification still establishes the entry.
function universalEntries(scripts,base){
 let source;try{source=new URL(base)}catch{return []}
 if(!['rosebud.ai','www.rosebud.ai'].includes(source.hostname)||!/^\/play\/[^/]+\/?$/.test(source.pathname))return [];
 let stream='';
 for(const script of scripts.slice(0,80)){
  if(typeof script!=='string'||script.length>500000)continue;
  for(const match of script.matchAll(/self\.__next_f\.push\((\[1\s*,\s*"(?:\\.|[^"\\])*"\s*\])\)/g)){
   try{stream+=JSON.parse(match[1])[1]}catch{}
   if(stream.length>2000000)return [];
  }
 }
 const revisions=new Set(),uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
 // RSC text records are byte-counted and need not end at a newline. Extract
 // only the loader's literal props object after decoding the transport string.
 for(const match of [...stream.matchAll(/\{\s*"files"\s*:/g)].slice(0,40)){
  let depth=0,quoted=false,escaped=false,end=-1;
  for(let i=match.index;i<Math.min(stream.length,match.index+32000);i++){
   const c=stream[i];
   if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue}
   if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end=i+1;break}
  }
  if(end<0)continue;
  try{
   const value=JSON.parse(stream.slice(match.index,end));
   if(value.mode==='Universal'&&Array.isArray(value.files)&&uuid.test(value.projectId||'')&&uuid.test(value.revisionId||''))revisions.add(value.revisionId);
  }catch{}
 }
 if(revisions.size!==1)return [];
 return [{url:'https://playground-gateway-v2-snduoq54tq-uc.a.run.app/api/server/'+[...revisions][0]+'/index.html',evidence:'universal-loader-revision-declaration',observed_on:base,requires_fresh_probe:true}];
}
module.exports={universalEntries};
