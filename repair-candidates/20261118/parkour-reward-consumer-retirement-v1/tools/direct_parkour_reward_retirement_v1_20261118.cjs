const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-09a1ed6877a8',old=root+'/work',dst=root+'/work-reward-retirement-v1-20261118';
if(fs.existsSync(dst))throw Error('Immutable candidate exists');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),semantic=n=>sha(G(n,{compact:true,comments:false}).code),parse=s=>P.parse(s,{sourceType:'script'}),source=fs.readFileSync(old+'/game-web.js','utf8'),ast=parse(source);
const classes=new Map();tr(ast,{ClassDeclaration(p){if(p.node.loc.start.line>38000&&['C','I','J','K','L','N','O','w'].includes(p.node.id.name))classes.set(p.node.id.name,p);}});
for(const c of ['C','I','J','K','L','N','O','w'])if(!classes.has(c))throw Error('Missing '+c);
const key=m=>m.key.value||m.key.name,method=(c,n)=>{const m=classes.get(c).node.body.body.filter(m=>t.isClassMethod(m)&&key(m)===n);if(m.length!==1)throw Error(c+'.'+n);return m[0];};
const before=new Map();for(const [c,p]of classes)for(const m of p.node.body.body)if(t.isClassMethod(m))before.set(c+'.'+key(m),semantic(m));
const statements=s=>parse('function isolatedBody(){'+s+'}').program.body[0].body.body,changes=[];
function body(c,n,s){method(c,n).body=t.blockStatement(statements(s));changes.push(c+'.'+n);}
// Retired business methods neither contact the provider nor report payment/ad success.
body('C','doPay','return false;');
body('C','showBannerAd','return false;');
body('C','checkCanShowVideo','if (typeof P === "function") P(false); return false;');
// Do not invoke either original callback: TrySkin's former failure callback also granted the benefit.
body('I','onTrySkinBtnClick','return false;');
body('K','onGetBtnClick','return false;');
body('L','BtnShopVideoClick','return false;');
const visibilityPolicy='this["trySkinBtn"]["visible"]=false;this["trySkinBtn"]["mouseEnabled"]=false;';
method('I','onEnable').body.body.push(...statements(visibilityPolicy));changes.push('I.onEnable');
method('K','onEnable').body.body.push(...statements('this["getBtn"]["visible"]=false;this["getBtn"]["mouseEnabled"]=false;'));changes.push('K.onEnable');
method('L','onAwake').body.body.push(...statements('L["Unique"]["BtnShopVideo"]["visible"]=false;L["Unique"]["BtnShopVideo"]["mouseEnabled"]=false;'));changes.push('L.onAwake');
// Keep native earned-currency upgrades intact; remove only the insufficient-funds video fallback.
for(const name of ['BtnBaseClick','BtnMaxClick']){
 let found=0;const m=method('L',name);
 tr(m.body,{noScope:true,IfStatement(p){const s=G(p.node.test,{compact:true,comments:false}).code;if(s.includes('n["GetNumber"]("Diamond")')&&s.includes('n["GetNumber"](')&&p.node.alternate){p.node.alternate=t.blockStatement([t.returnStatement(t.booleanLiteral(false))]);found++;}}});
 if(found!==1)throw Error('Insufficient funds branch '+name+' '+found);changes.push('L.'+name);
}
// Ad-only icons must not continue to advertise the removed fallback.
for(const name of ['UpdateBaseCount','UpdateMaxCount']){
 let found=0;
 tr(method('L',name).body,{noScope:true,CallExpression(p){const cal=p.node.callee;if(!t.isMemberExpression(cal)||!t.isStringLiteral(cal.property,{value:'Show'}))return;const arg=p.node.arguments[0];if(!t.isMemberExpression(arg)||!t.isStringLiteral(arg.property)||!['ImgBaseVideo','ImgMaxVideo'].includes(arg.property.value))return;cal.property=t.stringLiteral('Hide');found++;}});
 if(found!==1)throw Error('Ad icon count '+name+' '+found);changes.push('L.'+name);
}
const after=new Map();for(const[c,p]of classes)for(const m of p.node.body.body)if(t.isClassMethod(m))after.set(c+'.'+key(m),semantic(m));
const allowed=new Set(changes);for(const[k,h]of before)if(!allowed.has(k)&&after.get(k)!==h)throw Error('Unrelated native method changed '+k);
const generated=G(ast,{comments:true}).code;parse(generated);
fs.cpSync(old,dst,{recursive:true,filter:s=>!['evidence','screenshots','__probe.html'].includes(path.basename(s))});
fs.writeFileSync(dst+'/game-web.js',generated);
const retained={};function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else{const n=path.relative(dst,p).replaceAll('\\','/');if(n==='game-web.js')continue;const raw=fs.readFileSync(p);if(!raw.equals(fs.readFileSync(old+'/'+n)))throw Error('Changed asset '+n);retained[n]=sha(raw);}}}walk(dst);
const report={at:new Date().toISOString(),job_id:'job-09a1ed6877a8',revision:'work-reward-retirement-v1-20261118',original_main_sha256:sha(source),candidate_main_sha256:sha(generated),changed_methods:changes,unchanged_native_methods:[...before.keys()].filter(k=>!allowed.has(k)).length,protected_classes:['w','J','N','O'],retained_files:Object.keys(retained).length,retained_manifest:retained,prior_ui_steps:5,new_ui_inputs:0,manual_pause_preserved:true,game_executed:false,ready_review:false,remaining:['Current paused task and delivered version must be rechecked before any activation','Other provider methods and historical dormant obfuscation remain; not a complete SDK retirement','Real candidate startup, earned upgrade, ad-entry absence and progression not yet verified','No new gameplay authorization; preserve original five actions and manual pause']};
fs.mkdirSync(dst+'/evidence/direct-repair',{recursive:true});fs.writeFileSync(dst+'/evidence/direct-repair/reward-retirement-v1-source-proof.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,retained_manifest:undefined}));
