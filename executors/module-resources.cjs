// Resolve only literal module references from captured source. No code execution.
const {init,parse}=require('es-module-lexer');
function publicURL(value){
 const u=new URL(value);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(u.hostname))throw Error('Non-public module URL');
 u.hash='';return u.href;
}
function resolveModule(name,base,mappings={}){
 let value=name;
 if(Object.hasOwn(mappings,name))value=mappings[name];
 else {const prefix=Object.keys(mappings).filter(k=>k.endsWith('/')&&name.startsWith(k)).sort((a,b)=>b.length-a.length)[0];
  if(prefix)value=mappings[prefix]+name.slice(prefix.length);
  else if(!/^(https?:|\/|\.\/|\.\.\/)/.test(name))return null;
 }
 return publicURL(new URL(value,base).href);
}
async function references(code,base,mappings={}){
 await init;
 return parse(code)[0].filter(i=>i.n!==undefined).map(i=>({...i,url:resolveModule(i.n,base,mappings)})).filter(i=>i.url);
}
async function entryReferences(html,base){
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)],mappings={},urls=new Set();
 for(const [,attrs,body] of scripts)if(/\btype\s*=\s*["']importmap["']/i.test(attrs)){
  const map=JSON.parse(body);
  if(map.scopes&&Object.keys(map.scopes).length)throw Error('Scoped import maps require a dedicated capture contract');
  for(const [key,value] of Object.entries(map.imports||{})){if(typeof value!=='string')throw Error('Invalid import map target');mappings[key]=publicURL(new URL(value,base).href);}
 }
 for(const [,attrs,body] of scripts){
  const src=attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  if(src)urls.add(publicURL(new URL(src[1],base).href));
  else if(/\btype\s*=\s*["']module["']/i.test(attrs))for(const ref of await references(body,base,mappings))urls.add(ref.url);
 }
 return {mappings,urls};
}
async function rewriteModules(code,base,mappings,local){
 const refs=await references(code,base,mappings);
 for(const ref of refs.sort((a,b)=>b.s-a.s)){const value=local(ref.url);if(!value)continue;
  code=code.slice(0,ref.s)+(ref.d>=0?JSON.stringify(value):value)+code.slice(ref.e);
 }
 return code;
}
async function rewriteInlineModules(html,base,mappings,local){
 const matches=[...html.matchAll(/(<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>)([\s\S]*?)(<\/script\s*>)/gi)];
 for(const m of matches.reverse()){const body=await rewriteModules(m[2],base,mappings,local);html=html.slice(0,m.index)+m[1]+body+m[3]+html.slice(m.index+m[0].length);}
 return html;
}
module.exports={entryReferences,references,rewriteModules,rewriteInlineModules,resolveModule};
