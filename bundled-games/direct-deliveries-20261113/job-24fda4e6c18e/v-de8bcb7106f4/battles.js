// ---- Battles (module split stage 8): fight wrapper, battle core, text battle command, after-action report ----
// main.js-owned helpers are injected once via initBattles(hooks) and bound to module-level names,
// so the battle code below reads exactly as it did in main.js.
import { tacticalBattle } from './tactical.js';
import { wikiBattle, wikiFate } from './wiki.js';
import { S, F, CH, systems, units, P } from './state.js';

let setCurBattle, battleName, reinforcers, rPow, rName, hist, clamp, battleXP, ships, landCount, roScale, removeUnit,
  playSfx, sfx, portrait, detachGen, atBattle, seizeBlade, succession, nmFriend, nmJustice, fealtyOdds, acceptFealty, exileToNM,
  pct, ask, notify, hexCol, grudge, apoc, cl, st, maybe, note, SET, spaceSquads, landSquads, loseGen, persona, has, rnd, gain, wound, enslave, enslaveOk, banish, geo;
export function initBattles(h) {
  ({ setCurBattle, battleName, reinforcers, rPow, rName, hist, clamp, battleXP, ships, landCount, roScale, removeUnit,
    playSfx, sfx, portrait, detachGen, atBattle, seizeBlade, succession, nmFriend, nmJustice, fealtyOdds, acceptFealty, exileToNM,
    pct, ask, notify, hexCol, grudge, apoc, cl, st, maybe, note, SET, spaceSquads, landSquads, loseGen, persona, has, rnd, gain, wound, enslave, enslaveOk, banish, geo } = h);
}
// ---- Battle analysis: terrain, commanders' traits and the forces' edges, so every result can be explained ----
// Terrain multiplies the punch of a stance (agg/def/man) for whoever uses it; amb = ambush (nebula / night raid) odds.
export const TERRAIN = {
  space: {
    'Gas Giant': { man: 1.2, amb: 0.1, n: 'storm bands and rings hide ships: manoeuvres and ambushes thrive' },
    'Ice World': { def: 1.15, n: 'ice rings shelter a fleet that holds formation' },
    'Crystal World': { amb: 0.12, man: 1.1, n: 'shard fields scatter sensors: ambushes thrive' },
    'Volcanic World': { agg: 1.1, n: 'ash and heat blind targeting: close, aggressive fighting pays' },
    'Ecumenopolis': { def: 1.15, n: 'orbital platforms and traffic shield a defensive line' },
  },
  land: {
    'Desert World': { man: 1.2, def: 0.9, n: 'open dunes: flanking pays, trenches fill with sand' },
    'Jungle World': { man: 1.2, agg: 0.85, amb: 0.15, n: 'thick canopy: charges bog down, raids and flanks thrive' },
    'Ocean World': { agg: 0.85, def: 1.15, n: 'island beachheads: assaults are costly, defenders dig in' },
    'Ice World': { def: 1.2, agg: 0.9, n: 'frozen ridges: defenders hold, charges stall in the snow' },
    'Volcanic World': { agg: 1.1, def: 0.9, n: 'lava fields break up lines: aggression pays' },
    'Ecumenopolis': { def: 1.25, man: 1.1, agg: 0.85, n: 'endless city blocks: every street a fortress' },
    'Crystal World': { def: 1.1, n: 'crystal spires make natural bastions' },
    'Gas Giant': { def: 1.2, agg: 0.9, n: 'floating cities: few landing zones, defenders hold' },
    'Garden World': { n: 'open fields: no side favoured' },
  },
};
const trt = (c, t) => !!c?.traits?.includes(t);
export function battleTerrain(ctx, kind) {
  const at = ctx?.at || (ctx?.D && systems.includes(ctx.D) ? ctx.D : ctx?.D?.sys) || null;
  let type = null; try { type = at ? (at.ptype || geo(at)?.type) : null; } catch (e) {}
  return { at, type, T: (type && TERRAIN[kind]?.[type]) || null };
}
// Commander traits shape how well each stance is executed
const traitMul = (g, typ) => !g ? 1 : (typ === 'agg' && trt(g, 'Reckless') ? 1.15 : 1) * (typ === 'agg' && trt(g, 'Bloodthirsty') ? 1.1 : 1) * (typ === 'def' && trt(g, 'Cautious') ? 1.15 : 1) * (typ === 'man' && trt(g, 'Vigilant') ? 1.1 : 1) * (trt(g, 'Drunkard') ? 0.92 : 1);
// Where a side's strength comes from (mirrors spacePow/landPow + battle context)
export function powWhy(o, kind) {
  if (!o) return [];
  const out = [], g = o.general || o.captain, f = F[o.owner], T = t => !!f?.tech?.includes(t);
  out.push(kind === 'space' ? `${o.fleet || 0} warships` : `${o.legions || 0} legions${o.elite ? ` + ${o.elite} elite` : ''}`);
  if (o.ro && Object.keys(o.ro).length) out.push('special units');
  if (g) {
    out.push(`${o.general ? 'General' : 'Captain'} ${g.name}: skill ${g.skill || 0} (+${Math.round((g.skill || 0) * 8)}%)`);
    const rs = Math.min(10, Math.abs(g.respect || 0)); if (rs) out.push(`${(g.respect || 0) < 0 ? 'dread' : 'respect'} +${rs}%`);
    if (trt(g, 'Reckless')) out.push('Reckless +10% (and harder charges)');
    if (trt(g, 'Cautious')) out.push('Cautious −5% (but steadier defence)');
    if (kind === 'land' && o.general?.starblade) out.push('✨ Starblade +25%');
    else if (o.general?.starblade) out.push('✨ Starblade (duels)');
  } else out.push('no commander');
  if (f?.bloodEmpire && kind === 'space') out.push('Blood Empire +20%');
  if (kind === 'land' && f?.mods?.warrior) out.push('warrior people +25%'); else if (kind === 'land' && f?.mods?.might) out.push('martial house +15%');
  [['Laser Weapons', 'space', 15], ['Cloaking', 'space', 10], ['Plasma Weapons', 'land', 20], ['Bodyshields', 'land', 15], ['Aether Shield', 'land', 25], ['Necronomicon', null, 50]].forEach(([t, k, v]) => { if ((!k || k === kind) && T(t)) out.push(`${t} +${v}%`); });
  if (kind === 'space' && o.b?.has('Space Station')) out.push('Space Station +40%');
  if (kind === 'land' && o.b?.has('Shield World')) out.push('Shield World ×2');
  return out;
}
function ctxWhy(ctx, pa) {
  const out = [];
  if (!ctx) return out;
  if (ctx.station) out.push(`🛰 the defenders fight under their orbital station`);
  if (ctx.kind === 'land' && ctx.D && systems.includes(ctx.D)) out.push(`🏰 the defenders fight from their fortifications (+25%${ctx.D.lv?.Barracks ? `, barracks Lv ${ctx.D.lv.Barracks}` : ''})${trt(ctx.A?.general, 'Siege Engineer') || ctx.A?.general?.anc?.includes?.('Siege Engineer') ? ' — blunted by a Siege Engineer (−20%)' : ''}`);
  if (ctx.siegeK && ctx.siegeK < 1) out.push(`⛓ the siege has worn the garrison down (${Math.round((1 - ctx.siegeK) * 100)}% weaker)`);
  if (ctx.holy && ctx.holy !== 1) out.push(`✝ holy fervour drives the attackers (×${ctx.holy})`);
  const nA = ctx.rA?.length || 0, nD = ctx.rD?.length || 0;
  if (nA || nD) out.push(`➕ reinforcements: ${pa ? nA : nD} with you, ${pa ? nD : nA} with the enemy`);
  return out;
}

