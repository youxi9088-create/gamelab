/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license <https://mths.be/mit>
 */
function buildIOSMeta(){for(var n,i,r=[{name:"viewport",content:"width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"},{name:"apple-mobile-web-app-capable",content:"yes"},{name:"apple-mobile-web-app-status-bar-style",content:"black"}],t=0;t<r.length;t++)n=document.createElement("meta"),n.name=r[t].name,n.content=r[t].content,i=window.document.head.querySelector('meta[name="'+n.name+'"]'),i&&i.parentNode.removeChild(i),window.document.head.appendChild(n)}function hideIOSFullscreenPanel(){document.querySelector(".xxx-ios-fullscreen-message").style.display="none";document.querySelector(".xxx-ios-fullscreen-scroll").style.display="none";document.querySelector(".xxx-game-iframe-full").classList.remove("xxx-game-iframe-iphone-se")}function buildIOSFullscreenPanel(){var n="";n+='<div class="xxx-ios-fullscreen-message">';n+='<div class="xxx-ios-fullscreen-swipe">';n+="<\/div>";n+="<\/div>";n+='<div class="xxx-ios-fullscreen-scroll">';n+="<\/div>";document.body.insertAdjacentHTML("beforeend",n)}function showIOSFullscreenPanel(){document.querySelector(".xxx-ios-fullscreen-message").style.display="none";document.querySelector(".xxx-ios-fullscreen-scroll").style.display="none"}function __iosResize(){if(window.scrollTo(0,0),console.log(window.devicePixelRatio),console.log(window.innerWidth),console.log(window.innerHeight),platform.product==="iPhone")switch(window.devicePixelRatio){case 2:switch(window.innerWidth){case 568:window.innerHeight===320||document.querySelector(".xxx-game-iframe-full").classList.add("xxx-game-iframe-iphone-se");break;case 667:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;case 3:switch(window.innerWidth){case 736:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 724:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;default:hideIOSFullscreenPanel()}}function iosResize(){__iosResize();setTimeout(function(){__iosResize()},500)}function iosInIframe(){try{return window.self!==window.top}catch(n){return!0}}function isIOSLessThen13(){var n=platform.os,t=n.family.toLowerCase(),i=parseFloat(n.version);return t==="ios"&&i<13?!0:!1}function trace(n){console.log(n)}function isChrome(){return/Chrome/.test(navigator.userAgent)&&/Google Inc/.test(navigator.vendor)}function isIpad(){var n="ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0,t=navigator.userAgent.includes("Intel Mac OS X");return n&&t}function isMobile(){return isIpad()?!0:navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function isIOS(){var n,t;if(isIpad())return!0;for(n=["iPad","iPhone","iPod","Mac"];n.length;){let i=navigator?.userAgentData?.platform||navigator?.platform;if(i=i.toLowerCase(),t=n.pop(),i&&i.includes(t.toLowerCase()))return t==="iPhone"&&(s_bIsIphone=!0),!0}return!1}function getVisibleWidth(){return CANVAS_WIDTH-s_iOffsetX*2}function getVisibleHeight(){return CANVAS_HEIGHT-s_iOffsetY*2}function getVisibleRatio(){return getVisibleWidth()/getVisibleHeight()}function isWideScreen(){return s_bLandscape&&getVisibleRatio()>=WIDESCREEN_RATIO}function getSize(n){var u,e=n.toLowerCase(),f=window.document,t=f.documentElement,i,r;return window["inner"+n]===undefined?u=t["client"+n]:window["inner"+n]!=t["client"+n]?(i=f.createElement("body"),i.id="vpw-test-b",i.style.cssText="overflow:scroll",r=f.createElement("div"),r.id="vpw-test-d",r.style.cssText="position:absolute;top:-1000px",r.innerHTML="<style>@media("+e+":"+t["client"+n]+"px){body#vpw-test-b div#vpw-test-d{"+e+":7px!important}}<\/style>",i.appendChild(r),t.insertBefore(i,f.head),u=r["offset"+n]==7?t["client"+n]:window["inner"+n],t.removeChild(i)):u=window["inner"+n],u}function onOrientationChange(){window.matchMedia("(orientation: portrait)").matches&&sizeHandler();window.matchMedia("(orientation: landscape)").matches&&sizeHandler()}function getIOSWindowHeight(){var n=document.documentElement.clientWidth/window.innerWidth;return window.innerHeight*n}function getHeightOfIOSToolbars(){var n=(window.orientation===0?screen.height:screen.width)-getIOSWindowHeight();return n>1?n:0}function sizeHandler(){var i,r,h;if(window.scrollTo(0,1),$("#canvas")){i=platform.name!==null&&platform.name.toLowerCase()==="safari"?getIOSWindowHeight():getSize("Height");r=getSize("Width");s_bFocus&&_checkOrientation(r,i);var e=Math.min(i/CANVAS_HEIGHT,r/CANVAS_WIDTH),n=Math.round(CANVAS_WIDTH*e),t=Math.round(CANVAS_HEIGHT*e),f=0;t<i?(f=i-t,t+=f,n+=f*(CANVAS_WIDTH/CANVAS_HEIGHT)):n<r&&(f=r-n,n+=f,t+=f*(CANVAS_HEIGHT/CANVAS_WIDTH));var u=i/2-t/2,o=r/2-n/2,s=CANVAS_WIDTH/n;(o*s<-EDGEBOARD_X||u*s<-EDGEBOARD_Y)&&(e=Math.min(i/(CANVAS_HEIGHT-EDGEBOARD_Y*2),r/(CANVAS_WIDTH-EDGEBOARD_X*2)),n=Math.round(CANVAS_WIDTH*e),t=Math.round(CANVAS_HEIGHT*e),u=(i-t)/2,o=(r-n)/2,s=CANVAS_WIDTH/n);s_iOffsetX=-1*o*s;s_iOffsetY=-1*u*s;u>=0&&(s_iOffsetY=0);o>=0&&(s_iOffsetX=0);s_oInterface!==null&&s_oInterface.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_oMenu!==null&&s_oMenu.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_bIsIphone&&s_oStage?(canvas=document.getElementById("canvas"),s_oStage.canvas.width=n*2,s_oStage.canvas.height=t*2,canvas.style.width=n+"px",canvas.style.height=t+"px",h=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_iScaleFactor=h*2,s_oStage.scaleX=s_oStage.scaleY=s_iScaleFactor):s_bMobile||isChrome()?($("#canvas").css("width",n+"px"),$("#canvas").css("height",t+"px")):s_oStage&&(s_oStage.canvas.width=n,s_oStage.canvas.height=t,s_iScaleFactor=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_oStage.scaleX=s_oStage.scaleY=s_iScaleFactor);u<0?$("#canvas").css("top",u+"px"):(u=(i-t)/2,$("#canvas").css("top",u+"px"));$("#canvas").css("left",o+"px");fullscreenHandler()}}function _checkOrientation(n,t){s_bMobile&&ENABLE_CHECK_ORIENTATION&&(n>t?$(".orientation-msg-container").attr("data-orientation")==="landscape"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()):$(".orientation-msg-container").attr("data-orientation")==="portrait"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()))}function playSound(n,t,i){return DISABLE_SOUND_MOBILE===!1||s_bMobile===!1?(s_aSounds[n].play(),s_aSounds[n].volume(t),s_aSounds[n].loop(i),s_aSounds[n]):null}function stopSound(n){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].stop()}function setVolume(){return}function setMute(n,t){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].mute(t)}function createBitmap(n,t,i){var u=new createjs.Bitmap(n),r=new createjs.Shape;return t&&i?r.graphics.beginFill("#fff").drawRect(0,0,t,i):r.graphics.beginFill("#ff0").drawRect(0,0,n.width,n.height),u.hitArea=r,u}function createSprite(n,t,i,r,u,f){var e,o;return e=t!==null?new createjs.Sprite(n,t):new createjs.Sprite(n),o=new createjs.Shape,o.graphics.beginFill("#000000").drawRect(-i,-r,u,f),e.hitArea=o,e}function randomFloatBetween(n,t,i){return typeof i=="undefined"&&(i=2),parseFloat(Math.min(n+Math.random()*(t-n),t).toFixed(i))}function shuffle(n){for(var t=n.length,r,i;0!==t;)i=Math.floor(Math.random()*t),t-=1,r=n[t],n[t]=n[i],n[i]=r;return n}function formatTime(n){var i,t,r;return n/=1e3,i=Math.floor(n/60),t=n-i*60,t=parseFloat(t).toFixed(1),r="",r+=i<10?"0"+i+":":i+":",r+(t<10?"0"+t:t)}function roundDecimal(n,t){var i=Math.pow(10,t);return Math.round(i*n)/i}function tweenVectors(n,t,i,r){return r.set(n.getX()+i*(t.getX()-n.getX()),n.getY()+i*(t.getY()-n.getY())),r}function NoClickDelay(n){this.element=n;window.Touch&&this.element.addEventListener("touchstart",this,!1)}function ctlArcadeResume(){s_oMain!==null&&s_oMain.startUpdate()}function ctlArcadePause(){s_oMain!==null&&s_oMain.stopUpdate()}function getParamValue(n){for(var i,u=window.location.search.substring(1),r=u.split("&"),t=0;t<r.length;t++)if(i=r[t].split("="),i[0]==n)return i[1]}function fullscreenHandler(){ENABLE_FULLSCREEN&&screenfull.isEnabled!==!1&&(s_bFullscreen=screenfull.isFullscreen,s_oInterface!==null&&s_oInterface.resetFullscreenBut(),s_oMenu!==null&&s_oMenu.resetFullscreenBut())}function saveItem(n,t){s_bStorageAvailable&&localStorage.setItem(n,t)}function getItem(n){return s_bStorageAvailable?localStorage.getItem(n):null}function CSpriteLibrary(){var t={},n,i,u,f,e,r;this.init=function(t,o,s){n={};i=0;u=0;f=t;e=o;r=s};this.addSprite=function(r,u){if(t.hasOwnProperty(r))return!1;var f=new Image;return t[r]=n[r]={szPath:u,oSprite:f,bLoaded:!1},i++,!0};this.getSprite=function(n){return t.hasOwnProperty(n)?t[n].oSprite:null};this._onSpritesLoaded=function(){i=0;e.call(r)};this._onSpriteLoaded=function(){f.call(r);++u===i&&this._onSpritesLoaded()};this.loadSprites=function(){for(var t in n)n[t].oSprite.oSpriteLibrary=this,n[t].oSprite.szKey=t,n[t].oSprite.onload=function(){this.oSpriteLibrary.setLoaded(this.szKey);this.oSpriteLibrary._onSpriteLoaded(this.szKey)},n[t].oSprite.onerror=function(t){var i=t.currentTarget;setTimeout(function(){n[i.szKey].oSprite.src=n[i.szKey].szPath},500)},n[t].oSprite.src=n[t].szPath};this.setLoaded=function(n){t[n].bLoaded=!0};this.isLoaded=function(n){return t[n].bLoaded};this.getNumSprites=function(){return i}}function CPreloader(){var s,o,r,t,u,f,i,e,n;this._init=function(){s_oSpriteLibrary.init(this._onImagesLoaded,this._onAllImagesLoaded,this);s_oSpriteLibrary.addSprite("progress_bar","./sprites/progress_bar.png");s_oSpriteLibrary.addSprite("200x200","./sprites/200x200.png");s_oSpriteLibrary.loadSprites();n=new createjs.Container;s_oStage.addChild(n)};this.unload=function(){n.removeAllChildren()};this._onImagesLoaded=function(){};this._onAllImagesLoaded=function(){this.attachSprites();s_oMain.preloaderReady()};this.attachSprites=function(){var c=new createjs.Shape,h;c.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(c);h=s_oSpriteLibrary.getSprite("200x200");i=createBitmap(h);i.regX=h.width*.5;i.regY=h.height*.5;i.x=CANVAS_WIDTH/2;i.y=CANVAS_HEIGHT/2-80;n.addChild(i);e=new createjs.Shape;e.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(i.x-100,i.y-100,200,200,10);n.addChild(e);i.mask=e;h=s_oSpriteLibrary.getSprite("progress_bar");t=createBitmap(h);t.x=CANVAS_WIDTH/2-h.width/2;t.y=CANVAS_HEIGHT/2+70;n.addChild(t);s=h.width;o=h.height;u=new createjs.Shape;u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,1,o);n.addChild(u);t.mask=u;r=new createjs.Text("","30px "+FONT1,"#fff");r.x=CANVAS_WIDTH/2;r.y=CANVAS_HEIGHT/2+120;r.textBaseline="alphabetic";r.textAlign="center";n.addChild(r);f=new createjs.Shape;f.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(f);createjs.Tween.get(f).to({alpha:0},500).call(function(){createjs.Tween.removeTweens(f);n.removeChild(f)})};this.refreshLoader=function(n){r.text=n+"%";n===100&&(s_oMain._onRemovePreloader(),r.visible=!1,t.visible=!1);u.graphics.clear();var i=Math.floor(n*s/100);u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,i,o)};this._init()}function CMain(n) {
  var r,
    u = 0,
    f = 0,
    e = STATE_LOADING,
    t,
    o,
    h,
    c,
    s,
    i;
  this.initContainer = function () {
    s_oCanvas = document.getElementById("canvas");
    s_oStage = new createjs.Stage(canvas);
    s_bMobile = isMobile();
    s_bMobile === !1 ? s_oStage.enableMouseOver(20) : createjs.Touch.enable(s_oStage, !0);
    s_iPrevTime = new Date().getTime();
    createjs.Ticker.framerate = 30;
    createjs.Ticker.addEventListener("tick", this._update);
    s_oSpriteLibrary = new CSpriteLibrary();
    o = new CPreloader();
  };
  this.soundLoaded = function () {
    u++;
    var n = Math.floor(u / f * 100);
    o.refreshLoader(n);
  };
  this._initSounds = function () {
    Howler.mute(!s_bAudioActive);
    s_aSoundsInfo = [];
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "card",
      loop: !1,
      volume: 1,
      ingamename: "card"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "press_but",
      loop: !1,
      volume: 1,
      ingamename: "press_but"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "win",
      loop: !1,
      volume: 1,
      ingamename: "win"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "lose",
      loop: !1,
      volume: 1,
      ingamename: "lose"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "press_hold",
      loop: !1,
      volume: 1,
      ingamename: "press_hold"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "soundtrack",
      loop: !0,
      volume: 1,
      ingamename: "soundtrack"
    });
    f += s_aSoundsInfo.length;
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
    var n;
    for (s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this), s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg"), s_oSpriteLibrary.addSprite("but_menu_bg", "./sprites/but_menu_bg.png"), s_oSpriteLibrary.addSprite("but_game_bg", "./sprites/but_game_bg.png"), s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png"), s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png"), s_oSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg"), s_oSpriteLibrary.addSprite("card_spritesheet", "./sprites/card_spritesheet.png"), s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png"), s_oSpriteLibrary.addSprite("but_left", "./sprites/but_left.png"), s_oSpriteLibrary.addSprite("but_right", "./sprites/but_right.png"), s_oSpriteLibrary.addSprite("hold", "./sprites/hold.png"), s_oSpriteLibrary.addSprite("paytable", "./sprites/paytable.png"), s_oSpriteLibrary.addSprite("display_bg", "./sprites/display_bg.png"), s_oSpriteLibrary.addSprite("big_display", "./sprites/big_display.png"), s_oSpriteLibrary.addSprite("selection", "./sprites/selection.png"), s_oSpriteLibrary.addSprite("card_selection", "./sprites/card_selection.png"), s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png"), s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png"), s_oSpriteLibrary.addSprite("logo_ctl", "./sprites/logo_ctl.png"), s_oSpriteLibrary.addSprite("but_lang", "./sprites/but_lang.png"), n = 0; n < MOREGAMES_BUTS_ID.length; n++) s_oSpriteLibrary.addSprite("moregames_icon_" + n, "./sprites/moregames_icons/moregames_icon_" + n + ".png");
    for (n = 0; n < NUM_LANGUAGES; n++) s_oSpriteLibrary.addSprite("logo_" + n, "./sprites/logo_" + n + ".png");
    f += s_oSpriteLibrary.getNumSprites();
    s_oSpriteLibrary.loadSprites();
  };
  this._onImagesLoaded = function () {
    u++;
    var n = Math.floor(u / f * 100);
    o.refreshLoader(n);
  };
  this.preloaderReady = function () {
    this._loadImages();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && this._initSounds();
    r = !0;
  };
  this._onRemovePreloader = function () {
    try {} catch (n) {
      console.log(n);
    }
    o.unload();
    try {
      s_iCurMoney = this.getUserMoney();
    } catch (t) {
      s_bStorageAvailable = !1;
    }
    s_oSoundTrack = playSound("soundtrack", 1, !0);
    this.gotoMenu();
  };
  this._onAllImagesLoaded = function () {};
  this.gotoMenu = function () {
    h = new CMenu();
    e = STATE_MENU;
  };
  this.gotoGame = function () {
    s = new CGame(t);
    e = STATE_GAME;
  };
  this.gotoHelp = function () {
    c = new CHelp();
    e = STATE_HELP;
  };
  this.saveUserMoney = function (n) {
    (console.log("iMoney  " + n), s_bStorageAvailable) && saveItem("jacks_or_better_user_money", n);
  };
  this.getUserMoney = function () {
    if (!s_bStorageAvailable) return TOTAL_MONEY;
    var n = getItem("jacks_or_better_user_money");
    return n === null ? TOTAL_MONEY : parseFloat(parseFloat(n).toFixed(2));
  };
  this.stopUpdate = function () {
    r = !1;
    createjs.Ticker.paused = !0;
    $("#block_game").css("display", "block");
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (Howler.mute(!0));
  };
  this.startUpdate = function () {
    s_iPrevTime = new Date().getTime();
    r = !0;
    createjs.Ticker.paused = !1;
    $("#block_game").css("display", "none");
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_bAudioActive && (Howler.mute(!1));
  };
  this._update = function (n) {
    if (r !== !1) {
      var t = new Date().getTime();
      s_iTimeElaps = t - s_iPrevTime;
      s_iCntTime += s_iTimeElaps;
      s_iCntFps++;
      s_iPrevTime = t;
      s_iCntTime >= 1e3 && (s_iCurFps = s_iCntFps, s_iCntTime -= 1e3, s_iCntFps = 0);
      e === STATE_GAME && s.update();
      s_oStage.update(n);
    }
  };
  s_oMain = this;
  t = n;
  TOTAL_MONEY = 100;
  WIN_OCCURRENCE = 35;
  BET_TYPE = [.2, .3, .5, 1, 2, 3, 5];
  COMBO_PRIZES = [250, 50, 25, 9, 6, 4, 3, 2, 1];
  AUTOMATIC_RECHARGE = !0;
  NUM_HAND_FOR_ADS = 20;
  ENABLE_FULLSCREEN = t.fullscreen;
  ENABLE_CHECK_ORIENTATION = t.check_orientation;
  SHOW_CREDITS = t.show_credits;
  s_bAudioActive = n.audio_enable_on_startup;
  i = (navigator.language || "en").split("-")[0].toLowerCase();
  console.log("iLang " + i);
  LANG_CODES[i] === undefined && (i = "en");
  s_iCurLang = LANG_CODES[i];
  this.initContainer();
  refreshLanguage();
}function CTextButton(n,t,i,r,u,f,e,o){var l,h,v,y,p,c,a,s,w,b,k,d;return this._init=function(n,t,i,r,u,f,e,o){l=!1;h=1;c=[];a=[];var p=createBitmap(i);s=new createjs.Container;s.x=n;s.y=t;s.regX=i.width/2;s.regY=i.height/2;s.addChild(p);w=new CTLText(s,15,10,i.width-30,i.height-20,e,"center",f,u,1.1,0,0,r,!0,!0,!0,!1);o.addChild(s);v=i.width;y=i.height;this._initListener()},this.unload=function(){s.off("mousedown",b);s.off("pressup",d);s_bMobile||s.off("mouseover",k);createjs.Tween.removeTweens(s);o.removeChild(s)},this.setVisible=function(n){s.visible=n},this.enable=function(){l=!1;s.filters=[];s.cache(0,0,v,y)},this.disable=function(){l=!0;var n=(new createjs.ColorMatrix).adjustSaturation(-100);s.filters=[new createjs.ColorMatrixFilter(n)];s.cache(0,0,v,y)},this._initListener=function(){b=s.on("mousedown",this.buttonDown);d=s.on("pressup",this.buttonRelease);s_bMobile||(k=s.on("mouseover",this.buttonOver))},this.addEventListener=function(n,t,i){c[n]=t;a[n]=i},this.addEventListenerWithParams=function(n,t,i,r){c[n]=t;a[n]=i;p=r},this.inversePulse=function(){createjs.Tween.get(s,{loop:-1}).to({scaleX:1.1,scaleY:1.1},1050,createjs.Ease.quadOut).to({scaleX:1,scaleY:1},850,createjs.Ease.quadIn)},this.buttonRelease=function(){l||(s.scaleX=h,s.scaleY=h,c[ON_MOUSE_UP]&&c[ON_MOUSE_UP].call(a[ON_MOUSE_UP],p))},this.buttonDown=function(){l||(s.scaleX=h*.9,s.scaleY=h*.9,playSound("press_but",1,!1),c[ON_MOUSE_DOWN]&&c[ON_MOUSE_DOWN].call(a[ON_MOUSE_DOWN],p))},this.buttonOver=function(n){s_bMobile||(n.target.cursor="pointer")},this.setTextPosition=function(n){w.setY(n)},this.setPosition=function(n,t){s.x=n;s.y=t},this.setText=function(n){w.refreshText(n);s.cache(0,0,v,y)},this.moveTo=function(n,t){createjs.Tween.get(s).to({x:n.x,y:n.y},t,createjs.Ease.cubicOut)},this.tremble=function(){createjs.Tween.get(s).to({rotation:10},40,createjs.Ease.cubicOut).to({rotation:-10},80).to({rotation:10},80).to({rotation:-10},80).to({rotation:0},40)},this.scale=function(n){createjs.Tween.get(s).to({scaleX:h*n,scaleY:h*n},200,createjs.Ease.cubicOut).to({scaleX:h,scaleY:h},1e3,createjs.Ease.elasticOut)},this.setX=function(n){s.x=n},this.setY=function(n){s.y=n},this.getButtonImage=function(){return s},this.getX=function(){return s.x},this.getY=function(){return s.y},this.isDisabled=function(){return l},this._init(n,t,i,r,u,f,e,o),this}function CGfxButton(n,t,i,r){var e,s,h,f,o,c=[],l,a,u,v=r;return this._init=function(n,t,i){e=!1;f=[];o=[];s=i.width;h=i.height;u=createBitmap(i);u.x=n;u.y=t;u.regX=i.width/2;u.regY=i.height/2;u.cursor="pointer";v.addChild(u);this._initListener()},this.unload=function(){u.off("mousedown",l);u.off("pressup",a);v.removeChild(u)},this.setVisible=function(n){u.visible=n},this._initListener=function(){l=u.on("mousedown",this.buttonDown);a=u.on("pressup",this.buttonRelease)},this.addEventListener=function(n,t,i){f[n]=t;o[n]=i},this.addEventListenerWithParams=function(n,t,i,r){f[n]=t;o[n]=i;c=r},this.buttonRelease=function(){e||(playSound("press_but",1,!1),u.scaleX=1,u.scaleY=1,f[ON_MOUSE_UP]&&f[ON_MOUSE_UP].call(o[ON_MOUSE_UP],c))},this.buttonDown=function(){e||(u.scaleX=.9,u.scaleY=.9,f[ON_MOUSE_DOWN]&&f[ON_MOUSE_DOWN].call(o[ON_MOUSE_DOWN],c))},this.setPosition=function(n,t){u.x=n;u.y=t},this.setX=function(n){u.x=n},this.setY=function(n){u.y=n},this.enable=function(){e=!1;u.filters=[];u.cache(0,0,s,h)},this.disable=function(){e=!0;var n=(new createjs.ColorMatrix).adjustSaturation(-100).adjustBrightness(40);u.filters=[new createjs.ColorMatrixFilter(n)];u.cache(0,0,s,h)},this.getButtonImage=function(){return u},this.getX=function(){return u.x},this.getY=function(){return u.y},this._init(n,t,i),this}function CToggle(n,t,i,r){var f,e,o,u;this._init=function(n,t,i,r){e=[];o=[];var s={images:[i],frames:{width:i.width/2,height:i.height,regX:i.width/4,regY:i.height/2},animations:{state_true:[0],state_false:[1]}},h=new createjs.SpriteSheet(s);f=r;u=createSprite(h,"state_"+f,i.width/4,i.height/2,i.width/2,i.height);u.x=n;u.y=t;u.stop();u.cursor="pointer";s_oStage.addChild(u);this._initListener()};this.unload=function(){u.off("mousedown",this.buttonDown);u.off("pressup",this.buttonRelease);s_oStage.removeChild(u)};this._initListener=function(){u.on("mousedown",this.buttonDown);u.on("pressup",this.buttonRelease)};this.addEventListener=function(n,t,i){e[n]=t;o[n]=i};this.setActive=function(n){f=n;u.gotoAndStop("state_"+f)};this.buttonRelease=function(){u.scaleX=1;u.scaleY=1;playSound("press_but",1,!1);f=!f;u.gotoAndStop("state_"+f);e[ON_MOUSE_UP]&&e[ON_MOUSE_UP].call(o[ON_MOUSE_UP],f)};this.buttonDown=function(){u.scaleX=.9;u.scaleY=.9;e[ON_MOUSE_DOWN]&&e[ON_MOUSE_DOWN].call(o[ON_MOUSE_DOWN])};this.setPosition=function(n,t){u.x=n;u.y=t};this._init(n,t,i,r)}function CMenu() {
  var i,
    e,
    r,
    o,
    p,
    n,
    s,
    a,
    v,
    t,
    y,
    h,
    c,
    u = null,
    w = null,
    f;
  this._init = function () {
    var g, b, k, d, nt;
    try {} catch (tt) {}
    v = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s_oStage.addChild(v);
    b = s_oSpriteLibrary.getSprite("but_menu_bg");
    t = new CTextButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50, b, TEXT_PLAY, FONT1, "#fff", 80, s_oStage);
    t.inversePulse();
    t.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
    g = s_oSpriteLibrary.getSprite("but_lang");
    DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1 ? (b = s_oSpriteLibrary.getSprite("audio_icon"), i = {
      x: CANVAS_WIDTH - b.width / 4 - 10,
      y: b.height / 2 + 10
    }, h = new CToggle(i.x, i.y, b, s_bAudioActive, s_oStage), h.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this), o = {
      x: i.x - g.width / NUM_LANGUAGES - 10,
      y: i.y
    }) : o = {
      x: CANVAS_WIDTH - b.width / 4 - 10,
      y: g.height / 2 + 10
    };
    s = new CButLang(o.x, o.y, NUM_LANGUAGES, s_iCurLang, g, s_oStage);
    s.addEventListener(ON_SELECT_LANG, this._onSelectLang, this);
    SHOW_CREDITS ? (b = s_oSpriteLibrary.getSprite("but_info"), r = {
      x: b.height / 2 + 10,
      y: b.height / 2 + 10
    }, y = new CGfxButton(r.x, r.y, b, s_oStage), y.addEventListener(ON_MOUSE_UP, this._onButCreditsRelease, this), e = {
      x: r.x + b.width + 10,
      y: r.y
    }) : e = {
      x: b.height / 2 + 10,
      y: b.height / 2 + 10
    };
    k = window.document;
    d = k.documentElement;
    u = d.requestFullscreen || d.mozRequestFullScreen || d.webkitRequestFullScreen || d.msRequestFullscreen;
    w = k.exitFullscreen || k.mozCancelFullScreen || k.webkitExitFullscreen || k.msExitFullscreen;
    ENABLE_FULLSCREEN === !1 && (u = !1);
    u && screenfull.isEnabled && (b = s_oSpriteLibrary.getSprite("but_fullscreen"), c = new CToggle(e.x, e.y, b, s_bFullscreen, !0), c.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this));
    nt = s_oSpriteLibrary.getSprite("logo_" + s_iCurLang);
    p = {
      x: CANVAS_WIDTH / 2,
      y: 150
    };
    n = createBitmap(nt);
    n.regX = nt.width / 2;
    n.x = p.x;
    n.y = p.y;
    s_oStage.addChild(n);
    a = new CLangPanel(s_oStage);
    a.addEventListener(ON_SELECT_LANG, this._onChangeLang, this);
    f = new createjs.Shape();
    f.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(f);
    createjs.Tween.get(f).to({
      alpha: 0
    }, 500).call(function () {
      f.visible = !1;
    });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.unload = function () {
    t.unload();
    t = null;
    s.unload();
    a.unload();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (h.unload(), h = null);
    u && screenfull.isEnabled && c.unload();
    SHOW_CREDITS && y.unload();
    s_oStage.removeChild(v);
    v = null;
    s_oStage.removeChild(f);
    f = null;
    s_oMenu = null;
  };
  this.refreshButtonPos = function (f, a) {
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && h.setPosition(i.x - f, a + i.y);
    u && screenfull.isEnabled && c.setPosition(e.x + f, e.y + a);
    SHOW_CREDITS && y.setPosition(r.x + f, r.y + a);
    s.setPosition(o.x - s_iOffsetX, o.y + s_iOffsetY);
    n.y = s_iOffsetY + 40;
    t.setY(n.y + 260);
    var v = s_oSpriteLibrary.getSprite("but_menu_bg").height,
      p = t.getY() + v / 2 + MENU_MOREGAMES_OFFSET_Y,
      w = CANVAS_HEIGHT - s_iOffsetY - p;
  };
  this._onButPlayRelease = function () {
    try {} catch (n) {}
    this.unload();
    s_oMain.gotoGame();
  };
  this._onAudioToggle = function () {
    Howler.mute(s_bAudioActive);
    s_bAudioActive = !s_bAudioActive;
  };
  this._onButCreditsRelease = function () {
    new CCreditsPanel();
  };
  this.resetFullscreenBut = function () {
    u && screenfull.isEnabled && c.setActive(s_bFullscreen);
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen ? w.call(window.document) : u.call(window.document.documentElement);
    sizeHandler();
  };
  this._onSelectLang = function () {
    a.show();
  };
  this._onChangeLang = function (i) {
    s_iCurLang = i;
    refreshLanguage();
    s.setLang(i);
    t.setText(TEXT_PLAY);
    var r = s_oSpriteLibrary.getSprite("logo_" + s_iCurLang);
    n.image = r;
    n.regX = r.width / 2;
  };
  s_oMenu = this;
  this._init();
}function CGame() {
  var e,
    y,
    b,
    f,
    a,
    t,
    n,
    o,
    r,
    v,
    i = [],
    s,
    p,
    c,
    k,
    u,
    h,
    w,
    l;
  this._init = function () {
    s_oPayTableSettings = new CPayTableSettings();
    k = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
    s_oStage.addChild(k);
    l = new createjs.Container();
    l.x = 600;
    l.y = 530;
    s_oStage.addChild(l);
    h = new CPayTable(550, 149);
    e = !1;
    t = 0;
    n = 0;
    a = 0;
    v = 0;
    f = parseFloat(BET_TYPE[t] * (n + 1));
    h.setCreditColumn(n);
    r = STATE_GAME_WAITING_FOR_BET;
    u = new CInterface(s_iCurMoney, BET_TYPE[t]);
    w = new CGameOver();
    p = new CGameSettings();
    c = new CHandEvaluator();
    o = 0;
    s = [];
    s = p.getShuffledCardDeck();
    MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1] * BET_TYPE[t] * (n + 1);
    this.placeFakeCardForStarting();
    setVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME);
  };
  this.unload = function () {
    u.unload();
    w.unload();
    s_oStage.removeAllChildren();
  };
  this.resetHand = function () {
    a = 0;
    o = 0;
    s = [];
    s = p.getShuffledCardDeck();
    for (var n = 0; n < i.length; n++) i[n].reset();
    u.resetHand();
    h.resetHand();
    this.checkMoney();
    e = !1;
    r = STATE_GAME_WAITING_FOR_BET;
  };
  this.checkMoney = function () {
    s_iCurMoney < f && (t = 0, n = 0, f = parseFloat(BET_TYPE[t] * (n + 1)), h.setCreditColumn(n), s_iCurMoney < f ? this._gameOver() : (u.refreshMoney(s_iCurMoney, f), u.refreshBet(BET_TYPE[t])));
  };
  this.changeState = function (n) {
    b = n;
    switch (b) {}
  };
  this.placeFakeCardForStarting = function () {
    for (var r, n, u = s_oSpriteLibrary.getSprite("card_spritesheet"), f = {
        images: [u],
        frames: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          regX: CARD_WIDTH / 2,
          regY: CARD_HEIGHT / 2
        },
        animations: {
          card_1_1: [0],
          card_1_2: [1],
          card_1_3: [2],
          card_1_4: [3],
          card_1_5: [4],
          card_1_6: [5],
          card_1_7: [6],
          card_1_8: [7],
          card_1_9: [8],
          card_1_10: [9],
          card_1_J: [10],
          card_1_Q: [11],
          card_1_K: [12],
          card_2_1: [13],
          card_2_2: [14],
          card_2_3: [15],
          card_2_4: [16],
          card_2_5: [17],
          card_2_6: [18],
          card_2_7: [19],
          card_2_8: [20],
          card_2_9: [21],
          card_2_10: [22],
          card_2_J: [23],
          card_2_Q: [24],
          card_2_K: [25],
          card_3_1: [26],
          card_3_2: [27],
          card_3_3: [28],
          card_3_4: [29],
          card_3_5: [30],
          card_3_6: [31],
          card_3_7: [32],
          card_3_8: [33],
          card_3_9: [34],
          card_3_10: [35],
          card_3_J: [36],
          card_3_Q: [37],
          card_3_K: [38],
          card_4_1: [39],
          card_4_2: [40],
          card_4_3: [41],
          card_4_4: [42],
          card_4_5: [43],
          card_4_6: [44],
          card_4_7: [45],
          card_4_8: [46],
          card_4_9: [47],
          card_4_10: [48],
          card_4_J: [49],
          card_4_Q: [50],
          card_4_K: [51],
          back: [52]
        }
      }, t = 0, i = 0; i < 5; i++) r = new createjs.SpriteSheet(f), n = createSprite(r, "back", CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT), n.x = t, n.y = 0, n.shadow = new createjs.Shadow("#000000", 5, 5, 5), l.addChild(n), t += 180;
  };
  this.dealCards = function () {
    if (!e && !(s_iCurMoney <= 0)) {
      e = !0;
      l.removeAllChildren();
      var n;
      if (n = Math.floor(Math.random() * 101), n > WIN_OCCURRENCE) {
        do this._createCard(); while (c.evaluate(i) < HIGH_CARD);
        y = !1;
      } else this._createCard(), y = !0;
      s_iCurMoney -= f;
      s_iCurMoney = parseFloat(s_iCurMoney.toFixed(2));
      u.refreshMoney(s_iCurMoney, f);
      s_oMain.saveUserMoney(s_iCurMoney);
      playSound("card", 1, !1);
      r = STATE_GAME_DEAL;
    }
  };
  this._createCard = function () {
    for (var r, f, u, n, t = 0; t < i.length; t++) i[t].unload();
    for (r = 0, f = 0, i = [], u = 0; u < 5; u++) n = new CCard(r, f, l, s[o].fotogram, s[o].rank, s[o].suit), n.addEventListener(ON_CARD_SHOWN, this._onCardShown), n.addEventListener(ON_CARD_HIDE, this._onCardHide), i.push(n), o++, this._checkDeckLength(), r += 180, n.showCard();
  };
  this.drawCards = function () {
    var t, n;
    if (!e) {
      for (e = !0, playSound("card", 1, !1), t = i.length, n = 0; n < i.length; n++) i[n].isHold() === !1 && (i[n].hideCard(), t--);
      t === i.length && (r = STATE_GAME_DRAW, this._onCardShown());
    }
  };
  this._checkDeckLength = function () {
    o >= s.length && (s = p.getShuffledCardDeck(), o = 0);
  };
  this.assignWin = function (r) {
    var s, e, o;
    for (playSound("win", 1, !1), s = c.getSortedHand(), e = 0; e < i.length; e++) for (o = 0; o < s.length; o++) if (s[o].rank === i[e].getRank() && s[o].suit === i[e].getSuit()) {
      i[e].highlight();
      break;
    }
    h.showWinAnim(n, r);
    a = s_oPayTableSettings.getWin(n, r) * BET_TYPE[t];
    s_iCurMoney += a;
    s_iCurMoney = parseFloat(s_iCurMoney.toFixed(2));
    s_oMain.saveUserMoney(s_iCurMoney);
    u.refreshWin(a);
    u.refreshMoney(s_iCurMoney, f);
  };
  this.recharge = function (i) {
    s_iCurMoney = i;
    s_oMain.saveUserMoney(s_iCurMoney);
    h.setCreditColumn(n);
    this.checkMoney();
    u.refreshMoney(s_iCurMoney, f);
    u.refreshBet(BET_TYPE[t]);
    w.hide();
  };
  this._gameOver = function () {
    w.show();
  };
  this.setMoney = function (n) {
    s_iCurMoney = parseFloat(n);
    s_oMain.saveUserMoney(s_iCurMoney);
    u.refreshMoney(s_iCurMoney, f);
  };
  this.onCardSelected = function (n) {
    r === STATE_GAME_CHOOSE_HOLD && n.toggleHold();
  };
  this._onCardShown = function () {
    if (r !== STATE_GAME_CHOOSE_HOLD) {
      switch (r) {
        case STATE_GAME_DEAL:
          r = STATE_GAME_CHOOSE_HOLD;
          u.setState(r);
          break;
        case STATE_GAME_DRAW:
          var n = c.evaluate(i);
          u.setState(r);
          n !== HIGH_CARD ? s_oGame.assignWin(n) : (playSound("lose", 1, !1), u.showLosePanel(), s_iCurMoney <= f && s_oGame._gameOver());
          v++;
          v === NUM_HAND_FOR_ADS ? (v = 0) : v === NUM_HAND_FOR_ADS - 1;
          r = STATE_GAME_EVALUATE;
          break;
        case STATE_GAME_EVALUATE:
          u.setState(r);
      }
      e = !1;
    }
  };
  this._onCardHide = function () {
    var f, o, u, e;
    if (r !== STATE_GAME_DRAW) {
      if (r = STATE_GAME_DRAW, y) {
        f = 0;
        do s_oGame._changeCardValue(), u = c.evaluate(i), o = u === HIGH_CARD ? 0 : s_oPayTableSettings.getWin(n, u) * BET_TYPE[t], f++; while (u === HIGH_CARD && f < 5e3);
        if (f >= 5e3) {
          do s_oGame._changeCardValue(), u = c.evaluate(i); while (u < HIGH_CARD);
          y = !1;
        }
      } else do s_oGame._changeCardValue(), u = c.evaluate(i); while (u < HIGH_CARD);
      for (e = 0; e < 5; e++) i[e].setHold(!1);
    }
  };
  this._changeCardValue = function () {
    for (var n = 0; n < 5; n++) i[n].isHold() === !1 && (i[n].changeInfo(s[o].fotogram, s[o].rank, s[o].suit), i[n].showCard(), o++, this._checkDeckLength());
  };
  this._onButDealRelease = function () {
    switch (r) {
      case STATE_GAME_WAITING_FOR_BET:
        this.dealCards();
        break;
      case STATE_GAME_CHOOSE_HOLD:
        this.drawCards();
        break;
      case STATE_GAME_EVALUATE:
        this.resetHand();
        this.dealCards();
    }
  };
  this._onButLeftRelease = function () {
    if (t !== 0 && !e && (r === STATE_GAME_WAITING_FOR_BET || r === STATE_GAME_EVALUATE)) {
      MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1];
      t--;
      var i = parseFloat(BET_TYPE[t] * (n + 1));
      if (s_iCurMoney < i) {
        t++;
        return;
      }
      f = i;
      u.refreshMoney(s_iCurMoney, f);
      u.refreshBet(BET_TYPE[t]);
      MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1] * BET_TYPE[t] * (n + 1);
    }
  };
  this._onButRightRelease = function () {
    if (t !== BET_TYPE.length - 1 && !e && (r === STATE_GAME_WAITING_FOR_BET || r === STATE_GAME_EVALUATE)) {
      t++;
      var i = parseFloat(BET_TYPE[t] * (n + 1));
      if (s_iCurMoney < i) {
        t--;
        return;
      }
      f = i;
      u.refreshMoney(s_iCurMoney, f);
      u.refreshBet(BET_TYPE[t]);
      MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1] * BET_TYPE[t] * (n + 1);
    }
  };
  this._onButBetOneRelease = function () {
    if (!e && (r === STATE_GAME_WAITING_FOR_BET || r === STATE_GAME_EVALUATE)) {
      n++;
      n === NUM_BETS && (n = 0);
      var i = parseFloat(BET_TYPE[t] * (n + 1));
      if (s_iCurMoney < i) {
        n === 0 ? n = NUM_BETS - 1 : n--;
        return;
      }
      f = i;
      u.refreshMoney(s_iCurMoney, f);
      h.setCreditColumn(n);
      MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1] * BET_TYPE[t] * (n + 1);
    }
  };
  this._onButBetMaxRelease = function () {
    if (!e && (r === STATE_GAME_WAITING_FOR_BET || r === STATE_GAME_EVALUATE)) {
      e = !0;
      n = NUM_BETS - 1;
      var i = parseFloat(BET_TYPE[t] * (n + 1));
      if (s_iCurMoney < i) {
        this._gameOver();
        return;
      }
      f = i;
      u.refreshMoney(s_iCurMoney, f);
      h.setCreditColumn(n);
      MIN_WIN = COMBO_PRIZES[COMBO_PRIZES.length - 1] * BET_TYPE[t] * (n + 1);
      this.resetHand();
      this.dealCards();
    }
  };
  this.onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this.update = function () {};
  s_oGame = this;
  this._init();
}function CInterface(n,t){var r,o,f,e,l,a,v,y,s,h,p,w,b,k,i,c,u=null,d=null;return this._init=function(n,t){var g=s_oSpriteLibrary.getSprite("but_exit"),nt,it,rt,st,ut,ht,ft,ct,et,tt,ot,lt;o={x:CANVAS_WIDTH-g.width/2-2,y:g.height/2+2};e=new CGfxButton(o.x,o.y,g,s_oStage);e.addEventListener(ON_MOUSE_UP,this._onExit,this);DISABLE_SOUND_MOBILE===!1||s_bMobile===!1?(r={x:e.getX()-g.width,y:g.height/2+2},h=new CToggle(r.x,r.y,s_oSpriteLibrary.getSprite("audio_icon"),s_bAudioActive),h.addEventListener(ON_MOUSE_UP,this._onAudioToggle,this),f={x:r.x-g.width-10,y:r.y}):f={x:e.getX()-g.width-10,y:g.height/2+2};nt=window.document;it=nt.documentElement;u=it.requestFullscreen||it.mozRequestFullScreen||it.webkitRequestFullScreen||it.msRequestFullscreen;d=nt.exitFullscreen||nt.mozCancelFullScreen||nt.webkitExitFullscreen||nt.msExitFullscreen;ENABLE_FULLSCREEN===!1&&(u=!1);u&&screenfull.isEnabled&&(g=s_oSpriteLibrary.getSprite("but_fullscreen"),c=new CToggle(f.x,f.y,g,s_bFullscreen,!0),c.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this));rt=createBitmap(s_oSpriteLibrary.getSprite("display_bg"));rt.x=480;rt.y=25;s_oStage.addChild(rt);st=new CTLText(s_oStage,470,20,100,22,22,"left","#fff",FONT1,1,0,0,TEXT_WIN,!0,!0,!1,!1);ut=createBitmap(s_oSpriteLibrary.getSprite("display_bg"));ut.x=480;ut.y=93;s_oStage.addChild(ut);ht=new CTLText(s_oStage,470,90,100,22,22,"left","#fff",FONT1,1,0,0,TEXT_BET,!0,!0,!1,!1);ft=createBitmap(s_oSpriteLibrary.getSprite("display_bg"));ft.x=470;ft.y=687;s_oStage.addChild(ft);ct=new CTLText(s_oStage,460,685,100,22,22,"left","#fff",FONT1,1,0,0,TEXT_MONEY,!0,!0,!1,!1);p=new CTLText(s_oStage,480,CANVAS_HEIGHT-66,210,30,30,"center","#ffde00",FONT2,1,0,0,n.toFixed(2)+TEXT_CURRENCY,!0,!0,!1,!1);b=new CTLText(s_oStage,490,110,210,30,30,"center","#ffde00",FONT2,1,0,0,t.toFixed(2)+TEXT_CURRENCY,!0,!0,!1,!1);w=new CTLText(s_oStage,490,40,210,30,30,"center","#ffde00",FONT2,1,0,0,"0"+TEXT_CURRENCY,!0,!0,!1,!1);et=createBitmap(s_oSpriteLibrary.getSprite("big_display"));et.x=770;et.y=686;s_oStage.addChild(et);k=new CTLText(s_oStage,780,700,108,40,40,"center","#ffde00",FONT2,1,0,0,t.toFixed(2)+TEXT_CURRENCY,!0,!0,!1,!1);g=s_oSpriteLibrary.getSprite("logo_"+s_iCurLang);tt=createBitmap(g);tt.x=CANVAS_WIDTH/2;tt.y=18;tt.regX=g.width/2;tt.scale=.6;s_oStage.addChild(tt);g=s_oSpriteLibrary.getSprite("but_left");l=new CGfxButton(744,722,g,s_oStage);l.addEventListener(ON_MOUSE_UP,this._onButLeftRelease,this);g=s_oSpriteLibrary.getSprite("but_right");a=new CGfxButton(930,722,g,s_oStage);a.addEventListener(ON_MOUSE_UP,this._onButRightRelease,this);g=s_oSpriteLibrary.getSprite("but_game_bg");v=new CTextButton(1040,716,g,TEXT_BET_ONE,FONT1,"#ffffff",23,s_oStage);v.addEventListener(ON_MOUSE_UP,this._onButBetOneRelease,this);y=new CTextButton(1190,716,g,TEXT_MAX_BET,FONT1,"#ffffff",23,s_oStage);y.addEventListener(ON_MOUSE_UP,this._onButBetMaxRelease,this);s=new CTextButton(1340,716,g,TEXT_DEAL,FONT1,"#ffffff",30,s_oStage);s.addEventListener(ON_MOUSE_UP,this._onButDealRelease,this);i=new createjs.Container;i.visible=!1;i.x=710;i.y=500;s_oStage.addChild(i);ot=new createjs.Shape;ot.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0,0,500,100);i.addChild(ot);lt=new CTLText(i,0,0,500,100,50,"center","#fff",FONT1,1,10,5,TEXT_NO_WIN,!0,!0,!1,!1);this.refreshButtonPos(s_iOffsetX,s_iOffsetY)},this.unload=function(){e.unload();l.unload();a.unload();v.unload();y.unload();s.unload();(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&(h.unload(),h=null);u&&screenfull.isEnabled&&c.unload();s_oInterface=null},this.refreshButtonPos=function(n,t){e.setPosition(o.x-n,t+o.y);(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&h.setPosition(r.x-n,t+r.y);u&&screenfull.isEnabled&&c.setPosition(f.x-n,f.y+t)},this.setState=function(n){switch(n){case STATE_GAME_CHOOSE_HOLD:s.setText(TEXT_DRAW);break;case STATE_GAME_DRAW:case STATE_GAME_EVALUATE:s.setText(TEXT_DEAL)}},this.resetHand=function(){this.refreshWin(0);i.visible=!1},this.refreshMoney=function(n,t){p.refreshText(n.toFixed(2)+TEXT_CURRENCY);b.refreshText(t.toFixed(2)+TEXT_CURRENCY)},this.refreshWin=function(n){w.refreshText(n.toFixed(2)+TEXT_CURRENCY)},this.refreshBet=function(n){k.refreshText(n.toFixed(2)+TEXT_CURRENCY)},this.showLosePanel=function(){i.visible=!0},this._onButLeftRelease=function(){s_oGame._onButLeftRelease()},this._onButRightRelease=function(){s_oGame._onButRightRelease()},this._onButBetOneRelease=function(){s_oGame._onButBetOneRelease()},this._onButBetMaxRelease=function(){s_oGame._onButBetMaxRelease()},this._onButDealRelease=function(){s_oGame._onButDealRelease()},this._onExit=function(){s_oGame.onExit()},this._onAudioToggle=function(){Howler.mute(s_bAudioActive);s_bAudioActive=!s_bAudioActive},this.resetFullscreenBut=function(){u&&screenfull.isEnabled&&c.setActive(s_bFullscreen)},this._onFullscreenRelease=function(){s_bFullscreen?d.call(window.document):u.call(window.document.documentElement);sizeHandler()},s_oInterface=this,this._init(n,t),this}function CGameSettings(){var n,t,i;this._init=function(){var r=-1,i,t;for(n=[],i=0;i<52;i++)t=(i+1)%13,t===1?(t=14,r++):t===0&&(t=13),n.push({fotogram:i,rank:t,suit:r})};this.timeToString=function(n){n=Math.round(n/1e3);var t=Math.floor(n/60),i=n-t*60,r="";return r+=t<10?"0"+t+":":t+":",r+(i<10?"0"+i:i)};this.getShuffledCardDeck=function(){for(var i=[],r=0;r<n.length;r++)i[r]=n[r];for(t=[];i.length>0;)t.push(i.splice(Math.round(Math.random()*(i.length-1)),1)[0]);return t};this.getCardValue=function(n){return i[n]};this._init()}function CCard(n,t,i,r,u,f){var s,v,p,w,c,y,e,h,l,o,a,b;this._init=function(n,t,i,r,u,f){s=!1;a=i;v=r;p=u;w=f;var b=s_oSpriteLibrary.getSprite("card_spritesheet"),k={images:[b],frames:{width:CARD_WIDTH,height:CARD_HEIGHT,regX:CARD_WIDTH/2,regY:CARD_HEIGHT/2},animations:{card_1_1:[0],card_1_2:[1],card_1_3:[2],card_1_4:[3],card_1_5:[4],card_1_6:[5],card_1_7:[6],card_1_8:[7],card_1_9:[8],card_1_10:[9],card_1_J:[10],card_1_Q:[11],card_1_K:[12],card_2_1:[13],card_2_2:[14],card_2_3:[15],card_2_4:[16],card_2_5:[17],card_2_6:[18],card_2_7:[19],card_2_8:[20],card_2_9:[21],card_2_10:[22],card_2_J:[23],card_2_Q:[24],card_2_K:[25],card_3_1:[26],card_3_2:[27],card_3_3:[28],card_3_4:[29],card_3_5:[30],card_3_6:[31],card_3_7:[32],card_3_8:[33],card_3_9:[34],card_3_10:[35],card_3_J:[36],card_3_Q:[37],card_3_K:[38],card_4_1:[39],card_4_2:[40],card_4_3:[41],card_4_4:[42],card_4_5:[43],card_4_6:[44],card_4_7:[45],card_4_8:[46],card_4_9:[47],card_4_10:[48],card_4_J:[49],card_4_Q:[50],card_4_K:[51],back:[52]}},d=new createjs.SpriteSheet(k);e=createSprite(d,"back",CARD_WIDTH/2,CARD_HEIGHT/2,CARD_WIDTH,CARD_HEIGHT);e.x=n;e.y=t;e.stop();e.shadow=new createjs.Shadow("#000000",5,5,5);a.addChild(e);b=s_oSpriteLibrary.getSprite("hold");h=createBitmap(b);h.regX=b.width/2;h.x=n;h.y=t+76;h.visible=!1;a.addChild(h);b=s_oSpriteLibrary.getSprite("card_selection");o=createBitmap(b);o.x=n;o.y=t;o.regX=b.width/2;o.regY=b.height/2;o.visible=!1;a.addChild(o);l=new createjs.Shape;l.graphics.beginFill("rgba(255,255,255,0.01)").drawRect(n-CARD_WIDTH/2,t-CARD_HEIGHT/2,CARD_WIDTH,CARD_HEIGHT);l.on("click",this._onSelected);l.cursor="pointer";a.addChild(l);c=[];y=[]};this.unload=function(){l.off("click",this._onSelected);a.removeChild(e)};this.reset=function(){s=!1;o.visible=!1;e.shadow=new createjs.Shadow("#000000",5,5,5)};this.addEventListener=function(n,t,i){c[n]=t;y[n]=i};this.changeInfo=function(n,t,i){v=n;p=t;w=i};this.setValue=function(){e.gotoAndStop(v);var n=this;createjs.Tween.get(e).to({scaleX:1},200).call(function(){n.cardShown()})};this.setHold=function(n){s=n;h.visible=s};this.toggleHold=function(){createjs.Tween.hasActiveTweens(e)||(s=!s,h.visible=s,playSound("press_hold",1,!1))};this.showCard=function(){var n=this;createjs.Tween.get(e).to({scaleX:.1},200).call(function(){n.setValue()})};this.hideCard=function(){var n=this;createjs.Tween.get(e).to({scaleX:.1},200).call(function(){n.setBack()})};this.setBack=function(){e.gotoAndStop("back");var n=this;createjs.Tween.get(e).to({scaleX:1},200).call(function(){n.cardHidden()})};this.cardShown=function(){c[ON_CARD_SHOWN]&&c[ON_CARD_SHOWN].call(y[ON_CARD_SHOWN])};this.cardHidden=function(){c[ON_CARD_HIDE]&&c[ON_CARD_HIDE].call(y[ON_CARD_HIDE],this)};this.highlight=function(){e.shadow=new createjs.Shadow("#fff000",0,0,15);o.visible=!0};this._onSelected=function(){s_oGame.onCardSelected(b)};this.getRank=function(){return p};this.getSuit=function(){return w};this.getFotogram=function(){return v};this.isHold=function(){return s};b=this;this._init(n,t,i,r,u,f)}function CGameOver() {
  var t, i, n;
  this._init = function () {
    var f, u, r, e, o;
    n = new createjs.Container();
    s_oStage.addChild(n);
    f = new createjs.Shape();
    f.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    n.addChild(f);
    u = s_oSpriteLibrary.getSprite("msg_box");
    r = createBitmap(u);
    r.x = CANVAS_WIDTH / 2;
    r.y = CANVAS_HEIGHT / 2;
    r.regX = u.width / 2;
    r.regY = u.height / 2;
    n.addChild(r);
    e = new CTLText(n, CANVAS_WIDTH / 2 - 198, CANVAS_HEIGHT / 2 - 98, 400, 50, 50, "center", "#000", FONT1, 1, 0, 0, TEXT_GAMEOVER, !0, !0, !1, !1);
    o = new CTLText(n, CANVAS_WIDTH / 2 - 200, CANVAS_HEIGHT / 2 - 100, 400, 50, 50, "center", "#fff", FONT1, 1, 0, 0, TEXT_GAMEOVER, !0, !0, !1, !1);
    t = new CTextButton(CANVAS_WIDTH / 2 - 100, 450, s_oSpriteLibrary.getSprite("but_game_bg"), TEXT_RECHARGE, FONT1, "#fff", 14, n);
    t.addEventListener(ON_MOUSE_UP, this._onRecharge, this);
    i = new CTextButton(CANVAS_WIDTH / 2 + 100, 450, s_oSpriteLibrary.getSprite("but_game_bg"), TEXT_EXIT, FONT1, "#fff", 14, n);
    i.addEventListener(ON_MOUSE_UP, this._onExit, this);
    this.hide();
  };
  this.unload = function () {
    t.unload();
    i.unload();
  };
  this.show = function () {
    n.visible = !0;
  };
  this.hide = function () {
    n.visible = !1;
  };
  this._onRecharge = function () {
    n.visible = !1;
    AUTOMATIC_RECHARGE && s_oGame.recharge(TOTAL_MONEY);
  };
  this._onExit = function () {
    s_oGame.onExit();
  };
  this._init();
}function CPayTable(n,t){var u,r,f,i;this._init=function(n,t){var y,e,o,v,h,l,p,c,a,s;for(i=new createjs.Container,i.x=n,i.y=t,s_oStage.addChild(i),y=createBitmap(s_oSpriteLibrary.getSprite("paytable")),i.addChild(y),e=278,o=4,u=[],v=0;v<NUM_BETS;v++)h=createBitmap(s_oSpriteLibrary.getSprite("selection")),h.visible=!1,h.x=e,h.y=o,i.addChild(h),u.push(h),e+=100;for(e=25,o=15,f=[],l=0;l<WIN_COMBINATIONS;l++)p=new CTLText(i,e,o,250,19,19,"right","#fff000",FONT1,1,0,0,TEXT_COMBO[l],!0,!0,!1,!1),o+=22,f[l]=p;for(e=375,r=[],c=0;c<NUM_BETS;c++){for(o=27,r[c]=[],a=0;a<WIN_COMBINATIONS;a++)s=new createjs.Text(s_oPayTableSettings.getWin(c,a),"22px "+FONT1,"#fff000"),s.x=e,s.y=o,s.textAlign="right",s.textBaseline="middle",i.addChild(s),o+=22,r[c][a]=s;e+=100}};this.resetHand=function(){var n,t,i;for(createjs.Tween.removeAllTweens(),n=0;n<NUM_BETS;n++)for(t=0;t<WIN_COMBINATIONS;t++)r[n][t].alpha=1;for(i=0;i<WIN_COMBINATIONS;i++)f[i].alpha=1};this.setCreditColumn=function(n){for(var t=0;t<NUM_BETS;t++)u[t].visible=!1;u[n].visible=!0};this.showWinAnim=function(n,t){createjs.Tween.get(r[n][t],{loop:-1}).to({alpha:1},100).to({alpha:0},100);createjs.Tween.get(f[t]).to({alpha:1},100).to({alpha:0},100)};this._init(n,t)}function CPayTableSettings(){var n;this._init=function(){var t,i;for(n=[],t=0;t<NUM_BETS;t++)for(n[t]=[],i=0;i<WIN_COMBINATIONS;i++)n[t][i]=COMBO_PRIZES[i]*(t+1)};this.getWin=function(t,i){return n[t][i]};this._init()}function CHandEvaluator(){var n,t;this.evaluate=function(i){n=[];for(var r=0;r<i.length;r++)n[r]={rank:i[r].getRank(),suit:i[r].getSuit()};return n.sort(this.compareRank),t=[0,1,2,3,4],this.rankHand()};this.rankHand=function(){return this._checkForRoyalFlush()?ROYAL_FLUSH:this._checkForStraightFlush()?STRAIGHT_FLUSH:this._checkForFourOfAKind()?FOUR_OF_A_KIND:this._checkForFullHouse()?FULL_HOUSE:this._checkForFlush()?FLUSH:this._checkForStraight()?STRAIGHT:this._checkForThreeOfAKind()?THREE_OF_A_KIND:this._checkForTwoPair()?TWO_PAIR:this._checkForOnePair()?JACKS_OR_BETTER:(this._identifyHighCard(),HIGH_CARD)};this._checkForRoyalFlush=function(){return this._isRoyalStraight()&&this._isFlush()?!0:!1};this._checkForStraightFlush=function(){return this._isStraight()&&this._isFlush()?!0:!1};this._checkForFourOfAKind=function(){return n[0].rank===n[3].rank?(n.splice(4,1),t.splice(4,1),!0):n[1].rank===n[4].rank?(n.splice(0,1),t.splice(0,1),!0):!1};this._checkForFullHouse=function(){return n[0].rank===n[1].rank&&n[2].rank===n[4].rank||n[0].rank===n[2].rank&&n[3].rank===n[4].rank?!0:!1};this._checkForFlush=function(){return this._isFlush()?!0:!1};this._checkForStraight=function(){return this._isStraight()?!0:!1};this._checkForThreeOfAKind=function(){return n[0].rank===n[1].rank&&n[0].rank===n[2].rank?(n.splice(3,1),n.splice(3,1),t.splice(3,1),t.splice(3,1),!0):n[1].rank===n[2].rank&&n[1].rank===n[3].rank?(n.splice(0,1),n.splice(3,1),t.splice(0,1),t.splice(3,1),!0):n[2].rank===n[3].rank&&n[2].rank===n[4].rank?(n.splice(0,1),n.splice(0,1),t.splice(0,1),t.splice(0,1),!0):!1};this._checkForTwoPair=function(){return n[0].rank===n[1].rank&&n[2].rank===n[3].rank?(n.splice(4,1),t.splice(4,1),!0):n[1].rank===n[2].rank&&n[3].rank===n[4].rank?(n.splice(0,1),t.splice(0,1),!0):n[0].rank===n[1].rank&&n[3].rank===n[4].rank?(n.splice(2,1),t.splice(2,1),!0):!1};this._checkForOnePair=function(){for(var r,u,i=0;i<4;i++)if(n[i].rank===n[i+1].rank&&n[i].rank>CARD_TEN)return r=n[i],u=n[i+1],n=[],n.push(r),n.push(u),t=[i,i+1],!0;return!1};this._identifyHighCard=function(){for(var t=0;t<4;t++)n.splice(0,1)};this._isFlush=function(){return n[0].suit===n[1].suit&&n[0].suit===n[2].suit&&n[0].suit===n[3].suit&&n[0].suit===n[4].suit?!0:!1};this._isRoyalStraight=function(){return n[0].rank===CARD_TEN&&n[1].rank===CARD_JACK&&n[2].rank===CARD_QUEEN&&n[3].rank===CARD_KING&&n[4].rank===CARD_ACE?!0:!1};this._isStraight=function(){var t=n[0].rank+1===n[1].rank&&n[1].rank+1===n[2].rank&&n[2].rank+1===n[3].rank;return t&&n[0].rank===CARD_TWO&&n[4].rank===CARD_ACE?!0:t&&n[3].rank+1===n[4].rank?!0:!1};this.compareRank=function(n,t){return n.rank<t.rank?-1:n.rank>t.rank?1:0};this.getSortedHand=function(){return n};this.getCardIndexInCombo=function(){return t}}function CCreditsPanel() {
  var t, i, e, r, u, f, o, n;
  this._init = function () {
    var c, h, s;
    n = new createjs.Container();
    n.alpha = 0;
    s_oStage.addChild(n);
    c = new createjs.Shape();
    c.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    n.addChild(c);
    h = s_oSpriteLibrary.getSprite("msg_box");
    t = createBitmap(h);
    t.x = CANVAS_WIDTH / 2;
    t.y = CANVAS_HEIGHT / 2;
    t.regX = h.width / 2;
    t.regY = h.height / 2;
    n.addChild(t);
    u = new createjs.Shape();
    u.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    u.alpha = .01;
    n.addChild(u);
    s = s_oSpriteLibrary.getSprite("but_exit");
    o = {
      x: CANVAS_WIDTH / 2 + 240,
      y: 270
    };
    e = new CGfxButton(o.x, o.y, s, n);
    e.addEventListener(ON_MOUSE_UP, this.unload, this);
    r = new createjs.Text(TEXT_CREDITS_DEVELOPED, "26px " + FONT1, "#fff");
    r.textAlign = "center";
    r.textBaseline = "alphabetic";
    r.x = CANVAS_WIDTH / 2;
    r.y = 330;
    n.addChild(r);
    s = s_oSpriteLibrary.getSprite("logo_ctl");
    i = createBitmap(s);
    i.regX = s.width / 2;
    i.regY = s.height / 2;
    i.x = CANVAS_WIDTH / 2;
    i.y = CANVAS_HEIGHT / 2;
    n.addChild(i);
    f = new createjs.Text(TEXT_CREDITS_URL, "30px " + FONT1, "#fff");
    f.textAlign = "center";
    f.textBaseline = "alphabetic";
    f.x = CANVAS_WIDTH / 2;
    f.y = 480;
    n.addChild(f);
    createjs.Tween.get(n).to({
      alpha: 1
    }, 600, createjs.Ease.cubicOut);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function () {};
  this.unload = function () {
    e.unload();
    e = null;
    s_oStage.removeChild(n);
  };
  this._init();
}function CTLText(n,t,i,r,u,f,e,o,s,h,c,l,a,v,y,p,w,b=11,k=false){this._oContainer=new createjs.Container;this._oContainer.x=t;this._oContainer.y=i;n&&this.setParentContainer(n);this._iOutline=0;this._iWidth=r;this._iHeight=u;this._bMultiline=p;this._iFontSize=f;this._iStartingFontSize=f;this._iOriginalFontSize=f;this._szAlign=e;this._szColor=o;this._szFont=s;this._iPaddingH=c;this._iPaddingV=l;this._iEffectiveWidth=this._iWidth-this._iPaddingH*2;this._iEffectiveHeight=this._iHeight-this._iPaddingV*2;this._bVerticalAlign=y;this._bFitText=v;this._iMinTextSize=b;this._bDebug=w;this._bEllipsis=k;this._bMandatoryCache=!1;this._bCacheActive=!1;this._fCacheScale;this._oDebugShape=null;this._fLineHeightFactor=h;this._oText=null;this.__setMsg(a);this.__createText()}function CButLang(n,t,i,r,u,f){var o=r,y=i,s,h,l,a,c,e,v=f;this._init=function(n,t,i,r){var f,u,y,p;for(s=[],h=[],e=new createjs.Container,e.x=n,e.y=t,a=e.on("mousedown",this._onPress,this),l=e.on("click",this._onChangeLang,this),v.addChild(e),f={},u=0;u<i;u++)f["lang_"+u]=u;y={images:[r],frames:{width:r.width/i,height:r.height},animations:f};p=new createjs.SpriteSheet(y);c=createSprite(p,"lang_"+o,0,0,r.width/i,r.height);e.addChild(c);e.regX=r.width/i/2;e.regY=r.height/2};this.unload=function(){e.off("mousedown",a);e.off("click",l)};this.addEventListener=function(n,t,i){s[n]=t;h[n]=i};this.setPosition=function(n,t){e.x=n;e.y=t};this.setLang=function(n){o=n;c.gotoAndStop("lang_"+o)};this._onPress=function(){e.scale=.9};this._onChangeLang=function(){e.scale=1;s[ON_SELECT_LANG]&&s[ON_SELECT_LANG].call(h[ON_SELECT_LANG],o)};this.getButtonImage=function(){return e};this._init(n,t,i,u)}function CLangPanel(n){var o,s,e,h,l,a,r,c,i,t,u,f,v=n,y=this;this._init=function(){o=[];s=[];f=new createjs.Container;f.visible=!1;v.addChild(f);i=new createjs.Shape;i.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);a=i.on("click",function(){});f.addChild(i);t=new createjs.Container;t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT/2;f.addChild(t);r=s_oSpriteLibrary.getSprite("msg_box");var n=createBitmap(r);t.addChild(n);this._placeLanguages();c=new CGfxButton(r.width-LANG_WIDTH/2+10,LANG_HEIGHT/2-10,s_oSpriteLibrary.getSprite("but_exit"),t);c.addEventListener(ON_MOUSE_UP,this.hide,this);t.regX=r.width/2;t.regY=r.height/2};this.unload=function(){c.unload();i.off("click",a);for(var n=0;n<e.length;n++)e[n].off("click",h[n])};this.addEventListener=function(n,t,i){o[n]=t;s[n]=i};this.show=function(){f.visible=!0;i.alpha=0;createjs.Tween.get(i).to({alpha:.7},400,createjs.Ease.cubicOut);t.alpha=0;createjs.Tween.get(t).wait(400).to({alpha:1},1e3,createjs.Ease.cubicOut)};this.hide=function(){createjs.Tween.get(i).to({alpha:0},400,createjs.Ease.cubicOut);createjs.Tween.get(t).to({alpha:.5},400,createjs.Ease.backIn).call(function(){f.visible=!1})};this._placeLanguages=function(){var v,o,f,a,n,i;for(u=new createjs.Container,u.x=r.width/2,u.y=r.height/2,t.addChild(u),v=s_oSpriteLibrary.getSprite("but_lang"),o={},f=0;f<NUM_LANGUAGES;f++)o["lang_"+f]=f;var y={images:[v],frames:{width:LANG_WIDTH,height:LANG_HEIGHT,regX:LANG_WIDTH/2,regY:LANG_HEIGHT/2},animations:o},p=new createjs.SpriteSheet(y),s=0,c=0;for(e=[],h=[],l=[],a=0,n=0;n<NUM_LANGUAGES;n++)i=createSprite(p,"lang_"+n,LANG_WIDTH/2,LANG_HEIGHT/2,LANG_WIDTH,LANG_HEIGHT),i.x=s,i.y=c,l[n]=i.on("mousedown",this._onPressLang,this,!1,n),h[n]=i.on("click",this._onSelectLang,this,!1,n),u.addChild(i),e.push(i),a++,n>0&&a%NUM_ITEMS_PER_COLS==0?(s=0,c+=LANG_HEIGHT+10):s+=LANG_WIDTH+10;u.regX=LANG_WIDTH*NUM_ITEMS_PER_COLS/2;u.regY=c-30};this._onPressLang=function(n,t){e[t].scale=.9};this._onSelectLang=function(n,t){e[t].scale=1;o[ON_SELECT_LANG]&&o[ON_SELECT_LANG].call(s[ON_SELECT_LANG],t);y.hide()};this._init()}var WIDESCREEN_RATIO,s_oMenu,s_oGame,s_oPayTableSettings,s_oInterface,LANG_WIDTH,LANG_HEIGHT,NUM_ITEMS_PER_COLS;(function(){"use strict";function p(n){return n=String(n),n.charAt(0).toUpperCase()+n.slice(1)}function nt(n,t,i){var r={"10.0":"10","6.4":"10 Technical Preview","6.3":"8.1","6.2":"8","6.1":"Server 2008 R2 / 7","6.0":"Server 2008 / Vista","5.2":"Server 2003 / XP 64-bit","5.1":"XP","5.01":"2000 SP1","5.0":"2000","4.0":"NT","4.90":"ME"};return t&&i&&/^Win/i.test(n)&&!/^Windows Phone /i.test(n)&&(r=r[/[\d.]+$/.exec(n)])&&(n="Windows "+r),n=String(n),t&&i&&(n=n.replace(RegExp(t,"i"),i)),o(n.replace(/ ce$/i," CE").replace(/\bhpw/i,"web").replace(/\bMacintosh\b/,"Mac OS").replace(/_PowerPC\b/i," OS").replace(/\b(OS X) [^ \d]+/i,"$1").replace(/\bMac (OS X)\b/,"$1").replace(/\/(\d)/," $1").replace(/_/g,".").replace(/(?: BePC|[ .]*fc[ \d.]+)$/i,"").replace(/\bx86\.64\b/gi,"x86_64").replace(/\b(Windows Phone) OS\b/,"$1").replace(/\b(Chrome OS \w+) [\d.]+\b/,"$1").split(" on ")[0])}function tt(n,t){var r=-1,i=n?n.length:0;if(typeof i=="number"&&i>-1&&i<=k)while(++r<i)t(n[r],r,n);else s(n,t)}function o(n){return n=w(n),/^(?:webOS|i(?:OS|P))/.test(n)?n:p(n)}function s(n,t){for(var i in n)g.call(n,i)&&t(n[i],i,n)}function t(n){return n==null?p(n):y.call(n).slice(8,-1)}function it(n,t){var i=n!=null?typeof n[t]:"number";return!/^(?:boolean|number|string|undefined)$/.test(i)&&(i=="object"?!!n[t]:!0)}function i(n){return String(n).replace(/([ -])(?!$)/g,"$1?")}function r(n,t){var i=null;return tt(n,function(r,u){i=t(i,r,u,n)}),i}function w(n){return String(n).replace(/^ +| +$/g,"")}function h(n){function ui(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function fi(t){return r(t,function(t,r,u){return t||(r[p]||r[/^[a-z]+(?: +[a-z]+\b)*/i.exec(p)]||RegExp("\\b"+i(u)+"(?:\\b|\\w*\\d)","i").exec(n))&&u})}function ei(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function oi(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+"(?:/[\\d.]+|[ \\w.]*)","i").exec(n))&&(t=nt(t,u,r.label||r)),t})}function wt(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+" *\\d+[.\\w_]*","i").exec(n)||RegExp("\\b"+u+" *\\w+-[\\w]*","i").exec(n)||RegExp("\\b"+u+"(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)","i").exec(n))&&((t=String(r.label&&!RegExp(u,"i").test(r.label)?r.label:t).split("/"))[1]&&!/[\d.]+/.test(t[0])&&(t[0]+=" "+t[1]),r=r.label||r,t=o(t[0].replace(RegExp(u,"i"),r).replace(RegExp("; *(?:"+r+"[_-])?","i")," ").replace(RegExp("("+r+")[-_.]?(\\w)","i"),"$1 $2"))),t})}function si(t){return r(t,function(t,i){return t||(RegExp(i+"(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)","i").exec(n)||0)[1]||null})}function hi(){return this.description||""}var g=u,ut=n&&typeof n=="object"&&t(n)!="String",ot,at,tt;ut&&(g=n,n=null);ot=g.navigator||{};at=ot.userAgent||"";n||(n=at);var ci=ut||d==b,bt=ut?!!ot.likeChrome:/\bChrome\b/.test(n)&&!/internal|\n/i.test(y.toString()),vt="Object",kt=ut?vt:"ScriptBridgingProxyObject",dt=ut?vt:"Environment",gt=ut&&g.java?"JavaPackage":t(g.java),ni=ut?vt:"RuntimeObject",st=/\bJava/.test(gt)&&g.java,ti=st&&t(g.environment)==dt,ii=st?"a":"α",ri=st?"b":"β",yt=g.document||{},ft=g.operamini||g.opera,ht=e.test(ht=ut&&ft?ft["[[Class]]"]:t(ft))?ht:ft=null,f,ct=n,v=[],lt=null,et=n==at,a=et&&ft&&typeof ft.version=="function"&&ft.version(),pt,k=ui([{label:"EdgeHTML",pattern:"Edge"},"Trident",{label:"WebKit",pattern:"AppleWebKit"},"iCab","Presto","NetFront","Tasman","KHTML","Gecko"]),c=ei(["Adobe AIR","Arora","Avant Browser","Breach","Camino","Electron","Epiphany","Fennec","Flock","Galeon","GreenBrowser","iCab","Iceweasel","K-Meleon","Konqueror","Lunascape","Maxthon",{label:"Microsoft Edge",pattern:"Edge"},"Midori","Nook Browser","PaleMoon","PhantomJS","Raven","Rekonq","RockMelt",{label:"Samsung Internet",pattern:"SamsungBrowser"},"SeaMonkey",{label:"Silk",pattern:"(?:Cloud9|Silk-Accelerated)"},"Sleipnir","SlimBrowser",{label:"SRWare Iron",pattern:"Iron"},"Sunrise","Swiftfox","Waterfox","WebPositive","Opera Mini",{label:"Opera Mini",pattern:"OPiOS"},"Opera",{label:"Opera",pattern:"OPR"},"Chrome",{label:"Chrome Mobile",pattern:"(?:CriOS|CrMo)"},{label:"Firefox",pattern:"(?:Firefox|Minefield)"},{label:"Firefox for iOS",pattern:"FxiOS"},{label:"IE",pattern:"IEMobile"},{label:"IE",pattern:"MSIE"},"Safari"]),p=wt([{label:"BlackBerry",pattern:"BB10"},"BlackBerry",{label:"Galaxy S",pattern:"GT-I9000"},{label:"Galaxy S2",pattern:"GT-I9100"},{label:"Galaxy S3",pattern:"GT-I9300"},{label:"Galaxy S4",pattern:"GT-I9500"},{label:"Galaxy S5",pattern:"SM-G900"},{label:"Galaxy S6",pattern:"SM-G920"},{label:"Galaxy S6 Edge",pattern:"SM-G925"},{label:"Galaxy S7",pattern:"SM-G930"},{label:"Galaxy S7 Edge",pattern:"SM-G935"},"Google TV","Lumia","iPad","iPod","iPhone","Kindle",{label:"Kindle Fire",pattern:"(?:Cloud9|Silk-Accelerated)"},"Nexus","Nook","PlayBook","PlayStation Vita","PlayStation","TouchPad","Transformer",{label:"Wii U",pattern:"WiiU"},"Wii","Xbox One",{label:"Xbox 360",pattern:"Xbox"},"Xoom"]),rt=fi({Apple:{iPad:1,iPhone:1,iPod:1},Archos:{},Amazon:{Kindle:1,"Kindle Fire":1},Asus:{Transformer:1},"Barnes & Noble":{Nook:1},BlackBerry:{PlayBook:1},Google:{"Google TV":1,Nexus:1},HP:{TouchPad:1},HTC:{},LG:{},Microsoft:{Xbox:1,"Xbox One":1},Motorola:{Xoom:1},Nintendo:{"Wii U":1,Wii:1},Nokia:{Lumia:1},Samsung:{"Galaxy S":1,"Galaxy S2":1,"Galaxy S3":1,"Galaxy S4":1},Sony:{PlayStation:1,"PlayStation Vita":1}}),l=oi(["Windows Phone","Android","CentOS",{label:"Chrome OS",pattern:"CrOS"},"Debian","Fedora","FreeBSD","Gentoo","Haiku","Kubuntu","Linux Mint","OpenBSD","Red Hat","SuSE","Ubuntu","Xubuntu","Cygwin","Symbian OS","hpwOS","webOS ","webOS","Tablet OS","Tizen","Linux","Mac OS X","Macintosh","Mac","Windows 98;","Windows "]);if(k&&(k=[k]),rt&&!p&&(p=wt([rt])),(f=/\bGoogle TV\b/.exec(p))&&(p=f[0]),/\bSimulator\b/i.test(n)&&(p=(p?p+" ":"")+"Simulator"),c=="Opera Mini"&&/\bOPiOS\b/.test(n)&&v.push("running in Turbo/Uncompressed mode"),c=="IE"&&/\blike iPhone OS\b/.test(n)?(f=h(n.replace(/like iPhone OS/,"")),rt=f.manufacturer,p=f.product):/^iP/.test(p)?(c||(c="Safari"),l="iOS"+((f=/ OS ([\d_]+)/i.exec(n))?" "+f[1].replace(/_/g,"."):"")):c!="Konqueror"||/buntu/i.test(l)?rt&&rt!="Google"&&(/Chrome/.test(c)&&!/\bMobile Safari\b/i.test(n)||/\bVita\b/.test(p))||/\bAndroid\b/.test(l)&&/^Chrome/.test(c)&&/\bVersion\//i.test(n)?(c="Android Browser",l=/\bAndroid\b/.test(l)?l:"Android"):c=="Silk"?(/\bMobi/i.test(n)||(l="Android",v.unshift("desktop mode")),/Accelerated *= *true/i.test(n)&&v.unshift("accelerated")):c=="PaleMoon"&&(f=/\bFirefox\/([\d.]+)\b/.exec(n))?v.push("identifying as Firefox "+f[1]):c=="Firefox"&&(f=/\b(Mobile|Tablet|TV)\b/i.exec(n))?(l||(l="Firefox OS"),p||(p=f[1])):!c||(f=!/\bMinefield\b/i.test(n)&&/\b(?:Firefox|Safari)\b/.exec(c))?(c&&!p&&/[\/,]|^[^(]+?\)/.test(n.slice(n.indexOf(f+"/")+8))&&(c=null),(f=p||rt||l)&&(p||rt||/\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(l))&&(c=/[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(l)?l:f)+" Browser")):c=="Electron"&&(f=(/\bChrome\/([\d.]+)\b/.exec(n)||0)[1])&&v.push("Chromium "+f):l="Kubuntu",a||(a=si(["(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))","Version",i(c),"(?:Firefox|Minefield|NetFront)"])),(f=k=="iCab"&&parseFloat(a)>3&&"WebKit"||/\bOpera\b/.test(c)&&(/\bOPR\b/.test(n)?"Blink":"Presto")||/\b(?:Midori|Nook|Safari)\b/i.test(n)&&!/^(?:Trident|EdgeHTML)$/.test(k)&&"WebKit"||!k&&/\bMSIE\b/i.test(n)&&(l=="Mac OS"?"Tasman":"Trident")||k=="WebKit"&&/\bPlayStation\b(?! Vita\b)/i.test(c)&&"NetFront")&&(k=[f]),c=="IE"&&(f=(/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(n)||0)[1])?(c+=" Mobile",l="Windows Phone "+(/\+$/.test(f)?f:f+".x"),v.unshift("desktop mode")):/\bWPDesktop\b/i.test(n)?(c="IE Mobile",l="Windows Phone 8.x",v.unshift("desktop mode"),a||(a=(/\brv:([\d.]+)/.exec(n)||0)[1])):c!="IE"&&k=="Trident"&&(f=/\brv:([\d.]+)/.exec(n))&&(c&&v.push("identifying as "+c+(a?" "+a:"")),c="IE",a=f[1]),et){if(it(g,"global"))if(st&&(f=st.lang.System,ct=f.getProperty("os.arch"),l=l||f.getProperty("os.name")+" "+f.getProperty("os.version")),ti){try{a=g.require("ringo/engine").version.join(".");c="RingoJS"}catch(li){(f=g.system)&&f.global.system==g.system&&(c="Narwhal",l||(l=f[0].os||null))}c||(c="Rhino")}else typeof g.process=="object"&&!g.process.browser&&(f=g.process)&&(typeof f.versions=="object"&&(typeof f.versions.electron=="string"?(v.push("Node "+f.versions.node),c="Electron",a=f.versions.electron):typeof f.versions.nw=="string"&&(v.push("Chromium "+a,"Node "+f.versions.node),c="NW.js",a=f.versions.nw)),c||(c="Node.js",ct=f.arch,l=f.platform,a=/[\d.]+/.exec(f.version),a=a?a[0]:null));else t(f=g.runtime)==kt?(c="Adobe AIR",l=f.flash.system.Capabilities.os):t(f=g.phantom)==ni?(c="PhantomJS",a=(f=f.version||null)&&f.major+"."+f.minor+"."+f.patch):typeof yt.documentMode=="number"&&(f=/\bTrident\/(\d+)/i.exec(n))?(a=[a,yt.documentMode],(f=+f[1]+4)!=a[1]&&(v.push("IE "+a[1]+" mode"),k&&(k[1]=""),a[1]=f),a=c=="IE"?String(a[1].toFixed(1)):a[0]):typeof yt.documentMode=="number"&&/^(?:Chrome|Firefox)\b/.test(c)&&(v.push("masking as "+c+" "+a),c="IE",a="11.0",k=["Trident"],l="Windows");l=l&&o(l)}if(a&&(f=/(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(a)||/(?:alpha|beta)(?: ?\d)?/i.exec(n+";"+(et&&ot.appMinorVersion))||/\bMinefield\b/i.test(n)&&"a")&&(lt=/b/i.test(f)?"beta":"alpha",a=a.replace(RegExp(f+"\\+?$"),"")+(lt=="beta"?ri:ii)+(/\d+\+?/.exec(f)||"")),c=="Fennec"||c=="Firefox"&&/\b(?:Android|Firefox OS)\b/.test(l))c="Firefox Mobile";else if(c=="Maxthon"&&a)a=a.replace(/\.[\d.]+/,".x");else if(/\bXbox\b/i.test(p))p=="Xbox 360"&&(l=null),p=="Xbox 360"&&/\bIEMobile\b/.test(n)&&v.unshift("mobile mode");else if((/^(?:Chrome|IE|Opera)$/.test(c)||c&&!p&&!/Browser|Mobi/.test(c))&&(l=="Windows CE"||/Mobi/i.test(n)))c+=" Mobile";else if(c=="IE"&&et)try{g.external===null&&v.unshift("platform preview")}catch(li){v.unshift("embedded")}else(/\bBlackBerry\b/.test(p)||/\bBB10\b/.test(n))&&(f=(RegExp(p.replace(/ +/g," *")+"/([.\\d]+)","i").exec(n)||0)[1]||a)?(f=[f,/BB10/.test(n)],l=(f[1]?(p=null,rt="BlackBerry"):"Device Software")+" "+f[0],a=null):this!=s&&p!="Wii"&&(et&&ft||/Opera/.test(c)&&/\b(?:MSIE|Firefox)\b/i.test(n)||c=="Firefox"&&/\bOS X (?:\d+\.){2,}/.test(l)||c=="IE"&&(l&&!/^Win/.test(l)&&a>5.5||/\bWindows XP\b/.test(l)&&a>8||a==8&&!/\bTrident\b/.test(n)))&&!e.test(f=h.call(s,n.replace(e,"")+";"))&&f.name&&(f="ing as "+f.name+((f=f.version)?" "+f:""),e.test(c)?(/\bIE\b/.test(f)&&l=="Mac OS"&&(l=null),f="identify"+f):(f="mask"+f,c=ht?o(ht.replace(/([a-z])([A-Z])/g,"$1 $2")):"Opera",/\bIE\b/.test(f)&&(l=null),et||(a=null)),k=["Presto"],v.push(f));return(f=(/\bAppleWebKit\/([\d.]+\+?)/i.exec(n)||0)[1])&&(f=[parseFloat(f.replace(/\.(\d)$/,".0$1")),f],c=="Safari"&&f[1].slice(-1)=="+"?(c="WebKit Nightly",lt="alpha",a=f[1].slice(0,-1)):(a==f[1]||a==(f[2]=(/\bSafari\/([\d.]+\+?)/i.exec(n)||0)[1]))&&(a=null),f[1]=(/\bChrome\/([\d.]+)/i.exec(n)||0)[1],f[0]==537.36&&f[2]==537.36&&parseFloat(f[1])>=28&&k=="WebKit"&&(k=["Blink"]),et&&(bt||f[1])?(k&&(k[1]="like Chrome"),f=f[1]||(f=f[0],f<530?1:f<532?2:f<532.05?3:f<533?4:f<534.03?5:f<534.07?6:f<534.1?7:f<534.13?8:f<534.16?9:f<534.24?10:f<534.3?11:f<535.01?12:f<535.02?"13+":f<535.07?15:f<535.11?16:f<535.19?17:f<536.05?18:f<536.1?19:f<537.01?20:f<537.11?"21+":f<537.13?23:f<537.18?24:f<537.24?25:f<537.36?26:k!="Blink"?"27":"28")):(k&&(k[1]="like Safari"),f=(f=f[0],f<400?1:f<500?2:f<526?3:f<533?4:f<534?"4+":f<535?5:f<537?6:f<538?7:f<601?8:"8")),k&&(k[1]+=" "+(f+=typeof f=="number"?".x":/[.+]/.test(f)?"":"+")),c=="Safari"&&(!a||parseInt(a)>45)&&(a=f)),c=="Opera"&&(f=/\bzbov|zvav$/.exec(l))?(c+=" ",v.unshift("desktop mode"),f=="zvav"?(c+="Mini",a=null):c+="Mobile",l=l.replace(RegExp(" *"+f+"$"),"")):c=="Safari"&&/\bChrome\b/.exec(k&&k[1])&&(v.unshift("desktop mode"),c="Chrome Mobile",a=null,/\bOS X\b/.test(l)?(rt="Apple",l="iOS 4.3+"):l=null),a&&a.indexOf(f=/[\d.]+$/.exec(l))==0&&n.indexOf("/"+f+"-")>-1&&(l=w(l.replace(f,""))),k&&!/\b(?:Avant|Nook)\b/.test(c)&&(/Browser|Lunascape|Maxthon/.test(c)||c!="Safari"&&/^iOS/.test(l)&&/\bSafari\b/.test(k[1])||/^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(c)&&k[1])&&(f=k[k.length-1])&&v.push(f),v.length&&(v=["("+v.join("; ")+")"]),rt&&p&&p.indexOf(rt)<0&&v.push("on "+rt),p&&v.push((/^on /.test(v[v.length-1])?"":"on ")+p),l&&(f=/ ([\d.+]+)$/.exec(l),pt=f&&l.charAt(l.length-f[0].length-1)=="/",l={architecture:32,family:f&&!pt?l.replace(f[0],""):l,version:f?f[1]:null,toString:function(){var n=this.version;return this.family+(n&&!pt?" "+n:"")+(this.architecture==64?" 64-bit":"")}}),(f=/\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(ct))&&!/\bi686\b/i.test(ct)?(l&&(l.architecture=64,l.family=l.family.replace(RegExp(" *"+f),"")),c&&(/\bWOW64\b/i.test(n)||et&&/\w(?:86|32)$/.test(ot.cpuClass||ot.platform)&&!/\bWin64; x64\b/i.test(n))&&v.unshift("32-bit")):l&&/^OS X/.test(l.family)&&c=="Chrome"&&parseFloat(a)>=39&&(l.architecture=64),n||(n=null),tt={},tt.description=n,tt.layout=k&&k[0],tt.manufacturer=rt,tt.name=c,tt.prerelease=lt,tt.product=p,tt.ua=n,tt.version=c&&a,tt.os=l||{architecture:null,family:null,version:null,toString:function(){return"null"}},tt.parse=h,tt.toString=hi,tt.version&&v.unshift(a),tt.name&&v.unshift(c),!l||!c||l==String(l).split(" ")[0]&&(l==c.split(" ")[0]||p)||v.push(p?"("+l+")":"on "+l),v.length&&(tt.description=v.join(" ")),tt}var c={"function":!0,object:!0},u=c[typeof window]&&window||this,b=u,l=c[typeof exports]&&exports,a=c[typeof module]&&module&&!module.nodeType&&module,n=l&&a&&typeof global=="object"&&global,f;n&&(n.global===n||n.window===n||n.self===n)&&(u=n);var k=Math.pow(2,53)-1,e=/\bOpera/,d=this,v=Object.prototype,g=v.hasOwnProperty,y=v.toString;f=h();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(u.platform=f,define(function(){return f})):l&&a?s(f,function(n,t){l[t]=n}):u.platform=f}).call(this);document.addEventListener("DOMContentLoaded",()=>{platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&(buildIOSFullscreenPanel(),buildIOSMeta())});window.addEventListener("resize",function(){platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&iosResize()});var s_iScaleFactor=1,s_bIsIphone=!1,s_iOffsetX,s_iOffsetY,s_bFocus=!0;if(function(n){(jQuery.browser=jQuery.browser||{}).mobile=/android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|tablet|treo|up\.(browser|link)|vodafone|wap|webos|windows (ce|phone)|xda|xiino/i.test(n)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(n.substr(0,4))}(navigator.userAgent||navigator.vendor||window.opera),$(window).resize(function(){sizeHandler()}),window.addEventListener("orientationchange",onOrientationChange),Array.prototype.sortOn=function(){var n=this.slice(),t;return arguments.length?(t=Array.prototype.slice.call(arguments),n.sort(function(n,i){for(var u=t.slice(),r=u.shift();n[r]==i[r]&&u.length;)r=u.shift();return n[r]==i[r]?0:n[r]>i[r]?1:-1})):n.sort()},NoClickDelay.prototype={handleEvent:function(n){switch(n.type){case"touchstart":this.onTouchStart(n);break;case"touchmove":this.onTouchMove(n);break;case"touchend":this.onTouchEnd(n)}},onTouchStart:function(n){n.preventDefault();this.moved=!1;this.element.addEventListener("touchmove",this,!1);this.element.addEventListener("touchend",this,!1)},onTouchMove:function(){this.moved=!0},onTouchEnd:function(n){var t,i;this.element.removeEventListener("touchmove",this,!1);this.element.removeEventListener("touchend",this,!1);this.moved||(t=document.elementFromPoint(n.changedTouches[0].clientX,n.changedTouches[0].clientY),t.nodeType===3&&(t=t.parentNode),i=document.createEvent("MouseEvents"),i.initEvent("click",!0,!0),t.dispatchEvent(i))}},function(){function n(n){var i="visible",r="hidden",u={focus:i,focusin:i,pageshow:i,blur:r,focusout:r,pagehide:r};n=n||window.event;n.type in u?document.body.className=u[n.type]:(document.body.className=this[t]?"hidden":"visible",document.body.className==="hidden"?(s_oMain.stopUpdate(),s_bFocus=!1):(s_oMain.startUpdate(),s_bFocus=!0))}var t="hidden";t in document?document.addEventListener("visibilitychange",n):(t="mozHidden")in document?document.addEventListener("mozvisibilitychange",n):(t="webkitHidden")in document?document.addEventListener("webkitvisibilitychange",n):(t="msHidden")in document?document.addEventListener("msvisibilitychange",n):"onfocusin"in document?document.onfocusin=document.onfocusout=n:window.onpageshow=window.onpagehide=window.onfocus=window.onblur=n}(),screenfull.isEnabled)screenfull.on("change",function(){s_bFullscreen=screenfull.isFullscreen;s_oInterface!==null&&s_oInterface.resetFullscreenBut();s_oMenu!==null&&s_oMenu.resetFullscreenBut()});var CANVAS_WIDTH=1920,CANVAS_HEIGHT=768,EDGEBOARD_X=450,EDGEBOARD_Y=0,FONT1="OpenSans-BoldItalic",FONT2="Digital-7",FPS_TIME=1e3/30,DISABLE_SOUND_MOBILE=!1,STATE_LOADING=0,STATE_MENU=1,STATE_HELP=1,STATE_GAME=3,STATE_GAME_WAITING_FOR_BET=0,STATE_GAME_DEAL=1,STATE_GAME_CHOOSE_HOLD=2,STATE_GAME_DRAW=3,STATE_GAME_EVALUATE=4,ON_CARD_SHOWN="ON_CARD_SHOWN",ON_CARD_HIDE="ON_CARD_HIDE",ON_MOUSE_DOWN=0,ON_MOUSE_UP=1,ON_MOUSE_OVER=2,ON_MOUSE_OUT=3,ON_DRAG_START=4,ON_DRAG_END=5,ON_SELECT_LANG=6,ROYAL_FLUSH=0,STRAIGHT_FLUSH=1,FOUR_OF_A_KIND=2,FULL_HOUSE=3,FLUSH=4,STRAIGHT=5,THREE_OF_A_KIND=6,TWO_PAIR=7,JACKS_OR_BETTER=8,HIGH_CARD=9,CARD_TWO=2,CARD_THREE=3,CARD_FOUR=4,CARD_FIVE=5,CARD_SIX=6,CARD_SEVEN=7,CARD_EIGHT=8,CARD_NINE=9,CARD_TEN=10,CARD_JACK=11,CARD_QUEEN=12,CARD_KING=13,CARD_ACE=14,SUIT_HEARTS=0,SUIT_DIAMONDS=1,SUIT_CLUBS=2,SUIT_SPADES=3,CARD_WIDTH=154,CARD_HEIGHT=240,BET_TYPE,TOTAL_MONEY,NUM_BETS=5,WIN_COMBINATIONS=9,COMBO_PRIZES,AUTOMATIC_RECHARGE,WIN_OCCURRENCE,MIN_WIN,NUM_HAND_FOR_ADS,ENABLE_FULLSCREEN,ENABLE_CHECK_ORIENTATION,SOUNDTRACK_VOLUME_IN_GAME=.5,NUM_LANGUAGES=13,LANG_EN=0,LANG_ES=1,LANG_FR=2,LANG_DE=3,LANG_PT=4,LANG_IT=5,LANG_RU=6,LANG_TR=7,LANG_AR=8,LANG_HI=9,LANG_ID=10,LANG_JA=11,LANG_ZH=12,LANG_CODES={};LANG_CODES.en=LANG_EN;LANG_CODES.es=LANG_ES;LANG_CODES.fr=LANG_FR;LANG_CODES.de=LANG_DE;LANG_CODES.pt=LANG_PT;LANG_CODES.it=LANG_IT;LANG_CODES.ru=LANG_RU;LANG_CODES.tr=LANG_TR;LANG_CODES.ar=LANG_AR;LANG_CODES.hi=LANG_HI;LANG_CODES.id=LANG_ID;LANG_CODES.ja=LANG_JA;LANG_CODES.zh=LANG_ZH;LANG_CODES.be=LANG_RU;LANG_CODES.kk=LANG_RU;LANG_CODES.uk=LANG_RU;LANG_CODES.uz=LANG_RU;var s_bMobile,s_bAudioActive=!0,s_iCntTime=0,s_iTimeElaps=0,s_iPrevTime=0,s_iCntFps=0,s_iCurFps=0,s_oDrawLayer,s_oStage,s_oCanvas,s_oMain=null,s_oSpriteLibrary,s_oSoundTrack=null,s_bFullscreen=!1,s_aSounds,s_iCurLang=LANG_EN,s_bStorageAvailable=!0,s_iCurMoney,s_szGameID="9P5VLRC06KRK",s_bLandscape=!0;const MENU_MOREGAMES_OFFSET_Y=40;WIDESCREEN_RATIO=1.6;s_oMenu=null;s_oInterface=null;CTLText.prototype={constructor:CTLText,__autofit:function(){var r=this._szMsg,t=r.length<3?!1:this._bEllipsis,i,n;if(t&&(this._oText.text=this._szMsg),!t&&!this._bMultiline){this.__autofitLight();return}i=r.length-2;n=this._iStartingFontSize;this.__refreshTextFont(n);for(var u=this._oText.getBounds(),f=this._iEffectiveWidth-this._iOutline,e=this._iEffectiveHeight-this._iOutline;u.height>e||u.width>f;){if(t&&n<this._iMinTextSize){if(i--,this._oText.text=r.slice(0,i)+"...",this.__updateY(),this.__verticalAlign(),i==1)break}else if(n--,this.__refreshTextFont(n),this.__updateY(),this.__verticalAlign(),n<this._iMinTextSize&&!t)break;u=this._oText.getBounds()}this._iFontSize=n;this.__updateY();this.__verticalAlign();this.__updateStroke()},__autofitLight:function(){this.__refreshTextFont(this._iStartingFontSize);var t=this._oText.getBounds(),i=this._iEffectiveWidth-this._iOutline,r=this._iEffectiveHeight-this._iOutline,u=Math.floor(this.__linearFunction(i,t.width,0,this._iStartingFontSize,0)),f=Math.floor(this.__linearFunction(r,t.height,0,this._iStartingFontSize,0)),n=Math.min(u,f);n>this._iStartingFontSize?n=this._iStartingFontSize:n<this._iMinTextSize&&(n=this._iMinTextSize);this.__refreshTextFont(n);this._iFontSize=n;this.__updateY();this.__verticalAlign();this.__updateStroke()},__linearFunction:function(n,t,i,r,u){return(n-t)*(u-r)/(i-t)+r},__checkAutofit:function(){this._bFitText?this.__autofit():(this.__refreshTextFont(this._iStartingFontSize),this.__updateY(),this.__verticalAlign(),this.__updateStroke())},__refreshTextFont:function(n){this._oText.font=n+"px "+this._szFont;this._oText.lineHeight=Math.round(n*this._fLineHeightFactor)},__verticalAlign:function(){if(this._bVerticalAlign){var n=this._oText.getBounds().height;this._oText.y-=(n-this._iHeight)/2+this._iPaddingV}},__updateY:function(){this._oText.y=this._iPaddingV;switch(this._oText.textBaseline){case"middle":this._oText.y+=this._oText.lineHeight/2+(this._iFontSize*this._fLineHeightFactor-this._iFontSize)}},__updateStroke:function(){this._oStroke&&(this._oStroke.x=this._oText.x,this._oStroke.y=this._oText.y,this._oStroke.text=this._oText.text,this._oStroke.font=this._oText.font,this._oStroke.textAlign=this._oText.textAlign,this._oStroke.lineHeight=this._oText.lineHeight)},__updateOutline:function(){this._iOutline=this._oStroke&&this._oStroke.outline>this._oText.outline?this._oStroke.outline:this._oText.outline},__updateHorizontalAlign:function(){switch(this._szAlign){case"center":this._oText.x=this._iWidth/2;break;case"left":this._oText.x=this._iPaddingH;break;case"right":this._oText.x=this._iWidth-this._iPaddingH}},__setMsg:function(n){this._szMsg=n;this._szMsg!==""&&(this._szMsg||this._szMsg===0)||(this._szMsg=" ")},__createDebugShape:function(){this._oDebugShape=new createjs.Shape;this.__refreshDebugShape()},__refreshDebugShape:function(){this._oDebugShape.graphics.clear();this._oDebugShape.graphics.beginFill("rgba(255,130,0,0.5)").drawRect(0,0,this._iWidth,this._iHeight).moveTo(this._iPaddingH,this._iHeight-this._iPaddingV).lineTo(this._iWidth-this._iPaddingH,this._iHeight-this._iPaddingV).lineTo(this._iWidth-this._iPaddingH,this._iPaddingV).lineTo(this._iPaddingH,this._iPaddingV).closePath().beginFill("rgba(255,0,0,0.5)").drawRect(this._iPaddingH,this._iPaddingV,this._iEffectiveWidth,this._iEffectiveHeight)},__updateLineWidth:function(){this._oText.lineWidth=this._bMultiline?this._iWidth-this._iPaddingH*2:null;this._oStroke&&(this._oStroke.lineWidth=this._oText.lineWidth)},__updateWidth:function(){this.__updateLineWidth();this.__updateHorizontalAlign()},__updateSize:function(){this.__checkAutofit();this._bDebug&&this.__refreshDebugShape()},__createText:function(){this._bDebug&&(this.__createDebugShape(),this._oContainer.addChild(this._oDebugShape));this._oText=new createjs.Text(this._szMsg,this._iFontSize+"px "+this._szFont,this._szColor);this._oText.textBaseline="middle";this._oText.lineHeight=Math.round(this._iFontSize*this._fLineHeightFactor);this._oText.textAlign=this._szAlign;this.__updateLineWidth();this.__updateHorizontalAlign();this._oContainer.addChild(this._oText);try{var i=s_oCanvas.getContext("2d"),t=!!window.WebGLRenderingContext&&(s_oCanvas.getContext("webgl")||s_oCanvas.getContext("experimental-webgl")),n=t!==null;this._bMandatoryCache=n;this.setCacheActive(n)}catch(r){this._bMandatoryCache=!1;this.setCacheActive(!1)}this.refreshText(this._szMsg)},setStroke:function(n,t){this._oStroke||(this._oStroke=this._oText.clone(),this._oContainer.addChild(this._oStroke),this._oContainer.swapChildren(this._oStroke,this._oText));this.setStrokeColor(t?t:this._szStrokeColor);this.setStrokeSize(n?n:this._iStrokeSize);this.updateCache()},setStrokeColor:function(n){this._szStrokeColor=n;this._oStroke&&(this._oStroke.color=this._szStrokeColor,this.updateCache())},setStrokeSize:function(n){this._iStrokeSize=n;this._oStroke&&(this._oStroke.outline=this._iStrokeSize,this.__updateOutline(),this.__checkAutofit(),this.updateCache())},removeStroke:function(){this._oStroke&&(this._oContainer.removeChild(this._oStroke),this._oStroke=null,this.__updateOutline(),this.__checkAutofit(),this.updateCache())},roll:function(n,t,i,r,u,f){var e,o;t=t==null?1500:t;i=i==null?createjs.Ease.linear:i;e={score:parseInt(this._szMsg)};this._szMsg=n;o=this._bFitText?function(){this._oText.text=Math.floor(e.score);this.__autofitLight();this.updateCache()}:function(){this._oText.text=Math.floor(e.score);this.__updateY();this.__verticalAlign();this.__updateStroke();this.updateCache()};this.stopRolling();this._oTweenRollText=createjs.Tween.get(e,{override:!0}).to({score:n},t,i);this._oTweenRollText.on("change",o,this);this._oTweenRollText.on("complete",function(){r&&r.apply(u,f);this.stopRolling()},this,!0)},isRolling:function(){return this._oTweenRollText==null?!1:!0},stopRolling:function(){this.isRolling()&&(this._oTweenRollText.removeAllEventListeners(),this._oTweenRollText.paused=!0,this._oTweenRollText=null)},pauseRolling:function(){this.isRolling()&&(this._oTweenRollText.paused=!0)},resumeRolling:function(){this.isRolling()&&(this._oTweenRollText.paused=!1)},setY:function(n){this._oContainer.y=n},setX:function(n){this._oContainer.x=n},setHorizontalSize:function(n,t=this._iPaddingH){this.__setHorizontalSizeVars(n,t);this.__updateWidth();this.__updateSize();this._updateCacheSize()},setVerticalSize:function(n,t=this._iPaddingV){this.__setVerticalSizeVars(n,t);this.__updateSize();this._updateCacheSize()},setSize:function(n,t,i=this._iPaddingH,r=this._iPaddingV){this.__setHorizontalSizeVars(n,i);this.__setVerticalSizeVars(t,r);this.__updateWidth();this.__updateSize();this._updateCacheSize()},__setHorizontalSizeVars:function(n,t){this._iWidth=n;this._iPaddingH=t;this._iEffectiveWidth=this._iWidth-this._iPaddingH*2},__setVerticalSizeVars:function(n,t){this._iHeight=n;this._iPaddingV=t;this._iEffectiveHeight=this._iHeight-this._iPaddingV*2},setPosition:function(n,t){this._oContainer.x=n;this._oContainer.y=t},setHorizontalAlign:function(n){this._szAlign=n;this._oText.textAlign=this._szAlign;this.__updateHorizontalAlign();this.__updateStroke();this.updateCache()},setVerticalAlign:function(n){this._bVerticalAlign=n},setOutline:function(n){this._oText.outline=n;this.__updateOutline();this.updateCache()},setShadow:function(n,t,i,r){console.warn("ON FIREFOX: When the text have a shadow and is/goes invisible, \n                        it cause a weird and increasing amount of workload on CPU and the game stuck. \n                            Consider use caching, or stroke instead");this._oText.shadow=new createjs.Shadow(n,t,i,r);this.updateCache()},setColor:function(n){this._szColor=n;this._oText.color=this._szColor;this.updateCache()},setAlpha:function(n){this._oContainer.alpha=n},setVisible:function(n){this._oContainer.visible=n},setFontSize:function(n){this._iFontSize=this._iStartingFontSize=n;this.refreshText(this._szMsg)},resetFontSize:function(){this.setFontSize(this._iOriginalFontSize)},setRegX:function(n){this._oContainer.regX=n},setRegY:function(n){this._oContainer.regY=n},setScale:function(n){this._oContainer.scale=n},setParentContainer:function(n){n.contains(this._oContainer)||(this.removeContainerFromParent(),this._oParentContainer=n,this._oParentContainer.addChild(this._oContainer))},removeContainerFromParent:function(){this._oParentContainer&&(this._oParentContainer.removeChild(this._oContainer),this._oParentContainer=null)},setCacheActive:function(n,t=1){var i=!1;(this._fCacheScale!=t&&n&&(i=!0,this._oContainer.uncache()),i||!this._bMandatoryCache)&&(this._fCacheScale=t,!this._bCacheActive&&n||i?this._oContainer.cache(0,0,this.__nextPow2(this._iEffectiveWidth),this.__nextPow2(this._iEffectiveHeight),this._fCacheScale):this._bCacheActive&&!n&&this._oContainer.uncache(),this._bCacheActive=n)},_updateCacheSize:function(){this._bCacheActive&&(this._oContainer.uncache(),this._oContainer.cache(0,0,this.__nextPow2(this._iEffectiveWidth),this.__nextPow2(this._iEffectiveHeight),this._fCacheScale))},__nextPow2:function(n){var t=Math.floor(Math.log2(n));return Math.pow(2,t)===n?n:Math.pow(2,t+1)},updateCache:function(){this._bCacheActive&&this._oContainer.updateCache()},removeTweens:function(){createjs.Tween.removeTweens(this._oContainer)},getText:function(){return this._oText},getTextWidth:function(){return this._oText.getBounds().width+this._iOutline},getTextHeight:function(){return this._oText.getBounds().height+this._iOutline},getMsg:function(){return this._szMsg},getX:function(){return this._oContainer.x},getY:function(){return this._oContainer.y},getHeight:function(){return this._iHeight},getWidth:function(){return this._iWidth},getPaddingH:function(){return this._iPaddingH},getPaddingV:function(){return this._iPaddingV},getColor:function(){return this._szColor},getFontSize:function(){return this._iFontSize},getContainer:function(){return this._oContainer},unload:function(){this.stopRolling();this._bCacheActive&&this._oContainer.uncache();createjs.Tween.removeTweens(this._oContainer);this.removeContainerFromParent()},refreshText:function(n){this.__setMsg(n);this._oText.text=this._szMsg;this.__checkAutofit();this.updateCache()},checkParameters:function(){}};LANG_WIDTH=54;LANG_HEIGHT=54;NUM_ITEMS_PER_COLS=7;const MOREGAMES_BUTS_ID=["9mt4hk2d6rcn","9p5vlrc06krk","9pmdqv93xn3r"],ROWS_BUTS_PORTRAIT=2,COLS_BUTS_PORTRAIT=1,ROWS_BUTS_LANDSCAPE=1,COLS_BUTS_LANDSCAPE=2,ROWS_BUTS_WIDESCREEN=1,COLS_BUTS_WIDESCREEN=2,BUTS_MOREGAMES_OFFSET_X=30,BUTS_MOREGAMES_OFFSET_Y=70,BUTS_MOREGAMES_EDGE_X=30,BUTS_MOREGAMES_EDGE_Y=140,BUTS_MOREGAMES_EDGE_Y_WIDESCREEN=120,MOREGAMES_MAX_SCALE_LANDSCAPE=1,MOREGAMES_MAX_SCALE_PORTRAIT=1.2,MOREGAMES_TITLE_HEIGHT=60,MOREGAMES_TITLE_SIZE=60,MOREGAMES_TITLE_OFFSET_Y=0,MOREGAMES_LINE_HEIGHT=6,MOREGAMES_LINE_OFFSET_Y=20,COLS_LINE_LANDSCAPE=2,COLS_LINE_PORTRAIT=1