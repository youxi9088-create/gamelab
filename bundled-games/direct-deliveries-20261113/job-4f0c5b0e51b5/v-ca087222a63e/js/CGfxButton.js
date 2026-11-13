function CGfxButton(iXPos, iYPos, oSprite, oParentContainer) {

    var _iScaleY;
    var _iScaleX;

    var _aCbCompleted;
    var _aCbOwner;
    var _aParams = [];
    var _oButton;
    var _oTween;
    var _oParent;
    var _oParentContainer;
    var _bBlock;
    var _oListenerPressDown;
    var _oListenerPressUp;

    this._init = function (iXPos, iYPos, oSprite, oParentContainer) {

        _iScaleX = 1;
        _iScaleY = 1;

        _aCbCompleted = new Array();
        _aCbOwner = new Array();

        _oButton = createBitmap(oSprite);
        _oButton.x = iXPos;
        _oButton.y = iYPos;

        _oButton.regX = oSprite.width / 2;
        _oButton.regY = oSprite.height / 2;

        if (!s_bMobile)
            _oButton.cursor = "pointer";

        if (_oParentContainer) {
            _oParentContainer.addChild(_oButton);
        } else {
            s_oStage.addChild(_oButton);
        }

        _bBlock = false;

        this._initListener();
    };

    this.unload = function () {
        _oButton.off("mousedown", _oListenerPressDown);
        _oButton.off("pressup", _oListenerPressUp);
        createjs.Tween.removeTweens(_oButton);
        
        if (_oParentContainer) {
            _oParentContainer.removeChild(_oButton);
        } else {
            s_oStage.removeChild(_oButton);
        }
    };

    this.setVisible = function (bVisible) {
        _oButton.visible = bVisible;
    };

    this._initListener = function () {
        _oListenerPressDown = _oButton.on("mousedown", this.buttonDown);
        _oListenerPressUp = _oButton.on("pressup", this.buttonRelease);
    };

    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.addEventListenerWithParams = function (iEvent, cbCompleted, cbOwner, aParams) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };

    this.buttonRelease = function () {

        if (_bBlock) {
            return;
        }
        
        playSound("click", 1, false);
        _oButton.scaleX = _iScaleX;
        _oButton.scaleY = _iScaleY;

        if (_aCbCompleted[ON_MOUSE_UP]) {
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP], _aParams);
        }
    };

    this.buttonDown = function () {

        if (_bBlock) {
            return;
        }

        _oButton.scaleX = _iScaleX * 0.9;
        _oButton.scaleY = _iScaleY * 0.9;

        if (_aCbCompleted[ON_MOUSE_DOWN]) {
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN], _aParams);
        }
    };

    this.setScale = function (iValue) {
        _iScaleX = iValue;
        _iScaleY = iValue;
        _oButton.scaleX = iValue;
        _oButton.scaleY = iValue;
    };

    this.setScaleX = function (iValue) {
        _iScaleX = iValue;
        _oButton.scaleX = iValue;
    };

    this.setPosition = function (iXPos, iYPos) {
        _oButton.x = iXPos;
        _oButton.y = iYPos;
    };

    this.setX = function (iXPos) {
        _oButton.x = iXPos;
    };

    this.setY = function (iYPos) {
        _oButton.y = iYPos;
    };

    this.getButtonImage = function () {
        return _oButton;
    };

    this.getX = function () {
        return _oButton.x;
    };

    this.getY = function () {
        return _oButton.y;
    };

    this.block = function (bVal) {
        _bBlock = bVal;
    };

    this.pulseAnimation = function () {
        createjs.Tween.get(_oButton,{loop:-1}).to({scaleX: _iScaleX * 0.9, scaleY: _iScaleY * 0.9}, 850, createjs.Ease.quadOut).to({scaleX: _iScaleX, scaleY: _iScaleY}, 650, createjs.Ease.quadIn);
    };

    _oParentContainer = oParentContainer;

    _oParent = this;

    this._init(iXPos, iYPos, oSprite, oParentContainer);

    return this;
}