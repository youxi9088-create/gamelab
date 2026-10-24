// Read literal JSON loader configuration; never evaluate page-provided code.
const {safeURL}=require('./discovered-web.cjs');
function declaredEntries(scripts,base){
 const entries=[];
 for(const source of scripts.slice(0,80)){
  if(typeof source!=='string'||source.length>500000)continue;
  const starts=[...source.matchAll(/\b(?:var|let|const)\s+[A-Za-z_$][\w$]*\s*=\s*(?=\{)/g)].slice(0,40);
  for(const start of starts){
   const begin=start.index+start[0].length;let depth=0,quoted=false,escaped=false,end=-1;
   for(let i=begin;i<source.length;i++){
    const c=source[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){end=i+1;break;}
   }
   if(end<0)continue;
   try{
    const value=JSON.parse(source.slice(begin,end));
    if(value.loader!=='html5'||typeof value.loaderOptions?.url!=='string')continue;
    const url=safeURL(new URL(value.loaderOptions.url,base).href).href;
    if(!entries.some(e=>e.url===url))entries.push({url,evidence:'literal-html5-loader-url'});
   }catch{} // Non-JSON expressions and non-public addresses are not declarations.
   if(entries.length>=20)return entries;
  }
 }
 return entries;
}
module.exports={declaredEntries};
