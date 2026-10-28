const test=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require('../executors/node_modules/playwright');
const {cocosReadiness}=require('../executors/cocos-readiness.cjs');
const {gameplayReady}=require('../executors/discovered-web.cjs');
const {runtimeIssues}=require('../executors/runtime-issues.cjs');
test('readiness timeout retains diagnostic evidence for the shared repair loop',async()=>{
 let calls=0;
 const page={waitForFunction:async()=>{if(++calls===2)throw Error('Timeout 90000ms exceeded')},waitForTimeout:async()=>{},
  evaluate:async()=>({ready:false,scene:'FixtureLoading',labels:1,buttons:0,loading:true,loading_texts:['加载中 90%']})};
 await assert.rejects(()=>gameplayReady(page,'cocos2'),error=>{
  assert.match(error.message,/仍显示加载提示/);assert.equal(error.readiness.timeout_ms,90000);
  assert.equal(error.readiness.scene,'FixtureLoading');return true;
 });
});
test('Cocos image buttons become ready without labels; loading and unavailable controls remain blocked',async()=>{
 const browser=await chromium.launch(require('../executors/browser-options.cjs')());
 try{
  const page=await browser.newPage({viewport:{width:800,height:600}});
  await page.setContent('<canvas width="800" height="600"></canvas>');
  await page.evaluate(()=>{
   const button={enabled:true,interactable:true};
   window.fixture={button,label:null,point:{x:400,y:300}};
   const child={activeInHierarchy:true,opacity:255,width:120,height:60,children:[],
    getComponent(type){return type==='label'?fixture.label:fixture.button;},convertToWorldSpaceAR(){return fixture.point;}};
   const scene={name:'FixtureScene',activeInHierarchy:true,opacity:255,children:[child],getComponent(){return null}};
   fixture.child=child;fixture.scene=scene;
   window.cc={Label:'label',Button:'button',director:{getScene:()=>scene},game:{canvas:document.querySelector('canvas')},winSize:{width:800,height:600},v2:(x,y)=>({x,y})};
  });
  const ready=await page.evaluate(cocosReadiness);
  assert.equal(ready.ready,true);assert.equal(ready.labels,0);assert.equal(ready.buttons,1);
  await gameplayReady(page,'cocos2'); // Exercises the exact production wait predicate.
  for(const change of ['fixture.button.interactable=false','fixture.button.enabled=false','fixture.child.opacity=0','fixture.child.activeInHierarchy=false','fixture.child.width=0','fixture.point.x=900','fixture.scene.opacity=0']){
   await page.evaluate(()=>{Object.assign(fixture.button,{enabled:true,interactable:true});Object.assign(fixture.child,{activeInHierarchy:true,opacity:255,width:120});fixture.point.x=400;fixture.scene.opacity=255;});
   await page.evaluate(change);assert.equal((await page.evaluate(cocosReadiness)).ready,false,change);
  }
  await page.evaluate(()=>{fixture.scene.opacity=255;fixture.label={string:'加载中 90%',enabled:true};});
  const loading=await page.evaluate(cocosReadiness);assert.equal(loading.ready,false);assert.equal(loading.loading,true);
  assert.equal(runtimeIssues({readiness:loading})[0].code,'RUNTIME_NOT_READY');
  await page.evaluate(()=>{fixture.label={string:'Ready',enabled:true};fixture.button=null});
  assert.equal((await page.evaluate(cocosReadiness)).ready,true);
  await page.evaluate(()=>{fixture.label=null;fixture.button=null});
  assert.equal((await page.evaluate(cocosReadiness)).ready,false);
 }finally{await browser.close();}
});
