const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
test('deferred DOM menu remains available to entry recovery with the initial sample retained',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gamelab-delayed-entry-'));
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Deferred entry fixture</title><body><h1>Loading fixture</h1><script>setTimeout(()=>{document.body.innerHTML="<h1>Ready</h1><button>BEGIN COUNTDOWN</button>"},2000)</script>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const child=spawn(process.execPath,[path.resolve(__dirname,'../executors/acquire.cjs'),`http://127.0.0.1:${server.address().port}/`,root],{env:{...process.env,GAMELAB_ACQUIRE_TIMEOUT_MS:'30000',BROWSER_HEADLESS:'true'},stdio:['ignore','pipe','pipe']});
  let error='';child.stderr.on('data',d=>error+=d);
  const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
  assert.equal(code,0,error);
  const d=JSON.parse(fs.readFileSync(path.join(root,'observation.json'))).web_discovery;
  assert.deepEqual(d.initial_launch_controls,[]);
  assert.ok(d.final_launch_controls.some(c=>c.label==='BEGIN COUNTDOWN'&&c.visible));
  assert.deepEqual(d.launch_controls,d.final_launch_controls);
  assert.equal(d.launch_action.attempted,false);
 }finally{await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true});}
});
