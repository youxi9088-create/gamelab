// Starblade icon system: every emoji/pictograph that reaches the DOM is swapped for the game's own
// engraved-gold icon art (assets/ic-*.webp). Unmapped pictographs are stripped so no stock emoji ever shows.
const I = n => `assets/ic-${n}.webp`;
const MAP = {
  war: '⚔🤺🪖', shield: '🛡🏰🧱', skull: '💀☠😠⛔👹', loyalty: '❤💗💛💖💔', scroll: '📜📋🗳📝✏📃📄',
  faith: '✝⛪🕯🙏🌅⛩☦', crown: '👑👸🤴', planet: '🪐🌍🌎🌏🌌🌐🛣', credits: '💰💸🪙💎', fleet: '🚀🛸✈',
  elite: '⭐🌟🏅🎖', station: '🛰📡', build: '🏗🔨⚒🏛⛏🏚🏭', hourglass: '⏳⌛⏸📅🎂⏱', news: '✉📨📩📰📬',
  faction: '⚜⚑🚩', book: '📖📚📂💾🎬🗂', sound: '🔊🔈🔉🎵🎶', dialogue: '💬🗨🗯', apocalypse: '☢⚠🔥☣',
  blood: '🩸', grave: '🪦⚰', diplomat: '🕊☮', dagger: '🗡🔪⛓🔀', witch: '🔮🧙', dark: '🌑🌒☯🌫🖤',
  trophy: '🏆🥇', pin: '📍📌', gear: '⚙🛠🤖🦾🔧', scout: '🔭🔬🔎👁🧭🕵👀', dynasty: '🌳👥👶🎓👤👪',
  ring: '💍⚭', alliance: '🤝', retreat: '🏳', blast: '💥☄💣⚡✨', target: '🎯',
};
const TXT = { '✅': '✓', '⬜': '□', '❌': '✕', '🗑': '✕', '➕': '+', '➖': '−', '🔇': '' };
const LUT = new Map();
for (const [k, s] of Object.entries(MAP)) for (const ch of s) LUT.set(ch, k);
// Typographic symbols we keep as plain text
const KEEP = new Set(['◀', '▶', '↪', '♔', '✠', '↺', '⇄', '▸', '▾', '©', '®', '™', '‼', '↔', '↩', '⤴', '⤵', '▲', '▼']);
const RE = /\p{Extended_Pictographic}[\uFE0F\u20E3]?(?:\u200D\p{Extended_Pictographic}[\uFE0F]?)*[\u{1F3FB}-\u{1F3FF}]?/gu;
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'svg', 'SVG', 'CANVAS']);

function iconHTML(name, muted) {
  const img = document.createElement('img');
  img.className = 'ico' + (muted ? ' muted' : '');
  img.alt = ''; img.draggable = false;
  // A failed load (flaky network/preview gateway) retries once, then hides instead of showing a broken image
  img.onerror = () => { if (!img.dataset.retry) { img.dataset.retry = '1'; setTimeout(() => { img.src = I(name) + '?r=' + Date.now(); }, 800); } else img.style.display = 'none'; };
  img.src = I(name);
  return img;
}
function fixText(node) {
  const t = node.nodeValue;
  if (!t || !RE.test(t)) { RE.lastIndex = 0; return; }
  RE.lastIndex = 0;
  const frag = document.createDocumentFragment();
  let last = 0, m, changed = false;
  while ((m = RE.exec(t))) {
    const raw = m[0], base = [...raw][0];
    if (KEEP.has(base)) continue;
    changed = true;
    if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
    if (base === '🔇') frag.appendChild(iconHTML('sound', true));
    else if (TXT[base] != null) { if (TXT[base]) frag.appendChild(document.createTextNode(TXT[base])); }
    else if (LUT.has(base)) frag.appendChild(iconHTML(LUT.get(base)));
    last = m.index + raw.length;
  }
  if (!changed) return;
  if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last).replace(/^\uFE0F/, '')));
  node.parentNode?.replaceChild(frag, node);
}
function walk(root) {
  if (!root) return;
  if (root.nodeType === 3) { if (!inSkip(root.parentNode)) fixText(root); return; }
  if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (inSkip(n.parentNode) ? 2 : 1) });
  const list = []; let n;
  while ((n = tw.nextNode())) list.push(n);
  list.forEach(fixText);
  // Tooltips too
  if (root.title) root.title = root.title.replace(RE, '').trim();
}
function inSkip(el) {
  for (let e = el; e && e !== document.body; e = e.parentNode) if (SKIP.has(e.nodeName)) return true;
  return false;
}
export function initIcons() {
  // Preload so icons never pop in
  Object.keys(MAP).forEach(k => { const i = new Image(); i.src = I(k); });
  walk(document.body);
  new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') fixText(m.target);
      else m.addedNodes.forEach(walk);
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}
