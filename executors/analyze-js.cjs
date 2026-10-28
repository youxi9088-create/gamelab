// Static analysis only: never evaluate game code or replace the runtime source.
const fs=require('node:fs'),path=require('node:path');
(async()=>{
 const [input,output]=process.argv.slice(2);
 const {webcrack}=await import('webcrack');
 const result=await webcrack(fs.readFileSync(input,'utf8'),{deobfuscate:false,jsx:false});
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'readable.js'),result.code);
 const modules=[];let total=Buffer.byteLength(result.code);
 if(total>8_000_000)throw Error('Analysis output exceeds limit');
 for(const [id,module] of result.bundle?.modules||[]){
  if(modules.length>=100)break;
  const code=module.code;
  if(typeof code!=='string')continue;
  total+=Buffer.byteLength(code);if(total>8_000_000)break;
  const file=`module-${modules.length}.js`;fs.writeFileSync(path.join(output,file),code);modules.push({id,file});
 }
 fs.writeFileSync(path.join(output,'modules.json'),JSON.stringify({format:result.bundle?.type||null,modules,scope:'Static unminify/unpack only; dynamic deobfuscator evaluation disabled'}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
