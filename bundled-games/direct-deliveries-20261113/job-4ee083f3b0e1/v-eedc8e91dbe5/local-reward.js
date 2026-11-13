/* Explicit local reward UI; no platform SDK object or fabricated account. */
(()=>{let active=false;
window.gamelabChooseLocalReward=done=>{
 if(active){done(false);return;}active=true;
 const d=document.createElement('dialog');d.style.cssText='padding:24px;max-width:360px;background:#27252c;color:#fff;border:2px solid #d7c96b;font:18px system-ui';
 const h=document.createElement('h2');h.textContent='本地领取';const p=document.createElement('p');p.textContent='离线版本不播放广告。是否领取刚才选择的这一项奖励？';
 const no=document.createElement('button');no.textContent='取消';const yes=document.createElement('button');yes.textContent='领取当前奖励';
 let finished=false;const end=ok=>{if(finished)return;finished=true;active=false;d.close();d.remove();done(ok);};
 no.onclick=()=>end(false);yes.onclick=()=>end(true);d.oncancel=e=>{e.preventDefault();end(false);};
 for(const b of [no,yes])b.style.cssText='padding:12px;margin:8px;font:inherit';d.append(h,p,no,yes);document.body.append(d);d.showModal();no.focus();
};})();
