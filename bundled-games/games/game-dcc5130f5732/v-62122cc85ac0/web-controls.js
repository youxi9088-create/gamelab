(() => {
  const selector=document.querySelector('#level'),restart=document.querySelector('#restart'),status=document.querySelector('#status');
  for(let i=1;i<=20;i++)selector.add(new Option(`第 ${i} 关`,String(i)));
  let busy=true,lastLevel=0,keys=new Set(),muted=localStorage.getItem('web-muted')==='true';
  const ready=()=>window.webGame?.Scene.Scene && webGame.World.Owner && webGame.UI.Unique?.BtnTransparent;
  const sound=()=>{Laya.SoundManager.musicMuted=muted;Laya.SoundManager.soundMuted=muted;document.querySelector('#mute').textContent=muted?'开启声音':'关闭声音';document.querySelector('#mute').setAttribute('aria-pressed',String(muted));};sound();
  document.querySelector('#mute').onclick=()=>{muted=!muted;localStorage.setItem('web-muted',String(muted));sound();};
  function loadLevel(level){
    if(busy||!ready())return;
    busy=true;keys.clear();selector.disabled=restart.disabled=true;
    webGame.Util.SetNumber('Level',level);
    webGame.UI.HidePassed();webGame.UI.HideFailed();webGame.World.Init();webGame.Scene.RestartLevel();
    document.querySelector('#controls').open=false;
  }
  selector.onchange=()=>loadLevel(Number(selector.value));restart.onclick=()=>loadLevel(webGame.Game.RealLevel);
  function start(){if(ready()&&webGame.UI.Unique.BtnTransparent.visible)webGame.UI.onBtnTransparentClick();}
  window.addEventListener('keydown',e=>{if(['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;if(['ArrowLeft','ArrowRight','a','d','A','D',' '].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());if(e.key===' ')start();}});
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
  let previous=performance.now();
  function tick(now){const dt=Math.min((now-previous)/1000,.05);previous=now;
    if(ready()){
      if(busy){busy=false;selector.disabled=restart.disabled=false;document.querySelector('#loading').style.display='none';}
      const level=webGame.Game.RealLevel;if(level!==lastLevel){lastLevel=level;selector.value=String(level);}status.textContent=`第 ${level} 关`;
      if(!webGame.UI.Unique.BtnTransparent.visible&&!webGame.UI.Unique.BgGray.active){const left=keys.has('arrowleft')||keys.has('a'),right=keys.has('arrowright')||keys.has('d');if(left!==right)webGame.World.MoveX((left?1:-1)*dt*2.5);}
    }
    requestAnimationFrame(tick);
  }requestAnimationFrame(tick);
})();
