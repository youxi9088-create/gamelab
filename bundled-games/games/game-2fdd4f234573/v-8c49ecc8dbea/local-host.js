/* Local host contract. Original game rules stay in game.js. No online score submission. */
(()=>{
 const key='game-lab:'+window.localHostIdentity;
 window.lib={
  getAsset(id){return window.localAssetMap[id]},
  log(...args){console.info('[game]',...args)},
  shouldUseTouchControls(){return matchMedia('(pointer:coarse)').matches},
  showGameParameters(){},
  async getUserGameState(){const value=localStorage.getItem(key);return {state:value?JSON.parse(value):null}},
  async saveUserGameState(state){localStorage.setItem(key,JSON.stringify(state));return {saved:true}},
  async addPlayerScoreToLeaderboard(){throw Error('Online leaderboard unavailable in local edition')}
 };
 addEventListener('DOMContentLoaded',()=>{
  if(typeof window.run!=='function')throw Error('Missing host run entry');
  Promise.resolve(window.run('play')).catch(e=>{console.error(e);window.localHostError=String(e)});
 });
})();
