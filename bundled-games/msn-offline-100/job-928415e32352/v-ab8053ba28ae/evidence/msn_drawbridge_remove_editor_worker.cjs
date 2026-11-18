// Source-only removal of a publisher editor branch absent from this HTML5 export.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{createRequire}=require('module');
const rq=createRequire(path.resolve('gamelab/executors/package.json')),lib=createRequire(rq.resolve('rea-agents/package.json')),P=lib('@babel/parser'),T=lib('@babel/traverse').default,G=lib('@babel/generator').default;
const r=path.resolve('deployment-packages/msn-capture-100/source-analysis/drawbridge'),source=fs.readFileSync(path.join(r,'offline-main.js'),'utf8'),tree=P.parse(source,{sourceType:'unambiguous'}),matches=[];
T(tree,{IfStatement(q){const text=source.slice(q.node.start,q.node.end);if(text.includes('new Worker("previewworker.js"'))matches.push(q.node);}});
if(matches.length!==1)throw Error('Expected one isolated publisher editor-worker branch');
const n=matches[0],test=G(n.test,{compact:true,comments:false}).code;
if(test!=='this._exportType==="preview"'||!n.alternate)throw Error('Unexpected editor condition');
const html5=source.slice(n.alternate.start,n.alternate.end);
if(!html5.startsWith('this._worker=await this.CreateWorker('))throw Error('Original HTML5 worker body mismatch');
if(!source.includes('const enableWorker=false')||!source.includes('exportType:"html5"'))throw Error('Original HTML5 export configuration missing');
const result=source.slice(0,n.start)+html5+source.slice(n.end);
P.parse(result,{sourceType:'unambiguous'});
if(result.includes('previewworker.js'))throw Error('Editor worker dependency survived');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync(path.join(r,'offline-main-no-editor.js'),result);
fs.writeFileSync(path.join(r,'editor-worker-retirement-proof.json'),JSON.stringify({source_only:true,native_or_SDK_executed:false,UI_inputs:0,original_main_after_service_retirement_sha256:hash(source),result_sha256:hash(result),original_export_type:'html5',original_main_worker_enabled:false,removed_condition:test,original_HTML5_alternate_byte_exact:html5,all_bytes_outside_one_if_statement_exact:true,reason:'Original published previewworker.js is404. It belongs only to the publisher editor-preview mode. Resolve the original HTML5 branch; preserve the original game worker option and complete normal branch. No placeholder or validation exemption.',runtime_verified:false},null,2));
console.log(JSON.stringify({removed_source_characters:n.end-n.start-html5.length,normal_HTML5_branch_byte_exact:true,original_export_type:'html5',UI:0}));
