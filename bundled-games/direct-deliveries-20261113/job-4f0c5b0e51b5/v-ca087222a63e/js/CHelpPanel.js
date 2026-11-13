function CHelpPanel(oSprite) {
    var _oHelpBg;
    var _oGroup;
    var _oFade;
    var _oGroup;
    var _oButContinue;
    var _oHelpImg;
    var _bClick = false;

    this._init = function (oSprite) {
        _oHelpBg = createBitmap(oSprite);
        _oHelpBg.x = CANVAS_WIDTH * 0.5;
        _oHelpBg.y = CANVAS_HEIGHT * 0.5;
        _oHelpBg.regX = oSprite.width * 0.5;
        _oHelpBg.regY = oSprite.height * 0.5;

        _oGroup = new createjs.Container();

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;

        _oGroup.addChild(_oFade);

        _oGroup.addChild(_oHelpBg);

        s_oStage.addChild(_oGroup);

        this.page1(_oGroup);

        _oGroup.on("pressup", function () {
            s_oHelpPanel._onExitHelp();
        }, null, true);

        if (!s_bMobile)
            _oGroup.cursor = "pointer";
    };

    this.page1 = function (oContainer) {

        var oTextMatch = new CTLText(oContainer, 
                    CANVAS_WIDTH/2-240, CANVAS_HEIGHT * 0.5 - 180, 480, 44, 
                    44, "center", "#fff", PRIMARY_FONT, 1,
                    0, 0,
                    TEXT_SUMMARY,
                    true, true, false,
                    false );


        var oTextExplain = new CTLText(oContainer, 
                    CANVAS_WIDTH/2-240, CANVAS_HEIGHT * 0.5 - 100, 480, 100, 
                    26, "center", TEXT_COLOR, SECONDARY_FONT, 1,
                    0, 0,
                    TEXT_HELP,
                    true, true, true,
                    false );
                    


        var oSpriteImgHelp = s_oSpriteLibrary.getSprite("img_help");

        _oHelpImg = createBitmap(oSpriteImgHelp);
        _oHelpImg.x = CANVAS_WIDTH_HALF - 100;
        _oHelpImg.y = CANVAS_HEIGHT_HALF + 108;
        _oHelpImg.regX = oSpriteImgHelp.width * 0.5;
        _oHelpImg.regY = oSpriteImgHelp.height * 0.5;

        oContainer.addChild(_oHelpImg);

        createjs.Tween.get(oContainer).to({alpha: 1}, 300, createjs.Ease.cubicOut);

        var oSpriteContinue = s_oSpriteLibrary.getSprite("but_continue");

        _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5 + 180, CANVAS_HEIGHT * 0.5 + 110, oSpriteContinue, oContainer);
        _oButContinue.addEventListener(ON_MOUSE_UP, this._onExitHelp, this);
        _oButContinue.pulseAnimation();

        s_oStage.addChild(oContainer);
    };


    this.unload = function () {
        s_oStage.removeChild(_oGroup);
        s_oHelpPanel = null;
        _oButContinue.unload();
        _oButContinue = null;
    };

    this._onExitHelp = function () {
        if (_bClick) {
            return;
        }
        _oGroup.removeAllEventListeners();
        _bClick = true;

        createjs.Tween.get(_oGroup).to({alpha: 0}, 300, createjs.Ease.cubicOut).call(function () {
            s_oGame._onExitHelp();
        });
    };

    s_oHelpPanel = this;

    this._init(oSprite);

}

var s_oHelpPanel = null;