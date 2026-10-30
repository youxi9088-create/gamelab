const test=require('node:test'),assert=require('node:assert/strict'),{transfer}=require('../executors/resource-retry.cjs');
test('transient GET retries are bounded and POST is never replayed',async()=>{
 let n=0;assert.equal(await transfer(async()=>{if(++n<3)throw Error('ECONNRESET');return 42},{wait:async()=>{}}),42);
 n=0;await assert.rejects(()=>transfer(async()=>{n++;throw Error('ECONNRESET')},{wait:async()=>{}}));assert.equal(n,3);
 n=0;await assert.rejects(()=>transfer(async()=>{n++;throw Error('ECONNRESET')},{method:'POST',wait:async()=>{}}));assert.equal(n,1);
 n=0;await assert.rejects(()=>transfer(async()=>{n++;throw Error('Forbidden')},{wait:async()=>{}}));assert.equal(n,1);
});
