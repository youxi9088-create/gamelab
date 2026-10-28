// Ghostery network filtering within the existing security routes, never a
// second page.route() that could bypass offline isolation or navigation checks.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {FiltersEngine,Request}=require('@ghostery/adblocker');
let cached;
const digest=data=>crypto.createHash('sha256').update(data).digest('hex');
function engine(){
 if(cached)return cached;
 const root=path.join(__dirname,'adblock-lists'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
 const lists=manifest.lists.map(item=>{const data=fs.readFileSync(path.join(root,item.file));if(digest(data)!==item.sha256)throw Error('广告过滤规则哈希不匹配：'+item.file);return data.toString('utf8')});
 cached={blocker:FiltersEngine.parse(lists.join('\n'),{loadCosmeticFilters:false,enableCompression:false,debug:true}),manifest};
 return cached;
}
function publicURL(value){try{const u=new URL(value);return u.origin+u.pathname}catch{return ''}}
function createAdblock(report,sourceURL,{blocker,manifest,enabled=process.env.GAMELAB_ADBLOCK!=='0'}={}){
 if(enabled&&!blocker)({blocker,manifest}=engine());
 const evidence=report.adblock={enabled,engine:'Ghostery Adblocker',version:manifest?.version||'fixture',
  rules:manifest?.lists?.map(({file,sha256})=>({file,sha256}))||[],blocked_count:0,blocked:[],exceptions:[],
  scope:'Network ads/tracking only; no cosmetic injection, redirects, fake SDK success or gameplay acceptance'};
 const seen=new Set();
 return {evidence,block(req,{url=req.url(),source=sourceURL,mainFrame}={}){
  if(!enabled||!/^https?:/.test(url))return false;
  if(mainFrame===undefined){try{mainFrame=req.isNavigationRequest()&&!req.frame().parentFrame()}catch{mainFrame=false}}
  if(mainFrame)return false; // Navigation enforcement belongs to the original verifier.
  const type=req.resourceType()==='document'?'sub_frame':req.resourceType();
  const result=blocker.match(Request.fromRawDetails({url,sourceUrl:source,type}));
  if(result.exception&&evidence.exceptions.length<50)evidence.exceptions.push({url:publicURL(url),rule:result.exception.toString()});
  if(!result.match)return false;
  evidence.blocked_count++;
  const key=type+' '+publicURL(url);
  if(!seen.has(key)&&evidence.blocked.length<200){seen.add(key);evidence.blocked.push({url:publicURL(url),type,method:req.method(),rule:result.filter?.toString()||'matched network filter'});}
  return true;
 }};
}
module.exports={createAdblock,engine};
