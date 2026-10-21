document.getElementById('GameDiv').style.width='min(100vw,'+(100*window.WEB_CONFIG.width/window.WEB_CONFIG.height)+'vh)';
window.canvas=document.getElementById('GameCanvas');window.GameGlobal=window;window.global=window;
const noop=()=>{};
const frameSize=()=>({width:Math.min(innerWidth,innerHeight*window.WEB_CONFIG.width/window.WEB_CONFIG.height),height:innerHeight});
const info=()=>({platform:'android',system:'Android Web',brand:'Browser',model:'Web',language:'zh_CN',version:'8.0.0',SDKVersion:'3.0.0',pixelRatio:devicePixelRatio,screenWidth:frameSize().width,screenHeight:innerHeight,windowWidth:frameSize().width,windowHeight:innerHeight,safeArea:{left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight}});
window.wx={getSystemInfoSync:info,getLaunchOptionsSync:()=>({query:{},scene:1001}),getEnterOptionsSync:()=>({query:{},scene:1001}),getAccountInfoSync:()=>({miniProgram:{appId:window.WEB_CONFIG.appid,envVersion:'release',version:'web'}}),createCanvas:()=>document.createElement('canvas'),createImage:()=>new Image(),getStorageSync:k=>{try{return JSON.parse(localStorage.getItem('wechat-web:'+window.WEB_CONFIG.appid+':'+k))??''}catch{return ''}},setStorageSync:(k,v)=>localStorage.setItem('wechat-web:'+window.WEB_CONFIG.appid+':'+k,JSON.stringify(v)),removeStorageSync:k=>localStorage.removeItem('wechat-web:'+window.WEB_CONFIG.appid+':'+k),getBatteryInfoSync:()=>({level:100,isCharging:true}),createWebAudioContext:()=>new AudioContext(),getMenuButtonBoundingClientRect:()=>({left:innerWidth-90,top:12,right:innerWidth-8,bottom:44,width:82,height:32}),loadFont:()=> 'Arial',triggerGC:noop};
wx.request=opts=>{queueMicrotask(()=>{opts.fail?.({errMsg:'Browser edition: remote service unavailable'});opts.complete?.({errMsg:'Browser edition: remote service unavailable'})});return{abort:noop,onHeadersReceived:noop,offHeadersReceived:noop}};
wx.login=opts=>queueMicrotask(()=>opts.fail?.({errMsg:'Browser edition uses local saves'}));
const nativePlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return nativePlay.call(this).catch(e=>{if(e.name==='NotAllowedError'){const retry=()=>nativePlay.call(this).catch(noop);addEventListener('pointerdown',retry,{once:true})}else console.warn(e)})};
for(const n of ['onShow','onHide','onDeviceOrientationChange','onAccelerometerChange','offAccelerometerChange','startAccelerometer','stopAccelerometer','onAudioInterruptionBegin','onAudioInterruptionEnd','setKeepScreenOn','showShareMenu','onShareAppMessage','onAddToFavorites','setPreferredFramesPerSecond','setInnerAudioOption','vibrateShort','vibrateLong','onMemoryWarning'])wx[n]=noop;
wx.onWindowResize=cb=>addEventListener('resize',()=>cb({windowWidth:innerWidth,windowHeight:innerHeight}));
for(const [api,event] of Object.entries({onKeyDown:'keydown',onKeyUp:'keyup',onMouseDown:'mousedown',onMouseMove:'mousemove',onMouseUp:'mouseup',onWheel:'wheel'}))wx[api]=cb=>canvas.addEventListener(event,cb);
for(const [api,event] of Object.entries({onTouchStart:'pointerdown',onTouchMove:'pointermove',onTouchEnd:'pointerup',onTouchCancel:'pointercancel'}))wx[api]=cb=>canvas.addEventListener(event,e=>{if(event==='pointermove'&&!e.buttons)return;if(event==='pointerdown'&&e.isTrusted)canvas.setPointerCapture(e.pointerId);const rect=canvas.getBoundingClientRect();const t={identifier:e.pointerId,clientX:e.clientX-rect.left,clientY:e.clientY-rect.top,pageX:e.pageX-rect.left,pageY:e.pageY-rect.top};cb({changedTouches:[t],touches:event==='pointerup'?[]:[t],timeStamp:e.timeStamp})});
wx.createInnerAudioContext=()=>{const a=new Audio();a.stop=()=>{a.pause();a.currentTime=0};a.seek=t=>a.currentTime=t;a.destroy=()=>{a.pause();a.src=''};for(const [key,event]of Object.entries({onPlay:'play',onPause:'pause',onStop:'ended',onEnded:'ended',onError:'error',onCanplay:'canplay',onSeeked:'seeked'})){a[key]=cb=>a.addEventListener(event,cb);a[key.replace('on','off')]=cb=>a.removeEventListener(event,cb)}return a;};
addEventListener('error',e=>document.getElementById('status').textContent=e.message);
addEventListener('unhandledrejection',e=>{if(e.reason?.errMsg?.startsWith('Browser edition')){e.preventDefault();return}document.getElementById('status').textContent=String(e.reason?.stack||e.reason)});
const heldKeys=new Set();let keyboardTouch=false;
function keyboardMove(){
 const dx=Number(heldKeys.has('d')||heldKeys.has('ArrowRight'))-Number(heldKeys.has('a')||heldKeys.has('ArrowLeft'));
 const dy=Number(heldKeys.has('s')||heldKeys.has('ArrowDown'))-Number(heldKeys.has('w')||heldKeys.has('ArrowUp'));
 const rect=canvas.getBoundingClientRect(),x=rect.left+rect.width*.5,y=rect.top+rect.height*.8;
 const emit=(type,x,y)=>canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:9001,pointerType:'touch',clientX:x,clientY:y,buttons:type==='pointerup'?0:1}));
 if(dx||dy){if(!keyboardTouch){keyboardTouch=true;emit('pointerdown',x,y)}emit('pointermove',x+dx*50,y+dy*50)}else if(keyboardTouch){keyboardTouch=false;emit('pointerup',x,y)}
}
addEventListener('keydown',e=>{if(['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();heldKeys.add(e.key);keyboardMove()}});
addEventListener('keyup',e=>{heldKeys.delete(e.key);keyboardMove()});
addEventListener('blur',()=>{heldKeys.clear();keyboardMove()});
