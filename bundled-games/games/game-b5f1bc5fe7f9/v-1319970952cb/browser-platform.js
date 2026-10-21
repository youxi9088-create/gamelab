/* Browser equivalents for lifecycle/system APIs. Login requires an explicit provider. */
(function(root){
 const events=[];root.replicaPlatformEvidence=events;
 const record=(api,status,reason)=>events.push({api,status,reason,time:Date.now()});
 const system=()=>({platform:'browser',system:navigator.platform,language:navigator.language,pixelRatio:devicePixelRatio,windowWidth:innerWidth,windowHeight:innerHeight,screenWidth:screen.width,screenHeight:screen.height,safeArea:{left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight}});
 root.createBrowserPlatform=function(options={}){return {
  onCheckForUpdate(){record('onCheckForUpdate','not_applicable','Browser deployment uses page reload; no WeChat updater.');},
  getSystemInfo(success,fail,complete){const info=system();success?.(info);complete?.(info);record('getSystemInfo','adapted','Browser viewport and navigator');},
  getSystemInfoSync:system,
  getSetting(callback){record('getSetting','not_applicable','WeChat subscriptions are unavailable in a browser');callback?.({mainSwitch:false,itemSettings:{}});},
  onShow(callback){document.addEventListener('visibilitychange',()=>{if(!document.hidden)callback({query:{}});});},
  onHide(callback){document.addEventListener('visibilitychange',()=>{if(document.hidden)callback({});});},
  getLaunchOptionsSync(){return {query:Object.fromEntries(new URLSearchParams(location.search))};},
  onMemoryWarning(){record('onMemoryWarning','not_applicable','No portable browser memory warning API');},
  catchError(){root.addEventListener('error',event=>record('runtime','error',event.message));},
  login(success,fail){
   if(!options.login){const reason='缺少本地登录服务及玩家初始数据契约；未调用原厂 SDK，未伪造登录成功。';record('login','blocked',reason);root.dispatchEvent(new CustomEvent('replica-dependency-blocked',{detail:{dependency:'login',reason}}));fail?.({message:reason});return;}
   return options.login(success,fail);
  }
 };};
})(window);
