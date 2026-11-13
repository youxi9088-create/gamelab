function CAreYouSurePanel(oParentContainer) {
    var _oMsgBox;
    var _oMsg;
    var _oButYes;
    var _oButNo;
    var _oContainer;
    var _oParentContainer;
    var _oBg;
    var _oLogo;

    this._init = function () {
        _oContainer = new createjs.Container();
        _oContainer.alpha = 0;
        _oContainer.visible = false;

        _oParentContainer.addChild(_oContainer);

        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));

        _oContainer.on("click", function () {});

        _oContainer.addChild(_oBg);

        var oSpriteLogoSmall = s_oSpriteLibrary.getSprite("logo_small");
        _oLogo = new CLogo(oSpriteLogoSmall.width * 0.5 + 15, oSpriteLogoSmall.height * 0.5 + 15, oSpriteLogoSmall, _oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oMsgBox = createBitmap(oSpriteBg);
        _oMsgBox.x = CANVAS_WIDTH_HALF;
        _oMsgBox.y = CANVAS_HEIGHT_HALF;
        _oMsgBox.regX = oSpriteBg.width * 0.5;
        _oMsgBox.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oMsgBox);

        _oMsg = new CTLText(_oContainer, 
                    CANVAS_WIDTH/2-200, 320, 400, 160, 
                    80, "center", TEXT_COLOR, PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_ARE_SURE,
                    true, true, true,
                    false );
                    

        _oButYes = new CGfxButton(CANVAS_WIDTH / 2 + 150, CANVAS_HEIGHT * 0.5 + 110, s_oSpriteLibrary.getSprite('but_yes'), _oContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        _oButNo = new CGfxButton(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT * 0.5 + 110, s_oSpriteLibrary.getSprite('but_not'), _oContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);

         this.refreshPosLogo(s_iOffsetX, s_iOffsetY);
    };

    this.show = function () {
        s_oGame.setPause(true);
        _oContainer.visible = true;
        createjs.Tween.get(_oContainer).to({alpha: 1}, 300, createjs.quartOut).call(function () {
            createjs.Ticker.paused = true;
        });
    };

    this.refreshPosLogo = function (iNewX, iNewY) {
        var oPosLogo = _oLogo.getStartPos();
        _oLogo.setPosition(oPosLogo.x + iNewX, oPosLogo.y + iNewY);
    };

    this._onButYes = function () {
        s_oGame.setPause(false);
        createjs.Ticker.paused = false;
        s_oGame.onExit();
        _oContainer.removeAllEventListeners();
    };

    this.unload = function () {
        createjs.Tween.get(_oContainer).to({alpha: 0}, 300, createjs.quartOut).call(function () {
            _oParentContainer.removeChild(_oContainer);
        });
    };

    this._onButNo = function () {
        createjs.Ticker.paused = false;
        s_oGame.setPause(false);
        s_oInterface.unloadAreYouSure();
        _oContainer.removeAllEventListeners();
    };

    _oParentContainer = oParentContainer;

    this._init();
}