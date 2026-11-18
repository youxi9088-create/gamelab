// Restore source-proven native bodies and retire standalone host/navigation integration.
// Source data only: no game, SDK, DOM or business handler execution.
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,T=lib('@babel/types');
const b='deployment-packages/msn-capture-100',from=b+'/revisions/harbor-offline-v1',dst=b+'/revisions/harbor-offline-v2',sha=s=>crypto.createHash('sha256').update(s).digest('hex');
assert(!fs.existsSync(dst),'Immutable v2 already exists; inspect its proof instead of reapplying');
const original=fs.readFileSync(b+'/msn-en-us/originals/9pbd0qpb8kwz/game.js','utf8'),before=fs.readFileSync(from+'/game.js','utf8'),audit=JSON.parse(fs.readFileSync(b+'/harbor-offline-v1-independent-fidelity.json'));
const milestone=name=>fs.writeFileSync(b+'/harbor-v2-prepare-phase.json',JSON.stringify({phase:name,at:new Date().toISOString(),source_only:true}));milestone('inputs_read');
assert(sha(original)===audit.original_sha256&&sha(before)===audit.runtime_sha256&&audit.protected_modules.every(m=>m.canonical_AST_exact)&&!audit.retired_symbol_residue.length);
const restored=audit.module_comparisons.filter(m=>m.canonical_AST_exact);assert(restored.length===114);
let result=before,limit=before.length;
for(const row of [...restored].sort((a,b)=>b.adapted_range[0]-a.adapted_range[0])){const [a,z]=row.adapted_range,[x,y]=row.source_range;assert(z<=limit);const raw=original.slice(x,y);assert(sha(raw)===row.source_body_sha256);result=result.slice(0,a)+raw+result.slice(z);limit=a;}
milestone('114_original_bodies_restored');
const originalBodies=restored.map(r=>({module:r.module,body:original.slice(...r.source_range),sha256:r.source_body_sha256}));
const prop=n=>n?.property?.name??n?.property?.value,key=n=>n?.key?.name??n?.key?.value;
function mod(n){if(!T.isCallExpression(n)||!T.isMemberExpression(n.callee))return null;return prop(n.callee)==='module'?n.arguments[0]?.value:mod(n.callee.object);}
const a=P.parse(result),ed=[],mods=[];tr(a,{CallExpression(p){if(prop(p.node.callee)==='defines'){const name=mod(p.node.callee.object);if(name)mods.push({name,node:p.node,body:p.node.arguments[0]});}}});
milestone('restored_source_parsed');
const ctx=n=>mods.find(m=>m.node.start<=n.start&&n.end<=m.node.end)?.name;
function edit(n,text,reason){if(ed.some(e=>e.start<=n.start&&n.end<=e.end))return;for(let i=ed.length-1;i>=0;i--)if(n.start<=ed[i].start&&ed[i].end<=n.end)ed.splice(i,1);assert(!ed.some(e=>n.start<e.end&&e.start<n.end),'Overlapping edit '+reason);ed.push({start:n.start,end:n.end,text,reason,module:ctx(n)});}
function removeProp(p,reason){const ns=p.parent.properties,i=ns.indexOf(p.node);edit({start:i===ns.length-1&&i>0?ns[i-1].end:p.node.start,end:i<ns.length-1?ns[i+1].start:p.node.end},'',reason);}
let hostEdits=0;
tr(a,{
 VariableDeclaration(p){if(p.node.declarations.map(d=>d.id.name).join(',')==='_0x2de8c4,_0x5d172c'){const raw=result.slice(p.node.start,p.node.end);assert(raw.includes('_0x13e9f9')&&raw.includes('replace'));edit(p.node,'','Retire isolated original client distribution-host blank redirect in already downloaded standalone copy');hostEdits++;p.skip();}},
 CallExpression(p){const n=p.node,k=prop(n.callee);
  if(T.isIdentifier(n.callee,{name:'_0x5d172c'})){edit(n,'void 0','Remove original one-shot caller of client host hook');hostEdits++;p.skip();return;}
  if(k==='defines'&&mod(n.callee.object)==='plugins.clickable-div-layer'){edit(n,'void 0','Retire external clickable branding link provider; preserve logo graphics');p.skip();return;}
  if(k==='requires'&&n.arguments.some(v=>v.value==='plugins.clickable-div-layer'))edit(n,result.slice(n.callee.object.start,n.callee.object.end)+'.requires('+n.arguments.filter(v=>v.value!=='plugins.clickable-div-layer').map(v=>JSON.stringify(v.value)).join(',')+')','Remove retired clickable layer dependency');
  if(k==='setupMarketJsGameCenter'){edit(n,'void 0','Remove outbound gamecenter startup');p.skip();}
 },
 NewExpression(p){if(p.node.callee?.name==='ClickableDivLayer'){const q=p.parentPath.isAssignmentExpression()?p.parentPath:p;edit(q.node,'void 0','Remove actual outbound branding layer consumer');p.skip();}},
 ObjectProperty(p){const k=key(p.node);
  if(ctx(p.node)==='game.main'&&k==='setupMarketJsGameCenter'){removeProp(p,'Remove outbound gamecenter method');p.skip();return;}
  if(k==='LinkEnabled')edit(p.node.value,'false','Retire outbound branding permission');
  if(k==='Link'&&T.isStringLiteral(p.node.value)&&/^https?:/.test(p.node.value.value))edit(p.node.value,'""','Remove outbound branding URL');
 }
});
assert(hostEdits===2,'Client hook scope not exact');
milestone('service_edits_prepared');
if(process.env.HARBOR_SOURCE_PLAN_ONLY==='1'){const out=b+'/source-analysis/harbor';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/v2-restored-intermediate.js',result);fs.writeFileSync(out+'/v2-service-edit-plan.json',JSON.stringify({input_sha256:sha(result),edits:ed,restored,original_bodies:originalBodies.map(({module,sha256})=>({module,sha256})),changed_modules:[...new Set(ed.map(e=>e.module))]},null,2));console.log(JSON.stringify({plan_only:true,source_only:true,edits:ed.length}));process.exit(0);}
const stage=result;for(const e of [...ed].sort((x,y)=>y.start-x.start))result=result.slice(0,e.start)+e.text+result.slice(e.end);P.parse(result);
milestone('final_source_parsed');
const after=P.parse(result),residue=[];tr(after,{ReferencedIdentifier(p){if(['ClickableDivLayer','_0x5d172c','_0x2de8c4'].includes(p.node.name))residue.push(p.node.name);}});assert(!residue.length);
milestone('retired_symbols_absent');
const changedModules=new Set(ed.map(e=>e.module));const rawPreserved=originalBodies.filter(r=>!changedModules.has(r.module));
assert(rawPreserved.length>=112);for(const r of rawPreserved)assert(result.includes(r.body),'Original restored body lost '+r.module);
milestone('original_bodies_verified');
for(const r of audit.protected_modules)assert(rawPreserved.some(x=>x.module===r.module),'Protected gameplay touched '+r.module);
fs.cpSync(from,dst,{recursive:true,errorOnExist:true,force:false});fs.writeFileSync(dst+'/game.js',result);
const proof={native_id:'9pbd0qpb8kwz',revision:'harbor-offline-v2',original_sha256:sha(original),input_v1_sha256:sha(before),restored_intermediate_sha256:sha(stage),runtime_sha256:sha(result),original_bodies_restored:restored.length,final_raw_original_bodies:rawPreserved.map(({module,sha256})=>({module,sha256,byte_exact:true})),protected_original_modules:30,source_fidelity_audit:'harbor-offline-v1-independent-fidelity.json',client_host_proof:{native_allowlist:['marketjs.cdn.start.gg','.cdn.start.gg','.cdn.msnfun.com','.msn.com','localhost','s3-ap-southeast-1.amazonaws.com','s3.ap-southeast-1.amazonaws.com'],native_reject_target:'about:blank',literal_regex_ranges:[[255509,255781],[258144,258195]],literal_replace_ranges:[[255792,256205],[258206,258275]],no_native_eval:true,no_upstream_access_or_identity_change:true},edits:ed,retired_symbol_residue:residue,no_fake_SDK_or_reward:true,no_state_clock_rng_save_level_injection:true,UI:0,native_executed_locally:false};
fs.writeFileSync(b+'/harbor-v2-source-fidelity.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify({revision:proof.revision,raw_original_modules:rawPreserved.length,protected_original_modules:30,additional_service_edits:ed.length,runtime_bytes:Buffer.byteLength(result),UI:0}));
