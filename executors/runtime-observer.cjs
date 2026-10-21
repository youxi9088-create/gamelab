// Read-only state observations and bounded feedback-driven input. Never writes game state.
const assert=require('node:assert/strict');
function observer(page,localRuntime=true){
 const snapshots=new Map();
 async function read(spec){
  if(!localRuntime||!spec||typeof spec.key!=='string'||!Array.isArray(spec.path||[]))throw Error('Invalid storage observation');
  const value=await page.evaluate(({key,segments})=>{
   let value=localStorage.getItem(key);
   if(value===null)return {found:false};
   if(segments.length){value=JSON.parse(value);for(const p of segments){if(value===null||typeof value!=='object'||!Object.hasOwn(value,p))return {found:false};value=value[p];}}
   return {found:true,value};
  },{key:spec.key,segments:spec.path||[]});
  if(!value.found){if(Object.hasOwn(spec,'default'))return spec.default;throw Error('Observed storage field is absent');}
  return value.value;
 }
 async function capture(spec){
  if(!spec||!(/^[A-Za-z][A-Za-z0-9_-]{0,63}$/).test(spec.as)||snapshots.has(spec.as))throw Error('Snapshot name must be unique');
  const value=await read(spec);snapshots.set(spec.as,value);return {kind:'storage_snapshot',name:spec.as,key:spec.key,path:spec.path||[],value};
 }
 async function expect(spec){
  let expected=spec.equals;
  if(Object.hasOwn(spec,'from')){
   if(!snapshots.has(spec.from))throw Error('Unknown storage snapshot');expected=snapshots.get(spec.from);
   if(Object.hasOwn(spec,'delta')){if(typeof expected!=='number'||!Number.isFinite(spec.delta))throw Error('Delta requires numeric values');expected+=spec.delta;}
  }else if(!Object.hasOwn(spec,'equals'))throw Error('Storage expectation requires equals or from');
  const actual=await read(spec),op=spec.op||'eq';
  if(op==='eq')assert.deepEqual(actual,expected,'Storage expectation failed');
  else{
   if(!['gt','gte','lt','lte'].includes(op)||typeof actual!=='number'||typeof expected!=='number'||!Number.isFinite(actual)||!Number.isFinite(expected))throw Error('Ordered comparison requires finite numbers');
   assert.ok(({gt:actual>expected,gte:actual>=expected,lt:actual<expected,lte:actual<=expected})[op],'Storage expectation failed');
  }
  return {kind:'storage',key:spec.key,path:spec.path||[],actual,expected,op,from:spec.from,passed:true};
 }
 async function condition(spec){
  if(spec.storage){try{await expect(spec.storage);return true;}catch(e){if(e.code==='ERR_ASSERTION'||e.message==='Observed storage field is absent')return false;throw e;}}
  if(typeof spec.selector!=='string')throw Error('Condition requires selector or storage');
  const node=page.locator(spec.selector).first();
  if(!await node.count())return false;
  if(spec.text!==undefined&&!(await node.innerText()).includes(String(spec.text)))return false;
  if(spec.style){for(const [property,value] of Object.entries(spec.style))if(await node.evaluate((el,p)=>getComputedStyle(el).getPropertyValue(p).trim(),property)!==value)return false;}
  return await node.isVisible();
 }
 async function until(action){
  if(!Number.isFinite(action.max_ms)||action.max_ms<1||action.max_ms>60000||!Array.isArray(action.steps)||action.steps.length>8||!action.condition)throw Error('Until requires condition, <=8 input steps and 1-60000 ms');
  const started=Date.now();let iterations=0,passed=false;const inputs=[];
  while(Date.now()-started<action.max_ms&&iterations<100){
   if(await condition(action.condition)){passed=true;break;}
   for(const step of action.steps){
    const remaining=action.max_ms-(Date.now()-started);if(remaining<=0)break;
    if(await condition(action.condition)){passed=true;break;}
    if(step.type==='hold'){
     if(typeof step.key!=='string'||!Number.isFinite(step.ms)||step.ms<1||step.ms>1000)throw Error('Until hold limited to 1-1000 ms');
     await page.keyboard.down(step.key);try{await page.waitForTimeout(Math.min(step.ms,remaining));}finally{await page.keyboard.up(step.key);}
    }else if(step.type==='move'){
     if(!Number.isFinite(step.x)||!Number.isFinite(step.y))throw Error('Invalid move');await page.mouse.move(step.x,step.y);
    }else if(step.type==='click')await page.locator(String(step.selector)).first().click({timeout:Math.min(1000,remaining)});
    else if(step.type==='wait')await page.waitForTimeout(Math.min(1000,Math.max(1,Number(step.ms)||100),remaining));
    else throw Error('Unsupported until input');
    inputs.push({...step});
   }
   iterations++;if(passed)break;
   await page.waitForTimeout(Math.min(100,Math.max(0,action.max_ms-(Date.now()-started))));
  }
  passed=passed||await condition(action.condition);
  const result={kind:'until',passed,iterations,elapsed_ms:Date.now()-started,condition:action.condition,inputs};
  if(!passed){const error=Error('Until condition not observed within bound');error.observation=result;throw error;}
  return result;
 }
 return {capture,expect,until};
}
module.exports={observer};
