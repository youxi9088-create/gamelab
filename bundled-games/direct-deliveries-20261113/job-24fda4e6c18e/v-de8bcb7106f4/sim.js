// ---- Spectator / AI-only simulation: every house (yours too) is run by the AI for N years.
// Captures errors, audits the galaxy for impossible or odd states each year, and prints a report.
import { S, F, CH, systems, units, P } from './state.js';
import { ask, setAutoAsk } from './ui.js';

let setSim, simTurn, refresh, showInfo, setBusy;
export function initSim(h) { ({ setSim, simTurn, refresh, showInfo, setBusy } = h); }

const fin = v => v == null || Number.isFinite(v);
const esc = s => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

// Picks answers for any dialog that would otherwise wait for a player
function autoPick(opts, st) {
  st.asks++;
  const close = opts.find(o => /^(Close|OK|Back|Cancel|Done|← Back|Never mind|Continue)$/i.test(String(o).trim()));
  if (opts.includes('Auto-Resolve')) return 'Auto-Resolve';
  if (st.turnAsks++ > 150) return close ?? opts[opts.length - 1]; // menu loop guard
  const real = opts.filter(o => o !== close && !/Fight Tactically|Command the Battle/.test(o));
  if (!real.length) return close ?? opts[0];
  return Math.random() < 0.8 ? real[Math.floor(Math.random() * real.length)] : (close ?? real[0]);
}

function audit(st) {
  const add = (k, msg) => { const a = st.odd[k] ||= { msg, n: 0, y: S.year }; a.n++; };
  for (const f of F) {
    if (!f) continue;
    const own = systems.filter(s => s.owner === f.id).length;
    if (f.alive) {
      if (!f.ruler) add('noruler' + f.id, `${f.name} is alive with no ruler`);
      else if (f.ruler.dead) add('deadruler' + f.id, `${f.name} is ruled by a dead man (${f.ruler.name})`);
      // A short captivity is normal (ransom talks, the court's grace period); only a long one is odd
      else if (f.ruler.captive && S.year - (f.ruler.captive.y ?? S.year) >= 4) add('capruler' + f.id, `${f.name}'s ruler ${f.ruler.name} rules from captivity`);
      if (!fin(f.gold)) add('gold' + f.id, `${f.name} treasury is not a number (${f.gold})`);
      else if (f.gold < -2000) add('debt' + f.id, `${f.name} treasury ${Math.round(f.gold)} (runaway debt)`);
      else if (f.gold > 50000) add('rich' + f.id, `${f.name} hoards ${Math.round(f.gold)} credits (AI not spending)`);
      if (!own && !f.domiri && !f.mods?.ff) add('landless' + f.id, `${f.name} is alive but holds no worlds`);
    } else if (own) add('ghost' + f.id, `${f.name} is dead but still owns ${own} world(s)`);
  }
  for (const s of systems) {
    if (s.owner >= 0 && !F[s.owner]) add('own' + s.i, `${s.name} owned by missing house ${s.owner}`);
    for (const k of ['income', 'order', 'legions', 'fleet', 'elite']) if (!fin(s[k])) add('nan' + k, `system ${k} not a number (e.g. ${s.name})`);
    if (s.legions < 0 || s.fleet < 0) add('neg', `negative troops (e.g. ${s.name})`);
    if (s.general?.dead) add('deadgov', `dead governor still seated (e.g. ${s.general.name} at ${s.name})`);
    if (s.general && s.owner >= 0 && s.general.f !== s.owner && !s.general.captive) add('forgov', `governor serving a foreign house (e.g. ${s.general.name} at ${s.name})`);
  }
  for (const u of units) {
    if (!systems.includes(u.sys)) add('usys', `unit outside the map (${u.type} of ${F[u.owner]?.name})`);
    if (u.owner >= 0 && !F[u.owner]?.alive) add('udead', `units of dead houses remain (e.g. ${F[u.owner]?.name})`);
    if (u.general?.dead) add('ugen', `dead general commands a fleet (e.g. ${u.general.name})`);
    if (u.char?.dead) add('uchar', `dead agent still on the map (e.g. ${u.char.name})`);
    if (!fin(u.fleet) || !fin(u.legions)) add('unan', 'fleet strength not a number');
  }
  for (const c of Object.values(CH)) {
    if (c.dead) continue;
    for (const k of ['skill', 'loyalty', 'respect', 'piety', 'age']) if (!fin(c[k])) { add('cnan' + k, `character ${k} not a number (e.g. ${c.name})`); break; }
    if (c.age > 105 && !c.undying) add('old', `immortal elders: ${c.name} is ${c.age}`);
  }
  if (!fin(S.apoc)) add('apoc', 'Armageddon counter not a number');
}

