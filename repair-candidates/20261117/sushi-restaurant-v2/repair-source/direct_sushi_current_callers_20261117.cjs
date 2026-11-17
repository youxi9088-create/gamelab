const fs=require('fs'),path=require('path'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),parser=lib('@babel/parser'),traverse=lib('@babel/traverse').default,G=lib('@babel/generator').default;
const root='deployment-packages/direct-games/job-ad79ce70fd26',input=process.argv[2]||root+'/work',source=fs.readFileSync(input+'/registry.js','utf8'),ast=parser.parse(source,{sourceType:'script'}),out={providerCalls:[],sdkPrelude:[],unboundProviderImports:[]};
const isReg=p=>p.node.type==='CallExpression'&&p.node.callee.type==='MemberExpression'&&p.node.callee.object.name==='System'&&p.node.callee.property.name==='register'&&p.node.arguments[0]?.type==='StringLiteral';
traverse(ast,{CallExpression(p){
 if(isReg(p)){
  const [id,deps,factory]=p.node.arguments,aliases=new Map();
  const returned=factory.body.body.find(n=>n.type==='ReturnStatement')?.argument;
  const setters=returned?.properties.find(n=>n.key.name==='setters')?.value.elements;
  if(!setters)return;
  deps.elements.forEach((dep,index)=>{if(!/Platform(?:WeiXin|QQ|Vivo|Oppo|TTMini|Kuaishou|XiaoMi)\.ts$/.test(dep.value))return; const fn=setters[index];if(!fn?.body?.body){out.unboundProviderImports.push({module:id.value,dependency:dep.value,setterIndex:index});return;}for(const stmt of fn.body.body){const nodes=stmt.expression?.type==='SequenceExpression'?stmt.expression.expressions:[stmt.expression];for(const node of nodes)if(node?.type==='AssignmentExpression'&&node.left.type==='Identifier')aliases.set(node.left.name,dep.value);}});
  p.traverse({CallExpression(q){const n=q.node.callee;if(n.type==='MemberExpression'&&aliases.has(n.object.name)){let owner=q.findParent(a=>a.isAssignmentExpression()&&a.node.left.type==='MemberExpression');out.providerCalls.push({module:id.value,provider:aliases.get(n.object.name),method:n.property.name||n.property.value,owner:owner?G(owner.node.left).code:null,line:q.node.loc.start.line,expression:G(q.node).code});}}});
 }
 const c=p.node.callee;if(c.type==='MemberExpression'&&c.object.name==='wx'&&c.property.name==='request'){
  let assignment=p.findParent(q=>q.isAssignmentExpression()&&q.node.left.type==='MemberExpression'&&q.node.left.object.name==='__modules');
  let expressions=[];for(let q=p.parentPath;q&&q!==assignment;q=q.parentPath)if(q.isExpressionStatement())expressions.push({start:q.node.start,end:q.node.end,preview:source.slice(q.node.start,q.node.start+130)});
  const parents=[];for(let q=p.parentPath;q&&q!==assignment;q=q.parentPath)if(q.isCallExpression()&&['FunctionExpression','UnaryExpression','SequenceExpression'].includes(q.node.callee.type))parents.push({start:q.node.start,end:q.node.end,kind:q.node.callee.type,preview:source.slice(q.node.start,q.node.start+120)});
  out.sdkPrelude.push({line:p.node.loc.start.line,module:assignment?.node.left.property.value,url:p.node.arguments[0]?.properties?.find(n=>n.key.name==='url')?.value?.value,outerExpression:expressions.at(-1),namedRegister:p.findParent(isReg)?.node.arguments[0].value,iifeAncestors:parents});
 }
}});
fs.writeFileSync(root+'/analysis/current-callers-'+path.basename(input)+'-20261117.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
