// Actual local run-state storage. Paid goods and network rooms are unavailable.
const KEY='gamelab:cylinder-jumper:186d0387-ea06-4c23-ba67-2728ca298543:v1';
const SAFE=Object.freeze({top:0,right:0,bottom:0,left:0});
export class LocalRunSession {
 #data=null;#ended=new Set();#mute=false;#disposed=false;#again=new Set();#mutes=new Set();#safe=new Set();
 constructor(){try{this.#data=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}}
 static async create(){return new LocalRunSession();}
 finishRun(result,state){if(this.#disposed||this.#ended.has(result.runId))return;this.#ended.add(result.runId);this.saveGameState(state);}
 getContentSafeAreaInset(){return SAFE;}
 getContinueOffer(){return null;}
 getStoreItem(){return null;}
 ownsStoreItem(){return false;}
 async purchaseStoreItem(){return {item:null,status:'unavailable'};}
 hapticFeedback(){if(!this.#disposed&&navigator.vibrate)navigator.vibrate(12);}
 isInputBlocked(){return this.#disposed;}
 loadGameState(){return this.#data;}
 saveGameState(state){if(this.#disposed)return;localStorage.setItem(KEY,JSON.stringify(state));this.#data=state;}
 onContentSafeAreaChange(fn){this.#safe.add(fn);fn(SAFE);return()=>this.#safe.delete(fn);}
 onMuteChange(fn){this.#mutes.add(fn);fn(this.#mute);return()=>this.#mutes.delete(fn);}
 onPlayAgain(fn){this.#again.add(fn);return()=>this.#again.delete(fn);}
 setMuted(value){if(this.#disposed||this.#mute===value)return;this.#mute=value;for(const fn of this.#mutes)fn(value);}
 dispose(){this.#disposed=true;this.#safe.clear();this.#mutes.clear();this.#again.clear();}
}