function stats() {
  const alive = F.filter(f => f?.alive), own = {};
  systems.forEach(s => { if (s.owner >= 0) own[s.owner] = (own[s.owner] || 0) + 1; });
  const top = Object.entries(own).sort((a, b) => b[1] - a[1])[0];
  return { y: S.year, alive: alive.length, top: top ? `${F[top[0]]?.name} ${top[1]}/${systems.length}` : '—', topN: top ? top[1] : 0,
    wars: S.war.size, apoc: Math.round(S.apoc), chars: Object.values(CH).filter(c => !c.dead).length, units: units.length, indep: systems.filter(s => s.owner < 0).length,
    ff: (() => { const f = F.find(x => x?.mods?.ff); return !f ? 'none' : f.dormant ? 'dormant' : f.alive ? `awake ${systems.filter(s => s.owner === f.id).length}w` : 'destroyed'; })(),
    domiri: systems.filter(s => F[s.owner]?.domiri).length };
}

export async function runSim(years) {
  const st = { asks: 0, turnAsks: 0, err: {}, odd: {}, rows: [], ev: { war: 0, peace: 0, revolt: 0, plague: 0, crown: 0, rebel: 0, legit: 0, burn: 0 }, slow: 0, maxMs: 0 };
  const y0 = S.year, houses0 = F.length, ownSig = () => systems.map(s => s.owner).join(',');
  let lastSig = ownSig(), lastChange = S.year, stop = false;
  // Capture every error the turn steps report
  const oErr = console.error;
  const keep = (m) => { const k = m.slice(0, 160); (st.err[k] ||= { n: 0, y: S.year }).n++; };
  console.error = (...a) => { keep(a.map(x => x instanceof Error ? `${x.message} @ ${(x.stack || '').split('\n')[1]?.trim() || ''}` : String(x)).join(' ')); oErr.apply(console, a); };
  const onErr = e => keep(`uncaught: ${e.message || e.reason?.message || e.reason}`);
  addEventListener('error', onErr); addEventListener('unhandledrejection', onErr);
  // Progress overlay
  const ov = document.createElement('div'); ov.id = 'simOv';
  ov.style.cssText = 'position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:300;background:#0b1020ee;border:1px solid #c9a24a;border-radius:10px;padding:10px 14px;color:#eee;font:13px sans-serif;text-align:center;min-width:240px';
  ov.innerHTML = `<b>🧪 Spectator simulation</b><div id="simP">Starting…</div><button id="simStop" style="margin-top:6px">⏹ Stop</button>`;
  document.body.appendChild(ov);
  ov.querySelector('#simStop').onclick = () => { stop = true; };
  setSim(true); setBusy(true);
  setAutoAsk((html, opts) => autoPick(opts, st));
  const t0 = performance.now();
  try {
    for (let turn = 0; turn < years * 2 && !stop; turn++) {
      st.turnAsks = 0;
      const ts = performance.now();
      let rep = [];
      const rulers = F.map(f => f.alive ? f.ruler : null);
      try { rep = await simTurn(); } catch (e) { keep(`turn crashed: ${e.message}`); }
      const ms = performance.now() - ts;
      st.maxMs = Math.max(st.maxMs, ms); if (ms > 1500) st.slow++;
      F.forEach((f, i) => { if (f.alive && rulers[i] && f.ruler && f.ruler !== rulers[i]) st.ev.crown++; });
      for (const m of rep || []) {
        if (/declares war/.test(m)) st.ev.war++; else if (/sign a peace/.test(m)) st.ev.peace++;
        else if (/revolts against/.test(m)) st.ev.revolt++; else if (/GREY ROT breaks out/.test(m)) st.ev.plague++;
        if (/is legitimised/.test(m)) st.ev.legit++; if (/burned as a heretic/.test(m)) st.ev.burn++;
      }
      if (S.turn % 2 === 1) {
        audit(st);
        const sig = ownSig(); if (sig !== lastSig) { lastSig = sig; lastChange = S.year; }
        if ((S.year - y0) % 10 === 0) st.rows.push(stats());
      }
      if (turn % 4 === 0) { try { refresh(); } catch (e) {} ov.querySelector('#simP').textContent = `Year ${S.year} · ${Math.round((turn + 1) / (years * 2) * 100)}% · ${Object.keys(st.err).length} error types`; }
      await new Promise(r => setTimeout(r, 0));
    }
  } finally {
    setAutoAsk(null); setSim(false); setBusy(false);
    console.error = oErr; removeEventListener('error', onErr); removeEventListener('unhandledrejection', onErr);
    ov.remove();
  }
  st.rows.push(stats());
  st.ev.rebel = F.length - houses0;
  const end = st.rows[st.rows.length - 1], secs = ((performance.now() - t0) / 1000).toFixed(1), yrs = S.year - y0;
  // Odd big-picture results
  const big = [];
  if (S.year - lastChange >= 20) big.push(`No world changed hands for ${S.year - lastChange} years (stalemate).`);
  if (end.topN > systems.length * 0.5) big.push(`Runaway: ${end.top} worlds.`);
  if (end.alive <= 3) big.push(`Only ${end.alive} houses left alive.`);
  if (st.ev.war === 0) big.push('No wars were declared.');
  if (st.ev.war > yrs * 3) big.push(`Very warlike: ${st.ev.war} declarations in ${yrs} years.`);
  if (end.apoc >= 100) big.push('Armageddon reached 100.');
  if (end.chars > 2500) big.push(`Character bloat: ${end.chars} living characters (save size / speed risk).`);
  if (end.indep > systems.length * 0.4) big.push(`${end.indep} worlds independent — houses may be collapsing.`);
  if (st.slow) big.push(`${st.slow} turn(s) took over 1.5 s (slowest ${Math.round(st.maxMs)} ms).`);
  const errs = Object.entries(st.err).sort((a, b) => b[1].n - a[1].n), odd = Object.values(st.odd).sort((a, b) => b.n - a.n);
  const tbl = `<table style="width:100%;font-size:11px;border-collapse:collapse"><tr><th>Year</th><th>Houses</th><th>Largest</th><th>Wars</th><th>☢</th><th>People</th><th>Indep.</th></tr>${st.rows.map(r => `<tr><td>${r.y}</td><td>${r.alive}</td><td>${esc(r.top)}</td><td>${r.wars}</td><td>${r.apoc}</td><td>${r.chars}</td><td>${r.indep}</td></tr>`).join('')}</table>`;
  const html = `<h3>🧪 Simulation Report</h3><small>${yrs} years (Y${y0}→Y${S.year}) in ${secs}s · ${st.asks} dialogs auto-answered${stop ? ' · stopped early' : ''}</small>
  <div class="scroll" style="max-height:60vh;text-align:left">
  <div class="flab">❌ Errors (${errs.length})</div>${errs.map(([m, e]) => `<div style="color:#f99;font-size:11px">×${e.n} (first Y${e.y}) ${esc(m)}</div>`).join('') || '<small>None 🎉</small>'}
  <div class="flab">⚠ Impossible / odd states (${odd.length})</div>${odd.map(o => `<div style="color:#fd8;font-size:11px">×${o.n} (first Y${o.y}) ${esc(o.msg)}</div>`).join('') || '<small>None</small>'}
  <div class="flab">📈 Big picture</div>${big.map(b => `<div style="font-size:12px">• ${esc(b)}</div>`).join('') || '<small>Nothing unusual.</small>'}
  <div style="font-size:12px;margin-top:4px">Wars ${st.ev.war} · Peaces ${st.ev.peace} · Revolts ${st.ev.revolt} · New houses (rebels/claimants) ${st.ev.rebel} · Plagues ${st.ev.plague} · Heretics burned ${st.ev.burn} · Bastards legitimised ${st.ev.legit}</div>
  <div class="flab">Timeline</div>${tbl}</div>`;
  const text = `SIM ${yrs}y Y${y0}-Y${S.year}\nERRORS:\n${errs.map(([m, e]) => `x${e.n} Y${e.y} ${m}`).join('\n') || 'none'}\nODD:\n${odd.map(o => `x${o.n} Y${o.y} ${o.msg}`).join('\n') || 'none'}\nBIG:\n${big.join('\n') || 'none'}\nEVENTS: ${JSON.stringify(st.ev)}\n` + st.rows.map(r => JSON.stringify(r)).join('\n');
  console.log(text);
  try { refresh(); showInfo(); } catch (e) {}
  for (;;) {
    const c = await ask(html, ['📋 Copy report', '⏏ Reload last save', 'Close (keep this galaxy)']);
    if (c === '📋 Copy report') { try { await navigator.clipboard.writeText(text); } catch (e) {} continue; }
    if (c === '⏏ Reload last save') { sessionStorage.setItem('sb_load', 'auto'); location.reload(); }
    break;
  }
}
