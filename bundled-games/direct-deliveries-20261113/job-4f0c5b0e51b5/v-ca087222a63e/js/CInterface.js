function CInterface() {
    var _oAudioToggle;
    var _pStartPosPause;
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosFps;
    var _pStartPosContainerWord;
    var _pStartPosFullscreen;
    
    var _oButPause;
    var _oButExit;
    var _oContainerWord;
    var _oLevelText;
    var _oFPSText;
    var _oPause = null;
    var _oEndPanel;
    var _aWordsText;
    var _oFailPanel;
    var _oTimeBoard;
    var _oWordsPanel;
    var _oHelpPanel;
    var _oAreYouSure = null;
    var _aLineWordMarked;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    this._init = function () {
        var oButtonX;

        _pStartPosContainerWord = {x: 0, y: 115};

        _oContainerWord = new createjs.Container();
        s_oStage.addChild(_oContainerWord);
        _oContainerWord.x = _pStartPosContainerWord.x;
        _oContainerWord.y = _pStartPosContainerWord.y;

        var oSpriteBgWords = s_oSpriteLibrary.getSprite("word_panel");
        _oWordsPanel = createBitmap(oSpriteBgWords);
        _oWordsPanel.x = oSpriteBgWords.width * 0.1 - 20;
        _oWordsPanel.y = -oSpriteBgWords.height * 0.5 + 20;
        _oContainerWord.addChild(_oWordsPanel);

        _aWordsText = new Array();
        _aLineWordMarked = new Array();

        var oSpriteExit = s_oSpriteLibrary.getSprite('but_exit');
        oButtonX = CANVAS_WIDTH - (oSpriteExit.width / 2) - 15;
        _pStartPosExit = {x: oButtonX, y: (oSpriteExit.height / 2) + 15};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSpriteExit);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSpritePause = s_oSpriteLibrary.getSprite('but_pause');
        oButtonX -= (oSpritePause.width) + 15;
        _pStartPosPause = {x: oButtonX, y: (oSpritePause.height / 2) + 15};
        _oButPause = new CGfxButton(_pStartPosPause.x, _pStartPosPause.y, oSpritePause);
        _oButPause.addEventListener(ON_MOUSE_UP, this._onButPauseRelease, this);


        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('icon_audio');
            oButtonX -= (oSprite.width / 2) + 15;
            _pStartPosAudio = {x: oButtonX, y: (oSprite.height / 2) + 15};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 10,y:oSprite.height/2 + 15};
        }else{
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x: _pStartPosPause.x - oSprite.width/2 - 15, y: (oSprite.height / 2) + 15};
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
        
        _pStartPosFps = {x: CANVAS_WIDTH_HALF - 50, y: CANVAS_HEIGHT_HALF - 450};
        _oFPSText = this.createText(_pStartPosFps.x, _pStartPosFps.y, "FPS:", 20, "left", "middle", 400);
        //s_oStage.addChild(_oFPSText);

        var oSpriteBoard = s_oSpriteLibrary.getSprite("time_board");

        _oTimeBoard = new CTimeBoard(oSpriteBoard, 15, 15);

        this.createFade();

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    };


    this.createFade = function () {
        var oFade = new createjs.Shape();
        oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        oFade.alpha = 1;

        s_oStage.addChild(oFade);

        createjs.Tween.get(oFade).to({alpha: 0}, 1000, createjs.Ease.cubicOut).call(function () {
            s_oStage.removeChild(oFade);
        });

    };

    this.destroyAllLineDrawWordsGuessed = function () {
        for (var i = 0; i < _aLineWordMarked.length; i++) {
            _oContainerWord.removeChild(_aLineWordMarked[i]);
        }
        _aLineWordMarked = new Array();
    };

    this.createHelpPanel = function () {
        var oSpriteBg = s_oSpriteLibrary.getSprite("msg_box");
        _oHelpPanel = new CHelpPanel(oSpriteBg);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, _pStartPosAudio.y + iNewY);
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX,_pStartPosFullscreen.y + iNewY);
        }
        
        _oButPause.setPosition(_pStartPosPause.x - iNewX, _pStartPosPause.y + iNewY);
        _oButExit.setPosition(_pStartPosExit.x - iNewX, _pStartPosExit.y + iNewY);

        _oFPSText.y = _pStartPosFps.y + iNewY;

        _oContainerWord.y = _pStartPosContainerWord.y + iNewY;

        var oPosTime = _oTimeBoard.getStartPosition();
        _oTimeBoard.setPosition(oPosTime.x + iNewX, oPosTime.y + iNewY);

        if (_oPause !== null) {
            _oPause.refreshPosLogo(iNewX, iNewY);
        }
        
        if (_oAreYouSure !== null) {
            _oAreYouSure.refreshPosLogo(iNewX, iNewY);
        }
        
        s_oGame.refreshPositionContainerGrid(iNewY);
    };

    this.unloadHelpPanel = function () {
        _oHelpPanel.unload();
    };

    this.createText = function (iX, iY, szText, iSize, szTextAlign, szTextBaseline, iLineWidth) {
        var oText = new createjs.Text(szText, iSize + "px " + PRIMARY_FONT, TEXT_COLOR);
        oText.x = iX;
        oText.y = iY;
        oText.textAlign = szTextAlign;
        oText.textBaseline = szTextBaseline;
        oText.lineWidth = iLineWidth;

        return oText;
    };

    this.spawnWords = function (aWords) {
        var iXStart = EDGEBOARD_X * 2 + 15;
        var iX = iXStart;
        var iY = SPAWN_WORDS_OFFSET_Y;
        for (var i = 0; i < aWords.length; i++) {
            _aWordsText.push(new createjs.Text(aWords[i], " 20px " + SECONDARY_FONT, TEXT_COLOR));
            _aWordsText[i].x = iX;
            _aWordsText[i].y = iY;
            _aWordsText[i].textAlign = "left";
            _aWordsText[i].textBaseline = "middle";
            _aWordsText[i].lineWidth = 400;
            if (_aWordsText[i].x + _aWordsText[i].getBounds().width > CANVAS_WIDTH - iXStart) {
                iX = iXStart;
                iY += _aWordsText[i].getBounds().height + OFFSET_Y_SPACE_WORDS_LIST;
                _aWordsText[i].x = iX;
                _aWordsText[i].y = iY;
            }
            _oContainerWord.addChild(_aWordsText[i]);
            iX += _aWordsText[i].getBounds().width + 15;
            if (iX > CANVAS_WIDTH - iXStart - _aWordsText[i].getBounds().width) {
                iX = iXStart;
                iY += _aWordsText[i].getBounds().height + OFFSET_Y_SPACE_WORDS_LIST;
            }
        }
        _oContainerWord.x = _pStartPosContainerWord.x;
    };

    this.drawLineOnWord = function (iID) {
        var oLine;
        oLine = new createjs.Shape();
        oLine.graphics.setStrokeStyle(STROKE_DIMENSION_MARKED, "round", "round");
        oLine.graphics.beginStroke(COLOR_STROKE_MARKED);
        oLine.graphics.moveTo(_aWordsText[iID].x, _aWordsText[iID].y);
        oLine.graphics.lineTo(_aWordsText[iID].x + _aWordsText[iID].getBounds().width, _aWordsText[iID].y);
        oLine.graphics.closePath();
        _aLineWordMarked.push(oLine);
        _oContainerWord.addChild(oLine);
    };

    this.refreshFPSText = function (iVal) {
        _oFPSText.text = "FPS:" + iVal;
    };

    this.createWinPanel = function (iScore) {
        var oSpriteMsgBox = s_oSpriteLibrary.getSprite("msg_box");
        _oEndPanel = new CEndPanel(oSpriteMsgBox);
        _oEndPanel.show(iScore);
    };

    this._onButReturnToMenuRelease = function () {
        s_oGame.onExit();
    };

    this._onButPauseRelease = function () {
        _oPause = new CPause();
    };

    this.numLevel = function (iLevel) {
        var iLv = iLevel + 1;
        _oLevelText.text = TEXT_LEVEL_UPPERCASE + "\n" + iLv;
    };

    this.unloadPause = function () {
        _oPause.unload();
        _oPause = null;
    };

    this.createFailGridPanel = function () {
        var oSpriteMsgBox = s_oSpriteLibrary.getSprite("msg_box");
        _oFailPanel = new CFailGenerateGrid(oSpriteMsgBox);
    };

    this.unloadFailPanel = function () {
        _oFailPanel.unload();
        _oFailPanel = null;
    };

    this.unload = function () {

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButExit = null;

        _oButPause.unload();
        _oButPause = null;

        s_oInterface = null;

    };

    this.refreshTime = function (iHours, iMinute, iSeconds) {
        var szHours = iHours.toString();
        var szMinute = iMinute.toString();
        var szSeconds = iSeconds.toString();

        szHours = this.checkIfAddZero(szHours);
        szMinute = this.checkIfAddZero(szMinute);
        szSeconds = this.checkIfAddZero(szSeconds);

        _oTimeBoard.refresh(szHours + ":" + szMinute + ":" + szSeconds);
    };

    this.checkIfAddZero = function (szTime) {
        var szText = szTime;
        if (szText.length < 2) {
            szText = "0" + szTime;
        }
        return szText;
    };

    this._onExit = function () {
        _oAreYouSure = new CAreYouSurePanel(s_oStage);
        _oAreYouSure.show();
    };

    this.unloadAreYouSure = function () {
        _oAreYouSure.unload();
        _oAreYouSure = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
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
    
    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;