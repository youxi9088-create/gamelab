/* Local feature boundary; original assets and combat modules remain unchanged. */
window.installLocalFeatures = function () {
  // Keep native textures: dynamic atlas repacking leaves late-loaded sprites blank in this WebGL build.
  if (cc.dynamicAtlasManager) cc.dynamicAtlasManager.enabled = false;
  // Original tutorial depends on unavailable server tutorial/task state.
  window.__require('GuideNode').default.showGuide = function () {};
  const artifacts = window.__require('ArtifactCtl').default.prototype;
  artifacts.getArtifactSkillData = function () { return []; };
  artifacts.artIsUnLock = function () { return false; };
  window.__require('ShopCtl').default.prototype.isShowNewbieBtn = function () { return false; };
  const functions = window.__require('CommonFuncItem');
  const unlock = functions.default.isUnlockFunction;
  functions.default.isUnlockFunction = function(model, key) {
    // These enumerations describe the online/extended modes, not core hero growth.
    if ([functions.FuncModel.Main, functions.FuncModel.MainRight, functions.FuncModel.Activity].includes(model)) return false;
    return unlock.apply(this, arguments);
  };
  const sets = {
    MainView: ['BtnGameClub','BtnPvp','BtnActivity','BtnAddGold','BtnAddDiamond','BtnRightMenu','BtnMenu','teamBtn','BtnGuild','BtnFishing','BtnWeapon','BtnRelic','headBtn','chatNode'],
    HeroView: ['BtnMenu3','BtnMenu4','skinToggle','statueToggle','dexToggle'],
    HeroPropInfoNode: ['BtnUpgradeQuick','BtnReset','BtnAdvanced','BtnAwaking','BtnSkin','BtnRelic'],
    FightView: ['btn_2'],
    HangUpView: ['quick'],
    HeroEquitView: ['propList','btnReset','btnCore','btnEnchant','btnUpgradeQuick','btnUpgradeListMenu'],
    HeroTalentInfoNode: ['ancestorBtn'],
    HeroRecruitView: ['btnWish','wishNode','playCardNode','btnAncientsGift']
  };
  // Original property references are stable even when prefab node names differ.
  const recruit = window.__require('HeroRecruitView').default.prototype;
  const initRecruit = recruit.initView;
  recruit.initView = function () {
    initRecruit.apply(this, arguments);
    this.scheduleOnce(() => {
      this.afterLab.string = '本地招募：四位英雄轮换，重复转为20碎片';
    });
  };
  const banner = recruit.initBannerNode;
  recruit.initBannerNode = function () {
    banner.apply(this, arguments);
    this.afterLab.string = '本地招募：四位英雄轮换，重复转为20碎片';
    this.helpNodeLab.string = '每天5次免费招募；四位英雄轮换，重复获得20碎片。高级招募消耗240钻石或1张招募券，十连消耗2280钻石或10张券。';
  };
  const normal = recruit.initNormalNode;
  recruit.initNormalNode = function () {
    normal.apply(this, arguments);
    this.btnAdNode.active = false;
    this.btnFreeNode.active = true;
  };
  const progress = recruit.updateProgress;
  recruit.updateProgress = function () {
    progress.apply(this, arguments);
    this.scoreProgress.node.active = false;
    this.scoreLab.node.active = false;
    this.progressSpine.node.active = false;
  };
  for (const [module, names] of Object.entries(sets)) {
    const proto = window.__require(module).default.prototype;
    const original = proto.onLoad;
    proto.onLoad = function () {
      if (original) original.apply(this, arguments);
      const hidden = new Set(names);
      const visit = node => {
        for (const name of hidden) {
          const ref = this[name];
          if (ref instanceof cc.Node) ref.active = false;
          else if (ref?.node instanceof cc.Node) ref.node.active = false;
        }
        for (const label of node.getComponents(cc.Label)) {
          if (['雕文','神器'].includes(label.string)) { label.string += '（未开放）'; label.fontSize = 18; }
        }
        if (hidden.has(node.name)) node.active = false;
        else node.children.forEach(visit);
      };
      visit(this.node);
      this.schedule(() => visit(this.node), .25);
    };
  }
};

