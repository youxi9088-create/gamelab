// Authored fixture only; no production task, storage or acceptance mutation.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {verify}=require('../executors/discovered-web.cjs');
(async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-viewport-fixture-')),root=path.join(run,'converted');
 fs.mkdirSync(root);
 fs.copyFileSync(path.join(__dirname,'../executors/adapters/runtime-viewport.js'),path.join(root,'runtime-viewport.js'));
 fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'cocos2'}));
 fs.writeFileSync(path.join(root,'runtime-viewport.json'),JSON.stringify({width:640,height:1136,fit:'contain'}));
 fs.writeFileSync(path.join(root,'index.html'),`<style>body{margin:0;background:#111}canvas{width:100%;height:100%}</style><canvas id="GameCanvas" width="640" height="1136"></canvas>
 <script src="runtime-viewport.js"></script><script>
 ReplicaRuntimeViewport.mount(document.querySelector('canvas'),{width:640,height:1136,fit:'contain'});
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');ctx.fillStyle='#256';ctx.fillRect(0,0,640,1136);ctx.strokeStyle='white';ctx.lineWidth=16;ctx.strokeRect(8,8,624,1120);ctx.fillStyle='white';ctx.font='40px sans-serif';ctx.fillText('TOP',260,60);ctx.fillText('BOTTOM',220,1090);
 const label={string:'Fixture ready'},scene={name:'Fixture',activeInHierarchy:true,opacity:255,children:[],getComponent:t=>t===cc.Label?label:null};
 window.cc={Label:function(){},Button:function(){},director:{getScene:()=>scene},game:{canvas},winSize:{width:640,height:1136}};
 </script>`);
 const result=await verify(run,[],null,true);
 assert.equal(result.passed,true);assert.equal(result.viewport_checks.length,3);
 assert.ok(result.viewport_checks.every(c=>c.passed));assert.deepEqual(result.actions,[]);
 console.log(JSON.stringify({run,checks:result.viewport_checks}));
})().catch(e=>{console.error(e);process.exitCode=1;});
