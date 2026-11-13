function CWordCell(iRow, iCol, iX, iY, oParentContainer, szstate, iScale, iID) {
    var _iRow;
    var _iCol;
    var _iScale;
    var _iState;
    var _iID;

    var _oContainer = oParentContainer;

    var _bActive = false;

    var _szValue;
    var _aAlphabet = s_aJSONWords.alphabet;

    var _oWordCell;
    var _oWordCellText;
    var _oHitArea;
    var _oRectPos;

    this._init = function (iRow, iCol, iX, iY, szstate, iScale, iID) {
        _iRow = iRow;
        _iCol = iCol;

        _iScale = iScale;
        _iID = iID;

        _szValue = szstate;
        _iState = null;

        _oWordCellText = new createjs.Text("", SIZE_TEXT_CELL + "px " + SECONDARY_FONT, TEXT_WORD_COLOR);
        _oWordCellText.x = iX;
        _oWordCellText.y = iY + 5;
        _oWordCellText.textAlign = "center";
        _oWordCellText.textBaseline = "alphabet";
        _oWordCellText.lineWidth = 500;
        _oWordCellText.scaleX = _oWordCellText.scaleY = _iScale;
        _oContainer.addChild(_oWordCellText);

        var oSprite = s_oSpriteLibrary.getSprite('hit_area_cell');
        _oHitArea = new CGfxButton(iX, iY, oSprite, _oContainer);
        _oHitArea.addEventListener(ON_MOUSE_DOWN, this._onCellClicked, this);
        _oHitArea.regX = oSprite.width / 2;
        _oHitArea.regY = oSprite.height / 2;
        _oContainer.addChild(_oHitArea.getButtonImage());

    };

    this.isActive = function () {
        return _bActive;
    };

    this.changeCellState = function (bState) {
        _oWordCell.gotoAndStop("selected_" + bState);
    };

    this.getID = function () {
        return _iID;
    };

    this.changeCellText = function (szChar) {
        _oWordCellText.text = szChar;
    };

    this.checkInPlace = function (szChar) {
        if (_oWordCellText.text === "" || _oWordCellText.text === szChar) {
            return true;
        }
        return false;
    };

    this.getChar = function () {
        return _oWordCellText.text;
    };

    this.setRecOffset = function (oOffset) {
        _oRectPos = new createjs.Rectangle(oOffset.x + _oHitArea.getX() - 25, oOffset.y + _oHitArea.getY() - 25,
                oOffset.x + _oHitArea.getX() + 5, oOffset.y + _oHitArea.getY() + 5);
    };

    this.setRandomChar = function (iChar) {
        if (_oWordCellText.text === "") {
            _oWordCellText.text = _aAlphabet[iChar];
        }
    };

    this._onCellClicked = function () {
        s_oGame.onCellSelected(this, _iRow, _iCol);
    };

    this.setActive = function (bVal) {
        _bActive = bVal;
    };

    this.getX = function () {
        return iX;
    };

    this.getY = function () {
        return iY;
    };

    this.getValue = function () {
        return _szValue;
    };

    this.getState = function () {
        return _iState;
    };

    this.changeTextColor = function (szColor) {
        _oWordCellText.color = szColor;
    };

    this.getRotation = function () {
        return _oWordCell.rotation;
    };

    this.getRow = function () {
        return _iRow;
    };

    this.getCol = function () {
        return _iCol;
    };

    this.getRectPos = function () {
        return _oRectPos;
    };

    this.unload = function () {
        _oHitArea.unload();
        _oHitArea = null;
        _oContainer.removeChild(_oWordCell);
    };


    this._init(iRow, iCol, iX, iY, szstate, iScale, iID);

    return this;

}