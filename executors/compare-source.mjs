import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
const dep=createRequire(fs.realpathSync(new URL('./node_modules/rea-agents/package.json',import.meta.url)));
const {parse}=await import(pathToFileURL(dep.resolve('@babel/parser')));
const stripKeys=new Set(['start','end','loc','extra','comments','leadingComments','trailingComments','innerComments','tokens','errors']);
function clean(x){if(Array.isArray(x))return x.map(clean);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).filter(([k])=>!stripKeys.has(k)).map(([k,v])=>[k,clean(v)]));return x;}
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(clean(x))).digest('hex');
function inventory(source){
 const ast=parse(source,{sourceType:'unambiguous'}),functions={},declarations={};
 function visit(node){
  if(!node||typeof node!=='object')return;
  if(node.type==='FunctionDeclaration'&&node.id){const name=node.id.name;if(Object.hasOwn(functions,name))throw Error('Ambiguous duplicate function name: '+name);functions[name]=hash(node);}
  if(node.type==='VariableDeclarator'&&node.id?.type==='Identifier'){const name=node.id.name;declarations[name]??=[];declarations[name].push(hash(node.init));}
  for(const [key,value] of Object.entries(node)){if(stripKeys.has(key))continue;if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
 }
 visit(ast);return {hash:hash(ast),functions,declarations};
}
const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const before=inventory(input.original),after=inventory(input.current);
const changed=Object.keys({...before.functions,...after.functions}).filter(k=>before.functions[k]!==after.functions[k]);
const variables=Object.keys({...before.declarations,...after.declarations}).filter(k=>JSON.stringify(before.declarations[k])!==JSON.stringify(after.declarations[k]));
fs.writeFileSync(process.argv[3],JSON.stringify({ast_identical:before.hash===after.hash,original_function_count:Object.keys(before.functions).length,
 changed_functions:changed,unchanged_functions:Object.keys(before.functions).filter(k=>before.functions[k]===after.functions[k]),changed_declarations:variables},null,2));
