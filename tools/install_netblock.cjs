// Usage: node tools/install_netblock.cjs <installed extension version directory>
// Copies extension code only, never personal browser settings or cookies.
const fs=require('node:fs'),path=require('node:path');
if(!process.argv[2])throw Error('请指定净网扩展版本目录');
const source=path.resolve(process.argv[2]);
const manifest=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'));
if(manifest.manifest_version!==3||!manifest.name.startsWith('净网 AdBlock')||!/^\d+(\.\d+)*$/.test(manifest.version))throw Error('不是支持的净网扩展');
const root=path.resolve(__dirname,'../data/browser-extensions');
fs.mkdirSync(root,{recursive:true});
const destination=path.join(root,'netblock-'+manifest.version);
if(!fs.existsSync(destination))fs.cpSync(source,destination,{recursive:true});
fs.writeFileSync(path.join(root,'netblock.json'),JSON.stringify({enabled:true,path:path.basename(destination)},null,2));
console.log('已配置净网 '+manifest.version+'；新任务使用独立浏览器及均衡默认设置。');
