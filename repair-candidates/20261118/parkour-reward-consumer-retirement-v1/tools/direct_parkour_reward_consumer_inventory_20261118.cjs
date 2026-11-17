const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default;
const root='deployment-packages/direct-games/job-09a1ed6877a8',source=fs.readFileSync(root+'/work/game-web.js','utf8'),ast=P.parse(source,{sourceType:'script'});let adapter;
tr(ast,{ClassDeclaration(p){if(p.node.id.name==='C'&&p.node.body.body.some(m=>m.key.value==='doPay')){if(adapter)throw Error('Ambiguous C');adapter=p;}}});
if(!adapter)throw Error('No native adapter');
const binding=adapter.scope.getBinding('C'),refs=binding.referencePaths.map(p=>{const m=p.parentPath;let owner=p.findParent(x=>x.isClassMethod());let cls=owner?.findParent(x=>x.isClassDeclaration());return {line:p.node.loc.start.line,member:m.node.type==='MemberExpression'?(m.node.property.value||m.node.property.name):m.node.type,owner:cls?.node.id?.name+'.'+(owner?.node.key?.value||owner?.node.key?.name),expression:G(m.parentPath.node,{compact:true,comments:false}).code.slice(0,500)};});
const output={adapter_line:adapter.node.loc.start.line,references:refs,game_executed:false};
const dst=root+'/analysis/reward-consumers-20261118.json';if(fs.existsSync(dst))throw Error('Existing inventory');
fs.writeFileSync(dst,JSON.stringify(output,null,2));console.log(JSON.stringify(output));
