const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {match,record,update}=require('../executors/runtime-contracts.cjs');
test('structural contract reuse is independent of host, title, recommendation and source hash',()=>{
 const one=match('<title>A</title><script src="dmloader.js"></script><script>EngineLoader.load()</script>');
 const two=match('<title>B</title><img src="ad2.png"><script src="dmloader.js"></script><script>EngineLoader.load()</script>');
 assert.deepEqual(one.selected,two.selected);assert.equal(one.engine,'defold');
 assert.equal(match('<script src="unknown.js"></script>').engine,'browser');
 const partial=match('<script src="dmloader.js"></script>');assert.equal(partial.status,'exploring');assert.equal(partial.engine,'browser');assert.equal(partial.candidate.status,'unverified');
 assert.equal(match('<h1>Game introduction</h1>').engine,null);
});
test('conflicting rules do not guess a specialized adapter',()=>{
 const r=match('<script></script>',{revision:'test',features:{script:'<script'},rules:[
 {id:'a',version:1,group:'loader',priority:1,requires:['script'],adapter:'a'},
 {id:'b',version:1,group:'loader',priority:1,requires:['script'],adapter:'b'}]});
 assert.equal(r.ambiguous.length,1);assert.equal(r.engine,'browser');assert.equal(r.status,'exploring');
});
test('cross-source matrix combines loader and host; SDK ambiguity is not silently matched',()=>{
 const sdk='<script src="https://remix.gg/cdn/@remix-gg/sdk@0.23.0/dist/index.min.js"></script>';
 const fixtures=[
  {source:'https://portal-a.example/play',html:'<script>RufflePlayer</script><script>load("a.swf")</script>',engine:'ruffle'},
  {source:'https://portal-b.example/iframe',html:'<script>_CCSettings={}</script><script src="cocos2d-js.js"></script>',engine:'cocos2'},
  {source:'https://portal-c.example/game',html:'<script src="dmloader.js"></script><script>EngineLoader.load()</script>',engine:'defold'},
  {source:'https://portal-d.example/game',html:sdk+'<script type="module">import "./game.js"</script>',engine:'browser'}
 ];
 for(const fixture of fixtures)assert.equal(match(fixture.html).engine,fixture.engine,fixture.source);
 const selected=match(fixtures[3].html).selected;
 assert.equal(selected.find(r=>r.group==='host').id,'host.remix');
 assert.ok(!match(sdk+sdk).selected.some(r=>r.group==='host'));
});
test('game evidence evolves separately from shared registry and copies into delivery',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'contracts-'));
 try{fs.mkdirSync(path.join(dir,'converted/evidence'),{recursive:true});record(dir,'<script></script>','https://game.example/');update(dir,'captured',{files:2});update(dir,'runtime-verified',{passed:true});
 const r=JSON.parse(fs.readFileSync(path.join(dir,'converted/evidence/runtime-contract.json')));
 assert.equal(r.verification,'startup-only');assert.equal(r.history.length,3);assert.ok(r.source_sha256);assert.equal(r.selected[0].id,'loader.browser');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('concurrent game families accumulate observations without sharing acceptance',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'families-'));
 try{
  const a=path.join(dir,'runs','a'),b=path.join(dir,'runs','b');fs.mkdirSync(a,{recursive:true});fs.mkdirSync(b,{recursive:true});
  record(a,'<script>1</script>','https://one.example/');record(b,'<script>2</script>','https://two.example/');
  update(a,'runtime-verified',{passed:true});update(a,'runtime-failed',{missing:1});
  const rows=fs.readdirSync(path.join(dir,'runs/contract-observations')).map(n=>JSON.parse(fs.readFileSync(path.join(dir,'runs/contract-observations',n))));
  assert.equal(new Set(rows.map(r=>r.family)).size,1);
  assert.equal(rows.filter(r=>r.run==='b').length,1);
  assert.equal(rows.find(r=>r.run==='b').verification,'pending');
  assert.equal(JSON.parse(fs.readFileSync(path.join(a,'runtime-contract.json'))).verification,'failed');
  assert.equal(rows.length,4);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
