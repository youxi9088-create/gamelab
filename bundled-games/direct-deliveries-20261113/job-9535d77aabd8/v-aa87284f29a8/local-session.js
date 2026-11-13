// A local run lifecycle. Receives only the native result and emits actual player retry.
const KEY='gamelab:hyper-strike:329c6268-be41-4e0e-a00b-47253ebfef89:v1';
const SAFE={top:0,right:0,bottom:0,left:0};
export function createLocalSession(){
 let over=false,panel=null,saved=null;const again=new Set(),mute=new Set(),info=new Set();
 try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
 const on=(set,fn)=>{set.add(fn);return()=>set.delete(fn);};
 return {
  get state(){return saved;},get info(){return null;},get isOver(){return over;},
  async ready(){return {contentSafeAreaInset:SAFE};},
  saveState(value){localStorage.setItem(KEY,JSON.stringify(value));saved=value;},
  onPlayAgain:fn=>on(again,fn),onToggleMute:fn=>on(mute,fn),onGameInfo:fn=>on(info,fn),
  rearm(){over=false;panel?.remove();panel=null;},
  haptic(){if(navigator.vibrate)navigator.vibrate(12);},
  gameOver(score){
   if(over)return;if(!Number.isFinite(score)||score<0)throw Error('Invalid native score');over=true;
   panel=document.createElement('section');panel.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:1000;padding:14px 22px;border:1px solid #6ae8ff;background:#081425e8;color:#d9faff;text-align:center;font:16px monospace';
   const result=document.createElement('p');result.textContent=`本局结束 · ${score} 分`;
   const retry=document.createElement('button');retry.textContent='再玩一次';retry.style.cssText='padding:10px 24px;background:#0c344f;color:#d9faff;border:1px solid #6ae8ff;font:inherit;cursor:pointer';retry.onclick=()=>{panel?.remove();panel=null;for(const fn of again)fn();};
   panel.append(result,retry);document.body.append(panel);
  }
 };
}
