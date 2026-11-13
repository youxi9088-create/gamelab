// ---- Steward: supply lines, governor graft, the Court Docket & Standing Orders, the economy ledger, advisor hints ----
// Mechanics, not flavour: income depends on whether a world can reach its capital; greedy or disloyal governors skim
// and can be caught; armies far from friendly worlds cost more. Standing orders answer routine dilemmas for you, and
// routine reports past a per-turn budget are filed in the Docket instead of interrupting play.
import { S, F, CH, systems, units, P } from './state.js';
import { setTurnFilter } from './ui.js';

let H = {};
export function initSteward(h) { H = h; setTurnFilter(turnFilter); }
const strip = s => String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// ================= 1. Supply lines =================
// A world is supplied when a chain of passable worlds links it to its realm's capital (or, without one, its richest world).
// Passable: own worlds not under blockade, allies, the house's vassal bloc, and neutral worlds with no hostile fleet in orbit.
// Enemy worlds and worlds with an enemy war-fleet (3+ ships) in orbit cut the chain.
function hostileFleetAt(s, fid) {
  return units.some(u => u.type === 'fleet' && u.sys === s && u.owner !== fid && H.atWar(u.owner, fid) && H.ships(u) >= 3);
}
function friendly(fid, o) {
  if (o === fid) return true;
  if (o < 0) return false;
  return S.ally?.has?.(H.key(fid, o)) || S.vassal?.[o] === fid || S.vassal?.[fid] === o;
}
export function supplyNet(fid) {
  const f = F[fid], own = systems.filter(s => s.owner === fid);
  if (!f || !own.length) return new Set();
  const root = f.capital?.owner === fid ? f.capital : own.slice().sort((a, b) => b.income - a.income)[0];
  const seen = new Set([root.i]), q = [root], out = new Set([root.i]);
  while (q.length) {
    const s = q.shift();
    // a blockaded world is still reached, but nothing flows through it
    if (s !== root && (s.siege || hostileFleetAt(s, fid))) continue;
    for (const l of s.links) {
      if (seen.has(l.i)) continue;
      seen.add(l.i);
      const o = l.owner;
      if (o === fid) { out.add(l.i); q.push(l); continue; }
      if (o >= 0 && H.atWar(o, fid)) continue;
      if (hostileFleetAt(l, fid)) continue;
      if (friendly(fid, o) || o < 0 || !H.atWar(o, fid)) q.push(l);
    }
  }
  return out;
}
export const CUT_MUL = 0.6;   // cut-off worlds keep 60% of their income
export const OOS_MUL = 1.5;   // forces out of supply cost 50% more upkeep
// Forces are in supply on or next to a supplied world of their own (or an ally's world)
export function inSupply(u, net) {
  const s = u.sys; if (!s) return true;
  const ok = x => (x.owner === u.owner && net.has(x.i)) || (x.owner >= 0 && x.owner !== u.owner && friendly(u.owner, x.owner));
  return ok(s) || s.links.some(ok);
}

