var MULTIPLAYER_GAME = true;
var LOGIN_SECTION = false;
var MULTILANGUAGE_SECTION = true;
var SHOW_MOREGAMES = false;
class CGUIController {
  static ON_SELECT_LANG = "on_select_lang";
  static ONtext_featGOTO_MAIN_MENU = "on_goto_main_menu";
  static ON_RESTART_GAME = "on_restart_game";
  static ON_BACK_BUTTON = "on_back_button";
  constructor(bMultiplayer = true, bLogin = false, bLang = true, bMoreGames = false) {
    MULTIPLAYER_GAME = bMultiplayer;
    LOGIN_SECTION = bLogin;
    MULTILANGUAGE_SECTION = bLang;
    SHOW_MOREGAMES = bMoreGames;
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
    this.LEADERBOARD_GROUP_ID = "ranking";
    this.NUM_LEADERBOARD_ROWS = 8;
    this.LEADERBOARD_DAY = 0;
    this.LEADERBOARD_MONTH = 1;
    this.LEADERBOARD_GENERAL = 2;
    this.GAME_OPTIONS_DIV_ID = "game_options";
    this.DYNAMIC_LOADING = true;
    this.BADGE_OFFSET = [0, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800, 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600, 6800, 7000, 10000];
    this.WIN_POINTS = [25, 25, 25, 25, 25, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 15, 15, 15, 15, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    this._aPlayerPos = [];
    this._aLeaderboard = [];
    this._aTaggedGames = [];
    this._aOtherGames = [];
    this._aFeaturedGames = [];
    this._aLeaderboard[this.LEADERBOARD_DAY] = [];
    this._aLeaderboard[this.LEADERBOARD_MONTH] = [];
    this._aLeaderboard[this.LEADERBOARD_GENERAL] = [];
    this._fRequestFullScreen = null;
    this._fCancelFullScreen = null;
    this._bJoiningRoom;
    this._szRoomID;
    this._szPass;
    this._iCurLeaderboardToShow = this.LEADERBOARD_GENERAL;
    this._iWins;
    this._iLosses;
    this._iTotMatches;
    this._iPlayerRanking;
    this._iCurBadgeLevel;
    this._iAmountBadges = this.BADGE_OFFSET.length;
    this._oInfoAccessRoom = null;
    void 0;
    var doc = window.document;
    var docEl = doc.documentElement;
    this._fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    this._fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    refreshLanguageGUIController();
    void 0;
    var div = document.createElement('div');
    div.className = 'sidebar-menu-container';
    document.body.appendChild(div);
    this.createSideBar();
    this.__modalCallbacks();
    this.__modalsCallbacks();
    this.hideBackButton();
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
  addToGameOptions(szHtml) {
    document.querySelector("#" + this.GAME_OPTIONS_DIV_ID).appendChild(htmlMarkupToNode(szHtml));
  }
  showMainMenuBut() {
    document.getElementById("main-menu-but").classList.remove("d-none");
  }
  hideMainMenuBut() {
    document.getElementById("main-menu-but").classList.add("d-none");
  }
  showRestartBut() {
    document.getElementById("restart-game-but").classList.remove("d-none");
  }
  hideRestartBut() {
    document.getElementById("restart-game-but").classList.add("d-none");
  }
  showBackButton() {
    document.getElementById("back-btn").classList.remove("d-none");
  }
  hideBackButton() {
    document.getElementById("back-btn").classList.add("d-none");
  }
  showLangButton() {
    document.getElementById("but-lang").classList.remove("d-none");
  }
  hideLangButton() {
    document.getElementById("but-lang").classList.add("d-none");
  }
  __modalCallbacks() {
    var szEvent = "click";
    if (s_bMobile) {
      szEvent = "touchend";
    }
    document.addEventListener(szEvent, e => {
      var target = e.target;
      console.log(target);
      while (target && target.parentNode !== document) {
        if (target.classList.contains('action-show-lang')) {
          this.__createLanguageModal();
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
          this.__createConfirmModal(this._szIdConfirmGotoMenu, TEXT_ARE_YOU_SURE);
          return;
        } else if (target.classList.contains('action-restart-game')) {
          this.__createConfirmModal(this._szIdConfirmRestart, TEXT_ARE_YOU_SURE);
          return;
        } else if (target.classList.contains('action-not-confirm-in-modal')) {
          return;
        } else if (target.classList.contains('action-show-credits')) {
          this.__createCreditsModal();
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
    var szPx = -65 - iSafeArea;
    var szCalc = "calc(" + szPx + "px - 10px)";
    document.getElementById("toggle-sidebar-btn-top-right").style.left = szCalc;
    var iPx = 75 + iSafeArea;
    var szPX = iPx + "px";
  }
  _setSideBarMarginRight(iSafeArea) {
    if (iSafeArea > 0) {
      var szPx = iSafeArea;
      var szCalc = szPx + "px";
      document.getElementById("toggle-sidebar-btn-top-right").style.left = szCalc;
      document.getElementById("offcanvas-body").style.paddingRight = iSafeArea + "px";
    } else {
      document.getElementById("toggle-sidebar-btn-top-right").style.removeProperty('left');
    }
  }
  toggleSideBar() {
    var oOffcanvas = document.getElementById("sidebarMenu");
    if (oOffcanvas.classList.contains("show")) {
      oOffcanvas.classList.remove('show');
      document.querySelector(".action-toggle-sidebar .hamburger").classList.remove("is-active");
      document.querySelector(".offcanvas-block").classList.remove("show");
    } else {
      oOffcanvas.classList.add('show');
      document.querySelector(".action-toggle-sidebar .hamburger").classList.add("is-active");
      document.querySelector(".offcanvas-block").classList.add("show");
    }
  }
  createSideBar() {
    var szHtml = '';
    szHtml += '<div id="offcanvas-block" class="offcanvas-block action-toggle-sidebar"></div>';
    szHtml += '<a id="back-btn" class="btn btn-link go-back-btn action-go-back" role="button" aria-controls="goBack"><i class="fa-solid fa-arrow-left"></i></a> ';
    var szRemoveAdsHide = "d-none";
    if (this._szRemoveAdsType) {
      szRemoveAdsHide = "";
    }
    szHtml += '<div class="offcanvas offcanvas-end sidebar-menu" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">';
    szHtml += '<div id="offcanvas-header" class="offcanvas-header p-2" >';
    szHtml += '</div>';
    szHtml += '<div id="offcanvas-body" class="offcanvas-body">';
    szHtml += '<div class="list-group sidebar-menu-form-check">';
    szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-0">' + TEXT_SETTINGS + '</h4>';
    if (MULTILANGUAGE_SECTION) {
      var iLangCode = LANG_CODES[s_iStartingLangCode];
      if (iLangCode === undefined) {
        iLangCode = LANG_EN;
        s_iStartingLangCode = "en";
      }
      szHtml += '<div id="but-lang" class="cursor-pointer form-check action-show-lang"><div class="row align-items-center">';
      szHtml += '<div class="col col-8" id="sidebar-menu-section-0-0"><i class="fa-solid fa-language icon-start"></i><span>' + TEXT_LANGUAGE + '</span></div>';
      szHtml += '<div class="col col-4"><div id="flag-cur-language" class="language-flag bg-' + s_iStartingLangCode + ' " ></div></div></div></div>';
    }
    if (ENABLE_FULLSCREEN) {
      szHtml += '<div class="cursor-pointer form-check form-switch form-check-reverse text-start">';
      szHtml += '<input class="form-check-input action-toggle-fullscreen" type="checkbox" role="switch" id="sidebar-menu-section-0-1">';
      szHtml += '<label class="form-check-label" for="sidebar-menu-section-0-1"><i class="fa-solid fa-expand icon-start"></i><span>' + TEXT_FULLSCREEN_OFF + '</span></label></div>';
    }
    szHtml += '<div class="cursor-pointer form-check form-switch form-check-reverse text-start">';
    szHtml += '<input class="form-check-input action-toggle-music" type="checkbox" role="switch" id="sidebar-menu-section-0-2" >';
    szHtml += '<label class="form-check-label" for="sidebar-menu-section-0-2"><i class="fa-solid fa-music icon-start"></i><span>' + TEXT_MUSIC_OFF + '</span></label>';
    szHtml += "</div>";
    szHtml += '<div class="cursor-pointer form-check form-switch form-check-reverse text-start">';
    szHtml += '<input class="form-check-input action-toggle-sfx" type="checkbox" role="switch" id="sidebar-menu-section-0-3">';
    szHtml += '<label class="form-check-label" for="sidebar-menu-section-0-3"><i class="fa-solid fa-volume-high icon-start"></i><span>' + TEXT_SFX_OFF + '</span></label>';
    szHtml += "</div>";
    var bShowPrivacy = "d-none";
    if (this._bShowPrivacyBut) {
      bShowPrivacy = "";
    }
    szHtml += '</div>';
    szHtml += '<div class="sidebar-menu-button-link">';
    szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-1">' + TEXT_GAME_OPTION + '</h4>';
    szHtml += '<div id="' + this.GAME_OPTIONS_DIV_ID + '" class="d-grid">';
    szHtml += '<button id="main-menu-but" type="button" class="btn btn-link text-start action-goto-menu">';
    szHtml += '<i class="fa-solid fa-house icon-start" id="sidebar-menu-section-1-0"></i>';
    szHtml += '<span>' + TEXT_MAIN_MENU + '</span>';
    szHtml += '</button>';
    szHtml += '<button id="restart-game-but" type="button" class="btn btn-link text-start action-restart-game">';
    szHtml += '<i class="fa-solid fa-arrows-rotate icon-start" id="sidebar-menu-section-1-1"></i>';
    szHtml += '<span>' + TEXT_SB_RESTART + '</span>';
    szHtml += '</button>';
    szHtml += '</div></div>';
    szHtml += '<div id="sidebar-footer" class="sidebar-footer">';
    szHtml += '<div class="row m-0 text-center">';
    szHtml += "<div class=\"col col-6 align-self-center\"><img class=\"ctl-logo \" src=\"ctl_ui/sprites/codethislab-logo-white.svg\" alt=\"Code This Lab\">";
    szHtml += '</div>';
    szHtml += '<div class="col col-6 align-self-center action-show-credits">';
    szHtml += '<a href="#" class="text-decoration-none"><i class="fa-solid fa-circle-info icon-start"></i><span>' + TEXT_CREDITS + '</span></a>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '</div>';
    szHtml += '<a class="btn btn-link action-toggle-sidebar toggle-sidebar-btn-top-right" role="button" aria-controls="sidebarMenu" id="toggle-sidebar-btn-top-right">';
    szHtml += '<div class="hamburger hamburger--slider"><div class="hamburger-box"><div class="hamburger-inner hamburger-inner-white"></div></div></div>';
    szHtml += '</a>';
    szHtml += '</div>';
    document.querySelector(".sidebar-menu-container").appendChild(htmlMarkupToNode(szHtml));
    if (s_bFullscreen) {
      document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-1").checked = true;
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
    }
    if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
      document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-2").checked = true;
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_MUSIC_ON;
      document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-3").checked = true;
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-3] span").innerHTML = TEXT_SFX_ON;
    }
  }
  __createLanguageModal() {
    var szHtml = '';
    szHtml += '<div class="modal fade" id="languageModal" tabindex="-1" aria-labelledby="languageModalLabel" aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">';
    szHtml += '<div class="modal-content">';
    szHtml += '<div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5" id="languageModalLabel">' + TEXT_LANGUAGE + '</h1>';
    szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="' + TEXT_CLOSE + '"></button></div>';
    szHtml += '<div class="modal-body">';
    szHtml += '<ul class="list-group list-group-flush">';
    for (let szLang in TEXT_ORIGINAL_LANGUAGE) {
      szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag=' + szLang + '>';
      szHtml += '<span class="language-flag bg-' + szLang + '"></span>';
      szHtml += TEXT_ORIGINAL_LANGUAGE[szLang] + '</li>';
    }
    szHtml += '</ul></div></div></div></div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('languageModal'));
    oModal.show();
  }
  __createCreditsModal() {
    var szUrlText = TEXT_CREDITS_URL.split("//")[1];
    var szHtml = '<div class="modal fade credits-box overflow-hidden" id="creditsModal" tabindex="-1" aria-labelledby="creditsModalLabel" aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-centered">';
    szHtml += ' <div class="modal-content animate__animated animate__fadeInUpBig">';
    szHtml += '<div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5 text-center" id="creditsModalLabel"><i class="fa-solid fa-circle-info icon-start"></i>' + TEXT_CREDITS + '</h1>';
    szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    szHtml += '</div>';
    szHtml += "<div class=\"credits-source\">";
    szHtml += '<div class="modal-body"> ';
    var szVersion = "\u79BB\u7EBF\u6539\u7F16\u7248";
    szHtml += '<h1 class="modal-title fs-5 text-left" id="version">' + szVersion + '</h1>';
    szHtml += '<div class="text-center">';
    szHtml += ' <img class="ctl-logo" src="ctl_ui/sprites/logo_payoff_ctl_white.svg" alt="Code This Lab">';
    szHtml += '<h3>' + szUrlText + '</h3>';
    szHtml += '</div> ';
    szHtml += '</div> ';
    szHtml += "</div>";
    szHtml += ' </div>';
    szHtml += ' </div>';
    szHtml += ' </div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('creditsModal'));
    oModal.show();
  }
  __createGeneralAlertModal(szText) {
    var szHtml = '<div class="modal fade overflow-hidden" id="alertModal" tabindex="-1"  aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5" id="alertModalLabel">' + szText + '</h1>';
    szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="' + TEXT_CLOSE + '"></button></div>';
    szHtml += '<div class="modal-body">';
    szHtml += '</div></div></div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('alertModal'));
    oModal.show();
  }
  __createConfirmModal(szID, szText) {
    var szHtml = '<div class="modal fade overflow-hidden" id="confirmModal" tabindex="-1"  aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5" id="alertModalLabel">' + szText + '</h1></div>';
    szHtml += '<div class="modal-body">';
    szHtml += '<button type="button" class="btn btn-primary btn-sm action-not-confirm-in-modal" data-bs-dismiss="modal"  id="footer-btn-title-' + TEXT_NO + '" >' + TEXT_NO + '</button>';
    szHtml += '<button type="button" class="btn btn-primary btn-sm ' + this._szActionConfirmModals + ' float-end" data-bs-dismiss="modal" id="' + szID + '" >' + TEXT_YES + '</button>';
    szHtml += '</div></div></div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    oModal.show();
  }
  __createLoadingModal() {
    var szHtml = '';
    szHtml += '<div class="block-loading-container show d-flex justify-content-center align-items-center">';
    szHtml += '<div class="block-loading"></div>';
    szHtml += '<div class="block-loading-spinner">';
    szHtml += '<div class="spinner-border text-light"></div>';
    szHtml += '</div>';
    szHtml += '</div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
  }
  __removeLoadingModal() {
    if (document.querySelector(".block-loading-container")) {
      document.querySelector(".block-loading-container").remove();
    }
  }
  onChangeLang(target) {
    target = target.firstChild;
    var szClass = target.classList[1];
    var aTmp = szClass.split("bg-");
    var szFlag = aTmp[1];
    var oModal = document.getElementById("languageModal");
    bootstrap.Modal.getInstance(oModal).hide();
    document.getElementById("flag-cur-language").classList.remove('bg-' + s_iStartingLangCode);
    s_iStartingLangCode = szFlag;
    s_iCurLang = LANG_CODES[s_iStartingLangCode];
    refreshLanguage();
    refreshLanguageGUIController();
    this.refreshMenuLanguage();
    this._oEventListener.triggerEvent(CGUIController.ON_SELECT_LANG);
    document.getElementById("flag-cur-language").classList.add('bg-' + s_iStartingLangCode);
  }
  refreshMenuLanguage() {
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-0").innerHTML = TEXT_SETTINGS;
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-0 span").innerHTML = TEXT_LANGUAGE;
    if (ENABLE_FULLSCREEN) {
      if (s_bFullscreen) {
        document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
      } else {
        document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_OFF;
      }
    }
    if (s_bMusicActive) {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_MUSIC_ON;
    } else {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_MUSIC_OFF;
    }
    if (s_bSfxActive) {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-3] span").innerHTML = TEXT_SFX_ON;
    } else {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-3] span").innerHTML = TEXT_SFX_OFF;
    }
    document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-1").innerHTML = TEXT_GAME_OPTION;
    document.querySelector(".sidebar-menu-container .action-goto-menu span").innerHTML = TEXT_MAIN_MENU;
    document.querySelector(".sidebar-menu-container .action-restart-game span").innerHTML = TEXT_SB_RESTART;
    document.querySelector(".sidebar-menu-container .action-show-credits span").innerHTML = TEXT_CREDITS;
    void 0;
  }
  onToggleFullscreen() {
    if (s_bFullscreen) {
      this._fCancelFullScreen.call(window.document);
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_OFF;
    } else {
      this._fRequestFullScreen.call(window.document.documentElement);
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
    }
    sizeHandler();
  }
  onToggleMusic() {
    muteAllMusic(s_bMusicActive);
    s_bMusicActive = !s_bMusicActive;
    if (s_bMusicActive) {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_MUSIC_ON;
    } else {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_MUSIC_OFF;
    }
  }
  onToggleSfx() {
    muteAllSfx(s_bSfxActive);
    s_bSfxActive = !s_bSfxActive;
    if (s_bSfxActive) {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-3] span").innerHTML = TEXT_SFX_ON;
    } else {
      document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-3] span").innerHTML = TEXT_SFX_OFF;
    }
  }
  onGotoMenu() {
    this.toggleSideBar();
    this._oEventListener.triggerEvent(CGUIController.ON_GOTO_MAIN_MENU);
  }
  onRestartGame() {
    this.toggleSideBar();
    this._oEventListener.triggerEvent(CGUIController.ON_RESTART_GAME);
  }
  deselectButtons() {
    document.querySelector("#footer-btn-title-" + this.LEADERBOARD_DAY).classList.remove('active');
    document.querySelector("#footer-btn-title-" + this.LEADERBOARD_GENERAL).classList.remove('active');
    document.querySelector("#footer-btn-title-" + this.LEADERBOARD_MONTH).classList.remove('active');
  }
}