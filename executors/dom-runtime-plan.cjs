const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function observedDOMPlan(input,run,html,prior){
 const e=input.entry_evidence||{};
 if(e.evidence!=='interactive-dom'||e.interaction_verified!==true||typeof e.interaction_evidence!=='string')return null;
 const root=path.resolve(run),base=path.join(root,'entry-probes'),proof=path.resolve(root,e.interaction_evidence);
 if(!proof.startsWith(base+path.sep)||!fs.existsSync(proof)||fs.statSync(proof).size>2000000)return null;
 for(let p=proof;p!==root;p=path.dirname(p)){if(fs.lstatSync(p).isSymbolicLink())return null;}
 const bytes=fs.readFileSync(proof);let result;try{result=JSON.parse(bytes)}catch{return null}
 if(result.passed!==true||result.url!==input.url||result.kind==='canvas-entry')return null;
 if(prior&&!['browser','browser-dom'].includes(prior.engine))return null;
 return {engine:'browser-dom',sdk:prior?.sdk||null,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),
  dom_evidence_sha256:crypto.createHash('sha256').update(bytes).digest('hex'),scope:'Observed DOM entry only; offline gameplay verification remains required'};
}
module.exports={observedDOMPlan};
