// Parse source as data. Never execute downloaded modules during capture.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const {pathToFileURL} = require('node:url');
(async()=>{
 const rea=fs.realpathSync(path.join(__dirname,'node_modules/rea-agents'));
 const resolve=createRequire(path.join(rea,'package.json'));
 const {parse}=await import(pathToFileURL(resolve.resolve('@babel/parser')).href);
 const source=fs.readFileSync(0,'utf8');
 const ast=parse(source,{sourceType:'module'}),refs=[];
 const visit=node=>{
  if(!node || typeof node!=='object')return;
  if(node.type==='CallExpression' && node.callee?.type==='Import'){
   const value=node.arguments?.[0];
   if(value?.type!=='StringLiteral')throw new Error('Dynamic module path cannot be resolved statically');
   refs.push({start:value.start,end:value.end,value:value.value});
  }
  if(node.type==='ImportExpression' && node.source?.type!=='StringLiteral')throw new Error('Dynamic module path cannot be resolved statically');
  if(['ImportDeclaration','ExportNamedDeclaration','ExportAllDeclaration','ImportExpression'].includes(node.type)){
   const value=node.source;
   if(value?.type==='StringLiteral')refs.push({start:value.start,end:value.end,value:value.value});
  }
  for(const [key,value] of Object.entries(node)){
   if(['loc','comments','tokens'].includes(key))continue;
   if(Array.isArray(value))value.forEach(visit);
   else if(value && typeof value==='object')visit(value);
  }
 };
 visit(ast);process.stdout.write(JSON.stringify(refs));
})().catch(error=>{process.stderr.write(error.message);process.exitCode=1;});
