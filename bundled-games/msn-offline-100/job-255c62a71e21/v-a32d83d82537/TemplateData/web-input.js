/* =============================================================================
   WEB INPUT GLUE - two browser-only input fixes for the game on Poki (and any
   other host that embeds the build in an iframe).

   1. THE ZOOM SCROLL LEAKING TO THE HOST PAGE.

      The game zooms with the mouse wheel. Unity reads the wheel through its own
      input, but it does NOT call preventDefault on the DOM event - so the very
      same scroll ALSO performs the browser's default action, and inside a Poki
      iframe with nothing scrollable that action chains up to the parent and
      scrolls the Poki page around the game. Here we preventDefault every wheel
      over the canvas: Unity still reads the delta (preventDefault stops the
      browser's scroll, not the event's delivery), and the host page sits still.
      touchmove and gesture events are handled the same way for the phone case.

   2. THE "PRESS ESC TWICE TO PAUSE" BUG.

      Pause is bound to Esc. But in a browser, Esc is the key that leaves pointer
      lock, and WHILE the pointer is locked the browser swallows the Esc keydown -
      it never reaches Unity, so the game can't pause on the first press. The
      player sees the cursor pop out (the browser's doing) with the round still
      live, and only a second Esc - now that the pointer is already free - gets
      through to pause.

      The fix keys off the thing that DOES fire reliably: the pointer actually
      being released (pointerlockchange). When it is released we tell Unity, and
      Unity decides whether a round is running and should pause. One Esc, one
      pause. It also means the round pauses when the tab loses focus, which drops
      the lock too - the right thing for a browser game.

   Everything is guarded so a failure here can never take input down with it. The
   wheel half needs no engine; the pause half is a no-op until attach() has been
   handed the Unity instance.
   ========================================================================== */

var WarDroneInput = (function () {
  "use strict";

  /* The receiver GameObject and method - must match WebInputBridge.cs. */
  var UNITY_OBJECT = "WebInputBridge";
  var UNITY_METHOD = "OnPointerUnlocked";

  var unityInstance = null;
  var wasLocked = false;      // so we only report the locked -> unlocked edge

  /* ---- 1. Keep scroll / touch gestures off the host page ------------------ */

  function swallow(e) {
    // passive:false is what makes this preventable; without it the call is a
    // no-op and the browser warns. The listeners below are all registered with
    // { passive: false }.
    if (e.cancelable) e.preventDefault();
  }

  function bindScrollContainment() {
    var canvas = document.getElementById("unity-canvas");
    var container = document.getElementById("unity-container");
    var target = canvas || container;
    if (!target) return;

    // The wheel zoom. Capture phase so we run before anything that might stop
    // the event, and non-passive so preventDefault actually bites.
    target.addEventListener("wheel", swallow, { passive: false, capture: true });

    // Trackpad pinch on desktop Safari/Chrome arrives as gesture* / ctrl+wheel;
    // the ctrl+wheel case is already caught above, these cover the rest.
    target.addEventListener("gesturestart", swallow, { passive: false });
    target.addEventListener("gesturechange", swallow, { passive: false });

    // Phone: stop a drag on the canvas from scrolling the Poki page or firing
    // pull-to-refresh. Unity's own touch handling still receives these - again,
    // preventDefault stops the page's reaction, not the delivery to Unity.
    target.addEventListener("touchmove", swallow, { passive: false });
  }

  /* ---- 2. Pause when the browser releases the pointer --------------------- */

  function lockedElement() {
    return document.pointerLockElement ||
           document.mozPointerLockElement ||
           document.webkitPointerLockElement ||
           null;
  }

  function onPointerLockChange() {
    var locked = !!lockedElement();

    // Only the moment the pointer goes from ours to gone. Acquiring it (null ->
    // locked) is the player clicking to aim and is none of our business.
    if (wasLocked && !locked) {
      sendUnlocked();
    }
    wasLocked = locked;
  }

  function sendUnlocked() {
    if (!unityInstance || typeof unityInstance.SendMessage !== "function")
      return;

    try {
      // A value is passed only because SendMessage needs one to match the C#
      // signature; WebInputBridge ignores it.
      unityInstance.SendMessage(UNITY_OBJECT, UNITY_METHOD, "1");
    } catch (e) {
      // A pause that fails must never break the page. Worst case the player is
      // back to pressing Esc a second time - exactly today's behaviour.
      console.warn("[web-input] could not reach Unity:", e);
    }
  }

  /* ---- Wiring ------------------------------------------------------------- */

  function bind() {
    bindScrollContainment();

    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mozpointerlockchange", onPointerLockChange);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange);

    // Seed the state in case the pointer is somehow already locked by now.
    wasLocked = !!lockedElement();
  }

  /* Called from index.html once createUnityInstance resolves. Before this the
     pause half is dormant (nothing to SendMessage to) but the scroll half is
     already live from bind(). */
  function attach(instance) {
    unityInstance = instance;
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", bind);
  else
    bind();

  return { attach: attach };
})();
