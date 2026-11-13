// ---- Galactic Wiki: an in-universe archive, generated from the save's history ----
// Sources: character deeds (c.hist), the ledger (S.ledger), and the archive S.wiki {battles, wars, reigns}.
import { S, F, CH, systems, units, P } from './state.js';

let portrait = () => '', dn = c => c?.name || '?', title = () => '', rt = () => 'Ruler', heir = () => null, heirs = () => [], prep = () => {};
export function initWiki(h) { ({ portrait, dn } = h); if (h.title) title = h.title; if (h.rt) rt = h.rt; if (h.heir) heir = f => { try { return h.heir(f); } catch (e) { return null; } }; if (h.heirs) heirs = f => { try { return h.heirs(f) || []; } catch (e) { return []; } }; if (h.prep) prep = h.prep; }
const RN = r => ({ Spy: 'Probe AI', Assassin: 'Bounty Hunter', Priest: 'Nameless Monk', Master: 'Nameless Master', Acolyte: 'Dark Acolyte' }[r] || r);
const tdn = c => { const t = c ? title(c) : ''; return t ? `${t} ${dn(c)}` : dn(c); }; // titled display name

// ================= Archive writers (called from game code) =================
const W = () => { const w = (S.wiki ??= {}); w.battles ??= []; w.wars ??= []; w.reigns ??= []; return w; };
const nW = id => systems.filter(s => s.owner === id).length;
const wkey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
export function wikiBattle(b) {
  const w = W(), r = S.recl, inR = r?.wid != null && (b.at === r.target?.i || ((r.joined || []).concat(r.by).includes(b.a) && b.d === r.tid) || ((r.joined || []).concat(r.by).includes(b.d) && b.a === r.tid));
  b.war = inR ? r.wid : openWar(b.a, b.d)?.id ?? null;
  for (const [g, k] of [[b.ga, 'sa'], [b.gd, 'sd']]) { const c = CH[g]; if (c?.starblade) { if (!c.bladeId) wikiBlade(c, 'armed'); b[k] = c.bladeId; } }
  battles(); b.id = (S.wbId = (S.wbId || 0) + 1); b.tn = S.turn; w.battles.push(b); if (w.battles.length > 800) w.battles.shift();
  // Commanders slain or taken during the fight itself are reported before the battle is archived
  PF = PF.filter(x => x.tn === S.turn && !attachFate(b, CH[x.c], x.k, x.by, x.t)); }
let PF = [];
function attachFate(b, c, k, by, t) {
  if (!c) return false;
  const cmd = b.ga === c.id || b.gd === c.id, lost = b.k === 'land' && bWin(b) != null && bWin(b) !== c.f && (b.a === c.f || b.d === c.f);
  if (!cmd && (k === 'died' || k.endsWith('-end') || !lost)) return false;
  const fs = (b.fates ??= []);
  if (!fs.some(x => x.c === c.id && x.k === k)) fs.push({ c: c.id, k, by: by ?? null, t: t || '', cmd });
  if (['captive', 'ward', 'enslaved'].includes(k)) { b.wid ??= (S.wbN = (S.wbN || 0) + 1); c.fb = b.wid; }
  return true;
}
// Fates after a battle: called from main.js life()/setFate. Commanders' fates go to their battle of this turn;
// other lords (heirs taken as wards, captured courtiers) go to the land battle their house just lost.
const FATE_K = ['died', 'captive', 'ward', 'enslaved', 'exiled', 'tortured', 'sold', 'captive-end', 'enslaved-end', 'ward-end', 'fealty'];
export function wikiFate(c, k, by, t) {
  if (!c || !FATE_K.includes(k)) return;
  const bs = W().battles;
  for (let i = bs.length - 1; i >= 0; i--) {
    const b = bs[i];
    if (b.tn !== S.turn) { if (b.tn == null || b.tn < S.turn) break; continue; }
    if (attachFate(b, c, k, by, t)) return;
  }
  // Maybe the battle is still being fought (slain/taken mid-fight): hold it until the battle is archived
  if (c.fb == null && ['died', 'captive', 'enslaved'].includes(k)) { PF.push({ c: c.id, k, by, t, tn: S.turn }); if (PF.length > 40) PF.shift(); }
  // Later fates of anyone taken at a battle (death in the cells, ransom, enslavement, release)
  if (c.fb == null) return;
  const held = c.captive || c.enslaved || c.wardOf != null || S.wards?.includes?.(c);
  if (!held && !k.endsWith('-end')) return;
  const b = bs.find(x => x.wid === c.fb); if (!b) { delete c.fb; return; }
  const L = (b.later ??= []); if (L.length < 30) L.push({ c: c.id, k, by: by ?? null, t: t || '', y: S.year });
  if (k === 'died' || (k.endsWith('-end') && !held)) delete c.fb;
}
export function wikiWar(a, b, m = {}) { W().wars.push({ id: (S.wikiN = (S.wikiN || 0) + 1), a, b, an: F[a]?.name, bn: F[b]?.name, y0: S.year, y1: null, ...m }); }
export function wikiPeace(a, b, na, nb) { const w = openWar(a, b); if (w) { w.y1 = S.year; w.end = 'peace'; w.ea = w.a === a ? na : nb; w.eb = w.a === a ? nb : na; } }
// Acts of intrigue, marriage, trade and diplomacy: {y, k:'kill'|'wed'|'trade'|'hyper'|'dip', a (actor id), f (house), t/b (other char), tf/fb/to (other house), s/s2 (worlds), ok, died, txt}
const AW = () => (W().acts ??= []);
export function wikiAct(k, o = {}) { const a = AW(); a.push({ y: S.year, k, ...o }); if (a.length > 2500) a.shift(); }
export function wikiReign(c) { if (c && c.f != null) W().reigns.push({ f: c.f, c: c.id, y: S.year }); }
// Close wars that ended without a treaty (claims settled, a house fallen)
export function wikiSync() {
  try { bladeSync(); } catch (e) {}
  for (const w of W().wars) {
    if (w.y1 != null || w.recl) continue;
    const fell = !F[w.a]?.alive ? w.a : !F[w.b]?.alive ? w.b : null;
    if (fell != null || !S.war?.has?.(wkey(w.a, w.b))) { w.y1 = S.year; w.end = fell != null ? 'fall' : 'settled'; w.fell = fell; w.ea = nW(w.a); w.eb = nW(w.b); }
  }
}
// Reclamations are holy wars of their own: one archive war for the whole crusade, every house that answered fights in it
export function wikiReclStart(r, gm) {
  const dark = r.side === 'Zithari', t = r.target;
  const id = (S.wikiN = (S.wikiN || 0) + 1);
  W().wars.push({ id, a: r.by, b: r.tid, an: F[r.by]?.name, bn: r.tid >= 0 ? F[r.tid]?.name : 'the holy world\'s defenders', y0: S.year, y1: null, recl: true, side: r.side,
    name: `The ${dark ? 'Dark ' : ''}Reclamation of ${t.name}`, why: dark ? `the call of the Zithari preacher ${gm?.name || ''} to seize the holy world ${t.name} for the Dark` : `Grandmaster ${gm?.name || ''}'s call to free the holy world ${t.name}`, ra: gm?.id, at: t.i, wa: nW(r.by), wb: r.tid >= 0 ? nW(r.tid) : 0 });
  return id;
}
export function wikiReclEnd(r, won, fid) {
  const w = r?.wid != null && W().wars.find(x => x.id === r.wid); if (!w || w.y1 != null) return;
  w.y1 = S.year; w.end = won ? 'reclaimed' : 'failed'; w.victor = won ? fid : null; w.joined = [...(r.joined || [])]; w.refused = [...(r.refused || [])];
}
// Edicts: every world's edict is archived with the order and income it began with, and judged when it ends
const EW = () => (W().edicts ??= []);
const openEdict = i => { const es = EW(); for (let j = es.length - 1; j >= 0; j--) if (es[j].s === i) return es[j].y1 == null ? es[j] : null; return null; };
function closeEdict(e, s) { e.y1 = S.year; e.o1 = s.order | 0; e.i1 = Math.round(s.income || 0); e.f1 = s.owner; }
export function wikiEdict(s, k, g, by = 'decree') {
  const o = openEdict(s.i);
  if (o) { if (o.k === k && o.f === s.owner) return; closeEdict(o, s); }
  if (k === 'Balanced' || s.owner < 0) return;
  EW().push({ y0: S.year, y1: null, s: s.i, k, g: g?.id ?? null, f: s.owner, o0: s.order | 0, i0: Math.round(s.income || 0), by });
  if (by === 'ai' && g && !g.dead && Array.isArray(g.hist)) g.hist.push(`Y${S.year}: proclaims ${k === 'Martial Law' ? 'martial law' : k.toLowerCase() + ' edicts'} on ${s.name}.`);
  if (EW().length > 1500) EW().shift();
}
// Yearly: catch AI governors' changing edicts, conquests and fallen governors
export function wikiEdicts(polOf) {
  for (const s of systems) { if (!s) continue; let k = 'Balanced'; try { k = polOf(s); } catch (e) {} wikiEdict(s, k, s.general, 'ai'); }
}
// Motivations: what drives each notable person, archived when it changes, with the house's fortunes then and after
export function wikiMotives(motive, notable) {
  for (const c of Object.values(CH)) {
    if (!c || c.dead || !notable(c)) continue;
    let m; try { m = motive(c); } catch (e) { continue; }
    const L = (c.mot ??= []), last = L[L.length - 1];
    if (last && last.m === m && last.y1 == null) continue;
    const w = nW(c.f);
    if (last && last.y1 == null) { last.y1 = S.year; last.w1 = w; }
    L.push({ y0: S.year, y1: null, m, w0: w, f: c.f });
    if (L.length > 12) L.shift();
  }
}
// ---- Starblades: each blade is a named heirloom with a chain of bearers, battles and deeds ----
// S.wiki.blades [{id, nm, y, f, how, at, h:[{c,y,how,from,s}], d:[{y,c,t}], vault, end:{y,t}}]; bearers carry c.bladeId, vaults s.bladeId
const BW = () => (W().blades ??= []);
const bladeRec = id => id != null ? BW().find(b => b.id === id) : null;
const bladeName = (how, to, at) => {
  const base = how === 'forged' && at ? `Forge-blade of ${at.name}` : how === 'found' && at ? `Ruin-blade of ${at.name}` : to ? `Blade of ${(to.name || '').split(' ')[0]}` : 'Nameless Blade';
  const n = BW().filter(b => b.nm === base || b.nm.startsWith(base + ' ')).length;
  return n ? `${base} ${['', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || n + 1}` : base;
};
// to: new bearer (null = laid in a vault / lost). opt: from (previous bearer), vault (world it is taken from / laid in), at (where it happened)
export function wikiBlade(to, how, opt = {}) {
  const { from, vault, at } = opt;
  let r = bladeRec(from?.bladeId) || (to == null ? null : bladeRec(vault?.bladeId));
  if (!r) {
    r = { id: (S.wikiN = (S.wikiN || 0) + 1), y: S.year, f: to?.f ?? vault?.owner ?? from?.f, how, at: (at || vault)?.i, h: [], d: [] };
    r.nm = bladeName(how, to, at || vault);
    if (to && how === 'armed') { const h = [...(to.hist || [])].reverse().find(x => /Starblade/.test(x)); if (h) r.note = strip(h).replace(/^Y\d+:\s*/, ''); }
    BW().push(r);
  }
  if (from && from.bladeId === r.id) delete from.bladeId;
  if (to) {
    if (to.bladeId && to.bladeId !== r.id) { const o = bladeRec(to.bladeId); if (o && !o.end) o.end = { y: S.year, t: 'set aside' }; }
    if (vault && vault.bladeId === r.id) vault.bladeId = null;
    r.vault = null; r.end = null; to.bladeId = r.id; r.h.push({ c: to.id, y: S.year, how, from: from?.id, s: (vault || at)?.i });
  } else if (vault) { r.vault = vault.i; vault.bladeId = r.id; r.h.push({ c: null, y: S.year, how: 'vault', from: from?.id, s: vault.i }); }
  else r.end = { y: S.year, t: how || 'lost', c: from?.id };
}
export function wikiBladeDeed(c, t) { const r = bladeRec(c?.bladeId); if (r) r.d.push({ y: S.year, c: c.id, t }); }
// Catch blades given outside the hooks (armouries, god mode, old saves) and blades lost with fallen houses
function bladeSync() {
  for (const c of Object.values(CH)) {
    if (!c) continue;
    if (c.starblade && !c.dead && !c.bladeId) wikiBlade(c, 'armed');
    else if (c.bladeId && (c.dead || !c.starblade)) {
      const r = bladeRec(c.bladeId), last = r?.h[r.h.length - 1];
      if (r && !r.end && last?.c === c.id && (!c.dead || c.bladePassed || !F[c.f]?.alive)) { r.end = { y: c.deathY ?? S.year, t: c.dead ? 'lost with its bearer' : 'lost', c: c.id }; delete c.bladeId; }
    }
  }
}
// ---- Great Works and superweapon strikes ----
// S.wiki.works [{id,n,s,f,y0,y1,end,g,fired}], S.wiki.strikes [{y,w,src,t,tn,by,v,k,hn,work}]
const GWW = () => (W().works ??= []), SWW = () => (W().strikes ??= []);
export const SUPERS = ['World Devastators', 'World Eater', 'Star Eater'];
export function wikiWork(s, w, ev) {
  if (!w) return;
  let r = w.wid != null ? GWW().find(x => x.id === w.wid) : null;
  if (!r) { r = { id: (S.wikiN = (S.wikiN || 0) + 1), n: w.n, s: s.i, sn: s.name, f: w.f, y0: S.year, y1: null, end: null, g: w.g ?? s.general?.id }; GWW().push(r); w.wid = r.id; if (GWW().length > 600) GWW().shift(); }
  if (ev && ev !== 'start') { r.y1 = S.year; r.end = ev; }
}
export function wikiStrike(x) {
  x.y = S.year; const sw = SWW(); x.i = sw.length;
  const wk = GWW().slice().reverse().find(r => r.n === x.w && r.s === x.src && r.end === 'done' && r.fired == null);
  if (wk) { wk.fired = x.i; x.work = wk.id; }
  sw.push(x);
}
function openWar(a, b) { return W().wars.slice().reverse().find(x => x.y1 == null && ((x.a === a && x.b === b) || (x.a === b && x.b === a))); }

// ================= Helpers =================
const strip = s => String(s || '').replace(/<[^>]+>/g, '');
const col = f => '#' + ((f?.color ?? 0x888888) >>> 0).toString(16).padStart(6, '0');
const fname = id => F[id]?.name || (id === -1 ? 'the independent worlds' : 'a forgotten house');
const L = (k, t) => `<a class="wkL" data-wk="${k}">${t}</a>`;
const fN = id => F[id]?.name ? L('f:' + id, F[id].name) : fname(id); // house name as a link, for prose
const fL = id => F[id] ? L('f:' + id, `<span style="color:${col(F[id])}">■</span> ${F[id].name}`) : fname(id);
const cL = id => CH[id] ? L('c:' + id, dn(CH[id])) : 'an unknown commander';
const sL = i => systems[i] ? L('s:' + i, systems[i].name) : 'an unrecorded world';
const yearOf = h => +(/^Y(\d+)/.exec(h) || [])[1] || null;
const He = c => (c?.fem ? 'She' : 'He'), his = c => (c?.fem ? 'her' : 'his'), him = c => (c?.fem ? 'her' : 'him');
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const ORD = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
const ord = n => ORD[n] || `${n}th`;
const box = (title, img, rows) => `<table class="wkBox"><tr><th colspan="2" class="wkBT">${title}</th></tr>${img ? `<tr><td colspan="2" style="text-align:center">${img}</td></tr>` : ''}${rows.filter(r => r && r[1] !== '' && r[1] != null && r[1] !== undefined).map(([k, v]) => k === '—' ? `<tr><th colspan="2" class="wkBS">${v}</th></tr>` : `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
const sec = (t, body) => body ? `<h2>${t}</h2>${body}` : '';
const ledgerFor = (name, n = 40) => (S.ledger || []).filter(e => strip(e.m).includes(name)).slice(-n);
const ledgerList = es => es.length ? `<ul>${es.map(e => `<li><b>Y${e.y}</b> — ${link(strip(e.m), e.y)}</li>`).join('')}</ul>` : '';

