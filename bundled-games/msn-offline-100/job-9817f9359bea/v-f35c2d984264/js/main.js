function buildIOSMeta() {
  for (var n, i, r = [{
      name: "viewport",
      content: "width=device-width, height=device-height, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
    }, {
      name: "apple-mobile-web-app-capable",
      content: "yes"
    }, {
      name: "apple-mobile-web-app-status-bar-style",
      content: "black"
    }], t = 0; t < r.length; t++) n = document.createElement("meta"), n.name = r[t].name, n.content = r[t].content, i = window.document.head.querySelector('meta[name="' + n.name + '"]'), i && i.parentNode.removeChild(i), window.document.head.appendChild(n);
}
function hideIOSFullscreenPanel() {
  document.querySelector(".xxx-ios-fullscreen-message").style.display = "none";
  document.querySelector(".xxx-ios-fullscreen-scroll").style.display = "none";
  document.querySelector(".xxx-game-iframe-full").classList.remove("xxx-game-iframe-iphone-se");
}
function buildIOSFullscreenPanel() {
  var n = "",
    t;
  n += '<div class="xxx-ios-fullscreen-message">';
  n += '<div class="xxx-ios-fullscreen-swipe">';
  n += "<\/div>";
  n += "<\/div>";
  n += '<div class="xxx-ios-fullscreen-scroll">';
  n += "<\/div>";
  t = document.createElement(n);
  document.querySelector("body").appendChild(t);
}
function showIOSFullscreenPanel() {
  document.querySelector(".xxx-ios-fullscreen-message").style.display = "block";
  document.querySelector(".xxx-ios-fullscreen-scroll").style.display = "block";
}
function __iosResize() {
  if (window.scrollTo(0, 0), console.log(window.devicePixelRatio), console.log(window.innerWidth), console.log(window.innerHeight), platform.product === "iPhone") switch (window.devicePixelRatio) {
    case 2:
      switch (window.innerWidth) {
        case 568:
          window.innerHeight === 320 || document.querySelector(".xxx-game-iframe-full").classList.add("xxx-game-iframe-iphone-se");
          break;
        case 667:
          window.innerHeight === 375 ? hideIOSFullscreenPanel() : showIOSFullscreenPanel();
          break;
        case 808:
          window.innerHeight === 414 ? hideIOSFullscreenPanel() : showIOSFullscreenPanel();
          break;
        default:
          hideIOSFullscreenPanel();
      }
      break;
    case 3:
      switch (window.innerWidth) {
        case 736:
          window.innerHeight === 414 ? hideIOSFullscreenPanel() : showIOSFullscreenPanel();
          break;
        case 724:
          window.innerHeight === 375 ? hideIOSFullscreenPanel() : showIOSFullscreenPanel();
          break;
        case 808:
          window.innerHeight === 414 ? hideIOSFullscreenPanel() : showIOSFullscreenPanel();
          break;
        default:
          hideIOSFullscreenPanel();
      }
      break;
    default:
      hideIOSFullscreenPanel();
  }
}
function iosResize() {
  __iosResize();
  setTimeout(function () {
    __iosResize();
  }, 500);
}
function iosInIframe() {
  try {
    return window.self !== window.top;
  } catch (n) {
    return !0;
  }
}
function getSize(n) {
  var u,
    e = n.toLowerCase(),
    f = window.document,
    t = f.documentElement,
    i,
    r;
  return window["inner" + n] === undefined ? u = t["client" + n] : window["inner" + n] != t["client" + n] ? (i = f.createElement("body"), i.id = "vpw-test-b", i.style.cssText = "overflow:scroll", r = f.createElement("div"), r.id = "vpw-test-d", r.style.cssText = "position:absolute;top:-1000px", r.innerHTML = "<style>@media(" + e + ":" + t["client" + n] + "px){body#vpw-test-b div#vpw-test-d{" + e + ":7px!important}}<\/style>", i.appendChild(r), t.insertBefore(i, f.head), u = r["offset" + n] == 7 ? t["client" + n] : window["inner" + n], t.removeChild(i)) : u = window["inner" + n], e === "Height" && platform.name !== null && platform.name.toLowerCase() === "safari" && (u = getIOSWindowHeight()), u;
}
function onOrientationChange() {
  setTimeout(() => {
    window.matchMedia("(orientation: portrait)").matches && sizeHandler(), window.matchMedia("(orientation: landscape)").matches && sizeHandler();
  }, 40);
}
function getNearestNumber(n, t) {
  if ((i = n.length) < 2) return i - 1;
  for (var i, r = Math.abs(n[--i] - t); i--;) if (r < (r = Math.abs(n[i] - t))) break;
  return i + 1;
}
function isMac() {
  return isIpad() ? !1 : navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}
function isChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}
function isIpad() {
  var n = "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0,
    t = navigator.userAgent.includes("Intel Mac OS X");
  return n && t;
}
function isMobile() {
  return isIpad() ? !0 : navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) ? !0 : !1;
}
function isIOS() {
  var n, t;
  if (isIpad()) return !0;
  for (n = ["iPad", "iPhone", "iPod", "Mac"]; n.length;) {
    let i = navigator?.userAgentData?.platform || navigator?.platform;
    if (i = i.toLowerCase(), t = n.pop(), i && i.includes(t.toLowerCase())) return !0;
  }
  return !1;
}
function getIOSWindowHeight() {
  var n = document.documentElement.clientWidth / window.innerWidth;
  return window.innerHeight * n;
}
function getHeightOfIOSToolbars() {
  var n = (window.orientation === 0 ? screen.height : screen.width) - getIOSWindowHeight();
  return n > 1 ? n : 0;
}
function sizeHandler() {
  var r, i, f, l, a, c, v;
  if (window.scrollTo(0, 1), document.querySelector("#canvas")) {
    r = getSize("Width");
    i = getSize("Height");
    SCREEN_MODE === SCREEN_MODE_SQUARE && (s_bLandscape = checkLandscape());
    s_bSquareSize = !1;
    s_iAspectRatio = r / i;
    s_iAspectRatio > .7 && s_iAspectRatio < 1.33 && (s_bSquareSize = !0);
    s_bFocus && _checkOrientation(r, i);
    var o = Math.min(i / CANVAS_HEIGHT, r / CANVAS_WIDTH),
      n = Math.round(CANVAS_WIDTH * o),
      t = Math.round(CANVAS_HEIGHT * o),
      e = 0;
    t < i ? (e = i - t, t += e, n += e * (CANVAS_WIDTH / CANVAS_HEIGHT)) : n < r && (e = r - n, n += e, t += e * (CANVAS_HEIGHT / CANVAS_WIDTH));
    var u = i / 2 - t / 2,
      s = r / 2 - n / 2,
      h = CANVAS_WIDTH / n;
    (s * h < -EDGEBOARD_X || u * h < -EDGEBOARD_Y) && (o = Math.min(i / (CANVAS_HEIGHT - EDGEBOARD_Y * 2), r / (CANVAS_WIDTH - EDGEBOARD_X * 2)), n = Math.round(CANVAS_WIDTH * o), t = Math.round(CANVAS_HEIGHT * o), u = (i - t) / 2, s = (r - n) / 2, h = CANVAS_WIDTH / n);
    s_iOffsetX = -1 * s * h;
    s_iOffsetY = -1 * u * h;
    u >= 0 && (s_iOffsetY = 0);
    s >= 0 && (s_iOffsetX = 0);
    s_oGame !== null && s_oGame.refreshButtonPos();
    s_oMenu !== null && s_oMenu.refreshButtonPos();
    s_oGuiController && s_oGuiController.refreshButtonPos();
    s_oStage ? (f = window.devicePixelRatio || 1, !s_bMobile && f < 2 && (f = 2), l = 16777216, a = Math.sqrt(l / (n * t)), f = Math.min(f, a, 2), s_oStage.canvas.width = Math.floor(n * f), s_oStage.canvas.height = Math.floor(t * f), c = document.getElementById("canvas"), c.style.width = n + "px", c.style.height = t + "px", v = Math.min(n / CANVAS_WIDTH, t / CANVAS_HEIGHT), s_oStage.scaleX = s_oStage.scaleY = v * f) : (document.querySelector("#canvas").style.width = n + "px", document.querySelector("#canvas").style.height = t + "px");
    u < 0 ? $("#canvas").css("top", u + "px") : (u = (i - t) / 2, $("#canvas").css("top", u + "px"));
    $("#canvas").css("left", s + "px");
    fullscreenHandler();
    s_oStage && s_oStage.update();
  }
}
function createBitmap(n, t, i) {
  var u = new createjs.Bitmap(n),
    r = new createjs.Shape();
  return t && i ? r.graphics.beginFill("#fff").drawRect(0, 0, t, i) : r.graphics.beginFill("#ff0").drawRect(0, 0, n.width, n.height), u.hitArea = r, u;
}
function createSprite(n, t, i, r, u, f) {
  var e, o;
  return e = t !== null ? new createjs.Sprite(n, t) : new createjs.Sprite(n), o = new createjs.Shape(), o.graphics.beginFill("#000000").drawRect(-i, -r, u, f), e.hitArea = o, e;
}
function pad(n, t, i) {
  return i = i || "0", n = n + "", n.length >= t ? n : new Array(t - n.length + 1).join(i) + n;
}
function linearFunction(n, t, i, r, u) {
  return (n - t) * (u - r) / (i - t) + r;
}
function randomSign() {
  return Math.random() <= .5 ? 1 : -1;
}
function randomFloatBetween(n, t, i) {
  return typeof i == "undefined" && (i = 2), parseFloat(Math.min(n + Math.random() * (t - n), t).toFixed(i));
}
function randomIntBetween(n, t, i) {
  return typeof i == "undefined" && (i = 2), parseInt(Math.min(n + Math.random() * (t - n), t).toFixed(i));
}
function rotateVector2D(n, t) {
  var i = t.getX() * Math.cos(n) + t.getY() * Math.sin(n),
    r = t.getX() * -Math.sin(n) + t.getY() * Math.cos(n);
  t.set(i, r);
}
function tweenVectorsOnX(n, t, i) {
  return n + i * (t - n);
}
function shuffle(n) {
  for (var t = n.length, r, i; 0 !== t;) i = Math.floor(Math.random() * t), t -= 1, r = n[t], n[t] = n[i], n[i] = r;
  return n;
}
function centerBetweenPointsV2(n, t) {
  var i = new CVector2();
  return i.set((n.getX() + t.getX()) * .5, (n.getY() + t.getY()) * .5), i;
}
function bubbleSort(n) {
  var i, t, r;
  do for (i = !1, t = 0; t < n.length - 1; t++) n[t] > n[t + 1] && (r = n[t], n[t] = n[t + 1], n[t + 1] = r, i = !0); while (i);
}
function compare(n, t) {
  return n.index > t.index ? -1 : n.index < t.index ? 1 : 0;
}
function easeLinear(n, t, i, r) {
  return i * n / r + t;
}
function easeInQuad(n, t, i, r) {
  return i * (n /= r) * n + t;
}
function easeInSine(n, t, i, r) {
  return -i * Math.cos(n / r * (Math.PI / 2)) + i + t;
}
function easeInCubic(n, t, i, r) {
  return i * (n /= r) * n * n + t;
}
function getTrajectoryPoint(n, t) {
  var i = new createjs.Point(),
    r = (1 - n) * (1 - n),
    u = n * n;
  return i.x = r * t.start.x + 2 * (1 - n) * n * t.traj.x + u * t.end.x, i.y = r * t.start.y + 2 * (1 - n) * n * t.traj.y + u * t.end.y, i;
}
function formatTime(n) {
  var i, t, r;
  return n /= 1e3, i = Math.floor(n / 60), t = n - i * 60, t = parseFloat(t).toFixed(1), r = "", r += i < 10 ? "0" + i + ":" : i + ":", r + (t < 10 ? "0" + t : t);
}
function degreesToRadians(n) {
  return n * Math.PI / 180;
}
function checkRectCollision(n, t) {
  var i, r;
  return i = getBounds(n, .9), r = getBounds(t, .98), calculateIntersection(i, r);
}
function calculateIntersection(n, t) {
  var u,
    f,
    i = {},
    r = {};
  return i.cx = n.x + (i.hw = n.width / 2), i.cy = n.y + (i.hh = n.height / 2), r.cx = t.x + (r.hw = t.width / 2), r.cy = t.y + (r.hh = t.height / 2), u = Math.abs(i.cx - r.cx) - (i.hw + r.hw), f = Math.abs(i.cy - r.cy) - (i.hh + r.hh), u < 0 && f < 0 ? (u = Math.min(Math.min(n.width, t.width), -u), f = Math.min(Math.min(n.height, t.height), -f), {
    x: Math.max(n.x, t.x),
    y: Math.max(n.y, t.y),
    width: u,
    height: f,
    rect1: n,
    rect2: t
  }) : null;
}
function getBounds(n, t) {
  var i = {
      x: Infinity,
      y: Infinity,
      width: 0,
      height: 0
    },
    l,
    v,
    u,
    c,
    f,
    e,
    o,
    s,
    r,
    a,
    h;
  if (n instanceof createjs.Container) {
    for (i.x2 = -Infinity, i.y2 = -Infinity, l = n.children, v = l.length, c = 0; c < v; c++) u = getBounds(l[c], 1), u.x < i.x && (i.x = u.x), u.y < i.y && (i.y = u.y), u.x + u.width > i.x2 && (i.x2 = u.x + u.width), u.y + u.height > i.y2 && (i.y2 = u.y + u.height);
    i.x == Infinity && (i.x = 0);
    i.y == Infinity && (i.y = 0);
    i.x2 == Infinity && (i.x2 = 0);
    i.y2 == Infinity && (i.y2 = 0);
    i.width = i.x2 - i.x;
    i.height = i.y2 - i.y;
    delete i.x2;
    delete i.y2;
  } else r = {}, n instanceof createjs.Bitmap ? (a = n.sourceRect || n.image, r.width = a.width * t, r.height = a.height * t) : n instanceof createjs.Sprite ? n.spriteSheet._frames && n.spriteSheet._frames[n.currentFrame] && n.spriteSheet._frames[n.currentFrame].image ? (h = n.spriteSheet.getFrame(n.currentFrame), r.width = h.rect.width, r.height = h.rect.height, r.regX = h.regX, r.regY = h.regY) : (i.x = n.x || 0, i.y = n.y || 0) : (i.x = n.x || 0, i.y = n.y || 0), r.regX = r.regX || 0, r.width = r.width || 0, r.regY = r.regY || 0, r.height = r.height || 0, i.regX = r.regX, i.regY = r.regY, f = n.localToGlobal(0 - r.regX, 0 - r.regY), e = n.localToGlobal(r.width - r.regX, r.height - r.regY), o = n.localToGlobal(r.width - r.regX, 0 - r.regY), s = n.localToGlobal(0 - r.regX, r.height - r.regY), i.x = Math.min(Math.min(Math.min(f.x, e.x), o.x), s.x), i.y = Math.min(Math.min(Math.min(f.y, e.y), o.y), s.y), i.width = Math.max(Math.max(Math.max(f.x, e.x), o.x), s.x) - i.x, i.height = Math.max(Math.max(Math.max(f.y, e.y), o.y), s.y) - i.y;
  return i;
}
function NoClickDelay(n) {
  this.element = n;
  window.Touch && this.element.addEventListener("touchstart", this, !1);
}
function shuffle(n) {
  for (var t = n.length, r, i; t > 0;) i = Math.floor(Math.random() * t), t--, r = n[t], n[t] = n[i], n[i] = r;
  return n;
}
function ctlArcadeResume() {
  s_oMain !== null && s_oMain.startUpdate();
}
function ctlArcadePause() {
  s_oMain !== null && s_oMain.stopUpdate();
}
function getParamValue(n) {
  for (var i, u = window.location.search.substring(1), r = u.split("&"), t = 0; t < r.length; t++) if (i = r[t].split("="), i[0] == n) return i[1];
}
function getParameterByName(n, t = window.location.href) {
  n = n.replace(/[\[\]]/g, "\\$&");
  var r = new RegExp("[?&]" + n + "(=([^&#]*)|&|#|$)"),
    i = r.exec(t);
  return i ? i[2] ? decodeURIComponent(i[2].replace(/\+/g, " ")) : "" : null;
}
function removeParamsFromURL(n) {
  for (var i = new URL(window.location.href), t = 0; t < n.length; t++) i.searchParams.delete(n[t]);
  return i.toString();
}
function addParameterToUrl(n, t, i, r) {
  var o, s, c, e, f;
  n.indexOf("#") > 0 ? (s = n.indexOf("#"), o = n.substring(n.indexOf("#"), n.length)) : (o = "", s = n.length);
  var l = n.substring(0, s),
    h = l.split("?"),
    u = "";
  if (h.length > 1) for (c = h[1].split("&"), e = 0; e < c.length; e++) f = c[e].split("="), !0 && f[0] === t || (u === "" ? u = "?" : u += "&", u += f[0] + "=" + (f[1] ? f[1] : ""));
  return u === "" && (u = "?"), r ? u = "?" + t + "=" + i + (u.length > 1 ? "&" + u.substring(1) : "") : (u !== "" && u !== "?" && (u += "&"), u += t + "=" + (i ? i : "")), h[0] + u + o;
}
function radiansToDegree(n) {
  return n * (180 / Math.PI);
}
function distance(n, t) {
  var i = n.getX() - t.getX(),
    r = n.getY() - t.getY();
  return Math.sqrt(i * i + r * r);
}
function fixEnemyTremble(n, t) {
  var i = !1;
  return distanceBetween2Points(t.m_pCenter().getX(), n.getY(), t.m_pCenter().getX(), t.m_pCenter().getY()) <= t.getLength() && (i = !0), i;
}
function distanceBetween2Points(n, t, i, r) {
  return Math.sqrt(Math.pow(i - n, 2) + Math.pow(r - t, 2));
}
function collideEdgeWithCircle(n, t, i) {
  var r = closestPointOnLine(n.getPointA(), n.getPointB(), t),
    u = distanceV2(t, r);
  return i < u ? null : {
    distance: u,
    closest_point: r
  };
}
function closestPointOnLine(n, t, i) {
  var e = new CVector2(),
    o = new CVector2(),
    u,
    r,
    f;
  return (e.setV(n), o.setV(t), u = new CVector2(), u.setV(i), u.subtract(n), r = new CVector2(), r.setV(t), r.subtract(n), r.normalize(), f = dotProductV2(r, u), f <= 0) ? e : f >= distanceV2(n, t) ? o : (r.scalarProduct(f), r.addV(n), r);
}
function dotProductV2(n, t) {
  return n.getX() * t.getX() + n.getY() * t.getY();
}
function distanceV2(n, t) {
  return Math.sqrt((t.getX() - n.getX()) * (t.getX() - n.getX()) + (t.getY() - n.getY()) * (t.getY() - n.getY()));
}
function reflectVectorV2(n, t) {
  var i = dotProductV2(n, t);
  return n.set(n.getX() - 2 * i * t.getX(), n.getY() - 2 * i * t.getY()), n;
}
function angleBetweenVectors(n, t) {
  var i = Math.acos(dotProductV2(n, t) / (n.length() * t.length()));
  return isNaN(i) == !0 ? 0 : i;
}
function distanceV2WithoutSQRT(n, t) {
  return (t.getX() - n.getX()) * (t.getX() - n.getX()) + (t.getY() - n.getY()) * (t.getY() - n.getY());
}
function classifySphere(n, t, i, r) {
  var u = t.getX() * n.getX() + t.getY() * n.getY() + planeDistance(t, i);
  return Math.abs(u) < r ? u >= 0 ? "INTERSECT FRONT" : "INTERSECT BEHIND" : u >= r ? "FRONT" : "BEHIND";
}
function planeDistance(n, t) {
  return -(n.getX() * t.getX() + n.getY() * t.getY());
}
function saveItem(n, t) {
  s_bStorageAvailable && localStorage.setItem(n, t);
}
function getItem(n) {
  return s_bStorageAvailable ? localStorage.getItem(n) : null;
}
function getKeyByValue(n, t) {
  return Object.keys(n).find(i => n[i] === t);
}
function copyObjectByValue(n) {
  return JSON.parse(JSON.stringify(n));
}
function createMarginRect(n = 0, t = 0, i = 0, r = 0) {
  return {
    left: n,
    top: t,
    right: i,
    bottom: r
  };
}
function normalizeFontSize(n, t = 999) {
  for (var r, i = 0; i < n.length; i++) n[i].resetFontSize();
  for (i = 0; i < n.length; i++) r = n[i].getFontSize(), r < t && (t = r);
  for (i = 0; i < n.length; i++) n[i].setFontSize(t);
  return t;
}
function fullscreenHandler() {
  ENABLE_FULLSCREEN && screenfull.isEnabled && (s_bFullscreen = screenfull.isFullscreen);
}
function checkLandscape() {
  var n = getSize("Width"),
    t = getSize("Height");
  return n > t ? !0 : !1;
}
function setScreenProperty() {
  var t, n;
  s_bMobile = isMobile();
  SCREEN_MODE === SCREEN_MODE_OPTIMIZE && (t = checkLandscape(), SCREEN_MODE = t ? SCREEN_MODE_LANDSCAPE : SCREEN_MODE_PORTRAIT);
  EDGEBOARD_X = EDGEBOARD_SIZE;
  EDGEBOARD_Y = EDGEBOARD_SIZE;
  switch (SCREEN_MODE) {
    case SCREEN_MODE_SQUARE:
      CANVAS_WIDTH = MAX_SCREEN_SIZE;
      CANVAS_HEIGHT = MAX_SCREEN_SIZE;
      ENABLE_CHECK_ORIENTATION = !1;
      break;
    case SCREEN_MODE_LANDSCAPE:
      s_bLandscape = !0;
      CANVAS_WIDTH = MAX_SCREEN_SIZE;
      CANVAS_HEIGHT = MIN_SCREEN_SIZE;
      ENABLE_CHECK_ORIENTATION = !0;
      document.querySelector(".orientation-msg-container").dataset.orientation = SCREEN_MODE;
      break;
    case SCREEN_MODE_PORTRAIT:
      s_bLandscape = !1;
      CANVAS_WIDTH = MIN_SCREEN_SIZE;
      CANVAS_HEIGHT = MAX_SCREEN_SIZE;
      ENABLE_CHECK_ORIENTATION = !0;
      document.querySelector(".orientation-msg-container").dataset.orientation = SCREEN_MODE;
  }
  n = document.getElementById("canvas");
  n.width = CANVAS_WIDTH;
  n.height = CANVAS_HEIGHT;
}
function getBoundsIncludingInvisible(n) {
  function r(n) {
    if (n.visible === !1 && (i.push(n), n.visible = !0), n.children) for (var t = 0; t < n.children.length; t++) r(n.children[t]);
  }
  var i = [],
    u,
    t;
  for (r(n), u = n.getBounds(), t = 0; t < i.length; t++) i[t].visible = !1;
  return u;
}
function adaptInScreen(n, t = createMarginRect(), i = 1, r = false) {
  var u = n.getBounds();
  if (u !== null && u !== undefined) {
    var e = CANVAS_WIDTH - t.left - t.right - s_iOffsetX * 2,
      o = CANVAS_HEIGHT - t.top - t.bottom - s_iOffsetY * 2,
      s = e / u.width,
      h = o / u.height,
      f = Math.min(s, h);
    return f > i && (f = i), n.scaleX = n.scaleY = f, n.x = s_iOffsetX + t.left + (e - u.width * f) / 2 - u.x * f, n.y = s_iOffsetY + t.top + (o - u.height * f) / 2 - u.y * f, r && (this.oDebugScreen && s_oStage.removeChild(this.oDebugScreen), this.oDebugScreen = new createjs.Shape(), this.oDebugScreen.graphics.beginFill("#f00").drawRect(n.x + u.x * f, n.y + u.y * f, u.width * f, u.height * f), this.oDebugScreen.alpha = .3, this.oDebugScreen.mouseEnabled = !1, s_oStage.addChild(this.oDebugScreen)), f;
  }
}
function _checkOrientation(n, t) {
  var i, r;
  if (s_bMobile && ENABLE_CHECK_ORIENTATION) {
    if (i = document.querySelector(".orientation-msg-container"), !i) return;
    r = i.querySelector(".orientation-msg-text");
    r && (r.textContent = s_oGuiController && typeof TEXT_ROTATE_DEVICE != "undefined" ? TEXT_ROTATE_DEVICE : "ROTATE DEVICE");
    n > t ? i.getAttribute("data-orientation") === "landscape" ? (i.style.display = "none", s_oMain.startUpdate(), s_oGuiController && s_oGuiController.showSidebarButton()) : (i.style.display = "block", s_oMain.stopUpdate(), s_oGuiController && s_oGuiController.hideSidebarButton()) : i.getAttribute("data-orientation") === "portrait" ? (i.style.display = "none", s_oMain.startUpdate(), s_oGuiController && s_oGuiController.showSidebarButton()) : (i.style.display = "block", s_oMain.stopUpdate(), s_oGuiController && s_oGuiController.hideSidebarButton());
  }
}
function muteAllSfx(n) {
  if (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) for (var t in s_aSounds) s_aSounds[t].mute(n);
}
function muteAllMusic(n) {
  var i, t;
  if (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) {
    i = [];
    for (t in s_aMusic) i[t] = s_aMusic[t].volume(), s_aMusic[t].mute(n);
    for (t in s_aMusic) s_aMusic[t].volume(i[t]);
  }
}
function playSfxSound(n, t, i) {
  return DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1 ? (s_aSounds[n].play(), s_aSounds[n].volume(t), s_aSounds[n].loop(i), s_aSounds[n]) : null;
}
function playMusicSound(n, t, i) {
  return DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1 ? (s_aMusic[n].play(), s_aMusic[n].volume(t), s_aMusic[n].loop(i), s_aMusic[n]) : null;
}
function stopSfxSound(n) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aSounds[n].stop();
}
function stopMusicSound(n) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aMusic[n].stop();
}
function setSfxVolume(n, t) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aSounds[n].volume(t);
}
function setMusicVolume(n, t) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aMusic[n].volume(t);
}
function setSfxMute(n, t) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aSounds[n].mute(t);
}
function setMusicMute(n, t) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aMusic[n].mute(t);
}
function fadeInMusic(n, t, i) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aMusic[n].fade(t, i, 1e3);
}
function fadeOutMusic(n, t, i) {
  if (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) {
    s_aMusic[n].fade(t, i, 1e3);
    s_aMusic[n].on("fade", () => {
      s_aMusic[n].volume() === 0 && stopMusicSound(n);
    });
  }
}
function fadeInSfx(n, t, i) {
  (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_aSounds[n].fade(t, i, 1e3);
}
function fadeOutSfx(n, t, i) {
  if (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) {
    s_aSounds[n].fade(t, i, 1e3);
    s_aSounds[n].on("fade", () => {
      s_aSounds[n].volume() === 0 && stopSfxSound(n);
    });
  }
}
function getMusicVolume(n) {
  return s_aMusic[n].volume();
}
function CSpriteLibrary() {
  var t = {},
    n,
    i,
    u,
    f,
    e,
    r;
  this.init = function (t, o, s) {
    n = {};
    i = 0;
    u = 0;
    f = t;
    e = o;
    r = s;
  };
  this.addSprite = function (r, u) {
    if (t.hasOwnProperty(r)) return !1;
    var f = new Image();
    return t[r] = n[r] = {
      szPath: u,
      oSprite: f,
      bLoaded: !1
    }, i++, !0;
  };
  this.getSprite = function (n) {
    return t.hasOwnProperty(n) ? t[n].oSprite : null;
  };
  this._onSpritesLoaded = function () {
    i = 0;
    e.call(r);
  };
  this._onSpriteLoaded = function () {
    f.call(r);
    ++u === i && this._onSpritesLoaded();
  };
  this.loadSprites = function () {
    for (var t in n) n[t].oSprite.oSpriteLibrary = this, n[t].oSprite.szKey = t, n[t].oSprite.onload = function () {
      this.oSpriteLibrary.setLoaded(this.szKey);
      this.oSpriteLibrary._onSpriteLoaded(this.szKey);
    }, n[t].oSprite.onerror = function (t) {
      var i = t.currentTarget;
      setTimeout(function () {
        n[i.szKey].oSprite.src = n[i.szKey].szPath;
      }, 500);
    }, n[t].oSprite.src = n[t].szPath;
  };
  this.setLoaded = function (n) {
    t[n].bLoaded = !0;
  };
  this.isLoaded = function (n) {
    return t[n].bLoaded;
  };
  this.getNumSprites = function () {
    return i;
  };
}
function CTLText(n, t, i, r, u, f, e, o, s, h, c, l, a, v, y, p, w, b = 11, k = false) {
  this._oContainer = new createjs.Container();
  this._oContainer.x = t;
  this._oContainer.y = i;
  n && this.setParentContainer(n);
  this._iOutline = 0;
  this._iWidth = r;
  this._iHeight = u;
  this._bMultiline = p;
  this._iFontSize = f;
  this._iStartingFontSize = f;
  this._iOriginalFontSize = f;
  this._szAlign = e;
  this._szColor = o;
  this._szFont = s;
  this._iPaddingH = c;
  this._iPaddingV = l;
  this._iEffectiveWidth = this._iWidth - this._iPaddingH * 2;
  this._iEffectiveHeight = this._iHeight - this._iPaddingV * 2;
  this._bVerticalAlign = y;
  this._bFitText = v;
  this._iMinTextSize = b;
  this._bDebug = w;
  this._bEllipsis = k;
  this._bMandatoryCache = !1;
  this._bCacheActive = !1;
  this._fCacheScale;
  this._oDebugShape = null;
  this._fLineHeightFactor = h;
  this._oText = null;
  this.__setMsg(a);
  this.__createText();
}
function CRadialWipeWidget(n, t, i) {
  var o, s, h, a, e, l, f, u, r, c;
  this._init = function (n, t, i) {
    o = !1;
    s = !1;
    h = !1;
    a = Math.PI * 2;
    e = 0;
    r = new createjs.Container();
    r.x = n;
    r.y = t;
    i.addChild(r);
    l = createjs.Graphics.getRGB(3091752);
    f = new createjs.Shape();
    f.rotation = -90;
    f.alpha = 1;
    r.addChild(f);
    u = new createjs.Text("", " 50px " + PRIMARY_FONT, "#ffffff");
    u.textAlign = "center";
    u.textBaseline = "alphabetic";
    u.y = 15;
    u.shadow = new createjs.Shadow("#000000", 5, 5, 10);
    r.addChild(u);
    c = new CTremble(r);
  };
  this.unload = function () {
    i.removeChild(r);
  };
  this.setPos = function (n, t) {
    r.x = n;
    r.y = t;
  };
  this.reset = function () {
    u.text = "";
    stopSfxSound("hurryup");
    c && c.stopTremble();
    u.color = "#ffffff";
    s = !1;
  };
  this.setVisible = function (n) {
    r.visible = n;
  };
  this.setScale = function (n) {
    r.scaleX = r.scaleY = n;
  };
  this.setHurryUpMode = function (n) {
    o = !0;
    e = n;
  };
  this.removeHurryUpMode = function () {
    o = !1;
  };
  this._showHurryUpWarning = function () {
    u.color = "#ff0000";
    playSfxSound("hurryup", 1, !1);
    c.start(1e3, 50, 4);
    s_oGame.showAlert(TEXT_HURRY_UP);
  };
  this.alwaysShown = function () {
    h = !0;
  };
  this._updateTimeText = function (n) {
    var t = Math.ceil(n / 1e3);
    u.text = t;
  };
  this._updateRadialWipe = function (n, t) {
    h || (t = e);
    var i = linearFunction(n, t, 0, 0, 360);
    f.graphics.clear();
    f.graphics.f(l);
    f.graphics.moveTo(0, 0);
    f.graphics.arc(0, 0, TIME_CONTROLLER_RADIUS, 0, degreesToRadians(i), !0);
  };
  this.update = function (n, t) {
    this._updateTimeText(n);
    this._updateRadialWipe(n, t);
    (n === 0 || n > e && !h) && (u.text = "", f.graphics.clear());
    o && n < e && !s && (s = !0, this._showHurryUpWarning());
  };
  this._init(n, t, i);
}
function CTimeout() {
  var t,
    n,
    r,
    i,
    u,
    f,
    e,
    o = this;
  this._init = function () {
    t = !1;
  };
  this.start = function (n, r, o, s) {
    t && this.clear();
    u = n;
    f = r;
    e = s;
    t = !0;
    i = o;
    this.resume();
  };
  this._onEndTimeout = function () {
    this.clear();
  };
  this.isPlaying = function () {
    return t;
  };
  this.clear = function () {
    n && (clearTimeout(n), n = null);
    t = !1;
  };
  this.pause = function () {
    clearTimeout(n);
    n = null;
    i -= Date.now() - r;
  };
  this.resume = function () {
    !n && t && (r = Date.now(), n = setTimeout(function () {
      o._onEndTimeout();
      u.apply(f, e);
    }, i));
  };
  this._init();
}
function CTremble(n) {
  var t, u, i, f, c, r, o, s, e, h;
  this._init = function (n) {
    t = !1;
    u = !1;
    f = 0;
    r = {
      x: n.x,
      y: n.y
    };
  };
  this.start = function (n, r, u) {
    n <= 0 || t || (t = !0, s = n, e = r, h = u, this._calculateDuration(), clearInterval(i), i = setInterval(function () {
      o._tremble();
    }, e));
  };
  this._tremble = function () {
    var v, l, y, p, a, w;
    u = !u;
    u ? (v = Math.random(), l = h, y = v < .5 ? -l : l, p = Math.random(), a = h, w = p < .5 ? -a : a, n.x += y, n.y += w) : (n.x = r.x, n.y = r.y);
    f++;
    f > c && (f = 0, t = !1, n.x = r.x, n.y = r.y, s === 0 ? i = setInterval(function () {
      o._tremble();
    }, e) : clearInterval(i));
  };
  this._calculateDuration = function () {
    c = s / e;
  };
  this.stopTremble = function () {
    t = !1;
    clearInterval(i);
  };
  o = this;
  this._init(n);
}
function CLocalStorage(n) {
  var t = !0,
    i = n;
  this._init = function (n) {
    try {
      var t = window.localStorage.getItem(n);
      this.resetData();
      t !== null && t !== undefined && this.loadData();
    } catch (i) {
      this.resetData();
    }
  };
  this.isDirty = function () {
    return !1;
  };
  this.isUsed = function () {
    try {
      window.localStorage.setItem("ls_available", "ok");
    } catch (n) {
      t = !1;
    }
    return t;
  };
  this.resetData = function () {
    s_iSkinID = 1;
  };
  this.deleteData = function () {
    window.localStorage.removeItem(GAME_NAME);
  };
  this.saveData = function () {
    var n = {};
    n[LOCALSTORAGE_SKIN_ID] = s_iSkinID;
    window.localStorage.setItem(i, JSON.stringify(n));
  };
  this.loadData = function () {
    var t = window.localStorage.getItem(i),
      n;
    t = JSON.parse(t);
    n = t[LOCALSTORAGE_SKIN_ID];
    n === undefined || n === null ? n = 0 : s_iSkinID = parseInt(n);
  };
  this._init(n);
}
function CPreloader() {
  var r, u, e, o, f, s, t, i, n;
  this._init = function () {
    r = !1;
    u = !1;
    e = !1;
    o = 0;
    s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);
    s_oSpriteLibrary.addSprite("progress_bar_bg", "./sprites/preloader/progress_bar_bg.png");
    s_oSpriteLibrary.addSprite("progress_dot", "./sprites/preloader/progress_dot.png");
    s_oSpriteLibrary.addSprite("ctl_preloader", "./sprites/preloader/ctl_preloader.png");
    s_oSpriteLibrary.addSprite("ctl_disclaimer", "./sprites/preloader/ctl_disclaimer.png");
    s_oSpriteLibrary.loadSprites();
    var n = new createjs.Shape();
    n.graphics.beginFill("#202945").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(n);
    i = new createjs.Container();
    s_oStage.addChild(i);
  };
  this.unload = function () {
    i.removeAllChildren();
  };
  this._onImagesLoaded = function () {};
  this._onAllImagesLoaded = function () {
    this.attachSprites();
    s_oMain.preloaderReady();
  };
  this.attachSprites = function () {
    var l = {
        images: [s_oSpriteLibrary.getSprite("progress_dot")],
        frames: {
          width: 16,
          height: 17,
          regX: 8,
          regY: 8
        },
        animations: {
          dot_0: 0,
          dot_1: 1,
          dot_2: 2
        }
      },
      e = new createjs.SpriteSheet(l),
      n,
      o,
      h,
      u,
      r,
      c,
      t;
    for (this._prepareLogo(e), n = new createjs.Container(), n.x = CANVAS_WIDTH / 2, n.y = CANVAS_HEIGHT / 2 + 100, i.addChild(n), o = s_oSpriteLibrary.getSprite("progress_bar_bg"), s = createBitmap(o), n.addChild(s), h = 15, u = 17, f = [], r = 0; r < h; r++) c = Math.floor(r / 5), t = createSprite(e, "dot_" + c, 8, 8, 16, 17), t.visible = !1, t.x = u, t.y = 14, n.addChild(t), u += 22, f.push(t);
    n.regX = n.getBounds().width / 2;
  };
  this._prepareLogo = function (r) {
    var o, s, f, h, c, l, a, v, y, u;
    n = new createjs.Container();
    n.x = CANVAS_WIDTH / 2;
    n.y = CANVAS_HEIGHT / 2 - 100;
    i.addChild(n);
    o = s_oSpriteLibrary.getSprite("ctl_preloader");
    t = createBitmap(o);
    t.x = o.width / 2 + 46;
    t.y = o.height * .5;
    t.regX = o.width * .5;
    t.regY = o.height * .5;
    t.scale = 0;
    n.addChild(t);
    s = s_oSpriteLibrary.getSprite("ctl_disclaimer");
    f = createBitmap(s);
    f.x = s.width / 2;
    f.y = 100;
    f.regX = s.width / 2;
    f.regY = s.height / 2;
    f.scale = 0;
    n.addChild(f);
    h = createSprite(r, "dot_1", 8, 8, 16, 17);
    h.scale = 0;
    h.x = 8;
    h.y = 30;
    n.addChild(h);
    c = createSprite(r, "dot_2", 8, 8, 16, 17);
    c.scale = 0;
    c.x = 27;
    c.y = 8;
    n.addChild(c);
    l = createSprite(r, "dot_0", 8, 8, 16, 17);
    l.scale = 0;
    l.x = 27;
    l.y = 52;
    n.addChild(l);
    a = createSprite(r, "dot_1", 0, 0, 16, 17);
    a.scale = 0;
    a.x = 359;
    a.y = 2;
    n.addChild(a);
    v = createSprite(r, "dot_0", 0, 0, 16, 17);
    v.scale = 0;
    v.x = 165;
    v.y = 59;
    n.addChild(v);
    y = createSprite(r, "dot_2", 0, 0, 16, 17);
    y.scale = 0;
    y.x = 457;
    y.y = 59;
    n.addChild(y);
    n.regX = s.width / 2;
    u = 200;
    createjs.Tween.get(t).wait(u).to({
      scale: 1
    }, 500, createjs.Ease.backOut);
    u += 400;
    createjs.Tween.get(c).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(h).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(l).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(v).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(a).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(y).wait(u).to({
      scale: 1
    }, 800, createjs.Ease.bounceOut);
    u += 200;
    createjs.Tween.get(f).wait(u).to({
      scale: 1
    }, 1200, createjs.Ease.elasticOut).call(() => {
      e = !0;
    });
  };
  this.hide = function () {
    r || (r = !0, createjs.Tween.get(i).to({
      alpha: 0
    }, 800, createjs.Ease.cubicOut).call(() => {
      s_oMain.onRemovePreloader();
    }));
  };
  this.refreshLoader = function (n) {
    if (n === 100) {
      u = !0;
      e && this.hide();
      return;
    }
    var t = Math.floor(f.length * (n / 100));
    f[t].visible = !0;
  };
  this.update = function () {
    r || (o += s_iTimeElaps, o > MIN_TIME_PRELOADER && u && (u = !1, this.hide()));
  };
  this._init();
}
function CMenu() {
  var l, i, u, f, e, s, r, t, o, h, n, c;
  this._init = function () {
    var a, v, l;
    void 0;
    a = s_oSpriteLibrary.getSprite("bg_menu");
    i = createBitmap(a);
    i.x = CANVAS_WIDTH / 2;
    i.y = CANVAS_HEIGHT / 2;
    i.regX = a.width / 2;
    i.regY = a.height / 2;
    s_oStage.addChild(i);
    h = new createjs.Container();
    s_oStage.addChild(h);
    c = 0;
    t = new createjs.Container();
    h.addChild(t);
    v = this.getSpriteLogo();
    r = createBitmap(v);
    r.regX = v.width / 2;
    r.regY = v.height;
    t.addChild(r);
    o = new createjs.Container();
    h.addChild(o);
    var y = s_oSpriteLibrary.getSprite("but_long"),
      p = createMarginRect(160, 25, 50, 65),
      w = createMarginRect(160, 85, 50, 25),
      b = 60,
      k = 40;
    n = [];
    l = s_oSpriteLibrary.getSprite("icon_multiplayer");
    void 0;
    void 0;
    void 0;
    void 0;
    void 0;
    l = s_oSpriteLibrary.getSprite("icon_local");
    e = new CButMenu(0, 0, y, o, l);
    e.addEventListener(ON_MOUSE_UP, this._onButLocalRelease, this);
    e.addText(p, TEXT_LOCAL_PLAY, "left", PRIMARY_FONT, FONT_COLOR, b, 1, !1);
    e.addText(w, TEXT_LOCAL_PLAY_EXPL, "left", PRIMARY_FONT, FONT_COLOR, k, 1, !1);
    n.push(e);
    l = s_oSpriteLibrary.getSprite("icon_training");
    f = new CButMenu(0, 0, y, o, l);
    f.addEventListener(ON_MOUSE_UP, this._onButCPU, this);
    f.addText(p, TEXT_TRAINING, "left", PRIMARY_FONT, FONT_COLOR, b, 1, !1);
    f.addText(w, TEXT_TRAINING_EXPL, "left", PRIMARY_FONT, FONT_COLOR, k, 1, !1);
    n.push(f);
    this._normalizeFontSizeButton();
    s = new createjs.Shape();
    s.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    s_oStage.addChild(s);
    createjs.Tween.get(s).to({
      alpha: 0
    }, 1e3).call(function () {
      s.visible = !1;
    });
    s_oGuiController.addEventListener(CGUI.ON_SELECT_LANG, this._onChangeLang, this);
    s_oGuiController.showLangButton();
    s_oGuiController.hideMainMenuBut();
    void 0;
    this._onChangeLang();
    this.refreshButtonPos();
    this._startAnim();
  };
  this.unload = function () {
    for (var t = 0; t < n.length; t++) n[t].unload();
    s_oGuiController.removeEventListener(CGUI.ON_SELECT_LANG);
    s_oGuiController.hideLangButton();
    s_oGuiController.showMainMenuBut();
    s.visible = !1;
    s_oStage.removeChild(i);
    s_oStage.removeChild(h);
    i = null;
    s_oMenu = null;
  };
  this.refreshButtonPos = function () {
    var s, l, a, i;
    if (createjs.Tween.hasActiveTweens(t) && (createjs.Tween.removeTweens(t), t.scaleX = 1), s_bLandscape) c = -310, r.scale = .8, o.scale = .85, l = 350, void 0, e.setPosition(l, -200), f.setPosition(0, 0), s = createMarginRect(40, 60, 40, 60);else {
      for (c = -710, r.scale = .9, o.scale = 1, a = -400, i = 0; i < n.length; i++) n[i].setPosition(0, a), a += 200;
      s = createMarginRect(40, 120, 40, 80);
    }
    t.x = 0;
    t.y = c;
    adaptInScreen(h, s, 1.3);
  };
  this._startAnim = function () {
    t.scaleX = -1;
    t.y = c - CANVAS_HEIGHT;
    createjs.Tween.get(t).to({
      y: c
    }, 1e3, createjs.Ease.cubicOut);
    createjs.Tween.get(t).wait(750).to({
      scaleX: 1
    }, 500, createjs.Ease.cubicOut);
    createjs.Tween.get(i).to({
      scale: 1.05
    }, 2e3, createjs.Ease.cubicOut);
  };
  void 0;
  this._onButCPU = function () {
    void 0;
    this.unload();
    s_bMultiplayer = !1;
    s_bPlayWithBot = !1;
    void 0;
    s_b2Players = !1;
    s_oMain.gotoGame();
  };
  this._onButLocalRelease = function () {
    void 0;
    this.unload();
    s_bMultiplayer = !1;
    s_bPlayWithBot = !1;
    void 0;
    s_b2Players = !0;
    s_oMain.gotoGame();
  };
  void 0;
  void 0;
  void 0;
  void 0;
  void 0;
  void 0;
  void 0;
  this._normalizeFontSizeButton = function () {
    for (var e, i, r, u, f = [], t = 0; t < n.length; t++) f.push(n[t].getTextObj(0));
    for (e = normalizeFontSize(f), i = [], t = 0; t < n.length; t++) i.push(n[t].getTextObj(1));
    r = normalizeFontSize(i);
    u = e - 10;
    r >= u && (r = u, normalizeFontSize(i, r));
  };
  this.getSpriteLogo = function () {
    var n = s_oSpriteLibrary.getSprite("logo_en");
    switch (s_szCurLang) {
      case LANG_PT:
        n = s_oSpriteLibrary.getSprite("logo_pt");
        break;
      case LANG_RU:
        n = s_oSpriteLibrary.getSprite("logo_ru");
        break;
      case LANG_TR:
        n = s_oSpriteLibrary.getSprite("logo_tr");
        break;
      case LANG_AR:
        n = s_oSpriteLibrary.getSprite("logo_ar");
        break;
      case LANG_HI:
        n = s_oSpriteLibrary.getSprite("logo_hi");
        break;
      case LANG_JA:
        n = s_oSpriteLibrary.getSprite("logo_ja");
        break;
      case LANG_ZH:
        n = s_oSpriteLibrary.getSprite("logo_zh");
    }
    return n;
  };
  this._onChangeLang = function () {
    var i, t;
    for (refreshLanguage(), i = this.getSpriteLogo(), t = 0; t < n.length; t++) n[t].getTextObj(0).setHorizontalAlign("left"), n[t].getTextObj(1).setHorizontalAlign("left");
    switch (s_szCurLang) {
      case LANG_AR:
        for (t = 0; t < n.length; t++) n[t].getTextObj(0).setHorizontalAlign("right"), n[t].getTextObj(1).setHorizontalAlign("right");
    }
    r.image = i;
    r.regX = i.width / 2;
    r.regY = i.height;
    void 0;
    void 0;
    f.changeText(0, TEXT_TRAINING);
    f.changeText(1, TEXT_TRAINING_EXPL);
    e.changeText(0, TEXT_LOCAL_PLAY);
    e.changeText(1, TEXT_LOCAL_PLAY_EXPL);
    this._normalizeFontSizeButton();
  };
  s_oMenu = this;
  this._init();
}
function CGameSingle(n) {
  CGameBase.call(this, n);
  this._startGame();
}
function CInterface(n) {
  var f, e, h, t, u, c, i, r, o, s;
  return this._init = function (n) {
    e = n;
    o = new createjs.Rectangle(0, 0, 0, 0);
    c = !0;
    f = new createjs.Container();
    e.addChild(f);
    h = {
      x: CANVAS_WIDTH - 200 - s_iOffsetX,
      y: CANVAS_HEIGHT / 2
    };
    var i = s_oSpriteLibrary.getSprite("but_dice");
    t = new CButDices(0, 0, i, f, WHITE);
    t.addEventListener(ON_MOUSE_UP, this._onButDice, this);
    t.addEventListener(ON_DICE_ROLL_OVER, this._onRollDiceOver, this);
    u = new CDice(0, 0, i, f, WHITE);
    u.setVisible(!1);
    this.hideDice();
  }, this.unload = function () {
    t.unload();
    s_oInterface = null;
  }, this.refreshButtonPos = function (n) {
    o = n;
    this.refreshInfoPanelPos();
    this._refreshDicePosition();
  }, this._refreshDicePosition = function () {
    var p = t.getCurColor(),
      e = t.getBounds(),
      w = i.getBounds(),
      o = this.getInfoPanelAnchor(),
      s = 770,
      h = e.height / 2,
      l = o.bot_pos.x + s,
      n = {
        x: l + s,
        y: o.top_pos.y - h
      },
      c = {
        x: l + s,
        y: o.bot_pos.y + h
      },
      a;
    s_bLandscape ? s_iAspectRatio > 1.6 && (s = e.width / 2 + 7, h = e.height / 2 + w.height + 8, n.x = o.bot_pos.x + s, n.y = o.top_pos.y + h, c.x = n.x, c.y = o.bot_pos.y - h) : (n.x = l + 214, c.x = n.x, s_bSquareSize && (n.x = l + 120));
    a = i.getSide();
    p === BLACK && (a = r.getSide());
    a === BOTTOM ? t.setPosition(c.x, c.y) : t.setPosition(n.x, n.y);
    var v = 8,
      y = 8,
      f = t.getPosition();
    s_bLandscape ? s_iAspectRatio > 1.6 ? a === BOTTOM ? u.setPosition(f.x, f.y - e.height - y) : u.setPosition(f.x, f.y + e.height + y) : u.setPosition(f.x - e.width - v, f.y) : u.setPosition(f.x - e.width - v, f.y);
  }, this.setPlayersInfo = function (n, t) {
    i.setName(n);
    r.setName(t);
  }, this.refreshInfoPanelPos = function () {
    var s = r.getSide() === TOP,
      n = r.getBounds(),
      t = this.getInfoPanelAnchor(),
      u = {
        x: t.top_pos.x + n.width / 2,
        y: t.top_pos.y - n.height / 2
      },
      f = {
        x: t.bot_pos.x + n.width / 2,
        y: t.bot_pos.y + n.height / 2
      },
      e,
      o;
    s_bLandscape && s_iAspectRatio > 1.6 && (u.x = t.top_pos.x + n.width / 2 + 6, u.y = t.top_pos.y + n.height / 2, f.x = u.x, f.y = t.bot_pos.y - n.height / 2);
    e = f;
    o = u;
    s || (e = u, o = f);
    i.setPosition(e.x, e.y);
    r.setPosition(o.x, o.y);
    i.refreshView();
    r.refreshView();
  }, this.getInfoPanelAnchor = function () {
    var t = o.width / 2,
      i = o.height / 2,
      u = 7,
      n,
      r;
    return s_bLandscape ? (n = {
      x: -t,
      y: i + u
    }, r = {
      x: n.x,
      y: -n.y
    }, s_iAspectRatio > 1.6 && (n = {
      x: t,
      y: i
    }, r = {
      x: n.x,
      y: -n.y
    })) : (t /= INTERFACE_PORTRAIT_SCALING, i /= INTERFACE_PORTRAIT_SCALING, n = {
      x: -t,
      y: i + u
    }, r = {
      x: n.x,
      y: -n.y
    }), {
      bot_pos: n,
      top_pos: r
    };
  }, this.configureInfoPanel = function (n) {
    var t = n ? BOTTOM : TOP,
      u = n ? TOP : BOTTOM;
    i = new CInfoTurn(0, 0, WHITE, e, t, !1);
    i.addEventListener(ON_SELECT_EMOTICON, this._onEmoticonSelected, this);
    r = new CInfoTurn(0, 0, BLACK, e, u, !1);
    r.addEventListener(ON_SELECT_EMOTICON, this._onEmoticonSelected, this);
    this.refreshInfoPanelPos(n);
  }, this.refreshWhitePawnNumber = function (n) {
    i.refreshPawnNumber(n);
  }, this.refreshWhiteTime = function (n) {
    i.refreshTime(formatTime(n));
  }, this.refreshBlackPawnNumber = function (n) {
    r.refreshPawnNumber(n);
  }, this.refreshBlackTime = function (n) {
    r.refreshTime(formatTime(n));
  }, this.setDiceColor = function (n) {
    t.setDiceColor(n);
    t.reset();
    u.setDiceColor(n);
    u.setVisible(!1);
    u.reset();
    this._refreshDicePosition();
  }, this.activeDices = function (n) {
    this.setDiceColor(n);
    t.setClickable(!0);
    t.trembleAnimation();
    this.showDice();
  }, this.activePlayer = function (n) {
    n === WHITE ? (r.active(!1), i.active(!0)) : (i.active(!1), r.active(!0));
  }, this.setInfoVisible = function (n) {
    i.setPanelVisible(n);
    r.setPanelVisible(n);
  }, this.showWaiting = function (n) {
    n === WHITE ? i.showWaiting() : r.showWaiting();
  }, this.setPlayerAFK = function (n, t) {
    n === WHITE ? i.setAFK(t) : r.setAFK(t);
  }, this.hideWaiting = function () {
    i.hideWaiting();
    r.hideWaiting();
  }, this.getPanelBounds = function () {
    return i.getBounds();
  }, this.getInfoPanelRects = function () {
    for (var f, n, e = [], u = [i, r], t = 0; t < u.length; t++) f = u[t].getPosition(), n = u[t].getBounds(), e.push(new createjs.Rectangle(f.x + n.x, f.y + n.y, n.width, n.height));
    return e;
  }, this.showEmoticonsControl = function (n) {
    n === WHITE ? i.showEmoticonsControl() : r.showEmoticonsControl();
  }, this.hideEmoticonsControl = function (n) {
    n === WHITE ? i.hideEmoticonsControl() : r.hideEmoticonsControl();
  }, this.isEmoticonMuted = function (n) {
    return n === WHITE ? i.isEmoticonMuted() : r.isEmoticonMuted();
  }, this._onEmoticonSelected = function (n) {
    s_oGame.onEmoticonSelected(n);
  }, this.showEmoticon = function (n, t) {
    t === WHITE ? i.showEmoticon(n) : r.showEmoticon(n);
  }, this.launchDicesAnim = function (n, i) {
    t.setLabelVisible(!1);
    t.stopTrembleAnimation();
    t.launchAnim(n, i);
    t.setClickable(!1);
  }, this.stopDiceAnim = function () {
    t.stopAnim();
  }, this.showDice = function () {
    t.setVisible(!0);
  }, this.hideDice = function () {
    t.setVisible(!1);
  }, this.hideDoubleDice = function () {
    u.setVisible(!1);
  }, this.setDiceTimerTime = function (n) {
    t.setDiceTimerTime(n);
  }, this.setTimerOnDice = function () {
    t.setTimer();
  }, this.showDoubleInfo = function (n, t) {
    u.setVisible(!0);
    u.setDicesValue(n, t);
  }, this.consumeDiceValue = function (n) {
    var r = u.trySetDiceUsed(n),
      i = !1;
    r || (i = t.trySetDiceUsed(n), i || this.consumeClosestMajorDice(n));
  }, this.consumeClosestMajorDice = function (n) {
    var i = u.setClosestMajorDiceUsed(n);
    i || t.setClosestMajorDiceUsed(n);
  }, this.showBearOff = function () {
    s.setVisible(!0);
  }, this.hideBearOff = function () {
    s.setVisible(!1);
  }, this._onButDice = function () {
    s_oGame.rollDice();
  }, this._onRollDiceOver = function () {
    s_oGame.afterRollDice();
  }, this._onBearOff = function () {
    s.stopAnimation();
  }, this.changeSkin = function () {
    i.changeSkin();
    r.changeSkin();
    t.changeSkin();
    u.changeSkin();
  }, s_oInterface = this, this._init(n), this;
}
function CEndPanel(n) {
  var o, t, r, l, s, u, a, i, f, v, h, e, c;
  return this._init = function (n) {
    var u, y, v;
    e = [];
    c = [];
    t = new createjs.Container();
    t.alpha = 0;
    t.visible = !1;
    s_oStage.addChild(t);
    u = new createjs.Shape();
    u.graphics.beginFill("#000").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    u.alpha = .5;
    u.on("mousedown", this.onMouseDown, this);
    t.addChild(u);
    r = new createjs.Container();
    t.addChild(r);
    o = createBitmap(n);
    y = o.getBounds();
    o.regX = y.width / 2;
    o.regY = y.height / 2;
    r.addChild(o);
    var h = n.width - 50,
      a = n.height - 200,
      p = 0,
      w = -90;
    l = new CTLText(r, p - h / 2, w - a / 2, h, a, 54, "center", FONT_COLOR, PRIMARY_FONT, 1.1, 2, 2, " ", !0, !0, !0, !1);
    var h = n.width - 50,
      a = 40,
      p = 0,
      w = 20;
    s = new CTLText(r, p - h / 2, w - a / 2, h, a, 37, "center", FONT_COLOR, PRIMARY_FONT, 1, 2, 2, " ", !0, !0, !1, !1);
    v = s_oSpriteLibrary.getSprite("but_restart");
    i = new CGfxButton(100, 110, v, r);
    v = s_oSpriteLibrary.getSprite("but_home");
    f = new CGfxButton(-100, 110, v, r);
    this.refreshButtonPos();
    this.hide();
  }, this.refreshButtonPos = function () {
    adaptInScreen(r, createMarginRect(40, 120, 40, 40), 1.5);
  }, this.unload = function () {
    s_oStage.removeChild(t);
    i.unload();
    f.unload();
  }, this.addEventListener = function (n, t, i) {
    e[n] = t;
    c[n] = i;
  }, this.onMouseDown = function () {}, this._initListener = function () {
    f.addEventListener(ON_MOUSE_DOWN, this._onExit, this);
    i.addEventListener(ON_MOUSE_DOWN, this._onRestart, this);
  }, this.show = function (n, r, u) {
    void 0;
    this.resetPosHomeButton();
    v = u;
    h = u === 0 || s_b2Players ? playSfxSound("win", 1, !1) : playSfxSound("game_over", 1, !1);
    a = r;
    l.refreshText(n);
    s.refreshText("");
    s_bMultiplayer || s.refreshText(TEXT_SCORE + ": " + r);
    this.refreshButtonPos();
    t.visible = !0;
    i.enable();
    var f = this;
    createjs.Tween.get(t).to({
      alpha: 1
    }, 500).call(function () {
      f._initListener();
    });
    void 0;
    void 0;
  }, this.isShown = function () {
    return t.visible;
  }, this.hide = function () {
    void 0;
    t.visible = !1;
  }, this.hideRestartButton = function () {
    i.setVisible(!1);
    i.stopAnimation();
  }, this.hideButtons = function () {
    f.setVisible(!1);
    i.setVisible(!1);
    i.stopAnimation();
  }, this.showButtons = function () {
    f.setVisible(!0);
    i.setVisible(!0);
  }, this.changeMessage = function (n) {
    l.refreshText(n);
  }, this.centerHomeButton = function () {
    var n = s_oSpriteLibrary.getSprite("msg_box");
    f.setX(0);
    f.setVisible(!0);
  }, this.resetPosHomeButton = function () {
    f.setX(-100);
  }, this.notifyRestart = function (n) {
    s.refreshText(n);
    i.trembleAnimation();
  }, this._onExit = function () {
    h.stop();
    u = ON_BACK_MENU;
    e[u] && e[u].call(c[u]);
  }, this._onRestart = function () {
    i.disable();
    h.stop();
    u = ON_RESTART;
    e[u] && e[u].call(c[u]);
  }, this._init(n), this;
}
function CMsgBox() {
  var r,
    f,
    o,
    l,
    e,
    h,
    c,
    n,
    t,
    i,
    u,
    s = 125,
    a = 125,
    v = .36;
  return this._init = function () {
    var r, y, p, w;
    f = [];
    o = [];
    i = new createjs.Container();
    i.visible = !1;
    s_oStage.addChild(i);
    e = new createjs.Shape();
    e.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    e.alpha = .7;
    l = e.on("click", function () {});
    i.addChild(e);
    u = new createjs.Container();
    i.addChild(u);
    r = s_oSpriteLibrary.getSprite("msg_box");
    y = createBitmap(r);
    y.regX = r.width / 2;
    y.regY = r.height / 2;
    u.addChild(y);
    h = new CTLText(u, -240, -170, 480, 70, 44, "center", FONT_COLOR, PRIMARY_FONT, 1, 0, 0, " ", !0, !0, !0, !1);
    c = new CTLText(u, -240, -95, 480, 160, 32, "center", FONT_COLOR, PRIMARY_FONT, 1.2, 0, 0, " ", !0, !0, !0, !1);
    p = s_oSpriteLibrary.getSprite("but_long");
    w = createMarginRect(40, 20, 40, 20);
    n = new CGfxButton(-s, a, p, u);
    n.addText(w, TEXT_SYS_BACK, "center", PRIMARY_FONT, FONT_COLOR, 80, 1, !1);
    n.setScale(v);
    n.addEventListener(ON_MOUSE_UP, this._onBack, this);
    t = new CGfxButton(s, a, p, u);
    t.addText(w, TEXT_RE_ENTER, "center", PRIMARY_FONT, FONT_COLOR, 80, 1, !1);
    t.setScale(v);
    t.addEventListener(ON_MOUSE_UP, this._onConfirm, this);
    this.refreshButtonPos();
  }, this.refreshButtonPos = function () {
    adaptInScreen(u, createMarginRect(40, 120, 40, 40), 1.5);
  }, this.unload = function () {
    n.unload();
    t.unload();
    e.off("click", l);
    s_oStage.removeChild(i);
  }, this.addEventListener = function (n, t, i) {
    f[n] = t;
    o[n] = i;
  }, this.show = function (r) {
    this.resetState();
    h.refreshText(r);
    s_oStage.setChildIndex(i, s_oStage.numChildren - 1);
    this.refreshButtonPos();
    i.alpha = 0;
    i.visible = !0;
    createjs.Tween.get(i, {
      override: !0
    }).to({
      alpha: 1
    }, 500).call(function () {
      n.enable();
      t.enable();
    });
  }, this.hide = function () {
    n.disable();
    t.disable();
    createjs.Tween.get(i, {
      override: !0
    }).to({
      alpha: 0
    }, 300).call(function () {
      i.visible = !1;
    });
  }, this.resetState = function () {
    c.refreshText(" ");
    n.setX(-s);
    t.setX(s);
    n.setVisible(!0);
    t.setVisible(!0);
    n.changeText(0, TEXT_SYS_BACK.toUpperCase());
    t.changeText(0, TEXT_RE_ENTER.toUpperCase());
    this._normalizeButtonsText();
  }, this._normalizeButtonsText = function () {
    normalizeFontSize([n.getTextObj(0), t.getTextObj(0)]);
  }, this.changeMessage = function (n) {
    h.refreshText(n);
  }, this.changeExplMessage = function (n) {
    c.refreshText(n.replace(/<br\s*\/?>/gi, "\n"));
  }, this.setButtonsText = function (i, r) {
    n.changeText(0, i.toUpperCase());
    t.changeText(0, r.toUpperCase());
    this._normalizeButtonsText();
  }, this.hideBackButton = function () {
    n.setVisible(!1);
    t.getTextObj(0).resetFontSize();
  }, this.hideConfirmButton = function () {
    t.setVisible(!1);
    n.getTextObj(0).resetFontSize();
  }, this.centerBackButton = function () {
    n.setX(0);
    n.setVisible(!0);
  }, this.centerConfirmButton = function () {
    t.setX(0);
    t.setVisible(!0);
  }, this.isShown = function () {
    return i.visible;
  }, this._onBack = function () {
    this.hide();
    r = ON_BACK;
    f[r] && f[r].call(o[r]);
  }, this._onConfirm = function () {
    this.hide();
    r = ON_CONFIRM;
    f[r] && f[r].call(o[r]);
  }, this._init(), this;
}
function CAlertBox(n) {
  var i,
    t,
    f,
    u,
    e,
    o,
    s = this,
    r;
  this.init = function (n) {
    var s;
    r = !0;
    f = n;
    i = new createjs.Container();
    f.addChild(i);
    t = new createjs.Container();
    t.on("mousedown", this.onMouseDown);
    i.addChild(t);
    s = s_oSpriteLibrary.getSprite("alert_box");
    u = createBitmap(s, s.width, s.height);
    u.regX = s.width / 2 - 3;
    u.regY = s.height / 2 - 8;
    t.addChild(u);
    var h = s.width - 50,
      c = s.height - 20;
    e = new CTLText(t, 0 - h / 2, 6 - c / 2, h, c, 38, "center", FONT_COLOR, PRIMARY_FONT, 1.1, 2, 2, " ", !0, !0, !0, !1);
    o = s.height;
    this.refreshButtonPos();
    t.y = this._getHiddenY();
  };
  this.refreshButtonPos = function () {
    var n = t.y;
    t.y = 0;
    adaptInScreen(i, createMarginRect(40, 120, 40, 40), 1.5);
    t.y = r && !createjs.Tween.hasActiveTweens(t) ? this._getHiddenY() : n;
  };
  this._getHiddenY = function () {
    return (CANVAS_HEIGHT - i.y) / i.scaleY + o;
  };
  this.show = function (n) {
    r = !1;
    e.refreshText(n);
    createjs.Tween.removeTweens(t);
    new createjs.Tween.get(t).to({
      y: 0
    }, 500, createjs.Ease.cubicOut).wait(2e3).call(function () {
      r || s.hide();
    });
  };
  this.hide = function () {
    r = !0;
    createjs.Tween.removeTweens(t);
    new createjs.Tween.get(t).to({
      y: this._getHiddenY()
    }, 500, createjs.Ease.cubicIn);
  };
  this.onMouseDown = function () {
    r || s.hide();
  };
  this.init(n);
}
function CBoard(n, t, i) {
  var v, p, w, r, u, f, h, c, g, tt, e, b, y, k, d, l, a, o, s, nt;
  this._init = function () {
    var r, u, f;
    v = [];
    p = [];
    g = 0;
    h = 0;
    c = 0;
    a = new CBackgammonRules();
    tt = i;
    e = new createjs.Container();
    e.x = n;
    e.y = t;
    i.addChild(e);
    r = new createjs.Container();
    l = new CBoardTable(0, 0, e, r);
    b = new createjs.Container();
    e.addChild(b);
    y = new createjs.Container();
    e.addChild(y);
    k = new createjs.Container();
    e.addChild(k);
    d = new createjs.Container();
    e.addChild(d);
    e.addChild(r);
    w = [0, 0, 11, 11, 11, 11, 11, 16, 16, 16, 18, 18, 18, 18, 18, 23, 23, 12, 12, 12, 12, 12, 7, 7, 7, 5, 5, 5, 5, 5];
    u = s_oSpriteLibrary.getSprite("but_bearoff");
    o = new CGfxButton(0, 0, u, r);
    o.jumpAnimation("x");
    o.setVisible(!1);
    f = new createjs.Graphics().beginFill("rgba(0,0,0,0.01)").drawRect(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT);
    s = new createjs.Shape(f);
    nt = s.on("click", function () {});
    s.visible = !1;
    e.addChild(s);
    this.buildBoard();
  };
  this.unload = function () {
    s.off("click", nt);
    o.unload();
  };
  this.refreshSize = function (n, t) {
    var f = r[0].getSize(),
      h = 12 * f.width + n,
      c = 2 * f.height + t,
      i,
      u,
      e;
    l.refreshSize(h, c);
    i = l.getFullSize();
    s.graphics.clear();
    s.graphics.beginFill("rgba(0,0,0,0.01)").drawRect(-i.width / 2, -i.height / 2, i.width, i.height);
    u = i.width / 2;
    o.stopAnimation();
    s_bLandscape ? o.setPosition(u, 0) : (e = 80, o.setPosition(u - e, 0));
    o.jumpAnimation("x");
    this._refreshTriangleDisposition(n, t);
  };
  this.unblock = function () {
    s.visible = !1;
  };
  this.block = function () {
    s.visible = !0;
  };
  this._refreshTriangleDisposition = function (i, u) {
    for (var l = r[0].getSize(), o = l.width, a = l.height, v = 4, c = TRIANGLE_UP, h = i / 2 + o / 2, s = (a + u / 2) * c - v, e = 0, f = 6; f > 0; f--) n = h + o * (f - 1), t = s, r[e].setPos(n, t), e++;
    for (f = 0; f < 6; f++) n = -(h + o * f), t = s, r[e].setPos(n, t), e++;
    for (c = TRIANGLE_DOWN, s = (a + u / 2) * c + v, f = 6; f > 0; f--) n = -(h + o * (f - 1)), t = s, r[e].setPos(n, t), e++;
    for (f = 0; f < 6; f++) n = h + o * f, t = s, r[e].setPos(n, t), e++;
    for (f = 0; f < r.length; f++) r[f].refreshPiecesPos();
  };
  this.addEventListener = function (n, t, i) {
    v[n] = t;
    p[n] = i;
  };
  this._triggerEvent = function (n, t) {
    v[n] && v[n].call(p[n], t);
  };
  this.reset = function () {
    var n, i, t;
    for (h = 0, c = 0, g = 0, this._oCurrentPiece && this._oCurrentPiece.setClicked(!1), n = 0; n < r.length; n++) r[n].reset();
    for (n = 0; n < u.length; n++) for (i = u[n].getArrayPieces(), u[n].reset(), t = 0; t < i.length; t++) i[t].setBar(!1);
  };
  this.restart = function () {
    var n;
    for (this.reset(), n = 0; n < NUM_PIECES * 2; n++) {
      var i = w[n],
        u = r[i],
        t = f[n];
      t.setTriangleID(i);
      t.setVisible(!0);
      u.addPiece(t);
    }
    for (n = 0; n < r.length; n++) r[n].refreshPiecesPos();
  };
  this.restoreState = function (n) {
    var l, s, a, i, o, t, e;
    for (this.reset(), l = [0, NUM_PIECES], s = function (n) {
      return f[l[n]++];
    }, e = 0; e < r.length; e++) for (a = Math.abs(n.aPoints[e]), i = n.aPoints[e] > 0 ? WHITE : BLACK, o = 0; o < a; o++) t = s(i), t.setTriangleID(e), t.setBar(!1), t.setVisible(!0), r[e].addPiece(t);
    for (i = WHITE; i <= BLACK; i++) {
      for (o = 0; o < n.aBar[i]; o++) t = s(i), t.setTriangleID(i === WHITE ? -1 : 24), t.setBar(!0), t.setVisible(!0), t.setPos(u[i].getX(), u[i].getNextPieceY()), u[i].addPiece(t);
      for (o = 0; o < n.aOff[i]; o++) t = s(i), t.setTriangleID(null), t.setBar(!1), t.setVisible(!1), t.unloadListeners();
    }
    for (h = n.aOff[WHITE], c = n.aOff[BLACK], e = 0; e < r.length; e++) r[e].refreshPiecesPos();
  };
  this.buildBoard = function () {
    var e, i, n;
    for (u = [], u.push(new CBar(0, -165, WHITE, y)), u.push(new CBar(0, 165, BLACK, y)), r = [], n = 0; n < NUM_TRIANGLES; n++) e = TRIANGLE_UP, n >= NUM_TRIANGLES / 2 && (e = TRIANGLE_DOWN), i = new CTriangle(0, 0, b, n, d, e), i.addEventListener(ON_CLICK_ON_TRIANGLE, this._onClickOnTriangle, this), r.push(i);
    for (f = [], n = 0; n < NUM_PIECES * 2; n++) {
      var o = w[n],
        i = r[o],
        s = n < NUM_PIECES ? WHITE : BLACK,
        t = new CPiece(0, 0, s, k, n);
      t.addEventListener(ON_CLICK_ON_PIECE, this._onClickOnPiece, this);
      t.addEventListener(ON_END_MOVE_PIECE, this._onEndMovePiece, this);
      t.setTriangleID(o);
      f.push(t);
      i.addPiece(t);
    }
  };
  this.initDistribution = function () {
    this._triggerEvent(ON_END_DISTRIBUTION);
  };
  this._onClickOnTriangle = function (n) {
    this._triggerEvent(ON_CLICK_ON_TRIANGLE, n);
  };
  this._onClickOnPiece = function (n) {
    this._triggerEvent(ON_CLICK_ON_PIECE, n);
  };
  this._onEndMovePiece = function (n) {
    this._triggerEvent(ON_END_MOVE_PIECE, n);
  };
  this.getTriangles = function () {
    return r;
  };
  this.getBars = function () {
    return u;
  };
  this.getPieces = function () {
    return f;
  };
  this.getPieceByIndex = function (n) {
    for (var t = 0; t < f.length; t++) if (f[t].getIndex() === n) return f[t];
  };
  this.getPiecesByColor = function (n) {
    for (var i = [], t = 0; t < f.length; t++) f[t].getColor() === n && i.push(f[t]);
    return i;
  };
  this.getPiecesOnTriangles = function (n) {
    for (var u, t, f, e = [], i = 0; i < r.length; i++) for (u = r[i].getArrayPieces(), t = 0; t < u.length; t++) f = u[t], f.getColor() === n && e.push(f);
    return e;
  };
  this.getPiecesOnBar = function (n) {
    for (var i = [], r = u[n].getArrayPieces(), t = 0; t < r.length; t++) i.push(r[t]);
    return i;
  };
  this._enablePiecesListenerOnTriangle = function (n) {
    for (var i = this.getPiecesOnTriangles(n), t = 0; t < i.length; t++) i[t].initListeners();
  };
  this._enablePiecesListenerOnBar = function (n) {
    for (var i = this.getPiecesOnBar(n), t = 0; t < i.length; t++) i[t].initListeners();
  };
  this.enablePiecesListener = function (n) {
    u[n].getNumPieces() === 0 ? this._enablePiecesListenerOnTriangle(n) : this._enablePiecesListenerOnBar(n);
  };
  this.disablePiecesListener = function () {
    for (var n = 0; n < f.length; n++) f[n].unloadListeners();
  };
  this.getRulesState = function () {
    for (var i, n = a.createState(), t = 0; t < r.length; t++) i = r[t].getNumPieces(), n.aPoints[t] = r[t].getPiecesColor() === WHITE ? i : -i;
    return n.aBar[WHITE] = u[WHITE].getNumPieces(), n.aBar[BLACK] = u[BLACK].getNumPieces(), n.aOff[WHITE] = h, n.aOff[BLACK] = c, n;
  };
  this.getMoves = function (n, t) {
    return a.getPieceMoves(this.getRulesState(), n.getColor(), n.getTriangle(), t);
  };
  this.checkMovesAvailable = function (n, t) {
    return a.checkRules(this.getRulesState(), n, t);
  };
  this.getBrokenRule = function (n, t, i) {
    return a.getBrokenRule(n, t, i);
  };
  this.enableBearOff = function (n) {
    o.setVisible(!0);
    o.addEventListener(ON_MOUSE_UP, this._onBearOff, this, n);
  };
  this.disableBearOff = function () {
    o.setVisible(!1);
  };
  this._onBearOff = function (n) {
    this._triggerEvent(ON_CLICK_ON_BEAROFF, n);
  };
  this.getPieceOnTop = function (n) {
    return n.getTriangle() !== -1 && n.getTriangle() !== 24 ? r[n.getTriangle()].getLastPiece() : u[n.getColor()].getLastPiece();
  };
  this.setPieceOnTop = function (n) {
    n.setAsLastChild();
  };
  this.getCurPieceSelected = function () {
    return this._oCurrentPiece;
  };
  this.setCurPiece = function (n) {
    this._oCurrentPiece = n;
    this.setPieceOnTop(n);
  };
  this.enableMovements = function (n, t, i) {
    if (t) {
      if (n[0].length > 0) r[n[0][0].iFocusTriangle].onFocus(n[0][0]);
      if (n[0].length > 1 && u[i].getNumPieces() < 2) r[n[0][1].iFocusTriangle].onFocus(n[0][1]);
      if (n[0].length > 2 && u[i].getNumPieces() < 2) r[n[0][2].iFocusTriangle].onFocus(n[0][2]);
      if (n[0].length > 3 && u[i].getNumPieces() < 2) r[n[0][3].iFocusTriangle].onFocus(n[0][3]);
    } else {
      if (n[0].length > 0) r[n[0][0].iFocusTriangle].onFocus(n[0][0]);
      if (n[1].length > 0) r[n[1][0].iFocusTriangle].onFocus(n[1][0]);
      if (n[2].length > 0 && u[i].getNumPieces() < 2) r[n[2][0].iFocusTriangle].onFocus(n[2][0]);
    }
    n[3].length > 0 && this.enableBearOff(n[3][0]);
  };
  this.disableMovements = function () {
    this.disableBearOff();
    for (var n = 0; n < r.length; n++) r[n].onIdle();
    this._oCurrentPiece && this._oCurrentPiece.setClicked(!1);
  };
  this.checkMovement = function (n, t) {
    var i = this.getPieceOnTop(n),
      u,
      r;
    i.isClicked() ? this.disableMovements() : (this.disableMovements(), u = i.getColor(), r = this.getMoves(i, t), r && (i.setAsLastChild(), i.setClicked(!0), this._oCurrentPiece = i, this.enableMovements(r, t.doubledice, u)));
  };
  this.movePieceOnTriangle = function (n, t) {
    var i, f;
    n.movePieceOnBoard(t.getX(), t.getNextPieceY());
    n.isOnBar() ? (i = n.getColor(), u[i].getLastPiece().setBar(!1), t.addPiece(u[i].removePiece())) : t.addPiece(r[n.getTriangle()].removePiece());
    f = t.getCellID();
    n.setTriangleID(f);
  };
  this.bearOffPiece = function (n) {
    var u,
      f = n.getColor(),
      i,
      t;
    u = f === WHITE ? h++ : c++;
    i = r[n.getTriangle()];
    t = 600;
    s_bLandscape && (t = 600);
    new createjs.Tween.get(n.getPiece()).to({
      x: CANVAS_WIDTH + 300
    }, t, createjs.Ease.cubicOut).call(() => {
      n.setVisible(!1);
    });
    i.removePiece();
    n.setTriangleID(null);
    n.unloadListeners();
    this._onEndMovePiece();
  };
  this.moveIsolatedPieceOnBar = function (n) {
    var t = n.getLastPiece(),
      i = t.getColor(),
      r = i === WHITE ? -1 : 24;
    t.shiftPiece(u[i].getX(), u[i].getNextPieceY());
    t.setTriangleID(r);
    t.setBar(!0);
    u[i].addPiece(n.removePiece());
  };
  this.foundIsolatedOpponentPiece = function (n, t) {
    var i = !1;
    return n.getPiecesColor() !== t && n.getNumPieces() === 1 && (i = !0), i;
  };
  this.countPiecesInGame = function (n) {
    for (var f, t, o, e = 0, i = 0; i < r.length; i++) for (f = r[i].getArrayPieces(), t = 0; t < f.length; t++) o = f[t], n === o.getColor() && e++;
    return e + u[n].getNumPieces();
  };
  this.getBounds = function () {
    return e.getBounds();
  };
  this.getTableBounds = function () {
    return l.getFullSize();
  };
  this.debug = function () {
    for (var n = 0; n < r.length; n++) r[n].getNumPieces() > 0 && r[n].getLastPiece().unloadListeners();
  };
  this.changeSkin = function () {
    var n;
    for (l.changeSkin(), n = 0; n < r.length; n++) r[n].changeSkin();
    for (n = 0; n < f.length; n++) f[n].changeSkin();
    for (n = 0; n < u.length; n++) u[n].changeSkin();
  };
  this._init();
}
function CBoardTable(n, t, i, r) {
  var d, a, nt, g, u, f, v, y, o, h, k, p, w, s, c, l, b, e;
  this._init = function (n, t, i, r) {
    var it, tt;
    d = 0;
    a = 0;
    nt = i;
    tt = s_oSpriteLibrary.getSprite("board_occlusion");
    e = createBitmap(tt);
    e.regX = tt.width / 2;
    e.regY = tt.height / 2;
    e.x = n;
    e.y = t;
    i.addChild(e);
    u = new createjs.Container();
    u.x = n;
    u.y = t;
    i.addChild(u);
    g = r;
    f = new createjs.Container();
    f.x = n;
    f.y = t;
    g.addChild(f);
    it = SKIN_CONFIG[s_iSkinID].board.name;
    tt = s_oSpriteLibrary.getSprite("board_bg_" + it);
    v = createBitmap(tt);
    v.regX = tt.width / 2;
    v.regY = tt.height / 2;
    u.addChild(v);
    tt = s_oSpriteLibrary.getSprite("board_v_line_" + it);
    y = createBitmap(tt);
    y.regY = tt.height / 2;
    u.addChild(y);
    o = createBitmap(tt);
    o.regY = tt.height / 2;
    o.scaleX = -1;
    u.addChild(o);
    h = new createjs.Container();
    u.addChild(h);
    k = createBitmap(tt);
    k.regY = tt.height / 2;
    h.addChild(k);
    p = createBitmap(tt);
    p.regY = tt.height / 2;
    p.scaleX = -1;
    h.addChild(p);
    tt = s_oSpriteLibrary.getSprite("hinge");
    c = createBitmap(tt);
    c.regX = tt.width / 2;
    c.regY = tt.height / 2;
    h.addChild(c);
    l = createBitmap(tt);
    l.regX = tt.width / 2;
    l.regY = tt.height / 2;
    h.addChild(l);
    this.setHingesVisibilty();
    tt = s_oSpriteLibrary.getSprite("board_h_line_" + it);
    w = createBitmap(tt);
    w.regX = tt.width / 2;
    f.addChild(w);
    s = createBitmap(tt);
    s.regX = tt.width / 2;
    s.scaleY = -1;
    f.addChild(s);
    b = new createjs.Shape();
    u.mask = b;
    f.mask = b;
  };
  this.refreshSize = function (n, t) {
    var h;
    d = n;
    a = t;
    var v = 50,
      i = d + v,
      r = a + v;
    w.y = -r / 2;
    s.y = r / 2;
    y.x = -i / 2;
    o.x = i / 2;
    c.y = -a / 4;
    l.y = a / 4;
    h = 889;
    e.scaleX = i / h;
    e.scaleY = r / h;
    b.graphics.clear();
    b.graphics.beginFill("#f00").drawRoundRect(-i / 2, -r / 2, i, r, 20);
    u.setBounds(-i / 2, -r / 2, i, r);
    f.setBounds(-i / 2, -r / 2, i, r);
  };
  this.getFullSize = function () {
    return {
      width: o.x * 2,
      height: s.y * 2
    };
  };
  this.setHingesVisibilty = function () {
    var t = SKIN_CONFIG[s_iSkinID].board,
      n = !1;
    t.hasOwnProperty("hinges") && (n = t.hinges);
    c.visible = n;
    l.visible = n;
  };
  this.changeSkin = function () {
    var t = SKIN_CONFIG[s_iSkinID].board.name,
      n = s_oSpriteLibrary.getSprite("board_bg_" + t);
    v.image = n;
    n = s_oSpriteLibrary.getSprite("board_v_line_" + t);
    y.image = n;
    o.image = n;
    k.image = n;
    p.image = n;
    n = s_oSpriteLibrary.getSprite("board_h_line_" + t);
    w.image = n;
    s.image = n;
    this.setHingesVisibilty();
  };
  this._init(n, t, i, r);
}
function CAI(n) {
  var i, t;
  this._init = function (n) {
    i = n;
    t = n.getBoard();
  };
  this.cpuChoicePiece = function () {
    var o,
      f,
      h = [],
      n = 0,
      v = t.getTriangles(),
      y = t.getPiecesOnBar(BLACK),
      s,
      c,
      l,
      u,
      r,
      e,
      a;
    if (y.length > 0) {
      if (o = t.getPieceOnTop(y[0]), f = t.getMoves(o, i.getDiceResult()), f) for (s = 0; s < f.length - 1; s++) for (e = 0; e < f[s].length; e++) u = f[s][e].iFocusTriangle, r = v[u], n = 0, r.getNumPieces() === 1 && r.getPiecesColor() === BLACK && n++, u < 13 && n++, u > 13 && r.getNumPieces() === 1 && n++, u < 13 && r.getNumPieces() === 1 && n--, r.getNumPieces() === 1 && u < 13 && n++, h.push({
        oMove: f[s][e],
        iPoints: n,
        oCurrentPiece: o
      });
    } else for (s = 0; s < v.length; s++) if (c = v[s], c.getNumPieces() > 0 && (o = c.getLastPiece(), o.getColor() === BLACK && o.isActive() && (f = t.getMoves(o, i.getDiceResult()), f))) {
      for (l = 0; l < f.length - 1; l++) for (e = 0; e < f[l].length; e++) u = f[l][e].iFocusTriangle, r = v[u], n = 0, c.getNumPieces() < 3 && (n -= 3), r.getNumPieces() === 1 && r.getPiecesColor() === BLACK && (n += 3), r.getNumPieces() === 1 && r.getPiecesColor() === WHITE && (n += 5), u < 13 && n++, u > 13 && n--, u > 11 && r.getNumPieces() === 1 && r.getPiecesColor() === WHITE && (n += 4), u < 11 && r.getNumPieces() === 1 && r.getPiecesColor() === WHITE && n--, c.getNumPieces() === 1 && n++, r.getNumPieces() === 1 && u < 13 && n++, o.getTriangle() > 5 && u <= 5 && (n += 5), o.getTriangle() <= 5 && c.getNumPieces() < 3 && (n -= 10), u < 6 && r.getNumPieces() === 0 && (n -= 5), o.getTriangle() <= 5 && (n -= 4), h.push({
        oMove: f[l][e],
        iPoints: n,
        oCurrentPiece: o
      });
      for (e = 0; e < f[3].length; e++) h.push({
        oMove: f[3][e],
        iPoints: 50,
        oCurrentPiece: o
      });
    }
    if (h.sort(function (n, t) {
      return parseFloat(t.iPoints) - parseFloat(n.iPoints);
    }), a = this.cpuRemoveNotAllowedMoves(h), a.length === 0 && (console.warn("CAI: no allowed move after filtering, using the unfiltered list"), a = h), a.length === 0) {
      console.warn("CAI: no move available, skipping the turn");
      i.skipTurn();
      return;
    }
    h = a;
    t.setCurPiece(h[0].oCurrentPiece);
    i.onClickedTriangle(h[0].oMove);
  };
  this.cpuRemoveNotAllowedMoves = function (n) {
    for (var e, o, f, u = [], s = t.checkMovesAvailable(BLACK, i.getDiceResult()), r = 0; r < n.length; r++) {
      var h = n[r].oCurrentPiece.getTriangle(),
        f = n[r].oMove,
        c = t.getBrokenRule(s, h, f.iFocusTriangle);
      c === RULE_BROKEN_NONE && u.push(n[r]);
    }
    if (e = t.getPiecesOnBar(BLACK), o = e.length, o > 0) for (r = 0; r < u.length; r++) f = u[r].oMove, f.num_dice_used > 1 && (u.splice(r, 1), r--);
    return u;
  };
  this._init(n);
}
function CPiece(n, t, i, r, u) {
  var a, y, s, h, p, f, c, e, nt, o, v, w, d, g, b, k, l;
  this.init = function (n, t, i, r, u) {
    var tt, g;
    a = [];
    y = [];
    s = n;
    h = t;
    p = i;
    nt = !1;
    w = r;
    f = new createjs.Container();
    f.x = s;
    f.y = h;
    f.scale = .75;
    w.addChild(f);
    o = this;
    d = u;
    b = null;
    k = !1;
    l = !1;
    tt = this.getSprite();
    c = createBitmap(tt, tt.width, tt.height);
    f.addChild(c);
    g = s_oSpriteLibrary.getSprite("highlight");
    e = createBitmap(g, g.width, g.height);
    e.regX = g.width / 2;
    e.regY = g.height / 2;
    e.alpha = 0;
    v = !1;
    this.setOffset(tt);
    f.cursor = "pointer";
    f.addChild(e);
  };
  this.addEventListener = function (n, t, i) {
    a[n] = t;
    y[n] = i;
  };
  this._triggerEvent = function (n, t) {
    a[n] && a[n].call(y[n], t);
  };
  this.setPos = function (n, t) {
    s = n;
    h = t;
    f.x = s;
    f.y = h;
  };
  this.setVisible = function (n) {
    f.visible = n;
  };
  this.setClicked = function (n) {
    n === !0 ? (e.alpha = 1, v = !0) : (e.alpha = 0, v = !1);
  };
  this.isClicked = function () {
    return v;
  };
  this.getColor = function () {
    return p;
  };
  this.getInstance = function () {
    return o;
  };
  this.getPiece = function () {
    return f;
  };
  this.getIndex = function () {
    return d;
  };
  this.getX = function () {
    return s;
  };
  this.getY = function () {
    return h;
  };
  this.stopAnimation = function () {
    createjs.Tween.removeTweens(f);
  };
  this.setTriangleID = function (n) {
    b = n;
  };
  this.getTriangle = function () {
    return b;
  };
  this.setAsLastChild = function () {
    w.addChild(f);
  };
  this.setBar = function (n) {
    k = n;
  };
  this.isOnBar = function () {
    return k;
  };
  this.movePieceDistribution = function (n, t) {
    playSfxSound("click_cell", 1, !1);
    new createjs.Tween.get(f).to({
      x: n,
      y: t
    }, MS_DISTRIBUTION, createjs.Ease.cubicOut).call(function () {
      o._triggerEvent(ON_END_DISTRIBUTION, o);
    });
  };
  this.movePieceOnBoard = function (n, t) {
    var i = 700;
    void 0;
    new createjs.Tween.get(f).to({
      x: n,
      y: t
    }, i, createjs.Ease.cubicOut).call(function () {
      o._triggerEvent(ON_END_MOVE_PIECE, o);
    });
  };
  this.shiftPiece = function (n, t) {
    new createjs.Tween.get(f).to({
      x: n,
      y: t
    }, 700, createjs.Ease.cubicOut);
  };
  this.initListeners = function () {
    f.cursor = "pointer";
    g = f.on("mousedown", function () {
      o._triggerEvent(ON_CLICK_ON_PIECE, o);
    });
    l = !0;
  };
  this.unloadListeners = function () {
    f.cursor = "default";
    f.off("mousedown", g);
    l = !1;
  };
  this.active = function (n) {
    l = n;
  };
  this.isActive = function () {
    return l;
  };
  this.getSprite = function () {
    var n = SKIN_CONFIG[s_iSkinID].piece_set.name;
    return p === WHITE ? s_oSpriteLibrary.getSprite("piece_white_" + n) : s_oSpriteLibrary.getSprite("piece_black_" + n);
  };
  this.setOffset = function (n) {
    var t = SKIN_CONFIG[s_iSkinID].piece_set.position,
      r = 0,
      u = 0,
      i;
    t.hasOwnProperty("regX") && (r = t.regX);
    t.hasOwnProperty("regY") && (u = t.regY);
    c.regX = n.width / 2 + r;
    c.regY = n.height / 2 + u;
    i = s_oSpriteLibrary.getSprite("highlight");
    e.regX = i.width / 2;
    e.regY = i.height / 2;
  };
  this.changeSkin = function () {
    var n = this.getSprite();
    c.image = n;
    this.setOffset(n);
  };
  this.init(n, t, i, r, u);
}
function CTriangle(n, t, i, r, u, f) {
  var p, b, nt, c, v, o, l, tt, s, k, w, a, d, e, y, it, h, g;
  this.init = function (n, t, i, r, u, f) {
    p = [];
    b = [];
    nt = [];
    c = n;
    v = t;
    d = r;
    w = f;
    y = null;
    g = this;
    tt = i;
    k = u;
    s = new createjs.Container();
    s.x = c;
    s.y = v;
    tt.addChild(s);
    e = [];
    var h = this._getSpriteSheet();
    a = new createSprite(h, "idle", o / 2, 0, o, l);
    w === TRIANGLE_DOWN && (a.scaleY *= -1);
    s.addChild(a);
  };
  this._triggerEvent = function (n, t) {
    p[n] && p[n].call(b[n], t);
  };
  this.addEventListener = function (n, t, i, r) {
    p[n] = t;
    b[n] = i;
    nt = r;
  };
  this.reset = function () {
    e = [];
    y = null;
    this.onIdle();
  };
  this.setPos = function (n, t) {
    c = n;
    v = t;
    s.x = c;
    s.y = v;
  };
  this.refreshPiecesPos = function () {
    for (var t, i, n = 0; n < e.length; n++) t = c, i = this._calculateY(n), e[n].setPos(t, i);
  };
  this.getSize = function () {
    return {
      width: o,
      height: l
    };
  };
  this.getX = function () {
    return c;
  };
  this._calculateY = function (n) {
    var r = SKIN_CONFIG[s_iSkinID].piece_set.position,
      u = 0;
    r.hasOwnProperty("spacingY") && (u = r.spacingY);
    var t = PIECE_DIM + u,
      i = this._getRowFromIndex(n),
      f = i * (2 * BASE_GROUP_PIECES - i + 1) / 2,
      e = n - f,
      o = i * t / 2;
    return s.y - (e * t + o + t / 2) * w;
  };
  this._getRowFromIndex = function (n) {
    const t = 2 * BASE_GROUP_PIECES + 1,
      i = Math.sqrt(t * t - 8 * n);
    return Math.floor((t - i) / 2);
  };
  this.getNextPieceY = function () {
    return this._calculateY(e.length);
  };
  this.getNumPieces = function () {
    return e.length;
  };
  this.addPiece = function (n) {
    e.push(n);
    y = n.getColor();
  };
  this.getPiecesColor = function () {
    return y;
  };
  this.getPieceByIndex = function (n) {
    return e[n];
  };
  this.onFocus = function (n) {
    a.gotoAndStop("focus");
    this.initShape(n);
  };
  this.onIdle = function () {
    a.gotoAndStop("idle");
    k.removeChild(h);
  };
  this.getCellID = function () {
    return d;
  };
  this.getLastPiece = function () {
    return e[e.length - 1];
  };
  this.getArrayPieces = function () {
    return e;
  };
  this.removePiece = function () {
    var n = e.pop();
    return e.length === 0 && (y = null), n;
  };
  this.initShape = function (n) {
    h = new createjs.Shape();
    var t = c - o / 2,
      i = v;
    w === TRIANGLE_UP ? h.graphics.beginFill("#000000").drawRect(t, i, o, l) : h.graphics.beginFill("#000000").drawRect(t, i, o, -l);
    h.alpha = .01;
    h.cursor = "pointer";
    g = this;
    it = h.on("mousedown", function () {
      g._triggerEvent(ON_CLICK_ON_TRIANGLE, n);
    });
    k.addChild(h);
  };
  this._getSpriteSheet = function () {
    var t = SKIN_CONFIG[s_iSkinID].selection.name,
      n,
      i,
      r;
    return n = d % 2 == 0 ? s_oSpriteLibrary.getSprite("triangle_1_" + t) : s_oSpriteLibrary.getSprite("triangle_0_" + t), o = n.width / 2, l = n.height, i = {
      images: [n],
      frames: {
        width: o,
        height: l,
        regX: o / 2,
        regY: 0
      },
      animations: {
        idle: [0, 0, "idle"],
        focus: [1, 1, "focus"]
      }
    }, r = new createjs.SpriteSheet(i), r;
  };
  this.changeSkin = function () {
    var n = this._getSpriteSheet();
    a.spriteSheet = n;
    this.refreshPiecesPos();
  };
  this.init(n, t, i, r, u, f);
}
function CBar(n, t, i, r) {
  var o, a, c, f, l, u, s, e, h;
  this.init = function (n, t, i, r) {
    c = r;
    f = new createjs.Container();
    f.x = n;
    f.y = t;
    c.addChild(f);
    o = n;
    a = t;
    s = null;
    u = [];
    l = i;
    e = new createjs.Shape();
    e.graphics.beginFill("#000000").drawRect(n, t, 62, 253);
    e.regX = 31;
    h = TRIANGLE_DOWN;
    l === BLACK && (h = TRIANGLE_UP, e.regY = 253);
    e.alpha = .01;
    f.addChild(e);
  };
  this.refreshPiecesPos = function () {
    for (var t, i, n = 0; n < u.length; n++) t = o, i = this._calculateY(n), u[n].setPos(t, i);
  };
  this.reset = function () {
    u = [];
  };
  this.getX = function () {
    return o;
  };
  this._calculateY = function (n) {
    var t = SKIN_CONFIG[s_iSkinID].piece_set.position,
      i = 0,
      r;
    return t.hasOwnProperty("spacingY") && (i = t.spacingY), r = PIECE_DIM + i, f.y - n * r * h;
  };
  this.getNextPieceY = function () {
    return this._calculateY(u.length);
  };
  this.getNumPieces = function () {
    return u.length;
  };
  this.addPiece = function (n) {
    u.push(n);
    s = n.getColor();
  };
  this.getColor = function () {
    return s;
  };
  this.getPieceByIndex = function (n) {
    return u[n];
  };
  this.getLastPiece = function () {
    return u[u.length - 1];
  };
  this.getArrayPieces = function () {
    return u;
  };
  this.removePiece = function () {
    return u.pop();
  };
  this.changeSkin = function () {
    this.refreshPiecesPos();
  };
  this.init(n, t, i, r);
}
function CBackgammonRules() {
  var n = 24,
    t = 24,
    i = 25;
  this.createState = function () {
    for (var i = [], t = 0; t < n; t++) i[t] = 0;
    return {
      aPoints: i,
      aBar: [0, 0],
      aOff: [0, 0]
    };
  };
  this.copyState = function (n) {
    return {
      aPoints: n.aPoints.slice(),
      aBar: n.aBar.slice(),
      aOff: n.aOff.slice()
    };
  };
  this.getColorAt = function (n, t) {
    var i = n.aPoints[t];
    return i > 0 ? WHITE : i < 0 ? BLACK : null;
  };
  this.getCountAt = function (n, t) {
    return Math.abs(n.aPoints[t]);
  };
  this.isOnBoard = function (t) {
    return t >= 0 && t < n;
  };
  this.getDirection = function (n) {
    return n === WHITE ? 1 : -1;
  };
  this.getFinalCell = function (n) {
    return n === WHITE ? FINAL_CELL_WHITE : FINAL_CELL_BLACK;
  };
  this.getBarPos = function (n) {
    return n === WHITE ? -1 : 24;
  };
  this.isOpenFor = function (n, t, i) {
    return this.getCountAt(n, t) <= 1 || this.getColorAt(n, t) === i;
  };
  this.canBearOff = function (t, i) {
    if (t.aBar[i] > 0) return !1;
    for (var r = 0; r < n; r++) if (this.getColorAt(t, r) === i && (i === WHITE && r < 18 || i === BLACK && r > 5)) return !1;
    return !0;
  };
  this.noPieceBefore = function (t, i, r) {
    var u;
    if (i === WHITE) {
      for (u = 0; u < r; u++) if (this.getColorAt(t, u) === WHITE) return !1;
    } else for (u = n - 1; u > r; u--) if (this.getColorAt(t, u) === BLACK) return !1;
    return !0;
  };
  this.getPieceMoves = function (n, t, i, r) {
    var a = this.getDirection(t),
      f = this.getFinalCell(t),
      v = this.canBearOff(n, t),
      u = [[], [], [], []],
      y = r.dice1,
      k = r.dice2,
      g = r.num_dices,
      p = r.available1,
      w = r.available2,
      b,
      e,
      o,
      d,
      s,
      h,
      c,
      l;
    if (r.doubledice) for (b = [], e = 1; e <= 4; e++) {
      if (e > 1 && (u[0].length < e - 1 || g < e)) break;
      o = i + y * e * a;
      d = i + y * (e - 1) * a;
      this.isOnBoard(o) ? this.isOpenFor(n, o, t) && (b.push(o), u[0].push({
        iFocusTriangle: o,
        num_dice_used: e,
        aMoveTriangle: b.slice()
      })) : v && (o === f || this.noPieceBefore(n, t, d)) && u[3].push({
        iFocusTriangle: f,
        num_dice_used: e,
        aMoveTriangle: b.concat([f])
      });
    } else s = i + y * a, this.isOnBoard(s) ? p && this.isOpenFor(n, s, t) && u[0].push({
      iFocusTriangle: s,
      num_dice_used: 1,
      aMoveTriangle: [s],
      iDiceDisable: 0
    }) : p && v && (s === f || this.noPieceBefore(n, t, i)) && u[3].push({
      iFocusTriangle: f,
      num_dice_used: 1,
      iDiceDisable: 0,
      aMoveTriangle: [f]
    }), h = i + k * a, this.isOnBoard(h) ? w && this.isOpenFor(n, h, t) && u[1].push({
      iFocusTriangle: h,
      num_dice_used: 1,
      aMoveTriangle: [h],
      iDiceDisable: 1
    }) : w && v && (h === f || this.noPieceBefore(n, t, i)) && u[3].push({
      iFocusTriangle: f,
      num_dice_used: 1,
      iDiceDisable: 1,
      aMoveTriangle: [f]
    }), (u[0].length > 0 || u[1].length > 0) && (c = u[0].length > 0 ? u[0][0].iFocusTriangle : u[1][0].iFocusTriangle, u[0].length > 0 && this.getCountAt(n, u[0][0].iFocusTriangle) === 1 && (c = u[0][0].iFocusTriangle), u[1].length > 0 && this.getCountAt(n, u[1][0].iFocusTriangle) === 1 && (c = u[1][0].iFocusTriangle), l = i + (y + k) * a, this.isOnBoard(l) ? p && w && this.isOpenFor(n, l, t) && u[2].push({
      iFocusTriangle: l,
      num_dice_used: 2,
      aMoveTriangle: [c, l],
      iDiceDisable: 2
    }) : p && w && v && (l === f || this.noPieceBefore(n, t, c)) && u[3].push({
      iFocusTriangle: f,
      num_dice_used: 2,
      iDiceDisable: 2,
      aMoveTriangle: [c, f]
    }));
    return u[0].length > 0 || u[1].length > 0 || u[3].length > 0 ? u : null;
  };
  this.applyMove = function (n, t, i, r) {
    var u = this.copyState(n),
      f = t === WHITE ? 1 : -1,
      e = t === WHITE ? BLACK : WHITE;
    return i === this.getBarPos(t) ? u.aBar[t]-- : u.aPoints[i] -= f, r === this.getFinalCell(t) ? u.aOff[t]++ : (this.getColorAt(u, r) === e && (u.aPoints[r] = 0, u.aBar[e]++), u.aPoints[r] += f), u;
  };
  this.getWinner = function (n) {
    return n.aOff[WHITE] === NUM_PIECES ? WHITE : n.aOff[BLACK] === NUM_PIECES ? BLACK : null;
  };
  this.checkRules = function (n, t, i) {
    var f = [],
      e,
      u,
      h,
      o,
      c,
      s,
      r;
    if (!i.available1 || !i.available2 || (e = [i.dice1, i.dice2], e[0] === e[1])) return f;
    for (u = [], r = 0; r < 2; r++) u[r] = this._removeCollisions(this._getMovesList(n, t, e[r]));
    for (r = 0; r < 2; r++) for (h = e[1 - r], o = 0; o < u[r].length; o++) this._checkTheMoveAndMark(u[r][o], n, t, h, RULE_BROKEN_BOTH_DICE);
    if (c = this._countAllowedMoves(u[0]) + this._countAllowedMoves(u[1]), c === 0) {
      this._resetAllRule(u[0]);
      this._resetAllRule(u[1]);
      var l = e[0] < e[1] ? 0 : 1,
        v = 1 - l,
        a = u[l];
      for (r = 0; r < a.length; r++) this._checkTheMoveAndMark(a[r], n, t, e[v], RULE_BROKEN_HIGHER_DICE);
    }
    for (f = u[0].concat(u[1]), f.sort((n, t) => n.src > t.src ? 1 : t.src > n.src ? -1 : 0), s = 0, r = 0; r < f.length; r++) f[r].brokenrule !== RULE_BROKEN_NONE && s++;
    return s === f.length && (f = []), f;
  };
  this.getBrokenRule = function (n, t, i) {
    for (var f = this.getRuleIndexFromPos(t), u = null, r = 0; r < n.length; r++) n[r].src === f && n[r].dst === i && (u = n[r]);
    return u === null ? RULE_BROKEN_NONE : u.brokenrule;
  };
  this.getRuleIndexFromPos = function (n) {
    return n === -1 ? t : n === 24 ? i : n;
  };
  this._getRuleBarIndex = function (n) {
    return n === WHITE ? t : i;
  };
  this._getMovesList = function (i, r, u) {
    var y = this.getDirection(r),
      s = this.getFinalCell(r),
      e = [],
      h,
      o,
      f,
      l,
      v;
    if (i.aBar[r] > 0) e.push(this._getRuleBarIndex(r));else for (f = 0; f < n; f++) this.getColorAt(i, f) === r && e.push(f);
    for (h = this.canBearOff(i, r), o = [], f = 0; f < e.length; f++) {
      var c = e[f],
        p = c < t ? c : this.getBarPos(r),
        a = p + y * u;
      o.push({
        src: c,
        dst: a,
        type: this._getMoveType(i, r, a, s, h),
        brokenrule: RULE_BROKEN_NONE
      });
    }
    return h && e.length > 0 && (l = r === WHITE ? Math.min(...e) : Math.max(...e), v = Math.abs(s - l), u > v && o.push({
      src: l,
      dst: s,
      type: MOVES_TYPE_EXTRABEAR,
      brokenrule: RULE_BROKEN_NONE
    })), o;
  };
  this._getMoveType = function (n, t, i, r, u) {
    if (!this.isOnBoard(i)) return i === r && u ? MOVES_TYPE_BEAR : MOVES_TYPE_COLLISION;
    var f = this.getColorAt(n, i);
    return f === t ? MOVES_TYPE_ADD : f === null ? MOVES_TYPE_FILL : this.getCountAt(n, i) === 1 ? MOVES_TYPE_HIT : MOVES_TYPE_COLLISION;
  };
  this._removeCollisions = function (n) {
    return n.filter(function (n) {
      return n.type !== MOVES_TYPE_COLLISION;
    });
  };
  this._checkTheMoveAndMark = function (n, t, i, r, u) {
    var o = n.src === this._getRuleBarIndex(i) ? this.getBarPos(i) : n.src,
      f = this.applyMove(t, i, o, n.dst),
      e;
    if (f.aOff[i] === NUM_PIECES) {
      n.brokenrule = RULE_BROKEN_NONE;
      return;
    }
    e = this._removeCollisions(this._getMovesList(f, i, r));
    n.brokenrule = e.length > 0 ? RULE_BROKEN_NONE : u;
  };
  this._countAllowedMoves = function (n) {
    for (var i = 0, t = 0; t < n.length; t++) n[t].brokenrule === RULE_BROKEN_NONE && i++;
    return i;
  };
  this._resetAllRule = function (n) {
    for (var t = 0; t < n.length; t++) n[t].brokenrule = RULE_BROKEN_NONE;
  };
}
function CMoveTimeController(n, t, i, r) {
  var h, l, e, o, a, s, v, u, y, f, c, p;
  this._init = function () {
    h = [];
    l = [];
    o = r;
    e = null;
    v = 0;
    u = new createjs.Container();
    u.x = n;
    u.y = t;
    i.addChild(u);
    var s = 300,
      a = 100;
    c = new CTLText(u, 100 - s / 2, 0 - a / 2, s, a, 30, "center", "#fff", PRIMARY_FONT, 1, 2, 2, " ", !0, !0, !1, !1);
    f = new CRadialWipeWidget(0, 0, u);
    p = {
      x: n,
      y: t
    };
  };
  this.unload = function () {
    i.removeChild(u);
    this.stopTimer();
  };
  this.setPos = function (n, t) {
    u.x = n;
    u.y = t;
  };
  this.setScale = function (n) {
    f.setScale(n);
  };
  this.setSpectatorMode = function () {
    f.removeHurryUpMode();
  };
  this.setAlwaysShown = function () {
    f.alwaysShown();
  };
  this.showAttempt = function (n) {
    c.setVisible(n);
  };
  this.addEventListener = function (n, t, i) {
    h[n] = t;
    l[n] = i;
  };
  this.restartEndGameCounter = function () {
    v = 0;
    o = r;
  };
  this.setTime = function (n) {
    o = n;
  };
  this.setHurryUpMode = function (n) {
    f.setHurryUpMode(n);
  };
  this.startTimer = function () {
    if (o !== 0) {
      f.reset();
      a = o;
      s = a;
      var n = v + 1;
      (c.refreshText(n + "/" + NUM_ATTEMPT), e === null) && (e = setInterval(function () {
        y.update();
        u.visible = !0;
      }, FPS_TIME));
    }
  };
  this.stopTimer = function () {
    u.visible = !1;
    c.refreshText("");
    f.reset();
    clearInterval(e);
    e = null;
  };
  this._onTimerEnd = function () {
    var n = ON_TIMER_END;
    h[n] && h[n].call(l[n]);
  };
  this.update = function () {
    s -= s_iTimeElaps;
    s < 0 ? (this.stopTimer(), this._onTimerEnd(), s = 0, clearInterval(e)) : f.update(s, a);
  };
  this._init();
  y = this;
}
function refreshLanguage_multiplayer() {
  void 0;
  switch (s_szCurLang) {
    case LANG_EN:
      TEXT_WAIT_OPPONENT = "WAITING OPPONENT...";
      TEXT_OPPONENT_LEFT = "OPPONENT LEFT!";
      TEXT_ALL_PLAYERS_LEFT = "ALL PLAYERS HAVE LEFT THE MATCH!";
      TEXT_PLAYER_DISCONNECTED = "YOU LEFT!";
      TEXT_REMATCH = "do you want the re-match?";
      TEXT_CONNECTION_LOST = "CONNECTION LOST";
      TEXT_REMATCH_ALERT = "%s WANTS TO PLAY AGAIN";
      TEXT_AFK = "Inactive opponent";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "QUIT";
      TEXT_SYS_UPDATE = "update";
      TEXT_SYS_MATCH_LIST = "Match list";
      TEXT_SYS_QUICKMATCH = "quick match";
      TEXT_SYS_CREATEMATCH = "create match";
      TEXT_SYS_BACK = "back";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "create";
      TEXT_SYS_CLOSE = "close";
      TEXT_SYS_LOADING = "Loading...";
      TEXT_SYS_NAMEROOM = "Name Room";
      TEXT_SYS_CREATEROOM = "Create Room";
      TEXT_SYS_DEFAULTROOMNAME = "%s's room";
      TEXT_SYS_PASSWORD = "Password";
      TEXT_SYS_INFOPASS = "If you don't set a password this room will be public.";
      TEXT_SYS_TYPEROOMPASS = "Type Room Password";
      TEXT_WRONG_PASSWORD = "Wrong Password!";
      TEXT_NETWORK_CONNECTING = "connecting...";
      TEXT_ROOM_IS_FULL = "Room is full!";
      TEXT_FIND_OPPONENT = "finding opponent...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Connect to lobby...";
      TEXT_ROOM_DOESNT_EXIST = "Room doesn't exist!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "waiting for opponent in room: ";
      TEXT_QUIT_FROM_GAME = "%s QUIT THE GAME";
      TEXT_TIME_OVER = "TIME OVER";
      TEXT_OFFER_A_DRAW = "Do you want to offer a draw?";
      TEXT_OFFERED_DRAW = "You have been offered a draw.\nClick the button to accept it";
      TEXT_WAIT_FOR_A_DRAW = "You offered a draw.\nWait for your opponent to accept it";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Players agreed to draw)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Player";
      TEXT_PLAYER_KICKED = "You were kicked from the game due to inactivity.";
      TEXT_YOU_ARE_INACTIVE = "A bot has taken your place because you are not playing.";
      TEXT_MINUTES = "Mins.";
      TEXT_NO_TIME = "No Time";
      TEXT_NO_TIME_MODE = "NO TIME MODE";
      TEXT_TIME_MODE = "TIME MODE";
      TEXT_SYS_FINDROOM = "find a room...";
      TEXT_ROOM_IS_EXPIRED = "Room Expired!";
      TEXT_MATCH_FOUND = "Match found!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "waiting for players in room: ";
      TEXT_PLAY_NOW = "play now";
      TEXT_WAITING_ROOM_MESSAGE = "This room can contain max %d players";
      TEXT_SYS_GAME_TIME = "Match Time";
      TEXT_SYS_CHOOSEGAMETIME = "Choose the playing time per player";
      TEXT_NO_CONNECTION = "NO CONNECTION<br/>(Connect to find someone to play online)";
      TEXT_SOMETHING_WENT_WRONG = "CONNECTION ERROR. SOMETHING WENT WRONG";
      TEXT_INVALID_NAME = "INVALID NAME!";
      TEXT_SYS_INVITE = "INVITE";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "quick match (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Game link copied to your Clipboard. Share it with your friends!";
      TEXT_SYS_QUICKMATCH_NOTIME = "quick match (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Max Players";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Choose the maximum number of players in room.";
      TEXT_EMOTICONS_BLOCK = "BLOCK EMOTICONS";
      TEXT_SYS_CHOOSENICK = "Choose nickname";
      TEXT_SYS_CHOOSE_EMAIL = "Email";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "nickname or email";
      TEXT_HURRY_UP = "HURRY UP!";
      TEXT_SYS_CANCEL = "cancel";
      TEXT_SYS_SAVE = "save";
      TEXT_ROOM_PERMISSION_DENIED = "You are not authorized to enter";
      TEXT_MATCH_IN_PROGRESS = "You have a game in progress.<br><br>Do you want to rejoin?";
      TEXT_LOST_CONNECTION = "Connection lost.<br><br>Reconnect to rejoin.";
      TEXT_RE_ENTER = "REJOIN";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "The player has left the game.<br><br>You can continue playing against a bot or claim the win.";
      TEXT_SYS_WIN = "CLAIM THE WIN";
      TEXT_SYS_CONTINUE = "CONTINUE";
      TEXT_SYS_RETRY = "RETRY";
      TEXT_SYS_EDIT_PROFILE = "Edit Profile";
      TEXT_SYS_WATCH = "watch";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Waiting for the rematch";
      break;
    case LANG_ES:
      TEXT_WAIT_OPPONENT = "ESPERANDO AL OPONENTE";
      TEXT_OPPONENT_LEFT = "EL OPONENTE HA SALIDO";
      TEXT_ALL_PLAYERS_LEFT = "¡TODOS LOS JUGADORES HAN ABANDONADO LA PARTIDA!";
      TEXT_PLAYER_DISCONNECTED = "¡HAS SALIDO!";
      TEXT_REMATCH = "¿Quieres la revancha?";
      TEXT_CONNECTION_LOST = "CONEXIÓN PERDIDA";
      TEXT_REMATCH_ALERT = "%s QUIERE JUGAR OTRA VEZ";
      TEXT_AFK = "Oponente inactivo";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "SALIR";
      TEXT_SYS_UPDATE = "Actualizar";
      TEXT_SYS_MATCH_LIST = "Lista de partidas";
      TEXT_SYS_QUICKMATCH = "Partida Rápida";
      TEXT_SYS_CREATEMATCH = "Crear Partida";
      TEXT_SYS_BACK = "Atrás";
      TEXT_SYS_OK = "Aceptar";
      TEXT_SYS_CREATE = "Crear";
      TEXT_SYS_CLOSE = "Cerrar";
      TEXT_SYS_LOADING = "Cargando...";
      TEXT_SYS_NAMEROOM = "Nombre de sala";
      TEXT_SYS_CREATEROOM = "Crear sala";
      TEXT_SYS_DEFAULTROOMNAME = "sala de %s";
      TEXT_SYS_PASSWORD = "Contraseña";
      TEXT_SYS_INFOPASS = "Esta sala será pública si no pones una contraseña.";
      TEXT_SYS_TYPEROOMPASS = "Escribe la contraseña de la sala";
      TEXT_WRONG_PASSWORD = "Contraseña incorrecta!";
      TEXT_NETWORK_CONNECTING = "conectando...";
      TEXT_ROOM_IS_FULL = "¡La sala está llena!";
      TEXT_FIND_OPPONENT = "buscando oponente...";
      TEXT_VS = "CONTRA";
      TEXT_CONNECT_TO_LOBBY = "Conectando al lobby...";
      TEXT_ROOM_DOESNT_EXIST = "¡La sala no existe!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "esperando a oponente en la sala: ";
      TEXT_QUIT_FROM_GAME = "%s SALIÓ DEL JUEGO";
      TEXT_TIME_OVER = "FIN DEL TIEMPO";
      TEXT_OFFER_A_DRAW = "¿Quieres ofrecer un empate?";
      TEXT_OFFERED_DRAW = "Tu oponente te ofrece tablas.\nHaz clic para aceptarlas.";
      TEXT_WAIT_FOR_A_DRAW = "Has ofrecido tablas.\nEspera a que tu oponente acepte.";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Los jugadores han acordado quedar en tablas)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Jugador";
      TEXT_PLAYER_KICKED = "Se te ha expulsado de la partida por inactividad.";
      TEXT_YOU_ARE_INACTIVE = "Un bot ha ocupado tu lugar porque no estás jugando.";
      TEXT_MINUTES = "Min.";
      TEXT_NO_TIME = "Sin Tiempo";
      TEXT_NO_TIME_MODE = "MODO SIN TIEMPO";
      TEXT_TIME_MODE = "MODO CON TIEMPO";
      TEXT_SYS_FINDROOM = "buscar sala...";
      TEXT_ROOM_IS_EXPIRED = "¡La sala ha caducado!";
      TEXT_MATCH_FOUND = "¡Partida encontrada!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "esperando a jugadores en la sala: ";
      TEXT_PLAY_NOW = "jugar ahora";
      TEXT_WAITING_ROOM_MESSAGE = "En esta sala caben %d jugadores";
      TEXT_SYS_GAME_TIME = "Tiempo de juego";
      TEXT_SYS_CHOOSEGAMETIME = "Elige el tiempo de juego";
      TEXT_NO_CONNECTION = "SIN CONEXIÓN<br/>(Conéctate para jugar en línea con alguien)";
      TEXT_SOMETHING_WENT_WRONG = "ERROR DE CONEXIÓN. ALGO HA IDO MAL";
      TEXT_INVALID_NAME = "¡NOMBRE NO VÁLIDO!";
      TEXT_SYS_INVITE = "INVITAR";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Enlace de partida copiado al portapapeles. ¡Compártelo con tus amigos!";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "Partida Rápida (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "Partida Rápida (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Jugadores máx";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Elige el número máximo de jugadores en la sala.";
      TEXT_EMOTICONS_BLOCK = "BLOQUEAR EMOTICONOS";
      TEXT_SYS_CHOOSENICK = "Elige un apodo";
      TEXT_SYS_CHOOSE_EMAIL = "correo electrónico";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "apodo o correo electrónico";
      TEXT_HURRY_UP = "¡DATE PRISA!";
      TEXT_SYS_CANCEL = "Cancelar";
      TEXT_SYS_SAVE = "Guardar";
      TEXT_ROOM_PERMISSION_DENIED = "No estás autorizado para entrar";
      TEXT_MATCH_IN_PROGRESS = "Tienes una partida en curso.<br><br>¿Quieres volver a entrar?";
      TEXT_LOST_CONNECTION = "Conexión perdida.<br><br>Vuelve a conectarte para entrar de nuevo.";
      TEXT_RE_ENTER = "VOLVER A ENTRAR";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "El jugador ha abandonado la partida.<br><br>Puedes continuar jugando contra un bot o ganar la partida por abandono.";
      TEXT_SYS_WIN = "GANAR LA PARTIDA";
      TEXT_SYS_CONTINUE = "CONTINUAR";
      TEXT_SYS_RETRY = "REINTENTAR";
      TEXT_SYS_EDIT_PROFILE = "Editar perfil";
      TEXT_SYS_WATCH = "Ver";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Esperando la revancha";
      break;
    case LANG_FR:
      TEXT_WAIT_OPPONENT = "ADVERSAIRE EN ATTENTE...";
      TEXT_OPPONENT_LEFT = "L'ADVERSAIRE A QUITTÉ";
      TEXT_ALL_PLAYERS_LEFT = "TOUS LES JOUEURS ONT QUITTÉ LA PARTIE !";
      TEXT_PLAYER_DISCONNECTED = "VOUS AVEZ QUITTÉ";
      TEXT_REMATCH = "voulez-vous jouer à un autre jeu?";
      TEXT_CONNECTION_LOST = "CONNEXION PERDUE";
      TEXT_REMATCH_ALERT = "%s VOUDRAIT REFAIRE UNE PARTIE";
      TEXT_AFK = "Adversaire inactif";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "QUITTER";
      TEXT_SYS_UPDATE = "mettre à jour";
      TEXT_SYS_MATCH_LIST = "Liste des matchs";
      TEXT_SYS_QUICKMATCH = "match rapide";
      TEXT_SYS_CREATEMATCH = "créer un match";
      TEXT_SYS_BACK = "retour";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "Créer";
      TEXT_SYS_CLOSE = "fermer";
      TEXT_SYS_LOADING = "chargement...";
      TEXT_SYS_NAMEROOM = "Nom de la chambre";
      TEXT_SYS_CREATEROOM = "Créer une chambre";
      TEXT_SYS_DEFAULTROOMNAME = "Salle créée par %s";
      TEXT_SYS_PASSWORD = "Mot de Passe";
      TEXT_SYS_INFOPASS = "Si vous ne définissez pas de mot de passe, cette chambre sera publique.";
      TEXT_SYS_TYPEROOMPASS = "Type Mot de passe de la chambre";
      TEXT_WRONG_PASSWORD = "Mauvais mot de passe!";
      TEXT_NETWORK_CONNECTING = "en train de se connecter...";
      TEXT_ROOM_IS_FULL = "La chambre est pleine!";
      TEXT_FIND_OPPONENT = "en train de trouver l'adversaire...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Connectez-vous au lobby...";
      TEXT_ROOM_DOESNT_EXIST = "La chambre n'existe pas!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "en attendant l'adversaire dans la chambre: ";
      TEXT_QUIT_FROM_GAME = "%s A QUITTÉ LA PARTIE";
      TEXT_TIME_OVER = "TEMPS ÉCOULÉ";
      TEXT_OFFER_A_DRAW = "Voulez-vous proposer un match nul ?";
      TEXT_OFFERED_DRAW = "On vous propose la partie nulle.\nCliquez sur le bouton pour accepter.";
      TEXT_WAIT_FOR_A_DRAW = "Vous avez proposé la partie nulle.\nAttendez de voir si votre adversaire accepte.";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Les joueurs se sont entendus pour faire une partie nulle)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Joueur";
      TEXT_PLAYER_KICKED = "Votre inactivité a entraîné votre expulsion de la partie.";
      TEXT_YOU_ARE_INACTIVE = "Un bot a pris ta place parce que tu ne joues pas.";
      TEXT_MINUTES = "Min.";
      TEXT_NO_TIME = "Sans Chrono";
      TEXT_NO_TIME_MODE = "MODE SANS CHRONO";
      TEXT_TIME_MODE = "MODE CHRONO";
      TEXT_SYS_FINDROOM = "trouver une salle...";
      TEXT_ROOM_IS_EXPIRED = "Chambre Expirée";
      TEXT_MATCH_FOUND = "Match trouvée!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "en attendant de les joueurs dans la chambre: ";
      TEXT_PLAY_NOW = "joue maintenant";
      TEXT_WAITING_ROOM_MESSAGE = "Cette salle peut contenir au maximum %d joueurs";
      TEXT_SYS_GAME_TIME = "Durée de la partie";
      TEXT_SYS_CHOOSEGAMETIME = "Sélectionnez le temps de jeu des joueurs";
      TEXT_NO_CONNECTION = "HORS CONNEXION<br/>(Connectez-vous pour trouver des joueurs en ligne)";
      TEXT_SOMETHING_WENT_WRONG = "ERREUR DE CONNEXION. QUELQUE CHOSE A MAL TOURNÉ";
      TEXT_INVALID_NAME = "NOM INVALIDE !";
      TEXT_SYS_INVITE = "INVITER";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Le lien du jeu a été copié dans votre Presse-papiers. Envoyez-le à vos amis !";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "match rapide (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "match rapide (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Joueurs max";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Choisissez le nombre maximum de joueurs dans la salle.";
      TEXT_EMOTICONS_BLOCK = "BLOQUER LES ÉMOJIS";
      TEXT_SYS_CHOOSENICK = "Choisissez un pseudo";
      TEXT_SYS_CHOOSE_EMAIL = "courriel";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "pseudo ou courriel";
      TEXT_HURRY_UP = "DÉPÊCHE-TOI !";
      TEXT_SYS_CANCEL = "Annuler";
      TEXT_SYS_SAVE = "Enregistrer";
      TEXT_ROOM_PERMISSION_DENIED = "Vous n'êtes pas autorisé à entrer";
      TEXT_MATCH_IN_PROGRESS = "Tu as une partie en cours.<br><br>Veux-tu la rejoindre ?";
      TEXT_LOST_CONNECTION = "Connexion perdue.<br><br>Reconnecte-toi pour rejoindre la partie.";
      TEXT_RE_ENTER = "REJOINDRE";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Le joueur a quitté la partie.<br><br>Tu peux continuer à jouer contre un bot ou remporter la partie par forfait.";
      TEXT_SYS_WIN = "GAGNER LA PARTIE";
      TEXT_SYS_CONTINUE = "CONTINUER";
      TEXT_SYS_RETRY = "RÉESSAYER";
      TEXT_SYS_EDIT_PROFILE = "Modifier le profil";
      TEXT_SYS_WATCH = "Regarder";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "En attente de la revanche";
      break;
    case LANG_DE:
      TEXT_WAIT_OPPONENT = "WARTENDER GEGNER...";
      TEXT_OPPONENT_LEFT = "GEGNER IST GEGANGEN";
      TEXT_ALL_PLAYERS_LEFT = "ALLE SPIELER HABEN DAS SPIEL VERLASSEN!";
      TEXT_PLAYER_DISCONNECTED = "DU BIST GEGANGEN!";
      TEXT_REMATCH = "Willst du eine Revanche?";
      TEXT_CONNECTION_LOST = "VERBINDUNG UNTERBROCHEN";
      TEXT_REMATCH_ALERT = "%s MÖCHTE NOCHMAL SPIELEN";
      TEXT_AFK = "Gegner inaktiv";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "BEENDEN";
      TEXT_SYS_UPDATE = "aktualisieren";
      TEXT_SYS_MATCH_LIST = "Match-Liste";
      TEXT_SYS_QUICKMATCH = "Schnelles Match";
      TEXT_SYS_CREATEMATCH = "Match erstellen";
      TEXT_SYS_BACK = "zurück";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "erstellen";
      TEXT_SYS_CLOSE = "schließen";
      TEXT_SYS_LOADING = "Laden...";
      TEXT_SYS_NAMEROOM = "Raum benennen";
      TEXT_SYS_CREATEROOM = "Raum erstellen";
      TEXT_SYS_DEFAULTROOMNAME = "Raum von %s";
      TEXT_SYS_PASSWORD = "Passwort";
      TEXT_SYS_INFOPASS = "Wenn du kein Passwort festlegst, wird dieser Raum öffentlich sein.";
      TEXT_SYS_TYPEROOMPASS = "Raum-Passwort eingeben";
      TEXT_WRONG_PASSWORD = "Falsches Passwort!";
      TEXT_NETWORK_CONNECTING = "verbinden...";
      TEXT_ROOM_IS_FULL = "Raum ist voll!";
      TEXT_FIND_OPPONENT = "Gegner finden ...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Mit Lobby verbinden ...";
      TEXT_ROOM_DOESNT_EXIST = "Raum existiert nicht!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "warte auf Gegner im Raum: ";
      TEXT_QUIT_FROM_GAME = "%s HAT DAS SPIEL BEENDET!";
      TEXT_TIME_OVER = "ZEIT ABGELAUFEN";
      TEXT_OFFER_A_DRAW = "Möchten Sie ein Unentschieden anbieten?";
      TEXT_OFFERED_DRAW = "Du hast ein Unentschieden angeboten bekommen.\nZum Akzeptieren auf den Button klicken.";
      TEXT_WAIT_FOR_A_DRAW = "Du hast ein Unentschieden angeboten.\nWarte, ob dein Gegner akzeptiert.";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Spieler haben sich auf Unentschieden geeinigt.)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Spieler";
      TEXT_PLAYER_KICKED = "Du wurdest wegen Inaktivität aus dem Spiel geworfen.";
      TEXT_YOU_ARE_INACTIVE = "Ein Bot hat deinen Platz übernommen, weil du nicht spielst.";
      TEXT_MINUTES = "Mins.";
      TEXT_NO_TIME = "Mins. 0";
      TEXT_NO_TIME_MODE = "FREIER MODUS";
      TEXT_TIME_MODE = "ZEITMODUS";
      TEXT_SYS_FINDROOM = "Raum finden ...";
      TEXT_ROOM_IS_EXPIRED = "Raum nicht mehr verfügbar!";
      TEXT_MATCH_FOUND = "Match gefunden!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "warte auf Spieler im Raum: ";
      TEXT_PLAY_NOW = "jetzt spielen";
      TEXT_WAITING_ROOM_MESSAGE = "Dieser Raum ist für maximal %d Spieler";
      TEXT_SYS_GAME_TIME = "Spielzeit";
      TEXT_SYS_CHOOSEGAMETIME = "Spielzeit pro Spieler einstellen";
      TEXT_NO_CONNECTION = "KEINE VERBINDUNG<br/>(Bitte Verbindung herstellen, um Online-Spielpartner zu finden)";
      TEXT_SOMETHING_WENT_WRONG = "VERBINDUNGSFEHLER. EIN PROBLEM IST AUFGETRETEN";
      TEXT_INVALID_NAME = "UNGÜLTIGER NAME!";
      TEXT_SYS_INVITE = "EINLADEN";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Spiel-Link wurde in deine Zwischenablage kopiert. Teile ihn mit deinen Freunden!";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "Schnelles Match (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "Schnelles Match (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Maximale Spieleranzahl";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Wähle die maximale Spieleranzahl im Raum.";
      TEXT_EMOTICONS_BLOCK = "EMOTICONS SPERREN";
      TEXT_SYS_CHOOSENICK = "Spitzname wählen";
      TEXT_SYS_CHOOSE_EMAIL = "E-Mail";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "Spitzname oder E-Mail";
      TEXT_HURRY_UP = "BEEIL DICH!";
      TEXT_SYS_CANCEL = "Abbrechen";
      TEXT_SYS_SAVE = "Speichern";
      TEXT_ROOM_PERMISSION_DENIED = "Sie sind nicht berechtigt, einzutreten";
      TEXT_MATCH_IN_PROGRESS = "Du hast ein laufendes Spiel.<br><br>Möchtest du wieder beitreten?";
      TEXT_LOST_CONNECTION = "Verbindung verloren.<br><br>Stelle die Verbindung wieder her, um dem Spiel erneut beizutreten.";
      TEXT_RE_ENTER = "WIEDER BEITRETEN";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Der Spieler hat das Spiel verlassen.<br><br>Du kannst gegen einen Bot weiterspielen oder das Spiel kampflos gewinnen.";
      TEXT_SYS_WIN = "SPIEL GEWINNEN";
      TEXT_SYS_CONTINUE = "WEITERSPIELEN";
      TEXT_SYS_RETRY = "ERNEUT VERSUCHEN";
      TEXT_SYS_EDIT_PROFILE = "Profil bearbeiten";
      TEXT_SYS_WATCH = "Ansehen";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Warten auf die Revanche";
      break;
    case LANG_PT:
      TEXT_WAIT_OPPONENT = "AGUARDANDO ADVERSÁRIO...";
      TEXT_OPPONENT_LEFT = "O ADVERSÁRIO SAIU!";
      TEXT_ALL_PLAYERS_LEFT = "TODOS OS JOGADORES SAÍRAM DA PARTIDA!";
      TEXT_PLAYER_DISCONNECTED = "VOCÊ SAIU!";
      TEXT_REMATCH = "aceita a revanche?";
      TEXT_CONNECTION_LOST = "CONEXÃO PERDIDA";
      TEXT_REMATCH_ALERT = "%s QUER JOGAR OUTRA VEZ";
      TEXT_AFK = "Adversário inativo";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "SAIR";
      TEXT_SYS_UPDATE = "atualizar";
      TEXT_SYS_MATCH_LIST = "Lista de partidas";
      TEXT_SYS_QUICKMATCH = "partida rápida";
      TEXT_SYS_CREATEMATCH = "criar partida";
      TEXT_SYS_BACK = "voltar";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "criar";
      TEXT_SYS_CLOSE = "fechar";
      TEXT_SYS_LOADING = "Carregando...";
      TEXT_SYS_NAMEROOM = "Nomear sala";
      TEXT_SYS_CREATEROOM = "Criar sala";
      TEXT_SYS_DEFAULTROOMNAME = "sala de %s";
      TEXT_SYS_PASSWORD = "Senha";
      TEXT_SYS_INFOPASS = "Se você não definir uma senha, esta sala será pública.";
      TEXT_SYS_TYPEROOMPASS = "Digite a senha da sala";
      TEXT_WRONG_PASSWORD = "Senha incorreta!";
      TEXT_NETWORK_CONNECTING = "conectando...";
      TEXT_ROOM_IS_FULL = "Sala cheia!";
      TEXT_FIND_OPPONENT = "encontrando adversário...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Conectar ao lobby...";
      TEXT_ROOM_DOESNT_EXIST = "A sala não existe!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "esperando por adversário na sala: ";
      TEXT_QUIT_FROM_GAME = "%s SAIR DO JOGO";
      TEXT_TIME_OVER = "TERMINOU O TEMPO";
      TEXT_OFFER_A_DRAW = "Quer oferecer um empate?";
      TEXT_OFFERED_DRAW = "Foi proposto um empate.\nClica no botão para aceitar";
      TEXT_WAIT_FOR_A_DRAW = "Propuseste um empate.\nEspera que o adversário aceite";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Os jogadores aceitaram um empate)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Jogador";
      TEXT_PLAYER_KICKED = "Foste expulso do jogo devido a inatividade.";
      TEXT_YOU_ARE_INACTIVE = "Um bot ocupou o teu lugar porque não estás a jogar.";
      TEXT_MINUTES = "Min.";
      TEXT_NO_TIME = "Sem Tempo";
      TEXT_NO_TIME_MODE = "MODO SEM TEMPO";
      TEXT_TIME_MODE = "MODO COM TEMPO";
      TEXT_SYS_FINDROOM = "encontrar uma sala...";
      TEXT_ROOM_IS_EXPIRED = "A sala expirou!";
      TEXT_MATCH_FOUND = "Partida encontrada!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "esperando por jogadores na sala: ";
      TEXT_PLAY_NOW = "jogar agora";
      TEXT_WAITING_ROOM_MESSAGE = "Esta sala pode conter até %d jogadores";
      TEXT_SYS_GAME_TIME = "Duração da partida";
      TEXT_SYS_CHOOSEGAMETIME = "Escolhe o tempo de jogo por jogador";
      TEXT_NO_CONNECTION = "SEM LIGAÇÃO<br/>(Liga-te para encontrares um adversário online)";
      TEXT_SOMETHING_WENT_WRONG = "ERRO DE CONEXÃO. ALGO DEU ERRADO.";
      TEXT_INVALID_NAME = "NOME INVÁLIDO!";
      TEXT_SYS_INVITE = "CONVIDAR";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Ligação do jogo copiada para a tua área de transferências. Partilha-a com os amigos!";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "Partida Rápida (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "Partida Rápida (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Máx. de jogadores";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Escolha o número máximo de jogadores na sala.";
      TEXT_EMOTICONS_BLOCK = "BLOQUEAR EMOTICONS";
      TEXT_SYS_CHOOSENICK = "Escolha um apelido";
      TEXT_SYS_CHOOSE_EMAIL = "Email";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "Apelido ou Email";
      TEXT_HURRY_UP = "ANDAMENTO!";
      TEXT_SYS_CANCEL = "Cancelar";
      TEXT_SYS_SAVE = "Salvar";
      TEXT_ROOM_PERMISSION_DENIED = "Você não está autorizado a entrar";
      TEXT_MATCH_IN_PROGRESS = "Tens uma partida em curso.<br><br>Queres voltar a entrar?";
      TEXT_LOST_CONNECTION = "Ligação perdida.<br><br>Volta a ligar-te para entrar novamente.";
      TEXT_RE_ENTER = "VOLTAR A ENTRAR";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "O jogador saiu da partida.<br><br>Podes continuar a jogar contra um bot ou vencer a partida por desistência.";
      TEXT_SYS_WIN = "VENCER A PARTIDA";
      TEXT_SYS_CONTINUE = "CONTINUAR";
      TEXT_SYS_RETRY = "TENTAR NOVAMENTE";
      TEXT_SYS_EDIT_PROFILE = "Editar perfil";
      TEXT_SYS_WATCH = "Assistir";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Aguardando a revanche";
      break;
    case LANG_IT:
      TEXT_WAIT_OPPONENT = "IN ATTESA DELL'AVVERSARIO...";
      TEXT_OPPONENT_LEFT = "L'AVVERSARIO HA LASCIATO IL GIOCO!";
      TEXT_ALL_PLAYERS_LEFT = "TUTTI I GIOCATORI HANNO LASCIATO LA PARTITA!";
      TEXT_PLAYER_DISCONNECTED = "TU HAI LASCIATO IL GIOCO!";
      TEXT_REMATCH = "vuoi la rivincita?";
      TEXT_CONNECTION_LOST = "CONNESSIONE PERSA";
      TEXT_REMATCH_ALERT = "%s VUOLE GIOCARE DI NUOVO";
      TEXT_AFK = "Avversario inattivo";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "ESCI";
      TEXT_SYS_UPDATE = "aggiorna";
      TEXT_SYS_MATCH_LIST = "Lista dei Match";
      TEXT_SYS_QUICKMATCH = "match veloce";
      TEXT_SYS_CREATEMATCH = "crea un match";
      TEXT_SYS_BACK = "indietro";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "crea";
      TEXT_SYS_CLOSE = "chiudi";
      TEXT_SYS_LOADING = "Caricamento...";
      TEXT_SYS_NAMEROOM = "Nome della Stanza";
      TEXT_SYS_CREATEROOM = "Crea Stanza";
      TEXT_SYS_DEFAULTROOMNAME = "Stanza creata da %s";
      TEXT_SYS_PASSWORD = "Password";
      TEXT_SYS_INFOPASS = "Se non imposti una password la stanza sarà pubblica.";
      TEXT_SYS_TYPEROOMPASS = "Scrivi la password della stanza";
      TEXT_WRONG_PASSWORD = "Password Errata!";
      TEXT_NETWORK_CONNECTING = "connessione...";
      TEXT_ROOM_IS_FULL = "La stanza è piena!";
      TEXT_FIND_OPPONENT = "ricerca avversario...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "connetti alla lobby...";
      TEXT_ROOM_DOESNT_EXIST = "La stanza non esiste!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "in attesa dell'avversario nella stanza: ";
      TEXT_QUIT_FROM_GAME = "%s HA LASCIATO LA PARTITA";
      TEXT_TIME_OVER = "TEMPO SCADUTO";
      TEXT_OFFER_A_DRAW = "Vuoi offrire un pareggio?";
      TEXT_OFFERED_DRAW = "Ti hanno offerto un pareggio.\nClicca il tasto per accettarlo";
      TEXT_WAIT_FOR_A_DRAW = "Hai offerto un pareggio.\nIn attesa che l'avversario lo accetti";
      TEXT_PLAYER_AGREED_TO_DRAW = "(I giocatori si sono accordati per un pareggio)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Giocatore";
      TEXT_PLAYER_KICKED = "Sei uscito dal gioco per inattività.";
      TEXT_YOU_ARE_INACTIVE = "Un bot ha preso il tuo posto perché non stai giocando.";
      TEXT_MINUTES = "Min.";
      TEXT_NO_TIME = "Senza Tempo";
      TEXT_NO_TIME_MODE = "MODALITA' SENZA TEMPO";
      TEXT_TIME_MODE = "MODALITA' CON TEMPO";
      TEXT_SYS_FINDROOM = "trova una stanza...";
      TEXT_ROOM_IS_EXPIRED = "La stanza è scaduta!";
      TEXT_MATCH_FOUND = "Match trovato!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "in attesa dei giocatori nella stanza: ";
      TEXT_PLAY_NOW = "gioca adesso";
      TEXT_WAITING_ROOM_MESSAGE = "Questa stanza può contenere al massimo %d giocatori";
      TEXT_SYS_GAME_TIME = "Tempo Partita";
      TEXT_SYS_CHOOSEGAMETIME = "Scegli il tempo di gioco per giocatore";
      TEXT_NO_CONNECTION = "NESSUNA CONNESSIONE<br/>(Connettiti per trovare qualcuno con cui giocare online)";
      TEXT_SOMETHING_WENT_WRONG = "ERRORE DI CONNESSIONE. QUALCOSA E' ANDATO STORTO";
      TEXT_INVALID_NAME = "NOME NON VALIDO!";
      TEXT_SYS_INVITE = "INVITA";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Link di gioco copiato tra i tuoi appunti. Condividilo con i tuoi amici!";
      TEXT_SYS_MINUTES = "%s min.";
      TEXT_SYS_QUICKMATCH_MINUTE = "partita veloce (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "partita veloce (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Giocatori max";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Scegli il numero massimo di giocatori nella stanza.";
      TEXT_EMOTICONS_BLOCK = "BLOCCA EMOTICON";
      TEXT_SYS_CHOOSENICK = "Scegli un nickname";
      TEXT_SYS_CHOOSE_EMAIL = "Email";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "nickname o email";
      TEXT_HURRY_UP = "SBRIGATI!";
      TEXT_SYS_CANCEL = "Annulla";
      TEXT_SYS_SAVE = "Salva";
      TEXT_ROOM_PERMISSION_DENIED = "Non sei autorizzato ad entrare";
      TEXT_MATCH_IN_PROGRESS = "Hai una partita in corso.<br><br>Vuoi rientrare?";
      TEXT_LOST_CONNECTION = "Hai perso la connessione.<br><br>Ricollegati per rientrare.";
      TEXT_RE_ENTER = "RIENTRA";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Il giocatore è uscito dalla partita.<br><br>Puoi scegliere di continuare la partita contro un bot oppure vincere a tavolino.";
      TEXT_SYS_WIN = "VINCI LA PARTITA";
      TEXT_SYS_CONTINUE = "CONTINUA";
      TEXT_SYS_RETRY = "RIPROVA";
      TEXT_SYS_EDIT_PROFILE = "Modifica profilo";
      TEXT_SYS_WATCH = "Guarda";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "In attesa della rivincita";
      break;
    case LANG_RU:
      TEXT_WAIT_OPPONENT = "ОЖИДАНИЕ ПРОТИВНИКА...";
      TEXT_OPPONENT_LEFT = "ПРОТИВНИК ВЫШЕЛ!";
      TEXT_ALL_PLAYERS_LEFT = "ВСЕ ИГРОКИ ПОКИНУЛИ МАТЧ!";
      TEXT_PLAYER_DISCONNECTED = "ВЫ ВЫШЛИ!";
      TEXT_REMATCH = "Сыграть заново?";
      TEXT_CONNECTION_LOST = "Соединение потеряно";
      TEXT_REMATCH_ALERT = "%s ХОЧЕТ СЫГРАТЬ ЕЩЕ РАЗ";
      TEXT_AFK = "Соперник неактивен";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "ВЫЙТИ";
      TEXT_SYS_UPDATE = "обновлять";
      TEXT_SYS_MATCH_LIST = "игру список";
      TEXT_SYS_QUICKMATCH = "быстрая игра";
      TEXT_SYS_CREATEMATCH = "создать игру";
      TEXT_SYS_BACK = "назад";
      TEXT_SYS_OK = "ok";
      TEXT_SYS_CREATE = "создать";
      TEXT_SYS_CLOSE = "закрыть";
      TEXT_SYS_LOADING = "Загрузка...";
      TEXT_SYS_NAMEROOM = "Назовите игру";
      TEXT_SYS_CREATEROOM = "Создать игру";
      TEXT_SYS_DEFAULTROOMNAME = "Комната игрока %s";
      TEXT_SYS_PASSWORD = "Пароль";
      TEXT_SYS_INFOPASS = "Если вы не установите пароль, эта игра будет общедоступной.";
      TEXT_SYS_TYPEROOMPASS = "Введите пароль для игры";
      TEXT_WRONG_PASSWORD = "Неверный пароль!";
      TEXT_NETWORK_CONNECTING = "подключение...";
      TEXT_ROOM_IS_FULL = "Нет места!";
      TEXT_FIND_OPPONENT = "Поиск противника...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Подключение...";
      TEXT_ROOM_DOESNT_EXIST = "Такой комнаты нет!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "Ожидание противника в комнате: ";
      TEXT_QUIT_FROM_GAME = "%s ВЫХОДИТ ИЗ ИГРЫ";
      TEXT_TIME_OVER = "ВРЕМЯ ИСТЕКЛО";
      TEXT_OFFER_A_DRAW = "Хотите предложить ничью?";
      TEXT_OFFERED_DRAW = "Вам предложили ничью.\nНажмите, чтобы принять предложение.";
      TEXT_WAIT_FOR_A_DRAW = "Вы предложили ничью.\nПодождите решения соперника.";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Игроки выбрали ничью)";
      TEXT_CPU = "ИИ";
      TEXT_PLAYER = "Игрок";
      TEXT_PLAYER_KICKED = "Вас исключили из игры за неактивность.";
      TEXT_YOU_ARE_INACTIVE = "Бот занял твоё место, потому что ты не играешь.";
      TEXT_MINUTES = "Мин..";
      TEXT_NO_TIME = "Без Таймера";
      TEXT_NO_TIME_MODE = "РЕЖИМ БЕЗ ТАЙМЕРА";
      TEXT_TIME_MODE = "РЕЖИМ С ТАЙМЕРОМ";
      TEXT_SYS_FINDROOM = "найти комнату...";
      TEXT_ROOM_IS_EXPIRED = "Комната закрылась!";
      TEXT_MATCH_FOUND = "Игра найдена!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "Ожидание игроков в комнате: ";
      TEXT_PLAY_NOW = "Играть";
      TEXT_WAITING_ROOM_MESSAGE = "В этой комнате может находиться не более %d игроков.";
      TEXT_SYS_GAME_TIME = "Время матча";
      TEXT_SYS_CHOOSEGAMETIME = "Выберите лимит времени для игрока";
      TEXT_NO_CONNECTION = "НЕТ СОЕДИНЕНИЯ.<br/>Подключитесь, чтобы найти других игроков и начать игру.";
      TEXT_SOMETHING_WENT_WRONG = "CONNECTION ERROR. SOMETHING WENT WRONG";
      TEXT_INVALID_NAME = "ОШИБКА ИМЕНИ!";
      TEXT_SYS_INVITE = "ПРИГЛАСИТЬ";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Ссылка на игру скопирована в буфер обмена. Поделитесь ей со своими друзьями!";
      TEXT_SYS_MINUTES = "%s мин.";
      TEXT_SYS_QUICKMATCH_MINUTE = "быстрая игра (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_QUICKMATCH_NOTIME = "быстрая игра (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Макс. игроков";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Выберите максимальное количество игроков в комнате.";
      TEXT_EMOTICONS_BLOCK = "ЗАБЛОКИРОВАТЬ СМАЙЛИКИ";
      TEXT_SYS_CHOOSENICK = "Выберите никнейм";
      TEXT_SYS_CHOOSE_EMAIL = "электронная почта";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "ник или адрес электронной почты";
      TEXT_HURRY_UP = "ПОТОРОПИСЬ!";
      TEXT_SYS_CANCEL = "Отмена";
      TEXT_SYS_SAVE = "Сохранить";
      TEXT_ROOM_PERMISSION_DENIED = "У вас нет разрешения на вход";
      TEXT_MATCH_IN_PROGRESS = "У тебя есть незавершённая игра.<br><br>Хочешь вернуться?";
      TEXT_LOST_CONNECTION = "Соединение потеряно.<br><br>Подключись снова, чтобы вернуться в игру.";
      TEXT_RE_ENTER = "ВЕРНУТЬСЯ";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Игрок покинул игру.<br><br>Ты можешь продолжить игру против бота или получить победу автоматически.";
      TEXT_SYS_WIN = "ПОЛУЧИТЬ ПОБЕДУ";
      TEXT_SYS_CONTINUE = "ПРОДОЛЖИТЬ";
      TEXT_SYS_RETRY = "ПОВТОРИТЬ";
      TEXT_SYS_EDIT_PROFILE = "Редактировать профиль";
      TEXT_SYS_WATCH = "Смотреть";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Ожидание реванша";
      break;
    case LANG_TR:
      TEXT_WAIT_OPPONENT = "RAKİP BEKLENİYOR...";
      TEXT_OPPONENT_LEFT = "RAKİP TERK ETTİ!";
      TEXT_ALL_PLAYERS_LEFT = "TÜM OYUNCULAR MAÇTAN AYRILDI!";
      TEXT_PLAYER_DISCONNECTED = "TERK ETTİN!";
      TEXT_REMATCH = "Yeniden maç yapmak ister misin?";
      TEXT_CONNECTION_LOST = "BAĞLANTI YOK";
      TEXT_REMATCH_ALERT = "%s TEKRAR OYNAMAK İSTİYOR";
      TEXT_AFK = "Rakip etkin değil";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "ÇIK";
      TEXT_SYS_UPDATE = "güncelle";
      TEXT_SYS_MATCH_LIST = "Maç listesi";
      TEXT_SYS_QUICKMATCH = "hızlı maç";
      TEXT_SYS_CREATEMATCH = "eşleşme oluştur";
      TEXT_SYS_BACK = "geri";
      TEXT_SYS_OK = "tamam";
      TEXT_SYS_CREATE = "oluştur";
      TEXT_SYS_CLOSE = "kapat";
      TEXT_SYS_LOADING = "Yükleniyor";
      TEXT_SYS_NAMEROOM = "Odaya ad ver";
      TEXT_SYS_CREATEROOM = "Oda oluştur";
      TEXT_SYS_DEFAULTROOMNAME = "%s in odası";
      TEXT_SYS_PASSWORD = "Şifre";
      TEXT_SYS_INFOPASS = "Şifre girmezsen oda herkese açık olacak.";
      TEXT_SYS_TYPEROOMPASS = "Oda Şifresini Yaz";
      TEXT_WRONG_PASSWORD = "Yanlış Şifre!";
      TEXT_NETWORK_CONNECTING = "BAĞLANIYOR...";
      TEXT_ROOM_IS_FULL = "Oda dolu!";
      TEXT_FIND_OPPONENT = "rakip bulunuyor...";
      TEXT_VS = "VE";
      TEXT_CONNECT_TO_LOBBY = "Lobiye bağlan...";
      TEXT_ROOM_DOESNT_EXIST = "Oda yok!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "odada rakip bekleniyor: ";
      TEXT_QUIT_FROM_GAME = "%s OYUNDAN ÇIK";
      TEXT_TIME_OVER = "SÜRE BİTTİ";
      TEXT_OFFER_A_DRAW = "Beraberlik teklif etmek ister misin?";
      TEXT_OFFERED_DRAW = "Beraberlik teklif edildi.\nKabul etmek için butona tıkla";
      TEXT_WAIT_FOR_A_DRAW = "Beraberlik teklif ettin.\nRakibinin kabul etmesini bekle";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Oyuncular beraberliği kabul etti)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Oyuncu";
      TEXT_PLAYER_KICKED = "Eylemsizlik yüzünden oyundan atıldın.";
      TEXT_YOU_ARE_INACTIVE = "Oynamadığın için bir bot senin yerini aldı.";
      TEXT_MINUTES = "Dakika";
      TEXT_NO_TIME = "Süre Yok";
      TEXT_NO_TIME_MODE = "SÜRE MODU YOK";
      TEXT_TIME_MODE = "SÜRE MODU";
      TEXT_SYS_FINDROOM = "oda bul...";
      TEXT_ROOM_IS_EXPIRED = "Odanın Süresi Doldu!";
      TEXT_MATCH_FOUND = "Eşleşme bulundu!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "odada oyuncular bekleniyor: ";
      TEXT_PLAY_NOW = "şimdi oyna";
      TEXT_WAITING_ROOM_MESSAGE = "Bu oda en fazla %d oyuncu alabilir";
      TEXT_SYS_GAME_TIME = "Maç Zamanı";
      TEXT_SYS_CHOOSEGAMETIME = "Oyuncu başına oynama süresini seç";
      TEXT_NO_CONNECTION = "BAĞLANTI YOK<br/>(Çevrimiçi oynayacak birini bulmak için bağlan)";
      TEXT_SOMETHING_WENT_WRONG = "BAĞLANTI HATASI. HATA OLUŞTU";
      TEXT_INVALID_NAME = "GEÇERSİZ İSİM!";
      TEXT_SYS_INVITE = "DAVET ET";
      TEXT_SYS_MINUTES = "%s dk.";
      TEXT_SYS_QUICKMATCH_MINUTE = "hızlı maç (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Oyun bağlantısı panoya kopyalandı. Arkadaşlarınla paylaş!";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Maksimum Oyuncu";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Odadaki maksimum oyuncu sayısını seçin.";
      TEXT_EMOTICONS_BLOCK = "EMOJİLERİ ENGELLE";
      TEXT_SYS_CHOOSENICK = "Kullanıcı adı seç";
      TEXT_SYS_CHOOSE_EMAIL = "e-posta";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "kullanıcı adı veya e-posta";
      TEXT_HURRY_UP = "ACELE ET!";
      TEXT_SYS_CANCEL = "İptal";
      TEXT_SYS_SAVE = "Kaydet";
      TEXT_MATCH_IN_PROGRESS = "Devam eden bir oyunun var.<br><br>Yeniden katılmak ister misin?";
      TEXT_LOST_CONNECTION = "Bağlantı kesildi.<br><br>Oyuna dönmek için yeniden bağlan.";
      TEXT_RE_ENTER = "YENİDEN KATIL";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Oyuncu oyundan ayrıldı.<br><br>Bir bota karşı oynamaya devam edebilir veya hükmen kazanabilirsin.";
      TEXT_SYS_WIN = "HÜKMEN KAZAN";
      TEXT_SYS_CONTINUE = "DEVAM ET";
      TEXT_SYS_RETRY = "TEKRAR DENE";
      TEXT_SYS_EDIT_PROFILE = "Profili Düzenle";
      TEXT_SYS_WATCH = "İzle";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Rövanş bekleniyor";
      TEXT_ROOM_PERMISSION_DENIED = "Giriş izniniz yok";
      break;
    case LANG_AR:
      TEXT_WAIT_OPPONENT = "بانتظار المنافس";
      TEXT_OPPONENT_LEFT = "المنافس غادر";
      TEXT_ALL_PLAYERS_LEFT = "غَادَرَ جَمِيعُ اللَّاعِبِينَ المُبَارَاة!";
      TEXT_PLAYER_DISCONNECTED = "لقد غادرت!";
      TEXT_REMATCH = "هل ترغب في إعادة المباراة؟";
      TEXT_CONNECTION_LOST = "لا يوجد اتصال بالإنترنت";
      TEXT_REMATCH_ALERT = "%s يرغب اللاعب S في اللعب مرة أخرى";
      TEXT_AFK = "الخصم غير نشط";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "الخروج";
      TEXT_SYS_UPDATE = "تحديث";
      TEXT_SYS_MATCH_LIST = "قائمة المباريات";
      TEXT_SYS_QUICKMATCH = "مباراة سريعة";
      TEXT_SYS_CREATEMATCH = "إنشاء مباراة";
      TEXT_SYS_BACK = "عودة";
      TEXT_SYS_OK = "موافق";
      TEXT_SYS_CREATE = "إنشاء";
      TEXT_SYS_CLOSE = "إغلاق";
      TEXT_SYS_LOADING = "جارِ التحميل";
      TEXT_SYS_NAMEROOM = "تسمية الغرفة";
      TEXT_SYS_CREATEROOM = "إنشاء غرفة";
      TEXT_SYS_DEFAULTROOMNAME = "%sغرفة ";
      TEXT_SYS_PASSWORD = "كلمة المرور";
      TEXT_SYS_INFOPASS = "إذا لم تقم بتعيين كلمة المرور، فستكون الغرفة متاحة للجميع.";
      TEXT_SYS_TYPEROOMPASS = "اكتب كلمة المرور المخصصة للغرفة";
      TEXT_WRONG_PASSWORD = "كلمة مرور خاطئة!";
      TEXT_NETWORK_CONNECTING = "جارٍ الاتصال...";
      TEXT_ROOM_IS_FULL = "الغرفة ممتلئة!";
      TEXT_FIND_OPPONENT = "جاري البحث عن منافس";
      TEXT_VS = "اللعب ضد";
      TEXT_CONNECT_TO_LOBBY = "الاتصال بالصفحة الرئيسية...";
      TEXT_ROOM_DOESNT_EXIST = "الغرفة غير موجودة!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "انتظار دخول الخصم إلى الغرفة: ";
      TEXT_QUIT_FROM_GAME = "%s الخروج من اللعبة";
      TEXT_TIME_OVER = "انتهى الوقت";
      TEXT_OFFER_A_DRAW = "هل تريد تقديم تعادل؟";
      TEXT_OFFERED_DRAW = "إذا عُرض عليك التعادل في المباراة.\nانقر فوق الزر للموافقة على التعادل";
      TEXT_WAIT_FOR_A_DRAW = "لقد عرضت التعادل في المباراة.\nانتظر حتى يوافق خصمك";
      TEXT_PLAYER_AGREED_TO_DRAW = "(وافق اللاعبان على نتيجة التعادل)";
      TEXT_CPU = "الذكاء الاصطناعي";
      TEXT_PLAYER = "لاعب";
      TEXT_PLAYER_KICKED = "تم طردك من اللعبة بسبب عدم وجود نشاط لك.";
      TEXT_YOU_ARE_INACTIVE = "حلّ روبوت مكانك لأنك لا تلعب.";
      TEXT_MINUTES = "دقائق";
      TEXT_NO_TIME = "لا يوجد وقت";
      TEXT_NO_TIME_MODE = "وضع لا يوجد وقت";
      TEXT_TIME_MODE = "وضع يوجد وقت";
      TEXT_SYS_FINDROOM = "جارٍ البحث عن غرفة...";
      TEXT_ROOM_IS_EXPIRED = "انتهت صلاحية الغرفة!";
      TEXT_MATCH_FOUND = "تم العثور على تطابق!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "انتظار دخول المنافس إلى الغرفة";
      TEXT_PLAY_NOW = "ابدأ اللعب الآن";
      TEXT_WAITING_ROOM_MESSAGE = "يمكن أن تحتوي الغرفة على %d من اللاعبين بحدٍ أقصي";
      TEXT_SYS_GAME_TIME = "وقت المباراة";
      TEXT_SYS_CHOOSEGAMETIME = "اختر وقت اللعب المخصص لكل لاعب";
      TEXT_NO_CONNECTION = "لا يوجد اتصال بالإنترنت<br/>(اتصل بالإنترنت للعثور على شخص ما للعب معه عبر الإنترنت)";
      TEXT_SOMETHING_WENT_WRONG = "خطأ في الاتصال. حدث خطأٌ ما";
      TEXT_INVALID_NAME = "اسم غير صالح!";
      TEXT_SYS_INVITE = "إرسال دعوة";
      TEXT_SYS_MINUTES = "%s دقيقة.";
      TEXT_SYS_QUICKMATCH_MINUTE = "مباراة سريعة (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "نسخ رابط اللعبة إلى الحافظة. شارك اللعبة مع أصدقائك!";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "الحد الأقصى للاعبين";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "اختر الحد الأقصى لعدد اللاعبين في الغرفة.";
      TEXT_EMOTICONS_BLOCK = "حظر الرموز التعبيرية";
      TEXT_SYS_CHOOSENICK = "اختر اسمًا مستعارًا";
      TEXT_SYS_CHOOSE_EMAIL = "البريد الإلكتروني";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "اسم مستعار أو بريد إلكتروني";
      TEXT_HURRY_UP = "أَسْرِع!";
      TEXT_SYS_CANCEL = "إلغاء";
      TEXT_SYS_SAVE = "حفظ";
      TEXT_ROOM_PERMISSION_DENIED = "غير مصرح لك بالدخول";
      TEXT_MATCH_IN_PROGRESS = "لديك مباراة جارية.<br><br>هل تريد العودة إليها؟";
      TEXT_LOST_CONNECTION = "انقطع الاتصال.<br><br>أعد الاتصال للعودة إلى المباراة.";
      TEXT_RE_ENTER = "العودة";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "غادر اللاعب المباراة.<br><br>يمكنك متابعة اللعب ضد روبوت أو الفوز بالمباراة تلقائيًا.";
      TEXT_SYS_WIN = "الفوز بالمباراة";
      TEXT_SYS_CONTINUE = "المتابعة";
      TEXT_SYS_RETRY = "إعادة المحاولة";
      TEXT_SYS_EDIT_PROFILE = "تعديل الملف الشخصي";
      TEXT_SYS_WATCH = "مشاهدة";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "في انتظار إعادة المباراة";
      break;
    case LANG_HI:
      TEXT_WAIT_OPPONENT = "विरोधी का इंतज़ार कर रहे हैं...";
      TEXT_OPPONENT_LEFT = "विरोधी ने खेल छोड़ दिया!";
      TEXT_ALL_PLAYERS_LEFT = "सभी खिलाड़ियों ने मैच छोड़ दिया है!";
      TEXT_PLAYER_DISCONNECTED = "आप ने खेल छोड़ दिया है!";
      TEXT_REMATCH = "क्या आप फिर से मैच खेलना चाहते हैं?";
      TEXT_CONNECTION_LOST = "कोई कनेक्शन नहीं";
      TEXT_REMATCH_ALERT = "%s फिर से खेलना चाहता है";
      TEXT_AFK = "प्रतिद्वंद्वी निष्क्रिय है";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "बाहर जाएँ";
      TEXT_SYS_UPDATE = "अपडेट करें";
      TEXT_SYS_MATCH_LIST = "मैच सूची";
      TEXT_SYS_QUICKMATCH = "क्विक मैच";
      TEXT_SYS_CREATEMATCH = "मैच बनाएं";
      TEXT_SYS_BACK = "पीछे";
      TEXT_SYS_OK = "ठीक है";
      TEXT_SYS_CREATE = "बनाएं";
      TEXT_SYS_CLOSE = "बंद करें";
      TEXT_SYS_LOADING = "लोड हो रहा है";
      TEXT_SYS_NAMEROOM = "रूम को नाम दें";
      TEXT_SYS_CREATEROOM = "रूम बनाएं";
      TEXT_SYS_DEFAULTROOMNAME = "%s का रूम";
      TEXT_SYS_PASSWORD = "पासवर्ड";
      TEXT_SYS_INFOPASS = "अगर आप पासवर्ड सेट नहीं करते हैं तो यह रूम पब्लिक हो जाएगा.";
      TEXT_SYS_TYPEROOMPASS = "रूम पासवर्ड टाइप करें";
      TEXT_WRONG_PASSWORD = "गलत पासवर्ड!";
      TEXT_NETWORK_CONNECTING = "कनेक्ट हो रहा है...";
      TEXT_ROOM_IS_FULL = "रूम पूरा भर गया है!";
      TEXT_FIND_OPPONENT = "विरोधी ढूंढा जा रहा है...";
      TEXT_VS = "बनाम";
      TEXT_CONNECT_TO_LOBBY = "लॉबी से कनेक्ट करें...";
      TEXT_ROOM_DOESNT_EXIST = "रूम मौजूद नहीं है!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "रूम में विरोधी का इंतज़ार हो रहा है: ";
      TEXT_QUIT_FROM_GAME = "%s गेम छोड़ें";
      TEXT_TIME_OVER = "समय समाप्त";
      TEXT_OFFER_A_DRAW = "क्या आप ड्रॉ प्रस्ताव देना चाहते हैं?";
      TEXT_OFFERED_DRAW = "आपको एक ड्रॉ की पेशकश की गई है.\nइसे स्वीकार करने के लिए बटन पर क्लिक करें";
      TEXT_WAIT_FOR_A_DRAW = "आपने एक ड्रॉ की पेशकश की.\nअपने विरोधी खिलाड़ी के स्वीकार करने का इंतज़ार करें";
      TEXT_PLAYER_AGREED_TO_DRAW = "(खिलाड़ी ड्रॉ के लिए सहमत हुए)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "खिलाड़ी";
      TEXT_PLAYER_KICKED = "निष्क्रियता के कारण आपको गेम से निकाल दिया गया था.";
      TEXT_YOU_ARE_INACTIVE = "आपके न खेलने के कारण एक बॉट ने आपकी जगह ले ली है।";
      TEXT_MINUTES = "मिनट";
      TEXT_NO_TIME = "समय नहीं है";
      TEXT_NO_TIME_MODE = "नो टाइम मोड";
      TEXT_TIME_MODE = "टाइम मोड";
      TEXT_SYS_FINDROOM = "एक रूम खोजें...";
      TEXT_ROOM_IS_EXPIRED = "रूम की अवधि समाप्त हो गई!";
      TEXT_MATCH_FOUND = "मैच मिला!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "रूम में खिलाड़ियों का इंतज़ार हो रहा है: ";
      TEXT_PLAY_NOW = "अभी खेलें";
      TEXT_WAITING_ROOM_MESSAGE = "“इस रूम में मैक्स %d खिलाड़ी हो सकते हैं";
      TEXT_SYS_GAME_TIME = "मैच टाइम";
      TEXT_SYS_CHOOSEGAMETIME = "हर खिलाड़ी के लिए खेलने का समय चुनें";
      TEXT_NO_CONNECTION = "कोई कनेक्शन नहीं<br/>(ऑनलाइन खेलने के लिए किसी को खोजने के लिए कनेक्ट करें)";
      TEXT_SOMETHING_WENT_WRONG = "कनेक्शन में गड़बड़ी. कुछ गलत हो गया";
      TEXT_INVALID_NAME = "अमान्य नाम!";
      TEXT_SYS_INVITE = "इनवाइट करें";
      TEXT_SYS_MINUTES = "%s मिनट.";
      TEXT_SYS_QUICKMATCH_MINUTE = "क्विक मैच (“+टेक्स्ट_SYS_मिनट+”)";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "गेम लिंक आपके क्लिपबोर्ड पर कॉपी किया गया. इसे अपने दोस्तों के साथ शेयर करें!";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "अधिकतम खिलाड़ी";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "कमरे में अधिकतम खिलाड़ियों की संख्या चुनें।";
      TEXT_EMOTICONS_BLOCK = "इमोटिकॉन्स को ब्लॉक करें";
      TEXT_SYS_CHOOSENICK = "उपनाम चुनें";
      TEXT_SYS_CHOOSE_EMAIL = "ईमेल";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "उपनाम या ईमेल";
      TEXT_HURRY_UP = "जल्दी करो!";
      TEXT_SYS_CANCEL = "रद्द करें";
      TEXT_SYS_SAVE = "सहेजें";
      TEXT_ROOM_PERMISSION_DENIED = "आपको प्रवेश की अनुमति नहीं है";
      TEXT_MATCH_IN_PROGRESS = "आपका एक खेल चल रहा है।<br><br>क्या आप दोबारा शामिल होना चाहते हैं?";
      TEXT_LOST_CONNECTION = "कनेक्शन टूट गया है।<br><br>खेल में वापस आने के लिए दोबारा कनेक्ट करें।";
      TEXT_RE_ENTER = "वापस आएँ";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "खिलाड़ी खेल छोड़ चुका है।<br><br>आप किसी बॉट के विरुद्ध खेल जारी रख सकते हैं या स्वतः जीत प्राप्त कर सकते हैं।";
      TEXT_SYS_WIN = "खेल जीतें";
      TEXT_SYS_CONTINUE = "जारी रखें";
      TEXT_SYS_RETRY = "फिर से कोशिश करें";
      TEXT_SYS_EDIT_PROFILE = "प्रोफ़ाइल संपादित करें";
      TEXT_SYS_WATCH = "देखें";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "रीमैच का इंतज़ार है";
      break;
    case LANG_ID:
      TEXT_WAIT_OPPONENT = "MENUNGGU LAWAN ...";
      TEXT_OPPONENT_LEFT = "LAWAN TELAH PERGI!";
      TEXT_ALL_PLAYERS_LEFT = "SEMUA PEMAIN TELAH MENINGGALKAN PERTANDINGAN!";
      TEXT_PLAYER_DISCONNECTED = "KAMU TELAH PERGI!";
      TEXT_REMATCH = "apa kamu ingin bertanding ulang?";
      TEXT_CONNECTION_LOST = "TIDAK ADA KONEKSI";
      TEXT_REMATCH_ALERT = "%s INGIN BERMAIN LAGI";
      TEXT_AFK = "Lawan tidak aktif";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "KELUAR";
      TEXT_SYS_UPDATE = "perbarui";
      TEXT_SYS_MATCH_LIST = "Daftar pertandingan";
      TEXT_SYS_QUICKMATCH = "pertandingan singkat";
      TEXT_SYS_CREATEMATCH = "buat pertandingan";
      TEXT_SYS_BACK = "kembali";
      TEXT_SYS_OK = "oke";
      TEXT_SYS_CREATE = "buat";
      TEXT_SYS_CLOSE = "tutup";
      TEXT_SYS_LOADING = "Memuat";
      TEXT_SYS_NAMEROOM = "Beri Nama Kamar";
      TEXT_SYS_CREATEROOM = "Buat Kamar";
      TEXT_SYS_DEFAULTROOMNAME = "%s kamar";
      TEXT_SYS_PASSWORD = "Kata sandi";
      TEXT_SYS_INFOPASS = "Kalau kamu tidak mengatur kata sandi, kamar ini akan menjadi publik.";
      TEXT_SYS_TYPEROOMPASS = "Ketik Kata Sandi Kamar";
      TEXT_WRONG_PASSWORD = "Kata Sandi Salah!";
      TEXT_NETWORK_CONNECTING = "MENYAMBUNGKAN ...";
      TEXT_ROOM_IS_FULL = "Kamar penuh!";
      TEXT_FIND_OPPONENT = "mencari lawan ...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "Menyambungkan ke lobi...";
      TEXT_ROOM_DOESNT_EXIST = "Kamar tidak ada!";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "menunggu lawan dalam kamar: ";
      TEXT_QUIT_FROM_GAME = "%s KELUAR DARI GAME";
      TEXT_TIME_OVER = "WAKTU HABIS";
      TEXT_OFFER_A_DRAW = "Apakah Anda ingin menawarkan seri?";
      TEXT_OFFERED_DRAW = "Kamu ditawari hasil seri.\nKlik tombol untuk menerimanya";
      TEXT_WAIT_FOR_A_DRAW = "Kamu menawarkan hasil seri.\nTunggu lawanmu menerimanya";
      TEXT_PLAYER_AGREED_TO_DRAW = "(Pemain menyetujui hasil seri)";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "Pemain";
      TEXT_PLAYER_KICKED = "Kamu dikeluarkan dari game karena tidak aktif.";
      TEXT_YOU_ARE_INACTIVE = "Bot telah menggantikanmu karena kamu tidak bermain.";
      TEXT_MINUTES = "Mnt";
      TEXT_NO_TIME = "Tidak Ada Waktu";
      TEXT_NO_TIME_MODE = "MODE TANPA WAKTU";
      TEXT_TIME_MODE = "MODE WAKTU";
      TEXT_SYS_FINDROOM = "mencari kamar ...";
      TEXT_ROOM_IS_EXPIRED = "Kamar Kedaluwarsa!";
      TEXT_MATCH_FOUND = "Pertandingan ditemukan!";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "menunggu pemain dalam kamar: ";
      TEXT_PLAY_NOW = "bermain sekarang";
      TEXT_WAITING_ROOM_MESSAGE = "Kamar ini bisa diisi maks. %d pemain";
      TEXT_SYS_GAME_TIME = "Waktu Pertandingan";
      TEXT_SYS_CHOOSEGAMETIME = "Pilih waktu bermain per pemain";
      TEXT_NO_CONNECTION = "TIDAK ADA KONEKSI<br/>(Sambungkan untuk menemukan lawan bermain online)";
      TEXT_SOMETHING_WENT_WRONG = "KESALAHAN KONEKSI. ADA YANG SALAH";
      TEXT_INVALID_NAME = "NAMA TIDAK VALID!";
      TEXT_SYS_INVITE = "UNDANG";
      TEXT_SYS_MINUTES = "%s mnt.";
      TEXT_SYS_QUICKMATCH_MINUTE = "pertandingan singkat (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "Tautan game disalin ke Clipboard. Bagikan ke teman-temanmu!";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "Pemain Maks";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Pilih jumlah maksimum pemain di dalam ruangan.";
      TEXT_EMOTICONS_BLOCK = "BLOKIR EMOTIKON";
      TEXT_SYS_CHOOSENICK = "Pilih nama panggilan";
      TEXT_SYS_CHOOSE_EMAIL = "surel";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "nama panggilan atau surel";
      TEXT_HURRY_UP = "CEPAT!";
      TEXT_SYS_CANCEL = "Batal";
      TEXT_SYS_SAVE = "Simpan";
      TEXT_ROOM_PERMISSION_DENIED = "Anda tidak diizinkan untuk masuk";
      TEXT_MATCH_IN_PROGRESS = "Kamu memiliki permainan yang sedang berlangsung.<br><br>Ingin bergabung kembali?";
      TEXT_LOST_CONNECTION = "Koneksi terputus.<br><br>Hubungkan kembali untuk masuk ke permainan.";
      TEXT_RE_ENTER = "GABUNG KEMBALI";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "Pemain telah meninggalkan permainan.<br><br>Kamu dapat melanjutkan permainan melawan bot atau memenangkan permainan secara otomatis.";
      TEXT_SYS_WIN = "MENANGKAN PERMAINAN";
      TEXT_SYS_CONTINUE = "LANJUTKAN";
      TEXT_SYS_RETRY = "COBA LAGI";
      TEXT_SYS_EDIT_PROFILE = "Edit Profil";
      TEXT_SYS_WATCH = "Tonton";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "Menunggu pertandingan ulang";
      break;
    case LANG_JA:
      TEXT_WAIT_OPPONENT = "対戦相手を待っています...";
      TEXT_OPPONENT_LEFT = "対戦相手が退出しました！";
      TEXT_ALL_PLAYERS_LEFT = "すべてのプレイヤーが試合を離れました！";
      TEXT_PLAYER_DISCONNECTED = "退出しました！";
      TEXT_REMATCH = "再度マッチしたいですか？";
      TEXT_CONNECTION_LOST = "接続がありません";
      TEXT_REMATCH_ALERT = "%s がもう一度プレイしたがっています";
      TEXT_AFK = "対戦相手が 離席中";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "終了";
      TEXT_SYS_UPDATE = "アップデート";
      TEXT_SYS_MATCH_LIST = "マッチリスト";
      TEXT_SYS_QUICKMATCH = "クイックマッチ";
      TEXT_SYS_CREATEMATCH = "マッチを作成する";
      TEXT_SYS_BACK = "戻る";
      TEXT_SYS_OK = "OK";
      TEXT_SYS_CREATE = "作成";
      TEXT_SYS_CLOSE = "閉じる";
      TEXT_SYS_LOADING = "読み込み中";
      TEXT_SYS_NAMEROOM = "部屋に名前をつける";
      TEXT_SYS_CREATEROOM = "部屋を作成する";
      TEXT_SYS_DEFAULTROOMNAME = "%s の部屋";
      TEXT_SYS_PASSWORD = "パスワード";
      TEXT_SYS_INFOPASS = "パスワードを設定しない場合は、この部屋は公開状態になります。";
      TEXT_SYS_TYPEROOMPASS = "部屋のパスワードを入力";
      TEXT_WRONG_PASSWORD = "パスワードが違います！";
      TEXT_NETWORK_CONNECTING = "接続中...";
      TEXT_ROOM_IS_FULL = "部屋は満員です！";
      TEXT_FIND_OPPONENT = "対戦相手を探しています...";
      TEXT_VS = "VS";
      TEXT_CONNECT_TO_LOBBY = "ロビーに接続中...";
      TEXT_ROOM_DOESNT_EXIST = "部屋は存在しません！";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "部屋内の対戦相手を待っています： ";
      TEXT_QUIT_FROM_GAME = "%s がゲームをやめました";
      TEXT_TIME_OVER = "タイムオーバー";
      TEXT_OFFER_A_DRAW = "引き分けを申し出ますか？";
      TEXT_OFFERED_DRAW = "引き分けを提案されました。\nボタンをクリックして承諾してください";
      TEXT_WAIT_FOR_A_DRAW = "引き分けを提案しました。\n対戦相手が承諾するのをお待ちください";
      TEXT_PLAYER_AGREED_TO_DRAW = "（プレイヤーが引き分けで合意しました）";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "プレイヤー";
      TEXT_PLAYER_KICKED = "不活発だったためゲームからキックされました。";
      TEXT_YOU_ARE_INACTIVE = "プレイしていないため、ボットが あなたの 代わりに 入りました。";
      TEXT_MINUTES = "分";
      TEXT_NO_TIME = "タイムなし";
      TEXT_NO_TIME_MODE = "タイムモードなし";
      TEXT_TIME_MODE = "タイムモード";
      TEXT_SYS_FINDROOM = "部屋を見つける...";
      TEXT_ROOM_IS_EXPIRED = "部屋は失効しました！";
      TEXT_MATCH_FOUND = "マッチを見つけました！";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "部屋内のプレイヤーを待っています： ";
      TEXT_PLAY_NOW = "今すぐプレイ";
      TEXT_WAITING_ROOM_MESSAGE = "「この部屋は最大 %d 人まで受け入れ可能です";
      TEXT_SYS_GAME_TIME = "マッチタイム";
      TEXT_SYS_CHOOSEGAMETIME = "プレイヤーごとにプレイ時間を選んでください";
      TEXT_NO_CONNECTION = "接続がありません<br/>（オンラインでプレイできるように接続してください）";
      TEXT_SOMETHING_WENT_WRONG = "接続エラー。問題が発生しました";
      TEXT_INVALID_NAME = "名前が無効です！";
      TEXT_SYS_INVITE = "招待する";
      TEXT_SYS_MINUTES = "%s 分";
      TEXT_SYS_QUICKMATCH_MINUTE = "クイックマッチ（「+TEXT_SYS_MINUTES+」）";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "ゲームリンクをクリップボードにコピーしました。フレンドとシェアしよう！";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "最大プレイヤー数";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "部屋の最大プレイヤー数を選択してください。";
      TEXT_EMOTICONS_BLOCK = "絵文字をブロック";
      TEXT_SYS_CHOOSENICK = "ニックネームを選択する";
      TEXT_SYS_CHOOSE_EMAIL = "メール";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "ニックネームまたはメールアドレス";
      TEXT_HURRY_UP = "急いで！";
      TEXT_SYS_CANCEL = "キャンセル";
      TEXT_SYS_SAVE = "保存";
      TEXT_ROOM_PERMISSION_DENIED = "入室する権限がありません";
      TEXT_MATCH_IN_PROGRESS = "進行中の 対戦があります。<br><br>対戦に 戻りますか？";
      TEXT_LOST_CONNECTION = "接続が 切れました。<br><br>対戦に 戻るには 再接続してください。";
      TEXT_RE_ENTER = "対戦に 戻る";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "相手プレイヤーが 対戦から 退出しました。<br><br>ボットとの 対戦を 続けるか、不戦勝を 選択できます。";
      TEXT_SYS_WIN = "不戦勝";
      TEXT_SYS_CONTINUE = "続ける";
      TEXT_SYS_RETRY = "もう一度";
      TEXT_SYS_EDIT_PROFILE = "プロフィールを編集";
      TEXT_SYS_WATCH = "観戦";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "再戦を待っています";
      break;
    case LANG_ZH:
      TEXT_WAIT_OPPONENT = "等待对手……";
      TEXT_OPPONENT_LEFT = "对手离开了游戏！";
      TEXT_ALL_PLAYERS_LEFT = "所有玩家已退出比赛！";
      TEXT_PLAYER_DISCONNECTED = "你离开了游戏！";
      TEXT_REMATCH = "你想要重新比赛吗？";
      TEXT_CONNECTION_LOST = "无网络连接";
      TEXT_REMATCH_ALERT = "%s想要再玩一局";
      TEXT_AFK = "对手 暂时离开";
      TEXT_AFK_SHORT = "AFK";
      TEXT_QUIT = "退出";
      TEXT_SYS_UPDATE = "更新";
      TEXT_SYS_MATCH_LIST = "匹配列表";
      TEXT_SYS_QUICKMATCH = "快速匹配";
      TEXT_SYS_CREATEMATCH = "创建比赛";
      TEXT_SYS_BACK = "返回";
      TEXT_SYS_OK = "确认";
      TEXT_SYS_CREATE = "创建";
      TEXT_SYS_CLOSE = "关闭";
      TEXT_SYS_LOADING = "加载中";
      TEXT_SYS_NAMEROOM = "命名房间";
      TEXT_SYS_CREATEROOM = "创建房间";
      TEXT_SYS_DEFAULTROOMNAME = "%s的房间";
      TEXT_SYS_PASSWORD = "密码";
      TEXT_SYS_INFOPASS = "如果你不设置密码，这将是公共房间。";
      TEXT_SYS_TYPEROOMPASS = "输入房间密码";
      TEXT_WRONG_PASSWORD = "密码错误！";
      TEXT_NETWORK_CONNECTING = "连接中……";
      TEXT_ROOM_IS_FULL = "房间已满！";
      TEXT_FIND_OPPONENT = "正在寻找对手……";
      TEXT_VS = "对";
      TEXT_CONNECT_TO_LOBBY = "连接到大厅……";
      TEXT_ROOM_DOESNT_EXIST = "房间不存在！";
      TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "等待房间内对手： ";
      TEXT_QUIT_FROM_GAME = "%s退出游戏";
      TEXT_TIME_OVER = "时间到";
      TEXT_OFFER_A_DRAW = "你想提出平局吗？";
      TEXT_OFFERED_DRAW = "你的对手提议和局。\n点击按钮来接受";
      TEXT_WAIT_FOR_A_DRAW = "你提议和局。\n等待对手接受";
      TEXT_PLAYER_AGREED_TO_DRAW = "（玩家同意和局）";
      TEXT_CPU = "AI";
      TEXT_PLAYER = "玩家";
      TEXT_PLAYER_KICKED = "你由于不活跃被踢出游戏。";
      TEXT_YOU_ARE_INACTIVE = "由于你没有进行游戏，机器人已代替你。";
      TEXT_MINUTES = "分钟数";
      TEXT_NO_TIME = "时间到了";
      TEXT_NO_TIME_MODE = "不限时模式";
      TEXT_TIME_MODE = "限时模式";
      TEXT_SYS_FINDROOM = "寻找房间……";
      TEXT_ROOM_IS_EXPIRED = "房间过期！";
      TEXT_MATCH_FOUND = "匹配成功！";
      TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "等待房间内玩家： ";
      TEXT_PLAY_NOW = "现在开始";
      TEXT_WAITING_ROOM_MESSAGE = "这个房间最多容纳%d名玩家";
      TEXT_SYS_GAME_TIME = "匹配时间";
      TEXT_SYS_CHOOSEGAMETIME = "选择每位玩家的游玩时间";
      TEXT_NO_CONNECTION = "无网络连接<br/>（联网以匹配玩家）";
      TEXT_SOMETHING_WENT_WRONG = "网络连接错误。出现错误";
      TEXT_INVALID_NAME = "名字无效！";
      TEXT_SYS_INVITE = "邀请";
      TEXT_SYS_MINUTES = "%s分钟";
      TEXT_SYS_QUICKMATCH_MINUTE = "快速匹配 (" + TEXT_SYS_MINUTES + ")";
      TEXT_SYS_COPIED_TO_CLIPBOARD = "已复制游戏链接到剪贴板。向朋友分享吧！";
      TEXT_SYS_QUICKMATCH_NOTIME = TEXT_SYS_QUICKMATCH + " (" + TEXT_NO_TIME + ")";
      TEXT_SYS_MAXPLAYERS = "最多玩家数";
      TEXT_SYS_CHOOSEMAXNUMPLAYERS = "选择房间中最多的玩家人数。";
      TEXT_EMOTICONS_BLOCK = "屏蔽表情符号";
      TEXT_SYS_CHOOSENICK = "选择昵称";
      TEXT_SYS_CHOOSE_EMAIL = "电子邮件";
      TEXT_SYS_CHOOSENICK_OR_EMAIL = "昵称或电子邮件";
      TEXT_HURRY_UP = "快点！";
      TEXT_SYS_CANCEL = "取消";
      TEXT_SYS_SAVE = "保存";
      TEXT_ROOM_PERMISSION_DENIED = "您无权进入";
      TEXT_MATCH_IN_PROGRESS = "你有一场 正在进行的 对局。<br><br>要重新加入吗？";
      TEXT_LOST_CONNECTION = "连接已断开。<br><br>请重新连接以返回对局。";
      TEXT_RE_ENTER = "重新加入";
      TEXT_OPPONENT_QUIT_AND_CONTINUE = "对方玩家 已退出 对局。<br><br>你可以选择 与机器人 继续游戏，或直接获得胜利。";
      TEXT_SYS_WIN = "直接获胜";
      TEXT_SYS_CONTINUE = "继续";
      TEXT_SYS_RETRY = "重试";
      TEXT_SYS_EDIT_PROFILE = "编辑个人资料";
      TEXT_SYS_WATCH = "观看";
      TEXT_PLAYERS_WAITING_FOR_REMATCH = "等待重赛";
  }
  void 0;
}
function CInfoTurn(n, t, i, r, u, f) {
  var p, b, v, e, c, a, g, d, s, k, nt, y, o, l, w, h;
  this._init = function (n, t, i, r, u, f) {
    var tt, n, rt, ut, ft;
    p = [];
    b = [];
    e = new createjs.Container();
    e.x = n;
    e.y = t;
    r.addChild(e);
    v = u;
    var nt = s_oSpriteLibrary.getSprite("bg_turn"),
      d = nt.width,
      g = nt.height / 2,
      et = {
        images: [nt],
        framerate: 58,
        frames: {
          width: d,
          height: g,
          regX: d / 2,
          regY: g / 2
        },
        animations: {
          off: [0, 0, "on"],
          on: [1, 1, "off"]
        }
      },
      tt = new createjs.SpriteSheet(et);
    c = createSprite(tt, 0, d / 2, g / 2, d, g);
    c.stop();
    c.scaleX = f ? -1 : 1;
    e.addChild(c);
    a = createSprite(tt, 1, d / 2, g / 2, d, g);
    a.stop();
    a.alpha = 0;
    a.scaleX = c.scaleX;
    e.addChild(a);
    tt = this._getSpriteSheet();
    s = createSprite(tt, i, nt.width / 4, nt.height / 2, nt.width / 2, nt.height);
    s.stop();
    n = 156;
    s.x = f ? n : -n;
    s.scale = .8;
    e.addChild(s);
    this.setPieceOffset();
    var ot = f ? "right" : "left",
      d = 80,
      g = 60,
      t = 4,
      it = 158;
    n = f ? it : -it;
    rt = i === WHITE ? FONT_COLOR_BLACK : FONT_COLOR_WHITE;
    k = new CTLText(e, n - d / 2, t - g / 2, d, g, 56, "center", rt, PRIMARY_FONT, 1, 2, 2, NUM_PIECES, !0, !0, !1, !1);
    k.setVisible(!1);
    var ot = f ? "left" : "right",
      d = 220,
      it = -47,
      n = it;
    f || (n = -it);
    var g = 40,
      d = 300;
    y = new CTLText(e, n - d / 2, 25 - g / 2, d, g, 40, ot, FONT_COLOR_WHITE, PRIMARY_FONT, 1, 2, 2, TEXT_PLAYER, !0, !0, !1, !1);
    o = new createjs.Text("...", "150px " + PRIMARY_FONT, FONT_COLOR_WHITE);
    o.x = n + 156;
    o.y = -10;
    o.textAlign = "right";
    o.textBaseline = "alphabetic";
    o.lineWidth = 300;
    o.setBounds(o.getBounds().x, 0, o.getBounds().width, 40);
    o.visible = !1;
    e.addChild(o);
    l = new createjs.Text(TEXT_AFK_SHORT, "36px " + PRIMARY_FONT, "#ff6a3d");
    l.x = f ? 100 : -100;
    l.y = -24;
    l.textAlign = f ? "right" : "left";
    l.textBaseline = "middle";
    l.visible = !1;
    e.addChild(l);
    ut = v !== TOP;
    h = new CEmoticonController(200, -28, ut, !1, e);
    h.addEventListener(ON_SELECT_EMOTICON, this._onEmoticonSelected, this);
    h.setBounds(0, 0, 1, 1);
    h.setVisible(!1);
    ft = v === TOP ? 60 : -40;
    w = new CEmoticon(e);
    w.setPosition(s.x + e.getBounds().width / 2, s.y + ft);
    w.setBounds(0, 0, 1, 1);
  };
  this.addEventListener = function (n, t, i) {
    p[n] = t;
    b[n] = i;
  };
  this._triggerEvent = function (n, t) {
    p[n] && p[n].call(b[n], t);
  };
  this.refreshView = function () {
    var t = v !== TOP,
      n = !1;
    s_bLandscape && s_iAspectRatio > 1.6 && (n = !0);
    h.setOpenPosition(t, n);
  };
  this.refreshPawnNumber = function (n) {
    k.refreshText(n);
  };
  this.refreshTime = function (n) {
    d.refreshText(n);
  };
  this.active = function (n) {
    n ? (c.alpha = 0, a.alpha = 1) : (c.alpha = 1, a.alpha = 0);
  };
  this.unload = function () {
    h.unload();
    r.removeChild(e);
  };
  this.setBgVisible = function (n) {
    c.visible = n;
  };
  this.setPanelVisible = function (n) {
    e.visible = n;
  };
  this.setPawn = function (n) {
    s.gotoAndStop(n);
  };
  this.setName = function (n) {
    y.refreshText(n);
  };
  this.getSide = function () {
    return v;
  };
  this.getBounds = function () {
    return e.getBounds();
  };
  this.getPosition = function () {
    return {
      x: e.x,
      y: e.y
    };
  };
  this.setPosition = function (n, t) {
    e.x = n;
    e.y = t;
  };
  this.setX = function (n) {
    e.x = n;
  };
  this.setY = function (n) {
    e.y = n;
  };
  this.setScale = function (n) {
    e.scale = n;
  };
  this.getNameWidth = function () {
    return y.getTextWidth();
  };
  this.setFinalPanel = function () {
    g.visible = !1;
    d.setVisible(!1);
    e.scale = 1.2;
    c.visible = !1;
    y.setHorizontalAlign("left");
    y.setY(-20);
  };
  this.showWaiting = function () {
    o.visible = !0;
    var n = TIME_LOOP_WAIT / 4;
    createjs.Tween.removeTweens(o);
    createjs.Tween.get(o, {
      loop: !0
    }).call(function () {
      o.text = "";
    }).wait(n).call(function () {
      o.text = ".";
    }).wait(n).call(function () {
      o.text = "..";
    }).wait(n).call(function () {
      o.text = "...";
    }).wait(n);
  };
  this.setAFK = function (n) {
    l.visible = n;
  };
  this.hideWaiting = function () {
    o.visible = !1;
    createjs.Tween.removeTweens(o);
  };
  this.showEmoticonsControl = function () {
    h.setVisible(!0);
  };
  this.hideEmoticonsControl = function () {
    h.setVisible(!1);
  };
  this.isEmoticonMuted = function () {
    return h.isMuted();
  };
  this.showEmoticon = function (n) {
    w.showEmoticon(n);
  };
  this._onEmoticonSelected = function (n) {
    h.closePanel();
    this._triggerEvent(ON_SELECT_EMOTICON, n);
  };
  this._getSpriteSheet = function () {
    var t = SKIN_CONFIG[s_iSkinID].piece_set.name,
      n = s_oSpriteLibrary.getSprite("piece_black_" + t),
      i = [s_oSpriteLibrary.getSprite("piece_white_" + t), s_oSpriteLibrary.getSprite("piece_black_" + t)],
      r = {
        images: i,
        frames: {
          width: n.width,
          height: n.height,
          regX: n.width / 2,
          regY: n.height / 2
        },
        animations: {
          white: [0],
          black: [1]
        }
      };
    return new createjs.SpriteSheet(r);
  };
  this.setPieceOffset = function () {
    var n = SKIN_CONFIG[s_iSkinID].piece_set.position,
      t = 0,
      i = 0;
    n.hasOwnProperty("regX") && (t = n.regX);
    n.hasOwnProperty("regY") && (i = n.regY);
    s.regX = t;
    s.regY = i;
  };
  this.changeSkin = function () {
    var n = this._getSpriteSheet();
    s.spriteSheet = n;
    this.setPieceOffset();
  };
  nt = this;
  this._init(n, t, i, r, u, f);
}
function CEmoticonController(n, t, i, r, u) {
  var c,
    y,
    o,
    p,
    k,
    a,
    d,
    s,
    e,
    f,
    nt,
    tt = u,
    w,
    l,
    b = this,
    g,
    h,
    v;
  this._init = function (n, t, i, r) {
    var et, u, ut, it, ft, ot, st, rt;
    for (c = !0, y = !1, p = [], k = [], h = EMOTICON_SPAM_ATTEMPT, v = 0, e = new createjs.Container(), e.x = n, e.y = t, tt.addChild(e), f = new createjs.Container(), f.scale = 0, e.addChild(f), a = s_oSpriteLibrary.getSprite("emoticon_panel"), et = createBitmap(a), f.addChild(et), nt = new createjs.Container(), tt.addChild(nt), o = [], u = 100, ut = 100, it = 0; it < NUM_EMOTICONS; it++) ft = new CGfxButton(u, ut, s_oSpriteLibrary.getSprite("but_emoticon_" + it), f), ft.addEventListener(ON_MOUSE_UP, this._onEmoticon, this, it), o.push(ft), u += 125, it === 2 && (u = 100, ut += 130);
    ut += 120;
    u -= 250;
    ot = s_oSpriteLibrary.getSprite("but_mute");
    st = createMarginRect(85, 10, 16, 10);
    d = new CGfxButton(u, ut, ot, f);
    d.addEventListener(ON_MOUSE_UP, this._onMute, this);
    d.addText(st, TEXT_EMOTICONS_BLOCK, "left", PRIMARY_FONT, FONT_COLOR_1, 36, 1, !0);
    rt = s_oSpriteLibrary.getSprite("but_emoticon");
    w = new createjs.SpriteSheet({
      images: [rt],
      frames: {
        width: rt.width / 2,
        height: rt.height
      },
      animations: {
        on: [0],
        off: [1]
      }
    });
    s = new CGfxButton(0, 0, rt, e);
    s.addEventListener(ON_MOUSE_UP, this._onToggleEmoticon, this);
    s.setImageFromSpritesheet(w, 0);
    this.setOpenPosition(i, r);
    l = new CMoveTimeController(-rt.width / 4, 0, e, EMOTICON_SPAM_TIMER);
    l.addEventListener(ON_TIMER_END, this._onTimerEnd, this);
    l.setAlwaysShown();
    l.showAttempt(!1);
    l.setSpectatorMode();
    g = setInterval(function () {
      b._update();
    }, FPS_TIME);
  };
  this.unload = function () {
    for (var n = 0; n < o.length; n++) o[n].unload();
    clearInterval(g);
    g = null;
  };
  this.setPos = function (n, t) {
    e.x = n;
    e.y = t;
  };
  this.refreshPos = function (n) {
    e.x = n.x;
    e.y = n.y;
  };
  this.setOpenPosition = function (n, t) {
    var i = s_oSpriteLibrary.getSprite("but_emoticon");
    n ? (f.y = 0, f.regY = a.height) : (f.y = 0, f.regY = 0);
    t ? (f.x = -i.width / 4, f.regX = a.width) : (f.x = -i.width / 4, f.regX = 0);
  };
  this.addEventListener = function (n, t, i) {
    p[n] = t;
    k[n] = i;
  };
  this.enable = function () {
    if (!(h <= 0)) {
      s.enable();
      for (var n = 0; n < o.length; n++) o[n].enable();
    }
  };
  this.disable = function () {
    s.disable();
    for (var n = 0; n < o.length; n++) o[n].disable();
  };
  this.closePanel = function () {
    this.disable();
    y = !1;
    createjs.Tween.get(f, {
      override: !0
    }).to({
      scale: 0
    }, 500, createjs.Ease.backIn).call(function () {
      b.enable();
    });
  };
  this.openPanel = function () {
    s.disable();
    this.disable();
    y = !0;
    createjs.Tween.get(f, {
      override: !0
    }).to({
      scale: 1
    }, 1e3, createjs.Ease.elasticOut).call(function () {
      b.enable();
    });
  };
  this.setBounds = function (n, t, i, r) {
    e.setBounds(n, t, i, r);
  };
  this.showEmoticon = function () {
    c;
  };
  this._onToggleEmoticon = function () {
    c || s.setImageFromSpritesheet(w, 0);
    c = !0;
    y ? this.closePanel() : this.openPanel();
  };
  this._onMute = function () {
    c = !1;
    s.setImageFromSpritesheet(w, 1);
    this.closePanel();
  };
  this.isMuted = function () {
    return !c;
  };
  this._onEmoticon = function (n) {
    h--;
    h <= 0 && (h = 0, v = -EMOTICON_SPAM_TIMER, l.startTimer());
    b.disable();
    p[ON_SELECT_EMOTICON] && p[ON_SELECT_EMOTICON].call(k[ON_SELECT_EMOTICON], n);
  };
  this.getEmoticonGlobalPos = function (n) {
    var t = s_bLandscape ? 1 : .75;
    return {
      x: e.x + (f.x + o[n].getX()) * t,
      y: e.y + (f.y + o[n].getY() - a.height) * t
    };
  };
  this.setVisible = function (n) {
    e.visible = n;
  };
  this._increaseAttempt = function () {
    h++;
    h >= NUM_ATTEMPT && (h = NUM_ATTEMPT);
  };
  this._onTimerEnd = function () {
    this._increaseAttempt();
    this.enable();
  };
  this._update = function () {
    v += s_iTimeElaps;
    v > EMOTICON_SPAM_TIMER && (v = 0, this._increaseAttempt());
  };
  this._init(n, t, i, r);
}
function CEmoticon(n) {
  var r,
    i,
    t,
    f = n,
    u;
  this._init = function () {
    r = !1;
    t = new createjs.Container();
    t.alpha = 0;
    f.addChild(t);
    u = 350;
    var n = this._prepareSprite(0);
    i = createSprite(n, "start", EMOTICON_WIDTH / 2, u, EMOTICON_WIDTH, EMOTICON_HEIGHT);
    t.addChild(i);
  };
  this._prepareSprite = function (n) {
    for (var i, f, r = [], t = 0; t < 30; t++) r.push(s_oSpriteLibrary.getSprite("emoticon_" + n + "_" + t));
    return i = {
      start: 0,
      anim: [0, 29]
    }, (n === 0 || n === 5) && (i = {
      start: 0,
      anim: [0, 29, "stop_anim"],
      stop_anim: 29
    }), f = {
      images: r,
      framerate: 40,
      frames: {
        width: EMOTICON_WIDTH,
        height: EMOTICON_HEIGHT,
        regX: EMOTICON_WIDTH / 2,
        regY: u
      },
      animations: i
    }, new createjs.SpriteSheet(f);
  };
  this.showEmoticon = function (n) {
    var u = this._prepareSprite(n);
    i.spriteSheet = u;
    playSfxSound("sfx_emote_" + n, 1, !1);
    r && createjs.Tween.removeTweens(t);
    i.gotoAndPlay("anim");
    r = !0;
    createjs.Tween.get(t).to({
      alpha: 1
    }, 500, createjs.Ease.cubicOut).wait(EMOTICON_TIME).to({
      alpha: 0
    }, 400, createjs.Ease.cubicOut).call(function () {
      i.gotoAndStop("start");
      r = !1;
    });
  };
  this.setPosition = function (n, i) {
    t.x = n;
    t.y = i;
  };
  this.setBounds = function (n, i, r, u) {
    t.setBounds(n, i, r, u);
  };
  this._init();
}
var JSON, s_bIsKeyboardOpen, browserName, s_aMusic, s_aMusicInfo, s_aSounds, s_aSoundsInfo, s_bMusicActive, s_bSfxActive, LOCALSTORAGE_SKIN_ID, s_iSkinID, s_bStorageAvailable, s_oLocalStorage, s_szGameID, s_oMenu, CGameBase, s_oInterface, NUM_ATTEMPT, WHITELIST_EN, SKIN_CONFIG;
(function () {
  "use strict";

  function p(n) {
    return n = String(n), n.charAt(0).toUpperCase() + n.slice(1);
  }
  function nt(n, t, i) {
    var r = {
      "10.0": "10",
      "6.4": "10 Technical Preview",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "Server 2008 R2 / 7",
      "6.0": "Server 2008 / Vista",
      "5.2": "Server 2003 / XP 64-bit",
      "5.1": "XP",
      "5.01": "2000 SP1",
      "5.0": "2000",
      "4.0": "NT",
      "4.90": "ME"
    };
    return t && i && /^Win/i.test(n) && !/^Windows Phone /i.test(n) && (r = r[/[\d.]+$/.exec(n)]) && (n = "Windows " + r), n = String(n), t && i && (n = n.replace(RegExp(t, "i"), i)), o(n.replace(/ ce$/i, " CE").replace(/\bhpw/i, "web").replace(/\bMacintosh\b/, "Mac OS").replace(/_PowerPC\b/i, " OS").replace(/\b(OS X) [^ \d]+/i, "$1").replace(/\bMac (OS X)\b/, "$1").replace(/\/(\d)/, " $1").replace(/_/g, ".").replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, "").replace(/\bx86\.64\b/gi, "x86_64").replace(/\b(Windows Phone) OS\b/, "$1").replace(/\b(Chrome OS \w+) [\d.]+\b/, "$1").split(" on ")[0]);
  }
  function tt(n, t) {
    var r = -1,
      i = n ? n.length : 0;
    if (typeof i == "number" && i > -1 && i <= k) while (++r < i) t(n[r], r, n);else s(n, t);
  }
  function o(n) {
    return n = w(n), /^(?:webOS|i(?:OS|P))/.test(n) ? n : p(n);
  }
  function s(n, t) {
    for (var i in n) g.call(n, i) && t(n[i], i, n);
  }
  function t(n) {
    return n == null ? p(n) : y.call(n).slice(8, -1);
  }
  function it(n, t) {
    var i = n != null ? typeof n[t] : "number";
    return !/^(?:boolean|number|string|undefined)$/.test(i) && (i == "object" ? !!n[t] : !0);
  }
  function i(n) {
    return String(n).replace(/([ -])(?!$)/g, "$1?");
  }
  function r(n, t) {
    var i = null;
    return tt(n, function (r, u) {
      i = t(i, r, u, n);
    }), i;
  }
  function w(n) {
    return String(n).replace(/^ +| +$/g, "");
  }
  function h(n) {
    function ui(t) {
      return r(t, function (t, r) {
        return t || RegExp("\\b" + (r.pattern || i(r)) + "\\b", "i").exec(n) && (r.label || r);
      });
    }
    function fi(t) {
      return r(t, function (t, r, u) {
        return t || (r[p] || r[/^[a-z]+(?: +[a-z]+\b)*/i.exec(p)] || RegExp("\\b" + i(u) + "(?:\\b|\\w*\\d)", "i").exec(n)) && u;
      });
    }
    function ei(t) {
      return r(t, function (t, r) {
        return t || RegExp("\\b" + (r.pattern || i(r)) + "\\b", "i").exec(n) && (r.label || r);
      });
    }
    function oi(t) {
      return r(t, function (t, r) {
        var u = r.pattern || i(r);
        return !t && (t = RegExp("\\b" + u + "(?:/[\\d.]+|[ \\w.]*)", "i").exec(n)) && (t = nt(t, u, r.label || r)), t;
      });
    }
    function wt(t) {
      return r(t, function (t, r) {
        var u = r.pattern || i(r);
        return !t && (t = RegExp("\\b" + u + " *\\d+[.\\w_]*", "i").exec(n) || RegExp("\\b" + u + " *\\w+-[\\w]*", "i").exec(n) || RegExp("\\b" + u + "(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)", "i").exec(n)) && ((t = String(r.label && !RegExp(u, "i").test(r.label) ? r.label : t).split("/"))[1] && !/[\d.]+/.test(t[0]) && (t[0] += " " + t[1]), r = r.label || r, t = o(t[0].replace(RegExp(u, "i"), r).replace(RegExp("; *(?:" + r + "[_-])?", "i"), " ").replace(RegExp("(" + r + ")[-_.]?(\\w)", "i"), "$1 $2"))), t;
      });
    }
    function si(t) {
      return r(t, function (t, i) {
        return t || (RegExp(i + "(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)", "i").exec(n) || 0)[1] || null;
      });
    }
    function hi() {
      return this.description || "";
    }
    var g = u,
      ut = n && typeof n == "object" && t(n) != "String",
      ot,
      at,
      tt;
    ut && (g = n, n = null);
    ot = g.navigator || {};
    at = ot.userAgent || "";
    n || (n = at);
    var ci = ut || d == b,
      bt = ut ? !!ot.likeChrome : /\bChrome\b/.test(n) && !/internal|\n/i.test(y.toString()),
      vt = "Object",
      kt = ut ? vt : "ScriptBridgingProxyObject",
      dt = ut ? vt : "Environment",
      gt = ut && g.java ? "JavaPackage" : t(g.java),
      ni = ut ? vt : "RuntimeObject",
      st = /\bJava/.test(gt) && g.java,
      ti = st && t(g.environment) == dt,
      ii = st ? "a" : "α",
      ri = st ? "b" : "β",
      yt = g.document || {},
      ft = g.operamini || g.opera,
      ht = e.test(ht = ut && ft ? ft["[[Class]]"] : t(ft)) ? ht : ft = null,
      f,
      ct = n,
      v = [],
      lt = null,
      et = n == at,
      a = et && ft && typeof ft.version == "function" && ft.version(),
      pt,
      k = ui([{
        label: "EdgeHTML",
        pattern: "Edge"
      }, "Trident", {
        label: "WebKit",
        pattern: "AppleWebKit"
      }, "iCab", "Presto", "NetFront", "Tasman", "KHTML", "Gecko"]),
      c = ei(["Adobe AIR", "Arora", "Avant Browser", "Breach", "Camino", "Electron", "Epiphany", "Fennec", "Flock", "Galeon", "GreenBrowser", "iCab", "Iceweasel", "K-Meleon", "Konqueror", "Lunascape", "Maxthon", {
        label: "Microsoft Edge",
        pattern: "Edge"
      }, "Midori", "Nook Browser", "PaleMoon", "PhantomJS", "Raven", "Rekonq", "RockMelt", {
        label: "Samsung Internet",
        pattern: "SamsungBrowser"
      }, "SeaMonkey", {
        label: "Silk",
        pattern: "(?:Cloud9|Silk-Accelerated)"
      }, "Sleipnir", "SlimBrowser", {
        label: "SRWare Iron",
        pattern: "Iron"
      }, "Sunrise", "Swiftfox", "Waterfox", "WebPositive", "Opera Mini", {
        label: "Opera Mini",
        pattern: "OPiOS"
      }, "Opera", {
        label: "Opera",
        pattern: "OPR"
      }, "Chrome", {
        label: "Chrome Mobile",
        pattern: "(?:CriOS|CrMo)"
      }, {
        label: "Firefox",
        pattern: "(?:Firefox|Minefield)"
      }, {
        label: "Firefox for iOS",
        pattern: "FxiOS"
      }, {
        label: "IE",
        pattern: "IEMobile"
      }, {
        label: "IE",
        pattern: "MSIE"
      }, "Safari"]),
      p = wt([{
        label: "BlackBerry",
        pattern: "BB10"
      }, "BlackBerry", {
        label: "Galaxy S",
        pattern: "GT-I9000"
      }, {
        label: "Galaxy S2",
        pattern: "GT-I9100"
      }, {
        label: "Galaxy S3",
        pattern: "GT-I9300"
      }, {
        label: "Galaxy S4",
        pattern: "GT-I9500"
      }, {
        label: "Galaxy S5",
        pattern: "SM-G900"
      }, {
        label: "Galaxy S6",
        pattern: "SM-G920"
      }, {
        label: "Galaxy S6 Edge",
        pattern: "SM-G925"
      }, {
        label: "Galaxy S7",
        pattern: "SM-G930"
      }, {
        label: "Galaxy S7 Edge",
        pattern: "SM-G935"
      }, "Google TV", "Lumia", "iPad", "iPod", "iPhone", "Kindle", {
        label: "Kindle Fire",
        pattern: "(?:Cloud9|Silk-Accelerated)"
      }, "Nexus", "Nook", "PlayBook", "PlayStation Vita", "PlayStation", "TouchPad", "Transformer", {
        label: "Wii U",
        pattern: "WiiU"
      }, "Wii", "Xbox One", {
        label: "Xbox 360",
        pattern: "Xbox"
      }, "Xoom"]),
      rt = fi({
        Apple: {
          iPad: 1,
          iPhone: 1,
          iPod: 1
        },
        Archos: {},
        Amazon: {
          Kindle: 1,
          "Kindle Fire": 1
        },
        Asus: {
          Transformer: 1
        },
        "Barnes & Noble": {
          Nook: 1
        },
        BlackBerry: {
          PlayBook: 1
        },
        Google: {
          "Google TV": 1,
          Nexus: 1
        },
        HP: {
          TouchPad: 1
        },
        HTC: {},
        LG: {},
        Microsoft: {
          Xbox: 1,
          "Xbox One": 1
        },
        Motorola: {
          Xoom: 1
        },
        Nintendo: {
          "Wii U": 1,
          Wii: 1
        },
        Nokia: {
          Lumia: 1
        },
        Samsung: {
          "Galaxy S": 1,
          "Galaxy S2": 1,
          "Galaxy S3": 1,
          "Galaxy S4": 1
        },
        Sony: {
          PlayStation: 1,
          "PlayStation Vita": 1
        }
      }),
      l = oi(["Windows Phone", "Android", "CentOS", {
        label: "Chrome OS",
        pattern: "CrOS"
      }, "Debian", "Fedora", "FreeBSD", "Gentoo", "Haiku", "Kubuntu", "Linux Mint", "OpenBSD", "Red Hat", "SuSE", "Ubuntu", "Xubuntu", "Cygwin", "Symbian OS", "hpwOS", "webOS ", "webOS", "Tablet OS", "Tizen", "Linux", "Mac OS X", "Macintosh", "Mac", "Windows 98;", "Windows "]);
    if (k && (k = [k]), rt && !p && (p = wt([rt])), (f = /\bGoogle TV\b/.exec(p)) && (p = f[0]), /\bSimulator\b/i.test(n) && (p = (p ? p + " " : "") + "Simulator"), c == "Opera Mini" && /\bOPiOS\b/.test(n) && v.push("running in Turbo/Uncompressed mode"), c == "IE" && /\blike iPhone OS\b/.test(n) ? (f = h(n.replace(/like iPhone OS/, "")), rt = f.manufacturer, p = f.product) : /^iP/.test(p) ? (c || (c = "Safari"), l = "iOS" + ((f = / OS ([\d_]+)/i.exec(n)) ? " " + f[1].replace(/_/g, ".") : "")) : c != "Konqueror" || /buntu/i.test(l) ? rt && rt != "Google" && (/Chrome/.test(c) && !/\bMobile Safari\b/i.test(n) || /\bVita\b/.test(p)) || /\bAndroid\b/.test(l) && /^Chrome/.test(c) && /\bVersion\//i.test(n) ? (c = "Android Browser", l = /\bAndroid\b/.test(l) ? l : "Android") : c == "Silk" ? (/\bMobi/i.test(n) || (l = "Android", v.unshift("desktop mode")), /Accelerated *= *true/i.test(n) && v.unshift("accelerated")) : c == "PaleMoon" && (f = /\bFirefox\/([\d.]+)\b/.exec(n)) ? v.push("identifying as Firefox " + f[1]) : c == "Firefox" && (f = /\b(Mobile|Tablet|TV)\b/i.exec(n)) ? (l || (l = "Firefox OS"), p || (p = f[1])) : !c || (f = !/\bMinefield\b/i.test(n) && /\b(?:Firefox|Safari)\b/.exec(c)) ? (c && !p && /[\/,]|^[^(]+?\)/.test(n.slice(n.indexOf(f + "/") + 8)) && (c = null), (f = p || rt || l) && (p || rt || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(l)) && (c = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(l) ? l : f) + " Browser")) : c == "Electron" && (f = (/\bChrome\/([\d.]+)\b/.exec(n) || 0)[1]) && v.push("Chromium " + f) : l = "Kubuntu", a || (a = si(["(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))", "Version", i(c), "(?:Firefox|Minefield|NetFront)"])), (f = k == "iCab" && parseFloat(a) > 3 && "WebKit" || /\bOpera\b/.test(c) && (/\bOPR\b/.test(n) ? "Blink" : "Presto") || /\b(?:Midori|Nook|Safari)\b/i.test(n) && !/^(?:Trident|EdgeHTML)$/.test(k) && "WebKit" || !k && /\bMSIE\b/i.test(n) && (l == "Mac OS" ? "Tasman" : "Trident") || k == "WebKit" && /\bPlayStation\b(?! Vita\b)/i.test(c) && "NetFront") && (k = [f]), c == "IE" && (f = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(n) || 0)[1]) ? (c += " Mobile", l = "Windows Phone " + (/\+$/.test(f) ? f : f + ".x"), v.unshift("desktop mode")) : /\bWPDesktop\b/i.test(n) ? (c = "IE Mobile", l = "Windows Phone 8.x", v.unshift("desktop mode"), a || (a = (/\brv:([\d.]+)/.exec(n) || 0)[1])) : c != "IE" && k == "Trident" && (f = /\brv:([\d.]+)/.exec(n)) && (c && v.push("identifying as " + c + (a ? " " + a : "")), c = "IE", a = f[1]), et) {
      if (it(g, "global")) {
        if (st && (f = st.lang.System, ct = f.getProperty("os.arch"), l = l || f.getProperty("os.name") + " " + f.getProperty("os.version")), ti) {
          try {
            a = g.require("ringo/engine").version.join(".");
            c = "RingoJS";
          } catch (li) {
            (f = g.system) && f.global.system == g.system && (c = "Narwhal", l || (l = f[0].os || null));
          }
          c || (c = "Rhino");
        } else typeof g.process == "object" && !g.process.browser && (f = g.process) && (typeof f.versions == "object" && (typeof f.versions.electron == "string" ? (v.push("Node " + f.versions.node), c = "Electron", a = f.versions.electron) : typeof f.versions.nw == "string" && (v.push("Chromium " + a, "Node " + f.versions.node), c = "NW.js", a = f.versions.nw)), c || (c = "Node.js", ct = f.arch, l = f.platform, a = /[\d.]+/.exec(f.version), a = a ? a[0] : null));
      } else t(f = g.runtime) == kt ? (c = "Adobe AIR", l = f.flash.system.Capabilities.os) : t(f = g.phantom) == ni ? (c = "PhantomJS", a = (f = f.version || null) && f.major + "." + f.minor + "." + f.patch) : typeof yt.documentMode == "number" && (f = /\bTrident\/(\d+)/i.exec(n)) ? (a = [a, yt.documentMode], (f = +f[1] + 4) != a[1] && (v.push("IE " + a[1] + " mode"), k && (k[1] = ""), a[1] = f), a = c == "IE" ? String(a[1].toFixed(1)) : a[0]) : typeof yt.documentMode == "number" && /^(?:Chrome|Firefox)\b/.test(c) && (v.push("masking as " + c + " " + a), c = "IE", a = "11.0", k = ["Trident"], l = "Windows");
      l = l && o(l);
    }
    if (a && (f = /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(a) || /(?:alpha|beta)(?: ?\d)?/i.exec(n + ";" + (et && ot.appMinorVersion)) || /\bMinefield\b/i.test(n) && "a") && (lt = /b/i.test(f) ? "beta" : "alpha", a = a.replace(RegExp(f + "\\+?$"), "") + (lt == "beta" ? ri : ii) + (/\d+\+?/.exec(f) || "")), c == "Fennec" || c == "Firefox" && /\b(?:Android|Firefox OS)\b/.test(l)) c = "Firefox Mobile";else if (c == "Maxthon" && a) a = a.replace(/\.[\d.]+/, ".x");else if (/\bXbox\b/i.test(p)) p == "Xbox 360" && (l = null), p == "Xbox 360" && /\bIEMobile\b/.test(n) && v.unshift("mobile mode");else if ((/^(?:Chrome|IE|Opera)$/.test(c) || c && !p && !/Browser|Mobi/.test(c)) && (l == "Windows CE" || /Mobi/i.test(n))) c += " Mobile";else if (c == "IE" && et) try {
      g.external === null && v.unshift("platform preview");
    } catch (li) {
      v.unshift("embedded");
    } else (/\bBlackBerry\b/.test(p) || /\bBB10\b/.test(n)) && (f = (RegExp(p.replace(/ +/g, " *") + "/([.\\d]+)", "i").exec(n) || 0)[1] || a) ? (f = [f, /BB10/.test(n)], l = (f[1] ? (p = null, rt = "BlackBerry") : "Device Software") + " " + f[0], a = null) : this != s && p != "Wii" && (et && ft || /Opera/.test(c) && /\b(?:MSIE|Firefox)\b/i.test(n) || c == "Firefox" && /\bOS X (?:\d+\.){2,}/.test(l) || c == "IE" && (l && !/^Win/.test(l) && a > 5.5 || /\bWindows XP\b/.test(l) && a > 8 || a == 8 && !/\bTrident\b/.test(n))) && !e.test(f = h.call(s, n.replace(e, "") + ";")) && f.name && (f = "ing as " + f.name + ((f = f.version) ? " " + f : ""), e.test(c) ? (/\bIE\b/.test(f) && l == "Mac OS" && (l = null), f = "identify" + f) : (f = "mask" + f, c = ht ? o(ht.replace(/([a-z])([A-Z])/g, "$1 $2")) : "Opera", /\bIE\b/.test(f) && (l = null), et || (a = null)), k = ["Presto"], v.push(f));
    return (f = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(n) || 0)[1]) && (f = [parseFloat(f.replace(/\.(\d)$/, ".0$1")), f], c == "Safari" && f[1].slice(-1) == "+" ? (c = "WebKit Nightly", lt = "alpha", a = f[1].slice(0, -1)) : (a == f[1] || a == (f[2] = (/\bSafari\/([\d.]+\+?)/i.exec(n) || 0)[1])) && (a = null), f[1] = (/\bChrome\/([\d.]+)/i.exec(n) || 0)[1], f[0] == 537.36 && f[2] == 537.36 && parseFloat(f[1]) >= 28 && k == "WebKit" && (k = ["Blink"]), et && (bt || f[1]) ? (k && (k[1] = "like Chrome"), f = f[1] || (f = f[0], f < 530 ? 1 : f < 532 ? 2 : f < 532.05 ? 3 : f < 533 ? 4 : f < 534.03 ? 5 : f < 534.07 ? 6 : f < 534.1 ? 7 : f < 534.13 ? 8 : f < 534.16 ? 9 : f < 534.24 ? 10 : f < 534.3 ? 11 : f < 535.01 ? 12 : f < 535.02 ? "13+" : f < 535.07 ? 15 : f < 535.11 ? 16 : f < 535.19 ? 17 : f < 536.05 ? 18 : f < 536.1 ? 19 : f < 537.01 ? 20 : f < 537.11 ? "21+" : f < 537.13 ? 23 : f < 537.18 ? 24 : f < 537.24 ? 25 : f < 537.36 ? 26 : k != "Blink" ? "27" : "28")) : (k && (k[1] = "like Safari"), f = (f = f[0], f < 400 ? 1 : f < 500 ? 2 : f < 526 ? 3 : f < 533 ? 4 : f < 534 ? "4+" : f < 535 ? 5 : f < 537 ? 6 : f < 538 ? 7 : f < 601 ? 8 : "8")), k && (k[1] += " " + (f += typeof f == "number" ? ".x" : /[.+]/.test(f) ? "" : "+")), c == "Safari" && (!a || parseInt(a) > 45) && (a = f)), c == "Opera" && (f = /\bzbov|zvav$/.exec(l)) ? (c += " ", v.unshift("desktop mode"), f == "zvav" ? (c += "Mini", a = null) : c += "Mobile", l = l.replace(RegExp(" *" + f + "$"), "")) : c == "Safari" && /\bChrome\b/.exec(k && k[1]) && (v.unshift("desktop mode"), c = "Chrome Mobile", a = null, /\bOS X\b/.test(l) ? (rt = "Apple", l = "iOS 4.3+") : l = null), a && a.indexOf(f = /[\d.]+$/.exec(l)) == 0 && n.indexOf("/" + f + "-") > -1 && (l = w(l.replace(f, ""))), k && !/\b(?:Avant|Nook)\b/.test(c) && (/Browser|Lunascape|Maxthon/.test(c) || c != "Safari" && /^iOS/.test(l) && /\bSafari\b/.test(k[1]) || /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(c) && k[1]) && (f = k[k.length - 1]) && v.push(f), v.length && (v = ["(" + v.join("; ") + ")"]), rt && p && p.indexOf(rt) < 0 && v.push("on " + rt), p && v.push((/^on /.test(v[v.length - 1]) ? "" : "on ") + p), l && (f = / ([\d.+]+)$/.exec(l), pt = f && l.charAt(l.length - f[0].length - 1) == "/", l = {
      architecture: 32,
      family: f && !pt ? l.replace(f[0], "") : l,
      version: f ? f[1] : null,
      toString: function () {
        var n = this.version;
        return this.family + (n && !pt ? " " + n : "") + (this.architecture == 64 ? " 64-bit" : "");
      }
    }), (f = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(ct)) && !/\bi686\b/i.test(ct) ? (l && (l.architecture = 64, l.family = l.family.replace(RegExp(" *" + f), "")), c && (/\bWOW64\b/i.test(n) || et && /\w(?:86|32)$/.test(ot.cpuClass || ot.platform) && !/\bWin64; x64\b/i.test(n)) && v.unshift("32-bit")) : l && /^OS X/.test(l.family) && c == "Chrome" && parseFloat(a) >= 39 && (l.architecture = 64), n || (n = null), tt = {}, tt.description = n, tt.layout = k && k[0], tt.manufacturer = rt, tt.name = c, tt.prerelease = lt, tt.product = p, tt.ua = n, tt.version = c && a, tt.os = l || {
      architecture: null,
      family: null,
      version: null,
      toString: function () {
        return "null";
      }
    }, tt.parse = h, tt.toString = hi, tt.version && v.unshift(a), tt.name && v.unshift(c), !l || !c || l == String(l).split(" ")[0] && (l == c.split(" ")[0] || p) || v.push(p ? "(" + l + ")" : "on " + l), v.length && (tt.description = v.join(" ")), tt;
  }
  var c = {
      "function": !0,
      object: !0
    },
    u = c[typeof window] && window || this,
    b = u,
    l = c[typeof exports] && exports,
    a = c[typeof module] && module && !module.nodeType && module,
    n = l && a && typeof global == "object" && global,
    f;
  n && (n.global === n || n.window === n || n.self === n) && (u = n);
  var k = Math.pow(2, 53) - 1,
    e = /\bOpera/,
    d = this,
    v = Object.prototype,
    g = v.hasOwnProperty,
    y = v.toString;
  f = h();
  typeof define == "function" && typeof define.amd == "object" && define.amd ? (u.platform = f, define(function () {
    return f;
  })) : l && a ? s(f, function (n, t) {
    l[t] = n;
  }) : u.platform = f;
}).call(this);
document.addEventListener("DOMContentLoaded", () => {
  platform && platform.product === "iPhone" && platform.name.toLowerCase() !== "safari" && !iosInIframe() && (buildIOSFullscreenPanel(), buildIOSMeta());
});
window.addEventListener("resize", function () {
  platform && platform.product === "iPhone" && platform.name.toLowerCase() !== "safari" && !iosInIframe() && iosResize();
});
var SCREEN_MODE_SQUARE = "square",
  SCREEN_MODE_OPTIMIZE = "optimize",
  SCREEN_MODE_LANDSCAPE = "landscape",
  SCREEN_MODE_PORTRAIT = "portrait",
  SCREEN_MODE = SCREEN_MODE_SQUARE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  EDGEBOARD_X,
  EDGEBOARD_Y,
  MIN_SCREEN_SIZE = 1080,
  MAX_SCREEN_SIZE = 1920,
  EDGEBOARD_SIZE = 540,
  STAGE_GL = !1,
  PRIMARY_FONT = "Montserrat-Black",
  FONT_COLOR = "#3c2200",
  FONT_COLOR_1 = "#fff",
  FONT_COLOR_WHITE = "#dcd2c6",
  FONT_COLOR_BLACK = "#2f2d28",
  FPS = 60,
  FPS_TIME = 1e3 / FPS,
  DISABLE_SOUND_MOBILE = !1,
  GAME_ORIENTATION = "landscape",
  GAME_NAME = "backgammon_multiplayer",
  GAME_CTL_ID = "19676",
  PLATFORM_NAME = "MSN Games",
  PLATFORM_CTL_ID = "19709",
  GAME_PLAYERIO_ID = "backgammon-pq73fqmfyecbxzfz1q5nkg",
  MULTIPLAYER_TEST_LOCAL = !1,
  GAME_SERVER_STATE_MENU = "MENU",
  GAME_SERVER_STATE_START = "GAME_START",
  GAME_SERVER_STATE_END = "GAME_END",
  PARAM_ROOM_ID = "roomid",
  PARAM_PASSWORD = "pwd",
  s_b2Players,
  SOUNDTRACK_VOLUME_IN_GAME = 1,
  INTERFACE_PORTRAIT_SCALING = 1.5,
  NUM_PIECES = 15,
  BASE_GROUP_PIECES = 6,
  WHITE = 0,
  BLACK = 1,
  TRIANGLE_UP = -1,
  TRIANGLE_DOWN = 1,
  NUM_TRIANGLES = 24,
  TOP = "top",
  BOTTOM = "bottom",
  FINAL_CELL_WHITE = 24,
  FINAL_CELL_BLACK = -1,
  PIECE_DIM = 96,
  ROLL_DICE_TIME = 1e4,
  MOVE_TIME = 45e3,
  TIME_HURRYUP_WARNING = 1e4,
  TIME_CONTROLLER_RADIUS = 40,
  NUM_ATTEMPT = 0,
  TIMER_VICTORY_CLAIM = 3e4,
  ON_TIMER_END = 0,
  ON_LAST_TIMER_END = 1,
  X_TRIANGLE_RIGHT = 959,
  Y_OFFBOARD_DOWN = 458,
  Y_OFFBOARD_UP = 143,
  X_INTERFACE_PLAYER = 180,
  Y_INTERFACE_PLAYER_1 = 133,
  Y_INTERFACE_PLAYER_2 = 449,
  ON_END_DISTRIBUTION = 0,
  ON_CLICK_ON_PIECE = 1,
  ON_CLICK_ON_BEAROFF = 2,
  ON_CLICK_ON_TRIANGLE = 3,
  ON_END_MOVE_PIECE = 4,
  TIME_LOOP_WAIT = 2e3,
  MIN_TIME_THINK = 700,
  MAX_TIME_THINK = 2300,
  MS_DISTRIBUTION = 0,
  MULTIPLIER_SCORE,
  STATE_LOADING = 0,
  STATE_MENU = 1,
  STATE_HELP = 1,
  STATE_GAME = 3,
  STATE_LEVEL_SELECTION = 4,
  ON_MOUSE_DOWN = 0,
  ON_MOUSE_UP = 1,
  ON_MOUSE_OVER = 2,
  ON_MOUSE_OUT = 3,
  ON_DRAG_START = 4,
  ON_DRAG_END = 5,
  ON_BACK_MENU = 6,
  ON_RESTART = 7,
  ON_SELECT_LANG = 8,
  ON_DICE_ROLL_OVER = 9,
  ON_SELECT_EMOTICON = 11,
  ON_BACK = 12,
  ON_CONFIRM = 13,
  MOVES_TYPE_FILL = "fill",
  MOVES_TYPE_ADD = "add",
  MOVES_TYPE_HIT = "hit",
  MOVES_TYPE_BEAR = "bear",
  MOVES_TYPE_EXTRABEAR = "extrabear",
  MOVES_TYPE_COLLISION = "collision",
  RULE_BROKEN_NONE = "none",
  RULE_BROKEN_HIGHER_DICE = "higher",
  RULE_BROKEN_BOTH_DICE = "bothdice",
  RULE_BROKEN_MOST_DICE = "most",
  NUM_TURNS_PER_ADS = 20,
  ENABLE_FULLSCREEN = !1,
  ENABLE_CHECK_ORIENTATION,
  NUM_EMOTICONS = 6,
  EMOTICON_WIDTH = 371,
  EMOTICON_HEIGHT = 501,
  EMOTICON_TIME = 1e3,
  EMOTICON_SPAM_TIMER = 1e4,
  EMOTICON_SPAM_ATTEMPT = 3,
  DEFAULT_LANG = LANG_EN,
  LANG_LIST = [LANG_EN, LANG_ES, LANG_FR, LANG_DE, LANG_PT, LANG_IT, LANG_RU, LANG_TR, LANG_AR, LANG_HI, LANG_ID, LANG_JA, LANG_ZH],
  s_iScaleFactor = 1,
  s_iOffsetX,
  s_iOffsetY,
  s_bIsIphone = !1,
  pausedTweenObjs = [],
  s_bLandscape = !1,
  s_bSquareSize = !1,
  s_iAspectRatio = 1,
  s_bFocus = !0;
const MIN_KEYBOARD_HEIGHT = 300;
if (s_bIsKeyboardOpen = !1, browserName = function (n) {
  switch (!0) {
    case n.indexOf("edge") > -1:
      return "MS Edge";
    case n.indexOf("edg/") > -1:
      return "Edge ( chromium based)";
    case n.indexOf("opr") > -1 && !!window.opr:
      return "Opera";
    case n.indexOf("chrome") > -1 && !!window.chrome:
      return "Chrome";
    case n.indexOf("trident") > -1:
      return "MS IE";
    case n.indexOf("firefox") > -1:
      return "Mozilla Firefox";
    case n.indexOf("safari") > -1:
      return "Safari";
    default:
      return "other";
  }
}(window.navigator.userAgent.toLowerCase()), window.addEventListener("resize", function () {
  sizeHandler();
}, !0), window.visualViewport.addEventListener("resize", n => {
  n.target.height < MIN_KEYBOARD_HEIGHT ? (s_bIsKeyboardOpen = !0, s_bIsKeyboardOpen ? document.querySelector(".ctl-multiplayer-dlg-wrapper") && (document.querySelector(".ctl-multiplayer-dlg-wrapper").style.height = n.target.height, document.querySelector(".ctl-multiplayer-dlg-content").style.transform = "translate(-50%, -50%) scale(0.5)") : document.querySelector(".ctl-multiplayer-dlg-wrapper") && (document.querySelector(".ctl-multiplayer-dlg-content").style.transform = "translate(-50%, -50%) scale(1)", document.querySelector(".ctl-multiplayer-dlg-wrapper").style.height = "100%")) : (s_bIsKeyboardOpen = !1, document.querySelector(".ctl-multiplayer-dlg-wrapper") && (document.querySelector(".ctl-multiplayer-dlg-content").style.transform = "translate(-50%, -50%) scale(1)", document.querySelector(".ctl-multiplayer-dlg-wrapper").style.height = "100%"));
}), window.addEventListener("orientationchange", onOrientationChange), NoClickDelay.prototype = {
  handleEvent: function (n) {
    switch (n.type) {
      case "touchstart":
        this.onTouchStart(n);
        break;
      case "touchmove":
        this.onTouchMove(n);
        break;
      case "touchend":
        this.onTouchEnd(n);
    }
  },
  onTouchStart: function (n) {
    n.preventDefault();
    this.moved = !1;
    this.element.addEventListener("touchmove", this, !1);
    this.element.addEventListener("touchend", this, !1);
  },
  onTouchMove: function () {
    this.moved = !0;
  },
  onTouchEnd: function (n) {
    var t, i;
    this.element.removeEventListener("touchmove", this, !1);
    this.element.removeEventListener("touchend", this, !1);
    this.moved || (t = document.elementFromPoint(n.changedTouches[0].clientX, n.changedTouches[0].clientY), t.nodeType == 3 && (t = t.parentNode), i = document.createEvent("MouseEvents"), i.initEvent("click", !0, !0), t.dispatchEvent(i));
  }
}, function () {
  function n(n) {
    var i = "visible",
      r = "hidden",
      u = {
        focus: i,
        focusin: i,
        pageshow: i,
        blur: r,
        focusout: r,
        pagehide: r
      };
    n = n || window.event;
    n.type in u ? document.body.className = u[n.type] : (document.body.className = this[t] ? "hidden" : "visible", document.body.className === "hidden" ? (s_oMain.stopUpdate(), s_bFocus = !1) : (s_oMain.startUpdate(), s_bFocus = !0));
  }
  var t = "hidden";
  t in document ? document.addEventListener("visibilitychange", n) : (t = "mozHidden") in document ? document.addEventListener("mozvisibilitychange", n) : (t = "webkitHidden") in document ? document.addEventListener("webkitvisibilitychange", n) : (t = "msHidden") in document ? document.addEventListener("msvisibilitychange", n) : "onfocusin" in document ? document.onfocusin = document.onfocusout = n : window.onpageshow = window.onpagehide = window.onfocus = window.onblur = n;
}(), String.prototype.format = function () {
  for (var n = this, t = arguments.length; t--;) n = n.replace(new RegExp("\\{" + t + "\\}", "gm"), arguments[t]);
  return n;
}, screenfull.isEnabled) screenfull.on("change", function () {
  s_bFullscreen = screenfull.isFullscreen;
});
s_bMusicActive = !0;
s_bSfxActive = !0;
class CButton {
  constructor(n, t, i, r) {
    this._oSprite = i;
    this._oParentContainer = r;
    this._iScaleFactor = 1;
    this._aCbCompleted = [];
    this._aCbOwner = [];
    this._aParams = [];
    this._bDisabled = !1;
    this._bFocus = !1;
    this._iWidth = i.width;
    this._iHeight = i.height;
    this._oButton = new createjs.Container();
    this._oButton.x = n;
    this._oButton.y = t;
    this._oParentContainer.addChild(this._oButton);
    this._iStartX = n;
    this._iStartY = t;
    this._oButton.cursor = "pointer";
    this._aText = [];
    this._initListener();
    this._oSuper = CButton.prototype;
  }
  unload() {
    for (var n = 0; n < this._aText.length; n++) this._aText[n].unload();
    this._oButton.off("mousedown", this._oListenerMouseDown);
    this._oButton.off("pressup", this._oListenerMouseUp);
    this._oButton.off("pressmove", this._oListenerPressMove);
    this._oButton.removeAllChildren();
    this._oParentContainer.removeChild(this._oButton);
  }
  _initListener() {
    this._oListenerMouseDown = this._oButton.on("mousedown", this.buttonDown, this);
    this._oListenerMouseUp = this._oButton.on("pressup", this.buttonRelease, this);
  }
  _triggerEvent(n, t) {
    this._aCbCompleted[n] && this._aCbCompleted[n].call(this._aCbOwner[n], t);
  }
  addEventListener = function (n, t, i, r) {
    this._aCbCompleted[n] = t;
    this._aCbOwner[n] = i;
    this._aParams = r;
  };
  addEventListenerWithParams = function (n, t, i, r) {
    console.warn("addEventListenerWithParams is deprecated: use addEventListener instead");
    this._aCbCompleted[n] = t;
    this._aCbOwner[n] = i;
    this._aParams = r;
  };
  buttonRelease(n) {
    (n.stopPropagation(), this._bFocus) && (this._bDisabled || (this._releaseAnim(), this._triggerEvent(ON_MOUSE_UP, this._aParams)));
  }
  buttonDown(n) {
    (n.stopPropagation(), this._bDisabled) || (this._downAnim(), playSfxSound("click", 1, !1), this._bFocus = !0, this._oListenerPressMove = this._oButton.on("pressmove", this.pressMove, this), this._triggerEvent(ON_MOUSE_DOWN, this._aParams));
  }
  pressMove(n) {
    var t = this._oButton.globalToLocal(n.stageX, n.stageY);
    this._oButton.hitTest(t.x, t.y) || this.rollOut();
  }
  rollOut() {
    this._releaseAnim();
    this._oButton.off("pressmove", this._oListenerPressMove);
    this._bFocus = !1;
    this._triggerEvent(ON_MOUSE_OUT, this._aParams);
  }
  setVisible(n) {
    this._oButton.visible = n;
  }
  isVisible() {
    return this._oButton.visible;
  }
  setClickable(n) {
    this._bDisabled = !n;
  }
  enable() {
    this._oButton.cursor = "pointer";
    this._bDisabled = !1;
    this._oButton.alpha = 1;
  }
  disable() {
    this._oButton.cursor = "default";
    this._bDisabled = !0;
    this._oButton.alpha = .5;
  }
  setPosition(n, t) {
    this._iStartX = n;
    this._iStartY = t;
    this._oButton.x = n;
    this._oButton.y = t;
  }
  getPosition() {
    return {
      x: this._oButton.x,
      y: this._oButton.y
    };
  }
  setX(n) {
    this._oButton.x = n;
  }
  setY(n) {
    this._oButton.y = n;
  }
  setScale(n) {
    this._iScaleFactor = n;
    this._oButton.scale = n;
  }
  addAlert() {
    this._oAlert = new CAlertIcon(this._oSprite.width - 10, 10, "1", this._oButton);
    this._oAlert.pulseAnimation();
  }
  removeAlert() {
    this._oAlert !== null && this._oButton.removeChild(this._oAlert);
  }
  getContainer() {
    return this._oButton;
  }
  getBounds() {
    return this._oButton.getBounds();
  }
  getX() {
    return this._oButton.x;
  }
  getY() {
    return this._oButton.y;
  }
  pulseAnimation() {
    this._oTween = createjs.Tween.get(this._oButton, {
      loop: !0
    }).to({
      scale: this._iScaleFactor * .9
    }, 850, createjs.Ease.quadOut).to({
      scale: this._iScaleFactor
    }, 650, createjs.Ease.quadIn);
  }
  trembleAnimation() {
    this._oTween = createjs.Tween.get(this._oButton, {
      loop: !0
    }).to({
      rotation: 5
    }, 75, createjs.Ease.quadOut).to({
      rotation: -5
    }, 140, createjs.Ease.quadIn).to({
      rotation: 0
    }, 75, createjs.Ease.quadIn).wait(750);
  }
  stopTrembleAnimation() {
    this._oButton.rotation = 0;
    this._oButton.scale = this._iScaleFactor;
    createjs.Tween.removeTweens(this._oButton);
  }
  stopAnimation() {
    this._oButton.rotation = 0;
    this._oButton.scale = this._iScaleFactor;
    this._oButton.x = this._iStartX;
    this._oButton.y = this._iStartY;
    createjs.Tween.removeTweens(this._oButton);
  }
  jumpAnimation(n = "-y", t = 20, i = 600, r = 50) {
    this._iStartX = this._oButton.x;
    this._iStartY = this._oButton.y;
    var e = i / 2,
      u = {},
      f = {};
    switch (n) {
      case "-y":
        u.y = this._iStartY - t;
        f.y = this._iStartY;
        break;
      case "y":
        u.y = this._iStartY + t;
        f.y = this._iStartY;
        break;
      case "x":
        u.x = this._iStartX + t;
        f.x = this._iStartX;
        break;
      case "-x":
        u.x = this._iStartX - t;
        f.x = this._iStartX;
    }
    this._oTween = createjs.Tween.get(this._oButton, {
      loop: !0
    }).to(u, e, createjs.Ease.quadOut).to(f, e, createjs.Ease.quadIn).wait(r);
  }
  stopJumpAnimation() {
    createjs.Tween.removeTweens(this._oButton);
    this._oButton.x = this._iStartX;
    this._oButton.y = this._iStartY;
  }
  _downAnim() {
    createjs.Tween.get(this._oButton, {
      override: !0
    }).to({
      scale: this._iScaleFactor * .9
    }, 40);
  }
  _releaseAnim() {
    createjs.Tween.get(this._oButton, {
      override: !0
    }).to({
      scale: this._iScaleFactor
    }, 40);
  }
  addText(n, t, i, r, u, f, e, o) {
    var h = this._iWidth - (n.left + n.right),
      c = this._iHeight - (n.top + n.bottom),
      l = n.left - this._iWidth / 2,
      a = n.top - this._iHeight / 2,
      s = new CTLText(this._oButton, l, a, h, c, f, i, u, r, e, 0, 0, t, !0, !0, o, !1);
    return this._aText.push(s), s;
  }
  setTextSize(n, t) {
    var i = this._aText[n],
      r = this._iWidth - (t.left + t.right),
      u = this._iHeight - (t.top + t.bottom),
      f = t.left - this._iWidth / 2,
      e = t.top - this._iHeight / 2;
    i.setPosition(f, e);
    i.setSize(r, u);
  }
  addStroke(n, t, i) {
    this._aText[n].setStroke(t, i);
  }
  changeText(n, t) {
    this._aText[n].refreshText(t);
  }
  getTextFontSize(n) {
    return this._aText[n].getFontSize();
  }
  setTextFontSize(n, t) {
    this._aText[n].setFontSize(t);
  }
  getTextObj(n) {
    return this._aText[n];
  }
}
class CGfxButton extends CButton {
  constructor(n, t, i, r) {
    super(n, t, i, r);
    this._oButtonBg = createBitmap(i);
    this._oButtonBg.regX = this._iWidth / 2;
    this._oButtonBg.regY = this._iHeight / 2;
    this._oButton.addChild(this._oButtonBg);
  }
  setImageFromSpritesheet(n, t) {
    var i = n.getFrame(t);
    this._oSprite = i.image;
    this._oButtonBg.image = i.image;
    this._oButtonBg.sourceRect = i.rect;
  }
  getButtonImage() {
    return this._oButtonBg;
  }
}
class CButMenu extends CGfxButton {
  constructor(n, t, i, r, u) {
    super(n, t, i, r);
    u && (this._oIcon = createBitmap(u), this._oIcon.x = -250, this._oIcon.y = -4, this._oIcon.regX = u.width / 2, this._oIcon.regY = u.height / 2, this._oButton.addChild(this._oIcon));
  }
  setIconX(n) {
    this._oIcon.x = n;
  }
}
class CToggle extends CButton {
  constructor(n, t, i, r, u) {
    super(n, t, i, u);
    this._iWidth = i.width / 2;
    this._iHeight = i.height;
    var f = {
        images: [i],
        frames: {
          width: this._iWidth,
          height: this._iHeight,
          regX: this._iWidth / 2,
          regY: this._iHeight / 2
        },
        animations: {
          state_true: [0],
          state_false: [1]
        }
      },
      e = new createjs.SpriteSheet(f);
    this._bActive = r;
    this._oButtonSprite = createSprite(e, "state_" + this._bActive, i.width / 4, i.height / 2, i.width / 2, i.height);
    this._oButtonSprite.stop();
    this._oButton.addChild(this._oButtonSprite);
  }
  setActive(n) {
    this._bActive = n;
    this._oButtonSprite.gotoAndStop("state_" + this._bActive);
  }
  buttonRelease() {
    this._bFocus && (this._bDisabled || (this._releaseAnim(), this._bActive = !this._bActive, this._oButtonSprite.gotoAndStop("state_" + this._bActive), this._triggerEvent(ON_MOUSE_UP, this._aParams)));
  }
}
var ON_CONNECTION_ERROR = 0,
  ON_DISCONNECTION = 1,
  ON_DISCONNECTION_FROM_MATCH = 2,
  ON_LOGIN_SUCCESS = 3,
  ON_MATCHMAKING_CONNECTION_SUCCESS = 4,
  ON_GAMEROOM_CONNECTION_SUCCESS = 5,
  ON_USEROWNERROOM_CREATE_SUCCESS = 6,
  ON_USEROWNERROOM_JOIN_SUCCESS = 7,
  ON_ROOM_INFO_RETURNED = 8,
  ON_BACK_FROM_A_ROOM = 9,
  ON_FORFAIT_ANSWER = 20,
  ON_SPECTATE_GAME_START = 21,
  ERROR_CODE_UNKNOWNROOM = "UnknownRoom",
  ON_STATUS_ONLINE = "online",
  ON_STATUS_OFFLINE = "offline",
  ON_APPLICATION_QUIT = "app_quit",
  ROOM_TYPE_MATCHMAKING = "MatchmakingRoom",
  ROOM_TYPE_USEROWNER = "UserOwnerRoom",
  ROOM_TYPE_GAME = "GameRoom",
  WAITING_PLAYERS_TIMEOUT = 1e4,
  LAST_ROOM_STORAGE_KEY;
var MSG_ROOM_UPDATE = "room_update",
  MSG_ROOM_IS_FULL = "room_is_full",
  MSG_ROOM_EXPIRED = "room_expired",
  MSG_ROOM_PERMISSION_DENIED = "room_permission_denied",
  MSG_MATCHMAKING_CONNECTION_SUCCESS = "matchmaking_connection_success",
  MSG_GAME_FOUND = "game_found",
  MSG_PLAYER_LEFT_GAME = "player_left_game",
  MSG_OPPONENT_MOVES = "opponent_moves",
  MSG_REMATCH_ANSWER_RESULTS = "rematch_answer_results",
  MSG_NOTIFY_ACCEPT_REMATCH = "notify_accept_rematch",
  MSG_SHOW_EMOTICON = "show_emoticon",
  MSG_START_THE_GAME = "start_the_game",
  MSG_SPECTATE_THE_GAME = "spectate_the_game",
  MSG_USER_JOINED = "user_joined",
  MSG_SET_GAME_DATA = "set_game_data",
  MSG_OPPONENT_DICE_RESULTS = "opponent_dice_results",
  MSG_SURRENDER = "surrender",
  MSG_ASK_VICTORY = "ask_victory",
  MSG_DISCONNECTION = "disconnection",
  MSG_MOVE = "move",
  MSG_ROLL_DICE = "roll_dice",
  MSG_NEXT_TURN = "next_turn",
  MSG_END_MATCH = "end_match",
  MSG_ACCEPT_REMATCH = "accept_rematch",
  MSG_SEND_EMOTICON = "send_emoticon",
  MSG_CONTINUE_TO_PLAY = "continue_to_play",
  MSG_PLAYNOW = "play_now",
  MSG_PING = "ping",
  MSG_PLAYER_KICKED = "player_kicked",
  MSG_TIMER_CONTROL = "timer_control",
  MSG_ON_TIME_OVER = "on_time_over",
  MSG_PLAYER_AFK = "player_afk",
  MSG_PLAYER_RETURN_FROM_AFK = "player_return_from_afk",
  MSG_PLAYER_APPLICATION_QUIT = "player_app_quit";
CTLText.prototype = {
  constructor: CTLText,
  __autofit: function () {
    var r = this._szMsg,
      t = r.length < 3 ? !1 : this._bEllipsis,
      i,
      n;
    if (t && (this._oText.text = this._szMsg), !t && !this._bMultiline) {
      this.__autofitLight();
      return;
    }
    i = r.length - 2;
    n = this._iStartingFontSize;
    this.__refreshTextFont(n);
    for (var u = this._oText.getBounds(), f = this._iEffectiveWidth - this._iOutline, e = this._iEffectiveHeight - this._iOutline; u.height > e || u.width > f;) {
      if (t && n < this._iMinTextSize) {
        if (i--, this._oText.text = r.slice(0, i) + "...", this.__updateY(), this.__verticalAlign(), i == 1) break;
      } else if (n--, this.__refreshTextFont(n), this.__updateY(), this.__verticalAlign(), n < this._iMinTextSize && !t) break;
      u = this._oText.getBounds();
    }
    this._iFontSize = n;
    this.__updateY();
    this.__verticalAlign();
    this.__updateStroke();
  },
  __autofitLight: function () {
    this.__refreshTextFont(this._iStartingFontSize);
    var t = this._oText.getBounds(),
      i = this._iEffectiveWidth - this._iOutline,
      r = this._iEffectiveHeight - this._iOutline,
      u = Math.floor(this.__linearFunction(i, t.width, 0, this._iStartingFontSize, 0)),
      f = Math.floor(this.__linearFunction(r, t.height, 0, this._iStartingFontSize, 0)),
      n = Math.min(u, f);
    n > this._iStartingFontSize ? n = this._iStartingFontSize : n < this._iMinTextSize && (n = this._iMinTextSize);
    this.__refreshTextFont(n);
    this._iFontSize = n;
    this.__updateY();
    this.__verticalAlign();
    this.__updateStroke();
  },
  __linearFunction: function (n, t, i, r, u) {
    return (n - t) * (u - r) / (i - t) + r;
  },
  __checkAutofit: function () {
    this._bFitText ? this.__autofit() : (this.__refreshTextFont(this._iStartingFontSize), this.__updateY(), this.__verticalAlign(), this.__updateStroke());
  },
  __refreshTextFont: function (n) {
    this._oText.font = n + "px " + this._szFont;
    this._oText.lineHeight = Math.round(n * this._fLineHeightFactor);
  },
  __verticalAlign: function () {
    if (this._bVerticalAlign) {
      var n = this._oText.getBounds().height;
      this._oText.y -= (n - this._iHeight) / 2 + this._iPaddingV;
    }
  },
  __updateY: function () {
    this._oText.y = this._iPaddingV;
    switch (this._oText.textBaseline) {
      case "middle":
        this._oText.y += this._oText.lineHeight / 2 + (this._iFontSize * this._fLineHeightFactor - this._iFontSize);
    }
  },
  __updateStroke: function () {
    this._oStroke && (this._oStroke.x = this._oText.x, this._oStroke.y = this._oText.y, this._oStroke.text = this._oText.text, this._oStroke.font = this._oText.font, this._oStroke.textAlign = this._oText.textAlign, this._oStroke.lineHeight = this._oText.lineHeight);
  },
  __updateOutline: function () {
    this._iOutline = this._oStroke && this._oStroke.outline > this._oText.outline ? this._oStroke.outline : this._oText.outline;
  },
  __updateHorizontalAlign: function () {
    switch (this._szAlign) {
      case "center":
        this._oText.x = this._iWidth / 2;
        break;
      case "left":
        this._oText.x = this._iPaddingH;
        break;
      case "right":
        this._oText.x = this._iWidth - this._iPaddingH;
    }
  },
  __setMsg: function (n) {
    this._szMsg = n;
    this._szMsg !== "" && (this._szMsg || this._szMsg === 0) || (this._szMsg = " ");
  },
  __createDebugShape: function () {
    this._oDebugShape = new createjs.Shape();
    this.__refreshDebugShape();
  },
  __refreshDebugShape: function () {
    this._oDebugShape.graphics.clear();
    this._oDebugShape.graphics.beginFill("rgba(255,130,0,0.5)").drawRect(0, 0, this._iWidth, this._iHeight).moveTo(this._iPaddingH, this._iHeight - this._iPaddingV).lineTo(this._iWidth - this._iPaddingH, this._iHeight - this._iPaddingV).lineTo(this._iWidth - this._iPaddingH, this._iPaddingV).lineTo(this._iPaddingH, this._iPaddingV).closePath().beginFill("rgba(255,0,0,0.5)").drawRect(this._iPaddingH, this._iPaddingV, this._iEffectiveWidth, this._iEffectiveHeight);
  },
  __updateLineWidth: function () {
    this._oText.lineWidth = this._bMultiline ? this._iWidth - this._iPaddingH * 2 : null;
    this._oStroke && (this._oStroke.lineWidth = this._oText.lineWidth);
  },
  __updateWidth: function () {
    this.__updateLineWidth();
    this.__updateHorizontalAlign();
  },
  __updateSize: function () {
    this.__checkAutofit();
    this._bDebug && this.__refreshDebugShape();
  },
  __createText: function () {
    this._bDebug && (this.__createDebugShape(), this._oContainer.addChild(this._oDebugShape));
    this._oText = new createjs.Text(this._szMsg, this._iFontSize + "px " + this._szFont, this._szColor);
    this._oText.textBaseline = "middle";
    this._oText.lineHeight = Math.round(this._iFontSize * this._fLineHeightFactor);
    this._oText.textAlign = this._szAlign;
    this.__updateLineWidth();
    this.__updateHorizontalAlign();
    this._oContainer.addChild(this._oText);
    try {
      var i = s_oCanvas.getContext("2d"),
        t = !!window.WebGLRenderingContext && (s_oCanvas.getContext("webgl") || s_oCanvas.getContext("experimental-webgl")),
        n = t !== null;
      this._bMandatoryCache = n;
      this.setCacheActive(n);
    } catch (r) {
      this._bMandatoryCache = !1;
      this.setCacheActive(!1);
    }
    this.refreshText(this._szMsg);
  },
  setStroke: function (n, t) {
    this._oStroke || (this._oStroke = this._oText.clone(), this._oContainer.addChild(this._oStroke), this._oContainer.swapChildren(this._oStroke, this._oText));
    this.setStrokeColor(t ? t : this._szStrokeColor);
    this.setStrokeSize(n ? n : this._iStrokeSize);
    this.updateCache();
  },
  setStrokeColor: function (n) {
    this._szStrokeColor = n;
    this._oStroke && (this._oStroke.color = this._szStrokeColor, this.updateCache());
  },
  setStrokeSize: function (n) {
    this._iStrokeSize = n;
    this._oStroke && (this._oStroke.outline = this._iStrokeSize, this.__updateOutline(), this.__checkAutofit(), this.updateCache());
  },
  removeStroke: function () {
    this._oStroke && (this._oContainer.removeChild(this._oStroke), this._oStroke = null, this.__updateOutline(), this.__checkAutofit(), this.updateCache());
  },
  roll: function (n, t, i, r, u, f) {
    var e, o;
    t = t == null ? 1500 : t;
    i = i == null ? createjs.Ease.linear : i;
    e = {
      score: parseInt(this._szMsg)
    };
    this._szMsg = n;
    o = this._bFitText ? function () {
      this._oText.text = Math.floor(e.score);
      this.__autofitLight();
      this.updateCache();
    } : function () {
      this._oText.text = Math.floor(e.score);
      this.__updateY();
      this.__verticalAlign();
      this.__updateStroke();
      this.updateCache();
    };
    this.stopRolling();
    this._oTweenRollText = createjs.Tween.get(e, {
      override: !0
    }).to({
      score: n
    }, t, i);
    this._oTweenRollText.on("change", o, this);
    this._oTweenRollText.on("complete", function () {
      r && r.apply(u, f);
      this.stopRolling();
    }, this, !0);
  },
  isRolling: function () {
    return this._oTweenRollText == null ? !1 : !0;
  },
  stopRolling: function () {
    this.isRolling() && (this._oTweenRollText.removeAllEventListeners(), this._oTweenRollText.paused = !0, this._oTweenRollText = null);
  },
  pauseRolling: function () {
    this.isRolling() && (this._oTweenRollText.paused = !0);
  },
  resumeRolling: function () {
    this.isRolling() && (this._oTweenRollText.paused = !1);
  },
  setY: function (n) {
    this._oContainer.y = n;
  },
  setX: function (n) {
    this._oContainer.x = n;
  },
  setHorizontalSize: function (n, t = this._iPaddingH) {
    this.__setHorizontalSizeVars(n, t);
    this.__updateWidth();
    this.__updateSize();
    this._updateCacheSize();
  },
  setVerticalSize: function (n, t = this._iPaddingV) {
    this.__setVerticalSizeVars(n, t);
    this.__updateSize();
    this._updateCacheSize();
  },
  setSize: function (n, t, i = this._iPaddingH, r = this._iPaddingV) {
    this.__setHorizontalSizeVars(n, i);
    this.__setVerticalSizeVars(t, r);
    this.__updateWidth();
    this.__updateSize();
    this._updateCacheSize();
  },
  __setHorizontalSizeVars: function (n, t) {
    this._iWidth = n;
    this._iPaddingH = t;
    this._iEffectiveWidth = this._iWidth - this._iPaddingH * 2;
  },
  __setVerticalSizeVars: function (n, t) {
    this._iHeight = n;
    this._iPaddingV = t;
    this._iEffectiveHeight = this._iHeight - this._iPaddingV * 2;
  },
  setPosition: function (n, t) {
    this._oContainer.x = n;
    this._oContainer.y = t;
  },
  setHorizontalAlign: function (n) {
    this._szAlign = n;
    this._oText.textAlign = this._szAlign;
    this.__updateHorizontalAlign();
    this.__updateStroke();
    this.updateCache();
  },
  setVerticalAlign: function (n) {
    this._bVerticalAlign = n;
  },
  setOutline: function (n) {
    this._oText.outline = n;
    this.__updateOutline();
    this.updateCache();
  },
  setShadow: function (n, t, i, r) {
    console.warn("ON FIREFOX: When the text have a shadow and is/goes invisible, \n                        it cause a weird and increasing amount of workload on CPU and the game stuck. \n                            Consider use caching, or stroke instead");
    this._oText.shadow = new createjs.Shadow(n, t, i, r);
    this.updateCache();
  },
  setColor: function (n) {
    this._szColor = n;
    this._oText.color = this._szColor;
    this.updateCache();
  },
  setAlpha: function (n) {
    this._oContainer.alpha = n;
  },
  setVisible: function (n) {
    this._oContainer.visible = n;
  },
  setFontSize: function (n) {
    this._iFontSize = this._iStartingFontSize = n;
    this.refreshText(this._szMsg);
  },
  resetFontSize: function () {
    this.setFontSize(this._iOriginalFontSize);
  },
  setRegX: function (n) {
    this._oContainer.regX = n;
  },
  setRegY: function (n) {
    this._oContainer.regY = n;
  },
  setScale: function (n) {
    this._oContainer.scale = n;
  },
  setParentContainer: function (n) {
    n.contains(this._oContainer) || (this.removeContainerFromParent(), this._oParentContainer = n, this._oParentContainer.addChild(this._oContainer));
  },
  removeContainerFromParent: function () {
    this._oParentContainer && (this._oParentContainer.removeChild(this._oContainer), this._oParentContainer = null);
  },
  setCacheActive: function (n, t = 1) {
    var i = !1;
    (this._fCacheScale != t && n && (i = !0, this._oContainer.uncache()), i || !this._bMandatoryCache) && (this._fCacheScale = t, !this._bCacheActive && n || i ? this._oContainer.cache(0, 0, this.__nextPow2(this._iEffectiveWidth), this.__nextPow2(this._iEffectiveHeight), this._fCacheScale) : this._bCacheActive && !n && this._oContainer.uncache(), this._bCacheActive = n);
  },
  _updateCacheSize: function () {
    this._bCacheActive && (this._oContainer.uncache(), this._oContainer.cache(0, 0, this.__nextPow2(this._iEffectiveWidth), this.__nextPow2(this._iEffectiveHeight), this._fCacheScale));
  },
  __nextPow2: function (n) {
    var t = Math.floor(Math.log2(n));
    return Math.pow(2, t) === n ? n : Math.pow(2, t + 1);
  },
  updateCache: function () {
    this._bCacheActive && this._oContainer.updateCache();
  },
  removeTweens: function () {
    createjs.Tween.removeTweens(this._oContainer);
  },
  getText: function () {
    return this._oText;
  },
  getTextWidth: function () {
    return this._oText.getBounds().width + this._iOutline;
  },
  getTextHeight: function () {
    return this._oText.getBounds().height + this._iOutline;
  },
  getMsg: function () {
    return this._szMsg;
  },
  getX: function () {
    return this._oContainer.x;
  },
  getY: function () {
    return this._oContainer.y;
  },
  getHeight: function () {
    return this._iHeight;
  },
  getWidth: function () {
    return this._iWidth;
  },
  getPaddingH: function () {
    return this._iPaddingH;
  },
  getPaddingV: function () {
    return this._iPaddingV;
  },
  getColor: function () {
    return this._szColor;
  },
  getFontSize: function () {
    return this._iFontSize;
  },
  getContainer: function () {
    return this._oContainer;
  },
  unload: function () {
    this.stopRolling();
    this._bCacheActive && this._oContainer.uncache();
    createjs.Tween.removeTweens(this._oContainer);
    this.removeContainerFromParent();
  },
  refreshText: function (n) {
    this.__setMsg(n);
    this._oText.text = this._szMsg;
    this.__checkAutofit();
    this.updateCache();
  },
  checkParameters: function () {}
};
!function () {
  "use strict";

  function t(n) {
    return u(f(n), arguments);
  }
  function i(n, i) {
    return t.apply(null, [n].concat(i || []));
  }
  function u(i, r) {
    for (var y = 1, p = i.length, u, h = "", o, f, c, l, a, v, s, e = 0; e < p; e++) if (typeof i[e] == "string") h += i[e];else if (typeof i[e] == "object") {
      if (f = i[e], f.keys) for (u = r[y], o = 0; o < f.keys.length; o++) {
        if (u == undefined) throw new Error(t('[sprintf] Cannot access property "%s" of undefined value "%s"', f.keys[o], f.keys[o - 1]));
        u = u[f.keys[o]];
      } else u = f.param_no ? r[f.param_no] : r[y++];
      if (n.not_type.test(f.type) && n.not_primitive.test(f.type) && u instanceof Function && (u = u()), n.numeric_arg.test(f.type) && typeof u != "number" && isNaN(u)) throw new TypeError(t("[sprintf] expecting number but found %T", u));
      n.number.test(f.type) && (v = u >= 0);
      switch (f.type) {
        case "b":
          u = parseInt(u, 10).toString(2);
          break;
        case "c":
          u = String.fromCharCode(parseInt(u, 10));
          break;
        case "d":
        case "i":
          u = parseInt(u, 10);
          break;
        case "j":
          u = JSON.stringify(u, null, f.width ? parseInt(f.width) : 0);
          break;
        case "e":
          u = f.precision ? parseFloat(u).toExponential(f.precision) : parseFloat(u).toExponential();
          break;
        case "f":
          u = f.precision ? parseFloat(u).toFixed(f.precision) : parseFloat(u);
          break;
        case "g":
          u = f.precision ? String(Number(u.toPrecision(f.precision))) : parseFloat(u);
          break;
        case "o":
          u = (parseInt(u, 10) >>> 0).toString(8);
          break;
        case "s":
          u = String(u);
          u = f.precision ? u.substring(0, f.precision) : u;
          break;
        case "t":
          u = String(!!u);
          u = f.precision ? u.substring(0, f.precision) : u;
          break;
        case "T":
          u = Object.prototype.toString.call(u).slice(8, -1).toLowerCase();
          u = f.precision ? u.substring(0, f.precision) : u;
          break;
        case "u":
          u = parseInt(u, 10) >>> 0;
          break;
        case "v":
          u = u.valueOf();
          u = f.precision ? u.substring(0, f.precision) : u;
          break;
        case "x":
          u = (parseInt(u, 10) >>> 0).toString(16);
          break;
        case "X":
          u = (parseInt(u, 10) >>> 0).toString(16).toUpperCase();
      }
      n.json.test(f.type) ? h += u : (n.number.test(f.type) && (!v || f.sign) ? (s = v ? "+" : "-", u = u.toString().replace(n.sign, "")) : s = "", l = f.pad_char ? f.pad_char === "0" ? "0" : f.pad_char.charAt(1) : " ", a = f.width - (s + u).length, c = f.width ? a > 0 ? l.repeat(a) : "" : "", h += f.align ? s + u + c : l === "0" ? s + c + u : c + s + u);
    }
    return h;
  }
  function f(t) {
    if (r[t]) return r[t];
    for (var f = t, i, o = [], h = 0; f;) {
      if ((i = n.text.exec(f)) !== null) o.push(i[0]);else if ((i = n.modulo.exec(f)) !== null) o.push("%");else if ((i = n.placeholder.exec(f)) !== null) {
        if (i[2]) {
          h |= 1;
          var s = [],
            e = i[2],
            u = [];
          if ((u = n.key.exec(e)) !== null) {
            for (s.push(u[1]); (e = e.substring(u[0].length)) !== "";) if ((u = n.key_access.exec(e)) !== null) s.push(u[1]);else if ((u = n.index_access.exec(e)) !== null) s.push(u[1]);else throw new SyntaxError("[sprintf] failed to parse named argument key");
          } else throw new SyntaxError("[sprintf] failed to parse named argument key");
          i[2] = s;
        } else h |= 2;
        if (h === 3) throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported");
        o.push({
          placeholder: i[0],
          param_no: i[1],
          keys: i[2],
          sign: i[3],
          pad_char: i[4],
          align: i[5],
          width: i[6],
          precision: i[7],
          type: i[8]
        });
      } else throw new SyntaxError("[sprintf] unexpected placeholder");
      f = f.substring(i[0].length);
    }
    return r[t] = o;
  }
  var n = {
      not_string: /[^s]/,
      not_bool: /[^t]/,
      not_type: /[^T]/,
      not_primitive: /[^v]/,
      number: /[diefg]/,
      numeric_arg: /[bcdiefguxX]/,
      json: /[j]/,
      not_json: /[^j]/,
      text: /^[^\x25]+/,
      modulo: /^\x25{2}/,
      placeholder: /^\x25(?:([1-9]\d*)\$|\(([^)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijostTuvxX])/,
      key: /^([a-z_][a-z_\d]*)/i,
      key_access: /^\.([a-z_][a-z_\d]*)/i,
      index_access: /^\[(\d+)\]/,
      sign: /^[+-]/
    },
    r = Object.create(null);
  typeof exports != "undefined" && (exports.sprintf = t, exports.vsprintf = i);
  typeof window != "undefined" && (window.sprintf = t, window.vsprintf = i, typeof define == "function" && define.amd && define(function () {
    return {
      sprintf: t,
      vsprintf: i
    };
  }));
}(), function (n, t) {
  typeof exports == "object" && typeof module != "undefined" ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : function () {
    var r = n.Base64,
      i = t();
    i.noConflict = function () {
      return n.Base64 = r, i;
    };
    n.Meteor && (Base64 = i);
    n.Base64 = i;
  }();
}(typeof self != "undefined" ? self : typeof window != "undefined" ? window : typeof global != "undefined" ? global : this, function () {
  "use strict";

  var l = "3.7.2",
    st = l,
    ht = typeof atob == "function",
    ct = typeof btoa == "function",
    t = typeof Buffer == "function",
    a = typeof TextDecoder == "function" ? new TextDecoder() : undefined,
    v = typeof TextEncoder == "function" ? new TextEncoder() : undefined,
    r = Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="),
    f = function (n) {
      var t = {};
      return n.forEach(function (n, i) {
        return t[n] = i;
      }), t;
    }(r),
    lt = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,
    n = String.fromCharCode.bind(String),
    y = typeof Uint8Array.from == "function" ? Uint8Array.from.bind(Uint8Array) : function (n, t) {
      return t === void 0 && (t = function (n) {
        return n;
      }), new Uint8Array(Array.prototype.slice.call(n, 0).map(t));
    },
    p = function (n) {
      return n.replace(/=/g, "").replace(/[+\/]/g, function (n) {
        return n == "+" ? "-" : "_";
      });
    },
    w = function (n) {
      return n.replace(/[^A-Za-z0-9\+\/]/g, "");
    },
    b = function (n) {
      for (var t, e, o, s, u = "", f = n.length % 3, i = 0; i < n.length;) {
        if ((e = n.charCodeAt(i++)) > 255 || (o = n.charCodeAt(i++)) > 255 || (s = n.charCodeAt(i++)) > 255) throw new TypeError("invalid character found");
        t = e << 16 | o << 8 | s;
        u += r[t >> 18 & 63] + r[t >> 12 & 63] + r[t >> 6 & 63] + r[t & 63];
      }
      return f ? u.slice(0, f - 3) + "===".substring(f) : u;
    },
    o = ct ? function (n) {
      return btoa(n);
    } : t ? function (n) {
      return Buffer.from(n, "binary").toString("base64");
    } : b,
    s = t ? function (n) {
      return Buffer.from(n).toString("base64");
    } : function (t) {
      for (var r = 4096, u = [], i = 0, f = t.length; i < f; i += r) u.push(n.apply(null, t.subarray(i, i + r)));
      return o(u.join(""));
    },
    e = function (n, t) {
      return t === void 0 && (t = !1), t ? p(s(n)) : s(n);
    },
    at = function (t) {
      var i;
      return t.length < 2 ? (i = t.charCodeAt(0), i < 128 ? t : i < 2048 ? n(192 | i >>> 6) + n(128 | i & 63) : n(224 | i >>> 12 & 15) + n(128 | i >>> 6 & 63) + n(128 | i & 63)) : (i = 65536 + (t.charCodeAt(0) - 55296) * 1024 + (t.charCodeAt(1) - 56320), n(240 | i >>> 18 & 7) + n(128 | i >>> 12 & 63) + n(128 | i >>> 6 & 63) + n(128 | i & 63));
    },
    vt = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,
    k = function (n) {
      return n.replace(vt, at);
    },
    d = t ? function (n) {
      return Buffer.from(n, "utf8").toString("base64");
    } : v ? function (n) {
      return s(v.encode(n));
    } : function (n) {
      return o(k(n));
    },
    i = function (n, t) {
      return t === void 0 && (t = !1), t ? p(d(n)) : d(n);
    },
    g = function (n) {
      return i(n, !0);
    },
    yt = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,
    pt = function (t) {
      switch (t.length) {
        case 4:
          var r = (7 & t.charCodeAt(0)) << 18 | (63 & t.charCodeAt(1)) << 12 | (63 & t.charCodeAt(2)) << 6 | 63 & t.charCodeAt(3),
            i = r - 65536;
          return n((i >>> 10) + 55296) + n((i & 1023) + 56320);
        case 3:
          return n((15 & t.charCodeAt(0)) << 12 | (63 & t.charCodeAt(1)) << 6 | 63 & t.charCodeAt(2));
        default:
          return n((31 & t.charCodeAt(0)) << 6 | 63 & t.charCodeAt(1));
      }
    },
    nt = function (n) {
      return n.replace(yt, pt);
    },
    tt = function (t) {
      var i, u, e, o, r;
      if (t = t.replace(/\s+/g, ""), !lt.test(t)) throw new TypeError("malformed base64.");
      for (t += "==".slice(2 - (t.length & 3)), u = "", r = 0; r < t.length;) i = f[t.charAt(r++)] << 18 | f[t.charAt(r++)] << 12 | (e = f[t.charAt(r++)]) << 6 | (o = f[t.charAt(r++)]), u += e === 64 ? n(i >> 16 & 255) : o === 64 ? n(i >> 16 & 255, i >> 8 & 255) : n(i >> 16 & 255, i >> 8 & 255, i & 255);
      return u;
    },
    h = ht ? function (n) {
      return atob(w(n));
    } : t ? function (n) {
      return Buffer.from(n, "base64").toString("binary");
    } : tt,
    it = t ? function (n) {
      return y(Buffer.from(n, "base64"));
    } : function (n) {
      return y(h(n), function (n) {
        return n.charCodeAt(0);
      });
    },
    rt = function (n) {
      return it(ut(n));
    },
    wt = t ? function (n) {
      return Buffer.from(n, "base64").toString("utf8");
    } : a ? function (n) {
      return a.decode(it(n));
    } : function (n) {
      return nt(h(n));
    },
    ut = function (n) {
      return w(n.replace(/[-_]/g, function (n) {
        return n == "-" ? "+" : "/";
      }));
    },
    c = function (n) {
      return wt(ut(n));
    },
    bt = function (n) {
      if (typeof n != "string") return !1;
      var t = n.replace(/\s+/g, "").replace(/={0,2}$/, "");
      return !/[^\s0-9a-zA-Z\+/]/.test(t) || !/[^\s0-9a-zA-Z\-_]/.test(t);
    },
    ft = function (n) {
      return {
        value: n,
        enumerable: !1,
        writable: !0,
        configurable: !0
      };
    },
    et = function () {
      var n = function (n, t) {
        return Object.defineProperty(String.prototype, n, ft(t));
      };
      n("fromBase64", function () {
        return c(this);
      });
      n("toBase64", function (n) {
        return i(this, n);
      });
      n("toBase64URI", function () {
        return i(this, !0);
      });
      n("toBase64URL", function () {
        return i(this, !0);
      });
      n("toUint8Array", function () {
        return rt(this);
      });
    },
    ot = function () {
      var n = function (n, t) {
        return Object.defineProperty(Uint8Array.prototype, n, ft(t));
      };
      n("toBase64", function (n) {
        return e(this, n);
      });
      n("toBase64URI", function () {
        return e(this, !0);
      });
      n("toBase64URL", function () {
        return e(this, !0);
      });
    },
    kt = function () {
      et();
      ot();
    },
    u = {
      version: l,
      VERSION: st,
      atob: h,
      atobPolyfill: tt,
      btoa: o,
      btoaPolyfill: b,
      fromBase64: c,
      toBase64: i,
      encode: i,
      encodeURI: g,
      encodeURL: g,
      utob: k,
      btou: nt,
      decode: c,
      isValid: bt,
      fromUint8Array: e,
      toUint8Array: rt,
      extendString: et,
      extendUint8Array: ot,
      extendBuiltins: kt
    };
  return u.Base64 = {}, Object.keys(u).forEach(function (n) {
    return u.Base64[n] = u[n];
  }), u;
}), function (n, t) {
  typeof exports == "object" && typeof module != "undefined" ? module.exports = t(require("@popperjs/core")) : typeof define == "function" && define.amd ? define(["@popperjs/core"], t) : (n = n || self, n.tippy = t(n.Popper));
}(this, function (n) {
  "use strict";

  function vi(n) {
    var t = document.createElement("style"),
      i,
      r;
    t.textContent = n;
    t.setAttribute("data-tippy-stylesheet", "");
    i = document.head;
    r = document.querySelector("head>style,head>link");
    r ? i.insertBefore(t, r) : i.appendChild(t);
  }
  function bi(n, t) {
    return {}.hasOwnProperty.call(n, t);
  }
  function d(n, t, i) {
    if (Array.isArray(n)) {
      var r = n[t];
      return r == null ? Array.isArray(i) ? i[t] : i : r;
    }
    return n;
  }
  function g(n, t) {
    var i = {}.toString.call(n);
    return i.indexOf("[object") === 0 && i.indexOf(t + "]") > -1;
  }
  function ct(n, t) {
    return typeof n == "function" ? n.apply(void 0, t) : n;
  }
  function lt(n, t) {
    if (t === 0) return n;
    var i;
    return function (r) {
      clearTimeout(i);
      i = setTimeout(function () {
        n(r);
      }, t);
    };
  }
  function nt(n, t) {
    var i = Object.assign({}, n);
    return t.forEach(function (n) {
      delete i[n];
    }), i;
  }
  function ki(n) {
    return n.split(/\s+/).filter(Boolean);
  }
  function o(n) {
    return [].concat(n);
  }
  function at(n, t) {
    n.indexOf(t) === -1 && n.push(t);
  }
  function di(n) {
    return n.filter(function (t, i) {
      return n.indexOf(t) === i;
    });
  }
  function vt(n) {
    return n.split("-")[0];
  }
  function s(n) {
    return [].slice.call(n);
  }
  function gi(n) {
    return Object.keys(n).reduce(function (t, i) {
      return n[i] !== undefined && (t[i] = n[i]), t;
    }, {});
  }
  function e() {
    return document.createElement("div");
  }
  function l(n) {
    return ["Element", "Fragment"].some(function (t) {
      return g(n, t);
    });
  }
  function nr(n) {
    return g(n, "NodeList");
  }
  function tt(n) {
    return g(n, "MouseEvent");
  }
  function yt(n) {
    return !!(n && n._tippy && n._tippy.reference === n);
  }
  function tr(n) {
    return l(n) ? [n] : nr(n) ? s(n) : Array.isArray(n) ? n : s(document.querySelectorAll(n));
  }
  function it(n, t) {
    n.forEach(function (n) {
      n && (n.style.transitionDuration = t + "ms");
    });
  }
  function a(n, t) {
    n.forEach(function (n) {
      n && n.setAttribute("data-state", t);
    });
  }
  function pt(n) {
    var i,
      r = o(n),
      t = r[0];
    return (t == null ? void 0 : (i = t.ownerDocument) == null ? void 0 : i.body) ? t.ownerDocument : document;
  }
  function ir(n, t) {
    var i = t.clientX,
      r = t.clientY;
    return n.every(function (n) {
      var u = n.popperRect,
        o = n.popperState,
        s = n.props,
        f = s.interactiveBorder,
        e = vt(o.placement),
        t = o.modifiersData.offset;
      if (!t) return !0;
      var h = e === "bottom" ? t.top.y : 0,
        c = e === "top" ? t.bottom.y : 0,
        l = e === "right" ? t.left.x : 0,
        a = e === "left" ? t.right.x : 0,
        v = u.top - r + h > f,
        y = r - u.bottom - c > f,
        p = u.left - i + l > f,
        w = i - u.right - a > f;
      return v || y || p || w;
    });
  }
  function rt(n, t, i) {
    var r = t + "EventListener";
    ["transitionend", "webkitTransitionEnd"].forEach(function (t) {
      n[r](t, i);
    });
  }
  function rr() {
    r.isTouch || (r.isTouch = !0, window.performance && document.addEventListener("mousemove", bt));
  }
  function bt() {
    var n = performance.now();
    n - wt < 20 && (r.isTouch = !1, document.removeEventListener("mousemove", bt));
    wt = n;
  }
  function ur() {
    var n = document.activeElement,
      t;
    yt(n) && (t = n._tippy, n.blur && !t.state.isVisible && n.blur());
  }
  function fr() {
    document.addEventListener("touchstart", rr, f);
    window.addEventListener("blur", ur);
  }
  function h(n) {
    var t = n === "destroy" ? "n already-" : " ";
    return [n + "() was called on a" + t + "destroyed instance. This is a no-op but", "indicates a potential memory leak."].join(" ");
  }
  function kt(n) {
    return n.replace(/[ \t]{2,}/g, " ").replace(/^[ \t]*/gm, "").trim();
  }
  function er(n) {
    return kt("\n  %ctippy.js\n\n  %c" + kt(n) + "\n\n  %c👷‍ This is a development-only message. It will be removed in production.\n  ");
  }
  function dt(n) {
    return [er(n), "color: #00C584; font-size: 1.3em; font-weight: bold;", "line-height: 1.5", "color: #a6a095;"];
  }
  function or() {
    v = new Set();
  }
  function u(n, t) {
    if (n && !v.has(t)) {
      var i;
      v.add(t);
      (i = console).warn.apply(i, dt(t));
    }
  }
  function c(n, t) {
    if (n && !v.has(t)) {
      var i;
      v.add(t);
      (i = console).error.apply(i, dt(t));
    }
  }
  function sr(n) {
    var t = !n,
      i = Object.prototype.toString.call(n) === "[object Object]" && !n.addEventListener;
    c(t, ["tippy() was passed", "`" + String(n) + "`", "as its targets (first) argument. Valid types are: String, Element,", "Element[], or NodeList."].join(" "));
    c(i, "tippy() was passed a plain object which is not supported as an argument for virtual positioning. Use props.getReferenceClientRect instead.");
  }
  function ni(n) {
    var t = n.plugins || [],
      i = t.reduce(function (t, i) {
        var r = i.name,
          u = i.defaultValue;
        return r && (t[r] = n[r] !== undefined ? n[r] : u), t;
      }, {});
    return Object.assign({}, n, {}, i);
  }
  function lr(n, i) {
    var r = i ? Object.keys(ni(Object.assign({}, t, {
      plugins: i
    }))) : hr;
    return r.reduce(function (t, i) {
      var r = (n.getAttribute("data-tippy-" + i) || "").trim();
      if (!r) return t;
      if (i === "content") t[i] = r;else try {
        t[i] = JSON.parse(r);
      } catch (u) {
        t[i] = r;
      }
      return t;
    }, {});
  }
  function ti(n, i) {
    var r = Object.assign({}, i, {
      content: ct(i.content, [n])
    }, i.ignoreAttributes ? {} : lr(n, i.plugins));
    return r.aria = Object.assign({}, t.aria, {}, r.aria), r.aria = {
      expanded: r.aria.expanded === "auto" ? i.interactive : r.aria.expanded,
      content: r.aria.content === "auto" ? i.interactive ? null : "describedby" : r.aria.content
    }, r;
  }
  function ii(n, i) {
    n === void 0 && (n = {});
    i === void 0 && (i = []);
    var r = Object.keys(n);
    r.forEach(function (n) {
      var f = nt(t, Object.keys(gt)),
        r = !bi(f, n);
      r && (r = i.filter(function (t) {
        return t.name === n;
      }).length === 0);
      u(r, ["`" + n + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's", "a plugin, forgot to pass it in an array as props.plugins.", "\n\n", "All props: https://atomiks.github.io/tippyjs/v6/all-props/\n", "Plugins: https://atomiks.github.io/tippyjs/v6/plugins/"].join(" "));
    });
  }
  function ut(n, t) {
    n[ri()] = t;
  }
  function ui(n) {
    var t = e();
    return n === !0 ? t.className = st : (t.className = ht, l(n) ? t.appendChild(n) : ut(t, n)), t;
  }
  function fi(n, t) {
    l(t.content) ? (ut(n, ""), n.appendChild(t.content)) : typeof t.content != "function" && (t.allowHTML ? ut(n, t.content) : n.textContent = t.content);
  }
  function p(n) {
    var i = n.firstElementChild,
      t = s(i.children);
    return {
      box: i,
      content: t.find(function (n) {
        return n.classList.contains(et);
      }),
      arrow: t.find(function (n) {
        return n.classList.contains(st) || n.classList.contains(ht);
      }),
      backdrop: t.find(function (n) {
        return n.classList.contains(ot);
      })
    };
  }
  function ei(n) {
    function u(t, i) {
      var e = p(r),
        u = e.box,
        o = e.content,
        f = e.arrow;
      i.theme ? u.setAttribute("data-theme", i.theme) : u.removeAttribute("data-theme");
      typeof i.animation == "string" ? u.setAttribute("data-animation", i.animation) : u.removeAttribute("data-animation");
      i.inertia ? u.setAttribute("data-inertia", "") : u.removeAttribute("data-inertia");
      u.style.maxWidth = typeof i.maxWidth == "number" ? i.maxWidth + "px" : i.maxWidth;
      i.role ? u.setAttribute("role", i.role) : u.removeAttribute("role");
      (t.content !== i.content || t.allowHTML !== i.allowHTML) && fi(o, n.props);
      i.arrow ? f ? t.arrow !== i.arrow && (u.removeChild(f), u.appendChild(ui(i.arrow))) : u.appendChild(ui(i.arrow)) : f && u.removeChild(f);
    }
    var r = e(),
      t = e(),
      i;
    return t.className = wi, t.setAttribute("data-state", "hidden"), t.setAttribute("tabindex", "-1"), i = e(), i.className = et, i.setAttribute("data-state", "hidden"), fi(i, n.props), r.appendChild(t), t.appendChild(i), u(n.props, n.props), {
      popper: r,
      onUpdate: u
    };
  }
  function vr(i, l) {
    function tr() {
      var n = v.props.touch;
      return Array.isArray(n) ? n : [n, 0];
    }
    function rr() {
      return tr()[0] === "hold";
    }
    function g() {
      var n;
      return !!((n = v.props.render) == null ? void 0 : n.$$tippy);
    }
    function ut() {
      return ai || i;
    }
    function st() {
      var n = ut().parentNode;
      return n ? pt(n) : document;
    }
    function ht() {
      return p(y);
    }
    function ur(n) {
      return v.state.isMounted && !v.state.isVisible || r.isTouch || yt && yt.type === "focus" ? 0 : d(v.props.delay, n ? 0 : 1, t.delay);
    }
    function wt() {
      y.style.pointerEvents = v.props.interactive && v.state.isVisible ? "" : "none";
      y.style.zIndex = "" + v.props.zIndex;
    }
    function k(n, t, i) {
      if (i === void 0 && (i = !0), bi.forEach(function (i) {
        i[n] && i[n].apply(void 0, t);
      }), i) {
        var r;
        (r = v.props)[n].apply(r, t);
      }
    }
    function fr() {
      var r = v.props.aria;
      if (r.content) {
        var n = "aria-" + r.content,
          t = y.id,
          u = o(v.props.triggerTarget || i);
        u.forEach(function (i) {
          var r = i.getAttribute(n),
            u;
          v.state.isVisible ? i.setAttribute(n, r ? r + " " + t : t) : (u = r && r.replace(t, "").trim(), u ? i.setAttribute(n, u) : i.removeAttribute(n));
        });
      }
    }
    function vt() {
      if (!nr && v.props.aria.expanded) {
        var n = o(v.props.triggerTarget || i);
        n.forEach(function (n) {
          v.props.interactive ? n.setAttribute("aria-expanded", v.state.isVisible && n === ut() ? "true" : "false") : n.removeAttribute("aria-expanded");
        });
      }
    }
    function ui() {
      st().removeEventListener("mousemove", nt);
      w = w.filter(function (n) {
        return n !== nt;
      });
    }
    function bt(n) {
      if ((!r.isTouch || !gt && n.type !== "mousedown") && (!v.props.interactive || !y.contains(n.target))) {
        if (ut().contains(n.target)) {
          if (r.isTouch) return;
          if (v.state.isVisible && v.props.trigger.indexOf("click") >= 0) return;
        } else k("onClickOutside", [v, n]);
        v.props.hideOnClick === !0 && (v.clearDelayTimeouts(), v.hide(), dt = !0, setTimeout(function () {
          dt = !1;
        }), v.state.isMounted || fi());
      }
    }
    function er() {
      gt = !0;
    }
    function or() {
      gt = !1;
    }
    function sr() {
      var n = st();
      n.addEventListener("mousedown", bt, !0);
      n.addEventListener("touchend", bt, f);
      n.addEventListener("touchstart", or, f);
      n.addEventListener("touchmove", er, f);
    }
    function fi() {
      var n = st();
      n.removeEventListener("mousedown", bt, !0);
      n.removeEventListener("touchend", bt, f);
      n.removeEventListener("touchstart", or, f);
      n.removeEventListener("touchmove", er, f);
    }
    function tu(n, t) {
      hr(n, function () {
        !v.state.isVisible && y.parentNode && y.parentNode.contains(y) && t();
      });
    }
    function iu(n, t) {
      hr(n, t);
    }
    function hr(n, t) {
      function r(n) {
        n.target === i && (rt(i, "remove", r), t());
      }
      var i = ht().box;
      if (n === 0) return t();
      rt(i, "remove", ci);
      rt(i, "add", r);
      ci = r;
    }
    function et(n, t, r) {
      r === void 0 && (r = !1);
      var u = o(v.props.triggerTarget || i);
      u.forEach(function (i) {
        i.addEventListener(n, t, r);
        ri.push({
          node: i,
          eventType: n,
          handler: t,
          options: r
        });
      });
    }
    function cr() {
      rr() && (et("touchstart", vr, {
        passive: !0
      }), et("touchend", pr, {
        passive: !0
      }));
      ki(v.props.trigger).forEach(function (n) {
        if (n !== "manual") {
          et(n, vr);
          switch (n) {
            case "mouseenter":
              et("mouseleave", pr);
              break;
            case "focus":
              et(pi ? "focusout" : "blur", wr);
              break;
            case "focusin":
              et("focusout", wr);
          }
        }
      });
    }
    function lr() {
      ri.forEach(function (n) {
        var t = n.node,
          i = n.eventType,
          r = n.handler,
          u = n.options;
        t.removeEventListener(i, r, u);
      });
      ri = [];
    }
    function vr(n) {
      var i,
        t = !1,
        r;
      !v.state.isEnabled || br(n) || dt || (r = ((i = yt) == null ? void 0 : i.type) === "focus", yt = n, ai = n.currentTarget, vt(), !v.state.isVisible && tt(n) && w.forEach(function (t) {
        return t(n);
      }), n.type === "click" && (v.props.trigger.indexOf("mouseenter") < 0 || ot) && v.props.hideOnClick !== !1 && v.state.isVisible ? t = !0 : gr(n), n.type === "click" && (ot = !t), t && !r && kt(n));
    }
    function yr(n) {
      var t = n.target,
        r = ut().contains(t) || y.contains(t),
        i;
      n.type === "mousemove" && r || (i = ei().concat(y).map(function (n) {
        var t,
          r = n._tippy,
          i = (t = r.popperInstance) == null ? void 0 : t.state;
        return i ? {
          popperRect: n.getBoundingClientRect(),
          popperState: i,
          props: ft
        } : null;
      }).filter(Boolean), ir(i, n) && (ui(), kt(n)));
    }
    function pr(n) {
      var t = br(n) || v.props.trigger.indexOf("click") >= 0 && ot;
      if (!t) {
        if (v.props.interactive) {
          v.hideWithInteractivity(n);
          return;
        }
        kt(n);
      }
    }
    function wr(n) {
      v.props.trigger.indexOf("focusin") < 0 && n.target !== ut() || v.props.interactive && n.relatedTarget && y.contains(n.relatedTarget) || kt(n);
    }
    function br(n) {
      return r.isTouch ? rr() !== n.type.indexOf("touch") >= 0 : !1;
    }
    function kr() {
      dr();
      var t = v.props,
        u = t.popperOptions,
        o = t.placement,
        s = t.offset,
        f = t.getReferenceClientRect,
        h = t.moveTransition,
        e = g() ? p(y).arrow : null,
        c = f ? {
          getBoundingClientRect: f,
          contextElement: f.contextElement || ut()
        } : i,
        l = {
          name: "$$tippy",
          enabled: !0,
          phase: "beforeWrite",
          requires: ["computeStyles"],
          fn: function (n) {
            var i = n.state,
              r,
              t;
            g() && (r = ht(), t = r.box, ["placement", "reference-hidden", "escaped"].forEach(function (n) {
              n === "placement" ? t.setAttribute("data-placement", i.placement) : i.attributes.popper["data-popper-" + n] ? t.setAttribute("data-" + n, "") : t.removeAttribute("data-" + n);
            }), i.attributes.popper = {});
          }
        },
        r = [{
          name: "offset",
          options: {
            offset: s
          }
        }, {
          name: "preventOverflow",
          options: {
            padding: {
              top: 2,
              bottom: 2,
              left: 5,
              right: 5
            }
          }
        }, {
          name: "flip",
          options: {
            padding: 5
          }
        }, {
          name: "computeStyles",
          options: {
            adaptive: !h
          }
        }, l];
      g() && e && r.push({
        name: "arrow",
        options: {
          element: e,
          padding: 3
        }
      });
      r.push.apply(r, (u == null ? void 0 : u.modifiers) || []);
      v.popperInstance = n.createPopper(c, y, Object.assign({}, u, {
        placement: o,
        onFirstUpdate: li,
        modifiers: r
      }));
    }
    function dr() {
      v.popperInstance && (v.popperInstance.destroy(), v.popperInstance = null);
    }
    function ru() {
      var n = v.props.appendTo,
        i,
        r = ut();
      i = v.props.interactive && n === t.appendTo || n === "parent" ? r.parentNode : ct(n, [r]);
      i.contains(y) || i.appendChild(y);
      kr();
      u(v.props.interactive && n === t.appendTo && r.nextElementSibling !== y, "Interactive tippy element may not be accessible via keyboard navigation because it is not directly after the reference element in the DOM source order. \n\n Using a wrapper <div> or <span> tag around the reference element solves this by creating a new parentNode context. \n\n Specifying `appendTo: document.body` silences this warning, but it assumes you are using a focus management solution to handle keyboard navigation. \n\n See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity");
    }
    function ei() {
      return s(y.querySelectorAll("[data-tippy-root]"));
    }
    function gr(n) {
      v.clearDelayTimeouts();
      n && k("onTrigger", [v, n]);
      sr();
      var t = ur(!0),
        i = tr(),
        f = i[0],
        u = i[1];
      r.isTouch && f === "hold" && u && (t = u);
      t ? oi = setTimeout(function () {
        v.show();
      }, t) : v.show();
    }
    function kt(n) {
      if (v.clearDelayTimeouts(), k("onUntrigger", [v, n]), !v.state.isVisible) {
        fi();
        return;
      }
      if (!(v.props.trigger.indexOf("mouseenter") >= 0) || !(v.props.trigger.indexOf("click") >= 0) || !(["mouseleave", "mousemove"].indexOf(n.type) >= 0) || !ot) {
        var t = ur(!1);
        t ? si = setTimeout(function () {
          v.state.isVisible && v.hide();
        }, t) : hi = requestAnimationFrame(function () {
          v.hide();
        });
      }
    }
    function uu() {
      v.state.isEnabled = !0;
    }
    function fu() {
      v.hide();
      v.state.isEnabled = !1;
    }
    function eu() {
      clearTimeout(oi);
      clearTimeout(si);
      cancelAnimationFrame(hi);
    }
    function ou(n) {
      if (u(v.state.isDestroyed, h("setProps")), !v.state.isDestroyed) {
        k("onBeforeUpdate", [v, n]);
        lr();
        var r = v.props,
          t = ti(i, Object.assign({}, v.props, {}, n, {
            ignoreAttributes: !0
          }));
        v.props = t;
        cr();
        r.interactiveDebounce !== t.interactiveDebounce && (ui(), nt = lt(yr, t.interactiveDebounce));
        r.triggerTarget && !t.triggerTarget ? o(r.triggerTarget).forEach(function (n) {
          n.removeAttribute("aria-expanded");
        }) : t.triggerTarget && i.removeAttribute("aria-expanded");
        vt();
        wt();
        wi && wi(r, t);
        v.popperInstance && (kr(), ei().forEach(function (n) {
          requestAnimationFrame(n._tippy.popperInstance.forceUpdate);
        }));
        k("onAfterUpdate", [v, n]);
      }
    }
    function su(n) {
      v.setProps({
        content: n
      });
    }
    function hu() {
      u(v.state.isDestroyed, h("show"));
      var f = v.state.isVisible,
        e = v.state.isDestroyed,
        o = !v.state.isEnabled,
        s = r.isTouch && !v.props.touch,
        n = d(v.props.duration, 0, t.duration);
      if (!f && !e && !o && !s && !ut().hasAttribute("disabled") && (k("onShow", [v], !1), v.props.onShow(v) !== !1)) {
        if (v.state.isVisible = !0, g() && (y.style.visibility = "visible"), wt(), sr(), v.state.isMounted || (y.style.transition = "none"), g()) {
          var i = ht(),
            c = i.box,
            l = i.content;
          it([c, l], 0);
        }
        li = function () {
          var t;
          if (v.state.isVisible && !ii) {
            if (ii = !0, void y.offsetHeight, y.style.transition = v.props.moveTransition, g() && v.props.animation) {
              var i = ht(),
                r = i.box,
                u = i.content;
              it([r, u], n);
              a([r, u], "visible");
            }
            fr();
            vt();
            at(b, v);
            (t = v.popperInstance) == null ? void 0 : t.forceUpdate();
            v.state.isMounted = !0;
            k("onMount", [v]);
            v.props.animation && g() && iu(n, function () {
              v.state.isShown = !0;
              k("onShown", [v]);
            });
          }
        };
        ru();
      }
    }
    function cu() {
      u(v.state.isDestroyed, h("hide"));
      var e = !v.state.isVisible,
        o = v.state.isDestroyed,
        s = !v.state.isEnabled,
        n = d(v.props.duration, 1, t.duration);
      if (!e && !o && !s && (k("onHide", [v], !1), v.props.onHide(v) !== !1)) {
        if (v.state.isVisible = !1, v.state.isShown = !1, ii = !1, ot = !1, g() && (y.style.visibility = "hidden"), ui(), fi(), wt(), g()) {
          var i = ht(),
            r = i.box,
            f = i.content;
          v.props.animation && (it([r, f], n), a([r, f], "hidden"));
        }
        fr();
        vt();
        v.props.animation ? g() && tu(n, v.unmount) : v.unmount();
      }
    }
    function lu(n) {
      u(v.state.isDestroyed, h("hideWithInteractivity"));
      st().addEventListener("mousemove", nt);
      at(w, nt);
      nt(n);
    }
    function au() {
      (u(v.state.isDestroyed, h("unmount")), v.state.isVisible && v.hide(), v.state.isMounted) && (dr(), ei().forEach(function (n) {
        n._tippy.unmount();
      }), y.parentNode && y.parentNode.removeChild(y), b = b.filter(function (n) {
        return n !== v;
      }), v.state.isMounted = !1, k("onHidden", [v]));
    }
    function vu() {
      (u(v.state.isDestroyed, h("destroy")), v.state.isDestroyed) || (v.clearDelayTimeouts(), v.unmount(), lr(), delete i._tippy, v.state.isDestroyed = !0, k("onDestroy", [v]));
    }
    var ft = ti(i, Object.assign({}, t, {}, ni(gi(l)))),
      oi,
      si,
      hi,
      ot = !1,
      dt = !1,
      gt = !1,
      ii = !1,
      yt,
      ci,
      li,
      ri = [],
      nt = lt(yr, ft.interactiveDebounce),
      ai,
      nu = ar++,
      vi = di(ft.plugins),
      v = {
        id: nu,
        reference: i,
        popper: e(),
        popperInstance: null,
        props: ft,
        state: {
          isEnabled: !0,
          isVisible: !1,
          isDestroyed: !1,
          isMounted: !1,
          isShown: !1
        },
        plugins: vi,
        clearDelayTimeouts: eu,
        setProps: ou,
        setContent: su,
        show: hu,
        hide: cu,
        hideWithInteractivity: lu,
        enable: uu,
        disable: fu,
        unmount: au,
        destroy: vu
      },
      bi,
      nr;
    if (!ft.render) return c(!0, "render() function has not been supplied."), v;
    var yi = ft.render(v),
      y = yi.popper,
      wi = yi.onUpdate;
    return y.setAttribute("data-tippy-root", ""), y.id = "tippy-" + v.id, v.popper = y, i._tippy = v, y._tippy = v, bi = vi.map(function (n) {
      return n.fn(v);
    }), nr = i.hasAttribute("aria-expanded"), cr(), vt(), wt(), k("onCreate", [v]), ft.showOnCreate && gr(), y.addEventListener("mouseenter", function () {
      v.props.interactive && v.state.isVisible && v.clearDelayTimeouts();
    }), y.addEventListener("mouseleave", function (n) {
      v.props.interactive && v.props.trigger.indexOf("mouseenter") >= 0 && (st().addEventListener("mousemove", nt), nt(n));
    }), v;
  }
  function i(n, i) {
    var r, f;
    i === void 0 && (i = {});
    r = t.plugins.concat(i.plugins || []);
    sr(n);
    ii(i, r);
    fr();
    var e = Object.assign({}, i, {
        plugins: r
      }),
      o = tr(n),
      s = l(e.content),
      h = o.length > 1;
    return u(s && h, "tippy() was passed an Element as the `content` prop, but more than one tippy instance was created by this invocation. This means the content element will only be appended to the last tippy instance. \n\n Instead, pass the .innerHTML of the element, or use a function that returns a cloned version of the element instead. \n\n 1) content: element.innerHTML\n 2) content: () => element.cloneNode(true)"), f = o.reduce(function (n, t) {
      var i = t && vr(t, e);
      return i && n.push(i), n;
    }, []), l(n) ? f[0] : f;
  }
  function kr(n, r) {
    function e(n) {
      var f, o, e;
      n.target && !l && (f = n.target.closest(p), f) && ((o = f.getAttribute("data-tippy-trigger") || r.trigger || t.trigger, f._tippy) || (n.type !== "touchstart" || typeof v.touch != "boolean") && (n.type !== "touchstart" && o.indexOf(br[n.type]) < 0 || (e = i(f, v), e && (u = u.concat(e)))));
    }
    function s(n, t, i, r) {
      r === void 0 && (r = !1);
      n.addEventListener(t, i, r);
      h.push({
        node: n,
        eventType: t,
        handler: i,
        options: r
      });
    }
    function k(n) {
      var t = n.reference;
      s(t, "touchstart", e, f);
      s(t, "mouseover", e);
      s(t, "focusin", e);
      s(t, "click", e);
    }
    function d() {
      h.forEach(function (n) {
        var t = n.node,
          i = n.eventType,
          r = n.handler,
          u = n.options;
        t.removeEventListener(i, r, u);
      });
      h = [];
    }
    function g(n) {
      var t = n.destroy,
        i = n.enable,
        r = n.disable;
      n.destroy = function (n) {
        n === void 0 && (n = !0);
        n && u.forEach(function (n) {
          n.destroy();
        });
        u = [];
        d();
        t();
      };
      n.enable = function () {
        i();
        u.forEach(function (n) {
          return n.enable();
        });
        l = !1;
      };
      n.disable = function () {
        r();
        u.forEach(function (n) {
          return n.disable();
        });
        l = !0;
      };
      k(n);
    }
    c(!(r && r.target), "You must specity a `target` prop indicating a CSS selector string matching the target elements that should receive a tippy.");
    var h = [],
      u = [],
      l = !1,
      p = r.target,
      a = nt(r, ["target"]),
      w = Object.assign({}, a, {
        trigger: "manual",
        touch: !1
      }),
      v = Object.assign({}, a, {
        showOnCreate: !0
      }),
      y = i(n, w),
      b = o(y);
    return b.forEach(g), y;
  }
  function dr() {
    var n = e();
    return n.className = ot, a([n], "hidden"), n;
  }
  function si(n) {
    var t = n.clientX,
      i = n.clientY;
    k = {
      clientX: t,
      clientY: i
    };
  }
  function gr(n) {
    n.addEventListener("mousemove", si);
  }
  function nu(n) {
    n.removeEventListener("mousemove", si);
  }
  function tu(n, t) {
    var i;
    return {
      popperOptions: Object.assign({}, n.popperOptions, {
        modifiers: [].concat((((i = n.popperOptions) == null ? void 0 : i.modifiers) || []).filter(function (n) {
          var i = n.name;
          return i !== t.name;
        }), [t])
      })
    };
  }
  function iu(n, t, i, r) {
    if (i.length < 2 || n === null) return t;
    if (i.length === 2 && r >= 0 && i[0].left > i[1].right) return i[r] || t;
    switch (n) {
      case "top":
      case "bottom":
        var u = i[0],
          f = i[i.length - 1],
          o = n === "top",
          s = u.top,
          h = f.bottom,
          c = o ? u.left : f.left,
          l = o ? u.right : f.right,
          k = l - c,
          d = h - s;
        return {
          top: s,
          bottom: h,
          left: c,
          right: l,
          width: k,
          height: d
        };
      case "left":
      case "right":
        var a = Math.min.apply(Math, i.map(function (n) {
            return n.left;
          })),
          v = Math.max.apply(Math, i.map(function (n) {
            return n.right;
          })),
          e = i.filter(function (t) {
            return n === "left" ? t.left === a : t.right === v;
          }),
          y = e[0].top,
          p = e[e.length - 1].bottom,
          w = a,
          b = v,
          g = b - w,
          nt = p - y;
        return {
          top: y,
          bottom: p,
          left: w,
          right: b,
          width: g,
          height: nt
        };
      default:
        return t;
    }
  }
  function ai(n, t) {
    return n && t ? n.top !== t.top || n.right !== t.right || n.bottom !== t.bottom || n.left !== t.left : !0;
  }
  var ft = typeof window != "undefined" && typeof document != "undefined",
    yi = ft ? navigator.userAgent : "",
    pi = /MSIE |Trident\//.test(yi),
    wi = "tippy-box",
    et = "tippy-content",
    ot = "tippy-backdrop",
    st = "tippy-arrow",
    ht = "tippy-svg-arrow",
    f = {
      passive: !0,
      capture: !0
    },
    r = {
      isTouch: !1
    },
    wt = 0,
    v,
    ri,
    oi,
    k,
    y,
    hi,
    ci,
    li;
  or();
  var gt = {
      animateFill: !1,
      followCursor: !1,
      inlinePositioning: !1,
      sticky: !1
    },
    t = Object.assign({
      appendTo: function () {
        return document.body;
      },
      aria: {
        content: "auto",
        expanded: "auto"
      },
      delay: 0,
      duration: [300, 250],
      getReferenceClientRect: null,
      hideOnClick: !0,
      ignoreAttributes: !1,
      interactive: !1,
      interactiveBorder: 2,
      interactiveDebounce: 0,
      moveTransition: "",
      offset: [0, 10],
      onAfterUpdate: function () {},
      onBeforeUpdate: function () {},
      onCreate: function () {},
      onDestroy: function () {},
      onHidden: function () {},
      onHide: function () {},
      onMount: function () {},
      onShow: function () {},
      onShown: function () {},
      onTrigger: function () {},
      onUntrigger: function () {},
      onClickOutside: function () {},
      placement: "top",
      plugins: [],
      popperOptions: {},
      render: null,
      showOnCreate: !1,
      touch: !0,
      trigger: "mouseenter focus",
      triggerTarget: null
    }, gt, {}, {
      allowHTML: !1,
      animation: "fade",
      arrow: !0,
      content: "",
      inertia: !1,
      maxWidth: 350,
      role: "tooltip",
      theme: "",
      zIndex: 9999
    }),
    hr = Object.keys(t),
    cr = function (n) {
      ii(n, []);
      var i = Object.keys(n);
      i.forEach(function (i) {
        t[i] = n[i];
      });
    };
  ri = function () {
    return "innerHTML";
  };
  ei.$$tippy = !0;
  var ar = 1,
    w = [],
    b = [];
  i.defaultProps = t;
  i.setDefaultProps = cr;
  i.currentInput = r;
  var yr = function (n) {
      var i = n === void 0 ? {} : n,
        t = i.exclude,
        r = i.duration;
      b.forEach(function (n) {
        var i = !1,
          u;
        t && (i = yt(t) ? n.reference === t : n.popper === t.popper);
        i || (u = n.props.duration, n.setProps({
          duration: r
        }), n.hide(), n.state.isDestroyed || n.setProps({
          duration: u
        }));
      });
    },
    pr = Object.assign({}, n.applyStyles, {
      effect: function (n) {
        var t = n.state,
          i = {
            popper: {
              position: t.options.strategy,
              left: "0",
              top: "0",
              margin: "0"
            },
            arrow: {
              position: "absolute"
            },
            reference: {}
          };
        Object.assign(t.elements.popper.style, i.popper);
        t.styles = i;
        t.elements.arrow && Object.assign(t.elements.arrow.style, i.arrow);
      }
    }),
    wr = function (n, t) {
      function p() {
        u = o.map(function (n) {
          return n.reference;
        });
      }
      function l(n) {
        o.forEach(function (t) {
          n ? t.enable() : t.disable();
        });
      }
      function w(n) {
        return o.map(function (t) {
          var i = t.setProps;
          return t.setProps = function (r) {
            i(r);
            t.reference === f && n.setProps(r);
          }, function () {
            t.setProps = i;
          };
        });
      }
      function s(n, t) {
        var r = u.indexOf(t),
          i;
        t !== f && (f = t, i = (a || []).concat("content").reduce(function (n, t) {
          return n[t] = o[r].props[t], n;
        }, {}), n.setProps(Object.assign({}, i, {
          getReferenceClientRect: typeof i.getReferenceClientRect == "function" ? i.getReferenceClientRect : function () {
            return t.getBoundingClientRect();
          }
        })));
      }
      var v, b;
      t === void 0 && (t = {});
      c(!Array.isArray(n), ["The first argument passed to createSingleton() must be an array of", "tippy instances. The passed value was", String(n)].join(" "));
      var o = n,
        u = [],
        f,
        a = t.overrides,
        y = [],
        h = !1;
      l(!1);
      p();
      var k = {
          fn: function () {
            return {
              onDestroy: function () {
                l(!0);
              },
              onHidden: function () {
                f = null;
              },
              onClickOutside: function (n) {
                n.props.showOnCreate && !h && (h = !0, f = null);
              },
              onShow: function (n) {
                n.props.showOnCreate && !h && (h = !0, s(n, u[0]));
              },
              onTrigger: function (n, t) {
                s(n, t.currentTarget);
              }
            };
          }
        },
        r = i(e(), Object.assign({}, nt(t, ["overrides"]), {
          plugins: [k].concat(t.plugins || []),
          triggerTarget: u,
          popperOptions: Object.assign({}, t.popperOptions, {
            modifiers: [].concat(((v = t.popperOptions) == null ? void 0 : v.modifiers) || [], [pr])
          })
        })),
        d = r.show;
      return r.show = function (n) {
        if (d(), !f && n == null) return s(r, u[0]);
        if (!f || n != null) {
          if (typeof n == "number") return u[n] && s(r, u[n]);
          if (o.includes(n)) {
            var t = n.reference;
            return s(r, t);
          }
          if (u.includes(n)) return s(r, n);
        }
      }, r.showNext = function () {
        var t = u[0],
          n;
        if (!f) return r.show(0);
        n = u.indexOf(f);
        r.show(u[n + 1] || t);
      }, r.showPrevious = function () {
        var n = u[u.length - 1],
          t,
          i;
        if (!f) return r.show(n);
        t = u.indexOf(f);
        i = u[t - 1] || n;
        r.show(i);
      }, b = r.setProps, r.setProps = function (n) {
        a = n.overrides || a;
        b(n);
      }, r.setInstances = function (n) {
        l(!0);
        y.forEach(function (n) {
          return n();
        });
        o = n;
        l(!1);
        p();
        w(r);
        r.setProps({
          triggerTarget: u
        });
      }, y = w(r), r;
    },
    br = {
      mouseover: "mouseenter",
      focusin: "focus",
      click: "click"
    };
  return oi = {
    name: "animateFill",
    defaultValue: !1,
    fn: function (n) {
      var r;
      if (!((r = n.props.render) == null ? void 0 : r.$$tippy)) return c(n.props.animateFill, "The `animateFill` plugin requires the default render function."), {};
      var u = p(n.popper),
        i = u.box,
        f = u.content,
        t = n.props.animateFill ? dr() : null;
      return {
        onCreate: function () {
          t && (i.insertBefore(t, i.firstElementChild), i.setAttribute("data-animatefill", ""), i.style.overflow = "hidden", n.setProps({
            arrow: !1,
            animation: "shift-away"
          }));
        },
        onMount: function () {
          if (t) {
            var n = i.style.transitionDuration,
              r = Number(n.replace("ms", ""));
            f.style.transitionDelay = Math.round(r / 10) + "ms";
            t.style.transitionDuration = n;
            a([t], "visible");
          }
        },
        onShow: function () {
          t && (t.style.transitionDuration = "0ms");
        },
        onHide: function () {
          t && a([t], "hidden");
        }
      };
    }
  }, k = {
    clientX: 0,
    clientY: 0
  }, y = [], hi = {
    name: "followCursor",
    defaultValue: !1,
    fn: function (n) {
      function s() {
        return n.props.followCursor === "initial" && n.state.isVisible;
      }
      function h() {
        t.addEventListener("mousemove", e);
      }
      function c() {
        t.removeEventListener("mousemove", e);
      }
      function l() {
        r = !0;
        n.setProps({
          getReferenceClientRect: null
        });
        r = !1;
      }
      function e(t) {
        var o = t.target ? i.contains(t.target) : !0,
          r = n.props.followCursor,
          u = t.clientX,
          f = t.clientY,
          e = i.getBoundingClientRect(),
          s = u - e.left,
          h = f - e.top;
        (o || !n.props.interactive) && n.setProps({
          getReferenceClientRect: function () {
            var n = i.getBoundingClientRect(),
              t = u,
              e = f;
            r === "initial" && (t = n.left + s, e = n.top + h);
            var o = r === "horizontal" ? n.top : e,
              c = r === "vertical" ? n.right : t,
              l = r === "horizontal" ? n.bottom : e,
              a = r === "vertical" ? n.left : t;
            return {
              width: c - a,
              height: l - o,
              top: o,
              right: c,
              bottom: l,
              left: a
            };
          }
        });
      }
      function a() {
        n.props.followCursor && (y.push({
          instance: n,
          doc: t
        }), gr(t));
      }
      function v() {
        y = y.filter(function (t) {
          return t.instance !== n;
        });
        y.filter(function (n) {
          return n.doc === t;
        }).length === 0 && nu(t);
      }
      var i = n.reference,
        t = pt(n.props.triggerTarget || i),
        r = !1,
        u = !1,
        f = !0,
        o = n.props;
      return {
        onCreate: a,
        onDestroy: v,
        onBeforeUpdate: function () {
          o = n.props;
        },
        onAfterUpdate: function (t, i) {
          var f = i.followCursor;
          r || f !== undefined && o.followCursor !== f && (v(), f ? (a(), !n.state.isMounted || u || s() || h()) : (c(), l()));
        },
        onMount: function () {
          n.props.followCursor && !u && (f && (e(k), f = !1), s() || h());
        },
        onTrigger: function (n, t) {
          tt(t) && (k = {
            clientX: t.clientX,
            clientY: t.clientY
          });
          u = t.type === "focus";
        },
        onHidden: function () {
          n.props.followCursor && (l(), c(), f = !0);
        }
      };
    }
  }, ci = {
    name: "inlinePositioning",
    defaultValue: !1,
    fn: function (n) {
      function e() {
        return !!n.props.inlinePositioning;
      }
      function h(n) {
        return iu(vt(n), r.getBoundingClientRect(), s(r.getClientRects()), t);
      }
      function c(t) {
        i = !0;
        n.setProps(t);
        i = !1;
      }
      function f() {
        i || c(tu(n.props, o));
      }
      var r = n.reference,
        u,
        t = -1,
        i = !1,
        o = {
          name: "tippyInlinePositioning",
          enabled: !0,
          phase: "afterWrite",
          fn: function (t) {
            var i = t.state;
            e() && (u !== i.placement && n.setProps({
              getReferenceClientRect: function () {
                return h(i.placement);
              }
            }), u = i.placement);
          }
        };
      return {
        onCreate: f,
        onAfterUpdate: f,
        onTrigger: function (i, r) {
          if (tt(r)) {
            var u = s(n.reference.getClientRects()),
              f = u.find(function (n) {
                return n.left - 2 <= r.clientX && n.right + 2 >= r.clientX && n.top - 2 <= r.clientY && n.bottom + 2 >= r.clientY;
              });
            t = u.indexOf(f);
          }
        },
        onUntrigger: function () {
          t = -1;
        }
      };
    }
  }, li = {
    name: "sticky",
    defaultValue: !1,
    fn: function (n) {
      function o() {
        return n.popperInstance ? n.popperInstance.state.elements.reference : f;
      }
      function t(t) {
        return n.props.sticky === !0 || n.props.sticky === t;
      }
      function u() {
        var f = t("reference") ? o().getBoundingClientRect() : null,
          s = t("popper") ? e.getBoundingClientRect() : null;
        (f && ai(i, f) || s && ai(r, s)) && n.popperInstance && n.popperInstance.update();
        i = f;
        r = s;
        n.state.isMounted && requestAnimationFrame(u);
      }
      var f = n.reference,
        e = n.popper,
        i = null,
        r = null;
      return {
        onMount: function () {
          n.props.sticky && u();
        }
      };
    }
  }, ft && vi('.tippy-box[data-animation=fade][data-state=hidden]{opacity:0}[data-tippy-root]{max-width:calc(100vw - 10px)}.tippy-box{position:relative;background-color:#333;color:#fff;border-radius:4px;font-size:14px;line-height:1.4;outline:0;transition-property:transform,visibility,opacity}.tippy-box[data-placement^=top]>.tippy-arrow{bottom:0}.tippy-box[data-placement^=top]>.tippy-arrow:before{bottom:-7px;left:0;border-width:8px 8px 0;border-top-color:initial;transform-origin:center top}.tippy-box[data-placement^=bottom]>.tippy-arrow{top:0}.tippy-box[data-placement^=bottom]>.tippy-arrow:before{top:-7px;left:0;border-width:0 8px 8px;border-bottom-color:initial;transform-origin:center bottom}.tippy-box[data-placement^=left]>.tippy-arrow{right:0}.tippy-box[data-placement^=left]>.tippy-arrow:before{border-width:8px 0 8px 8px;border-left-color:initial;right:-7px;transform-origin:center left}.tippy-box[data-placement^=right]>.tippy-arrow{left:0}.tippy-box[data-placement^=right]>.tippy-arrow:before{left:-7px;border-width:8px 8px 8px 0;border-right-color:initial;transform-origin:center right}.tippy-box[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-arrow{width:16px;height:16px;color:#333}.tippy-arrow:before{content:"";position:absolute;border-color:transparent;border-style:solid}.tippy-content{position:relative;padding:5px 9px;z-index:1}'), i.setDefaultProps({
    plugins: [oi, hi, ci, li],
    render: ei
  }), i.createSingleton = wr, i.delegate = kr, i.hideAll = yr, i.roundArrow = '<svg width="16" height="6" xmlns="http://www.w3.org/2000/svg"><path d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"><\/svg>', i;
});
LOCALSTORAGE_SKIN_ID = "skin_id";
s_iSkinID = 1;
const MIN_TIME_PRELOADER = 3500;
class CMainBase {
  constructor(n) {
    n.hasOwnProperty("check_orientation") && (ENABLE_CHECK_ORIENTATION = n.check_orientation);
    ENABLE_FULLSCREEN = !isIOS() && n.hasOwnProperty("fullscreen") ? n.fullscreen : !1;
    this._oData = n;
    this._bUpdate = !0;
    this._iCurResource = 0;
    this.RESOURCE_TO_LOAD = 0;
    this._iState = STATE_LOADING;
    this._oPreloader;
    this._oMenu;
    this._oGame;
    s_oCanvas = document.getElementById("canvas");
    s_oStage = typeof STAGE_GL != "undefined" && STAGE_GL ? new createjs.StageGL(s_oCanvas, {
      antialias: !0
    }) : new createjs.Stage(s_oCanvas);
    createjs.Touch.enable(s_oStage, !0);
    s_oStage.preventSelection = !1;
    s_bMobile = isMobile();
    s_bMobile === !1 && s_oStage.enableMouseOver(20);
    s_iPrevTime = new Date().getTime();
    createjs.Ticker.addEventListener("tick", this._update.bind(this));
    createjs.Ticker.framerate = FPS;
    navigator.userAgent.match(/Windows Phone/i) && (DISABLE_SOUND_MOBILE = !0);
    s_oSpriteLibrary = new CSpriteLibrary();
    var t = (navigator.language || "en").split("-")[0].toLowerCase();
    console.log("iLang " + t);
    LANG_LIST.includes(t) || (t = LANG_EN);
    s_szCurLang = t;
    console.log("s_szCurLang " + s_szCurLang);
    refreshLanguage();
    s_oMain = this;
    this._initPreloader();
  }
  _initPreloader() {
    this._oPreloader = new CPreloader();
  }
  soundLoaded() {
    this._iCurResource++;
    var n = Math.floor(this._iCurResource / this.RESOURCE_TO_LOAD * 100);
    this._oPreloader.refreshLoader(n);
  }
  _initSounds(n, t) {
    var i, r;
    for (s_aSoundsInfo = [], i = 0; i < n.length; i++) s_aSoundsInfo.push({
      path: n[i].path,
      filename: n[i].filename,
      loop: n[i].loop,
      volume: n[i].volume,
      ingamename: n[i].ingamename
    });
    for (this.RESOURCE_TO_LOAD += s_aSoundsInfo.length, s_aSounds = [], r = 0; r < s_aSoundsInfo.length; r++) s_oMain.tryToLoadSound(s_aSoundsInfo[r], !1);
    for (s_aMusicInfo = [], i = 0; i < t.length; i++) s_aMusicInfo.push({
      path: t[i].path,
      filename: t[i].filename,
      loop: t[i].loop,
      volume: t[i].volume,
      ingamename: t[i].ingamename
    });
    for (this.RESOURCE_TO_LOAD += s_aMusicInfo.length, s_aMusic = [], r = 0; r < s_aMusicInfo.length; r++) s_oMain.tryToLoadMusic(s_aMusicInfo[r], !1);
  }
  tryToLoadSound(n, t) {
    setTimeout(function () {
      s_aSounds[n.ingamename] = new Howl({
        src: [n.path + n.filename + ".mp3"],
        autoplay: !1,
        preload: !0,
        html5: isMac(),
        loop: n.loop,
        volume: n.volume,
        onload: s_oMain.soundLoaded.bind(s_oMain),
        onloaderror: function (id, reason) {
          document.querySelector("#block_game").style.display = "none";
          console.error("Local audio failed", id, reason);
        },
        onplayerror: function (n) {
          for (var t = 0; t < s_aSoundsInfo.length; t++) if (n === s_aSounds[s_aSoundsInfo[t].ingamename]._sounds[0]._id) {
            s_aSounds[s_aSoundsInfo[t].ingamename].once("unlock", function () {
              s_aSounds[s_aSoundsInfo[t].ingamename].play();
            });
            break;
          }
        }
      });
    }, t ? 200 : 0);
  }
  tryToLoadMusic(n, t) {
    setTimeout(function () {
      s_aMusic[n.ingamename] = new Howl({
        src: [n.path + n.filename + ".mp3"],
        autoplay: !1,
        preload: !0,
        html5: isMac(),
        loop: n.loop,
        volume: n.volume,
        onload: s_oMain.soundLoaded.bind(s_oMain),
        onloaderror: function (n) {
          for (var t = 0; t < s_aMusicInfo.length; t++) if (s_aMusic[s_aMusicInfo[t].ingamename]._sounds.length > 0 && n === s_aMusic[s_aMusicInfo[t].ingamename]._sounds[0]._id) {
            s_oMain.tryToLoadMusic(s_aMusicInfo[t], !0);
            break;
          } else document.querySelector("#block_game").style.display = "none";
        },
        onplayerror: function (n) {
          for (var t = 0; t < s_aMusicInfo.length; t++) if (n === s_aMusic[s_aMusicInfo[t].ingamename]._sounds[0]._id) {
            s_aMusic[s_aMusicInfo[t].ingamename].once("unlock", function () {
              s_aMusicInfo[t].ingamename.indexOf("soundtrack") !== -1 && (s_aMusic[s_aMusicInfo[t].ingamename].play(), s_oGame !== null && setMusicVolume("soundtrack", SOUNDTRACK_VOLUME_IN_GAME));
            });
            break;
          }
        }
      });
    }, t ? 200 : 0);
  }
  _loadImages(n) {
    s_oSpriteLibrary.init(this._onImagesLoaded.bind(this), this._onAllImagesLoaded.bind(this), this);
    for (var t = 0; t < n.length; t++) s_oSpriteLibrary.addSprite(n[t].key, n[t].path);
    this.RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
    s_oSpriteLibrary.loadSprites();
  }
  _onImagesLoaded() {
    this._iCurResource++;
    var n = Math.floor(this._iCurResource / this.RESOURCE_TO_LOAD * 100);
    this._oPreloader.refreshLoader(n);
  }
  _onAllImagesLoaded() {}
  preloaderReady(n, t, i) {
    s_oMain._loadImages(n);
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && s_oMain._initSounds(t, i);
    this._bUpdate = !0;
  }
  onRemovePreloader() {
    s_oGuiController = new CGUI();
    s_oGuiController.hideRestartBut();
    muteAllSfx(!s_bSfxActive);
    muteAllMusic(!s_bMusicActive);
    this._oPreloader.unload();
  }
  getState() {
    return this._iState;
  }
  getScreenRelativeFolder() {
    var n = "";
    switch (SCREEN_MODE) {
      case SCREEN_MODE_PORTRAIT:
      case SCREEN_MODE_LANDSCAPE:
        n = SCREEN_MODE + "/";
    }
    return n;
  }
  gotoMenu() {
    this._oMenu = new CMenu();
    this._iState = STATE_MENU;
  }
  gotoGame() {
    this._oGame = new CGame(this._oData);
    this._iState = STATE_GAME;
  }
  stopUpdate() {
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (muteAllSfx(!0), muteAllMusic(!0), void 0);
    s_bMultiplayer || (this._bUpdate = !1, createjs.Ticker.paused = !0, $("#block_game").css("display", "block"));
  }
  startUpdate() {
    (DISABLE_SOUND_MOBILE === !1 || s_bMobile === !1) && (s_bSfxActive && muteAllSfx(!1), s_bMusicActive && muteAllMusic(!1), void 0);
    s_iPrevTime = new Date().getTime();
    this._bUpdate = !0;
    createjs.Ticker.paused = !1;
    $("#block_game").css("display", "none");
    s_oGuiController && !s_oGuiController.isSidebarOpen() && s_oGuiController.showSidebarButton();
  }
  _update(n) {
    if (this._bUpdate !== !1) {
      var t = new Date().getTime();
      s_iTimeElaps = t - s_iPrevTime;
      s_iCntTime += s_iTimeElaps;
      s_iCntFps++;
      s_iPrevTime = t;
      s_iCntTime >= 1e3 && (s_iCurFps = s_iCntFps, s_iCntTime -= 1e3, s_iCntFps = 0);
      switch (this._iState) {
        case STATE_LOADING:
          this._oPreloader && this._oPreloader.update();
          break;
        case STATE_GAME:
          s_oGame.update();
      }
      s_oStage.update(n);
    }
  }
}
var s_bMobile,
  s_bFullscreen = !1,
  s_bMultiplayer = !1,
  s_iCntTime = 0,
  s_iTimeElaps = 0,
  s_iPrevTime = 0,
  s_iCntFps = 0,
  s_iCurFps = 0,
  s_oAdsLevel = 1,
  s_oCanvas,
  s_oStage,
  s_oMain,
  s_oGame = null,
  s_oSpriteLibrary,
  s_oSoundTrack = null,
  s_oGuiController,
  s_szCurLang = DEFAULT_LANG,
  s_szCurVers = "1.00",
  INVITE_LINK = "",
  ENABLE_FULLSCREEN = !1,
  ENABLE_CHECK_ORIENTATION = !1;
class CMain extends CMainBase {
  constructor(n) {
    var t, i, u, r, f;
    for (super(n), s_szCurVers = "2.00", this._aSfx = [], this._aSfx.push({
      path: "./sounds/",
      filename: "press_button",
      loop: !1,
      volume: 1,
      ingamename: "click"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "game_over",
      loop: !1,
      volume: 1,
      ingamename: "game_over"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "win",
      loop: !1,
      volume: 1,
      ingamename: "win"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "click_cell",
      loop: !1,
      volume: 1,
      ingamename: "click_cell"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "dices",
      loop: !1,
      volume: 1,
      ingamename: "dices"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "positive_beep",
      loop: !1,
      volume: 1,
      ingamename: "positive_beep"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "negative_beep",
      loop: !1,
      volume: 1,
      ingamename: "negative_beep"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "match_found",
      loop: !1,
      volume: 1,
      ingamename: "match_found"
    }), this._aSfx.push({
      path: "./sounds/",
      filename: "hurryup",
      loop: !1,
      volume: 1,
      ingamename: "hurryup"
    }), t = 0; t < NUM_EMOTICONS; t++) this._aSfx.push({
      path: "./sounds/emoticons/",
      filename: "sfx_emote_" + t,
      loop: !1,
      volume: 1,
      ingamename: "sfx_emote_" + t
    });
    for (this._aMusic = [], this._aImages = [], this._aImages.push({
      key: "msg_box",
      path: "./sprites/msg_box.png"
    }), this._aImages.push({
      key: "alert_box",
      path: "./sprites/alert_box.png"
    }), this._aImages.push({
      key: "but_long",
      path: "./sprites/but_long.png"
    }), this._aImages.push({
      key: "icon_multiplayer",
      path: "./sprites/icon_multiplayer.png"
    }), this._aImages.push({
      key: "icon_local",
      path: "./sprites/icon_local.png"
    }), this._aImages.push({
      key: "icon_training",
      path: "./sprites/icon_training.png"
    }), this._aImages.push({
      key: "logo_ar",
      path: "./sprites/logo_ar.png"
    }), this._aImages.push({
      key: "logo_en",
      path: "./sprites/logo_en.png"
    }), this._aImages.push({
      key: "logo_hi",
      path: "./sprites/logo_hi.png"
    }), this._aImages.push({
      key: "logo_ja",
      path: "./sprites/logo_ja.png"
    }), this._aImages.push({
      key: "logo_pt",
      path: "./sprites/logo_pt.png"
    }), this._aImages.push({
      key: "logo_ru",
      path: "./sprites/logo_ru.png"
    }), this._aImages.push({
      key: "logo_tr",
      path: "./sprites/logo_tr.png"
    }), this._aImages.push({
      key: "logo_zh",
      path: "./sprites/logo_zh.png"
    }), this._aImages.push({
      key: "but_restart",
      path: "./sprites/but_restart.png"
    }), this._aImages.push({
      key: "but_home",
      path: "./sprites/but_home.png"
    }), this._aImages.push({
      key: "bg_turn",
      path: "./sprites/bg_turn.png"
    }), this._aImages.push({
      key: "but_bearoff",
      path: "./sprites/but_bearoff.png"
    }), this._aImages.push({
      key: "but_dice",
      path: "./sprites/but_dice.png"
    }), this._aImages.push({
      key: "label_white",
      path: "./sprites/label_white.png"
    }), this._aImages.push({
      key: "label_black",
      path: "./sprites/label_black.png"
    }), this._aImages.push({
      key: "but_emoticon",
      path: "./sprites/but_emoticon.png"
    }), this._aImages.push({
      key: "emoticon_panel",
      path: "./sprites/emoticons/emoticon_panel.png"
    }), t = 0; t < NUM_EMOTICONS; t++) for (this._aImages.push({
      key: "but_emoticon_" + t,
      path: "./sprites/emoticons/but_emoticon_" + t + ".png"
    }), i = 0; i < 30; i++) this._aImages.push({
      key: "emoticon_" + t + "_" + i,
      path: "./sprites/emoticons/emoticon_" + t + "/emoticon_" + t + "_" + i + ".png"
    });
    for (this._aImages.push({
      key: "but_mute",
      path: "./sprites/emoticons/but_mute.png"
    }), this._aImages.push({
      key: "highlight",
      path: "./sprites/highlight.png"
    }), this._aImages.push({
      key: "hinge",
      path: "./sprites/hinge.png"
    }), this._aImages.push({
      key: "board_occlusion",
      path: "./sprites/board_occlusion.png"
    }), u = this.getAllSkinResources(), r = 0; r < u.length; r++) this._aImages.push({
      key: u[r].name,
      path: u[r].path
    });
    f = this.getScreenRelativeFolder();
    this._aImages.push({
      key: "bg_menu",
      path: "./sprites/" + f + "bg_menu.jpg"
    });
    this._aImages.push({
      key: "bg_game",
      path: "./sprites/" + f + "bg_game.jpg"
    });
    MULTIPLIER_SCORE = 100;
    s_oLocalStorage = new CLocalStorage(GAME_NAME);
    void 0;
  }
  preloaderReady() {
    super.preloaderReady(this._aImages, this._aSfx, this._aMusic);
  }
  onRemovePreloader() {
    super.onRemovePreloader();
    s_oGuiController.addEventListener(CGUI.ON_CHANGE_SKIN, this._onSkinToggle, this);
    s_oMain.gotoMenu();
  }
  gotoMenu() {
    super.gotoMenu();
    s_oGuiController.hideRestartBut();
    s_oGuiController.hideResignButton();
    s_oGuiController.hideVictoryRequestBut();
  }
  gotoGame() {
    s_oGame = new CGameSingle(this._oData);
    this._iState = STATE_GAME;
  }
  _onSkinToggle(n) {
    s_iSkinID = n;
    s_oLocalStorage.saveData();
    this._iState === STATE_GAME && s_oGame && s_oGame.changeSkin();
  }
  getAllSkinResources() {
    for (var t, i, n, r = [], f = ["white", "black"], u = 0; u < SKIN_CONFIG.length; u++) {
      for (t = SKIN_CONFIG[u].piece_set.name, i = 0; i < f.length; i++) n = "piece_" + f[i], r.push({
        name: n + "_" + t,
        path: "./sprites/skin/pieces/" + t + "/" + n + ".png"
      });
      for (t = SKIN_CONFIG[u].board.name, n = "board_bg", r.push({
        name: n + "_" + t,
        path: "./sprites/skin/boards/" + t + "/" + n + ".jpg"
      }), n = "board_h_line", r.push({
        name: n + "_" + t,
        path: "./sprites/skin/boards/" + t + "/" + n + ".png"
      }), n = "board_v_line", r.push({
        name: n + "_" + t,
        path: "./sprites/skin/boards/" + t + "/" + n + ".png"
      }), t = SKIN_CONFIG[u].dice.name, i = 0; i < f.length; i++) n = "dice_" + f[i], r.push({
        name: n + "_" + t,
        path: "./sprites/skin/dices/" + t + "/" + n + ".png"
      });
      for (t = SKIN_CONFIG[u].selection.name, i = 0; i < f.length; i++) n = "triangle_" + i, r.push({
        name: n + "_" + t,
        path: "./sprites/skin/selections/" + t + "/" + n + ".png"
      });
    }
    return r;
  }
}
s_bStorageAvailable = !0;
s_szGameID = "9PP66HV970NQ";
s_oMenu = null;
CGameBase = function () {
  this._bStartGame;
  this._bPieceMoving;
  this._iNumTurns;
  this._iScore;
  this._oInterface;
  this._oEndPanel;
  this._iCurPlayer;
  this._iStartingPlayer;
  this._iDice1;
  this._iDice2;
  this._bDice1;
  this._bDice2;
  this._bDoubleDice;
  this._iNumDiceAvailable;
  this._bCpuTurned;
  this._oAlertBox;
  this._oThinking;
  this._aRuleToCheck;
  this._iCPUTimeout;
  this._iSkipTurnTimeout;
  this._szWhiteName;
  this._szBlackName;
  this._oBoard;
  this._oCurMove;
  this._oMovingPiece;
  this._oAI;
  this._oSuper = CGameBase.prototype;
  this._init();
  s_oGame = this;
};
CGameBase.prototype._init = function () {
  this.reset();
  var n = createBitmap(s_oSpriteLibrary.getSprite("bg_game"));
  s_oStage.addChild(n);
  this._oScreenContainer = new createjs.Container();
  s_oStage.addChild(this._oScreenContainer);
  this._oGeneralContainer = new createjs.Container();
  this._oScreenContainer.addChild(this._oGeneralContainer);
  this._oInfoPanelContainer = new createjs.Container();
  this._oScreenContainer.addChild(this._oInfoPanelContainer);
  this._oBoard = new CBoard(0, 0, this._oGeneralContainer, this._oInfoPanelContainer);
  this._oBoard.addEventListener(ON_END_DISTRIBUTION, this._onAfterDistribution, this);
  this._oBoard.addEventListener(ON_CLICK_ON_PIECE, this.onClickedPiece, this);
  this._oBoard.addEventListener(ON_CLICK_ON_BEAROFF, this.onClickedTriangle, this);
  this._oBoard.addEventListener(ON_CLICK_ON_TRIANGLE, this.onClickedTriangle, this);
  this._oBoard.addEventListener(ON_END_MOVE_PIECE, this._onEndMovePiece, this);
  this._oAlertBox = new CAlertBox(s_oStage);
  this._oInterface = new CInterface(this._oInfoPanelContainer);
  this._bWhiteBotSide = !0;
  this._oAI = new CAI(this);
  s_oGuiController.hideLangButton();
  s_oGuiController.showMainMenuBut();
  void 0;
  s_oGuiController.addEventListener(CGUI.ON_GOTO_MAIN_MENU, this.onConfirmExit, this);
};
CGameBase.prototype.refreshPos = function () {
  var t, n;
  s_bLandscape ? (t = 50, this._oInfoPanelContainer.scale = 1) : (t = 550, this._oInfoPanelContainer.scale = INTERFACE_PORTRAIT_SCALING);
  this._oBoard.refreshSize(60, t);
  this._oInterface.refreshButtonPos(this._oBoard.getTableBounds());
  n = this._getLayoutBounds();
  this._oScreenContainer.setBounds(n.x, n.y, n.width, n.height);
  adaptInScreen(this._oScreenContainer, createMarginRect(20, 20, 20, 20));
};
CGameBase.prototype._getLayoutBounds = function () {
  for (var n, t = this._oBoard.getTableBounds(), i = -t.width / 2, f = t.width / 2, r = -t.height / 2, e = t.height / 2, u = this._oInfoPanelContainer.scaleX, s = this._oInterface.getInfoPanelRects(), o = 0; o < s.length; o++) n = s[o], i = Math.min(i, n.x * u), f = Math.max(f, (n.x + n.width) * u), r = Math.min(r, n.y * u), e = Math.max(e, (n.y + n.height) * u);
  return new createjs.Rectangle(i, r, f - i, e - r);
};
CGameBase.prototype.refreshButtonPos = function () {
  this.refreshPos();
  this._oAlertBox.refreshButtonPos();
  this._oEndPanel && this._oEndPanel.refreshButtonPos();
};
CGameBase.prototype.refreshTimerPos = function (n) {
  var u, f;
  n === undefined && (n = this._iCurPlayer);
  var e = this._oInterface.getInfoPanelAnchor(),
    i = this._oInterface.getPanelBounds(),
    t = e.top_pos,
    r = t.y - i.height / 2;
  n === WHITE && (t = e.bot_pos, r = t.y + i.height / 2);
  u = t.x + i.width + 50;
  s_bLandscape && s_iAspectRatio > 1.6 && (u = t.x + i.width - 50, f = i.height + 50, r = n === WHITE ? t.y - f : t.y + f);
  n === WHITE ? this._oMoveTimeController.setPos(u, r) : this._oMoveTimeController.setPos(u, r);
};
CGameBase.prototype.unload = function () {
  s_oGuiController.removeEventListener(CGUI.ON_GOTO_MAIN_MENU);
  this._bStartGame = !1;
  this._oInterface.unload();
  this._oEndPanel && this._oEndPanel.unload();
  this.stopTimers();
  this.stopAnim();
  s_oStage.removeAllChildren();
  s_oGame = null;
};
CGameBase.prototype.reset = function () {
  this._bPieceMoving = !1;
  this._bStartGame = !0;
  this._iScore = 0;
  this._iNumDiceAvailable = 0;
  this._bCpuTurned = !1;
  this._iDice1 = 0;
  this._iDice2 = 0;
  this._bDice1 = !1;
  this._bDice2 = !1;
  this._bDoubleDice = !1;
  this._iNumTurns = 0;
};
CGameBase.prototype.resetBoard = function () {
  this.reset();
  this._oBoard.reset();
  this._oInterface.hideDice();
  this._oInterface.hideDoubleDice();
};
CGameBase.prototype.onClickedPiece = function (n) {
  if (!this._bPieceMoving) {
    playSfxSound("click_cell", 1, !1);
    var t = this.getDiceResult();
    this._iNumDiceAvailable > 0 && this._oBoard.checkMovement(n, t);
  }
};
CGameBase.prototype.onClickedTriangle = function (n) {
  var t = this._oBoard.getCurPieceSelected();
  (this._oMovingPiece = t, this._checkMoveAllowed(n, t.getTriangle())) && (this._oCurMove = n, this._movePiece(n, t));
};
CGameBase.prototype._checkMoveAllowed = function (n, t) {
  var i = this._oBoard.getBrokenRule(this._aRuleToCheck, t, n.iFocusTriangle);
  switch (i) {
    case RULE_BROKEN_BOTH_DICE:
      return this._oAlertBox.show(TEXT_RULEBROKEN_BOTH), !1;
    case RULE_BROKEN_HIGHER_DICE:
      return this._oAlertBox.show(TEXT_RULEBROKEN_HIGHER), !1;
  }
  return !0;
};
CGameBase.prototype._movePiece = function (n, t) {
  playSfxSound("click_cell", 1, !1);
  this._oBoard.setPieceOnTop(t);
  this._oBoard.disableMovements();
  var r = t.getColor(),
    u = n.iFocusTriangle === -1 || n.iFocusTriangle === 24,
    f = n.aMoveTriangle[0],
    e = this._oBoard.getTriangles(),
    i = e[f],
    o = t.getTriangle();
  this.consumeDiceValue(n, o);
  !u || n.aMoveTriangle.length > 1 ? (this._bPieceMoving = !0, this._oBoard.foundIsolatedOpponentPiece(i, r) && this._oBoard.moveIsolatedPieceOnBar(i), this._oBoard.movePieceOnTriangle(t, i)) : this._oBoard.bearOffPiece(t);
};
CGameBase.prototype._onEndMovePiece = function (n) {
  this.updateInput();
  this._oCurMove.aMoveTriangle.shift();
  var t = this._oCurMove.aMoveTriangle.length > 0;
  t ? this._movePiece(this._oCurMove, n) : this.afterMove();
};
CGameBase.prototype.afterMove = function () {
  this._bPieceMoving = !1;
  var n = this.checkGameOver(),
    t = n === -1;
  t ? (this._aRuleToCheck = this._oBoard.checkMovesAvailable(this._iCurPlayer, this.getDiceResult()), this._iNumDiceAvailable > 0 ? this.checkAvaiableMove() === !0 ? (this.updateInput(), s_b2Players || this._iCurPlayer !== BLACK || this.cpuThinkBeforeChoice()) : this.skipTurn() : (this._bDoubleDice = !1, this._prepareToChangeTurn(), this.updateInput())) : (this._bStartGame = !1, this.gameOver(n));
};
CGameBase.prototype.consumeDiceValue = function (n, t) {
  var r = n.aMoveTriangle[0],
    i;
  i = this._bDoubleDice || n.iDiceDisable !== 0 ? this._bDoubleDice || n.iDiceDisable !== 1 ? this.getValueUsed(t, r) : this._iDice2 : this._iDice1;
  this._oInterface.consumeDiceValue(i);
  this._iNumDiceAvailable -= 1;
  this._bDoubleDice || (n.iDiceDisable === 0 ? this._bDice1 = !1 : n.iDiceDisable === 1 ? this._bDice2 = !1 : (this._bDice1 = !1, this._bDice2 = !1));
};
CGameBase.prototype.checkAvaiableMove = function () {
  for (var t, i = !1, r = this._oBoard.getPiecesByColor(this._iCurPlayer), n = 0; n < r.length; n++) if (t = r[n], t.isActive() && this._oBoard.getMoves(t, this.getDiceResult())) {
    i = !0;
    break;
  }
  return i;
};
CGameBase.prototype.updateInput = function () {
  var i, n, t;
  if (this._oBoard.disablePiecesListener(), s_b2Players) this._oBoard.enablePiecesListener(this._iCurPlayer);else if (this._iCurPlayer === WHITE) this._oBoard.enablePiecesListener(WHITE);else {
    for (i = BLACK, n = this._oBoard.getPiecesOnBar(i), n.length === 0 && (n = this._oBoard.getPiecesOnTriangles(i)), t = 0; t < n.length; t++) n[t].active(!0);
    this._bCpuTurned === !1 && (this._bCpuTurned = !0, this.cpuRoll());
  }
};
CGameBase.prototype._prepareToChangeTurn = function () {
  this.changeTurn();
};
CGameBase.prototype.changeTurn = function () {
  this._iNumTurns++;
  this._iCurPlayer = this.getOpponent(this._iCurPlayer);
  this._oInterface.hideDice();
  this._oInterface.hideDoubleDice();
  this._oInterface.activePlayer(this._iCurPlayer);
  this._oInterface.hideWaiting();
};
CGameBase.prototype.afterRollDice = function () {
  this._oAlertBox.hide();
  this._bDice1 = !0;
  this._bDice2 = !0;
  this._iDice1 !== this._iDice2 ? this._iNumDiceAvailable = 2 : (this._iNumDiceAvailable = 4, this._oAlertBox.show(TEXT_DOUBLE_DICES), this._oInterface.showDoubleInfo(this._iDice1, this._iDice2), playSfxSound("positive_beep", 1, !1), this._bDoubleDice = !0);
  this._aRuleToCheck = this._oBoard.checkMovesAvailable(this._iCurPlayer, this.getDiceResult());
};
CGameBase.prototype.rollDice = function () {
  this._iDice1 = Math.floor(Math.random() * 6 + 1);
  this._iDice2 = Math.floor(Math.random() * 6 + 1);
  this._oInterface.launchDicesAnim(this._iDice1, this._iDice2);
};
CGameBase.prototype.skipTurn = function () {
  this._bDice1 = !1;
  this._bDice2 = !1;
  this._bDoubleDice = !1;
  this._iNumDiceAvailable = 0;
  this._oAlertBox.show(TEXT_NO_MOVES_AVAILABLE);
  playSfxSound("negative_beep", 1, !1);
  this._iSkipTurnTimeout = setTimeout(() => {
    this._iSkipTurnTimeout = null, this._prepareToChangeTurn(), this.updateInput();
  }, 2e3);
};
CGameBase.prototype.showAlert = function (n) {
  this._oAlertBox.show(n);
};
CGameBase.prototype.stopTimers = function () {
  this._iCPUTimeout && clearTimeout(this._iCPUTimeout);
  this._iSkipTurnTimeout && clearTimeout(this._iSkipTurnTimeout);
};
CGameBase.prototype.stopAnim = function () {
  this._oMovingPiece && this._oMovingPiece.stopAnimation();
  this._oInterface.stopDiceAnim();
};
CGameBase.prototype.onRestart = function () {
  void 0;
  this.stopTimers();
  this.stopAnim();
  this._oBoard.block();
  var n = this;
  (() => {
    s_oGame === n && s_oGame._restartMatch();
  })();
};
CGameBase.prototype._restartMatch = function () {
  this._oEndPanel.hide();
  this._oBoard.unblock();
  this.stopTimers();
  this.stopAnim();
  this.reset();
  this._oBoard.restart();
  this._iCurPlayer = this._iStartingPlayer;
  this._oInterface.hideDice();
  this._prepareToChangeTurn();
  this.updateInput();
  this._iStartingPlayer = this._iCurPlayer;
};
CGameBase.prototype.onConfirmExit = function () {
  if (!this._bExiting) {
    this._bExiting = !0;
    void 0;
    this.stopTimers();
    this.stopAnim();
    this._oBoard.block();
    var n = this;
    (() => {
      s_oGame === n && (s_oGame.unload(), s_oMain.gotoMenu());
    })();
  }
};
CGameBase.prototype.checkGameOver = function () {
  var n = -1,
    t = this._oBoard.countPiecesInGame(WHITE),
    i = this._oBoard.countPiecesInGame(BLACK);
  return t === 0 ? n = WHITE : i === 0 && (n = BLACK), n;
};
CGameBase.prototype.cpuRoll = function () {
  this.rollDice();
};
CGameBase.prototype.cpuThinkBeforeChoice = function () {
  this._oBoard.block();
  var n = randomIntBetween(MIN_TIME_THINK, MAX_TIME_THINK);
  this._iCPUTimeout = setTimeout(() => {
    this._iCPUTimeout = null, this._oAI.cpuChoicePiece();
  }, n);
};
CGameBase.prototype.update = function () {};
CGameBase.prototype.getBoard = function () {
  return this._oBoard;
};
CGameBase.prototype.getOpponent = function (n) {
  return n === WHITE ? BLACK : WHITE;
};
CGameBase.prototype.getDiceResult = function () {
  return {
    dice1: this._iDice1,
    dice2: this._iDice2,
    available1: this._bDice1,
    available2: this._bDice2,
    doubledice: this._bDoubleDice,
    num_dices: this._iNumDiceAvailable
  };
};
CGameBase.prototype.getValueUsed = function (n, t) {
  return Math.abs(t - n);
};
CGameBase.prototype.changeSkin = function () {
  this._oBoard.changeSkin();
  this._oInterface.changeSkin();
};
CGameSingle.prototype = Object.create(CGameBase.prototype);
CGameSingle.prototype.constructor = CGameSingle;
CGameSingle.prototype._startGame = function () {
  this._iCurPlayer = WHITE;
  this._iCurPlayer = randomFloatBetween(1, 100) > 50 ? WHITE : BLACK;
  this._iStartingPlayer = this._iCurPlayer;
  s_oGuiController.showRestartBut();
  this._szWhiteName = sprintf(TEXT_PLAYER, 1);
  this._szBlackName = sprintf(TEXT_PLAYER, 2);
  this._oInterface.configureInfoPanel(this._bWhiteBotSide);
  s_b2Players || (this._szBlackName = TEXT_AI, this._iCurPlayer === BLACK && (this._oBoard.block(), this._oInterface.showWaiting(this._iCurPlayer), s_oGuiController.enableRestartButton(!1)));
  this._oInterface.setPlayersInfo(this._szWhiteName, this._szBlackName);
  this._oInterface.activePlayer(this._iCurPlayer);
  this._oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite("msg_box"));
  this._oEndPanel.addEventListener(ON_BACK_MENU, this.onConfirmExit, this);
  this._oEndPanel.addEventListener(ON_RESTART, this.onRestart, this);
  this._oBoard.initDistribution();
  s_oGuiController.addEventListener(CGUI.ON_RESTART_GAME, this.onRestart, this);
  this.refreshPos();
};
CGameSingle.prototype.refreshPos = function () {
  this._oSuper.refreshPos.call(this);
};
CGameSingle.prototype.unload = function () {
  this._oSuper.unload.call(this);
  s_oGuiController.hideRestartBut();
  s_oGuiController.removeEventListener(CGUI.ON_RESTART_GAME);
  this._iCPUTimeout && clearTimeout(this._iCPUTimeout);
  this._iSkipTurnTimeout && clearTimeout(this._iSkipTurnTimeout);
};
CGameSingle.prototype._onAfterDistribution = function () {
  this._oInterface.activePlayer(this._iCurPlayer);
  this._oInterface.activeDices(this._iCurPlayer);
  this.updateInput();
};
CGameSingle.prototype.changeTurn = function () {
  this._oSuper.changeTurn.call(this);
  this._oInterface.activeDices(this._iCurPlayer);
  s_b2Players || this._iCurPlayer === WHITE ? this._oBoard.unblock() : this._bCpuTurned = !1;
  s_oGuiController.enableRestartButton(!0);
  s_b2Players || this._iCurPlayer !== BLACK || (this._oBoard.block(), this._oInterface.showWaiting(this._iCurPlayer), s_oGuiController.enableRestartButton(!1));
};
CGameSingle.prototype.afterRollDice = function () {
  this._oSuper.afterRollDice.call(this);
  this.checkAvaiableMove() === !1 ? this.skipTurn() : s_b2Players || this._iCurPlayer !== BLACK || (this._iCPUTimeout = setTimeout(() => {
    this.cpuThinkBeforeChoice();
  }, 1500));
};
CGameSingle.prototype.gameOver = function (n) {
  var r = n === WHITE ? BLACK : WHITE,
    u = this._oBoard.countPiecesInGame(r),
    i,
    t;
  this._iScore = u * MULTIPLIER_SCORE;
  i = n === WHITE ? this._szWhiteName : this._szBlackName;
  s_b2Players === !0 ? t = sprintf(TEXT_WIN, i.toUpperCase()) : n === 0 ? t = TEXT_GAMEOVER : (this._iScore = 0, t = sprintf(TEXT_WIN, i.toUpperCase()));
  this._oEndPanel.show(t, this._iScore, n);
  this._oEndPanel.showButtons();
};
s_oInterface = null;
NUM_ATTEMPT = 3;
var NICKNAME_LIST = ["Dog", "Cow", "Cat", "Donkey", "Tiger", "Lion", "Panther", "Leopard", "Bear", "Turtle", "Crocodile", "Rabbit", "Porcupine", "Fish", "Crow", "Dolphin", "Frog", "Fox", "Squirrel", "Eagle", "Goat", "Jackal", "Giraffe", "Crab", "Panda", "Bat", "Deer", "Monkey", "Goose", "Wolf", "Armadillo", "Pig", "Horse", "Camel", "Chameleon", "Jaguar", "Kangaroo", "Koala", "Lizard", "Llama", "Hippopotamus", "Chicken", "Bull", "Mouse", "Sheep", "Owl", "Flamingo", "Swan", "Whale", "Snake", "Shark", "Elephant", "Octopus"],
  ADJECTIVES_LIST = ["Adorable", "Bright", "Calm", "Colorful", "Delicious", "Creative", "Eager", "Elegant", "Famous", "Generous", "Glorious", "Graceful", "Happy", "Healthy", "Humorous", "Innocent", "Joyful", "Kind", "Magnificent", "Mysterious", "Naughty", "Neat", "Nice", "Obedient", "Polite", "Powerful", "Quiet", "Responsible", "Radiant", "Rich", "Serious", "Smart", "Strong", "Talented", "Tender", "Trustworthy", "Unique", "Wise", "Red", "Pink", "Orange", "Yellow", "Purple", "Green", "Blue", "Brown", "White", "Gray", "Black", "Gorgeous", "Fabulous", "Handsome", "Amazing", "Exotic", "Incredible", "Outstanding", "Splendid", "Wonderful"],
  AVATAR_BG_COLOR = "#fff",
  AVATAR_BG_ALT_COLOR = "#000",
  AVATAR_ALT_COLOR_LIST = ["Goose", "Swan"];
var TEXT_WAIT_OPPONENT = "WAITING OPPONENT...",
  TEXT_OPPONENT_LEFT = "OPPONENT LEFT!",
  TEXT_ALL_PLAYERS_LEFT = "ALL PLAYERS HAVE LEFT THE MATCH!",
  TEXT_PLAYER_DISCONNECTED = "YOU LEFT!",
  TEXT_REMATCH = "do you want the re-match?",
  TEXT_CONNECTION_LOST = "CONNECTION LOST",
  TEXT_REMATCH_ALERT = "%s WANTS TO PLAY AGAIN",
  TEXT_AFK = "Inactive opponent",
  TEXT_AFK_SHORT = "AFK",
  TEXT_QUIT = "QUIT",
  TEXT_SYS_UPDATE = "update",
  TEXT_SYS_MATCH_LIST = "Match list",
  TEXT_SYS_QUICKMATCH = "quick match",
  TEXT_SYS_CREATEMATCH = "create match",
  TEXT_SYS_BACK = "back",
  TEXT_SYS_OK = "ok",
  TEXT_SYS_CREATE = "create",
  TEXT_SYS_CLOSE = "close",
  TEXT_SYS_LOADING = "Loading...",
  TEXT_SYS_NAMEROOM = "Name Room",
  TEXT_SYS_CREATEROOM = "Create Room",
  TEXT_SYS_DEFAULTROOMNAME = "%s's room",
  TEXT_SYS_PASSWORD = "Password",
  TEXT_SYS_INFOPASS = "If you don't set a password this room will be public.",
  TEXT_SYS_TYPEROOMPASS = "Type Room Password",
  TEXT_WRONG_PASSWORD = "Wrong Password!",
  TEXT_NETWORK_CONNECTING = "connecting...",
  TEXT_ROOM_IS_FULL = "Room is full!",
  TEXT_FIND_OPPONENT = "finding opponent...",
  TEXT_VS = "VS",
  TEXT_CONNECT_TO_LOBBY = "Connect to lobby...",
  TEXT_ROOM_DOESNT_EXIST = "Room doesn't exist!",
  TEXT_WAITING_FOR_OPPONENT_IN_ROOM = "waiting for opponent in room: ",
  TEXT_QUIT_FROM_GAME = "%s QUIT THE GAME",
  TEXT_TIME_OVER = "TIME OVER",
  TEXT_OFFER_A_DRAW = "Do you want to offer a draw?",
  TEXT_OFFERED_DRAW = "You have been offered a draw.\nClick the button to accept it",
  TEXT_WAIT_FOR_A_DRAW = "You offered a draw.\nWait for your opponent to accept it",
  TEXT_PLAYER_AGREED_TO_DRAW = "(Players agreed to draw)",
  TEXT_CPU = "AI",
  TEXT_PLAYER = "Player",
  TEXT_PLAYER_KICKED = "You were kicked from the game due to inactivity.",
  TEXT_YOU_ARE_INACTIVE = "A bot has taken your place because you are not playing.",
  TEXT_MINUTES = "Mins.",
  TEXT_NO_TIME = "No Time",
  TEXT_NO_TIME_MODE = "NO TIME MODE",
  TEXT_TIME_MODE = "TIME MODE",
  TEXT_SYS_FINDROOM = "find a room...",
  TEXT_ROOM_IS_EXPIRED = "Room Expired!",
  TEXT_MATCH_FOUND = "Match found!",
  TEXT_WAITING_FOR_PLAYERS_IN_ROOM = "waiting for players in room: ",
  TEXT_PLAY_NOW = "play now",
  TEXT_WAITING_ROOM_MESSAGE = "This room can contain max %d players",
  TEXT_SYS_GAME_TIME = "Match Time",
  TEXT_SYS_CHOOSEGAMETIME = "Choose the playing time per player",
  TEXT_NO_CONNECTION = "NO CONNECTION<br/>(Connect to find someone to play online)",
  TEXT_SOMETHING_WENT_WRONG = "CONNECTION ERROR. SOMETHING WENT WRONG",
  TEXT_INVALID_NAME = "INVALID NAME!",
  TEXT_SYS_INVITE = "INVITE",
  TEXT_SYS_MINUTES = "%s min.",
  TEXT_SYS_QUICKMATCH_MINUTE = "quick match (" + TEXT_SYS_MINUTES + ")",
  TEXT_SYS_COPIED_TO_CLIPBOARD = "Game link copied to your Clipboard. Share it with your friends!",
  TEXT_SYS_QUICKMATCH_NOTIME = "quick match (" + TEXT_NO_TIME + ")",
  TEXT_SYS_MAXPLAYERS = "Max Players",
  TEXT_SYS_CHOOSEMAXNUMPLAYERS = "Choose the maximum number of players in room.",
  TEXT_EMOTICONS_BLOCK = "BLOCK EMOTICONS",
  TEXT_SYS_CHOOSENICK = "Choose nickname",
  TEXT_SYS_CHOOSE_EMAIL = "Email",
  TEXT_SYS_CHOOSENICK_OR_EMAIL = "nickname or email",
  TEXT_HURRY_UP = "HURRY UP!",
  TEXT_SYS_CANCEL = "cancel",
  TEXT_SYS_SAVE = "save",
  TEXT_ROOM_PERMISSION_DENIED = "You are not authorized to enter",
  TEXT_MATCH_IN_PROGRESS = "You have a game in progress.<br><br>Do you want to rejoin?",
  TEXT_LOST_CONNECTION = "Connection lost.<br><br>Reconnect to rejoin.",
  TEXT_RE_ENTER = "REJOIN",
  TEXT_OPPONENT_QUIT_AND_CONTINUE = "The player has left the game.<br><br>You can continue playing against a bot or claim the win.",
  TEXT_SYS_WIN = "CLAIM THE WIN",
  TEXT_SYS_CONTINUE = "CONTINUE",
  TEXT_SYS_RETRY = "RETRY",
  TEXT_SYS_EDIT_PROFILE = "Edit Profile",
  TEXT_SYS_WATCH = "watch",
  TEXT_PLAYERS_WAITING_FOR_REMATCH = "Waiting for the rematch";
var Latinise = {};
Latinise.latin_map = {
  "Á": "A",
  "Ă": "A",
  "Ắ": "A",
  "Ặ": "A",
  "Ằ": "A",
  "Ẳ": "A",
  "Ẵ": "A",
  "Ǎ": "A",
  "Â": "A",
  "Ấ": "A",
  "Ậ": "A",
  "Ầ": "A",
  "Ẩ": "A",
  "Ẫ": "A",
  "Ä": "A",
  "Ǟ": "A",
  "Ȧ": "A",
  "Ǡ": "A",
  "Ạ": "A",
  "Ȁ": "A",
  "À": "A",
  "Ả": "A",
  "Ȃ": "A",
  "Ā": "A",
  "Ą": "A",
  "Å": "A",
  "Ǻ": "A",
  "Ḁ": "A",
  "Ⱥ": "A",
  "Ã": "A",
  "Ꜳ": "AA",
  "Æ": "AE",
  "Ǽ": "AE",
  "Ǣ": "AE",
  "Ꜵ": "AO",
  "Ꜷ": "AU",
  "Ꜹ": "AV",
  "Ꜻ": "AV",
  "Ꜽ": "AY",
  "Ḃ": "B",
  "Ḅ": "B",
  "Ɓ": "B",
  "Ḇ": "B",
  "Ƀ": "B",
  "Ƃ": "B",
  "Ć": "C",
  "Č": "C",
  "Ç": "C",
  "Ḉ": "C",
  "Ĉ": "C",
  "Ċ": "C",
  "Ƈ": "C",
  "Ȼ": "C",
  "Ď": "D",
  "Ḑ": "D",
  "Ḓ": "D",
  "Ḋ": "D",
  "Ḍ": "D",
  "Ɗ": "D",
  "Ḏ": "D",
  "ǲ": "D",
  "ǅ": "D",
  "Đ": "D",
  "Ƌ": "D",
  "Ǳ": "DZ",
  "Ǆ": "DZ",
  "É": "E",
  "Ĕ": "E",
  "Ě": "E",
  "Ȩ": "E",
  "Ḝ": "E",
  "Ê": "E",
  "Ế": "E",
  "Ệ": "E",
  "Ề": "E",
  "Ể": "E",
  "Ễ": "E",
  "Ḙ": "E",
  "Ë": "E",
  "Ė": "E",
  "Ẹ": "E",
  "Ȅ": "E",
  "È": "E",
  "Ẻ": "E",
  "Ȇ": "E",
  "Ē": "E",
  "Ḗ": "E",
  "Ḕ": "E",
  "Ę": "E",
  "Ɇ": "E",
  "Ẽ": "E",
  "Ḛ": "E",
  "Ꝫ": "ET",
  "Ḟ": "F",
  "Ƒ": "F",
  "Ǵ": "G",
  "Ğ": "G",
  "Ǧ": "G",
  "Ģ": "G",
  "Ĝ": "G",
  "Ġ": "G",
  "Ɠ": "G",
  "Ḡ": "G",
  "Ǥ": "G",
  "Ḫ": "H",
  "Ȟ": "H",
  "Ḩ": "H",
  "Ĥ": "H",
  "Ⱨ": "H",
  "Ḧ": "H",
  "Ḣ": "H",
  "Ḥ": "H",
  "Ħ": "H",
  "Í": "I",
  "Ĭ": "I",
  "Ǐ": "I",
  "Î": "I",
  "Ï": "I",
  "Ḯ": "I",
  "İ": "I",
  "Ị": "I",
  "Ȉ": "I",
  "Ì": "I",
  "Ỉ": "I",
  "Ȋ": "I",
  "Ī": "I",
  "Į": "I",
  "Ɨ": "I",
  "Ĩ": "I",
  "Ḭ": "I",
  "Ꝺ": "D",
  "Ꝼ": "F",
  "Ᵹ": "G",
  "Ꞃ": "R",
  "Ꞅ": "S",
  "Ꞇ": "T",
  "Ꝭ": "IS",
  "Ĵ": "J",
  "Ɉ": "J",
  "Ḱ": "K",
  "Ǩ": "K",
  "Ķ": "K",
  "Ⱪ": "K",
  "Ꝃ": "K",
  "Ḳ": "K",
  "Ƙ": "K",
  "Ḵ": "K",
  "Ꝁ": "K",
  "Ꝅ": "K",
  "Ĺ": "L",
  "Ƚ": "L",
  "Ľ": "L",
  "Ļ": "L",
  "Ḽ": "L",
  "Ḷ": "L",
  "Ḹ": "L",
  "Ⱡ": "L",
  "Ꝉ": "L",
  "Ḻ": "L",
  "Ŀ": "L",
  "Ɫ": "L",
  "ǈ": "L",
  "Ł": "L",
  "Ǉ": "LJ",
  "Ḿ": "M",
  "Ṁ": "M",
  "Ṃ": "M",
  "Ɱ": "M",
  "Ń": "N",
  "Ň": "N",
  "Ņ": "N",
  "Ṋ": "N",
  "Ṅ": "N",
  "Ṇ": "N",
  "Ǹ": "N",
  "Ɲ": "N",
  "Ṉ": "N",
  "Ƞ": "N",
  "ǋ": "N",
  "Ñ": "N",
  "Ǌ": "NJ",
  "Ó": "O",
  "Ŏ": "O",
  "Ǒ": "O",
  "Ô": "O",
  "Ố": "O",
  "Ộ": "O",
  "Ồ": "O",
  "Ổ": "O",
  "Ỗ": "O",
  "Ö": "O",
  "Ȫ": "O",
  "Ȯ": "O",
  "Ȱ": "O",
  "Ọ": "O",
  "Ő": "O",
  "Ȍ": "O",
  "Ò": "O",
  "Ỏ": "O",
  "Ơ": "O",
  "Ớ": "O",
  "Ợ": "O",
  "Ờ": "O",
  "Ở": "O",
  "Ỡ": "O",
  "Ȏ": "O",
  "Ꝋ": "O",
  "Ꝍ": "O",
  "Ō": "O",
  "Ṓ": "O",
  "Ṑ": "O",
  "Ɵ": "O",
  "Ǫ": "O",
  "Ǭ": "O",
  "Ø": "O",
  "Ǿ": "O",
  "Õ": "O",
  "Ṍ": "O",
  "Ṏ": "O",
  "Ȭ": "O",
  "Ƣ": "OI",
  "Ꝏ": "OO",
  "Ɛ": "E",
  "Ɔ": "O",
  "Ȣ": "OU",
  "Ṕ": "P",
  "Ṗ": "P",
  "Ꝓ": "P",
  "Ƥ": "P",
  "Ꝕ": "P",
  "Ᵽ": "P",
  "Ꝑ": "P",
  "Ꝙ": "Q",
  "Ꝗ": "Q",
  "Ŕ": "R",
  "Ř": "R",
  "Ŗ": "R",
  "Ṙ": "R",
  "Ṛ": "R",
  "Ṝ": "R",
  "Ȑ": "R",
  "Ȓ": "R",
  "Ṟ": "R",
  "Ɍ": "R",
  "Ɽ": "R",
  "Ꜿ": "C",
  "Ǝ": "E",
  "Ś": "S",
  "Ṥ": "S",
  "Š": "S",
  "Ṧ": "S",
  "Ş": "S",
  "Ŝ": "S",
  "Ș": "S",
  "Ṡ": "S",
  "Ṣ": "S",
  "Ṩ": "S",
  "Ť": "T",
  "Ţ": "T",
  "Ṱ": "T",
  "Ț": "T",
  "Ⱦ": "T",
  "Ṫ": "T",
  "Ṭ": "T",
  "Ƭ": "T",
  "Ṯ": "T",
  "Ʈ": "T",
  "Ŧ": "T",
  "Ɐ": "A",
  "Ꞁ": "L",
  "Ɯ": "M",
  "Ʌ": "V",
  "Ꜩ": "TZ",
  "Ú": "U",
  "Ŭ": "U",
  "Ǔ": "U",
  "Û": "U",
  "Ṷ": "U",
  "Ü": "U",
  "Ǘ": "U",
  "Ǚ": "U",
  "Ǜ": "U",
  "Ǖ": "U",
  "Ṳ": "U",
  "Ụ": "U",
  "Ű": "U",
  "Ȕ": "U",
  "Ù": "U",
  "Ủ": "U",
  "Ư": "U",
  "Ứ": "U",
  "Ự": "U",
  "Ừ": "U",
  "Ử": "U",
  "Ữ": "U",
  "Ȗ": "U",
  "Ū": "U",
  "Ṻ": "U",
  "Ų": "U",
  "Ů": "U",
  "Ũ": "U",
  "Ṹ": "U",
  "Ṵ": "U",
  "Ꝟ": "V",
  "Ṿ": "V",
  "Ʋ": "V",
  "Ṽ": "V",
  "Ꝡ": "VY",
  "Ẃ": "W",
  "Ŵ": "W",
  "Ẅ": "W",
  "Ẇ": "W",
  "Ẉ": "W",
  "Ẁ": "W",
  "Ⱳ": "W",
  "Ẍ": "X",
  "Ẋ": "X",
  "Ý": "Y",
  "Ŷ": "Y",
  "Ÿ": "Y",
  "Ẏ": "Y",
  "Ỵ": "Y",
  "Ỳ": "Y",
  "Ƴ": "Y",
  "Ỷ": "Y",
  "Ỿ": "Y",
  "Ȳ": "Y",
  "Ɏ": "Y",
  "Ỹ": "Y",
  "Ź": "Z",
  "Ž": "Z",
  "Ẑ": "Z",
  "Ⱬ": "Z",
  "Ż": "Z",
  "Ẓ": "Z",
  "Ȥ": "Z",
  "Ẕ": "Z",
  "Ƶ": "Z",
  "Ĳ": "IJ",
  "Œ": "OE",
  "ᴀ": "A",
  "ᴁ": "AE",
  "ʙ": "B",
  "ᴃ": "B",
  "ᴄ": "C",
  "ᴅ": "D",
  "ᴇ": "E",
  "ꜰ": "F",
  "ɢ": "G",
  "ʛ": "G",
  "ʜ": "H",
  "ɪ": "I",
  "ʁ": "R",
  "ᴊ": "J",
  "ᴋ": "K",
  "ʟ": "L",
  "ᴌ": "L",
  "ᴍ": "M",
  "ɴ": "N",
  "ᴏ": "O",
  "ɶ": "OE",
  "ᴐ": "O",
  "ᴕ": "OU",
  "ᴘ": "P",
  "ʀ": "R",
  "ᴎ": "N",
  "ᴙ": "R",
  "ꜱ": "S",
  "ᴛ": "T",
  "ⱻ": "E",
  "ᴚ": "R",
  "ᴜ": "U",
  "ᴠ": "V",
  "ᴡ": "W",
  "ʏ": "Y",
  "ᴢ": "Z",
  "á": "a",
  "ă": "a",
  "ắ": "a",
  "ặ": "a",
  "ằ": "a",
  "ẳ": "a",
  "ẵ": "a",
  "ǎ": "a",
  "â": "a",
  "ấ": "a",
  "ậ": "a",
  "ầ": "a",
  "ẩ": "a",
  "ẫ": "a",
  "ä": "a",
  "ǟ": "a",
  "ȧ": "a",
  "ǡ": "a",
  "ạ": "a",
  "ȁ": "a",
  "à": "a",
  "ả": "a",
  "ȃ": "a",
  "ā": "a",
  "ą": "a",
  "ᶏ": "a",
  "ẚ": "a",
  "å": "a",
  "ǻ": "a",
  "ḁ": "a",
  "ⱥ": "a",
  "ã": "a",
  "ꜳ": "aa",
  "æ": "ae",
  "ǽ": "ae",
  "ǣ": "ae",
  "ꜵ": "ao",
  "ꜷ": "au",
  "ꜹ": "av",
  "ꜻ": "av",
  "ꜽ": "ay",
  "ḃ": "b",
  "ḅ": "b",
  "ɓ": "b",
  "ḇ": "b",
  "ᵬ": "b",
  "ᶀ": "b",
  "ƀ": "b",
  "ƃ": "b",
  "ɵ": "o",
  "ć": "c",
  "č": "c",
  "ç": "c",
  "ḉ": "c",
  "ĉ": "c",
  "ɕ": "c",
  "ċ": "c",
  "ƈ": "c",
  "ȼ": "c",
  "ď": "d",
  "ḑ": "d",
  "ḓ": "d",
  "ȡ": "d",
  "ḋ": "d",
  "ḍ": "d",
  "ɗ": "d",
  "ᶑ": "d",
  "ḏ": "d",
  "ᵭ": "d",
  "ᶁ": "d",
  "đ": "d",
  "ɖ": "d",
  "ƌ": "d",
  "ı": "i",
  "ȷ": "j",
  "ɟ": "j",
  "ʄ": "j",
  "ǳ": "dz",
  "ǆ": "dz",
  "é": "e",
  "ĕ": "e",
  "ě": "e",
  "ȩ": "e",
  "ḝ": "e",
  "ê": "e",
  "ế": "e",
  "ệ": "e",
  "ề": "e",
  "ể": "e",
  "ễ": "e",
  "ḙ": "e",
  "ë": "e",
  "ė": "e",
  "ẹ": "e",
  "ȅ": "e",
  "è": "e",
  "ẻ": "e",
  "ȇ": "e",
  "ē": "e",
  "ḗ": "e",
  "ḕ": "e",
  "ⱸ": "e",
  "ę": "e",
  "ᶒ": "e",
  "ɇ": "e",
  "ẽ": "e",
  "ḛ": "e",
  "ꝫ": "et",
  "ḟ": "f",
  "ƒ": "f",
  "ᵮ": "f",
  "ᶂ": "f",
  "ǵ": "g",
  "ğ": "g",
  "ǧ": "g",
  "ģ": "g",
  "ĝ": "g",
  "ġ": "g",
  "ɠ": "g",
  "ḡ": "g",
  "ᶃ": "g",
  "ǥ": "g",
  "ḫ": "h",
  "ȟ": "h",
  "ḩ": "h",
  "ĥ": "h",
  "ⱨ": "h",
  "ḧ": "h",
  "ḣ": "h",
  "ḥ": "h",
  "ɦ": "h",
  "ẖ": "h",
  "ħ": "h",
  "ƕ": "hv",
  "í": "i",
  "ĭ": "i",
  "ǐ": "i",
  "î": "i",
  "ï": "i",
  "ḯ": "i",
  "ị": "i",
  "ȉ": "i",
  "ì": "i",
  "ỉ": "i",
  "ȋ": "i",
  "ī": "i",
  "į": "i",
  "ᶖ": "i",
  "ɨ": "i",
  "ĩ": "i",
  "ḭ": "i",
  "ꝺ": "d",
  "ꝼ": "f",
  "ᵹ": "g",
  "ꞃ": "r",
  "ꞅ": "s",
  "ꞇ": "t",
  "ꝭ": "is",
  "ǰ": "j",
  "ĵ": "j",
  "ʝ": "j",
  "ɉ": "j",
  "ḱ": "k",
  "ǩ": "k",
  "ķ": "k",
  "ⱪ": "k",
  "ꝃ": "k",
  "ḳ": "k",
  "ƙ": "k",
  "ḵ": "k",
  "ᶄ": "k",
  "ꝁ": "k",
  "ꝅ": "k",
  "ĺ": "l",
  "ƚ": "l",
  "ɬ": "l",
  "ľ": "l",
  "ļ": "l",
  "ḽ": "l",
  "ȴ": "l",
  "ḷ": "l",
  "ḹ": "l",
  "ⱡ": "l",
  "ꝉ": "l",
  "ḻ": "l",
  "ŀ": "l",
  "ɫ": "l",
  "ᶅ": "l",
  "ɭ": "l",
  "ł": "l",
  "ǉ": "lj",
  "ſ": "s",
  "ẜ": "s",
  "ẛ": "s",
  "ẝ": "s",
  "ḿ": "m",
  "ṁ": "m",
  "ṃ": "m",
  "ɱ": "m",
  "ᵯ": "m",
  "ᶆ": "m",
  "ń": "n",
  "ň": "n",
  "ņ": "n",
  "ṋ": "n",
  "ȵ": "n",
  "ṅ": "n",
  "ṇ": "n",
  "ǹ": "n",
  "ɲ": "n",
  "ṉ": "n",
  "ƞ": "n",
  "ᵰ": "n",
  "ᶇ": "n",
  "ɳ": "n",
  "ñ": "n",
  "ǌ": "nj",
  "ó": "o",
  "ŏ": "o",
  "ǒ": "o",
  "ô": "o",
  "ố": "o",
  "ộ": "o",
  "ồ": "o",
  "ổ": "o",
  "ỗ": "o",
  "ö": "o",
  "ȫ": "o",
  "ȯ": "o",
  "ȱ": "o",
  "ọ": "o",
  "ő": "o",
  "ȍ": "o",
  "ò": "o",
  "ỏ": "o",
  "ơ": "o",
  "ớ": "o",
  "ợ": "o",
  "ờ": "o",
  "ở": "o",
  "ỡ": "o",
  "ȏ": "o",
  "ꝋ": "o",
  "ꝍ": "o",
  "ⱺ": "o",
  "ō": "o",
  "ṓ": "o",
  "ṑ": "o",
  "ǫ": "o",
  "ǭ": "o",
  "ø": "o",
  "ǿ": "o",
  "õ": "o",
  "ṍ": "o",
  "ṏ": "o",
  "ȭ": "o",
  "ƣ": "oi",
  "ꝏ": "oo",
  "ɛ": "e",
  "ᶓ": "e",
  "ɔ": "o",
  "ᶗ": "o",
  "ȣ": "ou",
  "ṕ": "p",
  "ṗ": "p",
  "ꝓ": "p",
  "ƥ": "p",
  "ᵱ": "p",
  "ᶈ": "p",
  "ꝕ": "p",
  "ᵽ": "p",
  "ꝑ": "p",
  "ꝙ": "q",
  "ʠ": "q",
  "ɋ": "q",
  "ꝗ": "q",
  "ŕ": "r",
  "ř": "r",
  "ŗ": "r",
  "ṙ": "r",
  "ṛ": "r",
  "ṝ": "r",
  "ȑ": "r",
  "ɾ": "r",
  "ᵳ": "r",
  "ȓ": "r",
  "ṟ": "r",
  "ɼ": "r",
  "ᵲ": "r",
  "ᶉ": "r",
  "ɍ": "r",
  "ɽ": "r",
  "ↄ": "c",
  "ꜿ": "c",
  "ɘ": "e",
  "ɿ": "r",
  "ś": "s",
  "ṥ": "s",
  "š": "s",
  "ṧ": "s",
  "ş": "s",
  "ŝ": "s",
  "ș": "s",
  "ṡ": "s",
  "ṣ": "s",
  "ṩ": "s",
  "ʂ": "s",
  "ᵴ": "s",
  "ᶊ": "s",
  "ȿ": "s",
  "ɡ": "g",
  "ᴑ": "o",
  "ᴓ": "o",
  "ᴝ": "u",
  "ť": "t",
  "ţ": "t",
  "ṱ": "t",
  "ț": "t",
  "ȶ": "t",
  "ẗ": "t",
  "ⱦ": "t",
  "ṫ": "t",
  "ṭ": "t",
  "ƭ": "t",
  "ṯ": "t",
  "ᵵ": "t",
  "ƫ": "t",
  "ʈ": "t",
  "ŧ": "t",
  "ᵺ": "th",
  "ɐ": "a",
  "ᴂ": "ae",
  "ǝ": "e",
  "ᵷ": "g",
  "ɥ": "h",
  "ʮ": "h",
  "ʯ": "h",
  "ᴉ": "i",
  "ʞ": "k",
  "ꞁ": "l",
  "ɯ": "m",
  "ɰ": "m",
  "ᴔ": "oe",
  "ɹ": "r",
  "ɻ": "r",
  "ɺ": "r",
  "ⱹ": "r",
  "ʇ": "t",
  "ʌ": "v",
  "ʍ": "w",
  "ʎ": "y",
  "ꜩ": "tz",
  "ú": "u",
  "ŭ": "u",
  "ǔ": "u",
  "û": "u",
  "ṷ": "u",
  "ü": "u",
  "ǘ": "u",
  "ǚ": "u",
  "ǜ": "u",
  "ǖ": "u",
  "ṳ": "u",
  "ụ": "u",
  "ű": "u",
  "ȕ": "u",
  "ù": "u",
  "ủ": "u",
  "ư": "u",
  "ứ": "u",
  "ự": "u",
  "ừ": "u",
  "ử": "u",
  "ữ": "u",
  "ȗ": "u",
  "ū": "u",
  "ṻ": "u",
  "ų": "u",
  "ᶙ": "u",
  "ů": "u",
  "ũ": "u",
  "ṹ": "u",
  "ṵ": "u",
  "ᵫ": "ue",
  "ꝸ": "um",
  "ⱴ": "v",
  "ꝟ": "v",
  "ṿ": "v",
  "ʋ": "v",
  "ᶌ": "v",
  "ⱱ": "v",
  "ṽ": "v",
  "ꝡ": "vy",
  "ẃ": "w",
  "ŵ": "w",
  "ẅ": "w",
  "ẇ": "w",
  "ẉ": "w",
  "ẁ": "w",
  "ⱳ": "w",
  "ẘ": "w",
  "ẍ": "x",
  "ẋ": "x",
  "ᶍ": "x",
  "ý": "y",
  "ŷ": "y",
  "ÿ": "y",
  "ẏ": "y",
  "ỵ": "y",
  "ỳ": "y",
  "ƴ": "y",
  "ỷ": "y",
  "ỿ": "y",
  "ȳ": "y",
  "ẙ": "y",
  "ɏ": "y",
  "ỹ": "y",
  "ź": "z",
  "ž": "z",
  "ẑ": "z",
  "ʑ": "z",
  "ⱬ": "z",
  "ż": "z",
  "ẓ": "z",
  "ȥ": "z",
  "ẕ": "z",
  "ᵶ": "z",
  "ᶎ": "z",
  "ʐ": "z",
  "ƶ": "z",
  "ɀ": "z",
  "ﬀ": "ff",
  "ﬃ": "ffi",
  "ﬄ": "ffl",
  "ﬁ": "fi",
  "ﬂ": "fl",
  "ĳ": "ij",
  "œ": "oe",
  "ﬆ": "st",
  "ₐ": "a",
  "ₑ": "e",
  "ᵢ": "i",
  "ⱼ": "j",
  "ₒ": "o",
  "ᵣ": "r",
  "ᵤ": "u",
  "ᵥ": "v",
  "ₓ": "x"
};
String.prototype.latinise = function () {
  return this.replace(/[^A-Za-z0-9\[\] ]/g, function (n) {
    return Latinise.latin_map[n] || n;
  });
};
String.prototype.latinize = String.prototype.latinise;
String.prototype.isLatin = function () {
  return this == this.latinise();
};
WHITELIST_EN = ["assassin", "assassination", "classic", "classics", "massive", "massively", "passionate", "passionately", "assistance", "assistant", "ambassador", "chassis", "molasses", "embarrass", "embarrassing", "harass", "harassment", "grasshopper", "passage", "passages", "cassette", "bassoon", "trespass", "lass", "lass", "brass", "glass", "grass", "bass", "mass", "class", "arsenal", "parse", "parser", "sparse", "coarse", "hoarse", "horse", "horses", "honey", "hotel", "hotels", "honest", "honestly", "honesty", "honor", "honorary", "ghost", "ghosts", "phone", "phones", "whole", "wholly", "phoenix", "school", "schools", "python", "short", "shortly", "shoot", "shooter", "show", "shown", "shop", "shopping", "shore", "shadow", "shadows", "title", "titles", "titan", "entity", "entities", "constitution", "substitute", "substitution", "twitter", "glitter", "bitter", "kitten", "written", "british", "dictionary", "dedicated", "dedication", "predict", "prediction", "verdict", "addicted", "addiction", "benedict", "cocktail", "cocktails", "cockatoo", "cockerel", "peacock", "woodcock", "hancock", "cucumber", "accumulate", "accumulation", "document", "documents", "curriculum", "vacuum", "circumstance", "circumstances", "cumulus", "drape", "drapes", "grape", "grapes", "scrape", "scraper", "landscape", "night", "nights", "knight", "knights", "negligence", "negligent", "ignite", "pursuit", "purpose", "purposes", "push", "pushing", "pulse", "swanky", "scunthorpe", "penistone", "shitterton", "lightwater", "sussex", "essex", "middlesex", "arsenal"];
class CGUI extends CGUIController {
  static ON_VICTORY = "on_victory";
  static ON_BUT_VICTORY_TIMER_END = "on_but_victory_timer_end";
  static ON_CHANGE_SKIN = "on_change_skin";
  constructor() {
    super(false, false, true, false, false);
    this._szIdChessBoard = "but-chessboard";
    this._szIdResign = "but-resign";
    this._szIdVictory = "but-victory";
    this._szIdConfirmMoreGames = "confirm-moregames";
    this._iStartTimerVictoryReq = 0;
    this._makeCustomGameOptions();
    this.hideMusicToggle();
    this.hideHelpBut();
  }
  __triggerCustomButtons(n) {
    super.__triggerCustomButtons(n);
    switch (n.id) {
      case this._szIdChessBoard:
        this.__createChooseBoardModal();
        break;
      case this._szIdResign:
        this._oModalController.createConfirmPanel(this._szIdResign, TEXT_SURRENDER, this._szActionConfirmModals);
        break;
      case this._szIdVictory:
        this._oModalController.createConfirmPanel(this._szIdVictory, TEXT_ASK_FOR_VICTORY, this._szActionConfirmModals);
    }
  }
  __triggerConfirmModals(n) {
    super.__triggerConfirmModals(n);
    switch (n.id) {
      case this._szIdResign:
        this.hideSideBar();
        this._oEventListener.triggerEvent(CGUI.ON_RESIGN);
        break;
      case this._szIdVictory:
        this.hideSideBar();
        this._oEventListener.triggerEvent(CGUI.ON_VICTORY);
    }
  }
  __createChooseBoardModal() {
    var n = '<div class="modal fade overflow-hidden" id="alertModal" tabindex="-1"  aria-hidden="true">',
      t,
      i,
      r;
    n += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
    n += '<h1 class="modal-title fs-5" id="alertModalLabel">' + TEXT_CHOOSE_BOARD + "<\/h1>";
    n += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="' + TEXT_CLOSE + '"><\/button><\/div>';
    s_iSkinID === 0 ? (t = "but_3d_on", i = "but_2d_off") : (t = "but_3d_off", i = "but_2d_on");
    n += '<div class="choose-board row">';
    n += '<div class="col col-6">';
    n += '<a class="btn-board-style">';
    n += '<img id="3d-but" src="./sprites/' + t + '.png" alt="3D" onclick ="s_oGuiController.__onChangeBoard(0);">';
    n += "3D";
    n += "<\/a>";
    n += "<\/div>";
    n += '<div class="col col-6">';
    n += '<a class="btn-board-style">';
    n += '<img id="2d-but" src="./sprites/' + i + '.png" alt="2D" onclick ="s_oGuiController.__onChangeBoard(1);">';
    n += "2D";
    n += "<\/a>";
    n += "<\/div>";
    n += "<\/div><\/div><\/div>";
    document.querySelector("body").appendChild(htmlMarkupToNode(n));
    r = new bootstrap.Modal(document.getElementById("alertModal"));
    r.show();
  }
  __onChangeBoard(n) {
    var f = bootstrap.Modal.getOrCreateInstance("#alertModal"),
      t,
      i,
      r,
      u;
    n === 0 ? (t = "but_3d_on", i = "but_2d_off") : (t = "but_3d_off", i = "but_2d_on");
    r = document.getElementById("3d-but");
    r.src = "./sprites/" + t + ".png";
    r.onclick = null;
    u = document.getElementById("2d-but");
    u.src = "./sprites/" + i + ".png";
    u.onclick = null;
    setTimeout(function () {
      f.hide();
    }, 250);
    this._oEventListener.triggerEvent(CGUI.ON_CHANGE_SKIN, n);
  }
  _makeCustomGameOptions() {
    var i = "",
      n = TEXT_CHOOSE_BOARD,
      t = "fa-solid fa-chess-board";
    i += this.makeGameOptionBut(this._szIdChessBoard, n, t);
    n = TEXT_CHOOSE_RESIGN;
    t = "fa-regular fa-flag";
    i += this.makeGameOptionBut(this._szIdResign, n, t);
    n = TEXT_REQUEST_VICTORY;
    t = "fa-solid fa-crown";
    i += this.makeGameOptionBut(this._szIdVictory, n, t);
    this.addToGameOptions(i);
  }
  hideSideBar() {
    this.isSidebarOpen() && this.toggleSideBar();
  }
  refreshMenuLanguage() {
    super.refreshMenuLanguage();
    document.querySelector("#but-victory span").innerHTML = TEXT_REQUEST_VICTORY;
    document.querySelector("#but-resign span").innerHTML = TEXT_CHOOSE_RESIGN;
    document.querySelector("#but-chessboard span").innerHTML = TEXT_CHOOSE_BOARD;
  }
  makeGameOptionBut(n, t, i) {
    var r = "";
    return r += '<button id="' + n + '" type="button" class="btn btn-link text-start ' + this._szActionCustomButtons + '">', r += '<i class="' + i + ' icon-start" id="sidebar-menu-section-1-0"><\/i>', r += "<span>" + t + "<\/span>", r + "<\/button>";
  }
  enableRestartButton(n) {
    n ? document.getElementById("restart-game-but").classList.remove("disabled") : document.getElementById("restart-game-but").classList.add("disabled");
  }
  showResignButton() {
    this._showElement(this._szIdResign);
  }
  hideResignButton() {
    void 0;
    document.getElementById(this._szIdResign) && this._hideElement(this._szIdResign);
  }
  showVictoryRequestBut() {
    document.getElementById("but-victory").classList.remove("d-none");
  }
  showVictoryConfirmPanel() {
    this._oModalController.createConfirmPanel(this._szIdResign, TEXT_GRANT_VICTORY, this._szActionConfirmModals);
  }
  hideVictoryRequestBut() {
    this._iIDInterval && clearInterval(this._iIDInterval);
    document.getElementById("but-victory").classList.add("d-none");
  }
  setVictoryButInitState() {
    this._iIDInterval && clearInterval(this._iIDInterval);
    document.getElementById(this._szIdVictory).classList.add("disabled");
    document.querySelector("#but-victory span").innerHTML = TEXT_REQUEST_VICTORY + sprintf(" (%s)", TEXT_REQ_GAME_END);
  }
  enableVictoryButton(n) {
    n ? (document.getElementById(this._szIdVictory).classList.remove("disabled"), document.querySelector("#but-victory span").innerHTML = TEXT_REQUEST_VICTORY) : document.getElementById(this._szIdVictory).classList.add("disabled");
  }
  disableVictButWithTimer(n) {
    var t, i;
    document.getElementById(this._szIdVictory).classList.add("disabled");
    t = 1e3;
    this._iStartTimerVictoryReq = n;
    i = Math.floor(this._iStartTimerVictoryReq / t);
    document.querySelector("#but-victory span").innerHTML = TEXT_REQUEST_VICTORY + sprintf(" (%s)", i);
    this._iIDInterval = setInterval(() => {
      this._iStartTimerVictoryReq -= t;
      var i = Math.floor(this._iStartTimerVictoryReq / t),
        n = TEXT_REQUEST_VICTORY + sprintf(" (%s)", i);
      this._iStartTimerVictoryReq < t && (this._iStartTimerVictoryReq = 0, clearInterval(this._iIDInterval), n = TEXT_REQUEST_VICTORY, this._oEventListener.triggerEvent(CGUI.ON_BUT_VICTORY_TIMER_END));
      document.querySelector("#but-victory span").innerHTML = n;
    }, t);
  }
  getVictTimer() {
    return this._iStartTimerVictoryReq;
  }
}
class CDice {
  constructor(n, t, i, r, u) {
    this._aCbCompleted = [];
    this._aCbOwner = [];
    this._szColor = u;
    this._oSprite = i;
    this._iWidth = i.width;
    this._iHeight = i.height;
    this._oParentContainer = r;
    this._oContainer = new createjs.Container();
    this._oContainer.x = n;
    this._oContainer.y = t;
    this._oParentContainer.addChild(this._oContainer);
    this._oButtonBg = createBitmap(i);
    this._oButtonBg.regX = this._iWidth / 2;
    this._oButtonBg.regY = this._iHeight / 2;
    this._oContainer.addChild(this._oButtonBg);
    this._oSpriteSheetWhite = this._createDiceSpriteSheet(WHITE);
    this._oSpriteSheetBlack = this._createDiceSpriteSheet(BLACK);
    var o = SKIN_CONFIG[s_iSkinID].dice.name,
      i = s_oSpriteLibrary.getSprite("dice_white_" + o),
      f = i.width / 6,
      e = i.height;
    this._oDice1 = createSprite(this._oSpriteSheetWhite, 0, f / 2, e / 2, f, e);
    this._oDice1.x = -56;
    this._oDice1.stop();
    this._oContainer.addChild(this._oDice1);
    this._oDice2 = createSprite(this._oSpriteSheetWhite, 0, f / 2, e / 2, f, e);
    this._oDice2.x = 56;
    this._oDice2.stop();
    this._oContainer.addChild(this._oDice2);
    this._aDices = [];
    this._aDices[0] = this._oDice1;
    this._aDices[1] = this._oDice2;
    this._aDicesUsed = [];
    this._aDicesUsed[0] = !1;
    this._aDicesUsed[1] = !1;
    this.setDiceColor(u);
  }
  reset() {
    for (var n = 0; n < this._aDices.length; n++) this._aDices[n].alpha = 1, this._aDicesUsed[n] = !1;
  }
  _triggerEvent(n, t) {
    this._aCbCompleted[n] && this._aCbCompleted[n].call(this._aCbOwner[n], t);
  }
  addEventListener = function (n, t, i, r) {
    this._aCbCompleted[n] = t;
    this._aCbOwner[n] = i;
    this._aParams = r;
  };
  _createDiceSpriteSheet(n) {
    var i = SKIN_CONFIG[s_iSkinID].dice.name,
      t = s_oSpriteLibrary.getSprite("dice_black_" + i);
    n === WHITE && (t = s_oSpriteLibrary.getSprite("dice_white_" + i));
    var r = t.width / 6,
      u = t.height,
      f = {
        images: [t],
        frames: {
          width: r,
          height: u,
          regX: r / 2,
          regY: u / 2
        },
        animations: {
          1: [0],
          2: [1],
          3: [2],
          4: [3],
          5: [4],
          6: [5]
        }
      };
    return new createjs.SpriteSheet(f);
  }
  setDiceUsed(n) {
    this._aDices[n].alpha = .3;
    this._aDicesUsed[n] = !0;
  }
  trySetDiceUsed(n) {
    var t, i;
    if (!this.isVisible()) return !1;
    for (t = 0; t < this._aDices.length; t++) if (i = this._aDices[t].currentFrame + 1, n === i && !this._aDicesUsed[t]) return this.setDiceUsed(t), !0;
    return !1;
  }
  trySetAnyAvailableDiceUsed() {
    if (!this.isVisible()) return !1;
    for (var n = 0; n < this._aDices.length; n++) if (!this._aDicesUsed[n]) return this.setDiceUsed(n), !0;
    return !1;
  }
  setClosestMajorDiceUsed(n) {
    var i, t, r, u;
    if (!this.isVisible()) return !1;
    for (i = [], t = 0; t < this._aDices.length; t++) r = this._aDices[t].currentFrame + 1, r > n && this._aDicesUsed[t] === !1 && i.push({
      id: t,
      dist: r - n
    });
    return i.length === 0 ? !1 : (i.sort((n, t) => n.dist - t.dist), u = i[0], this.setDiceUsed(u.id), !0);
  }
  setPosition(n, t) {
    this._oContainer.x = n;
    this._oContainer.y = t;
  }
  setDicesValue(n, t) {
    var r = n - 1,
      i;
    this._oDice1.gotoAndStop(r);
    i = t - 1;
    this._oDice2.gotoAndStop(i);
  }
  setDiceColor(n) {
    this._szColor = n;
    var t = this._oDice1.currentFrame,
      i = this._oDice2.currentFrame;
    n === WHITE ? (this._oDice1.spriteSheet = this._oSpriteSheetWhite, this._oDice2.spriteSheet = this._oSpriteSheetWhite) : (this._oDice1.spriteSheet = this._oSpriteSheetBlack, this._oDice2.spriteSheet = this._oSpriteSheetBlack);
    this._oDice1.gotoAndStop(t);
    this._oDice2.gotoAndStop(i);
  }
  getDiceIDByValue(n) {
    for (var i, t = 0; t < this._aDices.length; t++) if (i = this._aDices[t].currentFrame + 1, i === n) return t;
  }
  getCurColor() {
    return this._szColor;
  }
  setVisible(n) {
    this._oContainer.visible = n;
  }
  isVisible() {
    return this._oContainer.visible;
  }
  stopAnim() {
    createjs.Tween.removeTweens(this._oDice1);
    createjs.Tween.removeTweens(this._oDice2);
  }
  changeSkin() {
    this._oSpriteSheetWhite = this._createDiceSpriteSheet(WHITE);
    this._oSpriteSheetBlack = this._createDiceSpriteSheet(BLACK);
    this.setDiceColor(this._szColor);
  }
  launchAnim(n, t) {
    playSfxSound("dices", 1, !1);
    const i = 6;
    this._iDiceCompleted = 0;
    const r = () => {
      this._iDiceCompleted++, this._iDiceCompleted === 2 && this._triggerEvent(ON_DICE_ROLL_OVER, {
        dice1: n,
        dice2: t
      });
    };
    this._rollDice(this._oDice1, i, 0, n, r);
    this._rollDice(this._oDice2, i, 80, t, r);
  }
  _rollDice(n, t, i, r, u) {
    let f = 0;
    const e = () => {
      if (f >= t) {
        var i = r - 1;
        n.gotoAndStop(i);
        u && u();
        return;
      }
      this._rollOnce(n, () => {
        f++, e();
      });
    };
    setTimeout(e, i);
  }
  _rollOnce(n, t) {
    const r = n.x,
      u = n.y;
    var i = 10;
    createjs.Tween.get(n).to({
      x: r + (Math.random() * i - i / 2),
      y: u + (Math.random() * i - i / 2)
    }, 40, createjs.Ease.quadInOut).to({
      x: r - (Math.random() * i - i / 2),
      y: u - (Math.random() * i - i / 2)
    }, 40, createjs.Ease.quadInOut).to({
      x: r,
      y: u
    }, 40, createjs.Ease.quadInOut).call(() => {
      const i = Math.floor(Math.random() * 6) + 1;
      n.gotoAndStop(i);
      t && t();
    });
  }
}
class CButDices extends CButton {
  constructor(n, t, i, r, u) {
    var i, f;
    super(n, t, i, r);
    this._szColor = u;
    this._oDice = new CDice(0, 0, i, this._oButton, u);
    this._oDice.setDiceColor(u);
    this._oDice.addEventListener(ON_DICE_ROLL_OVER, this._onRollDiceOver, this);
    i = s_oSpriteLibrary.getSprite("label_white");
    this._oPanel = createBitmap(i);
    this._oPanel.regX = i.width / 2;
    this._oPanel.regY = i.height / 2;
    this._oButton.addChild(this._oPanel);
    f = createMarginRect(10, 10, 10, 10);
    this._oText = this.addText(f, TEXT_LAUNCH, "center", PRIMARY_FONT, FONT_COLOR_BLACK, 40, 1, !0);
  }
  unload() {
    this._oSuper.unload.call(this);
    this.stopAnim();
    this._oDiceTimer && this._oDiceTimer.unload();
  }
  reset() {
    this.setLabelVisible(!0);
    this._oDiceTimer && this.showDiceTimer();
    this._oDice.reset();
  }
  _onRollDiceOver(n) {
    this._triggerEvent(ON_DICE_ROLL_OVER, {
      dice1: n.dice1,
      dice2: n.dice2
    });
  }
  setTimer() {
    var n = createMarginRect(10, 10, 100, 10);
    this.setTextSize(0, n);
    this._oDiceTimer = new CMoveTimeController(70, 0, this._oButton, ROLL_DICE_TIME);
    this._oDiceTimer.setAlwaysShown();
    this._oDiceTimer.showAttempt(!1);
  }
  setDiceColor(n) {
    this._oDice.setDiceColor(n);
    var t = s_oSpriteLibrary.getSprite("label_black"),
      i = FONT_COLOR_WHITE;
    n === WHITE && (t = s_oSpriteLibrary.getSprite("label_white"), i = FONT_COLOR_BLACK);
    this._oPanel.image = t;
    this._oText.setColor(i);
  }
  trySetDiceUsed(n) {
    return this._oDice.trySetDiceUsed(n);
  }
  trySetAnyAvailableDiceUsed() {
    return this._oDice.trySetAnyAvailableDiceUsed();
  }
  setClosestMajorDiceUsed(n) {
    return this._oDice.setClosestMajorDiceUsed(n);
  }
  getCurColor() {
    return this._oDice.getCurColor();
  }
  setClickable(n) {
    this._bDisabled = !n;
    this._oButton.cursor = n ? "pointer" : "default";
  }
  stopAnim() {
    this._oDice.stopAnim();
  }
  launchAnim(n, t) {
    this._oDiceTimer && this.hideDiceTimer();
    this._oDice.launchAnim(n, t);
  }
  setLabelVisible(n) {
    this._oPanel.visible = n;
    this._oText.setVisible(n);
  }
  showDiceTimer() {
    this._oDiceTimer.setTime(ROLL_DICE_TIME);
    this._oDiceTimer.startTimer();
  }
  setDiceTimerTime(n) {
    this._oDiceTimer && (this._oDiceTimer.stopTimer(), this._oDiceTimer.setTime(n), this._oDiceTimer.startTimer());
  }
  hideDiceTimer() {
    this._oDiceTimer.stopTimer();
  }
  changeSkin() {
    this._oDice.changeSkin();
  }
}
SKIN_CONFIG = [{
  piece_set: {
    name: "original",
    position: {
      regX: -10,
      regY: -12,
      spacingY: 6
    }
  },
  board: {
    name: "original",
    hinges: !0
  },
  dice: {
    name: "original"
  },
  selection: {
    name: "original"
  }
}, {
  piece_set: {
    name: "flat",
    position: {
      regY: 0,
      offsetY: 0
    }
  },
  board: {
    name: "flat"
  },
  dice: {
    name: "flat"
  },
  selection: {
    name: "flat"
  }
}];