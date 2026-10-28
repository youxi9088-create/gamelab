// HGD resolves static references; existing platform transport enforces origins,
// limits, immutable originals, hashes, and offline verification.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
function extract(documents){
 const result=spawnSync(process.env.GAMELAB_PYTHON||'python',[path.join(__dirname,'html_game_downloader.py')],
  {input:JSON.stringify({documents}),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true});
 try {if(result.error||result.status!==0)throw Error();return JSON.parse(result.stdout);}
 catch{return {tool:'HtmlGameDownloader',status:'unavailable',reason:'Python bridge failed',references:[]};}
}
function selectReferences(result,base,missing){
 const origin=new URL(base),wanted=missing?new Set(missing.map(p=>decodeURIComponent(p.split('?')[0]))):null;
 const selected=[];
 for(const ref of result.references||[]){
  try{const u=new URL(ref.url);if(u.origin!==origin.origin||!u.pathname.startsWith(origin.pathname)||u.username||u.password)continue;
   const relative=decodeURIComponent(u.pathname.slice(origin.pathname.length));
   if(!relative||relative.split('/').some(p=>p==='..'||p==='.')||/[\\\x00:]/.test(relative))continue;
   if(wanted&&!wanted.has('/'+relative))continue;
   if(!selected.some(x=>x.url===u.href))selected.push({url:u.href,path:relative,source:ref.source});
  }catch{}
 }
 return selected.slice(0,64);
}
function plan(run,acq,missing){
 if(!missing?.length)return {status:'skipped',reason:'no observed missing resources',references:[]};
 const root=path.join(run,'converted'),base=new URL('.',acq.url).href,documents=[];let bytes=0;
 const candidates=[{path:'index.html',url:acq.url},...(acq.files||[]).filter(f=>/\.(html|js|css|json)$/i.test(f.path))];
 for(const file of candidates){
  const p=path.resolve(root,file.path);if(!p.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(p))continue;
  const size=fs.statSync(p).size;if(size>300000||bytes+size>1000000)continue;
  documents.push({url:file.url,text:fs.readFileSync(p,'utf8')});bytes+=size;if(documents.length===20)break;
 }
 const lock=fs.readFileSync(path.join(__dirname,'html-game-downloader.lock.json'),'utf8');
 const key=crypto.createHash('sha256').update(JSON.stringify({documents,missing,lock})).digest('hex');
 const cache=path.join(run,'html-game-downloader-plan.json');
 if(fs.existsSync(cache)){try{const old=JSON.parse(fs.readFileSync(cache));if(old.key===key&&old.status==='completed')return old;}catch{}}
 const result=extract(documents),report={...result,key,references:selectReferences(result,base,missing),reason:'observed missing resources; match source references only'};
 fs.writeFileSync(cache,JSON.stringify(report,null,2));return report;
}
module.exports={extract,selectReferences,plan};
