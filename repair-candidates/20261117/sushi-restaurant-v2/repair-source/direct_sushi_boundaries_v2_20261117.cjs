const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,T=lib('@babel/types');
const root='deployment-packages/direct-games/job-ad79ce70fd26',target=root+'/work-native-local-v2',source=fs.readFileSync(root+'/work/registry.js','utf8'),ast=P.parse(source,{sourceType:'script'}),hash=x=>crypto.createHash('sha256').update(x).digest('hex'),compact=n=>G(n,{comments:false,compact:true}).code;
const isReg=p=>p.isCallExpression()&&p.node.callee.type==='MemberExpression'&&p.node.callee.object.name==='System'&&p.node.callee.property.name==='register'&&p.node.arguments[0]?.type==='StringLiteral';
const removedCalls=[],nativeBranches=[],removedModules=[],beforeFunctions=new Map(),marked=new WeakSet();
function functions(tree){const out=new Map();tr(tree,{Function(p){const key=p.node.type+':'+p.node.start+':'+p.node.end;out.set(key,hash(compact(p.node)));}});return out;}
const originalFunctions=functions(ast);const provider=/Platform(?:WeiXin|QQ|Vivo|Oppo|TTMini|Kuaishou|XiaoMi)\.ts$/,metrics=/(?:TxSdk|YinLisdk|qxztsdk)\.ts$/;
function record(p,module,method,kind){removedCalls.push({module,method,line:p.node.loc?.start.line,expression:G(p.node).code,kind});}
function eraseEffect(p,module,method){
 record(p,module,method,'Actual unavailable provider/telemetry call retired at consumer');
 if(p.parentPath.isExpressionStatement()){p.parentPath.remove();return;}
 if(p.parentPath.isSequenceExpression()){p.remove();return;}
 if(p.parentPath.isReturnStatement()){p.parentPath.remove();return;}
 if(p.parentPath.isLogicalExpression()&&p.key==='right'&&p.parentPath.parentPath.isExpressionStatement()){
  // The entire statement only conditionally shows a native ad. Preserve its
  // existing left-hand lookup/evaluation; there is no consumed return value.
  p.parentPath.replaceWith(p.parentPath.node.left);return;
 }
 throw Error('Unclassified native effect expression '+module+' '+method+' '+p.parentPath.type);
}
// First specialize only the native platform predicates to their existing browser
// result. Keep lexical block boundaries and do not fold unrelated game values.
tr(ast,{CallExpression(p){if(!isReg(p))return;const [id,deps]=p.node.arguments,factory=p.get('arguments.2'),returned=factory.node.body.body.find(n=>n.type==='ReturnStatement')?.argument,setters=returned?.properties.find(n=>n.key.name==='setters')?.value.elements;if(!setters)return;const aliases=new Map();
 deps.elements.forEach((dep,index)=>{if(!provider.test(dep.value)&&!metrics.test(dep.value))return;const fn=setters[index];if(!fn?.body?.body)return;for(const stmt of fn.body.body){const nodes=stmt.expression?.type==='SequenceExpression'?stmt.expression.expressions:[stmt.expression];for(const node of nodes)if(node?.type==='AssignmentExpression'&&node.left.type==='Identifier')aliases.set(node.left.name,{dependency:dep.value,binding:factory.scope.getBinding(node.left.name)});}});
 p.traverse({CallExpression(q){const c=q.node.callee;if(c.type!=='MemberExpression'||c.object.type!=='Identifier')return;const alias=aliases.get(c.object.name);if(!alias||q.scope.getBinding(c.object.name)!==alias.binding)return;const method=c.property.name||c.property.value;
  if(provider.test(alias.dependency)&&method==='Active'){nativeBranches.push({module:id.value,provider:alias.dependency,line:q.node.loc.start.line});const node=T.booleanLiteral(false);marked.add(node);q.replaceWith(node);}
 }});
}});
tr(ast,{LogicalExpression:{exit(p){const n=p.node;if(marked.has(n.left)&&n.left.type==='BooleanLiteral'){
 const replacement=n.operator==='&&'?(n.left.value?n.right:n.left):n.operator==='||'?(n.left.value?n.left:n.right):null;
 if(replacement){if(T.isBooleanLiteral(replacement))marked.add(replacement);p.replaceWith(replacement);}
 }}},ConditionalExpression:{exit(p){if(marked.has(p.node.test)&&T.isBooleanLiteral(p.node.test))p.replaceWith(p.node.test.value?p.node.consequent:p.node.alternate);}},IfStatement:{exit(p){if(marked.has(p.node.test)&&T.isBooleanLiteral(p.node.test))p.replaceWith(p.node.test.value?p.node.consequent:p.node.alternate||T.emptyStatement());}}});
