// Source-only, bounded edits. No game, SDK, business handler or author code evaluated.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b=path.resolve('deployment-packages/msn-capture-100'),dir=path.join(b,'source-analysis/dragrace');
const s=fs.readFileSync(path.join(b,'msn-en-us/originals/9nkxlf5z9lkd/js/game.js'),'utf8'),a=P.parse(s),edits=[];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const cls=new Set(['AdHelper','InlRewardAds','InlUtilities','InlAdsense','InlEvents']);
const provider=n=>/^(adinplay_|ms(?:Load|Show|Hide|Pause|Resume)|onRewardedAd)/.test(n||'');
const add=(n,reason,replacement='')=>edits.push({start:n.start,end:n.end,reason,replacement});
T(a,{ClassDeclaration(p){if(cls.has(p.node.id.name))add(p.node,'Retire actual ad/telemetry provider class');},FunctionDeclaration(p){if(provider(p.node.id.name))add(p.node,'Retire actual provider and rewarded-money callback');}});
T(a,{ObjectProperty(p){const n=p.node;if((n.key.name||n.key.value)==='_OnStart'&&n.value.type==='FunctionExpression'&&s.slice(n.value.body.start,n.value.body.end).includes('adinplay_playVideoAd')){const old=s.slice(n.value.body.start,n.value.body.end);if(!old.includes('adinplay_onAdStarted=function(){this.__OnStart()}.bind(this)'))throw Error('Unknown native continuation');add(n.value.body,'Connect original local start directly after retiring its ad wrapper','{this.__OnStart()}');}},CallExpression(p){const n=p.node;if(s.slice(n.start,n.end)==='this.scene.add.image(0,190,"map","key_up.png")')add(n.arguments[2],'Use actual original key_up atlas pak, not missing map frame','"pak"');}});
const covered=n=>edits.some(e=>n.start>=e.start&&n.end<=e.end);
function service(n){
 if(!n||typeof n!=='object')return false;
 if(['FunctionExpression','ArrowFunctionExpression','FunctionDeclaration'].includes(n.type))return false;
 if(n.type==='Identifier'&&provider(n.name))return true;
 if(n.type==='MemberExpression'){
  const text=s.slice(n.start,n.end);
  if(/^inlHelper\.(ads|rewardAds|adsense|eventsManager|utilities)(?:\.|$)/.test(text)||/\.(?:cntResultAdButton|imgResultAd\w*|txtResultAd\w*)\b/.test(text))return true;
 }
 return Object.entries(n).some(([k,v])=>!['loc','start','end','extra'].includes(k)&&(Array.isArray(v)?v.some(service):service(v)));
}
function removeExpr(p,reason){
 const n=p.node,parent=p.parentPath;
 if(parent.isSequenceExpression()){
  const xs=parent.node.expressions,i=xs.indexOf(n);
  if(xs.length===1)return removeExpr(parent,reason);
  add({start:i?xs[i-1].end:n.start,end:i?n.end:xs[i+1].start},reason);return;
 }
 if(parent.isExpressionStatement()){add(parent.node,reason);return;}
 throw Error('Unreviewed expression parent '+parent.type+' '+s.slice(n.start,n.end).slice(0,180));
}
T(a,{
 ExpressionStatement(p){
  if(covered(p.node))return;
  const e=p.get('expression');
  if(e.isSequenceExpression()){
   for(const item of e.get('expressions'))if(service(item.node))removeExpr(item,'Retire actual service/UI expression within sequence');
  }else if(service(e.node))add(p.node,'Retire actual service consumer or advertising UI expression');
 },
 AssignmentExpression(p){
  if(covered(p.node))return;
  const n=p.node,left=s.slice(n.left.start,n.left.end);
  if(left==='inlHelper'&&n.right.type==='ObjectExpression'){
   const props=n.right.properties.filter(x=>['VERSION','game'].includes(x.key.name||x.key.value));
   add(n.right,'Keep genuine local game helper; remove provider slots','{'+props.map(x=>s.slice(x.start,x.end)).join(',')+'}');
  }
  if(left==='REWARDED_ADS_ENABLED'&&n.right.type==='UnaryExpression'&&n.right.operator==='!'&&n.right.argument.value===0)removeExpr(p,'Remove downstream re-enable of rewarded-ad UI; original false remains');
 },
 LogicalExpression(p){if(!covered(p.node)&&s.slice(p.node.start,p.node.end).includes('navigator.serviceWorker.register'))removeExpr(p,'Retire original remote-capable service worker registration');}
});
// The only remaining ad config assignments are platform setup. No callback is substituted.
T(a,{ExpressionStatement(p){if(covered(p.node))return;const e=p.node.expression;if(e.type==='AssignmentExpression'&&/^(adsConfig|adsenseConfig|eventsConfig|rewAdsConfig)\./.test(s.slice(e.left.start,e.left.end)))add(p.node,'Remove platform setup assignment');}});
edits.sort((x,y)=>x.start-y.start||y.end-x.end);
const selected=[];for(const e of edits){if(selected.some(x=>e.start>=x.start&&e.end<=x.end))continue;const last=selected.at(-1);if(last&&last.end>e.start)throw Error('Overlapping independent edits');selected.push(e);}
let out=s;for(const e of [...selected].reverse())out=out.slice(0,e.start)+e.replacement+out.slice(e.end);
P.parse(out);
const leftovers=[...out.matchAll(/\$msstart|adsbygoogle|googletagmanager|aiptag|inlHelper\.(?:ads|rewardAds|adsense|eventsManager|utilities)|onRewardedAd|msLoadAd|msShowRewardedAd|navigator\.serviceWorker/g)].map(x=>({at:x.index,text:out.slice(Math.max(0,x.index-70),x.index+150)}));
if(leftovers.length){fs.writeFileSync(path.join(dir,'retirement-review-leftovers.json'),JSON.stringify(leftovers,null,2));throw Error('Unretired source references: '+leftovers.length);}
const functions=[];T(a,{Function(p){if(!selected.some(e=>p.node.start<e.end&&p.node.end>e.start))functions.push(s.slice(p.node.start,p.node.end));}});
if(!functions.every(f=>out.includes(f)))throw Error('Untouched native function differs');
if(out.slice(0,1060340)!==s.slice(0,1060340))throw Error('Phaser engine prefix changed');
fs.writeFileSync(path.join(dir,'service-retired-game-v2.js'),out);
fs.writeFileSync(path.join(dir,'service-retirement-proof-v2.json'),JSON.stringify({source_only:true,native_executed:false,original_sha256:hash(s),derived_sha256:hash(out),removed_provider_classes:[...cls],edits:selected.map(x=>({...x,original_sha256:hash(s.slice(x.start,x.end))})),untouched_function_bodies_exact:functions.length,Phaser_engine_prefix_bytes_exact:1060340,no_SDK_facade:true,no_auth_or_reward_success_synthesis:true,original_native_car_parameters_levels_and_local_save_not_rewritten:true,network_provider_reference_leftovers:leftovers},null,2));
console.log(JSON.stringify({edits:selected.length,unchanged_native_functions:functions.length,source_bytes:s.length,derived_bytes:out.length}));
