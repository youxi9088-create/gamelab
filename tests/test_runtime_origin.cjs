const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm');
const {verify}=require('../executors/discovered-web.cjs');
const host=fs.readFileSync(path.join(__dirname,'../executors/adapters/poki-offline.js'),'utf8');
const known="const _0x1918 = ['top', 'indexOf', 'aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==', 'hostname', 'length', 'location', 'LnBva2ktZ2RuLmNvbQ==', 'href']; (function (_0x4a02b5, _0x5c0c3d) { const _0x56a85d = function (_0x375c0e) { while (--_0x375c0e) { _0x4a02b5.push(_0x4a02b5.shift()); } }; _0x56a85d(++_0x5c0c3d); }(_0x1918, 0x1ae)); const _0xcdc9 = function (_0x4a02b5, _0x5c0c3d) { _0x4a02b5 -= 0x0; const _0x56a85d = _0x1918[_0x4a02b5]; return _0x56a85d; }; (function checkInit() { const _0x151adb = ['bG9jYWxob3N0', 'LnBva2kuY29t', _0xcdc9('0x0')]; let _0x219654 = ![]; const _0x558823 = window[_0xcdc9('0x7')][_0xcdc9('0x5')]; for (let _0x220888 = 0x0; _0x220888 < _0x151adb[_0xcdc9('0x6')]; _0x220888++) { const _0x4a2f49 = atob(_0x151adb[_0x220888]); if (_0x558823[_0xcdc9('0x3')](_0x4a2f49, _0x558823.length - _0x4a2f49.length) !== -0x1) { _0x219654 = !![]; break; } } if (!_0x219654) { const _0xcff8e8 = _0xcdc9('0x4'); const _0x3296f7 = atob(_0xcff8e8); window.location[_0xcdc9('0x1')] = _0x3296f7; window[_0xcdc9('0x2')][_0xcdc9('0x7')] !== window[_0xcdc9('0x7')] && (window[_0xcdc9('0x2')][_0xcdc9('0x7')] = window[_0xcdc9('0x7')]); } }());";
function fixture(html){
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'door-domain-'));
 fs.mkdirSync(path.join(run,'converted'));fs.writeFileSync(path.join(run,'converted/index.html'),html);
 fs.writeFileSync(path.join(run,'web-acquisition.json'),'{"engine":"browser-dom"}');
 return run;
}
test('known bridge blocks only exact host redirect and preserves normal eval and initialization',()=>{
 const called=[],window={Module:{onRuntimeInitialized(){called.push('initialized');}},
 UTF8ToString:x=>x,stringToNewUTF8:x=>x,_dmScript_Html5ReportOperationSuccess:x=>called.push(x)};
 window.ASM_CONSTS={5:function($0){/* eval(UTF8ToString( */ /* _dmScript_Html5ReportOperationSuccess */ called.push($0);return 'original';}};
 vm.runInNewContext(host,{window,URL,location:{href:'https://fixture.example/'}});
 window.Module.onRuntimeInitialized();
 assert.equal(window.ASM_CONSTS[5](known),'undefined');
 assert.deepEqual(called,['initialized',1]);
 assert.equal(window.ASM_CONSTS[5]('window.location.hostname'),'original');
 assert.equal(window.ASM_CONSTS[5](known+' '),'original');
 assert.equal(window.__offlineHost.events.filter(e=>e.name==='local-host-navigation-suppressed').length,1);
});
test('non-loopback automatic redirect fails with navigation evidence',async()=>{
 const run=fixture('<h1>Fixture game</h1><script>if(!/localhost|127/.test(location.hostname))setTimeout(()=>location.href="https://outside.example/blocked",500);</script>');
 try{
  await assert.rejects(()=>verify(run));
  const report=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));
  assert.equal(report.passed,false);assert.equal(report.runtime_origin,'https://replica-runtime.invalid');
  assert.ok(report.blocked_external.some(r=>r.url==='https://outside.example/blocked'&&r.type==='document'));
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});
test('host bridge runs at non-loopback origin and ordinary input and reload still work',async()=>{
 const html='<h1>Ready</h1><button onclick="localStorage.count=Number(localStorage.count||0)+1;this.textContent=localStorage.count">Count</button><script>window.UTF8ToString=x=>x;window.stringToNewUTF8=x=>x;window._dmScript_Html5ReportOperationSuccess=()=>{};window.ASM_CONSTS={10:function($0){var result=eval(UTF8ToString($0));_dmScript_Html5ReportOperationSuccess(1);return result;}};window.Module={onRuntimeInitialized(){ASM_CONSTS[10]('+JSON.stringify(known)+');document.querySelector("h1").textContent=location.hostname;}};</script><script defer src="runtime-host.js"></script><script>addEventListener("DOMContentLoaded",()=>Module.onRuntimeInitialized());</script>';
 const run=fixture(html);fs.writeFileSync(path.join(run,'converted/runtime-host.js'),host);
 try{
  const r=await verify(run,[{type:'click',x:30,y:90},{type:'reload'}]);
  assert.equal(r.passed,true);assert.match(r.steps[0].text,/replica-runtime.invalid/);
  assert.equal(r.navigation.length,2);assert.deepEqual(r.required_external,[]);
  assert.deepEqual(r.navigation_checkpoints.map(c=>c.phase),['startup','interaction','reload']);
  assert.ok(r.navigation_checkpoints.every(c=>c.status==='passed'));
  assert.ok(r.steps[1].storage.areas.localStorage.entries.some(e=>e.key==='count'));
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});

for(const trigger of ['startup','interaction','reload'])test('navigation checkpoint rejects '+trigger+' redirect',async()=>{
 const script=trigger==='startup'?'setTimeout(jump,3000)':trigger==='reload'?'if(sessionStorage.visited) setTimeout(jump,2500);sessionStorage.visited=1':'document.querySelector("button").onclick=jump';
 const run=fixture('<button style="width:200px;height:100px">Play</button><script>function jump(){location.href="/unexpected.html"}'+script+'</script>');
 fs.writeFileSync(path.join(run,'converted/unexpected.html'),'<h1>Not the game</h1>');
 try{
  await assert.rejects(()=>verify(run,trigger==='interaction'?[{type:'click',x:50,y:50}]:trigger==='reload'?[{type:'reload'}]:[]));
  const r=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));
  assert.equal(r.passed,false);
  assert.ok(r.navigation_attempts.some(n=>!n.allowed&&n.phase===trigger&&n.url.endsWith('/unexpected.html')));
 }finally{fs.rmSync(run,{recursive:true,force:true});}
});
