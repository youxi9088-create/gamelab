// Isolated per-task persistent contexts: extension files only, never a personal profile.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const CONFIG=path.resolve(__dirname,'../data/browser-extensions/netblock.json');
async function launchBrowser(report,{configFile=process.env.GAMELAB_EXTENSION_CONFIG||CONFIG}={}){
 const config=fs.existsSync(configFile)?JSON.parse(fs.readFileSync(configFile,'utf8')):null;
 if(!config?.enabled||process.env.GAMELAB_NETBLOCK==='0')return chromium.launch(require('./browser-options.cjs')());
 const extension=path.resolve(path.dirname(configFile),config.path);
 const manifest=JSON.parse(fs.readFileSync(path.join(extension,'manifest.json'),'utf8'));
 if(manifest.manifest_version!==3||!manifest.name.startsWith('净网 AdBlock'))throw Error('净网扩展配置不匹配');
 const evidence=report.browser_extension={name:manifest.name,version:manifest.version,loaded:false,settings:'dedicated balanced defaults',blocked_count:0,blocked:[],client_blocked_requests:[]};
 let context;
 return {
  async newContext(options){
   if(context)throw Error('Extension browser supports one isolated context');
   const {storageState,...rest}=options;
   context=await chromium.launchPersistentContext('',{...rest,headless:true,channel:'chromium',args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
   try{
    const worker=context.serviceWorkers().find(w=>w.url().startsWith('chrome-extension://'))||await context.waitForEvent('serviceworker',{predicate:w=>w.url().startsWith('chrome-extension://'),timeout:15000});
    // Await rule synchronization, not just the worker's creation event.
    await worker.evaluate(async()=>{
     for(let i=0;i<100;i++){
      if((await chrome.declarativeNetRequest.getDynamicRules()).length)return;
      await new Promise(resolve=>setTimeout(resolve,100));
     }
     throw Error('净网动态规则未就绪');
    });
    evidence.loaded=true;
    evidence.rule_count=await worker.evaluate(async()=>(await chrome.declarativeNetRequest.getDynamicRules()).length);
    // Preserve the verifier's navigation evidence; don't let native DNR hide it.
    await worker.evaluate(()=>chrome.declarativeNetRequest.updateSessionRules({removeRuleIds:[1000000],addRules:[{id:1000000,priority:1000000,action:{type:'allow'},condition:{resourceTypes:['main_frame']}}]}));
    if(storageState){
     const state=typeof storageState==='string'?JSON.parse(fs.readFileSync(storageState,'utf8')):storageState;
     if(typeof context.setStorageState!=='function')throw Error('Persistent browser requires setStorageState support');
     await context.setStorageState(state);
    }
    // Route.fetch bypasses browser DNR. Ask the actual extension's DNR engine
    // before fetching, so capture and offline verification use the same rules.
    context.extensionBlock=async(req,{url=req.url(),source,mainFrame}={})=>{
     if(mainFrame===undefined){try{mainFrame=req.isNavigationRequest()&&!req.frame().parentFrame()}catch{mainFrame=false}}
     if(mainFrame||!/^https?:/.test(url))return false;
     let initiator=source;try{initiator ||= req.frame().url()}catch{}
     if(!/^https?:/.test(initiator||''))initiator=undefined;
     const types={document:'sub_frame',fetch:'xmlhttprequest',xhr:'xmlhttprequest',eventsource:'xmlhttprequest'};
     const rawType=types[req.resourceType()]||req.resourceType();
     const type=['sub_frame','font','image','media','other','ping','script','stylesheet','websocket','xmlhttprequest'].includes(rawType)?rawType:'other';
     const matches=await worker.evaluate(async details=>{
      const result=await chrome.declarativeNetRequest.testMatchOutcome(details);
      const rules=await chrome.declarativeNetRequest.getDynamicRules();
      const matched=result.matchedRules.map(m=>rules.find(r=>r.id===m.ruleId)).filter(Boolean);
      if(matched.some(r=>r.action.type==='allow'||r.action.type==='allowAllRequests'))return [];
      return matched.filter(r=>r.action.type==='block').map(r=>r.id);
     },{url,initiator,type,method:req.method().toLowerCase()});
     if(!matches.length)return false;
     evidence.blocked_count++;
     if(evidence.blocked.length<200){const u=new URL(url);evidence.blocked.push({url:u.origin+u.pathname,type,rules:matches});}
     return true;
    };
    // Native DNR can reject a request before Playwright's route callback.
    // Keep these separately: ERR_BLOCKED_BY_CLIENT alone cannot identify which filter blocked it.
    context.on('requestfailed',req=>{
     if(req.failure()?.errorText!=='net::ERR_BLOCKED_BY_CLIENT'||evidence.client_blocked_requests.length>=200)return;
     try{const u=new URL(req.url());evidence.client_blocked_requests.push({url:u.origin+u.pathname,type:req.resourceType()});}catch{}
    });
    return context;
   }catch(error){await context.close();throw error;}
  },
  async close(){if(context){await context.unrouteAll({behavior:'wait'});await context.close();}}
 };
}
module.exports={launchBrowser,CONFIG};