// ================= Auto-linker: every known person, house, world, war and battle named in prose becomes a hyperlink =================
let LX = null;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const html = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function buildLinker() {
  const map = new Map(), multi = new Map();
  // Shared names are kept as candidate lists and resolved per mention (year alive, same house, renown)
  const put = (n, id) => { if (!n || n.length < 4) return; const l = multi.get(n) || []; if (!l.includes(id)) l.push(id); multi.set(n, l); };
  Object.values(CH).forEach(c => { if (!c?.name || /^(Nameless Monk|Domiri Hive-Mind|Voidspawn Hive-Mind)$/.test(c.name)) return; put(c.name, c.id); const d = dn(c); if (d !== c.name) put(strip(d), c.id); });
  multi.forEach((l, n) => map.set(n, l.length === 1 ? 'c:' + l[0] : 'C:' + n));
  F.forEach(f => { if (f?.name) { map.set(f.name, 'f:' + f.id); if (/^The /.test(f.name)) map.set(f.name.slice(4), 'f:' + f.id); } });
  systems.forEach(s => s?.name && map.set(s.name, 's:' + s.i));
  W().wars.forEach(w => map.set(warTitle(w), 'w:' + w.id));
  const bnames = new Set(battles().map(b => b.n).filter(Boolean));
  bnames.forEach(n => map.set(n, 'B:' + n));
  // captains named in battles
  battles().forEach(b => [b.ca, b.cd].forEach(n => n && !map.has(n) && map.set(n, 'k:' + n)));
  BW().forEach(r => r.nm && map.set(r.nm, 'a:' + r.id));
  // No giant alternation regex (it breaks once a long game holds thousands of names): names are looked up word by word
  let maxW = 1; for (const k of map.keys()) maxW = Math.max(maxW, (k.match(WORD) || []).length);
  LX = { map, multi, maxW: Math.min(maxW, 10) };
}
// Which of several people sharing a name is meant here? Alive that year, then the page's own house, then the most storied
function whoNamed(n, y, self) {
  const ids = LX.multi.get(n) || [], sf = self?.[0] === 'c' ? CH[self.slice(2)]?.f : self?.[0] === 'f' ? +self.slice(2) : null;
  const alive = c => y == null || (born(c) <= y && (!c.dead || (died(c) ?? 1e9) >= y));
  const cs = ids.map(i => CH[i]).filter(Boolean).filter(c => 'c:' + c.id !== self);
  const pool = cs.filter(alive).length ? cs.filter(alive) : cs;
  pool.sort((a, b) => ((b.f === sf) - (a.f === sf)) || ((b.hist?.length || 0) - (a.hist?.length || 0)));
  return pool[0] ? 'c:' + pool[0].id : null;
}
// Years become links to their decade in the chronicle
const yL = y => y == null || !decades().includes(Math.floor(y / 10) * 10) ? `Y${y}` : L('d:' + Math.floor(y / 10) * 10, `Y${y}`);
const WORD = /[\p{L}\p{N}_'’-]+/gu;
// Battle names repeat ("Battle of Kessa"): pick the one fought that year, else the latest
// On a person's page, prefer the one he fought in (commanded, or met his fate there)
function battleRef(n, y, self) {
  const bs = battles(), me = self?.[0] === 'c' ? +self.slice(2) : null;
  const was = b => me != null && (b.ga === me || b.gd === me || (b.fates || []).some(x => x.c === me));
  let same = -1, last = -1, mine = -1, mineAny = -1;
  bs.forEach((b, i) => { if (b.n !== n) return; last = i; if (was(b)) mineAny = i; if (b.y === y) { same = i; if (was(b)) mine = i; } });
  return mine >= 0 ? mine : same >= 0 ? same : mineAny >= 0 ? mineAny : last;
}
function link(text, y, self) {
  if (!LX) buildLinker();
  const t = html(String(text || ''));
  if (!LX.map.size) return t;
  // Collect word spans, then at each word try the longest run of following words that names something
  const ws = []; let m; WORD.lastIndex = 0;
  while ((m = WORD.exec(t))) ws.push([m.index, m.index + m[0].length]);
  let out = '', pos = 0;
  for (let i = 0; i < ws.length; i++) {
    let hit = null;
    for (let j = Math.min(ws.length - 1, i + LX.maxW - 1); j >= i; j--) {
      const cand = t.slice(ws[i][0], ws[j][1]);
      let k = LX.map.get(cand);
      if (!k && i === j && /^Y\d{3,5}$/.test(cand)) { const yy = +cand.slice(1); if (decades().includes(Math.floor(yy / 10) * 10)) k = 'd:' + Math.floor(yy / 10) * 10; }
      if (k?.[0] === 'C') k = whoNamed(k.slice(2), y, self);
      if (!k || k === self) continue;
      if (k[0] === 'B') { const bi = battleRef(k.slice(2), y, self); if (bi < 0) continue; k = 'b:' + battles()[bi].id; if (k === self) continue; }
      hit = [j, k, cand]; break;
    }
    if (!hit) continue;
    out += t.slice(pos, ws[i][0]) + L(hit[1], hit[2]); pos = ws[hit[0]][1]; i = hit[0];
  }
  return out + t.slice(pos);
}
const kL = n => n ? L('k:' + n, n) : '';
const born = c => c.bornY ?? ((c.deathY ?? S.year) - (c.age || 0));
const died = c => c.dead ? (c.deathY ?? yearOf((c.hist || []).slice(-1)[0]) ?? '?') : null;
const archive = () => { const f = F[P]; return f ? `the archives of ${f.name}` : 'the Galactic Archive'; };

// ================= Battles: names with ordinals, strength, outcome, importance =================
// Battles carry a stable id: the archive drops its oldest records, so list positions are not safe links
function battles() { const bs = W().battles; if (bs.length && (bs[0].id == null || bs[bs.length - 1].id == null)) bs.forEach(b => { b.id ??= (S.wbId = (S.wbId || 0) + 1); }); return bs; }
const bById = id => battles().find(b => String(b.id) === String(id));
let _bt = null;
function bTitles() {
  if (_bt) return _bt;
  const seen = {}; _bt = battles().map(b => { const base = b.n || `Battle of ${systems[b.at]?.name || 'the Void'}`; const k = (seen[base] = (seen[base] || 0) + 1); return k > 1 ? `${ord(k)} ${base}` : base; });
  // the first of several same-named battles becomes "First Battle of …"
  const tot = {}; battles().forEach(b => { const base = b.n || `Battle of ${systems[b.at]?.name || 'the Void'}`; tot[base] = (tot[base] || 0) + 1; });
  battles().forEach((b, i) => { const base = b.n || `Battle of ${systems[b.at]?.name || 'the Void'}`; if (tot[base] > 1 && _bt[i] === base) _bt[i] = `First ${base}`; });
  return _bt;
}
const bIdx = b => battles().indexOf(b);
const bName = b => bTitles()[bIdx(b)] || b.n || 'Battle';
const bWin = b => (b.w === 'a' ? b.a : b.d), bLose = b => (b.w === 'a' ? b.d : b.a);
const bL = b => L('b:' + b.id, bName(b));
function verdict(b) {
  if (b.fled) return 'Withdrawal';
  const wl = b.w === 'a' ? b.la : b.ld, ll = b.w === 'a' ? b.ld : b.la;
  return ll >= 70 && wl <= 35 ? 'Decisive victory' : wl >= 60 ? 'Pyrrhic victory' : ll - wl < 15 ? 'Narrow victory' : 'Victory';
}
function bLine(b, n) { return `<li>${n ? `<b>${n}.</b> ` : ''}<b>Y${b.y}</b> — ${bL(b)}${systems[b.at] && !(b.n || '').includes(systems[b.at].name) ? ` (${sL(b.at)})` : ''} · ${fN(b.a)} vs ${fN(b.d)} · <i>${b.fled ? 'withdrawal' : `${verdict(b).toLowerCase()} for ${fN(bWin(b))}`}</i></li>`; }
// Did a commander fall or get taken at this battle? (deeds carry "at the Battle of X")
function cmdFate(id, b) {
  const c = CH[id]; if (!c || !b.n) return null;
  const h = (c.hist || []).find(x => yearOf(x) === b.y && x.includes(b.n));
  if (!h) return null;
  if (/slain|killed|falls/.test(h)) return 'slain';
  if (/captured|chains|ward|ransom/.test(h)) return 'captured';
  return null;
}
function warOf(b) { return b.war != null ? W().wars.find(w => w.id === b.war) : W().wars.find(w => ((w.a === b.a && w.b === b.d) || (w.a === b.d && w.b === b.a)) && b.y >= w.y0 && b.y <= (w.y1 ?? S.year)); }
function warBattles(w) { return battles().filter(b => b.war === w.id || (b.war == null && ((b.a === w.a && b.d === w.b) || (b.a === w.b && b.d === w.a)) && b.y >= w.y0 && b.y <= (w.y1 ?? S.year))); }

function importance(b) {
  const out = [], s = systems[b.at], win = bWin(b), lose = bLose(b), wn = fN(win), ln = fN(lose);
  const w = warOf(b), wb = w ? warBattles(w) : [], i = wb.indexOf(b);
  // Strategic
  if (b.fled) out.push(`The attackers broke off before the lines closed; ${s ? sL(b.at) : 'the position'} remained in ${fN(b.d)}'s hands, and the campaign stalled.`);
  else if (b.k === 'land' && b.w === 'a') out.push(`The assault delivered ${s ? sL(b.at) : 'the world'} to ${wn}${b.cap ? ` — the capital of ${ln}, a blow to the very heart of the realm` : ''}.`);
  else if (b.k === 'land') out.push(`The invasion was hurled back, and ${s ? sL(b.at) : 'the world'} held for ${wn}${b.cap ? ', sparing the capital' : ''}.`);
  else if (b.w === 'a') { const next = wb.slice(i + 1).find(x => x.at === b.at && x.k === 'land'); out.push(`Victory in orbit left ${s ? sL(b.at) : 'the world'} open to blockade${next ? `, and paved the way for the ${bL(next)}` : ' and invasion'}.`); }
  else out.push(`The defenders kept the skies over ${s ? sL(b.at) : 'the world'}, denying ${ln} a foothold.`);
  if (b.holy) out.push('As a holy world, its fate was watched by every faithful house.');
  if (w && wb.length > 1) {
    const prev = wb.slice(0, i), streak = (() => { let n = 0; for (let k = prev.length - 1; k >= 0 && bLose(prev[k]) === win; k--) n++; return n; })();
    if (streak >= 2) out.push(`After ${streak} defeats in a row, ${wn} turned the tide of the ${L('w:' + w.id, warTitle(w))} here.`);
    if (i > 0) out.push(`It followed the ${bL(wb[i - 1])}${i < wb.length - 1 ? ` and was followed by the ${bL(wb[i + 1])}` : ''}.`);
    const big = wb.reduce((m, x) => ((x.pa || 0) + (x.pd || 0) > (m.pa || 0) + (m.pd || 0) ? x : m), wb[0]);
    if (big === b && (b.pa || b.pd)) out.push(`It was the largest clash of the war.`);
    if (i === wb.length - 1 && w.y1 != null) out.push(w.end === 'fall' ? `It was the last battle before the fall of ${fN(w.fell)}.` : `It was the last battle before the peace.`);
  }
  if (!F[lose]?.alive && !battles().some(x => x.y > b.y && (x.a === lose || x.d === lose))) out.push(`${cap(ln)} never fought again.`);
  // Tactical
  const tac = [], pw = b.w === 'a' ? b.pa : b.pd, pl = b.w === 'a' ? b.pd : b.pa;
  if (pw && pl) {
    const r = pw / pl;
    if (r < 0.8) tac.push(`${wn} won against odds of roughly ${(1 / r).toFixed(1)} to 1 — a remarkable upset that speaks to the command on the day.`);
    else if (r > 2.2) tac.push(`${wn} brought overwhelming strength, outnumbering the enemy some ${r.toFixed(1)} to 1.`);
    else tac.push('The two hosts were evenly matched, and the outcome turned on command and nerve.');
  }
  const v = verdict(b);
  if (v === 'Pyrrhic victory') tac.push(`Victory was bought at a ruinous price: ${wn} lost ${b.w === 'a' ? b.la : b.ld}% of its force.`);
  if (v === 'Decisive victory') tac.push(`The enemy was shattered, losing ${b.w === 'a' ? b.ld : b.la}% of its force while the victors lost little.`);
  [[b.ga, b.a], [b.gd, b.d]].forEach(([g, f]) => { const fa = cmdFate(g, b); if (fa) tac.push(`${cL(g)} of ${fN(f)} was ${fa} on the field.`); });
  if (b.ga == null && b.ca) tac.push(`With no lord in command, ${kL(b.ca)} captained the attack.`);
  if (b.gd == null && b.cd) tac.push(`${kL(b.cd)} captained the defence.`);
  const g0 = CH[b.ga], g1 = CH[b.gd];
  [g0, g1].forEach(g => { if (g?.starblade && (g.hist || []).some(h => /Starblade/.test(h) && (yearOf(h) || 0) <= b.y)) tac.push(`${cL(g.id)} carried a Starblade into the fight.`); });
  return { strat: out.join(' '), tac: tac.join(' ') };
}

// ================= Wars: names, ordinals, outcome =================
let _wt = null;
function baseWarName(w) {
  if (w.name) return w.name;
  const bs = warBattles(w), cnt = {};
  bs.forEach(b => { if (b.at != null) cnt[b.at] = (cnt[b.at] || 0) + 1; });
  const top = Object.entries(cnt).sort((x, y) => y[1] - x[1])[0];
  if (top && top[1] >= 2 && systems[top[0]]) return `War for ${systems[top[0]].name}`;
  return `${(w.an || fname(w.a)).replace(/^The /, '')}–${(w.bn || fname(w.b)).replace(/^The /, '')} War`;
}
function warTitles() {
  if (_wt) return _wt;
  const tot = {}, seen = {}; _wt = {};
  W().wars.forEach(w => { const n = baseWarName(w); tot[n] = (tot[n] || 0) + 1; });
  W().wars.forEach(w => { const n = baseWarName(w); const k = (seen[n] = (seen[n] || 0) + 1); _wt[w.id] = tot[n] > 1 ? `${ord(k)} ${n.replace(/^The /, '')}` : n; });
  return _wt;
}
const warTitle = w => warTitles()[w.id] || baseWarName(w);
function warOutcome(w) {
  if (w.y1 == null) return { t: 'Ongoing', d: 'The war still rages.' };
  if (w.recl) return w.end === 'reclaimed' ? { t: `Reclaimed by ${fname(w.victor)}`, d: `The holy world fell to ${fN(w.victor)}, and the Reclamation was fulfilled.${w.joined?.length ? ` Those who answered the call: ${w.joined.map(fN).join(', ')}.` : ''}` } : { t: 'Reclamation failed', d: `The holy world held, and the Reclamation ended in failure.${w.refused?.length ? ` Blame fell on those who ignored the call: ${w.refused.map(fN).join(', ')}.` : ''}` };
  if (w.end === 'fall') return { t: `Fall of ${fname(w.fell)}`, d: `It ended only with the destruction of ${fN(w.fell)}.` };
  const da = (w.ea ?? nW(w.a)) - (w.wa ?? 0), db = (w.eb ?? nW(w.b)) - (w.wb ?? 0);
  if (w.wa == null) return { t: w.end === 'settled' ? 'Settled' : 'Peace treaty', d: 'It was concluded by treaty.' };
  const g = da - db;
  if (Math.abs(g) <= 1) return { t: 'White peace', d: 'It ended in a white peace, with neither side much changed.' };
  const victor = g > 0 ? w.a : w.b, n = Math.abs(g > 0 ? da : db);
  return { t: `${fname(victor)} victory`, d: `It ended in favour of ${fN(victor)}${n ? `, whose realm grew by ${n} world${n > 1 ? 's' : ''}` : ''}.` };
}

// ================= Pages =================
function lifeProse(c) {
  const first = (c.name || '').split(' ')[0], dec = {};
  (c.hist || []).forEach(h => { const y = yearOf(h); (dec[y ? Math.floor(y / 10) * 10 : 0] ??= []).push({ y, t: strip(h).replace(/^Y\d+:\s*/, '').trim().replace(/\.$/, '') }); });
  return Object.keys(dec).sort((a, b) => a - b).map(d => {
    let lastY = null;
    const sents = dec[d].map((e, i) => {
      const subj = i === 0 ? first : He(c).toLowerCase(), newYear = e.y && e.y !== lastY;
      lastY = e.y;
      const body = /^[a-z]/.test(e.t) ? `${subj} ${e.t}` : e.t;
      const lb = link(body, e.y, 'c:' + c.id);
      return newYear ? `In ${yL(e.y)}, ${lb}.` : `${i ? 'Later that year, ' : ''}${lb}.`;
    });
    return `<h3>${+d ? `The Y${d}s` : 'Early life'}</h3><p>${sents.join(' ')}</p>`;
  }).join('');
}
function charPage(c) {
  const f = F[c.f], ruler = f?.ruler === c, kids = (c.kids || []).map(id => CH[id]).filter(Boolean);
  const reigns = W().reigns.filter(r => r.c === c.id), r0 = reigns[0];
  const next = r0 ? W().reigns.find(r => r.f === r0.f && r.y >= r0.y && r.c !== c.id) : null;
  const bs = battles().filter(b => b.ga === c.id || b.gd === c.id);
  const wins = bs.filter(b => (b.ga === c.id && b.w === 'a') || (b.gd === c.id && b.w === 'd')).length;
  const T = title(c), rT = rt(c.f, c);
  const role = ruler ? `reigning ${rT}` : c.wasRuler || r0 ? `former ${rT}` : c.role ? RN(c.role).toLowerCase().replace(/\bai\b/, 'AI').replace('nameless', 'Nameless') : c.fem ? 'noblewoman' : 'nobleman';
  const by = born(c), dy = died(c);
  const sibs = CH[c.father] ? (CH[c.father].kids || []).filter(id => id !== c.id).map(id => CH[id]).filter(Boolean) : [];
  const wars = [...new Set(bs.map(warOf).filter(Boolean))];
  // Where he serves now: governor of a world, commander of a fleet, or an agent in the field
  const gs = !c.dead && systems.find(s => s.general === c), us = !c.dead && units.find(u => u.general === c || u.char === c);
  const post = gs ? `Governor of ${sL(gs.i)}` : us ? `${us.type === 'fleet' ? 'Commands a fleet' : (c.role ? RN(c.role) : 'Agent')} at ${sL(us.sys?.i)}` : '';
  let lead = `<p>${T && !ruler && !c.wasRuler ? T + ' ' : ''}<b>${dn(c)}</b> (Y${by} – ${c.dead ? 'Y' + dy : 'living'}) ${c.dead ? 'was' : 'is'} a ${role} of ${fL(c.f)}`;
  lead += CH[c.father] ? `, the ${bastardOf(c) ? 'base-born ' : ''}${c.fem ? 'daughter' : 'son'} of ${cL(c.father)}${CH[c.mother] ? ' and ' + cL(c.mother) : ''}.` : '.';
  if (r0) lead += ` ${He(c)} took the throne in Y${r0.y}${next ? ` and reigned until Y${next.y}` : ruler ? ' and reigns still' : ''}.`;
  if (bs.length) lead += ` In ${bs.length} recorded battle${bs.length > 1 ? 's' : ''} ${his(c)} forces won ${wins}${bs.length - wins ? ` and lost ${bs.length - wins}` : ''}.`;
  if (gs) lead += ` ${He(c)} serves as governor of ${sL(gs.i)}.`;
  else if (us) lead += us.type === 'fleet' ? ` ${He(c)} commands a fleet at ${sL(us.sys?.i)}.` : ` ${He(c)} is in the field as a ${(c.role || 'agent').toLowerCase()}, last seen at ${sL(us.sys?.i)}.`;
  if (wars.length) lead += ` ${He(c)} fought in the ${wars.slice(0, 3).map(w => L('w:' + w.id, warTitle(w))).join(', ')}${wars.length > 3 ? ` and ${wars.length - 3} other war${wars.length > 4 ? 's' : ''}` : ''}.`;
  const myBl = BW().filter(r => r.h.some(h => h.c === c.id));
  if (c.starblade || myBl.length) lead += ` ${He(c)} ${c.starblade && !c.dead ? 'bears' : 'bore'} ${myBl.length ? myBl.map(r => `the ${aL(r.id)}`).join(' and ') : 'a Starblade'}.`;
  if (c.epi) lead += ` The chroniclers remember ${him(c)} as <i>${c.epi.t}</i>.`;
  if (c.dead) { const dh = [...(c.hist || [])].reverse().find(h => /dies|slain|executed|killed|perishes|assassinated/.test(h)); if (dh) lead += ` ${He(c)} ${link(strip(dh).replace(/^Y\d+:\s*/, '').replace(/\.$/, ''), dy, 'c:' + c.id)} in Y${dy}.`; }
  lead += '</p>';
  const info = box(dn(c), portrait(c, 110), [
    ['Title', T], ['House', fL(c.f)], ['Born', `Y${by}`], ['Died', c.dead ? `Y${dy} (aged ${typeof dy === 'number' ? dy - by : c.age})` : ''], ['Age', c.dead ? '' : c.age],
    ['Reign', r0 ? `Y${r0.y} – ${next ? 'Y' + next.y : ruler ? 'present' : '?'}` : ''],
    ['Father', CH[c.father] ? cL(c.father) : ''], ['Mother', CH[c.mother] ? cL(c.mother) : ''], ['Spouse', CH[c.spouse] ? cL(c.spouse) : ''],
    ['Siblings', sibs.map(k => cL(k.id)).join(', ')], ['Children', kids.map(k => cL(k.id)).join(', ')], ['Mentor', CH[c.mentor] ? cL(c.mentor) : ''],
    ['Office', post], ['Captive of', c.captive ? fL(c.captive.by) : ''], ['Traits', (c.traits || []).join(', ')], ['Starblade', c.starblade ? '⚔ Bearer' : ''], ['Battles', bs.length ? `${wins} won · ${bs.length - wins} lost` : ''],
    ['Wars', wars.map(w => L('w:' + w.id, warTitle(w))).join('<br>')],
  ]);
  const legacy = [];
  if (kids.length) legacy.push(`${He(c)} left ${kids.length} child${kids.length > 1 ? 'ren' : ''}: ${kids.map(k => cL(k.id)).join(', ')}.`);
  if (next && CH[next.c]) legacy.push(`${He(c)} was succeeded by ${cL(next.c)}.`);
  const myEd = EW().filter(e => e.g === c.id);
  if (c.mot?.length) { const cur = c.mot[c.mot.length - 1]; lead += `<p>${c.dead ? `At the end, ${his(c)} aim was` : `${He(c)} is driven by this aim`}: <i>${link(strip(cur.m), cur.y0, 'c:' + c.id)}</i></p>`; }
  const bladeSec = myBl.map(r => { const mine = r.h.filter(h => h.c === c.id), nb = battles().filter(b => (b.ga === c.id && b.sa === r.id) || (b.gd === c.id && b.sd === r.id)).length, dd = r.d.filter(d => d.c === c.id);
    return `<li>${aL(r.id)} — ${mine.map(h => `${(HOW[h.how] || 'borne by').split(' ')[0]} Y${h.y}`).join(', ')}${nb ? ` · carried into ${nb} battle${nb > 1 ? 's' : ''}` : ''}${dd.length ? ` · ${dd.map(d => link(d.t, d.y)).join('; ')}` : ''}</li>`; }).join('');
  const myW = GWW().filter(r => r.g === c.id);
  const hatedBy = Object.values(CH).filter(x => x && !x.dead && x.nem?.[c.id] >= 4);
  const nemSec = (c.nem && Object.keys(c.nem).length ? `<ul>${Object.entries(c.nem).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => `<li>${cL(+id)}${+id === c.nemesis ? ' <b>(nemesis)</b>' : ''} — hatred ${Math.round(v)}</li>`).join('')}</ul>` : '') + (hatedBy.length ? `<p>Sworn enemies who hunt ${him(c)}: ${hatedBy.slice(0, 8).map(x => cL(x.id)).join(', ')}.</p>` : '');
  if (CH[c.nemesis]) lead += `<p>${He(c)} ${c.dead ? 'counted' : 'counts'} ${cL(c.nemesis)} as ${his(c)} nemesis.</p>`;
  const myActs = AW().filter(x => x.a === c.id || x.t === c.id || x.b === c.id || (x.k === 'elect' && (x.w === c.id || x.c?.includes?.(c.id))) || (x.k === 'tourney' && (x.all?.includes?.(c.id) || x.rv?.includes?.(c.id) || x.hurt === c.id)));
  const LIFE = { captive: 'taken captive by', 'captive-end': 'freed from the cells of', ward: 'taken as a ward of', 'ward-end': 'left the wardship of', enslaved: 'enslaved by', 'enslaved-end': 'freed from bondage to', tortured: 'tortured by', sold: 'sold off-world by', exiled: 'cast into exile by', fealty: 'swore fealty to' };
  const fN = id => id != null && F[id] ? F[id].name : 'unknown masters';
  const lifeSec = (c.life || []).map(x => `<li>${yL(x.y)}: ${LIFE[x.k] || x.k} ${x.k === 'tortured' ? `order of ${link(x.t || '', x.y)} (${fN(x.by)})` : fN(x.by)}${x.t && x.k !== 'tortured' ? ` — <i>${x.t}</i>` : ''}</li>`).join('');
  const MARKS = { 'Base-born': 'born out of wedlock', 'Ward-raised': 'raised as a hostage at a foreign court', 'Former Prisoner': 'a survivor of the cells', 'Torture-Scarred': 'scarred by torture', 'Freed Slave': 'a freed slave' };
  const marks = (c.traits || []).filter(t => MARKS[t]).map(t => MARKS[t]);
  if (marks.length) lead += `<p>${He(c)} ${c.dead ? 'was' : 'is'} ${marks.join(', ')}.${CH[c.slaver] ? ` ${He(c)} ${c.dead ? 'never forgave' : 'has never forgiven'} ${cL(c.slaver)}, who sold ${him(c)} into chains.` : ''}${CH[c.tormentor] ? ` ${He(c)} remembered ${cL(c.tormentor)}, who ordered ${his(c)} torture.` : ''}</p>`;
  return info + lead + sec('Life', lifeProse(c)) + sec('Captivity, wardship & bondage', lifeSec ? `<ul>${lifeSec}</ul>` : '') + sec('Marriages, intrigue & diplomacy', myActs.length ? `<ul>${myActs.slice(-25).reverse().map(actLine).join('')}</ul>` : '') + sec('Starblade', bladeSec ? `<ul>${bladeSec}</ul>` : '') + sec('Great Works', myW.length ? `<ul>${myW.map(workLine).join('')}</ul>` : '') + sec('Rivals & nemeses', nemSec) + (() => { const fs = FDW().filter(x => x.who.includes(c.id)); return sec('Blood feuds', fs.length ? `<ul>${fs.map(feudLine).join('')}</ul>` : ''); })() + sec('Motivations', motivesOf(c)) + sec('Edicts proclaimed', myEd.length ? `${edictSummary(myEd)}<ul>${myEd.slice(-15).reverse().map(e => edictLine(e, false)).join('')}</ul>` : '') + sec('Battles', bs.length ? `<ul>${bs.map(b => bLine(b)).join('')}</ul>` : '') + sec('Family', familySec(c)) + sec('Legacy', legacy.length ? `<p>${legacy.join(' ')}</p>` : '') + sec('What links here', mentionsSec(c));
}
const bastardOf = c => !!c.illegit && !c.legit;
// ---- Family tree: three generations up and down, uncles/aunts and cousins ----
function familySec(c) {
  const g = id => CH[id], kidsOf = x => (x?.kids || []).map(g).filter(Boolean);
  const fa = g(c.father), mo = g(c.mother), rows = [];
  const gp = [fa && g(fa.father), fa && g(fa.mother), mo && g(mo.father), mo && g(mo.mother)].filter(Boolean);
  const unc = [fa, mo].filter(Boolean).flatMap(p => kidsOf(g(p.father)).filter(k => k !== p));
  const cous = [...new Set(unc.flatMap(kidsOf))];
  const gk = kidsOf(c).flatMap(kidsOf), ggk = gk.flatMap(kidsOf);
  const li = (t, xs) => xs.length ? rows.push(`<li><b>${t}:</b> ${[...new Set(xs)].slice(0, 16).map(x => `${cL(x.id)}${x.dead ? ' 🪦' : ''}`).join(', ')}${xs.length > 16 ? '…' : ''}</li>`) : 0;
  li('Grandparents', gp); li('Uncles & aunts', unc); li('Cousins', cous); li('Grandchildren', gk); li('Great-grandchildren', ggk);
  return `<p>${L('y:' + c.id, '🌳 View the family tree')}</p>` + (rows.length ? `<ul>${rows.join('')}</ul>` : '');
}
// ---- Family trees: person pages 'y:<charId>', house pages 'h:<houseId>' ----
const chOf = id => (id && typeof id === 'object' ? id : CH[id]);
function tNode(x, me) {
  if (!x) return '<span class="wkTn wkTx">unknown</span>';
  const yrs = `${born(x)}–${x.dead ? died(x) : ''}`, t = title(x);
  const bs = (x.illegit && !x.legit) || /\(bastard\)/.test(x.name || '');
  return `<span class="wkTn${x.id === me ? ' me' : ''}${x.dead ? ' dead' : ''}">${x.fem ? '♀' : '♂'} ${cL(x.id)}${bs ? ' <small>(base-born)</small>' : ''}<br><small>${t ? t + ' · ' : ''}${F[x.f] ? fN(x.f) + ' · ' : ''}Y${yrs}</small></span>`;
}
function descTree(x, me, depth, seen) {
  if (!x || seen.has(x.id) || seen.size > 400) return '';
  seen.add(x.id);
  const sp = chOf(x.spouse), kids = (x.kids || []).map(chOf).filter(Boolean).sort((a, b) => born(a) - born(b));
  const inner = depth > 0 && kids.length ? `<ul>${kids.map(k => descTree(k, me, depth - 1, seen)).join('')}</ul>` : kids.length ? `<ul><li><small>… ${kids.length} more ${kids.length > 1 ? 'children' : 'child'}: ${L('y:' + x.id, 'continue the tree')}</small></li></ul>` : '';
  return `<li>${tNode(x, me)}${sp ? ` <small>⚭</small> ${tNode(sp, me)}` : ''}${inner}</li>`;
}
function rootOf(c, up = 3) { let r = c; for (let i = 0; i < up && chOf(r.father); i++) r = chOf(r.father); return r; }
function treePage(c) {
  const fa = chOf(c.father), mo = chOf(c.mother);
  const gens = [[fa, mo], [fa && chOf(fa.father), fa && chOf(fa.mother), mo && chOf(mo.father), mo && chOf(mo.mother)]];
  gens.push(gens[1].flatMap(p => [p && chOf(p.father), p && chOf(p.mother)]));
  const lbl = ['Parents', 'Grandparents', 'Great-grandparents'];
  const anc = gens.map((g, i) => g.some(Boolean) ? `<h3>${lbl[i]}</h3><div class="wkTrow">${g.map(x => tNode(x, c.id)).join('')}</div>` : '').reverse().join('');
  const root = rootOf(c, 2);
  return `<p>The family of ${cL(c.id)}${F[c.f] ? ` of ${fL(c.f)}` : ''}. ${F[c.f] ? L('h:' + c.f, `🌳 Tree of ${fN(c.f)}`) : ''}</p>` +
    sec('Ancestors', anc || '<p>No forebears are recorded.</p>') +
    sec('Descendants and kin', `<p><small>From ${cL(root.id)}, two generations up, down through four generations. ⚭ marks a marriage; 🪦 grey names are dead.</small></p><ul class="wkTree">${descTree(root, c.id, 4, new Set())}</ul>`);
}
function houseTree(f) {
  const mem = Object.values(CH).filter(x => x && x.f === f.id);
  const anchor = (f.ruler && !f.ruler.dead ? f.ruler : null) || mem.sort((a, b) => (b.hist?.length || 0) - (a.hist?.length || 0))[0];
  if (!anchor) return '<p>No members of this house are recorded.</p>';
  const root = rootOf(anchor, 8), seen = new Set();
  const main = `<ul class="wkTree">${descTree(root, f.ruler?.id, 6, seen)}</ul>`;
  // Other branches of the house not descended from the main line
  const others = mem.filter(x => !seen.has(x.id) && !chOf(x.father) && (x.kids || []).length).slice(0, 12);
  return `<p>The ruling line of ${fL(f.id)}, traced from ${cL(root.id)}${f.ruler ? ` to the present ${rt(f.id, f.ruler)} ${cL(f.ruler.id)} (highlighted)` : ''}.</p>` + sec('Ruling line', main) +
    sec('Other branches', others.length ? others.map(x => `<ul class="wkTree">${descTree(x, null, 3, seen)}</ul>`).join('') : '');
}
// ---- What links here: lives and records that name this person ----
function mentionsSec(c) {
  const nm = c.name; if (!nm || nm.length < 4) return '';
  const lives = Object.values(CH).filter(x => x && x !== c && (x.hist || []).some(h => h.includes(nm))).sort((a, b) => (b.hist?.length || 0) - (a.hist?.length || 0));
  const wars = W().wars.filter(w => w.ra === c.id || w.rb === c.id || (w.why || '').includes(nm));
  const feuds = FDW().filter(x => x.a === c.id || x.b === c.id);
  const out = [];
  if (lives.length) out.push(`<p>Named in the lives of ${lives.slice(0, 20).map(x => cL(x.id)).join(', ')}${lives.length > 20 ? ` and ${lives.length - 20} others` : ''}.</p>`);
  if (wars.length) out.push(`<p>Wars: ${wars.slice(0, 10).map(w => L('w:' + w.id, warTitle(w))).join(', ')}.</p>`);
  if (feuds.length) out.push(`<p>Feuds: ${feuds.map(fd => L('e:' + fd.id, feudName(fd))).join(', ')}.</p>`);
  return out.join('');
}
// ---- Edict & motivation rendering ----
function edictVerdict(e) {
  const s = systems[e.s], o1 = e.y1 != null ? e.o1 : s?.order | 0, i1 = e.y1 != null ? e.i1 : Math.round(s?.income || 0);
  const lost = e.y1 != null && e.f1 !== e.f, dO = o1 - e.o0, dI = i1 - e.i0;
  const parts = [`order ${e.o0}→${o1}`, `income ${e.i0}→${i1}`];
  const v = lost ? 'the world was lost' : dO >= 2 && dI >= 0 ? 'a success' : dO <= -2 && dI <= 0 ? 'a failure' : dI >= 10 && dO >= -1 ? 'profitable' : dI <= -10 ? 'costly' : dO >= 1 ? 'calming' : dO <= -1 ? 'unpopular' : 'little change';
  return `${parts.join(', ')} — <i>${v}${e.y1 == null ? ' so far' : ''}</i>`;
}
const eSpan = e => `Y${e.y0}–${e.y1 ?? 'present'}`;
const edictLine = (e, who = true) => `<li><b>${e.k}</b> on ${sL(e.s)} (${eSpan(e)})${who && e.g != null ? ` by ${cL(e.g)}` : ''}${e.by === 'decree' ? ' <small>by decree</small>' : ''}: ${edictVerdict(e)}</li>`;
function motivesOf(c) {
  const L = c.mot || []; if (!L.length) return '';
  return `<ul>${L.map((m, i) => {
    const end = m.y1 ?? (c.dead ? c.deathY : null), w1 = m.w1 ?? (c.dead && i === L.length - 1 ? null : nW(m.f ?? c.f));
    const res = w1 == null ? '' : w1 > m.w0 ? ` — the house grew from ${m.w0} to ${w1} worlds` : w1 < m.w0 ? ` — the house shrank from ${m.w0} to ${w1} worlds` : ` — the house held ${m.w0} world${m.w0 !== 1 ? 's' : ''}`;
    return `<li><b>Y${m.y0}–${end != null ? 'Y' + end : 'present'}</b>: <i>${link(strip(m.m), m.y0, 'c:' + c.id)}</i>${res}</li>`;
  }).join('')}</ul>`;
}
function edictSummary(es) {
  if (!es.length) return '';
  const by = {}; es.forEach(e => { const x = (by[e.k] ??= { n: 0, o: 0, i: 0 }); const s = systems[e.s]; x.n++; x.o += (e.y1 != null ? e.o1 : s?.order | 0) - e.o0; x.i += (e.y1 != null ? e.i1 : Math.round(s?.income || 0)) - e.i0; });
  const rows = Object.entries(by).sort((a, b) => b[1].n - a[1].n).map(([k, x]) => `<tr><td>${k}</td><td>${x.n}</td><td>${x.o >= 0 ? '+' : ''}${(x.o / x.n).toFixed(1)}</td><td>${x.i >= 0 ? '+' : ''}${Math.round(x.i / x.n)}</td></tr>`).join('');
  return `<table class="wkBox" style="float:none;margin:6px 0"><tr><th>Edict</th><th>Times</th><th>Avg order</th><th>Avg income</th></tr>${rows}</table>`;
}
function factionPage(f) {
  const worlds = systems.filter(s => s.owner === f.id), wars = W().wars.filter(w => w.a === f.id || w.b === f.id);
  const reigns = W().reigns.filter(r => r.f === f.id);
  const bs = battles().filter(b => b.a === f.id || b.d === f.id), won = bs.filter(b => bWin(b) === f.id).length;
  const o = f.origin;
  let lead = `<p><b>${f.name}</b> ${f.alive ? 'is' : 'was'} ${o ? `${OKIND[o.kind] || 'a new house'}${o.from != null && F[o.from] ? ` that broke away from ${fN(o.from)}` : ''}${o.y != null ? `, born in Y${o.y}` : ''}` : 'a great house of the galaxy'}${f.rel ? `, keeping the ${f.rel} faith` : ''}. `;
  lead += f.alive ? `It holds ${worlds.length} world${worlds.length !== 1 ? 's' : ''}${f.capital ? `, ruled from ${sL(f.capital.i)}` : ''}${f.ruler ? ` by ${rt(f.id, f.ruler)} ${cL(f.ruler.id)}` : ''}.` : 'Its banners have fallen and it holds no worlds.';
  const lg = S.vassal?.[f.id], vs = Object.keys(S.vassal || {}).filter(v => S.vassal[v] === f.id && F[v]?.alive);
  if (f.alive && lg != null && F[lg]) lead += ` It is a sworn vassal of ${fN(lg)}.`;
  if (f.alive && vs.length) lead += ` It is liege lord to ${vs.map(v => fN(+v)).join(', ')}.`;
  if (bs.length) lead += ` Its fleets and legions have fought ${bs.length} recorded battles, winning ${won}.`;
  if (wars.length) lead += ` ${wars.length} war${wars.length > 1 ? 's are' : ' is'} recorded in its name.`;
  lead += '</p>';
  const info = box(f.name, `<div style="width:60px;height:40px;margin:auto;background:${col(f)};border:1px solid #fff4"></div>`, [
    ['Status', f.alive ? 'Active' : 'Fallen'], ['Origin', o ? `${OIC[o.kind] || '⚑'} ${cap(OKIND[o.kind] || 'new house')}${o.y != null ? ` (Y${o.y})` : ''}` : ''], ['Broke from', o?.from != null && F[o.from] ? fL(o.from) : ''], ['Founder', o && CH[o.who] ? cL(o.who) : ''], [f.ruler ? rt(f.id, f.ruler) : 'Ruler', f.ruler ? cL(f.ruler.id) : ''], ['Heir', (() => { const h = f.alive ? heir(f) : null; return h && !h.dead ? `${title(h)} ${cL(h.id)}` : ''; })()], ['Capital', f.capital ? sL(f.capital.i) : ''], ['Worlds', worlds.length],
    ['Treasury', f.alive ? Math.round(f.gold || 0) + ' cr' : ''], ['Faith', f.rel || ''], ['Battles', bs.length ? `${won} won · ${bs.length - won} lost` : ''], ['Wars', wars.length || ''],
  ]);
  // History by reign: each ruler and the wars begun under him
  let hist = '';
  if (reigns.length) hist = reigns.map((r, i) => {
    const end = reigns[i + 1]?.y ?? (f.alive ? null : '?'), c = CH[r.c];
    const ws = wars.filter(w => w.y0 >= r.y && (end == null || w.y0 < end || end === '?'));
    const bw = bs.filter(b => b.y >= r.y && (end == null || b.y < end)), bwon = bw.filter(b => bWin(b) === f.id).length;
    return `<h3>Reign of ${c ? rt(f.id, c) + ' ' : ''}${cL(r.c)} (Y${r.y}–${end ?? 'present'})</h3><p>${c ? `${dn(c).split(' ')[0]} came to the throne in Y${r.y}.` : ''}${ws.length ? ` ${ws.length === 1 ? 'One war was' : ws.length + ' wars were'} begun in these years: ${ws.map(w => L('w:' + w.id, warTitle(w))).join(', ')}.` : ' The reign saw no new wars recorded in the archive.'}${bw.length ? ` The house fought ${bw.length} battles, winning ${bwon}.` : ''}</p>`;
  }).join('');
  const wl = wars.length ? `<ul>${wars.map(w => `<li>${L('w:' + w.id, warTitle(w))} (Y${w.y0}–${w.y1 ?? 'present'}) · <i>${warOutcome(w).t}</i></li>`).join('')}</ul>` : '';
  const wd = worlds.length ? worlds.map(s => `${sL(s.i)}${s.general ? ` <small>(${cL(s.general.id)})</small>` : ''}`).join(' · ') : '';
  // Who's who: court, commanders, agents, the honoured dead
  const mem = Object.values(CH).filter(c => c && c.f === f.id && c.name);
  const live = mem.filter(c => !c.dead), grp = {};
  const fleetG = new Set(units.filter(u => u.owner === f.id && u.general).map(u => u.general.id)), govs = new Set(systems.filter(s => s.owner === f.id && s.general).map(s => s.general.id));
  live.forEach(c => { const g = c === f.ruler ? rt(f.id, c) : (S.nmCouncil || []).includes(c.id) ? 'The Council of Five' : fleetG.has(c.id) ? 'Fleet commanders' : govs.has(c.id) ? 'Governors' : c.role ? `${RN(c.role)}s` : (f.heirs || []).includes(c) || (f.princesses || []).includes(c) ? 'Court' : null; if (g) (grp[g] ??= []).push(c); });
  const greats = mem.filter(c => c.dead).sort((a, b) => (b.hist?.length || 0) - (a.hist?.length || 0)).slice(0, 15);
  const who = Object.entries(grp).map(([g, cs]) => `<h3>${g}</h3><p>${cs.slice(0, 40).map(c => cL(c.id)).join(' · ')}</p>`).join('') + (greats.length ? `<h3>Remembered dead</h3><p>${greats.map(c => cL(c.id)).join(' · ')}</p>` : '');
  const fb = BW().filter(r => bladeHolder(r)?.f === f.id || (!bladeHolder(r) && !r.end && systems[r.vault]?.owner === f.id) || r.f === f.id);
  const fw = GWW().filter(r => r.f === f.id), fs = SWW().filter(x => x.by === f.id || x.v === f.id);
  const arm = sec('Starblades', fb.length ? `<ul>${fb.map(r => { const c = bladeHolder(r); return `<li>${aL(r.id)} — ${c ? `borne by ${cL(c.id)}${c.f !== f.id ? ` of ${fN(c.f)}` : ''}` : r.vault != null && !r.end ? `in the vault of ${sL(r.vault)}` : r.end ? r.end.t : ''}</li>`; }).join('')}</ul>` : '')
    + sec('Great Works & superweapons', fw.length + fs.length ? `${fw.length ? `<ul>${fw.slice(-20).reverse().map(workLine).join('')}</ul>` : ''}${fs.length ? `<h3>Strikes</h3><ul>${fs.map(strikeLine).join('')}</ul>` : ''}` : '');
  const elx = AW().filter(x => x.k === 'elect' && x.f === f.id);
  return info + lead + (f.id === 1 ? nightfleetSec(f) : '') + originSec(f) + houseExtras(f, reigns) + sec('History', hist) + sec('Who’s who', who) + sec('Elections', elx.length ? actList(elx, 30) : '') + sec('Wars', wl) + sec('Territory', wd) + arm + (() => { const es = EW().filter(e => e.f === f.id); const now = es.filter(e => e.y1 == null); return sec('Policies & edicts', es.length ? `<p>The house has proclaimed ${es.length} recorded edict${es.length > 1 ? 's' : ''}${now.length ? `; ${now.length} stand${now.length === 1 ? 's' : ''} today` : ''}. Results by edict (change in order and income while it stood):</p>${edictSummary(es)}<ul>${es.slice(-15).reverse().map(e => edictLine(e)).join('')}</ul>` : ''); })() + sec('Recent battles', bs.length ? `<ul>${bs.slice(-20).reverse().map(b => bLine(b)).join('')}</ul>` : '') + sec('From the ledger', ledgerList(ledgerFor(f.name, 25)));
}
// Emergent houses: where they came from (f.origin written by main.js emergentTick)
const OIC = { claim: '⚔', secession: '👑', oathbreak: '🗡', fork: '🤖', rising: '⚑' };
const OKIND = { claim: 'a pretender’s house', secession: 'a breakaway kingdom', oathbreak: 'a warband of Nightfleet oathbreakers', fork: 'a machine-mind fork', rising: 'a new house risen from the independent worlds' };
function originSec(f) {
  const o = f.origin; if (!o) return '';
  const parent = o.from != null && F[o.from];
  const wars = parent ? W().wars.filter(w => (w.a === f.id && w.b === o.from) || (w.b === f.id && w.a === o.from)) : [];
  const now = parent && F[o.from]?.alive ? (S.war?.has?.(wkey(f.id, o.from)) ? 'still at war with' : S.ally?.has?.(wkey(f.id, o.from)) ? 'now allied to' : 'at peace with') : null;
  return sec('Origins', `<p>${OIC[o.kind] || '⚑'} ${o.y != null ? `<b>Y${o.y}</b>: ` : ''}${link(o.why, o.y ?? S.year)}.</p>
<ul>${parent ? `<li><b>Broke away from:</b> ${fL(o.from)}${now ? ` — ${now} its parent house` : F[o.from] && !F[o.from].alive ? ' — the parent house has since fallen' : ''}</li>` : ''}${CH[o.who] ? `<li><b>Founder:</b> ${cL(o.who)}</li>` : ''}${o.at != null ? `<li><b>Birthplace:</b> ${sL(o.at)}</li>` : ''}${o.worlds?.length ? `<li><b>Worlds that rose with it:</b> ${o.worlds.map(n => { const s = systems.find(x => x.name === n); return s ? sL(s.i) : n; }).join(', ')}</li>` : ''}${wars.length ? `<li><b>Wars of separation:</b> ${wars.map(w => L('w:' + w.id, warTitle(w))).join(', ')}</li>` : ''}</ul>`);
}
// House overview: rulers in order, line of succession, royal family, standing among the houses
const age = c => c?.age != null ? Math.floor(c.age) : null;
function houseExtras(f, reigns) {
  let out = '';
  if (reigns.length) out += sec('Rulers', `<table class="wkBox" style="float:none;width:100%;max-width:100%;margin:6px 0"><tr><th>#</th><th>Ruler</th><th>Reign</th><th>Fate</th></tr>${reigns.map((r, i) => { const c = CH[r.c], end = reigns[i + 1]?.y; return `<tr><td>${i + 1}</td><td>${cL(r.c)}</td><td>Y${r.y}–${end ?? (f.alive && c && !c.dead ? 'present' : c?.deathY ?? '?')}</td><td>${!c ? '' : !c.dead ? (c === f.ruler ? 'reigning' : 'living') : 'died' + (c.deathY ? ` Y${c.deathY}` : '') + (age(c) ? ` aged ${age(c)}` : '')}</td></tr>`; }).join('')}</table>`);
  if (!f.alive) return out;
  const line = heirs(f).filter(c => c && !c.dead).slice(0, 8);
  if (line.length) out += sec('Line of succession', `<ol>${line.map(c => `<li>${cL(c.id)}${age(c) != null ? ` <small>(${age(c)})</small>` : ''}${title(c) ? ` — ${title(c)}` : ''}</li>`).join('')}</ol>`);
  const pr = (f.princesses || []).filter(c => c && !c.dead), bs = (f.bastards || []).filter(c => c && !c.dead);
  const sp = f.ruler?.spouse != null ? CH[f.ruler.spouse] : null;
  out += `<p>${L('h:' + f.id, '🌳 View the family tree of the house')}</p>`;
  if (sp || pr.length || bs.length) out += sec('Royal family', `${sp && !sp.dead ? `<p><b>Consort:</b> ${cL(sp.id)}${sp.f !== f.id && F[sp.f] ? ` <small>of ${F[sp.f].name}</small>` : ''}</p>` : ''}${pr.length ? `<p><b>Princesses:</b> ${pr.map(c => `${cL(c.id)}${age(c) != null ? ` <small>(${age(c)})</small>` : ''}`).join(' · ')}</p>` : ''}${bs.length ? `<p><b>Base-born:</b> ${bs.map(c => cL(c.id)).join(' · ')}</p>` : ''}`);
  const others = F.filter(x => x?.alive && x.name && x.id !== f.id);
  const allies = others.filter(x => S.ally?.has?.(wkey(f.id, x.id))), foes = others.filter(x => S.war?.has?.(wkey(f.id, x.id)));
  const op = others.map(x => [x, S.mem?.[f.id + '>' + x.id] || 0]).filter(([, v]) => Math.abs(v) >= 6).sort((a, b) => b[1] - a[1]);
  const why = x => { const w = S.memWhy?.[f.id + '>' + x.id]; return w ? ` <small>— ${html(String(w))}</small>` : ''; };
  const rel = (allies.length ? `<p><b>Allies:</b> ${allies.map(x => fL(x.id)).join(' · ')}</p>` : '') + (foes.length ? `<p><b>At war with:</b> ${foes.map(x => fL(x.id)).join(' · ')}</p>` : '')
    + (op.filter(o => o[1] > 0).length ? `<p><b>Friendly towards:</b></p><ul>${op.filter(o => o[1] > 0).slice(0, 6).map(([x, v]) => `<li>${fL(x.id)} (+${Math.round(v)})${why(x)}</li>`).join('')}</ul>` : '')
    + (op.filter(o => o[1] < 0).length ? `<p><b>Hostile towards:</b></p><ul>${op.filter(o => o[1] < 0).reverse().slice(0, 6).map(([x, v]) => `<li>${fL(x.id)} (${Math.round(v)})${why(x)}</li>`).join('')}</ul>` : '');
  out += sec('Relations', rel || '<p>The house has no allies, wars or strong feelings towards other houses.</p>');
  out += vassSec(f);
  const fleets = units.filter(u => u.owner === f.id && u.type === 'fleet'), mine = systems.filter(s => s.owner === f.id);
  const ships = fleets.reduce((n, u) => n + (u.fleet || 0), 0) + mine.reduce((n, s) => n + (s.fleet || 0), 0), leg = fleets.reduce((n, u) => n + (u.legions || 0) + (u.elite || 0), 0) + mine.reduce((n, s) => n + (s.legions || 0) + (s.elite || 0), 0);
  const inc = systems.filter(s => s.owner === f.id).reduce((n, s) => n + (s.income || 0), 0);
  out += sec('Strength', `<p>${fleets.length} field fleet${fleets.length !== 1 ? 's' : ''}; ${ships} ships and ${leg} legions in all; income about ${Math.round(inc)} credits a turn. Rank by worlds: ${1 + others.filter(x => nW(x.id) > nW(f.id)).length} of ${others.length + 1}.</p>`);
  return out;
}
function planetPage(s) {
  const bs = battles().filter(b => b.at === s.i), g = s.general;
  const owners = [...new Set(bs.filter(b => b.k === 'land' && b.w === 'a').map(b => b.a))];
  let lead = `<p><b>${s.name}</b> is a world ${s.owner >= 0 ? `held by ${fL(s.owner)}` : 'held by no great house'}.`;
  if (s.holy != null) lead += ' It is one of the holy worlds, sacred to the faithful.';
  if (F[s.owner]?.capital === s) lead += ` It is the seat of ${F[s.owner].name}.`;
  if (g) lead += ` Its governor is ${cL(g.id)}.`;
  if (bs.length) lead += ` ${bs.length} battle${bs.length > 1 ? 's have' : ' has'} been fought for it${owners.length ? `, and it has been taken by storm by ${owners.map(fN).join(', ')}` : ''}.`;
  lead += '</p>';
  const cmds = [...new Set(bs.flatMap(b => [b.ga, b.gd]).filter(x => x != null && CH[x]))];
  if (cmds.length) lead += `<p>Commanders who fought here include ${cmds.slice(0, 12).map(cL).join(', ')}.</p>`;
  const info = box(s.name, '', [['Owner', s.owner >= 0 ? fL(s.owner) : 'Independent'], ['Governor', g ? cL(g.id) : ''], ['Income', s.income], ['Order', s.order], ['Buildings', [...(s.b || [])].join(', ')], ['Holy world', s.holy != null ? 'Yes' : ''], ['Neighbours', (s.links || []).filter(Boolean).map(l => sL(l.i)).join(', ')]]);
  const es = EW().filter(e => e.s === s.i), gw = GWW().filter(r => r.s === s.i), hitBy = SWW().filter(x => x.t === s.i), fired = SWW().filter(x => x.src === s.i);
  const vault = BW().filter(r => r.vault === s.i && !bladeHolder(r) && !r.end), made = BW().filter(r => r.at === s.i && (r.how === 'forged' || r.how === 'found'));
  const bl = (made.length ? `<p>Starblades born here: ${made.map(r => aL(r.id)).join(', ')}.</p>` : '') + (vault.length ? `<p>Resting in its vault: ${vault.map(r => aL(r.id)).join(', ')}.</p>` : '');
  return info + lead + sec('Great Works', gw.length ? `<ul>${gw.slice().reverse().map(workLine).join('')}</ul>` : '') + sec('Starblades', bl) + sec('Superweapon strikes', hitBy.length + fired.length ? `<ul>${[...hitBy, ...fired].sort((a, b) => a.y - b.y).map(strikeLine).join('')}</ul>` : '') + sec('Edicts', es.length ? `<ul>${es.slice(-20).reverse().map(e => edictLine(e)).join('')}</ul>` : '') + sec('Battles', bs.length ? `<ul>${bs.slice().reverse().map(b => bLine(b)).join('')}</ul>` : '') + sec('From the ledger', ledgerList(ledgerFor(s.name, 25)));
}
function warPage(w) {
  const bs = warBattles(w), wa = bs.filter(b => bWin(b) === w.a).length, wb = bs.filter(b => bWin(b) === w.b).length, o = warOutcome(w);
  const A = w.an || fname(w.a), B = w.bn || fname(w.b);
  let lead = `<p>The <b>${warTitle(w)}</b> (Y${w.y0}–${w.y1 ?? 'present'}) was fought between ${fL(w.a)}${CH[w.ra] ? ` under ${cL(w.ra)}` : ''} and ${fL(w.b)}${CH[w.rb] ? ` under ${cL(w.rb)}` : ''}.`;
  if (w.why) lead += ` It was born of ${link(w.why, w.y0, 'w:' + w.id)}.`;
  lead += ` ${o.d}</p>`;
  // Course of the war
  let course = '';
  if (bs.length) {
    const first = bs[0], last = bs[bs.length - 1], deci = bs.filter(b => verdict(b) === 'Decisive victory'), caps = bs.filter(b => b.k === 'land' && b.w === 'a');
    course = `<p>The fighting opened at the ${bL(first)} in Y${first.y}, a ${verdict(first).toLowerCase()} for ${fname(bWin(first))}.`;
    if (bs.length > 2) course += ` Over ${bs.length} engagements, ${A} won ${wa} and ${B} won ${wb}.`;
    if (caps.length) course += ` ${caps.length} world${caps.length > 1 ? 's were' : ' was'} taken by assault: ${caps.map(b => sL(b.at)).join(', ')}.`;
    if (deci.length) course += ` The decisive actions were ${deci.slice(0, 3).map(bL).join(', ')}.`;
    if (bs.length > 1) course += ` The last recorded battle was the ${bL(last)} in Y${last.y}.`;
    course += '</p>';
  } else course = `<p>No battle was ever fought. The war was declared${w.y1 != null ? ' and ended' : ''} without a single recorded engagement.</p>`;
  // Significance
  const sig = [];
  if (w.wa != null) { const ea = w.ea ?? nW(w.a), eb = w.eb ?? nW(w.b); sig.push(`At its outbreak ${A} held ${w.wa} worlds and ${B} ${w.wb}; ${w.y1 != null ? 'at its end' : 'today'} they hold ${ea} and ${eb}.`); }
  const rulersFell = W().reigns.filter(r => (r.f === w.a || r.f === w.b) && r.y > w.y0 && r.y <= (w.y1 ?? S.year));
  if (rulersFell.length) sig.push(`The throne changed hands ${rulersFell.length} time${rulersFell.length > 1 ? 's' : ''} during the war (${rulersFell.map(r => cL(r.c)).join(', ')}).`);
  const gens = {}; bs.forEach(b => [b.ga, b.gd].forEach(g => { if (g != null) gens[g] = (gens[g] || 0) + 1; }));
  const topG = Object.entries(gens).sort((x, y) => y[1] - x[1]).slice(0, 3);
  if (topG.length) sig.push(`Its foremost commanders were ${topG.map(([g, n]) => `${cL(+g)} (${n} battle${n > 1 ? 's' : ''})`).join(', ')}.`);
  if (w.end === 'fall') sig.push(`With the fall of ${fN(w.fell)}, the map of the galaxy was redrawn.`);
  const fronts = [...new Set(bs.map(b => b.at).filter(x => systems[x]))];
  if (fronts.length) sig.push(`The war was fought across ${fronts.length} world${fronts.length > 1 ? 's' : ''}: ${fronts.map(sL).join(', ')}.`);
  const fallen = [...new Set(bs.flatMap(b => [[b.ga, b], [b.gd, b]]).filter(([g, b]) => cmdFate(g, b) === 'slain').map(([g]) => g))];
  if (fallen.length) sig.push(`Among the fallen were ${fallen.map(cL).join(', ')}.`);
  const others = W().wars.filter(x => x !== w && (x.a === w.a || x.b === w.a || x.a === w.b || x.b === w.b) && x.y0 <= (w.y1 ?? S.year) && (x.y1 ?? S.year) >= w.y0);
  if (others.length) sig.push(`It overlapped with the ${others.slice(0, 4).map(x => L('w:' + x.id, warTitle(x))).join(', ')}, stretching both houses on several fronts.`);
  const info = box(warTitle(w), '', [['Date', `Y${w.y0} – ${w.y1 ?? 'present'}`], ['Cause', w.why ? link(cap(w.why), w.y0, 'w:' + w.id) : ''], ['Result', o.t],
    ['—', 'Belligerents'], [fL(w.a), CH[w.ra] ? cL(w.ra) : ''], [fL(w.b), CH[w.rb] ? cL(w.rb) : ''], ['—', 'Battles'], ['Fought', bs.length], [A, `${wa} won`], [B, `${wb} won`]]);
  return info + lead + sec('Course of the war', course) + sec('Significance', sig.length ? `<p>${sig.join(' ')}</p>` : '') + sec('Battle index', bs.length ? `<ol class="wkOl">${bs.map(b => bLine(b).replace(/^<li>/, '<li>')).join('')}</ol>` : '');
}
function battlePage(b) {
  const win = bWin(b), w = warOf(b), wb = w ? warBattles(w) : [], n = wb.indexOf(b) + 1, imp = importance(b);
  const lead = `<p>The <b>${bName(b)}</b> was a ${b.k === 'land' ? 'ground' : 'space'} battle fought in Y${b.y}${systems[b.at] ? ` ${b.k === 'land' ? 'on' : 'over'} ${sL(b.at)}` : ''}${w ? `, the ${n === 1 ? 'opening' : ord(n).toLowerCase()} battle of the ${L('w:' + w.id, warTitle(w))}` : ''}. ${fL(b.a)}${b.ga != null ? `, led by ${cL(b.ga)},` : ''} attacked ${fL(b.d)}${b.gd != null ? ` under ${cL(b.gd)}` : b.cd ? ` under ${kL(b.cd)}` : ''}. ${b.fled ? 'The attack was abandoned.' : `It ended in a ${verdict(b).toLowerCase()} for ${fN(win)}.`}</p>`;
  const same = battles().filter(x => x !== b && x.at === b.at && b.at != null);
  const other = same.length ? `<p>Other battles fought ${b.k === 'land' ? 'on' : 'over'} ${sL(b.at)}: ${same.slice(-8).map(x => `${bL(x)} (Y${x.y})`).join(', ')}.</p>` : '';
  const nav = w && wb.length > 1 ? `<p class="wkNav">${n > 1 ? `◀ ${bL(wb[n - 2])}` : ''}${n > 1 && n < wb.length ? ' · ' : ''}${n < wb.length ? `${bL(wb[n])} ▶` : ''}</p>` : '';
  const info = box(bName(b), '', [['Date', 'Y' + b.y], ['Location', systems[b.at] ? sL(b.at) : ''], ['Type', b.k === 'land' ? 'Ground assault' : 'Space battle'], ['Part of', w ? `${L('w:' + w.id, warTitle(w))}<br><small>battle ${n} of ${wb.length}</small>` : ''], ['Result', b.fled ? 'Withdrawal' : `${verdict(b)} for ${fname(win)}`],
    ['—', 'Attacker'], ['House', fL(b.a)], ['Commander', b.ga != null ? cL(b.ga) : b.ca ? kL(b.ca) + ' <small>(captain)</small>' : ''], ['Strength', b.pa ? Math.round(b.pa) : ''], ['Losses', b.la + '%'],
    ['—', 'Defender'], ['House ', fL(b.d)], ['Commander ', b.gd != null ? cL(b.gd) : b.cd ? kL(b.cd) + ' <small>(captain)</small>' : ''], ['Strength ', b.pd ? Math.round(b.pd) : ''], ['Losses ', b.ld + '%']]);
  const blades = [[b.sa, b.ga], [b.sd, b.gd]].filter(([a]) => a != null).map(([a, g]) => `${cL(g)} carried the ${aL(a)} into the fight.`).join(' ');
  // Commanders' temperaments on the day, and the phase-by-phase course of a commanded battle
  const temper = [[b.ga, b.ga0, b.a], [b.gd, b.gd0, b.d]].filter(([g, t]) => g != null && t?.length).map(([g, t, f]) => `${cL(g)} of ${fN(f)} went into battle ${t.map(x => x.toLowerCase()).join(', ')}.`).join(' ');
  const ST = { agg: 'aggressive', def: 'defensive', man: 'manoeuvring' };
  const pSide = b.jp, pG = pSide === 'a' ? b.ga : b.gd, oG = pSide === 'a' ? b.gd : b.ga, pF = pSide === 'a' ? b.a : b.d, oF = pSide === 'a' ? b.d : b.a;
  const nm = (g, f) => g != null && CH[g] ? cL(g) : fN(f);
  const third = s => String(s).replace(/\byour\b/gi, `${fname(pF)}'s`).replace(/\btheir\b/gi, `${fname(oF)}'s`).replace(/^The enemy/, fname(oF));
  const course = (b.j || []).map(j => j.e ? `<li><i>${third(j.e.replace(/^Your forces/, `The forces of ${fname(pF)}`).replace(/your way/, `in favour of ${fname(pF)}`))}</i></li>` :
    `<li><b>${nm(pG, pF)}</b> ordered <b>${j.o}</b>${j.t ? ` (${ST[j.t]})` : ''}; ${nm(oG, oF)} stood ${ST[j.s]} — <i>${j.w}</i>. ${j.v === 'good' ? 'The order told.' : j.v === 'bad' ? 'It was the wrong call.' : 'Neither side gained the upper hand.'}${j.m?.length ? ` <small>(${j.m.map(third).join('; ')})</small>` : ''} <small>${fname(oF)} lost ${j.d}% · ${fname(pF)} lost ${j.k}%</small></li>`).join('');
  const ground = b.pt ? `<p>🪐 It was fought ${b.k === 'land' ? 'on the surface of' : 'in the skies of'} a <b>${b.pt}</b>${systems[b.at] ? ` (${sL(b.at)})` : ''}.</p>` : '';
  const fallen = (b.fates || []).filter(x => x.k === 'died' && CH[x.c]);
  const fallenP = fallen.length ? `<p>☠ <b>Among the fallen:</b> ${fallen.map(x => `${cL(x.c)}${x.t ? ` (${x.t})` : ''}`).join('; ')}.</p>` : '';
  return info + lead + fallenP + (blades ? `<p>⚔ ${blades}</p>` : '') + (temper ? `<p>${temper}</p>` : '') + sec('Course of the battle', course ? `<ol>${course}</ol>` : '') + sec('Fate of the lords', fateSec(b)) + sec('Strategic importance', `<p>${imp.strat}</p>`) + sec('Tactical analysis', imp.tac ? `<p>${imp.tac}</p>` : '') + sec('The battlefield', ground + other) + nav;
}
// What became of the commanders and the lords taken when the battle was lost
const FATE_TXT = { died: 'was slain', captive: 'was taken prisoner by', ward: 'was taken as a ward by', enslaved: 'was enslaved by', exiled: 'was cast into exile by', tortured: 'was tortured at the order of', sold: 'was sold off-world by', 'captive-end': 'left the cells of', 'enslaved-end': 'was freed from bondage to', 'ward-end': 'left the wardship of', fealty: 'swore fealty to' };
const FATE_IC = { died: '☠', captive: '⛓', ward: '🧒', enslaved: '⛓', exiled: '🚪', tortured: '🩸', sold: '💰', 'captive-end': '🕊', 'enslaved-end': '🕊', 'ward-end': '🕊', fealty: '🙇' };
function fateLine(x, y) {
  const by = x.k === 'died' ? (F[x.by] ? ` by the forces of ${fN(x.by)}` : '') : x.k === 'tortured' ? ` ${link(x.t || '', y)}${F[x.by] ? ` (${fN(x.by)})` : ''}` : F[x.by] ? ` ${fN(x.by)}` : '';
  const why = x.t && x.k !== 'tortured' ? ` — <i>${x.t}</i>` : '';
  return `${FATE_IC[x.k] || '•'} ${cL(x.c)}${x.cmd ? ' <small>(commander)</small>' : ''} ${FATE_TXT[x.k] || x.k}${by}${x.y != null ? ` in Y${x.y}` : ''}${why}.`;
}
function fateSec(b) {
  const now = b.fates || [], later = b.later || [];
  const seen = new Set(now.map(x => x.c));
  // Commanders who walked away unharmed
  const safe = b.tn == null ? [] : [b.ga, b.gd].filter(id => id != null && CH[id] && !seen.has(id)).map(id => `🛡 ${cL(id)} <small>(commander)</small> survived the battle${CH[id].dead && CH[id].deathY != null && CH[id].deathY > b.y ? `; died Y${CH[id].deathY}` : ''}.`);
  const rows = [...now.map(x => fateLine(x, b.y)), ...safe];
  if (!rows.length && !later.length) return '';
  return `<ul>${rows.map(r => `<li>${r}</li>`).join('')}</ul>${later.length ? `<h3>Afterwards</h3><ul>${later.map(x => `<li>${fateLine(x, x.y)}</li>`).join('')}</ul>` : ''}`;
}
// Fleet captains: not lords, but the archive remembers the battles they fought
function captainPage(name) {
  const bs = battles().filter(b => b.ca === name || b.cd === name);
  const wins = bs.filter(b => (b.ca === name && b.w === 'a') || (b.cd === name && b.w === 'd')).length;
  const houses = [...new Set(bs.map(b => (b.ca === name ? b.a : b.d)))];
  const wars = [...new Set(bs.map(warOf).filter(Boolean))];
  const info = box(name, '', [['Rank', 'Fleet captain'], ['Served', houses.map(fL).join('<br>')], ['Battles', `${wins} won · ${bs.length - wins} lost`], ['Wars', wars.map(w => L('w:' + w.id, warTitle(w))).join('<br>')]]);
  const lead = `<p><b>${name}</b> was a fleet captain of ${houses.map(fN).join(' and ')}, a commoner who held the bridge where no lord commanded. The archive records ${bs.length} battle${bs.length !== 1 ? 's' : ''} under ${name.split(' ').slice(-1)[0]}'s command${bs.length ? `, from Y${bs[0].y} to Y${bs[bs.length - 1].y}` : ''}, with ${wins} won.</p>`;
  return info + lead + sec('Battles', bs.length ? `<ul>${bs.map(b => bLine(b)).join('')}</ul>` : '');
}

// ================= Starblades, Great Works, superweapon strikes =================
const aL = id => { const r = bladeRec(id); return r ? L('a:' + id, r.nm) : 'a Starblade'; };
const HOW = { forged: 'forged for', found: 'found in the ruins by', armed: 'given to', inherited: 'inherited by', claimed: 'claimed by', vault: 'taken from the vault by' };
function bladeHolder(r) { const l = r.h[r.h.length - 1]; return r.end ? null : l?.c != null ? CH[l.c] : null; }
function bladePage(r) {
  const cur = bladeHolder(r), bs = battles().filter(b => b.sa === r.id || b.sd === r.id);
  const won = bs.filter(b => (b.sa === r.id && b.w === 'a') || (b.sd === r.id && b.w === 'd')).length;
  const bearers = [...new Set(r.h.filter(h => h.c != null).map(h => h.c))];
  const origin = r.how === 'forged' ? `forged in Y${r.y} at ${sL(r.at)} for ${fN(r.f)}` : r.how === 'found' ? `pulled from the ruins of ${sL(r.at)} in Y${r.y}` : r.how === 'inherited' || r.how === 'claimed' ? `first recorded in Y${r.y}` : `first borne in Y${r.y} by a lord of ${fN(r.f)}${r.note ? ` (${link(r.note, r.y)})` : ''}`;
  let lead = `<p><b>${r.nm}</b> is a Starblade ${origin}. It has passed through ${bearers.length} hand${bearers.length !== 1 ? 's' : ''}`;
  lead += cur ? ` and is borne today by ${cL(cur.id)} of ${fN(cur.f)}.` : r.vault != null ? ` and now rests in the vault of ${sL(r.vault)}.` : r.end ? `; it was ${r.end.t} in Y${r.end.y}${CH[r.end.c] ? ` (${cL(r.end.c)})` : ''}.` : '.';
  if (bs.length) lead += ` It was carried into ${bs.length} recorded battle${bs.length > 1 ? 's' : ''}, ${won} of them won.`;
  lead += '</p>';
  const chain = `<ol>${r.h.map(h => h.c == null ? `<li><b>Y${h.y}</b> — laid in the vault of ${sL(h.s)}${CH[h.from] ? ` after ${cL(h.from)}` : ''}</li>` : `<li><b>Y${h.y}</b> — ${HOW[h.how] || 'borne by'} ${cL(h.c)}${CH[h.from] ? ` from ${cL(h.from)}` : ''}${h.s != null && h.how === 'vault' ? ` at ${sL(h.s)}` : ''}</li>`).join('')}${r.end ? `<li><b>Y${r.end.y}</b> — ${r.end.t}</li>` : ''}</ol>`;
  const info = box(r.nm, '', [['Origin', r.how === 'forged' ? 'Forged' : r.how === 'found' ? 'Found in ruins' : 'Old armoury'], ['First recorded', 'Y' + r.y], ['Made at', r.at != null ? sL(r.at) : ''], ['Bearer', cur ? cL(cur.id) : ''], ['In vault', r.vault != null && !cur ? sL(r.vault) : ''], ['Fate', r.end ? `${cap(r.end.t)} (Y${r.end.y})` : ''], ['Bearers', bearers.length], ['Battles', bs.length ? `${won} won · ${bs.length - won} lost` : '']]);
  const deeds = r.d.length ? `<ul>${r.d.map(d => `<li><b>Y${d.y}</b> — ${cL(d.c)} ${link(d.t, d.y)}</li>`).join('')}</ul>` : '';
  return info + lead + sec('Bearers', chain) + sec('Great deeds', deeds) + sec('Battles', bs.length ? `<ul>${bs.map(b => bLine(b)).join('')}</ul>` : '');
}
const WEND = { done: 'completed', lost: 'lost with the world', abandoned: 'abandoned' };
const xL = x => L('x:' + x.i, `${x.w} strike on ${x.tn}`);
function workPage(r) {
  const sup = SUPERS.includes(r.n), st = r.fired != null ? SWW()[r.fired] : null, s = systems[r.s];
  let lead = `<p>The <b>${r.n}</b> of ${sL(r.s)} was a ${sup ? 'superweapon' : 'Great Work'} raised by ${fN(r.f)}, begun in Y${r.y0}${CH[r.g] ? ` under ${cL(r.g)}` : ''}.`;
  lead += r.end ? ` It was ${WEND[r.end]} in Y${r.y1}.` : ' Construction continues.';
  if (st) lead += ` In Y${st.y} it was fired upon ${sL(st.t)}: ${xL(st)}.`;
  else if (sup && r.end === 'done') lead += ' It stands ready, unfired.';
  else if (!sup && r.end === 'done' && s?.b?.has?.(r.n)) lead += ' It still stands.';
  lead += '</p>';
  return box(r.n, '', [['Type', sup ? 'Superweapon' : 'Great Work'], ['World', sL(r.s)], ['Builder', fL(r.f)], ['Begun', 'Y' + r.y0], ['Result', r.end ? `${cap(WEND[r.end])} (Y${r.y1})` : 'Under construction'], ['Fired', st ? xL(st) : '']]) + lead;
}
function strikePage(x) {
  const wk = GWW().find(r => r.id === x.work);
  let lead = `<p>In Y${x.y}, ${fN(x.by)} fired the <b>${x.w}</b>${x.src != null ? ` from ${sL(x.src)}` : ''} upon <b>${sL(x.t)}</b> (then called ${x.tn}), a world of ${fN(x.v)}.`;
  lead += x.w === 'World Devastators' ? ' Its garrisons were wiped out and its wealth halved, but the world lived.' : ` The world died${x.hn?.length > 1 ? `, and with it ${x.hn.slice(1).join(', ')}` : ''}.`;
  if (x.k?.length) lead += ` Among the dead were ${x.k.map(cL).join(', ')}.`;
  lead += ' The scar it left deepened the Apocalypse.</p>';
  const w = W().wars.find(v => ((v.a === x.by && v.b === x.v) || (v.b === x.by && v.a === x.v)) && x.y >= v.y0 && x.y <= (v.y1 ?? S.year));
  if (w) lead += `<p>It was fired during the ${L('w:' + w.id, warTitle(w))}.</p>`;
  return box(`${x.w} strike`, '', [['Date', 'Y' + x.y], ['Weapon', wk ? L('g:' + wk.id, x.w) : x.w], ['Fired by', fL(x.by)], ['From', x.src != null ? sL(x.src) : ''], ['Target', sL(x.t)], ['Victim', x.v >= 0 ? fL(x.v) : 'Independent'], ['Worlds killed', x.hn?.length || ''], ['Lords slain', x.k?.length || '']]) + lead;
}
const workLine = r => `<li>${L('g:' + r.id, `${r.n} of ${r.sn}`)} (Y${r.y0}–${r.y1 ?? 'building'}) · ${fN(r.f)} · <i>${r.end ? WEND[r.end] : 'under construction'}</i>${r.fired != null ? ` · fired: ${xL(SWW()[r.fired])}` : ''}</li>`;
const strikeLine = x => `<li><b>Y${x.y}</b> — ${xL(x)} by ${fN(x.by)}${x.k?.length ? ` · ${x.k.length} lord${x.k.length > 1 ? 's' : ''} slain` : ''}</li>`;

// ================= Timeline: the great events of each decade =================
// imp: 3 = epochal (house falls, superweapon, Domiri unmade), 2 = major (wars, coronations, decisive battles), 1 = notable
function events() {
  const ev = [], add = (y, imp, ic, t) => y != null && ev.push({ y, imp, ic, t });
  F.forEach(f => { const o = f?.origin; if (o && o.y != null) add(o.y, o.kind === 'rising' ? 1 : 2, OIC[o.kind] || '⚑', `${fN(f.id)} is born${o.from != null && F[o.from] ? ` out of ${fN(o.from)}` : ''}: ${o.why}.`); });
  VW().forEach(o => { if (o.y0 != null) add(o.y0, 1, '🙇', `${fN(o.v)} swears fealty to ${fN(o.l)}.`); if (o.y1 != null && o.end === 'broke') add(o.y1, 1, '⛓', `${fN(o.v)} breaks its oath of fealty to ${fN(o.l)}.`); });
  for (const w of W().wars) {
    const wbs = warBattles(w); if (!wbs.length) continue; // a declaration without a battle is no war in the chronicle
    add(wbs[0].y, 2, w.recl ? '✠' : '⚔', `${L('w:' + w.id, warTitle(w))} begins between ${fN(w.a)} and ${fN(w.b)}${w.why ? ` — ${link(w.why, w.y0, 'w:' + w.id)}` : ''}.`);
    if (w.y1 != null) { const o = warOutcome(w); add(w.y1, w.end === 'fall' ? 3 : 2, w.end === 'fall' ? '🏳' : '🕊', `${L('w:' + w.id, warTitle(w))} ends: ${o.t}.${w.end === 'fall' ? ` ${fN(w.fell)} falls.` : ''}`); }
  }
  const prev = {};
  for (const r of W().reigns) { add(r.y, 2, '👑', `${cL(r.c)} is crowned ruler of ${fN(r.f)}${prev[r.f] != null ? `, succeeding ${cL(prev[r.f])}` : ''}.`); prev[r.f] = r.c; }
  battles().forEach((b, i) => {
    const cap = b.k === 'land' && b.w === 'a' && b.cap, dec = verdict(b) === 'Decisive victory';
    if (cap || dec || b.holy) add(b.y, cap ? 2 : 1, cap ? '🏰' : '💥', `${L('b:' + b.id, bTitles()[i])}: ${verdict(b).toLowerCase()} for ${fN(bWin(b))}${cap ? `, which takes the seat ${sL(b.at)}` : ''}.`);
  });
  for (const r of BW()) {
    if (r.how === 'forged' || r.how === 'found') add(r.y, 1, '⚔', `The ${aL(r.id)} is ${r.how === 'forged' ? `forged at ${sL(r.at)}` : `found in the ruins of ${sL(r.at)}`}.`);
    r.d.forEach(d => add(d.y, 3, '⚔', `${cL(d.c)}, bearing the ${aL(r.id)}, ${link(d.t, d.y)}.`));
    if (r.end) add(r.end.y, 1, '⚔', `The ${aL(r.id)} is ${r.end.t}.`);
  }
  for (const g of GWW()) if (g.end === 'done') add(g.y1, SUPERS.includes(g.n) ? 2 : 1, SUPERS.includes(g.n) ? '☄' : '🏛', `${fN(g.f)} completes the ${L('g:' + g.id, g.n)} at ${sL(g.s)}.`);
  for (const x of AW()) if (x.k === 'duel' && x.died && x.r) add(x.y, 2, '⚔', `${cL(x.ok ? x.t : x.a)}, ${x.r}, is slain in a duel by ${cL(x.ok ? x.a : x.t)}.`);
  for (const x of AW()) if (x.k === 'kill' && x.ok && x.r) add(x.y, 2, '🗡', `${cL(x.t)}, ${x.r}, is assassinated${CH[x.a] ? ` by ${cL(x.a)}` : ''}${F[x.f] ? ` of ${fN(x.f)}` : ''}.`);
  for (const x of SWW()) add(x.y, 3, '☄', `${fN(x.by)} fires the ${x.w} upon ${sL(x.t)}: ${xL(x)}${x.k?.length ? `, killing ${x.k.map(cL).join(', ')}` : ''}.`);
  for (const c of Object.values(CH)) if (c?.dead && (c.wasRuler || W().reigns.some(r => r.c === c.id)) && c.deathY != null) add(c.deathY, 1, '🪦', `Death of ${cL(c.id)}, once ruler of ${fN(c.f)}.`);
  return ev.sort((a, b) => a.y - b.y || b.imp - a.imp);
}
let _ev = null;
let _evBusy = false;
const evs = () => { if (_ev) return _ev; if (_evBusy) return []; _evBusy = true; try { _ev = events(); } finally { _evBusy = false; } return _ev; };
let _ds = null;
function decades() { if (_ds && _ev) return _ds; const ds = [...new Set(evs().map(e => Math.floor(e.y / 10) * 10))].sort((a, b) => a - b); if (_ev) _ds = ds; return ds; }
function timelinePage() {
  const ds = decades();
  if (!ds.length) return '<p>The archive has yet to record any great events.</p>';
  return `<p>The great events of the galaxy, decade by decade. Open a decade for the full chronicle.</p>` + ds.map(d => {
    const es = evs().filter(e => e.y >= d && e.y < d + 10), top = es.filter(e => e.imp >= 3).concat(es.filter(e => e.imp === 2)).slice(0, 6);
    return `<h3>${L('d:' + d, `The Y${d}s`)} <small style="opacity:.6">· ${es.length} events</small></h3><ul>${top.map(e => `<li><b>Y${e.y}</b> ${e.ic} ${e.t}</li>`).join('')}</ul>`;
  }).join('');
}
function decadePage(d) {
  const es = evs().filter(e => e.y >= d && e.y < d + 10), ds = decades(), i = ds.indexOf(d);
  const wars = W().wars.filter(w => warBattles(w).some(b => b.y >= d && b.y < d + 10)), bs = battles().filter(b => b.y >= d && b.y < d + 10);
  const crowns = W().reigns.filter(r => r.y >= d && r.y < d + 10).length;
  let lead = `<p>The <b>Y${d}s</b> saw ${wars.length} war${wars.length !== 1 ? 's' : ''} waged, ${bs.length} battle${bs.length !== 1 ? 's' : ''} fought and ${crowns} coronation${crowns !== 1 ? 's' : ''}.`;
  const strikes = SWW().filter(x => x.y >= d && x.y < d + 10).length; if (strikes) lead += ` ${strikes} superweapon strike${strikes > 1 ? 's' : ''} scarred the galaxy.`;
  const fell = es.filter(e => e.ic === '🏳').length; if (fell) lead += ` ${fell} war${fell > 1 ? 's' : ''} ended with a house destroyed.`;
  lead += '</p>';
  const nav = `<p class="wkNav">${i > 0 ? L('d:' + ds[i - 1], `◀ The Y${ds[i - 1]}s`) : ''}${i > 0 && i < ds.length - 1 ? ' · ' : ''}${L('t:', '🕰 Timeline')}${i < ds.length - 1 ? ' · ' + L('d:' + ds[i + 1], `The Y${ds[i + 1]}s ▶`) : ''}</p>`;
  const byY = {}; es.forEach(e => (byY[e.y] ??= []).push(e));
  const body = Object.keys(byY).sort((a, b) => a - b).map(y => `<h3>Y${y}</h3><ul>${byY[y].map(e => `<li>${e.ic} ${e.imp >= 3 ? `<b>${e.t}</b>` : e.t}</li>`).join('')}</ul>`).join('');
  return box(`The Y${d}s`, '', [['Wars', wars.length], ['Battles', bs.length], ['Coronations', crowns], ['Strikes', strikes || '']]) + nav + lead + sec('Chronicle', body || '<p>A quiet decade.</p>') + nav;
}

// ================= Intrigue, marriage, trade & diplomacy =================
const who = (id, f, alt) => id != null && CH[id] ? `${cL(id)}${f != null && F[f] ? ` of ${fN(f)}` : ''}` : alt || (F[f] ? `an agent of ${fN(f)}` : 'an unknown hand');
function actLine(x) {
  const y = `<b>Y${x.y}</b> `;
  if (x.k === 'kill') return `<li>${y}🗡 ${who(x.a, x.f, F[x.f] ? `A hired killer of ${fN(x.f)}` : '')} ${x.ok ? 'assassinates' : 'fails to kill'} ${who(x.t, x.tf)}${x.s != null ? ` at ${sL(x.s)}` : ''}${x.r ? ` — <i>${x.r}</i>` : ''}${x.died ? '. The bounty hunter is caught and executed' : ''}.</li>`;
  if (x.k === 'wed') return `<li>${y}⚭ ${who(x.a, x.fa)} weds ${who(x.b, x.fb)}${x.fa !== x.fb && F[x.fa] && F[x.fb] ? ' — a marriage between houses' : ''}.</li>`;
  if (x.k === 'hyper') return `<li>${y}🛣 ${fN(x.f)}${x.to != null ? ` and ${fN(x.to)}` : ''} forge a hyperway ${sL(x.s)} ⇄ ${sL(x.s2)}${x.a != null ? `, negotiated by ${cL(x.a)}` : ''}.</li>`;
  if (x.k === 'trade') return `<li>${y}💰 ${who(x.a, x.f)} ${x.txt}${x.ok === false ? ' <small>(failed)</small>' : ''}</li>`;
  if (x.k === 'duel') return `<li>${y}⚔ ${who(x.a, x.f)} ${x.ref ? 'challenges' : x.ok ? 'defeats' : 'falls short against'} ${who(x.t, x.tf)} in single combat${x.s != null ? ` at ${sL(x.s)}` : ''}${x.ref ? ' — the challenge is refused' : x.died ? ` — ${x.ok ? cL(x.t) : cL(x.a)} is slain` : ' — the loser yields'}${x.txt ? ` <small>(${x.txt})</small>` : ''}.</li>`;
  if (x.k === 'rescue') return `<li>${y}🗝 ${who(x.a, x.f)} plots to free ${who(x.t, x.tf)} from ${F[x.by] ? fN(x.by) : 'captivity'}${x.s != null ? ` at ${sL(x.s)}` : ''}${x.ok ? ' — and succeeds' : x.died ? ' — the plotter is caught and killed' : ' — the plot fails'}.</li>`;
  if (x.k === 'elect') return `<li>${y}🗳 <b>${L('l:' + AW().indexOf(x), x.title)}</b> (${fN(x.f)}): ${CH[x.w] ? `${cL(x.w)} is chosen` : 'a ruler is chosen'}${x.txt ? `, ${x.txt}` : ''}${x.c?.length ? `, over ${x.c.filter(id => CH[id]).map(cL).join(', ')}` : ''}${x.bk != null && CH[x.bk] ? `. ${fN(P)} backed ${cL(x.bk)}${x.bk === x.w ? ' and won' : ' in vain'}${x.ex ? ' and the bribe was exposed' : ''}` : ''}.</li>`;
  if (x.k === 'tourney' && x.hp) return `<li>${y}🏆 ${fN(x.hf)} is crowned Champion House at the ${L('j:' + AW().indexOf(x), 'Grand Tourney')} of ${x.s != null ? sL(x.s) : 'the court'}, hosted by ${fN(x.h)} (${x.n} champions)${x.ev?.length ? `: ${x.ev.filter(e => CH[e.w]).map(e => `${TEV[e.k]?.ic || ''} ${cL(e.w)}`).join(', ')}` : ''}${x.ev?.some(e => e.hurt != null) ? `; ${x.ev.filter(e => e.hurt != null && CH[e.hurt]).map(e => `${cL(e.hurt)} ${e.died ? 'killed' : 'wounded'} in the ${TEV[e.k]?.n}${e.by != null && CH[e.by] ? ` by ${cL(e.by)}` : ''}`).join('; ')}` : ''}.</li>`;
  if (x.k === 'tourney') return `<li>${y}🏆 ${who(x.a, x.f)} wins the ${L('j:' + AW().indexOf(x), 'Grand Tourney')} of ${x.s != null ? sL(x.s) : 'the court'}, hosted by ${fN(x.h)}${x.n ? ` (${x.n} champions)` : ''}${x.rv?.length ? `, over ${x.rv.filter(id => CH[id]).map(cL).join(', ')}` : ''}${x.hurt != null && CH[x.hurt] ? `; ${cL(x.hurt)} ${x.died ? 'is killed in the lists' : 'is badly wounded'}${x.by != null && CH[x.by] ? ` by ${cL(x.by)}` : ''}${x.sl ? ', riding slack for a bribe' : ''}` : ''}${x.bz?.length ? ` <small>(${x.bz.length} bribe${x.bz.length > 1 ? 's' : ''} paid to the judges)</small>` : x.br ? ' <small>(the judges were bribed)</small>' : ''}.</li>`;
  if (x.k === 'hostage') { const HV = { given: `is given as a hostage to ${fN(x.to)} to seal the peace`, returned: `returns home from ${fN(x.to)}, the hostage term served`, freed: `is freed by ${fN(x.to)} under the terms of the peace`, slain: `is put to death by ${fN(x.to)} when ${fN(x.f)} breaks the peace`, kept: `is kept by ${fN(x.to)} as a ward when ${fN(x.f)} breaks the peace`, spared: `is sent home unharmed by ${fN(x.to)}, though ${fN(x.f)} broke the peace` }; return `<li>${y}🤝 ${who(x.a, x.f)} ${HV[x.v] || x.txt || ''}.</li>`; }
  if (x.k === 'dip') return `<li>${y}🕊 ${who(x.a, x.f, F[x.f] ? `An envoy of ${fN(x.f)}` : '')}${x.to != null && F[x.to] ? ` → ${fN(x.to)}` : ''}: ${x.txt}${x.ok === true ? ' ✅' : x.ok === false ? ' ❌' : ''}</li>`;
  return '';
}
const actList = (xs, n = 150) => xs.length ? `<ul>${xs.slice(-n).reverse().map(actLine).join('')}</ul>${xs.length > n ? `<small>…and ${xs.length - n} older records.</small>` : ''}` : '';
const tally = (xs, keyf) => { const m = {}; xs.forEach(x => { const k = keyf(x); if (k != null) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
function killPage() {
  const xs = AW().filter(x => x.k === 'kill'), ok = xs.filter(x => x.ok), royal = ok.filter(x => x.r);
  const top = tally(ok.filter(x => CH[x.a]), x => x.a).slice(0, 8), byH = tally(xs, x => x.f).slice(0, 8);
  return box('Assassinations', '', [['Attempts', xs.length], ['Successful', ok.length], ['Royal victims', royal.length], ['Bounty hunters executed', xs.filter(x => x.died).length]]) +
    `<p>Every recorded attempt on a life by bounty hunters and hired killers. Kings have died in their beds and generals at their posts.</p>` +
    sec('Deadliest bounty hunters', top.length ? `<ul>${top.map(([id, n]) => `<li>${cL(+id)} — ${n} kill${n > 1 ? 's' : ''}</li>`).join('')}</ul>` : '') +
    sec('Houses that sent killers', byH.length ? `<p>${byH.map(([f, n]) => `${fN(+f)} (${n})`).join(' · ')}</p>` : '') +
    sec('Royal victims', royal.length ? actList(royal, 40) : '') + sec('All attempts', actList(xs) || '<p>No assassination has yet been recorded.</p>') +
    sec('Duels & single combat', actList(AW().filter(x => x.k === 'duel'), 80)) + sec('Plots to free captives', actList(AW().filter(x => x.k === 'rescue'), 80));
}
function wedPage() {
  const xs = AW().filter(x => x.k === 'wed'), cross = xs.filter(x => x.fa !== x.fb);
  const ties = tally(cross, x => [x.fa, x.fb].sort((a, b) => a - b).join('|')).slice(0, 10);
  return box('Marriages', '', [['Weddings', xs.length], ['Between houses', cross.length]]) +
    `<p>Every wedding recorded by the archive. Matches between houses bind them in alliance.</p>` +
    sec('Houses most often joined', ties.length ? `<ul>${ties.map(([k, n]) => { const [a, b] = k.split('|'); return `<li>${fN(+a)} ⚭ ${fN(+b)} — ${n}</li>`; }).join('')}</ul>` : '') +
    sec('Weddings', actList(xs) || '<p>No weddings recorded yet.</p>');
}
function tradePage() {
  const tr = units.filter(u => u.type === 'agent' && u.role === 'Trader' && u.char && !u.char.dead);
  const roster = tr.map(u => `<li>${cL(u.char.id)} of ${fN(u.owner)} — ${u.post === u.sys?.i ? `trading at ${sL(u.sys.i)}` : `travelling, at ${sL(u.sys?.i)}`}</li>`).join('');
  const hy = (S.hyper || []).filter(p => systems[p[0]] && systems[p[1]]);
  const hyLog = AW().filter(x => x.k === 'hyper'), xs = AW().filter(x => x.k === 'trade');
  const posts = tally(tr.filter(u => u.post === u.sys?.i), u => u.owner);
  return box('Trade', '', [['Active traders', tr.length], ['Trade posts', tr.filter(u => u.post === u.sys?.i).length], ['Hyperways', hy.length]]) +
    `<p>Merchants of the great houses, their trade posts, and the hyperways built between houses.</p>` +
    sec('Traders today', roster ? `<ul>${roster}</ul>` : '<p>No traders are abroad.</p>') +
    sec('Trade posts by house', posts.length ? `<p>${posts.map(([f, n]) => `${fN(+f)} (${n})`).join(' · ')}</p>` : '') +
    sec('Hyperways', hy.length ? `<ul>${hy.map(([a, b]) => { const r = hyLog.find(x => (x.s === a && x.s2 === b) || (x.s === b && x.s2 === a)); return `<li>${sL(a)} ⇄ ${sL(b)}${r ? ` — Y${r.y}, ${fN(r.f)}${r.to != null ? ` & ${fN(r.to)}` : ''}` : ''}</li>`; }).join('')}</ul>` : '') +
    sec('Trade ledger', actList(xs) || '<p>No trade has been recorded yet.</p>');
}
function dipPage() {
  const ag = units.filter(u => u.type === 'agent' && (u.role === 'Diplomat' || u.role === 'Princess') && u.char && !u.char.dead);
  const KIND = { ally: 'seeking alliance', peace: 'suing for peace', wed: 'seeking a marriage', tribute: 'demanding tribute', bloodprice: 'demanding blood-price' };
  const roster = ag.map(u => `<li>${cL(u.char.id)}, ${u.role === 'Princess' ? 'princess' : 'diplomat'} of ${fN(u.owner)} — at ${sL(u.sys?.i)}${u.mission ? `, ${KIND[u.mission.kind] || u.mission.kind} with ${fN(u.mission.to)}` : ''}</li>`).join('');
  const al = [...(S.ally || [])].map(k => k.split('|').map(Number)).filter(([a, b]) => F[a]?.alive && F[b]?.alive);
  const xs = AW().filter(x => x.k === 'dip'), busy = tally(xs.filter(x => CH[x.a]), x => x.a).slice(0, 8);
  return box('Diplomacy', '', [['Envoys abroad', ag.length], ['Alliances', al.length], ['Wars', [...(S.war || [])].length], ['Recorded embassies', xs.length]]) +
    `<p>Diplomats and princesses on embassy, the alliances that bind the houses, and every recorded negotiation.</p>` +
    sec('Envoys abroad', roster ? `<ul>${roster}</ul>` : '<p>No envoys are abroad.</p>') +
    sec('Alliances', al.length ? `<p>${al.map(([a, b]) => `${fN(a)} 🤝 ${fN(b)}`).join(' · ')}</p>` : '<p>No alliances stand.</p>') +
    sec('Most active envoys', busy.length ? `<ul>${busy.map(([id, n]) => `<li>${cL(+id)} — ${n} embass${n > 1 ? 'ies' : 'y'}</li>`).join('')}</ul>` : '') +
    sec('Hostages & prisoner exchanges', actList(AW().filter(x => x.k === 'hostage')) || '<p>No peace has yet been sealed with hostages.</p>') +
    sec('Diplomatic record', actList(xs) || '<p>No embassies recorded yet.</p>');
}
// ================= The Nightfleet & the councils and electing bodies =================
function nightfleetSec(f) {
  const lc = f.ruler && !f.ruler.dead ? f.ruler : null;
  const council = (S.nmCouncil || []).map(id => CH[id]).filter(c => c && !c.dead);
  const bros = Object.values(CH).filter(c => c && !c.dead && c.f === 1 && !c.oathbroken);
  const exiles = bros.filter(c => c.exiledBy != null), fromH = tally(bros.filter(c => c.nmFrom != null || c.exiledBy != null), c => c.nmFrom ?? c.exiledBy).slice(0, 6);
  const breakers = Object.values(CH).filter(c => c && c.oathbroken);
  const rimB = battles().filter(b => b.a === 1 || b.d === 1), rimW = rimB.filter(b => bWin(b) === 1).length;
  const vets = bros.filter(c => (c.rim || 0) > 0).sort((a, b) => (b.rim || 0) - (a.rim || 0)).slice(0, 6);
  const backers = Object.keys(S.nmSupport || {}).filter(k => S.nmSupport[k] && F[k]?.alive).map(Number);
  const lcs = AW().filter(x => x.k === 'elect' && x.f === 1);
  return sec('The Watch', `<p><b>The Nightfleet</b> is a sworn brotherhood that guards the galactic rim. Its ranks are filled with exiles, bastards and younger sons that other houses send away; brothers give up house and heirs for life, and deserters become oathbreakers. It is led by a <b>Lord Commander</b>, elected by the <b>Council of Five</b>. ${lc ? `Current Lord Commander: ${cL(lc.id)}.` : 'The seat of the Lord Commander is empty.'}</p>`)
    + sec('The Council of Five', council.length ? `<table class="wkBox" style="float:none;width:100%;max-width:100%;margin:6px 0"><tr><th>Councillor</th><th>Age</th><th>Command</th><th>Rim battles</th><th>Post</th><th>Origin</th></tr>${council.map(c => { const fl = units.find(u => u.general === c), gv = systems.find(s => s.general === c); return `<tr><td>${cL(c.id)}</td><td>${age(c) ?? ''}</td><td>${c.skill ?? ''}</td><td>${c.rim || 0}</td><td>${gv ? `governs ${sL(gv.i)}` : fl ? 'fleet commander' : 'at the Wall'}</td><td>${c.nmFrom != null || c.exiledBy != null ? fN(c.nmFrom ?? c.exiledBy) : 'sworn young'}</td></tr>`; }).join('')}</table>` : '<p>The Council has no sitting members.</p>')
    + sec('Brothers of the Watch', `<p>${bros.length} sworn brother${bros.length !== 1 ? 's' : ''} serve the Watch${exiles.length ? `, ${exiles.length} of them sent to the rim in exile` : ''}. In ${rimB.length} recorded battle${rimB.length !== 1 ? 's' : ''} the Watch has won ${rimW}.${fromH.length ? ` Houses that gave the most men to the black: ${fromH.map(([h, n]) => `${fN(+h)} (${n})`).join(', ')}.` : ''}${backers.length ? ` Houses that answer its pleas: ${backers.map(fN).join(', ')}.` : ''}</p>${vets.length ? `<h3>Rim veterans</h3><p>${vets.map(c => `${cL(c.id)} (${c.rim})`).join(' · ')}</p>` : ''}`)
    + sec('Oathbreakers', breakers.length ? `<p>${breakers.slice(0, 20).map(c => `${cL(c.id)}${c.dead ? ' †' : F[c.f] ? ` — now with ${fN(c.f)}` : ''}`).join(' · ')}</p>` : '')
    + sec('Lords Commander elected', lcs.length ? actList(lcs, 20) : '');
}
// Every electing body of the galaxy: who sits on it, how it chooses, and every vote on record
const BODIES = [
  { f: 1, n: 'The Council of Five', d: 'Five proven brothers of the Nightfleet elect a Lord Commander for life from among themselves.', seats: () => S.nmCouncil },
  { f: 0, n: 'The Council of Masters', d: 'Thirteen Masters of the Nameless elect the Grandmaster. Houses vote in blocs through the monks they have seated, and a Grandmaster raised from a sanctioned house absolves it.', seats: () => S.council },
  { f: 16, n: 'The Wardens of the Gray Order', d: 'The wardens raise their ablest and most devout as Gray Grandmaster.' },
  { f: 5, n: 'The Partners of the Bloodbank', d: 'The partners choose a Consul, unless the bank has become a Blood Empire.' },
  { f: 14, n: 'The Council of Governors', d: 'The governors of the Free Planets elect a High King and may remove him by a vote of no confidence.', gov: true },
  { f: 8, n: 'The Senate of the Space Authority', d: 'The senatorial families elect a Chancellor every six years.', gov: true },
  { f: 2, n: 'The Pirate Moot', d: 'Any captain with blood and steel enough may challenge the Pirate Elect to single combat. The winner rules.', gov: true },
];
function councilPage() {
  const all = AW().filter(x => x.k === 'elect'), tn = AW().filter(x => x.k === 'tourney');
  const body = BODIES.filter(b => F[b.f]?.name).map(b => {
    const f = F[b.f], xs = all.filter(x => x.f === b.f);
    const seats = (b.seats?.() || []).map(id => CH[id]).filter(c => c && !c.dead);
    const govs = b.gov && f.alive ? systems.filter(s => s.owner === b.f && s.general && !s.general.dead && s.general !== f.ruler).map(s => s.general) : [];
    const mem = seats.length ? seats : govs;
    return `<h3>${b.n} — ${fN(b.f)}${f.alive ? '' : ' <small>(fallen)</small>'}</h3><p>${b.d}${f.ruler && f.alive ? ` Today: ${rt(b.f, f.ruler)} ${cL(f.ruler.id)}.` : ''}</p>${mem.length ? `<p><b>Members:</b> ${mem.slice(0, 15).map(c => `${cL(c.id)}${c.f !== b.f && F[c.f] ? ` <small>(${F[c.f].name})</small>` : ''}`).join(' · ')}</p>` : ''}${xs.length ? actList(xs, 8) : '<p><i>No vote recorded yet.</i></p>'}`;
  }).join('');
  const bribed = all.filter(x => x.bk != null);
  return box('Councils & elections', '', [['Electing bodies', BODIES.filter(b => F[b.f]?.alive).length], ['Elections recorded', all.length], ['Swayed by your gold', bribed.filter(x => x.bk === x.w).length || ''], ['Grand Tourneys', tn.length || '']]) +
    `<p>Not every throne passes by blood. These are the councils, senates and moots that choose their rulers, with every vote, challenge and tourney on record.</p>` +
    sec('Electing bodies', body) + sec('Grand Tourneys', actList(tn, 40)) + sec('All elections', actList(all) || '<p>No election has yet been recorded.</p>');
}
// ================= Tourneys & elections as pages (j:<act index>, l:<act index>) =================
const bribeList = bz => bz?.length ? `<ul>${bz.map(b => b.k === 'throw'
  ? `<li>${fN(b.f)} offered ${cL(b.c)} gold to shave points — ${b.ok ? (b.ex ? 'he took it, and was <b>exposed</b> and disgraced' : 'he took it and rode to lose') : (b.ex ? 'he refused and <b>denounced</b> them' : 'he refused')}</li>`
  : `<li>${fN(b.f)} paid for ${cL(b.c)}${b.ex ? ' — <b>exposed</b>, to their shame' : ''}${b.won ? ' — and he won' : ' — in vain'}</li>`).join('')}</ul>` : '<p>No gold is known to have changed hands.</p>';
const betList = bets => bets?.length ? `<table class="wkT"><tr><th>House</th><th>On</th><th>Stake</th><th>Odds</th><th>Result</th></tr>${bets.map(b => `<tr><td>${fN(b.f)}</td><td>${cL(b.c)}${b.k ? ` <small>${TEV[b.k]?.ic || ''} ${TEV[b.k]?.n || ''}</small>` : ''}</td><td>${b.amt}</td><td>×${b.odd}</td><td>${b.won ? `won ${b.pay}` : 'lost'}</td></tr>`).join('')}</table>` : '<p>No wagers were recorded.</p>';
const TEV = { joust: { n: 'Void-Skiff Joust', ic: '🛸' }, blade: { n: 'Starblade Circle', ic: '⚔' }, race: { n: 'Asteroid Ring Race', ic: '☄' }, gun: { n: 'Blaster Gallery', ic: '🎯' }, grav: { n: 'Grav-Pit Brawl', ic: '🥊' }, war: { n: 'Holo-Wargame', ic: '♟' } };
function tourneyPage(x) {
  const all = (x.all || [x.a, ...(x.rv || [])]).filter(id => CH[id]), place = x.s != null ? systems[x.s]?.name : 'the court';
  const ids = x.all || [x.a, ...(x.rv || [])];
  const evHurt = id => (x.ev || []).find(e => e.hurt === id), evBy = id => (x.ev || []).find(e => e.by === id);
  const rows = ids.map((id, i) => CH[id] ? `<tr><td>${i + 1}</td><td>${cL(id)}</td><td>${fN(x.af?.[i] ?? CH[id].f)}</td>${x.pts ? `<td>${x.pts[i] ?? ''}</td>` : ''}<td>${(x.ev || []).filter(e => e.w === id).map(e => TEV[e.k]?.ic || '').join('')}${evHurt(id) ? (evHurt(id).died ? ' ☠ slain' : ' 🩸 wounded') : id === x.hurt ? (x.died ? '☠ slain' : '🩸 wounded') : ''}${evBy(id) || id === x.by ? ' ⚔ struck the blow' : ''}${x.bz?.some(b => b.c === id) ? ' 💰' : ''}</td></tr>` : '').join('');
  const contests = (x.ev || []).map(e => { const t = TEV[e.k] || { n: e.k, ic: '' }; return `<li>${t.ic} <b>${t.n}</b> — won by ${CH[e.w] ? cL(e.w) : '?'}${e.r?.length > 1 ? `; then ${e.r.slice(1, 4).filter(id => CH[id]).map(cL).join(', ')}` : ''}${e.hurt != null && CH[e.hurt] ? `. ${cL(e.hurt)} ${e.died ? 'was killed' : 'was badly wounded'}${e.by != null && CH[e.by] ? ` by ${cL(e.by)}` : ''}${e.sl ? ', riding slack for a bribe' : ''}` : ''}.</li>`; }).join('');
  return box(`Grand Tourney of ${place} (Y${x.y})`, '', [['Year', `Y${x.y}`], ['Host', fN(x.h)], ['Place', x.s != null ? sL(x.s) : ''], x.hp ? ['Champion House', fN(x.hf)] : ['Champion', CH[x.a] ? cL(x.a) : ''], ['Riders', x.n || all.length], ['Bribes', x.bz?.length || ''], ['Blood', x.hurt != null ? (x.died ? 'a rider slain' : 'a rider wounded') : '']]) +
    `<p>The <b>Grand Tourney of ${place}</b> was held in Y${x.y} by ${fN(x.h)}. ${x.n || all.length} champions competed in ${x.ev?.length ? `${x.ev.length} contests (${x.ev.map(e => TEV[e.k]?.n || e.k).join(', ')})` : 'void-skiff jousts and blade bouts'}${x.hp ? '.' : `; ${CH[x.a] ? cL(x.a) : 'the victor'} of ${fN(x.f)} was crowned champion.`}${x.hurt != null && CH[x.hurt] ? ` ${cL(x.hurt)} ${x.died ? 'was killed in the lists' : 'was badly wounded'}${x.by != null && CH[x.by] ? ` by ${cL(x.by)}` : ''}.${x.sl ? ' He had taken gold to shave his points, and riding slack he left himself open to the blow.' : ''}` : ''}</p>` +
    (x.hp ? `<p><b>${fN(x.hf)}</b> was crowned <b>Champion House</b> with ${x.hp[0]?.[1]} points.</p>` : '') +
    (contests ? sec('The contests', `<ul>${contests}</ul>`) : '') +
    (x.hp ? sec('House standings', `<table class="wkT"><tr><th>#</th><th>House</th><th>Pts</th><th>Contests won</th></tr>${x.hp.map(([fid, p], i) => `<tr><td>${i + 1}</td><td>${fN(fid)}</td><td>${p}</td><td>${(x.ev || []).filter(e => (e.wf ?? CH[e.w]?.f) === fid).map(e => TEV[e.k]?.ic || '').join(' ')}</td></tr>`).join('')}</table>`) : '') +
    sec('Standings', `<table class="wkT"><tr><th>#</th><th>Champion</th><th>House</th>${x.pts ? '<th>Pts</th>' : ''}<th></th></tr>${rows}</table>`) + sec('The betting book', betList(x.bets)) + sec('Fixing the lists', bribeList(x.bz));
}
// ================= Hall of Records: superlatives drawn only from what actually happened =================
function reignSpans() {
  const out = [], rs = W().reigns;
  rs.forEach((r, i) => {
    const nx = rs.slice(i + 1).find(x => x.f === r.f), c = CH[r.c];
    const y1 = nx ? nx.y : (F[r.f]?.ruler === c && !c?.dead ? null : died(c || {}) ?? S.year);
    out.push({ ...r, y1, n: (y1 ?? S.year) - r.y });
  });
  return out;
}
function rTable(head, rows) { return rows.length ? `<table class="wkT"><tr><th>#</th>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map((r, i) => `<tr><td>${i + 1}</td>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table>` : ''; }
function recordsPage() {
  const chars = Object.values(CH).filter(c => c?.name), N = 10;
  const hOf = c => (F[c.f] ? fN(c.f) : '—');
  const reigns = reignSpans().filter(r => CH[r.c]).sort((a, b) => b.n - a.n).slice(0, N);
  const victors = chars.filter(c => (c.wins || 0) > 0).sort((a, b) => b.wins - a.wins).slice(0, N);
  const elders = chars.filter(c => c.dead && age(c) != null).sort((a, b) => age(b) - age(a)).slice(0, N);
  const fathers = chars.filter(c => (c.kids || []).length).sort((a, b) => b.kids.length - a.kids.length).slice(0, N);
  const bs = battles(), big = bs.filter(b => b.pa || b.pd).slice().sort((a, b) => (b.pa || 0) + (b.pd || 0) - (a.pa || 0) - (a.pd || 0)).slice(0, N);
  const upsets = bs.filter(b => !b.fled && b.pa && b.pd).map(b => ({ b, r: (b.w === 'a' ? b.pd / b.pa : b.pa / b.pd) })).filter(x => x.r > 1.25).sort((a, b) => b.r - a.r).slice(0, N);
  const wars = W().wars.slice().map(w => ({ w, n: (w.y1 ?? S.year) - w.y0, bn: warBattles(w).length })).sort((a, b) => b.n - a.n || b.bn - a.bn).slice(0, N);
  const fought = tally(bs.filter(b => b.at != null), b => b.at).slice(0, N);
  const fell = tally(bs.filter(b => b.k === 'land' && b.w === 'a' && b.at != null), b => b.at).slice(0, N);
  const acts = AW(), tw = {}, th = {};
  acts.filter(x => x.k === 'tourney').forEach(x => { (x.ev || []).forEach(e => { if (CH[e.w]) tw[e.w] = (tw[e.w] || 0) + 1; }); if (!x.ev && CH[x.a]) tw[x.a] = (tw[x.a] || 0) + 1; if (x.hf != null) th[x.hf] = (th[x.hf] || 0) + 1; });
  const duels = tally(acts.filter(x => x.k === 'duel' && !x.ref), x => { const w = x.ok ? x.a : x.t; return CH[w] ? w : null; }).slice(0, N);
  const killers = tally(acts.filter(x => x.k === 'kill' && x.ok), x => (CH[x.a] ? x.a : null)).slice(0, N);
  const blades = BW().map(r => ({ r, n: r.h.length })).filter(x => x.n > 1).sort((a, b) => b.n - a.n).slice(0, N);
  return `<p>The <b>Hall of Records</b> keeps the galaxy's superlatives, drawn from the archive as of Y${S.year}: the longest reigns, the greatest victors, the bloodiest fields.</p>` +
    sec('Longest reigns', rTable(['Ruler', 'House', 'Reign', 'Years'], reigns.map(r => [cL(r.c), fN(r.f), `Y${r.y}–${r.y1 ?? 'present'}`, r.n]))) +
    sec('Greatest victors', rTable(['Commander', 'House', 'Victories'], victors.map(c => [cL(c.id), hOf(c), c.wins]))) +
    sec('Largest battles', rTable(['Battle', 'Year', 'Strength', 'Victor'], big.map(b => [bL(b), `Y${b.y}`, Math.round((b.pa || 0) + (b.pd || 0)), fN(bWin(b))]))) +
    sec('Greatest upsets', rTable(['Battle', 'Year', 'Odds overcome', 'Victor'], upsets.map(x => [bL(x.b), `Y${x.b.y}`, `${x.r.toFixed(1)} : 1`, fN(bWin(x.b))]))) +
    sec('Longest wars', rTable(['War', 'Years', 'Battles', 'Outcome'], wars.map(x => [L('w:' + x.w.id, warTitle(x.w)), `${x.n}${x.w.y1 == null ? ' (ongoing)' : ''}`, x.bn, warOutcome(x.w).t]))) +
    sec('Most contested worlds', rTable(['World', 'Battles fought', 'Times taken by storm'], fought.map(([s, n]) => [sL(+s), n, fell.find(f => f[0] === s)?.[1] || '']))) +
    sec('Longest lives', rTable(['Name', 'House', 'Died', 'Age'], elders.map(c => [cL(c.id), hOf(c), `Y${died(c)}`, age(c)]))) +
    sec('Most children', rTable(['Name', 'House', 'Children'], fathers.map(c => [cL(c.id), hOf(c), c.kids.length]))) +
    sec('Tourney champions', rTable(['Champion', 'House', 'Contests won'], Object.entries(tw).sort((a, b) => b[1] - a[1]).slice(0, N).map(([id, n]) => [cL(id), hOf(CH[id]), n])) + (Object.keys(th).length ? `<p>Champion Houses: ${Object.entries(th).sort((a, b) => b[1] - a[1]).map(([f, n]) => `${fN(+f)} (${n}×)`).join(', ')}.</p>` : '')) +
    sec('Duellists', rTable(['Name', 'House', 'Duels won'], duels.map(([id, n]) => [cL(id), hOf(CH[id]), n]))) +
    sec('Deadliest hunters', rTable(['Name', 'House', 'Kills'], killers.map(([id, n]) => [cL(id), hOf(CH[id]), n]))) +
    sec('Most-travelled Starblades', rTable(['Blade', 'Bearers', 'Now'], blades.map(x => [aL(x.r.id), x.n, bladeHolder(x.r) ? cL(bladeHolder(x.r).id) : x.r.vault != null ? `vault of ${sL(x.r.vault)}` : 'lost'])));
}
// ================= Tourney index =================
function tourneysIndex() {
  const ts = AW().map((x, i) => [x, i]).filter(([x]) => x.k === 'tourney');
  if (!ts.length) return '<p>No Grand Tourney has yet been held.</p>';
  return `<p>${ts.length} Grand Tourney${ts.length > 1 ? 's have' : ' has'} been held.</p><ul>${ts.slice().reverse().map(([x, i]) => `<li><b>Y${x.y}</b> — ${L('j:' + i, `Grand Tourney of ${x.s != null ? systems[x.s]?.name : 'the court'}`)} · host ${fN(x.h)} · ${x.hf != null ? `Champion House ${fN(x.hf)}` : CH[x.a] ? `champion ${cL(x.a)}` : ''}${x.died ? ' · ☠ a rider slain' : ''}${x.bz?.length ? ` · 💰 ${x.bz.length} bribe${x.bz.length > 1 ? 's' : ''}` : ''}</li>`).join('')}</ul>`;
}
function electPage(x) {
  const cs = [x.w, ...(x.c || [])].filter(id => CH[id]), hh = new Map(x.hh || []);
  return box(`${x.title} (Y${x.y})`, '', [['Year', `Y${x.y}`], ['House', fN(x.f)], ['Chosen', CH[x.w] ? cL(x.w) : ''], ['Candidates', cs.length], ['Bribes', x.bz?.length || (x.bk != null ? 1 : '')]]) +
    `<p>In Y${x.y} the electors of ${fN(x.f)} held the <b>${x.title}</b>. ${CH[x.w] ? cL(x.w) : 'A ruler'} was chosen${x.txt ? `, ${x.txt}` : ''}.</p>` +
    sec('Candidates', `<ul>${cs.map(id => `<li>${cL(id)}${id === x.w ? ' — <b>chosen</b>' : ''}${hh.get(id) ? ` <small>(hated by the electors' lords, −${hh.get(id)})</small>` : ''}</li>`).join('')}</ul>`) +
    sec('Bribes to the electors', bribeList(x.bz || (x.bk != null ? [{ f: P, c: x.bk, ex: x.ex, won: x.bk === x.w }] : [])));
}
// ================= Blood feuds: nemeses followed across generations (written by main.js into S.wiki.feuds) =================
const FDW = () => (W().feuds ??= []);
const END = { spared: 'ended in mercy', avenged: 'ended in blood', outlived: 'ended when one side outlived the other', died: 'died with its last bearer' };
const feudName = fd => { const a = CH[fd.a], b = CH[fd.b]; return `The feud of ${a ? a.name.split(' ')[0] : '?'} and ${b ? b.name.split(' ')[0] : '?'}${fd.gen > 1 ? ` (${fd.gen} generations)` : ''}`; };
const eL = fd => L('e:' + fd.id, feudName(fd));
const feudLine = fd => `<li>${eL(fd)} · ${fN(fd.fa)} vs ${fN(fd.fb)} · Y${fd.y0}–${fd.y1 ?? 'present'} · <i>${fd.y1 == null ? 'burning' : END[fd.end] || 'ended'}</i></li>`;
function feudPage(fd) {
  const who = fd.who.map(id => CH[id]).filter(Boolean), sideA = who.filter(c => c.f === fd.fa), sideB = who.filter(c => !sideA.includes(c));
  const lead = `<p><b>${feudName(fd)}</b> is a blood feud between ${cL(fd.a)} of ${fN(fd.fa)} and ${cL(fd.b)} of ${fN(fd.fb)}. It began in Y${fd.y0}${fd.y1 != null ? ` and ${END[fd.end] || 'ended'} in Y${fd.y1}` : ' and burns still'}. ${fd.gen > 1 ? `It outlived the men who began it: over ${fd.gen} generations, ${who.length} lives were drawn into it.` : `${who.length} lives were drawn into it.`}</p>`;
  return box(feudName(fd), '', [['Began', `Y${fd.y0}`], ['Ended', fd.y1 != null ? `Y${fd.y1} (${END[fd.end] || fd.end})` : ''], ['Status', fd.y1 == null ? 'Burning' : 'Ended'], ['Generations', fd.gen], ['Houses', `${fN(fd.fa)}<br>${fN(fd.fb)}`]]) + lead +
    sec('The story', `<ol class="wkOl">${fd.ev.map(e => `<li><b>Y${e.y}</b> — ${link(e.t, e.y)}</li>`).join('')}</ol>`) +
    sec('Those drawn in', `<p>${sideA.map(c => `${cL(c.id)}${c.dead ? ' †' : ''}`).join(' · ')}${sideB.length ? `<br><i>against</i><br>${sideB.map(c => `${cL(c.id)}${c.dead ? ' †' : ''}`).join(' · ')}` : ''}</p>`);
}
function feudsIndex() {
  const all = FDW(), open = all.filter(x => x.y1 == null), long = [...all].sort((a, b) => b.gen - a.gen || ((b.y1 ?? S.year) - b.y0) - ((a.y1 ?? S.year) - a.y0)).slice(0, 10);
  return box('Blood feuds', '', [['Recorded', all.length], ['Burning', open.length], ['Ended in mercy', all.filter(x => x.end === 'spared').length || ''], ['Ended in blood', all.filter(x => x.end === 'avenged').length || '']]) +
    `<p>When a man names a nemesis, the archive opens a feud. Feuds pass to sons, brothers and widows, turn on the sons of the dead, and end in vengeance, mercy or the grave.</p>` +
    sec('Burning feuds', open.length ? `<ul>${open.slice(-60).reverse().map(feudLine).join('')}</ul>` : '<p>No feud burns today.</p>') +
    sec('The longest feuds', long.length ? `<ul>${long.map(feudLine).join('')}</ul>` : '') + sec('Ended feuds', `<ul>${all.filter(x => x.y1 != null).slice(-60).reverse().map(feudLine).join('')}</ul>`);
}
// ================= Vassalage: every oath of fealty, its tribute and how it ended (S.wiki.vass) =================
const VW = () => (W().vass ??= []);
const VEND = { broke: 'oath broken by the vassal', released: 'released by the liege', renounced: 'renounced', fell: 'a house fell', passed: 'passed to a greater overlord', war: 'ended in war', absorbed: 'absorbed' };
const openV = v => VW().find(x => x.v === v && x.y1 == null);
// main.js calls: 'sworn' (why), 'pay' (amount), 'end' (end key, why)
export function wikiVassal(ev, v, l, a, why) {
  if (ev === 'sworn') { const o = openV(v); if (o) { o.y1 = S.year; o.end = 'passed'; } VW().push({ id: VW().length, v, l, y0: S.year, why: why || '', paid: 0, rv: F[v]?.ruler?.id ?? null, rl: F[l]?.ruler?.id ?? null }); }
  else if (ev === 'pay') { const o = openV(v); if (o) o.paid += a || 0; }
  else if (ev === 'end') { const o = openV(v); if (o) { o.y1 = S.year; o.end = a || 'released'; if (why) o.ew = why; } }
}
function vassSync() {
  for (const k of Object.keys(S.vassal || {})) { const v = +k, l = S.vassal[k], o = openV(v); if (!o || o.l !== l) { if (o) { o.y1 = S.year; o.end = 'passed'; } VW().push({ id: VW().length, v, l, y0: null, why: 'sworn before the archive kept such records', paid: 0 }); } }
  for (const o of VW()) if (o.y1 == null && S.vassal?.[o.v] !== o.l) { o.y1 = S.year; o.end = F[o.v]?.alive && F[o.l]?.alive ? 'released' : 'fell'; }
}
const vLine = o => `<li>${fL(o.v)} → ${fL(o.l)} · ${o.y0 != null ? 'Y' + o.y0 : 'before records'}–${o.y1 ?? 'present'}${o.paid ? ` · ${Math.round(o.paid)} credits tribute` : ''}${o.why ? ` · <small>${html(o.why)}</small>` : ''}${o.y1 != null ? ` · <i>${VEND[o.end] || o.end}${o.ew ? ': ' + html(o.ew) : ''}</i>` : ''}</li>`;
function vassSec(f) {
  vassSync();
  const mine = VW().filter(o => o.v === f.id || o.l === f.id); if (!mine.length) return '';
  const lg = S.vassal?.[f.id], vs = VW().filter(o => o.l === f.id && o.y1 == null);
  return sec('Vassalage', `${lg != null && F[lg] ? `<p><b>Liege:</b> ${fL(lg)}</p>` : ''}${vs.length ? `<p><b>Vassals:</b> ${vs.map(o => fL(o.v)).join(' · ')}</p>` : ''}<ul>${[...mine].reverse().slice(0, 20).map(vLine).join('')}</ul>`);
}
function vassPage() {
  vassSync();
  const all = VW(), open = all.filter(o => o.y1 == null), lieges = [...new Set(open.map(o => o.l))];
  const tree = lieges.filter(l => S.vassal?.[l] == null).map(l => `<li>${fL(l)}<ul>${open.filter(o => o.l === l).map(o => `<li>${fL(o.v)} <small>since ${o.y0 != null ? 'Y' + o.y0 : 'old times'} · ${Math.round(o.paid)} credits paid</small></li>`).join('')}</ul></li>`).join('');
  const total = all.reduce((t, o) => t + (o.paid || 0), 0);
  return box('Vassalage', '', [['Oaths in force', open.length], ['Oaths recorded', all.length], ['Broken by vassals', all.filter(o => o.end === 'broke').length || ''], ['Tribute paid', Math.round(total) + ' credits']]) +
    `<p>Weaker houses kneel to stronger ones for protection. A vassal is allied to its liege, pays a yearly tribute and is called into the liege's wars. The liege must defend it. Oaths end when a vassal outgrows its master, is released, or a house falls.</p>` +
    sec('Lieges and their vassals', tree ? `<ul>${tree}</ul>` : '<p>No oath of fealty binds any house today.</p>') +
    sec('All oaths', all.length ? `<ul>${[...all].reverse().slice(0, 80).map(vLine).join('')}</ul>` : '');
}
// ================= Index & UI =================
function index() {
  const out = [], bt = bTitles();
  F.forEach(f => f?.name && out.push({ k: 'f:' + f.id, t: f.name, cat: 'House', sub: f.alive ? 'Active' : 'Fallen' }));
  systems.forEach(s => out.push({ k: 's:' + s.i, t: s.name, cat: 'World', sub: F[s.owner]?.name || 'Independent' }));
  W().wars.forEach(w => out.push({ k: 'w:' + w.id, t: warTitle(w), cat: 'War', sub: `Y${w.y0}–${w.y1 ?? 'present'}` }));
  battles().forEach((b, i) => out.push({ k: 'b:' + b.id, t: bt[i], cat: 'Battle', sub: 'Y' + b.y }));
  Object.values(CH).forEach(c => c?.name && out.push({ k: 'c:' + c.id, t: dn(c), cat: c.role && !/Princess/.test(c.role) ? 'Agent' : 'Person', sub: (c.dead ? '🪦 ' : '') + `Y${born(c)}–${c.dead ? 'Y' + died(c) : 'living'} · ` + (c.role ? RN(c.role) + ' · ' : '') + (F[c.f]?.name || 'Unaligned') }));
  const caps = new Set(); battles().forEach(b => [b.ca, b.cd].forEach(n => n && caps.add(n)));
  caps.forEach(n => out.push({ k: 'k:' + n, t: n, cat: 'Captain', sub: 'Fleet captain' }));
  BW().forEach(r => { const c = bladeHolder(r); out.push({ k: 'a:' + r.id, t: r.nm, cat: 'Starblade', sub: c ? `borne by ${dn(c)}` : r.vault != null ? `in the vault of ${systems[r.vault]?.name}` : r.end ? `${r.end.t} Y${r.end.y}` : 'Starblade' }); });
  GWW().forEach(r => out.push({ k: 'g:' + r.id, t: `${r.n} of ${r.sn}`, cat: 'Great Work', sub: `${SUPERS.includes(r.n) ? 'Superweapon · ' : ''}Y${r.y0} · ${r.end ? WEND[r.end] : 'building'}` }));
  out.push({ k: 't:', t: '🕰 Timeline of the galaxy', cat: 'Timeline', sub: 'all decades' });
  out.push({ k: 'o:', t: '🗡 Assassinations', cat: 'Assassination', sub: `${AW().filter(x => x.k === 'kill').length} attempts` });
  out.push({ k: 'm:', t: '⚭ Marriages', cat: 'Marriage', sub: `${AW().filter(x => x.k === 'wed').length} weddings` });
  out.push({ k: 'r:', t: '💰 Trade & hyperways', cat: 'Trade', sub: 'traders, posts, hyperways' });
  out.push({ k: 'p:', t: '🕊 Diplomacy', cat: 'Diplomacy', sub: 'envoys, alliances, embassies' });
  out.push({ k: 'n:', t: '🎯 Blood feuds', cat: 'Feud', sub: `${FDW().filter(x => x.y1 == null).length} burning · ${FDW().length} recorded` });
  FDW().forEach(fd => out.push({ k: 'e:' + fd.id, t: feudName(fd), cat: 'Feud', sub: `Y${fd.y0}–${fd.y1 ?? 'present'} · ${F[fd.fa]?.name || '?'} vs ${F[fd.fb]?.name || '?'}` }));
  out.push({ k: 'v:', t: '🙇 Vassalage', cat: 'Vassalage', sub: `${VW().filter(o => o.y1 == null).length} oaths in force · ${VW().length} recorded` });
  out.push({ k: 'z:', t: '🏆 Hall of Records', cat: 'Records', sub: 'longest reigns, greatest victors, bloodiest fields' });
  out.push({ k: 'u:', t: '🏟 Grand Tourneys', cat: 'Records', sub: `${AW().filter(x => x.k === 'tourney').length} held` });
  out.push({ k: 'q:', t: '🏛 Councils & elections', cat: 'Council', sub: `${AW().filter(x => x.k === 'elect').length} votes · Council of Five, Masters, Senate, Moot` });
  AW().forEach((x, i) => {
    if (x.k === 'tourney') out.push({ k: 'j:' + i, t: `Grand Tourney of ${x.s != null ? systems[x.s]?.name : 'the court'} (Y${x.y})`, cat: 'Council', sub: `champion ${CH[x.a]?.name || '?'}${x.bz?.length ? ` · ${x.bz.length} bribes` : ''}` });
    else if (x.k === 'elect') out.push({ k: 'l:' + i, t: `${x.title} (Y${x.y})`, cat: 'Council', sub: `${F[x.f]?.name || ''} · ${CH[x.w]?.name || '?'} chosen${x.bz?.length ? ` · ${x.bz.length} bribes` : ''}` });
  });
  decades().forEach(d => out.push({ k: 'd:' + d, t: `The Y${d}s`, cat: 'Timeline', sub: `${evs().filter(e => e.y >= d && e.y < d + 10).length} events` }));
  F.forEach(f => f?.name && out.push({ k: 'h:' + f.id, t: `Family tree of ${f.name}`, cat: 'Family Tree', sub: f.alive ? 'Active house' : 'Fallen house' }));
  Object.values(CH).forEach(c => c?.name && ((c.kids || []).length || c.father) && out.push({ k: 'y:' + c.id, t: `Family of ${dn(c)}`, cat: 'Family Tree', sub: F[c.f]?.name || 'Unaligned' }));
  SWW().forEach(x => out.push({ k: 'x:' + x.i, t: `${x.w} strike on ${x.tn}`, cat: 'Great Work', sub: `Superweapon strike · Y${x.y}` }));
  return out;
}
function page(k) {
  const [t, id] = [k[0], k.slice(2)];
  if (t === 'c' && CH[id]) return charPage(CH[id]);
  if (t === 'f' && F[id]) return factionPage(F[id]);
  if (t === 's' && systems[id]) return planetPage(systems[id]);
  if (t === 'w') { const w = W().wars.find(x => x.id === +id); if (w) return warPage(w); }
  if (t === 'b' && bById(id)) return battlePage(bById(id));
  if (t === 'k') return captainPage(id);
  if (t === 'a') { const r = bladeRec(+id); if (r) return bladePage(r); }
  if (t === 'g') { const r = GWW().find(x => x.id === +id); if (r) return workPage(r); }
  if (t === 'x' && SWW()[id]) return strikePage(SWW()[id]);
  if (t === 'o') return killPage();
  if (t === 'm') return wedPage();
  if (t === 'r') return tradePage();
  if (t === 'p') return dipPage();
  if (t === 'q') return councilPage();
  if (t === 'j' && AW()[id]?.k === 'tourney') return tourneyPage(AW()[id]);
  if (t === 'l' && AW()[id]?.k === 'elect') return electPage(AW()[id]);
  if (t === 'v') return vassPage();
  if (t === 'z') return recordsPage();
  if (t === 'u') return tourneysIndex();
  if (t === 'n') return feudsIndex();
  if (t === 'e') { const fd = FDW().find(x => x.id === +id); if (fd) return feudPage(fd); }
  if (t === 'y' && CH[id]) return treePage(CH[id]);
  if (t === 'h' && F[id]) return houseTree(F[id]);
  if (t === 't') return timelinePage();
  if (t === 'd') return decadePage(+id);
  return '<p>The archive holds no such record.</p>';
}
function home() {
  const wars = W().wars, bs = battles(), open = wars.filter(w => w.y1 == null);
  const recentB = bs.slice(-8).reverse(), f = F[P];
  return `<p><i>Compiled from ${archive()}${f?.ruler ? ` in the reign of ${rt(f.id, f.ruler)} ${cL(f.ruler.id)}` : ''}, Year ${S.year}.</i></p>
  <p>${L('q:', '🏛 Councils & elections')} · ${L('z:', '🏆 Hall of Records')} · ${L('u:', '🏟 Grand Tourneys')} · ${F[1]?.name ? L('f:1', '🧭 The Nightfleet and the Watch at the rim') : ''}</p>
  ${(() => { const pool = Object.values(CH).filter(c => c?.name && (c.hist?.length || 0) >= 8 && !c.undying).sort((a, b) => a.id - b.id); if (!pool.length) return ''; const c = pool[(S.year * 7 + S.turn) % pool.length], ds = (c.hist || []).slice(-4).map(h => link(strip(h).replace(/^Y\d+:\s*/, '').replace(/\.$/, ''), yearOf(h), 'c:' + c.id)); return sec('Featured life', `<div style="overflow:hidden">${portrait ? `<div style="float:left;margin:0 10px 6px 0">${portrait(c, 64)}</div>` : ''}<p><b>${cL(c.id)}</b>${F[c.f] ? ` of ${fN(c.f)}` : ''} (Y${born(c)}–${c.dead ? 'Y' + died(c) : 'living'})${title(c) ? `, ${title(c)}` : ''}. ${(c.wins ? `Victor of ${c.wins} battle${c.wins > 1 ? 's' : ''}. ` : '')}Lately ${He(c).toLowerCase()} ${ds.join('; ')}.</p><p><small>${L('c:' + c.id, 'Read the full life →')}</small></p></div>`); })()}
  <p>The archive holds ${Object.keys(CH).length} lives, ${F.filter(x => x?.name).length} houses, ${systems.length} worlds, ${wars.length} wars and ${bs.length} battles.</p>
  <p>${L('t:', '🕰 Open the Timeline of the galaxy')} — the great events, decade by decade.</p>
  ${sec('Wars now raging', open.length ? `<ul>${open.map(w => `<li>${L('w:' + w.id, warTitle(w))} — since Y${w.y0}</li>`).join('')}</ul>` : '<p>The galaxy is, for now, at peace.</p>')}
  ${sec('Latest battles', recentB.length ? `<ul>${recentB.map(b => bLine(b)).join('')}</ul>` : '')}
  ${sec('Great powers', `<table class="wkBox" style="float:none;width:100%;max-width:100%;margin:6px 0"><tr><th>#</th><th>House</th><th>Worlds</th><th>Ruler</th><th>Wars</th></tr>${F.filter(x => x?.alive && x.name).sort((a, b) => nW(b.id) - nW(a.id)).map((x, i) => `<tr><td>${i + 1}</td><td>${fL(x.id)}</td><td>${nW(x.id)}</td><td>${x.ruler && !x.ruler.dead ? cL(x.ruler.id) : '—'}</td><td>${F.filter(y => y?.alive && y.id !== x.id && S.war?.has?.(wkey(x.id, y.id))).length || ''}</td></tr>`).join('')}</table>`)}
  ${(() => { const ns = F.filter(x => x?.origin && x.origin.y != null).sort((a, b) => b.origin.y - a.origin.y).slice(0, 10); return sec('New powers', ns.length ? `<ul>${ns.map(x => `<li>${OIC[x.origin.kind] || '⚑'} ${fL(x.id)} — Y${x.origin.y}${x.origin.from != null && F[x.origin.from] ? `, from ${fN(x.origin.from)}` : ''}${x.alive ? '' : ' <small>(fallen)</small>'}</li>`).join('')}</ul>` : ''); })()}
  ${(() => { const d = Object.values(CH).filter(c => c?.dead && c.deathY != null && c.deathY >= S.year - 3 && (title(c) || c.skill >= 7 || (c.hist?.length || 0) > 6)).sort((a, b) => b.deathY - a.deathY).slice(0, 12); return sec('Recently fallen', d.length ? `<ul>${d.map(c => `<li>${cL(c.id)}${F[c.f] ? ` of ${fN(c.f)}` : ''} — died Y${c.deathY}${age(c) ? `, aged ${age(c)}` : ''}</li>`).join('')}</ul>` : ''); })()}
  ${(() => { const live = BW().filter(r => bladeHolder(r)); return sec('Starblades', BW().length ? `<p>${BW().length} Starblades are recorded; ${live.length} are borne today: ${live.slice(0, 20).map(r => `${aL(r.id)} (${cL(bladeHolder(r).id)})`).join(', ')}${live.length > 20 ? '…' : ''}.</p>` : ''); })()}
  ${sec('Superweapon strikes', SWW().length ? `<ul>${SWW().slice(-8).reverse().map(strikeLine).join('')}</ul>` : '')}`;
}
function css() {
  if (document.getElementById('wkCss')) return;
  const st = document.createElement('style'); st.id = 'wkCss';
  st.textContent = `#wiki{position:fixed;inset:0;z-index:9000;background:#05070df2;display:flex;flex-direction:column;color:#dfe8f5;font:14px/1.6 Georgia,serif}
#wiki .wkTop{display:flex;gap:6px;padding:8px;border-bottom:1px solid #fff2;align-items:center;flex-wrap:wrap}
#wiki .wkTop b{font-family:Orbitron,sans-serif;letter-spacing:2px;color:#fff4d0}
#wiki input{flex:1;min-width:140px;padding:8px;background:#0c1220;border:1px solid #4a6a90;color:#fff;font:inherit;border-radius:4px}
#wiki button{padding:7px 12px;background:#14203a;border:1px solid #4a6a90;color:#cfe8ff;border-radius:4px;cursor:pointer}
#wiki .wkCats button.on{background:#2a4a7a}
#wiki .wkBody{flex:1;overflow:auto;padding:12px 16px;max-width:980px;width:100%;margin:0 auto;box-sizing:border-box}
#wiki h1{font-weight:normal;border-bottom:1px solid #fff3;margin:4px 0 8px}#wiki h2{font-weight:normal;border-bottom:1px solid #fff2;margin:16px 0 6px;font-size:19px}#wiki h3{font-size:15px;margin:10px 0 2px;color:#fff4d0}
#wiki p{margin:6px 0}#wiki .wkNav{text-align:center;margin-top:14px;opacity:.9}
#wiki .wkL{color:#8cc8ff;cursor:pointer;text-decoration:none}#wiki .wkL:hover{text-decoration:underline}
#wiki .wkBox{float:right;margin:0 0 10px 14px;width:280px;max-width:46%;background:#0c1322;border:1px solid #fff2;font-size:12px;border-collapse:collapse}
#wiki .wkBox th,#wiki .wkBox td{padding:3px 6px;text-align:left;vertical-align:top;border-top:1px solid #fff1}#wiki .wkBT{text-align:center!important;background:#1b2a48;font-size:14px}#wiki .wkBS{text-align:center!important;background:#142038;font-size:11px;letter-spacing:1px;text-transform:uppercase}
#wiki .wkRes{padding:6px 2px;border-bottom:1px solid #fff1}#wiki .wkRes small{opacity:.6;margin-left:6px}
#wiki .wkOl{padding-left:0;list-style:none}
#wiki .wkToc{display:inline-block;background:#0c1322;border:1px solid #fff2;padding:6px 12px;margin:8px 0;font-size:13px}#wiki .wkToc ol{margin:4px 0 0;padding-left:20px}
#wiki .wkCats.shut{display:none}#wiki .wkTog.on{background:#2a4a7a}
#wiki .wkCats{max-height:40vh;overflow:auto}
#wiki .wkTn{display:inline-block;padding:3px 7px;margin:2px;background:#0c1322;border:1px solid #4a6a90;border-radius:4px;font-size:13px;line-height:1.3;vertical-align:top}#wiki .wkTn.dead{opacity:.6}#wiki .wkTn.me{border-color:#ffd56a;box-shadow:0 0 6px #ffd56a88}#wiki .wkTx{opacity:.4;font-style:italic}
#wiki .wkTrow{display:flex;flex-wrap:wrap;gap:2px}
#wiki .wkT{border-collapse:collapse;margin:6px 0;font-size:13px;max-width:100%}#wiki .wkT th,#wiki .wkT td{padding:3px 8px;border-bottom:1px solid #fff1;text-align:left;vertical-align:top}#wiki .wkT th{background:#142038;font-weight:normal;font-size:12px}#wiki .wkT tr:nth-child(even) td{background:#ffffff06}
#wiki .wkTree,#wiki .wkTree ul{list-style:none;padding-left:18px;margin:0}#wiki .wkTree{padding-left:0;overflow-x:auto}
#wiki .wkTree li{position:relative;padding:3px 0 3px 12px;border-left:1px solid #4a6a9088;white-space:nowrap}#wiki .wkTree li::before{content:'';position:absolute;left:0;top:16px;width:10px;border-top:1px solid #4a6a9088}#wiki .wkTree li:last-child{border-left-color:transparent}#wiki .wkTree li:last-child::after{content:'';position:absolute;left:0;top:0;height:16px;border-left:1px solid #4a6a9088}
body.desk #wiki{inset:auto;left:8vw;top:6vh;width:84vw;height:86vh;min-width:420px;min-height:300px;resize:both;overflow:hidden;border:1px solid #4a6a90;border-radius:6px;box-shadow:0 8px 40px #000c}
body.desk #wiki .wkTop:first-child{cursor:move}
@media(max-width:600px){#wiki .wkBox{float:none;width:100%;max-width:100%;margin:0 0 10px}}`;
  document.head.appendChild(st);
}
export function showWiki() {
  return new Promise(res => {
    css(); try { prep(); } catch (e) {} wikiSync(); _bt = null; _wt = null; LX = null; _ev = null; _ds = null;
    const el = document.createElement('div'); el.id = 'wiki';
    const CATS = ['All', 'Timeline', 'Person', 'Agent', 'Captain', 'House', 'World', 'War', 'Battle', 'Assassination', 'Marriage', 'Trade', 'Diplomacy', 'Vassalage', 'Council', 'Feud', 'Family Tree', 'Starblade', 'Great Work', 'Records'];
    const DIRECT = { Assassination: 'o:', Marriage: 'm:', Trade: 'r:', Diplomacy: 'p:', Vassalage: 'v:', Council: 'q:', Feud: 'n:', Records: 'z:' };
    el.innerHTML = `<div class="wkTop"><b>📚 ARCHIVE</b><button data-a="back">◀</button><button data-a="home">⌂</button><button data-a="tabs" class="wkTog">☰ Tabs</button><button data-a="rand" title="Random record">🎲</button><input placeholder="Search people, houses, worlds, wars, battles…"><button data-a="close">✕ Close</button></div><div class="wkTop wkCats${localStorage.getItem('sb_wkTabs') === '1' ? '' : ' shut'}">${CATS.map((c, i) => `<button data-cat="${c}" class="${i ? '' : 'on'}">${c}</button>`).join('')}</div><div class="wkBody"></div>`;
    document.body.appendChild(el);
    const body = el.querySelector('.wkBody'), inp = el.querySelector('input'), idx = index(), hist = [];
    let cat = 'All';
    const cats = el.querySelector('.wkCats'), tog = el.querySelector('.wkTog');
    const setTabs = open => { cats.classList.toggle('shut', !open); tog.classList.toggle('on', open); tog.textContent = `☰ Tabs${cat !== 'All' ? ': ' + cat : ''} ${open ? '▴' : '▾'}`; try { localStorage.setItem('sb_wkTabs', open ? '1' : '0'); } catch (e) {} };
    setTabs(!cats.classList.contains('shut'));
    // PC: drag the window by its top bar (resize via the corner handle)
    const top = el.querySelector('.wkTop');
    top.addEventListener('mousedown', e => {
      if (!document.body.classList.contains('desk') || e.button !== 0 || e.target.closest('button,input')) return;
      e.preventDefault(); e.stopPropagation();
      const r = el.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
      const mv = m => { el.style.left = Math.max(0, Math.min(innerWidth - 120, m.clientX - ox)) + 'px'; el.style.top = Math.max(0, Math.min(innerHeight - 40, m.clientY - oy)) + 'px'; };
      const up = () => { removeEventListener('mousemove', mv, true); removeEventListener('mouseup', up, true); };
      addEventListener('mousemove', mv, true); addEventListener('mouseup', up, true);
    });
    // PC: wheel always scrolls the archive, never the map behind it
    el.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
    const showHome = () => { body.innerHTML = `<h1>The Galactic Archive</h1>${home()}`; body.scrollTop = 0; };
    const list = () => {
      const q = inp.value.trim().toLowerCase();
      if (!q && cat === 'All') return showHome();
      if (!q && cat === 'Timeline') return open('t:', false);
      if (!q && DIRECT[cat]) return open(DIRECT[cat], false);
      const r = idx.filter(e => (cat === 'All' || e.cat === cat) && (!q || e.t.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q)));
      // Best matches first: exact title, then title starting with the query, then any word starting with it, then title hits, then the rest
      if (q) { const rank = e => { const t = strip(e.t).toLowerCase(); return t === q ? 0 : t.startsWith(q) ? 1 : t.split(/\s+/).some(w => w.startsWith(q)) ? 2 : t.includes(q) ? 3 : 4; }; r.sort((a, b) => rank(a) - rank(b)); }
      body.innerHTML = `<h1>${q ? `Results for “${inp.value}”` : cat}</h1><small>${r.length} record${r.length !== 1 ? 's' : ''}</small>` +
        r.slice(0, 150).map(e => `<div class="wkRes">${L(e.k, e.t)}<small>${e.cat} · ${e.sub}</small></div>`).join('') + (r.length > 150 ? '<p><small>Refine your search to see more.</small></p>' : '');
    };
    const open = (k, push = true) => {
      const e = idx.find(x => x.k === k);
      if (push) hist.push(k);
      body.innerHTML = `<h1>${e?.t || 'Record'}</h1><small style="opacity:.6">From ${archive()} · ${e?.cat || ''}</small><div style="margin-top:8px">${(() => { try { return page(k); } catch (err) { console.error('Wiki page', k, err); return `<p><i>This record is damaged and cannot be read (${html(String(err?.message || err))}).</i></p>`; } })()}</div><div style="clear:both"></div>`;
      // Contents box for long pages
      const hs = [...body.querySelectorAll('h2')];
      if (hs.length >= 4) {
        hs.forEach((h, i) => { h.dataset.toc = i; });
        const toc = document.createElement('div'); toc.className = 'wkToc';
        toc.innerHTML = `<b>Contents</b><ol>${hs.map((h, i) => `<li><a class="wkL" data-tocgo="${i}">${h.textContent}</a></li>`).join('')}</ol>`;
        hs[0].before(toc);
      }
      body.scrollTop = 0;
    };
    const close = () => { document.removeEventListener('keydown', kd, true); el.remove(); res(); };
    const kd = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
    document.addEventListener('keydown', kd, true);
    inp.oninput = () => { hist.length = 0; list(); };
    el.onclick = e => {
      const l = e.target.closest('[data-wk]'); if (l) { open(l.dataset.wk); return; }
      const tg = e.target.closest('[data-tocgo]'); if (tg) { body.querySelector(`h2[data-toc="${tg.dataset.tocgo}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (e.target.closest('[data-a="rand"]')) { const pool = idx.filter(x => ['Person', 'House', 'War', 'Battle', 'Starblade', 'World'].includes(x.cat)); if (pool.length) open(pool[Math.floor(Math.random() * pool.length)].k); return; }
      const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; el.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('on', b === c)); hist.length = 0; list(); if (!document.body.classList.contains('desk')) setTabs(false); else setTabs(true); return; }
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'tabs') setTabs(cats.classList.contains('shut'));
      if (a === 'close') close();
      if (a === 'home') { hist.length = 0; inp.value = ''; cat = 'All'; el.querySelectorAll('[data-cat]').forEach((b, i) => b.classList.toggle('on', !i)); setTabs(!cats.classList.contains('shut')); showHome(); }
      if (a === 'back') { hist.pop(); if (hist.length) open(hist[hist.length - 1], false); else list(); }
    };
    list();
  });
}
