const fs=require('node:fs'),path=require('node:path');
module.exports=function(html,map,base,root){
 return html.replace(/(<(?:script|link|img|source|audio|video)\b[^>]*?\s(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi,(all,prefix,q,value)=>{
  let url;try{url=new URL(value.replace(/&amp;/g,'&'),base).href}catch{return all}
  if(!Object.prototype.hasOwnProperty.call(map,url))return all;
  const local=map[url];if(typeof local!=='string'||!local.startsWith('./')||/[?#]/.test(local))return all;
  const target=path.resolve(root,local),relative=path.relative(root,target);
  if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(target)||!fs.statSync(target).isFile()||fs.realpathSync(target)!==target)return all;
  return prefix+q+local+q;
 });
};
