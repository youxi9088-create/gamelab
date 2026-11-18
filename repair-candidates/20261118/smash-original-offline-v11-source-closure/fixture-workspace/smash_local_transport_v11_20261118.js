(function (root) {
  "use strict";
  const active = new WeakMap();
  function attach(Module, options) {
    options = options || {};
    if (active.has(Module)) return active.get(Module);
    const api = Module.asm || Module;
    const prepare = api.gamelab_local_transport_prepare;
    const state = api.gamelab_local_transport_client_state;
    if (typeof prepare !== "function" || typeof state !== "function") throw new Error("Missing original-local transport bridge");
    const setTimer = options.setInterval || root.setInterval.bind(root);
    const clearTimer = options.clearInterval || root.clearInterval.bind(root);
    const now = options.now || Date.now;
    const onError = options.onError || function (error) { if (root.console) root.console.error("Local transport unavailable", error); };
    let timer = null, stopped = false, ready = false, error = null;
    const started = now();
    if (!Number.isFinite(started)) throw new Error("Invalid local observation clock");
    function stop() { stopped = true; if (timer !== null) clearTimer(timer); timer = null; }
    function tick() {
      if (stopped) return;
      try {
        const current = now();
        if (!Number.isFinite(current) || current < started || current - started > 90000) throw new Error("Original local transport did not become ready within 90 seconds");
        const result = prepare();
        if (result < 0) throw new Error("Original local transport or local identity rejected initialization");
        if (result === 0) return;
        if (result !== 1) throw new Error("Unexpected local transport result");
        const actual = state(0);
        if (actual !== 15 && actual !== 9) throw new Error("Original mode-aware client state is neither local lobby nor local room");
        ready = true; stop();
      } catch (e) { error = e; stop(); onError(e); }
    }
    const controller = { stop, get ready() { return ready; }, get error() { return error; } };
    active.set(Module, controller);
    timer = setTimer(tick, 250);
    return controller;
  }
  const api = Object.freeze({ attach });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GameLabLocalTransport = api;
})(typeof globalThis === "undefined" ? this : globalThis);