export async function fight(a, d, inter, pa, label, ctx) {
  setCurBattle(battleName(label));
  if (ctx?.at && !ctx.rA) {
    const kind = ctx.kind || 'space';
    ctx.rA = reinforcers(ctx.A, ctx.at, kind);
    ctx.rD = reinforcers(ctx.D, ctx.at, kind).filter(x => x.sys !== ctx.at || kind === 'land'); // enemy fleets in orbit fight their own battles
    a += rPow(ctx.rA, ctx.at, kind); d += rPow(ctx.rD, ctx.at, kind);
    const mineR = pa ? ctx.rA : ctx.rD, theirR = pa ? ctx.rD : ctx.rA;
    ctx.rNote = (mineR.length ? `<div class="bt-scout">➕ Reinforcing you: ${mineR.map(rName).join(', ')}</div>` : '') + (theirR.length ? `<div class="bt-scout" style="border-color:#a04040">➕ Enemy reinforcements: ${theirR.map(rName).join(', ')}</div>` : '');
    mineR.concat(theirR).forEach(x => { if (x.general) hist(x.general, `marches to reinforce the battle at ${ctx.at.name}.`); });
  }
  const foeBefore = ctx ? (pa ? ctx.D : ctx.A)?.general : null, myBefore = ctx ? (pa ? ctx.A : ctx.D)?.general : null;
  let r;
  try { r = await fightCore(a, d, inter, pa, label, ctx); }
  catch (e) { console.error('Battle failed, auto-resolving', e); const k = a / Math.max(1, a + d); r = { win: Math.random() < k, a: clamp(0.4 + k * 0.5, 0, 1), d: clamp(0.9 - k * 0.5, 0, 1) }; }
  // Victors lose far less: half the casualties, plus a little slack so small stacks aren't rounded away
  if (r && !r.fled) {
    const ease = k => clamp(1 - (1 - k) * 0.5 + 0.05, 0, 1);
    if (r.win) r.a = ease(r.a); else r.d = ease(r.d);
  }
  // Reinforcements share the losses of their side
  if (ctx?.rA) {
    const hit = (x, k) => { if (ctx.kind === 'land') { x.legions = Math.floor(x.legions * k); x.elite = Math.floor(x.elite * k); roScale(x, 'land', k); } else { x.fleet = Math.floor(x.fleet * k); roScale(x, 'space', k); } /* fleets left with no ships are wrecked by wreckSweep() on the next refresh (commander escapes to the reserve) */ };
    ctx.rA.forEach(x => hit(x, r.a)); ctx.rD.forEach(x => hit(x, r.d));
    (r.win ? ctx.rA : ctx.rD).forEach(x => battleXP(x.general, true));
  }
  // Archive for the Wiki
  try {
    if (ctx?.A || ctx?.D) {
      const kind = ctx.kind || (/GROUND|LAND/i.test(label) ? 'land' : 'space');
      wikiBattle({ y: S.year, n: (battleName(label) || '').replace(/^the /, '').replace(/ \(orbit\)$/, '') || null, at: ctx.at?.i ?? ctx.D?.sys?.i ?? ctx.D?.i ?? null, k: kind, a: ctx.A?.owner ?? -1, d: ctx.D?.owner ?? -1,
        ga: (pa ? myBefore : foeBefore)?.id ?? null, gd: (pa ? foeBefore : myBefore)?.id ?? null,
        ca: ctx.A?.captain?.name || null, cd: ctx.D?.captain?.name || null,
        pa: Math.round(a), pd: Math.round(d), cap: !!(ctx.D && systems.includes(ctx.D) && F[ctx.D.owner]?.capital === ctx.D), holy: !!(ctx.at || ctx.D)?.holy,
        w: r.win ? 'a' : 'd', la: Math.round((1 - r.a) * 100), ld: Math.round((1 - r.d) * 100), fled: !!r.fled,
        pt: battleTerrain(ctx, kind).type || null,
        // The commanders' decisions, phase by phase (text battles; seen from the player's side jp)
        ...(r.journal?.length ? { jp: pa ? 'a' : 'd', j: r.journal.slice(0, 14).map(j => j.end ? { e: j.end } : { o: j.o.replace(/^\S+\s/, ''), t: j.typ, s: j.st, w: j.why, v: j.verdict, m: (j.mods || []).slice(0, 4), d: j.dealt, k: j.took }) } : {}),
        ga0: (pa ? myBefore : foeBefore)?.traits?.filter(t => /Reckless|Cautious|Brave|Coward|Vigilant|Drunkard|Bloodthirsty|Hero/.test(t)) || null,
        gd0: (pa ? foeBefore : myBefore)?.traits?.filter(t => /Reckless|Cautious|Brave|Coward|Vigilant|Drunkard|Bloodthirsty|Hero/.test(t)) || null });
    }
  } catch (e) {}
  if (inter) { try { await battleReport(r, pa, label, ctx, myBefore, foeBefore); } catch (e) { console.error(e); } }
  return r;
}
// ---- After-action report: outcome, losses, and the fate of the enemy commander ----
export async function battleReport(r, pa, label, ctx, myG, foeG) {
  const won = pa ? r.win : !r.win, myLeft = pa ? r.a : r.d, foeLeft = pa ? r.d : r.a;
  const myLoss = Math.round((1 - myLeft) * 100), foeLoss = Math.round((1 - foeLeft) * 100);
  const title = won ? (foeLoss >= 70 && myLoss <= 35 ? 'Decisive Victory' : myLoss >= 60 ? 'Pyrrhic Victory' : foeLoss - myLoss < 15 ? 'Narrow Victory' : 'Victory') : (r.fled ? 'Withdrawal' : myLoss >= 70 && foeLoss <= 35 ? 'Crushing Defeat' : foeLoss >= 60 ? 'Costly Defeat' : 'Defeat');
  const mine = ctx ? (pa ? ctx.A : ctx.D) : null, theirs = ctx ? (pa ? ctx.D : ctx.A) : null;
  playSfx(won ? 'win' : 'lose');
  const kind = ctx?.kind || (/GROUND|LAND/i.test(label) ? 'land' : 'space');
  const units0 = (o, left) => { if (!o) return ''; const n = x => Math.round((x || 0) * left); return (kind === 'space' ? [o.fleet ? `${n(o.fleet)} of ${o.fleet} ships` : ''] : [o.legions ? `${n(o.legions)} of ${o.legions} legions` : '', o.elite ? `${n(o.elite)} of ${o.elite} elite` : '']).filter(Boolean).join(' · '); };
  const side = (nm, col, loss, g, o) => { const u = units0(o, 1 - loss / 100); return `<div class="br-side"><div class="br-name" style="color:${col}">${nm}</div>${g ? portrait(g, 54) : ''}<div class="br-g">${g ? g.name + (g.dead ? ' <small>(slain)</small>' : '') : o?.captain ? `${o.captain.name} <small>(captain)</small>` : '<i>No commander</i>'}</div><div class="br-loss"><div style="width:${100 - loss}%"></div></div><small>Losses <b>${loss}%</b>${u ? `<br>${u} survive` : ''}</small></div>`; };
  const myF = F[P], foeF = F[theirs?.owner ?? -1];
  let fate = '', opts = ['Continue'], fealty = null;
  // Fate of the enemy general: on victory he may escape, fall, or be taken alive
  const g = won && foeG && !foeG.dead && !foeG.undying && foeG._handled !== S.turn && foeG.f !== P && !foeG.captive && !S.prisoners.includes(foeG) && foeG.exiledBy == null ? foeG : null;
  if (g) {
    const esc = clamp(0.25 + g.skill * 0.03 - (myG?.skill || 0) * 0.02 + (r.fled ? 0.3 : 0), 0.1, 0.65), slain = 0.2;
    const roll = Math.random();
    detachGen(g); g._handled = S.turn;
    const wasRuler = F[g.f]?.ruler === g;
    if (roll < esc) {
      fate = `<div class="br-fate"><b>${g.name}</b> escapes in the chaos and flees to ${F[g.f]?.name || 'the dark'}.</div>`;
      const home = systems.find(s => s.owner === g.f && !s.general); if (home) home.general = g;
      hist(g, `escapes the rout${atBattle()}.`);
    } else if (roll < esc + slain) {
      try { wikiFate(g, 'died', P, myG ? `cut down in the rout by the forces of ${myG.name}` : 'cut down in the rout'); } catch (e) {}
      g.dead = true; hist(g, `is slain${atBattle()}.`);
      fate = `<div class="br-fate"><b>${g.name}</b> falls in the fighting. His body is recovered from the wreckage.</div>${seizeBlade(g, myG)}`;
      if (wasRuler) await succession(g.f, 'was slain in battle');
    } else if (g.oathbroken && nmFriend(P)) {
      const bl = seizeBlade(g, myG);
      nmJustice(g, P);
      fate = `<div class="br-fate"><b>${g.name}</b> is taken alive — an oathbreaker of the Nightfleet. By the law of the Watch, he is put to death.</div>${bl}`;
      if (wasRuler) await succession(g.f, 'was executed as an oathbreaker');
    } else {
      fealty = fealtyOdds(g, P);
      fate = `<div class="br-fate"><b>${g.name}</b> is taken alive and brought before you in chains.</div>${seizeBlade(g, myG)}<small style="display:block;text-align:left;opacity:.85;margin-top:4px">⚔ <b>Accept Fealty</b>: he swears to your house and serves as your general (he may refuse — then he is imprisoned).${g.age < 21 ? '<br>🏰 <b>Take as Ward</b>: raise this young noble at your court as a hostage-son. His house will think twice before attacking you, and once he comes of age he may swear himself to you.' : ''}<br>⛓ <b>Imprison</b>: hold him to ransom, judge him later at court.</small>`;
      opts = ['Imprison', 'Ransom now (+150)', ...(!wasRuler ? [`⚔ Accept Fealty · ${pct(fealty.p)}%`] : []), ...(F[1]?.alive && P !== 1 && g.f !== 1 ? ['Exile to the Nightfleet'] : []), ...(g.age < 21 ? ['Take as Ward'] : []), ...(!wasRuler ? ['🚪 Banish'] : []), ...(!wasRuler && enslaveOk(P) ? ['⛓ Enslave'] : []), 'Execute'];
    }
  }
  const myCol = hexCol(myF?.color), foeCol = hexCol(foeF?.color ?? 0x888888);
  const c = await ask(`<div class="br ${won ? 'win' : 'lose'}"><div class="br-title">${title}</div><div class="br-sub">${label}${r.rounds ? ` · ${r.rounds} phase${r.rounds > 1 ? 's' : ''}` : ''}</div>
    ${r.last ? `<div class="bt-last">${r.last}</div>` : ''}
    <div class="br-sides">${side(myF?.name || 'You', myCol, myLoss, myG, mine)}<div class="br-vs">VS</div>${side(foeF?.name || 'Enemy', foeCol, foeLoss, foeG, theirs)}</div>
    ${(() => { try { return whyHtml(r, pa, ctx, kind, won); } catch (e) { console.error(e); return ''; } })()}
    ${fate}${myG && !myG.dead && won && myLoss < 50 ? `<div class="bt-n">${myG.name}'s reputation grows.</div>` : ''}</div>`, opts);
  if (!g || opts.length === 1) return;
  const hf = g.f, wasRuler = F[hf]?.ruler === g;
  if (c === 'Imprison') { S.prisoners.push(g); g.captive = { by: P, y: S.year }; hist(g, `is captured${atBattle()} and thrown in chains by ${F[P].name}.`); }
  if (c === 'Ransom now (+150)') { F[P].gold += 150; grudge(hf, P, 2, `the ransom of ${g.name}`); const home = systems.find(s => s.owner === hf && !s.general); if (home) home.general = g; else F[hf]?.heirs.push(g); hist(g, `is captured${atBattle()} and ransomed home for 150 credits.`); }
  if (c === 'Exile to the Nightfleet') { hist(g, `is captured${atBattle()}.`); exileToNM(g, P); grudge(hf, P, 1); apoc(-1, 'mercy'); }
  if (c === 'Take as Ward') { S.wards.push(g); g.wardY = S.year; hist(g, `is captured${atBattle()} and taken as a ward of ${F[P].name}.`); }
  if (c === '🚪 Banish') { hist(g, `is captured${atBattle()}.`); banish(g, P, 'stripped of his command and forbidden his home'); }
  if (c === '⛓ Enslave') { hist(g, `is captured${atBattle()}.`); if (enslave(g, P, `is sold into slavery by ${F[P].name}`)) { apoc(4, 'enslavement'); st(P, -1, 'enslavement'); if (F[P].ruler) F[P].ruler.respect = (F[P].ruler.respect || 0) - 1; } }
  if (c?.startsWith('⚔ Accept Fealty')) {
    if (Math.random() < fealty.p) { acceptFealty(g, P); await notify(`${portrait(g, 70)}<b>${g.name}</b> kneels and swears fealty to ${F[P].name}. He waits in the reserve at your capital — assign him to a fleet or a world.`); }
    else { S.prisoners.push(g); g.captive = { by: P, y: S.year }; hist(g, `refuses to bend the knee${atBattle()} and is thrown in chains by ${F[P].name}.`); await notify(`${portrait(g, 70)}<b>${g.name}</b> spits at your feet and refuses. He is imprisoned.`); }
  }
  if (c === 'Execute') {
    try { wikiFate(g, 'died', P, `taken alive and executed after the battle by order of ${F[P].ruler?.name || F[P].name}`); } catch (e) {}
    g.dead = true; hist(g, `is captured${atBattle()} and executed by order of ${cl(F[P].ruler)}.`);
    grudge(hf, P, -8, `the execution of ${g.name}`); apoc(3, `execution of ${g.name}`); st(P, -1, 'execution'); maybe(F[P].ruler, 'Cruel', 0.3);
    [...(g.kids || []), g.father].map(i => CH[i]).filter(k => k && !k.dead && k.f === hf).forEach(k => { k.vendetta = P; note(k, `swears a blood vendetta against ${F[P].name} for the execution of ${g.name}.`); });
  }
  if (wasRuler && c !== 'Ransom now (+150)') await succession(hf, 'was captured in battle');
}
export async function fightCore(a, d, inter, pa, label, ctx) {
  let A = Math.max(a, 1), D = Math.max(d, 1);
  const a0 = A, d0 = D;
  let mode = 'Auto-Resolve';
  const kind = ctx?.kind || (/GROUND|LAND/i.test(label) ? 'land' : 'space');
  if (ctx) try { ctx._why = { A: powWhy(ctx.A, kind), D: powWhy(ctx.D, kind) }; } catch (e) {} // snapshot before losses/captures
  const pref = (kind === 'space' ? SET.fleetB : SET.landB) === 'Text' || !ctx ? '📜 Command the Battle' : 'Fight Tactically';
  if (inter) mode = await ask(`<h3>${label}</h3>Your strength ${Math.round(pa ? A : D)} vs enemy ${Math.round(pa ? D : A)}<br><small>${kind === 'space' ? '🚀 Space battle: volleys, torpedo runs, nebula ambushes, ion barrages, boarding actions.' : '🪖 Ground battle: barrages, charges, shield walls, flanking, duels with your general.'}<br>Battle style can be changed in ⚙ Settings.</small>${ctx?.rNote || ''}`, [pref, 'Auto-Resolve']);
  sfx(kind === 'space' ? 'laser' : 'clash');
  if (mode === '📜 Command the Battle') {
    const r = await textBattle(A, D, pa, label, kind, ctx);
    A = Math.max(0, r.A); D = Math.max(0, r.D);
    return { win: r.aWin, fled: r.fled, rounds: r.rounds, last: r.last, journal: r.journal, a0, d0, a: clamp(A / a0, 0, 1), d: clamp(D / d0, 0, 1) };
  }
  if (mode === 'Fight Tactically' && ctx) {
    const side = o => ({ name: F[o.owner]?.name || 'Rebels', color: hexCol(F[o.owner]?.color ?? 0x666677) });
    const As = ctx.kind === 'space' ? spaceSquads(ctx.A, 'A', false) : landSquads(ctx.A, 'A', false);
    const Ds = ctx.kind === 'space' ? spaceSquads(ctx.D, 'D', ctx.station) : landSquads(ctx.D, 'D', true);
    const extra = (list, sd) => (list || []).flatMap(x => ctx.kind === 'space' ? spaceSquads(x, sd, !!x._gar) : landSquads(x, sd, false)).slice(0, 7);
    As.push(...extra(ctx.rA, 'A')); Ds.push(...extra(ctx.rD, 'D'));
    if (ctx.holy) As.forEach(s => { s.atk *= ctx.holy; });
    if (ctx.siegeK) Ds.forEach(s => { s.hp = Math.max(1, Math.round(s.hp * ctx.siegeK)); s.maxhp = s.hp; });
    if (As.length && Ds.length) {
      let r;
      try { r = await tacticalBattle({ kind: ctx.kind, title: label, A: { ...side(ctx.A), squads: As }, D: { ...side(ctx.D), squads: Ds }, player: pa ? 'A' : 'D' }); }
      catch (e) { console.error('Tactical battle failed — switching to battle command', e); document.getElementById('tac')?.remove(); const t = await textBattle(A, D, pa, label, kind, ctx); return { win: t.aWin, fled: t.fled, rounds: t.rounds, last: t.last, a: clamp(Math.max(0, t.A) / a0, 0, 1), d: clamp(Math.max(0, t.D) / d0, 0, 1) }; }
      if (r.aGenLost && ctx.A.general) await loseGen(ctx.A, ctx.D.owner);
      if (r.dGenLost && ctx.D.general) await loseGen(ctx.D, ctx.A.owner);
      return { win: r.win, a: r.a, d: r.d };
    }
  }
  if (mode === 'Auto-Resolve') {
    for (let i = 0; i < 8 && A > a0 * 0.3 && D > d0 * 0.3; i++) {
      const x = A, y = D;
      D -= x * (0.1 + Math.random() * 0.15);
      A -= y * (0.1 + Math.random() * 0.15);
    }
  } else {
    const r = await textBattle(A, D, pa, label, kind, ctx);
    return { win: r.aWin, fled: r.fled, rounds: r.rounds, last: r.last, journal: r.journal, a0, d0, a: clamp(Math.max(0, r.A) / a0, 0, 1), d: clamp(Math.max(0, r.D) / d0, 0, 1) };
  }
  A = Math.max(0, A); D = Math.max(0, D);
  return { win: A > D, a0, d0, a: clamp(A / a0, 0, 1), d: clamp(D / d0, 0, 1) };
}
// ---- "Why this result": strengths and their sources, terrain, context, and the phase-by-phase decisions ----
function whyHtml(r, pa, ctx, kind, won) {
  if (!ctx || r.a0 == null) return '';
  const mineO = pa ? ctx.A : ctx.D, theirO = pa ? ctx.D : ctx.A;
  const my0 = pa ? r.a0 : r.d0, foe0 = pa ? r.d0 : r.a0, ratio = my0 / Math.max(1, foe0);
  const { type, T } = battleTerrain(ctx, kind);
  const chip = t => `<span style="display:inline-block;margin:1px 3px 1px 0;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,.08)">${t}</span>`;
  const J = r.journal || [], ph = J.filter(j => !j.end);
  const good = ph.filter(j => j.verdict === 'good').length, bad = ph.filter(j => j.verdict === 'bad').length;
  // The deciding factor, in plain words
  const dec = [];
  if (ratio >= 1.5) dec.push(`you brought ${ratio.toFixed(1)}× their strength`); else if (ratio <= 0.67) dec.push(`they brought ${(1 / ratio).toFixed(1)}× your strength`);
  if (ph.length) { if (good - bad >= 2) dec.push(`your orders out-read theirs (${good} good calls, ${bad} poor)`); else if (bad - good >= 2) dec.push(`the enemy read you better (${bad} poor calls, ${good} good)`); }
  const duel = ph.find(j => /Duel|Flagship/.test(j.o)); if (duel) dec.push(duel.verdict === 'good' ? 'your commander won his duel' : 'your commander lost his duel');
  if (ph.some(j => j.mods.some(m => /favours|hinders/.test(m)))) dec.push(`the ${type} shaped the fighting`);
  const fin = J.find(j => j.end); if (fin && /final clash/.test(fin.end)) dec.push('it went the distance and was settled in a final clash');
  if (r.fled) dec.push('you withdrew');
  if (!dec.length) dec.push(won ? 'a hard, even fight that tipped your way' : 'a hard, even fight that tipped theirs');
  const phRows = J.map(j => j.end ? `<div style="margin-top:3px"><b>⏹</b> ${j.end}</div>` :
    `<div style="margin-top:4px;border-left:3px solid ${j.verdict === 'good' ? '#5fdc6a' : j.verdict === 'bad' ? '#ff6a5a' : '#999'};padding-left:6px"><b>Phase ${j.r}</b> · You: <b>${j.o.replace(/^\S+\s/, '')}</b>${j.typ ? ` (${TB_STANCE[j.typ]})` : ''} · Enemy: <b>${TB_STANCE[j.st]}</b> <i style="opacity:.75">— ${j.why}</i>${j.mods.length ? `<br><small>⚖ ${j.mods.join(' · ')}</small>` : ''}<br><small>Dealt ${j.dealt}% · took ${j.took}%</small></div>`).join('');
  const cw = ctxWhy(ctx, pa);
  return `<details class="br-why" style="text-align:left;margin-top:6px"><summary><b>🔎 Why this result</b> — ${dec.join('; ')}.</summary>
    <div style="font-size:12px;margin-top:4px">
      <div><b>Strength at the start:</b> you ${Math.round(my0)} vs enemy ${Math.round(foe0)} (${ratio >= 1 ? `${ratio.toFixed(2)}× in your favour` : `${(1 / ratio).toFixed(2)}× against you`})</div>
      <div style="margin-top:3px"><b>Your side:</b> ${(ctx._why?.[pa ? 'A' : 'D'] || powWhy(mineO, kind)).map(chip).join('')}</div>
      <div><b>Their side:</b> ${(ctx._why?.[pa ? 'D' : 'A'] || powWhy(theirO, kind)).map(chip).join('')}</div>
      ${type ? `<div style="margin-top:3px"><b>🪐 Battlefield — ${type}:</b> ${T?.n || 'no side favoured'}</div>` : ''}
      ${cw.length ? `<div style="margin-top:3px">${cw.map(t => `<div>${t}</div>`).join('')}</div>` : ''}
      ${phRows ? `<div style="margin-top:4px"><b>The commanders' decisions</b>${phRows}</div>` : '<div style="margin-top:3px;opacity:.8">Auto-resolved: the result follows the strengths above with some luck. Command the battle in text mode to see each phase.</div>'}
    </div></details>`;
}
// ================= Text-based battle command (classic mode) =================
// Each round you pick an order; the enemy commits to a stance (Aggressive / Defensive / Maneuver).
// Aggression beats maneuver, maneuver beats defence, defence beats aggression. Your general's skill decides
// how well your scouts read the enemy's intent.
export const TB_SPACE = [
  ['💥 Broadside Volley', 'agg', 0.22, 0.15, 'Steady exchange of fire.'],
  ['🚀 Torpedo Run', 'agg', 0.34, 0.26, 'Bombers dive in. Brutal both ways.'],
  ['🛡 Hold Formation', 'def', 0.1, 0.06, 'Shields up, minimal losses.'],
  ['⚡ Ion Barrage', 'def', 0.12, 0.08, 'Cripples their shields: their next salvo is weaker.'],
  ['🌫 Go Dark in the Nebula', 'man', 0, 0, 'Ambush gamble: devastating or wasted.'],
  ['↪ Flanking Sweep', 'man', 0.26, 0.14, 'Swing round their line.'],
  ['🏳 Feigned Retreat', 'man', 0, 0, 'Lure an aggressive foe into a trap.'],
];
export const TB_LAND = [
  ['💣 Artillery Barrage', 'agg', 0.2, 0.1, 'Shell their positions.'],
  ['⚔ Full Charge', 'agg', 0.38, 0.3, 'All in. Bloody for both sides.'],
  ['🛡 Shield Wall', 'def', 0.1, 0.05, 'Lock shields and hold.'],
  ['⛏ Dig In', 'def', 0.14, 0.06, 'Trenches and bunkers. Stronger when defending.'],
  ['↪ Flank Through the Ruins', 'man', 0.3, 0.15, 'Strike their side through cover.'],
  ['🌑 Night Raid', 'man', 0, 0, 'Gamble in the dark.'],
  ['📯 Rally the Troops', 'def', 0.05, 0.08, 'Regroup the wounded: recover some strength.'],
];
export const TB_STANCE = { agg: '⚔ Aggressive', def: '🛡 Defensive', man: '↪ Maneuvering' };
export async function textBattle(A, D, pa, label, kind, ctx) {
  const a0 = A, d0 = D;
  const mine = ctx ? (pa ? ctx.A : ctx.D) : null, theirs = ctx ? (pa ? ctx.D : ctx.A) : null;
  const myG = mine?.general, foeG = theirs?.general;
  const tp = foeG ? persona(foeG) : { agg: 0.5, honor: 0.5 };
  const { type: ptype, T: TR } = battleTerrain(ctx, kind);
  const tm = typ => TR?.[typ] || 1;
  const journal = [];
  let ionMe = 1, ionFoe = 1, fled = false, last = '', playerWon = null, r = 0;
  const beats = { agg: 'man', man: 'def', def: 'agg' };
  const m0 = pa ? a0 : d0, f0s = pa ? d0 : a0;
  // Bigger armies fight longer battles; past the expected length the lines are pushed to a decision
  const maxR = clamp(Math.round(2 + Math.sqrt(a0 + d0) / 4), 3, 12);
  const BREAK = 0.3;
  const balance = (me, foe) => { const k = (me / m0) / Math.max(0.01, foe / f0s); return k > 1.6 ? ['Winning decisively', '#5fdc6a'] : k > 1.15 ? ['Winning', '#9fe070'] : k > 0.87 ? ['Evenly matched', '#ffd76a'] : k > 0.62 ? ['Losing', '#ff9a50'] : ['Losing badly', '#ff4a4a']; };
  for (;;) {
    let me = pa ? A : D, foe = pa ? D : A;
    if (foe / f0s <= BREAK) { playerWon = true; journal.push({ end: `The enemy fell to ${Math.round(BREAK * 100)}% strength and broke.` }); last += `<div class="bt-v good">The enemy line breaks and flees!</div>`; break; }
    if (me / m0 <= BREAK) { playerWon = false; journal.push({ end: `Your forces fell to ${Math.round(BREAK * 100)}% strength and broke.` }); last += `<div class="bt-v bad">Your line breaks. The survivors fall back.</div>`; break; }
    r++;
    if (r > maxR) {
      // Decisive final clash: momentum and luck pick a winner, the loser routs
      const k = (me / m0) / ((me / m0) + (foe / f0s)) + (Math.random() - 0.5) * 0.12;
      playerWon = k >= 0.5;
      journal.push({ end: `Phase ${maxR} passed: a final clash decided it on momentum (${Math.round(k * 100)}% your way).` });
      if (playerWon) foe *= 0.6; else me *= 0.6;
      last += `<div class="bt-v ${playerWon ? 'good' : 'bad'}">${playerWon ? 'A final push shatters their resolve. The enemy routs!' : 'Exhausted, your forces give way in the final clash.'}</div>`;
      if (pa) { A = me; D = foe; } else { D = me; A = foe; }
      break;
    }
    // Enemy picks a stance shaped by its general's temper and how the battle is going
    const losing = foe / f0s < me / m0;
    const fsk = foeG?.skill || 0, readsGround = fsk >= 5 && TR;
    const w = { agg: 0.33 + tp.agg * 0.3 - (losing ? 0.15 : 0) + (trt(foeG, 'Reckless') ? 0.25 : 0), def: 0.33 + (losing ? 0.2 : 0) + (pa ? 0.1 : 0) + (trt(foeG, 'Cautious') ? 0.25 : 0), man: 0.33 + fsk * 0.02 };
    if (readsGround) for (const k of ['agg', 'def', 'man']) w[k] *= tm(k); // a skilled foe plays to the ground
    const tot = w.agg + w.def + w.man; let x = Math.random() * tot;
    const st = x < w.agg ? 'agg' : (x -= w.agg) < w.def ? 'def' : 'man';
    // Why the enemy commander chose this stance
    const fWhy = [];
    if (st === 'agg') { if (trt(foeG, 'Reckless')) fWhy.push('he is Reckless'); if (tp.agg > 0.6) fWhy.push('a warlike temper'); if (!losing) fWhy.push('he smells victory'); }
    if (st === 'def') { if (losing) fWhy.push('his line is buckling'); if (pa) fWhy.push('he guards his own ground'); if (trt(foeG, 'Cautious')) fWhy.push('he is Cautious'); }
    if (st === 'man' && fsk >= 5) fWhy.push(`a skilled tactician (skill ${fsk})`);
    if (readsGround && tm(st) > 1) fWhy.push(`he plays to the ${ptype}`);
    if (!fWhy.length) fWhy.push(foeG ? 'a gamble' : 'no commander — the captains act on instinct');
    // Scouting: a skilled general reads the enemy correctly
    const acc = 0.45 + (myG ? myG.skill * 0.05 : 0) + (has(myG || {}, 'Shadow') ? 0.1 : 0) + (trt(myG, 'Vigilant') ? 0.1 : 0) - (trt(myG, 'Drunkard') ? 0.1 : 0);
    const seen = Math.random() < acc ? st : rnd(['agg', 'def', 'man'].filter(k => k !== st));
    const base = (kind === 'space' ? TB_SPACE : TB_LAND).slice();
    const opts = base.map(o => o[0]);
    if (myG) opts.push(kind === 'space' ? '🗡 Board Their Flagship' : myG.starblade ? '✨ Starblade Duel' : '🤺 Champion\'s Duel');
    if (kind === 'land' && pa && (mine?.fleet || 0) > 0) opts.push('☄ Orbital Strike');
    if (r >= 2) opts.push('🏳 Sound the Retreat');
    const [bl, bc] = balance(me, foe), share = me / (me + foe);
    const hp = (v, v0, c, lbl) => { const p = clamp(v / v0, 0, 1) * 100; return `<div class="bt-row"><span>${lbl}</span><div class="bt-hp"><div style="width:${p}%;background:${c}"></div><i style="left:${BREAK * 100}%"></i></div><b>${Math.round(p)}%</b></div>`; };
    const o = await ask(`<div class="bt-head"><h3>${label}</h3><small>Phase ${r} · the lines will be forced to a decision after phase ${maxR}</small></div>
      ${last ? `<div class="bt-last">${last}</div>` : ''}
      <div class="bt-bal"><div class="bt-bar"><div style="width:${share * 100}%"></div></div><div class="bt-st" style="color:${bc}">${bl}</div></div>
      <div style="display:flex;gap:8px;align-items:center">${myG ? portrait(myG, 40) : ''}<div style="flex:1">${hp(me, m0, '#4caf50', 'Your forces')}${hp(foe, f0s, '#e05050', foeG ? `Enemy · ${foeG.name.split(' ')[0]}` : 'Enemy')}</div>${foeG ? portrait(foeG, 40) : ''}</div>
      <small style="opacity:.7">A side whose strength falls to the marked line breaks and flees.</small>
      <div class="bt-scout">🔭 Scouts: the enemy looks <b>${TB_STANCE[seen]}</b> <small>(${Math.round(clamp(acc, 0, 0.95) * 100)}% reliable${myG ? '' : ', no general'})</small></div>
      ${ptype ? `<div class="bt-n">🪐 <b>${ptype}</b>: ${TR?.n || 'no side favoured'}${TR ? ` <small>(${['agg', 'def', 'man'].filter(k => tm(k) !== 1).map(k => `${TB_STANCE[k]} ×${tm(k)}`).join(' · ')}${TR.amb ? ` · ambush +${Math.round(TR.amb * 100)}%` : ''})</small>` : ''}</div>` : ''}
      <small>Aggressive beats Maneuvering · Maneuvering beats Defensive · Defensive beats Aggressive</small>
      <div class="scroll" style="max-height:16vh;font-size:11px;opacity:.85;margin-top:4px">${base.map(b => `<div><b>${b[0]}</b> <i style="opacity:.7">${TB_STANCE[b[1]]}</i> — ${b[4]}</div>`).join('')}</div>`, opts);
    sfx(kind === 'space' ? 'laser' : 'clash');
    const mB = me, fB = foe, sB = share;
    let line = '', verdict = 'neutral', vtxt = '', typ0 = null;
    const mods = [];
    if (o === '🏳 Sound the Retreat') { fled = true; me *= 0.92; line = 'You sound the retreat and withdraw in good order.'; verdict = 'neutral'; vtxt = 'You live to fight another day, but the field is theirs.'; }
    else if (o === '🗡 Board Their Flagship' || o === '✨ Starblade Duel' || o === '🤺 Champion\'s Duel') {
      const dm = [[(myG.skill - (foeG?.skill || 3)) * 0.05, `skill ${myG.skill} vs ${foeG?.skill ?? 3}`], [myG.starblade ? 0.15 : 0, 'your Starblade'], [foeG?.starblade ? -0.12 : 0, 'their Starblade'],
        [trt(myG, 'Brave') || trt(myG, 'Hero') ? 0.08 : 0, 'brave'], [trt(myG, 'Coward') ? -0.15 : 0, 'cowardly'], [trt(myG, 'Tourney Champion') ? 0.08 : 0, 'Tourney Champion'],
        [trt(foeG, 'Brave') || trt(foeG, 'Hero') ? -0.05 : 0, 'a brave foe'], [(myG.age || 30) >= 50 ? -0.06 : 0, 'age'], [trt(myG, 'Drunkard') ? -0.05 : 0, 'drink']].filter(([v]) => v);
      const ch = clamp(0.45 + dm.reduce((t, [v]) => t + v, 0), 0.15, 0.9);
      dm.forEach(([v, t]) => mods.push(`${v > 0 ? '+' : '−'}${Math.round(Math.abs(v) * 100)}% ${t}`));
      if (Math.random() < ch) { foe *= 0.7; line = `${myG.name} ${kind === 'space' ? 'storms their bridge' : myG.starblade ? 'ignites his Starblade and cuts down their champion' : 'cuts down their champion'}! The enemy line wavers.`; verdict = 'good'; vtxt = `It worked (${Math.round(ch * 100)}% chance).`; gain(myG, 'respect'); }
      else { me *= 0.85; line = `${myG.name} is driven back, wounded.`; verdict = 'bad'; vtxt = `It failed (${Math.round(ch * 100)}% chance).`; if (Math.random() < 0.3) try { wound(myG); } catch (e) {} }
    } else if (o === '☄ Orbital Strike') { foe *= 0.8; me *= 0.97; apoc(1, 'orbital bombardment'); line = 'Fire rains from orbit onto their positions.'; verdict = 'good'; vtxt = 'Effective, but the galaxy remembers such things (+Armageddon).'; }
    else {
      const def = base.find(b => b[0] === o);
      let [, typ, dl, tk] = def;
      typ0 = typ;
      let mul = 1, tmul = 1;
      if (beats[typ] === st) { mul = 1.4; tmul = 0.7; verdict = 'good'; vtxt = `Good call: your ${TB_STANCE[typ]} order counters their ${TB_STANCE[st]} stance.`; }
      else if (beats[st] === typ) { mul = 0.7; tmul = 1.3; verdict = 'bad'; vtxt = `Poor call: their ${TB_STANCE[st]} stance counters your ${TB_STANCE[typ]} order.`; }
      else vtxt = `Even exchange: both sides were ${TB_STANCE[st]}.`;
      if ((o === '🌫 Go Dark in the Nebula' || o === '🌑 Night Raid') && TR?.amb) mods.push(`+${Math.round(TR.amb * 100)}% ambush odds (${ptype})`);
      if (o === '🌫 Go Dark in the Nebula' || o === '🌑 Night Raid') { if (Math.random() < 0.5 + (st === 'def' ? 0.15 : 0) + (TR?.amb || 0)) { dl = 0.45; tk = 0.05; line = 'The ambush lands perfectly.'; verdict = 'good'; } else { dl = 0.05; tk = 0.2; line = 'They were waiting for you.'; verdict = 'bad'; } }
      if (o === '🏳 Feigned Retreat') { if (st === 'agg') { dl = 0.42; tk = 0.05; line = 'They chase straight into your guns!'; verdict = 'good'; } else { dl = 0.04; tk = 0.08; line = 'They do not take the bait.'; verdict = 'bad'; vtxt = 'A feint only works against an aggressive enemy.'; } }
      if (o === '⛏ Dig In' && !pa) { dl *= 1.3; tk *= 0.7; }
      if (o === '📯 Rally the Troops') { me = Math.min(m0, me + m0 * 0.08); line = 'Your soldiers regroup and rally.'; }
      // Terrain and the commanders' natures sharpen or blunt each stance
      const myK = tm(typ) * traitMul(myG, typ), foeK = tm(st) * traitMul(foeG, st);
      if (tm(typ) !== 1) mods.push(`${ptype} ${tm(typ) > 1 ? 'favours' : 'hinders'} your ${TB_STANCE[typ]} (×${tm(typ)})`);
      if (traitMul(myG, typ) !== 1) mods.push(`${myG.name.split(' ')[0]}'s nature ×${Math.round(traitMul(myG, typ) * 100) / 100}`);
      if (tm(st) !== 1) mods.push(`${ptype} ${tm(st) > 1 ? 'favours' : 'hinders'} their ${TB_STANCE[st]} (×${tm(st)})`);
      if (traitMul(foeG, st) !== 1) mods.push(`${foeG.name.split(' ')[0]}'s nature ×${Math.round(traitMul(foeG, st) * 100) / 100}`);
      if (ionFoe < 1) mods.push('your earlier ion fire weakens their salvo (×0.6)');
      if (o === '⛏ Dig In' && !pa) mods.push('dug in on your own ground (+30% dealt, −30% taken)');
      foe -= me * dl * mul * ionMe * myK * (0.7 + Math.random() * 0.6);
      // Losses depend on your order's exposure (tk) and how hard the enemy's stance hits
      me -= fB * (st === 'agg' ? 1.5 : st === 'def' ? 0.7 : 1.05) * tk * tmul * ionFoe * foeK * (0.7 + Math.random() * 0.6);
      if (o === '⚡ Ion Barrage') line = 'Ion fire strips their shields: their next salvo will be weaker.';
      ionFoe = o === '⚡ Ion Barrage' ? 0.6 : 1; ionMe = 1;
      if (!line) line = { agg: 'Your forces press the attack.', def: 'Your forces hold their ground.', man: 'Your forces maneuver for position.' }[typ];
    }
    me = Math.max(0, me); foe = Math.max(0, foe);
    if (pa) { A = me; D = foe; } else { D = me; A = foe; }
    const dealt = Math.round((fB - foe) / f0s * 100), took = Math.round((mB - me) / m0 * 100), dS = Math.round((me / Math.max(1, me + foe) - sB) * 100);
    last = `<div class="bt-v ${verdict}"><b>${o.replace(/^\S+\s/, '')}</b> vs enemy <b>${TB_STANCE[st]}</b></div><div class="bt-n">🧠 ${foeG ? foeG.name.split(' ')[0] : 'The enemy'} chose ${TB_STANCE[st]}: ${fWhy.join(', ')}.</div><div>${line}</div><div class="bt-n">${vtxt}</div>${mods.length ? `<div class="bt-n">⚖ ${mods.join(' · ')}</div>` : ''}<div class="bt-n">Enemy lost <b style="color:#ff8080">${dealt}%</b> · You lost <b style="color:#ffb080">${took}%</b> · Momentum <b style="color:${dS >= 0 ? '#8f8' : '#f88'}">${dS >= 0 ? '+' : ''}${dS}%</b></div>`;
    journal.push({ r, o, typ: typ0, st, why: fWhy.join(', '), verdict, mods: mods.slice(), dealt, took });
    if (fled) { playerWon = false; break; }
  }
  return { A, D, fled, rounds: r, last, aWin: pa ? playerWon : !playerWon, journal, ptype, tn: TR?.n || '' };
}
