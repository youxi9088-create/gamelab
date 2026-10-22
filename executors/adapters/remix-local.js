// Platform-owned offline Remix host. No gameplay values or outcomes are injected.
(()=>{
 const events=new Map(),key='gamelab-remix:'+location.pathname;
 const on=(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);};
 const emit=(name,data)=>{for(const fn of events.get(name)||[])fn(data);};
 let saved=null;try{saved=JSON.parse(localStorage.getItem(key)||'null');}catch{}
 const player={id:'local',name:'本地玩家',purchasedItems:[]};
 const info=()=>({players:[player],player,shopItems:[],viewContext:'full_screen',contentSafeAreaInset:{top:0,right:0,bottom:0,left:0},initialGameState:saved==null?null:{gameState:saved}});
 const gameOver=({score})=>{
  document.getElementById('gamelab-result')?.remove();
  const panel=document.createElement('section');panel.id='gamelab-result';
  panel.style.cssText='position:fixed;inset:0;z-index:2147483647;display:grid;place-content:center;gap:16px;text-align:center;background:#101827de;color:white;font:20px sans-serif';
  const title=document.createElement('h2');title.textContent='本局结束';
  const value=document.createElement('p');value.textContent='得分：'+(Number.isFinite(score)?score:'未提供');
  const button=document.createElement('button');button.id='gamelab-restart';button.textContent='再玩一次';button.style.cssText='padding:16px;font:inherit;cursor:pointer';
  button.onclick=()=>{panel.remove();emit('play_again',{});};panel.append(title,value,button);document.body.append(panel);
 };
 const sdk={ready:async()=>info(),on,off:(name,fn)=>events.get(name)?.delete(fn),
  onPlayAgain:fn=>on('play_again',fn),onToggleMute:fn=>on('toggle_mute',fn),onGameInfo:fn=>on('game_info',fn),onGameStateUpdated:fn=>on('game_state_updated',fn),
  purchase:async()=>({success:false}),singlePlayer:{actions:{gameOver,
   saveGameState:({gameState})=>{localStorage.setItem(key,JSON.stringify(gameState));saved=gameState;},
   ready:()=>{},hapticFeedback:()=>{}}}};
 window.RemixSDK=window.FarcadeSDK=sdk;
})();
