const path=require('node:path'),crypto=require('node:crypto');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,16);
function resourcePath(value,base,script=false,type=''){
 const u=new URL(value),b=new URL(base);let p;
 for(const url of [u,b])if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error('Invalid resource URL');
 if(u.origin===b.origin&&u.pathname.startsWith(b.pathname))p=decodeURIComponent(u.pathname.slice(b.pathname.length))||'index.html';
 else p='_remote/'+digest(u.origin+u.pathname+u.search)+'/'+decodeURIComponent(u.pathname.split('/').pop()||'resource');
 if(p.split('/').some(s=>!s||s==='.'||s==='..'||/[\\:\x00-\x1f<>"|?*]/.test(s)))throw Error('Unsafe captured resource path');
 if(script&&!p.endsWith('.js'))p+='.js';
 if(type==='stylesheet'&&!p.endsWith('.css'))p+='.css';
 return p;
}
module.exports={resourcePath};
