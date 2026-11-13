function CLogo(iX, iY, oSprite, oParentContainer) {

    var _pStartPosLogo;
    var _oLogo;
    var _oParentContainer;

    this._init = function (iX, iY, oSprite) {
        
        _pStartPosLogo = {x: iX, y: iY};
        _oLogo = createBitmap(oSprite);
        _oLogo.x = _pStartPosLogo.x;
        _oLogo.y = _pStartPosLogo.y;
        _oLogo.regX = oSprite.width * 0.5;
        _oLogo.regY = oSprite.height * 0.5;

        _oParentContainer.addChild(_oLogo);
    };

    this.setPosition = function (iX, iY) {
        _oLogo.x = iX;
        _oLogo.y = iY;
    };

    this.getStartPos = function () {
        return _pStartPosLogo;
    };

    this.unload = function () {
        _oParentContainer.removeChild(_oLogo);
    };

    _oParentContainer = oParentContainer;

    this._init(iX, iY, oSprite);
    
    return this;
}