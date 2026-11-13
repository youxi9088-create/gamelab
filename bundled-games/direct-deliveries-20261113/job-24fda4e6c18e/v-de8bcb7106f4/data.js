// Pure data tables (no logic, no state), split out of main.js.
// Stage 1: agent role tables. Stage 2: titles, epithets, blades, mercenaries, holy areas, building limits.
export const ROLE_LINES = { Spy: ['*static* Listening.', 'Already in their comms.'], Assassin: ['Name the target.', 'Quietly.'], Diplomat: ['Words are cheaper than wars.', 'Let me talk to them.'], Trader: ['Spice, starglass, anything — for a price.'], Priest: ['The faithful await.'], Master: ['The Nameless watch.'], Princess: ['Shall I charm them?'], Witch: ['The Old Gods whisper...'], Zithari: ['Blood calls to blood.'] };
export const AGT = { Diplomat: ['Silver Tongue', 'Forged Credentials'], Trader: ['Silver Tongue', 'Bloodbank Accountant'], Spy: ['Shadow', 'Slicer AI'], Assassin: ['Shadow', 'Vibroblade'], Priest: ['Pious', 'Codex Fragment'], Master: ['Pious', 'Codex Fragment'], Zithari: ['Bloodthirsty', 'Old Gods Fetish'], Witch: ['Shadow', 'Old Gods Fetish'], Princess: ['Silver Tongue', null] };
export const RNAME = { Diplomat: 'Diplomat', Spy: 'Probe AI', Assassin: 'Bounty Hunter', Priest: 'Nameless Monk', Zithari: 'Zithari', Master: 'Nameless Master', Acolyte: 'Dark Acolyte', Witch: 'Witch', Trader: 'Trader', Princess: 'Princess' };
export const ROLE = { Diplomat: 0xffffff, Spy: 0xb070ff, Assassin: 0xff3040, Priest: 0xffd040, Princess: 0xff80c0, Trader: 0x40e0a0, Zithari: 0xb00010, Master: 0xfff6d0, Acolyte: 0x602080, Witch: 0xc040ff };
export const AICON = { Diplomat: '🕊', Spy: '🛰', Assassin: '🗡', Priest: '✝', Princess: '👸', Trader: '💰', Zithari: '☯', Master: '⚜', Acolyte: '🕯', Witch: '🔮' };

