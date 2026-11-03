'use strict';
// Operator-collected public bytes, scoped to one exact captured entry and URL.
// The cache supplies bytes only; the normal verifier still decides success.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {cachedResponse}=require('./capture-cache.cjs');
const key=(entry,url)=>crypto.createHash('sha256').update(entry+'\n'+url).digest('hex');
function recoveredResource(entry,url,root=path.resolve(__dirname,'../.cache/recovered-public-resources')){
 const id=key(entry,url),manifest=path.join(root,id+'.json');
 if(!fs.existsSync(manifest))return null;
 if(fs.lstatSync(root).isSymbolicLink()||fs.lstatSync(manifest).isSymbolicLink())throw Error('Linked recovery cache is not allowed');
 const record=JSON.parse(fs.readFileSync(manifest,'utf8'));
 if(record.entry!==entry||record.url!==url||record.path!==id+'.bin'||record.bytes>20*1024*1024)throw Error('Recovery cache binding mismatch');
 const response=cachedResponse(root,record);
 if(!response)throw Error('Recovery cache digest mismatch');
 return response;
}
module.exports={recoveredResource,key};
