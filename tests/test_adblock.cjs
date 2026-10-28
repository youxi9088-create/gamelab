const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {FiltersEngine}=require('../executors/node_modules/@ghostery/adblocker');
const {createAdblock,engine}=require('../executors/adblock.cjs');
const {verify}=require('../executors/discovered-web.cjs');
function request(url,type='script',main=false){return {url:()=>url,resourceType:()=>type,method:()=> 'GET',isNavigationRequest:()=>type==='document',frame:()=>({parentFrame:()=>main?null:{}})}}
function blockedCount(report){return report.adblock.blocked_count+(report.browser_extension?.blocked_count||0)+(report.browser_extension?.client_blocked_requests?.length||0)}
test('Ghostery rules, exceptions, disable switch, and redaction',()=>{
 const blocker=FiltersEngine.parse('||ads.example^\n@@||ads.example/game.js$script',{debug:true,loadCosmeticFilters:false});
 const report={},filter=createAdblock(report,'https://game.example/',{blocker});
 assert.equal(filter.block(request('https://ads.example/banner.js?token=private')),true);
 assert.equal(filter.block(request('https://ads.example/game.js')),false);
 assert.equal(filter.block(request('https://game.example/game.js')),false);
 assert.equal(filter.block(request('https://ads.example/','document',true)),false);
 assert.ok(!JSON.stringify(report).includes('private'));
 assert.match(report.adblock.blocked[0].rule,/ads.example/);
 assert.equal(createAdblock({},'https://game.example/',{enabled:false}).block(request('https://ads.example/x.js')),false);
});
test('production snapshot blocks known advertising while keeping ordinary resources',()=>{
 const filter=createAdblock({},'https://game.example/');
 assert.equal(engine().manifest.version,'2.20.1');
 assert.equal(filter.block(request('https://googleads.g.doubleclick.net/pagead/ads')),true);
 assert.equal(filter.block(request('https://game.example/assets/game.js')),false);
});
function fixture(script){
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'ghostery-fixture-'));fs.mkdirSync(path.join(run,'converted'));
 fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'browser-dom',url:'https://game.example/',files:[]}));
 fs.writeFileSync(path.join(run,'converted/index.html'),'<html><head></head><body><h1>Fixture ready</h1><button onclick="this.textContent=\'Played\'">Play</button><script>'+script+'</script></body></html>');return run;
}
test('real offline browser blocks ads and still verifies gameplay input',async()=>{
 const run=fixture('const ad=document.createElement("script");ad.src="https://googleads.g.doubleclick.net/pagead/ads";document.head.append(ad);');
 try{const report=await verify(run,[{type:'click',x:30,y:90}]);assert.equal(report.passed,true);assert.ok(blockedCount(report)>0);assert.deepEqual(report.required_external,[]);assert.match(report.steps.at(-1).text,/Played/);}
 finally{fs.rmSync(run,{recursive:true,force:true})}
});
test('advertising navigation remains a failure rather than a successful block',async()=>{
 const run=fixture('setTimeout(()=>location.href="https://googleads.g.doubleclick.net/pagead/ads",500);');
 try{await assert.rejects(()=>verify(run));const report=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));assert.equal(report.passed,false);assert.ok(report.navigation_attempts.some(n=>!n.allowed));}
 finally{fs.rmSync(run,{recursive:true,force:true})}
});
test('blocked ad SDK errors still fail runtime verification',async()=>{
 const run=fixture('const ad=document.createElement("script");ad.src="https://googleads.g.doubleclick.net/pagead/ads";ad.onerror=()=>{throw Error("Required SDK unavailable")};document.head.append(ad);');
 try{await assert.rejects(()=>verify(run));const report=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));assert.equal(report.passed,false);assert.ok(blockedCount(report)>0);assert.ok(report.errors.some(e=>e.includes('Required SDK unavailable')));}
 finally{fs.rmSync(run,{recursive:true,force:true})}
});
test('accidental reference errors in a playable page are warnings, not failures',async()=>{
 // 上游包常见：广告/统计模块引用了未声明的变量，游戏主循环照常推进。
 // 这类不该判失败，但要留证据——与"游戏主动声明 Required SDK unavailable"区分开。
 const run=fixture('setTimeout(()=>{bannerAdsLogic.setBannerWidth(300)},100);');
 try{
  const result=await verify(run);
  assert.equal(result.passed,true);
  const report=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));
  assert.deepEqual(report.errors,[]);
  assert.ok(report.runtime_warnings.some(w=>w.includes('ReferenceError')),'报错应保留为告警：'+JSON.stringify(report.runtime_warnings));
 }finally{fs.rmSync(run,{recursive:true,force:true})}
});
test('gameplay that never becomes playable still fails on runtime errors',async()=>{
 // 页面没有任何可玩内容：即使报错是 ReferenceError，也要如实失败。
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'ghostery-unplayable-'));
 fs.mkdirSync(path.join(run,'converted'));
 fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({engine:'browser-dom',url:'https://game.example/',files:[]}));
 fs.writeFileSync(path.join(run,'converted/index.html'),'<html><head></head><body><script>setTimeout(()=>{missingThing.start()},50);</script></body></html>');
 try{await assert.rejects(()=>verify(run));}
 finally{fs.rmSync(run,{recursive:true,force:true})}
});
