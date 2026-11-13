function CLanguageMenu() {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFullscreen;
    
    var _oSelLangText;
    var _oSelLangCont;
    var _oBg;
    var _oFade;
    var _oAudioToggle;
    var _oButExit;
    var _oLogo;
    var _aButFlag;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        _aButFlag = new Array();

        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(_oBg);

        var oSpriteLogoSmall = s_oSpriteLibrary.getSprite("logo_small");

        _oLogo = new CLogo(oSpriteLogoSmall.width * 0.5 + 15, oSpriteLogoSmall.height * 0.5 + 15, oSpriteLogoSmall, s_oStage);

        _oSelLangText = new CTLText(s_oStage, 
                    CANVAS_WIDTH/2-250, CANVAS_HEIGHT * 0.5 - 280, 500, 65, 
                    65, "center", TEXT_COLOR_2, PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_SELECT_LANG,
                    true, true, false,
                    false );
                    


        var iXOffset = 180;
        var iYOffset = 194;

        for (var i = 0; i < NUM_OF_LANGUAGE; i++, iXOffset += 285) {
            if (i % 2 === 0) {
                iXOffset = 180;
                iYOffset += 162;
            }

            var oSpriteFlag = s_oSpriteLibrary.getSprite("flag_" + i);
            _aButFlag.push(this.createFlagButton(iXOffset, iYOffset, oSpriteFlag, i));
        }

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 15, y: (oSprite.height / 2) + 15};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _pStartPosAudio = {x: _oButExit.getX() - oSprite.width - 15, y: (oSprite.height / 2) + 15};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, s_oSpriteLibrary.getSprite('icon_audio'), s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 15,y:oSprite.height/2 + 15};
        }else{
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosExit.x - oSprite.width/2 - 15, y: (oSprite.height / 2) + 15};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x, _pStartPosFullscreen.y, oSprite, s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, 1000).call(function () {
            s_oStage.removeChild(_oFade);
            _oFade = null;
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };

    this.createFlagButton = function (iX, iY, oSprite, iID) {
        var oButFlag = new CGfxButton(iX, iY, oSprite, s_oStage);
        oButFlag.addEventListenerWithParams(ON_MOUSE_UP, this._onButPlayRelease, this, iID);
        return oButFlag;
    };

    this.unload = function () {
        _oSelLangCont = null;

        for (var i = 0; i < NUM_OF_LANGUAGE; i++) {
            _aButFlag[i].unload();
        }

        _aButFlag = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButExit = null;
        s_oStage.removeAllChildren();

        s_oLanguageMenu = null;
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX,_pStartPosFullscreen.y + iNewY);
        }

        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);

        var oPosLogo = _oLogo.getStartPos();
        _oLogo.setPosition(oPosLogo.x + iNewX, oPosLogo.y + iNewY);
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        this.unload();
        s_oMain.gotoMenu();
    };

    this._onButPlayRelease = function (_iLang) {
        this.unload();
        
        
        new window["CLang"+_iLang];
        if(DEFAULT_CAT === "none" || DEFAULT_CAT <1 || DEFAULT_CAT > s_aJSONWords.categories.length){
                s_oMain.gotoLevelMenu();
            }else{
                s_oMain.gotoGame(s_aJSONWords.categories[DEFAULT_CAT-1]);
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

    s_oLanguageMenu = this;

    this._init();
}

var s_oLanguageMenu = null;



