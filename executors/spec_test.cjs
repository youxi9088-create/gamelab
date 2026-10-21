/* Isolated, bounded browser tests. No arbitrary JavaScript supplied by a spec. */
const fs=require('fs'),path=require('path');
const {chromium}=require('./node_modules/playwright');
async function run(input,out) {
  if(!Array.isArray(input.spec?.cases)||!input.spec.cases.length||input.spec.cases.length>50||
    input.spec.cases.some(c=>!/^[a-zA-Z0-9_-]{1,64}$/.test(c.id)||!Array.isArray(c.steps)||c.steps.length>40))
    throw Error('Invalid or unbounded test cases');
  const origin=new URL(input.url);
  if(!['localhost','127.0.0.1','[::1]'].includes(origin.hostname)||origin.protocol!=='http:')
    throw Error('Specification tests require an isolated loopback runtime');
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch(require('./browser-options.cjs')());
  const report={spec_digest:input.spec.digest,started_at:new Date().toISOString(),cases:[],runtime_errors:[],
    coverage:'Specified browser assertions only; not complete fidelity or human acceptance',submission_sent:false};
  try {
    for(const item of input.spec.cases) {
      if(item.mode!=='browser') {
        report.cases.push({id:item.id,status:item.mode==='manual'?'manual_required':'blocked',reason:item.reason||item.expected,evidence:[]});
        continue;
      }
      if(!item.steps.some(s=>String(s.type).startsWith('expect_')))throw Error('A browser case requires an assertion');
      const context=await browser.newContext({viewport:input.viewport||{width:750,height:1000},acceptDownloads:false});
      const errors=[],requests=[];
      await context.route('**/*',route=>{
        const target=new URL(route.request().url());
        if(target.origin===origin.origin)return route.continue();
        errors.push('External request blocked: '+target.origin+target.pathname);
        return route.abort();
      });
      await context.routeWebSocket('**/*',ws=>{
        const u=new URL(ws.url());
        if(u.host===origin.host){ws.connectToServer();return;}
        errors.push('External WebSocket blocked');ws.close();
      });
      const page=await context.newPage();
      const observations=require('./runtime-observer.cjs').observer(page,true);
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push('HTTP '+r.status()+' '+new URL(r.url()).pathname);requests.push({path:new URL(r.url()).pathname,status:r.status()});});
      const result={id:item.id,status:'failed',evidence:[],steps:[]};
      try {
        await page.goto(input.url,{waitUntil:'domcontentloaded',timeout:20000});
        for(const step of item.steps) {
          const locator=()=>page.locator(String(step.selector)).first();
          switch(step.type) {
            case 'observe':result.steps.push(await observations.capture(step.capture_storage));break;
            case 'until':result.steps.push(await observations.until(step));break;
            case 'expect_storage_relative':result.steps.push(await observations.expect(step));break;
            case 'click':await locator().click({timeout:5000,...(Number.isFinite(step.x)&&Number.isFinite(step.y)?{position:{x:step.x,y:step.y}}:{})});break;
            case 'key':await page.keyboard.press(String(step.key));break;
            case 'wait':await page.waitForTimeout(Math.min(15000,Math.max(0,Number(step.ms)||0)));break;
            case 'reload':await page.reload({waitUntil:'domcontentloaded',timeout:20000});break;
            case 'expect_storage':{
              const keys=String(step.path||'').split('.');
              if(typeof step.key!=='string'||!step.key||keys.some(k=>!k||['__proto__','constructor','prototype'].includes(k))||
                 !['string','number','boolean'].includes(typeof step.value))throw Error('Invalid storage assertion');
              await page.waitForFunction(({key,keys,value})=>{
                try{let actual=JSON.parse(localStorage.getItem(key));for(const part of keys){
                  if(actual===null||typeof actual!=='object'||!Object.prototype.hasOwnProperty.call(actual,part))return false;
                  actual=actual[part];
                }return actual===value;}catch{return false;}
              },{key:step.key,keys,value:step.value},{timeout:15000});
              break;
            }
            case 'expect_visible':await locator().waitFor({state:'visible',timeout:5000});break;
            case 'expect_text':if(!(await locator().innerText({timeout:5000})).includes(String(step.value)))throw Error('Text expectation failed');break;
            case 'expect_scene':await page.waitForFunction(name=>globalThis.cc?.director?.getScene()?.name===name,step.value,{timeout:10000});break;
            case 'expect_no_errors':if(errors.length)throw Error('Runtime errors: '+errors.join('; ').slice(0,1000));break;
            default:throw Error('Unsupported specification step: '+step.type);
          }
          result.steps.push({type:step.type,status:'passed'});
        }
        if(errors.length)throw Error('Runtime errors remain');
        result.status='passed';
      }catch(e){result.reason=e.message.slice(0,2000);}
      finally {
        const name=item.id+'.png';
        try{await page.screenshot({path:path.join(out,name)});result.evidence.push(name);}catch{}
        result.runtime_errors=errors;
        result.requests=requests;
        report.runtime_errors.push(...errors);
        report.cases.push(result);
        await context.close();
      }
    }
  }finally{
    await browser.close();
    report.finished_at=new Date().toISOString();
    report.passed=report.cases.length>0&&report.cases.every(c=>c.status==='passed')&&!report.runtime_errors.length;
    fs.writeFileSync(path.join(out,'spec-tests.json'),JSON.stringify(report,null,2));
  }
  return report;
}
if(require.main===module)run(JSON.parse(fs.readFileSync(process.argv[2],'utf8')),process.argv[3])
  .then(r=>{console.log(JSON.stringify({passed:r.passed,cases:r.cases.map(c=>({id:c.id,status:c.status}))}));process.exitCode=r.passed?0:2;})
  .catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={run};
