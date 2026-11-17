// Restricted interpretation of the literal JJencode prefix, never Function/eval.
// Game modules, timers, browser globals and the resulting script are not executed.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-1d7463d069d5',source=fs.readFileSync(root+'/work/game.js','utf8'),ast=P.parse(source,{sourceType:'script'});let matches=[];
tr(ast,{SequenceExpression(p){const list=p.node.expressions;const i=list.findIndex(n=>t.isAssignmentExpression(n,{operator:'='})&&t.isIdentifier(n.left,{name:'_'})&&t.isUnaryExpression(n.right,{operator:'~'})&&t.isArrayExpression(n.right.argument)&&n.right.argument.elements.length===0);if(i>=0)matches.push({node:p.node,index:i});}});
if(matches.length!==1)throw Error('Ambiguous JJencode prefix '+matches.length);
const env=Object.create(null),NumberCtor={marker:'NumberConstructor'},FunctionCtor={marker:'FunctionConstructor'},captured=[];
function prim(x){if(x===NumberCtor)return 'function Number() { [native code] }';if(x===FunctionCtor)return 'function Function() { [native code] }';if(Array.isArray(x))return x.map(y=>y==null?'':prim(y)).join(',');if(x&&typeof x==='object')return '[object Object]';return x;}
function assign(n,v){if(t.isIdentifier(n,{name:'_'})){env._=v;return v;}if(t.isMemberExpression(n)){const obj=read(n.object),key=read(n.property);if(!obj||typeof obj!=='object'||obj.marker)throw Error('Invalid data write');obj[key]=v;return v;}throw Error('Refused assignment');}
function read(n){
 if(t.isStringLiteral(n)||t.isNumericLiteral(n)||t.isBooleanLiteral(n))return n.value;
 if(t.isIdentifier(n,{name:'_'}))return env._;
 if(t.isArrayExpression(n))return n.elements.map(x=>read(x));
 if(t.isObjectExpression(n)){const out=Object.create(null);for(const p of n.properties){if(!t.isObjectProperty(p))throw Error('Object method refused');const k=p.computed?read(p.key):t.isIdentifier(p.key)?p.key.name:p.key.value;if(k==='__proto__')throw Error('Prototype write refused');out[k]=read(p.value);}return out;}
 if(t.isUnaryExpression(n)){const v=read(n.argument);if(n.operator==='!')return !v;if(n.operator==='~')return ~Number(prim(v));throw Error('Unary refused');}
 if(t.isBinaryExpression(n,{operator:'+'})){const a=prim(read(n.left)),b=prim(read(n.right));return typeof a==='string'||typeof b==='string'?String(a)+String(b):Number(a)+Number(b);}
 if(t.isAssignmentExpression(n,{operator:'='}))return assign(n.left,read(n.right));
 if(t.isUpdateExpression(n,{operator:'++'})&&t.isIdentifier(n.argument,{name:'_'})){const old=Number(prim(env._));env._=old+1;return n.prefix?env._:old;}
 if(t.isMemberExpression(n)){const o=read(n.object),k=n.computed?read(n.property):n.property.name;if(o===NumberCtor&&k==='constructor')return FunctionCtor;if(typeof o==='number'&&k==='constructor')return NumberCtor;if(o==null)throw Error('Null member');return o[k];}
 if(t.isCallExpression(n)){const callee=read(n.callee);if(callee!==FunctionCtor||n.arguments.length!==1)throw Error('Any original call refused');const body=read(n.arguments[0]);if(typeof body!=='string')throw Error('Expected constructor string');captured.push(body);return {marker:'UnexecutedFunction',body};}
 throw Error('Nonliteral original node refused '+n.type);
}
const {node,index}=matches[0];const statements=node.expressions.slice(index);if(statements.length<4)throw Error('Short prefix');
for(const n of statements){if(t.isCallExpression(n)){
 // The final nested calls are not invoked. Select only the constructor whose
 // argument consists of literal concatenation, not a call to another constructor.
 const candidates=[];function visit(x){if(!x||typeof x!=='object')return;if(t.isCallExpression(x)&&x.arguments.length===1&&t.isBinaryExpression(x.arguments[0],{operator:'+'}))candidates.push(x);for(const[k,v]of Object.entries(x)){if(['loc','start','end','extra'].includes(k))continue;if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}}
 visit(n);if(candidates.length!==1)throw Error('Ambiguous literal constructor '+candidates.length);read(candidates[0]);break;
}read(n);}
if(captured.length!==1)throw Error('No exact literal constructor captured');
const parsed=P.parse('function neverCalled(){'+captured[0]+'}',{sourceType:'script'});const body=parsed.program.body[0].body.body;if(body.length!==1||!t.isReturnStatement(body[0])||!t.isStringLiteral(body[0].argument))throw Error('Not a literal returned script');
const decoded=body[0].argument.value;P.parse(decoded,{sourceType:'script'});const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const out={at:new Date().toISOString(),source_only:true,game_executed:false,original_functions_called:0,network_requests:0,candidate_game_sha256:sha(source),literal_constructor_sha256:sha(captured[0]),decoded_sha256:sha(decoded),decoded_bytes:Buffer.byteLength(decoded),decoded_source:decoded,scope:'Data-only JJencode prefix arithmetic and parser string unescaping. Function constructors, decoded script, browser APIs and game modules never invoked.'};
fs.mkdirSync(root+'/analysis-last-action-20261118',{recursive:true});fs.writeFileSync(root+'/analysis-last-action-20261118/jj-literal-decoded-STATIC-ONLY.js',decoded);fs.writeFileSync(root+'/analysis-last-action-20261118/jj-literal-proof.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
