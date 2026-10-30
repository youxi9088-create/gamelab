// Literal public asset references are evidence, not permission to mirror APIs.
const EXT=/\.(?:json|glb|gltf|bin|wasm|data|bundle|unityweb|png|jpe?g|webp|ktx2?|basis|mp3|ogg|wav|woff2?|ttf)(?:\.(?:br|gz))?$/i;
function references(text,base){
 const found=new Set();
 for(const m of text.matchAll(/["'`]((?:https?:\/\/|\.\.?\/|\/)[^"'`\s<>]+)["'`]/g)){
  if(m[1].includes('${'))continue;
  try{const u=new URL(m[1],base);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.hash||!EXT.test(u.pathname))continue;found.add(u.href);}catch{}
 }
 return found;
}
function permits(request,declared){
 return request.method()==='GET'&&['fetch','xhr'].includes(request.resourceType())&&declared.has(request.url());
}
module.exports={references,permits};
