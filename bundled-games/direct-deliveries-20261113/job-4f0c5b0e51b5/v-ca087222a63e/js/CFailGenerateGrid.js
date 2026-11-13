function CFailGenerateGrid(oSpriteBg) {

    var _oBg;
    var _oMsgText;
    var _oHitArea;
    var _oButRestart;
    var _oListener;

    var _oContainer;

    this._init = function (oSpriteBg) {
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.5;
        _oListener = _oHitArea.on("click", function () {});
        _oHitArea.cursor = "pointer";
        _oContainer.addChild(_oHitArea);

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oBg);

        _oMsgText = new CTLText(_oContainer, 
                    CANVAS_WIDTH/2-240, 330, 480, 120, 
                    28, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_FAIL_GENERATION_MATRIX,
                    true, true, true,
                    false );
                    


        _oButRestart = new CGfxButton(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.5 + 100, s_oSpriteLibrary.getSprite('but_restart'), _oContainer);
        _oButRestart.addEventListener(ON_MOUSE_UP, this._onPressButRestart, this);

    };

    this.unload = function () {
        _oHitArea.off("click", _oListener);

        _oButRestart.unload();
        _oButRestart = null;

        playSound("click", 1, false);

        s_oStage.removeChild(_oContainer);
    };

    this._onPressButRestart = function () {
        s_oInterface.unloadFailPanel();
        s_oGame.restartLevel();
    };

    this._init(oSpriteBg);

    return this;
}


