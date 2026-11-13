// ---- Save system (module split stage 7): slots, field-driven encoding, snapshot, load ----
// main.js-owned helpers (world building, logging) are injected once via initSave(hooks).
import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { S, F, CH, systems, units, ID, P, setP } from './state.js';

let H = {}; // { addSystem, link, addUnit, stripRank, applyResNames, log, humans, FDEF }
export function initSave(hooks) { H = hooks; }

export const SAVE = 'starblades_save';
// 'auto' (yearly autosave) + 6 manual slots, with a metadata index
export const SLOTS = ['auto', 1, 2, 3, 4, 5, 6];
export const slotKey = n => (n === 'auto' ? SAVE : `${SAVE}_${n}`);
export function saveIndex() { try { return JSON.parse(localStorage.getItem(SAVE + '_idx')) || {}; } catch { return {}; } }
export function slotMeta(n) {
  const m = saveIndex()[n];
  if (m) return m;
  if (n === 'auto' && localStorage.getItem(SAVE)) return { fac: 'Autosave', year: '?', turn: '?', t: 0, col: '#2a7fd4', legacy: true };
  return null;
}
export function deleteSlot(n) { localStorage.removeItem(slotKey(n)); const ix = saveIndex(); delete ix[n]; localStorage.setItem(SAVE + '_idx', JSON.stringify(ix)); }
export function save(slot = 'auto') {
  const data = snapshot();
  try {
    localStorage.setItem(slotKey(slot), JSON.stringify(data));
    if (slot === 'net') return true;
    const ix = saveIndex();
    ix[slot] = { fac: F[P].name, col: '#' + new THREE.Color(F[P].color ?? H.FDEF[P]?.[1] ?? 0x2a7fd4).getHexString(), ruler: F[P].ruler?.name, year: S.year, turn: S.turn, sys: systems.filter(s => s.owner === P).length, gold: Math.round(F[P].gold), humans: H.humans().length, apoc: Math.floor(S.apoc), t: Date.now(), scen: S.scen || null };
    localStorage.setItem(SAVE + '_idx', JSON.stringify(ix));
    return true;
  } catch (e) { console.error(e); return false; }
}
// ---- Field-driven saving: every plain field on a system/unit is saved automatically ----
// Skipped: runtime-only keys (meshes, DOM, links), keys starting with "_", and anything that isn't plain data.
export const SYS_SKIP = new Set(['lbl', 'mesh', 'ring', 'marker', 'pos', 'links', 'i', 'stnMesh', 'general']);
export const UNIT_SKIP = new Set(['mesh', 'escorts', 'sys', 'path', 'id', 'general', 'char']);
const isChar = v => v && typeof v === 'object' && Array.isArray(v.hist) && v.id != null && 'age' in v;
const isSys = v => v && typeof v === 'object' && v.mesh && Array.isArray(v.links);
export function encF(v, depth = 0) {
  if (v == null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
  if (v instanceof Set) return { __set: [...v].map(x => encF(x, depth + 1)) };
  if (isChar(v)) return { __c: v.id };
  if (isSys(v)) return { __s: v.i };
  if (Array.isArray(v)) return v.map(x => encF(x, depth + 1));
  if (Object.getPrototypeOf(v) !== Object.prototype || v.mesh || depth > 4) return undefined; // THREE/DOM/units
  const o = {}; for (const k in v) { const e = encF(v[k], depth + 1); if (e !== undefined) o[k] = e; } return o;
}
export function decF(v) {
  if (v == null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(decF);
  if (v.__set) return new Set(v.__set.map(decF));
  if (v.__c != null) return CH[v.__c] || null;
  if (v.__s != null) return systems[v.__s] || null;
  const o = {}; for (const k in v) o[k] = decF(v[k]); return o;
}
export function packObj(obj, skip) {
  const o = {};
  for (const k of Object.keys(obj)) { if (skip.has(k) || k[0] === '_') continue; const e = encF(obj[k]); if (e !== undefined) o[k] = e; }
  return o;
}
export function snapshot() {
  const ref = c => (c ? c.id : null);
  return {
    P, CID: ID.c, chars: Object.values(CH),
    units: units.map(u => ({ ...packObj(u, UNIT_SKIP), type: u.type, role: u.role, owner: u.owner, sys: u.sys.i, fleet: u.fleet, legions: u.legions, elite: u.elite, general: ref(u.general), char: ref(u.char), mp: u.mp, max: u.max, acted: u.acted, post: u.post ?? null, tgt: u.tgt ?? null, life: u.life ?? null, ro: u.ro || {}, path: (u.path || []).map(s => s.i), nm: u.nm || null, captain: u.captain || null })),
    S: { ...S, seen: [...(S.seen || [])], visited: [...(S.visited || [])], war: [...S.war], ally: [...S.ally], trade: [...(S.trade || [])], prisoners: S.prisoners.map(ref), wards: S.wards.map(ref), recl: S.recl ? { ...S.recl, target: S.recl.target.i } : null },
    F: F.map(f => ({ ...f, ruler: ref(f.ruler), heirs: f.heirs.map(ref), princesses: (f.princesses || []).map(ref), bastards: (f.bastards || []).map(ref), capital: f.capital ? f.capital.i : null })),
    sys: systems.map(s => ({ ...packObj(s, SYS_SKIP), x: s.pos.x, y: s.pos.y, z: s.pos.z, name: s.name, owner: s.owner, fleet: s.fleet, legions: s.legions, elite: s.elite, general: ref(s.general), links: s.links.map(l => l.i), income: s.income, order: s.order, recent: s.recent, rel: s.rel, b: [...s.b], ruin: s.ruin, moved: s.moved, built: s.built, siege: s.siege || null, stn: s.stn || 0, ro: s.ro || {}, spec: s.spec || null, site: !!s.site, gseed: s.gseed || 0, bn: s.bn || null, pol: s.pol || null, holy: s.holy ?? null, staff: s.staff || [], gw: s.gw || null, bladeWait: !!s.bladeWait, lv: s.lv || null, bq: s.bq || null, plague: s.plague || 0, quar: !!s.quar })),
  };
}
export function load(slot = 'auto') {
  const { addSystem, link, addUnit, stripRank, applyResNames, log } = H;
  const d = JSON.parse(slot === 'undo' ? sessionStorage.getItem('sb_undo_cur') : localStorage.getItem(slotKey(slot)));
  d.chars.forEach(c => { CH[c.id] = c; if (/^(Line Captain|Captain|Commander|Shipmaster|General)\s/.test(c.name || '')) c.name = stripRank(c.name); });
  ID.c = d.CID;
  const g = id => (id == null ? null : CH[id]);
  d.F.forEach(f => F.push({ ...f, ruler: g(f.ruler), heirs: f.heirs.map(g), princesses: Array.isArray(f.princesses) ? f.princesses.map(g).filter(Boolean) : [], bastards: Array.isArray(f.bastards) ? f.bastards.map(x => (typeof x === 'object' && x ? CH[x.id] : g(x))).filter(Boolean) : [] }));
  d.sys.forEach(o => {
    const s = addSystem(o.x, o.z, 0, o.owner);
    s.pos.y = o.y; s.mesh.position.y = o.y;
    Object.assign(s, { _geo: null, gp: 0, name: o.name, fleet: o.fleet, legions: o.legions, elite: o.elite, general: g(o.general), income: o.income, order: o.order, recent: o.recent, rel: o.rel, b: new Set(o.b), ruin: o.ruin, moved: o.moved, built: o.built, siege: o.siege || null, stn: o.stn || 0, ro: o.ro || {}, spec: o.spec || null, site: !!o.site, gseed: o.gseed || 0, bn: o.bn || undefined, pol: o.pol || undefined, holy: o.holy ?? undefined, staff: o.staff || [], gw: o.gw || null, bladeWait: !!o.bladeWait, lv: o.lv || {}, bq: o.bq || null, plague: o.plague || 0, quar: !!o.quar });
  });
  d.sys.forEach((o, i) => o.links.forEach(j => link(systems[i], systems[j])));
  // Field-driven: restore any other saved fields (new systems need no load code)
  const SYS_DONE = new Set(['x', 'y', 'z', 'links', 'general', 'b', 'name', 'fleet', 'legions', 'elite', 'income', 'order', 'recent', 'rel', 'ruin', 'moved', 'built', 'siege', 'stn', 'ro', 'spec', 'site', 'gseed', 'bn', 'pol', 'holy', 'staff', 'gw', 'bladeWait', 'lv', 'bq', 'plague', 'quar', 'owner', 'gp']);
  d.sys.forEach((o, i) => { for (const k in o) if (!SYS_DONE.has(k) && !SYS_SKIP.has(k) && k[0] !== '_') systems[i][k] = decF(o[k]); });
  F.forEach(f => { f.capital = f.capital == null ? null : systems[f.capital]; });
  Object.assign(S, d.S, { war: new Set(d.S.war), ally: new Set(d.S.ally), trade: new Set(Array.isArray(d.S.trade) ? d.S.trade : []), prisoners: d.S.prisoners.map(g).filter(Boolean), wards: d.S.wards.map(g).filter(Boolean), recl: d.S.recl ? { joined: [], refused: [], ...d.S.recl, ...(d.S.recl.side === 'Zithari' && d.S.recl.by == null ? { by: 15 } : {}), target: systems[d.S.recl.target] } : null });
  setP(d.P);
  applyResNames();
  (d.units || []).forEach(o => addUnit({ ...decF(o), nm: o.nm || undefined, sys: systems[o.sys], general: g(o.general), char: g(o.char), path: (o.path || []).map(i => systems[i]).filter(Boolean) }));
  S.seen = new Set(d.S.seen || []); S.visited = new Set(d.S.visited || []);
  log('📂 Campaign loaded.');
}
