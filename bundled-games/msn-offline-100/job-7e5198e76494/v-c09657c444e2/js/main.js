/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton
 * Available under MIT license <https://mths.be/mit>
 */
function buildIOSMeta(){for(var n,i,r=[{name:"viewport",content:"width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"},{name:"apple-mobile-web-app-capable",content:"yes"},{name:"apple-mobile-web-app-status-bar-style",content:"black"}],t=0;t<r.length;t++)n=document.createElement("meta"),n.name=r[t].name,n.content=r[t].content,i=window.document.head.querySelector('meta[name="'+n.name+'"]'),i&&i.parentNode.removeChild(i),window.document.head.appendChild(n)}function hideIOSFullscreenPanel(){jQuery(".xxx-ios-fullscreen-message").css("display","none");jQuery(".xxx-ios-fullscreen-scroll").css("display","none");jQuery(".xxx-game-iframe-full").removeClass("xxx-game-iframe-iphone-se")}function buildIOSFullscreenPanel(){var n="";n+='<div class="xxx-ios-fullscreen-message">';n+='<div class="xxx-ios-fullscreen-swipe">';n+="<\/div>";n+="<\/div>";n+='<div class="xxx-ios-fullscreen-scroll">';n+="<\/div>";jQuery("body").append(n)}function showIOSFullscreenPanel(){jQuery(".xxx-ios-fullscreen-message").css("display","block");jQuery(".xxx-ios-fullscreen-scroll").css("display","block")}function __iosResize(){if(window.scrollTo(0,0),console.log(window.devicePixelRatio),console.log(window.innerWidth),console.log(window.innerHeight),platform.product==="iPhone")switch(window.devicePixelRatio){case 2:switch(window.innerWidth){case 568:window.innerHeight===320||jQuery(".xxx-game-iframe-full").addClass("xxx-game-iframe-iphone-se");break;case 667:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;case 3:switch(window.innerWidth){case 736:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 724:window.innerHeight===375?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;case 808:window.innerHeight===414?hideIOSFullscreenPanel():showIOSFullscreenPanel();break;default:hideIOSFullscreenPanel()}break;default:hideIOSFullscreenPanel()}}function iosResize(){__iosResize();setTimeout(function(){__iosResize()},500)}function iosInIframe(){try{return window.self!==window.top}catch(n){return!0}}function isIOSLessThen13(){var n=platform.os,t=n.family.toLowerCase(),i=parseFloat(n.version);return t==="ios"&&i<13?!0:!1}function trace(n){console.log(n)}function getSize(n){var u,e=n.toLowerCase(),f=window.document,t=f.documentElement,i,r;return window["inner"+n]===undefined?u=t["client"+n]:window["inner"+n]!=t["client"+n]?(i=f.createElement("body"),i.id="vpw-test-b",i.style.cssText="overflow:scroll",r=f.createElement("div"),r.id="vpw-test-d",r.style.cssText="position:absolute;top:-1000px",r.innerHTML="<style>@media("+e+":"+t["client"+n]+"px){body#vpw-test-b div#vpw-test-d{"+e+":7px!important}}<\/style>",i.appendChild(r),t.insertBefore(i,f.head),u=r["offset"+n]==7?t["client"+n]:window["inner"+n],t.removeChild(i)):u=window["inner"+n],u}function onOrientationChange(){window.matchMedia("(orientation: portrait)").matches&&sizeHandler();window.matchMedia("(orientation: landscape)").matches&&sizeHandler()}function isIpad(){var n=navigator.userAgent.toLowerCase().indexOf("ipad")!==-1;return!n&&navigator.userAgent.match(/Mac/)&&navigator.maxTouchPoints&&navigator.maxTouchPoints>2?!0:n}function isMobile(){return isIpad()?!0:navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/BlackBerry/i)||navigator.userAgent.match(/Windows Phone/i)?!0:!1}function isIOS(){if(isIpad())return!0;for(var n=["iPad Simulator","iPhone Simulator","iPod Simulator","iPad","iPhone","iPod"];n.length;)if(navigator.platform===n.pop())return s_bIsIphone=!0,!0;return s_bIsIphone=!1,!1}function isRetina(){s_bIsRetina=matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches?!0:!1}function getIOSWindowHeight(){var n=document.documentElement.clientWidth/window.innerWidth;return window.innerHeight*n}function getHeightOfIOSToolbars(){var n=(window.orientation===0?screen.height:screen.width)-getIOSWindowHeight();return n>1?n:0}function sizeHandler(){var i,r,h;if(window.scrollTo(0,1),$("#canvas")){i=platform.name!==null&&platform.name.toLowerCase()==="safari"?getIOSWindowHeight():getSize("Height");r=getSize("Width");s_bFocus&&_checkOrientation(r,i);var e=Math.min(i/CANVAS_HEIGHT,r/CANVAS_WIDTH),n=Math.round(CANVAS_WIDTH*e),t=Math.round(CANVAS_HEIGHT*e),f=0;t<i?(f=i-t,t+=f,n+=f*(CANVAS_WIDTH/CANVAS_HEIGHT)):n<r&&(f=r-n,n+=f,t+=f*(CANVAS_HEIGHT/CANVAS_WIDTH));var u=i/2-t/2,o=r/2-n/2,s=CANVAS_WIDTH/n;(o*s<-EDGEBOARD_X||u*s<-EDGEBOARD_Y)&&(e=Math.min(i/(CANVAS_HEIGHT-EDGEBOARD_Y*2),r/(CANVAS_WIDTH-EDGEBOARD_X*2)),n=CANVAS_WIDTH*e,t=CANVAS_HEIGHT*e,u=(i-t)/2,o=(r-n)/2,s=CANVAS_WIDTH/n);s_iOffsetX=-1*o*s;s_iOffsetY=-1*u*s;u>=0&&(s_iOffsetY=0);o>=0&&(s_iOffsetX=0);s_oInterface!==null&&s_oInterface.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_oMenu!==null&&s_oMenu.refreshButtonPos(s_iOffsetX,s_iOffsetY);s_bIsRetina&&s_oStage?(canvas=document.getElementById("canvas"),s_oStage.canvas.width=n*2,s_oStage.canvas.height=t*2,canvas.style.width=n+"px",canvas.style.height=t+"px",h=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_iScaleFactor=h*2,s_oStage.scaleX=s_oStage.scaleY=h*2):s_bMobile?($("#canvas").css("width",n+"px"),$("#canvas").css("height",t+"px")):s_oStage&&(s_oStage.canvas.width=n,s_oStage.canvas.height=t,s_iScaleFactor=Math.min(n/CANVAS_WIDTH,t/CANVAS_HEIGHT),s_oStage.scaleX=s_oStage.scaleY=s_iScaleFactor);u<0?$("#canvas").css("top",u+"px"):(u=(i-t)/2,$("#canvas").css("top",u+"px"));$("#canvas").css("left",o+"px");fullscreenHandler()}}function _checkOrientation(n,t){s_bMobile&&ENABLE_CHECK_ORIENTATION&&(n>t?$(".orientation-msg-container").attr("data-orientation")==="landscape"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()):$(".orientation-msg-container").attr("data-orientation")==="portrait"?($(".orientation-msg-container").css("display","none"),s_oMain.startUpdate()):($(".orientation-msg-container").css("display","block"),s_oMain.stopUpdate()))}function createBitmap(n,t,i){var u=new createjs.Bitmap(n),r=new createjs.Shape;return t&&i?r.graphics.beginFill("#fff").drawRect(0,0,t,i):r.graphics.beginFill("#ff0").drawRect(0,0,n.width,n.height),u.hitArea=r,u}function createSprite(n,t,i,r,u,f){var e,o;return e=t!==null?new createjs.Sprite(n,t):new createjs.Sprite(n),o=new createjs.Shape,o.graphics.beginFill("#000000").drawRect(-i,-r,u,f),e.hitArea=o,e}function randomFloatBetween(n,t,i){return typeof i=="undefined"&&(i=2),parseFloat(Math.min(n+Math.random()*(t-n),t).toFixed(i))}function shuffle(n){for(var t=n.length,r,i;0!==t;)i=Math.floor(Math.random()*t),t-=1,r=n[t],n[t]=n[i],n[i]=r;return n}function formatTime(n){var i,t,r;return n/=1e3,i=Math.floor(n/60),t=n-i*60,t=parseFloat(t).toFixed(1),r="",r+=i<10?"0"+i+":":i+":",r+(t<10?"0"+t:t)}function roundDecimal(n,t){var i=Math.pow(10,t);return Math.round(i*n)/i}function tweenVectors(n,t,i,r){return r.set(n.getX()+i*(t.getX()-n.getX()),n.getY()+i*(t.getY()-n.getY())),r}function NoClickDelay(n){this.element=n;window.Touch&&this.element.addEventListener("touchstart",this,!1)}function playSound(n,t,i){return DISABLE_SOUND_MOBILE===!1||s_bMobile===!1?(s_aSounds[n].play(),s_aSounds[n].volume(t),s_aSounds[n].loop(i),s_aSounds[n]):null}function stopSound(n){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].stop()}function setVolume(n,t){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].volume(t)}function setMute(n,t){(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&s_aSounds[n].mute(t)}function ctlArcadeResume(){s_oMain!==null&&s_oMain.startUpdate()}function ctlArcadePause(){s_oMain!==null&&s_oMain.stopUpdate()}function getParamValue(n){for(var i,u=window.location.search.substring(1),r=u.split("&"),t=0;t<r.length;t++)if(i=r[t].split("="),i[0]==n)return i[1]}function fullscreenHandler(){ENABLE_FULLSCREEN&&screenfull.isEnabled!==!1&&(s_bFullscreen=screenfull.isFullscreen,s_oInterface!==null&&s_oInterface.resetFullscreenBut(),s_oMenu!==null&&s_oMenu.resetFullscreenBut())}function saveItem(n,t){s_bStorageAvailable&&localStorage.setItem(n,t)}function getItem(n){return s_bStorageAvailable?localStorage.getItem(n):null}function CSpriteLibrary(){var t={},n,i,u,f,e,r;this.init=function(t,o,s){n={};i=0;u=0;f=t;e=o;r=s};this.addSprite=function(r,u){if(!t.hasOwnProperty(r)){var f=new Image;t[r]=n[r]={szPath:u,oSprite:f,bLoaded:!1};i++}};this.getSprite=function(n){return t.hasOwnProperty(n)?t[n].oSprite:null};this._onSpritesLoaded=function(){i=0;e.call(r)};this._onSpriteLoaded=function(){f.call(r);++u===i&&this._onSpritesLoaded()};this.loadSprites=function(){for(var t in n)n[t].oSprite.oSpriteLibrary=this,n[t].oSprite.szKey=t,n[t].oSprite.onload=function(){this.oSpriteLibrary.setLoaded(this.szKey);this.oSpriteLibrary._onSpriteLoaded(this.szKey)},n[t].oSprite.onerror=function(t){var i=t.currentTarget;setTimeout(function(){n[i.szKey].oSprite.src=n[i.szKey].szPath},500)},n[t].oSprite.src=n[t].szPath};this.setLoaded=function(n){t[n].bLoaded=!0};this.isLoaded=function(n){return t[n].bLoaded};this.getNumSprites=function(){return i}}function CPreloader(){var s,o,r,t,u,f,i,e,n;this._init=function(){s_oSpriteLibrary.init(this._onImagesLoaded,this._onAllImagesLoaded,this);s_oSpriteLibrary.addSprite("progress_bar","./sprites/progress_bar.png");s_oSpriteLibrary.addSprite("200x200","./sprites/200x200.jpg");s_oSpriteLibrary.loadSprites();n=new createjs.Container;s_oStage.addChild(n)};this.unload=function(){n.removeAllChildren()};this._onImagesLoaded=function(){};this._onAllImagesLoaded=function(){this.attachSprites();s_oMain.preloaderReady()};this.attachSprites=function(){var c=new createjs.Shape,h;c.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(c);h=s_oSpriteLibrary.getSprite("200x200");i=createBitmap(h);i.regX=h.width*.5;i.regY=h.height*.5;i.x=CANVAS_WIDTH/2;i.y=CANVAS_HEIGHT/2-180;n.addChild(i);e=new createjs.Shape;e.graphics.beginFill("rgba(0,0,0,0.01)").drawRoundRect(i.x-100,i.y-100,200,200,10);n.addChild(e);i.mask=e;h=s_oSpriteLibrary.getSprite("progress_bar");t=createBitmap(h);t.x=CANVAS_WIDTH/2-h.width/2;t.y=CANVAS_HEIGHT/2+50;n.addChild(t);s=h.width;o=h.height;u=new createjs.Shape;u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,1,o);n.addChild(u);t.mask=u;r=new createjs.Text("","30px "+FONT_GAME_1,"#fff");r.x=CANVAS_WIDTH/2;r.y=CANVAS_HEIGHT/2+100;r.textBaseline="alphabetic";r.textAlign="center";n.addChild(r);f=new createjs.Shape;f.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);n.addChild(f);createjs.Tween.get(f).to({alpha:0},500).call(function(){createjs.Tween.removeTweens(f);n.removeChild(f)})};this.refreshLoader=function(n){r.text=n+"%";n===100&&(s_oMain._onRemovePreloader(),r.visible=!1,t.visible=!1);u.graphics.clear();var i=Math.floor(n*s/100);u.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(t.x,t.y,i,o)};this._init()}function CMain(n) {
  var i,
    r = 0,
    u = 0,
    f = STATE_LOADING,
    o,
    e,
    h,
    c,
    s,
    t;
  this.initContainer = function () {
    var n = document.getElementById("canvas");
    s_oStage = new createjs.Stage(n);
    s_bMobile = isMobile();
    s_bMobile === !1 ? s_oStage.enableMouseOver(20) : createjs.Touch.enable(s_oStage, !0);
    s_iPrevTime = new Date().getTime();
    createjs.Ticker.framerate = 30;
    createjs.Ticker.addEventListener("tick", this._update);
    navigator.userAgent.match(/Windows Phone/i) && (DISABLE_SOUND_MOBILE = !0);
    s_oSpriteLibrary = new CSpriteLibrary();
    e = new CPreloader();
    s_oGameSettings = new CGameSettings();
    i = !0;
  };
  this.preloaderReady = function () {
    this._loadImages();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && this._initSounds();
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
      filename: "card",
      loop: !1,
      volume: 1,
      ingamename: "card"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "chip",
      loop: !1,
      volume: 1,
      ingamename: "chip"
    });
    s_aSoundsInfo.push({
      path: "./sounds/",
      filename: "fiche_collect",
      loop: !1,
      volume: 1,
      ingamename: "fiche_collect"
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
            });
            break;
          }
        }
      });
    }, t ? 200 : 0);
  };
  this._loadImages = function () {
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    s_oSpriteLibrary.addSprite("but_menu_bg", "./sprites/but_menu_bg.png");
    s_oSpriteLibrary.addSprite("but_game_bg", "./sprites/but_game_bg.png");
    s_oSpriteLibrary.addSprite("but_game_small_bg", "./sprites/but_game_small_bg.png");
    s_oSpriteLibrary.addSprite("but_game_very_small_bg", "./sprites/but_game_very_small_bg.png");
    s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
    s_oSpriteLibrary.addSprite("bg_menu", "./sprites/bg_menu.jpg");
    s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
    s_oSpriteLibrary.addSprite("bg_game_1", "./sprites/bg_game_1.jpg");
    s_oSpriteLibrary.addSprite("bg_game_2", "./sprites/bg_game_2.jpg");
    s_oSpriteLibrary.addSprite("bg_game_3", "./sprites/bg_game_3.jpg");
    s_oSpriteLibrary.addSprite("bg_game_4", "./sprites/bg_game_4.jpg");
    s_oSpriteLibrary.addSprite("seat", "./sprites/seat.png");
    s_oSpriteLibrary.addSprite("card_spritesheet", "./sprites/card_spritesheet.png");
    s_oSpriteLibrary.addSprite("arrow_hand", "./sprites/arrow_hand.png");
    s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
    s_oSpriteLibrary.addSprite("display_bg", "./sprites/display_bg.png");
    s_oSpriteLibrary.addSprite("bet_bg", "./sprites/bet_bg.png");
    s_oSpriteLibrary.addSprite("money_bg", "./sprites/money_bg.png");
    s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");
    s_oSpriteLibrary.addSprite("logo_ctl", "./sprites/logo_ctl.png");
    s_oSpriteLibrary.addSprite("but_credits", "./sprites/but_credits.png");
    s_oSpriteLibrary.addSprite("but_lang", "./sprites/but_lang.png");
    s_oSpriteLibrary.addSprite("msg_box_small", "./sprites/msg_box_small.png");
    s_oSpriteLibrary.addSprite("logo_en", "./sprites/logo_en.png");
    s_oSpriteLibrary.addSprite("logo_hi", "./sprites/logo_hi.png");
    s_oSpriteLibrary.addSprite("logo_ja", "./sprites/logo_ja.png");
    s_oSpriteLibrary.addSprite("logo_ru", "./sprites/logo_ru.png");
    s_oSpriteLibrary.addSprite("logo_zh", "./sprites/logo_zh.png");
    s_oSpriteLibrary.addSprite("logo_ar", "./sprites/logo_ar.png");
    for (var n = 0; n < NUM_FICHES; n++) s_oSpriteLibrary.addSprite("fiche_" + n, "./sprites/fiche_" + n + ".png");
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
    try {} catch (n) {
      console.log(n);
    }
    try {
      TOTAL_MONEY = this.getUserMoney();
    } catch (t) {
      s_bStorageAvailable = !1;
    }
    e.unload();
    this.gotoMenu();
  };
  this.saveUserMoney = function (n) {
    s_bStorageAvailable && saveItem("blackjack_user_money", n);
  };
  this.getUserMoney = function () {
    if (!s_bStorageAvailable) return TOTAL_MONEY;
    var n = getItem("blackjack_user_money");
    return n === null ? TOTAL_MONEY : parseFloat(parseFloat(n).toFixed(2));
  };
  this.gotoMenu = function () {
    h = new CMenu();
    f = STATE_MENU;
  };
  this.gotoGame = function () {
    s = new CGame(o);
    f = STATE_GAME;
  };
  this.gotoHelp = function () {
    c = new CHelp();
    f = STATE_HELP;
  };
  this.stopUpdate = function () {
    i = !1;
    createjs.Ticker.paused = !0;
    $("#block_game").css("display", "block");
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && Howler.mute(!0);
  };
  this.startUpdate = function () {
    s_iPrevTime = new Date().getTime();
    i = !0;
    createjs.Ticker.paused = !1;
    $("#block_game").css("display", "none");
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_bAudioActive && Howler.mute(!1);
  };
  this._update = function (n) {
    if (i) {
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
  o = n;
  ENABLE_CHECK_ORIENTATION = n.check_orientation;
  ENABLE_FULLSCREEN = n.fullscreen;
  SHOW_CREDITS = n.show_credits;
  s_bAudioActive = n.audio_enable_on_startup;
  t = (navigator.language || "en").split("-")[0].toLowerCase();
  console.log("iLang " + t);
  LANG_CODES[t] === undefined && (t = "en");
  s_iCurLang = LANG_CODES[t];
  this.initContainer();
  refreshLanguage();
}function CTextButton(n,t,i,r,u,f,e,o){var l,c,y,p,h,a,w,b,k,s,v,d,g=o;this._init=function(n,t,i,r,u,f,e){l=!1;c=1;h=[];a=[];d=createBitmap(i);y=i.width;p=i.height;s=new createjs.Container;s.x=n;s.y=t;s.regX=i.width/2;s.regY=i.height/2;s_bMobile||(s.cursor="pointer");s.addChild(d,v);g.addChild(s);v=new CTLText(s,5,6,i.width-10,i.height-10,e,"center",f,u,1,0,0,r,!0,!0,!0,!1);this._initListener()};this.unload=function(){s.off("mousedown",w);s.off("pressup",b);g.removeChild(s)};this.setVisible=function(n){s.visible=n};this.setAlign=function(n){v.textAlign=n};this.setTextX=function(n){v.x=n};this.setScale=function(n){s.scaleX=s.scaleY=n;c=n};this.enable=function(){l=!1;s.filters=[];s.cache(0,0,y,p)};this.disable=function(){l=!0;var n=(new createjs.ColorMatrix).adjustSaturation(-100);s.filters=[new createjs.ColorMatrixFilter(n)];s.cache(0,0,y,p)};this._initListener=function(){w=s.on("mousedown",this.buttonDown);b=s.on("pressup",this.buttonRelease)};this.addEventListener=function(n,t,i){h[n]=t;a[n]=i};this.addEventListenerWithParams=function(n,t,i,r){h[n]=t;a[n]=i;k=r};this.buttonRelease=function(){l||(playSound("press_but",1,!1),s.scaleX=c,s.scaleY=c,h[ON_MOUSE_UP]&&h[ON_MOUSE_UP].call(a[ON_MOUSE_UP],k))};this.buttonDown=function(){l||(s.scaleX=c*.9,s.scaleY=c*.9,h[ON_MOUSE_DOWN]&&h[ON_MOUSE_DOWN].call(a[ON_MOUSE_DOWN]))};this.setPosition=function(n,t){s.x=n;s.y=t};this.tweenPosition=function(n,t,i,r,u,f,e){createjs.Tween.get(s).wait(r).to({x:n,y:t},i,u).call(function(){f!==undefined&&f.call(e)})};this.changeText=function(n){v.refreshText(n)};this.setX=function(n){s.x=n};this.setY=function(n){s.y=n};this.getButtonImage=function(){return s};this.getX=function(){return s.x};this.getY=function(){return s.y};this.getSprite=function(){return s};this.getScale=function(){return s.scaleX};this._init(n,t,i,r,u,f,e)}function CGfxButton(n,t,i,r){var o,f,l,a,e,s,h=[],u,c;this._init=function(n,t,i){o=!1;f=1;e=[];s=[];u=createBitmap(i);u.x=n;u.y=t;u.cursor="pointer";u.regX=i.width/2;u.regY=i.height/2;c.addChild(u);this._initListener()};this.unload=function(){createjs.Tween.removeTweens(u);u.off("mousedown",l);u.off("pressup",a);c.removeChild(u)};this.disable=function(){o=!0};this.enable=function(){o=!1};this.setVisible=function(n){u.visible=n};this.setScale=function(n){f=n;u.scaleX=u.scaleY=f};this._initListener=function(){l=u.on("mousedown",this.buttonDown);a=u.on("pressup",this.buttonRelease)};this.addEventListener=function(n,t,i){e[n]=t;s[n]=i};this.addEventListenerWithParams=function(n,t,i,r){e[n]=t;s[n]=i;h=r};this.buttonRelease=function(){o||(u.scaleX=f,u.scaleY=f,e[ON_MOUSE_UP]&&e[ON_MOUSE_UP].call(s[ON_MOUSE_UP],h))};this.buttonDown=function(){o||(u.scaleX=f*.9,u.scaleY=f*.9,playSound("press_but",1,!1),e[ON_MOUSE_DOWN]&&e[ON_MOUSE_DOWN].call(s[ON_MOUSE_DOWN],h))};this.setScale=function(n){f=n;u.scaleX=n;u.scaleY=n};this.setPosition=function(n,t){u.x=n;u.y=t};this.pulseAnimation=function(){createjs.Tween.get(u,{loop:-1}).to({scaleX:f*1.1,scaleY:f*1.1},850,createjs.Ease.quadOut).to({scaleX:f,scaleY:f},650,createjs.Ease.quadIn)};this.setX=function(n){u.x=n};this.setY=function(n){u.y=n};this.getButtonImage=function(){return u};this.getX=function(){return u.x};this.getY=function(){return u.y};c=r;this._init(n,t,i)}function CToggle(n,t,i,r,u){var e,o,s,f,h;this._init=function(n,t,i,r){o=[];s=[];var u={images:[i],frames:{width:i.width/2,height:i.height,regX:i.width/4,regY:i.height/2},animations:{state_true:[0],state_false:[1]}},c=new createjs.SpriteSheet(u);e=r;f=createSprite(c,"state_"+e,i.width/4,i.height/2,i.width/2,i.height);f.x=n;f.y=t;f.stop();h.addChild(f);this._initListener()};this.unload=function(){f.off("mousedown",this.buttonDown);f.off("pressup",this.buttonRelease);s_bMobile||f.off("mouseover",this.buttonOver);h.removeChild(f)};this._initListener=function(){f.on("mousedown",this.buttonDown);f.on("pressup",this.buttonRelease);if(!s_bMobile)f.on("mouseover",this.buttonOver)};this.addEventListener=function(n,t,i){o[n]=t;s[n]=i};this.setActive=function(n){e=n;f.gotoAndStop("state_"+e)};this.buttonRelease=function(){f.scaleX=1;f.scaleY=1;playSound("press_but",1,0);e=!e;f.gotoAndStop("state_"+e);o[ON_MOUSE_UP]&&o[ON_MOUSE_UP].call(s[ON_MOUSE_UP],e)};this.buttonDown=function(){f.scaleX=.9;f.scaleY=.9;o[ON_MOUSE_DOWN]&&o[ON_MOUSE_DOWN].call(s[ON_MOUSE_DOWN])};this.buttonOver=function(n){s_bMobile||(n.target.cursor="pointer")};this.setPosition=function(n,t){f.x=n;f.y=t};h=u;this._init(n,t,i,r)}function CMenu() {
  var n,
    r,
    u,
    f,
    t,
    v,
    e,
    o,
    s,
    h,
    l,
    p = null,
    i = null,
    y = null,
    c,
    a;
  this._init = function () {
    var d, p;
    try {} catch (g) {}
    v = createBitmap(s_oSpriteLibrary.getSprite("bg_menu"));
    s_oStage.addChild(v);
    p = this.getLogoSprite();
    t = createBitmap(p);
    t.x = CANVAS_WIDTH / 2;
    t.y = 100;
    t.regX = p.width / 2;
    s_oStage.addChild(t);
    p = s_oSpriteLibrary.getSprite("but_menu_bg");
    e = new CTextButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 164, p, TEXT_PLAY, FONT_GAME_1, "#ffffff", 40, s_oStage);
    e.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
    d = s_oSpriteLibrary.getSprite("but_lang");
    DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1 ? (p = s_oSpriteLibrary.getSprite("audio_icon"), n = {
      x: CANVAS_WIDTH - p.width / 4 - 10,
      y: p.height / 2 + 10
    }, o = new CToggle(n.x, n.y, p, s_bAudioActive, s_oStage), o.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this), f = {
      x: n.x - LANG_WIDTH - 10,
      y: n.y
    }) : f = {
      x: CANVAS_WIDTH - p.width / 4 - 10,
      y: p.height / 2 + 10
    };
    c = new CButLang(f.x, f.y, NUM_LANGUAGES, s_iCurLang, d, s_oStage);
    c.addEventListener(ON_SELECT_LANG, this._onSelectLang, this);
    var k = s_oSpriteLibrary.getSprite("but_credits"),
      w = window.document,
      b = w.documentElement;
    i = b.requestFullscreen || b.mozRequestFullScreen || b.webkitRequestFullScreen || b.msRequestFullscreen;
    y = w.exitFullscreen || w.mozCancelFullScreen || w.webkitExitFullscreen || w.msExitFullscreen;
    ENABLE_FULLSCREEN === !1 && (i = !1);
    i && screenfull.isEnabled ? (p = s_oSpriteLibrary.getSprite("but_fullscreen"), r = {
      x: p.width / 4 + 10,
      y: p.height / 2 + 10
    }, h = new CToggle(r.x, r.y, p, s_bFullscreen, s_oStage), h.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this), u = {
      x: r.x + 10 + p.width / 2,
      y: p.height / 2 + 10
    }) : u = {
      x: 10 + k.width / 2,
      y: k.height / 2 + 10
    };
    SHOW_CREDITS && (l = new CGfxButton(u.x, u.y, k, s_oStage), l.addEventListener(ON_MOUSE_UP, this._onCredits, this));
    a = new CLangPanel(s_oStage);
    a.addEventListener(ON_SELECT_LANG, this._onChangeLang, this);
    s_bStorageAvailable || new CAlertPanel(TEXT_ERR_LS);
    s = new createjs.Shape();
    s.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(s);
    createjs.Tween.get(s).to({
      alpha: 0
    }, 400).call(function () {
      s.visible = !1;
    });
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function (t, e) {
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && o.setPosition(n.x - t, e + n.y);
    i && screenfull.isEnabled && h.setPosition(r.x + t, r.y + e);
    SHOW_CREDITS && l.setPosition(u.x + t, u.y + e);
    c.setPosition(f.x - s_iOffsetX, f.y + s_iOffsetY);
  };
  this.unload = function () {
    e.unload();
    e = null;
    c.unload();
    SHOW_CREDITS && l.unload();
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (o.unload(), o = null);
    i && screenfull.isEnabled && h.unload();
    a.unload();
    s_oStage.removeAllChildren();
    s_oMenu = null;
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
  this.resetFullscreenBut = function () {
    i && screenfull.isEnabled && h.setActive(s_bFullscreen);
  };
  this._onFullscreenRelease = function () {
    s_bFullscreen ? y.call(window.document) : i.call(window.document.documentElement);
    sizeHandler();
  };
  this._onCredits = function () {
    p = new CCreditsPanel();
  };
  this._onSelectLang = function () {
    a.show();
  };
  this._onChangeLang = function (n) {
    s_iCurLang = n;
    c.setLang(n);
    refreshLanguage();
    var i = this.getLogoSprite();
    t.image = i;
    t.regX = i.width / 2;
    e.changeText(TEXT_PLAY);
  };
  this.getLogoSprite = function () {
    var n = s_oSpriteLibrary.getSprite("logo_en");
    switch (s_iCurLang) {
      case LANG_AR:
        n = s_oSpriteLibrary.getSprite("logo_ar");
        break;
      case LANG_HI:
        n = s_oSpriteLibrary.getSprite("logo_hi");
        break;
      case LANG_JA:
        n = s_oSpriteLibrary.getSprite("logo_ja");
        break;
      case LANG_RU:
        n = s_oSpriteLibrary.getSprite("logo_ru");
        break;
      case LANG_ZH:
        n = s_oSpriteLibrary.getSprite("logo_zh");
    }
    return n;
  };
  s_oMenu = this;
  this._init();
}function CGame() {
  var ut = !1,
    ft,
    lt,
    et,
    y = !1,
    nt,
    l,
    c,
    at,
    w,
    tt,
    it,
    i,
    p,
    ot,
    bt,
    r,
    v,
    o,
    st,
    f,
    d,
    e,
    g,
    u,
    vt,
    b,
    ht,
    s,
    k,
    h,
    a,
    yt,
    ct,
    wt,
    t,
    n,
    pt,
    rt;
  this._init = function () {
    at = MAX_BET;
    w = MIN_BET;
    tt = -1;
    c = 0;
    st = 0;
    s_oTweenController = new CTweenController();
    var i = Math.floor(Math.random() * 4) + 1;
    wt = createBitmap(s_oSpriteLibrary.getSprite("bg_game_" + i));
    s_oStage.addChild(wt);
    n = new CSeat();
    n.setCredit(TOTAL_MONEY);
    n.addEventListener(SIT_DOWN, this._onSitDown, this);
    n.addEventListener(RESTORE_ACTION, this._onSetPlayerActions);
    n.addEventListener(PASS_TURN, this._passTurnToDealer);
    n.addEventListener(END_HAND, this._onEndHand);
    n.addEventListener(PLAYER_LOSE, this._playerLose);
    ct = new createjs.Container();
    s_oStage.addChild(ct);
    t = new CInterface(TOTAL_MONEY);
    t.displayMsg(TEXT_DISPLAY_MSG_SIT_DOWN);
    this.reset(!0);
    s = new CVector2();
    s.set(1214, 228);
    k = new CVector2();
    k.set(788, 180);
    h = new CVector2();
    h.set(418, 820);
    a = new CVector2();
    a.set(CANVAS_WIDTH / 2, -100);
    yt = new CVector2(408, 208);
    vt = [n.getCardOffset(), k];
    t.disableBetFiches();
    pt = new CGameOver();
    rt = new CMsgBox();
    n.getCredit() < w ? (this._gameOver(), this.changeState(-1)) : ut = !0;
  };
  this.unload = function () {
    var i, u, r;
    for (ut = !1, i = 0; i < f.length; i++) f[i].unload();
    for (u = n.getPlayerCards(), r = 0; r < u.length; r++) u[r].unload();
    t.unload();
    pt.unload();
    rt.unload();
    s_oStage.removeAllChildren();
  };
  this.reset = function (o) {
    ft = !0;
    lt = !1;
    et = !1;
    nt = !1;
    l = 0;
    c = 0;
    it = 0;
    i = 0;
    p = 0;
    ot = 0;
    bt = 0;
    n.reset();
    f = [];
    f.splice(0);
    e = [];
    e.splice(0);
    t.reset();
    t.enableBetFiches();
    o ? this.shuffleCard() : (r > u.length / 2 || v > d.length / 2) && this.shuffleCard();
  };
  this.setMoney = function (i) {
    n.setVisibleSitDownButton(!1);
    n.setCredit(i);
    t.refreshCredit(i);
    s_oInterface.enableBetFiches();
    s_oInterface.enable(!0, !1, !1, !1, !1);
    ut = !0;
  };
  this.shuffleCard = function () {
    var n;
    for (g = [], g = s_oGameSettings.getShuffledCardDeck(), u = [], d = [], n = 0; n < g.length; n++) n % 2 == 0 ? u.push(g[n]) : d.push(g[n]);
    for (r = 0, v = 0, b = [], n = 0; n < g.length; n++) b[n] = 0;
  };
  this.changeState = function (i) {
    var f, u, r;
    tt = i;
    switch (tt) {
      case STATE_GAME_DEALING:
        if (f = o < n.getCurBet() * 2 ? WIN_OCCURRENCE : Math.random() * 100, f < WIN_OCCURRENCE) {
          y = !0;
          do u = s_oGameSettings.getRandDealerPattern(); while (this._checkIfDealerPatternCanBeUsed(u) === !1);
          for (ht = [], r = 0; r < u.length; r++) ht[r] = u[r];
        } else y = !1;
        t.disableButtons();
        t.displayMsg(TEXT_DISPLAY_MSG_DEALING);
        this._dealing();
    }
  };
  this._checkIfDealerPatternCanBeUsed = function (n) {
    for (var t = 0; t < n.length; t++) if (b[n[t]] > 1) return !1;
    return !0;
  };
  this.attachCardToDeal = function (t, e, o, h) {
    var a = new CCard(s.getX(), s.getY(), ct),
      l,
      c;
    if (o) {
      if (y) l = ht.shift(), v++;else do l = d[v], v++, v > d.length / 2 && (this.shuffleCard(), v = 0), c = s_oGameSettings.getCardValue(l), c === 11 && i + c > 21 && (c = 1); while (i + c > 21 || i + c > 16 && i + c < n.getHandValue(0) && n.getHandValue(0) < 21);
      a.setInfo(t, e, l, s_oGameSettings.getCardValue(l), o, h);
      b[l] += 1;
    } else {
      if (y) {
        do l = u[r], r++, r > u.length / 2 && (this.shuffleCard(), r = 0), c = s_oGameSettings.getCardValue(l), c === 11 && n.getHandValue(0) + c > 21 && (c = 1); while (n.getHandValue(0) + c > 21);
      } else do l = u[r], r++, r > u.length / 2 && (this.shuffleCard(), r = 0), c = s_oGameSettings.getCardValue(l), c === 11 && n.getHandValue(0) + c > 21 && (c = 1); while (n.getHandValue(0) + c > 16 && n.getHandValue(0) + c < 22);
      a.setInfo(t, e, l, s_oGameSettings.getCardValue(l), o, h);
      b[l] += 1;
    }
    a.addEventListener(ON_CARD_ANIMATION_ENDING, this.cardFromDealerArrived);
    f.push(a);
    playSound("card", 1, !1);
  };
  this.cardFromDealerArrived = function (r, u, o) {
    for (var s = 0; s < f.length; s++) if (f[s] === r) {
      f.splice(s, 1);
      break;
    }
    u === !1 ? (n.addCardToHand(r), n.increaseHandValue(r.getValue()), o > 2 && n.refreshCardValue()) : (i += r.getValue(), p > 2 && t.refreshDealerCardValue(i), r.getValue() === 11 && ot++, e.push(r));
    o < 3 ? s_oGame._dealing() : (s_oGame._checkHand(), u === !1 && et && (et = !1, s_oGame._onStandPlayer()));
  };
  this._onStandPlayer = function () {
    n.stand();
  };
  this._checkHand = function () {
    var r;
    if (ft) n.checkHand();else if (t.refreshDealerCardValue(i), nt) i === 21 ? this.playerStandOff(0) : this._playerWin(0);else if (i === 21 && e.length === 2) {
      if (l > 0 && e.length === 2) for (n.increaseCredit(l * 2 + l), o -= l * 2, t.refreshCredit(n.getCredit()), r = 0; r < n.getNumHands(); r++) this._playerLose(r);else for (r = 0; r < n.getNumHands(); r++) this._playerLose(r);
    } else i > 21 ? ot > 0 ? (ot--, i -= 10, t.refreshDealerCardValue(i), i < 17 ? this.hitDealer() : this._checkWinner()) : this._checkWinner() : i < 17 ? this.hitDealer() : this._checkWinner();
  };
  this._playerWin = function (r) {
    var f = 1,
      u;
    n.getHandValue(r) === 21 && n.getNumCardsForHand(r) === 2 && (f = BLACKJACK_PAYOUT);
    u = n.getBetForHand(r) + parseFloat((n.getBetForHand(r) * f).toFixed(2));
    n.increaseCredit(u);
    o -= u;
    n.showWinner(r, TEXT_SHOW_WIN_PLAYER, u);
    t.displayMsg(TEXT_DISPLAY_MSG_PLAYER_WIN);
    n.initMovement(r, h.getX(), h.getY());
    i === 21 ? n.initInsuranceMov(h.getX(), h.getY()) : n.initInsuranceMov(a.getX(), a.getY());
  };
  this._playerLose = function (r) {
    n.showWinner(r, TEXT_SHOW_LOSE_PLAYER, 0);
    t.displayMsg(TEXT_DISPLAY_MSG_PLAYER_LOSE);
    n.initMovement(r, a.getX(), a.getY());
    i === 21 ? n.initInsuranceMov(h.getX(), h.getY()) : n.initInsuranceMov(a.getX(), a.getY());
  };
  this.playerStandOff = function (r) {
    n.increaseCredit(n.getBetForHand(r));
    o -= n.getBetForHand(r);
    n.showWinner(r, TEXT_SHOW_STANDOFF, 0);
    t.displayMsg(TEXT_DISPLAY_MSG_PLAYER_STANDOFF);
    n.initMovement(r, h.getX(), h.getY());
    i === 21 ? n.initInsuranceMov(h.getX(), h.getY()) : n.initInsuranceMov(a.getX(), a.getY());
  };
  this._dealing = function () {
    var t, e, o, i, h;
    if (it < vt.length * 2) {
      if (t = new CCard(s.getX(), s.getY(), ct), e = new CVector2(s.getX(), s.getY()), it % vt.length == 1) p++, o = new CVector2(k.getX() + (CARD_WIDTH + 2) * (it > 1 ? 1 : 0), k.getY()), i = y ? ht.shift() : d[v], t.setInfo(e, o, i, s_oGameSettings.getCardValue(i), !0, p), b[i] += 1, v++, p === 2 && t.addEventListener(ON_CARD_SHOWN, this._onCardShown);else {
        if (!y && r === 1 && s_oGameSettings.getCardValue(u[r]) + s_oGameSettings.getCardValue(u[r - 1]) > 18) {
          h = s_oGameSettings.getCardValue(u[r - 1]);
          do u.shift(); while (h + s_oGameSettings.getCardValue(u[r]) === 21);
        }
        t.setInfo(e, n.getAttachCardOffset(), u[r], s_oGameSettings.getCardValue(u[r]), !1, n.newCardDealed());
        b[u[r]] += 1;
        r++;
      }
      f.push(t);
      it++;
      t.addEventListener(ON_CARD_ANIMATION_ENDING, this.cardFromDealerArrived);
      t.addEventListener(ON_CARD_TO_REMOVE, this._onRemoveCard);
      playSound("card", 1, !1);
    } else this._checkAvailableActionForPlayer();
  };
  this.hitDealer = function () {
    var n = new CVector2(s.getX(), s.getY()),
      t = new CVector2(k.getX() + (CARD_WIDTH + 3) * p, k.getY());
    p++;
    this.attachCardToDeal(n, t, !0, p);
    this.changeState(STATE_GAME_HITTING);
    playSound("card", 1, !1);
  };
  this._checkWinner = function () {
    for (var t = 0; t < n.getNumHands(); t++) n.getHandValue(t) > 21 ? this._playerLose(t) : i > 21 ? this._playerWin(t) : n.getHandValue(t) < 22 && n.getHandValue(t) > i ? this._playerWin(t) : n.getHandValue(t) === i ? this.playerStandOff(t) : this._playerLose(t);
  };
  this._onEndHand = function () {
    for (var u, i, f = new CVector2(yt.getX(), yt.getY()), r = 0; r < e.length; r++) e[r].initRemoving(f), e[r].hideCard();
    for (u = n.getPlayerCards(), i = 0; i < u.length; i++) u[i].initRemoving(f), u[i].hideCard();
    n.clearText();
    t.clearDealerText();
    c = 0;
    s_oGame.changeState(STATE_GAME_SHOW_WINNER);
    playSound("fiche_collect", 1, !1);
    st++;
    st === AD_SHOW_COUNTER && (st = 0);
  };
  this.ficheSelected = function (i, r) {
    var u = n.getCurBet();
    i > n.getCredit() ? rt.show(TEXT_NO_MONEY) : u + i > at ? rt.show(TEXT_ERROR_MAX_BET) : (u += i, u = Number(u.toFixed(1)), n.decreaseCredit(i), o += i, n.changeBet(u), n.refreshFiches(i, r, 0, 0), n.bet(u, !1), t.enable(!0, !1, !1, !1, !1), t.refreshCredit(n.getCredit()));
  };
  this._checkAvailableActionForPlayer = function () {
    var i, r, u;
    if (this.changeState(-1), i = n.getHandValue(0), i === 21) {
      nt = !0;
      n.refreshCardValue();
      e[0].getValue() === 11 && n.getCredit() >= n.getCurBet() / 2 ? (l = n.getCurBet() / 2, t.showInsurancePanel()) : this._passTurnToDealer();
      return;
    }
    i > 21 && n.removeAce();
    n.refreshCardValue();
    r = !1;
    n.isSplitAvailable() && n.getCredit() >= n.getCurBet() * 1.5 && (r = !0);
    t.displayMsg(TEXT_DISPLAY_MSG_YOUR_ACTION);
    u = !1;
    n.getNumCardsForHand(0) === 2 && n.getHandValue(0) > 8 && n.getHandValue(0) < 16 && n.getCredit() >= n.getCurBet() && !lt && (u = !0);
    t.enable(!1, !0, !0, u, r);
    e[0].getValue() === 11 && n.getCredit() >= n.getCurBet() / 2 && t.showInsurancePanel();
  };
  this._passTurnToDealer = function () {
    ft && (ft = !1, t.disableButtons(), e[1].showCard(), playSound("card", 1, !1), t.displayMsg(TEXT_DISPLAY_MSG_DEALER_TURN));
  };
  this._gameOver = function () {
    this.clearBets();
    pt.show();
  };
  this.onFicheSelected = function (n, t) {
    this.ficheSelected(t, n);
  };
  this._onSetPlayerActions = function (i, r, u, f, e) {
    t.enable(i, r, u, f, e);
    n.refreshCardValue();
  };
  this._onSitDown = function () {
    this.changeState(STATE_GAME_WAITING_FOR_BET);
    t.enableBetFiches();
  };
  this.onDeal = function () {
    if (n.getCredit() + n.getCurBet() < w) {
      this._gameOver();
      return;
    }
    if (w > n.getCurBet()) {
      rt.show(TEXT_ERROR_MIN_BET);
      s_oInterface.enableBetFiches();
      s_oInterface.enable(!0, !1, !1, !1, !1);
      return;
    }
    this.changeState(STATE_GAME_DEALING);
  };
  this.onHit = function () {
    var t = new CVector2(s.getX(), s.getY()),
      i = new CVector2(n.getAttachCardOffset().getX(), n.getAttachCardOffset().getY());
    this.attachCardToDeal(t, i, !1, n.newCardDealed());
    this.changeState(STATE_GAME_HITTING);
  };
  this.onStand = function () {
    n.stand();
  };
  this.onDouble = function () {
    var i = n.getCurBet(),
      r = i;
    r += i;
    n.doubleAction(r);
    n.changeBet(r);
    n.decreaseCredit(i);
    o += i;
    o < r * 2 && (y = !1);
    n.bet(r);
    t.refreshCredit(n.getCredit());
    this.onHit();
    et = !0;
  };
  this.onSplit = function () {
    o < n.getCurBet() * 4 && (y = !1);
    n.split();
    this.changeState(STATE_GAME_SPLIT);
  };
  this._onSplitCardEndAnim = function () {
    var r = n.getCurBet(),
      i = r;
    r += i;
    n.bet(r, !0);
    lt = !0;
    t.enable(!1, !0, !0, !1, !1);
    n.setSplitHand();
    n.refreshCardValue();
    n.changeBet(r - i);
    n.decreaseCredit(i);
    o += i;
    t.refreshCredit(n.getCredit());
  };
  this.clearBets = function () {
    var i = n.getStartingBet();
    i > 0 && (n.clearBet(), n.increaseCredit(i), o -= i, t.refreshCredit(n.getCredit()));
  };
  this.rebet = function () {
    this.clearBets();
    var i = n.rebet();
    i > 0 ? (t.enable(!0, !1, !1, !1, !1), o += i, t.refreshCredit(n.getCredit()), c = BET_TIME) : t.disableRebet();
  };
  this.onBuyInsurance = function () {
    l = n.getCurBet() / 2;
    var i = n.getCurBet();
    i += l;
    n.insurance(i, -l, l);
    t.refreshCredit(n.getCredit());
    nt && this._passTurnToDealer();
  };
  this.onNotBuyInsurance = function () {
    nt && this._passTurnToDealer();
  };
  this._onCardShown = function () {
    s_oGame._checkHand();
  };
  this._onRemoveCard = function (n) {
    n.unload();
  };
  this.onExit = function () {
    this.unload();
    s_oMain.gotoMenu();
  };
  this.getState = function () {
    return tt;
  };
  this._updateWaitingBet = function () {
    if (c += s_iTimeElaps, c > BET_TIME) {
      if (c = 0, n.getCurBet() < w) return;
      t.disableBetFiches();
      t.enable(!0, !1, !1, !1, !1);
      this.changeState(STATE_GAME_DEALING);
    } else {
      var i = Math.floor((BET_TIME - c) / 1e3);
      t.displayMsg(TEXT_MIN_BET + ":" + w + "\n" + TEXT_MAX_BET + ":" + at, TEXT_DISPLAY_MSG_WAITING_BET + " " + i);
    }
  };
  this._updateDealing = function () {
    for (var n = 0; n < f.length; n++) f[n].update();
  };
  this._updateHitting = function () {
    for (var n = 0; n < f.length; n++) f[n].update();
  };
  this._updateSplit = function () {
    n.updateSplit();
  };
  this._updateShowWinner = function () {
    var u, i, r;
    for (n.updateFichesController(s_iTimeElaps), u = n.getPlayerCards(), i = 0; i < u.length; i++) u[i].update();
    for (r = 0; r < e.length; r++) e[r].update();
    c += s_iTimeElaps;
    c > TIME_END_HAND && (c = 0, this.reset(!1), t.reset(), n.getCredit() < w ? (this._gameOver(), this.changeState(-1)) : this.changeState(STATE_GAME_WAITING_FOR_BET), t.refreshCredit(n.getCredit()));
  };
  this.update = function () {
    if (ut !== !1) switch (tt) {
      case STATE_GAME_WAITING_FOR_BET:
        this._updateWaitingBet();
        break;
      case STATE_GAME_DEALING:
        this._updateDealing();
        break;
      case STATE_GAME_HITTING:
        this._updateHitting();
        break;
      case STATE_GAME_SPLIT:
        this._updateSplit();
        break;
      case STATE_GAME_SHOW_WINNER:
        this._updateShowWinner();
    }
  };
  s_oGame = this;
  MIN_BET = 1;
  MAX_BET = 300;
  BET_TIME = 1e4;
  BLACKJACK_PAYOUT = 1.5;
  WIN_OCCURRENCE = 35;
  o = 500;
  AD_SHOW_COUNTER = 30;
  this._init();
}function CInterface(n){var e,i,o,f,r,w,s,h,c,l,a,v,y,b,t,k,d,g,p,u=null,nt=null;return this._init=function(n){var tt=s_oSpriteLibrary.getSprite("but_exit"),rt,ut,ft,et,ot,st,ht,it;for(o={x:CANVAS_WIDTH-tt.width/2-2,y:tt.height/2+2},r=new CGfxButton(o.x,o.y,tt,s_oStage),r.addEventListener(ON_MOUSE_UP,this._onExit,this),DISABLE_SOUND_MOBILE===!1||s_bMobile===!1?(i={x:r.getX()-tt.width,y:tt.height/2+2},y=new CToggle(i.x,i.y,s_oSpriteLibrary.getSprite("audio_icon"),s_bAudioActive,s_oStage),y.addEventListener(ON_MOUSE_UP,this._onAudioToggle,this),f={x:i.x-tt.width-2,y:i.y}):f={x:r.getX()-tt.width,y:tt.height/2+2},rt=window.document,ut=rt.documentElement,u=ut.requestFullscreen||ut.mozRequestFullScreen||ut.webkitRequestFullScreen||ut.msRequestFullscreen,nt=rt.exitFullscreen||rt.mozCancelFullScreen||rt.webkitExitFullscreen||rt.msExitFullscreen,ENABLE_FULLSCREEN===!1&&(u=!1),u&&screenfull.isEnabled&&(tt=s_oSpriteLibrary.getSprite("but_fullscreen"),p=new CToggle(f.x,f.y,tt,s_bFullscreen,s_oStage),p.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this)),ft=createBitmap(s_oSpriteLibrary.getSprite("display_bg")),ft.x=280,ft.y=6,s_oStage.addChild(ft),tt=s_oSpriteLibrary.getSprite("bet_bg"),et=createBitmap(tt),et.x=340,et.y=CANVAS_HEIGHT-tt.height+4,s_oStage.addChild(et),tt=s_oSpriteLibrary.getSprite("but_game_small_bg"),w=new CTextButton(444,CANVAS_HEIGHT-30,tt,TEXT_CLEAR,FONT_GAME_1,"#ffffff",14,s_oStage),w.addEventListener(ON_MOUSE_UP,this._onButClearRelease,this),s=new CTextButton(632,CANVAS_HEIGHT-30,tt,TEXT_REBET,FONT_GAME_1,"#ffffff",14,s_oStage),s.addEventListener(ON_MOUSE_UP,this._onButRebetRelease,this),k=new CTLText(s_oStage,400,18,190,40,24,"left","#ffde00",FONT_GAME_2,1,0,0," ",!0,!0,!0,!1),d=new CTLText(s_oStage,400,60,190,40,18,"left","#ffde00",FONT_GAME_2,1,0,0," ",!0,!0,!0,!1),t=new createjs.Text("","20px "+FONT_GAME_1,"#fff"),t.shadow=new createjs.Shadow("#000000",2,2,1),t.x=758,t.y=180,t.textAlign="right",s_oStage.addChild(t),ot=createBitmap(s_oSpriteLibrary.getSprite("money_bg")),ot.x=1127,ot.y=CANVAS_HEIGHT-100,s_oStage.addChild(ot),b=new CTLText(s_oStage,1130,CANVAS_HEIGHT-95,224,29,29,"center","#ffde00",FONT_GAME_2,1,0,0,TEXT_CURRENCY+n.toFixed(2),!0,!0,!0,!1),tt=s_oSpriteLibrary.getSprite("but_game_bg"),h=new CTextButton(908,CANVAS_HEIGHT-30,tt,TEXT_DEAL,FONT_GAME_1,"#ffffff",20,s_oStage),h.addEventListener(ON_MOUSE_UP,this._onButDealRelease,this),c=new CTextButton(1008,CANVAS_HEIGHT-30,tt,TEXT_HIT,FONT_GAME_1,"#ffffff",20,s_oStage),c.addEventListener(ON_MOUSE_UP,this._onButHitRelease,this),l=new CTextButton(1108,CANVAS_HEIGHT-30,tt,TEXT_STAND,FONT_GAME_1,"#ffffff",20,s_oStage),l.addEventListener(ON_MOUSE_UP,this._onButStandRelease,this),a=new CTextButton(1208,CANVAS_HEIGHT-30,tt,TEXT_DOUBLE,FONT_GAME_1,"#ffffff",20,s_oStage),a.addEventListener(ON_MOUSE_UP,this._onButDoubleRelease,this),v=new CTextButton(1308,CANVAS_HEIGHT-30,tt,TEXT_SPLIT,FONT_GAME_1,"#ffffff",20,s_oStage),v.addEventListener(ON_MOUSE_UP,this._onButSplitRelease,this),st=[{x:387,y:666},{x:447,y:666},{x:507,y:666},{x:567,y:666},{x:627,y:666},{x:687,y:666}],e=[],ht=s_oGameSettings.getFichesValues(),it=0;it<NUM_FICHES;it++)e[it]=new CFiche(st[it].x,st[it].y,it,ht[it],!0,s_oStage),e[it].addEventListenerWithParams(ON_MOUSE_UP,this._onFicheClicked,this,[ht[it],it]);g=new CInsurancePanel;this.disableButtons();this.refreshButtonPos(s_iOffsetX,s_iOffsetY)},this.unload=function(){r.unload();r=null;DISABLE_SOUND_MOBILE===!1&&(y.unload(),y=null);u&&screenfull.isEnabled&&p.unload();s_oInterface=null},this.refreshButtonPos=function(n,t){r.setPosition(o.x-n,t+o.y);(DISABLE_SOUND_MOBILE===!1||s_bMobile===!1)&&y.setPosition(i.x-n,t+i.y);u&&screenfull.isEnabled&&p.setPosition(f.x-n,f.y+t)},this.reset=function(){this.disableButtons()},this.enableBetFiches=function(){for(var n=0;n<NUM_FICHES;n++)e[n].enable();w.enable();s.enable()},this.disableBetFiches=function(){for(var n=0;n<NUM_FICHES;n++)e[n].disable();w.disable();s.disable()},this.disableRebet=function(){s.disable()},this.disableButtons=function(){h.disable();c.disable();l.disable();a.disable();v.disable()},this.enable=function(n,t,i,r,u){n?h.enable():h.disable();t?c.enable():c.disable();i?l.enable():l.disable();r?a.enable():a.disable();u?v.enable():v.disable()},this.refreshCredit=function(n){b.refreshText(TEXT_CURRENCY+n.toFixed(2))},this.refreshDealerCardValue=function(n){t.text=""+n},this.displayMsg=function(n,t){k.refreshText(n);t!==undefined&&d.refreshText(t)},this.showInsurancePanel=function(){g.show(TEXT_INSURANCE)},this.clearDealerText=function(){t.text=""},this._onFicheClicked=function(n){s_oGame.onFicheSelected(n[1],n[0])},this._onButClearRelease=function(){s_oGame.clearBets()},this._onButRebetRelease=function(){s_oGame.rebet()},this._onButDealRelease=function(){this.disableBetFiches();this.disableButtons();s_oGame.onDeal()},this._onButHitRelease=function(){this.disableButtons();s_oGame.onHit()},this._onButStandRelease=function(){this.disableButtons();s_oGame.onStand()},this._onButDoubleRelease=function(){this.disableButtons();s_oGame.onDouble()},this._onButSplitRelease=function(){this.disableButtons();s_oGame.onSplit()},this._onExit=function(){s_oGame.onExit()},this._onAudioToggle=function(){Howler.mute(s_bAudioActive);s_bAudioActive=!s_bAudioActive},this.resetFullscreenBut=function(){u&&screenfull.isEnabled&&p.setActive(s_bFullscreen)},this._onFullscreenRelease=function(){s_bFullscreen?nt.call(window.document):u.call(window.document.documentElement);sizeHandler()},s_oInterface=this,this._init(n),this}function CTweenController(){this.tweenValue=function(n,t,i){return n+i*(t-n)};this.easeLinear=function(n,t,i,r){return i*n/r+t};this.easeInCubic=function(n,t,i,r){var u=(n/=r)*n*n;return t+i*u};this.easeBackInQuart=function(n,t,i,r){var u=(n/=r)*n,f=u*n;return t+i*(2*u*u+2*f+-3*u)};this.easeInBack=function(n,t,i,r){return i*(n/=r)*n*((1.70158+1)*n-1.70158)+t};this.easeOutCubic=function(n,t,i,r){return i*((n=n/r-1)*n*n+1)+t}}function CSeat() {
  var tt, it, t, rt, e, n, r, o, d, i, p, w, l, b, g, nt, s, a, h, c, k, f, v, u, y;
  this._init = function () {
    var t, o;
    i = new createjs.Container();
    i.x = 734;
    i.y = 360;
    t = createBitmap(s_oSpriteLibrary.getSprite("seat"));
    t.x = 66;
    t.y = 175;
    i.addChild(t);
    o = s_oSpriteLibrary.getSprite("but_game_small_bg");
    g = new CTextButton(115, 221, o, TEXT_SIT_DOWN, FONT_GAME_1, "#ffffff", 20, i);
    g.addEventListener(ON_MOUSE_UP, this._onSitDown, this);
    l = new createjs.Text("", "20px " + FONT_GAME_1, "#ffde00");
    l.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    l.x = 84;
    l.y = 208;
    l.textAlign = "right";
    i.addChild(l);
    b = new createjs.Text("", "20px " + FONT_GAME_1, "#ffde00");
    b.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    b.x = 175;
    b.y = 208;
    b.textAlign = "left";
    i.addChild(b);
    p = new createjs.Text("", "20px " + FONT_GAME_1, "#ffffff");
    p.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    p.x = 56;
    p.y = 105;
    p.textAlign = "right";
    i.addChild(p);
    w = new createjs.Text("", "20px " + FONT_GAME_1, "#ffffff");
    w.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    w.x = 138;
    w.y = 105;
    w.textAlign = "left";
    i.addChild(w);
    h = new createjs.Text("", "20px " + FONT_GAME_1, "#ffffff");
    h.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    h.x = 0;
    h.y = 240;
    h.textAlign = "center";
    i.addChild(h);
    c = new createjs.Text("", "20px " + FONT_GAME_1, "#ffffff");
    c.shadow = new createjs.Shadow("#000000", 2, 2, 1);
    c.x = 150;
    c.y = 240;
    c.textAlign = "left";
    i.addChild(c);
    k = createBitmap(s_oSpriteLibrary.getSprite("arrow_hand"));
    k.visible = !1;
    i.addChild(k);
    s_oStage.addChild(i);
    nt = new CVector2();
    nt.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    f = new CFichesController({
      x: 834,
      y: 566
    }, nt);
    e = 0;
    n = [];
    r = [];
    this.reset();
    s = new CVector2();
    s.set(64, 163);
    d = new CVector2(s.getX(), s.getY());
    a = new CVector2();
    a.set(172, 163);
    u = [];
    y = [];
  };
  this.unload = function () {
    s_oStage.removeChild(i);
  };
  this.addEventListener = function (n, t, i) {
    u[n] = t;
    y[n] = i;
  };
  this.reset = function () {
    var i, e, u;
    for (t = 0, rt = 0, tt = !1, it = !1, i = 0; i < n.length; i++) n[i].getFichesController().reset();
    for (n = [], e = new CHandController(s, f), n.push(e), u = 0; u < r.length; u++) r[u].unload();
    r = [];
    o = [];
    f.addEventListener(FICHES_END_MOV, this._onFichesEndMove);
    v = null;
    this.clearText();
  };
  this.clearText = function () {
    l.text = "";
    b.text = "";
    p.text = "";
    w.text = "";
  };
  this.clearBet = function () {
    f.reset();
    o = [];
    l.text = "";
    n[t].changeBet(0);
  };
  this.addCardToHand = function (i) {
    n[t].addCard(i);
    r.push(i);
    i.addEventListener(ON_CARD_TO_REMOVE, this._onRemoveCard);
  };
  this.increaseHandValue = function (i) {
    n[t].increaseHandValue(i);
  };
  this.refreshCardValue = function () {
    p.text = "" + this.getHandValue(0);
    this.getHandValue(1) > 0 && (w.text = "" + this.getHandValue(1));
  };
  this.setCredit = function (n) {
    e = n;
    TOTAL_MONEY = e;
  };
  this.increaseCredit = function (n) {
    e += n;
    s_oMain.saveUserMoney(e);
    TOTAL_MONEY = e;
  };
  this.changeBet = function (i) {
    n[t].changeBet(i);
  };
  this.checkHand = function () {
    var i = n[t].getValue(),
      r,
      f;
    i === 21 ? this.checkPlayerLastHand(PASS_TURN) : i > 21 ? n[t].getAces() > 0 ? (n[t].removeAce(), n[t].getValue() === 21 ? this.checkPlayerLastHand(PASS_TURN) : tt ? this.checkPlayerLastHand(PASS_TURN) : u[RESTORE_ACTION] && u[RESTORE_ACTION].call(y[RESTORE_ACTION], !1, !0, !0, !1, !1), this.refreshCardValue()) : n.length > 1 || it ? this.checkPlayerLastHand(PASS_TURN) : this.checkPlayerLastHand(PLAYER_LOSE) : tt ? this.checkPlayerLastHand(PASS_TURN) : (r = !1, n[t].getNumCards() === 2 && i > 8 && i < 16 ? r = !0 : this.getAces() > 0 && (i > 21 ? (i -= 10, this.removeAce(), i > 8 && i < 16 && (r = !0)) : (f = i - 10, n[t].getNumCards() === 2 && f > 8 && f < 16 && (r = !0))), u[RESTORE_ACTION] && u[RESTORE_ACTION].call(y[RESTORE_ACTION], !1, !0, !0, r, !1));
  };
  this.checkPlayerLastHand = function (n) {
    t--;
    t > -1 ? (u[RESTORE_ACTION] && u[RESTORE_ACTION].call(y[RESTORE_ACTION], !1, !0, !0, !1, !1), k.x = s.getX()) : (u[n] && u[n].call(y[n], 0), this.removeArrow());
  };
  this.bet = function (n, t) {
    t ? (l.text = TEXT_CURRENCY + n / 2, b.text = TEXT_CURRENCY + n / 2) : l.text = TEXT_CURRENCY + n;
  };
  this.setSplitHand = function () {
    for (var u, r = [], i = 0; i < o.length; i++) r.push(o[i]);
    v = new CFichesController({
      x: 950,
      y: 566
    }, nt);
    v.refreshFiches(r, 0, 0, !1);
    v.addEventListener(v.FICHES_END_MOV, this._onFichesEndMove);
    u = new CHandController(a, v);
    n.push(u);
    n[1].addCard(n[0].getCard(1));
    n[0].removeCard(1);
    n[0].getValue() === 1 && (n[0].setHandValue(11), n[0].increaseAces());
    n[1].setHandValue(n[0].getValue());
    t = n.length - 1;
  };
  this.decreaseCredit = function (n) {
    e -= n;
  };
  this.stand = function () {
    this.checkPlayerLastHand(PASS_TURN);
  };
  this.refreshFiches = function (n, t, i, r) {
    o.push({
      value: n,
      index: t
    });
    f.refreshFiches(o, i, r);
  };
  this.initMovement = function (n, t, i) {
    var r = this.getFichesController(n);
    r.initMovement(t, i, !1);
  };
  this.initInsuranceMov = function (n, t) {
    f.initInsuranceMov(n, t);
  };
  this.showWinner = function (n, t, i) {
    i > 0 ? (n === 0 ? h.text = t + ": " + i : c.text = t + ": " + i, playSound("win", 1, !1)) : (n === 0 ? h.text = t : c.text = t, playSound("lose", 1, !1));
    var r = this;
    n === 0 ? createjs.Tween.get(h).to({
      alpha: 1
    }, TIME_SHOW_FINAL_CARDS).call(function () {
      r.endWinAnim();
    }) : createjs.Tween.get(c).to({
      alpha: 1
    }, TIME_SHOW_FINAL_CARDS).call(function () {
      r.endWinAnim();
    });
    TOTAL_MONEY = e;
    s_oMain.saveUserMoney(e);
  };
  this.endWinAnim = function () {
    h && c && (h.text = "", c.text = "", u[END_HAND] && u[END_HAND].call(y[END_HAND]));
  };
  this.newCardDealed = function () {
    return rt++, rt;
  };
  this.removeAce = function () {
    n[t].removeAce();
  };
  this.removeArrow = function () {
    k.visible = !1;
  };
  this.doubleAction = function (i) {
    var r, u;
    for (n[t].changeBet(i), r = [], u = 0; u < o.length; u++) r.push(o[u]);
    n.length > 1 ? t === 1 ? v.refreshFiches(r, 0, 40) : f.refreshFiches(r, 0, 40) : f.refreshFiches(r, 0, 40);
  };
  this.split = function () {
    r[0].initSplit(new CVector2(i.x + s.getX(), i.y + s.getY()));
    r[1].initSplit(new CVector2(i.x + a.getX(), i.y + a.getY()));
    r[1].addEventListener(SPLIT_CARD_END_ANIM, this._onSplitCardEndAnim);
  };
  this.insurance = function (n, t, i) {
    var u, r;
    for (this.changeBet(n), this.increaseCredit(t), u = f.createFichesPile(i, !0), o = [], r = 0; r < u.length; r++) o.push({
      value: u[r].value,
      index: u[r].index
    });
    it = !0;
  };
  this.rebet = function () {
    var n = f.getPrevBet(),
      i,
      t;
    if (n > e || n === 0) return 0;
    for (this.decreaseCredit(n), this.changeBet(n), i = f.createFichesPile(n, !1), o = [], t = 0; t < i.length; t++) o.push({
      value: i[t].value,
      index: i[t].index
    });
    return this.bet(n, !1), n;
  };
  this.setVisibleSitDownButton = function (n) {
    g.setVisible(n);
  };
  this._onSitDown = function () {
    g.setVisible(!1);
    u[SIT_DOWN] && u[SIT_DOWN].call(y[SIT_DOWN]);
  };
  this._onFichesEndMove = function () {
    u[ASSIGN_FICHES] && u[ASSIGN_FICHES].call(y[ASSIGN_FICHES]);
  };
  this._onRemoveCard = function (n) {
    for (var t = 0; t < r.length; t++) if (r[t] === n) {
      r.splice(t, 1);
      break;
    }
  };
  this._onSplitCardEndAnim = function () {
    s_oGame._onSplitCardEndAnim();
    k.x = a.getX();
    k.y = a.getY() + 70;
    k.visible = !0;
  };
  this.updateFichesController = function (n) {
    v && v.update(n);
    f.update(n);
  };
  this.updateSplit = function () {
    for (var n = 0; n < r.length; n++) r[n].update(s_iTimeElaps);
  };
  this.isSplitAvailable = function () {
    return !r[0] || !r[1] ? !1 : Math.abs(r[0].getFotogram() - r[1].getFotogram()) % 13 == 0 ? !0 : !1;
  };
  this.getAttachCardOffset = function () {
    if (t === 0) d.set(i.x + s.getX() + CARD_WIDTH / 2 * n[t].getNumCards(), i.y + s.getY() - CARD_HEIGHT / 2 * n[t].getNumCards());else {
      var r = i.x + a.getX() + CARD_WIDTH / 2 * n[t].getNumCards(),
        u = i.y + a.getY() - CARD_HEIGHT / 2 * n[t].getNumCards();
      d.set(r, u);
    }
    return d;
  };
  this.getCurBet = function () {
    return n[t].getCurBet();
  };
  this.getCredit = function () {
    return e;
  };
  this.getHandValue = function (t) {
    return t > n.length - 1 ? 0 : n[t].getValue();
  };
  this.getNumHands = function () {
    return n.length;
  };
  this.getNumCardsForHand = function (t) {
    return n[t].getNumCards();
  };
  this.getBetForHand = function (t) {
    return n[t].getCurBet();
  };
  this.getAces = function () {
    return n[t].getAces();
  };
  this.getFichesController = function (t) {
    return n[t].getFichesController();
  };
  this.getCardOffset = function () {
    return s;
  };
  this.getPlayerCards = function () {
    return r;
  };
  this.getStartingBet = function () {
    return f.getValue();
  };
  this._init();
}function CFichesController(n,t){var e,y,l,a,f,u,s,h,p,w,o,b,i,r,c,v;this._init=function(n,t){i=new createjs.Container;i.x=n.x;i.y=n.y;s_oStage.addChild(i);r=new createjs.Container;r.x=400;r.y=230;s_oStage.addChild(r);h=new CVector2;h.set(i.x,i.y);o=new CVector2;o.setV(t);f=0;u=s=0;e=!1;y=!1;l=!1;c=[];v=[]};this.addEventListener=function(n,t,i){c[n]=t;v[n]=i};this.reset=function(){e=!1;y=!1;a=!1;u=0;i.removeAllChildren();r.removeAllChildren();i.x=h.getX();i.y=h.getY();r.x=o.getX();r.y=o.getY()};this.refreshFiches=function(n,t,f,o){var l,h,c,s,a,v;for(n=n.sortOn("value","index"),l=t,h=f,o&&(e=!0),u=0,c=0,s=0;s<n.length;s++)a=i,o&&(a=r),v=new CFiche(l,h,n[s].index,n[s].value,!1,a),v.setScale(.7),h-=5,c++,c>9&&(c=0,l+=FICHE_WIDTH,h=f),u+=n[s].value,u=parseFloat(u.toFixed(2));playSound("chip",1,!1)};this.createFichesPile=function(n,t){var u=s_oGameSettings.getFichesValues(),f=[],i,e,s,o,r;do{for(i=u[u.length-1],e=u.length-1;i>n;)e--,i=u[e];for(s=Math.floor(n/i),o=0;o<s;o++)f.push({value:i,index:s_oGameSettings.getIndexForFiches(i)});r=n%i;r=parseFloat(r.toFixed(2));n=r}while(r>0);return this.refreshFiches(f,0,0,t),f};this.rebet=function(){this.createFichesPile(s,!1)};this.initMovement=function(n,t,r){e||(s=u);l=r;p=new CVector2(i.x,i.y);w=new CVector2(n,t)};this.initInsuranceMov=function(n,t){b=new CVector2(n,t)};this.getValue=function(){return u};this.getPrevBet=function(){return s};this._updateInsuranceFiches=function(){if(e){var t=easeInOutCubic(f,0,1,TIME_FICHES_MOV),n=tweenVectors(o,b,t,new CVector2);r.x=n.getX();r.y=n.getY()}};this.update=function(n){if(!a)if(f+=n,f>TIME_FICHES_MOV)f=0,a=!0,c[FICHES_END_MOV]&&c[FICHES_END_MOV].call(v[FICHES_END_MOV],l,u);else{var r=easeInOutCubic(f,0,1,TIME_FICHES_MOV),t=new CVector2,t=tweenVectors(p,w,r,t);i.x=t.getX();i.y=t.getY();this._updateInsuranceFiches()}};this._init(n,t)}function CVector2(n,t){var i,r;this._init=function(n,t){i=n;r=t};this.add=function(n,t){i+=n;r+=t};this.addV=function(n){i+=n.getX();r+=n.getY()};this.scalarDivision=function(n){i/=n;r/=n};this.subV=function(n){i-=n.getX();r-=n.getY()};this.scalarProduct=function(n){i*=n;r*=n};this.invert=function(){i*=-1;r*=-1};this.dotProduct=function(n){return i*n.getX()+r*n.getY()};this.set=function(n,t){i=n;r=t};this.setV=function(n){i=n.getX();r=n.getY()};this.length=function(){return Math.sqrt(i*i+r*r)};this.length2=function(){return i*i+r*r};this.normalize=function(){var n=this.length();n>0&&(i/=n,r/=n)};this.getNormalize=function(n){var t=this.length();n.set(i,r);n.normalize()};this.rot90CCW=function(){var n=i;i=-r;r=n};this.rot90CW=function(){var n=i;i=r;r=-n};this.getRotCCW=function(n){n.set(i,r);n.rot90CCW()};this.getRotCW=function(n){n.set(i,r);n.rot90CW()};this.ceil=function(){i=Math.ceil(i);r=Math.ceil(r)};this.round=function(){i=Math.round(i);r=Math.round(r)};this.toString=function(){return"Vector2: "+i+", "+r};this.print=function(){trace("Vector2: "+i+", "+r+"")};this.getX=function(){return i};this.getY=function(){return r};this._init(n,t)}function CGameSettings(){var t,i,r,n;this._init=function(){var f,u,i;for(r=[],t=[],f=0;f<2;f++)for(u=0;u<52;u++)t.push(u),i=(u+1)%13,(i>10||i===0)&&(i=10),i===1&&(i=11),r.push(i);n=[1,5,10,25,50,100]};this.getFichesValues=function(){return n};this.getFichesValueAt=function(t){return n[t]};this.getIndexForFiches=function(t){for(var r=0,i=0;i<n.length;i++)n[i]===t&&(r=i);return r};this.generateFichesPile=function(t){var e=[],i,r=n.length-1,u=n[r],o,f;do{for(i=t%u,i=CMath.roundDecimal(i,1),o=Math.floor(t/u),f=0;f<o;f++)e.push(u);r--;u=n[r];t=i}while(i>0&&r>-1);return e};this.timeToString=function(n){n=Math.round(n/1e3);var t=Math.floor(n/60),i=n-t*60,r="";return r+=t<10?"0"+t+":":t+":",r+(i<10?"0"+i:i)};this.getShuffledCardDeck=function(){for(var n=[],r=0;r<t.length;r++)n[r]=t[r];for(i=[];n.length>0;)i.push(n.splice(Math.round(Math.random()*(n.length-1)),1)[0]);return i};this.getCardValue=function(n){return r[n]};this.getRandDealerPattern=function(){var n,t,u,i,f,r;do for(t=[],n=0,u=0;u<2;u++){do i=Math.floor(Math.random()*52);while(this.getCardValue(i)===11);n+=this.getCardValue(i);t.push(i)}while(n<12||n>16);f=21-n;do r=Math.floor(Math.random()*52);while(this.getCardValue(r)<=f||this.getCardValue(r)===11);return t.push(r),t};this._init()}function ease(n,t,i,r,u,f){var e;switch(n){case TYPE_LINEAR:e=easeLinear(t,i,r,u,f);break;case TYPE_IN_CUBIC:e=easeInCubic(t,i,r,u,f);break;case TYPE_OUT_CUBIC:e=easeOutCubic(t,i,r,u,f);break;case TYPE_IN_BACK:e=easeInBack(t,i,r,u,f);break;case TYPE_OUT_BACK:e=easeInBack(t,i,r,u,f)}return e}function easeOutBounce(n,t,i,r){return(n/=r)<1/2.75?i*7.5625*n*n+t:n<2/2.75?i*(7.5625*(n-=1.5/2.75)*n+.75)+t:n<2.5/2.75?i*(7.5625*(n-=2.25/2.75)*n+.9375)+t:i*(7.5625*(n-=2.625/2.75)*n+.984375)+t}function easeInBounce(n,t,i,r){return i-easeOutBounce(r-n,0,i,r)+t}function easeInOutBounce(n,t,i,r){return n<r/2?easeInBounce(n*2,0,i,r)*.5+t:easeOutBounce(n*2-r,0,i,r)*.5+i*.5+t}function easeInCirc(n,t,i,r){return-i*(Math.sqrt(1-(n/=r)*n)-1)+t}function easeOutCirc(n,t,i,r){return i*Math.sqrt(1-(n=n/r-1)*n)+t}function easeInOutCirc(n,t,i,r){return(n/=r/2)<1?-i/2*(Math.sqrt(1-n*n)-1)+t:i/2*(Math.sqrt(1-(n-=2)*n)+1)+t}function easeInCubic(n,t,i,r){return i*(n/=r)*n*n+t}function easeOutCubic(n,t,i,r){return i*((n=n/r-1)*n*n+1)+t}function easeInOutCubic(n,t,i,r){return(n/=r/2)<1?i/2*n*n*n+t:i/2*((n-=2)*n*n+2)+t}function easeInElastic(n,t,i,r,u,f,e){return n==0?t:(n/=r)==1?t+i:(e||(e=r*.3),!f||f<Math.abs(i)?(f=i,u=e/4):u=e/(2*Math.PI)*Math.asin(i/f),-(f*Math.pow(2,10*(n-=1))*Math.sin((n*r-u)*2*Math.PI/e))+t)}function easeOutElastic(n,t,i,r,u,f,e){return n==0?t:(n/=r)==1?t+i:(e||(e=r*.3),!f||f<Math.abs(i)?(f=i,u=e/4):u=e/(2*Math.PI)*Math.asin(i/f),f*Math.pow(2,-10*n)*Math.sin((n*r-u)*2*Math.PI/e)+i+t)}function easeInOutElastic(n,t,i,r,u,f,e){return n==0?t:(n/=r)==1?t+i:(e||(e=r*.3),!f||f<Math.abs(i)?(f=i,u=e/4):u=e/(2*Math.PI)*Math.asin(i/f),n<1)?-.5*f*Math.pow(2,10*(n-=1))*Math.sin((n*r-u)*2*Math.PI/e)+t:f*Math.pow(2,-10*(n-=1))*Math.sin((n*r-u)*2*Math.PI/e)*.5+i+t}function easeInExpo(n,t,i,r){return n==0?t:i*Math.pow(2,10*(n/r-1))+t}function easeOutExpo(n,t,i,r){return n==r?t+i:i*(-Math.pow(2,-10*n/r)+1)+t}function easeInOutExpo(n,t,i,r){return n==0?t:n==r?t+i:(n/=r/2)<1?i/2*Math.pow(2,10*(n-1))+t:i/2*(-Math.pow(2,-10*--n)+2)+t}function easeLinear(n,t,i,r){return i*n/r+t}function easeInQuad(n,t,i,r){return i*(n/=r)*n+t}function easeOutQuad(n,t,i,r){return-i*(n/=r)*(n-2)+t}function easeInOutQuad(n,t,i,r){return(n/=r/2)<1?i/2*n*n+t:-i/2*(--n*(n-2)-1)+t}function easeInQuart(n,t,i,r){return i*(n/=r)*n*n*n+t}function easeOutQuart(n,t,i,r){return-i*((n=n/r-1)*n*n*n-1)+t}function easeInOutQuart(n,t,i,r){return(n/=r/2)<1?i/2*n*n*n*n+t:-i/2*((n-=2)*n*n*n-2)+t}function easeInQuint(n,t,i,r){return i*(n/=r)*n*n*n*n+t}function easeOutQuint(n,t,i,r){return i*((n=n/r-1)*n*n*n*n+1)+t}function easeInOutQuint(n,t,i,r){return(n/=r/2)<1?i/2*n*n*n*n*n+t:i/2*((n-=2)*n*n*n*n+2)+t}function easeInSine(n,t,i,r){return-i*Math.cos(n/r*(Math.PI/2))+i+t}function easeOutSine(n,t,i,r){return i*Math.sin(n/r*(Math.PI/2))+t}function easeInOutSine(n,t,i,r){return-i/2*(Math.cos(Math.PI*n/r)-1)+t}function easeInBack(n,t,i,r){return i*(n/=r)*n*((1.70158+1)*n-1.70158)+t}function easeOutBack(n,t,i,r){return i*((n=n/r-1)*n*((1.70158+1)*n+1.70158)+1)+t}function CHandController(n,t){var i,r,f,u,e,o;this._init=function(n,t){i=0;r=0;f=0;u=[];e=n;o=t};this.addCard=function(n){u.push(n);n.getValue()===11&&r++};this.removeCard=function(n){var t=u[n];i-=t.getValue();t.getValue()===11&&r--;u.splice(n,1)};this.changeBet=function(n){f=n};this.removeAce=function(){i-=10;r--};this.setHandValue=function(n){i=n};this.increaseAces=function(){r++};this.increaseHandValue=function(n){i+=n};this.getValue=function(){return i};this.getCurBet=function(){return f};this.getDoubleBet=function(){return f};this.getAces=function(){return r};this.getCard=function(n){return u[n]};this.getNumCards=function(){return u.length};this.getAttachOffset=function(){return e};this.getFichesController=function(){return o};this._init(n,t)}function CCard(n,t,i){var c,l,o=-1,a,p,v,u,s,e,f,h,r,y;this._init=function(n,t,i){y=i;var u=s_oSpriteLibrary.getSprite("card_spritesheet"),e={images:[u],frames:{width:CARD_WIDTH,height:CARD_HEIGHT,regX:CARD_WIDTH/2,regY:CARD_HEIGHT/2},animations:{card_1_1:[0],card_1_2:[1],card_1_3:[2],card_1_4:[3],card_1_5:[4],card_1_6:[5],card_1_7:[6],card_1_8:[7],card_1_9:[8],card_1_10:[9],card_1_J:[10],card_1_Q:[11],card_1_K:[12],card_2_1:[13],card_2_2:[14],card_2_3:[15],card_2_4:[16],card_2_5:[17],card_2_6:[18],card_2_7:[19],card_2_8:[20],card_2_9:[21],card_2_10:[22],card_2_J:[23],card_2_Q:[24],card_2_K:[25],card_3_1:[26],card_3_2:[27],card_3_3:[28],card_3_4:[29],card_3_5:[30],card_3_6:[31],card_3_7:[32],card_3_8:[33],card_3_9:[34],card_3_10:[35],card_3_J:[36],card_3_Q:[37],card_3_K:[38],card_4_1:[39],card_4_2:[40],card_4_3:[41],card_4_4:[42],card_4_5:[43],card_4_6:[44],card_4_7:[45],card_4_8:[46],card_4_9:[47],card_4_10:[48],card_4_J:[49],card_4_Q:[50],card_4_K:[51],back:[52]}},o=new createjs.SpriteSheet(e);r=createSprite(o,"back",CARD_WIDTH/2,CARD_HEIGHT/2,CARD_WIDTH,CARD_HEIGHT);r.x=n;r.y=t;r.stop();y.addChild(r);f=[];h=[]};this.unload=function(){s=null;e=null;y.removeChild(r)};this.addEventListener=function(n,t,i){f[n]=t;h[n]=i};this.setInfo=function(n,t,i,r,f,h){l=!1;u=0;a=i;p=r;s=n;e=t;v=h;c=f;o=STATE_CARD_DEALING};this.initSplit=function(n){s=new CVector2(r.x,r.y);e=n;u=0;o=STATE_CARD_SPLIT};this.initRemoving=function(n){s=new CVector2(r.x,r.y);e=n;u=0;o=STATE_CARD_REMOVING};this.setValue=function(){r.gotoAndStop(a);var n=this;createjs.Tween.get(r).to({scaleX:1},100).call(function(){n.cardShown()})};this.showCard=function(){var n=this;createjs.Tween.get(r).to({scaleX:.1},100).call(function(){n.setValue()})};this.hideCard=function(){var n=this;createjs.Tween.get(r).to({scaleX:.1},100).call(function(){n.setBack()})};this.setBack=function(){r.gotoAndStop("back");var n=this;createjs.Tween.get(r).to({scaleX:1},100).call(function(){n.cardHidden()})};this.cardShown=function(){f[ON_CARD_SHOWN]&&f[ON_CARD_SHOWN].call(h[ON_CARD_SHOWN])};this.cardHidden=function(){l=!0};this.getValue=function(){return p};this.getFotogram=function(){return a};this._updateDealing=function(){var t,n,i;u+=s_iTimeElaps;u>TIME_CARD_DEALING?(o=-1,u=0,r.x=e.getX(),r.y=e.getY(),r.rotation=360,f[ON_CARD_ANIMATION_ENDING]&&f[ON_CARD_ANIMATION_ENDING].call(h[ON_CARD_ANIMATION_ENDING],this,c,v),(c&&v===2)===!1&&this.showCard()):(this.visible=!0,t=easeInOutCubic(u,0,1,TIME_CARD_DEALING),n=new CVector2,n=tweenVectors(s,e,t,n),r.x=n.getX(),r.y=n.getY(),i=t*100,c===!1&&(r.rotation=i*360/100))};this._updateSplit=function(){if(u+=s_iTimeElaps,u>TIME_CARD_DEALING)u=0,f[SPLIT_CARD_END_ANIM]&&f[SPLIT_CARD_END_ANIM].call(h[SPLIT_CARD_END_ANIM]),o=-1;else{var t=easeInOutCubic(u,0,1,TIME_CARD_DEALING),n=new CVector2;n=tweenVectors(s,e,t,n);r.x=n.getX();r.y=n.getY()}};this._updateRemoving=function(){var t,n,i;u+=s_iTimeElaps;u>TIME_CARD_REMOVE?(u=0,r.visible=!1,l=!1,o=-1,f[ON_CARD_TO_REMOVE]&&f[ON_CARD_TO_REMOVE].call(h[ON_CARD_TO_REMOVE],this)):(t=easeInOutCubic(u,0,1,TIME_CARD_REMOVE),n=new CVector2,n=tweenVectors(s,e,t,n),r.x=n.getX(),r.y=n.getY(),i=t*100,r.rotation=i*45/100)};this.update=function(){switch(o){case STATE_CARD_DEALING:this._updateDealing();break;case STATE_CARD_SPLIT:this._updateSplit();break;case STATE_CARD_REMOVING:l===!0&&this._updateRemoving()}};s_oCard=this;this._init(n,t,i)}function CInsurancePanel(){var i,r,t,n;this._init=function(){var f,u;n=new createjs.Container;s_oStage.addChild(n);n.visible=!1;f=createBitmap(s_oSpriteLibrary.getSprite("msg_box"));n.addChild(f);t=new CTLText(n,CANVAS_WIDTH/2-190,290,360,100,50,"center","#fff",FONT_GAME_1,1,0,0," ",!0,!0,!0,!1);t.setShadow("#000000",2,2,2);u=s_oSpriteLibrary.getSprite("but_game_small_bg");i=new CTextButton(CANVAS_WIDTH/2-100,CANVAS_HEIGHT-300,u,TEXT_NO,FONT_GAME_1,"#ffffff",20,n);i.addEventListener(ON_MOUSE_UP,this._onButNoRelease,this);r=new CTextButton(CANVAS_WIDTH/2+100,CANVAS_HEIGHT-300,u,TEXT_YES,FONT_GAME_1,"#ffffff",20,n);r.addEventListener(ON_MOUSE_UP,this._onButYesRelease,this)};this.unload=function(){s_oStage.removeChild(n)};this.show=function(i){t.refreshText(i);n.visible=!0};this._onButNoRelease=function(){n.visible=!1;s_oGame.onNotBuyInsurance()};this._onButYesRelease=function(){n.visible=!1;s_oGame.onBuyInsurance()};this._init()}function CGameOver() {
  var r, t, i, n;
  this._init = function () {
    n = new createjs.Container();
    s_oStage.addChild(n);
    n.on("click", function () {});
    var u = createBitmap(s_oSpriteLibrary.getSprite("msg_box"));
    n.addChild(u);
    r = new CTLText(n, CANVAS_WIDTH / 2 - 190, 290, 360, 100, 32, "center", "#fff", FONT_GAME_1, 1, 0, 0, TEXT_NO_MONEY, !0, !0, !0, !1);
    r.setShadow("#000000", 2, 2, 2);
    t = new CTextButton(CANVAS_WIDTH / 2 - 100, 450, s_oSpriteLibrary.getSprite("but_game_bg"), TEXT_RECHARGE, FONT_GAME_1, "#fff", 14, n);
    t.addEventListener(ON_MOUSE_UP, this._onRecharge, this);
    i = new CTextButton(CANVAS_WIDTH / 2 + 100, 450, s_oSpriteLibrary.getSprite("but_game_bg"), TEXT_EXIT, FONT_GAME_1, "#fff", 14, n);
    i.addEventListener(ON_MOUSE_UP, this._onExit, this);
    this.hide();
  };
  this.unload = function () {
    t.unload();
    i.unload();
    n.off("click", function () {});
  };
  this.show = function () {
    n.visible = !0;
  };
  this.hide = function () {
    n.visible = !1;
  };
  this._onRecharge = function () {
    n.visible = !1;
    $(s_oMain).trigger("recharge");
  };
  this._onExit = function () {
    n.visible = !1;
    s_oInterface.enableBetFiches();
    s_oInterface.enable(!0, !1, !1, !1, !1);
  };
  this._init();
}function CMsgBox(){var i,t,n;return this._init=function(){n=new createjs.Container;n.alpha=0;n.visible=!1;s_oStage.addChild(n);i=createBitmap(s_oSpriteLibrary.getSprite("msg_box"));n.addChild(i);t=new CTLText(n,CANVAS_WIDTH/2-180,CANVAS_HEIGHT/2-50,360,100,34,"center","#fff",FONT_GAME_1,1,0,0," ",!0,!0,!0,!1);t.setShadow("#000",2,2,2)},this.unload=function(){n.off("mousedown",this._onExit)},this._initListener=function(){n.on("mousedown",this._onExit)},this.show=function(i){t.refreshText(i);n.visible=!0;var r=this;createjs.Tween.get(n).to({alpha:1},500).call(function(){r._initListener()});setTimeout(function(){r._onExit()},3e3)},this._onExit=function(){n.visible&&(n.off("mousedown"),n.visible=!1)},this._init(),this}function CCreditsPanel() {
  var h, r, o, u, t, f, e, i, s, n;
  this._init = function () {
    var l, c;
    n = new createjs.Container();
    n.alpha = 0;
    s_oStage.addChild(n);
    l = new createjs.Shape();
    l.graphics.beginFill("rgba(0,0,0,0.7)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    n.addChild(l);
    h = createBitmap(s_oSpriteLibrary.getSprite("msg_box"));
    n.addChild(h);
    f = new createjs.Shape();
    f.graphics.beginFill("#0f0f0f").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    f.alpha = .01;
    n.addChild(f);
    c = s_oSpriteLibrary.getSprite("but_menu_bg");
    s = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 164
    };
    o = new CTextButton(s.x, s.y, c, TEXT_EXIT, FONT_GAME_1, "#ffffff", 40, s_oStage);
    o.addEventListener(ON_MOUSE_UP, this.unload, this);
    t = new createjs.Text(TEXT_CREDITS_DEVELOPED, "38px " + FONT_GAME_1, "#000");
    t.textAlign = "center";
    t.textBaseline = "alphabetic";
    t.x = CANVAS_WIDTH / 2;
    t.y = 330;
    t.outline = 2;
    n.addChild(t);
    u = new createjs.Text(TEXT_CREDITS_DEVELOPED, "38px " + FONT_GAME_1, "#fff");
    u.textAlign = "center";
    u.textBaseline = "alphabetic";
    u.x = CANVAS_WIDTH / 2;
    u.y = 330;
    n.addChild(u);
    c = s_oSpriteLibrary.getSprite("logo_ctl");
    r = createBitmap(c);
    r.regX = c.width / 2;
    r.regY = c.height / 2;
    r.x = CANVAS_WIDTH / 2;
    r.y = CANVAS_HEIGHT / 2;
    n.addChild(r);
    i = new createjs.Text("www.codethislab.com", "30px " + FONT_GAME_1, "#000");
    i.textAlign = "center";
    i.textBaseline = "alphabetic";
    i.x = CANVAS_WIDTH / 2;
    i.y = 460;
    i.outline = 2;
    n.addChild(i);
    e = new createjs.Text("www.codethislab.com", "30px " + FONT_GAME_1, "#fff");
    e.textAlign = "center";
    e.textBaseline = "alphabetic";
    e.x = CANVAS_WIDTH / 2;
    e.y = 460;
    n.addChild(e);
    createjs.Tween.get(n).to({
      alpha: 1
    }, 600, createjs.Ease.cubicOut);
    this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
  };
  this.refreshButtonPos = function () {};
  this.unload = function () {
    o.unload();
    o = null;
    s_oStage.removeChild(n);
  };
  this._init();
}function CFiche(n,t,i,r,u,f){var s,c,l,w=i,o,h,a,v,y,e,p=f;this._init=function(n,t,i,r,u){var f,a;if(e=new createjs.Container,e.x=n,e.y=t,p.addChild(e),f=s_oSpriteLibrary.getSprite("fiche_"+i),v=createBitmap(f),e.addChild(v),a=SIZE_FONT_FICHE[i],y=new CTLText(e,9,7,22,18,a,"center",COLOR_FICHE_PER_VALUE[i],FONT_GAME_1,1,0,0,r,!0,!0,!1,!1),u){s=!1;c=f.width;l=f.height;o=[];h=[];e.on("mousedown",this.buttonDown);e.on("pressup",this.buttonRelease)}};this.addEventListener=function(n,t,i){o[n]=t;h[n]=i};this.addEventListenerWithParams=function(n,t,i,r){o[n]=t;h[n]=i;a=r};this.enable=function(){s=!1;e.filters=[];e.cache(0,0,c,l)};this.disable=function(){s=!0;var n=(new createjs.ColorMatrix).adjustSaturation(-100).adjustBrightness(40);e.filters=[new createjs.ColorMatrixFilter(n)];e.cache(0,0,c,l)};this.setScale=function(n){e.scaleX=n;e.scaleY=n};this.buttonRelease=function(){s||(playSound("press_but",1,!1),e.scaleX=1,e.scaleY=1,o[ON_MOUSE_UP]&&o[ON_MOUSE_UP].call(h[ON_MOUSE_UP],a))};this.buttonDown=function(){s||(e.scaleX=.9,e.scaleY=.9,o[ON_MOUSE_DOWN]&&o[ON_MOUSE_DOWN].call(h[ON_MOUSE_DOWN],a))};this._init(n,t,i,r,u)}function CTLText(n,t,i,r,u,f,e,o,s,h,c,l,a,v,y,p,w){this._oContainer=n;this._x=t;this._y=i;this._iWidth=r;this._iHeight=u;this._bMultiline=p;this._iFontSize=f;this._szAlign=e;this._szColor=o;this._szFont=s;this._iPaddingH=c;this._iPaddingV=l;this._bVerticalAlign=y;this._bFitText=v;this._bDebug=w;this._oDebugShape=null;this._fLineHeightFactor=h;this._oText=null;a&&this.__createText(a)}function CLangPanel(n){var o,s,e,h,l,a,r,c,i,t,u,f,v=n,y=this;this._init=function(){o=[];s=[];f=new createjs.Container;f.visible=!1;v.addChild(f);i=new createjs.Shape;i.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);a=i.on("click",function(){});f.addChild(i);t=new createjs.Container;t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT/2;f.addChild(t);r=s_oSpriteLibrary.getSprite("msg_box_small");var n=createBitmap(r);t.addChild(n);this._placeLanguages();c=new CGfxButton(r.width,0,s_oSpriteLibrary.getSprite("but_exit"),t);c.addEventListener(ON_MOUSE_UP,this.hide,this);t.regX=r.width/2;t.regY=r.height/2};this.unload=function(){c.unload();i.off("click",a);for(var n=0;n<e.length;n++)e[n].off("click",h[n])};this.addEventListener=function(n,t,i){o[n]=t;s[n]=i};this.show=function(){f.visible=!0;i.alpha=0;createjs.Tween.get(i).to({alpha:.7},400,createjs.Ease.cubicOut);t.scaleX=t.scaleY=.01;t.alpha=0;createjs.Tween.get(t).wait(400).to({scale:1,alpha:1},1e3,createjs.Ease.elasticOut)};this.hide=function(){createjs.Tween.get(i).to({alpha:0},400,createjs.Ease.cubicOut);createjs.Tween.get(t).to({scaleX:.1,scaleY:.1,alpha:.5},400,createjs.Ease.backIn).call(function(){f.visible=!1})};this._placeLanguages=function(){var v,o,f,a,n,i;for(u=new createjs.Container,u.x=r.width/2,u.y=r.height/2,t.addChild(u),v=s_oSpriteLibrary.getSprite("but_lang"),o={},f=0;f<NUM_LANGUAGES;f++)o["lang_"+f]=f;var y={images:[v],frames:{width:LANG_WIDTH,height:LANG_HEIGHT,regX:LANG_WIDTH/2,regY:LANG_HEIGHT/2},animations:o},p=new createjs.SpriteSheet(y),s=0,c=0;for(e=[],h=[],l=[],a=0,n=0;n<NUM_LANGUAGES;n++)i=createSprite(p,"lang_"+n,LANG_WIDTH/2,LANG_HEIGHT/2,LANG_WIDTH,LANG_HEIGHT),i.x=s,i.y=c,l[n]=i.on("mousedown",this._onPressLang,this,!1,n),h[n]=i.on("click",this._onSelectLang,this,!1,n),u.addChild(i),e.push(i),a++,n>0&&a%NUM_ITEMS_PER_COLS==0?(s=0,c+=LANG_HEIGHT+10):s+=LANG_WIDTH+10;u.regX=LANG_WIDTH*NUM_ITEMS_PER_COLS/2-LANG_WIDTH/2;u.regY=c-130};this._onPressLang=function(n,t){e[t].scale=.9};this._onSelectLang=function(n,t){e[t].scale=1;o[ON_SELECT_LANG]&&o[ON_SELECT_LANG].call(s[ON_SELECT_LANG],t);y.hide()};this._init()}function CButLang(n,t,i,r,u,f){var o=r,y=i,s,h,l,a,c,e,v=f;this._init=function(n,t,i,r){var f,u,y,p;for(s=[],h=[],e=new createjs.Container,e.x=n,e.y=t,a=e.on("mousedown",this._onPress,this),l=e.on("click",this._onChangeLang,this),v.addChild(e),f={},u=0;u<i;u++)f["lang_"+u]=u;y={images:[r],frames:{width:LANG_WIDTH,height:LANG_HEIGHT},animations:f};p=new createjs.SpriteSheet(y);c=createSprite(p,"lang_"+o,0,0,LANG_WIDTH,LANG_HEIGHT);e.addChild(c);e.regX=LANG_WIDTH/2;e.regY=LANG_HEIGHT/2};this.unload=function(){e.off("mousedown",a);e.off("click",l)};this.addEventListener=function(n,t,i){s[n]=t;h[n]=i};this.setPosition=function(n,t){e.x=n;e.y=t};this.setLang=function(n){o=n;c.gotoAndStop("lang_"+o)};this._onPress=function(){e.scale=.9};this._onChangeLang=function(){e.scale=1;s[ON_SELECT_LANG]&&s[ON_SELECT_LANG].call(h[ON_SELECT_LANG],o)};this.getButtonImage=function(){return e};this._init(n,t,i,u)}function CAlertPanel(n){var f,e,u,i,t,r;this._init=function(n){r=new createjs.Container;s_oStage.addChild(r);i=new createjs.Shape;i.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);i.alpha=.5;f=i.on("click",function(){});r.addChild(i);t=new createjs.Container;t.alpha=0;r.addChild(t);var o=s_oSpriteLibrary.getSprite("msg_box"),s=createBitmap(o);t.addChild(s);t.x=CANVAS_WIDTH/2;t.y=CANVAS_HEIGHT/2;t.regX=o.width/2;t.regY=o.height/2;e=new CTLText(t,o.width/2-220,o.height/2-100,400,200,60,"center","#fff",FONT_GAME_1,1,0,0,n,!0,!0,!0,!1);u=new CGfxButton(o.width/2,570,s_oSpriteLibrary.getSprite("but_exit"),t);u.addEventListener(ON_MOUSE_UP,this._onButYes,this);createjs.Tween.get(t).to({alpha:1},1e3,createjs.Ease.cubicOut)};this._onButYes=function(){u.unload();i.off("click",f);s_oStage.removeChild(r)};this._init(n)}var s_iScaleFactor,s_iOffsetX,s_iOffsetY,s_bIsRetina,s_bFocus,s_oMenu,s_oGame,s_oTweenController,s_oInterface,s_oCard;(function(){"use strict";function p(n){return n=String(n),n.charAt(0).toUpperCase()+n.slice(1)}function nt(n,t,i){var r={"10.0":"10","6.4":"10 Technical Preview","6.3":"8.1","6.2":"8","6.1":"Server 2008 R2 / 7","6.0":"Server 2008 / Vista","5.2":"Server 2003 / XP 64-bit","5.1":"XP","5.01":"2000 SP1","5.0":"2000","4.0":"NT","4.90":"ME"};return t&&i&&/^Win/i.test(n)&&!/^Windows Phone /i.test(n)&&(r=r[/[\d.]+$/.exec(n)])&&(n="Windows "+r),n=String(n),t&&i&&(n=n.replace(RegExp(t,"i"),i)),o(n.replace(/ ce$/i," CE").replace(/\bhpw/i,"web").replace(/\bMacintosh\b/,"Mac OS").replace(/_PowerPC\b/i," OS").replace(/\b(OS X) [^ \d]+/i,"$1").replace(/\bMac (OS X)\b/,"$1").replace(/\/(\d)/," $1").replace(/_/g,".").replace(/(?: BePC|[ .]*fc[ \d.]+)$/i,"").replace(/\bx86\.64\b/gi,"x86_64").replace(/\b(Windows Phone) OS\b/,"$1").replace(/\b(Chrome OS \w+) [\d.]+\b/,"$1").split(" on ")[0])}function tt(n,t){var r=-1,i=n?n.length:0;if(typeof i=="number"&&i>-1&&i<=k)while(++r<i)t(n[r],r,n);else s(n,t)}function o(n){return n=w(n),/^(?:webOS|i(?:OS|P))/.test(n)?n:p(n)}function s(n,t){for(var i in n)g.call(n,i)&&t(n[i],i,n)}function t(n){return n==null?p(n):y.call(n).slice(8,-1)}function it(n,t){var i=n!=null?typeof n[t]:"number";return!/^(?:boolean|number|string|undefined)$/.test(i)&&(i=="object"?!!n[t]:!0)}function i(n){return String(n).replace(/([ -])(?!$)/g,"$1?")}function r(n,t){var i=null;return tt(n,function(r,u){i=t(i,r,u,n)}),i}function w(n){return String(n).replace(/^ +| +$/g,"")}function h(n){function ui(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function fi(t){return r(t,function(t,r,u){return t||(r[p]||r[/^[a-z]+(?: +[a-z]+\b)*/i.exec(p)]||RegExp("\\b"+i(u)+"(?:\\b|\\w*\\d)","i").exec(n))&&u})}function ei(t){return r(t,function(t,r){return t||RegExp("\\b"+(r.pattern||i(r))+"\\b","i").exec(n)&&(r.label||r)})}function oi(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+"(?:/[\\d.]+|[ \\w.]*)","i").exec(n))&&(t=nt(t,u,r.label||r)),t})}function wt(t){return r(t,function(t,r){var u=r.pattern||i(r);return!t&&(t=RegExp("\\b"+u+" *\\d+[.\\w_]*","i").exec(n)||RegExp("\\b"+u+" *\\w+-[\\w]*","i").exec(n)||RegExp("\\b"+u+"(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)","i").exec(n))&&((t=String(r.label&&!RegExp(u,"i").test(r.label)?r.label:t).split("/"))[1]&&!/[\d.]+/.test(t[0])&&(t[0]+=" "+t[1]),r=r.label||r,t=o(t[0].replace(RegExp(u,"i"),r).replace(RegExp("; *(?:"+r+"[_-])?","i")," ").replace(RegExp("("+r+")[-_.]?(\\w)","i"),"$1 $2"))),t})}function si(t){return r(t,function(t,i){return t||(RegExp(i+"(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)","i").exec(n)||0)[1]||null})}function hi(){return this.description||""}var g=u,ut=n&&typeof n=="object"&&t(n)!="String",ot,at,tt;ut&&(g=n,n=null);ot=g.navigator||{};at=ot.userAgent||"";n||(n=at);var ci=ut||d==b,bt=ut?!!ot.likeChrome:/\bChrome\b/.test(n)&&!/internal|\n/i.test(y.toString()),vt="Object",kt=ut?vt:"ScriptBridgingProxyObject",dt=ut?vt:"Environment",gt=ut&&g.java?"JavaPackage":t(g.java),ni=ut?vt:"RuntimeObject",st=/\bJava/.test(gt)&&g.java,ti=st&&t(g.environment)==dt,ii=st?"a":"α",ri=st?"b":"β",yt=g.document||{},ft=g.operamini||g.opera,ht=e.test(ht=ut&&ft?ft["[[Class]]"]:t(ft))?ht:ft=null,f,ct=n,v=[],lt=null,et=n==at,a=et&&ft&&typeof ft.version=="function"&&ft.version(),pt,k=ui([{label:"EdgeHTML",pattern:"Edge"},"Trident",{label:"WebKit",pattern:"AppleWebKit"},"iCab","Presto","NetFront","Tasman","KHTML","Gecko"]),c=ei(["Adobe AIR","Arora","Avant Browser","Breach","Camino","Electron","Epiphany","Fennec","Flock","Galeon","GreenBrowser","iCab","Iceweasel","K-Meleon","Konqueror","Lunascape","Maxthon",{label:"Microsoft Edge",pattern:"Edge"},"Midori","Nook Browser","PaleMoon","PhantomJS","Raven","Rekonq","RockMelt",{label:"Samsung Internet",pattern:"SamsungBrowser"},"SeaMonkey",{label:"Silk",pattern:"(?:Cloud9|Silk-Accelerated)"},"Sleipnir","SlimBrowser",{label:"SRWare Iron",pattern:"Iron"},"Sunrise","Swiftfox","Waterfox","WebPositive","Opera Mini",{label:"Opera Mini",pattern:"OPiOS"},"Opera",{label:"Opera",pattern:"OPR"},"Chrome",{label:"Chrome Mobile",pattern:"(?:CriOS|CrMo)"},{label:"Firefox",pattern:"(?:Firefox|Minefield)"},{label:"Firefox for iOS",pattern:"FxiOS"},{label:"IE",pattern:"IEMobile"},{label:"IE",pattern:"MSIE"},"Safari"]),p=wt([{label:"BlackBerry",pattern:"BB10"},"BlackBerry",{label:"Galaxy S",pattern:"GT-I9000"},{label:"Galaxy S2",pattern:"GT-I9100"},{label:"Galaxy S3",pattern:"GT-I9300"},{label:"Galaxy S4",pattern:"GT-I9500"},{label:"Galaxy S5",pattern:"SM-G900"},{label:"Galaxy S6",pattern:"SM-G920"},{label:"Galaxy S6 Edge",pattern:"SM-G925"},{label:"Galaxy S7",pattern:"SM-G930"},{label:"Galaxy S7 Edge",pattern:"SM-G935"},"Google TV","Lumia","iPad","iPod","iPhone","Kindle",{label:"Kindle Fire",pattern:"(?:Cloud9|Silk-Accelerated)"},"Nexus","Nook","PlayBook","PlayStation Vita","PlayStation","TouchPad","Transformer",{label:"Wii U",pattern:"WiiU"},"Wii","Xbox One",{label:"Xbox 360",pattern:"Xbox"},"Xoom"]),rt=fi({Apple:{iPad:1,iPhone:1,iPod:1},Archos:{},Amazon:{Kindle:1,"Kindle Fire":1},Asus:{Transformer:1},"Barnes & Noble":{Nook:1},BlackBerry:{PlayBook:1},Google:{"Google TV":1,Nexus:1},HP:{TouchPad:1},HTC:{},LG:{},Microsoft:{Xbox:1,"Xbox One":1},Motorola:{Xoom:1},Nintendo:{"Wii U":1,Wii:1},Nokia:{Lumia:1},Samsung:{"Galaxy S":1,"Galaxy S2":1,"Galaxy S3":1,"Galaxy S4":1},Sony:{PlayStation:1,"PlayStation Vita":1}}),l=oi(["Windows Phone","Android","CentOS",{label:"Chrome OS",pattern:"CrOS"},"Debian","Fedora","FreeBSD","Gentoo","Haiku","Kubuntu","Linux Mint","OpenBSD","Red Hat","SuSE","Ubuntu","Xubuntu","Cygwin","Symbian OS","hpwOS","webOS ","webOS","Tablet OS","Tizen","Linux","Mac OS X","Macintosh","Mac","Windows 98;","Windows "]);if(k&&(k=[k]),rt&&!p&&(p=wt([rt])),(f=/\bGoogle TV\b/.exec(p))&&(p=f[0]),/\bSimulator\b/i.test(n)&&(p=(p?p+" ":"")+"Simulator"),c=="Opera Mini"&&/\bOPiOS\b/.test(n)&&v.push("running in Turbo/Uncompressed mode"),c=="IE"&&/\blike iPhone OS\b/.test(n)?(f=h(n.replace(/like iPhone OS/,"")),rt=f.manufacturer,p=f.product):/^iP/.test(p)?(c||(c="Safari"),l="iOS"+((f=/ OS ([\d_]+)/i.exec(n))?" "+f[1].replace(/_/g,"."):"")):c!="Konqueror"||/buntu/i.test(l)?rt&&rt!="Google"&&(/Chrome/.test(c)&&!/\bMobile Safari\b/i.test(n)||/\bVita\b/.test(p))||/\bAndroid\b/.test(l)&&/^Chrome/.test(c)&&/\bVersion\//i.test(n)?(c="Android Browser",l=/\bAndroid\b/.test(l)?l:"Android"):c=="Silk"?(/\bMobi/i.test(n)||(l="Android",v.unshift("desktop mode")),/Accelerated *= *true/i.test(n)&&v.unshift("accelerated")):c=="PaleMoon"&&(f=/\bFirefox\/([\d.]+)\b/.exec(n))?v.push("identifying as Firefox "+f[1]):c=="Firefox"&&(f=/\b(Mobile|Tablet|TV)\b/i.exec(n))?(l||(l="Firefox OS"),p||(p=f[1])):!c||(f=!/\bMinefield\b/i.test(n)&&/\b(?:Firefox|Safari)\b/.exec(c))?(c&&!p&&/[\/,]|^[^(]+?\)/.test(n.slice(n.indexOf(f+"/")+8))&&(c=null),(f=p||rt||l)&&(p||rt||/\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(l))&&(c=/[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(l)?l:f)+" Browser")):c=="Electron"&&(f=(/\bChrome\/([\d.]+)\b/.exec(n)||0)[1])&&v.push("Chromium "+f):l="Kubuntu",a||(a=si(["(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))","Version",i(c),"(?:Firefox|Minefield|NetFront)"])),(f=k=="iCab"&&parseFloat(a)>3&&"WebKit"||/\bOpera\b/.test(c)&&(/\bOPR\b/.test(n)?"Blink":"Presto")||/\b(?:Midori|Nook|Safari)\b/i.test(n)&&!/^(?:Trident|EdgeHTML)$/.test(k)&&"WebKit"||!k&&/\bMSIE\b/i.test(n)&&(l=="Mac OS"?"Tasman":"Trident")||k=="WebKit"&&/\bPlayStation\b(?! Vita\b)/i.test(c)&&"NetFront")&&(k=[f]),c=="IE"&&(f=(/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(n)||0)[1])?(c+=" Mobile",l="Windows Phone "+(/\+$/.test(f)?f:f+".x"),v.unshift("desktop mode")):/\bWPDesktop\b/i.test(n)?(c="IE Mobile",l="Windows Phone 8.x",v.unshift("desktop mode"),a||(a=(/\brv:([\d.]+)/.exec(n)||0)[1])):c!="IE"&&k=="Trident"&&(f=/\brv:([\d.]+)/.exec(n))&&(c&&v.push("identifying as "+c+(a?" "+a:"")),c="IE",a=f[1]),et){if(it(g,"global"))if(st&&(f=st.lang.System,ct=f.getProperty("os.arch"),l=l||f.getProperty("os.name")+" "+f.getProperty("os.version")),ti){try{a=g.require("ringo/engine").version.join(".");c="RingoJS"}catch(li){(f=g.system)&&f.global.system==g.system&&(c="Narwhal",l||(l=f[0].os||null))}c||(c="Rhino")}else typeof g.process=="object"&&!g.process.browser&&(f=g.process)&&(typeof f.versions=="object"&&(typeof f.versions.electron=="string"?(v.push("Node "+f.versions.node),c="Electron",a=f.versions.electron):typeof f.versions.nw=="string"&&(v.push("Chromium "+a,"Node "+f.versions.node),c="NW.js",a=f.versions.nw)),c||(c="Node.js",ct=f.arch,l=f.platform,a=/[\d.]+/.exec(f.version),a=a?a[0]:null));else t(f=g.runtime)==kt?(c="Adobe AIR",l=f.flash.system.Capabilities.os):t(f=g.phantom)==ni?(c="PhantomJS",a=(f=f.version||null)&&f.major+"."+f.minor+"."+f.patch):typeof yt.documentMode=="number"&&(f=/\bTrident\/(\d+)/i.exec(n))?(a=[a,yt.documentMode],(f=+f[1]+4)!=a[1]&&(v.push("IE "+a[1]+" mode"),k&&(k[1]=""),a[1]=f),a=c=="IE"?String(a[1].toFixed(1)):a[0]):typeof yt.documentMode=="number"&&/^(?:Chrome|Firefox)\b/.test(c)&&(v.push("masking as "+c+" "+a),c="IE",a="11.0",k=["Trident"],l="Windows");l=l&&o(l)}if(a&&(f=/(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(a)||/(?:alpha|beta)(?: ?\d)?/i.exec(n+";"+(et&&ot.appMinorVersion))||/\bMinefield\b/i.test(n)&&"a")&&(lt=/b/i.test(f)?"beta":"alpha",a=a.replace(RegExp(f+"\\+?$"),"")+(lt=="beta"?ri:ii)+(/\d+\+?/.exec(f)||"")),c=="Fennec"||c=="Firefox"&&/\b(?:Android|Firefox OS)\b/.test(l))c="Firefox Mobile";else if(c=="Maxthon"&&a)a=a.replace(/\.[\d.]+/,".x");else if(/\bXbox\b/i.test(p))p=="Xbox 360"&&(l=null),p=="Xbox 360"&&/\bIEMobile\b/.test(n)&&v.unshift("mobile mode");else if((/^(?:Chrome|IE|Opera)$/.test(c)||c&&!p&&!/Browser|Mobi/.test(c))&&(l=="Windows CE"||/Mobi/i.test(n)))c+=" Mobile";else if(c=="IE"&&et)try{g.external===null&&v.unshift("platform preview")}catch(li){v.unshift("embedded")}else(/\bBlackBerry\b/.test(p)||/\bBB10\b/.test(n))&&(f=(RegExp(p.replace(/ +/g," *")+"/([.\\d]+)","i").exec(n)||0)[1]||a)?(f=[f,/BB10/.test(n)],l=(f[1]?(p=null,rt="BlackBerry"):"Device Software")+" "+f[0],a=null):this!=s&&p!="Wii"&&(et&&ft||/Opera/.test(c)&&/\b(?:MSIE|Firefox)\b/i.test(n)||c=="Firefox"&&/\bOS X (?:\d+\.){2,}/.test(l)||c=="IE"&&(l&&!/^Win/.test(l)&&a>5.5||/\bWindows XP\b/.test(l)&&a>8||a==8&&!/\bTrident\b/.test(n)))&&!e.test(f=h.call(s,n.replace(e,"")+";"))&&f.name&&(f="ing as "+f.name+((f=f.version)?" "+f:""),e.test(c)?(/\bIE\b/.test(f)&&l=="Mac OS"&&(l=null),f="identify"+f):(f="mask"+f,c=ht?o(ht.replace(/([a-z])([A-Z])/g,"$1 $2")):"Opera",/\bIE\b/.test(f)&&(l=null),et||(a=null)),k=["Presto"],v.push(f));return(f=(/\bAppleWebKit\/([\d.]+\+?)/i.exec(n)||0)[1])&&(f=[parseFloat(f.replace(/\.(\d)$/,".0$1")),f],c=="Safari"&&f[1].slice(-1)=="+"?(c="WebKit Nightly",lt="alpha",a=f[1].slice(0,-1)):(a==f[1]||a==(f[2]=(/\bSafari\/([\d.]+\+?)/i.exec(n)||0)[1]))&&(a=null),f[1]=(/\bChrome\/([\d.]+)/i.exec(n)||0)[1],f[0]==537.36&&f[2]==537.36&&parseFloat(f[1])>=28&&k=="WebKit"&&(k=["Blink"]),et&&(bt||f[1])?(k&&(k[1]="like Chrome"),f=f[1]||(f=f[0],f<530?1:f<532?2:f<532.05?3:f<533?4:f<534.03?5:f<534.07?6:f<534.1?7:f<534.13?8:f<534.16?9:f<534.24?10:f<534.3?11:f<535.01?12:f<535.02?"13+":f<535.07?15:f<535.11?16:f<535.19?17:f<536.05?18:f<536.1?19:f<537.01?20:f<537.11?"21+":f<537.13?23:f<537.18?24:f<537.24?25:f<537.36?26:k!="Blink"?"27":"28")):(k&&(k[1]="like Safari"),f=(f=f[0],f<400?1:f<500?2:f<526?3:f<533?4:f<534?"4+":f<535?5:f<537?6:f<538?7:f<601?8:"8")),k&&(k[1]+=" "+(f+=typeof f=="number"?".x":/[.+]/.test(f)?"":"+")),c=="Safari"&&(!a||parseInt(a)>45)&&(a=f)),c=="Opera"&&(f=/\bzbov|zvav$/.exec(l))?(c+=" ",v.unshift("desktop mode"),f=="zvav"?(c+="Mini",a=null):c+="Mobile",l=l.replace(RegExp(" *"+f+"$"),"")):c=="Safari"&&/\bChrome\b/.exec(k&&k[1])&&(v.unshift("desktop mode"),c="Chrome Mobile",a=null,/\bOS X\b/.test(l)?(rt="Apple",l="iOS 4.3+"):l=null),a&&a.indexOf(f=/[\d.]+$/.exec(l))==0&&n.indexOf("/"+f+"-")>-1&&(l=w(l.replace(f,""))),k&&!/\b(?:Avant|Nook)\b/.test(c)&&(/Browser|Lunascape|Maxthon/.test(c)||c!="Safari"&&/^iOS/.test(l)&&/\bSafari\b/.test(k[1])||/^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(c)&&k[1])&&(f=k[k.length-1])&&v.push(f),v.length&&(v=["("+v.join("; ")+")"]),rt&&p&&p.indexOf(rt)<0&&v.push("on "+rt),p&&v.push((/^on /.test(v[v.length-1])?"":"on ")+p),l&&(f=/ ([\d.+]+)$/.exec(l),pt=f&&l.charAt(l.length-f[0].length-1)=="/",l={architecture:32,family:f&&!pt?l.replace(f[0],""):l,version:f?f[1]:null,toString:function(){var n=this.version;return this.family+(n&&!pt?" "+n:"")+(this.architecture==64?" 64-bit":"")}}),(f=/\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(ct))&&!/\bi686\b/i.test(ct)?(l&&(l.architecture=64,l.family=l.family.replace(RegExp(" *"+f),"")),c&&(/\bWOW64\b/i.test(n)||et&&/\w(?:86|32)$/.test(ot.cpuClass||ot.platform)&&!/\bWin64; x64\b/i.test(n))&&v.unshift("32-bit")):l&&/^OS X/.test(l.family)&&c=="Chrome"&&parseFloat(a)>=39&&(l.architecture=64),n||(n=null),tt={},tt.description=n,tt.layout=k&&k[0],tt.manufacturer=rt,tt.name=c,tt.prerelease=lt,tt.product=p,tt.ua=n,tt.version=c&&a,tt.os=l||{architecture:null,family:null,version:null,toString:function(){return"null"}},tt.parse=h,tt.toString=hi,tt.version&&v.unshift(a),tt.name&&v.unshift(c),!l||!c||l==String(l).split(" ")[0]&&(l==c.split(" ")[0]||p)||v.push(p?"("+l+")":"on "+l),v.length&&(tt.description=v.join(" ")),tt}var c={"function":!0,object:!0},u=c[typeof window]&&window||this,b=u,l=c[typeof exports]&&exports,a=c[typeof module]&&module&&!module.nodeType&&module,n=l&&a&&typeof global=="object"&&global,f;n&&(n.global===n||n.window===n||n.self===n)&&(u=n);var k=Math.pow(2,53)-1,e=/\bOpera/,d=this,v=Object.prototype,g=v.hasOwnProperty,y=v.toString;f=h();typeof define=="function"&&typeof define.amd=="object"&&define.amd?(u.platform=f,define(function(){return f})):l&&a?s(f,function(n,t){l[t]=n}):u.platform=f}).call(this);$(document).ready(function(){platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&(buildIOSFullscreenPanel(),buildIOSMeta())});jQuery(window).resize(function(){platform&&platform.product==="iPhone"&&platform.name.toLowerCase()==="safari"&&isIOSLessThen13()&&!iosInIframe()&&iosResize()});
/*!
* screenfull
* v5.0.0 - 2019-09-09
* (c) Sindre Sorhus; MIT License
*/
if(function(){"use strict";var t=typeof window!="undefined"&&typeof window.document!="undefined"?window.document:{},r=typeof module!="undefined"&&module.exports,n=function(){for(var i,r=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],n=0,f=r.length,u={};n<f;n++)if(i=r[n],i&&i[1]in t){for(n=0;n<i.length;n++)u[r[0][n]]=i[n];return u}return!1}(),u={change:n.fullscreenchange,error:n.fullscreenerror},i={request:function(i){return new Promise(function(r,u){var f=function(){this.off("change",f);r()}.bind(this);this.on("change",f);i=i||t.documentElement;Promise.resolve(i[n.requestFullscreen]()).catch(u)}.bind(this))},exit:function(){return new Promise(function(i,r){if(!this.isFullscreen){i();return}var u=function(){this.off("change",u);i()}.bind(this);this.on("change",u);Promise.resolve(t[n.exitFullscreen]()).catch(r)}.bind(this))},toggle:function(n){return this.isFullscreen?this.exit():this.request(n)},onchange:function(n){this.on("change",n)},onerror:function(n){this.on("error",n)},on:function(n,i){var r=u[n];r&&t.addEventListener(r,i,!1)},off:function(n,i){var r=u[n];r&&t.removeEventListener(r,i,!1)},raw:n};if(!n){r?module.exports={isEnabled:!1}:window.screenfull={isEnabled:!1};return}Object.defineProperties(i,{isFullscreen:{get:function(){return Boolean(t[n.fullscreenElement])}},element:{enumerable:!0,get:function(){return t[n.fullscreenElement]}},isEnabled:{enumerable:!0,get:function(){return Boolean(t[n.fullscreenEnabled])}}});r?module.exports=i:window.screenfull=i}(),s_iScaleFactor=1,s_bFocus=!0,function(n){(jQuery.browser=jQuery.browser||{}).mobile=/android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|tablet|treo|up\.(browser|link)|vodafone|wap|webos|windows (ce|phone)|xda|xiino/i.test(n)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(n.substr(0,4))}(navigator.userAgent||navigator.vendor||window.opera),$(window).resize(function(){sizeHandler()}),window.addEventListener("orientationchange",onOrientationChange),function(){function n(n){var i="visible",r="hidden",u={focus:i,focusin:i,pageshow:i,blur:r,focusout:r,pagehide:r};n=n||window.event;n.type in u?document.body.className=u[n.type]:(document.body.className=this[t]?"hidden":"visible",document.body.className==="hidden"?(s_oMain.stopUpdate(),s_bFocus=!1):(s_oMain.startUpdate(),s_bFocus=!0))}var t="hidden";t in document?document.addEventListener("visibilitychange",n):(t="mozHidden")in document?document.addEventListener("mozvisibilitychange",n):(t="webkitHidden")in document?document.addEventListener("webkitvisibilitychange",n):(t="msHidden")in document?document.addEventListener("msvisibilitychange",n):"onfocusin"in document?document.onfocusin=document.onfocusout=n:window.onpageshow=window.onpagehide=window.onfocus=window.onblur=n}(),Array.prototype.sortOn=function(){var n=this.slice(),t;return arguments.length?(t=Array.prototype.slice.call(arguments),n.sort(function(n,i){for(var u=t.slice(),r=u.shift();n[r]==i[r]&&u.length;)r=u.shift();return n[r]==i[r]?0:n[r]>i[r]?1:-1})):n.sort()},NoClickDelay.prototype={handleEvent:function(n){switch(n.type){case"touchstart":this.onTouchStart(n);break;case"touchmove":this.onTouchMove(n);break;case"touchend":this.onTouchEnd(n)}},onTouchStart:function(n){n.preventDefault();this.moved=!1;this.element.addEventListener("touchmove",this,!1);this.element.addEventListener("touchend",this,!1)},onTouchMove:function(){this.moved=!0},onTouchEnd:function(n){var t,i;this.element.removeEventListener("touchmove",this,!1);this.element.removeEventListener("touchend",this,!1);this.moved||(t=document.elementFromPoint(n.changedTouches[0].clientX,n.changedTouches[0].clientY),t.nodeType===3&&(t=t.parentNode),i=document.createEvent("MouseEvents"),i.initEvent("click",!0,!0),t.dispatchEvent(i))}},screenfull.isEnabled)screenfull.on("change",function(){s_bFullscreen=screenfull.isFullscreen;s_oInterface!==null&&s_oInterface.resetFullscreenBut();s_oMenu!==null&&s_oMenu.resetFullscreenBut()});var CANVAS_WIDTH=1700,CANVAS_HEIGHT=768,EDGEBOARD_X=338,EDGEBOARD_Y=0,FPS_TIME=1e3/24,DISABLE_SOUND_MOBILE=!1,FONT_GAME_1="RoundedMplus1c",FONT_GAME_2="ditedregular",STATE_LOADING=0,STATE_MENU=1,STATE_HELP=1,STATE_GAME=3,STATE_GAME_WAITING_FOR_BET=0,STATE_GAME_DEALING=1,STATE_GAME_HITTING=2,STATE_GAME_SPLIT=3,STATE_GAME_FINALIZE=4,STATE_GAME_SHOW_WINNER=5,STATE_CARD_DEALING=0,STATE_CARD_SPLIT=1,STATE_CARD_REMOVING=2,ON_MOUSE_DOWN=0,ON_MOUSE_UP=1,ON_MOUSE_OVER=2,ON_MOUSE_OUT=3,ON_DRAG_START=4,ON_DRAG_END=5,ON_SELECT_LANG=6,SIT_DOWN="SIT_DOWN",PASS_TURN="PASS_TURN",PLAYER_LOSE="PLAYER_LOSE",ASSIGN_FICHES="ASSIGN_FICHES",FICHES_END_MOV="FICHES_END_MOV",RESTORE_ACTION="RESTORE_ACTION",END_HAND="END_HAND",ON_CARD_SHOWN="ON_CARD_SHOWN",ON_CARD_ANIMATION_ENDING="ON_CARD_ANIMATION_ENDING",SPLIT_CARD_END_ANIM="SPLIT_CARD_END_ANIM",ON_CARD_TO_REMOVE="ON_CARD_TO_REMOVE",NUM_FICHES=6,CARD_WIDTH=44,CARD_HEIGHT=63,MIN_BET,MAX_BET,TOTAL_MONEY=1e3,FICHE_WIDTH=45,WIN_OCCURRENCE,TIME_FICHES_MOV=600,TIME_CARD_DEALING=250,TIME_CARD_REMOVE=1e3,TIME_SHOW_FINAL_CARDS=2e3,TIME_END_HAND=1500,BET_TIME=1e4,COLOR_FICHE_PER_VALUE=["#000","#000","#000","#fff","#000","#fff"],SIZE_FONT_FICHE=[12,18,18,18,18,20],AD_SHOW_COUNTER,ENABLE_FULLSCREEN,ENABLE_CHECK_ORIENTATION,SHOW_CREDITS,NUM_LANGUAGES=13,LANG_EN=0,LANG_RU=1,LANG_ES=2,LANG_FR=3,LANG_DE=4,LANG_PT=5,LANG_IT=6,LANG_TR=7,LANG_AR=8,LANG_HI=9,LANG_ID=10,LANG_JA=11,LANG_ZH=12,LANG_CODES={};LANG_CODES.en=LANG_EN;LANG_CODES.ru=LANG_RU;LANG_CODES.es=LANG_ES;LANG_CODES.fr=LANG_FR;LANG_CODES.de=LANG_DE;LANG_CODES.pt=LANG_PT;LANG_CODES.it=LANG_IT;LANG_CODES.ar=LANG_AR;LANG_CODES.hi=LANG_HI;LANG_CODES.tr=LANG_TR;LANG_CODES.id=LANG_ID;LANG_CODES.ja=LANG_JA;LANG_CODES.zh=LANG_ZH;LANG_CODES.be=LANG_RU;LANG_CODES.kk=LANG_RU;LANG_CODES.uk=LANG_RU;LANG_CODES.uz=LANG_RU;var s_bMobile,s_bAudioActive=!0,s_iCntTime=0,s_iTimeElaps=0,s_iPrevTime=0,s_iCntFps=0,s_iCurFps=0,s_bStorageAvailable=!0,s_oDrawLayer,s_oStage,s_oMain,s_oSpriteLibrary,s_oGameSettings,s_bFullscreen=!1,s_aSounds,s_aSoundsInfo,s_iCurLang=LANG_EN,s_szGameID="9MT4HK2D6RCN";s_oMenu=null;s_oInterface=null;var TYPE_LINEAR=0,TYPE_OUT_CUBIC=1,TYPE_IN_CUBIC=2,TYPE_OUT_BACK=3,TYPE_IN_BACK=4;CTLText.prototype={constructor:CTLText,__autofit:function(){if(this._bFitText){for(var n=this._iFontSize;this._oText.getBounds().height>this._iHeight-this._iPaddingV*2||this._oText.getBounds().width>this._iWidth-this._iPaddingH*2;)if(n--,this._oText.font=n+"px "+this._szFont,this._oText.lineHeight=Math.round(n*this._fLineHeightFactor),this.__updateY(),this.__verticalAlign(),n<8)break;this._iFontSize=n}},__verticalAlign:function(){if(this._bVerticalAlign){var n=this._oText.getBounds().height;this._oText.y-=(n-this._iHeight)/2+this._iPaddingV}},__updateY:function(){this._oText.y=this._y+this._iPaddingV;switch(this._oText.textBaseline){case"middle":this._oText.y+=this._oText.lineHeight/2+(this._iFontSize*this._fLineHeightFactor-this._iFontSize)}},__createText:function(n){this._bDebug&&(this._oDebugShape=new createjs.Shape,this._oDebugShape.graphics.beginFill("rgba(255,0,0,0.5)").drawRect(this._x,this._y,this._iWidth,this._iHeight),this._oContainer.addChild(this._oDebugShape));this._oText=new createjs.Text(n,this._iFontSize+"px "+this._szFont,this._szColor);this._oText.textBaseline="middle";this._oText.lineHeight=Math.round(this._iFontSize*this._fLineHeightFactor);this._oText.textAlign=this._szAlign;this._oText.lineWidth=this._bMultiline?this._iWidth-this._iPaddingH*2:null;switch(this._szAlign){case"center":this._oText.x=this._x+this._iWidth/2;break;case"left":this._oText.x=this._x+this._iPaddingH;break;case"right":this._oText.x=this._x+this._iWidth-this._iPaddingH}this._oContainer.addChild(this._oText);this.refreshText(n)},setVerticalAlign:function(n){this._bVerticalAlign=n},setOutline:function(n){this._oText!==null&&(this._oText.outline=n)},setShadow:function(n,t,i,r){this._oText!==null&&(this._oText.shadow=new createjs.Shadow(n,t,i,r))},setColor:function(n){this._oText.color=n},setAlpha:function(n){this._oText.alpha=n},removeTweens:function(){createjs.Tween.removeTweens(this._oText)},getText:function(){return this._oText},getY:function(){return this._y},getFontSize:function(){return this._iFontSize},refreshText:function(n){n===""&&(n=" ");this._oText===null&&this.__createText(n);this._oText.text=n;this._oText.font=this._iFontSize+"px "+this._szFont;this._oText.lineHeight=Math.round(this._iFontSize*this._fLineHeightFactor);this.__autofit();this.__updateY();this.__verticalAlign()}};const NUM_ITEMS_PER_COLS=4;const LANG_WIDTH=78,LANG_HEIGHT=78