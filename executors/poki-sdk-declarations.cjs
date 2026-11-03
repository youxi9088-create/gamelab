const pattern=/^https:\/\/game-cdn\.poki\.com\/scripts\/(?:[^/?#]+\/poki-sdk\.js|[a-f0-9]+\/poki-sdk-core-[a-f0-9]+\.js)$/;
const isSDK=url=>pattern.test(url);
function declarations(html,base){
 const result=[];
 for(const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)){
  try{const url=new URL(m[1],base).href;if(isSDK(url))result.push({literal:m[1],url})}catch{}
 }
 return result;
}
module.exports=declarations;module.exports.isSDK=isSDK;
