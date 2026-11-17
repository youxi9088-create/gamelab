// Retire the provider implementation after its exact native registration was removed.
// The import slots remain linkable and fail loudly if an unreviewed call survives;
// no fake SDK object, callback, identity, readiness, ad result or reward is supplied.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),parser=lib('@babel/parser'),traverse=lib('@babel/traverse').default,gen=lib('@babel/generator').default;
const root='deployment-packages/direct-games/job-ca75d464d2d7',dest=root+'/work-native-retirement-20261117-v3',source=fs.readFileSync(root+'/original/LevelDevil_wasm.js','utf8'),tree=parser.parse(source),hash=s=>crypto.createHash('sha256').update(s).digest('hex'),semantic=n=>hash(gen(n,{compact:true,comments:false}).code);
let before={},count={},changed=[];
traverse(tree,{FunctionDeclaration(p){let name=p.node.id.name;count[name]=(count[name]||0)+1;before[name+'#'+count[name]]=semantic(p.node);}});
traverse(tree,{FunctionDeclaration(p){let name=p.node.id.name;if(!/^_PokiSdkJs_/.test(name))return;p.node.body=parser.parse('function retired(){throw new Error('+JSON.stringify('Retired provider import unexpectedly reached: '+name)+');}').program.body[0].body;changed.push(name);p.skip();},VariableDeclarator(p){if(p.node.id.type==='Identifier'&&p.node.id.name==='PokiSdk')p.remove();}});
const output=gen(tree,{compact:true,comments:false}).code;let references=[];
traverse(parser.parse(output),{Identifier(p){if(p.node.name==='PokiSdk'||p.node.name==='PokiSDK')references.push(p.node.name);}});
if(references.length||changed.length!==14)throw Error('Provider object/reference review mismatch');
let after={},afterCount={},preserved={};
traverse(parser.parse(output),{FunctionDeclaration(p){let name=p.node.id.name;afterCount[name]=(afterCount[name]||0)+1;const key=name+'#'+afterCount[name];after[key]=semantic(p.node);if(!changed.includes(name)){if(before[key]!==after[key])throw Error('Original engine function changed: '+key);preserved[key]=after[key];}}});
if(Object.keys(preserved).length!==185)throw Error('Unexpected engine function count');
fs.writeFileSync(dest+'/LevelDevil_wasm.js',output);
let loader=fs.readFileSync(root+'/original/dmloader.js','utf8');
if(!loader.includes('wasmjs_size: 285044')||!loader.includes('wasm_size: 3141341'))throw Error('Original loader size binding changed');
loader=loader.replace('wasmjs_size: 285044','wasmjs_size: '+Buffer.byteLength(output)).replace('wasm_size: 3141341','wasm_size: '+fs.statSync(dest+'/LevelDevil.wasm').size);fs.writeFileSync(dest+'/dmloader.js',loader);
let html=fs.readFileSync(dest+'/index.html','utf8');const rewardScript='<script src="local-boundary.js"></script>';
if(html.split(rewardScript).length!==2)throw Error('Old local-reward script binding changed');html=html.replace(rewardScript,'');fs.writeFileSync(dest+'/index.html',html);
const oldReward=path.resolve(dest,'local-boundary.js'),intended=path.resolve(dest);if(!oldReward.startsWith(intended+path.sep))throw Error('Cleanup target outside new candidate');fs.unlinkSync(oldReward);
const proof={at:new Date().toISOString(),source_sha256:hash(source),candidate_sha256:hash(output),retired_imports:changed,preserved_engine_functions:preserved,preserved_engine_function_count:185,provider_object_removed:true,success_callbacks_or_reward_dialog:false,native_registration_already_removed:true,loader_change:'Only actual wasmjs/wasm byte lengths updated; loader logic unchanged.',runtime_verified:false,scope:'Static source/semantic proof only. Native constructor registration is removed, original engine/gameplay code stays; an unexpected provider call throws instead of fabricating a result.'};
fs.writeFileSync(dest+'/evidence/native-retirement-20261117/javascript-provider-retirement.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify({retired_imports:changed.length,preserved_engine_functions:Object.keys(preserved).length,provider_object_removed:true,reward_dialog_removed:true,runtime_verified:false}));
