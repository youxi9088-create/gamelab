// Offline converter: input scripts are parsed/packaged, never executed on the server.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(process.argv[2]),input=path.join(root,'input'),out=path.join(root,'web');
const manifest=JSON.parse(fs.readFileSync(path.join(input,'manifest.json'),'utf8'));
const hashes=[],warnings=[];let fileCount=0,totalBytes=0;
function progress(stage){console.log(JSON.stringify({stage}));}
function safe(base,name){
 if(typeof name!=='string'||name.includes('\\')||name.includes(':')||name.includes('\0')||name.startsWith('/')||name.split('/').some(p=>!p||p==='.'||p==='..'||p.endsWith('.')||p.endsWith(' ')||/^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(p)))throw Error('Unsafe package path: '+JSON.stringify(name));
 const target=path.resolve(base,name);if(!target.startsWith(base+path.sep))throw Error('Package path escapes workspace');return target;
}
function write(base,name,bytes){const dest=safe(base,name);if(fs.existsSync(dest)&&!fs.readFileSync(dest).equals(Buffer.from(bytes)))throw Error('Conflicting file: '+name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);}
function unpack(dir,appid,dest){
 const files=fs.readdirSync(dir).filter(n=>n.endsWith('.wxapkg'));if(!files.length)throw Error('No wxapkg files in '+path.basename(dir));
 for(const name of files){const raw=fs.readFileSync(path.join(dir,name));hashes.push({package:path.basename(dir)+'/'+name,sha256:crypto.createHash('sha256').update(raw).digest('hex')});let b=raw;
 if(raw.subarray(0,6).toString()==='V1MMWX'){
  if(raw.length<1030)throw Error('Truncated encrypted package');
  const decipher=crypto.createDecipheriv('aes-256-cbc',crypto.pbkdf2Sync(appid,'saltiest',1000,32,'sha1'),'the iv: 16 bytes');decipher.setAutoPadding(false);
  const head=Buffer.concat([decipher.update(raw.subarray(6,1030)),decipher.final()]);const tail=Buffer.from(raw.subarray(1030));for(let i=0;i<tail.length;i++)tail[i]^=appid.charCodeAt(appid.length-2);b=Buffer.concat([head.subarray(0,1023),tail]);
 }
 if(b.length<18||b[0]!==0xbe||b[13]!==0xed)throw Error('Package header invalid; check appid and encryption version');
 const count=b.readUInt32BE(14);if(count>20000)throw Error('Too many package entries');let pos=18;const entries=[];
 for(let i=0;i<count;i++){
  if(pos+4>b.length)throw Error('Truncated directory');const len=b.readUInt32BE(pos);pos+=4;
  if(len<1||len>1024||pos+len+8>b.length)throw Error('Invalid directory entry');
  const relative=b.subarray(pos,pos+len).toString('utf8').replace(/^\//,'');pos+=len;
  const offset=b.readUInt32BE(pos),size=b.readUInt32BE(pos+4);pos+=8;
  if(offset+size>b.length||++fileCount>30000||(totalBytes+=size)>512*1024*1024)throw Error('Package exceeds extraction limits');
  entries.push({relative,offset,size});
 }
 for(const e of entries){if(e.offset<pos)throw Error('Package member overlaps directory');write(dest,e.relative,b.subarray(e.offset,e.offset+e.size));}
 }
}
const modules=new Map();
function extract(file,prefix=''){
 const source=fs.readFileSync(file,'utf8');
 const pattern=/define\("([^"]+)", function\(require, module, exports\)\{[ \t]*\r?\n([\s\S]*?)\r?\n ?\t{3}\}\);/g;let count=0;
 for(const match of source.matchAll(pattern)){
  let name=match[1];if(prefix){name=name.replace(/^__plugin__\/[^/]+\/?/,'');if(!name)continue;name=prefix+name;}
  safe(out,name);new vm.Script(match[2],{filename:name});
  if(modules.has(name)&&modules.get(name)!==match[2])throw Error('Conflicting JS module '+name);
  modules.set(name,match[2]);count++;
 }
 if(!count)throw Error('Unsupported module wrapper: '+path.basename(file));
}
try{
 progress('unpacking');const game=path.join(root,'game'),engine=path.join(root,'engine');unpack(path.join(input,'game'),manifest.appid,game);unpack(path.join(input,'engine'),manifest.engine_appid,engine);
 const settings=JSON.parse(fs.readFileSync(path.join(game,'src/settings.json')));
 if(settings.CocosEngine!=='3.5.1')throw Error('Unsupported engine: '+settings.CocosEngine+'; this adapter supports Cocos Creator 3.5.1');
 if(settings.remoteBundles?.length||settings.server)throw Error('Remote resources must be collected before conversion');
 const config=JSON.parse(fs.readFileSync(path.join(game,'app-config.json')));
 if(config.gamePlugins?.cocos?.provider!==manifest.engine_appid)throw Error('Engine provider does not match game configuration');
 progress('extracting_modules');fs.mkdirSync(out,{recursive:true});extract(path.join(game,'game.js'));
 for(const sub of config.subPackages||[])extract(safe(game,sub.root.replace(/^\/+|\/+$/g,'')+'/game.js'));
 extract(path.join(engine,'plugin.js'),'engine/');
 const signature=JSON.parse(fs.readFileSync(path.join(game,'cocos/signature.json')));
 for(const item of signature.signature||[])if(!modules.has('engine/'+item.path))throw Error('Engine plugin mismatch: missing '+item.path);
 for(const required of ['application.js','src/system.bundle.js','src/import-map.js','cocos-js/cc.js'])if(!modules.has(required))throw Error('Required module missing: '+required);
 progress('adapting_browser');
 if(manifest.ad_free){
  const business=modules.get('assets/scripts/index.js')||'';
  const profile=JSON.parse(fs.readFileSync(path.join(__dirname,'profiles/sushi.json')));
  if(crypto.createHash('sha256').update(business).digest('hex')!==profile.business_sha256)throw Error('Ad removal profile does not match this game build; retry ad_free=false');
  const transform=require('./profiles/sushi-patch.cjs');modules.set('assets/scripts/index.js',transform(business));
 }
 fs.cpSync(path.join(game,'assets'),path.join(out,'assets'),{recursive:true});
 for(const [name,body]of modules)write(out,name,body);
 for(const sub of config.subPackages||[]){
  const dir=sub.root.replace(/^\/+|\/+$/g,'');const name=sub.name;safe(out,'assets/'+name);
  fs.cpSync(safe(game,dir),safe(out,'assets/'+name),{recursive:true});
  const body=modules.get(dir+'/game.js');if(!body)throw Error('Subpackage entry missing: '+name);
  fs.writeFileSync(safe(out,'assets/'+name+'/index.js'),body);
 }
 let registry='window.__modules={};\n';for(const [name,body]of modules)registry+='__modules['+JSON.stringify(name)+']=function(require,module,exports){\n'+body+'\n};\n';
 fs.writeFileSync(path.join(out,'registry.js'),registry);
 settings.subpackages=[];settings.debug=false;fs.mkdirSync(path.join(out,'src'),{recursive:true});fs.writeFileSync(path.join(out,'src/settings.json'),JSON.stringify(settings));
 const resolution=settings.designResolution||{width:750,height:1334};
 for(const name of ['index.html','bridge.js','boot.js','server.cjs','ad-free-ui.js'])fs.copyFileSync(path.join(__dirname,'templates',name),path.join(out,name));
 fs.writeFileSync(path.join(out,'web-config.js'),'window.WEB_CONFIG='+JSON.stringify({appid:manifest.appid,width:resolution.width,height:resolution.height,adFree:!!manifest.ad_free})+';');
 warnings.push('Browser gameplay has not been automatically verified for this job.','Login, payment, ads, cloud saves and remote services require separate integration.','Compiled JavaScript and assets are recovered; original TypeScript project is not reconstructed.');
 const report={status:'built_unverified',adapter:'cocos-3.5.1-v1',engine:settings.CocosEngine,appid:manifest.appid,modules:modules.size,extracted_files:fileCount,package_hashes:hashes,ad_free:!!manifest.ad_free,warnings,validation:{javascript_syntax:'passed',engine_module_inventory:'passed',gameplay:'not_tested'}};
 fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(out,'conversion-report.json'),JSON.stringify(report,null,2));
 fs.writeFileSync(path.join(out,'README.txt'),'Serve this folder over HTTP, e.g. node server.cjs, then open http://127.0.0.1:5760/.\nBuild completed; read conversion-report.json before acceptance.\n');
 progress('built_unverified');
}catch(error){fs.writeFileSync(path.join(root,'report.json'),JSON.stringify({status:'failed',reason:error.message,package_hashes:hashes},null,2));console.error(error.message);process.exitCode=1;}
