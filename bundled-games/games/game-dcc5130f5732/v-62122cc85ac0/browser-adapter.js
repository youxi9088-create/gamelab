// Browser audio must start after a user gesture. Keep the latest requested music.
(() => {
  const manager = Laya.SoundManager;
  const playMusic = manager.playMusic;
  let ready = false, pending;
  manager.playMusic = function (...args) {
    if (!ready) { pending = args; return null; }
    return playMusic.apply(this, args);
  };
  window.addEventListener('pointerdown', () => {
    ready = true;
    if (pending) { const args = pending; pending = null; playMusic.apply(manager, args); }
  }, { once: true });
})();
