// Static AST-guided source edits only. Never evaluate the native game or its SDK.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b=path.resolve('deployment-packages/msn-capture-100'),dir=path.join(b,'source-analysis/carrom'),s=fs.readFileSync(path.join(b,'msn-en-us/originals/9n3jkw7wdc16/assets/main/index.js'),'utf8'),a=P.parse(s),edits=[],modules=[];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex'),add=(n,replacement,reason)=>edits.push({start:n.start,end:n.end,replacement,reason});
const text=n=>s.slice(n.start,n.end),covered=n=>edits.some(e=>n.start>=e.start&&n.end<=e.end);
T(a,{CallExpression(p){const n=p.node;if(n.callee.type==='MemberExpression'&&n.callee.object.name==='System'&&n.callee.property.name==='register'&&n.arguments[0]?.type==='StringLiteral')modules.push({name:n.arguments[0].value.split('/').at(-1),node:n,path:p});}});
const owner=n=>modules.find(m=>n.start>=m.node.start&&n.end<=m.node.end)?.name;
function removeExpression(p,reason){
 const n=p.node,par=p.parentPath;
 if(par.isSequenceExpression()){
  const xs=par.node.expressions,i=xs.indexOf(n);if(xs.length===1)return removeExpression(par,reason);
  add({start:i?xs[i-1].end:n.start,end:i?n.end:xs[i+1].start},'',reason);return;
 }
 if(par.isExpressionStatement()){add(par.node,'',reason);return;}
 throw Error('Unreviewed removal parent '+par.type+' '+text(n).slice(0,90));
}
function removeArrayElement(array,index,reason){const xs=array.elements,n=xs[index];if(xs.length===1)add(n,'',reason);else add({start:index?xs[index-1].end:n.start,end:index?n.end:xs[index+1].start},'',reason);}
for(const m of modules){
 if(m.name==='SDKManager.ts'){add(m.path.parentPath.node,'','Remove actual MSStart advertising/score provider module');continue;}
 const deps=m.node.arguments[1];if(deps?.type!=='ArrayExpression')continue;
 const index=deps.elements.findIndex(x=>x?.value==='./SDKManager.ts');
 if(index>=0){removeArrayElement(deps,index,'Remove actual retired provider dependency');let setters=[];m.path.traverse({ObjectProperty(p){if((p.node.key.name||p.node.key.value)==='setters')setters.push(p.node.value);}});if(setters.length!==1)throw Error('Ambiguous module setters');removeArrayElement(setters[0],index,'Remove matching provider import setter');}
}
const bodyReplacements={
 'MetaUIManager.ts:watchAd':'{this.coinAdIcon.active=false;this.gemAdIcon.active=false;}',
 'MetaUIManager.ts:timer':'{ie.instance.setTimerGameData(30);}',
 'TimerGameOverUI.ts:doubleScore':'{this.doubleScoreButton.active=false;}',
 'TrickshotGameOverUI.ts:watchAd':'{this.watchButton.node.active=false;this.resetTime.node.active=false;}',
 'WatchAdForTimeOverlay.ts:yes':'{this.isPanelOn=false;this.node.active=false;d.instance.setTimerGameData(c);}'
};
const removeMethods=new Set(['MetaUIManager.ts:onADComplete','TimerGameOverUI.ts:onADComplete','TrickshotGameOverUI.ts:onADComplete','WatchAdForTimeOverlay.ts:onADComplete']);
T(a,{AssignmentExpression(p){if(covered(p.node))return;const n=p.node;
 if(n.right.type==='MemberExpression'&&['msnSdk','createSDK'].includes(n.right.property.name)){removeExpression(p,'Remove actual retired provider binding');return;}
 if(n.left.type!=='MemberExpression')return;
 const key=owner(n)+':'+n.left.property.name;
 if(removeMethods.has(key)){removeExpression(p,'Remove actual rewarded-success handler; no replacement reward');return;}
 if(bodyReplacements[key]){
  add(n.right,'function()'+bodyReplacements[key],'Retire advertising UI consumer; timer uses original TIME_DEFAULT=30 from Defines2; no SDK status/reward synthesized');return;
 }
 if(n.left.property.name==='msnSdk'||n.left.property.name==='createSDK')return;
 if(n.right.type==='MemberExpression'&&['msnSdk','createSDK'].includes(n.right.property.name))removeExpression(p,'Remove actual retired provider binding');
}});
T(a,{CallExpression(p){if(covered(p.node))return;const n=p.node;
 if(owner(n)==='Helper.ts'&&n.callee.type==='Identifier'&&['msnSdk','createSDK'].includes(n.arguments[0]?.value)){removeExpression(p,'Remove provider factory/export, without facade');return;}
 if(n.callee.type==='MemberExpression'&&n.callee.property.name==='submitScore'){removeExpression(p,'Retire network scoreboard consumer; original local score/save remains');return;}
 if(n.callee.type==='MemberExpression'&&n.callee.property.name==='showAd'){
  if(text(n.arguments[0])!=='!1')throw Error('Unretired rewarded ad consumer '+owner(n));
  const cb=n.arguments[1];if(cb.type!=='CallExpression'||cb.callee.type!=='MemberExpression'||cb.callee.property.name!=='bind')throw Error('Unexpected nonreward continuation');
  add(n,text(cb.callee.object)+'()','Connect original nonreward local continuation directly; no SDK callback/result substituted');
 }
}});
T(a,{LogicalExpression(p){if(covered(p.node))return;if(owner(p.node)==='Boot.ts'&&text(p.node).startsWith('window.Sdkinit||'))removeExpression(p,'Remove retired advertising initialization');},
 FunctionExpression(p){if(covered(p.node)||p.parentPath.node.type!=='AssignmentExpression')return;const n=p.node,assignment=p.parentPath.node,name=assignment.left.property?.name,m=owner(n);
  if(m==='MetaUIManager.ts'&&name==='onLoad')add({start:n.body.end-1,end:n.body.end-1},';this.coinAdIcon.active=false;this.gemAdIcon.active=false;','Hide actual currency advertising entry nodes');
  if(m==='TrickshotGameOverUI.ts'&&name==='onLoad')add({start:n.body.end-1,end:n.body.end-1},';this.watchButton.node.active=false;this.resetTime.node.active=false;','Hide actual rewarded replay entry; native free daily round/exit retained');
 },
 AssignmentExpression(p){if(covered(p.node))return;const n=p.node,m=owner(n),lhs=text(n.left);
  if(m==='TimerGameOverUI.ts'&&lhs==='this.doubleScoreButton.active'&&text(n.right)==='!0')add(n.right,'false','Retire actual double-score advertising button');
  if(m==='TrickshotGameOverUI.ts'&&lhs==='this.watchButton.enabled'&&text(n.right)==='!0')add(n.right,'false','Do not re-enable retired rewarded replay');
 }
});
edits.sort((x,y)=>x.start-y.start||y.end-x.end);const selected=[];
for(const e of edits){if(selected.some(x=>e.start>=x.start&&e.end<=x.end))continue;if(selected.at(-1)?.end>e.start)throw Error('Overlapping independent source edits');selected.push(e);}
let out=s;for(const e of [...selected].reverse())out=out.slice(0,e.start)+e.replacement+out.slice(e.end);P.parse(out);
const leftovers=[...out.matchAll(/\$msstart|\.showAd\(|\.submitScore\(|\.msnSdk|createSDK|window\.Sdkinit/g)].map(m=>({offset:m.index,context:out.slice(m.index-80,m.index+120)}));
if(leftovers.length){fs.writeFileSync(path.join(dir,'retirement-leftovers.json'),JSON.stringify(leftovers,null,2));throw Error('Retirement unresolved '+leftovers.length);}
const preserved=[];T(a,{Function(p){if(!selected.some(e=>p.node.start<e.end&&p.node.end>e.start))preserved.push(text(p.node));}});if(!preserved.every(f=>out.includes(f)))throw Error('Unrelated native function changed');
fs.writeFileSync(path.join(dir,'service-retired-main-v1.js'),out);
fs.writeFileSync(path.join(dir,'service-retirement-proof-v1.json'),JSON.stringify({source_only:true,game_executed:false,original_sha256:hash(s),derived_sha256:hash(out),edits:selected.map(e=>({...e,original_sha256:hash(s.slice(e.start,e.end))})),unrelated_function_bodies_exact:preserved.length,no_SDK_facade:true,no_auth_reward_or_network_success_synthesis:true,original_physics_AI_rules_inventory_saves_and_all_challenges_retained:true,leftovers},null,2));
console.log(JSON.stringify({edits:selected.length,preserved_native_functions:preserved.length,original_bytes:Buffer.byteLength(s),derived_bytes:Buffer.byteLength(out)}));
