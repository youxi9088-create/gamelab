// ---- UI core (module split stage 11): stacked modal dialogs (ask/notify), ✕ close-all, toasts ----
// Modals stack: opening one (e.g. a portrait's bio) over another returns to the previous on close.
const $ = id => document.getElementById(id);
let playSfx = () => {}, DENY_RE = /$^/;
export function initUI(h) { ({ playSfx, DENY_RE } = h); }

let askCur = null;
const askStack = [];
export const isCloseOpt = o => /^(Close|OK|Back|Cancel|Done|← Back|Never mind|Continue|Keep at Court)$/i.test(String(o).trim());
export const hasExit = o => /^(Close|Back|Cancel|Done|← Back|Never mind|OK|Keep at Court)$/i.test(String(o).trim());
export const closeOptOf = opts => opts.find(hasExit) ?? opts.find(isCloseOpt) ?? opts[opts.length - 1];
let closeAllUntil = 0;
// Is any dialog open?
export const modalOpen = () => !!askCur;
// Resolve EVERY open dialog with 'Close' (so whatever awaited them can finish and release `busy`)
export function dismissAll() {
  const open = [...askStack, ...(askCur ? [askCur] : [])];
  askStack.length = 0; askCur = null; $('modal').style.display = 'none';
  open.reverse().forEach(a => { try { a.res('Close'); } catch (e) {} });
}
// Close only the current dialog, resolving it with value v (the previous one reappears)
export function resolveTop(v) {
  if (!askCur) return false;
  const cur = askCur;
  askCur = askStack.pop() || null;
  if (askCur) showAsk(); else $('modal').style.display = 'none';
  cur.res(v);
  return true;
}
// ✕ True close: dismiss every stacked menu at once (menus that re-open themselves are closed too)
export function closeAllModals() {
  closeAllUntil = performance.now() + 700;
  const all = [askCur, ...askStack.slice().reverse()].filter(Boolean);
  const keep = all.filter(a => !a.opts.some(hasExit)).reverse(); // forced decisions (battle fates etc.) stay open
  const shut = all.filter(a => a.opts.some(hasExit));
  askStack.length = 0; keep.forEach(a => askStack.push(a));
  askCur = askStack.pop() || null;
  if (askCur) showAsk(); else $('modal').style.display = 'none';
  shut.forEach(a => a.res(a.opts.find(hasExit)));
}
// Spectator simulation: answers dialogs automatically instead of showing them
let autoAsk = null;
export const setAutoAsk = fn => { autoAsk = fn; };
// Standing orders / report budget (steward.js): may answer a dialog for the player; undefined = show it
let turnFilter = null;
export const setTurnFilter = fn => { turnFilter = fn; };
export function ask(html, opts) {
  if (!opts?.length) opts = ['Close']; // never show a dialog with no way out
  if (autoAsk) return Promise.resolve(autoAsk(html, opts));
  if (turnFilter) { let v; try { v = turnFilter(html, opts); } catch (e) { v = undefined; } if (v !== undefined) return Promise.resolve(v); }
  if (performance.now() < closeAllUntil && opts.some(hasExit)) return Promise.resolve(opts.find(hasExit));
  return new Promise(res => {
    if (askCur) askStack.push(askCur);
    askCur = { html, opts, res };
    showAsk();
  });
}
export function showAsk() {
  const { html, opts, res } = askCur;
  $('modalBody').innerHTML = html + '<div id="mb"></div>';
  const done = o => { askCur = askStack.pop() || null; if (askCur) showAsk(); else $('modal').style.display = 'none'; res(o); };
  // Pinned cycler arrows (data-cy) resolve like options but live in a fixed spot at the top
  $('modalBody').querySelectorAll('[data-cy]').forEach(el => { el.onclick = e => { e.stopPropagation(); done(el.dataset.cy); }; });
  const isClose = o => /^(Close|OK|Back|Cancel|Done|← Back|Never mind)$/i.test(o.trim());
  const nested = askStack.length > 0;
  // Nested menus: the bottom button steps back one menu; ✕ in the corner closes them all
  if (opts.some(hasExit)) {
    const x = document.createElement('button');
    x.className = 'mbX'; x.textContent = '✕'; x.title = 'Close all menus';
    x.onclick = e => { e.stopPropagation(); closeAllModals(); };
    $('modalBody').prepend(x);
  }
  [...opts.filter(o => !isClose(o)), ...opts.filter(isClose)].forEach(o => {
    const b = document.createElement('button');
    b.textContent = nested && /^(Close|Back|← Back)$/i.test(o.trim()) ? '◀ Back' : o;
    if (isClose(o)) b.className = 'mbClose';
    b.onclick = () => done(o);
    $('mb').appendChild(b);
  });
  $('modalBody').scrollTop = 0; $('modalBody').parentElement.scrollTop = 0;
  $('modal').style.display = 'flex';
}
// Short, non-blocking result banner (agent actions etc.)
export function toast(html, ok = true) {
  if (autoAsk) return;
  let box = document.getElementById('toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'toast ' + (ok ? 'ok' : 'bad'); el.innerHTML = html;
  el.onclick = () => el.remove();
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), 5200); setTimeout(() => el.remove(), 5800);
}
export const notify = h => { if (typeof h === 'string' && h.length < 260 && DENY_RE.test(h.replace(/<[^>]+>/g, ''))) playSfx('deny'); return ask(h, ['OK']); };
