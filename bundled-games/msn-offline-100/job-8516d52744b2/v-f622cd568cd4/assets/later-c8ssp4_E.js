import { s as v, b as X, d as H, t as Q, f as Rt, g as tt, u as pt, h as O, e as I, i as A, c as j, A as F, j as _e, l as rt, k as bt, m as Wt, n as Be, o as Me, p as K, q as Ie, E as dt, T as Ct, r as Ut, v as Oe, w as Ae, B as nt, S as Z, x as Ht, y as xt, z as Re, C as qt, D as jt, F as Le, G as De, H as $e, I as Ge } from "./index-BdOHA6Qs.js";import{K as Ne,b0 as ze,L as Fe,w as Ve,x as We,C as Ue,y as He,z as qe,O as vt,D as je,M as Xe,b1 as Qe,T as Ye,b2 as Ke,a$ as Je,G as Xt,Q as Ze,V as M,c as Qt,B as ti,p as Yt,b3 as ei,s as ii,a9 as si}from"./engine-bnF_cDiu.js";import"./SkeletonUtils-BCVmgslc.js";const yt=F+"ui/sprites/",ni=F+"textures/",oi={"Green.asset":[[.4392,1,.3137],[.5091,.9906,.4065],[.6534,1,.5802],[.6651,1,.803],[.3098,.8431,.1882],[.2078,.6863,.1686],[.1533,.5094,.0793],[.104,.3962,.043],[.1529,.5098,.0784],[.1098,.4157,.1098],[1,1,1],[.2588,.6588,.2588],[1,1,1],[0,0,0]],"Orange.asset":[[1,.7882,.2196],[1,.7939,.2311],[1,.8457,.4292],[1,.9237,.6179],[.9451,.5725,.0863],[1,.5882,.0078],[.8196,.3373,0],[.6981,.3095,.1153],[.8196,.3373,0],[.8196,.3373,0],[1,1,1],[.8196,.3373,0],[1,1,1],[0,0,0]]},ai=[.5,.65,.7264,.8113,.434,.2925,.2453,.1981,.349,.2642,.7453,.35,1,0].map(a=>[a,a,a]),Kt={YellowStroke:[[.6132,.4362,.0955],.21],MoneyStroke:[[.1116,.4151,.1116],.18],FreeStroke:[[.8208,.3365,0],.18],GrayedStroke:[[.3019,.3019,.3019],.18]},_t="cubic-bezier(0.25, 1, 0.5, 1)",Tt="cubic-bezier(0.45, 0, 0.55, 1)",ri="cubic-bezier(0.5, 1, 0.89, 1)",Jt=a=>`rgb(${Math.round(a[0]*255)},${Math.round(a[1]*255)},${Math.round(a[2]*255)})`,li=a=>String(a).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t]),x=a=>a&&a.node!=null?a.node:-1,ft=a=>new Promise(t=>setTimeout(t,a*1e3));let Zt=!1;function ci(){if(Zt)return;Zt=!0;const a=document.createElement("style");a.textContent=`
.upgradepopup-canvas { z-index: 5; }
.upgradepopup-btn { pointer-events: auto; cursor: pointer; }
/* a button takes taps on its own rect only: its Click_BurstPS (larger, invisible) covered the row above */
.upgradepopup-btn * { pointer-events: none; }
.upgradepopup-btn.upgradepopup-off { cursor: default; }
.upgradepopup-press { transition: transform .07s cubic-bezier(0.5, 1, 0.89, 1); }
@keyframes upgradepopup-scroll { 0% { transform: translateX(0); } 50%, 100% { transform: translateX(1100px); } }
.upgradepopup-scroll { animation: upgradepopup-scroll 4s linear .5s infinite; }
`,document.head.appendChild(a)}const hi=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Un","Du"];function Te(a,t,e){const i=String(Math.trunc(a)),s=a<0?i.length-1:i.length;if(s<=t)return i;let n=s%3||3;a<0&&n++;let o=i.slice(0,n);return t-n>0&&(o+="."+i.slice(n,n+Math.min(t-n,e))),String(parseFloat(o))+hi[Math.floor((s-1)/3)]}function pi(a){return a<20?a.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):Te(Math.floor(a+1e-4),4,2)}const di=a=>`<span style="font-size:75%">${li(A("Lv","Lv"))}</span>${a}`;function te(a,t,e,i,s){if(!a||!a.animate)return;const n=a.style.transform&&a.style.transform!=="none"?a.style.transform+" ":"",o=[{transform:n+"scale(1)"}];for(let r=0;r<i;r++){const l=t*(1-r/i);o.push({transform:n+`scale(${1+(r%2===0?l:-l*s)})`})}o.push({transform:n+"scale(1)"}),a.animate(o,{duration:e*1e3,easing:"ease-out"})}function J(a,t,e,i,s){const n=getComputedStyle(a)[t];a._tweens=a._tweens||{},a._tweens[t]&&a._tweens[t].cancel(),a.style[t]=e,a._tweens[t]=a.animate&&n!==e?a.animate([{[t]:n},{[t]:e}],{duration:i*1e3,easing:s}):null}function Pt(a,t,e,i,s){const n=e?"none":`translate(${t.x}px, ${-t.y}px)`;i?(a._tweens&&a._tweens.transform&&a._tweens.transform.cancel(),a.style.transform=n):J(a,"transform",n,s,ri)}class ui{constructor(t,e){const i=t.defs[e].c.NewItemDisplay,s=t.defs[e].c.MoveAndFadeRectTransform;this.ui=t,this.el=t.el(e),this.offset=s.m_HideOffset,this.duration=s.m_duration,this.items=i.m_itemParentArray.map((n,o)=>{const r=x(i.m_itemMoveAndFadeArray[o]);return{parent:t.el(x(n)),outline:x(i.m_iconOutlineArray[o]),icon:x(i.m_iconArray[o]),move:t.el(r),offset:t.defs[r].c.MoveAndFadeRectTransform.m_HideOffset,duration:t.defs[r].c.MoveAndFadeRectTransform.m_duration}}),this.visible=!1,this.token=0}setVisible(t,e=!1){this.visible=t,Pt(this.el,this.offset,t,e,this.duration)}async show(t){const e=++this.token;if(!(this.visible&&(this.setVisible(!1),await ft(this.duration),e!==this.token))){this.items.forEach((i,s)=>{const n=s<t.length;i.parent.style.display=n?"":"none",n&&(this.ui.setImage(i.outline,yt+t[s]+"_Outline.webp"),this.ui.setImage(i.icon,yt+t[s]+".webp"),Pt(i.move,i.offset,!1,!0))}),this.setVisible(!0),await ft(.3);for(let i=0;i<Math.min(t.length,this.items.length);i++){if(e!==this.token)return;const s=this.items[i];Pt(s.move,s.offset,!0,!1,s.duration),await ft(.15)}}}hide(){this.token++,this.setVisible(!1)}resetToHidden(){this.token++,this.setVisible(!1,!0)}}class ps {
  constructor(t, e) {
    this.game = t, this.root = e, this.upgradePopupOpen = !1, this.upgradeMade = !1, this.upRows = [], this.ready = this.build(), v.onCurrencyChange(() => {
      this.upgradePopupOpen && this.ui && this.refreshUpgrades();
    });
  }
  init() {
    return this.ready;
  }
  async build() {
    ci(), this.canvas = X(this.root), this.canvas.classList.add("upgradepopup-canvas");
    const t = this.ui = await H("upgrade", this.canvas, {
      translate: Q
    });
    t.root.style.display = "none", await Promise.all(t.defs.filter(o => o.img && o.img.sprite).map(o => Rt(o.img.sprite.file, o.img.color)));
    const e = t.defs[0].c.UpgradePopup;
    this.showDuration = e.m_showDuration || .3, t.defs.forEach((o, r) => {
      if (o.mask && /^(Mask|NewItemMask|TopMask)$/.test(o.n)) {
        const l = t.el(r).querySelector(":scope > .u-img");
        l && (l.style.display = "none");
      }
      o.text && this.applyStroke(r, o.text.mat);
    }), t.setActive(x(e.m_blockClickGO), !1), this.banner = t.el(x(e.m_bannerRectTfm)), this.bannerHeight = t.defs[x(e.m_bannerRectTfm)].rt.size[1], this.top = t.el(x(e.m_topContainerRectTfm));
    const i = e.m_topContainerAnchorPosOffOn;
    this.topHiddenY = i[1].y - i[0].y;
    const s = x(e.m_closeButton);
    this.closeEl = t.el(s), this.closeEl.style.transformOrigin = "50% 50%", this.makeButton(s, () => this.closeUpgradePopup(!0)), t.findEl("NewItemMask").style.pointerEvents = "none", this.newItem = new ui(t, x(e.m_newItemDisplay)), this.newItem.resetToHidden(), this.nextIcon = x(e.m_nextItemIcon), this.nextOutline = x(e.m_nextItemIconOutline), this.newItemList = null;
    const n = tt.data.upgradePopup.slice(0, e.m_gameUpgrades.length);
    e.m_gameUpgrades.forEach((o, r) => t.setActive(x(o), r < n.length)), this.upRows = n.map((o, r) => this.buildCard(o, r, x(e.m_gameUpgrades[r])));
  }
  buildCard(t, e, i) {
    const s = this.ui,
      n = s.defs[i].c.ProgressBarUpgrader,
      o = x(n.m_moneyUpgradeButton),
      r = x(n.m_rvUpgradeButton),
      l = {
        name: t,
        index: e,
        mode: "locked",
        row: s.el(x(n.m_container)),
        money: s.el(o),
        rv: s.el(r),
        maxed: s.el(x(n.m_maxedOutGO)),
        title: s.el(x(n.m_upgradeName)),
        stat: s.el(x(n.m_newStat)),
        lvl: s.el(x(n.m_lvlTMP)),
        price: s.findEl("Counter_TMP", o),
        moneySkin: this.skinOf(o),
        rvSkin: this.skinOf(r)
      };
    l.btn = l.money;
    const c = pt(t).def.icon;
    c && s.setImage(x(n.m_outlineUpgradeImage), ni + c);
    for (const p of ["Upgrade_Content_Ion_Outline", "Upgrade_Content_Icon (1)"]) {
      const d = s.findEl(p, i);
      d && d.parentElement.appendChild(d);
    }
    for (const p of ["UnlockFxContainer", "EquippedTick"]) s.setActive(s.find(p, o), !1), s.setActive(s.find(p, r), !1);
    if (s.defs[r].c.SkinnedPushButton.hasScrollShine) {
      const p = s.findEl("ScrollShine", r);
      p && p.classList.add("upgradepopup-scroll");
    }
    return this.setBlackVeil(l.moneySkin, !1), this.setBlackVeil(l.rvSkin, !1), this.makeButton(o, () => this.onUpgradeClick(t, e)), l;
  }
  skinOf(t) {
    const e = this.ui,
      i = x(e.defs[t].c.SkinnedPushButton.m_skin),
      s = e.defs[i].c.GraphicColorChangerManager,
      n = {
        el: e.el(t),
        preset: oi[(s && s.colorPreset && s.colorPreset.asset || "").split("/").pop()],
        changers: [],
        grey: [],
        fonts: [],
        veil: null
      };
    return e.defs.forEach((o, r) => {
      if (!(r !== i && !e.isDescendant(r, i))) {
        if (o.c && o.c.GraphicColorChanger) {
          let l = r;
          for (; l != null && !(e.defs[l].c && e.defs[l].c.GraphicColorChangerManager);) l = e.defs[l].p;
          l === i && n.changers.push(r);
        }
        o.scripts && o.scripts.includes("BlackVeilableGreyScaleImage") && n.grey.push(r), o.c && o.c.BlackVeilableTMPFontAsset && n.fonts.push(r);
      }
    }), n;
  }
  setBlackVeil(t, e) {
    if (t.veil === e) return;
    t.veil = e;
    const i = this.ui;
    for (const s of t.changers) {
      const n = i.defs[s],
        o = n.c.GraphicColorChanger,
        r = e ? ai : t.preset;
      if (!r) continue;
      const l = n.img && n.img.color || n.text && n.text.color || [1, 1, 1, 1],
        c = [...r[o.m_imageType], o.m_preserveAlpha ? l[3] : 1];
      if (this.recolor(s, c), o.m_hiddenInBlackVeil) {
        const p = i.el(s).querySelector(":scope > .u-img, :scope > .u-text");
        p && (p.style.visibility = e ? "hidden" : "");
      }
    }
    for (const s of t.grey) {
      const n = i.el(s).querySelector(":scope > .u-img");
      n && (n.style.filter = e ? "grayscale(1)" : "");
    }
    for (const s of t.fonts) {
      const n = i.defs[s].c.BlackVeilableTMPFontAsset.m_fontMatActiveAndBlackVeil;
      this.applyStroke(s, (n[e ? 1 : 0] || {}).asset || "");
    }
    t.el.classList.toggle("upgradepopup-off", e);
  }
  recolor(t, e) {
    const i = this.ui.defs[t],
      s = this.ui.el(t);
    if (i.text) {
      const l = s.querySelector(":scope > .u-text");
      l && (l.style.color = `rgba(${Math.round(e[0] * 255)},${Math.round(e[1] * 255)},${Math.round(e[2] * 255)},${e[3]})`);
      return;
    }
    const n = i.img && s.querySelector(":scope > .u-img");
    if (!n) return;
    n.style.opacity = e[3] < 1 ? e[3] : "";
    const o = i.img.sprite;
    if (!o) {
      n.style.background = Jt(e);
      return;
    }
    const r = n._tint = e.join(",");
    Rt(o.file, e).then(l => {
      !l || n._tint !== r || (i.img.type === 1 && o.border ? n.style.borderImageSource = `url("${l}")` : n.style.backgroundImage = `url("${l}")`);
    });
  }
  applyStroke(t, e) {
    const i = Object.keys(Kt).find(l => e && e.includes(l));
    if (!i) return;
    const s = this.ui.el(t).querySelector(":scope > .u-text");
    if (!s) return;
    const [n, o] = Kt[i],
      r = this.ui.defs[t].text.size || 36;
    s.style.webkitTextStroke = `${r * o * .8}px ${Jt(n)}`, s.style.paintOrder = "stroke fill", s.style.textShadow = `0 ${r * .06}px 0 rgb(14,14,36)`;
  }
  makeButton(t, e) {
    const i = this.ui,
      s = i.el(t),
      n = i.defs[t].c.SkinnedPushButton || {},
      o = i.el(x(n.graphicContainer)) || s,
      r = n.m_pressedScale ? n.m_pressedScale.x : .85,
      l = n.m_clickBounceScale ? n.m_clickBounceScale.x : 1.1,
      c = (n.m_pressScaleDuration || .07) * 1e3,
      p = () => s === this.closeEl ? this.upgradePopupOpen : !s.classList.contains("upgradepopup-off");
    s.classList.add("upgradepopup-btn"), o.classList.add("upgradepopup-press"), s.addEventListener("pointerdown", () => {
      p() && (o.style.transform = `scale(${r})`);
    });
    const d = () => {
      o.style.transform = "";
    };
    s.addEventListener("pointerup", d), s.addEventListener("pointerleave", d), s.addEventListener("pointercancel", d), s.addEventListener("click", () => {
      p() && (O.play("click"), o.animate && o.animate([{
        transform: `scale(${r})`
      }, {
        transform: `scale(${l})`
      }, {
        transform: "scale(1)"
      }], {
        duration: c * 2,
        easing: "ease-out"
      }), e());
    });
  }
  openUpgradePopup() {
    this.upgradePopupOpen || (this.upgradePopupOpen = !0, this.ui ? this.show() : this.ready.then(() => {
      this.upgradePopupOpen && this.show();
    }));
  }
  open() {
    this.openUpgradePopup();
  }
  show() {
    this.flushClose(), clearTimeout(this.hideTimer), this.upgradeMade = !1, this.newItem.resetToHidden(), this.ui.root.style.display = "", this.banner.style.pointerEvents = "auto", this.setupNextItem(), this.refreshUpgrades(), I.emit("upgradePopupOpened"), O.play("swooshOpen");
    const t = this.showDuration;
    this.banner.style.height = "0px", this.top.style.transform = `translateY(${this.topHiddenY}px)`, this.closeEl.style.transform = "scale(0)", J(this.banner, "height", this.bannerHeight + "px", t, _t), J(this.top, "transform", "translateY(0px)", t, _t), J(this.closeEl, "transform", "scale(1)", t, _t);
  }
  refreshUpgrades() {
    if (!this.ui) return;
    const t = this.ui;
    for (const e of this.upRows) {
      const i = pt(e.name),
        s = i.def,
        n = i.level;
      t.setText(e.title, A(e.name.toUpperCase(), e.name.toUpperCase()));
      const o = e.lvl.querySelector(":scope > .u-text");
      o && (o.innerHTML = di(n + 1));
      let r = i.valueAt(n);
      s.isPercentage && (r *= 100), t.setText(e.stat, (pi(r) + (s.upgradeSuffix || "") + " " + A(s.upgradeTextName, s.upgradeTextName)).toUpperCase());
      const l = i.price;
      t.setText(e.price, l === 0 ? A("FREE", "FREE") : Te(l, 3, 3));
      const c = v.currency(i.currency),
        p = s.canBeUpgradedAtLevel0 || n > 0;
      if (t.setActive(e.maxed, i.maxed), i.maxed) t.setActive(e.money, !1), t.setActive(e.rv, !1), e.mode = "max", e.btn = e.money;else {
        t.setActive(e.money, p), t.setActive(e.rv, !1);
        const d = l <= c && p;
        this.setBlackVeil(e.moneySkin, !d), e.mode = d ? "pay" : "locked", e.btn = e.money;
      }
    }
  }
  upgradeButton(t) {
    const e = this.upRows[t];
    return this.upgradePopupOpen && e && (e.mode === "pay" || e.mode === "rv") ? e.btn : null;
  }
  upgradeCloseButton() {
    return this.upgradePopupOpen && this.closeEl ? this.closeEl : null;
  }
  onUpgradeClick(t, e) {
    const i = this.upRows[e];
    if (!i || !this.upgradePopupOpen) return;
    const s = pt(t),
      n = () => {
        O.play("upgrade"), v.increaseUpgrade(t), I.emit("upgradeDone", t), I.emit("upgradeButton" + e), te(i.row, .1, .7, 5, .2), this.refreshUpgrades(), this.upgradeMade = !0, s.currency === j.game.specialCurrency && this.unlockNewItem();
      };
    i.mode === "pay" && (v.removeCurrency(s.currency, s.price), n());
  }
  heavyByLevel() {
    if (this.game && this.game.level && this.game.level.heavyByLevel) return {
      map: this.game.level.heavyByLevel,
      max: this.game.level.maxScrapLevel
    };
    const t = new Map();
    let e = 0;
    for (const i of tt.data.heavyScraps) {
      const s = (tt.data.scraps[i] || {}).level || 0;
      t.has(s) || t.set(s, []), t.get(s).push(i), e = Math.max(e, s);
    }
    return {
      map: t,
      max: e
    };
  }
  playerLevel() {
    return this.game && this.game.player ? this.game.player.playerLevel : pt("Power").level;
  }
  setupNextItem() {
    const t = this.playerLevel(),
      {
        map: e,
        max: i
      } = this.heavyByLevel();
    if (i <= t) return;
    const s = Math.min(Math.max(t + 1, 0), i);
    if (!e.has(s)) return;
    const n = this.newItemList = e.get(s);
    !n || !n.length || (this.ui.setImage(this.nextIcon, yt + n[0] + ".webp"), this.ui.setImage(this.nextOutline, yt + n[0] + "_Outline.webp"));
  }
  async unlockNewItem() {
    const t = this.unlockToken = (this.unlockToken || 0) + 1;
    if (te(this.ui.el(this.nextOutline), .2, 1, 4, .5), await ft(.3), t !== this.unlockToken || !this.upgradePopupOpen) return;
    const {
      max: e
    } = this.heavyByLevel();
    e <= this.playerLevel() || (setTimeout(() => {
      this.upgradePopupOpen && this.setupNextItem();
    }, 500), this.newItemList && this.newItemList.length && this.newItem.show(this.newItemList));
  }
  closeUpgradePopup(t = !1) {
    if (!this.upgradePopupOpen || (this.upgradePopupOpen = !1, this.unlockToken = (this.unlockToken || 0) + 1, t && this.game && this.game.level && this.game.level.upgradable && (this.game.level.upgradable.shown = !0), !this.ui)) return;
    this.banner.style.pointerEvents = "none", O.play("swooshClose");
    const e = this.upgradeMade;
    this.upgradeMade = !1;
    const i = () => {
      this.pendingClose = null, I.emit("upgradePopupClosed", e);
      const s = this.showDuration;
      J(this.banner, "height", "0px", s, Tt), J(this.top, "transform", `translateY(${this.topHiddenY}px)`, s, Tt), J(this.closeEl, "transform", "scale(0)", s, Tt), this.hideTimer = setTimeout(() => {
        this.ui.root.style.display = "none";
      }, s * 1e3);
    };
    this.newItem.visible ? (this.newItem.hide(), this.pendingClose = {
      finish: i,
      timer: setTimeout(i, 300)
    }) : i();
  }
  close(t = !1) {
    this.closeUpgradePopup(t);
  }
  flushClose() {
    this.pendingClose && (clearTimeout(this.pendingClose.timer), this.pendingClose.finish());
  }
}const ot=20,L={maxSpeed:3e3,maxScale:1.5,maxSquareDist:3e4,size:100,sizeRnd:[.5,.8],dirRnd:[1,3]},fi=[[0,0],[.1468,1.2],[.3552,.9],[.5944,1.1067],[1,.928]],mi=[[0,.099],[1.3086,.9949]],gi=[[.501,0],[1.0046,1]],St=innerWidth>innerHeight?1.25:1,mt=[{y:-211,alpha:0},{y:-388,alpha:1}],Lt=1.3,Et="cubic-bezier(0.5, 1, 0.89, 1)",yi=`
.winPanel-canvas { z-index: 5; }
.winPanel-canvas .winPanel-root { pointer-events: auto; }
.winPanel-canvas .winPanel-fx { pointer-events: none; }
.winPanel-coin { position: absolute; left: 0; top: 0; pointer-events: none; background-size: contain, contain;
  background-repeat: no-repeat; background-position: center; will-change: transform; }
.winPanel-confetti { position: absolute; left: 0; top: 0; pointer-events: none; }
`;let ee=!1;function ki(){if(ee)return;ee=!0;const a=document.createElement("style");a.textContent=yi,document.head.appendChild(a)}function Bt(a,t){if(t<=a[0][0])return a[0][1];for(let e=1;e<a.length;e++)if(t<=a[e][0]){const[i,s]=a[e-1],[n,o]=a[e];return s+(o-s)*(t-i)/(n-i)}return a[a.length-1][1]}function ie(a,t,e,i=1){const s=Math.max(2,t),n=[{transform:`scale(${i})`}];for(let o=0;o<s;o++){const r=1-o/s,l=o%2===0?a*r:-a*r*e;n.push({transform:`scale(${i+l})`})}return n.push({transform:`scale(${i})`}),n}const wi={file:"white_circle_ea3492.webp",w:512,h:512,ppu:300,border:[256,256,256,256]},bi={file:"glow3.webp",w:395,h:383,ppu:100,border:[197,191,197,191]},Ci={file:"whiteSquare_a9900b.webp",w:1,h:1,ppu:1},xi={file:"icon_lock_7ec2a2.webp",w:700,h:700,ppu:100},vi={file:"icon_lock_stroke_0c70e7.webp",w:700,h:700,ppu:100},_i={file:"icon_arrow_play.webp",w:512,h:512,ppu:100},Ti={file:"icon_Tick_34e75d.webp",w:256,h:256,ppu:100},Pi=[.8,.8,.8,1],Si=[.2579,.8962,.2663,1],Ei=[1,.7355,.1651,1],Bi=[.4392,1,0,1],Mi=[.0039,.7137,.8588,1],z=(a,t,e,i,s=[.5,.5])=>({amin:a,amax:t,pos:e,size:i,pivot:s}),G=(a=[0,0],t=[0,0])=>z([0,0],[1,1],t,a),st=(a,t)=>({color:a,sprite:wi,type:1,ppum:t});function Ii(a){const t=[],e=(r,l,c)=>(t.push({n:r,p:l,...c}),t.length-1),i=e("LosangeProgressionContainer",null,{rt:z([.5,1],[.5,1],[0,mt[1].y],[588,130]),scale:[Lt,Lt]}),s=72+a*88,n=e("HorizontalGroup",i,{rt:z([0,1],[0,1],[293.55,-67.665],[s,100])}),o=e("WhiteBack",n,{rt:G([59.4668,-14.67],[-11.5985,0])});e("OutlineGlow",o,{rt:G([46,48],[0,-6]),img:{color:[0,0,0,.298],sprite:bi,type:1,ppum:3.47}}),e("Back",o,{rt:G(),img:st([1,1,1,1],3.68)});for(let r=0;r<a;r++){const l=e("LosangeProgressionDot",n,{rt:z([0,.5],[0,.5],[113+r*88,0],[88,70])});e("interLine",l,{rt:z([0,.5],[1,.5],[20,0],[-40,7],[0,.5]),img:{color:[.9216,.9216,.9216,1]}}),e("interLineFill",l,{rt:z([0,.5],[1,.5],[20,0],[-40,7],[0,.5]),img:{color:Bi,sprite:Ci,type:3,fill:{method:0,origin:0,amount:0}}});const c=e("Losange",l,{rt:z([0,.5],[0,.5],[0,0],[40,40])});e("Back",c,{rt:G(),img:st(Pi,9.8)});const p=e("BackCurrent",c,{rt:G(),scale:[0,0],img:st(Ei,9.8)});e("Icon",p,{rt:G([-10,-10]),img:{color:[1,1,1,1],sprite:_i}});const d=e("BackCompleted",c,{rt:G(),scale:[0,0],img:st(Si,9.8)});e("Bonus_Icon",d,{rt:G([-10,-10]),img:{color:[1,1,1,1],sprite:Ti}})}for(const r of["Left","Right"]){const l=r==="Right",c=e(r+"Preview",n,{rt:z([l?1:0,.5],[l?1:0,.5],[l?34:-44,0],[130,130]),img:st([1,1,1,1],5.11)}),p=e(r+"PreviewMask",c,{rt:G([-12,-12]),img:st(Mi,7.3),mask:1});e("Icon",p,{rt:G(),img:{color:[1,1,1,1]}});const d=e("LockOverlay",p,{rt:G(),off:l?0:1,img:{color:[.6887,.6887,.6887,l?.102:.643]}}),m=l?z([.5,.5],[.5,.5],[0,0],[85.77,85.77]):z([1,0],[1,0],[-24.8,30.7],[47.98,47.98]),g=e("LockPad",d,{rt:m,img:{color:[.4434,.4434,.4434,1],sprite:vi}});e("LockPad (1)",g,{rt:G(),img:{color:[1,1,1,1],sprite:xi}})}return e("NextWorld",i,{rt:z([.5,.5],[.5,.5],[201.55,-90.5],[200,50]),text:{t:"NEXT WORLD",size:20.6,color:[0,0,0,.698],font:"Exo-Black",mat:"Exo-Black SDF",align:2,valign:512,wrap:1}}),{nodes:t}}class ds {
  constructor(t, e) {
    this.game = t, this.root = e, this.open = !1, this.canClick = !1, this.timers = [], this.anims = [], this.coinTarget = i => t && t.ui && t.ui.hud ? t.ui.hud.counterIcon(i) : null, this.ready = this.build();
  }
  get winOpen() {
    return this.open;
  }
  async build() {
    ki(), this.canvas = X(this.root), this.canvas.classList.add("winPanel-canvas"), this.canvas.style.display = "none";
    const t = this.ui = await H("win", this.canvas, {
      translate: Q
    });
    t.root.classList.add("winPanel-root");
    for (const n of ["USELESSBANNER", "REF", "WinPanel_VIP_CollectX5_Btn"]) t.setActive(t.find(n), !1);
    this.levelText = t.find("CurrentLevelTMP"), this.top = t.el(t.find("TopContainer")), this.bottom = t.el(t.find("BottomPanel")), this.blockClick = t.el(t.find("BlockClick")), this.confettiOrigin = t.el(t.find("UISimpleConfetti")), this.confettiOrigin.classList.add("winPanel-fx"), t.defs.forEach((n, o) => {
      /PS$|Confetti|SparkAdd/.test(n.n) && t.el(o).classList.add("winPanel-fx");
    }), t.el(t.find("InnerColor")).style.overflow = "visible", t.defs.forEach((n, o) => {
      if (n.n !== "Mask") return;
      const r = t.el(o).querySelector(":scope > .u-img");
      r && (r.style.visibility = "hidden");
    }), this.buttonContainer = t.el(t.find("ButtonContainer"));
    const e = t.find("TitleContainer");
    this.title = t.findEl("Title", e), this.titleWhite = t.findEl("TitleWhite", e), this.green = t.findEl("Green", e), this.tick = t.find("Tick", e), this.normalBtn = this.button("WinPanel_simpleCollectBtn"), this.rvBtn = this.button("WinPanel_VIP_CollectX3_RV_Btn"), this.fakeBtn = this.button("WinPanel_VIP_CollectX3_FakeRV_Btn"), this.noThanksBtn = this.button("WinPanel_NoThanks_Btn"), t.setText(t.find("Text_TMP", this.noThanksBtn.i), A("COLLECT", "COLLECT")), this.normalBtn.onClick = () => this.onClickCollect(), this.flyLayer = document.createElement("div"), this.flyLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;", this.levelCount = j.game.levelCountPerBiome || 3;
    const i = this.progression = await H(Ii(this.levelCount), this.canvas, {
      fill: !1
    });
    i.root.style.bottom = `calc(100% + ${St * mt[1].y - 65}px)`, i.root.style.transformOrigin = "50% 50%";
    for (const n of ["LeftPreviewMask", "RightPreviewMask"]) i.findEl(n).style.borderRadius = 85.33 / 7.3 + "px";
    this.progressionContainer = i.root, this.dots = [];
    let s = -1;
    for (; (s = i.defs.findIndex((n, o) => o > s && n.n === "LosangeProgressionDot")) >= 0;) this.dots.push({
      cur: i.findEl("BackCurrent", s),
      done: i.findEl("BackCompleted", s),
      fill: i.find("interLineFill", s)
    });
    this.previewIcons = [i.find("Icon", i.find("LeftPreviewMask")), i.find("Icon", i.find("RightPreviewMask"))], this.setProgressionPos(0, !0), this.canvas.appendChild(this.flyLayer);
  }
  button(t, e = "Graphics") {
    const i = this.ui,
      s = i.find(t),
      n = i.el(s),
      o = {
        i: s,
        el: n,
        def: i.defs[s],
        graphics: i.findEl(e, s),
        counter: i.find("Counter_TMP", s),
        shine: i.findEl("ScrollShine", s),
        onClick: null
      };
    let r = 1;
    const l = (c, p) => {
      if (!o.graphics) return;
      const d = o.graphics.animate([{
        transform: `scale(${r})`
      }, {
        transform: `scale(${c})`
      }], {
        duration: 70,
        easing: Et,
        fill: "forwards"
      });
      r = c, p && (d.onfinish = p);
    };
    return n.addEventListener("pointerdown", () => {
      this.canClick && (o.down = !0, l(.85));
    }), n.addEventListener("pointerleave", () => {
      o.down && (o.down = !1, l(1));
    }), n.addEventListener("pointerup", () => {
      o.down && (o.down = !1, l(1.1, () => l(1)));
    }), n.addEventListener("click", () => {
      o.onClick && o.onClick();
    }), o;
  }
  setCounter(t, e) {
    t.counter >= 0 && this.ui.setText(t.counter, String(e));
  }
  startScrollShine(t) {
    if (!t.shine) return;
    const e = i => `calc(50% + ${i - .5 * 829.33}px)`;
    t.shineAnim = t.shine.animate([{
      left: e(-500)
    }, {
      left: e(600),
      offset: .5
    }, {
      left: e(600)
    }], {
      duration: 4e3,
      delay: 500,
      iterations: 1 / 0
    });
  }
  later(t, e) {
    const i = setTimeout(e, t * 1e3);
    return this.timers.push(i), i;
  }
  anim(t, e, i) {
    if (!t) return null;
    const s = t.animate(e, {
      fill: "both",
      ...i
    });
    return this.anims.push(s), s;
  }
  openWin(t, e, i) {
    this.open = !0, this.ready.then(() => this.show(t, e, i), s => {
      console.error("WinPanel build failed", String(s && s.stack || s)), this.open = !1, v.addCurrency("Soft", e), i && i();
    });
  }
  show(t, e, i) {
    const s = this.ui;
    this.onCollect = i, this.collected = e, this.pending = 0, this.clear(), this.canvas.style.display = "", s.setText(this.levelText, "LEVEL " + t), this.setCounter(this.normalBtn, e), this.setCounter(this.fakeBtn, e * 3), this.setCounter(this.rvBtn, e * 3);
    const n = v.d.fakeRVclaimMultiplierUsed;
    s.setActive(this.normalBtn.el, !0), s.setActive(this.rvBtn.el, !1), s.setActive(this.fakeBtn.el, !1), s.setActive(this.noThanksBtn.el, this.realRV && false);
    for (const o of [this.normalBtn, this.rvBtn, this.fakeBtn]) this.startScrollShine(o);
    this.setCanClick(!1), I.emit("winPanelOpened"), this.playShowAnimation(), this.setProgressionPos(1), this.updateProgression(!0), this.anim(this.top, [{
      transform: "translateY(-500px)"
    }, {
      transform: "none"
    }], {
      duration: 500,
      easing: Et
    });
  }
  setCanClick(t) {
    this.canClick = t, this.blockClick.style.pointerEvents = t ? "none" : "auto";
  }
  playShowAnimation() {
    const e = r => r * 1e3 / 2500,
      i = (r, l, c) => `calc(${r * 100}% + ${l - c}px)`,
      s = "cubic-bezier(0.333, 0, 0.667, 1)";
    this.anim(this.bottom, [{
      offset: 0,
      bottom: i(.5, -183.28, 161),
      height: "161px",
      opacity: 0,
      easing: s
    }, {
      offset: e(.25),
      bottom: i(.5, -84, 161),
      height: "161px",
      opacity: 1
    }, {
      offset: e(1.8333),
      bottom: i(.5, -84, 161),
      height: "161px",
      opacity: 1,
      easing: s
    }, {
      offset: 1,
      bottom: i(0, 741, 700),
      height: "700px",
      opacity: 1
    }], {
      duration: 2500
    }), this.anim(this.title, [{
      offset: 0,
      transform: "scale(5.8069)",
      opacity: 0
    }, {
      offset: e(.1833),
      opacity: 0,
      easing: s
    }, {
      offset: e(.25),
      transform: "scale(5.8069)",
      easing: "cubic-bezier(0.333, 0, 0.667, 0.667)"
    }, {
      offset: e(.5833),
      transform: "scale(1)",
      opacity: 1
    }, {
      offset: 1,
      transform: "scale(1)",
      opacity: 1
    }], {
      duration: 2500
    });
    const n = this.titleWhite.querySelector(".u-text");
    n && (n.style.color = "rgb(255,246,215)"), this.anim(this.titleWhite, [{
      offset: 0,
      opacity: 0
    }, {
      offset: e(.5833) - 1e-4,
      opacity: 0
    }, {
      offset: e(.5833),
      opacity: 1,
      easing: "cubic-bezier(0.333, 1.027, 0.667, 1)"
    }, {
      offset: e(1.3333),
      opacity: 0
    }, {
      offset: 1,
      opacity: 0
    }], {
      duration: 2500
    }), this.anim(this.titleWhite, [{
      offset: 0,
      transform: "scale(1)"
    }, {
      offset: e(.5833),
      transform: "scale(1)",
      easing: "cubic-bezier(0.333, 0.796, 0.667, 1)"
    }, {
      offset: e(1.3333),
      transform: "scale(3.1655)"
    }, {
      offset: 1,
      transform: "scale(3.1655)"
    }], {
      duration: 2500
    }), this.anim(this.green, [{
      offset: 0,
      transform: "scale(0)"
    }, {
      offset: e(1.0833),
      transform: "scale(0)",
      easing: "cubic-bezier(0.333, 0.448, 0.667, 1)"
    }, {
      offset: e(1.2833),
      transform: "scale(1.2245)",
      easing: s
    }, {
      offset: e(1.4),
      transform: "scale(0.8796)",
      easing: s
    }, {
      offset: e(1.6333),
      transform: "scale(1)"
    }, {
      offset: 1,
      transform: "scale(1)"
    }], {
      duration: 2500
    });
    const o = this.ui.el(this.tick).querySelector(".u-img");
    o && (o.style.clipPath = "inset(0 100% 0 0)", this.anim(o, [{
      offset: 0,
      clipPath: "inset(0 100% 0 0)"
    }, {
      offset: e(1.0833),
      clipPath: "inset(0 100% 0 0)"
    }, {
      offset: e(1.3333),
      clipPath: "inset(0 0% 0 0)"
    }, {
      offset: 1,
      clipPath: "inset(0 0% 0 0)"
    }], {
      duration: 2500
    })), this.later(.5833, () => this.playParticleBurstAE()), this.later(2.25, () => this.onShowFinishAE());
  }
  playParticleBurstAE() {
    const t = this.canvas._scale || 1,
      e = this.confettiOrigin.getBoundingClientRect(),
      i = (e.left + e.width / 2) / t,
      s = (e.top + e.height / 2) / t,
      n = ["#ff4d6d", "#ffd23f", "#3bceac", "#4d96ff", "#ff8c42", "#c77dff"];
    for (let o = 0; o < 60; o++) {
      const r = document.createElement("div");
      r.className = "winPanel-confetti";
      const l = 18 + Math.random() * 14,
        c = l * (.4 + Math.random() * .3);
      r.style.cssText += `width:${l}px;height:${c}px;background:${n[o % n.length]};`, this.flyLayer.appendChild(r);
      const p = Math.random() * Math.PI * 2,
        d = 500 + Math.random() * 900,
        m = Math.cos(p) * d,
        g = Math.sin(p) * d - 400,
        k = (Math.random() - .5) * 1440,
        C = 1400 + Math.random() * 800,
        b = r.animate([{
          transform: `translate(${i}px, ${s}px) rotate(0deg)`,
          opacity: 1
        }, {
          transform: `translate(${i + m * .6}px, ${s + g * .6}px) rotate(${k * .5}deg)`,
          opacity: 1,
          offset: .35
        }, {
          transform: `translate(${i + m}px, ${s + g + 900}px) rotate(${k}deg)`,
          opacity: 0
        }], {
          duration: C,
          easing: "cubic-bezier(0.2, 0.6, 0.4, 1)",
          fill: "forwards"
        });
      b.onfinish = () => r.remove(), this.anims.push(b);
    }
  }
  onShowFinishAE() {
    this.setCanClick(!0);
  }
  onClickCollect() {
    this.canClick && (I.emit("winChoice", "collect"), this.collectCoroutine(this.collected, this.normalBtn));
  }
  collectCoroutine(t, e) {
    this.setCanClick(!1);
    const i = j.ui.WinPanelCounterGainTimer || 2;
    this.ui.setText(e.counter, _e(t)), this.spawnCurrency("Soft", t, e);
    const s = performance.now(),
      n = () => {
        if (!this.open) return;
        const o = i - (performance.now() - s) / 1e3;
        o > 0 ? (this.setCounter(e, Math.round(t * (o / i))), requestAnimationFrame(n)) : this.setCounter(e, 0);
      };
    requestAnimationFrame(n), this.later(i, () => this.setCounter(e, 0)), this.later(i + .6, () => this.openNextPanel());
  }
  spawnCurrency(t, e, i) {
    e = Math.floor(e);
    const s = [];
    if (e <= ot) for (let c = 0; c < e; c++) s.push(1);else {
      const c = Math.floor(e / ot);
      let p = e % ot;
      for (let d = 0; d < ot; d++) p > 0 ? (s.push(c + (d === ot - 1 ? p : 1)), p--) : s.push(c);
    }
    const n = this.canvas._scale || 1,
      o = i.el.getBoundingClientRect(),
      r = i.def.rt.pivot,
      l = {
        x: (o.left + o.width * r[0]) / n,
        y: (o.top + o.height * (1 - r[1])) / n
      };
    this.pending += e, s.forEach((c, p) => this.later(p / 60, () => this.flyOne(t, c, l)));
  }
  flyOne(t, e, i) {
    const s = tt.data.currencies[t] || {},
      n = this.canvas._scale || 1,
      o = document.createElement("div");
    o.className = "winPanel-coin";
    const r = F + "ui/sprites/",
      l = F + "textures/";
    o.style.backgroundImage = t === "Soft" ? `url("${r}Moneey_263336.webp"), url("${r}MoneyOutline_96984c.webp")` : `url("${l}${s.icon}")`, o.style.width = o.style.height = L.size + "px", this.flyLayer.appendChild(o);
    const c = t === "SpecialObject" ? 1.2 : L.sizeRnd[0] + Math.random() * (L.sizeRnd[1] - L.sizeRnd[0]),
      p = Math.random() * Math.PI * 2,
      d = L.dirRnd[0] + Math.random() * (L.dirRnd[1] - L.dirRnd[0]),
      m = {
        x: Math.cos(p) * d,
        y: Math.sin(p) * d
      },
      g = {
        x: i.x,
        y: i.y
      };
    let k = 0,
      C = performance.now(),
      b = !1;
    const $ = () => {
        const P = this.coinTarget(t);
        if (!P || !P.offsetParent) return {
          x: 120,
          y: 120
        };
        const R = P.getBoundingClientRect();
        return {
          x: (R.left + R.width / 2) / n,
          y: (R.top + R.height / 2) / n
        };
      },
      N = P => {
        o.style.transform = `translate(${g.x - L.size / 2}px, ${g.y - L.size / 2}px) scale(${P})`;
      },
      y = () => {
        if (b) return;
        b = !0, this.credit(t, e);
        const P = $(),
          R = o.style.transform,
          ct = o.animate([{
            transform: R
          }, {
            transform: `translate(${P.x - L.size / 2}px, ${P.y - L.size / 2}px) scale(0)`
          }], {
            duration: 100,
            fill: "forwards"
          });
        ct.onfinish = () => o.remove();
        const Y = this.coinTarget(t);
        Y && Y.animate([{
          transform: "scale(1.25)"
        }, {
          transform: "scale(1)"
        }], {
          duration: 150
        });
      },
      V = P => {
        if (b || !o.isConnected) return;
        const R = Math.min(.05, (P - C) / 1e3);
        C = P, k += R;
        const ct = $();
        let Y = ct.x - g.x,
          ht = ct.y - g.y;
        const Nt = Y * Y + ht * ht;
        if (Nt <= L.maxSquareDist && k >= .2 || k > 4) {
          y();
          return;
        }
        const zt = Math.sqrt(Nt) || 1;
        Y /= zt, ht /= zt;
        const Ft = Bt(gi, k),
          Vt = Bt(mi, k) * L.maxSpeed;
        g.x += (m.x + (Y - m.x) * Ft) * Vt * R, g.y += (m.y + (ht - m.y) * Ft) * Vt * R, N(L.maxScale * c * Bt(fi, Math.min(1, k / .8))), requestAnimationFrame(V);
      };
    N(0), requestAnimationFrame(V);
  }
  credit(t, e) {
    e <= 0 || (this.pending -= e, v.addCurrency(t, e));
  }
  openNextPanel() {
    this.pending > 0 && (v.addCurrency("Soft", this.pending), this.pending = 0);
    const t = this.onCollect;
    this.onCollect = null, this.close(), t && t();
  }
  close() {
    this.open = !1, this.setCanClick(!1), this.clear(), this.flyLayer.innerHTML = "", this.canvas.style.display = "none", this.setProgressionPos(0, !0), I.emit("winPanelClosed");
  }
  clear() {
    for (const t of this.timers) clearTimeout(t);
    this.timers.length = 0;
    for (const t of this.anims) t.cancel();
    this.anims.length = 0;
    for (const t of [this.normalBtn, this.rvBtn, this.fakeBtn]) t && t.shineAnim && (t.shineAnim.cancel(), t.shineAnim = null);
  }
  setProgressionPos(t, e = !1) {
    const i = this.progressionContainer,
      s = mt[t],
      o = `translateY(${-(St * (s.y - mt[1].y))}px) scale(${Lt * St})`;
    if (this.progressionPos = t, e) {
      this.progressionAnim && this.progressionAnim.cancel(), i.style.opacity = s.alpha, i.style.transform = o;
      return;
    }
    const r = {
      opacity: getComputedStyle(i).opacity,
      transform: i.style.transform || o
    };
    i.style.opacity = s.alpha, i.style.transform = o, this.progressionAnim = i.animate([r, {
      opacity: s.alpha,
      transform: o
    }], {
      duration: 300,
      easing: Et
    }), this.anims.push(this.progressionAnim);
  }
  updateProgression(t) {
    const e = this.progression,
      i = tt.data.biomes,
      s = this.levelCount,
      n = v.d.totalLevelDoneCount,
      o = Math.floor(n / s) % i.length,
      r = n % s,
      l = F + "ui/sprites/";
    e.setImage(this.previewIcons[0], `${l}${i[o].name}Menu.webp`), e.setImage(this.previewIcons[1], `${l}${i[(o + 1) % i.length].name}Menu.webp`);
    for (const c of this.previewIcons) {
      const p = e.el(c).querySelector(".u-img");
      p.style.backgroundSize = "100% 100%", p.style.backgroundRepeat = "no-repeat";
    }
    this.dots.forEach((c, p) => {
      p < r ? this.updateDot(c, "done", p === r - 1 && t) : p === r ? this.updateDot(c, "current", t) : this.updateDot(c, "toBeDone", t);
    });
  }
  updateDot(t, e, i) {
    const s = this.progression;
    for (const l of t.anims || []) l.cancel();
    t.anims = [];
    const n = (l, c) => {
      l.style.transform = `scale(${c})`;
    };
    n(t.cur, 0), n(t.done, 0), s.setFill(t.fill, 0);
    const o = s.el(t.fill).querySelector(".u-img"),
      r = (l, c, p) => {
        const d = l.animate(c, {
          fill: "forwards",
          ...p
        });
        return t.anims.push(d), d;
      };
    e === "current" ? i ? r(t.cur, [{
      transform: "scale(0)"
    }, {
      transform: "scale(1)"
    }], {
      duration: 100,
      delay: 1500
    }).onfinish = () => r(t.cur, ie(.3, 6, .5), {
      duration: 700
    }) : n(t.cur, 1) : e === "done" && (n(t.cur, 1), i ? r(t.done, [{
      transform: "scale(0)"
    }, {
      transform: "scale(1)"
    }], {
      duration: 100
    }).onfinish = () => {
      r(t.done, ie(.3, 6, .5), {
        duration: 700
      }).onfinish = () => {
        r(o, [{
          clipPath: "inset(0 100% 0 0)"
        }, {
          clipPath: "inset(0 0% 0 0)"
        }], {
          duration: 500,
          easing: "linear"
        });
      };
    } : (n(t.done, 1), s.setFill(t.fill, 1)));
  }
}const Oi=F+"textures/",ut={pos:[0,1.751,-4.7],rot:[.1036605,0,0,.99461275],fov:27.4,aspect:1080/1920},se={pos:[.014326751,1.08,-1.6653905],rot:[-.31671733,-.63221055,-.63221055,.31671733]},Ai=[-.03,1.334,-2.6],Mt=10,ne=[16,8,10,6,10,9,4,11,6,3],Ri="crate_1__cb8d16.glb",oe=.5,Li=.36,Di="Assets/_GameAssets/Materials/Game/Collectible.mat",$i=[1,.9587445,.9496855],Gi=9.81,Ni=`
.cratePanel-root .u-node { pointer-events: none; }
.cratePanel-root .cratePanel-hit { pointer-events: auto; cursor: pointer; }
.cratePanel-root .cratePanel-block { pointer-events: auto; }
.cratePanel-3d { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.cratePanel-tapText { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); white-space: nowrap;
  font-family: "Exo-Black", sans-serif; font-size: 56px; line-height: 1; color: #fff; text-shadow: 0 7.5px 0 rgba(0,0,0,0.149); }
.cratePanel-fallback { position: absolute; left: 50%; top: 50%; width: 520px; height: 520px; margin: -260px 0 0 -260px; object-fit: contain; }
`;let ae=!1;function zi(){if(ae)return;ae=!0;const a=document.createElement("style");a.textContent=Ni,document.head.appendChild(a)}let It=null;function Fi(){return It||(It=Ae(Ri).then(a=>{if(!a)return null;let t=null;if(a.scene.traverse(d=>{d.isMesh&&!t&&(t=d)}),!t)return null;const e=t.geometry.index?t.geometry.toNonIndexed():t.geometry;e.computeBoundingBox();const i=e.boundingBox,s=i.getSize(new M),n=i.min,o=e.attributes.position,r=new Map,l=new M,c=new M;for(let d=0;d<o.count/3;d++){l.set(0,0,0);for(let k=0;k<3;k++)l.add(c.fromBufferAttribute(o,d*3+k));l.divideScalar(3);const m=k=>Math.min(2,Math.max(0,Math.floor((l[k]-n[k])/s[k]*3))),g=m("x")+m("y")*3+m("z")*9;r.has(g)||r.set(g,[]),r.get(g).push(d)}const p=[];for(const d of r.values()){const m=new ii;for(const[k,C]of Object.entries(e.attributes)){const b=C.itemSize,$=new C.array.constructor(d.length*3*b);d.forEach((N,y)=>$.set(C.array.subarray(N*3*b,N*3*b+3*b),y*3*b)),m.setAttribute(k,new si($,b))}m.computeBoundingBox();const g=m.boundingBox.getCenter(new M);m.translate(-g.x,-g.y,-g.z),p.push({geometry:m,center:g})}return{parts:p,size:s}})),It}class us{constructor(t,e){this.game=t,this.root=e,this.isOpen=!1,this.canClick=!1,this.fragments=[],this.puffs=[],this.sparkles=[],this.clock=new Ne,window.addEventListener("keydown",i=>{!this.isOpen||i.code!=="Space"||(i.preventDefault(),!(!this.canClick||i.repeat)&&(this.tapActive?this.tapCrate():this.claimActive&&this.claimObject()))})}get crateOpen(){return this.isOpen}async build(){return this.building||(this.building=(async()=>{zi(),this.canvas=X(this.root),this.canvas.classList.add("cratePanel-root");const t=await rt("crate"),e=t.nodes.find(d=>d.n==="Special_Crate_TMP");e&&Object.assign(e.text,{wrap:0,auto:1,max:e.text.size});const i=this.ui=await H(t,this.canvas,{translate:Q}),s=d=>i.findEl(d);i.root.style.display="none",this.modal=s("Modal"),this.modal.classList.add("cratePanel-block"),this.view=s("CrateCameraTexture"),this.view.querySelector(":scope > .u-img").style.background="none",this.tuto=s("MashTuto"),this.claimContainer=s("Claim_Container"),this.tapBtn=s("Tap_To_Open_Btn"),this.countText=s("Crate_Amount_TMP"),this.titleCount=s("TitleBack"),this.nameText=s("Title"),this.earningText=s("EarningText");const n=i.find("Crate_Opening_Claim_Btn");this.claimGraphics=i.findEl("Graphics",n);const o=[i.find("Mask",n),i.find("InnerMask",n),i.find("InnerMask",i.find("PanelBack"))];for(const d of o){const m=d>=0&&i.el(d).querySelector(":scope > .u-img");m&&(m.style.display="none")}i.defs.forEach((d,m)=>{const g=d.mask&&d.img&&d.img.sprite;g&&g.border&&(i.el(m).style.borderRadius=g.border[0]*(100/g.ppu)/(d.img.ppum||1)+"px")});const r=i.findEl("Counter_TMP (1)",n);r.parentNode.appendChild(r),this.stroke(r,68,[.3351539,.764151,.14898534],null),this.stroke(s("Title"),62,[.3490566,.24159546,.1536727],.4),s("EarningCounter").style.translate="-50% 0";const l=s("TitleText");this.tapText=document.createElement("div"),this.tapText.className="cratePanel-tapText",this.tapText.textContent=A("TAP TO OPEN","TAP TO OPEN"),l.appendChild(this.tapText),this.playMashLoop();const c=i.findEl("Hitbox",i.find("Tap_To_Open_Btn"));c.classList.add("cratePanel-hit"),c.addEventListener("click",()=>{this.canClick&&(O.play("click"),this.tapCrate())});const p=i.findEl("Hitbox",i.find("Crate_Opening_Claim_Btn"));p.classList.add("cratePanel-hit"),p.addEventListener("pointerdown",()=>this.pressButton(!0)),p.addEventListener("pointerup",()=>this.pressButton(!1)),p.addEventListener("click",()=>{this.canClick&&(O.play("click"),this.claimObject())}),this.build3D()})()),this.building}playMashLoop(){const t=this.ui,e=t.el(t.find("Spark")),i=t.el(t.find("Spark",t.find("Spark"))),s=t.findEl("HandContainer"),n={duration:1e3/3,iterations:1/0};s.animate([{translate:"0 0"},{translate:"11px 16.9px",offset:.45},{translate:"0 0"}],n),e.animate([{translate:"0 0",scale:"1"},{translate:"-5px -6.4px",scale:"1.2121",offset:.8},{translate:"0 0",scale:"1"}],n),i.animate([{opacity:1},{opacity:0,offset:.8},{opacity:1}],n),this.tapText.animate([{opacity:1},{opacity:.355,offset:.467},{opacity:1}],{duration:1e3,iterations:1/0})}stroke(t,e,i,s){const n=t&&t.querySelector(":scope > .u-text");if(!n)return;const o=i.map(r=>Math.round(r*255)).join(",");n.style.webkitTextStroke=`${e*.15*.8}px rgb(${o})`,n.style.paintOrder="stroke fill",n.style.textShadow=s?`0 ${e*s*.15}px 0 #000`:"none"}pressButton(t){const e=this.claimGraphics;e&&e.animate(t?[{transform:"scale(1)"},{transform:"scale(0.85)"}]:[{transform:"scale(0.85)"},{transform:"scale(1.1)"},{transform:"scale(1)"}],{duration:t?70:140,fill:"forwards",easing:"ease-out"})}build3D(){try{this.renderer=new ze({alpha:!0,antialias:!0})}catch{this.renderer=null;return}this.renderer.outputColorSpace=Fe,this.renderer.setClearColor(0,0),this.renderer.domElement.className="cratePanel-3d",this.view.appendChild(this.renderer.domElement);const t=this.scene=new Ve;t.add(new We(new Ue(.9056604,.9056604,.9056604),.72*Math.PI));const e=new He(16777215,.42*Math.PI);e.position.set(-2,4,3),t.add(e);const i=this.camera=new qe(ut.fov,ut.aspect,.1,50);bt(ut.pos,i.position),Wt(ut.rot,i.quaternion),this.crateTFM=new vt,bt(se.pos,this.crateTFM.position),Wt(se.rot,this.crateTFM.quaternion),t.add(this.crateTFM),this.frontPos=bt(Ai),this.crateMat=Be(Di,{color:$i,sat:1}),this.crateMat.side=je,this.puffMat=new Xe({color:16777215,transparent:!0,depthWrite:!1}),this.puffGeo=new Qe(1,1);const s=new Ye().load(F+"ui/sprites/StarFill_white_5cfe09.webp");this.sparkMat=new Ke({map:s,color:16769354,transparent:!0,depthWrite:!1,blending:Je})}async initCrate(t){if(this.clear3D(),!this.renderer)return this.fallback2D(t);const[e,i]=await Promise.all([Fi().catch(()=>null),t.prefab?Me("prefabs/"+t.prefab+".json").catch(()=>null):null]);if(!e)return this.fallback2D(t);const s=this.crate=new vt;this.crateTFM.add(s);const n=new Xt,o=new Ze().setFromAxisAngle(new M(0,1,0),Math.atan2(.8,-.6));n.quaternion.copy(this.crateTFM.quaternion).invert().multiply(o),n.scale.setScalar(oe/Math.max(e.size.x,e.size.z)),s.add(n);const r=new M(0,.6,1).applyQuaternion(o.clone().invert()),l=e.parts.map(m=>({...m,score:m.center.x*r.x/e.size.x+m.center.y*r.y/e.size.y+m.center.z*r.z/e.size.z}));l.sort((m,g)=>g.score-m.score);const c=ne.reduce((m,g)=>m+g,0);this.cells=[];let p=0;for(let m=0;m<Mt;m++){const g=Math.round(p/c*l.length);p+=ne[m];const k=Math.round(p/c*l.length);this.cells.push(l.slice(g,k).map(C=>{const b=new Qt(C.geometry,this.crateMat);return b.position.copy(C.center),n.add(b),b}))}this.crateHP=Mt;const d=this.object=new vt;if(s.add(d),i){for(const b of i.nodes){const $=b.userData.model&&b.userData.model.children[0];if(!$||$.children.length!==1)continue;const N=$.children[0];N.position.set(0,0,0),N.quaternion.identity(),N.scale.setScalar(1)}const m=new Xt;m.add(i.root),m.updateMatrixWorld(!0);const g=new ti().setFromObject(m),k=g.getSize(new M),C=Li/Math.max(1e-6,k.x,k.y,k.z);m.scale.setScalar(C),m.position.copy(g.getCenter(new M)).multiplyScalar(-C),d.add(m)}this.crateTFM.scale.setScalar(0),K(this.crateTFM),Ie(this.crateTFM,1,.8,0).setEase(dt.OutBack),this.startLoop()}fallback2D(t){this.flat=document.createElement("img"),this.flat.className="cratePanel-fallback",this.flat.src=F+"ui/sprites/Crate_18370c.webp",this.flat.dataset.icon=t.icon?Oi+t.icon:"",this.view.appendChild(this.flat),this.flat.animate([{transform:"scale(0)"},{transform:"scale(1.1)"},{transform:"scale(1)"}],{duration:800}),this.crateHP=Mt}clear3D(){for(const t of this.fragments)t.mesh.removeFromParent();for(const t of[...this.puffs,...this.sparkles])this.removeParticle(t);this.fragments.length=this.puffs.length=this.sparkles.length=0,this.object&&K(this.object),this.crate&&(K(this.crate),this.crate.removeFromParent()),this.crate=this.object=this.cells=null,this.flat&&(this.flat.remove(),this.flat=null)}breakCrate(){if(!(this.crateHP<=0)){if(this.crateHP--,this.flat)this.flat.animate([{transform:"scale(0.4)"},{transform:"scale(1)"}],{duration:200}),this.crateHP<=0&&this.flat.dataset.icon&&(this.flat.src=this.flat.dataset.icon);else if(this.crate){const t=this.crate;this.smoke(),K(t),t.scale.setScalar(1),t.rotation.set(0,0,0);const e=new M().randomDirection().multiplyScalar(Math.random()*Yt.degToRad(10));new Ct(t,.2,(s,n)=>{t.scale.setScalar(1-.6*Math.sin(n*Math.PI)*(1-n));const o=Math.sin(n*Math.PI*4)*(1-n);t.rotation.set(e.x*o,e.y*o,e.z*o)}).setEase(dt.Linear).onComplete(()=>{t.scale.setScalar(1),t.rotation.set(0,0,0)});const i=t.getWorldPosition(new M);for(const s of this.cells[this.cells.length-1-this.crateHP]||[]){this.scene.attach(s);const n=s.position.clone().sub(i),o=n.length();n.y+=.1,n.normalize();const r=n.multiplyScalar(5*Math.max(.2,1-o/2)),l=new M().randomDirection().multiplyScalar(6+Math.random()*8);this.fragments.push({mesh:s,v:r,w:l,life:2.5})}}if(!(this.crateHP>0)){if(this.object){const t=this.object;K(t);const e=t.position.clone(),i=new M;new Ct(t,.5,s=>t.position.lerpVectors(e,this.crate.worldToLocal(i.copy(this.frontPos)),s)).onComplete(()=>{const s=Yt.degToRad(-10);new Ct(t,3,n=>t.rotation.set(0,0,s*n)).setLoops(-1,!0).setEase(dt.InOutSine)}),this.sparkle()}this.endCrateOpening()}}}removeParticle(t){t.mesh.removeFromParent(),t.mesh.material.dispose()}smoke(){const t=this.crate.getWorldPosition(new M);for(let e=0;e<10;e++){const i=new Qt(this.puffGeo,this.puffMat.clone());i.position.copy(t).add(new M().randomDirection().multiplyScalar(oe*.45)),this.scene.add(i),this.puffs.push({mesh:i,t:0,dur:.45+Math.random()*.2,s:.06+Math.random()*.06})}}sparkle(){for(let t=0;t<12;t++){const e=new ei(this.sparkMat.clone());e.position.copy(this.frontPos).add(new M((Math.random()-.5)*.7,(Math.random()-.5)*.6,(Math.random()-.5)*.2)),e.scale.setScalar(0),this.scene.add(e),this.sparkles.push({mesh:e,t:-Math.random()*1.2,dur:.6+Math.random()*.5,s:.05+Math.random()*.05})}}startLoop(){if(this.raf)return;this.clock.getDelta();const t=()=>{if(!this.isOpen){this.raf=0;return}this.raf=requestAnimationFrame(t),this.render(Math.min(this.clock.getDelta(),.1))};this.raf=requestAnimationFrame(t)}render(t){if(!this.renderer)return;for(let n=this.fragments.length-1;n>=0;n--){const o=this.fragments[n];o.v.y-=Gi*t,o.mesh.position.addScaledVector(o.v,t),o.mesh.rotation.x+=o.w.x*t,o.mesh.rotation.y+=o.w.y*t,o.mesh.rotation.z+=o.w.z*t,(o.life-=t)<=0&&(o.mesh.removeFromParent(),this.fragments.splice(n,1))}for(let n=this.puffs.length-1;n>=0;n--){const o=this.puffs[n],r=(o.t+=t)/o.dur;if(r>=1){this.removeParticle(o),this.puffs.splice(n,1);continue}o.mesh.scale.setScalar(o.s*(.4+dt.OutQuad(r))),o.mesh.material.opacity=.745-.392*r,o.mesh.material.color.setScalar(1-.274*Math.min(1,r/.902))}for(const n of this.sparkles){n.t+=t;const o=(n.t%(n.dur*2)+n.dur*2)%(n.dur*2)/n.dur;n.mesh.scale.setScalar(n.t<0?0:n.s*Math.sin(Math.min(o,1)*Math.PI))}const e=this.view.getBoundingClientRect(),i=Math.max(1,Math.round(e.width)),s=Math.max(1,Math.round(e.height));(i!==this.vw||s!==this.vh)&&(this.vw=i,this.vh=s,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.setSize(i,s,!1)),this.renderer.render(this.scene,this.camera)}async openCrate(t,e){if(this.isOpen)return;this.isOpen=!0,this.canClick=!1,this.onClaim=e,this.collectible=t;try{await this.build()}catch(r){console.warn("[CratePanel] build failed",r),this.canvas&&this.canvas.remove(),this.building=null,this.isOpen=!1,this.onClaim=null,e&&e();return}const i=this.ui;I.emit("crateOpeningPanel",!0),i.root.style.display="",i.findEl("Special_Crate_TMP")?.querySelector(":scope > .u-text")?._fit?.(),this.setClaimActive(!1);const s=tt.data.biomes.reduce((r,l)=>r+(l.collectibles||[]).length,0),n=`${v.d.collectedList.length+1}/${s}`;i.setText(this.countText,n),i.setText(this.titleCount,n),i.setText(this.earningText,`+${_e(t.offlineEarningPerDay)}/${A("Day","Day")}`);const o=t.displayName.toUpperCase();i.setText(this.nameText,A(o,o)),this.tutoTween&&this.tutoTween.kill(),this.setAlpha(this.tuto,0),this.setAlpha(this.modal,0),K(this.modal),this.fade(this.modal,1,1);try{await this.initCrate(t)}catch(r){console.warn("[CratePanel] 3D crate failed",r),this.clear3D(),this.fallback2D(t)}this.isOpen&&(this.startCrateOpening(),Ut(.4,()=>{this.isOpen&&(this.canClick=!0)}))}startCrateOpening(){this.tapTimer&&(this.tapTimer.kill(),this.tapTimer=null),this.tutoTween&&this.tutoTween.kill(),this.tutoTween=this.fade(this.tuto,1,.2),this.setTapActive(!0),this.setClaimActive(!1)}tapCrate(){this.tapActive&&(O.play("tapCode"),this.breakCrate(),this.tutoTween&&this.tutoTween.kill(),this.tutoTween=this.fade(this.tuto,0,.5),this.tapTimer&&this.tapTimer.kill(),this.tapTimer=Ut(1,()=>{this.tapTimer=null,this.tutoTween&&this.tutoTween.kill(),this.tutoTween=this.fade(this.tuto,1,.2)}))}endCrateOpening(){this.setTapActive(!1),this.setClaimActive(!0)}claimObject(){if(!this.claimActive)return;this.canClick=!1,this.setClaimActive(!1),this.isOpen=!1,this.tapTimer&&(this.tapTimer.kill(),this.tapTimer=null),this.tutoTween&&this.tutoTween.kill(),K(this.modal),this.ui.root.style.display="none",this.clear3D(),I.emit("crateOpeningPanel",!1);const t=this.onClaim;this.onClaim=null,t&&t()}setTapActive(t){this.tapActive=t,this.ui.setActive(this.tapBtn,t)}setClaimActive(t){this.claimActive=t,this.ui.setActive(this.claimContainer,t)}setAlpha(t,e){t._alpha=e,t.style.opacity=e}fade(t,e,i){const s=t._alpha!=null?t._alpha:1;return Oe(s,e,i,n=>this.setAlpha(t,n),t)}}const w={whiteCircle:{file:"white_circle_ea3492.webp",w:512,h:512,ppu:300,border:[256,256,256,256]},whiteCircle1Empty:{file:"white_circle1_empty_7a6381.webp",w:512,h:512,ppu:100,border:[256,256,256,256]},moneyStack:{file:"MoneyStack2_de9571.webp",w:512,h:512,ppu:100},moneyStackGlow:{file:"MoneyStack_glow_4f3ade.webp",w:512,h:512,ppu:100},chrono:{file:"icon_chrono_21ca35.webp",w:512,h:512,ppu:100},crossThin:{file:"icon_cross_thin_61c06c.webp",w:2e3,h:2e3,ppu:100},sunburst:{file:"sunburst_6e27a8.webp",w:792,h:792,ppu:100},arrowPlay:{file:"icon_arrow_play.webp",w:512,h:512,ppu:100}},Vi=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","Un","Du"];function kt(a,t=6,e=3){const i=String(Math.floor(Math.abs(a)));if(i.length<=t)return String(Math.floor(a));const s=Math.floor((i.length-1)/3),n=i.length%3||3;let o=i.slice(0,n);return t-n>0&&(o+="."+i.slice(n,n+Math.min(t-n,e))),(a<0?"-":"")+parseFloat(o)+Vi[s]}const Wi=a=>({file:"../../textures/"+a}),T=(a,t,e,i,s=[.5,.5])=>({amin:a,amax:t,pos:e,size:i,pivot:s}),f=(a,t,e,i)=>T(a,a,t,e,i),h=(a=[0,0],t=[0,0],e)=>T([0,0],[1,1],t,a,e),u=(a,t,e={})=>({color:a,sprite:t,type:t&&t.border?1:0,...e}),S=(a,t,e={})=>({t:a,size:t,color:[1,1,1,1],font:"Exo-Black",mat:"Exo-Black SDF BigDarkStroke",align:2,valign:512,auto:0,min:18,max:72,style:0,wrap:1,...e}),$t=(a,t)=>a.border[0]*(100/a.ppu)/t;class it{constructor(){this.nodes=[]}add(t,e,i,s={}){return this.nodes.push({n:t,p:e,rt:i,...s})-1}graft(t,e,i,s){const n=new Map;return t.nodes.forEach((o,r)=>{const l=r===e?i:n.get(o.p);if(r!==e&&l===void 0)return;const c=JSON.parse(JSON.stringify(o));c.p=l,delete c.c,r===e&&(s&&(c.rt=s),delete c.off),n.set(r,this.nodes.push(c)-1)}),n.get(e)}static find(t,e,i=null){const s=i==null?-1:t.nodes.findIndex(n=>n.n===i);return t.nodes.findIndex((n,o)=>{if(n.n!==e)return!1;if(s<0)return!0;for(let r=n.p;r!=null;r=t.nodes[r].p)if(r===s)return!0;return!1})}findIn(t,e){return this.nodes.findIndex((i,s)=>{if(i.n!==t)return!1;for(let n=i.p;n!=null;n=this.nodes[n].p)if(n===e)return!0;return!1})}edit(t,e){return t>=0&&e(this.nodes[t]),this}graftButton(t,e,i,s){const n=this.graft(t,it.find(t,e),i,s);return this.nodes.forEach((o,r)=>{o.n==="Mask"&&o.img&&(r===n||this.findIn("Mask",n)===r)&&(o.img.color=[...o.img.color.slice(0,3),0])}),n}json(t){return{source:t,nodes:this.nodes}}}function wt(a){a.defs.forEach((t,e)=>{const i=t.mask&&t.img&&t.img.sprite;i&&i.border&&(a.el(e).style.borderRadius=$t(i,t.img.ppum||1)+"px")})}function W(a,t){const e=a.firstElementChild||a;a.style.pointerEvents="auto",a.style.cursor="pointer";const i=s=>{e.style.transition="transform .07s cubic-bezier(0.5, 1, 0.89, 1)",e.style.transform=s===1?"":`scale(${s})`};a.addEventListener("pointerdown",s=>{s.stopPropagation(),i(.85)}),a.addEventListener("pointerleave",()=>i(1)),a.addEventListener("pointerup",()=>i(1)),a.addEventListener("click",s=>{s.stopPropagation(),i(1),e.animate&&e.animate([{transform:"scale(1.1)"},{transform:"scale(1)"}],{duration:140,easing:"ease-out"}),O.play("click"),t()})}function B(a,t,e,i,s,n=0){const o=getComputedStyle(a)[t];a.style[t]=e,a.animate&&o!==e&&a.animate([{[t]:o},{[t]:e}],{duration:i*1e3,easing:s,delay:n*1e3,fill:"backwards"})}const D={OutQuad:"cubic-bezier(0.5, 1, 0.89, 1)",OutBack:"cubic-bezier(0.34, 1.56, 0.64, 1)",InBack:"cubic-bezier(0.36, 0, 0.66, -0.56)"},U=a=>new Promise(t=>setTimeout(t,a*1e3));let re=!1;function Ui(){if(re)return;re=!0;const a=document.createElement("style");a.textContent=`
.offlineearning-canvas { z-index: 6; }
.offlineearning-block { pointer-events: auto; }
@keyframes offlineearning-rays { to { transform: rotate(360deg); } }
.offlineearning-rays > .u-img { animation: offlineearning-rays 12s linear infinite; }
.offlineearning-glowfx { position: absolute; inset: 0; isolation: isolate; pointer-events: none; }
.offlineearning-glowfx > .u-img + .u-img { mix-blend-mode: plus-lighter; }
`,document.head.appendChild(a)}const le=[1,.49803925,.11764707,1],ce=[0,0,.2,.29803923];async function Hi(){const a=await rt("win"),t=new it,e=t.add("OfflineEarningPopup",null,h(),{img:u([0,0,0,1])}),i=t.add("PanelBack",e,f([.5,.5],[0,0],[1012.2766,1500]));t.add("Outline",i,h(),{img:u([1,.75294125,.1137255,1],w.whiteCircle1Empty,{ppum:4.4})});const s=t.add("LargeMask",i,h([-12,-12]),{img:u([1,.6117647,.1137255,1],w.whiteCircle,{ppum:1.7}),mask:1}),n=t.add("InnerMask",s,h([-16,-16]),{mask:1});t.add("Title",n,f([.5,1],[0,-64.87781],[984.2766,104.32001]),{text:S("OFFLINE EARNINGS",66.44,{valign:4096})});const o=t.add("OfflineEarningPopup_CloseBtn",n,f([1,1],[-71.93829,-68.177795],[86.42871,86.42871]),{off:1}),r=t.add("Active",t.add("Graphics",o,h()),h());t.add("Outline",r,h([12,12]),{img:u(le,w.whiteCircle,{ppum:2.49})});const l=t.add("ShadowColor",r,h(),{img:u([1,.6117647,.1137255,1],w.whiteCircle,{ppum:3}),mask:1});t.add("Title_Icon",l,h([-21.7571,-21.7571]),{img:u([1,1,1,1],w.crossThin,{preserve:1})}),t.add("Hitbox",o,h());const c=t.add("BottomColor",n,h([0,-145.89062],[0,0],[.5,0]),{img:u(le),mask:1});t.add("UIRay_FX",c,f([.5,1],[0,-301.93256],[1100,1100]),{img:u([1,1,1,.22],w.sunburst,{preserve:1})});const p=t.add("MoneyStackGlow",c,f([.5,1],[-19,-306.47235],[452.3038,452.30383]),{scale:[1.2945137,1.2945137],img:u([1,1,1,1],w.moneyStackGlow,{preserve:1})});t.add("MoneyStack",p,h(),{img:u([1,1,1,1],w.moneyStack,{preserve:1})});const d=t.add("Time",c,f([.5,1],[-210,-703.9325],[391.5,100]));t.add("CurrencyCounterBackground",d,h([0,44.523],[0,0],[.5,0]),{img:u(ce,w.whiteCircle,{ppum:2.51})}),t.add("Title",d,f([.5,1],[0,-20],[353.6361,100],[.5,.16]),{text:S("You were away for:",35.4,{mat:"Exo-Black SDF"})});const m=t.add("IconOutline",t.add("SoftIcon",d,f([0,1],[75,-45],[65,100])),h());t.add("Icon",m,h(),{img:u([1,1,1,1],w.chrono,{preserve:1}),fx:[{type:"Shadow",dist:[0,-6],color:[0,0,0,.29803923]}]}),t.add("TimeText",d,f([0,1],[222.48454,-84],[277.769,100],[.5,.16]),{text:S("00:02:00",50)});const g=t.add("Earn",c,f([.5,1],[210,-703.9325],[391.5,100]),{layout:{type:"HorizontalLayoutGroup",spacing:11,align:4,pad:[6,17,0,0],ctrlW:1,ctrlH:0,expW:0,expH:0,reverse:0}});t.add("CurrencyCounterBackground",g,h([0,44.523],[0,0],[.5,0]),{img:u(ce,w.whiteCircle,{ppum:2.51}),le:{m_IgnoreLayout:1}});const k=t.graft(a,it.find(a,"SoftIcon","WinPanel_VIP_CollectX3_RV_Btn"),g,f([0,0],[0,0],[0,100]));t.edit(k,C=>{C.le={m_MinWidth:72,m_PreferredWidth:72}});for(const C of["BurstPS","LoopPS","PlusBack"])t.edit(t.findIn(C,k),b=>{b.off=1});return t.edit(t.findIn("IconOutline",k),C=>{C.fx=[{type:"Shadow",dist:[0,-6],color:[0,0,0,.14901961]}]}),t.add("GainText",g,f([0,0],[0,0],[0,100],[.5,.16]),{text:S("15",50,{max:50,wrap:0})}),t.add("Title",g,f([.5,1],[0,-19.999878],[353.6361,100],[.5,.16]),{text:S("Received income:",35.4,{mat:"Exo-Black SDF"}),le:{m_IgnoreLayout:1}}),t.graftButton(a,"WinPanel_VIP_CollectX3_RV_Btn",c,f([.5,1],[0,-915.9325],[657.9,232.58002])),t.graftButton(a,"WinPanel_NoThanks_Btn",c,f([.5,.5],[0,-524],[657.9,232.58])),t.add("BlockClick",e,h()),t.json("Assets/_GameAssets/Prefabs/UI/Popups/OfflineEarningPopup.prefab")}const he=[1,.9886757,.4764151,.23921569];function qi(a){const t=a.querySelector(":scope > .u-img"),e=document.createElement("div");e.className="offlineearning-glowfx",a.insertBefore(e,t),e.appendChild(t);const i=t.cloneNode();Object.assign(i.style,{backgroundRepeat:"no-repeat",backgroundPosition:"center",backgroundSize:"contain"}),e.appendChild(i),Rt(w.moneyStackGlow.file,he).then(o=>{o&&(i.style.backgroundImage=`url("${o}")`)});const s=o=>o*o*(3-2*o),n=[[],[]];for(let o=0;o<=20;o++){const r=o/20,l=s(r<.5?r*2:(1-r)*2),c=1+(he[3]-1)*l;n[0].push({opacity:c*(1-l)}),n[1].push({opacity:c*l})}t.style.opacity="1",i.style.opacity="0",t.animate&&(t.animate(n[0],{duration:5e3,iterations:1/0}),i.animate(n[1],{duration:5e3,iterations:1/0}))}function ji(a){const t=Math.max(0,Math.floor(a*60)),e=i=>String(i).padStart(2,"0");return`${e(Math.floor(t/3600)%24)}:${e(Math.floor(t/60)%60)}:${e(t%60)}`}class fs {
  constructor(t, e) {
    this.game = t, this.root = e, this.isOpen = !1, this.showDuration = .4, this.hideDuration = .4;
  }
  async init() {
    return this.ready || (this.ready = this.build()), this.ready;
  }
  async build() {
    Ui(), this.canvas = X(this.root), this.canvas.classList.add("offlineearning-canvas");
    const t = this.ui = await H(await Hi(), this.canvas, {
      translate: Q
    });
    this.el = t.root, this.el.style.display = "none", this.modal = this.el.querySelector(":scope > .u-img"), this.panel = t.findEl("PanelBack"), this.panel.style.transformOrigin = "50% 50%", wt(t), t.findEl("InnerMask").style.borderRadius = $t(w.whiteCircle, 1.85) + "px", t.findEl("UIRay_FX").classList.add("offlineearning-rays"), qi(t.findEl("MoneyStackGlow")), this.timeText = t.find("TimeText"), this.gainText = t.find("GainText");
    const e = t.find("WinPanel_VIP_CollectX3_RV_Btn");
    this.rvCounter = t.find("Counter_TMP", e), t.setActive(e, !1);
    const i = t.find("WinPanel_NoThanks_Btn");
    this.noThanks = t.el(i), t.setText(t.find("Text_TMP", i), A("COLLECT", "COLLECT")), W(this.noThanks, () => this.onCollectCoins()), this.blocker = t.findEl("BlockClick"), this.blocker.classList.add("offlineearning-block");
  }
  set canClick(t) {
    this.blocker.style.display = t ? "none" : "";
  }
  async open(t, e, i, s = 1) {
    if (await this.init(), this.isOpen) return;
    this.isOpen = !0, this.collected = !1, this.token = (this.token || 0) + 1;
    const n = this.token;
    this.gain = Math.floor(t), this.ui.setText(this.gainText, kt(this.gain, 3)), this.ui.setText(this.timeText, ji(e)), this.ui.setText(this.rvCounter, kt(this.gain * 3, 3)), this.el.style.display = "", this.el.style.pointerEvents = "auto", this.modal.style.opacity = "0", this.panel.style.transform = "scale(0)", this.canClick = !1, this.noThanks.style.opacity = "1", I.emit("offlineEarningOpened"), await U(s), n === this.token && (B(this.modal, "opacity", "0.65882355", this.showDuration, D.OutQuad), B(this.panel, "transform", "scale(1)", .5, D.OutQuad), await U(this.showDuration), n === this.token && (this.canClick = !0));
  }
  onCollectCoins() {
    this.collected || (this.collected = !0, this.canClick = !1, v.addCurrency("Soft", this.gain), this.close());
  }
  async close() {
    if (!this.isOpen) return;
    this.canClick = !1;
    const t = ++this.token;
    B(this.modal, "opacity", "0", this.hideDuration, D.OutQuad), B(this.panel, "transform", "scale(0)", this.hideDuration, D.OutQuad), await U(this.hideDuration), t === this.token && (this.el.style.display = "none", this.el.style.pointerEvents = "", this.isOpen = !1, I.emit("offlineEarningClosed"));
  }
}const pe=[1,.49803925,.11764707,1],Xi=new M(0,0,0),de={x:0,y:100};let ue=!1;function Qi(){if(ue)return;ue=!0;const a=document.createElement("style");a.textContent=".trashbubble-canvas { z-index: 4; }",document.head.appendChild(a)}async function Yi(){const a=await rt("win"),t=new it,e=t.add("TrashBinPopup",null,f([0,0],[0,0],[0,0])),i=t.add("PanelBack",e,f([.5,.5],[0,238],[768.0115,293.2456]));t.add("Outline",i,h(),{img:u([1,.75294125,.1137255,1],w.whiteCircle1Empty,{ppum:4.4})});const s=t.add("LargeMask",i,h([-12,-12]),{img:u([1,.6117647,.1137255,1],w.whiteCircle,{ppum:1.7}),mask:1}),n=t.add("InnerMask",s,h([-16,-16]),{mask:1});t.add("Triangle",i,f([.5,.5],[0,-176],[166.9347,224.10779]),{rot:-90,img:u(pe,w.arrowPlay)});const o=t.add("BottomColor",n,h([0,-91.8185],[0,0],[.5,0]),{img:u(pe),mask:1}),r=t.graftButton(a,"WinPanel_VIP_CollectX3_RV_Btn",o,f([.5,1],[0,-86.714],[637.3989,138.9576]));t.edit(t.findIn("Title_HorizontalGroup",r),l=>{l.rt=h(),delete l.layout});for(const l of["Counter_HorizontalGroup","Title_IconContainer"])t.edit(t.findIn(l,r),c=>{c.off=1});return t.edit(t.findIn("AdContainer (1)",r),l=>{l.rt=f([0,1],[87,-61.979],[174,163.85]),delete l.le}),t.edit(t.findIn("Ad_RV_Icon",t.findIn("AdContainer (1)",r)),l=>{l.rt=h([0,0],[0,-5])}),t.edit(t.findIn("Title_TMP",r),l=>{l.rt=f([0,1],[390,-63.293],[389.8471,126.5867]),l.text=S("CLAIM",49.9,{valign:4096,min:30,max:70})}),t.add("Title",n,f([.5,1],[0,76293945e-12],[513.9199,91.819],[.5,1]),{text:S("Empty your bag",45.06,{valign:4096,style:16})}),t.json("Assets/_GameAssets/Prefabs/UI/Popups/TrashBinPopup.prefab")}const fe="cubic-bezier(0.5, 1, 0.89, 1)",q=a=>a&&a.node!=null?a.node:-1,me=["capacity","range","money"],Ki=`
.boostPopup-canvas { z-index: 5; }
.boostPopup-canvas .boostPopup-root { pointer-events: auto; }
.boostPopup-canvas .boostPopup-fx { pointer-events: none; }
`;let ge=!1;function Ji(){if(ge)return;ge=!0;const a=document.createElement("style");a.textContent=Ki,document.head.appendChild(a)}const ye=F+"ui/sprites/",Ot={Dyson:"Dyson is a man who is extremely passionate about cleaning. He takes great pride in his work and is always striving to do the best job possible. His favorite color is yellow, and he often incorporates it into his work attire or tools in some way. In his free time, he enjoys experimenting with new cleaning techniques and products, and is always on the lookout for ways to improve his skills. Despite being a bit of a perfectionist when it comes to cleaning, Dyson is a friendly and approachable person, and is well-liked by his colleagues and clients alike.","Dymon Detect":"An easy to use and performant tool.","Dymon Absolute":"Redesign of the Detect version, same performances.","Dymon Red Demon":"Improved version of the Detect Dymon vacuum cleaner."},_={circle:{file:w.whiteCircle.file},circleStroke:{file:"white_circle2_empty_d80563.webp"},tick:{file:"icon_Tick_34e75d.webp"},tickOutline2:{file:"icon_Tick_outline2_d259e5.webp"},arrow:{file:"icon_arrow_small_b00966.webp"},arrowOutline:{file:"icon_arrow_small_outline_a899dd.webp"},glow:{file:"glow_a9a52d.webp"},tabSlope:{file:"TabSlope_9c661c.webp",w:263,h:216,ppu:100,border:[84,0,179,0]},avatarTab:{file:"AvatarTabIcon_a9a8df.webp"},baggle:{file:"baggle_light_80579f.webp",w:128,h:128,ppu:100,border:[64,64,64,64]},squareShadow:{file:"SquareShadow_dcf632.webp",w:188,h:188,ppu:100,border:[60,60,60,60]},shopIcon:{file:"ShopIcon_0ffabe.webp"},shopIconOutline:{file:"ShopIcon_outline_12a088.webp"},money:{file:"Moneey_263336.webp"},moneyOutline:{file:"MoneyOutline_96984c.webp"},cupRay:{file:"cup_ray_1e788f.webp"}},At=[.2901961,.19607845,.08627451,1],gt=[.5647059,.41960785,.2509804,1],Pe=[0,.9019608,.29803923,1],Se=[0,.77254903,.25490198,1],at=a=>`rgb(${a.slice(0,3).map(t=>Math.round(t*255)).join(",")})`;let ke=!1;function Zi(){if(ke)return;ke=!0;const a=document.createElement("style");a.textContent=`
.shoppanel-canvas { z-index: 6; } /* above the MainPanel (5), under the navigation bar (7) */
.shoppanel-block, .shoppanel-modal { pointer-events: auto; }
.shoppanel-noclick { pointer-events: none !important; }
/* web: the BlackVeil of a non interactable SkinnedPushButton, approximated with a filter */
.shoppanel-off { pointer-events: none !important; }
.shoppanel-off > * { filter: grayscale(1) brightness(0.7); }
.shoppanel-viewport { pointer-events: auto; overflow-x: hidden !important; overflow-y: auto !important; touch-action: pan-y;
  scrollbar-color: #fff ${at(gt)}; }
.shoppanel-viewport::-webkit-scrollbar { width: 30px; }
.shoppanel-viewport::-webkit-scrollbar-track { background: ${at(gt)}; border-radius: 15px; }
.shoppanel-viewport::-webkit-scrollbar-thumb { background: #fff; border-radius: 15px; border: 10px solid ${at(gt)}; }
.shoppanel-grid { display: grid; grid-template-columns: repeat(3, 280px); grid-auto-rows: 349.4px; gap: 65px;
  padding: 36px 70px 0 70px; box-sizing: border-box; justify-content: start; align-content: start;
  top: 0 !important; bottom: auto !important; height: auto !important; }
.shoppanel-grid > .u-node { position: relative !important; }
@keyframes shoppanel-shine { to { transform: rotate(360deg); } }
.shoppanel-shine > .u-img { animation: shoppanel-shine 7.2s linear infinite; }
`,document.head.appendChild(a)}function we(a,t,e,i,s){if(!a||!a.animate)return;const n=[{transform:"scale(1)"}];for(let o=0;o<i;o++){const r=t*(1-o/i);n.push({transform:`scale(${1+(o%2===0?r:-r*s)})`})}n.push({transform:"scale(1)"}),a.animate(n,{duration:e*1e3,easing:"ease-out"})}function be(a,t,e,i,s,n){const o=a.graftButton(t,"Money_Btn",i,s);a.edit(o,l=>{l.n=e,delete l.scale});const r=(l,c)=>a.edit(a.findIn(l,o),p=>{p.img.color=c});if(n.main)for(const l of["MainColor","InnerMask"])r(l,n.main);return n.under&&r("UnderColor",n.under),n.gradient&&r("InnerGradient",n.gradient),a.edit(a.findIn("Counter_HorizontalGroup",o),l=>{l.off=1}),a.edit(a.findIn("Title_HorizontalGroup",o),l=>{delete l.off,l.rt=h([-48,0]),l.layout={...l.layout,pad:[0,0,0,0],reverse:n.iconRight?1:0}}),a.edit(a.findIn("Title_IconContainer",o),l=>{delete l.off,l.le={...l.le,m_PreferredWidth:n.iconSize[0]},l.rt=f([0,0],[0,0],n.iconSize),n.mirror&&(l.scale=[-1,1])}),a.edit(a.findIn("Title_IconOutline",o),l=>{delete l.off,l.img={...l.img,sprite:n.outline,color:n.outlineColor}}),a.edit(a.findIn("Title_Icon",o),l=>{delete l.off,l.img={...l.img,sprite:n.icon,color:[1,1,1,1]}}),a.edit(a.findIn("Title_TMP",o),l=>{delete l.off,l.le={m_PreferredWidth:n.titleW},l.text={...l.text,t:n.title,size:77.9,max:77.9,auto:1,wrap:0,mat:n.mat,color:n.titleColor}}),o}function ts(a,t,e,i){const s=Z[e][i],n={file:s.icon},o={type:e,i};o.root=a.add("SkinBtn",t,f([0,0],[0,0],[280,349.4],[0,0]));const r=a.add("Graphics",o.root,h());o.fx=a.add("UnlockFxContainer",r,h(),{off:1}),a.add("Glow",o.fx,h([62,62]),{img:u([1,1,1,1],_.squareShadow,{ppum:.48})}),o.highlight=a.add("HighlightedStroke",r,h([28,28]),{off:1}),a.add("Stroke",o.highlight,h(),{img:u([1,.8901961,.7137255,1],_.baggle,{ppum:1.36})}),o.back=a.add("BackImage",r,h(),{img:u([1,1,1,1],w.whiteCircle,{ppum:2.76})}),o.title=a.add("TitleTMP",o.back,T([0,0],[1,0],[0,38.79431],[-45.5812,47.93]),{text:S("???",36,{auto:1,min:18,max:36,color:[.1254902,.12156863,.10980392,1],mat:""})});const l=a.add("Mask",r,h([-24,-82.94],[0,29.47]),{img:u([1,1,1,0],w.whiteCircle,{ppum:4.5}),mask:1}),c=a.add("NoRarityBack",l,h(),{img:u([...s.color,1])});a.add("Glow",c,h([398.8354,425.2011],[0,-108.1]),{img:u([1,1,1,.25],_.glow)});const p=a.add("ICONMask",r,h([0,-30.940048],[0,55.470024]),{mask:1}),d=e===0?h([0,123.1723],[0,-115]):h([0,-53.414],[0,-26.707]);o.icon=a.add(e===0?"_CharacterICON":"_VacuumICON",p,d,{img:u([1,1,1,1],n,{preserve:1}),fx:[{type:"Shadow",dist:[8,-8],color:[0,0,0,.05]}]}),o.full=a.add("FullColor",o.icon,h(),{img:u([...s.color.map(g=>g*.8),1]),off:1}),o.lock=a.add("QuestionMarkLockContainer",r,h([-24,-82.94],[0,29.47]),{off:1}),a.add("Text",o.lock,f([.5,.5],[0,0],[271.66,249.41]),{text:S("?",125,{color:[0,0,0,.8],mat:""})}),o.equip=a.add("EquippedSelector",r,f([.5,.5],[0,131],[280,66.02]),{off:1});const m=a.add("Tick_stroke",o.equip,f([1,.5],[-48.3937,0],[47.4004,47.4004]),{img:u(Pe,_.circle)});return a.add("Stroke",m,h(),{img:u(Se,_.circleStroke)}),a.add("Tick",m,h([-11.5364,-11.5364],[-.4,-1.2]),{img:u([1,1,1,1],_.tick,{preserve:1})}),a.add("HitBox",o.root,h([20,20]),{img:u([0,0,0,0])}),o}async function es(){const[a,t]=await Promise.all([rt("win"),rt("upgrade")]),e=new it,i={},s=e.add("Shop_Panel",null,h());i.modal=e.add("Modal",s,h([1e3,1e3]),{img:u([0,0,0,0])}),i.top=e.add("TopContainer",s,f([.5,.5],[0,1104],[1242,280],[.5,1]));const n=e.add("TitleContainer",i.top,T([0,1],[1,1],[0,-150],[0,130]),{layout:{type:"HorizontalLayoutGroup",spacing:31.3,align:4,pad:[0,0,0,0],ctrlW:1,ctrlH:0,expW:1,expH:0,reverse:0}}),o=e.add("ImageContainer",n,f([0,0],[0,0],[130,130]),{le:{m_PreferredWidth:130}}),r=e.add("Outline",o,f([.5,.5],[0,0],[150,150]),{img:u([0,0,0,1],_.shopIconOutline,{preserve:1})});e.add("Icon",r,h(),{img:u([1,1,1,1],_.shopIcon,{preserve:1})}),e.add("Text (TMP)",n,f([0,0],[0,0],[0,130]),{text:S("SHOP",84.34,{wrap:0})}),i.panel=e.add("PanelBack",s,f([.5,.5],[0,91.632],[1167.48,1463.904])),e.add("Outline",i.panel,h(),{img:u([0,0,0,1],w.whiteCircle1Empty,{ppum:4.4})});const l=e.add("LargeMask",i.panel,h([-12,-12]),{img:u([.88235295,.6901961,.45882353,1],w.whiteCircle,{ppum:1.7}),mask:1}),c=e.add("InnerMask",l,h([-16,-16]),{img:u([.7607844,.5686275,.34117648,1],w.whiteCircle,{ppum:1.85}),mask:1});i.grid=e.add("GridContainer",c,h([0,-433],[0,26.5]));const p=e.add("Scroll View",i.grid,h([0,-34.94],[0,17.47]));i.viewport=e.add("Viewport",p,h([0,0],[0,0],[0,1])),i.parent=e.add("SkinBtnParent",i.viewport,T([0,1],[1,1],[0,0],[17.52,0],[0,1])),i.cards=Z.flatMap((y,V)=>y.map((P,R)=>ts(e,i.parent,V,R)));const d=e.add("BottomBtnContainer",i.grid,T([0,0],[1,0],[-6.5,73.82],[-95,308.12],[.5,1]),{layout:{type:"HorizontalLayoutGroup",spacing:40,align:4,pad:[0,0,0,0],ctrlW:0,ctrlH:0,expW:1,expH:0,reverse:0}});i.rv=e.graftButton(a,"WinPanel_VIP_CollectX3_RV_Btn",d,f([0,0],[0,0],[500,180],[1,.5])),e.edit(i.rv,y=>{y.n="NewItem_RV_Btn"});const m=[.689,.574,.198,1];e.edit(e.findIn("Title_HorizontalGroup",i.rv),y=>{y.rt=T([0,.5],[1,.5],[0,0],[0,77],[.5,.5])}),e.edit(e.findIn("Counter_HorizontalGroup",i.rv),y=>{y.off=1}),e.edit(e.findIn("Title_TMP",i.rv),y=>{y.le={m_PreferredWidth:330},y.text={...y.text,t:"NEW ITEM",size:64.25,max:64.25,auto:1,wrap:0,color:m}}),i.buy=e.graftButton(t,"Money_Btn",d,f([0,0],[0,0],[500,180],[0,.5])),e.edit(i.buy,y=>{y.n="NewItem_Btn",delete y.scale}),e.edit(e.findIn("Title_HorizontalGroup",i.buy),y=>{delete y.off,y.rt=T([0,1],[1,1],[70,-8],[-180,70],[.5,1])}),e.edit(e.findIn("Title_TMP",i.buy),y=>{delete y.off,y.le={m_PreferredWidth:300},y.text={...y.text,t:"NEW ITEM",size:64.25,max:67.6,auto:1,wrap:0}}),e.edit(e.findIn("Counter_HorizontalGroup",i.buy),y=>{y.rt=T([0,0],[1,0],[70,8],[-180,85],[.5,0])}),i.buyCounter=e.findIn("Counter_TMP",i.buy),e.edit(i.buyCounter,y=>{y.text={...y.text,size:73.3,max:73.3,wrap:0}}),e.edit(e.findIn("IconOutline",i.buy),y=>{y.img={...y.img,sprite:_.moneyOutline}}),e.edit(e.findIn("Icon",e.findIn("IconOutline",i.buy)),y=>{y.img={...y.img,sprite:_.money}});const g=e.findIn("MainColor",i.buy);i.shine=e.add("Shine",g,f([0,.5],[85,0],[401.96,401.96]),{img:u([.50980395,.99215686,.40784314,1],_.cupRay,{preserve:1})}),i.question=e.add("QuestionMark",g,f([.5,.5],[-158,-5],[200,130.05]),{text:S("?",99.2,{mat:"Exo-Black SDF MoneyStroke"})}),i.buyTitleGroup=e.findIn("Title_HorizontalGroup",i.buy),i.page=e.add("PageInfoContainer",c,h([0,-433],[0,26.5]),{off:1}),i.pageTitle=e.add("Title",i.page,f([.5,.5],[301.09424,406],[480,94]),{text:S("MICHAEL",55,{auto:1,max:56.96,color:At,mat:""})}),i.info=e.add("InfoText",i.page,f([.5,.5],[301.09424,34.1457],[480,623.0375]),{text:S("",40,{font:"Exo-SemiBold",auto:1,min:18,max:40,color:At,mat:"",align:1,valign:256})});const k=e.add("Graphics",i.page,f([.5,.5],[-251.82,29.09],[552.42,847.81]));e.add("BackImage",k,h(),{img:u([1,1,1,1],w.whiteCircle,{ppum:2.76}),fx:[{type:"Shadow",dist:[0,-16.4],color:[0,0,0,.1]}]});const C=e.add("Mask",k,h([-24,-29.73],[0,-1.09]),{img:u([1,1,1,0],w.whiteCircle,{ppum:4.5}),mask:1});i.pageBack=e.add("NoRarityBack",e.add("Backs",C,h()),h(),{img:u([.7607844,1,1,1])}),e.add("Glow",i.pageBack,h([1350.304,1471.883],[0,-284.65823]),{img:u([1,1,1,.25],_.glow,{preserve:1})}),i.pageIcon=e.add("_ICON",C,f([.5,.5],[0,-12.022217],[480.8363,818.66565]),{img:u([1,1,1,1],{file:Z[0][0].icon},{preserve:1})}),i.equipGO=e.add("EquipGO",k,f([1,.5],[-78,349],[82.5487,82.5487]),{img:u(Pe,_.circle)}),e.add("Stroke",i.equipGO,h(),{img:u(Se,_.circleStroke)}),e.add("Tick",i.equipGO,h([-22.3237,-22.3237],[-.4,-1.2]),{img:u([1,1,1,1],_.tick,{preserve:1})});const b=e.add("BottomBtnContainer",i.page,T([0,0],[1,0],[0,73.82],[0,308.12],[.5,1]));i.backBtn=be(e,t,"PageBack_Btn",b,f([.5,.5],[-332,0],[391.67,180]),{main:[1,.788,.22,1],under:[1,.588,.008,1],gradient:[1,.69,.1,1],title:"BACK",mat:"Exo-Black SDF FreeStroke",titleColor:[.698,.31,.115,1],icon:_.arrow,outline:_.arrowOutline,outlineColor:[.82,.337,0,1],iconSize:[129.4,111.62],titleW:198,mirror:!0}),i.selectBtn=be(e,t,"Equip_Btn",b,f([.5,.5],[233,0],[567.6,180]),{title:"SELECT",mat:"Exo-Black SDF MoneyStroke",titleColor:[.104,.396,.043,1],icon:_.tick,outline:_.tickOutline2,outlineColor:[.153,.51,.078,1],iconSize:[134.24,115.8],titleW:369,iconRight:!0}),i.buff=e.add("BuffContainer",i.page,f([.5,.5],[285,-385.5],[393.6,100]),{img:u([1,1,1,1],w.whiteCircle,{ppum:5}),mask:1}),i.buffBg=e.add("Colored_BG",i.buff,T([0,0],[.45,1],[0,0],[0,0]),{img:u([1,1,1,1])}),i.buffAmount=e.add("Buff_Amount",i.buffBg,h(),{text:S("+50%",46.1)});const $=e.add("BuffName_BG",i.buff,T([.45,0],[1,1],[0,0],[0,0]),{img:u([1,1,1,1])});i.buffName=e.add("Buff_Name",$,h(),{text:S("SPEED",53,{color:[0,0,0,1],mat:""})});const N=e.add("TabContainer",c,T([0,1],[1,1],[0,0],[0,155],[.5,1]),{img:u(gt)});return i.tabs=$e.map((y,V)=>{const P={};P.root=e.add(V?"Vaccum_TabBtn":"Character_TabBtn",N,V?T([.5,0],[1,1],[0,0],[75,0],[1,1]):T([0,0],[.5,1],[0,0],[75,0],[0,1])),P.back=e.add("TabBack",P.root,h(),{img:u([.7607844,.5686275,.34117648,1],_.tabSlope,{ppum:1.5}),scale:V?[-1,1]:void 0});const R=e.add("Content",P.root,h([0,0],[V?44:-44,0]),{layout:{type:"HorizontalLayoutGroup",spacing:20,align:4,pad:[0,0,0,0],ctrlW:1,ctrlH:0,expW:0,expH:0,reverse:0}});return e.add("Icon",R,f([0,0],[0,0],[102.4,102.4]),{le:{m_PreferredWidth:102.4},img:u(At,_.avatarTab,{preserve:1})}),P.title=e.add("Title",R,f([0,0],[0,0],[0,155]),{text:S(y,66,{wrap:0,mat:""})}),e.add("Hitbox",P.root,h(),{img:u([0,0,0,0])}),P}),i.block=e.add("Block_Click_GO",s,T([1,0],[1,1],[-721,-100],[1442,0],[.5,0]),{img:u([1,1,1,0])}),{json:e.json("Assets/_GameAssets/Prefabs/UI/Panels/ShopPanel/Shop_Panel.prefab"),ix:i}}class ys {
  constructor(t, e) {
    this.game = t, this.root = e, this._open = !1, this._canClick = !1, this.type = 0, this.preview = null, this.token = 0, this.showDuration = .3, this.hideDuration = .3;
  }
  get isOpen() {
    return this._open;
  }
  get canClick() {
    return this._canClick;
  }
  async init() {
    return this.ready || (this.ready = this.build()), this.ready;
  }
  async build() {
    Zi(), this.canvas = X(this.root), this.canvas.classList.add("shoppanel-canvas");
    const {
      json: t,
      ix: e
    } = await es();
    this.ix = e;
    const i = this.ui = await H(t, this.canvas, {
      translate: Q
    });
    this.el = i.root, this.el.style.display = "none", wt(i), i.el(e.modal).classList.add("shoppanel-modal"), i.el(e.block).classList.add("shoppanel-block"), i.el(e.viewport).classList.add("shoppanel-viewport"), i.el(e.parent).classList.add("shoppanel-grid"), this.top = i.el(e.top), this.panel = i.el(e.panel), i.el(e.pageIcon).style.filter = "drop-shadow(0 0 32px rgba(255,255,255,0.4))";
    const s = i.el(e.shine);
    s.classList.add("shoppanel-shine"), s.parentNode.insertBefore(s, i.el(e.buyTitleGroup)), s.parentNode.insertBefore(i.el(e.question), i.el(e.buyTitleGroup));
    for (const n of e.cards) {
      const o = i.el(n.full);
      o.style.webkitMaskImage = o.style.maskImage = `url("${ye}${Z[n.type][n.i].icon}")`, o.style.webkitMaskSize = o.style.maskSize = "contain", o.style.webkitMaskRepeat = o.style.maskRepeat = "no-repeat", o.style.webkitMaskPosition = o.style.maskPosition = "center", W(i.el(n.root), () => this.onClickCard(n));
    }
    e.tabs.forEach((n, o) => W(i.el(n.root), () => this.updateFilter(o))), i.setActive(e.rv, !1), W(i.el(e.buy), () => this.onClickBuy()), W(i.el(e.backBtn), () => this.showGrid()), W(i.el(e.selectBtn), () => this.onClickSelect()), this.autoTitles = [e.buy, e.rv, e.backBtn, e.selectBtn].map(n => i.find("Title_TMP", n));
  }
  refit() {
    for (const t of this.autoTitles) {
      const e = this.ui.el(t).querySelector(":scope > .u-text");
      e && e._fit && e._fit();
    }
  }
  set canClick(t) {
    this._canClick = t, this.ui.setActive(this.ix.block, !t), this.updateBottomBtn();
  }
  setInteractable(t, e) {
    this.ui.el(t).classList.toggle("shoppanel-off", !e);
  }
  async show() {
    if (await this.init(), this._open) return;
    this._open = !0;
    const t = ++this.token;
    this.el.style.display = "", this.type = 0, this.showGrid(), this.ui.el(this.ix.viewport).scrollTop = 0, this.canClick = !1, O.play("swooshOpen"), this.panel.style.transform = "translateX(1200px)", this.top.style.transform = "translateY(-100px)", this.top.style.opacity = "0", B(this.panel, "transform", "none", .4, D.OutQuad), B(this.top, "transform", "none", .3, D.OutQuad), B(this.top, "opacity", "1", .3, "linear"), await U(this.showDuration), t === this.token && (this.canClick = !0);
  }
  async hide() {
    if (!this._open) return;
    this._open = !1;
    const t = ++this.token;
    this.canClick = !1, O.play("swooshClose"), B(this.panel, "transform", "translateX(1200px)", .4, D.OutQuad), B(this.top, "transform", "translateY(-100px)", .3, D.OutQuad), B(this.top, "opacity", "0", .3, "linear"), await U(this.hideDuration), t === this.token && (this.el.style.display = "none", this.showGrid());
  }
  updateFilter(t) {
    t !== this.type && (this.type = t, this.showGrid(), this.ui.el(this.ix.viewport).scrollTop = 0, this.canClick = !0);
  }
  showGrid() {
    this.preview = null;
    for (const t of this.ix.cards) this.ui.setActive(t.fx, !1);
    this.ui.setActive(this.ix.page, !1), this.ui.setActive(this.ix.grid, !0), this.updateTabs(), this.updateCards(), this.updateBottomBtn(), this.refit();
  }
  updateTabs() {
    this.ix.tabs.forEach((t, e) => {
      const i = e === this.type;
      this.ui.el(t.root).classList.toggle("shoppanel-noclick", i), this.ui.setActive(this.ui.el(t.back).querySelector(":scope > .u-img"), i);
      const s = this.ui.el(t.title).querySelector(":scope > .u-text");
      s && (s.style.color = i ? "#ffffff" : "#222222");
    });
  }
  updateCards() {
    const t = this.ui;
    for (const e of this.ix.cards) {
      const i = e.type === this.type;
      if (t.setActive(e.root, i), !i) continue;
      const s = Ht(e.type, e.i),
        n = s && xt(e.type, e.i);
      t.el(e.root).classList.toggle("shoppanel-noclick", !s), t.el(e.back).style.opacity = s ? "1" : "0.5", t.setText(e.title, s ? A(Z[e.type][e.i].name, Z[e.type][e.i].name) : "???"), t.setActive(e.lock, !s), t.setActive(e.full, !s), t.setActive(e.equip, n), t.setActive(e.highlight, n);
    }
  }
  updateBottomBtn() {
    const t = this.ix,
      e = Re(this.type).length > 0;
    this.ui.setActive(t.buy, e), this.ui.setActive(t.rv, false);
    const i = Ge();
    this.ui.setText(t.buyCounter, kt(i, 3)), this.setInteractable(t.buy, this._canClick && qt());
  }
  async onClickBuy() {
    qt() && (await this.unlock(jt(this.type)));
  }
  async unlock(t) {
    if (t < 0) return;
    const e = this.ix.cards.find(s => s.type === this.type && s.i === t),
      i = this.token;
    this.canClick = !1, this.ui.setActive(e.fx, !0), O.play("unlock"), await U(.2), i === this.token && (this.updateCards(), we(this.ui.el(e.root), .2, .5, 3, .3), await U(.8), i === this.token && (this.ui.setActive(e.fx, !1), this.canClick = !0));
  }
  onClickCard(t) {
    if (!Ht(t.type, t.i)) return;
    const e = this.ui,
      i = this.ix,
      s = Z[t.type][t.i];
    this.preview = t, e.setActive(i.grid, !1), e.setActive(i.page, !0), this.refit(), e.setText(i.pageTitle, A(s.name, s.name)), e.setText(i.info, Ot[s.name] ? A(Ot[s.name], Ot[s.name]) : ""), e.setImage(i.pageIcon, ye + s.icon), e.el(i.pageBack).querySelector(":scope > .u-img").style.background = at(s.color), e.setActive(i.buff, !!(s.buff && s.buff[1])), s.buff && (e.el(i.buffBg).querySelector(":scope > .u-img").style.background = at(Le[s.buff[0]]), e.setText(i.buffAmount, s.buff[1] + "%"), e.setText(i.buffName, A(s.buff[0], s.buff[0]))), this.updateEquip();
  }
  updateEquip() {
    const t = this.preview,
      e = xt(t.type, t.i);
    this.ui.setActive(this.ix.equipGO, e), this.setInteractable(this.ix.selectBtn, !e);
  }
  onClickSelect() {
    const t = this.preview;
    !t || xt(t.type, t.i) || (De(t.type, t.i), this.updateCards(), this.updateBottomBtn(), this.updateEquip(), we(this.ui.el(this.ix.equipGO), .3, .6, 5, .5));
  }
}const lt={collectionIcon:{file:"CollectionIcon_fe5b51.webp"},collectionOutline:{file:"CollectionIcon_Outline_c053af.webp"},money:{file:"Moneey_263336.webp"},moneyOutline:{file:"MoneyOutline_96984c.webp"},glow:{file:"glow_a9a52d.webp"}},et=[1,1,1,1],Ce=[.882353,.6901961,.45882356,1],is=[.7607844,.5686275,.34117648,1],xe=[0,0,0,0],Gt="Exo-Black SDF",Dt=(a,t=[0,0,0,0])=>({type:"HorizontalLayoutGroup",spacing:a,align:4,pad:t,ctrlW:1,ctrlH:0,expW:0,expH:0,reverse:0}),ss=F+"textures/";let ve=!1;function ns(){if(ve)return;ve=!0;const a=document.createElement("style");a.textContent=`
.collectionPanel-canvas { z-index: 6; }
.collectionPanel-viewport { overflow-x: hidden; overflow-y: auto; pointer-events: auto; touch-action: pan-y; overscroll-behavior: contain; }
.collectionPanel-viewport::-webkit-scrollbar { width: 30px; }
.collectionPanel-viewport::-webkit-scrollbar-track { background: rgb(144,107,64); border-radius: 15px; }
.collectionPanel-viewport::-webkit-scrollbar-thumb { background: #fff; background-clip: padding-box; border: 10px solid transparent; border-radius: 15px; }
`,document.head.appendChild(a)}function os(a,t,e){const i=a.add("SoftIcon",t,f([0,.5],[0,0],[0,80]),{le:{m_PreferredWidth:65}});e&&a.add("IconOutline",i,h(),{img:u(et,lt.moneyOutline,{preserve:1})}),a.add("Icon",i,h(),{img:u(et,lt.money,{preserve:1})})}function Ee(a,t,e,i,s,n,o,r){const l=a.add(e,t,i,{layout:Dt(0,[1,23,0,0]),...s});a.add("CurrencyCounterBackground",l,h([5,0],[-2.5,0]),{img:u(n,w.whiteCircle,{ppum:5.5}),le:{m_IgnoreLayout:1}}),os(a,l,o);const c=a.add("EarningText",l,f([0,.5],[0,0],[0,66.46],[0,.5]),{text:S("10/Min",50,{mat:Gt,color:r,align:1,wrap:0})});return{counter:l,text:c}}function as(a,t,e){const i=a.add(e.displayName+"_Btn",t,null),s=a.add("Graphics",i,h()),n=a.add("BackImage",s,h(),{img:u(et,w.whiteCircle,{ppum:2.76}),fx:[{type:"Shadow",dist:[0,-13.9],color:[.48627454,.3647059,.21960786,1]}]}),o=a.add("TitleTMP",n,T([0,0],[1,0],[0,50.5011],[-50,101.0022]),{text:S(e.displayName,46.85,{mat:Gt,color:[.1254902,.12156863,.10980392,1],auto:1,min:18,max:50})}),r=a.add("Mask",s,h([-24,-112],[0,44]),{img:u(xe,w.whiteCircle,{ppum:4.5}),mask:1}),l=a.add("NoRarityBack",a.add("Backs",r,h()),h(),{img:u([1,.8431373,.4431373,1])});a.add("Glow",l,h([398.8354,425.2011],[0,-108.1]),{img:u([1,.9216051,.7216981,1],lt.glow)});const c=a.add("ICONMask",s,h([-24,-112],[0,44]),{img:u(xe,w.whiteCircle,{ppum:4.5}),mask:1}),p=a.add("_ICON",c,f([.5,.5],[0,0],[400,400]),{img:u(et,Wi(e.icon),{preserve:1}),mask:1,fx:[{type:"Shadow",dist:[8,-8],color:[1,0,0,.14901961]}]}),d=a.add("FullColor",p,h(),{img:u([.6862745,.48627454,.2509804,1]),off:1}),m=Ee(a,c,"EarningCounter",f([.5,.5],[0,-156],[0,77.6]),{scale:[.72601,.72601],fit:[2]},[0,0,0,.40392157],!0,et);return{data:e,root:i,back:n,title:o,mask:r,full:d,counter:m.counter,earning:m.text}}function rs(){const a=new it,t=a.add("CollectiblePanel",null,h());a.add("Modal",t,h([1e3,1e3]),{img:u([0,0,0,0])});const e=a.add("TopContainer",t,f([.5,.5],[0,1104],[1242,280],[.5,1])),i=a.add("TitleContainer",e,T([0,1],[1,1],[0,-150],[0,130]),{layout:Dt(13)}),s=a.add("ImageContainer",i,f([.5,.5],[0,0],[0,130]),{le:{m_PreferredWidth:130}}),n=a.add("Outline",s,f([.5,.5],[0,0],[150,150]),{img:u([0,0,0,1],lt.collectionOutline,{preserve:1})});a.add("Icon",n,h(),{img:u(et,lt.collectionIcon,{preserve:1})}),a.add("Text (TMP)",i,f([.5,.5],[0,0],[0,50]),{text:S("COLLECTION",84.34,{wrap:0})});const o=a.add("PanelBack",t,f([.5,.5],[0,91.63202],[1167.48,1463.904]));a.add("Outline",o,h(),{img:u([0,0,0,1],w.whiteCircle1Empty,{ppum:4.4})});const r=a.add("LargeMask",o,h([-12,-12]),{img:u(Ce,w.whiteCircle,{ppum:1.7}),mask:1}),l=a.add("InnerMask",r,h([-16,-16]),{img:u(is,w.whiteCircle,{ppum:1.85}),mask:1}),c=a.add("TopContainer",l,T([0,1],[1,1],[0,0],[0,155],[.5,1]),{img:u(Ce)}),p=a.add("Group",c,T([0,.5],[1,.5],[0,0],[0,143]),{layout:Dt(30)});a.add("Text (TMP)",p,f([.5,.5],[0,0],[0,72.5347]),{text:S("TOTAL OFFLINE EARNINGS",49.5,{mat:Gt,color:[.4156863,.27450982,.15686275,1],align:1,wrap:0})});const d=Ee(a,p,"CurrencyCounter",f([.5,.5],[0,0],[0,77.6],[0,.5]),{},et,!1,[0,0,0,1]),m=a.add("Scroll View",l,h([0,-208],[0,-86])),g=a.add("Viewport",m,h([-19.05,0],[-9.525,0]),{mask:1}),k=a.add("CollectionBtnParent",g,null),C=[];for(const b of tt.data.biomes||[])for(const $ of b.collectibles||[])C.push(as(a,k,$));return a.add("Block_Click_GO",t,T([1,0],[1,1],[-721,-100],[1442,0],[.5,0])),{json:a.json("Assets/_GameAssets/Prefabs/UI/Panels/CollectiblePanel/CollectiblePanel.prefab"),top:e,panel:o,viewport:g,grid:k,total:d,cards:C}}class ks{constructor(t,e){this.game=t,this.root=e,this._open=!1,this._canClick=!1,this.token=0,this.showDuration=.4,this.hideDuration=.4}get isOpen(){return this._open}get canClick(){return this._canClick}set canClick(t){this._canClick=t,this.blocker&&(this.blocker.style.display=t?"none":"")}async init(){return this.ready||(this.ready=this.build()),this.ready}async build(){ns(),this.canvas=X(this.root),this.canvas.classList.add("collectionPanel-canvas");const t=rs(),e=this.ui=await H(t.json,this.canvas,{translate:Q});this.el=e.root,this.el.style.display="none",wt(e),e.findEl("Modal").style.pointerEvents="auto",this.blocker=e.findEl("Block_Click_GO"),this.blocker.style.pointerEvents="auto",this.top=e.el(t.top),this.panel=e.el(t.panel),this.totalText=t.total.text;const i=e.el(t.viewport);i.style.overflow="",i.classList.add("collectionPanel-viewport"),Object.assign(e.el(t.grid).style,{position:"relative",left:"0",top:"0",bottom:"",width:"100%",height:"auto",boxSizing:"border-box",display:"grid",gridTemplateColumns:"repeat(2, 490px)",gridAutoRows:"502px",columnGap:"42.92px",rowGap:"65px",padding:"11px 30px 0 30px",justifyContent:"start",alignContent:"start"}),this.cards=t.cards;for(const s of this.cards){Object.assign(e.el(s.root).style,{position:"relative",left:"0",top:"0",bottom:"",width:"490px",height:"502px"});const n=e.el(s.back),o=n.querySelector(":scope > .u-img");o.style.filter=n.style.filter,n.style.filter="",e.el(s.counter).style.translate="-50% 0";const r=e.el(s.full).style,l=`url("${ss}${encodeURI(s.data.icon)}")`;for(const c of["","-webkit-"])r.setProperty(c+"mask-image",l),r.setProperty(c+"mask-size","contain"),r.setProperty(c+"mask-position","center"),r.setProperty(c+"mask-repeat","no-repeat")}}refresh(){const t=v.d.collectedList||[],e=A("Day","Day");let i=0;for(const s of this.cards){const n=t.includes(s.data.displayName);this.ui.setActive(s.back,n),this.ui.setActive(s.mask,n),this.ui.el(s.counter).style.display=n?"flex":"none",this.ui.setActive(s.full,!n),this.ui.setText(s.title,A(s.data.displayName,s.data.displayName)),this.ui.setText(s.earning,"+"+s.data.offlineEarningPerDay+"/"+e),n&&(i+=s.data.offlineEarningPerDay)}this.ui.setText(this.totalText,kt(i,2,6)+"/"+e)}async show(){if(await this.init(),this._open)return;this._open=!0;const t=++this.token,e=this.el.style.display==="none";this.el.style.display="",this.canClick=!1,this.refresh(),e&&(this.top.getAnimations().forEach(i=>i.cancel()),this.panel.getAnimations().forEach(i=>i.cancel()),this.top.style.transform="translateY(-100px)",this.top.style.opacity="0",this.panel.style.transform="translateX(-1200px)"),O.play("swooshOpen"),B(this.top,"transform","translateY(0px)",.3,D.OutQuad),B(this.top,"opacity","1",.3,"linear"),B(this.panel,"transform","translateX(0px)",.4,D.OutQuad),v.d.crateCollectibleAvailable=!1,v.save(),await U(this.showDuration),t===this.token&&(this.canClick=!0)}async hide(){if(!this._open)return;this._open=!1;const t=++this.token;this.canClick=!1,O.play("swooshClose"),B(this.top,"transform","translateY(-100px)",.3,D.OutQuad),B(this.top,"opacity","0",.3,"linear"),B(this.panel,"transform","translateX(-1200px)",.4,D.OutQuad),await U(this.hideDuration),t===this.token&&(this.el.style.display="none")}}export { ks as CollectionPanel, us as CratePanel, fs as OfflineEarningPopup, ys as ShopPanel, ps as UpgradePopup, ds as WinPanel };
