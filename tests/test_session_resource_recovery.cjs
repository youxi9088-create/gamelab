const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process'),readline=require('node:readline');
const {key}=require('../executors/recovered-resource-cache.cjs');
test('session reports the verified recovered state rather than its transient missing-resource failure',async()=>{
 const run=fs.mkdtempSync(path.join(os.tmpdir(),'gamelab-session-recovery-'));
 const entry=`https://session-fixture.example/${crypto.randomUUID()}/index.html`,url=new URL('missing.png',entry).href,id=key(entry,url);
 const cache=path.resolve(__dirname,'../.cache/recovered-public-resources');fs.mkdirSync(cache,{recursive:true});
 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2kQAAAABJRU5ErkJggg==','base64');
 const record={entry,url,path:id+'.bin',bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),contentType:'image/png'};
 fs.writeFileSync(path.join(cache,id+'.bin'),bytes);fs.writeFileSync(path.join(cache,id+'.json'),JSON.stringify(record));
 fs.mkdirSync(path.join(run,'converted/evidence'),{recursive:true});fs.mkdirSync(path.join(run,'web-original'));
 fs.writeFileSync(path.join(run,'converted/index.html'),'<html><head></head><body><h1>Real recovery fixture</h1><img src="missing.png"><button>Ready</button></body></html>');
 fs.writeFileSync(path.join(run,'web-acquisition.json'),JSON.stringify({url:entry,engine:'browser-dom',files:[],bytes:0}));
 fs.writeFileSync(path.join(run,'input.json'),'{}');
 const child=spawn(process.execPath,[path.resolve(__dirname,'../executors/discovered-web.cjs'),'session',path.join(run,'input.json'),run],{env:{...process.env,BROWSER_HEADLESS:'true'},stdio:['pipe','pipe','pipe']});
 let stderr='';child.stderr.on('data',d=>stderr+=d);
 const exit=new Promise(resolve=>child.on('exit',code=>resolve(code)));
 const lines=readline.createInterface({input:child.stdout});
 let timer;
 try{
  const snapshot=await Promise.race([(async()=>{for await(const line of lines){if(JSON.parse(line).event==='snapshot')return;}throw Error(stderr||'No session snapshot');})(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Fixture session deadline exceeded')),180000);})]);
  const runtime=JSON.parse(fs.readFileSync(path.join(run,'converted/evidence/runtime.json')));
  assert.equal(runtime.passed,true,stderr||runtime.failure);assert.deepEqual(runtime.missing,[]);
  assert.deepEqual(fs.readFileSync(path.join(run,'converted/missing.png')),bytes);
  const acq=JSON.parse(fs.readFileSync(path.join(run,'web-acquisition.json')));
  assert.ok(acq.recovered_public_resources.some(r=>r.url===url));
  child.stdin.end('{"actions":null}\n');assert.equal(await exit,0,stderr);
 }finally{
  clearTimeout(timer);lines.close();
  if(child.exitCode===null){child.stdin.end('{"actions":null}\n');await exit;}
  for(const suffix of ['.json','.bin'])fs.rmSync(path.join(cache,id+suffix),{force:true});
  fs.rmSync(run,{recursive:true,force:true});
 }
});
