const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../templates/boot.js'),'utf8');
const loader=source.slice(0,source.indexOf('(async()=>'));
for(const base of ['https://example.test/','https://example.test/runtime/artifact-fixture/runtime/']){
 const context={URL,document:{currentScript:{src:base+'boot.js'}},window:{},__modules:{
  '@babel/runtime/helpers/regeneratorRuntime.js':(_r,m)=>m.exports='helper',
  'engine/helper.js':(_r,m)=>m.exports='engine',
  'assets/scripts/index.js':(r,m)=>m.exports=r('../../@babel/runtime/helpers/regeneratorRuntime')
 }};
 vm.createContext(context);vm.runInContext(loader,context);
 context.document.currentScript.src=base+'assets/scripts/index.js?cache=1';
 if(new URL(base).pathname!=='/'){
  // Reproduce the reported failure with the previous origin-relative parent.
  assert.throws(()=>vm.runInContext("requireModule('../../@babel/runtime/helpers/regeneratorRuntime',new URL(document.currentScript.src).pathname.slice(1))",context),/Missing module: runtime\/artifact-fixture\/runtime\/@babel/);
 }
 assert.equal(context.window.require('../../@babel/runtime/helpers/regeneratorRuntime'),'helper');
 for(const url of ['assets/scripts/index.js',new URL(base).pathname+'assets/scripts/index.js',base+'assets/scripts/index.js?v=1']){
  context.requested=url;
  assert.equal(vm.runInContext('requireModule(runtimeModulePath(requested))',context),'helper');
 }
 assert.equal(context.window.require('helper'),'engine');
 assert.throws(()=>context.window.require('missing'),/Missing module: missing/);
 context.requested='https://foreign.test/assets/scripts/index.js';
 assert.throws(()=>vm.runInContext('runtimeModulePath(requested)',context),/outside runtime/);
 context.document.currentScript=null;
 assert.equal(context.window.require('@babel/runtime/helpers/regeneratorRuntime'),'helper');
}
console.log('Runtime module paths: root and nested mounts passed');
