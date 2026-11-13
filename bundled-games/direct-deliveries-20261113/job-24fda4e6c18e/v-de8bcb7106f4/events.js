// ---- Mid-game events (module split stage 9): plague, overreach, tourneys, harvests ----
// main.js-owned helpers are injected once via initEvents(hooks) and bound to module-level names,
// so the event code below reads exactly as it did in main.js.
import { S, F, CH, systems, units, P } from './state.js';
import { wikiAct } from './wiki.js';

let has, hist, addTrait, addAnc, rnd, ri, log, toast, inSight, geo, cl, succession, ask, notify, RES, hostile, newFaction, key,
  portrait, pay, gain, maybe, station, checkDead, card, setFate, wound, grudge, bloodClaim, authority;
export function initEvents(h) {
  ({ has, hist, addTrait, addAnc, rnd, ri, log, toast, inSight, geo, cl, succession, ask, notify, RES, hostile, newFaction, key,
    portrait, pay, gain, maybe, station, checkDead, card, setFate, wound, grudge, bloodClaim, authority } = h);
}

// The Grey Rot: a plague that spreads along hyperlanes, kills generals and empties worlds.
// Hospice level (health building chain): fewer deaths, fewer troop losses, shorter outbreaks, slower spread
export const hospLv = s => (s?.b?.has?.('Hospice') ? Math.max(1, s.lv?.Hospice || 1) : 0);
export function plagueDeath(c, k = 1) {
  if (!c || c.dead || c.undying || has(c, 'Plague-Scarred')) return false;
  // Only those who actually catch the Rot are marked: most of them die, the rest survive scarred and immune
  if (Math.random() >= 0.18 * k * (has(c, 'Plague Doctor') ? 0.5 : 1)) {
    // Some breathe it in and never sicken — silent carriers, still breathing it out for a year
    if (!c.rot && Math.random() < 0.12) { c.rot = 1; hist(c, 'carries the Grey Rot in his lungs without showing it.'); }
    return false;
  }
  const die = Math.min(0.9, 0.55 * (c.age >= 60 ? 1.4 : c.age < 16 ? 1.2 : 1));
  if (Math.random() < die) { c.dead = true; hist(c, 'is taken by the Grey Rot, drowning in his own lungs.'); return true; }
  addTrait(c, 'Plague-Scarred'); c.rot = 2; hist(c, 'survives the Grey Rot, grey-marked and immune — but still contagious.');
  if (c.f === P) toast(`☣ ${c.name} survives the Grey Rot but is still contagious — wherever he goes, he may carry it`, true);
  return false;
}
export async function plagueTick() {
  // Carriers stop shedding the Rot after a year or two
  for (const c of Object.values(CH)) if (c?.rot && (c.dead || --c.rot <= 0)) delete c.rot;
  const sick = systems.filter(s => s.plague > 0);
  // Outbreaks: rarer in a calm galaxy, more common as sins pile up
  if (sick.length < 2 && Math.random() < 0.035 + S.apoc / 1200) {
    const pool = systems.filter(s => s.owner >= 0 && !s.plague && s.income >= 60);
    const s = pool.length ? rnd(pool) : null;
    if (s) { s.plague = 3; sick.push(s); log(`☠ THE GREY ROT breaks out on ${s.name}!`); if (s.owner === P || inSight(s)) toast(`☠ Plague on ${s.name}`, false); }
  }
  const dead = [];
  for (const s of sick) {
    const hl = hospLv(s), bacta = geo(s).res.includes('bacta'), doc = has(s.general, 'Plague Doctor'), k = (bacta ? 0.6 : 1) * (doc ? 0.5 : 1) * (1 - 0.15 * hl);
    s.legions = Math.floor(s.legions * (1 - 0.25 * k)); s.elite = Math.floor(s.elite * (1 - 0.15 * k));
    s.income = Math.max(20, Math.round(s.income * (1 - 0.06 * k)));
    // Those on the ground risk it: the governor and the officers waiting in reserve. Fleets in orbit are safe.
    const hk = 1 - 0.15 * hl;
    if (s.general && plagueDeath(s.general, hk)) { dead.push([s.general, s]); s.general = null; }
    for (const id of [...(s.staff || [])]) { const c = CH[id]; if (c && plagueDeath(c, hk)) { dead.push([c, s]); s.staff = s.staff.filter(x => x !== id); } }
    // Spread along the lanes (traders, pilgrims) — quarantine nearly stops it, hospices slow it
    for (const l of s.links) if (!l.plague && l.owner !== -2 && Math.random() < (s.quar ? 0.04 : 0.18) * (l.quar ? 0.3 : 1) * (1 - 0.2 * hl)) await plagueStrike(l, `spreads from ${s.name} to ${l.name}`);
    if (hl >= 3 && s.plague > 1 && Math.random() < 0.5) s.plague--; // a great infirmary burns it out sooner
    if (--s.plague <= 0) { s.plague = 0; s.quar = false; log(`🌿 The Grey Rot burns itself out on ${s.name}.`); }
  }
  for (const [c, s] of dead) {
    log(`☠ ${cl(c)} of ${F[c.f]?.name || 'no house'} dies of the Grey Rot at ${s.name}.`);
    if (c.f === P) toast(`☠ ${c.name} has died of plague at ${s.name}`, false);
    if (F[c.f]?.ruler === c) await succession(c.f, 'was taken by the Grey Rot');
  }
}
// A world catches the Rot (lanes, carriers, outbreaks). AI lords decide on quarantine; the player is asked.
export async function plagueStrike(s, how) {
  if (!s || s.plague || s.owner === -2) return false;
  s.plague = 3; log(`☠ The Grey Rot ${how}.`);
  if (s.owner === P) await plagueAsk(s);
  else if (s.owner >= 0) {
    const g = s.general, ad = g?.admin ?? 4;
    // AI: a careful, able or paranoid governor seals the world; a greedy one keeps trade flowing
    const p = 0.35 + ad * 0.04 + (has(g, 'Cautious') || has(g, 'Paranoid') ? 0.2 : 0) - (has(g, 'Greedy') ? 0.2 : 0);
    if (Math.random() < p) { s.quar = true; s.order = Math.max(0, s.order - 1); }
    if (inSight(s)) toast(`☠ Grey Rot on ${s.name}${s.quar ? ' (quarantined)' : ''}`, false);
  }
  return true;
}
export async function plagueAsk(s) {
  const c = await ask(`<h3>☠ The Grey Rot reaches ${s.name}</h3><i>A lung rot: grey blotches on the skin, coughing blood, and the dead carted out at night.</i><br><br>The plague will kill troops and may take ${s.general ? cl(s.general) : 'any governor you send'}. It lasts about three years. It spreads along the hyperlanes and travels with anyone who carries it.<br><small>🚧 Quarantine: −1 order, the lanes nearly close, and <b>no officer or troops may leave the world</b> (no boarding fleets, no embarking legions).<br>Fleets in orbit are safe, unless they take on troops or officers from the surface.<br>A Plague Doctor halves deaths; a Hospice and ${RES.bacta?.n || 'bacta'} worlds suffer less.</small>`, ['🚧 Quarantine (sealed, −1 order)', 'Let trade flow']);
  if (c?.startsWith('🚧')) { s.quar = true; s.order = Math.max(0, s.order - 1); log(`🚧 ${s.name} is placed under quarantine.`); }
}
// Discontent: every governor carries a grievance that grows or fades each year from who he is and how he is ruled.
// When it boils over AND he can count the swords to hold his ground, he rises. No dice, no realm-size trigger.
const govStr = s => s.legions + s.elite * 2 + s.fleet * 2 + units.filter(u => u.owner === s.owner && u.sys === s && u.type === 'fleet').reduce((t, u) => t + (u.fleet || 0) * 2 + (u.legions || 0), 0);
function grievance(g, f, ws) {
  const r = f.ruler;
  let d = (5 - (g.loyalty ?? 5)) * 0.6;                               // loyalty is the core
  if (has(g, 'Ambitious')) d += 1; if (has(g, 'Greedy')) d += 0.5; if (has(g, 'Loyal')) d -= 2; if (has(g, 'Trusting')) d -= 0.5;
  d -= 0.5;                                                            // most men are content with a governorship
  d += Math.max(0, ws.length - 8) * 0.15;                              // a sprawling realm is ruled from far away
  d -= (authority(r) - 5) * 0.4;                                       // Authority: a commanding leader keeps his generals; a weak one invites rebellion
  if (r && r.age < 16) d += 1;                                         // boy-kings breed ambitious regents
  if (g.vendetta === f.id) d += 2;
  if ((r?.respect ?? 0) < 0) d += Math.min(2, -(r.respect) * 0.1);    // fear holds some, drives others away
  return d;
}
export async function overreachTick() {
  for (const f of F) {
    if (!f.alive || hostile(f) || f.domiri || f.mods?.ff || f.rebelOf != null || f.id === 0 || f.id === 1) continue;
    const ws = systems.filter(s => s.owner === f.id);
    if (ws.length < 4) continue;
    const realm = ws.reduce((t, s) => t + govStr(s), 0);
    let cand = null, best = 0;
    for (const s of ws) {
      const g = s.general;
      if (!g || g.dead || s === f.capital || g === f.ruler || f.heirs.includes(g) || g.captive) continue;
      g.discontent = Math.max(0, Math.min(20, (g.discontent || 0) * 0.6 + grievance(g, f, ws)));
      if (g.discontent < 8) continue;
      // Would he hold? His world + neighbouring worlds whose governors are as sullen as he is
      const mine = govStr(s) + s.links.filter(l => l.owner === f.id && l !== f.capital && (!l.general || (l.general.loyalty ?? 5) < 5)).reduce((t, l) => t + govStr(l), 0);
      const nerve = mine / Math.max(1, realm - mine) + (g.discontent - 8) * 0.05 + (has(g, 'Reckless') ? 0.1 : 0) - (has(g, 'Cautious') ? 0.15 : 0);
      if (nerve >= 0.45 && g.discontent > best) { best = g.discontent; cand = s; }
    }
    if (!cand) continue;
    const g = cand.general;
    // Royal blood with a claim near the ruler's fights for the throne itself; anyone else carves out a kingdom
    const claimant = (g.blood ?? 0) >= 6 && f.ruler && bloodClaim(g, f).v >= bloodClaim(f.ruler, f).v - 3;
    const obeys = () => (g.loyalty ?? 5) + (authority(f.ruler) - 5) * 0.5 + (has(g, 'Cautious') ? 2 : 0) >= g.discontent * 0.6;
    if (f.id === P) {
      const cost = 40 * ws.length;
      const r = await ask(`<h3>${claimant ? '⚔ A Claimant Stirs' : '👑 A Governor Would Be King'}</h3>${portrait(g, 64)}<br>${cl(g)}, governor of <b>${cand.name}</b>, ${claimant ? `says his blood gives him the better right to the throne of ${f.name}` : 'says your realm is too vast to be ruled from one throne'}. His banners are already flying over the docks.<br><small>Loyalty ${g.loyalty} · Discontent ${Math.round(g.discontent)} — grown from his traits, his loyalty, the size of your realm and your ruler's Authority (${authority(F[P].ruler)}). ${obeys() ? 'He would likely obey a recall.' : 'He is unlikely to obey a recall.'}</small>`, [...(F[P].gold >= cost ? [`💰 Grant him estates (${cost})`] : []), '⚔ Let him try', '🏛 Recall him to court']);
      if (r?.startsWith('💰') && pay(cost)) { gain(g, 'loyalty', 3); g.discontent = Math.max(0, g.discontent - 6); maybe(g, 'Greedy', 0.4); hist(g, 'is bought off with rich estates.'); continue; }
      if (r === '🏛 Recall him to court') { if (obeys()) { cand.general = null; g.discontent = Math.max(0, g.discontent - 3); F[P].heirs.includes(g) || station(F[P].capital?.owner === P ? F[P].capital : cand, g); hist(g, 'is recalled to court and obeys — sullenly.'); g.loyalty = Math.max(0, g.loyalty - 1); continue; } log(`👑 ${cl(g)} refuses to be recalled.`); }
    } else if (obeys() && (f.gold || 0) >= 40 * ws.length) { f.gold -= 40 * ws.length; gain(g, 'loyalty', 2); g.discontent = Math.max(0, g.discontent - 6); hist(g, `is bought off by ${f.name} with rich estates.`); continue; }
    // Secession: his world, plus neighbouring worlds whose governors are as sullen (or absent)
    const take = [cand, ...cand.links.filter(l => l.owner === f.id && l !== f.capital && (!l.general || ((l.general.loyalty ?? 5) < 5 && !has(l.general, 'Loyal'))))];
    const r = claimant
      ? newFaction(`Pretender ${g.name}`, 0x999999, f.rel, { gold: 250 }, { rebelOf: f.id, claimFor: f.id })
      : newFaction(`Kingdom of ${cand.name}`, 0xb07030, f.rel, { gold: 200 }, { rogue: true, secOf: f.id });
    r.ruler = g; g.f = r.id; r.heirs = []; r.capital = cand; g.discontent = 0;
    take.forEach(s => { s.owner = r.id; s.siege = null; if (s.general && s.general !== g) { s.general.f = r.id; hist(s.general, `follows ${g.name} into rebellion.`); } });
    S.war.add(key(f.id, r.id));
    hist(g, claimant ? `rises against ${f.name}, claiming its throne by right of blood.` : `rises against ${f.name} and crowns himself King of ${cand.name}.`);
    log(claimant ? `⚔ ${cl(g)} claims the throne of ${f.name}: ${take.map(s => s.name).join(', ')} rise for him!` : `👑 ${cl(g)} rises against ${f.name}: ${take.map(s => s.name).join(', ')} secede as the Kingdom of ${cand.name}!`);
    if (f.id === P) await notify(`<h3>${claimant ? '⚔ Claim War' : '👑 Rebellion'}</h3>${claimant ? `${cl(g)} claims your throne. If he takes your capital or most of the realm, he will be crowned ruler of ${f.name}.` : `${cl(g)} crowns himself King of ${cand.name}.`} ${take.map(s => s.name).join(', ')} follow him into war against you.`);
    checkDead(f.id);
  }
}
// The Grand Tourney: houses send champions to joust in void-skiffs and duel with blades
export async function tourneyTick() {
  if (Math.random() > 0.15) return;
  const hosts = F.filter(f => f.alive && !hostile(f) && !f.domiri && f.capital?.owner === f.id);
  if (!hosts.length) return;
  const host = rnd(hosts);
  const champs = [];
  const evList = TEVENTS.map(e => `${e.ic} ${e.n}`).join(' · ');
  for (const f of F.filter(x => x.alive && !hostile(x) && !x.domiri && !x.mods?.ff && x.id !== 1)) {
    const pool = [...systems.filter(s => s.owner === f.id && s.general).map(s => s.general), ...systems.filter(s => s.owner === f.id).flatMap(s => (s.staff || []).map(id => CH[id])), ...f.heirs]
      .filter((c, i, a) => c && a.indexOf(c) === i && !c.dead && !c.captive && !c.role && !(f.princesses || []).includes(c) && !units.some(u => u.char === c) && c.age >= 16 && c.age < 55 && c !== f.ruler && !c.undying);
    const r0 = f.ruler, rOk = r0 && !r0.dead && !r0.captive && !r0.undying && !r0.fem && r0.age >= 16 && r0.age < 60;
    pool.sort((a, b) => b.skill - a.skill);
    if (rOk && f.id !== P) {
      // An AI ruler rides by temperament: the bold seek glory, the wary stay in the stands
      const t = r0.traits || [], bold = ['Brave', 'Reckless', 'Tourney Champion', 'Ambitious'].some(x => t.includes(x)), wary = ['Cautious', 'Coward', 'Paranoid'].some(x => t.includes(x));
      if (Math.random() < (wary ? 0.05 : bold ? 0.5 : 0.18)) pool.unshift(r0);
    }
    if (f.id === P && rOk) pool.unshift(r0);
    if (!pool.length) continue;
    if (f.id === P) {
      const best = pool.slice(0, 6);
      for (let n = 0; n < 2 && best.length; n++) {
        const r = await ask(`<h3>🏆 The Grand Tourney of ${host.capital.name}</h3>${cl(host.ruler)} of ${host.name} invites every house to send up to <b>two</b> champions.<br><small>Contests: ${evList}.<br>Each contest has its own winner and its own betting book. Placings earn points for the champion's house (10/6/4/3/2/1); the house with the most points is crowned Champion House. No agents or princesses. Jousts, blade bouts, brawls and races can maim or kill.</small>${champs.some(c => c.f === P) ? `<br>Already sent: ${champs.filter(c => c.f === P).map(c => c.name).join(', ')}` : ''}<div class="frow">${best.map(c => card(c, '⚔' + c.skill)).join('')}</div>`, [...best.map(c => c.name), n ? 'No one else' : 'Send no one']);
        const c = best.find(x => x.name === r); if (!c) break;
        champs.push(c); best.splice(best.indexOf(c), 1);
      }
    } else if (Math.random() < 0.65) { champs.push(pool[0]); if (pool[1] && Math.random() < 0.45) champs.push(pool[1]); }
  }
  if (champs.length < 4) return;
  // ---- The betting board: every contest has its own book; odds come from each champion's form in that contest ----
  const fieldOf = e => champs.filter(c => e.fem || !c.fem);
  const price = (c, e) => { const fm = x => Math.exp(e.sc(x) / 2.2), tot = fieldOf(e).reduce((t, x) => t + fm(x), 0); return Math.round(Math.min(15, Math.max(1.2, 0.88 / (fm(c) / tot))) * 10) / 10; };
  const fav = e => [...fieldOf(e)].sort((a, b) => price(a, e) - price(b, e));
  // ---- Shaving points: you cannot buy a win, only a rider willing to lose. Weak, cowardly, greedy or precious-blooded men listen;
  // brave, honest and proud champions throw you out (and may denounce you) ----
  const isHeir = c => (F[c.f]?.heirs || []).includes(c);
  const throwOdds = c => Math.max(0.03, Math.min(0.85, 0.12 + (c.skill <= 3 ? 0.25 : c.skill <= 5 ? 0.1 : c.skill >= 8 ? -0.15 : 0)
    + (has(c, 'Coward') ? 0.25 : 0) + (has(c, 'Greedy') ? 0.2 : 0) + (isHeir(c) ? 0.18 : 0) + (has(c, 'Cautious') ? 0.1 : 0) + ((c.loyalty ?? 6) < 4 ? 0.1 : 0) + (has(c, 'Drunkard') ? 0.08 : 0)
    - (has(c, 'Brave') ? 0.2 : 0) - (has(c, 'Just') || has(c, 'Honest') || has(c, 'Pious') ? 0.15 : 0) - (has(c, 'Tourney Champion') ? 0.25 : 0) - (has(c, 'Reckless') ? 0.05 : 0)));
  const whyThrow = c => [c.skill <= 3 && 'knows he cannot win', has(c, 'Coward') && 'fears the lance', has(c, 'Greedy') && 'loves gold', isHeir(c) && 'will not risk his royal blood', (c.loyalty ?? 6) < 4 && 'owes his house little'].filter(Boolean)[0] || 'might be tempted';
  const throwCost = c => 60 + (c.skill || 0) * 20;
  const bz = [], bets = [];
  // Approach a rider: accepted → he shaves points (−5 to his score); refused → 50% he denounces the briber. Accepted deals leak 20% of the time.
  const approach = (by, c) => {
    const ok = Math.random() < throwOdds(c), ex = ok ? Math.random() < 0.2 : Math.random() < 0.5;
    bz.push({ f: by, c: c.id, k: 'throw', ok, ex });
    if (ex) {
      grudge(host.id, by, -4, 'corrupting the Grand Tourney'); if (c.f !== by) grudge(c.f, by, -3, `trying to buy ${c.name}`);
      if (ok) { c.respect = (c.respect || 0) - 2; hist(c, `is disgraced for selling his bouts at the Grand Tourney of ${host.capital.name}.`); }
      else hist(c, `denounces ${F[by]?.name}'s attempt to buy his bouts at the Grand Tourney of ${host.capital.name}.`);
      log(`😠 ${F[by]?.name} is exposed trying to fix the Grand Tourney of ${host.capital.name}${ok ? ` — ${c.name} took the gold` : ` — ${c.name} refused`}.`);
    }
    return { ok, ex };
  };
  let watched = false; const notes = [];
  if (F[P]?.alive && !hostile(F[P])) {
    const board = [...champs].sort((a, b) => b.skill - a.skill), betOn = new Set();
    let tried = false;
    for (;;) {
      const betOpts = TEVENTS.filter(e => !betOn.has(e.k)).map(e => `🎲 Bet on the ${e.ic} ${e.n}`);
      const thrOpts = tried ? [] : board.filter(c => c.f !== P).slice(0, 4).filter(c => F[P].gold >= throwCost(c)).map(c => `🤫 Ask ${c.name} to shave points (${throwCost(c)} · ${Math.round(throwOdds(c) * 100)}%)`);
      const r = await ask(`<h3>🏆 The Lists at ${host.capital.name}</h3>${champs.length} champions compete before ${cl(host.ruler)} in ${TEVENTS.length} contests, each with its own winner. Every placing earns points for the champion's <b>house</b> (10/6/4/3/2/1); the house with the most points is crowned Champion House.<div class="frow">${board.slice(0, 8).map(c => card(c, `⚔${c.skill} · ${F[c.f]?.name || ''}`)).join('')}</div>${notes.length ? `<div style="font-size:12px">${notes.join('<br>')}</div>` : ''}<small>🎲 Each contest has its own book: one wager per contest.<br>🤫 Gold cannot buy a win, only a champion willing to lose (−3 in every contest). Weak, cowardly or greedy men listen, and so do heirs who will not risk their royal blood. Brave, honest men and proven champions refuse, and half of them denounce you. Even a deal that works leaks out one time in five.</small>`, [...betOpts, ...thrOpts, '👁 Watch the tourney', 'Ignore']);
      const be = TEVENTS.find(e => r === `🎲 Bet on the ${e.ic} ${e.n}`);
      const tc = board.find(c => typeof r === 'string' && r.startsWith(`🤫 Ask ${c.name} `));
      if (be) {
        const b6 = fav(be).slice(0, 6), lab = c => `${c.name} (×${price(c, be)})`;
        const rr = await ask(`<h3>${be.ic} ${be.n}</h3>Who takes it?<div class="frow">${b6.map(c => card(c, `×${price(c, be)} · ${F[c.f]?.name || ''}`)).join('')}</div>`, [...b6.map(lab), 'Back']);
        const bc = b6.find(c => rr === lab(c)); if (!bc) continue;
        const st = await ask(`<h3>🎲 ${bc.name} in the ${be.n}</h3>Odds ×${price(bc, be)}.`, [50, 150, 300].filter(v => F[P].gold >= v).map(v => `${v} credits`).concat('Back'));
        const amt = parseInt(st); if (amt && pay(amt)) { bets.push({ f: P, c: bc.id, k: be.k, amt, odd: price(bc, be) }); betOn.add(be.k); notes.push(`🎲 ${amt} on ${bc.name} in the ${be.n} at ×${price(bc, be)}.`); }
        continue;
      }
      if (tc) {
        if (!pay(throwCost(tc))) continue; tried = true;
        const o = approach(P, tc);
        notes.push(o.ok ? `🤫 ${tc.name} pockets the gold: he ${whyThrow(tc)}. He will shave points.${o.ex ? ' <b>But word has already leaked.</b>' : ''}` : `✋ ${tc.name} refuses${o.ex ? ' and denounces you before the court' : ', and keeps it to himself'}.`);
        continue;
      }
      watched = r !== 'Ignore'; break;
    }
  }
  // AI houses wager on their own rider (pride) or the favourite; scheming rulers try to buy a dangerous rival
  for (const f of F) {
    if (!f?.alive || f.id === P || hostile(f) || !f.ruler || f.gold < 150) continue;
    const r = f.ruler, keen = 0.25 + (has(r, 'Greedy') ? 0.2 : 0) + (has(r, 'Drunkard') ? 0.2 : 0) + (has(r, 'Reckless') ? 0.1 : 0) - (has(r, 'Pious') ? 0.15 : 0);
    for (const e of TEVENTS) {
      if (Math.random() >= keen * 0.5 || f.gold < 100) continue;
      const fl = fav(e), own = fl.find(c => c.f === f.id), pick = own && Math.random() < 0.65 ? own : fl[Math.random() < 0.7 ? 0 : Math.floor(Math.random() * fl.length)];
      const amt = Math.min(f.gold - 50, 40 + Math.floor(Math.random() * (has(r, 'Greedy') || has(r, 'Reckless') ? 160 : 80)));
      if (pick && amt > 0) { f.gold -= amt; bets.push({ f: f.id, c: pick.id, k: e.k, amt, odd: price(pick, e) }); }
    }
    if (Math.random() < 0.04 + (has(r, 'Deceitful') ? 0.08 : 0) + (has(r, 'Greedy') ? 0.04 : 0)) {
      const own = champs.find(c => c.f === f.id), rival = own && [...champs].filter(c => c.f !== f.id).sort((a, b) => b.skill - a.skill)[0];
      if (rival && f.gold >= throwCost(rival)) { f.gold -= throwCost(rival); approach(f.id, rival); }
    }
  }
  const shaved = c => bz.some(b => b.c === c.id && b.ok && !b.ex);
  // ---- The contests: each is scored on its own skills; points decide the Grand Championship ----
  const PTS = [10, 6, 4, 3, 2, 1], pts = new Map(champs.map(c => [c, 0])), hp = new Map(), ev = [], hurts = [];
  for (const e of TEVENTS) {
    const field = champs.filter(c => (e.fem || !c.fem) && !c.dead && !hurts.some(h => h.c === c)); // the maimed ride no more
    if (field.length < 2) continue;
    const s = new Map(field.map(c => [c, e.sc(c) + Math.random() * 6 - (shaved(c) ? 3 : 0)]));
    field.sort((a, b) => s.get(b) - s.get(a));
    field.forEach((c, i) => { pts.set(c, pts.get(c) + (PTS[i] || 0)); hp.set(c.f, (hp.get(c.f) || 0) + (PTS[i] || 0)); });
    const rec = { k: e.k, r: field.slice(0, 6).map(c => c.id), w: field[0].id, wf: field[0].f };
    hist(field[0], `wins the ${e.n} at the Grand Tourney of ${host.capital.name}.`); gain(field[0], 'respect');
    if (e.k === 'joust' || e.k === 'blade') addTrait(field[0], 'Tourney Champion');
    // Blood in the lists: a slack (bribed) rider is far likelier to be the one hurt
    if (e.risk && field.length > 2 && hurts.length < 2) {
      const slackers = field.filter(c => shaved(c) && Math.random() < 0.5);
      if (Math.random() < e.risk * (slackers.length ? 1.8 : 1) * (field.some(c => has(c, 'Reckless') || has(c, 'Bloodthirsty')) ? 1.3 : 1)) {
        const cands = field.slice(1), victim = rnd(cands.flatMap(c => slackers.includes(c) ? [c, c, c, c] : (has(c, 'Reckless') ? [c, c] : [c])));
        const sl = slackers.includes(victim), above = field.slice(0, field.indexOf(victim));
        const by = e.k === 'race' ? null : (above.length ? rnd(above) : field[0]);
        const died = Math.random() < (sl ? 0.45 : e.k === 'race' ? 0.3 : 0.2);
        Object.assign(rec, { hurt: victim.id, by: by?.id, died, sl });
        hurts.push({ c: victim, by, died, sl, e });
      }
    }
    ev.push(rec);
  }
  champs.sort((a, b) => pts.get(b) - pts.get(a) || b.skill - a.skill);
  const w = champs[0]; // best individual showing
  const houses = [...hp.entries()].sort((a, b) => b[1] - a[1]), hf = houses[0]?.[0] ?? w.f;
  bz.forEach(b => { b.won = ev.some(r => r.w === b.c); });
  // Settle the wagers, contest by contest
  for (const b of bets) {
    const r = ev.find(x => x.k === b.k);
    b.won = !!r && r.w === b.c; if (!b.won) continue;
    const purse = Math.round(b.amt * b.odd); F[b.f].gold += purse; b.pay = purse;
    if (b.f !== P && purse >= 400) log(`🎲 ${F[b.f].name} wins ${purse} credits betting on ${CH[b.c]?.name} in the ${TEVENTS.find(e => e.k === b.k)?.n}.`);
  }
  const mine = bets.filter(b => b.f === P);
  if (Math.random() < 0.6) addAnc(w, rnd(['Squire', 'Court Herald']));
  champs.forEach(c => hist(c, `competes for ${F[c.f]?.name} at the Grand Tourney of ${host.capital.name} (${pts.get(c)} pts).`));
  grudge(host.id, hf, 2, `glory at the Grand Tourney`);
  const first = hurts.find(h => h.died) || hurts[0];
  wikiAct('tourney', { a: w.id, f: w.f, h: host.id, s: host.capital.i, n: champs.length, rv: champs.slice(1, 4).map(c => c.id), all: champs.map(c => c.id), af: champs.map(c => c.f), pts: champs.map(c => pts.get(c)), ev, hf, hp: houses,
    hurt: first?.c.id, by: first?.by?.id, died: !!first?.died, sl: !!first?.sl, br: bz.some(b => b.ok && !b.ex), bz, bets });
  // Blood in the lists: wounds and deaths, each named by contest and by the hand that dealt it
  const lines = [];
  for (const h of hurts) {
    const v = h.c, k = h.by, how = h.e.hurt;
    if (h.sl) hist(v, `rides slack in the ${h.e.n} at ${host.capital.name}, holding back for a bribe — and leaves ${v.fem ? 'herself' : 'himself'} open.`);
    if (h.died) {
      hist(v, k ? `is killed in the ${h.e.n} at ${host.capital.name} by ${k.name}.` : `is killed in the ${h.e.n} at ${host.capital.name} — ${how}.`);
      if (k) { hist(k, `kills ${v.name} in the ${h.e.n} at ${host.capital.name}.`); if (k.f !== v.f) grudge(v.f, k.f, -4, `${k.name} slew ${v.name} at the Grand Tourney`); }
      lines.push(`☠ ${cl(v)} is killed in the ${h.e.ic} ${h.e.n}${k ? ` by ${cl(k)}` : ` — ${how}`}.${h.sl ? ' <i>Holding back for the bribe, the guard was down.</i>' : ''}`);
      if (setFate(v, 'dead')) await succession(v.f, 'has died');
    } else {
      wound(v); hist(v, `is badly wounded in the ${h.e.n} at ${host.capital.name}${k ? ` by ${k.name}` : ` — ${how}`}.`);
      lines.push(`🩸 ${cl(v)} is badly wounded in the ${h.e.ic} ${h.e.n}${k ? ` by ${cl(k)}` : ` — ${how}`}.`);
    }
  }
  log(`🏆 ${F[hf]?.name} is crowned Champion House of the Grand Tourney of ${host.capital.name} (${hp.get(hf)} pts, ${champs.length} champions; ${ev.map(r => `${TEVENTS.find(e => e.k === r.k)?.ic} ${CH[r.w]?.name}`).join(', ')})${hurts.length ? `; ${hurts.map(h => `${h.c.name} ${h.died ? 'slain' : 'hurt'} in the ${h.e.n}`).join(', ')}` : ''}.`);
  if (watched || champs.some(c => c.f === P)) {
    const evRows = ev.map(r => { const e = TEVENTS.find(x => x.k === r.k); return `${e.ic} <b>${e.n}</b>: ${CH[r.w]?.name}${CH[r.w]?.f === P ? ' ⭐' : ''}`; }).join('<br>');
    const table = houses.slice(0, 8).map(([fid, p], i) => `${i + 1}. ${F[fid]?.name} — ${p} pts${fid === P ? ' ⭐' : ''}`).join('<br>');
    const betTxt = mine.map(b => { const e = TEVENTS.find(x => x.k === b.k); return b.won ? `<br>🎲 ${e?.ic} Your ${b.amt} on ${CH[b.c]?.name} pays <b>${b.pay}</b>!` : `<br>🎲 ${e?.ic} Your ${b.amt} on ${CH[b.c]?.name} is lost.`; }).join('');
    await notify(`<h3>🏆 The Grand Tourney</h3><b>${F[hf]?.name}</b> is crowned Champion House.<div style="font-size:12px;margin:6px 0">${evRows}</div><div class="flab">House standings</div><div style="font-size:12px">${table}</div>${betTxt}${bz.filter(b => b.f === P && b.ok).map(b => `<br>🤫 ${CH[b.c]?.name} ${b.ex ? 'was exposed and rode honestly' : 'shaved points as promised'}.`).join('')}${lines.length ? `<br>${lines.join('<br>')}` : ''}`);
  }
}
// The contests of the Grand Tourney. sc(c) = expected score before a 0–6 roll; fem = open to ladies; risk = chance of blood
const tr = (c, t, n) => (has(c, t) ? n : 0);
export const TEVENTS = [
  { k: 'joust', n: 'Void-Skiff Joust', ic: '🛸', risk: 0.16, hurt: 'thrown from the skiff at speed', sc: c => c.skill + tr(c, 'Brave', 1.5) + tr(c, 'Reckless', 1) - tr(c, 'Coward', 2) + tr(c, 'Tourney Champion', 1) },
  { k: 'blade', n: 'Starblade Circle', ic: '⚔', risk: 0.14, hurt: 'cut down in the circle', sc: c => c.skill + (c.starblade ? 3 : 0) + tr(c, 'Brave', 1) - tr(c, 'Coward', 2) - (c.age >= 45 ? 1 : 0) },
  { k: 'race', n: 'Asteroid Ring Race', ic: '☄', fem: true, risk: 0.12, hurt: 'the skiff struck a tumbling rock', sc: c => c.skill * 0.8 + tr(c, 'Reckless', 2) + tr(c, 'Vigilant', 1.5) - tr(c, 'Cautious', 1) - tr(c, 'Drunkard', 2) + (c.age < 30 ? 1 : 0) },
  { k: 'gun', n: 'Blaster Gallery', ic: '🎯', fem: true, risk: 0, sc: c => c.skill * 0.8 + tr(c, 'Vigilant', 2) + tr(c, 'Heirloom Blaster', 2) - tr(c, 'Drunkard', 2) - tr(c, 'Spice Addict', 1) },
  { k: 'grav', n: 'Grav-Pit Brawl', ic: '🥊', risk: 0.1, hurt: 'beaten senseless in the pit', sc: c => (c.violence ?? 5) * 0.6 + c.skill * 0.4 + tr(c, 'Brave', 1) + tr(c, 'Bloodthirsty', 1.5) + tr(c, 'Monstrous', 2) - (c.age >= 40 ? 1 : 0) },
  { k: 'war', n: 'Holo-Wargame', ic: '♟', fem: true, risk: 0, sc: c => ((c.admin ?? 4) + c.skill) / 2 + tr(c, 'Cautious', 1) + tr(c, 'Vigilant', 1) - tr(c, 'Reckless', 1) - tr(c, 'Drunkard', 1) + (c.age >= 35 ? 1 : 0) },
];
// Harvests answer to governors: an able steward grows his world rich, a drunk or idle one lets the granaries rot
export function harvestTick() {
  for (const s of systems) {
    const g = s.general;
    if (s.owner < 0 || !g || g.dead || Math.random() > 0.05) continue;
    const adm = g.admin ?? g.skill ?? 0;
    const good = adm >= 7 || has(g, 'Builder'), bad = adm <= 2 || has(g, 'Drunkard') || has(g, 'Indolent') || has(g, 'Squanderer');
    if (good === bad) continue;
    if (good) { s.income = Math.min(400, s.income + ri(3, 8)); hist(g, `oversees a bountiful harvest at ${s.name}.`); }
    else { s.income = Math.max(20, s.income - ri(4, 10)); s.legions = Math.max(0, s.legions - 1); hist(g, `neglects the granaries of ${s.name}; famine follows.`); }
    log(good ? `🌾 ${g.name}'s stewardship brings a bountiful harvest to ${s.name}.` : `🥀 Famine at ${s.name} under ${g.name}: the hungry desert the garrison.`);
    if (s.owner === P) toast(good ? `🌾 Bountiful harvest at ${s.name} (${g.name})` : `🥀 Famine at ${s.name} — ${g.name} neglects it`, good);
  }
}
export async function midEvents() {
  try { await plagueTick(); } catch (e) { console.error(e); }
  try { await overreachTick(); } catch (e) { console.error(e); }
  try { await tourneyTick(); } catch (e) { console.error(e); }
  try { harvestTick(); } catch (e) { console.error(e); }
}
