/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license <https://mths.be/mit>
 */
function buildIOSMeta(){for(var n,i,r=[{name:"viewport",content:"width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"},{name:"apple-mobile-web-app-capable",content:"yes"},{name:"apple-mobile-web-app-status-bar-style",content:"black"}],t=0;t<r.length;t++)n=document.createElement("meta"),n.name=r[t].name,n.content=r[t].content,i=window.document.head.querySelector('meta[name="'+n.name+'"]'),i&&i.parentNode.removeChild(i),window.document.head.appendChild(n)}function hideIOSFullscreenPanel(){document.querySelector(".xxx-ios-fullscreen-message").style.display="none";document.querySelector(".xxx-ios-fullscreen-scroll").style.display="none";document.querySelector(".xxx-game-iframe-full").classList.remove("xxx-game-iframe-iphone-se")}function buildIOSFullscreenPanel(){var n="";n+='<div class="xxx-ios-fullscreen-message">';n+='<div class="xxx-ios-fullscreen-swipe">';n+="<\/div>";n+="<\/div>";n+='<div class="xxx-ios-fullscreen-scroll">';n+="<\/div>";document.body.insertAdjacentHTML("beforeend",n)}function showIOSFullscreenPanel(){document.querySelector(".xxx-ios-fullscreen-message").style.display="none";document.querySelector(".xxx-ios-fullscreen-scroll").style.display="none"}function __iosResize(){if(window.scrollTo(0,0),console.log(window.devicePixelRatio),console.log(window.innerWidth),console.log(window.innerHeight),platform.product==="iPhone")switch(window.devicePixelRatio){case 2:switch(window.innerWidth){case 568:window.innerHeight===320||document.querySelector(".xxx-game-iframe-full").classList.add("xxx-game-iframe-iphone-se");break;case 667:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;case 3:switch(window.innerWidth){case 736:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 724:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;default:hideIOSFullscreenPanel()}}function iosResize(){__iosResize();setTimeout(function(){__iosResize()},500)}function iosInIframe(){try{return window.self!==window.top}catch(n){return!0}}function isIOSLessThen13(){var n=platform.os,t=n.family.toLowerCase(),i=parseFloat(n.version);return t==="ios"&&i<13?!0:!1}function trace(n){console.log(n)}function getSize(n){var u,e=n.toLowerCase(),f=window.document,t=f.documentElement,i,r;return window["inner"+n]===undefined?u=t["client"+n]:window["inner"+n]!=t["client"+n]?(i=f.createElement("body"),i.id="vpw-test-b",i.style.cssText="overflow:scroll",r=f.createElement("div"),r.id="vpw-test-d",r.style.cssText="position:absolute;top:-1000px",r.innerHTML="<style>@media("+e+":"+t["client"+n]+"px){body#vpw-test-b div#vpw-test-d{"+e+":7px!important}}<\/style>",i.appendChild(r),t.insertBefore(i,f.head),u=r["offset"+n]==7?t["client"+n]:window["inner"+n],t.removeChild(i)):u=window["inner"+n],u}function onOrientationChange(){window.matchMedia("(orientation: portrait)").matches&&sizeHandler();window.matchMedia("(orientation: landscape)").matches&&sizeHandler()}function getNearestNumber(n,t){if((i=n.length)<2)return i-1;for(var i,r=Math.abs(n[--i]-t);i--;)if(r<(r=Math.abs(n[i]-t)))break;return i+1}function isIpad(){var n=navigator.userAgent.toLowerCase().indexOf("ipad")!==-1;return!n&&navigator.userAgent.match(/Mac/)&&navigator.maxTouchPoints&&navigator.maxTouchPoints>2?!0:n}function isMobile(){return isIpad()?!0:navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function isIOS(){if(isIpad())return!0;for(var n=["iPad Simulator","iPhone Simulator","iPod Simulator","iPad","iPhone","iPod"];n.length;)if(navigator.platform===n.pop())return s_bIsIphone=!0,!0;return s_bIsIphone=!1,!1}function getIOSWindowHeight(){var n=document.documentElement.clientWidth/window.innerWidth;return window.innerHeight*n}function getHeightOfIOSToolbars(){var n=(window.orientation===0?screen.height:screen.width)-getIOSWindowHeight();return n>1?n:0}function sizeHandler(){var i,r,h;if(window.scrollTo(0,1),$("#canvas")){i=platform.name!==null&&platform.name.toLowerCase()==="safari"?getIOSWindowHeight():getSize("Height");r=getSize("Width");s_bFocus&&_checkOrientation(r,i);var e=Math.min(i/CANVAS_HEIGHT,r/CANVAS_WIDTH),n=Math.round(CANVAS_WIDTH*e),t=Math.round(CANVAS_HEIGHT*e),f=0;t<i?(f=i-t,t+=f,n+=f*(CANVAS_WIDTH/CANVAS_HEIGHT)):n<r&&(f=r-n,n+=f,t+=f*(CANVAS_HEIGHT/CANVAS_WIDTH));var u=i/2-t/2,o=r/2-n/2,s=CANVAS_WIDTH/n;(o*s<-EDGEBOARD_X||u*s<-EDGEBOARD_Y)&&(e=Math.min(i/(CANVAS_HEIGHT-EDGEBOARD_Y*2),r/(CANVAS_WIDTH-EDGEBOARD_X*2)),n=Math.round(CANVAS_WIDTH*e),t=Math.round(CANVAS_HEIGHT*e),u=(i-t)/2,o=(r-n)/2,s=CANVAS_WIDTH/n);s_iOffsetX=-1*o*s;s_iOffsetY=-1*u*s;u>=0&&(s_iOffsetY=0);o>=0&&(s_iOffsetX=0);s_oInterface!==null&&s_oInterface.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_oMenu!==null&&s_oMenu.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_oSelectPlayers!==null&&s_oSelectPlayers.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_oLevelMenu!==null&&s_oLevelMenu.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_bIsIphone&&s_oStage?(canvas=document.getElementById("canvas"),s_oStage.canvas.width=n*2,s_oStage.canvas.height=t*2,canvas.style.width=n+"px",canvas.style.height=t+"px",h=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_iScaleFactor=h*2,s_oStage.scaleX=s_oStage.scaleY=h*2):s_bMobile?($("#canvas").css("width",n+"px"),$("#canvas").css("height",t+"px")):s_oStage&&(s_oStage.canvas.width=n,s_oStage.canvas.height=t,s_iScaleFactor=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_oStage.scaleX=s_oStage.scaleY=s_iScaleFactor);u<0?$("#canvas").css("top",u+"px"):(u=(i-t)/2,$("#canvas").css("top",u+"px"));$("#canvas").css("left",o+"px");fullscreenHandler()}}function _checkOrientation(n,t){s_bMobile&&ENABLE_CHECK_ORIENTATION&&(n>t?$(".orientation-msg-container").attr("data-orientation")==="landscape"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()):$(".orientation-msg-container").attr("data-orientation")==="portrait"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()))}function playSound(n,t,i){return(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&(s_aSounds[n].play(),s_aSounds[n].volume(t),s_aSounds[n].loop(i)),null}function stopSound(n){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].stop()}function setVolume(n,t){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].volume(t)}function setMute(n,t){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].mute(t)}function createBitmap(n,t,i){var u=new createjs.Bitmap(n),r=new createjs.Shape;return t&&i?r.graphics.beginFill("#fff").drawRect(0,0,t,i):r.graphics.beginFill("#ff0").drawRect(0,0,n.width,n.height),u.hitArea=r,u}function createSprite(n,t,i,r,u,f){var e,o;return e=t!==null?new createjs.Sprite(n,t):new createjs.Sprite(n),o=new createjs.Shape,o.graphics.beginFill("#000000").drawRect(-i,-r,u,f),e.hitArea=o,e}function pad(n,t,i){return i=i||"0",n=n+"",n.length>=t?n:new Array(t-n.length+1).join(i)+n}function randomSign(){return Math.random()<=.5?1:-1}function randomFloatBetween(n,t,i){return typeof i=="undefined"&&(i=2),parseFloat(Math.min(n+Math.random()*(t-n),t).toFixed(i))}function rotateVector2D(n,t){var i=t.getX()*Math.cos(n)+t.getY()*Math.sin(n),r=t.getX()*-Math.sin(n)+t.getY()*Math.cos(n);t.set(i,r)}function tweenVectorsOnX(n,t,i){return n+i*(t-n)}function shuffle(n){for(var t=n.length,r,i;0!==t;)i=Math.floor(Math.random()*t),t-=1,r=n[t],n[t]=n[i],n[i]=r;return n}function centerBetweenPointsV2(n,t){var i=new CVector2;return i.set((n.getX()+t.getX())*.5,(n.getY()+t.getY())*.5),i}function bubbleSort(n){var i,t,r;do for(i=!1,t=0;t<n.length-1;t++)n[t]>n[t+1]&&(r=n[t],n[t]=n[t+1],n[t+1]=r,i=!0);while(i)}function compare(n,t){return n.index>t.index?-1:n.index<t.index?1:0}function easeLinear(n,t,i,r){return i*n/r+t}function easeInQuad(n,t,i,r){return i*(n/=r)*n+t}function easeInSine(n,t,i,r){return-i*Math.cos(n/r*(Math.PI/2))+i+t}function easeInCubic(n,t,i,r){return i*(n/=r)*n*n+t}function getTrajectoryPoint(n,t){var i=new createjs.Point,r=(1-n)*(1-n),u=n*n;return i.x=r*t.start.x+2*(1-n)*n*t.traj.x+u*t.end.x,i.y=r*t.start.y+2*(1-n)*n*t.traj.y+u*t.end.y,i}function formatTime(n){var i,t,r;return n/=1e3,i=Math.floor(n/60),t=n-i*60,t=parseFloat(t).toFixed(1),r="",r+=i<10?"0"+i+":":i+":",r+(t<10?"0"+t:t)}function degreesToRadians(n){return n*Math.PI/180}function checkRectCollision(n,t){var i,r;return i=getBounds(n,.9),r=getBounds(t,.98),calculateIntersection(i,r)}function calculateIntersection(n,t){var u,f,i={},r={};return i.cx=n.x+(i.hw=n.width/2),i.cy=n.y+(i.hh=n.height/2),r.cx=t.x+(r.hw=t.width/2),r.cy=t.y+(r.hh=t.height/2),u=Math.abs(i.cx-r.cx)-(i.hw+r.hw),f=Math.abs(i.cy-r.cy)-(i.hh+r.hh),u<0&&f<0?(u=Math.min(Math.min(n.width,t.width),-u),f=Math.min(Math.min(n.height,t.height),-f),{x:Math.max(n.x,t.x),y:Math.max(n.y,t.y),width:u,height:f,rect1:n,rect2:t}):null}function getBounds(n,t){var i={x:Infinity,y:Infinity,width:0,height:0},l,v,u,c,f,e,o,s,r,a,h;if(n instanceof createjs.Container){for(i.x2=-Infinity,i.y2=-Infinity,l=n.children,v=l.length,c=0;c<v;c++)u=getBounds(l[c],1),u.x<i.x&&(i.x=u.x),u.y<i.y&&(i.y=u.y),u.x+u.width>i.x2&&(i.x2=u.x+u.width),u.y+u.height>i.y2&&(i.y2=u.y+u.height);i.x==Infinity&&(i.x=0);i.y==Infinity&&(i.y=0);i.x2==Infinity&&(i.x2=0);i.y2==Infinity&&(i.y2=0);i.width=i.x2-i.x;i.height=i.y2-i.y;delete i.x2;delete i.y2}else r={},n instanceof createjs.Bitmap?(a=n.sourceRect||n.image,r.width=a.width*t,r.height=a.height*t):n instanceof createjs.Sprite?n.spriteSheet._frames&&n.spriteSheet._frames[n.currentFrame]&&n.spriteSheet._frames[n.currentFrame].image?(h=n.spriteSheet.getFrame(n.currentFrame),r.width=h.rect.width,r.height=h.rect.height,r.regX=h.regX,r.regY=h.regY):(i.x=n.x||0,i.y=n.y||0):(i.x=n.x||0,i.y=n.y||0),r.regX=r.regX||0,r.width=r.width||0,r.regY=r.regY||0,r.height=r.height||0,i.regX=r.regX,i.regY=r.regY,f=n.localToGlobal(0-r.regX,0-r.regY),e=n.localToGlobal(r.width-r.regX,r.height-r.regY),o=n.localToGlobal(r.width-r.regX,0-r.regY),s=n.localToGlobal(0-r.regX,r.height-r.regY),i.x=Math.min(Math.min(Math.min(f.x,e.x),o.x),s.x),i.y=Math.min(Math.min(Math.min(f.y,e.y),o.y),s.y),i.width=Math.max(Math.max(Math.max(f.x,e.x),o.x),s.x)-i.x,i.height=Math.max(Math.max(Math.max(f.y,e.y),o.y),s.y)-i.y;return i}function NoClickDelay(n){this.element=n;window.Touch&&this.element.addEventListener("touchstart",this,!1)}function shuffle(n){for(var t=n.length,r,i;t>0;)i=Math.floor(Math.random()*t),t--,r=n[t],n[t]=n[i],n[i]=r;return n}function ctlArcadeResume(){s_oMain!==null&&s_oMain.startUpdate()}function ctlArcadePause(){s_oMain!==null&&s_oMain.stopUpdate()}function getParamValue(n){for(var i,u=window.location.search.substring(1),r=u.split("&"),t=0;t<r.length;t++)if(i=r[t].split("="),i[0]==n)return i[1]}function radiansToDegree(n){return n*(180/Math.PI)}function distance(n,t){var i=n.getX()-t.getX(),r=n.getY()-t.getY();return Math.sqrt(i*i+r*r)}function fixEnemyTremble(n,t){var i=!1;return distanceBetween2Points(t.m_pCenter().getX(),n.getY(),t.m_pCenter().getX(),t.m_pCenter().getY())<=t.getLength()&&(i=!0),i}function distanceBetween2Points(n,t,i,r){return Math.sqrt(Math.pow(i-n,2)+Math.pow(r-t,2))}function collideEdgeWithCircle(n,t,i){var r=closestPointOnLine(n.getPointA(),n.getPointB(),t),u=distanceV2(t,r);return i<u?null:{distance:u,closest_point:r}}function closestPointOnLine(n,t,i){var e=new CVector2,o=new CVector2,u,r,f;return(e.setV(n),o.setV(t),u=new CVector2,u.setV(i),u.subtract(n),r=new CVector2,r.setV(t),r.subtract(n),r.normalize(),f=dotProductV2(r,u),f<=0)?e:f>=distanceV2(n,t)?o:(r.scalarProduct(f),r.addV(n),r)}function dotProductV2(n,t){return n.getX()*t.getX()+n.getY()*t.getY()}function distanceV2(n,t){return Math.sqrt((t.getX()-n.getX())*(t.getX()-n.getX())+(t.getY()-n.getY())*(t.getY()-n.getY()))}function reflectVectorV2(n,t){var i=dotProductV2(n,t);return n.set(n.getX()-2*i*t.getX(),n.getY()-2*i*t.getY()),n}function angleBetweenVectors(n,t){var i=Math.acos(dotProductV2(n,t)/(n.length()*t.length()));return isNaN(i)==!0?0:i}function distanceV2WithoutSQRT(n,t){return(t.getX()-n.getX())*(t.getX()-n.getX())+(t.getY()-n.getY())*(t.getY()-n.getY())}function classifySphere(n,t,i,r){var u=t.getX()*n.getX()+t.getY()*n.getY()+planeDistance(t,i);return Math.abs(u)<r?u>=0?"INTERSECT FRONT":"INTERSECT BEHIND":u>=r?"FRONT":"BEHIND"}function planeDistance(n,t){return-(n.getX()*t.getX()+n.getY()*t.getY())}function saveItem(n,t){s_bStorageAvailable&&localStorage.setItem(n,t)}function getItem(n){return s_bStorageAvailable?localStorage.getItem(n):null}function fullscreenHandler(){ENABLE_FULLSCREEN&&screenfull.enabled&&(s_bFullscreen=screenfull.isFullscreen,s_oInterface!==null&&s_oInterface.resetFullscreenBut(),s_oMenu!==null&&s_oMenu.resetFullscreenBut(),s_oSelectPlayers!==null&&s_oSelectPlayers.resetFullscreenBut(),s_oLevelMenu!==null&&s_oLevelMenu.resetFullscreenBut())}function CSpriteLibrary(){var t={},n,i,u,f,e,r;this.init=function(t,o,s){n={};i=0;u=0;f=t;e=o;r=s};this.addSprite=function(r,u){if(!t.hasOwnProperty(r)){var f=new Image;t[r]=n[r]={szPath:u,oSprite:f,bLoaded:!1};i++}};this.getSprite=function(n){return t.hasOwnProperty(n)?t[n].oSprite:null};this._onSpritesLoaded=function(){i=0;e.call(r)};this._onSpriteLoaded=function(){f.call(r);++u===i&&this._onSpritesLoaded()};this.loadSprites=function(){for(var t in n)n[t].oSprite.oSpriteLibrary=this,n[t].oSprite.szKey=t,n[t].oSprite.onload=function(){this.oSpriteLibrary.setLoaded(this.szKey);this.oSpriteLibrary._onSpriteLoaded(this.szKey)},n[t].oSprite.onerror=function(t){var i=t.currentTarget;setTimeout(function(){n[i.szKey].oSprite.src=n[i.szKey].szPath},500)},n[t].oSprite.src=n[t].szPath};this.setLoaded=function(n){t[n].bLoaded=!0};this.isLoaded=function(n){return t[n].bLoaded};this.getNumSprites=function(){return i}}function CPreloader(){var s,o,r,t,u,f,i,e,n;this._init=function(){s_oSpriteLibrary.init(this._onImagesLoaded,this._onAllImagesLoaded,this);s_oSpriteLibrary.addSprite("progress_bar","./sprites/progress_bar.png");s_oSpriteLibrary.addSprite("200x200","./sprites/200x200.jpg");s_oSpriteLibrary.loadSprites();n=new createjs.Container;s_oStage.addChild(n)};this.unload=function(){n.removeAllChildren()};this._onImagesLoaded=function(){};this._onAllImagesLoaded=function(){this.attachSprites();s_oMain.preloaderReady()};this.attachSprites=function(){var c=new createjs.Shape,h;c.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(c);h=s_oSpriteLibrary.getSprite("200x200");i=createBitmap(h);i.regX=h.width*.5;i.regY=h.height*.5;i.x=CANVAS_WIDTH/2;i.y=CANVAS_HEIGHT/2-80;n.addChild(i);e=new createjs.Shape;e.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(i.x-100,i.y-100,200,200,10);n.addChild(e);i.mask=e;h=s_oSpriteLibrary.getSprite("progress_bar");t=createBitmap(h);t.x=CANVAS_WIDTH/2-h.width/2;t.y=CANVAS_HEIGHT/2+70;n.addChild(t);s=h.width;o=h.height;u=new createjs.Shape;u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,1,o);n.addChild(u);t.mask=u;r=new createjs.Text("","30px "+PRIMARY_FONT,"#fff");r.x=CANVAS_WIDTH/2;r.y=CANVAS_HEIGHT/2+120;r.textBaseline="alphabetic";r.textAlign="center";n.addChild(r);f=new createjs.Shape;f.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(f);createjs.Tween.get(f).to({alpha:0},500).call(function(){createjs.Tween.removeTweens(f);n.removeChild(f)})};this.refreshLoader=function(n){r.text=n+"%";n===100&&(s_oMain._onRemovePreloader(),r.visible=!1,t.visible=!1);u.graphics.clear();var i=Math.floor(n*s/100);u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,i,o)};this._init()}function CMain(n) {
  var i,
    r = 0,
    u = 0,
    f = STATE_LOADING,
    o,
    e,
    h,
    s,
    t;
  this.initContainer = function () {
    s_oCanvas = document.getElementById("canvas");
    s_oStage = new createjs.Stage(s_oCanvas);
    s_oStage.preventSelection = !1;
    createjs.Touch.enable(s_oStage);
    s_bMobile = isMobile();
    s_bMobile === !1 && s_oStage.enableMouseOver(20);
    s_iPrevTime = new Date().getTime();
    createjs.Ticker.addEventListener("tick", this._update);
    createjs.Ticker.framerate = FPS;
    navigator.userAgent.match(/Windows Phone/i) && (DISABLE_SOUND_MOBILE = !0);
    s_oSpriteLibrary = new CSpriteLibrary();
    e = new CPreloader();
  };
  this.preloaderReady = function () {
    s_oLevelSettings = new CLevelSettings([{
      points_to_win: 5,
      cpu_speed_sticks: 5,
      ball_speed: 15
    }, {
      points_to_win: 5,
      cpu_speed_sticks: 10,
      ball_speed: 15
    }, {
      points_to_win: 5,
      cpu_speed_sticks: 15,
      ball_speed: 16
    }, {
      points_to_win: 5,
      cpu_speed_sticks: 20,
      ball_speed: 16
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 25,
      ball_speed: 17
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 30,
      ball_speed: 17
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 35,
      ball_speed: 18
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 40,
      ball_speed: 18
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 45,
      ball_speed: 19
    }, {
      points_to_win: 6,
      cpu_speed_sticks: 50,
      ball_speed: 20
    }, {
      points_to_win: 7,
      cpu_speed_sticks: 55,
      ball_speed: 21
    }, {
      points_to_win: 7,
      cpu_speed_sticks: 60,
      ball_speed: 22
    }, {
      points_to_win: 7,
      cpu_speed_sticks: 65,
      ball_speed: 23
    }, {
      points_to_win: 7,
      cpu_speed_sticks: 70,
      ball_speed: 24
    }, {
      points_to_win: 8,
      cpu_speed_sticks: 75,
      ball_speed: 25
    }, {
      points_to_win: 8,
      cpu_speed_sticks: 80,
      ball_speed: 26
    }, {
      points_to_win: 9,
      cpu_speed_sticks: 85,
      ball_speed: 27
    }, {
      points_to_win: 9,
      cpu_speed_sticks: 90,
      ball_speed: 28
    }, {
      points_to_win: 10,
      cpu_speed_sticks: 95,
      ball_speed: 29
    }, {
      points_to_win: 10,
      cpu_speed_sticks: 100,
      ball_speed: 30
    }]);
    try {
      saveItem("ls_available", "ok");
    } catch (n) {
      s_bStorageAvailable = !1;
    }
    s_oMain._loadImages();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_oMain._initSounds();
    i = !0;
  };
  this.soundLoaded = function () {
    r++;
    var n = Math.floor(r / u * 100);
    e.refreshLoader(n);
  };
  this._initSounds = function () {
    Howler.mute(!s_bAudioActive);
    s_aSoundsInfo = [];
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "soundtrack",
      loop: !0,
      volume: 1,
      ingamename: "soundtrack"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "ball_kick",
      loop: !0,
      volume: 1,
      ingamename: "ball_kick"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "goal",
      loop: !0,
      volume: 1,
      ingamename: "goal"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "press_button",
      loop: !0,
      volume: 1,
      ingamename: "click"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "game_over",
      loop: !0,
      volume: 1,
      ingamename: "game_over"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "ball_kick",
      loop: !0,
      volume: 1,
      ingamename: "ball_kick"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "ball_wall",
      loop: !0,
      volume: 1,
      ingamename: "ball_wall"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "goal_exultance",
      loop: !0,
      volume: 1,
      ingamename: "goal_exultance"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "miss_goal",
      loop: !0,
      volume: 1,
      ingamename: "miss_goal"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "applause",
      loop: !0,
      volume: 1,
      ingamename: "applause"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "whistle",
      loop: !0,
      volume: 1,
      ingamename: "whistle"
    });
    u += s_aSoundsInfo.length;
    s_aSounds = [];
    for (var n = 0; n < s_aSoundsInfo.length; n++) this.tryToLoadSound(s_aSoundsInfo[n], !1);
  };
  this.tryToLoadSound = function (n, t) {
    setTimeout(function () {
      s_aSounds[n.ingamename] = new Howl({
        src: [n.path + n.filename + ".mp3"],
        autoplay: !1,
        preload: !0,
        loop: n.loop,
        volume: n.volume,
        onload: s_oMain.soundLoaded,
        onloaderror: function (n) {
          if (navigator.onLine) {
            for (var t = 0; t < s_aSoundsInfo.length; t++) if (s_aSounds[s_aSoundsInfo[t].ingamename]._sounds.length > 0 && n === s_aSounds[s_aSoundsInfo[t].ingamename]._sounds[0]._id) {
              s_oMain.tryToLoadSound(s_aSoundsInfo[t], !0);
              break;
            } else document.querySelector("#block_game").style.display = "none";
          } else document.querySelector("#block_game").style.display = "none";
        },
        onplayerror: function (n) {
          for (var t = 0; t < s_aSoundsInfo.length; t++) if (n === s_aSounds[s_aSoundsInfo[t].ingamename]._sounds[0]._id) {
            s_aSounds[s_aSoundsInfo[t].ingamename].once("unlock", function () {
              s_aSounds[s_aSoundsInfo[t].ingamename].play();
              s_aSoundsInfo[t].ingamename === "soundtrack" && s_oGame !== null && setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
            });
            break;
          }
        }
      });
    }, t ? 200 : 0);
  };
  this._loadImages = function () {
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
    s_oSpriteLibrary.addSprite("ctl_logo", "./sprites/ctl_logo.png");
    s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
    s_oSpriteLibrary.addSprite("but_yes_big", "./sprites/but_yes_big.png");
    s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
    s_oSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg");
    s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
    s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
    s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");
    s_oSpriteLibrary.addSprite("ball", "./sprites/ball.png");
    s_oSpriteLibrary.addSprite("player_shadow", "./sprites/player_shadow.png");
    s_oSpriteLibrary.addSprite("but_p1", "./sprites/but_p1.png");
    s_oSpriteLibrary.addSprite("but_p2", "./sprites/but_p2.png");
    s_oSpriteLibrary.addSprite("friendly_mode", "./sprites/friendly_mode.png");
    s_oSpriteLibrary.addSprite("tournament_mode", "./sprites/tournament_mode.png");
    s_oSpriteLibrary.addSprite("arrow", "./sprites/arrow.png");
    s_oSpriteLibrary.addSprite("stick", "./sprites/stick.png");
    s_oSpriteLibrary.addSprite("field", "./sprites/field.png");
    s_oSpriteLibrary.addSprite("player_red", "./sprites/player_red.png");
    s_oSpriteLibrary.addSprite("player_blue", "./sprites/player_blue.png");
    s_oSpriteLibrary.addSprite("arena", "./sprites/arena.png");
    s_oSpriteLibrary.addSprite("score_rod_blue", "./sprites/score_rod_blue.png");
    s_oSpriteLibrary.addSprite("score_rod_red", "./sprites/score_rod_red.png");
    s_oSpriteLibrary.addSprite("score_cube_blue", "./sprites/score_cube_blue.png");
    s_oSpriteLibrary.addSprite("score_cube_red", "./sprites/score_cube_red.png");
    s_oSpriteLibrary.addSprite("score_panel", "./sprites/score_panel.png");
    s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
    s_oSpriteLibrary.addSprite("but_home", "./sprites/but_home.png");
    s_oSpriteLibrary.addSprite("but_level", "./sprites/but_level.png");
    s_oSpriteLibrary.addSprite("but_next", "./sprites/but_next.png");
    s_oSpriteLibrary.addSprite("but_kickoff", "./sprites/but_kickoff.png");
    s_oSpriteLibrary.addSprite("but_delete_save", "./sprites/but_delete_save.png");
    s_oSpriteLibrary.addSprite("key_w", "./sprites/key_w.png");
    s_oSpriteLibrary.addSprite("key_s", "./sprites/key_s.png");
    s_oSpriteLibrary.addSprite("key_up", "./sprites/key_up.png");
    s_oSpriteLibrary.addSprite("key_down", "./sprites/key_down.png");
    s_oSpriteLibrary.addSprite("skip_arrow", "./sprites/skip_arrow.png");
    s_oSpriteLibrary.addSprite("skip_arrow_left", "./sprites/skip_arrow_left.png");
    s_oSpriteLibrary.addSprite("but_help", "./sprites/but_help.png");
    s_oSpriteLibrary.addSprite("but_pause", "./sprites/but_pause.png");
    s_oSpriteLibrary.addSprite("but_lang", "./sprites/but_lang.png");
    for (var n = 0; n < NUM_LANGUAGES; n++) s_oSpriteLibrary.addSprite("logo_menu_" + n, "./sprites/logo_menu_" + n + ".png"), s_oSpriteLibrary.addSprite("goal_text_" + n, "./sprites/goal_text_" + n + ".png");
    u += s_oSpriteLibrary.getNumSprites();
    s_oSpriteLibrary.loadSprites();
  };
  this._onImagesLoaded = function () {
    r++;
    var n = Math.floor(r / u * 100);
    e.refreshLoader(n);
  };
  this._onAllImagesLoaded = function () {};
  this._onRemovePreloader = function () {
    e.unload();
    try {} catch (n) {
      console.log(n);
    }
    s_oSoundtrack = playSound("soundtrack", 1, !0);
    s_oMain.gotoMenu();
  };
  this.onAllPreloaderImagesLoaded = function () {
    this._loadImages();
  };
  this.gotoMenu = function () {
    h = new CMenu();
    f = STATE_MENU;
  };
  this.gotoGame = function () {
    s = new CGame(o);
    f = STATE_GAME;
  };
  this.gotoSelectPlayers = function () {
    new CSelectPlayers();
  };
  this.gotoLevelMenu = function () {
    new CLevelMenu();
    f = STATE_LEVEL_SELECTION;
  };
  this.stopUpdate = function () {
    i = !1;
    createjs.Ticker.paused = !0;
    $("#block_game").css("display", "block");
    Howler.mute(!0);
  };
  this.startUpdate = function () {
    s_iPrevTime = new Date().getTime();
    i = !0;
    createjs.Ticker.paused = !1;
    $("#block_game").css("display", "none");
    s_bAudioActive && Howler.mute(!1);
  };
  this._update = function (n) {
    if (i !== !1) {
      var t = new Date().getTime();
      s_iTimeElaps = t - s_iPrevTime;
      s_iCntTime += s_iTimeElaps;
      s_iCntFps++;
      s_iPrevTime = t;
      s_iCntTime >= 1e3 && (s_iCurFps = s_iCntFps, s_iCntTime -= 1e3, s_iCntFps = 0);
      f === STATE_GAME && s.update();
      s_oStage.update(n);
    }
  };
  s_oMain = this;
  ENABLE_CHECK_ORIENTATION = n.check_orientation;
  ENABLE_FULLSCREEN = n.fullscreen;
  NUM_ROWS_PAGE_LEVEL = n.level_menu_rows;
  NUM_COLS_PAGE_LEVEL = n.level_menu_cols;
  CPU_SPEED_STICK_FRIENDLY = n.cpu_speed_friendly;
  NUM_GOAL_FRIENDLY = n.num_goal_friendly;
  s_bAudioActive = n.audio_enable_on_startup;
  o = n;
  t = (navigator.language || "en").split("-")[0].toLowerCase();
  console.log("iLang " + t);
  LANG_CODES[t] === undefined && (t = "en");
  s_iCurLang = LANG_CODES[t];
  this.initContainer();
  refreshLanguage();
}function CStick(n,t,i,r,u,f,e,o){var a,s,v,y,b,l,c,k,d,p,w,h;this.init=function(n,t,i,r,u,f,e,o){var nt,rt,it=0,tt,ut,ft,g;for(a=new createjs.Container,s_oStage.addChild(a),l=[],c=[],w=i,h=0,d=e,e===GOALKEEPER?it=o/2:e===DEFENDER?it=o/3:e===MIDFIELDER?it=o/4:e===STRIKER&&(it=o/4),p=it,nt=s_oSpriteLibrary.getSprite("stick"),s=new createBitmap(nt,nt.width,nt.height),s.regX=21,s.regY=1224,s.x=n,s.y=t,w===1&&(s.scaleY*=-1),a.addChild(s),v=r,y=u,b=f,tt=0,w===0?(nt=s_oSpriteLibrary.getSprite("player_blue"),rt={regX:53,regY:32},k=1,tt=15):(nt=s_oSpriteLibrary.getSprite("player_red"),rt={regX:49,regY:32},k=-1,tt=-15),ut={images:[nt],frames:{width:100,height:70,regX:rt.regX,regY:rt.regY},animations:{idle:[0,0,"idle"],shot:{frames:[1,2,3],next:"idle"}}},ft=new createjs.SpriteSheet(ut),g=0;g<f.length;g++)l.push(new CEdge(n+tt,b[g].y1,n+tt,b[g].y2,1,!1)),c.push(new createjs.Sprite(ft,"idle")),c[g].x=l[g].getModel().m_pCenter().getX()-tt,c[g].y=l[g].getModel().m_pCenter().getY(),a.addChild(c[g])};this.getX=function(){return s.x};this.getColorStick=function(){return w};this.getDistanceFromStickToEdge=function(n){return Math.sqrt(Math.pow(n.x-s.x,2)+Math.pow(n.y-s.y,2))};this.onKeyUp=function(){s.y!==v&&(h-=STICK_ACCELLERATION,this.__updateStickPositions())};this.onKeyDown=function(){s.y!==y&&(h+=STICK_ACCELLERATION,this.__updateStickPositions())};this.__updateStickPositions=function(){var n,t;for(Math.abs(h)>p&&(h=h<0?-p:p),n=h,s.y+h<v?(n=v-s.y,h=0):s.y+h>y&&(h=0,n=y-s.y),s.y+=n,t=0;t<l.length;t++)l[t].moveY(n),c[t].y+=n};this.onShot=function(){for(var n=0;n<c.length;n++)c[n].gotoAndPlay("shot")};this.getEdges=function(){return l};this.update=function(){h*=STICK_FRICTION;this.__updateStickPositions()};this.init(n,t,i,r,u,f,e,o)}function CToggle(n,t,i,r,u){var e,s,h,l,o,c,f;this._init=function(n,t,i,r,u){o=[];c=[];var s={images:[i],frames:{width:i.width/2,height:i.height,regX:i.width/4,regY:i.height/2},animations:{state_true:[0],state_false:[1]}},h=new createjs.SpriteSheet(s);e=r;f=createSprite(h,"state_"+e,i.width/4,i.height/2,i.width/2,i.height);f.x=n;f.y=t;f.stop();u.addChild(f);this._initListener()};this.unload=function(){s_bMobile?(f.off("mousedown",s),f.off("pressup",h)):(f.off("mousedown",s),f.off("mouseover",l),f.off("pressup",h));u.removeChild(f)};this._initListener=function(){s_bMobile?(s=f.on("mousedown",this.buttonDown),h=f.on("pressup",this.buttonRelease)):(s=f.on("mousedown",this.buttonDown),l=f.on("mouseover",this.buttonOver),h=f.on("pressup",this.buttonRelease))};this.addEventListener=function(n,t,i){o[n]=t;c[n]=i};this.setActive=function(n){e=n;f.gotoAndStop("state_"+e)};this.buttonRelease=function(){f.scaleX=1;f.scaleY=1;playSound("click",1,!1);e=!e;f.gotoAndStop("state_"+e);o[ON_MOUSE_UP]&&o[ON_MOUSE_UP].call(c[ON_MOUSE_UP],e)};this.buttonDown=function(){f.scaleX=.9;f.scaleY=.9;o[ON_MOUSE_DOWN]&&o[ON_MOUSE_DOWN].call(c[ON_MOUSE_DOWN])};this.buttonOver=function(n){s_bMobile||(n.target.cursor="pointer")};this.setPosition=function(n,t){f.x=n;f.y=t};this._init(n,t,i,r,u)}function CGfxButton(n,t,i,r){var o,f,s,h,a,e,c,u,v,y,l;return this._init=function(n,t,i,r){o=!1;l=!1;f=1;e=[];c=[];u=createBitmap(i);u.x=n;u.y=t;u.scaleX=u.scaleY=f;u.regX=i.width/2;u.regY=i.height/2;r.addChild(u);this._initListener()},this.unload=function(){createjs.Tween.removeTweens(u);s_bMobile?(u.off("mousedown",s),u.off("pressup",h)):(u.off("mousedown",s),u.off("mouseover",a),u.off("pressup",h));r.removeChild(u)},this.setVisible=function(n){u.visible=n},this.setClickable=function(n){o=!n},this._initListener=function(){s_bMobile?(s=u.on("mousedown",this.buttonDown),h=u.on("pressup",this.buttonRelease)):(s=u.on("mousedown",this.buttonDown),a=u.on("mouseover",this.buttonOver),h=u.on("pressup",this.buttonRelease))},this.addEventListener=function(n,t,i){e[n]=t;c[n]=i},this.buttonRelease=function(){o||(u.scaleX=f,u.scaleY=f,e[ON_MOUSE_UP]&&e[ON_MOUSE_UP].call(c[ON_MOUSE_UP]))},this.buttonDown=function(){o||(u.scaleX=f*.9,u.scaleY=f*.9,l||playSound("click",1,!1),e[ON_MOUSE_DOWN]&&e[ON_MOUSE_DOWN].call(c[ON_MOUSE_DOWN]))},this.buttonOver=function(n){if(!s_bMobile){if(o)return;n.target.cursor="pointer"}},this.pulseAnimation=function(){v=createjs.Tween.get(u,{loop:-1}).to({scale:f*.9},850,createjs.Ease.quadOut).to({scale:f},650,createjs.Ease.quadIn)},this.setPosition=function(n,t){u.x=n;u.y=t},this.setX=function(n){u.x=n},this.setY=function(n){u.y=n},this.getButtonImage=function(){return u},this.getX=function(){return u.x},this.getY=function(){return u.y},this.setMuted=function(n){l=n},y=this,this._init(n,t,i,r),this}function CMenu() {
  var v,
    u,
    r,
    f,
    y,
    e,
    i = null,
    d = null,
    p,
    o,
    s,
    w,
    n,
    b,
    t,
    k,
    h,
    c,
    l,
    a;
  this._init = function () {
    var it, g, nt, tt, rt;
    try {} catch (ut) {}
    s_b2Players = !1;
    setVolume("soundtrack", 1);
    v = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s_oStage.addChild(v);
    g = s_oSpriteLibrary.getSprite("friendly_mode");
    c = {
      x: CANVAS_WIDTH / 2 - 225,
      y: CANVAS_HEIGHT - 300
    };
    u = new CGfxButton(c.x, c.y, g, s_oStage);
    u.addEventListener(ON_MOUSE_DOWN, this._onButFriendlyRelease, this);
    g = s_oSpriteLibrary.getSprite("tournament_mode");
    l = {
      x: CANVAS_WIDTH / 2 + 225,
      y: CANVAS_HEIGHT - 300
    };
    w = new CGfxButton(l.x, l.y, g, s_oStage);
    w.addEventListener(ON_MOUSE_DOWN, this._onButTournamentRelease, this);
    g = s_oSpriteLibrary.getSprite("but_info");
    p = {
      x: g.height / 2 + 10,
      y: g.height / 2 + 10
    };
    y = new CGfxButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 240, g, s_oStage);
    y.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);
    g = s_oSpriteLibrary.getSprite("but_delete_save");
    t = DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1 ? {
      x: CANVAS_WIDTH - g.height * 1.5 - 5,
      y: g.height / 2 + 10
    } : {
      x: CANVAS_WIDTH - g.width / 2 - 10,
      y: g.height / 2 + 10
    };
    k = new CGfxButton(t.x, t.y, g, s_oStage);
    k.addEventListener(ON_MOUSE_UP, s_oLevelSettings.deleteSaveData, this);
    it = s_oSpriteLibrary.getSprite("but_lang");
    a = {
      x: t.x - LANG_WIDTH - 20,
      y: t.y - 4
    };
    h = new CButLang(a.x, a.y, NUM_LANGUAGES, s_iCurLang, it, s_oStage);
    h.addEventListener(ON_SELECT_LANG, this._onSelectLang, this);
    g = s_oSpriteLibrary.getSprite("logo_menu_" + s_iCurLang);
    n = new createBitmap(g);
    n.regX = g.width / 2;
    n.regY = g.height / 2;
    n.y = CANVAS_HEIGHT / 2 - 200;
    n.x = -700;
    s_oStage.addChild(n);
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (g = s_oSpriteLibrary.getSprite("audio_icon"), o = {
      x: CANVAS_WIDTH - g.height / 2,
      y: g.height / 2 + 10
    }, f = new CToggle(o.x, o.y, g, s_bAudioActive, s_oStage), f.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this));
    nt = window.document;
    tt = nt.documentElement;
    i = tt.requestFullscreen || tt.mozRequestFullScreen || tt.webkitRequestFullScreen || tt.msRequestFullscreen;
    d = nt.exitFullscreen || nt.mozCancelFullScreen || nt.webkitExitFullscreen || nt.msExitFullscreen;
    ENABLE_FULLSCREEN === !1 && (i = !1);
    i && screenfull.isEnabled && (g = s_oSpriteLibrary.getSprite("but_fullscreen"), s = {
      x: p.x + g.width / 2 + 10,
      y: g.height / 2 + 10
    }, e = new CToggle(s.x, s.y, g, s_bFullscreen, s_oStage), e.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this));
    b = new CLangPanel(s_oStage);
    b.addEventListener(ON_SELECT_LANG, this._onChangeLang, this);
    r = new createjs.Shape();
    r.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(r);
    rt = this;
    createjs.Tween.get(r).to({
      alpha: 0
    }, 1e3).call(function () {
      r.visible = !1;
    });
    new createjs.Tween.get(n).wait(500).to({
      x: CANVAS_WIDTH / 2
    }, 1e3, createjs.Ease.bounceOut).call(function () {
      rt.pulseTitle();
    });
    s_bStorageAvailable || new CMsgBox(TEXT_ERR_LS, s_oStage);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.pulseTitle = function () {
    new createjs.Tween.get(n, {
      loop: -1
    }).to({
      scaleX: 1 * .9,
      scaleY: 1 * .9
    }, 850, createjs.Ease.quadOut).to({
      scaleX: 1,
      scaleY: 1
    }, 650, createjs.Ease.quadIn);
  };
  this.unload = function () {
    s_oStage.removeChild(n);
    b.unload();
    h.unload();
    u.unload();
    w.unload();
    k.unload();
    u = null;
    r.visible = !1;
    createjs.Tween.removeTweens(n);
    y.unload();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (f.unload(), f = null);
    i && screenfull.isEnabled && e.unload();
    s_oStage.removeChild(v);
    v = null;
    s_oMenu = null;
  };
  this.refreshButtonPos = function (n, r) {
    u.setPosition(c.x, c.y - r);
    w.setPosition(l.x, l.y - r);
    k.setPosition(t.x - n, t.y + r);
    y.setPosition(p.x + n, r + p.y);
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && f.setPosition(o.x - n, r + o.y);
    i && screenfull.isEnabled && e.setPosition(s.x + n, s.y + r);
    h.setPosition(a.x - s_iOffsetX, a.y + s_iOffsetY);
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onCreditsBut = function () {
    new CCreditsPanel();
  };
  this.resetFullscreenBut = function () {
    i && screenfull.isEnabled && e.setActive(s_bFullscreen);
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen ? d.call(window.document) : i.call(window.document.documentElement);
    sizeHandler();
  };
  this._onButFriendlyRelease = function () {
    try {} catch (n) {}
    this.unload();
    s_bFriendly = !0;
    CPU_SPEED_STICKS = CPU_SPEED_STICK_FRIENDLY;
    POINTS_TO_WIN = NUM_GOAL_FRIENDLY;
    s_oMain.gotoSelectPlayers();
  };
  this._onButTournamentRelease = function () {
    try {} catch (n) {}
    this.unload();
    s_bFriendly = !1;
    s_oMain.gotoLevelMenu();
  };
  this._onSelectLang = function () {
    b.show();
  };
  this._onChangeLang = function (t) {
    s_iCurLang = t;
    h.setLang(t);
    refreshLanguage();
    var i = s_oSpriteLibrary.getSprite("logo_menu_" + s_iCurLang);
    n.image = i;
    n.regX = i.width / 2;
    n.regY = i.height / 2;
  };
  s_oMenu = this;
  this._init();
}function CGame(n) {
  var ut,
    et,
    y,
    s,
    nt = null,
    ot,
    t,
    u,
    yt,
    r,
    i,
    p,
    w,
    h,
    c,
    st,
    l,
    a,
    b,
    k,
    e,
    o,
    v,
    d,
    ft,
    f,
    g,
    tt,
    it,
    pt,
    rt,
    ht,
    ct,
    lt,
    at,
    vt,
    wt;
  this._init = function () {
    var f, n;
    setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
    ut = !0;
    et = !0;
    k = !0;
    e = !1;
    tt = !0;
    y = 0;
    l = 0;
    a = 0;
    yt = new CVector2();
    r = [];
    i = [];
    b = !1;
    rt = !0;
    vt = s_oLevelSettings.getCurrentLevel();
    wt = getScoreTillLevel(vt);
    f = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
    s_oStage.addChild(f);
    p = !1;
    w = !1;
    h = !1;
    c = !1;
    pt = !0;
    n = s_oSpriteLibrary.getSprite("field");
    v = new createBitmap(n, n.width, n.height);
    v.regX = n.width / 2;
    v.regY = n.height / 2;
    v.x = CANVAS_WIDTH / 2;
    v.y = CANVAS_HEIGHT / 2 - 20;
    s_oStage.addChild(v);
    s = new CInterface();
    u = [];
    u[HORIZONTAL_LINE_UP] = new CEdge(309, 210, 1608, 210, 5, !1).getModel();
    u[HORIZONTAL_LINE_DOWN] = new CEdge(1608, 798, 309, 798, 5, !1).getModel();
    u[VERTICAL_LINE_LEFT_UP] = new CEdge(309, 360, 309, 210, 5, !1).getModel();
    u[VERTICAL_LINE_LEFT_DOWN] = new CEdge(309, 799, 309, 639, 5, !1).getModel();
    u[VERTICAL_LINE_RIGHT_UP] = new CEdge(1608, 210, 1608, 360, 5, !1).getModel();
    u[VERTICAL_LINE_RIGHT_DOWN] = new CEdge(1608, 639, 1608, 799, 5, !1).getModel();
    t = new CBall(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 230, s_oSpriteLibrary.getSprite("ball"), "ball_1", s_oStage);
    t.setVisible(!1);
    lt = [u[HORIZONTAL_LINE_UP], u[VERTICAL_LINE_LEFT_UP], u[VERTICAL_LINE_RIGHT_UP]];
    at = [u[HORIZONTAL_LINE_DOWN], u[VERTICAL_LINE_LEFT_DOWN], u[VERTICAL_LINE_RIGHT_DOWN]];
    r[GOALKEEPER] = new CStick(347, CANVAS_HEIGHT + 200, BLUE_STICK, 1150, 1410, [{
      y2: 475,
      y1: 514
    }], GOALKEEPER, PLAYER_SPEED_STICKS);
    r[DEFENDER] = new CStick(520, CANVAS_HEIGHT + 160, BLUE_STICK, 1140, 1350, [{
      y2: 320,
      y1: 360
    }, {
      y2: 633,
      y1: 673
    }], DEFENDER, PLAYER_SPEED_STICKS);
    r[MIDFIELDER] = new CStick(866, CANVAS_HEIGHT + 100, BLUE_STICK, 1145, 1210, [{
      y2: 253,
      y1: 292
    }, {
      y2: 407,
      y1: 450
    }, {
      y2: 560,
      y1: 600
    }, {
      y2: 714,
      y1: 752
    }], MIDFIELDER, PLAYER_SPEED_STICKS);
    r[STRIKER] = new CStick(1212, CANVAS_HEIGHT + 160, BLUE_STICK, 1155, 1320, [{
      y2: 305,
      y1: 340
    }, {
      y2: 483,
      y1: 517
    }, {
      y2: 668,
      y1: 706
    }], STRIKER, PLAYER_SPEED_STICKS);
    i[GOALKEEPER] = new CStick(CANVAS_WIDTH - 349, -270, RED_STICK, -400, -130, [{
      y1: 475,
      y2: 514
    }], GOALKEEPER, CPU_SPEED_STICKS);
    i[DEFENDER] = new CStick(CANVAS_WIDTH - 523, -240, RED_STICK, -335, -130, [{
      y1: 317,
      y2: 357
    }, {
      y1: 630,
      y2: 670
    }], DEFENDER, CPU_SPEED_STICKS);
    i[MIDFIELDER] = new CStick(CANVAS_WIDTH - 880, -165, RED_STICK, -190, -130, [{
      y1: 248,
      y2: 287
    }, {
      y1: 402,
      y2: 440
    }, {
      y1: 555,
      y2: 592
    }, {
      y1: 709,
      y2: 748
    }], MIDFIELDER, CPU_SPEED_STICKS);
    i[STRIKER] = new CStick(CANVAS_WIDTH - 1225, -237, RED_STICK, -320, -155, [{
      y1: 300,
      y2: 338
    }, {
      y1: 485,
      y2: 523
    }, {
      y1: 665,
      y2: 703
    }], STRIKER, CPU_SPEED_STICKS);
    ht = [r[GOALKEEPER], r[DEFENDER], r[MIDFIELDER], i[STRIKER]];
    ct = [i[GOALKEEPER], i[DEFENDER], i[MIDFIELDER], r[STRIKER]];
    st = [i[GOALKEEPER].getX(), i[DEFENDER].getX(), i[MIDFIELDER].getX(), i[STRIKER].getX()];
    n = s_oSpriteLibrary.getSprite("arena");
    o = new createBitmap(n, n.width, n.height);
    o.x = u[HORIZONTAL_LINE_UP].getPointA().getX() - 87;
    o.y = u[HORIZONTAL_LINE_UP].getPointA().getY() - 75;
    o.cache(0, 0, n.width, n.height);
    s_oStage.addChild(o);
    ft = new CScoreRod(POINTS_TO_WIN);
    d = new createjs.Shape();
    d.graphics.beginFill("#F00").drawRect(o.x + 10, o.y, 1456, 720);
    d.alpha = .01;
    s_oStage.addChild(d);
    t.getObject().mask = d;
    s.setOnTop();
    s_bMobile ? s.initMobileButtons() : (document.onkeydown = this.keyDownKeyBoard, document.onkeyup = this.keyUpKeyBoard);
    n = s_oSpriteLibrary.getSprite("but_kickoff");
    g = new CGfxButton(CANVAS_WIDTH * .5, CANVAS_HEIGHT * .5 + 300, n, s_oStage);
    g.pulseAnimation();
    g.addEventListener(ON_MOUSE_DOWN, this.onMouseDown, this);
    s_b2Players !== !0 || s_bMobile || s_bFirstMultiPlayer === !0 && (s_bFirstMultiPlayer = !1, s_bFirstPlay = !1, new CPanelTutorial());
    s_bFirstPlay === !0 && (s_bFirstPlay = !1, new CPanelTutorial());
  };
  this.keyUpKeyBoard = function (n) {
    n || (n = window.event);
    n.preventDefault();
    switch (n.keyCode) {
      case 87:
        p = !1;
        break;
      case 83:
        w = !1;
        break;
      case 38:
        h = !1;
        break;
      case 40:
        c = !1;
    }
  };
  this.keyDownKeyBoard = function (n) {
    n || (n = window.event);
    n.preventDefault();
    switch (n.keyCode) {
      case 87:
        p = !0;
        break;
      case 83:
        w = !0;
        break;
      case 38:
        h = !0;
        break;
      case 40:
        c = !0;
        break;
      case 32:
        n.keyCode === 32 && rt && b === !1 && ot.onMouseDown();
    }
    n.preventDefault();
  };
  this.AICpu = function (n, t) {
    var u = getNearestNumber(st, n.getX()),
      o,
      f,
      s,
      e,
      h,
      r,
      i;
    if (u === GOALKEEPER) {
      if (fixEnemyTremble(n, t[GOALKEEPER].getEdges()[0].getModel()) === !1) if (n.getY() > t[GOALKEEPER].getEdges()[0].getModel().m_pCenter().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
    } else if (u === DEFENDER) {
      if (o = [t[DEFENDER].getEdges()[0].getModel().m_pCenter().getY(), t[DEFENDER].getEdges()[1].getModel().m_pCenter().getY()], f = getNearestNumber(o, n.getY()), fixEnemyTremble(n, t[DEFENDER].getEdges()[f].getModel()) === !1) if (n.getY() - n.getHalfRadius() > t[DEFENDER].getEdges()[f].getModel().m_pCenter().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
    } else if (u === MIDFIELDER) {
      if (s = [t[MIDFIELDER].getEdges()[0].getModel().m_pCenter().getY(), t[MIDFIELDER].getEdges()[1].getModel().m_pCenter().getY(), t[MIDFIELDER].getEdges()[2].getModel().m_pCenter().getY(), t[MIDFIELDER].getEdges()[3].getModel().m_pCenter().getY()], e = getNearestNumber(s, n.getY()), fixEnemyTremble(n, t[MIDFIELDER].getEdges()[e].getModel()) === !1) if (n.getY() > t[MIDFIELDER].getEdges()[e].getModel().m_pCenter().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
    } else if (u === STRIKER && (h = [t[STRIKER].getEdges()[0].getModel().m_pCenter().getY(), t[STRIKER].getEdges()[1].getModel().m_pCenter().getY(), t[STRIKER].getEdges()[2].getModel().m_pCenter().getY()], r = getNearestNumber(h, n.getY()), fixEnemyTremble(n, t[STRIKER].getEdges()[r].getModel()) === !1)) if (r === 0) {
      if (n.getY() - n.getHalfRadius() > t[STRIKER].getEdges()[r].getModel().getPointB().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
    } else if (r === 2) {
      if (n.getY() - n.getHalfRadius() > t[STRIKER].getEdges()[r].getModel().getPointA().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
    } else if (n.getY() > t[STRIKER].getEdges()[r].getModel().m_pCenter().getY()) for (i = 0; i < t.length; i++) t[i].onKeyDown();else for (i = 0; i < t.length; i++) t[i].onKeyUp();
  };
  this.setBooleanUp1 = function (n) {
    p = n;
  };
  this.setBooleanDown1 = function (n) {
    w = n;
  };
  this.setBooleanUp2 = function (n) {
    h = n;
  };
  this.setBooleanDown2 = function (n) {
    c = n;
  };
  this.onMouseDown = function () {
    g.setVisible(!1);
    rt = !1;
    playSound("whistle", 1, !1);
    var n = new CVector2(randomFloatBetween(.05, .1) * randomSign(), -1);
    n.normalize();
    n.scalarProduct(BALL_START_VELOCITY);
    t.vCurForce().setV(n);
    t.setVisible(!0);
    t.scale(1.4);
    setTimeout(function () {
      t.scale(1);
    }, 400);
    b = !1;
    e = !0;
    setTimeout(function () {
      playSound("ball_wall", 1, !1);
    }, 250);
  };
  this.collideCircleWithEdges = function (n, t) {
    for (var r, u, i = 0; i < t.length; i++) if (r = collideEdgeWithCircle(t[i], n.vPos(), n.getRadius()), r) {
      playSound("ball_wall", 1, !1);
      u = new CVector2();
      u.setV(t[i].getNormal());
      u.scalarProduct(n.getRadius() * 1.05);
      r.closest_point.addV(u);
      n.setPos(r.closest_point);
      reflectVectorV2(n.vCurForce(), t[i].getNormal());
      break;
    }
  };
  this.onField = function (n) {
    var i = new CVector2();
    i.set(n.stageX / s_iScaleFactor, n.stageY / s_iScaleFactor);
    i.subtract(t.vPos());
    i.normalize();
    i.scalarProduct(1);
    t.vCurForce().setV(i);
  };
  this.unload = function () {
    ut = !1;
    s.unload();
    nt !== null && nt.unload();
    createjs.Tween.removeAllTweens();
    s_oStage.removeAllChildren();
  };
  this.onExit = function () {
    s_oGame.unload();
    s_oMain.gotoMenu();
  };
  this._onExitHelp = function () {
    ut = !0;
  };
  this.gameOver = function (n) {
    nt = new CEndPanel(s_oSpriteLibrary.getSprite("msg_box"), n);
    n === 0 && (y = 100 * l - 50 * a);
    s_bFriendly || saveScoreLevel(y, s_oLevelSettings.getCurrentLevel());
    nt.show(y, n);
  };
  this.collideBallWithPlayer = function (n, t) {
    for (var h, e, f, o, i, l, u, r = 0; r < t.length; r++) for (h = t[r].getEdges(), e = 0; e < h.length; e++) if (f = h[e].getModel(), o = collideEdgeWithCircle(f, n.vPos(), n.getRadius()), o) {
      i = new CVector2();
      i.setV(f.getNormal());
      l = randomFloatBetween(-.1, .1);
      i.add(0, l);
      var a = distance(o.closest_point, f.m_pCenter()),
        c = 0,
        v = f.getLength() * .5,
        y = BALL_SPEED / PHYSICS_ITERATIONS,
        p = BALL_SPEED / PHYSICS_ITERATIONS,
        s = new CVector2();
      c = a / v;
      u = 30 * c;
      u = degreesToRadians(u);
      o.closest_point.getY() > f.m_pCenter().getY() ? t[r].getColorStick() === BLUE_STICK ? i.rotate(-u) : i.rotate(+u) : t[r].getColorStick() === BLUE_STICK ? i.rotate(+u) : i.rotate(-u);
      s.setV(i);
      s.normalize();
      s.scalarProduct((1 - c) * p + y);
      n.vCurForce().setV(s);
      t[r].onShot();
      it === undefined || it === null ? it = playSound("ball_kick", .6, !1) : (stopSound("ball_kick"), it = playSound("ball_kick", .6, !1));
    }
  };
  this.goalCheck = function () {
    t.getX() > 1618 && (playSound("goal", 1, !1), k = !1, l++, ft.onGoalBlue(), s.refreshPlayersScore(l, a), this.showGoalText(0), l === POINTS_TO_WIN ? (setTimeout(function () {
      s_oGame.gameOver(0);
    }, TIME_GOAL_ANIMATION), s_bFriendly === !1 && s_iLastLevel < s_oLevelSettings.getNextLevel() && saveLevel(s_oLevelSettings.getNextLevel())) : (e = !1, setTimeout(this.afterGoal, 2e3)));
    t.getX() < 299 && (playSound("goal", 1, !1), k = !1, a++, ft.onGoalRed(), s.refreshPlayersScore(l, a), this.showGoalText(1), a === POINTS_TO_WIN ? setTimeout(function () {
      s_oGame.gameOver(1);
    }, TIME_GOAL_ANIMATION) : (e = !1, setTimeout(this.afterGoal, TIME_GOAL_ANIMATION)));
  };
  this.showGoalText = function (n) {
    var t = new createjs.Shape();
    t.graphics.beginFill("#000000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    t.alpha = .01;
    t.on("mousedown", function () {}, this);
    s_oStage.addChild(t);
    var i = s_oSpriteLibrary.getSprite("goal_text_" + s_iCurLang),
      r = {
        images: [i],
        frames: {
          width: i.width,
          height: i.height / 2,
          regX: i.width / 2,
          regY: i.height / 4
        },
        animations: {
          idle: [0, 1, "idle", .3]
        }
      },
      u = new createjs.SpriteSheet(r);
    f = new createjs.Sprite(u, "idle");
    f.x = CANVAS_WIDTH * .5;
    f.y = CANVAS_HEIGHT * .5;
    f.alpha = 0;
    f.scaleX = .3;
    f.scaleY = .3;
    s_oStage.addChild(f);
    n === 0 || s_b2Players ? playSound("goal_exultance", 1, !1) : n !== 1 || s_b2Players || playSound("miss_goal", 1, !1);
    new createjs.Tween.get(f).to({
      scaleX: .8,
      scaleY: .8,
      alpha: 1
    }, 900, createjs.Ease.cubicOut).wait(1300).to({
      scaleX: 0,
      scaleY: 0,
      alpha: 0
    }, 300, createjs.Ease.cubicIn).call(function () {
      s_oStage.removeChild(f, t);
    });
  };
  this.afterGoal = function () {
    g.setVisible(!0);
    t.resetPos();
    rt = !0;
    t.setVisible(!1);
    k = !0;
    e = !1;
  };
  this.update = function () {
    var n;
    if (!b) {
      if (et) {
        for (n = 0; n < PHYSICS_ITERATIONS; n++) t.vPos().addV(t.vCurForce()), t.vPos().getX() < CANVAS_WIDTH * .5 ? this.collideBallWithPlayer(t, ht) : this.collideBallWithPlayer(t, ct), t.vPos().getY() > CANVAS_HEIGHT / 2 - 34 ? this.collideCircleWithEdges(t, at) : this.collideCircleWithEdges(t, lt), t.rolls();
        tt && t.vCurForce().scalarProduct(.99);
      }
      if (t.updateSpritePosition(), k && this.goalCheck(), e) {
        if (p) for (n = 0; n < r.length; n++) r[n].onKeyUp();
        if (w) for (n = 0; n < r.length; n++) r[n].onKeyDown();
        if (s_b2Players) {
          if (c) for (n = 0; n < i.length; n++) i[n].onKeyDown();
          if (h) for (n = 0; n < i.length; n++) i[n].onKeyUp();
        } else {
          if (c) for (n = 0; n < r.length; n++) r[n].onKeyDown();
          if (h) for (n = 0; n < r.length; n++) r[n].onKeyUp();
        }
        s_b2Players || this.AICpu(t, i);
      }
      this.checkBallSlow();
    }
    for (n = 0; n < i.length; n++) r[n].update(), i[n].update();
  };
  this.checkBallSlow = function () {
    tt = t.vCurForce().getX() + t.vCurForce().getY() < .4 && t.vCurForce().getX() + t.vCurForce().getY() > -.4 ? !1 : !0;
  };
  this.setPause = function (n) {
    b = n;
  };
  this.setInput = function (n) {
    e = n;
  };
  s_oGame = this;
  POINTS_TO_LOSE = n.points_to_lose;
  START_SCORE = n.starting_points;
  AD_SHOW_COUNTER = n.ad_show_counter;
  ot = this;
  this._init();
}function CInterface() {
  var p,
    g,
    n,
    w,
    ft = null,
    tt,
    f = null,
    ut = null,
    c,
    nt,
    b,
    k,
    e,
    u,
    r,
    d,
    l,
    t,
    i,
    a,
    v,
    o,
    s,
    it,
    y,
    rt,
    h;
  return this._init = function () {
    var l, t, i, r, u;
    n = new createjs.Container();
    tt = !1;
    s_oStage.addChild(n);
    t = s_oSpriteLibrary.getSprite("but_exit");
    b = {
      x: CANVAS_WIDTH - t.height / 2 - 10,
      y: t.height / 2 + 10
    };
    g = new CGfxButton(b.x, b.y, t, n);
    g.addEventListener(ON_MOUSE_UP, this._onExit, this);
    l = CANVAS_WIDTH - t.width / 2 - 140;
    h = {
      x: l,
      y: t.height / 2 + 10
    };
    t = s_oSpriteLibrary.getSprite("but_pause");
    rt = new CGfxButton(h.x, h.y, t, n);
    rt.addEventListener(ON_MOUSE_UP, function () {
      new CPause();
    }, this);
    k = {
      x: h.x - t.width - 10,
      y: h.y
    };
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (t = s_oSpriteLibrary.getSprite("audio_icon"), p = new CToggle(k.x, k.y, t, s_bAudioActive, n), p.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this));
    i = window.document;
    r = i.documentElement;
    f = r.requestFullscreen || r.mozRequestFullScreen || r.webkitRequestFullScreen || r.msRequestFullscreen;
    ut = i.exitFullscreen || i.mozCancelFullScreen || i.webkitExitFullscreen || i.msExitFullscreen;
    ENABLE_FULLSCREEN === !1 && (f = !1);
    f && screenfull.isEnabled ? (t = s_oSpriteLibrary.getSprite("but_fullscreen"), e = {
      x: t.width / 4 + 10,
      y: t.height / 2 + 10
    }, y = {
      x: e.x + t.width / 2 + 10,
      y: e.y
    }, w = new CToggle(e.x, e.y, t, s_bFullscreen, n), w.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this)) : y = {
      x: t.width / 4 + 10,
      y: t.height / 2 + 10
    };
    t = s_oSpriteLibrary.getSprite("but_help");
    it = new CGfxButton(y.x, y.y, t, n);
    it.addEventListener(ON_MOUSE_UP, function () {
      new CPanelTutorial();
    }, this);
    nt = {
      x: CANVAS_WIDTH / 2,
      y: 83
    };
    c = new createjs.Container();
    n.addChild(c);
    t = s_oSpriteLibrary.getSprite("score_panel");
    u = new createBitmap(t, t.width, t.height);
    u.regX = t.width / 2;
    u.regY = t.height / 2;
    c.x = nt.x;
    c.y = nt.y;
    o = new createjs.Text(0, " 50px " + PRIMARY_FONT, "#000000");
    o.textAlign = "center";
    o.x = -50;
    o.y = 27;
    o.textBaseline = "alphabetic";
    s = new createjs.Text(0, " 50px " + PRIMARY_FONT, "#000000");
    s.textAlign = "center";
    s.x = 50;
    s.y = 27;
    s.textBaseline = "alphabetic";
    c.addChild(u, o, s);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  }, this.unload = function () {
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (p.unload(), p = null);
    g.unload();
    s_oStage.removeChild(n);
    f && screenfull.isEnabled && w.unload();
    s_oInterface = null;
  }, this.refreshPlayersScore = function (n, t) {
    o.text = n;
    s.text = t;
  }, this.initMobileButtons = function () {
    tt = !0;
    t;
    i;
    a;
    v;
    var f = s_oSpriteLibrary.getSprite("arrow");
    s_b2Players ? (t = {
      x: CANVAS_WIDTH / 2 - 800,
      y: CANVAS_HEIGHT / 2 + 240
    }, i = {
      x: CANVAS_WIDTH / 2 - 800,
      y: CANVAS_HEIGHT / 2 + 450
    }, a = {
      x: CANVAS_WIDTH / 2 + 800,
      y: CANVAS_HEIGHT / 2 + 240
    }, v = {
      x: CANVAS_WIDTH / 2 + 800,
      y: CANVAS_HEIGHT / 2 + 450
    }, u = new CGfxButton(t.x, t.y, f, n), u.setMuted(!0), r = new CGfxButton(i.x, i.y, f, n), r.setMuted(!0), d = new CGfxButton(a.x, a.y, f, n), d.setMuted(!0), l = new CGfxButton(v.x, v.y, f, n), l.setMuted(!0), r.getButtonImage().rotation = 180, l.getButtonImage().rotation = 180, d.addEventListener(ON_MOUSE_DOWN, function () {
      s_oGame.setBooleanUp2(!0);
    }, this), d.addEventListener(ON_MOUSE_UP, function () {
      s_oGame.setBooleanUp2(!1);
    }, this), l.addEventListener(ON_MOUSE_DOWN, function () {
      s_oGame.setBooleanDown2(!0);
    }, this), l.addEventListener(ON_MOUSE_UP, function () {
      s_oGame.setBooleanDown2(!1);
    }, this)) : (t = {
      x: CANVAS_WIDTH / 2 - 800,
      y: CANVAS_HEIGHT / 2 + 240
    }, i = {
      x: CANVAS_WIDTH / 2 - 800,
      y: CANVAS_HEIGHT / 2 + 450
    }, u = new CGfxButton(t.x, t.y, f, n), u.setMuted(!0), r = new CGfxButton(i.x, i.y, f, n), r.setMuted(!0), r.getButtonImage().rotation = 180);
    u.addEventListener(ON_MOUSE_DOWN, function () {
      s_oGame.setBooleanUp1(!0);
    }, this);
    u.addEventListener(ON_MOUSE_UP, function () {
      s_oGame.setBooleanUp1(!1);
    }, this);
    r.addEventListener(ON_MOUSE_DOWN, function () {
      s_oGame.setBooleanDown1(!0);
    }, this);
    r.addEventListener(ON_MOUSE_UP, function () {
      s_oGame.setBooleanDown1(!1);
    }, this);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  }, this.refreshButtonPos = function (n, o) {
    c.y = nt.y + o;
    it.setPosition(y.x + n, y.y + o);
    g.setPosition(b.x - n, o + b.y);
    rt.setPosition(h.x - n, o + h.y);
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && p.setPosition(k.x - n, o + k.y);
    f && screenfull.isEnabled && w.setPosition(e.x + n, e.y + o);
    s_bMobile && tt && (s_b2Players ? (u.setPosition(t.x + n, t.y - o), r.setPosition(i.x + n, i.y - o), d.setPosition(a.x - n, a.y - o), l.setPosition(v.x - n, v.y - o)) : (u.setPosition(t.x + n, t.y - o), r.setPosition(i.x + n, i.y - o)));
  }, this.setOnTop = function () {
    s_oStage.addChildAt(n, s_oStage.numChildren);
  }, this._onButRestartRelease = function () {
    s_oGame.restartGame();
  }, this.onExitFromHelp = function () {
    ft.unload();
  }, this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  }, this._onExit = function () {
    new CAreYouSurePanel(s_oGame.onExit);
  }, this.resetFullscreenBut = function () {
    f && screenfull.isEnabled && w.setActive(s_bFullscreen);
  }, this._onFullscreenRelease = function () {
    trace("s_bFullscreen " + s_bFullscreen);
    s_bFullscreen ? ut.call(window.document) : f.call(window.document.documentElement);
    sizeHandler();
  }, s_oInterface = this, this._init(), this;
}function CCreditsPanel() {
  var t, n, r, i, u;
  this._init = function () {
    var o, e, f;
    t = new createjs.Shape();
    t.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    t.alpha = 0;
    t.on("click", function () {});
    s_oStage.addChild(t);
    new createjs.Tween.get(t).to({
      alpha: .7
    }, 500);
    n = new createjs.Container();
    s_oStage.addChild(n);
    f = s_oSpriteLibrary.getSprite("msg_box");
    o = createBitmap(f);
    o.regX = f.width / 2;
    o.regY = f.height / 2;
    n.addChild(o);
    n.x = CANVAS_WIDTH / 2;
    n.y = CANVAS_HEIGHT + f.height / 2;
    u = {
      x: n.x,
      y: n.y
    };
    new createjs.Tween.get(n).to({
      y: CANVAS_HEIGHT / 2 - 40
    }, 500, createjs.Ease.quartIn);
    e = new createjs.Text("www.codethislab.com", " 40px " + PRIMARY_FONT, "#ffffff");
    e.y = 230;
    e.textAlign = "center";
    e.textBaseline = "middle";
    e.lineWidth = 300;
    n.addChild(e);
    f = s_oSpriteLibrary.getSprite("ctl_logo");
    i = createBitmap(f);
    i.regX = f.width / 2;
    i.regY = f.height / 2;
    i.cursor = "pointer";
    n.addChild(i);
    f = s_oSpriteLibrary.getSprite("but_exit");
    r = new CGfxButton(341, -195, f, n);
    r.addEventListener(ON_MOUSE_UP, this.unload, this);
  };
  this.unload = function () {
    r.setClickable(!1);
    new createjs.Tween.get(t).to({
      alpha: 0
    }, 500);
    new createjs.Tween.get(n).to({
      y: u.y
    }, 400, createjs.Ease.backIn).call(function () {
      s_oStage.removeChild(t);
      s_oStage.removeChild(n);
      r.unload();
    });
    t.off("click", function () {});
  };
  this._init();
}function CAreYouSurePanel(n){var u,r,i,t,f,e;this._init=function(){var n,f,o;s_oGame.setPause(!0);i=new createjs.Shape;i.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);i.alpha=0;i.on("mousedown",function(){});s_oStage.addChild(i);new createjs.Tween.get(i).to({alpha:.7},500);t=new createjs.Container;s_oStage.addChild(t);n=s_oSpriteLibrary.getSprite("msg_box");f=createBitmap(n);f.regX=n.width/2;f.regY=n.height/2;t.addChild(f);t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT+n.height/2;e={x:t.x,y:t.y};new createjs.Tween.get(t).to({y:CANVAS_HEIGHT/2-40},500,createjs.Ease.quartIn);o=new CTLText(t,-250,-200,500,250,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_ARE_SURE,!0,!0,!0,!1);u=new CGfxButton(110,130,s_oSpriteLibrary.getSprite("but_yes_big"),t);u.addEventListener(ON_MOUSE_UP,this._onButYes,this);r=new CGfxButton(-110,130,s_oSpriteLibrary.getSprite("but_exit"),t);r.addEventListener(ON_MOUSE_UP,this._onButNo,this);r.pulseAnimation()};this._onButYes=function(){r.setClickable(!1);u.setClickable(!1);new createjs.Tween.get(i).to({alpha:0},500);new createjs.Tween.get(t).to({y:e.y},400,createjs.Ease.backIn).call(function(){f.unload();n()})};this._onButNo=function(){r.setClickable(!1);u.setClickable(!1);new createjs.Tween.get(i).to({alpha:0},500);new createjs.Tween.get(t).to({y:e.y},400,createjs.Ease.backIn).call(function(){f.unload();s_oGame.setPause(!1)})};this.unload=function(){r.unload();u.unload();s_oStage.removeChild(i);s_oStage.removeChild(t);i.off("mousedown",function(){})};f=this;this._init(n)}function CEndPanel(n, t) {
  var r, i, u, s, h, c, f, o, l, a, e;
  return this._init = function (n, t) {
    var c, v, e;
    i = new createjs.Container();
    i.alpha = 0;
    i.visible = !1;
    s_oStage.addChild(i);
    s_oGame.setPause(!0);
    a = t;
    c = new createjs.Shape();
    c.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    c.alpha = .5;
    c.on("mousedown", this.onMouseDown, this);
    i.addChild(c);
    r = createBitmap(n);
    v = r.getBounds();
    r.regX = v.width / 2;
    r.regY = v.height / 2;
    r.x = CANVAS_WIDTH / 2;
    r.y = CANVAS_HEIGHT / 2;
    i.addChild(r);
    u = new CTLText(i, CANVAS_WIDTH / 2 - 350, CANVAS_HEIGHT / 2 - 250, 700, 160, 80, "center", "#fff", PRIMARY_FONT, 1, 0, 0, " ", !0, !0, !0, !1);
    s = new CTLText(i, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT / 2 - 90, 600, 100, 50, "center", "#fff", PRIMARY_FONT, 1, 0, 0, " ", !0, !0, !1, !1);
    h = new CTLText(i, CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT / 2 - 10, 600, 100, 60, "center", "#fff", PRIMARY_FONT, 1, 0, 0, " ", !0, !0, !1, !1);
    e = s_oSpriteLibrary.getSprite("but_restart");
    f = new CGfxButton(CANVAS_WIDTH / 2 + 100, CANVAS_HEIGHT / 2 + 170, e, i);
    e = s_oSpriteLibrary.getSprite("but_home");
    o = new CGfxButton(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 170, e, i);
    !s_bFriendly && a === 0 && s_oLevelSettings.getCurrentLevel() < s_oLevelSettings.getNumLevel() && (f.setX(CANVAS_WIDTH / 2), o.setX(f.getX() - 200), e = s_oSpriteLibrary.getSprite("but_next"), l = new CGfxButton(CANVAS_WIDTH / 2 + 200, CANVAS_HEIGHT / 2 + 170, e, i), l.addEventListener(ON_MOUSE_DOWN, this.onButNext, this));
  }, this.onButNext = function () {
    stopSound("applause");
    stopSound("game_over");
    s_oGame.unload();
    s_oLevelSettings.nextLevel();
    s_oMain.gotoGame();
    s_oStage.removeChild(i);
  }, this.unload = function () {}, this.onMouseDown = function () {}, this._initListener = function () {
    o.addEventListener(ON_MOUSE_DOWN, this._onExit, this);
    f.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
  }, this.show = function (n, t) {
    var r, f;
    e = 0;
    t === 0 || s_b2Players ? playSound("applause", 1, !1) : playSound("game_over", 1, !1);
    c = n;
    r = t + 1;
    t === 0 ? u.refreshText(TEXT_GAMEOVER) : (n = 0, c = 0, u.refreshText(TEXT_LOSE + r + TEXT_LOSE2));
    s_b2Players === !0 && u.refreshText(TEXT_WIN_2PLAYERS + r + TEXT_WIN_2PLAYERS_2);
    s_bFriendly || (void 0, e = getScoreTillLevel(s_oLevelSettings.getCurrentLevel()), s.refreshText(TEXT_SCORE + ": " + n), h.refreshText(TEXT_TOT_SCORE + ": " + e), s_oLevelSettings.getCurrentLevel() === s_oLevelSettings.getNumLevel() - 1 && t === 0 && u.refreshText(TEXT_WIN_TOURNAMENT));
    i.visible = !0;
    f = this;
    createjs.Tween.get(i).to({
      alpha: 1
    }, 500).call(function () {
      f._initListener();
    });
    s_bFriendly || (void 0, void 0);
  }, this._onExit = function () {
    stopSound("applause");
    stopSound("game_over");
    i.off("mousedown", this._onExit);
    s_oStage.removeChild(i);
    s_oGame.unload();
    s_oMain.gotoMenu();
  }, this._onRestart = function () {
    stopSound("applause");
    stopSound("game_over");
    s_oGame.unload();
    s_oMain.gotoGame();
    s_oStage.removeChild(i);
  }, this._init(n, t), this;
}function CEdgeModel(n,t,i,r){var u=null,f=null,o=null,s=null,e=null,h=5;return this._init=function(n,t,i,r){this.set(n,t,i,r)},this.destroy=function(){u=null;f=null;o=null;s=null;e=null},this.render=function(n){n.moveTo(u.x,u.y);n.lineTo(f.x,f.y)},this.toString=function(n){trace(n+" "+u.x+" "+u.y+" "+f.x+" "+f.y)},this.add=function(n){u.addV(n);f.addV(n)},this.set=function(n,t,i,r){u=new CVector2;f=new CVector2;u.set(n,t);f.set(i,r);this.calculateNormal();this.calculateCenter()},this.moveY=function(n){u.add(0,n);f.add(0,n);this.calculateNormal();this.calculateCenter()},this.scale=function(n){u.scalarProduct(n);f.scalarProduct(n);this.calculateNormal();this.calculateCenter()},this.calculateNormal=function(){e=null;e=new CVector2;e.setV(f);e.subtract(u);e.rot90CCW();e.normalize()},this.calculateCenter=function(){o=null;o=centerBetweenPointsV2(u,f);s=new CVector2;s.setV(e);s.scalarProduct(h);s.addV(o)},this.getPointA=function(){return u},this.m_pCenter=function(){return o},this.getPointB=function(){return f},this.getNormal=function(){return e},this.renderNormal=function(n){n.moveTo(o.x,o.y);n.lineTo(s.x,s.y)},this.getLength=function(){return Math.sqrt(Math.pow(i-n,2)+Math.pow(r-t,2))},this._init(n,t,i,r),this}function CEdgeViewer(n,t,i,r,u,f){var e;this.init=function(n,t,i,r,u,f){var o;o=n>i||t>r?t===r?(new createjs.Graphics).beginFill("#000").drawRect(i,r,u,f):(new createjs.Graphics).beginFill("#000").drawRect(i,r,f,u):t===r?(new createjs.Graphics).beginFill("#000").drawRect(n,t,u,f):(new createjs.Graphics).beginFill("#000").drawRect(n,t,f,u);e=new createjs.Shape(o);e.y=-f/2;s_oStage.addChild(e)};this.moveY=function(n){e.y+=n};this.init(n,t,i,r,u,f)}function CEdge(n,t,i,r,u,f){var e,o;this.init=function(n,t,i,r,u){var s;e=new CEdgeModel(n,t,i,r);s=e.getLength();f&&(o=new CEdgeViewer(n,t,i,r,s,u))};this.getModel=function(){return e};this.moveY=function(n){f&&o.moveY(n);e.moveY(n)};this.init(n,t,i,r,u)}function CVector2(n,t){var i,r;this._init=function(n,t){i=n;r=t};this.add=function(n,t){i+=n;r+=t};this.addV=function(n){i+=n.getX();r+=n.getY()};this.scalarDivision=function(n){i/=n;r/=n};this.subtract=function(n){i-=n.getX();r-=n.getY()};this.scalarProduct=function(n){i*=n;r*=n};this.invert=function(){i*=-1;r*=-1};this.dotProduct=function(n){return i*n.getX()+r*n.getY()};this.set=function(n,t){i=n;r=t};this.setV=function(n){i=n.getX();r=n.getY()};this.length=function(){return Math.sqrt(i*i+r*r)};this.length2=function(){return i*i+r*r};this.normalize=function(){var n=this.length();n>0&&(i/=n,r/=n)};this.angleBetweenVectors=function(n){var t=Math.acos(this.dotProduct(n)/(this.length()*n.length()));return isNaN(t)===!0?0:t};this.getNormalize=function(n){var t=this.length();n.set(i,r);n.normalize()};this.rot90CCW=function(){var n=i;i=-r;r=n};this.rot90CW=function(){var n=i;i=r;r=-n};this.getRotCCW=function(n){n.set(i,r);n.rot90CCW()};this.getRotCW=function(n){n.set(i,r);n.rot90CW()};this.ceil=function(){i=Math.ceil(i);r=Math.ceil(r)};this.round=function(){i=Math.round(i);r=Math.round(r)};this.toString=function(){return"Vector2: "+i+", "+r};this.print=function(){trace("Vector2: "+i+", "+r+"")};this.getX=function(){return i};this.getY=function(){return r};this.rotate=function(n){var t=i,u=r;i=t*Math.cos(n)+u*Math.sin(n);r=t*-Math.sin(n)+u*Math.cos(n)};this._init(n,t)}function CBall(n,t,i,r,u){var c,f,e,o,v,s,y,h,p,l,w,b,a=0;return this._init=function(n,t,i,r){f=new createjs.Container;f.x=n;f.y=t;this.createShadow();var u={images:[i],frames:{width:i.width/7,height:i.height,regX:i.width/14,regY:i.height/2}},o=new createjs.SpriteSheet(u);e=createSprite(o,0,i.width/14,i.height/2,i.width/7,i.height/2);e.stop();f.addChild(e);s=new CVector2;s.set(f.x,f.y);y=new CVector2;y.set(0,0);p=r;v={x:n,y:t};l=i.width*.5/7;w=l*.5;b=l*l;h=new CVector2(0,0);c.addChild(f)},this.createShadow=function(){var n=s_oSpriteLibrary.getSprite("player_shadow");o=createBitmap(n);o.regX=n.width*.5;o.regY=-7;o.y=-15;o.x=-5;o.alpha=.5;f.addChild(o)},this.unload=function(){c.removeChild(f)},this.setVisible=function(n){f.visible=n},this.setPosition=function(n,t){f.x=n;f.y=t},this.resetPos=function(){f.x=v.x;f.y=v.y;s.set(f.x,f.y);h.set(0,0)},this.setAngle=function(n){e.rotation=n},this.getHalfRadius=function(){return w},this.getX=function(){return f.x},this.getY=function(){return f.y},this.scale=function(n){f.scaleX=n;f.scaleY=n},this.getScale=function(){return f.scaleX},this.type=function(){return BALL},this.vCurForce=function(){return h},this.vPos=function(){return s},this.setPos=function(n){s.setV(n)},this.vPrevPos=function(){return y},this.getRadius=function(){return l},this.getRadiusQuadro=function(){return b},this.updateSpritePosition=function(){f.x=s.getX();f.y=s.getY()},this.isGoalKeeper=function(){return!1},this.getID=function(){return p},this.rolls=function(){var i=h.length2()*BALL_SPRITE_ANIM_MULTIPLIER,t=i,n;t>.1&&(t=.1);a+=t;a>7&&(a-=7);e.gotoAndStop(Math.round(a));h.getY()<0?(n=new CVector2(-1,0),e.rotation=radiansToDegree(n.angleBetweenVectors(h))-90):(n=new CVector2(1,0),e.rotation=radiansToDegree(n.angleBetweenVectors(h))+90)},this.getChildIndex=function(){c.getChildIndex(f)},this.setChildIndex=function(n){c.setChildIndex(f,n)},this.getObject=function(){return f},c=u,this._init(n,t,i,r),this}function CSelectPlayers(){var n,s,h,l,i,r,u,f,o,e,t=null,c=null,a;this.init=function(){var w,b,v,y,p;s_oSelectPlayers=this;n=new createjs.Container;s_oStage.addChild(n);v=s_oSpriteLibrary.getSprite("bg_menu");w=new createjs.Shape;w.graphics.beginFill("#000000").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);w.alpha=.7;b=new createBitmap(v,v.width,v.height);n.addChild(b);n.addChild(w);v=s_oSpriteLibrary.getSprite("but_p1");s=new CGfxButton(CANVAS_WIDTH/2-225,CANVAS_HEIGHT/2,v,n);s.addEventListener(ON_MOUSE_DOWN,function(){this.onSelectPlayer(!1)},this);v=s_oSpriteLibrary.getSprite("but_p2");h=new CGfxButton(CANVAS_WIDTH/2+225,CANVAS_HEIGHT/2,v,n);h.addEventListener(ON_MOUSE_DOWN,function(){this.onSelectPlayer(!0)},this);l=new CTLText(n,CANVAS_WIDTH/2-500,CANVAS_HEIGHT/2-300,1e3,150,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_SELECT_PLAYERS_MENU,!0,!0,!0,!1);v=s_oSpriteLibrary.getSprite("but_exit");i={x:CANVAS_WIDTH-v.width/2-10,y:v.height/2+10};f=new CGfxButton(i.x,i.y,v,n);f.addEventListener(ON_MOUSE_UP,this._onExit,this);a=v.height;(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&(r={x:f.getX()-v.width-10,y:v.height/2+10},o=new CToggle(r.x,r.y,s_oSpriteLibrary.getSprite("audio_icon"),s_bAudioActive,n),o.addEventListener(ON_MOUSE_UP,this._onAudioToggle,this));y=window.document;p=y.documentElement;t=p.requestFullscreen||p.mozRequestFullScreen||p.webkitRequestFullScreen||p.msRequestFullscreen;c=y.exitFullscreen||y.mozCancelFullScreen||y.webkitExitFullscreen||y.msExitFullscreen;ENABLE_FULLSCREEN===!1&&(t=!1);t&&screenfull.isEnabled&&(v=s_oSpriteLibrary.getSprite("but_fullscreen"),u={x:v.width/4+10,y:v.height/2+10},e=new CToggle(u.x,u.y,v,s_bFullscreen,n),e.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this));this.refreshButtonPos(s_iOffsetX,s_iOffsetY)};this.refreshButtonPos=function(n,s){f.setPosition(i.x-n,i.y+s);(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&o.setPosition(r.x-n,s+r.y);t&&screenfull.isEnabled&&e.setPosition(u.x+n,u.y+s)};this.onSelectPlayer=function(n){s_b2Players=n;this.unload();s_oMain.gotoGame(0)};this.unload=function(){f.unload();(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&o.unload();t&&screenfull.isEnabled&&e.unload();s_oStage.removeChild(n);s_oSelectPlayers=null};this._onAudioToggle=function(){Howler.mute(s_bAudioActive);s_bAudioActive=!s_bAudioActive};this.resetFullscreenBut=function(){t&&screenfull.isEnabled&&e.setActive(s_bFullscreen)};this._onFullscreenRelease=function(){s_bFullscreen?c.call(window.document):t.call(window.document.documentElement);sizeHandler()};this._onExit=function(){this.unload();s_oMain.gotoMenu()};this.init()}function CScoreRod(n){var f,r,u,s,i,t,e,o;this.init=function(n){var c,l,h;for(s=n,s>10&&(s=10),i=[],t=[],o=0,e=0,f=new createjs.Container,s_oStage.addChild(f),c=s_oSpriteLibrary.getSprite("score_rod_blue"),r=new createBitmap(c,c.width,c.height),r.x=CANVAS_WIDTH/2-720,r.y=CANVAS_HEIGHT/2-223,f.addChild(r),c=s_oSpriteLibrary.getSprite("score_rod_red"),u=new createBitmap(c,c.width,c.height),u.x=CANVAS_WIDTH/2+693,u.y=CANVAS_HEIGHT/2-223,f.addChild(u),c=s_oSpriteLibrary.getSprite("score_cube_blue"),l=s_oSpriteLibrary.getSprite("score_cube_red"),h=0;h<s;h++)i.push(new createBitmap(c,c.width,c.height)),i[h].x=r.x,t.push(new createBitmap(l,l.width,l.height)),t[h].x=u.x,h===0?(i[h].y=r.y+c.height-7,t[h].y=u.y+307):(i[h].y=i[h-1].y+c.height-8,t[h].y=t[h-1].y-l.height+9),f.addChild(i[h]);for(h=t.length;h>=0;h--)f.addChild(t[h])};this.onGoalBlue=function(){o===0?new createjs.Tween.get(i[i.length-1]).to({y:r.y+307},1e3,createjs.Ease.cubicOut):new createjs.Tween.get(i[i.length-(1+o)]).to({y:i[i.length-o].y-25},1e3,createjs.Ease.cubicOut);o++};this.onGoalRed=function(){e===0?new createjs.Tween.get(t[t.length-1]).to({y:u.y+33-8},1e3,createjs.Ease.cubicOut):new createjs.Tween.get(t[t.length-(1+e)]).to({y:t[t.length-e].y+33-8},1e3,createjs.Ease.cubicOut);e++};this.init(n)}function CLevelSettings(n){var i,t,r;this.init=function(n){t=0;i=n;s_oLevelSettings=this;r=getLastLevel()};this.loadLevel=function(n){t=n;POINTS_TO_WIN=i[n].points_to_win;CPU_SPEED_STICKS=i[n].cpu_speed_sticks;BALL_SPEED=i[n].ball_speed;console.log("BALL_SPEED "+BALL_SPEED)};this.nextLevel=function(){t<i.length&&(t++,this.loadLevel(t))};this.saveLevel=function(){r<t+1&&saveLevel(t+1)};this.getNextLevel=function(){return t<i.length?t+2:t+1};this.getCurrentLevel=function(){return t};this.getNumLevel=function(){return i.length};this.deleteSaveData=function(){var t=s_oSpriteLibrary.getSprite("msg_box"),n=new createjs.Container,i,r;n.x=CANVAS_WIDTH/2;n.y=CANVAS_HEIGHT/2;n.alpha=0;s_oStage.addChild(n);i=new createjs.Shape;i.graphics.beginFill("#000000").drawRect(-CANVAS_WIDTH/2,-CANVAS_HEIGHT/2,CANVAS_WIDTH,CANVAS_HEIGHT);i.alpha=.5;i.on("mousedown",function(){},this);n.addChild(i);r=new createBitmap(t,t.width,t.height);r.regX=t.width/2;r.regY=t.height/2;n.addChild(r);var e=new CTLText(n,-300,-210,600,200,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_DELETE_SAVE,!0,!0,!0,!1),f=new CGfxButton(-100,150,s_oSpriteLibrary.getSprite("but_yes_big"),n),u=new CGfxButton(100,150,s_oSpriteLibrary.getSprite("but_exit"),n);u.pulseAnimation();u.addEventListener(ON_MOUSE_UP,function(){new createjs.Tween.get(n).to({alpha:0},500).call(function(){s_oStage.removeChild(n)})},this);f.addEventListener(ON_MOUSE_UP,function(){clearLocalStorage();new createjs.Tween.get(n).to({alpha:0},500).call(function(){s_oStage.removeChild(n)})},this);new createjs.Tween.get(n).to({alpha:1},500)};this.init(n)}function CLevelBut(n,t,i,r,u,f){var h,c,l,a=[],v=[],y,o,s,e,p,w,b;this._init=function(n,t,i,r,u){c=[];l=[];e=new createjs.Container;p.addChild(e);var f={images:[r],frames:{width:r.width/2,height:r.height,regX:r.width/4,regY:r.height/2},animations:{state_true:[0],state_false:[1]}},v=new createjs.SpriteSheet(f);h=u;s=createSprite(v,"state_"+h,r.width/4,r.height/2,r.width/2,r.height);s.mouseEnabled=u;s.x=n;s.y=t;s.stop();!s_bMobile&&h&&(e.cursor="pointer");e.addChild(s);a.push(s);o=new createjs.Text(i,"80px "+PRIMARY_FONT,"#fff");o.x=n-7;o.y=t+30;o.textAlign="center";o.textBaseline="alphabetic";o.lineWidth=200;e.addChild(o);u||(o.color="#404040");this._initListener()};this.unload=function(){e.off("mousedown",w);e.off("pressup",b);e.removeChild(s)};this._initListener=function(){w=e.on("mousedown",this.buttonDown);b=e.on("pressup",this.buttonRelease)};this.viewBut=function(n){e.addChild(n)};this.addEventListener=function(n,t,i){c[n]=t;l[n]=i};this.addEventListenerWithParams=function(n,t,i,r){c[n]=t;l[n]=i;v=r};this.ifClickable=function(){return e.mouseEnabled===!0?1:0};this.setActive=function(n,t){h=t;a[n].gotoAndStop("state_"+h);a[n].mouseEnabled=!0;h?(o.color="#69b8d5",y.color="#004e6f"):(o.color="#b4b4b4",y.color="#606161")};this.buttonRelease=function(){h&&(playSound("click",1,!1),c[ON_MOUSE_UP]&&c[ON_MOUSE_UP].call(l[ON_MOUSE_UP],v))};this.buttonDown=function(){c[ON_MOUSE_DOWN]&&c[ON_MOUSE_DOWN].call(l[ON_MOUSE_DOWN],v)};this.setPosition=function(n,t){e.x=n;e.y=t};this.setVisible=function(n){e.visible=n};p=f;this._init(n,t,i,r,u,f)}function CLevelMenu() {
  var n,
    y,
    c,
    l,
    t,
    r,
    u,
    f,
    e,
    a,
    v = null,
    o = null,
    w,
    s,
    h,
    i = null,
    p = null;
  this._init = function () {
    var g = new createjs.Shape(),
      tt,
      c,
      b,
      k,
      nt,
      d;
    g.graphics.beginFill("#000000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.alpha = .7;
    s_iLastLevel = getLastLevel();
    n = 0;
    s = new createjs.Container();
    s_oStage.addChild(s);
    tt = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s.addChild(tt);
    s.addChild(g);
    w = new CTLText(s_oStage, CANVAS_WIDTH / 2 - 500, 120, 1e3, 250, 80, "center", "#fff", PRIMARY_FONT, 1, 0, 0, TEXT_SELECT_LEVEL, !0, !0, !0, !1);
    c = s_oSpriteLibrary.getSprite("but_exit");
    r = {
      x: CANVAS_WIDTH - c.width / 2 - 10,
      y: c.height / 2 + 10
    };
    e = new CGfxButton(r.x, r.y, c, s_oStage);
    e.addEventListener(ON_MOUSE_UP, this._onExit, this);
    y = c.height;
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (u = {
      x: e.getX() - c.width - 10,
      y: c.height / 2 + 10
    }, a = new CToggle(u.x, u.y, s_oSpriteLibrary.getSprite("audio_icon"), s_bAudioActive, s_oStage), a.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this));
    b = window.document;
    k = b.documentElement;
    i = k.requestFullscreen || k.mozRequestFullScreen || k.webkitRequestFullScreen || k.msRequestFullscreen;
    p = b.exitFullscreen || b.mozCancelFullScreen || b.webkitExitFullscreen || b.msExitFullscreen;
    ENABLE_FULLSCREEN === !1 && (i = !1);
    i && screenfull.isEnabled && (c = s_oSpriteLibrary.getSprite("but_fullscreen"), f = {
      x: c.width / 4 + 10,
      y: c.height / 2 + 10
    }, h = new CToggle(f.x, f.y, c, s_bFullscreen, s_oStage), h.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this));
    this._checkBoundLimits();
    l = [];
    var rt = CANVAS_WIDTH - EDGEBOARD_X * 2,
      ut = Math.floor(rt / NUM_COLS_PAGE_LEVEL) / 2,
      it = 0;
    for (nt = 0; nt < NUM_COLS_PAGE_LEVEL; nt++) l.push(it), it += ut * 2;
    if (t = [], this._createNewLevelPage(0, s_oLevelSettings.getNumLevel()), t.length > 1) {
      for (d = 1; d < t.length; d++) t[d].visible = !1;
      v = new CGfxButton(CANVAS_WIDTH / 2 + 300, CANVAS_HEIGHT / 2 + 350, s_oSpriteLibrary.getSprite("arrow"), s_oStage);
      v.getButtonImage().rotation = 90;
      v.addEventListener(ON_MOUSE_UP, this._onRight, this);
      o = new CGfxButton(CANVAS_WIDTH / 2 - 300, CANVAS_HEIGHT / 2 + 350, s_oSpriteLibrary.getSprite("arrow"), s_oStage);
      o.getButtonImage().rotation = -90;
      o.addEventListener(ON_MOUSE_UP, this._onLeft, this);
    }
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.unload = function () {
    for (var n = 0; n < c.length; n++) c[n].unload();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && a.unload();
    i && screenfull.isEnabled && h.unload();
    e.unload();
    o !== null && (o.unload(), v.unload());
    s_oLevelMenu = null;
  };
  this.refreshButtonPos = function (n, t) {
    e.setPosition(r.x - n, r.y + t);
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && a.setPosition(u.x - n, t + u.y);
    i && screenfull.isEnabled && h.setPosition(f.x + n, f.y + t);
  };
  this._checkBoundLimits = function () {
    for (var i = s_oSpriteLibrary.getSprite("but_level"), r = 0, f = CANVAS_HEIGHT - EDGEBOARD_Y * 2 - y * 2, n = 0; r < f;) r += i.height + 20, n++;
    NUM_ROWS_PAGE_LEVEL > n && (NUM_ROWS_PAGE_LEVEL = n);
    for (var t = 0, u = 0, e = CANVAS_WIDTH - EDGEBOARD_X * 2, i = s_oSpriteLibrary.getSprite("but_level"); u < e;) u += i.width / 2 + 5, t++;
    NUM_COLS_PAGE_LEVEL > t && (NUM_COLS_PAGE_LEVEL = t);
  };
  this._createNewLevelPage = function (n, i) {
    var r = new createjs.Container(),
      u,
      o;
    s.addChild(r);
    t.push(r);
    c = [];
    var f = 0,
      h = 0,
      a = 1,
      v = !1,
      e = s_oSpriteLibrary.getSprite("but_level");
    for (u = n; u < i; u++) if (o = new CLevelBut(l[f] + e.width / 4, h + e.height / 2, u + 1, e, u + 1 > s_iLastLevel ? !1 : !0, r), o.addEventListenerWithParams(ON_MOUSE_UP, this._onButLevelRelease, this, u), c.push(o), f++, f === l.length && u < i - 1 && (f = 0, h += e.height + 20, a++, a > NUM_ROWS_PAGE_LEVEL)) {
      v = !0;
      break;
    }
    r.x = CANVAS_WIDTH / 2;
    r.y = CANVAS_HEIGHT / 2;
    r.regX = r.getBounds().width / 2;
    r.regY = r.getBounds().height / 2;
    v && this._createNewLevelPage(u + 1, i);
  };
  this._onRight = function () {
    t[n].visible = !1;
    n++;
    n >= t.length && (n = 0);
    t[n].visible = !0;
  };
  this._onLeft = function () {
    t[n].visible = !1;
    n--;
    n < 0 && (n = t.length - 1);
    t[n].visible = !0;
  };
  this._onButLevelRelease = function (n) {
    s_oLevelSettings.loadLevel(n);
    s_oMain.gotoGame();
    this.unload();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this.resetFullscreenBut = function () {
    i && screenfull.isEnabled && h.setActive(s_bFullscreen);
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen ? p.call(window.document) : i.call(window.document.documentElement);
    sizeHandler();
  };
  this._onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  s_oLevelMenu = this;
  this._init();
}function CPanelTutorial(){var t,r,f,e,o,i,n,u;this.init=function(){s_oGame.setPause(!0);u=2;t=new createjs.Container;t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT/2;t.alpha=0;s_oStage.addChild(t);n=new createjs.Container;var s,h=new createjs.Shape;h.graphics.beginFill("#000000").drawRect(-(CANVAS_WIDTH/2),-(CANVAS_HEIGHT/2),CANVAS_WIDTH,CANVAS_HEIGHT);h.alpha=.7;h.on("mousedown",this.onOver,this);t.addChild(h);i=0;s=s_oSpriteLibrary.getSprite("msg_box");r=new createBitmap(s);r.regX=s.width/2;r.regY=s.height/2;r.alpha=.8;t.addChild(r);s=s_oSpriteLibrary.getSprite("skip_arrow");f=new CGfxButton(420,0,s,t);f.addEventListener(ON_MOUSE_DOWN,this.onButNext,this);s=s_oSpriteLibrary.getSprite("skip_arrow_left");e=new CGfxButton(-420,0,s,t);e.addEventListener(ON_MOUSE_DOWN,this.onButBack,this);o=new CGfxButton(0,t.getBounds().height/2-80,s_oSpriteLibrary.getSprite("but_next"),t);o.addEventListener(ON_MOUSE_DOWN,this.onButSkip,this);this.loadPage(i);new createjs.Tween.get(t).to({alpha:1},500)};this.loadPage=function(i){var c,r,u,f,e,o,s,h;switch(i){case 0:s_bMobile?(r=s_oSpriteLibrary.getSprite("arrow"),u=new createBitmap(r,r.width,r.height),u.x=-r.width/2-220,u.y=-40,n.addChild(u),f=new createBitmap(r,r.width,r.height),f.rotation=180,f.x=r.width/2+211,f.y=139,n.addChild(f)):s_b2Players?(r=s_oSpriteLibrary.getSprite("key_w"),u=new createBitmap(r,r.width,r.height),u.x=-250,u.y=0,n.addChild(u),r=s_oSpriteLibrary.getSprite("key_s"),f=new createBitmap(r,r.width,r.height),f.x=-150,f.y=0,n.addChild(f),r=s_oSpriteLibrary.getSprite("key_up"),e=new createBitmap(r,r.width,r.height),e.x=52,e.y=0,n.addChild(e),r=s_oSpriteLibrary.getSprite("key_down"),o=new createBitmap(r,r.width,r.height),o.x=150,o.y=0,n.addChild(o),s=new createjs.Text(TEXT_TUTORIAL_PLAYER+" 1"," 40px "+PRIMARY_FONT,"#FFFFFF"),s.textAlign="center",s.x=-147,s.y=-60,h=new createjs.Text(TEXT_TUTORIAL_PLAYER+" 2"," 40px "+PRIMARY_FONT,"#FFFFFF"),h.textAlign="center",h.x=150,h.y=-60):(r=s_oSpriteLibrary.getSprite("key_w"),u=new createBitmap(r,r.width,r.height),u.x=-250,n.addChild(u),r=s_oSpriteLibrary.getSprite("key_s"),f=new createBitmap(r,r.width,r.height),f.x=52,n.addChild(f),r=s_oSpriteLibrary.getSprite("key_up"),e=new createBitmap(r,r.width,r.height),e.x=-150,n.addChild(e),r=s_oSpriteLibrary.getSprite("key_down"),o=new createBitmap(r,r.width,r.height),o.x=150,n.addChild(o));c=new CTLText(n,-350,-220,700,150,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_TUTORIAL_1,!0,!0,!0,!1);t.addChild(n);break;case 1:r=s_oSpriteLibrary.getSprite("but_kickoff");u=new createBitmap(r,r.width,r.height);u.x=-r.width/2;u.y=-60;n.addChild(u);c=s_bMobile?new CTLText(n,-350,-220,700,150,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_TUTORIAL_4,!0,!0,!0,!1):new CTLText(n,-350,-220,700,150,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_TUTORIAL_3,!0,!0,!0,!1);break;case 2:c=new CTLText(n,-350,-220,700,150,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_TUTORIAL_2,!0,!0,!0,!1)}};this.onButNext=function(){i===u?i=0:i++;n.removeAllChildren();this.loadPage(i)};this.onButBack=function(){i===0?i=u:i--;n.removeAllChildren();this.loadPage(i)};this.onButSkip=function(){new createjs.Tween.get(t).to({alpha:0},500).call(function(){s_oStage.removeChild(t);s_oGame.setPause(!1)})};this.onOver=function(){};this.init()}function CPause(){var t,n,i,r=this;this.init=function(){s_oGame.setPause(!0);i=new createjs.Container;s_oStage.addChild(i);t=new createjs.Shape;t.graphics.beginFill("#000000").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n=new createjs.Text(TEXT_PAUSE,"185px "+PRIMARY_FONT,"#ffffff");n.textBaseline="alphabetic";n.textAlign="center";n.x=CANVAS_WIDTH/2;n.y=CANVAS_HEIGHT/2;i.addChild(t,n);t.alpha=0;n.alpha=0;new createjs.Tween.get(t).to({alpha:.5},400).call(function(){t.on("mousedown",r.onExit,r)});new createjs.Tween.get(n).to({alpha:1},400)};this.onExit=function(){new createjs.Tween.get(i).to({alpha:0},400).call(function(){n.alpha=0;s_oStage.removeChild(i);s_oGame.setPause(!1)})};this.init()}function CMsgBox(n,t){var e,r,f,i,u;this._init=function(){var t,f,n;i=new createjs.Container;u.addChild(i);t=new createjs.Shape;t.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);t.alpha=.7;t.on("click",function(){});i.addChild(t);f=s_oSpriteLibrary.getSprite("msg_box");n=createBitmap(f);n.x=CANVAS_WIDTH*.5;n.y=CANVAS_HEIGHT*.5;n.regX=f.width*.5;n.regY=f.height*.5;i.addChild(n);e=new CTLText(i,CANVAS_WIDTH/2-350,CANVAS_HEIGHT/2-240,700,400,80,"center","#fff",PRIMARY_FONT,1,0,0,TEXT_ERR_LS,!0,!0,!0,!1);r=new CGfxButton(CANVAS_WIDTH/2,880,s_oSpriteLibrary.getSprite("but_yes_big"),i);r.addEventListener(ON_MOUSE_UP,this._onButOk,this)};this._onButOk=function(){f.unload()};this.unload=function(){r.unload();u.removeChild(i)};f=this;u=t;this._init(n)}function CTextButton(n,t,i,r,u,f,e,o){var a,y,p,c,v,w,b,k,s,h,l;return this._init=function(n,t,i,r,u,f,e,o){a=!1;c=[];v=[];l=createBitmap(i);y=i.width;p=i.height;h=new createjs.Text(r,e+"px "+u,f);h.textAlign="center";h.textBaseline="alphabetic";h.lineWidth=y*.9;h.x=i.width/2;h.y=Math.floor(i.height/2)+15;s=new createjs.Container;s.x=n;s.y=t;s.regX=i.width/2;s.regY=i.height/2;s_bMobile||(s.cursor="pointer");s.addChild(l,h);o!==!1&&s_oStage.addChild(s);this._initListener()},this.unload=function(){s.off("mousedown",b);s.off("pressup",k);s_oStage.removeChild(s)},this.setVisible=function(n){s.visible=n},this.setAlign=function(n){h.textAlign=n},this.enable=function(){a=!1;l.filters=[];l.cache(0,0,y,p)},this.disable=function(){a=!0;var n=(new createjs.ColorMatrix).adjustSaturation(-100).adjustBrightness(40);l.filters=[new createjs.ColorMatrixFilter(n)];l.cache(0,0,y,p)},this._initListener=function(){b=s.on("mousedown",this.buttonDown);k=s.on("pressup",this.buttonRelease)},this.addEventListener=function(n,t,i){c[n]=t;v[n]=i},this.addEventListenerWithParams=function(n,t,i,r){c[n]=t;v[n]=i;w=r},this.buttonRelease=function(){a||(playSound("click",1,!1),s.scaleX=1,s.scaleY=1,c[ON_MOUSE_UP]&&c[ON_MOUSE_UP].call(v[ON_MOUSE_UP],w))},this.buttonDown=function(){a||(s.scaleX=.9,s.scaleY=.9,c[ON_MOUSE_DOWN]&&c[ON_MOUSE_DOWN].call(v[ON_MOUSE_DOWN]))},this.setPosition=function(n,t){s.x=n;s.y=t},this.changeText=function(n){h.text=n},this.setX=function(n){s.x=n},this.setY=function(n){s.y=n},this.getButtonImage=function(){return s},this.getX=function(){return s.x},this.getY=function(){return s.y},this.getSprite=function(){return s},this._init(n,t,i,r,u,f,e,o),this}function CTLText(n,t,i,r,u,f,e,o,s,h,c,l,a,v,y,p,w){this._oContainer=n;this._x=t;this._y=i;this._iWidth=r;this._iHeight=u;this._bMultiline=p;this._iFontSize=f;this._szAlign=e;this._szColor=o;this._szFont=s;this._iPaddingH=c;this._iPaddingV=l;this._bVerticalAlign=y;this._bFitText=v;this._bDebug=w;this._oDebugShape=null;this._fLineHeightFactor=h;this._oText=null;a&&this.__createText(a)}function CButLang(n,t,i,r,u,f){var o=r,y=i,s,h,l,a,c,e,v=f;this._init=function(n,t,i,r){var f,u,y,p;for(s=[],h=[],e=new createjs.Container,e.x=n,e.y=t,a=e.on("mousedown",this._onPress,this),l=e.on("click",this._onChangeLang,this),v.addChild(e),f={},u=0;u<i;u++)f["lang_"+u]=u;y={images:[r],frames:{width:LANG_WIDTH,height:LANG_HEIGHT},animations:f};p=new createjs.SpriteSheet(y);c=createSprite(p,"lang_"+o,0,0,LANG_WIDTH,LANG_HEIGHT);e.addChild(c);e.regX=LANG_WIDTH/2;e.regY=LANG_HEIGHT/2};this.unload=function(){e.off("mousedown",a);e.off("click",l)};this.addEventListener=function(n,t,i){s[n]=t;h[n]=i};this.setPosition=function(n,t){e.x=n;e.y=t};this.setLang=function(n){o=n;c.gotoAndStop("lang_"+o)};this._onPress=function(){e.scale=.9};this._onChangeLang=function(){e.scale=1;s[ON_SELECT_LANG]&&s[ON_SELECT_LANG].call(h[ON_SELECT_LANG],o)};this.getButtonImage=function(){return e};this._init(n,t,i,u)}function CLangPanel(n){var o,s,e,h,l,a,r,c,i,t,u,f,v=n,y=this;this._init=function(){o=[];s=[];f=new createjs.Container;f.visible=!1;v.addChild(f);i=new createjs.Shape;i.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);a=i.on("click",function(){});f.addChild(i);t=new createjs.Container;t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT/2;f.addChild(t);r=s_oSpriteLibrary.getSprite("msg_box");var n=createBitmap(r);t.addChild(n);this._placeLanguages();c=new CGfxButton(r.width,0,s_oSpriteLibrary.getSprite("but_exit"),t);c.addEventListener(ON_MOUSE_UP,this.hide,this);t.regX=r.width/2;t.regY=r.height/2};this.unload=function(){c.unload();i.off("click",a);for(var n=0;n<e.length;n++)e[n].off("click",h[n])};this.addEventListener=function(n,t,i){o[n]=t;s[n]=i};this.show=function(){f.visible=!0;i.alpha=0;createjs.Tween.get(i).to({alpha:.7},400,createjs.Ease.cubicOut);t.scaleX=t.scaleY=.01;t.alpha=0;createjs.Tween.get(t).wait(400).to({scale:1,alpha:1},1e3,createjs.Ease.elasticOut)};this.hide=function(){createjs.Tween.get(i).to({alpha:0},400,createjs.Ease.cubicOut);createjs.Tween.get(t).to({scaleX:.1,scaleY:.1,alpha:.5},400,createjs.Ease.backIn).call(function(){f.visible=!1})};this._placeLanguages=function(){var v,o,f,a,n,i;for(u=new createjs.Container,u.x=r.width/2,u.y=r.height/2,t.addChild(u),v=s_oSpriteLibrary.getSprite("but_lang"),o={},f=0;f<NUM_LANGUAGES;f++)o["lang_"+f]=f;var y={images:[v],frames:{width:LANG_WIDTH,height:LANG_HEIGHT,regX:LANG_WIDTH/2,regY:LANG_HEIGHT/2},animations:o},p=new createjs.SpriteSheet(y),s=0,c=0;for(e=[],h=[],l=[],a=0,n=0;n<NUM_LANGUAGES;n++)i=createSprite(p,"lang_"+n,LANG_WIDTH/2,LANG_HEIGHT/2,LANG_WIDTH,LANG_HEIGHT),i.x=s,i.y=c,l[n]=i.on("mousedown",this._onPressLang,this,!1,n),h[n]=i.on("click",this._onSelectLang,this,!1,n),u.addChild(i),e.push(i),a++,n>0&&a%NUM_ITEMS_PER_COLS==0?(s=0,c+=LANG_HEIGHT+10):s+=LANG_WIDTH+10;u.regX=LANG_WIDTH*NUM_ITEMS_PER_COLS/2-LANG_WIDTH/2;u.regY=c-130};this._onPressLang=function(n,t){e[t].scale=.9};this._onSelectLang=function(n,t){e[t].scale=1;o[ON_SELECT_LANG]&&o[ON_SELECT_LANG].call(s[ON_SELECT_LANG],t);y.hide()};this._init()}function clearLocalStorage(){var n,t;if(s_bStorageAvailable)for(n=0;n<localStorage.length;)t=localStorage.key(n),t.indexOf(GAME_NAME)!==-1?localStorage.removeItem(t):n++}function getScoreTillLevel(n){var i=0,t,r;if(s_bStorageAvailable)for(t=0;t<n;t++)r=getItem("score_"+GAME_NAME+"_"+t),r!==null&&(i+=parseInt(r));return console.log("iGlobalScore "+i),i}function saveScoreLevel(n,t){s_bStorageAvailable&&(console.log("saveScoreLevel "+t+" score "+n),saveItem("score_"+GAME_NAME+"_"+t,n))}function getLastLevel(){if(!s_bStorageAvailable)return 1;var n=getItem("level_"+GAME_NAME);return n===null&&(n=1),console.log("getLastLevel "+n),parseInt(n)}function saveLevel(n){s_bStorageAvailable&&(console.log("saveLevel "+n),saveItem("level_"+GAME_NAME,n))}var s_oMenu,s_oGame,s_oInterface,s_oSelectPlayers,s_oLevelMenu;(function(){"use strict";function p(n){return n=String(n),n.charAt(0).toUpperCase()+n.slice(1)}function nt(n,t,i){var r={"10.0":"10","6.4":"10 Technical Preview","6.3":"8.1","6.2":"8","6.1":"Server 2008 R2 / 7","6.0":"Server 2008 / Vista","5.2":"Server 2003 / XP 64-bit","5.1":"XP","5.01":"2000 SP1","5.0":"2000","4.0":"NT","4.90":"ME"};return t&&i&&/^Win/i.test(n)&&!/^Windows Phone /i.test(n)&&(r=r[/[\d.]+$/.exec(n)])&&(n="Windows "+r),n=String(n),t&&i&&(n=n.replace(RegExp(t,"i"),i)),o(n.replace(/ ce$/i," CE").replace(/\bhpw/i,"web").replace(/\bMacintosh\b/,"Mac OS").replace(/_PowerPC\b/i," OS").replace(/\b(OS X) [^ \d]+/i,"$1").replace(/\bMac (OS X)\b/,"$1").replace(/\/(\d)/," $1").replace(/_/g,".").replace(/(?: BePC|[ .]*fc[ \d.]+)$/i,"").replace(/\bx86\.64\b/gi,"x86_64").replace(/\b(Windows Phone) OS\b/,"$1").replace(/\b(Chrome OS \w+) [\d.]+\b/,"$1").split(" on ")[0])}function tt(n,t){var r=-1,i=n?n.length:0;if(typeof i=="number"&&i>-1&&i<=k)while(++r<i)t(n[r],r,n);else s(n,t)}function o(n){return n=w(n),/^(?:webOS|i(?:OS|P))/.test(n)?n:p(n)}function s(n,t){for(var i in n)g.call(n,i)&&t(n[i],i,n)}function t(n){return n==null?p(n):y.call(n).slice(8,-1)}function it(n,t){var i=n!=null?typeof n[t]:"number";return!/^(?:boolean|number|string|undefined)$/.test(i)&&(i=="object"?!!n[t]:!0)}function i(n){return String(n).replace(/([ -])(?!$)/g,"$1?")}function r(n,t){var i=null;return tt(n,function(r,u){i=t(i,r,u,n)}),i}function w(n){return String(n).replace(/^ +| +$/g,"")}function h(n){function ui(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function fi(t){return r(t,function(t,r,u){return t||(r[p]||r[/^[a-z]+(?: +[a-z]+\b)*/i.exec(p)]||RegExp("\\b"+i(u)+"(?:\\b|\\w*\\d)","i").exec(n))&&u})}function ei(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function oi(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+"(?:/[\\d.]+|[ \\w.]*)","i").exec(n))&&(t=nt(t,u,r.label||r)),t})}function wt(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+" *\\d+[.\\w_]*","i").exec(n)||RegExp("\\b"+u+" *\\w+-[\\w]*","i").exec(n)||RegExp("\\b"+u+"(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)","i").exec(n))&&((t=String(r.label&&!RegExp(u,"i").test(r.label)?r.label:t).split("/"))[1]&&!/[\d.]+/.test(t[0])&&(t[0]+=" "+t[1]),r=r.label||r,t=o(t[0].replace(RegExp(u,"i"),r).replace(RegExp("; *(?:"+r+"[_-])?","i")," ").replace(RegExp("("+r+")[-_.]?(\\w)","i"),"$1 $2"))),t})}function si(t){return r(t,function(t,i){return t||(RegExp(i+"(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)","i").exec(n)||0)[1]||null})}function hi(){return this.description||""}var g=u,ut=n&&typeof n=="object"&&t(n)!="String",ot,at,tt;ut&&(g=n,n=null);ot=g.navigator||{};at=ot.userAgent||"";n||(n=at);var ci=ut||d==b,bt=ut?!!ot.likeChrome:/\bChrome\b/.test(n)&&!/internal|\n/i.test(y.toString()),vt="Object",kt=ut?vt:"ScriptBridgingProxyObject",dt=ut?vt:"Environment",gt=ut&&g.java?"JavaPackage":t(g.java),ni=ut?vt:"RuntimeObject",st=/\bJava/.test(gt)&&g.java,ti=st&&t(g.environment)==dt,ii=st?"a":"α",ri=st?"b":"β",yt=g.document||{},ft=g.operamini||g.opera,ht=e.test(ht=ut&&ft?ft["[[Class]]"]:t(ft))?ht:ft=null,f,ct=n,v=[],lt=null,et=n==at,a=et&&ft&&typeof ft.version=="function"&&ft.version(),pt,k=ui([{label:"EdgeHTML",pattern:"Edge"},"Trident",{label:"WebKit",pattern:"AppleWebKit"},"iCab","Presto","NetFront","Tasman","KHTML","Gecko"]),c=ei(["Adobe AIR","Arora","Avant Browser","Breach","Camino","Electron","Epiphany","Fennec","Flock","Galeon","GreenBrowser","iCab","Iceweasel","K-Meleon","Konqueror","Lunascape","Maxthon",{label:"Microsoft Edge",pattern:"Edge"},"Midori","Nook Browser","PaleMoon","PhantomJS","Raven","Rekonq","RockMelt",{label:"Samsung Internet",pattern:"SamsungBrowser"},"SeaMonkey",{label:"Silk",pattern:"(?:Cloud9|Silk-Accelerated)"},"Sleipnir","SlimBrowser",{label:"SRWare Iron",pattern:"Iron"},"Sunrise","Swiftfox","Waterfox","WebPositive","Opera Mini",{label:"Opera Mini",pattern:"OPiOS"},"Opera",{label:"Opera",pattern:"OPR"},"Chrome",{label:"Chrome Mobile",pattern:"(?:CriOS|CrMo)"},{label:"Firefox",pattern:"(?:Firefox|Minefield)"},{label:"Firefox for iOS",pattern:"FxiOS"},{label:"IE",pattern:"IEMobile"},{label:"IE",pattern:"MSIE"},"Safari"]),p=wt([{label:"BlackBerry",pattern:"BB10"},"BlackBerry",{label:"Galaxy S",pattern:"GT-I9000"},{label:"Galaxy S2",pattern:"GT-I9100"},{label:"Galaxy S3",pattern:"GT-I9300"},{label:"Galaxy S4",pattern:"GT-I9500"},{label:"Galaxy S5",pattern:"SM-G900"},{label:"Galaxy S6",pattern:"SM-G920"},{label:"Galaxy S6 Edge",pattern:"SM-G925"},{label:"Galaxy S7",pattern:"SM-G930"},{label:"Galaxy S7 Edge",pattern:"SM-G935"},"Google TV","Lumia","iPad","iPod","iPhone","Kindle",{label:"Kindle Fire",pattern:"(?:Cloud9|Silk-Accelerated)"},"Nexus","Nook","PlayBook","PlayStation Vita","PlayStation","TouchPad","Transformer",{label:"Wii U",pattern:"WiiU"},"Wii","Xbox One",{label:"Xbox 360",pattern:"Xbox"},"Xoom"]),rt=fi({Apple:{iPad:1,iPhone:1,iPod:1},Archos:{},Amazon:{Kindle:1,"Kindle Fire":1},Asus:{Transformer:1},"Barnes & Noble":{Nook:1},BlackBerry:{PlayBook:1},Google:{"Google TV":1,Nexus:1},HP:{TouchPad:1},HTC:{},LG:{},Microsoft:{Xbox:1,"Xbox One":1},Motorola:{Xoom:1},Nintendo:{"Wii U":1,Wii:1},Nokia:{Lumia:1},Samsung:{"Galaxy S":1,"Galaxy S2":1,"Galaxy S3":1,"Galaxy S4":1},Sony:{PlayStation:1,"PlayStation Vita":1}}),l=oi(["Windows Phone","Android","CentOS",{label:"Chrome OS",pattern:"CrOS"},"Debian","Fedora","FreeBSD","Gentoo","Haiku","Kubuntu","Linux Mint","OpenBSD","Red Hat","SuSE","Ubuntu","Xubuntu","Cygwin","Symbian OS","hpwOS","webOS ","webOS","Tablet OS","Tizen","Linux","Mac OS X","Macintosh","Mac","Windows 98;","Windows "]);if(k&&(k=[k]),rt&&!p&&(p=wt([rt])),(f=/\bGoogle TV\b/.exec(p))&&(p=f[0]),/\bSimulator\b/i.test(n)&&(p=(p?p+" ":"")+"Simulator"),c=="Opera Mini"&&/\bOPiOS\b/.test(n)&&v.push("running in Turbo/Uncompressed mode"),c=="IE"&&/\blike iPhone OS\b/.test(n)?(f=h(n.replace(/like iPhone OS/,"")),rt=f.manufacturer,p=f.product):/^iP/.test(p)?(c||(c="Safari"),l="iOS"+((f=/ OS ([\d_]+)/i.exec(n))?" "+f[1].replace(/_/g,"."):"")):c!="Konqueror"||/buntu/i.test(l)?rt&&rt!="Google"&&(/Chrome/.test(c)&&!/\bMobile Safari\b/i.test(n)||/\bVita\b/.test(p))||/\bAndroid\b/.test(l)&&/^Chrome/.test(c)&&/\bVersion\//i.test(n)?(c="Android Browser",l=/\bAndroid\b/.test(l)?l:"Android"):c=="Silk"?(/\bMobi/i.test(n)||(l="Android",v.unshift("desktop mode")),/Accelerated *= *true/i.test(n)&&v.unshift("accelerated")):c=="PaleMoon"&&(f=/\bFirefox\/([\d.]+)\b/.exec(n))?v.push("identifying as Firefox "+f[1]):c=="Firefox"&&(f=/\b(Mobile|Tablet|TV)\b/i.exec(n))?(l||(l="Firefox OS"),p||(p=f[1])):!c||(f=!/\bMinefield\b/i.test(n)&&/\b(?:Firefox|Safari)\b/.exec(c))?(c&&!p&&/[\/,]|^[^(]+?\)/.test(n.slice(n.indexOf(f+"/")+8))&&(c=null),(f=p||rt||l)&&(p||rt||/\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(l))&&(c=/[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(l)?l:f)+" Browser")):c=="Electron"&&(f=(/\bChrome\/([\d.]+)\b/.exec(n)||0)[1])&&v.push("Chromium "+f):l="Kubuntu",a||(a=si(["(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))","Version",i(c),"(?:Firefox|Minefield|NetFront)"])),(f=k=="iCab"&&parseFloat(a)>3&&"WebKit"||/\bOpera\b/.test(c)&&(/\bOPR\b/.test(n)?"Blink":"Presto")||/\b(?:Midori|Nook|Safari)\b/i.test(n)&&!/^(?:Trident|EdgeHTML)$/.test(k)&&"WebKit"||!k&&/\bMSIE\b/i.test(n)&&(l=="Mac OS"?"Tasman":"Trident")||k=="WebKit"&&/\bPlayStation\b(?! Vita\b)/i.test(c)&&"NetFront")&&(k=[f]),c=="IE"&&(f=(/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(n)||0)[1])?(c+=" Mobile",l="Windows Phone "+(/\+$/.test(f)?f:f+".x"),v.unshift("desktop mode")):/\bWPDesktop\b/i.test(n)?(c="IE Mobile",l="Windows Phone 8.x",v.unshift("desktop mode"),a||(a=(/\brv:([\d.]+)/.exec(n)||0)[1])):c!="IE"&&k=="Trident"&&(f=/\brv:([\d.]+)/.exec(n))&&(c&&v.push("identifying as "+c+(a?" "+a:"")),c="IE",a=f[1]),et){if(it(g,"global"))if(st&&(f=st.lang.System,ct=f.getProperty("os.arch"),l=l||f.getProperty("os.name")+" "+f.getProperty("os.version")),ti){try{a=g.require("ringo/engine").version.join(".");c="RingoJS"}catch(li){(f=g.system)&&f.global.system==g.system&&(c="Narwhal",l||(l=f[0].os||null))}c||(c="Rhino")}else typeof g.process=="object"&&!g.process.browser&&(f=g.process)&&(typeof f.versions=="object"&&(typeof f.versions.electron=="string"?(v.push("Node "+f.versions.node),c="Electron",a=f.versions.electron):typeof f.versions.nw=="string"&&(v.push("Chromium "+a,"Node "+f.versions.node),c="NW.js",a=f.versions.nw)),c||(c="Node.js",ct=f.arch,l=f.platform,a=/[\d.]+/.exec(f.version),a=a?a[0]:null));else t(f=g.runtime)==kt?(c="Adobe AIR",l=f.flash.system.Capabilities.os):t(f=g.phantom)==ni?(c="PhantomJS",a=(f=f.version||null)&&f.major+"."+f.minor+"."+f.patch):typeof yt.documentMode=="number"&&(f=/\bTrident\/(\d+)/i.exec(n))?(a=[a,yt.documentMode],(f=+f[1]+4)!=a[1]&&(v.push("IE "+a[1]+" mode"),k&&(k[1]=""),a[1]=f),a=c=="IE"?String(a[1].toFixed(1)):a[0]):typeof yt.documentMode=="number"&&/^(?:Chrome|Firefox)\b/.test(c)&&(v.push("masking as "+c+" "+a),c="IE",a="11.0",k=["Trident"],l="Windows");l=l&&o(l)}if(a&&(f=/(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(a)||/(?:alpha|beta)(?: ?\d)?/i.exec(n+";"+(et&&ot.appMinorVersion))||/\bMinefield\b/i.test(n)&&"a")&&(lt=/b/i.test(f)?"beta":"alpha",a=a.replace(RegExp(f+"\\+?$"),"")+(lt=="beta"?ri:ii)+(/\d+\+?/.exec(f)||"")),c=="Fennec"||c=="Firefox"&&/\b(?:Android|Firefox OS)\b/.test(l))c="Firefox Mobile";else if(c=="Maxthon"&&a)a=a.replace(/\.[\d.]+/,".x");else if(/\bXbox\b/i.test(p))p=="Xbox 360"&&(l=null),p=="Xbox 360"&&/\bIEMobile\b/.test(n)&&v.unshift("mobile mode");else if((/^(?:Chrome|IE|Opera)$/.test(c)||c&&!p&&!/Browser|Mobi/.test(c))&&(l=="Windows CE"||/Mobi/i.test(n)))c+=" Mobile";else if(c=="IE"&&et)try{g.external===null&&v.unshift("platform preview")}catch(li){v.unshift("embedded")}else(/\bBlackBerry\b/.test(p)||/\bBB10\b/.test(n))&&(f=(RegExp(p.replace(/ +/g," *")+"/([.\\d]+)","i").exec(n)||0)[1]||a)?(f=[f,/BB10/.test(n)],l=(f[1]?(p=null,rt="BlackBerry"):"Device Software")+" "+f[0],a=null):this!=s&&p!="Wii"&&(et&&ft||/Opera/.test(c)&&/\b(?:MSIE|Firefox)\b/i.test(n)||c=="Firefox"&&/\bOS X (?:\d+\.){2,}/.test(l)||c=="IE"&&(l&&!/^Win/.test(l)&&a>5.5||/\bWindows XP\b/.test(l)&&a>8||a==8&&!/\bTrident\b/.test(n)))&&!e.test(f=h.call(s,n.replace(e,"")+";"))&&f.name&&(f="ing as "+f.name+((f=f.version)?" "+f:""),e.test(c)?(/\bIE\b/.test(f)&&l=="Mac OS"&&(l=null),f="identify"+f):(f="mask"+f,c=ht?o(ht.replace(/([a-z])([A-Z])/g,"$1 $2")):"Opera",/\bIE\b/.test(f)&&(l=null),et||(a=null)),k=["Presto"],v.push(f));return(f=(/\bAppleWebKit\/([\d.]+\+?)/i.exec(n)||0)[1])&&(f=[parseFloat(f.replace(/\.(\d)$/,".0$1")),f],c=="Safari"&&f[1].slice(-1)=="+"?(c="WebKit Nightly",lt="alpha",a=f[1].slice(0,-1)):(a==f[1]||a==(f[2]=(/\bSafari\/([\d.]+\+?)/i.exec(n)||0)[1]))&&(a=null),f[1]=(/\bChrome\/([\d.]+)/i.exec(n)||0)[1],f[0]==537.36&&f[2]==537.36&&parseFloat(f[1])>=28&&k=="WebKit"&&(k=["Blink"]),et&&(bt||f[1])?(k&&(k[1]="like Chrome"),f=f[1]||(f=f[0],f<530?1:f<532?2:f<532.05?3:f<533?4:f<534.03?5:f<534.07?6:f<534.1?7:f<534.13?8:f<534.16?9:f<534.24?10:f<534.3?11:f<535.01?12:f<535.02?"13+":f<535.07?15:f<535.11?16:f<535.19?17:f<536.05?18:f<536.1?19:f<537.01?20:f<537.11?"21+":f<537.13?23:f<537.18?24:f<537.24?25:f<537.36?26:k!="Blink"?"27":"28")):(k&&(k[1]="like Safari"),f=(f=f[0],f<400?1:f<500?2:f<526?3:f<533?4:f<534?"4+":f<535?5:f<537?6:f<538?7:f<601?8:"8")),k&&(k[1]+=" "+(f+=typeof f=="number"?".x":/[.+]/.test(f)?"":"+")),c=="Safari"&&(!a||parseInt(a)>45)&&(a=f)),c=="Opera"&&(f=/\bzbov|zvav$/.exec(l))?(c+=" ",v.unshift("desktop mode"),f=="zvav"?(c+="Mini",a=null):c+="Mobile",l=l.replace(RegExp(" *"+f+"$"),"")):c=="Safari"&&/\bChrome\b/.exec(k&&k[1])&&(v.unshift("desktop mode"),c="Chrome Mobile",a=null,/\bOS X\b/.test(l)?(rt="Apple",l="iOS 4.3+"):l=null),a&&a.indexOf(f=/[\d.]+$/.exec(l))==0&&n.indexOf("/"+f+"-")>-1&&(l=w(l.replace(f,""))),k&&!/\b(?:Avant|Nook)\b/.test(c)&&(/Browser|Lunascape|Maxthon/.test(c)||c!="Safari"&&/^iOS/.test(l)&&/\bSafari\b/.test(k[1])||/^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(c)&&k[1])&&(f=k[k.length-1])&&v.push(f),v.length&&(v=["("+v.join("; ")+")"]),rt&&p&&p.indexOf(rt)<0&&v.push("on "+rt),p&&v.push((/^on /.test(v[v.length-1])?"":"on ")+p),l&&(f=/ ([\d.+]+)$/.exec(l),pt=f&&l.charAt(l.length-f[0].length-1)=="/",l={architecture:32,family:f&&!pt?l.replace(f[0],""):l,version:f?f[1]:null,toString:function(){var n=this.version;return this.family+(n&&!pt?" "+n:"")+(this.architecture==64?" 64-bit":"")}}),(f=/\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(ct))&&!/\bi686\b/i.test(ct)?(l&&(l.architecture=64,l.family=l.family.replace(RegExp(" *"+f),"")),c&&(/\bWOW64\b/i.test(n)||et&&/\w(?:86|32)$/.test(ot.cpuClass||ot.platform)&&!/\bWin64; x64\b/i.test(n))&&v.unshift("32-bit")):l&&/^OS X/.test(l.family)&&c=="Chrome"&&parseFloat(a)>=39&&(l.architecture=64),n||(n=null),tt={},tt.description=n,tt.layout=k&&k[0],tt.manufacturer=rt,tt.name=c,tt.prerelease=lt,tt.product=p,tt.ua=n,tt.version=c&&a,tt.os=l||{architecture:null,family:null,version:null,toString:function(){return"null"}},tt.parse=h,tt.toString=hi,tt.version&&v.unshift(a),tt.name&&v.unshift(c),!l||!c||l==String(l).split(" ")[0]&&(l==c.split(" ")[0]||p)||v.push(p?"("+l+")":"on "+l),v.length&&(tt.description=v.join(" ")),tt}var c={"function":!0,object:!0},u=c[typeof window]&&window||this,b=u,l=c[typeof exports]&&exports,a=c[typeof module]&&module&&!module.nodeType&&module,n=l&&a&&typeof global=="object"&&global,f;n&&(n.global===n||n.window===n||n.self===n)&&(u=n);var k=Math.pow(2,53)-1,e=/\bOpera/,d=this,v=Object.prototype,g=v.hasOwnProperty,y=v.toString;f=h();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(u.platform=f,define(function(){return f})):l&&a?s(f,function(n,t){l[t]=n}):u.platform=f}).call(this);document.addEventListener("DOMContentLoaded",()=>{platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&(buildIOSFullscreenPanel(),buildIOSMeta())});window.addEventListener("resize",function(){platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&iosResize()});var s_iScaleFactor=1,s_iOffsetX,s_iOffsetY,s_bIsIphone=!1,s_bFocus=!0;if(function(n){(jQuery.browser=jQuery.browser||{}).mobile=/android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|tablet|treo|up\.(browser|link)|vodafone|wap|webos|windows (ce|phone)|xda|xiino/i.test(n)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(n.substr(0,4))}(navigator.userAgent||navigator.vendor||window.opera),$(window).resize(function(){sizeHandler()}),window.addEventListener("orientationchange",onOrientationChange),NoClickDelay.prototype={handleEvent:function(n){switch(n.type){case"touchstart":this.onTouchStart(n);break;case"touchmove":this.onTouchMove(n);break;case"touchend":this.onTouchEnd(n)}},onTouchStart:function(n){n.preventDefault();this.moved=!1;this.element.addEventListener("touchmove",this,!1);this.element.addEventListener("touchend",this,!1)},onTouchMove:function(){this.moved=!0},onTouchEnd:function(n){var t,i;this.element.removeEventListener("touchmove",this,!1);this.element.removeEventListener("touchend",this,!1);this.moved||(t=document.elementFromPoint(n.changedTouches[0].clientX,n.changedTouches[0].clientY),t.nodeType==3&&(t=t.parentNode),i=document.createEvent("MouseEvents"),i.initEvent("click",!0,!0),t.dispatchEvent(i))}},function(){function n(n){var i="visible",r="hidden",u={focus:i,focusin:i,pageshow:i,blur:r,focusout:r,pagehide:r};n=n||window.event;n.type in u?document.body.className=u[n.type]:(document.body.className=this[t]?"hidden":"visible",document.body.className==="hidden"?(s_oMain.stopUpdate(),s_bFocus=!1):(s_oMain.startUpdate(),s_bFocus=!0))}var t="hidden";t in document?document.addEventListener("visibilitychange",n):(t="mozHidden")in document?document.addEventListener("mozvisibilitychange",n):(t="webkitHidden")in document?document.addEventListener("webkitvisibilitychange",n):(t="msHidden")in document?document.addEventListener("msvisibilitychange",n):"onfocusin"in document?document.onfocusin=document.onfocusout=n:window.onpageshow=window.onpagehide=window.onfocus=window.onblur=n}(),String.prototype.format=function(){for(var n=this,t=arguments.length;t--;)n=n.replace(new RegExp("\\{"+t+"\\}","gm"),arguments[t]);return n},screenfull.enabled)screenfull.on("change",function(){s_bFullscreen=screenfull.isFullscreen;s_oInterface!==null&&s_oInterface.resetFullscreenBut();s_oMenu!==null&&s_oMenu.resetFullscreenBut();s_oSelectPlayers!==null&&s_oSelectPlayers.resetFullscreenBut();s_oLevelMenu!==null&&s_oLevelMenu.resetFullscreenBut()});var CANVAS_WIDTH=1920,CANVAS_HEIGHT=1080,EDGEBOARD_X=256,EDGEBOARD_Y=84,PRIMARY_FONT="RoundedMplus1c",GAME_NAME="foosball",FPS=30,FPS_TIME=1e3/FPS,DISABLE_SOUND_MOBILE=!1,MIN_PLAYER_FORCE_VEL=.1,BALL_SPRITE_ANIM_MULTIPLIER=.4,BALL=2,LEFT_SIDE=3,RIGHT_SIDE=4,MIN_DIST_COLLISION_DETECT=1e3,BUT_LEVEL_WIDTH=95,BUT_LEVEL_HEIGHT=84,NUM_ROWS_PAGE_LEVEL,NUM_COLS_PAGE_LEVEL,s_b2Players,s_bFriendly,s_bFirstPlay=!0,s_bFirstMultiPlayer=!0,BLUE_STICK=0,RED_STICK=1,PLAYER_SPEED_STICKS=15,CPU_SPEED_STICK_FRIENDLY,CPU_SPEED_STICKS,BALL_SPEED=18,NUM_GOAL_FRIENDLY,POINTS_TO_WIN=1,TIME_GOAL_ANIMATION=2500,STATE_LOADING=0,STATE_MENU=1,STATE_HELP=1,STATE_GAME=3,STATE_LEVEL_SELECTION=4,ON_MOUSE_DOWN=0,ON_MOUSE_UP=1,ON_MOUSE_OVER=2,ON_MOUSE_OUT=3,ON_DRAG_START=4,ON_DRAG_END=5,ON_SELECT_LANG=6,PHYSICS_ITERATIONS=10,BALL_START_VELOCITY=1.5,STICK_ACCELLERATION=1,STICK_FRICTION=.91,HORIZONTAL_LINE_UP=0,HORIZONTAL_LINE_DOWN=1,VERTICAL_LINE_LEFT_UP=2,VERTICAL_LINE_LEFT_DOWN=3,VERTICAL_LINE_RIGHT_UP=4,VERTICAL_LINE_RIGHT_DOWN=5,GOAL_HORIZONTAL_LEFT_UP=6,GOAL_HORIZONTAL_LEFT_DOWN=7,GOAL_HORIZONTAL_RIGHT_UP=8,GOAL_HORIZONTAL_RIGHT_DOWN=9,GOALKEEPER=0,DEFENDER=1,MIDFIELDER=2,STRIKER=3,ENABLE_FULLSCREEN,ENABLE_CHECK_ORIENTATION,AD_SHOW_COUNTER,SOUNDTRACK_VOLUME_IN_GAME=.1,NUM_LANGUAGES=13,LANG_EN=0,LANG_RU=1,LANG_ES=2,LANG_FR=3,LANG_DE=4,LANG_PT=5,LANG_IT=6,LANG_TR=7,LANG_AR=8,LANG_HI=9,LANG_ID=10,LANG_JA=11,LANG_ZH=12,LANG_CODES={};LANG_CODES.en=LANG_EN;LANG_CODES.es=LANG_ES;LANG_CODES.fr=LANG_FR;LANG_CODES.de=LANG_DE;LANG_CODES.pt=LANG_PT;LANG_CODES.it=LANG_IT;LANG_CODES.ru=LANG_RU;LANG_CODES.tr=LANG_TR;LANG_CODES.ar=LANG_AR;LANG_CODES.hi=LANG_HI;LANG_CODES.id=LANG_ID;LANG_CODES.ja=LANG_JA;LANG_CODES.zh=LANG_ZH;LANG_CODES.be=LANG_RU;LANG_CODES.kk=LANG_RU;LANG_CODES.uk=LANG_RU;LANG_CODES.uz=LANG_RU;var s_bMobile,s_bAudioActive=!1,s_iCntTime=0,s_iTimeElaps=0,s_iPrevTime=0,s_iCntFps=0,s_iCurFps=0,s_iLastLevel=1,s_bFullscreen=!1,s_bStorageAvailable=!0,s_oDrawLayer,s_oStage,s_oMain,s_oSpriteLibrary,s_oSoundtrack=null,s_oCanvas,s_aSounds,s_aSoundsInfo,s_iCurLang=LANG_EN,s_szGameID="9PNCQRBDTQN2";s_oMenu=null;s_oInterface=null;s_oSelectPlayers=null;s_oLevelSettings=null;s_oLevelMenu=null;CTLText.prototype={constructor:CTLText,__autofit:function(){if(this._bFitText){for(var n=this._iFontSize;this._oText.getBounds().height>this._iHeight-this._iPaddingV*2||this._oText.getBounds().width>this._iWidth-this._iPaddingH*2;)if(n--,this._oText.font=n+"px "+this._szFont,this._oText.lineHeight=Math.round(n*this._fLineHeightFactor),this.__updateY(),this.__verticalAlign(),n<8)break;this._iFontSize=n}},__verticalAlign:function(){if(this._bVerticalAlign){var n=this._oText.getBounds().height;this._oText.y-=(n-this._iHeight)/2+this._iPaddingV}},__updateY:function(){this._oText.y=this._y+this._iPaddingV;switch(this._oText.textBaseline){case"middle":this._oText.y+=this._oText.lineHeight/2+(this._iFontSize*this._fLineHeightFactor-this._iFontSize)}},__createText:function(n){this._bDebug&&(this._oDebugShape=new createjs.Shape,this._oDebugShape.graphics.beginFill("rgba(255,0,0,0.5)").drawRect(this._x,this._y,this._iWidth,this._iHeight),this._oContainer.addChild(this._oDebugShape));this._oText=new createjs.Text(n,this._iFontSize+"px "+this._szFont,this._szColor);this._oText.textBaseline="middle";this._oText.lineHeight=Math.round(this._iFontSize*this._fLineHeightFactor);this._oText.textAlign=this._szAlign;this._oText.lineWidth=this._bMultiline?this._iWidth-this._iPaddingH*2:null;switch(this._szAlign){case"center":this._oText.x=this._x+this._iWidth/2;break;case"left":this._oText.x=this._x+this._iPaddingH;break;case"right":this._oText.x=this._x+this._iWidth-this._iPaddingH}this._oContainer.addChild(this._oText);this.refreshText(n)},setVerticalAlign:function(n){this._bVerticalAlign=n},setOutline:function(n){this._oText!==null&&(this._oText.outline=n)},setShadow:function(n,t,i,r){this._oText!==null&&(this._oText.shadow=new createjs.Shadow(n,t,i,r))},setColor:function(n){this._oText.color=n},setAlpha:function(n){this._oText.alpha=n},removeTweens:function(){createjs.Tween.removeTweens(this._oText)},getText:function(){return this._oText},getY:function(){return this._y},getFontSize:function(){return this._iFontSize},refreshText:function(n){n===""&&(n=" ");this._oText===null&&this.__createText(n);this._oText.text=n;this._oText.font=this._iFontSize+"px "+this._szFont;this._oText.lineHeight=Math.round(this._iFontSize*this._fLineHeightFactor);this.__autofit();this.__updateY();this.__verticalAlign()}};const LANG_WIDTH=110,LANG_HEIGHT=110;const NUM_ITEMS_PER_COLS=5