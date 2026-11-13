function CMenu() {
    var _oBg;
    var _oButPlay;
    var _oButCredits;
    var _oFade;
    var _oAudioToggle;
    var _oCreditsPanel;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;

    this._init = function () {
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSpritePlay = s_oSpriteLibrary.getSprite('but_play');
        _oButPlay = new CGfxButton((CANVAS_WIDTH / 2), CANVAS_HEIGHT / 2 + 250, oSpritePlay);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('icon_audio');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.width / 2) + 15, y: (oSprite.height / 2) + 15};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }
        
       

        var oSprite = s_oSpriteLibrary.getSprite('but_info');
        _pStartPosCredits = {x: (oSprite.width / 2) + 15, y: (oSprite.height / 2) + 15};
        _oButCredits = new CGfxButton(_pStartPosCredits.x, _pStartPosCredits.y, oSprite);
        _oButCredits.addEventListener(ON_MOUSE_UP, this._onCredits, this);
        
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 15,y:oSprite.height/2 + 15};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            s_oStage.removeChild(_oFade);
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.unload = function () {
        _oButPlay.unload();
        _oButPlay = null;

        s_oStage.removeChild(_oBg);
        _oBg = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        createjs.Tween.removeAllTweens();
        
        s_oMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
        _oButCredits.setPosition(_pStartPosCredits.x + iNewX, _pStartPosCredits.y + iNewY);
    };
    
    this._onCredits = function () {
        _oCreditsPanel = new CCreditsPanel();
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onButPlayRelease = function () {
        this.unload();
        var iLangSelected = parseInt(DEFAULT_LANG);
        if(DEFAULT_LANG === "none" || isNaN(DEFAULT_LANG) || iLangSelected<0 || iLangSelected>5){
            s_oMain.gotoLanguageMenu();
        }else{
            new window["CLang"+DEFAULT_LANG];
            if(DEFAULT_CAT === "none" || DEFAULT_CAT <1 || DEFAULT_CAT > s_aJSONWords.categories.length){
                s_oMain.gotoLevelMenu();
            }else{
                s_oMain.gotoGame(s_aJSONWords.categories[DEFAULT_CAT-1]);
            }
        }
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.isEnabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };
    
    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };
    
    s_oMenu = this;

    this._init();
}

var s_oMenu = null;