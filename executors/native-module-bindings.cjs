const fs=require('node:fs'),path=require('node:path');
// Rebind captured scripts in resumed packages as well as newly localized ones.
module.exports=function(html,acq,root){
 const imports={};
 for(const item of acq.files||[]){
  if(!(item.type==='script'||item.script)||!item.url||!item.path)continue;
  const local=(acq.runtime_resource_map||{})[item.url]||'./'+item.path;
  if(typeof local!=='string'||!local.startsWith('./')||/[?#]/.test(local))continue;
  const target=path.resolve(root,local),relative=path.relative(root,target);
  if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(target)||!fs.statSync(target).isFile()||fs.realpathSync(target)!==target)continue;
  imports[item.url]=local;
 }
 if(!Object.keys(imports).length)return html;
 const pattern=/(<script\b[^>]*\btype\s*=\s*["']importmap["'][^>]*>)([\s\S]*?)(<\/script\s*>)/i;
 const existing=pattern.exec(html),map=existing?JSON.parse(existing[2]):{};
 map.imports={...(map.imports||{}),...imports};
 const encoded=JSON.stringify(map).replace(/</g,'\\u003c');
 if(existing)return html.slice(0,existing.index)+existing[1]+encoded+existing[3]+html.slice(existing.index+existing[0].length);
 if(!/<head\b[^>]*>/i.test(html))throw Error('Cannot bind native modules without a document head');
 return html.replace(/<head\b[^>]*>/i,head=>head+'<script type="importmap">'+encoded+'</script>');
};
