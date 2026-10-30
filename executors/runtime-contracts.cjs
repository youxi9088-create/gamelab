// Declarative capability selection. No title/ID routing or executable learned rules.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const registry=require('./runtime-contracts.json');
function match(html,ruleset=registry){
 const features=Object.fromEntries(Object.entries(ruleset.features).map(([id,pattern])=>[id,new RegExp(pattern,'i').test(html)]));
 if(ruleset.features['remix-sdk'])features['remix-sdk']=[...html.matchAll(new RegExp(ruleset.features['remix-sdk'],'gi'))].length===1;
 const evaluated=ruleset.rules.map(rule=>({...rule,missing:rule.requires.filter(f=>!features[f]),conflicts:(rule.excludes||[]).filter(f=>features[f])}));
 const eligible=evaluated.filter(r=>!r.missing.length&&!r.conflicts.length),selected=[],ambiguous=[];
 for(const group of new Set(eligible.map(r=>r.group))){
  const candidates=eligible.filter(r=>r.group===group).sort((a,b)=>b.priority-a.priority);
  const best=candidates.filter(r=>r.priority===candidates[0].priority);
  if(best.length===1)selected.push(best[0]);else ambiguous.push({group,ids:best.map(r=>r.id)});
 }
 const loader=selected.find(r=>r.group==='loader');
 return {schema:1,registry_revision:ruleset.revision,features,selected:selected.map(({id,version,group,adapter,provides,requires})=>({id,version,group,adapter,provides,evidence:requires})),
  ambiguous,rejected:evaluated.filter(r=>r.missing.length||r.conflicts.length).map(({id,missing,conflicts})=>({id,missing,conflicts})),
  engine:loader?.adapter||(features.script?'browser':null),
  status:loader?'matched':features.script?'exploring':'entry-unconfirmed',
  candidate:!loader&&features.script?{status:'unverified',features:Object.keys(features).filter(k=>features[k]),scope:'Observed structural features only; no generated adapter, promotion requires regression evidence'}:null};
}
function record(run,html,url){
 const result=match(html),file=path.join(run,'runtime-contract.json');
 const previous=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):null;
 const snapshot={...result,entry:url,source_sha256:crypto.createHash('sha256').update(html).digest('hex'),stage:'entry-observed',verification:'pending',
  history:previous?.history||[]};
 snapshot.history.push({stage:snapshot.stage,registry_revision:result.registry_revision,source_sha256:snapshot.source_sha256,selected:result.selected.map(r=>r.id)});
 fs.writeFileSync(file,JSON.stringify(snapshot,null,2));
 persistObservation(run,snapshot);return snapshot;
}
function persistObservation(run,value){
 // Append-only observations, one file per run/content/stage: no shared JSON
 // overwrite across concurrent workers, no executable rule promotion.
 const parent=path.resolve(run,'..');if(path.basename(parent)!=='runs')return;
 const root=path.join(parent,'contract-observations');fs.mkdirSync(root,{recursive:true});
 const featureKeys=Object.keys(value.features).filter(k=>value.features[k]).sort();
 const family=crypto.createHash('sha256').update(JSON.stringify({features:featureKeys,selected:value.selected.map(r=>[r.id,r.version])})).digest('hex');
 const observation={schema:1,family,features:featureKeys,selected:value.selected,registry_revision:value.registry_revision,
  run:path.basename(run),entry:value.entry,source_sha256:value.source_sha256,stage:value.stage,verification:value.verification,
  candidate:value.candidate,scope:'Structural family observations only; startup and gameplay evidence are separate. Never automatically execute learned code.'};
 const encoded=JSON.stringify(observation,null,2),name=crypto.createHash('sha256').update(encoded).digest('hex')+'.json';
 try{fs.writeFileSync(path.join(root,name),encoded,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;}
}
function update(run,stage,evidence={}){
 const file=path.join(run,'runtime-contract.json');if(!fs.existsSync(file))return;
 const value=JSON.parse(fs.readFileSync(file,'utf8'));
 value.stage=stage;value.history.push({stage,...evidence});
 if(stage==='runtime-verified')value.verification='startup-only';
 if(stage==='runtime-failed')value.verification='failed';
 const encoded=JSON.stringify(value,null,2);fs.writeFileSync(file,encoded);
 const dir=path.join(run,'converted/evidence');if(fs.existsSync(dir))fs.writeFileSync(path.join(dir,'runtime-contract.json'),encoded);
 persistObservation(run,value);
}
module.exports={match,record,update,persistObservation};
if(require.main===module){let input='';process.stdin.setEncoding('utf8');process.stdin.on('data',s=>input+=s);process.stdin.on('end',()=>{const args=JSON.parse(input);process.stdout.write(JSON.stringify(record(args.run,args.html,args.url)));});}
