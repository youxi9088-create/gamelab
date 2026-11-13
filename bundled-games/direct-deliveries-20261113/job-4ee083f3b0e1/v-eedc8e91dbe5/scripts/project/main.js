/* Local storage/lifecycle for the original Construct game. No platform SDK. */
(()=>{
 let runtime=null,dialogActive=false,playing=false,loadingFinished=false;
 const prefix='aidan/local/v1/';
 window.AidanLocalStorage={
  getItem(key){return localStorage.getItem(prefix+String(key));},
  setItem(key,value){localStorage.setItem(prefix+String(key),String(value));},
  removeItem(key){localStorage.removeItem(prefix+String(key));},
  clear(){for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith(prefix))localStorage.removeItem(k);}}
 };
 window.AidanLocalRewardGranted=0;window.AidanLocalRewardContext='';window.AidanLocalBreakContext='';
 function call(name){if(runtime?.callFunction)runtime.callFunction(name);}
 window.AidanLocalLifecycle={
  async init(){},bindRuntime(value){runtime=value;},
  finishLoading(){loadingFinished=true;},armGameplay(){playing=true;},gameplayStart(){playing=true;},gameplayStop(){playing=false;},enterNonGameplay(){playing=false;},
  async resumeLocalTransition(keepMutedAfter=false){if(!keepMutedAfter)call('CrazyAdAudioEnd');},
  async requestCurrentLocalReward(context){
   if(dialogActive)return false;
   dialogActive=true;window.AidanLocalRewardGranted=0;
   const previousScale=runtime?.timeScale;if(runtime)runtime.timeScale=0;
   try{return await new Promise(resolve=>window.gamelabChooseLocalReward(resolve));}
   finally{if(runtime&&previousScale!==undefined)runtime.timeScale=previousScale;dialogActive=false;call('CrazyAdAudioEnd');}
  },
  async showMenuBanner(){},async hideBanners(){},happytime(){},
  getPreferredLanguage(){const language=String(navigator.languages?.[0]||navigator.language||'en').toLowerCase().split(/[-_]/)[0];return language==='pt'?2:language==='es'?1:0;},
  getSystemInfo(){return null;},
  get ready(){return true;},get adPlaying(){return dialogActive;},get gameplayActive(){return playing;},get platformMuteAudio(){return false;}
 };
})();