// ================= 2. Governor graft =================
// Skim rate from character: greed and disloyalty skim, honesty and loyalty don't; a sharp administrator hides it better (and skims less)
export function graftRate(g) {
  if (!g || g.dead) return 0;
  let r = 0;
  if (H.has(g, 'Greedy')) r += 0.12;
  if (H.has(g, 'Squanderer')) r += 0.04;
  if (H.has(g, 'Drunkard')) r += 0.02;
  if ((g.loyalty ?? 5) <= 2) r += 0.06; else if ((g.loyalty ?? 5) <= 4) r += 0.02;
  if (H.has(g, 'Just') || H.has(g, 'Loyal') || H.has(g, 'Generous') || H.has(g, 'Pious')) r -= 0.08;
  return Math.max(0, Math.min(0.2, r));
}
// Yearly audit: a skimming governor may be caught. Odds rise with the ruler's administration, Probe AIs in the realm and a Paranoid ruler.
export async function graftTick() {
  for (const s of systems) {
    const g = s.general, f = F[s.owner];
    if (!g || g.dead || !f?.alive || (g.graft || 0) < 60 || g.f !== s.owner || f.ruler === g) continue;
    const r = f.ruler, probes = units.filter(u => u.owner === f.id && u.role === 'Spy').length;
    const odds = Math.min(0.75, 0.12 + (r?.admin || 0) * 0.02 + probes * 0.05 + (H.has(r, 'Paranoid') ? 0.12 : 0) + (H.has(r, 'Just') ? 0.06 : 0) + Math.min(0.2, g.graft / 2000) - (g.admin || 0) * 0.015);
    if (Math.random() > odds) continue;
    const sum = Math.round(g.graft);
    let v;
    if (H.isMe(f.id) && !H.SIM()) {
      const c = await H.ask(`<h3>💰 Graft at ${s.name}</h3>${H.portrait(g, 64)}<br>Your auditors find that <b>${H.cl(g)}</b>, governor of ${s.name}, has skimmed <b>${sum}</b> credits from the world's taxes${H.has(g, 'Greedy') ? ' — his greed is no secret' : (g.loyalty ?? 5) <= 4 ? ' — a sign of wavering loyalty' : ''}.<br><small>Confiscate: the coin returns, he loses 3 loyalty. Dismiss: confiscate and send him to the reserve (−4 loyalty). Pardon: he keeps it and gains 1 loyalty, but he will go on skimming.</small>`, [`💰 Confiscate (+${sum})`, `⚖ Dismiss and confiscate (+${sum})`, '🤝 Pardon him']);
      v = String(c).startsWith('⚖') ? 'dismiss' : String(c).startsWith('🤝') ? 'pardon' : 'take';
    } else {
      const harsh = H.has(r, 'Paranoid') || H.has(r, 'Cruel') || H.has(r, 'Just') || (r?.respect || 0) <= -4, soft = H.has(r, 'Generous') || H.has(r, 'Trusting');
      v = harsh ? (Math.random() < 0.5 ? 'dismiss' : 'take') : soft ? 'pardon' : Math.random() < 0.6 ? 'take' : 'pardon';
    }
    if (v === 'pardon') { g.loyalty = Math.min(10, (g.loyalty || 0) + 1); g.graft = sum * 0.5; H.hist(g, `is caught skimming ${sum} credits from ${s.name} and pardoned by ${r?.name || 'his liege'}.`); }
    else {
      f.gold += sum; g.graft = 0; g.loyalty = Math.max(0, (g.loyalty || 0) - (v === 'dismiss' ? 4 : 3));
      H.hist(g, `is caught skimming ${sum} credits from ${s.name}; ${v === 'dismiss' ? 'the coin is seized and he is dismissed' : 'the coin is seized'}.`);
      if (v === 'dismiss') { s.general = null; H.station(s, g); }
    }
    if (f.id === P || H.isHuman(f.id)) H.log(`💰 ${H.cl(g)} is caught skimming ${sum} credits at ${s.name} — ${v === 'pardon' ? 'pardoned' : v === 'dismiss' ? 'dismissed, coin seized' : 'coin seized'}.`);
  }
}

