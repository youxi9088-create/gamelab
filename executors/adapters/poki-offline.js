/* Standalone host. No online identity, advertisements, payments or rewards. */
(() => {
  const events = [];
  const record = (name, value) => {
    if (events.length < 100) events.push({name, time: Date.now(), value});
  };
  window.__offlineHost = {kind: 'poki-offline', events};
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