export const RTITLE = { 0: 'Grandmaster', 1: 'Lord Commander', 2: 'Dread Lord', 3: 'Spice Baron', 4: 'Navigator-Prime', 5: 'Chairman', 6: 'Prime Template', 7: 'Chain-Lord', 8: 'Chancellor', 9: 'First Mind', 10: 'First Liberator', 11: 'High Chieftain', 12: 'Dominar', 13: 'Witch-Queen', 14: 'High King', 15: 'Dark Lord', 16: 'Warden-Marshal', 17: 'Pirate Admiral', 18: 'Wraith-Admiral', 19: 'Warlord', 20: 'Pirate King' };
// Gendered royal titles per house: r ruler, h heir, p prince(ss) of the blood, c consort — each [male, female]
export const ROYAL_DEF = { r: ['King', 'Queen'], h: ['Crown Prince', 'Crown Princess'], p: ['Prince', 'Princess'], c: ['Prince-Consort', 'Queen'] };
export const ROYAL = {
  0: { r: ['Grandmaster', 'Grandmistress'], h: ['Sworn Initiate', 'Sworn Initiate'], p: ['Initiate', 'Initiate'] },
  1: { r: ['Lord Commander', 'Lady Commander'], h: ['Lord-Successor', 'Lady-Successor'], p: ['Sworn Brother', 'Sworn Sister'], c: ['Rim-Consort', 'Lady of the Rim'] },
  2: { r: ['Dread Lord', 'Dread Lady'], h: ['Blood-Heir', 'Blood-Heiress'], p: ['Corsair Prince', 'Corsair Princess'], c: ['Dread Consort', 'Dread Consort'] },
  3: { r: ['Spice Baron', 'Spice Baroness'], h: ['Spice-Heir', 'Spice-Heiress'], p: ['Scion of the Sands', 'Scion of the Sands'], c: ['Baron-Consort', 'Baroness'] },
  4: { r: ['Navigator-Prime', 'Navigator-Prime'], h: ['Navigator-Elect', 'Navigator-Elect'], p: ['Pilot-Scion', 'Pilot-Scion'], c: ['Star-Consort', 'Star-Consort'] },
  5: { r: ['Chairman', 'Chairwoman'], h: ['Vice-Chairman', 'Vice-Chairwoman'], p: ['Director', 'Directress'], c: ['Consort of the Board', 'First Lady of the Board'] },
  6: { r: ['Prime Template', 'Prime Template'], h: ['Second Template', 'Second Template'], p: ['Gene-Scion', 'Gene-Scion'], c: ['Gene-Consort', 'Gene-Consort'] },
  7: { r: ['Chain-Lord', 'Chain-Lady'], h: ['Chain-Heir', 'Chain-Heiress'], p: ['Whip-Prince', 'Whip-Princess'], c: ['Chain-Consort', 'Chain-Mistress'] },
  8: { r: ['Chancellor', 'Chancellor'], h: ['Vice-Chancellor', 'Vice-Chancellor'], p: ['Senator-Scion', 'Senator-Scion'], c: ['First Gentleman', 'First Lady'] },
  9: { r: ['First Mind', 'First Mind'], h: ['Second Mind', 'Second Mind'], p: ['Sub-Mind', 'Sub-Mind'], c: ['Linked Consort', 'Linked Consort'] },
  10: { r: ['First Liberator', 'First Liberator'], h: ['Heir of the Unchained', 'Heiress of the Unchained'], p: ['Freeborn Prince', 'Freeborn Princess'], c: ['Liberator-Consort', 'Liberator-Consort'] },
  11: { r: ['High Chieftain', 'High Chieftess'], h: ['Ember-Heir', 'Ember-Heiress'], p: ['Thane', 'Shieldmaiden'], c: ['Hearth-Father', 'Hearth-Mother'] },
  12: { r: ['Dominar', 'Dominara'], h: ['Tsarevich', 'Tsarevna'], p: ['Knyaz', 'Knyaginya'], c: ['Consort-Dominar', 'Tsaritsa'] },
  13: { r: ['Witch-King', 'Witch-Queen'], h: ['First Brother', 'First Sister'], p: ['Brother of the Coven', 'Sister of the Coven'], c: ['Coven-Consort', 'Coven-Consort'] },
  14: { r: ['High King', 'High Queen'] },
  15: { r: ['Dark Lord', 'Dark Lady'], h: ['Chosen Apprentice', 'Chosen Apprentice'], p: ['Shadow-Prince', 'Shadow-Princess'], c: ['Shadow-Consort', 'Dark Consort'] },
  16: { r: ['Warden-Marshal', 'Warden-Marshal'], h: ['Sworn Initiate', 'Sworn Initiate'], p: ['Gray Initiate', 'Gray Initiate'] },
  17: { r: ['Pirate Admiral', 'Pirate Admiral'], h: ['First Mate', 'First Mate'], p: ['Corsair', 'Corsair'], c: ["Admiral's Consort", "Admiral's Consort"] },
  18: { r: ['Wraith-Admiral', 'Wraith-Admiral'], h: ['Domiri Lord', 'Domiri Lord'], p: ['Domiri Lord', 'Domiri Lord'] },
  19: { r: ['Warlord', 'Warqueen'], h: ['Warlord-Heir', 'Warlord-Heiress'], p: ['Blood-Son', 'Blood-Daughter'], c: ["Warqueen's Mate", "Warlord's Bride"] },
  20: { r: ['Pirate King', 'Pirate Queen'], h: ['Pirate Prince', 'Pirate Princess'], c: ['Pirate Consort', 'Pirate Queen'] },
};
export const HTITLE = { 2: 'Blood-Heir', 13: 'First Sister', 3: 'Spice-Heir', 12: 'Tsarevich' };
export const MERC_SELLERS = { 6: ['cloneTroopers', 'cloneCommandos'], 9: ['droidLegion', 'droidStarfighters'] };
export const NM_FOES = [2, 15, 17, 18, 19, 20];
export const EPI = ['of the Silent Star', 'of the Hollow Moon', 'of the Ninth Gate', 'of Ash and Light', 'of the Pale Road', 'of the Last Lantern', 'of the Still Void', 'of the Broken Hilt', 'of the White Flame', 'of the Unspoken Name', 'of the Drowned Sun', 'of the Iron Psalm', 'of the Quiet Blade', 'of the Long Night'];
export const BLADE = { Fallen: ['#ff2020', 'Crimson — the Dark Path'], Redeemed: ['#ffffff', 'White — redeemed from the Dark'], gray: ['#b8c0cc', 'Silver — the Gray balance'], witch: ['#c060ff', 'Violet — the Coven'], Pious: ['#ffd040', 'Gold — devotion'], Cruel: ['#ff6a20', 'Ember — cruelty'], Just: ['#40a0ff', 'Blue — justice'], Brave: ['#40e070', 'Green — courage'], Brilliant: ['#40e0e0', 'Cyan — wisdom'], dread: ['#a01010', 'Blood — dread'], none: ['#7fe0ff', 'Pale blue — untested'] };
export const RES_IMG = { fuel: 'voidfuel', bacta: 'mendgel', kyber: 'starglass', tibanna: 'aether-gas', spice: 'spice', food: 'food', ore: 'ore', plasma: 'plasma' };
export const HOLY_AREAS = [[[-4, -18], [8, -14], [-14, -10]], [[-28, 12], [-20, 30], [-36, 6]], [[0, 6], [6, 0], [-6, 10]], [[16, -6], [12, 12], [22, -16]], [[-12, 32], [-30, 30], [-18, 18]]];
export const BSIZE = [0, 0, 60, 110, 170]; // settlement size (income) needed for each level
export const BTIME = [0, 0, 1, 2, 3]; // turns to raise each level
// Stage 4: planet looks, native-unit planet fits, holy sites, building chains
export const PLOOK = {
  'Garden World': { c: ['#1d4f8f', '#3f8a46', '#6aa84f', '#a89a70'], atm: 0x7fc8ff, sz: 1, caps: true, sea: 0.45 },
  'Desert World': { c: ['#9a6a34', '#c99a55', '#e2c27a', '#f2deaa'], atm: 0xffc890, sz: 0.95, dunes: true },
  'Ocean World': { c: ['#0e2f6a', '#1d55a8', '#2f7ccc', '#6fae6a'], atm: 0x60b0ff, sz: 1.05, caps: true, sea: 0.78 },
  'Jungle World': { c: ['#1a4f7a', '#1c5a26', '#2f7a32', '#4f9a3a'], atm: 0x90ffb0, sz: 1, sea: 0.25 },
  'Ice World': { c: ['#7fa6c8', '#b8d8ef', '#e4f2fb', '#ffffff'], atm: 0xd0f0ff, sz: 0.9 },
  'Volcanic World': { c: ['#120a08', '#2a1a16', '#3e2a22', '#5a3a2c'], atm: 0xff6030, sz: 0.9, lava: true },
  'Gas Giant': { c: ['#9a6e4c', '#c8a078', '#e6cfa8', '#f6ead2'], atm: 0xffe0b0, sz: 1.45, bands: true, rings: true },
  'Ecumenopolis': { c: ['#2a303c', '#3c4454', '#566070', '#7a8494'], atm: 0xa0c0ff, sz: 1, city: true },
  'Crystal World': { c: ['#3a4a66', '#5aa8c8', '#8ae8f8', '#e8ffff'], atm: 0x90ffff, sz: 0.95, shards: true },
};
export const SPEC_FIT = {
  wyrmRiders: ['Desert World'], duneStalkers: ['Desert World'],
  kashariBerserkers: ['Jungle World', 'Garden World'], marshShields: ['Ocean World', 'Jungle World'],
  siegeWalkers: ['Ecumenopolis', 'Volcanic World', 'Ice World'], plasmaArtillery: ['Volcanic World', 'Crystal World', 'Ecumenopolis'],
  abyssalCruiser: ['Ocean World', 'Gas Giant'], voidWasps: ['Jungle World', 'Gas Giant'],
  ionLancers: ['Crystal World', 'Ice World', 'Gas Giant'], ghostRunners: ['Ice World', 'Crystal World', 'Ecumenopolis'],
};
export const HOLY = [
  ['Cradle of the Oath', 'Order', 'Where the first Nameless swore their oath without names. The holiest world of the Order.'],
  ["The Serpent's Well", 'Zithari', 'Where Zithari first spoke from the deep. Every Dark pilgrim dreams of drinking from it.'],
  ['Old Throneworld', 'both', 'The ancient seat of the Old Empire. Whoever holds it claims the mantle of the emperors — both faiths covet it.'],
  ['Antiochar', 'Order', 'A fortress-shrine on the old pilgrim lanes, where the Nameless held the line in the Second Empire War.'],
  ['The Ember Gate', 'Zithari', "A dying sun where the Dark Path's first martyrs burned. Its fire still whispers."],
];
export const BCHAIN = {
  Barracks: { ic: '🛡', c: 150, lv: ['Muster Yard', 'Garrison Keep', 'Legion Citadel', 'Iron Bastion'], d: ['Recruit legions · +10 defence', 'Household Knights (elite) · +20 defence', '+1 legion per levy · +30 defence · trains siege engineers', '+1 free legion a year · +40 defence'] },
  Shipyard: { ic: '🚀', c: 200, lv: ['Dry Dock', 'Orbital Yard', 'Star Forge', 'Imperial Arsenal'], d: ['Build ships', 'Ships −10%', 'Ships −20% · +1 picket ship a year', 'Ships −30% · +3 ships per order'] },
  Temple: { ic: '⛪', c: 200, lv: ['Wayside Shrine', 'Chapel', 'Cathedral', 'Grand Basilica'], d: ['+2 order · slow conversion', '+3 order · faster conversion', '+4 order · governors grow pious', '+5 order · ☢ −0.5 a year'] },
  Market: { ic: '💰', c: 250, lv: ['Bazaar', 'Trade Hall', 'Merchant Guildhouse', 'Grand Exchange'], d: ['+30% taxes', '+45% taxes · +10% trade', '+60% taxes · +20% trade · attracts a Master of Coin', '+75% taxes · +30% trade'] },
  Brothel: { ic: '💗', c: 150, lv: ['Pleasure House', 'Velvet Den', 'Pleasure Palace'], d: ['+1 order · +20 income', '+2 order · +40 income', '+3 order · +60 income'] },
  Hospice: { ic: '⚕', c: 180, lv: ['Med-Bay', 'Mendgel Ward', 'Hospice of the Grey', 'Grand Infirmary'], d: ['Grey Rot: −15% deaths & troop losses · slower spread', '−30% deaths · halves the plague order penalty', '−45% deaths · outbreaks burn out sooner', '−60% deaths · +1 order'] },
  Mine: { ic: '⛏', c: 300, lv: ['Mine', 'Deep Mine', 'Core Drill'], d: ['+60 income', '+120 income', '+180 income'] },
};
// Stage 3: Forgotten Fleet omens (Apocalypse threshold → messages)
export const FF_OMENS = [
  [45, ['👻 Freighter crews on the outer rim swear they saw a black ship pass with no running lights.', '👻 A dead beacon in the eastern dark begins broadcasting a coronation hymn a thousand years old.', '👻 Pilgrims report that the stars beyond the rim flicker, as if something vast moves before them.']],
  [55, ['🌌 Nightfleet rangers report hulks drifting in formation beyond the outer rim. Their reactors are warm.', '🌌 A Nightfleet patrol vanishes. Its last message: "Iron masks. Seven of them."', '🌌 The Nightfleet sends courier-skiffs to every court: "The old armada stirs. Send men."']],
  [65, ['🌑 Black wedge-ships light their engines, one by one, in the eastern dark.', '🌑 Seers across the galaxy dream of seven crowned shadows walking out of the void.', '🌑 Every Nightfleet beacon on the rim burns red at once.']],
];