// ================= 3. Court Docket & Standing Orders =================
// Rules: a title pattern, the choices a standing order may pick, and the option text each choice matches.
export const ORDERS = [
  { k: 'ransom', n: 'Ransom demands for your captured lords', re: /Ransom demanded/, ch: [['pay', 'Always pay', /^Pay/], ['refuse', 'Always refuse', /^Refuse/]] },
  { k: 'kin', n: 'Buying kin out of bondage', re: /Kin in chains/, ch: [['buy', 'Always buy', /^Buy freedom/], ['leave', 'Never buy', /^Leave him/]] },
  { k: 'peace', n: 'Terms after a peace treaty', re: /Terms of Peace with/, ch: [['swap', 'Exchange hostages', /^🤝/], ['free', 'Free prisoners only', /^⛓/], ['none', 'No further terms', /^✋/]] },
  { k: 'ward', n: 'Sons found in fallen capitals', re: /A Son of /, ch: [['take', 'Take as ward', /^🏰/], ['leave', 'Leave them', /^Leave him/]] },
  { k: 'duelOwn', n: 'Your lords seeking duels', re: /would challenge his nemesis/, ch: [['let', 'Let them fight', /^⚔/], ['forbid', 'Forbid', /^✋/]] },
  { k: 'duelFoe', n: 'Duels offered to your lords', re: /A Challenge!/, ch: [['accept', 'Accept', /^⚔/], ['refuse', 'Refuse', /^🛡/]] },
  { k: 'strike', n: 'Commanders begging leave to strike', re: /begs leave to strike/, ch: [['grant', 'Grant leave', /^⚔ Grant/], ['forbid', 'Forbid', /^✋/]] },
  { k: 'hunt', n: 'Commanders asking to hunt a nemesis', re: /asks leave to hunt/, ch: [['grant', 'Grant the hunt', /^🎯/], ['forbid', 'Forbid', /^✋/]] },
  { k: 'plot', n: 'Plots to free your captives', re: /A Plot in Your Court/, ch: [['guard', 'Double the guard (100)', /^🛡/], ['trap', 'Lay a trap', /^🪤/], ['trust', 'Trust the keeper', /^🤷/]] },
  { k: 'papal', n: "The Grandmaster's ceasefire commands", re: /Papal Command/, ch: [['obey', 'Obey', /^Obey/], ['defy', 'Defy', /^Defy/]] },
  { k: 'blood', n: 'A revealed child drawn to its true house', re: /The Pull of Blood/, ch: [['stay', 'Ask them to stay', /^🤝/], ['go', 'Let them go', /^🕊/]] },
  { k: 'bastard', n: 'Base-born children coming of age', re: /Comes of Age/, ch: [['legit', 'Legitimise', /^📜 Legitimise/], ['wait', 'Not now', /^⏳/]] },
];
// Never filed away: the throne, the realm's survival, victory
const CRUCIAL = /fallen|Throne|crowned|Emperor|destroyed|Your turn|Bankrupt|Succession|has died|Coalition|Forgotten Fleet|Cataclysm|Excommunicat|Victory|Defeat|Withdrawal|captured/i;
let inTurn = false, shown = 0, filed = 0;
const SO = () => (S.orders ||= {});
export const docket = () => (S.docket ||= []);
function file(t, h, how) { const d = docket(); d.push({ y: S.year, n: S.turn, t, h, how }); if (d.length > 80) d.splice(0, d.length - 80); filed++; }
function titleOf(html) { const m = /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(html || ''); return strip(m ? m[1] : html).slice(0, 90); }
function turnFilter(html, opts) {
  if (!inTurn || H.SIM()) return undefined;
  const txt = strip(html);
  // standing orders answer routine dilemmas
  for (const o of ORDERS) {
    if (!o.re.test(txt)) continue;
    const pick = SO()[o.k]; if (!pick || pick === 'ask') return undefined;
    const ch = o.ch.find(c => c[0] === pick), opt = ch && opts.find(x => ch[2].test(String(x).trim()));
    if (!opt) return undefined; // the ordered choice isn't on offer (e.g. can't afford): ask after all
    file(titleOf(html), html, `Standing order: ${ch[1]}`);
    return opt;
  }
  // plain reports: the first few interrupt, the rest wait in the docket
  if (opts.length === 1 && /^(OK|Close|Continue)$/i.test(String(opts[0]).trim())) {
    if (CRUCIAL.test(txt)) return undefined;
    const budget = SO().budget ?? 3;
    if (budget >= 0 && shown >= budget) { file(titleOf(html), html, 'Filed'); return opts[0]; }
    shown++;
  }
  return undefined;
}
export function beginTurn() { inTurn = true; shown = 0; filed = 0; }
export function endTurn() { inTurn = false; const n = filed; filed = 0; if (n && !H.SIM()) H.toast(`📜 ${n} report${n > 1 ? 's' : ''} filed in the Court Docket (☰ Menu → 📜 Docket).`); S.docketNew = (S.docketNew || 0) + n; return n; }
export async function docketMenu() {
  S.docketNew = 0;
  for (;;) {
    const d = docket().slice().reverse();
    const opts = d.slice(0, 30).map((e, i) => `${i + 1}. ${e.t}`.slice(0, 60));
    const r = await H.ask(`<h3>📜 Court Docket</h3><small>Reports filed while your turn was processed, and dilemmas answered by your Standing Orders. Newest first.</small><div class="scroll" style="max-height:44vh">${d.length ? d.slice(0, 30).map((e, i) => `<div style="padding:4px 0;border-bottom:1px solid #fff1"><b>${i + 1}.</b> Y${e.y} · ${e.t} <small style="opacity:.7">(${e.how})</small></div>`).join('') : '<p>The docket is empty.</p>'}</div>`, [...opts, ...(d.length ? ['🗑 Clear the docket'] : []), '📋 Standing Orders', 'Close']);
    if (r === '🗑 Clear the docket') { docket().length = 0; continue; }
    if (r === '📋 Standing Orders') { await ordersMenu(); continue; }
    const i = opts.indexOf(r); if (i < 0) return;
    await H.ask(`<small style="opacity:.7">Y${d[i].y} · ${d[i].how}</small>${d[i].h}`, ['Back']);
  }
}
export async function ordersMenu() {
  for (;;) {
    const o = SO(), bud = o.budget ?? 3;
    const lab = r => { const p = o[r.k]; const c = r.ch.find(x => x[0] === p); return c ? c[1] : 'Ask me'; };
    const budL = bud < 0 ? 'Show every report' : `Show ${bud} report${bud !== 1 ? 's' : ''} per turn, file the rest`;
    const opts = [`📨 Reports: ${budL}`, `🧭 Advisor hints: ${S.advisorOff ? 'Off' : 'On'}`, ...ORDERS.map(r => `${r.n}: ${lab(r)}`)];
    const r = await H.ask(`<h3>📋 Standing Orders</h3><small>Tell your court how to answer routine dilemmas while your turn is processed. "Ask me" always shows the popup. If an order can't be carried out (e.g. you can't afford a ransom) you are asked anyway. Crucial news — your throne, the realm's survival — is never filed away.</small>`, [...opts, 'Close']);
    const i = opts.indexOf(r); if (i < 0) return;
    if (i === 0) { const seq = [3, 1, 5, 0, -1], cur = seq.indexOf(bud); o.budget = seq[(cur + 1) % seq.length]; continue; }
    if (i === 1) { S.advisorOff = !S.advisorOff; continue; }
    const rule = ORDERS[i - 2];
    const p = await H.ask(`<h3>📋 ${rule.n}</h3>`, ['Ask me', ...rule.ch.map(c => c[1]), 'Back']);
    if (p === 'Ask me') o[rule.k] = 'ask'; else { const c = rule.ch.find(x => x[1] === p); if (c) o[rule.k] = c[0]; }
  }
}

