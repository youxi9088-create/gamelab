var MULTIPLAYER_GAME;
var LOGIN_SECTION;
var MULTILANGUAGE_SECTION;
var SHOW_MOREGAMES;
var ALLOW_OUTGOING_LINKS;
class CGUIController {
  static ON_SELECT_LANG = "on_select_lang";
  static ON_GOTO_MAIN_MENU = "on_goto_main_menu";
  static ON_RESTART_GAME = "on_restart_game";
  static ON_BACK_BUTTON = "on_back_button";
  static ON_RESIGN = "on_resign";
  static ON_HELP = "on_help";
  constructor(bMultiplayer = true, bLogin = false, bLang = true, bMoreGames = false, bAllowOutgoing = true) {
    MULTIPLAYER_GAME = bMultiplayer;
    LOGIN_SECTION = bLogin;
    MULTILANGUAGE_SECTION = bLang;
    SHOW_MOREGAMES = bMoreGames;
    ALLOW_OUTGOING_LINKS = bAllowOutgoing;
    this._oEventListener = new CEventsHandler();
    this._szActionCustomButtons = "action-custom-buttons";
    this._szActionConfirmModals = 'action-confirm-modals';
    this._szIdConfirmGotoMenu = "confirm-gotomenu";
    this._szIdConfirmRestart = "confirm-restart";
    this.REMOVE_ADS_SUBSCRIPTION = "remove_ads_subscription";
    this.REMOVE_ADS_DURABLE = "remove_ads_durable";
    this.REMOVE_ADS_NULL = "";
    this._szRemoveAdsType = this.REMOVE_ADS_NULL;
    this._bShowPrivacyBut = false;
    this.GAME_OPTIONS_DIV_ID = "game_options";
    this.DYNAMIC_LOADING;
    this._fRequestFullScreen = null;
    this._fCancelFullScreen = null;
    if (isIOS()) {
      ENABLE_FULLSCREEN = false;
    }
    this._bJoiningRoom;
    this._szRoomID;
    this._szPass;
    this._iWins;
    this._iLosses;
    this._iTotMatches;
    this._iPlayerRanking;
    this._iCurBadgeLevel;
    this._oInfoAccessRoom = null;
    this._oModalController = new CModalController(this);
    if (LANG_LIST) {
      this._checkAvailableLanguages();
    }
    void 0;
    var doc = window.document;
    var docEl = doc.documentElement;
    this._fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    this._fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (MULTILANGUAGE_SECTION) {
      refreshLanguageGUIController();
    }
    var div = document.createElement('div');
    div.className = 'sidebar-menu-container';
    document.body.appendChild(div);
    this.createSideBar();
    this.__modalCallbacks();
    this.__modalsCallbacks();
    this.hideBackButton();
  }
  _checkAvailableLanguages() {
    for (var szKey in TEXT_ORIGINAL_LANGUAGE) {
      if (!LANG_LIST.includes(szKey)) {
        delete TEXT_ORIGINAL_LANGUAGE[szKey];
      }
    }
  }
  createSideBar() {
    var szHtml = '';
    szHtml += '<div id="offcanvas-block" class="offcanvas-block action-toggle-sidebar"></div>';
    szHtml += '<a id="back-btn" class="btn btn-link go-back-btn action-go-back" role="button" aria-controls="goBack"><i class="fa-solid fa-arrow-left"></i></a> ';
    szHtml += "<a id=\"cart-btn\" style=\"display:none\" class=\"cart-btn action-remove-ads\" href=\"#\" role=\"button\"><i class=\"fa-solid fa-cart-shopping\"></i></a>";
    szHtml += '<div class="offcanvas offcanvas-end sidebar-menu" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">';
    szHtml += '<div id="offcanvas-header" class="offcanvas-header p-2" >';
    szHtml += '</div>';
    szHtml += '<div id="offcanvas-body" class="offcanvas-body">';
    szHtml += '<div id="sidebar-settings" class="list-group sidebar-menu-form-check sidebar-menu-button-link">';
    szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-0">' + TEXT_SETTINGS + '</h4>';
    if (MULTILANGUAGE_SECTION) {
      szHtml += '<div id="but-lang" class="cursor-pointer form-check action-show-lang"><div class="row align-items-center">';
      szHtml += '<div class="col col-8" id="sidebar-menu-section-0-0"><i class="fa-solid fa-language icon-start icon-lang"></i><span>' + TEXT_LANGUAGE + '</span></div>';
      szHtml += '<div class="col col-4"><div id="flag-cur-language" class="language-flag bg-' + s_szCurLang + ' " ></div></div></div></div>';
    }
    if (ENABLE_FULLSCREEN) {
      szHtml += this._makeToggle("fullscreen-toggle", TEXT_FULLSCREEN_ON, TEXT_FULLSCREEN_OFF, "fa-solid fa-expand", s_bFullscreen, "action-toggle-fullscreen");
      screenfull.on('change', () => {
        s_bFullscreen = screenfull.isFullscreen;
        this._setToggleValue("fullscreen-toggle", s_bFullscreen);
      });
    }
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      szHtml += this._makeToggle("music-toggle", TEXT_MUSIC_ON, TEXT_MUSIC_OFF, "fa-solid fa-music", s_bMusicActive, "action-toggle-music");
      szHtml += this._makeToggle("sfx-toggle", TEXT_SFX_ON, TEXT_SFX_OFF, "fa-solid fa-volume-high", s_bSfxActive, "action-toggle-sfx");
    }
    var szID = "privacy-but";
    var szText = TEXT_PERSONAL_DATA_MANAGEMENT;
    var szIcon = "fa-solid fa-shield-halved";
    szHtml += "";
    szHtml += '</div>';
    szHtml += '<div class="sidebar-menu-button-link">';
    szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-1">' + TEXT_GAME_OPTION + '</h4>';
    szHtml += '<div id="' + this.GAME_OPTIONS_DIV_ID + '" class="d-grid">';
    var szID = "main-menu-but";
    var szText = TEXT_MAIN_MENU;
    var szIcon = "fa-solid fa-house";
    szHtml += this._makeButton(szID, szText, szIcon, "action-goto-menu");
    var szID = "restart-game-but";
    var szText = TEXT_SB_RESTART;
    var szIcon = "fa-solid fa-arrows-rotate";
    szHtml += this._makeButton(szID, szText, szIcon, "action-restart-game");
    var szID = "help-game-but";
    var szText = TEXT_HELP_GAME_RULE;
    var szIcon = "fa-solid fa-question";
    szHtml += this._makeButton(szID, szText, szIcon, "action-help-game");
    var szID = "report-bugs-but";
    var szText = TEXT_REPORT_BUG;
    var szIcon = "fa-solid fa-bug";
    szHtml += "";
    var szID = "remove-ads-side";
    var szText = TEXT_REMOVE_ADS;
    var szIcon = "fa-solid fa-coins";
    szHtml += "";
    if (isIOS()) {
      var szID = "restore-side";
      var szText = TEXT_SVC_RESTORE;
      var szIcon = "fa-solid fa-clock-rotate-left";
      szHtml += "";
    }
    szHtml += '</div></div>';
    szHtml += '<div id="sidebar-footer" class="sidebar-footer">';
    szHtml += '<div class="row m-0 text-center">';
    szHtml += "<div class=\"col col-6 align-self-center\"><img class=\"ctl-logo \" src=\"ctl_ui/sprites/codethislab-logo-white.png\" alt=\"Code This Lab\">";
    szHtml += '</div>';
    szHtml += '<div class="col col-6 align-self-center action-show-credits">';
    szHtml += '<a href="#" class="text-decoration-none"><i class="fa-solid fa-circle-info icon-start"></i><span>' + TEXT_CREDITS + '</span></a>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '<a class="btn btn-link action-toggle-sidebar toggle-sidebar-btn-top-right" role="button" aria-controls="sidebarMenu" id="toggle-sidebar-btn-top-right">';
    szHtml += '<span class="icon-wrapper">';
    szHtml += '<div class="hamburger hamburger--slider">';
    szHtml += '<div class="hamburger-box">';
    szHtml += '<div class="hamburger-inner hamburger-inner-white"></div>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '<span class="notification-dot notification-dot-hamburger d-none"></span>';
    szHtml += '</span>';
    szHtml += '</a>';
    szHtml += '<a class="btn btn-link action-open-sidebar toggle-sidebar-btn-top-right d-none" role="button" aria-controls="sidebarMenu" id="close-sidebar-btn">';
    szHtml += '<span class="icon-wrapper">';
    szHtml += '<div class="hamburger hamburger--slider is-active close-button">';
    szHtml += '<div class="hamburger-box">';
    szHtml += '<div class="hamburger-inner hamburger-inner-white"></div>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '</span>';
    szHtml += '</a>';
    szHtml += '</div>';
    document.querySelector(".sidebar-menu-container").appendChild(htmlMarkupToNode(szHtml));
    void 0;
    this.refreshSidebarNotificationDot();
  }
  addEventListener(szEvent, cbCompleted, cbOwner, aParams = [], bOnce = false, bApply = false) {
    aParams.unshift(this);
    this._oEventListener.addEventListener(szEvent, cbCompleted, cbOwner, aParams, bOnce, bApply);
  }
  removeEventListener(szEvent, oListenerObj = null) {
    if (oListenerObj) {
      this._oEventListener.removeEventListener(oListenerObj);
    } else {
      this._oEventListener.removeAllEventListeners(szEvent);
    }
  }
  refreshButtonPos() {
    this._setSafeArea();
  }
  _joinRoomAsGuest() {}
  onPlayerInfosRetrieved() {}
  addToSettings(szHtml) {
    document.querySelector("#sidebar-settings").insertAdjacentHTML("beforeend", szHtml);
  }
  addToGameOptions(szHtml) {
    document.querySelector("#" + this.GAME_OPTIONS_DIV_ID).insertAdjacentHTML("beforeend", szHtml);
  }
  _showElement(szID) {
    document.getElementById(szID).classList.remove("d-none");
    this.refreshSidebarNotificationDot();
  }
  _hideElement(szID) {
    document.getElementById(szID).classList.add("d-none");
    this.refreshSidebarNotificationDot();
  }
  showMainMenuBut() {
    this._showElement("main-menu-but");
  }
  hideMainMenuBut() {
    this._hideElement("main-menu-but");
  }
  showRestartBut() {
    this._showElement("restart-game-but");
  }
  hideRestartBut() {
    this._hideElement("restart-game-but");
  }
  showHelpBut() {
    this._showElement("help-game-but");
  }
  hideHelpBut() {
    this._hideElement("help-game-but");
  }
  showResignButton() {
    void 0;
  }
  hideResignButton() {
    void 0;
  }
  showReportBugButton() {
    void 0;
  }
  hideReportBugButton() {
    void 0;
  }
  showBackButton() {
    this._showElement("back-btn");
  }
  hideBackButton() {
    this._hideElement("back-btn");
  }
  showLangButton() {
    document.getElementById("but-lang").classList.remove("d-none");
  }
  hideLangButton() {
    document.getElementById("but-lang").classList.add("d-none");
  }
  showMusicToggle() {
    this._showElement("music-toggle");
  }
  hideMusicToggle() {
    this._hideElement("music-toggle");
  }
  showSFXToggle() {
    this._showElement("sfx-toggle");
  }
  hideSFXToggle() {
    this._hideElement("sfx-toggle");
  }
  __modalCallbacks() {
    var szEvent = "click";
    if (s_bMobile) {
      szEvent = "touchend";
    }
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;
    const MOVE_THRESHOLD = 10;
    if (s_bMobile) {
      document.addEventListener('touchstart', e => {
        const t = e.changedTouches[0];
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchMoved = false;
      }, {
        passive: true
      });
      document.addEventListener('touchmove', e => {
        const t = e.changedTouches[0];
        if (Math.abs(t.clientX - touchStartX) > MOVE_THRESHOLD || Math.abs(t.clientY - touchStartY) > MOVE_THRESHOLD) {
          touchMoved = true;
        }
      }, {
        passive: true
      });
    }
    document.addEventListener(szEvent, e => {
      if (s_bMobile && touchMoved) {
        return;
      }
      var target = e.target;
      while (target && target.parentNode !== document) {
        if (target.classList.contains('action-show-lang')) {
          this._oModalController.createLangPanel();
          return;
        } else if (target.classList.contains('action-select-lang')) {
          this.onChangeLang(target);
          return;
        } else if (target.classList.contains("action-hide-sidebar")) {
          var oOffcanvas = document.getElementById("sidebarMenu");
          oOffcanvas.classList.remove('show');
          return;
        } else if (target.classList.contains("action-toggle-sidebar") || target.classList.contains("hamburger")) {
          this.toggleSideBar();
          return;
        } else if (target.classList.contains("action-go-back")) {
          this._oEventListener.triggerEvent(CGUIController.ON_BACK_BUTTON);
          return;
        } else if (target.classList.contains("action-toggle-music")) {
          this.onToggleMusic();
          return;
        } else if (target.classList.contains("action-toggle-sfx")) {
          this.onToggleSfx();
          return;
        } else if (target.classList.contains("action-toggle-fullscreen")) {
          this.onToggleFullscreen();
          return;
        } else if (target.classList.contains('action-goto-menu')) {
          this._oModalController.createConfirmPanel(this._szIdConfirmGotoMenu, TEXT_ARE_YOU_SURE, this._szActionConfirmModals);
          return;
        } else if (target.classList.contains('action-restart-game')) {
          this._oModalController.createConfirmPanel(this._szIdConfirmRestart, TEXT_ARE_YOU_SURE, this._szActionConfirmModals);
          return;
        } else if (target.classList.contains('action-help-game')) {
          this.onShowHelp();
        } else if (target.classList.contains("action-resign-game")) {
          this.onResign();
          return;
        } else if (target.classList.contains('action-not-confirm-in-modal')) {
          console.log(target.classList);
          return;
        } else if (target.classList.contains('action-show-credits')) {
          this._oModalController.createCreditsPanel();
          return;
        } else if (target.classList.contains(this._szActionCustomButtons)) {
          this.__triggerCustomButtons(target);
        } else if (target.classList.contains(this._szActionConfirmModals)) {
          this.__triggerConfirmModals(target);
        }
        target = target.parentNode;
        if (!target) {
          return;
        }
      }
    });
  }
  __triggerCustomButtons(oTarget) {}
  __triggerConfirmModals(oTarget) {
    switch (oTarget.id) {
      case this._szIdConfirmGotoMenu:
        {
          this.onGotoMenu();
          break;
        }
      case this._szIdConfirmRestart:
        {
          this.onRestartGame();
          break;
        }
    }
  }
  __modalsCallbacks() {
    document.addEventListener('hidden.bs.modal', event => {
      bootstrap.Modal.getInstance(event.target).dispose();
      event.target.remove();
    });
  }
  _setSafeArea() {}
  _setButtonsMarginLeft(iSafeArea) {
    var iPx = 10 + iSafeArea;
    var szPX = iPx + "px";
    document.getElementById("back-btn").style.left = szPX;
  }
  _setButtonsMarginTop(iSafeArea) {
    var iPx = 10 + iSafeArea;
    var szPX = iPx + "px";
    document.getElementById("toggle-sidebar-btn-top-right").style.top = szPX;
    document.getElementById("close-sidebar-btn").style.top = szPX;
    document.getElementById("cart-btn").style.top = szPX;
    document.getElementById("back-btn").style.top = szPX;
  }
  _setSideBarMarginTop(iSafeArea) {
    if (iSafeArea > 0) {
      var iPx = iSafeArea;
      var szPX = iPx + "px";
      document.getElementById("offcanvas-body").style.paddingTop = szPX;
      var iHeight = 55 + iSafeArea;
      document.getElementById("offcanvas-header").style.height = iHeight + "px";
    } else {
      document.getElementById("toggle-sidebar-btn-top-right").style.removeProperty('top');
    }
  }
  _setButtonsMarginRight(iSafeArea) {
    if (iSafeArea > 0) {
      var szPX = iSafeArea + "px";
      const hamburgerBox = document.querySelector('.hamburger-box');
      hamburgerBox.style.right = szPX;
      document.getElementById("close-sidebar-btn").style.right = szPX;
      var iPx = 75 + iSafeArea;
      var szPX = iPx + "px";
      document.getElementById("cart-btn").style.right = szPX;
    }
  }
  _setSideBarMarginRight(iSafeArea) {
    if (iSafeArea > 0) {
      var szPx = iSafeArea;
      var szCalc = szPx + "px";
      document.getElementById("offcanvas-body").style.paddingRight = iSafeArea + "px";
    } else {
      document.getElementById("close-sidebar-btn").style.removeProperty('left');
    }
  }
  _makeButton(szID, szText, szIcon, szAction, bShowDot) {
    var szHtml = "";
    szHtml += '<button id="' + szID + '" type="button" class="btn btn-link text-start sidebar-menu-item ' + szAction + '">';
    szHtml += '<span class="icon-wrapper icon-start">';
    szHtml += '<i class="' + szIcon + ' fa-fw"></i>';
    szHtml += '<span class="notification-dot notification-dot-icon ' + (bShowDot ? '' : 'd-none') + '"></span>';
    szHtml += '</span>';
    szHtml += '<span class="element-label">' + szText + '</span>';
    szHtml += '</button>';
    return szHtml;
  }
  _makeToggle(szID, szTextOn, szTextOff, szIcon, bEnabled, szAction, bShowDot) {
    var szCurrentText = bEnabled ? szTextOn : szTextOff;
    var szHtml = "";
    szHtml += '<button id="' + szID + '" type="button" ' + 'class="cursor-pointer form-check form-switch text-start btn btn-link sidebar-menu-toggle ' + szAction + '" ' + 'data-text-on="' + szTextOn + '" ' + 'data-text-off="' + szTextOff + '">';
    szHtml += '<span class="sidebar-menu-toggle-left">';
    szHtml += '<span class="icon-wrapper icon-start">';
    szHtml += '<i class="' + szIcon + ' fa-fw"></i>';
    szHtml += '<span class="notification-dot notification-dot-icon ' + (bShowDot ? '' : 'd-none') + '"></span>';
    szHtml += '</span>';
    szHtml += '<span class="element-label">' + szCurrentText + '</span>';
    szHtml += '</span>';
    szHtml += '<input class="form-check-input" type="checkbox" ' + 'role="switch" id="' + szID + '_input" ' + (bEnabled ? 'checked' : '') + '>';
    szHtml += '</button>';
    return szHtml;
  }
  refreshSidebarNotificationDot() {
    var oSidebarBtn = document.getElementById("toggle-sidebar-btn-top-right");
    if (!oSidebarBtn) {
      return;
    }
    var aDots = document.querySelectorAll("#sidebarMenu .notification-dot-icon:not(.d-none)");
    var iVisibleDots = 0;
    for (var i = 0; i < aDots.length; i++) {
      var oParentButton = aDots[i].closest("button, a, div");
      if (oParentButton && !oParentButton.classList.contains("d-none")) {
        iVisibleDots++;
      }
    }
    var oMainDot = oSidebarBtn.querySelector(".notification-dot");
    if (!oMainDot) {
      return;
    }
    oMainDot.classList.toggle("d-none", iVisibleDots === 0);
  }
  showNotificationDot(szID, bEnabled) {
    var oDot = document.querySelector("#" + szID + " .notification-dot");
    if (oDot) {
      oDot.classList.toggle("d-none", !bEnabled);
    }
    this.refreshSidebarNotificationDot();
  }
  showSidebarButton() {
    this._showElement("toggle-sidebar-btn-top-right");
  }
  hideSidebarButton() {
    this._hideElement("toggle-sidebar-btn-top-right");
  }
  isSidebarOpen() {
    var oOffcanvas = document.getElementById("sidebarMenu");
    return oOffcanvas !== null && oOffcanvas.classList.contains("show");
  }
  toggleSideBar() {
    var oOffcanvas = document.getElementById("sidebarMenu");
    var oCloseBtn = document.getElementById("close-sidebar-btn");
    var oOpenBtn = document.getElementById("toggle-sidebar-btn-top-right");
    if (oOffcanvas.classList.contains("show")) {
      oOffcanvas.classList.remove('show');
      oOpenBtn.classList.remove("d-none");
      oCloseBtn.classList.add("d-none");
      document.querySelector(".offcanvas-block").classList.remove("show");
      document.querySelector(".action-toggle-sidebar .hamburger").classList.remove("d-none");
    } else {
      oOffcanvas.classList.add('show');
      oOpenBtn.classList.add("d-none");
      oCloseBtn.classList.remove("d-none");
      document.querySelector(".offcanvas-block").classList.add("show");
    }
  }
  onShowHelp() {
    this.toggleSideBar();
    this._oEventListener.triggerEvent(CGUIController.ON_HELP);
  }
  onResign() {
    this.toggleSideBar();
    this._oEventListener.triggerEvent(CGUIController.ON_RESIGN);
  }
  clearAlertTexts() {
    document.getElementById("restore-pwd-alert-text").textContent = "";
    document.getElementById("login-alert-text").textContent = "";
  }
  onPwdRestoreSuccess() {
    this._oModalController.createAlertPanel(TEXT_PWD_RECOVER);
  }
  onPwdRestoreError(szNickname) {
    s_oGuiController.clearAlertTexts();
    if (validateEmail(szNickname)) {
      document.getElementById("restore-pwd-alert-text").textContent = TEXT_EMAIL_NOT_VALID;
    } else {
      document.getElementById("restore-pwd-alert-text").textContent = TEXT_INVALID_USER;
    }
  }
  onLoginPlayer() {
    s_oGuiController._oModalController.removeLoadingPanel();
    var oModal = document.getElementById("loginModal");
    bootstrap.Modal.getInstance(oModal).hide();
  }
  onRegisterPlayer() {
    s_oGuiController._oModalController.removeLoadingPanel();
    var oModal = document.getElementById("registerModal");
    bootstrap.Modal.getInstance(oModal).hide();
  }
  onChangeLang(target) {
    target = target.firstChild;
    var szClass = target.classList[1];
    var aTmp = szClass.split("bg-");
    var szFlag = aTmp[1];
    var oModal = document.getElementById("languageModal");
    bootstrap.Modal.getInstance(oModal).hide();
    document.getElementById("flag-cur-language").classList.remove('bg-' + s_szCurLang);
    s_szCurLang = szFlag;
    refreshLanguage();
    refreshLanguageGUIController();
    this.refreshMenuLanguage();
    this._oEventListener.triggerEvent(CGUIController.ON_SELECT_LANG);
    document.getElementById("flag-cur-language").classList.add('bg-' + s_szCurLang);
  }
  refreshMenuLanguage() {
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-0").innerHTML = TEXT_SETTINGS;
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-0 span").innerHTML = TEXT_LANGUAGE;
    if (ENABLE_FULLSCREEN) {
      this._refreshToggleText("fullscreen-toggle", TEXT_FULLSCREEN_ON, TEXT_FULLSCREEN_OFF);
    }
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      this._refreshToggleText("music-toggle", TEXT_MUSIC_ON, TEXT_MUSIC_OFF);
      this._refreshToggleText("sfx-toggle", TEXT_SFX_ON, TEXT_SFX_OFF);
    }
    void 0;
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-1").innerHTML = TEXT_GAME_OPTION;
    this._refreshElementText("main-menu-but", TEXT_MAIN_MENU);
    this._refreshElementText("restart-game-but", TEXT_SB_RESTART);
    this._refreshElementText("help-game-but", TEXT_HELP_GAME_RULE);
    void 0;
    if (this._szRemoveAdsType) {
      void 0;
      if (isIOS()) {
        void 0;
      }
    }
    document.querySelector(".sidebar-menu-container .action-show-credits span").innerHTML = TEXT_CREDITS;
  }
  _refreshElementText(szID, szText) {
    var oElement = document.getElementById(szID);
    var span = oElement.querySelector(".element-label");
    if (span) {
      span.innerHTML = szText;
    }
  }
  _refreshToggleText(szID, szTextOn, szTextOff) {
    var toggle = document.getElementById(szID);
    toggle.dataset.textOn = szTextOn;
    toggle.dataset.textOff = szTextOff;
    var chk = toggle.querySelector('input[type="checkbox"]');
    var szText = chk && chk.checked ? szTextOn : szTextOff;
    this._refreshElementText(szID, szText);
  }
  _setToggleValue(szID, bVal) {
    var toggle = document.getElementById(szID);
    if (!toggle) {
      return;
    }
    var chk = toggle.querySelector('input[type="checkbox"]');
    if (chk) {
      chk.checked = bVal;
    }
    this._refreshToggleText(szID, toggle.dataset.textOn, toggle.dataset.textOff);
  }
  onToggleFullscreen() {
    if (s_bFullscreen) {
      this._fCancelFullScreen.call(window.document);
    } else {
      this._fRequestFullScreen.call(window.document.documentElement);
    }
    sizeHandler();
  }
  onToggleMusic() {
    muteAllMusic(s_bMusicActive);
    s_bMusicActive = !s_bMusicActive;
    this._setToggleValue("music-toggle", s_bMusicActive);
  }
  onToggleSfx() {
    muteAllSfx(s_bSfxActive);
    s_bSfxActive = !s_bSfxActive;
    this._setToggleValue("sfx-toggle", s_bSfxActive);
  }
  onGotoMenu() {
    const modalEl = document.getElementById("confirmModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    this._oEventListener.triggerEvent(CGUIController.ON_GOTO_MAIN_MENU);
    this.toggleSideBar();
  }
  onRestartGame() {
    const modalEl = document.getElementById("confirmModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    this._oEventListener.triggerEvent(CGUIController.ON_RESTART_GAME);
    this.toggleSideBar();
  }
  getRanking() {
    return this._iPlayerRanking;
  }
  getWinMatches() {
    return this._iWins;
  }
  getLossMatches() {
    return this._iLosses;
  }
  getTotMatches() {
    return this._iTotMatches;
  }
  getBadgeLevel() {
    return this._iCurBadgeLevel;
  }
  getRoomAccess() {
    return this._oInfoAccessRoom;
  }
}