// Literal-only decoding of existing source. No eval, original code invocation, VM,
// browser, network, authentication or checksum modifications. Output is analysis only.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json'));
const P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-e6f888d6f2d5/analysis';
const source=fs.readFileSync(root+'/loader-layer1-STATIC-ONLY.js','utf8'),ast=P.parse(source,{sourceType:'script'});
const specs=[['cU','Vu','n9I_','H3Ja','sPh',98,13,89,20],['hyj','hD','s1e','gK','Z1n',83,56,78,1],['yQ','cWF','dGOx','cl','RF',86,67,67,14],['UhO','qm','RBXS','brA','e5',88,8,66,33],['PnJu','Gsba','WhrE','MUEh','Ekcc',97,38,80,91]];
const wanted=new Set(specs.flatMap(s=>s.slice(1,5))),values=Object.create(null),definitions=Object.create(null);
function literal(n){
 if(t.isStringLiteral(n)||t.isNumericLiteral(n)||t.isBooleanLiteral(n))return n.value;
 if(t.isNullLiteral(n))return null;
 if(t.isUnaryExpression(n)&&n.operator==='-'&&t.isNumericLiteral(n.argument))return -n.argument.value;
 if(t.isObjectExpression(n)){const out=Object.create(null);for(const p of n.properties){if(!t.isObjectProperty(p)||p.computed)throw Error('Nonliteral table');const key=t.isIdentifier(p.key)?p.key.name:p.key.value;if(key==='__proto__')continue;out[key]=literal(p.value);}return out;}
 throw Error('Nonliteral input refused: '+n?.type);
}
tr(ast,{VariableDeclarator(p){if(t.isIdentifier(p.node.id)&&wanted.has(p.node.id.name)){if(Object.hasOwn(values,p.node.id.name))throw Error('Ambiguous literal binding');values[p.node.id.name]=literal(p.node.init);}},FunctionDeclaration(p){if(specs.some(s=>s[0]===p.node.id?.name))definitions[p.node.id.name]=source.slice(p.node.start,p.node.end);}});
const tables=Object.create(null);
for(const spec of specs){const[name,encoded,offsets,alphabet,chars,mod,mul,add,linear]=spec;const payload=values[encoded],off=values[offsets],abc=values[alphabet],map=values[chars];if(typeof payload!=='string'||typeof abc!=='string'||!off||!map)throw Error('Missing original literal');const count=Object.keys(off).length/3;if(!Number.isInteger(count))throw Error('Incomplete triplets');tables[name]=[];
 for(let index=0;index<count;index++){let pos=off[index*3],len=off[index*3+1],state=off[index*3+2],text='';if(!Number.isInteger(pos)||pos<0||pos+len*2>payload.length)throw Error('Bounds');for(let i=0;i<len;i++){state=(state*mul+add+i)%mod;const a=map[payload[pos]],b=map[payload[pos+1]];if(!Number.isInteger(a)||!Number.isInteger(b))throw Error('Missing character');let v=(a*64+b-state-i*linear)%mod;if(v<0)v+=mod;if(abc[v+1]===undefined)throw Error('Alphabet bounds');text+=abc[v+1];pos+=2;}tables[name].push(text);}
}
let replacements=0,remaining=0;tr(ast,{CallExpression(p){const n=p.node;if(!t.isIdentifier(n.callee)||!Object.hasOwn(tables,n.callee.name))return;if(n.arguments.length!==1||!t.isNumericLiteral(n.arguments[0])||!Number.isInteger(n.arguments[0].value)){remaining++;return;}const index=n.arguments[0].value,v=tables[n.callee.name][index];if(typeof v!=='string')throw Error('String index out of range');p.replaceWith(t.stringLiteral(v));replacements++;}});
const pretty=G(ast,{comments:true,compact:false}).code;P.parse(pretty,{sourceType:'script'});
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const proof={at:new Date().toISOString(),source_sha256:hash(source),analysis_sha256:hash(pretty),game_executed:false,source_only:true,network_requests:0,auth_or_integrity_modified:false,tables:specs.map(s=>({decoder:s[0],entries:tables[s[0]].length,original_function_sha256:hash(definitions[s[0]])})),constant_calls_replaced:replacements,dynamic_calls_unchanged:remaining,scope:'Analysis-only literal string substitution; no code executed or runtime replacement produced.'};
fs.writeFileSync(root+'/loader-string-tables-STATIC-ONLY-20261118.json',JSON.stringify(tables,null,2));
fs.writeFileSync(root+'/loader-literal-strings-STATIC-ONLY-20261118.js',pretty);
fs.writeFileSync(root+'/loader-literal-string-proof-20261118.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify(proof));
const strings=[...new Set(Object.values(tables).flat())];console.log(JSON.stringify({url_or_payload_keys:strings.filter(s=>/https?:|cryzen|script|payload|source|licen|token|cookie|auth|fetch|content|decrypt|signature|key|wasm|unity/i.test(s))}));
