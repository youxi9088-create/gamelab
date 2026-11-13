/* Local feature boundary; original assets and combat modules remain unchanged. */
window.installLocalFeatures = function () {
  const sets = {
    MainView: ['BtnRecruit','BtnGameClub','BtnPvp','BtnActivity','BtnAddGold','BtnAddDiamond','BtnRightMenu','BtnMenu','teamBtn','BtnGuild','BtnFishing','BtnWeapon','BtnRelic','headBtn','hangUp','chatNode'],
    HeroView: ['BtnMenu2','BtnMenu3','BtnMenu4','skinToggle','statueToggle','dexToggle'],
    HeroPropInfoNode: ['BtnUpgradeQuick','BtnReset','BtnAdvanced','BtnAwaking','BtnSkin','BtnRelic'],
    FightView: ['btn_2','btn_3']
  };
  for (const [module, names] of Object.entries(sets)) {
    const proto = window.__require(module).default.prototype;
    const original = proto.onLoad;
    proto.onLoad = function () {
      if (original) original.apply(this, arguments);
      const hidden = new Set(names);
      const visit = node => {
        for (const label of node.getComponents(cc.Label)) {
          if (['天赋','雕文','神器'].includes(label.string)) { label.string += '（未开放）'; label.fontSize = 18; }
        }
        if (hidden.has(node.name)) node.active = false;
        else node.children.forEach(visit);
      };
      visit(this.node);
      this.schedule(() => visit(this.node), .25);
    };
  }
};
