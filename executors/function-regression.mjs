// Component regressions use extracted original functions in an isolated browser fixture.
// They never inject values into the running game and never count as gameplay traces.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const dep=createRequire(fs.realpathSync(new URL('./node_modules/rea-agents/package.json',import.meta.url)));
const {parse}=await import(pathToFileURL(dep.resolve('@babel/parser')));
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const name=n=>typeof n==='string'&&/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n)&&!['__proto__','constructor','prototype','lib'].includes(n);
function extract(code,names){
 const found={};
 function visit(n){if(!n||typeof n!=='object')return;if(n.type==='FunctionDeclaration'&&names.includes(n.id?.name)){if(found[n.id.name])throw Error('Ambiguous function');found[n.id.name]=code.slice(n.start,n.end);}for(const [k,v] of Object.entries(n)){if(k==='loc')continue;if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}}
 visit(parse(code,{sourceType:'unambiguous'}));
 return names.map(n=>{if(!found[n])throw Error('Function not found: '+n);return found[n];}).join('\n');
}
const report={scope:'Extracted-function regressions with synthetic component inputs and mock persistence; NOT actual gameplay or original server verification.',cases:[],passed:false};
const browser=await chromium.launch(require('./browser-options.cjs')());
try{
 if(!Array.isArray(input.cases)||!input.cases.length||input.cases.length>4)throw Error('Require 1-4 component cases');
 for(const c of input.cases){
  if(!Array.isArray(c.functions)||!c.functions.length||c.functions.length>8||!c.functions.every(name)||!c.functions.includes(c.invoke)||!c.initial_state||Object.keys(c.initial_state).length>100||!Object.keys(c.initial_state).every(name)||!Array.isArray(c.expected_saves)||c.expected_saves.length>10)throw Error('Invalid component case');
  const result={name:c.name,simulated_state:true,variants:{}};
  for(const variant of ['original','current']){
   const source=input[variant][c.script_path];if(typeof source!=='string')throw Error('Missing component source');
   const functions=extract(source,c.functions);
   const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:false});await context.route('**/*',r=>r.abort());
   const page=await context.newPage();await page.goto('about:blank');
   let timer;
   try{
    const saved=await Promise.race([page.evaluate(async ({functions,initial,invoke})=>{
      const saved=[];const lib={saveUserGameState:async value=>{saved.push(JSON.parse(JSON.stringify(value)));return {saved:true};}};
      const keys=Object.keys(initial);
      const run=new Function(...keys,'lib',functions+'\nreturn (async()=>{'+invoke+'();await new Promise(resolve=>setTimeout(resolve,100));})();');
      await run(...keys.map(k=>initial[k]),lib);return saved;
    },{functions,initial:c.initial_state,invoke:c.invoke}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Component execution timed out')),5000);})]);
    const passed=saved.length===c.expected_saves.length&&saved.every((value,i)=>Object.entries(c.expected_saves[i]).every(([k,v])=>JSON.stringify(value[k])===JSON.stringify(v)));
    result.variants[variant]={passed,saved};
   }catch(e){result.variants[variant]={passed:false,error:e.message};}
   finally{clearTimeout(timer);await context.close();}
  }
  result.passed=result.variants.current.passed&&(c.expect_original_failure===true?!result.variants.original.passed&&!result.variants.original.error&&Array.isArray(result.variants.original.saved):true);
  report.cases.push(result);
 }
 report.passed=report.cases.every(c=>c.passed);
}catch(e){report.error=e.message;}finally{await browser.close();fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2));}
process.exitCode=report.passed?0:2;
