function CEndPanel(oSpriteBg) {
  var _oBg;
  var _oTitleText;
  var _oTotScore;
  var _oTotScore;
  var _oGroup;
  var _oButMenu;
  var _oButRestart;
  var _oButContinue;
  var _oFade;
  this._init = function (oSpriteBg) {
    var iSizeFontSecondaryText = 46;
    _oFade = new createjs.Shape();
    _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    _oFade.alpha = 0.0;
    s_oStage.addChild(_oFade);
    _oGroup = new createjs.Container();
    _oGroup.alpha = 1;
    _oGroup.visible = false;
    _oGroup.y = CANVAS_HEIGHT;
    _oBg = createBitmap(oSpriteBg);
    _oBg.x = CANVAS_WIDTH_HALF;
    _oBg.y = CANVAS_HEIGHT_HALF;
    _oBg.regX = oSpriteBg.width * 0.5;
    _oBg.regY = oSpriteBg.height * 0.5;
    _oGroup.addChild(_oBg);
    _oTitleText = new CTLText(_oGroup, CANVAS_WIDTH / 2 - 240, CANVAS_HEIGHT_HALF - 180, 480, 50, 50, "center", "#fff", PRIMARY_FONT, 1, 0, 0, " ", true, true, false, false);
    _oTotScore = new CTLText(_oGroup, CANVAS_WIDTH / 2 - 240, CANVAS_HEIGHT_HALF - 70, 480, iSizeFontSecondaryText, iSizeFontSecondaryText, "center", "#fff", PRIMARY_FONT, 1, 0, 0, " ", true, true, false, false);
    var oSpriteButRestart = s_oSpriteLibrary.getSprite("but_restart");
    _oButRestart = new CGfxButton(CANVAS_WIDTH * 0.5 - 180, CANVAS_HEIGHT * 0.5 + 110, oSpriteButRestart, _oGroup);
    _oButRestart.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
    _oButRestart.pulseAnimation();
    var oSpriteButHome = s_oSpriteLibrary.getSprite("but_home");
    _oButMenu = new CGfxButton(CANVAS_WIDTH * 0.5 + 180, CANVAS_HEIGHT * 0.5 + 110, oSpriteButHome, _oGroup);
    _oButMenu.addEventListener(ON_MOUSE_DOWN, this._onExit, this);
    var oSpriteButContinue = s_oSpriteLibrary.getSprite("but_continue");
    _oButContinue = new CGfxButton(CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.5 + 110, oSpriteButContinue, _oGroup);
    _oButContinue.addEventListener(ON_MOUSE_DOWN, this._onContinue, this);
    s_oStage.addChild(_oGroup);
  };
  this.unload = function () {
    if (_oButMenu) {
      _oButMenu.unload();
      _oButMenu = null;
    }
    if (_oButRestart) {
      _oButRestart.unload();
      _oButRestart = null;
    }
    _oFade.removeAllEventListeners();
    s_oStage.removeChild(_oGroup, _oFade);
  };
  this.show = function (iScore) {
    _oTitleText.refreshText(TEXT_WIN);
    _oTotScore.refreshText(TEXT_TOTAL_SCORE + ": " + iScore);
    _oGroup.visible = true;
    createjs.Tween.get(_oFade).to({
      alpha: 0.5
    }, 500, createjs.Ease.cubicOut);
    createjs.Tween.get(_oGroup).wait(250).to({
      y: 0
    }, 1250, createjs.Ease.bounceOut).call(function () {});
    void 0;
    void 0;
  };
  this._onContinue = function () {
    this.createFade(this.onUnloadContinue);
  };
  this.createFade = function (oFunction) {
    var oFade = new createjs.Shape();
    oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    oFade.alpha = 0.0;
    s_oStage.addChild(oFade);
    var oParent = this;
    createjs.Tween.get(oFade).to({
      alpha: 1
    }, 750, createjs.Ease.cubicOut).call(function () {
      s_oStage.removeChild(oFade);
      oFunction(oParent);
    });
  };
  this._onRestart = function () {
    this.createFade(this.onUnloadRestart);
  };
  this.onUnloadRestart = function (oParent) {
    oParent.unload();
    s_oGame.restartLevel();
  };
  this.onUnloadContinue = function (oParent) {
    oParent.unload();
    s_oGame.unload();
    s_oMain.gotoLevelMenu();
    void 0;
    void 0;
    void 0;
    setVolume("soundtrack", 1);
  };
  this.onUnloadExit = function (oParent) {
    oParent.unload();
    s_oGame.onExit();
  };
  this._onExit = function () {
    this.createFade(this.onUnloadExit);
  };
  this._init(oSpriteBg);
  return this;
}