// Validate bytes only. No compilation/instantiation or native game execution.
const fs=require('fs'),crypto=require('crypto');
const dir='deployment-packages/msn-capture-100/source-analysis/gunship';
const original=fs.readFileSync('deployment-packages/msn-capture-100/msn-en-us/originals/9nvh11mzqtwq/Build/Build.wasm'),derived=fs.readFileSync(dir+'/service-retired.wasm');
const result={source_only:true,native_executed:false,original_valid:WebAssembly.validate(original),derived_valid:WebAssembly.validate(derived),original_sha256:crypto.createHash('sha256').update(original).digest('hex'),derived_sha256:crypto.createHash('sha256').update(derived).digest('hex')};
fs.writeFileSync(dir+'/wasm-structure-validation.json',JSON.stringify(result,null,2));if(!result.original_valid||!result.derived_valid)throw Error('WASM structural validation failed');console.log(JSON.stringify(result));
