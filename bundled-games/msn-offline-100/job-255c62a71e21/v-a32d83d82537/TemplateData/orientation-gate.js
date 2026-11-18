/* =============================================================================
   ORIENTATION GATE - the JavaScript half of the "rotate your device" screen.

   The screen itself is opened and closed by a media query (orientation-gate.css)
   so that a player who arrives in portrait is covered on the very first painted
   frame, before this file - or the engine - has done anything. What is left for
   JavaScript is the work CSS cannot do:

     1. Decide whether this is a device that can be rotated at all, and mark the
        document with .wd-touch. A desktop player who drags their window tall is
        in "portrait" as far as the media query is concerned, and telling them to
        rotate a monitor would be nonsense. Done synchronously from <head>, so
        the class is in place before the first style pass and the gate still
        never flashes.

     2. Tell Unity, so a live round can be frozen instead of being played blind
        behind the overlay. See OrientationGate.cs - it creates the receiver
        object itself, so there is nothing to wire up in a scene.

     3. Offer the Android shortcut: fullscreen + screen.orientation.lock(), which
        rotates the device FOR the player. Only where it actually works; an
        iPhone gets no button rather than a dead one.

   THE GRACE PERIOD. Rotating back does not resume the round on the same frame.
   The gate lingers for RESUME_GRACE_MS, fading out, and only then is Unity told
   to run again - otherwise the player's thumbs are still off the controls while
   the world is already shooting at them.

   Everything is guarded: if any of this throws, the CSS gate is still up and the
   game is still playable the moment the device is turned. Nothing here is load
   bearing for the game itself.
   ========================================================================== */

