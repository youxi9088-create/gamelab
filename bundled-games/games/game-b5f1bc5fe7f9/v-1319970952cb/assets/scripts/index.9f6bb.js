require('subpackages/scripts/game.js');
window.installLocalFeatures();
const platform=window.__require('Platform').platform;
const serverMode=new URLSearchParams(location.search).get('localBackend')==='1';
const localBackend=true;
const baseURL=new URL('./',location.href).href;
let staticService;
if(!serverMode){staticService=Promise.all([fetch(new URL('local-config.json',baseURL)).then(r=>r.json()),fetch(new URL('local-player-template.json',baseURL)).then(r=>r.json())]).then(([config,template])=>createLocalCampaign({config,template,storage:localStorage}));}
const localLogin=()=>serverMode?fetch('/api/basic/login').then(r=>r.json()):staticService.then(s=>s.dispatch('/basic/login','',baseURL.replace(/\/$/,'')));
const options=localBackend?{login(success,fail){localLogin().then(r=>{if(r.errcode!==0)throw Error(r.errmsg);success({code:'local-profile',sdk_token:r.data.token,uid:r.data.uid,cp_uid:r.data.uid,channel:'local'});}).catch(fail||console.error);}}:{};
platform._instance=Object.assign(Object.create(platform.api),window.createBrowserPlatform(options));
if(localBackend){
 window.__require('Global').default.isEncryp=false;
 window.__require('ServerMsg').ServerMsg.path=location.origin+'/api';
 platform._instance.createRole=platform._instance.roleLogin=function(){window.replicaPlatformEvidence.push({api:'sdk-role-analytics',status:'not_applicable',reason:'Independent local profile; no remote SDK account'});};
}
if(localBackend){
 window.replicaIntegrationErrors=[];
 const http=window.__require('Http').Http._ins;
 for(const name of ['getReq','postReq']){const original=http[name];http[name]=function(url,data,success,...rest){return original.call(this,url,data,typeof success==='function'?function(value){try{window.replicaIntegrationErrors.push({type:'callback-enter',url});const result=success(value);window.replicaIntegrationErrors.push({type:'callback-exit',url});return result;}catch(e){window.replicaIntegrationErrors.push({url,message:e.message,stack:e.stack});throw e;}}:success,...rest);};}
}
if(localBackend){
 const previousWarn=cc.warn;cc.warn=function(...args){window.replicaIntegrationErrors.push({type:'cocos-warning',message:args.map(String).join(' ').slice(0,2500)});return previousWarn.apply(this,args);};
}
if(localBackend){
 const sharing=window.__require('ShareManager').default._ins;
 const initializeSharing=sharing.init;
 sharing.init=function(){
  if(!window.__require('GameData').GameData.PlayerData.shareConfigs?.length){window.replicaPlatformEvidence.push({api:'wechat-sharing',status:'not_applicable',reason:'No WeChat sharing channel configured for local profile'});return;}
  return initializeSharing.apply(this,arguments);
 };
}

// Local campaign adapter: authentication stays on the loopback origin.
if(localBackend){
 for(const name of ['getReq','postReq']){const original=__require('Http').Http._ins[name];__require('Http').Http._ins[name]=function(url,data,...rest){const token=__require('GameData').GameData.PlayerData?.token;if(token)data=(data?data+'&':'')+'local_session='+encodeURIComponent(token);return original.call(this,url,data,...rest);};}
 __require('Socket').Socket.prototype.connect=function(){window.replicaPlatformEvidence.push({api:'multiplayer-socket',status:'unavailable',reason:'Local campaign has no multiplayer or guild service'});};
}

if(localBackend){platform._instance.triggerGC=function(){window.replicaPlatformEvidence.push({api:'triggerGC',status:'not_applicable',reason:'Browser manages garbage collection'});};}

if(!serverMode){
 let sequence=Promise.resolve();
 const http=__require('Http').Http._ins;
 for(const method of ['getReq','postReq'])http[method]=function(url,data,success,failure){
  sequence=sequence.then(async()=>{
   const service=await staticService;
   const token=__require('GameData').GameData.PlayerData?.token;
   const args=new URLSearchParams(data||'');if(token)args.set('local_session',token);
   const response=service.dispatch(url,args.toString(),baseURL.replace(/\/$/,''));
   window.replicaLocalEvents??=[];window.replicaLocalEvents.push({route:url,code:response.errcode,time:Date.now()});
   __require('ViewManager').ViewManager._ins.hideHttpLoading();
   if(response.errcode===0){success?.(response.data);}else{__require('Toast').default.show(response.errmsg);failure?.(response);}
  }).catch(e=>{window.replicaIntegrationErrors.push({url,message:e.message,stack:e.stack});console.error(e);failure?.(e);});
 };
 __require('FightView').default.prototype.antiCheck=function(){window.replicaLocalEvents.push({route:'local-anti-cheat',status:'unavailable',reason:'Local campaign trusts client combat result'});};
}
if(localBackend){
 __require('MainChatNode').default.initChatMsg=function(){window.replicaPlatformEvidence.push({api:'chat',status:'unavailable',reason:'Local campaign has no chat service'});};
}
