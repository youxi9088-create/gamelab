function CGame(oData, oCategory) {
  var _pStartPosGridContainer;
  var _oBg;
  var _oInterface;
  var _oLastCell;
  var _oDirection;
  var _oContainerGrid;
  var _oLastWordCoord;
  var _iRow;
  var _iCol;
  var _iDirection;
  var _iMaxWordLengthAccepted;
  var _iCellHeight;
  var _iCellWidth;
  var _iHalfCellWidth;
  var _iHalfCellHeight;
  var _szCatName;
  var _szCurWord;
  var _aWords;
  var _aSelectedWords;
  var _aWordSelectedPosition;
  var _aWordsFounded;
  var _aLineDrawing;
  var _aWrittenWords;
  var _aGrid;
  var _aCellsSelected;
  var _aSelectableCells;
  var _bNoCellSelected = true;
  var _bFinish = false;
  var _bPause;
  var _fTime;
  var _oListenerPressUp;
  var _oListenerPressMove;
  this._init = function () {
    _bPause = true;
    _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
    s_oStage.addChild(_oBg);
    _szCurWord = "";
    _szCatName = oCategory.cat_name;
    _aWords = oCategory.words;
    _iRow = oCategory.rows;
    _iCol = oCategory.cols;
    _aGrid = new Array();
    _aSelectedWords = new Array();
    _aWordSelectedPosition = new Array();
    _aWordsFounded = new Array();
    _aCellsSelected = new Array();
    _aSelectableCells = new Array();
    _aWrittenWords = new Array();
    _aLineDrawing = new Array();
    this._createGrid();
    _oLastCell = {
      r: 0,
      c: 0
    };
    _oDirection = {
      r: 0,
      c: 0
    };
    _fTime = 0;
    _oInterface = new CInterface();
    this.controlWords();
    this.fillGridAttempts();
    for (var i = 0; i < _aWords.length; i++) {
      _aLineDrawing[i] = null;
    }
    _aWords.sort();
    _oInterface.spawnWords(_aWords);
    _oInterface.createHelpPanel();
    _oListenerPressUp = s_oStage.on("pressup", this._onStageRelease);
    setVolume("soundtrack", 0.3);
  };
  this.restartLevel = function () {
    _bPause = false;
    _bFinish = false;
    this.unloadGrid();
    _aSelectedWords = new Array();
    _aWordSelectedPosition = new Array();
    _aWordsFounded = new Array();
    _aCellsSelected = new Array();
    _aSelectableCells = new Array();
    _aWrittenWords = new Array();
    _aGrid = new Array();
    for (var i = 0; i < _aWords.length; i++) {
      _aLineDrawing[i] = null;
    }
    this._createGrid();
    this.clearCharGridCell();
    this.deleteAllLineDraw();
    this.fillGridAttempts();
    _fTime = 0;
    this.time();
    _oInterface.createFade();
    _oInterface.refreshButtonPos(s_iOffsetX, s_iOffsetY);
    _oInterface.destroyAllLineDrawWordsGuessed();
  };
  this.unloadGrid = function () {
    for (var r = 0; r < _iRow; r++) {
      for (var c = 0; c < _iCol; c++) {
        _aGrid[r][c].unload();
      }
    }
    _aGrid = null;
    s_oStage.removeChild(_oContainerGrid);
  };
  this.deleteAllLineDraw = function () {
    for (var i = 0; i < _aWrittenWords.length; i++) {
      s_oStage.removeChild(_aLineDrawing[i]);
      _aLineDrawing[i] = null;
    }
  };
  this.setPause = function (bVal) {
    _bPause = bVal;
  };
  this.refreshPositionContainerGrid = function (iNewY) {
    _oContainerGrid.y = _pStartPosGridContainer.y + iNewY;
    this.setRectCells();
  };
  this._createGrid = function () {
    _oContainerGrid = new createjs.Container();
    s_oStage.addChild(_oContainerGrid);
    _iCellWidth = parseInt(GRID_AREA_SIZE / _iCol);
    _iCellHeight = parseInt(GRID_AREA_SIZE / _iRow);
    _iHalfCellWidth = _iCellWidth / 2;
    _iHalfCellHeight = _iCellHeight / 2;
    for (var i = 0; i < _aWords.length; i++) {
      _aSelectedWords.push("");
    }
    var iID = 0;
    for (var r = 0; r < _iRow; r++) {
      _aGrid[r] = new Array();
      for (var c = 0; c < _iCol; c++) {
        _aGrid[r][c] = new CWordCell(r, c, START_X_GRID + c * _iCellWidth + _iHalfCellWidth, START_Y_GRID + r * _iCellHeight + _iHalfCellHeight, _oContainerGrid, "hide", GRID_AREA_SIZE / _iCol / CELL_SIZE.width, iID);
        iID++;
      }
    }
    _oContainerGrid.x = 0;
    _oContainerGrid.y = -_oContainerGrid.getBounds().height - 10;
    var oSpriteBg = s_oSpriteLibrary.getSprite("game_panel");
    var oBgGrid = createBitmap(oSpriteBg);
    oBgGrid.x = 35;
    oBgGrid.y = _oContainerGrid.getBounds().height + 220;
    _oContainerGrid.addChild(oBgGrid);
    _oContainerGrid.setChildIndex(oBgGrid, 0);
    _pStartPosGridContainer = {
      x: _oContainerGrid.x,
      y: _oContainerGrid.y
    };
    this.setRectCells();
  };
  this.onContinue = function () {
    this.unload();
    setVolume("soundtrack", 1);
    s_oMain.gotoLevelMenu();
    void 0;
    void 0;
  };
  this.fillGridAttempts = function () {
    var bRet = false;
    var iCont = 0;
    do {
      bRet = this.fillGrid();
      iCont++;
    } while (bRet === false && iCont < 1000);
    if (!bRet) {
      _oInterface.createFailGridPanel();
      _bPause = true;
    }
  };
  this.setRectCells = function () {
    for (var r = 0; r < _iRow; r++) {
      for (var c = 0; c < _iCol; c++) {
        _aGrid[r][c].setRecOffset({
          x: _oContainerGrid.x,
          y: _oContainerGrid.y
        });
      }
    }
  };
  this._onExitHelp = function () {
    this.setPause(false);
    void 0;
    _oInterface.unloadHelpPanel();
  };
  this.controlWords = function () {
    if (_iRow > MAX_NUM_OF_COL_AND_ROW || _iCol > MAX_NUM_OF_COL_AND_ROW) {
      return;
    }
    if (_iRow < _iCol) {
      _iMaxWordLengthAccepted = _iRow - 1;
    } else {
      _iMaxWordLengthAccepted = _iCol - 1;
    }
  };
  this.orderWordsDescendant = function () {
    var swapped = false;
    do {
      swapped = false;
      for (var i = 0; i < _aWords.length - 1; i++) {
        if (_aWords[i].length < _aWords[i + 1].length) {
          var temp = _aWords[i];
          _aWords[i] = _aWords[i + 1];
          _aWords[i + 1] = temp;
          swapped = true;
        }
      }
    } while (swapped);
  };
  this.onExit = function () {
    s_oGame.unload();
    s_oMain.gotoMenu();
    void 0;
    void 0;
    void 0;
    setVolume("soundtrack", 1);
  };
  this.unload = function () {
    _oInterface.unload();
    s_oStage.off("pressup", _oListenerPressUp);
    s_oStage.off("pressmove", _oListenerPressMove);
    for (var i = 0; i < _iRow; i++) {
      for (var j = 0; j < _iCol; j++) {
        _aGrid[i][j].unload();
      }
    }
    _aGrid = null;
    createjs.Tween.removeAllTweens();
    s_oStage.removeAllChildren();
  };
  this.onCellSelected = function (oCellSelected) {
    if (_bNoCellSelected) {
      _bNoCellSelected = false;
      _aCellsSelected.push(oCellSelected);
      oCellSelected.setActive(true);
      _szCurWord += oCellSelected.getChar();
      _iDirection = ALL_DIRECTION;
      if (_aLineDrawing[_aWrittenWords.length] === null) {
        var oLineDrawing;
        oLineDrawing = new createjs.Shape();
        oLineDrawing.graphics.setStrokeStyle(STROKE_DIMENSION, "round");
        oLineDrawing.graphics.beginStroke(COLOR_STROKE);
        oLineDrawing.graphics.moveTo(oCellSelected.getX(), oCellSelected.getY());
        oLineDrawing.graphics.lineTo(oCellSelected.getX(), oCellSelected.getY() - 2);
        _aLineDrawing[_aWrittenWords.length] = oLineDrawing;
        _aLineDrawing[_aWrittenWords.length].mouseEnabled = false;
        _oContainerGrid.addChild(_aLineDrawing[_aWrittenWords.length]);
      }
      _oListenerPressMove = s_oStage.on("pressmove", this._onPressMove);
    }
  };
  this.drawLine = function (iX, iY) {
    _aLineDrawing[_aWrittenWords.length].graphics.clear();
    _aLineDrawing[_aWrittenWords.length].graphics.setStrokeStyle(STROKE_DIMENSION, "round", "round");
    _aLineDrawing[_aWrittenWords.length].graphics.beginStroke(COLOR_STROKE);
    _aLineDrawing[_aWrittenWords.length].graphics.moveTo(_aCellsSelected[0].getX(), _aCellsSelected[0].getY());
    _aLineDrawing[_aWrittenWords.length].graphics.lineTo(iX, iY);
  };
  this.fillGrid = function () {
    this.clearCharGridCell();
    var aPossibleDirs = [LEFT, RIGHT, UP, DOWN, UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT];
    var bSucceded = this.placeFirstWordInRandomPos(_aWords[0], aPossibleDirs);
    if (!bSucceded) {
      return false;
    }
    var iDir;
    for (var i = 1; i < _aWords.length; i++) {
      var aPossibleInsert = new Array();
      aPossibleDirs = shuffle(aPossibleDirs);
      var bFound = false;
      for (var j = 0; j < aPossibleDirs.length; j++) {
        iDir = aPossibleDirs[j];
        var oResult;
        switch (iDir) {
          case LEFT:
            oResult = this.searchAFreePosition(placeWordsLeft, _aWords[i], _aGrid);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case RIGHT:
            oResult = this.searchAFreePosition(placeWordsRight, _aWords[i], _aGrid, _iCol);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case UP:
            oResult = this.searchAFreePosition(placeWordsUp, _aWords[i], _aGrid);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case DOWN:
            oResult = this.searchAFreePosition(placeWordsDown, _aWords[i], _aGrid, _iRow);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case UP_LEFT:
            oResult = this.searchAFreePosition(placeWordsUpLeft, _aWords[i], _aGrid);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case UP_RIGHT:
            oResult = this.searchAFreePosition(placeWordsUpRight, _aWords[i], _aGrid, _iCol);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case DOWN_LEFT:
            oResult = this.searchAFreePosition(placeWordsDownLeft, _aWords[i], _aGrid, _iRow);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
          case DOWN_RIGHT:
            oResult = this.searchAFreePosition(placeWordsDownRight, _aWords[i], _aGrid, _iRow, _iCol);
            if (oResult.success) {
              aPossibleInsert.push(oResult);
              bFound = true;
            }
            break;
        }
        if (j === aPossibleDirs.length - 1) {
          if (!bFound) {
            return false;
          }
        }
      }
      this.searchWordWithMinWeight(aPossibleInsert);
    }
    for (var r = 0; r < _iRow; r++) {
      for (var c = 0; c < _iCol; c++) {
        if (_aGrid[r][c].getChar() === "") {
          _aGrid[r][c].setRandomChar(Math.floor(Math.random() * s_aJSONWords.alphabet.length));
        }
      }
    }
    return true;
  };
  this.searchWordWithMinWeight = function (aPossibleInsert) {
    var iMin = aPossibleInsert[0].list[0].weight;
    var oMinWeightWord = aPossibleInsert[0].list[0];
    for (var i = 0; i < aPossibleInsert.length; i++) {
      for (var j = 0; j < aPossibleInsert[i].list.length; j++) {
        if (iMin > aPossibleInsert[i].list[j].weight) {
          oMinWeightWord = aPossibleInsert[i].list[j];
          iMin = aPossibleInsert[i].list[j].weight;
        }
      }
    }
    this.insertWordOnGrid(oMinWeightWord);
  };
  this.insertWordOnGrid = function (oWord) {
    var szColor = this.getRandomColor();
    for (var i = 0; i < oWord.list_cell.length; i++) {
      var oInfo = oWord.list_cell[i];
      _aGrid[oInfo.r][oInfo.c].changeCellText(oInfo.char);
      if (SHOW_SOLUTION) _aGrid[oInfo.r][oInfo.c].changeTextColor(szColor);
    }
  };
  this.getRandomColor = function () {
    var iRandR = Math.floor(Math.random() * 127 + 128) - 128;
    var iRandG = Math.floor(Math.random() * 127 + 128) - 128;
    var iRandB = Math.floor(Math.random() * 127 + 128) - 128;
    return "rgba(" + iRandR + "," + iRandG + "," + iRandB + ",1)";
  };
  this.searchAFreePosition = function (oFunctionDir, szWord) {
    var aInfo = new Array();
    var bAlmostOneSuccess = false;
    for (var i = 0; i < _aGrid.length; i++) {
      for (var j = 0; j < _aGrid[i].length; j++) {
        var oResult = oFunctionDir(szWord, i, j, _aGrid);
        if (oResult.success) {
          aInfo.push(oResult);
          bAlmostOneSuccess = true;
        }
      }
    }
    return {
      list: aInfo,
      success: bAlmostOneSuccess
    };
  };
  this.clearCharGridCell = function () {
    for (var i = 0; i < _aGrid.length; i++) {
      for (var j = 0; j < _aGrid[i].length; j++) {
        _aGrid[i][j].changeCellText("");
      }
    }
  };
  this.placeFirstWordInRandomPos = function (szWord, aPossibleDirs) {
    var iRandRow = Math.floor(Math.random() * _iRow);
    var iRandCol = Math.floor(Math.random() * _iCol);
    var iChar = 0;
    aPossibleDirs = shuffle(aPossibleDirs);
    var iDir;
    for (var j = 0; j < aPossibleDirs.length; j++) {
      iDir = aPossibleDirs[j];
      switch (iDir) {
        case LEFT:
          if (iRandCol - szWord.length > -1) {
            for (var j = iRandCol; j > iRandCol - szWord.length; j--) {
              _aGrid[iRandRow][j].changeCellText(szWord.charAt(iChar));
              iChar++;
            }
            return true;
          }
          break;
        case RIGHT:
          if (iRandCol + szWord.length < _iCol + 1) {
            for (var j = iRandCol; j < iRandCol + szWord.length; j++) {
              _aGrid[iRandRow][j].changeCellText(szWord.charAt(iChar));
              iChar++;
            }
            return true;
          }
          break;
        case UP:
          if (iRandRow - szWord.length > -1) {
            for (var i = iRandRow; i > iRandRow - szWord.length; i--) {
              _aGrid[i][iRandCol].changeCellText(szWord.charAt(iChar));
              iChar++;
            }
            return true;
          }
          break;
        case DOWN:
          if (iRandRow + szWord.length < _iRow + 1) {
            for (var i = iRandRow; i < iRandRow + szWord.length; i++) {
              _aGrid[i][iRandCol].changeCellText(szWord.charAt(iChar));
              iChar++;
            }
            return true;
          }
          break;
        case UP_LEFT:
          var iTmpCol = iRandCol;
          if (iRandRow - szWord.length > -1 && iRandCol - szWord.length > 0) {
            for (var i = iRandRow; i > iRandRow - szWord.length; i--) {
              _aGrid[i][iTmpCol].changeCellText(szWord.charAt(iChar));
              iTmpCol--;
              iChar++;
            }
            return true;
          }
        case UP_RIGHT:
          var iTmpCol = iRandCol;
          if (iRandRow - szWord.length > -1 && iRandCol + szWord.length < _iCol) {
            for (var i = iRandRow; i > iRandRow - szWord.length; i--) {
              _aGrid[i][iTmpCol].changeCellText(szWord.charAt(iChar));
              iTmpCol++;
              iChar++;
            }
            return true;
          }
          break;
        case DOWN_LEFT:
          var iTmpCol = iRandCol;
          if (iRandRow + szWord.length < _iRow + 1 && iRandCol - szWord.length > 0) {
            for (var i = iRandRow; i < iRandRow + szWord.length; i++) {
              _aGrid[i][iTmpCol].changeCellText(szWord.charAt(iChar));
              iTmpCol--;
              iChar++;
            }
            return true;
          }
          break;
        case DOWN_RIGHT:
          var iTmpCol = iRandCol;
          if (iRandRow + szWord.length < _iRow + 1 && iRandCol + szWord.length < _iCol) {
            for (var i = iRandRow; i < iRandRow + szWord.length; i++) {
              _aGrid[i][iTmpCol].changeCellText(szWord.charAt(iChar));
              iTmpCol++;
              iChar++;
            }
            return true;
          }
          break;
      }
    }
    return false;
  };
  this._onPressMove = function (evt) {
    s_oGame.lineDrawing(evt.stageX / s_iScaleFactor - _oContainerGrid.x, evt.stageY / s_iScaleFactor - _oContainerGrid.y);
    var iCurStageX;
    var iCurStageY;
    if (_aLineDrawing[_aWrittenWords.length] !== null) {
      iCurStageX = _aLineDrawing[_aWrittenWords.length].graphics.command.x + _oContainerGrid.x;
      iCurStageY = _aLineDrawing[_aWrittenWords.length].graphics.command.y + _oContainerGrid.y - 2;
    } else {
      iCurStageX = evt.stageX / s_iScaleFactor;
      iCurStageY = evt.stageY / s_iScaleFactor;
    }
    for (var i = 0; i < _iRow; i++) {
      for (var j = 0; j < _iCol; j++) {
        s_oGame.dirByMouse(evt.stageX / s_iScaleFactor, evt.stageY / s_iScaleFactor, i, j);
        if (_aGrid[i][j].isActive() === false && pointInRectangle(iCurStageX, iCurStageY, _aGrid[i][j].getRectPos())) {
          s_oGame.onCellOver(_aGrid[i][j]);
          break;
        }
      }
    }
  };
  this.dirByMouse = function (iX, iY, iR, iC) {
    if (pointInRectangle(iX, iY, _aGrid[iR][iC].getRectPos())) {
      _iDirection = s_oGame.directionCell(_aCellsSelected[0], _aGrid[iR][iC]);
      return;
    }
  };
  this.onCellOver = function (oCellSelected) {
    if (_bNoCellSelected) {
      return;
    }
    _oLastWordCoord = {
      r: oCellSelected.getRow(),
      c: oCellSelected.getCol()
    };
    _aCellsSelected.push(oCellSelected);
  };
  this.lineDrawing = function (iX, iY) {
    if (_aLineDrawing[_aWrittenWords.length] === null) {
      return;
    }
    var iXOffset = iX;
    var iYOffset = iY;
    switch (_iDirection) {
      case LEFT:
      case RIGHT:
      case UP:
      case DOWN:
      case UP_LEFT:
      case UP_RIGHT:
      case DOWN_LEFT:
      case DOWN_RIGHT:
        var oLinePos = this.constrainLineDrawAngle(_aCellsSelected[0].getX(), _aCellsSelected[0].getY(), iXOffset, iYOffset);
        this.drawLine(oLinePos.x, oLinePos.y - 2);
        break;
      case ALL_DIRECTION:
        this.drawLine(iXOffset, iYOffset);
        break;
    }
  };
  this.directionCell = function (oPrevCell, oNextCell) {
    if (oPrevCell === "undefined") {
      return;
    }
    var oPosPrevCell = {
      x: oPrevCell.getX(),
      y: oPrevCell.getY()
    };
    var oPosThisCell = {
      x: oNextCell.getX(),
      y: oNextCell.getY()
    };
    return directionNextCell(oPosPrevCell, oPosThisCell);
  };
  this.constrainLineDrawAngle = function (iXStart, iYStart, iXMouse, iYMouse) {
    var iX = iXMouse - iXStart;
    var iY = iYMouse - iYStart;
    var fR = Math.sqrt(iX * iX + iY * iY);
    var fAngle = Math.atan2(iY, iX) / Math.PI * 180;
    fAngle = fAngle % 360 + 180;
    if (fAngle <= 22.5 || fAngle >= 337.5) {
      fAngle = 0;
    } else if (fAngle <= 67.5) {
      fAngle = 45;
    } else if (fAngle <= 112.5) {
      fAngle = 90;
    } else if (fAngle <= 157.5) {
      fAngle = 135;
    } else if (fAngle <= 202.5) {
      fAngle = 180;
    } else if (fAngle <= 247.5) {
      fAngle = 225;
    } else if (fAngle <= 292.5) {
      fAngle = 270;
    } else if (fAngle < 337.5) {
      fAngle = 315;
    }
    fAngle -= 180;
    var fCosx = fR * Math.cos(fAngle * Math.PI / 180);
    var fSinx = fR * Math.sin(fAngle * Math.PI / 180);
    return {
      x: fCosx + iXStart,
      y: fSinx + iYStart
    };
  };
  this._onStageRelease = function () {
    s_oStage.off("pressmove", _oListenerPressMove);
    if (_bNoCellSelected) {
      return;
    }
    _bNoCellSelected = true;
    s_oGame._onCheckWord();
  };
  this.deleteALineDraw = function (iID) {
    _aLineDrawing[iID].graphics.clear();
    s_oStage.removeChild(_aLineDrawing[iID]);
    _aLineDrawing[iID] = null;
  };
  this._onCheckWord = function () {
    if (_oLastWordCoord === undefined) {
      this.deleteALineDraw(_aWrittenWords.length);
      this._clearMatrix();
      return;
    }
    var oPosLine = this.checkWord();
    if (_szCurWord.length < 2) {
      this.deleteALineDraw(_aWrittenWords.length);
      this._clearMatrix();
      playSound("wrong", 1, false);
      return;
    }
    var iWordPos;
    var iRes = -1;
    for (var j = 0; j < _aWords.length; j++) {
      if (_aWords[j] === _szCurWord) {
        iRes = 1;
        iWordPos = j;
        break;
      }
    }
    if (iRes === -1) {
      this._clearMatrix();
      this.deleteALineDraw(_aWrittenWords.length);
      playSound("wrong", 1, false);
      return;
    }
    //WORD FOUND
    var bFound = false;
    for (var k = 0; k < _aWrittenWords.length; k++) {
      if (_aWrittenWords[k] === _szCurWord) {
        bFound = true;
        this.deleteALineDraw(_aWrittenWords.length);
        playSound("wrong", 1, false);
        break;
      }
    }
    if (!bFound) {
      this.drawLine(oPosLine.x, oPosLine.y);
      _aLineDrawing[_aWrittenWords.length].graphics.endStroke();
      _aWrittenWords.push(_szCurWord);
      _oInterface.drawLineOnWord(iWordPos);
      this.checkFinishWordList();
      playSound("guessed", 1, false);
    }
    this._clearMatrix();
  };
  this.checkFinishWordList = function () {
    if (_aWrittenWords.length === _aWords.length) {
      var iScore = BONUS_TIME / 60 - _fTime / 60;
      _oInterface.createWinPanel(Math.floor(iScore));
      playSound("game_completed", 1, false);
      _bFinish = true;
    }
  };
  this.checkWord = function () {
    var oLinePos = _aLineDrawing[_aWrittenWords.length].graphics.command;
    var iRow = _aCellsSelected[0].getRow();
    var iCol = _aCellsSelected[0].getCol();
    var iXOffset = _aCellsSelected[0].getX() + _oContainerGrid.x;
    var iYOffset = _aCellsSelected[0].getY() + _oContainerGrid.y;
    var oPosLine;
    var fPrecision = 0.07;
    switch (_iDirection) {
      case LEFT:
        for (var j = iCol; j > _oLastWordCoord.c - 1; j--) {
          for (var iX = oLinePos.x; iX < iXOffset; iX += CELL_SIZE.width * fPrecision) {
            if (_aGrid[iRow][j].isActive() === false && pointInRectangle(iX, iYOffset, _aGrid[iRow][j].getRectPos())) {
              _szCurWord += _aGrid[iRow][j].getChar();
              _aGrid[iRow][j].setActive(true);
              oPosLine = {
                x: _aGrid[iRow][j].getX(),
                y: _aGrid[iRow][j].getY()
              };
              break;
            }
          }
        }
        break;
      case RIGHT:
        for (var j = iCol; j < _oLastWordCoord.c + 1; j++) {
          for (var iX = oLinePos.x; iX > iXOffset; iX -= CELL_SIZE.width * fPrecision) {
            if (_aGrid[iRow][j].isActive() === false && pointInRectangle(iX, iYOffset, _aGrid[iRow][j].getRectPos())) {
              _szCurWord += _aGrid[iRow][j].getChar();
              _aGrid[iRow][j].setActive(true);
              oPosLine = {
                x: _aGrid[iRow][j].getX(),
                y: _aGrid[iRow][j].getY()
              };
              break;
            }
          }
        }
        break;
      case UP:
        for (var i = iRow; i > _oLastWordCoord.r - 1; i--) {
          for (var iY = oLinePos.y + _oContainerGrid.y; iY < iYOffset; iY += CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iCol].isActive() === false && pointInRectangle(iXOffset, iY, _aGrid[i][iCol].getRectPos())) {
              _szCurWord += _aGrid[i][iCol].getChar();
              _aGrid[i][iCol].setActive(true);
              oPosLine = {
                x: _aGrid[i][iCol].getX(),
                y: _aGrid[i][iCol].getY()
              };
              break;
            }
          }
        }
        break;
      case DOWN:
        for (var i = iRow; i < _oLastWordCoord.r + 1; i++) {
          for (var iY = oLinePos.y + _oContainerGrid.y; iY > iYOffset; iY -= CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iCol].isActive() === false && pointInRectangle(iXOffset, iY, _aGrid[i][iCol].getRectPos())) {
              _szCurWord += _aGrid[i][iCol].getChar();
              _aGrid[i][iCol].setActive(true);
              oPosLine = {
                x: _aGrid[i][iCol].getX(),
                y: _aGrid[i][iCol].getY()
              };
              break;
            }
          }
        }
        break;
      case UP_LEFT:
        var iC = iCol;
        for (var i = iRow; i > _oLastWordCoord.r - 1; i--) {
          var iX = oLinePos.x;
          for (var iY = oLinePos.y + _oContainerGrid.y; iY < iYOffset; iY += CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iC].isActive() === false && pointInRectangle(iX, iY, _aGrid[i][iC].getRectPos())) {
              _szCurWord += _aGrid[i][iC].getChar();
              _aGrid[i][iC].setActive(true);
              oPosLine = {
                x: _aGrid[i][iC].getX(),
                y: _aGrid[i][iC].getY()
              };
              break;
            }
            iX += CELL_SIZE.width * fPrecision;
          }
          iC--;
          if (iC < 0) {
            break;
          }
        }
        break;
      case UP_RIGHT:
        var iC = iCol;
        for (var i = iRow; i > _oLastWordCoord.r - 1; i--) {
          var iX = oLinePos.x;
          for (var iY = oLinePos.y + _oContainerGrid.y; iY < iYOffset; iY += CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iC].isActive() === false && pointInRectangle(iX, iY, _aGrid[i][iC].getRectPos())) {
              _szCurWord += _aGrid[i][iC].getChar();
              _aGrid[i][iC].setActive(true);
              oPosLine = {
                x: _aGrid[i][iC].getX(),
                y: _aGrid[i][iC].getY()
              };
              break;
            }
            iX -= CELL_SIZE.width * fPrecision;
          }
          iC++;
          if (iC > _iCol - 1) {
            break;
          }
        }
        break;
      case DOWN_RIGHT:
        var iC = iCol;
        for (var i = iRow; i < _oLastWordCoord.r + 1; i++) {
          var iX = oLinePos.x;
          for (var iY = oLinePos.y + _oContainerGrid.y; iY > iYOffset; iY -= CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iC].isActive() === false && pointInRectangle(iX, iY, _aGrid[i][iC].getRectPos())) {
              _szCurWord += _aGrid[i][iC].getChar();
              _aGrid[i][iC].setActive(true);
              oPosLine = {
                x: _aGrid[i][iC].getX(),
                y: _aGrid[i][iC].getY()
              };
              break;
            }
            iX -= CELL_SIZE.width * fPrecision;
          }
          iC++;
          if (iC > _iCol - 1) {
            break;
          }
        }
        break;
      case DOWN_LEFT:
        var iC = iCol;
        for (var i = iRow; i < _oLastWordCoord.r + 1; i++) {
          var iX = oLinePos.x;
          for (var iY = oLinePos.y + _oContainerGrid.y; iY > iYOffset; iY -= CELL_SIZE.height * fPrecision) {
            if (_aGrid[i][iC].isActive() === false && pointInRectangle(iX, iY, _aGrid[i][iC].getRectPos())) {
              _szCurWord += _aGrid[i][iC].getChar();
              _aGrid[i][iC].setActive(true);
              oPosLine = {
                x: _aGrid[i][iC].getX(),
                y: _aGrid[i][iC].getY()
              };
              break;
            }
            iX += CELL_SIZE.width * fPrecision;
          }
          iC--;
          if (iC < 0) {
            break;
          }
        }
        break;
    }
    return oPosLine;
  };
  this._clearMatrix = function () {
    for (var i = 0; i < _iRow; i++) {
      for (var j = 0; j < _iCol; j++) {
        _aGrid[i][j].setActive(false);
      }
    }
    _aCellsSelected = new Array();
    _bNoCellSelected = true;
    _szCurWord = "";
  };
  this.time = function () {
    _fTime += FPS_TIME;
    var iHours = Math.floor(_fTime / 3600) % 99;
    var iMinute = Math.floor(_fTime / 60) % 60;
    var iSeconds = Math.floor(_fTime) % 60;
    _oInterface.refreshTime(iHours, iMinute, iSeconds);
  };
  this.update = function () {
    if (_bPause === false) {
      if (!_bFinish) {
        this.time();
      }
      _oInterface.refreshFPSText(Math.floor(createjs.Ticker.getMeasuredFPS()));
    }
  };
  s_oGame = this;
  BONUS_TIME = oData.bonus_time;
  this._init();
}
var s_oGame;