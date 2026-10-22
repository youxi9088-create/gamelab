const assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const {storageEvidence}=require('../executors/storage-evidence.cjs');
function store(entries){return {length:entries.length,key:i=>entries[i][0],getItem:key=>entries.find(e=>e[0]===key)[1]};}
function page(window){return {evaluate:fn=>vm.runInNewContext('('+fn.toString()+')()',{window,crypto:crypto.webcrypto,TextEncoder,location:{origin:'http://127.0.0.1:1234'}})};}
(async()=>{
 const empty=store([]),testPage=page({localStorage:store([['save','private-progress']]),sessionStorage:empty});
 const normal=await storageEvidence(testPage);
 assert.equal(normal.areas.localStorage.complete,true);
 assert.equal(normal.areas.localStorage.entries[0].sha256,crypto.createHash('sha256').update('private-progress').digest('hex'));
 assert.equal(JSON.stringify(normal).includes('private-progress'),false);
 const denied={sessionStorage:empty};Object.defineProperty(denied,'localStorage',{get(){const e=Error();e.name='SecurityError';throw e;}});
 const unavailable=await storageEvidence(page(denied));
 assert.equal(unavailable.areas.localStorage.available,false);assert.equal(unavailable.areas.localStorage.error,'SecurityError');
 const many=await storageEvidence(page({localStorage:store(Array.from({length:101},(_,i)=>['key'+i,'x'])),sessionStorage:empty}));
 assert.equal(many.areas.localStorage.entries.length,100);assert.equal(many.areas.localStorage.complete,false);
 const large=await storageEvidence(page({localStorage:store([['save','x'.repeat(4_000_001)]]),sessionStorage:empty}));
 assert.equal(large.areas.localStorage.limit_reached,true);assert.equal(large.areas.localStorage.complete,false);
 const closed=await storageEvidence({evaluate:()=>{throw Error('closed');}});assert.equal(closed.available,false);
 console.log('storage evidence: 5 isolated cases passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
