const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module'),assert=require('assert/strict');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-09a1ed6877a8',old=root+'/work-reward-retirement-v1-20261118',dst=root+'/work-sdk-consumer-retirement-v2-20261118';
assert(!fs.existsSync(dst),'Immutable revision exists');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),sem=n=>sha(G(n,{compact:true,comments:false}).code),parse=s=>P.parse(s,{sourceType:'script'}),statements=s=>parse('function body(){'+s+'}').program.body[0].body.body;
const source=fs.readFileSync(old+'/game-web.js','utf8'),ast=parse(source),classes=new Map();
const sentinels={C:'doPay',I:'onTrySkinBtnClick',J:'RestartLevel',K:'onGetBtnClick',L:'BtnShopVideoClick',N:'InitValues',O:'onConfigLoaded',w:'Init'};
tr(ast,{ClassDeclaration(p){if(p.node.body.body.some(m=>t.isClassMethod(m)&&(m.key.value||m.key.name)===sentinels[p.node.id.name]))classes.set(p.node.id.name,p);}});
const C=classes.get('C'),N=classes.get('N'),cb=C.scope.getBinding('C'),nb=N.scope.getBinding('N'),key=m=>m.key.value||m.key.name,method=(c,n)=>{const a=classes.get(c).node.body.body.filter(m=>t.isClassMethod(m)&&key(m)===n);assert.equal(a.length,1,c+'.'+n);return a[0];};
const changes=[],before={};for(const[c,p]of classes)for(const m of p.node.body.body)if(t.isClassMethod(m))before[c+'.'+key(m)]=sem(m);
function setBody(c,n,s){method(c,n).body=t.blockStatement(statements(s));changes.push(c+'.'+n);}
setBody('N','LoadSubpackages',fs.readFileSync('deployment-packages/parkour_local_content_bootstrap_20261118.js','utf8'));
setBody('N','VibrateShort','return;');setBody('N','VibrateLong','return;');setBody('N','IsWX','return false;');
const continuations=new Set(['ShowStartSceneAds','HideStartSceneAds','ShowGameOverAds','HideGameOverAds','ShowClickAds','HideClickAds']),rewardCalls=new Set(['PopupAds','TryPopupAds']);
let inlined=0,removedRewards=0,retiredConsumerCalls=0;
tr(ast,{CallExpression(p){
 const cal=p.node.callee;if(!t.isMemberExpression(cal)||!t.isIdentifier(cal.object)||!t.isStringLiteral(cal.property))return;
 const binding=p.scope.getBinding(cal.object.name),name=cal.property.value;
 if(binding===nb&&(continuations.has(name)||rewardCalls.has(name))){
  if(p.findParent(x=>x.isClassMethod()&&x.findParent(y=>y===N)&&(continuations.has(key(x.node))||rewardCalls.has(key(x.node)))))return;
  if(rewardCalls.has(name)){p.replaceWith(t.booleanLiteral(false));removedRewards++;return;}
  const args=p.node.arguments;assert(args.length<=2);assert(args.slice(1).every(a=>t.isNullLiteral(a)));
  if(!args.length||t.isNullLiteral(args[0]))p.replaceWith(t.unaryExpression('void',t.numericLiteral(0)));
  else if(t.isArrowFunctionExpression(args[0])||t.isFunctionExpression(args[0]))p.replaceWith(t.callExpression(t.cloneNode(args[0],true),[]));
  else {assert(t.isIdentifier(args[0]));p.replaceWith(t.conditionalExpression(t.binaryExpression('!=',t.cloneNode(args[0]),t.nullLiteral()),t.callExpression(t.cloneNode(args[0]),[]),t.unaryExpression('void',t.numericLiteral(0))));}
  inlined++;return;
 }
 if(binding===cb){
  if(p.findParent(x=>x===C))return;
  if(['isShowIllegal','payInGame','doPay'].includes(name)){p.replaceWith(t.booleanLiteral(false));retiredConsumerCalls++;return;}
  if(name==='getGMData'){assert.equal(p.node.arguments.length,2);assert(t.isNumericLiteral(p.node.arguments[1]));p.replaceWith(t.cloneNode(p.node.arguments[1]));retiredConsumerCalls++;return;}
  if(['initAdapter','enginStart'].includes(name)){assert.equal(p.node.arguments.length,0);p.replaceWith(t.unaryExpression('void',t.numericLiteral(0)));retiredConsumerCalls++;return;}
 }
}});
const removedProviderMethods=C.node.body.body.filter(t.isClassMethod).map(key);C.node.body.body=[];
N.node.body.body=N.node.body.body.filter(m=>!t.isClassMethod(m)||!continuations.has(key(m))&&!rewardCalls.has(key(m)));
tr(ast,{AssignmentExpression(p){const left=p.node.left;if(t.isMemberExpression(left)&&t.isIdentifier(left.object)&&p.scope.getBinding(left.object.name)===cb&&t.isStringLiteral(left.property)&&['isUseSDK','isVibrate','TYPE'].includes(left.property.value))p.replaceWith(t.unaryExpression('void',t.numericLiteral(0)));},
 ObjectProperty(p){if((t.isIdentifier(p.node.key,{name:'SDK'})||t.isStringLiteral(p.node.key,{value:'SDK'}))&&t.isIdentifier(p.node.value)&&p.scope.getBinding(p.node.value.name)===cb)p.remove();}
});
// Data-only proof of literal-dead obfuscation copies; never eval or call original code.
function truth(n){
 if(t.isBooleanLiteral(n))return n.value;
 if(t.isUnaryExpression(n,{operator:'!'})&&t.isArrayExpression(n.argument)&&n.argument.elements.length===0)return false;
 if(t.isUnaryExpression(n,{operator:'!'})){const v=truth(n.argument);if(v!==undefined)return !v;}
 if(t.isBinaryExpression(n)&&['===','!==','==','!='].includes(n.operator)&&((t.isStringLiteral(n.left)&&t.isStringLiteral(n.right))||(t.isNumericLiteral(n.left)&&t.isNumericLiteral(n.right))))return ['===','=='].includes(n.operator)?n.left.value===n.right.value:n.left.value!==n.right.value;
 return undefined;
}
function deadGuard(p){
 let child=p;for(let a=p.parentPath;a;child=a,a=a.parentPath){
  if(a.isIfStatement()||a.isConditionalExpression()){const v=truth(a.node.test);if(v!==undefined&&((child.key==='consequent'&&!v)||(child.key==='alternate'&&v)))return G(a.node.test,{compact:true}).code;}
  if(a.isLogicalExpression()&&child.key==='right'){const v=truth(a.node.left);if(v!==undefined&&((a.node.operator==='&&'&&!v)||(a.node.operator==='||'&&v)))return G(a.node.left,{compact:true}).code;}
 }return null;
}
const literalDeadProviderCopies=[];
tr(ast,{MemberExpression(p){if(!t.isStringLiteral(p.node.property,{value:'zjSdk'}))return;const guard=deadGuard(p);assert(guard,'Unresolved reachable SDK '+p.node.loc?.start.line);literalDeadProviderCopies.push({line:p.node.loc?.start.line,guard,expression_sha256:sem(p.node)});p.replaceWith(t.unaryExpression('void',t.numericLiteral(0)));}});
const remaining=[];
tr(ast,{MemberExpression(p){if(t.isIdentifier(p.node.object)&&p.scope.getBinding(p.node.object.name)?.path.node===C.node&&t.isStringLiteral(p.node.property)&&p.node.property.value!=='isStartGame')remaining.push({line:p.node.loc?.start.line,name:p.node.property.value,dead:deadGuard(p)});}});
assert(remaining.every(x=>x.dead),'Unresolved native adapter references '+JSON.stringify(remaining.filter(x=>!x.dead)));
for(const[name,p]of classes){for(const m of p.node.body.body)if(t.isClassMethod(m)&&before[name+'.'+key(m)]!==sem(m))changes.push(name+'.'+key(m));}
const generated=G(ast,{comments:true}).code;parse(generated);assert(!generated.includes('["zjSdk"]')&&!generated.includes('SDK: C'));
fs.cpSync(old,dst,{recursive:true,filter:s=>path.basename(s)!=='evidence'});fs.writeFileSync(dst+'/game-web.js',generated);
fs.copyFileSync('deployment-packages/parkour_local_content_loader_20261118.js',dst+'/local-content-loader.js');
const groups={scenes:[],levels:[],audios:[]},retained={};
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())walk(f);else{
 const n=path.relative(old,f).replaceAll('\\','/');if(n.startsWith('evidence/')||['GAME_SPECIFICATION.md','README.md','conversion-accounting.json','game-web.js','index.html'].includes(n))continue;
 const raw=fs.readFileSync(f);assert(fs.readFileSync(dst+'/'+n).equals(raw));retained[n]=sha(raw);
 if(/\.(?:json|lh|ls|lmat|lm|lani|png|jpg|jpeg|mp3|wav|ogg|ltcb)$/.test(n)){const group=n.startsWith('audios/')?'audios':n.includes('/Levels/')?'levels':'scenes';groups[group].push({path:n,bytes:raw.length,sha256:sha(raw)});}
}}}walk(old);
for(let i=1;i<=20;i++)assert(groups.levels.some(f=>f.path==='scenes/Conventional/Levels/Level '+i+'.json'));
assert(groups.audios.some(f=>f.path==='audios/music.mp3'));
fs.writeFileSync(dst+'/local-content-manifest.js','window.localGameContent = '+JSON.stringify(Object.entries(groups).map(([name,files])=>({name,files})))+';\n');
let html=fs.readFileSync(old+'/index.html','utf8');assert.equal(html.split('<script src="game-web.js"></script>').length,2);html=html.replace('<script src="game-web.js"></script>','<script src="local-content-loader.js"></script><script src="local-content-manifest.js"></script><script src="game-web.js"></script>');fs.writeFileSync(dst+'/index.html',html);
const proof={at:new Date().toISOString(),job_id:'job-09a1ed6877a8',revision:'work-sdk-consumer-retirement-v2-20261118',previous_main_sha256:sha(source),candidate_main_sha256:sha(generated),removed_provider_methods:removedProviderMethods,inlined_local_continuations:inlined,retired_reward_calls:removedRewards,retired_adapter_consumer_calls:retiredConsumerCalls,literal_dead_provider_copies:literalDeadProviderCopies,remaining_non_session_refs:remaining,changed_methods:[...new Set(changes)],retained_files:Object.keys(retained).length,retained_manifest:retained,content_groups:Object.fromEntries(Object.entries(groups).map(([name,files])=>[name,files.length])),local_readiness:'Actual same-origin response bytes and SHA-256 before each package readiness flag; six concurrent requests per group; failures remain unready',prior_ui_steps:5,new_inputs:0,manual_pause_preserved:true,game_executed:false,ready_review:false};
fs.mkdirSync(dst+'/evidence/direct-repair',{recursive:true});fs.writeFileSync(dst+'/evidence/direct-repair/sdk-consumer-v2-source-proof.json',JSON.stringify(proof,null,2));console.log(JSON.stringify({...proof,retained_manifest:undefined,remaining_non_session_refs:remaining.length}));
