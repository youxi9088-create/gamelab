import * as THREE from './_remote/0d0e081c7ee3d520/three@0.184.0.js';
import { UNITS, PLANET_SPECIALS, FACTION_UNIQUE, mkSquad, tacticalBattle } from './tactical.js';
import { initIcons } from './icons.js';
import { showManual } from './manual.js';
import { CULT, cultureOf, firstName, surname, uniqueName, cultLabel, CAPT_RANK } from './names.js';
import { ROLE_LINES, AGT, RNAME, ROLE, AICON, RTITLE, HTITLE, ROYAL, ROYAL_DEF, MERC_SELLERS, NM_FOES, EPI, BLADE, RES_IMG, HOLY_AREAS, BSIZE, BTIME, FF_OMENS, PLOOK, SPEC_FIT, HOLY, BCHAIN } from './data.js';
import { hash3, planetTex } from './planets.js';
import { S, F, CH, systems, units, ID, P, setP } from './state.js';
import { initBattles, fight, fightCore, battleReport, textBattle } from './battles.js';
import { initEvents, midEvents, plagueAsk, plagueDeath, plagueStrike, hospLv } from './events.js';
import { initSteward, supplyNet, inSupply, graftRate, graftTick, CUT_MUL, OOS_MUL, beginTurn as stewardBegin, endTurn as stewardEnd, docketMenu, ordersMenu, ledgerMenu, advisorTick } from './steward.js';
import { initPolitics, politicsTick } from './politics.js';
import { initUI, ask, notify, toast, closeAllModals, modalOpen, dismissAll, resolveTop } from './ui.js';
import { initSim, runSim } from './sim.js';
import { initWiki, showWiki, wikiWar, wikiPeace, wikiReign, wikiSync, wikiEdict, wikiEdicts, wikiMotives, wikiReclStart, wikiReclEnd, wikiBlade, wikiBladeDeed, wikiWork, wikiStrike, wikiAct, wikiFate, wikiVassal } from './wiki.js';
// Archive hook for marriages, assassinations, trade and diplomacy (never breaks gameplay)
function WA(k, o) {
  try {
    wikiAct(k, o);
  } catch (e) {}
}
function WV(ev, v, l, a, why) {
  try {
    wikiVassal(ev, v, l, a, why);
  } catch (e) {}
}
// Rank of an assassination victim, for the archive
const vRank = g => {
  const f = F[g?.f];
  return !f ? '' : f.ruler === g ? `ruler of ${f.name}` : (f.heirs || []).includes(g) && !bastard(g) ? `heir of ${f.name}` : '';
};
// Archive hooks never break gameplay
const WB = (...a) => {
  try {
    wikiBlade(...a);
  } catch (e) {
    console.warn('wikiBlade', e);
  }
};
import { initSave, SLOTS, slotKey, slotMeta, deleteSlot, save, snapshot, load, encF, decF, packObj } from './save.js';

// ================= Helpers =================
const $ = id => document.getElementById(id);
// Dialogs live above every screen (save/load menus included), so confirmations are never hidden behind them
{
  const m = document.getElementById('modal');
  if (m) {
    document.body.appendChild(m);
    m.style.position = 'fixed';
    m.style.zIndex = '170';
    m.style.color = '#cfe8ff';
    m.style.fontSize = '13px';
  }
}
initIcons();
const rnd = a => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FN = ['Kael', 'Vora', 'Thane', 'Isra', 'Doran', 'Lyra', 'Mace', 'Seren', 'Orrin', 'Talia', 'Cassio', 'Nyx', 'Bram', 'Elara', 'Rhaeg', 'Jorah', 'Tyvar', 'Ysolde'];
const LN = ['Vex', 'Solari', 'Drake', 'Orm', 'Halv', 'Mordane', 'Kest', 'Varr', 'Ashgrave', 'Lux'];
const RELS = ['Order', 'Zithari', 'Atheism', 'Machine Cult', 'Old Gods'];
// k: tech (faction-wide), sys (built in a system), art (artifact), super (one-use superweapon, needs Space Station)
const GW = {
  // t = turns to build. Starblades are mostly found in ruins or taken from a slain wielder; forging one is a fortune (the Nameless forge them cheaper).
  'Starblades': {
    c: 3000,
    t: 6,
    k: 'art',
    d: 'Forge a blade for this system\'s general: +2 skill, +25% ground power. Usually found in ruins or taken from a slain wielder.'
  },
  'Memory Codices': {
    c: 400,
    k: 'tech',
    d: 'Ancient archives: all your generals +1 skill. ☢ −3'
  },
  'Laser Weapons': {
    c: 350,
    k: 'tech',
    d: '+15% space power.'
  },
  'Plasma Weapons': {
    c: 400,
    k: 'tech',
    d: '+20% ground power.'
  },
  'Bodyshields': {
    c: 300,
    k: 'tech',
    d: 'Impact armor: +15% ground power.'
  },
  'Aether Shield': {
    c: 500,
    k: 'tech',
    d: '+25% ground power.'
  },
  'Cloaking': {
    c: 450,
    k: 'tech',
    d: '+10% space power.'
  },
  'Blockades': {
    c: 300,
    k: 'tech',
    d: 'Your fleets (4+) cut adjacent enemy income by 30%.'
  },
  'Gravity Nullifier': {
    c: 400,
    k: 'tech',
    d: 'Ignore enemy Hyperspace Nullifiers.'
  },
  'Terraforming': {
    c: 800,
    t: 4,
    k: 'sys',
    d: 'This system: income +50%.'
  },
  'Space Station': {
    c: 1200,
    t: 5,
    k: 'sys',
    d: 'This system: +40% fleet power, +40 income. Needed for superweapons.'
  },
  'Shield World': {
    c: 1600,
    t: 6,
    k: 'sys',
    d: 'This system: ground defense ×2.'
  },
  'Hyperspace Nullifier': {
    c: 1400,
    t: 6,
    k: 'sys',
    d: 'Attackers here fight at −30% strength.'
  },
  // Superweapons take years: the lost arts of the Old Empire are slow to relearn
  'World Devastators': {
    c: 3000,
    t: 20,
    k: 'super',
    d: 'One use. Wipe an adjacent world\'s armies, halve its income. ☢ +8'
  },
  'World Eater': {
    c: 5000,
    t: 30,
    k: 'super',
    d: 'One use. Consume an adjacent world entirely. ☢ +15'
  },
  'Star Eater': {
    c: 8000,
    t: 40,
    k: 'super',
    d: 'One use. Devour a star and the armies of its neighbours. ☢ +25'
  },
  'Necronomicon': {
    k: 'tech',
    find: 1,
    d: 'Forbidden tome: +50% all power. ☢ +2 every turn while held.'
  }
};
const INTRO = 'A thousand years ago the Old Empire burned in the Second Empire War. Its hyperlanes went dark, its machines went mad, and its people forgot how to build. Now the galaxy stirs from the dark age: scrap-barons, holy orders, slaver guilds, bankers and exiles crawl out of the ruins and carve feudal domains from the ashes. Ancient vaults still hold Starblades, Memory Codices and worse. Every sin pushes the galaxy closer to the Apocalypse. Every mercy pulls it back.';
const LORE = ['A rusted plaque: "SKELETON UNIT 7 — PROPERTY OF THE IMPERIAL CROWN." The robot beneath it is still warm.', 'Murals show a sun being eaten by a great black machine. The last panel was chiselled away.', 'A log entry: "The Domiri were never meant to leave the vats. Seal the eastern gates."', 'Bones of a thousand monks kneel in rows, Starblade hilts in their laps, all facing east.', 'An imperial bank vault, still locked. The ledger inside lists debts owed by worlds that no longer exist.', 'A child\'s drawing of the stars, with a single red line marked "the Nightfleet".', 'A cracked holo: "When the counter reaches zero, the gates open." Nobody knows which counter.', 'An aether shield generator, shattered. Around it, the sand has fused to glass in a perfect circle.'];
const HOUSE = ['House', 'Barony of', 'Scrap Barons of', 'Holy Nation of', 'Shek Kingdom of', 'United Cities of', 'Tech Hunters of', 'Dust Lords of', 'Free Lords of'];
const HELP = '<h3>How to Play</h3><div class="scroll">• <b>One finger</b>: pan the map. <b>Pinch</b>: zoom. <b>Two-finger twist</b>: rotate.<br>• <b>Tap</b> a system to select it. With your army selected, tap a <b>green-ringed</b> system to move or attack.<br>• The map is your main interface: tap worlds, fleets and characters to learn about them and act.<br>• ◀ ▶ on the info panel cycle through your worlds, or through your fleets & characters.<br>• ✉ (left) holds the galactic news at the start of each turn. ⚜ below it is your faction: court, dynasty, rankings and the standings of every power.<br>• ⏳ (right) ends your turn — its badge counts fleets, characters and worlds you haven\'t visited yet. 📖 below it opens the ledger, wiki and lore. ☰ (top) is the menu.<br>• 🏛 Great Works are built from a selected system\'s panel. Technology cannot be researched: it is found among the stars, or invented by a Scientist in a general\'s retinue.<br>• <b>PC</b>: <b>left click</b> selects and inspects, <b>right click</b> orders the selected fleet or agent to move, attack or set a course. Drag/wheel to move & zoom, WASD/arrows pan, Q/E rotate, +/− zoom, Enter ends turn, Esc closes dialogs, 1–3 switch tabs, Tab jumps to the next unit with orders, [ ] step any ◀ ▶ cycler, 1–9 pick a popup action, Alt+Enter toggles borderless fullscreen (also in ⚙ Settings → Display).<br>• ⚔ Reinforcements: your other fleets in the same orbit — and general-led fleets one jump away — join battles and assaults. Fleets without a general are led by a Captain you can promote.<br>• 🌐 Online: host a game, share the 5-letter code; each commander plays their turn on their own device.<br>• 👥 Hotseat: several players share one device; pass it when the curtain appears.<br>• 💾 ☰ Menu → Save Game: 6 slots plus a yearly autosave.<br>• 📜 Ledger: history of the galaxy. 👥 Wiki: every notable character; tap names anywhere.<br>• 🏚 Ruins: send a general to explore for artifacts and lore.<br>• Two turns = one year. Autosaves each year.</div>';
// name, color, religion, region center [x(east+), z(south+)], systems, mods
const FDEF = [['The Nameless', 0xf0e6c0, 'Order', [0, -6], 3, {
  gold: 600,
  monk: 1
}], ['The Nightfleet', 0x5a7aa0, 'Mixed', [34, 0], 5, {
  gold: 250,
  poor: 1
}], ['The Pirate Elect', 0xff7a1a, 'Old Gods', [22, 20], 3, {
  gold: 500,
  fleetUp: 1,
  fleet: 12
}], ['The Spice Syndicate', 0xd4a020, 'Atheism', [2, 30], 3, {
  gold: 1200,
  black: 30,
  spice: 1
}], ['The Hyperspacing Guild', 0x9a7a5a, 'Order', [-10, 18], 4, {
  gold: 700,
  prod: 1.35
}], ['The Bloodbank', 0xc0102a, 'Atheism', [13, -4], 3, {
  gold: 2000,
  bank: 1
}], ['The Cloning Guild', 0x40c070, 'Zithari', [-22, 26], 3, {
  gold: 600,
  cheap: 1,
  slaver: 1
}], ["Slaver's Guild", 0x7a3a1a, 'Old Gods', [-31, 8], 2, {
  slaver: 1,
  might: 1
}], ['United Planets Space Authority', 0x3a7aff, 'Order', [-8, -16], 3, {
  bureau: 1
}], ['Artificial Intelligence Alliance', 0x00e0e0, 'Machine Cult', [-26, -16], 2, {
  droids: 1
}], ['The Unchained', 0xeeeeff, 'Order', [-17, 4], 2, {
  might: 1,
  liberator: 1
}], ['The Ashen Clans', 0x777777, 'Old Gods', [8, -24], 2, {
  warrior: 1
}], ['The Dominion', 0x8a2be2, 'Machine Cult', [-4, -31], 3, {
  upgrade: 1
}], ['The Witchmaidens', 0xff5ac8, 'Old Gods', [22, -18], 2, {
  coven: 1
}], ['The Free Planets', 0x8aff8a, 'Atheism', [-33, -3], 2, {
  elect: 1
}], ['Cult of Zithari', 0x206040, 'Zithari', [-33, 22], 2, {
  slaver: 1,
  sith: 1
}], ['The Gray Order', 0xaaaaaa, 'Order', [2, 7], 1, {
  gray: 1
}], ['The Free Pirates', 0xffaa66, 'Old Gods', [14, 33], 2, {
  pirate: 1
}], ['The Forgotten Fleet', 0x4466aa, 'Machine Cult', [30, -30], 0, {
  ff: 1,
  gold: 0
}],
// dormant: awakens when the Apocalypse Counter runs high
['Barbarians', 0x996633, 'Old Gods', [-18, -31], 2, {
  pirate: 1
}], ['Generic Pirates', 0xcc5500, 'Atheism', [37, 17], 2, {
  pirate: 1
}]];
const DESC = ['Starblade monks of the Order. Elite Nameless Monks anywhere. Your ruler is the Grandmaster, elected by the Council of 13, and can call Reclamations.', 'Exiles guarding the galaxy\'s outer rim. Poor, thin, ill-equipped: a large portion of their income depends on donations from the other houses. Dread commanders keep order here. Lord Commander elected by a council of 5. Beware generals going rogue.', 'Royal pirate bloodlines of the Dread Lord. Huge starting fleet, cheap ships, low upkeep. Heir is closest in blood to the Dread Lord.', 'Rich cartel. Black market income, cheap Bounty Hunters, Mercenaries. Spice addicts die young; slavery permitted.', 'Masters of the hyperlanes. Their foundries give +35% production, their Lane Tolls and Jump Beacons make every voyage pay, and their ships come cheap. Their workers are loyal to wages before gods, so preachers convert their worlds easily.', 'The richest house in the galaxy, and its creditor. Lend credits at interest, back pretenders against houses that default, and send Bloodknights to collect. In peace it is a republic of bankers; war brings a dictator, and too much war brings a permanent Blood Empire.', 'Xenophobic cloners with endless vats. Very cheap Clone Legions, and they sell surplus clone troops to any house that can pay, enemies included. Slavery allowed; their kin often come out monstrous.', 'Brutal warlord slavers who believe might is always right. Conquest pays in plunder and chains; +15% ground power.', 'A feudal oligarchy of senator-barons wearing the trappings of an old republic. Disciplined troopers and a bureaucracy that keeps order (+1 order everywhere).', 'The AI Alliance says they have it right this time. Its human directors swear the war-minds are fully under control, and they mostly are. Raise cheap, low-skill machine legions quickly, and sell AI mercenaries to other houses for a steady profit.', 'Direct rivals of the slavers: authoritarian liberators who also follow the strong, for nobler ends. Freed slaves join their ranks on conquest.', 'The Ashborn: bio-engineered warrior clans who keep the Old Gods. Proud, scarred and deadly. +25% ground power; generals born to war.', 'A cyborg theocracy of the Machine Cult. Converts become components; dissent is debugged. Fields towering Dominion Walkers.', 'A sisterhood of seers, poisoners and witch-queens of the Old Gods. Their curses travel farther than their fleets. Fields the Hex Sisters.', 'Free city-state worlds, each ruled by its governor. The Council of Governors elects a High King from among themselves. Self-rule: +1 order where a governor sits.', 'The Dark Path. Zealots of Zithari who draw power from fear and pain. Commanders are dreaded and cruel; +10% ground power; slavery permitted.', 'Gray Wardens who walk between the Light and the Dark. Tiny, ancient and peerless: every commander is trained from childhood (+2 command).', 'A different breed of pirates who answer to no Dread Lord. Flamboyant raiders at war with everyone.', 'A haunted fleet of doom: the dead dreadnoughts of the Old Empire, crewed by Wraith-Admirals. It wakes when the Apocalypse draws near.', 'Warbands with no central planning. Usually fodder for greater powers, but not always.', 'Pirates you will meet all over the galaxy. Scattered, hungry and everywhere.'];
// Long-form faction lore (Lore page + faction selection)
const FLORE = ['When the Old Empire burned, a handful of knights carried their Starblades into the dark and swore an oath without names. A thousand years later the Nameless are the conscience of the galaxy: thirteen Masters, one Grandmaster, and an army of monks who fear nothing but sin.', 'Beyond the galaxy\'s outer rim lie things that should not be. The Nightfleet are the exiles, convicts and oath-breakers sent to guard it. Their barren worlds cannot feed them, so they live on what the great houses choose to give, and in lean years the houses forget. They are poor and bitter, and they are all that stands between the galaxy and the dark.', 'Long ago the first Dread Lord crowned himself king of thieves. His blood still runs through the Pirate Elect, a royal house of corsairs whose heirs are judged by their closeness to that old murderer. Their fleets are the largest in the galaxy, and their manners the worst.', 'Spice is life, death and money. The Syndicate controls the desert worlds where it grows, and through it the courts of half the galaxy. Its lords live richly and die young, and they make sure everyone who matters owes them something.', 'The Guild remembers how to fold space, and it charges dearly for the privilege. Its foundries and mines power a dozen houses. Its workers are loyal to wages before gods, which makes its worlds easy prey for preachers.', 'Every war needs credits, and every credit passes through the Bloodbank. Kings borrow from it, pretenders are crowned with its money, and houses that default discover that the Bank never forgets a debt. It began as a republic of bankers. In wartime it turns to dictators, and in the end, inevitably, to the Blood Empire. Its Bloodknights collect debts the hard way.', 'In sealed vats beneath their capital, the Cloning Guild grows soldiers by the million, more than even it can use. The surplus is sold by the legion to any lord with credits, so half the armies in the galaxy wear the same face. They trust no one born of a mother. Some of their own kin come out of the vats wrong, and they are kept anyway.', 'The Slaver\'s Guild believes in one law: the strong take, the weak serve. Its warlords rule by the whip and the gun and despise any authority they cannot overpower. To them every conquered world is a harvest of credits and chains, and they call it justice.', 'The United Planets Space Authority still calls itself a union of free worlds. In truth a few hundred senatorial families own it outright: lords who inherit their seats, their fleets and their voters. Its Lancer battleships keep the peace, and its forms are filed in triplicate.', 'The Old Empire built thinking machines, and the thinking machines helped end the Old Empire. The Alliance\'s human founders studied that disaster carefully and concluded the problem was management. Today its directors keep the war-minds on very short leashes (they insist), and those minds run the finest war-machines in the galaxy. It sells legions of them to anyone who pays, and it will sell them to your enemy tomorrow.', 'Their founders were slaves who broke their own chains, and their children have never forgotten. The Unchained are harsh, authoritarian and devoted to strength, because only strength freed them. Wherever they conquer, the pens are opened and the freed take up arms.', 'The Ashborn were engineered in the Old Empire\'s gene-forges: tall, horned and grey-skinned, bred to fight and never to rule. When their makers fell they took the ash-worlds for themselves. Now the Ashen Clans pray to the Old Gods and settle every quarrel with a blade.', 'The Dominion believes the flesh is a draft, and the Machine God its final edit. Its priests replace eyes, hearts and doubts with circuitry. Its walkers stride across worlds that refused the Upgrade, and none of those worlds refuse twice.', 'The Witchmaidens are a sisterhood of seers who read the threads of fate in the Old Gods\' stars. Their queens never march to war. Rival lords simply sicken, heirs are born strange, and fleets lose their way in the dark.', 'Every Free Planet answers to its own governor, and the governors answer to no one, except when they meet in council to elect a High King. The crown is never inherited and always contested, and its wearer rules only as long as the council allows.', 'Zithari is the serpent in the deep: the voice that promises power to those who embrace hate. His Cult walks the Dark Path, wielding red Starblades and the fear they inspire. Its masters keep slaves for sacrifice and apprentices for betrayal.', 'The Gray Order stands between the Nameless and the Cult, and trusts neither. Its Wardens are trained from childhood in the ways of both Light and Dark. There are very few of them, and very few have ever beaten one.', 'The Free Pirates broke from the Pirate Elect generations ago, refusing to bow to any bloodline. They paint their hulls in loud colours, duel for captaincies and drink to dead friends. Everyone else is a target.', 'When the Old Empire died, its last armada did not. Somewhere beyond the rim the Forgotten Fleet drifts in the void, its dreadnoughts crewed by Wraith-Admirals who cannot die. The more the galaxy sins, the closer it comes to waking.', 'In the wreckage of fallen worlds, warbands rise and fall like tides. The Barbarians have no capital, no plan and no mercy. Most of the time they are fodder, but sometimes a warlord unites them, and then the galaxy remembers why it fears the dark.', 'They are everywhere: scavengers, deserters and cutthroats in junk gunboats, haunting the lanes between the stars. Pirates come and go, but piracy never ends.'];
// Original faction name: stable key for unique units/guilds even after a faction is renamed
const fkey = f => (f && FDEF[f.id]?.[0]) ?? f?.name;

// ================= State =================
let selected = null,
  busy = false;
S.ledger = [];
S.lore = [];
// ---- Titles: each house names its ruler and heir in its own way ----
// Royal titles: gendered per house (ROYAL in data.js); c defaults to the ruler / a male heir
const RT = (fid, k, c) => {
  const t = ROYAL[fid]?.[k] || ROYAL_DEF[k];
  return t[c?.fem ? 1 : 0] || t[0];
};
const rTitle = (fid, c = F[fid]?.ruler) => fid === 5 && S.bank?.gov === 'Blood Empire' ? c?.fem ? 'Blood Empress' : 'Blood Emperor' : F[fid]?.nmRebel ? c?.fem ? 'Oathbreaker Lady' : 'Oathbreaker Lord' : RT(fid, 'r', c);
const hTitle = (fid, c = heirOrder(F[fid])?.[0]) => RT(fid, 'h', c);
const pTitle = (fid, c) => RT(fid, 'p', c); // prince / princess of the blood
const cTitle = (fid, c) => RT(fid, 'c', c); // consort of the ruler (c = the consort)
// The in-universe title a character holds right now (for the Archive): ruler, heir, blood royal, consort, councillor
function royalTitle(c) {
  const f = c && F[c.f];
  if (!f) return '';
  if (f.ruler === c) return rTitle(c.f, c);
  if (c.enslaved) return 'Slave';
  const fr = f.ruler && !f.ruler.dead ? f.ruler : null;
  const elect = [0, 1, 16].includes(c.f) || f.mods?.elect || c.f === 5 && S.bank?.gov !== 'Blood Empire';
  if (!c.dead) {
    if (!elect) try {
      if (heirOrder(f)?.[0] === c) return hTitle(c.f, c);
    } catch (e) {}
    if (fr && fr.spouse === c.id) return cTitle(c.f, c);
    if ((S.nmCouncil || []).includes(c.id)) return 'Councillor of the Five';
    if ((S.council || []).includes(c.id)) return 'Master of the Council';
    if (c.f === 1 && !c.wasRuler) return c.oathbroken ? 'Oathbreaker' : c.fem ? 'Sister of the Watch' : 'Brother of the Watch';
    if (!elect && ((f.heirs || []).includes(c) || (f.princesses || []).includes(c))) return pTitle(c.f, c);
  }
  if (c.wasRuler) return `${c.dead ? 'Late' : 'Former'} ${rTitle(c.f, c)}`;
  return '';
}
// Display name with an earned epithet ("Dark Lord X", "X the Cruel")
const dn = c => !c ? '' : c.epi && c.role !== 'Spy' && c.role !== 'Assassin' ? c.epi.pre ? `${c.epi.t} ${c.name}` : `${c.name} ${c.epi.t}` : c.name;
const cl = c => `<a data-c="${c.id}">${dn(c)}</a>`;
// Line of succession (primogeniture: sons of the ruler first, then eldest kin). Pirate Elect: closest blood.
// Royal kin of a ruler: sons, brothers, grandsons — wherever they serve (court, governor seat, fleet, reserve)
const isKin = (c, r) => !!(r && c && c !== r && (c.father === r.id || c.father != null && c.father === r.father || CH[c.father]?.father === r.id));
function royalKin(f) {
  const r = f.ruler,
    out = new Set((f.heirs || []).filter(h => h && !h.dead));
  if (r) Object.values(CH).forEach(c => {
    if (c.f === f.id && !c.dead && !c.captive && !c.enslaved && isKin(c, r)) out.add(c);
  });
  out.delete(r);
  return [...out].filter(c => !bastard(c)); // base-born sons are not in the line until legitimised
}
// ---- Bastards: raised at court but outside the line of succession until the ruler legitimises them ----
const bastard = c => !!c && !c.legit && (!!c.illegit || / \(bastard\)/.test(c.name || ''));
const LEGIT_COST = 300;
function legitimise(c, why) {
  if (!bastard(c)) return;
  c.legit = true;
  delete c.illegit;
  c.name = c.name.replace(' (bastard)', '');
  c.loyalty = clamp((c.loyalty || 0) + 3, 0, ACAP);
  const hf = F[c.f];
  if (c.fem && hf) {
    hf.bastards = (hf.bastards || []).filter(x => x !== c);
    if (!hf.princesses.includes(c)) hf.princesses.push(c);
  }
  hist(c, `is legitimised${why ? ' ' + why : ''} and takes ${c.fem ? 'her place as a princess of the house' : 'his place in the line of succession'}.`);
  // Trueborn kin resent a rival raised up beside them
  royalKin(F[c.f] || {}).forEach(h => {
    if (h !== c && !h.fem && h.age >= 12) h.loyalty = Math.max(0, (h.loyalty || 0) - 1);
  });
}
// Base-born children without a place in the line may take vows: sons the Nightfleet, Gray Order, Nameless or Zithari; daughters the Witchmaidens or Zithari
const WM_ID = () => F.findIndex(f => f?.name === 'The Witchmaidens');
function bastardOrders(c) {
  if (!bastard(c) || c.vowed || c.dead || c.captive || (c.age || 0) < 14 || [1, 16, 0, 15, WM_ID()].includes(c.f)) return [];
  const ids = c.fem ? [WM_ID(), 15] : [1, 16, 0, 15];
  return ids.filter(id => id >= 0 && id !== c.f && F[id]?.alive);
}
function joinOrder(c, to) {
  const hf = F[c.f];
  if (hf) {
    hf.bastards = (hf.bastards || []).filter(x => x !== c);
    hf.princesses = (hf.princesses || []).filter(x => x !== c);
  }
  if (to === 1) c.nmFrom = c.f;
  if (c.fem && to === WM_ID()) c.wm = true;
  c.vowed = to;
  defect(c, to, `takes the vows of ${F[to].name}, for a base-born child has no place in ${hf?.name || 'the house'}`);
  c.loyalty = Math.max(c.loyalty || 0, 6);
}
// AI houses legitimise a bastard only when the line is empty, or a ruler who favours him (high loyalty, good command) chooses to
const holdsPost = c => systems.some(s => s.general === c) || units.some(u => u.general === c);
async function bastardTick() {
  // Coming of age: at 14 your base-born children ask for their place (legitimise now, or later from their bio)
  for (const c of Object.values(CH)) {
    if (!c || c.dead || c.captive || c.f !== P || !isHuman(P) || SIM || !bastard(c) || (c.age || 0) < 14 || c.b14) continue;
    c.b14 = true;
    const fa = CH[c.father],
      post = !c.fem;
    const r = await ask(`<h3>📜 ${c.name} Comes of Age</h3>${portrait(c, 80)}<b>${c.name}</b>, ${c.fem ? 'base-born daughter' : 'base-born son'}${fa ? ` of ${cl(fa)}` : ''}, is now 14 and asks for a place in the house.<br><br>Legitimise ${c.fem ? 'her' : 'him'} and ${c.fem ? 'she joins the princesses' : 'he enters the line of succession'} (trueborn kin resent it, −1 loyalty).<br><small>Refuse and ${c.fem ? 'she' : 'he'} may take the vows of an order. ${post ? 'Give him a governorship or command of a fleet to keep him — a post wins his loyalty year by year.' : ''} You can still legitimise later from the bio.</small>`, [`📜 Legitimise (${LEGIT_COST})`, '⏳ Not now']);
    if (r?.startsWith('📜') && F[P].gold >= LEGIT_COST) {
      F[P].gold -= LEGIT_COST;
      legitimise(c, `by ${F[P].ruler?.name || 'the ruler'} on coming of age`);
    } else {
      if (r?.startsWith('📜')) toast('Not enough credits — legitimise later from the bio.', false);
      c.loyalty = Math.max(0, (c.loyalty || 0) - 1);
      note(c, 'is denied legitimacy on coming of age.');
    }
  }
  for (const f of F) {
    if (!f.alive || !f.ruler || f.id === P || isHuman(f.id)) continue;
    const b = (f.heirs || []).filter(h => !h.dead && !h.fem && bastard(h) && h.age >= 14).sort((a, b2) => b2.skill + b2.loyalty - (a.skill + a.loyalty))[0];
    if (!b) continue;
    const empty = !royalKin(f).some(h => !h.fem);
    if (empty || b.father === f.ruler.id && b.skill + b.loyalty >= 13 && (f.gold || 0) >= LEGIT_COST && Math.random() < 0.15) {
      if (!empty) f.gold -= LEGIT_COST;
      legitimise(b, `by ${f.ruler.name}${empty ? ', for the line has no trueborn son' : ''}`);
    }
  }
  // AI houses are usually kind to their base-born; only a cruel, paranoid or dreaded ruler casts one out (never a man holding a post)
  for (const f of F) {
    if (!f?.alive || !f.ruler || isHuman(f.id)) continue;
    const r = f.ruler,
      harsh = has(r, 'Cruel') || has(r, 'Paranoid') || (r.respect || 0) <= -6;
    if (!harsh || Math.random() > 0.1) continue;
    const b = [...(f.heirs || []), ...(f.bastards || [])].find(h => h && !h.dead && bastard(h) && (h.age || 0) >= 14 && !holdsPost(h) && h !== r);
    if (b) banish(b, f.id, `a base-born child turned out by ${r.name}`);
  }
  // Unlegitimised bastards of 14+ (any house, yours too) may leave for an order; resentment and piety push them.
  // A governorship or fleet command keeps them, and wins their loyalty year by year.
  for (const c of Object.values(CH)) {
    if (!c || c.dead || F[c.f]?.ruler === c || !bastard(c)) continue;
    if (holdsPost(c)) {
      if ((c.age || 0) >= 14 && Math.random() < 0.5) c.loyalty = Math.min(10, (c.loyalty || 0) + 1);
      continue;
    }
    const opts = bastardOrders(c);
    if (!opts.length) continue;
    const p = 0.04 + ((c.loyalty ?? 5) < 4 ? 0.06 : 0) + ((c.piety || 0) >= 6 ? 0.04 : 0);
    if (Math.random() >= p) continue;
    const mine = c.f === P && isHuman(P),
      to = rnd(opts);
    joinOrder(c, to);
    if (mine && !SIM) await notify(`<h3>🕯 ${c.name} Takes the Vows</h3>${portrait(c, 70)}Denied a place in your house and given no post, <b>${c.name}</b> leaves to join <b>${F[to].name}</b>.`);
  }
}
function heirOrder(f) {
  if (!f) return [];
  const r = f.ruler,
    claim = h => bloodClaim(h, f).v,
    can = h => !h.fem || h.wm ? 1 : 0;
  return royalKin(f).sort(f.id === 2 ? (a, b) => claim(b) - claim(a) : (a, b) => can(b) - can(a) || (b.father === r?.id) - (a.father === r?.id) || b.age - a.age);
}
// ---- Epithets (M2TW-style): earned by deeds and nature, not given to everyone ----
const EPI_RULES = [[c => c.traits?.includes('Fallen') && !c.traits?.includes('Redeemed'), {
  t: 'Dark Lord',
  pre: true
}, 0.6], [c => c.traits?.includes('Redeemed'), {
  t: 'the Redeemed'
}, 0.3], [c => c.traits?.includes('Cruel') && c.traits?.includes('Bloodthirsty'), {
  t: 'the Butcher'
}, 0.3], [c => (c.wins || 0) >= 8, {
  t: 'the Conqueror'
}, 0.35], [c => (c.respect || 0) <= -9, {
  t: 'the Dread'
}, 0.25], [c => (c.respect || 0) >= 9, {
  t: 'the Great'
}, 0.25], [c => (c.survived || 0) >= 2, {
  t: 'the Unkillable'
}, 0.3], [c => (c.rim || 0) >= 5, {
  t: 'the Rimwarden'
}, 0.25], [c => c.starblade && (c.wins || 0) >= 3, {
  t: 'Starblade',
  pre: true
}, 0.2], [c => c.traits?.includes('Cyborg'), {
  t: 'the Iron'
}, 0.15], [c => c.traits?.includes('One-Armed'), {
  t: 'the One-Armed'
}, 0.15], [c => c.traits?.includes('Cruel'), {
  t: 'the Cruel'
}, 0.12], [c => c.traits?.includes('Bloodthirsty'), {
  t: 'the Red'
}, 0.12], [c => c.traits?.includes('Just'), {
  t: 'the Just'
}, 0.12], [c => c.traits?.includes('Merciful'), {
  t: 'the Merciful'
}, 0.1], [c => (c.piety || 0) >= 9, {
  t: 'the Pious'
}, 0.1], [c => c.traits?.includes('Brilliant'), {
  t: 'the Wise'
}, 0.1], [c => c.traits?.includes('Brave') && (c.wins || 0) >= 3, {
  t: 'the Fearless'
}, 0.15], [c => c.traits?.includes('Coward'), {
  t: 'the Timid'
}, 0.08], [c => c.traits?.includes('Drunkard'), {
  t: 'the Sodden'
}, 0.08], [c => c.traits?.includes('Lecher'), {
  t: 'the Lustful'
}, 0.06], [c => c.traits?.includes('Builder'), {
  t: 'the Builder'
}, 0.1], [c => c.traits?.includes('Squanderer'), {
  t: 'the Spendthrift'
}, 0.08], [c => c.traits?.includes('Dim'), {
  t: 'the Slow'
}, 0.06], [c => c.age >= 72, {
  t: 'the Old'
}, 0.08]];
function epiTick(c) {
  if (c && (c.role === 'Spy' || c.role === 'Assassin')) {
    delete c.epi;
    return;
  } // shadows leave no names behind
  if (!c || c.dead || c.age < 18 || c.role === 'Priest' || c.role === 'Master') return;
  const fallen = c.traits?.includes('Fallen') && !c.traits?.includes('Redeemed');
  if (c.epi && !(fallen && !c.epi.pre) && !(c.epi.t === 'Dark Lord' && !fallen)) return; // keep an earned name, but the Dark always renames
  if (c.epi?.t === 'Dark Lord' && !fallen) {
    delete c.epi;
  }
  const ruler = F[c.f]?.ruler === c;
  for (const [ok, e, p] of EPI_RULES) {
    if (!ok(c) || Math.random() > p * (ruler ? 1.6 : 1)) continue;
    const old = dn(c);
    c.epi = {
      ...e
    };
    c.hist.push(`Y${S.year}: becomes known as ${dn(c)}.`);
    if (c.f === P || ruler) log(`📜 ${old} of ${F[c.f]?.name || 'no house'} is now known as ${cl(c)}.`);
    return;
  }
}
// Oathbreakers of the Nightfleet are put to death by the Watch and by the houses that keep it fed.
const nmFriend = fid => fid === 1 || fid >= 0 && F[1]?.alive && ((S.nmGive?.[fid] || 0) >= 100 || S.ally.has(key(fid, 1)));
function nmJustice(g, captor) {
  if (!g?.oathbroken || !nmFriend(captor) || g.dead) return false;
  detachGen(g);
  g.dead = true;
  delete g.captive;
  S.prisoners = S.prisoners.filter(x => x !== g);
  S.wards = S.wards.filter(x => x !== g);
  hist(g, `is put to death as an oathbreaker of the Nightfleet by ${F[captor]?.name || 'his captors'}.`);
  return true;
}
// Mercenary stock: the Cloning Guild (6) and the AI Alliance (9) sell troops to the guild for instant credits
const MERC_UNIT_SELLER = {
  cloneTroopers: 6,
  cloneCommandos: 6,
  droidLegion: 9,
  droidStarfighters: 9
};
function mercSell(fid, k) {
  const U = UNITS[k];
  if (!U || !F[fid]) return 0;
  S.mercPool ??= {};
  if ((S.mercPool[k] || 0) >= 12) return 0; // the guild will not hoard endlessly
  S.mercPool[k] = (S.mercPool[k] || 0) + 1;
  const got = Math.round(U.c * 0.7);
  F[fid].gold += got;
  return got;
}
function hist(c, msg) {
  if (!c) return;
  c.hist.push(`Y${S.year}: ${msg}`);
  log(`${cl(c)} ${msg}`);
  // Toll the bell for your own people
  if (c.f === P && /\b(slain|dies|executed|assassinated|perishes|killed|burned)\b/.test(msg)) try {
    playSfx('death');
  } catch (e) {}
}
const key = (a, b) => a < b ? a + '|' + b : b + '|' + a;
const hostile = f => !!(f && (f.mods.pirate || f.mods.ff || f.rogue || f.domiri));
function atWar(a, b) {
  if (a === b) return false;
  if (a < 0 || b < 0) return true;
  if (hostile(F[a]) || hostile(F[b])) return true;
  return S.war.has(key(a, b));
}
let turnLog = null; // collects events during End Turn for the report
function log(msg) {
  if (turnLog) turnLog.push(msg);
  S.ledger.push({
    y: S.year,
    m: msg
  });
  if (S.ledger.length > 1500) S.ledger.shift();
  $('logList').innerHTML = S.ledger.slice(-25).reverse().map(e => `<div>Y${e.y}: ${e.m}</div>`).join('');
}
// The Armageddon counter fills slowly: sins count at 40% so the end comes late in a campaign.
function apoc(n, why) {
  const v = n * 0.4; // healing is as slow as harm: one peace treaty can't undo a massacre
  S.apoc = clamp(Math.round((S.apoc + v) * 10) / 10, 0, 100);
  if (why) log(`☢ Armageddon ${v > 0 ? '+' : ''}${v.toFixed(1).replace('.0', '')} (${why})`);
}
const rulerNote = (fid, msg) => {
  const r = F[fid]?.ruler;
  if (r && !r.dead) r.hist.push(`Y${S.year}: ${msg}`);
};
function ally(a, b, why = '') {
  if (a === b || a < 0 || b < 0 || S.ally.has(key(a, b))) return;
  S.war.delete(key(a, b));
  S.ally.add(key(a, b));
  log(`🤝 ${F[a].name} and ${F[b].name} forge an alliance${why ? ' — ' + why : ''}.`);
  rulerNote(a, `allies with ${F[b].name}.`);
  rulerNote(b, `allies with ${F[a].name}.`);
}
// The Nightfleet is sworn to the Wall: it may only make war on pirates, barbarians, the Dark and the horrors of the rim.
const nmCanWar = b => b < 0 || hostile(F[b]) || NM_FOES.includes(b) || F[b]?.rebelOf === 1 || F[b]?.nmRebel || nmShelters(b);
// Sacred houses: AI houses leave the Nameless Throne and the Nightfleet alone unless they have a real cause.
// Nameless (0): only hostiles, the Zithari, excommunicated/anathema houses, or a godless, ruthless ruler of another faith.
// Nightfleet (1): only its natural foes, or a house that shelters an oathbreaker (a brother who went rogue, went home or changed sides).
function nmShelters(a) {
  return Object.values(CH).some(c => c && !c.dead && c.f === a && c.oathbroken);
}
function sacredBlock(a, b) {
  const A = F[a];
  if (!A || hostile(A) || atWar(a, b)) return null;
  if (S.recl && (S.recl.by === a || S.recl.joined?.includes?.(a))) return null; // marching under a holy war
  if (b === 0) {
    if (a === 15 || exco(a) || A.rel === 'Zithari') return null;
    if (A.rel !== 'Order') {
      const p = persona(A.ruler);
      if (p.agg > 0.7 && p.honor < 0.3) return null;
    }
    return `${A.name} will not raise its hand against the Nameless Throne`;
  }
  if (b === 1) {
    if (NM_FOES.includes(a) || nmShelters(a)) return null;
    return `${A.name} will not strike the Nightfleet, the shield of the rim`;
  }
  return null;
}
function declareWar(a, b) {
  if (!isHuman(a) && sacredBlock(a, b)) return false;
  if (a === 1 && F[1]?.alive && !nmCanWar(b)) {
    if (isHuman(1)) log(`🧭 The oath of the Watch forbids war on ${F[b]?.name}. The Nightfleet guards the galaxy; it does not conquer it.`);
    return false;
  }
  if (b === 1 && !hostile(F[a]) && !NM_FOES.includes(a)) {
    st(a, -2, 'attacking the Nightfleet');
    apoc(3, `${F[a].name} attacks the Nightfleet`);
    F.forEach(x => {
      if (x.alive && x.id !== a && x.id !== 1 && !hostile(x)) grudge(x.id, a, -2, 'attacking the Nightfleet');
    });
  }
  const wasAlly = S.ally.has(key(a, b));
  if (wasAlly) {
    S.ally.delete(key(a, b));
    apoc(3, `${F[a].name} betrays an ally`);
    log(`🗡 BETRAYAL! ${F[a].name}${F[a].ruler ? ' under ' + cl(F[a].ruler) : ''} breaks its alliance with ${F[b].name}.`);
    rulerNote(a, `betrays the alliance with ${F[b].name}.`);
    rulerNote(b, `is betrayed by ${F[a].name}.`);
  } else grudge(b, a, -3, 'an unprovoked war');
  // Breaking a peace sealed with hostages: the hostages' lives are now in the other house's hands
  for (const w of hostagesOf(a, b)) (S.hbreak ??= []).push({
    w: w.id,
    by: b
  });
  if (hostagesOf(a, b).length) grudge(b, a, -4, 'breaking a peace sealed with hostages');
  if (wasAlly) {
    grudge(b, a, -10, 'betrayal of an alliance');
    F.forEach(x => {
      if (x.alive && x.id !== a && x.id !== b) grudge(x.id, a, -1);
    });
  }
  // Houses marching under a Reclamation fight in that Reclamation's war, not a war of their own
  const inRecl = S.recl?.wid && S.recl.tid === b && (S.recl.by === a || S.recl.joined?.includes?.(a));
  if (!S.war.has(key(a, b)) && !inRecl) wikiWar(a, b, warMotive(a, b, wasAlly));
  S.war.add(key(a, b));
  // Striking a faith's own throne turns every house of that faith against the attacker
  if (b === 0 || b === 15) {
    const side = b === 0 ? 'Order' : 'Zithari',
      why = b === 0 ? 'war on the Nameless' : 'war on the Cult of Zithari';
    F.forEach(x => {
      if (x.alive && x.id !== a && x.id !== b && !hostile(x) && onSide(x.id, side)) grudge(x.id, a, -6, why);
    });
    if (b === 15 && !onSide(a, 'Zithari')) {
      (S.zAnath ??= {})[a] = 10;
      log(`🌑 The Cult of Zithari declares ${F[a].name} anathema. Its worlds may now be targeted by Dark Reclamations.`);
    }
  }
  // An attack between liege and vassal tears up the oath; otherwise vassals and liege are drawn in
  if (liegeOf(a) === b) freeVassal(a, 'it takes up arms against its liege');else if (liegeOf(b) === a) freeVassal(b, 'its liege turns on it');else {
    const join = (x, y, how) => {
      if (x !== y && F[x]?.alive && F[y]?.alive && !S.war.has(key(x, y)) && !S.ally.has(key(x, y))) {
        S.war.add(key(x, y));
        log(`🛡 ${F[x].name} ${how} against ${F[y].name}.`);
      }
    };
    vassalsOf(a).forEach(v => join(v, b, 'is called to war by its liege'));
    const lb = liegeOf(b);
    if (lb != null) {
      join(lb, a, 'rides to defend its vassal');
      vassalsOf(lb).forEach(v => v !== b && join(v, a, 'answers its liege\'s call'));
    }
    vassalsOf(b).forEach(v => join(v, a, 'stands with its liege'));
  }
  if (b === 0) st(a, -3, 'war on the Nameless');else if (F[b]?.rel === 'Order' && !S.sanct.includes(b) && !(S.recl && reclSide() === 'Order' && S.recl.target.owner === b)) st(a, -1, 'war on the faithful');
  log(`⚔ ${F[a].name} declares war on ${F[b].name}!`);
  rulerNote(a, `declares war on ${F[b].name}.`);
  rulerNote(b, `is attacked by ${F[a].name}.`);
}
// Wiki: a war is named for why it was fought (claims, betrayal, blood, faith, the rim), else left to the archive to name by its battlefields
// Wars that began without declareWar (succession wars, secessions, forks, rim oathbreakers, debt wars…) still get an Archive page
function warCatchUp() {
  const open = new Set((S.wiki?.wars || []).filter(w => w.y1 == null && !w.recl).map(w => key(w.a, w.b)));
  for (const k of S.war) {
    if (open.has(k)) continue;
    const [a, b] = k.split('|').map(Number);
    if (!F[a]?.alive || !F[b]?.alive) continue;
    if (S.recl?.wid && (S.recl.tid === a || S.recl.tid === b)) continue; // fought inside the Reclamation's war
    // the challenger (pretender, rebel, fork) is the attacker
    const [x, y] = claimOf(F[b]) === a || F[b]?.rebelOf === a || F[b]?.rogue ? [b, a] : [a, b];
    wikiWar(x, y, warMotive(x, y, false));
    open.add(k);
  }
}
function warMotive(a, b, wasAlly) {
  const A = F[a],
    B = F[b],
    ra = A?.ruler,
    rb = B?.ruler,
    first = c => (c?.name || '').split(' ')[0];
  const n = id => systems.filter(s => s.owner === id).length;
  const o = {
    ra: ra?.id,
    rb: rb?.id,
    wa: n(a),
    wb: n(b)
  };
  const why = (S.memWhy || {})[mkey(a, b)] || '',
    whyT = why.replace(/\s*\(Y\d+\)$/, '');
  const exe = /execution of (.+)$/.exec(whyT);
  if (claimOf(A) === b || claimOf(B) === a) {
    const pre = claimOf(A) === b ? ra : rb,
      par = claimOf(A) === b ? B : A;
    return {
      ...o,
      name: `War of the ${par?.name?.replace(/^The /, '') || 'Throne'} Succession`,
      why: `${first(pre)}'s claim to the throne of ${par?.name}`
    };
  }
  if (S.recl && S.recl.target?.owner === b && S.recl.joined?.includes?.(a)) return {
    ...o,
    name: `The ${S.recl.target.name} Reclamation`,
    why: `the ${reclSide()} Reclamation of the holy world ${S.recl.target.name}`
  };
  if (wasAlly) return {
    ...o,
    name: `War of the Broken Oath`,
    why: `${A.name}'s betrayal of its alliance with ${B.name}`
  };
  if (exe) return {
    ...o,
    name: `War of ${exe[1].split(' ')[0]}'s Blood`,
    why: `vengeance for the execution of ${exe[1]}`
  };
  if (b === 0) return {
    ...o,
    name: `The Heretic War of ${first(ra) || A.name}`,
    why: `${A.name}'s defiance of the Nameless Throne`
  };
  if (S.exco?.includes?.(b)) return {
    ...o,
    name: `The Crusade against ${B.name}`,
    why: `the excommunication of ${B.name}`
  };
  if (a === 1 || b === 1) return {
    ...o,
    name: `The Rim War of Y${S.year}`,
    why: a === 1 ? `the Nightfleet's watch against ${B.name}` : `${A.name}'s attack on the Nightfleet`
  };
  if (/vendetta|blood|ransom|insult|refus/i.test(whyT)) return {
    ...o,
    name: `The Grudge War`,
    why: whyT
  };
  if (whyT && opinion(a, b) <= -10) return {
    ...o,
    why: whyT
  };
  if (o.wa >= o.wb * 2.5 && o.wb > 0) return {
    ...o,
    why: `${first(ra) || A.name}'s ambition to conquer a weaker neighbour`
  };
  return {
    ...o,
    why: ra ? `the ambition of ${ra.name}` : ''
  };
}
function makePeace(a, b) {
  if (!S.war.has(key(a, b))) return;
  // Peace in a claim war settles the throne: whoever holds more of the realm keeps (or takes) the title
  const cl0 = claimOf(F[a]) === b ? a : claimOf(F[b]) === a ? b : null;
  if (cl0 != null) {
    const par = cl0 === a ? b : a,
      n = id => systems.filter(s => s.owner === id).length;
    if (n(cl0) > n(par)) unifyClaim(cl0, 'is recognised as rightful ruler in the peace');else crushClaim(cl0, 'accepts the peace and bends the knee');
    return;
  }
  S.war.delete(key(a, b));
  wikiPeace(a, b, systems.filter(s => s.owner === a).length, systems.filter(s => s.owner === b).length);
  log(`🕊 ${F[a].name} and ${F[b].name} sign a peace.`);
  rulerNote(a, `makes peace with ${F[b].name}.`);
  rulerNote(b, `makes peace with ${F[a].name}.`);
  apoc(-2, `${F[a].name} & ${F[b].name} make peace`);
  grudge(a, b, 2);
  grudge(b, a, 2);
  // Vassals lay down arms with their liege
  for (const [x, y] of [[a, b], [b, a]]) vassalsOf(x).forEach(v => {
    if (S.war.has(key(v, y))) {
      S.war.delete(key(v, y));
      wikiPeace(v, y, 0, 0);
    }
  });
  // The treaty's terms (prisoners, hostages) are settled next turn step (hostageTick)
  (S.hxq ??= []).push({
    a,
    b
  });
}

// ================= Vassalage: weak houses kneel to strong ones for protection =================
// S.vassal = {vassalFid: liegeFid}. Liege and vassal are allied; the vassal pays a yearly tribute,
// is called into the liege's new wars, and the liege answers any attack on the vassal.
const liegeOf = fid => (S.vassal ??= {})[fid] ?? null;
const vassalsOf = fid => Object.keys(S.vassal ??= {}).map(Number).filter(v => S.vassal[v] === fid && F[v]?.alive);
const vassOK = fid => fid >= 0 && F[fid]?.alive && !hostile(F[fid]) && fid !== 0 && fid !== 1 && !F[fid].mods?.ff && !F[fid].domiri;
const worldsOf = fid => systems.filter(s => s.owner === fid).length;
// Tribute is the liege's choice: S.vfree {vassal: true} marks an oath without tribute
const paysTrib = v => !(S.vfree ??= {})[v];
const setTrib = (v, on) => {
  S.vfree ??= {};
  if (on) delete S.vfree[v];else S.vfree[v] = true;
};
const tribOf = v => paysTrib(v) ? Math.min(Math.max(0, Math.floor(F[v]?.gold || 0)), 15 * worldsOf(v)) : 0;
// A bloc: a house plus all its (sub)vassals
const blocOf = fid => [fid, ...vassalsOf(fid).flatMap(v => blocOf(v))];
const blocWorlds = fid => blocOf(fid).reduce((t, x) => t + worldsOf(x), 0);
// Coalitions: when one bloc towers over the galaxy, frightened houses band together against it.
// S.coal = {h: hegemon, m: [members], y}. Dissolves when the hegemon's bloc shrinks below the line.
async function coalitionTick() {
  const total = systems.filter(s => s.owner >= 0).length || 1;
  const heads = F.filter(f => f.alive && !hostile(f) && liegeOf(f.id) == null);
  const sizes = heads.map(f => ({
    f,
    w: blocWorlds(f.id)
  })).sort((a, b) => b.w - a.w);
  const big = sizes[0],
    next = sizes[1]?.w || 1;
  const towering = x => x && (x.w >= 14 || x.w >= total * 0.3) && x.w >= next * 1.6;
  if (S.coal) {
    const h = F[S.coal.h],
      hw = h?.alive ? blocWorlds(h.id) : 0;
    if (!h?.alive || hw < Math.max(10, total * 0.22)) {
      log(`🕊 The coalition against ${h?.name || 'a fallen power'} dissolves — the danger has passed.`);
      S.coal = null;
    }
    return;
  }
  if (!towering(big)) return;
  const h = big.f,
    bloc = new Set(blocOf(h.id));
  const m = [];
  for (const f of heads) {
    if (bloc.has(f.id) || f.id === 18 || isHuman(f.id) || S.ally.has(key(f.id, h.id))) continue;
    if (f.id === 1 && !nmCanWar(h.id)) continue;
    if (sacredBlock(f.id, h.id)) continue;
    const near = systems.some(s => s.owner === f.id && s.links.some(l => bloc.has(l.owner)));
    const op = opinion(f.id, h.id),
      p = persona(f.ruler);
    const odds = (near ? 0.45 : 0.15) + (atWar(f.id, h.id) ? 0.4 : 0) - op * 0.02 + p.agg * 0.2 - p.honor * 0.1;
    if (Math.random() < odds) m.push(f.id);
  }
  if (m.length < 2) return;
  S.coal = {
    h: h.id,
    m,
    y: S.year
  };
  for (let i = 0; i < m.length; i++) for (let j = i + 1; j < m.length; j++) ally(m[i], m[j], `the coalition against ${h.name}`);
  m.forEach(x => {
    if (!atWar(x, h.id)) declareWar(x, h.id);
    grudge(x, h.id, -4, 'its hunger for the galaxy');
  });
  log(`⚔ A grand coalition (${m.map(x => F[x].name).join(', ')}) rises against ${h.name}.`);
  if (SIM) return;
  if (isMe(h.id)) await notify(`<h3>⚔ A Grand Coalition</h3>Your bloc holds ${big.w} worlds. Frightened houses have banded together against you:<br><b>${m.map(x => F[x].name).join(', ')}</b>.<br><small>The coalition holds until your bloc shrinks.</small>`);else if (F[P]?.alive && !bloc.has(P)) {
    const r = await ask(`<h3>⚔ A Grand Coalition</h3><b>${h.name}</b> commands ${big.w} worlds. ${m.map(x => F[x].name).join(', ')} have sworn to break it and ask you to join.`, ['⚔ Join the coalition', '🚪 Stay out']);
    if (String(r).startsWith('⚔')) {
      S.coal.m.push(P);
      m.forEach(x => ally(P, x, `the coalition against ${h.name}`));
      if (!atWar(P, h.id)) declareWar(P, h.id);
    }
  }
}
function swearFealty(v, l, why = '') {
  if (!vassOK(v) || !vassOK(l) || v === l || liegeOf(v) != null || liegeOf(l) === v) return false;
  vassalsOf(v).forEach(x => {
    S.vassal[x] = l;
    WV('sworn', x, l, 0, `passed from ${F[v].name} to its new overlord`);
  }); // his own vassals pass to the new overlord
  if (S.war.has(key(v, l))) makePeace(v, l);
  S.vassal[v] = l;
  ally(v, l, 'an oath of fealty');
  WV('sworn', v, l, 0, why);
  // An AI liege decides whether to take tribute: the greedy always do, the honourable or generous may waive it for loyalty
  if (!isHuman(l)) {
    const r = F[l].ruler,
      pr = persona(r);
    setTrib(v, has(r, 'Greedy') ? true : has(r, 'Generous') ? false : Math.random() > pr.honor * 0.6);
  } else setTrib(v, true);
  grudge(l, v, 3);
  log(`🙇 ${F[v].name}${F[v].ruler ? ' under ' + cl(F[v].ruler) : ''} swears fealty to ${F[l].name}${why ? ' — ' + why : ''}.`);
  rulerNote(v, `bends the knee to ${F[l].name}.`);
  rulerNote(l, `takes ${F[v].name} as a vassal.`);
  return true;
}
function freeVassal(v, why = '') {
  const l = liegeOf(v);
  if (l == null) return;
  delete S.vassal[v];
  WV('end', v, l, /arms|turns on/.test(why) ? 'war' : /outgrown|slights/.test(why) ? 'broke' : /renounced/.test(why) ? 'renounced' : 'released', why);
  if (F[v]?.alive && F[l]?.alive) {
    log(`⛓ ${F[v].name} is no longer a vassal of ${F[l].name}${why ? ' — ' + why : ''}.`);
    rulerNote(v, `ends its vassalage to ${F[l].name}.`);
    rulerNote(l, `loses ${F[v].name} as a vassal.`);
  }
}
// Odds a house kneels when a stronger house demands it
function submitOdds(lord, tgt, sk = 3) {
  if (!vassOK(lord) || !vassOK(tgt) || liegeOf(tgt) != null) return 0;
  const ratio = power(lord) / Math.max(1, power(tgt)),
    p = persona(F[tgt].ruler),
    op = opinion(tgt, lord);
  const threat = F.some(e => e.alive && e.id !== lord && atWar(tgt, e.id) && power(e.id) > power(tgt));
  return clamp(-0.25 + Math.min(ratio, 6) * 0.09 + op * 0.015 + (threat ? 0.2 : 0) + (sk - 4) * 0.03 - p.agg * 0.2 - (F[tgt].ruler?.traits?.includes('Ambitious') ? 0.15 : 0), 0, 0.85);
}
// Odds a liege accepts an offered oath
const fealtyAcceptOdds = (lord, v, sk = 3) => vassOK(lord) && vassOK(v) && liegeOf(lord) !== v ? clamp(0.5 + opinion(lord, v) * 0.03 + (sk - 4) * 0.03 - (F.filter(e => e.alive && atWar(v, e.id)).length ? 0.1 : 0), 0.05, 0.95) : 0;
// Yearly: tribute, broken houses, and vassals who grow strong or bitter enough to break free
function vassalTick() {
  for (const v of Object.keys(S.vassal ??= {}).map(Number)) {
    const l = S.vassal[v];
    if (!F[v]?.alive || !F[l]?.alive) {
      delete S.vassal[v];
      WV('end', v, l, 'fell');
      continue;
    }
    const t = tribOf(v);
    if (t > 0) {
      F[v].gold -= t;
      F[l].gold += t;
      WV('pay', v, l, t);
      if (isHuman(v) || isHuman(l)) log(`🙇 ${F[v].name} pays ${t} credits in tribute to ${F[l].name}.`);
    } else if (!paysTrib(v)) grudge(v, l, 1); // a light yoke breeds gratitude
    if (isHuman(v)) continue;
    const ratio = power(v) / Math.max(1, power(l)),
      op = opinion(v, l),
      p = persona(F[v].ruler);
    const ch = (ratio > 1.2 ? 0.12 : 0) + (op <= -10 ? 0.1 : 0) + (F[v].ruler?.traits?.includes('Ambitious') ? 0.04 : 0) - p.honor * 0.05 - (paysTrib(v) ? 0 : 0.04);
    if (ch > 0 && Math.random() < ch) {
      freeVassal(v, ratio > 1.2 ? 'it has outgrown its master' : 'too many slights to bear');
      grudge(l, v, -6, 'a broken oath of fealty');
      if (!isHuman(l) && Math.random() < 0.5 + persona(F[l].ruler).agg * 0.3) declareWar(l, v);else if (isMe(l)) notify(`<h3>⛓ ${F[v].name} breaks its oath</h3>${cl(F[v].ruler)} renounces your overlordship. ${ratio > 1.2 ? 'The vassal has grown stronger than its liege.' : 'Old slights have festered.'} You may make war on them, or let them go.`);
    }
  }
}

// ================= Memory & Ambition: houses remember, rulers scheme =================
// S.mem['a>b'] = how house a feels about house b (−30 hatred … +30 kinship). S.memWhy keeps the last strong reason.
const mkey = (a, b) => a + '>' + b;
function opinion(a, b) {
  return (S.mem ??= {})[mkey(a, b)] || 0;
}
function grudge(a, b, n, why) {
  if (a == null || b == null || a < 0 || b < 0 || a === b || !F[a] || !F[b] || !n) return;
  S.mem ??= {};
  S.memWhy ??= {};
  const k = mkey(a, b);
  S.mem[k] = clamp((S.mem[k] || 0) + n, -30, 30);
  if (why && Math.abs(n) >= 3) {
    S.memWhy[k] = `${why} (Y${S.year})`;
    if (n <= -4) rulerNote(a, `swears ${F[b].name} will pay for ${why}.`);
    if (a !== P && (b === P || isHuman(b))) log(`${n < 0 ? '😠' : '💛'} ${F[a].name} ${n < 0 ? 'will not forget' : 'remembers kindly'}: ${why}.`);
  }
}
const moodTxt = v => v <= -15 ? 'Blood feud' : v <= -6 ? 'Hostile' : v < -1 ? 'Wary' : v < 2 ? 'Neutral' : v < 8 ? 'Warm' : 'Kinship';
// The ruler's own traits decide what kind of neighbour his house is.
function persona(c) {
  if (!c) return {
    agg: 0.5,
    honor: 0.5
  };
  let agg = (c.violence || 5) / 12,
    honor = 0.45;
  for (const t of c.traits || []) {
    if (['Ambitious', 'Bloodthirsty', 'Cruel', 'Fallen', 'Brave'].includes(t)) agg += 0.15;
    if (['Coward', 'Merciful'].includes(t)) agg -= 0.15;
    if (['Loyal', 'Just', 'Pious', 'Redeemed', 'Blessed'].includes(t)) honor += 0.18;
    if (['Ambitious', 'Fallen', 'Cruel', 'Godless'].includes(t)) honor -= 0.15;
  }
  if (c.vendetta != null) agg += 0.2;
  return {
    agg: clamp(agg, 0, 1.5),
    honor: clamp(honor, 0, 1)
  };
}
const power = fid => systems.filter(s => s.owner === fid).reduce((t, s) => t + s.fleet * 2 + s.legions + s.elite * 2, 0) + units.filter(u => u.owner === fid && u.type === 'fleet').reduce((t, u) => t + (u.fleet || 0) * 2 + (u.legions || 0) + (u.elite || 0) * 2, 0);
const bloodTie = (a, b) => [F[a]?.ruler, ...(F[a]?.heirs || [])].some(c => c && CH[c.spouse] && !CH[c.spouse].dead && CH[c.spouse].f === b);
function ambition(f, mine) {
  const p = persona(f.ruler),
    myPow = power(f.id);
  const nbs = [...new Set(mine.flatMap(s => s.links.map(l => l.owner)))].filter(o => o >= 0 && o !== f.id && F[o]?.alive && !hostile(F[o]));
  const wars = F.filter(o => o.alive && o.id !== f.id && !hostile(o) && atWar(f.id, o.id));
  // War: grudges, weakness, distraction and the ruler's temper pick the target
  if (wars.length < 2) {
    let best = null,
      bs = 0,
      bwhy = '';
    for (const o of nbs) {
      if (atWar(f.id, o) || f.id === 1 && !nmCanWar(o) || sacredBlock(f.id, o) || liegeOf(f.id) === o || liegeOf(o) === f.id) continue;
      const op = opinion(f.id, o),
        ratio = myPow / Math.max(1, power(o));
      const busy = F.filter(x => x.alive && x.id !== o && !hostile(x) && atWar(o, x.id)).length;
      let sc = -op * 0.1 + (ratio - 1) * 0.6 * p.agg + busy * 0.35 * (1 - p.honor) + p.agg * 0.3;
      if (S.ally.has(key(f.id, o))) sc -= 0.6 + 1.4 * p.honor;
      if (bloodTie(f.id, o) || bloodTie(o, f.id)) sc -= 0.8;
      if (f.ruler?.vendetta === o) sc += 1.5;
      if (sc > bs) {
        bs = sc;
        best = o;
        bwhy = f.ruler?.vendetta === o ? 'a blood vendetta' : op <= -8 ? `old wrongs: ${S.memWhy?.[mkey(f.id, o)] || 'many'}` : busy && S.ally.has(key(f.id, o)) ? 'an ally distracted by war' : ratio > 1.5 ? 'smelling weakness' : 'naked ambition';
      }
    }
    if (best != null && Math.random() < Math.min(0.12, bs * 0.035)) {
      log(`🎯 ${cl(f.ruler)} of ${f.name} moves against ${F[best].name} — ${bwhy}.`);
      declareWar(f.id, best);
    }
  }
  // Peace: exhaustion, honour and goodwill — hatred keeps wars burning
  for (const o of wars) {
    if (isHuman(o.id)) continue;
    const op = opinion(f.id, o.id),
      tired = myPow < power(o.id) * 0.6 || f.gold < 50;
    if (Math.random() < 0.015 + (tired ? 0.06 : 0) + p.honor * 0.02 + op * 0.004) {
      sendEnvoy(f.id, o.id, 'peace');
      break;
    }
  }
  // Alliances of convenience and friendship
  if (Math.random() < 0.05) {
    const foes = new Set(wars.map(o => o.id));
    const c = F.find(o => o.alive && o.id !== f.id && !isHuman(o.id) && !hostile(o) && !atWar(f.id, o.id) && !S.ally.has(key(f.id, o.id)) && (opinion(f.id, o.id) + opinion(o.id, f.id) >= 8 || [...foes].some(e => atWar(o.id, e))));
    if (c) sendEnvoy(f.id, c.id, 'ally');
  }
  // Trade rights between friendly AI neighbours (+12/turn each, ended by war)
  if (Math.random() < 0.04) {
    S.trade ??= new Set();
    const o = nbs.find(o => !isHuman(o) && !atWar(f.id, o) && !S.trade.has(key(f.id, o)) && opinion(o, f.id) >= 2 && houseHate(o, f.id) < 8);
    if (o != null) {
      S.trade.add(key(f.id, o));
      WA('dip', {
        f: f.id,
        to: o,
        ok: true,
        txt: 'agrees trade rights'
      });
    }
  }
  // Marriages across houses: a princess for another house's heir
  if (!celibate(f.id) && !f.mods?.coven && Math.random() < 0.08) {
    const pr = f.princesses.find(x => !x.dead && x.age >= 16 && !x.betrothed && !x.spouse);
    if (pr) {
      const cands = F.filter(o => o.alive && o.id !== f.id && !isHuman(o.id) && !hostile(o) && !celibate(o.id) && !atWar(f.id, o.id) && opinion(o.id, f.id) > -4 && houseHate(f.id, o.id) < 12).flatMap(o => [o.ruler, ...o.heirs].filter(m => mayWed(m) && !m.fem && m.age >= 16 && (m.betrothed == null || CH[m.betrothed]?.dead) && (m.spouse == null || CH[m.spouse]?.dead) && hateOf(f.id, m) < 6).map(m => [m, opinion(f.id, o.id) + (nbs.includes(o.id) ? 3 : 0) + Math.random() * 4 - houseHate(f.id, o.id) * 0.3]));
      cands.sort((a, b) => b[1] - a[1]);
      const g = cands[0]?.[0];
      if (g) sendEnvoy(f.id, g.f, 'wed', {
        pr: pr.id,
        groom: g.id
      });
    }
  }
  // Vassalage: a beleaguered house seeks a protector; a mighty one demands the knee of a weak neighbour
  if (vassOK(f.id) && liegeOf(f.id) == null && !vassalsOf(f.id).length && Math.random() < 0.05) {
    const foe = Math.max(0, ...wars.map(o => power(o.id)));
    if (foe > myPow * 2) {
      const lord = nbs.filter(o => vassOK(o) && liegeOf(o) == null && !atWar(f.id, o) && power(o) > myPow * 1.5 && opinion(f.id, o) > -6).sort((x, y) => power(y) - power(x))[0];
      if (lord != null) sendEnvoy(f.id, lord, 'vassal');
    }
  }
  if (vassOK(f.id) && liegeOf(f.id) == null && vassalsOf(f.id).length < 8 && Math.random() < 0.03 * (0.5 + p.agg)) {
    const t = nbs.filter(o => vassOK(o) && liegeOf(o) == null && !vassalsOf(o).length && power(o) * 3 < myPow && worldsOf(o) <= 6 && !atWar(f.id, o))[0];
    if (t != null) sendEnvoy(f.id, t, 'submit');
  }
  // Desperate houses at war borrow blood-money
  if (f.id !== 5 && F[5]?.alive && F[5].gold >= 400 && wars.length && f.gold < 100 && !atWar(f.id, 5) && !S.loans.some(l => l.debtor === f.id) && Math.random() < 0.06) {
    f.gold += 400;
    F[5].gold -= 400;
    S.loans.push({
      debtor: f.id,
      owe: 560,
      due: S.turn + 10
    });
    log(`🩸 ${f.name} borrows from the Bloodbank to fund its war.`);
  }
}

// ===== Embassies: diplomacy is carried by real Diplomat agents travelling the hyperlanes =====
// kinds: ally, peace, wed {pr, groom}, tribute, bloodprice
const envoyBusy = (fid, to, kind) => units.some(u => u.type === 'agent' && u.owner === fid && u.mission && u.mission.to === to && (!kind || u.mission.kind === kind));
function sendEnvoy(fid, to, kind, extra = {}) {
  const f = F[fid];
  if (!f?.alive || !F[to]?.alive || envoyBusy(fid, to)) return null;
  if (units.filter(u => u.owner === fid && u.mission).length >= 3) return null;
  const home = f.capital?.owner === fid ? f.capital : systems.find(s => s.owner === fid);
  let a;
  if (kind === 'wed') {
    // The bride travels herself, as in M2TW
    const pr = CH[extra.pr];
    if (!pr || pr.dead) return null;
    a = units.find(u => u.type === 'agent' && u.char === pr);
    if (a?.mission) return null;
    if (!a) {
      if (!home) return null;
      f.princesses = f.princesses.filter(x => x !== pr);
      delete pr.stayHome;
      a = addUnit({
        type: 'agent',
        role: 'Princess',
        owner: fid,
        sys: home,
        char: pr,
        mp: 3
      });
      hist(pr, `sets out from ${home.name} to seek a match with ${F[to].name}.`);
    }
  } else {
    // Diplomatic missions: an idle princess or diplomat, else a new diplomat
    a = units.find(u => u.type === 'agent' && u.owner === fid && (u.role === 'Princess' || u.role === 'Diplomat') && !u.mission);
    if (!a) {
      if (!home) return null;
      a = addAgent(fid, home, 'Diplomat');
    }
  }
  a.mission = {
    to,
    kind,
    left: 14,
    ...extra
  };
  if (isHuman(to) && a.sys.owner !== to) log(`${a.role === 'Princess' ? '👸 A princess' : '🕊 A diplomat'} of ${f.name} is seen setting out toward your realm.`);
  return a;
}
// Move a diplomat one jump toward the target house; true when he stands in its territory
function envoyStep(a) {
  const m = a.mission,
    to = m.to;
  if (a.sys.owner === to) return true;
  const n = stepToward(a.sys, s => s.owner === to);
  if (!n) {
    delete a.mission;
    return false;
  }
  a.sys = n;
  return n.owner === to;
}
// AI-to-AI deliveries resolve at once; deliveries to humans wait for that player's turn (envoys())
async function envoyArrive(a) {
  const m = a.mission,
    fid = a.owner,
    to = m.to,
    f = F[fid],
    o = F[to];
  if (!f?.alive || !o?.alive) {
    delete a.mission;
    return;
  }
  if (isHuman(to)) {
    m.ready = true;
    return;
  }
  const op = opinion(to, fid),
    p = persona(o.ruler);
  // Influence / Charm: a gifted envoy sways the court
  const sk = a.role === 'Princess' ? (a.char.charm ?? a.char.skill ?? 3) + (a.char.dip || 0) * 0.5 : a.char.skill ?? 3,
    sw = (sk - 4) * 0.03;
  const D = (ok, txt) => WA('dip', {
    a: a.char?.id,
    f: fid,
    to,
    s: a.sys?.i,
    ok,
    txt
  });
  if (m.kind === 'ally') {
    const common = F.some(e => e.alive && atWar(fid, e.id) && atWar(to, e.id));
    if (!atWar(fid, to) && !S.ally.has(key(fid, to)) && (op >= 2 - sk * 0.2 || common) && Math.random() < 0.55 + op * 0.03 + (common ? 0.25 : 0) + sw) {
      ally(fid, to, op >= 4 ? 'old friendship' : 'a common enemy');
      grudge(fid, to, 2);
      grudge(to, fid, 2);
      D(true, `seals an alliance (${op >= 4 ? 'old friendship' : 'a common enemy'})`);
    } else {
      grudge(fid, to, -1, 'a rebuffed embassy');
      D(false, 'seeks an alliance and is rebuffed');
    }
  } else if (m.kind === 'peace') {
    const tired = power(to) < power(fid) * 0.7 || o.gold < 50;
    if (atWar(fid, to) && Math.random() < 0.3 + (tired ? 0.35 : 0) + p.honor * 0.15 + op * 0.02 + sw) {
      makePeace(fid, to);
      D(true, 'negotiates peace');
    } else D(false, 'sues for peace and is refused');
  } else if (m.kind === 'wed') {
    const pr = CH[m.pr],
      g = CH[m.groom];
    if (pr && g && !pr.dead && !g.dead && !pr.spouse && !pr.betrothed && mayWed(g) && (g.spouse == null || CH[g.spouse]?.dead) && !atWar(fid, to) && op - houseHate(to, fid) * 0.3 > -4 - sk * 0.3) {
      D(true, `arranges the marriage of ${pr.name} to ${g.name}`);
      wed(pr, g);
      f.princesses = f.princesses.filter(x => x !== pr);
      ally(fid, g.f, `sealed by the marriage of ${pr.name}`);
      grudge(fid, g.f, 5);
      grudge(g.f, fid, 5);
      delete a.mission;
      if (a.char === pr) removeUnit(a);
      return;
    }
    D(false, `seeks a match for ${pr?.name || 'a princess'} and is refused${houseHate(to, fid) >= 10 ? ' — old hatreds stand between the houses' : ''}`);
  } else if (m.kind === 'vassal') {
    if (Math.random() < fealtyAcceptOdds(to, fid, sk)) {
      swearFealty(fid, to, 'seeking protection');
      D(true, `swears ${f.name} to ${o.name} as a vassal`);
    } else D(false, `offers fealty to ${o.name} and is turned away`);
  } else if (m.kind === 'submit') {
    if (Math.random() < submitOdds(fid, to, sk)) {
      swearFealty(to, fid, 'cowed by its might');
      D(true, `demands the submission of ${o.name}, who kneels`);
    } else {
      grudge(to, fid, -4, 'a demand to kneel');
      D(false, `demands the submission of ${o.name} and is refused`);
      if (Math.random() < 0.25 * persona(f.ruler).agg) declareWar(fid, to);
    }
  } else if (m.kind === 'nmplea') nmAnswer(to, sk, m.levy || 0, a.char, a.sys);else D(undefined, `delivers a ${m.kind} demand`);
  agentXP(a.char, 'Diplomat', true);
  delete a.mission;
}
async function envoyTurn(a) {
  if (--a.mission.left <= 0) {
    delete a.mission;
    return;
  }
  if (a.mission.ready) return; // waiting in the target's court
  // Nightfleet couriers cover two jumps a turn
  for (let i = 0; i < (a.owner === 1 ? 2 : 1) && a.mission && !a.mission.ready; i++) if (envoyStep(a)) {
    await envoyArrive(a);
    break;
  }
}
// The player's court receives every foreign diplomat standing in his realm
async function receiveEnvoys() {
  for (const a of units.filter(u => u.type === 'agent' && u.mission?.ready && u.mission.to === P)) {
    if (!units.includes(a)) continue;
    const m = a.mission,
      f = F[a.owner];
    delete a.mission;
    if (!f?.alive || !f.ruler) continue;
    const why = S.memWhy?.[mkey(f.id, P)];
    if (m.kind === 'nmplea') {
      if (!atWar(P, 1)) await nmTithe(a, m);
      continue;
    }
    const head = t => `<h3>${t}</h3><div class="ccard">${portrait(a.char, 56)}<div style="font-size:12px"><b>${a.char.name}</b>, ${a.role === 'Princess' ? 'princess' : 'diplomat'} of ${f.name}, arrives at ${a.sys.name}.</div></div>`;
    if (m.kind === 'wed') {
      const pr = CH[m.pr],
        groom = CH[m.groom];
      if (!pr || pr.dead || pr.spouse || pr.betrothed || !groom || groom.dead || !mayWed(groom) || groom.spouse != null && !CH[groom.spouse]?.dead || atWar(P, f.id)) continue;
      const c = await ask(`<h3>💍 A Marriage Offer from ${f.name}</h3><div class="ccard">${portrait(pr, 72)}<div style="font-size:12px"><b>${pr.name}</b>, age ${pr.age}, arrives in person at ${a.sys.name}<br>${attrStr(pr)}<br>${pr.traits.join(', ') || ''}</div></div>${cl(f.ruler)} offers the hand of ${pr.name} to <b>${groom.name}</b>, binding your houses in alliance.`, ['Accept', 'Decline']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Accept',
        txt: `offers the hand of ${pr.name} to ${groom.name}${c === 'Accept' ? '' : ' — declined'}`
      });
      if (c === 'Accept') {
        wed(groom, pr);
        f.princesses = f.princesses.filter(x => x !== pr);
        ally(P, f.id, `sealed by the marriage of ${pr.name}`);
        grudge(f.id, P, 6, `the marriage of ${pr.name}`);
        if (a.char === pr) removeUnit(a);
      } else grudge(f.id, P, -3, `a refused marriage`);
    } else if (m.kind === 'vassal') {
      if (atWar(P, f.id) || liegeOf(f.id) != null || liegeOf(P) === f.id) continue;
      const c = await ask(`${head(`🙇 ${f.name} offers fealty`)}${cl(f.ruler)} (${worldsOf(f.id)} worlds) begs your protection. As your vassal ${f.name} would be your ally and join your wars. You may take tribute each year (up to 15 per world) or waive it for their gratitude, but you must defend it when it is attacked.`, ['Accept', 'Decline']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Accept',
        txt: `offers fealty${c === 'Accept' ? ' — accepted' : ' — declined'}`
      });
      if (c === 'Accept') swearFealty(f.id, P, 'seeking protection');else grudge(f.id, P, -2, 'a refused oath of fealty');
    } else if (m.kind === 'submit') {
      if (atWar(P, f.id) || liegeOf(P) != null) continue;
      const c = await ask(`${head(`👑 ${f.name} demands your submission`)}${cl(f.ruler)} (${worldsOf(f.id)} worlds, far stronger than you) demands you bend the knee. As a vassal you would be called to his wars and${has(f.ruler, 'Greedy') ? ' surely' : ' perhaps'} pay up to 15 credits per world each year, but he would defend you. If you refuse, he may make war.`, ['🙇 Submit', 'Refuse']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === '🙇 Submit',
        txt: `demands submission${c === '🙇 Submit' ? ' — the house kneels' : ' — refused'}`
      });
      if (c === '🙇 Submit') swearFealty(P, f.id, 'cowed by its might');else {
        grudge(f.id, P, -4, 'a refusal to kneel');
        if (Math.random() < 0.3 + persona(f.ruler).agg * 0.3) declareWar(f.id, P);
      }
    } else if (m.kind === 'bloodprice') {
      if (atWar(P, f.id)) continue;
      const c = await ask(`${head(`😠 Envoy from ${f.name}`)}${cl(f.ruler)} has not forgotten ${why || 'your offences'}. He demands 150 credits in blood-price, or there will be war.`, ['Pay', 'Refuse']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Pay',
        txt: `demands 150 credits in blood-price${c === 'Pay' ? ' — paid' : ' — refused'}`
      });
      if (c === 'Pay' && pay(150)) {
        f.gold += 150;
        grudge(f.id, P, 5, 'a blood-price paid');
      } else if (Math.random() < 0.6 + persona(f.ruler).agg * 0.2) {
        log(`🎯 ${cl(f.ruler)} of ${f.name} comes for vengeance — ${why || 'old wrongs'}.`);
        declareWar(f.id, P);
      }
    } else if (m.kind === 'peace') {
      if (!atWar(P, f.id)) continue;
      const gift = f.gold > 300;
      const c = await ask(`${head(`🕊 Envoy from ${f.name}`)}${f.ruler.name} offers peace${gift ? ' and 150 credits' : ''}.`, ['Accept', 'Refuse']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Accept',
        txt: `offers peace${gift ? ' and 150 credits' : ''}${c === 'Accept' ? ' — accepted' : ' — refused'}`
      });
      if (c === 'Accept') {
        makePeace(P, f.id);
        if (gift) {
          f.gold -= 150;
          F[P].gold += 150;
        }
      }
    } else if (m.kind === 'tribute') {
      if (atWar(P, f.id) || S.ally.has(key(P, f.id))) continue;
      const c = await ask(`${head(`🕊 Envoy from ${f.name}`)}${f.ruler.name} demands 100 credits in tribute.`, ['Pay', 'Refuse']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Pay',
        txt: `demands 100 credits in tribute${c === 'Pay' ? ' — paid' : ' — refused'}`
      });
      if (c === 'Pay' && pay(100)) f.gold += 100;else if (Math.random() < 0.4) declareWar(f.id, P);
    } else if (m.kind === 'ally') {
      if (atWar(P, f.id) || S.ally.has(key(P, f.id))) continue;
      const c = await ask(`${head(`🕊 Envoy from ${f.name}`)}${f.ruler.name} proposes an alliance.`, ['Accept', 'Decline']);
      WA('dip', {
        a: a.char?.id,
        f: f.id,
        to: P,
        s: a.sys?.i,
        ok: c === 'Accept',
        txt: `proposes an alliance${c === 'Accept' ? ' — accepted' : ' — declined'}`
      });
      if (c === 'Accept') {
        ally(P, f.id);
        apoc(-1, 'alliance');
      }
    }
  }
}
function mkChar(f, age) {
  const m = F[f]?.mods || {};
  const cult = cultureOf(f);
  const c = {
    id: ++ID.c,
    hist: [],
    cult,
    name: uniqueName(cult, false),
    age,
    skill: ri(1, 5),
    loyalty: ri(3, 9),
    respect: ri(-3, 3),
    blood: ri(1, 10),
    piety: ri(1, 9),
    violence: ri(1, 9),
    purity: ri(1, 9),
    reverence: ri(1, 9),
    admin: ri(1, 6),
    traits: [],
    f
  };
  if (m.spice && Math.random() < 0.5) addTrait(c, 'Spice Addict', true);
  if (m.cheap && Math.random() < 0.4) addTrait(c, 'Monstrous', true);
  if (m.sith) {
    c.respect -= 3;
    if (Math.random() < 0.4) addTrait(c, 'Cruel', true);
  } // the Dark Path breeds dread
  if (m.gray) {
    c.skill = Math.min(10, c.skill + 2);
    c.piety = Math.min(10, c.piety + 1);
  } // Gray Wardens: trained from childhood
  if (m.warrior) c.skill = Math.min(10, c.skill + 1); // Ashborn war-culture
  if (m.upgrade && age >= 18) {
    const r = Math.random();
    if (r < 0.12) addTrait(c, 'Cyborg', true);else if (r < 0.45) addTrait(c, 'Cybernetic Arm', true);
  } // the Upgrade
  if (Math.random() < 0.6) addTrait(c, rnd(TRAITS), true);
  if (Math.random() < 0.25) addTrait(c, rnd(TRAITS), true);
  CH[c.id] = c;
  return c;
}

// ================= Traits, antitraits & retinue =================
// Each trait has an antitrait (a). Gaining the opposite of a trait you hold cancels it instead.
const TR = {
  Brave: {
    a: 'Coward',
    e: {
      skill: 1
    },
    d: 'Fights from the front.'
  },
  Coward: {
    a: 'Brave',
    e: {
      skill: -1,
      respect: -1
    },
    d: 'Keeps well behind the line.'
  },
  Just: {
    a: 'Cruel',
    e: {
      respect: 2
    },
    d: '+1 order where governing.'
  },
  Cruel: {
    a: 'Just',
    e: {
      respect: -2
    },
    d: 'Rules through fear.'
  },
  Pious: {
    a: 'Godless',
    e: {
      piety: 2
    },
    d: 'Devout. Hard to try for heresy.'
  },
  Godless: {
    a: 'Pious',
    e: {
      piety: -2
    },
    d: 'Scorns the faith. Easy prey for Nameless Masters.'
  },
  Brilliant: {
    a: 'Dim',
    e: {
      skill: 2
    },
    d: 'A gifted mind.'
  },
  Dim: {
    a: 'Brilliant',
    e: {
      skill: -1
    },
    d: 'Slow-witted.'
  },
  Loyal: {
    a: 'Ambitious',
    e: {
      loyalty: 2
    },
    d: 'Unshakeable.'
  },
  Ambitious: {
    a: 'Loyal',
    e: {
      loyalty: -2,
      skill: 1
    },
    d: 'Eyes the throne.'
  },
  Sober: {
    a: 'Drunkard',
    e: {},
    d: 'Clear-headed. Resists vice.'
  },
  Drunkard: {
    a: 'Sober',
    e: {
      skill: -1
    },
    d: '−1 order where governing.'
  },
  Chaste: {
    a: 'Lecher',
    e: {
      purity: 2
    },
    d: 'Fathers no bastards.'
  },
  Lecher: {
    a: 'Chaste',
    e: {
      purity: -2
    },
    d: 'Fathers bastards near brothels.'
  },
  Builder: {
    a: 'Squanderer',
    e: {},
    d: '+15% income where governing.'
  },
  Squanderer: {
    a: 'Builder',
    e: {},
    d: '−15% income where governing.'
  },
  Merciful: {
    a: 'Bloodthirsty',
    e: {
      violence: -2,
      respect: 1
    },
    d: 'Spares the vanquished.'
  },
  Bloodthirsty: {
    a: 'Merciful',
    e: {
      violence: 2,
      respect: -1
    },
    d: 'Delights in slaughter.'
  },
  Blessed: {
    a: 'Cursed',
    e: {
      piety: 1,
      loyalty: 1
    },
    d: 'Touched by the Light.'
  },
  Cursed: {
    a: 'Blessed',
    e: {
      skill: -1,
      loyalty: -1
    },
    d: 'Hexed by a witch.'
  },
  'Silver Tongue': {
    a: 'Tongue-tied',
    e: {
      skill: 1
    },
    d: 'Persuasive negotiator.'
  },
  'Tongue-tied': {
    a: 'Silver Tongue',
    e: {
      skill: -1
    },
    d: 'Stumbles over words.'
  },
  Shadow: {
    a: 'Clumsy',
    e: {
      skill: 1
    },
    d: 'Moves unseen.'
  },
  Clumsy: {
    a: 'Shadow',
    e: {
      skill: -1
    },
    d: 'Easily caught.'
  },
  Hero: {
    a: 'Disgraced',
    e: {
      skill: 1,
      respect: 1
    },
    d: 'Songs are sung of his victories.'
  },
  Disgraced: {
    a: 'Hero',
    e: {
      respect: -2,
      loyalty: -1
    },
    d: 'Shamed in defeat.'
  },
  'Spice Addict': {
    e: {},
    d: 'Dies young.'
  },
  Monstrous: {
    e: {
      respect: -3
    },
    d: 'A failed clone.'
  },
  Scarred: {
    e: {},
    d: 'A blaster burn across the cheek. Soldiers like it.'
  },
  'Badly Scarred': {
    e: {
      respect: -1
    },
    d: 'Half his face is old burn tissue.'
  },
  'Hideously Scarred': {
    e: {
      respect: -2,
      skill: 1
    },
    d: 'Children hide. Enemies hesitate.'
  },
  'One-Armed': {
    e: {
      skill: -1
    },
    d: 'Refused the machine-surgeons. Fights one-handed.'
  },
  'Cybernetic Arm': {
    e: {
      skill: 1
    },
    d: 'A machine limb. Folk tolerate it — many veterans have one.'
  },
  Cyborg: {
    e: {
      skill: 1,
      respect: -4
    },
    d: 'More machine now than man. Dread walks with him.'
  },
  Fallen: {
    a: 'Redeemed',
    e: {
      skill: 2,
      respect: -4,
      loyalty: -2
    },
    d: 'Has walked the Dark Path. Power through fear and pain.'
  },
  Redeemed: {
    a: 'Fallen',
    e: {
      respect: 3,
      loyalty: 2,
      piety: 1
    },
    d: 'Turned back from the Dark. There is still good in him.'
  },
  Greedy: {
    a: 'Generous',
    e: {
      loyalty: -1
    },
    d: '+10% income where governing, but easily bribed.'
  },
  Generous: {
    a: 'Greedy',
    e: {
      loyalty: 1,
      respect: 1
    },
    d: '+1 order, −10% income where governing.'
  },
  Paranoid: {
    a: 'Trusting',
    e: {
      loyalty: -1
    },
    d: 'Sees knives in every shadow. Hard to assassinate.'
  },
  Trusting: {
    a: 'Paranoid',
    e: {
      loyalty: 1
    },
    d: 'Opens his doors to all. Easier to assassinate.'
  },
  Reckless: {
    a: 'Cautious',
    e: {},
    d: '+10% battle strength, but twice as likely to be wounded.'
  },
  Cautious: {
    a: 'Reckless',
    e: {},
    d: '−5% battle strength, rarely wounded.'
  },
  Zealot: {
    e: {
      piety: 3
    },
    d: '+1 order on worlds of his faith, −2 on the faithless.'
  },
  'Plague-Scarred': {
    e: {
      respect: 1
    },
    d: 'Survived the Grey Rot. Immune to plague.'
  },
  'Tourney Champion': {
    e: {
      respect: 2,
      skill: 1
    },
    d: 'Victor of a Grand Tourney. His banner draws the young.'
  },
  Indolent: {
    a: 'Vigilant',
    e: {
      skill: -1
    },
    d: 'Grown soft from idle years. A leader loses Authority.'
  },
  Vigilant: {
    a: 'Indolent',
    e: {
      skill: 1
    },
    d: 'Hardened by years watching a hostile border.'
  },
  // Marks of birth and fortune: written by what happened to him (lifeSweep / life)
  'Base-born': {
    e: {
      skill: 1,
      loyalty: -1
    },
    d: 'Born out of wedlock, with everything to prove. Lost if legitimised.'
  },
  'Ward-raised': {
    e: {
      loyalty: -1
    },
    d: 'Grew up a hostage at a foreign court. Knows its ways and its weaknesses.'
  },
  'Former Prisoner': {
    e: {
      respect: 1
    },
    d: 'Endured the cells of a foreign house. Hates the keeper who held him.'
  },
  'Torture-Scarred': {
    e: {
      skill: -1,
      respect: 1
    },
    d: 'Broken on the rack and lived. Never forgives the hand that ordered it.'
  },
  'Freed Slave': {
    e: {
      respect: 1
    },
    d: 'Wore chains and lost them. Hates every slaver house and the lord who sold him. As a ruler his house turns on the slavers.'
  }
};
// ---- The Dark Path: a man falls only through what he does — atrocities ordered while already feared ----
// c.dark accumulates from deeds (exterminate 6, child-murder 5, enslave 3, execute 2 (+2 child), sack 1, torture 1).
// He falls at a deed when dreaded (respect ≤ −3), stained (dark ≥ 4) and darkPull ≥ 12. Faith and mercy blunt each deed.
// The pull of the Dark: deeds (c.dark) + dread + cruel nature + burning hatreds/motives, minus faith and mercy
function darkPull(c) {
  const why = [];
  let v = c.dark || 0;
  const add = (x, t) => {
    if (x) {
      v += x;
      why.push(`${x > 0 ? '+' : ''}${Math.round(x * 10) / 10} ${t}`);
    }
  };
  add(Math.max(0, -(c.respect || 0)) * 0.6, 'dread');
  [['Cruel', 2], ['Bloodthirsty', 2], ['Paranoid', 1], ['Ambitious', 0.7], ['Reckless', 0.4], ['Torture-Scarred', 1], ['Freed Slave', 0.5], ['Pious', -2], ['Merciful', -2], ['Just', -1.5], ['Redeemed', -2], ['Loyal', -0.5], ['Generous', -0.5]].forEach(([t, x]) => {
    if (has(c, t)) add(x, t);
  });
  const nem = Math.max(0, ...Object.values(c.nem || {}));
  if (nem >= 10) add(1.5, 'consumed by hatred');else if (nem >= 6) add(0.8, 'a burning nemesis');
  if (c.vendetta != null) add(1, 'vendetta');
  const m = c.mot?.at?.(-1)?.m || '';
  if (/reveng|vengean|hate|hatred|power|crown|throne|blood|fear/i.test(m)) add(1, 'driven by vengeance or power');
  return {
    v,
    why
  };
}
async function darkDeed(c, n, why) {
  if (!c || c.dead || c.role || c.undying || c.fem && !c.wm) return;
  const soft = (has(c, 'Pious') ? 0.6 : 1) * (has(c, 'Merciful') || has(c, 'Just') ? 0.7 : 1) * (has(c, 'Redeemed') ? 0.8 : 1);
  c.dark = (c.dark || 0) + n * soft;
  if (c.dark >= 4 && n >= 2) hist(c, `bears the stain of ${why}.`);
  // He falls only when feared (dread), stained by deeds, and his nature/hatreds push him over: see darkPull
  if (has(c, 'Fallen') || (c.respect || 0) > -3 || c.dark < 4 || darkPull(c).v < 12) return;
  const f = F[c.f];
  addTrait(c, 'Fallen');
  note(c, `${c.starblade || c.bladeId != null ? 'ignites his Starblade blood-red and ' : ''}falls to the Dark Path after ${why}.`);
  log(`🌑 ${cl(c)} of ${f?.name || 'no house'} falls to the Dark Path after ${why}.`);
  apoc(1, `${c.name} falls to the Dark`);
  if (f && f.ruler !== c && c.loyalty < 3 && F[15]?.alive && c.f !== 15 && Math.random() < 0.3) {
    c.secretSith = true;
    note(c, 'swears himself in secret to the Cult of Zithari.');
  }
  if (c.f === P && !SIM) await notify(`<h3>🌑 The Dark Path</h3>${portrait(c, 70)}Feared across the stars, <b>${c.name}</b> has gone too far: after ${why}, he falls to the Dark Path.`);
}
function darkTick(c) {
  if (c.dead || c.fem && !c.wm || c.role || c.age < 16 || c.undying) return;
  const f = F[c.f];
  if (!has(c, 'Fallen')) {
    // No random falls: only atrocities (darkDeed) push a man down the Dark Path; time slowly washes the stain
    if (c.dark) c.dark = Math.max(0, c.dark - 0.25);
  } else {
    // A secret apprentice of Zithari may betray his house, taking the world he governs
    const gw = c.secretSith && systems.find(s => s.general === c && s.owner === c.f);
    if (gw && F[15]?.alive && f?.ruler !== c && Math.random() < 0.12) {
      gw.owner = 15;
      c.f = 15;
      delete c.secretSith;
      note(c, `betrays ${f?.name} and delivers ${gw.name} to the Cult of Zithari.`);
      log(`🌑 TREACHERY: ${c.name} betrays ${f?.name} and hands ${gw.name} to the Cult of Zithari!`);
      if (f && !atWar(f.id, 15)) S.war.add(key(f.id, 15));
      if (f && f.capital === gw) f.capital = systems.filter(s => s.owner === f.id).sort((a, b) => b.income - a.income)[0] || null;
      try {
        checkDead(f.id);
      } catch (e) {}
      return;
    }
    let p = 0.01;
    if (has(c, 'Merciful') || has(c, 'Loyal')) p += 0.02;
    if ((c.piety || 0) >= 7) p += 0.02;
    if ((f?.heirs || []).some(h => !h.dead && h.mentor === c.id)) p += 0.03; // a pupil/child he loves
    if (f?.mods?.sith) p *= 0.3;
    if (f?.ruler && f.ruler !== c && (has(f.ruler, 'Redeemed') || has(f.ruler, 'Pious'))) p += 0.015; // a righteous liege
    if (c.spouse != null && CH[c.spouse] && !CH[c.spouse].dead) p += 0.01; // love anchors him
    p *= 1 - S.apoc / 200;
    if (Math.random() < p) {
      addTrait(c, 'Redeemed');
      delete c.secretSith;
      note(c, 'turns back from the Dark Path. There was still good in him.');
      log(`🌅 ${c.name} of ${f?.name || 'no house'} is redeemed from the Dark Path.`);
      apoc(-2, `${c.name} is redeemed`);
    }
  }
}
// ---- Grey Rot as a weapon: a contagious commander (c.rot) is flown to a foreign world to seed the plague ----
const rotOdds = t => 0.65 * (t.quar ? 0.35 : 1) * (geo(t).res.includes('bacta') ? 0.7 : 1);
async function seedRot(u, t) {
  const g = u.general,
    f = F[u.owner],
    rl = f?.ruler;
  if (!g?.rot || !t || t.plague || t.owner === u.owner || t.owner < 0) return false;
  u.mp = 0;
  g.rot = 0;
  delete g.rot;
  u.legions = Math.floor((u.legions || 0) * 0.85); // the crew breathed the same air
  const ok = Math.random() < rotOdds(t),
    tf = t.owner,
    exposed = Math.random() < 0.5;
  hist(g, `${ok ? 'carries the Grey Rot to' : 'is sent to seed the Grey Rot on'} ${t.name}${ok ? ' on the orders of ' + (rl && rl !== g ? rl.name : 'his own will') : ', but the sickness does not take'}.`);
  if (ok) {
    log(`☣ ${cl(g)} of ${f.name} lands sick among the people of ${t.name} — the Grey Rot breaks out.`);
    if (tf !== P) await plagueStrike(t, `breaks out on ${t.name}`);else t.plague = 3;
    apoc(5, `plague sown on ${t.name}`);
    if (rl && rl !== g) await darkDeed(rl, 4, `sowing the Grey Rot on ${t.name}`);
    await darkDeed(g, rl === g ? 4 : 2, `carrying the Grey Rot to ${t.name}`);
    if (tf === P && !SIM) {
      toast(`☣ The Grey Rot breaks out on ${t.name}${exposed ? ` — brought by ${g.name} of ${f.name}!` : ''}`, false);
      await plagueAsk(t);
    }
  } else log(`☣ ${f.name} tries to seed the Grey Rot on ${t.name}; it fails to take.`);
  if (exposed) {
    grudge(tf, u.owner, ok ? -12 : -6, `sowing plague on ${t.name}`);
    F.forEach(x => {
      if (x.alive && x.id !== tf && x.id !== u.owner && x.rel === 'Order') grudge(x.id, u.owner, -2, 'plague-sowing');
    });
    st(u.owner, ok ? -2 : -1, 'sowing plague');
    if (rl) rl.respect = Math.max(-ACAP, (rl.respect || 0) - 1);
    if (tf >= 0 && !atWar(tf, u.owner) && ok) log(`☣ ${F[tf].name} learns who brought the Rot.`);
  }
  WA('dip', {
    a: g.id,
    f: u.owner,
    to: tf,
    s: t.i,
    ok,
    txt: `${ok ? 'sowed' : 'tried to sow'} the Grey Rot on ${t.name}${exposed ? ' (exposed)' : ''}`
  });
  return ok;
}
// AI rulers decide whether to weaponise a contagious commander (TURN_STEPS 'plague-sowing')
async function rotTick() {
  // Carriers spread it wherever they set foot: governors and reserve officers on the ground, commanders on shore leave at home
  const cand = [];
  for (const s of systems) {
    if (s.plague || s.owner < 0) continue;
    if (s.general?.rot) cand.push([s.general, s, 0.12]);
    for (const id of s.staff || []) if (CH[id]?.rot && !CH[id].dead) cand.push([CH[id], s, 0.08]);
  }
  for (const u of units) if (u.type === 'fleet' && u.general?.rot && u.sys.owner === u.owner && !u.sys.plague) cand.push([u.general, u.sys, 0.06]);
  for (const [c, s, p] of cand) {
    if (s.plague || Math.random() >= p * (1 - 0.15 * hospLv(s))) continue;
    hist(c, `brings the Grey Rot to ${s.name}.`);
    if (c.f === P && !SIM) toast(`☣ ${c.name} has carried the Grey Rot to ${s.name}`, false);
    await plagueStrike(s, `is carried to ${s.name} by ${cl(c)}`);
  }
  for (const u of units.filter(x => x.type === 'fleet' && x.general?.rot && !isHuman(x.owner))) {
    const f = F[u.owner],
      rl = f?.ruler;
    if (!f?.alive || f.mods?.ff) continue;
    const pr = persona(rl);
    const p = clamp(pr.agg * 0.25 - pr.honor * 0.35 + (has(rl, 'Cruel') ? 0.15 : 0) + (has(rl, 'Fallen') ? 0.2 : 0) - (has(rl, 'Pious') || has(rl, 'Merciful') ? 0.2 : 0), 0, 0.35);
    if (Math.random() >= p) continue;
    const t = [u.sys, ...u.sys.links].filter(s => s.owner >= 0 && s.owner !== u.owner && !s.plague && atWar(s.owner, u.owner)).sort((a, b) => b.income - a.income)[0];
    if (!t) continue;
    u.sys = t;
    await seedRot(u, t);
  }
}
// ---- Paths of the soul: characters drift between the orders as their hearts change ----
// Nameless (0) ⇄ Gray Order (16) ⇄ Cult of Zithari (15); any house can lose a man to faith or to the Dark.
function pathTick(c) {
  const f = F[c.f];
  if (!f || c.dead || c.undying || c.role || c.fem && !c.wm || c.age < 16 || f.ruler === c || c.captive || c.enslaved || S.wards.includes(c) || S.prisoners.includes(c)) return;
  const alive = i => F[i]?.alive && i !== c.f;
  const fallen = has(c, 'Fallen'),
    red = has(c, 'Redeemed'),
    pious = has(c, 'Pious') || (c.piety || 0) >= 8;
  const free = c.spouse == null || !!CH[c.spouse]?.dead,
    doubt = has(c, 'Godless') || (c.piety || 0) <= 3 || has(c, 'Ambitious');
  const apo = S.apoc / 100;
  let to = null,
    why = '';
  if (fallen && c.f !== 15 && alive(15) && c.loyalty < 5 && Math.random() < 0.04 + apo * 0.04) {
    to = 15;
    why = c.f === 0 ? 'breaks his Nameless vows and goes over to the Cult of Zithari' : 'casts off his oaths and openly joins the Cult of Zithari';
  } else if (c.f === 15 && red && Math.random() < 0.3) {
    to = pious && free && alive(0) ? 0 : alive(16) ? 16 : alive(0) && free ? 0 : null;
    why = to === 0 ? 'renounces Zithari and seeks atonement among the Nameless' : 'flees the Cult and seeks balance with the Gray Order';
  } else if (c.f === 0 && !fallen && doubt && alive(16) && Math.random() < 0.05) {
    to = 16;
    why = 'loses faith in the Nameless creed and walks to the Gray Order';
  } else if (c.f === 16 && red && pious && free && alive(0) && Math.random() < 0.08) {
    to = 0;
    why = 'gives up the balance and takes the vows of the Nameless';
  } else if (c.f === 16 && pious && free && alive(0) && Math.random() < 0.01) {
    to = 0;
    why = 'hears a calling and takes Nameless vows';
  } else if (red && pious && free && ![0, 15, 16].includes(c.f) && alive(0) && Math.random() < 0.025) {
    to = 0;
    why = 'renounces the world to atone, taking Nameless vows';
  } else if (red && ![0, 15, 16].includes(c.f) && (c.loyalty < 4 || f.ruler && has(f.ruler, 'Fallen')) && alive(16) && Math.random() < 0.04) {
    to = 16;
    why = `will no longer serve a dark master and seeks the Gray Order`;
  } else if (c.f === 1 && fallen && c.loyalty < 4 && alive(15) && Math.random() < 0.05) {
    to = 15;
    why = 'deserts the Nightfleet for the Dark';
  }
  if (to != null && alive(to)) defect(c, to, why);
}
function defect(c, to, why) {
  if (ffLord(c) || F[to]?.mods?.ff) return;
  const from = c.f,
    ff = F[from];
  const gw = systems.find(s => s.general === c);
  const takes = gw && gw.owner === from && c.loyalty < 4 && systems.filter(s => s.owner === from).length > 1 && Math.random() < 0.35;
  if (gw) gw.general = null;
  units.forEach(u => {
    if (u.general === c) u.general = null;
  });
  if (ff) ff.heirs = ff.heirs.filter(h => h !== c);
  delete c.secretSith;
  if (from === 1) c.oathbroken = true;
  c.f = to;
  c.loyalty = ri(5, 8);
  if (takes) {
    gw.owner = to;
    gw.general = c;
    if (!atWar(from, to)) S.war.add(key(from, to));
    if (ff.capital === gw) ff.capital = systems.filter(s => s.owner === from).sort((a, b) => b.income - a.income)[0] || null;
  } else {
    const home = systems.find(s => s.owner === to && !s.general);
    if (home) home.general = c;
  }
  grudge(from, to, takes ? -8 : -2, `the defection of ${c.name}`);
  c.hist.push(`Y${S.year}: ${why}${takes ? `, taking ${gw.name} with him` : ''}.`);
  log(`🔀 ${cl(c)} of ${ff?.name || 'no house'} ${why}${takes ? `, taking ${gw.name} with him` : ''}.`);
  if (takes) {
    try {
      checkDead(from);
    } catch (e) {}
  }
}
// ---- Lieges: as a realm grows, landless nobles and veterans offer their swords (adoption, M2TW-style) ----
async function liegeTick() {
  for (const f of F) {
    if (!f.alive || f.domiri || hostile(f) || f.mods?.ff || !f.ruler) continue;
    const mine = systems.filter(s => s.owner === f.id),
      empty = mine.filter(s => !s.general);
    if (mine.length < 3 || !empty.length) continue;
    if (Math.random() > Math.min(0.5, 0.06 + mine.length * 0.02 + empty.length * 0.03)) continue;
    const s = empty.sort((a, b) => b.income - a.income)[0];
    // No invented backstories: a real exile already in the galaxy comes first, else a local lord of the world itself
    const exile = !f.mods?.coven && Object.values(CH).find(x => x && !x.dead && !x.captive && !x.fem && !x.role && x.age >= 18 && x.exiledBy != null && x.exiledBy !== f.id && x.f !== f.id && x.f !== 1 && !ffLord(x) && F[x.f]?.ruler !== x && !holdsPost(x));
    const g = exile || (f.mods?.coven ? mkWM(f.id, ri(18, 32)) : mkChar(f.id, ri(19, 45)));
    // Generated men are fine when the origin matches the galaxy: the border veteran only exists if this house really fights on its borders
    const borderWar = mine.some(m => m.links.some(l => l?.owner >= 0 && atWar(f.id, l.owner)));
    let origin;
    if (exile) origin = `an exile cast out by ${F[exile.exiledBy]?.name || 'his house'}`;else {
      const r = Math.random();
      if (r < 0.4) origin = `a minor lord of ${s.name}`;else if (r < 0.7 || !borderWar) origin = 'a landless knight-errant';else {
        origin = 'a scarred veteran of the border wars';
        g.skill = Math.min(10, g.skill + 1);
        if (Math.random() < 0.5) addTrait(g, 'Scarred', true);
      }
    }
    if (exile) {
      exile.vendetta ??= exile.exiledBy;
    }
    const swear = () => {
      if (exile) defect(exile, f.id, `offers his sword to ${f.name} in exile`);
    };
    if (f.id !== P) {
      swear();
      note(g, `offers fealty to ${f.name} as ${origin}.`);
      s.general = g;
      continue;
    }
    const adoptable = !celibate(f.id) && !f.mods?.coven && !g.fem;
    const c = await ask(`<h3>⚜ A Liege Offers Fealty</h3><div class="ccard">${portrait(g, 80)}<div style="font-size:12px"><b>${g.name}</b><br><i>${origin}</i><br>Age ${g.age}<br>${attrStr(g).split(' · ').join('<br>')}<br>${g.traits.join(', ') || 'No notable traits'}</div></div>Your realm grows, and ambitious nobles seek a place in it. This one would govern <b>${s.name}</b>.${g.vendetta != null ? `<br><small>⚠ He nurses a vendetta against ${F[g.vendetta]?.name}.</small>` : ''}${adoptable ? '<br><small>Adopting him makes him family: +3 loyalty, your surname, and a place in the line of succession.</small>' : ''}`, ['⚔ Accept Fealty', ...(adoptable ? ['👑 Adopt into the Dynasty'] : []), 'Decline']);
    if (c === 'Decline') {
      if (!exile) {
        g.dead = true;
        delete CH[g.id];
      }
      continue;
    }
    swear();
    s.general = g;
    if (c === '👑 Adopt into the Dynasty') {
      g.name = g.name.split(' ')[0] + ' ' + sur(f.ruler);
      g.father = f.ruler.id;
      (f.ruler.kids ??= []).push(g.id);
      g.adopted = true;
      gain(g, 'loyalty', 3);
      f.heirs.push(g);
      hist(g, `is adopted by ${f.ruler.name} into the dynasty and given ${s.name}.`);
    } else hist(g, `swears fealty to ${f.name} and takes ${s.name}.`);
  }
}
// ---- Battle wounds: M2TW-style scars, plus maiming that can be repaired with cybernetics ----
const SCARS = ['Scarred', 'Badly Scarred', 'Hideously Scarred'];
function swapTrait(c, from, to) {
  if (from && c.traits.includes(from)) {
    c.traits = c.traits.filter(t => t !== from);
    fx(c, TR[from].e, -1);
  }
  if (to && !c.traits.includes(to)) {
    c.traits.push(to);
    fx(c, TR[to].e, 1);
  }
}
function wound(g) {
  if (has(g, 'Cyborg') && Math.random() < 0.7) return; // armored shell shrugs it off
  if (Math.random() < 0.25) {
    const part = !has(g, 'Cybernetic Arm') && !has(g, 'One-Armed') ? 'arm' : !has(g, 'Cyborg') ? 'face' : null;
    if (part) {
      if (g.f === P || isHuman(g.f)) {
        g.maimed = part;
        note(g, (part === 'arm' ? 'loses an arm to a vibroblade' : 'has his face burned away by a plasma blast') + atBattle() + '.');
        log(`🩸 ${g.name} is maimed in battle — machine-surgeons await your word (see his bio).`);
      } else cyberize(g, part, Math.random() < (F[g.f]?.rel === 'Machine Cult' ? 0.95 : 0.6));
      return;
    }
  }
  const i = SCARS.findIndex(t => g.traits.includes(t));
  if (i < 2 && !has(g, 'Cyborg')) {
    swapTrait(g, SCARS[i], SCARS[i + 1]);
    note(g, `is ${SCARS[i + 1].toLowerCase()}${atBattle() || ' in battle'}.`);
  }
}
// The battle currently being fought, so wounds and deaths name it ("at the Battle of Kessar")
let curBattle = '';
function battleName(label) {
  const m = /(?:over|on|at|of)\s+(.+)$/i.exec(label || '');
  return m ? `the Battle of ${m[1]}` : '';
}
const atBattle = () => curBattle ? ` at ${curBattle}` : '';
function cyberize(g, part, yes) {
  delete g.maimed;
  if (part === 'arm') {
    swapTrait(g, null, yes ? 'Cybernetic Arm' : 'One-Armed');
    note(g, yes ? 'is fitted with a cybernetic arm.' : 'refuses the machine and fights one-armed.');
  } else if (yes) {
    SCARS.forEach(t => swapTrait(g, t, null));
    swapTrait(g, null, 'Cyborg');
    note(g, 'rises from the surgery table a cyborg, breathing through a respirator.');
  } else {
    swapTrait(g, g.traits.find(t => SCARS.includes(t)), 'Hideously Scarred');
    note(g, 'refuses the machine. The burns never heal.');
  }
}
// ---- Character dialogue, flavored by traits and attributes. ctx: s=selected, m=move, a=attack ----
const QUIPS = {
  Cyborg: {
    s: ['*mechanical breathing* ...Speak.', 'The flesh was weak. I corrected it.', 'I feel no pain. Only purpose.'],
    m: ['*hiss* Set course.', 'The machine obeys. So shall the fleet.'],
    a: ['Their resistance is... irrelevant.', 'I will finish what the plasma started.']
  },
  Sith: {
    s: ['You will kneel, or you will be knelt.', 'Fear is the only loyalty that lasts.', 'Doubt me once more, and it will be your last breath.'],
    m: ['The dark goes before us.', 'Let them feel us coming.'],
    a: ['Leave none to tell of it.', 'Now they will know dread.']
  },
  'Cybernetic Arm': {
    s: ['*flexes servos* Still grips a blade.', 'The new hand never trembles.'],
    m: ['Ready the ships.'],
    a: ['Time this hand drew blood.']
  },
  'One-Armed': {
    s: ['One arm is enough to hold a blade.'],
    m: ['Onward.'],
    a: ['They took my arm. I take their world.']
  },
  'Hideously Scarred': {
    s: ['Don\'t look away. Look at what war is.', 'Yes. It still hurts.'],
    a: ['They will wear my face in their nightmares.']
  },
  Scarred: {
    s: ['Every scar is a battle I walked away from.']
  },
  Fallen: {
    s: ['The Light lied to me. The Dark keeps its promises.', 'Join me, and we will rule this galaxy together.', 'Your feeble skills are no match for the Dark.'],
    m: ['The Dark will guide the fleet.'],
    a: ['Give in to your anger. Then die.', 'Now you will know true power.']
  },
  Redeemed: {
    s: ['I walked in darkness once. Never again.', 'There is still good in all of us. Even me.'],
    m: ['Let me make amends.'],
    a: ['For those I failed — forward!']
  },
  'Badly Scarred': {
    s: ['The burns itch when the air is dry.']
  },
  Brave: {
    s: ['Point me at the enemy, my liege.', 'I\'ll be in the first boarding craft.'],
    m: ['Full burn! Follow my flagship!'],
    a: ['For the Throne! Into the fire!', 'Charge! Light the blades!']
  },
  Coward: {
    s: ['Must I go personally?', 'Perhaps... a smaller battle?'],
    m: ['Keep my ship at the rear, captain.'],
    a: ['Send the clones in first!', 'I have a bad feeling about this...']
  },
  Cruel: {
    s: ['The rebels squeal so prettily.', 'Mercy is a luxury of the weak.'],
    a: ['Burn their crops. Salt their oceans.']
  },
  Just: {
    s: ['The law protects even the lowest moisture farmer.', 'Command me justly, and I serve gladly.'],
    a: ['Spare the civilians. Only the soldiers.']
  },
  Pious: {
    s: ['May the Light guide your hand.', 'I have prayed on this.'],
    m: ['The faith goes with us.'],
    a: ['Heretics! Repent at blade-point!']
  },
  Godless: {
    s: ['Gods? I trust turbolasers.', 'Spare me the sermon.'],
    a: ['No priest will save them now.']
  },
  Brilliant: {
    s: ['I\'ve run the numbers. Twice.', 'Their flank is weak — have you noticed?'],
    m: ['A clever course, if I say so myself.'],
    a: ['Execute plan Aurek-Seven.']
  },
  Dim: {
    s: ['Uh... which one\'s the hyperdrive?', 'Shoot the big one, yes?'],
    a: ['Uh, we attack now? Right!']
  },
  Loyal: {
    s: ['My life is yours, my liege.', 'I serve the Throne until my last breath.'],
    m: ['As you command.'],
    a: ['For my liege!']
  },
  Ambitious: {
    s: ['A fine throne you have. Comfortable?', 'One day, songs will be sung of me.'],
    m: ['Every world I take is a world I keep.'],
    a: ['Glory awaits — mine.']
  },
  Drunkard: {
    s: ['*hic* Who brought Corellian brandy?', 'Is it... morning already?'],
    m: ['Steady... the stars keep moving.'],
    a: ['One more drink, then war!']
  },
  Sober: {
    s: ['Clear head, clear orders.']
  },
  Lecher: {
    s: ['Will there be dancers on the next world?', 'I have... cousins on every planet.']
  },
  Chaste: {
    s: ['My vows keep me focused.']
  },
  Merciful: {
    s: ['Must there be so much killing?'],
    a: ['Offer them terms before we fire.']
  },
  Bloodthirsty: {
    s: ['My blade is thirsty.', 'When do we kill?'],
    a: ['BLOOD FOR THE STARS!', 'Finally!']
  },
  Hero: {
    s: ['The bards are already writing about this one.'],
    a: ['Another verse for the songs!']
  },
  Disgraced: {
    s: ['Let me redeem myself, please.'],
    a: ['This time I will not fail.']
  },
  Builder: {
    s: ['This world needs a new spaceport.']
  },
  Squanderer: {
    s: ['Credits are meant to be spent, no?']
  },
  'Spice Addict': {
    s: ['The spice... I can see the paths...', '*blue eyes flicker* The future is... loud.']
  },
  Monstrous: {
    s: ['*growls* Grrrhh. Orders.'],
    a: ['RRRAAAHH!']
  },
  Blessed: {
    s: ['I dreamt of victory again.']
  },
  Cursed: {
    s: ['That witch\'s hex still burns.']
  }
};
const GENERIC = {
  s: ['Awaiting orders.', 'Yes, my liege?', 'Ready.'],
  m: ['Making the jump to hyperspace.', 'Setting course.', 'Punch it!'],
  a: ['Weapons hot!', 'All ships, attack!', 'For the Throne!']
};
const dreadful = c => !c.role && !c.fem && ((c.respect ?? 0) <= -6 || c.traits?.includes('Fallen'));
function quip(c, ctx = 's') {
  const pool = [];
  const add = (L, w = 1) => {
    const a = L?.[ctx];
    if (a) for (let i = 0; i < w; i++) pool.push(...a);
  };
  if (has(c, 'Cyborg')) add(QUIPS.Cyborg, 3);
  if (dreadful(c)) add(QUIPS.Sith, 2);
  c.traits.forEach(t => add(QUIPS[t], 1));
  (c.anc || []).includes('Battle AI') && ctx === 's' && pool.push('My battle AI has already run the odds. It is smiling, in its way.');
  if (ctx === 's') {
    if (c.role && ROLE_LINES[c.role]) pool.push(...ROLE_LINES[c.role]);
    if (c.loyalty <= 2) pool.push('...Of course. My liege.', 'Why should I fight for you?');
    if (c.piety >= 8) pool.push('The Light is strong in this one, they say. They are right.');
    if (c.skill >= 8 && !c.role) pool.push('I have never lost a fleet I didn\'t mean to lose.');
    if (c.age >= 65) pool.push('I flew with your grandfather, you know.');
    if (c.age < 20) pool.push('My first command! I won\'t let you down!');
    if (c.respect >= 6) pool.push('Honor before victory.');
    if (c.starblade) pool.push('*the Starblade hums at his hip*');
  }
  if (!pool.length) add(GENERIC);
  return rnd(pool);
}
let sayT = 0;
function say(c, ctx, text) {
  if (!c || c.dead) return;
  const line = text || quip(c, ctx);
  (S.talk ??= []).push({
    id: c.id,
    n: c.name,
    f: c.f,
    l: line,
    y: S.year
  });
  if (S.talk.length > 60) S.talk.shift();
  let el = document.getElementById('sayBox');
  // Dialogue lives in the top bar: it briefly replaces the stats line, then gives it back
  const top = $('top'),
    stats = $('stats');
  if (!el) {
    el = document.createElement('span');
    el.id = 'sayBox';
    el.style.cssText = 'display:none;flex:1;min-width:0;gap:8px;align-items:center;color:#eee;font-size:12px;pointer-events:none;overflow:hidden';
    top.insertBefore(el, top.firstChild);
  }
  el.innerHTML = `<span style="flex:none;display:flex">${portrait(c, 26)}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b style="color:#f2c94c">${c.name.split(' ')[0]}:</b> <i>"${line}"</i></span>`;
  el.style.display = 'flex';
  if (stats) stats.style.display = 'none';
  clearTimeout(sayT);
  sayT = setTimeout(() => {
    el.style.display = 'none';
    if (stats) stats.style.display = '';
  }, 3200);
}
const TRAITS = ['Brave', 'Coward', 'Drunkard', 'Pious', 'Cruel', 'Just', 'Brilliant', 'Lecher', 'Loyal', 'Ambitious', 'Merciful', 'Bloodthirsty', 'Builder', 'Squanderer', 'Godless', 'Dim', 'Sober', 'Chaste', 'Greedy', 'Generous', 'Trusting', 'Reckless', 'Cautious'];
const ANC = {
  'Veteran Bodyguard': {
    e: {
      skill: 1
    },
    d: '+1 command'
  },
  'Battle AI': {
    e: {
      skill: 1
    },
    d: '+1 command'
  },
  'Captured Banner': {
    e: {
      respect: 1
    },
    d: '+1 chivalry'
  },
  'Mercenary Captain': {
    e: {
      skill: 1,
      loyalty: -1
    },
    d: '+1 command, −1 loyalty'
  },
  'Drill Sergeant': {
    e: {
      skill: 1
    },
    d: '+1 command'
  },
  'Hyperspace Navigator': {
    e: {},
    d: '+1 movement'
  },
  'Astrogation Map': {
    e: {},
    d: '+1 movement'
  },
  'Bloodbank Accountant': {
    e: {},
    d: '+15% income where governing'
  },
  'Nameless Confessor': {
    e: {
      piety: 1
    },
    d: '+1 piety, +1 order where governing'
  },
  Courtesan: {
    e: {
      loyalty: -1
    },
    d: '−1 loyalty, breeds lechery'
  },
  'Spice Dealer': {
    e: {},
    d: 'risk of spice addiction'
  },
  'Relic of the Old Empire': {
    e: {
      piety: 1,
      loyalty: 1
    },
    d: '+1 piety, +1 loyalty'
  },
  'Codex Fragment': {
    e: {
      piety: 2
    },
    d: '+2 piety'
  },
  'Forged Credentials': {
    e: {
      skill: 1
    },
    d: '+1 skill'
  },
  'Slicer AI': {
    e: {
      skill: 1
    },
    d: '+1 skill'
  },
  Vibroblade: {
    e: {
      skill: 1
    },
    d: '+1 skill'
  },
  'Old Gods Fetish': {
    e: {
      piety: -1,
      skill: 1
    },
    d: '+1 skill, −1 piety'
  },
  Scientist: {
    e: {
      admin: 1
    },
    d: '+1 admin; may invent lost technology each year'
  },
  'Mad Scientist': {
    e: {
      loyalty: -1
    },
    d: 'Invents technology far faster — at a price. ☢'
  },
  'Heirloom Blaster': {
    e: {},
    d: 'kept close since an attempt on their life; hard to assassinate'
  },
  'Court Herald': {
    e: {
      respect: 1
    },
    d: '+1 respect; proclaims his deeds across the stars'
  },
  'Plague Doctor': {
    e: {},
    d: 'beaked mask, brass lenses: halves plague deaths and unrest where governing'
  },
  'Siege Engineer': {
    e: {},
    d: 'defenders fight at −20% when he assaults a world'
  },
  'Master of Coin': {
    e: {
      admin: 1
    },
    d: '+1 admin, +10% income where governing'
  },
  Squire: {
    e: {
      skill: 1,
      loyalty: 1
    },
    d: '+1 command, +1 loyalty'
  },
  'Food Taster': {
    e: {},
    d: 'tastes every cup first; hard to assassinate'
  },
  'Void Hound': {
    e: {
      respect: -1
    },
    d: 'a gene-forged hunting beast; guards against bounty hunters, +1 fear'
  }
};
// ---- Agent odds (M2TW-style): attacker skill vs. the target's guards, retinue, traits and history ----
const pct = p => Math.round(clamp(p, 0, 1) * 100);
// ---- Counterintelligence (M2TW spies in armies & settlements): Probe AIs guard a world or escort a lord ----
function whereIs(c) {
  if (!c) return null;
  const u = units.find(x => x.type !== 'agent' && x.general === c);
  if (u) return u.sys;
  const s = systems.find(x => x.general === c);
  if (s) return s;
  return units.find(x => x.char === c)?.sys || null;
}
const probesFor = (fid, sys, c) => units.filter(u => u.type === 'agent' && u.role === 'Spy' && u.owner === fid && u.char && !u.char.dead && !u.mission && (c && u.escort === c.id || sys && u.sys === sys && u.escort == null));
// Bounty hunters of your own serving as bodyguards (escort only)
const bodyguardsFor = (fid, c) => c ? units.filter(u => u.type === 'agent' && u.role === 'Assassin' && u.owner === fid && u.char && !u.char.dead && !u.mission && u.escort === c.id) : [];
// Lords of a house that hostile bounty hunters are known to be tracking
const huntedLords = fid => [...new Set(units.filter(x => x.type === 'agent' && x.role === 'Assassin' && x.owner !== fid && x.hunt != null).map(x => CH[x.hunt]).filter(c => c && !c.dead && !c.captive && c.f === fid))];
function counterIntel(fid, sys, c) {
  const ps = fid == null || fid < 0 ? [] : probesFor(fid, sys, c);
  const bg = fid == null || fid < 0 ? [] : bodyguardsFor(fid, c);
  if (!ps.length && !bg.length) return {
    d: 0,
    n: 0,
    best: 0,
    why: ''
  };
  const why = [];
  let d = 0,
    best = 0,
    esc = 0;
  if (ps.length) {
    best = Math.max(...ps.map(u => u.char.skill || 0));
    esc = c ? ps.filter(u => u.escort === c.id).length : 0;
    d += 0.06 + best * 0.02 + (ps.length - 1) * 0.03 + (esc ? 0.05 : 0);
    why.push(esc ? `${esc} Probe AI${esc > 1 ? 's' : ''} at his side (best subterfuge ${best})` : `${ps.length} Probe AI${ps.length > 1 ? 's' : ''} watching ${sys?.name || 'here'} (best subterfuge ${best})`);
  }
  if (bg.length) {
    const bb = Math.max(...bg.map(u => u.char.skill || 0));
    d += 0.08 + bb * 0.02 + (bg.length - 1) * 0.03;
    best = Math.max(best, bb);
    esc += bg.length;
    why.push(`${bg.length} bounty hunter${bg.length > 1 ? 's' : ''} as bodyguard (best skill ${bb})`);
  }
  return {
    d: Math.min(0.4, d),
    n: ps.length + bg.length,
    best,
    esc,
    why: why.join(', ')
  };
}
// Chance a failed killer or meddling agent is caught by the watchers
const unmaskOdds = ci => ci.n ? clamp(0.25 + ci.best * 0.04 + (ci.n - 1) * 0.05, 0, 0.75) : 0;
// Each turn: escorts follow their lord; Probe AIs hunt hostile agents sharing their world
function probeTick() {
  for (const u of units.filter(x => x.type === 'agent' && (x.role === 'Spy' || x.role === 'Assassin') && x.escort != null)) {
    const c = CH[u.escort];
    if (!c || c.dead || c.captive || c.f !== u.owner) {
      if (u.owner === P && c) log(`🛰 ${u.char?.name} ends the watch over ${c.name}.`);
      u.escort = null;
      continue;
    }
    const w = whereIs(c);
    if (w) u.sys = w;
  }
  // Bodyguard bounty hunters stalk hostile hunters who come near their lord
  for (const b of units.filter(x => x.type === 'agent' && x.role === 'Assassin' && x.escort != null && x.char && !x.char.dead)) {
    const lord = CH[b.escort];
    for (const e of units.filter(x => x.type === 'agent' && x.role === 'Assassin' && x.sys === b.sys && x.owner !== b.owner && x.char && (x.hunt === b.escort || atWar(b.owner, x.owner)))) {
      if (!units.includes(e) || !units.includes(b) || Math.random() >= clamp(0.15 + (b.char.skill || 0) * 0.03 - (e.char.skill || 0) * 0.02, 0.05, 0.5)) continue;
      e.char.dead = true;
      hist(e.char, `is cut down by ${b.char.name}, bodyguard of ${lord?.name}, at ${b.sys.name}.`);
      hist(b.char, `kills ${e.char.name}, a bounty hunter of ${F[e.owner]?.name}, protecting ${lord?.name}.`);
      removeUnit(e);
      agentXP(b.char, 'Assassin', true);
      if (F[e.owner] && F[b.owner]) grudge(e.owner, b.owner, -2, 'a hired killer slain by a bodyguard');
      if (b.owner === P) toast(`🗡 Your bodyguard ${b.char.name} kills <b>${e.char.name}</b>, a bounty hunter of ${F[e.owner]?.name}, near ${lord?.name}.`, true);else if (e.owner === P) toast(`☠ Your Bounty Hunter <b>${e.char.name}</b> was slain by the bodyguard of ${lord?.name} at ${b.sys.name}.`, false);
    }
  }
  for (const p of units.filter(x => x.type === 'agent' && x.role === 'Spy' && x.char && !x.char.dead)) {
    const foes = units.filter(x => x.type === 'agent' && x.sys === p.sys && x.owner !== p.owner && ['Spy', 'Assassin', 'Witch', 'Acolyte'].includes(x.role) && x.char && (atWar(p.owner, x.owner) || p.sys.owner === p.owner));
    for (const e of foes) {
      if (!units.includes(e) || Math.random() >= clamp(0.06 + (p.char.skill || 0) * 0.025 - (e.char.skill || 0) * 0.02, 0.02, 0.4)) continue;
      e.char.dead = true;
      hist(e.char, `is unmasked by ${p.char.name} of ${F[p.owner]?.name} and executed at ${p.sys.name}.`);
      hist(p.char, `unmasks ${e.char.name}, an agent of ${F[e.owner]?.name}, at ${p.sys.name}.`);
      removeUnit(e);
      agentXP(p.char, 'Spy', true);
      if (F[e.owner] && F[p.owner]) grudge(e.owner, p.owner, -2, 'an agent unmasked and executed');
      if (p.owner === P) toast(`🛰 ${p.char.name} unmasks <b>${e.char.name}</b> (${RNAME[e.role] || e.role} of ${F[e.owner]?.name}) at ${p.sys.name}.`, true);else if (e.owner === P) toast(`☠ Your ${RNAME[e.role] || e.role} <b>${e.char.name}</b> is unmasked by Probe AIs of ${F[p.owner]?.name} at ${p.sys.name}.`, false);
    }
  }
}
function guardOf(g, sys) {
  const tr = g.traits || [],
    a = g.anc || [],
    why = [];
  let d = 0;
  const add = (v, t) => {
    d += v;
    why.push(`${v > 0 ? '−' : '+'}${Math.abs(Math.round(v * 100))}% ${t}`);
  };
  const ci = counterIntel(g.f, sys || whereIs(g), g);
  if (ci.d) add(ci.d, ci.why);
  if (g.survived) add(Math.min(0.24, g.survived * 0.08), `survived ${g.survived} attempt${g.survived > 1 ? 's' : ''}`);
  if (a.includes('Heirloom Blaster')) add(0.12, 'Heirloom Blaster');
  if (a.includes('Veteran Bodyguard')) add(0.12, 'Veteran Bodyguard');
  if (a.includes('Battle AI')) add(0.1, 'Battle AI');
  if (a.includes('Vibroblade')) add(0.06, 'Vibroblade');
  if (a.includes('Mercenary Captain')) add(0.05, 'Mercenary Captain');
  if (g.starblade) add(0.15, 'wields a Starblade');
  if (tr.includes('Brave') || tr.includes('Hero')) add(0.05, 'brave');
  if (tr.includes('Paranoid')) add(0.1, 'paranoid');
  if (tr.includes('Trusting')) add(-0.08, 'trusting');
  if (a.includes('Food Taster')) add(0.1, 'Food Taster');
  if (a.includes('Void Hound')) add(0.08, 'Void Hound');
  if (tr.includes('Coward') || tr.includes('Drunkard') || tr.includes('Spice Addict')) add(-0.06, 'careless habits');
  if ((g.skill || 0) >= 7) add(0.05, 'seasoned fighter');
  if (F[g.f]?.ruler === g) add(0.12, 'royal guard');
  if (sys && F[g.f]?.capital === sys) add(0.05, 'at the capital');
  if (g.age < 14) add(-0.05, 'a child');
  if (g.age >= 65) add(-0.05, 'frail with age');
  return {
    d,
    why
  };
}
// Returns { p, why } — p is the final chance, why lists every modifier.
function killOdds(base, baseWhy, g, sys) {
  const gd = guardOf(g, sys);
  return {
    p: clamp(base - gd.d, 0.05, 0.9),
    why: [...baseWhy, ...gd.why]
  };
}
// Failed attempts harden the target: they remember, and may arm themselves.
function survivedAttempt(g, by) {
  g.survived = (g.survived || 0) + 1;
  maybe(g, 'Paranoid', 0.35);
  if (has(g, 'Paranoid') && Math.random() < 0.3) addAnc(g, rnd(['Food Taster', 'Void Hound']));
  if (!(g.anc || []).includes('Heirloom Blaster') && Math.random() < 0.5) {
    try {
      addAnc(g, 'Heirloom Blaster');
    } catch (e) {
      (g.anc ||= []).push('Heirloom Blaster');
    }
  }
  hist(g, `survives an assassination attempt${by ? ' by ' + by : ''} and trusts no one now.`);
}
async function confirmOdds(title, o) {
  const r = await ask(`<h3>${title}</h3><div style="font-size:28px;color:${o.p >= 0.5 ? '#7f7' : o.p >= 0.3 ? '#fd6' : '#f77'}">${pct(o.p)}% chance</div><small>${o.why.join('<br>')}</small>`, ['Proceed', 'Cancel']);
  return r === 'Proceed';
}
// Attributes: natural scale 0-10, bonuses may push beyond, hard cap 20.
const ACAP = 20;
const SK = c => c?.fem && !c.wm && (!c.role || c.role === 'Princess') ? 'Charm' : {
  Diplomat: 'Diplomacy',
  Trader: 'Finance',
  Spy: 'Subterfuge',
  Assassin: 'Subterfuge'
}[c?.role] || (c?.role ? 'Skill' : 'Command');
function gain(c, k, n = 1) {
  if (!c) return;
  const v = c[k] || 0;
  if (v < 10) c[k] = Math.min(10, v + n);
}
function fx(c, e, k) {
  for (const [s, v] of Object.entries(e || {})) c[s] = (c[s] || 0) + v * k;
  ['skill', 'loyalty', 'piety', 'admin', 'charm', 'dip'].forEach(s => {
    if (c[s] != null) c[s] = clamp(c[s], 0, ACAP);
  });
  c.respect = clamp(c.respect || 0, -ACAP, ACAP);
}
function note(c, msg) {
  if (c.f === P) hist(c, msg);else c.hist.push(`Y${S.year}: ${msg}`);
}
function addTrait(c, t, quiet) {
  const T = TR[t];
  if (!c || !T || c.traits.includes(t)) return false;
  if (T.a && c.traits.includes(T.a)) {
    c.traits = c.traits.filter(x => x !== T.a);
    fx(c, TR[T.a].e, -1);
    if (!quiet) note(c, `overcomes being ${T.a}.`);
    return true;
  }
  c.traits.push(t);
  fx(c, T.e, 1);
  if (!quiet) note(c, `becomes ${t}.`);
  return true;
}
const maybe = (c, t, p) => {
  if (c && !c.dead && Math.random() < p) addTrait(c, t);
};
function addAnc(c, a) {
  if (!c || c.dead || !ANC[a]) return;
  c.anc ??= [];
  if (c.anc.includes(a) || c.anc.length >= 6) return;
  c.anc.push(a);
  fx(c, ANC[a].e, 1);
  note(c, `gains a retinue member/item: ${a}.`);
}
const has = (c, x) => !!c && (!!c.traits?.includes(x) || !!c.anc?.includes(x));
function battleXP(g, won) {
  if (!g || g.dead) return;
  if (won) {
    g.wins = (g.wins || 0) + 1;
    maybe(g, 'Brave', 0.2);
    if (g.wins >= 4) maybe(g, 'Hero', 0.25);
    if (Math.random() < 0.15) addAnc(g, rnd(['Veteran Bodyguard', 'Battle AI', 'Captured Banner', 'Mercenary Captain', 'Hyperspace Navigator']));
    if (S.recl && F[g.f]?.rel === 'Order') {
      c_holy(g, 2);
    }
    if (has(g, 'Brave') && g.wins >= 3) maybe(g, 'Reckless', 0.08);
    if (S.recl && Math.random() < 0.1) maybe(g, 'Zealot', 0.5);
  } else {
    maybe(g, 'Coward', 0.2);
    if (g.wins) maybe(g, 'Disgraced', 0.1);
    maybe(g, 'Cautious', 0.1);
  }
  if (Math.random() < (won ? 0.06 : 0.14) * (has(g, 'Brave') ? 1.5 : has(g, 'Coward') ? 0.4 : 1) * (has(g, 'Reckless') ? 2 : has(g, 'Cautious') ? 0.4 : 1)) wound(g);
}
// Holy wars weigh heavily on piety (can rise past 10 toward the cap).
function c_holy(g, n) {
  g.piety = Math.min(ACAP, (g.piety || 0) + n);
}
function govTraits(s) {
  const g = s.general;
  if (!g || g.dead) return;
  if (Math.random() < 0.25) gain(g, 'admin');
  if (s.b.has('Temple') && Math.random() < 0.1 + 0.1 * bLv(s, 'Temple')) gain(g, 'piety');
  if (bLv(s, 'Temple') >= 3 && has(g, 'Pious')) maybe(g, 'Zealot', 0.04);
  if (bLv(s, 'Market') >= 3 && Math.random() < 0.06) addAnc(g, 'Master of Coin');
  if (bLv(s, 'Barracks') >= 3 && Math.random() < 0.06) addAnc(g, 'Siege Engineer');
  if (polOf(s) === 'Taxation' || bLv(s, 'Market') >= 2) maybe(g, 'Greedy', 0.03);
  if (polOf(s) === 'Growth' && s.order >= 7) maybe(g, 'Generous', 0.04);
  if (s.plague && !has(g, 'Plague Doctor') && Math.random() < 0.15) addAnc(g, 'Plague Doctor');
  if (s.b.has('Temple')) {
    maybe(g, 'Pious', 0.08);
    if (Math.random() < 0.06) addAnc(g, 'Nameless Confessor');
  }
  if (s.b.has('Market')) {
    maybe(g, 'Builder', 0.1);
    if (Math.random() < 0.06) addAnc(g, 'Bloodbank Accountant');
  }
  if (s.b.has('Brothel')) {
    if (!has(g, 'Sober')) {
      maybe(g, 'Lecher', 0.1);
      if (bLv(s, 'Brothel') >= 2) maybe(g, 'Drunkard', 0.06);
    }
    if (Math.random() < 0.06) addAnc(g, 'Courtesan');
  }
  if (s.b.has('Barracks') && Math.random() < 0.06) addAnc(g, 'Drill Sergeant');
  if ((s.b.has('Space Station') || s.b.has('Shipyard')) && Math.random() < 0.025) addAnc(g, 'Scientist');
  if (F[s.owner]?.rel === 'Machine Cult' && Math.random() < 0.015) addAnc(g, 'Mad Scientist');
  if (s.order <= 3 && !has(g, 'Sober')) maybe(g, 'Drunkard', 0.1);
  const pol = polOf(s); // edicts shape the governor
  if (pol === 'Martial Law') maybe(g, 'Cruel', 0.04);
  if (pol === 'Faith') maybe(g, 'Pious', 0.06);
  if (pol === 'Growth') maybe(g, 'Builder', 0.05);
  if (pol === 'Taxation') {
    maybe(g, 'Squanderer', 0.03);
    if (Math.random() < 0.15) gain(g, 'admin');
  }
  if (pol === 'Conscription' && Math.random() < 0.08) addAnc(g, 'Drill Sergeant');
  if (s.order >= 8) maybe(g, 'Just', 0.08);
  if (F[s.owner]?.mods.spice && Math.random() < 0.05) addAnc(g, 'Spice Dealer');
  if (has(g, 'Spice Dealer')) maybe(g, 'Spice Addict', 0.12);
  if (has(g, 'Courtesan')) maybe(g, 'Lecher', 0.1);
}
function agentXP(c, role, ok) {
  const [t, a] = AGT[role] || [];
  if (!t) return;
  if (ok) {
    maybe(c, t, 0.12);
    if (a && Math.random() < 0.08) addAnc(c, a);
    if ((role === 'Priest' || role === 'Master') && Math.random() < 0.35) gain(c, 'piety');
  } else if (TR[t].a) maybe(c, TR[t].a, 0.1);
}

// ================= Agent roster =================
const rn = r => RNAME[r] || r;

// ================= The Nameless (standing, council, sanctions) =================
const standing = fid => S.standing[fid] ??= F[fid]?.rel === 'Order' ? 6 : 4;
function st(fid, d, why) {
  if (!F[fid] || fid === 0 || hostile(F[fid])) return;
  S.standing[fid] = clamp(standing(fid) + d, 0, 10);
  if (fid === P && why) log(`✠ Standing with the Nameless ${d > 0 ? '+' : ''}${d} (${why})`);
}
const standLbl = v => v >= 9 ? 'Exalted' : v >= 7 ? 'Favoured' : v >= 5 ? 'Tolerated' : v >= 3 ? 'Suspect' : 'Despised';
function councilFill() {
  const elevated = [];
  S.council = S.council.filter(id => CH[id] && !CH[id].dead && F[0].ruler !== CH[id]);
  while (S.council.length < 13) {
    const cand = units.filter(u => u.role === 'Priest' && u.owner !== 0 && !u.char.council && u.char.piety >= 6 && F[u.owner]?.rel === 'Order' && !S.sanct.includes(u.owner)).map(u => u.char).sort((a, b) => b.piety + b.skill - a.piety - a.skill)[0];
    let c;
    if (cand && Math.random() < 0.25 + standing(cand.f) * 0.05 + (F[0].ruler?.origin === cand.f ? 0.2 : 0)) {
      c = cand;
      c.name = 'Master ' + rnd(EPI);
      elevated.push(c);
    } else {
      c = mkChar(0, ri(40, 70));
      c.role = 'Master';
      c.name = 'Master ' + rnd(EPI);
      c.piety = ri(5, 10);
      c.traits = c.traits.filter(t => t !== 'Godless');
    }
    c.council = true;
    S.council.push(c.id);
    note(c, 'is raised to the Council of 13 Masters.');
  }
  return elevated;
}
async function trySanction(tid, byPlayer) {
  if (tid === 1) {
    if (byPlayer) await notify('The Council will not sanction the Nightfleet: the Watch stands outside the politics of the faithful. Its godless brothers can still be put to trial by your Masters.');
    return false;
  }
  councilFill();
  const mem = S.council.map(id => CH[id]).filter(Boolean);
  const mine = P !== 0 ? mem.filter(c => c.f === P) : [];
  let pv = false;
  if (mine.length && !byPlayer && tid !== P) pv = (await ask(`<h3>✠ Council Vote</h3>Grandmaster ${F[0].ruler.name} moves to sanction <b>${F[tid].name}</b> (standing ${standing(tid)}/10).<br>Your ${mine.length} Master(s) on the Council may cast their votes.<div class="frow">${mine.map(c => card(c)).join('')}</div>`, ['Vote For', 'Vote Against'])) === 'Vote For';
  let yes = 0;
  mem.forEach(c => {
    if (c.f === tid) return;
    if (P !== 0 && c.f === P) {
      if (pv) yes++;
      return;
    }
    if (Math.random() < (c.f === 0 ? 0.4 : 0.3) + (5 - standing(tid)) * 0.1 + (c.piety > 7 ? 0.1 : 0)) yes++;
  });
  const pass = yes >= 7;
  log(`✠ The Council of 13 votes ${yes}–${mem.length - yes} ${pass ? 'to SANCTION' : 'against sanctioning'} ${F[tid].name}.`);
  if (!pass) return false;
  S.sanct.push(tid);
  S.standing[tid] = Math.min(standing(tid), 1);
  apoc(1, `the Nameless sanction ${F[tid].name}`);
  F.filter(f => f.alive && f.id !== P && f.id !== tid && f.rel === 'Order' && !S.sanct.includes(f.id) && Math.random() < 0.3).forEach(f => {
    if (!atWar(f.id, tid)) declareWar(f.id, tid);
  });
  if (tid === P) await notify(`<h3>✠ SANCTIONED</h3>The Nameless have sanctioned ${F[P].name}.<br>Order worlds grow restless (−2 order), faithful generals waver each year, and you may become the target of Reclamations.<br><small>Raise your standing to 5 or do penance to be restored.</small>`);
  return true;
}
// ===== Papal powers of the Grandmaster (M2TW-style): excommunication, absolution, ceasefire, interdict =====
const exco = fid => (S.exco ??= []).includes(fid);
async function tryExcommunicate(tid, byPlayer) {
  if (!S.sanct.includes(tid) || exco(tid)) return false;
  councilFill();
  const mem = S.council.map(id => CH[id]).filter(Boolean);
  let yes = 0;
  mem.forEach(c => {
    if (c.f !== tid && Math.random() < 0.35 + (4 - standing(tid)) * 0.12 + (c.piety > 7 ? 0.1 : 0) + (byPlayer ? 0.05 : 0)) yes++;
  });
  const pass = yes >= 9;
  log(`🔥 The Council votes ${yes}–${mem.length - yes} ${pass ? 'to EXCOMMUNICATE' : 'against excommunicating'} ${F[tid].name}${F[tid].ruler ? ' and ' + F[tid].ruler.name : ''}.`);
  if (!pass) return false;
  S.exco.push(tid);
  S.standing[tid] = 0;
  apoc(2, `${F[tid].name} cast out of the faith`);
  F.forEach(f => {
    if (f.alive && f.id !== tid && f.rel === 'Order' && !hostile(f)) grudge(f.id, tid, -4, 'excommunication');
  });
  F.filter(f => f.alive && f.id !== P && f.id !== tid && f.rel === 'Order' && !S.sanct.includes(f.id) && Math.random() < 0.45).forEach(f => {
    if (!atWar(f.id, tid)) declareWar(f.id, tid);
  });
  // Pious servants of the outcast waver
  systems.filter(s => s.owner === tid && s.general && (s.general.piety || 0) >= 7).forEach(s => {
    s.general.loyalty = Math.max(0, s.general.loyalty - 2);
  });
  if (F[tid].ruler) note(F[tid].ruler, 'is excommunicated by the Nameless.');
  if (tid === P) await notify(`<h3>🔥 EXCOMMUNICATED</h3>The Grandmaster has cast ${F[P].name} out of the faith.<br>Order worlds riot (−3 order), pious governors lose loyalty every year, faithful houses may attack you with a clear conscience, and alliances with them break.<br><small>Only absolution (penance of 1000, standing 4+) restores you.</small>`);
  [...S.ally].forEach(k => {
    const [a, b] = k.split('|').map(Number);
    const o = a === tid ? b : b === tid ? a : null;
    if (o != null && F[o]?.rel === 'Order' && Math.random() < 0.6) {
      S.ally.delete(k);
      log(`🔥 ${F[o].name} renounces its alliance with the excommunicated ${F[tid].name}.`);
    }
  });
  return true;
}
function absolve(fid, why) {
  S.exco = (S.exco ??= []).filter(x => x !== fid);
  S.sanct = S.sanct.filter(x => x !== fid);
  S.standing[fid] = Math.max(standing(fid), 4);
  log(`✠ ${F[fid].name} is absolved by the Nameless${why ? ' — ' + why : ''}.`);
}
// The Grandmaster orders two faithful houses to stop fighting
async function papalCeasefire(a, b) {
  log(`✠ Grandmaster ${F[0].ruler?.name} commands ${F[a].name} and ${F[b].name} to lay down their arms.`);
  for (const x of [a, b]) {
    const o = x === a ? b : a;
    if (!atWar(a, b)) return;
    let obey;
    if (isMe(x)) obey = (await ask(`<h3>✠ Papal Command</h3>${portrait(F[0].ruler, 64)}Grandmaster ${F[0].ruler.name} demands that you make peace with <b>${F[o].name}</b>.<br><small>Obey: +1 standing. Defy: −3 standing and the Council may move to sanction you.</small>`, ['Obey', 'Defy'])) === 'Obey';else obey = Math.random() < 0.25 + standing(x) * 0.07 + persona(F[x].ruler).honor * 0.2 - Math.max(0, opinion(x, o) * -0.02);
    if (obey) {
      makePeace(a, b);
      st(x, 1, 'obeying the Grandmaster');
      return;
    }
    st(x, -3, 'defying the Grandmaster');
    log(`✠ ${F[x].name} defies the Grandmaster's command.`);
    if (standing(x) <= 2 && !S.sanct.includes(x) && Math.random() < 0.5) await trySanction(x, false);
  }
}
// Interdict: no rites on a world for a few years (−3 order)
function interdict(s, yrs = 3) {
  s.interdict = yrs;
  log(`⛔ The Nameless lay an interdict on ${s.name}: no rites will be sung there for ${yrs} years.`);
  if (s.owner >= 0) grudge(s.owner, 0, -3, 'an interdict');
}
async function papalYear() {
  systems.forEach(s => {
    if (s.interdict > 0) s.interdict--;
  });
  S.exco = (S.exco ??= []).filter(id => F[id]?.alive);
  // Pious excommunicates' servants keep wavering; the outcast may beg absolution
  for (const id of [...S.exco]) {
    systems.filter(s => s.owner === id && s.general && (s.general.piety || 0) >= 6).forEach(s => {
      s.general.loyalty = Math.max(0, s.general.loyalty - 1);
    });
    if (!isHuman(id) && F[id].gold >= 1000 && standing(id) >= 3 && Math.random() < 0.3) {
      F[id].gold -= 1000;
      F[0].gold += 1000;
      absolve(id, 'after a humbling penance');
    }
  }
  if (isHuman(0) || !F[0]?.ruler) return;
  // AI Grandmaster: excommunicate long-sanctioned rogues, command ceasefires between the faithful, interdict heretic worlds
  const rogue = S.sanct.filter(id => !exco(id) && F[id]?.alive && standing(id) <= 1);
  if (rogue.length && Math.random() < 0.35) await tryExcommunicate(rnd(rogue), false);
  const wars = [...S.war].map(k => k.split('|').map(Number)).filter(([a, b]) => a !== 0 && b !== 0 && F[a]?.alive && F[b]?.alive && F[a].rel === 'Order' && F[b].rel === 'Order' && !S.sanct.includes(a) && !S.sanct.includes(b));
  if (wars.length && Math.random() < 0.3) {
    const [a, b] = rnd(wars);
    await papalCeasefire(a, b);
  }
  const bad = systems.filter(s => s.owner > 0 && !s.interdict && (s.rel === 'Zithari' || S.sanct.includes(s.owner) && s.rel === 'Order'));
  if (bad.length && Math.random() < 0.25) interdict(rnd(bad));
}
async function papalMenu() {
  const opts = ['🔥 Excommunicate', '✠ Absolve', '🕊 Command a Ceasefire', '⛔ Lay an Interdict', '◀ Back'];
  const c = await ask('<h3>✠ Papal Powers</h3>As Grandmaster you may cast houses out of the faith, absolve them, command the faithful to stop fighting, or silence a world\'s rites.<br><small>Excommunication needs a prior sanction and 9 of 13 Council votes.</small>', opts);
  if (c === '🔥 Excommunicate') {
    const cand = F.filter(f => f.alive && S.sanct.includes(f.id) && !exco(f.id));
    if (!cand.length) return notify('No sanctioned house to excommunicate. Sanction one first.');
    const n = await ask('<h3>🔥 Excommunicate</h3>', [...cand.map(f => f.name), 'Cancel']);
    const f = cand.find(x => x.name === n);
    if (f) await notify((await tryExcommunicate(f.id, true)) ? `${f.name} is cast out of the faith.` : 'The Council refuses.');
  }
  if (c === '✠ Absolve') {
    const cand = F.filter(f => f.alive && (S.sanct.includes(f.id) || exco(f.id)));
    if (!cand.length) return notify('No one stands condemned.');
    const n = await ask('<h3>✠ Absolve</h3>', [...cand.map(f => f.name), 'Cancel']);
    const f = cand.find(x => x.name === n);
    if (f) {
      absolve(f.id, 'by the Grandmaster\'s mercy');
      grudge(f.id, 0, 6, 'absolution');
      apoc(-1, 'absolution');
    }
  }
  if (c === '🕊 Command a Ceasefire') {
    const wars = [...S.war].map(k => k.split('|').map(Number)).filter(([a, b]) => a !== 0 && b !== 0 && F[a]?.alive && F[b]?.alive && !hostile(F[a]) && !hostile(F[b]));
    if (!wars.length) return notify('No houses are at war.');
    const lbl = ([a, b]) => `${F[a].name} ⚔ ${F[b].name}`;
    const n = await ask('<h3>🕊 Command a Ceasefire</h3>', [...wars.slice(0, 8).map(lbl), 'Cancel']);
    const w = wars.find(x => lbl(x) === n);
    if (w) await papalCeasefire(w[0], w[1]);
  }
  if (c === '⛔ Lay an Interdict') {
    const cand = systems.filter(s => s.owner > 0 && !s.interdict && charted(s)).sort((a, b) => (b.rel === 'Zithari') - (a.rel === 'Zithari') || S.sanct.includes(b.owner) - S.sanct.includes(a.owner)).slice(0, 8);
    const n = await ask('<h3>⛔ Lay an Interdict</h3>−3 order for 3 years.', [...cand.map(s => `${s.name} (${F[s.owner].name})`), 'Cancel']);
    const s = cand.find(x => n === `${x.name} (${F[x.owner].name})`);
    if (s) interdict(s);
  }
}
async function trial(judge, g, t) {
  // M2TW inquisition: the inquisitor's piety against the accused's; a house out of favour with the Nameless is easy prey
  const ok = Math.random() < clamp(0.15 + (6 - g.piety) * 0.07 + (judge.piety || judge.skill || 0) * 0.025 + (4 - standing(g.f)) * 0.04 + (exco(g.f) ? 0.15 : 0) - (has(g, 'Blessed') ? 0.15 : 0) - (has(g, 'Pious') ? 0.05 : 0), 0.05, 0.85);
  if (!ok) {
    note(g, `survives a heresy trial by ${judge.name} at ${t.name}.`);
    maybe(g, 'Pious', 0.3);
    return false;
  }
  hist(g, `is tried by ${judge.name} and burned as a heretic at ${t.name}.`);
  if (setFate(g, 'dead')) await succession(g.f, 'was burned for heresy');
  return true;
}
async function namelessYear() {
  if (!F[0]?.alive) return;
  const up = councilFill();
  for (const c of up) if (c.f === P) await notify(`<h3>✠ Raised to the Council</h3>${portrait(c, 80)}Your Nameless Monk is now <b>${c.name}</b>, one of the Council of 13 Masters. He will vote on sanctions and may be elected Grandmaster.`);
  F.forEach(f => {
    if (!f.alive || f.id === 0 || hostile(f)) return;
    const s = standing(f.id);
    if (f.rel === 'Order' && s < 6 && Math.random() < 0.3) S.standing[f.id] = s + 1;
    if (f.rel !== 'Order' && s > 3 && Math.random() < 0.2) S.standing[f.id] = s - 1;
  });
  const gm = F[0].ruler;
  if (gm.origin != null && F[gm.origin]?.alive) S.standing[gm.origin] = Math.max(8, standing(gm.origin));
  await papalYear();
  S.sanct = S.sanct.filter(id => {
    if (!F[id]?.alive) return false;
    if (exco(id)) return true; // the excommunicated need absolution, not time
    if (standing(id) >= 5) {
      log(`✠ The Nameless lift their sanction on ${F[id].name}.`);
      return false;
    }
    systems.filter(s => s.owner === id && s.general && s.rel === 'Order').forEach(s => {
      s.general.loyalty = Math.max(0, s.general.loyalty - 1);
    });
    return true;
  });
  if (P !== 0) {
    // The Watch is outside the Council's politics: never sanctioned, but its godless brothers can still face the Inquisition
    const cand = F.filter(f => f.alive && f.id !== 0 && f.id !== 1 && !hostile(f) && !S.sanct.includes(f.id) && standing(f.id) <= 2);
    if (cand.length && Math.random() < 0.5) await trySanction(rnd(cand).id, false);
    const impious = fid => systems.some(s => s.owner === fid && s.general && ((s.general.piety || 0) <= 2 || has(s.general, 'Godless')));
    const tg = F.filter(f => f.alive && f.id !== 0 && !hostile(f) && (f.id === 1 ? impious(1) : S.sanct.includes(f.id) || standing(f.id) <= 3 || impious(f.id)));
    if (tg.length && units.filter(u => u.owner === 0 && u.role === 'Master').length < 2 && Math.random() < 0.5) {
      const f = rnd(tg),
        own = systems.filter(x => x.owner === f.id),
        bad = own.filter(x => x.general && ((x.general.piety || 0) <= 2 || has(x.general, 'Godless')));
      const s = rnd(f.id === 1 || bad.length ? bad.length ? bad : own : own);
      if (s) {
        const c = mkChar(0, ri(40, 65));
        Object.assign(c, {
          role: 'Master',
          name: 'Master ' + rnd(EPI),
          piety: ri(7, 10),
          skill: ri(4, 8)
        });
        addUnit({
          type: 'agent',
          role: 'Master',
          owner: 0,
          sys: s,
          char: c,
          tgt: s.i,
          life: 6
        });
        if (f.id === P) log(`⚜ The Grandmaster sends ${cl(c)} to examine the faithful of ${s.name}. Keep impious characters away!`);
      }
    }
  }
}
async function namelessPage() {
  if (!F[0]?.alive) return notify('The Nameless have fallen. There is no Grandmaster.');
  councilFill();
  const gm = F[0].ruler,
    mem = S.council.map(id => CH[id]).filter(Boolean);
  const short = c => (F[c.f]?.name || '').replace(/^The /, '').slice(0, 11);
  const my = standing(P);
  let h = `<h3>✠ The Nameless</h3><div class="ccard">${portrait(gm, 76)}<div style="font-size:12px">Grandmaster <b>${cl(gm)}</b>${gm.origin != null ? `<br><small>Raised from ${F[gm.origin]?.name}</small>` : ''}<br>Piety ${gm.piety} · Violence ${gm.violence}<br>Purity ${gm.purity} · Reverence ${gm.reverence}<br>${gm.traits.join(', ')}</div></div>`;
  if (P !== 0) h += `<div class="flab">Your standing</div><b style="color:${my >= 5 ? '#9f9' : '#f88'}">${my}/10 — ${standLbl(my)}</b>${exco(P) ? ' · <b style="color:#f33">🔥 EXCOMMUNICATED</b>' : S.sanct.includes(P) ? ' · <b style="color:#f55">SANCTIONED</b>' : ''}<br><small>Raise it: temples, converting worlds, answering Reclamations, mercy, donations. Lower it: attacking the faithful, sacking, enslaving, executions, Zithari and Witches.</small>`;
  h += `<div class="flab">Council of 13 Masters</div><div class="frow">${mem.map(c => card(c, short(c))).join('')}</div>`;
  h += `<div class="flab">Standing of the powers</div><div class="scroll" style="max-height:22vh">${F.filter(f => f.alive && f.id !== 0 && !hostile(f)).sort((a, b) => standing(b.id) - standing(a.id)).map(f => `<div>${exco(f.id) ? '🔥 ' : S.sanct.includes(f.id) ? '⛔ ' : ''}${f.name}: ${standing(f.id)} <small>${standLbl(standing(f.id))}</small></div>`).join('')}</div>`;
  h += S.recl ? `<small>${reclSide() === 'Zithari' ? '🌑 Dark' : '✠'} Reclamation of ${S.recl.target.name} until turn ${S.recl.until}</small>` : '<small>No Reclamation is called.</small>';
  h += `<div class="flab">Ancient Holy Worlds</div>${holyWorlds().map(s => `<div>${s.holy != null && HOLY[s.holy][1] === 'Zithari' ? '🌑' : HOLY[s.holy][1] === 'both' ? '👑' : '✠'} <b>${HOLY[s.holy][0]}</b> (${s.name}) — ${s.owner >= 0 ? F[s.owner].name : 'Independent'}<br><small>${HOLY[s.holy][2]}</small></div>`).join('')}`;
  const opts = ['Close'];
  if (P !== 0) opts.push('Donate 200 (+2)');
  if (S.sanct.includes(P) && !exco(P)) opts.push('Do Penance (400)');
  if (exco(P) && standing(P) >= 4) opts.push('🔥 Seek Absolution (1000)');
  if (P === 0) opts.push('Sanction a Faction', '✠ Papal Powers');
  if (!S.recl && P !== 0 && onSide(P, 'Order')) opts.push('✠ Petition a Reclamation');
  if (!S.recl && P === 0) opts.push('✠ Call a Reclamation');
  if (P !== 0 && onSide(P, 'Order')) opts.push('✠ Nominate a Monk');
  const c = await ask(h + (onSide(P, 'Zithari') ? '<br><small>🌑 The Dark needs no council: send a Zithari preacher to (or beside) a holy world to proclaim a Dark Reclamation.</small>' : ''), opts);
  if (c === '✠ Nominate a Monk') return nominateMonk();
  if (c === '✠ Petition a Reclamation' || c === '✠ Call a Reclamation') return reclPetition();
  if (c === 'Donate 200 (+2)' && pay(200)) {
    F[0].gold += 200;
    st(P, 2, 'donation');
    apoc(-1, 'tithe to the Nameless');
  }
  if (c === '✠ Papal Powers') return papalMenu();
  if (c === '🔥 Seek Absolution (1000)' && pay(1000)) {
    F[0].gold += 1000;
    absolve(P, 'after a humbling penance');
  }
  if (c === 'Do Penance (400)' && pay(400)) {
    F[0].gold += 400;
    S.sanct = S.sanct.filter(x => x !== P);
    S.standing[P] = 5;
    log(`✠ ${F[P].name} does penance; the sanction is lifted.`);
  }
  if (c === 'Sanction a Faction') {
    const cand = F.filter(f => f.alive && f.id !== 0 && !hostile(f) && !S.sanct.includes(f.id)).sort((a, b) => standing(a.id) - standing(b.id)).slice(0, 6);
    const n = await ask('<h3>✠ Move to Sanction</h3>The Council must vote 7 of 13. Low standing makes the vote easier.', [...cand.map(f => f.name), 'Cancel']);
    const f = cand.find(x => x.name === n);
    if (f) {
      const ok = await trySanction(f.id, true);
      await notify(ok ? `${f.name} is sanctioned.` : 'The Council rejects your motion.');
    }
  }
}

// ================= The Nightfleet (lives on donations) =================
function nmDonate(fid, amt) {
  S.nmYear = (S.nmYear || 0) + amt;
  S.nmSupport[fid] = (S.nmSupport[fid] || 0) + 1;
  S.nmGive ??= {};
  S.nmGive[fid] = (S.nmGive[fid] || 0) + amt;
}
// The Nightfleet cannot tax anyone: its envoys travel the houses and plead for support (or, after starving years, demand a levy)
function nmPleaText(levy) {
  const a = Math.round(S.apoc || 0);
  const stage = a >= 75 ? `The Armageddon count stands at <b>${a}</b>. Should it reach 100, the Forgotten Fleet wakes — the Seven Domiri, undying lords that no blade but a Starblade can unmake. They will not stop at the rim. They will burn your worlds after ours.` : a >= 50 ? `The Armageddon count stands at <b>${a}</b>. The omens on the rim are no longer rumours: dead stars, ships returning without crews. Past 50 the galaxy's worlds grow restless; past 75 they rot. At 100 the Forgotten Fleet comes.` : a >= 25 ? `The Armageddon count stands at <b>${a}</b>. Every war, every sack, every betrayal between the houses feeds the dark beyond the rim, and it is stirring.` : `The Armageddon count stands at <b>${a}</b>. The rim is quiet — because we hold it, not because the dark sleeps.`;
  return `<i>"The Nightfleet holds the galaxy's outer rim. We take no worlds and fight no house; we watch the dark so that you need not. Our crews are convicts, exiles and the sworn — we have no tithes, only what the houses give.</i><br>${stage}<br><i>Under 100 credits a year our crews desert and things slip through; over 200 and we reinforce the rim. ${levy ? `For years you gave nothing. The Lord Commander demands <b>${levy}</b> credits — refuse, and we seize your convoys.` : 'Every gift also lowers the Armageddon count.'}"</i>`;
}
// AI house hears a Nightfleet envoy: fear of the dark, honour, distance from the rim, gratitude, greed and the envoy's skill
function nmGiveOdds(fid, sk = 4, levy = 0) {
  const f = F[fid],
    mine = systems.filter(s => s.owner === fid);
  if (!f?.ruler || !mine.length) return 0;
  const east = mine.reduce((t, s) => t + s.pos.x, 0) / mine.length,
    p = persona(f.ruler);
  return clamp((levy ? 0.45 : 0.25) + (east > 15 ? 0.2 : east > 0 ? 0.08 : 0) + p.honor * 0.3 + (S.apoc || 0) / 200 + (S.nmStarve ? 0.1 : 0) + (sk - 4) * 0.04 + opinion(fid, 1) * 0.02 - (has(f.ruler, 'Greedy') ? 0.15 : 0) + (has(f.ruler, 'Generous') ? 0.1 : 0), 0.05, 0.92);
}
function nmAnswer(fid, sk, levy, envoy, sys) {
  const f = F[fid],
    amt = levy || (f.gold > 600 ? 120 : 60);
  const ok = f.gold >= amt && Math.random() < nmGiveOdds(fid, sk, levy);
  if (ok) {
    f.gold -= amt;
    F[1].gold += amt;
    nmDonate(fid, amt);
    grudge(1, fid, 2);
    if (Math.random() < 0.3) apoc(-1);
  } else if (levy) nmRaid(fid, levy);else grudge(1, fid, -2, "turning away the Nightfleet's envoy");
  WA('dip', {
    a: envoy?.id,
    f: 1,
    to: fid,
    s: sys?.i,
    ok,
    txt: ok ? `pleads for the rim and is granted ${amt} credits` : `pleads for the rim${levy ? ' (a levy)' : ''} and is refused`
  });
  return ok ? amt : 0;
}
// AI Nightfleet sends envoys out to the houses that have not been asked lately
function nmPleas(f) {
  if (isHuman(1) || !f.alive || Math.random() > 0.35) return;
  S.nmAsked ??= {};
  const t = F.filter(o => o.alive && o.id !== 1 && !hostile(o) && !atWar(1, o.id) && o.gold > 100 && (S.nmAsked[o.id] ?? -9) < S.year - 1 && systems.some(s => s.owner === o.id)).sort((a, b) => b.gold - a.gold)[0];
  if (t && sendEnvoy(1, t.id, 'nmplea')) S.nmAsked[t.id] = S.year;
}
async function nmYearTick() {
  if (!F[1].alive) return;
  const d = S.nmYear || 0,
    ns = systems.filter(s => s.owner === 1);
  if (d >= 200) {
    ns.forEach(s => {
      s.legions += 1;
    });
    const s = rnd(ns);
    if (s) s.fleet += 1;
    log(`🧭 Donations of ${d} credits keep the Nightfleet armed. They reinforce the rim.`);
  } else if (d < 100) {
    ns.forEach(s => {
      s.legions = Math.max(0, s.legions - 1);
      if (s.general) s.general.loyalty = Math.max(0, s.general.loyalty - 1);
    });
    apoc(1, 'the Nightfleet starves');
    log(`🧭 Starved of donations (${d}), Nightfleet crews desert and their commanders grow bitter.`);
  }
  if (P === 1) log(`🧭 The galaxy donated ${d} credits to the Nightfleet this year.`);
  // The Wall remembers who paid. Starving years breed resentment — and desperate levies on the misers.
  S.nmStarve = d < 100 ? (S.nmStarve || 0) + 1 : 0;
  const misers = F.filter(f => f.alive && f.id !== 1 && !hostile(f) && !S.nmGive?.[f.id] && systems.filter(s => s.owner === f.id).length >= 2).sort((a, b) => b.gold - a.gold);
  if (S.nmStarve >= 1 && misers.length) misers.slice(0, 2).forEach(f => grudge(1, f.id, -3, 'leaving the Nightfleet to starve'));
  // Gratitude fades: past donations count less each year, so a house must keep giving to stay a friend of the rim
  for (const k in S.nmGive ||= {}) {
    S.nmGive[k] = Math.floor(S.nmGive[k] * 0.6);
    if (S.nmGive[k] < 10) delete S.nmGive[k];
  }
  // A levy is carried by an envoy too — it only bites when he reaches the miser's court
  if (S.nmStarve >= 2 && misers.length && !isHuman(1)) {
    const f = misers[0],
      take = Math.max(50, Math.min(150, Math.round(f.gold * 0.25)));
    if (sendEnvoy(1, f.id, 'nmplea', {
      levy: take
    })) log(`🧭 The Nightfleet sends an envoy to demand a levy of ${take} credits from ${f.name}.`);
  }
  if (S.nmStarve >= 2 && Math.random() < 0.35) {
    log('🌑 With the Nightfleet undermanned, something slips in from beyond the outer rim.');
    apoc(3, 'the undermanned rim');
  }
  S.nmYear = 0;
}
// The Wall cannot make war on the houses — a refused levy means seized convoys, not invasion.
function nmRaid(fid, take) {
  const f = F[fid],
    got = Math.min(Math.max(0, f.gold), Math.round(take * 1.3));
  f.gold -= got;
  F[1].gold += got;
  const s = systems.filter(x => x.owner === fid).sort((a, b) => b.pos.x - a.pos.x)[0];
  if (s) s.order = Math.max(0, s.order - 2);
  grudge(fid, 1, -4, 'the seizure of our convoys');
  grudge(1, fid, -2, 'refusing the levy');
  F.forEach(x => {
    if (x.alive && x.id !== fid && x.id !== 1 && !hostile(x)) grudge(x.id, fid, -1, 'shaming the Nightfleet');
  });
  log(`🧭 ${f.name} refuses the levy. Sworn not to make war, the Nightfleet seizes ${got} credits of supply convoys${s ? ` near ${s.name}` : ''} instead.`);
}
// ---- The Council of Five: the Nightfleet's generals elect a Lord Commander, who rules until death ----
const nmMerit = c => (c.skill || 0) + Math.max(0, -(c.respect || 0)) * 0.6 + (c.rim || 0) * 0.8 + (c.loyalty || 0) * 0.3;
function nmCouncilFill() {
  if (!F[1]?.alive) return;
  S.nmCouncil = (S.nmCouncil || []).filter(id => CH[id] && !CH[id].dead && CH[id].f === 1 && F[1].ruler !== CH[id]);
  const staff = systems.filter(s => s.owner === 1).flatMap(s => (s.staff || []).map(id => CH[id]));
  const pool = [...systems.filter(s => s.owner === 1).map(s => s.general), ...units.filter(u => u.owner === 1).map(u => u.general), ...staff, ...F[1].heirs].filter((c, i, a) => c && !c.dead && !c.captive && c.f === 1 && c !== F[1].ruler && !S.nmCouncil.includes(c.id) && a.indexOf(c) === i).sort((a, b) => nmMerit(b) - nmMerit(a));
  while (S.nmCouncil.length < 5) {
    let c = pool.shift();
    if (!c) {
      c = mkChar(1, ri(30, 55));
      c.respect = -ri(1, 5);
    }
    S.nmCouncil.push(c.id);
    note(c, 'takes a seat on the Council of Five of the Nightfleet.');
  }
  nmPostCouncil();
}
// The Five are serving generals of the Watch: each holds a world or a fleet, or waits in the officer reserve, never idle at court
function nmPostCouncil() {
  const f = F[1];
  if (!f?.alive) return;
  const posted = c => systems.some(s => s.general === c) || units.some(u => u.general === c) || systems.some(s => s.staff?.includes(c.id));
  for (const id of S.nmCouncil || []) {
    const c = CH[id];
    if (!c || c.dead || c.captive || c.f !== 1) continue;
    c.gen = true;
    if (posted(c)) {
      f.heirs = f.heirs.filter(h => h !== c);
      continue;
    }
    f.heirs = f.heirs.filter(h => h !== c);
    const seat = systems.find(s => s.owner === 1 && !s.general && s !== f.capital) || systems.find(s => s.owner === 1 && !s.general);
    const fleet = units.find(u => u.owner === 1 && u.type === 'fleet' && !u.general);
    if (seat) {
      seat.general = c;
      note(c, `is given the command of ${seat.name}.`);
    } else if (fleet) {
      fleet.general = c;
      note(c, `takes command of a fleet of the Watch at ${fleet.sys?.name || 'the rim'}.`);
    } else {
      const home = f.capital?.owner === 1 ? f.capital : systems.find(s => s.owner === 1);
      if (home) station(home, c);
    }
  }
}
// ---- Elections the player can watch or sway: back a candidate with gold (+4 to his tally). Foreign bribes may be exposed. ----
// Returns { b(c): bonus, shown, done(winner) }. Foreign elections only pop up for houses whose capital you have charted.
async function sway(fid, title, cands, sc) {
  const f = F[fid],
    bonus = new Map(),
    own = fid === P,
    cost = own ? 100 : 200;
  // Hatred: electors will not raise a man their house's lords hate
  const hp = new Map([...new Set(cands)].filter(Boolean).map(c => [c, Math.min(4, hateOf(fid, c) * 0.25)]));
  // Foreign gold: AI houses buy votes for their own kinsman standing, or for a favourite they like
  const bz = [];
  for (const o of F) {
    if (!o?.alive || o.id === fid || o.id === P || hostile(o) || !o.ruler || o.gold < 300 || Math.random() > 0.12) continue;
    const mine = cands.filter(c => c && c.f === o.id);
    const fav = mine[0] || (has(o.ruler, 'Greedy') || has(o.ruler, 'Deceitful') ? [...new Set(cands)].filter(Boolean).sort((a, b) => opinion(o.id, b.f) - opinion(o.id, a.f))[0] : null);
    if (!fav) continue;
    o.gold -= 200;
    const ex = Math.random() < 0.3;
    bonus.set(fav, (bonus.get(fav) || 0) + (ex ? 0 : 3));
    bz.push({
      f: o.id,
      c: fav.id,
      ex
    });
    if (ex) {
      grudge(fid, o.id, -5, `meddling in the ${title}`);
      log(`😠 ${o.name} is caught bribing the electors of ${f?.name}.`);
    }
  }
  // Every election goes into the Archive, whether or not the player watched it
  const rec = (w, txt, pick, caught) => w && WA('elect', {
    f: fid,
    title,
    w: w.id,
    c: [...new Set(cands)].filter(c => c && c !== w).slice(0, 4).map(c => c.id),
    txt: txt || '',
    bk: pick?.id,
    ex: !!caught,
    bz: [...(pick ? [{
      f: P,
      c: pick.id,
      ex: !!caught
    }] : []), ...bz].map(b => ({
      ...b,
      won: b.c === w.id
    })),
    hh: [...hp].filter(([, v]) => v >= 1).map(([c, v]) => [c.id, Math.round(v)])
  });
  const res = {
    b: c => (bonus.get(c) || 0) - (hp.get(c) || 0),
    shown: false,
    done: async (w, txt) => rec(w, txt)
  };
  if (SIM || !F[P]?.alive || !f || cands.length < 2 || hostile(f) || !own && (atWar(P, fid) || !S.seen?.has?.(f.capital?.i))) return res;
  const top = [...new Set(cands)].sort((a, b) => sc(b) - sc(a)).slice(0, 4),
    lb = c => `💰 Back ${c.name}`;
  const r = await ask(`<h3>🗳 ${title}</h3>${own ? 'Your electors gather. A purse in the right hands can tilt the vote.' : `${f.name} chooses a new leader. Your agents can watch — or slip gold to the electors.`}<div class="frow">${top.map(c => card(c, `favour ${Math.round(sc(c))}`)).join('')}</div><small>Backing a candidate costs ${cost} credits.${own ? '' : ' Foreign bribes are exposed 30% of the time; a winner you backed remembers it.'}</small>`, [...(F[P].gold >= cost ? top.map(lb) : []), '👁 Watch']);
  res.shown = true;
  const pick = top.find(c => r === lb(c));
  let caught = false;
  if (pick && pay(cost)) {
    bonus.set(pick, 4);
    if (!own && (caught = Math.random() < 0.3)) {
      grudge(fid, P, -5, `meddling in the ${title}`);
      log(`😠 ${F[P].name} is caught bribing the electors of ${f.name}.`);
    }
  }
  res.done = async (w, txt) => {
    rec(w, txt, pick, caught);
    const won = pick && w === pick;
    if (won && !own) {
      grudge(fid, P, caught ? 1 : 4, `the gold that raised ${w.name}`);
      hist(w, `owes his election in part to the gold of ${F[P].name}.`);
    }
    await notify(`<h3>🗳 ${title}</h3>${portrait(w, 72)}<b>${w.name}</b> is chosen.${pick ? won ? ' Your gold found its mark.' : ` ${pick.name}, whom you backed, loses.` : ''}${caught ? `<br>😠 Your bribes were exposed — ${f.name} will not forget.` : ''}`);
  };
  return res;
}
async function nmElect(cause) {
  const f = F[1];
  nmCouncilFill();
  const cs = S.nmCouncil.map(id => CH[id]).filter(c => c && !c.dead && !c.captive),
    votes = new Map();
  const sw = await sway(1, 'Election of the Lord Commander', cs, nmMerit);
  cs.forEach(v => {
    const pick = cs.map(c => [c, nmMerit(c) + sw.b(c) + Math.random() * 4 + (c === v ? 3 : 0) + (c.exiledBy != null && c.exiledBy === v.exiledBy ? 1.5 : 0)]).sort((a, b) => b[1] - a[1])[0][0];
    votes.set(pick, (votes.get(pick) || 0) + 1);
  });
  const [w, n] = [...votes.entries()].sort((a, b) => b[1] - a[1] || nmMerit(b[0]) - nmMerit(a[0]))[0];
  f.ruler = w;
  w.wasRuler = true;
  f.heirs = f.heirs.filter(h => h !== w);
  units.filter(u => u.owner === 1 && u.general === w).forEach(u => {
    u.general = null;
  });
  S.nmCouncil = S.nmCouncil.filter(id => id !== w.id);
  nmCouncilFill();
  hist(w, `is elected Lord Commander of the Nightfleet by the Council of Five (${n} of ${cs.length} votes).`);
  log(`🧭 The Council of Five elects ${cl(w)} Lord Commander of the Nightfleet (${n}–${cs.length - n}).`);
  await sw.done(w, `${n} of ${cs.length} votes of the Council of Five`);
  if (!sw.shown && P === 1) await notify(`<h3>🧭 A New Lord Commander</h3>${portrait(w, 80)}${cause ? `The old Lord Commander ${cause}.<br>` : ''}The Council of Five casts its votes: <b>${w.name}</b> is elected with ${n} of ${cs.length}. He commands until death.`);
}
// A general leaves the Wall with the men who are loyal to him
function nmBreak(g, to, why) {
  const w = systems.find(s => s.general === g && s.owner === 1);
  const men = w ? Math.ceil(w.legions * 0.6) + (g.rim || 0) : 2 + (g.rim || 0),
    el = w ? w.elite : 0;
  if (w) {
    w.legions = Math.max(0, w.legions - Math.ceil(w.legions * 0.6));
    w.elite = 0;
    w.general = null;
  }
  units.forEach(u => {
    if (u.general === g) u.general = null;
  });
  F[1].heirs = F[1].heirs.filter(h => h !== g);
  S.nmCouncil = (S.nmCouncil || []).filter(id => id !== g.id);
  g.f = to;
  g.loyalty = ri(6, 9);
  g.oathbroken = true;
  const home = systems.filter(s => s.owner === to).sort((a, b) => b.pos.x - a.pos.x)[0];
  if (home) addUnit({
    type: 'fleet',
    owner: to,
    sys: home,
    fleet: 2,
    legions: men,
    elite: el,
    general: g
  });
  grudge(1, to, -4, `luring ${g.name} from the Nightfleet`);
  apoc(2, 'a sworn brother breaks his vows');
  hist(g, `${why}, leading ${men} loyal legions out of the Nightfleet.`);
  log(`🧭 ${cl(g)} ${why} — ${men} legions of the Nightfleet follow him.`);
}
// Yearly: the rim forges dread and command; famous generals become opportunities — and threats.
async function nmRimTick() {
  if (!F[1]?.alive) return;
  nmCouncilFill();
  const gens = [...systems.filter(s => s.owner === 1 && s.general).map(s => [s.general, s]), ...units.filter(u => u.owner === 1 && u.general).map(u => [u.general, u.sys])];
  // Hardening comes only from battle: every archived fight a sworn brother commanded for the Nightfleet counts; victories breed dread and skill
  const fought = {};
  for (const b of S.wiki?.battles || []) {
    if (b.rv) continue;
    b.rv = 1;
    for (const [id, side] of [[b.ga, 'a'], [b.gd, 'd']]) if (id != null && (side === 'a' ? b.a : b.d) === 1) (fought[id] ??= []).push(b.w === side);
  }
  for (const [id, fs] of Object.entries(fought)) {
    const g = CH[id];
    if (!g || g.dead || g.f !== 1) continue;
    const before = g.rim || 0,
      wins = fs.filter(Boolean).length;
    g.rim = before + fs.length;
    g.respect = Math.max(-14, (g.respect || 0) - wins);
    for (let i = 0; i < wins; i++) if (Math.random() < 0.35) g.skill = Math.min(10, g.skill + 1);
    if (before < 3 && g.rim >= 3) note(g, `has commanded in ${g.rim} battles for the Nightfleet (${g.wins || 0} victories in all) and his name is feared beyond the rim.`);
  }
  for (const [g, s] of gens) {
    if (g.dead || g === F[1].ruler || g.f !== 1 || (g.rim || 0) < 3) continue;
    const merit = nmMerit(g);
    // 1. The princess: a lord offers his daughter to a famous sword of the Wall
    if ((g.spouse == null || CH[g.spouse]?.dead) && Math.random() < 0.04 + g.rim * 0.01) {
      const offers = F.filter(f => f.alive && f.id !== 1 && !hostile(f) && f.ruler && persona(f.ruler).agg > -0.2).flatMap(f => (f.princesses || []).filter(p => !p.dead && p.spouse == null && p.age >= 16).map(p => [f, p]));
      if (offers.length) {
        const [hf, p] = rnd(offers);
        if (P === 1) {
          const c = await ask(`<h3>🧭 Tempted from the Rim</h3>${portrait(g, 60)}${portrait(p, 60)}<br>${hf.name} offers <b>${p.name}</b> to your general <b>${g.name}</b> (Fear ${-(g.respect || 0)}, ${g.rim} battles on the rim) if he forsakes his vows.`, ['Remind him of his oath', 'Let him go']);
          if (c === 'Remind him of his oath' && Math.random() < 0.4 + g.loyalty * 0.06) {
            g.loyalty = Math.min(10, g.loyalty + 1);
            note(g, `refuses the hand of ${p.name} and keeps his vows.`);
            continue;
          }
        }
        wed(g, p);
        hf.princesses = hf.princesses.filter(x => x !== p);
        nmBreak(g, hf.id, `forsakes his vows for the hand of ${p.name} of ${hf.name}`);
        continue;
      }
    }
    // 2. Going home: an exile with a famous name returns to his former house — with an army
    const from = g.nmFrom;
    if (from != null && from !== 1 && F[from]?.alive && !hostile(F[from]) && g.loyalty < 6 && Math.random() < 0.03 * g.rim) {
      if (from === P) {
        const c = await ask(`<h3>🧭 A Son Returns</h3>${portrait(g, 70)}<b>${g.name}</b>, exiled to the Nightfleet, has become a feared commander of the rim. He offers to return to your house with the legions loyal to him.`, ['Welcome him home', 'Turn him away']);
        if (c !== 'Welcome him home') {
          g.loyalty = Math.max(0, g.loyalty - 2);
          continue;
        }
      }
      nmBreak(g, from, `returns to ${F[from].name}, his old house`);
      continue;
    }
    // 3. Rebellion: when the stars align, a dreaded general and his loyal brothers march west
    if (g.loyalty <= 4 && merit >= 11 && Math.random() < 0.05 + (S.nmStarve || 0) * 0.04 + (g.exiledBy != null ? 0.03 : 0)) {
      const r = newFaction(`${g.name}'s Oathbreakers`, 0x880033, 'Old Gods', {
        gold: 300,
        warrior: 1
      }, {
        rogue: true,
        nmRebel: true
      });
      r.ruler = g;
      r.heirs = [];
      r.princesses = [];
      g.f = r.id;
      g.loyalty = 10;
      g.oathbroken = true;
      S.nmCouncil = (S.nmCouncil || []).filter(id => id !== g.id);
      units.forEach(u => {
        if (u.general === g) u.general = null;
      });
      const take = systems.filter(x => x.owner === 1 && (x === s || x.general && x.general.loyalty < 5 && x.general.rim >= 1 || !x.general && x.links.includes(s)));
      take.forEach(x => {
        x.owner = r.id;
        x.legions += g.rim;
        if (x.general && x.general !== g) {
          x.general.f = r.id;
          x.general.oathbroken = true;
          r.heirs.push(x.general);
        }
      });
      if (!take.length && s) addUnit({
        type: 'fleet',
        owner: r.id,
        sys: s,
        fleet: 3,
        legions: 4 + g.rim,
        general: g
      });
      S.war.add(key(1, r.id));
      if (g.exiledBy != null && F[g.exiledBy]?.alive) S.war.add(key(r.id, g.exiledBy));
      apoc(5, 'the Nightfleet breaks');
      const msg = `⚔ ${cl(g)}, veteran of ${g.rim} battles on the rim, renounces his vows and marches west with the brothers loyal to him${take.length > 1 ? ` — ${take.length} worlds follow` : ''}!${g.exiledBy != null && F[g.exiledBy] ? ` He swears revenge on ${F[g.exiledBy].name}.` : ''}`;
      log(msg);
      hist(g, 'renounces his Nightfleet vows and raises the Oathbreakers.');
      await notify(`<h3>🧭 The Oath Breaks</h3>${portrait(g, 70)}${msg}`);
      checkDead(1);
      break;
    }
  }
}
async function nmPage() {
  if (!F[1].alive) return notify('The Nightfleet is no more. Nothing stands between the galaxy and the eastern dark.');
  const ns = systems.filter(s => s.owner === 1),
    str = ns.reduce((t, x) => t + x.legions + x.fleet + x.elite, 0);
  const top = Object.entries(S.nmGive || {}).filter(([k]) => F[k]).sort((a, b) => b[1] - a[1]).slice(0, 6);
  let h = `<h3>🧭 The Nightfleet</h3><div class="ccard">${portrait(F[1].ruler, 70)}<div style="font-size:12px">Lord Commander ${cl(F[1].ruler)}<br>Strength ${str} across ${ns.length} systems<br>Donations this year: <b>${S.nmYear || 0}</b> / 200 needed<br>${P !== 1 ? `Your support: ${S.nmSupport[P] || 0} gifts` : ''}</div></div>`;
  h += `<small>The Nightfleet guard the galaxy's outer rim against the Domiri and the horrors beyond. Sworn to their oath, they may only make war on pirates, barbarians and the Dark. They have no tithes: their envoys travel the houses to plead for support, and the houses decide when the envoy reaches them. Under 100 credits a year they desert and their generals may go rogue. Over 200 a year they grow stronger. Their convict worlds obey dreaded governors best.</small>`;
  nmCouncilFill();
  h += `<div class="flab">Council of Five (elects the Lord Commander)</div><div class="frow">${(S.nmCouncil || []).map(id => CH[id]).filter(Boolean).map(c => card(c, `Fear ${Math.max(0, -(c.respect || 0))} · Rim ${c.rim || 0}`)).join('')}</div><small>Battles fought for the rim forge dread and command (Rim = battles commanded). Famous generals may be tempted home, wed to a princess, or rise in rebellion.</small>`;
  h += `<div class="flab">Greatest benefactors</div>${top.map(([k, v]) => `<div>${F[k].name}: ${v}</div>`).join('') || '<small>None</small>'}`;
  const opts = ['Close'];
  if (P !== 1) opts.push('Donate 100');
  const c = await ask(h, opts);
  if (c === 'Donate 100' && pay(100)) {
    F[1].gold += 100;
    nmDonate(P, 100);
    apoc(-2, 'donation to the Nightfleet');
  }
}

// ================= Bloodbank loans =================
async function loanOffer(dip) {
  const base = {
    Republic: 0.3,
    Dictatorship: 0.45,
    'Blood Empire': 0.6
  }[S.bank.gov] ?? 0.3;
  const r = Math.max(0.1, base - (dip ? dip.skill * 0.02 : 0) - (has(dip, 'Silver Tongue') ? 0.05 : 0));
  const amts = [300, 600, 1000],
    offers = amts.map(a => `Borrow ${a} → repay ${Math.round(a * (1 + r))}`);
  const c = await ask(`<h3>🩸 The Bloodbank</h3>${dip ? `${cl(dip)} looks over the Bloodbank's ledgers.` : 'A Bloodbank banker reaches you before your envoy reaches them.'}<br>Government: ${S.bank.gov} · Interest ${Math.round(r * 100)}% · due in 10 turns<br><small>Default and Bloodknights come to collect.</small>`, [...offers, 'Decline']);
  const i = offers.indexOf(c);
  if (i < 0) return false;
  F[P].gold += amts[i];
  F[5].gold -= amts[i];
  S.loans.push({
    debtor: P,
    owe: Math.round(amts[i] * (1 + r)),
    due: S.turn + 10
  });
  log(`🩸 ${F[P].name} borrows ${amts[i]} credits from the Bloodbank.`);
  return true;
}
function newFaction(name, color, rel, mods, extra = {}) {
  const f = {
    id: F.length,
    name,
    color,
    rel,
    mods,
    alive: true,
    gold: mods.gold ?? 400,
    princesses: [],
    heirs: [],
    tech: [],
    ...extra
  };
  if (f.id >= FDEF.length) f.born = {
    y: S.year,
    t: S.turn
  }; // an emergent power: announced and archived by emergentTick()
  F.push(f);
  if (mods.coven) {
    // Witchmaidens: a Witch-Queen and her sister-heirs; male warlords serve as generals
    f.ruler = mkWM(f.id, ri(40, 60));
    f.ruler.wasRuler = true;
    f.heirs = [mkWM(f.id, ri(18, 28)), mkWM(f.id, ri(16, 24))];
    f.princesses = [];
    return f;
  }
  f.ruler = mkChar(f.id, ri(40, 60));
  f.ruler.wasRuler = true;
  if (celibate(f.id)) {
    // Sworn orders: no marriages. Successors are initiates, not sons.
    f.heirs = [mkChar(f.id, ri(18, 30)), mkChar(f.id, ri(16, 26))];
    f.princesses = [];
    return f;
  }
  const q = mkFem(f.id, f.ruler.age - ri(0, 8));
  q.name = q.name.split(' ')[0] + ' ' + sur(f.ruler);
  wed(f.ruler, q, true);
  f.heirs = [birth(f.id, f.ruler, q, ri(16, 26), false), birth(f.id, f.ruler, q, ri(12, 22), false)];
  f.princesses = Array.from({
    length: ri(0, 2)
  }, () => birth(f.id, f.ruler, q, ri(8, 17), true));
  return f;
}
const attrStr = c => c.fem && !c.wm && (!c.role || c.role === 'Princess') ? `💗 Charm ${c.charm ?? c.skill} · 🕊 Diplomacy ${c.dip ?? 0}` : c.role ? `🎯 ${SK(c)} ${c.skill} · ❤ Loyalty ${c.loyalty}` : `⚔ Command ${c.skill} · ${c.respect >= 0 ? '🛡 Respect' : '💀 Fear'} ${Math.abs(c.respect)} · ${F[c.f]?.ruler === c ? `👑 Authority ${authority(c)}` : `❤ Loyalty ${c.loyalty}`} · 📜 Admin ${c.admin ?? 0} · ✝ Piety ${c.piety}`;
const charStr = c => `${c.name} (${c.age}) ${attrStr(c)}${c.traits.length ? ' [' + c.traits.join(', ') + ']' : ''}`;

// ================= Family, bloodlines & portraits =================
const FNF = ['Aurelia', 'Lyra', 'Seraphine', 'Ilsandre', 'Vesna', 'Talia', 'Mira', 'Corvessa', 'Cassia', 'Nadia', 'Elara', 'Kaela', 'Zora', 'Livia', 'Ione', 'Sabine'];
const sur = c => c.name.replace(' (bastard)', '').split(' ').slice(1).join(' ');
function mkFem(f, age) {
  const c = mkChar(f, age);
  c.fem = true;
  c.name = (c.cult ? firstName(c.cult, true) : rnd(FNF)) + ' ' + c.name.split(' ').slice(1).join(' ');
  c.traits = c.traits.filter(t => t !== 'Lecher');
  c.charm = ri(2, 7);
  c.dip = ri(0, 4);
  return c;
}
// Witchmaiden sister: female, but a full ruler/commander (command, dread, loyalty), sworn to the coven
function mkWM(f, age) {
  const c = mkFem(f, age);
  c.wm = true;
  c.piety = Math.min(10, c.piety + 2);
  c.skill = Math.min(10, c.skill + 1);
  if (Math.random() < 0.3) addTrait(c, 'Cruel', true);
  return c;
}
function birth(fid, father, mother, age = 0, fem = Math.random() < 0.5) {
  const c = fem ? mkFem(fid, age) : mkChar(fid, age);
  if (father) {
    if (father.cult && CULT[father.cult]) {
      c.cult = father.cult;
      c.name = firstName(c.cult, fem) + ' ' + c.name.split(' ').slice(1).join(' ');
    }
    c.name = c.name.split(' ')[0] + ' ' + sur(father);
    c.father = father.id;
    (father.kids ??= []).push(c.id);
    c.blood = clamp(father.blood + ri(-2, 2), 1, 10);
  }
  if (mother) {
    c.mother = mother.id;
    (mother.kids ??= []).push(c.id);
  }
  // Upbringing: piety leans toward the parents'.
  const pp = [father, mother].filter(Boolean).map(p => p.piety || 0);
  if (pp.length) c.piety = clamp(Math.round(pp.reduce((a, b) => a + b, 0) / pp.length * 0.6 + c.piety * 0.4), 0, 10);
  // Newborns enter the chronicle (initial dynasties are generated older and stay quiet)
  if (age === 0 && father) {
    c.hist.push(`Y${S.year}: born to ${father.name}${mother ? ' and ' + mother.name : ''}.`);
    father.hist.push(`Y${S.year}: welcomes a ${fem ? 'daughter' : 'son'}, ${c.name}.`);
    if (fid === P) try {
      playSfx('birth');
    } catch (e) {}
    c.bornY = S.year;
    log(`👶 ${cl(c)} is born to ${cl(father)}${mother ? ' and ' + cl(mother) : ''}${F[fid] ? ' of ' + F[fid].name : ''}.`);
  }
  return c;
}
// The Nameless (0) and the Nightfleet (1) are sworn orders and may not marry; neither may monks or masters.
const celibate = fid => fid === 0 || fid === 1;
// Yearly chance a man fathers a bastard (low base; brothels, vice and loveless or childless marriages raise it, piety lowers it)
function bastardOdds(m) {
  if (has(m, 'Chaste') || ffLord(m)) return 0;
  let p = 0.006;
  if (has(m, 'Lecher')) p += 0.05;
  if (has(m, 'Drunkard')) p += 0.015;
  if (has(m, 'Spice Addict')) p += 0.01;
  p += Math.max(0, 5 - (m.purity ?? 5)) * 0.004;
  p -= Math.max(0, (m.piety ?? 5) - 5) * 0.003;
  if (has(m, 'Pious') || has(m, 'Zealot')) p -= 0.01;
  const s = systems.find(x => x.general === m);
  if (s?.b.has('Brothel')) p += 0.015 + 0.01 * bLv(s, 'Brothel');
  const w = CH[m.spouse];
  if (!w || w.dead) p += 0.008; // unwed men stray
  else {
    const kids = (m.kids || []).filter(id => CH[id]?.mother === w.id).length;
    if (!kids && m.age >= 25) p += 0.02; // a childless marriage
    if ((w.loyalty ?? 5) <= 3) p += 0.012; // a cold one
  }
  return clamp(p * 0.4, 0, 0.05); // kept rare: a bastard should be an event, not a habit
}
// The Forgotten Fleet is one will: its Domiri lords never wed, sire children, waver, defect or contest the throne
const ffLord = c => !!c && (!!c.domiri || !!F[c.f]?.mods?.ff);
const mayWed = c => c && !c.dead && !c.wm && !celibate(c.f) && !ffLord(c) && !['Priest', 'Master'].includes(c.role);
function wed(a, b, quiet) {
  if (ffLord(a) || ffLord(b)) return;
  // Marrying someone else breaks any standing betrothal (the jilted party is free again)
  [[a, b], [b, a]].forEach(([x, y]) => {
    if (x.betrothed != null && x.betrothed !== y.id && CH[x.betrothed]) {
      delete CH[x.betrothed].betrothed;
      if (!quiet) note(CH[x.betrothed], `is jilted: ${x.name} marries another.`);
    }
  });
  a.spouse = b.id;
  b.spouse = a.id;
  delete a.betrothed;
  delete b.betrothed;
  if (quiet) return;
  a.hist.push(`Y${S.year}: marries ${b.name}.`);
  b.hist.push(`Y${S.year}: marries ${a.name}.`);
  if (a.f === P || b.f === P) try {
    playSfx('wed');
  } catch (e) {}
  log(`⚭ ${cl(a)}${F[a.f] ? ' of ' + F[a.f].name : ''} weds ${cl(b)}${F[b.f] && b.f !== a.f ? ' of ' + F[b.f].name : ''}.`);
  WA('wed', {
    a: a.id,
    b: b.id,
    fa: a.f,
    fb: b.f
  });
}
const kin = (a, b) => a.id === b.id || a.father === b.id || b.father === a.id || a.father != null && a.father === b.father;
// Starblade colour mirrors the soul of its wielder
function bladeKey(c) {
  const t = k => c.traits?.includes(k);
  if (t('Fallen') || c.f === 15) return 'Fallen';
  if (t('Redeemed')) return 'Redeemed';
  if (c.f === 16) return 'gray';
  if (c.wm) return 'witch';
  if ((c.respect ?? 0) <= -6) return 'dread';
  if (t('Pious') || (c.piety ?? 0) >= 9) return 'Pious';
  if (t('Cruel') || t('Bloodthirsty')) return 'Cruel';
  if (t('Just') || t('Merciful')) return 'Just';
  if (t('Brave') || t('Hero')) return 'Brave';
  if (t('Brilliant')) return 'Brilliant';
  return 'none';
}
const bladeCol = c => BLADE[bladeKey(c)][0];
const PT_SKIN = ['#f1d3b3', '#e0b58f', '#c68e5f', '#8d5a3b', '#5b3a26', '#b9c7d6'];
const PT_HAIR = ['#1d140e', '#4a2c17', '#8a5a2b', '#c9a25a', '#7a1e12', '#2b2b3a'];
function portrait(c, w = 54) {
  const pt = c.pt || {};
  let h = (c.id + (pt.seed || 0) * 7919) * 2654435761 >>> 0;
  const R = n => {
    h = Math.imul(h, 1103515245) + 12345 >>> 0;
    return (h >>> 8) % n;
  };
  const pick = (k, n) => {
    const r = R(n);
    return pt[k] != null && pt[k] >= 0 ? pt[k] % n : r;
  }; // God Mode overrides keep the RNG stream stable
  const skin = PT_SKIN[pick('skin', 6)];
  const base = PT_HAIR[pick('hair', 6)];
  // Hair greys with the years: first streaks in the 40s, iron-grey past 50, white past 64
  const grey = pt.noGrey ? 0 : c.age > 64 ? 1 : c.age > 50 ? 0.65 : c.age > 40 ? 0.3 : 0;
  const hair = grey ? '#' + new THREE.Color(base).lerp(new THREE.Color('#e6e6e6'), grey).getHexString() : base;
  const fcol = new THREE.Color(F[c.f]?.color ?? 0x888888),
    fc = '#' + fcol.getHexString();
  const fdk = '#' + fcol.clone().multiplyScalar(0.35).getHexString();
  const hood = {
    Priest: '#5a4028',
    Master: '#d8d0b8',
    Zithari: '#1a0406',
    Acolyte: '#2a1030',
    Witch: '#120a18'
  }[c.role];
  const monk = !!hood,
    king = F[c.f]?.ruler === c;
  let style = pick('style', 3);
  const br = R(3);
  if (pt.style === 3) style = 3;
  // Age stages: child < 13, youth 13–17 (beardless), adult, elder 60+ (balding men, sagging face)
  const kid = c.age < 13,
    teen = !kid && c.age < 18,
    elder = c.age >= 60,
    hy = kid ? 6 : teen ? 2 : 0,
    gid = 'pg' + c.id + '_' + (pt.seed || 0);
  if (pt.style == null && !c.fem && c.age >= 62 && br === 0) style = 3; // the years take his hair
  const beardK = pt.beard != null ? pt.beard : !c.fem && !teen && !kid && br > 0 ? c.age >= 30 || br === 2 ? 1 : 2 : 0; // 0 none · 1 full · 2 stubble/goatee
  const beard = !c.fem && !kid && !teen && beardK > 0;
  const metal = ['#9aa4b0', '#c9a24a', '#5c6470'][pick('metal', 3)];
  // Backdrop: faction-tinted void, stars and a faint house sigil
  let s = `<svg class="pt" width="${w}" height="${Math.round(w * 1.2)}" viewBox="0 0 60 72"><defs><radialGradient id="${gid}" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="${fdk}"/><stop offset="1" stop-color="#03060c"/></radialGradient></defs><rect width="60" height="72" fill="url(#${gid})"/>`;
  for (let i = 0; i < 6; i++) s += `<circle cx="${R(60)}" cy="${R(40)}" r="${R(2) ? 0.4 : 0.7}" fill="#cfe8ff" opacity=".7"/>`;
  s += `<g opacity=".18" stroke="${fc}" fill="none"><circle cx="30" cy="30" r="22"/><path d="M30 6 V54 M6 30 H54 M13 13 L47 47 M47 13 L13 47"/></g>`;
  // Sci-fi archetypes that hide the face
  if (c.role === 'Spy') {
    s += `<path d="M10 72 Q14 54 30 52 Q46 54 50 72Z" fill="#3a4250"/><circle cx="30" cy="32" r="16" fill="#2a2f38" stroke="#7a8492"/><path d="M14 30 H46" stroke="#11151b" stroke-width="2"/><circle cx="30" cy="34" r="5" fill="#200"/><circle cx="30" cy="34" r="3" fill="#ff3040"/><circle cx="31" cy="33" r="1" fill="#fff"/><path d="M22 18 L18 6 M38 18 L44 8" stroke="#7a8492"/><circle cx="18" cy="6" r="1.2" fill="#ff3040"/>`;
    return s + '</svg>';
  }
  if (c.role === 'Assassin') {
    s += `<path d="M2 72 Q6 52 30 50 Q54 52 58 72Z" fill="#4a3a2a" stroke="#000" stroke-opacity=".4"/><path d="M14 56 Q30 50 46 56 L44 62 Q30 57 16 62Z" fill="${metal}"/><path d="M17 40 Q16 16 30 15 Q44 16 43 40 L40 48 H20Z" fill="#6a6f60" stroke="#222"/><path d="M21 28 H39 V32 H32 V44 H28 V32 H21Z" fill="#05070a"/><path d="M43 26 l4 -8" stroke="#888"/><path d="M19 22 Q30 18 41 22" stroke="#a03030" stroke-width="1.5" fill="none"/>`;
    return s + '</svg>';
  }
  if (c.fem && !monk) s += `<path d="M15 ${32 + hy} Q14 ${14 + hy} 30 ${14 + hy} Q46 ${14 + hy} 45 ${32 + hy} L47 ${58} Q30 ${62} 13 ${58}Z" fill="${hair}"/>`;
  // Robes / cloak, armored pauldrons for generals, tall Dune-style collar for nobles
  s += `<path d="M2 72 Q6 ${52 + hy} 30 ${50 + hy} Q54 ${52 + hy} 58 72Z" fill="${monk ? hood : c.role === 'Trader' ? '#8a6a40' : fc}" stroke="#000" stroke-opacity=".4"/>`;
  if (!monk && !c.fem && !c.role && !kid) s += `<path d="M4 66 Q6 ${54 + hy} 18 ${53 + hy} L20 ${60 + hy} Q10 62 4 66Z M56 66 Q54 ${54 + hy} 42 ${53 + hy} L40 ${60 + hy} Q50 62 56 66Z" fill="${metal}" stroke="#111" stroke-width=".6"/><path d="M26 ${60 + hy} h8 v8 h-8z" fill="${fdk}" stroke="${metal}" stroke-width=".6"/>`;
  if (!monk && c.role !== 'Trader') s += `<path d="M20 ${54 + hy} L22 ${44 + hy} L25 ${47 + hy} M40 ${54 + hy} L38 ${44 + hy} L35 ${47 + hy}" stroke="${c.fem ? '#e8e0ff' : '#c9a24a'}" stroke-width="1.6" fill="${fdk}"/>`;
  if (c.role === 'Diplomat') s += `<path d="M14 ${56 + hy} L18 ${40 + hy} L24 ${50 + hy} M46 ${56 + hy} L42 ${40 + hy} L36 ${50 + hy}" stroke="#e8e0ff" stroke-width="1.2" fill="#e8e0ff" fill-opacity=".25"/><circle cx="30" cy="${58 + hy}" r="2" fill="#6fe0ff"/>`;
  s += `<rect x="25" y="${42 + hy}" width="10" height="10" fill="${skin}"/>`;
  const ry = kid ? 12 : teen ? 14 : 15;
  s += `<ellipse cx="30" cy="${32 + hy}" rx="${kid ? 11 : teen ? 11.5 : 12}" ry="${ry}" fill="${skin}"/>`;
  if (elder) s += `<path d="M19 ${38 + hy} Q20 ${47 + hy} 26 ${48 + hy} M41 ${38 + hy} Q40 ${47 + hy} 34 ${48 + hy}" stroke="#000" stroke-opacity=".22" fill="none"/>`; // jowls
  if (!monk) {
    if (style === 0) s += `<path d="M18 ${30 + hy} Q18 ${15 + hy} 30 ${16 + hy} Q42 ${15 + hy} 42 ${30 + hy} Q38 ${21 + hy} 30 ${22 + hy} Q22 ${21 + hy} 18 ${30 + hy}Z" fill="${hair}"/>`;else if (style === 1) s += `<path d="M17 ${33 + hy} Q16 ${14 + hy} 30 ${15 + hy} Q44 ${14 + hy} 43 ${33 + hy} L40 ${24 + hy} Q30 ${19 + hy} 20 ${24 + hy}Z" fill="${hair}"/>`;else if (style === 2 && (c.age < 50 || c.fem || pt.style === 2)) s += `<path d="M19 ${26 + hy} Q22 ${15 + hy} 30 ${16 + hy} Q38 ${15 + hy} 41 ${26 + hy} Q30 ${20 + hy} 19 ${26 + hy}Z" fill="${hair}"/>`;else if (style === 3 || style === 2) s += `<path d="M18 ${33 + hy} Q17 ${24 + hy} 20 ${21 + hy} L21 ${29 + hy}Z M42 ${33 + hy} Q43 ${24 + hy} 40 ${21 + hy} L39 ${29 + hy}Z" fill="${hair}"/><path d="M24 ${20 + hy} Q30 ${17.5 + hy} 36 ${20 + hy}" stroke="#fff" stroke-opacity=".25" fill="none"/>`; // bald crown, grey fringe
  }
  const ey = 31 + hy;
  const spice = c.traits?.includes('Spice Addict');
  const eyeC = spice ? '#1a5cff' : ['#111', '#3a6aa0', '#4a7a3a', '#7a4a1a', '#8a8a9a', '#c03030'][pick('eyes', 6) * (pt.eyes != null ? 1 : 0)];
  s += `<ellipse cx="25" cy="${ey}" rx="1.8" ry="1.2" fill="${eyeC}"/><ellipse cx="35" cy="${ey}" rx="1.8" ry="1.2" fill="${eyeC}"/>`;
  if (c.age > 40) s += `<path d="M24 ${ey - 9} q6 -1.5 12 0" stroke="#000" stroke-opacity="${c.age > 60 ? 0.3 : 0.15}" fill="none"/>`; // brow lines
  if (elder) s += `<path d="M20 ${ey - 1} l-2 -1 M20 ${ey + 1} l-2 1 M40 ${ey - 1} l2 -1 M40 ${ey + 1} l2 1 M24 ${ey - 11} q6 -1.5 12 0" stroke="#000" stroke-opacity=".3" fill="none"/>`; // crow's feet
  if (spice) s += `<ellipse cx="25" cy="${ey}" rx="3" ry="2" fill="#4a90ff" opacity=".35"/><ellipse cx="35" cy="${ey}" rx="3" ry="2" fill="#4a90ff" opacity=".35"/>`;
  s += `<path d="M22 ${ey - 3.5} l5 ${c.violence > 6 ? 1.2 : -0.6} M38 ${ey - 3.5} l-5 ${c.violence > 6 ? 1.2 : -0.6}" stroke="${hair}" stroke-width="1.3"/>`;
  s += `<path d="M30 ${ey + 1} l-1.5 5 h3" stroke="#000" stroke-opacity=".35" fill="none"/>`;
  s += `<path d="M26 ${ey + 9} Q30 ${ey + (c.respect >= 0 ? 11 : 8.5)} 34 ${ey + 9}" stroke="#5a2a20" stroke-width="1.2" fill="none"/>`;
  if (c.age > 50) s += `<path d="M21 ${ey + 3} q2 2 0 4 M39 ${ey + 3} q-2 2 0 4" stroke="#000" stroke-opacity=".3" fill="none"/>`;
  if (c.violence > 7 && !c.fem) s += `<path d="M36 ${ey - 6} l4 10" stroke="#a03030" stroke-width="1.2"/>`;
  if (beard && !monk && beardK === 1) s += `<path d="M18 ${34 + hy} Q19 ${50 + hy} 30 ${(elder ? 54 : 51) + hy} Q41 ${50 + hy} 42 ${34 + hy} Q40 ${44 + hy} 30 ${44 + hy} Q20 ${44 + hy} 18 ${34 + hy}Z" fill="${hair}"/>`;else if (beard && !monk && beardK === 2) s += `<path d="M26 ${ey + 11} Q30 ${ey + 17} 34 ${ey + 11} Q30 ${ey + 13} 26 ${ey + 11}Z M25 ${ey + 7.5} Q30 ${ey + 6} 35 ${ey + 7.5}" fill="${hair}" stroke="${hair}" stroke-width=".8"/>`;
  if (monk) s += `<path d="M14 ${56} Q12 ${12} 30 ${12} Q48 ${12} 46 ${56} L42 ${54} Q43 ${22} 30 ${21} Q17 ${22} 18 ${54}Z" fill="${hood}" stroke="#1a0c06"/><ellipse cx="30" cy="${30}" rx="12" ry="11" fill="#000" opacity="${c.role === 'Master' ? 0.25 : 0.45}"/>${c.role === 'Zithari' || c.role === 'Acolyte' ? `<circle cx="25" cy="31" r="1.3" fill="#ff3030"/><circle cx="35" cy="31" r="1.3" fill="#ff3030"/>` : ''}${c.role === 'Witch' ? `<circle cx="25" cy="31" r="1.2" fill="#d070ff"/><circle cx="35" cy="31" r="1.2" fill="#d070ff"/>` : ''}`;
  // Trader: desert head-wrap and stillsuit face veil
  if (c.role === 'Trader') s += `<path d="M16 ${30 + hy} Q15 ${12 + hy} 30 ${12 + hy} Q45 ${12 + hy} 44 ${30 + hy} L41 ${26 + hy} Q30 ${19 + hy} 19 ${26 + hy}Z" fill="#c8a878" stroke="#6a5030"/><path d="M18 ${36 + hy} Q30 ${33 + hy} 42 ${36 + hy} L40 ${48 + hy} Q30 ${52 + hy} 20 ${48 + hy}Z" fill="#a08058"/><path d="M22 ${40 + hy} H38" stroke="#5a4028" stroke-width=".8"/>`;
  // Witch: black Bene-Gesserit-like veil over the head
  if (c.role === 'Witch') s += `<path d="M13 60 Q11 12 30 11 Q49 12 47 60 L43 58 Q44 20 30 19 Q16 20 17 58Z" fill="#120a18" stroke="#4a2a5a"/><path d="M21 ${16} Q30 12 39 16" stroke="#d070ff" stroke-width="1"/>`;
  // Ruler: angular circlet with a glowing jewel
  if (king) s += `<path d="M17 ${20 + hy} L19 ${11 + hy} L24 ${16 + hy} L30 ${6 + hy} L36 ${16 + hy} L41 ${11 + hy} L43 ${20 + hy} Q30 ${16 + hy} 17 ${20 + hy}Z" fill="${metal === '#c9a24a' ? '#f2c94c' : '#d8dee8'}" stroke="#222" stroke-width=".6"/><path d="M30 ${9 + hy} l2 4 -2 3 -2 -3z" fill="#6fe0ff"/><circle cx="30" cy="${12 + hy}" r="3.5" fill="#6fe0ff" opacity=".25"/>`;else if (c.fem && !monk && !c.role) {
    // Noblewoman's headdress: crested diadem or flowing veil
    if (R(2)) s += `<path d="M18 ${19 + hy} Q30 ${6 + hy} 42 ${19 + hy} Q30 ${13 + hy} 18 ${19 + hy}Z" fill="#e8e0ff" fill-opacity=".85" stroke="${fc}" stroke-width=".6"/><circle cx="30" cy="${12 + hy}" r="1.4" fill="${fc}"/>`;else s += `<path d="M14 ${46 + hy} Q12 ${12 + hy} 30 ${12 + hy} Q48 ${12 + hy} 46 ${46 + hy} L43 ${46 + hy} Q44 ${18 + hy} 30 ${18 + hy} Q16 ${18 + hy} 17 ${46 + hy}Z" fill="${fc}" fill-opacity=".55"/><path d="M21 ${18 + hy} Q30 ${14 + hy} 39 ${18 + hy}" stroke="#e8e0ff" stroke-width="1.4" fill="none"/><circle cx="30" cy="${23 + hy}" r="1" fill="#6fe0ff"/>`;
  } else if (!monk && !c.role && !kid && (pt.eyepiece != null ? pt.eyepiece : R(4) === 0)) s += `<path d="M38 ${ey - 1} h5 v3 h-5z" fill="#6fe0ff" opacity=".8"/>`; // cybernetic eyepiece
  const tr = c.traits || [];
  // Scars, deepening with each grade
  const sc = SCARS.findIndex(t => tr.includes(t));
  if (sc >= 0) s += `<path d="M21 ${ey - 7} l6 13" stroke="#8a2a20" stroke-width="1.3" opacity=".85"/>`;
  if (sc >= 1) s += `<path d="M34 ${ey + 2} q4 2 7 -1 q-1 5 -6 6z" fill="#b0503a" opacity=".7"/>`;
  if (sc >= 2) s += `<path d="M19 ${ey - 2} q4 -1 6 3 M24 ${ey + 5} l10 3 M38 ${ey - 8} l-2 7" stroke="#6a1a14" stroke-width="1.2" fill="none"/>`;
  // Cybernetic arm: chrome forearm and glowing joint at the shoulder
  if (tr.includes('Cybernetic Arm')) s += `<path d="M46 72 L48 60 Q50 56 54 58 L56 72Z" fill="#aab4c0" stroke="#333" stroke-width=".6"/><circle cx="51" cy="60" r="2" fill="#ff8030"/><path d="M48 66 h7 M47.5 69 h8" stroke="#555" stroke-width=".6"/>`;
  // Cyborg: half the face replaced with plating and a red optic
  if (tr.includes('Cyborg')) s += `<path d="M30 ${17 + hy} Q42 ${17 + hy} 42 ${32 + hy} Q42 ${45 + hy} 30 ${47 + hy}Z" fill="#7d8792" stroke="#222" stroke-width=".7"/><path d="M30 ${24 + hy} h9 M30 ${40 + hy} h8 M33 ${44 + hy} v-6" stroke="#444" stroke-width=".7"/><circle cx="35" cy="${ey}" r="2.4" fill="#300"/><circle cx="35" cy="${ey}" r="1.5" fill="#ff2020"/><circle cx="35" cy="${ey}" r="3.5" fill="#ff2020" opacity=".25"/><path d="M42 ${36 + hy} q5 4 3 12" stroke="#333" stroke-width="1.5" fill="none"/>`;
  // Dread: a war mask covers the face (style chosen in the bio — see MASKS)
  if ((dreadful(c) || c.domiri) && !monk) s += (MASKS[c.mask] || MASKS.war).svg(hy, ey, c.respect <= -10 ? '#ff2020' : '#1e2a3a');
  // Starblade: ignited diagonally across the frame, glowing in the colour of its wielder's heart (see BLADE)
  if (c.starblade) {
    const bc = bladeCol(c);
    s += `<g><path d="M48 70 L57 22" stroke="${bc}" stroke-width="7" stroke-linecap="round" opacity=".22"/><path d="M48 70 L57 22" stroke="${bc}" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><path d="M48 70 L57 22" stroke="${bc}" stroke-width="2.2" stroke-linecap="round"/><path d="M48.3 68 L56.7 23" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".9"/><path d="M45 72 L47.6 66.5 L50.4 67 L48 72Z" fill="#c9a24a" stroke="#222" stroke-width=".4"/><path d="M45.5 66 L52.5 67.4" stroke="#888" stroke-width="1.4"/></g>`;
  }
  return s + '</svg>';
}
// Dread masks: retro-medieval war-faces of a far future. e = eye-glow colour.
const MASKS = {
  war: {
    n: 'Black Warhelm',
    svg: (hy, ey, e) => `<path d="M17 ${30 + hy} Q16 ${14 + hy} 30 ${14 + hy} Q44 ${14 + hy} 43 ${30 + hy} L44 ${46 + hy} L36 ${49 + hy} L30 ${45 + hy} L24 ${49 + hy} L16 ${46 + hy}Z" fill="#0b0b0e" stroke="#3a3a44" stroke-width=".8"/><path d="M21 ${ey - 2} L28 ${ey} L28 ${ey + 2} L21 ${ey + 1}Z M39 ${ey - 2} L32 ${ey} L32 ${ey + 2} L39 ${ey + 1}Z" fill="${e}"/><path d="M30 ${ey + 3} L27 ${ey + 11} H33Z" fill="#26262e"/><path d="M26 ${ey + 12} h8 M26.5 ${ey + 14} h7" stroke="#555" stroke-width=".7"/><path d="M30 ${16 + hy} V${ey - 3}" stroke="#2a2a33" stroke-width="1"/>`
  },
  bascinet: {
    n: 'Void Bascinet',
    svg: (hy, ey, e) => `<path d="M16 ${46 + hy} L16 ${26 + hy} Q16 ${10 + hy} 30 ${8 + hy} Q44 ${10 + hy} 44 ${26 + hy} L44 ${46 + hy} Q30 ${52 + hy} 16 ${46 + hy}Z" fill="#5a6270" stroke="#22262e" stroke-width=".8"/><path d="M18 ${ey - 1.5} H42 V${ey + 1.5} H18Z" fill="#050508"/><path d="M19 ${ey - .4} H41" stroke="${e}" stroke-width="1"/><path d="M30 ${9 + hy} V${46 + hy}" stroke="#3a404a" stroke-width="1"/>${[0, 1, 2, 3].map(i => `<circle cx="${24 + i * 4}" cy="${ey + 9}" r=".9" fill="#111"/>`).join('')}`
  },
  hounskull: {
    n: 'Iron Hounskull',
    svg: (hy, ey, e) => `<path d="M16 ${44 + hy} L16 ${26 + hy} Q17 ${12 + hy} 30 ${12 + hy} Q43 ${12 + hy} 44 ${26 + hy} L44 ${44 + hy}Z" fill="#34373e" stroke="#16181c" stroke-width=".8"/><path d="M22 ${ey + 1} L30 ${ey - 2} L38 ${ey + 1} L34 ${ey + 15} L26 ${ey + 15}Z" fill="#4b4f58" stroke="#16181c" stroke-width=".7"/><path d="M21 ${ey - 2} h6 M33 ${ey - 2} h6" stroke="${e}" stroke-width="1.6"/>${[0, 1, 2].map(i => `<path d="M${27 + i * 3} ${ey + 6} v6" stroke="#111" stroke-width=".9"/>`).join('')}`
  },
  plague: {
    n: 'Plague Lord',
    svg: (hy, ey, e) => `<path d="M16 ${40 + hy} Q15 ${14 + hy} 30 ${13 + hy} Q45 ${14 + hy} 44 ${40 + hy}Z" fill="#2b2420" stroke="#120e0c" stroke-width=".8"/><path d="M26 ${ey + 3} Q30 ${ey + 22} 31 ${ey + 26} Q34 ${ey + 16} 34 ${ey + 3}Z" fill="#3b302a" stroke="#120e0c" stroke-width=".7"/><circle cx="24" cy="${ey}" r="3.2" fill="#0c0c0c" stroke="#a08040" stroke-width="1"/><circle cx="36" cy="${ey}" r="3.2" fill="#0c0c0c" stroke="#a08040" stroke-width="1"/><circle cx="24" cy="${ey}" r="1.5" fill="${e}"/><circle cx="36" cy="${ey}" r="1.5" fill="${e}"/>`
  },
  skull: {
    n: 'Crowned Death-Mask',
    svg: (hy, ey, e) => `<path d="M18 ${32 + hy} Q18 ${15 + hy} 30 ${15 + hy} Q42 ${15 + hy} 42 ${32 + hy} L39 ${44 + hy} L21 ${44 + hy}Z" fill="#d8d0bc" stroke="#6a6250" stroke-width=".8"/><circle cx="25" cy="${ey}" r="3" fill="#0a0a0a"/><circle cx="35" cy="${ey}" r="3" fill="#0a0a0a"/><circle cx="25" cy="${ey}" r="1.1" fill="${e}"/><circle cx="35" cy="${ey}" r="1.1" fill="${e}"/><path d="M30 ${ey + 3} l-2 4 h4z" fill="#222"/><path d="M24 ${ey + 10} h12 M26 ${ey + 8} v4 M30 ${ey + 8} v4 M34 ${ey + 8} v4" stroke="#333" stroke-width=".7"/><path d="M18 ${16 + hy} L20 ${8 + hy} L24 ${13 + hy} L30 ${6 + hy} L36 ${13 + hy} L40 ${8 + hy} L42 ${16 + hy}Z" fill="#c9a24a" stroke="#6a5020" stroke-width=".6"/>`
  },
  faceplate: {
    n: 'Riveted Faceplate',
    svg: (hy, ey, e) => `<path d="M18 ${18 + hy} H42 L44 ${30 + hy} L40 ${46 + hy} H20 L16 ${30 + hy}Z" fill="#6b5a48" stroke="#2a2018" stroke-width=".8"/><path d="M20 ${ey - 1} h7 v2 h-7z M33 ${ey - 1} h7 v2 h-7z" fill="${e}"/><path d="M22 ${ey + 8} h16 M22 ${ey + 11} h16 M22 ${ey + 14} h16" stroke="#2a2018" stroke-width="1"/>${[[19, 20], [41, 20], [18, 42], [42, 42], [30, 19]].map(([x, y]) => `<circle cx="${x}" cy="${y + hy}" r=".9" fill="#c0a070"/>`).join('')}`
  },
  veil: {
    n: 'Wraith Veil',
    svg: (hy, ey, e) => `<path d="M10 ${60 + hy} Q12 ${6 + hy} 30 ${4 + hy} Q48 ${6 + hy} 50 ${60 + hy}Z" fill="#08080c" stroke="#1c1c26" stroke-width=".8"/><path d="M19 ${50 + hy} Q18 ${18 + hy} 30 ${16 + hy} Q42 ${18 + hy} 41 ${50 + hy}Z" fill="#000"/><path d="M20 ${18 + hy} L23 ${11 + hy} L26 ${16 + hy} L30 ${9 + hy} L34 ${16 + hy} L37 ${11 + hy} L40 ${18 + hy}" fill="none" stroke="#6a6a78" stroke-width="1.2"/><circle cx="25" cy="${ey}" r="1.6" fill="#7fe0ff"/><circle cx="35" cy="${ey}" r="1.6" fill="#7fe0ff"/><circle cx="25" cy="${ey}" r="3.6" fill="#7fe0ff" opacity=".25"/><circle cx="35" cy="${ey}" r="3.6" fill="#7fe0ff" opacity=".25"/>`
  }
};
const card = (c, tag) => c ? `<div class="pc${c.dead ? ' dead' : ''}" data-c="${c.id}">${portrait(c)}<span>${F[c.f]?.ruler === c ? '👑' : c.wasRuler ? '♔' : ''}${c.name.split(' ')[0]}</span><small>${tag || (c.dead ? '🪦' : c.age)}</small></div>` : '';
const frow = (label, list) => list.filter(Boolean).length ? `<div class="flab">${label}</div><div class="frow">${list.filter(Boolean).map(x => card(x)).join('')}</div>` : '';
const familyTree = c => bloodline(c.f, c);
// One unified Dynasty view: a top-down tree from the eldest known paternal ancestor.
async function bloodline(fid, focus) {
  const f = F[fid];
  if (!f) return;
  let root = focus || f.ruler;
  const seen = new Set();
  // Bastards head their own cut-off line until legitimised; the trueborn tree leaves them out
  while (!bastard(root) && root.father != null && CH[root.father] && !seen.has(root.id)) {
    seen.add(root.id);
    root = CH[root.father];
  }
  const base = bastard(root);
  const tag = c => (c.dead ? '🪦' : c.age) + (CH[c.mentor] ? ' 🎓' : '') + (c.betrothed != null ? ' 💍' : '');
  const box = c => `<div class="pc dy${c === focus ? ' foc' : ''}${c.dead ? ' dead' : ''}" data-c="${c.id}">${portrait(c, 44)}<span>${F[c.f]?.ruler === c ? '👑' : c.wasRuler ? '♔' : ''}${c.name.split(' ')[0]}</span><small>${tag(c)}</small></div>`;
  const node = (c, d) => {
    const sp = CH[c.spouse],
      kids = d < 6 ? (c.kids || []).map(id => CH[id]).filter(k => k && (bastard(c) || !bastard(k))).sort((a, b) => b.age - a.age) : [];
    return `<li><div class="cpl">${box(c)}${sp ? '<span class="link">⚭</span>' + box(sp) : ''}</div>${kids.length ? `<ul>${kids.map(k => node(k, d + 1)).join('')}</ul>` : ''}</li>`;
  };
  const r = await ask(`<h3>🌳 ${base ? `Base-born line of ${root.name.replace(' (bastard)', '')}` : `Dynasty of ${sur(root) || f.name}`}</h3><small>${f.name}${base ? ' · cut off from the ruling line until legitimised' : ''}${celibate(fid) ? ' · a sworn order: no marriages' : ''}</small><div class="tree"><ul>${node(root, 0)}</ul></div><small>👑 ruler · ♔ former ruler · 🎓 mentored · 💍 betrothed · 🪦 deceased · tap a portrait to open them (assign mentors there)</small>`, focus && focus !== f.ruler ? ['Ruling Line', 'Close'] : ['Close']);
  if (r === 'Ruling Line') bloodline(fid);
}
// Unwed officers of the princess's own house (governors, fleet commanders, reserve), least loyal first:
// a royal bride is the surest way to bind a wavering general — and gives his line children.
function ownGrooms(f, p) {
  return Object.values(CH).filter(g => g && g.f === f.id && !g.dead && !g.fem && mayWed(g) && (g.spouse == null || CH[g.spouse]?.dead) && g.betrothed == null && g.age >= 18 && g.age <= 55 && f.ruler !== g && !kin(g, p) && !g.captive && !g.enslaved && g.exiledBy == null && !bastard(g) && (holdsPost(g) || g.gen)).sort((a, b) => (a.loyalty || 0) - (b.loyalty || 0) || (b.skill || 0) - (a.skill || 0));
}
function betrothOwn(p, g) {
  p.betrothed = g.id;
  g.betrothed = p.id;
  gain(g, 'loyalty');
  note(g, `is betrothed to ${p.name} of the royal family; they will wed when she turns 16.`);
}
// Exile: any house may cast out a prisoner, a ward or a base-born child. The exile keeps his name and blood but holds no post;
// other houses may later take him in (liege offers), and a bastard cast out remembers who did it.
function banish(c, by, why) {
  if (!c || c.dead || F[c.f]?.ruler === c) return false;
  const kp = keeperOf(by) || F[by]?.ruler,
    ward = S.wards.includes(c) || c.wardOf != null,
    own = c.f === by;
  if (c.captive) freeCaptive(c, `is cast out into exile by ${F[by]?.name}`);else note(c, `is cast out into exile by ${F[by]?.name}${why ? ' — ' + why : ''}.`);
  S.prisoners = S.prisoners.filter(x => x !== c);
  S.wards = S.wards.filter(x => x !== c);
  delete c.wardOf;
  delete c.wardY;
  delete c.captive;
  setFate(c, 'exile', {
    court: true
  });
  c.exiledBy = by;
  c._why = 'exiled';
  life(c, 'exiled', by, why || '');
  if (own) {
    c.loyalty = 0;
    hate(c, kp, 5, 'cast out of the house');
  } else grudge(c.f, by, ward ? -3 : -1, `the exile of ${c.name}`);
  return true;
}
async function marryPrincess(p, g) {
  const pf = F[p.f];
  wed(p, g);
  if (pf) pf.princesses = pf.princesses.filter(x => x !== p);
  units.filter(u => u.char === p).forEach(removeUnit);
  if (g.f === p.f) {
    gain(g, 'loyalty', 3);
    hist(g, `weds into the royal family (+3 loyalty).`);
    return;
  }
  apoc(-1, 'marriage alliance');
  const s = systems.find(x => x.general === g),
    of = g.f;
  if (s && F[of] && F[of].ruler !== g && Math.random() < 0.4 + (g.loyalty < 6 ? 0.3 : 0)) {
    s.owner = p.f;
    g.f = p.f;
    g.loyalty = 8;
    hist(g, `pledges ${s.name} to ${pf.name} for love of his bride.`);
    if (p.f === P) await notify(`${portrait(g, 70)}${g.name} marries ${p.name} and pledges ${s.name} to you!`);
    checkDead(of);
  } else if (F[of] && !hostile(F[of])) {
    ally(p.f, of, `sealed by the marriage of ${p.name}`);
    if (p.f === P) await notify(`${p.name} weds ${g.name}. ${F[of].name} becomes your ally.`);
  }
}

// ================= Scene =================
const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
$('game-container').appendChild(renderer.domElement);
// Safe graphics: some PC GPUs (integrated Intel/AMD) lose the WebGL context with the detailed planets → black map.
let GFX_SAFE = false;
try {
  localStorage.removeItem('sb_gfxsafe');
} catch (e) {} // the old black-map bug was CSS, not the GPU
function enterSafeGfx(why) {
  if (GFX_SAFE) return;
  GFX_SAFE = true;
  console.warn('Safe graphics on:', why);
  try {
    systems.forEach(s => {
      s._look = null;
    });
    refresh();
  } catch (e) {}
}
// A single loss is usually the browser/iframe reclaiming the GPU (tab hidden, preview reload): just wait for restore.
// Only repeated losses mean an unstable GPU → safe graphics.
let ctxLost = 0;
renderer.domElement.addEventListener('webglcontextlost', e => {
  e.preventDefault();
  if (++ctxLost >= 2) enterSafeGfx('repeated context loss');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
  try {
    systems.forEach(s => {
      s._look = null;
    });
    refresh();
  } catch (e) {}
});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);
scene.add(new THREE.AmbientLight(0xffffff, 0.75));
scene.add(new THREE.HemisphereLight(0x9fc8ff, 0x1a1028, 0.5));
new THREE.TextureLoader().loadAsync('assets/nebula-void.webp').then(t => {
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  scene.background = t;
  scene.backgroundIntensity = 0.3;
}).catch(() => {});
const PRE = ['Kor', 'Vel', 'Ax', 'Zan', 'Mor', 'Tel', 'Ery', 'Qua', 'Dra', 'Sol', 'Neb', 'Ori', 'Cal', 'Hy', 'Lum', 'Py', 'Zen', 'Thar', 'Ix', 'Ul'];
const SUF = ['ion', 'ara', 'us', 'is', 'os', 'eth', 'or', 'ix', ' Prime', 'heim', 'ost', 'dar'];
const sphereGeo = new THREE.SphereGeometry(0.8, 20, 14),
  ringGeo = new THREE.TorusGeometry(1.3, 0.06, 6, 36),
  coneGeo = new THREE.ConeGeometry(0.35, 0.8, 4);
const lineMat = new THREE.LineBasicMaterial({
  color: 0x3aa0ff,
  transparent: true,
  opacity: 0.45
});
const grid = new THREE.PolarGridHelper(55, 16, 10, 96, 0x1a5a9a, 0x0e3358);
grid.position.y = -2;
grid.material.transparent = true;
grid.material.opacity = 0.45;
scene.add(grid);
const sun = new THREE.DirectionalLight(0xbfe0ff, 2);
sun.position.set(30, 40, 10);
scene.add(sun);
function addSystem(cx, cz, spread, owner) {
  let p = spread === 0 ? new THREE.Vector3(cx, 0, cz) : null,
    best = -1; // spread 0 = exact (loading a save)
  for (let t = 0; spread !== 0 && t < 120; t++) {
    const sp = spread + t * 0.25; // widen the search if the area is crowded
    const q = new THREE.Vector3(cx + (Math.random() - 0.5) * sp, (Math.random() - 0.5) * 2, cz + (Math.random() - 0.5) * sp);
    const d = systems.length ? Math.min(...systems.map(o => o.pos.distanceTo(q))) : 99;
    if (d > best) {
      best = d;
      p = q;
    }
    if (d > 4.5) break;
  }
  const mesh = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.35, 0.45),
    roughness: 0.8,
    emissive: 0x0a1a30
  }));
  const lbl = document.createElement('div');
  lbl.className = 'lbl';
  $('labels').appendChild(lbl);
  mesh.position.copy(p);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial());
  ring.rotation.x = Math.PI / 2;
  const marker = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({
    color: 0xffffff
  }));
  marker.position.y = 1.5;
  marker.rotation.x = Math.PI;
  mesh.add(ring, marker);
  mesh.userData.index = systems.length;
  scene.add(mesh);
  const f = F[owner];
  let nm = rnd(PRE) + rnd(SUF);
  for (let t = 0; t < 60 && systems.some(o => o.name === nm); t++) nm = rnd(PRE) + rnd(SUF);
  if (systems.some(o => o.name === nm)) nm += ' ' + ['II', 'III', 'IV', 'V', 'VI'][systems.filter(o => o.name.startsWith(nm)).length % 5];
  const s = {
    lbl,
    i: systems.length,
    name: nm,
    pos: p,
    mesh,
    ring,
    marker,
    owner,
    fleet: ri(0, 2),
    legions: ri(2, 4),
    elite: 0,
    general: null,
    links: [],
    income: ri(50, 110),
    order: 6,
    recent: 0,
    rel: f ? f.rel === 'Mixed' ? rnd(RELS) : f.rel : rnd(RELS),
    b: new Set(),
    ruin: Math.random() < 0.3,
    moved: false,
    built: false,
    ro: {},
    spec: Math.random() < 0.35 ? rnd(PLANET_SPECIALS) : null,
    site: Math.random() < 0.45
  };
  systems.push(s);
  return s;
}
const LINES = [];
function link(a, b) {
  if (a === b || a.links.includes(b)) return;
  a.links.push(b);
  b.links.push(a);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a.pos, b.pos]), lineMat);
  LINES.push({
    a,
    b,
    line
  });
  scene.add(line);
}
// ================= Planet looks: each world type gets its own procedural surface =================
const planetGeo = new THREE.SphereGeometry(0.8, 48, 32);
const atmoGeo = new THREE.SphereGeometry(0.8 * 1.12, 32, 20),
  gasRingGeo = new THREE.RingGeometry(1.1, 1.75, 72),
  shardGeo = new THREE.OctahedronGeometry(0.09);
const stnTorus = new THREE.TorusGeometry(0.26, 0.045, 6, 20),
  stnHub = new THREE.CylinderGeometry(0.07, 0.07, 0.34, 8),
  stnPanel = new THREE.BoxGeometry(0.42, 0.015, 0.14);
const stnMat = new THREE.MeshStandardMaterial({
  color: 0xc8d0dc,
  metalness: 0.7,
  roughness: 0.35,
  emissive: 0x203040
});
const stnPanelMat = new THREE.MeshStandardMaterial({
  color: 0x2a4a8a,
  metalness: 0.4,
  roughness: 0.3,
  emissive: 0x0a1a40
});
function dressPlanet(s) {
  const type = geo(s).type;
  if (s._look === type) return;
  s._look = type;
  const L0 = PLOOK[type] || PLOOK['Garden World'];
  [...s.mesh.children].forEach(ch => {
    if (ch.userData.deco) {
      s.mesh.remove(ch);
      ch.material?.dispose?.();
    }
  }); // shared geometries stay
  let sd = 7;
  for (const ch of s.name) sd = sd * 31 + ch.charCodeAt(0) | 0;
  const {
    map,
    emap
  } = planetTex(type, Math.abs(sd) % 100000);
  s.mesh.material.map?.dispose?.();
  s.mesh.material.emissiveMap?.dispose?.();
  s.mesh.material.dispose?.();
  s.mesh.geometry = planetGeo;
  if (GFX_SAFE) {
    // weak/unstable GPU: plain textured planet, no extra shaders or decorations
    s.mesh.material = new THREE.MeshLambertMaterial({
      map
    });
    emap?.dispose();
    s._glow = false;
    s.mesh.scale.setScalar(L0.sz);
    if (!s.stnMesh) {
      const g = new THREE.Mesh(stnTorus, new THREE.MeshLambertMaterial({
        color: 0xc8d0dc
      }));
      g.visible = false;
      scene.add(g);
      s.stnMesh = g;
    }
    return;
  }
  s.mesh.material = new THREE.MeshStandardMaterial({
    map,
    roughness: L0.bands ? 0.95 : 0.85,
    metalness: 0.02,
    emissive: emap ? 0xffffff : 0x0a1a30,
    emissiveMap: emap,
    emissiveIntensity: emap ? 1.4 : 1
  });
  s._glow = !!emap;
  s.mesh.scale.setScalar(L0.sz);
  s.mesh.rotation.z = (Math.abs(sd) % 40 - 20) * 0.01;
  const atm = new THREE.Mesh(atmoGeo, new THREE.MeshBasicMaterial({
    color: L0.atm,
    transparent: true,
    opacity: L0.bands ? 0.12 : 0.2,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  atm.userData.deco = true;
  s.mesh.add(atm);
  if (L0.rings) {
    const r = new THREE.Mesh(gasRingGeo, new THREE.MeshBasicMaterial({
      color: new THREE.Color(L0.c[2]),
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    }));
    r.rotation.x = -Math.PI / 2 + 0.35;
    r.userData.deco = true;
    s.mesh.add(r);
  }
  if (L0.shards) for (let k = 0; k < 7; k++) {
    const m = new THREE.Mesh(shardGeo, new THREE.MeshStandardMaterial({
      color: 0x9ff8ff,
      emissive: 0x40e0ff,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.1
    }));
    const th = hash3(k, 1, 2, sd) * Math.PI * 2,
      ph = (hash3(k, 3, 4, sd) - 0.5) * 2.4;
    m.position.set(Math.cos(th) * Math.cos(ph), Math.sin(ph), Math.sin(th) * Math.cos(ph)).multiplyScalar(0.8);
    m.lookAt(m.position.clone().multiplyScalar(2));
    m.rotateX(Math.PI / 2);
    m.scale.set(1, 2.6, 1);
    m.userData.deco = true;
    s.mesh.add(m);
  }
  // Orbital station: a ring habitat with solar wings, orbiting the world (shown when it has a station)
  if (!s.stnMesh) {
    const g = new THREE.Group();
    const tor = new THREE.Mesh(stnTorus, stnMat),
      hub = new THREE.Mesh(stnHub, stnMat),
      p1 = new THREE.Mesh(stnPanel, stnPanelMat),
      p2 = new THREE.Mesh(stnPanel, stnPanelMat);
    tor.rotation.x = Math.PI / 2;
    p1.position.x = 0.42;
    p2.position.x = -0.42;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({
      color: 0xff4040
    }));
    beacon.position.y = 0.19;
    g.add(tor, hub, p1, p2, beacon);
    g.visible = false;
    scene.add(g);
    s.stnMesh = g;
  }
}
// Rough per-turn income of a world (for the map bar)
function estInc(s) {
  if (s.owner < 0 || s.siege) return 0;
  let v = s.income * (0.4 + s.order * 0.07) * (s.b.has('Market') ? 1.15 + 0.15 * bLv(s, 'Market') : 1) * (s.plague ? 0.75 : 1) + 60 * bLv(s, 'Mine') + 20 * bLv(s, 'Brothel') + (s.b.has('Space Station') ? 40 : 0);
  try {
    v += resInc(s) + tradeInc(s);
  } catch (e) {}
  return Math.round(v);
}
const popState = s => s.siege ? ['Blockaded', '#ff6060'] : s.plague ? ['Plague', '#a0c060'] : s.order >= 7 ? ['Content', '#6fdc6f'] : s.order >= 4 ? ['Restless', '#f0c040'] : s.order >= 2 ? ['Unrest', '#ff9040'] : ['Rioting', '#ff4040'];
// ================= Fog of war =================
// seen = charted (remembered); visible = live sensor contact (own worlds, own units, and one jump around them).
let VIS = new Set();
function updateFog() {
  if (P < 0) return;
  VIS = new Set();
  const eyes = [...systems.filter(s => s.owner === P), ...units.filter(u => u.owner === P).map(u => u.sys)];
  eyes.forEach(s => {
    VIS.add(s.i);
    s.links.forEach(l => VIS.add(l.i));
  });
  // Allies share sensor data on their own worlds
  systems.forEach(s => {
    if (s.owner >= 0 && s.owner !== P && S.ally.has(key(P, s.owner))) VIS.add(s.i);
  });
  VIS.forEach(i => S.seen.add(i)); // only real sight charts systems
  if (S.god && S.godSee) systems.forEach(s => VIS.add(s.i)); // God Mode: all-seeing (not remembered)
}
const charted = s => S.seen.has(s.i) || !!(S.god && S.godSee);
const inSight = s => VIS.has(s.i);
// Path-finding over charted hyperlanes (Dijkstra, cost = hopCost)
function findPath(from, to) {
  const dist = new Map([[from, 0]]),
    prev = new Map(),
    q = [from];
  while (q.length) {
    q.sort((a, b) => dist.get(a) - dist.get(b));
    const c = q.shift();
    if (c === to) break;
    for (const n of c.links) {
      if (!charted(n)) continue;
      const d = dist.get(c) + hopCost(c, n);
      if (d < (dist.get(n) ?? 1e9)) {
        dist.set(n, d);
        prev.set(n, c);
        q.push(n);
      }
    }
  }
  if (!prev.has(to)) return null;
  const p = [];
  for (let c = to; c !== from; c = prev.get(c)) p.unshift(c);
  return p;
}
// Step a unit along its course as far as its movement allows (M2TW-style multi-turn journeys).
async function travel(u) {
  while (u.path?.length && units.includes(u)) {
    const nx = u.path[0];
    if (u.mp < hopCost(u.sys, nx)) break;
    const before = u.sys;
    await moveUnit(u, nx);
    if (!units.includes(u) || u.sys === before) {
      u.path = [];
      break;
    }
    u.path.shift();
    // Stop when contact is made with hostile forces
    if (units.some(x => x.sys === u.sys && x.owner !== u.owner && x.owner >= 0 && atWar(x.owner, u.owner))) {
      u.path = [];
      break;
    }
  }
}
const pathMat = new THREE.LineDashedMaterial({
  color: 0x88ff88,
  dashSize: 0.6,
  gapSize: 0.4,
  transparent: true,
  opacity: 0.9
});
let pathLine = null;
function drawPath() {
  if (pathLine) {
    scene.remove(pathLine);
    pathLine.geometry.dispose();
    pathLine = null;
  }
  if (!selU || selU.owner !== P || !selU.path?.length) return;
  const pts = [selU.sys.pos, ...selU.path.map(s => s.pos)].map(p => p.clone().setY(p.y + 0.4));
  pathLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), pathMat);
  pathLine.computeLineDistances();
  scene.add(pathLine);
}
// ================= Exploration & discovery =================
// Technology cannot be researched: it is found among the stars.
const TECH_FINDS = {
  'Laser Weapons': 'A shattered Old Empire dreadnought drifts here, its turbolaser coils still warm. Your engineers salvage the firing schematics.',
  'Plasma Weapons': 'In a cratered armory moon, racks of sealed plasma rifles wait beside the bones of their last garrison.',
  'Bodyshields': 'A frozen field hospital holds impact-armor suits, still powered, still keeping their dead wearers intact.',
  'Aether Shield': 'A derelict guild barge carries a working shield generator and a technician\'s journal explaining it.',
  'Cloaking': 'Sensors find nothing — until your crew bumps into a stealth frigate, invisible for a thousand years. Its baffles are copied.',
  'Blockades': 'An ancient interdiction buoy still broadcasts. Decoding it reveals how the Old Empire strangled rebel worlds.',
  'Gravity Nullifier': 'A gravity-well anomaly turns out to be a machine. Its inverse can be built.',
  'Memory Codices': 'A crystal vault sings when your people approach. Within: memory codices, whispering the strategies of dead admirals.'
};
async function arrive(u, s) {
  updateFog();
  if (S.visited.has(s.i)) return;
  S.visited.add(s.i);
  if (!s.site) return;
  s.site = false;
  const who = u.general || u.char;
  const pool = Object.keys(TECH_FINDS).filter(n => !F[P].tech.includes(n));
  const r = Math.random();
  let msg;
  if (r < 0.28 && pool.length) {
    const n = rnd(pool);
    F[P].tech.push(n);
    if (n === 'Memory Codices') systems.filter(x => x.owner === P && x.general).forEach(x => x.general.skill++);
    msg = `${TECH_FINDS[n]}<br><b>Discovered: ${n}</b> — ${GW[n].d}`;
  } else if (r < 0.42) {
    const k = rnd(PLANET_SPECIALS);
    if (u.type === 'fleet') {
      roAdd(u, k, 1);
      msg = `Survivors of a lost colony — ${UNITS[k].n} — swear themselves to ${who?.name || 'your banner'} and join the ${u.type === 'fleet' ? 'fleet' : 'cause'}.`;
    } else {
      F[P].gold += 120;
      msg = 'A hermit trades star charts and 120 credits for passage off-world.';
    }
  } else if (r < 0.55) {
    const near = s.links.flatMap(l => [l, ...l.links]);
    near.forEach(x => S.seen.add(x.i));
    msg = 'An Old Empire navigation beacon still holds its charts. The surrounding hyperlanes are revealed.';
  } else if (r < 0.68) {
    const v = ri(80, 260);
    F[P].gold += v;
    msg = `Salvage crews strip a ghost freighter: ${v} credits.`;
  } else if (r < 0.78 && u.type === 'fleet' && ships(u) > 1) {
    const l = Math.max(1, Math.floor(ships(u) * 0.2));
    if (u.fleet > l) u.fleet -= l;else {
      u.fleet = Math.max(0, u.fleet - 1);
      roScale(u, 'space', 0.8);
    }
    apoc(1, 'old automated defenses');
    msg = `Automated Old Empire minefields wake. ${l} ship(s) are lost before the fleet escapes.`;
  } else {
    const lore = rnd(LORE);
    if (!S.lore.includes(lore)) S.lore.push(lore);
    msg = `<i>${lore}</i>`;
  }
  if (who) {
    hist(who, `explores ${s.name}.`);
    if (Math.random() < 0.25) addAnc(who, rnd(['Astrogation Map', 'Relic of the Old Empire', 'Hyperspace Navigator', 'Scientist']));
  }
  await notify(`<h3>🔭 ${s.name}</h3>${msg}`);
}
function initWorld() {
  FDEF.forEach(([name, color, rel, c, n, mods]) => {
    const f = newFaction(name, color, rel, mods);
    if (!n) {
      f.alive = false;
      f.dormant = true;
      return;
    }
    for (let k = 0; k < n; k++) {
      const s = addSystem(c[0], c[1], 9, f.id);
      if (k === 0) {
        s.b.add('Shipyard').add('Barracks');
        s.general = f.ruler;
        s.fleet = 1;
        s.legions = 5;
        s.stn = 1;
        f.capital = s;
        addUnit({
          type: 'fleet',
          owner: f.id,
          sys: s,
          fleet: mods.fleet || 4,
          legions: 3,
          general: mkChar(f.id, ri(25, 45)),
          mp: 2
        });
      } else if (Math.random() < 0.35) s.general = mkChar(f.id, ri(22, 50));
      // Home climates: the Nightfleet's frozen rim of ice worlds and gas giants; the Spice Syndicate's desert worlds
      if (f.id === 1 && (k === 0 || Math.random() < 0.85)) s.ptype = Math.random() < 0.6 ? 'Ice World' : 'Gas Giant';
      if (mods.spice && (k === 0 || Math.random() < 0.85)) s.ptype = 'Desert World';
    }
  });
  // The Nameless keep the galaxy's great hoard of Starblades: their ruler and every starting commander bears one
  [F[0]?.ruler, ...systems.filter(s => s.owner === 0).map(s => s.general), ...units.filter(u => u.owner === 0).map(u => u.general)].forEach(g => {
    if (g && !g.starblade) {
      g.starblade = true;
      g.skill += 2;
      g.hist.push(`Y${S.year}: bears a Starblade of the Nameless armoury.`);
    }
  });
  for (let k = 0; k < 10; k++) addSystem((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, 1, -1);
  spawnHolyWorlds();
  systems.forEach((s, i) => {
    const near = systems.filter(o => o !== s).sort((a, b) => a.pos.distanceTo(s.pos) - b.pos.distanceTo(s.pos));
    link(s, near[0]);
    link(s, near[1]);
    if (i > 0) link(s, systems.slice(0, i).sort((a, b) => a.pos.distanceTo(s.pos) - b.pos.distanceTo(s.pos))[0]);
  });
}

// ---- One place for character status ----
// setFate(c, 'dead' | 'captive' | 'exile' | 'gone') removes the character from every post: governor seats, fleet
// commands, agent units, officer reserves, courts (heirs/princesses) and councils. Returns true if c was a ruler —
// the caller then runs `await succession(fid, cause)` (async, so it stays with the caller).
function setFate(c, fate = 'dead', opt = {}) {
  if (!c) return false;
  const fid = c.f,
    wasRuler = F[fid]?.ruler === c;
  if (fate === 'dead' && c.domiri && c.undying && !opt.blade) {
    hist(c, 'should have died — but the dark will not release him. Only a Starblade can end a Domiri lord.');
    return false;
  }
  if (fate === 'dead') {
    try {
      wikiFate(c, 'died', opt.by, opt.why);
    } catch (e) {}
    c.dead = true;
  }
  systems.forEach(s => {
    if (s.general === c) s.general = null;
    if (s.staff?.length) s.staff = s.staff.filter(id => id !== c.id);
  });
  units.filter(u => u.general === c || u.char === c).forEach(u => {
    if (u.char === c) removeUnit(u);else u.general = null;
  });
  if (fate !== 'captive' || opt.court) F.forEach(f => {
    if (!f) return;
    f.heirs = (f.heirs || []).filter(h => h !== c);
    f.princesses = (f.princesses || []).filter(h => h !== c);
    if (f.bastards) f.bastards = f.bastards.filter(h => h !== c);
  });
  if (fate === 'dead' || fate === 'gone') {
    S.council = (S.council || []).filter(id => id !== c.id);
    S.nmCouncil = (S.nmCouncil || []).filter(id => id !== c.id);
    S.prisoners = S.prisoners.filter(x => x !== c);
    S.wards = S.wards.filter(x => x !== c);
  }
  return wasRuler;
}
// The dead hold no posts: clear dead governors, fleet generals, courtiers and reserve officers wherever they died
// ---- Emergent powers: every house born mid-game records where it came from, and the galaxy hears of it ----
function originOf(f) {
  const ws = systems.filter(s => s.owner === f.id),
    at = f.capital?.owner === f.id ? f.capital : ws[0] || f.capital || null;
  const r = f.ruler,
    from = f.claimFor ?? f.rebelOf ?? f.secOf ?? (f.nmRebel ? 1 : f.forkOf ?? null);
  const kind = f.claimFor != null || f.rebelOf != null ? 'claim' : f.secOf != null ? 'secession' : f.nmRebel ? 'oathbreak' : f.forkOf != null ? 'fork' : f.feudal ? 'rising' : 'rising';
  const P_ = F[from]?.name || 'its old masters',
    wn = ws.map(s => s.name);
  const why = {
    claim: `${r?.name || 'A pretender'} claims the throne of ${P_} by right of blood`,
    secession: `${r?.name || 'A governor'} seceded from ${P_}, crowning himself over ${at?.name || 'his world'}`,
    oathbreak: `${r?.name || 'A rim commander'} broke the Nightfleet's oath and led his brothers off the Wall`,
    fork: `a war-mind of ${P_} forked from the consensus at ${at?.name || 'its world'}`,
    rising: `${r?.name || 'A local lord'} raised a banner on the independent world ${at?.name || '?'}`
  }[kind];
  return {
    y: f.born?.y ?? S.year,
    kind,
    from,
    at: at?.i ?? null,
    who: r?.id ?? null,
    worlds: wn,
    why
  };
}
const ORIGIN_IC = {
  claim: '⚔',
  secession: '👑',
  oathbreak: '🗡',
  fork: '🤖',
  rising: '⚑'
};
const ORIGIN_T = {
  claim: 'A Pretender Rises',
  secession: 'A Realm Breaks Away',
  oathbreak: 'Oathbreakers Leave the Wall',
  fork: 'A Machine Mind Secedes',
  rising: 'A New Power Rises'
};
function emergentTick() {
  for (const f of F) {
    if (f && !f.born && !f.origin && f.id >= FDEF.length) {
      f.born = {
        y: null
      };
      f.origin = {
        ...originOf(f),
        y: null,
        old: true
      };
      continue;
    } // older saves: recorded quietly
    if (!f?.born || f.origin) continue;
    const o = f.origin = originOf(f);
    if (!f.alive && !o.worlds.length) continue;
    const msg = `${ORIGIN_IC[o.kind]} <b>${f.name}</b> is born: ${o.why}.${o.worlds.length ? ` Worlds: ${o.worlds.join(', ')}.` : ''}`;
    log(msg);
    if (SIM) continue;
    const mine = o.from === P || o.worlds.some(n => systems.find(s => s.name === n)?.links.some(l => l.owner === P));
    const seen = mine || systems.some(s => s.owner === f.id && S.seen?.has?.(s.i));
    if (mine && o.from !== P) notify(`<h3>${ORIGIN_IC[o.kind]} ${ORIGIN_T[o.kind]}</h3>${CH[o.who] ? portrait(CH[o.who], 64) + '<br>' : ''}A new house appears on your borders: <b style="color:#${(f.color >>> 0).toString(16).padStart(6, '0')}">${f.name}</b>.<br>${o.why}.<br>${o.worlds.length ? `<small>Holds: ${o.worlds.join(', ')}</small>` : ''}<br><small>Its full story is in the 📚 Archive.</small>`);else if (seen) toast(`${ORIGIN_IC[o.kind]} <b>${ORIGIN_T[o.kind]}:</b> ${f.name} — ${o.why}.`, true);
  }
}
function buryDead() {
  try {
    emergentTick();
  } catch (e) {
    console.error('emergentTick', e);
  }
  if (systems.some((s, k) => s.i !== k)) systems.sort((a, b) => a.i - b.i); // repair: an old Void Plague event shuffled the world list
  for (const s of systems) if (s.owner === 1) s.wasNM = true; // remembered: the rim the Nightfleet once held
  try {
    if (F[1]?.alive && units.length) nmCouncilFill();
  } catch (e) {
    console.error('nmCouncil', e);
  }
  try {
    wreckSweep();
  } catch (e) {
    console.error('wreckSweep', e);
  }
  voidspawnGone();
  // Domiri lords are bound to the Forgotten Fleet alone: undo any marriage or betrothal from older saves, keep them utterly loyal
  for (const c of Object.values(CH)) if (c && c.domiri && !c.dead) {
    for (const k of ['spouse', 'betrothed']) if (c[k] != null) {
      const o = CH[c[k]];
      if (o) {
        if (o.spouse === c.id) o.spouse = null;
        if (o.betrothed === c.id) delete o.betrothed;
      }
      c[k] = k === 'spouse' ? null : undefined;
    }
    c.loyalty = 10;
    c.discontent = 0;
  }
  // Chronicle dates: birth and death years for the Wiki; Starblades are heirlooms and pass on when their bearer dies
  for (const c of Object.values(CH)) {
    if (!c) continue;
    if (c.dead) {
      if (c.deathY == null) {
        const hs = c.hist || [],
          dh = [...hs].reverse().find(h => /\b(dies|died|slain|executed|killed|perishes|assassinated|burned|falls)\b/.test(h)) || hs[hs.length - 1];
        c.deathY = +(/^Y(\d+)/.exec(dh || '') || [])[1] || S.year;
      }
      c.bornY ??= c.deathY - (c.age || 0);
      if (c.starblade && !c.bladePassed && !c.undying) {
        c.bladePassed = true;
        if (c.deathY >= S.year - 1) passBlade(c);
      } // old saves: long-dead bearers don't suddenly bequeath
    } else c.bornY ??= S.year - (c.age || 0);
  }
  try {
    wikiSync();
    warCatchUp();
  } catch (e) {}
  try {
    lifeSweep();
  } catch (e) {}
  // AI houses hand a blade waiting in a vault to the governor there
  systems.forEach(s => {
    const g = s.general;
    if (s.bladeWait && g && !g.dead && !g.starblade && g.f === s.owner && !isHuman(s.owner)) {
      s.bladeWait = false;
      g.starblade = true;
      g.skill += 2;
      WB(g, 'vault', {
        vault: s
      });
      hist(g, `takes up the Starblade kept in the vault of ${s.name}.`);
    }
  });
  systems.forEach(s => {
    if (s.general?.dead) s.general = null;
    if (s.staff?.length) s.staff = s.staff.filter(id => CH[id] && !CH[id].dead);
  });
  units.forEach(u => {
    if (u.general?.dead) u.general = null;
  });
  // A world that changed hands by any route (capture, revolt, merge) cannot keep the old house's governor:
  // he goes home to his house's reserve, or — if his house is gone — serves the new masters
  systems.forEach(s => {
    const g = s.general;
    if (!g || g.dead || g.captive || s.owner < 0 || g.f === s.owner) return;
    s.general = null;
    const hf = F[g.f];
    if (/Hive-Mind$/.test(g.name)) {
      g.dead = true;
      return;
    } // a Hive-Mind dies with its world
    if (!hf?.alive) {
      // The Forgotten Fleet is one will and takes no converts: the last men of a fallen house flee into the dark instead
      if (F[s.owner]?.mods?.ff) {
        hist(g, `flees ${s.name} as the Forgotten Fleet takes it, a lord of a fallen house.`);
        return;
      }
      g.f = s.owner;
      s.general = g;
      return;
    }
    if (hf.ruler === g) return; // an exiled ruler is reseated at his capital below
    const home = hf.capital?.owner === hf.id ? hf.capital : systems.find(x => x.owner === hf.id);
    if (home) station(home, g);else if (!hf.heirs.includes(g)) hf.heirs.push(g);
  });
  F.forEach(f => {
    if (f?.heirs?.some(h => !h || h.dead)) f.heirs = f.heirs.filter(h => h && !h.dead);
    if (f?.princesses?.some(h => !h || h.dead)) f.princesses = f.princesses.filter(h => h && !h.dead);
    // base-born daughters (old saves) leave the princess list; the dead leave the bastard list
    if (f?.princesses?.some(bastard)) {
      f.bastards = [...(f.bastards || []), ...f.princesses.filter(bastard)];
      f.princesses = f.princesses.filter(h => !bastard(h));
    }
    if (f?.bastards?.some(h => !h || h.dead)) f.bastards = f.bastards.filter(h => h && !h.dead);
  });
  // Old saves: men of the Nightfleet wrongly enrolled in the Forgotten Fleet return to their own banner
  const ffI = F.findIndex(f => f?.mods?.ff);
  if (ffI >= 0) Object.values(CH).forEach(c => {
    if (!c || c.f !== ffI || c.domiri || c.undying || !(c.rim || c.exiledBy != null || c.nmFrom != null || c.oathbroken)) return;
    systems.forEach(s => {
      if (s.general === c) s.general = null;
    });
    units.forEach(u => {
      if (u.general === c) u.general = null;
    });
    c.f = 1;
  });
  // A fallen house cannot keep worlds: a dead pretender's realm returns to the house it claimed, else the worlds go free
  F.forEach(r => {
    if (!r || r.alive || r.mods?.ff || !systems.some(s => s.owner === r.id)) return;
    const pid = r.claimFor ?? r.rebelOf,
      to = pid != null && F[pid]?.alive ? pid : -1;
    systems.forEach(s => {
      if (s.owner !== r.id) return;
      s.owner = to;
      if (s.general && s.general.f !== to) {
        if (to >= 0 && s.general.f === r.id) s.general.f = to;else s.general = null;
      }
    });
    [...units].forEach(u => {
      if (u.owner !== r.id) return;
      if (to >= 0) u.owner = to;else {
        u.general = null;
        try {
          removeUnit(u);
        } catch (e) {}
      }
    });
    Object.values(CH).forEach(c => {
      if (c.f === r.id && !c.dead && to >= 0) c.f = to;
    });
    for (const k of [...S.war]) if (k.split('|').map(Number).includes(r.id)) S.war.delete(k);
    log(`🏳 The last holdings of ${r.name} ${to >= 0 ? `return to ${F[to].name}` : 'fall free'}.`);
  });
  // An idle living ruler takes up an empty capital seat
  F.forEach(f => {
    const r = f?.ruler,
      cap = f?.capital;
    if (f?.alive && r && !r.dead && !r.captive && r.f === f.id && cap && cap.owner === f.id && !cap.general && !systems.some(s => s.general === r) && !units.some(u => u.general === r || u.char === r)) {
      if (typeof unstation === 'function') unstation(r);
      cap.general = r;
    }
  });
}
function refresh() {
  buryDead();
  updateFog();
  const tg = selU && selU.owner === P && selU.mp > 0 ? selU.sys.links.filter(l => hopCost(selU.sys, l) <= selU.mp) : [];
  systems.forEach(s => {
    const known = P < 0 || charted(s),
      live = P < 0 || inSight(s);
    s.mesh.visible = known;
    s.lbl.dataset.fog = known ? '' : '1';
    const c = s.owner < 0 ? 0x555566 : F[s.owner].color;
    s.ring.material.color.setHex(s === selected ? 0xffffff : tg.includes(s) ? 0x88ff88 : c);
    if (known) {
      try {
        dressPlanet(s);
        fixSpec(s);
      } catch (e) {
        console.error(e);
      }
    }
    s.mesh.material.emissive.setHex(s._glow ? live ? 0xffffff : 0x555555 : live ? 0x0a1a30 : 0x000000);
    if (s.stnMesh) {
      s.stnMesh.visible = known && (s.stn || 0) > 0;
      s.stnMesh.scale.setScalar(0.8 + (s.stn || 0) * 0.2);
    }
    const n = s.fleet + s.legions + s.elite;
    const ps = popState(s),
      bar = live && s.owner >= 0 ? `<div class="lbar"><span class="lb-inc">💰${s.siege ? '0' : '+' + estInc(s)}</span><img class="lb-face" title="Population: ${ps[0]} (order ${s.order}/10)" src="assets/face-${s.siege ? 'blockade' : s.order >= 8 ? 'joy' : s.order >= 6 ? 'content' : s.order >= 4 ? 'neutral' : s.order >= 2 ? 'angry' : 'riot'}.webp">${n > 0 ? `<span class="lb-gar">🛡${n}</span>` : ''}</div>` : '';
    s.lbl.innerHTML = `<div class="lname">${s.general && live ? '⚑ ' : ''}${s.name}${live && n > 4 ? ` <span class="lcnt" style="color:#fff">[${n}]</span>` : ''}${!live ? ' <span style="opacity:.6">◌</span>' : ''}${S.visited.has(s.i) || !s.site || !live ? '' : ' <span style="color:#ffd76a">?</span>'}</div>${bar}`;
    s.lbl.style.color = '#' + new THREE.Color(c).getHexString();
    s.lbl.style.opacity = live ? 1 : 0.55;
    s.ring.scale.setScalar(s === selected || tg.includes(s) ? 1.4 : 1);
    s.marker.visible = false; // old garrison cone: replaced by the 🛡 garrison count in the label bar
  });
  LINES.forEach(l => {
    l.line.visible = P < 0 || charted(l.a) && charted(l.b);
  });
  units.forEach(u => {
    u.mesh.visible = P < 0 || u.owner === P || inSight(u.sys);
  });
  drawPath();
}
// Ground troops can only travel aboard ships: each ship carries 2 legions/elites. No fleet = no movement.
const CARRY = 2;
const armySize = s => s.fleet > 0 ? s.fleet + Math.min(Math.max(0, s.legions - 1) + s.elite, s.fleet * CARRY) : 0;

// ================= Camera / input =================
let camAng = 0.6,
  camDist = 70,
  moved = 0,
  pinch0 = 1,
  ang0 = 0;
const camTarget = new THREE.Vector3(),
  camGoal = new THREE.Vector3();
const cv = renderer.domElement,
  ptrs = new Map();
const pd = () => {
  const [a, b] = [...ptrs.values()];
  return [Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), Math.atan2(b.y - a.y, b.x - a.x)];
};
// PC: middle-button drag, or right-drag starting on empty space, rotates the galaxy; left-drag pans.
const hitsSomething = e => {
  ray.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  return ray.intersectObjects([...units.filter(u => u.mesh.visible).map(u => u.mesh), ...systems.filter(s => s.mesh.visible).map(s => s.mesh)], false).length > 0;
};
cv.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse' && e.button === 1) e.preventDefault();
  ptrs.set(e.pointerId, {
    x: e.clientX,
    y: e.clientY,
    rot: e.pointerType === 'mouse' && (e.button === 1 || e.button === 2 && !hitsSomething(e))
  });
  if (ptrs.size === 1) moved = 0;
  if (ptrs.size === 2) [pinch0, ang0] = pd();
});
cv.addEventListener('pointermove', e => {
  const p = ptrs.get(e.pointerId);
  if (!p) return;
  const dx = e.clientX - p.x,
    dy = e.clientY - p.y;
  p.x = e.clientX;
  p.y = e.clientY;
  if (ptrs.size === 1) {
    moved += Math.abs(dx) + Math.abs(dy);
    if (p.rot) {
      camAng += dx * 0.006;
      return;
    }
    const k = camDist * 0.0025,
      sa = Math.sin(camAng),
      ca = Math.cos(camAng);
    camGoal.x = clamp(camGoal.x - sa * dx * k - ca * dy * k, -45, 45);
    camGoal.z = clamp(camGoal.z + ca * dx * k - sa * dy * k, -45, 45);
  } else if (ptrs.size === 2) {
    moved += 99;
    const [d, a] = pd();
    camDist = clamp(camDist * pinch0 / d, 7, 110);
    camAng -= a - ang0;
    pinch0 = d;
    ang0 = a;
  }
});
// PC: left click = select / inspect, right click = order (move, attack, set course). Touch: a tap does both.
cv.addEventListener('pointerup', e => {
  const n = ptrs.size;
  ptrs.delete(e.pointerId);
  if (n === 1 && moved < 10) pick(e, e.pointerType !== 'mouse' ? 'both' : e.button === 2 ? 'order' : 'info');
});
cv.addEventListener('pointercancel', e => ptrs.delete(e.pointerId));
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => {
  camDist = clamp(camDist * (1 + Math.sign(e.deltaY) * Math.min(0.15, Math.abs(e.deltaY) * 0.0015)), 7, 110);
}, {
  passive: true
});
cv.addEventListener('auxclick', e => {
  if (e.button === 1) e.preventDefault();
});
const ray = new THREE.Raycaster();
async function pick(e, mode = 'both') {
  if (busy || P < 0) return;
  ray.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
  const uh = ray.intersectObjects(units.filter(u => u.mesh.visible).map(u => u.mesh), false)[0];
  const sh = ray.intersectObjects(systems.filter(s => s.mesh.visible).map(s => s.mesh), false)[0];
  const onUnit = uh && (!sh || uh.distance < sh.distance + 1.5);
  if (mode === 'order') {
    // Right click: order the selected unit toward the clicked world (or the world under the clicked unit)
    const tgt = onUnit ? uh.object.userData.unit.sys : sh ? systems[sh.object.userData.index] : null;
    if (!tgt) return;
    if (!selU || selU.owner !== P) {
      playSfx('deny');
      return;
    }
    if (tgt === selU.sys) return;
    return orderTo(tgt);
  }
  if (onUnit) {
    selU = uh.object.userData.unit;
    selected = selU.sys;
    $('info').classList.remove('min');
    refresh();
    showInfo();
    if (selU.owner === P) say(selU.general || selU.char, 's');
    return;
  }
  if (!sh) {
    selU = null;
    selected = null;
    refresh();
    showInfo();
    return;
  }
  const t = systems[sh.object.userData.index];
  if (mode === 'info') {
    selU = null;
    selected = t;
    $('info').classList.remove('min');
    refresh();
    showInfo();
    return;
  }
  return orderTo(t);
}
async function orderTo(t) {
  if (selU && selU.owner === P && t !== selU.sys) pushUndo(`move ${selU.general?.name || selU.char?.name || 'fleet'} → ${t.name}`);
  if (selU && selU.owner === P && t !== selU.sys && !selU.sys.links.includes(t)) {
    // Set a multi-turn course to any charted system
    const p = findPath(selU.sys, t);
    if (!p) {
      playSfx('deny');
      notify('No charted route there. Explore or trade star charts to find a way.');
      return;
    }
    selU.path = p;
    say(selU.general || selU.char, 'm');
    busy = true;
    try {
      await travel(selU);
    } catch (err) {
      console.error(err);
    }
    busy = false;
    if (selU && !units.includes(selU)) selU = null;
    selected = selU ? selU.sys : t;
  } else if (selU && selU.owner === P && selU.sys.links.includes(t) && selU.mp < hopCost(selU.sys, t)) {
    // Out of moves: buzz, then just look at the planet instead of erroring
    playSfx('deny');
    selU = null;
    selected = t;
  } else if (selU && selU.owner === P && selU.sys.links.includes(t)) {
    busy = true;
    selU.path = [];
    say(selU.general || selU.char, t.owner !== P && t.owner >= 0 && (atWar(P, t.owner) || units.some(x => x.sys === t && x.owner !== P)) ? 'a' : 'm');
    try {
      await moveUnit(selU, t);
    } catch (err) {
      console.error(err);
    }
    busy = false;
    if (selU && !units.includes(selU)) selU = null;
    selected = selU ? selU.sys : t;
  } else {
    selU = null;
    selected = t;
    $('info').classList.remove('min');
  }
  // Moving a unit keeps the panel collapsed if the player folded it, so the map stays clear.
  refresh();
  showInfo();
}

// ================= Audio =================
// Gapless crossfading jukebox on Web Audio: tracks are decoded once and faded sample-accurately,
// so nothing stalls on loading, loops never gap, and iOS doesn't block the second track.
const TRACKS = {
  peace: ['assets/audio/galaxy-theme.mp3', 'assets/audio/stars-ambient.mp3'],
  war: ['assets/audio/war-theme.mp3', 'assets/audio/galaxy-theme.mp3'],
  tavern: ['assets/audio/bardcore-tavern.mp3'],
  // peace + a world with a Brothel selected
  court: ['assets/audio/bardcore-court.mp3'],
  // sometimes on court / character / faction screens
  idle: ['assets/audio/bardcore-theme.mp3'] // no input for a while
};
// Mood priority: court screen > war > idle > brothel world > peace
const IDLE_MS = 45000;
let courtOn = false,
  courtRolled = false,
  lastInput = performance.now();
function courtMusic() {
  if (courtRolled) return;
  courtRolled = true;
  courtOn = Math.random() < 0.45;
  courtAt = performance.now();
  refreshMood();
}
let courtAt = 0;
function refreshMood() {
  try {
    const war = F.some(o => o.alive && o.id !== P && !hostile(o) && atWar(P, o.id));
    const idle = performance.now() - lastInput > IDLE_MS;
    setMood(courtOn ? 'court' : war ? 'war' : idle ? 'idle' : selected?.b?.has?.('Brothel') ? 'tavern' : 'peace');
  } catch (e) {}
}
['pointerdown', 'keydown', 'wheel'].forEach(ev => addEventListener(ev, () => {
  lastInput = performance.now();
}, {
  passive: true
}));
setInterval(() => {
  // Leaving the popup ends court music and allows a fresh roll next time
  if ((courtOn || courtRolled) && performance.now() - courtAt > 1500 && document.getElementById('modal')?.style.display !== 'flex') {
    courtOn = false;
    courtRolled = false;
  }
  refreshMood();
}, 1000);
const FADE = 3;
let mood = 'peace',
  curSrc = '',
  plays = 0,
  musicVol = 0.4,
  muted = false;
let actx = null,
  master = null,
  cur = null,
  nextTimer = 0,
  trackTok = 0;
const bufs = {};
const loadTrack = src => bufs[src] ??= fetch(src).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => actx.decodeAudioData(b, ok, no))).catch(() => {
  delete bufs[src];
  return null;
});
function ensureCtx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  if (!actx) {
    actx = new AC();
    master = actx.createGain();
    master.connect(actx.destination);
    master.gain.value = muted ? 0 : musicVol;
    [...new Set(Object.values(TRACKS).flat())].forEach(loadTrack); // decode everything up front
  }
  if (actx.state !== 'running') actx.resume().catch(() => {});
  return true;
}
const music = {
  get paused() {
    return !actx || actx.state !== 'running' || !cur;
  },
  play() {
    if (!ensureCtx()) return;
    if (!cur && !trackTok) nextTrack();
  },
  pause() {
    actx?.suspend?.().catch(() => {});
  },
  set volume(v) {
    musicVol = v;
    if (master && !muted) master.gain.value = v;
  },
  get volume() {
    return musicVol;
  }
};
function pickTrack() {
  const list = TRACKS[mood];
  // Short (15s) themes play twice before moving on; the long theme once
  if (curSrc && list.includes(curSrc) && plays < (/galaxy/.test(curSrc) ? 1 : 2)) return curSrc;
  const opts = list.filter(t => t !== curSrc);
  return opts[Math.floor(Math.random() * opts.length)] || list[0];
}
async function nextTrack() {
  if (!actx) return;
  const tok = ++trackTok;
  clearTimeout(nextTimer);
  const src = pickTrack();
  plays = src === curSrc ? plays + 1 : 1;
  curSrc = src;
  const buf = await loadTrack(src);
  if (tok !== trackTok) return; // a newer request took over
  if (!buf) {
    nextTimer = setTimeout(nextTrack, 2000);
    return;
  }
  const t = actx.currentTime,
    g = actx.createGain(),
    n = actx.createBufferSource();
  n.buffer = buf;
  n.connect(g);
  g.connect(master);
  g.gain.setValueAtTime(cur ? 0 : 1, t);
  g.gain.linearRampToValueAtTime(1, t + FADE);
  if (cur) {
    const o = cur;
    o.g.gain.cancelScheduledValues(t);
    o.g.gain.setValueAtTime(o.g.gain.value, t);
    o.g.gain.linearRampToValueAtTime(0, t + FADE);
    try {
      o.n.stop(t + FADE + 0.05);
    } catch (e) {}
  }
  n.start(t);
  cur = {
    n,
    g
  };
  // Start the next crossfade FADE seconds before this one ends (audio-clock based, survives menus)
  const at = Math.max(1, buf.duration - FADE);
  const t0 = actx.currentTime;
  const wait = () => {
    if (tok !== trackTok) return;
    const left = at - (actx.currentTime - t0);
    if (left <= 0.05) nextTrack();else nextTimer = setTimeout(wait, Math.min(left, 1) * 1000);
  };
  nextTimer = setTimeout(wait, 500);
}
// War music while you are fighting; peace otherwise
function setMood(m) {
  if (m === mood || !TRACKS[m]) return;
  mood = m;
  plays = 99;
  if (cur) nextTrack();
}
// Unlock / resume on any user gesture (not just the first) and when returning to the tab
const unlock = () => {
  if (!muted) music.play();
};
['pointerdown', 'touchend', 'keydown'].forEach(ev => addEventListener(ev, unlock, {
  passive: true
}));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && actx && !muted) actx.resume().catch(() => {});
});
// ---- Sound effects ----
const SFX = {
  laser: 'assets/audio/laser-volley.mp3',
  clash: 'assets/audio/battle-clash.mp3',
  death: 'assets/audio/death-bell.mp3',
  wed: 'assets/audio/wedding-bells.mp3',
  birth: 'assets/audio/birth-chime.mp3',
  win: 'assets/audio/victory-fanfare.mp3',
  lose: 'assets/audio/defeat-horn.mp3',
  deny: 'assets/audio/deny.mp3'
};
// Messages that mean "you can't do that" get the deny buzz automatically (notify/log).
const DENY_RE = /not enough|cannot afford|can't afford|can ?not |no moves|no charted route|is full|too few|no suitable|requires|needs? (a|an|at least)|must first/i;
const sfxEl = {},
  sfxLast = {};
let sfxVol = 0.8;
function playSfx(k) {
  if (muted || !SFX[k]) return;
  const now = performance.now();
  if (now - (sfxLast[k] || 0) < (k === 'deny' ? 250 : 1200)) return;
  sfxLast[k] = now;
  const a = sfxEl[k] ??= new Audio(SFX[k]);
  a.volume = Math.max(0, Math.min(1, sfxVol));
  a.currentTime = 0;
  a.play().catch(() => {});
}
const laser = {
  set volume(v) {
    sfxVol = v;
  },
  get volume() {
    return sfxVol;
  }
};
$('mute').onclick = () => {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : musicVol;
  $('mute').textContent = muted ? '🔇' : '🔊';
  if (!muted) music.play();
};
function sfx(k = 'laser') {
  playSfx(k);
}

// ================= Settings (persisted per device) =================
const GQ = {
  Low: {
    pr: 1,
    tr: 20,
    aa: 'off'
  },
  Medium: {
    pr: 1.5,
    tr: 50
  },
  High: {
    pr: 2,
    tr: 80
  }
};
const SET = Object.assign({
  mv: 0.4,
  sv: 0.8,
  gq: matchMedia('(pointer:coarse)').matches ? 'Medium' : 'High',
  ui: 1,
  fleetB: 'Text',
  landB: 'Text'
}, (() => {
  try {
    return JSON.parse(localStorage.getItem('sb_settings')) || {};
  } catch (e) {
    return {};
  }
})());
if (!SET.txtDef) {
  SET.fleetB = 'Text';
  SET.landB = 'Text';
  SET.txtDef = 1;
} // one-time switch to text battles as the default
function applySettings() {
  const v = x => Math.max(0, Math.min(1, +x || 0));
  music.volume = v(SET.mv);
  laser.volume = v(SET.sv);
  if (!GQ[SET.gq]) SET.gq = 'High';
  // Only reallocate the canvas when the resolution actually changes (volume/UI clicks stay cheap)
  const pr = Math.min(devicePixelRatio, GQ[SET.gq].pr);
  if (renderer.getPixelRatio() !== pr) {
    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight);
  }
  document.documentElement.style.setProperty('--uis', String(SET.ui));
  try {
    localStorage.setItem('sb_settings', JSON.stringify(SET));
  } catch (e) {}
}
applySettings();
// Keep the ⚜ / 📖 bottom rails above the info panel so they never cover its buttons or cycler.
function placeBrails() {
  const i = $('info'),
    rails = document.querySelectorAll('.rail.brail');
  const uis = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uis')) || 1;
  const r = i && getComputedStyle(i).display !== 'none' ? i.getBoundingClientRect() : null;
  rails.forEach(el => {
    el.style.bottom = '';
    if (!r || !r.height) return;
    const er = el.getBoundingClientRect();
    if (er.bottom > r.top && er.top < r.bottom) el.style.bottom = (innerHeight - r.top + 6) / uis + 'px';
  });
}
new MutationObserver(() => document.body.classList.toggle('info-min', $('info').classList.contains('min'))).observe($('info'), {
  attributes: true,
  attributeFilter: ['class']
});
{
  const ro = new ResizeObserver(placeBrails);
  ro.observe($('info'));
  new MutationObserver(placeBrails).observe($('info'), {
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  new MutationObserver(placeBrails).observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });
  addEventListener('resize', placeBrails);
}
// Settings edit in place: rows update live without closing/reopening the popup (no flicker, no scroll jump)
async function settingsMenu() {
  const pct = x => Math.round(x * 100) + '%';
  const bt = v => v === 'Text' ? 'Text-based' : 'Tactical';
  const st = (k, d, lo, hi) => {
    SET[k] = Math.round(Math.max(lo, Math.min(hi, SET[k] + d)) * 100) / 100;
  };
  const ROWS = [['mv', '🎵 Music', () => pct(SET.mv), d => st('mv', d * 0.1, 0, 1)], ['sv', '💥 Effects', () => pct(SET.sv), d => {
    st('sv', d * 0.1, 0, 1);
    setTimeout(sfx, 0);
  }], ['gq', '🖥 Graphics', () => SET.gq, d => {
    const ks = Object.keys(GQ);
    SET.gq = ks[(ks.indexOf(SET.gq) + d + ks.length) % ks.length];
  }], ['ui', '🔠 Interface', () => pct(SET.ui), d => st('ui', d * 0.1, 0.7, 1.5)], ['fleetB', '🚀 Fleet battles', () => bt(SET.fleetB), () => {
    SET.fleetB = SET.fleetB === 'Text' ? 'Tactical' : 'Text';
  }], ['landB', '🪖 Land battles', () => bt(SET.landB), () => {
    SET.landB = SET.landB === 'Text' ? 'Tactical' : 'Text';
  }], ['fs', '🖥 Display', () => isFs() ? 'Fullscreen' : 'Windowed', () => {
    toggleFs();
  }]];
  const html = `<h3>⚙ Settings</h3><div class="setg">${ROWS.map(([k, l, v]) => `<span>${l}</span><button data-sk="${k}" data-d="-1">−</button><b id="sv_${k}">${v()}</b><button data-sk="${k}" data-d="1">+</button>`).join('')}</div>
    <button class="setDef" data-def="1">↺ Defaults</button>
    <small>Low graphics reduces resolution and ambient traffic — best for older phones.<br>Tactical: turn-based battlefield with squads. Text-based: command each round with orders and stratagems. Auto-resolve is always offered.</small>`;
  const p = ask(html, ['Done']);
  const body = $('modalBody');
  const paint = () => ROWS.forEach(([k,, v]) => {
    const el = body.querySelector('#sv_' + k);
    if (el) el.textContent = v();
  });
  document.addEventListener('fullscreenchange', paint);
  p.then(() => document.removeEventListener('fullscreenchange', paint));
  body.querySelectorAll('[data-sk]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    ROWS.find(r => r[0] === b.dataset.sk)[3](+b.dataset.d);
    applySettings();
    paint();
  });
  const def = body.querySelector('[data-def]');
  if (def) def.onclick = e => {
    e.stopPropagation();
    Object.assign(SET, {
      mv: 0.4,
      sv: 0.8,
      gq: matchMedia('(pointer:coarse)').matches ? 'Medium' : 'High',
      ui: 1,
      fleetB: 'Text',
      landB: 'Text'
    });
    applySettings();
    paint();
  };
  await p;
}
// ---- Borderless fullscreen (PC): Settings → Display, F11-style Alt+Enter, remembered between sessions ----
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function toggleFs(on = !isFs()) {
  const el = document.documentElement;
  try {
    const pr = on ? el.requestFullscreen?.({
      navigationUI: 'hide'
    }) ?? el.webkitRequestFullscreen?.() : document.exitFullscreen?.() ?? document.webkitExitFullscreen?.();
    pr?.then?.(() => {
      if (on) try {
        navigator.keyboard?.lock?.(['Escape']);
      } catch (e) {}
    }); // Esc closes popups instead of leaving fullscreen
    pr?.catch?.(() => {
      if (on) notify('Fullscreen is blocked here. Open the game in its own tab or window, or use your browser\'s F11.');
    });
    if (!on) try {
      navigator.keyboard?.unlock?.();
    } catch (e) {}
  } catch (e) {}
  fsUser = Date.now();
  SET.fs = on;
  try {
    localStorage.setItem('sb_settings', JSON.stringify(SET));
  } catch (e) {}
}
addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.altKey) {
    e.preventDefault();
    e.stopPropagation();
    toggleFs();
  }
}, true);
// Browsers only allow fullscreen after a user gesture: restore the saved choice on the first click/key.
{
  const restore = () => {
    if (SET.fs && !isFs()) toggleFs(true);
  };
  addEventListener('pointerdown', restore, {
    once: true
  });
  addEventListener('keydown', e => {
    if (!(e.key === 'Enter' && e.altKey)) restore();
  }, {
    once: true
  });
}
// Unexpected exits (Esc, focus loss, dialogs) keep the saved choice and re-enter fullscreen on the next click
var fsUser = 0;
addEventListener('pointerdown', () => {
  if (SET.fs && !isFs() && Date.now() - fsUser > 400) toggleFs(true);
});
document.addEventListener('fullscreenchange', () => {
  try {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  } catch (e) {}
});
// ================= First-time tutorial =================
async function tutorial(force) {
  if (!force && localStorage.getItem('sb_tut')) return;
  const steps = [`<h3>👑 Welcome, Commander</h3>You rule <b>${F[P]?.name || 'a house'}</b> in a galaxy fallen into a dark age. Conquer worlds, raise heirs, and keep the ☢ Apocalypse Counter from reaching 100.`, '<h3>🪐 Your Worlds</h3>Tap a star system to select it. The panel at the bottom shows its people, order and income, and lets you <b>build</b>, <b>recruit</b> and set <b>edicts</b> for its governor.', '<h3>🚀 Fleets & Moving</h3>Tap one of your fleets, then tap a <b>green-ringed</b> neighbouring system to move there — or to attack it. Battles can be fought tactically or auto-resolved.', '<h3>⚜ Court & Faction</h3>⚜ on the left opens your court: heirs, marriages, prisoners and the great orders. ✉ above it holds each turn’s news.', '<h3>⏳ Ending the Turn</h3>⏳ on the right ends your turn; its badge counts things you haven’t looked at yet. Two turns make a year — characters age, and rulers die.', '<h3>📖 Your Story</h3>📖 opens the ledger and wiki: every battle, betrayal and birth is recorded. ☰ at the top has saving, settings and How to Play. Good luck.'];
  for (let i = 0; i < steps.length; i++) {
    const r = await ask(`${steps[i]}<br><small style="opacity:.6">${i + 1} / ${steps.length}</small>`, i < steps.length - 1 ? ['Next ▶', 'Skip tutorial'] : ['Begin ⚔']);
    if (r === 'Skip tutorial') break;
  }
  try {
    localStorage.setItem('sb_tut', '1');
  } catch (e) {}
}

// ================= Modal =================
// Stacked dialogs (ask/notify), ✕ close-all and toasts live in /ui.js
initUI({
  playSfx,
  DENY_RE
});

// ================= Battles =================
// Command drives battle power; a feared general also breaks enemy morale.
// Respect lifts his own troops' morale; Fear shakes the enemy's — either way up to +10%
const gb = g => g ? (1 + g.skill * 0.08 + Math.min(10, Math.abs(g.respect || 0)) * 0.01) * (g.traits?.includes('Reckless') ? 1.1 : g.traits?.includes('Cautious') ? 0.95 : 1) : 1;
const stnPow = s => (s.stn || 0) * 35 * (s.b?.has('Space Station') ? 1.4 : 1) * (F[s.owner]?.tech?.includes('Laser Weapons') ? 1.15 : 1);
const T = (o, t) => !!F[o.owner]?.tech?.includes(t);
// Rosters: o.ro = { unitKey: count } for special / mercenary / faction units (on fleets and systems).
const roPow = (o, k) => Object.entries(o.ro || {}).reduce((t, [u, n]) => t + (UNITS[u]?.k === k ? UNITS[u].pow * n : 0), 0);
const roCount = (o, k) => Object.entries(o.ro || {}).reduce((t, [u, n]) => t + (UNITS[u]?.k === k ? n : 0), 0);
const ships = u => (u.fleet || 0) + roCount(u, 'space');
function roAdd(o, key, n) {
  o.ro ??= {};
  o.ro[key] = (o.ro[key] || 0) + n;
  if (o.ro[key] <= 0) delete o.ro[key];
}
function roScale(o, k, f) {
  for (const u of Object.keys(o.ro || {})) if (UNITS[u]?.k === k) {
    o.ro[u] = Math.floor(o.ro[u] * f);
    if (o.ro[u] <= 0) delete o.ro[u];
  }
}
function roMove(from, to, k, room = 1e9) {
  for (const u of Object.keys(from.ro || {})) {
    if (UNITS[u]?.k !== k || room <= 0) continue;
    const n = Math.min(from.ro[u], room);
    roAdd(to, u, n);
    roAdd(from, u, -n);
    room -= n;
  }
}
const roStr = o => Object.entries(o.ro || {}).map(([u, n]) => `${UNITS[u]?.ic || ''} ${UNITS[u]?.n || u} ×${n}`).join(' · ');
const spaceMult = o => (F[o.owner]?.bloodEmpire ? 1.2 : 1) * gb(o.general) * (T(o, 'Laser Weapons') ? 1.15 : 1) * (T(o, 'Cloaking') ? 1.1 : 1) * (T(o, 'Necronomicon') ? 1.5 : 1) * (o.b?.has('Space Station') ? 1.4 : 1);
const landMult = o => gb(o.general) * (F[o.owner]?.mods?.warrior ? 1.25 : F[o.owner]?.mods?.might ? 1.15 : 1) * (F[o.owner]?.mods?.sith ? 1.1 : 1) * (T(o, 'Plasma Weapons') ? 1.2 : 1) * (T(o, 'Bodyshields') ? 1.15 : 1) * (T(o, 'Aether Shield') ? 1.25 : 1) * (T(o, 'Necronomicon') ? 1.5 : 1) * (o.b?.has('Shield World') ? 2 : 1) * (o.general?.starblade ? 1.25 : 1);
// Build tactical squads from a fleet/system.
function spaceSquads(o, side, withStation) {
  const m = spaceMult(o),
    out = [];
  if (withStation && o.stn) out.push(mkSquad('station', o.stn, side, m * (0.7 + o.stn * 0.3)));
  let n = o.fleet || 0;
  if (o.general && n >= 3) {
    out.push(mkSquad('cruiser', 1, side, m, {
      flag: true,
      name: `Flagship (${o.general.name.split(' ')[0]})`
    }));
    n -= 3;
  }
  const fr = Math.floor(n * 0.4);
  n -= fr;
  const grp = (key, c) => {
    const parts = Math.min(3, Math.ceil(c / 4));
    for (let i = 0; i < parts; i++) {
      const k = Math.round(c / parts);
      if (k > 0) out.push(mkSquad(key, k, side, m));
    }
  };
  if (fr) grp('frigate', fr);
  if (n) grp('corvette', n);
  Object.entries(o.ro || {}).forEach(([u, c]) => {
    if (UNITS[u]?.k === 'space' && c > 0) out.push(mkSquad(u, c, side, m));
  });
  return out;
}
function landSquads(o, side, defending) {
  const m = landMult(o),
    out = [];
  if (o.general) out.push(mkSquad('hero', 1, side, m * (o.general.starblade ? 1.4 : 1), {
    name: `General ${o.general.name.split(' ')[0]}`,
    tags: o.general.starblade ? ['hero', 'melee'] : ['melee']
  }));
  if (defending && (o.b?.has('Barracks') || o.b?.has('Shield World'))) out.push(mkSquad('bunker', 1, side, m));
  const grp = (key, c, per) => {
    const parts = Math.min(4, Math.ceil(c / per));
    for (let i = 0; i < parts; i++) {
      const k = Math.round(c / parts);
      if (k > 0) out.push(mkSquad(key, k, side, m));
    }
  };
  if (o.legions) grp('legion', o.legions, 3);
  if (o.elite) grp('elite', o.elite, 2);
  Object.entries(o.ro || {}).forEach(([u, c]) => {
    if (UNITS[u]?.k === 'land' && c > 0) out.push(mkSquad(u, c, side, m));
  });
  return out;
}
const hexCol = c => '#' + new THREE.Color(c ?? 0x888888).getHexString();
const spacePow = o => (o.fleet * 10 + roPow(o, 'space')) * (F[o.owner]?.bloodEmpire ? 1.2 : 1) * gb(o.general || o.captain) * (T(o, 'Laser Weapons') ? 1.15 : 1) * (T(o, 'Cloaking') ? 1.1 : 1) * (T(o, 'Necronomicon') ? 1.5 : 1) * (o.b?.has('Space Station') ? 1.4 : 1);
const landPow = o => (o.legions * 8 + o.elite * 25 + roPow(o, 'land')) * gb(o.general || o.captain) * (T(o, 'Plasma Weapons') ? 1.2 : 1) * (T(o, 'Bodyshields') ? 1.15 : 1) * (T(o, 'Aether Shield') ? 1.25 : 1) * (T(o, 'Necronomicon') ? 1.5 : 1) * (o.b?.has('Shield World') ? 2 : 1) * (o.general?.starblade ? 1.25 : 1);

// ctx (optional): { kind: 'space'|'land', A: attacker object, D: defender object, station: bool }
// ---- Reinforcements: your other fleets in the same orbit join in; fleets one jump away join if a general leads them ----
const landCount = x => (x.legions || 0) + (x.elite || 0) + roCount(x, 'land');
function reinforcers(o, t, kind) {
  if (!o || !t || o.owner == null || o.owner < 0) return [];
  return units.filter(x => x.type === 'fleet' && x !== o && x.owner === o.owner && !x.path?.length && (x.sys === t || t.links.includes(x.sys) && x.general) && (kind === 'space' ? ships(x) > 0 : landCount(x) > 0));
}
const rPow = (list, t, kind) => list.reduce((s, x) => s + (kind === 'space' ? spacePow(x) : landPow(x)) * (x.sys === t ? 1 : 0.75), 0);
const rName = x => x.general ? x.general.name : x.captain ? x.captain.name : 'a fleet';
// fight / fightCore / battleReport / textBattle live in /battles.js (hooks wired via initBattles below)
// Remove ship ranks ("Line Captain", "Captain", "Commander"…) from a promoted captain's name
const stripRank = n => {
  let s = String(n || '');
  for (let i = 0; i < 3; i++) s = s.replace(/^(Line Captain|Captain|Commander|Shipmaster|General)\s+/i, '');
  return s.trim() || n;
};
function mkCapt(owner) {
  const k = cultureOf(owner);
  return {
    name: `${Math.random() < 0.75 ? 'Captain' : rnd(CAPT_RANK)} ${firstName(k, false)} ${surname(k)}`,
    skill: ri(1, 3),
    respect: 0,
    cult: k
  };
}
// ---- After-action report: outcome, losses, and the fate of the enemy commander ----
// A fallen or captured wielder's Starblade goes to the victor (or the victor's vault if he already bears one).
// A dead bearer's Starblade goes to his eldest living son, else the ruler or eldest heir of his house, else the house vault
function passBlade(c) {
  const f = F[c.f];
  if (!f?.alive) return;
  const ok = x => x && !x.dead && !x.starblade && !x.captive && x.f === c.f && x.age >= 16 && !x.fem;
  const sons = (c.kids || []).map(id => CH[id]).filter(k => ok(k) && !bastard(k)).sort((a, b) => b.age - a.age);
  const to = sons[0] || (ok(f.ruler) ? f.ruler : null) || heirOrder(f).find(ok);
  if (to) {
    to.starblade = true;
    to.skill += 2;
    WB(to, 'inherited', {
      from: c
    });
    hist(to, `inherits the Starblade of ${c.name}${CH[to.father] === c ? ', his father' : ''}.`);
    return;
  }
  const v = f.capital?.owner === f.id ? f.capital : systems.find(s => s.owner === f.id);
  if (v) {
    v.bladeWait = true;
    WB(null, 'vault', {
      from: c,
      vault: v
    });
    if (isHuman(f.id)) log(`⚔ The Starblade of ${cl(c)} is laid in the vault of ${v.name}, awaiting a worthy bearer.`);
  }
}
function seizeBlade(from, to) {
  if (!from?.starblade) return '';
  delete from.starblade;
  from.skill = Math.max(0, from.skill - 2);
  if (to && !to.dead && !to.starblade) {
    to.starblade = true;
    to.skill += 2;
    WB(to, 'claimed', {
      from
    });
    hist(to, `claims the Starblade of ${cl(from)}.`);
    return `<div class="br-fate">⚔ <b>${to.name}</b> claims ${from.name}'s Starblade.</div>`;
  }
  const v = F[P]?.capital;
  if (v && v.owner === P) {
    v.bladeWait = true;
    WB(null, 'vault', {
      from,
      vault: v
    });
  } else WB(null, 'lost in battle', {
    from
  });
  return `<div class="br-fate">⚔ ${from.name}'s Starblade is taken${v ? ` to the vault of ${v.name}` : ''}.</div>`;
}
function detachGen(g) {
  systems.forEach(s => {
    if (s.general === g) s.general = null;
  });
  units.forEach(u => {
    if (u.general === g) u.general = null;
  });
}
initBattles({
  setCurBattle: v => {
    curBattle = v;
  },
  battleName,
  reinforcers,
  rPow,
  rName,
  hist,
  clamp,
  battleXP,
  ships,
  landCount,
  roScale,
  removeUnit,
  playSfx,
  sfx,
  portrait,
  detachGen,
  atBattle,
  seizeBlade,
  succession,
  nmFriend,
  nmJustice,
  fealtyOdds,
  acceptFealty,
  exileToNM,
  pct,
  ask,
  notify,
  hexCol,
  grudge,
  apoc,
  cl,
  st,
  maybe,
  note,
  SET,
  spaceSquads,
  landSquads,
  loseGen,
  persona,
  has,
  rnd,
  gain,
  wound,
  enslave,
  enslaveOk: fid => enslaveOk(fid),
  banish,
  geo: s => geo(s)
});
function retreat(from, A) {
  from.fleet += A.fleet;
  from.legions += A.legions;
  from.elite += A.elite;
  if (!from.general) from.general = A.general;
}
// Ends a captivity and writes how long it lasted into the character's history and the ledger.
function freeCaptive(g, how) {
  const c = g.captive;
  const yrs = c ? S.year - c.y : 0,
    by = c ? F[c.by]?.name : null;
  delete g.captive;
  g.captivity = (g.captivity || 0) + yrs;
  hist(g, `${how}${by ? ` after ${yrs < 1 ? 'less than a year' : yrs + ' year' + (yrs > 1 ? 's' : '')} as a captive of ${by}` : ''}.`);
}
// ---- Fealty: a captured general (or a ward come of age) may swear himself to you and serve as your general ----
function fealtyOdds(g, to) {
  if (ffLord(g)) return {
    p: 0,
    why: ['A Domiri lord kneels to no one']
  };
  const hf = F[g.f],
    why = [];
  let p = 0.3;
  why.push('30% base');
  const add = (n, t) => {
    p += n;
    why.push(`${n > 0 ? '+' : ''}${Math.round(n * 100)}% ${t}`);
  };
  if (g.loyalty !== 6) add((6 - g.loyalty) * 0.07, `loyalty ${g.loyalty} to his house`);
  if (S.wards.includes(g) || g.wardOf != null && g.wardOf === to) add(0.15 + Math.min(0.3, (g.wardY != null ? S.year - g.wardY : 0) * 0.05), 'raised at your court');
  if (hf?.heirs?.includes(g)) add(-0.25, `of the royal blood of ${hf.name}`);
  if (g.vendetta === to) add(-0.5, 'sworn vendetta against you');
  if (hostile(hf)) add(0.1, 'a raider with nothing to lose');
  if (has(g, 'Loyal')) add(-0.2, 'Loyal');
  if (has(g, 'Ambitious')) add(0.1, 'Ambitious');
  if ((F[to]?.ruler?.respect || 0) >= 3) add(0.1, `your ruler is respected`);
  if (opinion(g.f, to) <= -10) add(-0.15, 'his house hates yours');
  return {
    p: clamp(p, 0.05, 0.92),
    why
  };
}
function acceptFealty(g, to) {
  const from = g.f,
    hf = F[from];
  g._why = 'swore fealty to ' + (F[to]?.name || 'his captor');
  life(g, 'fealty', to);
  detachGen(g);
  if (hf) {
    hf.heirs = (hf.heirs || []).filter(h => h !== g);
    hf.princesses = (hf.princesses || []).filter(h => h !== g);
  }
  S.prisoners = S.prisoners.filter(x => x !== g);
  S.wards = S.wards.filter(x => x !== g);
  delete g.captive;
  delete g.exiledBy;
  delete g.wardOf;
  if (from === 1) g.oathbroken = true;
  g.f = to;
  g.loyalty = clamp(ri(3, 6) + (g.wardY != null ? 2 : 0), 0, 10);
  delete g.wardY;
  const cap = F[to]?.capital?.owner === to ? F[to].capital : systems.find(s => s.owner === to);
  if (cap) station(cap, g);
  grudge(from, to, -2, `taking ${g.name} into their service`);
  hist(g, `swears fealty to ${F[to]?.name} and takes up a command${cap ? ` (in reserve at ${cap.name})` : ''}.`);
}
function exileToNM(g, by) {
  const nm = F[1];
  // The Watch takes no man twice: an oathbreaker sent east is put to death
  if (g.oathbroken) {
    detachGen(g);
    delete g.captive;
    g.dead = true;
    hist(g, `is handed to the Nightfleet and put to death as an oathbreaker.`);
    return;
  }
  if (!nm.alive) {
    g.dead = true;
    hist(g, 'is executed — there are no Nightfleet left to take him.');
    return;
  }
  // A sworn brother captured in battle is simply sent back to the rim — he cannot be "exiled" to his own order
  if (g.f === 1) {
    delete g.captive;
    const s0 = systems.find(x => x.owner === 1 && !x.general);
    if (s0) s0.general = g;else nm.heirs.push(g);
    hist(g, 'is released and returns to the rim.');
    return;
  }
  const fromF = F[g.f];
  if (g.f !== 1) g.nmFrom = g.f;
  delete g.captive; // a sent prisoner is no longer anyone's captive
  g.f = 1;
  g.exiledBy = by;
  g.loyalty = ri(2, 7);
  const s = systems.find(x => x.owner === 1 && !x.general);
  if (s) s.general = g;else nm.heirs.push(g);
  const origin = fromF ? ` — once of ${fromF.name}${fromF.alive ? '' : ', a fallen house'}` : '';
  hist(g, `is exiled to the Nightfleet${F[by] ? ' by ' + F[by].name : ''}${origin}. He takes the oath and now serves the rim as a sworn brother.`);
}
async function loseGen(o, winner) {
  const g = o.general;
  if (!g) return;
  o.general = null;
  const isRuler = F[g.f]?.ruler === g,
    homeF = g.f; // remember his house: exile changes g.f to the Nightfleet
  if (g._handled === S.turn) {
    delete g._handled;
    return;
  } // fate already decided in the after-action report
  // The Seven Domiri lords can only be unmade by a Starblade: without one on the field they melt into shadow and reform
  if (g.domiri && g.undying) {
    const at = o.sys || o,
      blade = winner >= 0 && [...systems.filter(s => s === at && s.owner === winner).map(s => s.general), ...units.filter(u => u.owner === winner && (u.sys === at || at.links?.includes(u.sys))).map(u => u.general)].find(x => x && !x.dead && x.starblade);
    if (blade) {
      try {
        wikiFate(g, 'died', winner, `unmade by the Starblade of ${blade.name}`);
      } catch (e) {}
      g.dead = true;
      hist(g, `is unmade by the Starblade of ${cl(blade)}${atBattle() || ''}.`);
      hist(blade, `destroys ${g.name}, a Domiri lord of the Forgotten Fleet, with his Starblade.`);
      try {
        if (!blade.bladeId) wikiBlade(blade, 'armed');
        wikiBladeDeed(blade, `unmade ${g.name}, a Domiri lord of the Forgotten Fleet${o.sys || o ? ` at ${(o.sys || o).name}` : ''}`);
      } catch (e) {}
      addTrait(blade, 'Hero', true);
      blade.respect = (blade.respect || 0) + 3;
      log(`⚔ ${cl(blade)} of ${F[winner].name} unmakes ${g.name} with a Starblade!`);
      if (isRuler) F[homeF].ruler = F[homeF].heirs.find(h => !h.dead) || systems.find(s => s.owner === homeF && s.general && !s.general.dead)?.general || g;
      if (F[homeF].ruler === g) F[homeF].ruler = null;
      F[homeF].heirs = F[homeF].heirs.filter(h => h !== g);
    } else {
      hist(g, `is struck down${atBattle() || ''} — but his black armour stands up again in the dark. Only a Starblade can end him.`);
      const home = systems.find(s => s.owner === homeF && !s.general);
      if (home) home.general = g;else {
        const any = systems.find(s => s.owner === homeF);
        if (any) addUnit({
          type: 'fleet',
          owner: homeF,
          sys: any,
          fleet: 4,
          legions: 3,
          general: g,
          mp: 0,
          ro: {
            ghostDreadnought: 1
          }
        });else station(F[homeF].capital || at, g);
      }
    }
    return;
  }
  if (Math.random() < 0.45) {
    const how = o.type === 'fleet' ? rnd(['went down with his flagship', 'was killed when his bridge was breached', 'died as his command ship broke apart']) : o.type ? rnd(['fell leading his troops', 'was cut down in the boarding fight']) : rnd(['fell defending his world', 'died in the last stand on the walls', 'was killed as the defences fell']);
    try {
      wikiFate(g, 'died', winner, how);
    } catch (e) {}
    g.dead = true;
    hist(g, `is slain${atBattle() || ' in battle'}.`);
  } else if (nmJustice(g, winner)) {/* oathbreaker executed by the Watch or its friends */} else if (winner === P) {
    if (g.exiledBy === P) {
      g.dead = true;
      hist(g, 'deserted his exile and is executed by law.');
    } else {
      S.prisoners.push(g);
      g.captive = {
        by: P,
        y: S.year
      };
      hist(g, `is captured by ${F[P].name} and thrown in chains.`);
    }
  } else if (g.f === P && winner >= 0) {
    // A brother of the Watch can't be "exiled to the Nightfleet": refused, he stays in their cells (judged yearly in captiveTick)
    const watch = P === 1 || !F[1]?.alive;
    const c = await ask(`<h3>${g.name} captured</h3>${F[winner].name} demands 250 credits ransom, or ${watch ? 'he will rot in their cells — and they may ransom, enslave or execute him later' : 'he will be exiled to the Nightfleet'}.${F[P].gold < 250 ? '<br><small>You cannot afford the ransom.</small>' : ''}`, F[P].gold >= 250 ? ['Pay 250', 'Refuse'] : ['Refuse']);
    if (c === 'Pay 250' && F[P].gold >= 250) {
      F[P].gold -= 250;
      F[winner].gold += 250;
      const home = systems.find(s => s.owner === P && !s.general),
        fl = units.find(u => u.owner === P && u.type === 'fleet' && !u.general);
      if (home) home.general = g;else if (fl) fl.general = g;else if (F[P].capital) {
        const cap = F[P].capital;
        addUnit({
          type: 'fleet',
          owner: P,
          sys: cap.owner === P ? cap : systems.find(s => s.owner === P),
          fleet: 1,
          general: g
        });
      }
      hist(g, 'is ransomed and returns home.');
      return;
    }
    if (watch) {
      g.captive = {
        by: winner,
        y: S.year
      };
      hist(g, `is held in the cells of ${F[winner].name}; his house would not pay.`);
    } else exileToNM(g, winner);
  } else if (winner >= 0 && !isHuman(winner) && F[winner]?.alive && !ffLord(F[winner]?.ruler) && Math.random() < 0.55) {
    // AI victors take prisoners too; their keeper judges them yearly in captiveTick
    g.captive = {
      by: winner,
      y: S.year
    };
    hist(g, `is captured${atBattle() || ' in battle'} and held by ${F[winner].name}.`);
  } else if (winner >= 0 && g.f !== 1 && Math.random() < 0.5) exileToNM(g, winner);
  // A slain or captured wielder's Starblade goes to the victors (AI battles included)
  if (g.starblade && winner >= 0 && (g.dead || g.captive || g.f !== homeF)) {
    const cand = units.filter(x => x.owner === winner && x.general && !x.general.dead && !x.general.starblade);
    const at = o.sys || o;
    const to = (cand.find(x => x.sys === at) || cand.find(x => at.links?.includes(x.sys)) || cand[0])?.general || (F[winner]?.ruler && !F[winner].ruler.starblade ? F[winner].ruler : null);
    if (winner === P) seizeBlade(g, to);else {
      delete g.starblade;
      g.skill = Math.max(0, g.skill - 2);
      WB(to || null, to ? 'claimed' : 'lost in battle', {
        from: g
      });
      if (to) {
        to.starblade = true;
        to.skill += 2;
        hist(to, `claims the Starblade of ${cl(g)}.`);
        log(`⚔ ${to.name} of ${F[winner].name} claims ${g.name}'s Starblade.`);
      }
    }
  }
  if (isRuler && F[homeF]?.ruler === g) await succession(homeF, g.dead ? 'was slain in battle' : g.f === 1 ? 'was captured and exiled to the Nightfleet' : 'was captured in battle');
}
async function attack(from, to) {
  if (from.fleet <= 0) return;
  let cap = from.fleet * CARRY;
  const el = Math.min(from.elite, cap);
  cap -= el;
  const lg = Math.min(Math.max(0, from.legions - 1), cap);
  const A = {
    owner: from.owner,
    fleet: from.fleet,
    legions: lg,
    elite: el,
    general: from.general
  };
  const leftElite = from.elite - el;
  from.fleet = 0;
  from.legions -= A.legions;
  from.elite = leftElite;
  from.general = null;
  from.moved = true;
  if (to.owner === A.owner) {
    to.fleet += A.fleet;
    to.legions += A.legions;
    to.elite += A.elite;
    if (!to.general) to.general = A.general;else if (A.general) from.general = A.general;
    to.moved = true;
    refresh();
    return;
  }
  const pa = A.owner === P,
    pi = pa || to.owner === P;
  if (to.owner >= 0 && !atWar(A.owner, to.owner) && declareWar(A.owner, to.owner) === false) {
    refresh();
    return;
  } // oath or faith stays the hand
  const holy = (inRecl(A.owner, to) ? 1.3 : 1) * (to.b.has('Hyperspace Nullifier') && !T(A, 'Gravity Nullifier') ? 0.7 : 1);
  if (to.fleet > 0) {
    const r = await fight(spacePow(A) * holy, spacePow(to) * 1.1, pi, pa, `SPACE BATTLE over ${to.name}`, {
      kind: 'space',
      A,
      D: to,
      holy
    });
    A.fleet = Math.floor(A.fleet * r.a);
    to.fleet = Math.floor(to.fleet * r.d);
    if (!r.win) {
      await loseGen(A, to.owner);
      retreat(from, A);
      log(`Fleet assault on ${to.name} repelled.`);
      refresh();
      return;
    }
  }
  if (to.legions + to.elite > 0) {
    if (A.legions + A.elite === 0) {
      retreat(from, A);
      log(`No legions to land at ${to.name}; blockade only.`);
      return;
    }
    const r = await fight(landPow(A) * holy, landPow(to) * 1.25 + 10 * bLv(to, 'Barracks'), pi, pa, `GROUND ASSAULT on ${to.name}`, {
      kind: 'land',
      A,
      D: to,
      holy
    });
    A.legions = Math.floor(A.legions * r.a);
    A.elite = Math.floor(A.elite * r.a);
    to.legions = Math.floor(to.legions * r.d);
    to.elite = Math.floor(to.elite * r.d);
    if (!r.win) {
      await loseGen(A, to.owner);
      retreat(from, A);
      log(`Invasion of ${to.name} repelled.`);
      refresh();
      return;
    }
  }
  await loseGen(to, A.owner);
  const prev = to.owner;
  grudge(prev, A.owner, -4, `the loss of ${to.name}`);
  Object.assign(to, {
    owner: A.owner,
    fleet: A.fleet,
    legions: Math.max(1, A.legions),
    elite: A.elite,
    general: A.general,
    moved: true,
    order: 3,
    recent: 3
  });
  if (inRecl(A.owner, to)) reclWon(to, A.owner, A.general);
  await settle(to, A, prev, pa);
  checkDead(prev);
  refresh();
}
async function settle(s, A, prev, pa) {
  const f = F[A.owner];
  if (!pa) {
    const g0 = A.general;
    // AI conquerors decide the people's fate from who they are — this is where dread and the Dark Path are earned
    const who = g0 || f.ruler,
      pr = persona(who),
      harsh = has(who, 'Cruel') || has(who, 'Bloodthirsty') || has(who, 'Fallen') || (who?.respect || 0) <= -3;
    const hate = prev >= 0 ? Math.max(0, -opinion(A.owner, prev) - 10) * 0.01 + (who?.vendetta === prev ? 0.1 : 0) : 0;
    const soft = has(who, 'Merciful') || has(who, 'Just') || has(who, 'Pious') ? 0.4 : 1;
    const pS = hostile(f) ? 0.4 : clamp((0.06 + pr.agg * 0.12 - pr.honor * 0.08 + (harsh ? 0.12 : 0) + hate) * soft, 0, 0.45);
    const pE = enslaveOk(A.owner) && !f.mods?.ff ? clamp((0.05 + (harsh ? 0.1 : 0) + hate * 0.5) * soft, 0, 0.25) : 0;
    const pX = f.mods?.ff ? 0 : clamp((0.004 + (harsh && pr.agg > 0.8 ? 0.04 : 0) + (has(who, 'Zealot') && s.rel !== f.rel ? 0.03 : 0) + hate * 0.3) * soft, 0, 0.12);
    const r = Math.random(),
      by = `${g0 ? cl(g0) + ' of ' : ''}${f.name}`;
    if (r < pX) {
      f.gold += s.income * 2;
      s.income = Math.floor(s.income * 0.6);
      if (f.rel !== 'Mixed') s.rel = f.rel;
      s.order = 8;
      s.recent = 0;
      apoc(15, `${f.name} exterminates ${s.name}`);
      grudge(prev, A.owner, -8, `the extermination of ${s.name}`);
      if (who) {
        who.respect = Math.max(-ACAP, (who.respect || 0) - 2);
        maybe(who, 'Bloodthirsty', 0.6);
        hist(who, `exterminates the people of ${s.name}.`);
      }
      log(`☠ ${by} EXTERMINATES the people of ${s.name}.`);
      if (prev === P || inSight(s)) toast(`☠ ${s.name} exterminated by ${f.name}`, false);
      await darkDeed(who, 6, `the extermination of ${s.name}`);
    } else if (r < pX + pE) {
      S.slaves += 1;
      s.income = Math.floor(s.income * 0.8);
      apoc(9, `${f.name} enslaves ${s.name}`);
      grudge(prev, A.owner, -5, `the enslavement of ${s.name}`);
      if (who) {
        who.respect = Math.max(-ACAP, (who.respect || 0) - 1);
        maybe(who, 'Cruel', 0.4);
        hist(who, `enslaves the people of ${s.name}.`);
      }
      log(`⛓ ${by} enslaves the people of ${s.name}.`);
      await darkDeed(who, 3, `the enslavement of ${s.name}`);
    } else if (r < pX + pE + pS) {
      damageBuildings(s, 1);
      f.gold += s.income * 3;
      apoc(hostile(f) ? 3 : 4, `${f.name} sacks ${s.name}`);
      grudge(prev, A.owner, -3, `the sack of ${s.name}`);
      if (who) {
        who.respect = Math.max(-ACAP, (who.respect || 0) - 1);
        maybe(who, 'Cruel', 0.2);
        hist(who, `sacks ${s.name}.`);
      }
      log(`🔥 ${by} sacks ${s.name}.`);
      await darkDeed(who, 1, `the sack of ${s.name}`);
    } else {
      s.order += 1;
      if (who && pr.honor > 0.55 && Math.random() < 0.3) who.respect = Math.min(ACAP, (who.respect || 0) + 1);
      log(`${by} takes ${s.name}.`);
      if (g0) hist(g0, `occupies ${s.name}.`);
    }
    return;
  }
  const opts = ['Occupy', 'Sack', 'Exterminate'];
  const canEnslave = enslaveOk(A.owner);
  if (canEnslave) opts.push('Enslave');
  const c = await ask(`<h3>${s.name} captured</h3>Decide the fate of the populace.<br><small>${canEnslave ? '' : 'Only the slaver guilds, the Spice Syndicate and pirates trade in slaves.'}</small>`, opts);
  const g = A.general;
  if (c === 'Sack') grudge(prev, P, -3, `the sack of ${s.name}`);
  if (c === 'Exterminate') {
    grudge(prev, P, -8, `the extermination of ${s.name}`);
    F.forEach(x => {
      if (x.alive && x.id !== P && x.rel === s.rel && x.id !== prev) grudge(x.id, P, -2, `the extermination of ${s.name}`);
    });
  }
  if (c === 'Enslave') {
    grudge(prev, P, -5, `the enslavement of ${s.name}`);
    if (F[10]?.alive) grudge(10, P, -5, `the enslavement of ${s.name}`);
  }
  if (c === 'Occupy') grudge(prev, P, 1);
  if (c === 'Occupy') {
    s.order += 2;
    apoc(-1, 'merciful occupation');
    if (g) g.respect++;
    maybe(g, 'Merciful', 0.3);
  }
  if (c === 'Sack') {
    damageBuildings(s, 1);
    f.gold += s.income * 3;
    apoc(4, 'sacking');
    if (g) g.respect--;
    maybe(g, 'Cruel', 0.3);
    if (s.rel === 'Order') st(P, -1, 'sacking a faithful world');
  }
  if (c === 'Exterminate') {
    f.gold += s.income * 2;
    s.income = Math.floor(s.income * 0.6);
    if (f.rel !== 'Mixed') s.rel = f.rel;
    s.order = 8;
    s.recent = 0;
    apoc(15, 'extermination');
    if (g) g.respect -= 2;
    maybe(g, 'Bloodthirsty', 0.6);
    st(P, -2, 'extermination');
  }
  if (c === 'Enslave') {
    S.slaves += 3;
    s.income = Math.floor(s.income * 0.8);
    apoc(9, 'mass enslavement');
    if (g) g.respect--;
    maybe(g, 'Cruel', 0.4);
    st(P, -2, 'enslavement');
  }
  const doer = g || F[P].ruler;
  if (c === 'Exterminate') await darkDeed(doer, 6, `the extermination of ${s.name}`);
  if (c === 'Enslave') await darkDeed(doer, 3, `the enslavement of ${s.name}`);
  if (c === 'Sack') await darkDeed(doer, 1, `the sack of ${s.name}`);
  const FATE = {
    Occupy: ['🏳', 'occupies', 'peacefully'],
    Sack: ['🔥', 'sacks', 'and plunders its wealth'],
    Exterminate: ['☠', 'exterminates the people of', 'and resettles it'],
    Enslave: ['⛓', 'enslaves the people of', '']
  }[c];
  if (FATE) {
    const by = g ? cl(g) : f.name,
      from = prev >= 0 ? ` (taken from ${F[prev].name})` : '';
    log(`${FATE[0]} ${by} ${FATE[1]} ${s.name}${FATE[2] ? ' ' + FATE[2] : ''}${from}.`);
    if (g) hist(g, `${FATE[1]} ${s.name}${FATE[2] ? ' ' + FATE[2] : ''}${from}.`);
  }
  if (prev >= 0 && F[prev].heirs.length && Math.random() < 0.35) {
    const h = F[prev].heirs.shift();
    S.wards.push(h);
    log(`👶 ${h.name}, heir of ${F[prev].name}, is now your ward.`);
  }
}
function checkDead(fid) {
  if (fid < 0 || !F[fid].alive || systems.some(s => s.owner === fid)) return;
  // A house that falls to its own claimant isn't destroyed — the victor takes its title
  const heir = F.find(r => r.id !== fid && claimOf(r) === fid && systems.some(s => s.owner === r.id));
  if (heir && unifyClaim(heir.id, `conquers the last loyal world of ${F[fid].name}`)) return;
  F[fid].alive = false;
  units.filter(x => x.owner === fid).forEach(removeUnit);
  if (S.vassal) {
    if (S.vassal[fid] != null) WV('end', fid, S.vassal[fid], 'fell', `${F[fid]?.name} fell`);
    delete S.vassal[fid];
    for (const v in S.vassal) if (S.vassal[v] === fid) {
      WV('end', +v, fid, 'fell', `${F[fid]?.name} fell`);
      delete S.vassal[v];
    }
  }
  log(`💀 ${F[fid].name} has been destroyed!`);
  // Hotseat/online: other commanders play on; only reload when no human house survives
  if (isHuman(fid)) {
    if (humans().length) notify(`<h3>💀 ${F[fid].name} has fallen</h3>${fid === P ? 'Your dynasty is destroyed. ' : ''}The remaining commanders play on.`);else ask('<h3>Your dynasty has fallen</h3>', ['Restart']).then(() => location.reload());
  }
}

// ================= Succession =================
// ---- Blood: closeness to the line of power. A crowned ruler becomes the new fount (blood 10); his
// children inherit ±2, so blood fades with each generation away from the throne. Claim adds proximity to
// the last ruler: sons and brothers of the dead ruler are seen as far closer than distant cousins.
function bloodClaim(c, f) {
  const last = f?.ruler,
    why = [`Blood ${c.blood ?? 5}`];
  let v = c.blood ?? 5;
  const add = (n, t) => {
    v += n;
    why.push(`${n > 0 ? '+' : ''}${n} ${t}`);
  };
  if (last && last !== c) {
    if (c.father === last.id) add(4, `son of ${last.name}`);else if (c.father != null && c.father === last.father) add(2, `brother of ${last.name}`);else if (CH[c.father]?.father === last.id) add(2, `grandson of ${last.name}`);
    if (c.spouse != null && CH[c.spouse]?.father === last.id) add(1, `married to ${last.name}'s daughter`);
  }
  if (c.adopted) add(-2, 'adopted');
  if (c.wasRuler) add(2, 'once reigned');
  if ((c.respect ?? 0) >= 5) add(1, 'renowned');
  if (c.illegit) add(-3, 'base-born');
  return {
    v,
    why
  };
}
// When a ruler is crowned, he becomes the new fount of the royal blood
function crownBlood(r) {
  if (r) {
    r.blood = 10;
    r.crownY = S.year;
    wikiReign(r);
  }
}
// Authority (faction leader only, M2TW): derived from who he is and what he has done — command, fame or fear,
// years on the throne, victories and deeds. High Authority keeps generals loyal; low Authority breeds rebellion.
function authority(r) {
  if (!r || r.dead) return 0;
  let a = 1.5 + (r.skill || 0) * 0.35 + Math.min(8, Math.abs(r.respect || 0)) * 0.3 + Math.min(3, (S.year - (r.crownY ?? S.year)) * 0.25) + Math.min(2, (r.wins || 0) * 0.25);
  if (has(r, 'Hero') || has(r, 'Tourney Champion')) a += 1;
  if (has(r, 'Disgraced') || has(r, 'Coward')) a -= 1.5;
  if (has(r, 'Indolent')) a -= 1;
  if (has(r, 'Vigilant')) a += 0.5;
  if (r.age < 18) a -= 3;
  return clamp(Math.round(a), 0, 10);
}
// Life shapes a man: idle years at court soften him, standing watch on a hostile border hardens him.
function lifeTraits() {
  for (const f of F) {
    if (!f.alive) continue;
    const war = F.some(o => o.alive && o.id !== f.id && !hostile(o) && atWar(f.id, o.id));
    for (const u of units) {
      if (u.owner !== f.id || u.type !== 'fleet' || !u.general || u.general.dead) continue;
      const g = u.general,
        edge = [u.sys, ...u.sys.links].some(l => l.owner >= 0 && l.owner !== f.id && atWar(f.id, l.owner));
      if (edge) maybe(g, 'Vigilant', 0.08);else if (!war && u.sys.owner === f.id) maybe(g, 'Indolent', 0.03);
    }
    const busy = c => systems.some(s => s.general === c) || units.some(u => u.general === c || u.char === c);
    for (const c of [f.ruler, ...f.heirs]) if (c && !c.dead && !c.fem && c.age >= 20 && !busy(c)) maybe(c, 'Indolent', 0.05);
  }
}
// ---- Claim wars end with one house again: a victorious claimant takes the title, a crushed one bends the knee ----
const claimOf = r => r?.alive ? r.claimFor ?? r.rebelOf ?? null : null;
// Claimant rid wins: his realm, men and court merge into the house he fought for, and he is crowned its ruler
function unifyClaim(rid, why = 'wins the war for the throne') {
  const r = F[rid],
    fid = claimOf(r),
    f = F[fid];
  if (!f || !r.ruler || r.ruler.dead) return false;
  const old = f.ruler,
    nr = r.ruler;
  systems.forEach(s => {
    if (s.owner === rid) s.owner = fid;
  });
  units.forEach(u => {
    if (u.owner === rid) {
      u.owner = fid;
      if (u.mesh?.material?.color) try {
        u.mesh.material.color.set(f.color);
      } catch (e) {}
    }
  });
  Object.values(CH).forEach(c => {
    if (c.f === rid) c.f = fid;
  });
  f.gold += r.gold || 0;
  r.gold = 0;
  // The deposed ruler stays at court — bitter, with a claim of his own
  if (old && !old.dead && old !== nr) {
    old.loyalty = Math.min(old.loyalty ?? 5, 1);
    hist(old, `is deposed by ${nr.name} and kept at court.`);
    systems.forEach(s => {
      if (s.general === old) s.general = null;
    });
    f.heirs.push(old);
  }
  f.heirs = [...f.heirs.filter(h => h !== nr), ...(r.heirs || []).filter(h => h && h !== nr)];
  f.princesses = [...(f.princesses || []), ...(r.princesses || [])];
  f.ruler = nr;
  nr.f = fid;
  nr.wasRuler = true;
  nr.loyalty = 10;
  crownBlood(nr);
  if (!f.capital || f.capital.owner !== fid) f.capital = systems.find(s => s.owner === fid && s.general === nr) || systems.find(s => s.owner === fid) || null;
  for (const k of [...S.war]) {
    const [a, b] = k.split('|').map(Number);
    if (a === rid || b === rid) {
      S.war.delete(k);
      const o = a === rid ? b : a;
      if (o !== fid && F[o]?.alive) S.war.add(key(fid, o));
    }
  }
  for (const k of [...S.ally]) if (k.split('|').map(Number).includes(rid)) S.ally.delete(k);
  r.alive = false;
  hist(nr, `${why} and is crowned ruler of ${f.name}.`);
  log(`👑 ${nr.name} ${why}: ${r.name} and ${f.name} are one house again, under ${nr.name}.`);
  if (isHuman(fid)) notify(`<h3>👑 The Throne Changes Hands</h3>${portrait(nr, 80)}<b>${nr.name}</b> ${why} and is crowned ruler of ${f.name}.${old && !old.dead ? ` ${old.name} is deposed and kept at court.` : ''}<br><small>You continue to lead ${f.name} under its new ruler.</small>`);
  return true;
}
// Loyalists win: the claimant's worlds return to the house; the claimant (if alive) is held at court, his followers pardoned
function crushClaim(rid, why = 'submits to the crown') {
  const r = F[rid],
    fid = claimOf(r),
    f = F[fid];
  if (!f) return false;
  systems.forEach(s => {
    if (s.owner === rid) s.owner = fid;
  });
  units.forEach(u => {
    if (u.owner === rid) u.owner = fid;
  });
  Object.values(CH).forEach(c => {
    if (c.f === rid) {
      c.f = fid;
      c.loyalty = Math.max(0, (c.loyalty ?? 5) - 1);
    }
  });
  const pr = r.ruler;
  if (pr && !pr.dead) {
    pr.loyalty = 0;
    systems.forEach(s => {
      if (s.general === pr) s.general = null;
    });
    f.heirs.push(pr);
    hist(pr, `${why} — his claim to ${f.name} is broken.`);
  }
  for (const k of [...S.war]) if (k.split('|').map(Number).includes(rid)) S.war.delete(k);
  for (const k of [...S.ally]) if (k.split('|').map(Number).includes(rid)) S.ally.delete(k);
  r.alive = false;
  log(`⚔ The claim of ${r.name} is broken: ${pr?.name || 'the pretender'} ${why}. ${f.name} is whole again.`);
  return true;
}
// Yearly: claim wars resolve from facts on the ground, not timers
function claimTick() {
  for (const r of F.filter(x => claimOf(x) != null)) {
    const fid = claimOf(r),
      f = F[fid];
    if (!f?.alive) {
      unifyClaim(r.id, 'outlasts the old line');
      continue;
    }
    if (!S.war.has(key(r.id, fid))) continue;
    const mine = systems.filter(s => s.owner === r.id).length,
      theirs = systems.filter(s => s.owner === fid).length;
    const pr = r.ruler;
    if (!pr || pr.dead || pr.captive) {
      crushClaim(r.id, pr?.captive ? 'is a captive' : 'is dead');
      continue;
    }
    // Holding the capital, or most of the realm, makes the claimant the de facto ruler
    if (f.capital?.owner === r.id || mine >= theirs * 2) {
      unifyClaim(r.id, f.capital?.owner === r.id ? `takes ${f.capital.name}, the seat of ${f.name},` : 'holds most of the realm');
      continue;
    }
    if (!f.ruler || f.ruler.dead || f.ruler.captive) {
      unifyClaim(r.id, 'is the last claimant standing');
      continue;
    }
    // A beaten claimant with nothing left but his seat may bend the knee rather than die
    if (mine <= 1 && theirs >= 4 && (pr.loyalty ?? 0) + (has(pr, 'Cautious') ? 3 : 0) - (has(pr, 'Ambitious') ? 2 : 0) + (theirs - 4) * 0.5 >= 2) crushClaim(r.id);
  }
}
// A new ruler takes his seat at the capital (his old post is left free; a governor already there moves to reserve)
function seatRuler(f) {
  const r = f?.ruler,
    cap = f?.capital;
  if (!r || r.dead || r.f !== f.id || !cap || cap.owner !== f.id || cap.general === r) return;
  systems.forEach(s => {
    if (s.general === r) s.general = null;
  });
  units.forEach(u => {
    if (u.general === r) u.general = null;
  });
  unstation(r);
  const prev = cap.general;
  cap.general = r;
  r.gen = true;
  if (prev && !prev.dead) station(cap, prev);
}
async function succession(fid, cause) {
  await successionCore(fid, cause);
  try {
    buryDead();
    seatRuler(F[fid]);
  } catch (e) {
    console.error(e);
  }
}
async function successionCore(fid, cause) {
  const f = F[fid];
  if (!f || !f.alive || f.domiri) return;
  if (f.mods?.ff) {
    // no succession wars in the dark: the next Domiri lord simply takes the black throne
    if (f.ruler && !f.ruler.dead && !f.ruler.captive) return;
    const nx = (f.heirs || []).find(c => c && !c.dead && !c.captive);
    if (nx) {
      f.heirs = f.heirs.filter(c => c !== nx);
      f.ruler = nx;
      nx.wasRuler = true;
      nx.loyalty = 10;
      hist(nx, 'takes the black throne of the Forgotten Fleet.');
    }
    return;
  }
  if (/died|assassinated|burned|Grey Rot/.test(cause) && f.ruler) f.ruler.dead = true;
  buryDead();
  if (f.ruler) {
    f.ruler.hist.push(`Y${S.year}: ${cause}.`);
    log(`👑 ${rTitle(fid)} ${cl(f.ruler)} of ${f.name} ${cause}.`);
    if (f.ruler.f === P && /slain|died|assassinated|executed|burned/.test(cause)) try {
      playSfx('death');
    } catch (e) {}
  } else log(`👑 The ${rTitle(fid)} of ${f.name} ${cause}.`);
  const elective = fid === 0 || fid === 1 || fid === 16 || fid === 5 && S.bank.gov !== 'Blood Empire';
  if (f.mods?.elect) {
    // Free Planets: the council of governors elects a High King from among themselves
    const govs = systems.filter(s => s.owner === fid && s.general && !s.general.dead && s.general !== f.ruler).map(s => s.general);
    const hk = c => (c.admin || 0) + c.skill + (c.loyalty || 0),
      sw = await sway(fid, `Election of the High King of ${f.name}`, govs, hk);
    const pick = govs.sort((a, b) => hk(b) + sw.b(b) - (hk(a) + sw.b(a)))[0] || f.heirs.find(h => h.age >= 18) || mkChar(fid, ri(35, 60));
    await sw.done(pick, 'chosen by the Council of Governors');
    f.ruler = pick;
    f.heirs = f.heirs.filter(h => h !== pick);
    pick.wasRuler = true;
    hist(pick, `is elected High King of ${f.name} by the Council of Governors.`);
    log(`🗳 The Council of Governors elects ${pick.name} High King of ${f.name}.`);
    if (fid === P && !sw.shown) await notify(`<h3>🗳 A New High King</h3>${portrait(pick, 80)}The governors of ${f.name} elect <b>${pick.name}</b> as High King.`);
    return;
  }
  if (fid === 0) {
    councilFill();
    const cands = S.council.map(id => CH[id]).filter(c => c && !c.dead && !c.captive);
    // Houses vote as blocs: every Master a house seats on the Council pulls for its own candidate; standing adds weight
    const bloc = c => cands.filter(o => o.f === c.f).length;
    const sc0 = c => c.piety + c.reverence + c.skill + (bloc(c) - 1) * 2.5 + (c.f !== 0 ? (standing(c.f) - 5) * 0.6 : 0);
    const sw = await sway(0, 'Election of the Grandmaster', cands, sc0);
    const sc = c => sc0(c) + sw.b(c) + Math.random() * 5;
    const gm = cands.map(c => [c, sc(c)]).sort((a, b) => b[1] - a[1])[0]?.[0] || mkChar(0, 55);
    S.council = S.council.filter(id => id !== gm.id);
    gm.council = false;
    gm.wasRuler = true;
    if (gm.f !== 0) {
      gm.origin = gm.f;
      units.filter(u => u.char === gm).forEach(removeUnit);
      gm.f = 0;
      if (F[gm.origin]) {
        if (exco(gm.origin) || S.sanct.includes(gm.origin)) {
          absolve(gm.origin, `a son of the house, ${gm.name}, is raised to Grandmaster`);
          if (gm.origin === P) toast(`✠ Your monk <b>${gm.name}</b> is elected Grandmaster — ${F[P].name} is absolved!`, true);
        }
        S.standing[gm.origin] = 10;
      }
    }
    f.ruler = gm;
    hist(gm, `is elected Grandmaster of the Nameless by the Council of Masters${gm.origin != null ? ` (raised from ${F[gm.origin]?.name})` : ''}.`);
    councilFill();
    await sw.done(gm, `by the Council of Masters${gm.origin != null ? `, raised from ${F[gm.origin]?.name}` : ''}`);
    if (gm.origin === P) await notify(`<h3>✠ A Grandmaster from your house!</h3>${portrait(gm, 80)}The Council of Masters elects your own <b>${gm.name}</b> as Grandmaster. Your standing with the Nameless is exalted while he reigns.`);else if (fid === P && !sw.shown) await notify(`<h3>✠ Election</h3>${portrait(gm, 80)}The Council elects ${gm.name} as Grandmaster.`);
    return;
  }
  if (fid === 1) {
    await nmElect(cause);
    return;
  }
  if (elective) {
    const cands = [...f.heirs.filter(h => h.age >= 18 && !h.dead && !h.captive), ...systems.filter(s => s.owner === fid && s.general && s.general !== f.ruler).map(s => s.general)];
    while (cands.length < (fid === 16 ? 1 : fid === 0 ? 13 : 5)) cands.push(mkChar(fid, ri(30, 60)));
    // Gray Order: the wardens raise their ablest and most devout; Bloodbank consuls: the shrewdest
    const esc = c => fid === 16 ? c.skill + (c.piety || 0) * 0.6 + (c.wins || 0) * 0.3 : c.skill + (c.admin || 0) * 0.5;
    const sw = await sway(fid, fid === 16 ? 'Election of the Gray Grandmaster' : `Election of the Consul of ${f.name}`, cands, esc);
    f.ruler = cands.map(c => [c, esc(c) + sw.b(c) + Math.random() * 3]).sort((a, b) => b[1] - a[1])[0][0];
    f.heirs = f.heirs.filter(h => h !== f.ruler);
    f.ruler.wasRuler = true;
    const title = fid === 16 ? 'Grandmaster of the Gray Order, elected by the wardens' : fid === 0 ? 'Grandmaster, elected by the Council of 13' : fid === 1 ? 'Lord Commander, elected by the Council of 5' : 'Consul';
    hist(f.ruler, `becomes ${title} of ${f.name}.`);
    await sw.done(f.ruler, fid === 16 ? 'by the wardens of the Order' : 'by the partners of the bank');
    if (!sw.shown && fid === P) await notify(`<h3>Election</h3>${f.ruler.name} is now ${title}.`);
    return;
  }
  // Feudal primogeniture: the eldest son of the dead ruler inherits, then other sons, then the eldest kinsman.
  // The player cannot name an heir — only shape events (marriages, mentoring, assassinations, exile).
  // Pirate Elect (2) crowns the closest blood instead. Blood claims matter for who contests the crown.
  const prevRuler = f.ruler,
    owned = systems.filter(s => s.owner === fid);
  const claim = h => bloodClaim(h, f).v;
  const pool = royalKin(f).filter(h => h.age >= 16 && !h.captive && (!h.fem || h.wm)).sort(fid === 2 ? (a, b) => claim(b) - claim(a) : (a, b) => (b.father === prevRuler?.id) - (a.father === prevRuler?.id) || b.age - a.age);
  if (!pool.length) {
    f.ruler = f.mods?.coven ? mkWM(fid, 30) : mkChar(fid, 30);
    f.ruler.blood = ri(3, 6);
    f.ruler.wasRuler = true;
    log(f.mods?.coven ? `🔮 The coven raises a new Witch-Queen of ${f.name}.` : 'A distant cousin takes the throne.');
    crownBlood(f.ruler);
    return;
  }
  f.ruler = pool[0];
  const heirClaim = bloodClaim(f.ruler, {
    ruler: prevRuler
  }).v;
  f.ruler.wasRuler = true;
  f.heirs = f.heirs.filter(h => h !== f.ruler);
  hist(f.ruler, `ascends the throne of ${f.name}${fid === 2 ? ' as closest in blood to the Dread Lord' : ''} (blood claim ${heirClaim}).`);
  // Rivals: disloyal kin at court, and disloyal governors who share the royal blood, measured against the new ruler's claim
  const rivals = [...f.heirs.filter(h => h.age >= 16 && !h.dead), ...owned.map(s => s.general).filter(g => g && !g.dead && g !== f.ruler && (g.blood ?? 0) >= 6)].map(h => ({
    h,
    c: bloodClaim(h, {
      ruler: prevRuler
    }).v
  })).filter(o => o.h.loyalty < 6 && (o.c >= heirClaim - 1 || o.h.loyalty < 3)).sort((a, b) => b.c - a.c || a.h.loyalty - b.h.loyalty);
  let rival = rivals[0]?.h,
    rivalClaim = rivals[0]?.c ?? 0;
  crownBlood(f.ruler);
  // Old debts and old hatreds buy pretenders: the Bloodbank's claim, or a house in blood feud
  const bankClaim = fid !== 5 && F[5]?.alive && S.bank?.claims?.[fid];
  const feud = F.find(o => o.alive && o.id !== fid && !hostile(o) && !isHuman(o.id) && opinion(o.id, fid) <= -15);
  const backer = bankClaim ? F[5] : feud;
  // No dice: the rival weighs his own grievance, ambition and claim against the swords he can count on.
  const gap = rivalClaim - heirClaim;
  const follows = g => g && g !== rival && g !== f.ruler && !g.dead && (g.loyalty < 5 || g.father != null && g.father === rival?.father) && !has(g, 'Loyal');
  const strOf = s => s.legions + s.elite * 2 + s.fleet * 2 + units.filter(u => u.owner === fid && u.sys === s && u.type === 'fleet').reduce((t, u) => t + (u.fleet || 0) * 2 + (u.legions || 0), 0);
  const leanW = rival ? owned.filter(s => s !== f.capital && (s.general === rival || follows(s.general))) : [];
  const mine = leanW.reduce((t, s) => t + strOf(s), 0) + (backer ? power(backer.id) * 0.2 : 0);
  const theirs = Math.max(1, owned.reduce((t, s) => t + strOf(s), 0) - leanW.reduce((t, s) => t + strOf(s), 0));
  const nerve = rival ? (6 - rival.loyalty) * 0.5 + gap * 0.6 + (has(rival, 'Ambitious') ? 1.5 : 0) + (has(rival, 'Reckless') || has(rival, 'Brave') ? 0.5 : 0) - (has(rival, 'Cautious') ? 1 : 0) - (has(rival, 'Loyal') ? 3 : 0) + (backer ? 2 : 0) + (rival.vendetta === fid ? 2 : 0) : 0;
  if (rival && leanW.length && nerve >= 2 && mine / theirs >= 0.35) {
    leanW.forEach(s => {
      s._leans = true;
    });
    const r = newFaction(`Pretender ${rival.name}`, 0x999999, f.rel, {
      gold: 300
    }, {
      rebelOf: fid
    });
    if (backer) {
      r.gold += 400;
      ally(r.id, backer.id, bankClaim ? 'bought with Bloodbank gold' : `${backer.name} feeds an old feud`);
      if (bankClaim) delete S.bank.claims[fid];
      log(`🩸 ${backer.name} backs the pretender ${rival.name} against ${f.name}${bankClaim ? ' — the defaulted debt comes due in blood' : ''}.`);
    }
    r.ruler = rival;
    r.heirs = [];
    rival.f = r.id;
    hist(rival, `rebels, claiming the throne of ${f.name}.`);
    f.heirs = f.heirs.filter(h => h !== rival);
    S.war.add(key(r.id, fid));
    const take = leanW.slice(); // exactly the worlds whose governors chose his side
    const turned = [];
    take.forEach(s => {
      s.owner = r.id;
      s.legions += 2;
      s.fleet += 1;
      if (s.general && s.general !== rival) {
        s.general.f = r.id;
        turned.push(s.general);
        hist(s.general, `declares for the pretender ${rival.name}.`);
      }
    });
    owned.forEach(s => {
      delete s._leans;
    });
    const seat = take.find(s => s.general === rival) || take[0];
    if (seat.general && seat.general !== rival) {
      r.heirs.push(seat.general);
    }
    seat.general = rival;
    apoc(3, 'succession war');
    r.claimFor = fid; // the winner of this war takes the title of the house (see claimTick / unifyClaim)
    const verdict = gap > 0 ? 'His blood runs closer to the old ruler than the new one\'s — many see him as the rightful heir.' : gap >= -1 ? 'Their claims are nearly equal; the realm is split.' : 'His claim is weaker, but ambition and grievance drive him.';
    log(`⚔ SUCCESSION WAR in ${f.name}: ${rival.name} (claim ${rivalClaim}) contests ${f.ruler.name} (claim ${heirClaim})!`);
    if (fid === P) await notify(`<h3>SUCCESSION WAR</h3><div class="frow">${card(f.ruler, 'claim ' + heirClaim)}${card(rival, 'claim ' + rivalClaim)}</div>${rival.name} disputes ${f.ruler.name}'s claim and seizes ${take.length} system(s)${turned.length ? `; ${turned.map(g => g.name).join(', ')} declare${turned.length > 1 ? '' : 's'} for him` : ''}.<br><small>${verdict}<br>${bloodClaim(rival, {
      ruler: prevRuler
    }).why.join(' · ')}</small>`);
  }
  const q = CH[f.ruler.spouse];
  if (q && !q.dead && q.age < 45) {
    const k = birth(fid, f.ruler, q, ri(0, 3));
    (k.fem ? f.princesses : f.heirs).push(k);
  }
}

// ================= Apocalypse =================
// Old saves: the alien swarm (flag f.domiri) has been removed from the setting — its worlds fall back to independence
function voidspawnGone() {
  for (const f of F) {
    if (!f?.domiri || f._gone) continue;
    f._gone = true;
    if (f.alive) {
      systems.forEach(s => {
        if (s.owner === f.id) Object.assign(s, {
          owner: -1,
          general: null,
          siege: null
        });
      });
      units.filter(u => u.owner === f.id).forEach(u => removeUnit(u));
      for (const k of [...S.war]) if (k.split('|').includes(String(f.id))) S.war.delete(k);
    }
    Object.values(CH).forEach(c => {
      if (c && c.f === f.id && !c.dead) {
        c.dead = true;
        c.undying = false;
      }
    });
    f.alive = false;
    f.ruler = null;
    f.heirs = [];
    f.princesses = [];
  }
}
// ---- The Forgotten Fleet: undying wraith-admirals of a dead empire, awakened by the galaxy's sins ----
// The Seven: Domiri lords of the Forgotten Fleet — gene-forged war-kings, bound in iron and silence
const WRAITHS = ['Vorgath, the Hollow King', 'Ixar Nul, Lord of the Black Wake', 'The Ninth Thane', 'High Marshal Orrin the Unburied', 'Kael Sorrow, the Iron Herald', 'The Pale Seneschal', 'Morrow the Drowned Crown', 'The Ashen Castellan', 'Sire Dusk of the Last Armada'];
function wraith(fid) {
  const used = new Set(Object.values(CH).map(c => c.name));
  const c = mkChar(fid, ri(400, 900));
  c.name = WRAITHS.find(n => !used.has(n)) || 'A Nameless Domiri Lord';
  Object.assign(c, {
    undying: true,
    domiri: true,
    mask: 'veil',
    skill: ri(9, 10),
    respect: -ri(14, 20),
    loyalty: 10,
    admin: ri(6, 9),
    cunning: ri(6, 9)
  });
  addTrait(c, 'Cruel', true);
  c.hist.push(`Y${S.year}: wakes from a thousand-year silence aboard a black dreadnought, one of the Seven Domiri lords of the Forgotten Fleet.`);
  return c;
}
async function awakenFF() {
  const f = F.find(x => x.mods.ff);
  if (!f || !f.dormant) return false;
  f.dormant = false;
  f.alive = true;
  f.gold = 1500;
  const seven = Array.from({
    length: 7
  }, () => wraith(f.id));
  f.ruler = seven[0];
  f.ruler.wasRuler = true;
  f.heirs = seven.slice(1);
  f.princesses = [];
  f.tech = ['Cloaking', 'Laser Weapons'];
  // They emerge from the dark beyond the eastern rim — right on the Nightfleet's doorstep.
  let nm = systems.filter(s => s.owner === 1);
  if (!nm.length) nm = systems.filter(s => s.wasNM); // the Nightfleet fell: whoever holds its old rim worlds meets them first
  const dNM = s => nm.length ? Math.min(...nm.map(x => x.pos.distanceTo(s.pos))) : Math.hypot(s.pos.x - 40, s.pos.z + 10);
  const far = systems.filter(s => s.owner !== 1 && !s.wasNM && !F.some(o => o.capital === s)).sort((a, b) => dNM(a) - a.pos.x * 0.3 - (dNM(b) - b.pos.x * 0.3)).slice(0, 2);
  far.forEach((s, i) => {
    const prev = s.owner;
    if (s.general && prev >= 0) {
      s.general.dead = true;
      hist(s.general, `is slain as the Forgotten Fleet falls upon ${s.name}.`);
    }
    Object.assign(s, {
      owner: f.id,
      legions: 16,
      elite: 8,
      fleet: 8,
      stn: 3,
      order: 10,
      siege: null,
      general: seven[i]
    });
    s.b.add('Space Station').add('Shipyard').add('Barracks');
    roAdd(s, 'ghostDreadnought', 1);
    if (prev >= 0) checkDead(prev);
  });
  f.capital = far[0];
  far[0].b.add('World Devastators');
  // A vast armada: five battle-fleets, each led by one of the remaining Domiri lords
  seven.slice(2).forEach((g, i) => addUnit({
    type: 'fleet',
    owner: f.id,
    sys: far[i % far.length],
    fleet: 14,
    legions: 10,
    elite: 6,
    general: g,
    mp: 2,
    ro: {
      ghostDreadnought: 4
    }
  }));
  log(`🌑 THE FORGOTTEN FLEET AWAKENS at ${far[0].name}! Seven Domiri lords lead a vast armada out of the dark.`);
  await notify(`<h3>🌑 The Forgotten Fleet Awakens</h3>${portrait(f.ruler, 72)}<i>Out of the dark between the stars, black wedge-ships light their engines for the first time in a thousand years.</i><br><br>${cl(f.ruler)} and the Seven — undying Domiri lords, masked and silent, who once commanded the last armada of a dead empire — have returned at the head of a vast host. They do not negotiate. They do not age. They hunt the lost superweapons of the Old Empire, and they mean to burn the galaxy into obedience — beginning with the Nightfleet, the exiles who have guarded the eastern dark against them for a thousand years.<br><br><b>They have seized ${far.map(s => s.name).join(' and ')}.</b>`);
  return true;
}
// First hop of the shortest route (all lanes, ignores fog) toward any system matching pred.
function stepToward(from, pred) {
  const prev = new Map([[from, null]]),
    q = [from];
  while (q.length) {
    const c = q.shift();
    if (c !== from && pred(c)) {
      let x = c;
      while (prev.get(x) !== from) x = prev.get(x);
      return x;
    }
    for (const n of c.links) if (!prev.has(n)) {
      prev.set(n, c);
      q.push(n);
    }
  }
  return null;
}
async function ffTurn(f) {
  const mine = systems.filter(s => s.owner === f.id);
  f.gold += 220;
  // The Domiri lords raise new black dreadnoughts from their shadow-yards
  const fl = units.filter(u => u.owner === f.id && u.type === 'fleet');
  if (fl.length && Math.random() < 0.25) roAdd(rnd(fl), 'ghostDreadnought', 1);
  if (!fl.length && mine.length && Math.random() < 0.4) addUnit({
    type: 'fleet',
    owner: f.id,
    sys: rnd(mine),
    fleet: 5,
    legions: 4,
    general: wraith(f.id),
    mp: 2,
    ro: {
      ghostDreadnought: 2
    }
  });
  // They scour the galaxy for lost technology
  if (Math.random() < 0.12) {
    const t = rnd(['Aether Shield', 'Plasma Weapons', 'Gravity Nullifier', 'Bodyshields', 'Blockades', 'Necronomicon'].filter(n => !f.tech.includes(n)));
    if (t) {
      f.tech.push(t);
      log(`🌑 The Forgotten Fleet unearths ${t} from a dead world.`);
    }
  }
  // ...and rebuild the superweapons of the Old Empire
  const sws = ['World Devastators', 'World Eater', 'Star Eater'];
  for (const s of mine) {
    if (s.b.has('Space Station') && !s.gw && !sws.some(w => s.b.has(w)) && f.gold > 1500 && Math.random() < 0.08) {
      const w = S.apoc > 85 ? 'Star Eater' : S.apoc > 75 ? 'World Eater' : 'World Devastators';
      const t = Math.ceil((GW[w].t || 8) / 2); // the Wraith-Admirals remember how — half the time
      s.gw = {
        n: w,
        left: t,
        tot: t,
        f: f.id
      };
      f.gold -= 1500;
      log(`🌑 The Forgotten Fleet begins raising a ${w} at ${s.name}.`);
    }
    const w = sws.find(x => s.b.has(x));
    const tg = s.links.filter(t => t.owner !== f.id && (t.owner >= 0 || t.legions > 0));
    if (w && tg.length && Math.random() < 0.3) {
      const t = tg.sort((a, b) => (b.owner === 1) - (a.owner === 1) || (b.owner === P) - (a.owner === P) || b.income - a.income)[0];
      const victim = t.owner;
      s.b.delete(w);
      superweapon(w, t, f.id, s);
      log(`☄ The Forgotten Fleet fires its ${w} at ${t.name}!`);
      if (victim === P || inSight(t)) await notify(`<h3>☄ ${w} Fired</h3>The Forgotten Fleet unleashes the ${w} from ${s.name} upon <b>${t.name}</b>${victim >= 0 ? ` (${F[victim].name})` : ''}.`);
    }
  }
}
// Omens: the galaxy is warned as the Forgotten Fleet stirs (tiers at 45 / 55 / 65 Apocalypse)
async function ffOmens() {
  if (!F.some(f => f.mods.ff && f.dormant)) return;
  S.ffOmen = S.ffOmen || 0;
  const tier = FF_OMENS.reduce((t, o, i) => S.apoc >= o[0] ? i + 1 : t, 0);
  if (tier > S.ffOmen) {
    S.ffOmen = tier;
    const m = rnd(FF_OMENS[tier - 1][1]);
    log(m);
    if (tier === 3) await notify(`<h3>🌑 The Nightfleet's Warning</h3>${m}<br><br><i>"Whatever sleeps beyond the rim is waking. If the galaxy keeps sinning, it will come."</i><br><small>Apocalypse ${Math.floor(S.apoc)} — at 100 the Forgotten Fleet wakes.</small>`);else toast(m, false);
  } else if (tier && Math.random() < 0.2) log(rnd(FF_OMENS[tier - 1][1]));
  if (tier < S.ffOmen && S.apoc < FF_OMENS[S.ffOmen - 1][0] - 10) S.ffOmen = tier; // calm years reset the warnings
}
async function apocEvents() {
  F.forEach(f => {
    if (f.tech) f.tech = f.tech.map(t => t === 'Holtzman Shield' || t === 'Aegis Field' ? 'Aether Shield' : t);
  }); // old saves
  await ffOmens();
  if (S.apoc >= 100) {
    // The Cataclysm: the Forgotten Fleet wakes if it still sleeps, otherwise its shadow-yards pour out a second armada
    const ff = F.find(f => f.mods.ff);
    if (ff?.dormant) await awakenFF();else if (ff?.alive) {
      const mine = systems.filter(s => s.owner === ff.id),
        lords = [ff.ruler, ...(ff.heirs || [])].filter(c => c && !c.dead && !units.some(u => u.general === c) && !systems.some(s => s.general === c));
      if (mine.length) for (let i = 0; i < 3; i++) addUnit({
        type: 'fleet',
        owner: ff.id,
        sys: rnd(mine),
        fleet: 12,
        legions: 8,
        elite: 4,
        general: lords[i] || null,
        mp: 2,
        ro: {
          ghostDreadnought: 3
        }
      });
      await notify('<h3>☢ THE CATACLYSM</h3>The galaxy\'s sins tear the dark wide open. From the shadow-yards of the Forgotten Fleet a second armada of black dreadnoughts rises.');
    }
    S.apoc = 60;
    return;
  }
  // No random apocalypse events: the only reckoning is the Forgotten Fleet at 100
}

// ================= Economy / politics =================
// ---- Planet geography & resources (deterministic per world, derived from its name) ----
// Internal keys stay stable for saves; display names can be renamed in God Mode (stored in S.resN).
// Resources are shown as plain names with a small colour swatch — no emoji or icon art.
const RES = {
  fuel: {
    n: 'Voidfuel',
    col: '#6a8cff',
    v: 30
  },
  bacta: {
    n: 'Mendgel',
    col: '#40e0c0',
    v: 25
  },
  kyber: {
    n: 'Starglass',
    col: '#b8f0ff',
    v: 40
  },
  tibanna: {
    n: 'Aether Gas',
    col: '#c0b0ff',
    v: 30
  },
  spice: {
    n: 'Spice',
    col: '#ff9a30',
    v: 45
  },
  food: {
    n: 'Food',
    col: '#9ad050',
    v: 15
  },
  ore: {
    n: 'Ore',
    col: '#a08870',
    v: 20
  },
  plasma: {
    n: 'Plasma',
    col: '#ff5040',
    v: 25
  }
};
// `ic` is a colour swatch; where it was shown alone, the name is shown with it so the resource is readable
for (const [k, r] of Object.entries(RES)) Object.defineProperty(r, 'ic', {
  get() {
    return `<img class="rico" src="assets/res-${RES_IMG[k]}.webp" alt="" title="${r.n}">`;
  }
});
const resTag = k => `<span class="rtag">${RES[k].ic}${RES[k].n}</span>`;
const RES_DEF = Object.fromEntries(Object.entries(RES).map(([k, r]) => [k, r.n]));
function applyResNames() {
  for (const k in RES) RES[k].n = S.resN?.[k] || RES_DEF[k];
}
const TERR = {
  Settlement: '#ffffff',
  Plains: '#8bc06a',
  Wasteland: '#a89060',
  Mountains: '#d08a60',
  Jungle: '#2f7a3a',
  Ocean: '#3a7ad0',
  Ice: '#d8eef8',
  Dunes: '#e0c070',
  Lava: '#d04020',
  Clouds: '#c0a0d8',
  Cityscape: '#8890a0',
  Crystal: '#80f0ff'
};
const PTYPES = [{
  n: 'Garden World',
  t: {
    Plains: 5,
    Jungle: 2,
    Ocean: 3,
    Mountains: 1
  },
  fert: [3, 5],
  res: ['food', 'bacta', 'ore']
}, {
  n: 'Desert World',
  t: {
    Dunes: 6,
    Wasteland: 2,
    Mountains: 2
  },
  fert: [0, 2],
  res: ['spice', 'fuel', 'kyber']
}, {
  n: 'Ocean World',
  t: {
    Ocean: 8,
    Plains: 1,
    Jungle: 1
  },
  fert: [2, 4],
  res: ['food', 'bacta', 'plasma']
}, {
  n: 'Jungle World',
  t: {
    Jungle: 6,
    Plains: 2,
    Ocean: 2
  },
  fert: [3, 5],
  res: ['bacta', 'food', 'kyber']
}, {
  n: 'Ice World',
  t: {
    Ice: 7,
    Mountains: 2,
    Ocean: 1
  },
  fert: [0, 2],
  res: ['kyber', 'ore', 'fuel']
}, {
  n: 'Volcanic World',
  t: {
    Lava: 4,
    Wasteland: 3,
    Mountains: 3
  },
  fert: [0, 1],
  res: ['plasma', 'ore', 'fuel']
}, {
  n: 'Gas Giant',
  t: {
    Clouds: 9,
    Lava: 1
  },
  fert: [0, 1],
  res: ['tibanna', 'fuel', 'plasma']
}, {
  n: 'Ecumenopolis',
  t: {
    Cityscape: 9,
    Ocean: 1
  },
  fert: [0, 1],
  res: ['plasma', 'bacta', 'ore']
}, {
  n: 'Crystal World',
  t: {
    Crystal: 5,
    Wasteland: 3,
    Ice: 2
  },
  fert: [0, 2],
  res: ['kyber', 'plasma', 'ore']
}];
// Native warriors only arise where their world can breed them (Sand Wyrm Riders: desert worlds only)
const specFits = (k, s) => !SPEC_FIT[k] || SPEC_FIT[k].includes(geo(s).type);
function fixSpec(s) {
  if (!s.spec || specFits(s.spec, s)) return;
  const ok = PLANET_SPECIALS.filter(k => specFits(k, s));
  s.spec = ok.length ? ok[Math.floor(Math.random() * ok.length)] : null;
}
function geo(s) {
  if (s._geo) return s._geo;
  let h = 7;
  for (const ch of s.name + s.i + (s.gseed ? '#' + s.gseed : '')) h = h * 31 + ch.charCodeAt(0) | 0;
  const R = () => {
    h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const T0 = PTYPES[Math.floor(R() * PTYPES.length)],
    T = s.ptype && PTYPES.find(p => p.n === s.ptype) || T0;
  const fert = T.fert[0] + Math.floor(R() * (T.fert[1] - T.fert[0] + 1));
  const res = [T.res[0]];
  if (R() < 0.55) res.push(T.res[1 + Math.floor(R() * 2)]);
  const W = 16,
    H = 11,
    cells = [],
    tk = Object.entries(T.t),
    tot = tk.reduce((a, [, w]) => a + w, 0);
  const pick = () => {
    let r = R() * tot;
    for (const [k, w] of tk) if ((r -= w) < 0) return k;
    return tk[0][0];
  };
  const coarse = {};
  let size = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - W / 2 + 0.5) / (W / 2),
      dy = (y - H / 2 + 0.5) / (H / 2);
    if (dx * dx + dy * dy > 0.75 + R() * 0.35) {
      cells.push(null);
      continue;
    }
    const ck = (x >> 1) + ',' + (y >> 1);
    cells.push(R() < 0.75 ? coarse[ck] ||= pick() : pick());
    size++;
  }
  cells[Math.floor(H / 2) * W + Math.floor(W / 2)] = 'Settlement';
  const rprop = {},
    others = RELS.filter(r => r !== s.rel);
  const a = Math.floor(R() * others.length),
    b = (a + 1 + Math.floor(R() * (others.length - 1))) % others.length;
  return s._geo = {
    type: T.n,
    fert,
    res,
    cells,
    W,
    H,
    size,
    minor: [others[a], others[b]],
    split: 0.3 + R() * 0.5
  };
}
const resInc = s => Math.round(geo(s).res.reduce((t, r) => t + RES[r].v * (s.b.has('Mine') && (r === 'ore' || r === 'kyber') ? 2 : 1) * (r === 'spice' && s.owner >= 0 && F[s.owner]?.mods?.spice ? 1.5 : 1), 0) * 0.6 * (s.order >= 3 ? 1 : 0.5));
const tradePartners = s => s.owner < 0 || s.siege || s.quar ? [] : s.links.filter(l => l.owner >= 0 && !l.siege && !l.quar && (l.owner === s.owner || !atWar(l.owner, s.owner))).map(l => {
  const goods = geo(l).res;
  return {
    l,
    goods,
    v: Math.round(goods.reduce((t, r) => t + RES[r].v, 0) * 0.25 * (s.b.has('Market') ? 1.5 : 1))
  };
});
const tradeInc = s => tradePartners(s).reduce((t, p) => t + p.v, 0);
// ---- Governor policies: a governor must be present to enforce one. inc = income multiplier ----
const POL = {
  Balanced: {
    ic: '⚖',
    d: 'No special edicts.',
    inc: 1,
    ord: 0,
    gro: 0,
    say: ['We will rule with a steady hand.']
  },
  Taxation: {
    ic: '💰',
    d: '+15% income, −2 order, −0.3 growth.',
    inc: 1.15,
    ord: -2,
    gro: -0.3,
    say: ['Squeeze them. Every credit counts.', 'The tax collectors are already dispatched.']
  },
  'Martial Law': {
    ic: '🛡',
    d: '+2 order, −10% income, −0.5 growth.',
    inc: 0.9,
    ord: 2,
    gro: -0.5,
    say: ['Curfew at dusk. Troopers on every corner.', 'Order will be kept — one way or another.']
  },
  Growth: {
    ic: '🌱',
    d: '+1 growth, −10% income.',
    inc: 0.9,
    ord: 0,
    gro: 1,
    say: ['Open the granaries. Let the cities swell.', 'More people, more power.']
  },
  Conscription: {
    ic: '⚔',
    d: '+1 legion every year (to 8), −1 order, −15% income, −0.5 growth.',
    inc: 0.85,
    ord: -1,
    gro: -0.5,
    say: ['Every able body to the barracks!', 'They will march whether they like it or not.']
  },
  Faith: {
    ic: '✝',
    d: '+1 order; slowly converts the people to your faith; −10% income.',
    inc: 0.9,
    ord: 1,
    gro: 0,
    say: ['Build the shrines. Let the faithful sing.', 'The heretics will see the Light.']
  },
  // ---- House edicts: only one house may proclaim each. Pros and cons follow what the house actually is. ----
  Penitence: {
    only: [0],
    ic: '🕯',
    d: 'Fasting and confession: +2 order; Armageddon eases. −15% income, −0.5 growth.',
    inc: 0.85,
    ord: 2,
    gro: -0.5,
    apoc: -0.2,
    say: ['Let them kneel, and be cleansed.']
  },
  'Iron Discipline': {
    only: [1],
    fear: 1,
    ic: '⛓',
    d: 'Convicts obey the lash: +3 order if the governor is DREADED, −1 if not. −5% income.',
    inc: 0.95,
    ord: 3,
    gro: 0,
    say: ['Break one, and the rest will march.', 'Fear keeps the rim standing.']
  },
  'Penal Levy': {
    only: [1],
    leg: 1,
    ic: '🪓',
    d: 'Every convict holds a rifle: +1 legion yearly (to 8). −1 order, −0.5 growth.',
    inc: 1,
    ord: -1,
    gro: -0.5,
    say: ['Thieves and murderers — and now soldiers.']
  },
  'Plunder Charter': {
    only: [2, 17, 20],
    ic: '🏴',
    d: 'Letters of marque for every cutthroat: +30% income, −2 order, −0.5 growth.',
    inc: 1.3,
    ord: -2,
    gro: -0.5,
    say: ['Take what the stars offer!']
  },
  'Spice Monopoly': {
    only: [3],
    ic: '✨',
    d: 'Cartel prices: +25% income, −1 order (addiction spreads).',
    inc: 1.25,
    ord: -1,
    gro: 0,
    say: ['The spice must flow — at our price.']
  },
  'Lane Tolls': {
    only: [4],
    ic: '🛣',
    d: 'Tax every jump: +20% income, −0.3 growth (traders avoid us).',
    inc: 1.2,
    ord: 0,
    gro: -0.3,
    say: ['Nothing moves without paying the Guild.']
  },
  'Debt Bondage': {
    only: [5],
    ic: '🩸',
    d: 'Every citizen owes: +25% income, −2 order. Armageddon creeps.',
    inc: 1.25,
    ord: -2,
    gro: 0,
    apoc: 0.2,
    say: ['Their children will be paying it off.']
  },
  'Vat Quotas': {
    only: [6],
    leg: 1,
    ic: '🧬',
    d: 'Run the vats day and night: +1 clone legion yearly (to 8). −0.5 growth.',
    inc: 1,
    ord: 0,
    gro: -0.5,
    say: ['Decant the next batch.']
  },
  'Slave Markets': {
    only: [7],
    ic: '⛓',
    d: 'Open auctions: +30% income, −2 order, Armageddon creeps; the Nameless frown.',
    inc: 1.3,
    ord: -2,
    gro: 0,
    apoc: 0.3,
    say: ['Fresh stock from the rim!']
  },
  'Census & Forms': {
    only: [8],
    ic: '📋',
    d: 'Total bureaucracy: +2 order, −15% income.',
    inc: 0.85,
    ord: 2,
    gro: 0,
    say: ['Form 27-B, in triplicate.']
  },
  Optimization: {
    only: [9],
    ic: '🤖',
    d: 'Machine efficiency: +15% income, +0.5 growth, −1 order (organics resent it).',
    inc: 1.15,
    ord: -1,
    gro: 0.5,
    say: ['Inefficiency detected. Correcting.']
  },
  Liberation: {
    only: [10],
    ic: '🕊',
    d: 'Free men fight harder: +1 order, +0.5 growth, +1 legion every other year. −15% income.',
    inc: 0.85,
    ord: 1,
    gro: 0.5,
    leg: 0.5,
    say: ['No chains on this world.']
  },
  'Warband Levy': {
    only: [11, 19],
    leg: 1,
    ic: '🔥',
    d: 'Every clan sends its sons: +1 legion yearly (to 8). −20% income.',
    inc: 0.8,
    ord: 0,
    gro: 0,
    say: ['The clans answer!']
  },
  'Upgrade Mandate': {
    only: [12],
    ic: '⚙',
    d: 'Mandatory cybernetics: +1 order, +5% income, −1 growth.',
    inc: 1.05,
    ord: 1,
    gro: -1,
    say: ['Flesh is weak. Steel obeys.']
  },
  'Coven Rites': {
    only: [13],
    ic: '🔮',
    d: 'Moon-rites and dread: +2 order, −10% income.',
    inc: 0.9,
    ord: 2,
    gro: 0,
    say: ['The sisters are watching.']
  },
  'Free Assembly': {
    only: [14],
    ic: '🗳',
    d: 'Self-rule: +1 order, +10% income; the governor grows ambitious (−loyalty).',
    inc: 1.1,
    ord: 1,
    gro: 0,
    say: ['Let the people speak.']
  },
  'Reign of Terror': {
    only: [15],
    fear: 1,
    ic: '🌑',
    d: 'Fear and pain: +3 order if the governor is DREADED, −1 if not. −0.5 growth; Armageddon creeps.',
    inc: 1,
    ord: 3,
    gro: -0.5,
    apoc: 0.2,
    say: ['Let them feel the Dark.']
  },
  Vigil: {
    only: [16],
    ic: '⚖',
    d: 'Gray balance: +1 order, +0.5 growth, −10% income.',
    inc: 0.9,
    ord: 1,
    gro: 0.5,
    say: ['Neither light nor dark. Only watchfulness.']
  }
};
const polKeys = fid => Object.keys(POL).filter(k => !POL[k].only || POL[k].only.includes(fid));
const feared = g => (g?.respect ?? 0) < 0;
const polOrd = (p, s) => p.fear ? feared(s.general) ? p.ord : -1 : p.ord;
// ---- House buildings: one signature building per house ----
const FBLD = {
  0: ['Cloister', 220, '+1 order; trains a Nameless Monk (elite) 1 year in 3'],
  1: ['Penal Colony', 180, '+1 legion yearly; −1 order unless the governor is dreaded'],
  2: ['Corsair Haven', 200, '+1 ship yearly; +20 income; −1 order'],
  3: ['Spice Refinery', 260, '+40 income (+80 on a spice world)'],
  4: ['Jump Beacon', 250, '+30 income; ships built here are cheaper'],
  5: ['Counting House', 250, '+50 income'],
  6: ['Cloning Vats', 220, '+2 clone legions yearly'],
  7: ['Slave Pens', 200, '+40 income; −1 order; Armageddon creeps'],
  8: ['Bureau Office', 200, '+2 order'],
  9: ['Fabricator', 240, '+1 AI legion yearly; +20 income'],
  10: ['Freedom Hall', 200, '+1 order; +1 legion yearly'],
  11: ['War Pit', 200, '+1 elite warrior every other year; +1 order'],
  12: ['Augment Clinic', 220, '+1 order; the governor may gain cybernetics'],
  13: ['Coven Spire', 220, '+2 order; +1 elite every third year'],
  14: ['Assembly Hall', 200, '+1 order; +20 income'],
  15: ['Dark Shrine', 200, '+1 elite zealot every other year; −1 order; Armageddon creeps'],
  16: ['Gray Sanctum', 220, '+1 order; +1 elite every third year']
};
const FB = {
  Cloister: {
    ord: 1,
    eli: 0.33
  },
  'Penal Colony': {
    leg: 1,
    fearOrd: -1
  },
  'Corsair Haven': {
    flt: 1,
    inc: 20,
    ord: -1
  },
  'Spice Refinery': {
    inc: 40,
    spice: 40
  },
  'Jump Beacon': {
    inc: 30
  },
  'Counting House': {
    inc: 50
  },
  'Cloning Vats': {
    leg: 2
  },
  'Slave Pens': {
    inc: 40,
    ord: -1,
    apoc: 0.2
  },
  'Bureau Office': {
    ord: 2
  },
  Fabricator: {
    leg: 1,
    inc: 20
  },
  'Freedom Hall': {
    ord: 1,
    leg: 1
  },
  'War Pit': {
    ord: 1,
    eli: 0.5
  },
  'Augment Clinic': {
    ord: 1,
    cyber: 1
  },
  'Coven Spire': {
    ord: 2,
    eli: 0.33
  },
  'Assembly Hall': {
    ord: 1,
    inc: 20
  },
  'Dark Shrine': {
    ord: -1,
    eli: 0.5,
    apoc: 0.2
  },
  'Gray Sanctum': {
    ord: 1,
    eli: 0.33
  }
};
const fbOf = s => Object.keys(FB).filter(n => s.b.has(n));
// Yearly effects of house buildings and edicts
function factionYear() {
  // While the Forgotten Fleet walks, the Nameless open their armoury: one more commander is armed with a Starblade each year
  if (F[0]?.alive && F.some(f => f?.alive && f.mods?.ff && !f.dormant)) {
    const g = [F[0].ruler, ...units.filter(u => u.owner === 0).map(u => u.general), ...systems.filter(s => s.owner === 0).map(s => s.general)].find(x => x && !x.dead && !x.starblade);
    if (g) {
      g.starblade = true;
      g.skill += 2;
      hist(g, 'is armed from the Nameless armoury against the Forgotten Fleet.');
    }
  }
  for (const s of holyWorlds()) {
    if (s.owner < 0) continue;
    const hf = HOLY[s.holy][1],
      r = F[s.owner].rel;
    if (r === 'Order' && hf !== 'Zithari') st(s.owner, 1);
    if (r !== 'Order' && hf !== 'Zithari') st(s.owner, -1); // the faithful will not forgive a heathen on holy ground
    if (r === 'Zithari' && hf !== 'Order') {
      grudge(15, s.owner, 2, `keeping ${HOLY[s.holy][0]} for the Dark`);
      apoc(0.5);
    }
  }
  for (const s of systems) {
    if (s.owner < 0) continue;
    const p = POL[polOf(s)];
    if (p.leg && s.legions < 8 && Math.random() < p.leg) s.legions++;
    if (p.apoc) apoc(p.apoc);
    if (polOf(s) === 'Free Assembly' && s.general && Math.random() < 0.3) s.general.loyalty = Math.max(0, s.general.loyalty - 1);
    if (polOf(s) === 'Slave Markets' && Math.random() < 0.5) st(s.owner, -1);
    for (const n of fbOf(s)) {
      const e = FB[n];
      if (e.leg) s.legions += e.leg;
      if (e.flt) s.fleet += e.flt;
      if (e.eli && Math.random() < e.eli) s.elite++;
      if (e.apoc) apoc(e.apoc);
      if (e.cyber && s.general && Math.random() < 0.2 && !has(s.general, 'Cybernetic Arm')) addTrait(s.general, 'Cybernetic Arm', true);
    }
  }
}
function polOf(s) {
  if (s.owner < 0 || !s.general || s.general.dead) return 'Balanced';
  if (isHuman(s.owner)) return POL[s.pol] && polKeys(s.owner).includes(s.pol) ? s.pol : 'Balanced';
  const f = F[s.owner]; // AI governors pick what the world needs
  const own = polKeys(f.id).find(k => POL[k].only);
  if (own && POL[own].fear && feared(s.general) && s.order <= 6) return own;
  if (s.order <= 3) return 'Martial Law';
  if (own && s.order >= 5 && POL[own].ord >= -1 && (s.i + f.id) % 2 === 0) return own;
  if (f.rel !== 'Mixed' && s.rel !== f.rel) return 'Faith';
  if (s.legions < 3 && S.war.size && [...S.war].some(k => k.split('|').includes(String(f.id)))) return 'Conscription';
  return s.order >= 7 ? 'Taxation' : 'Growth';
}
async function policyMenu(s) {
  const cur = polOf(s);
  const ks = polKeys(s.owner);
  const r = await ask(`<h3>📜 Edicts of ${s.name}</h3>${s.general ? `${cl(s.general)} awaits your decree.` : ''}<div class="scroll" style="max-height:34vh">${ks.map(k => [k, POL[k]]).map(([k, p]) => `<div>${p.ic} <b>${k}</b>${p.only ? ' <small style="color:#fc6">house edict</small>' : ''}${k === cur ? ' ✅' : ''}<br><small>${p.d}</small></div>`).join('')}</div>`, [...ks.map(k => `${POL[k].ic} ${k}`), 'Cancel']);
  const k = Object.keys(POL).find(x => r === `${POL[x].ic} ${x}`);
  if (!k || k === cur) return;
  s.pol = k;
  try {
    wikiEdict(s, k, s.general);
  } catch (e) {}
  s.general.hist.push(`Y${S.year}: proclaims ${k === 'Balanced' ? 'an end to special edicts' : k.toLowerCase() + (k === 'Martial Law' ? '' : ' edicts')} on ${s.name}.`);
  if (k !== 'Balanced') log(`📜 ${cl(s.general)} proclaims ${k} on ${s.name}.`);
  // Governor's response, coloured by temperament
  const g = s.general;
  const line = k === 'Martial Law' && has(g, 'Merciful') ? 'Must we? ...As you command.' : k === 'Taxation' && has(g, 'Just') ? 'The people will suffer, but I obey.' : k === 'Faith' && has(g, 'Godless') ? 'Shrines? Fine. I\'ll pretend to pray.' : rnd(POL[k].say);
  say(g, 's', line);
}
function orderFactors(s) {
  const f = F[s.owner],
    nm = s.owner === 1,
    L = [['🏛 Base', 5]];
  if (f?.mods?.bureau) L.push(['📋 Bureaucracy', 1]);
  if (f?.mods?.elect && s.general) L.push(['🗳 Self-rule', 1]);
  if (f?.mods?.upgrade && (has(s.general, 'Cyborg') || has(s.general, 'Cybernetic Arm'))) L.push(['⚙ Upgraded governor', 1]);
  if (f?.mods?.coven && s.general && F[s.owner]?.ruler?.wm) L.push(['🔮 Fear of the Witch-Queen', 1]);
  if (S.apoc >= 50) L.push([S.apoc >= 75 ? '☢ The End Times' : '☢ Dread of the Apocalypse', S.apoc >= 75 ? -2 : -1]);
  const pol = POL[polOf(s)],
    po = polOrd(pol, s);
  if (po) L.push([`${pol.ic} Policy: ${polOf(s)}${pol.fear ? feared(s.general) ? ' (dreaded)' : ' (not feared)' : ''}`, po]);
  if (s.b.has('Temple')) L.push([`⛪ ${bName(s, 'Temple')}`, 1 + bLv(s, 'Temple')]);
  if (s.plague) {
    const pd = has(s.general, 'Plague Doctor'),
      hl = hospLv(s);
    L.push([`☠ Plague${pd ? ' (Plague Doctor)' : ''}${hl ? ` (${bName(s, 'Hospice')})` : ''}`, -Math.max(0, 2 - (pd ? 1 : 0) - (hl >= 2 ? 1 : 0))]);
  }
  if (s.quar) L.push(['🚧 Quarantine', -1]);
  if (hospLv(s) >= 4) L.push(['⚕ Grand Infirmary', 1]);
  if (s.holy != null) {
    const hf = HOLY[s.holy][1],
      ok = f && (hf === 'both' ? ['Order', 'Zithari'].includes(f.rel) : f.rel === hf);
    L.push([ok ? `🕍 Holy world of the faith` : '🕍 Pilgrims resent their masters', ok ? 2 : -1]);
  }
  fbOf(s).forEach(n => {
    const e = FB[n],
      v = (e.ord || 0) + (e.fearOrd && !feared(s.general) ? e.fearOrd : 0);
    if (v) L.push([`🏛 ${n}`, v]);
  });
  if (s.b.has('Brothel')) L.push([`🍷 Happiness (${bName(s, 'Brothel')})`, bLv(s, 'Brothel')]);
  if (s.general && has(s.general, 'Generous')) L.push(['🎁 Generous governor', 1]);
  if (s.general && has(s.general, 'Zealot') && F[s.owner]) L.push([s.rel === F[s.owner].rel ? '🔥 Zealous governor' : '🔥 Zealot persecutes the faithless', s.rel === F[s.owner].rel ? 1 : -2]);
  const gar = Math.min(3, Math.floor(s.legions / 2));
  if (gar) L.push(['🛡 Garrison', gar]);
  if (geo(s).res.includes('food')) L.push(['🌾 Well fed', 1]);
  if (geo(s).res.includes('bacta')) L.push([`💉 Health (${RES.bacta.n})`, 1]);
  if (geo(s).res.includes('spice')) L.push(['✨ Spice addiction', -1]);
  if (nm) L.push(['⛓ Convicts & outcasts', -2]);else if (f && s.rel !== f.rel) L.push(['✝ Foreign faith', -2]);
  if (s.recent) L.push(['⚔ Recently conquered', -2]);
  if (s.income > 180) L.push(['🏚 Squalor', -Math.min(3, Math.floor((s.income - 120) / 60))]);
  if (s.general) {
    const g = s.general,
      r = g.respect;
    // On the Wall, fear rules: a dreaded governor keeps convicts in line far better; a gentle one is mocked
    let v = r < 0 ? nm ? Math.min(6, Math.ceil(-r / 2) + 2) : Math.min(4, Math.ceil(-r / 2)) : nm ? -1 - Math.min(2, Math.floor(r / 4)) : Math.min(2, Math.floor(r / 4));
    if (f && f.rel === s.rel && (g.piety || 0) >= 8) v += 1; // a devout governor is loved by his own faithful
    if (s.rel === 'Order' && has(g, 'Godless')) v -= 1;
    v += Math.min(2, Math.floor((g.admin || 0) / 5)) + (has(g, 'Just') ? 1 : 0) + (has(g, 'Nameless Confessor') ? 1 : 0) - (has(g, 'Drunkard') ? 1 : 0);
    if (v) L.push(["📜 Governor's influence", v]);
  }
  if (S.sanct.includes(s.owner) && s.rel === 'Order') L.push(['⚖ Sanctions', -2]);
  if (S.exco?.includes(s.owner) && s.rel === 'Order') L.push(['🔥 Excommunicated', -3]);
  if (s.interdict > 0) L.push(['⛔ Interdict', -3]);
  const ac = units.filter(u => u.sys === s && u.role === 'Acolyte').length;
  if (ac) L.push(['🕯 Dark Acolytes', -ac]);
  return L;
}
function growthFactors(s) {
  const G = geo(s),
    L = [['🌱 Local soil quality', G.fert * 0.5]];
  const pg = POL[polOf(s)];
  if (pg.gro) L.push([`${pg.ic} Policy: ${polOf(s)}`, pg.gro]);
  if (G.res.includes('food')) L.push(['🌾 Food production', 1]);
  if (G.res.includes('bacta')) L.push(['💉 Health', 0.5]);
  if (s.b.has('Temple') || s.b.has('Brothel')) L.push(['🏛 Social buildings', 0.25 + 0.25 * (bLv(s, 'Temple') + bLv(s, 'Brothel'))]);
  if (s.plague) L.push(['☠ Plague deaths', hospLv(s) ? -3 + 0.5 * hospLv(s) : -3]);
  if (hospLv(s)) L.push(['⚕ Hospice', 0.25 * hospLv(s)]);
  if (s.b.has('Terraforming')) L.push(['🌍 Terraforming', 1.5]);
  if (s.order >= 7) L.push(['🕊 Prosperity', 0.5]);
  L.push(['🏚 Squalor', -Math.round(s.income / 60) * 0.5]);
  if (s.siege) L.push(['⛓ Blockade', -2]);
  return L;
}
const sumF = L => L.reduce((t, [, v]) => t + v, 0);
async function planetView(s) {
  let tab = 'map';
  const T = {
    '🗺 Region': 'map',
    '⚖ Economy': 'eco',
    '🌱 Growth': 'grow',
    '⛪ Order': 'ord'
  };
  const sg = v => (v > 0 ? '+' : '') + v;
  const row = (a, b, c = '') => `<tr><td>${a}</td><td style="text-align:center">${c}</td><td style="text-align:right">${b}</td></tr>`;
  const tbl = r => `<table style="width:100%;border-collapse:collapse;font-size:13px">${r}</table>`;
  for (;;) {
    const G = geo(s),
      own = s.owner === P;
    let h = `<h3>🔎 ${s.name}</h3><small>${G.type} · ${s.owner < 0 ? 'Independent' : F[s.owner].name}</small><hr>`;
    if (tab === 'map') {
      const px = 12;
      let svg = `<svg viewBox="0 0 ${G.W * px} ${G.H * px}" style="width:100%;max-width:240px;background:#0a0f1c;border:1px solid #c9a24a;border-radius:4px">`;
      G.cells.forEach((c, i) => {
        if (c) svg += `<rect x="${i % G.W * px}" y="${Math.floor(i / G.W) * px}" width="${px - 1}" height="${px - 1}" fill="${TERR[c]}"/>`;
      });
      svg += '</svg>';
      const used = [...new Set(G.cells.filter(Boolean))];
      h += `<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">${svg}<div><b>Legend</b><br>${used.map(k => `<span style="display:inline-block;width:10px;height:10px;background:${TERR[k]};border:1px solid #000"></span> ${k}`).join('<br>')}</div></div>
        <p><b>Region Info</b><br>Region size: ${G.size}<br>Soil quality: ${G.fert}/5<br>Population: ${(s.income / 20).toFixed(1)} billion<br>Resources: ${G.res.map(resTag).join(' ')}<br>Buildings: ${bL(s)}</p>`;
    } else if (tab === 'eco') {
      const base = Math.round(s.income * (0.4 + s.order * 0.07)),
        tp = tradePartners(s);
      let r = `<tr><th style="text-align:left">Trade (imports & exports)</th><th>Goods</th><th></th></tr>`;
      tp.forEach(p => r += row(`🚀 ${p.l.name}`, p.v, p.goods.map(resTag).join(' ')));
      if (!tp.length) r += row('<small>No peaceful trade partners</small>', 0);
      r += row('<b>Total trade income</b>', `<b>${tradeInc(s)}</b>`);
      r += `<tr><th style="text-align:left;padding-top:8px">Other income</th><th></th><th></th></tr>`;
      r += row('💰 Taxes', base) + row(`⛏ Resource extraction`, resInc(s), G.res.map(resTag).join(' '));
      if (s.b.has('Market')) {
        const ml = bLv(s, 'Market');
        r += row(`🏪 ${bName(s, 'Market')} (+${15 + 15 * ml}% taxes)`, Math.round(base * (0.15 + 0.15 * ml)));
      }
      if (s.b.has('Mine')) r += row(`⛏ ${bName(s, 'Mine')}`, 60 * bLv(s, 'Mine'));
      if (s.b.has('Brothel')) r += row(`🍷 ${bName(s, 'Brothel')}`, 20 * bLv(s, 'Brothel'));
      if (s.plague) r += row('☠ Plague (−25%)', '—');
      if (s.b.has('Space Station')) r += row('🛰 Space Station', 40);
      const tr = units.filter(u => u.sys === s && u.role === 'Trader' && u.post === s.i);
      tr.forEach(u => r += row(`💰 Trader of ${F[u.owner].name}`, tradeVal(u)));
      const cutOff = s.owner >= 0 && !supplyNet(s.owner).has(s.i),
        gr = s.general && s.general.f === s.owner ? graftRate(s.general) : 0;
      h += tbl(r) + `<small>${s.siege ? '⛓ Blockaded: all income lost. ' : ''}${cutOff ? `✂ <b>Cut off</b> from the capital: only ${Math.round(CUT_MUL * 100)}% of income arrives. ` : ''}${gr && (own || S.godSee) ? `🕳 ${s.general.name} skims about ${Math.round(gr * 100)}% (${Math.round(s.general.graft || 0)} hoarded so far). ` : ''}Before faction and governor modifiers.</small>`;
    } else if (tab === 'grow') {
      const L = growthFactors(s),
        g = sumF(L);
      h += tbl(`<tr><th style="text-align:left">Factors</th><th></th><th style="text-align:right">Effects</th></tr>` + L.map(([a, v]) => row(a, `<span style="color:${v < 0 ? '#f88' : '#8f8'}">${sg(v)}%</span>`)).join('') + row('<b>Net growth / year</b>', `<b>${sg(g)}%</b>`));
    } else {
      const L = orderFactors(s),
        main = clamp(Math.round(55 + s.order * 4), 40, 98),
        rest = 100 - main,
        m1 = Math.round(rest * G.split);
      h += tbl(`<tr><th style="text-align:left">Factors</th><th></th><th style="text-align:right">Effect</th></tr>` + L.map(([a, v]) => row(a, `<span style="color:${v < 0 ? '#f88' : '#8f8'}">${sg(v)}</span>`)).join('') + row('<b>Public order</b>', `<b>${s.order}/10</b>`));
      h += `<p><b>Religion</b></p>` + tbl(row(`✝ ${s.rel}`, main + '%') + row(G.minor[0], m1 + '%') + row(G.minor[1], rest - m1 + '%'));
    }
    const k = Object.keys(T).find(x => T[x] === tab);
    const r = await ask(h, [...Object.keys(T).filter(x => x !== k), 'Close']);
    if (T[r]) tab = T[r];else break;
  }
}
const tradeVal = u => Math.round((10 + u.sys.income * 0.25 + geo(u.sys).res.reduce((t, r) => t + RES[r].v, 0) * 0.5) * (1 + u.char.skill * 0.08) * (u.sys.owner !== u.owner ? 1.5 : 1));
function economy() {
  for (const s of systems) {
    if (s.owner < 0) continue;
    const f = F[s.owner];
    if (s.b.has('Temple') && f.rel !== 'Mixed' && s.rel !== f.rel && Math.random() < 0.15 + 0.1 * bLv(s, 'Temple')) s.rel = f.rel;
    if (s.owner === 4 && Math.random() < 0.08) s.rel = rnd(s.links).rel;
    const pol = polOf(s);
    if (pol === 'Faith' && f.rel !== 'Mixed' && s.rel !== f.rel && Math.random() < 0.15) {
      s.rel = f.rel;
      s._geo = null;
      if (isHuman(s.owner)) log(`✝ The people of ${s.name} embrace ${f.rel}.`);
    }
    if (pol === 'Conscription' && s.legions < 8 && S.turn % 2 === 1) s.legions++;
    s.order = clamp(sumF(orderFactors(s)), 0, 10);
    // Population growth: % per year, applied half per turn
    s.gp = (s.gp || 0) + s.income * sumF(growthFactors(s)) / 200;
    if (Math.abs(s.gp) >= 1) {
      const d = Math.trunc(s.gp);
      s.income = clamp(s.income + d, 20, 400);
      s.gp -= d;
    }
    if (s.recent) s.recent--;
    // Only total breakdown of order risks revolt, and a strong garrison keeps a lid on it
    if (s.order <= 0 && Math.random() < 0.15 / (1 + (s.legions || 0) * 0.15)) {
      const prev = s.owner;
      Object.assign(s, {
        owner: -1,
        legions: 3,
        fleet: 1,
        general: null
      });
      log(`🔥 ${s.name} revolts against ${F[prev].name} and declares independence!`);
      checkDead(prev);
    }
  }
  for (const f of F) {
    if (!f.alive) continue;
    const m = f.mods;
    let inc = 0,
      up = 0;
    // Supply lines: worlds that can't reach the capital yield less; forces far from friendly worlds cost more
    const net = supplyNet(f.id),
      E = {
        worlds: 0,
        trade: 0,
        traders: 0,
        hyper: 0,
        slaves: 0,
        cut: 0,
        graft: 0,
        siege: 0,
        upW: 0,
        upU: 0,
        oos: 0
      };
    for (const s of systems) {
      if (s.owner !== f.id) continue;
      let v = s.income * (0.4 + s.order * 0.07);
      if (s.b.has('Market')) v *= 1.15 + 0.15 * bLv(s, 'Market');
      if (s.b.has('Mine')) v += 60 * bLv(s, 'Mine');
      if (s.b.has('Brothel')) v += 20 * bLv(s, 'Brothel');
      if (s.plague) v *= 0.75;
      if (m.prod) v *= m.prod;
      if (m.black) v += m.black;
      if (s.general && s.general.respect > 0 && f.id !== 1) v *= 1 + Math.min(ACAP, s.general.respect) * 0.02; // Respect: prosperity
      if (s.general) v *= (has(s.general, 'Builder') ? 1.15 : 1) * (has(s.general, 'Squanderer') ? 0.85 : 1) * (has(s.general, 'Bloodbank Accountant') ? 1.15 : 1) * (has(s.general, 'Master of Coin') ? 1.1 : 1) * (has(s.general, 'Greedy') ? 1.1 : 1) * (has(s.general, 'Generous') ? 0.9 : 1);
      if (m.poor) v *= 0.6;
      if (s.b.has('Terraforming')) v *= 1.5;
      if (s.b.has('Space Station')) v += 40;
      if (s.holy != null) v += 40; // pilgrims and tithes
      fbOf(s).forEach(n => {
        v += (FB[n].inc || 0) + (FB[n].spice && geo(s).res.includes('spice') ? FB[n].spice : 0);
      });
      if (f.id === 1 && s.general && feared(s.general)) v *= 1 + Math.min(ACAP, -s.general.respect) * 0.02; // the lash keeps convicts working
      v += resInc(s) + tradeInc(s) * (1 + Math.max(0, bLv(s, 'Market') - 1) * 0.1);
      if (s.links.some(l => l.owner >= 0 && l.owner !== f.id && F[l.owner].tech.includes('Blockades') && atWar(l.owner, f.id) && (l.fleet >= 4 || units.some(x => x.type === 'fleet' && x.sys === l && x.owner === l.owner && ships(x) >= 4)))) v *= 0.7;
      if (s.general) v *= 1 + Math.min(ACAP, s.general.admin || 0) * 0.025;
      v *= POL[polOf(s)].inc;
      const tr = tradeInc(s) * (1 + Math.max(0, bLv(s, 'Market') - 1) * 0.1) * POL[polOf(s)].inc;
      if (s.siege) {
        E.siege += v;
        v = 0;
      }
      if (v && !net.has(s.i)) {
        E.cut += v * (1 - CUT_MUL);
        v *= CUT_MUL;
      }
      // Graft: the governor skims by character (greed, low loyalty); it sits in his purse until auditors find it
      const gr = s.general && s.general.f === f.id && f.ruler !== s.general ? graftRate(s.general) : 0;
      if (gr && v > 0) {
        const sk = v * gr;
        s.general.graft = (s.general.graft || 0) + sk;
        E.graft += sk;
        v -= sk;
      }
      inc += v;
      const trv = Math.max(0, Math.min(v, tr));
      E.trade += trv;
      E.worlds += v - trv;
      const uw = s.fleet * (m.fleetUp ? 2 : 5) + s.legions * 3 + s.elite * 6 + (s.stn || 0) * 4 + Object.entries(s.ro || {}).reduce((t, [k, n]) => t + (UNITS[k]?.up || 3) * n, 0);
      up += uw;
      E.upW += uw;
    }
    units.forEach(u => {
      if (u.owner === f.id && u.role === 'Trader' && u.post === u.sys.i && !u.sys.siege) {
        const t = tradeVal(u);
        inc += t;
        E.traders += t;
      }
    });
    (S.hyper || []).forEach(([a, b]) => {
      const A = systems[a],
        B = systems[b];
      if (!A || !B) return;
      if ((A.owner === f.id || B.owner === f.id) && A.owner >= 0 && B.owner >= 0 && A.owner !== B.owner && !atWar(A.owner, B.owner)) {
        inc += 15;
        E.hyper += 15;
      }
    });
    units.forEach(u => {
      if (u.owner !== f.id) return;
      let c = u.fleet * (m.fleetUp ? 2 : 5) + u.legions * 3 + u.elite * 6 + (u.type === 'agent' ? 10 : 0) + Object.entries(u.ro || {}).reduce((t, [k, n]) => t + (UNITS[k]?.up || 3) * n, 0);
      if (u.type === 'fleet' && !inSupply(u, net)) {
        E.oos += c * (OOS_MUL - 1);
        c *= OOS_MUL;
      }
      up += c;
      E.upU += c;
    });
    const sl = (f.id === P ? S.slaves : isHuman(f.id) ? S.pp?.[f.id]?.slaves || 0 : 0) * 20; // hotseat: other humans' slaves
    inc += sl;
    E.slaves = sl;
    if (!isHuman(f.id)) up *= 0.5;
    if (isHuman(f.id)) {
      for (const k in E) E[k] = Math.round(E[k]);
      E.upU -= E.oos;
      f.eco = E;
    }
    f.net = Math.round(inc - up);
    f.gold += f.net;
    if (!isHuman(f.id)) f.gold = Math.max(0, f.gold);
  }
  if (F[P].gold < 0) {
    const s = systems.filter(x => x.owner === P).sort((a, b) => b.legions + b.fleet - a.legions - a.fleet)[0];
    if (s) {
      if (s.legions > 1) s.legions--;else if (s.fleet) s.fleet--;
      log('💸 Bankrupt! Unpaid troops desert.');
    }
  }
}
async function loansTick() {
  for (const l of [...S.loans]) {
    if (S.turn < l.due) continue;
    S.loans.splice(S.loans.indexOf(l), 1);
    const d = F[l.debtor];
    if (!d.alive || !F[5].alive) continue;
    let paid = false;
    if (l.debtor === P) {
      const c = await ask(`<h3>Loan Due</h3>The Bloodbank demands ${l.owe} credits.`, F[P].gold >= l.owe ? ['Repay', 'Default'] : ['Default']);
      if (c === 'Repay') {
        F[P].gold -= l.owe;
        F[5].gold += l.owe;
        paid = true;
        apoc(-1, 'debts honoured');
      }
    } else if (Math.random() < (d.gold >= l.owe ? 0.85 : 0.3) + persona(d.ruler).honor * 0.1) {
      d.gold -= l.owe;
      F[5].gold += l.owe;
      paid = true;
      log(`${d.name} repays its loan.`);
    }
    if (paid) grudge(5, l.debtor, 2);
    if (!paid) {
      const s = systems.find(x => x.owner === 5);
      if (s) {
        s.elite += 4;
        s.fleet += 6;
      }
      S.war.add(key(5, l.debtor));
      S.bank.collecting = 6;
      grudge(5, l.debtor, -10, 'a defaulted debt');
      // The Bank never forgets: it now holds a claim on the debtor's throne
      (S.bank.claims ??= {})[l.debtor] = true;
      log(`🩸 The Bloodbank now holds a claim on the throne of ${d.name}. When its ruler dies, the Bank will back a pretender.`);
      apoc(2, 'debt war');
      log(`🩸 Imperial Bloodknights march to collect ${d.name}'s debt!`);
      if (l.debtor === P) await notify('<h3>Bloodknights!</h3>You defaulted. The Bloodbank has sent Bloodknights to collect.');
    }
  }
  if (S.bank.collecting) S.bank.collecting--;
}
function bankTick() {
  const bb = F[5];
  if (!bb.alive || S.bank.gov === 'Blood Empire') return;
  const war = F.some(f => f.alive && f.id !== 5 && !hostile(f) && S.war.has(key(5, f.id))) || S.bank.collecting > 0;
  if (S.bank.gov === 'Republic' && war) {
    S.bank.gov = 'Dictatorship';
    S.bank.dict = 0;
    S.bank.peace = 0;
    log('🩸 The Bloodbank\'s General Consul seizes dictatorial power!');
  } else if (S.bank.gov === 'Dictatorship') {
    if (war) {
      S.bank.peace = 0;
      if (++S.bank.dict > 12) {
        S.bank.gov = 'Blood Empire';
        bb.bloodEmpire = true;
        bb.name = 'The Blood Empire';
        apoc(4, 'the Blood Empire rises');
        log(`🩸 After ${Math.ceil(S.bank.dict / 2)} years of war the Dictator crowns himself: the Bloodbank is now THE BLOOD EMPIRE!`);
        if (bb.ruler) hist(bb.ruler, 'is crowned Blood Emperor.');
      }
    } else if (++S.bank.peace > 8) {
      S.bank.gov = 'Republic';
      log('🗳 Revolution! The Bloodbank restores elected consuls.');
    }
  }
}
// ================= Ancient Holy Worlds: the only prizes of a Reclamation (Jerusalem, Constantinople, Mecca, Antioch…) =================
// Each site may rise in one of a few prefilled regions of the map (picked at random every new game)
function makeHolyWorld(i, s) {
  const [n, faith] = HOLY[i];
  s.holy = i;
  s.name = n;
  s.rel = faith === 'both' ? rnd(['Order', 'Zithari']) : faith;
  s.income = Math.max(s.income, 110);
  s.legions = Math.max(s.legions, 6);
  s.stn = Math.max(s.stn || 0, 1);
  s.b.add('Temple');
  s._geo = null;
}
// New games: holy worlds are born as independent shrine-systems in their regions (call before hyperlanes are linked)
function spawnHolyWorlds() {
  HOLY.forEach((h, i) => {
    const [x, z] = rnd(HOLY_AREAS[i]);
    makeHolyWorld(i, addSystem(x, z, 6, -1));
  });
}
// Old saves without holy worlds: consecrate existing far-apart worlds and rename them
function holyWorlds() {
  if (!holyWorlds.list || holyWorlds.n !== systems.length || holyWorlds.list.some(s => systems[s.i] !== s)) {
    if (systems.length > HOLY.length && !systems.some(s => s.holy != null)) {
      const caps = new Set(F.map(f => f.capital).filter(Boolean)),
        pool = systems.filter(s => !caps.has(s) && s.owner !== 1),
        pick = [];
      const dmin = s => Math.min(...pick.map(p => s.pos.distanceTo(p.pos)));
      HOLY.forEach((h, i) => {
        const s = pick.length ? pool.filter(x => !pick.includes(x)).sort((a, b) => dmin(b) - dmin(a))[0] : rnd(pool);
        if (s) {
          makeHolyWorld(i, s);
          pick.push(s);
        }
      });
    }
    holyWorlds.list = systems.filter(s => s.holy != null);
    holyWorlds.n = systems.length;
  }
  return holyWorlds.list;
}
const ownerName = s => s.owner >= 0 ? F[s.owner]?.name : 'independent zealots';
const holyName = s => s?.holy == null ? '' : {
  Order: '✠ holy to the Order',
  Zithari: '🌑 holy to the Dark',
  both: '👑 holy to both faiths'
}[HOLY[s.holy][1]];
// Which side a house stands on in a holy war
const onSide = (fid, side) => fid >= 0 && F[fid]?.alive && (side === 'Zithari' ? F[fid].rel === 'Zithari' || fid === 15 || has(F[fid].ruler, 'Fallen') : F[fid].rel === 'Order' && !S.sanct.includes(fid));
const reclSide = () => S.recl?.side || 'Order';
const inRecl = (fid, t) => !!(S.recl && (!t || S.recl.target === t) && onSide(fid, reclSide()));
// The house that called the war: the Nameless for the Order; for the Dark, the house of the Zithari preacher who raised it
const reclCaller = () => reclSide() === 'Zithari' ? S.recl?.by : 0;
// A holy world is a fair target for a side if anyone outside that faith (or independent zealots) holds it
// Outcasts: houses sanctioned/excommunicated by the Nameless (Order side) or declared anathema by the Cult (Zithari side) — any of their worlds may be reclaimed
const outcast = (fid, side) => fid >= 0 && !!F[fid]?.alive && !hostile(F[fid]) && (side === 'Zithari' ? (S.zAnath?.[fid] || 0) > 0 : S.sanct.includes(fid) || exco(fid));
const tgtName = t => `${t.holy != null ? 'the holy world' : 'the outcast world'} ${t.name}`;
const holyTargets = side => [...holyWorlds(), ...systems.filter(s => s.holy == null && outcast(s.owner, side))].filter(s => s.owner !== 1 && (s.owner < 0 || F[s.owner]?.alive && !onSide(s.owner, side)) && s.owner !== (side === 'Order' ? 0 : 15));
// side 'Order': called by the Grandmaster. side 'Zithari': raised by a Zithari preacher (char `who` of house `by`) — no council needed.
function startRecl(target, side = 'Order', who = null, by = 0) {
  const dark = side === 'Zithari',
    gm = dark ? who : F[0]?.ruler,
    tid = target.owner,
    callerId = dark ? by : 0;
  if (!gm) return;
  S.recl = {
    target,
    until: S.turn + 10,
    joined: dark ? [by] : [],
    refused: [],
    tid,
    side,
    by: callerId,
    who: gm.id
  };
  log(dark ? `🌑 The Zithari preacher ${gm.name} of ${F[by]?.name} proclaims a DARK RECLAMATION on ${tgtName(target)}!` : `✠ Grandmaster ${gm.name} calls a RECLAMATION to ${target.holy != null ? 'free' : 'punish'} ${tgtName(target)}!`);
  try {
    S.recl.wid = wikiReclStart(S.recl, gm);
  } catch (e) {
    console.error(e);
  }
  // Every house of the faith weighs the call: zeal, standing, grudges, alliances and wars elsewhere
  for (const f of F) {
    if (!f.alive || !onSide(f.id, side) || isHuman(f.id) || f.id === callerId || f.id === tid || hostile(f) || !f.ruler) continue;
    const vs = tid >= 0,
      p = persona(f.ruler),
      allied = vs && S.ally.has(key(f.id, tid)),
      busy = F.filter(o => o.alive && o.id !== tid && !hostile(o) && atWar(f.id, o.id)).length;
    const zeal = dark ? (has(f.ruler, 'Fallen') ? 0.2 : 0) + opinion(f.id, by) * 0.01 + (has(f.ruler, 'Cruel') ? 0.1 : 0) + gm.skill * 0.02 : (f.ruler.piety - 5) * 0.04 + (standing(f.id) - 5) * 0.05;
    const ch = clamp(0.3 + p.agg * 0.2 + zeal + (vs && opinion(f.id, tid) < -5 ? 0.15 : 0) - (allied ? 0.45 : 0) - busy * 0.12 - (vs && (bloodTie(f.id, tid) || bloodTie(tid, f.id)) ? 0.25 : 0), 0.03, 0.9);
    if (Math.random() < ch) {
      S.recl.joined.push(f.id);
      if (vs && !atWar(f.id, tid)) declareWar(f.id, tid);
      if (!dark) st(f.id, 1);
      grudge(callerId, f.id, 2, 'answering the Reclamation');
    } else {
      S.recl.refused.push(f.id);
      if (!dark) st(f.id, -1);
      grudge(callerId, f.id, -3, 'ignoring the Reclamation');
    }
  }
  if (dark && tid >= 0 && by !== tid && !atWar(by, tid)) declareWar(by, tid);
  const nm = ids => ids.map(i => F[i]?.name).join(', ');
  if (S.recl.joined.length) log(`${dark ? '🌑' : '✠'} Answering the call: ${nm(S.recl.joined)}.`);
  if (S.recl.refused.length) log(`${dark ? '🌑' : '✠'} Turning a deaf ear: ${nm(S.recl.refused)}. ${dark ? 'The Dark remembers.' : 'The Council takes note.'}`);
  apoc(dark ? 5 : gm.violence > 5 ? 4 : 2, dark ? 'a Dark Reclamation' : 'holy war');
}
// ---- Zithari preachers raise Dark Reclamations themselves (like imams calling a jihad) ----
function zithCallOdds(a) {
  const c = a.char,
    fid = a.owner,
    why = [];
  let p = 0.15;
  const add = (v, t) => {
    if (v) {
      p += v;
      why.push(`${t} ${v > 0 ? '+' : ''}${Math.round(v * 100)}%`);
    }
  };
  add(c.skill * 0.04, `Preacher's skill (${c.skill})`);
  add(Math.max(0, -(c.respect || 0)) * 0.02, "Preacher's dread");
  add(has(F[fid]?.ruler, 'Fallen') ? 0.15 : 0, 'Your ruler walks the Dark');
  add(F[fid]?.rel === 'Zithari' ? 0.1 : 0, 'A Zithari house');
  add(S.apoc * 0.002, 'Armageddon');
  add(-(S.zFail || 0) * 0.08, 'Recent failed calls');
  return {
    p: clamp(p, 0.05, 0.85),
    why
  };
}
// Holy targets this preacher can reach: the world he stands on or a neighbour
const zithTargets = a => holyTargets('Zithari').filter(t => (t === a.sys || a.sys.links.includes(t)) && t.owner !== a.owner);
async function zithCall(a, t) {
  const o = zithCallOdds(a);
  if (Math.random() < o.p) {
    S.zFail = 0;
    agentXP(a.char, a.role, true);
    startRecl(t, 'Zithari', a.char, a.owner);
    await reclAnnounce(t, 'Zithari');
    return true;
  }
  S.zFail = (S.zFail || 0) + 1;
  a.char.skill = Math.max(0, a.char.skill - 1);
  log(`🌑 ${a.char.name} of ${F[a.owner].name} howls for a Dark Reclamation of ${t.name} — but the faithful do not stir.`);
  return false;
}
// Victory: the holy world falls to the faith
function reclWon(t, fid, g) {
  const dark = reclSide() === 'Zithari';
  F[fid].gold += 400;
  if (g) {
    g.respect += dark ? -2 : 1;
    maybe(g, dark ? 'Cruel' : 'Pious', 0.5);
  }
  if (dark) {
    log(`🌑 ${F[fid].name} seizes ${t.name} for the Dark! The followers of Zithari exult.`);
    apoc(4, 'the Dark takes a holy world');
    if (F[15]?.alive) grudge(15, fid, 5, 'the Dark Reclamation');
    const w = CH[S.recl.who];
    if (w && !w.dead) {
      w.respect = (w.respect || 0) - 2;
      w.skill = Math.min(10, w.skill + 1);
      note(w, `is hailed as the prophet who won ${t.name} for the Dark.`);
    }
  } else {
    st(fid, 2, 'Reclamation fulfilled');
    log(`✠ ${F[fid].name} completes the Reclamation of ${t.name}!`);
    apoc(F[0].ruler.purity > 5 ? -3 : 2, 'Reclamation fulfilled');
    S.gmRep = (S.gmRep || 0) + 1;
  }
  (S.recl.joined || []).forEach(id => {
    if (id !== fid && F[id]?.alive) {
      F[id].gold += 150;
      if (!dark) st(id, 1);
    }
  });
  try {
    wikiReclEnd(S.recl, true, fid);
  } catch (e) {}
  S.recl = null;
}
// ---- Petitioning the Nameless (Order houses only; the Dark needs no council) ----
function reclOdds(fid, tid) {
  const why = [];
  let p = 0.1;
  const add = (v, t) => {
    if (v) {
      p += v;
      why.push(`${t} ${v > 0 ? '+' : ''}${Math.round(v * 100)}%`);
    }
  };
  if (tid < 0) add(0.15, 'Held by heathen zealots');
  const gm = F[0]?.ruler,
    mem = S.council.map(id => CH[id]).filter(Boolean);
  add((standing(fid) - 5) * 0.07, 'Your standing');
  add(mem.filter(c => c.f === fid).length * 0.08, 'Your Masters on the Council');
  add(-mem.filter(c => c.f === tid).length * 0.08, "Target's Masters on the Council");
  add(gm?.origin === fid ? 0.4 : gm?.origin === tid ? -0.4 : 0, 'Grandmaster of the blood');
  if (tid >= 0) add(-(standing(tid) - 5) * 0.05, "Target's standing");
  add(S.sanct.includes(tid) ? 0.25 : 0, 'Target sanctioned');
  add(tid >= 0 && F[tid]?.rel !== 'Order' ? 0.1 : 0, 'Target unfaithful');
  add(F[tid]?.rel === 'Zithari' || tid === 15 || tid === 13 ? 0.2 : 0, 'Target walks the Dark');
  add((S.gmRep || 0) < 0 ? -0.1 : 0, 'Council wary of failures');
  add(gm ? (gm.violence - 5) * 0.03 : 0, "Grandmaster's zeal");
  return {
    p: clamp(p, 0.03, 0.95),
    why: why.join(' · ')
  };
}
async function requestRecl(fid, tgt, quiet) {
  const tid = tgt?.owner;
  if (tid == null || !F[0]?.alive || F[fid].gold < 150) return false;
  const {
    p
  } = reclOdds(fid, tid);
  F[fid].gold -= 150;
  F[0].gold += 150;
  if (Math.random() < p) {
    log(`✠ ${F[fid].name} petitions the Nameless — and a Reclamation of ${tgt.name} is granted!`);
    startRecl(tgt, 'Order');
    if (tid >= 0) {
      grudge(tid, fid, -6, 'calling a holy war on us');
      st(tid, -1);
      if (!atWar(fid, tid)) declareWar(fid, tid);
    }
    if (S.recl && !S.recl.joined.includes(fid)) S.recl.joined.push(fid);
    await reclAnnounce(tgt, 'Order');
    return true;
  }
  st(fid, -1, 'a rejected petition');
  if (tid >= 0) grudge(tid, fid, -3, 'petitioning for a holy war against us');
  if (!quiet || fid === P) log(`✠ The Council of Masters rejects ${F[fid].name}'s petition for a Reclamation of ${tgt.name}.`);
  return false;
}
async function reclRequests() {
  S.zFail = Math.max(0, (S.zFail || 0) - 1); // the shame of false prophets fades
  for (const k in S.zAnath ||= {}) if (--S.zAnath[k] <= 0 || !F[k]?.alive) delete S.zAnath[k]; // anathema fades after ~10 years
  if (S.recl || !F[0]?.alive) return;
  // Order houses petition the Council
  for (const f of F) {
    if (S.recl) return;
    if (!f.alive || isHuman(f.id) || f.id <= 1 || hostile(f) || !f.ruler || f.gold < 300 || !onSide(f.id, 'Order')) continue;
    const ts = holyTargets('Order').filter(s => s.owner !== f.id && (s.owner < 0 || atWar(f.id, s.owner) || opinion(f.id, s.owner) <= -8) && (s.owner < 0 || s.links.some(l => l.owner === f.id) || atWar(f.id, s.owner)));
    if (!ts.length) continue;
    const [t, p] = ts.map(s => [s, reclOdds(f.id, s.owner).p]).sort((a, b) => b[1] - a[1])[0];
    if (p < 0.35 || Math.random() > 0.12 + persona(f.ruler).agg * 0.1) continue;
    await requestRecl(f.id, t, true);
  }
  // The Grandmaster himself eyes the holy worlds
  const gm = F[0].ruler;
  if (!S.recl && !isHuman(0) && gm) {
    const ts = holyTargets('Order');
    if (ts.length && Math.random() < 0.1 * (0.5 + (gm.violence || 5) / 10) * ((S.gmRep || 0) < 0 ? 0.6 : 1)) {
      startRecl(rnd(ts), 'Order');
      if (S.recl) await reclAnnounce(S.recl.target, 'Order');
    }
  }
}
// Announce a holy war to the player: warn the defender, or ask a co-religionist to answer
async function reclAnnounce(t, side) {
  if (!S.recl) return;
  const dark = side === 'Zithari',
    who = dark ? CH[S.recl.who] : F[0].ruler,
    callerId = dark ? S.recl.by : 0;
  const head = dark ? `The Zithari preacher ${who?.name} of ${F[callerId]?.name}` : `Grandmaster ${who?.name}`;
  const oc = t.holy == null ? ` ${ownerName(t)} ${dark ? 'is anathema to the Cult' : 'stands outside the faith'}.` : '';
  if (t.owner === P) return notify(`<h3>${dark ? '🌑 Dark Reclamation' : '✠ Reclamation'} against you!</h3>${who ? portrait(who, 64) : ''}${head} calls ${dark ? 'the Dark' : 'the faithful'} to take ${tgtName(t)} from you.${oc}`);
  if (!onSide(P, side) || P === callerId || S.recl.joined.includes(P)) return;
  const r = await ask(`<h3>${dark ? '🌑 Dark Reclamation!' : '✠ Reclamation!'}</h3>${who ? portrait(who, 64) : ''}${head} calls ${dark ? 'the Dark' : 'the faithful'} against ${tgtName(t)}${t.holy != null ? ` — ${holyName(t)}` : ''}, held by ${ownerName(t)}.${oc}<br><small>${HOLY[t.holy]?.[2] || ''}</small><br>Taking it grants 400 credits and glory${dark ? '' : ' and +2 standing'}.`, ['Join', 'Ignore']);
  if (!S.recl) return;
  if (r === 'Join') {
    if (!dark) st(P, 1, 'answering the call');
    S.recl.joined.push(P);
    if (t.owner >= 0 && !atWar(P, t.owner)) declareWar(P, t.owner);
  } else {
    if (!dark) st(P, -1, 'ignoring the Reclamation');else grudge(callerId, P, -3, 'ignoring the Dark');
    S.recl.refused.push(P);
  }
}
// Order: choose a holy world to petition for (or, as the Nameless, to call a Reclamation on)
async function reclPetition() {
  const ts = holyTargets('Order').filter(s => s.owner !== P);
  if (!ts.length) return notify('Every holy world already lies in faithful hands.');
  const isCaller = P === 0;
  const lb = t => `${t.name}${isCaller ? '' : ` (${pct(reclOdds(P, t.owner).p)}%)`}`;
  const n = await ask(`<h3>✠ ${isCaller ? 'Call a' : 'Petition for a'} Reclamation</h3>Only the ancient holy worlds, or worlds of sanctioned and excommunicated houses, may be reclaimed.${isCaller ? '' : ' Offering: 150 credits. A rejected petition costs standing.'}<div class="scroll" style="max-height:30vh">${ts.map(t => `<div><b>${lb(t)}</b> · ${holyName(t) || '⛓ outcast house'} · ${ownerName(t)}<br><small>${isCaller ? HOLY[t.holy]?.[2] || 'Held by a house cast out of the faith.' : reclOdds(P, t.owner).why}</small></div>`).join('')}</div>`, [...ts.map(lb), 'Cancel']);
  const t = ts.find(x => lb(x) === n);
  if (!t) return;
  if (isCaller) {
    startRecl(t, 'Order');
    if (S.recl && t.owner >= 0 && !atWar(P, t.owner)) declareWar(P, t.owner);
    refresh();
    return;
  }
  if (F[P].gold < 150) return notify('You cannot afford the offering.');
  const ok = await requestRecl(P, t, false);
  await notify(ok ? `The Reclamation of ${t.name} is called!` : 'The Council rejects your petition.');
}
// Placing your own Monks on the Council of 13
async function nominateMonk() {
  const monks = units.filter(u => u.owner === P && u.role === 'Priest' && u.char && !u.char.council);
  if (!monks.length) return notify('You need a Nameless Monk (a Priest agent, recruited at a Temple) to nominate.');
  const u = monks.sort((a, b) => b.char.piety - a.char.piety)[0],
    c = u.char,
    gm = F[0].ruler;
  const p = clamp(0.05 + standing(P) * 0.06 + (c.piety - 5) * 0.05 + (gm.origin === P ? 0.25 : 0) - S.council.map(id => CH[id]).filter(x => x && x.f === P).length * 0.1, 0.03, 0.9);
  const r = await ask(`<h3>✠ Nominate to the Council</h3>${portrait(c, 70)}Put forward <b>${c.name}</b> (Piety ${c.piety}) for a seat among the 13 Masters. A seat will be vacated by retiring an elder Master.<br>Chance: <b>${pct(p)}%</b> · Offering: 250`, ['Nominate (250)', 'Cancel']);
  if (r !== 'Nominate (250)' || !pay(250)) return;
  F[0].gold += 250;
  if (Math.random() >= p) {
    st(P, -1, 'a presumptuous nomination');
    return notify(`The Council passes over ${c.name}.`);
  }
  const old = S.council.map(id => CH[id]).filter(x => x && x.f === 0).sort((a, b) => b.age - a.age)[0];
  if (old) {
    S.council = S.council.filter(id => id !== old.id);
    old.council = false;
    hist(old, 'retires from the Council of Masters.');
  }
  c.council = true;
  c.name = 'Master ' + rnd(EPI);
  S.council.push(c.id);
  note(c, 'is raised to the Council of 13 Masters.');
  await notify(`<h3>✠ A Seat on the Council</h3>${portrait(c, 80)}Your monk is now <b>${c.name}</b>. He votes on sanctions and Reclamations, and may one day be elected Grandmaster.`);
}
// ---- Living politics (crownNew, politicsTick) live in /politics.js ----
initPolitics({
  hist,
  crownBlood,
  log,
  atWar,
  hostile,
  isHuman: id => isHuman(id),
  ri,
  rnd,
  clamp,
  mercSell,
  opinion,
  roAdd,
  grudge,
  st,
  persona,
  notify,
  power,
  bloodClaim,
  newFaction,
  mkChar,
  key,
  sway,
  duelFight: (...a) => duelFight(...a),
  WA,
  vRank: g => vRank(g),
  setFate: (...a) => setFate(...a)
});
// ---- Mid-game events (plague, overreach, tourneys, harvests) live in /events.js ----
initEvents({
  has,
  hist,
  addTrait,
  addAnc,
  rnd,
  ri,
  log,
  toast,
  inSight,
  geo,
  cl,
  succession,
  ask,
  notify,
  RES,
  hostile,
  newFaction,
  key,
  portrait,
  pay,
  gain,
  maybe,
  station,
  checkDead,
  card,
  setFate,
  wound,
  grudge,
  bloodClaim,
  authority
});
async function yearPass() {
  S.year++;
  const onMap = new Set(units.filter(u => u.char).map(u => u.char));
  Object.values(CH).forEach(c => {
    if (c.dead || c.undying) return;
    c.age++;
    try {
      darkTick(c);
    } catch (e) {
      console.error(e);
    }
    if (c.fem && c.spouse != null && c.age > 65 && !onMap.has(c) && Math.random() < 0.12) {
      c.dead = true;
      hist(c, 'dies peacefully of old age.');
    }
    // Nobody outlives time: elders die off — rulers too (the "vacant thrones" turn step crowns the heir)
    if (!c.dead && c.age >= 80 && Math.random() < (c.age - 76) * 0.04) {
      hist(c, 'dies of old age.');
      setFate(c, 'dead');
    }
    if (c.vendetta != null && !F[c.vendetta]?.alive) delete c.vendetta;
    try {
      epiTick(c);
    } catch (e) {
      console.error(e);
    }
  });
  // Princesses of age (14) step out of the nursery and onto the map as agents
  for (const f of F) {
    if (!f.alive || !isHuman(f.id) || celibate(f.id) || f.mods?.coven) continue;
    const s = f.capital?.owner === f.id ? f.capital : systems.find(x => x.owner === f.id);
    if (!s) continue;
    for (const p of [...(f.princesses || [])]) {
      if (p.dead || p.stayHome || p.age < 14 || p.betrothed || p.spouse != null || units.some(u => u.char === p)) continue;
      f.princesses.splice(f.princesses.indexOf(p), 1);
      addUnit({
        type: 'agent',
        role: 'Princess',
        owner: f.id,
        sys: s,
        char: p,
        mp: 3
      });
      note(p, `comes of age and leaves court at ${s.name} to seek a match.`);
    }
  }
  // Paths of the soul: generals and grown heirs may change allegiance as their hearts change
  const souls = new Set([...systems.map(s => s.general), ...units.map(u => u.general), ...F.flatMap(f => f.alive ? f.heirs : [])]);
  for (const c of souls) if (c && !c.dead) {
    try {
      pathTick(c);
    } catch (e) {
      console.error(e);
    }
  }
  // Memory fades — slowly. Blood feuds outlive the men who began them.
  for (const k in S.mem ??= {}) {
    S.mem[k] *= Math.abs(S.mem[k]) >= 15 ? 0.97 : 0.92;
    if (Math.abs(S.mem[k]) < 0.5) delete S.mem[k];
  }
  for (const f of F) {
    if (!f.alive || f.domiri) continue;
    const gens = systems.filter(s => s.owner === f.id && s.general && s.general !== f.ruler);
    f.princesses = (f.princesses || []).filter(p => !p.dead);
    if (f.mods?.coven) {
      // The coven takes in new sisters; the Witch-Queen hexes her enemies from afar
      f.heirs = f.heirs.filter(h => !h.dead);
      if (f.heirs.length < 2 && Math.random() < 0.5) {
        const s = mkWM(f.id, ri(14, 20));
        f.heirs.push(s);
        note(s, `is taken into the coven of ${f.name}.`);
      }
      const foes = systems.filter(s => s.general && !s.general.dead && s.owner >= 0 && atWar(f.id, s.owner));
      if (foes.length && Math.random() < 0.4) {
        const t = rnd(foes),
          g = t.general;
        if (!has(g, 'Blessed') || Math.random() < 0.3) {
          addTrait(g, 'Cursed');
          if (Math.random() < 0.25) t.order = Math.max(0, t.order - 1);
          if (isHuman(t.owner)) log(`🔮 Witch-Queen ${f.ruler.name} of ${f.name} hexes ${cl(g)} at ${t.name}.`);
        }
      }
    }
    if (f.mods?.upgrade) {
      // The Upgrade: Dominion commanders steadily trade flesh for steel
      for (const g of [f.ruler, ...f.heirs, ...systems.filter(s => s.owner === f.id && s.general).map(s => s.general)]) {
        if (!g || g.dead || g.fem || g.age < 18 || Math.random() > 0.08) continue;
        if (!has(g, 'Cybernetic Arm') && !has(g, 'One-Armed') && !has(g, 'Cyborg')) {
          swapTrait(g, null, 'Cybernetic Arm');
          note(g, 'receives the Upgrade: a cybernetic arm.');
        } else if (!has(g, 'Cyborg')) {
          SCARS.forEach(t => swapTrait(g, t, null));
          swapTrait(g, null, 'Cyborg');
          note(g, 'completes the Upgrade and ascends as a cyborg.');
        }
      }
    }
    // marriages of rulers & heirs
    for (const m of [f.ruler, ...f.heirs]) {
      if (mayWed(m) && (m.spouse == null || CH[m.spouse]?.dead) && !m.betrothed && m.age >= 18 && m.age < 70 && Math.random() < (m === f.ruler ? 0.3 : 0.1)) {
        const w = mkFem(f.id, Math.max(16, m.age - ri(0, 10)));
        wed(m, w);
      }
    }
    // betrothals come of age, AI princesses find matches
    for (const p of [...f.princesses]) {
      const b = CH[p.betrothed];
      if (b && p.age >= 16) {
        if (b.dead || b.spouse != null || !mayWed(b)) delete p.betrothed;else await marryPrincess(p, b);
      } else if (!isHuman(f.id) && p.age >= 14 && !p.betrothed && p.spouse == null && mayWed(p) && Math.random() < (p.age >= 16 ? 0.2 : 0.12)) {
        // AI binds its least loyal unwed officer with a royal match (betrothed at 14–15, wed at 16)
        const g = ownGrooms(f, p)[0];
        if (g && ((g.loyalty || 0) <= 7 || Math.random() < 0.4)) {
          if (p.age < 16) betrothOwn(p, g);else await marryPrincess(p, g);
        } else if (p.age >= 16 && Math.random() < 0.5) {
          const n = mkChar(f.id, ri(18, 35));
          if (mayWed(n)) await marryPrincess(p, n);
        }
      }
    }
    // children of married family men (governors and fleet commanders too)
    for (const m of new Set([f.ruler, ...f.heirs, ...gens.map(s => s.general), ...units.filter(u => u.owner === f.id && u.general && !u.general.dead).map(u => u.general)])) {
      if (!m) continue;
      const w = CH[m.spouse];
      // A house without daughters prays harder for them: princesses replenish only through births
      const want = (m === f.ruler ? 0.3 : 0.15) + (f.princesses.length === 0 ? 0.1 : 0);
      if (!w || w.dead || m.dead || !mayWed(m) || w.age > 45 || f.heirs.length + f.princesses.length >= 10 || Math.random() > want) continue;
      const k = birth(f.id, m, w);
      (k.fem ? f.princesses : f.heirs).push(k);
    }
    for (const s of gens) {
      govTraits(s);
      const g = s.general,
        spice = g.traits.includes('Spice Addict');
      if (g === f.ruler) continue; // the ruler's own death (and succession) is handled below
      if (g.age > 65 && !g.undying && Math.random() < 0.15 || spice && g.age > 35 && Math.random() < 0.12) {
        g.dead = true;
        hist(g, `dies${spice ? ' of a spice overdose' : ' of old age'}.`);
        s.general = null;
      }
    }
    // Bastards: rare, but drawn out by brothels, drink, low purity, lechery and cold or childless marriages; piety restrains. Rulers too.
    for (const m of new Set([f.ruler, ...f.heirs, ...gens.map(s => s.general)])) {
      if (!m || m.dead || m.fem || m.undying || m.captive || m.age < 16 || m.age > 65 || ['Priest', 'Master'].includes(m.role) || f.id === 0) continue;
      const p = bastardOdds(m);
      if (!p || Math.random() > p) continue;
      const s = systems.find(x => x.general === m);
      if (f.id === 1) {
        m.loyalty = Math.max(0, (m.loyalty ?? 5) - 2);
        if (s) s.order = Math.max(0, s.order - 2);
        hist(m, 'fathers a bastard, breaking the Nightfleet oath.');
        apoc(1, `${m.name} fathers a bastard, breaking the Nightfleet oath`);
        continue;
      }
      if (f.heirs.length + f.princesses.length >= 12) continue;
      const fem = Math.random() < 0.5,
        b = birth(f.id, m, null, 0, fem);
      b.name += ' (bastard)';
      b.loyalty = 3;
      b.illegit = true;
      (fem ? f.bastards = f.bastards || [] : f.heirs).push(b); // base-born daughters are no princesses until legitimised
      hist(m, `fathers a bastard, ${b.name.split(' ')[0]}.`);
      if (isHuman(f.id)) log(`👶 ${cl(m)} fathers a bastard ${fem ? 'daughter' : 'son'}.`);
      const w = CH[m.spouse];
      if (w && !w.dead) w.loyalty = Math.max(0, (w.loyalty ?? 5) - 1);
    }
    const r = f.ruler;
    if (r.age > 60 && Math.random() < (r.age - 58) * 0.03 || r.traits.includes('Spice Addict') && r.age > 35 && Math.random() < 0.1) await succession(f.id, 'has died');
    if (!f.heirs.length && Math.random() < 0.2) {
      const k = mkChar(f.id, ri(14, 20));
      k.name = k.name.split(' ')[0] + ' ' + sur(f.ruler);
      f.heirs.push(k);
    }
  }
  F[P].heirs.forEach(h => {
    if (Math.random() < 0.2) h.loyalty = Math.max(0, h.loyalty - 1);
  });
  // Wards: raised at your court, their old ties fade and their house warms to you
  S.wards.forEach(w => {
    w.wardY ??= S.year;
    if (Math.random() < 0.5) w.loyalty = Math.max(0, w.loyalty - 1);
    grudge(w.f, P, 1);
  });
  mentorTick();
  // AI: orbital stations and hyperways
  for (const f of F) {
    if (!f.alive || f.id === P || f.domiri || hostile(f)) continue;
    if (f.gold > 250 && Math.random() < 0.25) {
      const s = systems.filter(x => x.owner === f.id && (x.stn || 0) < 2).sort((a, b) => b.income - a.income)[0];
      if (s) {
        f.gold -= 150 * ((s.stn || 0) + 1);
        s.stn = (s.stn || 0) + 1;
      }
    }
    if (f.gold > 200 && Math.random() < 0.06) {
      for (const a of systems.filter(x => x.owner === f.id)) {
        const b = systems.find(y => y.owner >= 0 && y.owner !== f.id && y.owner !== P && !atWar(f.id, y.owner) && !hostile(F[y.owner]) && !a.links.includes(y) && a.pos.distanceTo(y.pos) < 20);
        if (b) {
          f.gold -= 150;
          link(a, b);
          (S.hyper ??= []).push([a.i, b.i]);
          WA('hyper', {
            f: f.id,
            to: b.owner,
            s: a.i,
            s2: b.i
          });
          log(`🛣 ${f.name} and ${F[b.owner].name} forge a hyperway: ${a.name} ⇄ ${b.name}.`);
          break;
        }
      }
    }
  }
  for (const [name, step] of YEAR_STEPS) {
    try {
      await step();
    } catch (e) {
      console.error(`year step "${name}" failed`, e);
    }
  }
}
// ================= Year order (after ageing, births and AI yearly moves above) =================
// AI houses put their blood to work: idle adult princes and court nobles take fleets without a commander or empty
// governor seats (the biggest, most threatened first). Ambitious/Brave sons go to war, Builders/Just to worlds.
function aiCourtDuty() {
  const busy = c => systems.some(s => s.general === c) || units.some(u => u.general === c || u.char === c);
  for (const f of F) {
    if (!f?.alive || isHuman(f.id) || f.mods?.ff || f.domiri || !f.ruler) continue;
    const idle = [...(f.heirs || []), ...systems.filter(s => s.owner === f.id).flatMap(s => staffOf(s).map(id => CH[id]))].filter((c, i, a) => c && a.indexOf(c) === i && !c.dead && !c.captive && c.f === f.id && c.age >= 17 && !c.role && !(c.fem && !c.wm) && !busy(c));
    if (!idle.length) continue;
    const atWarNow = [...S.war].some(k => k.split('|').includes(String(f.id)));
    const fleets = units.filter(u => u.owner === f.id && u.type === 'fleet' && !u.general).sort((a, b) => b.fleet + b.legions - (a.fleet + a.legions));
    const seats = systems.filter(s => s.owner === f.id && !s.general).sort((a, b) => b.links.some(l => l.owner >= 0 && l.owner !== f.id) - a.links.some(l => l.owner >= 0 && l.owner !== f.id) || b.income - a.income);
    idle.sort((a, b) => b.skill - a.skill);
    for (const c of idle) {
      const martial = has(c, 'Brave') || has(c, 'Ambitious') || has(c, 'Reckless') || has(c, 'Bloodthirsty') || c.skill >= 6;
      const wantFleet = fleets.length && (martial || atWarNow || !seats.length);
      if (wantFleet) {
        const u = fleets.shift();
        unstation(c);
        u.general = c;
        note(c, `is given command of a fleet of ${f.name} at ${u.sys?.name}${atWarNow ? ', bound for war' : ''}.`);
      } else if (seats.length) {
        const s = seats.shift();
        unstation(c);
        s.general = c;
        note(c, `is named governor of ${s.name} by ${dn(f.ruler)}.`);
      } else if (fleets.length) {
        const u = fleets.shift();
        unstation(c);
        u.general = c;
        note(c, `takes command of a fleet of ${f.name} at ${u.sys?.name}.`);
      } else break;
    }
  }
}
// ================= AI mentors: houses place their young under their ablest lords (same yearly learning as the player's) =================
function aiMentors() {
  for (const f of F) {
    if (!f?.alive || isHuman(f.id) || f.mods?.ff || celibate(f.id) || !f.ruler) continue;
    const pool = [f.ruler, ...systems.filter(s => s.owner === f.id && s.general).map(s => s.general), ...units.filter(u => u.owner === f.id && u.general).map(u => u.general)].filter((m, i, a) => m && !m.dead && m.f === f.id && m.age >= 20 && !m.captive && a.indexOf(m) === i);
    if (!pool.length) continue;
    const kids = [...(f.heirs || []), ...(f.princesses || []), ...(f.bastards || []), ...Object.values(CH).filter(c => c?.wardOf === f.id)].filter((c, i, a) => c && a.indexOf(c) === i && !c.dead && c.age >= 6 && c.age <= 22 && !c.role && (c.mentor == null || !CH[c.mentor] || CH[c.mentor].dead));
    const load = {};
    for (const c of kids) {
      const score = m => (c.fem && !c.wm ? (m.dip || 0) + (m.charm || 0) + (m.piety || 0) * 0.3 : (m.skill || 0) + (m.admin || 0) * 0.7) - (load[m.id] || 0) * 2;
      const m = pool.filter(x => x !== c && x.mentor !== c.id).sort((a, b) => score(b) - score(a))[0];
      if (!m) continue;
      load[m.id] = (load[m.id] || 0) + 1;
      c.mentor = m.id;
      note(c, `is placed under the tutelage of ${m.name}${c.wardOf === f.id ? `, though a ward of ${f.name}` : ''}.`);
    }
  }
}
// ================= Wards (AI too): taking a fallen capital, the victor may carry off a young son of the beaten house =================
// Player wards live in S.wards; AI-held wards carry c.wardOf = captor house. Both keep c.f (their own house) until they swear fealty.
// Wards and prisoners are kept by whoever governs the capital, else the ruler; his dread rises when they are tortured or executed
function keeperOf(fid) {
  const f = F[fid],
    cap = f?.capital;
  const g = cap && cap.owner === fid && cap.general && !cap.general.dead && cap.general.f === fid ? cap.general : null;
  return g || (f?.ruler && !f.ruler.dead ? f.ruler : null);
}
function takeWard(w, by, at) {
  const hf = F[w.f];
  if (hf) hf.heirs = (hf.heirs || []).filter(h => h !== w);
  w.wardY = S.year;
  if (isMe(by)) S.wards.push(w);else w.wardOf = by; // another human's ward joins his court when his turn comes (restoreP)
  const k = keeperOf(by);
  if (k && k !== w && w.mentor == null) w.mentor = k.id; // raised in the keeper's household
  hist(w, `is taken from ${at ? at.name : 'his home'} as a ward of ${F[by].name}, a hostage for his house's good behaviour.`);
  grudge(w.f, by, -3, `taking ${w.name} as a ward`);
  log(`🏰 ${cl(w)} of ${hf?.name || 'a fallen house'} is taken as a ward by ${F[by].name}.`);
}
function wardTick() {
  for (const w of Object.values(CH)) {
    if (!w || w.wardOf == null) continue;
    const by = w.wardOf,
      home = F[w.f];
    if (w.dead) {
      delete w.wardOf;
      continue;
    }
    if (!F[by]?.alive) {
      delete w.wardOf;
      delete w.wardY;
      if (home?.alive) {
        home.heirs.push(w);
        note(w, `returns to ${home.name}, for the house that held him has fallen.`);
      }
      continue;
    }
    if (home?.ruler === w) {
      delete w.wardOf;
      delete w.wardY;
      note(w, `leaves the court of ${F[by].name} to take the throne of ${home.name}.`);
      continue;
    }
    if (!home?.alive) {
      delete w.wardOf;
      acceptFealty(w, by);
      continue;
    }
    // A cruel or dreaded keeper may simply turn a ward out; most keep him as the hostage he is
    const wk = keeperOf(by);
    if (wk && (has(wk, 'Cruel') || has(wk, 'Paranoid') || (wk.respect || 0) <= -6) && Math.random() < 0.04) {
      banish(w, by, `turned out by ${wk.name}`);
      continue;
    }
    if (Math.random() < 0.5) w.loyalty = Math.max(0, (w.loyalty || 0) - 1);
    grudge(w.f, by, 1);
    if (w.age >= 16) {
      if (Math.random() < fealtyOdds(w, by).p) {
        acceptFealty(w, by);
        if (w.f === by) log(`🏰 ${cl(w)}, raised as a ward, forsakes ${home.name} and swears fealty to ${F[by].name}.`);
      } else if (w.age >= 18) {
        delete w.wardOf;
        delete w.wardY;
        home.heirs.push(w);
        grudge(w.f, by, 3, `the return of ${w.name}`);
        note(w, `comes of age and is sent home to ${home.name} by ${F[by].name}.`);
      }
    }
  }
}
// ================= Hostage exchanges: a peace may free all prisoners and be sealed by swapping young sons =================
// Hostages are wards with c.hostage = {by, y}. They go home after 6 years; if their house breaks the peace, the holder decides.
const holderOf = w => S.wards.includes(w) ? P : w.wardOf ?? null;
const hostagesOf = (fid, holder) => Object.values(CH).filter(w => w && !w.dead && w.hostage && w.f === fid && holderOf(w) === holder);
function hostageCand(fid) {
  const f = F[fid],
    r = f?.ruler;
  if (!f?.alive || !r) return null;
  const first = heirOrder(f)[0];
  return [...new Set([...(f.heirs || []), ...(r.kids || []).map(id => CH[id])])].filter(c => c && !c.dead && !c.fem && !c.captive && c.wardOf == null && !S.wards.includes(c) && !c.role && c.f === fid && c !== r && c.age >= 5 && c.age <= 17 && !bastard(c)).sort((x, y) => (x === first) - (y === first) || x.age - y.age)[0] || null;
}
function releaseWard(w) {
  S.wards = S.wards.filter(x => x !== w);
  delete w.wardOf;
  delete w.wardY;
  delete w.hostage;
  const h = F[w.f];
  if (h?.alive && !h.heirs.includes(w)) h.heirs.push(w);
}
function giveHostage(w, to) {
  takeWard(w, to, null);
  w.hostage = {
    by: to,
    y: S.year
  };
  grudge(w.f, to, 3, 'a peace sealed with hostages'); // agreed, not seized
  hist(w, `is sent to the court of ${F[to].name} as a hostage, to seal the peace.`);
  WA('hostage', {
    a: w.id,
    f: w.f,
    to,
    v: 'given'
  });
}
function freePrisoners(a, b) {
  const out = [];
  for (const c of Object.values(CH)) {
    if (!c || c.dead || !c.captive || c.enslaved) continue;
    const by = c.captive.by;
    if (!(by === a && c.f === b || by === b && c.f === a)) continue;
    freeCaptive(c, `is freed under the terms of the peace with ${F[by]?.name}`);
    S.prisoners = S.prisoners.filter(x => x !== c);
    sendHome(c);
    out.push(c);
    WA('hostage', {
      a: c.id,
      f: c.f,
      to: by,
      v: 'freed'
    });
  }
  return out;
}
async function hostageTick() {
  // 1. New treaties
  for (const {
    a,
    b
  } of (S.hxq || []).splice(0)) {
    if (!F[a]?.alive || !F[b]?.alive || S.war.has(key(a, b))) continue;
    const ha = hostageCand(a),
      hb = hostageCand(b),
      canSwap = !!(ha && hb) && !celibate(a) && !celibate(b);
    const pris = Object.values(CH).filter(c => c && !c.dead && c.captive && !c.enslaved && (c.captive.by === a && c.f === b || c.captive.by === b && c.f === a));
    if (isMe(a) || isMe(b)) {
      const me = isMe(a) ? a : b,
        them = me === a ? b : a,
        mine = me === a ? ha : hb,
        theirs = me === a ? hb : ha;
      if (!canSwap && !pris.length) continue;
      const opts = [...(canSwap ? ['🤝 Exchange hostages and free all prisoners'] : []), ...(pris.length ? ['⛓ Free the prisoners only'] : []), '✋ No further terms'];
      const r = await ask(`<h3>🕊 Terms of Peace with ${F[them].name}</h3>${pris.length ? `Prisoners held between your houses: ${pris.map(c => `${c.name} <small>(${F[c.f]?.name})</small>`).join(', ')}.<br>` : ''}${canSwap ? `<div class="frow">${card(mine, `you send · age ${mine.age}`)}${card(theirs, `they send · age ${theirs.age}`)}</div>Each house may send a young son to be raised at the other's court as a hostage for six years. If either house breaks the peace, its hostage's life is in the other's hands.` : ''}`, opts);
      if (r?.startsWith('🤝') || r?.startsWith('⛓')) {
        const fr = freePrisoners(a, b);
        if (fr.length) log(`🕊 ${fr.length} prisoner${fr.length > 1 ? 's' : ''} freed under the peace between ${F[a].name} and ${F[b].name}.`);
      }
      if (r?.startsWith('🤝')) {
        giveHostage(mine, them);
        giveHostage(theirs, me);
        log(`🤝 ${F[a].name} and ${F[b].name} seal their peace with hostages: ${ha.name} and ${hb.name}.`);
      }
      continue;
    }
    // AI houses: honourable rulers free captives; wary (Paranoid/Cautious) or long-feuding houses demand hostages
    const ra = F[a].ruler,
      rb = F[b].ruler;
    if (pris.length && Math.random() < 0.55 + (persona(ra).honor + persona(rb).honor) * 0.15) freePrisoners(a, b);
    const wary = [ra, rb].some(r => has(r, 'Paranoid') || has(r, 'Cautious')) || opinion(a, b) <= -10 || opinion(b, a) <= -10;
    if (canSwap && Math.random() < (wary ? 0.6 : 0.25)) {
      giveHostage(ha, b);
      giveHostage(hb, a);
      log(`🤝 ${F[a].name} and ${F[b].name} seal their peace with hostages: ${ha.name} and ${hb.name}.`);
    }
  }
  // 2. Broken peace: the holder decides each hostage's fate
  for (const {
    w: id,
    by
  } of (S.hbreak || []).splice(0)) {
    const w = CH[id];
    if (!w || w.dead || !w.hostage || holderOf(w) !== by || !F[by]?.alive) continue;
    const kp = keeperOf(by),
      home = F[w.f];
    let v;
    if (isMe(by)) {
      const r = await ask(`<h3>⚔ ${home?.name} Breaks the Peace</h3>${portrait(w, 64)}<br>${cl(w)}, age ${w.age}, was given to you as a hostage for that peace. His life is yours.`, ['🗡 Put him to death', '🏰 Keep him as a ward', '🕊 Send him home unharmed']);
      v = r?.startsWith('🗡') ? 'slain' : r?.startsWith('🕊') ? 'spared' : 'kept';
    } else {
      const cruel = kp && (has(kp, 'Cruel') || has(kp, 'Bloodthirsty') || (kp.respect || 0) <= -5),
        kind = kp && (has(kp, 'Merciful') || has(kp, 'Just') || has(kp, 'Pious'));
      const roll = Math.random();
      v = roll < (cruel ? 0.55 : kind ? 0.03 : 0.15) ? 'slain' : roll < (kind ? 0.6 : 0.3) ? 'spared' : 'kept';
    }
    WA('hostage', {
      a: w.id,
      f: w.f,
      to: by,
      v
    });
    if (v === 'slain') {
      hist(w, `is put to death by ${F[by].name} when ${home?.name} breaks the peace.`);
      if (kp) {
        kp.respect = (kp.respect || 0) - 1;
        await darkDeed(kp, w.age < 16 ? 4 : 2, `the hostage ${w.name}`);
      }
      grudge(w.f, by, -12, `the killing of the hostage ${w.name}`);
      const fa = CH[w.father];
      if (fa && !fa.dead && kp) hate(fa, kp, 10, `who killed his son ${w.name}`);
      log(`🗡 ${F[by].name} puts the hostage ${cl(w)} to death: ${home?.name} broke the peace.`);
      if (w.f === P) await notify(`<h3>🗡 Your Hostage Is Slain</h3>${cl(w)} has been put to death by ${F[by].name} for the broken peace.`);
      if (setFate(w, 'dead', {
        by,
        why: 'executed as a hostage'
      })) await succession(w.f, 'has died');
    } else if (v === 'spared') {
      releaseWard(w);
      hist(w, `is sent home unharmed by ${F[by].name}, though his house broke the peace.`);
      if (kp) kp.respect = (kp.respect || 0) + 1;
      grudge(w.f, by, 4, `sparing the hostage ${w.name}`);
      log(`🕊 ${F[by].name} sends the hostage ${cl(w)} home unharmed, despite the broken peace.`);
    } else {
      delete w.hostage;
      hist(w, `is no longer a hostage but a captive ward of ${F[by].name}: his house broke the peace.`);
    }
  }
  // 3. Hostage terms served: six years on, they go home
  for (const w of Object.values(CH)) {
    if (!w?.hostage || w.dead) continue;
    const by = holderOf(w);
    if (by == null) {
      delete w.hostage;
      continue;
    }
    if (S.year - w.hostage.y >= 6) {
      releaseWard(w);
      grudge(w.f, by, 2, `the return of ${w.name}`);
      hist(w, `returns home from ${F[by]?.name}, his term as a hostage served.`);
      WA('hostage', {
        a: w.id,
        f: w.f,
        to: by,
        v: 'returned'
      });
      if (w.f === P || by === P) log(`🤝 ${cl(w)} returns home from ${F[by]?.name}, his hostage term served.`);
    }
  }
}
// ---- Court plots: kin and agents of a captive's house try to spirit your prisoners and wards away ----
async function plotTick() {
  if (!isHuman(P) || !F[P]?.alive) return;
  const kp = keeperOf(P),
    home = F[P].capital?.owner === P ? F[P].capital : systems.find(s => s.owner === P);
  for (const p of [...S.prisoners, ...S.wards]) {
    if (!p || p.dead || !F[p.f]?.alive || p.f === P) continue;
    const ward = S.wards.includes(p);
    // a real plotter: a spy or assassin of his house, else a father or brother
    const ag = units.find(u => u.owner === p.f && ['Spy', 'Assassin'].includes(u.role) && u.char && !u.char.dead);
    const kin = Object.values(CH).find(k => k && !k.dead && !k.captive && k.f === p.f && !k.fem && k.age >= 16 && (k.id === p.father || k.father != null && k.father === p.father && k !== p));
    const a = ag?.char || kin;
    if (!a) continue;
    const royal = F[p.f].ruler?.id === p.father || (F[p.f].heirs || []).includes(p);
    if (Math.random() > 0.05 + (royal ? 0.05 : 0) + (opinion(p.f, P) <= -10 ? 0.03 : 0) + (ag ? 0.03 : 0)) continue;
    let base = clamp(0.3 + (a.skill || 0) * 0.04 - (kp?.skill || 0) * 0.03 - (has(kp, 'Paranoid') ? 0.1 : 0) - (has(kp, 'Vigilant') ? 0.08 : 0) + (ward ? 0.1 : 0), 0.05, 0.85);
    const r = SIM ? '' : await ask(`<h3>🗝 A Plot in Your Court</h3>${portrait(a, 64)} ${portrait(p, 64)}<br>Whispers reach ${kp ? cl(kp) : 'your court'}: <b>${cl(a)}</b> of ${F[p.f].name} plots to free ${ward ? 'your ward' : 'your prisoner'} <b>${p.name}</b>${home ? ` from ${home.name}` : ''}.<br>Chance the plot succeeds: <b>${pct(base)}%</b>`, ['🛡 Double the guard (100)', `🪤 Lay a trap · ${pct(base)}% → ${pct(clamp(base + 0.1, 0, 0.9))}%`, '🤷 Trust the keeper']);
    let trap = false;
    if (r?.startsWith('🛡')) {
      if (F[P].gold >= 100) {
        F[P].gold -= 100;
        base = Math.max(0.03, base - 0.25);
      } else toast('Not enough credits — the guard stays as it is.', false);
    } else if (r?.startsWith('🪤')) {
      trap = true;
      base = clamp(base + 0.1, 0, 0.9);
    }
    const ok = Math.random() < base,
      died = !ok && (trap || Math.random() < 0.3);
    WA('rescue', {
      a: a.id,
      f: p.f,
      t: p.id,
      tf: p.f,
      by: P,
      s: home?.i,
      ok,
      died
    });
    if (ok) {
      S.prisoners = S.prisoners.filter(x => x !== p);
      S.wards = S.wards.filter(x => x !== p);
      if (p.captive) freeCaptive(p, `is spirited away by ${a.name}`);else hist(p, `is spirited away from the court of ${F[P].name} by ${a.name}.`);
      delete p.wardY;
      const hf = F[p.f];
      if (p.fem) {
        if (!hf.princesses.includes(p)) hf.princesses.push(p);
      } else if (!hf.heirs.includes(p)) hf.heirs.push(p);
      hist(a, `frees ${p.name} from ${F[P].name}.`);
      a.respect = (a.respect || 0) + 1;
      if (kp) {
        kp.respect = (kp.respect || 0) - 1;
        note(kp, `lets ${p.name} slip from his keeping.`);
      }
      log(`🗝 ${cl(a)} frees ${cl(p)} from your court.`);
      if (!SIM) await notify(`<h3>🗝 Escaped!</h3>${portrait(p, 64)}<b>${p.name}</b> is gone — ${a.name} spirited ${p.fem ? 'her' : 'him'} home to ${hf.name}.`);
    } else {
      if (died) {
        hist(a, `is caught plotting to free ${p.name} and put to death.`);
        setFate(a, 'dead');
        grudge(p.f, P, -3, `the death of ${a.name}`);
      } else hist(a, `fails to free ${p.name} from ${F[P].name}.`);
      if (kp) note(kp, `foils a plot to free ${p.name}.`);
      log(`🗝 A plot by ${cl(a)} to free ${cl(p)} fails${died ? ' — the plotter is put to death' : ''}.`);
      if (!SIM) await notify(`<h3>🗝 Plot Foiled</h3>The attempt to free <b>${p.name}</b> fails.${died ? ` <b>${a.name}</b> is caught and put to death.` : ` ${a.name} escapes.`}`);
    }
  }
}
// ================= Secret parentage =================
// c.secret {f: true father id, m: true mother id, h: true house, how: 'found'|'romance', wed, keeper (cover father), by (house that knows), known (year revealed)}
function disguise(c, keeper, fid, how) {
  c.f = fid;
  c.father = keeper.id;
  (keeper.kids ??= []).push(c.id);
  c.name = c.name.split(' ')[0] + ' ' + sur(keeper) + ' (bastard)';
  c.illegit = true;
  c.loyalty = 3;
  c.secret.keeper = keeper.id;
  c.secret.by = fid;
  (c.fem ? F[fid].bastards ??= [] : F[fid].heirs).push(c);
  c.hist.push(`Y${S.year}: acknowledged by ${keeper.name} as his base-born ${c.fem ? 'daughter' : 'son'}${how ? ' ' + how : ''}.`);
}
// After a world falls with a royal lord of the beaten house at its head, a very rare chance: his infant is found in the ruins
async function foundling(lord, by, prev, at) {
  const fem = Math.random() < 0.5,
    c = fem ? mkFem(by, 0) : mkChar(by, 0);
  c.cult = lord.cult || c.cult;
  c.name = firstName(c.cult, fem);
  c.bornY = S.year;
  c.age = 0;
  c.blood = clamp((lord.blood || 5) - 1, 1, 10);
  const mo = CH[lord.spouse] && !CH[lord.spouse].dead ? lord.spouse : null;
  c.secret = {
    f: lord.id,
    m: mo,
    h: prev,
    how: 'found',
    wed: mo != null,
    y: S.year,
    at: at.name
  };
  const keeper = F[by].ruler && !F[by].ruler.fem ? F[by].ruler : null;
  let d;
  if (isMe(by) && !SIM) d = await ask(`<h3>👶 A Child in the Ruins</h3>${portrait(lord, 60)}<br>In the fallen court of <b>${at.name}</b> your soldiers find an infant ${fem ? 'girl' : 'boy'}: by every sign the ${mo != null ? 'trueborn ' : ''}child of <b>${cl(lord)}</b> of ${F[prev].name}${lord.dead ? ', who died defending this world' : ''}. No one else knows.${keeper ? `<br><small>Disguised as ${keeper.name}'s bastard, the child grows up in your house. Secrets rarely stay buried; if the truth comes out, ${F[prev].name} will not forgive it, and the child may go back to the house of its blood.</small>` : ''}`, [...(keeper ? ['🤫 Raise as your ruler\'s bastard'] : []), ...(F[prev].alive ? ['🏰 Raise as a ward (hostage)', '⛓ Keep as a prisoner', '🕊 Return the child to its house'] : []), '🏚 Leave the child with the townsfolk', '🗡 Put the child to the sword']);else {
    const r = Math.random(),
      cruel = has(F[by].ruler, 'Cruel') || (F[by].ruler?.respect || 0) <= -5;
    d = keeper && r < 0.05 ? '🤫' : cruel && r < 0.2 ? '🗡' : F[prev].alive ? r < 0.7 ? '🏰' : '🕊' : '🏚';
  }
  if (d?.startsWith('🗡')) {
    const k = keeperOf(by);
    c.f = prev;
    c.father = lord.id;
    (lord.kids ??= []).push(c.id);
    c.name += ' ' + sur(lord);
    c.hist.push(`Y${S.year}: born to ${lord.name}; found in the fall of ${at.name} and put to death by ${F[by].name}.`);
    setFate(c, 'dead');
    if (k) {
      k.respect = Math.max(-ACAP, (k.respect || 0) - 2);
      maybe(k, 'Cruel', 0.4);
      note(k, `orders the infant of ${lord.name} put to the sword at ${at.name}.`);
    }
    if (F[prev]?.alive) {
      grudge(prev, by, -12, `the murder of ${lord.name}'s infant`);
      [lord, ...(lord.kids || []).map(i => CH[i])].filter(x => x && !x.dead && x.f === prev).forEach(x => {
        x.vendetta = by;
      });
    }
    apoc(3, `an infant put to the sword at ${at.name}`);
    if (isHuman(by)) st(by, -1, 'child-murder');
    if (k) await darkDeed(k, 5, `the murder of an infant at ${at.name}`);
    log(`🗡 ${F[by].name} put the infant of ${cl(lord)} to the sword at ${at.name}. The galaxy shudders — and fears them.`);
    return;
  }
  if (d?.startsWith('🤫') && keeper) {
    disguise(c, keeper, by);
    log(`👶 ${cl(keeper)} acknowledges a base-born ${fem ? 'daughter' : 'son'}, ${cl(c)}.`);
    return;
  }
  // Openly the child of its true house: returned, held as a ward, or kept in chains
  const own = () => {
    delete c.secret;
    c.f = prev;
    c.father = lord.id;
    (lord.kids ??= []).push(c.id);
    if (mo != null) {
      c.mother = mo;
      (CH[mo].kids ??= []).push(c.id);
    }
    c.name += ' ' + sur(lord);
    c.hist.push(`Y${S.year}: born to ${lord.name}; found as an infant in the fall of ${at.name} by ${F[by].name}.`);
  };
  if (d?.startsWith('🏰') && F[prev].alive) {
    own();
    takeWard(c, by, at);
    grudge(prev, by, 2, `sparing ${lord.name}'s child`);
    return;
  }
  if (d?.startsWith('⛓') && F[prev].alive) {
    own();
    if (isMe(by)) S.prisoners.push(c);
    c.captive = {
      by,
      y: S.year
    };
    hist(c, `is held as a prisoner of ${F[by].name}, a hostage against ${F[prev].name}.`);
    grudge(prev, by, -4, `holding ${lord.name}'s infant in chains`);
    return;
  }
  if (d?.startsWith('🕊') && F[prev].alive) {
    own();
    (fem ? F[prev].princesses : F[prev].heirs).push(c);
    hist(c, `is returned to ${F[prev].name} by ${F[by].name}.`);
    grudge(prev, by, 4, `the return of ${lord.name}'s child`);
    log(`🕊 ${F[by].name} return an infant of ${lord.name} to ${F[prev].name}.`);
    return;
  }
  setFate(c, 'gone');
}
// Secret romance: an unwed princess and a lord of another house who is physically near her (neighbouring governors, fleets at her capital, wards)
async function romanceTick() {
  for (const f of F) {
    if (!f?.alive || celibate(f.id) || f.mods?.ff || !f.capital) continue;
    const cap = f.capital;
    const near = [...cap.links.map(l => l.owner !== f.id && l.general), ...units.filter(u => u.general && u.owner !== f.id && (u.sys === cap || cap.links.includes(u.sys))).map(u => u.general), ...Object.values(CH).filter(c => c?.wardOf === f.id), ...(isHuman(f.id) ? S.wards : [])].filter((m, i, a) => m && a.indexOf(m) === i && !m.dead && !m.fem && !m.captive && m.f !== f.id && F[m.f] && !celibate(m.f) && !ffLord(m) && m.age >= 17 && m.age <= 50 && !has(m, 'Chaste'));
    if (!near.length) continue;
    for (const p of f.princesses || []) {
      if (!p || p.dead || p.spouse != null || p.age < 16 || p.age > 32 || p.wm || p.captive || has(p, 'Chaste')) continue;
      const m = rnd(near);
      const pr = 0.004 + (p.charm || 0) * 0.001 + (m.charm || 0) * 0.001 + (has(m, 'Lecher') ? 0.01 : 0) + (p.betrothed != null ? 0.003 : 0) - Math.max(0, (p.piety || 5) - 6) * 0.001;
      if (Math.random() > pr) continue;
      await secretChild(p, m, f);
      break;
    }
  }
}
async function secretChild(p, m, f) {
  const wed = (m.spouse == null || CH[m.spouse]?.dead) && Math.random() < 0.4,
    fem = Math.random() < 0.5;
  const c = fem ? mkFem(f.id, 0) : mkChar(f.id, 0);
  c.cult = m.cult || c.cult;
  c.name = firstName(c.cult, fem);
  c.bornY = S.year;
  c.age = 0;
  c.blood = clamp(Math.round(((m.blood || 5) + (p.blood || 5)) / 2), 1, 10);
  c.secret = {
    f: m.id,
    m: p.id,
    h: m.f,
    how: 'romance',
    wed,
    y: S.year
  };
  const died = Math.random() < 0.2;
  // The child is hidden as the bastard of her eldest trueborn brother, else her father, else the ruler
  const bro = Object.values(CH).filter(x => x && !x.dead && !x.fem && x.f === f.id && x.age >= 16 && p.father != null && x.father === p.father && !bastard(x)).sort((a, b) => b.age - a.age)[0];
  const pf = CH[p.father] && !CH[p.father].dead && CH[p.father].f === f.id ? CH[p.father] : null;
  const keeper = bro || pf || (f.ruler && !f.ruler.fem ? f.ruler : null);
  if (!keeper) {
    setFate(c, 'gone');
    return;
  }
  if (isHuman(f.id) && !SIM) await notify(`<h3>🤫 A Secret Child</h3>${portrait(p, 60)} ${portrait(m, 60)}<br><b>${cl(p)}</b> has borne a child to <b>${cl(m)}</b> of ${F[m.f].name}${wed ? ', whom she secretly married' : ''}. ${died ? 'She did not survive the birth. ' : ''}To hide it, ${cl(keeper)} acknowledges the infant as his own base-born ${fem ? 'daughter' : 'son'}. Only your house knows the truth.`);
  disguise(c, keeper, f.id);
  if (wed) {
    p.secretWed = m.id;
  }
  if (died) {
    setFate(p, 'dead');
    hist(p, 'dies in childbirth.');
  }
}
// Secrets surface: rarely each year, more often once the child is grown, and very likely when the keeper dies (a deathbed confession)
async function secretTick() {
  for (const c of Object.values(CH)) {
    const z = c?.secret;
    if (!z || z.known || c.dead) continue;
    const keeper = CH[z.keeper],
      dying = keeper?.dead && !z.kd;
    if (keeper?.dead) z.kd = 1;
    if (Math.random() < 0.01 + (c.age >= 16 ? 0.025 : 0) + (dying ? 0.3 : 0)) await reveal(c, dying ? 'deathbed' : 'whispers');
  }
}
async function reveal(c, how) {
  const z = c.secret,
    fa = CH[z.f],
    mo = CH[z.m],
    h = F[z.h],
    keeper = CH[z.keeper],
    old = c.f;
  z.known = S.year;
  if (keeper) keeper.kids = (keeper.kids || []).filter(i => i !== c.id);
  if (fa) {
    c.father = fa.id;
    if (!(fa.kids ??= []).includes(c.id)) fa.kids.push(c.id);
    c.blood = clamp(Math.max(c.blood || 1, (fa.blood || 5) - 1), 1, 10);
  }
  if (mo) {
    c.mother = mo.id;
    if (!(mo.kids ??= []).includes(c.id)) mo.kids.push(c.id);
  }
  const trueborn = !!z.wed,
    parents = `${fa ? fa.name : 'an unknown lord'}${mo ? ' and ' + mo.name : ''}`;
  const by = how === 'deathbed' && keeper ? ` by the dying ${keeper.name}` : how === 'proclaimed' ? ` by proclamation of ${F[old]?.name}` : '';
  hist(c, `is revealed${by} to be the ${trueborn ? 'trueborn' : 'natural'} child of ${parents}${h ? ` of ${h.name}` : ''}.`);
  if (fa && !fa.dead) note(fa, `is revealed as the father of ${c.name.replace(' (bastard)', '')}.`);
  if (trueborn) {
    c.legit = true;
    delete c.illegit;
    c.name = c.name.split(' ')[0] + ' ' + (fa ? sur(fa) : c.name.split(' ').slice(1).join(' ').replace(' (bastard)', ''));
    if (c.fem && F[old]) {
      F[old].bastards = (F[old].bastards || []).filter(x => x !== c);
      if (!F[old].princesses.includes(c)) F[old].princesses.push(c);
    }
  }
  if (h && z.by != null && z.by !== z.h) grudge(z.h, z.by, -10, `hiding ${c.name.replace(' (bastard)', '')}, a child of their blood`);
  if (keeper && !keeper.dead && how !== 'proclaimed') c.loyalty = Math.max(0, (c.loyalty || 0) - 2); // raised on a lie
  const touch = [old, z.h, z.by].some(x => x != null && isHuman(x));
  const msg = `🤫 ${cl(c)} is revealed${by} to be the ${trueborn ? 'trueborn' : 'natural'} child of ${fa ? cl(fa) : 'an unknown lord'}${mo ? ' and ' + cl(mo) : ''}${h ? ` of ${h.name}` : ''}.`;
  log(msg);
  if (touch && !SIM) await notify(`<h3>🤫 A Secret Revealed</h3>${portrait(c, 70)}<br>${msg}${trueborn && h?.alive && h.id !== old ? `<br><small>As trueborn ${c.fem ? 'daughter' : 'son'} of ${h.name}, ${c.fem ? 'she' : 'he'} may be drawn to the house of ${c.fem ? 'her' : 'his'} blood.</small>` : ''}`);
  // The pull of blood: the child may go to the true house, more so if trueborn, of a ruling father, or estranged from the keeper's house
  if (!h?.alive || h.id === old || c.age < 14 || F[old]?.ruler === c || h.mods?.ff) return;
  let p = 0.15 + (trueborn ? 0.25 : 0) + ((c.loyalty || 0) < 4 ? 0.2 : 0) + (fa && h.ruler === fa ? 0.15 : 0) - (has(c, 'Loyal') ? 0.2 : 0);
  if (isMe(old) && !SIM) {
    const d = await ask(`<h3>🤫 The Pull of Blood</h3>${portrait(c, 64)}<br><b>${cl(c)}</b> now knows ${c.fem ? 'her' : 'his'} blood is of ${h.name}. Chance ${c.fem ? 'she' : 'he'} leaves for them: <b>${pct(p)}%</b>.`, ['🤝 Ask them to stay', '🕊 Let them go']);
    if (d === '🕊 Let them go') p = 1;else p *= 0.5;
  }
  if (Math.random() < p) {
    if (F[old]) {
      F[old].bastards = (F[old].bastards || []).filter(x => x !== c);
      F[old].princesses = (F[old].princesses || []).filter(x => x !== c);
    }
    defect(c, h.id, `leaves ${F[old]?.name || 'the house that raised ' + (c.fem ? 'her' : 'him')} for ${h.name}, the house of ${c.fem ? 'her' : 'his'} true ${fa ? 'father' : 'blood'}`);
    if (c.fem && !h.princesses.includes(c)) h.princesses.push(c);else if (!c.fem && !systems.some(s => s.general === c) && !h.heirs.includes(c)) h.heirs.push(c);
  }
}
// After a world is taken: wards from a fallen capital, foundlings from a fallen royal lord
async function spoilsOfCourt(t, by, prev, lord, royal, wasCap) {
  if (prev < 0 || by < 0 || !F[prev] || !F[by] || F[by].mods?.ff || celibate(by) || prev === 1) return;
  if (wasCap && F[prev].alive) {
    const w = (F[prev].heirs || []).filter(h => h && !h.dead && !h.fem && !h.captive && h.age >= 5 && h.age <= 15 && h.wardOf == null && !S.wards.includes(h) && !systems.some(s => s.general === h) && !units.some(u => u.general === h)).sort((a, b) => a.age - b.age)[0];
    if (w) {
      let take = false;
      if (isMe(by)) take = !SIM && (await ask(`<h3>🏰 A Son of ${F[prev].name}</h3>${portrait(w, 70)}<br>In the fallen court of <b>${t.name}</b> you find <b>${cl(w)}</b> (${w.age}), a son of ${F[prev].name}. Take him as a ward: half guest, half hostage. His house will warm to you while he lives, and he may grow up to serve you.`, ['🏰 Take as Ward', 'Leave him'])) === '🏰 Take as Ward';else take = Math.random() < 0.5;
      if (take) takeWard(w, by, t);
    }
  }
  if (lord && royal && !lord.fem && lord.age >= 18 && lord.age <= 60 && !ffLord(lord) && Math.random() < 0.03 + (lord.dead ? 0.03 : 0)) await foundling(lord, by, prev, t);
}
// ================= Nemeses (M2TW-style): commanders remember who beat them, and urge their liege to strike =================
// c.nem {charId: hatred}; c.nemesis = the most hated rival (hatred ≥ 6). Built from archived battles, slain kin and blades.
const renown = c => !c || c.dead ? 0 : (c.skill || 0) + Math.min(c.wins || 0, 12) * 0.5 + (c.starblade ? 3 : 0) + (has(c, 'Hero') ? 2 : 0) + (c.undying ? 3 : 0);
function hate(c, foe, n, why) {
  if (!c || !foe || c.dead || c === foe || c.f === foe.f) return;
  const m = c.nem ??= {};
  m[foe.id] = Math.min(30, (m[foe.id] || 0) + n);
  const top = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 6 && +top[0] !== c.nemesis && CH[top[0]] && !CH[top[0]].dead) {
    const fo = CH[top[0]];
    c.nemesis = fo.id;
    note(c, `names ${fo.name} of ${F[fo.f]?.name || 'no house'} his nemesis${why ? ' — ' + why : ''}.`);
    const fd = feudOf(c, fo, true);
    if (!fd.who.includes(c.id)) fd.who.push(c.id);
    feudEv(fd, `${c.name} of ${F[c.f]?.name || 'no house'} names ${fo.name} of ${F[fo.f]?.name || 'no house'} his nemesis${why ? ' — ' + why : ''}`);
    if (c.f === P || fo.f === P) {
      log(`🎯 ${cl(c)} names ${cl(fo)} his nemesis${why ? ' — ' + why : ''}.`);
      feudNote(fd, `<b>${c.name}</b> swears ${fo.name} is his nemesis${why ? ' — ' + why : ''}.`, c.f !== P);
    }
  }
}
// ---- House hatred: a house hates what its lords hate (the ruler counts fully, other lords ×0.6) ----
const lordsOf = fid => {
  const f = F[fid];
  if (!f) return [];
  return [...new Set([f.ruler, ...(f.heirs || []), ...systems.filter(s => s.owner === fid && s.general).map(s => s.general), ...units.filter(u => u.owner === fid && u.general).map(u => u.general)])].filter(c => c && !c.dead && c.f === fid);
};
function hateOf(fid, t) {
  if (!t) return 0;
  const r = F[fid]?.ruler;
  return lordsOf(fid).reduce((s, c) => s + (c.nem?.[t.id] || 0) * (c === r ? 1 : 0.6), 0);
}
function houseHate(a, b) {
  const r = F[a]?.ruler;
  let s = 0;
  for (const c of lordsOf(a)) for (const [id, v] of Object.entries(c.nem || {})) if (CH[id] && !CH[id].dead && CH[id].f === b) s += v * (c === r ? 1 : 0.6);
  return s;
}
// The most hated living foe of a house's lords, if the ruler's temper allows a hired blade
function nemTarget(f) {
  const r = f.ruler;
  if (!r) return null;
  const p = persona(r);
  let best = null,
    bs = 0;
  for (const c of lordsOf(f.id)) for (const [id, v] of Object.entries(c.nem || {})) {
    const t = CH[id],
      need = c === r ? 8 : 10;
    if (!t || t.dead || t.captive || t.f === f.id || t.undying || v < need || !F[t.f]?.alive) continue;
    if (!atWar(f.id, t.f) && p.honor > 0.6 && !has(r, 'Cruel')) continue;
    const sc = v * (c === r ? 1 : 0.6);
    if (sc > bs) {
      bs = sc;
      best = t;
    }
  }
  return best;
}
// Nemesis hunts: a commander who burns for a far-off foe asks leave to ride him down (+1 move toward him each turn, 3 years)
const huntFoe = u => {
  const t = u.hunt && CH[u.hunt.id];
  return t && !t.dead && !t.captive && t.f !== u.owner && S.year <= u.hunt.y ? t : null;
};
async function huntTick() {
  let asked = false;
  for (const u of [...units]) {
    const g = u.general;
    if (u.type !== 'fleet' || !g || g.dead || !F[u.owner]?.alive || ships(u) <= 0) continue;
    if (u.hunt && !huntFoe(u)) {
      const t = CH[u.hunt.id];
      hist(g, `ends his hunt for ${t?.name || 'his foe'}.`);
      delete u.hunt;
    }
    if (u.hunt) continue;
    const t = g.nemesis != null ? CH[g.nemesis] : null,
      h = t ? g.nem?.[t.id] || 0 : 0;
    if (!t || t.dead || t.captive || h < 8 || t.f === u.owner || t.undying || S.ally.has(key(u.owner, t.f))) continue;
    const tu = units.find(x => x.type === 'fleet' && x.general === t);
    if (!tu) continue;
    const loc = tu.sys;
    if (loc === u.sys || u.sys.links.includes(loc)) continue; // within reach: the yearly strike urge handles it
    if (Math.random() > 0.25 + (has(g, 'Reckless') ? 0.15 : 0) + (has(g, 'Brave') ? 0.1 : 0) - (has(g, 'Cautious') ? 0.15 : 0)) continue;
    const war = atWar(u.owner, t.f);
    if (isHuman(u.owner)) {
      if (asked || SIM) continue;
      asked = true;
      const c = await ask(`<h3>🎯 ${g.name} asks leave to hunt</h3>${portrait(g, 64)} ${portrait(t, 64)}<br><b>${g.name}</b> burns for his nemesis <b>${cl(t)}</b> of ${F[t.f].name}, now at <b>${loc.name}</b>. He asks leave to ride him down.<br><small>For 3 years his fleet gets +1 move each turn while he hunts. Within reach, he will beg leave to strike.${war ? '' : ` You are at peace with ${F[t.f].name}: a clash would be a border clash (opinion −6).`} Forbid him and he loses loyalty.</small>`, ['🎯 Grant the hunt', '✋ Forbid']);
      if (c === '🎯 Grant the hunt') {
        u.hunt = {
          id: t.id,
          y: S.year + 3
        };
        hist(g, `sets out to hunt his nemesis ${t.name}.`);
      } else {
        g.loyalty = Math.max(0, (g.loyalty || 0) - 1);
        hist(g, `is forbidden to hunt ${t.name} and broods on it.`);
      }
      continue;
    }
    const p = F[u.owner].ruler ? persona(F[u.owner].ruler) : {
      agg: 0.5,
      honor: 0.5
    };
    if (war || Math.random() < p.agg * 0.5 - p.honor * 0.2) {
      u.hunt = {
        id: t.id,
        y: S.year + 3
      };
      hist(g, `sets out to hunt his nemesis ${t.name}.`);
    } else g.loyalty = Math.max(0, (g.loyalty || 0) - 1);
  }
  // Hatred over oaths: a lord whose house makes peace or friends with his nemesis's house may go to that house's enemy
  for (const c of Object.values(CH)) {
    if (!c || c.dead || c.captive || c.f == null || c.f < 0 || !F[c.f]?.alive || F[c.f].ruler === c || c.undying || c.nemesis == null) continue;
    const t = CH[c.nemesis],
      h = t ? c.nem?.[t.id] || 0 : 0;
    if (!t || t.dead || h < 10 || t.f === c.f || atWar(c.f, t.f)) continue;
    const foes = F.filter(o => o.alive && o.id !== c.f && o.id !== t.f && !hostile(o) && !o.mods?.ff && atWar(o.id, t.f));
    if (!foes.length || Math.random() > 0.03 + (c.loyalty < 4 ? 0.05 : 0) + (S.ally.has(key(c.f, t.f)) ? 0.04 : 0) - (has(c, 'Loyal') ? 0.05 : 0)) continue;
    const to = foes.sort((a, b) => power(b.id) - power(a.id))[0],
      from = c.f;
    hist(c, `abandons ${F[from].name}, which keeps peace with his nemesis ${t.name}, and goes over to ${to.name}.`);
    log(`🎯 ${cl(c)} leaves ${F[from].name} for ${to.name} to make war on his nemesis ${t.name}.`);
    defect(c, to.id, `to make war on his nemesis ${t.name}`);
    grudge(from, to.id, -3, `taking in ${c.name}`);
    if (from === P && !SIM) await notify(`<h3>🎯 ${c.name} deserts</h3>${portrait(c, 64)} He cannot bear your peace with the house of his nemesis <b>${t.name}</b>, and has gone over to <b>${to.name}</b>, which is at war with them.`);
  }
}
// Each turn, hunting AI fleets take a free jump toward their quarry and strike when within reach
async function huntMove() {
  for (const u of [...units]) {
    if (!u.hunt || !units.includes(u)) continue;
    const t = huntFoe(u),
      g = u.general;
    if (!t || !g || g.dead) {
      delete u.hunt;
      continue;
    }
    const tu = units.find(x => x.type === 'fleet' && x.general === t);
    if (!tu) continue;
    if (isHuman(u.owner)) continue; // the player steers his own hunters (the +1 move comes from 'refresh moves')
    if (u.sys !== tu.sys && !u.sys.links.includes(tu.sys)) {
      const n = stepToward(u.sys, s => s === tu.sys);
      if (n && (n.owner === u.owner || n.owner < 0 || S.ally.has(key(u.owner, n.owner)) || !units.some(x => x.sys === n && x.type === 'fleet' && x.owner !== u.owner))) u.sys = n;
    }
    if ((u.sys === tu.sys || u.sys.links.includes(tu.sys)) && Math.random() < 0.5) {
      delete u.hunt;
      await championClash(u, tu, 'nemesis');
    }
  }
}
// ---- Blood feuds: every nemesis opens a feud the Archive follows across generations (S.wiki.feuds) ----
// {id, a, b (the first pair), fa, fb, y0, y1, end, gen, who:[every char drawn in], ev:[{y,t}]}; chars map c.fd {foeId: feudId}
const FW = () => (S.wiki ??= {}).feuds ??= [];
const feudRec = id => id == null ? null : FW().find(x => x.id === id);
function feudEv(fd, t) {
  if (!fd) return;
  fd.ev.push({
    y: S.year,
    t
  });
  if (fd.ev.length > 30) fd.ev.splice(1, 1);
}
function feudOf(c, foe, mk) {
  if (!c || !foe) return null;
  const fd = feudRec(c.fd?.[foe.id] ?? foe.fd?.[c.id]);
  if (fd && fd.y1 == null) return fd;
  if (!mk) return null;
  const n = {
    id: S.feudN = (S.feudN || 0) + 1,
    a: c.id,
    b: foe.id,
    fa: c.f,
    fb: foe.f,
    y0: S.year,
    y1: null,
    end: null,
    gen: 1,
    who: [c.id, foe.id],
    ev: []
  };
  FW().push(n);
  if (FW().length > 400) FW().shift();
  (c.fd ??= {})[foe.id] = n.id;
  (foe.fd ??= {})[c.id] = n.id;
  return n;
}
const feudCares = fd => !!fd && fd.who.some(id => CH[id] && !CH[id].dead && CH[id].f === P);
function feudNote(fd, html, ok) {
  if (!SIM && feudCares(fd)) toast(`🎯 ${html}`, ok);
}
function endFeud(fd, how, t) {
  if (!fd || fd.y1 != null) return;
  fd.y1 = S.year;
  fd.end = how;
  feudEv(fd, t);
}
function feudJoin(fd, k, foe) {
  if (!fd || !k) return;
  (k.fd ??= {})[foe.id] = fd.id;
  (foe.fd ??= {})[k.id] = fd.id;
  if (!fd.who.includes(k.id)) fd.who.push(k.id);
}
// A keeper spares his captive nemesis: home, a wardship (under 18) or exile — and the feud is laid to rest on both sides
function spareFoe(kp, c, by, how) {
  const fd = feudOf(kp, c) || feudOf(c, kp);
  if (kp.nem) delete kp.nem[c.id];
  if (kp.nemesis === c.id) delete kp.nemesis;
  if (c.nem?.[kp.id]) {
    c.nem[kp.id] *= 0.2;
    if (c.nem[kp.id] < 2) delete c.nem[kp.id];
  }
  if (c.nemesis === kp.id && !c.nem?.[kp.id]) delete c.nemesis;
  const ward = how !== 'exile' && c.age < 18 && F[c.f]?.ruler !== c;
  S.prisoners = S.prisoners.filter(x => x !== c);
  if (ward) {
    freeCaptive(c, `is spared by ${kp.name}, his sworn enemy, and raised in his household`);
    c._why = 'spared by his nemesis';
    takeWard(c, by);
  } else if (how === 'exile') {
    c._why = 'spared by his nemesis';
    banish(c, by, `spared by ${kp.name} but forbidden his home`);
  } else {
    freeCaptive(c, `is spared and sent home by his sworn enemy ${kp.name}`);
    c._why = 'spared by his nemesis';
    sendHome(c);
  }
  note(kp, `spares his sworn enemy ${c.name} and lays the feud to rest.`);
  kp.respect = Math.min(ACAP, (kp.respect || 0) + 2);
  maybe(kp, 'Merciful', 0.25);
  grudge(c.f, by, 4, `${kp.name}'s mercy to ${c.name}`);
  apoc(-1, 'a feud forgiven');
  const t = `${kp.name} holds ${c.name} captive and spares him${ward ? ', raising him as a ward' : how === 'exile' ? ', sending him into exile' : ''}; the feud is laid to rest`;
  endFeud(fd, 'spared', t);
  log(`🕊 ${cl(kp)} spares his nemesis ${cl(c)} — the feud is ended.`);
  if (fd) feudNote(fd, `${t}.`, true);
}
// Court → 🎯 Blood Feuds: every open feud your house is drawn into, who hates whom, where the enemy is, and its story so far
async function feudsPage(list) {
  const where = c => c.captive ? `⛓ held by ${F[c.captive.by]?.name}` : c.enslaved ? '⛓ enslaved' : (systems.find(s => s.general === c) || units.find(u => u.general === c || u.char === c)?.sys)?.name || 'at court';
  const rows = list.map(fd => {
    const live = fd.who.map(id => CH[id]).filter(c => c && !c.dead);
    const mine = live.filter(c => c.f === P),
      theirs = live.filter(c => c.f !== P);
    const heat = mine.flatMap(m => theirs.map(t => Math.max(m.nem?.[t.id] || 0, t.nem?.[m.id] || 0))).reduce((a, b) => Math.max(a, b), 0);
    const last = fd.ev.slice(-3).map(e => `<div style="opacity:.8">Y${e.y}: ${e.t}</div>`).join('');
    return `<div class="ccard" style="text-align:left;display:block"><b>${theirs.map(cl).join(', ') || 'a fallen line'}</b> <small>(${theirs.map(t => F[t.f]?.name).filter(Boolean)[0] || ''})</small> vs your ${mine.map(cl).join(', ')}<br><small>Since Y${fd.y0} · generation ${fd.gen} · hatred ${Math.round(heat)}${theirs[0] ? ` · enemy ${where(theirs[0])}` : ''}</small>${last}</div>`;
  }).join('');
  await ask(`<h3>🎯 Blood Feuds</h3><small>Nemeses become feuds. Hatred fades slowly. When a man dies, his children, brothers and widow inherit it; when his enemy dies, it may turn on the son. Capture your enemy to take revenge, or spare him and end the feud.</small><div class="scroll" style="max-height:55vh">${rows}</div>`, ['Back']);
}
function nemesisYear() {
  // 1) Learn from new battles in the archive
  for (const b of S.wiki?.battles || []) {
    if (b.nv) continue;
    b.nv = 1;
    const A = CH[b.ga],
      D = CH[b.gd];
    if (!A || !D) continue;
    const W = b.w === 'a' ? A : D,
      Lo = b.w === 'a' ? D : A,
      big = (b.w === 'a' ? b.ld : b.la) >= 70;
    hate(Lo, W, 3 + (big ? 3 : 0), `defeated by him at ${b.n || 'battle'}`);
    hate(W, Lo, 1);
    if (Lo.dead && (Lo.deathY ?? b.y) === b.y) [Lo.father, ...(Lo.kids || [])].map(i => CH[i]).filter(k => k && !k.dead && k.age >= 16 && !k.fem).forEach(k => hate(k, W, 8, `he slew ${Lo.name}`));
    if (W.bladeId && Lo.bladeId == null && b.y === S.year) hate(Lo, W, 1);
  }
  // 2) A dead man's hatred passes to his blood: sons and daughters (60%), brothers and his widow (50%)
  for (const c of Object.values(CH)) {
    if (!c?.dead || c.nemPassed || !c.nem) continue;
    c.nemPassed = 1;
    const kin = [...(c.kids || []).map(i => [CH[i], 0.6]), ...(CH[c.father]?.kids || []).filter(i => i !== c.id).map(i => [CH[i], 0.5]), [CH[c.spouse], 0.5]].filter(([k]) => k && !k.dead && k.age >= 12 && !ffLord(k) && (k.f === c.f || k.spouse === c.id));
    for (const [fid, v] of Object.entries(c.nem)) {
      const foe = CH[fid];
      if (v < 6 || !foe || foe.dead) continue;
      const fd = feudOf(c, foe),
        heirs = kin.filter(([k]) => k.f !== foe.f && k !== foe);
      for (const [k, sh] of heirs) {
        feudJoin(fd, k, foe);
        hate(k, foe, v * sh, `inheriting ${c.name}'s hatred`);
      }
      if (fd && heirs.length) {
        fd.gen++;
        const nm = heirs.map(([k]) => k.name).join(', ');
        feudEv(fd, `${c.name} dies; ${nm} take${heirs.length > 1 ? '' : 's'} up the feud against ${foe.name}`);
        if (c.f === P || foe.f === P) log(`🎯 The feud with ${cl(foe)} does not die with ${cl(c)}: ${nm} take${heirs.length > 1 ? '' : 's'} it up.`);
        feudNote(fd, `${c.name} is dead, but the feud with <b>${foe.name}</b> passes to ${nm}.`, false);
      } else endFeud(fd, 'died', `${c.name} dies, and the feud dies with him`);
    }
  }
  // 3) Old hatreds cool slowly (half-life ~10 years); when a hated man dies, the feud may turn on his son
  for (const c of Object.values(CH)) {
    if (!c?.nem) continue;
    for (const k of Object.keys(c.nem)) {
      const foe = CH[k];
      if (foe?.dead && !c.dead && c.nem[k] >= 6) {
        const fd = feudOf(c, foe),
          son = (foe.kids || []).map(i => CH[i]).find(s => s && !s.dead && !s.fem && s.age >= 12 && s.f !== c.f);
        const v = c.nem[k];
        delete c.nem[k];
        const yr = foe.deathY ?? S.year,
          pair = (x, y) => x === c.id && y === foe.id || x === foe.id && y === c.id;
        const byHand = (S.wiki?.battles || []).some(b => b.y >= yr - 1 && pair(b.ga, b.gd)) || (S.wiki?.acts || []).some(x => x.k === 'duel' && x.died && x.y >= yr - 1 && pair(x.a, x.t));
        if (byHand && fd) {
          feudEv(fd, `${foe.name} falls by the hand of ${c.name}: vengeance is had`);
          c.respect = Math.min(ACAP, (c.respect || 0) + 1);
          note(c, `has his vengeance on ${foe.name}.`);
          feudNote(fd, `<b>${c.name}</b> has his vengeance: ${foe.name} is dead.`, c.f === P);
        }
        if (son && fd && Math.random() < 0.6) {
          feudJoin(fd, c, son);
          fd.gen++;
          hate(c, son, v * 0.5, `the son of ${foe.name}`);
          hate(son, c, 3, `his father's sworn enemy`);
          feudEv(fd, `${foe.name} dies; ${c.name}'s hatred turns on his son ${son.name}`);
          feudNote(fd, `${foe.name} is dead; <b>${c.name}</b>'s hatred turns on his son ${son.name}.`, false);
        } else endFeud(fd, byHand ? 'avenged' : 'outlived', byHand ? `the feud ends in blood` : `${foe.name} dies; ${c.name} outlives his enemy`);
        continue;
      }
      c.nem[k] *= 0.93;
      if (c.nem[k] < 1.5 || !CH[k] || CH[k].dead) delete c.nem[k];
    }
    if (c.nemesis != null && !c.nem[c.nemesis]) {
      const t = CH[c.nemesis];
      if (t?.dead || t?.captive) note(c, `outlives his nemesis ${t.name}.`);
      delete c.nemesis;
    }
  }
}
// A commander's fleet is near a nemesis or a famed enemy commander: he urges his liege to let him strike — even in peacetime
function strikeTargets(u) {
  const g = u.general,
    out = [];
  for (const t of units) {
    if (t === u || t.type !== 'fleet' || !t.general || t.general.dead || t.owner === u.owner || t.owner < 0 || ships(t) <= 0) continue;
    if (!(t.sys === u.sys || u.sys?.links?.includes(t.sys))) continue;
    if (S.ally.has(key(u.owner, t.owner)) || u.owner === 1 && !nmCanWar(t.owner)) continue;
    if (S.recl && (S.recl.joined || []).concat(S.recl.by).includes(u.owner) && (S.recl.joined || []).concat(S.recl.by).includes(t.owner)) continue;
    const nem = g.nem?.[t.general.id] || 0,
      fame = renown(t.general);
    if (nem < 4 && fame < 9) continue;
    out.push({
      t,
      why: nem >= 4 ? 'nemesis' : 'glory',
      score: nem + Math.max(0, fame - 7)
    });
  }
  return out.sort((a, b) => b.score - a.score)[0] || null;
}
async function championClash(u, t, why) {
  const g = u.general,
    tg = t.general,
    war = atWar(u.owner, t.owner),
    pa = u.owner === P,
    pi = pa || t.owner === P;
  const label = `${war ? 'SPACE BATTLE' : 'BORDER CLASH'} at ${t.sys.name}`;
  if (!war) {
    grudge(t.owner, u.owner, -6, `${g.name}'s attack on ${tg.name} in peacetime`);
  }
  hist(g, `${why === 'nemesis' ? `hunts down his nemesis ${tg.name}` : `seeks glory against ${tg.name}`} at ${t.sys.name}${war ? '' : ', though their houses are at peace'}.`);
  const r = await fight(spacePow(u), spacePow(t), pi, pa, label, {
    kind: 'space',
    A: u,
    D: t
  });
  u.fleet = Math.floor(u.fleet * r.a);
  t.fleet = Math.floor(t.fleet * r.d);
  const W = r.win ? u : t,
    Lo = r.win ? t : u;
  battleXP(W.general, true);
  W.general.respect = (W.general.respect || 0) + 1;
  await loseGen(Lo, W.owner);
  const lg = Lo === u ? g : tg;
  if (lg.dead || lg.captive || lg.f !== Lo.owner) {
    hist(W.general, `${W.general.nemesis === lg.id ? 'has his vengeance on' : 'overcomes'} ${lg.name}.`);
    if (W.general.nemesis === lg.id) W.general.respect += 2;
  }
  [u, t].forEach(x => {
    if (units.includes(x) && ships(x) <= 0) wreck(x);
  });
  log(`⚔ ${cl(g)} of ${F[u.owner].name} ${r.win ? 'defeats' : 'is beaten by'} ${cl(tg)} of ${F[t.owner].name} at ${t.sys.name}${war ? '' : ' in a border clash'}.`);
  refresh();
}
async function nemesisUrges() {
  const asked = new Set(),
    done = {};
  for (const u of [...units]) {
    const g = u.general;
    if (!units.includes(u) || u.type !== 'fleet' || !g || g.dead || g.captive || ships(u) <= 0 || u.owner < 0 || !F[u.owner]?.alive) continue;
    const tgt = strikeTargets(u);
    if (!tgt) continue;
    const {
        t,
        why
      } = tgt,
      tg = t.general,
      war = atWar(u.owner, t.owner);
    let p = 0.2 + tgt.score * 0.03 + (has(g, 'Brave') ? 0.1 : 0) + (has(g, 'Ambitious') ? 0.1 : 0) + (has(g, 'Reckless') ? 0.15 : 0) + (has(g, 'Bloodthirsty') ? 0.1 : 0) - (has(g, 'Cautious') ? 0.15 : 0) - (has(g, 'Coward') ? 0.2 : 0) + (war ? 0.2 : 0);
    if (Math.random() > clamp(p, 0.05, 0.8)) continue;
    const odds = spacePow(u) / Math.max(1, spacePow(u) + spacePow(t));
    if (isHuman(u.owner)) {
      if (asked.has(u.owner) || SIM) continue;
      asked.add(u.owner);
      const c = await ask(`<h3>⚔ ${g.name} begs leave to strike</h3>${portrait(g, 64)} ${portrait(tg, 64)}<br><b>${g.name}</b> urges you: ${why === 'nemesis' ? `his nemesis <b>${cl(tg)}</b> of ${F[t.owner].name}` : `<b>${cl(tg)}</b> of ${F[t.owner].name}, a famed commander (renown ${Math.round(renown(tg))})`}, lies within reach at <b>${t.sys.name}</b>.<br>⚔ Chance of victory: <b>${pct(odds)}%</b><br>${war ? '<small>You are at war: this is a battle like any other.</small>' : `<small style="color:#f9a">You are at peace with ${F[t.owner].name}. This would be a border clash — no war is declared, but they will not forget it (opinion −6).</small>`}<br><small>Forbid him and a proud commander loses loyalty.</small>`, ['⚔ Grant leave', '✋ Forbid']);
      if (c === '⚔ Grant leave') await championClash(u, t, why);else {
        const n = has(g, 'Ambitious') || has(g, 'Brave') || why === 'nemesis' ? 2 : 1;
        g.loyalty = Math.max(0, (g.loyalty || 0) - n);
        hist(g, `is forbidden to strike ${tg.name} and broods on it.`);
      }
      continue;
    }
    // AI lieges: warlike or honourless rulers let their hounds loose; peaceful ones rarely risk a clash with a friend
    if ((done[u.owner] || 0) >= 2) continue;
    const pr = F[u.owner].ruler ? persona(F[u.owner].ruler) : {
      agg: 0.5,
      honor: 0.5
    };
    const yes = war ? odds > 0.4 : odds > 0.5 && Math.random() < pr.agg * 0.6 - pr.honor * 0.25 + (why === 'nemesis' ? 0.2 : 0) && opinion(u.owner, t.owner) < 10;
    if (!yes) {
      if (!war && Math.random() < 0.3) g.loyalty = Math.max(0, (g.loyalty || 0) - 1);
      continue;
    }
    done[u.owner] = (done[u.owner] || 0) + 1;
    await championClash(u, t, why);
  }
}
// ---- Duels: blade against blade, fought out exchange by exchange from the duellists' own skill, courage and steel ----
function duelEdge(c) {
  return (c.skill || 0) + (has(c, 'Brave') ? 1.5 : 0) - (has(c, 'Coward') ? 2 : 0) + (has(c, 'Tourney Champion') ? 1.5 : 0) + (c.bladeId != null || has(c, 'Starblade') ? 2 : 0) + (has(c, 'Reckless') ? 0.5 : 0) - (has(c, 'Drunkard') ? 1 : 0) - (c.maimed ? 1.5 : 0) - Math.max(0, (c.age || 30) - 45) * 0.12;
}
const duelOdds = (a, b) => clamp(0.5 + (duelEdge(a) - duelEdge(b)) * 0.07, 0.1, 0.9);
async function duelFight(a, b, title, show) {
  // a challenges b; each exchange is a contest of edge + chance, first to 3 telling blows wins
  const ea = duelEdge(a),
    eb = duelEdge(b),
    lines = [];
  let ha = 0,
    hb = 0,
    n = 0;
  while (ha < 3 && hb < 3 && n < 12) {
    n++;
    const ra = ea + Math.random() * 8,
      rb = eb + Math.random() * 8,
      d = Math.abs(ra - rb);
    if (d < 1) {
      lines.push(`${n}. Blades lock — neither gives ground.`);
      continue;
    }
    const w = ra > rb ? a : b,
      l = w === a ? b : a;
    if (w === a) ha++;else hb++;
    lines.push(`${n}. ${w.name} ${d > 5 ? 'lands a savage cut on' : d > 2.5 ? 'wounds' : 'grazes'} ${l.name}.`);
  }
  const win = ha >= hb,
    W = win ? a : b,
    L = win ? b : a;
  if (show) await notify(`<h3>⚔ ${title}</h3><div style="display:flex;gap:10px;justify-content:center;align-items:center">${portrait(a, 64)}<b>vs</b>${portrait(b, 64)}</div><small>${a.name} (edge ${ea.toFixed(1)}) challenges ${b.name} (edge ${eb.toFixed(1)}) — odds ${pct(duelOdds(a, b))}%</small><div style="margin:6px 0;font-size:13px">${lines.join('<br>')}</div><b>${W.name} wins the duel.</b>`);
  return {
    win,
    W,
    L
  };
}
async function duelTick() {
  // a nemesis within a jump may be challenged to single combat; refusal costs respect, the loser may die
  let count = 0;
  const fought = new Set();
  for (const c of Object.values(CH)) {
    if (count >= 2) break;
    if (!c || c.dead || c.captive || c.fem || c.age < 16 || ffLord(c) || c.role || !c.nemesis || fought.has(c.id)) continue;
    const foe = CH[c.nemesis];
    if (foe && fought.has(foe.id)) continue;
    if (!foe || foe.dead || foe.captive || foe.fem || ffLord(foe) || foe.role || (c.nem?.[foe.id] || 0) < 6 || foe.f === c.f) continue;
    const sa = locate(c),
      sb = locate(foe);
    if (!sa || !sb || sa !== sb && !sa.links.includes(sb)) continue;
    const odds = duelOdds(c, foe);
    if (Math.random() > clamp(0.12 + (has(c, 'Brave') ? 0.1 : 0) + (has(c, 'Reckless') ? 0.1 : 0) + (has(c, 'Bloodthirsty') ? 0.08 : 0) - (has(c, 'Cautious') ? 0.1 : 0) + (odds - 0.5) * 0.4, 0.02, 0.5)) continue;
    const pa = isMe(c.f) && !SIM,
      pb = isMe(foe.f) && !SIM;
    if (pa) {
      const r = await ask(`<h3>⚔ ${c.name} would challenge his nemesis</h3>${portrait(c, 64)} ${portrait(foe, 64)}<br>${c.name} burns to face <b>${cl(foe)}</b> of ${F[foe.f]?.name} in single combat.<br>Chance of victory: <b>${pct(odds)}%</b><br><small>The loser may die. Forbid him and he loses loyalty.</small>`, ['⚔ Let him challenge', '✋ Forbid']);
      if (r !== '⚔ Let him challenge') {
        c.loyalty = Math.max(0, (c.loyalty || 0) - 1);
        hist(c, `is forbidden to challenge ${foe.name} and seethes.`);
        continue;
      }
    }
    let accept;
    if (pb) {
      const r = await ask(`<h3>⚔ A Challenge!</h3>${portrait(c, 64)} ${portrait(foe, 64)}<br><b>${cl(c)}</b> of ${F[c.f]?.name} challenges your <b>${foe.name}</b> to single combat.<br>Chance of victory: <b>${pct(1 - odds)}%</b><br><small>Refusing costs him 2 respect and may brand him a coward.</small>`, ['⚔ Accept', '🛡 Refuse']);
      accept = r === '⚔ Accept';
    } else accept = has(foe, 'Brave') || !has(foe, 'Coward') && (1 - odds > 0.4 || Math.random() < 0.3);
    count++;
    fought.add(c.id);
    fought.add(foe.id);
    if (!accept) {
      foe.respect = (foe.respect || 0) - 2;
      maybe(foe, 'Coward', 0.3);
      c.respect = (c.respect || 0) + 1;
      hist(foe, `refuses ${c.name}'s challenge to single combat.`);
      hist(c, `challenges ${foe.name}, who will not face him.`);
      log(`⚔ ${cl(foe)} refuses the duel offered by ${cl(c)}.`);
      WA('duel', {
        a: c.id,
        f: c.f,
        t: foe.id,
        tf: foe.f,
        s: sa.i,
        ref: true
      });
      feudEv(feudOf(c, foe, true), `${c.name} challenges ${foe.name} to single combat at ${sa.name}; ${foe.name} refuses`);
      if (pa) await notify(`<h3>⚔ Challenge Refused</h3>${foe.name} will not face ${c.name}. Your man's name rises; his foe's falls.`);
      continue;
    }
    const {
      W,
      L
    } = await duelFight(c, foe, `Duel at ${(sa === sb ? sa : sb).name}`, pa || pb);
    W.respect = (W.respect || 0) + 2;
    W.duels = (W.duels || 0) + 1;
    maybe(W, 'Brave', 0.2);
    if (W.nem) delete W.nem[L.id];
    if (W.nemesis === L.id) W.nemesis = null;
    const died = Math.random() < 0.65;
    WA('duel', {
      a: c.id,
      f: c.f,
      t: foe.id,
      tf: foe.f,
      s: sa.i,
      ok: W === c,
      died,
      r: died ? vRank(L) : ''
    });
    const dfd = feudOf(c, foe, true);
    feudEv(dfd, `${c.name} challenges ${foe.name} to single combat at ${sa.name}: ${W.name} ${died ? `slays ${L.name}` : `beats ${L.name}, who yields`}`);
    if (died) endFeud(dfd, W === c ? 'avenged' : 'died', `${L.name} falls in the duel; the feud ends in blood`);
    if (died) {
      hist(W, `slays ${L.name} in single combat.`);
      hist(L, `falls to ${W.name}'s blade in a duel.`);
      log(`⚔ ${cl(W)} slays ${cl(L)} in a duel.`);
      if (setFate(L, 'dead')) await succession(L.f, 'fell in a duel');
    } else {
      L.respect = (L.respect || 0) - 2;
      L.skill = Math.max(0, (L.skill || 0) - 1);
      hist(W, `beats ${L.name} in single combat and spares him.`);
      hist(L, `yields to ${W.name} in a duel, scarred.`);
      log(`⚔ ${cl(W)} defeats ${cl(L)} in a duel; the loser yields.`);
    }
  }
}
// ---- Captivity, wardship & bondage: a life record written by the mechanics themselves ----
// c.life [{y,k,by,t}] — lifeSweep() (in buryDead) diffs saved flags lc/lw/ls against c.captive / wardship / c.enslaved,
// so every code path that imprisons, frees, wards or enslaves someone lands in the record. Torture etc. call life() directly.
function life(c, k, by, t) {
  if (!c) return;
  (c.life ||= []).push({
    y: S.year,
    k,
    by: by ?? null,
    t: t || ''
  });
  if (c.life.length > 40) c.life.shift();
  try {
    wikiFate(c, k, by, t);
  } catch (e) {}
  if (k === 'tortured' && !c.dead) {
    addTrait(c, 'Torture-Scarred', true);
    const tk = keeperOf(by);
    if (tk) {
      hate(c, tk, 10, 'who had him tortured');
      c.tormentor = tk.id;
    }
  }
}
// Chains, cells and wardship leave marks: traits on release, and lasting hatred for the keeper who held him
function lifeMarks(c, k, by) {
  if (c.dead) return;
  const since = [...(c.life || [])].reverse().find(x => x.k === k)?.y ?? S.year,
    yrs = S.year - since;
  const jailer = CH[k === 'enslaved' ? c.slaver : c.jailer] || null;
  if (k === 'captive') {
    if (yrs >= 1) addTrait(c, 'Former Prisoner', true);
    if (jailer) hate(c, jailer, 6, 'who kept him in the cells');
  }
  if (k === 'ward' && yrs >= 2) addTrait(c, 'Ward-raised', true);
  if (k === 'enslaved') {
    addTrait(c, 'Freed Slave', true);
    if (jailer) hate(c, jailer, 10, 'who put him in chains');
  }
}
// Yearly: those who wore chains never forgive. Their slaver stays a nemesis; a freed-slave ruler turns his house on slaver houses;
// a freed slave serving a slaving house sours on it.
function scarTick() {
  for (const c of Object.values(CH)) {
    if (!c || c.dead) continue;
    const chained = has(c, 'Freed Slave') || c.enslaved;
    if (chained && CH[c.slaver] && !CH[c.slaver].dead) hate(c, CH[c.slaver], 3);
    if (CH[c.tormentor] && !CH[c.tormentor].dead) hate(c, CH[c.tormentor], 2);
    if (CH[c.jailer] && !CH[c.jailer].dead && has(c, 'Former Prisoner')) hate(c, CH[c.jailer], 1);
    if (!has(c, 'Freed Slave') || c.enslaved) continue;
    const f = F[c.f];
    if (f?.ruler === c) F.forEach(o => {
      if (o.alive && o.id !== c.f && enslaveOk(o.id) && opinion(c.f, o.id) > -20) grudge(c.f, o.id, -2, `${c.name}'s years in chains`);
    });else if (f && enslaveOk(c.f) && Math.random() < 0.5) c.loyalty = Math.max(0, (c.loyalty || 0) - 1);
  }
}
function lifeSweep() {
  for (const c of Object.values(CH)) {
    if (!c) continue;
    // Base-born mark follows legitimacy
    if (!c.dead && c.traits) {
      const bb = bastard(c),
        hb = c.traits.includes('Base-born');
      if (bb && !hb) addTrait(c, 'Base-born', true);else if (!bb && hb) {
        c.traits = c.traits.filter(t => t !== 'Base-born');
        fx(c, TR['Base-born'].e, -1);
      }
    }
    if (c.captive && c.jailer == null && !c.dead) {
      const k = keeperOf(c.captive.by);
      if (k) c.jailer = k.id;
    }
    const alive = !c.dead;
    const cap = alive && c.captive ? c.captive.by : null,
      ward = alive && c.wardOf != null ? c.wardOf : alive && S.wards.includes(c) ? P : null,
      sl = alive && c.enslaved ? c.enslaved.by ?? -1 : null;
    for (const [fl, v, k] of [['lc', cap, 'captive'], ['lw', ward, 'ward'], ['ls', sl, 'enslaved']]) {
      const was = c[fl];
      if (v != null && was == null) {
        c[fl] = v;
        life(c, k, v >= 0 ? v : null);
      } else if (v == null && was != null) {
        delete c[fl];
        life(c, k + '-end', was >= 0 ? was : null, c.dead ? 'died' : c._why || '');
        lifeMarks(c, k, was);
      } else if (v != null && v !== was) {
        c[fl] = v;
        life(c, k, v >= 0 ? v : null, 'passed to new masters');
      }
    }
    delete c._why;
  }
}
// Return a freed character to his house: princesses to court, heirs stay heirs, others into the capital reserve
function sendHome(c) {
  const h = F[c.f];
  if (!h?.alive || c.dead) return false;
  if (c.fem) {
    if (!h.princesses.includes(c)) h.princesses.push(c);
    return true;
  }
  if (h.heirs.includes(c)) return true;
  const cap = h.capital?.owner === c.f ? h.capital : systems.find(s => s.owner === c.f);
  if (cap) station(cap, c);else h.heirs.push(c);
  return true;
}
// Only a few houses deal in people: the slaver guilds (Slaver's Guild, Cloning Guild), the Spice Syndicate and pirates
const enslaveOk = fid => {
  const f = F[fid];
  return !!f && !f.mods.liberator && !f.mods.ff && (!!f.mods.slaver || !!f.mods.spice || !!f.mods.pirate);
};
function enslave(c, by, how) {
  if (!c || c.dead || ffLord(c) || F[c.f]?.ruler === c || c.enslaved) return false;
  const msg = how || `is sold into slavery by ${F[by]?.name || 'slavers'}`;
  if (c.captive) freeCaptive(c, msg);else note(c, msg + '.');
  c._why = msg;
  setFate(c, 'gone');
  delete c.wardOf;
  delete c.wardY;
  delete c.captive;
  c.enslaved = {
    by,
    y: S.year
  };
  const sl = keeperOf(by);
  if (sl && sl !== c) {
    c.slaver = sl.id;
    hate(c, sl, 12, 'who sold him into chains');
  }
  bumpSlaves(by, 1);
  grudge(c.f, by, -6, `the enslavement of ${c.name}`);
  log(`⛓ ${cl(c)} of ${F[c.f]?.name || 'a fallen house'} is enslaved by ${F[by]?.name || 'slavers'}.`);
  return true;
}
function freeSlave(c, how, to) {
  const e = c.enslaved;
  if (!e) return;
  const yrs = S.year - (e.y ?? S.year);
  delete c.enslaved;
  c.bondage = (c.bondage || 0) + yrs;
  c._why = how;
  if (e.by != null) bumpSlaves(e.by, -1);
  note(c, `${how} after ${yrs < 1 ? 'less than a year' : yrs + ' year' + (yrs > 1 ? 's' : '')} in bondage.`);
  if (!sendHome(c) && to != null && F[to]?.alive) defect(c, to, 'freed from bondage');
}
// Yearly: AI captors judge the prisoners they hold. The keeper's persona and traits decide; the player answers ransom demands.
async function captiveTick() {
  let asked = 0;
  for (const c of Object.values(CH)) {
    if (c?.captive && typeof c.captive === 'object' && c.captive.y == null) c.captive.y = S.year; // old/untimed captivities start counting now
    // A realm will not be ruled from a cell for ever: after 3 years the court scrapes up a ransom, or crowns the next in line
    // Councils, orders and pirate moots don't wait: they elect a new head after a year in chains
    const council = c && ([0, 1, 5, 16, 17].includes(c.f) || F[c.f]?.mods?.elect);
    if (c && !c.dead && c.captive && F[c.f]?.ruler === c && F[c.f].alive && !isHuman(c.f) && S.year - (c.captive.y ?? S.year) >= (council ? 1 : 3) && Math.random() < (council ? 0.9 : 0.6)) {
      const hf = F[c.f],
        by = c.captive.by,
        cf = F[by],
        fee = 400;
      if (!council && cf?.alive && !isHuman(by) && hf.gold >= fee) {
        hf.gold -= fee;
        cf.gold += fee;
        freeCaptive(c, `is ransomed home for ${fee} credits — his court emptied the treasury`);
        c._why = 'ransomed';
        sendHome(c);
        continue;
      }
      c.wasRuler = true;
      hist(c, `is set aside by his own court after ${S.year - (c.captive.y ?? S.year)} years in the cells of ${cf?.name || 'his captors'}.`);
      log(`👑 The court of ${hf.name} gives up on its captive ${rTitle(c.f, c)} ${cl(c)} and crowns another.`);
      c.loyalty = Math.min(c.loyalty ?? 5, 2);
      await succession(c.f, `was set aside while held captive by ${cf?.name || 'his captors'}`);
      continue;
    }
    if (!c || c.dead || !c.captive || isHuman(c.captive.by) || S.prisoners.includes(c)) continue;
    const by = c.captive.by,
      cf = F[by],
      hf = F[c.f],
      yrs = S.year - (c.captive.y ?? S.year);
    if (!cf?.alive) {
      freeCaptive(c, `walks free, for ${cf?.name || 'his captors'} have fallen`);
      c._why = 'captors fell';
      sendHome(c);
      continue;
    }
    if (Math.random() < 0.04 + (c.skill || 0) * 0.006 + (has(c, 'Brave') ? 0.03 : 0) - (has(c, 'Coward') ? 0.02 : 0)) {
      freeCaptive(c, `escapes the cells of ${cf.name}`);
      c._why = 'escaped';
      sendHome(c);
      continue;
    }
    if (yrs < 1 || Math.random() > 0.55) continue;
    const kp = keeperOf(by);
    if (!kp) continue;
    const pr = persona(kp),
      cruel = has(kp, 'Cruel') || has(kp, 'Fallen') || (kp.respect || 0) <= -5,
      merciful = has(kp, 'Merciful') || has(kp, 'Just');
    const royal = !!hf?.heirs?.includes(c) || isKin(c, hf?.ruler),
      fee = royal ? 400 : 200,
      feud = opinion(by, c.f) <= -15 || c.vendetta === by;
    const W = {
      ransom: hf?.alive ? 2 + pr.honor * 2 : 0,
      fealty: 1 + (hf?.alive ? 0 : 3),
      torture: cruel ? 1.5 : pr.agg > 0.8 ? 0.5 : 0.08,
      enslave: enslaveOk(by) && !royal ? (cruel ? 2 : 0.8) * (merciful ? 0.2 : 1) : 0,
      execute: ((cruel ? 1 : 0.1) + (feud ? 0.8 : 0)) * (merciful ? 0.1 : 1) * (1.2 - pr.honor),
      release: yrs >= 3 ? pr.honor * 1.5 + (merciful ? 2 : 0) : 0,
      exile: F[c.f]?.ruler === c ? 0 : yrs >= 2 ? 0.5 + (has(kp, 'Paranoid') ? 0.5 : 0) : 0.1,
      hold: 2
    };
    // His nemesis in chains: the cruel take their revenge; the merciful may end the feud by sparing him
    const nemV = kp.nem?.[c.id] || 0;
    if (nemV >= 4) {
      const h = Math.min(nemV, 20) / 10;
      W.execute += h * (merciful ? 0.2 : 1.5) * (1.3 - pr.honor);
      W.torture += h * (merciful ? 0.05 : 1);
      W.enslave *= 1 + h;
      W.ransom *= 0.3;
      W.release *= 0.3;
      W.hold *= 0.6;
      W.spare = (merciful ? 2.5 : 0) + pr.honor * 1.2;
    }
    let r = Math.random() * Object.values(W).reduce((a, b) => a + b, 0),
      act = 'hold';
    for (const [k, w] of Object.entries(W)) {
      r -= w;
      if (r <= 0) {
        act = k;
        break;
      }
    }
    if (act === 'ransom') {
      let paid = false;
      if (isMe(c.f)) {
        if (asked++ < 2) paid = hf.gold >= fee && (await ask(`<h3>⛓ Ransom demanded</h3>${portrait(c, 70)}<br><b>${c.name}</b> has been held by ${cf.name} for ${yrs} year${yrs > 1 ? 's' : ''}. ${cl(kp)} will send him home for <b>${fee}</b> credits.${hf.gold < fee ? '<br><small>You cannot afford it.</small>' : ''}`, hf.gold >= fee ? [`Pay ${fee}`, 'Refuse'] : ['Refuse'])) === `Pay ${fee}`;
      } else paid = hf.gold >= fee + 150 && (royal || Math.random() < 0.3 + (c.skill || 0) * 0.05);
      if (paid) {
        hf.gold -= fee;
        cf.gold += fee;
        freeCaptive(c, `is ransomed home for ${fee} credits`);
        c._why = 'ransomed';
        sendHome(c);
        grudge(c.f, by, 2, `the ransom of ${c.name}`);
        kp.respect = Math.min(ACAP, (kp.respect || 0) + 1);
      }
      continue;
    }
    if (act === 'spare') {
      spareFoe(kp, c, by, c.age < 18 ? 'ward' : Math.random() < 0.3 ? 'exile' : 'home');
      continue;
    }
    if (nemV >= 4 && (act === 'execute' || act === 'torture' || act === 'enslave')) {
      const fd = feudOf(kp, c);
      feudEv(fd, `${kp.name} takes his revenge on the captive ${c.name}: ${act === 'execute' ? 'execution' : act === 'torture' ? 'the irons' : 'the slave markets'}`);
      feudNote(fd, `${kp.name} takes his revenge on his captive nemesis <b>${c.name}</b> (${act}).`, c.f !== P);
    }
    if (act === 'exile') {
      banish(c, by, `${kp.name} will neither feed him nor free him`);
      continue;
    }
    if (act === 'fealty') {
      if (F[c.f]?.ruler !== c && Math.random() < fealtyOdds(c, by).p) {
        freeCaptive(c, `bends the knee to ${cf.name}`);
        c._why = 'swore fealty';
        acceptFealty(c, by);
        if (isHuman(c.f) || c.f === P) log(`⚔ ${cl(c)} has sworn himself to his captors.`);
      } else gain(c, 'loyalty');
      continue;
    }
    if (act === 'torture') {
      life(c, 'tortured', by, kp.name);
      kp.respect = Math.max(-ACAP, (kp.respect || 0) - 1);
      maybe(kp, 'Cruel', 0.15);
      c.skill = Math.max(0, (c.skill || 0) - 1);
      grudge(c.f, by, -5, `the torture of ${c.name}`);
      apoc(1, `torture of ${c.name}`);
      await darkDeed(kp, 1, `the torture of ${c.name}`);
      note(kp, `has ${c.name} of ${hf?.name || 'a fallen house'} tortured.`);
      if (Math.random() < 0.1 + (c.age > 60 ? 0.15 : 0)) {
        freeCaptive(c, `dies under torture by order of ${kp.name}`);
        setFate(c, 'dead');
        [...(c.kids || []), c.father].map(i => CH[i]).filter(k => k && !k.dead && k.f === c.f).forEach(k => {
          k.vendetta = by;
        });
        hate(CH[c.kids?.[0]] || CH[c.father], kp, 8, 'a kinsman tortured to death');
      } else {
        if (Math.random() < 0.3) addTrait(c, 'Coward', true);
        note(c, `is tortured in the cells of ${cf.name}${Math.random() < 0.4 ? ' and breaks' : ' and gives up nothing'}.`);
      }
      continue;
    }
    if (act === 'enslave') {
      if (enslave(c, by, `is sold into slavery by ${kp.name} of ${cf.name}`)) {
        apoc(2, 'enslavement');
        await darkDeed(kp, 2, `selling ${c.name} into slavery`);
        kp.respect = Math.max(-ACAP, (kp.respect || 0) - 1);
      }
      continue;
    }
    if (act === 'execute') {
      freeCaptive(c, `is executed by order of ${kp.name}`);
      c._why = 'executed';
      const wasR = setFate(c, 'dead');
      grudge(c.f, by, -8, `the execution of ${c.name}`);
      apoc(2, `execution of ${c.name}`);
      [...(c.kids || []), c.father].map(i => CH[i]).filter(k => k && !k.dead && k.f === c.f).forEach(k => {
        k.vendetta = by;
        note(k, `swears a blood vendetta against ${cf.name} for the execution of ${c.name}.`);
        hate(k, kp, 8, 'a kinsman executed');
      });
      kp.respect = Math.max(-ACAP, (kp.respect || 0) - 2);
      await darkDeed(kp, c.age < 16 ? 4 : 2, `the execution of ${c.name}`);
      if (c.f === P) toast(`${cl(c)} has been executed by ${cf.name}.`, false);
      if (wasR) await succession(c.f, 'was executed in captivity');
      continue;
    }
    if (act === 'release') {
      freeCaptive(c, `is released without ransom by ${kp.name}`);
      c._why = 'released in mercy';
      sendHome(c);
      grudge(c.f, by, 3, `mercy shown to ${c.name}`);
      kp.respect = Math.min(ACAP, (kp.respect || 0) + 1);
      maybe(kp, 'Merciful', 0.1);
      apoc(-1, 'mercy');
    }
  }
}
// Yearly: the fate of the enslaved — freedom when masters fall, liberators at war, death in the pits, escape, or kin buying them back
async function slaveTick() {
  let asked = 0;
  for (const c of Object.values(CH)) {
    if (!c || c.dead || !c.enslaved) continue;
    if (c.enslaved === true) c.enslaved = {
      by: null,
      y: S.year
    }; // old saves
    const e = c.enslaved,
      by = e.by,
      own = F[by],
      hf = F[c.f],
      yrs = S.year - (e.y ?? S.year);
    if (by != null && !own?.alive) {
      freeSlave(c, `breaks his chains when ${own?.name || 'his masters'} fall`);
      continue;
    }
    const lib = by != null ? F.find(f => f?.alive && f.mods.liberator && atWar(f.id, by)) : null;
    if (lib && Math.random() < 0.2) {
      freeSlave(c, `is freed from the pens by ${lib.name}`, lib.id);
      continue;
    }
    if (Math.random() < 0.03 + (c.age > 50 ? 0.04 : 0) + (yrs > 5 ? 0.02 : 0)) {
      c._why = 'died';
      note(c, `dies in bondage${own ? ` in the pens of ${own.name}` : ' far from home'}.`);
      setFate(c, 'dead');
      continue;
    }
    if (Math.random() < 0.03 + (c.skill || 0) * 0.004 + (has(c, 'Brave') ? 0.02 : 0)) {
      freeSlave(c, 'escapes his chains');
      continue;
    }
    if (hf?.alive && by !== c.f && Math.random() < 0.35) {
      const fee = 300;
      let paid = false;
      if (isMe(c.f)) {
        if (hf.gold >= fee && asked++ < 2) paid = (await ask(`<h3>⛓ Kin in chains</h3>${portrait(c, 70)}<br><b>${c.name}</b> of your house has toiled as a slave${own ? ` of ${own.name}` : ''} for ${yrs} year${yrs !== 1 ? 's' : ''}. A broker offers to buy his freedom.`, [`Buy freedom (${fee})`, 'Leave him'])) === `Buy freedom (${fee})`;
      } else paid = hf.gold >= fee + 200 && (isKin(c, hf.ruler) || Math.random() < 0.25);
      if (paid) {
        hf.gold -= fee;
        if (own) own.gold += fee;
        freeSlave(c, `is bought out of bondage by ${hf.name}`);
      }
    }
  }
}
async function slaveMenu() {
  const list = Object.values(CH).filter(c => c && !c.dead && c.enslaved?.by === P);
  if (!list.length) return court();
  const pick = list.length > 1 ? await ask(`<h3>⛓ Named Slaves</h3><div class="frow">${list.map(x => card(x, F[x.f]?.name || '')).join('')}</div>`, [...list.map(x => x.name), 'Back']) : list[0].name;
  const c = list.find(x => x.name === pick);
  if (!c) return court();
  const d = await ask(`<h3>⛓ ${c.name}</h3>${portrait(c, 70)}<br>${charStr(c)}<br>Of ${F[c.f]?.name || 'a fallen house'}, enslaved since Y${c.enslaved.y}.<br><small>Freeing him returns him home (+respect, his house warms to you). Selling him off-world earns 120 credits; his fate is no longer yours.</small>`, ['🕊 Free him', '💰 Sell off-world (+120)', 'Back']);
  if (d === '🕊 Free him') {
    freeSlave(c, `is freed by ${F[P].name}`);
    grudge(c.f, P, 4, `freeing ${c.name}`);
    const kp = keeperOf(P);
    if (kp) kp.respect = Math.min(ACAP, (kp.respect || 0) + 1);
    apoc(-1, 'mercy');
  }
  if (d === '💰 Sell off-world (+120)') {
    F[P].gold += 120;
    c.enslaved.by = null;
    S.slaves = Math.max(0, S.slaves - 1);
    life(c, 'sold', P);
    note(c, `is sold off-world by ${F[P].name}.`);
    grudge(c.f, P, -2, `selling ${c.name}`);
  }
  return court();
}
const YEAR_STEPS = [['nemeses', () => nemesisYear()], ['nemesis urges', () => nemesisUrges()], ['duels', () => duelTick()], ['Nightfleet rim', () => nmRimTick()], ['house yearly', () => factionYear()], ['liege offers', () => liegeTick()], ['Nightfleet donations', () => nmYearTick()], ['Nameless year', () => namelessYear()], ['politics', () => politicsTick()], ['reclamation petitions', () => reclRequests()], ['mid-game events', () => midEvents()], ['claim wars', () => claimTick()], ['life traits', () => lifeTraits()], ['bastards', () => bastardTick()], ['AI court duty', () => aiCourtDuty()], ['AI mentors', () => aiMentors()], ['wards', () => wardTick()], ['vassals', () => vassalTick()], ['graft audits', () => graftTick()], ['coalitions', () => coalitionTick()], ['nemesis hunts & desertions', () => huntTick()], ['captives', () => captiveTick()], ['bondage', () => slaveTick()], ['scars of bondage', () => scarTick()], ['court plots', () => plotTick()], ['secret romances', () => romanceTick()], ['secrets surface', () => secretTick()], ['archive edicts', () => wikiEdicts(polOf)], ['archive motives', () => {
  const gov = new Set(systems.map(s => s.general).filter(Boolean)),
    gen = new Set(units.map(u => u.general).filter(Boolean));
  wikiMotives(motive, c => F[c.f]?.ruler === c || (F[c.f]?.heirs || []).includes(c) || gov.has(c) || gen.has(c));
}], ['Nightfleet findings', () => {
  if (F[1].alive && Math.random() < 0.3) F.forEach(f => {
    if (S.nmSupport[f.id]) {
      const v = ri(20, 80);
      f.gold += v;
      if (f.id === P) log(`🧭 The Nightfleet share findings from the rim: +${v} credits.`);
    }
  });
}]];
// A Nightfleet envoy stands in the player's court (receiveEnvoys)
async function nmTithe(a, m) {
  const nsys = systems.filter(s => s.owner === 1);
  if (P === 1 || !F[1].alive || !nsys.length) return;
  const levy = m?.levy || 0;
  const cap = systems.find(s => s.owner === P && s.fleet >= 2);
  const opts = levy ? [`Pay the levy (${levy})`, 'Refuse'] : ['Refuse', '100 credits'];
  if (!levy) {
    if (S.prisoners.length) opts.push('Send a prisoner');
    if (S.slaves > 0) opts.push('Send slaves');
    if (cap) opts.push('Salvaged ships (2)');
  }
  const str = nsys.reduce((t, x) => t + x.legions + x.fleet + x.elite, 0);
  const c = await ask(`<h3>🧭 ${levy ? "The Nightfleet's Levy" : 'An Envoy of the Nightfleet'}</h3><div class="ccard">${portrait(a.char, 56)}<div style="font-size:12px"><b>${a.char.name}</b>, envoy of Lord Commander ${F[1].ruler?.name || '—'}, arrives at ${a.sys.name}.<br>Nightfleet strength: ${str} · donations this year: ${S.nmYear || 0}/200</div></div>${nmPleaText(levy)}`, opts);
  const t = rnd(nsys);
  WA('dip', {
    a: a.char?.id,
    f: 1,
    to: P,
    s: a.sys?.i,
    ok: c !== 'Refuse',
    txt: `pleads for the rim${levy ? ' (a levy)' : ''}${c === 'Refuse' ? ' — refused' : ' — answered'}`
  });
  agentXP(a.char, 'Diplomat', c !== 'Refuse');
  if (levy) {
    if (c !== 'Refuse' && pay(levy)) {
      F[1].gold += levy;
      nmDonate(P, levy);
      apoc(-1, 'paying the Nightfleet levy');
    } else nmRaid(P, levy);
    return;
  }
  if (c === '100 credits') {
    if (F[P].gold < 100) return;
    F[P].gold -= 100;
    F[1].gold += 100;
    nmDonate(P, 100);
  }
  if (c === 'Send a prisoner') {
    exileToNM(S.prisoners.shift(), P);
    nmDonate(P, 50);
  }
  if (c === 'Send slaves') {
    S.slaves--;
    t.legions += 2;
    nmDonate(P, 60);
  }
  if (c === 'Salvaged ships (2)') {
    cap.fleet -= 2;
    t.fleet += 2;
    nmDonate(P, 80);
  }
  if (c !== 'Refuse') {
    apoc(-2, 'supporting the Nightfleet');
    st(P, 1, 'charity to the Nightfleet');
  } else {
    grudge(1, P, -2, "turning away the Nightfleet's envoy");
    if (S.nmYear < 100) log('🧭 The Nightfleet go hungry this year.');
  }
}

// ================= AI =================
async function aiTurn(f) {
  const m = f.mods;
  const mine = systems.filter(s => s.owner === f.id);
  if (!mine.length) {
    checkDead(f.id);
    if (f.alive) {
      f.alive = false;
      units.filter(x => x.owner === f.id).forEach(removeUnit);
    }
    return;
  } // disband a landless host's fleets too
  if (m.ff) await ffTurn(f);
  for (const s of mine) {
    if (f.gold > 150 && Math.random() < 0.5) {
      if (!s.siege && (m.fleetUp || Math.random() < 0.5)) {
        addShips(f.id, s, 2);
        f.gold -= m.fleetUp ? 80 : 120;
      } else {
        s.legions += m.cheap ? 4 : m.droids ? 3 : 2;
        f.gold -= m.cheap ? 60 : m.droids ? 65 : 90;
      }
    }
    // AI weighs the expedition: bold commanders accept more danger; rulers and heirs are not risked lightly
    if (s.ruin && s.general && Math.random() < 0.15) {
      const g = s.general,
        dare = 0.1 + (has(g, 'Reckless') || has(g, 'Brave') ? 0.08 : 0) + (has(g, 'Ambitious') ? 0.04 : 0) - (has(g, 'Cautious') || has(g, 'Coward') ? 0.05 : 0) - (g === f.ruler || f.heirs.includes(g) ? 0.06 : 0);
      if (ruinRisk(g) <= dare) await explore(s, g);
    }
    if (f.gold > 300 && Math.random() < 0.08) {
      s.b.add(rnd(['Barracks', 'Shipyard', 'Temple', 'Market', ...(FBLD[f.id] ? [FBLD[f.id][0], FBLD[f.id][0]] : [])]));
      f.gold -= 200;
    }
    // A plagued (or plague-bordering) world raises a hospice — an able governor sees to it sooner
    else if (!s.b.has('Hospice') && f.gold > 250 && (s.plague || s.links.some(l => l.plague)) && Math.random() < 0.15 + (s.general?.admin || 0) * 0.03) {
      s.b.add('Hospice');
      f.gold -= 180;
      if (s.general) hist(s.general, `founds a Med-Bay on ${s.name} against the Grey Rot.`);
    } else if (f.gold > 450 && Math.random() < 0.06) {
      // AI raises its buildings too (same size limits; built at once, paid in full)
      const up = [...s.b].filter(b => BCHAIN[b] && bLv(s, b) < BCHAIN[b].lv.length && s.income >= BSIZE[bLv(s, b) + 1]);
      if (up.length) {
        const b = rnd(up),
          to = bLv(s, b) + 1;
        (s.lv ??= {})[b] = to;
        f.gold -= BCHAIN[b].c * to;
      }
    }
  }
  // Great Works: same costs and build times as the player, one per world
  // Great Works are raised by able stewards: the best-administered free world is chosen, and its governor's admin/Builder drive the odds
  const gwSite = mine.filter(x => !x.gw && !x.siege && x.general && !x.general.dead).sort((a, b) => (b.general.admin || 0) + (has(b.general, 'Builder') ? 3 : 0) - ((a.general.admin || 0) + (has(a.general, 'Builder') ? 3 : 0)))[0];
  const gwP = gwSite ? 0.02 + (gwSite.general.admin || 0) * 0.008 + (has(gwSite.general, 'Builder') ? 0.04 : 0) + (has(f.ruler, 'Ambitious') ? 0.02 : 0) : 0;
  if (!m.ff && f.ruler && gwSite && Math.random() < gwP) {
    const s = gwSite,
      p = persona(f.ruler);
    if (s) {
      const atWarNow = F.some(o => o.alive && o.id !== f.id && atWar(f.id, o.id));
      const opts = [];
      if (!s.b.has('Space Station') && s.income >= 60) opts.push('Space Station');
      if (!s.b.has('Terraforming') && s.income >= 50) opts.push('Terraforming');
      if (!s.b.has('Shield World') && s.links.some(l => l.owner >= 0 && l.owner !== f.id && atWar(f.id, l.owner))) opts.push('Shield World');
      if (s.bladeWait && s.general && !s.general.starblade) {
        s.bladeWait = false;
        s.general.starblade = true;
        s.general.skill += 2;
        WB(s.general, 'vault', {
          vault: s
        });
        hist(s.general, `takes up the Starblade forged at ${s.name}.`);
      }
      if (s.general && !s.general.starblade && !s.bladeWait) {
        opts.push('Starblades', 'Starblades');
        if (f.id === 0) opts.push('Starblades', 'Starblades');
      }
      // Superweapons: only cruel or aggressive rulers at war dare raise them
      if (s.b.has('Space Station') && atWarNow && p.agg > 0.65 && p.honor < 0.6 && !['World Devastators', 'World Eater', 'Star Eater'].some(w => s.b.has(w))) opts.push(S.apoc > 70 ? 'World Eater' : 'World Devastators');
      const n = rnd(opts);
      if (n && f.gold > gwCost(n, f.id) * 1.3) {
        const t = GW[n].t || 1;
        f.gold -= gwCost(n, f.id);
        s.gw = {
          n,
          left: t,
          tot: t,
          f: f.id,
          g: n === 'Starblades' ? s.general?.id : undefined
        };
        hist(s.general, `begins the ${n} at ${s.name}${GW[n].k === 'super' ? ` on the order of ${f.ruler.name}` : ''}.`);
        if (GW[n].k === 'super') log(`☄ Rumour: ${f.name} has begun raising a ${n} at ${s.name}.`);
      }
    }
  }
  // Built superweapons are fired at a neighbouring enemy world
  if (!m.ff) for (const s of mine) {
    const w = ['World Devastators', 'World Eater', 'Star Eater'].find(x => s.b.has(x));
    const tg = w && s.links.filter(t => t.owner >= 0 && t.owner !== f.id && atWar(f.id, t.owner));
    // the ruler decides: aggression, cruelty and the Dark push him to fire; honour, faith and mercy hold his hand
    const rl = f.ruler,
      pr = rl ? persona(rl) : null;
    const fireP = !pr ? 0 : clamp(pr.agg * 0.5 - pr.honor * 0.3 + (has(rl, 'Cruel') ? 0.15 : 0) + (has(rl, 'Fallen') ? 0.2 : 0) + ((rl.respect || 0) <= -6 ? 0.1 : 0) - (has(rl, 'Pious') || has(rl, 'Merciful') ? 0.2 : 0), 0, 0.6);
    if (tg?.length && Math.random() < fireP) {
      const t = tg.sort((a, b) => (b.owner === P) - (a.owner === P) || b.income - a.income)[0],
        victim = t.owner;
      s.b.delete(w);
      superweapon(w, t, f.id, s);
      log(`☄ ${cl(rl)} of ${f.name} orders the ${w} fired at ${t.name}!`);
      hist(rl, `orders the ${w} at ${s.name} fired upon ${t.name}.`);
      await darkDeed(rl, 6, `firing the ${w} upon ${t.name}`);
      if (victim === P || inSight(t)) await notify(`<h3>☄ ${w} Fired</h3>${f.name} unleashes the ${w} from ${s.name} upon <b>${t.name}</b> (${F[victim]?.name || 'independent'}).`);
    }
  }
  // A swollen treasury is put to work: past a war chest of 1500 + 300/world, the AI raises buildings and musters ships
  const chest = 1500 + 300 * mine.length;
  // Fat treasuries leak: past three war chests, courtiers, palaces and graft eat 8% of the surplus each turn
  if (f.gold > chest * 3) f.gold -= Math.round((f.gold - chest * 3) * 0.08);
  for (let n = 0; n < 24 && f.gold > chest; n++) {
    const s = rnd(mine);
    const up = [...s.b].filter(b => BCHAIN[b] && bLv(s, b) < BCHAIN[b].lv.length && s.income >= BSIZE[bLv(s, b) + 1]);
    if (up.length && Math.random() < 0.4) {
      const b = rnd(up),
        to = bLv(s, b) + 1;
      (s.lv ??= {})[b] = to;
      f.gold -= BCHAIN[b].c * to;
    } else if (!s.siege) {
      addShips(f.id, s, 3);
      s.legions += 3;
      f.gold -= 300;
    }
  }
  // No research: AI factions occasionally stumble on lost technology while exploring
  if (Math.random() < 0.02) {
    const t = rnd(Object.keys(TECH_FINDS).filter(n => !f.tech.includes(n)));
    if (t) {
      f.tech.push(t);
      log(`🔭 Rumour: ${f.name} has recovered ${t} from the ruins.`);
    }
  }
  // AI musters local and faction units now and then
  if (f.gold > 300 && Math.random() < 0.15) {
    const s = rnd(mine),
      fu0 = FACTION_UNIQUE[fkey(f)],
      fu = fu0 || null,
      k = s.spec && (Math.random() < 0.5 || !fu) ? s.spec : fu;
    if (k && UNITS[k]) {
      f.gold -= UNITS[k].c;
      if (UNITS[k].k === 'land') roAdd(s, k, 1);else {
        const fl = units.find(x => x.type === 'fleet' && x.owner === f.id && x.sys === s);
        roAdd(fl || s, k, 1);
      }
    }
  }
  if (!hostile(f) && f.ruler) {
    try {
      ambition(f, mine);
    } catch (e) {
      console.error(e);
    }
  }
  // The Nightfleet lives on what its envoys can beg: houses only give when a Nightfleet diplomat reaches their court
  if (f.id === 1) nmPleas(f);
  // Fleets sharing an orbit join up under the better commander (two generals never merge)
  for (const u of units.filter(x => x.type === 'fleet' && x.owner === f.id)) {
    if (!units.includes(u)) continue;
    for (const o of units.filter(x => x !== u && x.type === 'fleet' && x.owner === f.id && x.sys === u.sys && !(x.general && u.general))) {
      if (o.general) {
        u.general = o.general;
        o.general = null;
      }
      u.fleet += o.fleet;
      u.legions += o.legions;
      u.elite += o.elite;
      roMove(o, u, 'space');
      roMove(o, u, 'land');
      u.mp = Math.min(u.mp, o.mp);
      removeUnit(o);
    }
  }
  // Fleets
  for (const u of units.filter(x => x.type === 'fleet' && x.owner === f.id)) {
    if (!units.includes(u) || u.mp <= 0) continue;
    const s = u.sys;
    if (s.owner === f.id && !(s.quar && s.plague)) {
      const take = Math.min(u.fleet * CARRY - u.legions - u.elite, Math.max(0, s.legions - 2));
      if (take > 0) {
        u.legions += take;
        s.legions -= take;
        // Taking sick troops aboard exposes the commander — an orbiting fleet is only safe while it stays apart
        if (s.plague && u.general && plagueDeath(u.general, 0.6)) {
          const g = u.general;
          u.general = null;
          log(`☠ ${cl(g)} of ${f.name} catches the Grey Rot from troops embarked at ${s.name}.`);
          if (f.ruler === g) await succession(f.id, 'was taken by the Grey Rot');
        }
      }
    }
    if (s.siege?.by === f.id && s.owner !== f.id) {
      if (u.legions + u.elite > 0 && landPow(u) > landPow(s) * 1.4) await assault(u);
      continue;
    }
    if (u.fleet < 3) continue;
    const pow = spacePow(u) + landPow(u);
    const tg = s.links.filter(t => hopCost(s, t) <= u.mp && t.owner !== f.id && (t.owner < 0 ? Math.random() < 0.4 : atWar(f.id, t.owner)) && pow > (spacePow(t) + stnPow(t) + landPow(t) * 0.5 + enemyFleetPow(t, f.id)) * 1.2);
    if (m.ff) {
      // The Forgotten Fleet hunts the Nightfleet while a single Nightfleet world remains; only then the rest of the galaxy.
      // Like a horde it does not wait for good odds against its sworn foe, and it cuts through anyone in the way.
      // If the Nightfleet is gone, whoever now holds its old rim worlds stands in the way first.
      const nmLeft = systems.some(x => x.owner === 1),
        rimLeft = !nmLeft && systems.some(x => x.wasNM && x.owner >= 0 && !F[x.owner]?.mods?.ff);
      const hunt = x => nmLeft ? x.owner === 1 : rimLeft ? x.wasNM && x.owner >= 0 && !F[x.owner]?.mods?.ff : x.owner >= 0 && x.owner !== f.id && !F[x.owner]?.mods?.ff;
      const near = s.links.find(x => hunt(x) && hopCost(s, x) <= u.mp && pow > (spacePow(x) + stnPow(x) + enemyFleetPow(x, f.id)) * 0.7);
      if (near) {
        await moveUnit(u, near);
        continue;
      }
      const step = stepToward(s, hunt);
      if (step && hopCost(s, step) <= u.mp && (step.owner === f.id || step.owner < 0 || pow > (spacePow(step) + stnPow(step) + enemyFleetPow(step, f.id)) * 0.8)) await moveUnit(u, step);
      continue;
    }
    const pri = tg.find(t => inRecl(f.id, t));
    if (tg.length && Math.random() < 0.6) await moveUnit(u, pri || rnd(tg));
  }
  // Agents
  if (!hostile(f) && units.filter(x => x.type === 'agent' && x.owner === f.id).length < 3 && f.gold > 250 && Math.random() < 0.1) {
    const pool = ['Spy', 'Assassin', 'Trader'];
    if (f.rel === 'Order') pool.push('Priest', 'Priest');
    if (f.rel === 'Zithari' || has(f.ruler, 'Fallen')) pool.push('Zithari', 'Zithari');
    if (f.id === 13) pool.push('Witch', 'Witch');
    f.gold -= 150;
    addAgent(f.id, rnd(mine), rnd(pool));
  }
  // Threatened lords: a house that knows killers stalk its people hires guards (Probe AIs, or a bounty hunter as bodyguard)
  const hunted = huntedLords(f.id);
  if (hunted.length && !hostile(f) && f.gold > 200 && mine.length) {
    const free = units.filter(x => x.type === 'agent' && x.owner === f.id && ['Spy', 'Assassin'].includes(x.role) && x.escort == null && !x.mission && !(x.role === 'Assassin' && x.hunt != null && CH[x.hunt] && !CH[x.hunt].dead));
    if (!free.length && Math.random() < 0.5) {
      f.gold -= 150;
      const w = whereIs(hunted[0]);
      addAgent(f.id, w && w.owner === f.id ? w : f.capital?.owner === f.id ? f.capital : rnd(mine), Math.random() < 0.65 ? 'Spy' : 'Assassin');
    }
  }
  for (const a of units.filter(x => x.type === 'agent' && x.owner === f.id)) {
    if (!units.includes(a)) continue;
    if (a.mission) {
      await envoyTurn(a);
      continue;
    }
    if (a.role === 'Trader') {
      if (a.post !== a.sys.i) {
        const t = rnd([a.sys, ...a.sys.links].filter(x => x.owner === f.id || x.owner >= 0 && !atWar(f.id, x.owner)));
        if (t) {
          a.sys = t;
          a.post = t.i;
          WA('trade', {
            a: a.char?.id,
            f: f.id,
            s: t.i,
            ok: true,
            txt: `sets up a trade post at ${t.name}${t.owner !== f.id && F[t.owner] ? ` in the lands of ${F[t.owner].name}` : ''}.`
          });
        }
      }
      continue;
    }
    if (a.role === 'Master' && a.tgt != null) {
      a.sys = systems[a.tgt];
      const t = a.sys;
      const vic = [t.general, ...units.filter(x => x.sys === t && x.owner !== f.id).map(x => x.general || x.char)].filter(g => g && !g.dead && g.f !== 0 && (F[g.f]?.ruler !== g || standing(g.f) <= 2 || exco(g.f)) && g.piety < 5);
      if (vic.length && Math.random() < 0.4) {
        const g = rnd(vic),
          mineV = g.f === P;
        const ok = await trial(a.char, g, t);
        if (mineV) await notify(`<h3>⚜ Heresy Trial</h3>${portrait(a.char, 64)}${a.char.name} puts ${g.name} on trial at ${t.name}.<br>${ok ? `<b>${g.name} is burned as a heretic.</b>` : `${g.name} is found faithful and released.`}`);
      }
      const h = units.find(x => x.sys === t && ['Acolyte', 'Witch'].includes(x.role) && x.owner !== f.id);
      if (h && Math.random() < 0.5) {
        h.char.dead = true;
        hist(h.char, `is burned by ${a.char.name} at ${t.name}.`);
        removeUnit(h);
      }
      if (--a.life <= 0) removeUnit(a);
      continue;
    }
    // AI Probe AIs: some stand guard over the ruler, the heir or a warlord in the field
    if (a.role === 'Spy' || a.role === 'Assassin') {
      if (a.escort != null && CH[a.escort] && !CH[a.escort].dead) continue;
      // Anyone known to be stalked gets a guard first (a busy bounty hunter keeps hunting)
      const busy = a.role === 'Assassin' && a.hunt != null && CH[a.hunt] && !CH[a.hunt].dead;
      const guarded = units.filter(x => ['Spy', 'Assassin'].includes(x.role) && x.owner === f.id && x.escort != null).map(x => x.escort);
      const need = busy ? null : huntedLords(f.id).find(c => guarded.filter(id => id === c.id).length < 2);
      if (need && Math.random() < 0.85) {
        a.escort = need.id;
        delete a.hunt;
        const w = whereIs(need);
        if (w) a.sys = w;
        hist(a.char, `is set to guard ${need.name}, who is being hunted.`);
        continue;
      }
    }
    if (a.role === 'Spy') {
      const wardOf = units.filter(x => x.role === 'Spy' && x.owner === f.id && x.escort != null).map(x => x.escort);
      const vip = [f.ruler, heirOrder(f)?.[0], ...units.filter(x => x.owner === f.id && x.type === 'fleet' && x.general && (x.general.skill || 0) >= 6 && x.sys.links.some(l => l.owner >= 0 && atWar(f.id, l.owner))).map(x => x.general)].filter(c => c && !c.dead && !c.captive && c.f === f.id && !wardOf.includes(c.id));
      if (vip.length && Math.random() < (S.war && [...S.war].some(k => k.split('|').includes(String(f.id))) ? 0.35 : 0.15)) {
        const c = vip[0];
        a.escort = c.id;
        const w = whereIs(c);
        if (w) a.sys = w;
        hist(a.char, `is set to guard ${c.name}.`);
        continue;
      }
    }
    // Bounty Hunters sent after a nemesis of the ruler or one of his lords: they track the man across the hyperlanes
    if (a.role === 'Assassin' && a.char) {
      let tg = a.hunt != null ? CH[a.hunt] : null;
      if (!tg || tg.dead || tg.captive || tg.f === f.id) {
        tg = nemTarget(f);
        a.hunt = tg?.id ?? null;
        if (tg) hist(a.char, `is sent to hunt ${tg.name}, the hated foe of ${F[f.id].name}.`);
      }
      const loc = tg && whereIs(tg);
      if (tg && loc) {
        if (a.sys !== loc) {
          const n = stepToward(a.sys, s => s === loc);
          if (n) a.sys = n;
        }
        if (a.sys === loc && Math.random() < 0.4) {
          const war = atWar(f.id, tg.f),
            o = killOdds(0.2 + (a.char.skill || 0) * 0.04, [], tg, loc);
          const okA = Math.random() < o.p;
          WA('kill', {
            a: a.char.id,
            f: f.id,
            t: tg.id,
            tf: tg.f,
            s: loc.i,
            ok: okA,
            r: okA ? vRank(tg) : '',
            txt: 'a hunted nemesis'
          });
          apoc(1);
          if (okA) {
            const wasR = setFate(tg, 'dead');
            hist(tg, `is hunted down and killed by ${a.char.name}, a bounty hunter of ${f.name}.`);
            hist(a.char, `kills ${tg.name} at ${loc.name}.`);
            if (tg.f === P) {
              log(`🗡 ${cl(tg)} is hunted down at ${loc.name} by a bounty hunter of ${f.name}.`);
              toast(`🗡 <b>${tg.name}</b> was hunted down at ${loc.name} by a bounty hunter of ${f.name}.`, false);
            }
            delete a.hunt;
            if (wasR) await succession(tg.f, 'was assassinated');
          } else {
            survivedAttempt(tg, `a bounty hunter of ${f.name}`);
            const caught = Math.random() < Math.max(0.3, unmaskOdds(counterIntel(tg.f, loc, tg)));
            if (tg.f === P) toast(`🗡 A bounty hunter of ${f.name} came for <b>${tg.name}</b> at ${loc.name} — and failed.${caught ? ' He was taken and confessed.' : ''}`, true);
            if (caught) {
              grudge(tg.f, f.id, war ? -3 : -8, `a hired killer sent after ${tg.name}`);
              a.char.dead = true;
              hist(a.char, `is caught hunting ${tg.name} and executed at ${loc.name}.`);
              removeUnit(a);
              continue;
            }
          }
        }
        continue;
      }
    }
    const zt = a.role === 'Zithari' ? zithTargets(a) : [];
    const t = zt.length && Math.random() < 0.6 ? rnd(zt) : rnd(a.sys.links);
    a.sys = t;
    // Zithari preachers near a holy world may proclaim a Dark Reclamation on their own
    if (a.role === 'Zithari' && !S.recl && Math.random() < 0.2) {
      const z2 = zithTargets(a);
      if (z2.length) await zithCall(a, rnd(z2));
    }
    if (a.role === 'Priest' || a.role === 'Master') {
      const h = units.find(x => x.sys === t && ['Acolyte', 'Witch'].includes(x.role) && x.owner !== f.id);
      if (h && Math.random() < 0.4) {
        h.char.dead = true;
        hist(h.char, `is denounced by ${a.char.name} of ${f.name} and driven out of ${t.name}.`);
        removeUnit(h);
        agentXP(a.char, a.role, true);
      }
    }
    if (a.role === 'Zithari' && t.owner === f.id && t.rel !== 'Zithari' && Math.random() < clamp(0.05 + (a.char?.skill || 0) * 0.04 - (t.general?.piety || 0) * 0.01, 0.03, 0.6)) {
      t.rel = 'Zithari';
      if (a.char) hist(a.char, `converts ${t.name} to the Zithari faith.`);
    }
    if (a.role === 'Witch' && t.general && t.owner !== f.id && Math.random() < clamp((f.mods?.coven ? 0.12 : 0.03) + (a.char?.skill || 0) * 0.025 - (t.general.piety || 0) * 0.01, 0.01, 0.5)) {
      addTrait(t.general, 'Cursed');
      if (t.owner === P) log(`🔮 A witch of ${f.name} curses ${cl(t.general)} at ${t.name}.`);
    }
    if (t.owner >= 0 && t.owner !== f.id && atWar(f.id, t.owner) && Math.random() < 0.25) {
      if (a.role === 'Assassin' && t.general) {
        apoc(1);
        const g = t.general,
          o = killOdds(0.22 + (a.char.skill || 0) * 0.04, [], g, t);
        const okA = Math.random() < o.p;
        WA('kill', {
          a: a.char.id,
          f: f.id,
          t: g.id,
          tf: g.f,
          s: t.i,
          ok: okA,
          r: okA ? vRank(g) : ''
        });
        if (okA) {
          const wasR = setFate(g, 'dead');
          hist(g, `is assassinated by ${a.char.name} of ${f.name}.`);
          if (g.f === P) {
            log(`🗡 ${cl(g)} is assassinated at ${t.name} by ${a.char.name} of ${f.name}.`);
            toast(`🗡 <b>${g.name}</b> was assassinated at ${t.name} by an agent of ${f.name}.`, false);
            grudge(P, f.id, -8, 'an assassinated kinsman');
          }
          if (wasR) await succession(g.f, 'was assassinated');
        } else {
          survivedAttempt(g, `a bounty hunter of ${f.name}`);
          const caught = Math.random() < unmaskOdds(counterIntel(g.f, t, g));
          if (g.f === P || t.owner === P) {
            log(`🗡 ${g.name} fights off a bounty hunter of ${f.name} at ${t.name}${caught ? ' — the Probe AIs take him' : ''}.`);
            toast(`🗡 A bounty hunter of ${f.name} attacked <b>${g.name}</b> at ${t.name} — and failed.${caught ? ' Your Probe AIs caught and executed him.' : ''}`, true);
          }
          if (caught) {
            a.char.dead = true;
            hist(a.char, `is caught by the Probe AIs of ${F[g.f]?.name} and executed at ${t.name}.`);
            removeUnit(a);
            continue;
          }
        }
      }
      if (a.role === 'Spy' && Math.random() < 1 - counterIntel(t.owner, t).d * 2) {
        t.order = Math.max(0, t.order - 2);
        if (t.owner === P) log(`👁 Spies of ${f.name} stir unrest on ${t.name}.`);
      }
    }
    if (a.role === 'Priest' && t.owner === f.id && f.rel !== 'Mixed' && Math.random() < 0.3) t.rel = f.rel;
  }
}

// ================= UI =================
function btn(label, fn) {
  const b = document.createElement('button');
  b.textContent = label;
  b.onclick = async () => {
    if (busy) return;
    pushUndo(label);
    busy = true;
    try {
      await fn();
    } catch (e) {
      console.error(e);
    } finally {
      busy = false;
    }
    refresh();
    showInfo();
  };
  $('info').appendChild(b);
}
function pay(c) {
  if (F[P].gold < c) {
    playSfx('deny');
    log('Not enough credits.');
    return false;
  }
  F[P].gold -= c;
  return true;
}
// Top-bar hint: the selected unit's remaining actions, or how many of your units still await orders
function topStatus() {
  try {
    return topStatusInner();
  } catch (e) {
    return '';
  }
}
function topStatusInner() {
  if (selU && units.includes(selU) && selU.owner === P) {
    const u = selU,
      done = u.type === 'agent' ? u.acted : u.mp <= 0;
    const txt = u.type === 'agent' ? u.acted ? 'Acted — done this turn' : u.mp > 0 ? `${u.mp} moves · can act` : 'No moves · can still act' : u.mp > 0 ? `${u.mp}/${u.max} moves left` : u.path?.length ? 'Travelling — resumes next turn' : 'No moves left — can still swap generals/troops';
    return `<span class="stat" style="color:${done ? '#ff9a6a' : '#8f8'}">${txt}</span>`;
  }
  const ready = units.filter(u => u.owner === P && (u.type === 'agent' ? !u.acted && u.mp > 0 : u.mp > 0) && !u.path?.length).length;
  return `<span class="stat" style="color:${ready ? '#8f8' : '#aaa'}">${ready ? `${ready} unit${ready > 1 ? 's' : ''} ready` : 'All units done'}</span>`;
}
function updateStats() {
  if (P < 0) return;
  const f = F[P],
    n = systems.filter(s => s.owner === P).length;
  const gov = P === 5 ? ` · ${S.bank.gov}` : '';
  const col = '#' + new THREE.Color(f.color).getHexString();
  $('stats').innerHTML = `<span class="stat"><b style="color:${col}">${f.name}</b>${gov}</span><span class="stat">Year <i>${S.year}</i></span><span class="stat" data-ledger="1" style="cursor:pointer" title="Tap for the treasury ledger: income, upkeep, cut-off worlds, graft">Credits <i>${Math.round(f.gold)}</i> (${f.net >= 0 ? '+' : ''}${f.net ?? 0})${f.eco?.cut || f.eco?.graft ? ' ⚠' : ''}</span><span class="stat">Systems <i>${n}</i>/30</span><span class="stat" style="color:${S.apoc > 60 ? '#ff5050' : '#ffb050'}">Apocalypse <i>${Math.floor(S.apoc)}</i>/100</span>${S.recl ? `<span class="stat">Reclamation: ${S.recl.target.name}</span>` : ''}${topStatus()}`;
  refreshMood();
  const left = pending().length;
  $('endTurn').classList.toggle('ready', !left && !busy);
  $('endTurn').dataset.t = S.turn;
  $('bNews').classList.toggle('unread', !!S.newsUnread);
}
// ================= Officer tracking =================
// Generals without a command are kept "in reserve" on a world (s.staff = [char ids]), so nobody vanishes.
const staffOf = s => s.staff = (s.staff || []).filter(id => {
  const c = CH[id];
  return c && !c.dead && c.f === s.owner && !c.captive && s.general !== c && !units.some(u => u.general === c);
});
function station(s, c) {
  if (!s || !c) return;
  unstation(c);
  staffOf(s);
  s.staff.push(c.id);
  c.gen = true;
}
function unstation(c) {
  if (c) systems.forEach(s => {
    if (s.staff?.length) s.staff = s.staff.filter(id => id !== c.id);
  });
}
// Every refresh: stamp current commanders, then return any lost officer of yours to reserve at the capital
function trackOfficers() {
  if (P < 0 || !F[P]?.alive) return;
  const placed = new Set();
  systems.forEach(s => {
    if (s.general) {
      placed.add(s.general.id);
      if (s.owner === P) s.general.gen = true;
    }
    staffOf(s).forEach(id => placed.add(id));
  });
  units.forEach(u => {
    if (u.general) {
      placed.add(u.general.id);
      if (u.owner === P) u.general.gen = true;
    }
    if (u.char) placed.add(u.char.id);
  });
  F.forEach(f => {
    if (f.ruler) placed.add(f.ruler.id);
    (f.heirs || []).forEach(h => h && placed.add(h.id));
    (f.princesses || []).forEach(h => h && placed.add(h.id));
    (f.bastards || []).forEach(h => h && placed.add(h.id));
  });
  S.prisoners.forEach(c => placed.add(c.id));
  S.wards.forEach(c => placed.add(c.id));
  const home = (F[P].capital?.owner === P ? F[P].capital : null) || systems.find(s => s.owner === P);
  if (!home) return;
  for (const c of Object.values(CH)) {
    if (!c.gen || c.dead || c.f !== P || placed.has(c.id) || c.captive || c.enslaved || c.council || c.exiledBy != null) continue;
    station(home, c);
    placed.add(c.id);
    log(`🎖 ${cl(c)} reports for duty in reserve at ${home.name}.`);
  }
}
// Put an officer aboard one of your fleets in orbit (the old general goes to reserve)
async function boardFleet(s, c) {
  const fl = units.filter(u => u.owner === P && u.type === 'fleet' && u.sys === s);
  if (!fl.length) return notify(`No fleet of yours is in orbit of ${s.name}. Bring a fleet here, then tap ${c.name.split(' ')[0]} to put him aboard.`);
  if (s.quar && s.plague && !s.general?.dead && staffOf(s).includes(c.id) || s.quar && s.plague && s.general === c) return notify(`🚧 ${s.name} is under quarantine. No one leaves the surface until the Grey Rot burns out — or you lift the quarantine.`);
  let u = fl[0];
  if (fl.length > 1) {
    const lb = x => `🚀 ${uName(x)}${x.general ? ' (swap)' : ''}`;
    const r = await ask(`<h3>⚜ ${c.name}</h3>Which fleet should he command?`, [...fl.map(lb), 'Cancel']);
    u = fl.find(x => lb(x) === r);
    if (!u) return;
  }
  if (s.general === c) s.general = null;
  const i = F[P].heirs.indexOf(c);
  if (i >= 0) F[P].heirs.splice(i, 1);
  unstation(c);
  const old = u.general;
  u.general = c;
  c.gen = true;
  hist(c, `takes command of a fleet at ${s.name}.`);
  if (c.rot) toast(`☣ ${c.name} carries the Grey Rot aboard his fleet`, false);
  if (old && old !== c) station(s, old);
}
// ================= Planet bar: orb cycles Buildings → Forces → Agents =================
let pbMode = 0,
  pbSys = null;
const PB_MODES = ['Buildings', 'Forces', 'Agents'];
const PB_BIC = {
  Shipyard: '🚀',
  Barracks: '🛡',
  Temple: '⛪',
  Market: '💰',
  Brothel: '💗',
  Hospice: '⚕',
  'Mercenary Guild': '🤝',
  Mine: '⛏',
  'Space Station': '🛰',
  Terraforming: '🌍'
};
const PB_TCOL = {
  Garden: '#4caf50',
  Desert: '#d8a850',
  Ocean: '#3a8ad8',
  Ice: '#bfe4ff',
  Lava: '#e0502a',
  Jungle: '#2f8a3a',
  Barren: '#8a8478',
  Gas: '#c89aff',
  City: '#c0c0d0'
};
// Foreign officers in reserve and (at their capital) the ruler and adult court of the owning house
function foreignCourt(s) {
  const f = F[s.owner];
  if (!f || s.owner === P) return [];
  const out = staffOf(s).map(id => CH[id]).filter(c => c && !c.dead);
  if (f.capital === s) {
    if (f.ruler && !f.ruler.dead) out.push(f.ruler);
    (f.heirs || []).forEach(h => {
      if (h && !h.dead && h.age >= 16) out.push(h);
    });
  }
  return [...new Set(out)].filter(c => c !== s.general && !units.some(u => u.general === c || u.char === c));
}
function pbarRender() {
  const bar = $('pbar'),
    s = selected;
  if (!bar) return;
  if (!s || P < 0) {
    bar.style.display = 'none';
    document.body.classList.remove('pb-on');
    pbSys = null;
    return;
  }
  if (s !== pbSys) {
    pbSys = s;
    pbMode = 0;
  }
  bar.style.display = 'flex';
  document.body.classList.add('pb-on');
  const own = s.owner === P,
    seen = own || inSight(s);
  const ring = s.owner >= 0 && F[s.owner] ? '#' + new THREE.Color(F[s.owner].color).getHexString() : '#888';
  const tn = geo(s).type,
    tc = Object.entries(PB_TCOL).find(([k]) => tn.includes(k))?.[1] || '#7a9ab8';
  $('pbOrb').style.borderColor = ring;
  $('pbOrb').innerHTML = `<span class="pbBall" style="background:radial-gradient(circle at 35% 30%, #fffa, ${tc} 45%, #000 120%);box-shadow:0 0 10px ${ring}"></span><small>${PB_MODES[pbMode].toUpperCase()}</small>`;
  const it = (attrs, html, cls = '') => `<div class="pbi ${cls}" ${attrs}>${html}</div>`;
  let h = '';
  if (!seen) h = `<span class="pbe">◌ No sensor contact with ${s.name}.</span>`;else if (pbMode === 0) {
    h += it('', `<b>${s.name}</b><span>${tn.replace(' World', '')}</span><span>💰${s.income} · ⚖${s.order}</span>`);
    if (s.stn) h += it('', `<span>🛰</span><span>Orbital Station</span><b>Lv ${s.stn}</b>`);
    [...s.b].forEach(b => {
      const up = s.bq?.n === b;
      h += it(own && BCHAIN[b] ? 'data-pbbld="1"' : '', `<span>${PB_BIC[b] || '🏛'}</span><span>${bName(s, b)}</span><b>Lv ${bLv(s, b)}${up ? ' ⏳' : ''}</b>`);
    });
    if (!s.stn && !s.b.size) h += `<span class="pbe">No buildings yet.</span>`;
  } else if (pbMode === 1) {
    if (s.general) h += it(`data-pbgov="1"`, `${portrait(s.general, 34)}<span>${s.general.name.split(' ')[0]}</span><span class="pbx">Governor</span>`);
    if (own) staffOf(s).forEach(id => {
      const c = CH[id];
      h += it(`data-pboff="${id}"`, `${portrait(c, 34)}<span>${c.name.split(' ')[0]}</span><span class="pbx">Reserve ⚔${c.skill}</span>`);
    });
    if (!own) foreignCourt(s).forEach(c => {
      h += it(`data-pbbio="${c.id}"`, `${portrait(c, 34)}<span>${c.name.split(' ')[0]}</span><span class="pbx">${F[s.owner].ruler === c ? rTitle(s.owner) : 'Court'} ⚔${c.skill}</span>`);
    });
    if (own) F[P].heirs.filter(c => c && !c.dead && c.age >= 16 && s === F[P].capital).forEach(c => {
      h += it(`data-pboff="${c.id}"`, `${portrait(c, 34)}<span>${c.name.split(' ')[0]}</span><span class="pbx">${celibate(P) ? 'Initiate' : 'Heir'} ⚔${c.skill}</span>`);
    });
    units.filter(u => u.sys === s && u.type === 'fleet' && (u.owner === P || seen)).forEach(u => {
      const mine = u.owner === P,
        g = u.general;
      h += it(`data-pbu="${units.indexOf(u)}"`, `${g ? `<div>${portrait(g, 34)}${mine ? `<span class="pbx" data-pbland="${units.indexOf(u)}">⤓ land</span>` : ''}</div>` : ''}<div><span>🚀 ${u.fleet}${u.legions + u.elite ? ` · 🛡${u.legions + u.elite}` : ''}</span><span>${mine ? g ? g.name.split(' ')[0] : 'No general' : F[u.owner]?.name || 'Rogue'}</span></div>`, `fl${selU === u ? ' sel' : ''}`);
    });
    h += it('', `<span>🛡 ${s.legions}</span><span>⭐ ${s.elite}</span><span class="pbx">Garrison</span>`);
    if (own) h += `<span class="pbe">Tap an officer to put him aboard a fleet in orbit.</span>`;
  } else {
    const ag = units.filter(u => u.sys === s && u.type === 'agent' && u.char);
    ag.forEach(u => {
      const mine = u.owner === P;
      h += it(mine ? `data-pbu="${units.indexOf(u)}"` : `data-pbbio="${u.char.id}"`, `${portrait(u.char, 34)}<span>${u.char.name.split(' ')[0]}</span><span class="pbx">${rn(u.role)}${mine ? u.acted ? ' · done' : '' : ` · ${F[u.owner]?.name || 'Rogue'}`}</span>`, selU === u ? 'sel' : '');
    });
    if (!ag.length) h = `<span class="pbe">No agents at ${s.name}.</span>`;
  }
  $('pbStrip').innerHTML = h;
}
$('pbOrb').onclick = e => {
  e.stopPropagation();
  pbMode = (pbMode + 1) % 3;
  pbarRender();
};
$('pbStrip').addEventListener('click', async e => {
  e.stopPropagation();
  if (busy) return;
  const s = pbSys;
  if (!s) return;
  if (e.target.closest('[data-pbbld]')) {
    await buildMenu(s);
    showInfo();
    return;
  }
  const bi = e.target.closest('[data-pbbio]');
  if (bi) {
    await bio(+bi.dataset.pbbio);
    return;
  }
  const land = e.target.closest('[data-pbland]'),
    off = e.target.closest('[data-pboff]'),
    gov = e.target.closest('[data-pbgov]'),
    un = e.target.closest('[data-pbu]');
  if (land) {
    const u = units[+land.dataset.pbland];
    if (u?.general && u.owner === P && s.owner === P) {
      const g = u.general;
      u.general = null;
      if (!s.general) {
        s.general = g;
        hist(g, `takes up the administration of ${s.name}.`);
      } else {
        station(s, g);
        log(`🎖 ${cl(g)} lands in reserve at ${s.name}.`);
      }
    }
  } else if (off) {
    const c = CH[+off.dataset.pboff];
    if (c) await boardFleet(s, c);
  } else if (gov) {
    if (s.owner !== P) {
      if (s.general) bio(s.general.id);
      return;
    }
    const r = await ask(`<h3>⚜ Governor ${s.general.name}</h3>`, ['🚀 Command a fleet in orbit', '🏛 Change governor', '📜 Biography', 'Cancel']);
    if (r.startsWith('🚀')) await boardFleet(s, s.general);else if (r.startsWith('🏛')) await changeGovernor(s);else if (r.startsWith('📜')) {
      bio(s.general.id);
      return;
    }
  } else if (un) {
    const u = units[+un.dataset.pbu];
    if (u) {
      selU = u;
      selected = u.sys;
      if (u.owner === P) say(u.general || u.char, 's');
    }
  } else return;
  refresh();
  showInfo();
});
function showInfo() {
  updateStats();
  try {
    trackOfficers();
    pbarRender();
  } catch (e) {
    console.error(e);
  }
  const s = selected,
    el = $('info');
  el.style.display = (s || selU) && P >= 0 ? 'block' : 'none';
  if (selU && units.includes(selU)) {
    unitCard(selU);
    addNav();
    return;
  }
  if (!s || P < 0) return;
  queueMicrotask(addNav);
  if (!inSight(s) && s.owner !== P) {
    el.innerHTML = `<h3>${s.name}</h3>${s.owner < 0 ? 'Unclaimed / Independent' : F[s.owner].name} <small>(last charted)</small><br><small>◌ No sensor contact. Send a fleet, agent or diplomat to learn what lies here.${s.site && !S.visited.has(s.i) ? '<br>🔭 Long-range scans hint at something worth exploring.' : ''}</small><br>`;
    if (selU && selU.owner === P) el.insertAdjacentHTML('beforeend', '<small>Tap again with a unit selected to set a course.</small>');
    return;
  }
  holyWorlds();
  const rel = s.owner >= 0 && s.owner !== P ? S.ally.has(key(P, s.owner)) ? ' 🤝 Allied' : atWar(P, s.owner) ? ' ⚔ War' : ' ☮ Peace' : '';
  el.innerHTML = `<h3>${s.name}</h3>${s.owner < 0 ? 'Rebels / Independent' : F[s.owner].name}${rel}<br>🪐 ${geo(s).type} · ${geo(s).res.map(resTag).join(' ')}<br>💰${s.income} · Order ${s.order}/10 · ✝ ${s.rel}<br>🛰 Orbital Station ${s.stn ? 'Lv' + s.stn : 'none (fleets in orbit defend)'}<br>🚀 Picket ships ${s.fleet} · 🛡 Legions ${s.legions} · ⭐ Elite ${s.elite}${s.ro && Object.keys(s.ro).length ? `<br><small>${roStr(s)}</small>` : ''}${s.spec ? `<br><small>${UNITS[s.spec].ic} Native warriors: <b>${UNITS[s.spec].n}</b> — ${UNITS[s.spec].d}</small>` : ''}<br>🏗 ${bL(s, 'no buildings')}${s.general ? `<div class="ccard">${card(s.general, 'governing')}<small>General ${s.general.name}, administering ${s.name}<br>${charStr(s.general)}</small></div>` : ''}${s.siege ? `<br>⛓ BLOCKADED by ${F[s.siege.by]?.name} for ${s.siege.turns} turns: no income, garrison starving` : ''}${s.plague ? `<br>☠ <b>GREY ROT</b> — ${s.plague} year(s) left${s.quar ? ' · 🚧 quarantined' : ''}: troops dying, −25% income, governor & reserve officers at risk (fleets in orbit are safe)${s.quar ? ' · no one may leave the surface' : ''}` : ''}<br><small>🏙 ${sizeName(s)} (size ${s.income})${s.bq ? ` · 🏗 raising ${BCHAIN[s.bq.n].lv[s.bq.to - 1]} (${s.bq.left} turn${s.bq.left > 1 ? 's' : ''})` : ''}</small>${s.holy != null ? `<br>🕍 <b>HOLY WORLD: ${HOLY[s.holy][0]}</b><br><small>${HOLY[s.holy][2]}</small>` : ''}${S.recl?.target === s ? `<br>${reclSide() === 'Zithari' ? '🌑 DARK' : '✠'} RECLAMATION TARGET` : ''}${s.ruin ? '<br>🏚 Ancient ruins (needs a general to explore)' : ''}<br>`;
  const here = units.filter(u => u.sys === s);
  if (here.length) el.insertAdjacentHTML('beforeend', '<small>Units in orbit (tap to select):</small><br>');
  here.forEach(u => btn(`${uIcon(u)} ${uName(u)}`, () => {
    selU = u;
    if (u.owner === P) say(u.general || u.char, 's');
  }));
  if (here.length) el.insertAdjacentHTML('beforeend', '<br>');
  btn('🔎 Planet Details', () => planetView(s));
  if (S.god) btn('🛠 Edit System', () => godSystem(s));
  if (s.owner === P) ownButtons(s);else if (s.owner >= 0) foreignButtons(s);else reclButtons(s);
}
function ownButtons(s) {
  const m = F[P].mods,
    k = m.cheap ? 0.6 : m.droids ? 0.7 : 1;
  if (s.general) btn(`📜 Policy: ${POL[polOf(s)].ic} ${polOf(s)}`, () => policyMenu(s));else $('info').insertAdjacentHTML('beforeend', '<small>📜 Assign a governor to issue policies.</small><br>');
  if (s.ruin && s.general) btn('🏚 Explore Ruins', () => explore(s));
  ['World Devastators', 'World Eater', 'Star Eater'].filter(w => s.b.has(w)).forEach(w => btn(`☄ Fire ${w}`, async () => {
    const tg = s.links.filter(t => t.owner !== P);
    if (!tg.length) return notify('No targets in range.');
    const c = await ask(`<h3>☄ ${w}</h3>Choose a target. This will scar the galaxy.`, [...tg.map(t => t.name), 'Cancel']);
    const t = tg.find(x => x.name === c);
    if (!t) return;
    s.b.delete(w);
    superweapon(w, t, P, s);
    const rl = F[P].ruler;
    if (rl) {
      hist(rl, `orders the ${w} at ${s.name} fired upon ${t.name}.`);
      await darkDeed(rl, 6, `firing the ${w} upon ${t.name}`);
    }
  }));
  btn('🏛 Great Works…', () => worksMenu(s));
  if ((s.stn || 0) < 3) {
    const sc = 150 * ((s.stn || 0) + 1);
    btn(`🛰 ${s.stn ? `Upgrade Orbital Station to Lv${s.stn + 1}` : 'Build Orbital Station'} (${sc})`, () => {
      if (pay(sc)) s.stn = (s.stn || 0) + 1;
    });
  }
  const syl = bLv(s, 'Shipyard'),
    shipN = syl >= 4 ? 3 : 2;
  const shipC = Math.round((m.fleetUp ? 80 : 120) * (s.b.has('Jump Beacon') ? 0.75 : 1) * (1 - 0.1 * Math.max(0, syl - 1)));
  if (s.b.has('Shipyard') && !s.siege) btn(`Build Ships +${shipN} (${shipC})`, () => {
    if (pay(shipC)) addShips(P, s, shipN);
  });
  // House levies: each house raises troops the way it actually lives — with a price
  const HREC = {
    1: ['🪓 Rim Rangers +1 elite (100) — needs a dreaded governor', () => feared(s.general), () => {
      s.elite++;
    }],
    2: ['🏴 Press-gang Crews +2 ships (60, −1 order)', () => s.b.has('Shipyard') && !s.siege, () => {
      addShips(P, s, 2);
      s.order = Math.max(0, s.order - 1);
    }],
    7: ['⛓ Slave Levy +4 legions (60, −1 slave)', () => S.slaves > 0, () => {
      S.slaves--;
      s.legions += 4;
      apoc(0.5);
    }],
    8: ['📋 Militia Draft +3 legions (100) — needs order ≥ 6', () => s.order >= 6, () => {
      s.legions += 3;
    }],
    10: ['🕊 Freed Volunteers +3 legions (70) — needs order ≥ 5', () => s.order >= 5, () => {
      s.legions += 3;
    }],
    11: ['🔥 Blood-Oath Warriors +1 elite (100, −1 order)', () => true, () => {
      s.elite++;
      s.order = Math.max(0, s.order - 1);
    }],
    12: ['⚙ Convert Prisoner → +2 elite cyborgs (60)', () => S.prisoners.length > 0, () => {
      const p = S.prisoners.shift();
      freeCaptive(p, 'is rebuilt as a Dominion cyborg soldier');
      p.dead = true;
      s.elite += 2;
      apoc(1, 'forced cybernetics');
    }],
    13: ['🔮 Bewitched Warriors +2 legions (80)', () => true, () => {
      s.legions += 2;
    }],
    14: ['🗳 Volunteers +2 legions (60) — needs order ≥ 7', () => s.order >= 7, () => {
      s.legions += 2;
    }],
    15: ['🌑 Zealots +1 elite (80, Armageddon +1)', () => true, () => {
      s.elite++;
      apoc(1, 'dark zealotry');
    }],
    16: ['⚖ Gray Wardens +1 elite (150)', () => true, () => {
      s.elite++;
    }]
  }[P];
  if (HREC && HREC[1]()) {
    const c = +HREC[0].match(/\((\d+)/)[1];
    btn(HREC[0], () => {
      if (pay(c)) {
        HREC[2]();
        showInfo();
      }
    });
  }
  // Special recruitment: local planetary units, faction uniques, mercenary guilds
  const recruit = key => {
    const U = UNITS[key];
    if (!pay(U.c)) return;
    roAdd(s, key, 1);
    if (U.guild) {
      const gf = F.find(x => fkey(x) === U.guild);
      if (gf) gf.gold += Math.round(U.c / 2);
    }
    log(`${U.ic} ${U.n} muster at ${s.name}${U.k === 'space' ? ' (muster them into a fleet in orbit)' : ''}.`);
  };
  if (s.spec) btn(`${UNITS[s.spec].ic} Local: ${UNITS[s.spec].n} (${UNITS[s.spec].c})`, () => recruit(s.spec));
  const fu = FACTION_UNIQUE[fkey(F[P])];
  if (fu && (UNITS[fu].k === 'space' ? s.b.has('Shipyard') : s.b.has('Barracks'))) btn(`${UNITS[fu].ic} ${UNITS[fu].n} (${UNITS[fu].c})`, () => recruit(fu));
  if (s.b.has('Mercenary Guild')) btn('🤝 Mercenary Guild…', async () => {
    S.mercPool ??= {};
    const stocked = k => MERC_UNIT_SELLER[k] != null;
    const ok = k => stocked(k) ? (S.mercPool[k] || 0) > 0 : (() => {
      const gf = F.find(x => fkey(x) === UNITS[k].guild);
      return gf && gf.alive && !atWar(P, gf.id) && !hostile(gf);
    })();
    const list = Object.keys(UNITS).filter(k => UNITS[k].guild && !(stocked(k) && MERC_UNIT_SELLER[k] === P));
    const lb = k => `${UNITS[k].ic} ${UNITS[k].n} (${UNITS[k].c})`;
    const tag = k => stocked(k) ? (S.mercPool[k] || 0) > 0 ? ` · <b style="color:#8f8">${S.mercPool[k]} in stock</b>` : ' · <span style="color:#f88">sold out — wait for new stock</span>' : ok(k) ? '' : ' · <span style="color:#f88">unavailable (at war or fallen)</span>';
    const r = await ask(`<h3>🤝 Mercenary Guild of ${s.name}</h3><small>Clone and AI troops are stocked by the Cloning Guild and the AI Alliance; other guilds hire out directly.</small><div class="scroll">${list.map(k => `<p><b>${lb(k)}</b> — ${UNITS[k].d}<br><small>${UNITS[k].k === 'space' ? '🚀 warship' : '🪖 ground'} · from ${UNITS[k].guild}${tag(k)}</small></p>`).join('')}</div>`, [...list.filter(ok).map(lb), 'Close']);
    const k = list.find(x => lb(x) === r);
    if (k) {
      if (stocked(k)) {
        const U = UNITS[k];
        if (pay(U.c)) {
          S.mercPool[k]--;
          roAdd(s, k, 1);
          log(`${U.ic} ${U.n} hired from the Mercenary Guild at ${s.name}.`);
        }
      } else recruit(k);
    }
    showInfo();
  });
  // Cloning Guild / AI Alliance: sell your own troops to the Mercenary Guild for instant credits
  if (MERC_SELLERS[P] && (s.b.has('Barracks') || s.b.has('Shipyard')) && s.mercT !== S.turn) btn('📦 Sell troops to the Mercenary Guild…', async () => {
    const can = MERC_SELLERS[P].filter(k => (S.mercPool?.[k] || 0) < 12).filter(k => UNITS[k].k === 'space' ? s.b.has('Shipyard') && s.fleet >= 2 : s.b.has('Barracks') && s.legions >= 2);
    const lb = k => `${UNITS[k].ic} ${UNITS[k].n} → +${Math.round(UNITS[k].c * 0.7)}`;
    const r = await ask(`<h3>📦 Sell to the Mercenary Guild</h3>Each sale turns 2 legions (or 2 ships) from ${s.name} into one ${P === 6 ? 'clone' : 'AI'} mercenary unit in the galaxy-wide stock. Any house with a Mercenary Guild may hire it, including your enemies.<br><small>One sale per world per turn. Stock now: ${MERC_SELLERS[P].map(k => `${UNITS[k].n} ${S.mercPool?.[k] || 0}`).join(' · ')}</small>`, [...can.map(lb), 'Close']);
    const k = can.find(x => lb(x) === r);
    if (k) {
      if (UNITS[k].k === 'space') s.fleet -= 2;else s.legions -= 2;
      s.mercT = S.turn;
      const got = mercSell(P, k);
      log(`📦 ${UNITS[k].n} sold to the Mercenary Guild from ${s.name} for ${got} credits.`);
    }
    showInfo();
  });
  const rel = F[P].rel,
    ac = {
      Diplomat: 120,
      Spy: 150,
      Assassin: m.spice ? 90 : 180
    };
  if (s.b.has('Market')) ac.Trader = 100;
  if (s.b.has('Temple') && rel === 'Order') ac.Priest = 120;
  if (s.b.has('Temple') && rel === 'Zithari') ac.Zithari = 130;
  if (P === 0 && s.b.has('Temple')) ac.Master = 300;
  if (P === 13) ac.Witch = 160;
  Object.entries(ac).forEach(([r, c]) => {
    btn(`${AICON[r]} Recruit ${rn(r)} (${c})`, () => {
      if (!pay(c)) return;
      const a = addAgent(P, s, r);
      if (r !== 'Priest') hist(a.char, `is recruited as a ${rn(r)} at ${s.name}.`);else log(`✝ A Nameless Monk takes up service at ${s.name}.`);
      if (r === 'Zithari' || r === 'Witch') st(P, -1, `harbouring a ${rn(r)}`);
    });
  });
  const bxl = bLv(s, 'Barracks'),
    levy = (m.cheap ? 4 : m.droids ? 3 : 2) + (bxl >= 3 ? 1 : 0);
  if (s.b.has('Barracks')) btn(`${m.droids ? 'AI ' : ''}Legions +${levy} (${Math.round(90 * k)})`, () => {
    if (pay(Math.round(90 * k))) s.legions += levy;
  });
  if (bxl >= 2) btn(`🛡 Household Knights +1 elite (160)`, () => {
    if (pay(160)) s.elite++;
  });
  if (m.monk || F[P].rel === 'Order' && s.b.has('Temple')) btn(`Nameless Monks (${m.monk ? 120 : 180})`, () => {
    if (pay(m.monk ? 120 : 180)) s.elite++;
  });
  if (m.spice) {
    btn('Bounty Hunter (90)', () => {
      if (pay(90)) s.elite++;
    });
    btn('Mercenaries +3 (200)', () => {
      if (pay(200)) s.legions += 3;
    });
  }
  if (m.bank) btn('Bloodknights (220)', () => {
    if (pay(220)) s.elite += 1;
  });
  if (P === 1 && (S.prisoners.length || S.slaves)) btn('Conscript Prisoners', () => {
    if (S.prisoners.length) S.prisoners.shift();else S.slaves--;
    s.legions += 3;
    apoc(1, 'forced conscription');
  });
  if (!s.built) {
    const B = {
      Shipyard: 200,
      Barracks: 150,
      Temple: 200,
      Market: 250,
      Brothel: 150,
      Hospice: 180,
      'Mercenary Guild': 250
    };
    if (P === 4) B.Mine = 300;
    if (FBLD[P]) B[FBLD[P][0]] = FBLD[P][1];
    if (FBLD[P] && !s.b.has(FBLD[P][0])) $('info').insertAdjacentHTML('beforeend', `<small>🏛 House building — ${FBLD[P][0]}: ${FBLD[P][2]}</small><br>`);
    Object.entries(B).filter(([n]) => !s.b.has(n)).forEach(([n, c]) => btn(`Build ${BCHAIN[n]?.lv[0] || n} (${c})`, () => {
      if (pay(c)) {
        s.b.add(n);
        (s.lv ??= {})[n] = 1;
        s.built = true;
        if (n === 'Temple') {
          apoc(-1, 'temple consecrated');
          if (F[P].rel === 'Order') st(P, 1, 'temple consecrated');
        }
      }
    }));
  }
  if ([...s.b].some(b => BCHAIN[b])) btn(`🏗 Buildings & Upgrades${s.bq ? ' (building…)' : ''}`, () => buildMenu(s));
  if (s.plague) btn(s.quar ? '🚧 Lift the quarantine' : '🚧 Quarantine the world', () => {
    s.quar = !s.quar;
    log(`🚧 ${s.name} ${s.quar ? 'is sealed under quarantine' : 'is opened again'}.`);
    refresh();
    showInfo();
  });
  btn(s.general ? '⚜ Change Governor' : '⚜ Appoint Governor', () => changeGovernor(s));
}
// Appoint, swap or dismiss the governor of one of your worlds
async function changeGovernor(s) {
  const opts = [];
  F[P].heirs.filter(h => h.age >= 14 && !h.dead).forEach(h => opts.push([h, `From court: ${h.name}`, () => {
    F[P].heirs.splice(F[P].heirs.indexOf(h), 1);
  }]));
  units.filter(u => u.owner === P && u.type === 'fleet' && u.sys === s && u.general).forEach(u => opts.push([u.general, `From fleet in orbit: ${u.general.name}`, () => {
    u.general = null;
  }, u]));
  staffOf(s).map(id => CH[id]).forEach(c => opts.push([c, `From reserve: ${c.name}`, () => unstation(c)]));
  const cur = s.general;
  const none = !opts.length ? `<div class="noact">No candidates available. To appoint someone, either keep a grown heir (14+) at court, or move a fleet with a general aboard into orbit of ${s.name}. Generals can move here even after acting — governors can be swapped any time the general is in orbit.</div>` : '';
  const r = await ask(`<h3>⚜ Governor of ${s.name}</h3>${cur ? `<div class="ccard">${card(cur, 'governing')}<small>${charStr(cur)}</small></div>` : '<small>No one governs this world. A governor enforces edicts and adds Administration to public order.</small>'}${none}<div class="frow">${opts.map(o => card(o[0])).join('')}</div><small>Candidates: grown heirs at court, and generals of your fleets orbiting ${s.name}. The old governor boards a fleet in orbit, returns to court if family, or is dismissed.</small>`, [...opts.map(o => `${o[1]} · Cmd ${o[0].skill} · Adm ${o[0].admin ?? 0}`), ...(cur ? ['Dismiss governor'] : []), 'Cancel']);
  const pick = opts.find(o => r.startsWith(o[1]));
  if (!pick && r !== 'Dismiss governor') return;
  if (cur) {
    const fl = pick?.[3] || units.find(u => u.owner === P && u.type === 'fleet' && u.sys === s && !u.general);
    const family = F[P].ruler && (cur.father === F[P].ruler.id || CH[cur.father]?.f === P || cur.adopted);
    if (fl && (pick?.[3] || !fl.general)) {
      if (pick?.[3]) pick[2]();
      fl.general = cur;
      hist(cur, `leaves the governorship of ${s.name} to command a fleet.`);
    } else if (family) {
      F[P].heirs.push(cur);
      hist(cur, `returns to court from ${s.name}.`);
    } else if (r === 'Dismiss governor') {
      cur.loyalty = Math.max(0, cur.loyalty - 2);
      s.general = null;
      station(s, cur);
      hist(cur, `is dismissed as governor of ${s.name} and waits bitterly in reserve.`);
    } else {
      s.general = null;
      station(s, cur);
      hist(cur, `steps down as governor of ${s.name} and joins the reserve.`);
    }
    if (pick && !pick[3]) pick[2]();
  } else if (pick) pick[2]();
  s.general = pick ? pick[0] : null;
  if (pick) {
    hist(pick[0], `is appointed governor of ${s.name}.`);
    say(pick[0], 's');
  }
}
// ===== M2TW-style negotiation: your diplomat (or princess) sits at their court and puts one proposal at a time =====
// Treaties: S.pacts [{a: payer, b: receiver, amt, left}] (tribute for x turns), S.trade Set of key(a,b) (trade rights)
function cede(s, to, why) {
  const from = s.owner,
    g = s.general;
  if (g && g.f === from) {
    s.general = null;
    const cap = F[from]?.capital;
    if (cap && cap.owner === from && cap !== s) station(cap, g);
  }
  delete s.gw;
  delete s.bq;
  s.owner = to;
  log(`📜 ${F[from]?.name} cedes ${s.name} to ${F[to]?.name}${why ? ' — ' + why : ''}.`);
  checkDead(from);
}
function pactTick() {
  S.pacts ??= [];
  S.trade ??= new Set();
  for (const k of [...S.trade]) {
    const [a, b] = k.split('|').map(Number);
    if (!F[a]?.alive || !F[b]?.alive || atWar(a, b)) {
      S.trade.delete(k);
      continue;
    }
    F[a].gold += 12;
    F[b].gold += 12;
  }
  S.pacts = S.pacts.filter(p => {
    const a = F[p.a],
      b = F[p.b];
    if (!a?.alive || !b?.alive || atWar(p.a, p.b)) return false;
    if (a.gold < p.amt) {
      grudge(p.b, p.a, -6, 'unpaid tribute');
      log(`💸 ${a.name} cannot pay its tribute to ${b.name} — the treaty is broken.`);
      if (!isHuman(p.b) && Math.random() < 0.3 + persona(b.ruler).agg * 0.3) declareWar(p.b, p.a);
      return false;
    }
    a.gold -= p.amt;
    b.gold += p.amt;
    if (--p.left <= 0) {
      log(`📜 ${a.name}'s tribute to ${b.name} is paid in full.`);
      grudge(p.b, p.a, 2, 'tribute paid in full');
      return false;
    }
    return true;
  });
}
async function negotiate(s, dip) {
  const fid = s.owner,
    f = F[fid];
  const D = (ok, txt) => WA('dip', {
    a: dip?.id,
    f: P,
    to: fid,
    s: s.i,
    ok,
    txt
  });
  const pw = id => systems.filter(x => x.owner === id).reduce((t, x) => t + spacePow(x) + landPow(x), 0) + units.filter(u => u.owner === id && u.type === 'fleet').reduce((t, u) => t + spacePow(u), 0);
  const isPr = units.find(u => u.char === dip)?.role === 'Princess';
  while (F[fid]?.alive && F[P]?.alive) {
    S.trade ??= new Set();
    S.pacts ??= [];
    S.charts ??= [];
    const op = opinion(fid, P),
      hh = houseHate(fid, P),
      war = atWar(P, fid),
      allied = S.ally.has(key(P, fid));
    const myPow = pw(P),
      thPow = Math.max(1, pw(fid)),
      ratio = myPow / thPow,
      p = persona(f.ruler);
    const sk = isPr ? dip.charm ?? dip.skill ?? 3 : dip?.skill ?? 3;
    // Their willingness: goodwill, the envoy's gift, hatred; for demands, fear of your power
    const odds = (base, fear = 0) => clamp(base + op * 0.025 + (sk - 4) * 0.03 - hh * 0.015 + fear * clamp(ratio - 1, -1, 3) * (1.1 - p.agg * 0.6), 0.02, 0.95);
    const O = [];
    const add = (label, fn) => O.push([label, fn]);
    const tryIt = async (ch, good, okTxt, noTxt, onOk, onNo) => {
      const ok = Math.random() < ch;
      D(ok, ok ? good : `${good} — refused`);
      if (ok) {
        await onOk?.();
        gain(dip, 'skill');
        await notify(`✅ ${okTxt}`);
      } else {
        await onNo?.();
        await notify(`❌ ${noTxt}`);
      }
      refresh();
      showInfo();
    };
    const border = systems.filter(x => x.owner === fid && x !== f.capital && x.links.some(l => l.owner === P)).slice(0, 5);
    const mine = systems.filter(x => x.owner === P && x !== F[P].capital && x.links.some(l => l.owner === fid)).slice(0, 5);
    if (war) {
      add(`🕊 Ceasefire · ${pct(odds(0.25 + (ratio > 1 ? 0.25 : 0) + p.honor * 0.1))}%`, () => tryIt(odds(0.25 + (ratio > 1 ? 0.25 : 0) + p.honor * 0.1), 'proposes a ceasefire', `${f.name} agrees to a ceasefire.`, 'They will fight on.', () => makePeace(P, fid)));
      for (const t of border.slice(0, 3)) {
        const ch = odds(-0.15, 0.25);
        add(`🏳 Peace if they cede ${t.name} · ${pct(ch)}%`, () => tryIt(ch, `demands ${t.name} as the price of peace`, `${f.name} makes peace and cedes ${t.name}.`, 'They refuse to give up a single world.', () => {
          makePeace(P, fid);
          cede(t, P, 'the price of peace');
          grudge(fid, P, -4, `the loss of ${t.name}`);
        }));
      }
    } else {
      if (!S.charts.includes(fid)) {
        const ch = odds(0.4 + (allied ? 0.3 : 0));
        add(`🗺 Map information · ${pct(ch)}%`, () => tryIt(ch, 'exchanges star charts', `${f.name} shares their star charts.`, 'They guard their charts jealously.', () => {
          S.charts.push(fid);
          systems.filter(x => x.owner === fid).forEach(x => {
            S.seen.add(x.i);
            x.links.forEach(l => S.seen.add(l.i));
          });
        }));
      }
      if (!S.trade.has(key(P, fid))) {
        const ch = odds(0.35 + (allied ? 0.25 : 0));
        add(`💱 Trade rights (+12/turn each) · ${pct(ch)}%`, () => tryIt(ch, 'proposes trade rights', `Trade rights agreed with ${f.name}.`, 'They want no trade with you.', () => {
          S.trade.add(key(P, fid));
          grudge(fid, P, 2, 'trade rights');
        }));
      } else add('💱 Cancel trade rights', async () => {
        S.trade.delete(key(P, fid));
        grudge(fid, P, -2, 'cancelled trade rights');
        D(true, 'cancels trade rights');
        refresh();
        showInfo();
      });
      if (!allied) {
        const ch = odds(0.25);
        add(`🤝 Offer alliance · ${pct(ch)}%`, () => tryIt(ch, 'offers an alliance', `Alliance formed with ${f.name}!`, 'They decline.', () => {
          ally(P, fid);
          apoc(-1, 'alliance');
        }));
      }
      for (const t of border.slice(0, 3)) {
        const ch = odds(-0.25, 0.3);
        add(`⚔ Cede ${t.name} or face war · ${pct(ch)}%`, () => tryIt(ch, `demands ${t.name} — accept or face war`, `${f.name} yields ${t.name} rather than fight.`, `${f.name} refuses. It is war.`, () => {
          cede(t, P, 'under threat of war');
          grudge(fid, P, -6, `${t.name} taken by threat`);
        }, () => {
          grudge(fid, P, -4, 'an ultimatum');
          declareWar(P, fid);
        }));
      }
      for (const amt of [100, 300]) {
        const ch = odds(-0.1 - amt / 1000, 0.25);
        if (f.gold >= amt) add(`💰 Demand ${amt} credits · ${pct(ch)}%`, () => tryIt(ch, `demands ${amt} credits`, `${f.name} pays ${amt} credits.`, 'They refuse to pay.', () => {
          f.gold -= amt;
          F[P].gold += amt;
          grudge(fid, P, -3, 'a payment extorted');
        }, () => grudge(fid, P, -1, 'a demand for gold')));
      }
      {
        const amt = Math.max(20, Math.round(thPow / 40) * 5),
          ch = odds(-0.2, 0.25);
        add(`📜 Demand tribute ${amt}/turn for 10 turns · ${pct(ch)}%`, () => tryIt(ch, `demands tribute of ${amt} a turn`, `${f.name} agrees to pay ${amt} credits a turn for 10 turns.`, 'They will not pay tribute.', () => {
          S.pacts.push({
            a: fid,
            b: P,
            amt,
            left: 10
          });
          grudge(fid, P, -4, 'tribute extorted');
        }, () => grudge(fid, P, -2, 'a demand for tribute')));
      }
      const lg = liegeOf(fid);
      if (liegeOf(P) === fid) add('⛓ Renounce vassalage', async () => {
        freeVassal(P, 'renounced by its vassal');
        grudge(fid, P, -6, 'a broken oath of fealty');
        D(true, `renounces vassalage to ${f.name}`);
        if (Math.random() < 0.5 + p.agg * 0.3) declareWar(fid, P);
        refresh();
        showInfo();
      });else if (lg === P) {
        add(paysTrib(fid) ? `🕊 Waive vassal tribute (~${tribOf(fid)}/yr)` : '💰 Demand vassal tribute again', async () => {
          const on = !paysTrib(fid);
          setTrib(fid, on);
          grudge(fid, P, on ? -3 : 3, on ? 'tribute demanded again' : 'tribute waived');
          refresh();
          showInfo();
        });
        add('🕊 Release vassal', async () => {
          freeVassal(fid, 'released by its liege');
          grudge(fid, P, 4, 'release from vassalage');
          D(true, `releases ${f.name} from vassalage`);
          refresh();
          showInfo();
        });
      } else if (vassOK(P) && vassOK(fid) && liegeOf(P) == null) {
        if (lg == null) {
          const ch = submitOdds(P, fid, sk) * clamp(1 - hh * 0.02, 0.3, 1);
          add(`👑 Demand vassalage · ${pct(ch)}%`, () => tryIt(ch, `demands the submission of ${f.name}`, `${f.name} bends the knee and becomes your vassal.`, 'They refuse to kneel.', () => swearFealty(fid, P, 'cowed by your might'), () => grudge(fid, P, -4, 'a demand to kneel')));
        }
        if (!vassalsOf(P).length) {
          const ch = fealtyAcceptOdds(fid, P, sk);
          add(`🙇 Offer vassalage · ${pct(ch)}%`, () => tryIt(ch, `offers ${F[P].name} as a vassal`, `You are now a vassal of ${f.name}.`, 'They will not take your oath.', () => swearFealty(P, fid, 'seeking protection')));
        }
      }
    }
    // Gifts always land
    for (const amt of [100, 300]) if (F[P].gold >= amt) add(`🎁 Give ${amt} credits`, async () => {
      if (!pay(amt)) return;
      f.gold += amt;
      grudge(fid, P, Math.round(amt / 50), 'a generous gift');
      D(true, `gives ${amt} credits`);
      await notify(`🎁 ${f.name} accepts your gift warmly.`);
      refresh();
      showInfo();
    });
    {
      const amt = 25;
      add(`📜 Offer tribute ${amt}/turn for 10 turns`, async () => {
        S.pacts.push({
          a: P,
          b: fid,
          amt,
          left: 10
        });
        grudge(fid, P, 5, 'tribute offered');
        if (war && Math.random() < 0.4 + p.honor * 0.2) {
          makePeace(P, fid);
          await notify(`🕊 ${f.name} accepts your tribute and makes peace.`);
        } else await notify(`📜 ${f.name} accepts your tribute.`);
        D(true, `offers tribute of ${amt} a turn`);
        refresh();
        showInfo();
      });
    }
    for (const t of mine.slice(0, 2)) add(`🎁 Give them ${t.name}`, async () => {
      if ((await ask(`<h3>🎁 Give ${t.name} to ${f.name}?</h3>The world and its people pass to them for good.`, ['Give', 'Back'])) !== 'Give') return;
      cede(t, fid, 'a gift');
      grudge(fid, P, 10, `the gift of ${t.name}`);
      if (war && Math.random() < 0.6) makePeace(P, fid);
      D(true, `gives ${t.name} to ${f.name}`);
      refresh();
      showInfo();
    });
    // A princess at their court may offer her own hand to their ruler, heir or a general
    if (isPr && !dip.spouse && !dip.betrothed && !war && !celibate(fid)) {
      const men = [...new Set([f.ruler, ...(f.heirs || []), ...systems.filter(x => x.owner === fid && x.general).map(x => x.general), ...units.filter(u => u.owner === fid && u.general).map(u => u.general)])].filter(m => m && !m.dead && !m.fem && m.age >= 16 && mayWed(m) && (m.spouse == null || CH[m.spouse]?.dead) && (m.betrothed == null || CH[m.betrothed]?.dead)).slice(0, 4);
      for (const m of men) {
        const rank = m === f.ruler ? 'ruler' : (f.heirs || []).includes(m) ? 'heir' : 'general',
          ch = odds(0.35 + (rank === 'general' ? 0.25 : 0) - hateOf(fid, dip) * 0.03);
        add(`💍 Wed ${dip.name} to ${m.name} (${rank}) · ${pct(ch)}%`, () => tryIt(ch, `offers the hand of ${dip.name} to ${m.name}`, `${dip.name} weds ${m.name}${rank !== 'general' ? ' — the houses are allied' : ''}.`, 'They decline the match.', () => {
          const u = units.find(x => x.char === dip);
          F[P].princesses = (F[P].princesses || []).filter(x => x !== dip);
          wed(m, dip);
          if (u) removeUnit(u);
          if (rank !== 'general') ally(P, fid, `sealed by the marriage of ${dip.name}`);
          grudge(fid, P, 5, `the marriage of ${dip.name}`);
        }));
      }
    }
    const pacts = S.pacts.filter(x => x.a === P && x.b === fid || x.a === fid && x.b === P);
    const head = `<h3>📜 Negotiations with ${f.name}</h3><div class="ccard">${portrait(f.ruler, 56)}<div style="font-size:12px"><b>${cl(f.ruler)}</b> receives ${dip?.name || 'your envoy'}.<br>Mood: <b>${moodTxt(op)}</b> (${Math.round(op)})${hh >= 5 ? ` · <span style="color:#f88">their lords hate yours (${Math.round(hh)})</span>` : ''}<br>Strength: you ${Math.round(myPow)} vs them ${Math.round(thPow)}${S.trade.has(key(P, fid)) ? '<br>💱 Trade rights in force' : ''}${pacts.map(x => `<br>📜 ${F[x.a].name} pays ${x.amt}/turn (${x.left} left)`).join('')}</div></div><small>Demands weigh your strength against their ruler's temper; offers weigh their goodwill and your envoy's skill.</small>`;
    const r = await ask(head, [...O.map(o => o[0]), 'Close']);
    const pick = O.find(o => o[0] === r);
    if (!pick) return;
    await pick[1]();
  }
}
function diploButtons(s, dip) {
  const fid = s.owner,
    f = F[fid];
  const D = (ok, txt) => WA('dip', {
    a: dip?.id,
    f: P,
    to: fid,
    s: s.i,
    ok,
    txt
  });
  const myPow = systems.filter(x => x.owner === P).reduce((t, x) => t + spacePow(x) + landPow(x), 0);
  const thPow = systems.filter(x => x.owner === fid).reduce((t, x) => t + spacePow(x) + landPow(x), 0);
  if (!hostile(f)) {
    const op = opinion(fid, P),
      why = S.memWhy?.[mkey(fid, P)];
    const lg = liegeOf(fid),
      vs = vassalsOf(fid);
    $('info').insertAdjacentHTML('beforeend', `<br><small>Their view of you: <b>${moodTxt(op)}</b> (${Math.round(op)})${why ? ` — remembers ${why}` : ''}${lg != null ? `<br>🙇 Vassal of <b>${F[lg].name}</b>` : ''}${vs.length ? `<br>👑 Liege of ${vs.map(v => F[v].name).join(', ')}` : ''}</small><br>`);
    btn(`📜 Negotiate with ${f.name}`, () => negotiate(s, dip));
    if (!atWar(P, fid)) {
      btn('Declare War', () => declareWar(P, fid));
      // Hyperways: jointly built lanes between your world and theirs
      const opts = [];
      systems.filter(a => a.owner === P).forEach(a => systems.filter(b => b.owner === fid && !a.links.includes(b) && a.pos.distanceTo(b.pos) < 22).forEach(b => opts.push([a, b, a.pos.distanceTo(b.pos)])));
      opts.sort((x, y) => x[2] - y[2]);
      if (opts.length) {
        const [a, b] = opts[0],
          cost = 150,
          ch = clamp(0.35 + dip.skill * 0.05 + (S.ally.has(key(P, fid)) ? 0.25 : 0), 0.1, 0.95);
        btn(`🛣 Forge Hyperway ${a.name} ⇄ ${b.name} (${cost}cr, ${Math.round(ch * 100)}%)`, async () => {
          if (F[P].gold < cost) {
            await notify('Not enough credits.');
            return;
          }
          if (Math.random() < ch) {
            F[P].gold -= cost;
            link(a, b);
            (S.hyper ??= []).push([a.i, b.i]);
            WA('hyper', {
              f: P,
              to: fid,
              s: a.i,
              s2: b.i,
              a: dip?.id
            });
            gain(dip, 'skill');
            hist(dip, `negotiates a hyperway between ${a.name} and ${b.name}.`);
            log(`🛣 Hyperway forged: ${a.name} ⇄ ${b.name}.`);
            await notify(`Hyperway forged! ${a.name} and ${b.name} are now linked. +15 credits/turn to both sides while at peace.`);
          } else {
            D(false, `is refused a hyperway ${a.name} ⇄ ${b.name}`);
            await notify('They refuse to open a hyperway.');
          }
          refresh();
          showInfo();
        });
      }
    }
    const w = S.wards.find(x => x.f === fid);
    if (w) btn(`Return ward ${w.name}`, () => {
      S.wards.splice(S.wards.indexOf(w), 1);
      F[fid].heirs.push(w);
      S.war.delete(key(P, fid));
      apoc(-2, 'ward returned');
      grudge(fid, P, 8, `the safe return of ${w.name}`);
    });
  }
  // Disloyal fleet commanders in orbit can be bought, ships and all
  if (!f.domiri && !f.mods?.ff) for (const u of units.filter(x => x.sys === s && x.type === 'fleet' && x.owner === fid && x.general && x.general !== f.ruler && !x.general.undying).slice(0, 2)) {
    const g = u.general,
      cost = 60 * (11 - (g.loyalty ?? 5));
    const bp = clamp((g.loyalty < 6 ? 0.6 : 0.15) + (dip?.skill || 0) * 0.02 - (has(g, 'Loyal') ? 0.2 : 0) + (has(g, 'Greedy') ? 0.15 : 0), 0.05, 0.85);
    btn(`💰 Bribe ${g.name}'s fleet (${cost}) · ${pct(bp)}%`, async () => {
      if (!pay(cost)) return;
      const ok = Math.random() < bp;
      D(ok, ok ? `bribes ${g.name} into bringing his fleet over` : `offers ${g.name} a bribe and is refused`);
      if (ok) {
        u.owner = P;
        delete u.hunt;
        if (g.f === 1) g.oathbroken = true;
        if (f.heirs) f.heirs = f.heirs.filter(h => h !== g);
        g.f = P;
        g.loyalty = 5;
        apoc(1, 'bribery');
        hist(g, `is bribed into the service of ${F[P].name} with his fleet.`);
        grudge(fid, P, -6, `buying ${g.name} and his fleet`);
        await notify(`💰 ${g.name} brings his fleet over to you!`);
      } else {
        grudge(fid, P, -3, 'an attempted bribe');
        await notify('The bribe is refused.');
      }
      refresh();
      showInfo();
    });
  }
  if (s.general && !f.domiri && !f.mods?.ff && f.ruler !== s.general) {
    // a ruler cannot be bribed away from his own throne
    const g = s.general,
      cost = 80 * (11 - g.loyalty);
    const bp = clamp((g.loyalty < 6 ? 0.7 : 0.2) + (dip?.skill || 0) * 0.02 - (g.traits?.includes('Loyal') ? 0.2 : 0) + (g.traits?.includes('Greedy') ? 0.15 : 0), 0.05, 0.9);
    btn(`Bribe ${g.name} (${cost}) · ${pct(bp)}%`, async () => {
      if (!pay(cost)) return;
      const okR = Math.random() < bp;
      D(okR, okR ? `bribes ${g.name} into defecting with ${s.name}` : `offers ${g.name} a bribe and is refused`);
      if (okR) {
        s.owner = P;
        if (g.f === 1) g.oathbroken = true;
        g.f = P;
        g.loyalty = 5;
        apoc(1, 'bribery');
        hist(g, `is bribed into the service of ${F[P].name}.`);
        await notify(`${g.name} defects with ${s.name}!${fid === 1 ? ' He abandons his Nightfleet oath — his exilers will execute him if they catch him.' : ''}`);
        checkDead(fid);
      } else await notify('The bribe is refused.');
    });
    if (s.links.some(x => x.owner === P)) {
      const c = P === 3 ? 80 : 200;
      const o = killOdds(P === 3 ? 0.5 : 0.35, [`${P === 3 ? 50 : 35}% base (hired hunter${P === 3 ? ', guild rates' : ''})`], g, s);
      btn(`Bounty Hunter contract (${c}) · ${pct(o.p)}%`, async () => {
        if (!(await confirmOdds(`🗡 Contract on ${g.name}`, o))) return;
        if (!pay(c)) return;
        apoc(2, 'assassination');
        const okB = Math.random() < o.p;
        WA('kill', {
          a: null,
          f: P,
          t: g.id,
          tf: g.f,
          s: s.i,
          ok: okB,
          r: okB ? vRank(g) : ''
        });
        if (okB) {
          const wasR = setFate(g, 'dead');
          hist(g, 'is assassinated by a bounty hunter.');
          await notify(`${g.name} has been assassinated.`);
          if (wasR) await succession(fid, 'was assassinated');
        } else {
          survivedAttempt(g, 'a bounty hunter');
          grudge(fid, P, -6, 'a bounty on their kin');
          const dies = Math.random() < Math.max(0.45, unmaskOdds(counterIntel(g.f, s, g)));
          await notify(`❌ <b>The contract failed.</b> ${g.name} survives and will be harder to reach.${dies ? `<br>☠ The hunter is cut down by ${g.name}'s guards — and talks before he dies.` : '<br>The hunter slips away into the dark.'}`);
          if (dies) grudge(fid, P, -2, 'a hired killer who confessed');
        }
      });
    }
  }
  if (fid === 5 && P !== 5 && !S.loans.some(l => l.debtor === P)) btn('🩸 Look into a loan', () => loanOffer(dip));
  if (P === 5 && !hostile(f) && !S.loans.some(l => l.debtor === fid)) btn('Offer Loan (500 → 650)', async () => {
    if (Math.random() < 0.6 && pay(500)) {
      f.gold += 500;
      S.loans.push({
        debtor: fid,
        owe: 650,
        due: S.turn + 10
      });
      await notify('Loan accepted.');
    } else await notify('They decline.');
  });
  if (P === 1 && fid !== 1 && !atWar(P, fid) && (S.nmAsked ??= {})[fid] !== S.year) {
    const o = nmGiveOdds(fid, dip?.skill ?? 4);
    btn(`🧭 Plead for the rim · ${pct(o)}%`, async () => {
      S.nmAsked[fid] = S.year;
      const got = nmAnswer(fid, dip?.skill ?? 4, 0, dip, s);
      if (got) {
        gain(dip, 'skill');
        hist(dip, `wins ${got} credits for the rim from ${f.name}.`);
      }
      await notify(got ? `🧭 ${f.name} hears out ${dip?.name || 'your envoy'} and gives ${got} credits to the rim.` : `${f.name} sends your envoy away empty-handed.`);
      refresh();
      showInfo();
    });
  }
  if (fid === 1) btn('Donate 100 to Nightfleet', () => {
    if (pay(100)) {
      F[1].gold += 100;
      nmDonate(P, 100);
      apoc(-2, 'donation');
    }
  });
  if (fid === 0 && P !== 0) btn('Donate 200 to the Nameless (+2 standing)', () => {
    if (pay(200)) {
      F[0].gold += 200;
      st(P, 2, 'donation');
    }
  });
}
async function court() {
  courtMusic();
  const f = F[P];
  const respected = f.ruler.respect >= 1 || systems.some(s => s.owner === P && s.general && s.general.respect >= 2);
  const pst = p => p.betrothed && CH[p.betrothed] ? `💍 ${CH[p.betrothed].name.split(' ')[0]}` : p.age < 14 ? 'too young' : p.age < 16 ? 'may betroth' : 'may marry';
  let h = `<h3>Court of ${f.name}</h3><div class="ccard">${portrait(f.ruler, 76)}<div style="font-size:12px">👑 ${rTitle(P)} ${cl(f.ruler)}<br>${charStr(f.ruler)}${CH[f.ruler.spouse] ? `<br>⚭ ${cl(CH[f.ruler.spouse])}` : ''}</div></div>`;
  if (celibate(f.id)) h += `<div class="flab">Sworn Initiates (no heirs; ruler is elected)</div><div class="frow">${f.heirs.map(x => card(x)).join('') || '<small>none</small>'}</div>`;else {
    const ord = heirOrder(f),
      hr = ord[0];
    h += `<div class="flab">${hTitle(P, hr)}</div><div class="frow">${hr ? card(hr, hTitle(P, hr)) : '<small>none — a distant cousin would inherit</small>'}</div>`;
    if (ord.length > 1) h += `<div class="flab">${f.mods?.coven ? 'Sisters' : 'Princes'} (line of succession)</div><div class="frow">${ord.slice(1).map((x, i) => card(x, `${i + 2}. ${pTitle(P, x)}`)).join('')}</div>`;
    h += `<small style="opacity:.7">${P === 2 ? 'Succession: closest in blood to the Dread Lord.' : 'Succession: primogeniture — the eldest son of the ruler first, then his brothers, then the eldest kin.'}</small>`;
  }
  h += `<div class="flab">Princesses</div><div class="frow">${f.princesses.map(p => card(p, pst(p))).join('') || '<small>none</small>'}</div>`;
  if (f.bastards?.length) h += `<div class="flab">Base-born daughters <small>(legitimise to make them princesses)</small></div><div class="frow">${f.bastards.map(p => card(p, `Age ${p.age}`)).join('')}</div>`;
  h += `<div style="text-align:left;font-size:12px">`;
  if (P === 0 || f.rel === 'Order') {
    const g = F[0].ruler;
    h += `Grandmaster ${g.name}: Piety ${g.piety} · Violence ${g.violence} · Purity ${g.purity} · Reverence ${g.reverence}<br>`;
  }
  if (P === 5) h += `Government: ${S.bank.gov}<br>`;
  const kp = keeperOf(P);
  h += `Slaves: ${S.slaves}<br>${kp && (S.wards.length || S.prisoners.length) ? `<small>Kept at ${f.capital?.name || 'court'} by <b>${kp.name}</b>${kp === f.ruler ? '' : ' (governor of the capital)'}</small><br>` : ''}<b>Wards:</b> ${S.wards.map(w => `${w.name} (${w.age})`).join(', ') || 'none'}<br><b>Prisoners:</b> ${S.prisoners.map(p => `${p.name} of ${F[p.f]?.name}`).join(', ') || 'none'}<br>`;
  const loan = S.loans.find(l => l.debtor === P);
  if (loan) h += `Loan: owe ${loan.owe}, due turn ${loan.due}<br>`;
  h += '</div>';
  const opts = ['Close', '🌳 Dynasty', '🎓 Mentors', '✠ The Nameless', '🧭 Nightfleet'];
  const avail = f.princesses.filter(p => p.age >= 14 && !p.betrothed);
  if (avail.length) opts.push('Send Princess Forth');
  if (avail.some(p => !p.spouse && ownGrooms(f, p).length)) opts.push('💍 Wed a Princess to a General');
  if (S.prisoners.length) opts.push('Judge Prisoner');
  if (S.wards.length) opts.push('Ward Matters');
  if (Object.values(CH).some(x => x && !x.dead && x.enslaved?.by === P)) opts.push('⛓ Named Slaves');
  if (f.heirs.length) opts.push('Grant Estate to Heir (150)');
  if (loan) opts.push('Repay Loan');
  const myFeuds = FW().filter(x => x.y1 == null && feudCares(x));
  if (myFeuds.length) opts.push(`🎯 Blood Feuds (${myFeuds.length})`);
  const c = await ask(h, opts);
  if (c?.startsWith('🎯 Blood Feuds')) {
    await feudsPage(myFeuds);
    return court();
  }
  if (c === '🌳 Dynasty') await bloodline(P);
  if (c === '🎓 Mentors') {
    const fam = [...f.heirs, ...f.princesses, ...Object.values(CH).filter(x => x.f === P && !x.dead && !x.role && x !== f.ruler && (x.father === f.ruler.id || CH[x.father]?.f === P))];
    const uniq = [...new Set(fam)].filter(x => !x.dead);
    const lb = x => `${x.name}${CH[x.mentor] ? ' 🎓' : ''}`;
    const n = await ask(`<h3>🎓 Mentors</h3><div class="scroll">${uniq.map(x => `<div style="text-align:left">${cl(x)} (${x.age}) — ${CH[x.mentor] ? 'mentored by ' + cl(CH[x.mentor]) : '<i>no mentor</i>'}</div>`).join('') || 'No family members.'}</div>`, [...uniq.map(lb), 'Back']);
    const p = uniq.find(x => lb(x) === n);
    if (p) await assignMentor(p);
  }
  if (c === '✠ The Nameless') await namelessPage();
  if (c === '🧭 Nightfleet') await nmPage();
  if (c === 'Send Princess Forth') {
    const n = await ask(`<h3>👸 Send a Princess</h3><div class="frow">${avail.map(p => card(p, pst(p))).join('')}</div><small>At 14–15 she may arrange a betrothal; from 16 she may marry. She travels the map like an agent.</small>`, [...avail.map(p => p.name), 'Cancel']);
    const p = avail.find(x => x.name === n);
    const s = f.capital?.owner === P ? f.capital : systems.find(x => x.owner === P);
    if (p && s) {
      delete p.stayHome;
      f.princesses.splice(f.princesses.indexOf(p), 1);
      addUnit({
        type: 'agent',
        role: 'Princess',
        owner: P,
        sys: s,
        char: p,
        mp: 3
      });
      hist(p, `sets out from ${s.name} seeking a match.`);
    }
  }
  if (c === 'Grant Estate to Heir (150)' && pay(150)) {
    const x = [...f.heirs].sort((a, b) => a.loyalty - b.loyalty)[0];
    gain(x, 'loyalty', 3);
    log(`${x.name} is placated (+3 loyalty).`);
  }
  if (c === 'Repay Loan' && pay(loan.owe)) {
    S.loans.splice(S.loans.indexOf(loan), 1);
    F[5].gold += loan.owe;
    apoc(-1, 'debts honoured');
  }
  if (c === 'Judge Prisoner') {
    const pick = S.prisoners.length > 1 ? await ask(`<h3>⛓ Prisoners</h3><div class="frow">${S.prisoners.map(x => card(x, F[x.f]?.name || '')).join('')}</div><small>Choose whom to judge.</small>`, [...S.prisoners.map(x => x.name), 'Back']) : S.prisoners[0].name;
    const p = S.prisoners.find(x => x.name === pick);
    if (!p) return court();
    S.prisoners.splice(S.prisoners.indexOf(p), 1);
    S.prisoners.unshift(p);
    const fo = fealtyOdds(p, P);
    const kp = keeperOf(P) || f.ruler;
    const o = ['Ransom (+150)', ...(F[p.f]?.ruler !== p ? [`⚔ Accept Fealty · ${pct(fo.p)}%`] : []), '🩸 Torture', 'Execute'];
    if (F[1].alive && p.f !== 1 && P !== 1) o.push('Release to Nightfleet');
    o.push('🚪 Banish');
    if (p.age < 21) o.push('Take as Ward');
    o.push('Back');
    const canEnslave = enslaveOk(P);
    if (canEnslave) o.push('Enslave');
    // A feud in the cells: one of your lords and this prisoner are sworn enemies
    const sworn = Object.values(CH).filter(x => x && !x.dead && x.f === P && ((x.nem?.[p.id] || 0) >= 4 || (p.nem?.[x.id] || 0) >= 4)).sort((a, b) => (b.nem?.[p.id] || 0) - (a.nem?.[p.id] || 0))[0];
    const swFd = sworn && (feudOf(sworn, p) || feudOf(p, sworn));
    if (sworn) o.splice(o.length - 1, 0, '🕊 Spare him and end the feud');
    const feudTxt = sworn ? `<div style="border:1px solid #c84;padding:6px;margin:6px 0;border-radius:4px">🎯 <b>A blood feud.</b> ${p.name} and your ${cl(sworn)} are sworn enemies${(sworn.nem?.[p.id] || 0) >= 4 ? ` (hatred ${Math.round(sworn.nem[p.id])})` : ''}${swFd ? `, a feud begun in Y${swFd.y0}${swFd.gen > 1 ? `, now in its ${swFd.gen}${['', 'st', 'nd', 'rd'][swFd.gen] || 'th'} generation` : ''}` : ''}. Revenge will feed it; mercy can end it for good (+2 Respect for ${sworn.name}).</div>` : '';
    const d = await ask(`<h3>Prisoner: ${p.name}</h3>${portrait(p, 70)}<br>${charStr(p)}${feudTxt}<br><small>⚔ Accept Fealty: he swears to you and joins your reserve as a general (if he refuses, he stays in chains).<br>🚪 Banish: cast him out as a landless exile (his house resents it a little; other houses may take him in).<br>${canEnslave ? '' : 'Only the slaver guilds, the Spice Syndicate and pirates trade in slaves.'}</small>`, o);
    if (d === 'Back' || d == null) return court();
    if (d === '🚪 Banish') {
      banish(p, P, 'released from the cells but forbidden his home');
      return court();
    }
    if (d === '🕊 Spare him and end the feud') {
      spareFoe(sworn, p, P, p.age < 18 && F[p.f]?.ruler !== p ? 'ward' : 'home');
      await notify(`${portrait(p, 70)}<b>${sworn.name}</b> spares his sworn enemy <b>${p.name}</b>${p.age < 18 ? ', who will be raised at your court' : ', who goes home'}. The feud is laid to rest.`);
      return court();
    }
    if (sworn && (d === '🩸 Torture' || d === 'Execute' || d === 'Enslave')) {
      feudEv(swFd, `${sworn.name}'s house takes its revenge on the captive ${p.name}: ${d === 'Execute' ? 'execution' : d === 'Enslave' ? 'the slave markets' : 'the irons'}`);
      hate(sworn, p, 2);
    }
    if (d === '🩸 Torture') {
      // The keeper's dread grows; the prisoner may break (his house's worlds charted), be maimed, or die under it
      kp.respect = Math.max(-ACAP, (kp.respect || 0) - 1);
      maybe(kp, 'Cruel', 0.2);
      life(p, 'tortured', P, kp.name);
      grudge(p.f, P, -5, `the torture of ${p.name}`);
      apoc(1, `torture of ${p.name}`);
      await darkDeed(kp, 1, `the torture of ${p.name}`);
      p.skill = Math.max(0, p.skill - 1);
      p.loyalty = Math.max(0, (p.loyalty || 0) - 1);
      const r = Math.random(),
        broke = r < 0.35 + (has(p, 'Coward') ? 0.25 : 0) - (has(p, 'Brave') ? 0.2 : 0);
      note(kp, `has ${p.name} of ${F[p.f]?.name || 'a fallen house'} tortured in the cells of ${f.capital?.name || 'the capital'}.`);
      if (Math.random() < 0.12 + (p.age > 60 ? 0.15 : 0)) {
        S.prisoners.shift();
        freeCaptive(p, `dies under torture by order of ${kp.name}`);
        setFate(p, 'dead');
        [...(p.kids || []), p.father].map(i => CH[i]).filter(k => k && !k.dead && k.f === p.f).forEach(k => {
          k.vendetta = P;
        });
        return notify(`${portrait(p, 70)}<b>${p.name}</b> dies under the irons. ${kp.name}'s name is spoken with fear.`);
      }
      if (broke && p.f >= 0) {
        systems.filter(x => x.owner === p.f).forEach(x => {
          S.seen.add(x.i);
          x.links.forEach(l => S.seen.add(l.i));
        });
        hist(p, `breaks under torture and gives up the secrets of ${F[p.f]?.name}.`);
      } else hist(p, `is tortured by ${f.name} and gives up nothing.`);
      if (Math.random() < 0.3) addTrait(p, 'Coward', true);
      return notify(`${portrait(p, 70)}${broke ? `<b>${p.name}</b> breaks. The worlds and hyperlanes of ${F[p.f]?.name} are now charted.` : `<b>${p.name}</b> gives up nothing.`}<br><small>${kp.name}: dread rises (💀 ${Math.max(0, -kp.respect)}).</small>`);
    }
    if (d.startsWith('⚔ Accept Fealty')) {
      if (Math.random() < fo.p) {
        freeCaptive(p, `bends the knee to ${f.name}`);
        acceptFealty(p, P);
        await notify(`${portrait(p, 70)}<b>${p.name}</b> swears fealty to ${f.name} and waits in the reserve at your capital.`);
      } else {
        gain(p, 'loyalty');
        await notify(`${portrait(p, 70)}<b>${p.name}</b> refuses to betray his house. He remains your prisoner.`);
      }
      return;
    }
    S.prisoners.shift();
    const hf = p.f;
    if (d === 'Ransom (+150)') grudge(hf, P, 2, `the ransom of ${p.name}`);
    if (d === 'Release to Nightfleet') grudge(hf, P, 3, `mercy shown to ${p.name}`);
    if (d === 'Enslave') grudge(hf, P, -6, `the enslavement of ${p.name}`);
    if (d === 'Execute') {
      grudge(hf, P, -8, `the execution of ${p.name}`);
      // Blood calls for blood: his children and father swear vendetta
      [...(p.kids || []), p.father].map(i => CH[i]).filter(k => k && !k.dead && k.f === hf).forEach(k => {
        k.vendetta = P;
        note(k, `swears a blood vendetta against ${f.name} for the execution of ${p.name}.`);
      });
    }
    // Fixed: ransomed captives used to vanish if their house had no ungoverned world; executions never marked them dead.
    if (d === 'Ransom (+150)') {
      f.gold += 150;
      freeCaptive(p, `is ransomed home for 150 credits`);
      if (F[p.f]?.alive) {
        const sys = systems.find(s => s.owner === p.f && !s.general);
        if (sys) sys.general = p;else F[p.f].heirs.push(p);
      }
      apoc(-1, 'ransom');
    }
    if (d === 'Execute') {
      freeCaptive(p, `is executed by order of ${cl(kp)}`);
      p.dead = true;
      kp.respect = Math.max(-ACAP, (kp.respect || 0) - (p.age < 16 ? 3 : 2));
      note(kp, `has ${p.name}${p.age < 16 ? ', a child,' : ''} executed.`);
      if (p.age < 16) apoc(2, 'a child executed');
      apoc(3, `execution of ${p.name}`);
      st(P, -1, 'execution');
      maybe(kp, 'Cruel', 0.3);
      await darkDeed(kp, p.age < 16 ? 4 : 2, `the execution of ${p.name}${p.age < 16 ? ', a child' : ''}`);
    }
    if (d === 'Ransom (+150)' || d === 'Release to Nightfleet') {
      maybe(f.ruler, 'Merciful', 0.15);
      f.ruler.respect = Math.min(ACAP, (f.ruler.respect || 0) + 1);
    }
    if (d === 'Enslave') f.ruler.respect--;
    if (d === 'Release to Nightfleet') {
      freeCaptive(p, 'is released into the care of the Nightfleet');
      exileToNM(p, P);
      apoc(-2, 'mercy');
    }
    if (d === 'Take as Ward') {
      freeCaptive(p, `is taken as a ward of ${f.name}`);
      S.wards.push(p);
      p.wardY = S.year;
    }
    if (d === 'Enslave') {
      grudge(hf, P, 6);
      enslave(p, P, `is sold into slavery by ${f.name}`);
      apoc(4, 'enslavement');
      st(P, -1, 'enslavement');
      await darkDeed(kp, 2, `selling ${p.name} into slavery`);
    }
  }
  if (c === '⛓ Named Slaves') return slaveMenu();
  if (c === '💍 Wed a Princess to a General') {
    const ps = avail.filter(p => !p.spouse && ownGrooms(f, p).length);
    const pn = ps.length > 1 ? await ask(`<h3>💍 Royal Match</h3><div class="frow">${ps.map(x => card(x, x.age)).join('')}</div><small>Bind one of your own officers to the throne. Betrothed at 14–15, wed at 16. The groom gains loyalty, and their children join the house.</small>`, [...ps.map(x => x.name), 'Back']) : ps[0]?.name;
    const p = ps.find(x => x.name === pn);
    if (!p) return court();
    const gs = ownGrooms(f, p).slice(0, 8);
    const gn = await ask(`<h3>💍 A groom for ${p.name} (${p.age})</h3><div class="frow">${gs.map(g => card(g, `Loy ${g.loyalty}`)).join('')}</div><small>Least loyal first — a royal bride binds a wavering man (+1 loyalty at betrothal, +3 at the wedding).</small>`, [...gs.map(g => g.name), 'Back']);
    const g = gs.find(x => x.name === gn);
    if (!g) return court();
    if (p.age < 16) {
      betrothOwn(p, g);
      await notify(`${portrait(p, 60)}${portrait(g, 60)}<br>${p.name} is betrothed to ${g.name}. They will wed when she turns 16.`);
    } else {
      await marryPrincess(p, g);
      await notify(`${portrait(p, 60)}${portrait(g, 60)}<br>${p.name} weds ${g.name}. He is bound to your house.`);
    }
    return court();
  }
  if (c === 'Ward Matters') {
    const pick = S.wards.length > 1 ? await ask(`<h3>🏰 Your Wards</h3><div class="frow">${S.wards.map(x => card(x, `${x.age} · ${F[x.f]?.name || ''}`)).join('')}</div><small>Choose a ward.</small>`, [...S.wards.map(x => x.name), 'Back']) : S.wards[0].name;
    const w = S.wards.find(x => x.name === pick);
    if (!w) return court();
    const yrs = w.wardY != null ? S.year - w.wardY : 0,
      fo = fealtyOdds(w, P),
      adult = w.age >= 16;
    const d = await ask(`<h3>🏰 Ward: ${w.name}</h3>${portrait(w, 70)}<br>${charStr(w)}<br><small>A ward is a young noble of another house raised at your court — part guest, part hostage (as a great house might take the son of a defeated lord). While he lives under your roof, ${F[w.f]?.name || 'his house'} grows fonder of you each year, and he slowly comes to see your house as his own (${yrs} year${yrs === 1 ? '' : 's'} at court so far).<br>He is not your heir: your succession follows the laws of your house. ${adult ? 'He is of age and may now swear fealty and serve you as a general.' : 'At 16 he may swear fealty and serve you as a general.'}</small>`, [...(adult ? [`⚔ Accept His Fealty · ${pct(fo.p)}%`] : []), ...(F[w.f]?.alive ? ['🕊 Return Him to His House'] : []), '🚪 Banish', 'Keep at Court']);
    if (d === '🚪 Banish') {
      banish(w, P, 'turned out of the court that raised him');
      return court();
    }
    if (d?.startsWith('⚔ Accept')) {
      if (Math.random() < fo.p) {
        acceptFealty(w, P);
        await notify(`${portrait(w, 70)}<b>${w.name}</b>, raised at your court, swears fealty to ${f.name}. He waits in the reserve at your capital.`);
      } else {
        await notify(`${portrait(w, 70)}<b>${w.name}</b> still belongs to ${F[w.f]?.name}. He declines — for now.`);
      }
    }
    if (d === '🕊 Return Him to His House') {
      S.wards = S.wards.filter(x => x !== w);
      delete w.wardY;
      F[w.f].heirs.push(w);
      grudge(w.f, P, 6, `the safe return of ${w.name}`);
      apoc(-1, 'ward returned');
      hist(w, `is returned to ${F[w.f].name} by ${f.name}.`);
    }
  }
}

// ================= Works, ruins, emergence =================
function grant(n, s, f = F[P], found = false) {
  const g = GW[n];
  if (g.k === 'tech') f.tech.push(n);else if (n === 'Starblades') {
    s.general.starblade = true;
    s.general.skill += 2;
    hist(s.general, 'is armed with a Starblade.');
  } else s.b.add(n);
  if (n === 'Memory Codices') {
    systems.filter(x => x.owner === f.id && x.general).forEach(x => x.general.skill++);
    apoc(-3, 'Codex wisdom');
  }
  log(`⚙ ${f.name} ${found ? 'unearths' : 'completes'} ${n}${s ? ' at ' + s.name : ''}.`);
}
// Great Works cost: the Nameless keep the old forges and make Starblades for far less.
const gwCost = (n, fid = P) => n === 'Starblades' && fid === 0 ? 1200 : GW[n].c;
// One Great Work at a time per world: s.gw = { n, left, tot, f, g (Starblade bearer id) }. Ticked once per turn in gwTick().
function gwTick() {
  for (const s of systems) {
    const w = s.gw;
    if (!w) continue;
    try {
      if (w.wid == null) wikiWork(s, w, 'start');
    } catch (e) {}
    if (s.owner !== w.f) {
      try {
        wikiWork(s, w, 'lost');
      } catch (e) {}
      if (w.f === P) log(`🏗 Work on the ${w.n} at ${s.name} is lost with the world.`);
      s.gw = null;
      continue;
    }
    if (s.siege) continue; // blockades halt construction
    if (--w.left > 0) continue;
    s.gw = null;
    try {
      wikiWork(s, w, 'done');
    } catch (e) {}
    if (w.n === 'Starblades') {
      const c = [CH[w.g], s.general].find(x => x && !x.dead && x.f === w.f && !x.starblade);
      if (c) WB(c, 'forged', {
        at: s
      });else WB(null, 'forged', {
        vault: s
      });
      if (!c) {
        s.bladeWait = true;
        if (w.f === P) log(`⚔ A Starblade is forged at ${s.name}, but no worthy bearer is there. It waits in the vault.`);
        continue;
      }
      c.starblade = true;
      c.skill += 2;
      hist(c, `receives a newly forged Starblade at ${s.name}.`);
      log(`⚙ ${F[w.f].name} forges a Starblade at ${s.name}.`);
    } else grant(w.n, s, F[w.f]);
    if (w.f === P) playSfx('win');
  }
}
async function worksMenu(s) {
  let h = `<h3>🏛 Great Works of ${s.name}</h3>`;
  if (s.gw) h += `<div class="rep-sec">🏗 Under construction</div><div><b>${s.gw.n}</b> — ${s.gw.left} turn(s) left${s.siege ? ' <span style="color:#f77">(halted by blockade)</span>' : ''}<div style="height:6px;background:#123;border-radius:3px;margin:4px 0"><div style="height:100%;width:${Math.round((1 - s.gw.left / s.gw.tot) * 100)}%;background:#ffd76a;border-radius:3px"></div></div></div>`;
  if (s.bladeWait) h += `<div>⚔ A forged Starblade waits in the vault for a bearer.</div>`;
  h += '<div class="scroll">';
  const opts = [];
  for (const [n, g] of Object.entries(GW)) {
    if (g.k === 'tech') continue; // technology is discovered or invented, never bought
    const have = n === 'Starblades' ? !!s.general?.starblade : s.b.has(n);
    const cost = gwCost(n);
    h += `<p><b>${n}</b> ${have ? '✅' : ''} [${g.k}] — ${g.d}${g.find ? ' <i>(found only in ruins)</i>' : ` <small>· ${cost} credits · ${g.t || 1} turns${n === 'Starblades' && P === 0 ? ' · Nameless forge-price' : ''}</small>`}</p>`;
    if (have || g.find || s.gw) continue;
    if (g.k === 'super' && !s.b.has('Space Station')) continue;
    if (n === 'Starblades' && !s.general) continue;
    opts.push(`${n} (${cost})`);
  }
  h += `</div>${s.b.has('Space Station') ? '' : '<small>Superweapons require a Space Station here.</small>'}${s.gw ? '<br><small>Only one Great Work can be built at a time on a world.</small>' : ''}`;
  if (s.bladeWait && s.general && !s.general.starblade) opts.unshift('⚔ Grant the vault Starblade');
  if (s.gw) opts.push('✖ Abandon construction (refund 50%)');
  const c = await ask(h, [...opts, 'Close']);
  if (!c || c === 'Close') return;
  if (c === '⚔ Grant the vault Starblade') {
    s.bladeWait = false;
    s.general.starblade = true;
    s.general.skill += 2;
    WB(s.general, 'vault', {
      vault: s
    });
    hist(s.general, `takes up the Starblade forged at ${s.name}.`);
    return;
  }
  if (c.startsWith('✖')) {
    try {
      wikiWork(s, s.gw, 'abandoned');
    } catch (e) {}
    F[P].gold += Math.floor(gwCost(s.gw.n) / 2);
    log(`🏗 Work on the ${s.gw.n} at ${s.name} is abandoned.`);
    s.gw = null;
    return;
  }
  const n = c.replace(/ \(\d+\)$/, '');
  if (pay(gwCost(n))) {
    const t = GW[n].t || 1;
    s.gw = {
      n,
      left: t,
      tot: t,
      f: P,
      g: n === 'Starblades' ? s.general?.id : undefined
    };
    s.built = true;
    log(`🏗 Construction of the ${n} begins at ${s.name} (${t} turns).`);
  }
}
function superweapon(w, t, by = P, src = null) {
  const prev = t.owner,
    tn = t.name,
    killed = [],
    hn = [t.name];
  if (w !== 'World Devastators' && w === 'Star Eater') t.links.forEach(x => x.owner !== by && hn.push(x.name));
  [t, ...(w === 'Star Eater' ? t.links.filter(x => x.owner !== by) : [])].forEach(x => {
    if (w !== 'World Devastators' && x.general && !(x.general.domiri && x.general.undying)) killed.push(x.general.id);
  });
  try {
    wikiStrike({
      w,
      src: src?.i ?? null,
      t: t.i,
      tn,
      by,
      v: prev,
      k: killed,
      hn: w === 'World Devastators' ? [] : hn
    });
  } catch (e) {}
  if (w === 'World Devastators') {
    Object.assign(t, {
      legions: 0,
      elite: 0,
      fleet: Math.floor(t.fleet / 2),
      income: Math.floor(t.income / 2)
    });
    apoc(8, `World Devastators ravage ${t.name}`);
  } else {
    const hit = w === 'Star Eater' ? [t, ...t.links.filter(x => x.owner !== by)] : [t];
    hit.forEach(x => {
      if (x.general && !(x.general.domiri && x.general.undying)) {
        x.general.dead = true;
        hist(x.general, `perishes as the ${w} strikes ${t.name}.`);
      }
      Object.assign(x, {
        legions: 0,
        fleet: 0,
        elite: 0,
        general: null
      });
    });
    Object.assign(t, {
      owner: -1,
      income: 5,
      order: 0,
      name: t.name + ' (Dead)'
    });
    apoc(w === 'Star Eater' ? 25 : 15, `${w} consumes ${t.name}`);
    hit.forEach(x => checkDead(x.owner));
  }
  checkDead(prev);
  refresh();
}
// Death risk of a ruin expedition: command keeps the party alive; traits and retinue sway it
function ruinRisk(g) {
  let r = 0.2 - (g.skill || 0) * 0.015;
  if (has(g, 'Reckless')) r += 0.07;
  if (has(g, 'Cautious')) r -= 0.05;
  if (has(g, 'Brave')) r -= 0.02;
  if (has(g, 'Coward')) r += 0.03;
  if (has(g, 'Drunkard')) r += 0.04;
  if (has(g, 'Vigilant')) r -= 0.03;
  if (has(g, 'Indolent')) r += 0.02;
  if (g.starblade) r -= 0.04;
  for (const a of ['Squire', 'Battle AI', 'Astrogation Map', 'Relic of the Old Empire', 'Void Hound', 'Codex Fragment']) if (has(g, a)) r -= 0.03;
  if ((g.age || 30) > 60) r += 0.04;
  return clamp(r, 0.02, 0.45);
}
async function explore(s, g0) {
  const g = g0 || s.general,
    fid = g.f,
    f = F[fid],
    human = isHuman(fid),
    risk = ruinRisk(g);
  if (human && (await ask(`<h3>🏚 Ruins of ${s.name}</h3>${portrait(g, 56)}<br>${cl(g)} would lead the expedition.<br>☠ Chance he dies in the vaults: <b>${pct(risk)}%</b><br><small>Lowered by Command, caution, a Starblade and retinue (Squire, Battle AI, Astrogation Map, Relics, Void Hound); raised by recklessness, drink and old age.</small>`, ['🏚 Enter the ruins', 'Cancel'])) !== '🏚 Enter the ruins') return;
  s.ruin = false;
  const lore = rnd(LORE);
  if (!S.lore.includes(lore)) S.lore.push(lore);
  if (Math.random() < risk) {
    const msg = `${g.name} descends into the vaults and never returns.`;
    hist(g, `dies exploring the ruins of ${s.name}.`);
    log(`☠ ${cl(g)} of ${f.name} perishes in the ruins of ${s.name}.`);
    const wasRuler = setFate(g, 'dead');
    if (human) await notify(`<h3>🏚 Ruins of ${s.name}</h3>${msg}<hr><i>${lore}</i>`);
    if (wasRuler) await succession(fid, 'has died');
    return;
  }
  const r = Math.random();
  const pool = ['Memory Codices', 'Laser Weapons', 'Plasma Weapons', 'Bodyshields', 'Aether Shield', 'Cloaking', 'Gravity Nullifier', 'Necronomicon'].filter(n => !f.tech.includes(n));
  let msg;
  if (r < 0.3 && pool.length) {
    const n = rnd(pool);
    grant(n, null, f, true);
    msg = `Deep in the vaults, ${g.name} recovers: <b>${n}</b>!`;
  } else if (r < 0.42 && !g.starblade) {
    g.starblade = true;
    g.skill += 2;
    WB(g, 'found', {
      at: s
    });
    msg = `${g.name} pulls an ancient Starblade from a dead knight's grip.`;
    if (!human) log(`⚔ ${cl(g)} of ${f.name} finds a Starblade in the ruins of ${s.name}.`);
  } else if (r < 0.6) {
    s.legions = Math.floor(s.legions / 2);
    apoc(2, 'ancient guardians awakened');
    msg = 'Ancient guardians awaken and slaughter half the expedition!';
  } else {
    const v = ri(100, 300);
    f.gold += v;
    msg = `Salvage worth ${v} credits.`;
  }
  hist(g, `explores the ruins of ${s.name}: ${msg.replace(/<[^>]+>/g, '')}`);
  if (Math.random() < 0.4) addAnc(g, rnd(['Relic of the Old Empire', 'Astrogation Map', 'Codex Fragment', 'Hyperspace Navigator', 'Battle AI', 'Scientist', 'Mad Scientist']));
  if (human) await notify(`<h3>🏚 Ruins of ${s.name}</h3>${msg}<hr><i>${lore}</i>`);
}
function emerge() {
  const s = rnd(systems.filter(x => x.owner < 0 && x.income > 10));
  if (!s) return;
  const name = `${rnd(HOUSE)} ${s.name}`;
  const f = newFaction(name, new THREE.Color().setHSL(Math.random(), 0.7, 0.55).getHex(), s.rel, {
    gold: 250
  }, {
    feudal: true
  });
  Object.assign(s, {
    owner: f.id,
    general: f.ruler,
    legions: s.legions + 3
  });
  f.capital = s;
  hist(f.ruler, `raises a banner at ${s.name}, founding ${name} out of the dark age.`);
}

// ================= Ledger / Wiki / Menu / Save =================
async function ledgerView(filter = 'All') {
  const cats = {
    All: () => true,
    '⚔ Wars & Battles': m => /⚔|💥|⛓|🛰|repelled|stormed|takes|seizes|conquers|siege|blockade|revolts/i.test(m),
    '🤝 Diplomacy': m => /🤝|🗡|🕊|alliance|peace|betray|envoy/i.test(m),
    '👶 Family': m => /👶|⚭|born|weds|marries|bastard|succe|crowned|dies/i.test(m),
    '⛓ Captivity': m => /captive|captured|chains|ransom|prisoner|execut|slavery|exile/i.test(m),
    '👥 People': m => m.includes('data-c'),
    '☢ Apocalypse': m => /☢|👽|Domiri|Voidspawn/.test(m),
    '⚜ Mine': m => m.includes(F[P].name),
    '🧠 Grudges & Motives': null
  };
  let body = '';
  if (filter === '🧠 Grudges & Motives') body = heartsChapter();else {
    const items = S.ledger.filter(e => cats[filter](e.m)).slice(-250).reverse();
    // Group by year so the chronicle reads like a history book
    let lastY = null;
    for (const e of items) {
      if (e.y !== lastY) {
        body += `<div class="flab">Year ${e.y}</div>`;
        lastY = e.y;
      }
      body += `<div>${e.m}</div>`;
    }
  }
  const c = await ask(`<h3>📜 Galactic Ledger — ${filter}</h3><div class="scroll">${body || 'Nothing recorded yet.'}</div>`, [...Object.keys(cats).filter(k => k !== filter), 'Close']);
  if (c && c !== 'Close') ledgerView(c);
}
// Ledger chapter: why the houses feel the way they do (from S.mem / S.memWhy) and what each ruler is after.
function heartsChapter() {
  const live = F.filter(f => f?.alive && f.ruler && !hostile(f));
  const rows = [];
  for (const a of live) for (const b of live) {
    if (a === b) continue;
    const v = opinion(a.id, b.id),
      why = S.memWhy?.[mkey(a.id, b.id)];
    if (Math.abs(v) >= 6 || why && Math.abs(v) >= 3) rows.push({
      a,
      b,
      v,
      why
    });
  }
  rows.sort((x, y) => (y.a.id === P || y.b.id === P) - (x.a.id === P || x.b.id === P) || Math.abs(y.v) - Math.abs(x.v));
  const feel = rows.slice(0, 60).map(r => `<div>${r.v < 0 ? '😠' : '💛'} <b>${r.a.name}</b> → ${r.b.name}: <b>${moodTxt(r.v)}</b>${r.why ? ` <small>— ${r.why}</small>` : ''}</div>`).join('') || '<small>No strong feelings between the houses yet.</small>';
  const aims = live.map(f => `<div>${f.id === P ? '⚜' : '🎯'} ${cl(f.ruler)} of <b>${f.name}</b>: <i>${motive(f.ruler)}</i></div>`).join('');
  return `<div class="flab">Hearts of the Houses</div>${feel}<div class="flab">What the Rulers Want</div>${aims}`;
}
// A character's current motivation, read from their situation, grudges and temperament.
function motive(c) {
  const m = motiveRaw(c);
  return c?.fem ? m.replace(/\bhis\b/g, 'her').replace(/\bhim(self)?\b/g, 'her$1').replace(/\bhe\b/g, 'she') : m;
}
function motiveRaw(c) {
  if (!c) return 'Unknown.';
  if (c.dead) return 'Rests among the stars.';
  const f = F[c.f],
    ruler = f?.ruler === c;
  const fn = id => F[id]?.name || 'his enemies';
  if (S.prisoners?.includes(c) || c.captive) return 'To be free of these chains — at any price.';
  if (c.enslaved) return 'To break the collar and see his masters burn.';
  if (c.vendetta != null && F[c.vendetta]?.alive) return `Vengeance on ${fn(c.vendetta)} for the blood they spilled.`;
  if (c.maimed) return 'To recover from his wounds — and repay whoever dealt them.';
  if (ruler && f) {
    let worst = null,
      wv = 0;
    for (const o of F) if (o?.alive && o.id !== f.id && !hostile(o)) {
      const v = opinion(f.id, o.id);
      if (v < wv) {
        wv = v;
        worst = o;
      }
    }
    const wars = F.filter(o => o?.alive && o.id !== f.id && atWar(f.id, o.id));
    if (worst && wv <= -8) return `To humble ${worst.name}${S.memWhy?.[mkey(f.id, worst.id)] ? ` — he has not forgotten ${S.memWhy[mkey(f.id, worst.id)].replace(/ \(Y\d+\)$/, '')}` : ''}.`;
    if (wars.length) return `To win the war against ${wars.map(o => o.name).slice(0, 2).join(' and ')}.`;
    if (!f.heirs?.some(h => !h.dead) && !celibate(f.id)) return 'To secure an heir before death comes for him.';
    const p = persona(c);
    if (p.agg > 0.7) return 'Expansion. Every border is an insult.';
    if (p.honor > 0.75) return 'To rule justly and keep his oaths.';
    return 'To hold what he has and grow rich in peace.';
  }
  if (f?.ruler && f.heirs?.includes(c) && !celibate(c.f)) {
    const mine = bloodClaim(c, f).v,
      best = Math.max(...f.heirs.filter(h => !h.dead).map(h => bloodClaim(h, f).v));
    if ((c.loyalty ?? 5) <= 3 && mine >= best - 1) return 'The throne — and he will not wait politely for it.';
    if (mine >= best) return 'To prove himself worthy of the crown that will be his.';
    if (c.traits?.includes('Ambitious')) return 'To outshine the heirs who stand before him.';
  }
  if ((c.loyalty ?? 5) <= 2) return 'His own fortune. His oath grows thin.';
  const t = c.traits || [];
  if (t.includes('Ambitious')) return 'Power, titles, and a seat closer to the throne.';
  if (t.includes('Pious') || c.role === 'Priest' || c.role === 'Master') return 'To serve the faith and see the holy worlds kept.';
  if (t.includes('Bloodthirsty') || t.includes('Cruel')) return 'Battle, and the fear it brings.';
  if (t.includes('Greedy') || c.role === 'Trader') return 'Wealth — always more wealth.';
  if (c.role === 'Spy' || c.role === 'Assassin') return 'To finish the mission unseen.';
  if (c.role === 'Diplomat') return 'To bind the houses with words instead of blades.';
  if (c.fem && c.spouse == null && c.age >= 16) return 'A worthy match, and a house of her own.';
  if (c.age < 16) return 'To grow up, and learn.';
  if (systems.some(s => s.general === c)) return 'To keep his world prosperous and orderly.';
  if (units.some(u => u.general === c)) return 'Glory in command, and victories to his name.';
  return `To serve ${f?.name || 'himself'} faithfully.`;
}
async function wiki(filter = 'Notable') {
  const F_ = {
    Notable: () => true,
    '🟢 Living': c => !c.dead,
    '🪦 Fallen': c => c.dead,
    '👑 Rulers': c => F[c.f]?.ruler === c || c.wasRuler,
    '⛓ Captives': c => !!c.captive || !!c.captivity || c.enslaved,
    '🤖 Scarred & Machine': c => c.traits.some(t => SCARS.includes(t) || ['Cyborg', 'Cybernetic Arm', 'One-Armed'].includes(t)),
    '⚜ My House': c => c.f === P
  };
  const cs = Object.values(CH).filter(c => !(c.role === 'Priest' && !c.council) && (c.hist.length || F[c.f]?.ruler === c) && F_[filter](c)).sort((a, b) => b.hist.length - a.hist.length).slice(0, 150);
  const tag = c => [c.captive ? `⛓ captive of ${F[c.captive.by]?.name}` : '', c.enslaved ? '⛓ enslaved' : '', c.wins ? `🏆${c.wins}` : '', c.traits.includes('Cyborg') ? '🤖' : ''].filter(Boolean).join(' ');
  const r = await ask(`<h3>👥 Character Wiki — ${filter}</h3><div class="scroll">${cs.map(c => `<div>${c.dead ? '🪦 ' : ''}${F[c.f]?.ruler === c ? '👑 ' : ''}${cl(c)} — ${F[c.f]?.name || 'Unknown'} · ${c.hist.length} deeds ${tag(c) ? `<small>${tag(c)}</small>` : ''}<br><small style="opacity:.65">${c.hist[c.hist.length - 1] || ''}</small></div>`).join('') || 'No one fits this page yet.'}</div>`, [...Object.keys(F_).filter(k => k !== filter), 'My Bloodline', 'Close']);
  if (r === 'My Bloodline') return bloodline(P);
  if (F_[r]) return wiki(r);
}
// ================= Mentors =================
// Any member of your bloodline can be placed under a mentor; each year they learn from them.
const MENTOR_ROLES = ['Diplomat', 'Trader', 'Spy', 'Assassin', 'Priest', 'Master'];
function mentorCands(c) {
  const govs = systems.filter(s => s.owner === P && s.general).map(s => s.general);
  const flt = units.filter(u => u.owner === P && u.general).map(u => u.general);
  const ag = units.filter(u => u.owner === P && u.char && MENTOR_ROLES.includes(u.role)).map(u => u.char);
  return [...new Set([F[P].ruler, ...govs, ...flt, ...ag])].filter(m => m && !m.dead && m !== c && m.age >= 20 && m.mentor !== c.id);
}
function mentorTick() {
  Object.values(CH).forEach(c => {
    if (c.dead || c.mentor == null) return;
    const m = CH[c.mentor];
    if (!m || m.dead) {
      delete c.mentor;
      return;
    }
    const young = c.age < 25 ? 1 : 0.5;
    const learn = (k, mk = k) => {
      if ((m[mk] || 0) > (c[k] || 0) && Math.random() < 0.35 * young) gain(c, k);
    };
    if (c.fem && !c.role) {
      learn('dip', m.role === 'Diplomat' ? 'skill' : 'dip');
      if (Math.random() < 0.25 * young) gain(c, 'charm');
    } else if (!m.role) {
      learn('skill');
      learn('admin');
    } else if (m.role === 'Diplomat' || m.role === 'Trader') learn('admin', 'skill');else if (m.role === 'Spy' || m.role === 'Assassin') learn('skill');
    learn('piety');
    if (m.role === 'Priest' || m.role === 'Master') {
      if (Math.random() < 0.4 * young) gain(c, 'piety');
    }
    // Fear/Respect drifts toward the mentor's reputation.
    if (Math.random() < 0.3 * young) c.respect = clamp((c.respect || 0) + Math.sign((m.respect || 0) - (c.respect || 0)), -10, 10);
    if (Math.random() < 0.2 * young) gain(c, 'loyalty', m.loyalty >= 6 ? 1 : 0);
    const tr = m.traits.filter(t => TRAITS.includes(t) && !c.traits.includes(t));
    if (tr.length && Math.random() < 0.08 * young) {
      const t = rnd(tr);
      if (addTrait(c, t, true)) note(c, `learns to be ${t} from ${m.name}.`);
    }
  });
}
async function assignMentor(c) {
  const cs = mentorCands(c);
  if (!cs.length) return notify('No suitable mentors in your service. Generals, governors and agents aged 20+ can mentor.');
  const lbl = m => `${m.name} (${m.role ? rn(m.role) : 'General'})`;
  const r = await ask(`<h3>🎓 Mentor for ${c.name}</h3><div class="frow">${cs.map(m => card(m, m.role ? rn(m.role) : '⚔' + m.skill)).join('')}</div><small>Generals teach Command & Administration. Diplomats teach Diplomacy, Monks & Masters teach Piety, Probe AIs & Bounty Hunters teach Subterfuge. Pupils also pick up their mentor's Fear/Respect and traits. Under 25 they learn twice as fast.</small>`, [...cs.map(lbl), ...(c.mentor != null ? ['Remove mentor'] : []), 'Cancel']);
  if (r === 'Remove mentor') {
    delete c.mentor;
    return;
  }
  const m = cs.find(x => lbl(x) === r);
  if (m) {
    c.mentor = m.id;
    hist(c, `is placed under the tutelage of ${cl(m)}.`);
  }
}
// Where is a character right now? Governor's world, fleet/agent position, else their court's capital.
function locate(c) {
  if (!c || c.dead) return null;
  const gov = systems.find(s => s.general === c);
  if (gov) return gov;
  const u = units.find(x => x.general === c || x.char === c);
  if (u) return u.sys;
  if (S.prisoners.includes(c) || S.wards.includes(c)) return F[P]?.capital || null;
  return F[c.f]?.capital || null;
}
function goTo(s, c) {
  // Resolve EVERY open dialog (including the current one) so whatever awaited them can finish and release `busy`
  dismissAll();
  selected = s;
  selU = units.find(x => x.sys === s && (x.general === c || x.char === c)) || null;
  $('info').classList.remove('min');
  camGoal.set(s.pos.x, 0, s.pos.z);
  camDist = Math.min(camDist, 30);
  refresh();
  showInfo();
}
async function bio(id) {
  courtMusic();
  const c = CH[id];
  if (!c) return;
  const gov = systems.find(s => s.general === c),
    fl = units.find(u => u.general === c);
  const title = c.wm ? F[c.f]?.ruler === c ? `🔮 ${rTitle(c.f, c)}` : `🔮 ${pTitle(13, c)}` : F[c.f]?.ruler === c ? c.f === 0 ? `✠ ${rTitle(0, c)}` : `👑 ${rTitle(c.f, c)}` : c.council ? '✠ Council Master' : c.role ? rn(c.role) : c.spouse != null && F[c.f]?.ruler?.id === c.spouse ? `👑 ${cTitle(c.f, c)}` : c.fem ? c.spouse != null ? 'Lady' : pTitle(c.f, c) : gov ? `General, governing ${gov.name}` : fl ? 'General, commanding a fleet' : F[c.f]?.heirs?.includes(c) ? celibate(c.f) ? 'Sworn Initiate' : heirOrder(F[c.f])[0] === c ? hTitle(c.f, c) : pTitle(c.f, c) : S.wards.includes(c) ? `Ward of ${F[P]?.name}` : 'General';
  const sp = CH[c.spouse],
    bt = CH[c.betrothed];
  const nmNote = c.f === 1 && c.nmFrom != null && c.nmFrom !== 1 && F[c.nmFrom] ? `<div style="color:#9fc8ff;font-size:12px">🌌 Sworn brother of the Nightfleet — formerly of ${F[c.nmFrom].name}${F[c.nmFrom].alive ? '' : ' (fallen)'}${c.exiledBy != null && F[c.exiledBy] ? `, exiled by ${F[c.exiledBy].name}` : ''}.</div>` : '';
  const effS = e => Object.entries(e || {}).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k === 'skill' ? SK(c).toLowerCase() : k === 'respect' ? 'respect' : k === 'admin' ? 'administration' : k}`).join(', ');
  const where = locate(c);
  // Make location obvious: beacon on the map + glide the camera there + a clear banner
  if (where && !c.dead && (c.f === P || inSight(where) || S.god && S.godSee)) {
    showBeacon(where);
    camGoal.set(where.pos.x, 0, where.pos.z);
  }
  const govW = systems.find(s => s.general === c),
    flU = units.find(u => u.general === c || u.char === c);
  const doing = c.dead ? '' : S.prisoners.includes(c) ? 'held prisoner at your court' : c.captive ? `held captive by ${F[c.captive.by]?.name || 'enemies'}` : govW ? `governing ${govW.name}` : flU ? flU.path?.length ? `travelling — ${flU.path.length} jump(s) to ${flU.path[flU.path.length - 1].name}` : flU.type === 'fleet' ? `commanding a fleet at ${flU.sys.name}` : `on a mission at ${flU.sys.name}` : where ? `at court on ${where.name}` : 'whereabouts unknown';
  const wcol = where && where.owner >= 0 ? '#' + new THREE.Color(F[where.owner]?.color ?? 0xffffff).getHexString() : '#aaa';
  const locBanner = c.dead ? '' : `<div style="display:flex;align-items:center;gap:8px;margin:4px 0 6px;padding:6px 10px;border-radius:8px;background:linear-gradient(90deg,rgba(255,215,106,.18),rgba(255,215,106,.04));border:1px solid #ffd76a;text-align:left"><span style="font-size:20px">📍</span><span style="font-size:12px"><b style="color:#ffd76a;font-size:14px">${where ? where.name : 'Unknown'}</b>${where && where.owner >= 0 ? ` <span style="color:${wcol}">· ${F[where.owner]?.name}</span>` : ''}<br>${doing}${where ? ' · <i style="opacity:.7">marked on the map</i>' : ''}</span></div>`;
  const trs = c.traits.map(t => `<div>• <b>${t}</b> <small>${TR[t]?.d || ''}${effS(TR[t]?.e) ? ' (' + effS(TR[t].e) + ')' : ''}${TR[t]?.a ? ` · opposes ${TR[t].a}` : ''}</small></div>`).join('') || '<small>No notable traits.</small>';
  const anc = (c.anc || []).map(a => `<div>• <b>${a}</b> <small>${ANC[a]?.d || ''}</small></div>`).join('') + (c.starblade ? `<div>• <b style="color:${bladeCol(c)};text-shadow:0 0 6px ${bladeCol(c)}">Starblade</b> <small>${BLADE[bladeKey(c)][1]} · +2 command, +25% ground power. The blade's colour shifts with its wielder's heart.</small></div>` : '') || '<small>No retinue or items.</small>';
  // Cycle through your living characters (ruler, family, governors, fleet generals, agents)
  // Agents cycle only with agents; everyone else (court, governors, generals) cycles without agents
  const isAg = x => units.some(u => u.type === 'agent' && u.char === x);
  const agMode = isAg(c);
  const ros = c.f === P ? [...new Set([F[P].ruler, ...F[P].heirs, ...F[P].princesses, ...systems.filter(s => s.owner === P).map(s => s.general), ...units.filter(u => u.owner === P).map(u => u.general || u.char)])].filter(x => x && !x.dead && isAg(x) === agMode) : [];
  const ri0 = ros.indexOf(c),
    cyc = [];
  const cycBar = ros.length > 1 && ri0 >= 0 ? `<div class="cycbar"><button data-cy="◀">◀</button><span>${ri0 + 1} / ${ros.length} · ${agMode ? 'your agents' : 'your people'}</span><button data-cy="▶">▶</button></div>` : '';
  const quote = c.dead ? '' : `<div style="text-align:center;font-style:italic;color:#e8d8a8;margin:2px 0 2px">"${quip(c, 's')}"</div><div style="text-align:center;font-size:12px;margin:0 0 6px">🧭 <b>Motivation:</b> <i>${motive(c)}</i></div>`;
  const maimTxt = c.maimed && !c.dead ? `<div style="border:1px solid #a03030;border-radius:8px;padding:6px;margin:4px 0;background:#2a0a0a"><b>🩸 Maimed in battle.</b> ${c.maimed === 'arm' ? 'His arm is gone. A machine limb is common among veterans — people will tolerate it.' : 'His face is burned away. Rebuilding it in steel will make him a cyborg — feared, never loved (+Dread).'}</div>` : '';
  const r = await ask(`${cycBar}<h3>${dn(c)}</h3>${locBanner}${quote}${maimTxt}<div class="ccard">${portrait(c, 90)}<div style="font-size:12px">${title} · ${c.dead ? '🪦 Deceased' : 'Alive'}<br>${F[c.f]?.name || 'Unaligned'}${CULT[c.cult] ? `<br><small style="opacity:.8" title="${CULT[c.cult].eth}">${cultLabel(c.cult)}</small>` : ''}<br>${c.dead ? `Y${c.bornY ?? '?'}–Y${c.deathY ?? '?'}` : `Born Y${c.bornY ?? S.year - (c.age || 0)}`} · Age ${c.age} · <span title="Closeness to the line of power. A crowned ruler resets to 10; each generation away fades it. Used in succession and succession wars.">Blood ${c.blood}${F[c.f]?.ruler && F[c.f].ruler !== c && !c.dead && !celibate(c.f) ? ` · Claim ${bloodClaim(c, F[c.f]).v}` : ''}</span>${where ? ` · 📍 ${where.name}` : ''}<br>${attrStr(c).split(' · ').join('<br>')}<br><small style="opacity:.7">Scale 0–10; bonuses can exceed it (cap 20).</small>${c.wins ? `<br>🏆 ${c.wins} victories` : ''}${sp ? `<br>⚭ Married to ${cl(sp)}` : ''}${bt ? `<br>💍 Betrothed to ${cl(bt)} <small>(not yet wed — the wedding comes when the bride turns 16)</small>` : ''}${CH[c.mentor] ? `<br>🎓 Mentor: ${cl(CH[c.mentor])}` : ''}${CH[c.nemesis] && !CH[c.nemesis].dead ? `<br>🎯 Nemesis: ${cl(CH[c.nemesis])} <small>(${F[CH[c.nemesis].f]?.name || 'no house'})</small>` : ''}${nmNote || (c.exiledBy != null ? `<br>Exiled by ${F[c.exiledBy]?.name}` : '')}${c.captive ? `<br>⛓ Captive of ${F[c.captive.by]?.name} since Y${c.captive.y}` : ''}${c.wardOf != null ? `<br>🏰 Ward of ${F[c.wardOf]?.name} since Y${c.wardY ?? '?'}` : S.wards.includes(c) ? `<br>🏰 Ward at your court since Y${c.wardY ?? '?'}` : ''}${c.secret?.known ? `<br>🤫 Revealed Y${c.secret.known}: ${c.secret.wed ? 'trueborn' : 'natural'} child of ${CH[c.secret.f] ? cl(CH[c.secret.f]) : '?'}${CH[c.secret.m] ? ' and ' + cl(CH[c.secret.m]) : ''}` : c.secret && isHuman(c.secret.by) && c.secret.by === P ? `<br>🤫 <i>Secret (known only to your house): truly the ${c.secret.wed ? 'trueborn' : 'natural'} child of ${CH[c.secret.f] ? cl(CH[c.secret.f]) : '?'}${CH[c.secret.m] ? ' and ' + cl(CH[c.secret.m]) : ''}</i>` : ''}${c.enslaved ? `<br>⛓ Enslaved${F[c.enslaved.by] ? ` by ${F[c.enslaved.by].name}` : ''}${c.enslaved.y != null ? ` since Y${c.enslaved.y}` : ''}` : ''}${c.captivity ? `<br><small>Spent ${c.captivity} year(s) in captivity</small>` : ''}${c.bondage ? `<br><small>Spent ${c.bondage} year(s) in bondage</small>` : ''}${(c.life || []).some(x => x.k === 'tortured') ? `<br><small>🩸 Tortured ${(c.life || []).filter(x => x.k === 'tortured').length}×</small>` : ''}</div></div><div class="scroll" style="max-height:40vh"><div class="flab">Traits</div>${trs}<div class="flab">Retinue & Items (${(c.anc || []).length}/6)</div>${anc}<div class="flab">Deeds</div>${c.hist.map(h => `<div>${h}</div>`).join('') || 'No recorded deeds.'}${c.role === 'Priest' || c.role === 'Master' || c === F[0]?.ruler ? `<br><small>✠ Violence ${c.violence} · Purity ${c.purity} · Reverence ${c.reverence}</small>` : ''}${c.undying ? '<br><small>🌑 Undying — one of the Seven Domiri lords of the Forgotten Fleet.</small>' : ''}</div>`, [...(c.maimed && !c.dead && c.f === P ? [c.maimed === 'arm' ? '🦾 Fit Cybernetic Arm' : '🤖 Rebuild as Cyborg', '✋ Refuse the Machine'] : []), ...(where && !c.dead ? ['📍 Go To'] : []), ...(c.f === P && !c.dead && dreadful(c) ? ['🎭 Change Mask'] : []), ...(c.f === P && !c.dead && bastard(c) && F[P].ruler ? [`📜 Legitimise (${LEGIT_COST})`] : []), ...(c.f === P && bastardOrders(c).length ? ['🕯 Send to an Order'] : []), ...(c.f === P && !c.dead && bastard(c) && F[P].ruler !== c ? ['🚪 Banish from Court'] : []), ...(!c.dead && c.secret && !c.secret.known && c.secret.by === P ? ['🤫 Proclaim the Truth'] : []), ...(c.f === P && !c.dead && F[P].ruler !== c && !c.role ? ['🎓 Mentor'] : []), ...(c.role === 'Priest' && !c.council ? [] : ['🌳 Dynasty']), ...(S.god ? ['🛠 Edit'] : []), ...cyc, 'Close']);
  if (r === '🛠 Edit') {
    await godChar(c);
    refresh();
    showInfo();
    return bio(c.id);
  }
  if (r === '🦾 Fit Cybernetic Arm' || r === '🤖 Rebuild as Cyborg' || r === '✋ Refuse the Machine') {
    cyberize(c, c.maimed, r !== '✋ Refuse the Machine');
    return bio(c.id);
  }
  if (r === '◀' || r === '▶') return bio(ros[(ri0 + (r === '▶' ? 1 : -1) + ros.length) % ros.length].id);
  if (r === '🚪 Banish from Court') {
    const kp = keeperOf(P) || F[P].ruler;
    if ((await ask(`<h3>🚪 Banish ${c.name}?</h3>${portrait(c, 70)}<br>Cast this base-born ${c.fem ? 'daughter' : 'son'} out of your house. ${c.fem ? 'She' : 'He'} will hate ${kp ? kp.name : 'your ruler'} for it, and another house may take ${c.fem ? 'her' : 'him'} in.<br><small>${kp?.name || 'Your ruler'} grows more feared (−1 respect).</small>`, ['🚪 Banish', 'Back'])) === '🚪 Banish') {
      banish(c, P, 'a base-born child turned out of the house');
      if (kp) kp.respect = Math.max(-ACAP, (kp.respect || 0) - 1);
    }
    return bio(c.id);
  }
  if (r === '🕯 Send to an Order') {
    const os = bastardOrders(c),
      pick = await ask(`<h3>🕯 ${c.name} takes vows</h3>${portrait(c, 64)}<br>Base-born and outside the line, ${c.fem ? 'she' : 'he'} may leave your house for an order. ${c.fem ? 'She' : 'He'} will serve them, not you.`, [...os.map(id => F[id].name), 'Back']);
    const to = os.find(id => F[id].name === pick);
    if (to != null) joinOrder(c, to);
    return;
  }
  if (r?.startsWith('📜 Legitimise')) {
    const ok = await ask(`<h3>📜 Legitimise ${c.name}?</h3>${portrait(c, 64)}<br>A bastard lives at court but stands outside the line of succession. ${cl(F[P].ruler)} may raise him up as trueborn.<br><small>Costs ${LEGIT_COST} credits. He gains +3 loyalty and enters the line by age; your trueborn sons lose 1 loyalty each, resenting a new rival.</small>`, ['Legitimise', 'Back']);
    if (ok === 'Legitimise' && pay(LEGIT_COST)) legitimise(c, `by ${F[P].ruler.name}`);
    return bio(c.id);
  }
  if (r === '🎭 Change Mask') {
    // Deeper dread unlocks grimmer masks (respect ≤ −6 / −10 / −14)
    const tiers = {
      war: -6,
      bascinet: -6,
      faceplate: -6,
      hounskull: -10,
      plague: -10,
      skull: -14,
      veil: -14
    };
    const dr = Math.max(-(c.respect ?? 0), 6); // anyone wearing a mask may pick the basic three
    const keys = Object.keys(MASKS).filter(k => -dr <= tiers[k]);
    const shown = keys.map(k => {
      const old = c.mask;
      c.mask = k;
      const p = `<div style="display:inline-block;text-align:center;margin:3px;font-size:11px">${portrait(c, 54)}<br>${MASKS[k].n}</div>`;
      c.mask = old;
      return p;
    }).join('');
    const pick = await ask(`<h3>🎭 Choose a war mask for ${c.name}</h3>${shown}<br><small>Fear ${-(c.respect ?? 0)} — grimmer masks unlock at 10 and 14.</small>`, [...keys.map(k => MASKS[k].n), 'Back']);
    const k = keys.find(x => MASKS[x].n === pick);
    if (k) {
      c.mask = k;
      hist(c, `takes up the ${MASKS[k].n}.`);
    }
    return bio(c.id);
  }
  if (r === '📍 Go To') goTo(where, c);
  if (r === '🎓 Mentor') {
    await assignMentor(c);
    bio(c.id);
  }
  if (r === '🤫 Proclaim the Truth') {
    await reveal(c, 'proclaimed');
    bio(c.id);
  }
  if (r === '🌳 Dynasty') bloodline(c.f, c);
}
['modalBody', 'info'].forEach(id => $(id).addEventListener('click', e => {
  const el = e.target?.closest?.('[data-c]');
  if (el) {
    e.stopPropagation();
    bio(+el.dataset.c);
  }
}));
// ---- Save slots / snapshot / load live in /save.js (hooks wired via initSave) ----
initSave({
  addSystem,
  link,
  addUnit,
  stripRank,
  applyResNames,
  log,
  humans: () => humans(),
  FDEF
});
// ---- God Mode undo: snapshots taken before each action/move/end turn; undo restores the last one via a quick reload ----
const UNDO_MAX = 8;
let UNDO = []; // [{ why, d: JSON string }]
try {
  UNDO = JSON.parse(sessionStorage.getItem('sb_undo') || '[]');
} catch (e) {
  UNDO = [];
}
sessionStorage.removeItem('sb_undo');
function pushUndo(why = 'action') {
  if (!S.god || P < 0 || !systems.length) return;
  try {
    UNDO.push({
      why,
      d: JSON.stringify(snapshot())
    });
    if (UNDO.length > UNDO_MAX) UNDO.shift();
  } catch (e) {
    console.error(e);
  }
  updateGodTag();
}
async function undoLast() {
  if (busy || !UNDO.length) {
    playSfx('deny');
    return;
  }
  const top = UNDO[UNDO.length - 1];
  if ((await ask(`<h3>↶ Undo</h3>Return to the moment before: <b>${top.why}</b>?<br><small>${UNDO.length} step(s) of history kept.</small>`, ['↶ Undo', 'Cancel'])) !== '↶ Undo') return;
  UNDO.pop();
  // Store the target state and remaining history in this tab, then reload into it (keeps the camera where it was)
  for (let keep = UNDO.length; keep >= 0; keep--) {
    try {
      sessionStorage.setItem('sb_undo_cur', top.d);
      sessionStorage.setItem('sb_undo', JSON.stringify(UNDO.slice(UNDO.length - keep)));
      sessionStorage.setItem('sb_undo_cam', JSON.stringify({
        x: camGoal.x,
        z: camGoal.z,
        d: camDist,
        a: camAng
      }));
      sessionStorage.setItem('sb_load', 'undo');
      location.reload();
      return;
    } catch (e) {
      sessionStorage.removeItem('sb_undo');
    }
  }
  notify('Undo failed — not enough browser memory for the snapshot.');
}
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && S.god && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName)) {
    e.preventDefault();
    undoLast();
  }
});
async function mainMenu() {
  const c = await pauseMenu();
  if (c === 'Quit to Menu' && (await ask('<h3>Quit to Main Menu?</h3>Unsaved progress since your last save will be lost. (Saves are kept.)', ['Quit to Menu', 'Cancel'])) === 'Quit to Menu') location.reload();
  if (c === 'Quit to Desktop' && (await ask('<h3>Quit to Desktop?</h3>Unsaved progress since your last save will be lost.', ['Quit to Desktop', 'Cancel'])) === 'Quit to Desktop') quitDesktop();
  if (c === 'God Mode') await godMenu();
  if (c === 'Simulate') {
    const y = await ask('<h3>🧪 Spectator Simulation</h3>Every house — yours included — is played by the AI. Dialogs are answered automatically, nothing is saved, and at the end you get a report of errors, impossible states and odd results.<br><small>Save first if you want to come back to this campaign.</small>', ['25 years', '50 years', '100 years', 'Cancel']);
    if (y && y !== 'Cancel') await runSim(parseInt(y));
  }
  if (c === 'Settings') await settingsMenu();
  if (c === 'Tutorial') await tutorial(true);
  if (c === 'Save Game') {
    const n = await slotScreen('save');
    if (n != null) notify(save(n) ? `💾 Campaign saved to ${n === 'auto' ? 'Autosave' : 'Slot ' + n}.` : 'Save failed — device storage may be full. Delete an old save.');
  }
  if (c === 'Load Game') {
    const n = await slotScreen('load');
    if (n != null) {
      sessionStorage.setItem('sb_load', String(n));
      location.reload();
    }
  }
  if (c === 'How to Play') showManual(ask, HELP);
  if (c === 'Wiki') showWiki();
  if (c === 'Docket') await docketMenu();
  if (c === 'Orders') await ordersMenu();
  if (c === 'Treasury') await ledgerMenu();
  if (c === 'Lore') notify(`<h3>Lore</h3><div class="scroll">${INTRO}<hr>${factionLoreHTML()}<hr><div class="flab">Fragments recovered</div>${S.lore.map(l => `<p><i>${l}</i></p>`).join('') || 'Explore ruins to uncover fragments of the past.'}</div>`);
}
// Lore of every great house (uses current names/colours so renames show up)
function factionLoreHTML() {
  return `<div class="flab">The Great Houses</div>` + FDEF.map((d, i) => {
    const col = '#' + new THREE.Color(F[i]?.color ?? d[1]).getHexString();
    return `<details style="margin:4px 0;text-align:left"><summary style="cursor:pointer;color:${col};font-weight:700">${F[i]?.name ?? d[0]} <small style="opacity:.6;color:#ccc">· ${F[i]?.rel ?? d[2]}</small></summary><p style="font-size:12px;margin:4px 0">${DESC[i] || ''}</p><p style="font-size:12px;font-style:italic;opacity:.85;margin:4px 0 8px">${FLORE[i] || ''}</p></details>`;
  }).join('');
}
// Seeded RNG (mulberry32 from a string hash). Replaces Math.random so every roll in the campaign follows the seed.
function seedRng(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  let a = h >>> 0;
  Math.random = () => {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Centered pause menu overlay
function pauseMenu() {
  return new Promise(res => {
    const el = document.createElement('div');
    el.id = 'pauseMenu';
    const items = [['Resume', '▶ Resume', 'primary'], ['Save Game', '💾 Save Game'], ['Load Game', '📂 Load Game'], ['How to Play', '📖 How to Play'], ['Lore', '✠ Lore'], ['Wiki', '📚 Wiki'], ['Docket', `📜 Court Docket${S.docketNew ? ` · ${S.docketNew} new` : ''}`], ['Orders', '📋 Standing Orders'], ['Treasury', '💰 Treasury'], ['Settings', '⚙ Settings'], ['Tutorial', '🎓 Tutorial'], ['God Mode', `🛠 God Mode${S.god ? ' · ON' : ''}`], ['Simulate', '🧪 Spectator Simulation'], ['Quit to Menu', '⏏ Quit to Menu', 'danger'], ['Quit to Desktop', '⏻ Quit to Desktop', 'danger']];
    el.innerHTML = `<div class="pmCard"><div class="pmTitle">STARBLADE</div><div class="pmSub">Year ${S.year ?? ''} · Paused${S.seed ? ` · Seed ${S.seed}` : ''}</div><div class="pmRule"></div><div class="menuBtns">${items.map(([k, l, c]) => `<button data-k="${k}" class="${c || ''}">${l}</button>`).join('')}</div></div>`;
    const done = k => {
      document.removeEventListener('keydown', kd, true);
      el.remove();
      res(k);
    };
    const kd = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        done('Resume');
      }
    };
    document.addEventListener('keydown', kd, true);
    el.onclick = e => {
      const b = e.target.closest('[data-k]');
      if (b) done(b.dataset.k);else if (e.target === el) done('Resume');
    };
    document.body.appendChild(el);
  });
}
function quitDesktop() {
  try {
    if (window.starbladeDesktop?.quit) {
      window.starbladeDesktop.quit();
      return;
    }
  } catch (e) {} // Electron wrapper: real quit
  try {
    window.close();
  } catch (e) {}
  try {
    window.top !== window && window.top.close();
  } catch (e) {}
  setTimeout(() => {
    try {
      music?.pause?.();
    } catch (e) {}
    document.body.innerHTML = `<div style="position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cfe8ff;font-family:Orbitron,sans-serif;text-align:center;gap:18px"><div style="font-size:clamp(26px,7vw,56px);letter-spacing:.35em;color:#fff4d0;text-shadow:0 0 14px #ffb040">STARBLADE</div><div style="letter-spacing:4px;opacity:.75;font-size:13px">THE STARS GO DARK. FAREWELL, COMMANDER.</div><div style="font-size:11px;opacity:.45">You may now close this tab.</div><button onclick="location.reload()" style="margin-top:20px;padding:12px 28px;background:none;border:1px solid #7fd0ff;color:#cfe8ff;font-family:inherit;letter-spacing:3px;cursor:pointer">↻ RETURN</button></div>`;
  }, 150);
}
// ---- Medieval II-style cycle: fleets → agents → worlds that still have actions this turn ----
let reviewed = new Set();
function pending() {
  const us = units.filter(u => u.owner === P && u.mp > 0 && !u.acted && !u.path?.length).sort((a, b) => (a.type === 'fleet' ? 0 : 1) - (b.type === 'fleet' ? 0 : 1));
  const ws = systems.filter(s => s.owner === P && !s.built);
  return [...us, ...ws].filter(x => !reviewed.has(x));
}
function focus(x) {
  if (x.sys) {
    selU = x;
    selected = x.sys;
  } else {
    selU = null;
    selected = x;
  }
  reviewed.add(x);
  $('info').classList.remove('min');
  camGoal.set(selected.pos.x, 0, selected.pos.z);
  camDist = Math.min(camDist, 40);
  refresh();
  showInfo();
}
async function nextArmy() {
  const p = pending();
  if (!p.length) {
    const r = await ask('<h3>✅ All caught up</h3>Every fleet, agent and world has been reviewed this turn.', ['End Turn', 'Cycle Again', 'Close']);
    if (r === 'Cycle Again') {
      reviewed.clear();
      if (pending().length) nextArmy();
    }
    if (r === 'End Turn') $('endTurn').click();
    return;
  }
  reviewed.add(p[0]);
  focus(p[0]);
}
// ---- Realm overview: everything you own, one tap away ----
async function realmView() {
  const f = F[P];
  const done = x => reviewed.has(x) || (x.sys ? x.mp <= 0 || x.acted : x.built);
  const row = (x, id, txt) => `<div class="go${done(x) ? ' done' : ''}" data-go="${id}">${x.path?.length ? '🧭' : done(x) ? '✅' : '•'} ${txt}</div>`;
  const ws = systems.filter(s => s.owner === P),
    fl = units.filter(u => u.owner === P && u.type === 'fleet'),
    ag = units.filter(u => u.owner === P && u.type === 'agent');
  const techs = f.tech.length ? f.tech.map(t => `<div>🔬 <b>${t}</b> — <small>${GW[t]?.d || ''}</small></div>`).join('') : '<small>None yet. Explore ruins and derelicts, or find a Scientist for your generals\' retinues.</small>';
  const h = `<h3>📋 The Realm</h3><small>Tap anything to jump to it. ✅ = acted / reviewed · 🧭 = on a journey</small><div class="scroll">
    <div class="rep-sec">🪐 Worlds (${ws.length})</div>${ws.map(s => row(s, 's' + s.i, `${s === f.capital ? '👑 ' : ''}<b>${s.name}</b> <small>💰${s.income} · Order ${s.order}${s.general ? ' · ⚑ ' + s.general.name : ''}${s.siege ? ' · ⛓ blockaded' : ''}</small>`)).join('')}
    <div class="rep-sec">🚀 Fleets (${fl.length})</div>${fl.map(u => row(u, 'u' + u.id, `${uName(u)} <small>@ ${u.sys.name} · 🚀${ships(u)} 🛡${u.legions} · MP ${u.mp}</small>`)).join('') || '<small>None</small>'}
    <div class="rep-sec">🕵 Agents (${ag.length})</div>${ag.map(u => row(u, 'u' + u.id, `${uIcon(u)} ${uName(u)} <small>@ ${u.sys.name} · MP ${u.mp}</small>`)).join('') || '<small>None</small>'}
    <div class="rep-sec">🔬 Known Technology</div>${techs}</div>`;
  const r = await ask(h, ['Close']);
  if (!r.startsWith('go:')) return;
  const id = r.slice(3),
    x = id[0] === 's' ? systems[+id.slice(1)] : units.find(u => u.id === +id.slice(1));
  if (x) focus(x);
}
$('modalBody').addEventListener('click', e => {
  const el = e.target?.closest?.('[data-go]');
  if (!el || !modalOpen()) return;
  e.stopPropagation();
  resolveTop('go:' + el.dataset.go);
});
const gate = fn => async () => {
  if (busy || P < 0) return;
  try {
    await fn();
  } catch (e) {
    console.error(e);
  }
};
$('bMenu').onclick = gate(mainMenu);
// 💬 Recent dialogue: everything your people (and others) have said lately
{
  const tb = document.createElement('button');
  tb.id = 'bTalk';
  tb.className = 'tbtn';
  tb.title = 'Recent dialogue';
  tb.textContent = '💬';
  tb.onclick = e => {
    e.stopPropagation();
    talkLog();
  };
  $('bMenu').parentElement.insertBefore(tb, $('bMenu'));
}
async function talkLog() {
  const L = (S.talk || []).slice().reverse();
  const rows = L.map(t => {
    const c = CH[t.id];
    return `<div class="go" data-c="${t.id}" style="display:flex;gap:8px;align-items:center;padding:4px 0;border-bottom:1px solid #ffffff14">${c ? `<span style="flex:none;display:flex">${portrait(c, 30)}</span>` : ''}<span style="font-size:12px"><b style="color:#f2c94c">${t.n}</b>${F[t.f] ? ` <small style="opacity:.6">${F[t.f].name}</small>` : ''} <small style="opacity:.5">Y${t.y}</small><br><i>"${t.l}"</i></span></div>`;
  }).join('');
  const p = ask(`<h3>💬 Recent Dialogue</h3><div class="scroll" style="max-height:55vh">${rows || '<small>No one has spoken yet. Select generals, give orders and fight battles to hear from your people.</small>'}</div><small style="opacity:.6">Tap a speaker to open their bio.</small>`, ['Close']);
  document.querySelectorAll('#modalBody [data-c]').forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = () => {
      const c = CH[+el.dataset.c];
      if (c) bio(c.id);
    };
  });
  await p;
}
$('bNews').onclick = gate(newsView);
$('bFaction').onclick = gate(async () => {
  busy = true;
  try {
    await factionPage();
  } finally {
    busy = false;
    refresh();
    showInfo();
  }
});
// Safety net: if input is locked but nothing is on screen (no dialog, battle, menu or turn processing), unlock it
{
  let lockT = 0;
  setInterval(() => {
    const blocking = SIM || $('modal').style.display === 'flex' || document.getElementById('tac') || document.getElementById('pauseMenu') || scr.style.display === 'flex' || $('curtain').style.display === 'flex' || $('endTurn').dataset.proc === '1';
    if (busy && !blocking) {
      lockT += 1;
      if (lockT >= 8) {
        busy = false;
        lockT = 0;
        console.warn('Input lock released by watchdog');
        refresh();
        showInfo();
      }
    } else lockT = 0;
  }, 1000);
}
$('bBook').onclick = gate(bookView);
// ---- Bottom tabs: cycle Planets / Armies / Agents ----
function cycleKind(kind) {
  const list = kind === 'p' ? systems.filter(s => s.owner === P) : units.filter(u => u.owner === P && u.type === (kind === 'a' ? 'fleet' : 'agent'));
  if (!list.length) return notify(kind === 'a' ? 'You have no armies.' : kind === 'g' ? 'You have no agents.' : 'You hold no planets.');
  const cur = kind === 'p' ? selU ? null : selected : selU;
  // Prefer the next one that still has actions; otherwise just step forward
  const i = list.indexOf(cur),
    order = [...list.slice(i + 1), ...list.slice(0, i + 1)];
  focus(order.find(x => !reviewed.has(x) && (x.sys ? x.mp > 0 && !x.acted : !x.built)) || order[0]);
}
$('tPlanets').onclick = gate(() => cycleKind('p'));
$('tArmies').onclick = gate(() => cycleKind('a'));
$('tAgents').onclick = gate(() => cycleKind('g'));
// ---- Info-panel cycling: ◀ ▶ through your worlds, or through your fleets & characters ----
function navList() {
  if (selU && units.includes(selU)) return units.filter(u => u.owner === selU.owner && u.type === selU.type && (selU.owner === P || inSight(u.sys)));
  if (selected) return selected.owner === P ? systems.filter(s => s.owner === P) : systems.filter(s => s.owner === selected.owner && s.owner >= 0 && inSight(s));
  return [];
}
function addNav() {
  const list = navList(),
    cur = selU && units.includes(selU) ? selU : selected,
    i = list.indexOf(cur);
  $('info').querySelectorAll('.nav').forEach(x => x.remove());
  if (list.length < 2 || i < 0) return;
  const kind = cur.sys ? cur.type === 'agent' ? cur.owner === P ? 'your agents' : 'their agents' : cur.owner === P ? 'your armies' : 'their armies' : cur.owner === P ? 'your worlds' : 'their worlds';
  const nav = document.createElement('div');
  nav.className = 'nav cycbar';
  nav.innerHTML = `<button data-nav="-1">◀</button><span>${i + 1} / ${list.length} · ${kind}</span><button data-nav="1">▶</button>`;
  $('info').appendChild(nav); // pinned to the panel's bottom edge, which never moves
}
$('info').addEventListener('click', e => {
  const b = e.target.closest?.('[data-nav]');
  if (!b || busy) return;
  e.stopPropagation();
  const list = navList(),
    cur = selU && units.includes(selU) ? selU : selected,
    i = list.indexOf(cur);
  if (i >= 0) focus(list[(i + +b.dataset.nav + list.length) % list.length]);
});
// ---- ✉ Galactic News ----
async function newsView() {
  S.newsUnread = false;
  updateStats();
  const recent = S.ledger.slice(-40).reverse().map(e => `<div><small>Y${e.y}</small> ${e.m}</div>`).join('');
  const r = await ask(`${S.news || '<h3>✉ Galactic News</h3><i>No dispatches yet. End your first turn to receive word from across the galaxy.</i>'}<div class="rep-sec">📡 Latest Dispatches</div><div class="scroll" style="max-height:26vh">${recent || '<small>Nothing yet.</small>'}</div>`, ['📜 Full Ledger', 'Close']);
  if (r === '📜 Full Ledger') await ledgerView();
}
// ---- 📖 Book: history, wiki, lore ----
async function bookView() {
  const r = await ask('<h3>📖 The Book of Ages</h3><small>The recorded history of the galaxy and those who shaped it.</small>', ['📜 Galactic Ledger', '👥 Character Wiki', '🕯 Lore', '❔ How to Play', 'Close']);
  if (r === '📜 Galactic Ledger') await ledgerView();
  if (r === '👥 Character Wiki') await wiki();
  if (r === '🕯 Lore') await notify(`<h3>Lore</h3><div class="scroll">${INTRO}<hr>${S.lore.map(l => `<p><i>${l}</i></p>`).join('') || 'Explore ruins to uncover fragments of the past.'}</div>`);
  if (r === '❔ How to Play') await showManual(ask, HELP);
}
// ---- ⚜ Faction page: court, dynasty, rankings, standings of the powers ----
function rankings() {
  const alive = F.filter(f => f.alive);
  const val = {
    mil: f => units.filter(u => u.owner === f.id && u.type === 'fleet').reduce((t, u) => t + spacePow(u) + landPow(u), 0) + systems.filter(s => s.owner === f.id).reduce((t, s) => t + landPow(s) + spacePow(s) + stnPow(s), 0),
    prod: f => systems.filter(s => s.owner === f.id).reduce((t, s) => t + s.b.size * 25 + (s.stn || 0) * 15 + s.income * (f.mods.prod || 1) * 0.5, 0),
    fin: f => f.gold + (f.net || 0) * 6,
    terr: f => systems.filter(s => s.owner === f.id).length
  };
  const R = {};
  for (const k of Object.keys(val)) {
    const sorted = [...alive].sort((a, b) => val[k](b) - val[k](a));
    sorted.forEach((f, i) => {
      (R[f.id] ??= {})[k] = i + 1;
    });
  }
  const overall = [...alive].sort((a, b) => R[a.id].mil + R[a.id].prod + R[a.id].fin + R[a.id].terr - (R[b.id].mil + R[b.id].prod + R[b.id].fin + R[b.id].terr));
  overall.forEach((f, i) => {
    R[f.id].all = i + 1;
  });
  return {
    R,
    n: alive.length,
    overall
  };
}
const relTo = id => id === P ? '⚜ You' : S.ally.has(key(P, id)) ? '🤝 Allied' : atWar(P, id) ? '⚔ War' : '☮ Peace';
const rankGrid = (r, n) => !r ? '<div class="rank"><span>🏆 Overall</span><i>— fallen house</i></div>' : `<div class="rank"><span>🏆 Overall</span><i>#${r.all} of ${n}</i><span>⚔ Military</span><i>#${r.mil}</i><span>⚙ Production</span><i>#${r.prod}</i><span>💰 Financial</span><i>#${r.fin}</i><span>🪐 Territory</span><i>#${r.terr}</i></div>`;
async function factionPage() {
  courtMusic();
  const f = F[P],
    {
      R,
      n,
      overall
    } = rankings();
  const fam = [...f.heirs, ...f.princesses].filter(x => x && !x.dead);
  const col = id => '#' + new THREE.Color(F[id].color).getHexString();
  const h = `<h3 style="color:${col(P)}">⚜ ${f.name}</h3><div class="ccard">${portrait(f.ruler, 72)}<div style="font-size:12px">👑 ${cl(f.ruler)}<br>${attrStr(f.ruler).split(' · ').slice(0, 3).join('<br>')}<br>✝ ${f.rel} · 🔬 ${f.tech.length} techs</div></div>
    ${rankGrid(R[P], n)}
    <div class="flab">Family</div><div class="frow">${fam.map(x => card(x)).join('') || '<small>No heirs.</small>'}</div>
    <div class="flab">Standings of the Powers — tap to view</div><div class="scroll" style="max-height:24vh">${overall.map(o => `<div class="go" data-go="f${o.id}">#${R[o.id].all} <b style="color:${col(o.id)}">${o.name}</b> <small>${relTo(o.id)} · 🪐${systems.filter(s => s.owner === o.id).length}${o.dormant ? '' : ''}</small></div>`).join('')}</div>`;
  const r = await ask(h, ['📑 Lists', '👑 Court', '🌳 Dynasty', '📋 Realm', 'Close']);
  if (r === '📑 Lists') {
    const back = await listsPage('p');
    return back ? factionPage() : undefined;
  }
  if (r === '👑 Court') {
    await court();
    return factionPage();
  }
  if (r === '🌳 Dynasty') {
    await bloodline(P);
    return factionPage();
  }
  if (r === '📋 Realm') return realmView();
  if (r.startsWith('go:f')) {
    await foreignFaction(+r.slice(4));
    return factionPage();
  }
}
// ---- M2TW-style Lists: planets, armies and agents with summaries. Tap a row to jump to it. Returns true for "Back". ----
async function listsPage(tab = 'p') {
  const ws = systems.filter(s => s.owner === P),
    fl = units.filter(u => u.owner === P && u.type === 'fleet'),
    ag = units.filter(u => u.owner === P && u.type === 'agent');
  const st = u => u.path?.length ? '<span style="color:#9cf">🧭 en route</span>' : u.type === 'agent' ? u.acted ? '<span style="color:#f96">⏳ done</span>' : '<span style="color:#8f8">✅ ready</span>' : u.mp > 0 ? `<span style="color:#8f8">✅ ${u.mp}/${u.max} mp</span>` : '<span style="color:#f96">⏳ no moves</span>';
  const ordCol = o => o >= 7 ? '#8f8' : o >= 4 ? '#fd6' : '#f77';
  const row = (id, pt, html) => `<div class="go lrow" data-go="${id}">${pt ? `<span class="lpt">${pt}</span>` : ''}<span class="lbody">${html}</span></div>`;
  let body = '',
    title = '';
  if (tab === 'p') {
    title = `🪐 Planets (${ws.length}) · Income ${ws.reduce((t, s) => t + (s.siege ? 0 : s.income), 0)}`;
    body = ws.sort((a, b) => b.income - a.income).map(s => row('s' + s.i, s.general ? portrait(s.general, 30) : '', `<b>${s === F[P].capital ? '👑 ' : ''}${s.name}</b> <small>${geo(s).type}</small><br><small>💰${s.income} · Order <b style="color:${ordCol(s.order)}">${s.order}</b> · ✝ ${s.rel} · 🛡${s.legions}+${s.elite} · 🚀${s.fleet}${s.stn ? ' · 🛰' + s.stn : ''}<br>${s.general ? `⚑ ${s.general.name} (Adm ${s.general.admin ?? 0})` : '<span style="color:#f96">No governor</span>'} · 🏗 ${s.b.size} works${s.built ? '' : ' · <span style="color:#8f8">can build</span>'}${s.siege ? ' · <span style="color:#f77">⛓ blockaded</span>' : ''}${s.order <= 3 ? ' · <span style="color:#f77">unrest!</span>' : ''}</small>`)).join('');
  } else if (tab === 'a') {
    title = `🚀 Armies (${fl.length}) · ${fl.reduce((t, u) => t + ships(u), 0)} ships · ${fl.reduce((t, u) => t + u.legions + u.elite, 0)} troops`;
    body = fl.map(u => row('u' + u.id, u.general ? portrait(u.general, 30) : '', `<b>${uName(u)}</b> ${st(u)}<br><small>@ ${u.sys.name}${u.path?.length ? ' → ' + u.path[u.path.length - 1].name : ''} · 🚀${ships(u)} · 🛡${u.legions} · ⭐${u.elite}${u.general ? ` · Cmd ${u.general.skill} · Loy ${u.general.loyalty}${u.general.starblade ? ' · Starblade' : ''}` : ' · <span style="color:#f96">leaderless</span>'}${u.sys.siege?.by === P && u.sys.owner !== P ? ' · ⛓ besieging' : ''}</small>`)).join('') || '<small>No fleets.</small>';
  } else if (tab === 'v') {
    // Vassalage: your liege, your vassals (tribute, mood, strength, break-away risk), and every oath in the galaxy
    const lg = liegeOf(P),
      vs = vassalsOf(P),
      trib = v => tribOf(v);
    const risk = v => {
      const ratio = power(v) / Math.max(1, power(P)),
        op = opinion(v, P);
      return ratio > 1.2 || op <= -10 ? '<span style="color:#f77">restless — may break free</span>' : ratio > 0.9 || op < 0 ? '<span style="color:#fd6">uneasy</span>' : '<span style="color:#8f8">loyal</span>';
    };
    const fRow = (v, extra) => row(F[v].capital ? 's' + F[v].capital.i : '', F[v].ruler ? portrait(F[v].ruler, 30) : '', `<b style="color:#${new THREE.Color(F[v].color).getHexString()}">${F[v].name}</b><br><small>${extra}</small>`);
    const others = Object.keys(S.vassal || {}).map(Number).filter(v => F[v]?.alive && F[S.vassal[v]]?.alive && v !== P && S.vassal[v] !== P && charted(F[v].capital || systems[0]));
    title = `🙇 Vassalage · ${vs.length} vassal${vs.length !== 1 ? 's' : ''}${lg != null ? ' · sworn to ' + F[lg].name : ''}`;
    body = (lg != null && F[lg] ? `<div class="flab">Your liege</div>${fRow(lg, `🪐 ${worldsOf(lg)} worlds · Mood ${moodTxt(opinion(lg, P))} · you pay up to ${trib(P)} credits a year · you join their wars`)}` : '<small>You are sworn to no one.</small>') + `<div class="flab">Your vassals</div>${vs.map(v => fRow(v, `🪐 ${worldsOf(v)} worlds · ⚔ strength ${Math.round(power(v))} vs your ${Math.round(power(P))} · Mood ${moodTxt(opinion(v, P))} · tribute ~${trib(v)}/yr · ${risk(v)}`)).join('') || '<small>No house has bent the knee to you. Send a Diplomat to demand it.</small>'}` + (others.length ? `<div class="flab">Oaths across the known galaxy</div>${others.map(v => fRow(v, `sworn to ${F[S.vassal[v]].name}`)).join('')}` : '');
  } else {
    title = `🕵 Agents (${ag.length})`;
    body = ag.map(u => row('u' + u.id, portrait(u.char, 30), `<b>${uIcon(u)} ${uName(u)}</b> ${st(u)}<br><small>@ ${u.sys.name}${u.sys.owner >= 0 && u.sys.owner !== P ? ` (${F[u.sys.owner].name})` : ''} · ${SK(u.char)} ${u.char.skill}${u.role === 'Priest' || u.role === 'Master' ? ` · Piety ${u.char.piety}` : ''}${u.char.survived ? ` · survived ${u.char.survived} attempt(s)` : ''}${u.post != null ? ' · 💰 trade post' : ''}${u.char.anc?.length ? ' · 🎒 ' + u.char.anc.join(', ') : ''}</small>`)).join('') || '<small>No agents.</small>';
  }
  const tabs = [['p', '🪐 Planets'], ['a', '🚀 Armies'], ['g', '🕵 Agents'], ['v', '🙇 Vassals']].filter(t => t[0] !== tab).map(t => t[1]);
  const r = await ask(`<h3>📑 Lists — ${title}</h3><small>Tap any row to jump to it on the map.</small><div class="scroll" style="max-height:58vh">${body}</div>`, [...tabs, 'Back', 'Close']);
  if (r === '🪐 Planets') return listsPage('p');
  if (r === '🚀 Armies') return listsPage('a');
  if (r === '🕵 Agents') return listsPage('g');
  if (r === '🙇 Vassals') return listsPage('v');
  if (r === 'Back') return true;
  if (r?.startsWith('go:')) {
    const id = r.slice(3),
      x = id[0] === 's' ? systems[+id.slice(1)] : units.find(u => u.id === +id.slice(1));
    if (x) focus(x);
  }
  return false;
}
async function foreignFaction(id) {
  if (id === P) return;
  const f = F[id],
    {
      R,
      n
    } = rankings();
  const fam = [...f.heirs, ...(f.princesses || [])].filter(x => x && !x.dead);
  const known = S.charts?.includes(id) || S.ally.has(key(P, id)) || systems.some(s => s.owner === id && inSight(s));
  const h = `<h3 style="color:#${new THREE.Color(f.color).getHexString()}">${f.name}</h3><div class="ccard">${f.ruler ? portrait(f.ruler, 64) : ''}<div style="font-size:12px">${f.ruler ? `👑 ${cl(f.ruler)}<br>` : ''}${relTo(id)} · ✝ ${f.rel}${id !== P && !hostile(f) ? `<br>Mood toward you: ${moodTxt(opinion(id, P))}` : ''}<br>🪐 ${systems.filter(s => s.owner === id).length} systems${liegeOf(id) != null && F[liegeOf(id)] ? `<br>🙇 Vassal of <b>${F[liegeOf(id)].name}</b>` : ''}${vassalsOf(id).length ? `<br>👑 Liege of ${vassalsOf(id).map(v => F[v].name).join(', ')}` : ''}${f.mods.ff ? '<br>🌑 Undying. They do not negotiate.' : ''}</div></div>
    ${R[id] ? rankGrid(R[id], n) : ''}
    ${known ? `<div class="flab">${celibate(id) ? 'Initiates' : 'Family'}</div><div class="frow">${fam.map(x => card(x)).join('') || '<small>none known</small>'}</div>` : '<small>◌ Little is known of their court. Make contact, ally, or exchange star charts.</small>'}`;
  const r = await ask(h, [...(known && !f.domiri ? ['🌳 Dynasty'] : []), ...(F[id].capital && charted(F[id].capital) ? ['📍 Go To Capital'] : []), 'Back']);
  if (r === '🌳 Dynasty') {
    await bloodline(id);
    return foreignFaction(id);
  }
  if (r === '📍 Go To Capital') goTo(F[id].capital);
}
$('info').addEventListener('click', e => {
  if (e.target.closest('h3')) $('info').classList.toggle('min');
});
// Top bar: tap anywhere on it (except its buttons) to collapse/expand; a ▾/▸ chevron shows the state
$('top').addEventListener('click', e => {
  if (e.target.closest('[data-ledger]') && !$('top').classList.contains('min')) {
    if (!busy) ledgerMenu();
    return;
  } // Credits → treasury ledger
  if (!e.target.closest('button')) $('top').classList.toggle('min');
});
{
  const tg = document.createElement('button');
  tg.id = 'topTog';
  tg.className = 'tbtn';
  tg.title = 'Show/hide stats';
  tg.onclick = e => {
    e.stopPropagation();
    $('top').classList.toggle('min');
  };
  $('bMenu').parentElement.prepend(tg);
}

// ================= Units: fleets & agents =================
let selU = null;
const hopCost = (a, b) => a.pos.distanceTo(b.pos) > 9 ? 2 : 1;
const fleetGeo = new THREE.ConeGeometry(0.26, 1.4, 6),
  agentGeo = new THREE.OctahedronGeometry(0.4),
  agentRing = new THREE.TorusGeometry(0.55, 0.06, 6, 20);
const fleetWing = new THREE.BoxGeometry(0.05, 0.45, 1.05),
  fleetFin = new THREE.BoxGeometry(0.32, 0.3, 0.04),
  fleetGlowGeo = new THREE.SphereGeometry(0.09, 8, 6);
const fleetGrey = new THREE.MeshStandardMaterial({
  color: 0x8a94a6,
  metalness: 0.7,
  roughness: 0.35
});
const fleetGlow = new THREE.MeshBasicMaterial({
  color: 0x8fd8ff,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const uIcon = u => u.type === 'fleet' ? '🚀' : AICON[u.role] || '•';
const bL = (s, none = 'none') => [...s.b].map(b => bName(s, b) + (BCHAIN[b] ? ` (Lv${bLv(s, b)})` : '')).join(', ') || none; // buildings with custom names
// ---- Building chains (M2TW-style): each level needs a larger settlement (income) and takes turns to raise ----
const bLv = (s, n) => s?.b?.has(n) ? Math.max(1, s.lv?.[n] || 1) : 0;
const bName = (s, n) => s.bn?.[n] || BCHAIN[n]?.lv[bLv(s, n) - 1] || n;
const sizeName = s => s.income >= 170 ? 'Metropolis' : s.income >= 110 ? 'Great Arcology' : s.income >= 60 ? 'Town-World' : 'Outpost';
function bqTick() {
  for (const s of systems) {
    const q = s.bq;
    if (q) {
      if (s.owner !== q.f || !s.b.has(q.n)) s.bq = null;else if (!s.siege && --q.left <= 0) {
        (s.lv ??= {})[q.n] = q.to;
        s.bq = null;
        if (q.f === P) {
          log(`🏗 ${s.name}: the ${BCHAIN[q.n].lv[q.to - 1]} is complete (Lv${q.to}).`);
          toast(`🏗 ${BCHAIN[q.n].lv[q.to - 1]} completed at ${s.name}`, true);
        }
      }
    }
    // Yearly yields of great buildings
    if (S.turn % 2 === 1 && s.owner >= 0 && !s.siege) {
      if (bLv(s, 'Barracks') >= 4 && s.legions < 20) s.legions++;
      if (bLv(s, 'Shipyard') >= 3 && s.fleet < 12) s.fleet++;
      if (bLv(s, 'Temple') >= 4) apoc(-0.5);
    }
  }
}
// Conquest damages buildings: each chain drops a level (sacking drops two), and works in progress are lost
function damageBuildings(s, n = 1) {
  s.bq = null;
  for (const b of Object.keys(s.lv || {})) s.lv[b] = Math.max(1, s.lv[b] - n);
}
async function buildMenu(s) {
  for (;;) {
    const own = s.owner === P,
      opts = [];
    let h = `<h3>🏗 Buildings of ${s.name}</h3><small>Settlement: <b>${sizeName(s)}</b> (size ${s.income}). Larger worlds unlock higher levels: Lv2 at 60, Lv3 at 110, Lv4 at 170.</small>`;
    if (s.bq) h += `<div class="rep-sec">🏗 Under construction</div><div><b>${BCHAIN[s.bq.n].lv[s.bq.to - 1]}</b> — ${s.bq.left} turn(s) left${s.siege ? ' <span style="color:#f77">(halted by blockade)</span>' : ''}</div>`;
    h += '<div class="scroll">';
    for (const [n, B] of Object.entries(BCHAIN)) {
      const lv = bLv(s, n);
      if (!lv) continue;
      h += `<div style="margin:6px 0"><b>${B.ic} ${bName(s, n)}</b> <small>Lv${lv}/${B.lv.length}</small><br><small>${B.d.slice(0, lv).map((d, i) => `<span style="opacity:${i === lv - 1 ? 1 : .55}">${d}</span>`).join('<br>')}</small>`;
      if (lv < B.lv.length) {
        const to = lv + 1,
          cost = B.c * to,
          need = BSIZE[to];
        h += `<br><small style="color:#9cf">Next: ${B.lv[to - 1]} — ${B.d[to - 1]} · ${cost} cr · ${BTIME[to]} turn(s)${s.income < need ? ` · <span style="color:#f88">needs size ${need}</span>` : ''}</small>`;
        if (own && !s.bq && s.income >= need) opts.push([`⬆ ${B.lv[to - 1]} (${cost})`, n, to, cost]);
      }
      h += '</div>';
    }
    h += '</div>';
    if (own && s.built && opts.length && !s.bq) h += '<small>One construction order per world per turn — upgrades already ordered this turn wait for next.</small>';
    const avail = own && !s.built ? opts : [];
    const r = await ask(h, [...avail.map(o => o[0]), '◀ Back']);
    const o = avail.find(x => x[0] === r);
    if (!o) return;
    if (pay(o[3])) {
      s.bq = {
        n: o[1],
        to: o[2],
        left: BTIME[o[2]],
        f: P
      };
      s.built = true;
      log(`🏗 ${s.name}: work begins on the ${BCHAIN[o[1]].lv[o[2] - 1]}.`);
    }
  }
}
const uName = u => u.nm ? u.nm : u.type === 'fleet' ? `Fleet${u.general ? ' of General ' + u.general.name : u.captain ? ' of ' + u.captain.name : ''} (${u.fleet})` : ['Priest', 'Master'].includes(u.role) ? u.char.name : `${rn(u.role)} ${u.char.name}`;
function addUnit(o) {
  const u = {
    id: ++ID.u,
    mp: 0,
    max: o.type === 'agent' ? 3 : 2,
    acted: false,
    fleet: 0,
    legions: 0,
    elite: 0,
    general: null,
    ...o
  };
  if (u.type === 'fleet' && !u.captain) u.captain = mkCapt(u.owner); // every fleet has at least a captain on the bridge
  const fc = F[u.owner]?.color ?? 0xffffff;
  const col = u.type === 'fleet' ? fc : ROLE[u.role];
  u.mesh = new THREE.Mesh(u.type === 'fleet' ? fleetGeo : agentGeo, u.type === 'fleet' ? new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.25,
    metalness: 0.6,
    roughness: 0.35
  }) : new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.5
  }));
  if (u.type === 'fleet') {
    // Flagship: spear hull, swept wings, glowing drives, and escorts that appear as the fleet grows
    u.mesh.rotation.z = -Math.PI / 2;
    const fin = new THREE.Mesh(fleetFin, new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.4
    }));
    fin.position.set(-0.16, -0.38, 0);
    u.mesh.add(fin);
    [-0.2, 0.2].forEach(z => {
      const e = new THREE.Mesh(fleetGlowGeo, fleetGlow);
      e.position.set(0, -0.68, z);
      u.mesh.add(e);
    });
    u.escorts = [[-0.25, 0.75], [-0.25, -0.75], [-0.6, 1.25], [-0.6, -1.25]].map(([y, z]) => {
      const m = new THREE.Mesh(fleetGeo, u.mesh.material);
      m.scale.setScalar(0.42);
      m.position.set(0, y, z);
      const g2 = new THREE.Mesh(fleetGlowGeo, fleetGlow);
      g2.position.y = -0.7;
      g2.scale.setScalar(1.6);
      m.add(g2);
      u.mesh.add(m);
      return m;
    });
  } else {
    const r = new THREE.Mesh(agentRing, new THREE.MeshBasicMaterial({
      color: fc
    }));
    r.rotation.x = Math.PI / 2;
    u.mesh.add(r);
  }
  u.mesh.userData.unit = u;
  u.mesh.position.copy(u.sys.pos);
  scene.add(u.mesh);
  units.push(u);
  return u;
}
// A fleet with no ships left is gone: its troops are lost with the hulls, its commander escapes to the nearest friendly world's reserve
function wreck(u) {
  if (!units.includes(u)) return;
  const g = u.general;
  if (g && !g.dead && !g.captive && g.f === u.owner) {
    const own = systems.filter(s => s.owner === u.owner);
    const home = own.find(s => s === u.sys) || own.find(s => u.sys?.links?.includes(s)) || (F[u.owner]?.capital?.owner === u.owner ? F[u.owner].capital : own[0]);
    u.general = null;
    if (home) {
      station(home, g);
      hist(g, `escapes the wreck of his fleet${u.sys ? ' at ' + u.sys.name : ''} and returns to ${home.name}.`);
    }
  }
  removeUnit(u);
}
function wreckSweep() {
  for (const u of [...units]) if (u.type === 'fleet' && ships(u) <= 0) wreck(u);
}
function removeUnit(u) {
  const i = units.indexOf(u);
  if (i >= 0) units.splice(i, 1);
  scene.remove(u.mesh);
  if (selU === u) selU = null;
}
function addShips(owner, s, n) {
  const u = units.find(x => x.type === 'fleet' && x.owner === owner && x.sys === s);
  if (u) u.fleet += n;else addUnit({
    type: 'fleet',
    owner,
    sys: s,
    fleet: n
  });
}
function addAgent(owner, s, role) {
  const c = role === 'Witch' ? mkFem(owner, ri(20, 50)) : mkChar(owner, ri(22, 40));
  c.role = role;
  if (role === 'Priest') {
    c.name = 'Nameless Monk';
    c.traits = [];
    c.piety = Math.max(c.piety, 5);
  }
  if (role === 'Master') {
    c.name = 'Master ' + rnd(EPI);
    c.traits = [];
    c.piety = Math.max(c.piety, 7);
  }
  if (role === 'Zithari' || role === 'Witch') c.piety = Math.min(c.piety, 3);
  c.hist.push(`Y${S.year}: enters service as a ${role}.`);
  // Nightfleet envoys ride the fastest couriers in the galaxy: the rim is far from every court
  return addUnit({
    type: 'agent',
    role,
    owner,
    sys: s,
    char: c,
    ...(owner === 1 && role === 'Diplomat' ? {
      max: 5
    } : {})
  });
}
const enemyFleetPow = (t, o) => units.filter(x => x.type === 'fleet' && x.sys === t && x.owner !== o && atWar(x.owner, o)).reduce((a, x) => a + spacePow(x), 0);
function shrink(o, k) {
  o.fleet = Math.floor(o.fleet * k);
  o.legions = Math.floor(o.legions * k);
  o.elite = Math.floor(o.elite * k);
  roScale(o, 'space', k);
  roScale(o, 'land', k);
}
// Pre-battle briefing: what stands in the way, rough odds, and a Withdraw option (no moves spent)
async function preBattle(u, t, foes, declare) {
  const mine = spacePow(u),
    sta = (t.stn || 0) > 0 && t.owner !== P ? stnPow(t) : 0;
  const theirs = sta + (t.owner !== P ? spacePow(t) : 0) + foes.reduce((a, f) => a + spacePow(f), 0);
  const ratio = mine / Math.max(1, mine + theirs),
    pc = Math.round(ratio * 100);
  const verdict = !theirs ? 'No warships oppose you.' : ratio > 0.65 ? 'Your fleet should prevail.' : ratio > 0.45 ? 'An even fight.' : 'The odds are against you.';
  const lines = [];
  if (sta) lines.push(`Orbital Station Lv${t.stn}`);
  if (t.owner !== P && t.fleet + roCount(t, 'space') > 0) lines.push(`${t.fleet + roCount(t, 'space')} picket ships`);
  foes.forEach(f => lines.push(`Fleet of ${f.general ? f.general.name : F[f.owner]?.name || 'raiders'} (${ships(f)} ships)`));
  if (t.owner !== P && t.legions + t.elite > 0) lines.push(`${t.legions} legions, ${t.elite} elite on the ground (siege follows)`);
  const r = await ask(`<h3>Engage at ${t.name}?</h3>${declare ? `<div class="noact">This will declare war on ${F[t.owner].name}.</div>` : ''}<small>Defenders: ${t.owner >= 0 ? F[t.owner]?.name : 'Independents'}</small><br>${lines.map(l => `<div>- ${l}</div>`).join('') || '<div>- No defenders</div>'}<div class="bt-bal" style="margin:8px 0;height:10px;background:#a03030;border-radius:5px;overflow:hidden"><div style="width:${pc}%;height:100%;background:#40c060"></div></div><small>Your strength ${Math.round(mine)} vs ${Math.round(theirs)} — ${verdict}</small>`, ['Attack', 'Withdraw']);
  return r === 'Attack';
}
// Safety net: hostile fleets that end up sharing an orbit (spawned, rebelled, arrived by events) fight at once.
async function orbitClash() {
  for (const u of [...units]) {
    if (!units.includes(u) || u.type !== 'fleet' || isHuman(u.owner) || ships(u) <= 0) continue;
    const t = u.sys,
      foe = units.find(x => x !== u && x.type === 'fleet' && x.sys === t && ships(x) > 0 && atWar(x.owner, u.owner) && isHuman(x.owner));
    if (!foe) continue;
    const from = t.links[0];
    if (!from) continue;
    u.sys = from;
    u.mp = Math.max(u.mp || 0, hopCost(from, t));
    u.path = [];
    try {
      await moveUnit(u, t);
    } catch (e) {
      console.error(e);
      if (units.includes(u)) u.sys = t;
    }
    if (units.includes(u) && u.sys === from) u.sys = t; // repelled: stays at its world, battered
  }
}
async function moveUnit(u, t) {
  const cost = hopCost(u.sys, t);
  if (u.mp < cost) {
    if (u.owner === P) await notify('Not enough movement points this turn.');
    return;
  }
  const pa = u.owner === P;
  if (u.type === 'agent') {
    u.mp -= cost;
    u.sys = t;
    u.post = null;
    if (pa) await arrive(u, t);
    return;
  }
  let hostileTarget = t.owner !== u.owner && (t.owner < 0 || atWar(u.owner, t.owner)),
    declare = false;
  if (pa && P === 1 && t.owner >= 0 && t.owner !== P && !hostileTarget && !nmCanWar(t.owner)) {
    const c = await ask(`<h3>${t.name}</h3>${F[t.owner].name} is at peace with you.<br><small>🧭 Your oath to the Watch forbids war on the houses — only pirates, barbarians and the Dark.</small>`, ['Pass Peacefully', 'Cancel']);
    if (c !== 'Pass Peacefully') return;
  } else if (pa && t.owner >= 0 && t.owner !== P && !hostileTarget) {
    const c = await ask(`<h3>${t.name}</h3>${F[t.owner].name} is at peace with you.`, ['Pass Peacefully', 'Declare War & Blockade', 'Cancel']);
    if (c === 'Cancel' || c == null) return;
    if (c !== 'Pass Peacefully') {
      declare = true;
      hostileTarget = true;
    }
  }
  // Last chance to withdraw before any shot is fired (and before war is declared)
  const foes = units.filter(x => x.type === 'fleet' && x.sys === t && x.owner !== u.owner && (atWar(x.owner, u.owner) || declare && x.owner === t.owner));
  if (pa && (foes.length || hostileTarget && t.owner !== P)) {
    if (!(await preBattle(u, t, foes, declare))) {
      u.path = [];
      refresh();
      return;
    }
  }
  if (declare) declareWar(P, t.owner);
  u.mp -= cost;
  const pi = pa || t.owner === P;
  // ONE orbital battle: the station, the picket ships and every hostile fleet in orbit fight together.
  const efs = units.filter(x => x.type === 'fleet' && x.sys === t && x.owner !== u.owner && atWar(x.owner, u.owner) && ships(x) > 0);
  const gar = hostileTarget && ((t.stn || 0) > 0 || t.fleet + roCount(t, 'space') > 0) ? {
    owner: t.owner,
    fleet: t.fleet,
    stn: t.stn || 0,
    b: t.b,
    ro: {
      ...(t.ro || {})
    },
    _gar: true
  } : null;
  if (efs.length || gar) {
    efs.sort((a, b) => !!b.general - !!a.general || spacePow(b) - spacePow(a));
    const main = efs[0] || gar,
      rest = [...efs.slice(1), ...(gar && main !== gar ? [gar] : [])];
    const rA = reinforcers(u, t, 'space');
    const rD = [...rest, ...units.filter(x => x.type === 'fleet' && !efs.includes(x) && x.sys !== t && t.links.includes(x.sys) && x.general && !x.path?.length && ships(x) > 0 && efs.concat(gar ? [gar] : []).some(e => e.owner === x.owner))];
    const dPow = (main === gar ? stnPow(t) + spacePow(t) * 1.1 : spacePow(main) * 1.05) + rest.reduce((a, x) => a + (x === gar ? stnPow(t) + spacePow(t) * 1.1 : spacePow(x) * (x.sys === t ? 1.05 : 0.75)), 0);
    const aPow = spacePow(u) + rPow(rA, t, 'space');
    const parts = [gar?.stn ? `Orbital Station Lv${gar.stn}` : '', gar && gar.fleet + roCount(gar, 'space') > 0 ? `${gar.fleet + roCount(gar, 'space')} picket ships` : '', ...efs.map(x => `${x.general ? 'General ' + x.general.name : x.captain?.name || 'a fleet'} (${ships(x)} ships)`)].filter(Boolean);
    const ctx = {
      kind: 'space',
      A: u,
      D: main,
      station: main === gar && !!gar.stn,
      at: t,
      rA,
      rD
    };
    ctx.rNote = `<div class="bt-scout">🛰 Defending ${t.name}: ${parts.join(' · ') || 'none'}</div>` + (rA.length ? `<div class="bt-scout">➕ Reinforcing you: ${rA.map(rName).join(', ')}</div>` : '') + (rD.filter(x => !x._gar && x.sys !== t).length ? `<div class="bt-scout" style="border-color:#a04040">➕ Enemy reinforcements: ${rD.filter(x => !x._gar && x.sys !== t).map(rName).join(', ')}</div>` : '');
    const r = await fight(aPow, dPow, pi || efs.some(x => x.owner === P), pa, `BATTLE OF ${t.name.toUpperCase()} (orbit)`, ctx);
    shrink(u, r.a);
    // Losses fall on every defender: fleets, pickets and the station
    efs.forEach(x => shrink(x, r.d));
    if (gar) {
      t.fleet = Math.floor(t.fleet * r.d);
      roScale(t, 'space', r.d);
    }
    battleXP(u.general, r.win);
    efs.forEach(x => battleXP(x.general, !r.win));
    const side = x => `${x.general ? cl(x.general) + ' of ' : x.captain ? x.captain.name + ' of ' : 'a fleet of '}${F[x.owner]?.name || 'raiders'}`;
    log(`⚔ Battle of ${t.name}: ${r.win ? side(u) + ' breaks the defence of ' + t.name : (efs[0] ? side(efs[0]) : 'the defenders of ' + t.name) + ' repel ' + side(u)}${parts.length ? ` (${parts.join(', ')})` : ''}.`);
    const cw = r.win ? u : efs[0];
    if (cw && !cw.general && cw.captain && Math.random() < 0.35) {
      cw.captain.skill = Math.min(6, cw.captain.skill + 1);
      if (cw.owner === P) log(`🎖 ${cw.captain.name} earns renown at ${t.name} — consider promoting them to General.`);
    }
    if (!r.win) {
      if (gar?.stn) t.stn = Math.max(1, Math.round(t.stn * Math.max(r.d, 0.34)));
      efs.forEach(x => {
        if (x.general) hist(x.general, `wins the battle of ${t.name}.`);
        if (ships(x) <= 0) removeUnit(x);
      });
      if (u.general) hist(u.general, `is defeated at the battle of ${t.name}${efs[0] ? ' by ' + (efs[0].general?.name || F[efs[0].owner]?.name) : ''}.`);
      if (Math.random() < 0.5 || ships(u) <= 0) await loseGen(u, (efs[0] || gar).owner);
      if (ships(u) <= 0) wreck(u);
      refresh();
      return;
    }
    if (gar?.stn) {
      log(`🛰 The orbital station over ${t.name} is destroyed.`);
      t.stn = 0;
    }
    if (gar) {
      t.fleet = 0;
      roScale(t, 'space', 0);
    }
    if (u.general) {
      hist(u.general, `wins the battle of ${t.name}.`);
      if (Math.random() < 0.3) gain(u.general, 'skill');
    }
    for (const ef of efs) {
      if (!units.includes(ef)) continue;
      if (ef.general && !ef.general.dead) hist(ef.general, `is defeated at the battle of ${t.name} by ${u.general?.name || F[u.owner]?.name}.`);
      await loseGen(ef, u.owner);
      removeUnit(ef);
    }
  }
  if (ships(u) <= 0) {
    removeUnit(u);
    return;
  }
  u.sys = t;
  if (pa) await arrive(u, t);
  if (hostileTarget) {
    if (t.legions + t.elite + roCount(t, 'land') === 0) await capture(u, t);else {
      t.siege = {
        by: u.owner,
        turns: 0,
        y: S.year
      };
      log(`⛓ Siege of ${t.name}: ${F[u.owner].name}${u.general ? ' under ' + cl(u.general) : ''} blockades ${t.owner >= 0 ? F[t.owner].name + "'s world" : 'the independent world'}.`);
      if (u.general) u.general.hist.push(`Y${S.year}: lays siege to ${t.name}.`);
    }
  }
  refresh();
}
async function assault(u) {
  const t = u.sys,
    pa = u.owner === P;
  // Troops on any of your fleets in this orbit (or a general's fleet one jump away) can land under this commander
  const help = reinforcers(u, t, 'land');
  if (landCount(u) + help.reduce((s, x) => s + landCount(x), 0) === 0) {
    if (pa) await notify('No troops aboard to land — and none on your other fleets here or a jump away. Embark troops at one of your systems first.');
    return;
  }
  const holy = inRecl(u.owner, t) ? 1.3 : 1;
  const siegeK = 1 - Math.min(0.5, (t.siege?.turns || 0) * 0.1);
  const def = (landPow(t) * 1.25 + 10 * bLv(t, 'Barracks')) * siegeK * (has(u.general, 'Siege Engineer') ? 0.8 : 1);
  if (pa) {
    const mine = (landPow(u) + rPow(help, t, 'land')) * holy,
      pc = Math.round(mine / Math.max(1, mine + def) * 100);
    const r = await ask(`<h3>Assault ${t.name}?</h3><div>- Your troops: ${u.legions + help.reduce((s, x) => s + x.legions, 0)} legions, ${u.elite + help.reduce((s, x) => s + x.elite, 0)} elite${help.length ? ` <small>(with ${help.map(rName).join(', ')})</small>` : ''}</div><div>- Defenders: ${t.legions} legions, ${t.elite} elite${t.general ? `, led by ${t.general.name}` : ''}</div>${t.siege ? `<div>- Siege has weakened them for ${t.siege.turns} turn(s)</div>` : ''}<div style="margin:8px 0;height:10px;background:#a03030;border-radius:5px;overflow:hidden"><div style="width:${pc}%;height:100%;background:#40c060"></div></div><small>Strength ${Math.round(mine)} vs ${Math.round(def)}${pc < 45 ? ' — consider waiting out the siege.' : ''}</small>`, ['Assault', 'Withdraw']);
    if (r !== 'Assault') return;
  }
  const gctx = {
    kind: 'land',
    A: u,
    D: t,
    holy,
    siegeK,
    at: t
  };
  const r = await fight(landPow(u) * holy, def, pa || t.owner === P, pa, `GROUND ASSAULT on ${t.name}`, gctx);
  u.legions = Math.floor(u.legions * r.a);
  u.elite = Math.floor(u.elite * r.a);
  roScale(u, 'land', r.a);
  // Victorious reinforcements in orbit land with the main force
  if (r.win) (gctx.rA || []).filter(x => x.sys === t && units.includes(x)).forEach(x => {
    u.legions += x.legions;
    u.elite += x.elite;
    x.legions = 0;
    x.elite = 0;
    roMove(x, u, 'land');
    if (ships(x) <= 0) removeUnit(x);
  });
  t.legions = Math.floor(t.legions * r.d);
  t.elite = Math.floor(t.elite * r.d);
  roScale(t, 'land', r.d);
  u.mp = 0;
  battleXP(u.general, r.win);
  battleXP(t.general, !r.win);
  if (r.win) {
    log(`⚔ ${t.name} is stormed by ${F[u.owner].name}${u.general ? ' under ' + cl(u.general) : ''}${t.siege ? ` after a ${t.siege.turns}-turn siege` : ''}.`);
    if (t.general) t.general.hist.push(`Y${S.year}: loses ${t.name} to ${u.general?.name || F[u.owner]?.name}.`);
    await capture(u, t);
  } else {
    log(`⚔ Assault on ${t.name} repelled — ${t.owner >= 0 ? F[t.owner].name : 'the defenders'} hold${t.general ? ' under ' + cl(t.general) : ''}.`);
    if (t.general) t.general.hist.push(`Y${S.year}: repels an assault on ${t.name}.`);
    if (u.general) u.general.hist.push(`Y${S.year}: is repelled assaulting ${t.name}.`);
  }
  refresh();
}
async function capture(u, t) {
  const lord0 = t.general,
    prev0 = t.owner,
    wasCap = prev0 >= 0 && F[prev0]?.capital === t;
  const royal0 = !!lord0 && prev0 >= 0 && (F[prev0]?.ruler === lord0 || royalKin(F[prev0]).includes(lord0));
  await loseGen(t, u.owner);
  const prev = t.owner;
  Object.assign(t, {
    owner: u.owner,
    fleet: 0,
    legions: Math.max(1, u.legions),
    elite: u.elite,
    order: 3,
    recent: 3,
    siege: null,
    stn: 0
  });
  damageBuildings(t, 1);
  for (const k of Object.keys(t.ro || {})) if (UNITS[k]?.k === 'land') delete t.ro[k];
  roMove(u, t, 'land');
  u.legions = 0;
  u.elite = 0;
  if (u.general) {
    hist(u.general, `conquers ${t.name}.`);
    gain(u.general, 'skill');
  }
  if (inRecl(u.owner, t)) reclWon(t, u.owner, u.general);
  // Faction doctrines on conquest
  const cm = F[u.owner]?.mods || {};
  if (cm.liberator && prev >= 0 && F[prev]?.mods?.slaver) {
    t.legions += 2;
    t.order = 5;
    log(`⛓ ${F[u.owner].name} break the chains of ${t.name} — freed slaves take up arms.`);
    if (u.general) u.general.respect++;
    apoc(-1, 'liberation');
  }
  if (cm.might && prev >= 0) {
    const loot = 60 + Math.round(t.income * 0.5);
    F[u.owner].gold += loot;
    if (u.owner === P) log(`⚔ Might makes right: ${loot} credits seized at ${t.name}.`);
  }
  await settle(t, u, prev, u.owner === P);
  // A fallen capital moves to the richest remaining world
  if (prev >= 0 && F[prev].capital === t) {
    const nc = systems.filter(s => s.owner === prev).sort((a, b) => b.income - a.income)[0] || null;
    F[prev].capital = nc;
    if (nc) log(`🏛 ${F[prev].name} moves its capital to ${nc.name}.`);
  }
  if (!F[u.owner].capital || F[u.owner].capital.owner !== u.owner) F[u.owner].capital = t;
  try {
    await spoilsOfCourt(t, u.owner, prev, lord0, royal0, wasCap);
  } catch (e) {
    console.warn('spoilsOfCourt', e);
  }
  checkDead(prev);
  refresh();
}
// Plain-language summary of what a unit can still do this turn
function actStatus(u) {
  const who = u.type === 'fleet' ? u.general ? u.general.name : 'This fleet' : u.char.name;
  if (u.path?.length && u.mp <= 0) return `🧭 ${who} is travelling and will continue next turn.`;
  if (u.type === 'agent') {
    if (u.acted) return `⏳ ${who} has acted this turn — no more actions until next turn.`;
    if (u.mp <= 0) return `⏳ ${who} has no movement left, but can still act here.`;
    return `✅ ${who} is ready: ${u.mp}/${u.max} moves and one action.`;
  }
  if (u.mp <= 0) return `⏳ ${who} has no movement left this turn. Troops, generals and governors can still be swapped while in orbit of your world.`;
  return `✅ ${who} is ready: ${u.mp}/${u.max} moves left.`;
}
function unitCard(u) {
  const el = $('info'),
    t = u.sys,
    own = u.owner === P;
  el.innerHTML = `<h3>${uIcon(u)} ${uName(u)}</h3>${F[u.owner]?.name || 'Rogue heretic'} · at ${t.name} · Moves ${u.mp}/${u.max}${u.acted ? ' · has acted' : ''}<br>` + (u.type === 'fleet' ? `🚀 Ships ${u.fleet} · 🛡 Legions ${u.legions} · ⭐ Elite ${u.elite} (carries ${ships(u) * CARRY})${u.ro && Object.keys(u.ro).length ? `<br><small>${roStr(u)}</small>` : ''}<br>${u.general ? `<div class="ccard">${card(u.general, 'General')}<small>Commands from the capital ship<br>${charStr(u.general)}</small></div>` : '<i>No general aboard — the fleet fights leaderless</i>'}${t.siege?.by === u.owner && t.owner !== u.owner ? `<br>⛓ Blockading for ${t.siege.turns} turns (surrenders at 6)` : ''}` : `<div class="ccard">${card(u.char, rn(u.role))}<small>${u.role === 'Priest' && !u.char.council ? `A hooded servant of the faith. Piety ${u.char.piety} · Skill ${u.char.skill}` : charStr(u.char)}${u.char.anc?.length ? '<br>🎒 ' + u.char.anc.join(', ') : ''}</small></div>`) + '';
  if (S.god) btn('🛠 Edit Unit', () => godUnit(u));
  if (!own) return;
  el.insertAdjacentHTML('beforeend', `<div class="${u.mp > 0 && !u.acted ? 'okact' : 'noact'}">${actStatus(u)}</div>`);
  if (u.path?.length) {
    const turns = Math.ceil(u.path.reduce((t, s, i) => t + hopCost(i ? u.path[i - 1] : u.sys, s), 0) / Math.max(1, u.max));
    el.insertAdjacentHTML('beforeend', `<small>🧭 En route to <b>${u.path[u.path.length - 1].name}</b> · ~${turns} turn(s)</small><br>`);
    btn('✋ Halt journey', () => {
      u.path = [];
    });
  }
  if (u.mp > 0) el.insertAdjacentHTML('beforeend', `<small>${matchMedia('(pointer:fine)').matches ? 'Right-click' : 'Tap'} a linked system to move, or any charted system to set a course.</small><br>`);
  if (u.type === 'fleet') fleetButtons(u);else agentButtons(u);
  btn('✖ Deselect', () => {
    selU = null;
  });
}
function fleetButtons(u) {
  const t = u.sys;
  if (t.owner === P) {
    const room = ships(u) * CARRY - u.legions - u.elite - roCount(u, 'land');
    if (room > 0 && t.legions + t.elite + roCount(t, 'land') > 1 && t.quar && t.plague) btn('🚧 Embark troops (quarantined)', () => notify(`🚧 ${t.name} is under quarantine: no troops may leave the surface while the Grey Rot lasts.`));else if (room > 0 && t.legions + t.elite + roCount(t, 'land') > 1) btn(`Embark troops${t.plague ? ' ☠' : ''}`, () => {
      if (t.plague && u.general && plagueDeath(u.general, 0.6)) {
        const g = u.general;
        u.general = null;
        log(`☠ ${cl(g)} catches the Grey Rot from the troops he took aboard at ${t.name}, and dies.`);
        toast(`☠ ${g.name} died of the Grey Rot`, false);
        if (F[P].ruler === g) succession(P, 'was taken by the Grey Rot');
      }
      let rm = room;
      roMove(t, u, 'land', rm);
      rm = ships(u) * CARRY - u.legions - u.elite - roCount(u, 'land');
      const e = Math.min(t.elite, rm);
      t.elite -= e;
      u.elite += e;
      const l = Math.min(t.legions - 1, rm - e);
      if (l > 0) {
        t.legions -= l;
        u.legions += l;
      }
    });
    if (u.legions + u.elite + roCount(u, 'land')) btn('Disembark troops', () => {
      t.legions += u.legions;
      t.elite += u.elite;
      u.legions = 0;
      u.elite = 0;
      roMove(u, t, 'land');
    });
    if (t.ro && roCount(t, 'space')) btn('Muster local warships into fleet', () => roMove(t, u, 'space'));
    if (u.general && !t.general) btn('General lands to govern', () => {
      t.general = u.general;
      u.general = null;
      hist(t.general, `takes up the administration of ${t.name}.`);
    });
    if (u.general) btn('General lands in reserve', () => {
      const g = u.general;
      u.general = null;
      station(t, g);
      log(`🎖 ${cl(g)} lands in reserve at ${t.name}.`);
    });
  }
  if (u.general) btn(`⚜ Swap General…`, () => assignGeneral(u));else btn('⚜ Assign General…', () => assignGeneral(u));
  // Merge works in any orbit; a general always takes command over a captain.
  const others = units.filter(x => x !== u && x.type === 'fleet' && x.owner === P && x.sys === t);
  if (others.length) btn('Merge fleets', async () => {
    let other = others[0];
    if (others.length > 1) {
      const lbl = x => `${x.general ? '⚜ ' + x.general.name : '⭐ ' + (x.captain?.name || 'Captain')} (${ships(x)} ships)`;
      const r = await ask('<h3>Merge which fleet into this one?</h3>', [...others.map(lbl), 'Cancel']);
      other = others.find(x => lbl(x) === r);
      if (!other) return;
    }
    if (u.general && other.general) {
      if (t.owner !== P) {
        await notify('Both fleets have a general. Land one at a world you own, or swap him out, before merging here.');
        return;
      }
      if (!t.general) {
        t.general = other.general;
        hist(t.general, `takes up the administration of ${t.name}.`);
      } else {
        station(t, other.general);
        log(`🎖 ${cl(other.general)} lands in reserve at ${t.name}.`);
      }
      other.general = null;
    }
    if (!u.general && other.general) {
      u.general = other.general;
      other.general = null;
    }
    if (!u.general && !u.captain && other.captain) u.captain = other.captain;
    u.fleet += other.fleet;
    u.legions += other.legions;
    u.elite += other.elite;
    roMove(other, u, 'space');
    roMove(other, u, 'land');
    u.mp = Math.min(u.mp, other.mp);
    removeUnit(other);
  });
  if (t.owner === P) {
    if (ships(u) >= 2) btn('Split fleet', () => {
      // Half the line ships and half of each warship type form a new fleet
      const h = Math.floor(u.fleet / 2),
        ro = {};
      for (const [k, n] of Object.entries(u.ro || {})) if (UNITS[k]?.k === 'space' && n >= 2) {
        ro[k] = Math.floor(n / 2);
        roAdd(u, k, -ro[k]);
      }
      if (!h && !Object.keys(ro).length) return notify('Not enough ships to split.');
      u.fleet -= h;
      addUnit({
        type: 'fleet',
        owner: P,
        sys: t,
        fleet: h,
        mp: u.mp,
        ro
      });
    });
  }
  if (u.general?.rot && t.owner >= 0 && t.owner !== P && !t.plague) btn(`☣ Sow the Grey Rot on ${t.name} (${pct(rotOdds(t))}%)${u.mp > 0 ? '' : ' (no moves left)'}`, async () => {
    if (!(u.mp > 0)) return notify('This fleet has no movement left this turn.');
    const ok = await ask(`<h3>☣ Sow the Grey Rot</h3>${portrait(u.general, 60)}<b>${u.general.name}</b> still carries the lung rot. Landed among the people of <b>${t.name}</b> (${F[t.owner].name}), he could set it loose.<br><br>Chance it takes: <b>${pct(rotOdds(t))}%</b>. Your crew will sicken too (−15% troops).<br><small>Half the time the source is discovered: deep grudges, lost standing, dread for your ruler. Either way it is a dark deed on your ruler's soul.</small>`, ['☣ Do it', 'Close']);
    if (!ok?.startsWith('☣')) return;
    await seedRot(u, t);
    refresh();
    showInfo();
  });
  const orbFoes = units.filter(x => x.type === 'fleet' && x.sys === t && x.owner !== P && ships(x) > 0 && atWar(x.owner, P));
  if (orbFoes.length && ships(u) > 0) btn(`⚔ Engage enemy fleet in orbit${u.mp > 0 ? '' : ' (no moves left)'}`, async () => {
    if (!(u.mp > 0)) return notify('This fleet has no movement left this turn.');
    const from = t.links[0];
    if (!from) return;
    u.sys = from;
    u.mp = Math.max(u.mp, hopCost(from, t));
    u.path = [];
    try {
      await moveUnit(u, t);
    } catch (e) {
      console.error(e);
    }
    if (units.includes(u)) {
      if (u.sys === from) u.sys = t;
      u.mp = 0;
    }
    refresh();
    showInfo();
  });
  if (t.siege?.by === P && t.owner !== P) btn('⚔ Assault planet', () => assault(u));
  if (t.ruin && u.general && (t.owner === P || t.siege?.by === P || t.owner < 0)) btn('🏚 Explore ruins', () => explore(t, u.general));
}
// Put a commander aboard a fleet: the local governor, an heir/initiate from court, a general from a fleet in the same orbit, or a newly promoted captain.
async function assignGeneral(u) {
  const t = u.sys,
    own = t.owner === P,
    opts = [];
  if (own && t.general) opts.push([`🏛 Governor ${t.general.name}`, t.general, () => {
    t.general = null;
  }]);
  if (own) staffOf(t).map(id => CH[id]).forEach(c => opts.push([`🎖 ${c.name} (reserve)`, c, () => unstation(c)]));
  units.filter(x => x !== u && x.type === 'fleet' && x.owner === P && x.sys === t && x.general).forEach(x => opts.push([`🚀 ${x.general.name} (other fleet)`, x.general, () => {
    x.general = null;
  }]));
  if (own) F[P].heirs.filter(h => h.age >= 16 && !h.dead).forEach(h => opts.push([`${celibate(P) ? '✠ Initiate' : '👑 Heir'} ${h.name} (${h.age})`, h, () => {
    F[P].heirs.splice(F[P].heirs.indexOf(h), 1);
  }]));
  const cost = 150;
  const lbl = o => o[0] + ` · ⚔${o[1].skill}`;
  const r = await ask(`<h3>⚜ ${u.general ? 'Swap' : 'Assign'} General</h3><small>${u.general ? `Current: ${cl(u.general)}. They will step down to govern ${t.name} if it is yours and has no governor, otherwise move to another fleet here or retire to court.<br>` : ''}Generals add their Command to battles and can explore ruins.${own ? '' : '<br>Your fleet is away from home: only generals from fleets in this orbit can come aboard, or a captain can be promoted from the crew.'}</small><div class="frow">${opts.map(o => card(o[1])).join('')}</div>`, [...opts.map(lbl), `⭐ Promote ${u.captain ? u.captain.name : 'a captain'} (${cost})`, 'Cancel']);
  let g = null;
  if (r?.startsWith('⭐')) {
    if (!pay(cost)) return;
    g = mkChar(P, ri(24, 40));
    if (u.captain) {
      g.name = stripRank(u.captain.name);
      g.cult = u.captain.cult || g.cult;
      g.skill = clamp(u.captain.skill + 1, 1, 10);
    }
    hist(g, `is promoted from ${u.captain ? 'captain' : 'the crew'} to General, commanding a fleet at ${t.name}.`);
    u.captain = mkCapt(u.owner); // a new captain takes the bridge
  } else {
    const o = opts.find(x => lbl(x) === r);
    if (!o) return;
    o[2]();
    g = o[1];
  }
  const old = u.general;
  u.general = g;
  if (g !== old && !r.startsWith('⭐')) hist(g, `takes command of a fleet at ${t.name}.`);
  if (g) g.gen = true;
  if (old) {
    if (own && !t.general) t.general = old;else if (own) station(t, old);else {
      const f2 = units.find(x => x !== u && x.type === 'fleet' && x.owner === P && x.sys === t && !x.general);
      if (f2) f2.general = old;else F[P].heirs.push(old);
    }
  }
}
function agentButtons(u) {
  const t = u.sys,
    c = u.char,
    fo = t.owner;
  if (u.acted) {
    $('info').insertAdjacentHTML('beforeend', `<div class="noact">⏳ ${c.name} has already acted this turn. New orders are possible next turn${u.mp > 0 ? ', though they can still move' : ''}.</div>`);
    return;
  }
  // Every agent action reports its outcome. Failed spies, assassins and preachers may not come back (M2TW-style).
  const RISK = {
    Spy: 0.2,
    Assassin: 0,
    Priest: 0.1,
    Master: 0.08,
    Zithari: 0.15,
    Acolyte: 0.15,
    Witch: 0.12
  };
  const done = (ok, msg) => {
    u.acted = true;
    u.mp = 0;
    if (ok && Math.random() < 0.5) {
      if (u.role === 'Princess') {
        gain(c, 'dip');
        if (Math.random() < 0.3 + (c.dip || 0) * 0.05) gain(c, 'charm');
      } else gain(c, 'skill');
    }
    agentXP(c, u.role, ok);
    hist(c, msg);
    if (['Diplomat', 'Princess', 'Trader'].includes(u.role)) WA(u.role === 'Trader' ? 'trade' : 'dip', {
      a: c.id,
      f: P,
      to: fo >= 0 && fo !== P ? fo : null,
      s: t.i,
      ok,
      txt: msg.replace(/<[^>]+>/g, '')
    });
    let died = '';
    const risk = (RISK[u.role] || 0) * (fo >= 0 && fo !== P ? 1.3 : 0.6) * (t.rel !== F[P]?.rel && ['Priest', 'Master', 'Zithari', 'Acolyte'].includes(u.role) ? 1.4 : 1) - (c.skill || 0) * 0.01;
    if (!ok && Math.random() < risk) {
      c.dead = true;
      removeUnit(u);
      const how = u.role === 'Spy' ? `is unmasked and executed at ${t.name}.` : u.role === 'Witch' ? `is burned as a witch at ${t.name}.` : `is torn apart by an angry mob at ${t.name}.`;
      hist(c, how);
      died = `<br><b style="color:#f66">☠ ${c.name} ${how}</b>`;
    }
    const plain = msg.replace(/<[^>]+>/g, '');
    toast(`${ok ? '✅ Success' : '❌ Failed'} — ${c.name.split(' ')[0]} ${plain}${died}`, ok);
    if (!ok) try {
      playSfx('deny');
    } catch (e) {}
  };
  if (u.role === 'Diplomat') {
    if (fo >= 0 && fo !== P) diploButtons(t, c);else $('info').insertAdjacentHTML('beforeend', '<small>Move to a foreign system to negotiate or bribe. Visit the Bloodbank to look into a loan.</small>');
  }
  const heretics = units.filter(x => x.sys === t && x !== u && ['Acolyte', 'Witch'].includes(x.role) && x.owner !== P);
  if (u.role === 'Trader') {
    if (u.post === t.i) $('info').insertAdjacentHTML('beforeend', `<small>💰 Trading here: +${tradeVal(u)} credits per turn.</small><br>`);else if (fo === P || fo >= 0 && !atWar(P, fo)) btn(`💰 Set up trade post (+${tradeVal({
      ...u,
      post: t.i
    })}/turn)`, () => {
      u.post = t.i;
      done(true, `sets up a trade post at ${t.name}.`);
    });
    units.filter(x => x.sys === t && x.role === 'Trader' && x.owner !== P).forEach(r => btn(`Buy out ${F[r.owner]?.name} trader (${Math.round(clamp(0.4 + (c.skill - r.char.skill) * 0.08, 0.1, 0.9) * 100)}%)`, () => {
      const ok = Math.random() < clamp(0.4 + (c.skill - r.char.skill) * 0.08, 0.1, 0.9);
      if (ok) {
        hist(r.char, `is bought out by ${c.name} at ${t.name}.`);
        removeUnit(r);
      } else if (Math.random() < 0.3) {
        hist(c, `is ruined by a rival at ${t.name}.`);
        removeUnit(u);
        return;
      }
      done(ok, ok ? `buys out a rival trader at ${t.name}.` : `fails to buy out a rival at ${t.name}.`);
    }));
  }
  if (u.role === 'Priest' || u.role === 'Master') heretics.forEach(h => btn(`🔥 Denounce ${rn(h.role)} · ${pct(clamp(0.3 + c.piety * 0.05 + (u.role === 'Master' ? 0.2 : 0) - (h.char.skill || 0) * 0.02, 0.1, 0.95))}%`, () => {
    const ok = Math.random() < clamp(0.3 + c.piety * 0.05 + (u.role === 'Master' ? 0.2 : 0) - (h.char.skill || 0) * 0.02, 0.1, 0.95);
    if (ok) {
      h.char.dead = true;
      hist(h.char, `is denounced and driven out of ${t.name}.`);
      removeUnit(h);
      st(P, 1, 'rooting out heresy');
    }
    done(ok, ok ? `denounces a ${rn(h.role)} at ${t.name}.` : `fails to expose a ${rn(h.role)} at ${t.name}.`);
  }));
  if (u.role === 'Master') {
    const vic = [fo !== P ? t.general : null, ...units.filter(x => x.sys === t && x.owner !== P && x.owner >= 0).map(x => x.general || x.char)].filter(g => g && !g.dead && F[g.f]?.ruler !== g);
    vic.forEach(g => btn(`⚜ Try ${g.name} for heresy (piety ${g.piety})`, async () => {
      const ok = await trial(c, g, t);
      done(ok, ok ? `burns ${g.name} as a heretic.` : `finds ${g.name} faithful.`);
      if (ok) apoc(1, 'heresy trial');
    }));
  }
  if (u.role === 'Zithari') {
    const zp = clamp(0.3 + c.skill * 0.05 - (t.rel === 'Order' && t.b.has('Temple') ? 0.15 : 0), 0.05, 0.9);
    if (t.rel !== 'Zithari') btn(`☯ Convert to Zithari · ${pct(zp)}%`, () => {
      const ok = Math.random() < zp;
      if (ok) {
        t.rel = 'Zithari';
        st(P, -1, 'Zithari conversion');
      }
      done(ok, ok ? `turns ${t.name} to the Zithari.` : `is driven off ${t.name}.`);
    });
    const dsp = clamp(0.4 + c.skill * 0.05 - (t.general?.piety || 0) * 0.02, 0.05, 0.9);
    if (fo !== P && fo >= 0) btn(`Dark sermon (−3 order) · ${pct(dsp)}%`, () => {
      const ok = Math.random() < dsp;
      if (ok) {
        t.order = Math.max(0, t.order - 3);
        apoc(1);
      }
      done(ok, ok ? `preaches the dark side on ${t.name}.` : `fails to stir ${t.name}.`);
    });
    const crp = t.general ? clamp(0.3 + c.skill * 0.05 - t.general.piety * 0.03 + (t.general.loyalty < 5 ? 0.1 : 0) - (has(t.general, 'Pious') ? 0.15 : 0), 0.05, 0.9) : 0;
    if (!S.recl) zithTargets(u).forEach(h => {
      const o = zithCallOdds(u);
      btn(`🌑 Proclaim Dark Reclamation of ${h.name} · ${pct(o.p)}%`, async () => {
        if (!(await confirmOdds(`🌑 Dark Reclamation of ${h.name}`, o))) return;
        const ok = await zithCall(u, h);
        done(ok, ok ? `proclaims a Dark Reclamation of ${h.name}.` : `fails to rouse the Dark against ${h.name}.`);
      });
    });
    if (fo !== P && t.general) btn(`Corrupt ${t.general.name} · ${pct(crp)}%`, () => {
      const g = t.general,
        ok = Math.random() < crp;
      if (ok) {
        g.loyalty = Math.max(0, g.loyalty - 2);
        addTrait(g, 'Godless');
      }
      done(ok, ok ? `whispers to ${g.name} of power.` : `is rebuffed by ${g.name}.`);
    });
  }
  if (u.role === 'Witch') {
    const tg = [fo !== P ? t.general : null, ...units.filter(x => x.sys === t && x.owner !== P && x.type === 'fleet').map(x => x.general)].filter(Boolean);
    tg.forEach(g => {
      const cp = clamp(0.35 + (F[P].mods?.coven ? 0.2 : 0) + c.skill * 0.05 - (has(g, 'Blessed') ? 0.2 : 0) - (g.piety || 0) * 0.02, 0.05, 0.9);
      btn(`🔮 Curse ${g.name} · ${pct(cp)}%`, () => {
        const ok = Math.random() < cp;
        if (ok) addTrait(g, 'Cursed');
        done(ok, ok ? `curses ${g.name}.` : `fails to curse ${g.name}.`);
      });
    });
    const hxp = clamp(0.45 + c.skill * 0.05, 0.05, 0.9);
    if (fo !== P && fo >= 0) btn(`Hex the world (−2 order) · ${pct(hxp)}%`, () => {
      const ok = Math.random() < hxp;
      if (ok) t.order = Math.max(0, t.order - 2);
      done(ok, ok ? `hexes ${t.name}.` : `is chased off ${t.name}.`);
    });
    if (fo === P && t.general) btn(`Bless ${t.general.name}`, () => {
      addTrait(t.general, 'Blessed');
      done(true, `blesses ${t.general.name}.`);
    });
  }
  if (u.role === 'Princess') {
    const home = () => {
      removeUnit(u);
      c.stayHome = true;
      F[P].princesses.push(c);
    };
    const cands = [t.general, ...units.filter(x => x.sys === t && x.type === 'fleet').map(x => x.general)].filter((g, i, a) => g && a.indexOf(g) === i && mayWed(g) && !g.fem && g.spouse == null && !g.betrothed && g.age >= 14 && !kin(g, c) && F[g.f]?.ruler !== c.father && !(g.f === P && F[P].ruler === g) && !hostile(F[g.f]));
    if (c.age < 14) $('info').insertAdjacentHTML('beforeend', '<small>She is too young for any match.</small><br>');else if (!cands.length) $('info').insertAdjacentHTML('beforeend', '<small>No unmarried general here. Find a governor or a fleet with a general aboard.</small><br>');
    cands.forEach(g => {
      const own = g.f === P,
        chance = own ? 1 : clamp(0.3 + ((c.charm ?? c.skill) + (c.dip || 0) * 0.5) * 0.04 + (g.loyalty < 6 ? 0.2 : 0) + (c.purity > 6 ? 0.05 : 0), 0, 0.9);
      if (c.age < 16) btn(`💍 Betroth to ${g.name}${own ? '' : ` (${Math.round(chance * 100)}%)`}`, async () => {
        if (Math.random() < chance) {
          c.betrothed = g.id;
          g.betrothed = c.id;
          if (own) gain(g, 'loyalty');
          // A betrothal is a promise, not a marriage: goodwill now, the alliance (or pledge) only at the wedding
          if (!own) {
            grudge(g.f, P, 3, `the betrothal of ${c.name}`);
            grudge(P, g.f, 3);
            log(`💍 ${cl(c)} of ${F[P].name} is betrothed to ${cl(g)} of ${F[g.f]?.name} — the wedding will follow when she turns 16.`);
          }
          done(true, `is betrothed to ${cl(g)}; they will wed when she turns 16.`);
          home();
          await notify(`${portrait(c, 70)}${c.name} is betrothed to ${g.name}. She returns to court and will marry at 16.`);
        } else done(false, `is refused by ${g.name}.`);
      });else btn(`⚭ Marry ${g.name}${own ? '' : ` (${Math.round(chance * 100)}%)`}`, async () => {
        if (Math.random() < chance) {
          gain(c, 'dip');
          await marryPrincess(c, g);
        } else done(false, `is refused by ${g.name}.`);
      });
    });
    btn('🏰 Return to court', home);
  }
  if (u.role === 'Spy') {
    // Counterintelligence: guard a world (stay put) or escort a lord of your house wherever he goes
    const lords = [...new Set([t.general, ...units.filter(x => x.sys === t && x.owner === P && x.type !== 'agent').map(x => x.general), ...(t.owner === P ? staffOf(t).map(id => CH[id]) : []), whereIs(F[P].ruler) === t ? F[P].ruler : null].filter(g => g && !g.dead && g.f === P))];
    const ci = counterIntel(P, t, null);
    $('info').insertAdjacentHTML('beforeend', `<small>🛰 ${u.escort != null && CH[u.escort] ? `Guarding <b>${CH[u.escort].name}</b>: travels with him, makes bounty hunters likelier to fail and be caught.` : `Probe AIs on a world watch it: they protect your lords here, unmask enemy agents and blunt their schemes.${ci.n ? ` (${ci.n} watching, −${pct(ci.d)}% to bounty hunters)` : ''}`}</small><br>`);
    if (u.escort != null) btn('🛰 End escort duty', () => {
      u.escort = null;
      showInfo();
    });else lords.forEach(g => btn(`🛡 Escort ${g.name}`, () => {
      u.escort = g.id;
      hist(c, `is set to guard ${g.name}.`);
      toast(`🛰 ${c.name} now guards ${g.name}.`, true);
      showInfo();
    }));
  }
  if (u.role === 'Assassin') {
    // Bodyguard duty: a bounty hunter of your own shadows a lord, blunts killers and hunts hostile hunters near him
    const lords = [...new Set([t.general, ...units.filter(x => x.sys === t && x.owner === P && x.type !== 'agent').map(x => x.general), ...(t.owner === P ? staffOf(t).map(id => CH[id]) : []), whereIs(F[P].ruler) === t ? F[P].ruler : null].filter(g => g && !g.dead && g.f === P))];
    const hl = huntedLords(P).map(g => g.name);
    $('info').insertAdjacentHTML('beforeend', `<small>🗡 ${u.escort != null && CH[u.escort] ? `Bodyguard of <b>${CH[u.escort].name}</b>: travels with him, makes killers likelier to fail and be caught, and may slay hunters who come near.` : `A bounty hunter can serve as a bodyguard for a lord here.`}${hl.length ? ` <b>Known hunted:</b> ${hl.join(', ')}.` : ''}</small><br>`);
    if (u.escort != null) btn('🗡 End bodyguard duty', () => {
      u.escort = null;
      showInfo();
    });else lords.forEach(g => btn(`🛡 Guard ${g.name}`, () => {
      u.escort = g.id;
      delete u.hunt;
      hist(c, `is set to guard ${g.name}.`);
      toast(`🗡 ${c.name} now guards ${g.name}.`, true);
      showInfo();
    }));
  }
  if (u.role === 'Spy' && fo !== P) {
    const govAdm = (t.general?.admin || 0) * 0.03 + counterIntel(fo, t).d,
      sec = (t.stn || 0) * 0.04;
    const ip = clamp(0.4 + c.skill * 0.06 - govAdm - t.order * 0.01, 0.05, 0.9),
      sp = clamp(0.35 + c.skill * 0.06 - sec - govAdm, 0.05, 0.9),
      gp = clamp(0.35 + c.skill * 0.06 - (t.general?.skill || 0) * 0.03, 0.05, 0.9);
    btn(`Incite unrest · ${pct(ip)}%`, () => {
      const ok = Math.random() < ip;
      if (ok) {
        t.order = Math.max(0, t.order - 3);
        t.recent = 3;
        apoc(1);
      }
      done(ok, ok ? `incites riots on ${t.name}.` : `fails to stir ${t.name}.`);
    });
    if (t.b.size) btn(`Sabotage works · ${pct(sp)}%`, () => {
      const ok = Math.random() < sp;
      if (ok) t.b.delete(rnd([...t.b]));
      done(ok, ok ? `sabotages the works of ${t.name}.` : `is nearly caught at ${t.name}.`);
    });
    if (t.siege?.by === P) btn(`Open the gates · ${pct(gp)}%`, () => {
      const ok = Math.random() < gp;
      if (ok) t.legions = Math.floor(t.legions / 2);
      done(ok, ok ? `opens the gates of ${t.name}.` : `fails to open the gates of ${t.name}.`);
    });
  }
  if (u.role === 'Assassin') {
    const targets = [...new Set([fo !== P ? t.general : null, ...units.filter(x => x.sys === t && x.owner !== P).map(x => x.general || x.char), ...(fo !== P ? foreignCourt(t) : [])].filter(g => g && !g.dead))];
    targets.forEach(g => {
      const why = [`+30% base`, `+${Math.round(c.skill * 6)}% ${c.name}'s subterfuge ${c.skill}`];
      if (F[P].mods.spice) why.push('+15% spice-guild contacts');
      if (F[P].tech.includes('Cloaking')) why.push('+10% cloaking tech');
      if ((c.anc || []).includes('Slicer AI')) why.push('+5% slicer AI');
      const o = killOdds(0.3 + c.skill * 0.06 + (F[P].mods.spice ? 0.15 : 0) + (F[P].tech.includes('Cloaking') ? 0.1 : 0) + ((c.anc || []).includes('Slicer AI') ? 0.05 : 0), why, g, t);
      btn(`Assassinate ${g.name} · ${pct(o.p)}%`, async () => {
        if (!(await confirmOdds(`🗡 Assassinate ${g.name}`, o))) return;
        apoc(2, 'assassination');
        const ok = Math.random() < o.p;
        const kRec = {
          a: c.id,
          f: P,
          t: g.id,
          tf: g.f,
          s: t.i,
          ok,
          r: ok ? vRank(g) : ''
        };
        WA('kill', kRec);
        if (!ok) survivedAttempt(g, c.name);
        if (ok) {
          hist(g, `is assassinated by ${c.name}.`);
          if (setFate(g, 'dead')) await succession(g.f, 'was assassinated');
        } else if (Math.random() < Math.max(0.4, unmaskOdds(counterIntel(g.f, t, g)))) {
          kRec.died = true;
          c.dead = true;
          hist(c, `is caught and executed at ${t.name}.`);
          removeUnit(u);
          toast(`❌ Failed — ${c.name} fails to reach ${g.name}.<br><b style="color:#f66">☠ ${c.name} is caught and executed at ${t.name}.</b>`, false);
          return;
        }
        done(ok, ok ? `kills ${g.name}.` : `fails to reach ${g.name}.`);
      });
    });
  }
  if (u.role === 'Priest') {
    const cvp = clamp(0.35 + c.piety * 0.05 - (t.rel === 'Zithari' ? 0.1 : 0), 0.05, 0.9);
    if (t.rel !== 'Order') btn(`✝ Convert to the Order · ${pct(cvp)}%`, () => {
      const ok = Math.random() < cvp;
      if (ok) {
        t.rel = 'Order';
        if (Math.random() < 0.5) st(P, 1, 'a world converted');
      }
      done(ok, ok ? `converts ${t.name} to the Order.` : `is ignored on ${t.name}.`);
    });
    if (c.council) $('info').insertAdjacentHTML('beforeend', '<small>✠ Sits on the Council of 13 Masters.</small><br>');else $('info').insertAdjacentHTML('beforeend', `<small>Piety ${c.piety}/10. Pious monks (6+) may be raised to the Council of 13.</small><br>`);
    btn('Preach peace (☢ −1)', () => {
      apoc(-1, `${c.name} preaches peace`);
      done(true, `preaches peace on ${t.name}.`);
    });
    if (fo === P) btn('Calm the faithful (+2 order)', () => {
      t.order = Math.min(10, t.order + 2);
      done(true, `calms the faithful of ${t.name}.`);
    });
  }
}
// Holy-world actions: call (as the Nameless or the Cult) or petition a Reclamation
function reclButtons(s) {
  if (S.recl || !F[0]?.alive || !holyTargets('Order').includes(s)) return;
  if (P === 0) btn('✠ Call Reclamation', () => {
    startRecl(s, 'Order');
    if (S.recl && s.owner >= 0 && !atWar(P, s.owner)) declareWar(P, s.owner);
    refresh();
    showInfo();
  });else if (onSide(P, 'Order')) {
    const o = reclOdds(P, s.owner);
    btn(`✠ Petition the Nameless (150) · ${pct(o.p)}%`, async () => {
      if (!(await confirmOdds(`✠ Reclamation of ${s.name}`, {
        p: o.p,
        why: o.why ? o.why.split(' · ') : []
      }))) return;
      if (F[P].gold < 150) return notify('You cannot afford the offering.');
      const ok = await requestRecl(P, s, false);
      await notify(ok ? `The Reclamation of ${s.name} is called!` : 'Your petition is rejected.');
      refresh();
    });
  }
}
function foreignButtons(s) {
  const fid = s.owner,
    f = F[fid];
  if (!hostile(f) && !atWar(P, fid)) btn('Declare War', () => declareWar(P, fid));
  reclButtons(s);
  $('info').insertAdjacentHTML('beforeend', '<br><small>Send a 🕊 Diplomat, 🛰 Probe AI, 🗡 Bounty Hunter or 💰 Trader here to act.</small>');
}
async function envoys() {
  await receiveEnvoys();
  if (P !== 5 && F[5]?.alive && !atWar(P, 5) && !S.loans.some(l => l.debtor === P) && Math.random() < 0.04) {
    await loanOffer(null);
    return;
  }
  for (const f of F) {
    if (!f.alive || f.id === P || hostile(f) || !f.ruler) continue;
    const op = opinion(f.id, P);
    if (Math.random() > 0.03 + Math.abs(op) * 0.002) continue;
    const why = S.memWhy?.[mkey(f.id, P)];
    if (atWar(P, f.id) && op <= -10 && Math.random() < 0.8) continue; // hatred: no envoys
    // Marriage offers from friendly houses
    const pr = !celibate(f.id) && !f.mods?.coven && !celibate(P) && op >= 2 && !atWar(P, f.id) && f.princesses.find(x => !x.dead && x.age >= 16 && !x.betrothed && !x.spouse);
    const groom = pr && [F[P].ruler, ...F[P].heirs].find(m => mayWed(m) && !m.fem && m.age >= 16 && (m.betrothed == null || CH[m.betrothed]?.dead) && (m.spouse == null || CH[m.spouse]?.dead));
    if (envoyBusy(f.id, P)) continue; // one embassy at a time
    if (pr && groom && Math.random() < 0.5) {
      sendEnvoy(f.id, P, 'wed', {
        pr: pr.id,
        groom: groom.id
      });
      break;
    }
    if (!atWar(P, f.id) && op <= -6 && !S.ally.has(key(P, f.id))) {
      sendEnvoy(f.id, P, 'bloodprice');
      break;
    }
    if (atWar(P, f.id)) sendEnvoy(f.id, P, 'peace');else if (Math.random() < 0.5 && !S.ally.has(key(P, f.id))) sendEnvoy(f.id, P, 'tribute');else if (!S.ally.has(key(P, f.id))) sendEnvoy(f.id, P, 'ally');
    break;
  }
}
// Dark Acolytes and Witches arise in lawless, faithless places
async function heresyTick() {
  const rogue = units.filter(u => u.owner === -1);
  if (rogue.length < 5 && Math.random() < 0.15) {
    const s = rnd(systems.filter(x => x.order <= 4 && x.rel !== 'Order'));
    if (s) {
      const role = s.rel === 'Old Gods' && Math.random() < 0.6 ? 'Witch' : 'Acolyte';
      const c = role === 'Witch' ? mkFem(-1, ri(25, 60)) : mkChar(-1, ri(20, 45));
      c.role = role;
      c.piety = ri(0, 2);
      addUnit({
        type: 'agent',
        role,
        owner: -1,
        sys: s,
        char: c,
        max: 2
      });
      log(`${AICON[role]} A ${rn(role)} appears at ${s.name}.`);
    }
  }
  for (const u of rogue) {
    if (!units.includes(u)) continue;
    if (Math.random() < 0.4) u.sys = rnd(u.sys.links);
    const t = u.sys;
    if (u.role === 'Acolyte') {
      // skill of the acolyte against the piety of the world's governor
      const cp = clamp(0.02 + (u.char?.skill || 0) * 0.02 - (t.general?.piety || 0) * 0.01, 0.01, 0.25);
      if (t.rel === 'Order' && Math.random() < cp) {
        t.rel = rnd(['Zithari', 'Old Gods']);
        if (u.char) hist(u.char, `turns ${t.name} from the Order.`);
        if (t.owner === P) log(`🕯 ${u.char ? cl(u.char) : 'A Dark Acolyte'} turns ${t.name} from the Order.`);
      }
      if (Math.random() < 0.15) apoc(1, 'heresy spreads');
    }
    if (u.role === 'Witch' && t.general && Math.random() < clamp(0.03 + (u.char?.skill || 0) * 0.02 - (t.general.piety || 0) * 0.01, 0.01, 0.3)) {
      addTrait(t.general, 'Cursed');
      if (t.owner === P) log(`🔮 A Witch curses ${cl(t.general)} at ${t.name}.`);
    }
  }
}
async function siegeTick() {
  for (const t of systems) {
    if (!t.siege) continue;
    const bf = units.find(x => x.type === 'fleet' && x.owner === t.siege.by && x.sys === t);
    if (!bf || t.owner === t.siege.by || !F[t.siege.by]?.alive) {
      t.siege = null;
      continue;
    }
    t.siege.turns++;
    if (t.siege.turns > 2) t.legions = Math.max(0, t.legions - 1);
    t.order = Math.max(0, t.order - 1);
    if (t.siege.turns >= 6 || t.legions + t.elite + roCount(t, 'land') === 0) {
      log(`🏳 ${t.name} surrenders to the blockade of ${F[bf.owner].name}.`);
      await capture(bf, t);
    }
  }
}

// ================= Turn =================
$('endTurn').onclick = async () => {
  if (busy || P < 0) return;
  pushUndo('end turn');
  busy = true;
  $('endTurn').dataset.proc = '1';
  $('endTurn').classList.remove('ready');
  turnLog = [];
  // Hotseat: pass the device to the next human commander before the galaxy moves
  const hs = humans();
  if (hs.length > 1 && hs.indexOf(P) < hs.length - 1) {
    busy = false;
    $('endTurn').dataset.proc = '';
    await handoff(hs[hs.indexOf(P) + 1]);
    return;
  }
  const g0 = F[P].gold,
    a0 = S.apoc,
    n0 = systems.filter(s => s.owner === P).length;
  // Each step runs in order and on its own: one failing step is logged and the rest of the turn still happens
  stewardBegin(); // standing orders + report budget apply while the galaxy moves
  try {
    for (const [name, step] of TURN_STEPS) {
      try {
        await step();
      } catch (e) {
        console.error(`turn step "${name}" failed`, e);
      }
    }
  } finally {
    stewardEnd();
  }
  const rep = turnLog || [];
  turnLog = null;
  await endTurnFinish(rep, g0, a0, n0);
};
// ================= Turn order (edit here to change when things happen) =================
const TURN_STEPS = [['AI turns', async () => {
  for (const f of [...F]) if (f.alive && !isHuman(f.id)) await aiTurn(f);
}], ['orbit clashes', () => orbitClash()], ['economy', () => economy()], ['treaties', () => pactTick()], ['hostage exchanges', () => hostageTick()], ['loans', () => loansTick()], ['bank', () => bankTick()], ['reclamation check', () => reclTurnCheck()], ['advance turn', () => {
  S.turn++;
  systems.forEach(s => {
    s.moved = false;
    s.built = false;
  });
}], ['great works', () => gwTick()], ['building queues', () => bqTick()], ['refresh moves', () => units.forEach(u => {
  u.mp = u.max + (u.general?.skill >= 6 ? 1 : 0) + (has(u.general, 'Hyperspace Navigator') ? 1 : 0) + (has(u.general || u.char, 'Astrogation Map') ? 1 : 0) + (u.hunt ? 1 : 0);
  u.acted = false;
})], ['nemesis hunts', () => huntMove()], ['travel', async () => {
  for (const u of units.filter(x => isHuman(x.owner) && x.path?.length)) await travel(u);
}], ['counterintelligence', () => probeTick()], ['plague-sowing', () => rotTick()], ['sieges', () => siegeTick()], ['heresy', () => heresyTick()], ['envoys', async () => {
  if (humans().length > 1) S.envoyQ = [...humans()];else await envoys();
}], ['forbidden tomes', () => F.forEach(f => {
  if (f.alive && f.tech.includes('Necronomicon')) apoc(2, `${f.name} reads from the Necronomicon`);
})], ['emergence', () => {
  if (Math.random() < 0.12) emerge();
}], ['year passes (odd turns)', async () => {
  if (S.turn % 2 === 1) {
    await yearPass();
    await scienceTick();
    if (!SIM) save();
  }
}],
// The galaxy's sins pile up: every war, sack and massacre drags it toward the end; only long peace heals it
['apocalypse drift', () => {
  const w = S.war.size;
  if (w > 4 && Math.random() < Math.min(0.5, 0.1 + w * 0.012)) apoc(1 + Math.floor(w / 15), 'endless wars');else if (w <= 2 && Math.random() < 0.15) apoc(-1);
}], ['apocalypse events', () => apocEvents()], ['vacant thrones', async () => {
  buryDead();
  // The Voidspawn have no dynasty: the next surviving Hive-Mind speaks for the swarm
  for (const f of F) if (f?.alive && f.domiri && (!f.ruler || f.ruler.dead)) f.ruler = systems.find(s => s.owner === f.id && s.general && !s.general.dead)?.general || f.ruler;
  for (const f of F) if (f?.alive && !f.domiri && (!f.ruler || f.ruler.dead)) await succession(f.id, 'has died');
  buryDead();
}], ['victory', async () => {
  if (systems.filter(s => s.owner === P).length >= 30) await notify('<h3>👑 Galactic Emperor</h3>You command 30 systems. The stars kneel.');
}]];
async function reclTurnCheck() {
  if (S.recl && S.recl.tid != null && S.recl.target.owner !== S.recl.tid && S.recl.target.owner >= 0 && onSide(S.recl.target.owner, reclSide())) {
    // Taken by the faith (by any route): the caller's prestige grows, and those who answered are remembered
    reclWon(S.recl.target, S.recl.target.owner, null);
  }
  if (S.recl && S.turn >= S.recl.until) {
    const dark = reclSide() === 'Zithari';
    try {
      wikiReclEnd(S.recl, false);
    } catch (e) {}
    log(`${dark ? '🌑 The Dark' : '✠ The'} Reclamation of ${S.recl.target.name} ends in failure.${S.recl.refused?.length ? ` ${dark ? 'The Dark' : 'The Council'} blames ${S.recl.refused.map(i => F[i]?.name).join(', ')}.` : ''}`);
    if (dark) {
      (S.recl.refused || []).forEach(id => grudge(S.recl.by, id, -4, 'abandoning the Dark Reclamation'));
      const w = CH[S.recl.who];
      if (w && !w.dead) {
        w.skill = Math.max(0, w.skill - 1);
        note(w, `is mocked as a false prophet after the failed Dark Reclamation of ${S.recl.target.name}.`);
      }
      S.zFail = (S.zFail || 0) + 1;
      S.recl = null;
    } else {
      S.gmRep = (S.gmRep || 0) - 1;
      (S.recl.refused || []).forEach(id => {
        if (id !== 1 && F[id]?.alive && Math.random() < 0.3 && !S.sanct.includes(id)) {
          S.sanct.push(id);
          log(`✠ The Council sanctions ${F[id].name} for abandoning the faithful.`);
        }
      });
      S.recl = null;
      // Repeated failures: the Council of Masters may depose its Grandmaster
      if ((S.gmRep || 0) <= -2 && F[0].alive && Math.random() < 0.5) {
        const old = F[0].ruler;
        S.gmRep = 0;
        await succession(0, 'is deposed by the Council of Masters after failed Reclamations');
        if (old && !old.dead) hist(old, 'retires to a cloister in disgrace.');
      }
    }
  }
}
async function endTurnFinish(rep, g0, a0, n0) {
  reviewed.clear();
  busy = false;
  $('endTurn').dataset.proc = '';
  if (F[P].alive) {
    S.news = turnReport(rep, g0, a0, n0);
    S.newsUnread = true;
  }
  refresh();
  showInfo();
  try {
    advisorTick();
  } catch (e) {
    console.error(e);
  }
  const hs2 = humans();
  if (hs2.length > 1) {
    await handoff(hs2[0]);
  }
}
;
// ================= Hotseat multiplayer =================
// Each human keeps private fog, news, prisoners and wards; swapped when the device is passed.
const PP_KEYS = ['news', 'newsUnread', 'slaves', 'charts', 'docket', 'docketNew', 'orders', 'advisorOff'];
const humans = () => (S.humans?.length ? S.humans : [P]).filter(i => F[i]?.alive);
const isHuman = id => !SIM && (S.humans?.length ? S.humans.includes(id) : id === P);
// Multiplayer: only the commander at this device answers popups. Another human's house resolves like an AI
// house while it is not his turn, and his court (wards, prisoners, slaves) is filed under his own seat.
const isMe = id => id === P && isHuman(id);
const ppOf = id => (S.pp ||= {})[id] ||= {
  seen: [],
  visited: [],
  prisoners: [],
  wards: [],
  slaves: 0
};
function bumpSlaves(id, n) {
  if (!isHuman(id)) return;
  if (id === P) S.slaves = Math.max(0, (S.slaves || 0) + n);else {
    const o = ppOf(id);
    o.slaves = Math.max(0, (o.slaves || 0) + n);
  }
}
// ---- Spectator simulation (/sim.js): every house is AI-run; dialogs auto-answer; no saving ----
let SIM = false;
async function simTurn() {
  turnLog = [];
  for (const [name, step] of TURN_STEPS) {
    try {
      await step();
    } catch (e) {
      console.error(`turn step "${name}" failed`, e);
    }
  }
  const r = turnLog;
  turnLog = null;
  return r;
}
initWiki({
  portrait: (c, n) => portrait(c, n),
  dn: c => dn(c),
  title: c => royalTitle(c),
  rt: (fid, c) => rTitle(fid, c),
  heir: f => f.id === 0 || f.id === 1 || f.id === 16 || f.mods?.elect ? null : heirOrder(f)?.[0],
  heirs: f => f.id === 0 || f.id === 1 || f.id === 16 || f.mods?.elect ? [] : heirOrder(f),
  prep: () => {
    try {
      nmCouncilFill();
    } catch (e) {}
  }
});
initSteward({
  atWar: (a, b) => atWar(a, b),
  key: (a, b) => key(a, b),
  ships: u => ships(u),
  has: (c, t) => has(c, t),
  isMe: id => isMe(id),
  isHuman: id => isHuman(id),
  SIM: () => SIM,
  ask,
  toast,
  portrait: (c, n) => portrait(c, n),
  cl: c => cl(c),
  hist: (c, t) => hist(c, t),
  station: (s, c) => station(s, c),
  log: m => log(m),
  heirOf: f => {
    try {
      return heirOrder(f)?.[0];
    } catch (e) {
      return null;
    }
  },
  celibate: id => celibate(id)
});
initSim({
  setSim: v => {
    SIM = v;
  },
  simTurn,
  refresh: () => refresh(),
  showInfo: () => showInfo(),
  setBusy: v => {
    busy = v;
  }
});
function stashP(id) {
  (S.pp ||= {})[id] = {
    seen: [...S.seen],
    visited: [...S.visited],
    prisoners: S.prisoners.map(c => c.id),
    wards: S.wards.map(c => c.id),
    ...Object.fromEntries(PP_KEYS.map(k => [k, S[k] ?? null]))
  };
}
function restoreP(id) {
  const o = S.pp?.[id];
  S.seen = new Set(o?.seen || []);
  S.visited = new Set(o?.visited || []);
  S.prisoners = (o?.prisoners || []).map(i => CH[i]).filter(Boolean);
  S.wards = (o?.wards || []).map(i => CH[i]).filter(Boolean);
  S.news = o?.news ?? null;
  S.newsUnread = !!o?.newsUnread;
  S.slaves = o?.slaves || 0;
  S.charts = o?.charts || [];
  S.docket = o?.docket || [];
  S.docketNew = o?.docketNew || 0;
  S.orders = o?.orders || {};
  S.advisorOff = !!o?.advisorOff;
  // Wards and captives taken for this seat while another commander held the device join his court now
  if (isHuman(id)) for (const c of Object.values(CH)) {
    if (!c || c.dead) continue;
    if (c.wardOf === id) {
      delete c.wardOf;
      if (!S.wards.includes(c)) S.wards.push(c);
    }
    if (c.captive?.by === id && !c.enslaved && !S.prisoners.includes(c) && !S.wards.includes(c)) S.prisoners.push(c);
  }
}
async function handoff(id) {
  if (id !== P) {
    stashP(P);
    setP(id);
    restoreP(id);
  }
  selU = null;
  reviewed.clear();
  selected = F[P].capital || systems.find(s => s.owner === P) || null;
  if (selected) camGoal.set(selected.pos.x, 0, selected.pos.z);
  const cu = $('curtain'),
    f = F[P],
    col = '#' + new THREE.Color(f.color ?? FDEF[P]?.[1] ?? 0xffffff).getHexString();
  cu.innerHTML = `<div class="sbSub">Hotseat · Year ${S.year}</div><div style="margin:18px 0">${f.ruler ? portrait(f.ruler, 110) : ''}</div><h3 style="color:${col};font-size:20px">${f.name}</h3><p>Commander ${f.ruler?.name || ''}, the throne is yours.<br><small style="opacity:.7">Other players: look away from the screen.</small></p><button id="cuGo" style="min-width:220px;min-height:52px;border-color:#ffd76a">⚔ Take Command</button>`;
  cu.style.display = 'flex';
  await new Promise(r => {
    $('cuGo').onclick = r;
  });
  cu.style.display = 'none';
  refresh();
  showInfo();
  if (S.envoyQ?.includes(P)) {
    S.envoyQ = S.envoyQ.filter(i => i !== P);
    busy = true;
    try {
      await envoys();
    } catch (e) {
      console.error(e);
    }
    busy = false;
    refresh();
    showInfo();
  }
}
// ================= Menu screens (DOM overlay) =================
const scr = $('screen'),
  scrB = $('screenBody');
function showScreen(html) {
  scrB.innerHTML = html;
  scr.style.display = 'flex';
}
function hideScreen() {
  scr.style.display = 'none';
  scrB.innerHTML = '';
}
const fmtDate = t => t ? new Date(t).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short'
}) : '';
// mode 'save' | 'load' → resolves slot id or null
function slotScreen(mode) {
  return new Promise(res => {
    const render = () => {
      const list = SLOTS.filter(n => mode === 'load' || n !== 'auto').map(n => {
        const m = slotMeta(n),
          nm = n === 'auto' ? '⟳ Autosave' : `Slot ${n}`;
        if (!m) return `<div class="slot empty" data-s="${n}"><div class="si"><b>${nm}</b><br><small>— Empty —</small></div></div>`;
        return `<div class="slot" data-s="${n}" style="--c:${m.col}"><div class="si"><b>${nm}</b> · ${m.scen ? `🎬 <b>${m.scen}</b> · ` : ''}${m.fac}${m.humans > 1 ? ` · 👥 ${m.humans} players` : ''}<br>${m.ruler ? `👑 ${m.ruler} · ` : ''}Year ${m.year} · Turn ${m.turn}${m.sys != null ? ` · 🪐 ${m.sys}` : ''}${m.gold != null ? ` · 💰 ${m.gold}` : ''}${m.apoc != null ? ` · ☢ ${m.apoc}` : ''}<br><small style="opacity:.6">${fmtDate(m.t)}</small></div>${n !== 'auto' || mode === 'load' ? `<button data-del="${n}">🗑</button>` : ''}</div>`;
      }).join('');
      showScreen(`<div class="sbTitle" style="font-size:clamp(22px,6vw,40px)">${mode === 'save' ? 'SAVE' : 'LOAD'}</div><div class="sbSub">${mode === 'save' ? 'Choose a slot to record your chronicle' : 'Resume a chronicle'}</div><div style="margin-top:16px">${list}</div><div class="menuBtns"><button id="scBack">◀ Back</button></div>`);
    };
    render();
    scrB.onclick = async e => {
      const del = e.target.closest('[data-del]');
      if (del) {
        e.stopPropagation();
        const n = del.dataset.del === 'auto' ? 'auto' : +del.dataset.del;
        if ((await ask('<h3>Delete this save?</h3>', ['Delete', 'Cancel'])) === 'Delete') {
          deleteSlot(n);
          render();
        }
        return;
      }
      if (e.target.id === 'scBack') {
        scrB.onclick = null;
        hideScreen();
        res(null);
        return;
      }
      const sl = e.target.closest('[data-s]');
      if (!sl) return;
      const n = sl.dataset.s === 'auto' ? 'auto' : +sl.dataset.s,
        m = slotMeta(n);
      if (mode === 'load' && !m) return;
      if (mode === 'save' && m && (await ask(`<h3>Overwrite ${n === 'auto' ? 'Autosave' : 'Slot ' + n}?</h3>`, ['Overwrite', 'Cancel'])) !== 'Overwrite') return;
      scrB.onclick = null;
      hideScreen();
      res(n);
    };
  });
}
function titleMenu() {
  const any = SLOTS.map(n => [n, slotMeta(n)]).filter(([, m]) => m).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
  return new Promise(res => {
    showScreen(`<div class="sbTitle">STARBLADE</div><div class="sbSub">A Feudal Galaxy in the Dark Age</div>
      <div class="menuBtns">${any.length ? `<button class="primary" data-m="continue">▶ Continue <small style="opacity:.7">(${any[0][1].fac}, Y${any[0][1].year})</small></button>` : ''}
      <button class="${any.length ? '' : 'primary'}" data-m="new">⚔ New Campaign</button>

      <button data-m="mp">👥 Multiplayer (Hotseat)</button>
      <button data-m="load">📂 Load Game</button>
      <button data-m="scenario">🛠 Scenario Maker</button>
      <button data-m="playscen">🎬 Play Custom Scenario</button>
      <button data-m="help">📖 How to Play</button>
      <button data-m="settings">⚙ Settings</button>
      <button data-m="lore">✠ The Chronicle</button>
      <button data-m="quit" class="danger">⏻ Quit to Desktop</button></div>
      <div class="menuFoot">TAP OR CLICK TO BEGIN · WORKS ON PHONE, TABLET & PC</div>`);
    scrB.onclick = e => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      scrB.onclick = null;
      hideScreen();
      res(b.dataset.m === 'continue' ? {
        load: any[0][0]
      } : {
        m: b.dataset.m
      });
    };
  });
}
// Multiplayer setup: tap factions to seat human players (up to every playable power)
function mpSetup(online) {
  const playable = FDEF.map((d, i) => [d, i]).filter(([d]) => !d[5].ff);
  const seats = [];
  return new Promise(res => {
    const render = () => {
      // Keep the scroll position when re-rendering after a tap (no jumping back to the top)
      const y1 = scr.scrollTop,
        y2 = scrB.scrollTop;
      showScreen(`<div class="sbTitle" style="font-size:clamp(20px,6vw,38px)">${online ? 'HOST ONLINE' : 'HOTSEAT'}</div><div class="sbSub">${online ? 'Play-by-turn' : 'Pass-and-play'} · up to ${playable.length} commanders</div>
        <p style="font-size:12px;margin:12px 0 0">${online ? 'Tap factions to open seats, in turn order. Share the game code; each player claims a seat on their own device.' : 'Tap factions to seat players, in turn order. Everyone shares this device; each commander gets private fog of war and news.'}</p>
        <div class="fgrid">${playable.map(([d, i]) => `<div class="fchip ${seats.includes(i) ? 'on' : ''}" data-f="${i}" data-p="P${seats.indexOf(i) + 1}" style="--c:#${new THREE.Color(F[i]?.color ?? d[1]).getHexString()}"><b>${F[i]?.name ?? d[0]}</b><br><small style="opacity:.7">${F[i]?.rel ?? d[2]}</small></div>`).join('')}</div>
        <div class="menuBtns"><button class="primary" id="mpGo" ${seats.length < 2 ? 'disabled style="opacity:.4"' : ''}>▶ Begin with ${seats.length} players</button><button id="mpAll">Seat everyone</button><button id="mpBack">◀ Back</button></div>`);
      scr.scrollTop = y1;
      scrB.scrollTop = y2;
    };
    render();
    scrB.onclick = e => {
      const ch = e.target.closest('[data-f]');
      if (ch) {
        const i = +ch.dataset.f,
          k = seats.indexOf(i);
        if (k >= 0) seats.splice(k, 1);else seats.push(i);
        render();
        return;
      }
      if (e.target.id === 'mpAll') {
        seats.length = 0;
        playable.forEach(([, i]) => seats.push(i));
        render();
        return;
      }
      if (e.target.id === 'mpBack') {
        scrB.onclick = null;
        hideScreen();
        res(null);
        return;
      }
      if (e.target.id === 'mpGo' && seats.length >= 2) {
        scrB.onclick = null;
        hideScreen();
        res(seats);
      }
    };
  });
}
const START_BONUS = 200; // human houses start with this on top of their treasury (shown in faction select)
// ---- Faction selection: browse every power, its perks and its freshly generated dynasty ----
function factionSelect() {
  const playable = FDEF.map((d, i) => [d, i]).filter(([d]) => !d[5].ff);
  const hex = c => '#' + new THREE.Color(c).getHexString();
  const PERK = {
    monk: '✠ Elite Nameless Monks anywhere',
    poor: '⚠ Poor: −40% income',
    fleetUp: '🚀 Cheap ships, low fleet upkeep',
    fleet: '⚓ Huge starting armada',
    black: '🕶 Black-market income',
    spice: '✨ Spice cartel: +50% from Spice, cheap Bounty Hunters',
    prod: '⚙ +35% production',
    bank: '🩸 Lends loans, Bloodknights',
    cheap: '🧬 Very cheap Clone Legions',
    slaver: '⛓ Slavery permitted',
    pirate: '☠ Raiders at war with everyone',
    might: '⚔ Might makes right: +15% ground power, plunder on conquest',
    bureau: '📋 Bureaucracy: +1 order on every world',
    droids: '🤖 Cheap AI legions (+3 per muster); profits from AI mercenary sales',
    liberator: '⛓ Liberators: conquering slaver worlds frees slaves to fight',
    warrior: '🪓 Ashborn warriors: +25% ground power, +1 command',
    elect: '🗳 Elective High King chosen by the governors; +1 order where governed',
    sith: '🌑 Dark Path: dreaded commanders, +10% ground power',
    gray: '⚖ Gray Wardens: every commander +2 command',
    upgrade: '⚙ The Upgrade: commanders gain cybernetics over time; upgraded governors +1 order',
    coven: '🔮 Witch-Queens rule; sister-heirs from the coven; far stronger curses, yearly hexes on enemies'
  };
  const DL = {
    Easy: ['Easy', '#8f8'],
    Normal: ['Normal', '#ffd76a'],
    Hard: ['Hard', '#ffa050'],
    'Very Hard': ['Very Hard', '#f66']
  };
  const DFIX = {
    0: 'Hard',
    1: 'Very Hard',
    9: 'Normal',
    16: 'Hard'
  };
  const diff = (d, i) => {
    if (DFIX[i]) return DL[DFIX[i]];
    const sc = d[4] * 2 + (d[5].gold || 300) / 300 - (d[5].poor ? 3 : 0) - (d[5].pirate ? 2 : 0);
    return sc >= 9 ? DL.Easy : sc >= 6 ? DL.Normal : sc >= 4 ? DL.Hard : DL['Very Hard'];
  };
  // Easiest first; within a tier, the more noble houses come first
  const NOBLE = [0, 16, 1, 10, 14, 4, 8, 11, 9, 6, 3, 5, 13, 2, 12, 17, 7, 15, 19, 20, 18];
  const rank = i => {
    const n = NOBLE.indexOf(i);
    return n < 0 ? 99 : n;
  };
  const tier = ([d, i]) => ['Easy', 'Normal', 'Hard', 'Very Hard'].indexOf(diff(d, i)[0]);
  playable.sort((a, b) => tier(a) - tier(b) || rank(a[1]) - rank(b[1]));
  let cur = playable[0][1];
  return new Promise(res => {
    const render = () => {
      const keep = scrB.querySelector('#fsStrip')?.scrollLeft || 0,
        keepY = scrB.scrollTop;
      renderInner();
      const st = scrB.querySelector('#fsStrip');
      if (st) st.scrollLeft = keep;
      scrB.scrollTop = keepY;
    };
    const renderInner = () => {
      const d = [...FDEF[cur]],
        f = F[cur],
        [dn, dc] = diff(FDEF[cur], cur);
      if (f) {
        d[0] = f.name ?? d[0];
        d[1] = f.color ?? d[1];
        d[2] = f.rel ?? d[2];
      }
      const col = hex(d[1]);
      const desc = DESC[cur] || `${d[2]} faith. A rising feudal power of the dark age.`;
      const perks = Object.keys(d[5]).filter(k => PERK[k]).map(k => PERK[k]);
      const fu = FACTION_UNIQUE[FDEF[cur][0]] ? UNITS[FACTION_UNIQUE[FDEF[cur][0]]] : null;
      const worlds = systems.filter(s => s.owner === cur),
        res = [...new Set(worlds.flatMap(s => geo(s).res))];
      const r = f.ruler;
      showScreen(`<div class="sbSub" style="margin-bottom:6px">Choose your house</div>
        <div class="fsWrap"><button class="fsArr" data-fs="-1" title="Previous house">◀</button><div id="fsStrip" style="display:flex;gap:6px;overflow-x:auto;padding:4px 2px 8px;-webkit-overflow-scrolling:touch;flex:1;min-width:0">${playable.map(([dd, i]) => {
        const nm = F[i]?.name ?? dd[0];
        return `<div data-f="${i}" title="${nm}" style="flex:none;width:44px;height:44px;border-radius:50%;cursor:pointer;background:radial-gradient(circle at 35% 30%, #fff8, ${hex(F[i]?.color ?? dd[1])} 45%, #000 120%);border:2px solid ${i === cur ? '#ffd76a' : '#0008'};box-shadow:${i === cur ? '0 0 12px #ffd76a' : 'none'};display:flex;align-items:center;justify-content:center;font:700 13px Orbitron;color:#000a">${nm.replace(/^The /, '')[0]}</div>`;
      }).join('')}</div><button class="fsArr" data-fs="1" title="Next house">▶</button></div>
        <div class="panel" style="text-align:left;border-left:6px solid ${col};padding:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="color:${col};font-size:18px;margin:0">${d[0]}</h3><span style="font:700 11px Orbitron;color:${dc};border:1px solid ${dc};padding:2px 8px;border-radius:3px">${dn}</span></div>
          <p style="margin:8px 0;font-size:13px">${desc}</p>
          ${FLORE[cur] ? `<details style="margin:0 0 8px;font-size:12px"><summary style="cursor:pointer;color:#ffd76a">📜 Lore of the house</summary><p style="font-style:italic;opacity:.9;margin:6px 0 0">${FLORE[cur]}</p></details>` : ''}
          <div class="rank"><span>✝ Faith</span><i>${d[2]}</i><span>🪐 Starting worlds</span><i>${worlds.length}</i><span>💰 Treasury</span><i>${f.gold + START_BONUS}</i><span>📦 Resources</span><i>${res.map(resTag).join(' ') || '—'}</i></div>
          ${perks.length ? `<div class="flab">Traits of the house</div><div style="font-size:12px">${perks.join('<br>')}</div>` : ''}
          ${fu ? `<div class="flab">Unique unit</div><div style="font-size:12px">${fu.ic} <b>${fu.n}</b> — ${fu.d}</div>` : ''}
          ${r ? `<div class="flab">${cur === 0 ? 'Your Grandmaster' : cur === 1 ? 'Your Lord Commander' : 'Your ruler'} (generated this campaign)</div><div class="ccard">${portrait(r, 76)}<div style="font-size:12px"><b>${r.name}</b>, age ${r.age}<br>${charStr(r)}</div></div>` : ''}
          ${celibate(cur) ? `<div class="flab">Succession</div><div style="font-size:12px">No bloodline and no heirs. The ${cur === 0 ? 'Grandmaster is elected by the Council of 13' : 'Lord Commander is elected by the Council of 5'} when the ruler dies.</div>` : f.heirs?.length ? `<div class="flab">Heirs</div><div class="frow" style="justify-content:flex-start">${f.heirs.map(h => `<div class="pc">${portrait(h, 44)}<span>${h.name.split(' ')[0]}</span><small>${h.age}</small></div>`).join('')}</div>` : ''}
        </div>
        <div class="menuBtns" style="margin-top:12px"><button class="primary" id="fsGo">⚔ Lead ${d[0]}</button><button id="fsBack">◀ Back</button></div>`);
      // Desktop: wheel scrolls the house strip sideways, click-drag pans it; position is kept between re-renders
      const strip = $('fsStrip');
      strip.scrollLeft = stripX;
      strip.onscroll = () => {
        stripX = strip.scrollLeft;
      };
      strip.onwheel = e => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          strip.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      };
      let drag = null;
      strip.onpointerdown = e => {
        if (e.pointerType === 'mouse') drag = {
          x: e.clientX,
          s: strip.scrollLeft
        };
      };
      strip.onpointermove = e => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 4) dragged = true;
        strip.scrollLeft = drag.s - dx;
      };
      strip.onpointerup = strip.onpointerleave = () => {
        drag = null;
      };
    };
    let stripX = 0,
      dragged = false;
    render();
    scrB.onclick = e => {
      if (dragged) {
        dragged = false;
        return;
      }
      const ar = e.target.closest('[data-fs]');
      if (ar) {
        // Step to the previous/next house and keep it in view
        const ids = playable.map(([, i]) => i);
        cur = ids[(ids.indexOf(cur) + +ar.dataset.fs + ids.length) % ids.length];
        render();
        $('fsStrip').querySelector(`[data-f="${cur}"]`)?.scrollIntoView({
          block: 'nearest',
          inline: 'center'
        });
        return;
      }
      const ch = e.target.closest('[data-f]');
      if (ch) {
        cur = +ch.dataset.f;
        render();
        return;
      }
      if (e.target.closest('#fsGo')) {
        scrB.onclick = null;
        hideScreen();
        res(cur);
      }
      if (e.target.closest('#fsBack')) {
        scrB.onclick = null;
        hideScreen();
        res(null);
      }
    };
  });
}
// ================= 🛠 God Mode / Scenario Maker =================
// Edit everything: worlds, links, fleets, characters, factions and the galaxy itself. Saved scenarios use the normal save slots.
function inputAsk(title, val, hint = '') {
  let v = String(val ?? '');
  const p = ask(`<h3>${title}</h3>${hint ? `<small>${hint}</small><br>` : ''}<input id="gIn" value="${v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" style="width:90%;font-size:16px;padding:8px;margin:8px 0;background:#021024;color:#fff;border:1px solid #3a9aff;border-radius:3px;user-select:text;-webkit-user-select:text">`, ['OK', 'Cancel']);
  const el = $('gIn');
  if (el) {
    el.oninput = e => {
      v = e.target.value;
    };
    setTimeout(() => {
      el.focus();
      el.select();
    }, 30);
  }
  return p.then(r => r === 'OK' ? v : null);
}
async function numAsk(title, val, min, max) {
  const r = await inputAsk(title, val, `${min} to ${max}`);
  if (r == null || r.trim() === '' || isNaN(+r)) return null;
  return clamp(Math.round(+r), min, max);
}
const fName = id => id < 0 ? 'Independent' : F[id]?.name || '?';
async function pickFaction(title, withNone = true) {
  const list = F.map(f => f.id);
  const lb = id => `${F[id].alive ? '' : '💀 '}${F[id].name}`;
  const r = await ask(`<h3>${title}</h3>`, [...(withNone ? ['Independent'] : []), ...list.map(lb), 'Cancel']);
  if (r === 'Independent') return -1;
  const id = list.find(i => lb(i) === r);
  return id ?? null;
}
function setOwner(s, o) {
  const prev = s.owner;
  if (prev === o) return;
  s.owner = o;
  if (s.general && o >= 0) s.general.f = o;else if (o < 0) s.general = null;
  if (o >= 0) {
    const f = F[o];
    if (!f.alive) {
      f.alive = true;
      f.dormant = false;
    }
    if (!f.capital || f.capital.owner !== o) f.capital = s;
  }
  if (prev >= 0 && F[prev].capital === s) F[prev].capital = systems.find(x => x.owner === prev) || null;
  if (prev >= 0) checkDead(prev);
}
function unlink(a, b) {
  a.links = a.links.filter(x => x !== b);
  b.links = b.links.filter(x => x !== a);
  for (let i = LINES.length - 1; i >= 0; i--) {
    const l = LINES[i];
    if (l.a === a && l.b === b || l.a === b && l.b === a) {
      scene.remove(l.line);
      l.line.geometry.dispose();
      LINES.splice(i, 1);
    }
  }
}
const GOD_B = ['Shipyard', 'Barracks', 'Temple', 'Market', 'Brothel', 'Mercenary Guild', 'Mine', 'Space Station', 'Terraforming'];
async function godSystem(s) {
  pushUndo(`edit ${s.name}`);
  for (;;) {
    const G = geo(s);
    const r = await ask(`<h3>🛠 ${s.name}</h3><small>${fName(s.owner)} · ${G.type} (${G.res.map(x => RES[x].n).join(', ')}) · 💰${s.income} · Order ${s.order} · ✝${s.rel}<br>🚀${s.fleet} 🛡${s.legions} ⭐${s.elite} · 🛰 Lv${s.stn || 0} · 🔗 ${s.links.map(l => l.name).join(', ')}<br>🏗 ${bL(s)} · Governor: ${s.general ? cl(s.general) : 'none'}</small>`, ['✏ Rename', '⚑ Owner', '💰 Income', '🚀 Ships', '🛡 Legions', '⭐ Elite', '🛰 Station', '✝ Religion', '🏗 Buildings', '✏ Rename building', '⚜ Governor', '🔗 Add link', '✂ Remove link', '🪐 Reroll planet', `🏚 Ruins ${s.ruin ? 'ON' : 'OFF'}`, '➕ New system nearby', '🚀 Spawn fleet here', 'Done']);
    if (r === 'Done' || r == null) return;
    if (r === '✏ Rename') {
      const v = await inputAsk('Rename system', s.name);
      if (v?.trim()) {
        s.name = v.trim().slice(0, 30);
        s._geo = null;
      }
    }
    if (r === '⚑ Owner') {
      const o = await pickFaction('New owner');
      if (o != null) setOwner(s, o);
    }
    if (r === '💰 Income') {
      const v = await numAsk('Base income', s.income, 10, 999);
      if (v != null) s.income = v;
    }
    if (r === '🚀 Ships') {
      const v = await numAsk('Picket ships', s.fleet, 0, 99);
      if (v != null) s.fleet = v;
    }
    if (r === '🛡 Legions') {
      const v = await numAsk('Legions', s.legions, 0, 99);
      if (v != null) s.legions = v;
    }
    if (r === '⭐ Elite') {
      const v = await numAsk('Elite troops', s.elite, 0, 99);
      if (v != null) s.elite = v;
    }
    if (r === '🛰 Station') {
      const v = await numAsk('Orbital station level', s.stn || 0, 0, 3);
      if (v != null) s.stn = v;
    }
    if (r === '✝ Religion') {
      const v = await ask('<h3>Religion</h3>', [...RELS, 'Cancel']);
      if (RELS.includes(v)) {
        s.rel = v;
        s._geo = null;
      }
    }
    if (r === '🏗 Buildings') for (;;) {
      const v = await ask('<h3>Toggle buildings</h3>', [...GOD_B.map(b => (s.b.has(b) ? '✅ ' : '⬜ ') + b), 'Done']);
      const b = GOD_B.find(x => v.endsWith(x));
      if (!b) break;
      if (s.b.has(b)) s.b.delete(b);else s.b.add(b);
    }
    if (r === '✏ Rename building') {
      const list = [...s.b];
      if (!list.length) {
        await notify('This world has no buildings yet.');
        continue;
      }
      const v = await ask('<h3>Rename which building?</h3>', [...list.map(b => s.bn?.[b] || b), 'Cancel']);
      const b = list.find(x => (s.bn?.[x] || x) === v);
      if (b) {
        const n = await inputAsk(`Rename ${b}`, s.bn?.[b] || b, 'Leave empty to restore the original name.');
        if (n != null) {
          s.bn ??= {};
          if (n.trim()) s.bn[b] = n.trim().slice(0, 30);else delete s.bn[b];
        }
      }
    }
    if (r === '⚜ Governor') {
      if (s.owner < 0) {
        await notify('Independent worlds have no governors. Set an owner first.');
        continue;
      }
      const court = F[s.owner].heirs.filter(h => !h.dead);
      const v = await ask('<h3>Governor</h3>', ['🆕 Create new general', ...court.map(h => `From court: ${h.name}`), ...(s.general ? ['❌ Remove governor'] : []), 'Cancel']);
      if (v === '🆕 Create new general') s.general = mkChar(s.owner, ri(25, 50));
      if (v === '❌ Remove governor') {
        F[s.owner].heirs.push(s.general);
        s.general = null;
      }
      const h = court.find(x => v === `From court: ${x.name}`);
      if (h) {
        F[s.owner].heirs.splice(F[s.owner].heirs.indexOf(h), 1);
        if (s.general) F[s.owner].heirs.push(s.general);
        s.general = h;
      }
    }
    if (r === '🔗 Add link') {
      const near = systems.filter(x => x !== s && !s.links.includes(x)).sort((a, b) => a.pos.distanceTo(s.pos) - b.pos.distanceTo(s.pos)).slice(0, 10);
      const v = await ask('<h3>Link to…</h3><small>The 10 nearest unlinked systems.</small>', [...near.map(x => x.name), 'Cancel']);
      const t = near.find(x => x.name === v);
      if (t) link(s, t);
    }
    if (r === '✂ Remove link') {
      const v = await ask('<h3>Cut hyperlane to…</h3>', [...s.links.map(x => x.name), 'Cancel']);
      const t = s.links.find(x => x.name === v);
      if (t) unlink(s, t);
    }
    if (r === '🪐 Reroll planet') {
      s.gseed = (s.gseed || 0) + 1;
      s._geo = null;
    }
    if (r.startsWith('🏚')) s.ruin = !s.ruin;
    if (r === '➕ New system nearby') {
      const n = addSystem(s.pos.x, s.pos.z, 12, -1);
      link(s, n);
      S.seen.add(n.i);
      await notify(`New system <b>${n.name}</b> created and linked. Edit it by tapping it on the map.`);
    }
    if (r === '🚀 Spawn fleet here') {
      const o = await pickFaction('Fleet owner', false);
      if (o != null) {
        const n = await numAsk('Ships', 5, 1, 99);
        if (n) addUnit({
          type: 'fleet',
          owner: o,
          sys: s,
          fleet: n,
          legions: 0,
          mp: 2
        });
      }
    }
    refresh();
  }
}
async function godUnit(u) {
  pushUndo('edit unit');
  for (;;) {
    const fl = u.type === 'fleet';
    const r = await ask(`<h3>🛠 ${uName(u)}</h3><small>${fName(u.owner)} · at ${u.sys.name}${fl ? ` · 🚀${u.fleet} 🛡${u.legions} ⭐${u.elite} · General: ${u.general ? cl(u.general) : 'none'}` : ` · ${cl(u.char)}`} · Moves ${u.mp}/${u.max}</small>`, ['✏ Rename', ...(fl ? ['🚀 Ships', '🛡 Legions', '⭐ Elite', '⚜ General'] : ['👤 Edit character']), '🏃 Moves', '⚑ Owner', '📍 Teleport', '🗑 Delete', 'Done']);
    if (r === 'Done') return;
    if (r === '✏ Rename') {
      const v = await inputAsk('Rename unit', u.nm || '', 'e.g. "The Crimson Armada". Leave empty for the automatic name.');
      if (v != null) {
        if (v.trim()) u.nm = v.trim().slice(0, 40);else delete u.nm;
      }
    }
    if (r === '🚀 Ships') {
      const v = await numAsk('Ships', u.fleet, 0, 99);
      if (v != null) u.fleet = v;
    }
    if (r === '🛡 Legions') {
      const v = await numAsk('Legions', u.legions, 0, 99);
      if (v != null) u.legions = v;
    }
    if (r === '⭐ Elite') {
      const v = await numAsk('Elite', u.elite, 0, 99);
      if (v != null) u.elite = v;
    }
    if (r === '⚜ General') {
      const v = await ask('<h3>Fleet general</h3>', ['🆕 Create new general', ...(u.general ? ['👤 Edit current', '❌ Remove'] : []), 'Cancel']);
      if (v === '🆕 Create new general' && u.owner >= 0) u.general = mkChar(u.owner, ri(25, 45));
      if (v === '❌ Remove') u.general = null;
      if (v === '👤 Edit current') await godChar(u.general);
    }
    if (r === '👤 Edit character') await godChar(u.char);
    if (r === '🏃 Moves') {
      const v = await numAsk('Max moves per turn', u.max, 0, 10);
      if (v != null) {
        u.max = v;
        u.mp = v;
      }
    }
    if (r === '⚑ Owner') {
      const o = await pickFaction('New owner', false);
      if (o != null) {
        u.owner = o;
        if (u.general) u.general.f = o;
        if (u.char) u.char.f = o;
      }
    }
    if (r === '📍 Teleport') {
      const v = await inputAsk('Teleport to system (name)', u.sys.name);
      const t = systems.find(x => x.name.toLowerCase() === (v || '').trim().toLowerCase());
      if (t) {
        u.sys = t;
        u.path = [];
      } else if (v) await notify('No system with that name.');
    }
    if (r === '🗑 Delete') {
      if ((await ask('<h3>Delete this unit?</h3>', ['Delete', 'Cancel'])) === 'Delete') {
        if (selU === u) selU = null;
        removeUnit(u);
        return;
      }
    }
    refresh();
  }
}
const GOD_ATTR = [['skill', 'Command/Skill', 0, 20], ['admin', 'Administration', 0, 20], ['respect', 'Fear(−)/Respect(+)', -20, 20], ['loyalty', 'Loyalty', 0, 10], ['piety', 'Piety', 0, 20], ['dip', 'Diplomacy', 0, 20], ['charm', 'Charm', 0, 20]];
// Portrait customization: overrides stored in c.pt; aging (grey hair, wrinkles, balding) still applies on top
async function godPortrait(c) {
  const sw = (cols, cur) => cols.map((x, i) => `<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${x};margin:1px;${i === cur ? 'outline:2px solid #f2c94c' : ''}"></span>`).join('');
  const cyc = (k, n, auto = true) => {
    const p = c.pt ??= {};
    const v = p[k] == null ? -1 : p[k];
    const nx = v + 1 >= n ? auto ? null : 0 : v + 1;
    if (nx == null) delete p[k];else p[k] = nx;
  };
  const lab = (k, names) => c.pt?.[k] == null ? 'Auto' : names[c.pt[k]];
  const STY = ['Swept', 'Long', 'Cropped', 'Bald'],
    BRD = ['None', 'Full', 'Goatee'],
    EYE = ['Dark', 'Blue', 'Green', 'Amber', 'Grey', 'Red'],
    MET = ['Steel', 'Gold', 'Gunmetal'];
  for (;;) {
    const pt = c.pt || {};
    const ages = [c.fem ? 10 : 10, 16, 30, 55, 75].map(a => portrait({
      ...c,
      age: a
    }, 44)).join('');
    const r = await ask(`<h3>🎨 Portrait of ${c.name}</h3><div style="display:flex;gap:10px;align-items:center">${portrait(c, 96)}<small>Skin ${sw(PT_SKIN, pt.skin)}<br>Hair ${sw(PT_HAIR, pt.hair)}<br>Hairstyle: <b>${lab('style', STY)}</b>${c.fem ? '' : ` · Beard: <b>${lab('beard', BRD)}</b>`}<br>Eyes: <b>${lab('eyes', EYE)}</b> · Armour: <b>${lab('metal', MET)}</b><br>Eyepiece: <b>${pt.eyepiece == null ? 'Auto' : pt.eyepiece ? 'Yes' : 'No'}</b> · Greying: <b>${pt.noGrey ? 'Never' : 'With age'}</b></small></div><div class="flab">Through the years (10 · 16 · 30 · 55 · 75)</div><div style="display:flex;gap:3px;justify-content:center">${ages}</div>`, ['🎨 Skin', '💇 Hair colour', '✂ Hairstyle', ...(c.fem ? [] : ['🧔 Beard']), '👁 Eyes', '🛡 Armour', '🔭 Eyepiece', '⏳ Greying', '🎲 Randomize', '↺ Reset', 'Done']);
    if (r === 'Done') return;
    if (r === '🎨 Skin') cyc('skin', 6);
    if (r === '💇 Hair colour') cyc('hair', 6);
    if (r === '✂ Hairstyle') cyc('style', 4);
    if (r === '🧔 Beard') cyc('beard', 3);
    if (r === '👁 Eyes') cyc('eyes', 6);
    if (r === '🛡 Armour') cyc('metal', 3);
    if (r === '🔭 Eyepiece') {
      const p = c.pt ??= {};
      p.eyepiece = p.eyepiece == null ? true : p.eyepiece ? false : undefined;
      if (p.eyepiece === undefined) delete p.eyepiece;
    }
    if (r === '⏳ Greying') {
      const p = c.pt ??= {};
      if (p.noGrey) delete p.noGrey;else p.noGrey = true;
    }
    if (r === '🎲 Randomize') c.pt = {
      seed: ri(1, 99999)
    };
    if (r === '↺ Reset') delete c.pt;
  }
}
async function godChar(c) {
  if (!c) return;
  pushUndo(`edit ${c.name}`);
  for (;;) {
    const f = F[c.f];
    const r = await ask(`<h3>🛠 ${c.name}</h3><div class="ccard">${portrait(c, 64)}<small>${fName(c.f)} · Age ${c.age}${c.dead ? ' · 🪦 Dead' : ''}<br>${GOD_ATTR.map(([k, n]) => `${n}: <b>${c[k] ?? 0}</b>`).join(' · ')}<br>Traits: ${c.traits.join(', ') || 'none'}</small></div>`, ['✏ Rename', '🎨 Portrait', '🎂 Age', ...GOD_ATTR.map(a => '📊 ' + a[1]), '➕ Add trait', '➖ Remove trait', '🎒 Add retinue/item', ...((c.anc || []).length ? ['🗑 Remove retinue/item'] : []), c.starblade ? '⚔ Take Starblade' : '⚔ Give Starblade', ...(f && f.ruler !== c && !c.dead ? ['👑 Make ruler'] : []), ...(c.dead ? ['✨ Revive'] : f?.ruler !== c ? ['💀 Kill'] : []), 'Done']);
    if (r === 'Done') return;
    if (r === '✏ Rename') {
      const v = await inputAsk('Rename character', c.name);
      if (v?.trim()) c.name = v.trim().slice(0, 40);
    }
    if (r === '🎨 Portrait') await godPortrait(c);
    if (r === '🎂 Age') {
      const v = await numAsk('Age', c.age, 0, 300);
      if (v != null) c.age = v;
    }
    const a = GOD_ATTR.find(x => r === '📊 ' + x[1]);
    if (a) {
      const v = await numAsk(a[1], c[a[0]] ?? 0, a[2], a[3]);
      if (v != null) c[a[0]] = v;
    }
    if (r === '➕ Add trait') {
      const all = Object.keys(TR).filter(t => !c.traits.includes(t));
      const v = await ask('<h3>Add trait</h3><div class="scroll" style="max-height:20vh"><small>Tap a trait below.</small></div>', [...all, 'Cancel']);
      if (all.includes(v)) c.traits.push(v);
    }
    if (r === '➖ Remove trait') {
      const v = await ask('<h3>Remove trait</h3>', [...c.traits, 'Cancel']);
      c.traits = c.traits.filter(t => t !== v);
    }
    if (r === '🎒 Add retinue/item') {
      c.anc ||= [];
      if (c.anc.length >= 6) {
        await notify('Retinue is full (6/6). Remove one first.');
        continue;
      }
      const all = Object.keys(ANC).filter(a => !c.anc.includes(a));
      const v = await ask(`<h3>Add retinue / item (${c.anc.length}/6)</h3><div class="scroll" style="max-height:24vh">${all.map(a => `<div><b>${a}</b> <small>${ANC[a]?.d || ''}</small></div>`).join('')}</div>`, [...all, 'Cancel']);
      if (all.includes(v)) {
        c.anc.push(v);
        fx(c, ANC[v].e, 1);
      }
    }
    if (r === '🗑 Remove retinue/item') {
      const v = await ask('<h3>Remove retinue / item</h3>', [...c.anc, 'Cancel']);
      if (c.anc.includes(v)) {
        c.anc = c.anc.filter(a => a !== v);
        fx(c, ANC[v]?.e, -1);
      }
    }
    if (r === '⚔ Give Starblade') c.starblade = true;
    if (r === '⚔ Take Starblade') delete c.starblade;
    if (r === '👑 Make ruler') {
      const old = f.ruler;
      f.heirs = f.heirs.filter(h => h !== c);
      f.ruler = c;
      c.wasRuler = true;
      if (old && !old.dead) f.heirs.unshift(old);
      hist(c, `is raised to rule ${f.name} by the will of the stars.`);
    }
    if (r === '💀 Kill') {
      if (setFate(c, 'dead')) await succession(c.f, 'has died');
    }
    if (r === '✨ Revive') c.dead = false;
  }
}
async function godFaction(f) {
  pushUndo(`edit ${f.name}`);
  for (;;) {
    const col = '#' + new THREE.Color(f.color).getHexString();
    const wars = F.filter(o => o !== f && o.alive && atWar(f.id, o.id)).map(o => o.name);
    const r = await ask(`<h3 style="color:${col}">🛠 ${f.name}</h3><small>${f.alive ? 'Alive' : f.dormant ? 'Dormant' : 'Fallen'} · 💰${Math.round(f.gold)} · 🪐 ${systems.filter(s => s.owner === f.id).length} worlds · ✝ ${f.rel}<br>Ruler: ${f.ruler ? cl(f.ruler) : 'none'} · Capital: ${f.capital?.name || 'none'}<br>At war with: ${wars.join(', ') || 'no one'}<br>Tech: ${f.tech.join(', ') || 'none'}</small>`, ['✏ Rename', '💰 Credits', '🎨 Colour', '✝ Faith', '👤 Edit ruler', '🆕 New heir', '⚔ War / Peace…', '🤝 Alliance…', '🔬 Grant tech', '🎮 Play as', 'Done']);
    if (r === 'Done') return;
    if (r === '✏ Rename') {
      const v = await inputAsk('Faction name', f.name, 'Unique units and guild mercenaries follow the faction automatically.');
      if (v?.trim()) f.name = v.trim().slice(0, 40);
    }
    if (r === '💰 Credits') {
      const v = await numAsk('Credits', Math.round(f.gold), -99999, 999999);
      if (v != null) f.gold = v;
    }
    if (r === '🎨 Colour') {
      const v = await inputAsk('Colour (hex, e.g. ff8800)', col.slice(1));
      if (v && /^#?[0-9a-f]{6}$/i.test(v.trim())) {
        f.color = parseInt(v.trim().replace('#', ''), 16);
        units.filter(u => u.owner === f.id).forEach(u => u.mesh.traverse?.(m => {
          if (m.material?.color) m.material.color.setHex(f.color);
        }));
      }
    }
    if (r === '✝ Faith') {
      const v = await ask('<h3>Faith</h3>', [...RELS, 'Mixed', 'Cancel']);
      if (v !== 'Cancel') f.rel = v;
    }
    if (r === '👤 Edit ruler') await godChar(f.ruler);
    if (r === '🆕 New heir') {
      const h = mkChar(f.id, ri(14, 30));
      f.heirs.push(h);
    }
    if (r === '⚔ War / Peace…') {
      const o = await pickFaction('Toggle war with…', false);
      if (o != null && o !== f.id) {
        if (atWar(f.id, o)) makePeace(f.id, o);else declareWar(f.id, o);
      }
    }
    if (r === '🤝 Alliance…') {
      const o = await pickFaction('Toggle alliance with…', false);
      if (o != null && o !== f.id) {
        const k = key(f.id, o);
        if (S.ally.has(k)) S.ally.delete(k);else {
          S.war.delete(k);
          S.ally.add(k);
        }
      }
    }
    if (r === '🔬 Grant tech') {
      const all = Object.keys(TECH_FINDS).filter(t => !f.tech.includes(t));
      const v = await ask('<h3>Grant technology</h3>', [...all, 'Cancel']);
      if (all.includes(v)) f.tech.push(v);
    }
    if (r === '🎮 Play as') {
      if (!f.alive) {
        await notify('Give this faction a world first (edit a system → Owner).');
        continue;
      }
      stashP(P);
      const hs = S.humans || [P];
      const k = hs.indexOf(P);
      setP(f.id);
      restoreP(P);
      if (k >= 0) hs[k] = P;
      S.humans = [...new Set(hs)];
      selected = f.capital;
      selU = null;
      if (selected) camGoal.set(selected.pos.x, 0, selected.pos.z);
      await notify(`You now command <b>${f.name}</b>.`);
      return;
    }
  }
}
async function godMenu() {
  S.god = true;
  for (;;) {
    updateGodTag();
    refresh();
    showInfo();
    const r = await ask(`<h3>🛠 God Mode</h3><small>Scenario Maker: with God Mode on, every system, fleet and character gets a 🛠 Edit button. Save your scenario to any slot from ☰ Menu → Save Game.</small>`, [...(UNDO.length ? [`↶ Undo: ${UNDO[UNDO.length - 1].why}`] : []), '💾 Save Scenario', '⚜ Edit factions', '📦 Rename resources', '📅 Year', '☢ Armageddon', '💰 My credits', `👁 Fog of war: ${S.godSee ? 'OFF' : 'ON'}`, '⏸ Close (stay in God Mode)', '🚪 Exit God Mode']);
    if (r?.startsWith('↶')) {
      await undoLast();
      continue;
    }
    if (['📅 Year', '☢ Armageddon', '💰 My credits', '📦 Rename resources'].includes(r)) pushUndo(r.slice(2).trim());
    if (r === '⚜ Edit factions') {
      const o = await pickFaction('Edit which faction?', false);
      if (o != null) await godFaction(F[o]);
    }
    if (r === '💾 Save Scenario') {
      const nm = await inputAsk('Scenario name', S.scen || 'My Scenario', 'Load it later from the main menu → 🎬 Play Custom Scenario, as single player or hotseat.');
      if (nm?.trim()) {
        S.scen = nm.trim().slice(0, 40);
        const n = await slotScreen('save');
        if (n != null) await notify(save(n) ? `🎬 Scenario <b>${S.scen}</b> saved to ${n === 'auto' ? 'Autosave' : 'Slot ' + n}.` : 'Save failed — device storage may be full.');
      }
    }
    if (r === '📦 Rename resources') for (;;) {
      const keys = Object.keys(RES);
      const v = await ask('<h3>📦 Rename resources</h3><small>Tap one to rename it. Leave the name empty to restore the default.</small>', [...keys.map(k => RES[k].n), 'Done']);
      const k = keys.find(x => v === RES[x].n);
      if (!k) break;
      const n = await inputAsk(`Rename ${RES[k].n}`, RES[k].n, `Default: ${RES_DEF[k]}`);
      if (n != null) {
        S.resN ??= {};
        if (n.trim()) S.resN[k] = n.trim().slice(0, 24);else delete S.resN[k];
        applyResNames();
      }
    }
    if (r === '📅 Year') {
      const v = await numAsk('Year', S.year, -99999, 99999);
      if (v != null) S.year = v;
    }
    if (r === '☢ Armageddon') {
      const v = await numAsk('Armageddon counter', Math.floor(S.apoc), -100, 100);
      if (v != null) S.apoc = v;
    }
    if (r === '💰 My credits') {
      const v = await numAsk('Credits', Math.round(F[P].gold), -99999, 999999);
      if (v != null) F[P].gold = v;
    }
    if (r?.startsWith('👁')) {
      S.godSee = !S.godSee;
      refresh();
    }
    if (r?.startsWith('⏸')) break;
    if (r === '🚪 Exit God Mode') {
      S.god = false;
      S.godSee = false;
      break;
    }
  }
  updateGodTag();
  refresh();
  showInfo();
}
function updateGodTag() {
  $('godTag').style.display = S.god ? 'block' : 'none';
  let u = $('godUndo');
  if (!u) {
    u = document.createElement('button');
    u.id = 'godUndo';
    u.title = 'Undo last action (Ctrl+Z)';
    u.onclick = e => {
      e.stopPropagation();
      undoLast();
    };
    document.body.appendChild(u);
  }
  u.style.display = S.god ? 'block' : 'none';
  u.textContent = `↶ Undo${UNDO.length ? ` (${UNDO.length})` : ''}`;
  u.disabled = !UNDO.length;
  u.style.opacity = UNDO.length ? 1 : 0.45;
}
$('godTag').onclick = () => {
  if (!busy && !modalOpen()) godMenu();
};
// ---- PC controls: WASD/arrows pan, Q/E rotate, +/- zoom, Enter ends turn, Esc closes dialogs, 1-3 tabs ----
addEventListener('keydown', e => {
  if (e.target?.tagName === 'INPUT' || scr.style.display === 'flex' || $('curtain').style.display === 'flex') return;
  const k = e.key.toLowerCase(),
    modal = $('modal').style.display === 'flex';
  if (k === 'escape') {
    if (modal) {
      const b = $('mb')?.querySelector('.mbClose') || [...document.querySelectorAll('#mb button')].pop();
      b?.click();
    } else {
      selected = null;
      selU = null;
      showInfo();
    }
    return;
  }
  // PC: [ / ] or , / . step any cycler (popup or info panel); in popups 1–9 pick the matching action
  if (k === '[' || k === ']' || k === ',' || k === '.') {
    const back = k === '[' || k === ',';
    const b = modal ? document.querySelector(`#modalBody [data-cy="${back ? '◀' : '▶'}"]`) : document.querySelector(`#info [data-nav="${back ? -1 : 1}"]`);
    if (b) {
      b.click();
      e.preventDefault();
    }
    return;
  }
  if (modal && /^[1-9]$/.test(k)) {
    const b = $('mb')?.querySelectorAll('button')[+k - 1];
    if (b) {
      b.click();
      e.preventDefault();
    }
    return;
  }
  if (!modal && P >= 0 && k === 'tab') {
    e.preventDefault();
    if (!busy) nextArmy();
    return;
  }
  if (modal || P < 0) return;
  const st = camDist * 0.06,
    fx = Math.cos(camAng),
    fz = Math.sin(camAng);
  if (k === 'w' || k === 'arrowup') camGoal.add(tmpV.set(-fx * st, 0, -fz * st));else if (k === 's' || k === 'arrowdown') camGoal.add(tmpV.set(fx * st, 0, fz * st));else if (k === 'a' || k === 'arrowleft') camGoal.add(tmpV.set(-fz * st, 0, fx * st));else if (k === 'd' || k === 'arrowright') camGoal.add(tmpV.set(fz * st, 0, -fx * st));else if (k === 'q') camAng -= 0.08;else if (k === 'e') camAng += 0.08;else if (k === '+' || k === '=') camDist = clamp(camDist - 4, 7, 110);else if (k === '-') camDist = clamp(camDist + 4, 7, 110);else if (k === 'enter') $('endTurn').click();else if (k === '1') $('tPlanets').click();else if (k === '2') $('tArmies').click();else if (k === '3') $('tAgents').click();else return;
  e.preventDefault();
});
// ---- End-of-turn report (read via the ✉ envelope) ----
function turnReport(rep, g0, a0, n0) {
  const f = F[P],
    n = systems.filter(s => s.owner === P).length;
  const mine = rep.filter(m => m.includes(f.name) || systems.some(s => s.owner === P && m.includes(s.name)) || /💸|🔬|🔭|Bankrupt/.test(m) && !/Rumour|Word spreads/.test(m));
  const danger = rep.filter(m => !mine.includes(m) && /☢|👽|🌑|☄|Domiri|Voidspawn|SUCCESSION|💀|✠/.test(m));
  const rest = rep.filter(m => !mine.includes(m) && !danger.includes(m));
  const sec = (t, arr) => arr.length ? `<div class="rep-sec">${t}</div>${arr.map(m => `<div>${m}</div>`).join('')}` : '';
  const d = (v, inv) => `<i style="color:${v > 0 !== !!inv ? '#8f8' : v ? '#f88' : '#ccc'}">${v > 0 ? '+' : ''}${v}</i>`;
  const p = pending();
  return `<h3>✉ News — Year ${S.year}</h3>
    <div style="font-size:12px">💰 Credits ${Math.round(f.gold)} (${d(Math.round(f.gold - g0))}) · 🪐 Systems ${n} (${d(n - n0)}) · ☢ ${Math.floor(S.apoc)} (${d(Math.round((S.apoc - a0) * 10) / 10, true)})<br>
    <small>${p.filter(x => x.sys && x.type === 'fleet').length} fleets · ${p.filter(x => x.sys && x.type === 'agent').length} agents · ${p.filter(x => !x.sys).length} worlds await orders</small></div>
    <div class="scroll" style="max-height:30vh">${sec('🏰 Your Realm', mine)}${sec('⚠ Omens & Threats', danger)}${sec('🌌 The Galaxy', rest.slice(-30))}${rep.length ? '' : '<i>A quiet season among the stars.</i>'}</div>`;
}
// ---- Scientists in generals' retinues invent technology ----
async function scienceTick() {
  const gens = [...systems.filter(s => s.general && s.owner >= 0).map(s => [s.general, s.owner]), ...units.filter(u => u.general && u.owner >= 0).map(u => [u.general, u.owner])];
  for (const [g, o] of gens) {
    const mad = has(g, 'Mad Scientist'),
      sci = has(g, 'Scientist');
    if (!mad && !sci || g.dead || !F[o]?.alive || Math.random() > (mad ? 0.2 : 0.08)) continue;
    const pool = Object.keys(TECH_FINDS).filter(n => !F[o].tech.includes(n));
    if (!pool.length) continue;
    const n = rnd(pool);
    F[o].tech.push(n);
    if (n === 'Memory Codices') systems.filter(x => x.owner === o && x.general).forEach(x => x.general.skill++);
    if (mad) apoc(2, `${g.name}'s mad scientist meddles with forbidden science`);
    const boom = mad && Math.random() < 0.15;
    if (boom) {
      g.anc = g.anc.filter(a => a !== 'Mad Scientist');
      fx(g, ANC['Mad Scientist'].e, -1);
    }
    if (o === P) {
      hist(g, `sponsors the invention of ${n}.`);
      await notify(`<h3>🔬 Breakthrough!</h3>${portrait(g, 60)}${mad ? `In a laboratory crackling with forbidden energies, ${g.name}'s <b>mad scientist</b> cackles over a working prototype.` : `${g.name}'s court <b>scientist</b> has reverse-engineered an Old Empire relic.`}<br><br><b>Invented: ${n}</b> — ${GW[n].d}${boom ? '<br><br><i>Moments later the laboratory explodes. The mad scientist is no more.</i>' : ''}`);
    } else log(`🔬 Word spreads that ${F[o].name} has developed ${n}.`);
  }
}

// ================= Boot =================
addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});
const tmpV = new THREE.Vector3();
// ---- Living galaxy: ambient traffic along hyperlanes, driven by real game state ----
// Gold = foreign trade convoys (peaceful neighbours), faction colour = domestic shuttles,
// white = pilgrims from temple worlds, red = raiders and war couriers on hostile borders.
// Only lanes with at least one end in sight are shown, so fog of war is respected.
const TRAFFIC = [],
  trGeo = new THREE.ConeGeometry(0.13, 0.42, 4),
  trMats = new Map();
const trMat = col => {
  if (!trMats.has(col)) trMats.set(col, new THREE.MeshBasicMaterial({
    color: col,
    transparent: true,
    opacity: 0.9
  }));
  return trMats.get(col);
};
let trRoutes = [],
  trNext = 0,
  trLast = 0;
function trafficRoutes() {
  const R = [];
  if (P < 0) return R;
  const seenEnd = (a, b) => S.god && S.godSee || inSight(a) || inSight(b);
  for (const s of systems) for (const l of s.links) {
    if (l.i < s.i || !seenEnd(s, l)) continue;
    const A = s.owner,
      B = l.owner;
    if (A >= 0 && B >= 0 && !atWar(A, B) && !s.siege && !l.siege) {
      if (A !== B) R.push({
        a: s,
        b: l,
        col: 0xffd76a,
        w: 3,
        sp: 0.09
      });else R.push({
        a: s,
        b: l,
        col: F[A]?.color ?? 0xffffff,
        w: 1 + (s.b.has('Market') || l.b.has('Market') ? 1 : 0),
        sp: 0.12
      });
      if (s.b.has('Temple') || l.b.has('Temple')) R.push({
        a: s,
        b: l,
        col: 0xf4f0ff,
        w: 1,
        sp: 0.06
      });
    } else if ((A >= 0 || B >= 0) && atWar(A, B)) R.push({
      a: s,
      b: l,
      col: 0xff4040,
      w: s.siege || l.siege ? 2 : 0.6,
      sp: 0.18
    });
  }
  return R;
}
function pickRoute() {
  const tot = trRoutes.reduce((t, r) => t + r.w, 0);
  let x = Math.random() * tot;
  for (const r of trRoutes) if ((x -= r.w) <= 0) return r;
  return trRoutes[0];
}
function updateTraffic(t) {
  const dt = Math.min(0.1, (t - trLast) / 1000 || 0);
  trLast = t;
  if (t > trNext) {
    trRoutes = trafficRoutes();
    trNext = t + 2500;
  }
  const want = Math.min(GQ[SET.gq]?.tr ?? 80, Math.round(trRoutes.reduce((s, r) => s + r.w, 0) * 0.9));
  while (TRAFFIC.length < want) {
    const m = new THREE.Mesh(trGeo, trMat(0xffffff));
    m.visible = false;
    scene.add(m);
    TRAFFIC.push({
      m,
      r: null,
      p: 1,
      sp: 0.1,
      rev: false
    });
  }
  for (let i = 0; i < TRAFFIC.length; i++) {
    const c = TRAFFIC[i];
    if (i >= want || !trRoutes.length) {
      c.m.visible = false;
      c.r = null;
      continue;
    }
    if (!c.r || c.p >= 1 || !trRoutes.includes(c.r)) {
      c.r = pickRoute();
      c.p = c.r === null ? 1 : -Math.random() * 1.5;
      c.rev = Math.random() < 0.5;
      c.sp = c.r.sp * (0.7 + Math.random() * 0.6);
      c.m.material = trMat(c.r.col);
      c.off = (Math.random() - 0.5) * 0.8;
    }
    c.p += dt * c.sp;
    if (c.p < 0) {
      c.m.visible = false;
      continue;
    } // staggered departures
    const a = c.rev ? c.r.b.pos : c.r.a.pos,
      b = c.rev ? c.r.a.pos : c.r.b.pos;
    c.m.visible = true;
    c.m.position.lerpVectors(a, b, c.p);
    c.m.position.y += 0.6 + Math.sin(c.p * Math.PI) * 1.1;
    c.m.position.x += c.off;
    c.m.position.z += c.off * 0.5;
    tmpV.copy(b);
    tmpV.y = c.m.position.y;
    c.m.lookAt(tmpV);
    c.m.rotateX(Math.PI / 2);
  }
}
// ---- Character locator beacon: a pulsing gold pillar + rings over the world where a viewed character is ----
const beacon = new THREE.Group();
{
  const gm = new THREE.MeshBasicMaterial({
    color: 0xffd76a,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  for (let i = 0; i < 2; i++) {
    const r = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.35, 48), gm.clone());
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.1;
    beacon.add(r);
  }
  const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 9, 12, 1, true), new THREE.MeshBasicMaterial({
    color: 0xffd76a,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  }));
  pil.position.y = 4.5;
  beacon.add(pil);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), new THREE.MeshBasicMaterial({
    color: 0xffe9a0
  }));
  tip.rotation.x = Math.PI;
  tip.position.y = 10;
  beacon.add(tip);
  beacon.visible = false;
  beacon.renderOrder = 10;
  scene.add(beacon);
}
let beaconUntil = 0;
function showBeacon(s) {
  if (!s?.pos) {
    beacon.visible = false;
    return;
  }
  beacon.position.set(s.pos.x, s.pos.y || 0, s.pos.z);
  beacon.visible = true;
  beaconUntil = performance.now() + 9000;
}
function updateBeacon(t) {
  if (!beacon.visible) return;
  if (t > beaconUntil) {
    beacon.visible = false;
    return;
  }
  beacon.children.slice(0, 2).forEach((r, i) => {
    const k = (t / 1100 + i * 0.5) % 1;
    r.scale.setScalar(0.6 + k * 2.4);
    r.material.opacity = 0.9 * (1 - k);
  });
  beacon.children[3].position.y = 10 + Math.sin(t / 220) * 0.5;
  beacon.children[3].rotation.y = t / 400;
}
// ---- Desktop: click-and-drag to scroll any scrollable menu or panel (like touch) ----
document.body.classList.toggle('desk', matchMedia('(pointer: fine)').matches);
{
  let drag = null,
    eat = false;
  const scroller = el => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      if (n.tagName === 'CANVAS' || n.id === 'fsStrip') return null; // the house picker has its own drag
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2 || /(auto|scroll)/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 2) return n;
    }
    return null;
  };
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('input,textarea,select,[contenteditable]')) return;
    const s = scroller(e.target);
    if (s) drag = {
      s,
      x: e.clientX,
      y: e.clientY,
      sl: s.scrollLeft,
      st: s.scrollTop,
      moved: false
    };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    drag.moved = true;
    document.body.classList.add('dragScroll');
    drag.s.scrollLeft = drag.sl - dx;
    drag.s.scrollTop = drag.st - dy;
  }, true);
  const end = () => {
    if (drag?.moved) {
      eat = true;
      setTimeout(() => eat = false, 0);
    }
    drag = null;
    document.body.classList.remove('dragScroll');
  };
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);
  document.addEventListener('click', e => {
    if (eat) {
      e.stopPropagation();
      e.preventDefault();
      eat = false;
    }
  }, true);
}
// PC: drag panels by their title (or top edge) to move them; panels are always kept on screen
{
  const PANELS = '#modalBody, #info, #simOv';
  const off = new WeakMap();
  let mv = null,
    eatClick = false;
  const apply = (el, x, y) => {
    el.style.translate = '0 0';
    const r = el.getBoundingClientRect(),
      m = 8;
    x = clamp(x, m - r.left, innerWidth - m - r.right); // keep fully visible
    y = clamp(y, m - r.top, innerHeight - m - Math.min(r.bottom, r.top + 60));
    if (r.height > innerHeight - 2 * m) y = m - r.top;
    off.set(el, [x, y]);
    el.style.translate = `${x}px ${y}px`;
  };
  const keep = el => {
    const o = off.get(el) || [0, 0];
    apply(el, o[0], o[1]);
  };
  window.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !document.body.classList.contains('desk')) return;
    const el = e.target.closest(PANELS);
    if (!el || e.target.closest('button,a,input,textarea,select,[data-c],.cycbar')) return;
    const r = el.getBoundingClientRect();
    if (!(e.target.closest('h3') || e.clientY - r.top < 22)) return;
    e.stopPropagation();
    e.preventDefault();
    const o = off.get(el) || [0, 0];
    mv = {
      el,
      x: e.clientX - o[0],
      y: e.clientY - o[1],
      moved: false
    };
  }, true);
  window.addEventListener('pointermove', e => {
    if (!mv) return;
    mv.moved = true;
    apply(mv.el, e.clientX - mv.x, e.clientY - mv.y);
  }, true);
  window.addEventListener('pointerup', () => {
    if (mv?.moved) {
      eatClick = true;
      setTimeout(() => eatClick = false, 0);
    }
    mv = null;
  }, true);
  window.addEventListener('click', e => {
    if (eatClick) {
      e.stopPropagation();
      e.preventDefault();
      eatClick = false;
    }
  }, true);
  // Re-fit after content changes or window resizes, so nothing hides off screen
  const fit = () => {
    if (document.body.classList.contains('desk')) document.querySelectorAll(PANELS).forEach(el => {
      if (el.offsetParent) keep(el);
    });
  };
  addEventListener('resize', fit);
  const mo = new MutationObserver(() => requestAnimationFrame(fit));
  document.querySelectorAll(PANELS).forEach(el => mo.observe(el, {
    childList: true
  }));
  // PC: the info panel gets a ✕ that clears the selection (it reopens on the next pick)
  const info = $('info');
  const addX = () => {
    if (!document.body.classList.contains('desk') || info.querySelector(':scope > .infoX')) return;
    const b = document.createElement('button');
    b.className = 'infoX';
    b.textContent = '✕';
    b.title = 'Close';
    b.onclick = e => {
      e.stopPropagation();
      selected = null;
      selU = null;
      info.style.display = 'none';
      try {
        showInfo();
      } catch (er) {}
    };
    info.prepend(b);
  };
  new MutationObserver(addX).observe(info, {
    childList: true
  });
  addX();
}
let frameErr = 0;
renderer.setAnimationLoop(t => {
  try {
    frame(t);
  } catch (e) {
    if (frameErr++ < 3) console.error('frame', e);
  }
  try {
    renderer.render(scene, camera);
  } catch (e) {
    if (frameErr++ < 3) console.error('render', e);
    enterSafeGfx('render error');
  }
});
function frame(t) {
  try {
    updateTraffic(t);
    updateBeacon(t);
  } catch (e) {
    if (frameErr++ < 3) console.error(e);
  }
  camTarget.lerp(camGoal, 0.15);
  camera.position.set(camTarget.x + Math.cos(camAng) * camDist, camDist * 0.8, camTarget.z + Math.sin(camAng) * camDist);
  camera.lookAt(camTarget);
  const byS = new Map();
  units.forEach(u => {
    if (!u?.mesh || !u.sys?.pos) return;
    const k = byS.get(u.sys) || 0;
    byS.set(u.sys, k + 1);
    const a = k * 1.1 + 0.6 + t * 0.00012 + u.id; // fleets drift in slow orbits around their world
    tmpV.set(u.sys.pos.x + Math.cos(a) * 2.3, u.sys.pos.y + 1.2, u.sys.pos.z + Math.sin(a) * 2.3);
    if (u.type === 'fleet') {
      // Face the direction of travel; in orbit, face along the orbit
      const dx = tmpV.x - u.mesh.position.x,
        dz = tmpV.z - u.mesh.position.z;
      const yaw = dx * dx + dz * dz > 0.09 ? Math.atan2(-dz, dx) : -(a + Math.PI / 2);
      u.mesh.rotation.set(0, yaw, -Math.PI / 2);
      const n = ships(u);
      u.escorts?.forEach((m, i) => {
        m.visible = n >= [3, 6, 10, 15][i];
      });
    }
    u.mesh.position.lerp(tmpV, 0.045); // slow, weighty travel along the lanes
    u.mesh.scale.setScalar((u === selU ? 1.3 + Math.sin(t * 0.008) * 0.15 : 1) * (u.type === 'fleet' ? 0.85 + Math.min(u.fleet, 20) * 0.02 : 1));
  });
  systems.forEach(s => {
    if (!s?.mesh || !s.lbl) return;
    s.ring.rotation.z = t * 0.0005;
    if (s.mesh.visible) s.mesh.rotation.y = t * 0.00008 + s.i;
    if (s.stnMesh?.visible) {
      const a2 = t * 0.0004 + s.i * 1.7,
        rr = 1.75 * s.mesh.scale.x;
      s.stnMesh.position.set(s.pos.x + Math.cos(a2) * rr, s.pos.y + 0.35, s.pos.z + Math.sin(a2) * rr);
      s.stnMesh.rotation.y = -a2;
    }
    tmpV.copy(s.pos).project(camera);
    const vis = tmpV.z < 1 && camDist < 95 && !s.lbl.dataset.fog;
    s.lbl.style.display = vis ? 'block' : 'none';
    if (vis) s.lbl.style.left = (tmpV.x + 1) / 2 * innerWidth + 'px', s.lbl.style.top = (1 - tmpV.y) / 2 * innerHeight + 'px';
  });
}
// Keep the canvas matched to the window even if a resize event was missed (e.g. fullscreen on PC)
setInterval(() => {
  const c = renderer.domElement;
  // Never let the map layer drift (scrolled containers left it half off-screen on some PCs)
  [$('game-container'), document.body, document.documentElement, $('ui')].forEach(el => {
    if (el && (el.scrollLeft || el.scrollTop)) {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    }
  });
  if (!GFX_SAFE && renderer.info.programs?.some(p => p.diagnostics && p.diagnostics.runnable === false)) enterSafeGfx('shader failed');
  if (c.clientWidth !== innerWidth || c.clientHeight !== innerHeight) {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
}, 500);
(async () => {
  // ---- Loading sequence ----
  const L = window.SBLoader || {
    set() {},
    done() {}
  };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const stages = ['Charting hyperlanes…', 'Awakening dynasties…', 'Forging Starblades…', 'Counting the Bloodbank’s ledgers…', 'Listening to the Nameless…', 'Calibrating sensors…'];
  const bg = new Promise(r => {
    const im = new Image();
    im.onload = im.onerror = r;
    im.src = 'assets/nebula-void.webp';
  });
  for (let i = 0; i < stages.length; i++) {
    L.set((i + 1) / (stages.length + 1), stages[i]);
    await wait(380);
  }
  await Promise.race([Promise.all([bg, document.fonts?.ready]), wait(2500)]);
  L.set(1, 'The stars await.');
  await wait(300);
  L.done();
  const autoSlot = sessionStorage.getItem('sb_load');
  sessionStorage.removeItem('sb_load');
  const doLoad = n => {
    try {
      load(n);
      updateGodTag();
      selected = F[P].capital || systems.find(s => s.owner === P);
      if (selected) camGoal.set(selected.pos.x, 0, selected.pos.z);
      refresh();
      showInfo();
      return true;
    } catch (e) {
      console.error(e);
      notify('That save could not be read.');
      return false;
    }
  };
  if (autoSlot === 'undo') {
    const ok = doLoad('undo');
    sessionStorage.removeItem('sb_undo_cur');
    try {
      const c = JSON.parse(sessionStorage.getItem('sb_undo_cam') || 'null');
      if (c) {
        camGoal.set(c.x, 0, c.z);
        camDist = c.d;
        camAng = c.a;
      }
    } catch (e) {}
    sessionStorage.removeItem('sb_undo_cam');
    if (ok) {
      S.god = true;
      updateGodTag();
      log('↶ Undone.');
      return;
    }
  }
  if (autoSlot && autoSlot !== 'undo' && doLoad(autoSlot === 'auto' ? 'auto' : +autoSlot)) return;
  let seats = null,
    scenario = false;
  for (;;) {
    const r = await titleMenu();
    if (r.load != null) {
      if (doLoad(r.load)) return;
      setTimeout(() => location.reload(), 1500);
      return;
    }
    if (r.m === 'load') {
      const n = await slotScreen('load');
      if (n != null) {
        if (doLoad(n)) return;
        setTimeout(() => location.reload(), 1500);
        return;
      }
      continue;
    }
    if (r.m === 'help') {
      await showManual(ask, HELP);
      continue;
    }
    if (r.m === 'settings') {
      await settingsMenu();
      continue;
    }
    if (r.m === 'quit') {
      if ((await ask('<h3>Quit to Desktop?</h3>', ['Quit', 'Cancel'])) === 'Quit') {
        quitDesktop();
        return;
      }
      continue;
    }
    if (r.m === 'lore') {
      await notify(`<h3>The Chronicle</h3><div class="scroll"><i>${INTRO}</i><hr>${factionLoreHTML()}</div>`);
      continue;
    }
    if (r.m === 'playscen') {
      const n = await slotScreen('load');
      if (n == null) continue;
      if (!doLoad(n)) {
        setTimeout(() => location.reload(), 1500);
        return;
      }
      // Turn the editor save into a fresh game: God Mode off, fog and per-player state reset
      const mode = await ask(`<h3>🎬 ${S.scen || 'Custom Scenario'}</h3>How will you play it?`, ['👤 Single Player', '👥 Hotseat Multiplayer']);
      let ss = null;
      for (;;) {
        ss = mode === '👥 Hotseat Multiplayer' ? await mpSetup() : await factionSelect().then(p => p == null ? null : [p]);
        if (!ss) {
          location.reload();
          return;
        }
        const dead = ss.filter(i => !F[i]?.alive || !systems.some(s => s.owner === i));
        if (!dead.length) break;
        await notify(`${dead.map(i => F[i].name).join(', ')} hold no worlds in this scenario. Choose again.`);
      }
      S.god = false;
      S.godSee = false;
      S.pp = {};
      S.humans = ss;
      setP(ss[0]);
      restoreP(P);
      updateGodTag();
      selected = F[P].capital || systems.find(s => s.owner === P);
      selU = null;
      if (selected) camGoal.set(selected.pos.x, 0, selected.pos.z);
      log(`🎬 Scenario "${S.scen || 'Custom'}" begins: ${ss.map(i => F[i].name).join(', ')}.`);
      refresh();
      showInfo();
      if (ss.length > 1) await handoff(P);
      return;
    }
    if (r.m === 'mp') {
      seats = await mpSetup();
      if (!seats) continue;
    }
    if (r.m === 'scenario') scenario = true;
    break;
  }
  // Campaign seed: the same seed always builds the same galaxy, houses and dynasties
  {
    let seed = new URLSearchParams(location.search).get('seed');
    if (!seed) {
      const c = await ask('<h3>🎲 Campaign Seed</h3>Use a seed to replay or share an exact galaxy: the same worlds, hyperlanes, houses and dynasties.', ['🎲 Random Galaxy', '🔢 Enter a Seed']);
      if (c === '🔢 Enter a Seed') seed = ((await inputAsk('Seed (any word or number)', '', 'e.g. 1234 or dune')) || '').trim();
    }
    if (!seed) seed = String(Math.floor(Math.random() * 1e9));
    S.seed = seed;
    seedRng(seed);
  }
  initWorld();
  log(`🎲 Campaign seed: <b>${S.seed}</b>`);
  refresh();
  if (seats) {
    S.humans = seats;
    seats.forEach(i => {
      F[i].gold += START_BONUS;
    });
    setP(seats[0]);
    log(`👥 Hotseat campaign: ${seats.map(i => F[i].name).join(', ')}.`);
    await handoff(P);
    await tutorial();
    return;
  }
  const pick = await factionSelect();
  if (pick == null) {
    location.reload();
    return;
  }
  setP(pick);
  S.humans = [P];
  F[P].gold += START_BONUS;
  selected = F[P].capital;
  refresh();
  showInfo();
  log(`You lead ${F[P].name}. Two turns make a year. Watch the ☢ Apocalypse Counter.`);
  if (!scenario) await tutorial();
  if (scenario) {
    S.godSee = true;
    await notify('<h3>🛠 Scenario Maker</h3>The galaxy is yours to shape. Tap any system, fleet or character and press <b>🛠 Edit</b>. Tap the purple <b>GOD MODE</b> tag for factions and global settings. Save your scenario via ☰ Menu → Save Game, then exit God Mode to play it.');
    await godMenu();
  }
})();