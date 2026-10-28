/* Explicit local host adapter. Rewarded ads remain unavailable.
   The surface below was enumerated from real 17yoo game bundles (every
   MINI_GAME_SDK.* call site under converted/assets): a bundle only needs the
   members it touches to exist, so a missing `tip`/`room`/`chat`/`jump` used to
   throw "Cannot read properties of undefined (reading 'show')" during onLoad
   and strand the game on its splash screen.
   Registration-style calls keep the callback on window instead of dropping it:
   offline single-player never produces those events, and inventing them (a
   chat message, an invite, a logged-in user) would be a fake success. */
(() => {
  const noop = () => {};
  const register = name => (...args) => {
    const callback = [...args].reverse().find(arg => typeof arg === 'function');
    if (callback) (window.__miniGameSdkHandlers ||= {})[name] = callback;
  };
  window.MINI_GAME_SDK = {
    dot: { start: noop },
    pause: { show: register('pause.show'), send: noop },
    video(options) { options?.fail?.(); options?.end?.(); },
    rank: { post: noop },
    tip: { show: register('tip.show') },
    room: { join: register('room.join') },
    chat: { show: register('chat.show'), send: noop },
    jump: { join: register('jump.join'), accept: register('jump.accept') },
    fight: { create: register('fight.create'), join: register('fight.join'), sync: noop },
    user: { get: register('user.get') },
    token: { get: register('token.get') },
    robot: { get: register('robot.get') },
    // Consumed by a switch with a default branch; empty means "local host
    // reports no locale" rather than a fabricated one.
    language: { get: () => '' },
  };
  window.showRank = () => {};
})();
