const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict'),{createRequire}=require('module');
const req=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(req.resolve('rea-agents/package.json')),P=lib('@babel/parser'),tr=lib('@babel/traverse').default,G=lib('@babel/generator').default,t=lib('@babel/types');
const root='deployment-packages/direct-games/job-09a1ed6877a8',revision=root+'/work-reward-retirement-v1-20261118',sha=v=>crypto.createHash('sha256').update(v).digest('hex'),sem=n=>sha(G(n,{compact:true,comments:false}).code);
function methods(dir){const ast=P.parse(fs.readFileSync(dir+'/game-web.js','utf8'),{sourceType:'script'}),out=new Map(),sentinels={C:'doPay',I:'onTrySkinBtnClick',J:'RestartLevel',K:'onGetBtnClick',L:'BtnShopVideoClick',N:'InitValues',O:'onConfigLoaded',w:'Init'};tr(ast,{ClassDeclaration(p){if(!p.node.body.body.some(m=>t.isClassMethod(m)&&(m.key.value||m.key.name)===sentinels[p.node.id.name]))return;for(const m of p.node.body.body)if(t.isClassMethod(m))out.set(p.node.id.name+'.'+(m.key.value||m.key.name),m);}});return out;}
const a=methods(root+'/work'),b=methods(revision),checks=[];
for(const name of ['C.doPay','C.showBannerAd','I.onTrySkinBtnClick','K.onGetBtnClick','L.BtnShopVideoClick']){
 const body=b.get(name).body.body;assert.equal(body.length,1);assert(t.isReturnStatement(body[0])&&t.isBooleanLiteral(body[0].argument,{value:false}));checks.push({name,only_unavailable_return:true,no_success_or_failure_callback_invocation:true});
}
const availability=G(b.get('C.checkCanShowVideo').body,{compact:true,comments:false}).code;
assert.equal(availability,'{if(typeof P==="function")P(false);return false;}');checks.push({name:'C.checkCanShowVideo',availability_false:true});
for(const name of ['L.BtnBaseClick','L.BtnMaxClick']){
 function find(m){let out;tr(m.body,{noScope:true,IfStatement(p){const s=G(p.node.test,{compact:true,comments:false}).code;if(s.includes('n["GetNumber"]("Diamond")')){assert(!out);out=p.node;}}});assert(out);return out;}
 const x=find(a.get(name)),y=find(b.get(name));assert.equal(sem(x.test),sem(y.test));assert.equal(sem(x.consequent),sem(y.consequent));assert.equal(G(y.alternate,{compact:true,comments:false}).code,'{return false;}');
 checks.push({name,funds_test_sha256:sem(y.test),earned_upgrade_branch_sha256:sem(y.consequent),unchanged:true,insufficient_funds_no_upgrade:true});
}
for(const name of ['I.onEnable','K.onEnable','L.onAwake']){
 const x=a.get(name).body.body,y=b.get(name).body.body;assert.equal(y.length,x.length+2);for(let i=0;i<x.length;i++)assert.equal(sem(x[i]),sem(y[i]));assert(y.slice(-2).every(s=>t.isExpressionStatement(s)&&t.isAssignmentExpression(s.expression)&&t.isBooleanLiteral(s.expression.right,{value:false})));checks.push({name,original_statements_unchanged:true,retired_control_hidden_and_disabled:true});
}
for(const cls of ['w','J','N','O'])for(const[name,m]of a)if(name.startsWith(cls+'.'))assert.equal(sem(m),sem(b.get(name)),name);
checks.push({name:'native_world_scene_game_loader',classes:['w','J','N','O'],all_methods_unchanged:true});
const proof=JSON.parse(fs.readFileSync(revision+'/evidence/direct-repair/reward-retirement-v1-source-proof.json','utf8'));
const out={at:new Date().toISOString(),checks,checks_passed:checks.length,main_sha256:proof.candidate_main_sha256,prior_ui_steps:5,new_inputs:0,native_functions_executed:false,game_executed:false,runtime_verified:false,ready_review:false};
fs.writeFileSync(revision+'/evidence/direct-repair/reward-retirement-v1-static-audit.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
