// ---- Living politics (module split stage 10): how non-feudal powers decide, and how one house's choice moves another ----
// main.js-owned helpers are injected once via initPolitics(hooks) and bound to module-level names.
import { UNITS } from './tactical.js';
import { MERC_SELLERS } from './data.js';
import { S, F, systems, units, P } from './state.js';

let hist, crownBlood, log, atWar, hostile, isHuman, ri, rnd, clamp, mercSell, opinion, roAdd, grudge, st, persona, notify,
  power, bloodClaim, newFaction, mkChar, key, sway, duelFight, WA, vRank, setFate;
export function initPolitics(h) {
  ({ hist, crownBlood, log, atWar, hostile, isHuman, ri, rnd, clamp, mercSell, opinion, roAdd, grudge, st, persona, notify,
    power, bloodClaim, newFaction, mkChar, key, sway, duelFight, WA, vRank, setFate } = h);
}

export function crownNew(fid, nr, why) {
  const f = F[fid], old = f.ruler;
  f.heirs = f.heirs.filter(h => h !== nr);
  if (old && !old.dead && old !== nr) { f.heirs.push(old); hist(old, `steps down as ruler of ${f.name}.`); }
  f.ruler = nr; nr.wasRuler = true; if (fid === 2) crownBlood(nr);
  hist(nr, why); log(`👑 ${f.name}: ${nr.name} ${why.replace(/\.$/, '')}.`);
}
export async function politicsTick() {
  if (F[1] && /Nightmarch/.test(F[1].name)) F[1].name = 'The Nightfleet'; // old saves
  if (F[10] && F[10].name === 'The Antislavers') F[10].name = 'The Unchained'; // old saves
  const at = (a, b) => atWar(a, b), alive = id => F[id]?.alive && !hostile(F[id]);
  const AIs = F.filter(f => f.alive && !isHuman(f.id) && !hostile(f) && f.ruler);
  // --- AI Cloning Guild / AI Alliance stock the Mercenary Guilds for instant credits ---
  for (const sid of [6, 9]) {
    if (sid === P || !F[sid]?.alive) continue;
    const n = ri(1, 3);
    for (let j = 0; j < n; j++) mercSell(sid, rnd(MERC_SELLERS[sid]));
  }
  // --- Mercenary market: the AI Alliance, the Cloning Guild, the Syndicate and the Pirate Elect sell war to whoever pays ---
  const SELL = [[9, ['droidLegion', 'droidStarfighters']], [6, ['cloneTroopers', 'cloneCommandos']], [3, ['syndicateGunships']], [2, ['corsairs']]];
  const sold = {};
  for (const b of AIs) {
    const foes = F.filter(o => o.alive && o.id !== b.id && !hostile(o) && at(b.id, o.id));
    if (!foes.length || b.gold < 250 || Math.random() > 0.35) continue;
    const offers = SELL.filter(([sid]) => sid !== b.id && alive(sid) && !at(sid, b.id) && opinion(sid, b.id) > -10 && !(b.id === 10 && sid === 6));
    if (!offers.length) continue;
    const [sid, keys0] = rnd(offers);
    // Cloning Guild and AI Alliance troops come only from what they have sold into the guild's stock
    const keys = MERC_SELLERS[sid] ? keys0.filter(x => (S.mercPool?.[x] || 0) > 0) : keys0;
    if (!keys.length) continue;
    const k = rnd(keys), U = UNITS[k];
    if (!U || b.gold < U.c + 100) continue;
    const front = systems.filter(s => s.owner === b.id).sort((x, y) => y.links.filter(l => foes.some(o => o.id === l.owner)).length - x.links.filter(l => foes.some(o => o.id === l.owner)).length)[0];
    if (!front) continue;
    b.gold -= U.c;
    if (MERC_SELLERS[sid]) S.mercPool[k]--; // seller was already paid when stocking
    else F[sid].gold += Math.round(U.c * 0.7);
    if (U.k === 'land') roAdd(front, k, 1); else { const fl = units.find(x => x.type === 'fleet' && x.owner === b.id && x.sys === front); roAdd(fl || front, k, 1); }
    grudge(sid, b.id, 1);
    (sold[sid] ??= new Set()).add(b.id);
    if (Math.random() < 0.4) log(`💰 ${b.name} hires ${U.n} from ${F[sid].name} for the war against ${foes[0].name}.`);
    // Reactions: liberators despise clone-buyers; the Machine Cult blesses those who buy AI
    if (sid === 6 && F[10]?.alive) grudge(10, b.id, -2, 'buying vat-grown slaves');
    if (sid === 9 && F[12]?.alive) grudge(12, b.id, 1);
    if (sid === 9 && F[0]?.alive && Math.random() < 0.3) st(b.id, -1, 'trafficking with thinking machines');
  }
  // Sellers who arm both sides of a war earn a reputation
  for (const [sid, buyers] of Object.entries(sold)) {
    const L = [...buyers];
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) if (at(L[i], L[j])) {
      grudge(L[i], +sid, -2, 'arming our enemies'); grudge(L[j], +sid, -2, 'arming our enemies');
      log(`💰 ${F[sid].name} sells to both sides of the ${F[L[i]].name}–${F[L[j]].name} war.`);
    }
  }
  // --- The Bloodbank: lends for ambition as well as war, funds both sides, and calls in debts when its vaults run low ---
  if (alive(5) && !isHuman(5)) {
    const bb = F[5];
    for (const f of AIs) {
      if (f.id === 5 || at(f.id, 5) || S.loans.some(l => l.debtor === f.id) || opinion(5, f.id) <= -10 || bb.gold < 600) continue;
      const p = persona(f.ruler), wars = F.some(o => o.alive && o.id !== f.id && at(f.id, o.id));
      if (Math.random() < (wars ? 0.08 : 0.03) + p.agg * 0.04 && f.gold < 400) {
        const amt = wars ? 500 : 300, rate = { Republic: 0.3, Dictatorship: 0.45, 'Blood Empire': 0.6 }[S.bank.gov] ?? 0.3;
        f.gold += amt; bb.gold -= amt; S.loans.push({ debtor: f.id, owe: Math.round(amt * (1 + rate)), due: S.turn + 10 });
        log(`🩸 The Bloodbank lends ${amt} credits to ${f.name}${wars ? ' for its war' : ' to fund its ambitions'}.`);
        const foe = S.loans.find(l => l.debtor !== f.id && at(l.debtor, f.id));
        if (foe) log(`🩸 The Bloodbank now finances both sides of the ${f.name}–${F[foe.debtor].name} war. Whoever wins, the Bank collects.`);
      }
    }
    if (bb.gold < 300) { const l = S.loans.find(x => x.due > S.turn + 3); if (l) { l.due = S.turn + 1; log(`🩸 Its vaults running low, the Bloodbank calls in ${F[l.debtor]?.name}'s debt early.`); if (l.debtor === P) await notify(`<h3>🩸 Debt Called In</h3>The Bloodbank needs coin. Your loan of ${l.owe} is due next turn.`); } }
  }
  // --- The Free Planets: the Council of Governors can vote a failing High King out ---
  if (alive(14) && F[14].ruler && Math.random() < 0.35) {
    const f = F[14], r = f.ruler, govs = systems.filter(s => s.owner === 14 && s.general && s.general !== r).map(s => s.general);
    const fails = (r.admin || 0) + r.respect < 6 || F.some(o => o.alive && at(14, o.id) && power(o.id) > power(14) * 1.5);
    const hk = c => (c.admin || 0) + c.respect;
    if (fails && govs.length && Math.random() < 0.5) {
      const sw = await sway(14, `Vote of No Confidence in ${r.name}`, govs, hk);
      const best = govs.sort((a, b) => (hk(b) + sw.b(b)) - (hk(a) + sw.b(a)))[0];
      crownNew(14, best, `is elected High King after the Council votes ${r.name} out of office.`);
      await sw.done(best, `the governors vote ${r.name} out of office`); if (!sw.shown && isHuman(14)) await notify(`<h3>🗳 Vote of No Confidence</h3>The governors remove ${r.name}. ${best.name} is the new High King.`);
    }
  }
  // --- The Pirate Elect: a captain with more blood and steel may challenge the Elect at the moot ---
  if (alive(2) && F[2].ruler && Math.random() < 0.25) {
    const r = F[2].ruler, rc = bloodClaim(r, F[2]).v + r.skill;
    const ch = systems.filter(s => s.owner === 2 && s.general && s.general !== r).map(s => s.general).map(g => [g, bloodClaim(g, F[2]).v + g.skill]).filter(([, v]) => v > rc - 1).sort((a, b) => b[1] - a[1])[0];
    if (ch && ch[0].loyalty < 7) {
      // the two strongest captains of the Elect meet blade to blade — shown to the player as it happens
      const [g] = ch, { win } = await duelFight(g, r, `The Pirate Moot: ${g.name} challenges the Elect`, true);
      WA('duel', { a: g.id, f: 2, t: r.id, tf: 2, ok: win, died: true, r: win ? vRank(r) : '', txt: 'the Pirate Moot', s: systems.find(s => s.general === g)?.i });
      WA('elect', { f: 2, title: 'The Pirate Moot', w: (win ? g : r).id, c: [(win ? r : g).id], txt: win ? `the challenger kills the Elect in single combat` : `the Elect kills his challenger and keeps the seat` });
      if (win) { setFate(r, 'dead'); hist(r, `is killed in a duel at the Pirate Moot by ${g.name}.`); crownNew(2, g, 'wins the Moot duel and is proclaimed the Pirate Elect.'); systems.forEach(s => { if (s.general === g) s.general = null; }); }
      else { setFate(g, 'dead'); hist(g, `challenges ${r.name} at the Pirate Moot and dies on his blade.`); log(`☠ ${r.name} kills the challenger ${g.name} at the Pirate Moot.`); }
    }
  }
  // --- The Space Authority: senatorial elections every 6 years; the richest family usually wins ---
  if (alive(8) && F[8].ruler && S.year % 6 === 0) {
    const r = F[8].ruler, cands = systems.filter(s => s.owner === 8 && s.general && s.general !== r).map(s => s.general);
    const sc0 = c => (c.admin || 0) * 2 + c.respect + (c.blood || 0) * 0.5;
    const sw = await sway(8, 'Senate Election of the Space Authority', [r, ...cands], sc0);
    const tally = new Map([r, ...cands].map(c => [c, sc0(c) + sw.b(c) + Math.random() * 4]));
    const best = cands.sort((a, b) => tally.get(b) - tally.get(a))[0];
    if (best && tally.get(best) > tally.get(r)) { crownNew(8, best, 'is elected Chancellor of the Space Authority by the senatorial families.'); await sw.done(best, `the senate unseats ${r.name}`); if (!sw.shown && isHuman(8)) await notify(`<h3>📋 Senate Election</h3>${best.name} wins the Chancellorship. ${r.name} returns to the senate.`); }
    else { log(`📋 ${r.name} is re-elected Chancellor of the Space Authority.`); await sw.done(r, 're-elected by the senate'); }
  }
  // --- The AI Alliance: no heirs, only consensus. A war-mind that disagrees may fork and secede ---
  if (alive(9) && Math.random() < 0.06 && systems.filter(s => s.owner === 9).length >= 4) {
    const w = rnd(systems.filter(s => s.owner === 9 && s !== F[9].capital));
    if (w) { const r = newFaction(`Fork of ${w.name}`, 0x009090, 'Machine Cult', { gold: 200, droids: 1 }, { rogue: true, forkOf: 9 }); r.ruler = w.general || mkChar(r.id, 1); r.ruler.f = r.id; r.heirs = []; w.owner = r.id; S.war.add(key(9, r.id)); log(`🤖 A war-mind of the AI Alliance at ${w.name} forks from the consensus and secedes!`); }
  }
}
