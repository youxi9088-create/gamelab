const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {verify}=require('../executors/discovered-web.cjs');
const {runtimeIssues,offlineFailure}=require('../executors/runtime-issues.cjs');
(async()=>{
 const [run,mode]=process.argv.slice(2);
 assert.match(offlineFailure({required_external:['https://example.org/x.js?token=secret']}),/外部静态资源/);
 assert.ok(!offlineFailure({required_external:['https://example.org/x.js?token=secret']}).includes('secret'));
 assert.equal(runtimeIssues({navigation_attempts:[{allowed:false,url:'https://example.org/lock'}]})[0].code,'RUNTIME_NAVIGATION');
 if(mode==='blocked'){
  await assert.rejects(()=>verify(run),/外部静态资源/);
  const report=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));
  assert.equal(report.resource_requests[0].url,'https://assets.example/runtime.js?v=2');
  assert.equal(report.issues[0].code,'EXTERNAL_STATIC_RESOURCE');
 }else{
  const report=await verify(run);
  assert.equal(report.passed,true);assert.deepEqual(report.required_external,[]);assert.match(report.steps[0].text,/Local dependency ready/);
 }
})().catch(error=>{console.error(error);process.exit(1)});