// ================= 4. Economy ledger (tap Credits in the top bar) =================
export async function ledgerMenu() {
  const f = F[P], e = f?.eco; if (!f) return;
  const row = (a, v, c) => `<tr><td>${a}</td><td style="text-align:right;color:${c || (v < 0 ? '#f99' : '#9f9')}">${v > 0 ? '+' : ''}${Math.round(v)}</td></tr>`;
  const net = supplyNet(P), cut = systems.filter(s => s.owner === P && !net.has(s.i));
  const graft = systems.filter(s => s.owner === P && s.general && graftRate(s.general) > 0);
  const oos = units.filter(u => u.owner === P && u.type === 'fleet' && !inSupply(u, net));
  const h = e ? `<table style="width:100%;font-size:13px;border-collapse:collapse">
    <tr><th style="text-align:left" colspan="2">Income per turn</th></tr>
    ${row('💰 Taxes, buildings & resources', e.worlds)}${row('🚀 Trade with neighbours', e.trade)}${e.traders ? row('💼 Traders & trade posts', e.traders) : ''}${e.hyper ? row('🛣 Hyperways', e.hyper) : ''}${e.slaves ? row('⛓ Named slaves', e.slaves) : ''}
    ${e.cut ? row(`✂ Cut off from the capital (${cut.length} world${cut.length !== 1 ? 's' : ''}, −40%)`, -e.cut) : ''}${e.graft ? row('🕳 Skimmed by governors', -e.graft) : ''}${e.siege ? row('⛓ Blockaded worlds (no income)', -e.siege) : ''}
    <tr><th style="text-align:left;padding-top:6px" colspan="2">Upkeep per turn</th></tr>
    ${row('🛡 Garrisons & stations', -e.upW)}${row('🚀 Fleets & agents', -e.upU)}${e.oos ? row(`🧭 Out of supply (${oos.length} fleet${oos.length !== 1 ? 's' : ''}, +50%)`, -e.oos) : ''}
    <tr><td style="padding-top:6px"><b>Net</b></td><td style="text-align:right;padding-top:6px"><b>${f.net >= 0 ? '+' : ''}${f.net}</b></td></tr></table>` : '<p>The ledger fills in after your first turn ends.</p>';
  const notes = [
    cut.length ? `✂ <b>Cut off:</b> ${cut.map(s => s.name).join(', ')} cannot reach your capital through friendly or neutral space. Retake the worlds or clear the enemy fleets between them.` : '',
    graft.length ? `🕳 <b>Skimming:</b> ${graft.map(s => `${s.general.name} (${s.name}, ${Math.round(graftRate(s.general) * 100)}%)`).join(', ')}. Greed and low loyalty skim; auditors catch them yearly (better with a sharp ruler and Probe AIs).` : '',
    oos.length ? `🧭 <b>Out of supply:</b> fleets more than a jump from your supplied worlds or an ally cost 50% more.` : '',
  ].filter(Boolean).map(x => `<p style="font-size:12px">${x}</p>`).join('');
  await H.ask(`<h3>💰 Treasury of ${f.name}</h3>Credits: <b>${Math.round(f.gold)}</b>${h}${notes}`, ['Close']);
}

