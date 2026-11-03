const PIXELS = [
  [8, 28, 0, 11], [16, 68, 2, 14], [25, 38, 5, 12], [34, 76, 1, 15],
  [46, 22, 4, 13], [58, 72, 7, 16], [67, 31, 3, 12], [75, 62, 6, 14],
  [84, 35, 2, 13], [91, 73, 5, 16], [53, 46, 8, 15], [30, 18, 7, 14],
];

export function heroScene() {
  return `<div class="simple-glow"></div>
    <div class="hero-water-sheen"></div>
    <div class="hero-cloud hero-cloud-a"></div>
    <div class="hero-cloud hero-cloud-b"></div>
    <svg class="hero-balloon" viewBox="0 0 32 44" aria-hidden="true">
      <path fill="#ffe38a" d="M8 2h16v3h5v5h3v12h-4v5h-5v4H9v-4H4v-5H0V10h3V5h5z"/>
      <path fill="#f49b62" d="M8 5h5v22H9v-4H4v-5H2V10h3V6h3zm11 0h5v1h3v4h3v12h-4v5h-5v-22z"/>
      <path fill="#fff3bd" d="M13 5h6v22h-6z"/>
      <path fill="#654d70" d="M10 31h2v7h-2zm10 0h2v7h-2z"/>
      <path fill="#9a5d4f" d="M11 37h10v5H11z"/>
    </svg>
    <svg class="hero-sailboat" viewBox="0 0 44 32" aria-hidden="true">
      <path fill="#f4f1dc" d="M20 2h3v19h-3zM24 5h3v3h5v3h4v7H24zM18 8h-3v3h-5v3H6v4h12z"/>
      <path fill="#35427c" d="M4 21h36v3h-4v4H11v-3H7v-4z"/>
      <path fill="#8ff0e7" d="M0 29h13v2H0zm27 0h17v2H27z"/>
    </svg>
    <div class="hero-pixels">${PIXELS.map(([x, y, delay, duration]) => `<i style="--x:${x}%;--y:${y}%;--delay:-${delay}s;--duration:${duration}s"></i>`).join('')}</div>`;
}

export function bindHeroMotion() {
  const hero = document.querySelector('.playground-hero');
  if (!hero || hero.dataset.motionBound === 'true') return;
  hero.dataset.motionBound = 'true';

  const toggle = hero.querySelector('[data-motion-toggle]');
  const setPaused = (paused) => {
    hero.dataset.motion = paused ? 'paused' : 'running';
    localStorage.setItem('hero-motion-paused', String(paused));
    if (toggle) {
      toggle.textContent = paused ? '播放动态' : '暂停动态';
      toggle.setAttribute('aria-label', paused ? '播放背景动画' : '暂停背景动画');
      toggle.setAttribute('aria-pressed', String(paused));
    }
  };
  if (toggle) {
    toggle.textContent = hero.dataset.motion === 'paused' ? '播放动态' : '暂停动态';
    toggle.addEventListener('click', () => setPaused(hero.dataset.motion !== 'paused'));
  }

}
