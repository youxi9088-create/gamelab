class CModalController {
  constructor(oController) {
    this._oGUIController = oController;
    this._aTaggedGames = [];
    this._aOtherGames = [];
    this._aFeaturedGames = [];
  }
  createLangPanel() {
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
  createCreditsPanel() {
    var szUrlText = TEXT_CREDITS_URL.split("//")[1];
    var szHtml = '<div class="modal fade credits-box overflow-hidden" id="creditsModal" tabindex="-1" aria-labelledby="creditsModalLabel" aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-centered">';
    szHtml += ' <div class="modal-content animate__animated animate__fadeInUpBig">';
    szHtml += '<div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5 text-center" id="creditsModalLabel"><i class="fa-solid fa-circle-info icon-start"></i>' + TEXT_CREDITS + '</h1>';
    szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    szHtml += '</div>';
    szHtml += '<div class="modal-body"> ';
    var szVersion = "v " + (s_szCurVers || "1.00");
    szHtml += '<h1 class="modal-title fs-5 text-left" id="version">' + szVersion + '</h1>';
    szHtml += '<div class="text-center">';
    szHtml += ' <img class="ctl-logo" src="ctl_ui/sprites/codethislab-logo-white.png" alt="Code This Lab">';
    if (szUrlText) {
      szHtml += '<h3>' + szUrlText + '</h3>';
    }
    szHtml += '</div> ';
    szHtml += '</div> ';
    szHtml += ' </div>';
    szHtml += ' </div>';
    szHtml += ' </div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('creditsModal'));
    oModal.show();
  }
  createAlertPanel(szText) {
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
  createConfirmPanel(szID, szText, szAction) {
    var szHtml = '<div class="modal fade overflow-hidden" id="confirmModal" tabindex="-1"  aria-hidden="true">';
    szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
    szHtml += '<h1 class="modal-title fs-5 m-auto" id="alertModalLabel">' + szText + '</h1></div>';
    szHtml += '<div class="modal-body">';
    szHtml += '<div class="d-flex justify-content-around modal-confirm-buttons">';
    szHtml += '<button type="button" class="fs-5 btn btn-primary btn-sm action-not-confirm-in-modal text-uppercase" data-bs-dismiss="modal"  id="footer-btn-title-' + TEXT_NO + '" >' + TEXT_NO + '</button>';
    szHtml += '<button type="button" class="fs-5 btn btn-primary btn-sm text-uppercase ' + szAction + '" data-bs-dismiss="modal" id="' + szID + '" >' + TEXT_YES + '</button>';
    szHtml += '</div>';
    szHtml += '</div></div></div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
    var oModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    oModal.show();
  }
  createLoadingPanel() {
    var szHtml = '';
    szHtml += '<div class="block-loading-container show d-flex justify-content-center align-items-center">';
    szHtml += '<div class="block-loading"></div>';
    szHtml += '<div class="block-loading-spinner">';
    szHtml += '<div class="spinner-border text-light"></div>';
    szHtml += '</div>';
    szHtml += '</div>';
    document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));
  }
  removeLoadingPanel() {
    if (document.querySelector(".block-loading-container")) {
      document.querySelector(".block-loading-container").remove();
    }
  }
}