var WarDroneOrientation = (function () {
  "use strict";

  /* The GameObject OrientationGate.cs installs, and the method it exposes.
     Keep both in step with that file. */
  var UNITY_OBJECT = "WebOrientationGate";
  var UNITY_METHOD = "SetPortrait";

  /* How long the gate stays up after the device is turned back, in ms. Matches
     the fade in orientation-gate.css (220ms) with room to spare, so the overlay
     is fully transparent before the world starts moving again. */
  var RESUME_GRACE_MS = 550;

  var unityInstance = null;      // set once createUnityInstance resolves
  var gateEl = null;             // #wd-orientation-gate, once the DOM has it
  var actionEl = null;           // the "rotate for me" button, where supported
  var lingerTimer = 0;           // pending end-of-grace-period callback
  var lastSentPortrait = null;   // so we don't spam SendMessage on every resize

  var root = document.documentElement;

  /* ---- What kind of device is this? --------------------------------------- */

  /* True for anything the player can physically turn. Three signals, because no
     single one covers the field:
       - pointer: coarse   the standards-track answer, right on virtually every
                           phone and tablet in use
       - the user agent    a backstop for browsers that report a fine pointer
                           while a stylus or mouse is paired
       - maxTouchPoints    an iPad running "Request Desktop Website", which
                           claims to be a Macintosh and is otherwise
                           indistinguishable from one */
  function isRotatableDevice() {
    try {
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
        return true;

      var ua = navigator.userAgent || "";
      if (/Android|iPhone|iPod|iPad|IEMobile|BlackBerry|Opera Mini|Mobile/i.test(ua))
        return true;

      if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
        return true;
    } catch (e) { /* a locked-down browser: fall through to "desktop" */ }

    return false;
  }

  /* The same question the stylesheet asks, so the two can never disagree about
     what is on screen. innerHeight is only a fallback for browsers without
     matchMedia, which in practice means none of them. */
  function isPortrait() {
    try {
      if (window.matchMedia)
        return window.matchMedia("(orientation: portrait)").matches;
    } catch (e) { /* fall through */ }

    return window.innerHeight > window.innerWidth;
  }

  /* True while the gate is on screen for real - both conditions the stylesheet
     applies, and nothing else. */
  function isGateShowing() {
    return root.classList.contains("wd-touch") && isPortrait();
  }

  /* ---- Talking to Unity ---------------------------------------------------- */

  /* Push the state across the bridge, at most once per actual change. The engine
     may not have loaded yet, in which case this is a no-op and attach() replays
     the current state the moment it has. */
  function sendToUnity(portrait) {
    if (lastSentPortrait === portrait)
      return;

    lastSentPortrait = portrait;

    if (!unityInstance || typeof unityInstance.SendMessage !== "function")
      return;

    try {
      unityInstance.SendMessage(UNITY_OBJECT, UNITY_METHOD, portrait ? 1 : 0);
    } catch (e) {
      /* The receiver is installed before the first scene loads and never
         destroyed, so this should not happen - but a failed pause must not take
         the page down with it. */
      console.warn("[orientation] could not reach Unity:", e);
    }
  }

  /* ---- The state machine --------------------------------------------------- */

  /* Called on every orientation / resize event. Blocking is immediate; releasing
     waits out the grace period. */
  function refresh() {
    var showing = isGateShowing();

    if (showing) {
      /* Turned INTO portrait (or still there). Cancel any pending release - the
         player rotated back and away again inside half a second - and freeze
         straight away: every frame of delay is a frame played blind. */
      if (lingerTimer) {
        clearTimeout(lingerTimer);
        lingerTimer = 0;
      }
      root.classList.remove("wd-gate-linger");

      if (gateEl) gateEl.setAttribute("aria-hidden", "false");
      sendToUnity(true);
      return;
    }

    /* Turned back to landscape. If we were never blocking, there is nothing to
       release (this is the ordinary path on every desktop resize). */
    if (lastSentPortrait !== true || lingerTimer)
      return;

    /* Hold the overlay up, fading, and let the round resume once it is gone. */
    root.classList.add("wd-gate-linger");

    lingerTimer = setTimeout(function () {
      lingerTimer = 0;
      root.classList.remove("wd-gate-linger");

      if (gateEl) gateEl.setAttribute("aria-hidden", "true");
      sendToUnity(false);
    }, RESUME_GRACE_MS);
  }

  /* ---- Rotating the device for the player ---------------------------------- */

  /* Whether this browser can be ASKED to rotate. Chrome on Android honours
     screen.orientation.lock() but only from inside a fullscreen element, so both
     halves have to be present; Safari on iPhone has neither and gets no button.
     Note this is a capability check, not a promise - lock() can still be refused
     at the OS level (rotation lock switched on), which tryLockLandscape handles. */
  function canAutoRotate() {
    try {
      var el = document.documentElement;
      var hasFullscreen = !!(el.requestFullscreen || el.webkitRequestFullscreen);
      var hasLock = !!(window.screen && screen.orientation &&
                       typeof screen.orientation.lock === "function");
      return hasFullscreen && hasLock;
    } catch (e) {
      return false;
    }
  }

  /* Ask the OS for landscape. Safe to call at any time and from anywhere - it
     resolves to false rather than throwing when the browser says no, which is
     the common case (not fullscreen, or the player has rotation locked). */
  function tryLockLandscape() {
    try {
      if (!window.screen || !screen.orientation || typeof screen.orientation.lock !== "function")
        return Promise.resolve(false);

      return screen.orientation.lock("landscape").then(function () {
        return true;
      }, function () {
        return false;
      });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  function requestFullscreen(el) {
    try {
      if (el.requestFullscreen) return el.requestFullscreen();
      if (el.webkitRequestFullscreen) return Promise.resolve(el.webkitRequestFullscreen());
    } catch (e) { /* refused: the lock below simply won't take */ }

    return Promise.resolve();
  }

  /* The button's click. Fullscreen FIRST - the lock is only granted to a
     fullscreen document - then the rotate. Both are best-effort: if either is
     refused the player is exactly where they started, looking at an instruction
     telling them to turn the phone themselves. */
  function onActionClick() {
    var target = document.getElementById("unity-container") || document.documentElement;

    Promise.resolve(requestFullscreen(target))
      .catch(function () { /* handled below by the lock failing too */ })
      .then(tryLockLandscape)
      .then(function (locked) {
        /* Rotation is locked in the OS settings, or the browser lied about
           lock() existing. Retire the button rather than leave one that does
           nothing when tapped. */
        if (!locked) root.classList.remove("wd-gate-can-autorotate");
      });
  }

  /* ---- Wiring -------------------------------------------------------------- */

  /* Runs from <head>, before the body exists. Only the classes are set here -
     they are what the stylesheet keys off, and they have to be in place before
     the first style pass or the gate flashes. */
  function markDocument() {
    if (isRotatableDevice()) root.classList.add("wd-touch");
    if (canAutoRotate()) root.classList.add("wd-gate-can-autorotate");
  }

  /* Runs once the markup exists. Grabs the elements, hooks up every event that
     can change orientation, and takes the first reading. */
  function bind() {
    gateEl = document.getElementById("wd-orientation-gate");

    actionEl = document.getElementById("wd-gate-action");
    if (actionEl) actionEl.addEventListener("click", onActionClick);

    /* Belt and braces. matchMedia is the accurate one; orientationchange fires
       on older mobile browsers; resize catches the phones that reflow without
       announcing either. refresh() is idempotent, so extra calls cost nothing. */
    try {
      var mq = window.matchMedia("(orientation: portrait)");
      if (mq.addEventListener) mq.addEventListener("change", refresh);
      else if (mq.addListener) mq.addListener(refresh);
    } catch (e) { /* resize below still covers us */ }

    window.addEventListener("orientationchange", refresh);
    window.addEventListener("resize", refresh);

    refresh();
  }

  /* Called from index.html once createUnityInstance resolves. The engine has
     almost certainly missed the state we recorded during loading - a player can
     sit in portrait through the whole download - so replay it. */
  function attach(instance) {
    unityInstance = instance;

    var showing = isGateShowing();
    lastSentPortrait = null;      // force the replay past sendToUnity's guard
    sendToUnity(showing);
  }

  markDocument();

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bind);
  else
    bind();

  return {
    attach: attach,
    tryLockLandscape: tryLockLandscape,
    isPortrait: isPortrait,
    isShowing: isGateShowing
  };
})();