// ================= 5. Advisor: one situational hint per turn (toast, never a popup) =================
export function advisorTick() {
  if (S.advisorOff || H.SIM() || P < 0 || !F[P]?.alive) return;
  const f = F[P], r = f.ruler, hints = [];
  const net = supplyNet(P), mine = systems.filter(s => s.owner === P);
  if (f.net < 0 && f.gold < -f.net * 4) hints.push(`💸 Your treasury loses ${-f.net} a turn and will run dry in about ${Math.max(1, Math.floor(f.gold / -f.net))} turns. Tap Credits in the top bar to see where it goes.`);
  const cut = mine.filter(s => !net.has(s.i)); if (cut.length) hints.push(`✂ ${cut[0].name}${cut.length > 1 ? ` and ${cut.length - 1} more` : ''} are cut off from your capital and yield only 60% of their income.`);
  const riot = mine.find(s => s.order <= 2); if (riot) hints.push(`🔥 Order on ${riot.name} is ${riot.order}/10. At 0 it may revolt — try Martial Law, more legions, or a stronger governor.`);
  const empty = mine.find(s => !s.general && s.income >= 90); if (empty) hints.push(`🏛 ${empty.name} has no governor. A governor adds order and income — assign one from the reserve or court.`);
  if (r && !r.dead && !H.heirOf(f) && !H.celibate(P)) hints.push(`👑 ${r.name} has no heir. If he dies, the house may fall into a succession war. Marry, legitimise a bastard, or adopt a lord.`);
  const sk = mine.find(s => s.general && graftRate(s.general) >= 0.1); if (sk) hints.push(`🕳 ${sk.general.name} skims about ${Math.round(graftRate(sk.general) * 100)}% of ${sk.name}'s taxes. Raise his loyalty or replace him.`);
  const cap = f.capital; if (cap?.owner === P && units.some(u => u.type === 'fleet' && H.atWar(u.owner, P) && (u.sys === cap || cap.links.includes(u.sys)) && H.ships(u) >= 4)) hints.push(`⚠ An enemy fleet is within a jump of your capital ${cap.name}.`);
  const oos = units.filter(u => u.owner === P && u.type === 'fleet' && !inSupply(u, net)); if (oos.length) hints.push(`🧭 ${oos.length} of your fleets are out of supply and cost 50% more upkeep.`);
  if (f.gold > 1500 && mine.some(s => !s.bq)) hints.push(`🏗 You hold ${Math.round(f.gold)} credits. Upgrading buildings raises income, order and recruitment.`);
  if (!hints.length) return;
  H.toast(`🧭 <b>Advisor:</b> ${hints[(S.turn || 0) % hints.length]}`);
}
