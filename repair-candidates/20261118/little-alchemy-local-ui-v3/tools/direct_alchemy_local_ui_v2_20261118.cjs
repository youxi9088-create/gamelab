// Retire actual orphan account/promotion consumers; preserve all gameplay functions.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-e402fd36800c',old=root+'/work',next=root+'/work-local-completion-v2-20261118';if(fs.existsSync(next))throw Error('Immutable revision exists');
fs.cpSync(old,next,{recursive:true,filter:(src)=>!['evidence','screenshots'].includes(path.basename(src))});
const sha=v=>crypto.createHash('sha256').update(v).digest('hex'),sem=n=>sha(G(n,{comments:false,compact:true}).code),main=fs.readFileSync(old+'/js/alchemy.580.js','utf8'),ast=P.parse(main,{sourceType:'script'}),before=new Map();tr(ast,{Function(p){const h=sem(p.node);before.set(h,(before.get(h)||0)+1);}});
let removed=0;
tr(ast,{ObjectExpression(p){if(!p.parentPath.isArrayExpression())return;const id=p.node.properties.find(x=>t.isObjectProperty(x)&&t.isIdentifier(x.key,{name:'id'})&&t.isStringLiteral(x.value,{value:'signin'}));if(!id)return;const list=p.findParent(x=>x.isObjectProperty()&&t.isIdentifier(x.node.key,{name:'list'}));if(!list)throw Error('Unexpected signin owner');p.remove();removed++;}});
if(removed!==2)throw Error('Original hint count changed');const generated=G(ast,{comments:true}).code,after=new Map();tr(P.parse(generated,{sourceType:'script'}),{Function(p){const h=sem(p.node);after.set(h,(after.get(h)||0)+1);}});
if(before.size!==after.size||[...before].some(([h,n])=>after.get(h)!==n))throw Error('Gameplay function bodies changed');
fs.writeFileSync(next+'/js/alchemy.580.js',generated);
let html=fs.readFileSync(old+'/index.html','utf8');
const replacements=[
 ['<link rel=dns-prefetch href=https://apis.google.com>',''],
 ['<div class=loadingScreenLA2><img src=img/la2logo.svg><div>Little Alchemy 2 is out! Play it now!</div></div>',''],
 ['<div class="icon iconLA2" id=littleAlchemy2Button></div>',''],
 ['<a id=progressShareButton class=progressShare target=_blank><div id=progress class=progress></div></a>','<div id=progressShareButton class=progressShare><div id=progress class=progress></div></div>'],
 ['#login,#broadcast,#progressShareButton,#screenshotIcon,','#login,#broadcast,#screenshotIcon,']
];
for(const[a,b]of replacements){if(html.split(a).length!==2)throw Error('HTML consumer changed '+a);html=html.replace(a,b);}
fs.writeFileSync(next+'/index.html',html);
const retained=[];
function walk(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())walk(p);else{const relative=path.relative(next,p).replaceAll('\\','/');if(['index.html','js/alchemy.580.js'].includes(relative))continue;const raw=fs.readFileSync(p);if(!raw.equals(fs.readFileSync(old+'/'+relative)))throw Error('Other source byte changed '+relative);retained.push({path:relative,sha256:sha(raw)});}}}
walk(next);const base=JSON.parse(fs.readFileSync(next+'/resources/base.580.json','utf8')),images=JSON.parse(fs.readFileSync(next+'/resources/images.580.json','utf8'));
const proof={at:new Date().toISOString(),revision:'work-local-completion-v2-20261118',job_id:'job-e402fd36800c',candidate_id:'game-9806ed6cef79',changes:['Remove two stale signin startup hints for retired cloud account','Remove orphan LittleAlchemy2 promotion DOM and its missing image request consumer','Render original progress counter in a non-link container instead of hiding it with retired share UI','Remove original Google API DNS prefetch'],original_main_sha256:sha(main),main_sha256:sha(generated),original_html_sha256:sha(fs.readFileSync(old+'/index.html')),html_sha256:sha(html),all_function_occurrences_unchanged:[...before.values()].reduce((a,b)=>a+b,0),retained_files:retained.length,retained_manifest:retained,base_records:Object.keys(base).length,image_records:Object.keys(images).length,base_sha256:sha(fs.readFileSync(next+'/resources/base.580.json')),images_sha256:sha(fs.readFileSync(next+'/resources/images.580.json')),source_only:true,game_executed:false,ui_steps_used_this_revision:0,preserved_prior_steps:5,new_ui_authorization:false,runtime_verified:false,ready_review:false};
fs.mkdirSync(next+'/evidence/direct-repair',{recursive:true});fs.writeFileSync(next+'/evidence/direct-repair/local-ui-v2-source-proof.json',JSON.stringify(proof,null,2));console.log(JSON.stringify({...proof,retained_manifest:undefined}));
