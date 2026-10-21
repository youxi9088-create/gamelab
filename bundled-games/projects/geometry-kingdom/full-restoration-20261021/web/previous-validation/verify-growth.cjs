const fs=require('fs');const assert=require('node:assert/strict');
const {chromium}=require('../executors/node_modules/playwright');
const out='F:/youxi/door/game-library/projects/geometry-kingdom/campaign-20261021/evidence';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const report={errors:[],cases:[]};try{
const context=await b.newContext({viewport:{width:750,height:1334}});
await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:5768/')?r.continue():r.abort());
const p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));
const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('geometry-local-campaign-v1')));
const shot=async name=>p.screenshot({path:out+'/'+name+'.png'});
const clickNode=async name=>{const pos=await p.evaluate(name=>{let result;function visit(n){if(!n.activeInHierarchy)return;if(n.name===name){const q=n.convertToWorldSpaceAR(cc.v2(0,0));result={x:q.x,y:1334-q.y};}n.children.forEach(visit);}visit(cc.director.getScene());return result;},name);assert.ok(pos,'visible '+name);await p.mouse.click(pos.x,pos.y);};
await p.goto('http://127.0.0.1:5768');await p.waitForFunction(()=>window.cc?.director.getScene()?.name==='MainScene',null,{timeout:45000});await p.waitForTimeout(3500);
await shot('map');
for(let stage=1;stage<=5;stage++){
await p.mouse.click(682,680);await p.waitForTimeout(2500);
await p.mouse.click(375,1260);
await p.waitForFunction(()=>JSON.parse(localStorage.getItem('geometry-local-campaign-v1'))?.localBattle?.settled,null,{timeout:60000});
let s=await state();assert.equal(s.localBattle.result.win,true);assert.equal(s.barrierInfo.barrierId,stage);
await p.waitForTimeout(1500);await shot('victory-'+stage);
await p.mouse.click(375,1134);await p.waitForTimeout(1500);
if(stage===1){
await clickNode('BtnHero');await p.waitForTimeout(2000);await shot('before-upgrade');
await p.mouse.click(375,820);await p.waitForTimeout(2500);s=await state();assert.equal(s.resource.gold,0);assert.equal(s.heroInfo.heroes.find(h=>h.uuid===401).l,2);await shot('after-upgrade');
await p.mouse.click(375,820);await p.waitForTimeout(700);assert.equal((await state()).heroInfo.heroes.find(h=>h.uuid===401).l,2);
await p.reload();await p.waitForFunction(()=>window.cc?.director.getScene()?.name==='MainScene',null,{timeout:45000});await p.waitForTimeout(2500);assert.equal((await state()).heroInfo.heroes.find(h=>h.uuid===401).l,2);
report.cases.push('original upgrade click, gold debit, insufficient balance, persisted reload');
}
await p.mouse.click(682,680);await p.waitForTimeout(2500);
report.cases.push('stage '+stage);console.log('passed stage',stage);
}
assert.equal((await state()).barrierInfo.full,true);assert.equal((await state()).resource.gold,400);assert.deepEqual(report.errors,[]);report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;process.exitCode=1;}finally{fs.writeFileSync(out+'/growth-report.json',JSON.stringify(report,null,2));await b.close();}console.log(report);})();
