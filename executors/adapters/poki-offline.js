/* Standalone host. No online identity, advertisements, payments or rewards. */
(() => {
  const events = [];
  const record = (name, value) => {
    if (events.length < 100) events.push({name, time: Date.now(), value});
  };
  window.__offlineHost = {kind: 'poki-offline', events};
  // Exact known host-only redirect, not a hostname spoof or a general eval filter.
  // Unknown scripts and bridge versions retain their original behaviour.
  const siteCheck = "const _0x1918 = ['top', 'indexOf', 'aHR0cHM6Ly9wb2tpLmNvbS9zaXRlbG9jaw==', 'hostname', 'length', 'location', 'LnBva2ktZ2RuLmNvbQ==', 'href']; (function (_0x4a02b5, _0x5c0c3d) { const _0x56a85d = function (_0x375c0e) { while (--_0x375c0e) { _0x4a02b5.push(_0x4a02b5.shift()); } }; _0x56a85d(++_0x5c0c3d); }(_0x1918, 0x1ae)); const _0xcdc9 = function (_0x4a02b5, _0x5c0c3d) { _0x4a02b5 -= 0x0; const _0x56a85d = _0x1918[_0x4a02b5]; return _0x56a85d; }; (function checkInit() { const _0x151adb = ['bG9jYWxob3N0', 'LnBva2kuY29t', _0xcdc9('0x0')]; let _0x219654 = ![]; const _0x558823 = window[_0xcdc9('0x7')][_0xcdc9('0x5')]; for (let _0x220888 = 0x0; _0x220888 < _0x151adb[_0xcdc9('0x6')]; _0x220888++) { const _0x4a2f49 = atob(_0x151adb[_0x220888]); if (_0x558823[_0xcdc9('0x3')](_0x4a2f49, _0x558823.length - _0x4a2f49.length) !== -0x1) { _0x219654 = !![]; break; } } if (!_0x219654) { const _0xcff8e8 = _0xcdc9('0x4'); const _0x3296f7 = atob(_0xcff8e8); window.location[_0xcdc9('0x1')] = _0x3296f7; window[_0xcdc9('0x2')][_0xcdc9('0x7')] !== window[_0xcdc9('0x7')] && (window[_0xcdc9('0x2')][_0xcdc9('0x7')] = window[_0xcdc9('0x7')]); } }());";
  const module = window.Module;
  if (module && typeof module.onRuntimeInitialized === 'function') {
    const initialize = module.onRuntimeInitialized;
    module.onRuntimeInitialized = function (...args) {
      const table = window.ASM_CONSTS;
      const bridges = table && Object.keys(table).filter(key =>
        typeof table[key] === 'function' &&
        /eval\(UTF8ToString\(/.test(Function.prototype.toString.call(table[key])) &&
        Function.prototype.toString.call(table[key]).includes('_dmScript_Html5ReportOperationSuccess'));
      if (bridges?.length === 1 && typeof window.UTF8ToString === 'function' &&
          typeof window.stringToNewUTF8 === 'function' &&
          typeof window._dmScript_Html5ReportOperationSuccess === 'function') {
        const key = bridges[0], original = table[key];
        table[key] = function (pointer) {
          if (window.UTF8ToString(pointer) !== siteCheck) return original.apply(this, arguments);
          record('local-host-navigation-suppressed', 'poki-sitelock-v1');
          window._dmScript_Html5ReportOperationSuccess(1);
          return window.stringToNewUTF8('undefined');
        };
        record('local-host-navigation-policy', 'poki-sitelock-v1');
      } else record('local-host-navigation-unsupported');
      return initialize.apply(this, args);
    };
  }
  window.PokiSDK = {
    init: () => { record('init-unavailable'); return Promise.reject(new Error('Online Poki host unavailable in offline package')); },
    setDebug: () => {},
    gameLoadingStart: () => record('loading-start'),
    gameLoadingProgress: data => record('loading-progress', data?.percentageDone),
    gameLoadingFinished: () => record('loading-finished'),
    gameplayStart: () => record('gameplay-start'),
    gameplayStop: () => record('gameplay-stop'),
    happyTime: value => record('happy-time', value),
    commercialBreak: async callback => { record('commercial-unavailable'); if (typeof callback === 'function') callback(); return false; },
    rewardedBreak: async () => { record('reward-unavailable'); return false; },
    displayAd: async () => { record('banner-unavailable'); return false; },
    destroyAd: () => {},
    getURLParam: name => new URL(location.href).searchParams.get(name),
  };
})();
