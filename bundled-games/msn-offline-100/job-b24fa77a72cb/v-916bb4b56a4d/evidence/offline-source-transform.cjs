// Parse and transform source only. Never execute native game or SDK here.
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),tr=lib('@babel/traverse').default,T=lib('@babel/types');
const b='deployment-packages/msn-capture-100',s=fs.readFileSync(b+'/msn-en-us/originals/9nz2qk71khpd/game.js','utf8'),a=P.parse(s),ed=[],mods=[];
const prop=n=>n?.property?.name??n?.property?.value,key=n=>n?.key?.name??n?.key?.value,sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function mod(n){if(!T.isCallExpression(n)||!T.isMemberExpression(n.callee))return null;return prop(n.callee)==='module'?n.arguments[0]?.value:mod(n.callee.object);}
tr(a,{CallExpression(p){if(prop(p.node.callee)==='defines'){const name=mod(p.node.callee.object);if(name)mods.push({name,node:p.node,body:p.node.arguments[0]});}}});
const ctx=n=>mods.find(m=>m.body.start<=n.start&&n.end<=m.body.end)?.name;
function edit(n,text,reason){if(ed.some(e=>e.start<=n.start&&n.end<=e.end))return;for(let i=ed.length-1;i>=0;i--)if(n.start<=ed[i].start&&ed[i].end<=n.end)ed.splice(i,1);assert(!ed.some(e=>n.start<e.end&&e.start<n.end),'Overlapping edits '+reason);ed.push({start:n.start,end:n.end,text,reason,module:ctx(n)});}
function removeProp(p,reason){const ns=p.parent.properties,i=ns.indexOf(p.node);assert(i>=0);edit({start:i===ns.length-1&&i>0?ns[i-1].end:p.node.start,end:i<ns.length-1?ns[i+1].start:p.node.end},'',reason);}
const retired=new Set(['plugins.microsoft','plugins.handlers.api-handler','game.entities.controllers.ads-controller','game.entities.buttons.button-share','game.entities.buttons.button-more-games','game.entities.buttons.button-field-prestige','game.entities.buttons.button-profit-boost','game.entities.buttons.button-claim-profit-boost','game.entities.objects.popup-profit-boost']);
retired.add('plugins.clickable-div-layer');
const banned=new Set(['EntityAdsController','EntityButtonShare','EntityButtonMoreGames','EntityButtonFieldPrestige','EntityButtonProfitBoost','EntityButtonClaimProfitBoost','EntityPopupProfitBoost','ClickableDivLayer']);
for(const m of mods)if(retired.has(m.name))edit(m.node,'void 0','Retire actual SDK/ad/share provider or ad-only control');
function isAd(n){return T.isMemberExpression(n)&&prop(n)==='isAd';}
function adField(n){return T.isMemberExpression(n)&&['buttonClaimAd','buttonProfitBoost','buttonShare'].includes(prop(n));}
function service(n){return T.isMemberExpression(n)&&(['microsoft','apiHandler'].includes(prop(n))||(prop(n)==='ads'&&prop(n.object)==='controllers'));}
function outerAssignment(p){while(p.parentPath?.isAssignmentExpression())p=p.parentPath;return p;}
tr(a,{
 CallExpression(p){const n=p.node,c=n.callee,k=prop(c),m=ctx(n);if(retired.has(m)){p.skip();return;}
  if(k==='requires'&&n.arguments.some(x=>retired.has(x.value)))edit(n,s.slice(c.object.start,c.object.end)+'.requires('+n.arguments.filter(x=>!retired.has(x.value)).map(x=>JSON.stringify(x.value)).join(',')+')','Remove retired module dependency');
  if(service(c.object)){edit(n,'void 0','Remove actual service call without reward or success callback');p.skip();return;}
  if(k==='setupMarketJsGameCenter'){edit(n,'void 0','Remove outbound gamecenter startup');p.skip();return;}
  if(['spawnEntity','addEntity'].includes(k)&&banned.has(n.arguments[0]?.name)){const q=outerAssignment(p);edit(q.node,'void 0','Remove ad-only or external control creation');p.skip();return;}
  if(k==='open'&&['window','self'].includes(c.object?.name)){edit(n,'void 0','Remove outbound browser navigation');p.skip();return;}
 },
 AssignmentExpression(p){const n=p.node;if(retired.has(ctx(n))){p.skip();return;}
  if(service(n.left)||adField(n.left)&&T.isCallExpression(n.right)&&prop(n.right.callee)==='spawnEntity'){edit(outerAssignment(p).node,'void 0','Remove real service instance or ad-only button instance');p.skip();return;}
  if(prop(n.left)==='src'&&T.isStringLiteral(n.right)&&/^https?:/.test(n.right.value))throw Error('Unreviewed remote script '+n.right.value);
 },
 NewExpression(p){if(!retired.has(ctx(p.node))&&p.node.callee?.name==='ClickableDivLayer'){const q=outerAssignment(p);edit(q.node,'void 0','Retire outbound clickable branding layer, preserve original logo graphics');p.skip();}},
 ConditionalExpression(p){const n=p.node,m=ctx(n);if(retired.has(m)){p.skip();return;}if(isAd(n.test)){edit(n,s.slice(n.alternate.start,n.alternate.end),'Keep native normal claim/animation/layout branch; remove ad alternative');p.skip();}},
 BinaryExpression(p){if(!retired.has(ctx(p.node))&&p.node.operator==='instanceof'&&banned.has(p.node.right?.name)){edit(p.node,'false','Retired service popup cannot be present; remove obsolete UI exclusion check');p.skip();}},
 LogicalExpression(p){if(retired.has(ctx(p.node))){p.skip();return;}if(isAd(p.node.left)||adField(p.node.left)){edit(p.node,'void 0','Remove ad bubble and retired button field use');p.skip();}},
 ObjectProperty(p){const n=p.node,m=ctx(n),k=key(n);if(retired.has(m)){p.skip();return;}
  if(m==='game.main'&&k==='setupMarketJsGameCenter'){removeProp(p,'Remove outbound gamecenter method');p.skip();return;}
  if(k==='adsToResize'){edit(n.value,'{}','Remove legacy ad layout');p.skip();return;}
  if(k==='Ad'&&!p.getFunctionParent()){removeProp(p,'Remove legacy ad configuration');p.skip();return;}
  if(['MoreGames','MarketJSGameCenter'].includes(k)&&T.isObjectExpression(n.value))tr(n.value,{noScope:true,ObjectProperty(q){if(['Enabled','LinkEnabled'].includes(key(q.node)))edit(q.node.value,'false','Retire outbound service configuration');}});
  if(k==='Link'&&T.isStringLiteral(n.value)&&/^https?:/.test(n.value.value))edit(n.value,'""','Remove outbound link configuration');
  if(k==='LinkEnabled')edit(n.value,'false','Remove branding external navigation permission');
  if(m==='game.entities.objects.popup-claim-base'&&k==='updateButtonPosition'){
   edit(n.value,"function(scale){this.parent(scale);if(this.buttonClaimNormal){var button=this.buttonClaimNormal;button.pos.x=this.pos.x+0.5*this.size.x-0.5*button.size.x*scale;button.pos.y=this.pos.y+this.size.y*scale-button.size.y*scale-40*scale;button.updateScale(scale);}}",'Center surviving native ordinary claim; remove ad sibling layout dereference');p.skip();return;
  }
  if(m==='game.entities.buttons.button-show-field-upgrade'&&k==='onMaxLevel'){
   edit(n.value,"function(){this.isClickable=false;this.currentAnim=this.locked;this.textPosOffset.x=-5;this.textPosOffset.y=10;this.updateText('LEVEL MAX');this.removeBubble();}",'Retire ad-only prestige/reset affordance at native level cap; no prestige grant or level change');p.skip();return;
  }
 },
 VariableDeclaration(p){if(p.node.declarations.every(n=>/^MobileAdInGame/.test(n.id.name||''))){edit(p.node,'','Remove legacy ad implementation');p.skip();}},
 IfStatement(p){if(retired.has(ctx(p.node))){p.skip();return;}if(isAd(p.node.test)||adField(p.node.test)){edit(p.node,p.node.alternate?s.slice(p.node.alternate.start,p.node.alternate.end):'{}','Remove ad-only conditional branch');p.skip();}},
});
// Verified literal allowlist resolves to public CDN hosts, localhost, and an
// about:blank redirect. Retire only this isolated client distribution hook in
// the downloaded standalone copy; no upstream login/access/host is altered.
let hostEdits=0;
tr(a,{VariableDeclaration(p){if(p.node.declarations.map(n=>n.id.name).join(',')==='_0x517dfa,_0x415d7c'){assert(p.node.start===256554&&p.node.end===259878);edit(p.node,'','Retire isolated client distribution-host blank redirect from standalone copy');hostEdits++;p.skip();}},CallExpression(p){if(T.isIdentifier(p.node.callee,{name:'_0x415d7c'})){edit(p.node,'void 0','Remove one-shot caller of retired distribution hook');hostEdits++;}}});
assert(hostEdits===2);
// The original timed unlock completes via FieldController independently of the ad skip.
const unlock=mods.find(m=>m.name==='game.entities.buttons.button-show-field-upgrade');
tr(unlock.body,{noScope:true,ConditionalExpression(p){},AssignmentExpression(p){if(prop(p.node.left)==='currentAnim'&&prop(p.node.right)==='blueAd'&&s.slice(p.node.start-250,p.node.start).includes("'unlocking'"))edit(p.node.right,"this['idle']",'Remove ad icon from native waiting-for-unlock state');},CallExpression(p){if(prop(p.node.callee)==='updateText'&&s.slice(p.node.arguments[0]?.start,p.node.arguments[0]?.end).includes("['Finish']"))edit(p.node.arguments[0],'"WAIT"','Timed unlock remains; no advertising skip action');}});
let result=s;for(const e of [...ed].sort((x,y)=>y.start-x.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);const outAst=P.parse(result);
const residue=[];tr(outAst,{MemberExpression(p){if(service(p.node))residue.push({module:ctx(p.node),code:result.slice(p.node.start,p.node.end)});},ReferencedIdentifier(p){if(banned.has(p.node.name))residue.push({symbol:p.node.name,offset:p.node.start});}});assert(!residue.length,JSON.stringify(residue));
const protectedNames=['game.entities.controllers.idle-controller','game.entities.controllers.field-controller','game.entities.controllers.conveyor-controller','game.entities.controllers.business-controller','game.entities.controllers.livestock-controller','game.entities.objects.shed','game.entities.objects.livestock','game.entities.objects.product','game.entities.objects.truck','game.entities.objects.market','game.entities.objects.warehouse','game.entities.buttons.button-field-upgrade','game.entities.buttons.button-warehouse-upgrade','game.levels.game'];
const protectedModules=protectedNames.map(name=>{const m=mods.find(m=>m.name===name);assert(m,'Missing core '+name);assert(!ed.some(e=>e.start<m.body.end&&m.body.start<e.end),'Core changed '+name);const text=s.slice(m.body.start,m.body.end);assert(result.includes(text));return {module:name,sha256:sha(text),byte_exact:true};});
const dst=b+'/source-analysis/idleegg';fs.writeFileSync(dst+'/game.offline.js',result);fs.writeFileSync(dst+'/native-source-fidelity.json',JSON.stringify({native_id:'9nz2qk71khpd',original_sha256:sha(s),adapted_sha256:sha(result),edits:ed,protected_modules:protectedModules,retired_modules:[...retired],provider_residue:residue,no_native_execution_local:true,no_fake_sdk_identity_or_reward:true,no_state_clock_rng_save_injection:true},null,2));
console.log(JSON.stringify({edits:ed.length,protected_modules:protectedModules.length,bytes:Buffer.byteLength(result)}));
