// Remove original platform providers, retaining exact required ABI traps only.
// Native instruction-level audit proves those imports have no remaining callers.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json')),P=lib('@babel/parser'),T=lib('@babel/traverse').default;
const b='deployment-packages/msn-capture-100',dir=b+'/source-analysis/gunship',s=fs.readFileSync(b+'/msn-en-us/originals/9nvh11mzqtwq/Build/Build.framework.js','utf8'),a=P.parse(s),edits=[],retired=[];
T(a,{FunctionDeclaration(p){if(/^_MSstart_/.test(p.node.id.name)&&p.node.id.name!=='_MSstart_FocusCanvas'){retired.push(p.node.id.name);edits.push({start:p.node.start,end:p.node.end,replacement:'',reason:'Remove actual platform cloud/ad/telemetry implementation'});p.skip();}}});
if(retired.length!==4)throw Error('Unknown original platform ABI');const bindings=[];
T(a,{ObjectProperty(p){if(p.node.value.type==='Identifier'&&retired.includes(p.node.value.name)){bindings.push({key:p.node.key.value??p.node.key.name,original:p.node.value.name});edits.push({start:p.node.value.start,end:p.node.value.end,replacement:'_retiredExternalCapability',reason:'Exact required ABI resolves only to a throwing trap; never returns a fake result/callback'});}}});
if(bindings.length!==4)throw Error('Unknown bindings');edits.sort((a,b)=>a.start-b.start);for(let i=1;i<edits.length;i++)if(edits[i-1].end>edits[i].start)throw Error('Overlapping source edits');let out=s;for(const e of [...edits].reverse())out=out.slice(0,e.start)+e.replacement+out.slice(e.end);
out='function _retiredExternalCapability(){throw new Error("Retired external capability unexpectedly invoked");}\n'+out;P.parse(out);
if(/\$msstart|OnCloudDataLoaded|OnCloudDataLoadFailed|OnAdComplete|OnCloudDataSaved|OnCloudDataSaveFailed/.test(out))throw Error('Unretired provider/result callback source');
let preserved=0;T(a,{Function(p){if(edits.some(e=>p.node.start<e.end&&p.node.end>e.start))return;if(!out.includes(s.slice(p.node.start,p.node.end)))throw Error('Unrelated engine function changed');preserved++;}});
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');fs.writeFileSync(dir+'/service-retired.framework.js',out);
fs.writeFileSync(dir+'/framework-retirement-proof.json',JSON.stringify({source_only:true,native_executed:false,original_sha256:sha(s),derived_sha256:sha(out),retired,bindings,edits,unrelated_engine_functions_exact:preserved,original_canvas_focus_preserved:true,SDK_facade_created:false,SDK_callbacks_or_success_synthesized:false},null,2));console.log(JSON.stringify({retired:4,engine_functions_exact:preserved}));
