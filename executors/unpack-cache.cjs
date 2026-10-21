// Preserve every package member and its relative path for original-runtime adaptation.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const [manifestFile,out]=process.argv.slice(2),packages=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
if(fs.existsSync(out)&&fs.readdirSync(out).length)throw Error('Extraction output must be empty');
fs.mkdirSync(out,{recursive:true});const manifest=[];let total=0;
for(const [index,pkg] of packages.entries()){
 const raw=fs.readFileSync(pkg.path);if(raw.length>100000000)throw Error('Package limit');let b=raw;
 if(raw.subarray(0,6).toString()==='V1MMWX'){
  const key=crypto.pbkdf2Sync(pkg.appid,'saltiest',1000,32,'sha1'),dec=crypto.createDecipheriv('aes-256-cbc',key,'the iv: 16 bytes');dec.setAutoPadding(false);
  const head=Buffer.concat([dec.update(raw.subarray(6,1030)),dec.final()]),tail=Buffer.from(raw.subarray(1030));
  for(let i=0;i<tail.length;i++)tail[i]^=pkg.appid.charCodeAt(pkg.appid.length-2);
  b=Buffer.concat([head.subarray(0,1023),tail]);
 }
 if(b[0]!==0xbe||b[13]!==0xed)throw Error('Unsupported cache package');
 let at=14,count=b.readUInt32BE(at);at+=4;if(count>20000)throw Error('Entry limit');
 const files=[], seen=new Set();
 for(let i=0;i<count;i++){
  const length=b.readUInt32BE(at);at+=4;if(length>4096)throw Error('Invalid name');
  const name=b.subarray(at,at+length).toString();at+=length;
  const offset=b.readUInt32BE(at),size=b.readUInt32BE(at+4);at+=8;if(offset+size>b.length)throw Error('Invalid range');
  // Package paths commonly begin with '/', but may never traverse or alias on Windows.
  const relative=name.replace(/^\//,'');
  const parts=relative.split('/');
  if(!relative||parts.some(x=>!x||x==='.'||x==='..'||/[\\:\x00-\x1f<>"|?*]/.test(x)||/[. ]$/.test(x)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x)))throw Error('Unsafe package path');
  const key=relative.toLowerCase();if(seen.has(key))throw Error('Duplicate package path');seen.add(key);
  if(size>100000000||total+size>512000000)throw Error('Resource extraction capacity exceeded; no complete manifest emitted');
  const file=`package-${index}/${relative}`;const body=b.subarray(offset,offset+size);
  const destination=path.join(out,file);fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.writeFileSync(destination,body);total+=size;
  files.push({original:name,file,bytes:size,sha256:crypto.createHash('sha256').update(body).digest('hex')});
 }
 manifest.push({appid:pkg.appid,package_sha256:crypto.createHash('sha256').update(raw).digest('hex'),original_file_count:count,extracted_file_count:files.length,complete:files.length===count,files});
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