tr(ast,{CallExpression(p){if(!isReg(p))return;const [id,deps]=p.node.arguments;
 if(id.value.includes('gravityengine.mg.cocoscreator.min')){removedModules.push({id:id.value,sha256:hash(compact(p.node)),kind:'Complete real Datanexus/Gravity SDK module and wrapper removed, no replacement API'});if(p.parentPath.isExpressionStatement())p.parentPath.remove();else if(p.parentPath.isSequenceExpression())p.remove();else throw Error('SDK registration structure changed');return;}
 const factory=p.get('arguments.2'),returned=factory.node.body.body.find(n=>n.type==='ReturnStatement')?.argument,setters=returned?.properties.find(n=>n.key.name==='setters')?.value.elements;if(!setters)return;const aliases=new Map();
 deps.elements.forEach((dep,index)=>{if(!provider.test(dep.value)&&!metrics.test(dep.value))return;const fn=setters[index];if(!fn?.body?.body)return;for(const stmt of fn.body.body){const nodes=stmt.expression?.type==='SequenceExpression'?stmt.expression.expressions:[stmt.expression];for(const node of nodes)if(node?.type==='AssignmentExpression'&&node.left.type==='Identifier')aliases.set(node.left.name,{dependency:dep.value,binding:factory.scope.getBinding(node.left.name)});}});
 p.traverse({CallExpression(q){const c=q.node.callee;if(c.type!=='MemberExpression'||c.object.type!=='Identifier')return;const alias=aliases.get(c.object.name);if(!alias||q.scope.getBinding(c.object.name)!==alias.binding)return;const method=c.property.name||c.property.value;
  if(provider.test(alias.dependency)&&method==='rewardVideoMul'){
   const click=q.findParent(a=>a.isCallExpression()&&a.node.arguments[1]?.value==='btnFunc');if(id.value!=='chunks:///_virtual/SettingPanel.ts'||!click)throw Error('Unclassified reward entry');record(q,id.value,method,'Retire native-provider-only hidden debug reward entry; no new reward substitute');if(click.parentPath.isSequenceExpression())click.remove();else if(click.parentPath.isExpressionStatement())click.parentPath.remove();else throw Error('Debug entry shape');return;
  }
  if(provider.test(alias.dependency)&&!/^(show|hide|startRecord|stopRecord|shareRecord)/.test(method))throw Error('Unclassified provider call '+method);
  eraseEffect(q,id.value,method);
 }});
 // Remove Gravity side-effect imports and their actual paired setter only.
 const indexes=deps.elements.map((n,i)=>n.value.includes('gravityengine.mg.cocoscreator.min')?i:-1).filter(i=>i>=0).reverse();
 for(const index of indexes){deps.elements.splice(index,1);if(index<setters.length)setters.splice(index,1);}
}});
// No empty native advertising/recording timers remain after their call removal.
tr(ast,{CallExpression(p){const c=p.node.callee,callback=p.node.arguments[0],register=p.findParent(isReg),recorderOnly=register?.node.arguments[0].value==='chunks:///_virtual/GamePanel.ts'&&callback?.type==='FunctionExpression'&&compact(callback).includes('.startRecord(');if(c.type==='MemberExpression'&&c.property.name==='addTimeTask'&&callback?.type==='FunctionExpression'&&(callback.body.body.length===0||recorderOnly)){record(p,'native scheduling','addTimeTask',recorderOnly?'Native-only recorder schedule removed':'Empty native-only scheduled callback removed');if(p.parentPath.isSequenceExpression())p.remove();else if(p.parentPath.isExpressionStatement())p.parentPath.remove();else throw Error('Unclassified native scheduled call');}}});
const final=G(ast,{comments:true,compact:false}).code+'\n',parsed=P.parse(final,{sourceType:'script'}),remaining=[];tr(parsed,{StringLiteral(p){if(p.node.value.includes('api.datanexus.qq.com'))remaining.push(p.node.value);}});if(remaining.length)throw Error('Datanexus URL remains');if(removedModules.length!==2)throw Error('Expected exact SDK module pair');
// Correlate original function nodes by preserved source spans, before reparse.
const afterFunctions=functions(ast);let same=0,changed=0,retired=0;for(const [key,digest]of originalFunctions){const now=afterFunctions.get(key);if(!now)retired++;else if(now===digest)same++;else changed++;}
fs.writeFileSync(target+'/registry.js',final);fs.writeFileSync(target+'/evidence/direct-repair/caller-retirement-v2.json',JSON.stringify({original_registry_sha256:hash(source),candidate_registry_sha256:hash(final),native_browser_predicates:nativeBranches.length,removedCalls,removedModules,functions:{original:originalFunctions.size,unchanged:same,changed,retired},scope:'Native-platform predicates specialized to false only. Actual ad/recorder/telemetry consumers and complete Datanexus modules removed. Existing local reward policy retained; no SDK/auth/ad success object restored. No gameplay execution or new completion claim.'},null,2));console.log(JSON.stringify({predicates:nativeBranches.length,removedCalls:removedCalls.length,removedModules:removedModules.length,functions:{same,changed,retired}}));
