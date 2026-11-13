function CCreditsPanel() {

    var _oBg;
    var _oButLogo;
    var _oButExit;
    var _oMsgText;
    var _oMsgTextOutline;

    var _oHitArea;

    var _oLink;
    var _oLinkOutline;

    var _pStartPosExit;

    var _oContainer;
    var _oListener;

    this._init = function () {
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oHitArea.alpha = 0.5;
        _oListener = _oHitArea.on("click", this.unload.bind(this));
        _oHitArea.cursor = "pointer";
        _oContainer.addChild(_oHitArea);

        _oBg = createBitmap(oSpriteBg);
        _oBg.x = CANVAS_WIDTH_HALF;
        _oBg.y = CANVAS_HEIGHT_HALF;
        _oBg.regX = oSpriteBg.width * 0.5;
        _oBg.regY = oSpriteBg.height * 0.5;

        _oContainer.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('but_not');
        _pStartPosExit = {x: CANVAS_WIDTH * 0.5 + 210, y: 330};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, _oContainer);
        _oButExit.setScale(0.4);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);

        _oMsgText = new createjs.Text(TEXT_CREDITS_DEVELOPED, "42px " + PRIMARY_FONT, TEXT_COLOR);
        _oMsgText.textAlign = "center";
        _oMsgText.textBaseline = "alphabetic";
        _oMsgText.x = CANVAS_WIDTH_HALF;
        _oMsgText.y = 400;
        _oContainer.addChild(_oMsgText);

        oSprite = s_oSpriteLibrary.getSprite('logo_ctl');
        _oButLogo = createBitmap(oSprite);
        _oButLogo.regX = oSprite.width / 2;
        _oButLogo.regY = oSprite.height / 2;
        _oButLogo.x = CANVAS_WIDTH_HALF;
        _oButLogo.y = _oMsgText.y + 80;
        _oContainer.addChild(_oButLogo);

        _oLink = new createjs.Text( "www.codethislab.com", "40px " + PRIMARY_FONT, TEXT_COLOR);
        _oLink.textAlign = "center";
        _oLink.textBaseline = "alphabetic";
        _oLink.x = CANVAS_WIDTH_HALF;
        _oLink.y = _oMsgText.y + 260;
        _oContainer.addChild(_oLink);

    };

    this.unload = function () {
        _oHitArea.off("click", _oListener);

        _oButExit.unload();
        _oButExit = null;

        playSound("click", 1, false);

        s_oStage.removeChild(_oContainer);
    };

    

    this._init();


}


